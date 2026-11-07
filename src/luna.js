/* ===== [luna.js] ===== */
/* ===== LUNA — the characters of the island, modelled in code =====
   ルナちゃん (ケミカルナ), the original character of AUTO CHEMICAL INDUSTRY CO., LTD., built to the proportions of the brand's own key
   art: about 4.2 heads tall, the white helmet with the dark band, the dark ear cups and the orange A, orange twin tails falling in waves to
   the hips with a teal layer underneath, large amber eyes, the dark turtleneck, the orange suit with the dark chevron on the chest, the open
   white lab coat to the hips, and the long dark boots that flare towards the ground under the pointed edges of the suit. Cel-shaded in
   three soft tones with a thin ink line and a rim light, textures drawn on canvases for the crisp edges of the drawing (the chevron, the
   suit's points, the face, the hair's highlight), and a rig for walking, running, waving, the sky-dive, riding, driving, sitting, the
   attack, the dodge and the joys of the board game. The same builder dresses the people of the island: site masters, station staff, the
   diner's master, the shrine keeper. Units: the island's units; Luna stands 1.32 tall, facing +z. */
var LUNA = (function () {
  var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
  function curvedAll(o) { if (typeof KIT !== 'undefined') o.traverse(function (x) { if (x.material) [].concat(x.material).forEach(KIT.curved); }); }
  /* ---------- shading: three soft tones, a rim light and an ink line ---------- */
  var GRAD = null;
  function grad() { if (GRAD) return GRAD; var d = new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]); GRAD = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true; return GRAD; }
  function rimHook(m, k) { if (typeof KIT === 'undefined') return m; return KIT.rim(m, 0xfff4e6, 2.6, k == null ? 0.28 : k); }
  function toon(hex, o) { o = o || {}; var m = new THREE.MeshToonMaterial({ color: hex, gradientMap: grad() }); if (o.map) m.map = o.map; if (o.side) m.side = o.side; if (o.vc) m.vertexColors = true; if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei || 1; } if (o.transparent) { m.transparent = true; m.alphaTest = o.alphaTest || 0; } if (o.po) { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; } if (o.rim !== false) rimHook(m, o.rim); if (o.ll !== false && typeof KIT !== 'undefined' && KIT.llights) KIT.llights(m); return m; }
  var INK = {};
  function ink(w) { var m = new THREE.MeshBasicMaterial({ color: 0x2b2420, side: THREE.BackSide }); m.userData.w = w || 0.005;
    m.onBeforeCompile = function (s) { s.uniforms.uInk = { value: m.userData.w }; s.vertexShader = 'uniform float uInk;\n' + s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = vec3( position ) + normalize( normal ) * uInk;'); };
    m.customProgramCacheKey = function () { return 'ink' + m.userData.w; }; return m; }
  function inkOf(w) { var k = String(w || 0.005); return INK[k] || (INK[k] = ink(w)); }
  function mesh(geo, mat, o) { o = o || {}; var g = new THREE.Group(), m = new THREE.Mesh(geo, mat); m.castShadow = o.shadow !== false; m.receiveShadow = !!o.receive; g.add(m); if (o.ink !== false) { var h = new THREE.Mesh(geo, inkOf(o.ink)); h.renderOrder = -1; h.userData.ink = true; h.castShadow = false; g.add(h); } g.userData.main = m; return g; }

  /* ---------- geometry helpers ---------- */
  function taper(curve, seg, rad, rFn, o) { /* a tube along a curve with its radius profile r(t), flattening, a reference "up" and colours or uv */
    o = o || {}; var fr = curve.computeFrenetFrames(seg, false), pos = [], nor = [], col = [], uvs = [], idx = [], i, j, P = new THREE.Vector3(), N = new THREE.Vector3(), c = new THREE.Color();
    var up = o.up || null, T = new THREE.Vector3(), nn = new THREE.Vector3(), bb = new THREE.Vector3();
    for (i = 0; i <= seg; i++) { var t = i / seg; curve.getPointAt(t, P); var r = rFn(t), n = fr.normals[i], b = fr.binormals[i];
      if (up) { curve.getTangentAt(t, T); bb.copy(T).cross(typeof up === 'function' ? up(t, P) : up).normalize(); nn.copy(bb).cross(T).normalize(); n = nn; b = bb; }
      if (o.tOut) for (j = 0; j <= rad; j++) o.tOut.push(t); for (j = 0; j <= rad; j++) { var a = j / rad * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a) * (o.flat || 1); N.set(ca * n.x + sa * b.x, ca * n.y + sa * b.y, ca * n.z + sa * b.z); pos.push(P.x + N.x * r, P.y + N.y * r, P.z + N.z * r); N.normalize(); nor.push(N.x, N.y, N.z); if (o.color) { o.color(t, a, c, N); col.push(c.r, c.g, c.b); } uvs.push(j / rad, t); } }
    for (i = 0; i < seg; i++) for (j = 0; j < rad; j++) { var a1 = i * (rad + 1) + j, b1 = (i + 1) * (rad + 1) + j; idx.push(a1, a1 + 1, b1, b1, a1 + 1, b1 + 1); }
    if (o.tOut) o.tOut.push(1, 0); var tip = pos.length / 3; curve.getPointAt(1, P); pos.push(P.x, P.y, P.z); var tg = curve.getTangentAt(1); nor.push(tg.x, tg.y, tg.z); uvs.push(0.5, 1); if (o.color) { o.color(1, 0, c, tg); col.push(c.r, c.g, c.b); } for (j = 0; j < rad; j++) idx.push(seg * (rad + 1) + j, seg * (rad + 1) + j + 1, tip);
    var root0 = pos.length / 3; curve.getPointAt(0, P); pos.push(P.x, P.y, P.z); var tg0 = curve.getTangentAt(0); nor.push(-tg0.x, -tg0.y, -tg0.z); uvs.push(0.5, 0); if (o.color) { o.color(0, 0, c, tg0); col.push(c.r, c.g, c.b); } for (j = 0; j < rad; j++) idx.push(j + 1, j, root0);
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); if (o.color) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); return g; }
  function lathe(pts, seg, o) { /* a lathe whose faces always point outwards: a profile given top-down is reversed (v still runs from the first point) */ o = o || {}; var down = pts.length > 1 && pts[0][1] > pts[pts.length - 1][1], q = down ? pts.slice().reverse() : pts;
    var g = new THREE.LatheGeometry(q.map(function (p) { return new THREE.Vector2(Math.max(0.00001, p[0]), p[1]); }), seg || 32, o.start == null ? 0 : o.start, o.len || Math.PI * 2); if (down) { var uv = g.attributes.uv; for (var i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); } g.computeVertexNormals(); return g; }
  function smoothProfile(pts, n) { var cv = new THREE.SplineCurve(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); })), out = [], i; for (i = 0; i <= n; i++) { var q = cv.getPoint(i / n); out.push([q.x, q.y]); } return out; }
  function rbox(w, h, d, r, s) { var g = new THREE.BoxGeometry(w, h, d, s || 4, s || 4, s || 4), p = g.attributes.position, v = new THREE.Vector3(), q = new THREE.Vector3(), i, hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
    for (i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); q.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z))); v.sub(q); if (v.lengthSq() > 1e-9) v.setLength(r); v.add(q); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }
  function blob(rx, ry, rz, s) { var g = new THREE.SphereGeometry(1, s || 24, Math.round((s || 24) * 0.75)); g.scale(rx, ry, rz); return g; }
  function merge(list) { /* [geometry, matrix, colour hex] → one geometry with vertex colours */ var P = [], N = [], C = [], c = new THREE.Color(), nm = new THREE.Matrix3();
    list.forEach(function (it) { var g = it[0].index ? it[0].toNonIndexed() : it[0], m = it[1] || new THREE.Matrix4(); nm.getNormalMatrix(m); c.set(it[2] == null ? 0xffffff : it[2]); var pa = g.attributes.position, na = g.attributes.normal, v = new THREE.Vector3(), n = new THREE.Vector3(), i; for (i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(m); n.fromBufferAttribute(na, i).applyMatrix3(nm).normalize(); P.push(v.x, v.y, v.z); N.push(n.x, n.y, n.z); C.push(c.r, c.g, c.b); } });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; }
  function M4(p, r, s) { var m = new THREE.Matrix4(); m.compose(V(p[0], p[1], p[2]), new THREE.Quaternion().setFromEuler(new THREE.Euler(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0)), typeof s === 'number' ? V(s, s, s) : s ? V(s[0], s[1], s[2]) : V(1, 1, 1)); return m; }
  function ctex(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
  function hex(c) { return '#' + ('000000' + c.toString(16)).slice(-6); }

  /* ---------- the face: drawn in the head's own units on a canvas, projected straight onto the front of the head ----------
     The canvas covers x −0.12…0.12, y −0.16…0.08 of the head (before its scale); the face is a decal on the head's own surface,
     so the drawing is undistorted from the front and turns with the head's curvature from the side. */
  var FX0 = -0.12, FW = 0.24, FY1 = 0.08, FH = 0.24, FN = 1024;
  function faceCanvas(kind, o) {
    o = o || {}; var N = o.fn || FN, c = document.createElement('canvas'); c.width = N; c.height = N; var g = c.getContext('2d'), S = N / FW;
    function X(x) { return (x - FX0) * S; } function Y(y) { return (FY1 - y) * S; }
    if (o.draw) { o.draw(g, kind, X, Y, S); return c; } /* a face of its own (the Good Startup owner) */
    var ex = o.eyeX || 0.0435, ey = o.eyeY || -0.026, ew = (o.ew || 0.0255) * S, eh = (o.eh || 0.031) * S, iris = o.iris || ['#3b1806', '#9c4a0c', '#e8841a', '#ffc861'], lash = o.lash || '#2b160e', lw = (o.lashW || 0.0046) * S;
    function lid(gg, k) { /* the upper lid, from the inner corner over the top to the outer corner; k lowers it (0 open … 1 closed) */
      gg.moveTo(-ew * 0.98, eh * 0.06); gg.bezierCurveTo(-ew * 0.92, -eh * (0.92 - k * 0.9), ew * 0.4, -eh * (1.1 - k * 1.05), ew * 1.02, -eh * (0.36 - k * 0.4)); }
    function eye(cx, flip) {
      g.save(); g.translate(X(cx), Y(ey)); g.scale(flip, 1);
      if (kind === 'happy' || kind === 'closed') { /* closed: the lid line with its lashes; happy: an arch ∩ */ g.strokeStyle = lash; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = lw * 1.05; g.beginPath();
        if (kind === 'happy') { g.moveTo(-ew * 0.9, eh * 0.28); g.quadraticCurveTo(0, -eh * 0.62, ew * 0.95, eh * 0.22); g.stroke(); g.lineWidth = lw * 0.6; g.beginPath(); g.moveTo(ew * 0.9, eh * 0.18); g.lineTo(ew * 1.18, eh * 0.02); g.stroke(); }
        else { g.moveTo(-ew * 0.95, eh * 0.1); g.quadraticCurveTo(0, eh * 0.52, ew * 0.98, eh * 0.06); g.stroke(); g.lineWidth = lw * 0.55; [[0.6, 0.2], [0.9, 0.08], [1.12, -0.06]].forEach(function (q) { g.beginPath(); g.moveTo(ew * q[0], eh * q[1]); g.lineTo(ew * (q[0] + 0.16), eh * (q[1] + 0.2)); g.stroke(); }); }
        g.restore(); return; }
      if (kind === 'hurt') { g.strokeStyle = lash; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew * 0.7, -eh * 0.4); g.lineTo(ew * 0.55, 0); g.lineTo(-ew * 0.7, eh * 0.4); g.stroke(); g.restore(); return; }
      var k = kind === 'half' ? 0.55 : kind === 'shout' ? 0.12 : 0, big = kind === 'wide' ? 1.06 : 1;
      /* the white of the eye, clipped by the lids */
      g.beginPath(); lid(g, k); g.bezierCurveTo(ew * 1.06, eh * 0.42, ew * 0.55, eh * 0.96, -ew * 0.08, eh * 0.93); g.bezierCurveTo(-ew * 0.6, eh * 0.88, -ew * 1.0, eh * 0.5, -ew * 0.98, eh * 0.06); g.closePath();
      g.save(); g.clip(); g.fillStyle = '#fffaf6'; g.fillRect(-ew * 1.3, -eh * 1.3, ew * 2.6, eh * 2.6);
      /* the iris: large, a warm amber gradient, a darker rim, the pupil, a crescent of light below, the lids' shadow, the highlights */
      var ix = ew * 0.06, iy = eh * 0.14, rx = ew * 0.8 * big, ry = eh * 0.88 * big, gr = g.createLinearGradient(0, iy - ry, 0, iy + ry);
      gr.addColorStop(0, iris[0]); gr.addColorStop(0.32, iris[1]); gr.addColorStop(0.68, iris[2]); gr.addColorStop(1, iris[3]); g.fillStyle = gr; g.beginPath(); g.ellipse(ix, iy, rx, ry, 0, 0, Math.PI * 2); g.fill();
      var rg = g.createRadialGradient(ix, iy + ry * 0.45, ry * 0.05, ix, iy + ry * 0.45, ry * 0.75); rg.addColorStop(0, 'rgba(255,236,170,.55)'); rg.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = rg; g.beginPath(); g.ellipse(ix, iy, rx, ry, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(90,40,10,.55)'; g.lineWidth = rx * 0.05; for (var r0 = 0; r0 < 14; r0++) { var a0 = r0 / 14 * Math.PI * 2; g.beginPath(); g.moveTo(ix + Math.cos(a0) * rx * 0.42, iy + Math.sin(a0) * ry * 0.42); g.lineTo(ix + Math.cos(a0) * rx * 0.78, iy + Math.sin(a0) * ry * 0.78); g.stroke(); }
      g.fillStyle = 'rgba(32,12,2,.92)'; g.beginPath(); g.ellipse(ix + ew * 0.02, iy - eh * 0.02, rx * (kind === 'wide' ? 0.3 : 0.38), ry * (kind === 'wide' ? 0.34 : 0.42), 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(70,28,6,.85)'; g.lineWidth = rx * 0.07; g.beginPath(); g.ellipse(ix, iy, rx * 0.97, ry * 0.97, 0, 0, Math.PI * 2); g.stroke();
      var sh = g.createLinearGradient(0, -eh * 1.05, 0, -eh * 0.2); sh.addColorStop(0, 'rgba(70,24,10,.55)'); sh.addColorStop(1, 'rgba(70,24,10,0)'); g.fillStyle = sh; g.fillRect(-ew * 1.3, -eh * 1.3, ew * 2.6, eh * 1.2);
      g.fillStyle = 'rgba(255,255,255,.97)'; g.beginPath(); g.ellipse(ix - rx * 0.36, iy - ry * 0.4, rx * 0.3, ry * 0.24, -0.45, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(ix + rx * 0.42, iy + ry * 0.42, rx * 0.13, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.7; g.beginPath(); g.arc(ix - rx * 0.05, iy + ry * 0.6, rx * 0.07, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      g.restore();
      /* the upper lash: thin at the inner corner, thick over the top, a wing and two lashes at the outer corner */
      g.fillStyle = lash; g.beginPath(); lid(g, k); g.lineTo(ew * 1.32, -eh * (0.5 - k * 0.4)); g.lineTo(ew * 1.2, -eh * (0.26 - k * 0.38)); g.lineTo(ew * 1.06, -eh * (0.12 - k * 0.38));
      g.bezierCurveTo(ew * 0.45, -eh * (0.98 - k * 1.05) + lw * 1.15, -ew * 0.88, -eh * (0.86 - k * 0.9) + lw * 0.95, -ew * 0.98, eh * 0.06); g.fill();
      g.strokeStyle = lash; g.lineCap = 'round'; g.lineWidth = lw * 0.42; [[0.82, -0.58, 1.08, -0.82], [0.98, -0.42, 1.3, -0.6]].forEach(function (q) { g.beginPath(); g.moveTo(ew * q[0], eh * (q[1] + k * 0.45)); g.quadraticCurveTo(ew * (q[0] + 0.18), eh * (q[1] - 0.12 + k * 0.45), ew * q[2], eh * (q[3] + k * 0.45)); g.stroke(); });
      /* the crease above, the lower lash at the outer corner */
      g.strokeStyle = 'rgba(120,60,40,.45)'; g.lineWidth = lw * 0.28; g.beginPath(); g.moveTo(-ew * 0.35, -eh * 1.18); g.quadraticCurveTo(ew * 0.45, -eh * 1.3, ew * 0.98, -eh * 0.78); g.stroke();
      g.strokeStyle = 'rgba(80,40,26,.7)'; g.lineWidth = lw * 0.3; g.beginPath(); g.moveTo(ew * 0.98, eh * 0.4); g.quadraticCurveTo(ew * 0.6, eh * 1.02, ew * 0.02, eh * 0.97); g.stroke();
      g.restore(); }
    eye(-ex, -1); eye(ex, 1);
    /* the brows: fine arcs, lifted when wide, knit when shouting */ if (o.brows !== false) { g.strokeStyle = o.brow || '#c0641c'; g.lineCap = 'round'; g.lineWidth = 0.0019 * S; [-1, 1].forEach(function (sd) { var by = ey + (o.eh || 0.031) + 0.017 + (kind === 'wide' ? 0.006 : 0), yi = by + (kind === 'shout' ? -0.005 : kind === 'hurt' ? 0.004 : 0); g.beginPath(); g.moveTo(X(sd * (ex - 0.016)), Y(yi)); g.quadraticCurveTo(X(sd * (ex + 0.004)), Y(by + 0.006), X(sd * (ex + 0.026)), Y(by - 0.004)); g.stroke(); }); }
    /* the cheeks */ [-1, 1].forEach(function (sd) { var bx = X(sd * (ex + 0.008)), by = Y(ey - 0.036), bl = g.createRadialGradient(bx, by, 0, bx, by, 0.017 * S); bl.addColorStop(0, 'rgba(255,128,118,.42)'); bl.addColorStop(1, 'rgba(255,128,118,0)'); g.save(); g.translate(bx, by); g.scale(1.45, 0.62); g.translate(-bx, -by); g.fillStyle = bl; g.beginPath(); g.arc(bx, by, 0.017 * S, 0, Math.PI * 2); g.fill(); g.restore();
      if (o.blushLines !== false) { g.strokeStyle = 'rgba(232,110,100,.5)'; g.lineWidth = 0.0009 * S; for (var q = -1; q <= 1; q++) { g.beginPath(); g.moveTo(bx + q * 0.0048 * S - 0.002 * S, by + 0.0028 * S); g.lineTo(bx + q * 0.0048 * S + 0.0016 * S, by - 0.0028 * S); g.stroke(); } } });
    /* the nose: a touch of shadow; the mouth */ g.strokeStyle = 'rgba(196,118,96,.7)'; g.lineWidth = 0.0012 * S; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(0.0015), Y(-0.058)); g.lineTo(X(-0.001), Y(-0.0625)); g.stroke();
    var my = -0.0795, mc = '#8f3426'; g.strokeStyle = mc; g.lineWidth = 0.0016 * S;
    if (kind === 'happy' || kind === 'wide' || kind === 'shout' || o.mouth === 'open') { var mw = kind === 'shout' ? 0.011 : 0.0095, md = kind === 'shout' ? 0.016 : kind === 'wide' ? 0.008 : 0.0105; g.fillStyle = '#7e2a1e'; g.beginPath(); g.moveTo(X(-mw), Y(my + 0.001)); g.quadraticCurveTo(X(0), Y(my - md * 1.6), X(mw), Y(my + 0.001)); g.quadraticCurveTo(X(0), Y(my + 0.002), X(-mw), Y(my + 0.001)); g.fill(); g.fillStyle = '#ef8a86'; g.beginPath(); g.ellipse(X(0), Y(my - md * 0.95), mw * 0.48 * S, md * 0.38 * S, 0, 0, Math.PI * 2); g.fill(); if (kind !== 'wide') { g.fillStyle = '#ffffff'; g.fillRect(X(-mw * 0.62), Y(my + 0.0008), mw * 1.24 * S, 0.0016 * S); } }
    else if (kind === 'hurt') { g.beginPath(); g.moveTo(X(-0.008), Y(my - 0.002)); g.quadraticCurveTo(X(-0.004), Y(my + 0.003), X(0), Y(my - 0.001)); g.quadraticCurveTo(X(0.004), Y(my - 0.005), X(0.008), Y(my)); g.stroke(); }
    else { g.beginPath(); g.moveTo(X(-0.0065), Y(my + 0.0012)); g.quadraticCurveTo(X(0), Y(my - 0.0042), X(0.0065), Y(my + 0.0012)); g.stroke(); }
    return c; }
  var FACE_CACHE = {};
  function faceTex(kind, key, o) { var k = key + kind; if (FACE_CACHE[k]) return FACE_CACHE[k]; var t = new THREE.CanvasTexture(faceCanvas(kind, o)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return (FACE_CACHE[k] = t); }
  /* the face decal: the front triangles of the head's own geometry, with the canvas projected along z */
  function faceDecal(geo) { var pa = geo.attributes.position, n = pa.count, uv = new Float32Array(n * 2), i, idx = geo.index.array, keep = [];
    for (i = 0; i < n; i++) { uv[i * 2] = (pa.getX(i) - FX0) / FW; uv[i * 2 + 1] = 1 - (FY1 - pa.getY(i)) / FH; }
    for (i = 0; i < idx.length; i += 3) { var a = idx[i], b = idx[i + 1], c = idx[i + 2], ok = true; [a, b, c].forEach(function (k) { var x = pa.getX(k), y = pa.getY(k), z = pa.getZ(k); if (z < 0.02 || x < FX0 || x > FX0 + FW || y < FY1 - FH || y > FY1) ok = false; }); if (ok) keep.push(a, b, c); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', pa); g.setAttribute('normal', geo.attributes.normal); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(keep); return g; }
  function faceMat(map) { var m = new THREE.MeshToonMaterial({ map: map, gradientMap: grad(), transparent: true, alphaTest: 0.04, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }); m.emissive = new THREE.Color(0xffffff); m.emissiveMap = map; m.emissiveIntensity = 0.22; return m; }

  /* ---------- the emblem: the orange A of the brand, as a solid ---------- */
  function emblemGeo(s, depth) {
    var A = new THREE.Shape(); A.moveTo(-0.5, 0); A.lineTo(-0.08, 1.0); A.lineTo(0.08, 1.0); A.lineTo(0.5, 0); A.lineTo(0.3, 0); A.lineTo(0, 0.72); A.lineTo(-0.3, 0); A.lineTo(-0.5, 0);
    var bar = new THREE.Shape(); bar.moveTo(-0.3, 0.02); bar.lineTo(-0.14, 0.02); bar.lineTo(0.22, 0.5); bar.lineTo(0.1, 0.6); bar.lineTo(-0.3, 0.02);
    var g = new THREE.ExtrudeGeometry([A, bar], { depth: depth || 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2 }); g.translate(0, -0.5, 0); g.scale(s, s, s); g.computeVertexNormals(); return g; }

  /* ================= the palettes ================= */
  var PAL = {
    luna: { skin: 0xf9d6c2, suit: 0xf39434, dark: 0x4e4848, boot: 0x5e5552, coat: 0xfbfaf6, helmet: 0xffffff, band: 0x4d4949, cup: 0x55504f, hair: 0xf28a2c, hairHi: 0xffbd6a, streak: 0x19a7b5, emblem: 0xef7a1d },
    worker: { skin: 0xf3d2bc, suit: 0x2b3550, dark: 0x1f2533, boot: 0x2a2a2e, coat: 0x2b3550, helmet: 0xffffff, band: 0xf07a12, cup: 0x2b3550, hair: 0x2c241f, hairHi: 0x4a3a30, streak: 0x2c241f, emblem: 0xf07a12, pants: 0x3a3f4a }
  };

  /* the head of the drawings: a round crown, the cheeks full, the jaw drawing in to a short soft chin, the face front a touch flatter */
  function animeSkull(R, su, sv) { var g = new THREE.SphereGeometry(1, su || 72, sv || 54), p = g.attributes.position, v = new THREE.Vector3(), i;
    for (i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); var x = v.x, y = v.y, z = v.z, fr = Math.max(0, z);
      if (y < 0.08) { var k = Math.min(1, (0.08 - y) / 1.08); x *= 1 - 0.42 * Math.pow(k, 1.45) * (0.5 + 0.5 * fr); if (z > 0) z = z * (1 - 0.06 * k) + 0.06 * k * k * fr; else z *= 1 - 0.24 * Math.pow(k, 1.2); y = y * (1 - 0.08 * k) - 0.035 * k * k * k * fr; }
      if (y < 0.02 && y > -0.8 && z > 0.2) x *= 1 + Math.sin(Math.min(1, -y / 0.8) * Math.PI) * 0.04 * Math.min(1, (z - 0.2) / 0.5);
      if (z > 0.6 && y < 0.35) z = 0.6 + (z - 0.6) * 0.8;
      p.setXYZ(i, x * R, y * R * 1.02, z * R * 0.985); }
    g.computeVertexNormals(); return g; }

  /* ================= Luna =================
     (v46) rebuilt to the brand's key art — the reel of auto_chemical, the original character ルナちゃん (ケミカルナ): the white helmet with
     the dark band low over the brows and the large dark ear cups, the orange A, the swept fringe with its tuft, the very large amber eyes,
     the dark turtleneck, the orange suit with the broad dark chevron, the open white lab coat with its pointed lapels, the suit's points
     running down the thighs, and the long dark boots that flare wide to the ground. The twin tails are bundles of strands — orange clumps over
     a teal inner strand — each on its own chain of bones, simulated with the air's drag as she walks and runs. The model's detail follows
     the quality level (LQ 0…3): the segments of every lathe, tube and sphere, the number of strands and bones, the face's resolution. */
  var LQ = 2, QS = [0.6, 0.8, 1, 1.6], QN = [2, 3, 4, 6], QB = [6, 7, 9, 12];
  function sg(n, mn) { return Math.max(mn || 6, Math.round(n * QS[LQ])); }
  function setQuality(q) { LQ = Math.max(0, Math.min(3, q | 0)); }
  function buildLuna(opt) {
    var P = Object.assign({}, PAL.luna, opt.pal || {}), root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.userData.kind = 'luna';
    var M = { skin: toon(P.skin), suit: toon(P.suit), dark: toon(P.dark), boot: toon(P.boot), coat: toon(P.coat, { side: THREE.DoubleSide }), helmet: toon(P.helmet), band: toon(P.band), cup: toon(P.cup), emblem: toon(P.emblem), hand: toon(0xffffff, { vc: true }), rim: toon(0x8a8482) };
    var HIP = 0.488, TN = LQ >= 3 ? 512 : 256;
    /* ----- the legs: the thigh with the suit's point running down its front to the knee, the boot narrowing under the knee and flaring wide to the ground ----- */
    var thighTex = ctex(TN, TN, function (g, w, h) { g.fillStyle = hex(P.boot); g.fillRect(0, 0, w, h); g.fillStyle = hex(P.suit); g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * 0.34); g.lineTo(w * 0.68, h * 0.4); g.lineTo(w * 0.5, h * 0.9); g.lineTo(w * 0.32, h * 0.4); g.lineTo(0, h * 0.34); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(40,30,30,.9)'; g.lineWidth = w / 64; g.beginPath(); g.moveTo(0, h * 0.34); g.lineTo(w * 0.32, h * 0.4); g.lineTo(w * 0.5, h * 0.9); g.lineTo(w * 0.68, h * 0.4); g.lineTo(w, h * 0.34); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = w / 110; g.beginPath(); g.moveTo(w * 0.33, h * 0.405); g.lineTo(w * 0.5, h * 0.88); g.lineTo(w * 0.67, h * 0.405); g.stroke(); });
    thighTex.flipY = false; var thighMat = toon(0xffffff, { map: thighTex });
    var hips = new THREE.Group(); hips.position.y = HIP; body.add(hips);
    function leg(side) {
      var piv = new THREE.Group(); piv.position.set(0.045 * side, 0, 0); hips.add(piv);
      var tp = smoothProfile([[0.001, 0.01], [0.047, 0.0], [0.05, -0.06], [0.046, -0.15], [0.04, -0.235], [0.0005, -0.245]], sg(16, 10));
      var tg = lathe(tp, sg(28, 16), { start: Math.PI }); /* u 0.5 faces +z; v 0 at the hip = the top of the canvas (flipY off) */
      var thigh = mesh(tg, thighMat, { ink: 0.004 }); piv.add(thigh);
      var knee = new THREE.Group(); knee.position.y = -0.235; piv.add(knee);
      /* the boot: close under the knee, then the bell — wider across than fore-and-aft, a rounded lip at the ground */
      var bp = smoothProfile([[0.001, 0.012], [0.042, 0.008], [0.038, -0.05], [0.036, -0.1], [0.041, -0.14], [0.053, -0.175], [0.069, -0.205], [0.084, -0.23], [0.086, -0.244], [0.07, -0.252], [0.001, -0.253]], sg(22, 12));
      var bg = lathe(bp, sg(32, 18)); bg.scale(1.08, 1, 0.9); bg.computeVertexNormals(); var shin = mesh(bg, M.boot, { ink: 0.0045 }); knee.add(shin);
      var foot = mesh(blob(0.05, 0.026, 0.066, sg(18, 10)), M.boot, { ink: 0.0045 }); foot.position.set(0, -0.234, 0.026); knee.add(foot);
      return { piv: piv, knee: knee, foot: foot }; }
    var legL = leg(1), legR = leg(-1);
    /* ----- the torso: the orange suit with the broad dark chevron (a canvas on a lathe) ----- */
    var torsoTex = ctex(TN * 2, TN * 2, function (g, w, h) { g.fillStyle = hex(P.suit); g.fillRect(0, 0, w, h); var cx = w / 2;
      g.fillStyle = hex(P.dark); g.beginPath(); /* the chevron: a broad V band, its point at the front below the collar, rising steeply to the sides */ var y0 = h * 0.47, th = h * 0.1, sp = w * 0.215, rise = h * 0.17; g.moveTo(cx - sp, y0 - rise); g.lineTo(cx, y0); g.lineTo(cx + sp, y0 - rise); g.lineTo(cx + sp, y0 - rise + th); g.lineTo(cx, y0 + th); g.lineTo(cx - sp, y0 - rise + th); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = w / 180; g.beginPath(); g.moveTo(cx - sp, y0 - rise + th * 0.5); g.lineTo(cx, y0 + th * 0.5); g.lineTo(cx + sp, y0 - rise + th * 0.5); g.stroke();
      g.fillStyle = hex(P.dark); g.beginPath(); g.moveTo(cx - w * 0.075, 0); g.lineTo(cx + w * 0.075, 0); g.lineTo(cx + w * 0.05, h * 0.2); g.lineTo(cx, h * 0.28); g.lineTo(cx - w * 0.05, h * 0.2); g.closePath(); g.fill(); /* the dark of the turtleneck running down to a point */
      g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, h * 0.78, w, h * 0.22); });
    torsoTex.flipY = false;
    var torso = new THREE.Group(); torso.position.y = HIP; body.add(torso);
    var tpf = smoothProfile([[0.001, -0.03], [0.072, -0.03], [0.08, 0.03], [0.07, 0.11], [0.058, 0.2], [0.064, 0.27], [0.08, 0.33], [0.084, 0.37], [0.066, 0.41], [0.03, 0.425], [0.001, 0.426]], sg(26, 14));
    var tgeo = lathe(tpf, sg(36, 20), { start: Math.PI }); tgeo.scale(1, 1, 0.74); var tuv = tgeo.attributes.uv; for (var i0 = 0; i0 < tuv.count; i0++) tuv.setY(i0, 1 - tuv.getY(i0));
    var tor = mesh(tgeo, toon(0xffffff, { map: torsoTex }), { ink: 0.004 }); torso.add(tor);
    var collar = mesh(lathe([[0.001, 0], [0.037, 0], [0.037, 0.056], [0.033, 0.066], [0.001, 0.066]], sg(24, 14)), M.dark, { ink: 0.003 }); collar.position.y = 0.4; torso.add(collar);
    var crim = mesh(new THREE.TorusGeometry(0.0345, 0.0028, 6, sg(28, 14)), M.rim, { ink: false }); crim.rotation.x = Math.PI / 2; crim.position.y = 0.462; torso.add(crim);
    /* ----- the lab coat: open in front, pointed lapels and a collar, the front corners hanging to points at the hips ----- */
    var coatTex = ctex(TN * 2, TN, function (g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,150,160,.45)'; g.lineWidth = w / 170; [[0.32, 0.55], [0.68, 0.55]].forEach(function (p) { g.strokeRect(p[0] * w - w * 0.05, p[1] * h, w * 0.1, h * 0.14); }); g.strokeStyle = 'rgba(170,170,180,.35)'; g.lineWidth = w / 256; for (var k = 0; k < 6; k++) { var x = w * (0.08 + k * 0.17); g.beginPath(); g.moveTo(x, h * 0.25); g.quadraticCurveTo(x + w * 0.012, h * 0.6, x - w * 0.008, h); g.stroke(); } });
    coatTex.flipY = false;
    var CN = sg(40, 24), gapB = 1.05, gapT = 0.42, coatG = new THREE.CylinderGeometry(0.092, 0.118, 0.39, CN, sg(10, 6), true, 0, Math.PI * 2), cp = coatG.attributes.position, cuv = coatG.attributes.uv, v = new THREE.Vector3();
    for (var i = 0; i < cp.count; i++) { v.fromBufferAttribute(cp, i); var tt = (v.y + 0.195) / 0.39, gap = gapB + (gapT - gapB) * Math.pow(tt, 0.7), u = (i % (CN + 1)) / CN; /* map the circle minus the gap */ var a2 = gap / 2 + u * (Math.PI * 2 - gap), r = Math.hypot(v.x, v.z) * (1 + 0.05 * Math.sin(tt * 3.1)); v.x = Math.sin(a2) * r; v.z = Math.cos(a2) * r * 0.8; var ed = Math.max(0, 1 - Math.min(u, 1 - u) / 0.12); v.y -= 0.028 * ed * ed * Math.max(0, 1 - tt / 0.4); cp.setXYZ(i, v.x, v.y, v.z); cuv.setXY(i, u, 1 - tt); }
    coatG.computeVertexNormals();
    var coat = mesh(coatG, toon(0xffffff, { map: coatTex, side: THREE.DoubleSide }), { ink: 0.004 }); coat.position.y = 0.215; torso.add(coat);
    [1, -1].forEach(function (s) { var lp = new THREE.Shape(); lp.moveTo(0, 0); lp.lineTo(0.046 * s, 0.03); lp.lineTo(0.03 * s, 0.128); lp.lineTo(0.0, 0.14); lp.lineTo(0, 0); var lg = new THREE.ExtrudeGeometry(lp, { depth: 0.006, bevelEnabled: false }), lm = mesh(lg, M.coat, { ink: 0.003 }); lm.position.set(0.034 * s, 0.255, 0.066); lm.rotation.set(-0.18, 0.5 * s, 0); torso.add(lm); });
    var cc = mesh(lathe([[0.046, 0], [0.054, 0.03], [0.052, 0.054], [0.042, 0.062]], sg(28, 16), { start: Math.PI * 0.30, len: Math.PI * 1.4 }), M.coat, { ink: 0.003 }); cc.position.y = 0.375; torso.add(cc);
    /* ----- the arms: white sleeves, cuffs, hands with fingers ----- */
    function hand(side) { var parts = [], k; parts.push([blob(0.026, 0.03, 0.013, sg(16, 10)), M4([0, -0.02, 0], [0, 0, 0]), P.skin]);
      for (k = 0; k < 4; k++) { var fx = (k - 1.5) * 0.0125 * side, fl = [0.026, 0.03, 0.028, 0.022][k]; parts.push([new THREE.CapsuleGeometry(0.0058, fl, sg(3, 2), sg(8, 6)), M4([fx, -0.052 - fl * 0.3, 0.002], [0, 0, (k - 1.5) * 0.12 * side]), P.skin]); }
      parts.push([new THREE.CapsuleGeometry(0.0068, 0.02, sg(3, 2), sg(8, 6)), M4([-0.026 * side, -0.026, 0.008], [0.3, 0, 0.9 * side]), P.skin]); return merge(parts); }
    function arm(side) {
      var sh = new THREE.Group(); sh.position.set(0.088 * side, 0.375, 0); torso.add(sh);
      var up = mesh(lathe(smoothProfile([[0.001, 0.02], [0.03, 0.012], [0.032, -0.05], [0.027, -0.13], [0.001, -0.14]], sg(12, 8)), sg(20, 12)), M.coat, { ink: 0.004 }); sh.add(up);
      var el = new THREE.Group(); el.position.y = -0.13; sh.add(el);
      var fo = mesh(lathe(smoothProfile([[0.001, 0.012], [0.027, 0.008], [0.026, -0.06], [0.03, -0.11], [0.03, -0.125], [0.001, -0.128]], sg(12, 8)), sg(20, 12)), M.coat, { ink: 0.004 }); el.add(fo);
      var cuff = mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.022, sg(18, 12)), M.coat, { ink: 0.003 }); cuff.position.y = -0.115; el.add(cuff);
      var wr = new THREE.Group(); wr.position.y = -0.125; el.add(wr);
      var hd = mesh(hand(side), M.hand, { ink: 0.0035 }); wr.add(hd);
      sh.rotation.z = 0.1 * side; return { sh: sh, el: el, wr: wr, hand: hd }; }
    var armL = arm(1), armR = arm(-1);
    /* ----- the head: an anime head (a round crown, full cheeks, a short soft chin), the face a decal drawn in its own units; the eyes large and round as in the art ----- */
    var neck = new THREE.Group(); neck.position.y = 0.43; torso.add(neck);
    var nk = mesh(new THREE.CylinderGeometry(0.023, 0.026, 0.07, sg(16, 10)), M.skin, { ink: false }); nk.position.y = 0.01; neck.add(nk);
    var head = new THREE.Group(); head.position.y = 0.12; head.scale.setScalar(1.09); neck.add(head);
    var R = 0.112, skull = animeSkull(R, sg(72, 36), sg(54, 27)); var hm2 = mesh(skull, M.skin, { ink: 0.004 }); head.add(hm2);
    var LFO = { skin: '#fad3bf', eyeX: 0.0445, eyeY: -0.027, ew: 0.0285, eh: 0.0345, lashW: 0.005, fn: LQ >= 3 ? 2048 : 1024 }; var fm = faceMat(faceTex('open', 'luna' + (LQ >= 3 ? 'U' : ''), LFO)); var face = new THREE.Mesh(faceDecal(skull), fm); face.renderOrder = 2; head.add(face);
    /* ----- the hair: a shell under the helmet with the face left open, locks falling over it to the nape, the fringe with its tuft, the side locks ----- */
    var MH = toon(0xffffff, { vc: true }), hairC = new THREE.Color(P.hair), hiC = new THREE.Color(P.hairHi), dkC = new THREE.Color(P.hair).multiplyScalar(0.78), teal = new THREE.Color(P.streak), tealD = new THREE.Color(P.streak).multiplyScalar(0.8);
    var shell = new THREE.SphereGeometry(1, sg(56, 32), sg(36, 20)), sp = shell.attributes.position, sc = [], keep = [], si = shell.index.array, i;
    for (i = 0; i < sp.count; i++) { var hx = sp.getX(i), hy = sp.getY(i), hz = sp.getZ(i); sp.setXYZ(i, hx * R * 1.045, hy * R * 1.07, hz * R * 1.035); var cc2 = hairC.clone().lerp(dkC, Math.max(0, Math.min(1, (0.2 - hy) * 0.8))); sc.push(cc2.r, cc2.g, cc2.b); }
    shell.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
    function inShell(k) { var x = sp.getX(k) / (R * 1.045), y = sp.getY(k) / (R * 1.07), z = sp.getZ(k) / (R * 1.035); if (y < -0.82) return false; if (z > 0.3 && y < 0.42 && Math.abs(x) < 0.86) return false; if (z > 0.55 && y < -0.1) return false; if (z > -0.1 && y < -0.35) return false; return true; }
    for (i = 0; i < si.length; i += 3) if (inShell(si[i]) && inShell(si[i + 1]) && inShell(si[i + 2])) keep.push(si[i], si[i + 1], si[i + 2]); shell.setIndex(keep); shell.computeVertexNormals();
    head.add(mesh(shell, MH, { ink: 0.0035 }));
    function radial(t, P0) { return P0.clone().normalize(); }
    var sways = [];
    /* a lock of hair on a pivot at its root (so it can sway); its colours: the body, a band of gloss, the tip darkening */
    function lock(pts, w, th, o2) { o2 = o2 || {}; var p0 = pts[0], rel = pts.map(function (p) { return p.clone().sub(p0); }), cv = new THREE.CatmullRomCurve3(rel, false, 'catmullrom', 0.5), g2 = taper(cv, sg(o2.seg || 18, 8), sg(8, 6), function (t) { return th * Math.pow(1 - t, o2.pw || 0.7) + 0.0012; }, { flat: w / th, up: function (t, Pq) { return Pq.clone().add(p0).normalize(); }, color: function (t, a, c) { c.copy(o2.teal ? teal : hairC); if (o2.band && t > o2.band[0] && t < o2.band[1] && Math.cos(a) > -0.2) c.copy(o2.teal ? teal : hiC); if (t > 0.75) c.lerp(o2.teal ? tealD : dkC, (t - 0.75) * 1.6); } });
      var piv = new THREE.Group(); piv.position.copy(p0); head.add(piv); var mm = mesh(g2, MH, { ink: o2.ink || 0.0026 }); piv.add(mm); if (o2.sway) sways.push({ piv: piv, amp: o2.sway, ph: Math.random() * 6.28, a: 0, v: 0 }); return piv; }
    function onSkull(th, y, lift) { var yy = y / (R * 1.07), rr = Math.sqrt(Math.max(0.02, 1 - yy * yy)), r1 = R * 1.06 + (lift || 0); return V(Math.sin(th) * rr * r1, y, Math.cos(th) * rr * r1); }
    /* the fringe and the back: hair as a surface laid over the skull whose lower edge falls in pointed clumps, shaded strand by strand
       (a crease between the clumps, the light band of the gloss), lifting a little at the tips */
    function fringe(th0, th1, yTop, clumps, yGap, o3) { o3 = o3 || {}; var NU = sg(o3.nu || 120, 40), NV = sg(o3.nv || 14, 6), pos = [], col = [], idx = [], c3 = new THREE.Color(), u, v;
      function edge(th) { var y = yGap, ph = 0, best = 9; clumps.forEach(function (c) { var d = (th - c[0]) / c[1]; if (Math.abs(d) < 1) { var yy = yTop - c[2] * (1 - Math.pow(Math.abs(d), o3.sharp || 1.25)); if (yy < y) y = yy; } if (Math.abs(d) < best) { best = Math.abs(d); ph = d; } }); return [y, ph]; }
      for (v = 0; v <= NV; v++) for (u = 0; u <= NU; u++) { var th = th0 + (th1 - th0) * u / NU, E = edge(th), vv = v / NV, y = yTop + (E[0] - yTop) * vv, lift = (o3.lift0 || 0.004) + ((o3.lift1 || 0.011) - (o3.lift0 || 0.004)) * vv + (o3.flick || 0) * Math.pow(vv, 3), P0 = onSkull(th, y, lift);
        pos.push(P0.x, P0.y, P0.z); var crease = Math.pow(Math.abs(E[1]), 3), gl = o3.band ? Math.max(0, 1 - Math.abs(vv - o3.band) / 0.09) : 0; c3.copy(hairC).lerp(dkC, crease * 0.65 + vv * 0.12).lerp(hiC, gl * (1 - crease) * 0.9); col.push(c3.r, c3.g, c3.b); }
      for (v = 0; v < NV; v++) for (u = 0; u < NU; u++) { var a = v * (NU + 1) + u, b = a + 1, c = a + NU + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
      var g3 = new THREE.BufferGeometry(); g3.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g3.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g3.setIndex(idx); g3.computeVertexNormals();
      var m3 = mesh(g3, toon(0xffffff, { vc: true, side: THREE.DoubleSide }), { ink: 0.0024 }); head.add(m3); return m3; }
    /* the fringe: longer at the sides, framing the face, the clumps parted to her right where the tuft sweeps out */
    fringe(-1.32, 1.32, R * 0.66, [[-1.17, 0.27, R * 1.16], [-0.9, 0.26, R * 0.92], [-0.62, 0.25, R * 0.76], [-0.36, 0.24, R * 0.7], [-0.1, 0.24, R * 0.6], [0.15, 0.24, R * 0.7], [0.41, 0.25, R * 0.74], [0.67, 0.26, R * 0.8], [0.94, 0.26, R * 0.96], [1.2, 0.26, R * 1.18]], R * 0.2, { lift0: 0.003, lift1: 0.01, flick: 0.004, band: 0.2, sharp: 0.85, nu: 180 });
    /* the back: to the nape, the tips turned out a little */
    var bc = [], bi; for (bi = 0; bi < 15; bi++) { var thb = Math.PI * 0.42 + bi / 14 * Math.PI * 1.16; bc.push([thb, 0.15, R * (1.42 + 0.1 * Math.sin(bi * 2.1))]); }
    fringe(Math.PI * 0.4, Math.PI * 1.6, R * 0.55, bc, -R * 0.5, { lift0: 0.004, lift1: 0.012, flick: 0.012, band: 0.3, nu: 150 });
    /* the tuft: the big sweep of the fringe to her right, from under the band's middle, flicking up at its end; two smaller wisps beside it */
    lock([onSkull(0.05, R * 0.63, 0.008), onSkull(-0.2, R * 0.52, 0.014), onSkull(-0.48, R * 0.42, 0.02), onSkull(-0.72, R * 0.4, 0.024), onSkull(-0.92, R * 0.52, 0.03)], 0.024, 0.0078, { seg: 20, pw: 0.55, band: [0.25, 0.45], sway: 0.05 });
    lock([onSkull(0.08, R * 0.62, 0.007), onSkull(-0.08, R * 0.46, 0.014), onSkull(-0.3, R * 0.32, 0.018), onSkull(-0.44, R * 0.22, 0.016)], 0.018, 0.006, { seg: 14, pw: 0.6, sway: 0.04 });
    lock([onSkull(0.2, R * 0.62, 0.006), onSkull(0.3, R * 0.44, 0.012), onSkull(0.42, R * 0.28, 0.014), onSkull(0.5, R * 0.2, 0.011)], 0.016, 0.0055, { seg: 12, pw: 0.6, sway: 0.035 });
    /* the side locks: in front of the ear cups, framing the cheeks down to the jaw; a thread of teal among them */
    [1, -1].forEach(function (sd) { [[1.02, 0.05, 1.1, -0.92, 0.024, false], [0.88, 0.12, 0.94, -0.66, 0.02, false], [1.1, -0.02, 1.16, -0.8, 0.01, true]].forEach(function (b) { lock([onSkull(sd * b[0], R * 0.45, 0.004), onSkull(sd * (b[0] + 0.05), R * b[1], 0.01), onSkull(sd * (b[2] - 0.02), R * (b[1] + b[3]) / 2, 0.012), onSkull(sd * b[2], R * b[3], 0.01)], b[4], b[5] ? 0.004 : 0.0058, { seg: 14, pw: 0.6, teal: b[5], sway: 0.06 }); }); });
    /* ----- the twin tails: bundles of strands from under the helmet behind the ear cups — orange clumps over a teal inner strand — each on its own chain of bones ----- */
    var tails = [], NB = QB[LQ], NS = QN[LQ];
    function tailShape(s, k) { /* the S of the drawing: out from the tie, in at the waist, out again, the wavy end flicking outwards; each strand offset in its own way */
      var ox = [0, -0.012, 0.008, -0.006, 0.01, 0.016][k] * s, oz = [0, -0.004, -0.016, 0.012, 0.012, -0.006][k], ph = [0, 0.9, 1.9, 2.6, 3.6, 4.4][k], sc = [1, 0.97, 0.94, 0.98, 0.9, 0.88][k];
      var base = [[0, 0, 0], [0.04, -0.03, -0.016], [0.078, -0.1, -0.034], [0.094, -0.19, -0.046], [0.072, -0.28, -0.04], [0.08, -0.37, -0.028], [0.114, -0.45, -0.016], [0.1, -0.53, -0.004], [0.126, -0.6, 0.006], [0.15, -0.645, 0.02]];
      return base.map(function (p, j) { var w = Math.min(1, j / 2), wv = Math.sin(j * 0.9 + ph) * 0.006 * Math.min(1, j / 3); return V(s * p[0] * sc + (ox + s * wv) * w, p[1] * sc - 0.003 * k * w, p[2] + (oz + wv * 0.5) * w); }); }
    var strandDef = [{ r: 0.034, fl: 0.62, kind: 'main' }, { r: 0.017, fl: 0.6, kind: 'teal' }, { r: 0.021, fl: 0.6, kind: 'orange' }, { r: 0.011, fl: 0.6, kind: 'teal' }, { r: 0.013, fl: 0.62, kind: 'orange' }, { r: 0.011, fl: 0.6, kind: 'orange' }];
    [1, -1].forEach(function (s) {
      var piv = new THREE.Group(); piv.position.set(s * 0.1, 0.035, -0.062); head.add(piv);
      for (var k = 0; k < NS; k++) { (function (k) { var D = strandDef[k], pts = tailShape(s, k), cv = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5), tOut = [], segs = sg(k === 0 ? 96 : 64, 24), rad = sg(k === 0 ? 14 : 10, 7);
        var rf = function (t) { return D.r * Math.sin(Math.min(1, t * 4 + 0.4) * Math.PI * 0.5) * (1 - Math.pow(t, 1.7) * 0.9) + 0.0025; };
        var mat, geo = taper(cv, segs, rad, rf, { flat: D.fl, up: V(s, 0, 0), tOut: tOut, color: function (t, a, c) { if (D.kind === 'teal') { c.copy(Math.cos(a) > 0.3 && t > 0.05 && t < 0.14 ? new THREE.Color(P.streak).lerp(new THREE.Color(0xffffff), 0.25) : teal); if (t > 0.8) c.lerp(tealD, (t - 0.8) * 2); return; } var band = t > 0.05 && t < 0.12 && Math.cos(a) > 0.2; c.copy(band ? hiC : hairC); if (D.kind === 'main' && Math.cos(a) < -0.55 && t > 0.08 && t < 0.93) c.copy(teal); else if (!band && Math.cos(a) < -0.1) c.copy(dkC); if (t > 0.86) c.lerp(dkC, (t - 0.86) * 3); } });
        /* the bones: at even steps along the curve, each pointing at the next */
        var rest = [], bones = [], q; for (q = 0; q < NB; q++) rest.push(cv.getPointAt(q / (NB - 1)));
        for (q = 0; q < NB; q++) { var bn = new THREE.Bone(); if (q === 0) bn.position.copy(rest[0]); else bn.position.copy(rest[q]).sub(rest[q - 1]); if (q) bones[q - 1].add(bn); bones.push(bn); } piv.add(bones[0]);
        (function skin(geo2, tl) { var n = geo2.attributes.position.count, si2 = new Uint16Array(n * 4), sw = new Float32Array(n * 4), q2; for (q2 = 0; q2 < n; q2++) { var f = Math.min(NB - 1.0001, (tl[q2] || 0) * (NB - 1)), b0 = Math.floor(f), u = f - b0; if (u < 0.35 && b0 > 0) { var w1 = 0.5 + u / 0.7; si2[q2 * 4] = b0; sw[q2 * 4] = w1; si2[q2 * 4 + 1] = b0 - 1; sw[q2 * 4 + 1] = 1 - w1; } else { si2[q2 * 4] = b0; sw[q2 * 4] = 1; } }
          geo2.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si2, 4)); geo2.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4)); })(geo, tOut);
        mat = toon(0xffffff, { vc: true }); var sk1 = new THREE.SkinnedMesh(geo, mat), ik1 = new THREE.SkinnedMesh(geo, ink(k === 0 ? 0.0042 : 0.003)); ik1.userData.ink = true; ik1.renderOrder = -1; [sk1, ik1].forEach(function (mm) { mm.frustumCulled = false; mm.castShadow = !mm.userData.ink; piv.add(mm); });
        tails.push({ piv: piv, side: s, k: k, bones: bones, rest: rest, meshes: [sk1, ik1], p: null, q: null, kS: [1, 0.92, 0.88, 0.84, 0.8, 0.76][k], air: [1, 1.15, 1.1, 1.3, 1.25, 1.4][k], ph: k * 1.7 + (s > 0 ? 0 : 0.8) }); })(k); }
      var tie = mesh(new THREE.TorusGeometry(0.02, 0.0085, sg(8, 6), sg(18, 10)), M.band, { ink: 0.0025 }); tie.position.set(s * 0.012, -0.004, -0.006); tie.rotation.y = Math.PI / 2; piv.add(tie); });
    /* the helmet: a white dome, the dark band low over the brow (deeper at the front), the large ear cups, the A */
    var helm = new THREE.Group(); helm.position.set(0, 0.014, -0.004); helm.rotation.x = -0.2; head.add(helm);
    var hg = new THREE.SphereGeometry(1, sg(64, 32), sg(26, 14), 0, Math.PI * 2, 0, Math.PI * 0.5); hg.scale(R * 1.13, R * 1.1, R * 1.12); var hh = mesh(hg, M.helmet, { ink: 0.0042 }); hh.position.y = 0.022; helm.add(hh);
    var bandG = new THREE.CylinderGeometry(R * 1.14, R * 1.158, 0.022, sg(64, 32), 1, true); var band = mesh(bandG, M.band, { ink: 0.0032 }); band.position.y = 0.013; helm.add(band);
    /* the front of the band dips over the brows: a deeper arc between the ear cups */ var bfG = new THREE.CylinderGeometry(R * 1.145, R * 1.165, 0.03, sg(48, 24), 1, true, -1.05, 2.1), bp2 = bfG.attributes.position; for (i = 0; i < bp2.count; i++) { var ang = Math.atan2(bp2.getX(i), bp2.getZ(i)); bp2.setY(i, bp2.getY(i) - 0.006 * Math.cos(ang) * (bp2.getY(i) < 0 ? 1 : 0.2)); } bfG.computeVertexNormals(); var bf = mesh(bfG, M.band, { ink: 0.0032 }); bf.position.y = 0.006; helm.add(bf);
    var emH = 0.046, emZ = R * 1.12 * Math.sqrt(1 - Math.pow(emH / (R * 1.1), 2)) + 0.003, em = mesh(emblemGeo(0.06, 0.06), M.emblem, { ink: 0.002 }); em.position.set(0.0, 0.022 + emH, emZ); em.rotation.x = -Math.asin(emH / (R * 1.1)); helm.add(em);
    [1, -1].forEach(function (s) { var cupG = new THREE.CylinderGeometry(0.041, 0.044, 0.03, sg(32, 18)); cupG.rotateZ(Math.PI / 2); var cu = mesh(cupG, M.cup, { ink: 0.003 }); cu.position.set(s * R * 1.08, -0.016, -0.012); head.add(cu); var rim = mesh(new THREE.TorusGeometry(0.036, 0.006, sg(8, 6), sg(32, 16)), M.band, { ink: false }); rim.rotation.y = Math.PI / 2; rim.position.set(s * (R * 1.08 + 0.016), -0.016, -0.012); head.add(rim); var dot = mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.006, sg(20, 12)), M.rim, { ink: false }); dot.rotation.z = Math.PI / 2; dot.position.set(s * (R * 1.08 + 0.018), -0.016, -0.012); head.add(dot); });
    /* the colliders the tails rest against: the head, the shoulders, the back, the coat */
    var coll = [{ o: head, p: V(0, -0.01, 0), r: 0.128 }, { o: torso, p: V(0, 0.33, -0.01), r: 0.105 }, { o: torso, p: V(0, 0.2, -0.01), r: 0.105 }, { o: torso, p: V(0, 0.06, 0), r: 0.118 }, { o: hips, p: V(0, -0.06, 0), r: 0.105 }];
    /* the gear: sockets in the right hand, on the left forearm, on the back */
    var sockW = new THREE.Group(); sockW.position.set(0, -0.045, 0.01); armR.wr.add(sockW);
    var sockS = new THREE.Group(); sockS.position.set(0.035, -0.07, 0); armL.el.add(sockS);
    var sockC = new THREE.Group(); sockC.position.set(0, 0.36, -0.07); torso.add(sockC);
    var A = { root: root, body: body, hips: hips, torso: torso, neck: neck, head: head, face: face, faceMat: fm, legL: legL, legR: legR, armL: armL, armR: armR, tails: tails, sways: sways, coll: coll, L1: 0.235, L2: 0.228, A1: 0.13, A2: 0.15, ank: 0.027, footX: 0.05, kind: 'luna', fk: 'luna' + (LQ >= 3 ? 'U' : ''), fo: LFO, hip: HIP, sock: { w: sockW, s: sockS, c: sockC }, gear: {}, lq: LQ,
      t: 0, phase: 0, speed: 0, mode: 'idle', modeT: 0, blinkT: 2 + Math.random() * 2, blink: 0, expr: 'open', exprHold: 0, yawPrev: 0, vPrev: 0, jumpY: 0, squash: 0, scale: 1 };
    root.updateMatrixWorld(true); tails.forEach(function (T) { var sk = new THREE.Skeleton(T.bones); T.meshes.forEach(function (mm) { mm.bind(sk); }); });
    root.userData.A = A; curvedAll(root); return A; }

  /* ================= the people of the island ================= */
  /* ================= the people of the island (v60) =================
     Everyone else — station staff, site masters, the diner's master, the shrine keeper, the visitors of the lake and the beach, the crowds of
     the stations — is built here, in the same manner as Luna and the two at the lake: the round head of the drawings with its large eyes and
     blush, hair in locks that lie on the skull (short, bob, long, bun, ponytail) with the ring of light glossy hair has, a collar and buttons
     or a round neckline, a pleated skirt or trousers with their cuffs, socks and shoes with their soles, hands with thumbs, ears. The rig is
     unchanged (the walk, the sit, the wave, the IK of the feet): only what hangs on its bones is new. Detail follows the quality level. */
  function hairTexL(base, hi, lo) { return ctex(128, 128, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, hex(lo)); gr.addColorStop(0.3, hex(base)); gr.addColorStop(1, hex(base)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = hex(hi); g.globalAlpha = 0.8; g.beginPath(); g.moveTo(0, h * 0.5); for (var i = 0; i <= 24; i++) { var x = i / 24 * w; g.lineTo(x, h * (0.47 + (i % 2 ? 0.0 : 0.035) + 0.01 * Math.sin(i * 1.7))); } for (i = 24; i >= 0; i--) { var x2 = i / 24 * w; g.lineTo(x2, h * (0.6 + (i % 2 ? 0.07 : 0.0) + 0.012 * Math.sin(i * 2.3))); } g.closePath(); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(0,0,0,0.14)'; g.lineWidth = 1; for (i = 0; i < 40; i++) { var sx = (i * 37 % 128) / 128 * w; g.beginPath(); g.moveTo(sx, h * 0.05); g.quadraticCurveTo(sx + 3, h * 0.5, sx - 1, h); g.stroke(); } }); }
  var HTX = {};
  function hairTexOf(base) { var k = String(base); if (HTX[k]) return HTX[k]; var c = new THREE.Color(base), hi = c.clone().lerp(new THREE.Color(0xffffff), 0.32), lo = c.clone().multiplyScalar(0.55); return (HTX[k] = hairTexL(base, hi.getHex(), lo.getHex())); }
  function onSk(R, th, y, lift) { var yy = y / (R * 1.04), rr = Math.sqrt(Math.max(0.03, 1 - yy * yy)), r1 = R * 1.05 + (lift || 0); return V(Math.sin(th) * rr * r1, y, Math.cos(th) * rr * r1); }
  function lockG(pts, w, th, o) { o = o || {}; var cv = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), C = o.c || V(0, 0, 0), tp = o.tip == null ? 1 : o.tip, uy = o.uy == null ? 0.35 : o.uy, U0 = new THREE.Vector3();
    return taper(cv, o.seg || sg(12, 6), o.rad || 5, function (t) { var root = t < 0.12 ? 0.7 + t / 0.12 * 0.3 : 1; return th * root * Math.pow(Math.max(0, 1 - t), 0.55 * tp) + 0.0004; },
      { flat: w / th, up: function (t, P) { U0.subVectors(P, C); U0.y *= uy; if (U0.lengthSq() < 1e-8) U0.set(0, 0, 1); return U0.normalize(); } }); }
  var IRIS = [['#1a0f0a', '#3a2418', '#6a4a34', '#9a7a5e'], ['#15120e', '#3d2a1a', '#7a5a3a', '#b8966a'], ['#101418', '#2c3340', '#58657c', '#a3b2c8'], ['#0f1a12', '#2a4a2e', '#4f7a4a', '#8fb08a'], ['#1c1008', '#4a2a10', '#8a5a2a', '#c89a5a']];
  function buildPerson(opt) {
    var P = Object.assign({}, PAL.worker, opt.pal || {}), root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.userData.kind = 'person';
    var seed = opt.seed || 0, rs = (function () { var x = (seed * 2654435761 + 12345) >>> 0 || 7; return function () { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; }; })();
    var hairStyle = opt.hair || 'short', fem = !!opt.skirt || hairStyle === 'long' || hairStyle === 'bob' || hairStyle === 'bun' || hairStyle === 'pony';
    var pantsC = P.pants || P.dark, topC = P.suit, hairC = P.hair, hairHi = new THREE.Color(hairC).lerp(new THREE.Color(0xffffff), 0.22).getHex(), hairDk = new THREE.Color(hairC).multiplyScalar(0.7).getHex();
    var M = { skin: toon(P.skin, { rim: 0.15 }), top: toon(topC, { rim: 0.15 }), pants: toon(pantsC, { rim: 0.15 }), vc: toon(0xffffff, { vc: true, rim: 0.15 }), vc2: toon(0xffffff, { vc: true, rim: 0.15, side: THREE.DoubleSide }), hair: toon(0xffffff, { vc: true, rim: 0.28 }), cap: toon(0xffffff, { rim: 0.28, map: hairTexOf(hairC) }), hat: toon(opt.hat || 0xffffff, { rim: 0.2 }), acc: toon(P.emblem, { rim: 0.15 }), sock: toon(0xfbfaf6, { rim: 0.15 }) };
    var HIP = 0.5, collarC = opt.collar != null ? opt.collar : (fem ? 0xfdfbf6 : new THREE.Color(topC).lerp(new THREE.Color(0xffffff), 0.5).getHex()), shoeC = P.boot, soleC = new THREE.Color(P.boot).lerp(new THREE.Color(0xffffff), 0.35).getHex();
    var hips = new THREE.Group(); hips.position.y = HIP; body.add(hips);
    /* the legs: trousers in two tapering tubes with a cuff, or bare legs with short socks under a skirt; the shoe with its sole and round toe */
    function leg(side) { var piv = new THREE.Group(); piv.position.set(0.05 * side, 0, 0); hips.add(piv); var bare = !!opt.skirt && !opt.robe;
      piv.add(mesh(lathe(smoothProfile([[0.001, 0.012], [0.05, 0.004], [0.049, -0.1], [0.044, -0.2], [0.04, -0.24], [0.001, -0.246]], 10), sg(14, 8)), bare ? M.skin : M.pants, { ink: 0.004 }));
      var knee = new THREE.Group(); knee.position.y = -0.24; piv.add(knee);
      var KP = []; KP.push([lathe(smoothProfile([[0.001, 0.012], [0.041, 0.006], [0.039, -0.1], [bare ? 0.03 : 0.037, -0.19], [bare ? 0.028 : 0.038, -0.215], [0.001, -0.22]], 10), sg(14, 8)), null, bare ? P.skin : pantsC]);
      if (bare) { KP.push([new THREE.CylinderGeometry(0.031, 0.03, 0.045, sg(12, 8)), M4([0, -0.2, 0]), 0xfbfaf6]); KP.push([new THREE.TorusGeometry(0.031, 0.005, 5, sg(14, 8)), M4([0, -0.178, 0], [Math.PI / 2, 0, 0]), 0xfbfaf6]); }
      else KP.push([new THREE.TorusGeometry(0.038, 0.006, 5, sg(14, 8)), M4([0, -0.205, 0], [Math.PI / 2, 0, 0]), new THREE.Color(pantsC).multiplyScalar(0.8).getHex()]);
      knee.add(mesh(merge(KP), M.vc, { ink: 0.004 }));
      var SP = []; SP.push([blob(0.04, 0.03, 0.07, sg(14, 8)), M4([0, 0.004, 0.012]), shoeC]); SP.push([rbox(0.078, 0.012, 0.14, 0.005, 2), M4([0, -0.02, 0.014]), soleC]); if (fem && !opt.robe) SP.push([new THREE.TorusGeometry(0.03, 0.004, 4, sg(12, 8), Math.PI), M4([0, 0.014, 0.012], [0, Math.PI / 2, 0]), shoeC]);
      var ft = mesh(merge(SP), M.vc, { ink: 0.004 }); ft.position.set(0, -0.228, 0.014); knee.add(ft); return { piv: piv, knee: knee, foot: ft }; }
    var legL = leg(1), legR = leg(-1);
    var torso = new THREE.Group(); torso.position.y = HIP; body.add(torso); var TP = [];
    /* the body: the shirt or the dress's bodice, a little waist, the shoulders rounded; the collar; the buttons; the belt */
    var tg = lathe(smoothProfile([[0.001, -0.04], [0.086, -0.04], [0.086, 0.05], [0.078, 0.15], [0.088, 0.26], [0.092, 0.33], [0.08, 0.4], [0.036, 0.43], [0.001, 0.432]], 16), sg(24, 12)); tg.scale(1, 1, 0.74); TP.push([tg, null, topC]);
    if (opt.vest || opt.apron || !fem) { [-1, 1].forEach(function (sd) { TP.push([rbox(0.036, 0.03, 0.004, 0.003, 2), M4([sd * 0.02, 0.41, 0.052], [-0.6, sd * 0.35, sd * 0.55]), collarC]); }); TP.push([new THREE.TorusGeometry(0.03, 0.006, 5, sg(14, 8)), M4([0, 0.43, 0.0], [Math.PI / 2, 0, 0], [1, 1, 0.8]), collarC]);
      if (!opt.vest && !opt.apron) [0.36, 0.3, 0.24, 0.18].forEach(function (y) { TP.push([blob(0.006, 0.006, 0.003, 6), M4([0, y, 0.074 - (y > 0.3 ? 0.002 : 0.006)]), collarC]); }); }
    else { TP.push([new THREE.TorusGeometry(0.036, 0.009, 6, sg(16, 8)), M4([0, 0.415, 0.004], [Math.PI / 2, 0, 0], [1.05, 1, 0.82]), collarC]); TP.push([blob(0.008, 0.008, 0.005, 6), M4([0, 0.39, 0.07]), 0xd8577a]); }
    if (!opt.skirt && !opt.robe) TP.push([new THREE.TorusGeometry(0.088, 0.008, 5, sg(20, 10)), M4([0, -0.03, 0], [Math.PI / 2, 0, 0], [1, 1, 0.76]), new THREE.Color(pantsC).multiplyScalar(0.6).getHex()]);
    torso.add(mesh(merge(TP), M.vc, { ink: 0.004 }));
    /* the skirt: flared, pleated (every other pleat a shade darker), a lighter hem; the robe falls to the ankles */
    if (opt.skirt || opt.robe) { var skC = opt.robe ? opt.robe : (opt.skirtC || topC), skG = lathe(smoothProfile([[0.001, 0.0], [0.1, 0.0], [0.12, -0.12], [opt.robe ? 0.15 : 0.145, opt.robe ? -0.46 : -0.27], [0.001, opt.robe ? -0.46 : -0.27]], 10), sg(28, 16)); var sp = skG.attributes.position, sc = new Float32Array(sp.count * 3), c0 = new THREE.Color(skC), c1 = new THREE.Color(skC).multiplyScalar(0.84), c2 = new THREE.Color(skC).lerp(new THREE.Color(0xffffff), 0.3);
      for (var vi = 0; vi < sp.count; vi++) { var ang = Math.atan2(sp.getX(vi), sp.getZ(vi)), y = sp.getY(vi), pl = Math.sin(ang * 12) > 0 ? c0 : c1, cc = (!opt.robe && y < -0.24) ? c2 : pl; sc[vi * 3] = cc.r; sc[vi * 3 + 1] = cc.g; sc[vi * 3 + 2] = cc.b; var rr = Math.hypot(sp.getX(vi), sp.getZ(vi)); if (rr > 0.001 && !opt.robe) { var k = 1 + 0.03 * Math.sin(ang * 12) * Math.min(1, -y / 0.12); sp.setXYZ(vi, sp.getX(vi) * k, y, sp.getZ(vi) * k); } }
      skG.setAttribute('color', new THREE.BufferAttribute(sc, 3)); skG.computeVertexNormals(); var sk = mesh(skG, M.vc2, { ink: 0.004 }); sk.position.y = 0.02; torso.add(sk); }
    if (opt.apron) { var ap = mesh(rbox(0.15, 0.36, 0.012, 0.004, 2), toon(opt.apron, { rim: 0.1 }), { ink: 0.003 }); ap.position.set(0, 0.06, 0.074); torso.add(ap); }
    if (opt.vest) { var vs = mesh(lathe(smoothProfile([[0.094, -0.02], [0.098, 0.15], [0.102, 0.3], [0.092, 0.38]], 8), sg(24, 12), { start: Math.PI * 0.12, len: Math.PI * 1.76 }), toon(opt.vest, { rim: 0.15, side: THREE.DoubleSide }), { ink: 0.003 }); vs.scale.set(1, 1, 0.78); vs.rotation.y = Math.PI; torso.add(vs); }
    if (opt.jacket) { var jk = mesh(lathe(smoothProfile([[0.096, -0.06], [0.1, 0.1], [0.104, 0.26], [0.098, 0.36], [0.07, 0.41]], 8), sg(24, 12), { start: Math.PI * 0.16, len: Math.PI * 1.68 }), toon(opt.jacket, { rim: 0.18, side: THREE.DoubleSide }), { ink: 0.003 }); jk.scale.set(1, 1, 0.8); jk.rotation.y = Math.PI; torso.add(jk); }
    /* the arms: the sleeve to the wrist (a cuff), the hand with its thumb */
    var sleeveC = opt.jacket || topC, Msl = opt.jacket ? toon(opt.jacket, { rim: 0.18 }) : M.top;
    function arm(side) { var sh = new THREE.Group(); sh.position.set(0.096 * side, 0.375, 0); torso.add(sh); sh.add(mesh(lathe(smoothProfile([[0.001, 0.024], [0.034, 0.012], [0.031, -0.13], [0.001, -0.14]], 8), sg(12, 8)), Msl, { ink: 0.004 })); var el = new THREE.Group(); el.position.y = -0.13; sh.add(el);
      var FP = []; FP.push([lathe(smoothProfile([[0.001, 0.01], [0.031, 0.005], [0.029, -0.1], [0.028, -0.115], [0.001, -0.12]], 8), sg(12, 8)), null, sleeveC]); FP.push([new THREE.TorusGeometry(0.028, 0.0045, 4, sg(12, 8)), M4([0, -0.112, 0], [Math.PI / 2, 0, 0]), new THREE.Color(sleeveC).lerp(new THREE.Color(0xffffff), fem ? 0.4 : 0.15).getHex()]); el.add(mesh(merge(FP), M.vc, { ink: 0.004 }));
      var wr = new THREE.Group(); wr.position.y = -0.125; el.add(wr); var HP = [[blob(0.026, 0.034, 0.016, sg(12, 8)), M4([0, -0.022, 0]), P.skin], [blob(0.009, 0.016, 0.009, 8), M4([0.018 * side, -0.012, -0.004], [0, 0, 0.5 * side]), P.skin]]; var hd = mesh(merge(HP), M.vc, { ink: 0.0035 }); wr.add(hd); sh.rotation.z = 0.12 * side; return { sh: sh, el: el, wr: wr, hand: hd }; }
    var armL = arm(1), armR = arm(-1);
    var neck = new THREE.Group(); neck.position.y = 0.43; torso.add(neck); var nk = mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.07, sg(12, 8)), M.skin, { ink: 0.003 }); nk.position.y = 0.03; neck.add(nk);
    var head = new THREE.Group(); head.position.y = 0.112; neck.add(head); var R = 0.114; /* (v60) a little larger, as the drawings have it */
    var pskull = animeSkull(R, sg(52, 28), sg(40, 20)); head.add(mesh(pskull, M.skin, { ink: 0.0042 }));
    [-1, 1].forEach(function (sd) { var e = mesh(blob(0.012, 0.02, 0.009, 8), M.skin, { ink: 0.0025 }); e.position.set(sd * R * 0.97, -0.02, -0.006); e.rotation.y = sd * 0.3; head.add(e); });
    var fk = 'p' + (opt.seed || 0) + (opt.faceKey || '') + (fem ? 'f' : 'm'), iris = IRIS[Math.floor(rs() * IRIS.length)], browC = new THREE.Color(hairC).lerp(new THREE.Color(0x3a2a20), 0.3).getHex();
    var fo = Object.assign({ iris: iris, eyeX: 0.041, eyeY: -0.025, ew: fem ? 0.0255 : 0.0235, eh: fem ? 0.0305 : 0.0275, lashW: fem ? 0.0046 : 0.0036, brow: hex(browC), lash: fem ? '#2a160e' : '#1e1714', blushLines: fem, fn: LQ >= 2 ? 1024 : 512 }, opt.face || {});
    var fm = faceMat(faceTex('open', fk, fo)); var face = new THREE.Mesh(faceDecal(pskull), fm); face.renderOrder = 2; head.add(face);
    /* the hair: a cap with the ring of light, then the locks — the fringe, the sides, the back — by the style; a bun, a ponytail with its ribbon */
    if (hairStyle !== 'bald') { var cap = new THREE.SphereGeometry(1, sg(32, 16), sg(16, 8), 0, Math.PI * 2, 0, Math.PI * 0.5); cap.scale(R * 1.075, R * 1.09, R * 1.07); var capM = mesh(cap, M.cap, { ink: 0.004 }); capM.position.y = 0.004; capM.rotation.x = -0.2; head.add(capM);
      var HP2 = [], shell = new THREE.SphereGeometry(1, sg(24, 12), sg(10, 5), Math.PI * 0.92, Math.PI * 1.16, Math.PI * 0.46, hairStyle === 'short' ? Math.PI * 0.26 : Math.PI * 0.4); shell.scale(R * 1.075, R * 1.09, R * 1.07); HP2.push([shell, null, hairC]);
      var part = (rs() - 0.5) * 0.5, nF = fem ? 8 : 7, i;
      for (i = 0; i < nF; i++) { var th = -0.66 + i / (nF - 1) * 1.32 + part * 0.3, tipY = (fem ? 0.012 : 0.02) + 0.02 * Math.sin(i * 2.3 + seed), s2 = (i / (nF - 1) - 0.5) * 0.18 + part * 0.4; HP2.push([lockG([onSk(R, th - s2 * 0.3, R * 0.95, 0.002), onSk(R, th - s2 * 0.1, R * 0.7, 0.011), onSk(R, th + s2 * 0.3, R * 0.42, 0.014), onSk(R, th + s2, tipY, 0.012)], fem ? 0.02 : 0.022, 0.0055, { tip: 1.25 }), null, i % 3 === 1 ? hairDk : hairC]); }
      var sideLen = hairStyle === 'short' ? -R * 0.1 : hairStyle === 'bob' ? -R * 0.95 : hairStyle === 'bun' || hairStyle === 'pony' ? -R * 0.5 : -R * 1.3;
      [-1, 1].forEach(function (sd) { HP2.push([lockG([onSk(R, sd * 0.98, R * 0.62, 0.004), onSk(R, sd * 1.06, R * 0.1, 0.012), onSk(R, sd * 1.1, sideLen * 0.5, 0.016), onSk(R, sd * 1.04, sideLen, 0.02)], 0.018, 0.0055, { tip: 1.2 }), null, hairC]); if (hairStyle !== 'short') HP2.push([lockG([onSk(R, sd * 1.3, R * 0.6, 0.004), onSk(R, sd * 1.4, 0.0, 0.012), onSk(R, sd * 1.44, sideLen * 0.6, 0.018), onSk(R, sd * 1.36, sideLen * 1.05, 0.016)], 0.02, 0.006), null, hairDk]); });
      if (hairStyle === 'short') { [[0.3, 0.6], [-0.6, 0.5], [1.0, 0.7], [-1.3, 0.6], [2.6, 0.5], [-2.4, 0.6], [3.3, 0.55]].forEach(function (b, k) { HP2.push([lockG([onSk(R, b[0], R * 0.97, 0.002), onSk(R, b[0] + 0.22 * b[1], R * 0.86, 0.022), onSk(R, b[0] + 0.42 * b[1], R * 0.62, 0.02)], 0.022, 0.0062, { tip: 1.5, uy: 1 }), null, k % 2 ? hairDk : hairC]); }); for (i = 0; i < 5; i++) { var tb = Math.PI + (i / 4 - 0.5) * 1.6; HP2.push([lockG([onSk(R, tb, R * 0.6, 0.006), onSk(R, tb + 0.05, R * 0.1, 0.016), onSk(R, tb + 0.08, -R * 0.3, 0.014)], 0.024, 0.0065, { tip: 1.2 }), null, i % 2 ? hairDk : hairC]); } }
      else { var nB = hairStyle === 'long' ? (LQ >= 2 ? 11 : 8) : 7, bl = hairStyle === 'bob' ? -R * 1.0 : hairStyle === 'long' ? -R * 2.9 : -R * 0.55; for (i = 0; i < nB; i++) { var k2 = i / (nB - 1), tb2 = Math.PI + (k2 - 0.5) * 2.0, sb = Math.sin(tb2), cb = Math.cos(tb2), ln = bl - Math.abs(k2 - 0.5) * R * 0.3; HP2.push([lockG([onSk(R, tb2, R * 0.62, 0.004), onSk(R, tb2 + 0.04, R * 0.05, 0.014), onSk(R, tb2 + 0.06, -R * 0.5, 0.016), V(sb * R * 1.08, Math.min(-R * 0.6, ln * 0.6), cb * R * 1.0), V(sb * R * 1.16, ln, cb * R * 0.96)], 0.024, 0.0068, { tip: 1.1, uy: 0.1, c: V(0, -R, 0) }), null, i % 3 === 2 ? hairDk : hairC]); } }
      if (hairStyle === 'bun') { var bp = onSk(R, Math.PI, R * 0.55, 0.03); HP2.push([blob(0.04, 0.034, 0.04, sg(14, 8)), M4([bp.x, bp.y + 0.01, bp.z]), hairC]); HP2.push([new THREE.TorusGeometry(0.03, 0.005, 5, sg(14, 8)), M4([bp.x, bp.y + 0.01, bp.z + 0.01], [0.3, 0, 0]), hairDk]); HP2.push([new THREE.TorusGeometry(0.018, 0.005, 5, 12), M4([bp.x + 0.03, bp.y - 0.01, bp.z], [0, 0.6, 0]), 0xd8577a]); }
      if (hairStyle === 'pony') { var pp = onSk(R, Math.PI, R * 0.45, 0.02); HP2.push([taper(new THREE.CatmullRomCurve3([V(pp.x, pp.y, pp.z), V(pp.x, pp.y - 0.03, pp.z - 0.03), V(pp.x + 0.01, pp.y - 0.12, pp.z - 0.035), V(pp.x - 0.004, pp.y - 0.24, pp.z - 0.02), V(pp.x + 0.006, pp.y - 0.3, pp.z + 0.004)]), sg(14, 8), 7, function (t) { return 0.03 * Math.pow(1 - t, 0.6) * (0.6 + 0.4 * Math.sin(t * 3.1)) + 0.0005; }, { flat: 1.3 }), null, hairC]); HP2.push([new THREE.TorusGeometry(0.018, 0.0055, 5, 12), M4([pp.x, pp.y - 0.006, pp.z - 0.012], [0.5, 0, 0]), 0xd8577a]); [-1, 1].forEach(function (sd) { HP2.push([taper(new THREE.CatmullRomCurve3([V(pp.x + sd * 0.004, pp.y - 0.01, pp.z - 0.018), V(pp.x + sd * 0.018, pp.y - 0.05, pp.z - 0.024), V(pp.x + sd * 0.024, pp.y - 0.09, pp.z - 0.018)]), 6, 4, function (t) { return 0.004 * (1 - t * 0.4); }, { flat: 2.4 }), null, 0xd8577a]); }); }
      head.add(mesh(merge(HP2), M.hair, { ink: 0.003 })); }
    var hat = opt.hatKind || 'hard';
    if (hat === 'hard') { var hhg = new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.5); hhg.scale(R * 1.15, R * 1.02, R * 1.15); var hm = mesh(hhg, M.hat, { ink: 0.0045 }); hm.position.y = 0.03; head.add(hm); var br = mesh(new THREE.CylinderGeometry(R * 1.24, R * 1.26, 0.012, 32), M.hat, { ink: 0.003 }); br.position.set(0, 0.03, 0.012); br.scale.set(1, 1, 1.12); head.add(br); var ridge = mesh(rbox(0.024, 0.03, R * 2.1, 0.01, 2), M.hat, { ink: 0.003 }); ridge.position.set(0, R * 1.02 + 0.03, 0); head.add(ridge); if (opt.hatMark !== false) { var st = mesh(emblemGeo(0.034, 0.06), M.acc, { ink: 0.002 }); st.position.set(0, R * 0.72, R * 0.96); st.rotation.x = -0.75; head.add(st); } }
    else if (hat === 'cap') { var cg = new THREE.SphereGeometry(1, 32, 10, 0, Math.PI * 2, 0, Math.PI * 0.42); cg.scale(R * 1.1, R * 0.95, R * 1.1); var cpm = mesh(cg, M.hat, { ink: 0.004 }); cpm.position.y = 0.035; head.add(cpm); var bill = mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.01, 24, 1, false, -Math.PI * 0.32, Math.PI * 0.64), M.hat, { ink: 0.003 }); bill.position.set(0, 0.03, 0.05); head.add(bill); }
    else if (hat === 'band') { var tb3 = mesh(new THREE.TorusGeometry(R * 1.02, 0.014, 8, 32), M.hat, { ink: 0.003 }); tb3.rotation.x = Math.PI / 2 - 0.12; tb3.position.y = 0.045; head.add(tb3); }
    else if (hat === 'eboshi') { var eb = mesh(lathe([[0.001, 0], [0.07, 0], [0.06, 0.12], [0.03, 0.17], [0.001, 0.18]], 16), M.hat, { ink: 0.003 }); eb.scale.set(1, 1, 0.6); eb.position.set(0, R * 0.75, -0.01); head.add(eb); }
    var sockW = new THREE.Group(); sockW.position.set(0, -0.04, 0.01); armR.wr.add(sockW);
    var A = { root: root, body: body, hips: hips, torso: torso, neck: neck, head: head, face: face, faceMat: fm, legL: legL, legR: legR, armL: armL, armR: armR, tails: [], coll: [], L1: 0.24, L2: 0.235, A1: 0.13, A2: 0.145, ank: 0.026, footX: 0.055, kind: 'person', fk: fk, fo: fo, hip: HIP, sock: { w: sockW }, gear: {},
      t: Math.random() * 10, phase: 0, speed: 0, mode: 'idle', modeT: 0, blinkT: 2 + Math.random() * 3, blink: 0, expr: 'open', exprHold: 0, yawPrev: 0, vPrev: 0, jumpY: 0, squash: 0 };
    root.userData.A = A; curvedAll(root); return A; }
  function build(kind, opt) { opt = opt || {}; if (kind === 'luna') return buildLuna(opt); if (kind === 'worker') return buildPerson(Object.assign({ hatKind: 'hard', vest: 0xf07a12 }, opt, { pal: Object.assign({ suit: 0x2b3550 }, opt.pal || {}) })); return buildPerson(opt); }

  /* ---------- the face, the expressions ---------- */
  function expr(A, kind, hold) { A.expr = kind; A.exprHold = hold || 0; setFace(A, kind); }
  function setFace(A, kind) { var t = faceTex(kind, A.fk, A.fo); if (A.faceMat.map !== t) { A.faceMat.map = t; A.faceMat.emissiveMap = t; } }

  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function wrapA(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
  var _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), IKO = { a: 0, g: 0, e: 0 };
  /* two-bone IK in the limb's parent space: (tx, ty, tz) from the limb's root to the target; the answer as the root's rotation.x (a) and
     rotation.z (g) (Euler XYZ: the roll first, then the swing) and the middle joint's rotation.x (e): sign +1 a knee, −1 an elbow */
  function ik2(tx, ty, tz, L1, L2, sign, out) { var D0 = Math.hypot(tx, ty, tz) || 1e-6, D = clamp(D0, Math.abs(L1 - L2) + 1e-4, L1 + L2 - 1e-4), f = D / D0; tx *= f; ty *= f; tz *= f;
    var e = Math.acos(clamp((D * D - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1)) * sign, hy = -L1 - L2 * Math.cos(e), hz = -L2 * Math.sin(e);
    var gm = Math.asin(clamp(-tx / (Math.abs(hy) > 1e-6 ? hy : -1e-6), -1, 1)), Y = hy * Math.cos(gm); out.a = wrapA(Math.atan2(tz, ty) - Math.atan2(hz, Y)); out.g = gm; out.e = e; return out; }
  function limbIK(A, limb, grp, tw, L1, L2, sign) { _b.copy(tw); grp.parent.worldToLocal(_b); _b.sub(grp.position); ik2(_b.x, _b.y, _b.z, L1, L2, sign, IKO); return [IKO.a, IKO.g, IKO.e]; }
  /* ---------- poses and motion ----------
     mode: idle | walk | run | wave | cheer | victory | peace | fall | jump | hop | sit | ride | drive | attack | roll | hurt
     A.speed: units per second over the ground. The feet are placed by IK: planted through the stance (they do not slide), lifted
     and carried through the swing, the stride matched to the speed; the pelvis turns with the leg in front and the shoulders against
     it; the arms swing with the opposite leg. On a vehicle (o.mount) the hands go to the grips or the wheel and the feet to the
     floor or the pedals. */
  function update(A, dt, o) {
    o = o || {}; A.t += dt; A.modeT += dt; var t = A.t, m = A.mode, mt = A.modeT, k = 1 - Math.exp(-dt * 12), kf = 1 - Math.exp(-dt * 20);
    A.spS = lerp(A.spS || 0, A.speed, 1 - Math.exp(-dt * 9)); var sp = A.spS, runA = clamp((sp - 3.0) / 2.2, 0, 1), walkA = clamp(sp / 1.0, 0, 1);
    var yaw = A.root.rotation.y, dyaw = wrapA(yaw - A.yawPrev); A.yawPrev = yaw; var turn = dt > 0 ? clamp(dyaw / dt, -6, 6) : 0;
    var stand = ['idle', 'walk', 'run', 'wave', 'peace', 'cheer', 'victory', 'hurt', 'heavy', 'combo2', 'guard', 'drink', 'parry', 'stagger', 'smoke', 'charge', 'thrust', 'hurl'].indexOf(m) >= 0 && !o.mount, moving = (m === 'walk' || m === 'run') && sp > 0.06;
    var g = { lean: 0, bodyX: 0, bodyY: 0, bodyZ: 0, hipsY: 0, torsoY: 0, spin: 0, aL: [0, 0.21, -0.14], aR: [0, -0.21, -0.14], hX: 0, hY: 0, hZ: 0, lL: [0, 0, 0], lR: [0, 0, 0], feet: null, hands: null };
    if (stand) {
      var cad = clamp(2.6 + 0.95 * sp, 2.6, 6.4), duty = lerp(0.6, 0.34, runA); if (moving) A.gp = ((A.gp || 0) + dt * cad / 2) % 1;
      A.strideS = lerp(A.strideS || 0, moving ? Math.min(1.25, 2 * sp * duty / cad) : 0, kf);
      var foot = function (off) { var ps = ((A.gp || 0) + off) % 1, st = ps < duty, z, h = 0, s2; if (st) { s2 = ps / duty; z = A.strideS * (0.5 - s2); } else { s2 = (ps - duty) / (1 - duty); var e2 = s2 * s2 * (3 - 2 * s2); z = A.strideS * (-0.5 + e2); h = ((0.045 + 0.09 * runA) * Math.sin(Math.PI * s2) + runA * 0.05 * Math.sin(Math.PI * Math.min(1, s2 * 1.6))) * walkA; } return { z: z, h: h, st: st, s: s2 }; };
      var fL = foot(0), fR = foot(0.5), stS = fL.st ? fL.s : fR.st ? fR.s : -1, bob = (stS >= 0 ? -Math.sin(Math.PI * stS) * (0.006 + 0.02 * runA) : 0.01 * runA) * walkA;
      g.bodyY = bob - 0.016 * runA - 0.005; var swL = A.strideS > 1e-3 ? fL.z / (A.strideS * 0.5) : 0, swR = A.strideS > 1e-3 ? fR.z / (A.strideS * 0.5) : 0;
      g.hipsY = -0.09 * swL * walkA * (0.6 + 0.4 * runA); g.torsoY = 0.075 * swL * walkA; g.lean = 0.04 * walkA + 0.17 * runA;
      var amp = (0.3 + 0.55 * runA) * walkA; g.aL = [-amp * swR, 0.21 + 0.06 * runA, -(0.16 + 0.12 * walkA + 1.05 * runA) - 0.25 * Math.max(0, swR) * walkA]; g.aR = [-amp * swL, -0.21 - 0.06 * runA, -(0.16 + 0.12 * walkA + 1.05 * runA) - 0.25 * Math.max(0, swL) * walkA];
      g.hX = -g.lean * 0.55 + bob * 1.2; g.bodyZ = clamp(-turn * sp * 0.025, -0.16, 0.16);
      var wi = 1 - walkA; if (wi > 0) { var ws = Math.sin(t * 0.55), br = Math.sin(t * 2.0); g.bodyX += ws * 0.012 * wi; g.bodyY += (-Math.abs(ws) * 0.006) * wi; g.bodyZ += -ws * 0.02 * wi; g.aL[1] += br * 0.012 * wi; g.aR[1] -= br * 0.012 * wi; g.hZ = (Math.sin(t * 0.7) * 0.04 + ws * 0.02) * wi; if (A.kind === 'luna') { var lk = Math.sin(t * 0.23); g.hY = (lk > 0.85 ? 0.35 : lk < -0.9 ? -0.3 : 0) * wi; } g.hX += Math.sin(t * 0.5) * 0.025 * wi; }
      g.feet = [[A.footX + 0.008 * wi, A.ank + fL.h, fL.z + 0.008 * wi], [-A.footX - 0.008 * wi, A.ank + fR.h, fR.z - 0.012 * wi]];
    }
    if (m === 'wave') { g.aR = [-0.15, -2.6 + Math.sin(t * 9) * 0.25, -0.3 + Math.sin(t * 9 + 0.8) * 0.22]; g.aL = [0, 0.22, -0.2]; g.hZ = 0.12; g.hX = -0.04; g.bodyY = Math.sin(t * 4.5) * 0.004 - 0.004; }
    if (m === 'peace') { g.aR = [-1.4, -1.2, -1.6]; g.aL = [0, 0.26, -0.2]; g.hZ = 0.16; g.bodyZ = -0.06; }
    if (m === 'cheer' || m === 'victory') { var c2 = Math.sin(mt * 10); g.aR = [0, -2.75 + c2 * 0.12, -0.15]; g.aL = [0, 2.75 - c2 * 0.12, -0.15]; g.bodyY = Math.max(0, Math.sin(mt * 8)) * 0.05; g.hX = -0.12; if (g.feet) { g.feet[0][1] += g.bodyY; g.feet[1][1] += g.bodyY; } }
    if (m === 'hurt') { var u4 = Math.min(1, mt / 0.5); g.lean = -0.3 * Math.sin(u4 * Math.PI); g.aL = [0, 0.7, -0.3]; g.aR = [0, -0.7, -0.3]; g.hX = 0.25; if (u4 >= 1) { A.mode = 'idle'; A.modeT = 0; } }
    if (m === 'fall') { g.aL = [-0.35, 1.6 + Math.sin(t * 3) * 0.12, -0.45]; g.aR = [-0.35, -1.6 - Math.sin(t * 3.3) * 0.12, -0.45]; g.lL = [0.25 + Math.sin(t * 2.5) * 0.15, 0.18, 0.85]; g.lR = [-0.12 - Math.sin(t * 2.7) * 0.15, -0.18, 0.35]; g.hX = -0.32; }
    /* (v68) the leap onto the glider, by phase o.leap.u (0 the take-off, 1 the deck): off the right foot with the left knee driven up and both
       arms swung up; tucked at the top of the flight, arms out wide for balance, the eyes on the board; the legs reaching down into her
       stance (the left foot forward) as she comes down onto it. The flight itself is the scene's (A.jumpY stays at rest). */
    if (m === 'leap') { var lp = (o.leap && o.leap.u) || 0, w1 = 1 - clamp(lp / 0.16, 0, 1), w3 = clamp((lp - 0.5) / 0.32, 0, 1), w2 = 1 - w1 - w3; w3 = w3 * w3 * (3 - 2 * w3);
      var mixP = function (a, b, c) { return a.map(function (x, i) { return x * w1 + b[i] * Math.max(0, w2) + c[i] * w3; }); }; A.jumpY = 0;
      g.lL = mixP([-1.15, 0.06, 1.25], [-1.3, 0.1, 1.7], [-0.62, 0.08, 0.78]); g.lR = mixP([0.42, -0.04, 0.38], [-0.95, -0.1, 1.75], [-0.12, -0.08, 0.62]);
      g.aL = mixP([-2.2, 0.32, -0.4], [-0.35, 1.35, -0.35], [-0.1, 1.2, -0.42]); g.aR = mixP([-2.2, -0.32, -0.4], [-0.35, -1.35, -0.35], [-0.1, -1.2, -0.42]);
      g.lean = 0.22 * w1 + 0.08 * Math.max(0, w2) + 0.14 * w3; g.hX = -0.1 * w1 + 0.12 * Math.max(0, w2) + 0.3 * w3; g.bodyY = 0; g.feet = null; }
    if (m === 'jump' || m === 'hop') { var u = Math.min(1, mt / (m === 'hop' ? 0.42 : 0.6)), sn = Math.sin(u * Math.PI); A.jumpY = sn * (m === 'hop' ? 0.45 : 0.7); g.lL = [-0.5 * sn, 0.05, 0.9 * sn + 0.05]; g.lR = [-0.3 * sn, -0.05, 0.9 * sn + 0.05]; g.aL = [0, 0.9, -0.6]; g.aR = [0, -0.9, -0.6]; if (u >= 1) { A.jumpY = 0; A.squash = 0.1; A.mode = o.after || 'idle'; A.modeT = 0; } }
    else if (m !== 'fall' && m !== 'leap') A.jumpY = lerp(A.jumpY, 0, k);
    if (m === 'sit') { g.lL = [-1.45, 0.06, 1.45]; g.lR = [-1.45, -0.06, 1.45]; g.bodyY = -(A.sitDrop != null ? A.sitDrop : 0.2); /* (v68) a rig of its own measures says how far its hips come down to a seat */ g.aL = [-0.4, 0.2, -0.5]; g.aR = [-0.4, -0.2, -0.5]; }
    if (m === 'attack') { var u2 = Math.min(1, mt / 0.42), sw2 = u2 < 0.35 ? -u2 / 0.35 : -1 + (u2 - 0.35) / 0.65 * 2.6; g.aR = [sw2 * 1.4 - 0.4, -0.5, -0.3]; g.aL = [0, 0.6, -0.4]; g.lean = 0.18 * Math.sin(u2 * Math.PI); g.lL = [0.4, 0.06, 0.1]; g.lR = [-0.3, -0.06, 0.3]; g.spin = -0.6 * Math.sin(u2 * Math.PI); if (u2 >= 1) { A.mode = 'idle'; A.modeT = 0; } }
    if (m === 'roll') { var u3 = Math.min(1, mt / 0.5); A.rollA = u3 * Math.PI * 2; g.lL = [-1.2, 0.05, 1.3]; g.lR = [-1.2, -0.05, 1.3]; g.aL = [-1.2, 0.2, -1.4]; g.aR = [-1.2, -0.2, -1.4]; g.hX = 0.6; g.bodyY = -0.12; if (u3 >= 1) { A.rollA = 0; A.mode = 'idle'; A.modeT = 0; } } else A.rollA = 0;
    /* the fighting moves of v33 (light, second light, heavy, charge, thrust, guard, parry, backstep, the flask) and two everyday ones (a smoke, a sip of coffee on a bench) */
    function endM(u) { if (u >= 1) { A.mode = 'idle'; A.modeT = 0; } }
    if (m === 'heavy') { var hu = Math.min(1, mt / (A.heavyT || 1.0)), wu = Math.min(1, hu / 0.42), su = clamp((hu - 0.42) / 0.16, 0, 1), ru = clamp((hu - 0.6) / 0.4, 0, 1), up = wu * wu * (3 - 2 * wu) * (1 - su), dn = su * (1 - ru);
      g.aR = [-2.7 * up + 0.9 * dn, -0.35, -0.7 * up - 0.15 * dn]; g.aL = [-2.6 * up + 0.8 * dn, 0.35, -0.7 * up - 0.15 * dn]; g.lean = -0.18 * up + 0.42 * dn; g.bodyY -= 0.06 * dn; g.hX = 0.15 * dn - 0.1 * up; g.spin = 0.1 * up; endM(hu); }
    if (m === 'charge') { var cu = Math.min(1, mt / 0.5), e3 = cu * cu * (3 - 2 * cu); g.aR = [-2.7 * e3, -0.4, -0.8 * e3]; g.aL = [-2.6 * e3, 0.4, -0.8 * e3]; g.lean = -0.2 * e3; g.bodyY -= 0.03 * e3 + Math.sin(t * 30) * 0.004; }
    if (m === 'combo2') { var c2u = Math.min(1, mt / 0.42), sw3 = c2u < 0.3 ? c2u / 0.3 : 1 - (c2u - 0.3) / 0.7 * 2.2; g.aR = [-1.2 - 0.2 * sw3, -1.5 * sw3 + 0.3, -0.35]; g.aL = [0, 0.6, -0.4]; g.spin = 0.7 * Math.sin(c2u * Math.PI); g.lean = 0.14 * Math.sin(c2u * Math.PI); endM(c2u); }
    if (m === 'thrust') { var tu = Math.min(1, mt / 0.45), ex = tu < 0.35 ? -tu / 0.35 : Math.min(1, (tu - 0.35) / 0.15) * (1 - Math.max(0, tu - 0.7) / 0.3); g.aR = [-1.45 + 0.1 * ex, -0.15, -1.4 + 1.35 * Math.max(0, ex) - 0.4 * Math.max(0, -ex)]; g.aL = [-1.2, 0.2, -1.0]; g.lean = 0.28 * Math.max(0, ex); endM(tu); }
    if (m === 'guard') { g.aL = [-1.3, 0.55, -1.55]; g.aR = [-0.55, -0.42, -0.95]; g.lean = 0.12; g.bodyY -= 0.035; g.hX = 0.06; }
    if (m === 'parry') { var pu = Math.min(1, mt / 0.38), sp4 = Math.sin(pu * Math.PI); g.aL = [-1.1, 0.35 + 1.25 * sp4, -0.7]; g.aR = [-0.5, -0.4, -0.9]; g.spin = -0.35 * sp4; endM(pu); }
    if (m === 'drink') { var du = Math.min(1, mt / 1.1), ds = Math.sin(Math.min(1, du * 1.25) * Math.PI); g.aR = [-1.55 * ds, -0.25, -2.1 * ds]; g.aL = [-0.2, 0.3, -0.4]; g.hX = -0.32 * ds; endM(du); }
    if (m === 'stagger') { var gu = Math.min(1, mt / 0.7), gs2 = Math.sin(gu * Math.PI); g.lean = -0.38 * gs2; g.aL = [0.3, 0.9 * gs2, -0.4]; g.aR = [0.3, -0.9 * gs2, -0.4]; g.hX = 0.3 * gs2; g.bodyZ = 0.12 * gs2; endM(gu); }
    if (m === 'backstep') { var bu = Math.min(1, mt / 0.38), bs = Math.sin(bu * Math.PI); A.jumpY = 0.12 * bs; g.lean = -0.25 * bs; g.lL = [0.5 * bs, 0.06, 0.6 * bs]; g.lR = [0.3 * bs, -0.06, 0.6 * bs]; g.aL = [0.4, 0.6, -0.5]; g.aR = [0.4, -0.6, -0.5]; endM(bu); }
    if (m === 'smoke') { var sc = (t % 7.0), at = sc < 1.8 ? Math.sin(Math.min(1, sc / 1.8) * Math.PI) : 0; g.aR = [-0.25 - 1.35 * at, -0.3 - 0.1 * at, -0.7 - 1.55 * at]; g.hX += -0.06 * at; }
    if (m === 'sip') { g.lL = [-1.45, 0.08, 1.45]; g.lR = [-1.45, -0.08, 1.45]; g.bodyY = -(A.sitDrop != null ? A.sitDrop : 0.2); g.feet = null; var sc2 = (t % 8.0), at2 = sc2 < 1.6 ? Math.sin(Math.min(1, sc2 / 1.6) * Math.PI) : 0; g.aR = [-0.75 - 0.85 * at2, -0.22, -1.0 - 1.3 * at2]; g.aL = [-0.55, 0.18, -0.75]; g.hX = 0.08 - 0.12 * at2; g.hY = Math.sin(t * 0.3) * 0.25; }
    /* (v68) the hurl, as a skimboard is thrown: both hands on the board's tail at the waist (the board pointing ahead), a crouch with the right
       foot back and the trunk turned a little to the right, then a lunge onto the left foot that pushes it forward and low, flat over the
       ground; the arms follow it out, then she rises. A.hurlT sets the length (default 1.1 s); the release is at 45 % of it */
    if (m === 'hurl') { var hT = A.hurlT || 1.1, hu = Math.min(1, mt / hT), wu = Math.min(1, hu / 0.38), su = clamp((hu - 0.38) / 0.14, 0, 1), ru = clamp((hu - 0.78) / 0.22, 0, 1), up = wu * wu * (3 - 2 * wu) * (1 - su), fw = su * (1 - ru * 0.6);
      g.aR = [-0.8 * up - 1.35 * fw, -0.2, -0.14 - 0.3 * up + 0.04 * fw]; g.aL = [-0.8 * up - 1.35 * fw, 0.2, -0.14 - 0.3 * up + 0.04 * fw]; g.lean = 0.22 * up + 0.42 * fw; g.hX = 0.15 * up + 0.05 * fw; g.bodyY -= 0.09 * up + 0.1 * fw; g.spin = 0.18 * up - 0.08 * fw;
      g.feet = [[A.footX + 0.02, A.ank, 0.05 * up + 0.45 * fw], [-A.footX - 0.03, A.ank, -0.22 * up - 0.3 * fw]]; if (hu >= 1) { A.mode = 'idle'; A.modeT = 0; } }
    /* (v42) on the chemistry glider: a low, wide stance (the left foot forward), arms out for balance, a sway with the air; o.surf: { bank, wave, look, point } */
    if (m === 'surf') { var sv = o.surf || {}, sw5 = Math.sin(t * 1.9), sb5 = Math.sin(t * 3.1); g.feet = [[A.footX + 0.07, A.ank, 0.15], [-A.footX - 0.07, A.ank, -0.13]]; g.bodyY = -0.085 + sb5 * 0.01; g.lean = 0.14; g.bodyZ = sw5 * 0.04 + (sv.bank || 0); g.hipsY = 0.22; g.torsoY = -0.16; g.aL = [0.1, 1.25 + sw5 * 0.1, -0.3]; g.aR = [0.1, -1.25 + sw5 * 0.1, -0.3]; g.hX = -0.12; g.hY = sv.look || -0.1;
      if (sv.wave) g.aR = [-0.15, -2.6 + Math.sin(t * 9) * 0.25, -0.3 + Math.sin(t * 9 + 0.8) * 0.22]; if (sv.point) g.aR = [-1.5, -0.3, -0.1];
      /* (v44) more of her on the board: crouched low for speed (knees deep, a hand on the rail), a hand shading her eyes to the horizon, arms
         flung wide, a fist punched up; sv.k blends the crouch */
      if (sv.crouch) { var ck = sv.crouch; g.bodyY -= 0.16 * ck; g.lean += 0.22 * ck; g.feet = [[A.footX + 0.1, A.ank, 0.2], [-A.footX - 0.09, A.ank, -0.18]]; g.aL = [-0.3 * ck + 0.1, 1.25 - 0.5 * ck, -0.3 - 0.4 * ck]; g.aR = [0.5 * ck + 0.1, -1.25 + 0.95 * ck, -0.3 - 1.2 * ck]; g.hX = -0.3 * ck; }
      if (sv.shade) { g.aR = [-2.05, -0.85, -2.25]; g.hX = -0.22; g.hY = (sv.look || 0) + 0.25; }
      if (sv.wide) { g.aL = [0.15, 1.6, -0.08]; g.aR = [0.15, -1.6, -0.08]; g.hX = -0.3; g.lean = 0.02; }
      if (sv.pump) { var pk = Math.sin(t * 11); g.aR = [-2.55 + pk * 0.15, -0.45, -1.55 + pk * 0.2]; g.hX = -0.25; } }
    /* (v43) seated on the grass: the knees up, the feet flat in front, leaning back a little on the hand behind her, the other hand resting on
       the knee; a slow breath, the head tilted; o.lawn: { wave } lifts the hand from the grass to wave */
    if (m === 'lawn') { var lw = o.lawn || {}, brl = Math.sin(t * 1.7), shl = A.seatH == null ? 0.09 : A.seatH;
      g.bodyY = -(A.hip - shl) + brl * 0.0015; g.lean = -0.12 + brl * 0.006; g.feet = A.lawnFeet || [[A.footX + 0.04, A.ank, 0.56], [-A.footX - 0.035, A.ank, 0.5]];
      g.hX = 0.05 + Math.sin(t * 0.31) * 0.02; g.hZ = 0.085 + Math.sin(t * 0.4) * 0.03; var hl = A.lawnHL || [0.1, 0.345, 0.385], hr = lw.wave ? [-0.25 + Math.sin(t * 9) * 0.045, 0.84, 0.1] : (A.lawnHR || [-0.225, 0.115, -0.125]);
      A._hl = A._hl || new THREE.Vector3(); A._hr = A._hr || new THREE.Vector3(); g.hands = [A.root.localToWorld(A._hl.set(hl[0], hl[1], hl[2])), A.root.localToWorld(A._hr.set(hr[0], hr[1], hr[2]))]; }
    if (o.mount) { var mo = o.mount; g.lean = mo.lean || 0; g.hX = mo.headX || -0.05; g.bodyZ = 0; g.hands = mo.hands; g.feet = null; g.feetW = mo.feet; g.aL = [-1.0, 0.25, -0.4]; g.aR = [-1.0, -0.25, -0.4]; if (mo.look) g.hY = mo.look; }
    /* apply: the body, the pelvis, the trunk, the head */
    A.squash = Math.max(0, A.squash - dt * 0.9); var by = g.bodyY + A.jumpY - A.squash * 0.22;
    A.body.position.y = (m === 'jump' || m === 'hop') ? by : lerp(A.body.position.y, by, kf); A.body.position.x = lerp(A.body.position.x, g.bodyX, k);
    A.body.scale.set(1 + A.squash * 0.5, 1 - A.squash, 1 + A.squash * 0.5); A.body.rotation.x = A.rollA || 0; A.body.rotation.y = lerp(A.body.rotation.y, g.spin, k); A.body.rotation.z = lerp(A.body.rotation.z, g.bodyZ, k);
    A.hips.rotation.y = lerp(A.hips.rotation.y, g.hipsY, kf); A.torso.rotation.y = lerp(A.torso.rotation.y, g.torsoY, kf);
    A.torso.rotation.x = lerp(A.torso.rotation.x, g.lean, k); A.torso.rotation.z = lerp(A.torso.rotation.z, -A.body.rotation.z * 0.4, k);
    A.head.rotation.x = lerp(A.head.rotation.x, g.hX, k * 0.7); A.head.rotation.z = lerp(A.head.rotation.z, g.hZ, k * 0.6); A.head.rotation.y = lerp(A.head.rotation.y, (o.look || 0) + g.hY, k * 0.4);
    A.root.updateMatrixWorld(true);
    /* the legs: by IK to the feet, or by the pose */
    var ikOn = !!(g.feet || g.feetW); A.ikW = clamp((A.ikW || 0) + (ikOn ? dt : -dt) * 7, 0, 1);
    [[A.legL, 0], [A.legR, 1]].forEach(function (q) { var L = q[0], tg = g.lL; if (q[1]) tg = g.lR;
      if (ikOn) { var tw = g.feetW ? g.feetW[q[1]] : A.root.localToWorld(_c.set(g.feet[q[1]][0], g.feet[q[1]][1], g.feet[q[1]][2])); tg = limbIK(A, L, L.piv, tw, A.L1, A.L2, 1); }
      var kk = ikOn && A.ikW >= 1 ? 1 : ikOn ? Math.max(k, A.ikW) : k; L.piv.rotation.x = lerp(L.piv.rotation.x, tg[0], kk); L.piv.rotation.z = lerp(L.piv.rotation.z, tg[1], kk); L.knee.rotation.x = lerp(L.knee.rotation.x, tg[2], kk);
      if (L.foot) L.foot.rotation.x = lerp(L.foot.rotation.x, ikOn ? -(L.piv.rotation.x + L.knee.rotation.x) * 0.85 : 0, kk); });
    /* the arms: to the grips by IK, or by the pose; never through the coat */
    /* (v36.2) a hand that holds something up (an umbrella, a guard, a stance) */ if (A.holdR && !g.hands && ['attack', 'combo2', 'thrust', 'heavy', 'parry', 'stagger', 'hurt', 'jump', 'roll'].indexOf(m) < 0) g.aR = A.holdR; if (A.holdL && !g.hands && ['attack', 'combo2', 'thrust', 'heavy', 'parry', 'stagger', 'hurt', 'jump', 'roll'].indexOf(m) < 0) g.aL = A.holdL;
    [[A.armL, g.aL, 0, 1], [A.armR, g.aR, 1, -1]].forEach(function (q) { var Ar = q[0], tg = q[1];
      if (g.hands) { tg = limbIK(A, Ar, Ar.sh, g.hands[q[2]], A.A1, A.A2, -1); }
      else if (Math.abs(tg[0]) < 0.6) tg = [tg[0], q[3] > 0 ? Math.max(tg[1], 0.17) : Math.min(tg[1], -0.17), tg[2]];
      var kk = (m === 'attack' || m === 'combo2' || m === 'thrust') && q[2] === 1 ? Math.min(1, k * 2.5) : (m === 'heavy' || m === 'parry') ? Math.min(1, k * 2.2) : g.hands ? kf : k; Ar.sh.rotation.x = lerp(Ar.sh.rotation.x, tg[0], kk); Ar.sh.rotation.z = lerp(Ar.sh.rotation.z, tg[1], kk); Ar.el.rotation.x = lerp(Ar.el.rotation.x, tg[2], kk); });
    /* the twin tails on their spring bones */
    springTails(A, dt, o);
    if (A.gear && A.gear.cape) { var cp = A.gear.cape; cp.rotation.x = lerp(cp.rotation.x, 0.1 + walkA * 0.35 + runA * 0.4 + (o.vehSpeed ? Math.min(1, o.vehSpeed / 12) * 0.9 : 0) + (m === 'fall' ? 1.2 : 0) + Math.sin(t * 3) * 0.03, k); }
    /* blink (a half-lid between open and closed), and the expressions that hold */
    if (A.exprHold > 0) { A.exprHold -= dt; if (A.exprHold <= 0) { A.expr = 'open'; setFace(A, 'open'); } }
    else { A.blinkT -= dt; if (A.blinkT <= 0) { A.blink = 0.16; A.blinkT = 2.2 + Math.random() * 3.2; } if (A.blink > 0) { A.blink -= dt; var bp = A.blink; setFace(A, bp > 0.12 || bp < 0.04 ? 'half' : bp > 0 ? 'closed' : A.expr); if (A.blink <= 0) setFace(A, A.expr); } }
  }
  /* the strands of the twin tails: chains of Verlet points, each pulled towards where the rigid strand would hang (less and less towards the
     tip), by gravity, by the air she moves through (the drag of her own speed, a flutter that grows with it), by the wind of a ride; kept at
     their lengths, kept from folding back on themselves, pushed out of the head, the back and the coat; the bones then turned to follow */
  var _v = new THREE.Vector3(), _w = new THREE.Vector3();
  function springTails(A, dt, o) {
    if (!A.tails.length || !A.tails[0].bones) return; var i, j, w = o.wind, rs = A.root.scale.x || 1, ultra = (A.lq || 0) >= 3;
    var cols = A.coll.map(function (c) { var ws = c.o.getWorldScale(_c).x; return { p: c.o.localToWorld(c.p.clone()), r: c.r * ws }; }); if (o.colliders) cols = cols.concat(o.colliders);
    /* her own motion through the air (the pivot's, so a turn of the head counts too) */ var pv = A.tails[0].piv.getWorldPosition(_v); if (!A.pPrev || dt <= 0) { A.pPrev = pv.clone(); A.vAir = new THREE.Vector3(); } else { _w.copy(pv).sub(A.pPrev).divideScalar(Math.max(dt, 1e-3)); var vl = _w.length(); if (vl > 14) _w.multiplyScalar(14 / vl); A.vAir.lerp(_w, 1 - Math.exp(-dt * 10)); A.pPrev.copy(pv); }
    var spd = A.vAir.length(), sub = ultra ? 2 : 1, h = dt / sub, gy = A.mode === 'fall' ? 2.4 : -3.6, tt = A.t || 0;
    A.tails.forEach(function (T) { var piv = T.piv, NB = T.bones.length, ws = piv.getWorldScale(_c).x, root = piv.localToWorld(_a.copy(T.rest[0])), kS = T.kS || 1, air = T.air || 1, ph = T.ph || 0;
      if (!T.p || T.p[0].distanceTo(root) > 0.5 || dt <= 0) { T.p = T.rest.map(function (r) { return piv.localToWorld(r.clone()); }); T.q = T.p.map(function (v) { return v.clone(); }); T.len = []; for (i = 1; i < NB; i++) T.len.push(T.rest[i].distanceTo(T.rest[i - 1]) * ws); T.rw = T.rest.map(function (r) { return r.clone(); }); }
      T.p[0].copy(root); T.q[0].copy(root); for (i = 1; i < NB; i++) piv.localToWorld(T.rw[i].copy(T.rest[i]));
      for (var st = 0; st < sub; st++) { var stiff = 1 - Math.exp(-h * 7.0 * kS), drag = 1 - Math.exp(-h * (5.0 + spd * 0.3));
        for (i = 1; i < NB; i++) { var P0 = T.p[i], Q0 = T.q[i], rw = T.rw[i], u = i / (NB - 1), vx = (P0.x - Q0.x) * (1 - drag), vy = (P0.y - Q0.y) * (1 - drag), vz = (P0.z - Q0.z) * (1 - drag), vm = Math.hypot(vx, vy, vz); if (vm > 0.05) { vx *= 0.05 / vm; vy *= 0.05 / vm; vz *= 0.05 / vm; } var nx = P0.x + vx, ny = P0.y + vy, nz = P0.z + vz, sk = stiff * (1.25 - u * 0.55);
          nx += (rw.x - P0.x) * sk; ny += (rw.y - P0.y) * sk + gy * h * h * (0.3 + 0.5 * u); nz += (rw.z - P0.z) * sk;
          /* the air: her speed pushes the strand back, more towards the tip; a flutter that grows with speed, each strand on its own phase */ var ak = air * h * h * (0.2 + 0.8 * u) * 1.1; nx -= A.vAir.x * ak; ny -= A.vAir.y * ak * 0.25; nz -= A.vAir.z * ak;
          if (spd > 0.3) { var fl = Math.min(1, spd / 5) * h * h * 0.8 * u; nx += Math.sin(tt * 11 + ph + i * 0.9) * fl; ny += Math.sin(tt * 8.5 + ph * 1.3 + i * 1.1) * fl * 0.7; nz += Math.cos(tt * 9.5 + ph + i * 0.7) * fl * 0.6; }
          if (w) { nx += w.x * h * h; ny += w.y * h * h; nz += w.z * h * h; }
          Q0.copy(P0); P0.set(nx, ny, nz); }
        for (j = 0; j < 3; j++) { for (i = 1; i < NB; i++) { var Pi = T.p[i]; _c.copy(Pi).sub(T.p[i - 1]).setLength(T.len[i - 1]); Pi.copy(T.p[i - 1]).add(_c);
            if (i >= 2) { /* no folding back: a point keeps away from the one before last */ _c.copy(Pi).sub(T.p[i - 2]); var d2 = _c.length(), mn = (T.len[i - 1] + T.len[i - 2]) * 0.82; if (d2 < mn && d2 > 1e-6) Pi.copy(T.p[i - 2]).add(_c.multiplyScalar(mn / d2)); }
            for (var ci = 0; ci < cols.length; ci++) { var c = cols[ci]; _c.copy(Pi).sub(c.p); var d = _c.length(), rr = c.r + 0.022 * rs; if (d < rr && d > 1e-6) Pi.copy(c.p).add(_c.multiplyScalar(rr / d)); } } } }
      for (i = 0; i < NB - 1; i++) { var bn = T.bones[i]; bn.parent.getWorldQuaternion(_q); _q.invert(); _a.copy(T.bones[i + 1].position).normalize(); _b.copy(T.p[i + 1]).sub(T.p[i]).normalize().applyQuaternion(_q); bn.quaternion.setFromUnitVectors(_a, _b); bn.updateMatrixWorld(true); } });
    /* the fringe's tuft and the side locks: on their pivots, a spring answering her motion, a small flutter at speed */
    if (A.sways && A.sways.length) { var vLoc = _w.copy(A.vAir); A.head.getWorldQuaternion(_q); _q.invert(); vLoc.applyQuaternion(_q);
      A.sways.forEach(function (S) { var tg = Math.max(-0.35, Math.min(0.35, -vLoc.z * 0.055 * S.amp / 0.05 + vLoc.y * 0.03)) + (spd > 0.3 ? Math.sin(tt * 12 + S.ph) * Math.min(1, spd / 5) * S.amp * 1.4 : 0) + Math.sin(tt * 1.3 + S.ph) * 0.012; var acc = (tg - S.a) * 90 - S.v * 11; S.v += acc * dt; S.a += S.v * dt; S.piv.rotation.x = S.a; S.piv.rotation.z = -vLoc.x * 0.04 * (S.amp / 0.05); }); } }
  function setMode(A, m) { if (A.mode === m) return; A.mode = m; A.modeT = 0; if (m === 'wave' || m === 'cheer' || m === 'victory' || m === 'peace') expr(A, 'happy', 1.6); if (m === 'fall') expr(A, 'wide', 999); if (m === 'attack') expr(A, 'shout', 0.5); if (m === 'hurt') expr(A, 'hurt', 0.8); }
  /* the gear: weapon, shield, cape (meshes built by PROPS), attached to the sockets */
  function setGear(A, slot, obj) { var sock = slot === 'w' ? A.sock.w : slot === 's' ? A.sock.s : A.sock.c; if (!sock) return; while (sock.children.length) sock.remove(sock.children[0]); if (obj) { sock.add(obj); curvedAll(obj); } A.gear[slot === 'c' ? 'cape' : slot] = obj || null; if (slot === 'c' && obj) A.gear.cape = obj; }

  /* ================= the orange droplet of the masking tape ================= */
  function droplet(o) {
    o = o || {}; var root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    var pts = [], i, n = 30; for (i = 0; i <= n; i++) { var a = i / n, y, r; if (a < 0.7) { var th = a / 0.7 * Math.PI * 0.62; y = 0.21 - Math.cos(th) * 0.21; r = Math.sin(th) * 0.25; } else { var u = (a - 0.7) / 0.3, r0 = Math.sin(Math.PI * 0.62) * 0.25, y0 = 0.21 - Math.cos(Math.PI * 0.62) * 0.21; y = y0 + u * 0.13; r = r0 * Math.pow(1 - u, 0.9); } pts.push([Math.max(0.0001, r), y]); }
    pts[0][0] = 0.0001; pts[n][0] = 0.0001; var g = lathe(pts, 36); var bm = mesh(g, toon(o.color || 0xf27c18), { ink: 0.008 }); body.add(bm);
    var fw = 1.9, fg = new THREE.SphereGeometry(1, 32, 16, Math.PI / 2 - fw / 2, fw, Math.PI * 0.32, Math.PI * 0.34); fg.scale(0.253, 0.215, 0.253); var c = document.createElement('canvas'); c.width = 256; c.height = 128; var x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(128, 64, 120, 58, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#2b2420'; x.beginPath(); x.ellipse(92, 62, 11, 16, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(164, 62, 11, 16, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(88, 56, 4, 0, 7); x.fill(); x.beginPath(); x.arc(160, 56, 4, 0, 7); x.fill(); x.strokeStyle = '#2b2420'; x.lineWidth = 4; x.beginPath(); x.arc(128, 80, 9, 0.2, Math.PI - 0.2); x.stroke();
    var ft = new THREE.CanvasTexture(c); ft.encoding = THREE.sRGBEncoding; var face = new THREE.Mesh(fg, new THREE.MeshToonMaterial({ map: ft, transparent: true, gradientMap: grad(), polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); face.position.y = 0.21; body.add(face);
    var em = mesh(emblemGeo(0.11, 0.1), toon(0xffffff), { ink: 0.004 }); em.position.set(0, 0.39, 0.1); em.rotation.x = -0.75; body.add(em);
    root.userData.D = { root: root, body: body, t: Math.random() * 10 }; curvedAll(root); return root.userData.D; }
  function updateDrop(D, dt) { D.t += dt; var h = Math.abs(Math.sin(D.t * 2.2)); D.body.position.y = h * 0.08; var sq = 1 - (1 - h) * 0.1; D.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); }

  return { build: build, update: update, setMode: setMode, setQuality: setQuality, quality: function () { return LQ; }, expr: expr, setGear: setGear, droplet: droplet, updateDrop: updateDrop, toon: toon, ink: inkOf, mesh: mesh, rbox: rbox, blob: blob, lathe: lathe, taper: taper, emblemGeo: emblemGeo, grad: grad, merge: merge, M4: M4, smoothProfile: smoothProfile, ctex: ctex, faceTex: faceTex, faceDecal: faceDecal, faceMat: faceMat, curvedAll: curvedAll, animeSkull: animeSkull, faceCanvas: faceCanvas };
})();


