# (v74) the recorded music over http: which recording plays, when, from where; then as in snd_flow.py — the sound as a viewer meets it, with the browser holding it back (ISLE_SNDCHIP): the loading screen's button, the film's chip, the tap, the title's waltz
import asyncio, sys, json, time, os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.environ.get('TK_FILE', 'build/test_local.html'); DEV = os.environ.get('DEV', 'desk'); TAP = os.environ.get('TAP', 'film')
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
P = "() => JSON.stringify(Object.assign(ISLE_x.snd ? ISLE_x.snd() : {}, { op: !!(ISLE_x.op && ISLE_x.op.state().on), title: (document.getElementById('isTitle')||{}).hidden === false, hint: (document.getElementById('isSndHint')||{}).textContent, bootTxt: (document.querySelector('#acBoot .acb-snd')||{}).textContent }))"
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        VP = (1280, 760) if DEV == 'desk' else (390, 780)
        ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk')
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:400])); pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text[:300]) if m.type == "error" and "ERR_" not in m.text else None)
        await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_SNDCHIP = 1; try { sessionStorage.clear(); localStorage.setItem('ac-guide-lang', '" + os.environ.get('LANGX', 'zh') + "'); } catch (e) {} window.__starts = []; var _st = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (w, o) { try { if (this.buffer && this.buffer.duration > 20) window.__starts.push({ dur: +this.buffer.duration.toFixed(2), when: +(w || 0).toFixed(2), off: +(o || 0).toFixed(2), now: +this.context.currentTime.toFixed(2) }); } catch (e) {} return _st.apply(this, arguments); };")
        await pg.goto(os.environ.get("BASEURL", "http://127.0.0.1:8766/") + FILE, wait_until="load", timeout=240000); await pg.wait_for_timeout(4000)
        log('boot', await pg.evaluate(P)); pass
        if TAP == 'boot':
            bx = await pg.evaluate("() => { const r = document.querySelector('#acBoot .acb-snd').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }")
            if DEV == 'desk': await pg.mouse.click(bx[0], bx[1])
            else: await pg.touchscreen.tap(bx[0], bx[1])
            await pg.wait_for_timeout(400); log('after boot tap', await pg.evaluate(P))
        t0 = time.time()
        while time.time() - t0 < 200:
            if await pg.evaluate("() => (window.ISLE_x && ISLE_x.op && ISLE_x.op.state().on) ? 1 : 0"): break
            await pg.wait_for_timeout(500)
        log('film on after', round(time.time() - t0, 1)); await pg.wait_for_timeout(3000); log('film', await pg.evaluate(P)); pass
        log('film music', await pg.evaluate("() => { const A = CINE.aud(), F = CINE.F(); return JSON.stringify({ rec: A && !!A.rec, n: A && A.n, src: !!(A && A.src), sub: !!(A && A.sub), dead: A && A.dead, plan: A && A.plan, T: F && F.T, tT: F && F.p && F.p.titleU ? +(F.p.titleU * F.T).toFixed(3) : null, st: CINE.rec().st, starts: window.__starts }); }"))
        if TAP == 'film':
            if DEV == 'desk': await pg.mouse.click(VP[0] // 2, VP[1] // 2)
            else: await pg.touchscreen.tap(VP[0] // 2, VP[1] // 2)
            await pg.wait_for_timeout(1500); log('after film tap', await pg.evaluate(P), await pg.evaluate("() => { const A = CINE.aud(); return A ? JSON.stringify({ dead: A.dead, n: A.n }) : null; }"))
        t0 = time.time()
        while time.time() - t0 < 150:
            if await pg.evaluate("() => (document.getElementById('isTitle')||{}).hidden === false && !ISLE_x.op.state().on ? 1 : 0"): break
            await pg.wait_for_timeout(1000)
        log('title after', round(time.time() - t0, 1))
        for i in range(4): await pg.wait_for_timeout(2500); log('title', await pg.evaluate(P))
        log('starts so far', await pg.evaluate("() => JSON.stringify(window.__starts)"))
        pass
        await pg.evaluate("() => ISLE_x.fly()"); await pg.wait_for_timeout(3000); log('flying', await pg.evaluate(P))
        log('rec', await pg.evaluate("() => JSON.stringify({ st: CINE.rec().st, log: CINE.rec().log, starts: window.__starts, film: CINE.aud() ? { rec: !!CINE.aud().rec } : null })")); log('errors', errs[:8]); await b.close()
asyncio.run(main())
