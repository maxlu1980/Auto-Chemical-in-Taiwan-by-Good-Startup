# the film's waltz and the title's, rendered offline from the source itself (no 3D): loudness per second (dBFS RMS), the peak, a WAV each
import asyncio, sys, base64, json, re
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(D + '/src/tw_cine_c.js', encoding='utf-8').read(); a = s.index('  function orch(') if False else s.index('  /* ---------- (v72) the opening'); b = s.index('  /* ---------- (v62) the opening as one flight')
LIB = s[a:b] + '\nwindow.W3 = { score: score, scoreLoop: scoreLoop };'
JS = """async ([kind, night, secs]) => {
  const sr = 44100, T = 40, len = Math.ceil(sr * secs); const ctx = new OfflineAudioContext(2, len, sr);
  const A = kind === 'film' ? W3.score(ctx, ctx.destination, T, night, 0, 36.0) : W3.scoreLoop(ctx, ctx.destination, night);
  const buf = await ctx.startRendering(); const L = buf.getChannelData(0), R = buf.getChannelData(1); let pk = 0; const rms = [];
  for (let s = 0; s < Math.ceil(len / sr); s++) { let a = 0, n = 0; for (let i = s * sr; i < Math.min(len, (s + 1) * sr); i++) { const v = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (v > pk) pk = v; a += L[i] * L[i] + R[i] * R[i]; n += 2; } rms.push(+(20 * Math.log10(Math.sqrt(a / Math.max(1, n)) + 1e-9)).toFixed(1)); }
  const nan = L.some(x => !isFinite(x)); const nS = len, dv = new DataView(new ArrayBuffer(44 + nS * 4)); const w = (o, s2) => { for (let i = 0; i < s2.length; i++) dv.setUint8(o + i, s2.charCodeAt(i)); };
  w(0, 'RIFF'); dv.setUint32(4, 36 + nS * 4, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, nS * 4, true);
  for (let i = 0; i < nS; i++) { dv.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); dv.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  const u8 = new Uint8Array(dv.buffer); let bin = ''; const CH = 0x8000; for (let i = 0; i < u8.length; i += CH) bin += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
  return { peak: +pk.toFixed(3), rms: rms, nan: nan, n: A.n, wav: btoa(bin) }; }"""
os.makedirs(D + '/tests/out/sc3', exist_ok=True)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:400]))
        await pg.goto("about:blank"); await pg.add_script_tag(content=LIB)
        for kind, night, secs in [('film', False, 42.2), ('loop', False, 90), ('film', True, 42.2)]:
            r = await pg.evaluate(JS, [kind, night, secs]); tag = kind + ('_night' if night else '_day')
            open(D + '/tests/out/sc3/%s.wav' % tag, 'wb').write(base64.b64decode(r.pop('wav'))); print(tag, json.dumps(r))
        print('errors', errs); await b.close()
asyncio.run(main())
