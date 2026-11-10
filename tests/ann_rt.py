# Okachimachi's announcements at the station's own pace (nothing sped up): the listener on the west platform for some minutes, then what was
# said and when, and what had to be left out — to see that a train's announcements follow one another without crowding
#   python3 ann_rt.py <seconds> [x z y of the listener]
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECS = int(sys.argv[1]); AT = json.loads(sys.argv[2]) if len(sys.argv) > 2 else [6.5, -40, 9.1]; FILE = os.environ.get('TK_FILE', 'build/test_min.html')
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 1280, "height": 760}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}")
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 300:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        await pg.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; R3.render = function () {}; if (POST) POST.render = function () {}; return 1; })()")
        await pg.evaluate("() => { ISLE_x.sndTap(); document.dispatchEvent(new Event('pointerup')); }"); await pg.mouse.click(640, 380); await pg.wait_for_timeout(3000)
        await pg.evaluate("(l) => ISLE_x.annAt(l)", AT)
        await pg.evaluate(EV, "(function(){ window.__al = []; var p0 = annPlay; annPlay = function (a) { window.__al.push([+ANN.t.toFixed(1), 'play', a.key, +(ANN.t - a.t0).toFixed(1)]); return p0.apply(this, arguments); }; var q0 = annPush; annPush = function (a) { window.__al.push([+ANN.t.toFixed(1), 'push', a.key]); return q0.apply(this, arguments); }; return 1; })()")
        seen = {}; t0 = time.time()
        while time.time() - t0 < SECS:
            await pg.wait_for_timeout(2000); a = json.loads(await pg.evaluate("() => JSON.stringify(ISLE_x.ann())"))
            for r in a['log']: seen[(r['key'], r['src'][:14])] = r
        ev = json.loads(await pg.evaluate(EV, "JSON.stringify(window.__al)")); ok = await pg.evaluate("() => ISLE_x.okv()")
        played = [e for e in ev if e[1] == 'play']; pushed = [e for e in ev if e[1] == 'push']
        print('recordings', ok, '| pushed', len(pushed), 'played', len(played), '| errors', errs[:2])
        for e in ev:
            if e[1] == 'play': print('%6.1f  play  %-9s waited %4.1f s' % (e[0], e[2], e[3]))
        from collections import Counter
        cp = Counter(e[2] for e in pushed); cl = Counter(e[2] for e in played); print('left out:', {k: cp[k] - cl.get(k, 0) for k in cp if cp[k] > cl.get(k, 0)})
        a = json.loads(await pg.evaluate("() => JSON.stringify(ISLE_x.ann())")); print('last', json.dumps(a['log'][-6:], ensure_ascii=False)[:900])
        await b.close()
asyncio.run(main())
