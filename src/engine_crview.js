/* ===== [engine_crview.js] CRView: the viewer ===== */
/* ---------- the viewer ---------- */
function CRView(host, o) {
  o = o || {}; var cut = o.mode === 'cut', panel = o.mode === 'panel', canvas = host.querySelector('canvas'), self = this, renderer = makeRenderer(canvas, 0xffffff), scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(cut ? 30 : 34, 16 / 9, 0.03, 40);
  var home = { az: -31, el: 13, dist: 2.25, t: [0, 0.57, -0.06] }, target = new THREE.Vector3(), v = { az: 0, el: 0, dist: 1 }, visible = false, dirty = true, running = false;
  var stage = 0, tw = 1, twDur = 1.3, lastT = 0, xray = false, xr = 0, frozen = false, gov = new Governor(renderer, scene), reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sun = addLights(scene, renderer, { ground: 0xffffff }), member = null, micro = null, microOn = false, scn = o.scenario || 'steel', M = {}, sway = o.sway ? { t0: 0, on: true } : null, narrow = false;
  function narrowed(c) { if (!narrow || !cut) return c; var sh = (M3D(scn) && M3D(scn).shift) || 0; return { az: c.az, el: c.el, dist: c.dist * 0.92, t: [c.t[0] - sh * 0.9, c.t[1], c.t[2]] }; } // a narrow stage has no room for callouts beside the picture: the specimen moves to the middle
  function camHome() { return narrowed(member.cam); }
  /* a stage may bring its own view (a machine on the sample needs a wider frame): the camera glides there when the stage is chosen and back home afterwards */
  var camCur = null, camTw = null;
  function camFor(id) { var c = !microOn && member && member.stageCam ? member.stageCam(id) : null; return c ? narrowed(c) : home; }
  function goTo(c, instant) { if (instant || !visible || reduced) { v.az = c.az; v.el = c.el; v.dist = c.dist; target.set(c.t[0], c.t[1], c.t[2]); camTw = null; dirty = true; return; } camTw = { a: { az: v.az, el: v.el, dist: v.dist, t: target.clone() }, b: c, s: 0 }; dirty = true; }
  function build(id) {
    if (member) { scene.remove(member.group); member.dispose(); member = null; }
    member = panel ? new WPPanel(M, o.panel) : new WPMember(id, cut, M); scene.add(member.group); sun.userData.groundAt(member.ground); scn = id;
    if (!microOn) { home = camHome(); self.reset(); }
    self.dbg = { scene: scene, member: member, renderer: renderer, cam: cam };
  }
  function showMicro(on) {
    var Micro = (typeof WPMicro !== 'undefined' && !(M3D(scn) && M3D(scn).noMicro)) ? WPMicro : null; if (on && !Micro) return;
    if (on && (!micro || micro.scn !== scn)) { if (micro) { scene.remove(micro.group); micro.dispose(); } micro = new Micro(scn); scene.add(micro.group); }
    microOn = on; if (micro) micro.group.visible = on; member.group.visible = !on; sun.userData.groundAt(on ? 0 : member.ground); home = on ? micro.home : camHome(); self.reset(); tw = 1; dirty = true;
  }
  this.setScenario = function (id) { if (!M3D(id) || panel) return; if (member && scn === id) return; try { build(id); } catch (e) { if (window.console) console.error('guide 3D', id, e); if (!member) build(WP_ORDER[0]); } if (microOn) showMicro(true); dirty = true; if (!visible) still(); };
  this.rebuild = function () { if (panel || !member) return; var m = microOn, s = stage; if (micro) { scene.remove(micro.group); micro.dispose(); micro = null; } microOn = false; try { build(scn); } catch (e) { if (window.console) console.error('guide 3D rebuild', e); return; } if (m) showMicro(true); stage = Math.min(s, STG(scn).length - 1); tw = 1; dirty = true; if (!visible) still(); };
  this.setMicro = function (on) { if (!!on === microOn) return; showMicro(!!on); if (!visible) still(); };
  this.micro = function () { return microOn; }; this.microCam = function (k) { return microOn && micro && micro.cams ? micro.cams[k] || null : null; }; this.viewNow = function () { return { az: v.az, el: v.el, dist: v.dist, t: [target.x, target.y, target.z] }; };
  this.setNarrow = function (b) { if (!!b === narrow) return; narrow = !!b; if (!microOn) { home = camHome(); self.reset(); } };
  function stageId() { var st = STG(scn); return st[Math.max(0, Math.min(st.length - 1, stage))]; }
  function state() { if (microOn && micro) { micro.set(stageId(), tw, xr); return; } member.set(stageId(), tw, xr); }
  this.setStage = function (i, still2) { // a stage with its own duration (the preparation) plays whenever it is chosen; the others tween forwards only
    var st = STG(scn), n = st.length; i = Math.max(0, Math.min(n - 1, i)); frozen = false; var id = st[i], anim = !microOn && member && member.dur && member.dur[id] > 1.31 ? member.dur[id] : 0;
    tw = (still2 || reduced || (i <= stage && !anim)) ? 1 : 0; if (microOn && micro && !still2 && !reduced) tw = 0; stage = i; twDur = microOn && micro ? (micro.dur[id] || 2.4) : (anim || 1.3); lastT = 0; dirty = true;
    var c = camFor(id); if (c !== (camCur || home)) { goTo(c, !!still2); camCur = c; } if (!visible) still(); };
  this.duration = function () { return twDur; };
  this.stage = function () { return stage; };
  this.settle = function () { tw = 1; dirty = true; };
  this.freeze = function (x) { tw = x; frozen = true; dirty = true; };
  this.progress = function () { return tw; };
  this.setXray = function (b) { xray = !!b; dirty = true; };
  this.zoom = function (f) { v.dist = Math.max(0.25, Math.min(6, v.dist * f)); dirty = true; if (sway) sway.on = false; };
  this.view = function (q) { v.az = q.az; v.el = q.el; v.dist = q.dist; if (q.x != null) target.set(q.x, q.y, q.z == null ? home.t[2] : q.z); dirty = true; if (!visible) still(); };
  this.reset = function () { var c = member ? camFor(stageId()) : home; camCur = c === home ? null : c; v.az = c.az; v.el = c.el; v.dist = c.dist; target.set(c.t[0], c.t[1], c.t[2]); camTw = null; dirty = true; if (sway) { sway.on = true; sway.t0 = 0; } };
  this.anchors = function () { // callout anchors of the current stage, projected into CSS pixels of the host
    if (microOn) return []; var L = member.anchors(stageId(), tw), w = host.clientWidth, h = host.clientHeight, out = [], p = new THREE.Vector3();
    L.forEach(function (a) { p.set(a.p[0], a.p[1], a.p[2]).applyMatrix4(member.group.matrixWorld).project(cam); if (p.z > 1) return; out.push({ k: a.k, x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, in: Math.abs(p.x) < 1 && Math.abs(p.y) < 1 }); });
    return out;
  };
  this.onRender = null;
  this.fps = null; this.lockCam = false; this.host = host; this.sun = sun; this.stageId = stageId; this.dur = function (id) { return member && member.dur && member.dur[id] > 1.31 ? member.dur[id] : 0; };
  this.anchorsWorld = function () { if (microOn || !member) return []; var L = member.anchors(stageId(), tw), out = []; L.forEach(function (a) { var p = new THREE.Vector3(a.p[0], a.p[1], a.p[2]).applyMatrix4(member.group.matrixWorld); out.push({ k: a.k, p: p }); }); return out; };
  this.wake = function () { dirty = true; };
  this.setTheme = function (t) { var dark = t === 'dark', g = sun.userData.ground, s = sun.userData.shadow; renderer.setClearColor(dark ? 0x111111 : 0xffffff, 1); if (g) g.material.color.set(dark ? 0x1c1c1c : 0xffffff); if (s) s.material.opacity = dark ? 0.5 : 0.11; if (dark) { scene.fog = new THREE.Fog(0x111111, 4, 14); scene.fog.color.setRGB(17 / 255, 17 / 255, 17 / 255); } else scene.fog = null; dirty = true; if (!visible) still(); };
  this.scenario = function () { return scn; };
  /* a still of one stage, rendered at W×H into the same canvas and read back at once; the live picture is restored in the same task */
  this.snapshot = function (i, W, H, q) {
    var pr = renderer.getPixelRatio(), sSt = stage, sTw = tw, sXr = xr, sAz = v.az, sEl = v.el, sD = v.dist, sT = target.clone(), sAsp = cam.aspect, sh = renderer.shadowMap.enabled, out = null;
    try {
      renderer.setPixelRatio(1); renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); stage = i; tw = q && q.tw != null ? q.tw : 1; xr = q && q.xr != null ? q.xr : 0; if (q) { if (q.az != null) { v.az = q.az; v.el = q.el; v.dist = q.dist; } if (q.t) target.set(q.t[0], q.t[1], q.t[2]); } if (!q || q.az == null) { var sc2 = camFor(stageId()); if (sc2 !== home) { v.az = sc2.az; v.el = sc2.el; v.dist = sc2.dist; target.set(sc2.t[0], sc2.t[1], sc2.t[2]); } }
      state(); orbitPos(cam, target, v.az, v.el, v.dist * (q && q.fit === 'h' ? 1 : Math.max(1, 1.7 / cam.aspect))); renderer.render(scene, cam);
      var an = [], p = new THREE.Vector3(); if (!microOn) member.anchors(stageId(), tw).forEach(function (a) { p.set(a.p[0], a.p[1], a.p[2]).applyMatrix4(member.group.matrixWorld).project(cam); an.push({ k: a.k, x: (p.x + 1) / 2, y: (1 - p.y) / 2 }); });
      out = { url: canvas.toDataURL('image/jpeg', 0.88), anchors: an };
    } catch (e) { out = null; if (window.console) console.warn('snapshot', e); }
    stage = sSt; tw = sTw; xr = sXr; v.az = sAz; v.el = sEl; v.dist = sD; target.copy(sT); cam.aspect = sAsp; renderer.setPixelRatio(pr); renderer.shadowMap.enabled = sh; dirty = true; still(); return out;
  };
  build(scn);
  var drag = null, PTS = {}, pinch = null; /* one finger or the mouse turns the sample (Shift: moves it); two fingers pinch to zoom and move it together */
  function pinchState() { var ks = Object.keys(PTS); if (ks.length < 2) return null; var a = PTS[ks[0]], b = PTS[ks[1]]; return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
  canvas.addEventListener('pointerdown', function (e) { if (self.lockCam) return; PTS[e.pointerId] = { x: e.clientX, y: e.clientY }; if (Object.keys(PTS).length >= 2) { pinch = pinchState(); drag = null; } else drag = { x: e.clientX, y: e.clientY, pan: e.shiftKey }; if (sway) sway.on = false; camTw = null; try { canvas.setPointerCapture(e.pointerId); } catch (er) {} });
  canvas.addEventListener('pointermove', function (e) {
    if (PTS[e.pointerId]) { PTS[e.pointerId].x = e.clientX; PTS[e.pointerId].y = e.clientY; }
    if (pinch) { var ps = pinchState(); if (!ps) return; if (pinch.d > 8 && ps.d > 8) { var k = pinch.d / ps.d; if (Math.abs(k - 1) > 0.002) self.zoom(Math.max(0.8, Math.min(1.25, k))); } var mdx = ps.mx - pinch.mx, mdy = ps.my - pinch.my; target.x -= mdx * 0.002 * Math.cos(v.az * Math.PI / 180); target.z += mdx * 0.002 * Math.sin(v.az * Math.PI / 180); target.y += mdy * 0.002; target.x = Math.max(-0.8, Math.min(0.8, target.x)); target.z = Math.max(-0.8, Math.min(0.8, target.z)); target.y = Math.max(-0.3, Math.min(1.4, target.y)); pinch = ps; dirty = true; return; }
    if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    if (drag.pan) { target.x -= dx * 0.002 * Math.cos(v.az * Math.PI / 180); target.z += dx * 0.002 * Math.sin(v.az * Math.PI / 180); target.y += dy * 0.002; target.x = Math.max(-0.8, Math.min(0.8, target.x)); target.z = Math.max(-0.8, Math.min(0.8, target.z)); target.y = Math.max(-0.3, Math.min(1.4, target.y)); }
    else { v.az -= dx * 0.35; v.el = Math.max(-8, Math.min(80, v.el + dy * 0.3)); } dirty = true;
  });
  ['pointerup', 'pointercancel'].forEach(function (n) { canvas.addEventListener(n, function (e) { delete PTS[e.pointerId]; if (Object.keys(PTS).length < 2) pinch = null; drag = null; }); });
  canvas.addEventListener('wheel', function (e) { if (self.lockCam) return; if (!e.ctrlKey && !drag) return; e.preventDefault(); self.zoom(e.deltaY > 0 ? 1.08 : 0.92); }, { passive: false });
  function place(now) { if (self.fps) { self.fps(cam, now || performance.now()); return; } var az = v.az; if (sway && sway.on && !reduced) { if (!sway.t0) sway.t0 = now || performance.now(); var s = ((now || performance.now()) - sway.t0) / 1000; az += 9 * Math.sin(s * 0.5); if (s > 40) sway.on = false; else dirty = true; } orbitPos(cam, target, az, v.el, v.dist * Math.max(1, 1.7 / cam.aspect)); }
  function step(now) {
    gov.sync(); var dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0; lastT = now; if (tw < 1 && !frozen) { tw = Math.min(1, tw + dt / twDur); dirty = true; }
    var goal = xray && !microOn ? 1 : 0; if (Math.abs(goal - xr) > 0.004) { xr += (goal - xr) * 0.16; dirty = true; } else if (xr !== goal) { xr = goal; dirty = true; }
    if (camTw) { camTw.s = Math.min(1, camTw.s + dt / 0.9); var e = camTw.s * camTw.s * (3 - 2 * camTw.s), A = camTw.a, B = camTw.b; v.az = A.az + (B.az - A.az) * e; v.el = A.el + (B.el - A.el) * e; v.dist = A.dist + (B.dist - A.dist) * e; target.set(A.t.x + (B.t[0] - A.t.x) * e, A.t.y + (B.t[1] - A.t.y) * e, A.t.z + (B.t[2] - A.t.z) * e); dirty = true; if (camTw.s >= 1) camTw = null; }
    if (sway && sway.on) dirty = true; if (self.fps) dirty = true;
    if (dirty && fitRenderer(renderer, cam, host)) { var t0 = performance.now(); state(); place(now); renderer.render(scene, cam); dirty = false; gov.tick(performance.now() - t0 + 8); if (self.onRender) self.onRender(); }
  }
  var dead = false;
  function frame(now) { if (!visible || dead) { running = false; return; } requestAnimationFrame(frame); try { step(now); } catch (e) {} }
  /* the view given up: its WebGL context released (a phone keeps few), its member freed, its canvas replaced by a fresh one so a new view can take the host; the module builds the view again when its guide comes back */
  this.release = function () { if (dead) return; dead = true; visible = false; running = false; try { if (member) { scene.remove(member.group); member.dispose(); member = null; } if (micro) { scene.remove(micro.group); micro.dispose(); micro = null; } } catch (e) {} try { renderer.dispose(); renderer.forceContextLoss(); } catch (e2) {} var i = CRView.all.indexOf(self); if (i >= 0) CRView.all.splice(i, 1); try { var c = host.querySelector('canvas'); if (c && c.parentNode) { var n = c.cloneNode(false); c.parentNode.replaceChild(n, c); } } catch (e3) {} };
  function still() { try { if (fitRenderer(renderer, cam, host)) { state(); place(); renderer.render(scene, cam); if (self.onRender) self.onRender(); } } catch (e) {} }
  this.still = still;
  requestAnimationFrame(still);
  new IntersectionObserver(function (en) { if (dead) return; var was = visible; visible = en[0].isIntersecting; if (visible && !was) { dirty = true; if (sway) { sway.on = true; sway.t0 = 0; } } if (visible && !running) { running = true; requestAnimationFrame(frame); } }, { threshold: 0.1 }).observe(host);
  CRView.all.push(self); if (CRView.theme === 'dark') self.setTheme('dark');
  window.addEventListener('resize', function () { dirty = true; });
}
CRView.all = []; CRView.theme = 'light';
CRView.setTheme = function (t) { CRView.theme = t === 'dark' ? 'dark' : 'light'; CRView.all.forEach(function (v) { try { v.setTheme(CRView.theme); } catch (e) {} }); };

