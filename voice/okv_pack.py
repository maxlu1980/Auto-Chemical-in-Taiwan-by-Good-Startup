# Okachimachi's recorded announcements, from the files VOICEVOX wrote (one WAV a line, the line's number first in the name) to what the page
# carries: each line cut to its speech (a short breath kept either side), brought to one loudness, lightly cleaned (the page's loudspeaker
# filter does the rest), a slow voice brought nearer the other's pace if asked, encoded as mono MP3 and written into src/okv_data.js as
# window.AC_OKV = { '001': 'data:audio/mpeg;base64,…', … }.
# Which file is which line is not taken from the number alone (VOICEVOX numbers the rows of its list, and an empty row before or after the
# imported text shifts them): empty rows are dropped, the rest taken in order, and each file's name — it carries the beginning of its text —
# is checked against the line it is taken for.
# Pauses longer than a given length can be brought down to it (a voice that waits long at each comma keeps its own speech and pitch, only the
# waiting is shortened), so that the two voices keep a like pace.
#   python3 okv_pack.py <folder of WAVs> <src dir of the page> [kbps=32] [tempo of the first voice=1.0] [tempo of the second voice=1.0] [longest pause, seconds=0 (as recorded)]
import sys, os, re, json, base64, subprocess, tempfile
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfiltfilt
IN, SRC = sys.argv[1], sys.argv[2]; KBPS = sys.argv[3] if len(sys.argv) > 3 else '32'; TEMPO = {'f': float(sys.argv[4]) if len(sys.argv) > 4 else 1.0, 'm': float(sys.argv[5]) if len(sys.argv) > 5 else 1.0}; LUFS = -18.0; CAP = float(sys.argv[6]) if len(sys.argv) > 6 else 0.0
def squeeze(y, sr, cap):
    """pauses inside the line longer than cap are cut down to cap (taken from their middle, the cut edges faded over 8 ms)"""
    fr = int(sr * 0.01); env = np.array([np.abs(y[i:i + fr]).max() for i in range(0, max(1, len(y) - fr), fr)]); quiet = env < env.max() * 10 ** (-40 / 20); cuts = []; k = 0; n = len(quiet)
    while k < n:
        if quiet[k]:
            j = k
            while j < n and quiet[j]: j += 1
            if k > 0 and j < n and (j - k) * 0.01 > cap + 0.03: L = (j - k) * fr; drop = L - int(cap * sr); a = k * fr + (L - drop) // 2; cuts.append((a, a + drop))
            k = j
        else: k += 1
    if not cuts: return y, 0.0
    out = []; pos = 0; f = int(sr * 0.008)
    for a, b in cuts:
        seg = y[pos:a].copy(); seg[-f:] *= np.linspace(1, 0, f); out.append(seg); pos = b; y = y.copy(); y[b:b + f] *= np.linspace(0, 1, f)
    out.append(y[pos:]); return np.concatenate(out), sum(b - a for a, b in cuts) / sr
T = json.loads(re.search(r'var OKV_T = (\{.*\});', open(os.path.join(SRC, 'okv_lines.js'), encoding='utf-8').read(), re.S).group(1)); LINES = sorted((v[0], v[1], v[2]) for v in T.values()); N = len(LINES)
got = []
for root, _, names in os.walk(IN):
    for f in names:
        m = re.match(r'^(\d{1,3})_([^_]*)_(.*)\.wav$', f, re.I)
        if not m: continue
        text = m.group(3).rstrip('…').rstrip('.'); p = os.path.join(root, f); dur = sf.info(p).duration
        if not text or dur < 0.6: print('  an empty row, left out:', f, round(dur, 2), 's'); continue
        got.append((int(m.group(1)), m.group(2), text, p))
got.sort(); print('files with speech:', len(got), 'of', N, 'lines')
if len(got) != N: sys.exit('the number of recordings is not the number of lines — nothing written')
bad = [(g[0], g[2], l[2][:12]) for g, l in zip(got, LINES) if not l[2].startswith(g[2])]
if bad: sys.exit('these files do not begin as their lines do — nothing written: ' + json.dumps(bad, ensure_ascii=False))
who = {v: sorted(set(g[1] for g, l in zip(got, LINES) if l[1] == v)) for v in ('f', 'm')}; print('voices:', json.dumps(who, ensure_ascii=False))
if len(who['f']) != 1 or len(who['m']) != 1 or who['f'] == who['m']: sys.exit('each group of lines should be one voice, and the two groups different voices — nothing written')
out = {}; rows = []; tmp = tempfile.mkdtemp()
for g, l in zip(got, LINES):
    k = l[0]; x, sr = sf.read(g[3], always_2d=True); x = x.mean(axis=1).astype(np.float64)
    # the speech itself: from the first to the last 10 ms frame above -46 dB of the line's peak, 70 ms and 140 ms kept around it
    fr = int(sr * 0.01); env = np.array([np.abs(x[i:i + fr]).max() for i in range(0, max(1, len(x) - fr), fr)]); on = np.where(env > env.max() * 10 ** (-46 / 20))[0]
    a = max(0, on[0] * fr - int(sr * 0.07)); b = min(len(x), (on[-1] + 1) * fr + int(sr * 0.14)); y = x[a:b]
    y = sosfiltfilt(butter(2, 110, 'hp', fs=sr, output='sos'), y); cut = 0.0
    if CAP > 0: y, cut = squeeze(y, sr, CAP)
    l0 = pyln.Meter(sr).integrated_loudness(y); y = y * 10 ** ((LUFS - l0) / 20); pk = np.abs(y).max(); lim = 10 ** (-1.5 / 20)
    if pk > lim: y = np.where(np.abs(y) > lim * 0.7, np.sign(y) * (lim * 0.7 + (lim * 0.3) * np.tanh((np.abs(y) - lim * 0.7) / (lim * 0.3))), y)   # a soft ceiling for the odd peak
    f0 = min(len(y), int(sr * 0.008)); y[:f0] *= np.linspace(0, 1, f0); f1 = min(len(y), int(sr * 0.03)); y[-f1:] *= np.linspace(1, 0, f1)
    w = os.path.join(tmp, k + '.wav'); m3 = os.path.join(tmp, k + '.mp3'); sf.write(w, y, sr, subtype='PCM_16'); tp = TEMPO[l[1]]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w] + (['-filter:a', 'atempo=%.3f' % tp] if abs(tp - 1) > 0.005 else []) + ['-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', KBPS + 'k', m3], check=True)
    d = open(m3, 'rb').read(); out[k] = 'data:audio/mpeg;base64,' + base64.b64encode(d).decode('ascii'); rows.append((k, l[1], round(len(x) / sr, 2), round(len(y) / sr / tp, 2), round(float(l0), 1), round(float(pk), 2), len(d), round(cut, 2)))
print('lines', len(rows), '| seconds as given', round(sum(r[2] for r in rows), 1), '-> as carried', round(sum(r[3] for r in rows), 1), '| bytes', sum(r[6] for r in rows), '| as text', sum(len(v) for v in out.values()))
for v in ('f', 'm'): R = [r for r in rows if r[1] == v]; print(' ', v, who[v][0], 'lines', len(R), 'seconds each', min(r[3] for r in R), '…', max(r[3] for r in R), 'loudness as given', min(r[4] for r in R), '…', max(r[4] for r in R), 'LUFS; tempo', TEMPO[v], '; pauses shortened by', round(sum(r[7] for r in R), 1), 's in all')
open(os.path.join(SRC, 'okv_data.js'), 'w', encoding='utf-8').write("/* ===== [okv_data.js] ===== */\n  /* Okachimachi's announcements, recorded line by line with VOICEVOX — VOICEVOX:" + who['f'][0].split('（')[0] + " (tracks 1 and 3), VOICEVOX:" + who['m'][0].split('（')[0] + " (tracks 2 and 4) — and packed by voice/okv_pack.py; the numbers are those of src/okv_lines.js. Their use follows VOICEVOX's terms and each voice's own. */\n  window.AC_OKV = " + json.dumps(out, separators=(',', ':')) + ";\n")
json.dump({'voices': who, 'rows': rows}, open(os.path.join(tmp, 'report.json'), 'w'), ensure_ascii=False); print('report', os.path.join(tmp, 'report.json'))
