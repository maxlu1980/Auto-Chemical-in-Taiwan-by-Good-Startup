import asyncio, sys, json
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOK = {'taipei': "ISLE_x.city('hsr')", 'taichung': "ISLE_x.txg('hsr')", 'tainan': "ISLE_x.tnn('hsr')", 'zuoying': "ISLE_x.khh('hsr')"}
items = [x.split(':') for x in sys.argv[1].split(',')]
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        cur = None; pg = None
        for city, i, d in items:
            if city != cur:
                if pg: await pg.context.close()
                pg = await (await b.new_context(viewport={"width": 900, "height": 560})).new_page(); pg.on('pageerror', lambda e: print('ERR', e))
                await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_HOUR = 14;")
                await pg.goto("file://" + D + "/test_local.html#/island", wait_until="load", timeout=240000); await pg.wait_for_timeout(3000)
                await pg.evaluate("() => JSON.stringify(" + HOOK[city] + ")"); await pg.wait_for_timeout(3000)
                await pg.evaluate("() => ISLE_x.ev(\"(function(){ travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; })()\")")
                cur = city
            r = json.loads(await pg.evaluate("([i, d]) => JSON.stringify(ISLE_x.stWalk(i, d, 700))", [int(i), d]))
            print(city, i, d, json.dumps({k: r[k] for k in ['arrived', 'frames', 'samples', 'bad', 'worst', 'dmin', 'dlow', 'lowRecs', 'whyRecs', 'end']}), flush=True)
            for br in r['badRecs'][:4]: print('    ', br)
        await b.close()
asyncio.run(main())
