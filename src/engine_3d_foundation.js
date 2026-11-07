/* ===== [engine_3d_foundation.js] 3D foundation: procedural surfaces, the renderer, tools ===== */
/* ===== 3D: one cracked reinforced-concrete component, used by the mechanism player, the inspection model and the simulator.
   Surfaces are painted procedurally (the page stays self-contained): formed concrete with blowholes and board marks,
   sawn faces with exposed aggregate, ribbed reinforcing steel, zinc-plated packers.
   Picture language of the brand is kept for everything that carries meaning: water cyan, active substance red. ===== */
var HAS3D = (function () {
  if (typeof THREE === 'undefined') return false;
  try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
})();

// colours are given as they should appear on screen; three converts them for lighting and back for display
if (HAS3D && THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
function screenColor(hex) { return new THREE.Color(hex); }

var W3 = { W: 2.0, H: 1.5, D: 0.25, G: 0.007, OFF: 0.05, N: 5, COVER: 0.04, BORE: 0.013 };
W3.CY = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5];
W3.CX = [0.02, -0.04, 0.035, -0.03, 0.04, -0.02, 0.01];
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function seg(t, a, b) { return clamp01((t - a) / (b - a)); }
function smooth(t) { return t * t * (3 - 2 * t); }
function lcg(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
// reinforcement: two mats, vertical bars 12 mm every 20 cm in the outer layer, horizontal bars 10 mm every 12.5 cm behind them.
// The injection holes are set out between the bars, as they are on site after locating the reinforcement.
W3.BARS_X = [-0.9, -0.7, -0.5, -0.3, -0.1, 0.1, 0.3, 0.5, 0.7, 0.9];
W3.BARS_Y = (function () { var a = [], k; for (k = 0; k < 12; k++) a.push(0.0625 + k * 0.125); return a; })();

/* ---------- procedural surfaces ---------- */
var SMALL3D = Math.min(window.innerWidth || 1280, (window.screen && screen.width) || 1280) < 760;
var PXM = SMALL3D ? 512 : 1024; // texture pixels per metre of wall face
function mkCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function greyNoise(w, h, rnd, lo, hi) {
  var c = mkCanvas(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data, i, v;
  for (i = 0; i < w * h; i++) { v = lo + rnd() * (hi - lo); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0); return c;
}
// soft clouds: value noise with smooth interpolation, 8 px per cell, then enlarged by the canvas
function smoothNoise(nx, ny, rnd, lo, hi, maxW, maxH) {
  var px = Math.max(1, Math.min(8, Math.floor(maxW / nx))), py = Math.max(1, Math.min(8, Math.floor(maxH / ny))), w = nx * px, h = ny * py, c = mkCanvas(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  var lat = new Float32Array((nx + 1) * (ny + 1)), i, x, y; for (i = 0; i < lat.length; i++) lat[i] = lo + rnd() * (hi - lo);
  var wx = new Float32Array(px), wy = new Float32Array(py); for (i = 0; i < px; i++) { x = (i + 0.5) / px; wx[i] = x * x * (3 - 2 * x); } for (i = 0; i < py; i++) { y = (i + 0.5) / py; wy[i] = y * y * (3 - 2 * y); }
  for (var cy = 0; cy < ny; cy++) for (var cx = 0; cx < nx; cx++) {
    var a = lat[cy * (nx + 1) + cx], b = lat[cy * (nx + 1) + cx + 1], c2 = lat[(cy + 1) * (nx + 1) + cx], d2 = lat[(cy + 1) * (nx + 1) + cx + 1];
    for (y = 0; y < py; y++) { var top = wy[y], o = ((cy * py + y) * w + cx * px) * 4; for (x = 0; x < px; x++) { var fx = wx[x], v = (a + (b - a) * fx) * (1 - top) + (c2 + (d2 - c2) * fx) * top; d[o] = d[o + 1] = d[o + 2] = v; d[o + 3] = 255; o += 4; } }
  }
  g.putImageData(im, 0, 0); return c;
}
function clouds(g, w, h, rnd, cellsX, cellsY, alpha, lo, hi, op) {
  var nx = Math.max(2, Math.round(cellsX)), ny = Math.max(2, Math.round(cellsY)), n = smoothNoise(nx, ny, rnd, lo, hi, w, h);
  g.save(); g.globalAlpha = alpha; g.globalCompositeOperation = op || 'overlay'; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'low'; g.drawImage(n, 0, 0, w, h); g.restore(); // the noise is smooth already, plain bilinear enlargement is enough
}
function canvasTex(c, o) {
  o = o || {}; var t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = o.wrap || THREE.ClampToEdgeWrapping; if (o.srgb !== false) t.encoding = THREE.sRGBEncoding; t.anisotropy = o.aniso || 8;
  if (o.repeat) t.repeat.set(o.repeat[0], o.repeat[1]); return t;
}

var TEX = (function () {
  var C = {}, MS = {};
  function once(k, f) { return function () { if (!C[k]) { var t0 = performance.now(); C[k] = f(); MS[k] = Math.round(performance.now() - t0); } return C[k]; }; }

  /* concrete face of one panel, 2.0 x 1.5 m: albedo and relief. 'formed' shows the board marks of the formwork, 'floated' the arcs of the float on a slab */
  function surface(kind) {
    return once('surface:' + kind, function () {
      var floated = kind === 'floated';
    var S = PXM, w = Math.round(W3.W * S), h = Math.round(W3.H * S), k = S / 1024, rnd = lcg(floated ? 17 : 11), i, y;
    var base = mkCanvas(w, h), g = base.getContext('2d'), bw = w >> 1, bh = h >> 1, bump = mkCanvas(bw, bh), b = bump.getContext('2d');
    g.fillStyle = '#aeaca6'; g.fillRect(0, 0, w, h); b.fillStyle = '#808080'; b.fillRect(0, 0, bw, bh);
    clouds(g, w, h, rnd, 3, 2, 0.55, 70, 186); clouds(g, w, h, rnd, 7, 5, 0.5, 66, 190); clouds(g, w, h, rnd, 18, 13, 0.36, 62, 194); clouds(g, w, h, rnd, 50, 38, 0.32, 70, 186); clouds(g, w, h, rnd, 140, 105, 0.3, 80, 176);
    clouds(g, w, h, rnd, 11, 8, 0.13, 120, 255, 'multiply'); // darker patches where the fresh concrete was denser
    clouds(b, bw, bh, rnd, 18, 13, 0.35, 70, 186); clouds(b, bw, bh, rnd, 50, 38, 0.4, 66, 190); clouds(b, bw, bh, rnd, 140, 105, 0.45, 60, 196);
    // board marks of the formwork: bands of slightly different tone, a fin at every joint, grain along the boards
    y = floated ? h : 0; while (y < h) {
      var bhgt = (0.105 + rnd() * 0.075) * S, tone = Math.round(128 + (rnd() - 0.5) * 40);
      g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.38; g.fillStyle = 'rgb(' + tone + ',' + tone + ',' + tone + ')'; g.fillRect(0, y, w, bhgt); g.restore();
      y += bhgt; if (y < h - 4) { g.fillStyle = 'rgba(58,56,54,.2)'; g.fillRect(0, y - 1, w, Math.max(1, 1.6 * k)); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(0, y + Math.max(1, 1.6 * k) - 1, w, Math.max(1, k)); b.fillStyle = 'rgba(235,235,235,.55)'; b.fillRect(0, y / 2 - 1, bw, Math.max(1, 1.4 * k)); }
    }
    if (!floated) { clouds(g, w, h, rnd, 26, h / 5, 0.16, 70, 186); clouds(g, w, h, rnd, 9, h / 14, 0.14, 70, 186); clouds(b, bw, bh, rnd, 26, bh / 4, 0.22, 70, 186); clouds(g, w, h, rnd, w / 5, 5, 0.13, 70, 186); } // grain along the boards, faint run-off from above
    else { g.save(); g.globalCompositeOperation = 'overlay'; b.save(); b.globalCompositeOperation = 'overlay'; for (i = 0; i < 90; i++) { var ax = rnd() * w, ay = rnd() * h, ar = (0.25 + rnd() * 0.5) * S, a0 = rnd() * 6.3; g.strokeStyle = i % 2 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.09)'; g.lineWidth = (0.006 + rnd() * 0.02) * S; g.beginPath(); g.arc(ax, ay, ar, a0, a0 + 0.6 + rnd() * 1.2); g.stroke(); b.strokeStyle = i % 2 ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.14)'; b.lineWidth = g.lineWidth / 2; b.beginPath(); b.arc(ax / 2, ay / 2, ar / 2, a0, a0 + 0.6 + rnd() * 1.2); b.stroke(); } g.restore(); b.restore(); } // arcs of the float
    clouds(g, w, h, rnd, 4, 3, 0.1, 150, 255, 'screen');                                             // laitance
    var grain = greyNoise(256, 256, rnd, 40, 215); g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.2; g.fillStyle = g.createPattern(grain, 'repeat'); g.fillRect(0, 0, w, h); g.restore();
    b.save(); b.globalCompositeOperation = 'overlay'; b.globalAlpha = 0.42; b.fillStyle = b.createPattern(grain, 'repeat'); b.fillRect(0, 0, bw, bh); b.restore();
    // blowholes
    var n = Math.round(520 * W3.W * W3.H);
    for (i = 0; i < n + 9; i++) {
      var px = rnd() * w, py = rnd() * h, r = (i < n ? 0.45 + 2.3 * Math.pow(rnd(), 4) : 2.6 + rnd() * 1.6) * k * 1.02; r = Math.max(0.6, r);
      g.fillStyle = 'rgba(36,34,32,' + (0.5 + rnd() * 0.35).toFixed(2) + ')'; g.beginPath(); g.ellipse(px, py, r * (0.85 + rnd() * 0.4), r, 0, 0, 7); g.fill();
      if (r > 1.3) { g.strokeStyle = 'rgba(255,255,255,.34)'; g.lineWidth = Math.max(0.8, r * 0.3); g.beginPath(); g.arc(px, py + r * 0.25, r, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); }
      b.fillStyle = 'rgba(0,0,0,.92)'; b.beginPath(); b.arc(px / 2, py / 2, Math.max(0.6, r / 2), 0, 7); b.fill();
    }
    // panel joint of the formwork along the edge
    g.strokeStyle = 'rgba(48,46,44,.3)'; g.lineWidth = Math.max(2, 3 * k); g.strokeRect(0, 0, w, h); g.strokeStyle = 'rgba(48,46,44,.1)'; g.lineWidth = Math.max(6, 12 * k); g.strokeRect(0, 0, w, h);
    b.strokeStyle = 'rgba(0,0,0,.6)'; b.lineWidth = Math.max(2, 3 * k); b.strokeRect(0, 0, bw, bh);

      return { base: base, bump: bump };
    })();
  }

  /* what a crack or joint leaves on the surface of its panel: dirt drawn into the edges, lime runs below it, chipped arrises, hairline branches.
     P is the path of the defect in panel coordinates (see pathInfo). */
  function face(P) {
    return once('face:' + P.id, function () {
      var S = PXM, w = Math.round(W3.W * S), h = Math.round(W3.H * S), k = S / 1024, i, base = surface(P.surface).base;
      var c = mkCanvas(w, h), f = c.getContext('2d'); f.drawImage(base, 0, 0);
      function X(x) { return (x + W3.W / 2) * S; } function Y(v) { return (W3.H - v) * S; }
      var q8 = 8, lw = Math.ceil(w / q8), lh = Math.ceil(h / q8), dirt = mkCanvas(lw, lh), dg = dirt.getContext('2d'), lime = mkCanvas(lw, lh), lg = lime.getContext('2d'), cr = lcg(53 + P.seed);
      dg.fillStyle = '#fff'; dg.fillRect(0, 0, lw, lh); dg.lineJoin = dg.lineCap = 'round'; dg.strokeStyle = '#5f5b55';
      [[0.24, 0.05], [0.15, 0.07], [0.08, 0.1], [0.04, 0.16], [0.018, 0.22]].forEach(function (q) { dg.globalAlpha = q[1]; dg.lineWidth = (q[0] + P.G * 2) * S / q8; dg.beginPath(); P.pts.forEach(function (p, j) { if (j) dg.lineTo(X(p[0]) / q8, Y(p[1]) / q8); else dg.moveTo(X(p[0]) / q8, Y(p[1]) / q8); }); if (P.closed) dg.closePath(); dg.stroke(); });
      if (P.gravity) for (i = 0; i < 13; i++) { // lime (sinter) runs below the defect
        var a = P.at(0.06 + cr() * 0.9), sy = a.y - P.G, sx = a.x + (cr() - 0.5) * 0.03, len = 0.1 + cr() * 0.4, wid = 0.0025 + cr() * 0.006, stp = 16, lean = (cr() - 0.5) * 0.03, ph = cr() * 6; if (sy < 0.12) continue;
        for (var st = 0; st < stp; st++) { var ff = st / stp, xx = sx + lean * ff + Math.sin(ff * 7 + ph) * 0.004, yy = sy - len * ff; if (yy < 0) break; lg.fillStyle = 'rgba(240,237,228,' + (0.4 * (1 - ff) * (1 - ff)).toFixed(3) + ')'; lg.beginPath(); lg.ellipse(X(xx) / q8, Y(yy) / q8, Math.max(0.5, wid * (1 - 0.5 * ff) * S / q8), len / stp * S / q8 * 0.9, 0, 0, 7); lg.fill(); }
      }
      f.save(); f.imageSmoothingEnabled = true; f.imageSmoothingQuality = 'high'; f.globalCompositeOperation = 'multiply'; f.drawImage(dirt, 0, 0, w, h); f.globalCompositeOperation = 'source-over'; f.globalAlpha = 0.8; f.drawImage(lime, 0, 0, w, h); f.restore();
      for (i = 0; i < 30; i++) { // chipped arrises
        var e = P.at(0.02 + cr() * 0.96), sd = cr() < 0.5 ? -1 : 1, ccx = X(e.x + sd * e.nx * P.G), ccy = Y(e.y + sd * e.ny * P.G), rr = (0.003 + cr() * 0.007) * S, nv = 6, a0 = cr() * 7;
        f.fillStyle = 'rgba(52,50,47,.5)'; f.beginPath(); for (var v = 0; v < nv; v++) { var an = a0 + v / nv * 6.283, rad = rr * (0.6 + cr() * 0.7), vx = ccx + Math.cos(an) * rad * (1 + Math.abs(e.ty) * 0.5), vy = ccy + Math.sin(an) * rad * (1 + Math.abs(e.tx) * 0.5); if (v) f.lineTo(vx, vy); else f.moveTo(vx, vy); } f.closePath(); f.fill();
      }
      f.strokeStyle = 'rgba(42,40,38,.55)'; f.lineWidth = Math.max(1, 1.2 * k); f.lineJoin = 'round';
      for (i = 0; i < 12; i++) { // hairline branches
        var o = P.at(0.05 + cr() * 0.9), dn = cr() < 0.5 ? -1 : 1, hx = o.x + dn * o.nx * P.G, hy = o.y + dn * o.ny * P.G, steps = 5 + Math.floor(cr() * 9);
        f.beginPath(); f.moveTo(X(hx), Y(hy)); for (var s2 = 0; s2 < steps; s2++) { var adv = 0.004 + cr() * 0.009, dr = (cr() - 0.3) * 0.012; hx += dn * o.nx * adv + o.tx * dr; hy += dn * o.ny * adv + o.ty * dr - (P.gravity ? 0.002 : 0); f.lineTo(X(hx), Y(hy)); } f.globalAlpha = 0.55 + cr() * 0.4; f.stroke();
      }
      f.globalAlpha = 1; return c;
    })();
  }

  /* where the surface gets damp: 1 on the defect, falling to 0 at the edge of the patch. The shader grows and dries the patch along this field.
     On a wall the water runs down from the defect; on a slab it spreads to all sides. */
  function dampMask(P) {
    return once('damp:' + P.id, function () {
      var w = 512, h = 384, c = mkCanvas(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data, rnd = lcg(91 + P.seed), N = 64, lat = [], i;
      for (i = 0; i < N * N; i++) lat.push(rnd());
      function L(a, b2) { return lat[((b2 % N + N) % N) * N + ((a % N + N) % N)]; }
      function vn(x, y) { var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); return (L(xi, yi) * (1 - fx) + L(xi + 1, yi) * fx) * (1 - fy) + (L(xi, yi + 1) * (1 - fx) + L(xi + 1, yi + 1) * fx) * fy; }
      function fbm(x, y) { return vn(x, y) * 0.55 + vn(x * 2.1 + 7.3, y * 2.1 + 3.1) * 0.3 + vn(x * 4.3 + 1.7, y * 4.3 + 9.2) * 0.15; }
      var runs = []; if (P.gravity) for (i = 0; i < 9; i++) { var a = P.at(0.05 + rnd() * 0.9); if (a.y > 0.3) runs.push({ y0: a.y, x0: a.x + (rnd() - 0.5) * 0.05, len: Math.min(a.y, 0.18 + rnd() * 0.5), wid: 0.018 + rnd() * 0.03, ph: rnd() * 6, sway: 0.006 + rnd() * 0.012 }); }
      var vert = P.axis === 'v';
      for (var py = 0; py < h; py++) {
        var y = W3.H * (1 - (py + 0.5) / h);
        for (var px = 0; px < w; px++) {
          var x = -W3.W / 2 + W3.W * (px + 0.5) / w, q = P.near(x, y), n1 = fbm(x * 5 + 3, y * 5), n2 = fbm(x * 17 + 20, y * 17 + 5), dd = Math.max(0, q.d - P.G);
          var half = P.gravity ? (vert ? (0.3 - 0.17 * (y / W3.H)) : (q.oy < 0 ? 0.12 + 0.34 * Math.min(1, -q.oy / (q.d + 1e-6)) : 0.07)) : 0.2;
          var m = vert || !P.gravity ? 1 - dd / (half * (0.45 + 1.1 * n1)) + (n2 - 0.5) * 0.6 : 1 - dd / (half * (0.75 + 0.5 * n1)) + (n2 - 0.5) * 0.3;
          if (P.gravity) { var mb = Math.max(0, 1 - y / (0.06 + 0.13 * n1)) * Math.max(0, 1 - Math.abs(x - q.px) / 0.7) * 1.2 + (n2 - 0.5) * 0.25; if (mb > m) m = mb; }
          for (i = 0; i < runs.length; i++) { var s = runs[i]; if (y < s.y0 && y > s.y0 - s.len) { var f = (s.y0 - y) / s.len, sx = s.x0 + Math.sin(f * 5 + s.ph) * s.sway, ms = (1 - Math.abs(x - sx) / (s.wid * (1 - 0.65 * f))) * (1 - f * f) * 0.85; if (ms > m) m = ms; } }
          var o = (py * w + px) * 4; d[o] = d[o + 1] = d[o + 2] = Math.round(clamp01(m) * 255); d[o + 3] = 255;
        }
      }
      g.putImageData(im, 0, 0); var t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; return t;
    })();
  }

  /* sawn face: cement paste, sand and coarse aggregate up to 32 mm, tiles every 0.5 m */
  /* the same grading also paints a gravel pocket: stones coated with paste, the space between them empty ('voids') or filled with resin ('resin') */
  function aggregate(kind) { kind = kind || 'sawn'; return once('aggregate:' + kind, function () {
    var pocket = kind !== 'sawn', T = SMALL3D || pocket ? 512 : 1024, mm = T / 500, c = mkCanvas(T, T), g = c.getContext('2d'), rnd = lcg(23), i;
    g.fillStyle = kind === 'voids' ? '#1a1715' : kind === 'resin' ? '#c4000d' : '#a9abab'; g.fillRect(0, 0, T, T);
    var grain = greyNoise(128, 128, rnd, 50, 205), pat = g.createPattern(grain, 'repeat');
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.3; g.fillStyle = pat; g.fillRect(0, 0, T, T); g.restore();
    var sand = ['#8f8a80', '#c8c2b4', '#6e6c69', '#b3a58c', '#d7d4cc', '#7d8188', '#9d8d78'];
    for (i = 0; i < (pocket ? 0 : 9000 * mm * mm); i++) { g.fillStyle = sand[Math.floor(rnd() * sand.length)]; g.globalAlpha = 0.45 + rnd() * 0.5; g.beginPath(); g.arc(rnd() * T, rnd() * T, (0.35 + rnd() * 0.9) * mm, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    var tones = ['#b0a189', '#a3957f', '#8f8372', '#c4bcab', '#8f9397', '#73787e', '#565a60', '#aaa59d', '#94796b', '#858c95', '#b8ad97', '#65615c', '#b9b6ae', '#7f7668', '#9a9c9e', '#6c7076'];
    var stones = [], classes = pocket ? [[90, 9, 15], [260, 5, 9], [420, 3, 5]] : [[64, 10, 16], [190, 5.5, 10], [520, 2.8, 5.5], [1100, 1.4, 2.8]];
    if (kind === 'resin') { g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.35; g.fillStyle = pat; g.fillRect(0, 0, T, T); g.restore(); }
    classes.forEach(function (cl) {
      for (var q = 0; q < cl[0]; q++) for (var tr = 0; tr < 30; tr++) {
        var r = (cl[1] + rnd() * (cl[2] - cl[1])) * mm, x = rnd() * T, y = rnd() * T, ok = true;
        for (var j = 0; j < stones.length; j++) { var s = stones[j], ddx = Math.abs(x - s[0]), ddy = Math.abs(y - s[1]); if (ddx > T / 2) ddx = T - ddx; if (ddy > T / 2) ddy = T - ddy; var lim = (r + s[2]) * 0.93 + 0.6 * mm; if (ddx * ddx + ddy * ddy < lim * lim) { ok = false; break; } }
        if (ok) { stones.push([x, y, r]); break; }
      }
    });
    function stone(x, y, r, tone, poly, rot, big) {
      g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
      var n = poly.length; for (var v = 0; v <= n; v++) { var p = poly[v % n], q2 = poly[(v + 1) % n], mx = (p[0] + q2[0]) / 2 * r, my = (p[1] + q2[1]) / 2 * r; if (!v) g.moveTo(mx, my); else g.quadraticCurveTo((p[0] * 1.18 - 0.18 * (p[0] + q2[0]) / 2) * r, (p[1] * 1.18 - 0.18 * (p[1] + q2[1]) / 2) * r, mx, my); }
      g.closePath(); g.fillStyle = tone; g.fill();
      if (big) { g.save(); g.clip(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.42; g.fillStyle = pat; g.fillRect(-r * 2, -r * 2, r * 4, r * 4); g.restore(); }
      if (pocket) { g.strokeStyle = '#a9aba9'; g.lineWidth = 1.5 * mm; g.stroke(); g.strokeStyle = 'rgba(30,28,26,.35)'; g.lineWidth = 0.4 * mm; g.stroke(); } else { g.strokeStyle = 'rgba(44,42,40,.22)'; g.lineWidth = Math.max(0.7, 0.4 * mm); g.stroke(); } g.restore();
    }
    stones.forEach(function (s) {
      var nv = 5 + Math.floor(rnd() * 5), poly = [], el = 1 + rnd() * rnd() * 1.1, a0 = rnd() * 7, rot = rnd() * 7, tone = tones[Math.floor(rnd() * tones.length)];
      for (var v = 0; v < nv; v++) { var an = a0 + v / nv * 6.283 + (rnd() - 0.5) * 0.5, rad = 0.66 + rnd() * 0.42; poly.push([Math.cos(an) * rad * Math.sqrt(el), Math.sin(an) * rad / Math.sqrt(el)]); }
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) { var X2 = s[0] + ox * T, Y2 = s[1] + oy * T; if (X2 > -s[2] * 1.4 && X2 < T + s[2] * 1.4 && Y2 > -s[2] * 1.4 && Y2 < T + s[2] * 1.4) stone(X2, Y2, s[2], tone, poly, rot, s[2] > 3 * mm); }
    });
    return c;
  })(); }

  /* ribbed reinforcing steel, 32 mm of bar per tile */
  var rebar = once('rebar', function () {
    var w = 64, h = 128, c = mkCanvas(w, h), g = c.getContext('2d'), bm = mkCanvas(w, h), b = bm.getContext('2d'), rnd = lcg(5), i;
    g.fillStyle = '#54453c'; g.fillRect(0, 0, w, h); b.fillStyle = '#585858'; b.fillRect(0, 0, w, h);
    for (i = 0; i < 520; i++) { g.fillStyle = ['#6f4c38', '#3b312c', '#7a5540', '#4a3d35', '#5f4a3f'][Math.floor(rnd() * 5)]; g.globalAlpha = 0.35 + rnd() * 0.4; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1 + rnd() * 3); }
    g.globalAlpha = 1; g.lineCap = b.lineCap = 'round';
    for (i = -1; i < 5; i++) [0, 1].forEach(function (half) {
      var x0 = half * 32 + 3, x1 = half * 32 + 29, y0 = i * 32 + (half ? 16 : 0), y1 = y0 + (half ? -12 : 12);
      b.strokeStyle = '#f0f0f0'; b.lineWidth = 5; b.beginPath(); b.moveTo(x0, y0); b.lineTo(x1, y1); b.stroke();
      g.strokeStyle = 'rgba(134,104,84,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = 'rgba(30,22,18,.45)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0 + 4); g.lineTo(x1, y1 + 4); g.stroke();
    });
    [0, 32].forEach(function (x) { b.fillStyle = '#f0f0f0'; b.fillRect(x - 2, 0, 4, h); b.fillRect(x + 62, 0, 4, h); g.fillStyle = 'rgba(134,104,84,.5)'; g.fillRect(x - 1, 0, 2, h); });
    return { map: c, bump: bm };
  });

  var stripes = once('stripes', function () { // thread of the packer rod, one pitch per tile
    var c = mkCanvas(4, 16), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 16); gr.addColorStop(0, '#202020'); gr.addColorStop(0.5, '#f0f0f0'); gr.addColorStop(1, '#202020'); g.fillStyle = gr; g.fillRect(0, 0, 4, 16); return c;
  });
  var flutes = once('flutes', function () { // helix of the drill bit
    var c = mkCanvas(64, 64), g = c.getContext('2d'), i; g.fillStyle = '#4a4b4e'; g.fillRect(0, 0, 64, 64); g.lineWidth = 11;
    for (i = -2; i < 4; i++) { g.strokeStyle = '#17181a'; g.beginPath(); g.moveTo(-4, i * 32); g.lineTo(68, i * 32 + 64); g.stroke(); g.strokeStyle = 'rgba(210,212,216,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-4, i * 32 + 8); g.lineTo(68, i * 32 + 72); g.stroke(); g.lineWidth = 11; }
    return c;
  });
  var trowel = once('trowel', function () { // trowelled epoxy paste
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rnd = lcg(71); g.fillStyle = '#c9c9c9'; g.fillRect(0, 0, 256, 256);
    clouds(g, 256, 256, rnd, 5, 5, 0.3, 80, 176); clouds(g, 256, 256, rnd, 28, 5, 0.22, 70, 186); clouds(g, 256, 256, rnd, 70, 14, 0.16, 70, 186); return c;
  });
  var mortar = once('mortar', function () {
    var c = mkCanvas(128, 128), g = c.getContext('2d'), rnd = lcg(19), i; g.fillStyle = '#b3b1ac'; g.fillRect(0, 0, 128, 128);
    clouds(g, 128, 128, rnd, 6, 6, 0.4, 70, 190); g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.35; g.fillStyle = g.createPattern(greyNoise(64, 64, rnd, 40, 215), 'repeat'); g.fillRect(0, 0, 128, 128); g.restore();
    for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(40,38,36,.5)'; g.beginPath(); g.arc(rnd() * 128, rnd() * 128, 0.6 + rnd() * 1.6, 0, 7); g.fill(); } return c;
  });
  var slab = once('slab', function () { // power-floated floor slab, 2 m per tile
    var s = SMALL3D ? 512 : 1024, c = mkCanvas(s, s), g = c.getContext('2d'), rnd = lcg(29); g.fillStyle = '#a2a19e'; g.fillRect(0, 0, s, s);
    clouds(g, s, s, rnd, 3, 3, 0.6, 70, 190); clouds(g, s, s, rnd, 9, 9, 0.45, 76, 180); clouds(g, s, s, rnd, 30, 30, 0.35, 80, 176); clouds(g, s, s, rnd, 110, 110, 0.25, 84, 172);
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.2; g.fillStyle = g.createPattern(greyNoise(256, 256, rnd, 40, 215), 'repeat'); g.fillRect(0, 0, s, s); g.restore(); return c;
  });
  var spall = once('spall', function () { // drilling dust and the chipped rim around a hole mouth
    var c = mkCanvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 9, 32, 32, 31); gr.addColorStop(0, 'rgba(226,224,218,.85)'); gr.addColorStop(0.35, 'rgba(214,212,206,.42)'); gr.addColorStop(1, 'rgba(214,212,206,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
  });
  function drop(prefix) { Object.keys(C).forEach(function (k) { if (k.indexOf(prefix) === 0) { if (C[k] && C[k].dispose) C[k].dispose(); delete C[k]; } }); }
  return { ms: MS, formed: function () { return surface('formed'); }, surface: surface, face: face, dampMask: dampMask, drop: drop, aggregate: aggregate, rebar: rebar, stripes: stripes, flutes: flutes, trowel: trowel, mortar: mortar, slab: slab, spall: spall };
})();

/* ---------- renderer, light, reflections ---------- */
var ENV_OK = true; // without reflections pure metal would turn black, so metal parts fall back to painted steel
function mt(v) { return ENV_OK ? v : Math.min(v, 0.3); }
function makeRenderer(canvas, bg) {
  var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'default' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); r.outputEncoding = THREE.sRGBEncoding; r.localClippingEnabled = true; r.setClearColor(screenColor(bg), 1);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  if (window.FAST3D) { r.setPixelRatio(0.2); r.shadowMap.enabled = false; } // automated checks of the sequence logic on machines without a GPU
  return r;
}
// Keeps the models fluent on weak graphics hardware: if the frames come too slowly, the resolution goes down first, then the shadows go.
// The verdict is shared, so the second and third model start at the level the first one settled on.
var QUALITY = { level: 0 };
function Governor(renderer, scene) {
  var n = 0, acc = 0, skip = 10, applied = 0;
  function apply() {
    while (applied < QUALITY.level) {
      applied++;
      if (applied === 1) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
      if (applied === 2) { renderer.shadowMap.enabled = false; scene.traverse(function (o) { if (o.material) [].concat(o.material).forEach(function (m) { m.needsUpdate = true; }); }); }
    }
  }
  this.sync = apply;
  this.tick = function (ms) {
    apply(); if (window.NO_GOV || QUALITY.level >= 2 || !(ms > 0) || ms > 1000) return;
    if (skip > 0) { skip--; return; }
    acc += ms; n++; if (n < 20) return;
    var avg = acc / n; n = 0; acc = 0;
    if (avg > 42) { QUALITY.level += (QUALITY.level === 0 && renderer.getPixelRatio() <= 1) ? 2 : 1; skip = 10; apply(); }
  };
}
// a neutral studio for the reflections on steel and on the wet surface: bright ceiling, grey walls, two soft boxes
function makeEnv(renderer) {
  if (window.FAST3D) return null;
  try {
    var pm = new THREE.PMREMGenerator(renderer), sc = new THREE.Scene(), c = mkCanvas(8, 128), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, '#c4c6c9'); gr.addColorStop(0.3, '#a2a4a7'); gr.addColorStop(0.5, '#77797c'); gr.addColorStop(0.58, '#505255'); gr.addColorStop(1, '#2c2e30'); g.fillStyle = gr; g.fillRect(0, 0, 8, 128);
    sc.add(new THREE.Mesh(new THREE.SphereGeometry(12, 24, 16), new THREE.MeshBasicMaterial({ map: canvasTex(c), side: THREE.BackSide })));
    [[5, 5, 6, 5, 3, 3.2], [-7, 3.5, 3, 3, 4, 1.8], [0, 7, -2, 6, 6, 1.4]].forEach(function (p) { var m = new THREE.Mesh(new THREE.PlaneGeometry(p[3], p[4]), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); m.material.color.setRGB(p[5], p[5], p[5]); m.position.set(p[0], p[1], p[2]); m.lookAt(0, 0.7, 0); sc.add(m); });
    var rt = pm.fromScene(sc, 0.035); pm.dispose(); sc.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    return rt.texture;
  } catch (e) { return null; }
}
function addLights(scene, renderer, o) {
  o = o || {};
  scene.environment = makeEnv(renderer); if (!scene.environment) ENV_OK = false;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8c8f, scene.environment ? 0.3 : 0.7));
  var d = new THREE.DirectionalLight(0xffffff, 0.95); d.position.set(2.3, 3.3, 3.9); d.target.position.set(0, 0.7, -0.1); scene.add(d, d.target);
  d.castShadow = true; d.shadow.mapSize.set(SMALL3D ? 1024 : 2048, SMALL3D ? 1024 : 2048);
  var sc = d.shadow.camera; sc.left = -2.3; sc.right = 2.3; sc.top = 2.2; sc.bottom = -1.6; sc.near = 0.5; sc.far = 12; sc.updateProjectionMatrix();
  d.shadow.bias = -0.0004; d.shadow.normalBias = 0.012; d.shadow.radius = 3.5;
  var f = new THREE.DirectionalLight(0xffffff, 0.22); f.position.set(-3, 1.6, 2.4); scene.add(f);
  // the brand-grey ground stays flat; only the shadow is drawn on it
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: o.ground || 0xd9dadc, toneMapped: false })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  var sh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.11 })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; sh.receiveShadow = true; sh.renderOrder = -1; scene.add(sh);
  d.userData.groundAt = function (y) { ground.position.y = y; sh.position.y = y + 0.002; }; d.userData.ground = ground; d.userData.shadow = sh;
  return d;
}

function fitRenderer(r, cam, host) {
  var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return false;
  var c = r.domElement; if (c.width !== Math.floor(w * r.getPixelRatio()) || c.height !== Math.floor(h * r.getPixelRatio())) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  return true;
}
function orbitPos(cam, target, az, el, dist) {
  var a = az * Math.PI / 180, e = el * Math.PI / 180;
  cam.position.set(target.x + dist * Math.sin(a) * Math.cos(e), target.y + dist * Math.sin(e), target.z + dist * Math.cos(a) * Math.cos(e)); cam.lookAt(target);
}
function crom(times, vals, t) {
  var n = times.length; if (t <= times[0]) return vals[0]; if (t >= times[n - 1]) return vals[n - 1];
  var i = 0; while (i < n - 2 && t > times[i + 1]) i++;
  var t1 = times[i], t2 = times[i + 1], p1 = vals[i], p2 = vals[i + 1], p0 = vals[Math.max(i - 1, 0)], p3 = vals[Math.min(i + 2, n - 1)], t0 = times[Math.max(i - 1, 0)], t3 = times[Math.min(i + 2, n - 1)], dt = t2 - t1;
  var m1 = (t2 - t0) > 0 ? (p2 - p0) / (t2 - t0) * dt : 0, m2 = (t3 - t1) > 0 ? (p3 - p1) / (t3 - t1) * dt : 0, s = (t - t1) / dt, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p1 + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * p2 + (s3 - s2) * m2;
}

/* ---------- tools. Each tool points along +y with its tip at the origin; "inner" is turned so that the handle hangs down. ---------- */
function shadowAll(g) { g.traverse(function (o) { if (o.isMesh) o.castShadow = true; }); return g; }
function toolDrill() {
  var g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.userData.inner = inner;
  var housing = new THREE.MeshStandardMaterial({ color: 0x2c2e31, roughness: 0.52, metalness: 0.05 }), alu = new THREE.MeshStandardMaterial({ color: 0x9da0a4, roughness: 0.4, metalness: mt(0.9) }), soft = new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.85 });
  var fl = TEX.flutes(), bitM = new THREE.MeshStandardMaterial({ map: canvasTex(fl, { wrap: THREE.RepeatWrapping, repeat: [1, 9] }), bumpMap: canvasTex(fl, { wrap: THREE.RepeatWrapping, repeat: [1, 9], srgb: false }), bumpScale: 0.003, roughness: 0.42, metalness: mt(0.85) });
  var bit = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.31, 14), bitM); bit.position.y = -0.155; inner.add(bit); g.userData.bit = bit;
  var tip = new THREE.Mesh(new THREE.ConeGeometry(0.0115, 0.014, 14), alu); tip.position.y = 0.006; inner.add(tip);
  var pts = [[0.0115, -0.3], [0.02, -0.304], [0.0225, -0.33], [0.027, -0.342], [0.027, -0.372], [0.02, -0.378]].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
  inner.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 24), soft));
  var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 24), alu); barrel.position.y = -0.425; inner.add(barrel);
  var collar = new THREE.Mesh(new THREE.TorusGeometry(0.0365, 0.006, 12, 24), soft); collar.rotation.x = Math.PI / 2; collar.position.y = -0.405; inner.add(collar);
  var side = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0155, 0.12, 14), soft); side.rotation.x = Math.PI / 2; side.position.set(0, -0.405, 0.1); inner.add(side);
  // side view of the machine: x points down, y runs along the bit
  var sh = new THREE.Shape(); [[-0.038, -0.47], [-0.038, -0.655], [-0.018, -0.7], [0.148, -0.7], [0.168, -0.675], [0.168, -0.5], [0.15, -0.47]].forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); }); sh.closePath();
  var op = new THREE.Path(); [[0.05, -0.6], [0.125, -0.6], [0.125, -0.662], [0.05, -0.662]].forEach(function (p, k) { if (k) op.lineTo(p[0], p[1]); else op.moveTo(p[0], p[1]); }); op.closePath(); sh.holes.push(op);
  var body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.058, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.007, bevelSegments: 3 }), housing); body.position.z = -0.029; inner.add(body);
  var trig = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.02), soft); trig.position.set(0.075, -0.655, 0); inner.add(trig);
  var vent = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.074), soft); vent.position.set(0.105, -0.535, 0); inner.add(vent);
  return shadowAll(g);
}
function toolLance() {
  var g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.userData.inner = inner;
  var housing = new THREE.MeshStandardMaterial({ color: 0x2c2e31, roughness: 0.5 }), steel = new THREE.MeshStandardMaterial({ color: 0xb4b7bb, roughness: 0.35, metalness: mt(1) }), soft = new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.8 });
  var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.36, 16), steel); tube.position.y = -0.1; inner.add(tube);
  var sh = new THREE.Shape(); [[-0.018, -0.275], [-0.018, -0.36], [0.108, -0.392], [0.116, -0.35], [0.024, -0.318], [0.024, -0.275]].forEach(function (p, k) { if (k) sh.lineTo(p[0], p[1]); else sh.moveTo(p[0], p[1]); }); sh.closePath();
  var body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 }), housing); body.position.z = -0.011; inner.add(body);
  var trig = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.008, 0.012), steel); trig.position.set(0.048, -0.305, 0); trig.rotation.z = -0.35; inner.add(trig);
  var curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.112, -0.372, 0), new THREE.Vector3(0.2, -0.4, 0), new THREE.Vector3(0.48, -0.47, 0.03), new THREE.Vector3(1.0, -0.7, 0.08)]);
  inner.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.006, 14, false), soft));
  return shadowAll(g);
}
var _av = HAS3D ? new THREE.Vector3() : null, _aq = HAS3D ? new THREE.Quaternion() : null;
function aimTool(tool, h) { // along the hole; the handle hangs down, whatever the direction of the hole
  var w = h.w || h; tool.quaternion.copy(w.quat);
  _av.set(0, -1, 0).addScaledVector(w.dir, w.dir.y); if (_av.lengthSq() < 0.02) _av.set(0.9, 0, 0.45);
  _av.normalize().applyQuaternion(_aq.copy(w.quat).invert()); tool.userData.inner.rotation.y = Math.atan2(-_av.z, _av.x);
}
var _pgrid = null;
function packerGrid() { // relief of the rubber sleeve: one raised pad per tile, grooves around it
  if (_pgrid) return _pgrid; var c = mkCanvas(64, 64), g = c.getContext('2d'); g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, 64, 64); var gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, '#f2f2f2'); gr.addColorStop(1, '#cfcfcf'); g.fillStyle = gr; g.fillRect(6, 5, 52, 54); g.strokeStyle = '#8a8a8a'; g.lineWidth = 3; g.strokeRect(6, 5, 52, 54); return (_pgrid = c);
}
function hoseFor(h, o) { // from the nipple down to the floor and away to the pump; o.floor is the floor level, o.box keeps the hose on a slab
  o = o || {}; var w = h.w || h, fy = (o.floor || 0) + 0.02, g = new THREE.Group(), a = w.mouth.clone().addScaledVector(w.dir, -((h.nip || 0.089) - 0.001)), b = a.clone().addScaledVector(w.dir, -0.16);
  var c = new THREE.Vector3(b.x + 0.22, Math.max(fy, b.y - 0.45), b.z + 0.36), d = new THREE.Vector3(c.x + 0.35, fy, c.z + 0.45);
  if (o.box) [c, d].forEach(function (v) { v.x = Math.max(o.box[0], Math.min(o.box[1], v.x)); v.z = Math.max(o.box[2], Math.min(o.box[3], v.z)); });
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a.clone().addScaledVector(w.dir, -0.03), b, c, d]), 32, 0.0075, 14, false), new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.62 })));
  var cp = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0095, 0.04, 14), new THREE.MeshStandardMaterial({ color: 0xb4b7bb, roughness: 0.35, metalness: mt(1) })); cp.quaternion.copy(w.quat); cp.position.copy(a).addScaledVector(w.dir, -0.014); g.add(cp);
  return shadowAll(g);
}
function dustPoints() {
  var n = 70, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), seeds = [];
  for (var i = 0; i < n; i++) seeds.push([Math.random(), Math.random() * 2 - 1, Math.random() * 2 - 1]);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9d9b96, size: 0.013, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false })); p.userData.seeds = seeds; p.frustumCulled = false; return p;
}
function puff(points, h, phase) { // phase 0..1: what comes out of the hole, thrown back along it and falling
  var pos = points.geometry.attributes.position, s = points.userData.seeds, w = h.w || h;
  for (var i = 0; i < s.length; i++) { var f = (phase * 1.5 + s[i][0]) % 1, r = 0.02 + f * 0.22; pos.setXYZ(i, w.mouth.x - w.dir.x * r + s[i][1] * 0.05 * f, w.mouth.y - w.dir.y * r + s[i][2] * 0.06 * f - f * f * 0.05, w.mouth.z - w.dir.z * r * 0.9 + s[i][1] * s[i][2] * 0.04 * f + 0.01); }
  pos.needsUpdate = true; points.material.opacity = 0.85 * (1 - phase * 0.4);
}

