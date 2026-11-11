# (v85) what the two depth passes cost beside the picture itself: the same frame drawn several times with neither, with the occlusion, with the
# reflections, with both (software rendering: only the ratios mean anything)        python3 fx_perf.py [tier] [WxH]
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIER = sys.argv[1] if len(sys.argv) > 1 else 'high'; VP = (sys.argv[2] if len(sys.argv) > 2 else '960x540').split('x'); FILE = os.environ.get('TK_FILE', 'build/test_min.html')
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": int(VP[0]), "height": int(VP[1])}, device_scale_factor=1); pg = await ctx.new_page()
        await pg.add_init_script("window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_HOUR = 14; window.ISLE_TIER = '%s'; window.ISLE_TKTIER = '%s'; window.ISLE_DPR = 1; window.ISLE_WX = { code: %s };" % (TIER, TIER, os.environ.get('WX', '63')))
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 420:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        await pg.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; var T = TK.T, a = T.toW(27, 0, 17), b = T.toW(13, 0, 8); ISLE_x.camHold([a.x, T.Y + 1.5, a.z], [b.x, T.Y + 3.4, b.z]); return 1; })()")
        await pg.wait_for_timeout(9000)
        r = await pg.evaluate(EV, """(function(){ var F = POST.fx, gl = R3.getContext(), out = {}, px = new Uint8Array(4); function run(ao, ssr) { F.ao = ao; F.ssr = ssr; var n = 3, t = performance.now(); for (var i = 0; i < n; i++) { POST.render(scene, cam, i); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return Math.round((performance.now() - t) / n); }
            run(false, false); out.none = run(false, false); out.ao = run(true, false); out.ssr = run(false, true); out.both = run(true, true); out.none2 = run(false, false); var info = R3.info.render; out.tris = info.triangles; out.calls = info.calls; return JSON.stringify(out); })()""")
        log(TIER, 'x'.join(VP), r); await b.close()
asyncio.run(main())
