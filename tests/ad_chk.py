# (v76) after the products taken out of the guide (アドハー8800 and its direct-glue method, ENAGUARD, the DB products) and the word 密封膠:
# the adhesives guide has three methods and six products and works (every method picked, the take-off, the 3D cover sample, the stages),
# the menus and the footer no longer list what was removed, product names in running text are not bold, and no page says the removed words.
#   python3 ad_chk.py <desk|mobile> <zh,en,ja>
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEV = sys.argv[1]; LANGS = sys.argv[2].split(','); FILE = os.environ.get('TK_FILE', 'build/test_min.html'); VP = {'desk': (1280, 760), 'mobile': (390, 780)}[DEV]
GONE = ['8800', '直貼', '直貼り', 'direct-glue', 'Direct-glue', 'direct glue', 'ENAGUARD', 'エナガード', 'DB 製品', 'DB製品', 'DB products', '密封材']
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
async def main():
    bad = []
    def need(ok, what, info=''):
        log(DEV, ('OK  ' if ok else 'BAD ') + what, str(info)[:330])
        if not ok: bad.append(what)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for lang in LANGS:
            ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk'); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text else None)
            await pg.add_init_script("window.FAST3D = true; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")
            for route in ('#/adhesive', '#/sealant', '#/ureax-hg', '#/protect-one'):
                await pg.goto("file://" + D + "/" + FILE + route, wait_until="load", timeout=240000); await pg.wait_for_timeout(2500 if route == '#/adhesive' else 1500)
                txt = await pg.evaluate("() => document.body.innerText + ' ' + [...document.querySelectorAll('[aria-label],[title],[alt]')].map(e => (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('title') || '') + ' ' + (e.getAttribute('alt') || '')).join(' ')")
                hit = [w for w in GONE if w in txt]
                need(not hit, lang + ' ' + route + ' none of the removed words on the page', hit)
                if lang == 'zh': need('密封膠' in txt if route in ('#/sealant', '#/ureax-hg') else True, lang + ' ' + route + ' says 密封膠', txt.count('密封膠'))
                # product names in running text: the weight of the paragraph around them
                w = await pg.evaluate("() => { const out = []; document.querySelectorAll('p .sb-pname, li .sb-pname, td .sb-pname').forEach(e => { const r = e.getBoundingClientRect(); if (!r.width) return; const par = e.closest('p,li,td'), a = getComputedStyle(e).fontWeight, c = getComputedStyle(par).fontWeight, sfx = e.querySelector('.sb-pname__suffix'), s2 = sfx ? getComputedStyle(sfx).fontWeight : a; let inB = false; for (let n = e.parentElement; n && n !== par; n = n.parentElement) if (/^(B|STRONG|H\\d|TH)$/.test(n.tagName)) inB = true; if (!inB && (a !== c || s2 !== c)) out.push([e.textContent.slice(0, 30), a, s2, c]); }); return out.slice(0, 5); }")
                need(not w, lang + ' ' + route + ' product names in running text are not bold', w)
            await pg.goto("file://" + D + "/" + FILE + '#/adhesive', wait_until="load", timeout=240000); await pg.wait_for_timeout(3000)
            st = json.loads(await pg.evaluate("""() => JSON.stringify({ order: AD_ORDER, scn: [...document.querySelectorAll('[data-adscn]')].map(e => e.getAttribute('data-adscn')), hero: document.querySelectorAll('#adHeroLegend [data-adhero]').length, heroTxt: [...document.querySelectorAll('#adHeroLegend [data-adhero]')].map(e => e.textContent.trim()), prods: [...document.querySelectorAll('[data-adprod]')].map(e => e.getAttribute('data-adprod')), cmpRows: document.querySelectorAll('#adCmp tbody tr').length, stats: document.querySelectorAll('#adStats > *').length, foot: [...document.querySelectorAll('#footAreas > *')].map(e => e.textContent.trim()), cap: (document.querySelector('[data-i18n="ad.photoCap"]') || {}).textContent || '', aria: document.getElementById('adHeroCanvas').getAttribute('aria-label') })""")); log(DEV, lang, json.dumps(st, ensure_ascii=False)[:900])
            need(st['order'] == ['joist', 'heat', 'sheet'] and sorted(set(st['scn'])) == ['heat', 'joist', 'sheet'], lang + ' three methods', st['scn'])
            need(st['hero'] == 7, lang + ' the cover sample has the sheet method\'s seven stages', st['heroTxt'])
            need(len(set(st['prods'])) == 6 and 'AD8800' not in st['prods'], lang + ' six products', st['prods'])
            need(len(st['foot']) == 5, lang + ' the footer lists five product areas', st['foot'])
            # every method: picked, its stages walked, the take-off filled
            for scn in ('joist', 'heat', 'sheet'):
                await pg.evaluate("(s) => { const b = document.querySelector('[data-adscn=\"' + s + '\"]'); b.click(); }", scn); await pg.wait_for_timeout(900)
                r = json.loads(await pg.evaluate("""() => { const st = [...document.querySelectorAll('#adStages [data-adstage]')]; st.forEach(b => b.click()); const k = [...document.querySelectorAll('#adCalcOut .kpi b')].map(e => e.textContent.trim()); const f = [...document.querySelectorAll('#adCalcForm input')].map(e => e.name || e.getAttribute('data-adq') || e.id); return JSON.stringify({ stages: st.length, kpi: k, fields: f, layers: document.querySelectorAll('#adLayers li').length, items: document.querySelectorAll('#adCalcOut table tbody tr').length, txt: document.getElementById('adCalcOut').innerText.slice(0, 160) }); }""")); log(DEV, lang, scn, json.dumps(r, ensure_ascii=False)[:420])
                need(r['stages'] >= 5 and len(r['kpi']) == 4 and r['kpi'][0] not in ('', '—', 'NaN') and r['layers'] >= 3 and r['items'] >= 1 and 'NaN' not in r['txt'] and 'undefined' not in r['txt'], lang + ' ' + scn + ' stages, layers and take-off', r['kpi'])
            # the cover sample's stages lead to the sheet method
            await pg.evaluate("() => { document.querySelector('#adHeroLegend [data-adhero=\"3\"]').click(); }"); await pg.wait_for_timeout(800)
            cur = await pg.evaluate("() => { const a = document.querySelector('[data-adscn].is-active, [data-adscn][aria-pressed=\"true\"], [data-adscn][aria-selected=\"true\"]'); return a ? a.getAttribute('data-adscn') : null; }")
            need(cur == 'sheet', lang + ' a stage of the cover sample opens the sheet method', cur)
            # the products menu
            await pg.evaluate("() => { document.getElementById('pmenuBtn').click(); }"); await pg.wait_for_timeout(700)
            cats = await pg.evaluate("() => [...document.querySelectorAll('#pmenuPanel [data-cat], #pmenuPanel .pmenu__cat')].map(e => e.textContent.trim().slice(0, 30))")
            mtxt = await pg.evaluate("async () => { const P = document.getElementById('pmenuPanel'); let t = P.innerText; const cs = [...P.querySelectorAll('[data-cat], .pmenu__cat')]; for (const c of cs) { c.click(); await new Promise(r => setTimeout(r, 120)); const ss = [...P.querySelectorAll('[data-sub], .pmenu__sub')]; for (const s2 of ss) { s2.click(); await new Promise(r => setTimeout(r, 60)); t += ' ' + P.innerText; } } return t; }")
            hit = [w for w in GONE if w in mtxt]
            np = await pg.evaluate("() => document.querySelectorAll('#pmenuPanel .pmenu__product, #pmenuPanel .pmenu__sub').length"); need(not hit and np >= 6, lang + ' the products menu lists none of the removed products', [hit, np])
            need(not errs, lang + ' no errors', errs[:4]); await ctx.close()
        await b.close()
    log('BAD', bad)
asyncio.run(main())
