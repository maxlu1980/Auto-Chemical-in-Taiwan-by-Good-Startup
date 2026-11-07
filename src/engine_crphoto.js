/* ===== [engine_crphoto.js] CRPhoto: mortar and rough canvases ===== */
var CRPhoto = (function () {
  var k = null, bases = {}, order = [];
  var U = 3, FX = 404, UW = 1.25;                      // units per mm (scene A), face of the concrete (scene A), units per mm (scene W)
  var A = {
    s: { barX: FX - 25 * U, barR: 5 * U, stir: [[FX - 17 * U, 62], [FX - 17 * U, 350]], stirR: 3 * U, y0: 100, y1: 312, depth: 38 * U, shallow: [146, 268, 31 * U] },
    b: { barX: FX - 51 * U, barR: 6 * U, stir: [[FX - 42 * U, 62], [FX - 42 * U, 350]], stirR: 3 * U, y0: 106, y1: 306, depth: 26 * U },
    f: { barX: FX - 40 * U, barR: 6 * U, stir: [[FX - 31 * U, 96], [FX - 31 * U, 324]], stirR: 3 * U, y0: 60, y1: 350, depth: 0 }
  };
  function kit() { if (!k) k = SecPhoto.kit(); return k; }

  /* ---------- geometry ---------- */
  function cavity(letter, prepared) { // polygon of the opening, from the top shoulder along the back wall to the bottom shoulder
    var P = A[letter], r = lcg(letter === 's' ? 61 : 67), pts = [], n = 22, i;
    if (!P.depth) return null;
    pts.push([FX + 1, P.y0]);
    for (i = 0; i <= n; i++) {
      var t = i / n, y = P.y0 + t * (P.y1 - P.y0), sh = prepared ? Math.min(1, Math.min(t, 1 - t) / 0.024) : Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), 0.55); // prepared: cut square at the edges; as found: feathering out
      var d = P.depth * sh * (0.9 + 0.16 * r()) * (prepared ? 1 : 0.92);
      if (!prepared && P.shallow) d = (y > P.shallow[0] && y < P.shallow[1]) ? P.shallow[2] * (1 + 0.12 * r()) * Math.min(1, Math.min(y - P.shallow[0], P.shallow[1] - y) / 16) : 0;
      pts.push([FX - d, y + (r() - 0.5) * 3]);
    }
    pts.push([FX + 1, P.y1]); return pts;
  }
  function poly(g, pts) { g.beginPath(); pts.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); }
  function inPoly(pts, x, y) { return kit().inPoly(pts, x, y); }

  /* ---------- textures ---------- */
  function mortarTex(w, h, seed, o) { // fine cement mortar: paste, sand up to o.grain mm, a few pores. px per mm = o.mm
    var c = mkCanvas(w, h), q = c.getContext('2d'), r = lcg(seed), mm = o.mm, i; q.fillStyle = o.tone; q.fillRect(0, 0, w, h);
    clouds(q, w, h, r, 6, 5, 0.4, 96, 176); var pat = q.createPattern(greyNoise(128, 128, r, 60, 200), 'repeat'); q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.4; q.fillStyle = pat; q.fillRect(0, 0, w, h); q.restore();
    var sand = ['#8f8a80', '#c8c2b4', '#6f6d69', '#b3a68e', '#d8d5cc', '#80858c', '#a09180', '#5d5b57', '#bcb8ae'], nGr = Math.round(w * h / (mm * mm) * (o.dens || 0.3));
    for (i = 0; i < nGr; i++) { var rad = (0.12 + Math.pow(r(), 2.6) * (o.grain / 2 - 0.12)) * mm; q.fillStyle = sand[Math.floor(r() * sand.length)]; q.globalAlpha = 0.55 + r() * 0.4; q.beginPath(); q.ellipse(r() * w, r() * h, rad * (0.8 + r() * 0.5), rad, r() * 3, 0, 7); q.fill(); if (rad > 0.9 * mm) { q.globalAlpha = 0.35; q.strokeStyle = 'rgba(40,38,36,.6)'; q.lineWidth = Math.max(0.6, 0.12 * mm); q.stroke(); } }
    q.globalAlpha = 1; for (i = 0; i < Math.round(w * h / (mm * mm) * 0.012); i++) { var vr = (0.15 + r() * r() * 0.6) * mm, vx = r() * w, vy = r() * h, vg = q.createRadialGradient(vx - vr * 0.3, vy - vr * 0.3, vr * 0.1, vx, vy, vr); vg.addColorStop(0, '#1a1918'); vg.addColorStop(1, '#5a5650'); q.fillStyle = vg; q.beginPath(); q.arc(vx, vy, vr, 0, 7); q.fill(); }
    return c;
  }
  function roughTex(w, h, seed, mm, dens) { // a broken concrete surface seen in elevation: paste torn rough, stones standing proud, sockets where stones came out. Light from the upper left.
    var K = kit(), c = mkCanvas(w, h), q = c.getContext('2d'), r = lcg(seed), i, a = w * h / (mm * mm); q.fillStyle = '#a9aaa6'; q.fillRect(0, 0, w, h); clouds(q, w, h, r, 12, 10, 0.5, 80, 205); clouds(q, w, h, r, 44, 36, 0.42, 60, 205);
    var pat = q.createPattern(greyNoise(128, 128, r, 20, 235), 'repeat'); q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.6; q.fillStyle = pat; q.fillRect(0, 0, w, h); q.restore();
    for (i = 0; i < a / 60; i++) { var sx = r() * w, sy = r() * h, sr = (1 + r() * 2.6) * mm, sg = q.createRadialGradient(sx + sr * 0.3, sy + sr * 0.3, sr * 0.1, sx, sy, sr); sg.addColorStop(0, 'rgba(18,18,20,.0)'); sg.addColorStop(0.7, 'rgba(18,18,20,.12)'); sg.addColorStop(1, 'rgba(18,18,20,0)'); q.fillStyle = sg; q.beginPath(); q.arc(sx, sy, sr, 0, 7); q.fill(); }
    K.place(w, h, mm, r, [[Math.round(a / 760 * (dens || 1)), 5, 9], [Math.round(a / 250 * (dens || 1)), 2.4, 5], [Math.round(a / 70 * (dens || 1)), 1, 2.4]], function () { return true; }).forEach(function (s) {
      q.fillStyle = 'rgba(14,14,18,.42)'; q.beginPath(); q.ellipse(s[0] + s[2] * 0.2, s[1] + s[2] * 0.26, s[2] * 1.0, s[2] * 0.96, 0, 0, 7); q.fill();
      if (s[2] < 4.2 * mm && r() < 0.2) { var so = q.createRadialGradient(s[0] + s[2] * 0.3, s[1] + s[2] * 0.3, s[2] * 0.1, s[0], s[1], s[2]); so.addColorStop(0, '#6f706d'); so.addColorStop(1, '#2a2a2b'); q.fillStyle = so; q.beginPath(); q.arc(s[0], s[1], s[2] * 0.9, 0, 7); q.fill(); return; } // a socket
      K.paintStone(q, r, s, pat, mm, false);
      var gr = q.createRadialGradient(s[0] - s[2] * 0.4, s[1] - s[2] * 0.45, s[2] * 0.1, s[0], s[1], s[2] * 1.02); gr.addColorStop(0, 'rgba(255,255,255,.4)'); gr.addColorStop(0.55, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.4)'); q.fillStyle = gr; q.beginPath(); q.arc(s[0], s[1], s[2] * 0.9, 0, 7); q.fill();
    });
    return c;
  }
  function tex(name, make) { var b = bases; if (!b['t:' + name]) b['t:' + name] = make(); return b['t:' + name]; }
  function fillTex(g, c, pts, ox, oy) { var K = kit().K, R = kit().R; g.save(); poly(g, pts); g.clip(); kit().pixels(g); g.drawImage(c, Math.round((ox - R.x) * K), Math.round((oy - R.y) * K)); kit().units(g); g.restore(); }

  /* ---------- steel ---------- */
  function ribs(g, x, y0, y1, r, col, a) { g.save(); g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = 1.5; for (var y = y0 + 4; y < y1; y += 9.5) { g.beginPath(); g.moveTo(x - r, y + 3); g.lineTo(x + r, y - 3); g.stroke(); } g.restore(); }
  function barCut(g, x, y0, y1, r) { // the bar sawn along its axis, inside the concrete: bright steel, rib stumps at the edges
    var gr = g.createLinearGradient(x - r, 0, x + r, 0); gr.addColorStop(0, '#6d7176'); gr.addColorStop(0.18, '#d9dcdf'); gr.addColorStop(0.5, '#eef0f2'); gr.addColorStop(0.85, '#b9bdc2'); gr.addColorStop(1, '#5e6267'); g.fillStyle = gr; g.fillRect(x - r, y0, 2 * r, y1 - y0);
    g.fillStyle = '#34302c'; for (var y = y0 + 3; y < y1; y += 9.5) { g.fillRect(x - r - 1.6, y, 1.9, 3.4); g.fillRect(x + r - 0.3, y + 4.7, 1.9, 3.4); }
    g.save(); g.globalAlpha = 0.18; g.strokeStyle = '#fff'; g.lineWidth = 0.4; for (var m = y0; m < y1; m += 3.1) { g.beginPath(); g.moveTo(x - r, m); g.lineTo(x + r, m + 1.2); g.stroke(); } g.restore();
    g.strokeStyle = 'rgba(30,27,24,.7)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x - r, y0); g.lineTo(x - r, y1); g.moveTo(x + r, y0); g.lineTo(x + r, y1); g.stroke();
  }
  function barRound(g, x, y0, y1, r, state, rnd) { // the bar where it lies open: rusty, blasted bright, or coated
    var K = kit(), extra = state === 'coat2' ? 4.2 : state === 'coat1' ? 2.2 : state === 'rust' ? 2.4 : 0, R2 = r + extra, y, stops;
    if (state === 'rust') stops = [[0, '#3a1d10'], [0.25, '#87441c'], [0.5, '#a96028'], [0.75, '#733717'], [1, '#2e170d']];
    else if (state === 'bright') stops = [[0, '#55595e'], [0.3, '#d2d5d8'], [0.5, '#eceef0'], [0.75, '#a4a8ad'], [1, '#4b4f54']];
    else stops = [[0, '#858786'], [0.3, '#d6d7d4'], [0.52, '#efefeb'], [0.8, '#bcbdba'], [1, '#747675']];
    K.shadowOn(g); g.fillStyle = K.across(g, x - R2, x + R2, stops); g.beginPath();
    if (state === 'rust') { g.moveTo(x - R2, y0); for (y = y0; y <= y1; y += 5) g.lineTo(x - R2 - rnd() * 2.6, y); for (y = y1; y >= y0; y -= 5) g.lineTo(x + R2 + rnd() * 2.6, y); g.closePath(); } else g.rect(x - R2, y0, 2 * R2, y1 - y0);
    g.fill(); K.shadowOff(g);
    if (state === 'rust') { g.save(); g.beginPath(); g.rect(x - R2 - 3, y0, 2 * R2 + 6, y1 - y0); g.clip(); for (var i = 0; i < 520; i++) { g.fillStyle = ['rgba(210,120,50,.55)', 'rgba(60,28,12,.6)', 'rgba(150,80,30,.5)', 'rgba(225,150,76,.26)'][Math.floor(rnd() * 4)]; g.beginPath(); g.ellipse(x + (rnd() - 0.5) * 2.2 * R2, y0 + rnd() * (y1 - y0), 0.5 + rnd() * 2.4, 0.4 + rnd() * 1.4, rnd() * 3, 0, 7); g.fill(); } g.restore(); }
    else if (state === 'bright') ribs(g, x, y0, y1, r, 'rgba(40,44,48,.75)', 0.8);
    else { ribs(g, x, y0, y1, R2, 'rgba(60,62,64,.5)', 0.28); K.grainOver(g, rnd, x - R2, y0, 2 * R2, y1 - y0, 700, 0.18); g.save(); g.globalAlpha = 0.22; g.strokeStyle = '#fff'; g.lineWidth = 0.5; for (var s = 0; s < 22; s++) { var yy = y0 + rnd() * (y1 - y0 - 30); g.beginPath(); g.moveTo(x - R2 * 0.7 + rnd() * R2, yy); g.lineTo(x - R2 * 0.7 + rnd() * R2, yy + 14 + rnd() * 22); g.stroke(); } g.restore(); } // brush marks of the slurry
  }
  function stirrup(g, c, r, state) { // stirrup cut square to its axis
    var st = g.createRadialGradient(c[0] - r * 0.35, c[1] - r * 0.4, r * 0.1, c[0], c[1], r), ring = state === 'rust' ? '#6e3616' : state === 'coat' ? '#8f9295' : '#2b2420';
    g.fillStyle = ring; g.beginPath(); g.arc(c[0], c[1], r + (state === 'coat' ? 3.4 : state === 'rust' ? 2.2 : 0.8), 0, 7); g.fill();
    st.addColorStop(0, '#f6f7f8'); st.addColorStop(0.45, '#c5c8cc'); st.addColorStop(1, '#7d8186'); g.fillStyle = st; g.beginPath(); g.arc(c[0], c[1], r, 0, 7); g.fill();
  }

  /* ---------- tools ---------- */
  function brush(g, x, y, deg, wide) { // bristles towards -x in its own frame
    var K = kit(); K.frame(g, x, y, deg, function () {
      K.shadowOn(g); g.fillStyle = K.across(g, 0, 0, [[0, '#b98a52'], [1, '#b98a52']]); var wood = g.createLinearGradient(0, -7, 0, 7); wood.addColorStop(0, '#d4a96e'); wood.addColorStop(0.5, '#b98a52'); wood.addColorStop(1, '#84592c'); g.fillStyle = wood;
      g.beginPath(); g.moveTo(30, -wide * 0.42); g.lineTo(54, -5); g.lineTo(150, -4); g.quadraticCurveTo(158, 0, 150, 4); g.lineTo(54, 5); g.lineTo(30, wide * 0.42); g.closePath(); g.fill();
      var fer = g.createLinearGradient(0, -wide / 2, 0, wide / 2); fer.addColorStop(0, '#e6e8ea'); fer.addColorStop(0.5, '#9ea2a7'); fer.addColorStop(1, '#5d6166'); g.fillStyle = fer; g.fillRect(18, -wide / 2, 14, wide); K.shadowOff(g);
      for (var i = 0; i < wide * 2.2; i++) { var yy = -wide / 2 + (i / (wide * 2.2)) * wide; g.strokeStyle = i % 3 ? 'rgba(46,40,34,.9)' : 'rgba(96,88,78,.9)'; g.lineWidth = 0.55; g.beginPath(); g.moveTo(18, yy); g.lineTo(-6 - (i % 5), yy * 1.12); g.stroke(); }
      g.fillStyle = 'rgba(112,115,118,.95)'; g.beginPath(); g.ellipse(-5, 0, 3.4, wide * 0.56, 0, 0, 7); g.fill(); // loaded with slurry
    });
  }
  function trowel(g, x, y, deg, len) { // steel float seen from the side: the blade lies along +y of its frame at x = 0
    var K = kit(); K.frame(g, x, y, deg, function () {
      K.shadowOn(g); var bl = g.createLinearGradient(0, 0, 5, 0); bl.addColorStop(0, '#f2f3f4'); bl.addColorStop(1, '#8a8e93'); g.fillStyle = bl; g.fillRect(0, -len / 2, 3.2, len);
      g.fillStyle = '#6e7277'; g.fillRect(3.2, -len * 0.3, 9, 5); g.fillRect(3.2, len * 0.3 - 5, 9, 5);
      var wood = g.createLinearGradient(12, 0, 30, 0); wood.addColorStop(0, '#c99c60'); wood.addColorStop(0.5, '#b98a52'); wood.addColorStop(1, '#7c5226'); g.fillStyle = wood; g.beginPath(); g.moveTo(12, -len * 0.36); g.quadraticCurveTo(34, -len * 0.4, 32, 0); g.quadraticCurveTo(34, len * 0.4, 12, len * 0.36); g.closePath(); g.fill(); K.shadowOff(g);
    });
  }
  function film(g, x, y0, y1, rnd) { // curing: a film close to the surface, water between film and mortar
    var y, gr = g.createLinearGradient(x, 0, x + 9, 0); gr.addColorStop(0, 'rgba(120,200,240,.5)'); gr.addColorStop(1, 'rgba(200,232,248,.28)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, y0); for (y = y0; y <= y1; y += 6) g.lineTo(x + 6 + 2.2 * Math.sin(y / 17) + 1.2 * Math.sin(y / 5.3), y); g.lineTo(x, y1); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 1.1; g.beginPath(); for (y = y0; y <= y1; y += 6) { var xx = x + 6 + 2.2 * Math.sin(y / 17) + 1.2 * Math.sin(y / 5.3); if (y === y0) g.moveTo(xx, y); else g.lineTo(xx, y); } g.stroke(); g.strokeStyle = 'rgba(70,120,160,.55)'; g.lineWidth = 0.5; g.stroke();
    for (var i = 0; i < 26; i++) kit().drop(g, x + 2.4 + rnd() * 2, y0 + 8 + rnd() * (y1 - y0 - 16), 0.28 + rnd() * 0.22);
  }

  /* ---------- scene A: base and stages ---------- */
  function baseA(letter) {
    var K = kit(), P = A[letter], c = mkCanvas(K.W, K.H), g = c.getContext('2d'), R = K.R, rnd = lcg(71);
    g.fillStyle = '#fff'; g.fillRect(0, 0, K.W, K.H); K.units(g);
    var bars = P.stir.map(function (s) { return [s[0], s[1], P.stirR]; }), c0 = { x: 0, y: R.y, w: FX, h: R.h, formed: 'r', seed: letter === 's' ? 211 : letter === 'b' ? 223 : 227, mm: U, keep: function (x, y, r) { return Math.abs(x - P.barX) > r + P.barR + 1.5; } };
    K.pixels(g); g.drawImage(K.paintConcrete({ cracks: [], bars: bars }, c0), 0, 0); K.units(g);
    // carbonated zone: the cover has lost its alkalinity (steel scenario), drawn as a slightly warmer, lighter skin with an irregular front
    if (letter === 's') { g.save(); g.globalCompositeOperation = 'overlay'; var cf = g.createLinearGradient(FX - 34 * U, 0, FX, 0); cf.addColorStop(0, 'rgba(235,224,206,0)'); cf.addColorStop(0.25, 'rgba(235,224,206,.2)'); cf.addColorStop(1, 'rgba(240,230,214,.26)'); g.fillStyle = cf; g.beginPath(); g.moveTo(FX, R.y); for (var y = R.y; y <= R.y + R.h; y += 8) g.lineTo(FX - (30 + 5 * Math.sin(y / 23) + 3 * Math.sin(y / 9)) * U, y); g.lineTo(FX, R.y + R.h); g.closePath(); g.fill(); g.restore(); }
    barCut(g, P.barX, R.y, R.y + R.h, P.barR); P.stir.forEach(function (s) { stirrup(g, s, P.stirR, 'ok'); });
    // soft contact shadow on the bench to the right of the specimen
    var sh = g.createLinearGradient(FX, 0, FX + 26, 0); sh.addColorStop(0, 'rgba(30,32,36,.2)'); sh.addColorStop(1, 'rgba(30,32,36,0)'); g.fillStyle = sh; g.fillRect(FX, R.y, 26, R.h);
    return c;
  }
  function openCavity(g, letter, pts, state, rnd, wet) { // the opening: its back wall in elevation, in shadow; the bar lying open in it
    var K = kit(), P = A[letter], R = K.R, rt = tex('rough', function () { return roughTex(Math.round(240 * K.K), Math.round(R.h * K.K), 97, K.K * U); });
    fillTex(g, rt, pts, FX - 240, R.y);
    g.save(); poly(g, pts); g.clip(); var sd = g.createLinearGradient(FX - P.depth, 0, FX, 0); sd.addColorStop(0, 'rgba(10,10,12,.36)'); sd.addColorStop(0.5, 'rgba(10,10,12,.16)'); sd.addColorStop(1, 'rgba(10,10,12,.06)'); g.fillStyle = sd; g.fillRect(FX - 240, R.y, 240, R.h);
    if (wet) { g.fillStyle = wet === 'slurry' ? 'rgba(86,90,94,.78)' : 'rgba(40,52,64,.34)'; g.fillRect(FX - 240, R.y, 240, R.h); if (wet === 'slurry') { g.globalAlpha = 0.3; g.strokeStyle = '#d9dcdf'; g.lineWidth = 0.7; for (var i = 0; i < 90; i++) { var yy = P.y0 + rnd() * (P.y1 - P.y0), xx = FX - rnd() * P.depth; g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + 8, yy + 3 + rnd() * 5, xx + 18 + rnd() * 12, yy + rnd() * 6); g.stroke(); } g.globalAlpha = 1; } }
    g.restore();
    // broken edge: a light rim where the fracture meets the sawn face
    g.save(); g.lineJoin = 'round'; g.strokeStyle = 'rgba(20,18,16,.75)'; g.lineWidth = 1.2; g.beginPath(); pts.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke();
    if (wet === 'slurry') { g.strokeStyle = 'rgba(98,102,106,.95)'; g.lineWidth = 3.2; g.beginPath(); pts.forEach(function (p, i) { if (i) g.lineTo(p[0] + 1.4, p[1]); else g.moveTo(p[0], p[1]); }); g.stroke(); g.strokeStyle = 'rgba(235,238,240,.5)'; g.lineWidth = 0.6; g.stroke(); }
    g.restore();
    if (letter === 's' && state) { var ys = pts.filter(function (p) { return p[0] < P.barX + P.barR; }).map(function (p) { return p[1]; }), ya = Math.min.apply(null, ys) - 2, yb = Math.max.apply(null, ys) + 2; if (ys.length) { g.save(); poly(g, pts); g.clip(); barRound(g, P.barX, ya - 12, yb + 12, P.barR, state, rnd); g.restore(); } }
  }
  function renderA(letter, stage) {
    var K = kit(), P = A[letter], R = K.R, c = mkCanvas(K.W, K.H), g = c.getContext('2d'), rnd = lcg(300 + stage.length * 17 + stage.charCodeAt(0));
    if (!bases[letter]) { bases[letter] = baseA(letter); order.push(letter); if (order.length > 2) delete bases[order.shift()]; }
    g.drawImage(bases[letter], 0, 0); K.units(g);
    var prepared = cavity(letter, true), found = cavity(letter, false), mm = K.K * U;
    var m540 = tex('m540', function () { return mortarTex(Math.round(260 * K.K), Math.round(R.h * K.K), 131, { tone: '#c3c2bb', grain: 4, mm: mm, dens: 0.22 }); }), m16 = tex('m16', function () { return mortarTex(Math.round(60 * K.K), Math.round(R.h * K.K), 137, { tone: '#d2d0c8', grain: 1, mm: mm, dens: 0.42 }); });
    if (letter === 'f') return renderF(g, c, stage, rnd, m16);
    if (stage === 'damage') {
      if (letter === 's') { // the bar rusts under the carbonated cover: rust needs more room than steel, cracks run to the face, the cover comes off
        var ya = P.y0 - 34, yb = P.y1 + 40, side, y, i;
        g.save(); g.globalCompositeOperation = 'multiply'; // rust has soaked into the paste around the bar
        for (y = ya; y <= yb; y += 16) { var fade = Math.min(1, Math.min(y - ya, yb - y) / 60), hr = 26 + 30 * fade, st = g.createRadialGradient(P.barX, y, P.barR * 0.6, P.barX, y, P.barR + hr); st.addColorStop(0, 'rgba(158,88,38,' + (0.3 * fade + 0.05) + ')'); st.addColorStop(1, 'rgba(158,88,38,0)'); g.fillStyle = st; g.fillRect(P.barX - P.barR - hr, y - P.barR - hr, 2 * (P.barR + hr), 2 * (P.barR + hr)); }
        g.restore();
        for (side = -1; side <= 1; side += 2) { // the rust layer on both flanks of the sawn bar: scale outside, pitting inside
          var ex = P.barX + side * P.barR; g.beginPath(); g.moveTo(ex - side * 1.2, ya);
          for (y = ya; y <= yb; y += 4) { var f2 = Math.min(1, Math.min(y - ya, yb - y) / 46); g.lineTo(ex + side * (0.6 + f2 * (2.2 + rnd() * 3.4)), y); }
          for (y = yb; y >= ya; y -= 4) { var f3 = Math.min(1, Math.min(y - ya, yb - y) / 46); g.lineTo(ex - side * (0.4 + f3 * (1 + rnd() * 2.6)), y); }
          g.closePath(); var rg = g.createLinearGradient(ex - side * 3, 0, ex + side * 6, 0); rg.addColorStop(0, '#4a2412'); rg.addColorStop(0.45, '#9a501f'); rg.addColorStop(1, '#c47a34'); g.fillStyle = rg; g.fill();
          for (i = 0; i < 150; i++) { var yy2 = ya + 30 + rnd() * (yb - ya - 60); g.fillStyle = ['rgba(226,142,62,.75)', 'rgba(62,28,12,.7)', 'rgba(176,92,36,.7)'][Math.floor(rnd() * 3)]; g.beginPath(); g.ellipse(ex + side * (rnd() * 4.6 - 1), yy2, 0.5 + rnd() * 1.3, 0.5 + rnd() * 1.8, 0, 0, 7); g.fill(); }
        }
        g.strokeStyle = '#1a1512'; g.lineCap = 'round'; g.lineJoin = 'round'; // cracks from the bar to the face, delamination along the bar
        [[P.shallow[0] - 26, 1.7], [P.shallow[1] + 22, 1.5]].forEach(function (cr) { g.lineWidth = cr[1]; g.beginPath(); var x = P.barX + P.barR + 3, y2 = cr[0]; g.moveTo(x, y2); while (x < FX) { x += 6 + rnd() * 5; y2 += (rnd() - 0.5) * 7; g.lineTo(Math.min(FX, x), y2); } g.stroke(); });
        g.lineWidth = 1.2; g.beginPath(); var yy = P.shallow[0] - 40; g.moveTo(P.barX + P.barR + 4.5, yy); while (yy < P.shallow[1] + 36) { yy += 7; g.lineTo(P.barX + P.barR + 4.5 + (rnd() - 0.4) * 3, yy); } g.stroke();
        openCavity(g, letter, found, 'rust', rnd);
        g.save(); g.globalCompositeOperation = 'multiply'; var run = g.createLinearGradient(0, P.shallow[1] - 4, 0, R.y + R.h); run.addColorStop(0, 'rgba(160,90,40,.75)'); run.addColorStop(1, 'rgba(160,90,40,0)'); g.fillStyle = run; g.fillRect(FX - 5, P.shallow[1] - 4, 5, 150); g.restore(); // rust runs down the face
      } else { // breakout / honeycomb: coarse grains with little paste, loose pieces
        openCavity(g, letter, found, null, rnd);
        for (var i = 0; i < 46; i++) { var px = FX - rnd() * P.depth * 0.9, py = P.y0 + 12 + rnd() * (P.y1 - P.y0 - 24); if (!inPoly(found, px, py)) continue; K.paintStone(g, rnd, [px, py, 3 + rnd() * 7], null, U, false); }
      }
      return c;
    }
    var si = CR_STAGES[letter === 's' ? 'steel' : 'breakout'].indexOf(stage), filled = stage === 'fill2' || stage === 'fine' || stage === 'cure', half = stage === 'fill1';
    if (!filled) {
      openCavity(g, letter, prepared, stage === 'prep' ? 'bright' : 'coat2', rnd, stage === 'bond' || half ? 'slurry' : (stage === 'steel' ? null : null));
      if (letter === 's') P.stir.forEach(function (s) { if (inPoly(prepared, s[0], s[1])) stirrup(g, s, P.stirR, stage === 'prep' ? 'ok' : 'coat'); });
    }
    if (half || filled) { // repair mortar: first layer up to about half the depth, then flush
      var lim = half ? FX - P.depth * 0.48 : FX + 2, part = prepared.map(function (p) { return [Math.min(p[0], lim + (half ? (lcg(Math.round(p[1]))() - 0.5) * 5 : 0)), p[1]]; });
      fillTex(g, m540, part, FX - 260, R.y);
      g.save(); poly(g, part); g.clip(); var fresh = g.createLinearGradient(FX - P.depth, 0, FX, 0); fresh.addColorStop(0, 'rgba(70,74,78,.16)'); fresh.addColorStop(1, 'rgba(70,74,78,.05)'); g.fillStyle = fresh; g.fillRect(FX - 260, R.y, 262, R.h);
      if (filled) { g.strokeStyle = 'rgba(40,38,36,.32)'; g.lineWidth = 0.8; g.setLineDash([5, 4]); g.beginPath(); for (var y2 = P.y0; y2 <= P.y1; y2 += 6) { var xl = FX - P.depth * 0.48 + 2.5 * Math.sin(y2 / 11); if (y2 === P.y0) g.moveTo(xl, y2); else g.lineTo(xl, y2); } g.stroke(); g.setLineDash([]); } // the joint between the two application steps
      g.restore();
      g.strokeStyle = 'rgba(88,92,96,.95)'; g.lineWidth = 2.4; g.beginPath(); prepared.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke(); // bond coat: a dark seam between old concrete and mortar
      if (letter === 's') { // the bar is embedded again: cut face with the two coats at its flanks
        var ys = prepared.filter(function (p) { return p[0] < P.barX - P.barR; }).map(function (p) { return p[1]; }), ya = Math.min.apply(null, ys), yb = Math.max.apply(null, ys);
        g.save(); poly(g, part); g.clip(); g.fillStyle = '#d6d6d2'; g.fillRect(P.barX - P.barR - 5.4, ya - 6, 2 * P.barR + 10.8, yb - ya + 12); g.strokeStyle = 'rgba(50,52,54,.85)'; g.lineWidth = 0.8; g.strokeRect(P.barX - P.barR - 5.4, ya - 6, 2 * P.barR + 10.8, yb - ya + 12); barCut(g, P.barX, ya - 6, yb + 6, P.barR); g.restore();
        P.stir.forEach(function (s) { if (inPoly(part, s[0], s[1])) stirrup(g, s, P.stirR, 'coat'); });
        if (half) { g.save(); poly(g, prepared); g.clip(); g.beginPath(); g.rect(lim + 3, R.y, 300, R.h); g.clip(); barRound(g, P.barX, ya - 12, yb + 12, P.barR, 'coat2', rnd); g.restore(); }
      }
      if (half) { var front = part.filter(function (p) { return p[0] >= lim - 4 && p[0] < FX; }); g.strokeStyle = 'rgba(30,28,26,.6)'; g.lineWidth = 0.9; g.beginPath(); front.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke(); }
    }
    if (stage === 'fine' || stage === 'cure') { var t = 3.2 * U, band = [[FX, 52], [FX + t * 0.35, 56], [FX + t, 66], [FX + t, 348], [FX + t * 0.35, 358], [FX, 362]]; K.shadowOn(g); g.fillStyle = '#bcbdb9'; poly(g, band); g.fill(); K.shadowOff(g); fillTex(g, m16, band, FX - 6, R.y); g.strokeStyle = 'rgba(40,38,36,.5)'; g.lineWidth = 0.6; poly(g, band); g.stroke(); }
    if (stage === 'steel') brush(g, P.barX + P.barR + 8, 236, -14, 12);
    if (stage === 'bond') brush(g, FX - P.depth * 0.55, 250, -10, 30);
    if (half) trowel(g, FX - P.depth * 0.48 + 3, 214, 4, 92);
    if (stage === 'fill2') trowel(g, FX + 1.5, 232, 0, 150);
    if (stage === 'fine') trowel(g, FX + 3.2 * U + 1.2, 150, 0, 120);
    if (stage === 'cure') film(g, FX + 3.2 * U, 40, 372, rnd);
    return c;
  }
  function renderF(g, c, stage, rnd, m16) { // blowholes and unevenness up to 6 mm, closed with the fine smoothing mortar
    var K = kit(), R = K.R, r = lcg(83), pits = [], y, i, idx = CR_STAGES.surface.indexOf(stage);
    for (y = 34; y < 384; y += 9 + r() * 22) pits.push([y, (1.2 + r() * r() * 4.6) * U, 0.8 + r() * 0.7]);
    var rough = [[FX + 1, R.y]]; for (y = R.y; y <= R.y + R.h; y += 3) rough.push([FX - (0.5 + 1.4 * Math.abs(Math.sin(y / 13)) + r() * 1.2) * U * (y > 150 && y < 290 ? 1.9 : 0.6), y]); rough.push([FX + 1, R.y + R.h]);
    g.fillStyle = '#fff'; poly(g, rough); g.fill(); // the surface is not plane: laitance gone, rough zone in the middle
    g.save(); g.beginPath(); g.rect(0, R.y, FX + 0.6, R.h); g.clip(); // blowholes open to the face: small bays in the sawn edge, shaded by the depth of the specimen
    pits.forEach(function (p) { g.beginPath(); g.ellipse(FX, p[0], p[1], p[1] * p[2], 0, 0, 7); g.fillStyle = '#eceded'; g.fill(); var sd = g.createRadialGradient(FX - p[1] * 1.05, p[0] - p[1] * 0.2, p[1] * 0.2, FX - p[1] * 0.5, p[0], p[1] * 1.3); sd.addColorStop(0, 'rgba(24,24,28,.5)'); sd.addColorStop(1, 'rgba(24,24,28,0)'); g.fillStyle = sd; g.fill(); g.strokeStyle = 'rgba(24,22,20,.7)'; g.lineWidth = 0.7; g.stroke(); });
    g.restore();
    if (idx >= 1) { g.save(); g.globalCompositeOperation = 'multiply'; var wet = g.createLinearGradient(FX - 16 * U, 0, FX, 0); wet.addColorStop(0, 'rgba(70,84,98,0)'); wet.addColorStop(1, 'rgba(70,84,98,.42)'); g.fillStyle = wet; g.fillRect(FX - 16 * U, R.y, 16 * U, R.h); g.restore(); } // matt damp
    if (idx >= 2) { // scratch coat: pressed into every pore
      g.save(); g.beginPath(); pits.forEach(function (p) { g.ellipse(FX, p[0], p[1], p[1] * p[2], 0, 0, 7); g.closePath(); }); poly(g, rough); g.clip('nonzero'); K.pixels(g); g.drawImage(m16, Math.round((FX - 40 - R.x) * K.K), 0); K.units(g); g.fillStyle = 'rgba(60,66,72,.22)'; g.fillRect(FX - 40, R.y, 44, R.h); g.restore();
      var skin = [[FX, R.y + 4], [FX + 1.1 * U, R.y + 8], [FX + 1.1 * U, R.y + R.h - 8], [FX, R.y + R.h - 4]]; g.fillStyle = '#9b9d9b'; poly(g, skin); g.fill();
    }
    if (idx >= 3) { var t = 4 * U, band = [[FX, 26], [FX + t, 34], [FX + t, 376], [FX, 384]]; K.shadowOn(g); g.fillStyle = '#bcbdb9'; poly(g, band); g.fill(); K.shadowOff(g); fillTex(g, m16, band, FX - 6, R.y); if (stage === 'fine') { g.save(); poly(g, band); g.clip(); g.strokeStyle = 'rgba(60,62,64,.35)'; g.lineWidth = 0.6; for (i = 0; i < 40; i++) { var yy = 30 + r() * 340; g.beginPath(); g.moveTo(FX + t - 0.4, yy); g.lineTo(FX + t - 2.2 - r() * 1.6, yy + 2); g.stroke(); } g.restore(); } g.strokeStyle = 'rgba(40,38,36,.5)'; g.lineWidth = 0.6; poly(g, band); g.stroke(); }
    if (stage === 'prep') { for (i = 0; i < 80; i++) K.drop(g, FX + 8 + r() * 60, 40 + r() * 330, 0.16 + r() * 0.2); }
    if (stage === 'scratch') trowel(g, FX + 1.1 * U + 1.4, 120, 0, 110);
    if (stage === 'fine') trowel(g, FX + 4 * U + 1.4, 250, 0, 150);
    if (stage === 'felt') { K.frame(g, FX + 4 * U + 1, 190, 0, function () { K.shadowOn(g); g.fillStyle = '#e8e2cf'; g.fillRect(0, -60, 9, 120); g.fillStyle = '#2a2c2e'; g.fillRect(9, -60, 5, 120); var wood = g.createLinearGradient(14, 0, 34, 0); wood.addColorStop(0, '#c99c60'); wood.addColorStop(1, '#7c5226'); g.fillStyle = wood; g.fillRect(14, -22, 20, 44); K.shadowOff(g); }); }
    if (stage === 'cure') film(g, FX + 4 * U, 30, 380, rnd);
    return c;
  }

  /* ---------- scene W: wall on a slab, water behind it; chased crack and coved fillet with ASOCRET-IM ---------- */
  var W = { x0: 150, x1: 400, top: 20, floor: 300, crackY: 168, chW: 20 * UW, chD: 25 * UW, cove: 40 * UW };
  function crackLine() { var r = lcg(45), pts = [], x, y = W.crackY + 6; for (x = W.x0; x <= W.x1; x += 9) { y += (r() - 0.5) * 7 + (W.crackY - y) * 0.12; pts.push([x, y]); } pts[pts.length - 1][1] = W.crackY; pts[pts.length - 2][1] = W.crackY + 1; return pts; }
  function baseW() {
    var K = kit(), R = K.R, c = mkCanvas(K.W, K.H), g = c.getContext('2d'), r = lcg(311), i;
    g.fillStyle = '#fff'; g.fillRect(0, 0, K.W, K.H); K.units(g);
    // the ground behind the wall, saturated below the water table
    var gw = Math.round(W.x0 * K.K), gh = Math.round((R.y + R.h - 40) * K.K), gc = mkCanvas(gw, gh), q = gc.getContext('2d'), mm = K.K * UW; q.fillStyle = '#8d8675'; q.fillRect(0, 0, gw, gh); clouds(q, gw, gh, r, 7, 12, 0.5, 60, 190); var pat0 = q.createPattern(greyNoise(128, 128, r, 30, 225), 'repeat'); q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.5; q.fillStyle = pat0; q.fillRect(0, 0, gw, gh); q.restore();
    K.place(gw, gh, mm, r, [[Math.round(gw * gh / 9000), 4, 11], [Math.round(gw * gh / 1100), 1.4, 4]], function () { return true; }).forEach(function (s) { K.paintStone(q, r, s, pat0, mm, false); });
    var ty = Math.round(44 * K.K); q.save(); q.globalCompositeOperation = 'multiply'; q.fillStyle = 'rgba(150,196,220,.6)'; q.fillRect(0, ty, gw, gh); q.restore(); q.fillStyle = 'rgba(0,174,239,.1)'; q.fillRect(0, ty, gw, gh);
    K.pixels(g); g.drawImage(gc, 0, Math.round((40 - R.y) * K.K)); K.units(g); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 0.9; g.setLineDash([7, 4]); g.beginPath(); g.moveTo(0, 84.6); g.lineTo(W.x0, 84.6); g.stroke(); g.setLineDash([]);
    var ck = crackLine(), G = { cracks: [{ near: function (x, y) { var best = 1e9; for (var m = 0; m < ck.length; m++) { var dx = ck[m][0] - x, dy = ck[m][1] - y; best = Math.min(best, dx * dx + dy * dy); } return Math.sqrt(best); } }], bars: [[190, 70, 7], [190, 240, 7], [360, 70, 7], [360, 240, 7], [110, 336, 7], [300, 336, 7], [480, 336, 7]] };
    [{ x: W.x0, y: W.top, w: W.x1 - W.x0, h: W.floor - W.top, formed: 'lr', wet: 'l', seed: 331, mm: UW }, { x: 40, y: W.floor, w: 520, h: R.y + R.h - W.floor, formed: 't', wet: 't', wetTo: W.x0, seed: 337, mm: UW }].forEach(function (c0) { K.pixels(g); g.drawImage(K.paintConcrete(G, c0), Math.round((c0.x - R.x) * K.K), Math.round((c0.y - R.y) * K.K)); K.units(g); });
    G.bars.forEach(function (b) { stirrup(g, b, b[2], 'ok'); });
    g.strokeStyle = 'rgba(30,27,24,.7)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(W.x0, W.floor); g.lineTo(W.x1, W.floor); g.stroke(); // construction joint under the wall
    var cs = g.createRadialGradient(W.x1, W.floor, 4, W.x1, W.floor, 95); cs.addColorStop(0, 'rgba(30,32,36,.22)'); cs.addColorStop(1, 'rgba(30,32,36,0)'); g.save(); g.beginPath(); g.rect(W.x1, 150, 140, 150); g.clip(); g.fillStyle = cs; g.fillRect(W.x1, 150, 140, 150); g.restore();
    return c;
  }
  function renderW(stage) {
    var K = kit(), R = K.R, c = mkCanvas(K.W, K.H), g = c.getContext('2d'), rnd = lcg(500 + stage.length), idx = CR_STAGES.water.indexOf(stage), ck = crackLine(), i;
    if (!bases.w) { bases.w = baseW(); order.push('w'); if (order.length > 2) delete bases[order.shift()]; }
    g.drawImage(bases.w, 0, 0); K.units(g);
    var mm = K.K * UW, mIM = tex('mIM', function () { return mortarTex(Math.round(140 * K.K), Math.round(200 * K.K), 151, { tone: '#9a9c9b', grain: 1, mm: mm, dens: 0.55 }); });
    // the crack: open and carrying water from the ground to the inside; later filled by crystals from the repaired side
    var wEnd = idx >= 2 ? W.x1 - W.chD - 4 : W.x1;
    g.lineCap = g.lineJoin = 'round'; g.strokeStyle = '#15120f'; g.lineWidth = 2.6; g.beginPath(); ck.forEach(function (p, m) { if (m) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke();
    g.strokeStyle = idx >= 6 ? 'rgba(236,240,242,.95)' : '#3aa9da'; g.lineWidth = 1.5; g.beginPath(); ck.forEach(function (p, m) { if (p[0] > wEnd) return; if (m) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke();
    g.save(); g.beginPath(); g.rect(W.x0, W.top, W.x1 - W.x0, W.floor - W.top); g.clip(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(60,76,92,' + (idx >= 5 ? 0.12 : 0.3) + ')'; g.lineWidth = 26; g.beginPath(); ck.forEach(function (p, m) { if (m) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke(); g.restore();
    if (idx === 0) { // the leak: water runs down the inside face and stands on the floor; the joint under the wall leaks as well
      g.fillStyle = 'rgba(60,180,232,.85)'; g.fillRect(W.x1, W.crackY, 1.8, W.floor - W.crackY); [[W.crackY + 30, 0.8], [W.crackY + 78, 0.7], [W.crackY + 112, 0.75]].forEach(function (d) { K.drop(g, W.x1 + 5, d[0], d[1]); });
      var pg = g.createLinearGradient(0, W.floor - 3.4, 0, W.floor); pg.addColorStop(0, 'rgba(130,210,242,.92)'); pg.addColorStop(1, 'rgba(24,140,200,.95)'); g.fillStyle = pg; g.beginPath(); g.moveTo(W.x1, W.floor); g.quadraticCurveTo(W.x1 + 6, W.floor - 4, W.x1 + 60, W.floor - 3); g.quadraticCurveTo(W.x1 + 120, W.floor - 3.4, W.x1 + 136, W.floor); g.closePath(); g.fill();
    }
    var chase = [[W.x1 + 1, W.crackY - W.chW / 2], [W.x1 - W.chD, W.crackY - W.chW / 2 + 1.5], [W.x1 - W.chD - 1, W.crackY + W.chW / 2 - 1], [W.x1 + 1, W.crackY + W.chW / 2]];
    if (idx >= 1) { // chased open, U-shaped: approx. 20 mm wide, 25 mm deep
      if (idx < 4) { fillTex(g, tex('roughW', function () { return roughTex(Math.round(60 * K.K), Math.round(60 * K.K), 99, K.K * UW); }), chase, W.x1 - 50, W.crackY - 30); var sd = g.createLinearGradient(W.x1 - W.chD, 0, W.x1, 0); sd.addColorStop(0, 'rgba(8,8,10,.5)'); sd.addColorStop(1, 'rgba(8,8,10,.1)'); g.fillStyle = sd; poly(g, chase); g.fill(); g.strokeStyle = 'rgba(20,18,16,.8)'; g.lineWidth = 1; g.beginPath(); chase.forEach(function (p, m) { if (m) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke(); }
      if (idx === 1) { g.fillStyle = 'rgba(60,180,232,.85)'; g.fillRect(W.x1 - W.chD, W.crackY + W.chW / 2 - 2.4, W.chD, 1.6); g.fillRect(W.x1, W.crackY + W.chW / 2 - 2, 1.6, 60); K.drop(g, W.x1 + 4.5, W.crackY + 44, 0.7); }
    }
    var plug = [[W.x1 - W.chD - 1, W.crackY - W.chW / 2 + 1.5], [W.x1 - W.chD + 11, W.crackY - W.chW / 2 + 1], [W.x1 - W.chD + 12, W.crackY + W.chW / 2 - 0.6], [W.x1 - W.chD - 1, W.crackY + W.chW / 2 - 1]];
    if (idx === 2 || idx === 3) { g.fillStyle = '#c9c7c0'; poly(g, plug); g.fill(); K.grainOver(g, rnd, W.x1 - W.chD - 1, W.crackY - W.chW / 2, 13, W.chW, 160, 0.2); g.strokeStyle = 'rgba(30,28,26,.6)'; g.lineWidth = 0.5; poly(g, plug); g.stroke(); } // plugging mortar stops the water at the back of the chase
    var cove = [[W.x1, W.floor - W.cove], [W.x1 + 1, W.floor - W.cove], [W.x1 + W.cove, W.floor - 1], [W.x1 + W.cove, W.floor]]; // rounded below
    function covePath() { g.beginPath(); g.moveTo(W.x1, W.floor - W.cove); g.quadraticCurveTo(W.x1 + W.cove * 0.22, W.floor - W.cove * 0.22, W.x1 + W.cove, W.floor); g.lineTo(W.x1, W.floor); g.closePath(); }
    if (idx === 3) { // crystalline slurry on the flanks of the chase and where the cove will sit
      g.strokeStyle = '#6d7073'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(chase[0][0], chase[0][1] + 1); g.lineTo(plug[1][0], plug[1][1] + 1); g.lineTo(plug[2][0], plug[2][1] - 1); g.lineTo(chase[3][0], chase[3][1] - 1); g.stroke();
      g.beginPath(); g.moveTo(W.x1 + 1.1, W.floor - W.cove - 14); g.lineTo(W.x1 + 1.1, W.floor - 1.1); g.lineTo(W.x1 + W.cove + 14, W.floor - 1.1); g.stroke(); brush(g, W.x1 + 8, W.floor - 34, -24, 22);
    }
    if (idx >= 4) { // ASOCRET-IM: chase filled flush, coved fillet approx. 4 cm
      var fillC = [[W.x1 + 0.4, chase[0][1]], chase[1], chase[2], [W.x1 + 0.4, chase[3][1]]]; fillTex(g, mIM, fillC, W.x1 - 60, W.crackY - 60); g.strokeStyle = 'rgba(70,73,76,.95)'; g.lineWidth = 1.6; g.beginPath(); fillC.forEach(function (p, m) { if (m) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke();
      g.save(); covePath(); g.clip(); K.pixels(g); g.drawImage(mIM, Math.round((W.x1 - 20 - R.x) * K.K), Math.round((W.floor - 110 - R.y) * K.K)); K.units(g); g.restore(); K.shadowOn(g); covePath(); g.strokeStyle = 'rgba(40,38,36,.55)'; g.lineWidth = 0.7; g.stroke(); K.shadowOff(g);
      g.strokeStyle = 'rgba(70,73,76,.95)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(W.x1 + 0.8, W.floor - W.cove); g.lineTo(W.x1 + 0.8, W.floor - 0.8); g.lineTo(W.x1 + W.cove, W.floor - 0.8); g.stroke();
      if (idx === 4) trowel(g, W.x1 + 2, W.crackY, 0, 64);
    }
    if (idx >= 5) { // AQUAFIN-IC over the mortar and the surfaces, two coats
      g.strokeStyle = '#7b7e81'; g.lineWidth = 2.6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(W.x1 + 1.3, W.top + 6); g.lineTo(W.x1 + 1.3, W.floor - W.cove); g.quadraticCurveTo(W.x1 + W.cove * 0.22 + 1.2, W.floor - W.cove * 0.22 - 1.2, W.x1 + W.cove, W.floor - 1.3); g.lineTo(556, W.floor - 1.3); g.stroke(); g.strokeStyle = 'rgba(240,242,244,.45)'; g.lineWidth = 0.6; g.stroke();
      if (idx === 5) brush(g, W.x1 + 8, 96, -8, 26);
    }
    if (idx >= 6) { // crystals grow into the capillaries and the crack from the treated side; the surface is kept damp
      g.save(); g.beginPath(); g.rect(W.x0, W.top, W.x1 - W.x0, W.floor - W.top); g.rect(40, W.floor, 520, 96); g.clip(); g.strokeStyle = 'rgba(248,250,252,.8)'; g.lineWidth = 0.45;
      for (i = 0; i < 900; i++) { var nearCrack = rnd() < 0.35, px = nearCrack ? W.x0 + 30 + rnd() * (W.x1 - W.x0 - 30) : W.x1 - Math.pow(rnd(), 1.8) * 70, py = nearCrack ? W.crackY + (rnd() - 0.5) * 16 : W.top + 8 + rnd() * (W.floor - W.top - 10), a = rnd() * 6.3, l = 1.2 + rnd() * 2.6; if (!nearCrack && rnd() < 0.25) { px = W.x1 + rnd() * 150; py = W.floor + Math.pow(rnd(), 1.8) * 60; } g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); g.stroke(); }
      g.restore(); for (i = 0; i < 40; i++) K.drop(g, W.x1 + 8 + rnd() * 90, W.top + 20 + rnd() * 220, 0.14 + rnd() * 0.18);
    }
    return c;
  }

  /* ---------- hero: the system build-up as a staggered sample panel, seen in elevation. 1 unit = 1 mm, 360 × 360 mm ---------- */
  function hero(px) {
    var K = kit(), S = (px || 1080) / 360, c = mkCanvas(Math.round(360 * S), Math.round(360 * S)), g = c.getContext('2d'), rnd = lcg(911), w = c.width, h = c.height, i, y;
    var BX = [0, 58, 118, 178, 238, 299, 360], barsH = [104, 256], barsV = [30, 148], br = 6.2;
    function U2() { g.setTransform(S, 0, 0, S, 0, 0); } function PX() { g.setTransform(1, 0, 0, 1, 0, 0); }
    function edge(n) { var r = lcg(40 + n * 7), pts = [], x = BX[n]; for (y = -4; y <= 364; y += 6) { x += (r() - 0.5) * (n >= 4 ? 3.2 : 5); x += (BX[n] - x) * 0.18; pts.push([x, y]); } return pts; }
    function clipFrom(n) { var e = edge(n); g.beginPath(); e.forEach(function (p, m) { if (m) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.lineTo(364, 364); g.lineTo(364, -4); g.closePath(); g.clip(); return e; }
    function tile(tx, a) { PX(); g.globalAlpha = a == null ? 1 : a; g.drawImage(tx, 0, 0); g.globalAlpha = 1; U2(); }
    // textures at 3 px per mm
    var rough = roughTex(w, h, 401, S);
    var formed = (function () { var t = mkCanvas(w, h), q = t.getContext('2d'), r = lcg(421), n; q.fillStyle = '#b4b5b1'; q.fillRect(0, 0, w, h); clouds(q, w, h, r, 4, 4, 0.5, 96, 196); clouds(q, w, h, r, 18, 18, 0.35, 96, 190); var pat = q.createPattern(greyNoise(128, 128, r, 70, 190), 'repeat'); q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.35; q.fillStyle = pat; q.fillRect(0, 0, w, h); q.restore();
      for (n = 0; n < 150; n++) { var vr = (0.4 + r() * r() * 2.2) * S, vx = r() * w, vy = r() * h, vg = q.createRadialGradient(vx - vr * 0.3, vy - vr * 0.3, vr * 0.1, vx, vy, vr); vg.addColorStop(0, '#2a2927'); vg.addColorStop(1, '#6d6b66'); q.fillStyle = vg; q.beginPath(); q.arc(vx, vy, vr, 0, 7); q.fill(); q.strokeStyle = 'rgba(255,255,255,.35)'; q.lineWidth = Math.max(0.6, vr * 0.2); q.beginPath(); q.arc(vx, vy, vr, 0.1 * Math.PI, 0.65 * Math.PI); q.stroke(); }
      q.globalAlpha = 0.16; q.fillStyle = '#3c3a36'; for (n = 1; n < 3; n++) q.fillRect(0, Math.round(h * n / 3) - 1, w, 2); q.globalAlpha = 1; return t; })();
    var mortar = (function () { var t = mortarTex(w, h, 431, { tone: '#bdbcb5', grain: 2.4, mm: S, dens: 0.5 }), q = t.getContext('2d'), r = lcg(433), n; q.save(); q.globalCompositeOperation = 'overlay'; q.lineWidth = 2.2 * S; for (n = 0; n < 26; n++) { q.strokeStyle = n % 2 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.09)'; q.beginPath(); q.arc(w * (0.3 + r() * 0.6), h * (1.3 + r() * 0.5), h * (0.6 + n * 0.045), -2.4, -0.7); q.stroke(); } q.restore(); return t; })();
    var fine = (function () { var t = mortarTex(w, h, 439, { tone: '#d3d1c9', grain: 0.9, mm: S, dens: 0.7 }), q = t.getContext('2d'), r = lcg(441), n; q.save(); q.globalCompositeOperation = 'overlay'; q.lineWidth = 5 * S; for (n = 0; n < 70; n++) { q.strokeStyle = n % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)'; var cx = r() * w, cy = r() * h, cr = (14 + r() * 30) * S; q.beginPath(); q.arc(cx, cy, cr, r() * 6, r() * 6 + 2.4); q.stroke(); } q.restore(); return t; })();
    function bar(horizontal, at, a, b, state) { if (horizontal) K.frame(g, 0, at, 90, function () { barRound(g, 0, -b, -a, br, state, rnd); }); else barRound(g, at, a, b, br, state, rnd); }
    function bars(state, x0, x1) { barsV.forEach(function (x) { if (x > x0 - 12 && x < x1 + 12) bar(false, x, -4, 364, state); }); barsH.forEach(function (yb) { bar(true, yb, x0 - 8, x1 + 8, state); }); }
    U2(); g.fillStyle = '#b4b5b1'; g.fillRect(0, 0, 360, 360);
    // 1 damage: the formed face, cracked and rust-stained along the bars, the cover spalled off over them
    tile(formed);
    g.save(); g.globalCompositeOperation = 'multiply'; barsH.forEach(function (yb) { var st = g.createLinearGradient(0, yb - 4, 0, yb + 62); st.addColorStop(0, 'rgba(166,96,44,.55)'); st.addColorStop(1, 'rgba(166,96,44,0)'); g.fillStyle = st; g.fillRect(0, yb - 4, BX[1] + 8, 66); }); g.restore();
    var spall = [[-4, 70], [16, 64], [40, 78], [52, 96], [47, 120], [54, 150], [44, 176], [50, 214], [46, 232], [56, 262], [48, 286], [30, 296], [10, 288], [-4, 294]];
    g.save(); poly(g, spall); g.clip(); tile(rough); g.fillStyle = 'rgba(12,12,14,.3)'; g.fillRect(0, 0, 360, 360); bars('rust', 0, BX[1]); g.restore();
    g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 5 * S; g.shadowOffsetX = 2 * S; g.shadowOffsetY = 2.4 * S; g.strokeStyle = 'rgba(30,26,22,.85)'; g.lineWidth = 1; poly(g, spall); g.stroke(); g.restore();
    g.strokeStyle = '#1d1814'; g.lineWidth = 0.8; g.lineJoin = 'round'; [[30, 0, 64], [30, 296, 360]].forEach(function (cr) { g.beginPath(); var x = cr[0]; g.moveTo(x, cr[1]); for (y = cr[1]; y <= cr[2]; y += 6) { x += (rnd() - 0.5) * 3; g.lineTo(x, y); } g.stroke(); });
    // 2 prepared: broken out to behind the bars, reinforcement blasted bright
    g.save(); var e1 = clipFrom(1); tile(rough); g.fillStyle = 'rgba(12,12,14,.18)'; g.fillRect(0, 0, 360, 360); bars('bright', BX[1], 360); g.restore();
    // 3 corrosion protection on the reinforcement
    g.save(); clipFrom(2); tile(rough); g.fillStyle = 'rgba(12,12,14,.18)'; g.fillRect(0, 0, 360, 360); bars('coat2', BX[2], 360); g.restore();
    // 4 bond coat brushed into the substrate
    g.save(); clipFrom(3); tile(rough); g.fillStyle = 'rgba(72,76,80,.8)'; g.fillRect(0, 0, 360, 360); bars('coat2', BX[3], 360); g.fillStyle = 'rgba(72,76,80,.55)'; g.fillRect(0, 0, 360, 360);
    g.globalAlpha = 0.34; g.lineWidth = 0.7; for (i = 0; i < 520; i++) { g.strokeStyle = i % 3 ? '#e2e5e7' : '#2a2c2e'; var sx = BX[3] - 6 + rnd() * 76, sy = rnd() * 360; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 9, sy + 3 + rnd() * 5, sx + 18 + rnd() * 14, sy + rnd() * 7); g.stroke(); } g.globalAlpha = 1; g.restore();
    // 5 repair mortar, 6 fine smoothing mortar: each layer stands proud of the one before and throws its shadow on it
    [[4, mortar, 9], [5, fine, 3.5]].forEach(function (L) {
      var e = edge(L[0]); g.save(); g.beginPath(); e.forEach(function (p, m) { if (m) g.lineTo(p[0] - 2, p[1]); else g.moveTo(p[0] - 2, p[1]); }); g.lineTo(364, 364); g.lineTo(364, -4); g.closePath(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = L[2] * S; g.shadowOffsetX = -L[2] * 0.5 * S; g.shadowOffsetY = L[2] * 0.35 * S; g.fillStyle = '#9a9b97'; g.fill(); g.restore();
      g.save(); clipFrom(L[0]); tile(L[1]); g.restore();
      g.save(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.beginPath(); e.forEach(function (p, m) { if (m) g.lineTo(p[0] + 0.6, p[1]); else g.moveTo(p[0] + 0.6, p[1]); }); g.stroke(); g.restore();
    });
    // numbered markers, one per step of the build-up
    for (i = 0; i < 6; i++) { var mx = (BX[i] + BX[i + 1]) / 2, my = 330; g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 3 * S; g.shadowOffsetY = 1 * S; g.fillStyle = '#fff'; g.beginPath(); g.arc(mx, my, 10.5, 0, 7); g.fill(); g.restore(); g.fillStyle = '#231f20'; g.font = '700 13px Jost, "Futura PT", Futura, "Century Gothic", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), mx, my + 0.6); }
    return c.toDataURL('image/jpeg', 0.9);
  }

  function render(key) {
    var letter = key.charAt(1), idx = +key.charAt(2), scn = { s: 'steel', b: 'breakout', f: 'surface', w: 'water' }[letter], stage = CR_STAGES[scn][idx] || CR_STAGES[scn][0];
    var c = letter === 'w' ? renderW(stage) : renderA(letter, stage);
    return c.toDataURL('image/jpeg', 0.9);
  }
  return { render: render, hero: hero, rough: roughTex, mortar: mortarTex, FX: FX, U: U, W: W, A: A, UW: UW };
})();

