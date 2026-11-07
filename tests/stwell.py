import asyncio, sys, json
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOK = {'taipei': "ISLE_x.city('hsr')", 'taichung': "ISLE_x.txg('hsr')", 'tainan': "ISLE_x.tnn('hsr')", 'zuoying': "ISLE_x.khh('hsr')"}
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for city in sys.argv[1].split(','):
            pg = await (await b.new_context(viewport={"width": 600, "height": 400})).new_page()
            pg.on('pageerror', lambda e: print('ERR', e))
            await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_HOUR = 14;")
            await pg.goto("file://" + D + "/test_local.html#/island", wait_until="load", timeout=240000); await pg.wait_for_timeout(3000)
            await pg.evaluate("() => JSON.stringify(" + HOOK[city] + ")"); await pg.wait_for_timeout(3000)
            await pg.evaluate("() => ISLE_x.ev(\"(function(){ travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; })()\")")
            r = await pg.evaluate("() => JSON.stringify(ISLE_x.stWell())")
            print('=====', city)
            for w in json.loads(r):
                print(w['i'], w['q'], 'rays', w['rays'], 'hit', w['hit'])
                for s in w['by']: print('   ', s)
            await pg.close()
        await b.close()
asyncio.run(main())
