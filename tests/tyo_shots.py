# Okachimachi seen from fixed viewpoints (the ones of the reference photographs): python3 tyo_shots.py <out dir> <tier low|mid|high> <view,view,...> [hour]
import asyncio, sys, json, time, os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; TIER = sys.argv[2]; WANT = sys.argv[3].split(','); HOUR = sys.argv[4] if len(sys.argv) > 4 else '14'; FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
# local coordinates (one unit 1.2 m; +z north, +x west): the eye, what it looks at
VIEWS = { 'p34n': ([6.5, 8.85, -69], [6.4, 8.75, -20]), 'p12s': ([-6.5, 8.85, -11.5], [-6.5, 8.75, -70]), 'p34s': ([6.5, 8.85, -30], [6.5, 8.5, 10]), 'pdoor': ([5.4, 8.7, -44], [3.2, 8.1, -38]),
    'gate': ([12.4, 1.55, 10.8], [4, 1.5, 8.5]), 'hall': ([8.6, 1.55, 9.6], [-6.5, 2.4, 0]), 'stair': ([6.5, 1.55, 8.5], [6.5, 4.5, -3]),
    'exitN': ([27, 1.5, 17], [13, 3.4, 8]), 'corner': ([23, 1.6, 27.5], [10, 3.0, 16.5]), 'gates': ([12.0, 1.5, 12.2], [8.6, 1.2, 9.6]), 'p34d': ([6.5, 8.9, -30], [9.6, 8.3, -18]), 'p12n': ([-6.5, 8.85, -40], [-6.5, 8.6, -5]), 'arch': ([21.5, 1.5, 10.8], [13, 2.5, 10.8]), 'span': ([24, 1.6, 34], [10, 5.2, 16]), 'west': ([30, 1.6, -20], [13, 5, -30]), 'aerial': ([60, 34, 40], [0, 6, -20]) }
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": 1280, "height": 760}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:400])); pg.on("console", lambda m: errs.append(m.text[:300]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_HOUR = %s; window.ISLE_TIER = '%s'; window.ISLE_TKTIER = '%s'; %s" % (HOUR, TIER, os.environ.get('TKTIER', TIER), 'window.FAST3D = true;' if TIER == 'low' else ''))
        t = time.time(); await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="load", timeout=240000)
        while time.time() - t < 300:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(1000)
        await pg.evaluate("() => ISLE_x.ev(\"(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; var t = document.querySelector('.isle__talk'); if (t) t.hidden = true; root.classList.add('is-shot'); })()\")")
        await pg.add_style_tag(content=".isle.is-shot .isle__hud, .isle.is-shot #isTkBar, .isle.is-shot .isle__toast, .isle.is-shot .isle__banner, .isle.is-shot .isle__ann, .isle.is-shot .isle__nav, .isle.is-shot button { visibility: hidden !important; }")
        log('ready', round(time.time() - t, 1))
        STEP = float(os.environ.get('STEP', '0'))
        if STEP: print('trains', await pg.evaluate("(s) => JSON.stringify(ISLE_x.tkStep(s))", STEP), flush=True)
        print('oka', await pg.evaluate("() => ISLE_x.ev('JSON.stringify({ oka: !!TK.T.oka, doors: TK.T.oka ? TK.T.oka.doors.map(function (d) { return [d.ti, +d.f.toFixed(2), d.A.length, d.B.length]; }) : null, leds: TK.T.oka ? Object.keys(TK.T.oka.led).map(function (k) { return TK.T.oka.led[k].key; }) : null, tier: TK.T.low ? \\'low\\' : \\'hi\\' })')"), flush=True)
        for v in WANT:
            e, l = VIEWS[v]
            await pg.evaluate("([e, l]) => ISLE_x.ev('(function(){ var T = TK.T, a = T.toW(' + e[0] + ', 0, ' + e[2] + '), b = T.toW(' + l[0] + ', 0, ' + l[2] + '); ISLE_x.camHold([a.x, T.Y + ' + e[1] + ', a.z], [b.x, T.Y + ' + l[1] + ', b.z]); var w = T.toW(' + e[0] + ', 0, ' + e[2] + '); pos.set(w.x, T.Y + ' + (e[1] - 1.33) + ', w.z); luna.root.position.copy(pos); luna.root.visible = false; return 1; })()')", [e, l])
            await pg.wait_for_timeout(1500); t1 = time.time()
            try: await pg.screenshot(path="%s/%s_%s.png" % (OUT, v, TIER), timeout=240000); log('shot', v, round(time.time() - t1, 1))
            except Exception as ex: log('shot failed', v, str(ex)[:120])
        print('errors', errs[:4]); await b.close()
asyncio.run(main())
