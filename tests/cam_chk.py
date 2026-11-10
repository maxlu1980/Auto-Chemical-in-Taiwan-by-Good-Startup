# (v77) the lens in hand and the keys on screen: with a mouse and keys — the buttons that are on screen (turn, closer / farther, behind her, the
# next view, W A S D, Shift, the cities' own), each with its key, none laid over another, all in the picture; that the keys , . - = C, a drag of
# the mouse, and the buttons do what they say; that the lens comes round behind her on a walk she was sent on and holds still while she is steered
# sideways — and with a finger: the left half of the picture walks, the right half looks, both at once; two fingers on one side pinch
#   python3 cam_chk.py <out dir> <desk|mobile|land|laptop> <zh,en,ja> [parts: isle,city,tkw]      SHOTS=1 for pictures (slow under software rendering)
import asyncio, sys, json, time, os
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; DEV = sys.argv[2]; LANGS = sys.argv[3].split(','); PARTS = (sys.argv[4] if len(sys.argv) > 4 else 'isle,city,tkw').split(',')
FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
VP = {'desk': (1280, 760), 'mobile': (390, 780), 'land': (780, 390), 'laptop': (1024, 600)}[DEV]; TOUCH = DEV in ('mobile', 'land')
SHOTS = os.environ.get('SHOTS', '') == '1'
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
HUD = """() => { const root = document.querySelector('.isle'); if (!root) return null;
  const shown = e => { if (!e.isConnected) return false; for (let n = e; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) { const c = getComputedStyle(n); if (c.display === 'none' || c.visibility === 'hidden' || n.hidden || parseFloat(c.opacity) < 0.05) return false; } const r = e.getBoundingClientRect(); return r.width > 3 && r.height > 3; };
  const name = e => e.id || (e.getAttribute('data-a') ? 'act:' + e.getAttribute('data-a') : e.getAttribute('data-k') ? 'key:' + e.getAttribute('data-k') : e.getAttribute('data-v') ? 'veh:' + e.getAttribute('data-v') : (e.className + '').split(' ').slice(0, 2).join('.'));
  const B = [...root.querySelectorAll('button')].filter(shown).map(e => { const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, top = document.elementFromPoint(cx, cy), k = getComputedStyle(e, '::after').content;
    return { e, r, n: name(e), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), key: k && k !== 'none' && k !== 'normal' ? k.replace(/^"|"$/g, '') : '', inView: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, onTop: !!top && (top === e || e.contains(top)), under: top && top !== e && !e.contains(top) ? String(top.id || (top.className.baseVal != null ? top.className.baseVal : top.className) || top.tagName).slice(0, 40) : '' }; });
  const over = []; for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) { const a = B[i], b = B[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue; const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top); if (ix > 2 && iy > 2) over.push(a.n + ' x ' + b.n + ' ' + Math.round(ix) + 'x' + Math.round(iy)); }
  const bar = document.getElementById('isTkBar'), hint = document.getElementById('isTkHint');
  return { cls: root.className, btn: B.map(b => ({ n: b.n, x: b.x, y: b.y, w: b.w, h: b.h, key: b.key, inView: b.inView, onTop: b.onTop, under: b.under })), over, tkbar: bar && shown(bar) ? Math.round(bar.getBoundingClientRect().width) : 0, tkhint: !!(hint && shown(hint)) }; }"""
CAMS = "() => { try { return ISLE_x.cam(); } catch (e) { return { err: String(e) }; } }"
STATE = "JSON.stringify({ mode: mode, fall: !!fall, travel: !!travel, x: +pos.x.toFixed(2), y: +pos.y.toFixed(2), z: +pos.z.toFixed(2), sp: +Math.hypot(vel.x, vel.z).toFixed(2), walkTo: !!(target || (path && path.length)), W: !!keys.KeyW, sh: !!keys.ShiftLeft, card: !!cardOn, tkw: typeof TKW !== 'undefined' && TKW, gs: typeof gsOn === 'function' && !!gsOn(), behind: +adiff((VEH.kind !== 'walk' ? VEH.heading : face) + Math.PI, CAM.yaw).toFixed(3), mvBehind: Math.hypot(vel.x, vel.z) > 0.3 ? +adiff(Math.atan2(vel.x, vel.z) + Math.PI, CAM.yaw).toFixed(3) : null })"
# a finger, made by hand (several at once)
PTR = """([type, id, x, y]) => { const cv = document.querySelector('.isle canvas'); cv.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, button: 0, buttons: type === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true, isPrimary: id === 11 })); return 1; }"""
def ad(a, b):
    import math
    d = a - b
    while d > math.pi: d -= 2 * math.pi
    while d < -math.pi: d += 2 * math.pi
    return d
async def main():
    bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        for lang in LANGS:
            for part in PARTS:
                ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=TOUCH, is_mobile=TOUCH); pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append("console.error: " + m.text[:200]) if m.type == "error" and "ERR_" not in m.text else None)
                await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_CINE_NOGUARD = true; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {}")
                tag = DEV + ' ' + lang + ' ' + part
                def need(ok, what, info=''):
                    log(tag, ('OK  ' if ok else 'BAD ') + what, info if (not ok or len(str(info)) < 300) else str(info)[:300])
                    if not ok: bad.append(tag + ' ' + what)
                async def ev(c): return await pg.evaluate(EV, c)
                async def st(): return json.loads(await ev(STATE))
                async def cam(): return await pg.evaluate(CAMS)
                async def draw(on):  # the picture left undrawn while the play is checked (software rendering is slow), drawn again for a screenshot
                    await ev("(function(){ if (!window.__r0) { window.__r0 = R3.render; window.__p0 = POST ? POST.render : null; } if (%s) { R3.render = window.__r0; if (POST) POST.render = window.__p0; } else { R3.render = function () {}; if (POST) POST.render = function () {}; } return 1; })()" % ('true' if on else 'false'))
                async def shot(name):
                    if not SHOTS: return
                    await draw(True); await pg.wait_for_timeout(2500)
                    try: await pg.screenshot(path="%s/%s_%s_%s.png" % (OUT, DEV, lang, name), timeout=240000)
                    except Exception as e: log(tag, 'shot skipped', name)
                    await draw(False)
                await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000)
                t0 = time.time()
                while time.time() - t0 < 300:
                    if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
                    await pg.wait_for_timeout(500)
                for _ in range(160):
                    if await pg.evaluate("() => { const b = document.getElementById('acBoot'); if (!b || b.hidden) return true; const cs = getComputedStyle(b); return cs.display === 'none' || parseFloat(cs.opacity) < 0.02; }"): break
                    await pg.wait_for_timeout(500)
                await pg.wait_for_timeout(800)
                if part == 'isle':
                    await pg.evaluate("() => ISLE._dbg.startGame()")
                elif part == 'city':
                    await pg.evaluate("() => { ISLE_x.city('hsr'); }"); await pg.wait_for_timeout(1500)
                    await ev("(function(){ travel = null; fall = null; mode = 'walk'; var t = document.getElementById('isTitle'); if (t) t.hidden = true; document.getElementById('isHud').hidden = false; return 1; })()")
                elif part == 'tkw':
                    await ev("(function(){ tkWalkStart(); return 1; })()")
                t0 = time.time(); s = None
                while time.time() - t0 < 240:
                    s = await st()
                    if s['mode'] == 'walk' and not s['fall'] and not s['travel']: break
                    await pg.wait_for_timeout(700)
                await draw(False)
                # what she is told on arriving is closed, and the play has settled where it goes on (after the landing she is taken to Taipei)
                t0 = time.time(); calm = 0; prev = None
                while time.time() - t0 < 150 and calm < 5:
                    busy = await ev("(function(){ var a = !!talkQ, b = !!cardOn; if (a) talkEnd(); else if (b) cardClose(); return a || b || mode !== 'walk' || !!fall || !!travel; })()")
                    q = await st(); here = (round(q['x']), round(q['z']))
                    calm = calm + 1 if (not busy and here == prev) else 0; prev = here
                    await pg.wait_for_timeout(800)
                await pg.wait_for_timeout(1200); s = await st(); c = await cam()
                log(tag, 'state', json.dumps(s), json.dumps(c))
                need(s['mode'] == 'walk' and not s['fall'] and not s['travel'] and 'err' not in c, 'playing', json.dumps(s))
                if TOUCH: await pg.evaluate(PTR, ['pointerdown', 31, 5, 5]); await pg.evaluate(PTR, ['pointerup', 31, 5, 5]); await pg.wait_for_timeout(400)  # a finger is in use
                else: await pg.mouse.move(VP[0] / 2, VP[1] / 2); await pg.mouse.down(button='right'); await pg.mouse.up(button='right'); await pg.wait_for_timeout(400)
                # ---------- what is on screen ----------
                h = await pg.evaluate(HUD); m = {x['n']: x for x in h['btn']}
                log(tag, 'on screen', h['cls'], json.dumps([[x['n'], x['x'], x['y'], x['w'], x['h'], x['key']] for x in h['btn']], ensure_ascii=False))
                need(not h['over'], 'no button laid over another', h['over'])
                out = [x['n'] for x in h['btn'] if not x['inView']]; need(not out, 'every button within the picture', out)
                cov = [(x['n'], x['under']) for x in h['btn'] if not x['onTop']]; need(not cov, 'no button under something else', cov)
                if not TOUCH:
                    want = {'isRotL': ',', 'isRotR': '.', 'isCamOut': '-', 'isCamIn': '=', 'isCamBack': 'C', 'isCamView': 'V', 'key:KeyW': '', 'key:KeyA': '', 'key:KeyS': '', 'key:KeyD': '', 'isKeyRun': ''}
                    if s['gs']: want.update({'act:car': 'F', 'act:jump': 'Space', 'act:punch': 'R', 'isGsPhBtn': 'P'})
                    elif part == 'isle': want.update({'veh:walk': '1', 'veh:moped': '2', 'veh:car': '3'})
                    miss = [k for k in want if k not in m]; need(not miss, 'the buttons for a mouse are on screen', miss)
                    wrong = [(k, m[k]['key']) for k in want if k in m and want[k] and m[k]['key'] != want[k]]; need(not wrong, 'each with its key on it', wrong)
                    if part == 'tkw': need(not h['tkhint'], 'the free walk: the line of text gives way to the keys', h['tkbar'])
                else:
                    need('key:KeyW' not in m and 'isKeyRun' not in m and 'isCamOut' not in m and 'isCamIn' not in m, 'with a finger: no keyboard pad, no zoom buttons', sorted(m))
                    need('isRotL' in m and 'isRotR' in m and 'isCamBack' in m, 'with a finger: turn and “behind her” buttons', sorted(m))
                    keyed = [(x['n'], x['key']) for x in h['btn'] if x['key']]; need(not keyed, 'with a finger: no keys drawn on the buttons', keyed)
                await shot(part)
                # ---------- the lens ----------
                if not TOUCH:
                    c0 = await cam(); await pg.keyboard.down('Comma'); t0 = time.time(); c1 = await cam()
                    while time.time() - t0 < 8 and c1['yaw'] - c0['yaw'] < 0.3: await pg.wait_for_timeout(120); c1 = await cam()
                    await pg.keyboard.up('Comma'); await pg.wait_for_timeout(200); c1 = await cam()
                    need(c1['yaw'] - c0['yaw'] > 0.15 and c1['rot'] == 0, 'the , key turns the view (and stops when let go)', (c0['yaw'], c1['yaw'], c1['rot']))
                    await pg.keyboard.down('Period'); t0 = time.time(); c2 = await cam()
                    while time.time() - t0 < 8 and c2['yaw'] - c1['yaw'] > -0.3: await pg.wait_for_timeout(120); c2 = await cam()
                    await pg.keyboard.up('Period'); await pg.wait_for_timeout(200); c2 = await cam()
                    need(c2['yaw'] - c1['yaw'] < -0.15, 'the . key turns it the other way', (c1['yaw'], c2['yaw']))
                    await pg.keyboard.press('Minus'); await pg.keyboard.press('Minus'); c3 = await cam(); await pg.keyboard.press('Equal'); c4 = await cam()
                    need(c3['d'] > c2['d'] * 1.15 and c4['d'] < c3['d'] * 0.95, 'the - and = keys draw back and come closer', (c2['d'], c3['d'], c4['d']))
                    # a drag of the mouse looks round; no stick
                    await pg.mouse.move(VP[0] * 0.5, VP[1] * 0.42); await pg.mouse.down(); await pg.mouse.move(VP[0] * 0.5 + 60, VP[1] * 0.42 + 20, steps=4); c5 = await cam(); await pg.mouse.move(VP[0] * 0.5 + 120, VP[1] * 0.42 + 40, steps=4); await pg.mouse.up(); c6 = await cam()
                    need(abs(ad(c6['yaw'], c4['yaw']) + 0.96) < 0.15 and c6['p'] > c4['p'] + 0.1 and not c5['stick'] and c6['userT'] > 3, 'a drag of the mouse turns and tilts the view (no stick)', (c4['yaw'], c6['yaw'], c4['p'], c6['p'], c5['stick'], c6['userT']))
                    # the buttons: farther (held), behind her
                    bx = m['isCamOut']; await pg.mouse.move(bx['x'] + bx['w'] / 2, bx['y'] + bx['h'] / 2); await pg.mouse.down(); await pg.wait_for_timeout(3000); c7 = await cam(); await pg.mouse.up(); await pg.wait_for_timeout(150); c8 = await cam()
                    need(c7['hold'] == 'zo' and c8['d'] > c6['d'] * 1.2 and c8['hold'] is None, 'the “farther” button, held, draws back', (c6['d'], c8['d'], c7['hold'], c8['hold']))
                    bx = m['isCamBack']; await pg.mouse.click(bx['x'] + bx['w'] / 2, bx['y'] + bx['h'] / 2); t0 = time.time(); s = await st()
                    while time.time() - t0 < 20 and abs(s['behind']) > 0.03: await pg.wait_for_timeout(200); s = await st()
                    c9 = await cam(); need(abs(s['behind']) <= 0.03 and c9['userT'] == 0, 'the “behind her” button brings the lens round behind her', (s['behind'], c9))
                    await pg.keyboard.down('Comma'); await pg.wait_for_timeout(1500); await pg.keyboard.up('Comma'); await pg.keyboard.press('KeyC'); t0 = time.time(); s = await st()
                    while time.time() - t0 < 20 and abs(s['behind']) > 0.03: await pg.wait_for_timeout(200); s = await st()
                    need(abs(s['behind']) <= 0.03, 'the C key does the same', s['behind'])
                    # the moves: W held with the mouse, Shift switched on and off
                    s0 = await st(); bx = m['key:KeyW']; await pg.mouse.move(bx['x'] + bx['w'] / 2, bx['y'] + bx['h'] / 2); await pg.mouse.down(); await pg.wait_for_timeout(4000); s1 = await st(); await pg.mouse.up(); await pg.wait_for_timeout(500); s2 = await st()
                    import math
                    need(s1['W'] and math.hypot(s1['x'] - s0['x'], s1['z'] - s0['z']) > 0.25 and not s2['W'], 'the W button, held, walks her on; let go, she stops', (s0, s1, s2['W'], s2['sp']))
                    bx = m['isKeyRun']; await pg.mouse.click(bx['x'] + bx['w'] / 2, bx['y'] + bx['h'] / 2); await pg.wait_for_timeout(300); c10 = await cam(); s3 = await st(); await pg.mouse.click(bx['x'] + bx['w'] / 2, bx['y'] + bx['h'] / 2); await pg.wait_for_timeout(300); c11 = await cam(); s4 = await st()
                    need(c10['run'] and s3['sh'] and not c11['run'] and not s4['sh'], 'the Shift button switches running on and off', (c10['run'], s3['sh'], c11['run'], s4['sh']))
                    # steered sideways, the lens holds still
                    await ev("(function(){ CAM.userT = 0; return 1; })()"); c12 = await cam(); await pg.keyboard.down('KeyD'); await pg.wait_for_timeout(3500); c13 = await cam(); s5 = await st(); await pg.keyboard.up('KeyD')
                    need(abs(ad(c13['yaw'], c12['yaw'])) < 0.03 and s5['sp'] > 0.3, 'steered sideways, the lens holds still (no circling)', (c12['yaw'], c13['yaw'], s5['sp']))
                    if part in ('isle', 'tkw'):
                        # sent on a walk with a click, from a view turned aside: the lens comes round behind the way she walks
                        await ev("(function(){ CAM.yaw += 1.9; CAM.userT = 0; return 1; })()"); await pg.wait_for_timeout(300); got = None
                        for (fx, fy) in ((0.5, 0.36), (0.42, 0.44), (0.6, 0.48), (0.5, 0.56)):
                            await pg.mouse.click(VP[0] * fx, VP[1] * fy); await pg.wait_for_timeout(900); s6 = await st()
                            if s6['walkTo']: got = s6; break
                        if not got: need(part == 'tkw', 'a click on the ground sends her there', s6)
                        else:
                            t0 = time.time(); first = None; last = None
                            while time.time() - t0 < 40:
                                s7 = await st()
                                if s7['mvBehind'] is not None:
                                    if first is None: first = abs(s7['mvBehind'])
                                    last = abs(s7['mvBehind'])
                                if not s7['walkTo'] and first is not None: break
                                await pg.wait_for_timeout(250)
                            need(first is not None and last is not None and (last < 0.35 or last < first * 0.5), 'on a walk she was sent on, the lens comes round behind her', (first, last))
                            await ev("(function(){ target = null; path = null; return 1; })()")
                    if s['gs']:
                        bx = m['act:jump']; await pg.mouse.move(bx['x'] + bx['w'] / 2, bx['y'] + bx['h'] / 2); await pg.mouse.down(); await pg.mouse.up(); jc = await ev("JSON.stringify([GS.jumpCD, luna.mode])")
                        need(json.loads(jc)[0] > 0, 'the jump button, clicked, jumps', jc)
                else:
                    W, H = VP; c0 = await cam()
                    # the right half looks
                    await pg.evaluate(PTR, ['pointerdown', 11, W * 0.75, H * 0.5]); await pg.evaluate(PTR, ['pointermove', 11, W * 0.75 - 30, H * 0.5 + 10]); await pg.evaluate(PTR, ['pointermove', 11, W * 0.75 - 70, H * 0.5 + 30]); c1 = await cam()
                    need(c1['orbit'] and c1['orbit']['on'] and not c1['stick'] and ad(c1['yaw'], c0['yaw']) > 0.4 and c1['p'] > c0['p'] + 0.1, 'a finger on the right half turns and tilts the view', (c0['yaw'], c1['yaw'], c0['p'], c1['p'], c1['orbit'], c1['stick']))
                    # the left half walks, at the same time
                    s0 = await st(); await pg.evaluate(PTR, ['pointerdown', 12, W * 0.25, H * 0.6]); await pg.evaluate(PTR, ['pointermove', 12, W * 0.25, H * 0.6 - 30]); await pg.evaluate(PTR, ['pointermove', 12, W * 0.25, H * 0.6 - 70]); c2 = await cam()
                    need(c2['stick'] and c2['orbit'] and not c2['gest'], 'a second finger on the left half walks while the first looks (no pinch)', (c2['stick'], c2['orbit'], c2['gest']))
                    await pg.evaluate(PTR, ['pointermove', 11, W * 0.75 - 120, H * 0.5 + 30]); c3 = await cam(); await pg.wait_for_timeout(4000); s1 = await st()
                    import math
                    need(ad(c3['yaw'], c2['yaw']) > 0.3 and c3['stick'] and math.hypot(s1['x'] - s0['x'], s1['z'] - s0['z']) > 0.2, 'looking and walking at once', (c2['yaw'], c3['yaw'], s0, s1))
                    await pg.evaluate(PTR, ['pointerup', 11, W * 0.75 - 120, H * 0.5 + 30]); c4 = await cam(); need(c4['stick'] and not c4['orbit'], 'the looking finger lifted: she walks on', (c4['stick'], c4['orbit']))
                    await pg.evaluate(PTR, ['pointerup', 12, W * 0.25, H * 0.6 - 70]); c5 = await cam(); need(not c5['stick'] and not c5['orbit'], 'both lifted: at rest', (c5['stick'], c5['orbit']))
                    # two fingers on one side: pinch
                    await pg.evaluate(PTR, ['pointerdown', 11, W * 0.62, H * 0.5]); await pg.evaluate(PTR, ['pointerdown', 12, W * 0.9, H * 0.5]); c6 = await cam(); await pg.evaluate(PTR, ['pointermove', 12, W * 0.76, H * 0.5]); c7 = await cam(); await pg.evaluate(PTR, ['pointerup', 11, W * 0.62, H * 0.5]); await pg.evaluate(PTR, ['pointerup', 12, W * 0.76, H * 0.5]); c8 = await cam()
                    need(c6['gest'] and c7['d'] > c6['d'] * 1.3 and not c8['gest'] and not c8['orbit'] and not c8['stick'], 'two fingers on one side pinch to zoom', (c6['gest'], c6['d'], c7['d'], c8))
                    # a tap still walks there
                    got = None
                    for (fx, fy) in ((0.3, 0.42), (0.7, 0.42), (0.5, 0.5), (0.3, 0.56)):
                        await pg.evaluate(PTR, ['pointerdown', 11, W * fx, H * fy]); await pg.evaluate(PTR, ['pointerup', 11, W * fx, H * fy]); await pg.wait_for_timeout(900); s2 = await st()
                        if s2['walkTo'] or s2['card']: got = (fx, fy, 'card' if s2['card'] else 'walk'); break
                    need(bool(got) or part == 'tkw', 'a tap (either half) still acts (she walks there, or what was tapped opens)', (got, s2))
                    for _ in range(4):
                        if not await ev("(function(){ var a = !!talkQ, b = !!cardOn; if (a) talkEnd(); else if (b) cardClose(); return a || b; })()"): break
                        await pg.wait_for_timeout(300)
                    await ev("(function(){ target = null; path = null; return 1; })()"); h = await pg.evaluate(HUD); m = {x['n']: x for x in h['btn']}
                    top = await pg.evaluate("([x, y]) => { const e = document.elementFromPoint(x, y), b = e && e.closest('button'); if (b) b.click(); return b ? b.id : null; }", [m['isCamBack']['x'] + m['isCamBack']['w'] / 2, m['isCamBack']['y'] + m['isCamBack']['h'] / 2]); need(top == 'isCamBack', 'the “behind her” button is the one under the finger', top); t0 = time.time(); s = await st()
                    while time.time() - t0 < 20 and abs(s['behind']) > 0.03: await pg.wait_for_timeout(200); s = await st()
                    need(abs(s['behind']) <= 0.03, 'the “behind her” button brings the lens round behind her', s['behind'])
                need(not errs, 'no errors', errs[:4])
                await ctx.close()
        await b.close()
    log('BAD', bad)
asyncio.run(main())
