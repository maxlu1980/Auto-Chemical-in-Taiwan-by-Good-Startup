# the English recordings (E01.wav … in one folder, made by voice/okv_en_gen.mjs) into the page: trimmed, levelled like the Japanese ones
# (-18 LUFS, a soft ceiling), one channel, MP3 — written as src/okv_data_en.js (window.AC_OKV_EN = { 'E01': data URI, … })
#   python3 okv_pack_en.py <wav dir> <src dir> [kbps] [credit, e.g. "Kokoro-82M (af_heart, am_michael)"]
import sys, os, re, json, base64, subprocess, tempfile
import numpy as np, soundfile as sf, pyloudnorm as pyln
IN, SRC = sys.argv[1], sys.argv[2]; KBPS = sys.argv[3] if len(sys.argv) > 3 else '32'; WHO = sys.argv[4] if len(sys.argv) > 4 else 'Kokoro-82M'; LUFS = -18
T = json.loads(re.search(r'var OKV_TE = (\{.*\});', open(os.path.join(SRC, 'okv_lines_en.js'), encoding='utf-8').read(), re.S).group(1)); IDS = sorted(v[0] for v in T.values())
out = {}; tot = 0.0
with tempfile.TemporaryDirectory() as td:
    for i in IDS:
        y, sr = sf.read(os.path.join(IN, i + '.wav'), dtype='float64'); y = y.mean(axis=1) if y.ndim > 1 else y
        a = np.abs(y); th = max(a.max() * 0.012, 1e-4); nz = np.nonzero(a > th)[0]; assert len(nz), i
        y = y[max(0, nz[0] - int(0.03 * sr)):min(len(y), nz[-1] + int(0.12 * sr))]; f = int(0.01 * sr); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
        y = y * 10 ** ((LUFS - pyln.Meter(sr).integrated_loudness(y)) / 20); pk = np.abs(y).max()
        if pk > 0.89: y = np.tanh(y / pk * 1.2) / np.tanh(1.2) * 0.89
        w = os.path.join(td, i + '.wav'); m3 = os.path.join(td, i + '.mp3'); sf.write(w, y, sr, subtype='PCM_16')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-af', 'highpass=f=90', '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', KBPS + 'k', m3], check=True)
        out[i] = 'data:audio/mpeg;base64,' + base64.b64encode(open(m3, 'rb').read()).decode(); tot += len(y) / sr
js = "/* ===== [okv_data_en.js] ===== */\n  /* Okachimachi's English announcements, recorded line by line with " + WHO + " (Apache-2.0); made by voice/okv_en_gen.mjs, packed by voice/okv_pack_en.py */\n  window.AC_OKV_EN = " + json.dumps(out) + ";\n"
open(os.path.join(SRC, 'okv_data_en.js'), 'w', encoding='utf-8').write(js); print(len(out), 'lines, %.1f s of speech,' % tot, len(js), 'bytes as text')
