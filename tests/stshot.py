import asyncio, sys, json, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOK = {'taipei': "ISLE_x.city('hsr')", 'taichung': "ISLE_x.txg('hsr')", 'tainan': "ISLE_x.tnn('hsr')", 'zuoying': "ISLE_x.khh('hsr')"}
# argv: tag  'city:i:dir:u,city:i:dir:u,...'  [mob]
tag = sys.argv[1]; items = [x.split(':') for x in sys.argv[2].split(',')]; mob = len(sys.argv) > 3 and sys.argv[3] == 'mob'
async def main():
    os.makedirs(D + '/tests/out/' + tag, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        cur = None; pg = None
        for it in items:
            city, i, d, u = it[0], int(it[1]), it[2], float(it[3])
            if city != cur:
                if pg: await pg.context.close()
                ctx = await b.new_context(viewport={"width": 390, "height": 760} if mob else {"width": 900, "height": 560}, has_touch=mob, is_mobile=mob)
                pg = await ctx.new_page(); pg.on('pageerror', lambda e: print('ERR', e))
                await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_HOUR = 14;")
                await pg.goto("file://" + D + "/test_local.html#/island", wait_until="load", timeout=240000); await pg.wait_for_timeout(3000)
                await pg.evaluate("() => JSON.stringify(" + HOOK[city] + ")"); await pg.wait_for_timeout(3000)
                await pg.evaluate("() => ISLE_x.ev(\"(function(){ travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; var t = document.querySelector('.isle__talk'); if (t) t.hidden = true; })()\")")
                cur = city
            r = await pg.evaluate("([i, d, u]) => JSON.stringify(ISLE_x.stPlace(i, d, u))", [i, d, u]); print(city, i, d, u, r, flush=True)
            if os.environ.get("PRE"): print(await pg.evaluate("(js) => ISLE_x.ev(js)", os.environ["PRE"]))
            await pg.wait_for_timeout(600)
            await pg.screenshot(path='%s/tests/out/%s/%s_%d_%s_%02d.png' % (D, tag, city, i, d, int(u * 100)), timeout=240000)
        await b.close()
asyncio.run(main())
