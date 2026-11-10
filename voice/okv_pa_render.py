# a recording as it is heard in the game: played through the page's own loudspeaker chain (the JavaScript of src/island_ax.js — OKV_PA, okvIR,
# okvPa — run in Chromium's offline audio graph) for a place: plat (on a platform), hall (the concourse), far (the street)
#   python3 okv_pa_render.py <src/island_ax.js> <in.wav> <out.wav> [plat|hall|far] [gain 0–1]
import asyncio, sys, re, base64, numpy as np, soundfile as sf
from playwright.async_api import async_playwright
JS, IN, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; MODE = sys.argv[4] if len(sys.argv) > 4 else 'plat'; GAIN = float(sys.argv[5]) if len(sys.argv) > 5 else 0.85
async def main():
    y, sr = sf.read(IN, dtype='float32'); y = y.mean(axis=1) if y.ndim > 1 else y
    src = open(JS, encoding='utf-8').read(); m = re.search(r"  var OKV_PA = .*?\n(?=  /\* at Okachimachi every announcement)", src, re.S); src = m.group(0) if m else src
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(); await pg.goto('about:blank')
        res = await pg.evaluate("""async ([src, b64, sr, mode, gain]) => { const [P, ir, pa] = new Function(src + '; return [OKV_PA, okvIR, okvPa];')();
            const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); const f = new Float32Array(u8.buffer);
            const SR = 48000, c = new OfflineAudioContext(2, Math.ceil((f.length / sr + 2.4) * SR), SR), buf = c.createBuffer(1, f.length, sr); buf.copyToChannel(f, 0);
            const B = pa(c, c.destination); B.set(mode, true); B.g.gain.value = gain; const n = c.createBufferSource(); n.buffer = buf; n.connect(B.g); n.start(0.05);
            const r = await c.startRendering(), out = new Float32Array(r.length * 2); out.set(r.getChannelData(0), 0); out.set(r.getChannelData(1), r.length);
            const o8 = new Uint8Array(out.buffer); let s = ''; for (let i = 0; i < o8.length; i += 32768) s += String.fromCharCode.apply(null, o8.subarray(i, i + 32768)); return [btoa(s), r.length]; }""",
            [src, base64.b64encode(y.tobytes()).decode(), sr, MODE, GAIN])
        await b.close()
    a = np.frombuffer(base64.b64decode(res[0]), dtype='float32'); n = res[1]; st = np.stack([a[:n], a[n:]], axis=1); sf.write(OUT, st, 48000)
    print(OUT, MODE, 'peak %.3f' % float(np.abs(st).max()), 'rms %.4f' % float(np.sqrt((st ** 2).mean())))
asyncio.run(main())
