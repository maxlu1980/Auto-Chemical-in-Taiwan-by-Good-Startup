import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AXE = open("/tmp/claude-0/-home-claude/a34b5849-d270-58ed-b448-e720fbde58dc/scratchpad/axe/node_modules/axe-core/axe.min.js", encoding="utf-8").read()
out = sys.argv[1]; vps = sys.argv[2].split(','); langs = sys.argv[3].split(','); routes = sys.argv[4].split(',')
extra = sys.argv[5] if len(sys.argv) > 5 else ''   # a js snippet run before the audit (open a card, the simulator …)
VP = {'desk': (1280, 760, False), 'mobile': (390, 780, True)}
RUN = """async (ctxSel) => { const r = await axe.run(ctxSel ? document.querySelector(ctxSel) || document : document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
  return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, t: v.nodes.slice(0, 6).map(x => x.target.join(' ') + ' | ' + (x.failureSummary || '').split('\\n').slice(1, 2).join(' ').slice(0, 150)) })); }"""
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
async def main():
    os.makedirs(out, exist_ok=True); rep = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for vp in vps:
            W, H, touch = VP[vp]
            for lang in langs:
                ctx = await b.new_context(viewport={"width": W, "height": H}, has_touch=touch, is_mobile=touch, device_scale_factor=1)
                pg = await ctx.new_page()
                await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")
                await pg.goto("file://" + D + "/" + os.environ.get("TK_FILE", "test_local.html") + routes[0], wait_until="load", timeout=240000); await pg.wait_for_timeout(2500)
                await pg.add_script_tag(content=AXE)
                for rt in routes:
                    if rt != routes[0]: await pg.evaluate("h => { location.hash = h; }", rt); await pg.wait_for_timeout(2500)
                    await pg.evaluate("async () => { const H = document.body.scrollHeight; for (let y = 0; y < H; y += innerHeight * 0.9) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } scrollTo(0, 0); }"); await pg.wait_for_timeout(800)
                    sel = None
                    if extra: sel = await pg.evaluate("async () => { " + extra + " }"); await pg.wait_for_timeout(2500)
                    v = await pg.evaluate(RUN, sel); rep.append({'vp': vp, 'lang': lang, 'route': rt, 'v': v})
                    log(vp, lang, rt, ' '.join('%s:%s(%d)' % (x['id'], (x['impact'] or '?')[0], x['n']) for x in v))
                await ctx.close()
        await b.close()
    json.dump(rep, open(out + '/axe.json', 'w'), ensure_ascii=False, indent=1)
asyncio.run(main())
