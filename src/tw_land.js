/* ===== [tw_land.js] ===== */
/* ===== LAND — the landmarks of AUTO 台灣島 =====
   The shrine on its hill above Taoyuan (a vermilion torii at the foot of the stone steps, lanterns, the worship hall under a copper roof,
   the sacred rope), an original late-night diner in a Taipei alley of Japanese bars (open from dusk to dawn, Taipei time), a Tainan
   temple with swallowtail ridges and red lanterns, the twin pagodas of the Lotus Pond, the harbour of Kaohsiung and the ferry pier,
   Penghu with its coral-stone walls, its lighthouse and the twin-hearts stone weir, Kenting's beach and its white lighthouse, Sun Moon
   Lake with its island and pagoda, Alishan's sacred tree and its forest railway, the east coast as a (very funny) DLC with the marble
   gorge and the hot-air balloons, the wind turbines of Hsinchu, and the three sealed arenas of the secret bosses. */
var LAND = (function () {
  var G, K, Q, W, H, CTX;
  function lin(h) { return K.lin(h); }
  function face(from, to) { return Math.atan2(to[0] - from[0], to[1] - from[1]); }
  function F(p, rot) { var S = H.Frame(p[0], p[1], rot || 0, 0); S.gy = G.height(p[0], p[1]); return S; }
  function gyAt(S, lx, lz) { var w = S.toW(lx, lz); return G.height(w[0], w[1]); }
  var A, box;
  function place(id, p, o) { W.places[id] = Object.assign({ id: id, x: p[0], z: p[1], rr: 10 }, o || {}); }
  function act(id, kind, p, r) { W.interact.push({ id: id, kind: kind, x: p[0], z: p[1], r: r || 1.5 }); }
  function npc(id, role, p, rot) { W.npcs.push({ id: id, role: role, x: p[0], z: p[1], rot: rot || 0 }); }
  /* ---------- small kit ---------- */
  function torii(S, lx, lz, y, s, col) { s = s || 1; col = col || 0xd8442a; [-1, 1].forEach(function (sd) { A(S, 'vc', K.cyl(0.11 * s, 0.13 * s, 2.0 * s, 12), [lx + sd * 0.95 * s, y + 1.0 * s, lz], null, null, col); A(S, 'vc', K.cyl(0.16 * s, 0.16 * s, 0.14 * s, 12), [lx + sd * 0.95 * s, y + 0.07 * s, lz], null, null, 0x2b2420); });
    var kas = K.surf(16, 1, function (u, v, p) { var x = (u - 0.5) * 2.9 * s, up = Math.pow(Math.abs(u - 0.5) * 2, 3) * 0.16 * s; p.set(x, 2.08 * s + up + v * 0.12 * s, 0); }, true); A(S, 'vc', kas, [lx, y, lz + 0.11 * s], null, null, col); A(S, 'vc', kas, [lx, y, lz - 0.11 * s], null, null, col);
    var top = K.surf(16, 1, function (u, v, p) { var x = (u - 0.5) * 3.0 * s, up = Math.pow(Math.abs(u - 0.5) * 2, 3) * 0.17 * s; p.set(x, 2.2 * s + up, (v - 0.5) * 0.28 * s); }, true); A(S, 'vc', top, [lx, y, lz], null, null, 0x2b2420);
    A(S, 'vc', K.box(2.4 * s, 0.13 * s, 0.14 * s), [lx, y + 1.68 * s, lz], null, null, col); A(S, 'vc', K.box(0.14 * s, 0.3 * s, 0.12 * s), [lx, y + 1.9 * s, lz], null, null, col); H.collider(S, lx - 0.95 * s, lz, 0.15, 0.15); H.collider(S, lx + 0.95 * s, lz, 0.15, 0.15); }
  function lantern(S, lx, lz, y) { A(S, 'vc', K.box(0.32, 0.12, 0.32), [lx, y + 0.06, lz], null, null, 0x9a968e); A(S, 'vc', K.cyl(0.07, 0.08, 0.5, 8), [lx, y + 0.37, lz], null, null, 0xa8a49c); A(S, 'vc', K.box(0.3, 0.06, 0.3), [lx, y + 0.65, lz], null, null, 0x9a968e); A(S, 'vc', K.box(0.22, 0.2, 0.22), [lx, y + 0.78, lz], null, null, 0xb4b0a6); A(S, 'lights', K.box(0.14, 0.12, 0.23), [lx, y + 0.78, lz], null, null, 0xffc66a); A(S, 'vc', K.cyl(0.02, 0.24, 0.14, 4), [lx, y + 0.95, lz], [0, Math.PI / 4, 0], null, 0x8e8a82); H.ccol(S, lx, lz, 0.22); }
  function stoneSteps(S, x0, z0, x1, z1, y0, y1, w) { var n = Math.max(2, Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.32)), i, ry = Math.atan2(x1 - x0, z1 - z0); for (i = 0; i < n; i++) { var t = i / n, y = y0 + (y1 - y0) * t; A(S, 'vc', K.box(w, Math.max(0.05, y - y0 + 0.12), 0.34), [x0 + (x1 - x0) * t, y0 + (y - y0 + 0.12) / 2 - 0.06, z0 + (z1 - z0) * t], [0, ry, 0], null, i % 2 ? 0xb8b2a6 : 0xc2bcb0); } }
  function lathe(pts, seg) { return K.lathe(pts, seg || 16); }
  function pagoda(S, lx, lz, y, tiers, r0, cols) { var yy = y, r = r0, i; for (i = 0; i < tiers; i++) { var h = 0.55 - i * 0.025; A(S, 'vc', K.cyl(r * 0.78, r * 0.8, h, 8), [lx, yy + h / 2, lz], [0, Math.PI / 8, 0], null, cols[0]); A(S, 'vc', K.cyl(r * 0.3, r * 1.1, 0.16, 8), [lx, yy + h + 0.08, lz], [0, Math.PI / 8, 0], null, cols[1 + (i % 2)]); A(S, 'lights', K.cyl(r * 0.79, r * 0.79, 0.12, 8, true), [lx, yy + h * 0.55, lz], [0, Math.PI / 8, 0], null, 0xffd890); yy += h + 0.16; r *= 0.88; } A(S, 'gloss', K.cyl(0.01, 0.07, 0.6, 8), [lx, yy + 0.3, lz], null, null, 0xd8b24a); H.ccol(S, lx, lz, r0 * 0.85); return yy; }
  function arena(id, p, o) { /* a sealed stone circle: the place of a secret boss */ o = o || {}; var S = F(p, o.rot || 0), y = o.y != null ? o.y : S.gy, R = o.R || 5.4, i;
    A(S, 'vc', K.cyl(R, R + 0.15, 0.24, 48), [0, y + 0.02, 0], null, null, o.floor || 0xb9b2a4); A(S, 'vc', K.cyl(R * 0.6, R * 0.6, 0.02, 40), [0, y + 0.15, 0], null, null, o.inner || 0xa8a090);
    for (i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2; if (Math.abs(Math.sin(a / 2)) < 0.14) continue; H.ccol(S, Math.sin(a) * (R + 0.2), Math.cos(a) * (R + 0.2), 0.22); H.collider(S, Math.sin(a + 0.31) * (R + 0.2) * 0.95, Math.cos(a + 0.31) * (R + 0.2) * 0.95, 0.2, (R + 0.2) * 0.315, a + 0.31 + Math.PI / 2); A(S, 'vc', K.rbox(0.36, 1.3, 0.36, 0.05, 2), [Math.sin(a) * (R + 0.2), y + 0.65, Math.cos(a) * (R + 0.2)], [0, a, 0], null, 0x8a857a); A(S, 'vc', K.box(0.4, 0.08, (R + 0.2) * 0.63), [Math.sin(a + 0.31) * (R + 0.2) * 0.95, y + 0.95, Math.cos(a + 0.31) * (R + 0.2) * 0.95], [0, a + 0.31 + Math.PI / 2, 0], null, i % 2 ? 0xf2c94c : 0x2b2420); }
    A(S, 'vc', K.rbox(0.9, 1.1, 0.22, 0.05, 2), [0, y + 0.55, R + 1.6], null, null, 0x7a766c); H.collider(S, 0, R + 1.6, 0.47, 0.13); var tg = H.signRect([o.label || '封印之地', o.sub || 'SEALED'], { w: 256, h: 300, bg: '#5c584e', ink: '#f2e6c8', sub: '#f2c46a', rad: 8 }); H.signQuad(S, tg, 0.72, 0.84, [0, y + 0.6, R + 1.72], null, false);
    H.finish(S, 'arena_' + id); var c = S.toW(0, 0), d = S.toW(0, R + 2.3); place(id, c, { kind: 'arena', rr: R + 6, R: R, y: y, gate: d, frame: S }); act(id, 'boss', d, 1.6); return S; }
  /* the piers of the ferry: a deck of planks on piles, bollards, lamps; walkable (W.piers); the berth beside it, the points of the route */
  function pier(S, w, z0, len) { var hw = w / 2, i, n = Math.ceil(len / 2.2);
    A(S, 'vc', K.box(w, 0.25, len), [0, 0.32, z0 + len / 2], null, null, 0x9a8e7c); A(S, 'vc', K.box(w + 0.08, 0.06, len), [0, 0.2, z0 + len / 2], null, null, 0x6e6252);
    for (i = 0; i <= n; i++) [-hw + 0.06, hw - 0.06].forEach(function (x) { A(S, 'vc', K.cyl(0.08, 0.08, 1.3, 8), [x, -0.35, z0 + 0.3 + i * (len - 0.6) / n], null, null, 0x5e5042); });
    for (i = 0; i < 4; i++) A(S, 'vc', K.cyl(0.055, 0.07, 0.16, 10), [hw - 0.12, 0.525, z0 + len * (0.35 + i * 0.18)], null, null, 0x2b2b2e); /* the bollards on the berth side */
    var gy0 = S.gy; S.gy = 0.445; H.lamp(S, -hw + 0.1, z0 + len * 0.45, 1.4); H.lamp(S, -hw + 0.1, z0 + len * 0.92, 1.4); S.gy = gy0;
    W.piers = W.piers || []; W.piers.push({ S: S, z0: z0, L: z0 + len, w: hw }); if (!W.pier) W.pier = W.piers[0]; }
  function berth(S, rot, hw, L) { /* the ship (9.9 long, 3.0 in the beam) lies alongside, bow to the land; it backs out to 'out', comes in through 'app' */ var bx = hw + 1.5 + 0.28;
    return { dock: S.toW(bx, L + 7.6), dockRot: rot + Math.PI, out: S.toW(bx, L + 18.5), app: S.toW(bx, L + 24.0), land: S.toW(0, L + 6.6), landRot: rot + Math.PI, pierEnd: S.toW(0, L + 13.4) }; }
  function inland(p, m) { /* walk p up the distance field until it stands m units inside the coast */ var x = p[0], z = p[1], i; for (i = 0; i < 40 && G.sdf(x, z) < m; i++) { var e = 0.6, gx = G.sdf(x + e, z) - G.sdf(x - e, z), gz = G.sdf(x, z + e) - G.sdf(x, z - e), l = Math.hypot(gx, gz) || 1; x += gx / l * 0.5; z += gz / l * 0.5; } return [x, z]; }
  function offshore(p, lo, hi) { var best = null, bd = 1e9, a, r; for (r = 3; r < 30; r += 1) for (a = 0; a < 6.283; a += 0.2) { var x = p[0] + Math.cos(a) * r, z = p[1] + Math.sin(a) * r, d = G.sdf(x, z); if (d < -lo && d > -hi && r < bd) { bd = r; best = [x, z]; } } return best || p; }
  function coastPoint(p, toward) { /* the point of the coast nearest to p */ var x = p[0], z = p[1], i; for (i = 0; i < 60; i++) { var d = G.sdf(x, z); if (Math.abs(d) < 0.3) break; var e = 0.6, gx = G.sdf(x + e, z) - G.sdf(x - e, z), gz = G.sdf(x, z + e) - G.sdf(x, z - e), l = Math.hypot(gx, gz) || 1; x -= gx / l * d * 0.8; z -= gz / l * d * 0.8; } return [x, z]; }

  /* ================= the landmarks ================= */
  function shrine() { var p = G.PL.shrine, rot = G.PL.shrineRot != null ? G.PL.shrineRot : face(p, G.PL.tao), S = F(p, rot), y = S.gy, yb = gyAt(S, 0, 7.2);
    torii(S, 0, 7.2, yb, 1.05); stoneSteps(S, 0, 6.4, 0, 3.6, yb, y, 1.4); torii(S, 0, 2.6, y, 0.75, 0xb8b2a6);
    [[-1.0, 1.4], [1.0, 1.4], [-1.0, -0.4], [1.0, -0.4]].forEach(function (q) { lantern(S, q[0], q[1], y); });
    A(S, 'vc', K.box(4.4, 0.08, 6.4), [0, y - 0.03, -1.0], null, null, 0xd8d0bc);
    /* the worship hall: a raised floor, wood, a copper roof with upturned eaves, the sacred rope */
    box(S, 'vc', 3.2, 0.35, 2.2, [0, y, -2.2], 0x8a6a48); box(S, 'vcSee', 2.9, 1.25, 1.9, [0, y + 0.35, -2.2], 0xc89a64); for (var i = 0; i < 5; i++) box(S, 'vc', 0.12, 1.25, 0.12, [-1.4 + i * 0.7, y + 0.35, -1.24], 0x8a5a38);
    A(S, 'lights', new THREE.PlaneGeometry(2.4, 0.9), [0, y + 0.9, -1.24], null, null, 0xffd8a0);
    var roof = K.surf(20, 8, function (u, v, p2) { var x = (u - 0.5) * 4.2, z = (v - 0.5) * 3.4, eave = Math.pow(Math.abs(u - 0.5) * 2, 4) * 0.25 + Math.pow(Math.abs(v - 0.5) * 2, 4) * 0.12; p2.set(x, 1.15 - Math.abs(z) * 0.62 + eave, z); }, true); A(S, 'vc', roof, [0, y + 0.95, -2.2], null, null, 0x5f9e8a);
    A(S, 'vc', K.box(4.0, 0.14, 0.2), [0, y + 2.14, -2.2], null, null, 0x4a7d6c); [-1.75, 1.75].forEach(function (x) { A(S, 'vc', K.rbox(0.14, 0.4, 0.14, 0.04, 2), [x, y + 2.26, -2.2], [0, 0, x > 0 ? -0.5 : 0.5], null, 0x4a7d6c); });
    A(S, 'vc', K.tube([[-1.3, y + 1.62, -1.08], [0, y + 1.5, -1.0], [1.3, y + 1.62, -1.08]], 0.075, 16, 8), null, null, null, 0xe8d8a0); for (var k = 0; k < 4; k++) A(S, 'vc', K.box(0.1, 0.26, 0.01), [-0.9 + k * 0.6, y + 1.38, -0.98], null, null, 0xffffff);
    box(S, 'vcSee', 1.6, 1.0, 1.2, [0, y + 0.35, -4.0], 0xc89a64); A(S, 'vc', K.gable(1.6, 1.2, 0.6, { ov: 0.25 }), [0, y + 1.35, -4.0], null, null, 0x5f9e8a);
    [-1.6, 1.6].forEach(function (x) { H.collider(S, x, 0.6, 0.22, 0.22); A(S, 'vc', K.box(0.4, 0.5, 0.4), [x, y + 0.25, 0.6], null, null, 0xa8a49c); A(S, 'vc', K.rbox(0.26, 0.36, 0.34, 0.1, 2), [x, y + 0.68, 0.6], null, null, 0xb8b4aa); A(S, 'vc', K.sph(0.13, 10, 8), [x, y + 0.9, 0.72], null, null, 0xb8b4aa); });
    H.tree(S, 'banyan', 3.2, -2.6, 1.3); H.tree(S, 'sakura', -3.0, 0.6, 1.0); H.tree(S, 'cone', -2.8, -3.8, 1.1);
    H.collider(S, 0, -2.6, 1.7, 1.4); H.finish(S, 'shrine');
    var c = S.toW(0, 0), d = S.toW(0, -0.6); place('shrine', c, { kind: 'land', rr: 9, frame: S, y: y }); act('shrine', 'shrine', d, 1.4); npc('shrine', 'keeper', S.toW(1.6, -0.9), rot); }
  function diner() { var p = G.PL.diner, tp = W.places.tpe ? [W.places.tpe.x, W.places.tpe.z] : G.PL.tpe, rot = face(p, tp), S = F(p, rot), y = S.gy, i;
    A(S, 'vc', K.box(3.0, 0.08, 11.6), [0, y + 0.015, 0], null, null, 0x8a8478); /* the alley's paving */ for (i = -5; i <= 5; i += 2.5) { var gq = S.toW(0, i); W.grassNo.push([gq[0], gq[1], 2.6]); }
    var r = K.seeded(77), WOOD = [0x5a3e2c, 0x4a3426, 0x6a4a34], UP = [0xd8cdb8, 0xb8d0c4, 0xe6d6a8, 0xc6c0b4, 0xd9b8a4], ROOF = [0x4a5058, 0x9a5a3a, 0x4a6a8a, 0x5c6066];
    var NAMES = ['居酒屋', '燒鳥', 'BAR', 'スナック', '小料理', '珈琲', '卡拉OK', '串カツ'], nn = 0;
    A(S, 'vc', K.box(0.18, 0.085, 11.6), [-1.35, y + 0.02, 0], null, null, 0x5a5650); A(S, 'vc', K.box(0.18, 0.085, 11.6), [1.35, y + 0.02, 0], null, null, 0x5a5650); /* the gutters */
    for (i = 0; i < 5; i++) [-1, 1].forEach(function (sd) { var z = -4.4 + i * 2.2, x = sd * 2.6, dinerHere = (i === 2 && sd < 0), col = WOOD[Math.floor(r() * 3)], ry = sd < 0 ? Math.PI / 2 : -Math.PI / 2, two = dinerHere || r() < 0.72, fx = x - sd * 1.06, k;
      box(S, dinerHere ? 'vc' : 'vcSee', 2.0, 1.25, 2.1, [x, y, z], col, [0, ry, 0]);
      var top = y + 1.25; if (two) { box(S, 'vcSee', 1.96, 0.95, 2.06, [x + sd * 0.05, top, z], UP[Math.floor(r() * UP.length)], [0, ry, 0]); top += 0.95;
        A(S, 'lights', K.box(0.02, 0.3, 0.5), [fx - sd * 0.02, top - 0.5, z - 0.35], null, null, r() < 0.55 ? 0xffd8a0 : 0x3a3a44); if (r() < 0.6) A(S, 'vcSee', K.box(0.18, 0.26, 0.4), [fx - sd * 0.1, top - 0.62, z + 0.45], null, null, 0xe8e8e2); }
      var rk = Math.floor(r() * 3), rc = ROOF[Math.floor(r() * ROOF.length)];
      if (two && rk === 0) { /* a flat roof with the tin room and the water tank of a Taipei rooftop */ A(S, 'vcSee', K.box(2.12, 0.1, 2.16), [x, top + 0.05, z], null, null, 0xa8a49a); A(S, 'vcSee', K.box(1.3, 0.62, 1.2), [x + sd * 0.3, top + 0.41, z - 0.3], null, null, [0x8aa0b0, 0xb07a52, 0xc8c4b8][Math.floor(r() * 3)]); A(S, 'vcSee', K.box(1.42, 0.06, 1.32), [x + sd * 0.3, top + 0.75, z - 0.3], [0, 0, sd * 0.08], null, 0x6a7a88); A(S, 'gloss', K.cyl(0.24, 0.24, 0.5, 14), [x - sd * 0.45, top + 0.4, z + 0.55], null, null, 0xd8dade); }
      else if (rk === 1) A(S, 'vcSee', K.gable(2.3, 2.3, 0.5, { ov: 0.14 }), [x, top, z], null, null, rc); /* the gable end to the lane */
      else A(S, 'vcSee', K.gable(2.3, 2.3, 0.45, { ov: 0.16 }), [x, top, z], [0, Math.PI / 2, 0], null, rc);
      A(S, 'vcSee', K.box(0.6, 0.06, 2.2), [x - sd * 1.05, y + 1.28, z], [0, 0, sd * 0.35], null, ROOF[(i + (sd > 0 ? 1 : 0)) % ROOF.length]); /* the eave over the door */
      for (k = 0; k < 6; k++) A(S, 'vc', K.box(0.03, 0.8, 0.03), [x - sd * 1.02, y + 0.55, z - 0.6 + k * 0.24], null, null, 0x2e2018);
      A(S, 'lights', new THREE.PlaneGeometry(1.5, 0.7), [x - sd * 1.0, y + 0.55, z], [0, ry, 0], null, dinerHere ? 0xffc27a : (r() < 0.6 ? 0xffd8a0 : 0x3a2a20));
      var lc = r() < 0.5 ? 0xd8302a : 0xf2efe6; A(S, 'lights', K.sph(0.13, 12, 10), [x - sd * 1.15, y + 1.0, z + 0.7], null, [1, 1.35, 1], lc);
      if (!dinerHere && r() < 0.75) { var nm = NAMES[nn++ % NAMES.length], sg = H.signRect([nm], { w: 96, h: 256, bg: ['#f6f0e2', '#1f3557', '#2b2420', '#c8302a'][nn % 4], ink: nn % 4 ? '#fff4dc' : '#2b2420', vert: true, rad: 10 }); H.signQuad(S, sg, 0.24, 0.64, [x - sd * 1.32, y + 1.62, z + 0.62], null, true); A(S, 'vc', K.box(0.3, 0.03, 0.03), [x - sd * 1.18, y + 1.96, z + 0.62], null, null, 0x2b2420); }
      if (r() < 0.45) { var px = x - sd * 1.28, pz = z - 0.75; A(S, 'vc', K.cyl(0.11, 0.08, 0.2, 10), [px, y + 0.1, pz], null, null, 0x9a5a3a); A(S, 'leaf', K.sph(0.16, 8, 6), [px, y + 0.3, pz], null, null, 0x4f8a4a, { sway: 0.2 }); }
      H.collider(S, x, z, 1.05, 1.05, ry); });
    [-3.3, -0.9, 1.5, 3.9].forEach(function (wz, k) { A(S, 'vc', K.tube([[-1.62, y + 2.42 - k * 0.04, wz], [0, y + 2.12, wz + 0.15], [1.62, y + 2.38, wz + 0.05]], 0.008, 10, 4), null, null, null, 0x3a3a40); }); /* the wires over the lane */
    var ls = H.signRect(['條通', 'JŌ-DŌRI'], { w: 256, h: 128, bg: '#2a62a8', ink: '#ffffff', sub: '#ffe28a', rad: 6 }); H.signQuad(S, ls, 0.6, 0.3, [-1.45, y + 1.95, 5.2], null, true); A(S, 'gloss', K.cyl(0.03, 0.03, 2.1, 8), [-1.45, y + 1.05, 5.15], null, null, 0x4a5058); H.ccol(S, -1.45, 5.15, 0.05);
    /* the diner: noren and lantern of its own (an original diner: 宵灯, "the evening lamp") */
    var nr = H.signRect(['宵灯'], { w: 256, h: 128, bg: '#1f3557', ink: '#f3efe6', rad: 4 }); H.signQuad(S, nr, 1.2, 0.5, [-1.56, y + 1.0, 0], [0, Math.PI / 2, 0], true);
    var lt = H.signRect(['食堂'], { w: 128, h: 192, bg: '#d8302a', ink: '#fff6e8', vert: true, rad: 50 }); H.signQuad(S, lt, 0.3, 0.46, [-1.35, y + 1.3, 1.0], [0, Math.PI / 2, 0], true);
    var mb = H.signRect(['本日', '豚汁 · 玉子燒'], { w: 192, h: 192, bg: '#2b2420', ink: '#f2e6c8', sub: '#f2c46a', rad: 6 }); H.signQuad(S, mb, 0.4, 0.4, [-1.0, y + 0.3, -0.9], [0, Math.PI / 2 + 0.3, 0], true); A(S, 'vc', K.box(0.04, 0.5, 0.42), [-1.02, y + 0.25, -0.9], [0, 0.3, 0], null, 0x5a3e2c); H.ccol(S, -1.0, -0.9, 0.2);
    A(S, 'vc', K.rbox(0.36, 0.14, 0.2, 0.06, 2), [1.25, y + 0.47, 2.2], null, null, 0xf2b46a); A(S, 'vc', K.box(0.5, 0.4, 0.4), [1.25, y + 0.2, 2.2], null, null, 0x8a6a48); H.collider(S, 1.25, 2.2, 0.26, 0.21); /* a cat asleep on a crate */
    H.lamp(S, 0.9, -5.2, 1.5); H.finish(S, 'diner');
    var d = S.toW(-1.0, 0); place('diner', S.toW(0, 0), { kind: 'land', rr: 7, frame: S, y: y }); act('diner', 'diner', d, 1.3); npc('diner', 'chef', S.toW(-0.6, 0.7), S.rot - Math.PI / 2); }
  function temple() { var p = G.PL.temple, rot = face(p, G.PL.tnn), S = F(p, rot), y = S.gy, i;
    A(S, 'vc', K.box(7, 0.06, 7), [0, y - 0.02, 0.6], null, null, 0xc9b9a0); box(S, 'vc', 5.2, 0.3, 3.2, [0, y, -1.6], 0xbfb0a0);
    box(S, 'vcSee', 4.6, 1.5, 2.6, [0, y + 0.3, -1.6], 0xe8d8c4); for (i = 0; i < 6; i++) A(S, 'vc', K.cyl(0.11, 0.11, 1.5, 10), [-2.0 + i * 0.8, y + 1.05, -0.2], null, null, 0xb8221e);
    A(S, 'lights', new THREE.PlaneGeometry(1.4, 1.1), [0, y + 0.85, -0.29], null, null, 0xffc06a); A(S, 'vc', K.box(1.6, 1.3, 0.05), [0, y + 0.95, -0.3], null, null, 0xa81e1a);
    function swallow(cy, cz, w, d, h, col) { A(S, 'vc', K.hip(w, d, h, { ov: 0.35 }), [0, cy, cz], null, null, col); var rid = K.tube([[-w / 2 - 0.3, cy + h + 0.42, cz], [-w / 2 + 0.2, cy + h + 0.08, cz], [0, cy + h + 0.02, cz], [w / 2 - 0.2, cy + h + 0.08, cz], [w / 2 + 0.3, cy + h + 0.42, cz]], 0.06, 24, 6); A(S, 'vc', rid, null, null, null, 0xe86a2a);
      [[-w / 2 - 0.36, 0x2a9a6a], [w / 2 + 0.36, 0x2a9a6a], [0, 0xf2c94c]].forEach(function (q) { A(S, 'vc', K.sph(0.12, 10, 8), [q[0], cy + h + (q[0] ? 0.48 : 0.18), cz], null, null, q[1]); }); for (var k = 0; k < 7; k++) A(S, 'vc', K.sph(0.05, 6, 6), [-w / 2 + 0.6 + k * (w - 1.2) / 6, cy + h + 0.1, cz], null, null, [0x2a9a6a, 0xd8442a, 0x3a7ad8, 0xf2c94c][k % 4]); }
    swallow(y + 1.8, -1.6, 5.0, 3.0, 0.7, 0xd88a2a); swallow(y + 2.6, -1.6, 3.4, 2.0, 0.55, 0xd88a2a);
    for (i = 0; i < 6; i++) A(S, 'lights', K.sph(0.14, 12, 10), [-2.0 + i * 0.8, y + 1.75, 0.0], null, [1, 1.3, 1], 0xe8302a);
    A(S, 'gloss', lathe([[0.001, 0], [0.34, 0], [0.42, 0.25], [0.3, 0.5], [0.36, 0.56], [0.001, 0.56]], 20), [0, y, 2.0], null, null, 0x8a6a2e); A(S, 'lights', K.cyl(0.25, 0.25, 0.03, 16), [0, y + 0.57, 2.0], null, null, 0xff8a3a); H.ccol(S, 0, 2.0, 0.45);
    H.tree(S, 'banyan', 3.0, 2.2, 1.3); H.tree(S, 'banyan', -3.2, 1.8, 1.15); H.collider(S, 0, -1.6, 2.5, 1.5); H.finish(S, 'temple');
    place('temple', S.toW(0, 0.6), { kind: 'land', rr: 8, frame: S, y: y }); act('temple', 'temple', S.toW(0, 0.5), 1.4); npc('temple', 'auntie', S.toW(1.4, 0.8), rot); }
  function lotus() { var p = G.PL.lotus, rot = 0, S = F(p, rot), y = 0.72;
    var ya = pagoda(S, -0.9, -0.6, y, 7, 0.52, [0xf2d27a, 0xc8302a, 0x2a8a5a]), yb = pagoda(S, 0.9, -0.6, y, 7, 0.52, [0xf2d27a, 0x2a8a5a, 0xc8302a]);
    var zz = [[-0.9, 0.0], [-1.6, 0.9], [-0.5, 1.6], [-1.2, 2.5], [-0.3, 3.3], [-0.6, 4.2]]; for (var i = 0; i < zz.length - 1; i++) { var a = zz[i], b = zz[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]); A(S, 'vc', K.box(0.5, 0.08, len + 0.3), [(a[0] + b[0]) / 2, y + 0.18, (a[1] + b[1]) / 2], [0, Math.atan2(b[0] - a[0], b[1] - a[1]), 0], null, 0xe8dcc4); }
    H.finish(S, 'lotus'); place('lotus', S.toW(0, 1), { kind: 'land', rr: 6, frame: S, y: y }); }
  function port() { var p = G.PL.port, c = coastPoint(p), dir = [c[0] - p[0], c[1] - p[1]], rot = Math.atan2(dir[0], dir[1]), S = F(p, rot), y = S.gy;
    var L = Math.hypot(dir[0], dir[1]); box(S, 'vcSee', 4.2, 1.6, 2.4, [0, y, -1.2], 0xf4f4f0, null, 0.05); A(S, 'vc', K.box(4.3, 0.3, 2.5), [0, y + 1.6, -1.2], null, null, 0x2a62a8); A(S, 'glass', K.box(3.6, 0.9, 0.04), [0, y + 0.6, 0.02], null, null, 0x5d8394); A(S, 'lights', new THREE.PlaneGeometry(3.5, 0.85), [0, y + 0.6, 0.05], null, null, 0xfff0d4);
    var sg = H.signRect(['高雄港 · 往澎湖', 'FERRY TO PENGHU'], { w: 512, h: 128, bg: '#2a62a8', ink: '#ffffff', sub: '#ffe28a' }); H.signQuad(S, sg, 3.0, 0.75, [0, y + 1.75, 0.08], null, false);
    pier(S, 1.6, 0.8, L + 12.6); /* the pier, long enough for the ferry to lie alongside it in deep water */
    H.lamp(S, 1.8, 1.0, 1.6); H.collider(S, 0, -1.2, 2.2, 1.3); H.finish(S, 'port');
    place('port', S.toW(0, 1.2), Object.assign({ kind: 'land', rr: 9, frame: S, y: y }, berth(S, rot, 0.8, L))); act('port', 'ferry', S.toW(0, 1.0), 1.6); act('port', 'ferry', S.toW(0.25, L + 6.4), 1.6); npc('port', 'captain', S.toW(-1.2, 1.4), rot); }
  function penghu() { var p = G.PL.magong, c = coastPoint(p), rot = Math.atan2(c[0] - p[0], c[1] - p[1]), S = F(p, rot), y = S.gy, i, r = K.seeded(5), L = Math.hypot(c[0] - p[0], c[1] - p[1]);
    function sdfAt(x, z) { var w = S.toW(x, z); return G.sdf(w[0], w[1]); }
    function rp(x, z, ry, lx, lz) { var cs = Math.cos(ry), sn = Math.sin(ry); return [x + lx * cs + lz * sn, z - lx * sn + lz * cs]; }
    /* the pier, the harbour square and the ferry terminal */
    pier(S, 1.4, 0.6, L + 12.8);
    A(S, 'vc', K.box(6.4, 0.05, Math.max(2, L - 0.2)), [0, y - 0.015, (L - 0.2) / 2 + 0.2], null, null, 0xd6c8ae); for (i = -2; i <= 2; i++) A(S, 'vc', K.box(0.05, 0.055, Math.max(2, L - 0.2)), [i * 1.4, y - 0.01, (L - 0.2) / 2 + 0.2], null, null, 0xbcae94);
    box(S, 'vcSee', 3.4, 1.2, 2.0, [0, y, -0.8], 0xf6f4ee, null, 0.05); A(S, 'glass', K.box(2.8, 0.55, 0.04), [0, y + 0.42, 0.22], null, null, 0x5d8394); A(S, 'lights', new THREE.PlaneGeometry(2.7, 0.5), [0, y + 0.42, 0.25], null, null, 0xfff0d4);
    A(S, 'vc', K.hip(3.7, 2.3, 0.6, { ov: 0.22 }), [0, y + 1.2, -0.8], null, null, 0x2a8a9a); A(S, 'vc', K.box(3.5, 0.08, 0.16), [0, y + 1.16, 0.3], null, null, 0x22707e);
    var sg = H.signRect(['馬公港', 'MAGONG · PENGHU'], { w: 512, h: 128, bg: '#2a8a9a', ink: '#ffffff', sub: '#ffe28a' }); H.signQuad(S, sg, 1.9, 0.46, [0, y + 0.95, 0.25], null, false); H.collider(S, 0, -0.8, 1.75, 1.05);
    H.lamp(S, -2.6, 3.4, 1.6); H.lamp(S, 2.6, 3.4, 1.6); H.bench(S, -1.6, 2.6, 0); H.bench(S, 1.6, 2.6, 0);
    /* fishing boats at their moorings beside the pier */
    [[-2.3, L + 1.6, 0.15, 0x2a62a8], [-2.5, L + 4.0, -0.12, 0xd8442a], [-2.35, L + 6.4, 0.08, 0x2a9a6a], [-4.6, L + 2.8, 0.5, 0xf2b42a]].forEach(function (b) { if (sdfAt(b[0], b[1]) > -0.5) return; var x = b[0], z = b[1], ry = b[2], q;
      A(S, 'vc', K.rbox(0.72, 0.34, 1.9, 0.14, 2), [x, 0.1, z], [0, ry, 0], null, b[3]); A(S, 'vc', K.box(0.62, 0.05, 1.7), [x, 0.28, z], [0, ry, 0], null, 0xf2efe6);
      q = rp(x, z, ry, 0, -0.42); A(S, 'vc', K.box(0.5, 0.4, 0.52), [q[0], 0.5, q[1]], [0, ry, 0], null, 0xf8f8f4); A(S, 'glass', K.box(0.52, 0.13, 0.34), [q[0], 0.6, q[1]], [0, ry, 0], null, 0x4a6a7a); A(S, 'vc', K.box(0.56, 0.05, 0.58), [q[0], 0.72, q[1]], [0, ry, 0], null, b[3]);
      q = rp(x, z, ry, 0, 0.35); A(S, 'vc', K.cyl(0.025, 0.025, 1.0, 6), [q[0], 0.78, q[1]], null, null, 0xe8e8e8); A(S, 'vc', K.box(0.02, 0.16, 0.26), [q[0], 1.18, q[1] + 0.13], [0, ry, 0], null, 0xd8302a);
      q = rp(x, z, ry, 0, 0.85); A(S, 'lights', K.sph(0.05, 6, 6), [q[0], 0.36, q[1]], null, null, 0xfff2b0); });
    /* 天后宮: the old Mazu temple facing the harbour (swallow-tail ridge, red columns, lanterns, an incense burner) */
    var TO = [-5.6, -2.2]; if (sdfAt(TO[0], TO[1]) < 1.6) TO = [-4.6, -1.4]; (function (ox, oz) { var g = gyAt(S, ox, oz), k, w = 3.3, cy = g + 1.32, h = 0.55;
      A(S, 'vc', K.box(4.2, 0.06, 4.4), [ox, g - 0.02, oz + 1.0], null, null, 0xcdbfa6); box(S, 'vc', 3.6, 0.22, 2.4, [ox, g, oz], 0xb8aa96); box(S, 'vcSee', 3.0, 1.1, 1.8, [ox, g + 0.22, oz - 0.1], 0xeee2cc);
      for (k = 0; k < 4; k++) A(S, 'vc', K.cyl(0.09, 0.09, 1.1, 10), [ox - 1.2 + k * 0.8, g + 0.77, oz + 0.95], null, null, 0xb8221e);
      A(S, 'vc', K.box(1.0, 0.82, 0.04), [ox, g + 0.65, oz + 0.81], null, null, 0xa81e1a); A(S, 'lights', new THREE.PlaneGeometry(0.78, 0.6), [ox, g + 0.63, oz + 0.84], null, null, 0xffc06a);
      A(S, 'vc', K.hip(w, 2.5, h, { ov: 0.3 }), [ox, cy, oz], null, null, 0xc8602a); A(S, 'vc', K.tube([[ox - w / 2 - 0.25, cy + h + 0.36, oz], [ox - w / 2 + 0.2, cy + h + 0.06, oz], [ox, cy + h + 0.02, oz], [ox + w / 2 - 0.2, cy + h + 0.06, oz], [ox + w / 2 + 0.25, cy + h + 0.36, oz]], 0.055, 24, 6), null, null, null, 0xe86a2a);
      [[-w / 2 - 0.3, 0x2a9a6a, 0.42], [w / 2 + 0.3, 0x2a9a6a, 0.42], [0, 0xf2c94c, 0.14]].forEach(function (q) { A(S, 'vc', K.sph(0.11, 10, 8), [ox + q[0], cy + h + q[2], oz], null, null, q[1]); }); for (k = 0; k < 5; k++) A(S, 'vc', K.sph(0.045, 6, 6), [ox - 1.0 + k * 0.5, cy + h + 0.08, oz], null, null, [0x2a9a6a, 0xd8442a, 0x3a7ad8, 0xf2c94c][k % 4]);
      for (k = 0; k < 4; k++) A(S, 'lights', K.sph(0.12, 12, 10), [ox - 1.2 + k * 0.8, g + 1.18, oz + 1.12], null, [1, 1.3, 1], 0xe8302a);
      var tg = H.signRect(['天后宮'], { w: 256, h: 96, bg: '#b8221e', ink: '#f8e0a0', rad: 6 }); H.signQuad(S, tg, 0.8, 0.3, [ox, g + 1.17, oz + 0.84], null, false);
      A(S, 'gloss', lathe([[0.001, 0], [0.3, 0], [0.37, 0.22], [0.26, 0.44], [0.32, 0.5], [0.001, 0.5]], 20), [ox, g, oz + 2.3], null, null, 0x8a6a2e); A(S, 'lights', K.cyl(0.22, 0.22, 0.03, 16), [ox, g + 0.51, oz + 2.3], null, null, 0xff8a3a);
      H.collider(S, ox, oz, 1.8, 1.2); H.ccol(S, ox, oz + 2.3, 0.4); H.tree(S, 'banyan', ox + 2.4, oz + 1.6, 1.05); })(TO[0], TO[1]);
    /* the old street: coral-stone houses under red tiles, on both sides of a lane */
    var lane = [-11.0, -1.1], k2 = 0; if (sdfAt(lane[0], lane[1]) > 1.2) A(S, 'vc', K.box(6.6, 0.05, 2.2), [lane[0], gyAt(S, lane[0], lane[1]) - 0.01, lane[1]], null, null, 0xc4b496);
    [[-8.9, -3.5, 0], [-10.9, -3.5, 0], [-12.9, -3.6, 0], [-8.9, 1.3, Math.PI], [-10.9, 1.3, Math.PI], [-12.9, 1.4, Math.PI], [4.6, 2.0, Math.PI]].forEach(function (hq) { var lx = hq[0], lz = hq[1], ry = hq[2]; if (sdfAt(lx, lz) < 1.1) return; var g = gyAt(S, lx, lz), kk = k2++, wc = [0xc9b796, 0xbfae8c, 0xd2c3a2][kk % 3], rc = [0xc8553a, 0xb84a32, 0xd06a42][kk % 3], q;
      box(S, 'vc', 1.66, 0.2, 1.36, [lx, g, lz], 0x8f8270, [0, ry, 0]); box(S, 'vcSee', 1.6, 0.72, 1.3, [lx, g + 0.2, lz], wc, [0, ry, 0]);
      A(S, 'vcSee', K.gable(1.6, 1.3, 0.48, { ov: 0.14 }), [lx, g + 0.92, lz], [0, ry, 0], null, rc); A(S, 'vcSee', K.box(1.92, 0.07, 0.1), [lx, g + 1.4, lz], [0, ry, 0], null, 0xf2efe6);
      q = rp(lx, lz, ry, -0.3, 0.66); A(S, 'vc', K.box(0.36, 0.52, 0.03), [q[0], g + 0.46, q[1]], [0, ry, 0], null, 0x6a3a2a); A(S, 'vc', K.box(0.06, 0.62, 0.035), [q[0], g + 0.5, q[1]], [0, ry, 0], null, 0xd8302a);
      q = rp(lx, lz, ry, 0.42, 0.66); A(S, 'lights', K.box(0.28, 0.22, 0.02), [q[0], g + 0.58, q[1]], [0, ry, 0], null, kk % 3 ? 0xffd8a0 : 0x3a2a20); H.collider(S, lx, lz, 0.85, 0.7, ry); });
    /* 菜宅: the windbreak fields walled with coral stone, crops sheltered inside */
    var nF = 0; [[3.0, -3.6], [5.2, -3.6], [3.0, -1.3], [5.2, -1.3], [-15.2, -3.2], [-15.2, -1.0], [0.8, -3.9], [-2.2, -3.8]].forEach(function (fq) { if (nF >= 6 || sdfAt(fq[0], fq[1]) < 1.3) return; var cx = fq[0], cz = fq[1], g = gyAt(S, cx, cz), n = 2.1, kf = nF++, j;
      A(S, 'vc', K.box(n - 0.3, 0.05, n - 0.3), [cx, g + 0.0, cz], null, null, 0x8a6a48);
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (sd) { for (var a2 = 0; a2 < 3; a2++) { var t2 = -0.7 + a2 * 0.7, hh = 0.36 + r() * 0.16, x = cx + (sd[0] ? sd[0] * n / 2 : t2), z = cz + (sd[1] ? sd[1] * n / 2 : t2); A(S, 'vc', K.rbox(sd[0] ? 0.3 : 0.74, hh, sd[0] ? 0.74 : 0.3, 0.08, 2), [x, g + hh / 2, z], [0, (r() - 0.5) * 0.14, 0], null, [0x9c8e7a, 0xa89a84, 0x8e8270][Math.floor(r() * 3)]); } });
      for (var a3 = 0; a3 < 3; a3++) for (j = 0; j < 3; j++) A(S, 'leaf', K.sph(0.17, 8, 6), [cx - 0.5 + a3 * 0.5, g + 0.12, cz - 0.5 + j * 0.5], null, [1, 0.7, 1], kf % 2 ? 0x6aa84a : 0x8ab84a, { sway: 0.15 });
      H.collider(S, cx, cz, 1.15, 1.15); });
    /* cactus of the windy islands (the fruit of the 仙人掌 is a Penghu sweet), and the basalt columns of the shore */
    [[-3.2, 3.8], [3.6, 3.0], [-7.6, 2.8], [6.0, 0.2], [-14.6, 1.0], [-6.8, -4.6]].forEach(function (cq) { var x = cq[0], z = cq[1], sd2 = sdfAt(x, z); if (sd2 < 0.35) return; var g = gyAt(S, x, z), s2 = 0.8 + r() * 0.5, col = 0x5f9a4a;
      A(S, 'vc', K.cyl(0.12 * s2, 0.14 * s2, 0.8 * s2, 8), [x, g + 0.4 * s2, z], null, null, col); A(S, 'vc', K.sph(0.12 * s2, 8, 6), [x, g + 0.8 * s2, z], null, null, col);
      A(S, 'vc', K.box(0.2 * s2, 0.08 * s2, 0.09 * s2), [x + 0.14 * s2, g + 0.4 * s2, z], null, null, col); A(S, 'vc', K.cyl(0.07 * s2, 0.07 * s2, 0.3 * s2, 8), [x + 0.22 * s2, g + 0.55 * s2, z], null, null, col); A(S, 'vc', K.sph(0.07 * s2, 8, 6), [x + 0.22 * s2, g + 0.7 * s2, z], null, null, col);
      A(S, 'vc', K.box(0.2 * s2, 0.08 * s2, 0.09 * s2), [x - 0.14 * s2, g + 0.52 * s2, z], null, null, col); A(S, 'vc', K.cyl(0.06 * s2, 0.06 * s2, 0.24 * s2, 8), [x - 0.22 * s2, g + 0.64 * s2, z], null, null, col);
      A(S, 'vc', K.sph(0.05 * s2, 6, 6), [x, g + 0.93 * s2, z + 0.04], null, null, 0xd8306a); A(S, 'vc', K.sph(0.04 * s2, 6, 6), [x + 0.22 * s2, g + 0.8 * s2, z], null, null, 0xd8306a); H.ccol(S, x, z, 0.22 * s2); });
    var bs = null; [[-6.0, 5.4], [-9.0, 4.6], [-12.0, 3.2], [5.0, 3.6]].forEach(function (bq) { if (!bs) { var d0 = sdfAt(bq[0], bq[1]); if (d0 > -0.6 && d0 < 0.9) bs = bq; } });
    if (bs) { var gb = Math.max(0.15, gyAt(S, bs[0], bs[1])), HX = [[0, 0]]; for (i = 0; i < 6; i++) HX.push([Math.cos(i * Math.PI / 3) * 0.4, Math.sin(i * Math.PI / 3) * 0.4]); for (i = 0; i < 6; i++) HX.push([Math.cos(i * Math.PI / 3 + Math.PI / 6) * 0.7, Math.sin(i * Math.PI / 3 + Math.PI / 6) * 0.7]);
      HX.forEach(function (q, k) { var hh = (k === 0 ? 1.25 : k < 7 ? 0.95 : 0.6) + r() * 0.25; A(S, 'vc', K.cyl(0.21, 0.21, hh, 6), [bs[0] + q[0], gb + hh / 2 - 0.25, bs[1] + q[1]], null, null, [0x4a4844, 0x55524c, 0x3f3d3a][k % 3]); }); H.ccol(S, bs[0], bs[1], 0.85); }
    H.tree(S, 'palm', 2.9, 4.0, 0.9); H.tree(S, 'round', -14.4, -1.1, 0.85);
    H.finish(S, 'magong');
    place('magong', S.toW(0, 1.2), Object.assign({ kind: 'land', rr: 14, frame: S, y: y }, berth(S, rot, 0.7, L))); act('magong', 'ferryBack', S.toW(0, 0.8), 1.6); act('magong', 'ferryBack', S.toW(0.25, L + 6.4), 1.6); npc('magong', 'captain2', S.toW(-1.2, 1.2), rot);
    /* the lighthouse on the west of the islands */
    var lp = [G.PH[0] - 22, G.PH[1] - 2], lc = coastPoint(lp), li = [lc[0] + 3, lc[1]]; for (var k2 = 0; k2 < 20 && G.sdf(li[0], li[1]) < 1.5; k2++) li[0] += 0.8; var S2 = F(li, 0), y2 = S2.gy; A(S2, 'vc', lathe([[0.001, 0], [0.6, 0], [0.45, 2.4], [0.4, 2.5], [0.001, 2.5]], 20), [0, y2, 0], null, null, 0xf6f6f2); A(S2, 'glass', K.cyl(0.32, 0.32, 0.45, 12), [0, y2 + 2.75, 0], null, null, 0x8fb4c4); A(S2, 'lights', K.cyl(0.2, 0.2, 0.3, 12), [0, y2 + 2.75, 0], null, null, 0xfff2b0); A(S2, 'vc', K.cyl(0.05, 0.42, 0.3, 12), [0, y2 + 3.12, 0], null, null, 0x2b2420); H.ccol(S2, 0, 0, 0.6); H.finish(S2, 'penghuLight');
    /* the twin-hearts stone weir: two hearts of stacked stone in the shallow sea */
    var th = offshore(p, 1.8, 3.6), S3 = F(th, 0); function heart(ox, s) { var pts = [], n = 36, j; for (j = 0; j <= n; j++) { var t = j / n * Math.PI * 2, x = 16 * Math.pow(Math.sin(t), 3), z = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); pts.push([ox + x * s, z * s]); } for (j = 0; j < pts.length - 1; j++) { var a = pts[j], b = pts[j + 1], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]); A(S3, 'vc', K.box(0.28, 0.22, L2 + 0.05), [(a[0] + b[0]) / 2, 0.05, (a[1] + b[1]) / 2], [0, Math.atan2(b[0] - a[0], b[1] - a[1]), 0], null, 0x6e6a60); } }
    heart(-1.0, 0.12, 0); heart(1.4, 0.075); H.finish(S3, 'twinHeart'); place('twinHeart', th, { kind: 'land', rr: 6 });
    var near = coastPoint(th); act('twinHeart', 'heart', near, 2.2);
    /* fireworks over Magong harbour at night */
    W.fireworks = { x: p[0] + (c[0] - p[0]) * 1.6, z: p[1] + (c[1] - p[1]) * 1.6 }; }
  function kenting() { var p = G.PL.ken, S = F(p, 0), y = S.gy, r = K.seeded(9), i;
    for (i = 0; i < 6; i++) { var bx = -6 + i * 2.2 + r() * 0.6, bz = 5.5 + r() * 1.5, gy = G.height(S.toW(bx, bz)[0], S.toW(bx, bz)[1]); if (gy < 0.2) continue; H.ccol(S, bx, bz, 0.06); A(S, 'vc', K.cyl(0.03, 0.03, 1.5, 6), [bx, gy + 0.75, bz], null, null, 0xdddddd); A(S, 'vc', K.cyl(0.02, 0.85, 0.3, 12), [bx, gy + 1.5, bz], null, null, [0xe8302a, 0x2a8ad8, 0xf2c94c][i % 3]); A(S, 'vc', K.rbox(0.5, 0.06, 1.1, 0.03, 2), [bx + 0.5, gy + 0.18, bz], [0, 0, 0.15], null, 0xf4f0e6); }
    /* 墾丁大街: shophouses along the road through the town, facing it (from the ring road's own points, so none stands on it) */
    var RR = W.ring || [], near = [], nk; for (nk = 0; nk < RR.length; nk++) { var q0 = RR[nk], dq = Math.hypot(q0[0] - p[0], q0[1] - p[1]); if (dq < 14) near.push(nk); }
    var placed = 0, lastK = -99; near.forEach(function (ri) { if (placed >= 8 || ri - lastK < 2) return; var a0 = RR[(ri - 1 + RR.length) % RR.length], b0 = RR[(ri + 1) % RR.length], q1 = RR[ri], tx = b0[0] - a0[0], tz = b0[1] - a0[1], tl = Math.hypot(tx, tz) || 1, nx = -tz / tl, nz = tx / tl;
      [1, -1].forEach(function (sd) { if (placed >= 8) return; var hx = q1[0] + nx * sd * 3.7, hz = q1[1] + nz * sd * 3.7; if (G.sdf(hx, hz) < 1.0 || Math.hypot(hx - p[0], hz - p[1]) > 13 || (G.PL.kenA && Math.hypot(hx - G.PL.kenA[0], hz - G.PL.kenA[1]) < 7.5)) return; var lx = hx - p[0], lz = hz - p[1], ry = Math.atan2(-nx * sd, -nz * sd); if (H.shophouse(S, lx, lz, ry, 1.7, 2.4, 2 + (placed % 2), r, {}) !== 0) { placed++; lastK = ri; } }); });
    H.finish(S, 'kenting');
    var e = inland(G.PL.eluan, 1.4), S2 = F(e, 0), y2 = S2.gy; A(S2, 'vc', lathe([[0.001, 0], [0.75, 0], [0.62, 2.9], [0.55, 3.0], [0.001, 3.0]], 24), [0, y2, 0], null, null, 0xfbfbf8); A(S2, 'glass', K.cyl(0.42, 0.42, 0.55, 16), [0, y2 + 3.3, 0], null, null, 0x6f8fa0); A(S2, 'lights', K.cyl(0.26, 0.26, 0.4, 16), [0, y2 + 3.3, 0], null, null, 0xfff2b0); A(S2, 'vc', K.cyl(0.05, 0.55, 0.4, 16), [0, y2 + 3.78, 0], null, null, 0x2b2420); A(S2, 'vc', K.cyl(0.82, 0.82, 0.1, 24), [0, y2 + 3.02, 0], null, null, 0x2b2420); H.ccol(S2, 0, 0, 0.8);
    box(S2, 'vc', 2.0, 0.9, 1.4, [2.2, y2, 0.5], 0xf4f4f0); H.collider(S2, 2.2, 0.5, 1.05, 0.75); A(S2, 'vc', K.gable(2.1, 1.5, 0.4, { ov: 0.1 }), [2.2, y2 + 0.9, 0.5], null, null, 0xc8653a); H.finish(S2, 'eluan'); place('eluan', e, { kind: 'land', rr: 6 });
    var ap = G.PL.kenA || [p[0] + 0.5, p[1] - 12]; arena('ken', ap, { R: 4.6, rot: Math.atan2(p[0] - ap[0], p[1] - ap[1]), floor: 0xe8d6a6, inner: 0xd8c08a, label: '烈日之環', sub: 'RING OF THE BLAZING SUN' }); place('kenting', p, { kind: 'land', rr: 12 }); }
  function sunMoon() { var L = G.lake; if (!L) return; /* the lake's villages, temples and ropeway are SCENIC's (tw_scenic.js); here the sealed ring below the Shuishe dam and the place itself */
    var ap = G.PL.smlA || [L.x - 14, L.z]; arena('sml', ap, { rot: Math.atan2(L.x - ap[0], L.z - ap[1]), R: 4.6, label: '漏水之淵', sub: 'ABYSS OF THE LEAK' });
    var sh = null; G.ZONES.forEach(function (z) { if (z.id === 'smlShuishe') sh = [z.x, z.z]; }); place('sunmoon', sh || [L.x, L.z], { kind: 'land', rr: 14, spawn: sh }); }
  function alishan() { var p = G.PL.ali, S = F(p, 0), y = S.gy, i, r = K.seeded(3);
    /* the sacred tree */ var tx = -3.0, tz = -2.0; A(S, 'vc', lathe([[0.001, 0], [1.0, 0], [0.75, 0.6], [0.62, 2.5], [0.5, 4.2], [0.3, 5.6], [0.001, 5.8]], 14), [tx, y, tz], null, null, 0x6a5040); for (i = 0; i < 6; i++) { var a = i * 1.1; A(S, 'leaf', K.sph(0.8 + r() * 0.4, 10, 8), [tx + Math.cos(a) * 0.9, y + 4.6 + r() * 1.2, tz + Math.sin(a) * 0.9], null, null, 0x3f7d4a, { sway: 0.4 }); } H.ccol(S, tx, tz, 1.0);
    A(S, 'vc', K.box(1.6, 0.1, 0.5), [tx, y + 0.05, tz + 1.4], null, null, 0x8a6a48); var sg = H.signRect(['阿里山神木', 'THE SACRED TREE'], { w: 384, h: 128, bg: '#5a4030', ink: '#f2e6c8', sub: '#f2c46a' }); H.signQuad(S, sg, 1.2, 0.4, [tx + 1.2, y + 0.6, tz + 1.3], null, true);
    /* the forest railway: a loop of narrow track and a small station */ var R2 = 4.2, cx = 2.5, cz = 1.5, pts = []; for (i = 0; i <= 48; i++) { var b = i / 48 * Math.PI * 2; pts.push([cx + Math.cos(b) * R2, cz + Math.sin(b) * R2 * 0.7]); }
    for (i = 0; i < 48; i++) { var a1 = pts[i], b1 = pts[i + 1], L2 = Math.hypot(b1[0] - a1[0], b1[1] - a1[1]); A(S, 'vc', K.box(0.62, 0.05, L2 + 0.02), [(a1[0] + b1[0]) / 2, y + 0.03, (a1[1] + b1[1]) / 2], [0, Math.atan2(b1[0] - a1[0], b1[1] - a1[1]), 0], null, 0x6a5a4a); A(S, 'gloss', K.box(0.42, 0.04, L2 + 0.02), [(a1[0] + b1[0]) / 2, y + 0.07, (a1[1] + b1[1]) / 2], [0, Math.atan2(b1[0] - a1[0], b1[1] - a1[1]), 0], null, 0x9aa0a6); }
    box(S, 'vc', 2.0, 1.0, 1.2, [cx, y, cz + R2 * 0.7 + 1.3], 0xa8724a); H.collider(S, cx, cz + R2 * 0.7 + 1.3, 1.05, 0.65); A(S, 'vc', K.gable(2.2, 1.4, 0.45, { ov: 0.15 }), [cx, y + 1.0, cz + R2 * 0.7 + 1.3], null, null, 0x5a4a3e); var sg2 = H.signRect(['阿里山', 'ALISHAN'], { w: 256, h: 96, bg: '#f2e6c8', ink: '#5a2a1a' }); H.signQuad(S, sg2, 1.0, 0.38, [cx, y + 0.8, cz + R2 * 0.7 + 0.68], [0, Math.PI, 0], false);
    H.finish(S, 'alishan'); W.aliTrack = { S: S, cx: cx, cz: cz, R: R2, y: y };
    var ap = G.PL.aliA || [p[0] - 1.0, p[1] + 9.0]; var ay = G.height(ap[0], ap[1]); arena('ali', ap, { rot: Math.atan2(p[0] - ap[0], p[1] - ap[1]), y: ay, label: '龜裂之森', sub: 'FOREST OF CRACKS', floor: 0x9a9488, inner: 0x8a8478 }); place('alishan', p, { kind: 'land', rr: 12, y: y }); }
  function eastDLC() { var hp = [G.PL.hua[0] - 3, G.PL.hua[1]], ni = G.nearOn(CTX.ring, hp[0], hp[1] - 9), gpt = CTX.ring[ni.i], gnext = CTX.ring[(ni.i + 1) % CTX.ring.length], rot = Math.atan2(gnext[0] - gpt[0], gnext[1] - gpt[1]), S = F(gpt, rot), y = S.gy;
    [-1.6, 1.6].forEach(function (x) { A(S, 'vc', K.box(0.4, 2.6, 0.4), [x, y + 1.3, 0], null, null, 0xef7a1d); H.collider(S, x, 0, 0.22, 0.22); }); A(S, 'vc', K.box(3.8, 0.7, 0.3), [0, y + 2.75, 0], null, null, 0x22313f); var sg = H.signRect(['東海岸 DLC', 'EAST COAST · DOWNLOADABLE CONTENT'], { w: 512, h: 128, bg: '#22313f', ink: '#ffffff', sub: '#ffb35c' }); H.signQuad(S, sg, 3.6, 0.62, [0, y + 2.75, 0.16], null, true);
    box(S, 'vcSee', 1.2, 1.2, 1.0, [2.6, y, 0], 0xf4f4f0, null, 0.04); A(S, 'glass', K.box(0.9, 0.5, 0.04), [2.6, y + 0.75, 0.51], null, null, 0x5d8394); A(S, 'vc', K.box(1.3, 0.12, 1.1), [2.6, y + 1.2, 0], null, null, 0xef7a1d);
    for (var i = 0; i < 4; i++) { A(S, 'vc', K.cyl(0.03, 0.14, 0.42, 10), [-1.2 + i * 0.8, y + 0.21, -1.2], null, null, 0xf07a12); H.ccol(S, -1.2 + i * 0.8, -1.2, 0.13); }
    H.collider(S, 2.6, 0, 0.6, 0.5); H.finish(S, 'dlcGate'); place('dlc', gpt, { kind: 'land', rr: 8 }); act('dlc', 'dlc', S.toW(2.6, 1.0), 1.5); npc('dlc', 'clerk', S.toW(2.0, 1.1), rot);
    /* Taroko: the marble walls of the gorge */ var tk = G.PL.taroko, S2 = F(tk, -0.6), y2 = S2.gy; [-1, 1].forEach(function (sd) { for (var k = 0; k < 5; k++) { A(S2, 'vc', K.rbox(1.6, 5 + k % 2, 2.2, 0.3, 2), [sd * (1.6 + (k % 2) * 0.3), y2 + 2.4, -4 + k * 2], [0, sd * 0.1, 0], null, k % 2 ? 0xd8d6d0 : 0xc8c6c0); H.collider(S2, sd * (1.6 + (k % 2) * 0.3), -4 + k * 2, 0.8, 1.1, sd * 0.1); } }); H.finish(S2, 'taroko'); place('taroko', tk, { kind: 'land', rr: 7 });
    /* Taitung: the balloon field */ var tp = [G.PL.tai[0] - 2, G.PL.tai[1]], S3 = F(tp, 0), y3 = S3.gy; W.balloons = [];
    [[0, 0, 0xef7a1d], [-3, 2, 0x2a8ad8], [3, 2.5, 0xf2c94c], [-1.5, -3, 0xd8302a], [2.5, -2.5, 0x2a9a6a]].forEach(function (q, k) { W.balloons.push({ x: S3.toW(q[0], q[1])[0], z: S3.toW(q[0], q[1])[1], y: y3, col: q[2], ride: k === 0 }); });
    H.finish(S3, 'taitung'); place('taitung', tp, { kind: 'land', rr: 9 }); act('balloon', 'balloon', S3.toW(0, 1.6), 1.6); npc('balloon', 'pilot', S3.toW(1.2, 1.8), 0);
    /* Chishang: one tree in the middle of the paddies */ var ch = G.PL.chishang, S4 = F(ch, 0); H.tree(S4, 'round', 0, 0, 1.6); H.finish(S4, 'chishang'); place('chishang', ch, { kind: 'land', rr: 6 }); }
  function turbines() { var base = G.PL.hsinchuCoast, i; W.turbines = []; for (i = 0; i < 5; i++) { var p = coastPoint([base[0] - 4, base[1] + (i - 2) * 6]); var q = [p[0] + 1.6, p[1]]; for (var k = 0; k < 12 && G.sdf(q[0], q[1]) < 1.0; k++) q[0] += 0.5; var S = F(q, 0), y = S.gy; A(S, 'vc', K.cyl(0.08, 0.16, 5.5, 10), [0, y + 2.75, 0], null, null, 0xf2f2f0); H.ccol(S, 0, 0, 0.2); A(S, 'vc', K.rbox(0.25, 0.25, 0.6, 0.08, 2), [0, y + 5.55, 0.05], null, null, 0xf2f2f0); H.finish(S, 'turb' + i); W.turbines.push({ x: q[0], y: y + 5.55, z: q[1] + 0.35 }); } }
  function build(world, ctx, helpers) { W = world; CTX = ctx; G = ctx.G; K = ctx.K; Q = ctx.Q; H = helpers; A = H.A; box = H.box;
    [shrine, diner, temple, lotus, port, penghu, kenting, sunMoon, alishan, eastDLC, turbines].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.error('land ' + f.name, e); } });
    var GR = { shrine: 4.2, diner: 3.0, temple: 4.0, port: 3.0, magong: 4.0, sml: 5.2, ali: 6.0, ken: 6.0, dlc: 3.0, alishan: 4.5 }; Object.keys(GR).forEach(function (k) { var p = W.places[k]; if (p && W.grassNo) W.grassNo.push([p.x, p.z, GR[k]]); }); }
  return { build: build };
})();


