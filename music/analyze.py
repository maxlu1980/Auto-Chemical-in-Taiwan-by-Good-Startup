# the sample library, measured: for every sample its true pitch (the file names follow two octave conventions), its loudness, its onset
import os, re, glob, json, sys
import numpy as np, soundfile as sf

LIB = sys.argv[1]
OUT = sys.argv[2]
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
RX = re.compile(r'(?:^|_)([A-G](?:#|b)?)(-?\d)(?=_|\.wav$)')

def nominal(name):
    m = RX.search(name)
    if not m: return None
    return 12 * (int(m.group(2)) + 1) + NOTE[m.group(1)]  # scientific: C4 = 60

def mono(x): return x.mean(axis=1) if x.ndim > 1 else x

def onset(x, sr):
    env = np.abs(x); pk = env.max() + 1e-12
    i = int(np.argmax(env > pk * 10 ** (-36 / 20)))  # the first sample within 36 dB of the peak
    return max(0, i - int(0.004 * sr)) / sr

def f0(x, sr, lo, hi, start):
    a = int(start * sr); seg = x[a:a + int(0.8 * sr)]
    if len(seg) < 4096: seg = x[:int(0.8 * sr)]
    n = 1 << 17; X = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n)); fr = np.fft.rfftfreq(n, 1 / sr)
    hps = X.copy()
    for h in (2, 3, 4):
        d = X[::h]; hps[:len(d)] *= d; hps[len(d):] = 0
    band = (fr >= lo) & (fr <= hi)
    i = np.argmax(np.where(band, hps, 0)); return fr[i]

def peak(x, sr, lo, hi, start, dur=0.5):
    a = int(start * sr); seg = x[a:a + int(dur * sr)]
    n = 1 << 17; X = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n)); fr = np.fft.rfftfreq(n, 1 / sr)
    band = (fr >= lo) & (fr <= hi); return fr[np.argmax(np.where(band, X, 0))]

def midi(f): return 69 + 12 * np.log2(f / 440.0)

res = {}
for d in sorted(set(os.path.dirname(p) for p in glob.glob(LIB + '/**/*.wav', recursive=True))):
    rel = os.path.relpath(d, LIB); files = sorted(glob.glob(d + '/*.wav')); rows = []
    for p in files:
        x, sr = sf.read(p, always_2d=True); m = mono(x); on = onset(m, sr)
        a = int(on * sr); rms = float(np.sqrt(np.mean(m[a:a + int(1.0 * sr)] ** 2)) + 1e-12)
        nm = nominal(os.path.basename(p)); det = None
        perc = 'Timpani' in rel or 'Glock' in rel
        if 'Timpani' in rel: det = midi(peak(m, sr, 55, 260, on + 0.05, 0.6))
        elif 'Glock' in rel: det = midi(peak(m, sr, 700, 6000, on + 0.01, 0.4))
        elif nm is not None and 'drums' not in rel and 'Cymbals' not in rel:
            f = f0(m, sr, 25, 4500, on + (0.05 if ('pizz' in rel.lower() or 'spic' in rel.lower() or 'Harp' in rel) else 0.35)); det = midi(f)
        rows.append({'f': os.path.basename(p), 'nom': nm, 'det': None if det is None else round(float(det), 2), 'on': round(on, 4), 'rms': rms, 'dur': round(len(m) / sr, 3)})
    # the folder's octave convention: the multiple of 12 that brings the names nearest to what was measured
    diffs = [r['det'] - r['nom'] for r in rows if r['nom'] is not None and r['det'] is not None]
    off = 0
    if diffs and 'Timpani' not in rel and 'Glock' not in rel:
        off = int(12 * round(float(np.median(diffs)) / 12))
    for r in rows:
        if 'Timpani' in rel or 'Glock' in rel: r['midi'] = None if r['det'] is None else round(r['det'], 2)
        elif r['nom'] is not None: r['midi'] = r['nom'] + off
        else: r['midi'] = None
        if r['midi'] is not None and r['det'] is not None and 'Timpani' not in rel and 'Glock' not in rel:
            e = r['det'] - r['midi']; r['tune'] = round(e - 12 * round(e / 12), 2)  # cents/100 off, octave errors of the detector aside
    good = [r for r in rows if r.get('tune') is not None]
    res[rel] = {'off': off, 'rows': rows}
    tunes = [abs(r['tune']) for r in good]
    print('%-46s n=%3d octave-off %+d  |tune| median %.2f max %.2f' % (rel[:46], len(rows), off, np.median(tunes) if tunes else -1, max(tunes) if tunes else -1))
json.dump(res, open(OUT, 'w'), indent=0)
