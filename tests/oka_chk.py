# (v78) Okachimachi as it stands: that the station's fuller parts are built (both tiers), that the platform doors open while their train stands
# with its doors open and are shut whenever it moves, that the indicators say what the trains do (the Yamanote side: "in about n minutes",
# "arriving", "standing"; the Keihin-Tōhoku side: two trains with their times), that the clocks are drawn, that the way to the platform is
# still found past the new columns and the pillar in the hall, and that nothing throws
#   python3 oka_chk.py <out dir> <low|high> [lang]
import asyncio, sys, json, time, os, re
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; TIER = sys.argv[2]; LANG = sys.argv[3] if len(sys.argv) > 3 else 'zh'; FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
SNAP = "JSON.stringify({ tr: TK.T.trains.map(function (t) { return { x: t.x, st: t.st, cl: !!t.closing, w: +(t.wait || 0).toFixed(1), z: +t.z.toFixed(1) }; }), doors: TK.T.oka.doors.map(function (d) { return [TK.T.TRK[d.ti], +d.f.toFixed(2), +d.A[0].position.z.toFixed(2), +d.B[0].position.z.toFixed(2)]; }), led: Object.keys(TK.T.oka.led).map(function (k) { return TK.T.oka.led[k].key; }) })"
async def main():
    bad = []
    def need(ok, what, info=''):
        log(TIER, ('OK  ' if ok else 'BAD ') + what, info if (not ok or len(str(info)) < 300) else str(info)[:300])
        if not ok: bad.append(what)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": 1280, "height": 760}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_TKTIER = '%s'; try { localStorage.setItem('ac-guide-lang', '%s'); } catch (e) {}" % (TIER, LANG))
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 300:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        await pg.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; R3.render = function () {}; if (POST) POST.render = function () {}; return 1; })()")
        await pg.evaluate("() => { const r = window.requestAnimationFrame; window.requestAnimationFrame = f => setTimeout(() => r(f), 4000); }")  # the play's own frames held back: the trains are stepped by hand
        await pg.wait_for_timeout(800)
        info = json.loads(await pg.evaluate(EV, "JSON.stringify({ oka: !!TK.T.oka, low: !!TK.T.low, doors: TK.T.oka ? TK.T.oka.doors.map(function (d) { return [d.ti, d.A.length, d.B.length]; }) : null, clocks: TK.T.oka ? TK.T.oka.clocks.length : 0, leds: TK.T.oka ? Object.keys(TK.T.oka.led).length : 0, cars: TK.T.trains[0].n, col: TK.T.colliders.length, cam: TK.T.cam.length })"))
        log(TIER, 'built', json.dumps(info))
        need(info['oka'] and info['low'] == (TIER == 'low') and len(info['doors']) == 4 and all(d[1] >= 1 and d[2] >= 1 for d in info['doors']) and info['clocks'] == 3 and info['leds'] == 4, 'the station is built with its doors, indicators and clocks', json.dumps(info))
        need(all((d[1] == 2) == (TIER != 'low') for d in info['doors']), 'the doors are glazed in the fuller build, plain in the light one', info['doors'])
        # the trains run for three minutes of their own time, a tenth of a second at a step
        seen = {}; viol = []; ledSeen = {}; opened = {}
        for step in range(360):
            await pg.evaluate("() => ISLE_x.tkStep(0.5)"); s = json.loads(await pg.evaluate(EV, SNAP))
            for i, tr in enumerate(s['tr']):
                d = [q for q in s['doors'] if abs(q[0] - tr['x']) < 0.01][0]; k = tr['x']
                if tr['st'] == 'run' and tr.get('_') is None:
                    if d[1] > 0.6: viol.append(('open while running', k, tr, d))
                if tr['st'] == 'dwell' and not tr['cl'] and 5 < tr['w'] < 16:
                    if d[1] < 0.99: viol.append(('shut while standing', k, tr, d))
                    else: opened[k] = opened.get(k, 0) + 1; seen.setdefault(k, d)
                if tr['st'] == 'dwell' and tr['cl'] and tr['w'] < 1.2 and d[1] > 0.05: viol.append(('not shut before leaving', k, tr, d))
            for i, kk in enumerate(s['led']): ledSeen.setdefault(i, set()).add(kk.split('|')[0][:40] if i in (0, 3) else re.sub(r'[0-9.]+$', '', kk))
        log(TIER, 'opened', json.dumps(opened), 'sample', json.dumps(seen))
        need(len(opened) == 4, 'the doors of all four tracks opened for a train within three minutes', opened)
        need(not viol, 'doors open only beside a standing train, and are shut before it leaves', viol[:3])
        need(all(abs(d[2] + 0.735) < 0.01 and abs(d[3] - 0.735) < 0.01 for d in seen.values()), 'open, the two leaves of each door stand apart in the cabinets', list(seen.values()))
        y = [sorted(ledSeen[1]), sorted(ledSeen[2])]; kt = [sorted(ledSeen[0])[:3], sorted(ledSeen[3])[:3]]
        log(TIER, 'indicators', json.dumps(y, ensure_ascii=False), json.dumps(kt, ensure_ascii=False))
        need(all(any(x.startswith('約') for x in q) and any(x.startswith('停車中') for x in q) and any(x.startswith('まもなく') for x in q) for q in y), 'the Yamanote indicators: in about n minutes, arriving, standing', json.dumps(y, ensure_ascii=False))
        need(all(q and all(re.match(r'^(各駅停車|快速),\d\d:\d\d,', x) for x in q) for q in kt) and len(ledSeen[0]) > 1 and len(ledSeen[3]) > 1, 'the Keihin-Tōhoku indicators: the kind of train, its time, where it goes — and they change', json.dumps(kt, ensure_ascii=False))
        # the way from the street to the platform, and back
        p = json.loads(await pg.evaluate(EV, "(function(){ var T = TK.T, S = T.ST, a = T.toW(T.VX + 2.6, 0, S.PZC); pos.set(a.x, TK.y + 0.14, a.z); var w = T.toW(4.4, 0, -20.5), up = null, dn = null; try { up = tkPath(w.x, w.z, TK.y + S.YP); } catch (e) { up = 'ERR ' + e; } pos.set(w.x, TK.y + S.YP, w.z); try { dn = tkPath(a.x, a.z, TK.y + 0.14); } catch (e) { dn = 'ERR ' + e; } return JSON.stringify({ up: up && up.length, dn: dn && dn.length }); })()"))
        need(isinstance(p['up'], int) and p['up'] > 2 and isinstance(p['dn'], int) and p['dn'] > 2, 'the way up to the platform and back down is found', p)
        need(not errs, 'no errors', errs[:4]); await b.close()
    log('BAD', bad)
asyncio.run(main())
