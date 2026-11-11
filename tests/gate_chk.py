# (v87) through the gates with her card: walking up to an open lane she takes her card out and holds it to the reader (the arm up, the card in the
# hand), the reader lights and the touch is counted (the beep is made from it), the leaves swing away before she reaches them and fall back behind
# her, the card is put away; the same coming out; led by the guide she touches once on her way; the closed lanes are not walked through
#   python3 gate_chk.py <out dir> [shots]          (shots: also two pictures of the touch, drawn in full — slow under software rendering)
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]); SHOTS = len(sys.argv) > 2 and sys.argv[2] == 'shots'; FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True); RES = []
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def ok(name, cond, info=''): RES.append((name, bool(cond))); log('OK  ' if cond else 'FAIL', name, info)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
# she is stood at a place and walked to another (a tap on the floor there); the frames are driven by hand and the touch is read after each
RUN = """(function (a) { var T = TK.T, S = T.ST, now = Math.max(window.__simNow || 0, performance.now()) + 40, i, out = [], w = T.toW(a.from[0], 0, a.from[1]), g = T.toW(a.to[0], 0, a.to[1]);
  pos.set(w.x, TK.y + S.YF, w.z); vel.set(0, 0, 0); target = null; path = null; pendingAct = null; luna.root.position.copy(pos); /* the page's own frames are stopped for the whole test: its clock would run behind the one these frames are driven by */ if (!window.__raf0) window.__raf0 = window.requestAnimationFrame; var raf0 = function () { return 0; }; window.requestAnimationFrame = raf0;
  try { for (i = 0; i < 8; i++) { now += 33; frame(now); } if (a.guide) tkGuide(); else walkTo([g.x, g.z], {}); var gx = S.GX + 0.08;
    for (i = 0; i < a.n && (i < 12 || target || (path && path.length) || ISLE_x.gate().on); i++) { now += (a.dt || 33); frame(now); var L = T.toL(pos.x, pos.z), q = ISLE_x.gate(); out.push([+(L[0] - gx).toFixed(2), +L[1].toFixed(2), q.on ? 1 : 0, q.tapped ? 1 : 0, q.card ? 1 : 0, (q.holdR || q.holdL) ? 1 : 0, q.lane, q.lanes.map(function (v) { return v === 'x' ? -1 : v; }), q.flash ? 1 : 0, q.taps, +(luna.armR.sh.rotation.x).toFixed(2)]); if (a.stopAt != null && q.tapped) break; }
    window.__simNow = now; window.requestAnimationFrame = raf0; return JSON.stringify({ f: out, zone: tkZone(), y: +(pos.y - TK.y).toFixed(2) }); } catch (e) { window.__simNow = now; window.requestAnimationFrame = raf0; return JSON.stringify({ err: String(e && e.stack || e).slice(0, 300) }); } })"""
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": 390, "height": 760}, has_touch=True, is_mobile=True); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append(m.text[:400]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_TKTIER = 'high'; window.ISLE_HOUR = 12; window.ISLE_WX = { code: 1 }; %s try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}" % ("window.ISLE_TIER = 'mid'; window.ISLE_DPR = 1;" if SHOTS else "window.FAST3D = true;"))
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 420:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        r = await pg.evaluate(EV, "(function(){ okachiArrive(); if (fall && fall.tk) tkWalkStart(); else { travel = null; fall = null; mode = 'walk'; } document.getElementById('isTitle').hidden = true; window.__r3 = R3.render; window.__pr = POST ? POST.render : null; R3.render = function () {}; if (POST) POST.render = function () {}; var T = TK.T, S = T.ST, cols = TKM.colL(T); return JSON.stringify({ tkw: TKW, GX: S.GX, YF: S.YF, lanes: T.gatesL, walk: T.gatesL.map(function (g) { return TKM.walkL(T, S.GX + 0.08, g.z, S.YF, cols); }), gate: ISLE_x.gate() }); })()")
        I = json.loads(r); log('start', r[:400]); GX = I['GX']; lanes = I['lanes']
        sq = await pg.evaluate(EV, "(function(){ window.ISLE_SQMS = 400; var now = Math.max(window.__simNow || 0, performance.now()) + 40, i; if (!window.__raf0) window.__raf0 = window.requestAnimationFrame; window.requestAnimationFrame = function () { return 0; }; for (i = 0; i < 4000; i++) { now += 33; frame(now); var G = TK.T.__sq; if (G && G.done) break; } window.__simNow = now; var G2 = TK.T.__sq; return JSON.stringify({ frames: i, done: !!(G2 && G2.done), cells: G2 && G2.H ? G2.H.n : null, fail: G2 ? G2.fail || null : 'none' }); })()"); log('the drawn solids are read', sq)
        ok('six lanes, two of them closed', len(lanes) == 6 and sum(1 for g in lanes if g['shut']) == 2, [round(g['z'], 2) for g in lanes])
        ok('a closed lane is not walked through, an open one is', all(w != g['shut'] for w, g in zip(I['walk'], lanes)), I['walk'])
        ok('at rest: no card, the arm down, the leaves shut', not I['gate']['card'] and not I['gate']['holdR'] and all(v in ('x', 0) for v in I['gate']['lanes']), json.dumps(I['gate']))
        async def run(name, frm, to, lane, d, **kw):
            raw = await pg.evaluate(EV, RUN + "(" + json.dumps(dict({'from': frm, 'to': to, 'n': 700}, **kw)) + ")")
            try: R = json.loads(raw)
            except Exception: ok(name + ': ran', False, str(raw)[:300]); return None
            if 'err' in R: ok(name + ': ran', False, R['err']); return None
            F = R['f']; t0 = F[0][9]; on = [f for f in F if f[2]]; tap = [f for f in F if f[3]]
            ok(name + ': she takes the card out a step short of the leaves', bool(on) and on[0][0] * d < -0.25 and on[0][4] == 1 and on[0][6] == lane, on[0] if on else F[-1])
            ok(name + ': her arm comes up to the reader', any(f[5] and f[10] < -1.2 for f in on), min(f[10] for f in F))
            ok(name + ': the reader lights and the touch is counted once', bool(tap) and tap[0][8] == 1 and F[-1][9] - t0 == 1, [t0, F[-1][9]] if F[-1][9] - t0 == 1 else [[f[0], f[1], f[2], f[3], f[6], f[9]] for f in F if abs(f[0]) < 1.4][:40])
            at = [f for f in F if abs(f[0]) < 0.12] or [f for f in F if f[0] * d < 0.12][-1:]   # at the leaves (with long frames: the last frame before them)
            ok(name + ': the leaves are open when she reaches them', bool(at) and min(f[7][lane] for f in at) > 0.8, [f[7][lane] for f in at][:6])
            ok(name + ': through, the card away, the arm down, the leaves shut again', F[-1][0] * d > 1.0 and not F[-1][4] and not F[-1][5] and F[-1][7][lane] < 0.06 and not F[-1][2], F[-1])
            return R
        z2 = lanes[2]['z']; z3 = lanes[3]['z']
        await run('going in (walking)', [GX + 2.4, z2], [GX - 2.6, z2], 2, -1)
        await run('coming out (walking)', [GX - 2.4, z3], [GX + 2.6, z3], 3, 1)
        await run('going in, uneven frames', [GX + 2.4, z3], [GX - 2.6, z3], 3, -1, dt=66)
        # led by the guide from the street: one touch on the way, and she reaches the platform
        raw = await pg.evaluate(EV, RUN + "(" + json.dumps({'from': [20.5, 6.0], 'to': [0, 0], 'n': 2500, 'guide': 1, 'dt': 50}) + ")"); R = json.loads(raw)
        if 'err' in R: ok('led by the guide', False, R['err'])
        else: F = R['f']; ok('led by the guide: one touch on her way, and she reaches the platform', F[-1][9] - F[0][9] == 1 and R['zone'] == 'plat' and not F[-1][4], [F[0][9], F[-1][9], R['zone'], [f[:4] for f in F if abs(f[0]) < 1.3][:14]])
        # and back down: the touch at the paid end
        raw = await pg.evaluate(EV, RUN + "(" + json.dumps({'from': [0, 0], 'to': [0, 0], 'n': 2500, 'guide': 1, 'dt': 50, 'keep': 1}).replace('"from": [0, 0]', '"from": [4.4, -13.5]') + ")"); R = json.loads(raw)
        if SHOTS:
            # the touch itself, drawn: she is walked to it and stopped there, then the frames are drawn in full
            for (nm, frm, to, eye, look) in [('in', [GX + 2.4, z2], [GX - 2.6, z2], [GX - 0.75, 1.5, z2 - 1.25], [GX + 0.5, 1.0, z2 - 0.2]), ('in_behind', [GX + 2.4, z2], [GX - 2.6, z2], [GX + 1.75, 1.75, z2 - 0.75], [GX + 0.3, 1.0, z2 - 0.3]), ('out', [GX - 2.4, z3], [GX + 2.6, z3], [GX + 0.85, 1.5, z3 + 1.25], [GX - 0.5, 1.0, z3 + 0.2])]:
                await pg.evaluate(EV, "(function(){ var T = TK.T, w = T.toW(0, 0, 0), now = window.__simNow, i; pos.set(w.x, TK.y + T.ST.YF, w.z); target = null; path = null; for (i = 0; i < 60; i++) { now += 33; frame(now); } window.__simNow = now; return 1; })()")
                raw = await pg.evaluate(EV, RUN + "(" + json.dumps({'from': frm, 'to': to, 'n': 400, 'stopAt': 1}) + ")")
                await pg.evaluate(EV, "(function(){ target = null; path = null; vel.set(0, 0, 0); R3.render = window.__r3; if (POST) POST.render = window.__pr; root.classList.add('is-shot'); var T = TK.T, a = T.toW(%s, 0, %s), b2 = T.toW(%s, 0, %s); ISLE_x.camHold([a.x, T.Y + %s, a.z], [b2.x, T.Y + %s, b2.z]); return 1; })()" % (eye[0], eye[2], look[0], look[2], eye[1], look[1]))
                await pg.add_style_tag(content=".isle.is-shot .isle__hud, .isle.is-shot #isTkBar, .isle.is-shot .isle__toast, .isle.is-shot .isle__banner, .isle.is-shot .isle__ann, .isle.is-shot .isle__nav, .isle.is-shot .isle__msg, .isle.is-shot button { visibility: hidden !important; }")
                await pg.evaluate(EV, "(function(){ var now = window.__simNow; for (var i = 0; i < 3; i++) { now += 16; frame(now); } window.__simNow = now; return 1; })()"); await pg.wait_for_timeout(1200)
                try: await pg.screenshot(path="%s/gate_%s.png" % (OUT, nm), timeout=240000)
                except Exception as ex: log('shot skipped', nm)
                log('shot', nm, json.dumps(await pg.evaluate("() => ISLE_x.gate()")))
                await pg.evaluate(EV, "(function(){ R3.render = function () {}; if (POST) POST.render = function () {}; return 1; })()")
        ok('no error on the page', not errs, errs[:3])
        bad = [n for n, c in RES if not c]; log('ALL OK %d/%d' % (len(RES), len(RES)) if not bad else 'FAILED %d of %d: %s' % (len(bad), len(RES), bad)); await b.close()
asyncio.run(main())
