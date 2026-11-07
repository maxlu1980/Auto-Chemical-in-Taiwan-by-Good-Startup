import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; vps = sys.argv[2].split(','); langs = sys.argv[3].split(',')
routes = sys.argv[4].split(',') if len(sys.argv) > 4 and sys.argv[4] else ['#/ureax-hg', '#/protect-one', '#/sealant', '#/adhesive']
shots = len(sys.argv) > 5 and sys.argv[5] == 'shots'
prep = sys.argv[6] if len(sys.argv) > 6 else ''
prepWait = int(sys.argv[7]) if len(sys.argv) > 7 else 3000
VP = {'desk': (1280, 760, False), 'big': (1600, 900, False), 'tabletP': (768, 1024, True), 'tabletL': (1024, 768, True), 'mobile': (390, 780, True), 'mobileS': (360, 740, True), 'mobileL': (844, 390, True), 'fold': (320, 660, True)}
CHECK = r"""(lang) => {
  const iw = innerWidth, ih = innerHeight, R = { sw: document.documentElement.scrollWidth, iw, over: [], tiny: [], small: [], clipped: [], leak: [], raw: [], noalt: 0, imgs: 0, broken: 0, unnamed: [] };
  const vis = (el) => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return null; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return null; return r; };
  const desc = (el) => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''));
  const hid = (el) => { for (let p = el; p && p !== document.body; p = p.parentElement) { if (p.hidden) return true; const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden') return true; } return false; };
  let n = 0;
  for (const el of document.body.querySelectorAll('*')) { if (n++ > 80000) break; if (el.closest('[hidden]')) continue; const r = vis(el); if (!r) continue; const cs = getComputedStyle(el); if (cs.position === 'fixed') continue;
    if (r.right > iw + 2 && r.left < iw && !/^(html|body)$/i.test(el.tagName)) { let clip = false; for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(c.overflowX)) { clip = true; break; } } if (!clip && R.over.length < 12) R.over.push(desc(el) + ' right=' + Math.round(r.right)); }
    if (/^(button|a|select|input|summary)$/i.test(el.tagName) || el.getAttribute('role') === 'button') { if (cs.pointerEvents === 'none') continue;
      if ((r.width < 24 || r.height < 24) && R.tiny.length < 16) R.tiny.push(desc(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20) + '"');
      else if ((r.width < 40 || r.height < 40) && R.small.length < 16 && !(el.tagName === 'A' && cs.display === 'inline')) R.small.push(desc(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      const nm = (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || (el.querySelector('img') && el.querySelector('img').alt) || '').trim(); if (!nm && R.unnamed.length < 12) R.unnamed.push(desc(el)); }
    if (cs.overflow === 'hidden' && cs.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 3 && el.children.length === 0 && (el.textContent || '').trim().length > 2) { if (R.clipped.length < 12) R.clipped.push(desc(el) + ' ' + el.scrollWidth + '>' + el.clientWidth + ' "' + (el.textContent || '').trim().slice(0, 24) + '"'); }
  }
  /* text: untranslated words and raw placeholders */
  const it = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT); let tn; const seen = new Set();
  const allow = ['ルナちゃん', '春日部つむぎ', 'ちゃん', 'ケミカルナ', 'オート化学工業', 'VOICEVOX', 'ウレアックス', 'オートン', 'プロテクト', 'エナガード', 'イクシード', 'クリオ', 'シーラー', 'ノンブリード', 'クリアトール', 'シーラント', 'ワン', 'Qイック', '御徒町'];
  const zhOnly = /[們這嗎說讓還哪呢您沒個麼]/; const han = /[㐀-鿿぀-ヿ]/; const hira = /[぀-ゟ]/;
  while ((tn = it.nextNode())) { const t = tn.nodeValue.trim(); if (!t) continue; const el = tn.parentElement; if (!el || el.closest('script,style,noscript,[aria-hidden="true"]') || hid(el)) continue;
    let tt = t; allow.forEach(a => { tt = tt.split(a).join(''); });
    let bad = null; if (lang === 'en' && han.test(tt)) bad = 'cjk'; else if (lang === 'ja' && zhOnly.test(tt)) bad = 'zh-in-ja'; else if (lang === 'zh' && hira.test(tt)) bad = 'kana-in-zh';
    if (bad) { const k = bad + t.slice(0, 40); if (!seen.has(k) && R.leak.length < 25) { seen.add(k); R.leak.push(bad + ' ' + desc(el) + ' "' + t.slice(0, 60) + '"'); } }
    if (/\{[a-zA-Z]\w*\}|\bundefined\b|\bNaN\b|\[object |\bnull\b/.test(t) && R.raw.length < 12) R.raw.push(desc(el) + ' "' + t.slice(0, 60) + '"'); }
  document.querySelectorAll('img').forEach(im => { if (hid(im)) return; R.imgs++; if (!im.hasAttribute('alt')) R.noalt++; if (im.complete && im.naturalWidth === 0 && im.src) R.broken++; });
  R.bodyH = document.body.scrollHeight; R.title = document.title; R.lang = document.documentElement.lang; return R; }"""
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
async def main():
    os.makedirs(out, exist_ok=True); report = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for vp in vps:
            W, H, touch = VP[vp]
            for lang in langs:
                ctx = await b.new_context(viewport={"width": W, "height": H}, has_touch=touch, is_mobile=touch and W < 900, device_scale_factor=1)
                pg = await ctx.new_page(); errs = []; warns = []
                await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")
                pg.on("pageerror", lambda e: errs.append(str(e)[:400]))
                pg.on("console", lambda m: (errs if m.type == "error" else warns).append(m.type + ": " + m.text[:300]) if m.type in ("error", "warning") and "ERR_TUNNEL" not in m.text and "net::" not in m.text else None)
                t = time.time(); await pg.goto("file://" + D + "/build/test_local.html" + routes[0], wait_until="load", timeout=240000); await pg.wait_for_timeout(2500); log(vp, lang, 'loaded', round(time.time() - t, 1))
                for rt in routes:
                    if rt != routes[0]: await pg.evaluate("h => { location.hash = h; }", rt); await pg.wait_for_timeout(2500)
                    if prep: await pg.evaluate("async () => { " + prep + " }"); await pg.wait_for_timeout(prepWait)
                    # walk the page down (lazy content), then back to the top
                    if not prep: await pg.evaluate("async () => { const H = document.body.scrollHeight; for (let y = 0; y < H; y += innerHeight * 0.9) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); }"); await pg.wait_for_timeout(600)
                    r = await pg.evaluate(CHECK, lang); r['vp'] = vp; r['lang'] = lang; r['route'] = rt; r['errs'] = list(errs); r['warns'] = list(warns)[:8]; errs.clear(); warns.clear()
                    if shots: await pg.screenshot(path=f"{out}/{vp}_{lang}_{rt.strip('#/')}.png", full_page=False)
                    report.append(r); log(vp, lang, rt, 'sw', r['sw'], 'iw', r['iw'], 'over', len(r['over']), 'tiny', len(r['tiny']), 'small', len(r['small']), 'clip', len(r['clipped']), 'leak', len(r['leak']), 'raw', len(r['raw']), 'unnamed', len(r['unnamed']), 'img', r['imgs'], 'noalt', r['noalt'], 'broken', r['broken'], 'errs', len(r['errs']), 'warns', len(r['warns']))
                await ctx.close()
        await b.close()
    json.dump(report, open(f"{out}/report.json", 'w'), ensure_ascii=False, indent=1)
asyncio.run(main())
