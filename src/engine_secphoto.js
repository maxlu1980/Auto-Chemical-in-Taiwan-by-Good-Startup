/* ===== [engine_secphoto.js] SecPhoto: the photographic canvas kit ===== */
var SecPhoto = (function () {
  var R = { x: 0, y: 14, w: 560, h: 382 }, MM = 0.88;
  var K = 0, W = 0, H = 0, bases = {}, baseOrder = [], urls = {}, urlOrder = [], dead = false, checked = false, GEO = {};

  function setup() { if (K) return; var small = Math.min(window.innerWidth || 1280, (window.screen && screen.width) || 1280) < 760; K = small ? 2 : ((window.devicePixelRatio || 1) > 1.3 ? 2.5 : 2); W = Math.round(R.w * K); H = Math.round(R.h * K); }
  function units(g) { g.setTransform(K, 0, 0, K, -R.x * K, -R.y * K); }
  function pixels(g) { g.setTransform(1, 0, 0, 1, 0, 0); }
  function frame(g, x, y, deg, fn, alpha, flip) { g.save(); g.translate(x, y); g.rotate(deg * Math.PI / 180); if (flip) g.scale(-1, 1); if (alpha != null) g.globalAlpha *= alpha; fn(); g.restore(); }

  /* ---------- geometry of the section types ---------- */
  // a crack or joint from the water end to the accessible end: irregular, opening and closing along its way
  function buildCrack(ctrl, seed, w0, w1, rough) {
    var rnd = lcg(seed), n1 = [], n2 = [], i, pts = [], len = 0, segs = [];
    for (i = 0; i < 90; i++) { n1.push(rnd()); n2.push(rnd()); }
    function nz(a, t) { var k = Math.floor(t), f = t - k; f = f * f * (3 - 2 * f); return a[k % 90] * (1 - f) + a[(k + 1) % 90] * f; }
    for (i = 1; i < ctrl.length; i++) { var dx = ctrl[i][0] - ctrl[i - 1][0], dy = ctrl[i][1] - ctrl[i - 1][1], l = Math.sqrt(dx * dx + dy * dy); segs.push({ a: ctrl[i - 1], l: l, tx: dx / l, ty: dy / l, s: len }); len += l; }
    var steps = Math.round(len / 2), ax = ctrl[ctrl.length - 1][0] - ctrl[0][0], ay = ctrl[ctrl.length - 1][1] - ctrl[0][1], al = Math.sqrt(ax * ax + ay * ay), NX = -ay / al, NY = ax / al; // one normal for the whole path keeps the lips from crossing
    for (i = 0; i <= steps; i++) {
      var s = len * i / steps, k = 0; while (k < segs.length - 1 && s > segs[k + 1].s) k++; var sg = segs[k], u = s - sg.s, t = i * 2;
      var off = (i === 0 || i === steps) ? 0 : (nz(n1, t / 8) - 0.5) * 5.5 * rough + (rnd() - 0.5) * 1.5 * rough, hw = w0 + w1 * nz(n2, t / 13) + (i > steps - 6 ? (i - steps + 6) * 0.2 * rough : 0) + (i < 4 ? (4 - i) * 0.18 * rough : 0);
      pts.push({ x: sg.a[0] + sg.tx * u + NX * off, y: sg.a[1] + sg.ty * u + NY * off, nx: NX, ny: NY, tx: ax / al, ty: ay / al, l: hw * (0.75 + rnd() * 0.5), r: hw * (0.75 + rnd() * 0.5) });
    }
    var br = []; for (i = 0; i < Math.round(9 * rough); i++) { var k0 = 8 + Math.floor(rnd() * (steps - 16)), d = rnd() < 0.5 ? -1 : 1, p = pts[k0], bx = p.x + d * NX * (d < 0 ? p.l : p.r), by = p.y + d * NY * (d < 0 ? p.l : p.r), seg = [[bx, by]], st = 4 + Math.floor(rnd() * 7); for (var j = 0; j < st; j++) { var adv = 1.2 + rnd() * 2.6, dr = (rnd() - 0.35) * 3.2; bx += d * NX * adv + (ax / al) * dr; by += d * NY * adv + (ay / al) * dr; seg.push([bx, by]); } br.push(seg); }
    function near(x, y) { var best = 1e9; for (var q = 0; q < pts.length; q += 2) { var ddx = pts[q].x - x, ddy = pts[q].y - y, dd = ddx * ddx + ddy * ddy; if (dd < best) best = dd; } return Math.sqrt(best); }
    return { pts: pts, n: pts.length, branches: br, near: near, at: function (f) { return pts[Math.max(0, Math.min(pts.length - 1, Math.round(f * (pts.length - 1))))]; } };
  }
  function geometry(type) {
    if (GEO[type]) return GEO[type];
    var g, wallCrack = [[278, 80], [287, 112], [274, 150], [285, 190], [276, 232], [284, 268], [279, 300]];
    if (type === 'W' || type === 'G') g = {
      conc: [{ x: 20, y: 80, w: 520, h: 220, formed: 'tb', wet: 't', seed: 131 }], water: type === 'G' ? { kind: 'none' } : { kind: 'free', x: 20, y: 30, w: 520, h: 50 }, bench: true, // adhesive packers: no standing water, the far side is only damp
      cracks: [buildCrack(wallCrack, 77, 1.05, 2.2, 1)], bars: [[192, 120.3], [368, 120.3], [192, 259.7], [368, 259.7]],
      holes: type === 'G' ? [] : [{ mx: 221, my: 300, ang: 45, len: 148 }, { mx: 337, my: 300, ang: -45, len: 148, ghost: true }], glued: type === 'G' ? [{ mx: 279, my: 300, ang: 0 }] : null,
      seals: [{ x: 279, y: 300, rot: 0, a: -75, b: 75 }], out: { x: 279, y: 300, rot: 0 }, hose: function (sx, sy) { return [[sx - 8, sy + 28, 168, 382, 96, 377], [60, 374.5, 30, 371, 0, 369]]; }
    };
    else if (type === 'S') g = {
      conc: [{ x: 20, y: 96, w: 520, h: 220, formed: 'tb', wet: 'b', seed: 151 }], water: { kind: 'ground', x: 20, y: 316, w: 520, h: 80 },
      cracks: [buildCrack(wallCrack.map(function (p) { return [p[0], 396 - p[1]]; }), 79, 1.05, 2.2, 1)], bars: [[192, 135.7], [368, 135.7], [192, 276.3], [368, 276.3]],
      holes: [{ mx: 221, my: 96, ang: 135, len: 148 }, { mx: 337, my: 96, ang: -135, len: 148, ghost: true }],
      seals: [{ x: 279, y: 96, rot: 180, a: -75, b: 75 }], out: { x: 279, y: 96, rot: 180 }, hose: function (sx, sy) { return [[sx - 16, sy - 22, sx - 60, 62, 120, 87], [85, 94, 40, 93, 0, 93]]; }
    };
    else if (type === 'V') g = { // vertical cut through a wall with a horizontal joint or crack: ground water on the left, the accessible face on the right
      conc: [{ x: 150, y: 20, w: 220, h: 376, formed: 'lr', wet: 'l', seed: 191 }], water: { kind: 'ground', x: 0, y: 40, w: 150, h: 356, table: 92, surface: true },
      cracks: [buildCrack([[150, 213], [186, 205], [226, 216], [262, 206], [300, 215], [338, 207], [370, 210]], 101, 1.05, 2.1, 1)], bars: [[190.3, 60], [190.3, 160], [190.3, 260], [190.3, 360], [329.7, 60], [329.7, 160], [329.7, 260], [329.7, 360]], starters: [200.9, 319.1], startersTo: 396,
      holes: [{ mx: 370, my: 152, ang: -135, len: 148 }, { mx: 370, my: 268, ang: -45, len: 148, ghost: true }],
      seals: [{ x: 370, y: 210, rot: -90, a: -75, b: 75 }], out: { x: 370, y: 210, rot: -90 }, hose: function (sx, sy) { return [[sx + 24, sy - 24, sx + 66, sy + 30, sx + 68, 210], [sx + 70, 300, 476, 356, 486, 396]]; }
    };
    else if (type === 'P') g = {
      conc: [{ x: 20, y: 96, w: 210, h: 220, formed: 'tbr', wet: 'b', seed: 157 }, { x: 330, y: 96, w: 210, h: 220, formed: 'tbl', wet: 'b', seed: 163 }], pipe: { x0: 232, x1: 328, wall: 17, y0: 20, y1: 396 }, water: { kind: 'ground', x: 20, y: 316, w: 520, h: 80 },
      cracks: [buildCrack([[231, 316], [231, 96]], 83, 0.8, 0.5, 0.12), buildCrack([[329, 316], [329, 96]], 89, 0.8, 0.5, 0.12)], bars: [[96, 135.7], [96, 276.3], [464, 135.7], [464, 276.3]],
      holes: [{ mx: 141, my: 96, ang: 135, len: 128 }, { mx: 419, my: 96, ang: -135, len: 128 }],
      seals: [{ x: 232, y: 96, rot: 180, a: 0, b: 76, up: true }, { x: 328, y: 96, rot: 180, a: 0, b: 76, up: true, flip: true }], out: { x: 231, y: 96, rot: 180 }, hose: function (sx, sy) { return [[sx - 16, sy - 22, sx - 50, 58, 70, 87], [50, 94, 25, 93, 0, 93]]; }
    };
    else g = { // J and H: the wall stands on the slab
      conc: [{ x: 150, y: 20, w: 220, h: 270, formed: 'lr', wet: 'l', seed: 173, pocket: type === 'H' }, { x: 40, y: 290, w: 500, h: 106, formed: 't', wet: 't', wetTo: 150, seed: 179 }], water: { kind: 'ground', x: 0, y: 64, w: 150, h: 332, table: 112, surface: true },
      cracks: [buildCrack(type === 'H' ? [[150, 262], [370, 262]] : [[150, 290], [370, 290]], 97, 0.9, 1.1, type === 'H' ? 0 : 0.22)], bars: [[190.3, 84], [190.3, 196], [329.7, 84], [329.7, 176], [104, 330.3], [452, 330.3]], starters: [200.9, 319.1],
      holes: [type === 'H' ? { mx: 370, my: 186, ang: -135, len: 118 } : { mx: 370, my: 180, ang: -135, len: 186 }],
      seals: type === 'H' ? [{ x: 370, y: 290, rot: -90, a: 0, b: 96, up: true }, { x: 370, y: 290, rot: 180, a: 0, b: 40, up: true, flip: true }] : [{ x: 370, y: 290, rot: -90, a: 0, b: 66, up: true }, { x: 370, y: 290, rot: 180, a: 0, b: 66, up: true, flip: true }],
      out: { x: 370, y: type === 'H' ? 262 : 290, rot: -90 }, corner: true, hose: function (sx, sy) { return [[sx + 22, sy - 6, sx + 40, 270, sx + 70, 284], [sx + 100, 288, 500, 287, 560, 286]]; }
    };
    if (type === 'H') { var pr = lcg(211), top = [], x; for (x = 150; x <= 370; x += 10) top.push([x, 232 + (pr() - 0.5) * 16 + (x < 200 || x > 330 ? 6 : 0)]); g.pocket = [[150, 290]].concat(top, [[370, 290]]); }
    g.type = type; return (GEO[type] = g);
  }

  /* ---------- the sawn face ---------- */
  function stoneShape(q, rnd, r, crushed) { var nv = 6 + Math.floor(rnd() * 6), el = 1 + rnd() * rnd(), a0 = rnd() * 7, poly = [], v; for (v = 0; v < nv; v++) { var an = a0 + v / nv * 6.283 + (rnd() - 0.5) * 0.5, rad = (crushed ? 0.62 : 0.74) + rnd() * (crushed ? 0.44 : 0.3); poly.push([Math.cos(an) * rad * Math.sqrt(el), Math.sin(an) * rad / Math.sqrt(el)]); } q.beginPath(); for (v = 0; v <= nv; v++) { var p = poly[v % nv], n2 = poly[(v + 1) % nv], mx = (p[0] + n2[0]) / 2 * r, my = (p[1] + n2[1]) / 2 * r, sh = crushed ? 1.32 : 1.12; if (!v) q.moveTo(mx, my); else q.quadraticCurveTo((p[0] * sh - (sh - 1) * (p[0] + n2[0]) / 2) * r, (p[1] * sh - (sh - 1) * (p[1] + n2[1]) / 2) * r, mx, my); } q.closePath(); }
  var TONES = ['#b3a387', '#a5967d', '#8e8270', '#c6bdaa', '#8f9397', '#72777d', '#54585e', '#aba69d', '#97796a', '#858c96', '#bbb098', '#64605b', '#b9b6ae', '#7e7567', '#9b9d9f', '#6b6f75', '#a58c6e', '#cfc8b8'];
  function paintStone(q, rnd, s, pat, mm, rim) {
    var r = s[2], big = r > 2.6 * mm, crushed = rnd() < 0.3, v;
    q.save(); q.translate(s[0], s[1]); q.rotate(rnd() * 7); stoneShape(q, rnd, r, crushed); q.fillStyle = TONES[Math.floor(rnd() * TONES.length)]; q.fill();
    if (big) {
      q.save(); q.clip(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.5; q.fillStyle = pat; q.fillRect(-r * 2, -r * 2, r * 4, r * 4);
      var gr = q.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(0,0,0,.5)'); q.globalAlpha = 0.32; q.fillStyle = gr; q.fillRect(-r * 2, -r * 2, r * 4, r * 4); q.globalCompositeOperation = 'source-over';
      var kind = rnd();
      if (kind < 0.28) { q.globalAlpha = 0.45; for (v = 0; v < r * r / (mm * mm) * 1.6; v++) { q.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.7)' : 'rgba(30,28,26,.7)'; q.beginPath(); q.arc((rnd() - 0.5) * 2.4 * r, (rnd() - 0.5) * 2.4 * r, (0.12 + rnd() * 0.3) * mm, 0, 7); q.fill(); } }
      else if (kind < 0.5) { q.globalAlpha = 0.4; q.strokeStyle = 'rgba(250,246,238,.8)'; for (v = 0; v < 1 + Math.floor(rnd() * 3); v++) { q.lineWidth = (0.15 + rnd() * 0.35) * mm; q.beginPath(); var vy = (rnd() - 0.5) * 1.4 * r; q.moveTo(-r * 1.6, vy + (rnd() - 0.5) * r); q.quadraticCurveTo(0, vy + (rnd() - 0.5) * r, r * 1.6, vy + (rnd() - 0.5) * r); q.stroke(); } }
      else if (kind < 0.66) { q.globalAlpha = 0.22; q.strokeStyle = 'rgba(40,36,32,.9)'; q.lineWidth = 0.3 * mm; for (v = -4; v <= 4; v++) { q.beginPath(); q.moveTo(-r * 1.6, v * 0.4 * r); q.lineTo(r * 1.6, v * 0.4 * r + (rnd() - 0.5) * 0.2 * r); q.stroke(); } }
      q.restore();
    }
    q.globalAlpha = 1; if (rim) { q.strokeStyle = '#a7aaa8'; q.lineWidth = 1.3 * mm; q.stroke(); }
    q.strokeStyle = 'rgba(40,37,34,' + (big ? 0.3 : 0.2) + ')'; q.lineWidth = Math.max(0.7, 0.22 * mm); q.stroke(); q.restore();
  }
  function place(w, h, mm, rnd, classes, ok) { // stones large to small on a grid, none overlapping, none where ok() says no
    var stones = [], cell = 6 * mm, gw = Math.ceil(w / cell) + 1, gh = Math.ceil(h / cell) + 1, grid = [], i; for (i = 0; i < gw * gh; i++) grid.push([]);
    function span(x, y, r, fn) { var a0 = Math.max(0, Math.floor((x - r) / cell)), a1 = Math.min(gw - 1, Math.floor((x + r) / cell)), b0 = Math.max(0, Math.floor((y - r) / cell)), b1 = Math.min(gh - 1, Math.floor((y + r) / cell)); for (var gy = b0; gy <= b1; gy++) for (var gx = a0; gx <= a1; gx++) if (fn(grid[gy * gw + gx]) === false) return false; return true; }
    classes.forEach(function (cl) {
      for (var n = 0; n < cl[0]; n++) for (var tr = 0; tr < 50; tr++) {
        var r = (cl[1] + Math.pow(rnd(), 1.4) * (cl[2] - cl[1])) * mm, x = rnd() * w, y = rnd() * h, good = ok(x, y, r);
        if (good) good = span(x, y, r + 0.4 * mm, function (list) { for (var q2 = 0; q2 < list.length; q2++) { var s = list[q2], dx = x - s[0], dy = y - s[1], l2 = (r + s[2]) * 0.93 + 0.3 * mm; if (dx * dx + dy * dy < l2 * l2) return false; } });
        if (good) { var st = [x, y, r]; stones.push(st); span(x, y, r, function (list) { list.push(st); }); break; }
      }
    });
    return stones;
  }
  function inPoly(poly, x, y) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { if ((poly[i][1] > y) !== (poly[j][1] > y) && x < (poly[j][0] - poly[i][0]) * (y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) c = !c; } return c; }
  function paintConcrete(G, c0) {
    var w = Math.round(c0.w * K), h = Math.round(c0.h * K), c = mkCanvas(w, h), q = c.getContext('2d'), mm = K * (c0.mm || MM), rnd = lcg(c0.seed), i, j, f = c0.formed; // c0.mm: drawing units per millimetre, for close-ups
    q.fillStyle = '#a3a6a5'; q.fillRect(0, 0, w, h);
    clouds(q, w, h, rnd, 5, 2, 0.5, 66, 190); clouds(q, w, h, rnd, 16, 7, 0.45, 66, 190); clouds(q, w, h, rnd, 60, 25, 0.35, 72, 184);
    var grain = greyNoise(256, 256, rnd, 40, 215), pat = q.createPattern(grain, 'repeat');
    q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.34; q.fillStyle = pat; q.fillRect(0, 0, w, h); q.restore();
    var sand = ['#8c877d', '#c9c3b5', '#6a6865', '#b4a68d', '#dad7cf', '#7b8088', '#9e8f7b', '#55534f', '#bdb9b0'], ns = Math.round(w * h / (mm * mm) * 0.11);
    for (i = 0; i < ns; i++) { q.fillStyle = sand[Math.floor(rnd() * sand.length)]; q.globalAlpha = 0.4 + rnd() * 0.55; var sr = (0.22 + rnd() * rnd() * 1.0) * mm; q.beginPath(); q.ellipse(rnd() * w, rnd() * h, sr * (0.8 + rnd() * 0.6), sr, rnd() * 3, 0, 7); q.fill(); }
    q.globalAlpha = 1;
    // coarse aggregate: nothing crosses a formed face, a crack, a bar or the gravel pocket
    var dens = c0.w * c0.h / (520 * 220) / Math.pow((c0.mm || MM) / MM, 2), classes = [[74, 8, 16], [290, 4, 8], [1050, 2, 4], [3000, 0.9, 2]].map(function (cl) { return [Math.round(cl[0] * dens), cl[1], cl[2]]; });
    var stones = place(w, h, mm, rnd, classes, function (x, y, r) {
      if ((f.indexOf('t') >= 0 && y < r * 1.04) || (f.indexOf('b') >= 0 && y > h - r * 1.04) || (f.indexOf('l') >= 0 && x < r * 1.04) || (f.indexOf('r') >= 0 && x > w - r * 1.04)) return false;
      var xu = c0.x + x / K, yu = c0.y + y / K, ru = r / K;
      for (j = 0; j < G.cracks.length; j++) if (G.cracks[j].near(xu, yu) < ru * 0.95 + 2) return false;
      for (j = 0; j < G.bars.length; j++) { var bx = G.bars[j][0] - xu, by = G.bars[j][1] - yu, lim = ru + (G.bars[j][2] || 5.3) + 0.9; if (bx * bx + by * by < lim * lim) return false; }
      if (c0.keep && !c0.keep(xu, yu, ru)) return false;
      if (c0.pocket && G.pocket && (inPoly(G.pocket, xu, yu + ru) || inPoly(G.pocket, xu, yu) || inPoly(G.pocket, xu - ru, yu + ru * 0.5) || inPoly(G.pocket, xu + ru, yu + ru * 0.5))) return false;
      return true;
    });
    stones.forEach(function (s) { paintStone(q, rnd, s, pat, mm, false); });
    for (i = 0; i < Math.round(95 * dens); i++) { // air voids in the paste
      var vr = (0.35 + rnd() * rnd() * 1.9) * mm, vx = rnd() * w, vy2 = vr + rnd() * (h - 2 * vr), free = true;
      for (j = 0; free && j < stones.length; j++) { var t = stones[j]; if (t[2] > 1.6 * mm && (vx - t[0]) * (vx - t[0]) + (vy2 - t[1]) * (vy2 - t[1]) < (t[2] + vr) * (t[2] + vr)) free = false; }
      if (!free) continue;
      var vg = q.createRadialGradient(vx - vr * 0.25, vy2 - vr * 0.25, vr * 0.1, vx, vy2, vr); vg.addColorStop(0, '#141312'); vg.addColorStop(0.75, '#2c2927'); vg.addColorStop(1, '#55514c'); q.fillStyle = vg; q.beginPath(); q.arc(vx, vy2, vr, 0, 7); q.fill();
      q.strokeStyle = 'rgba(255,255,255,.4)'; q.lineWidth = Math.max(0.6, vr * 0.22); q.beginPath(); q.arc(vx, vy2, vr, 0.05 * Math.PI, 0.6 * Math.PI); q.stroke();
    }
    // the saw leaves faint arcs; the light comes from the upper left
    q.save(); q.globalCompositeOperation = 'overlay'; q.lineWidth = Math.max(1, 0.5 * mm);
    for (i = 0; i < 46; i++) { q.strokeStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; q.beginPath(); q.arc(-w * 0.6, h * 2.2, w * 0.7 + i * w * 0.036 + rnd() * 8, -1.5, 0.2); q.stroke(); }
    var lg = q.createLinearGradient(0, 0, w, h); lg.addColorStop(0, '#d8d8d8'); lg.addColorStop(0.55, '#808080'); lg.addColorStop(1, '#5e5e5e'); q.globalAlpha = 0.3; q.fillStyle = lg; q.fillRect(0, 0, w, h); q.restore();
    // cement-rich skin at the formed faces, saturated zone towards the water
    function edgeGrad(side, depth, c1, c2) { var gr = side === 't' ? q.createLinearGradient(0, 0, 0, depth) : side === 'b' ? q.createLinearGradient(0, h, 0, h - depth) : side === 'l' ? q.createLinearGradient(0, 0, depth, 0) : q.createLinearGradient(w, 0, w - depth, 0); gr.addColorStop(0, c1); if (c2) gr.addColorStop(0.35, c2[0]); gr.addColorStop(1, c2 ? c2[1] : c1.replace(/[\d.]+\)$/, '0)')); q.fillStyle = gr; if (side === 't') q.fillRect(0, 0, w, depth); else if (side === 'b') q.fillRect(0, h - depth, w, depth); else if (side === 'l') q.fillRect(0, 0, depth, h); else q.fillRect(w - depth, 0, depth, h); }
    f.split('').forEach(function (s) { edgeGrad(s, 3.2 * mm, 'rgba(232,232,228,.42)'); });
    if (c0.wet) { q.save(); q.globalCompositeOperation = 'multiply'; if (c0.wetTo) { q.beginPath(); q.rect(0, 0, (c0.wetTo - c0.x) * K, h); q.clip(); } edgeGrad(c0.wet, 34 * mm, 'rgba(96,108,120,.62)', ['rgba(120,130,140,.3)', 'rgba(255,255,255,0)']); q.restore(); }
    q.fillStyle = 'rgba(40,38,36,.4)'; var e = Math.max(1, 0.35 * mm); if (f.indexOf('t') >= 0) q.fillRect(0, 0, w, e); if (f.indexOf('b') >= 0) q.fillRect(0, h - e, w, e); if (f.indexOf('l') >= 0) q.fillRect(0, 0, e, h); if (f.indexOf('r') >= 0) q.fillRect(w - e, 0, e, h);
    return c;
  }
  // a gravel pocket: stones coated with paste, the space between them empty, full of water or full of resin
  function paintPocket(G, fill) {
    var bx = 150, by = 214, bw = 220, bh = 76, w = Math.round(bw * K), h = Math.round(bh * K), c = mkCanvas(w, h), q = c.getContext('2d'), mm = K * MM, rnd = lcg(223), i;
    q.save(); q.beginPath(); G.pocket.forEach(function (p, k) { var X = (p[0] - bx) * K, Y = (p[1] - by) * K; if (k) q.lineTo(X, Y); else q.moveTo(X, Y); }); q.closePath(); q.clip();
    if (fill === 'water') { var wg = q.createLinearGradient(0, 0, 0, h); wg.addColorStop(0, '#2f9fd2'); wg.addColorStop(1, '#1b86bd'); q.fillStyle = wg; } else q.fillStyle = fill === 'resin' ? '#cc000e' : '#151210';
    q.fillRect(0, 0, w, h);
    if (fill === 'resin') for (i = 0; i < 260; i++) { q.fillStyle = 'rgba(255,190,190,.4)'; q.beginPath(); q.arc(rnd() * w, rnd() * h, (0.15 + rnd() * 0.4) * mm, 0, 7); q.fill(); }
    var grain = greyNoise(128, 128, lcg(5), 40, 215), pat = q.createPattern(grain, 'repeat'), r2 = lcg(229);
    place(w, h, mm, r2, [[26, 8, 14], [70, 4.5, 8], [120, 2.5, 4.5]], function () { return true; }).forEach(function (s) { paintStone(q, r2, s, pat, mm, true); });
    q.restore(); return { canvas: c, x: bx, y: by, w: bw, h: bh };
  }

  function paintBase(type) {
    var G = geometry(type), c = mkCanvas(W, H), g = c.getContext('2d'), rnd = lcg(131), i;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    units(g);
    var wa = G.water;
    if (wa.kind === 'ground') { // the ground with the water standing in it: gravel and sand, saturated below the water table
      pixels(g); var gx = Math.round((wa.x - R.x) * K), gy = Math.round((wa.y - R.y) * K), gw2 = Math.round(wa.w * K), gh2 = Math.round(wa.h * K), mm = K * MM, gc = mkCanvas(gw2, gh2), q = gc.getContext('2d'), r3 = lcg(307);
      q.fillStyle = '#8d8675'; q.fillRect(0, 0, gw2, gh2); clouds(q, gw2, gh2, r3, 8, 6, 0.5, 60, 190); clouds(q, gw2, gh2, r3, 40, 30, 0.4, 60, 190);
      var pat0 = q.createPattern(greyNoise(128, 128, r3, 30, 225), 'repeat'); q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.5; q.fillStyle = pat0; q.fillRect(0, 0, gw2, gh2); q.restore();
      place(gw2, gh2, mm, r3, [[Math.round(gw2 * gh2 / 5200), 3, 10], [Math.round(gw2 * gh2 / 700), 1.2, 3]], function () { return true; }).forEach(function (s) { paintStone(q, r3, s, pat0, mm, false); });
      var ty0 = Math.round(((wa.table || wa.y) - wa.y) * K); q.save(); q.globalCompositeOperation = 'multiply'; q.fillStyle = 'rgba(150,196,220,.6)'; q.fillRect(0, ty0, gw2, gh2); q.restore(); q.fillStyle = 'rgba(0,174,239,.1)'; q.fillRect(0, ty0, gw2, gh2);
      g.drawImage(gc, gx, gy); units(g);
      if (wa.surface) { g.strokeStyle = 'rgba(40,36,30,.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(wa.x, wa.y); g.lineTo(wa.x + wa.w, wa.y); g.stroke(); }
      var tl = (wa.table || wa.y) + 0.6; g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 0.9; g.setLineDash([7, 4]); g.beginPath(); g.moveTo(wa.x, tl); g.lineTo(wa.x + wa.w, tl); g.stroke(); g.setLineDash([]);
    }
    G.conc.forEach(function (c0) { pixels(g); g.drawImage(paintConcrete(G, c0), Math.round((c0.x - R.x) * K), Math.round((c0.y - R.y) * K)); units(g); });
    if (wa.kind === 'free') { // a real body of water against the component, seen from the side
      var X0 = wa.x, X1 = wa.x + wa.w, Y0 = wa.y + wa.h;
      var surf = function (x) { return wa.y + 11 + 2.1 * Math.sin(x / 27) + 1.1 * Math.sin(x / 10.5 + 1.3) + 0.6 * Math.sin(x / 4.7 + 0.4); };
      g.save(); g.beginPath(); g.moveTo(X0, Y0); g.lineTo(X0, surf(X0)); for (i = X0; i <= X1; i += 2) g.lineTo(i, surf(i)); g.lineTo(X1, Y0); g.closePath(); g.clip();
      var wg = g.createLinearGradient(0, wa.y + 8, 0, Y0); wg.addColorStop(0, '#bfe9f8'); wg.addColorStop(0.3, '#7fd0ef'); wg.addColorStop(1, '#2f9fd2'); g.fillStyle = wg; g.fillRect(X0, wa.y, wa.w, wa.h + 2);
      g.globalCompositeOperation = 'screen';
      for (i = 0; i < 11; i++) { var yy = wa.y + 16 + rnd() * 30, ph = rnd() * 7, amp = 1 + rnd() * 2.4, wl = 24 + rnd() * 40; g.strokeStyle = 'rgba(255,255,255,' + (0.07 + rnd() * 0.12).toFixed(2) + ')'; g.lineWidth = 0.6 + rnd() * 2.2; g.beginPath(); for (var x = X0; x <= X1; x += 3) { var y2 = yy + amp * Math.sin(x / wl + ph) + 0.8 * Math.sin(x / 7 + ph * 2); if (x === X0) g.moveTo(x, y2); else g.lineTo(x, y2); } g.stroke(); }
      for (i = 0; i < 9; i++) { var rx = X0 + rnd() * wa.w, rw = 8 + rnd() * 26, ray = g.createLinearGradient(rx, wa.y + 10, rx + 14, Y0); ray.addColorStop(0, 'rgba(255,255,255,.2)'); ray.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = ray; g.beginPath(); g.moveTo(rx, wa.y + 8); g.lineTo(rx + rw, wa.y + 8); g.lineTo(rx + rw + 16, Y0); g.lineTo(rx + 10, Y0); g.closePath(); g.fill(); }
      g.globalCompositeOperation = 'source-over';
      for (i = 0; i < 34; i++) { var bx = X0 + rnd() * wa.w, by = wa.y + 18 + rnd() * 30, br = 0.5 + rnd() * rnd() * 1.6; g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 0.3; g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(bx - br * 0.35, by - br * 0.35, br * 0.22, 0, 7); g.fill(); }
      var dk = g.createLinearGradient(0, Y0 - 9, 0, Y0); dk.addColorStop(0, 'rgba(10,60,90,0)'); dk.addColorStop(1, 'rgba(10,60,90,.35)'); g.fillStyle = dk; g.fillRect(X0, Y0 - 9, wa.w, 9);
      g.restore();
      g.lineJoin = 'round'; g.beginPath(); for (i = X0; i <= X1; i += 2) { if (i === X0) g.moveTo(i, surf(i)); else g.lineTo(i, surf(i)); } g.strokeStyle = 'rgba(0,120,180,.55)'; g.lineWidth = 1.5; g.stroke();
      g.beginPath(); for (i = X0; i <= X1; i += 2) { if (i === X0) g.moveTo(i, surf(i) - 0.7); else g.lineTo(i, surf(i) - 0.7); } g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 0.7; g.stroke();
    }
    if (G.pipe) { // the pipe through the slab: its wall in section on both sides, the bore between them
      var p = G.pipe; [[p.x0, p.x0 + p.wall], [p.x1 - p.wall, p.x1]].forEach(function (s, k) { var gr = g.createLinearGradient(s[0], 0, s[1], 0); gr.addColorStop(0, k ? '#6c7074' : '#878b90'); gr.addColorStop(0.5, '#a2a6aa'); gr.addColorStop(1, k ? '#878b90' : '#6c7074'); g.fillStyle = gr; g.fillRect(s[0], p.y0, s[1] - s[0], p.y1 - p.y0); g.save(); g.beginPath(); g.rect(s[0], p.y0, s[1] - s[0], p.y1 - p.y0); g.clip(); var pr = lcg(401 + k); for (var z = 0; z < 1500; z++) { g.fillStyle = pr() < 0.5 ? 'rgba(255,255,255,.2)' : 'rgba(20,22,24,.22)'; g.fillRect(s[0] + pr() * p.wall, p.y0 + pr() * (p.y1 - p.y0), 0.4 + pr() * 0.6, 0.4 + pr() * 0.6); } g.restore(); g.strokeStyle = 'rgba(30,32,36,.6)'; g.lineWidth = 0.5; g.strokeRect(s[0], p.y0 - 1, s[1] - s[0], p.y1 - p.y0 + 2); });
      var ig = g.createLinearGradient(p.x0 + p.wall, 0, p.x1 - p.wall, 0); ig.addColorStop(0, '#9a9da1'); ig.addColorStop(0.25, '#d8dadc'); ig.addColorStop(0.7, '#eceded'); ig.addColorStop(1, '#a9acb0'); g.fillStyle = ig; g.fillRect(p.x0 + p.wall, p.y0, p.x1 - p.x0 - 2 * p.wall, p.y1 - p.y0);
    }
    if (G.starters) { g.save(); g.setLineDash([7, 4]); var sb = G.startersTo || 372; G.starters.forEach(function (x) { g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 4.4, 20); g.lineTo(x - 4.4, sb); g.moveTo(x + 4.4, 20); g.lineTo(x + 4.4, sb); g.stroke(); g.strokeStyle = 'rgba(35,31,32,.5)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x - 4.4, 20); g.lineTo(x - 4.4, sb); g.moveTo(x + 4.4, 20); g.lineTo(x + 4.4, sb); g.stroke(); }); g.restore(); }
    // reinforcing bars cut by the saw: bright steel, a dark rim where the paste meets the bar
    G.bars.forEach(function (b, k) {
      var r = 5.3, halo = g.createRadialGradient(b[0], b[1], r, b[0], b[1], r * 2.3); halo.addColorStop(0, 'rgba(96,66,44,.3)'); halo.addColorStop(1, 'rgba(96,66,44,0)'); g.fillStyle = halo; g.beginPath(); g.arc(b[0], b[1], r * 2.3, 0, 7); g.fill();
      g.fillStyle = '#2b2420'; g.beginPath(); g.arc(b[0], b[1], r + 0.7, 0, 7); g.fill();
      var st = g.createRadialGradient(b[0] - 1.8, b[1] - 2, 0.4, b[0], b[1], r); st.addColorStop(0, '#f6f7f8'); st.addColorStop(0.45, '#c5c8cc'); st.addColorStop(1, '#7d8186'); g.fillStyle = st; g.beginPath(); g.arc(b[0], b[1], r, 0, 7); g.fill();
      g.save(); g.beginPath(); g.arc(b[0], b[1], r, 0, 7); g.clip(); g.lineWidth = 0.18; for (var m = -8; m <= 8; m++) { g.strokeStyle = m % 2 ? 'rgba(255,255,255,.35)' : 'rgba(40,44,48,.28)'; g.beginPath(); g.arc(b[0] - 26 - k * 3, b[1] + 34, 43 + m * 0.75, 0, 7); g.stroke(); } g.restore();
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 0.35; g.beginPath(); g.arc(b[0], b[1], r - 0.5, 1.1 * Math.PI, 1.6 * Math.PI); g.stroke();
    });
    if (G.bench) { // the specimen stands on a white bench: soft contact shadow on the accessible side
      var sc = mkCanvas(64, 32), sq = sc.getContext('2d'), sg = sq.createLinearGradient(0, 0, 0, 32); sg.addColorStop(0, 'rgba(30,32,36,.34)'); sg.addColorStop(0.2, 'rgba(30,32,36,.14)'); sg.addColorStop(0.55, 'rgba(30,32,36,.04)'); sg.addColorStop(1, 'rgba(30,32,36,0)'); sq.fillStyle = sg; sq.fillRect(0, 0, 64, 32);
      sq.globalCompositeOperation = 'destination-in'; var se = sq.createLinearGradient(0, 0, 64, 0); se.addColorStop(0, 'rgba(0,0,0,0)'); se.addColorStop(0.035, 'rgba(0,0,0,1)'); se.addColorStop(0.975, 'rgba(0,0,0,1)'); se.addColorStop(1, 'rgba(0,0,0,0)'); sq.fillStyle = se; sq.fillRect(0, 0, 64, 32);
      g.imageSmoothingEnabled = true; g.drawImage(sc, 16, 300, 534, 24);
    }
    if (G.corner) { g.save(); g.beginPath(); g.rect(370, 150, 120, 140); g.clip(); var cs = g.createRadialGradient(370, 290, 4, 370, 290, 95); cs.addColorStop(0, 'rgba(30,32,36,.24)'); cs.addColorStop(0.45, 'rgba(30,32,36,.08)'); cs.addColorStop(1, 'rgba(30,32,36,0)'); g.fillStyle = cs; g.fillRect(370, 150, 120, 140); g.restore(); }
    var out = { canvas: c, G: G }; if (type === 'H') { out.pv = paintPocket(G, 'void'); out.pw = paintPocket(G, 'water'); out.pr = paintPocket(G, 'resin'); } return out;
  }

  /* ---------- what the procedure adds ---------- */
  function borePath(g, h) { g.beginPath(); g.moveTo(-6.5, 0.6); g.lineTo(-6.5, -h.len); g.lineTo(0, -h.len - 4.6); g.lineTo(6.5, -h.len); g.lineTo(6.5, 0.6); g.closePath(); }
  function across(g, a, b, stops) { var gr = g.createLinearGradient(a, 0, b, 0); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); return gr; }
  function shadowOn(g) { g.shadowColor = 'rgba(20,22,26,.38)'; g.shadowBlur = 5 * K; g.shadowOffsetX = 2.2 * K; g.shadowOffsetY = 3 * K; }
  function shadowOff(g) { g.shadowColor = 'rgba(0,0,0,0)'; g.shadowBlur = 0; g.shadowOffsetX = g.shadowOffsetY = 0; }
  var RESIN = [[0, '#6f0008'], [0.22, '#c8000d'], [0.4, '#f0323a'], [0.47, '#ff8f92'], [0.55, '#e3000f'], [0.85, '#b0000b'], [1, '#650007']], STEEL = [[0, '#55595e'], [0.28, '#eef0f2'], [0.5, '#b4b8bd'], [0.8, '#7b8086'], [1, '#43474b']];

  function bore(g, h, filled, rnd) {
    frame(g, h.mx, h.my, h.ang, function () {
      borePath(g, h);
      if (filled === 'foam') { g.fillStyle = across(g, -6.5, 6.5, [[0, '#c99a95'], [0.3, '#f6d6d2'], [0.6, '#f1c3be'], [1, '#b98882']]); g.fill(); g.save(); g.clip(); for (var b2 = 0; b2 < 130; b2++) { g.fillStyle = 'rgba(255,250,248,.85)'; g.strokeStyle = 'rgba(190,120,116,.5)'; g.lineWidth = 0.18; g.beginPath(); g.arc((rnd() - 0.5) * 13, -rnd() * (h.len + 4), 0.35 + rnd() * 1.1, 0, 7); g.fill(); g.stroke(); } g.restore(); g.strokeStyle = 'rgba(120,70,66,.6)'; g.lineWidth = 0.5; g.stroke(); return; }
      if (filled) { g.fillStyle = across(g, -6.5, 6.5, RESIN); g.fill(); g.save(); g.clip(); for (var i = 0; i < 16; i++) { g.fillStyle = 'rgba(255,200,200,.5)'; g.beginPath(); g.arc((rnd() - 0.5) * 9, -rnd() * h.len, 0.25 + rnd() * 0.5, 0, 7); g.fill(); } g.restore(); g.strokeStyle = 'rgba(60,0,4,.6)'; g.lineWidth = 0.6; g.stroke(); return; }
      g.fillStyle = across(g, -6.5, 6.5, [[0, '#1c1a18'], [0.16, '#4b4742'], [0.45, '#8d8880'], [0.74, '#b3aea5'], [0.92, '#7d7972'], [1, '#3a3733']]); g.fill();
      g.save(); g.clip();
      for (var d = 0; d < 360; d++) { var t = rnd(); g.fillStyle = t < 0.4 ? 'rgba(40,37,34,' + (0.2 + rnd() * 0.3).toFixed(2) + ')' : t < 0.75 ? 'rgba(232,228,218,' + (0.2 + rnd() * 0.35).toFixed(2) + ')' : 'rgba(150,132,104,' + (0.25 + rnd() * 0.3).toFixed(2) + ')'; g.beginPath(); g.ellipse((rnd() - 0.5) * 13, -rnd() * (h.len + 4), 0.2 + rnd() * 0.9, 0.2 + rnd() * 0.5, rnd() * 3, 0, 7); g.fill(); }
      g.lineWidth = 0.3; for (var y = -h.len; y < 0; y += 4.2 + rnd() * 3) { g.strokeStyle = 'rgba(0,0,0,.1)'; g.beginPath(); g.moveTo(-6.5, y); g.quadraticCurveTo(0, y - 1.4, 6.5, y); g.stroke(); }
      var dp = g.createLinearGradient(0, -h.len - 4, 0, 0); dp.addColorStop(0, 'rgba(0,0,0,.45)'); dp.addColorStop(0.25, 'rgba(0,0,0,.12)'); dp.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = dp; g.fillRect(-6.5, -h.len - 5, 13, h.len + 6);
      g.restore(); g.strokeStyle = 'rgba(24,22,20,.55)'; g.lineWidth = 0.45; g.stroke();
    }, h.ghost ? 0.55 : null);
  }
  function nipple(g) { g.fillStyle = across(g, -3.8, 3.8, STEEL); g.fillRect(-3.8, 34, 7.6, 4); g.fillStyle = across(g, -1.9, 1.9, STEEL); g.fillRect(-1.9, 38, 3.8, 3.4); var hd = g.createRadialGradient(-0.9, 42.4, 0.2, 0, 43.2, 2.8); hd.addColorStop(0, '#ffffff'); hd.addColorStop(0.5, '#b9bdc2'); hd.addColorStop(1, '#5a5e63'); g.fillStyle = hd; g.beginPath(); g.ellipse(0, 43.2, 2.8, 2.3, 0, 0, 7); g.fill(); }
  function threads(g, y0, y1, skip) { g.strokeStyle = 'rgba(30,32,36,.4)'; g.lineWidth = 0.3; for (var y = y0; y < y1; y += 1.5) { if (skip && y > skip[0] && y < skip[1]) continue; g.beginPath(); g.moveTo(-3.2, y); g.lineTo(3.2, y + 0.7); g.stroke(); } }
  // drill packer, after the real part: domed aluminium cap, two rubber sleeves with a raised grid and a thin washer between them, rear washer,
  // round neck, long hexagonal aluminium body with one turned groove and a chamfered end, straight grease nipple
  var ALU = [[0, '#6f7378'], [0.2, '#f3f4f5'], [0.45, '#c9ccd0'], [0.75, '#9a9ea3'], [1, '#54585d']], PKO = 23.6; // PKO: how much further out the nipple sits than on the former packer
  function sleeve2d(g, y0, y1) {
    var hw = 6.2, x, y, n = 4, L = (y1 - y0) / n;
    g.fillStyle = across(g, -hw, hw, [[0, '#050505'], [0.26, '#3d3d40'], [0.4, '#232325'], [1, '#080809']]); g.fillRect(-hw, y0, 2 * hw, y1 - y0);
    g.fillStyle = 'rgba(0,0,0,.62)'; for (y = 0; y <= n; y++) g.fillRect(-hw, y0 + y * L - 0.45, 2 * hw, 0.9); [-4.2, -1.5, 1.5, 4.2].forEach(function (q) { g.fillRect(q - 0.4, y0, 0.8, y1 - y0); });
    g.fillStyle = 'rgba(255,255,255,.13)'; for (y = 0; y < n; y++) [-5.9, -3.7, -1, 2].forEach(function (q, k) { g.fillRect(q + 0.2, y0 + y * L + 0.7, [1.2, 1.6, 1.9, 1.6][k], 0.5); });
  }
  function packer(g, h) {
    frame(g, h.mx, h.my, h.ang, function () {
      var yR = -2, yB = yR - 1.7, yW = yB - 16, yA = yW - 1.05, yC = yA - 16, yF = yC - 2.1;
      // inside the component
      g.fillStyle = across(g, -6, 6, ALU); g.beginPath(); g.moveTo(-6, yC); g.lineTo(-6, yF + 1.6); g.quadraticCurveTo(-6, yF, -4.4, yF); g.lineTo(4.4, yF); g.quadraticCurveTo(6, yF, 6, yF + 1.6); g.lineTo(6, yC); g.closePath(); g.fill();
      sleeve2d(g, yC, yA); sleeve2d(g, yW, yB);
      g.fillStyle = across(g, -6.05, 6.05, ALU); g.fillRect(-6.05, yA, 12.1, yW - yA); g.fillRect(-6.05, yB, 12.1, yR - yB);
      g.strokeStyle = 'rgba(30,32,36,.5)'; g.lineWidth = 0.3; [yC, yA, yW, yB, yR].forEach(function (y) { g.beginPath(); g.moveTo(-6.05, y); g.lineTo(6.05, y); g.stroke(); });
      // outside: neck, hexagonal body, nipple — they throw a shadow
      var y0 = 1.8, y1 = 57.6, yG = y0 + 0.42 * (y1 - y0), hw = 5.7;
      shadowOn(g); g.fillStyle = across(g, -3.3, 3.3, ALU); g.fillRect(-3.3, yR, 6.6, y0 - yR);
      g.fillStyle = '#a4a8ad'; g.beginPath(); g.moveTo(-hw + 0.4, y0); g.lineTo(hw - 0.4, y0); g.lineTo(hw, y0 + 0.5); g.lineTo(hw, y1 - 1.3); g.lineTo(hw - 1.2, y1); g.lineTo(-hw + 1.2, y1); g.lineTo(-hw, y1 - 1.3); g.lineTo(-hw, y0 + 0.5); g.closePath(); g.fill(); shadowOff(g);
      g.save(); g.clip(); g.fillStyle = '#7e8287'; g.fillRect(-hw, y0, 2.2, y1 - y0); g.fillStyle = '#eef0f2'; g.fillRect(-hw + 2.2, y0, 5.2, y1 - y0); g.fillStyle = '#b3b7bc'; g.fillRect(-hw + 7.4, y0, 4, y1 - y0);
      g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-hw + 2.5, y0, 0.5, y1 - y0); g.fillStyle = 'rgba(40,44,48,.5)'; g.fillRect(-hw, yG - 0.55, 2 * hw, 1.1); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(-hw, yG + 0.55, 2 * hw, 0.3);
      g.fillStyle = 'rgba(60,64,68,.35)'; g.beginPath(); g.moveTo(-hw, y1 - 1.3); g.lineTo(hw, y1 - 1.3); g.lineTo(hw, y1); g.lineTo(-hw, y1); g.closePath(); g.fill(); g.restore();
      g.strokeStyle = 'rgba(30,32,36,.55)'; g.lineWidth = 0.35; g.beginPath(); g.moveTo(-hw + 2.2, y0); g.lineTo(-hw + 2.2, y1); g.moveTo(-hw + 7.4, y0); g.lineTo(-hw + 7.4, y1); g.stroke(); g.strokeRect(-hw, y0, 2 * hw, y1 - y0);
      g.save(); g.translate(0, PKO); shadowOn(g); g.fillStyle = '#9da1a6'; g.fillRect(-3.8, 34, 7.6, 4); shadowOff(g); nipple(g); g.restore();
    }, h.ghost ? 0.75 : null);
  }
  function gluedPacker(g, h, rnd) { // bonded over the crack with epoxy adhesive: bed, base plate with its channel open to the crack, stem, nipple
    frame(g, h.mx, h.my, h.ang, function () {
      shadowOn(g); g.fillStyle = '#84888c'; g.beginPath(); g.moveTo(-27, 0); g.quadraticCurveTo(-24, 5.4, -15, 4.6); g.lineTo(15, 4.6); g.quadraticCurveTo(24, 5.4, 27, 0); g.closePath(); g.fill();
      g.fillStyle = across(g, -20, 20, STEEL); g.fillRect(-20, 3.4, 40, 3.4); g.fillStyle = across(g, -7, 7, STEEL); g.beginPath(); g.moveTo(-8, 6.8); g.lineTo(8, 6.8); g.lineTo(5, 14); g.lineTo(-5, 14); g.closePath(); g.fill(); g.fillStyle = across(g, -3.2, 3.2, STEEL); g.fillRect(-3.2, 14, 6.4, 20); shadowOff(g);
      grainOver(g, rnd, -27, 0, 54, 5, 120, 0.15); g.fillStyle = '#1b1819'; g.fillRect(-1.1, 0, 2.2, 6.8); threads(g, 15, 34); g.strokeStyle = 'rgba(30,32,36,.5)'; g.lineWidth = 0.35; g.strokeRect(-20, 3.4, 40, 3.4); nipple(g);
    });
  }
  function grainOver(g, rnd, x, y, w, h, n, a) { for (var i = 0; i < n; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,' + a + ')' : 'rgba(20,20,22,' + a + ')'; g.fillRect(x + rnd() * w, y + rnd() * h, 0.35 + rnd() * 0.5, 0.35 + rnd() * 0.5); } }
  function sealPath(g, s, keep) { // in the frame of the face: along x, the paste stands out towards +y; "up" works it against what it meets at x = 0
    var x, a = s.a, b = s.b; if (!keep) g.beginPath(); g.moveTo(a, -0.3); g.lineTo(b, -0.3);
    for (x = b; x >= a; x -= 2) { var t = Math.min(1, (b - x) / 11, s.up ? 1 : (x - a) / 11); t = t * t * (3 - 2 * t); var up = s.up ? Math.max(0, 1 - (x - a) / 16) : 0; g.lineTo(x, t * (9.6 + 0.8 * Math.sin(x / 6.3) + 0.45 * Math.sin(x / 2.6 + 1)) + up * up * 9); }
    g.closePath();
  }
  function seal(g, s, rnd) {
    frame(g, s.x, s.y, s.rot, function () {
      shadowOn(g); sealPath(g, s); var gr = g.createLinearGradient(0, 0, 0, 10.6); gr.addColorStop(0, '#55595d'); gr.addColorStop(0.3, '#8e9296'); gr.addColorStop(0.5, '#a9adb1'); gr.addColorStop(0.78, '#7a7e82'); gr.addColorStop(1, '#4b4f53'); g.fillStyle = gr; g.fill(); shadowOff(g);
      g.save(); sealPath(g, s); g.clip(); grainOver(g, rnd, s.a, 0, s.b - s.a, 19, 6 * (s.b - s.a), 0.16);
      g.lineWidth = 0.4; for (var i = 0; i < 7; i++) { g.strokeStyle = i % 2 ? 'rgba(255,255,255,.22)' : 'rgba(30,32,36,.18)'; var yy = 1 + rnd() * 7, xa = s.a + 3 + rnd() * (s.b - s.a) * 0.4; g.beginPath(); g.moveTo(xa, yy); g.quadraticCurveTo(xa + 20, yy + (rnd() - 0.5) * 2.4, xa + 30 + rnd() * (s.b - s.a) * 0.3, yy + (rnd() - 0.5) * 1.6); g.stroke(); }
      g.restore();
    }, null, s.flip);
  }
  function collar(g, h, rnd) { // the paste is worked around the packer
    var y = 5.2, a = h.ang * Math.PI / 180, cx = h.mx - y * Math.sin(a), cy = h.my + y * Math.cos(a);
    frame(g, cx, cy, h.ang, function () { var gr = g.createRadialGradient(-2, -1, 1, 0, 1, 10); gr.addColorStop(0, '#aeb2b6'); gr.addColorStop(0.7, '#84888c'); gr.addColorStop(1, '#63676b'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 1.2, 10.5, 5.6, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, 1.2, 10.5, 5.6, 0, 0, 7); g.clip(); grainOver(g, rnd, -11, -5, 22, 12, 160, 0.15); });
  }
  function crackPath(g, ck, grow, i0, i1) {
    var p = ck.pts, i; grow = grow || 0; i0 = i0 == null ? 0 : i0; i1 = i1 == null ? ck.n - 1 : i1; g.beginPath();
    for (i = i0; i <= i1; i++) { var e = i === 0 ? -0.5 : i === ck.n - 1 ? 0.5 : 0, tx = p[i].tx, ty = p[i].ty, X = p[i].x - p[i].nx * (p[i].l + grow) + tx * e, Y = p[i].y - p[i].ny * (p[i].l + grow) + ty * e; if (i === i0) g.moveTo(X, Y); else g.lineTo(X, Y); }
    for (i = i1; i >= i0; i--) { var e2 = i === 0 ? -0.5 : i === ck.n - 1 ? 0.5 : 0, tx2 = p[i].tx, ty2 = p[i].ty; g.lineTo(p[i].x + p[i].nx * (p[i].r + grow) + tx2 * e2, p[i].y + p[i].ny * (p[i].r + grow) + ty2 * e2); }
    g.closePath();
  }
  function centreLine(g, ck, d, i0, i1) { g.beginPath(); for (var i = i0; i <= i1; i++) { var p = ck.pts[i]; if (i === i0) g.moveTo(p.x + p.nx * d, p.y + p.ny * d); else g.lineTo(p.x + p.nx * d, p.y + p.ny * d); } }
  function dampFlanks(g, G, amount, mouth) {
    if (amount <= 0) return; var f = 6, c = mkCanvas(Math.ceil(W / f), Math.ceil(H / f)), q = c.getContext('2d'); q.setTransform(K / f, 0, 0, K / f, -R.x * K / f, -R.y * K / f); q.lineCap = q.lineJoin = 'round'; q.strokeStyle = '#2f3740';
    G.cracks.forEach(function (ck) { [[60, 0.09], [42, 0.11], [26, 0.14], [14, 0.2], [6, 0.26]].forEach(function (s) { q.globalAlpha = Math.min(1, s[1] * amount); q.lineWidth = s[0]; q.beginPath(); ck.pts.forEach(function (pt, i) { if (i) q.lineTo(pt.x, pt.y); else q.moveTo(pt.x, pt.y); }); q.stroke(); }); });
    if (mouth) { q.fillStyle = '#2f3740'; [[52, 17, 0.16], [36, 12, 0.2], [20, 8, 0.24]].forEach(function (e) { q.globalAlpha = e[2] * mouth; q.save(); q.translate(G.out.x, G.out.y); q.rotate(G.out.rot * Math.PI / 180); q.beginPath(); q.ellipse(0, 0, e[0], e[1], 0, 0, 7); q.fill(); q.restore(); }); }
    g.save(); g.beginPath(); G.conc.forEach(function (c0) { g.rect(c0.x, c0.y, c0.w, c0.h); }); g.clip(); pixels(g); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.globalCompositeOperation = 'multiply'; g.drawImage(c, 0, 0, W, H); g.restore(); units(g);
  }
  function crackVoid(g, ck) {
    crackPath(g, ck, 0.9); g.fillStyle = 'rgba(38,33,29,.34)'; g.fill(); crackPath(g, ck, 0); g.fillStyle = '#15120f'; g.fill();
    g.save(); crackPath(g, ck, 0); g.clip(); var dr = lcg(41); for (var z = 0; z < 120; z++) { var p = ck.at(dr()); g.fillStyle = 'rgba(' + (120 + Math.floor(dr() * 60)) + ',' + (112 + Math.floor(dr() * 55)) + ',' + (100 + Math.floor(dr() * 50)) + ',' + (0.18 + dr() * 0.3).toFixed(2) + ')'; g.beginPath(); g.arc(p.x + (dr() - 0.5) * 5 * p.nx, p.y + (dr() - 0.5) * 5 * p.ny, 0.2 + dr() * 0.55, 0, 7); g.fill(); } g.restore();
    g.lineCap = g.lineJoin = 'round'; centreLine(g, ck, 0.5, 0, ck.n - 1); g.strokeStyle = 'rgba(120,112,102,.28)'; g.lineWidth = 0.7; g.stroke();
    g.strokeStyle = 'rgba(28,25,22,.85)'; g.lineWidth = 0.55; ck.branches.forEach(function (b) { g.beginPath(); b.forEach(function (q, i) { if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); });
  }
  function crackFill(g, ck, f0, f1, kind, rnd) { // f: 0 at the water end, 1 at the accessible end
    var i0 = Math.max(0, Math.round(f0 * (ck.n - 1))), i1 = Math.min(ck.n - 1, Math.round(f1 * (ck.n - 1))), i; if (i1 <= i0) return;
    g.save(); crackPath(g, ck, 0, i0, i1); g.clip(); var bb = [1e9, 1e9, -1e9, -1e9]; for (i = i0; i <= i1; i++) { bb[0] = Math.min(bb[0], ck.pts[i].x - 8); bb[1] = Math.min(bb[1], ck.pts[i].y - 8); bb[2] = Math.max(bb[2], ck.pts[i].x + 8); bb[3] = Math.max(bb[3], ck.pts[i].y + 8); }
    if (kind === 'resin') {
      g.fillStyle = '#d2000e'; g.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]); g.lineCap = g.lineJoin = 'round'; centreLine(g, ck, -0.7, i0, i1); g.strokeStyle = 'rgba(255,150,152,.5)'; g.lineWidth = 0.6; g.stroke();
      crackPath(g, ck, 0, i0, i1); g.strokeStyle = 'rgba(70,0,5,.7)'; g.lineWidth = 1.1; g.stroke();
      for (i = 0; i < 26; i++) { var p = ck.pts[i0 + Math.floor(rnd() * (i1 - i0))]; g.fillStyle = 'rgba(255,205,205,.55)'; g.beginPath(); g.arc(p.x + (rnd() - 0.5) * 3 * p.nx, p.y + (rnd() - 0.5) * 3 * p.ny, 0.2 + rnd() * 0.4, 0, 7); g.fill(); }
    } else if (kind === 'water') {
      g.fillStyle = '#3aa9da'; g.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]); centreLine(g, ck, -0.6, i0, i1); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 0.55; g.stroke(); crackPath(g, ck, 0, i0, i1); g.strokeStyle = 'rgba(0,70,110,.55)'; g.lineWidth = 0.9; g.stroke();
    } else { // foam of the initial injection: closed cells
      g.fillStyle = '#f1c3be'; g.fillRect(bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]);
      for (var n = 0; n < 420; n++) { var q = ck.pts[i0 + Math.floor(rnd() * (i1 - i0))], fr = 0.35 + rnd() * rnd() * 1.3; g.fillStyle = 'rgba(255,250,248,.85)'; g.beginPath(); g.arc(q.x + (rnd() - 0.5) * 9 * q.nx + (rnd() - 0.5) * 2 * q.ny, q.y + (rnd() - 0.5) * 9 * q.ny + (rnd() - 0.5) * 2 * q.nx, fr, 0, 7); g.fill(); g.strokeStyle = 'rgba(190,120,116,.55)'; g.lineWidth = 0.18; g.stroke(); }
      crackPath(g, ck, 0, i0, i1); g.strokeStyle = 'rgba(150,80,78,.5)'; g.lineWidth = 0.8; g.stroke();
    }
    g.restore();
  }
  function drop(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s); shadowOn(g); g.beginPath(); g.moveTo(0, -6); g.bezierCurveTo(3.4, -1, 5.2, 1.6, 5.2, 4.4); g.arc(0, 4.4, 5.2, 0, Math.PI); g.bezierCurveTo(-5.2, 1.6, -3.4, -1, 0, -6); g.closePath();
    var gr = g.createRadialGradient(-1.4, 2.2, 0.6, 0, 3.6, 6.4); gr.addColorStop(0, 'rgba(214,244,255,.95)'); gr.addColorStop(0.55, 'rgba(70,186,234,.92)'); gr.addColorStop(1, 'rgba(0,120,180,.95)'); g.fillStyle = gr; g.fill(); shadowOff(g);
    g.strokeStyle = 'rgba(0,80,128,.6)'; g.lineWidth = 0.4; g.stroke(); g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.ellipse(-1.9, 1.6, 1, 1.7, 0.5, 0, 7); g.fill(); g.restore();
  }
  function puddle(g, x, y, w) { // water standing on a floor: flat, with a bright edge
    var gr = g.createLinearGradient(0, y - 3.2, 0, y); gr.addColorStop(0, 'rgba(130,210,242,.92)'); gr.addColorStop(1, 'rgba(24,140,200,.95)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - w * 0.5, y); g.quadraticCurveTo(x - w * 0.46, y - 3.4, x - w * 0.2, y - 3); g.quadraticCurveTo(x, y - 3.8, x + w * 0.25, y - 2.8); g.quadraticCurveTo(x + w * 0.47, y - 3, x + w * 0.5, y); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(x - w * 0.4, y - 2.9); g.quadraticCurveTo(x, y - 3.9, x + w * 0.38, y - 2.8); g.stroke();
  }
  function hose(g, G, h) {
    var glued2 = !!G.glued, off = glued2 ? 0 : PKO, a = h.ang * Math.PI / 180, sx = h.mx - (44 + off) * Math.sin(a), sy = h.my + (44 + off) * Math.cos(a), seg = G.hose(sx, sy);
    function path() { g.beginPath(); g.moveTo(sx, sy); seg.forEach(function (s) { g.bezierCurveTo(s[0], s[1], s[2], s[3], s[4], s[5]); }); }
    g.lineCap = 'butt'; shadowOn(g); path(); g.strokeStyle = '#101011'; g.lineWidth = 5.4; g.stroke(); shadowOff(g);
    path(); g.strokeStyle = '#2f3032'; g.lineWidth = 3.4; g.stroke(); path(); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 0.9; g.stroke();
    frame(g, h.mx, h.my, h.ang, function () { shadowOn(g); g.fillStyle = across(g, -4.2, 4.2, [[0, '#4b4f54'], [0.3, '#f0f1f3'], [0.6, '#aeb2b7'], [1, '#3f4347']]); g.fillRect(-4.2, 39 + off, 8.4, 11); shadowOff(g); g.strokeStyle = 'rgba(30,32,36,.5)'; g.lineWidth = 0.35; for (var y = 41 + off; y < 50 + off; y += 2) { g.beginPath(); g.moveTo(-4.2, y); g.lineTo(4.2, y); g.stroke(); } });
  }
  function lance(g, h, rnd, depth) {
    frame(g, h.mx, h.my, h.ang, function () {
      shadowOn(g); g.fillStyle = across(g, -1.5, 1.5, [[0, '#4b4f54'], [0.35, '#f4f5f6'], [1, '#5d6166']]); g.fillRect(-1.5, -depth, 3, depth + 54);
      g.fillStyle = '#232527'; g.beginPath(); g.moveTo(-5, 54); g.lineTo(5, 54); g.lineTo(6, 70); g.lineTo(16, 92); g.lineTo(8, 96); g.lineTo(-5, 74); g.closePath(); g.fill(); shadowOff(g); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(-4, 55, 2.4, 16);
    });
    var a = h.ang * Math.PI / 180, ox = -Math.sin(a), oy = Math.cos(a), px = Math.cos(a), py = Math.sin(a), i;
    for (i = 0; i < 170; i++) { // what the air throws out
      var t = rnd(), d = 3 + t * 50, lat = (rnd() - 0.5) * (7 + d * 0.95), x = h.mx + ox * d + px * lat, y = h.my + oy * d + py * lat + t * t * 6, r = 1 + rnd() * 3.8 * (0.35 + t);
      var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(172,166,156,' + (0.36 * (1 - t * 0.72)).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(172,166,156,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    for (i = 0; i < 30; i++) { var d2 = 4 + rnd() * 44, l2 = (rnd() - 0.5) * (6 + d2 * 0.9); g.fillStyle = 'rgba(96,92,86,' + (0.5 + rnd() * 0.4).toFixed(2) + ')'; g.beginPath(); g.arc(h.mx + ox * d2 + px * l2, h.my + oy * d2 + py * l2, 0.3 + rnd() * 0.7, 0, 7); g.fill(); }
  }
  function plug(g, G, h, rnd) { // mortar in the mouth of the bore: flush with the seal where the seal covers the mouth, with the concrete face elsewhere
    var cover = (G.type === 'W' || G.type === 'S' || G.type === 'V') ? G.seals[0] : null, rad = Math.PI / 180;
    g.save(); g.beginPath();
    g.save(); g.translate(h.mx, h.my); g.rotate(G.out.rot * rad); g.rect(-80, -260, 160, 260.2); g.restore();
    if (cover) { g.save(); g.translate(cover.x, cover.y); g.rotate(cover.rot * rad); sealPath(g, cover, true); g.restore(); }
    g.clip();
    frame(g, h.mx, h.my, h.ang, function () {
      g.beginPath(); g.rect(-6.5, -h.len * 0.2, 13, h.len * 0.2 + 22); g.clip();
      g.fillStyle = across(g, -6.5, 6.5, [[0, '#9a9893'], [0.4, '#cbc9c3'], [1, '#a5a39d']]); g.fillRect(-6.5, -h.len * 0.2, 13, h.len * 0.2 + 22);
      for (var i = 0; i < 300; i++) { g.fillStyle = ['rgba(90,86,80,.55)', 'rgba(240,238,232,.6)', 'rgba(150,140,124,.55)'][Math.floor(rnd() * 3)]; g.beginPath(); g.arc((rnd() - 0.5) * 13, -h.len * 0.2 + rnd() * (h.len * 0.2 + 22), 0.2 + rnd() * 0.5, 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(40,38,36,.45)'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(-6.5, -h.len * 0.2); g.lineTo(6.5, -h.len * 0.2); g.stroke();
    });
    g.restore();
  }

  function render(key) {
    var type = key.charAt(0), s = +key.charAt(1), B = key.charAt(2) === 'B', air = key.charAt(3) === 'a';
    var P1 = s === 7; if (P1) { s = 2; B = true; } // stage 7: the initial injection of AQUAFIN-P1 — packers set, the surface not yet sealed
    var foamEarly = B && (P1 || s === 3);         // the foam has stopped the water before the surface is sealed
    if (!bases[type]) { bases[type] = paintBase(type); baseOrder.push(type); if (baseOrder.length > 3) delete bases[baseOrder.shift()]; }
    var base = bases[type], G = base.G, c = mkCanvas(W, H), g = c.getContext('2d'), rnd = lcg(900 + s * 7 + (B ? 3 : 0)), glued = !!G.glued, flat = G.out.rot === 180, corner = !!G.corner;
    g.drawImage(base.canvas, 0, 0); units(g);
    dampFlanks(g, G, (B ? 1 : 0.42) * (s >= 6 ? 0.3 : s >= 5 ? 0.55 : 1), !B ? 0 : P1 ? 0.55 : s <= 2 ? 1 : s === 3 ? 0.35 : 0);
    if (G.pocket) { // the gravel pocket: empty, carrying water, filled with resin from the packer outwards
      var pv = s >= 5 ? base.pr : (B && s <= 3 && !foamEarly ? base.pw : base.pv); pixels(g); g.drawImage(pv.canvas, Math.round((pv.x - R.x) * K), Math.round((pv.y - R.y) * K)); units(g);
      if (s === 4) { var he = G.holes[0], a0 = he.ang * Math.PI / 180, ex = he.mx + Math.sin(a0) * he.len, ey = he.my - Math.cos(a0) * he.len; g.save(); g.beginPath(); g.arc(ex, ey, B ? 74 : 92, 0, 7); g.clip(); pixels(g); g.drawImage(base.pr.canvas, Math.round((pv.x - R.x) * K), Math.round((pv.y - R.y) * K)); units(g); g.restore(); if (B) { g.save(); g.beginPath(); g.rect(150, 214, 46, 76); g.clip(); pixels(g); g.globalAlpha = 0.9; g.drawImage(base.pv.canvas, Math.round((pv.x - R.x) * K), Math.round((pv.y - R.y) * K)); units(g); g.fillStyle = 'rgba(241,195,190,.85)'; g.fillRect(150, 214, 46, 76); g.restore(); } }
      if (B && s >= 5) { g.save(); g.beginPath(); G.pocket.forEach(function (p, k2) { if (k2) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); g.clip(); g.fillStyle = 'rgba(241,195,190,.8)'; g.fillRect(150, 214, 40, 76); for (var z = 0; z < 160; z++) { g.fillStyle = 'rgba(255,250,248,.8)'; g.beginPath(); g.arc(150 + rnd() * 40, 214 + rnd() * 76, 0.4 + rnd() * 1.2, 0, 7); g.fill(); } g.restore(); }
      if (foamEarly) { g.save(); g.beginPath(); G.pocket.forEach(function (p, k2) { if (k2) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); g.clip(); g.fillStyle = 'rgba(241,195,190,.78)'; g.fillRect(150, 200, 220, 92); for (var z2 = 0; z2 < 900; z2++) { g.fillStyle = 'rgba(255,250,248,.8)'; g.beginPath(); g.arc(150 + rnd() * 220, 206 + rnd() * 84, 0.4 + rnd() * 1.3, 0, 7); g.fill(); } g.restore(); } // the foam of the initial injection fills the water-bearing pocket
      g.strokeStyle = 'rgba(30,27,24,.75)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(150, 290); g.lineTo(370, 290); g.stroke(); // the joint below the pocket is tight
    }
    if (s >= 1) { g.save(); g.beginPath(); G.conc.forEach(function (c0) { g.rect(c0.x, c0.y, c0.w, c0.h); }); g.clip(); G.holes.forEach(function (h, k) { bore(g, h, foamEarly && !h.ghost ? 'foam' : (s >= 5 || (s === 4 && k === 0)), rnd); }); g.restore(); } // a bore ends at the face of the concrete
    if (!G.pocket) G.cracks.forEach(function (ck, k) {
      g.save(); g.beginPath(); G.conc.forEach(function (c0) { g.rect(c0.x - 1, c0.y - 1, c0.w + 2, c0.h + 2); }); if (G.pipe) g.rect(G.pipe.x0 - 2, 96, G.pipe.x1 - G.pipe.x0 + 4, 220); g.clip();
      crackVoid(g, ck);
      if (B && s <= 3 && !foamEarly) crackFill(g, ck, 0, 1, 'water', rnd);
      if (foamEarly) crackFill(g, ck, 0, 1, 'foam', rnd); // the foam fills the water-bearing defect; what stands out of the mouth is removed flush
      if (s >= 4) { var from = s === 4 ? (glued ? 0.55 : B ? 0.4 : 0.32) : (B ? 0.4 : 0); if (s === 4 && k > 0) from = B ? 0.4 : 1; crackFill(g, ck, from, 1, 'resin', rnd); if (B) crackFill(g, ck, 0, 0.4, 'foam', rnd); }
      g.restore();
    });
    if (B && s <= 2 && !P1) { // the water comes through
      if (flat) { puddle(g, G.out.x + 6, G.out.y, s < 3 ? 120 : 60); if (G.cracks.length > 1) puddle(g, 329 + 40, 96, s < 3 ? 90 : 40); }
      else if (corner) puddle(g, 420, 290, s < 3 ? 110 : 50);
      else if (G.type === 'V') { var fl = g.createLinearGradient(0, 208, 0, 396); fl.addColorStop(0, 'rgba(60,180,232,.85)'); fl.addColorStop(1, 'rgba(60,180,232,.35)'); g.fillStyle = fl; g.fillRect(370, 206, 1.7, 190); if (s < 3) { drop(g, 375.5, 246, 0.85); drop(g, 376, 301, 0.75); drop(g, 375.5, 352, 0.7); } }
      else { g.fillStyle = 'rgba(60,180,232,.8)'; g.fillRect(264, 299.6, 32, 1.5); if (s < 3) { drop(g, 279, 309, 0.95); drop(g, 271, 331, 0.75); drop(g, 288, 346, 0.75); } }
    }
    if (s >= 3) G.seals.forEach(function (sl) { seal(g, sl, rnd); });
    if (s >= 2 && s <= 5) { if (glued) G.glued.forEach(function (h) { gluedPacker(g, h, rnd); }); else { G.holes.forEach(function (h) { packer(g, h); }); if (s >= 3) G.holes.forEach(function (h) { collar(g, h, rnd); }); } }
    if (P1) frame(g, G.out.x, G.out.y, G.out.rot, function () { // excess foam stands out of the mouth; it is removed flush once it has reacted
      var fg = g.createRadialGradient(-2, 2, 0.5, 0, 3, 11); fg.addColorStop(0, '#fbe3df'); fg.addColorStop(1, '#e9b3ad'); shadowOn(g); g.fillStyle = fg; g.beginPath(); g.moveTo(-10, 0); g.bezierCurveTo(-11, 6, -5, 9, -1, 7.4); g.bezierCurveTo(3, 10.5, 10, 7, 9, 0); g.closePath(); g.fill(); shadowOff(g);
      g.save(); g.clip(); for (var f2 = 0; f2 < 70; f2++) { g.fillStyle = 'rgba(255,252,250,.85)'; g.strokeStyle = 'rgba(190,120,116,.5)'; g.lineWidth = 0.18; g.beginPath(); g.arc(-10 + rnd() * 20, rnd() * 9, 0.4 + rnd() * 1.2, 0, 7); g.fill(); g.stroke(); } g.restore();
    });
    if (s === 4 || P1) hose(g, G, glued ? G.glued[0] : G.holes[0]);
    if (air && s === 1) { if (glued) lance(g, { mx: G.out.x + 3, my: G.out.y + 5, ang: 18 }, rnd, 0); else lance(g, G.holes[type === 'P' ? 1 : 0], rnd, 96); }
    if (s >= 6 && !glued) G.holes.forEach(function (h) { plug(g, G, h, rnd); });
    if (!checked) { checked = true; pixels(g); var a = g.getImageData(W - 3, 3, 1, 1).data; if (a[0] < 250 || a[1] < 250 || a[2] < 250) throw new Error('canvas read-back is not reliable here'); }
    return c.toDataURL('image/jpeg', 0.9);
  }

  return {
    kit: function () { setup(); return { K: K, W: W, H: H, R: R, units: units, pixels: pixels, frame: frame, paintConcrete: paintConcrete, paintStone: paintStone, place: place, across: across, shadowOn: shadowOn, shadowOff: shadowOff, grainOver: grainOver, inPoly: inPoly, drop: drop, STEEL: STEEL }; },
    region: R,
    type: function (scenario) { return { wall: 'W', hjoint: 'V', dam: 'W', sewer: 'V', adhesive: 'G', slab: 'S', pipe: 'P', wfjoint: 'J', honeycomb: 'H', manhole: 'V', cutcover: 'J', tbm: 'V', shield: 'W', immersed: 'W' }[scenario] || 'W'; },
    ok: function () { return !dead && !!document.createElement('canvas').getContext; },
    cached: function (key) { return urls[key] || null; },
    url: function (key) {
      if (dead) return null; if (urls[key]) return urls[key];
      try { setup(); var u = key.charAt(0) === 'x' ? CRPhoto.render(key) : render(key); if (!/^data:image\/jpeg/.test(u)) throw new Error('no jpeg'); urls[key] = u; urlOrder.push(key); if (urlOrder.length > 30) delete urls[urlOrder.shift()]; return u; } catch (e) { dead = true; if (window.console) console.warn('section photo', e); return null; }
    }
  };
})();

