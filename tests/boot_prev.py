# the loader by itself: the page's first screen drawn alone (no guide, no game behind it), at the sizes people hold it, in the three languages
#   python3 boot_prev.py <out dir> [boot html] [views: desk,lap,tab,phone,land] [langs: zh,en,ja] [pct]
import asyncio, sys, os, time
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]); SRC = sys.argv[2] if len(sys.argv) > 2 else D + '/src/_boot.html'; VIEWS = (sys.argv[3] if len(sys.argv) > 3 else 'desk,phone').split(','); LANGS = (sys.argv[4] if len(sys.argv) > 4 else 'zh').split(','); PCT = float(sys.argv[5]) if len(sys.argv) > 5 else 0.62
VP = {'desk': (1280, 760), 'lap': (1366, 640), 'wide': (1920, 1000), 'tab': (820, 1180), 'phone': (360, 780), 'phone2': (412, 915), 'land': (780, 360), 'small': (320, 568)}
os.makedirs(OUT, exist_ok=True)
HEAD = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>\n'
async def main():
    page = HEAD + (open(os.environ["LOGO_JS"], encoding="utf-8").read() if os.environ.get("LOGO_JS") else "") + open(SRC, encoding="utf-8").read().replace("return B; })();", "setTimeout(function () { B.load(1); B.at(%s, 4); }, 300); return B; })();" % PCT) + '\n</body></html>'; f = OUT + '/_p.html'; open(f, 'w', encoding='utf-8').write(page); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for v in VIEWS:
            for lg in LANGS:
                ctx = await b.new_context(viewport={'width': VP[v][0], 'height': VP[v][1]}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)[:200])); await pg.add_init_script("try { localStorage.setItem('ac-guide-lang', '%s'); } catch (e) {}" % lg)
                await pg.goto('file://' + f); await pg.wait_for_timeout(900); await pg.evaluate("(p) => { __boot.at(p, 4); }", PCT); await pg.wait_for_timeout(500)
                # nothing of the card may leave the screen, nothing in it may be cut, the buttons may not cover one another
                r = await pg.evaluate("""() => { var q = (s) => { var e = document.querySelector(s); if (!e || e.hidden) return null; var r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; };
                  var inn = document.querySelector('.acb-in'), o = { vw: innerWidth, vh: innerHeight, card: q('.acb-in'), btn: q('.acb-btn'), snd: q('.acb-snd'), dev: q('.acb-dev'), tip: q('.acb-tip'), title: q('.acb-title'), over: inn.scrollHeight > inn.clientHeight + 1 || inn.scrollWidth > inn.clientWidth + 1 }; return o; }""")
                c = r['card']; ok = c and c[0] >= 0 and c[1] >= 0 and c[2] <= r['vw'] and c[3] <= r['vh'] and not r['over'] and not errs
                bt = r['btn']
                if bt and not (bt[0] >= 0 and bt[1] >= 0 and bt[2] <= r['vw'] and bt[3] <= r['vh']): ok = False
                print('OK ' if ok else 'BAD', v, lg, r, errs[:2], flush=True)
                if not ok: bad.append((v, lg))
                await pg.screenshot(path='%s/%s_%s.png' % (OUT, v, lg)); await ctx.close()
        await b.close()
    print('BAD', bad)
asyncio.run(main())
