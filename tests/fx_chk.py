# (v85) Okachimachi's picture and models:
#   - the post chain reads the depth: ambient occlusion and reflections on the screen are on at Okachimachi (and only there), each can be switched,
#     each has its row in the quality card; in the rain the wet street mirrors (the picture with the reflections differs from the one without)
#   - under a roof the ground stays dry: the place's boxes are kept by day in the rain (unlit), not on a dry day
#   - the vehicles' bodies are surfaces: every kind builds, has no stray point, stays inside its own length, width and height, has its arches
#   - the buildings stand in relief, the side streets have their poles
#   - (v88) the passes over the picture declare their samplers highp
#   python3 fx_chk.py [tier]            (TK_FILE=guide.min.html for the shipped page: fewer checks, no test hooks)
import asyncio, sys, json, time, os, io
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIER = sys.argv[1] if len(sys.argv) > 1 else 'high'; FILE = os.environ.get('TK_FILE', 'build/test_min.html'); RES = []
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def ok(name, cond, info=''): RES.append((name, bool(cond))); log('OK  ' if cond else 'FAIL', name, info)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": 800, "height": 480}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append(m.text[:600]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_HOUR = 14; window.ISLE_TIER = '%s'; window.ISLE_TKTIER = '%s'; window.ISLE_DPR = 1; window.ISLE_WX = { code: 63 };" % (TIER, TIER))
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 420:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        log('ready', round(time.time() - t0, 1)); await pg.wait_for_timeout(1500)
        await pg.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; var t = document.querySelector('.isle__talk'); if (t) t.hidden = true; var T = TK.T, a = T.toW(24, 0, 20), b = T.toW(12, 0, 10); ISLE_x.camHold([a.x, T.Y + 0.8, a.z], [b.x, T.Y + 1.4, b.z]); return 1; })()")
        await pg.wait_for_timeout(4000)
        hi = TIER in ('mid', 'high')
        f = await pg.evaluate("() => ISLE_x.fx()"); log('fx', json.dumps(f))
        if hi:
            ok('the chain reads the depth', f['post'] and f['ok']); ok('(v88) and reads it at full precision (the samplers declared highp: a phone hands the depth back as a 16-bit float otherwise)', f.get('hp') is True, 'float bits kept [low, medium, high]: %s' % f.get('prec')); ok('at Okachimachi both are on', f['place'] and f['ao'] and f['ssr'], json.dumps(f['qa']))
            n0 = f['n']; await pg.wait_for_timeout(2500); n1 = (await pg.evaluate("() => ISLE_x.fx()"))['n']; ok('frames are drawn with them', n1 > n0, '%d -> %d' % (n0, n1))
            wet = await pg.evaluate(EV, "+KIT.U.uWet.value.toFixed(2)"); ok('the street is wet (the test’s rain)', wet > 0.4, wet)
            zn = await pg.evaluate(EV, "KIT.U.uZn.value"); ok('by day in the rain the roofs’ boxes are kept (dry under them)', zn >= 8, zn)
            dark = await pg.evaluate(EV, "(function(){ var a = KIT.U.uZa.value, n = KIT.U.uZn.value, s = 0; for (var i = 0; i < n; i++) s += a[i].w; return +s.toFixed(3); })()"); ok('and unlit by day', dark < 0.05, dark)
            from PIL import Image, ImageChops, ImageStat
            async def shot(): return Image.open(io.BytesIO(await pg.screenshot(timeout=240000))).convert('RGB').crop((0, 260, 800, 480))
            A = await shot(); await pg.evaluate(EV, "(function(){ ISLE_x.q2({ ssr: 'off' }); return 1; })()"); await pg.wait_for_timeout(2500)
            f2 = await pg.evaluate("() => ISLE_x.fx()"); ok('the reflections can be switched off by themselves', f2['ssr'] is False and f2['ao'] is True, json.dumps(f2['qa']))
            B = await shot(); d = sum(ImageStat.Stat(ImageChops.difference(A, B)).mean) / 3; ok('the wet street mirrors (the picture differs without them)', d > 1.2, round(d, 2))
            await pg.evaluate(EV, "(function(){ ISLE_x.q2({ ssr: 'on', ao: 'off' }); return 1; })()"); await pg.wait_for_timeout(2000); f3 = await pg.evaluate("() => ISLE_x.fx()"); ok('and the occlusion', f3['ao'] is False and f3['ssr'] is True)
            await pg.evaluate(EV, "(function(){ ISLE_x.q2({ ssr: 'auto', ao: 'auto' }); return 1; })()"); await pg.wait_for_timeout(1500); f4 = await pg.evaluate("() => ISLE_x.fx()"); ok('“auto” follows the level', f4['ao'] and f4['ssr'])
            rows = await pg.evaluate(EV, "(function(){ qualCard(); var c = document.getElementById('isCard'), r = c ? [].map.call(c.querySelectorAll('.isle__qcur[data-c]'), function (e) { return e.getAttribute('data-c'); }) : []; return r.join(','); })()")
            ok('the quality card has their rows', isinstance(rows, str) and 'ssr' in rows and 'ao' in rows, str(rows)[:160])
            await pg.evaluate(EV, "(function(){ var c = document.getElementById('isCard'); if (c && typeof cardClose === 'function') cardClose(); else if (c) c.hidden = true; return 1; })()")
        else:
            ok('the low tier draws neither', not f['ao'] and not f['ssr'])
        gv = await pg.evaluate(EV, "KIT.U.uGv.value"); ok('the ground’s variation is on here' if hi else 'the low tier leaves the ground as it was', gv == (1 if hi else 0), gv)
        # the vehicles
        v = await pg.evaluate(EV, """(function(){ var out = {}, K2 = TOKYO3D; ['sedan', 'taxi', 'kei', 'van', 'bus', 'patrol', 'truck'].forEach(function (k) { var V = K2.vehicle(k, 7), box = new THREE.Box3(), bad = 0, n = 0; V.root.updateMatrixWorld(true); V.root.traverse(function (o) { if (o.isMesh && o.geometry.attributes.position && !o.material.transparent) { box.expandByObject(o); var p = o.geometry.attributes.position.array; n += p.length / 3; for (var i = 0; i < p.length; i++) if (!isFinite(p[i])) bad++; } });
            out[k] = { n: n, bad: bad, L: +(box.max.z - box.min.z).toFixed(2), W: +(box.max.x - box.min.x).toFixed(2), H: +box.max.y.toFixed(2), y0: +box.min.y.toFixed(2), dL: V.L, dW: V.W, dH: +V.H.toFixed(2) }; }); return JSON.stringify(out); })()""")
        try: V = json.loads(v)
        except Exception: V = {}; log('vehicles', v)
        for k, q in V.items():
            ok('vehicle %s: a body of points, none astray, inside its own measures' % k, q['bad'] == 0 and q['n'] > (1500 if hi else 600) and abs(q['L'] - q['dL']) < 0.5 and q['W'] < q['dW'] + 0.75 and q['W'] > q['dW'] - 0.05 and q['H'] < q['dH'] + 0.45 and q['y0'] > -0.02, json.dumps(q))
        ar = await pg.evaluate(EV, "(function(){ var T = TK.T, n = 0, big = 0; T.root.traverse(function (o) { if (o.isMesh && o.geometry.attributes.position) { n += o.geometry.attributes.position.count; } }); return JSON.stringify({ pts: n, v85: T.v85, veh: T.cars.length, zl: T.zl.length, cover: T.zl.filter(function (z) { return z[6] === 0; }).length, cols: T.colliders.length }); })()")
        A2 = json.loads(ar); log('district', ar)
        ok('the viaduct keeps the ground under it dry (a box with no lamp)', A2['cover'] == 1 and A2['zl'] >= 8)
        if hi: ok('the district is built in relief, the street has its poles and gutters (points added)', A2['v85']['relief'] > 60000 and A2['v85']['street'] > 15000, json.dumps(A2['v85']))
        else: ok('the low tier builds neither', A2['v85']['relief'] == 0 and A2['v85']['street'] == 0, json.dumps(A2['v85']))
        # elsewhere: neither effect, no variation
        await pg.evaluate("() => { try { ISLE_x.city('walk'); } catch (e) {} }"); await pg.wait_for_timeout(6000)
        g = await pg.evaluate("() => ISLE_x.fx()"); gv2 = await pg.evaluate(EV, "[KIT.U.uGv.value, TK.id].join('|')")
        ok('at Taipei neither is drawn, the ground is as it was', (not g['place']) and (not g['ao']) and (not g['ssr']) and str(gv2).startswith('0|'), json.dumps(g)[:120] + ' ' + str(gv2))
        ok('no error on the page', not errs, errs[:3])
        bad = [n for n, c in RES if not c]; log('ALL OK %d/%d' % (len(RES), len(RES)) if not bad else 'FAILED %d of %d: %s' % (len(bad), len(RES), bad)); await b.close()
asyncio.run(main())
