# the lens at rest: she stands still on a platform (or in the hall, on the street) and the picture must not move — the frames are driven by hand
# at an uneven pace (a phone's), the lens's place is read after each, and any step between two frames once it has settled is a jump
#   python3 jit_chk.py <desk|mobile> [spots: plat,hall,street] [frames]         TRAIN=1 steps the trains between frames as well
import asyncio, sys, json, time, os, math
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEV = sys.argv[1]; PARTS = (sys.argv[2] if len(sys.argv) > 2 else 'plat,hall,street').split(','); NF = int(sys.argv[3]) if len(sys.argv) > 3 else 260
FILE = os.environ.get('TK_FILE', 'build/test_min.html'); VP = {'desk': (1280, 760), 'mobile': (360, 780)}[DEV]; HOUR = os.environ.get('HOUR', '21.47')
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
# local places (x, z, height of the floor over the street), the lens's yaw
SPOTS = { 'plat': [(x, z, 7.5) for z in (-20.0, -31.0, -44.0, -58.0) for x in (3.45, 4.1, 5.2, 6.5, 7.9, 9.0, 9.55, -3.45, -4.4, -6.5, -9.5)],
          'hall': [(8.6, 9.6, 0.14), (6.5, 8.5, 0.14), (2.0, 6.0, 0.14), (-6.0, 4.0, 0.14), (11.5, 10.8, 0.14)],
          'street': [(27, 17, 0.0), (23, 27.5, 0.0), (21.5, 10.8, 0.0), (30, -20, 0.0)] }
YAWS = [0, 0.8, 1.57, 2.4, 3.14, 3.9, 4.71, 5.5]
RUN = """(function (a) { var T = TK.T, w = T.toW(a.x, 0, a.z), out = [], i, now = performance.now(), R = window.__jr || (window.__jr = (function () { var s = 12345; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })());
  pos.set(w.x, T.Y + a.y, w.z); vel.set(0, 0, 0); target = null; path = null; if (typeof stick !== 'undefined' && stick) stickEnd(); luna.root.position.copy(pos); CAM.yaw = a.yaw; CAM.userT = 0; CAM.rot = 0; TC.d = TC.p = TC.dd = TC.pd = null; TC.hold = null; TC.yawGoal = null; CAM.tgt.set(pos.x, pos.y + 0.85, pos.z);
  try { camera(0.016, true); } catch (e) { return JSON.stringify({ err: String(e) }); }
  var raf0 = window.requestAnimationFrame; window.requestAnimationFrame = function () { return 0; };
  try { for (i = 0; i < a.n; i++) { var dt = a.even ? 0.0167 : [0.017, 0.033, 0.05, 0.022, 0.066, 0.04][Math.floor(R() * 6)]; now += dt * 1000; if (a.train) TKM.update(T, 0, {}); frame(now); var l = T.toL(cam.position.x, cam.position.z); out.push([+l[0].toFixed(3), +(cam.position.y - T.Y).toFixed(3), +l[1].toFixed(3), +(TC.d || 0).toFixed(3), +(TC.p || 0).toFixed(3), +CAM.yaw.toFixed(4), luna.root.visible ? 1 : 0, +cam.fov.toFixed(2)]); } }
  catch (e) { window.requestAnimationFrame = raf0; return JSON.stringify({ err: String(e && e.stack || e).slice(0, 300) }); }
  window.requestAnimationFrame = raf0; return JSON.stringify({ zone: tkZone(), f: out }); })"""
async def main():
    bad = []; worst = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk'); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_TKTIER = 'high'; window.ISLE_HOUR = %s; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}" % HOUR)
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 300:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        r = await pg.evaluate(EV, "(function(){ okachiArrive(); if (fall && fall.tk) tkWalkStart(); else { travel = null; fall = null; mode = 'walk'; } document.getElementById('isTitle').hidden = true; R3.render = function () {}; if (POST) POST.render = function () {}; return JSON.stringify({ tkw: TKW, mode: mode, gs: typeof gsOn === 'function' && !!gsOn() }); })()")
        log(DEV, 'start', r); await pg.wait_for_timeout(2500)
        # the stations' surfaces must be known to the lens before it is measured
        for _ in range(80):
            c = await pg.evaluate("() => ISLE_x.cbv()")
            if c['done']: break
            await pg.wait_for_timeout(500)
        log(DEV, 'surfaces', json.dumps(c)); log(DEV, 'trains', await pg.evaluate("(s) => JSON.stringify(ISLE_x.tkStep(s))", float(os.environ.get('STEP', '0'))))
        for part in PARTS:
            for (x, z, y) in SPOTS[part]:
                for yaw in YAWS:
                    for even in ((0, 1) if os.environ.get('EVEN') else (0,)):
                        raw = await pg.evaluate(EV, RUN + "(" + json.dumps({'x': x, 'z': z, 'y': y, 'yaw': yaw, 'n': NF, 'even': even, 'train': 1 if os.environ.get('TRAIN') else 0}) + ")")
                        try: R = json.loads(raw)
                        except Exception: log('ERR', x, z, yaw, str(raw)[:300]); bad.append((part, x, z, yaw, 'error')); continue
                        if 'err' in R: log('ERR', x, z, yaw, R['err']); bad.append((part, x, z, yaw, 'error')); continue
                        F = R['f']; S = F[100:]  # settled after a hundred frames
                        st = [math.dist(S[i][:3], S[i - 1][:3]) for i in range(1, len(S))]; big = [i for i, v in enumerate(st) if v > 0.05]
                        span = max(math.dist(a[:3], S[0][:3]) for a in S); dy = max(abs(a[5] - S[0][5]) for a in S); vis = sum(1 for a in S if a[6]) / len(S); fov = max(a[7] for a in S) - min(a[7] for a in S)
                        ok = not big and span < 0.12 and dy < 0.02 and vis in (0, 1) and fov < 0.3
                        if not ok:
                            bad.append((part, x, z, yaw, even)); worst.append((max(st) if st else 0, part, x, z, yaw))
                            log(DEV, 'BAD', part, R['zone'], (x, z), 'yaw', yaw, 'even' if even else 'uneven', '| jumps', len(big), 'largest step', round(max(st), 3), 'wander', round(span, 3), 'yaw moved', round(dy, 3), 'seen', round(vis, 2), 'fov', round(fov, 2), '| arm', sorted(set(round(a[3], 1) for a in S))[:8], 'pitch', sorted(set(round(a[4], 2) for a in S))[:8])
        n = sum(len(SPOTS[p]) for p in PARTS) * len(YAWS)
        log(DEV, 'places x directions', n, '| not at rest', len(bad), '| errors', errs[:2])
        for w in sorted(worst, reverse=True)[:8]: log('  worst', w)
        await b.close()
    log('BAD', len(bad))
asyncio.run(main())
