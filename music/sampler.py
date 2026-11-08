# A small orchestral sampler and a concert hall, for rendering the opening's music from real instrument recordings
# (VSCO 2 Community Edition, CC0). Every note is a recorded note: chosen by pitch, by dynamic layer and round-robin, retuned by
# at most a couple of semitones, shaped by the player's dynamics (the dynamic layers cross-faded as a bow or a breath swells),
# joined legato where a line is slurred, and placed on a stage in a hall (direct sound, early reflections, a frequency-dependent tail).
import os, re, json, math, random
from fractions import Fraction
import numpy as np, soundfile as sf
from scipy.signal import resample_poly, fftconvolve, butter, sosfilt

SR = 44100
LIB = None
LIBDIR = None
_cache = {}
_shift_cache = {}

def setup(libdir, libjson):
    global LIB, LIBDIR
    LIBDIR = libdir; LIB = json.load(open(libjson))

LAYER_NAMES = {'ppp': 0, 'pp': 1, 'p': 2, 'mp': 3, 'mf': 4, 'f': 5, 'ff': 6, 'fff': 7}

def _layer_id(fn):
    m = re.search(r'_v(\d)(?=_|\.wav)', fn)
    if m: return int(m.group(1))
    m = re.search(r'_(ppp|pp|p|mp|mf|f|ff|fff)(?=_|\.wav)', fn)
    if m: return LAYER_NAMES[m.group(1)]
    return 0

def _rr_id(fn):
    m = re.search(r'_(?:rr|RR)(\d)', fn)
    if m: return int(m.group(1))
    m = re.search(r'_v\d_(\d)\.wav$', fn)
    if m: return int(m.group(1))
    return 1

class Art:
    """one articulation of one instrument: the samples of a folder, with their measured pitch and loudness"""
    def __init__(self, folder, offset=12, pitch=None, only=None, exclude=None):
        rows = LIB[folder]['rows']; self.folder = folder; self.S = []
        for r in rows:
            fn = r['f']
            if only and not re.search(only, fn): continue
            if exclude and re.search(exclude, fn): continue
            if pitch is not None: m = pitch(fn, r)
            elif r['nom'] is not None: m = r['nom'] + offset
            else: m = None
            self.S.append({'path': os.path.join(LIBDIR, folder, fn), 'f': fn, 'midi': m, 'layer': _layer_id(fn), 'rr': _rr_id(fn), 'rms': r['rms'], 'on': r['on'], 'dur': r['dur']})
        pitches = sorted(set(round(s['midi'], 2) for s in self.S if s['midi'] is not None))
        self.pitches = pitches
        # the dynamic layers of each pitch, softest first (by measured loudness, whatever the files call them)
        self.layers = {}
        for p in (pitches or [None]):
            ss = [s for s in self.S if (s['midi'] is None and p is None) or (s['midi'] is not None and p is not None and abs(s['midi'] - p) < 0.01)]
            ids = sorted(set(s['layer'] for s in ss), key=lambda L: np.mean([s['rms'] for s in ss if s['layer'] == L]))
            self.layers[p] = [[s for s in ss if s['layer'] == L] for L in ids]
        allr = [s['rms'] for s in self.S]; self.rms_ref = float(np.median(allr)) if allr else 1.0
        self.rr_count = {}

    def nearest(self, m):
        if not self.pitches: return None, 0.0
        best = min(self.pitches, key=lambda p: (abs(m - p), -(m - p)))  # the nearest; on a tie, retune downwards (an upward shift brightens)
        return best, m - best

    def pick(self, p, li, rr_key):
        group = self.layers[p][li]
        k = self.rr_count.get((p, li, rr_key), 0); self.rr_count[(p, li, rr_key)] = k + 1
        return group[k % len(group)]

def load(path, on):
    key = (path, on)
    if key not in _cache:
        x, sr = sf.read(path, dtype='float32', always_2d=True)
        assert sr == SR, (path, sr)
        if x.shape[1] == 1: x = np.repeat(x, 2, axis=1)
        a = max(0, int((on - 0.002) * SR)); x = x[a:].copy()
        fi = min(len(x), int(0.002 * SR)); x[:fi] *= np.linspace(0, 1, fi)[:, None]
        _cache[key] = x
    return _cache[key]

def shifted(path, on, semis):
    s = round(semis, 3)
    key = (path, on, s)
    if key in _shift_cache: return _shift_cache[key]
    x = load(path, on)
    if abs(s) < 0.004: y = x
    else:
        fr = Fraction(1.0 / (2 ** (s / 12))).limit_denominator(240)
        y = resample_poly(x, fr.numerator, fr.denominator, axis=0).astype(np.float32)
    _shift_cache[key] = y
    return y

_att = {}
def attack_time(x):
    """how long the recorded note takes to reach its full sound (a bow or a breath swells into the note): the first time the 20 ms level
    reaches 70 % of the level that follows"""
    key = id(x)
    if key in _att: return _att[key]
    m = x.mean(1); w = int(0.02 * SR); n = min(len(m) // w, 60)
    e = np.sqrt(np.mean(m[:n * w].reshape(n, w) ** 2, 1)); ref = np.median(e[15:50]) if n > 20 else e.max()
    i = int(np.argmax(e >= 0.7 * ref)); _att[key] = min(0.4, i * 0.02); return _att[key]

def extend(x, n, xf=0.25):
    """a recorded sustain made longer than it was played: a middle stretch repeated with equal-power cross-fades"""
    if len(x) >= n: return x[:n]
    L = len(x); a, b = int(L * 0.35), int(L * 0.8); seg = x[a:b]; f = int(min(xf * SR, (b - a) / 3))
    out = x[:b].copy(); fade = np.sqrt(np.linspace(0, 1, f))[:, None]
    while len(out) < n:
        tail = out[-f:] * fade[::-1] + seg[:f] * fade
        out = np.concatenate([out[:-f], tail, seg[f:]])
    return out[:n]

def shape(kind, d0, u, amt=0.12):
    """the player's dynamics through a note (u from 0 to 1): flat, a swell to the middle and back (messa di voce), crescendo, diminuendo"""
    if kind == 'swell': return d0 - amt * 0.6 + amt * 1.4 * np.sin(np.pi * np.clip(u, 0, 1)) ** 1.5 - amt * 0.3 * u
    if kind == 'cresc': return d0 - amt + 2 * amt * u
    if kind == 'dim': return d0 + amt - 2 * amt * u
    if kind == 'fp': return d0 - amt * 1.6 * (1 - np.exp(-u * 8)) + amt * 0.6 * u
    return d0 + 0 * u

class Part:
    """one desk of the orchestra: its own stereo track, its articulations, its seat on the stage"""
    def __init__(self, name, length, az, zone, width=0.6, gain=1.0, rng=26.0, natural=0.35):
        self.name = name; self.buf = np.zeros((int(length * SR), 2), np.float32); self.az = az; self.zone = zone; self.width = width
        self.gain = gain; self.rng = rng; self.natural = natural; self.arts = {}; self.n = 0

    def add(self, x, t):
        a = int(round(t * SR))
        if a < 0: x = x[-a:]; a = 0
        b = min(len(self.buf), a + len(x))
        if b > a: self.buf[a:b] += x[:b - a]

    def amp(self, dyn):
        return self.gain * 10 ** (-self.rng * (1 - np.clip(dyn, 0, 1.15)) / 20)

    def sus(self, art, m, t, d, dyn, kind='swell', amt=0.1, rel=0.6, legato=False, skip=None, xin=0.09, ahead=0.05, detune=0.0, rr=0, tl=None):
        """a held note: the dynamic layers of the nearest sampled pitch cross-faded as the dynamics move; legato: joined to the note before
        (the new note's own attack left out, a short cross-fade); ahead: the bow or the breath starts a little before the beat"""
        A = self.arts[art]; p, sh = A.nearest(m); sh += detune / 100.0
        L = len(A.layers[p]); t0 = t - (0.02 if legato else ahead); n = int((d + rel + (0.02 if legato else ahead)) * SR)
        u = np.linspace(0, 1, n) * (d + rel) / max(d, 1e-3)
        dynv = shape(kind, dyn, np.clip(u, 0, 1), amt) if not callable(dyn) else dyn(np.clip(u, 0, 1))
        pos = np.clip(dynv, 0, 1) * (L - 1); out = np.zeros((n, 2), np.float32)
        for li in range(L):
            w = np.clip(1 - np.abs(pos - li), 0, 1) if L > 1 else np.ones(n)
            if w.max() < 1e-3: continue
            s = A.pick(p, li, rr); x = shifted(s['path'], s['on'], sh)
            st = int(min(attack_time(x) + 0.02, 0.4) * SR) if legato and skip is None else (int(skip * SR) if legato else 0)
            x = extend(x[st:], n)
            nat = (s['rms'] / A.rms_ref) ** self.natural / max(s['rms'], 1e-6)  # the layer brought to one loudness, a little of its own kept
            out += x * (np.sqrt(w) * nat)[:, None]
        env = self.amp(dynv) * 0.05
        # the end: the bow or the breath let go
        ti = np.arange(n) / SR - (d + (0.02 if legato else ahead))
        rel_env = np.where(ti > 0, np.exp(-6.9 * np.clip(ti, 0, None) / max(rel, 0.05)), 1.0)
        fade_in = np.ones(n)
        if legato:
            k = int(xin * SR); fade_in[:k] = np.sin(np.linspace(0, np.pi / 2, k))  # an equal-power join
        g = env * rel_env * fade_in; g[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
        self.add(out * g[:, None].astype(np.float32), t0); self.n += 1

    def hit(self, art, m, t, dyn, ring=None, detune=0.0, rr=0, layer=None):
        """a plucked, struck or short note: the recorded note as it sounds and dies away (ring: let it sound so long, then damp it)"""
        A = self.arts[art]
        if m is None: p, sh = (A.pitches[0] if A.pitches else None), 0.0
        else: p, sh = A.nearest(m)
        sh += detune / 100.0; L = len(A.layers[p])
        li = int(np.clip(round(np.clip(dyn, 0, 1) * (L - 1)), 0, L - 1)) if layer is None else layer
        s = A.pick(p, li, rr); x = shifted(s['path'], s['on'], sh).copy()
        if ring is not None:
            n = min(len(x), int(ring * SR)); x = x[:n].copy(); k = min(n, int(0.12 * SR)); x[-k:] *= np.linspace(1, 0, k)[:, None]
        nat = (s['rms'] / A.rms_ref) ** self.natural / max(s['rms'], 1e-6)
        self.add(x * (self.amp(dyn) * 0.05 * nat), t); self.n += 1

    def seg(self, art, t, d, dyn0, dyn1, m=None, src_at=0.5, fin=0.15, fout=0.6, layer=-1):
        """a stretch of a long recorded roll (timpani, cymbal) with its level moved from dyn0 to dyn1"""
        A = self.arts[art]
        p, sh = (A.nearest(m) if m is not None else ((A.pitches[0] if A.pitches else None), 0.0))
        grp = A.layers[p][layer]; s = grp[0]; x = shifted(s['path'], s['on'], sh)
        a = int(src_at * SR); n = int((d + fout) * SR); x = extend(x[a:], n).copy()
        g = self.amp(np.linspace(dyn0, dyn1, n)) * 0.05 / max(s['rms'], 1e-6) * (s['rms'] / A.rms_ref) ** self.natural
        k = int(fin * SR); g[:k] *= np.linspace(0, 1, k); ko = int(fout * SR); g[-ko:] *= np.linspace(1, 0, ko) ** 2
        self.add(x * g[:, None].astype(np.float32), t); self.n += 1

# ---------------- the hall ----------------
HALL = {'L': 38.0, 'W': 25.0, 'H': 16.0, 'mic': (19.0, 15.5, 3.4), 'absorb': 0.8}
ZONES = {'front': 6.0, 'mid': 9.5, 'back': 13.0}

def _er(az, dist, seed):
    """early reflections of a shoebox hall by the image method (to the second order), heard by a pair of microphones; a stereo FIR"""
    Lx, Wy, Hz = HALL['L'], HALL['W'], HALL['H']; mx, my, mz = HALL['mic']
    sx = mx + dist * math.sin(math.radians(az)); sy = my - dist * math.cos(math.radians(az)); sz = 1.6
    n = int(0.16 * SR); h = np.zeros((n, 2), np.float32); d0 = math.dist((sx, sy, sz), (mx, my, mz))
    for i in range(-2, 3):
        for j in range(-2, 3):
            for k in range(-2, 3):
                order = abs(i) + abs(j) + abs(k)
                if order == 0 or order > 3: continue
                ix = i * Lx + (sx if i % 2 == 0 else Lx - sx); iy = j * Wy + (sy if j % 2 == 0 else Wy - sy); iz = k * Hz + (sz if k % 2 == 0 else Hz - sz)
                dd = math.dist((ix, iy, iz), (mx, my, mz)); dt = (dd - d0) / 343.0
                if dt <= 0 or dt >= 0.155: continue
                g = (d0 / dd) * (HALL['absorb'] ** order) * (0.85 if k else 1.0)
                azr = math.atan2(ix - mx, my - iy); pan = (math.sin(azr) + 1) / 2
                gl, gr = math.cos(pan * math.pi / 2), math.sin(pan * math.pi / 2)
                idx = int(dt * SR); h[idx, 0] += g * gl * 1.2; h[idx, 1] += g * gr * 1.2
    # each reflection softened a little (walls absorb the top)
    sos = butter(2, 6500, 'low', fs=SR, output='sos'); return sosfilt(sos, h, axis=0).astype(np.float32)

def _tail(seed=7, length=3.6):
    """the hall's late reverberation: decorrelated noise for left and right, each band dying at its own rate (the lows longest)"""
    rs = np.random.RandomState(seed); n = int(length * SR); t = np.arange(n) / SR; out = np.zeros((n, 2), np.float32)
    bands = [(None, 250, 2.5), (250, 1000, 2.2), (1000, 4000, 1.75), (4000, 9000, 1.2), (9000, None, 0.7)]
    for ch in range(2):
        w = rs.randn(n).astype(np.float32)
        for lo, hi, rt in bands:
            if lo is None: sos = butter(4, hi, 'low', fs=SR, output='sos')
            elif hi is None: sos = butter(4, lo, 'high', fs=SR, output='sos')
            else: sos = butter(4, [lo, hi], 'band', fs=SR, output='sos')
            out[:, ch] += sosfilt(sos, w) * np.exp(-6.91 * t / rt)
    on = np.clip((t - 0.018) / 0.07, 0, 1) ** 1.5; out *= on[:, None]
    return out / np.sqrt(np.sum(out ** 2) / 2)

def place(part, tail_ir, er_cache):
    """the desk on its seat: its own stereo narrowed and turned to its place, the direct sound by its distance, its reflections, its share of the hall"""
    x = part.buf; az = part.az; dist = ZONES[part.zone]
    M = (x[:, 0] + x[:, 1]) / 2; S = (x[:, 0] - x[:, 1]) / 2 * part.width
    th = (az / 90.0 + 1) * math.pi / 4; gl, gr = math.cos(th) * math.sqrt(2), math.sin(th) * math.sqrt(2)
    L = M * gl + S; R = M * gr - S
    itd = int(abs(math.sin(math.radians(az))) * 0.00035 * SR)
    if itd:
        if az > 0: L = np.concatenate([np.zeros(itd, np.float32), L[:-itd]])
        else: R = np.concatenate([np.zeros(itd, np.float32), R[:-itd]])
    dry = np.stack([L, R], 1) * (6.0 / dist)
    if part.zone != 'front':  # the far desks a little duller
        sos = butter(1, 9000 if part.zone == 'mid' else 6500, 'low', fs=SR, output='sos'); dry = sosfilt(sos, dry, axis=0).astype(np.float32)
    key = (round(az), part.zone)
    if key not in er_cache: er_cache[key] = _er(az, dist, 1)
    er = er_cache[key]; mono = (L + R) / 2
    erl = fftconvolve(mono, er[:, 0])[:len(mono)]; err = fftconvolve(mono, er[:, 1])[:len(mono)]
    send = {'front': 0.16, 'mid': 0.22, 'back': 0.3}[part.zone]
    return dry, np.stack([erl, err], 1).astype(np.float32) * 0.55, (np.stack([L, R], 1) * send).astype(np.float32)

def hall(parts, tail_len=3.6):
    tail_ir = _tail(); er_cache = {}; n = len(parts[0].buf); D = np.zeros((n, 2), np.float32); E = np.zeros((n, 2), np.float32); T = np.zeros((n, 2), np.float32)
    for p in parts:
        if not np.any(p.buf): continue
        d, e, s = place(p, tail_ir, er_cache); D += d; E += e; T += s
    W = np.stack([fftconvolve(T[:, 0], tail_ir[:, 0])[:n], fftconvolve(T[:, 1], tail_ir[:, 1])[:n]], 1).astype(np.float32)
    return D + E + W * 0.6

def master(x, gain_db=0.0, ceiling=0.79):
    """the whole: the rumble below 30 Hz taken off, a slow gentle compression (1.6:1 above −22 dBFS), a look-ahead peak limiter"""
    sos = butter(2, 30, 'high', fs=SR, output='sos'); x = sosfilt(sos, x, axis=0).astype(np.float32) * 10 ** (gain_db / 20)
    blk = int(0.01 * SR); nb = len(x) // blk + 1; pad = np.zeros((nb * blk, 2), np.float32); pad[:len(x)] = x
    rms = np.sqrt(np.mean(pad.reshape(nb, blk, 2) ** 2, axis=(1, 2)) + 1e-12); lv = 20 * np.log10(rms)
    over = np.clip(lv + 22, 0, None); gr = -over * (1 - 1 / 1.6)
    sm = np.zeros_like(gr); g = 0.0
    for i, v in enumerate(gr):
        a = 0.35 if v < g else 0.04  # attack ~30 ms, release ~300 ms in 10 ms blocks
        g = g + (v - g) * a; sm[i] = g
    gain = np.repeat(10 ** (sm / 20), blk)[:len(x)]; y = x * gain[:, None]
    # the limiter: 5 ms look-ahead, 80 ms release
    pk = np.max(np.abs(y), 1); la = int(0.005 * SR)
    need = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    from scipy.ndimage import minimum_filter1d
    need = minimum_filter1d(need, size=2 * la + 1)
    out = np.empty_like(need); g = 1.0; rel = 1 - math.exp(-1 / (0.08 * SR))
    for i in range(len(need)):
        g = need[i] if need[i] < g else g + (need[i] - g) * rel; out[i] = g
    return (y * out[:, None]).astype(np.float32)

def loud(x, a, b):
    seg = x[int(a * SR):int(b * SR)]; return 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)
