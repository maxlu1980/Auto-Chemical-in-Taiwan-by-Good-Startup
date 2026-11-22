# (v89) the hands-on simulator, played through as a user would, every guide and every scenario: for each phase where the user is taken, how far
# and how much the view turns to get there, whether the work is in view on arrival, how much the view swings while the tool works, how long the
# work stops because the tool left the screen, how often the tool must be changed, and for the survey how far apart the points to find lie.
# The frames are driven by hand (one clock), the picture drawn only for the shots.
#   python3 hs_audit.py <out dir> [guides: sl,ux,po,ad] [scenarios: id,id] [vp: 1280x720] [shots: 0|1]
import asyncio, sys, json, time, os, math
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]); GUIDES = (sys.argv[2] if len(sys.argv) > 2 else 'sl,ux,po,ad').split(','); ONLY = [s for s in (sys.argv[3] if len(sys.argv) > 3 else '').split(',') if s]
VP = [int(v) for v in (sys.argv[4] if len(sys.argv) > 4 else '1280x720').split('x')]; SHOTS = (sys.argv[5] if len(sys.argv) > 5 else '1') == '1'
FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
ROUTE = {'sl': 'sealant', 'ux': 'ureax-hg', 'po': 'protect-one', 'ad': 'adhesive'}; MOD = {'sl': 'SL', 'ux': 'UX', 'po': 'PO', 'ad': 'AD'}
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
# the page's frames taken over: every requestAnimationFrame callback is queued and called on our clock; the renderer draws only when asked
PUMP = r"""
window.__hsPump = function (n, dt, draw) { var R = HSIM.view() && HSIM.view().dbg.renderer; if (R && !R.__r0) { R.__r0 = R.render; } if (R) R.render = draw ? R.__r0 : function () {};
  for (var i = 0; i < n; i++) { window.__now += dt; var q = window.__q; window.__q = []; for (var k = 0; k < q.length; k++) { try { q[k](window.__now); } catch (e) {} } }
  if (R) R.render = function () {}; };
if (!window.__qOn) { window.__qOn = 1; window.__q = []; window.__now = performance.now(); window.__raf0 = window.requestAnimationFrame; window.requestAnimationFrame = function (cb) { window.__q.push(cb); return window.__q.length; }; }
"""
ANG = r"""function ang(a, b) { var d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }"""
# one drive phase: the arrival, then the work held to its end with the tool the step needs (changed whenever the need changes)
DRIVE = r"""
(async function () { var S = HSIM.state(), p = S.phases[S.phase], v = HSIM.view(), out = { kind: p.kind, stage: p.stage, step: (p.step && p.step.c && p.step.c.title || '').replace(/<[^>]+>/g, '').slice(0, 40), secs: +p.secs.toFixed(1) };
  var a = S.pos.clone(), y0 = S.look.yaw, p0 = S.look.pitch, f = 0; while (S.move && f < 200) { __hsPump(1, 33); f++; }
  out.move = +a.distanceTo(S.pos).toFixed(2); out.turn = Math.round(Math.abs(ang(S.look.yaw, y0)) * 57.3 + Math.abs(S.look.pitch - p0) * 57.3); out.pos = S.pos.toArray().map(function (x) { return +x.toFixed(2); });
  __hsPump(3, 33); var r = S.ring || {}, R = document.getElementById('hsimView').getBoundingClientRect(); out.inView = !!(r.on && !r.behind); out.ctr = r.on ? +(Math.hypot(r.x - R.width / 2, r.y - R.height / 2) / Math.min(R.width, R.height)).toFixed(2) : null;
  var kinds = [], sw = 0, last = null, travel = 0, ly = S.look.yaw, lp = S.look.pitch, maxc = 0, frames = 0, off0 = S.off || 0, warn = 0, slide = 0, lpos = S.pos.clone(), ex0 = S.tool;
  var tw0 = S.tw, still = 0; S.btn = true; while (!S.done[S.phase] && frames < 3000 && still < 90) { if (S.tw > tw0 + 1e-6) { tw0 = S.tw; still = 0; } else still++; var need = (function () { var L = S.seq[p.stage] || [], best = L[0] || null; for (var k = 0; k < L.length; k++) if (L[k].t <= S.tw + 1e-6) best = L[k]; return best && best.kind !== 'look' ? best.kind : null; })();
      if (need && S.kinds[S.tool] !== need) { var i = S.kinds.indexOf(need); if (i >= 0) { document.querySelectorAll('#hsTools .hsim__tool')[i].click(); if (last != null) sw++; kinds.push(need); } } last = need;
      __hsPump(1, 33); frames++; slide += lpos.distanceTo(S.pos); lpos.copy(S.pos); travel += Math.abs(ang(S.look.yaw, ly)) + Math.abs(S.look.pitch - lp); ly = S.look.yaw; lp = S.look.pitch; var rr = S.ring; if (rr && rr.on) maxc = Math.max(maxc, Math.hypot(rr.x - R.width / 2, rr.y - R.height / 2) / Math.min(R.width, R.height)); else maxc = Math.max(maxc, 1);
      if (frames === Math.round(p.secs * 15)) window.__mid = true; }
  S.btn = false; out.frames = frames; out.workS = +(frames * 0.033).toFixed(1); out.swing = Math.round(travel * 57.3); out.maxOff = +maxc.toFixed(2); out.paused = +((S.off || 0) - off0).toFixed(1); out.slide = +slide.toFixed(2); out.eye = +(S.pos.y).toFixed(2); out.track = !!(p._shot && p._shot.track); out.key = !document.getElementById('hsKey') ? null : (document.getElementById('hsKey').hidden ? 0 : document.querySelectorAll('#hsKey li').length); out.tools = kinds; out.toolSwaps = sw; out.done = !!S.done[S.phase]; out.stuck = still >= 90 ? { tw: +S.tw.toFixed(3), to: p.to, need: (function () { var L = S.seq[p.stage] || [], best = L[0] || null; for (var k = 0; k < L.length; k++) if (L[k].t <= S.tw + 1e-6) best = L[k]; return best ? best.kind : null; })(), tool: S.kinds[S.tool] || null, card: !!S.card } : null; return JSON.stringify(out); })()"""
SURVEY = r"""
(async function () { var S = HSIM.state(), p = S.phases[S.phase], f = 0; while (S.move && f < 200) { __hsPump(1, 33); f++; } __hsPump(3, 33);
  var T = S.targets || [], cam = HSIM.view().dbg.cam, out = { kind: 'survey', n: T.length, pos: S.pos.toArray().map(function (x) { return +x.toFixed(2); }) }, seen = 0, dirs = [];
  T.forEach(function (t) { var v = t.p.clone().project(cam); if (v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1) seen++; var d = t.p.clone().sub(S.pos); dirs.push([Math.atan2(-d.x, -d.z), Math.atan2(d.y, Math.hypot(d.x, d.z))]); });
  out.inViewAtStart = seen; var yaws = dirs.map(function (d) { return d[0]; }), mn = Math.min.apply(null, yaws), mx = Math.max.apply(null, yaws), pit = dirs.map(function (d) { return d[1]; }); out.yawSpread = Math.round((mx - mn) * 57.3); out.pitchSpread = Math.round((Math.max.apply(null, pit) - Math.min.apply(null, pit)) * 57.3);
  if (S.tour) { /* (v89) the guided tour: the view goes to each finding by itself; the user only presses Next */ var tt = 0, ly = S.look.yaw, lp = S.look.pitch; for (var k = 0; k < T.length; k++) { for (var j = 0; j < 25; j++) { __hsPump(1, 33); tt += Math.abs(ang(S.look.yaw, ly)) + Math.abs(S.look.pitch - lp); ly = S.look.yaw; lp = S.look.pitch; } var R = document.getElementById('hsimView').getBoundingClientRect(), v = T[k].p.clone().project(cam); out['cur' + k] = +(Math.hypot(v.x, v.y)).toFixed(2); S.tap = true; __hsPump(2, 33); } out.viewTurn = Math.round(tt * 57.3); out.userTurn = 0; out.taps = T.length; out.done = !!S.done[S.phase]; out.labels = T.map(function (t) { return t.k; }); return JSON.stringify(out); }
  var tot = 0, cy = S.look.yaw, cp = S.look.pitch; dirs.forEach(function (d, k) { tot += Math.abs(ang(d[0], cy)) + Math.abs(d[1] - cp); cy = d[0]; cp = d[1]; S.look.yaw = d[0]; S.look.pitch = d[1]; __hsPump(28, 33); }); out.turnTotal = Math.round(tot * 57.3); out.done = !!S.done[S.phase]; out.labels = T.map(function (t) { return t.k; }); return JSON.stringify(out); })()"""
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append(m.text[:300]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.ISLE_TEST = 1; window.NO_GOV = true; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}")
        ALL = {}
        for g in GUIDES:
            await pg.goto("file://" + D + "/" + FILE + "#/" + ROUTE[g], wait_until="commit", timeout=240000)
            for _ in range(240):
                ok = await pg.evaluate("(m) => !!(window.HSIM && window[m] && window[m]._sim && window[m].state && window[m].state())", MOD[g])
                if ok: break
                await pg.wait_for_timeout(500)
            scns = await pg.evaluate("(g) => { var o = { sl: Object.keys(SLS), ux: Object.keys(ACS), po: PO_ORDER.slice(), ad: AD_ORDER.slice() }; return o[g]; }", g)
            for sc in scns:
                if ONLY and sc not in ONLY: continue
                tag = g + '_' + sc; log('==', tag)
                await pg.evaluate("(a) => { try { if (HSIM.state()) HSIM.close(); } catch (e) {} window[a[0]].setScenario(a[1]); return 1; }", [MOD[g], sc]); await pg.wait_for_timeout(800)
                await pg.evaluate("(a) => { HSIM.open(a[0], window[a[1]], null); return 1; }", [g, MOD[g]])
                for _ in range(240):
                    if await pg.evaluate("() => !!document.getElementById('hsStart')"): break
                    await pg.wait_for_timeout(500)
                await pg.evaluate(PUMP)
                S0 = json.loads(await pg.evaluate("() => { var S = HSIM.state(); return JSON.stringify({ phases: S.phases.map(function (p) { return p.kind + (p.stage ? ':' + p.stage : ''); }), kinds: S.kinds, cfg: { walk: null } }); }"))
                log('phases', ' '.join(S0['phases'])); log('tools', S0['kinds'])
                if SHOTS: await pg.evaluate("() => __hsPump(2, 33, true)"); await pg.screenshot(path="%s/%s_00_brief.png" % (OUT, tag), timeout=240000)
                await pg.evaluate("() => { document.getElementById('hsStart').click(); return 1; }"); res = []; k = 0
                while k < 80:
                    k += 1; await pg.wait_for_timeout(120)
                    st = json.loads(await pg.evaluate("() => { var S = HSIM.state(); if (!S) return JSON.stringify({ gone: 1 }); var p = S.phases[S.phase]; return JSON.stringify({ i: S.phase, kind: p ? p.kind : null, card: !!S.card, done: !!S.done[S.phase] }); }"))
                    if st.get('gone') or st['kind'] is None: break
                    kind = st['kind']
                    if kind == 'final':
                        if SHOTS: await pg.evaluate("() => __hsPump(2, 33, true)"); await pg.screenshot(path="%s/%s_99_final.png" % (OUT, tag), timeout=240000)
                        sc_ = await pg.evaluate("() => Math.round(HSIM.state().score)"); res.append({'kind': 'final', 'score': sc_}); break
                    if kind == 'drive':
                        r = json.loads(await pg.evaluate("async () => { " + ANG + " return await " + DRIVE.strip() + "; }"))
                        r['i'] = st['i']; res.append(r); log('drive %2d' % st['i'], json.dumps(r, ensure_ascii=False))
                        if not r.get('done'): await pg.evaluate("() => { HSIM.jump(HSIM.state().phase + 1); return 1; }")
                        if SHOTS:
                            await pg.evaluate("() => __hsPump(1, 33, true)"); await pg.screenshot(path="%s/%s_%02d_done.png" % (OUT, tag, st['i']), timeout=240000)
                        for _ in range(30):
                            await pg.wait_for_timeout(100); n2 = await pg.evaluate("() => HSIM.state().phase")
                            if n2 != st['i']: break
                        if SHOTS:
                            nk = await pg.evaluate("() => { var S = HSIM.state(), p = S.phases[S.phase]; return p ? p.kind : null; }")
                            if nk == 'drive':
                                await pg.evaluate("() => { var S = HSIM.state(), f = 0; while (S.move && f < 200) { __hsPump(1, 33); f++; } __hsPump(2, 33, true); return 1; }"); await pg.screenshot(path="%s/%s_%02d_arrive.png" % (OUT, tag, st['i'] + 1), timeout=240000)
                        continue
                    if kind == 'survey':
                        if SHOTS:
                            await pg.evaluate("() => { var S = HSIM.state(), f = 0; while (S.move && f < 200) { __hsPump(1, 33); f++; } __hsPump(2, 33, true); return 1; }"); await pg.screenshot(path="%s/%s_%02d_survey.png" % (OUT, tag, st['i']), timeout=240000)
                        r = json.loads(await pg.evaluate("async () => { " + ANG + " return await " + SURVEY.strip() + "; }")); r['i'] = st['i']; res.append(r); log('survey  ', json.dumps(r, ensure_ascii=False))
                        for _ in range(30):
                            await pg.wait_for_timeout(100); n2 = await pg.evaluate("() => HSIM.state().phase")
                            if n2 != st['i']: break
                        if n2 == st['i']: await pg.evaluate("() => { HSIM.jump(HSIM.state().phase + 1); return 1; }"); res[-1]['forced'] = True
                        continue
                    # the cards
                    info = await pg.evaluate("() => { var C = document.getElementById('hsCard'); return C && !C.hidden ? (C.querySelector('h2') || {}).textContent || '' : ''; }")
                    if kind == 'wait':
                        for _ in range(40):
                            if await pg.evaluate("() => { var b = document.getElementById('hsSkip'); return !!(b && !b.disabled); }"): break
                            await pg.wait_for_timeout(150)
                        await pg.evaluate("() => document.getElementById('hsSkip').click()")
                    elif kind == 'quiz':
                        await pg.evaluate("() => { var S = HSIM.state(), p = S.phases[S.phase]; document.querySelectorAll('#hsCard .hsim__opt')[p.q.ok].click(); return 1; }"); await pg.wait_for_timeout(150); await pg.evaluate("() => document.getElementById('hsNext').click()")
                    elif kind == 'dose':
                        await pg.evaluate("() => { var S = HSIM.state(), p = S.phases[S.phase], i = document.getElementById('hsDose'); i.value = p.d.ok[0]; document.getElementById('hsSet').click(); return 1; }"); await pg.wait_for_timeout(150); await pg.evaluate("() => document.getElementById('hsNext').click()")
                    elif kind == 'prep':
                        secs = await pg.evaluate("() => { var S = HSIM.state(), p = S.phases[S.phase]; var b = document.getElementById('hsHold'); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 })); return p.prep.secs || 3; }")
                        await pg.wait_for_timeout(int(secs * 1000) + 900)
                    res.append({'i': st['i'], 'kind': kind, 'title': info[:40]}); log('card %-6s' % kind, info[:50])
                    for _ in range(40):
                        await pg.wait_for_timeout(100); n2 = await pg.evaluate("() => { var S = HSIM.state(); return S ? S.phase : -9; }")
                        if n2 != st['i']: break
                ALL[tag] = {'phases': S0['phases'], 'tools': S0['kinds'], 'run': res}
                await pg.evaluate("() => { try { HSIM.close(); } catch (e) {} window.requestAnimationFrame = window.__raf0; window.__qOn = 0; var q = window.__q || []; window.__q = []; q.forEach(function (cb) { try { window.__raf0(cb); } catch (e) {} }); return 1; }")
                json.dump(ALL, open(OUT + '/audit.json', 'w'), ensure_ascii=False, indent=1)
        log('errors', errs[:5]); await b.close()
asyncio.run(main())
