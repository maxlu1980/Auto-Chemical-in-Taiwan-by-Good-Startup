# (v74) the recorded music over http: which recording plays, when, from where — then, as in snd_flow.py, the sound as a viewer meets it since v83: the loading screen's button,
# the title at Okachimachi (the hint, the tap, the station's own sounds and the title's music), Start, the flight, and the film of Taiwan inside the
# flight with its score        TAP=boot (the loader's button) | title (a tap on the title) | none        BASEURL=http://… to hear the recordings
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.environ.get('TK_FILE', 'build/test_local.html'); DEV = os.environ.get('DEV', 'desk'); TAP = os.environ.get('TAP', 'title'); BASE = os.environ.get('BASEURL', 'http://127.0.0.1:8766/')
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
P = "() => JSON.stringify(Object.assign(ISLE_x.snd ? ISLE_x.snd() : {}, { op: !!(ISLE_x.op && ISLE_x.op.state().on), title: (document.getElementById('isTitle')||{}).hidden === false, hint: (document.getElementById('isSndHint')||{}).textContent, bootTxt: (document.querySelector('#acBoot .acb-snd')||{}).textContent, tour: ISLE_x.tour ? ISLE_x.tour().stage : null }))"
async def main():
    bad = []
    def need(ok, what, got=''):
        log('OK ' if ok else 'BAD', what, got if isinstance(got, str) else json.dumps(got, ensure_ascii=False)[:400])
        if not ok: bad.append(what)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        VP = (1280, 760) if DEV == 'desk' else (390, 780)
        ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk')
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:400])); pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text[:300]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_SNDCHIP = 1; window.ISLE_CINE_NOGUARD = true; try { sessionStorage.clear(); localStorage.setItem('ac-guide-lang', '" + os.environ.get('LANGX', 'zh') + "'); } catch (e) {} window.__starts = []; var _st = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (w, o) { try { if (this.buffer && this.buffer.duration > 20) window.__starts.push({ dur: +this.buffer.duration.toFixed(2), when: +(w || 0).toFixed(2), off: +(o || 0).toFixed(2), now: +this.context.currentTime.toFixed(2) }); } catch (e) {} return _st.apply(this, arguments); };")
        await pg.goto((BASE + FILE) if BASE else ("file://" + D + "/" + FILE), wait_until="load", timeout=240000); await pg.wait_for_timeout(4000)
        s = json.loads(await pg.evaluate(P)); need(s.get('boot') is True and not s.get('ok'), 'loading: the sound is held back and the loader offers its button', s)
        if TAP == 'boot':
            bx = await pg.evaluate("() => { const r = document.querySelector('#acBoot .acb-snd').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }")
            if DEV == 'desk': await pg.mouse.click(bx[0], bx[1])
            else: await pg.touchscreen.tap(bx[0], bx[1])
            await pg.wait_for_timeout(600); s = json.loads(await pg.evaluate(P)); need(s.get('ok') is True, 'the loader\'s button lets the sound in', s)
        t0 = time.time()
        while time.time() - t0 < 300:
            if await pg.evaluate("() => (document.getElementById('isTitle')||{}).hidden === false && !!(ISLE_x.intro && ISLE_x.intro().gone) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(2500); s = json.loads(await pg.evaluate(P)); need(s['title'] and not s['op'], 'after loading: the title at Okachimachi, no film', s)
        if TAP == 'title':
            need(not s.get('ok') and not s.get('loop') and ('御徒町' in s['hint'] or 'Okachimachi' in s['hint']), 'the title is silent until a touch, and its hint says what a touch lets in (the station)', s)
            if DEV == 'desk': await pg.mouse.click(VP[0] - 60, 60)
            else: await pg.touchscreen.tap(VP[0] - 40, 60)
            await pg.wait_for_timeout(800)
        if TAP != 'none':
            for i in range(8):
                await pg.wait_for_timeout(1500); s = json.loads(await pg.evaluate(P))
                if s.get('loop'): break
            tk = await pg.evaluate("() => { try { return JSON.stringify(ISLE_x.tkSnd ? ISLE_x.tkSnd() : null); } catch (e) { return 'x'; } }")
            need(s.get('ok') is True and s.get('loop') is True, 'on the title after the touch: the sound is open and the title\'s music plays (the station\'s own sounds start with the same touch)', [s, tk])
        r = await pg.evaluate("() => ISLE_x.fly()"); t0 = time.time()
        while time.time() - t0 < 40:   # (the flight's craft are built at the first Start: a slow machine shows the title a moment longer)
            await pg.wait_for_timeout(700); s = json.loads(await pg.evaluate(P))
            if not s['title'] and not s.get('loop'): break
        need(r in ('fly', 'flying') and not s['title'] and not s.get('loop'), 'Start: the flight, the title\'s music leaves', [r, s])
        ft = json.loads(await pg.evaluate("() => JSON.stringify(ISLE_x.flyFT())")); await pg.evaluate("(t) => ISLE_x.flySeek(t)", ft['tpe'] - 0.2); t0 = time.time()
        while time.time() - t0 < 120:
            if await pg.evaluate("() => ISLE_x.op.state().on ? 1 : 0"): break
            await pg.wait_for_timeout(400)
        await pg.wait_for_timeout(2500); s = json.loads(await pg.evaluate(P)); fm = await pg.evaluate("() => { const A = CINE.aud(), F = CINE.F(); return JSON.stringify({ aud: !!A, rec: A && !!A.rec, n: A && A.n, dead: A && A.dead, T: F && F.T, st: CINE.rec().st, chip: !!document.querySelector('.isle__op-snd'), starts: window.__starts }); }")
        f = json.loads(fm)
        if TAP == 'none': need(s['op'] and s['tour'] == 1, 'the film of Taiwan, inside the flight (the sound still held back)', [s, f])
        else: need(s['op'] and s['tour'] == 1 and f['aud'] and not f['dead'] and not f['chip'], 'the film of Taiwan, inside the flight, with its score and no “tap for sound” (the sound was opened at the start)', [s, f])
        await pg.evaluate("() => { var F = CINE.F(); ISLE_x.op.jump(F.T * 0.992); }"); t0 = time.time()
        while time.time() - t0 < 120:
            if await pg.evaluate("() => (!ISLE_x.op.state().on && ISLE_x.tour().stage === 2) ? 1 : 0"): break
            await pg.wait_for_timeout(400)
        s = json.loads(await pg.evaluate(P)); need(not s['op'] and s['tour'] == 2 and not s['title'], 'the film ends: the flight goes on (no title)', s)
        log('recordings', await pg.evaluate("() => JSON.stringify({ st: CINE.rec().st, log: CINE.rec().log, starts: window.__starts })"))
        need(not errs, 'no errors', errs[:6]); await b.close()
    log('BAD', bad)
asyncio.run(main())
