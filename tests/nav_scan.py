# the guide ("take me to the platform" / "back to the street") from everywhere she can stand at Okachimachi: every walkable point of a grid over the
# street before the exit, the passage, the hall, the two stairs and the platforms is tried, and the places from which no way is found are listed
#   python3 nav_scan.py [step]          TK_FILE=…
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STEP = float(sys.argv[1]) if len(sys.argv) > 1 else 0.5; FILE = os.environ.get('TK_FILE', 'build/test_min.html')
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
SCAN = """(function (a) { var T = TK.T, S = T.ST, out = { n: 0, bad: [], lv: {} }, x, z, k;
  function tryAt(lx, lz, ly, tag) { var w = T.toW(lx, 0, lz); pos.set(w.x, TK.y + ly, w.z); var up = ly < 3, dst = up ? [4.4, S.YP, -13.5] : [T.VX + 2.6, 0.14, S.PZC], g = T.toW(dst[0], 0, dst[2]), p = null, t0 = performance.now(); try { p = (typeof tkPathFar === 'function' ? tkPathFar : tkPath)(g.x, g.z, TK.y + dst[1]); } catch (e) { p = null; out.err = String(e).slice(0, 200); }
    out.n++; out.lv[tag] = (out.lv[tag] || 0) + 1; if (!p || !p.length) { out.bad.push([+lx.toFixed(2), +ly.toFixed(2), +lz.toFixed(2), tag]); out.near = TKM.colL(T).filter(function (c) { return Math.abs(c[0] - lx) < c[2] + 1 && Math.abs(c[1] - lz) < c[3] + 1; }).map(function (c) { return c.map(function (v) { return +(+v).toFixed(2); }); }).slice(0, 5); out.ncol = TKM.colL(T).length; if (a.dbg && !out.dbg) { var r = { y: +(pos.y - TK.y).toFixed(3), again: !!((p = tkPathFar(g.x, g.z, TK.y + dst[1])) && p.length) }; [['short', null], ['njF', { noJay: true, cs: 0.35 }], ['njC', { noJay: true }], ['fine', { cs: 0.35 }], ['coarse', {}]].forEach(function (c) { var q = null; try { TKPO = c[1]; q = tkPath(g.x, g.z, TK.y + dst[1]); } catch (e3) { q = 'ERR ' + String(e3).slice(0, 120); } finally { TKPO = null; } r[c[0]] = typeof q === 'string' ? q : !!(q && q.length); }); r.fl = TKM.floorsL(T, lx, lz); (function () { var x = lx + 0.35, z = lz, C = TKM.colL(T); r.inWalk = T.walk.filter(function (w) { return x >= w[0] && x <= w[1] && z >= w[2] && z <= w[3]; }).map(function (w) { return w.map(function (v) { return +(+v).toFixed(2); }); }); r.blk = C.filter(function (c) { return Math.abs(x - c[0]) < c[2] && Math.abs(z - c[1]) < c[3]; }).map(function (c) { return c.map(function (v) { return +(+v).toFixed(2); }); }); r.idx = C.map(function (c, i) { return Math.abs(x - c[0]) < c[2] && Math.abs(z - c[1]) < c[3] ? i : -1; }).filter(function (i) { return i >= 0; }); r.ncol = [T.colliders.length, C.length]; })(); try { TKPO = {}; var NB2 = navBuckets(T); TKPO = null; r.cells = []; [[0, 0], [0.35, 0], [0.5, 0.15], [0.15, 0.15], [0.15, -0.2], [0.5, -0.2], [0.5, 0.5], [0.15, 0.5], [0, 0.55], [0.55, 0]].forEach(function (d) { var x = lx + d[0], z = lz + d[1], bk = NB2.at(x, z); r.cells.push([d[0], d[1], bk ? [bk.w.length, bk.c.length, bk.raised.length, bk.t.length] : null, bk ? TKM.walkL(bk, x, z, 0.14, bk.c, bk.w) : null, bk ? +TKM.groundL(bk, x, z, 0.14).toFixed(2) : null, TKM.walkL(T, x, z, 0.14, TKM.colL(T)), NB2.jay(x, z)]); }); } catch (e4) { r.cellsErr = String(e4).slice(0, 200); TKPO = null; } r.nbkey = T._nb ? T._nb.key : null; r.gok = TKM.walkL(T, dst[0], dst[2], dst[1], TKM.colL(T)); r.gnear = TKM.colL(T).filter(function (c) { return Math.abs(c[0] - dst[0]) < c[2] + 0.6 && Math.abs(c[1] - dst[2]) < c[3] + 0.6; }).map(function (c) { return c.map(function (v) { return +(+v).toFixed(2); }); }).slice(0, 4); out.dbg = r; } } out.ms = Math.max(out.ms || 0, Math.round(performance.now() - t0)); }
  for (x = a.x0; x <= a.x1 + 1e-6; x += a.s) for (z = a.z0; z <= a.z1 + 1e-6; z += a.s) { var fl = TKM.floorsL(T, x, z); for (k = 0; k < fl.length; k++) { var y = fl[k], cols = TKM.colL(T); if (!TKM.walkL(T, x, z, y, cols)) continue; tryAt(x, z, y, a.tag); } }
  return JSON.stringify(out); })"""
# the same, from hard against every solid thing (a wall's face, a gate cabinet, a fence, a pillar): points along each side of each collider, at a few distances out from it
EDGE = """(function (a) { var T = TK.T, S = T.ST, out = { n: 0, bad: [], thin: 0 }, cols = TKM.colL(T), k, e, d;
  function tryAt(lx, lz, ly, c, dd) { var w = T.toW(lx, 0, lz); pos.set(w.x, TK.y + ly, w.z); var up = ly < 3, dst = up ? [4.4, S.YP, -13.5] : [T.VX + 2.6, 0.14, S.PZC], g = T.toW(dst[0], 0, dst[2]), p = null; try { p = (typeof tkPathFar === 'function' ? tkPathFar : tkPath)(g.x, g.z, TK.y + dst[1]); } catch (e2) { p = null; out.err = String(e2).slice(0, 200); }
    out.n++; if (!p || !p.length) out.bad.push([+lx.toFixed(2), +ly.toFixed(2), +lz.toFixed(2), dd, +Math.min(c[2], c[3]).toFixed(2)]); }
  for (k = a.k0; k < Math.min(a.k1, cols.length); k++) { var c = cols[k]; if (c[0] < a.x0 || c[0] > a.x1 || c[1] < a.z0 || c[1] > a.z1) continue; if (Math.min(c[2], c[3]) < 0.25) out.thin++;
    a.ds.forEach(function (dd) { var pts = [], t; for (t = -c[3]; t <= c[3] + 1e-6; t += Math.max(0.3, c[3] / 2)) { pts.push([c[0] + c[2] + dd, c[1] + t], [c[0] - c[2] - dd, c[1] + t]); } for (t = -c[2]; t <= c[2] + 1e-6; t += Math.max(0.3, c[2] / 2)) { pts.push([c[0] + t, c[1] + c[3] + dd], [c[0] + t, c[1] - c[3] - dd]); }
      pts.forEach(function (q) { var fl = TKM.floorsL(T, q[0], q[1]); for (var i = 0; i < fl.length; i++) { var y = fl[i]; if (y < (c[4] == null ? -1e9 : c[4]) || y > (c[5] == null ? 1e9 : c[5])) continue; if (!TKM.walkL(T, q[0], q[1], y, cols)) continue; tryAt(q[0], q[1], y, c, dd); } }); }); }
  out.cols = cols.length; return JSON.stringify(out); })"""
# and she gets there: from a few hard starts (hard against the stair's wall, against a gate, far down the side street, the far side of the viaduct, a
# platform's far end) the guide's button is pressed and the frames are driven by hand until she stops
WALK = """(function (a) { var T = TK.T, S = T.ST, cols = TKM.colL(T), st = a.at, now = Math.max(window.__simNow || 0, performance.now()) + 40, i, said = null;
  if (a.thin) { /* hard against the nearest thin thing to that place, on the side she can stand */ var best = null; cols.forEach(function (c) { if (Math.min(c[2], c[3]) >= 0.25 || st[1] < c[4] || st[1] > c[5]) return; var d = Math.hypot(c[0] - st[0], c[1] - st[2]); if (best && d > best.d) return; [[c[0] + c[2], c[1]], [c[0] - c[2], c[1]], [c[0], c[1] + c[3]], [c[0], c[1] - c[3]]].forEach(function (q) { if (TKM.walkL(T, q[0], q[1], st[1], cols)) best = { d: d, q: q }; }); }); if (!best) return JSON.stringify({ err: 'no thin thing near' }); st = [best.q[0], st[1], best.q[1]]; }
  var w = T.toW(st[0], 0, st[2]); pos.set(w.x, TK.y + st[1], w.z); vel.set(0, 0, 0); target = null; path = null; pendingAct = null; luna.root.position.copy(pos); try { camera(0.016, true); } catch (e) {}
  if (!window.__raf0) window.__raf0 = window.requestAnimationFrame; var raf0 = function () { return 0; }, t0 = window.toast; window.requestAnimationFrame = raf0;
  try { for (i = 0; i < 6; i++) { now += 50; frame(now); } if (a.red) { T.sig.ph = 'car'; T.sig.t = 4; } var z0 = tkZone(), up = z0 !== 'plat', dst = up ? [4.4, S.YP, -13.5] : [T.VX + 2.6, 0.14, S.PZC]; tkGuide(); var had = !!(path && path.length), n0 = had ? path.length : 0, L0 = T.toL(pos.x, pos.z);
    var held = 0, wmax = 0, crimes0 = GS.crimes || 0; for (i = 0; i < a.n && (target || (path && path.length)); i++) { now += 50; frame(now); if (TC.kerb) held++; wmax = Math.max(wmax, GS.wanted); }
    var L = T.toL(pos.x, pos.z), d = Math.hypot(L[0] - dst[0], L[1] - dst[2]); window.__simNow = now; window.requestAnimationFrame = raf0;
    return JSON.stringify({ from: st.map(function (v) { return +v.toFixed(2); }), zone0: z0, way: had, pts: n0, frames: i, zone: tkZone(), left: +d.toFixed(2), y: +(pos.y - TK.y).toFixed(2), held: held, wanted: wmax, ph: T.sig.ph, moved: +Math.hypot(L[0] - L0[0], L[1] - L0[1]).toFixed(1) }); }
  catch (e) { window.requestAnimationFrame = raf0; return JSON.stringify({ err: String(e && e.stack || e).slice(0, 300) }); } })"""
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": 360, "height": 780}, has_touch=True, is_mobile=True); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_TKTIER = '%s'; window.ISLE_HOUR = 12; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}" % os.environ.get('TKTIER', 'high'))
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 300:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        r = await pg.evaluate(EV, "(function(){ okachiArrive(); if (fall && fall.tk) tkWalkStart(); else { travel = null; fall = null; mode = 'walk'; } document.getElementById('isTitle').hidden = true; R3.render = function () {}; if (POST) POST.render = function () {}; var S = TK.T.ST; return JSON.stringify({ tkw: TKW, ST: { CX0: S.CX0, CX1: S.CX1, CZ0: S.CZ0, CZ1: S.CZ1, PZA: S.PZA, PZB: S.PZB, ZS0: S.ZS0, ZS1: S.ZS1, ZB: S.ZB, SCX: S.SCX, SW: S.SW, GX: S.GX, YP: S.YP, PZC: S.PZC }, po: !!TKPO, pz: TK.T.platZ }); })()")
        log('start', r); await pg.wait_for_timeout(1500); tot = 0; bad = []; mx = 0
        sq = await pg.evaluate(EV, "(function(){ window.ISLE_SQMS = 400; var now = Math.max(window.__simNow || 0, performance.now()) + 40, i; if (!window.__raf0) window.__raf0 = window.requestAnimationFrame; window.requestAnimationFrame = function () { return 0; }; for (i = 0; i < 4000; i++) { now += 33; frame(now); var G = TK.T.__sq; if (G && G.done) break; } window.__simNow = now; var G2 = TK.T.__sq; return JSON.stringify({ frames: i, done: !!(G2 && G2.done), cells: G2 && G2.H ? G2.H.n : null, fail: G2 ? G2.fail || null : 'none' }); })()"); log('the drawn solids are read', sq)
        # the walks first: the scans below stand her on the carriageway against the light, and the police would come for her
        wbad = 0
        for (name, at, thin, red) in [(q + (0,) if len(q) == 3 else q) for q in [('hard against the stair wall, in the hall', [7.6, 0.14, 4.0], 1), ('hard against a gate', [9.3, 0.14, 9.0], 1), ('hard against the other stair wall', [-5.4, 0.14, 5.0], 1), ('down the side street', [20.5, 0.0, -60.0], 0), ('the far side of the viaduct', [-20.5, 0.0, 8.0], 0), ('across the road', [22.0, 0.14, 41.0], 0), ('across the road, far along it', [-45.0, 0.14, 40.5], 0), ('across the road against the light: she waits at the kerb', [22.0, 0.14, 41.0], 0, 1), ('the same from the far pavement', [-30.0, 0.14, 42.0], 0, 1), ('a platform, far end (the way down)', [5.0, 7.54, -80.0], 0), ('the other platform (the way down)', [-6.5, 7.54, -30.0], 0)]]:
            raw = await pg.evaluate(EV, WALK + "(" + json.dumps({'at': at, 'thin': thin, 'red': red, 'n': 6000}) + ")")
            try: R = json.loads(raw)
            except Exception: R = {'err': str(raw)[:200]}
            good = ('err' not in R) and R['way'] and R['left'] < 1.6 and ((R['zone'] == 'plat') == (R['zone0'] != 'plat')) and R['wanted'] == 0 and (not red or R['held'] > 100)
            wbad += 0 if good else 1; log('OK  ' if good else 'BAD ', 'she gets there:', name, json.dumps(R))
        for (tag, x0, x1, z0, z1) in ([] if os.environ.get('EDGE_ONLY') or os.environ.get('WALK_ONLY') else [('hall', -13, 13.5, -6, 14), ('front', 13.5, 27.4, 2, 22), ('plat', -10, 10, -96, 16), ('south', 13.2, 27.4, -100, 2), ('east', -27.4, -13.2, -60, 22), ('road', -40, 40, 18.2, 43.2)]):
            if os.environ.get('REG') and tag not in os.environ['REG'].split(','): continue
            xs = x0
            while xs <= x1:   # in strips, so no single call runs long
                raw = await pg.evaluate(EV, SCAN + "(" + json.dumps({'x0': xs, 'x1': min(x1, xs + 2 - (STEP if tag in ('hall', 'front', 'plat') else 2.0) / 2), 'z0': z0, 'z1': z1, 's': STEP if tag in ('hall', 'front', 'plat') else 2.0, 'tag': tag, 'dbg': 1 if os.environ.get('DBG') else 0}) + ")")
                try: R = json.loads(raw)
                except Exception: log('ERR', tag, xs, str(raw)[:300]); xs += 2; continue
                tot += R['n']; bad += R['bad']; mx = max(mx, R.get('ms', 0))
                if R.get('err'): log('err', R['err'])
                if R.get('dbg'): log('   dbg', json.dumps(R['dbg']))
                if R['bad']: log('   no way', tag, R['bad'][:6], '| things near', R.get('near'), 'of', R.get('ncol'), '| trains', await pg.evaluate(EV, "JSON.stringify(TK.T.trains.map(function (t) { return [t.st, Math.round(t.z)]; }))"))
                xs += 2
            log(tag, 'tried so far', tot, 'no way from', len(bad), '| slowest search so far', mx, 'ms')
        log('places', tot, '| no way from', len(bad), '| errors', errs[:2])
        etot = 0; ebad = []; k = 0; ncol = 0 if os.environ.get('WALK_ONLY') else 99999
        while k < ncol:
            raw = await pg.evaluate(EV, EDGE + "(" + json.dumps({'k0': k, 'k1': k + 25, 'x0': -14, 'x1': 28, 'z0': float(os.environ.get('EZ0', '-8')), 'z1': 23, 'ds': [0.0, 0.01, 0.1]}) + ")")
            try: R = json.loads(raw)
            except Exception: log('ERR edge', k, str(raw)[:300]); k += 25; continue
            ncol = R['cols']; etot += R['n']; ebad += R['bad']; k += 25
        log('hard against things: places', etot, '| no way from', len(ebad))
        byd = {}
        for q in ebad: byd[q[3]] = byd.get(q[3], 0) + 1
        log('   by distance out', sorted(byd.items()), '| thin', sum(1 for q in ebad if q[4] < 0.25), 'thick', sum(1 for q in ebad if q[4] >= 0.25)); log('   e.g.', ebad[:14])
        log('NAV ' + ('OK' if not bad and not ebad and not wbad else 'BAD %d + %d + %d' % (len(bad), len(ebad), wbad)))
        by = {}
        for q in bad: by.setdefault((q[3], q[1]), []).append((q[0], q[2]))
        for k, v in sorted(by.items()): log('  ', k, len(v), v[:40])
        await b.close()
asyncio.run(main())
