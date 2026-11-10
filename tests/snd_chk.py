# (v79) the station's own sounds at Okachimachi, listened to through an analyser on the street-sound output: with the listener on a platform —
# the platform doors' pair of notes and a train's door chime as a train stands and leaves, the bird call at the stairs, the motors' whine as
# it pulls out; with the listener in the hall — the guidance chime by the gates and the readers' beeps. Each is looked for as a peak at its
# own pitch above the usual level there. (What they sound like to an ear is not judged here.)
#   python3 snd_chk.py <out dir>
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
TAP = """(function(){ var S = TKM.snd(); if (!S) return 'no sound'; if (!window.__an) { var an = S.ctx.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0; S.out.connect(an); window.__an = an; window.__db = new Float32Array(an.frequencyBinCount); window.__pk = {}; window.__n = 0;
  window.__tm = setInterval(function () { an.getFloatFrequencyData(window.__db); var hz = S.ctx.sampleRate / an.fftSize; window.__n++; [659, 784, 1319, 1568, 1760, 1976, 2350, 3400, 4300].forEach(function (f) { var b = Math.round(f / hz), v = Math.max(window.__db[b - 1], window.__db[b], window.__db[b + 1]); (window.__pk[f] = window.__pk[f] || []).push(Math.round(v)); }); }, 60); } return S.ctx.state; })()"""
STAT = """(function(){ var o = {}; Object.keys(window.__pk).forEach(function (f) { var a = window.__pk[f].slice().sort(function (p, q) { return p - q; }); o[f] = [a[Math.floor(a.length / 2)], a[a.length - 1]]; }); var S = TKM.snd(); return JSON.stringify({ n: window.__n, pk: o, inv: !!S.inv, z: !!S.okaZ, doors: TK.T.oka.doors.map(function (d) { return [d.ti, d.want, d.evt || null]; }), tr: TK.T.trains.map(function (t) { return [t.x, t.st, +(t.wait || 0).toFixed(1), +t.v.toFixed(1)]; }) }); })()"""
async def main():
    bad = []
    def need(ok, what, info=''):
        log(('OK  ' if ok else 'BAD ') + what, info if (not ok or len(str(info)) < 300) else str(info)[:300])
        if not ok: bad.append(what)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 1280, "height": 760}); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}")
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
        while time.time() - t0 < 300:
            if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500)
        await pg.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; R3.render = function () {}; if (POST) POST.render = function () {}; return 1; })()")
        await pg.evaluate("() => { ISLE_x.sndTap(); document.dispatchEvent(new Event('pointerup')); }"); await pg.mouse.click(640, 380); await pg.wait_for_timeout(2500)
        async def listen(e, l, secs, until=None):
            await pg.evaluate("([e, l]) => ISLE_x.ev('(function(){ var T = TK.T, a = T.toW(' + e[0] + ', 0, ' + e[2] + '), b = T.toW(' + l[0] + ', 0, ' + l[2] + '); ISLE_x.camHold([a.x, T.Y + ' + e[1] + ', a.z], [b.x, T.Y + ' + l[1] + ', b.z]); pos.set(a.x, T.Y + ' + (e[1] - 1.3) + ', a.z); return 1; })()')", [e, l])
            await pg.evaluate("() => { window.__pk = {}; window.__n = 0; }"); t0 = time.time(); seen = set()
            while time.time() - t0 < secs:
                await pg.wait_for_timeout(1000); s = json.loads(await pg.evaluate(EV, STAT))
                for d in s['doors']:
                    if d[1] is not None: seen.add((d[0], d[1]))
                if until and until(s, seen, time.time() - t0): break
            return json.loads(await pg.evaluate(EV, STAT)), seen
        st = await pg.evaluate(EV, TAP); log('sound', st)
        need(st == 'running', 'the street-sound output is running', st)
        # on the west platform, by the stair's head: until both of its tracks have had a train stand and leave
        s, seen = await listen([6.5, 8.9, -9], [6.5, 8.6, -40], 150, lambda s, seen, t: t > 45 and {(2, 1), (2, 0), (3, 1), (3, 0)} <= seen)
        log('platform', json.dumps(s)[:900])
        def up(f, by=14): return s['pk'][str(f)][1] - s['pk'][str(f)][0] >= by
        need({(2, 1), (2, 0), (3, 1), (3, 0)} <= seen, 'on the platform: both tracks\' doors were seen to open and shut', sorted(seen))
        need(up(1319) and up(1760), 'on the platform: the platform doors\' rising pair of notes', (s['pk']['1319'], s['pk']['1760']))
        need(up(1976) and up(1568), 'on the platform: a train\'s door chime', (s['pk']['1976'], s['pk']['1568']))
        need(up(3400, 10) or up(4300, 10), 'on the platform: the bird call at the stairs', (s['pk']['3400'], s['pk']['4300']))
        need(s['inv'] and s['z'], 'the motors\' voices and the station\'s timers are set up', (s['inv'], s['z']))
        # in the hall, before the gates
        s, seen = await listen([11.6, 1.6, 10.8], [8, 1.4, 10.8], 22)
        log('hall', json.dumps(s['pk']))
        need(up(784) and up(659), 'in the hall: the guidance chime by the gates', (s['pk']['784'], s['pk']['659']))
        need(up(2350, 10), 'in the hall: a reader\'s beep', s['pk']['2350'])
        # she walks through a gate: her own beep
        before = await pg.evaluate(EV, "(function(){ var T = TK.T, S = T.ST, a = T.toW(S.GX + 0.9, 0, S.ZB + 1.03); pos.set(a.x, T.Y + 0.14, a.z); return 1; })()"); await pg.wait_for_timeout(700); await pg.evaluate("() => { window.__pk = {}; window.__n = 0; }")
        await pg.evaluate(EV, "(function(){ var T = TK.T, S = T.ST, a = T.toW(S.GX - 0.9, 0, S.ZB + 1.03); pos.set(a.x, T.Y + 0.14, a.z); return 1; })()"); await pg.wait_for_timeout(900); s = json.loads(await pg.evaluate(EV, STAT))
        need(s['pk']['2350'][1] - s['pk']['2350'][0] >= 14, 'through a gate: her own card\'s beep', s['pk']['2350'])
        need(not errs, 'no errors', errs[:4]); await b.close()
    log('BAD', bad)
asyncio.run(main())
