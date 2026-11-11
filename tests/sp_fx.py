# (v88) the light of her moves, and added light under the reflections:
#   - every one of the five styles' strikes and the three special moves leaves nothing behind: its rings, arcs, columns and beam fade and are taken
#     away (from v85 to v87 the strikes' effects were never ticked — another function declared later under the same name had replaced their tick —
#     and stayed where they were made, at full strength, for good)
#   - light that is added to the picture (additive blending: a glow, a beam, a move's flash) leaves the smoothness written behind it alone: the
#     picture of the smoothness is the same with such a light in front of a wall as without it (it used to read as polished under the light)
#   - the passes over the picture declare their samplers at full precision (a phone's GPU otherwise reads the depth back as a 16-bit float); the
#     proof made once on the device (a known depth written and read back) passes here, and where it fails neither pass is drawn
#   python3 sp_fx.py <out dir> [tier] [shots]      shots: also pictures of each special move, with and without the reflections   (TK_FILE, VP=390x760)
import asyncio, sys, json, time, os, io
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]); TIER = sys.argv[2] if len(sys.argv) > 2 else 'mid'; SHOTS = len(sys.argv) > 3 and sys.argv[3] == 'shots'
FILE = os.environ.get('TK_FILE', 'build/test_min.html'); VPS = os.environ.get('VP', '390x760').split('x'); os.makedirs(OUT, exist_ok=True); RES = []
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def ok(name, cond, info=''): RES.append((name, bool(cond))); log('OK  ' if cond else 'FAIL', name, info)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
# the frames by hand, not drawn (the page's own frames are stopped for the whole test: one clock)
STEP = """(function (a) { var now = Math.max(window.__simNow || 0, performance.now()) + 40, i, mx = 0; if (!window.__raf0) window.__raf0 = window.requestAnimationFrame; window.requestAnimationFrame = function () { return 0; };
  if (!window.__r3) { window.__r3 = R3.render; window.__pr = POST.render; } R3.render = function () {}; POST.render = function () {};
  try { for (i = 0; i < a.n; i++) { now += a.dt; frame(now); mx = Math.max(mx, FSV.fx.length); if (a.until === 'fm' && !GS.fm && i > 4) break; if (a.until === 'sp' && !SP.st && i > 4) break; } } catch (e) { window.__simNow = now; return JSON.stringify({ err: String(e && e.stack || e).slice(0, 300) }); } window.__simNow = now; window.__lastNow = now;
  return JSON.stringify({ i: i, fm: GS.fm ? GS.fm.id : null, fx: FSV.fx.length, mx: mx, st: SP.st ? SP.st.id : null, sfx: SP.fx.length, em: SP.em.length, aura: !!(SP.aura && SP.aura.g.visible), bolts: (SP.bolt || []).filter(function (b) { return b && b.on; }).length, mode: luna.mode || null }); })"""
DRAW = """(function (a) { R3.render = window.__r3; POST.render = window.__pr; POST.fx.ssr = !!a.ssr; POST.fx.ao = !!a.ao; POST.final.uniforms.uFxDbg.value = a.dbg || 0; POST.render(scene, cam, window.__lastNow || performance.now()); R3.render = function () {}; POST.render = function () {}; POST.final.uniforms.uFxDbg.value = 0; return 1; })"""
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": int(VPS[0]), "height": int(VPS[1])}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append(m.text[:600]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_HOUR = 3.47; window.ISLE_TIER = '%s'; window.ISLE_TKTIER = '%s'; window.ISLE_DPR = 1; window.ISLE_WX = { code: 3 }; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}" % (TIER, TIER))
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 420:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        log('ready', round(time.time() - t0, 1)); await pg.wait_for_timeout(1500)
        HOME = "(function(){ var T = TK.T, w = T.toW(24, 0, 20); pos.set(w.x, TK.y, w.z); vel.set(0, 0, 0); target = null; path = null; luna.root.position.copy(pos); /* each move by itself: her overload, the rampage it ends in, the slowed time and the police are set back */ try { dxAllOff(); } catch (e) {} GS.fm = null; GS.punchCD = 0; GS.stun = 0; GS.wanted = 0; GS.seen = false; SP.cd = 0; return 1; })()"
        r = await pg.evaluate(EV, "(function(){ okachiArrive(); if (fall && fall.tk) tkWalkStart(); else { travel = null; fall = null; mode = 'walk'; } document.getElementById('isTitle').hidden = true; var t = document.querySelector('.isle__talk'); if (t) t.hidden = true; root.classList.add('is-shot'); /* no one is called: an arrest in the middle of the test would fade the picture out (and the fade waits on the page's own frames, stopped here) */ crime = function () {}; return JSON.stringify({ post: !!POST, fx: POST && POST.fx ? POST.fx.ok : null, gs: gsOn(), built: GS.built, styles: ISLE_x.fs() }); })()"); log('start', r); I = json.loads(r)
        await pg.add_style_tag(content=".isle.is-shot .isle__hud, .isle.is-shot #isTkBar, .isle.is-shot .isle__toast, .isle.is-shot .isle__banner, .isle.is-shot .isle__ann, .isle.is-shot .isle__nav, .isle.is-shot .isle__msg, .isle.is-shot .isle__fssub, .isle.is-shot .isle__dxfx, .isle.is-shot button { visibility: hidden !important; }")
        await pg.evaluate(EV, HOME); r = await pg.evaluate(EV, STEP + "({ n: 40, dt: 50 })"); log('settled', r)
        # the five styles: the strike's light is made, and three seconds after the strike nothing of it is left
        for st in I['styles']:
            await pg.evaluate(EV, HOME); await pg.evaluate(EV, STEP + "({ n: 4, dt: 50 })")
            s0 = await pg.evaluate(EV, "(function(){ ISLE_x.fs('%s'); gsPunch(); ISLE_x.fs(null); return GS.fm ? GS.fm.id : null; })()" % st)
            A = json.loads(await pg.evaluate(EV, STEP + "({ n: 200, dt: 33, until: 'fm' })")); B2 = json.loads(await pg.evaluate(EV, STEP + "({ n: 90, dt: 33 })"))
            ok('%s: the strike is made, its light is drawn, and three seconds on it is gone' % st, s0 == st and A.get('fm') is None and max(A.get('mx', 0), B2.get('mx', 0)) > 0 and B2.get('fx') == 0, 'most at once %d, left %s' % (max(A.get('mx', 0), B2.get('mx', 0)), B2.get('fx')))
        # the three special moves
        for mv in ('star', 'lance', 'aurora'):
            await pg.evaluate(EV, HOME); await pg.evaluate(EV, STEP + "({ n: 4, dt: 50 })")
            s0 = await pg.evaluate(EV, "ISLE_x.sp('%s')" % mv); k = 0
            if SHOTS:
                while k < 40:
                    k += 1; S = json.loads(await pg.evaluate(EV, STEP + "({ n: 20, dt: 50 })"))
                    for nm, kw in (('on', dict(ssr=True, ao=True)), ('off', dict(ssr=False, ao=True))):
                        await pg.evaluate(EV, DRAW + "(" + json.dumps(kw) + ")"); await pg.screenshot(path="%s/%s_%02d_%s.png" % (OUT, mv, k, nm), timeout=240000)
                    if S.get('st') is None: break
                A = S
            else: A = json.loads(await pg.evaluate(EV, STEP + "({ n: 400, dt: 50, until: 'sp' })"))
            B2 = json.loads(await pg.evaluate(EV, STEP + "({ n: 60, dt: 50 })"))
            ok('%s: the move runs to its end, and three seconds on its light is gone (the shell round her, the bolts, the columns)' % mv, s0 == mv and A.get('st') is None and B2.get('sfx') == 0 and not B2.get('aura') and B2.get('bolts') == 0 and B2.get('fx') == 0, json.dumps(B2))
            C2 = json.loads(await pg.evaluate(EV, STEP + "({ n: 180, dt: 50 })"))
            ok('%s: what it set alight burns out by itself (nine seconds at most)' % mv, C2.get('em') == 0, 'sources left after 3 s: %s, after 12 s: %s' % (B2.get('em'), C2.get('em')))
        # added light and the smoothness behind it
        f = await pg.evaluate("() => ISLE_x.fx()"); log('fx', json.dumps(f))
        if f.get('ok'):
            from PIL import Image, ImageChops, ImageStat
            ok('the passes over the picture read their textures at full precision', f.get('hp') is True, 'what the GPU keeps of a float [low, medium, high]: %s' % f.get('prec'))
            pr = f.get('probe') or {}; ok('and the proof on the device: a known depth, read back, kept where sixteen bits would have lost it (0.3, not 0)', pr.get('ok') is True and 0.25 < (pr.get('v') or 0) < 0.35, json.dumps(pr))
            await pg.evaluate(EV, "(function(){ var T = TK.T, a = T.toW(24, 0, 20), b = T.toW(12, 0, 10), e = new THREE.Vector3(a.x, T.Y + 1.6, a.z), l = new THREE.Vector3(b.x, T.Y + 1.4, b.z); luna.root.visible = false; ISLE_x.camHold([e.x, e.y, e.z], [l.x, l.y, l.z]);"
                " var m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ color: 0x1c1c1c, transparent: true, opacity: 0.95, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.position.copy(e).add(l.clone().sub(e).normalize().multiplyScalar(3)); m.lookAt(e); m.renderOrder = 9; m.frustumCulled = false; scene.add(m); window.__addq = m; return 1; })()")
            await pg.evaluate(EV, STEP + "({ n: 12, dt: 50 })")
            async def gloss(vis):
                await pg.evaluate(EV, "(function(){ window.__addq.visible = %s; return 1; })()" % ('true' if vis else 'false')); await pg.evaluate(EV, DRAW + "(" + json.dumps(dict(ssr=True, ao=True, dbg=3)) + ")")
                im = Image.open(io.BytesIO(await pg.screenshot(timeout=240000))).convert('RGB'); im.save("%s/gloss_%s.png" % (OUT, 'light' if vis else 'none')); W, H = im.size; return im.crop((W // 4, H // 3, W * 3 // 4, H * 2 // 3))
            n0 = (await pg.evaluate("() => ISLE_x.fx()")).get('add'); G1 = await gloss(True); G0 = await gloss(False); n1 = (await pg.evaluate("() => ISLE_x.fx()")).get('add')
            d = sum(ImageStat.Stat(ImageChops.difference(G1, G0)).mean) / 3
            ok('added light leaves the smoothness behind it as it was (the same picture of it with the light as without)', d < 0.6, 'mean difference %.2f of 255' % d)
            ok('the additive blend is given its alpha apart while the scene is drawn with the reflections', n1 and n1.get('ok') and n1.get('n', 0) > (n0 or {}).get('n', 0), '%s -> %s' % (json.dumps(n0), json.dumps(n1)))
            await pg.evaluate(EV, "(function(){ scene.remove(window.__addq); return 1; })()")
        else: log('the two passes are not drawn at this level: the smoothness is not read')
        # a device that reads the depth back coarse (its answer to the proof given by hand): neither pass is drawn, nothing else changes
        if f.get('ok'):
            pg2 = await ctx.new_page(); errs2 = []; pg2.on('pageerror', lambda e: errs2.append(str(e)[:300]))
            await pg2.add_init_script("window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_HOUR = 14; window.ISLE_TIER = '%s'; window.ISLE_TKTIER = '%s'; window.ISLE_DPR = 1; window.ISLE_WX = { code: 63 }; window.ISLE_DPROBE = { v: 0, d: 0.977, ok: false };" % (TIER, TIER))
            await pg.close(); await pg2.goto('file://' + D + '/' + FILE + '#/island', wait_until='commit', timeout=240000); t0 = time.time()
            while time.time() - t0 < 420:
                if await pg2.evaluate('() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0'): break
                await pg2.wait_for_timeout(500)
            await pg2.wait_for_timeout(1500); await pg2.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; return 1; })()"); await pg2.wait_for_timeout(5000)
            g = await pg2.evaluate('() => ISLE_x.fx()'); log('coarse depth', json.dumps(g))
            ok('on a device that reads the depth back coarse, neither pass is drawn (and the page runs on)', g.get('place') and g.get('ok') is False and not g.get('ao') and not g.get('ssr') and g.get('n') == 0 and not errs2, errs2[:2])
        ok('no error on the page', not errs, errs[:3])
        bad = [nm for nm, c in RES if not c]; log('ALL OK %d/%d' % (len(RES), len(RES)) if not bad else 'FAILED %d of %d: %s' % (len(bad), len(RES), bad)); await b.close()
asyncio.run(main())
