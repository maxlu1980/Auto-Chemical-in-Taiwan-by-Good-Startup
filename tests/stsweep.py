import asyncio, sys, json, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOK = {'taipei': "ISLE_x.city('hsr')", 'taichung': "ISLE_x.txg('hsr')", 'tainan': "ISLE_x.tnn('hsr')", 'zuoying': "ISLE_x.khh('hsr')"}
cities = sys.argv[1].split(','); vw = sys.argv[2] if len(sys.argv) > 2 else 'desk'; tag = sys.argv[3] if len(sys.argv) > 3 else 'sw'
US = [0.12, 0.3, 0.5, 0.7, 0.88]
VP = {'desk': (900, 560), 'mob': (390, 760)}[vw]
def bad(r): return r['occ'] >= 0.3 or r['near'] >= 0.2 or r['ring'] >= 0.5 or r['slab'] or r['d'] < 1.2
async def main():
    os.makedirs(D + '/tests/out/' + tag, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for city in cities:
            ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=(vw == 'mob'), is_mobile=(vw == 'mob'))
            pg = await ctx.new_page(); pg.on('pageerror', lambda e: print('ERR', e))
            await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_HOUR = 14;")
            await pg.goto("file://" + D + "/test_local.html#/island", wait_until="load", timeout=240000); await pg.wait_for_timeout(3000)
            await pg.evaluate("() => JSON.stringify(" + HOOK[city] + ")"); await pg.wait_for_timeout(3000)
            await pg.evaluate("() => ISLE_x.ev(\"(function(){ travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; })()\")")
            ramps = json.loads(await pg.evaluate("() => JSON.stringify(ISLE_x.stRamps())"))
            out = []; nb = 0
            for rp in ramps:
                for d in ['up', 'down']:
                    for u in US:
                        r = json.loads(await pg.evaluate("([i, d, u]) => JSON.stringify(ISLE_x.stPlace(i, d, u))", [rp[0], d, u]))
                        r.update({'i': rp[0], 'dir': d, 'u': u}); out.append(r)
                        if bad(r):
                            nb += 1; print(city, 'BAD', json.dumps(r), flush=True)
                            if nb <= 14: await pg.wait_for_timeout(300); await pg.screenshot(path='%s/tests/out/%s/%s_%d_%s_%02d.png' % (D, tag, city, rp[0], d, int(u * 100)), timeout=240000)
            ds = sorted(r['d'] for r in out)
            print(city, vw, 'placements', len(out), 'bad', nb, 'minD', ds[0] if ds else None, 'p10D', ds[len(ds) // 10] if ds else None, flush=True)
            json.dump(out, open('%s/tests/out/%s/%s_%s.json' % (D, tag, city, vw), 'w'))
            await ctx.close()
        await b.close()
asyncio.run(main())
