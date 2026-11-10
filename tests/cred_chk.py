# the sound credit (VOICEVOX and the voices used) on the title card and at the end of the opening film: whole, in the picture, the card still fitting
#   python3 cred_chk.py <desk|mobile|small> <zh,en,ja>
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEV = sys.argv[1]; LANGS = sys.argv[2].split(','); FILE = os.environ.get('TK_FILE', 'build/test_min.html'); VP = {'desk': (1280, 760), 'mobile': (390, 780), 'small': (360, 640)}[DEV]
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
FIND = """() => { const out = []; document.querySelectorAll('#acBoot *, .isle__title *, #isTitle *').forEach(e => { if (e.children.length || !/VOICEVOX/.test(e.textContent)) return; const cs = getComputedStyle(e); let vis = cs.display !== 'none' && cs.visibility !== 'hidden'; for (let n = e.parentElement; n && vis && n !== document.body; n = n.parentElement) { const c = getComputedStyle(n); if (c.display === 'none' || c.visibility === 'hidden' || n.hidden) vis = false; } const r = e.getBoundingClientRect();
  out.push({ where: e.closest('#acBoot') ? 'loading' : 'title', cls: (e.className || e.tagName) + '', vis, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), right: Math.round(r.right), cutX: e.scrollWidth > e.clientWidth + 1, inX: r.left >= -0.5 && r.right <= innerWidth + 0.5, has: ['春日部つむぎ', '後鬼', '玄野武宏'].every(k => e.textContent.includes(k)), text: e.textContent.slice(0, 60) }); }); return out; }"""
SEE = """(sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); let op = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
  return { where: 'film', text: e.textContent.slice(0, 60), x: Math.round(r.left), right: Math.round(r.right), y: Math.round(r.top), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height), inX: r.width > 0 && r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5, cutX: e.scrollWidth > e.clientWidth + 1, has: ['春日部つむぎ', '後鬼', '玄野武宏'].every(k => e.textContent.includes(k)), opacity: +op.toFixed(2), vis: cs.visibility !== 'hidden' && cs.display !== 'none' }; }"""
async def main():
    bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for lang in LANGS:
            ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk'); pg = await ctx.new_page()
            await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")
            await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
            while time.time() - t0 < 300:
                if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
                await pg.wait_for_timeout(400)
            for _ in range(120):
                if await pg.evaluate("() => { const b = document.getElementById('acBoot'); if (!b || b.hidden) return true; const cs = getComputedStyle(b); return cs.display === 'none' || parseFloat(cs.opacity) < 0.02; }"): break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(1200); r = await pg.evaluate(FIND); Tt = [x for x in r if x['where'] == 'title' and x['vis']]
            fit = await pg.evaluate("() => { const e = document.querySelector('.isle__tin'); if (!e) return null; const c = e.getBoundingClientRect(), s = document.getElementById('isStart').getBoundingClientRect(); return { fits: c.top >= -0.5 && c.bottom <= innerHeight + 0.5, scrolls: Math.max(0, e.scrollHeight - e.clientHeight), startSeen: s.top >= 0 && s.bottom <= innerHeight }; }")
            # the end of the opening film, held on its title
            await pg.evaluate("() => { ISLE_x.op.start(); }"); await pg.wait_for_timeout(2500)
            await pg.evaluate("() => { var F = CINE.F(); ISLE_x.op.jump(F.T * (F.p.titleU + 0.055)); window.ISLE_OP_HOLD = 1; }"); best = None
            for _ in range(14):
                await pg.wait_for_timeout(200); r = await pg.evaluate(SEE, '#isOpT em')
                if r and (best is None or r['opacity'] > best['opacity']): best = r
            await pg.evaluate("() => { window.ISLE_OP_HOLD = 0; }"); Fm = [best] if best and best['vis'] and best['opacity'] >= 0.5 else None
            for name, X in (('film end', Fm), ('title', Tt)):
                ok = bool(X) and all(x['has'] and x['inX'] and not x['cutX'] for x in X); log(DEV, lang, name, 'OK' if ok else 'BAD', json.dumps(X, ensure_ascii=False)[:420])
                if not ok: bad.append((DEV, lang, name))
            okf = bool(fit) and fit['fits'] and fit['startSeen']; log(DEV, lang, 'title card', 'OK' if okf else 'BAD', json.dumps(fit))
            if not okf: bad.append((DEV, lang, 'title card'))
            await ctx.close()
        await b.close()
    log('BAD', bad)
asyncio.run(main())
