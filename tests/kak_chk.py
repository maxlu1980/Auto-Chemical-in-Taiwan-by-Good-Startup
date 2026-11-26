# (v90) the crossing's guidance sound at Okachimachi, checked two ways in the browser:
#  1. the scheduling log — every call the page makes to the Web Audio API (oscillators started, their frequencies, every gain/delay value and ramp,
#     every connection) is recorded by hooks installed before the page loads; the notes that reach the crossing's bus are rebuilt from it alone;
#  2. the rendered sound — the crossing's dry signal and its bus (direct + reflections) are recorded sample by sample as Chromium renders them and
#     measured like the street recording was: pitch, length at half level, onsets, level difference, harmonics, how fast it switches.
# Both are compared with the values measured from the recording (the recording itself is not used here). Also: it sounds only while the walk light is
# steadily green — none in the flashing green, none in the red — and none at night; the reflections' delays agree with the street's geometry.
#   python3 kak_chk.py <out dir>
import asyncio, sys, json, time, os, base64, math
import numpy as np
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
HOUR = "(function(){ window.ISLE_HOUR = %d; clockT = 0; skyT = 0; return 1; })()"  # the game's clock held at an hour; the sky follows within a few seconds
# the target: measured from the recording, note by note
TGT = dict(kF=1108, cF=888, kD=0.107, cD=0.203, dB=1.9, kc=0.485, kk=0.220, kkc=0.393, ab=1.60, ba=1.63)
SPK = [(14.2, 4.04, 38.7), (19.9, 4.04, 21.3)]  # north (カッコー), south (カカッコー) — the poles in tw_tokyo_b.js
# the road-facing faces found by rays at speaker height (probe of v90): south of the road facing north, north of it facing south
FAC = [[(-12.5, 3.2, 16.5), (3.2, 13.2, 17.4), (32.4, 66, 18)], [(-12.5, 12.8, 43.5), (22.2, 43.8, 43.5), (46.2, 66, 43.5)]]
HOOK = r"""(function(){ var E = window.__wa = { osc: [], stop: {}, edges: [], prm: [], on: false }, id = 0; function tg(n) { if (!n.__id) Object.defineProperty(n, '__id', { value: ++id }); return n.__id; }
  var BC = (window.BaseAudioContext || window.AudioContext).prototype;
  ['createGain', 'createOscillator', 'createDelay', 'createBiquadFilter', 'createStereoPanner', 'createBufferSource', 'createScriptProcessor', 'createDynamicsCompressor', 'createAnalyser'].forEach(function (m) { var f = BC[m]; if (!f) return; BC[m] = function () { var n = f.apply(this, arguments); tg(n); Object.defineProperty(n, '__m', { value: m }); ['gain', 'frequency', 'delayTime', 'pan'].forEach(function (k) { if (n[k] instanceof AudioParam) { Object.defineProperty(n[k], '__o', { value: n.__id }); Object.defineProperty(n[k], '__k', { value: k }); } }); return n; }; });
  var C = AudioNode.prototype.connect; AudioNode.prototype.connect = function (d) { if (d instanceof AudioNode) E.edges.push([tg(this), tg(d)]); return C.apply(this, arguments); };
  var S0 = AudioScheduledSourceNode.prototype.start, S1 = AudioScheduledSourceNode.prototype.stop;
  AudioScheduledSourceNode.prototype.start = function (t) { if (E.on && this instanceof OscillatorNode) E.osc.push([tg(this), this.type, t == null ? 0 : t, this.context.currentTime]); return S0.apply(this, arguments); };
  AudioScheduledSourceNode.prototype.stop = function (t) { if (E.on && this instanceof OscillatorNode) E.stop[tg(this)] = t; return S1.apply(this, arguments); };
  ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'cancelScheduledValues', 'setTargetAtTime'].forEach(function (m) { var f = AudioParam.prototype[m]; AudioParam.prototype[m] = function (v, t) { if (E.on && this.__o && m !== 'setTargetAtTime') E.prm.push([this.__o, this.__k, m, v, t == null ? null : t]); return f.apply(this, arguments); }; });
  var vd = Object.getOwnPropertyDescriptor(AudioParam.prototype, 'value'); Object.defineProperty(AudioParam.prototype, 'value', { get: vd.get, set: function (x) { if (E.on && this.__o) E.prm.push([this.__o, this.__k, 'value', x, null]); vd.set.call(this, x); }, configurable: true });
})();"""
# taps: the dry calls (SND.tap) and the bus (stereo, summed), recorded on the audio thread by an AudioWorklet — every 128-frame quantum with its own frame
# number, so nothing is dropped or misplaced even when the page's main thread lags; the phase and night, 20 times a second
WK = r"""class Rec extends AudioWorkletProcessor { constructor() { super(); this.b = new Float32Array(8192); this.n = 0; this.f0 = -1; this.on = true; this.port.onmessage = (e) => { this.on = false; if (this.n) this.port.postMessage({ f0: this.f0, d: this.b.slice(0, this.n) }); this.port.postMessage({ end: 1 }); }; }
  process(ins) { if (!this.on) return false; const i = ins[0], L = 128; if (this.f0 < 0) this.f0 = currentFrame; if (currentFrame !== this.f0 + this.n) { if (this.n) this.port.postMessage({ f0: this.f0, d: this.b.slice(0, this.n) }); this.b = new Float32Array(8192); this.n = 0; this.f0 = currentFrame; } for (let k = 0; k < L; k++) { let v = 0; for (let c = 0; c < i.length; c++) v += i[c][k]; this.b[this.n + k] = v; } this.n += L;
    if (this.n >= this.b.length) { this.port.postMessage({ f0: this.f0, d: this.b }); this.b = new Float32Array(8192); this.n = 0; this.f0 = currentFrame + L; } return true; } }
registerProcessor('kak-rec', Rec);"""
TAP = r"""(function(){ var S = TKM.snd(); if (!S) return 'no sound'; var ctx = S.ctx; if (!S.xbus) return 'no bus yet'; if (window.__rec) return window.__rec.ready ? ctx.state : 'loading';
  var R = window.__rec = { sr: ctx.sampleRate, dry: [], wet: [], end: 0, ph: [], xbus: S.xbus.__id, tap: 0, ready: false };
  ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([__WK__], { type: 'application/javascript' }))).then(function () {
    function rec(nIn, arr) { var n = new AudioWorkletNode(ctx, 'kak-rec', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: nIn, channelCountMode: 'explicit' }); n.port.onmessage = function (e) { if (e.data.end) R.end++; else arr.push([e.data.f0, e.data.d]); }; var z = ctx.createGain(); z.gain.value = 0; n.connect(z); z.connect(ctx.destination); return n; }
    var td = ctx.createGain(); td.channelCount = 1; td.channelCountMode = 'explicit'; R.nd = rec(1, R.dry); R.nw = rec(2, R.wet); td.connect(R.nd); S.tap = td; R.tap = td.__id; S.xbus.connect(R.nw); S.kakLog = [];
    R.tm = setInterval(function () { R.ph.push([ctx.currentTime, TK.T.sig.ph, +TK.T.sig.t.toFixed(3), +(TK.T.nk || 0).toFixed(3)]); }, 50); window.__wa.on = true; R.ready = true; });
  return 'loading'; })()""".replace('__WK__', json.dumps(WK))
STOP = "(function(){ var R = window.__rec; window.__wa.on = false; clearInterval(R.tm); R.nd.port.postMessage('stop'); R.nw.port.postMessage('stop'); return 1; })()"
DUMP = r"""(function(){ var R = window.__rec, E = window.__wa;
  function pack(arr) { if (!arr.length) return { f0: 0, b: '', holes: 0 }; arr.sort(function (p, q) { return p[0] - q[0]; }); var f0 = arr[0][0], last = arr[arr.length - 1], n = last[0] + last[1].length - f0, all = new Float32Array(n), holes = 0, k = f0; var hl = []; arr.forEach(function (q) { if (q[0] !== k) { holes++; hl.push([k, q[0] - k]); } all.set(q[1], q[0] - f0); k = q[0] + q[1].length; }); var u = new Uint8Array(all.buffer), s = '', i; for (i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return { f0: f0, b: btoa(s), holes: holes, hl: hl.slice(0, 5), nb: arr.length }; }
  var S = TKM.snd(); return JSON.stringify({ sr: R.sr, xbus: R.xbus, tap: R.tap, end: R.end, dry: pack(R.dry), wet: pack(R.wet), ph: R.ph, osc: E.osc, stop: E.stop, edges: E.edges, prm: E.prm, klog: S.kakLog }); })()"""
def dec(p, sr):
    return p['f0'] / sr, (np.frombuffer(base64.b64decode(p['b']), dtype=np.float32).astype(np.float64) if p['b'] else np.zeros(0))
def hilb(x):
    n = len(x); N = 1 << int(np.ceil(np.log2(max(2, n)))); X = np.fft.fft(x, N); h = np.zeros(N); h[0] = 1; h[N // 2] = 1; h[1:N // 2] = 2
    return np.abs(np.fft.ifft(X * h)[:n])
def notes_from_audio(x, sr, t0):
    """the notes in a recorded signal: on and off where the (Hilbert) envelope passes half its plateau, interpolated between samples; pitch by an
    interpolated FFT peak over the plateau; plateau level (rms); 2nd and 3rd harmonics; the onset's 10 -> 90 % rise"""
    out = []
    if len(x) < 1000: return out
    E = hilb(x); idx = np.flatnonzero(E > 0.1 * E.max())
    if not len(idx): return out
    segs = []; s0 = idx[0]; p = idx[0]
    for i in idx[1:]:
        if i - p > int(0.01 * sr): segs.append((s0, p)); s0 = i
        p = i
    segs.append((s0, p))
    def cross(i, lvl, up):
        # sub-sample time where E passes lvl next to sample i
        j = i - 1 if up else i + 1
        return i + (lvl - E[i]) / (E[i] - E[j]) * (i - j) if E[i] != E[j] else i
    for s0, s1 in segs:
        if (s1 - s0) / sr < 0.03: continue
        Es = E[s0:s1 + 1]; pk = np.median(Es[Es > Es.max() * 0.5]); h = np.flatnonzero(Es >= pk / 2); a0, a1 = s0 + h[0], s0 + h[-1]
        ta, tb = cross(a0, pk / 2, True), cross(a1, pk / 2, False)
        seg = x[a0 + int(0.005 * sr):a1 - int(0.005 * sr)]; n = 1 << int(np.ceil(np.log2(len(seg) * 8))); sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n)); k = int(np.argmax(sp[1:])) + 1
        al, be, ga = np.log(sp[k - 1] + 1e-12), np.log(sp[k] + 1e-12), np.log(sp[k + 1] + 1e-12); f0 = (k + 0.5 * (al - ga) / (al - 2 * be + ga)) * sr / n
        hh = [20 * np.log10(sp[int(round(m * f0 * n / sr))] / sp[k] + 1e-12) for m in (2, 3)]
        rms = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)
        # switching: the amplitude sample by sample — the signal over the note's own sine fitted on the plateau (where that sine is away from zero) — from 10 % to 90 %
        tt0 = np.arange(len(x)) / sr; w = 2 * np.pi * f0; pa, pb = a0 + int(0.005 * sr), a1 - int(0.005 * sr); M = np.stack([np.cos(w * tt0[pa:pb]), np.sin(w * tt0[pa:pb])], 1); cs, *_ = np.linalg.lstsq(M, x[pa:pb], rcond=None)
        q0, q1 = max(0, a0 - int(0.003 * sr)), a0 + int(0.003 * sr); u = (cs[0] * np.cos(w * tt0[q0:q1]) + cs[1] * np.sin(w * tt0[q0:q1])); A0 = np.hypot(*cs); keep = np.abs(u) > 0.5 * A0; amp = np.where(keep, x[q0:q1] / np.where(keep, u, 1), np.nan)
        ii = np.arange(q0, q1); g10 = ii[np.nan_to_num(amp, nan=-1) >= 0.1]; g90 = ii[np.nan_to_num(amp, nan=-1) >= 0.9]; r10 = g10[0] if len(g10) else a0; r90 = g90[0] if len(g90) else a0
        out.append(dict(t=t0 + ta / sr, d=(tb - ta) / sr, f=f0, rms=rms, h2=hh[0], h3=hh[1], rise=(r90 - r10) / sr))
    return out
def calls_of(notes):
    calls = []; cur = []
    for q in notes:
        if cur and q['t'] - cur[-1]['t'] > 0.6: calls.append(cur); cur = []
        cur.append(q)
    if cur: calls.append(cur)
    return calls
def check_calls(calls, need, tag, tolT=0.002, tolF=1.0, tolDB=0.1, emit=None):
    """pattern, pitch, lengths, spacing and level inside each call; emit(call) -> the call's emission time, for the spacing between the two ends"""
    ok2 = ok3 = 0; bad = []
    for c in calls:
        fs = [q['f'] for q in c]; ds = [q['d'] for q in c]
        if len(c) == 2:
            good = abs(fs[0] - TGT['kF']) < tolF and abs(fs[1] - TGT['cF']) < tolF and abs(ds[0] - TGT['kD']) < tolT and abs(ds[1] - TGT['cD']) < tolT and abs(c[1]['t'] - c[0]['t'] - TGT['kc']) < tolT and abs(c[1]['rms'] - c[0]['rms'] - TGT['dB']) < tolDB
            ok2 += good
        elif len(c) == 3:
            good = all(abs(f - TGT['kF']) < tolF for f in fs[:2]) and abs(fs[2] - TGT['cF']) < tolF and all(abs(d - TGT['kD']) < tolT for d in ds[:2]) and abs(ds[2] - TGT['cD']) < tolT and abs(c[1]['t'] - c[0]['t'] - TGT['kk']) < tolT and abs(c[2]['t'] - c[0]['t'] - TGT['kkc']) < tolT and abs(c[2]['rms'] - c[0]['rms'] - TGT['dB']) < tolDB and abs(c[1]['rms'] - c[0]['rms']) < tolDB
            ok3 += good
        else: good = False
        if not good: bad.append([(round(q['t'], 4), round(q['f'], 1), round(q['d'], 4), round(q['rms'], 2)) for q in c])
    need(not bad and ok2 >= 3 and ok3 >= 3, tag + ': every call is カッコー (2 notes) or カカッコー (3 notes) with the measured pitches, lengths, spacing and +1.9 dB', dict(kakko=ok2, kakakko=ok3, bad=bad[:3]))
    if emit:
        iv = [(len(a), round(emit(b) - emit(a), 4)) for a, b in zip(calls, calls[1:])]
        g = all((n == 2 and abs(v - TGT['ab']) < 0.0045) or (n == 3 and abs(v - TGT['ba']) < 0.0045) for n, v in iv) and len({n for n, v in iv}) == 2
        need(g, tag + ': the two ends answer each other 1.60 s (カッコー → カカッコー) and 1.63 s (カカッコー → カッコー) apart', iv[:8])
def refl_model(s, L):
    """the reflections the street's faces give, worked out here again from the geometry: one per side; specular where it lands on a face, else the
    nearest face's edge (0.45, fading out at 12 m off) — as described in tw_tokyo_c.js"""
    d = max(1, math.dist(s, L)); out = []
    for k, side in enumerate(FAC):
        best = None
        for x0, x1, z in side:
            if (L[2] <= z or s[2] <= z) if k == 0 else (L[2] >= z or s[2] >= z): continue
            ds, dl = abs(s[2] - z), abs(L[2] - z); w = ds / (ds + dl); sx = s[0] + (L[0] - s[0]) * w; px = min(x1, max(x0, sx)); py = s[1] + (L[1] - s[1]) * w
            pl = math.dist(s, (px, py, z)) + math.dist((px, py, z), L)
            if best is None or pl < best[0]: best = (pl, px, z, abs(px - sx))
        if best is None: continue
        kr = 0.7 * (1 if best[3] < 0.01 else 0.45 * max(0, 1 - best[3] / 12))
        if kr > 0: out.append((best[2], (best[0] - d) / 343.0, 0.055 * max(0.08, min(1.8, 10 / best[0])) * kr))
    return d, out
async def main():
    bad = []
    def need(ok, what, info=''):
        log(('OK  ' if ok else 'BAD ') + what, info if (not ok or len(str(info)) < 400) else str(info)[:400])
        if not ok: bad.append(what)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 1000, "height": 640}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script(HOOK + " window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}")
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 300:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        await pg.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; R3.render = function () {}; if (POST) POST.render = function () {}; return 1; })()")
        await pg.evaluate(EV, HOUR % 11)  # a fixed daytime
        await pg.evaluate("() => { ISLE_x.sndTap(); document.dispatchEvent(new Event('pointerup')); }"); await pg.mouse.click(500, 320); await pg.wait_for_timeout(2500)
        r0 = await pg.evaluate(EV, "TK.T.sig.t"); await pg.wait_for_timeout(3000); r1 = await pg.evaluate(EV, "TK.T.sig.t"); log('scene clock: %.2f s in 3 s of wall time' % ((r1 - r0) % 46))
        # the listener in the middle of the crossing (ear 1.6 m), facing north; the light two seconds before the walk phase
        L = (17.05, 1.6, 30.0)
        await pg.evaluate(EV, "(function(){ var T = TK.T, a = T.toW(%f, 0, %f), b = T.toW(%f, 0, %f); ISLE_x.camHold([a.x, T.Y + %f, a.z], [b.x, T.Y + 1.6, b.z]); pos.set(a.x, T.Y + %f, a.z); T.sig.ph = 'carY'; T.sig.t = 1.0; return 1; })()" % (L[0], L[2], L[0], L[2] + 10, L[1], L[1] - 1.3))
        await pg.wait_for_timeout(400)
        st = 'loading'; tt = time.time()
        while st in ('loading', 'no bus yet') and time.time() - tt < 20: st = await pg.evaluate(EV, TAP); await pg.wait_for_timeout(300)
        log('taps', st)
        need(st == 'running', 'the street sound runs and the crossing bus is tapped', st)
        t1 = time.time()
        while time.time() - t1 < 60:
            await pg.wait_for_timeout(1000); ph = await pg.evaluate(EV, "TK.T.sig.ph + ' ' + TK.T.sig.t.toFixed(1)")
            if ph.startswith('car ') and float(ph.split()[1]) > 2.5: break
        cam = json.loads(await pg.evaluate(EV, "(function(){ var T = TK.T, c = T.toL(cam.position.x, cam.position.z); return JSON.stringify([c[0], cam.position.y - T.Y, c[1]]); })()"))
        await pg.evaluate(EV, STOP); await pg.wait_for_timeout(1500)
        R = json.loads(await pg.evaluate(EV, DUMP)); open(OUT + '/day.json', 'w').write(json.dumps({k: R[k] for k in R if k not in ('dry', 'wet')}))
        log('listener (local)', [round(v, 2) for v in cam], 'recorder holes', R['dry'].get('holes'), R['wet'].get('holes'), R['dry'].get('hl'), R['wet'].get('hl'), 'blocks', R['dry'].get('nb'), 'ended', R['end'], 'oscillators logged', len(R['osc']), 'param events', len(R['prm']))
        # ---- phases on the audio clock
        ph = R['ph']; ch = [(ph[i][0], ph[i][1]) for i in range(len(ph)) if i == 0 or ph[i][1] != ph[i - 1][1]]; log('phases', [(round(t, 2), p) for t, p in ch])
        tPed = next(t for t, p in ch if p == 'ped'); tF = next(t for t, p in ch if p == 'pedF'); tA = next((t for t, p in ch if p == 'allR2'), None)
        # ---- 1. the scheduling log alone: the oscillators that reach the crossing bus
        fwd = {}
        for a, c in R['edges']: fwd.setdefault(a, set()).add(c)
        def reaches(n, goal, seen=None):
            seen = seen or set()
            if n == goal: return True
            seen.add(n)
            return any(reaches(m, goal, seen) for m in fwd.get(n, ()) if m not in seen)
        P = {}
        for o, k, m, v, t in R['prm']: P.setdefault((o, k), []).append((m, v, t))
        xn = []
        for oid, typ, t, now in R['osc']:
            if not reaches(oid, R['xbus']): continue
            g = next(iter(fwd.get(oid, ())), None); fr = [e for e in P.get((oid, 'frequency'), []) if e[0] == 'setValueAtTime']; ge = P.get((g, 'gain'), [])
            xn.append(dict(id=oid, typ=typ, t0=t, f=fr[0][1] if fr else None, fr=fr, g=ge, stop=R['stop'].get(str(oid)), lead=t - now))
        log('scheduled notes on the crossing bus', len(xn))
        nt = []
        for q in xn:
            gv = q['g']; ok = len(gv) == 4 and [e[0] for e in gv] == ['setValueAtTime', 'linearRampToValueAtTime', 'setValueAtTime', 'linearRampToValueAtTime'] and gv[0][1] == 0 and gv[3][1] == 0 and abs(gv[1][1] - gv[2][1]) < 1e-9
            if not ok: nt.append(None); continue
            r = gv[1][2] - gv[0][2]  # half level at t0 + r/2 going on, at t_hold + r/2 going off
            nt.append(dict(t=gv[0][2] + r / 2, d=gv[2][2] - gv[0][2], f=q['f'], rms=20 * math.log10(gv[1][1]), r=r, typ=q['typ'], nfr=len(q['fr'])))
        need(all(n is not None for n in nt) and nt, 'log: every note is one sine at one frequency, switched on, held and off by linear ramps (no glide, no other shaping)', [q['g'] for q, n in zip(xn, nt) if n is None][:2])
        nt = [n for n in nt if n]
        need(all(n['typ'] == 'sine' and n['nfr'] == 1 for n in nt), 'log: sine oscillators, no frequency changes', {(n['typ'], n['nfr']) for n in nt})
        need(all(abs(n['r'] - 0.0005) < 1e-6 for n in nt), 'log: switched on and off in 0.5 ms (half level 0.25 ms in)', sorted({round(n['r'], 5) for n in nt}))
        calls = calls_of(nt); log('calls (log)', len(calls), [len(c) for c in calls])
        # emission = onset − travel time from that end's speaker
        def emitL(c): return c[0]['t'] - math.dist(SPK[0 if len(c) == 2 else 1], cam) / 343.0
        em = [emitL(c) for c in calls]
        need(calls and all(tPed - 0.06 <= e < tF + 0.06 for e in em), 'log: every call is sent while the walk light is steadily green (none in the red, none in the flashing green)', [round(e - tPed, 3) for e in em])
        late = [n for n in nt if n['t'] > tF + 0.06]; log('notes timed after the flashing began (silenced by the bus cut)', len(late))
        check_calls(calls, need, 'log', tolT=1e-6, tolF=1e-6, tolDB=0.0001, emit=emitL)
        need(calls and min(c[0]['t'] for c in calls) - tPed < 0.12, 'log: the first call comes as the walk light turns green', round(calls[0][0]['t'] - tPed, 3) if calls else None)
        # the bus is cut at the flashing green
        xb = P.get((R['xbus'], 'gain'), []); cut = [e for e in xb if e[0] == 'linearRampToValueAtTime' and e[1] == 0]
        need(cut and abs(cut[-1][2] - tF) < 0.12 and cut[-1][2] - [e for e in xb if e[0] == 'setValueAtTime'][-1][2] <= 0.0041, 'log: the bus is faded out within 4 ms as the green begins to flash', [(e[0][:6], round(e[1], 3), round(e[2] - tF, 3) if e[2] else None) for e in xb][-4:])
        # reflections: delays and levels against the geometry, worked out again here
        kl = R['klog']; okR = True; ex = []
        for c in kl:
            d, mod = refl_model(SPK[c['end']], cam); got = [(e[0], e[3], e[4]) for e in c['ech']]
            if len(got) != len(mod) or any(abs(a[1] - m[1]) > 2e-4 or abs(a[2] - m[2]) > 2e-5 or a[0] != m[0] for a, m in zip(got, mod)): okR = False; ex.append((c['end'], got, mod))
        need(kl and okR, 'log: each call\'s reflections (which face, delay, level) agree with the street geometry', ex[:2] or [(c['end'], c['ech']) for c in kl[:2]])
        # ---- 2. the rendered sound
        sr = R['sr']; td, dry = dec(R['dry'], sr); tw, wet = dec(R['wet'], sr); np.save(OUT + '/dry.npy', dry); np.save(OUT + '/wet.npy', wet)
        hz = [(h[0] / sr, h[1] / sr) for h in R['dry'].get('hl', []) + R['wet'].get('hl', [])]; tEnd = (tA or tF + 4) + 2
        spans = [(c[0]['t'] - 0.05, c[-1]['t'] + c[-1]['d'] + 0.15) for c in calls]
        inwin = [h for h in hz if any(h[0] + max(0, h[1]) > a and h[0] < b for a, b in spans)]
        need(not inwin and R['end'] == 2 and td < tPed - 1 and td + len(dry) / sr > tEnd, 'render: both taps recorded every audio quantum through every call (the audio clock\'s hiccups elsewhere, if any, are listed)', dict(holes=[(round(a, 3), round(b, 4)) for a, b in hz], recorded=(round(td, 2), round(td + len(dry) / sr, 2))))
        na = notes_from_audio(dry, sr, td); log('rendered notes', len(na))
        rc = calls_of(na); check_calls(rc, need, 'render', tolT=0.0011, tolF=0.5, tolDB=0.05, emit=emitL)
        need(na and max(q['h2'] for q in na) < -60 and max(q['h3'] for q in na) < -60, 'render: a pure sine (2nd, 3rd harmonics below −60 dB)', (round(max(q['h2'] for q in na), 1), round(max(q['h3'] for q in na), 1)) if na else None)
        need(na and max(q['rise'] for q in na) < 0.001, 'render: switched on within 1 ms (amplitude 10 → 90 %)', round(max(q['rise'] for q in na), 4) if na else None)
        # the bus after the cut: silent through the flashing green and the red that follows
        i0 = int((tF + 0.02 - tw) * sr); i1 = int(((tA or tF + 4) + 2 - tw) * sr); post = wet[i0:i1]
        lvl = 20 * np.log10(np.max(np.abs(post)) + 1e-12) if len(post) else None
        pre = wet[int((tPed - tw) * sr):int((tF - tw) * sr)]; lv0 = 20 * np.log10(np.max(np.abs(pre)) + 1e-12) if len(pre) else None
        need(len(post) > sr * 3 and lvl < -100, 'render: silence on the bus from 20 ms into the flashing green until the cars move (peak dBFS)', (round(lvl, 1) if lvl is not None else None, round(lv0, 1) if lv0 is not None else None, round(len(post) / sr, 2)))
        # echoes heard on the bus: after each note's direct end, energy continues for the longest reflection delay
        log('reflections at the listener', [(c['end'], c['ech']) for c in kl[:2]])
        json.dump(dict(log=[dict(t=round(n['t'], 5), f=n['f'], d=round(n['d'], 5), dB=round(n['rms'], 3)) for n in nt], render=[{k: (round(v, 5) if isinstance(v, float) else v) for k, v in q.items()} for q in na], phases=ch, klog=kl), open(OUT + '/summary.json', 'w'), indent=1)
        # ---- 3. at night: no calls through a whole walk phase
        await pg.evaluate(EV, HOUR % 22); tt = time.time(); nk = 0
        while time.time() - tt < 90:
            await pg.wait_for_timeout(1000); nk = await pg.evaluate(EV, "TK.T.nk")
            if nk >= 0.99: break
        log('night after %.0f s: nk %.2f' % (time.time() - tt, nk))
        await pg.evaluate(EV, "(function(){ TK.T.sig.ph = 'ped'; TK.T.sig.t = 0; TKM.snd().kakLog = []; return 1; })()"); await pg.wait_for_timeout(9000)
        nN = await pg.evaluate(EV, "[TKM.snd().kakLog.length, TK.T.sig.ph, TK.T.nk]")
        need(nk >= 0.5 and nN[0] == 0 and nN[1] == 'ped', 'night (22:00): no calls while the walk light is green', (nk, nN))
        await pg.evaluate(EV, HOUR % 11); tt = time.time()
        while time.time() - tt < 90:
            await pg.wait_for_timeout(1000)
            if await pg.evaluate(EV, "TK.T.nk") < 0.01: break
        await pg.evaluate(EV, "(function(){ TK.T.sig.ph = 'ped'; TK.T.sig.t = 0; TKM.snd().kakLog = []; return 1; })()"); await pg.wait_for_timeout(5000)
        nD = await pg.evaluate(EV, "[TKM.snd().kakLog.length, TK.T.sig.ph, TK.T.nk]")
        need(nD[0] >= 2, 'day again (11:00): the calls come back with the walk light', nD)
        need(not errs, 'no page errors', errs[:4])
        await b.close()
    log('RESULT', 'PASS' if not bad else 'FAIL', bad)
asyncio.run(main())
