# (v83) the start, in its new order: the loader, then the title at Okachimachi at once (no film first); Start flies from Okachimachi, and the film of
# Taiwan plays inside that flight, where she dives through the cloud, and the flight then comes down to Taipei; the film plays once a session; skip in
# the film ends the film and she lands; the button for the technical data on the title opens the guide with its list of products
#   python3 open_chk.py <out dir> <desk|mobile> [parts: boot,tech,fly,skip,again,load]      SHOTS=1 for pictures (slow under software rendering)
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]); DEV = sys.argv[2]; PARTS = (sys.argv[3] if len(sys.argv) > 3 else 'boot,tech,fly,skip,again,load').split(','); FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
VP = {'desk': (1280, 760), 'mobile': (390, 780)}[DEV]; SHOTS = os.environ.get('SHOTS', '') == '1'; LANG = os.environ.get('LANG_', 'zh')
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
ST = """() => { const T0 = document.getElementById('isTitle'), B = document.getElementById('acBoot'), O = document.getElementById('isOp'), r = document.getElementById('isle'), w = document.getElementById('isFlyW');
  return { boot: !!(B && !B.hidden && parseFloat(getComputedStyle(B).opacity) > 0.02), title: !!(T0 && !T0.hidden), op: ISLE_x.op.state().on, mid: ISLE_x.op.state().mid, tour: ISLE_x.tour(), cine: !!(r && r.classList.contains('is-cine')), flying: !!(r && r.classList.contains('is-flying')), white: O ? O.classList.contains('is-white') : null, flyW: w ? +w.style.opacity : null, flyWvis: w ? getComputedStyle(w).visibility : null,
    opT: (() => { const F = window.CINE && CINE.F && CINE.F(); return F ? [+(F.t || 0).toFixed(2), F.T] : null; })(), open: document.body.classList.contains('isle-open'), menu: !document.getElementById('pmenuPanel').hidden, hash: location.hash, seen: (() => { try { return sessionStorage.getItem('isle-tour'); } catch (e) { return 'x'; } })() }; }"""
async def shot(pg, name):
    if not SHOTS: return
    try: await pg.screenshot(path=OUT + '/' + name + '.png', timeout=170000)
    except Exception as e: log('shot skipped', name)
async def ready(pg, staged):
    t0 = time.time()
    while time.time() - t0 < 420:
        if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
        await pg.wait_for_timeout(400)
    for _ in range(160):
        if await pg.evaluate("() => { const b = document.getElementById('acBoot'); if (!b || b.hidden) return true; const cs = getComputedStyle(b); return cs.display === 'none' || parseFloat(cs.opacity) < 0.02; }"): break
        await pg.wait_for_timeout(400)
    await pg.wait_for_timeout(900)
async def main():
    bad = []
    def need(ok, what, got=''):
        log('OK ' if ok else 'BAD', what, got if isinstance(got, str) else json.dumps(got, ensure_ascii=False)[:520])
        if not ok: bad.append(what)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk'); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text else None)
        # a load as a visitor has it (the stages one by one), with the tests' hooks; the film of Taiwan allowed (ISLE_TOUR) under its own once-a-session rule
        INIT = "window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_BOOTTEST = 1; window.ISLE_TOUR = 1; window.ISLE_CINE_NOGUARD = true; try { localStorage.setItem('ac-guide-lang', '" + LANG + "'); } catch (e) {}"
        await pg.add_init_script(INIT)
        if 'load' in PARTS:
            # the loader's own button, pressed while the game is still loading: the guide, with its list of products, and no game behind it
            pg2 = await ctx.new_page(); await pg2.add_init_script(INIT + " window.ISLE_BOOTPAUSE = 900;")
            await pg2.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000)
            for _ in range(300):
                if await pg2.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().run) ? 1 : 0"): break
                await pg2.wait_for_timeout(200)
            lb = await pg2.evaluate("() => { const b = document.querySelector('#acBoot .acb-btn'), r = b.getBoundingClientRect(), c = document.querySelector('#acBoot .acb-in').getBoundingClientRect(); return { text: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), cardW: Math.round(c.width), inCard: r.left >= c.left && r.right <= c.right && r.top >= c.top && r.bottom <= c.bottom, bg: getComputedStyle(b).backgroundColor, logo: !!document.querySelector('#acBoot .acb-logo.is-on img[src]'), ends: [...document.querySelectorAll('#acBoot .acb-ends b')].map(e => e.textContent), run: document.querySelector('#acBoot .acb-run').style.transform, bar: document.querySelector('#acBoot .acb-bar i').style.transform }; }")
            need(lb['inCard'] and lb['w'] >= lb['cardW'] * 0.8 and lb['h'] >= 48 and lb['logo'] and all(lb['ends']), 'loader: the technical-data button is on the card, nearly as wide as it; the logo is set; the journey has its two ends', lb)
            await shot(pg2, 'loader_' + DEV); await pg2.evaluate("() => document.querySelector('#acBoot .acb-btn').click()"); t0 = time.time(); s = None
            while time.time() - t0 < 60:   # the stage in progress finishes first, then the loader fades
                s = await pg2.evaluate("() => { const B = document.getElementById('acBoot'); return { boot: !!(B && !B.hidden && parseFloat(getComputedStyle(B).opacity) > 0.02), open: document.body.classList.contains('isle-open'), menu: !document.getElementById('pmenuPanel').hidden, hash: location.hash, intro: ISLE_x.intro() }; }")
                if not s['boot'] and s['menu']: break
                await pg2.wait_for_timeout(500)
            need(not s['boot'] and not s['open'] and s['menu'] and '/island' not in s['hash'], 'loader: its button opens the guide (the loader gone, no game on top, the list of products out)', s); await shot(pg2, 'loader_guide_' + DEV); await pg2.close()
        await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); await ready(pg, True)
        if 'boot' in PARTS:
            s = await pg.evaluate(ST); need(s['title'] and not s['op'] and not s['cine'] and not s['boot'], 'after loading: the title at Okachimachi, no film', s)
            need(s['tour']['want'] and s['tour']['prepared'] and s['tour']['boot'], 'the film of Taiwan was made ready during the load, for the flight', s['tour'])
            tk = await pg.evaluate(EV, "JSON.stringify({ tk: TK && TK.id, phase: fall && fall.phase, ftk: !!(fall && fall.tk), mode: mode })"); need('"tokyo"' in tk and '"title"' in tk, 'the scene behind the title is Okachimachi', tk)
            bt = await pg.evaluate("""() => { const q = (id) => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { text: e.textContent.trim().slice(0, 40), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, color: cs.color, seen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth }; };
              const c = document.querySelector('.isle__tin').getBoundingClientRect(), a = document.querySelector('.isle__tact').getBoundingClientRect(); return { start: q('isStart'), tech: q('isSkip'), walk: q('isTkWalk'), cardW: Math.round(c.width), actW: Math.round(a.width), fits: c.top >= -0.5 && c.bottom <= innerHeight + 0.5 }; }""")
            t = bt['tech']; need(bool(t) and t['seen'] and t['w'] >= bt['actW'] - 2 and t['h'] >= 46 and t['w'] > bt['start']['w'] and bt['fits'], 'title: the technical-data button runs the full width under Start, in view, the card fits', bt); await shot(pg, 'title_' + DEV)
        if 'tech' in PARTS:
            await pg.evaluate("() => document.getElementById('isSkip').click()"); await pg.wait_for_timeout(1500); s = await pg.evaluate(ST)   # (a real click waits for two steady frames: too long under software rendering)
            for _ in range(40):   # the list opens half a second after the game closes: under software rendering a frame in hand can hold the timer back
                if s['menu']: break
                await pg.wait_for_timeout(500); s = await pg.evaluate(ST)
            need(not s['open'] and s['menu'] and '/island' not in s['hash'], 'title: the button opens the guide with the list of products out', {k: s[k] for k in ('open', 'menu', 'hash')}); await shot(pg, 'tech_' + DEV)
            await pg.evaluate("() => Menu.open(false)"); await pg.goto("about:blank"); await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); await ready(pg, True)
        if 'fly' in PARTS or 'skip' in PARTS:
            ft = json.loads(await pg.evaluate("() => JSON.stringify(ISLE_x.flyFT())")); # (v88) stepped and read in the same turn: a frame of the page's own between the two could carry the flight past the dive (a quarter of a second away) before it was read
            rs = await pg.evaluate("(t) => { const r = ISLE_x.flySeek(t); return { r: r, s: (" + ST + ")() }; }", ft['tpe'] - 0.25); r = rs['r']; s = rs['s']
            need(r is not None and s['flying'] and not s['op'] and s['tour']['stage'] == 0, 'the flight from Okachimachi, stepped to the dive (the film not yet)', {'t': r, 'tour': s['tour']})
            w0 = await pg.evaluate(EV, "(function(){ flyTick(0.05); return +document.getElementById('isFlyW').style.opacity; })()"); need(isinstance(w0, (int, float)) and w0 > 0.3, 'the dive goes white before the scene changes', w0)
            t0 = time.time(); s = None
            while time.time() - t0 < 90:
                s = await pg.evaluate(ST)
                if s['op']: break
                await pg.wait_for_timeout(300)
            need(s['op'] and s['mid'] and s['tour']['on'] and s['cine'] and s['white'] and s['seen'] == '1' and not s['title'], 'at the dive the film of Taiwan begins, inside the flight (white veil, the title stays away, the session remembers)', s)
            need(s['flyWvis'] == 'visible', "the flight's white stays up under the film while the two change places", [s['flyW'], s['flyWvis']])
            await pg.wait_for_timeout(2500); s2 = await pg.evaluate(ST); need(s2['tour']['t'] is not None and abs(s2['tour']['t'] - s['tour']['t']) < 1e-6 and s2['tour']['t'] < ft['tpe'], 'the flight waits at the dive while the film plays', [s['tour']['t'], s2['tour']['t'], ft['tpe']])
            await pg.evaluate("() => { var F = CINE.F(); ISLE_x.op.jump(F.T * 0.42); }"); await pg.wait_for_timeout(1800); await shot(pg, 'tour_mid_' + DEV)
            lab = await pg.evaluate("() => ({ cap: document.querySelector('#isOpCap span').textContent, skip: document.getElementById('isOpSkip').textContent, rider: !!(ISLE_x.op.state().on), flyHudSeen: getComputedStyle(document.getElementById('isFlyHud')).visibility, flySkipSeen: getComputedStyle(document.getElementById('isFlySkip')).visibility })")
            need(lab['flyHudSeen'] == 'hidden' and lab['flySkipSeen'] == 'hidden' and len(lab['skip']) > 0, "in the film the flight's own readout and skip are away, the film's skip is there", lab)
        if 'skip' in PARTS and 'fly' not in PARTS:
            await pg.keyboard.press('Escape'); t0 = time.time(); s = None
            while time.time() - t0 < 60:
                s = await pg.evaluate(ST)
                if not s['op'] and not s['cine']: break
                await pg.wait_for_timeout(250)
            need(not s['op'] and not s['cine'] and s['tour']['stage'] == 2, 'skip in the film: the film ends', s['tour'])
        elif 'fly' in PARTS:
            # the film's end: its title over the island, then white, then down to Taipei
            await pg.evaluate("() => { var F = CINE.F(); ISLE_x.op.jump(F.T * (F.p.titleU + 0.05)); }"); await pg.wait_for_timeout(2600); await shot(pg, 'tour_title_' + DEV)
            tt = await pg.evaluate("() => { const e = document.getElementById('isOpT'), em = e.querySelector('em'); return { op: +getComputedStyle(e).opacity, brand: e.querySelector('b').textContent, credit: em.textContent.slice(0, 80), dev: e.querySelector('.isle__op-dev').textContent }; }")
            need(tt['op'] > 0.5 and 'VOICEVOX:春日部つむぎ' in tt['credit'] and len(tt['brand']) > 3, "the film's title and the sound credit, over the island", tt)
            await pg.evaluate("() => { var F = CINE.F(); ISLE_x.op.jump(F.T * 0.992); }"); t0 = time.time(); s = None
            while time.time() - t0 < 120:
                s = await pg.evaluate(ST)
                if not s['op'] and not s['cine']: break
                await pg.wait_for_timeout(250)
            need(not s['op'] and not s['cine'] and s['tour']['stage'] == 2 and not s['title'], 'the film ends by itself: back in the flight, the title not shown', s)
        if 'fly' in PARTS or 'skip' in PARTS:
            t0 = time.time(); land = None
            while time.time() - t0 < 240:
                land = await pg.evaluate(EV, "JSON.stringify({ tk: TK && TK.id, fall: fall ? fall.phase : null, t: fall && fall.phase === 'fly' ? +fall.t.toFixed(2) : null, mode: mode, hud: !document.getElementById('isHud').hidden, flyW: +document.getElementById('isFlyW').style.opacity, cine: root.classList.contains('is-cine'), title: !document.getElementById('isTitle').hidden })")
                L = json.loads(land)
                if L['fall'] is None and L['mode'] == 'walk': break
                if L['fall'] == 'fly' and L['t'] and L['t'] > ft['tpe'] + 1.2 and not os.environ.get('FULL'): await pg.evaluate("(t) => ISLE_x.flySeek(t)", ft['end'] + 0.2)   # the landing itself, stepped (drawn far too slowly here to wait for)
                await pg.wait_for_timeout(400)
            L = json.loads(land); need(L['tk'] == 'taipei' and L['fall'] is None and L['mode'] == 'walk' and L['hud'] and L['flyW'] == 0 and not L['cine'] and not L['title'], 'she lands at Taipei Main Station and the play begins', L); await shot(pg, 'landed_' + DEV)
        if 'again' in PARTS:
            # the same session, the page loaded again: the flight dives straight to Taipei (the film was seen)
            await pg.goto("about:blank"); await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); await ready(pg, True); s = await pg.evaluate(ST)
            need(s['title'] and s['seen'] == '1' and not s['tour']['want'] and not s['tour']['boot'], 'a second load in the session: the film is not made ready again', s['tour'])
            ft = json.loads(await pg.evaluate("() => JSON.stringify(ISLE_x.flyFT())")); await pg.evaluate("(t) => ISLE_x.flySeek(t)", ft['tpe'] + 0.4); s = await pg.evaluate(ST); tk = await pg.evaluate(EV, "TK && TK.id")
            need(not s['op'] and not s['cine'] and s['tour']['stage'] == 2 and tk == 'taipei', 'a second start in the session: from the dive straight down to Taipei', {'tour': s['tour'], 'tk': tk})
        need(not errs, 'no errors', errs[:4]); await b.close()
    log('BAD', bad)
asyncio.run(main())
