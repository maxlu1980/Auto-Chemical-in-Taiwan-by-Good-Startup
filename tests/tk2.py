import asyncio, sys, json, time
import os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; lang = sys.argv[2]; dev = sys.argv[3]; plan = json.loads(sys.argv[4]); extra = sys.argv[5] if len(sys.argv) > 5 else ''
VP = {'desk': (1280, 760), 'mobile': (390, 780), 'tablet': (1024, 768), 'wide': (1600, 640), 'big': (1600, 900)}[dev]
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"])
        ctx = await b.new_context(viewport={"width": VP[0], "height": VP[1]}, has_touch=dev == 'mobile', is_mobile=dev == 'mobile', device_scale_factor=1)
        pg = await ctx.new_page(); errs = []
        await pg.add_init_script("window.FAST3D = true; window.NO_GOV = true; window.ISLE_TEST = 1; window.ISLE_HOUR = window.TK_H || 15; try { localStorage.setItem('ac-guide-lang', '" + lang + "'); } catch (e) {} " + extra)
        pg.on("pageerror", lambda e: errs.append((str(e) + " | " + str(getattr(e, "stack", "")))[:1500])); pg.on("console", lambda m: errs.append("console." + m.type + ": " + m.text[:600]) if m.type == "error" and "ERR_TUNNEL" not in m.text else None)
        t = time.time(); await pg.goto("file://" + D + "/" + os.environ.get("TK_FILE", "build/test_local.html") + (plan[0][1] if plan and plan[0][0] == 'hash' else ''), wait_until="load", timeout=240000); await pg.wait_for_timeout(3000); log('loaded', round(time.time() - t, 1))
        try:
          for st in plan:
              kind = st[0]
              if kind == 'hash': continue
              if kind == 'shot': await pg.screenshot(path=f"{out}/{st[1]}.png", timeout=180000, full_page=(len(st) > 2 and st[2] == 'full')); log('shot', st[1])
              elif kind == 'wait': await pg.wait_for_timeout(st[1])
              elif kind == 'poll':
                  t0 = time.time(); r = None
                  while time.time() - t0 < st[2]:
                      r = await pg.evaluate("() => { " + st[1] + " }")
                      if r: break
                      await pg.wait_for_timeout(1000)
                  log('poll', round(time.time() - t0, 1), str(r)[:1200])
              elif kind == 'js': r = await pg.evaluate("() => { " + st[1] + " }"); log("js", str(r)[:3000])
              elif kind == 'jsf': r = await pg.evaluate("() => { " + st[1] + " }"); open(f"{out}/{st[2]}.json", 'w').write(str(r)); log("jsf", st[2], len(str(r)), str(r)[:300])
              elif kind == 'click': await pg.click(st[1], timeout=20000); log('click', st[1])
              elif kind == 'eshot': await pg.locator(st[1]).first.screenshot(path=f"{out}/{st[2]}.png", timeout=120000); log('eshot', st[2])
              elif kind == 'mouse':
                  for op in st[1]:
                      if op[0] == 'move': await pg.mouse.move(op[1], op[2], steps=(op[3] if len(op) > 3 else 1))
                      elif op[0] == 'down': await pg.mouse.down(button=op[1])
                      elif op[0] == 'up': await pg.mouse.up(button=op[1])
                      elif op[0] == 'wheel': await pg.mouse.wheel(0, op[1])
                      elif op[0] == 'wait': await pg.wait_for_timeout(op[1])
                  log('mouse', len(st[1]))
              elif kind == 'key': await pg.keyboard.press(st[1]); log('key', st[1])
              elif kind == 'keydown': await pg.keyboard.down(st[1]); log('keydown', st[1])
              elif kind == 'keyup': await pg.keyboard.up(st[1]); log('keyup', st[1])
              elif kind == 'tap': await pg.touchscreen.tap(st[1], st[2]); log('tap', st[1], st[2])
              elif kind == 'tdrag':
                  if not hasattr(pg, '_cdp'): pg._cdp = await ctx.new_cdp_session(pg)
                  x0, y0, x1, y1, ms, hold = st[1:7]; n = max(2, int(ms / 16))
                  await pg._cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0, 'id': 1}]})
                  for i in range(1, n + 1):
                      await pg._cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / n, 'y': y0 + (y1 - y0) * i / n, 'id': 1}]}); await pg.wait_for_timeout(16)
                  t1 = time.time()
                  while time.time() - t1 < hold / 1000.0:
                      await pg._cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x1 + 0.5 * ((int((time.time() - t1) * 10)) % 2), 'y': y1, 'id': 1}]}); await pg.wait_for_timeout(100)
                  await pg._cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); log('tdrag', st[1:7])
              elif kind == 'cpu':
                  if not hasattr(pg, '_cdp'): pg._cdp = await ctx.new_cdp_session(pg)
                  await pg._cdp.send('Emulation.setCPUThrottlingRate', {'rate': st[1]}); log('cpu', st[1])
        except Exception as ex:
            print('EXC', str(ex)[:600], flush=True)
        print('errors:', len(errs), [e[:600] for e in errs[:6]], flush=True); await b.close()
asyncio.run(main())
