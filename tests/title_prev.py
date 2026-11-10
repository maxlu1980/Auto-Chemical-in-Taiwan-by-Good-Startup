# the title card at Okachimachi: where its buttons are, that the technical-data button is the widest thing after Start, that everything fits; a picture of each
#   python3 title_prev.py <out dir> <WxH,WxH…> <zh,en,ja>     SHOTS=0 for the figures only
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]); SIZES = [tuple(int(v) for v in a.split('x')) for a in sys.argv[2].split(',')]; LANGS = sys.argv[3].split(','); SHOT = os.environ.get('SHOTS', '1') == '1'; FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
async def main():
    bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for lang in LANGS:
            ctx = await b.new_context(viewport={"width": SIZES[0][0], "height": SIZES[0][1]}, has_touch=SIZES[0][0] < 900, is_mobile=SIZES[0][0] < 900); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
            await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; " + os.environ.get('EXTRA', '') + " try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")   # EXTRA='window.ISLE_SNDCHIP = 1;' holds the sound back as a browser does: the longer hint
            await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000)
            for _ in range(480):
                if await pg.evaluate("() => { const b = document.getElementById('acBoot'); const gone = !b || b.hidden || getComputedStyle(b).display === 'none' || parseFloat(getComputedStyle(b).opacity) < 0.02; return gone && !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready); }"): break
                await pg.wait_for_timeout(500)
            for (w, h) in SIZES:
                await pg.set_viewport_size({"width": w, "height": h}); await pg.wait_for_timeout(900)
                r = await pg.evaluate("""() => { const c = document.querySelector('.isle__tin'), R = c.getBoundingClientRect(); const q = (id) => { const e = document.getElementById(id); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), e.textContent.trim().slice(0, 60)]; };
                  return { card: [Math.round(R.left), Math.round(R.top), Math.round(R.width), Math.round(R.height)], vh: innerHeight, vw: innerWidth, fits: R.top >= -0.5 && R.bottom <= innerHeight + 0.5 && R.left >= -0.5 && R.right <= innerWidth + 0.5, scroll: c.scrollHeight > c.clientHeight + 1, start: q('isStart'), walk: q('isTkWalk'), tech: q('isSkip'), qual: q('isQual'), snd: q('isSndHint'), hidden: document.getElementById('isTitle').hidden }; }""")
                t = r['tech']; ok = r['fits'] and not r['hidden'] and not errs and bool(t) and t[1] >= 0 and t[1] + t[3] <= r['vh'] and r['start'][1] >= 0 and (not r['scroll'] or os.environ.get('SCROLL_OK') == '1')   # the card may scroll inside on the lowest screens (SCROLL_OK=1): Start and the technical-data button must still be in sight
                log('OK ' if ok else 'BAD', lang, '%dx%d' % (w, h), json.dumps(r, ensure_ascii=False), errs[:2])
                if not ok: bad.append((lang, w, h))
                if SHOT:
                    try: await pg.screenshot(path="%s/title_%s_%dx%d.png" % (OUT, lang, w, h), timeout=170000)
                    except Exception as e: log('shot skipped')
            await ctx.close()
        await b.close()
    log('BAD', bad)
asyncio.run(main())
