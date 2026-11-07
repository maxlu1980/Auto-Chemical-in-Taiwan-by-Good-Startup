/* ===== [tw_arch.js] ===== */
/* ===== ARCH — the buildings of AUTO 台灣島 =====
   The six high-speed-rail stations as their buildings read from the street (Taipei: the square block under a double hipped roof of
   orange-brown tiles; Taoyuan: the long glass hall under a thin flat roof on a colonnade; Hsinchu: the silver shell that rises from a
   white anchor like a folded sheet; Taichung: the stone podium and the long vault on V-struts over the platforms; Tainan: the low grey
   hipped roof with its oval glass lantern over a reflecting pool; Zuoying: the tall box under a great white roof on radiating struts),
   each with its platforms on the viaduct, its plaza, the product world it opens and its site master; the Taiwanese town around them
   (arcade shophouses with stacked signboards, iron window cages, rooftop water tanks and tin-roofed additions, apartments with balconies,
   lamps, parked scooters). Everything is merged per district into a handful of draw calls. Landmarks live in tw_land.js. */
var ARCH = (function () {
  var G, K, Q, M, W, CTX, ATL = null, V3 = THREE.Vector3;
  function lin(h) { return K.lin(h); }
  var FONT = '"Noto Sans TC","Noto Sans JP","PingFang TC","Microsoft JhengHei",sans-serif';
  /* ---------- a district frame: local x along the rail, +z towards the plaza ---------- */
  function Frame(x, z, rot, y) { var m = new THREE.Matrix4().makeRotationY(rot); m.setPosition(x, y || 0, z); var S = K.Set({ frame: m }); var c = Math.cos(rot), s = Math.sin(rot);
    S.x = x; S.z = z; S.rot = rot; S.y = y || 0; S.m = m; S.toW = function (lx, lz) { return [x + lx * c + lz * s, z - lx * s + lz * c]; }; S.yaw = function (r) { return rot + (r || 0); }; return S; }
  /* shorthand: add geo to batch key at p / r / s with colour */
  function A(S, key, geo, p, r, s, col, ex) { if (window.AUDIT) audit(S, key, geo, p, s); S.b(key, key === 'sign' || key === 'signL' ? { uv: true } : key === 'leaf' ? { sway: true } : null).add(geo, { p: p, r: r, s: s }, col, ex); }
  function audit(S, key, geo, p, s) { p = p || [0, 0, 0]; if (!geo.boundingBox) geo.computeBoundingBox(); var bb = geo.boundingBox, sc = s == null ? [1, 1, 1] : typeof s === 'number' ? [s, s, s] : s, gy = S.gy || 0, y0 = p[1] + bb.min.y * sc[1], y1 = p[1] + bb.max.y * sc[1]; if (y0 - gy > 0.25 || y1 - gy < 0.35) return; var cx = (bb.min.x + bb.max.x) / 2 * sc[0], cz = (bb.min.z + bb.max.z) / 2 * sc[2], rr = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2 * Math.max(sc[0], sc[2]); if (rr > 3) return; var w = S.toW(p[0] + cx, p[2] + cz); var st = String(new Error().stack).split('\n').slice(2, 6).map(function (l) { var m = l.match(/:(\d+):(\d+)\)?$/); return m ? m[1] : ''; }).join('<'); (window.AUDIT_PROPS = window.AUDIT_PROPS || []).push({ k: key, x: w[0], z: w[1], r: rr, h: y1 - gy, st: st }); }
  function box(S, key, w, h, d, p, col, r, rad) { A(S, key, rad ? K.rbox(w, h, d, rad, 2) : K.box(w, h, d), [p[0], p[1] + h / 2, p[2]], r, null, col); }
  function collider(S, lx, lz, hw, hd, r) { var w = S.toW(lx, lz); W.colliders.push({ x: w[0], z: w[1], hw: hw, hd: hd, rot: S.rot + (r || 0) }); }
  function ccol(S, lx, lz, rad) { var w = S.toW(lx, lz); W.colliders.push({ x: w[0], z: w[1], r: rad }); }
  function atlas() { if (!ATL) ATL = K.Atlas(Q.low ? 1024 : 2048); return ATL; }
  /* a sign: text drawn on the atlas, a quad (front and back) */
  function signRect(lines, o) { o = o || {}; var w = o.w || 256, h = o.h || 96; return atlas().put(w, h, function (g, W2, H2) { g.fillStyle = o.bg || '#fff8ec'; if (o.round !== false) { K.rr(g, 2, 2, W2 - 4, H2 - 4, o.rad == null ? 14 : o.rad); g.fill(); } else g.fillRect(0, 0, W2, H2); if (o.edge) { g.lineWidth = o.ew || 6; g.strokeStyle = o.edge; g.stroke(); } g.fillStyle = o.ink || '#2b2420'; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (o.vert) { var chars = lines[0].split(''), n = chars.length, fs = Math.min(W2 * 0.78, (H2 - 16) / n * 0.92); g.font = '900 ' + fs + 'px ' + FONT; chars.forEach(function (ch, i) { g.fillText(ch, W2 / 2, 8 + (i + 0.5) * (H2 - 16) / n); }); return; }
      var fs1 = o.size || H2 * (lines[1] ? 0.46 : 0.62); g.font = (o.weight || '900') + ' ' + fs1 + 'px ' + FONT; g.fillText(lines[0], W2 / 2, lines[1] ? H2 * 0.38 : H2 / 2, W2 - 16); if (lines[1]) { g.font = '700 ' + H2 * 0.24 + 'px ' + FONT; g.fillStyle = o.sub || o.ink || '#2b2420'; g.fillText(lines[1], W2 / 2, H2 * 0.76, W2 - 16); } }); }
  function signQuad(S, rect, w, h, p, r, both, key) { var g = new THREE.PlaneGeometry(w, h); if (both) g.translate(0, 0, 0.006); A(S, key || 'sign', g, p, r, null, 0xffffff, { uvRect: rect }); if (both) { /* the back face reads the right way round: a second quad, a hair behind, so that neither mirrors nor fights the other */ var g2 = new THREE.PlaneGeometry(w, h); g2.rotateY(Math.PI); g2.translate(0, 0, -0.006); A(S, key || 'sign', g2, p, r, null, 0xffffff, { uvRect: rect }); } }
  /* a relabelable board (district names): its own small canvas */
  function board(S, x, y, z, rot, w, h, draw) { var c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.std({ map: t, rough: 0.6, emissive: 0xffffff, ei: 0.0 })); m.material.emissiveMap = t; var wp = S.toW(x, z); m.position.set(wp[0], S.y + y, wp[1]); m.rotation.y = S.rot + (rot || 0); W.scene.add(m);
    var B = { mesh: m, tex: t, canvas: c, draw: function (fn) { var g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); fn(g, c.width, c.height); t.needsUpdate = true; } }; if (draw) B.draw(draw); W.relabelers.push({ time: function (P) { m.material.emissiveIntensity = P.night * 0.9; } }); return B; }
  /* windows: glass panes (and lit panes that glow at night) on a wall plane; wall faces +z in the given rotation */
  function windows(S, cx, cy, cz, ry, cols, rows, ww, wh, gx, gy, o) { o = o || {}; var c = Math.cos(ry), s = Math.sin(ry), i, j, r = K.seeded(Math.round(cx * 13 + cz * 7 + cy * 3) + 5);
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) { var lx = (i - (cols - 1) / 2) * gx, ly = cy + j * gy, px = cx + lx * c, pz = cz - lx * s, lit = r() < (o.lit == null ? 0.55 : o.lit);
      A(S, o.see ? 'glassSee' : 'glass', K.box(ww, wh, 0.04), [px + s * 0.02, ly, pz + c * 0.02], [0, ry, 0], null, o.glass || 0x5d7d92);
      if (lit) A(S, 'lights', new THREE.PlaneGeometry(ww * 0.86, wh * 0.82), [px + s * 0.045, ly, pz + c * 0.045], [0, ry, 0], null, o.light || (r() < 0.3 ? 0xffe6b0 : 0xfff2d6));
      if (o.frame !== false) A(S, 'vc', K.box(ww + 0.06, 0.05, 0.07), [px, ly - wh / 2 - 0.02, pz], [0, ry, 0], null, o.sill || 0xf2f0ea);
      if (o.cage) { A(S, 'vc', K.box(ww + 0.1, wh + 0.08, 0.02), [px + s * 0.16, ly, pz + c * 0.16], [0, ry, 0], null, 0x8f948f); for (var k = 0; k < 5; k++) A(S, 'vc', K.box(0.018, wh + 0.08, 0.16), [px + s * 0.08 + (k - 2) * ww / 4.5 * c, ly, pz + c * 0.08 - (k - 2) * ww / 4.5 * s], [0, ry, 0], null, 0x7e837e); } } }
  /* ---------- the town kit ---------- */
  var SH_TEXT = ['阿明五金', '好時咖啡', '建材行', '豆花', '珍珠奶茶', '雞排', '水電行', '眼鏡', '藥局', '麵店', '早餐店', '冰店', '文具', '茶行', '機車行', '牙醫診所', '書局', '花店', '便當', '油漆行', '鐘錶', '銀樓', '肉圓', '洗衣', '五金百貨', '鞋店', '電器行', '小吃', '水果行', '燒臘'];
  var SH_COL = [['#c8102e', '#ffffff'], ['#0b5ea8', '#ffffff'], ['#f4c20d', '#2b2420'], ['#1c8a4a', '#ffffff'], ['#ffffff', '#c8102e'], ['#e86a12', '#ffffff'], ['#5a2d82', '#ffffff'], ['#ffffff', '#0b5ea8']];
  var FACADE = [0xe6d8c0, 0xd9c7b6, 0xe8c9b4, 0xc9d3cc, 0xdcd0bc, 0xd3b7a6, 0xc4d2d8, 0xe2c5ae, 0xb9c9b6, 0xd8b9a0, 0xcfc8d8, 0xe0d2a8];
  var TANK = [0xd9dee2, 0xf2c94c, 0x3a8fd0, 0xd9dee2];
  function onRoad(S, x, z, ry, w, d) { /* the safety net: no building on a road (the raster of the ring, the spurs, the mountain roads) */ var R2 = W.roadG; if (!R2) return false; var c = Math.cos(ry), s = Math.sin(ry), i, j; for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) { var lx = i * (w / 2 - 0.15), lz = j * (d / 2 - 0.15), wq = S.toW(x + lx * c + lz * s, z - lx * s + lz * c), cx = Math.floor(wq[0] - G.X0), cz = Math.floor(wq[1] - G.Z0); if (cx >= 0 && cz >= 0 && cx < G.GW && cz < G.GH && R2[cz * G.GW + cx]) return true; } return false; }
  /* is the footprint (world centre, yaw, half sizes) already taken by something solid? m < 0 tolerates a touch */
  function overlaps(x, z, rot, hw, hd, m) { var co = Math.cos(rot), si = Math.sin(rot), A0 = [[co, -si], [si, co]];
    return W.colliders.some(function (c) { if (Math.abs(c.x - x) > hw + hd + 9 || Math.abs(c.z - z) > hw + hd + 9) return false;
      if (c.r) { var ex = c.x - x, ez = c.z - z, lxx = ex * co - ez * si, lzz = ex * si + ez * co, qx = Math.max(-hw, Math.min(hw, lxx)), qz = Math.max(-hd, Math.min(hd, lzz)); return Math.hypot(lxx - qx, lzz - qz) < c.r + m; }
      var c2 = Math.cos(c.rot), s2 = Math.sin(c.rot), B0 = [[c2, -s2], [s2, c2]], dx = c.x - x, dz = c.z - z;
      return A0.concat(B0).every(function (v) { var pa = Math.abs(A0[0][0] * v[0] + A0[0][1] * v[1]) * hw + Math.abs(A0[1][0] * v[0] + A0[1][1] * v[1]) * hd, pb = Math.abs(B0[0][0] * v[0] + B0[0][1] * v[1]) * c.hw + Math.abs(B0[1][0] * v[0] + B0[1][1] * v[1]) * c.hd; return Math.abs(dx * v[0] + dz * v[1]) < pa + pb + m; }); }); }
  function taken(S, x, z, ry, w, d) { var q = S.toW(x, z); return overlaps(q[0], q[1], S.rot + ry, w / 2, d / 2, -0.03); }
  function shophouse(S, x, z, ry, w, d, floors, r, o) { o = o || {}; if (!o.force && (onRoad(S, x, z, ry, w, d) || taken(S, x, z, ry, w, d))) return 0; var fh = 0.62, h = floors * fh + 0.2, fc = FACADE[Math.floor(r() * FACADE.length)], c = Math.cos(ry), s = Math.sin(ry);
    var gy = S.gy || 0; function L(lx, ly, lz) { return [x + lx * c + lz * s, ly + gy, z - lx * s + lz * c]; }
    box(S, o.see ? 'vcSee' : 'vc', w, h - 0.62, d, L(0, 0.62, -0.25), fc, [0, ry, 0]);
    box(S, 'vc', w, 0.62, d - 0.9, L(0, 0, -0.7), 0xbdb3a4, [0, ry, 0]); /* the shop floor, set back */
    A(S, 'glass', K.box(w * 0.86, 0.48, 0.03), L(0, 0.3, d / 2 - 0.92), [0, ry, 0], null, 0x506a78); if (r() < 0.75) A(S, 'lights', new THREE.PlaneGeometry(w * 0.8, 0.42), L(0, 0.3, d / 2 - 0.9), [0, ry, 0], null, 0xfff0d0);
    [-w / 2 + 0.09, w / 2 - 0.09].forEach(function (px) { box(S, 'vc', 0.16, 0.62, 0.16, L(px, 0, d / 2 - 0.12), 0xd8cfc0, [0, ry, 0]); }); /* the arcade's pillars */
    A(S, 'vc', K.box(w + 0.04, 0.06, 0.1), L(0, 0.64, d / 2 - 0.05), [0, ry, 0], null, 0xcfc6b8);
    windows(S, L(0, 0, d / 2 - 0.25)[0], gy + 0.62 + 0.32, L(0, 0, d / 2 - 0.25)[2], ry, Math.max(1, Math.round(w / 1.1)), floors - 1, 0.62, 0.36, w / Math.max(1, Math.round(w / 1.1)), fh, { cage: r() < 0.6, lit: 0.5, see: o.see });
    /* the stacked signboard */
    if (!o.nosign) { var t = SH_TEXT[Math.floor(r() * SH_TEXT.length)], cc = SH_COL[Math.floor(r() * SH_COL.length)], vrt = r() < 0.6, rect = vrt ? signRect([t], { w: 48, h: 24 + 40 * t.length, bg: cc[0], ink: cc[1], vert: true, rad: 6 }) : signRect([t], { w: 192, h: 56, bg: cc[0], ink: cc[1], rad: 6 });
      if (vrt) { var sh2 = 0.22 + 0.15 * t.length; signQuad(S, rect, 0.3, sh2, L(w / 2 - 0.2, 0.75 + sh2 / 2 + 0.05, d / 2 + 0.22), [0, ry + Math.PI / 2, 0], true); A(S, 'vc', K.box(0.04, sh2, 0.32), L(w / 2 - 0.2, 0.75 + sh2 / 2 + 0.05, d / 2 + 0.22), [0, ry, 0], null, cc[0] === '#ffffff' ? 0xdddddd : 0x444444); }
      else signQuad(S, rect, Math.min(w * 0.85, 1.6), 0.36, L(0, 0.84, d / 2 + 0.03), [0, ry, 0]); }
    /* the roof: a parapet, a water tank, perhaps a tin-roofed addition */
    box(S, 'vc', w, 0.12, d, L(0, h - 0.02, -0.25), [0x9aa59f, 0xb07a5a, 0x8e9aa6, 0xa89a7a][Math.floor(r() * 4)], [0, ry, 0]);
    if (r() < 0.55) { var tc = TANK[Math.floor(r() * TANK.length)]; A(S, 'gloss', K.cyl(0.22, 0.22, 0.42, 14), L(w * 0.2, h + 0.36, -d * 0.2), null, null, tc); A(S, 'vc', K.box(0.5, 0.15, 0.5), L(w * 0.2, h + 0.08, -d * 0.2), [0, ry, 0], null, 0x8a8f8f); }
    if (r() < 0.45) { var aw = w * 0.7, ad = d * 0.5, roofc = r() < 0.5 ? 0x3b78b8 : 0x4f9a6a; box(S, 'vc', aw, 0.5, ad, L(-w * 0.1, h + 0.08, -d * 0.15), 0xd8d8d0, [0, ry, 0]); A(S, 'vc', K.gable(aw, ad, 0.25, { ov: 0.08 }), L(-w * 0.1, h + 0.58, -d * 0.15), [0, ry, 0], null, roofc); }
    if (r() < 0.6) A(S, 'vc', K.rbox(0.32, 0.22, 0.2, 0.03, 2), L(-w * 0.3, 1.3, d / 2 - 0.12), [0, ry, 0], null, 0xeeeeea); /* an air conditioner */
    collider(S, x - (S.x ? 0 : 0), z, w / 2, d / 2, ry); return h; }
  function apartment(S, x, z, ry, w, d, floors, r, o) { o = o || {}; if (!o.force && (onRoad(S, x, z, ry, w, d) || taken(S, x, z, ry, w, d))) return 0; var fh = 0.62, h = floors * fh + 0.3, fc = FACADE[Math.floor(r() * FACADE.length)], c = Math.cos(ry), s = Math.sin(ry), gy = S.gy || 0; function L(lx, ly, lz) { return [x + lx * c + lz * s, ly + gy, z - lx * s + lz * c]; }
    box(S, o.see ? 'vcSee' : 'vc', w, h, d, L(0, 0, 0), fc, [0, ry, 0], 0.03);
    var cols = Math.max(2, Math.round(w / 1.2)); windows(S, L(0, 0, d / 2)[0], gy + 0.5, L(0, 0, d / 2)[2], ry, cols, floors, 0.6, 0.38, w / cols, fh, { lit: 0.45, see: o.see });
    for (var j = 1; j < floors; j++) A(S, 'vc', K.box(w * 0.92, 0.06, 0.32), L(0, j * fh + 0.12, d / 2 + 0.16), [0, ry, 0], null, 0xe8e4dc); /* the balconies */
    box(S, 'vc', w + 0.04, 0.14, d + 0.04, L(0, h, 0), [0x9aa59f, 0x8e9aa6, 0xa89a7a][Math.floor(r() * 3)], [0, ry, 0]);
    if (r() < 0.8) { A(S, 'gloss', K.cyl(0.26, 0.26, 0.5, 14), L(w * 0.25, h + 0.45, -d * 0.15), null, null, TANK[Math.floor(r() * 4)]); A(S, 'gloss', K.cyl(0.26, 0.26, 0.5, 14), L(w * 0.25 - 0.62, h + 0.45, -d * 0.15), null, null, TANK[Math.floor(r() * 4)]); }
    collider(S, x, z, w / 2, d / 2, ry); return h; }
  function lamp(S, lx, lz, h) { h = h || 1.7; var p = S.toW(lx, lz), gy = S.gy || 0; A(S, 'gloss', K.cyl(0.035, 0.05, h, 8), [lx, gy + h / 2, lz], null, null, 0x4a5058); A(S, 'gloss', K.box(0.38, 0.05, 0.1), [lx, gy + h, lz], null, null, 0x4a5058); A(S, 'lights', K.box(0.26, 0.03, 0.08), [lx + 0.06, gy + h - 0.035, lz], null, null, 0xfff1cf); W.glows.push([p[0], gy + h - 0.12, p[1], 1.1]); ccol(S, lx, lz, 0.07); }
  function scooter(S, lx, lz, ry, col) { collider(S, lx, lz, 0.1, 0.3, ry); var c = Math.cos(ry), s = Math.sin(ry), gy = S.gy || 0; function L(a, y, b) { return [lx + a * c + b * s, y + gy, lz - a * s + b * c]; } A(S, 'gloss', K.rbox(0.16, 0.16, 0.52, 0.06, 2), L(0, 0.2, 0), [0, ry, 0], null, col); A(S, 'vc', K.rbox(0.14, 0.06, 0.24, 0.03, 2), L(0, 0.32, -0.08), [0, ry, 0], null, 0x2b2b2e); A(S, 'vc', K.cyl(0.08, 0.08, 0.05, 10), L(0, 0.08, 0.2), [0, ry, Math.PI / 2], null, 0x222222); A(S, 'vc', K.cyl(0.08, 0.08, 0.05, 10), L(0, 0.08, -0.22), [0, ry, Math.PI / 2], null, 0x222222); A(S, 'gloss', K.box(0.3, 0.03, 0.03), L(0, 0.46, 0.2), [0, ry, 0], null, 0x777777); }
  function tree(S, type, lx, lz, s) { var T = W.TREE[type]; if (!T) return; A(S, 'leaf', T, [lx, S.gy || 0, lz], [0, (lx * 7 + lz * 3) % 6.28, 0], s || 1, 0xffffff); var w = S.toW(lx, lz); W.colliders.push({ x: w[0], z: w[1], r: ({ banyan: 0.3, bamboo: 0.22, palm: 0.1, betel: 0.08 }[type] || 0.14) * (s || 1), tree: 1 }); }
  function bench(S, lx, lz, ry) { var gy = S.gy || 0; A(S, 'vc', K.rbox(0.9, 0.06, 0.3, 0.02, 2), [lx, gy + 0.32, lz], [0, ry, 0], null, 0xb07a48); A(S, 'vc', K.rbox(0.9, 0.22, 0.05, 0.02, 2), [lx - Math.sin(ry) * 0.14, gy + 0.48, lz - Math.cos(ry) * 0.14], [0, ry, 0], null, 0xb07a48); [-0.36, 0.36].forEach(function (o) { A(S, 'vc', K.box(0.05, 0.32, 0.26), [lx + Math.cos(ry) * o, gy + 0.16, lz - Math.sin(ry) * o], [0, ry, 0], null, 0x3e4248); }); collider(S, lx, lz, 0.46, 0.17, ry); }
  function finish(S, id, o) { o = o || {}; var g = new THREE.Group(); g.name = id; S.build(g, M); W.scene.add(g); var b = new THREE.Box3().setFromObject(g), sp = new THREE.Sphere(); b.getBoundingSphere(sp); W.parts.push({ o: g, x: sp.center.x, z: sp.center.z, r: sp.radius }); return g; }
  /* ---------- the platforms on the viaduct ---------- */
  function platforms(S0, stop, roof) { var P = CTX.railAt(stop.s), y = P.y, rot = Math.atan2(P.dx, P.dz) - Math.PI / 2; var S = Frame(P.x, P.z, rot, 0);
    [-1, 1].forEach(function (sd) { box(S, 'vc', 13, 0.3, 1.0, [0, y - 0.28, sd * 1.54], 0xd8d4ca); box(S, 'vc', 13, 0.04, 0.12, [0, y + 0.02, sd * 1.1], 0xf2c94c); for (var i = -3; i <= 3; i++) { box(S, 'vc', 0.4, y - 0.3, 0.4, [i * 2, 0.0, sd * 1.58], 0xd2cfc6); ccol(S, i * 2, sd * 1.58, 0.25); } box(S, 'vc', 13, 0.35, 0.06, [0, y + 0.02, sd * 2.04], 0xe6e2da); });
    if (roof === 'flat') { for (var j = -3; j <= 3; j++) [-1, 1].forEach(function (sd) { A(S, 'gloss', K.cyl(0.04, 0.04, 1.3, 8), [j * 2, y + 0.65, sd * 1.78], null, null, 0xe8e8e8); }); box(S, 'vc', 13.4, 0.12, 4.4, [0, y + 1.3, 0], 0xf4f4f0); }
    else if (roof === 'vault') { A(S, 'vc', (function () { var g = new THREE.CylinderGeometry(2.8, 2.8, 15, 28, 1, true, -Math.PI / 2 - 0.9, 1.8); g.rotateZ(Math.PI / 2); return g; })(), [0, y - 0.5, 0], null, null, 0xc9ced3); for (var k = -3; k <= 3; k++) [-1, 1].forEach(function (sd) { A(S, 'gloss', K.cyl(0.05, 0.07, 2.3, 8), [k * 2.2, y + 0.4, sd * 1.93], [sd * 0.38, 0, 0], null, 0xf2f2f2); A(S, 'gloss', K.cyl(0.05, 0.07, 2.3, 8), [k * 2.2, y + 0.4, sd * 1.93], [sd * -0.38 + sd * 0.0, 0, 0.35], null, 0xf2f2f2); }); }
    else if (roof === 'shuttle') { /* the loom shuttle: a long spindle shell over both platforms, tapering to points, ribbed, with a glazed spine */
      var LX = 10.5; A(S, 'gloss', K.surf(48, 16, function (u, v, p) { var x = -LX + u * 2 * LX, t = Math.max(0, 1 - Math.pow(x / LX, 2)), w = 3.4 * Math.pow(t, 0.55) + 0.05, h = 2.5 * Math.pow(t, 0.6), a = v * Math.PI; p.set(x, y - 0.4 + Math.sin(a) * h, Math.cos(a) * w); }, true), null, null, null, 0xeef0f1);
      A(S, 'glass', K.surf(40, 3, function (u, v, p) { var x = -LX * 0.8 + u * 1.6 * LX, t = Math.max(0, 1 - Math.pow(x / LX, 2)), w = 3.4 * Math.pow(t, 0.55) + 0.05, h = 2.5 * Math.pow(t, 0.6), a = Math.PI * (0.42 + v * 0.16); p.set(x, y - 0.38 + Math.sin(a) * h + 0.02, Math.cos(a) * w); }, true), null, null, null, 0x8fb8c8);
      for (var rb = -6; rb <= 6; rb++) { var xr = rb * 1.45, tr = Math.max(0, 1 - Math.pow(xr / LX, 2)), wr = 3.4 * Math.pow(tr, 0.55) + 0.07, hr = 2.5 * Math.pow(tr, 0.6), arc = []; for (var ka = 0; ka <= 12; ka++) { var aa = ka / 12 * Math.PI; arc.push([xr, y - 0.4 + Math.sin(aa) * (hr + 0.03), Math.cos(aa) * wr]); } A(S, 'gloss', K.tube(arc, 0.045, 24, 5), null, null, null, 0xd0d5d9); }
      for (var k2 = -3; k2 <= 3; k2++) [-1, 1].forEach(function (sd) { A(S, 'gloss', K.cyl(0.06, 0.08, 1.2, 8), [k2 * 2.2, y + 0.2, sd * 2.0], [sd * 0.25, 0, 0], null, 0xf2f2f2); }); }
    else if (roof === 'big') { box(S, 'vc', 14, 0.2, 5.6, [0, y + 1.5, 0], 0xb8bec4); for (var q = -3; q <= 3; q++) [-1, 1].forEach(function (sd) { A(S, 'gloss', K.cyl(0.05, 0.06, 1.5, 8), [q * 2.2, y + 0.75, sd * 2.08], null, null, 0xdfe3e6); }); }
    finish(S, 'plat' + stop.s); return P; }
  /* a street-food stall: the stainless cart, the striped awning, a pot and its steam, the board with the dish, a red lantern, two stools; registered for the food card */
  var STRIPE = [0xd93a3a, 0xf6f2e8];
  function stall(S, lx, lz, ry, food, name, o) { o = o || {}; var gy = S.gy || 0, c = Math.cos(ry), s = Math.sin(ry); function L(a, yy, b) { return [lx + a * c + b * s, gy + yy, lz - a * s + b * c]; }
    A(S, 'gloss', K.rbox(1.4, 0.72, 0.6, 0.04, 2), L(0, 0.46, 0), [0, ry, 0], null, 0xc9ced3); A(S, 'vc', K.box(1.52, 0.05, 0.72), L(0, 0.84, 0), [0, ry, 0], null, 0xa8784a);
    [[-0.58, -0.24], [0.58, -0.24], [-0.58, 0.24], [0.58, 0.24]].forEach(function (w) { A(S, 'vc', K.cyl(0.07, 0.07, 0.05, 10), L(w[0], 0.08, w[1]), [0, ry, Math.PI / 2], null, 0x2a2b2e); });
    [[-0.72, -0.34], [0.72, -0.34], [-0.72, 0.4], [0.72, 0.4]].forEach(function (w) { A(S, 'gloss', K.cyl(0.02, 0.02, 1.5, 6), L(w[0], 0.84 + 0.75 * (w[1] > 0 ? 0.92 : 1.0), w[1]), null, null, 0x9aa0a6); });
    for (var i = 0; i < 6; i++) A(S, 'vc', K.box(0.27, 0.035, 1.05), L(-0.68 + i * 0.27, 2.24, 0.03), [0.12, ry, 0], null, STRIPE[i % 2]);
    A(S, 'gloss', K.cyl(0.2, 0.18, 0.26, 16), L(0.35, 0.99, 0), null, null, 0x9aa0a6); A(S, 'vc', K.cyl(0.2, 0.2, 0.02, 16), L(0.35, 1.12, 0), null, null, 0x6a4a2a);
    for (var k = 0; k < 4; k++) A(S, 'vc', K.cyl(0.07, 0.07, 0.03, 10), L(-0.4 + k * 0.16, 0.88, -0.12), null, null, 0xf4efe6);
    A(S, 'lights', K.sph(0.11, 12, 10), L(0.72, 1.95, 0.4), null, [1, 1.2, 1], 0xff3a22);
    [-0.4, 0.4].forEach(function (a) { A(S, 'vc', K.cyl(0.13, 0.12, 0.42, 12), L(a, 0.21, 0.75), null, null, 0xd93a3a); });
    var rect = signRect(name, { w: 384, h: 128, bg: '#c8302a', ink: '#ffffff', sub: '#ffe0a0' }); signQuad(S, rect, 1.1, 0.37, L(0, 0.52, 0.31), [0, ry, 0], false);
    collider(S, lx, lz, 0.78, 0.4, ry); var wp = S.toW(lx + 0 * c + 0.95 * s, lz + 0.95 * c), sp = S.toW(lx, lz);
    W.steam = W.steam || []; W.steam.push([sp[0] + 0.35 * c, gy + 1.15, sp[1] - 0.35 * s]);
    W.stalls = W.stalls || []; W.stalls.push({ food: food, x: sp[0], z: sp[1], y: gy }); W.interact.push({ id: food, kind: 'food', x: wp[0], z: wp[1], r: 1.3 }); }
  /* ================= the stations ================= */
  /* the fold of Tainan and Chiayi: a hall of glass, the roof level over it and folding down to the ground at one end (dir -1 west, +1 east) */
  function foldStation(S, y, dir, baseCol, name) { var H = 2.1, L0 = -3.2, L1 = 7.6;
    A(S, 'glassSee', K.box(9.2, H - 0.15, 4.8), [-dir * 0.8, y + (H - 0.15) / 2, 0], null, null, 0x5a7f8e); A(S, 'lights', new THREE.PlaneGeometry(8.8, 1.7), [-dir * 0.8, y + 0.9, 2.42], null, null, 0xfff1d8);
    var roof = K.surf(30, 6, function (u, v, p) { var s = L0 + (L1 - L0) * u, x = dir * s, z = -3.0 + v * 6.3, yy = s < 4.2 ? H : H * (1 - Math.pow((s - 4.2) / (L1 - 4.2), 1.2)); p.set(-x, yy + 0.08, z); }, true); A(S, 'gloss', roof, [0, y, 0], null, null, 0xa4abb2);
    var edge = []; for (var k = 0; k <= 30; k++) { var s2 = L0 + (L1 - L0) * k / 30, yy2 = s2 < 4.2 ? H : H * (1 - Math.pow((s2 - 4.2) / (L1 - 4.2), 1.2)); edge.push([-dir * s2, y + yy2 + 0.08, 3.3]); } A(S, 'gloss', K.tube(edge, 0.06, 60, 6), null, null, null, 0xf2f2f2);
    for (var i = 0; i < 5; i++) { var x = -dir * (L0 + 0.8 + i * 1.6), z = 2.75; A(S, 'gloss', K.cyl(0.09, 0.12, H * 0.55, 10), [x, y + H * 0.275, z], null, null, 0xf2f2f2); [[-0.55, -0.3], [0.55, -0.3], [0, 0.35]].forEach(function (b) { A(S, 'gloss', K.tube([[x, y + H * 0.55, z], [x + b[0] * 0.6, y + H * 0.8, z + b[1] * 0.6], [x + b[0], y + H, z + b[1]]], 0.05, 8, 6), null, null, null, 0xf2f2f2); }); A(S, 'vc', K.cyl(0.18, 0.2, 0.22, 12), [x, y + 0.11, z], null, null, baseCol); ccol(S, x, z, 0.16); }
    var lg = new THREE.CylinderGeometry(1, 1, 0.45, 40, 1, false); lg.scale(1.7, 1, 0.8); A(S, 'glass', lg, [-dir * 0.4, y + H + 0.3, 0.3], null, null, 0x8fb4c4); var rg = new THREE.TorusGeometry(1, 0.05, 6, 40); rg.rotateX(Math.PI / 2); rg.scale(1.72, 1, 0.82); A(S, 'gloss', rg, [-dir * 0.4, y + H + 0.53, 0.3], null, null, 0xf2f2f2);
    collider(S, dir * 5.6, 0.2, 2.0, 3.0); /* under the low end of the fold */
    return { door: [-dir * 0.8, 3.2], name: name, signY: 1.55, signZ: 2.45, signW: 2.4, col: [4.8, 2.6] }; }
  var STATIONS = {
    tpe: function (S, y) { /* Taipei: a square block, a band of lattice windows, the double hipped roof of orange-brown tiles */
      box(S, 'vcSee', 9.6, 2.5, 6.6, [0, y, 0], 0xe9dfc8, null, 0.05);
      for (var i = 0; i < 18; i++) { A(S, 'vc', K.box(0.08, 0.9, 0.06), [-4.25 + i * 0.5, y + 1.75, 3.33], null, null, 0x5b5a56); } A(S, 'glass', K.box(9.0, 0.9, 0.04), [0, y + 1.75, 3.31], null, null, 0x6b8796); A(S, 'lights', new THREE.PlaneGeometry(8.8, 0.8), [0, y + 1.75, 3.335], null, null, 0xfff0c8);
      for (var j = 0; j < 9; j++) { box(S, 'vc', 0.28, 1.2, 0.28, [-4.0 + j * 1.0, y, 3.45], 0xf4eee2); ccol(S, -4.0 + j * 1.0, 3.45, 0.17); } A(S, 'glass', K.box(9.0, 1.1, 0.04), [0, y + 0.6, 3.2], null, null, 0x58707e); A(S, 'lights', new THREE.PlaneGeometry(8.6, 1.0), [0, y + 0.6, 3.23], null, null, 0xffecc0);
      A(S, 'vc', K.hip(9.6, 6.6, 1.15, { ov: 0.55 }), [0, y + 2.5, 0], null, null, 0xc4693a); box(S, 'vc', 7.2, 0.55, 4.4, [0, y + 3.15, 0], 0xe9dfc8); A(S, 'vc', K.hip(7.2, 4.4, 0.9, { ov: 0.4 }), [0, y + 3.7, 0], null, null, 0xbf6234);
      A(S, 'vc', K.box(10.9, 0.08, 0.1), [0, y + 2.5, 3.85], null, null, 0xf4f0e6); A(S, 'vc', K.box(10.9, 0.08, 0.1), [0, y + 2.5, -3.85], null, null, 0xf4f0e6);
      return { door: [0, 3.9], name: ['臺北車站', 'TAIPEI'], signY: 1.75, signZ: 3.44, signW: 2.9, col: [5.2, 3.6] }; },
    tao: function (S, y) { /* Taoyuan: the palace lantern — a long glass hall between a heavy amber cap and base, gold mullions, glowing at night; the thin white roof and colonnade */
      A(S, 'glassSee', K.box(11, 1.9, 3.8), [0, y + 0.95, 0], null, null, 0x557d8c); for (var i = -11; i <= 11; i++) A(S, 'vc', K.box(0.05, 1.9, 3.86), [i * 0.5, y + 0.95, 0], null, null, i % 2 ? 0xd8b46a : 0xe8eef0); A(S, 'lights', new THREE.PlaneGeometry(10.6, 1.6), [0, y + 0.9, 1.93], null, null, 0xffe6b0);
      box(S, 'vc', 11.4, 0.22, 4.2, [0, y, 0], 0xb8862e); box(S, 'vc', 11.6, 0.26, 4.3, [0, y + 1.86, 0], 0xb8862e); A(S, 'vc', K.box(11.0, 0.05, 0.06), [0, y + 1.7, 1.95], null, null, 0xd8b46a);
      box(S, 'vc', 12.8, 0.16, 5.8, [0, y + 2.15, 0.2], 0xe4e5e2); A(S, 'vc', K.box(12.8, 0.06, 5.8), [0, y + 2.12, 0.2], null, null, 0xd9dcdc);
      for (var j = 0; j < 13; j++) { A(S, 'gloss', K.cyl(0.07, 0.07, 2.15, 10), [-6.0 + j * 1.0, y + 1.075, 2.95], null, null, 0xf8f8f8); ccol(S, -6.0 + j * 1.0, 2.95, 0.09); }
      return { door: [0, 3.4], name: ['桃園站', 'TAOYUAN'], signY: 2.28, signZ: 3.12, signW: 2.6, col: [5.8, 2.6] }; },
    hsz: function (S, y) { /* Hsinchu: one sail-like roof, a parallelogram bent along its diagonal (a hypar), on six space trusses, touching down on two sculptural anchors; an oval glass concourse between long stone walls */
      var X0 = -7.6, X1 = 7.6, Zf = 3.4, Zb = -3.0;
      function hh(u, v) { /* u along x, v from the back (0) to the front (1): low at the front-left and the back-right */ var a = 4.3, b = 0.55, c = 0.9, d = 4.6; return (a * (1 - u) * (1 - v) + c * u * (1 - v) + b * (1 - u) * v + d * u * v); }
      var roof = K.surf(40, 18, function (u, v, p) { var x = X0 + (X1 - X0) * u + (v - 0.5) * 1.6, z = Zb + (Zf - Zb) * v; p.set(x, hh(u, v), z); }, true); A(S, 'gloss', roof, [0, y + 0.05, 0], null, null, 0xd6dade);
      var rimF = [], rimB = [], k; for (k = 0; k <= 24; k++) { var u2 = k / 24; rimF.push([X0 + (X1 - X0) * u2 + 0.8, y + 0.05 + hh(u2, 1), Zf]); rimB.push([X0 + (X1 - X0) * u2 - 0.8, y + 0.05 + hh(u2, 0), Zb]); } A(S, 'gloss', K.tube(rimF, 0.07, 48, 6), null, null, null, 0xf4f4f2); A(S, 'gloss', K.tube(rimB, 0.07, 48, 6), null, null, null, 0xf4f4f2);
      for (k = 0; k < 6; k++) { var u3 = 0.14 + k * 0.144, xm = X0 + (X1 - X0) * u3, top = hh(u3, 0.5); A(S, 'gloss', K.tube([[xm - 0.5, y + 0.1, -1.7], [xm, y + top - 0.25, 0.2], [xm + 0.5, y + 0.1, 2.1]], 0.06, 16, 6), null, null, null, 0xeceeef); A(S, 'gloss', K.tube([[xm - 0.5, y + 0.1, -1.7], [xm + 0.5, y + 0.1, 2.1]], 0.035, 6, 5), null, null, null, 0xeceeef); }
      A(S, 'vc', K.rbox(1.0, 0.9, 1.3, 0.3, 3), [X0 + 1.4, y + 0.45, Zf - 0.4], [0, 0.4, 0], null, 0xf2f2ef); A(S, 'vc', K.rbox(1.0, 1.3, 1.3, 0.3, 3), [X1 - 1.4, y + 0.65, Zb + 0.4], [0, 0.4, 0], null, 0xf2f2ef); ccol(S, X0 + 1.4, Zf - 0.4, 0.7); ccol(S, X1 - 1.4, Zb + 0.4, 0.7);
      var ov = new THREE.CylinderGeometry(1, 1, 2.2, 48, 1, true); ov.scale(4.4, 1, 2.0); A(S, 'glassSee', ov, [0, y + 1.1, 0.2], null, null, 0x5a8296); var ovT = new THREE.CircleGeometry(1, 48); ovT.rotateX(-Math.PI / 2); ovT.scale(4.4, 1, 2.0); A(S, 'vc', ovT, [0, y + 2.2, 0.2], null, null, 0xe8eaea); A(S, 'lights', new THREE.PlaneGeometry(6.0, 1.9), [0, y + 1.05, 2.1], null, null, 0xfff1d6);
      box(S, 'vcSee', 2.6, 1.3, 0.5, [-5.6, y, 0.6], 0x9d9a92); box(S, 'vcSee', 2.6, 1.3, 0.5, [5.6, y, -0.2], 0x9d9a92);
      return { door: [0, 2.6], name: ['新竹站', 'HSINCHU'], signY: 2.45, signZ: 2.22, signW: 2.6, col: [4.6, 2.2] }; },
    txg: function (S, y) { /* Taichung: the stone podium and glass of the hall under the long loom-shuttle shell of the platforms */
      box(S, 'vcSee', 12, 1.6, 4.6, [0, y, -0.2], 0xd9d3c6, null, 0.04); for (var i = 0; i < 6; i++) A(S, 'glass', K.box(1.4, 1.0, 0.04), [-5.0 + i * 2.0, y + 0.7, 2.12], null, null, 0x4f7a6e); A(S, 'lights', new THREE.PlaneGeometry(11, 0.95), [0, y + 0.7, 2.15], null, null, 0xfff0d4);
      for (var j = 0; j < 4; j++) { A(S, 'glass', K.box(2.6, 0.05, 1.5), [-4.5 + j * 3.0, y + 1.45, 2.9], [0.12, 0, 0], null, 0x9fc6d8); A(S, 'gloss', K.cyl(0.04, 0.04, 1.45, 8), [-4.5 + j * 3.0, y + 0.72, 3.55], null, null, 0xdddddd); ccol(S, -4.5 + j * 3.0, 3.55, 0.06); }
      box(S, 'vc', 12.4, 0.12, 4.9, [0, y + 1.6, -0.2], 0xc9c2b4);
      return { door: [0, 3.6], name: ['台中站', 'TAICHUNG'], signY: 1.25, signZ: 2.16, signW: 2.6, col: [6.1, 2.6] }; },
    chw: function (S, y) { /* Changhua: a lozenge of glass under a chequered roof like rice paddies, eighteen hollow columns opening like flowers into little pagoda skylights above the roof; palms in the glass ring */
      var DX = 6.4, DZ = 3.1, H = 2.4, dia = [[-DX, 0], [0, -DZ], [DX, 0], [0, DZ]];
      var slab = K.ext(dia, 0.18); slab.rotateX(-Math.PI / 2); A(S, 'vc', slab, [0, y + H, 0], null, null, 0xf2f2ee);
      for (var gx = -6; gx <= 6; gx++) for (var gz = -3; gz <= 3; gz++) { var cx = gx * 0.5, cz = gz * 0.5; if (Math.abs(cx) / DX + Math.abs(cz) / DZ > 0.9) continue; A(S, 'vc', K.box(0.46, 0.03, 0.46), [cx, y + H + 0.105, cz], null, null, (gx + gz) % 2 ? 0x7fae5a : 0xb7bcb2); }
      [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(function (e) { var a = dia[e[0]], b = dia[e[1]], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]) - 0.4; A(S, 'glassSee', K.box(L, H, 0.06), [mx * 0.96, y + H / 2, mz * 0.96], [0, -Math.atan2(b[1] - a[1], b[0] - a[0]), 0], null, 0x5e8a96); });
      A(S, 'lights', new THREE.PlaneGeometry(5.6, 1.9), [0, y + 1.0, 1.55], [0, 0, 0], null, 0xfff0d4);
      var cols = [], q; for (q = 0; q < 18; q++) { var row = q < 6 ? -1 : q < 12 ? 0 : 1, n = q % 6, xx = -4.0 + n * 1.6 + (row === 0 ? 0 : 0.8) - (row === 0 ? 0 : 0.8), zz = row * 1.25; if (Math.abs(xx) / DX + Math.abs(zz) / DZ > 0.78) xx *= 0.7; cols.push([xx, zz]); }
      cols.forEach(function (c) { A(S, 'vc', K.cyl(0.42, 0.1, H, 14, true), [c[0], y + H / 2, c[1]], null, null, 0xf6f6f2); A(S, 'glass', K.box(0.5, 0.36, 0.5), [c[0], y + H + 0.36, c[1]], [0, Math.PI / 4, 0], null, 0x8fb4c4); var cap = new THREE.ConeGeometry(0.44, 0.3, 4); A(S, 'vc', cap, [c[0], y + H + 0.69, c[1]], null, null, 0xe8e8e2); });
      [-1, 1].forEach(function (s) { tree(S, 'palm', s * 4.8, 2.6, 0.9); tree(S, 'palm', s * 2.6, 3.4, 0.85); }); ccol(S, 4.8, 2.6, 0.12); ccol(S, -4.8, 2.6, 0.12); ccol(S, 2.6, 3.4, 0.12); ccol(S, -2.6, 3.4, 0.12);
      return { door: [0, 3.5], name: ['彰化站', 'CHANGHUA'], signY: 1.95, signZ: 1.6, signW: 2.4, col: [4.4, 2.0] }; },
    yun: function (S, y) { /* Yunlin: "cloud light and forest shade" — a glass hall behind a meandering colonnade of thirty-seven metal ribbons, each in its own pose, under cascading roof planes with light between them */
      A(S, 'glassSee', K.box(11, 2.2, 4.0), [0, y + 1.1, 0], null, null, 0x5d8794); A(S, 'lights', new THREE.PlaneGeometry(10.4, 1.9), [0, y + 1.05, 2.02], null, null, 0xfff1d6);
      [[-3.8, 2.55, -0.05], [0, 2.75, 0.04], [3.8, 2.95, -0.04]].forEach(function (r, k) { A(S, 'vc', K.box(4.2, 0.14, 5.0), [r[0], y + r[1], 0.2], [r[2], 0, 0], null, 0xeef0f0); for (var p = 0; p < 4; p++) A(S, 'vc', K.box(0.8, 0.03, 1.1), [r[0] - 1.4 + p * 0.95, y + r[1] + 0.09, -0.8], [r[2], 0, 0], null, 0x1f3550); });
      for (var i = 0; i < 37; i++) { var t = i / 36, x = -6.4 + t * 12.8, z = 2.55 + 0.42 * Math.sin(t * Math.PI * 3.2) + (Math.abs(x) > 5.6 ? -1.2 * (Math.abs(x) - 5.6) : 0), tw = Math.sin(i * 0.61) * 0.9, lean = Math.sin(i * 0.37) * 0.14;
        A(S, 'gloss', K.surf(2, 10, function (u, v, p) { var a = tw * v + (u - 0.5) * 0.0, w = 0.24 + 0.1 * Math.sin(v * Math.PI); p.set((u - 0.5) * w * Math.cos(a) + lean * v * 2.7, v * 2.75, (u - 0.5) * w * Math.sin(a)); }, true), [x, y, z], null, null, 0xdfe4e8); }
      return { door: [0, 3.6], name: ['雲林站', 'YUNLIN'], signY: 2.0, signZ: 2.05, signW: 2.4, col: [5.6, 2.2] }; },
    cyi: function (S, y) { /* Chiayi: the twin of Tainan — a long glass hall, the roof running out level and folding down to the ground at the east end, tree-like columns, an oval skylight; blue column bases */
      return foldStation(S, y, 1, 0x3f78b8, ['嘉義站', 'CHIAYI']); },
    tnn: function (S, y) { /* Tainan: stepping up from west to east, the sloping roof wraps the building and meets the ground at the west end; tree-like columns, an oval skylight, a reflecting pool */
      var info = foldStation(S, y, -1, 0xe9ecec, ['台南站', 'TAINAN']);
      A(S, 'glass', K.box(8.4, 0.06, 2.4), [0, y - 0.02, 5.6], null, null, 0x6aa6b8); box(S, 'vc', 8.8, 0.12, 0.2, [0, y - 0.06, 4.3], 0xd8d2c4); box(S, 'vc', 8.8, 0.12, 0.2, [0, y - 0.06, 6.9], 0xd8d2c4); return info; },
    khh: function (S, y) { /* Zuoying: the tall box, louvres and green glass, the great white roof on radiating struts */
      box(S, 'vcSee', 11.6, 3.6, 5.0, [0, y, 0], 0x9aa0a6, null, 0.03); for (var i = 0; i < 7; i++) A(S, 'vc', K.box(3.0, 0.08, 0.12), [-4.2, y + 1.8 + i * 0.22, 2.56], null, null, 0xd8dcdf); A(S, 'glass', K.box(11.2, 0.5, 0.04), [0, y + 0.9, 2.52], null, null, 0x5d9a86); A(S, 'lights', new THREE.PlaneGeometry(11, 0.45), [0, y + 0.9, 2.55], null, null, 0xfff0d4); A(S, 'glass', K.box(6, 0.4, 0.04), [2.4, y + 2.6, 2.52], null, null, 0x5d9a86);
      for (var j = 0; j < 7; j++) box(S, 'vc', 0.3, 1.5, 0.3, [-5.1 + j * 1.7, y, 2.8], 0xf6f6f2);
      box(S, 'vc', 14.4, 0.28, 8.4, [0, y + 3.7, 0.4], 0xe2e4e3); A(S, 'vc', K.box(14.6, 0.06, 8.6), [0, y + 3.68, 0.4], null, null, 0xe0e2e2);
      for (var k = 0; k < 6; k++) { var x = -5.5 + k * 2.2; [[0.9, 0.5], [-0.9, 0.5], [0, 0.9]].forEach(function (d) { A(S, 'gloss', K.tube([[x, y + 3.0, 2.6], [x + d[0] * 0.8, y + 3.4, 2.6 + d[1] * 1.6], [x + d[0] * 1.2, y + 3.68, 2.6 + d[1] * 2.0]], 0.035, 8, 6), null, null, null, 0xf2f2f2); }); }
      return { door: [0, 3.4], name: ['左營站', 'ZUOYING'], signY: 3.2, signZ: 2.56, signW: 2.8, col: [5.8, 2.6] }; }
  };
  var STROOF = { tpe: 'flat', tao: 'flat', hsz: 'flat', txg: 'shuttle', chw: 'flat', yun: 'flat', cyi: 'big', tnn: 'big', khh: 'big' };
  /* ================= the product worlds beside the stations ================= */
  var DIST = {
    tpe: function (S, y, r) { /* the AUTO laboratory */ var x0 = -8.6, z0 = 8.2, ry = 0.5;
      box(S, 'vcSee', 5.6, 2.4, 3.6, [x0, y, z0], 0xfbfbf8, [0, ry, 0], 0.06); collider(S, x0, z0, 2.82, 1.82, ry); A(S, 'vc', K.box(5.7, 0.18, 3.7), [x0, y + 2.4, z0], [0, ry, 0], null, 0xef7a1d);
      var c = Math.cos(ry), s = Math.sin(ry), fx = x0 + 1.82 * s, fz = z0 + 1.82 * c; A(S, 'glass', K.box(2.0, 1.5, 0.05), [fx, y + 0.75, fz], [0, ry, 0], null, 0x5d8394); A(S, 'lights', new THREE.PlaneGeometry(1.9, 1.4), [fx + s * 0.03, y + 0.75, fz + c * 0.03], [0, ry, 0], null, 0xfff3dc);
      windows(S, x0 + 1.81 * s, y + 1.85, z0 + 1.81 * c, ry, 4, 1, 0.9, 0.5, 1.25, 1, { lit: 0.8 });
      [[-2.2], [2.2]].forEach(function (q) { var px = x0 + q[0] * c + 2.4 * s, pz = z0 - q[0] * s + 2.4 * c; A(S, 'gloss', K.cyl(0.03, 0.03, 2.4, 8), [px, y + 1.2, pz], null, null, 0xdddddd); ccol(S, px, pz, 0.05); A(S, 'vc', K.box(0.02, 0.5, 0.8), [px - c * 0.41, y + 2.1, pz + s * 0.41], [0, ry + Math.PI / 2, 0], null, 0xef7a1d); });
      return { door: [x0 + 2.3 * s, z0 + 2.3 * c], at: [x0, z0], ry: ry, logoAt: [x0 + 1.86 * s, y + 2.0, z0 + 1.86 * c, ry] }; },
    tao: function (S, y, r) { /* the garden walls for PROTECT ONE: block, brick, stone, wood */ var z0 = 8.6, x0 = -7.2;
      [[-2.4, 0xb9b5ac, 'block'], [-0.8, 0xb5644a, 'brick'], [0.8, 0xd8cfa6, 'stone'], [2.4, 0xb98d62, 'wood']].forEach(function (q, k) { box(S, 'vc', 1.5, 1.15, 0.28, [x0 + q[0], y, z0], q[1], null, 0.02); A(S, 'gloss', K.box(0.72, 1.12, 0.02), [x0 + q[0] + 0.37, y + 0.57, z0 + 0.15], null, null, q[1]); /* the coated half: a clear gloss */
        for (var j = 0; j < 4; j++) A(S, 'vc', K.box(1.5, 0.02, 0.29), [x0 + q[0], y + 0.28 * (j + 1), z0], null, null, q[2] === 'wood' ? 0x8a6440 : 0x9a968e); });
      A(S, 'vc', K.box(6.4, 0.08, 0.36), [x0, y + 1.16, z0], null, null, 0x9a968e); collider(S, x0, z0, 3.3, 0.3);
      tree(S, 'round', x0 - 3.8, z0 + 1.5, 1.1); tree(S, 'sakura', x0 + 3.8, z0 + 1.2, 1.0); A(S, 'vc', K.cyl(0.25, 0.3, 0.5, 12), [x0 + 2.0, y + 0.25, z0 + 1.4], null, null, 0x6a7a8a); ccol(S, x0 + 2.0, z0 + 1.4, 0.3); ccol(S, x0 + 2.6, z0 + 1.6, 0.2); A(S, 'vc', K.cyl(0.18, 0.2, 0.42, 12), [x0 + 2.6, y + 0.21, z0 + 1.6], null, null, 0x6a7a8a);
      return { door: [x0, z0 + 1.2], at: [x0, z0], ry: 0 }; },
    hsz: function (S, y, r) { /* the science-park facade with its joints, the scaffold */ var x0 = -8.0, z0 = 8.8;
      box(S, 'vcSee', 5.2, 3.0, 3.2, [x0, y, z0], 0xe7e3dc, null, 0.03); var i, j; for (i = 0; i < 6; i++) A(S, 'vc', K.box(0.035, 3.0, 0.02), [x0 - 2.5 + i * 1.0, y + 1.5, z0 + 1.61], null, null, i % 2 ? 0xf08a24 : 0x8f8f8a); for (j = 1; j < 4; j++) A(S, 'vc', K.box(5.2, 0.035, 0.02), [x0, y + j * 0.75, z0 + 1.61], null, null, 0x8f8f8a);
      windows(S, x0, y + 0.55, z0 + 1.62, 0, 4, 3, 0.7, 0.4, 1.2, 0.95, { lit: 0.5 });
      collider(S, x0, z0 + 2.17, 2.5, 0.3); for (i = 0; i < 4; i++) { A(S, 'gloss', K.cyl(0.025, 0.025, 3.1, 6), [x0 - 2.4 + i * 1.6, y + 1.55, z0 + 2.3], null, null, 0x9aa0a6); } for (j = 1; j <= 3; j++) { A(S, 'vc', K.box(5.0, 0.04, 0.5), [x0, y + j * 0.95, z0 + 2.05], null, null, 0x8a6a48); A(S, 'gloss', K.cyl(0.02, 0.02, 4.9, 6), [x0, y + j * 0.95 + 0.5, z0 + 2.3], [0, 0, Math.PI / 2], null, 0x9aa0a6); }
      collider(S, x0, z0, 2.7, 1.9); return { door: [x0 + 2.6, z0 + 2.3], at: [x0, z0], ry: 0 }; },
    txg: function (S, y, r) { /* the Good Startup counter */ var x0 = -7.0, z0 = 8.0;
      box(S, 'vcSee', 3.4, 1.9, 2.4, [x0, y, z0], 0xfdfbf6, null, 0.05); A(S, 'vc', K.box(3.6, 0.26, 2.6), [x0, y + 1.9, z0], null, null, 0x22313f); A(S, 'glass', K.box(2.6, 1.2, 0.04), [x0, y + 0.75, z0 + 1.21], null, null, 0x5d8394); A(S, 'lights', new THREE.PlaneGeometry(2.5, 1.1), [x0, y + 0.75, z0 + 1.24], null, null, 0xfff3dc);
      A(S, 'vc', K.rbox(2.0, 0.08, 0.9, 0.03, 2), [x0, y + 2.4, z0 + 1.6], [0.25, 0, 0], null, 0xef7a1d); [-0.9, 0.9].forEach(function (dx) { A(S, 'gloss', K.cyl(0.025, 0.025, 2.3, 6), [x0 + dx, y + 1.15, z0 + 1.95], null, null, 0xdddddd); ccol(S, x0 + dx, z0 + 1.95, 0.05); });
      tree(S, 'banyan', x0 + 4.4, z0 + 1.2, 1.1); bench(S, x0 + 2.6, z0 + 2.4, 0);
      collider(S, x0, z0, 1.8, 1.3); return { door: [x0, z0 + 1.8], at: [x0, z0], ry: 0, gsAt: [x0, y + 2.03, z0 + 1.31] }; },
    tnn: function (S, y, r) { /* an old red-brick townhouse, its front open on a wood floor being laid */ var x0 = -7.8, z0 = 8.6;
      box(S, 'vcSee', 4.0, 2.6, 3.2, [x0, y, z0 - 0.3], 0xb5644a, null, 0.02); box(S, 'vc', 3.6, 0.04, 2.6, [x0, y + 0.02, z0], 0xc89a62);
      for (var i = 0; i < 8; i++) A(S, 'vc', K.box(0.42, 0.012, 2.5), [x0 - 1.55 + i * 0.44, y + 0.05, z0], null, null, i < 5 ? 0xb07a48 : 0x8a6a48);
      [-1.4, 0, 1.4].forEach(function (dx) { A(S, 'vc', K.surf(10, 2, function (u, v, p) { var a = Math.PI * u; p.set(dx + Math.cos(a) * 0.55, 1.15 + Math.sin(a) * 0.35, v * 0.2); }, true), [x0, y, z0 + 1.32], null, null, 0xc9744e); A(S, 'vc', K.box(0.18, 1.15, 0.24), [x0 + dx - 0.62, y + 0.58, z0 + 1.42], null, null, 0xc06a48); ccol(S, x0 + dx - 0.62, z0 + 1.42, 0.14); });
      windows(S, x0, y + 1.95, z0 + 1.32, 0, 3, 1, 0.6, 0.5, 1.2, 1, { lit: 0.7 }); A(S, 'vc', K.box(4.2, 0.2, 3.4), [x0, y + 2.6, z0 - 0.3], null, null, 0x9a4a34);
      A(S, 'vc', K.box(1.1, 0.12, 0.5), [x0 + 2.6, y + 0.06, z0 + 1.6], null, null, 0xb07a48); A(S, 'vc', K.box(1.1, 0.12, 0.5), [x0 + 2.6, y + 0.18, z0 + 1.6], null, null, 0x9a6a3e); A(S, 'gloss', K.cyl(0.14, 0.12, 0.26, 12), [x0 + 2.2, y + 0.13, z0 + 2.2], null, null, 0xef7a1d);
      collider(S, x0, z0 - 0.4, 2.1, 1.4); return { door: [x0, z0 + 2.2], at: [x0, z0], ry: 0 }; },
    chw: function (S, y, r) { /* Changhua: the great seated Buddha of Baguashan on its lotus, the Nine-Dragon pond, a ba-wan stall */ var x0 = -7.6, z0 = 8.2;
      box(S, 'vc', 3.2, 0.3, 3.2, [x0, y, z0], 0xb9b2a4); box(S, 'vc', 2.6, 0.35, 2.6, [x0, y + 0.3, z0], 0xa9a294);
      for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2; A(S, 'gloss', K.sph(0.36, 10, 8), [x0 + Math.sin(a) * 0.95, y + 0.82, z0 + Math.cos(a) * 0.95], [0, a, 0.5], [0.7, 0.45, 1.2], 0x3d3833); }
      A(S, 'gloss', K.lathe([[0.001, 0], [1.25, 0], [1.3, 0.25], [1.05, 0.55], [0.001, 0.6]], 28), [x0, y + 0.65, z0], null, null, 0x3d3833);
      A(S, 'gloss', K.lathe([[0.001, 0], [0.62, 0], [0.66, 0.45], [0.58, 1.05], [0.48, 1.4], [0.3, 1.55], [0.001, 1.58]], 28), [x0, y + 1.2, z0], null, [1, 1, 0.82], 0x3d3833);
      A(S, 'gloss', K.sph(0.36, 20, 16), [x0, y + 3.05, z0 + 0.02], null, [0.9, 1.05, 0.95], 0x3d3833); A(S, 'gloss', K.sph(0.16, 14, 10), [x0, y + 3.42, z0 - 0.02], null, null, 0x3d3833);
      [-1, 1].forEach(function (s) { A(S, 'gloss', K.tube([[s * 0.5, y + 2.55, z0 - 0.05], [s * 0.62, y + 2.0, z0 + 0.15], [s * 0.38, y + 1.62, z0 + 0.5], [s * 0.08, y + 1.58, z0 + 0.6]], 0.13, 14, 8).translate(x0, 0, 0), null, null, null, 0x3d3833); A(S, 'gloss', K.sph(0.08, 8, 6), [x0 + s * 0.33, y + 3.02, z0], null, [0.6, 1.6, 0.8], 0x3d3833); });
      A(S, 'gloss', K.rbox(1.5, 0.32, 0.7, 0.14, 2), [x0, y + 1.32, z0 + 0.55], null, null, 0x3d3833);
      A(S, 'glass', K.box(2.4, 0.05, 1.0), [x0, y + 0.03, z0 + 2.2], null, null, 0x4f9ab8); box(S, 'vc', 2.6, 0.12, 0.12, [x0, y, z0 + 2.75], 0xb9b2a4); box(S, 'vc', 2.6, 0.12, 0.12, [x0, y, z0 + 1.65], 0xb9b2a4);
      collider(S, x0, z0, 1.6, 1.6); var sg = signRect(['八卦山大佛', 'BAGUASHAN BUDDHA'], { w: 384, h: 128, bg: '#3a3430', ink: '#f2e6c8', sub: '#f2c46a' }); signQuad(S, sg, 1.2, 0.4, [x0 + 1.9, y + 0.5, z0 + 1.62], null, true);
      stall(S, -3.4, 10.6, 0, 'bawan', ['彰化肉圓', 'BA-WAN']);
      return { door: [x0 + 2.3, z0 + 1.9], at: [x0, z0], ry: 0, role: 'vendor', npc: [-3.4, 9.9] }; },
    yun: function (S, y, r) { /* Yunlin: a span of the red Xiluo truss bridge over a stream, a duck-rice stall */ var x0 = -7.4, z0 = 8.6, L = 7.0, Wd = 1.6, Hh = 1.05, i;
      A(S, 'glass', K.box(1.8, 0.04, 9.0), [x0, y + 0.02, z0], null, null, 0x4f8fb0); box(S, 'vc', 0.2, 0.14, 9.0, [x0 - 1.0, y, z0], 0x8a8270); box(S, 'vc', 0.2, 0.14, 9.0, [x0 + 1.0, y, z0], 0x8a8270);
      var g = new THREE.Group(); box(S, 'vc', L + 0.4, 0.1, Wd, [x0, y + 0.18, z0 - 0.0], 0x6a6a6a);
      [-1, 1].forEach(function (s) { var zz = s * Wd / 2; A(S, 'gloss', K.box(L, 0.08, 0.1), [x0, y + 0.3, z0 + zz], null, null, 0xc0392b); A(S, 'gloss', K.box(L - 0.6, 0.08, 0.1), [x0, y + 0.3 + Hh, z0 + zz], null, null, 0xc0392b);
        for (i = 0; i < 7; i++) { var xa = -L / 2 + i * (L / 7), xb = xa + L / 14, xc = xa + L / 7; A(S, 'gloss', K.tube([[x0 + xa, y + 0.3, z0 + zz], [x0 + xb, y + 0.3 + Hh, z0 + zz]], 0.04, 2, 5), null, null, null, 0xc0392b); A(S, 'gloss', K.tube([[x0 + xb, y + 0.3 + Hh, z0 + zz], [x0 + xc, y + 0.3, z0 + zz]], 0.04, 2, 5), null, null, null, 0xc0392b); }
        collider(S, x0, z0 + zz + s * 0.02, L / 2, 0.08); });
      for (i = 0; i < 7; i++) A(S, 'gloss', K.box(0.06, 0.06, Wd), [x0 - L / 2 + L / 14 + i * (L / 7), y + 0.3 + Hh, z0], null, null, 0xc0392b);
      var sg = signRect(['西螺大橋', 'XILUO BRIDGE'], { w: 384, h: 128, bg: '#5a1e18', ink: '#ffffff', sub: '#f2c46a' }); signQuad(S, sg, 1.2, 0.4, [x0 - L / 2 - 0.1, y + 1.0, z0 + Wd / 2 + 0.06], null, true);
      stall(S, -3.4, 10.6, 0, 'duckrice', ['北港鴨肉飯', 'DUCK RICE']);
      return { door: [x0 + 1.9, z0 + 3.9], at: [x0, z0], ry: 0, role: 'vendor', npc: [-3.4, 9.9] }; },
    cyi: function (S, y, r) { /* Chiayi: the Sun-Shooting Tower, two halves of a tree-grained trunk with the crack of light between them; a turkey-rice stall */ var x0 = -7.6, z0 = 8.0, H = 6.4, i;
      box(S, 'vc', 2.6, 0.25, 2.6, [x0, y, z0], 0xb9b2a4);
      [-1, 1].forEach(function (s) { A(S, 'vcSee', K.box(0.62, H, 1.3), [x0 + s * 0.43, y + 0.25 + H / 2, z0], null, null, 0x7a5a3e); for (i = 0; i < 5; i++) A(S, 'vc', K.box(0.64, 0.035, 1.32), [x0 + s * 0.43, y + 0.6 + i * 1.25 + (s > 0 ? 0.3 : 0), z0], [0, 0, s * 0.1], null, 0x5c4230); for (i = 0; i < 3; i++) A(S, 'vc', K.box(0.03, H * 0.9, 1.32), [x0 + s * (0.2 + i * 0.16), y + 0.25 + H * 0.48, z0], null, null, 0x664b34); });
      A(S, 'lights', K.box(0.18, H * 0.62, 0.9), [x0, y + 0.25 + H * 0.55, z0], null, null, 0xffd890); A(S, 'glass', K.box(1.6, 0.5, 1.4), [x0, y + H + 0.5, z0], null, null, 0x6f8fa0); A(S, 'vc', K.box(1.8, 0.1, 1.6), [x0, y + H + 0.8, z0], null, null, 0x5c4230);
      collider(S, x0, z0, 1.0, 0.8); var sg = signRect(['射日塔', 'SUN-SHOOTING TOWER'], { w: 384, h: 128, bg: '#4a3626', ink: '#f2e6c8', sub: '#f2c46a' }); signQuad(S, sg, 1.2, 0.4, [x0 + 1.5, y + 0.5, z0 + 1.32], null, true);
      stall(S, -3.4, 10.6, 0, 'turkeyrice', ['嘉義火雞肉飯', 'TURKEY RICE']);
      return { door: [x0 + 1.8, z0 + 1.9], at: [x0, z0], ry: 0, role: 'vendor', npc: [-3.4, 9.9] }; },
    khh: function (S, y, r) { /* an apartment with its roof being waterproofed: half done in UREAX-HG grey-green */ var x0 = -8.0, z0 = 8.8, fl = 5, fh = 0.62, H = fl * fh + 0.3;
      box(S, 'vcSee', 5.0, H, 3.0, [x0, y, z0], 0xf1e6d6, null, 0.03); windows(S, x0, y + 0.5, z0 + 1.51, 0, 4, fl, 0.62, 0.38, 1.2, fh, { lit: 0.5, see: true }); for (var j = 1; j < fl; j++) A(S, 'vc', K.box(4.6, 0.06, 0.32), [x0, y + j * fh + 0.12, z0 + 1.66], null, null, 0xe8e4dc);
      box(S, 'vc', 2.5, 0.05, 3.0, [x0 - 1.25, y + H, z0], 0x9fb2a6); box(S, 'vc', 2.5, 0.04, 3.0, [x0 + 1.25, y + H, z0], 0xb3aca0); box(S, 'vc', 5.1, 0.25, 0.1, [x0, y + H, z0 + 1.52], 0xe4dccf); box(S, 'vc', 5.1, 0.25, 0.1, [x0, y + H, z0 - 1.52], 0xe4dccf);
      A(S, 'gloss', K.cyl(0.3, 0.3, 0.6, 16), [x0 + 1.6, y + H + 0.5, z0 - 0.6], null, null, 0xd9dee2); A(S, 'gloss', K.cyl(0.3, 0.3, 0.6, 16), [x0 + 0.9, y + H + 0.5, z0 - 0.6], null, null, 0xf2c94c); A(S, 'vc', K.box(1.6, 0.2, 0.8), [x0 + 1.25, y + H + 0.1, z0 - 0.6], null, null, 0x8a8f8f);
      for (var k = 0; k < 10; k++) A(S, 'vc', K.box(0.4, 0.03, 0.06), [x0 + 2.65, y + 0.3 + k * 0.32, z0 + 1.0], null, null, 0x8a8f8f); collider(S, x0 + 2.65, z0 + 1.0, 0.23, 0.06); A(S, 'vc', K.box(0.04, H, 0.06), [x0 + 2.47, y + H / 2, z0 + 1.0], null, null, 0x8a8f8f); A(S, 'vc', K.box(0.04, H, 0.06), [x0 + 2.83, y + H / 2, z0 + 1.0], null, null, 0x8a8f8f);
      collider(S, x0, z0, 2.6, 1.6); return { door: [x0 + 1.0, z0 + 2.2], at: [x0, z0], ry: 0, roofY: y + H }; }
  };
  /* ================= build ================= */
  function build(world, ctx) {
    W = world; CTX = ctx; G = ctx.G; K = ctx.K; Q = ctx.Q; M = ctx.M; W.parts = W.parts || []; W.glows = []; W.boards = [];
    M.sign = K.std({ map: atlas().texture(), rough: 0.6, alphaTest: 0.3, side: THREE.DoubleSide }); K.hook(M.sign, 'signNight', function (s) { s.uniforms.uNight = K.U.uNight; s.fragmentShader = 'uniform float uNight;\n' + s.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * uNight * 0.32;'); });
    M.signL = M.sign;
    var ids = G.STATIONS;
    ids.forEach(function (id) {
      var stop = ctx.stops[id], P = ctx.railAt(stop.s), tx = P.dx, tz = P.dz, nx = -tz, nz = tx;
      var t1 = G.sdf(P.x + nx * 10, P.z + nz * 10), t2 = G.sdf(P.x - nx * 10, P.z - nz * 10); if (t2 > t1) { nx = -nx; nz = -nz; }
      if (id === 'tpe' || id === 'tao') { if (nz < 0) { nx = -nx; nz = -nz; } } /* the plazas of the north open to the south */
      var cx = P.x + nx * 4.2, cz = P.z + nz * 4.2, rot = Math.atan2(nx, nz), y = G.height(cx, cz);
      var S = Frame(cx, cz, rot, 0); S.gy = y; var info = STATIONS[id](S, y);
      /* the plaza: paving, lamps, trees, benches, scooters */
      var r = K.seeded(id.charCodeAt(0) * 31 + id.charCodeAt(1));
      A(S, 'vc', K.box(18, 0.1, 8.5), [0, y + 0.0, 8.0], null, null, 0xd9c7a8); for (var i = -4; i <= 4; i++) A(S, 'vc', K.box(0.05, 0.105, 8.5), [i * 2, y + 0.004, 8.0], null, null, 0xb8a486); for (var j0 = 0; j0 < 4; j0++) A(S, 'vc', K.box(18, 0.105, 0.05), [0, y + 0.004, 4.6 + j0 * 2.2], null, null, 0xb8a486); A(S, 'vc', K.box(5.2, 0.11, 3.2), [0, y + 0.01, 8.6], null, null, 0xc96f4a);
      [-6, -2, 2, 6].forEach(function (lx) { lamp(S, lx, 5.2); }); lamp(S, -8.5, 11.5); lamp(S, 8.5, 11.5);
      tree(S, 'round', 4.0, 10.6, 1.05); tree(S, 'round', 7.5, 6.4, 0.95); tree(S, id === 'khh' || id === 'tnn' ? 'palm' : 'round', -3.6, 11.4, 1.0); bench(S, 5.6, 10.0, Math.PI); bench(S, 1.2, 11.2, Math.PI);
      for (var k = 0; k < 7; k++) scooter(S, 8.6 + (k % 2) * 0.05, 7.4 + k * 0.45, -Math.PI / 2, [0xe8e8e8, 0x2a62a8, 0xd93a3a, 0x3a3a3a, 0xf2c94c, 0x7ac0a8][k % 6]);
      /* the station's name on its facade */
      var rect = signRect([info.name[0], info.name[1]], { w: 512, h: 160, bg: '#22313f', ink: '#ffffff', sub: '#f2c46a' }); signQuad(S, rect, info.signW, info.signW * 0.31, [info.door[0], y + info.signY, info.signZ + 0.06], null, false);
      /* the district: the product world and its master */
      var D = DIST[id](S, y, r);
      /* the town around: shophouses along the plaza's edges, apartments behind */
      var hs = 0; for (var q = 0; q < 6; q++) { hs = shophouse(S, -9.0 + q * 1.7, 14.2, Math.PI, 1.6, 2.8, 3 + Math.floor(r() * 2), r, { see: true }); }
      for (var q2 = 0; q2 < 4; q2++) apartment(S, 10.2 + (q2 % 2) * 3.4, 3.0 + Math.floor(q2 / 2) * 5.2 + 7, -Math.PI / 2, 3.0, 2.6, 4 + Math.floor(r() * 3), r, { see: true });
      for (var q3 = 0; q3 < 4; q3++) shophouse(S, -12.6, 2.0 + q3 * 1.8 + 4.5, Math.PI / 2, 1.7, 2.8, 3 + Math.floor(r() * 2), r, { see: true });
      var g = finish(S, 'st_' + id); [[0, 1.5, 7.2], [0, 8, 9.4], [-8.5, 8.5, 3.4], [-12.6, 8, 2.2], [0, 14.2, 1.8], [11.8, 10.6, 3.2]].forEach(function (q) { var w2 = S.toW(q[0], q[1]); W.grassNo.push([w2[0], w2[1], q[2]]); });
      /* platforms on the viaduct */
      platforms(S, stop, STROOF[id]);
      /* register the place */
      var dW = S.toW(info.door[0], info.door[1] + 0.2), dD = S.toW(D.door[0], D.door[1]), cW = S.toW(0, 8);
      W.places[id] = { id: id, x: cW[0], z: cW[1], rot: rot, y: y, rr: 18, kind: 'station', door: dW, dist: dD, distAt: S.toW(D.at[0], D.at[1]), frame: S, info: info, D: D, plazaW: S.toW(0, 7.6) };
      W.interact.push({ id: id, kind: 'hsr', x: dW[0], z: dW[1], r: 1.5 });
      W.interact.push({ id: id, kind: 'dist', x: dD[0], z: dD[1], r: 1.5 });
      collider(S, 0, 0.2, (info.col || [5.2, 2.6])[0], (info.col || [5.2, 2.6])[1]);
      /* the NPC spots: the site master beside the product world, the station attendant at the door */
      var npcAt = D.npc ? S.toW(D.npc[0], D.npc[1]) : S.toW(D.door[0] + 1.3, D.door[1] + 0.5), stAt = S.toW(info.door[0] + 1.6, info.door[1] + 0.4); W.npcs.push({ id: id, role: D.role || 'master', x: npcAt[0], z: npcAt[1], rot: rot }); W.npcs.push({ id: id, role: 'staff', x: stAt[0], z: stAt[1], rot: rot });
      /* the lab's logo board, the Good Startup board */
      if (D.logoAt && typeof LOGO_IMG !== 'undefined') { var lb = board(S, 0, 0, 0, 0, 2.0, 0.55); var lp = D.logoAt; lb.mesh.position.set(0, 0, 0); var wp = S.toW(lp[0] - S.x, lp[2] - S.z); var im = new Image(); im.onload = function () { lb.draw(function (gg, w, h) { gg.fillStyle = '#ef7a1d'; K.rr(gg, 0, 0, w, h, 24); gg.fill(); var s2 = Math.min((w - 40) / im.width, (h - 24) / im.height); gg.drawImage(im, (w - im.width * s2) / 2, (h - im.height * s2) / 2, im.width * s2, im.height * s2); }); }; im.src = LOGO_IMG; var c3 = Math.cos(rot + D.ry), s3 = Math.sin(rot + D.ry), lw = S.toW(lp[0], lp[2]); lb.mesh.position.set(lw[0] + s3 * 0.02, lp[1], lw[1] + c3 * 0.02); lb.mesh.rotation.y = rot + D.ry; }
      if (D.gsAt) { var gb = board(S, D.gsAt[0], D.gsAt[1], D.gsAt[2] + 0.02, 0, 3.2, 0.24, function (gg, w, h) { gg.fillStyle = '#22313f'; gg.fillRect(0, 0, w, h); gg.fillStyle = '#ffffff'; gg.font = '800 ' + h * 0.62 + 'px ' + FONT; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText('Good Startup  好時新創', w / 2, h * 0.54); }); gb.mesh.position.y = D.gsAt[1]; }
      /* the district board: name of the product world, relabelled with the language */
      var bW = S.toW(D.door[0] - 1.4, D.door[1] + 0.6), bd = board(S, D.door[0] - 1.4, y + 1.35, D.door[1] + 0.6, 0, 1.5, 0.75); var post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8), K.std({ color: 0x6a5040 })); post.position.set(bW[0], y + 0.5, bW[1]); W.scene.add(post); W.boards.push({ id: id, b: bd });
    });
    /* the towns: a few blocks of shophouses and apartments */
    if (typeof MORE !== 'undefined' && MORE.reserve) MORE.reserve(W, ctx);
    ctx.towns.forEach(function (T, n) { if (/^(magongT)$/.test(T.id)) return; var r = K.seeded(n * 97 + 13), S = Frame(T.p[0], T.p[1], r() * 6.28, 0), y = G.height(T.p[0], T.p[1]); S.gy = y; if (G.sdf(T.p[0], T.p[1]) < 1.5) return; var cnt = Q.low ? 6 : 10;
      var NO = ['temple', 'diner', 'shrine', 'lotus', 'port', 'magong'].map(function (k) { return G.PL[k]; });
      for (var i = 0; i < cnt; i++) { var a = i / cnt * Math.PI * 2, rr = T.r * (0.45 + r() * 0.4), lx = Math.cos(a) * rr, lz = Math.sin(a) * rr, gy = G.height(S.toW(lx, lz)[0], S.toW(lx, lz)[1]), wq = S.toW(lx, lz); if (NO.some(function (q) { return Math.hypot(q[0] - wq[0], q[1] - wq[1]) < 7.5; })) continue; if (W.keepouts && W.keepouts.some(function (q) { return Math.hypot(q[0] - wq[0], q[1] - wq[1]) < q[2] + 1.8; })) continue; if (Object.keys(W.places).some(function (k) { var q = W.places[k]; return q.kind === 'station' && q.plazaW && Math.hypot(q.plazaW[0] - wq[0], q.plazaW[1] - wq[1]) < 13.5; })) continue; /* no house on a station's plaza */ if (r() < 0.55) shophouse(S, lx, lz, -a + Math.PI / 2, 1.6, 2.6, 3 + Math.floor(r() * 2), r, {}); else apartment(S, lx, lz, -a + Math.PI / 2, 2.6, 2.4, 4 + Math.floor(r() * 3), r, {}); }
      /* every building of this little town stands on the ground of its centre (towns are flat in the paint) */
      finish(S, 'town_' + T.id); });
    var HLP = { Frame: Frame, A: A, box: box, collider: collider, ccol: ccol, signRect: signRect, signQuad: signQuad, board: board, windows: windows, shophouse: shophouse, apartment: apartment, lamp: lamp, tree: tree, bench: bench, finish: finish, scooter: scooter, stall: stall, M: M };
    if (typeof LAND !== 'undefined') LAND.build(W, ctx, HLP);
    if (typeof MORE !== 'undefined') MORE.build(W, ctx, HLP);
    /* the street-lamp glows: additive sprites, bright at night */
    var gt = K.glowTex(), gm = new THREE.SpriteMaterial({ map: gt, color: 0xffd9a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }); gm.opacity = 0; var gg2 = new THREE.Group(); W.glows.forEach(function (p) { var sp = new THREE.Sprite(gm); sp.position.set(p[0], p[1], p[2]); sp.scale.setScalar(p[3] * 0.24); gg2.add(sp); }); W.scene.add(gg2);
    W.relabelers.push({ time: function (P) { gm.opacity = P.night * 0.2; gm.color.setRGB(1.0, 0.84, 0.6); } });
    W.relabelers.push({ label: function (fn) { W.boards.forEach(function (B) { var L = fn(B.id); if (!L) return; B.b.draw(function (g, w, h) { g.fillStyle = '#fff8ec'; K.rr(g, 6, 6, w - 12, h - 12, 28); g.fill(); g.lineWidth = 10; g.strokeStyle = '#3a2a20'; g.stroke(); g.fillStyle = '#2b2420'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 ' + Math.round(h * 0.26) + 'px ' + FONT; g.fillText(L[0], w / 2, h * 0.4, w - 40); g.font = '600 ' + Math.round(h * 0.13) + 'px ' + FONT; g.fillStyle = '#e5600c'; g.fillText(L[1] || '', w / 2, h * 0.7, w - 40); }); }); } });
    if (ATL) ATL.texture().needsUpdate = true;
  }
  return { build: build, Frame: Frame, atlas: atlas, stall: stall };
})();


