# (v84) the lens's buttons keep their pictures: the quality card's own labels (“now: …”) were written into every element of the page that carried the
# same attribute, the lens's buttons among them, so once the card had been open the buttons showed “now: off” in place of their arrows. Here: the
# buttons' pictures before, while and after the quality card is open (at Okachimachi on foot and in Taipei), and the card's own labels still filled
#   python3 rot_chk.py <desk|mobile> [zh,en,ja]
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEV = sys.argv[1]; LANGS = (sys.argv[2] if len(sys.argv) > 2 else 'zh').split(','); FILE = os.environ.get('TK_FILE', 'build/test_min.html'); VP = {'desk': (1280, 760), 'mobile': (390, 780)}[DEV]
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
BTN = """() => ['isRotL', 'isRotR', 'isCamBack', 'isCamOut', 'isCamIn', 'isCamView'].map(id => { const e = document.getElementById(id); if (!e) return [id, null]; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return [id, !!e.querySelector('svg'), e.textContent.trim().slice(0, 12), cs.display !== 'none' && r.width > 0]; })"""
async def main():
    bad = []
    def need(ok, what, got=''):
        log('OK ' if ok else 'BAD', what, got if isinstance(got, str) else json.dumps(got, ensure_ascii=False)[:420])
        if not ok: bad.append(what)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for lang in LANGS:
            ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk'); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
            await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")
            await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
            while time.time() - t0 < 300:
                if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
                await pg.wait_for_timeout(400)
            await pg.wait_for_timeout(1500)
            for place, go in (('Okachimachi on foot', "(function(){ okachiArrive(); if (fall && fall.tk) tkWalkStart(); return mode; })()"), ('Taipei', "(function(){ if (TKW) tkWalkLeave(); cityArrive('taipei', 'fly', [0, 76, 0.12]); fall = null; travel = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; enterHud(); return TK && TK.id; })()")):
                r = await pg.evaluate(EV, go); await pg.wait_for_timeout(1800); a = await pg.evaluate(BTN)
                need(all(x[1] for x in a if x[1] is not None) and len([x for x in a if x[1] is not None]) == 6, lang + ' ' + place + ': the six buttons of the lens have their pictures', a)
                await pg.evaluate(EV, "(function(){ qualCard(); return 1; })()"); await pg.wait_for_timeout(2600)   # the card's labels are written again every second while it is open
                q = await pg.evaluate("() => { const L = [...document.querySelectorAll('#isCard .isle__qcur')].map(e => e.textContent); return { n: L.length, filled: L.filter(s => s.length > 2).length, first: L[0] }; }")
                c = await pg.evaluate(BTN); need(all(x[1] and not x[2] for x in c), lang + ' ' + place + ': with the quality card open, the buttons still have their pictures and no words', c)
                need(q['n'] >= 6 and q['filled'] == q['n'], lang + ' ' + place + ': the card\'s own “now: …” labels are filled', q)
                await pg.evaluate(EV, "(function(){ cardClose(); return 1; })()"); await pg.wait_for_timeout(1400); d = await pg.evaluate(BTN)
                need(all(x[1] and not x[2] for x in d), lang + ' ' + place + ': after the card is closed, the same', d)
            need(not errs, lang + ' no errors', errs[:3]); await ctx.close()
        await b.close()
    log('BAD', bad)
asyncio.run(main())
