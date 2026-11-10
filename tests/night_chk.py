# Okachimachi at night: the station's own lights. The lit places are on after dark and off by day; on a platform, in the hall and on a stair she
# stands in one (and her head lamp is turned down there), out in the street she does not; and the picture itself: the same view drawn with the
# lamps on and with them held off, the lit one several times brighter where the floor is
#   python3 night_chk.py <out dir> [views: plat,hall,stair,street]
import asyncio, sys, json, time, os, io
import os
from playwright.async_api import async_playwright
from PIL import Image
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; WANT = (sys.argv[2] if len(sys.argv) > 2 else 'plat,hall,stair,street').split(','); FILE = os.environ.get('TK_FILE', 'build/test_min.html'); os.makedirs(OUT, exist_ok=True)
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
EV = "(c) => { try { return ISLE_x.ev(c); } catch (e) { return 'ERR ' + e; } }"
# where she stands (x, z, floor), where the lens is and what it looks at, and whether the place is one of the lit ones
SPOT = { 'plat': ((6.5, -30, 7.54), ([6.5, 9.0, -38], [6.4, 8.3, -10]), True), 'hall': ((6.0, 10.5, 0.14), ([10.5, 1.7, 12.0], [-4, 1.3, 6]), True),
         'stair': ((6.5, 2.0, 3.6), ([6.5, 1.7, 9.2], [6.5, 4.6, -3]), True), 'street': ((27, 20, 0.0), ([30, 1.7, 24], [12, 5.5, 4]), False) }
def lum(png, box):
    im = Image.open(io.BytesIO(png)).convert('L'); w, h = im.size; c = im.crop((int(w * box[0]), int(h * box[1]), int(w * box[2]), int(h * box[3]))); px = list(c.getdata()); return sum(px) / len(px)
async def run(pw, hour, bad):
    b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
    ctx = await b.new_context(viewport={"width": 800, "height": 500}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:300])); pg.on("console", lambda m: errs.append(m.text[:300]) if m.type == "error" and "ERR_" not in m.text else None)
    await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_NOFLY = true; window.ISLE_TKTIER = 'high'; window.ISLE_HOUR = %s; try { localStorage.setItem('ac-guide-lang', 'zh'); } catch (e) {}" % hour)
    await pg.goto("file://" + D + "/" + FILE + "#/island", wait_until="commit", timeout=240000); t0 = time.time()
    while time.time() - t0 < 300:
        if await pg.evaluate("() => !!(window.ISLE_x && ISLE_x.intro && ISLE_x.intro().ready) ? 1 : 0"): break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(1500)
    await pg.evaluate(EV, "(function(){ okachiArrive(); travel = null; fall = null; mode = 'walk'; document.getElementById('isTitle').hidden = true; var t = document.querySelector('.isle__talk'); if (t) t.hidden = true; root.classList.add('is-shot'); return 1; })()")
    await pg.add_style_tag(content=".isle.is-shot .isle__hud, .isle.is-shot #isTkBar, .isle.is-shot .isle__toast, .isle.is-shot .isle__banner, .isle.is-shot .isle__ann, .isle.is-shot .isle__nav, .isle.is-shot button { visibility: hidden !important; }")
    def need(ok, what, got=''):
        log('OK ' if ok else 'BAD', 'hour', hour, what, got)
        if not ok: bad.append((hour, what))
    night = float(hour) > 18 or float(hour) < 5
    for v in WANT:
        (x, z, y), (e, l), lit = SPOT[v]
        await pg.evaluate(EV, "(function(){ var T = TK.T, w = T.toW(%s, 0, %s), a = T.toW(%s, 0, %s), b = T.toW(%s, 0, %s); pos.set(w.x, T.Y + %s, w.z); vel.set(0, 0, 0); luna.root.position.copy(pos); ISLE_x.camHold([a.x, T.Y + %s, a.z], [b.x, T.Y + %s, b.z]); return 1; })()" % (x, z, e[0], e[2], l[0], l[2], y, e[1], l[1]))
        await pg.wait_for_timeout(2600); await pg.evaluate(EV, "(function(){ for (var i = 0; i < 30; i++) lightsTick(0.1); cam.updateMatrixWorld(); W.lightsTick(cam, CAM.tgt.x, CAM.tgt.z); return 1; })()"); zl = await pg.evaluate("() => ISLE_x.zl()")   # the easing run on by hand: the pictures here are drawn far slower than a device draws them
        if night:
            need(zl['k'] > 0.98 and zl['n'] >= zl['fixed'] >= 7, v + ': the lamps are on, the lit places are known', json.dumps(zl))
            need((zl['inn'] > 0.8) == lit, v + (': she is in a lit place' if lit else ': out in the street she is in none'), zl['inn'])
            if lit: need(zl['spot'] < 0.35, v + ': her head lamp is turned down there', zl['spot'])
            on = await pg.screenshot(timeout=240000); open("%s/%s_on.png" % (OUT, v), 'wb').write(on)
            await pg.evaluate("() => { window.ISLE_ZLK = 0; }"); await pg.wait_for_timeout(1800); off = await pg.screenshot(timeout=240000); open("%s/%s_off.png" % (OUT, v), 'wb').write(off); await pg.evaluate("() => { window.ISLE_ZLK = null; }")
            box = (0.15, 0.55, 0.85, 0.95); a, c = lum(on, box), lum(off, box)
            if lit: need(a > 100 and a > c * 1.4, v + ': the floor in the picture is lit (lamps on against lamps held off; the hall has its ceiling lamps either way)', (round(a, 1), round(c, 1)))
            else: log('    ', v, 'picture: lower part', round(a, 1), 'with the lamps,', round(c, 1), 'without')
        else:
            need(zl['k'] == 0 and zl['n'] == 0, v + ': by day the lamps are off', json.dumps(zl))
            if v == 'plat': open("%s/%s_day.png" % (OUT, v), 'wb').write(await pg.screenshot(timeout=240000))
    need(not errs, 'no errors', errs[:3]); await b.close()
async def main():
    bad = []
    async with async_playwright() as pw:
        for hour in os.environ.get('HOURS', '21.47,12').split(','): await run(pw, hour, bad)
    log('BAD', bad)
asyncio.run(main())
