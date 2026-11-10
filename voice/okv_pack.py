# Okachimachi's recorded announcements, from the files VOICEVOX wrote (001_….wav … 045_….wav) to what the page carries:
# each line cut to its speech (a short breath kept either side), brought to one loudness, lightly cleaned (the page's loudspeaker filter does
# the rest), encoded as mono MP3 and written into src/okv_data.js as window.AC_OKV = { '001': 'data:audio/mpeg;base64,…', … }
#   python3 okv_pack.py <folder of WAVs> <src dir of the page> [kbps]
import sys, os, re, json, base64, subprocess, tempfile
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfiltfilt
IN, SRC = sys.argv[1], sys.argv[2]; KBPS = sys.argv[3] if len(sys.argv) > 3 else '40'; N = 45; LUFS = -18.0
files = {}
for root, _, names in os.walk(IN):
    for f in names:
        m = re.match(r'^(\d{1,3})[_\-. ]', f)
        if m and f.lower().endswith('.wav'): files.setdefault('%03d' % int(m.group(1)), os.path.join(root, f))
miss = ['%03d' % i for i in range(1, N + 1) if '%03d' % i not in files]; extra = sorted(k for k in files if int(k) > N or int(k) < 1)
print('found', len(files), 'missing', miss, 'beyond the list', extra)
out = {}; rows = []; tmp = tempfile.mkdtemp()
for k in sorted(files):
    if int(k) < 1 or int(k) > N: continue
    x, sr = sf.read(files[k], always_2d=True); x = x.mean(axis=1).astype(np.float64)
    # the speech itself: from the first to the last 10 ms frame above -46 dB of the line's peak, 70 ms and 140 ms kept around it
    fr = int(sr * 0.01); env = np.array([np.abs(x[i:i + fr]).max() for i in range(0, max(1, len(x) - fr), fr)]); thr = env.max() * 10 ** (-46 / 20); on = np.where(env > thr)[0]
    a = max(0, on[0] * fr - int(sr * 0.07)); b = min(len(x), (on[-1] + 1) * fr + int(sr * 0.14)); y = x[a:b]
    y = sosfiltfilt(butter(2, 110, 'hp', fs=sr, output='sos'), y)
    meter = pyln.Meter(sr); l0 = meter.integrated_loudness(np.concatenate([y, y]) if len(y) < sr * 0.9 else y); y = y * 10 ** ((LUFS - l0) / 20)
    pk = np.abs(y).max(); lim = 10 ** (-1.5 / 20)
    if pk > lim: y = np.tanh(y / pk * 1.6) / np.tanh(1.6) * lim   # a soft ceiling for the odd peak
    f0 = min(len(y), int(sr * 0.008)); y[:f0] *= np.linspace(0, 1, f0); f1 = min(len(y), int(sr * 0.03)); y[-f1:] *= np.linspace(1, 0, f1)
    w = os.path.join(tmp, k + '.wav'); m3 = os.path.join(tmp, k + '.mp3'); sf.write(w, y, sr, subtype='PCM_16')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', KBPS + 'k', m3], check=True)
    d = open(m3, 'rb').read(); out[k] = 'data:audio/mpeg;base64,' + base64.b64encode(d).decode('ascii'); rows.append((k, round(len(y) / sr, 2), round(l0, 1), len(d)))
tot = sum(r[3] for r in rows); print('lines', len(rows), 'seconds', round(sum(r[1] for r in rows), 1), 'bytes', tot, 'as text', sum(len(v) for v in out.values()))
for r in rows[:3] + rows[-2:]: print(' ', r)
open(os.path.join(SRC, 'okv_data.js'), 'w', encoding='utf-8').write("/* ===== [okv_data.js] ===== */\n  /* Okachimachi's announcements, recorded line by line (voice/okv_pack.py; the numbers are those of src/okv_lines.js) */\n  window.AC_OKV = " + json.dumps(out, separators=(',', ':')) + ";\n")
if miss: print("NOTE: lines without a recording are spoken by the device's voice:", miss)
