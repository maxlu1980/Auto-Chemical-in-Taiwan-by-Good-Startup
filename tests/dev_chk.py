# (v75) 「系統由 好時新創 開發」 on the game's screens: the loading screen, the title, the end of the opening film, the veil between two places, the ride
# film, the panels (map, chemistry pocket, phone, method notebook, gear, menu, help, quality), the cards that sum something up (a fight's end, the
# rehearsal's score), the simulator's briefing and result — the words in each language, where they sit, that nothing is laid over them, that a panel
# drawn again keeps one line, that other cards have none, and that the dashboard while playing has none
#   python3 dev_chk.py <out dir> <desk|mobile|small|land> <zh,en,ja>      SHOTS=1 for screenshots (slow under software rendering)
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; DEV = sys.argv[2]; LANGS = sys.argv[3].split(','); FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
VP = {'desk': (1280, 760), 'mobile': (390, 780), 'land': (780, 390), 'small': (360, 640), 'laptop': (1024, 600)}[DEV]
WANT = {'zh': '系統由 好時新創 開發', 'en': 'System developed by Good Startup', 'ja': 'システム開発：Good Startup'}
SHOTS = os.environ.get('SHOTS', '') == '1'
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
async def shot(pg, path, t=170000):
    if not SHOTS: return
    try: await pg.screenshot(path=path, timeout=t)
    except Exception as e: log('shot skipped', os.path.basename(path))
# the line: on screen, whole, readable, and the topmost thing at its own middle
SEE = """(sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const top = document.elementFromPoint(cx, cy);
  let op = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
  return { text: e.textContent, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inView: r.width > 0 && r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, cut: e.scrollWidth > e.clientWidth + 1, onTop: !!top && (top === e || e.contains(top)), under: top && top !== e && !e.contains(top) ? String(top.id || top.className.baseVal || top.className || top.tagName).slice(0, 40) : '', size: cs.fontSize, opacity: +op.toFixed(2), vis: cs.visibility !== 'hidden' && cs.display !== 'none' }; }"""
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
async def main():
    bad = []; seen = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for lang in LANGS:
            ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk'); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text else None)
            await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_CINE_NOGUARD = true; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")
            def chk(name, r, need_top=True, min_op=0.5):
                ok = bool(r) and r['text'] == WANT[lang] and r['inView'] and not r['cut'] and r['vis'] and r['opacity'] >= min_op and (r['onTop'] or not need_top)
                seen.setdefault(name.split(' (')[0], []).append(lang if ok else lang + '!')
                log(DEV, lang, name, 'OK' if ok else 'BAD', json.dumps(r, ensure_ascii=False))
                if not ok: bad.append((DEV, lang, name))
            async def card_line(name, expect=1):
                await pg.wait_for_timeout(700)
                if not await pg.evaluate("() => !document.getElementById('isCard').hidden"): log(DEV, lang, name, 'no card opened here'); seen.setdefault(name, []).append(lang + '?'); return False
                await pg.evaluate("() => { const b = document.querySelector('#isCard .isle__cin'); if (b) b.scrollTop = b.scrollHeight; }"); await pg.wait_for_timeout(250)
                n = await pg.evaluate("() => document.querySelectorAll('#isCard .isle__dev').length")
                if expect == 0:
                    log(DEV, lang, name, 'lines', n, 'OK' if n == 0 else 'BAD')
                    if n: bad.append((DEV, lang, name + ' has the line'))
                else:
                    r = await pg.evaluate(SEE, '#isCard .isle__dev'); chk(name + ' (x%d)' % n, r)
                    if n != 1: bad.append((DEV, lang, name + ' count %d' % n))
                    await shot(pg, "%s/%s_%s_%s.png" % (OUT, DEV, lang, name.replace(' ', '_')))
                return True
            close = "() => { try { ISLE_x.ev('cardClose()'); } catch (e) {} }"
            # 1. the loading screen, while it loads
            await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000)
            await pg.wait_for_selector('#acBoot .acb-dev', timeout=120000); await pg.wait_for_timeout(600)
            r = await pg.evaluate(SEE, '#acBoot .acb-dev'); chk('loading', r, need_top=False)
            ov = await pg.evaluate("() => { const d = document.querySelector('#acBoot .acb-dev').getBoundingClientRect(); return [...document.querySelectorAll('#acBoot .acb-btn, #acBoot .acb-snd, #acBoot .acb-go, #acBoot .acb-in')].filter(e => !e.hidden).map(e => { const r = e.getBoundingClientRect(); return [e.className, !(r.right <= d.left || r.left >= d.right || r.bottom <= d.top || r.top >= d.bottom)]; }).filter(x => x[1]).map(x => x[0]); }")
            log(DEV, lang, 'loading: laid over by', ov)
            if ov: bad.append((DEV, lang, 'loading overlaps ' + str(ov)))
            await shot(pg, "%s/%s_%s_loading.png" % (OUT, DEV, lang), 12000)
            # 2. the title
            t0 = time.time()
            while time.time() - t0 < 240:
                if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
                await pg.wait_for_timeout(500)
            for _ in range(160):  # the loader gone (it fades away over the title)
                if await pg.evaluate("() => { const b = document.getElementById('acBoot'); if (!b || b.hidden) return true; const cs = getComputedStyle(b); return cs.display === 'none' || parseFloat(cs.opacity) < 0.02; }"): break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(1500)
            fit = await pg.evaluate("() => { const e = document.querySelector('.isle__tin'), c = e.getBoundingClientRect(), s = document.getElementById('isStart').getBoundingClientRect(), n = document.getElementById('isBrand').getBoundingClientRect(); return { top: Math.round(c.top), bottom: Math.round(c.bottom), h: innerHeight, scrolls: Math.max(0, e.scrollHeight - e.clientHeight), fits: c.top >= -0.5 && c.bottom <= innerHeight + 0.5, nameSeen: n.top >= 0 && n.bottom <= innerHeight, startSeen: s.top >= 0 && s.bottom <= Math.min(innerHeight, c.bottom) }; }")
            await pg.evaluate("() => { const e = document.querySelector('.isle__tin'); e.scrollTop = e.scrollHeight; }"); await pg.wait_for_timeout(300)
            r = await pg.evaluate(SEE, '#isDev'); chk('title', r)
            await pg.evaluate("() => { document.querySelector('.isle__tin').scrollTop = 0; }")
            log(DEV, lang, 'title card fits', json.dumps(fit))
            if not (fit['fits'] and fit['nameSeen'] and fit['startSeen']): bad.append((DEV, lang, 'title card: ' + json.dumps(fit)))
            await shot(pg, "%s/%s_%s_title.png" % (OUT, DEV, lang))
            # 3. the end of the opening film (held on its title to be measured)
            await pg.evaluate("() => { ISLE_x.op.start(); }"); await pg.wait_for_timeout(2500)
            await pg.evaluate("() => { var F = CINE.F(); ISLE_x.op.jump(F.T * (F.p.titleU + 0.055)); window.ISLE_OP_HOLD = 1; }"); best = None
            for _ in range(14):
                await pg.wait_for_timeout(200); r = await pg.evaluate(SEE, '#isOpT .isle__op-dev')
                if r and (best is None or r['opacity'] > best['opacity']): best = r
            chk('film end', best, need_top=False); await shot(pg, "%s/%s_%s_film.png" % (OUT, DEV, lang))
            await pg.evaluate("() => { window.ISLE_OP_HOLD = 0; }")
            t0 = time.time()
            while time.time() - t0 < 90:
                if await pg.evaluate("() => (document.getElementById('isTitle')||{}).hidden === false && !ISLE_x.op.state().on ? 1 : 0"): break
                await pg.wait_for_timeout(500)
            # 4. in the game: the dashboard has no such line
            await pg.evaluate("() => { ISLE._dbg.startGame(); }")
            for _ in range(150):
                if await pg.evaluate(EV, '!fall && mode === "walk"') is True: break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(2000); await pg.evaluate(EV, 'P.intro=1; try{talkEnd()}catch(e){}; cardClose()'); await pg.wait_for_timeout(600)
            hud = await pg.evaluate("(w) => { const H = document.getElementById('isHud'), all = [...document.querySelectorAll('.isle__dev, .isle__phdev, .isle__cine-dev, .acb-dev')].filter(e => { const r = e.getBoundingClientRect(); let op = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; op *= parseFloat(cs.opacity); } return r.width > 0 && op > 0.05; }).map(e => e.className); return { hudOn: !!(H && !H.hidden), inHud: H ? H.textContent.indexOf(w) >= 0 : null, linesShowingWhilePlaying: all }; }", WANT[lang])
            log(DEV, lang, 'playing', json.dumps(hud)); await shot(pg, "%s/%s_%s_playing.png" % (OUT, DEV, lang))
            if hud['inHud'] or hud['linesShowingWhilePlaying'] or not hud['hudOn']: bad.append((DEV, lang, 'playing: ' + json.dumps(hud)))
            # 5. the panels
            for nm, js in (('menu', "ISLE._dbg.open('more')"), ('help', "ISLE._dbg.open('help')"), ('quality', "ISLE_x.qualCard()"), ('map', "document.getElementById('isI_map').click()"), ('chemistry pocket', "ISLE_x.pocket()"), ('method notebook', "document.getElementById('isI_book').click()"), ('gear', "ISLE_x.gear()"), ('phone card', "ISLE_x.phone()")):
                await pg.evaluate("() => { try { " + js + "; } catch (e) { return String(e); } }"); await card_line(nm); await pg.evaluate(close); await pg.wait_for_timeout(350)
            # a panel drawn again keeps one line; a card that is not a panel has none
            await pg.evaluate("() => { ISLE_x.qualCard(); }"); await pg.wait_for_timeout(600)
            n2 = await pg.evaluate("() => { const b = document.getElementById('isQReset'); if (b) b.click(); return new Promise(r => setTimeout(() => r(document.querySelectorAll('#isCard .isle__dev').length), 700)); }")
            log(DEV, lang, 'quality drawn again: lines', n2)
            if n2 != 1: bad.append((DEV, lang, 'quality redrawn: %s lines' % n2))
            await pg.evaluate(close); await pg.wait_for_timeout(300)
            await pg.evaluate("() => { try { ISLE_x.bag(); } catch (e) {} }"); await card_line('bag (not a listed panel)', expect=0); await pg.evaluate(close); await pg.wait_for_timeout(300)
            # 6. a fight's end
            foe = await pg.evaluate(EV, 'Object.keys(FOE)[0]')
            st = await pg.evaluate(EV, 'startFight(%s); !!fight' % json.dumps(foe)); await pg.wait_for_timeout(2500)
            if st is True:
                await pg.evaluate(EV, 'soulLose(); 1'); await pg.wait_for_timeout(3600)
                await card_line("fight's end"); await pg.evaluate(close); await pg.wait_for_timeout(500)
            else: log(DEV, lang, "fight's end", 'the fight could not be started here:', st, foe); seen.setdefault("fight's end", []).append(lang + '?')
            # 7. the city: the rehearsal's score, the phone she holds, the veil, the ride film
            await pg.evaluate(EV, 'try{talkEnd()}catch(e){}; cardClose(); JSON.stringify(ISLE_x.city("walk"))'); await pg.wait_for_timeout(4000); await pg.evaluate(EV, 'try{talkEnd()}catch(e){}; cardClose()'); await pg.wait_for_timeout(800)
            await pg.evaluate(EV, 'olwRehDone(2); 1'); await card_line("rehearsal's score"); await pg.evaluate(EV, 'cardClose.after = null; cardClose()'); await pg.wait_for_timeout(600); await pg.evaluate(EV, 'try{phClose()}catch(e){}; try{talkEnd()}catch(e){}; cardClose()'); await pg.wait_for_timeout(300)
            ph = await pg.evaluate("() => { const b = document.getElementById('isGsPhBtn'); if (b && b.offsetParent) { b.click(); return 'button'; } try { ISLE_x.ev('phOpen(null)'); return 'opened'; } catch (e) { return 'ERR ' + e; } }"); await pg.wait_for_timeout(700)
            r = await pg.evaluate(SEE, '#isPh .isle__phdev'); chk('phone (' + str(ph) + ')', r); await shot(pg, "%s/%s_%s_phone.png" % (OUT, DEV, lang))
            phfit = await pg.evaluate("() => { const p = document.getElementById('isPh').getBoundingClientRect(), d = document.querySelector('#isPh .isle__phdev').getBoundingClientRect(), bd = document.getElementById('isPhBody').getBoundingClientRect(); return { inPhone: d.bottom <= p.bottom + 0.5 && d.top >= bd.bottom - 0.5, body: Math.round(bd.height) }; }")
            log(DEV, lang, 'phone strip', json.dumps(phfit))
            if not phfit['inPhone'] or phfit['body'] < 150: bad.append((DEV, lang, 'phone strip ' + json.dumps(phfit)))
            await pg.evaluate(EV, 'phClose(); 1')
            await pg.evaluate(EV, 'fade(function () {}, null); 1'); await pg.wait_for_timeout(1500)
            await pg.evaluate("() => { const V = document.getElementById('isLoad'); if (V) { V.classList.add('is-on'); V.style.transition = 'none'; V.style.opacity = '1'; } }"); await pg.wait_for_timeout(300)
            r = await pg.evaluate(SEE, '#isLoad .isle__dev'); chk('veil between places', r)
            fitv = await pg.evaluate("() => { const e = document.querySelector('#isLoad .isle__loadIn'); if (!e) return null; const c = e.getBoundingClientRect(); return { top: Math.round(c.top), bottom: Math.round(c.bottom), fits: c.top >= -0.5 && c.bottom <= innerHeight + 0.5 }; }")
            log(DEV, lang, 'veil card fits', json.dumps(fitv))
            if not fitv or not fitv['fits']: bad.append((DEV, lang, 'veil card does not fit'))
            await shot(pg, "%s/%s_%s_veil.png" % (OUT, DEV, lang))
            await pg.evaluate("() => { const V = document.getElementById('isLoad'); if (V) { V.classList.remove('is-on'); V.style.transition = ''; V.style.opacity = ''; } }"); await pg.wait_for_timeout(800)
            cz = await pg.evaluate("() => { try { return JSON.stringify(ISLE_x.cine('tpe', 'txg')); } catch (e) { return 'ERR ' + e; } }")
            for _ in range(60):
                if await pg.evaluate("() => { const e = document.querySelector('.isle__cine.is-on .isle__cine-dev'); return !!e && parseFloat(getComputedStyle(e).opacity) > 0.95; }"): break
                await pg.wait_for_timeout(500)
            r = await pg.evaluate(SEE, '.isle__cine-dev'); chk('ride film', r, need_top=False)
            ovr = await pg.evaluate("() => { const d = document.querySelector('.isle__cine-dev'); if (!d) return ['none']; const rg = document.createRange(); rg.selectNodeContents(d); const tw = rg.getBoundingClientRect(), bar = d.parentElement.querySelector('.isle__cine-bar--b').getBoundingClientRect(); const o = [...document.querySelectorAll('#isCineSkip, #isCineT')].map(e => { const r = e.getBoundingClientRect(); return [e.id, !(r.right <= tw.left || r.left >= tw.right || r.bottom <= tw.top || r.top >= tw.bottom)]; }).filter(x => x[1]).map(x => x[0]); return { over: o, inBar: tw.top >= bar.top - 0.5, bar: Math.round(bar.height) }; }")
            log(DEV, lang, 'ride film', cz, json.dumps(ovr))
            if ovr == ['none'] or ovr['over']: bad.append((DEV, lang, 'ride film ' + json.dumps(ovr)))
            await shot(pg, "%s/%s_%s_ride.png" % (OUT, DEV, lang))
            log(DEV, lang, 'errors (game)', errs[:6])
            if errs: bad.append((DEV, lang, 'errors %d' % len(errs)))
            await ctx.close()
            # 8. the simulator, opened from its guide: briefing and result
            ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk'); pg = await ctx.new_page(); errs2 = []
            pg.on("pageerror", lambda e: errs2.append(str(e)[:300]))
            await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")
            await pg.goto("file://" + D + "/" + FILE + "#/ureax-hg", wait_until="load", timeout=240000); await pg.wait_for_timeout(3000)
            await pg.evaluate("() => { HSIM.open('ux', UX, null); }"); await pg.wait_for_selector('#hsStart', timeout=180000); await pg.wait_for_timeout(500)
            await pg.evaluate("() => { const b = document.querySelector('#hsCard .hsim__cardin'); if (b) b.scrollTop = b.scrollHeight; }"); await pg.wait_for_timeout(250)
            r = await pg.evaluate(SEE, '#hsCard .hsim__dev'); chk('simulator briefing', r); await shot(pg, "%s/%s_%s_sim_briefing.png" % (OUT, DEV, lang))
            await pg.evaluate("() => { document.getElementById('hsStart').click(); }"); await pg.wait_for_timeout(1500)
            await pg.evaluate("() => { var S = HSIM.state(), i = S.phases.findIndex(function (p) { return p.kind === 'final'; }); HSIM.jump(i); }")
            await pg.wait_for_selector('#hsAgain', timeout=60000); await pg.wait_for_timeout(400)
            await pg.evaluate("() => { const b = document.querySelector('#hsCard .hsim__cardin'); if (b) b.scrollTop = b.scrollHeight; }"); await pg.wait_for_timeout(250)
            r = await pg.evaluate(SEE, '#hsCard .hsim__dev'); chk('simulator result', r); await shot(pg, "%s/%s_%s_sim_result.png" % (OUT, DEV, lang))
            log(DEV, lang, 'errors (simulator)', errs2[:6])
            if errs2: bad.append((DEV, lang, 'simulator errors %d' % len(errs2)))
            await ctx.close()
        await b.close()
    log('SEEN', json.dumps(seen, ensure_ascii=False)); log('BAD', bad)
asyncio.run(main())
