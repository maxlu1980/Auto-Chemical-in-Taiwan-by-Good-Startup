# (v85) Okachimachi with the two effects that read the depth: for each view a picture with them, and the two buffers by themselves (the occlusion, the
# reflections, the smoothness each surface wrote); the weather set by hand (WX: a WMO code — 63 rain, 1 clear)
#   python3 fx_shots.py <out dir> <tier mid|high> <view,view> [hour] [modes: on,off,aoonly,ao,ssr,gloss,plain]        WX=63  VP=960x570
#   PRE='<js>' is run once before the views (e.g. to stand vehicles in a row), EVAL='<js>' once after them and its result printed; 'plain' leaves the settings alone
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]); TIER = sys.argv[2]; WANT = sys.argv[3].split(','); HOUR = sys.argv[4] if len(sys.argv) > 4 else '14'; MODES = (sys.argv[5] if len(sys.argv) > 5 else 'on').split(','); FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
VPS = os.environ.get('VP', '960x570').split('x'); WX = os.environ.get('WX', '')
VIEWS = { 'show1': ([47, 4.2, 43], [47, 0.6, 30]), 'show2': ([70, 4.2, 43], [70, 0.6, 30]), 'show3': ([40, 1.3, 36.5], [52, 0.8, 29]), 'taxi': ([22.6, 1.35, 17.2], [18.5, 0.75, 13.4]), 'taxi2': ([15.2, 1.2, 9.6], [18.5, 0.7, 13.4]), 'pole': ([20.5, 1.6, 2], [26, 6, -22]), 'bld2': ([20.5, 1.6, 14], [34, 10, -4]), 'over': ([40, 16, 44], [18, 0, 22]), 'road': ([40, 1.6, 30], [10, 1.4, 29]), 'side': ([24.5, 1.6, -6], [24.5, 1.6, -60]), 'bld': ([22, 1.6, 40], [34, 9, 12]), 'p34n': ([6.5, 8.85, -69], [6.4, 8.75, -20]), 'p12s': ([-6.5, 8.85, -11.5], [-6.5, 8.75, -70]), 'pdoor': ([5.4, 8.7, -44], [3.2, 8.1, -38]), 'gate': ([12.4, 1.55, 10.8], [4, 1.5, 8.5]), 'hall': ([8.6, 1.55, 9.6], [-6.5, 2.4, 0]),
    'exitN': ([27, 1.5, 17], [13, 3.4, 8]), 'corner': ([23, 1.6, 27.5], [10, 3.0, 16.5]), 'arch': ([21.5, 1.5, 10.8], [13, 2.5, 10.8]), 'west': ([30, 1.6, -20], [13, 5, -30]), 'street': ([27, 1.2, 24], [14, 1.6, 12]), 'low': ([24, 0.7, 20], [12, 1.4, 10]) }
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": int(VPS[0]), "height": int(VPS[1])}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append(m.text[:600]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_HOUR = %s; window.ISLE_TIER = '%s'; window.ISLE_TKTIER = '%s'; window.ISLE_DPR = 1; %s" % (HOUR, TIER, os.environ.get('TKTIER', TIER), ("window.ISLE_WX = { code: %s };" % WX) if WX else ''))
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 420:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        log('ready', round(time.time() - t0, 1)); await pg.wait_for_timeout(1500)
        await pg.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; var t = document.querySelector('.isle__talk'); if (t) t.hidden = true; root.classList.add('is-shot'); return 1; })()")
        await pg.add_style_tag(content=".isle.is-shot .isle__hud, .isle.is-shot #isTkBar, .isle.is-shot .isle__toast, .isle.is-shot .isle__banner, .isle.is-shot .isle__ann, .isle.is-shot .isle__nav, .isle.is-shot .isle__msg, .isle.is-shot button { visibility: hidden !important; }")
        if os.environ.get('PRE'): log('pre', await pg.evaluate(EV, os.environ['PRE']))
        for v in WANT:
            e, l = VIEWS[v]
            await pg.evaluate(EV, "(function(){ var T = TK.T, a = T.toW(%s, 0, %s), b = T.toW(%s, 0, %s), w = T.toW(%s, 0, %s); pos.set(w.x, T.Y + %s, w.z); vel.set(0, 0, 0); luna.root.position.copy(pos); luna.root.visible = false; ISLE_x.camHold([a.x, T.Y + %s, a.z], [b.x, T.Y + %s, b.z]); return 1; })()" % (e[0], e[2], l[0], l[2], e[0], e[2] + 3, max(0.0, e[1] - 1.5), e[1], l[1]))
            await pg.wait_for_timeout(2500)
            for m in MODES:
                code = { 'plain': "1;", 'on': "ISLE_x.q2({ ao: 'on', ssr: 'on' }); POST.final.uniforms.uFxDbg.value = 0;", 'off': "ISLE_x.q2({ ao: 'off', ssr: 'off' }); POST.final.uniforms.uFxDbg.value = 0;", 'aoonly': "ISLE_x.q2({ ao: 'on', ssr: 'off' }); POST.final.uniforms.uFxDbg.value = 0;", 'ao': "ISLE_x.q2({ ao: 'on', ssr: 'on' }); POST.final.uniforms.uFxDbg.value = 1;", 'ssr': "ISLE_x.q2({ ao: 'on', ssr: 'on' }); POST.final.uniforms.uFxDbg.value = 2;", 'gloss': "ISLE_x.q2({ ao: 'on', ssr: 'on' }); POST.final.uniforms.uFxDbg.value = 3;" }[m]
                await pg.evaluate(EV, "(function(){ " + code + " return 1; })()"); await pg.wait_for_timeout(1800); t1 = time.time()
                try: await pg.screenshot(path="%s/%s_%s.png" % (OUT, v, m), timeout=240000)
                except Exception as ex: log('shot skipped', v, m)
                log('shot', v, m, round(time.time() - t1, 1), await pg.evaluate("() => { try { return JSON.stringify(Object.assign(ISLE_x.fx(), { wet: +KIT.U.uWet.value.toFixed(2) })); } catch (e) { return 'no fx'; } }"))
        if os.environ.get('EVAL'): log('eval', await pg.evaluate(EV, os.environ['EVAL']))
        log('errors', errs[:3]); await b.close()
asyncio.run(main())
