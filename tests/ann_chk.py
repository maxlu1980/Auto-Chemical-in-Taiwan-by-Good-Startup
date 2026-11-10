# (v76) the stations' announcements: with a stand-in for the device's voice (what would be spoken is recorded), at the high-speed rail's stations
# and at Okachimachi — that trains coming in, boarding, leaving are announced, in which languages and voices, the line on screen in the reader's
# language and where it sits, that the mute switch stops it, and what happens where the device cannot speak
#   python3 ann_chk.py <out dir> <desk|mobile> <zh,en,ja> [parts: tpe,tyo,all4,novoice,mute; with tyo also clip: stand-in recordings are given for every Japanese line]
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; DEV = sys.argv[2]; LANGS = sys.argv[3].split(','); PARTS = (sys.argv[4] if len(sys.argv) > 4 else 'tpe,tyo,all4,mute,novoice').split(',')
FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
VP = {'desk': (1280, 760), 'mobile': (390, 780), 'land': (780, 390)}[DEV]
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
FAKE = r"""
(function () { var q = [], cur = null, L = window.__tts = { said: [], cancels: 0, mode: 'ok' };
  var V = window.__ttsVoices = [ { name: 'Google 日本語', lang: 'ja-JP', localService: false, default: false }, { name: 'Microsoft Hanhan - Chinese (Traditional, Taiwan)', lang: 'zh-TW', localService: true, default: true },
    { name: 'Microsoft Tracy - Chinese (Traditional, Hong Kong S.A.R.)', lang: 'zh-HK', localService: true }, { name: 'Microsoft Yating - Chinese (Traditional, Taiwan)', lang: 'zh-TW', localService: true }, { name: 'Microsoft Zhiwei - Chinese (Traditional, Taiwan)', lang: 'zh-TW', localService: true },
    { name: 'Google 普通话（中国大陆）', lang: 'zh-CN', localService: false }, { name: 'Google 粤語（香港）', lang: 'zh-HK', localService: false }, { name: 'Google 國語（臺灣）', lang: 'zh-TW', localService: false },
    { name: 'Google US English', lang: 'en-US', localService: false }, { name: 'Google UK English Female', lang: 'en-GB', localService: false }, { name: 'Google UK English Male', lang: 'en-GB', localService: false } ];
  function U(t) { this.text = t; this.volume = 1; this.rate = 1; this.pitch = 1; this.lang = ''; this.voice = null; }
  function pump() { if (cur || !q.length) return; var u = cur = q.shift(); SS.speaking = true; if (L.mode === 'nostart') return; setTimeout(function () { if (cur === u && u.onstart) u.onstart({}); }, 20);
    var per = /^ja/.test(u.lang) ? 40 : /^(zh|cmn)/.test(u.lang) ? 62 : 18; u._t = setTimeout(function () { if (cur === u) { cur = null; SS.speaking = false; if (u.onend) u.onend({}); pump(); } }, 60 + u.text.length * per / (window.__ttsFast || 1)); }
  var SS = { speaking: false, pending: false, paused: false, getVoices: function () { return L.mode === 'empty' ? [] : V; },
    speak: function (u) { if (u.text) L.said.push({ t: u.text, lang: u.lang, voice: u.voice ? u.voice.name : null, vol: +u.volume.toFixed(2), rate: u.rate, pitch: u.pitch, at: Math.round(performance.now()) }); q.push(u); pump(); },
    cancel: function () { L.cancels++; q.length = 0; if (cur) { var c = cur; cur = null; SS.speaking = false; clearTimeout(c._t); if (c.onerror) setTimeout(function () { c.onerror({ error: 'interrupted' }); }, 0); } },
    pause: function () {}, resume: function () {}, addEventListener: function () {}, removeEventListener: function () {} };
  try { Object.defineProperty(window, 'speechSynthesis', { value: SS, configurable: true, writable: true }); } catch (e) { window.__ttsErr = String(e); }
  window.SpeechSynthesisUtterance = U; })();
"""
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
# the scene's clock run on: the trains and the announcer stepped a tenth of a second at a time, about four times the wall clock (the stand-in voice speaks as much faster)
RUN = """([sec, until]) => new Promise(res => { const n = Math.round(sec * 10); let i = 0; const STEP = '(function(){ var T = TK.T; if (TK.id === "tokyo") TKM.update(T, 0.1, { cam: cam.position }); else T.trains.forEach(function (tr) { (tr.stepFn || TPE3D.trainStep)(T, tr, 0.1); }); annTick(0.1); })()';
  const h = setInterval(() => { try { for (let k = 0; k < 2 && i < n; k++, i++) ISLE_x.ev(STEP); if (i >= n || (until && ISLE_x.ev(until))) { clearInterval(h); res(i / 10); } } catch (e) { clearInterval(h); res('ERR ' + e); } }, 45); })"""
CAP = """() => { const e = document.getElementById('isAnn'); if (!e || !e.classList.contains('is-on')) return null; const r = e.getBoundingClientRect(), root = e.parentElement; const over = [];
  root.querySelectorAll('button, .isle__chip, .isle__place, .isle__toast.is-on, .isle__banner.is-on, .isle__fssub.is-on, #isTkBar, .isle__nav, .isle__hud > *').forEach(o => { if (o === e || e.contains(o) || o.contains(e)) return; const cs = getComputedStyle(o); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05 || o.hidden) return; const q = o.getBoundingClientRect(); if (!q.width || !q.height) return;
    if (!(q.right <= r.left + 1 || q.left >= r.right - 1 || q.bottom <= r.top + 1 || q.top >= r.bottom - 1)) over.push((o.id || o.className || o.tagName).toString().slice(0, 40)); });
  return { tag: e.querySelector('small').textContent, main: e.querySelector('b').textContent, orig: e.querySelector('i') ? e.querySelector('i').textContent : '', origLang: e.querySelector('i') ? e.querySelector('i').lang : '', origShown: e.querySelector('i') ? getComputedStyle(e.querySelector('i')).display !== 'none' : false,
    x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, over: [...new Set(over)], font: getComputedStyle(e.querySelector('b')).fontSize }; }"""
async def main():
    bad = []
    def need(ok, what, info=''):
        log(DEV, ('OK  ' if ok else 'BAD ') + what, info if not ok or len(str(info)) < 260 else str(info)[:260])
        if not ok: bad.append(what)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"])
        for lang in LANGS:
            ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=DEV != 'desk', is_mobile=DEV != 'desk'); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text else None)
            await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_CINE_NOGUARD = true; window.ISLE_HOUR = 14; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); localStorage.setItem('ac-guide-snd', 'on'); } catch (e) {}" + FAKE)
            await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="load", timeout=240000)
            t0 = time.time()
            while time.time() - t0 < 240:
                if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(2500)  # (no start of the game's own story: the station is gone to directly, as the station tests do)
            # the picture drawn once a second only (software rendering would hold every timer back): the test's own clock steps the trains and the announcer
            await pg.evaluate("() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = function (f) { return setTimeout(function () { raf(f); }, 5000); }; }")
            need(not await pg.evaluate("() => window.__ttsErr || ''"), lang + ' stand-in voice installed')
            async def arrive(code):
                await pg.evaluate(EV, code); await pg.wait_for_timeout(8000)
                await pg.evaluate(EV, "(function(){ travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; })()")
                await pg.evaluate("() => { ISLE_x.sndTap(); document.dispatchEvent(new Event('pointerup')); }"); await pg.wait_for_timeout(6500)
                await pg.evaluate(EV, "(function(){ try { R3.setPixelRatio(0.1); onResize && 0; } catch (e) {} return 1; })()")  # the picture drawn very small: the test's own clock is what counts
                st = await pg.evaluate("() => JSON.stringify(ISLE_x.snd())"); return st
            async def run(sec, until=None): return await pg.evaluate(RUN, [sec, until])
            async def ann(): return json.loads(await pg.evaluate("() => JSON.stringify(ISLE_x.ann())"))
            async def said(clear=False):
                r = json.loads(await pg.evaluate("() => JSON.stringify(window.__tts.said)"))
                if clear: await pg.evaluate("() => { window.__tts.said.length = 0; }")
                return r
            # ---------- Taipei: the trains' own cycle, heard from platform 1 ----------
            if 'tpe' in PARTS:
                st = await arrive("ISLE_x.city('hsr')"); log(DEV, lang, 'taipei sound', st)
                await pg.evaluate("() => ISLE_x.annAt([0, 9, -11.54 + 2.6])"); await said(True)
                seen = {}; caps = []; t = 0
                while t < 300 and not all(k in seen for k in ('hs.in', 'hs.on', 'hs.go', 'hs.care')):
                    r = await run(4); assert not isinstance(r, str), r; t += r
                    a = await ann()
                    for r in a['log']: seen.setdefault(r['key'][:5] if not r['key'].startswith('hs.care') else 'hs.care', r)
                    if a['cur'] and len(caps) < 40:
                        c = await pg.evaluate(CAP)
                        if c: caps.append((a['cur'], c))
                a = await ann(); log(DEV, lang, 'taipei after', round(t), 's of the scene:', json.dumps({k: a[k] for k in ('n', 'said', 'ok', 'pick', 'bus')}, ensure_ascii=False))
                for k in ('hs.in', 'hs.on', 'hs.go', 'hs.care'): need(k in seen, lang + ' taipei announced ' + k, json.dumps(seen.get(k), ensure_ascii=False))
                need(a['pick']['zhf'] == 'Google 國語（臺灣）' and a['pick']['enf'] == 'Google US English' and a['pick']['jaf'] == 'Google 日本語' and a['pick']['enm'] == 'Google UK English Male', lang + ' voices chosen', json.dumps(a['pick'], ensure_ascii=False))
                S = await said(); zh = [s for s in S if s['lang'].startswith('zh')]; en = [s for s in S if s['lang'].startswith('en')]
                need(len(zh) >= 3 and len(en) >= 1 and all(s['voice'] == 'Google 國語（臺灣）' and s['lang'] == 'zh-TW' for s in zh), lang + ' taipei spoken in the Mandarin of Taiwan, then English', '%d zh, %d en; %s' % (len(zh), len(en), json.dumps(zh[:2], ensure_ascii=False)))
                need(all(not any(c.isdigit() for c in s['t']) for s in zh), lang + ' taipei numbers written to be read digit by digit', json.dumps([s['t'] for s in zh if any(c.isdigit() for c in s['t'])][:2], ensure_ascii=False))
                for s in zh[:4] + en[:3]: log('     said', json.dumps(s, ensure_ascii=False))
                need(len(caps) > 0, lang + ' taipei line on screen seen', len(caps))
                for key, c in caps[:1] + [x for x in caps if x[0].startswith('hs.on')][:1] + [x for x in caps if x[0].startswith('hs.go')][:1]:
                    need(c['inView'] and not c['over'] and (lang == 'zh') == (c['orig'] == ''), lang + ' taipei line on screen ' + key, json.dumps(c, ensure_ascii=False))
                # the queue: never two at once, order by the log
                need(all(r.get('done') or r.get('cut') or r is a['log'][-1] for r in a['log']), lang + ' taipei one announcement at a time', json.dumps(a['log'][-3:], ensure_ascii=False)[:300])
            # ---------- the other three stations: the platform and the destination follow each station's own boards ----------
            if 'all4' in PARTS:
                for name, code, want in (('taichung', "ISLE_x.txg('hsr')", None), ('tainan', "ISLE_x.tnn('hsr')", None), ('zuoying', "ISLE_x.khh('hsr')", None)):
                    await arrive(code); await pg.evaluate("() => { ISLE_x.annAt(null); window.__tts.said.length = 0; }")
                    info = await pg.evaluate(EV, "JSON.stringify({ id: TK.id, tr: TK.T.trains.filter(function (t) { return !t.line || t.line === 'hsr'; }).map(function (t) { var D = hsOf(TK.T, t); return [t.track, t.no, D.p, D.zh, D.en, D.end]; }), ear: anEarHS(TK.T, cam.position).on })")
                    log(DEV, lang, name, info); I = json.loads(info); need(I['id'] == name and I['ear'] and len(I['tr']) >= 2 and all(x[3] in ('左營', '南港', '台中', '台北') for x in I['tr']), lang + ' ' + name + ' trains, platforms and destinations', info)
                    await run(3); key = await pg.evaluate("() => ISLE_x.annSay('in', 1)"); await run(8, "!!ANN.cur"); await pg.wait_for_timeout(2300); c = await pg.evaluate(CAP); a = await ann()
                    need(bool(c) and c['inView'] and not c['over'], lang + ' ' + name + ' line on screen', json.dumps(c, ensure_ascii=False))
                    await run(12, "!ANN.cur"); S = await said(True); need(len(S) >= 1 and S[0]['lang'] == 'zh-TW', lang + ' ' + name + ' spoken', json.dumps(S[:2], ensure_ascii=False))
            # ---------- Okachimachi ----------
            if 'tyo' in PARTS:
                CLIP = 'clip' in PARTS
                if CLIP: await pg.evaluate("""() => { const ids = JSON.parse(ISLE_x.ev('JSON.stringify(Object.keys(OKV_T).map(function (k) { return OKV_T[k][0]; }))')), sr = 8000, n = sr * 0.45, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), W = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); }; W(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); W(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); W(36, 'data'); v.setUint32(40, n * 2, true); for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin(i * 0.5) * 6000 * Math.min(1, i / 200, (n - i) / 200), true); let bin = ''; new Uint8Array(b).forEach(c => bin += String.fromCharCode(c)); const uri = 'data:audio/wav;base64,' + btoa(bin); window.AC_OKV = {}; ids.forEach(id => window.AC_OKV[id] = uri); }""")
                await arrive("(function(){ okachiArrive(); return 1; })()"); await pg.evaluate("() => { window.__tts.said.length = 0; }")
                ok = await pg.evaluate("() => ISLE_x.okv()")
                if ok['want'] or await pg.evaluate("() => !!window.AC_OKV"): CLIP = True   # the page carries its recordings
                if CLIP:
                    await pg.evaluate(EV, "(function(){ OKV.rate = 4.4; return 1; })()")   # the scene's clock is run about four times fast here: the recordings as well
                    for _ in range(80):
                        ok = await pg.evaluate("() => ISLE_x.okv()")
                        if ok['st'] == 2: break
                        await pg.wait_for_timeout(250)
                    need(ok['st'] == 2 and ok['have'] - ok.get('enHave', 0) == ok['lines'] == 45 and ok.get('enHave', 0) in (0, ok.get('enLines', 0)), lang + ' okachimachi the recordings are taken in (one for each of the 45 lines; the English ones all or none)', json.dumps(ok))
                    du = json.loads(await pg.evaluate(EV, "JSON.stringify(Object.keys(OKV.buf).sort().map(function (k) { return +OKV.buf[k].duration.toFixed(2); }))"))
                    need(len(du) >= 45 and min(du) > 0.3 and max(du) < 14, lang + ' okachimachi each recording decodes to a line\'s length', json.dumps([len(du), min(du), max(du), round(sum(du), 1)]))
                info = json.loads(await pg.evaluate(EV, "JSON.stringify({ id: TK.id, trk: TK.T.TRK, tr: TK.T.trains.map(function (t) { var q = AN_JR[anTrk(TK.T, t)]; return [t.x, t.dir, q && q.n, q && q.to.ja, t.st]; }), ear: anEarJR(TK.T, cam.position) })"))
                log(DEV, lang, 'okachimachi', json.dumps(info, ensure_ascii=False))
                m = {x[2]: (x[0], x[1], x[3]) for x in info['tr']}
                need(m.get(1, [0, 0, ''])[2] == '東京・横浜方面' and m[1][1] < 0 and m.get(2, [0, 0, ''])[2] == '東京・品川方面' and m.get(3, [0, 0, ''])[2] == '上野・池袋方面' and m[3][1] > 0 and m.get(4, [0, 0, ''])[2] == '大宮方面' and m[1][0] < m[2][0] < m[3][0] < m[4][0], lang + ' okachimachi tracks numbered as the station is (1 Keihin-Tohoku south … 4 Keihin-Tohoku north)', json.dumps(m, ensure_ascii=False))
                need(info['ear']['vol'] > 0.3, lang + ' okachimachi heard at the north exit', json.dumps(info['ear']))
                # on the west island (3 and 4): only its own two tracks
                await pg.evaluate("() => ISLE_x.annAt([6.5, -40, 7.5 + 1.6])"); seen = {}; caps = []; t = 0; board4 = None
                while t < 240 and not all(k in seen for k in ('jr.in.3', 'jr.in.4', 'jr.go.3', 'jr.go.4')):
                    r = await run(3); assert not isinstance(r, str), r; t += r; a = await ann()
                    for r in a['log']:
                        if r['key'] == 'jr.in.4' and 'jr.in.4' not in seen: board4 = json.loads(await pg.evaluate(EV, "JSON.stringify(TK.T.oka.led[4].data.rows[0])"))
                        seen.setdefault(r['key'], r)
                    if a['cur'] and len(caps) < 40:
                        c = await pg.evaluate(CAP)
                        if c: caps.append((a['cur'], c))
                await run(16, "!ANN.cur") # the one being spoken is heard to its end (its English follows the Japanese)
                log(DEV, lang, 'okachimachi west island after', round(t), 's:', sorted(seen))
                for k in ('jr.in.3', 'jr.in.4', 'jr.go.3', 'jr.go.4'): need(k in seen, lang + ' okachimachi announced ' + k, json.dumps(seen.get(k), ensure_ascii=False))
                need(not any(k in seen for k in ('jr.in.1', 'jr.in.2', 'jr.go.1', 'jr.go.2')), lang + ' okachimachi west island hears only tracks 3 and 4', sorted(seen))
                S = await said(True); ja = [s for s in S if s['lang'].startswith('ja')]; en = [s for s in S if s['lang'].startswith('en')]
                t3 = [s for s in ja if s['t'].startswith('まもなく、3番線')]; t4 = [s for s in ja if s['t'].startswith('まもなく、4番線')]
                import re
                more = sorted(k for k in seen if k.startswith('jr.nx') or k.startswith('jr.ar'))
                need(any(k.startswith('jr.nx') for k in more) and any(k.startswith('jr.ar') for k in more) and not any(k[-1] in '12' for k in more), lang + ' okachimachi the next train is named and the station on arrival (this island\'s tracks only)', more)
                need(bool(board4) and board4[0] in seen['jr.in.4']['src'] and (board4[2] + '行き') in seen['jr.in.4']['src'], lang + ' okachimachi track 4: the kind of train and where it goes are the indicator\'s', json.dumps((board4, seen['jr.in.4']['src']), ensure_ascii=False))
                if CLIP:
                    logs = (await ann())['log']; jsegs = [x for r in logs if r['key'].startswith('jr.') for x in r['segs'] if x[0] == 'ja']
                    need(len(jsegs) >= 3 and all(x[1] == 1 and x[2] == 'clip' for x in jsegs) and not ja, lang + ' okachimachi with recordings: every Japanese line is played from its recording, none spoken by the device', json.dumps((jsegs[:4], ja[:1]), ensure_ascii=False))
                # (v81) nothing at this station is the device's own voice: Japanese and English are recordings, and a line without one is not spoken
                need(not S, lang + ' okachimachi nothing is spoken by the device\'s own voice', json.dumps(S[:2], ensure_ascii=False))
                logs = (await ann())['log']; esegs = [x for r in logs if r['key'].startswith('jr.') for x in r['segs'] if x[0] == 'en']; okE = await pg.evaluate("() => ISLE_x.okv()")
                need(all(x[2] in ('clip', 'norec') for x in esegs), lang + ' okachimachi the English, when it is said, is a recording', json.dumps((okE.get('enHave'), esegs[:4]), ensure_ascii=False))
                if okE.get('enHave'):   # the English of an approach: two recordings (the train, the warning), there and playable — whether it was said just now depends on the other trains (it gives way to them)
                    es = json.loads(await pg.evaluate(EV, "(function(){ var a = jrIn(AN_JR[3]), e = a.segs.filter(function (x) { return x.l === 'en'; })[0]; window.__enT = null; if (e) { annStop(); spSay(e, 0.4, function (why, st) { window.__enT = [why, st]; }); } return JSON.stringify(e ? { clip: e.clip, opt: e.opt, skip: typeof e.skip, have: okvHave(e.clip), t: e.t } : null); })()"))
                    for _ in range(40):
                        got = await pg.evaluate("() => window.__enT")
                        if got: break
                        await pg.wait_for_timeout(250)
                    need(bool(es) and len(es['clip']) == 2 and es['have'] and es['opt'] == 1 and es['skip'] == 'function' and got == ['clip', True], lang + ' okachimachi the approach has its English (two recordings, played through the loudspeakers, giving way to another train)', json.dumps((es, got), ensure_ascii=False))
                    pa = await pg.evaluate("() => ISLE_x.okv().pa"); need(pa in ('plat', 'hall', 'far'), lang + ' okachimachi the announcements go through the platform loudspeakers', pa)
                for s in ja[:4] + en[:2]: log('     said', json.dumps(s, ensure_ascii=False))
                for key, c in caps[:1] + [x for x in caps if x[0].startswith('jr.go')][:1]:
                    need(c['inView'] and not c['over'] and (lang == 'ja') == (c['orig'] == ''), lang + ' okachimachi line on screen ' + key, json.dumps(c, ensure_ascii=False))
                # in the concourse: all four
                await pg.evaluate("() => ISLE_x.annAt([0, -30, 1.6])"); seen2 = {}; t = 0
                while t < 200 and len([k for k in seen2 if k.startswith('jr.in')]) < 4:
                    t += await run(3); a = await ann()
                    for r in a['log']: seen2.setdefault(r['key'], r)
                need(all(any(k in seen2 for k in ('jr.in.%d' % n, 'jr.go.%d' % n)) for n in (1, 2, 3, 4)) and len([k for k in seen2 if k.startswith('jr.in')]) >= 3, lang + ' okachimachi concourse hears all four tracks (each track\'s approach or its doors; one approach may give way when two trains come in together)', sorted(seen2))
                await pg.evaluate("() => { ISLE_x.annAt(null); }")
            # ---------- the mute switch ----------
            if 'mute' in PARTS:
                if not await pg.evaluate(EV, "!!TK"): await arrive("ISLE_x.city('hsr')")
                await run(3, "!ANN.cur"); await pg.wait_for_timeout(2600); await run(3)
                await pg.evaluate("() => ISLE_x.annSay('in', 0)"); await run(6, "!!ANN.cur"); await pg.wait_for_timeout(2400); a = await ann(); c = await pg.evaluate(CAP)
                need(bool(a['cur']) and bool(c), lang + ' an announcement under way before muting', json.dumps(a['cur']))
                n0 = len(await said()); await pg.evaluate("() => { SimAudio.mute(true); }"); await run(1.5); a = await ann(); c = await pg.evaluate(CAP); k0 = await pg.evaluate("() => window.__tts.cancels")
                await pg.evaluate("() => ISLE_x.annSay('in', 0)"); await run(6); n1 = len(await said())
                need(a['cur'] is None and c is None and n1 <= n0 + 0 and k0 >= 1, lang + ' muted: the announcement stops, the line goes, nothing more is said', json.dumps({'cur': a['cur'], 'cap': c, 'said': [n0, n1], 'cancels': k0}))
                await pg.evaluate("() => { SimAudio.mute(false); }"); await run(4)
            # ---------- a device that cannot speak: the call and the line on screen remain ----------
            if 'novoice' in PARTS:
                if not await pg.evaluate(EV, "!!TK"): await arrive("ISLE_x.city('hsr')")
                await run(6, "!ANN.cur"); await pg.wait_for_timeout(2600)
                await pg.evaluate("() => { window.__tts.mode = 'nostart'; window.__tts.said.length = 0; }"); await pg.evaluate(EV, "ANN.ok = null; ANN.fails = 0; ANN.list.length = 0; 1")
                await pg.evaluate("() => ISLE_x.annSay('in', 0)"); await run(4, "!!ANN.cur"); await pg.wait_for_timeout(6500); c = await pg.evaluate(CAP); a = await ann()
                need(bool(c) and c['inView'], lang + ' no voice: the line on screen is there', json.dumps(c, ensure_ascii=False)[:200])
                need(a['log'][-1]['segs'][:1] == [[a['log'][-1]['segs'][0][0], 0, 'nostart']] and len(a['log'][-1]['segs']) == 1, lang + ' no voice: noticed at the first sentence, the rest not asked for', json.dumps(a['log'][-1], ensure_ascii=False)[:300])
                for i in range(3):
                    await run(12, "!ANN.cur"); await pg.wait_for_timeout(300); await run(4); await pg.evaluate("() => ISLE_x.annSay('on', 0)"); await run(4, "!!ANN.cur"); await pg.wait_for_timeout(5200)
                a = await ann(); need(a['ok'] is False, lang + ' no voice: after a few tries the voice is left alone for a while', json.dumps({'ok': a['ok'], 'log': [r['segs'] for r in a['log'][-4:]]}, ensure_ascii=False))
                await pg.evaluate("() => { window.__tts.mode = 'ok'; }")
            need(not errs, lang + ' no errors', errs[:4])
            await ctx.close()
        await b.close()
    log('BAD', bad)
asyncio.run(main())
