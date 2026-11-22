# (v89) the structure of a sample in the simulator: the survey's last stop (the concrete seen through, the build-up read out), and the guide's own 3D of it
#   python3 hs_struct.py <out dir> <guide> <scn,scn>        TK_FILE, VP=1280x720
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]); G = sys.argv[2]; SC = sys.argv[3].split(','); FILE = os.environ.get('TK_FILE', 'build/test_min.html'); VP = [int(v) for v in os.environ.get('VP', '1280x720').split('x')]; os.makedirs(OUT, exist_ok=True)
ROUTE = {'sl': 'sealant', 'ux': 'ureax-hg', 'po': 'protect-one', 'ad': 'adhesive'}; MOD = {'sl': 'SL', 'ux': 'UX', 'po': 'PO', 'ad': 'AD'}
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
PUMP = r"""window.__hsPump = function (n, dt, draw) { var R = HSIM.view() && HSIM.view().dbg.renderer; if (R && !R.__r0) { R.__r0 = R.render; } if (R) R.render = draw ? R.__r0 : function () {}; for (var i = 0; i < n; i++) { window.__now += dt; var q = window.__q; window.__q = []; for (var k = 0; k < q.length; k++) { try { q[k](window.__now); } catch (e) {} } } if (R) R.render = function () {}; };
if (!window.__qOn) { window.__qOn = 1; window.__q = []; window.__now = performance.now(); window.__raf0 = window.requestAnimationFrame; window.requestAnimationFrame = function (cb) { window.__q.push(cb); return window.__q.length; }; }"""
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("window.ISLE_TEST = 1; window.NO_GOV = true; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}")
        await pg.goto("file://" + D + "/" + FILE + "#/" + ROUTE[G], wait_until="commit", timeout=240000)
        for _ in range(240):
            if await pg.evaluate("(m) => !!(window.HSIM && window[m] && window[m]._sim && window[m].state && window[m].state())", MOD[G]): break
            await pg.wait_for_timeout(500)
        for sc in SC:
            await pg.evaluate("(a) => { try { if (HSIM.state()) HSIM.close(); } catch (e) {} window[a[0]].setScenario(a[1]); return 1; }", [MOD[G], sc]); await pg.wait_for_timeout(3000)
            await pg.screenshot(path="%s/%s_%s_guide.png" % (OUT, G, sc), timeout=240000)
            await pg.evaluate("(a) => { HSIM.open(a[0], window[a[1]], null); return 1; }", [G, MOD[G]])
            for _ in range(240):
                if await pg.evaluate("() => !!document.getElementById('hsStart')"): break
                await pg.wait_for_timeout(500)
            await pg.evaluate(PUMP); await pg.evaluate("() => { document.getElementById('hsStart').click(); return 1; }"); await pg.wait_for_timeout(300)
            info = await pg.evaluate("() => { var S = HSIM.state(); __hsPump(40, 33); return JSON.stringify({ kind: S.phases[S.phase].kind, n: (S.targets || []).length, last: S.targets && S.targets.length ? S.targets[S.targets.length - 1].k : null, pos: S.pos.toArray().map(function (v) { return +v.toFixed(2); }), pitch: +S.look.pitch.toFixed(2) }); }")
            log(sc, info); await pg.evaluate("() => __hsPump(2, 33, true)"); await pg.screenshot(path="%s/%s_%s_survey.png" % (OUT, G, sc), timeout=240000)
            I = json.loads(info)
            if I['last'] == '__struct':
                await pg.evaluate("() => { var S = HSIM.state(); for (var k = 0; k < S.targets.length - 1; k++) { __hsPump(20, 33); S.tap = true; __hsPump(2, 33); } __hsPump(45, 33); __hsPump(2, 33, true); return 1; }")
                await pg.wait_for_timeout(400); await pg.screenshot(path="%s/%s_%s_struct.png" % (OUT, G, sc), timeout=240000)
            await pg.evaluate("() => { try { HSIM.close(); } catch (e) {} window.requestAnimationFrame = window.__raf0; window.__qOn = 0; var q = window.__q || []; window.__q = []; q.forEach(function (cb) { try { window.__raf0(cb); } catch (e) {} }); return 1; }")
        log('errors', errs[:4]); await b.close()
asyncio.run(main())
