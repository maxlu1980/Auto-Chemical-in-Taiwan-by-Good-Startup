/* ===== [tw_more.js] ===== */
/* ===== MORE — the cities' landmarks, their street food, the beaches, the highways' markers (v33) =====
   Every city gets the landmark that names it at a glance and the dish it is known for, a stall at the station plaza or in the
   street: Taipei 101, the Presidential Office, Daan Forest Park and the Red House of Ximending; Taoyuan airport with its two
   terminals, the tower and an airliner; Hsinchu's East Gate; the National Taichung Theater and the tetrapods of the Taichung coast;
   Tainan's Chihkan Tower and a beef-soup shop; Kaohsiung's 85 Sky Tower; Kenting's resort hotel over the little bay and the long
   South Bay; Taroko's archway and the Eternal Spring Shrine; Zhiben's hot springs and Taitung's sugar-apple orchards; Sun Moon Lake's
   visitor centre, villages, ropeway, lake hotels and fireworks; Alishan's pheasants. Real places are put at their true bearing from
   the town, moved only as far as needed to stand clear of the stations, the roads and the sea (the island is drawn at 1 unit ≈ 1 km,
   its buildings at a far larger scale). Original designs throughout; real names appear only as place labels. */
var MORE = (function () {
  var G, K, Q, W, H, A, box, M;
  function F(p, rot) { var S = H.Frame(p[0], p[1], rot || 0, 0); S.gy = G.height(p[0], p[1]); return S; }
  function place(id, p, o) { W.places[id] = Object.assign({ id: id, x: p[0], z: p[1], rr: 8 }, o || {}); }
  function act(id, kind, p, r) { W.interact.push({ id: id, kind: kind, x: p[0], z: p[1], r: r || 1.6 }); }
  function npc(id, role, p, rot, o) { W.npcs.push(Object.assign({ id: id, role: role, x: p[0], z: p[1], rot: rot || 0 }, o || {})); }
  function face(from, to) { return Math.atan2(to[0] - from[0], to[1] - from[1]); }
  function roadAt(x, z) { var R2 = W.roadG; if (!R2) return false; var cx = Math.floor(x - G.X0), cz = Math.floor(z - G.Z0); return cx >= 0 && cz >= 0 && cx < G.GW && cz < G.GH && !!R2[cz * G.GW + cx]; }
  function solidNear(x, z, r) { return W.colliders.some(function (c) { if (Math.abs(c.x - x) > r + 4 || Math.abs(c.z - z) > r + 4) return false; if (c.r) return Math.hypot(c.x - x, c.z - z) < c.r + r; return Math.hypot(c.x - x, c.z - z) < Math.max(c.hw, c.hd) + r; }); }
  /* a free site of radius r near p: on land, off the roads, clear of the stations and places and of anything solid */
  function site(p, r, o) { o = o || {}; var R, a, pass;
    function ok(x, z, pass) { if (G.sdf(x, z) < (o.coast == null ? r + 1.0 : o.coast)) return false; if (G.lake && G.lake.sd && G.lake.sd(x, z) > -(o.lakeM != null ? o.lakeM : Math.min(r, 1.2))) return false; if (o.maxSdf && G.sdf(x, z) > o.maxSdf) return false; var h = G.height(x, z); if (h < 0.3 || (o.maxH && h > o.maxH)) return false; var sl = o.slope || 0.9, rs = Math.max(r, 1.2);
      for (var si = 0; si < 16; si++) { var sa = si * Math.PI / 4, sr2 = si < 8 ? rs : rs * 0.5; if (Math.abs(G.height(x + Math.sin(sa) * sr2, z + Math.cos(sa) * sr2) - h) > sl) return false; }
      var i, j, e = pass < 2 ? 0.8 : 0.45; for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) if (roadAt(x + i * r * e, z + j * r * e)) return false; if (solidNear(x, z, r * (pass < 2 ? 1 : 0.8))) return false; if (W.keepouts && W.keepouts.some(function (q) { return Math.hypot(q[0] - x, q[1] - z) < q[2] + r; })) return false;
      for (var k in W.places) { var q = W.places[k]; if (o.allow && o.allow.indexOf(k) >= 0) continue; var rr = q.kind === 'station' ? (pass < 2 ? 15.5 : 12) : q.kind === 'arena' ? (q.R || 5) + 3.2 : Math.min(q.rr || 6, 9) * (pass < 2 ? 0.75 : 0.5); if (Math.hypot(q.x - x, q.z - z) < rr + r) return false; } return true; }
    for (pass = 0; pass < (o.near ? 2 : 3); pass++) { var lv = pass === 0 ? 0 : 2; if (ok(p[0], p[1], lv)) return [p[0], p[1]]; var mR = (o.maxR || 30) * (pass === 2 ? 1.6 : 1);
      for (R = 1; R < mR; R += 0.8) { var n = Math.max(10, Math.round(R * 3)); for (a = 0; a < n; a++) { var t = a / n * Math.PI * 2 + (o.bias || 0), x = p[0] + Math.sin(t) * R, z = p[1] + Math.cos(t) * R; if (ok(x, z, lv)) return [x, z]; } } if (o.strict) break; }
    if (window.console) console.warn('more: no site near', p, r); return o.force ? [p[0], p[1]] : null; }
  function LL(lon, lat) { return G.ll(lon, lat); }
  /* the city landmarks claim their ground before the towns are built, so the town blocks grow around them (not over them) */
  var RES = {}, RESV = {
    t101: function () { var st = W.places.tpe; return st && [[st.x + 17, st.z + 6], 3.2, { bias: 1.9, maxR: 18 }]; },
    tPres: function () { var st = W.places.tpe; return st && [[st.x - 15, st.z + 4], 3.4, { bias: 3.9, maxR: 12, slope: 1.1 }]; },
    tDaan: function () { var st = W.places.tpe; return st && [[st.x - 12, st.z - 17], 4.6, { bias: 0.5, maxR: 14, slope: 0.6 }]; },
    tXimen: function () { var st = W.places.tpe; return st && [[st.x - 17, st.z + 3], 3.6, { bias: 4.6, maxR: 16 }]; },
    hGate: function () { return W.places.hsz && [LL(120.9702, 24.8042), 3.2, { bias: 4.5 }]; },
    tTheater: function () { return W.places.txg && [LL(120.6403, 24.1626), 3.6, { bias: 0.4 }]; },
    tChihkan: function () { return W.places.tnn && [G.PL.temple ? [G.PL.temple[0] + 6, G.PL.temple[1] - 4] : LL(120.2024, 22.997), 4.2, { bias: 2.0 }]; },
    k85: function () { return W.places.khh && [LL(120.3000, 22.6117), 3.4, { bias: 3.2 }]; },
    rival: function () { var st = W.places.khh; return st && [[st.x - 4, st.z - 14], 6.6, { coast: 1.5, maxR: 30, slope: 0.5, bias: 2.4 }]; } };
  function pick(id) { if (RES[id]) return RES[id]; var d = RESV[id] && RESV[id](); return d ? site(d[0], d[1], d[2]) : null; }
  function reserve(world, ctx) { W = world; G = ctx.G; K = ctx.K; Q = ctx.Q; W.keepouts = W.keepouts || [];
    Object.keys(RESV).forEach(function (id) { try { var d = RESV[id](); if (!d) return; var p = site(d[0], d[1], d[2]); if (p) { RES[id] = p; W.keepouts.push([p[0], p[1], d[1] + 1.4]); } } catch (e) { if (window.console) console.error('more reserve ' + id, e); } }); }
  function sign2(S, lines, w, p, ry, o) { o = o || {}; var rect = H.signRect(lines, { w: 384, h: 128, bg: o.bg || '#22313f', ink: o.ink || '#ffffff', sub: o.sub || '#f2c46a' }); H.signQuad(S, rect, w, w / 3, p, ry ? [0, ry, 0] : null, !!o.both); }
  function plaque(S, lx, lz, lines, ry) { var gy = S.gy; A(S, 'vc', K.box(0.06, 0.6, 0.06), [lx, gy + 0.3, lz], null, null, 0x5a4a3a); sign2(S, lines, 1.0, [lx, gy + 0.78, lz + 0.04], ry || 0, { bg: '#3a3028', ink: '#f6ecd8', both: true }); }
  /* a food stall on a station plaza (its own frame: the station's is already built) or at a world point */
  function stallAt(stId, food, name, lp) { var st = W.places[stId]; if (!st || !st.frame) return null; lp = lp || [3.6, 7.2]; var w = st.frame.toW(lp[0], lp[1]), S = F(w, st.rot); H.stall(S, 0, 0, 0, food, name); H.finish(S, 'stall_' + food); return w; }
  function stallWorld(p, rot, food, name) { if (!p) return null; var S = F(p, rot); H.stall(S, 0, 0, 0, food, name); H.finish(S, 'stall_' + food); return p; }
  var SIGHTS = []; function sight(id, p, rr, o) { place(id, p, Object.assign({ kind: 'sight', rr: rr || 7 }, o || {})); act(id, 'sight', o && o.at ? o.at : p, o && o.r ? o.r : 2.2); SIGHTS.push(id); }

  /* ================= Taipei ================= */
  function taipei() { var st = W.places.tpe; if (!st) return;
    /* Taipei 101: eight flaring eight-storey segments on a tapering podium, ruyi ornaments, the four coins at the base, the spire */
    var p = pick('t101'); if (p) { var S = F(p, 0), y = S.gy, Hs = 1.55, i;
      box(S, 'vc', 7.0, 0.9, 4.2, [0, y, 3.4], 0xd6dade); A(S, 'glass', K.surf(16, 4, function (u, v, pp) { var x = (u - 0.5) * 7.0, h = 0.9 + 0.6 * Math.sin(u * Math.PI); pp.set(x, h * v + 0.9 * (1 - v), 5.5 - v * 4.2); }, true), [0, y, 0], null, null, 0x7fb0a8);
      A(S, 'glassSee', K.cyl(1.25, 1.75, 4.4, 4), [0, y + 2.2, 0], [0, Math.PI / 4, 0], null, 0x5f9c94);
      for (i = 0; i < 8; i++) { var yb = y + 4.4 + i * Hs; A(S, 'glass', K.cyl(1.42, 1.08, Hs, 4), [0, yb + Hs / 2, 0], [0, Math.PI / 4, 0], null, 0x6aa59a); A(S, 'vc', K.cyl(1.47, 1.43, 0.08, 4), [0, yb + Hs - 0.02, 0], [0, Math.PI / 4, 0], null, 0xe8f0ee);
        for (var q = 0; q < 4; q++) { var a = q * Math.PI / 2; A(S, 'lights', K.box(0.6, 0.03, 0.03), [Math.sin(a) * 1.05, yb + 0.12, Math.cos(a) * 1.05], [0, a, 0], null, 0xfff2c8); A(S, 'vc', K.sph(0.14, 10, 8), [Math.sin(a) * 1.08, yb + 0.25, Math.cos(a) * 1.08], null, [1, 0.6, 0.35], 0xe8c860); } }
      var ytop = y + 4.4 + 8 * Hs; A(S, 'glass', K.cyl(0.8, 1.0, 0.9, 4), [0, ytop + 0.45, 0], [0, Math.PI / 4, 0], null, 0x6aa59a); A(S, 'vc', K.cyl(0.5, 0.75, 0.6, 4), [0, ytop + 1.2, 0], [0, Math.PI / 4, 0], null, 0xdfe6e4); A(S, 'lights', K.cyl(0.07, 0.22, 3.2, 8), [0, ytop + 3.1, 0], null, null, 0xffe38a);
      for (i = 0; i < 4; i++) { var a2 = i * Math.PI / 2 + Math.PI / 4; A(S, 'vc', K.cyl(0.42, 0.42, 0.08, 20), [Math.sin(a2) * 1.62, y + 3.0, Math.cos(a2) * 1.62], [Math.PI / 2, a2, 0], null, 0xd8b24a); }
      H.collider(S, 0, 0, 1.6, 1.6); H.collider(S, 0, 3.4, 3.5, 2.1); plaque(S, 2.8, 6.2, ['台北 101', 'TAIPEI 101']); H.finish(S, 'tpe101'); sight('t101', p, 6, { at: S.toW(2.8, 6.8) }); }
    /* the Presidential Office: red brick and white bands, the 日-shaped block, the tall central tower */
    p = pick('tPres'); if (p) { var S2 = F(p, face(p, [st.x, st.z])), y2 = S2.gy, B = 0xb3563a, Wb = 0xf1ece0;
      box(S2, 'vc', 9.0, 1.9, 4.6, [0, y2, 0], B); for (var b2 = 0; b2 < 3; b2++) box(S2, 'vc', 9.05, 0.08, 4.65, [0, y2 + 0.45 + b2 * 0.6, 0], Wb); A(S2, 'vc', K.box(9.1, 0.12, 4.7), [0, y2 + 1.95, 0], null, null, Wb);
      for (var w2 = 0; w2 < 16; w2++) A(S2, 'glass', K.box(0.22, 0.3, 0.04), [-4.0 + w2 * 0.53, y2 + 1.1, 2.32], null, null, 0x3a4a52);
      box(S2, 'vc', 1.3, 4.6, 1.3, [0, y2, 1.6], B); for (var t2 = 0; t2 < 6; t2++) box(S2, 'vc', 1.34, 0.06, 1.34, [0, y2 + 0.8 + t2 * 0.68, 1.6], Wb); box(S2, 'vc', 0.95, 0.9, 0.95, [0, y2 + 4.6, 1.6], B); A(S2, 'vc', K.cyl(0.3, 0.55, 0.5, 4), [0, y2 + 5.75, 1.6], [0, Math.PI / 4, 0], null, Wb); A(S2, 'vc', K.cyl(0.03, 0.03, 0.8, 6), [0, y2 + 6.4, 1.6], null, null, 0x8a8a8a);
      A(S2, 'vc', K.box(1.6, 1.2, 0.6), [0, y2 + 0.6, 2.6], null, null, Wb); A(S2, 'lights', new THREE.PlaneGeometry(8.6, 0.25), [0, y2 + 1.95, 2.39], null, null, 0xfff0c8);
      H.collider(S2, 0, 0.3, 4.6, 2.7); plaque(S2, 3.6, 3.6, ['總統府', 'PRESIDENTIAL OFFICE']); H.finish(S2, 'tpePres'); sight('tPres', p, 6, { at: S2.toW(3.6, 4.2) }); }
    /* Daan Forest Park: the lawn, groves, the pond with its two islets and the white Guanyin, the amphitheatre, benches (the software saleswoman sits on one) */
    p = pick('tDaan'); if (p) { var S3 = F(p, 0), y3 = S3.gy, r = K.seeded(101), i3;
      A(S3, 'vc', K.box(10, 0.04, 9), [0, y3 + 0.01, 0], null, null, 0x7fb257); for (i3 = 0; i3 < 12; i3++) { var ax = -4.4 + r() * 8.8, az = -3.8 + r() * 7.6; if (Math.hypot(ax - 2.0, az + 1.2) < 2.0 || Math.hypot(ax + 2.6, az - 1.8) < 2.0 || Math.abs(az - 1.0) < 0.8) continue; H.tree(S3, r() < 0.3 ? 'palm' : r() < 0.6 ? 'bamboo' : 'round', ax, az, 0.9 + r() * 0.3); H.ccol(S3, ax, az, 0.16); }
      A(S3, 'glass', K.cyl(1.6, 1.6, 0.06, 32), [2.0, y3 + 0.02, -1.2], null, [1, 1, 0.7], 0x4f9ab8); [[1.5, -1.3], [2.6, -0.9]].forEach(function (q) { A(S3, 'vc', K.cyl(0.45, 0.55, 0.16, 14), [q[0], y3 + 0.06, q[1]], null, null, 0x6aa84a); H.tree(S3, 'round', q[0], q[1], 0.55); });
      A(S3, 'vc', K.cyl(0.25, 0.3, 0.4, 12), [3.1, y3 + 0.2, 0.2], null, null, 0xe8e4dc); A(S3, 'vc', K.lathe([[0.001, 0], [0.18, 0], [0.16, 0.5], [0.11, 0.9], [0.08, 1.0], [0.001, 1.04]], 14), [3.1, y3 + 0.4, 0.2], null, null, 0xf4f2ee);
      for (var sr = 0; sr < 4; sr++) A(S3, 'vc', new THREE.CylinderGeometry(0.9 + sr * 0.36, 0.9 + sr * 0.36, 0.12 + sr * 0.22, 24, 1, false, Math.PI / 2, Math.PI), [-2.6, y3 + (0.12 + sr * 0.22) / 2, 1.8], null, null, sr % 2 ? 0xcfc8bc : 0xbdb6aa); A(S3, 'vc', K.surf(14, 6, function (u, v, pp) { var a = Math.PI * u; pp.set(Math.cos(a) * 0.85, Math.sin(Math.PI * v * 0.5) * 1.2, -Math.sin(a) * 0.5 * v - 0.2); }, true), [-2.6, y3, 1.8], null, null, 0xf2f2ee); H.collider(S3, -2.6, 1.6, 1.3, 0.5);
      [[-0.6, 1.0, 0], [1.3, 1.0, 0], [0.2, -3.0, Math.PI]].forEach(function (b) { H.bench(S3, b[0], b[1], b[2]); });
      W.daanBench = S3.toW(-0.6, 1.0); W.daanFrame = S3; W.daanBenchRot = S3.rot; W.daanY = y3; plaque(S3, 4.4, 3.8, ['大安森林公園', 'DAAN FOREST PARK']); H.finish(S3, 'tpeDaan'); sight('tDaan', p, 7, { at: S3.toW(4.4, 4.4) }); }
    /* Ximending: the octagonal Red House and a street of bright signs */
    p = pick('tXimen'); if (p) { var S4 = F(p, face(p, [st.x, st.z])), y4 = S4.gy;
      A(S4, 'vc', K.cyl(1.5, 1.55, 1.8, 8), [0, y4 + 0.9, 0], [0, Math.PI / 8, 0], null, 0xb5452e); for (var f4 = 0; f4 < 2; f4++) A(S4, 'vc', K.cyl(1.57, 1.57, 0.07, 8), [0, y4 + 0.6 + f4 * 0.8, 0], [0, Math.PI / 8, 0], null, 0xf0e6d6);
      A(S4, 'vc', K.cyl(0.25, 1.75, 0.8, 8), [0, y4 + 2.2, 0], [0, Math.PI / 8, 0], null, 0x6a6460); A(S4, 'vc', K.cyl(0.08, 0.32, 0.6, 8), [0, y4 + 2.8, 0], [0, Math.PI / 8, 0], null, 0xb5452e);
      box(S4, 'vc', 2.4, 1.1, 3.0, [0, y4, -2.6], 0xb5452e); A(S4, 'vc', K.gable(2.5, 3.1, 0.6, { ov: 0.1 }), [0, y4 + 1.1, -2.6], [0, Math.PI / 2, 0], null, 0x6a6460);
      for (var d4 = 0; d4 < 8; d4++) { var a4 = d4 / 8 * Math.PI * 2 + Math.PI / 8; A(S4, 'glass', K.box(0.4, 0.55, 0.04), [Math.sin(a4) * 1.46, y4 + 1.25, Math.cos(a4) * 1.46], [0, a4, 0], null, 0x3a4a52); }
      H.collider(S4, 0, -1.0, 1.6, 3.2); plaque(S4, 2.2, 1.8, ['西門紅樓', 'THE RED HOUSE']);
      var NEON = [['西門町', '#ff3a6a'], ['電影', '#3ad8ff'], ['潮牌', '#ffd23a'], ['冰店', '#7aff6a'], ['刺青', '#ff7a3a']]; for (var n4 = 0; n4 < 5; n4++) { var xx = -5.6 + n4 * 2.6; if (n4 === 2) continue; H.shophouse(S4, xx, 6.0, Math.PI, 1.6, 2.4, 3, K.seeded(n4 + 7), { force: true }); var rect = H.signRect([NEON[n4][0], ''], { w: 256, h: 96, bg: '#151519', ink: NEON[n4][1] }); H.signQuad(S4, rect, 0.9, 0.34, [xx, y4 + 2.2, 4.68], [0, Math.PI, 0], false, 'signL'); }
      H.finish(S4, 'tpeXimen'); sight('tXimen', p, 6, { at: S4.toW(2.2, 2.4) }); }
    stallAt('tpe', 'beefnoodle', ['牛肉麵', 'BEEF NOODLES']); }

  /* ================= Taoyuan: the international airport ================= */
  function airport() { var st = W.places.tao; if (!st) return; var p0 = LL(121.2239, 25.0764), p = site(p0, 9.0, { coast: 3, bias: 3.6, maxR: 40 }); if (!p) return;
    var rot = Math.atan2(0.809, -0.588), S = F(p, rot), y = S.gy, i; /* runways 05/23: heading 054° */
    [[-2.6, 18], [2.6, 17]].forEach(function (rw, k) { A(S, 'vc', K.box(1.1, 0.03, rw[1]), [rw[0], y + 0.02, 0], null, null, 0x55595e); for (i = 0; i < Math.floor(rw[1] / 1.2); i++) A(S, 'vc', K.box(0.06, 0.032, 0.5), [rw[0], y + 0.03, -rw[1] / 2 + 0.8 + i * 1.2], null, null, 0xf2f2f0); [-1, 1].forEach(function (e) { for (var j = 0; j < 6; j++) A(S, 'vc', K.box(0.08, 0.032, 0.6), [rw[0] - 0.42 + j * 0.17, y + 0.03, e * (rw[1] / 2 - 0.6)], null, null, 0xf2f2f0); }); var lbl = H.signRect([k ? '05R' : '05L', ''], { w: 128, h: 96, bg: '#55595e', ink: '#ffffff' }); H.signQuad(S, lbl, 0.7, 0.5, [rw[0], y + 0.035, rw[1] / 2 - 1.6], [-Math.PI / 2, 0, 0], false); });
    A(S, 'vc', K.box(1.2, 0.025, 15), [0, y + 0.015, 0], null, null, 0x6a6e72); A(S, 'vc', K.box(7.5, 0.025, 5.4), [-7.0, y + 0.015, -1.0], null, null, 0x8a8e92);
    /* Terminal 1: a long hall under a great curved roof of catenary girders */ A(S, 'glassSee', K.box(2.0, 1.1, 6.2), [-10.2, y + 0.55, -2.2], null, null, 0x5d8794); A(S, 'gloss', K.surf(20, 8, function (u, v, pp) { var z = -5.3 + u * 6.2, x = -1.25 + v * 2.5, sag = 0.25 * Math.sin(v * Math.PI); pp.set(x, 1.45 - sag + 0.15 * Math.sin(u * Math.PI), z); }, true), [-10.2, y, 0], null, null, 0xc9ced4); for (i = 0; i < 9; i++) A(S, 'gloss', K.box(2.6, 0.06, 0.06), [-10.2, y + 1.36, -5.2 + i * 0.75], null, null, 0x8a9096); A(S, 'lights', new THREE.PlaneGeometry(5.8, 0.9), [-9.18, y + 0.55, -2.2], [0, Math.PI / 2, 0], null, 0xfff0d4);
    /* Terminal 2: a box of glass on trusses like brackets */ A(S, 'glassSee', K.box(2.2, 1.5, 5.0), [-10.3, y + 0.75, 3.5], null, null, 0x58808e); for (i = 0; i < 6; i++) A(S, 'gloss', K.tube([[-9.15, y + 1.5, 1.2 + i * 0.9], [-8.7, y + 1.25, 1.2 + i * 0.9], [-9.15, y + 1.0, 1.2 + i * 0.9]], 0.04, 6, 5), null, null, null, 0xb8bec4); box(S, 'vc', 2.5, 0.12, 5.3, [-10.3, y + 1.5, 3.5], 0xd4d8db); A(S, 'lights', new THREE.PlaneGeometry(4.6, 1.2), [-9.18, y + 0.75, 3.5], [0, Math.PI / 2, 0], null, 0xfff0d4);
    /* the control tower: a white shaft, the cab under a curved white roof (after the Queen's Head rock) */ A(S, 'vc', K.cyl(0.32, 0.42, 3.4, 16), [-8.4, y + 1.7, 0.6], null, null, 0xeeeeea); A(S, 'glass', K.cyl(0.62, 0.5, 0.45, 16), [-8.4, y + 3.62, 0.6], null, null, 0x6f8fa0); A(S, 'vc', K.sph(0.72, 18, 10), [-8.4, y + 3.95, 0.45], null, [1, 0.45, 1.25], 0xf6f6f2); A(S, 'vc', K.cyl(0.02, 0.02, 0.6, 6), [-8.4, y + 4.5, 0.6], null, null, 0x9aa0a6); A(S, 'lights', K.sph(0.05, 8, 6), [-8.4, y + 4.8, 0.6], null, null, 0xff3a2a);
    for (i = 0; i < 4; i++) { A(S, 'vc', K.box(0.18, 0.45, 1.6), [-8.9, y + 0.62, -4.0 + i * 1.3], [0, 0, -0.35], null, 0xc9ced4); }
    H.collider(S, -10.2, -2.2, 1.1, 3.2); H.collider(S, -10.3, 3.5, 1.2, 2.6); H.collider(S, -8.4, 0.6, 0.45, 0.45);
    sign2(S, ['桃園國際機場', 'TAOYUAN AIRPORT'], 2.4, [-9.12, y + 1.85, 0.6], Math.PI / 2, { both: true }); H.finish(S, 'airport');
    /* an airliner at the gate, another taking off and landing in turn */ var gate = S.toW(-6.6, -1.6), plane = PROPS.airliner(); plane.position.set(gate[0], y + plane.userData.groundY, gate[1]); plane.rotation.y = rot + Math.PI / 2; W.scene.add(plane); plane.traverse(function (m) { if (m.isMesh) { m.castShadow = true; } }); W.colliders.push({ x: gate[0], z: gate[1], hw: 3.2, hd: 1.0, rot: rot + Math.PI / 2 });
    var flyer = PROPS.airliner({ gear: false }); W.scene.add(flyer); var a0 = S.toW(2.6, -8.5), a1 = S.toW(2.6, 8.5), dir = [a1[0] - a0[0], a1[1] - a0[1]], dl = Math.hypot(dir[0], dir[1]), T = 0;
    W.anim.push(function (dt) { T = (T + dt) % 40; var u = T / 40, s2, h; if (u < 0.45) { s2 = u / 0.45; s2 = s2 * s2; h = Math.max(0, (s2 - 0.55) / 0.45) * 6; } else { s2 = 1 + (u - 0.45) * 6; h = 6 + (u - 0.45) * 60; } var x = a0[0] + dir[0] * s2, z = a0[1] + dir[1] * s2; flyer.position.set(x, y + 0.64 + h, z); flyer.rotation.set(0, Math.atan2(dir[0], dir[1]), 0); flyer.rotateX(-Math.min(0.22, h * 0.05)); flyer.visible = u < 0.75; });
    place('airport', p, { kind: 'sight', rr: 12, frame: S }); stallAt('tao', 'daxitofu', ['大溪豆干', 'DAXI DRIED TOFU']); act('airport', 'airport', S.toW(-8.6, 3.5), 2.0); W.airport = { p: p, S: S, rot: rot, gate: gate, y: y, run0: a0, run1: a1 }; }

  /* ================= Hsinchu: the East Gate in its roundabout ================= */
  function hsinchu() { var st = W.places.hsz; if (!st) return; var p = pick('hGate'); if (!p) return; var S = F(p, face(p, [st.x, st.z])), y = S.gy;
    A(S, 'vc', K.cyl(3.2, 3.2, 0.05, 40), [0, y + 0.02, 0], null, null, 0x9aa08a); A(S, 'glass', new THREE.RingGeometry(1.9, 2.5, 40).rotateX(-Math.PI / 2), [0, y + 0.05, 0], null, null, 0x4f8fa8);
    box(S, 'vc', 2.2, 1.0, 1.4, [0, y, 0], 0xbab4a6); A(S, 'vc', K.box(0.8, 0.75, 1.5), [0, y + 0.37, 0], null, null, 0x3a3632); A(S, 'vc', K.cyl(0.4, 0.4, 1.5, 16, true), [0, y + 0.75, 0], [Math.PI / 2, 0, 0], null, 0x3a3632);
    box(S, 'vc', 1.9, 0.08, 1.2, [0, y + 1.0, 0], 0x8a3a2a); for (var i = 0; i < 6; i++) [-0.5, 0.5].forEach(function (zz) { A(S, 'vc', K.cyl(0.04, 0.04, 0.6, 8), [-0.8 + i * 0.32, y + 1.38, zz], null, null, 0xa83a2a); });
    A(S, 'vc', K.hip(1.9, 1.3, 0.35, { ov: 0.25 }), [0, y + 1.68, 0], null, null, 0x5a5550); A(S, 'vc', K.hip(1.3, 0.8, 0.3, { ov: 0.18 }), [0, y + 2.0, 0], null, null, 0x5a5550); H.collider(S, -0.72, 0, 0.38, 0.7); H.collider(S, 0.72, 0, 0.38, 0.7);
    plaque(S, 2.0, 1.6, ['新竹東門 · 迎曦門', 'HSINCHU EAST GATE']); H.finish(S, 'hszGate'); sight('hGate', p, 5, { at: S.toW(2.0, 2.2) });
    stallAt('hsz', 'bihun', ['米粉貢丸湯', 'VERMICELLI & PORK BALLS']); }

  /* ================= Taichung: the National Theater; the coast, its tetrapods and the men who walk there ================= */
  function taichung() { var st = W.places.txg; if (!st) return; stallAt('txg', 'bubbletea', ['珍珠奶茶', 'BUBBLE TEA']);
    var p = pick('tTheater'); if (p) { var S = F(p, face(p, [st.x, st.z])), y = S.gy, HH = 3.0, WW = 5.2, DD = 3.6;
      function wall(w, h, holes) { var g = K.ext([[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], 0.14, { holes: holes.map(function (hq) { var pts = [], k; for (k = 0; k < 20; k++) { var a = k / 20 * Math.PI * 2; pts.push([hq[0] + Math.cos(a) * hq[2], hq[1] + Math.sin(a) * hq[3]]); } return pts; }) }); return g; }
      var holesF = [[-1.6, 0.9, 0.55, 0.75], [0.2, 0.75, 0.75, 0.6], [1.8, 1.0, 0.5, 0.8], [-0.7, 2.25, 0.6, 0.45], [1.2, 2.3, 0.65, 0.42]], holesS = [[-0.8, 0.85, 0.6, 0.7], [0.9, 1.1, 0.55, 0.8], [0.0, 2.3, 0.7, 0.45]];
      A(S, 'vcSee', wall(WW, HH, holesF), [0, y, DD / 2], null, null, 0xf2f1ec); A(S, 'vcSee', wall(WW, HH, holesF), [0, y, -DD / 2], [0, Math.PI, 0], null, 0xf2f1ec); A(S, 'vcSee', wall(DD, HH, holesS), [WW / 2, y, 0], [0, Math.PI / 2, 0], null, 0xf2f1ec); A(S, 'vcSee', wall(DD, HH, holesS), [-WW / 2, y, 0], [0, -Math.PI / 2, 0], null, 0xf2f1ec);
      A(S, 'glass', K.box(WW - 0.4, HH - 0.1, DD - 0.4), [0, y + HH / 2, 0], null, null, 0x48606a); A(S, 'lights', K.box(WW - 0.5, HH - 0.3, DD - 0.5), [0, y + HH / 2, 0], null, null, 0xffe8c0); A(S, 'vc', K.box(WW, 0.14, DD), [0, y + HH, 0], null, null, 0xf2f1ec); A(S, 'leaf', K.box(WW - 0.3, 0.12, DD - 0.3), [0, y + HH + 0.12, 0], null, null, 0x6aa84a);
      H.collider(S, 0, 0, WW / 2, DD / 2); plaque(S, WW / 2 + 0.6, DD / 2 + 0.5, ['臺中國家歌劇院', 'NATIONAL TAICHUNG THEATER']); H.finish(S, 'txgTheater'); sight('tTheater', p, 6, { at: S.toW(WW / 2 + 0.6, DD / 2 + 1.0) }); }
    /* the Wuqi coast: tetrapods along the waterline, a breakwater, and a few men in black who walk it at night */
    var c0 = LL(120.5207, 24.2932), best = null, bd = 1e9, x, z; for (x = -10; x <= 10; x += 0.5) for (z = -10; z <= 10; z += 0.5) { var sd = G.sdf(c0[0] + x, c0[1] + z); if (Math.abs(sd - 0.6) < 0.3) { var d = Math.hypot(x, z); if (d < bd) { bd = d; best = [c0[0] + x, c0[1] + z]; } } } if (!best) return;
    var e = 0.8, gx = G.sdf(best[0] + e, best[1]) - G.sdf(best[0] - e, best[1]), gz = G.sdf(best[0], best[1] + e) - G.sdf(best[0], best[1] - e), gl = Math.hypot(gx, gz) || 1, nx = gx / gl, nz = gz / gl, tx = -nz, tz = nx, S2 = F(best, Math.atan2(nx, nz)), y2 = Math.max(0.2, S2.gy), r = K.seeded(51), i, path = [];
    var tet = (function () { var g = []; [[0, 1, 0], [0.943, -0.333, 0], [-0.471, -0.333, 0.816], [-0.471, -0.333, -0.816]].forEach(function (v) { var c = new THREE.CylinderGeometry(0.06, 0.2, 0.5, 8); c.translate(0, 0.25, 0); var q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(v[0], v[1], v[2])); c.applyQuaternion(q); g.push(c); }); return g; })();
    for (i = 0; i < 60; i++) { var along = -9 + (i % 30) * 0.62 + r() * 0.2, row = Math.floor(i / 30), lx = along, lz = -0.4 - row * 0.5 + r() * 0.15, ry = r() * 6.28, rx = r() * 0.6; tet.forEach(function (g) { A(S2, 'vc', g, [lx, y2 + 0.18 + row * 0.12, lz], [rx, ry, r() * 0.4], null, 0xb4b0a8); }); }
    box(S2, 'vc', 19, 0.5, 0.9, [0, y2 - 0.3, 0.8], 0xa8a49a); for (i = 0; i < 7; i++) H.lamp(S2, -8 + i * 2.7, 1.5, 1.6);
    sign2(S2, ['梧棲漁港 · 北堤', 'WUQI · NORTH BREAKWATER'], 1.4, [9.6, y2 + 0.9, 1.6], 0, { both: true }); A(S2, 'vc', K.box(0.06, 0.9, 0.06), [9.6, y2 + 0.45, 1.6], null, null, 0x5a4a3a); H.finish(S2, 'txgTetra');
    for (i = 0; i <= 12; i++) { var w = S2.toW(-8 + i * 1.33, 1.6); path.push([w[0], w[1]]); } W.gangPath = path; place('wuqi', best, { kind: 'sight', rr: 6 }); }

  /* a pavilion of the south: red walls and columns, a double-eave hip-and-gable roof of red-orange tile with upswept ridge ends */
  function pavilion(S, lx, lz, y, w, d, h, ry) { ry = ry || 0; var c = Math.cos(ry), s = Math.sin(ry); function L(a, yy, b) { return [lx + a * c + b * s, y + yy, lz - a * s + b * c]; }
    A(S, 'vc', K.box(w, h, d), L(0, h / 2, 0), [0, ry, 0], null, 0xc8402a); for (var i = 0; i < 6; i++) A(S, 'vc', K.cyl(0.07, 0.07, h, 8), L(-w / 2 + 0.1 + i * (w - 0.2) / 5, h / 2, d / 2 + 0.12), null, null, 0xb02a1e);
    A(S, 'vc', K.hip(w + 0.2, d + 0.3, 0.42, { ov: 0.32 }), L(0, h, 0), [0, ry, 0], null, 0xd2582e); A(S, 'vc', K.box(w * 0.7, 0.45, d * 0.6), L(0, h + 0.42, 0), [0, ry, 0], null, 0xc8402a); A(S, 'vc', K.gable(w * 0.72, d * 0.66, 0.5, { ov: 0.25 }), L(0, h + 0.86, 0), [0, ry, 0], null, 0xd2582e);
    [-1, 1].forEach(function (e) { A(S, 'vc', K.tube([[0, 0, 0], [e * 0.25, 0.12, 0], [e * 0.38, 0.32, 0]], 0.035, 6, 5).translate(L(e * w * 0.36, h + 1.36, 0)[0], L(e * w * 0.36, h + 1.36, 0)[1], L(e * w * 0.36, h + 1.36, 0)[2]), null, null, null, 0xd2582e); }); }

  /* ================= Tainan: the Chihkan Tower; the beef-soup shop near the station and Mr Kang ================= */
  function tainan() { var st = W.places.tnn; if (!st) return;
    var p = pick('tChihkan'); if (p) { var S = F(p, face(p, [st.x, st.z])), y = S.gy;
      box(S, 'vc', 7.4, 0.5, 4.2, [0, y, 0], 0x9a8a78); A(S, 'vc', K.box(7.6, 0.08, 4.4), [0, y + 0.5, 0], null, null, 0x8a3a2a); pavilion(S, -1.8, -0.2, y + 0.5, 2.6, 2.4, 1.0, 0); pavilion(S, 1.8, 0.2, y + 0.5, 2.6, 2.4, 1.0, 0);
      for (var i = 0; i < 9; i++) { A(S, 'vc', K.sph(0.18, 10, 8), [-3.2 + i * 0.8, y + 0.15, 2.8], null, [1.2, 0.55, 1.5], 0x6a6460); A(S, 'vc', K.box(0.32, 0.5, 0.06), [-3.2 + i * 0.8, y + 0.45, 2.7], null, null, 0x8a8478); }
      H.collider(S, 0, 0, 3.7, 2.1); plaque(S, 3.6, 3.2, ['赤崁樓', 'CHIHKAN TOWER']); H.finish(S, 'tnnChihkan'); sight('tChihkan', p, 6, { at: S.toW(3.6, 3.8) }); }
    /* the beef-soup shop at the plaza's edge: an open front, steam, a counter of sliced raw beef, the menu: beef soup, fish-gut soup */
    var w = st.frame.toW(6.4, 11.6), S2 = F(w, st.rot + Math.PI), y2 = S2.gy; box(S2, 'vcSee', 2.4, 1.7, 1.8, [0, y2, -0.3], 0xe9e2d4); A(S2, 'vc', K.box(2.6, 0.1, 0.7), [0, y2 + 1.4, 0.75], [0.25, 0, 0], null, 0xc8302a); A(S2, 'vc', K.box(2.0, 0.65, 0.5), [0, y2 + 0.33, 0.45], null, null, 0xc9ced3); A(S2, 'vc', K.box(1.9, 0.04, 0.45), [0, y2 + 0.67, 0.45], null, null, 0xd85a4a);
    for (var k = 0; k < 3; k++) { A(S2, 'gloss', K.cyl(0.18, 0.16, 0.25, 14), [-0.6 + k * 0.6, y2 + 0.82, 0.4], null, null, 0x9aa0a6); W.steam = W.steam || []; var sw = S2.toW(-0.6 + k * 0.6, 0.4); W.steam.push([sw[0], y2 + 1.0, sw[1]]); }
    A(S2, 'lights', K.sph(0.11, 12, 10), [1.05, y2 + 1.25, 0.95], null, [1, 1.2, 1], 0xff3a22); A(S2, 'lights', K.sph(0.11, 12, 10), [-1.05, y2 + 1.25, 0.95], null, [1, 1.2, 1], 0xff3a22);
    var rect = H.signRect(['牛肉湯 · 魚腸', 'BEEF SOUP · FISH GUT'], { w: 384, h: 128, bg: '#fff6e0', ink: '#c8302a', sub: '#3a2a20' }); H.signQuad(S2, rect, 1.6, 0.53, [0, y2 + 1.95, 0.62], null, false);
    H.collider(S2, 0, -0.1, 1.25, 1.0); H.finish(S2, 'tnnBeef'); var fr = S2.toW(0, 1.5); W.interact.push({ id: 'beefsoup', kind: 'food', x: fr[0], z: fr[1], r: 1.4 }); W.stalls = W.stalls || []; W.stalls.push({ food: 'beefsoup', x: w[0], z: w[1], y: y2 });
    var kang = S2.toW(1.7, 1.5); npc('tnn', 'kang', kang, st.rot + Math.PI + 0.6); W.kangAt = kang; }

  /* ================= Kaohsiung: the 85 Sky Tower; fish-cake skewers ================= */
  function kaohsiung() { var st = W.places.khh; if (!st) return; stallAt('khh', 'fishcake', ['旗魚黑輪', 'FISH-CAKE SKEWERS']);
    var p = pick('k85'); if (!p) return; var S = F(p, face(p, [st.x, st.z])), y = S.gy, G1 = 0x34506a;
    [-1, 1].forEach(function (s) { A(S, 'glass', K.box(1.2, 6.2, 1.6), [s * 1.5, y + 3.1, 0], null, null, G1); A(S, 'vc', K.box(1.26, 0.06, 1.66), [s * 1.5, y + 6.2, 0], null, null, 0xd8dcdf); for (var i = 0; i < 6; i++) A(S, 'lights', K.box(1.22, 0.03, 1.62), [s * 1.5, y + 0.8 + i * 0.9, 0], null, null, 0xfff0c8); });
    A(S, 'glass', K.box(1.6, 3.0, 1.4), [0, y + 4.7, 0], null, null, G1); A(S, 'glass', K.cyl(0.62, 0.9, 6.4, 4), [0, y + 9.4, 0], [0, Math.PI / 4, 0], null, G1); A(S, 'vc', K.cyl(0.05, 0.62, 2.0, 4), [0, y + 13.6, 0], [0, Math.PI / 4, 0], null, 0xd8dcdf); A(S, 'lights', K.cyl(0.03, 0.03, 1.4, 6), [0, y + 15.2, 0], null, null, 0xff3a2a);
    for (var j = 0; j < 7; j++) A(S, 'lights', K.cyl(0.66 - j * 0.03, 0.66 - j * 0.03, 0.04, 4, true), [0, y + 6.8 + j * 0.85, 0], [0, Math.PI / 4, 0], null, 0xfff0c8);
    H.collider(S, 0, 0, 2.2, 0.9); plaque(S, 2.8, 1.6, ['高雄 85 大樓', '85 SKY TOWER']); H.finish(S, 'khh85'); sight('k85', p, 5, { at: S.toW(2.8, 2.2) });
    rivalYard(st); }
  /* the counterfeit works: a fenced concrete yard among containers by the harbour, where the rival who copies AUTO's products waits */
  function rivalYard(st) { var p = pick('rival'); if (!p) return; var S = F(p, face(p, [st.x, st.z])), R5 = 5.4, i;
    function gh(lx, lz) { var w = S.toW(lx, lz); return G.height(w[0], w[1]); }
    /* the floor follows the ground (so feet stay on it): a disc of concrete, an inner ring, hazard stripes */ var dg = new THREE.CircleGeometry(R5 + 0.7, 48, 0, Math.PI * 2); dg.rotateX(-Math.PI / 2); var pa = dg.attributes.position; for (i = 0; i < pa.count; i++) pa.setY(i, gh(pa.getX(i), pa.getZ(i)) + 0.05); dg.computeVertexNormals(); A(S, 'vc', dg, [0, 0, 0], null, null, 0x8c8c88);
    for (i = 0; i < 28; i++) { var a = i / 28 * Math.PI * 2, x = Math.sin(a) * (R5 + 0.35), z = Math.cos(a) * (R5 + 0.35); A(S, 'vc', K.box(0.62, 0.03, 0.2), [x, gh(x, z) + 0.07, z], [0, a + Math.PI / 2, 0], null, i % 2 ? 0xe8b020 : 0x1a1a1a); }
    for (i = 0; i < 22; i++) { var a2 = i / 22 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a2), Math.cos(a2))) < 0.42) continue; var x2 = Math.sin(a2) * (R5 + 0.9), z2 = Math.cos(a2) * (R5 + 0.9), y2 = gh(x2, z2); A(S, 'gloss', K.cyl(0.04, 0.04, 1.7, 6), [x2, y2 + 0.85, z2], null, null, 0x8a9096); var a3 = a2 + Math.PI / 22, x3 = Math.sin(a3) * (R5 + 0.9), z3 = Math.cos(a3) * (R5 + 0.9); A(S, 'glass', K.box(1.55, 1.05, 0.02), [x3, gh(x3, z3) + 0.72, z3], [0, a3 + Math.PI / 2, 0], null, 0xb8c2ca); }
    var CC = [0x8a3a2a, 0x2a5a7a, 0x6a6a2a, 0x7a4a2a, 0x3a6a4a]; for (i = 0; i < 7; i++) { var a4 = Math.PI * 0.62 + i * 0.36, x4 = Math.sin(a4) * (R5 + 2.6), z4 = Math.cos(a4) * (R5 + 2.6), y4 = gh(x4, z4); box(S, 'vc', 2.4, 1.15, 1.0, [x4, y4, z4], CC[i % 5]); if (i % 3 === 0) box(S, 'vc', 2.4, 1.15, 1.0, [x4, y4 + 1.15, z4], CC[(i + 2) % 5]); H.collider(S, x4, z4, 1.25, 0.6); }
    var yS = gh(0, -R5 - 3.4); box(S, 'vc', 7.0, 3.0, 3.4, [0, yS, -R5 - 3.4], 0x7a7e84); A(S, 'vc', K.gable(7.2, 3.6, 0.9, { ov: 0.15 }), [0, yS + 3.0, -R5 - 3.4], null, null, 0x5a5e64); H.collider(S, 0, -R5 - 3.4, 3.5, 1.7);
    sign2(S, ['仿冒工坊', 'COUNTERFEIT WORKS'], 2.6, [0, yS + 2.3, -R5 - 1.68], 0, { bg: '#1a1a1a', ink: '#e8b020', sub: '#d8d8d8' });
    var gz = R5 + 1.0, gy = gh(0, gz); [-1, 1].forEach(function (s2) { A(S, 'vc', K.box(0.18, 2.2, 0.18), [s2 * 1.5, gy + 1.1, gz], null, null, 0x3a3e44); }); for (var hz = 0; hz < 5; hz++) [-1, 1].forEach(function (s3) { A(S, 'vc', K.box(0.2, 0.18, 0.2), [s3 * 1.5, gy + 0.25 + hz * 0.4, gz], null, null, hz % 2 ? 0x1a1a1a : 0xe8b020); });
    H.finish(S, 'khhRival'); var c5 = S.toW(0, 0), g5 = S.toW(0, R5 + 2.4); if (W.noGrass) W.noGrass(c5[0], c5[1], R5 + 1.2); place('rival', c5, { kind: 'arena', rr: R5 + 5, R: R5, y: gh(0, 0) + 0.05, gate: g5, frame: S }); act('rival', 'boss', g5, 1.6); }

  /* ================= Kenting: the resort hotel over Xiaowan, Xiaowan itself, the long beach of Nanwan ================= */
  function kenting() { var kp = W.places.kenting; if (!kp) return; var c = [kp.x, kp.z], best = null, bd = 1e9, x, z;
    for (x = -14; x <= 14; x += 0.5) for (z = -4; z <= 16; z += 0.5) { var sd = G.sdf(c[0] + x, c[1] + z); if (sd > 0.2 && sd < 0.9) { var d = Math.hypot(x, z - 2); if (d < bd && !roadAt(c[0] + x, c[1] + z)) { bd = d; best = [c[0] + x, c[1] + z]; } } } if (!best) return;
    var e = 0.8, gx = G.sdf(best[0] + e, best[1]) - G.sdf(best[0] - e, best[1]), gz = G.sdf(best[0], best[1] + e) - G.sdf(best[0], best[1] - e), gl = Math.hypot(gx, gz) || 1, nx = -gx / gl, nz = -gz / gl; /* toward the sea */
    var S = F(best, Math.atan2(nx, nz)), y = Math.max(0.25, S.gy), i, r = K.seeded(77); /* Xiaowan: a little cove of sand between two rocky arms, umbrellas */
    A(S, 'vc', K.cyl(2.6, 2.6, 0.06, 28, false), [0, y - 0.02, 0.6], null, [1, 1, 0.75], 0xf2e2b8); [-1, 1].forEach(function (s2) { for (var k = 0; k < 4; k++) A(S, 'vc', K.sph(0.4 + r() * 0.2, 10, 8), [s2 * (2.4 + k * 0.15), y + 0.05, 0.2 + k * 0.6], null, [1.2, 0.6, 1], 0x8a8478); });
    [[-1.0, 0.4, 0xef7a1d], [0.2, 0.9, 0x2a8ac8], [1.3, 0.3, 0xf2c94c]].forEach(function (u) { A(S, 'vc', K.cyl(0.02, 0.02, 0.9, 6), [u[0], y + 0.45, u[1]], null, null, 0xdddddd); A(S, 'vc', K.cyl(0.02, 0.5, 0.22, 10), [u[0], y + 0.95, u[1]], null, null, u[2]); A(S, 'vc', K.box(0.5, 0.05, 0.22), [u[0] + 0.3, y + 0.15, u[1] - 0.4], null, null, 0xf6f6f2); });
    plaque(S, -2.2, -1.2, ['小灣', 'XIAOWAN BEACH']); H.finish(S, 'kenXiaowan'); W.xiaowan = { p: S.toW(0, 1.6), shore: S.toW(0, 0.2), sea: S.toW(0, 4.5), rot: S.rot }; place('xiaowan', best, { kind: 'sight', rr: 4 }); act('xiaowan', 'sight', S.toW(0, -0.6), 2.0);
    /* the resort hotel just inland, across the road from the cove: three white storeys under dark hipped roofs, a pool ringed by palms */
    var hp = site([best[0] - nx * 5.0, best[1] - nz * 5.0], 2.4, { coast: 1.2, allow: ['kenting', 'xiaowan'], maxR: 9, near: true, slope: 1.4, force: true }); if (hp) { var S2 = F(hp, Math.atan2(nx, nz)), y2 = S2.gy;
      box(S2, 'vcSee', 6.2, 1.5, 2.0, [0, y2, -0.4], 0xf6f2e8); for (var f2 = 0; f2 < 3; f2++) { A(S2, 'vc', K.box(6.3, 0.06, 2.1), [0, y2 + 0.5 * f2 + 0.02, -0.4], null, null, 0xd8cfc0); for (var w2 = 0; w2 < 10; w2++) A(S2, 'glass', K.box(0.36, 0.3, 0.04), [-2.7 + w2 * 0.6, y2 + 0.25 + f2 * 0.5, 0.61], null, null, 0x6a7f88); }
      A(S2, 'vc', K.hip(6.2, 2.0, 0.6, { ov: 0.3 }), [0, y2 + 1.5, -0.4], null, null, 0x5a4232); A(S2, 'vc', K.hip(1.6, 1.6, 0.7, { ov: 0.25 }), [0, y2 + 1.95, 0.4], null, null, 0x5a4232); box(S2, 'vc', 1.6, 0.5, 1.6, [0, y2 + 1.5, 0.4], 0xf6f2e8);
      A(S2, 'glass', K.box(3.0, 0.05, 1.3), [0, y2 + 0.03, 1.8], null, null, 0x3fb0d8); for (i = 0; i < 6; i++) H.tree(S2, 'palm', -2.2 + i * 0.9, 2.8 + (i % 2) * 0.3, 0.75); H.collider(S2, 0, -0.2, 3.2, 1.2);
      sign2(S2, ['墾丁凱撒大飯店', 'CAESAR PARK KENTING'], 1.8, [0, y2 + 1.2, 0.66], 0, { bg: '#5a4232' }); H.finish(S2, 'kenHotel'); sight('kHotel', hp, 5, { at: S2.toW(2.8, 2.6) }); }
    /* Nanwan: the long beach to the west — a strip of sand, a lifeguard tower, the bay where whales and dolphins are watched */
    var west = null; for (var t = 6; t <= 22 && !west; t += 0.5) { var cx = best[0] - nz * t * -1 * 0 - t, cz = best[1]; for (var dz2 = -4; dz2 <= 6; dz2 += 0.5) { var sd2 = G.sdf(cx, cz + dz2); if (sd2 > 0.2 && sd2 < 1.0 && !roadAt(cx, cz + dz2) && Math.hypot(cx - c[0], cz + dz2 - c[1]) > 10) { west = [cx, cz + dz2]; break; } } }
    if (west) { var S3 = F(west, Math.atan2(nx, nz)), y3 = Math.max(0.25, S3.gy); A(S3, 'vc', K.box(9.0, 0.05, 2.2), [0, y3 - 0.01, 0.6], null, null, 0xf0deb0); A(S3, 'vc', K.box(0.8, 0.06, 0.8), [2.0, y3 + 1.2, 0.2], null, null, 0xc8302a); [[1.7, -0.1], [2.3, -0.1], [1.7, 0.5], [2.3, 0.5]].forEach(function (q) { A(S3, 'vc', K.cyl(0.03, 0.03, 1.2, 6), [q[0], y3 + 0.6, q[1]], null, null, 0xf6f6f2); });
      plaque(S3, -3.8, -0.4, ['南灣', 'NANWAN · SOUTH BAY']); H.finish(S3, 'kenNanwan'); W.nanwan = { p: S3.toW(0, 1.2), sea: S3.toW(0, 6.0), rot: S3.rot }; place('nanwan', west, { kind: 'sight', rr: 5 }); act('nanwan', 'sight', S3.toW(0, -0.4), 2.0); }
    stallWorld(site([c[0] + 3.5, c[1] - 2.5], 0.9, { allow: ['kenting'], maxR: 8, force: true }), 0, 'porkknuckle', ['萬巒豬腳', 'BRAISED PORK KNUCKLE']); }

  /* ================= Hualien: the Taroko archway, the Eternal Spring Shrine and its waterfall; wontons, peeled chillies; Yuli's stinky tofu ================= */
  function hualien() {
    var p = site(LL(121.6216, 24.1557), 2.6, { coast: 1.5, bias: 4.7, maxR: 14 }); if (p) { var S = F(p, -Math.PI / 2), y = S.gy, i;
      [-1.65, -0.55, 0.55, 1.65].forEach(function (x) { A(S, 'vc', K.cyl(0.12, 0.14, 1.9, 12), [x, y + 0.95, 0], null, null, 0xc8302a); A(S, 'vc', K.cyl(0.18, 0.18, 0.2, 12), [x, y + 0.1, 0], null, null, 0x8a8478); H.ccol(S, x, 0, 0.16); });
      A(S, 'vc', K.box(3.7, 0.24, 0.3), [0, y + 1.95, 0], null, null, 0x2a6a5a); for (i = 0; i < 3; i++) { var bx = -1.1 + i * 1.1, ww = i === 1 ? 1.3 : 1.0; A(S, 'vc', K.hip(ww, 0.6, 0.32, { ov: 0.2 }), [bx, y + (i === 1 ? 2.35 : 2.1), 0], null, null, 0xf2c13a); A(S, 'vc', K.box(ww * 0.8, 0.28, 0.32), [bx, y + (i === 1 ? 2.2 : 1.96), 0], null, null, 0x1a6a5a); }
      var rect = H.signRect(['東西橫貫公路', 'TAROKO GORGE'], { w: 384, h: 128, bg: '#141414', ink: '#e8c048', sub: '#e8c048' }); H.signQuad(S, rect, 1.0, 0.33, [0, y + 1.72, 0.17], null, true);
      A(S, 'vc', K.box(0.4, 0.5, 0.4), [2.2, y + 0.25, 0.3], null, null, 0x9a968e); A(S, 'vc', K.sph(0.24, 10, 8), [2.2, y + 0.68, 0.3], null, [1, 1.1, 1.2], 0x8a8478); H.finish(S, 'hTarokoArch'); sight('hArch', p, 4, { at: S.toW(0, 1.4) }); }
    var q = site(LL(121.6046, 24.1645), 2.8, { coast: 2.0, bias: 1.0, maxR: 14 }); if (q) { var S2 = F(q, face(q, p || q)), y2 = S2.gy;
      A(S2, 'vc', K.box(5.0, 4.6, 1.6), [0, y2 + 2.3, -1.4], null, null, 0xd8d6cf); for (var j = 0; j < 9; j++) A(S2, 'vc', K.box(0.9 + (j % 3) * 0.3, 0.5, 0.3), [-2.0 + j * 0.5, y2 + 0.6 + (j * 1.7 % 3.6), -0.58], [0, 0, (j % 2 ? 0.2 : -0.15)], null, 0xc8c6be);
      box(S2, 'vc', 1.6, 0.18, 1.0, [0.8, y2 + 2.6, -0.2], 0xb8b4aa); box(S2, 'vc', 1.1, 0.75, 0.75, [0.8, y2 + 2.78, -0.25], 0xc8302a); A(S2, 'vc', K.hip(1.2, 0.85, 0.35, { ov: 0.22 }), [0.8, y2 + 3.53, -0.25], null, null, 0x2a6a5a);
      A(S2, 'glass', K.box(0.5, 2.4, 0.06), [-1.3, y2 + 1.25, -0.56], null, null, 0xdff2fa); A(S2, 'glass', K.cyl(0.55, 0.6, 0.05, 20), [-1.3, y2 + 0.03, 0.0], null, null, 0x6ab8d0); W.steam = W.steam || []; W.falls = W.falls || []; var fw = S2.toW(-1.3, -0.4); W.falls.push([fw[0], y2 + 2.4, fw[1], y2]);
      H.collider(S2, 0, -1.4, 2.5, 0.8); plaque(S2, 2.2, 0.8, ['長春祠', 'ETERNAL SPRING SHRINE']); H.finish(S2, 'hChangchun'); sight('hShrine', q, 4, { at: S2.toW(2.2, 1.4) }); }
    var hp = W.places.hua || W.places.dlc; if (hp) { var a = site([hp.x - 4, hp.z + 3], 1.0, { allow: ['dlc', 'hua'], maxR: 10, force: true }), b = site([a[0] + 2.2, a[1]], 1.0, { allow: ['dlc', 'hua'], maxR: 10, force: true }); stallWorld(a, 0, 'wonton', ['花蓮扁食', 'HUALIEN WONTONS']); stallWorld(b, 0, 'chili', ['剝皮辣椒', 'PEELED CHILLIES']); }
    var yl = LL(121.3167, 23.3349), ys = site(yl, 1.0, { maxR: 8, force: true }); stallWorld(ys, 0, 'stinkytofu', ['玉里臭豆腐', 'YULI STINKY TOFU']); place('yuli', ys, { kind: 'sight', rr: 4 }); }

  /* ================= Taitung: Zhiben's hot springs, the sugar-apple orchards, the Chishang lunchbox ================= */
  function taitung() {
    var p = site(LL(121.0131, 22.6931), 3.2, { bias: 4.4, maxR: 16 }); if (p) { var S = F(p, 0), y = S.gy, i;
      box(S, 'vcSee', 3.6, 1.3, 1.6, [0, y, -1.6], 0xe8dcc8); A(S, 'vc', K.hip(3.6, 1.6, 0.55, { ov: 0.25 }), [0, y + 1.3, -1.6], null, null, 0x6a4a3a); for (i = 0; i < 6; i++) A(S, 'glass', K.box(0.36, 0.3, 0.04), [-1.4 + i * 0.56, y + 0.8, -0.79], null, null, 0x6a7f88);
      [[-1.0, 0.9, 0.9], [1.1, 1.1, 0.75]].forEach(function (pl) { A(S, 'vc', K.cyl(pl[2] + 0.12, pl[2] + 0.12, 0.2, 20), [pl[0], y + 0.1, pl[1]], null, null, 0x8a8478); A(S, 'glass', K.cyl(pl[2], pl[2], 0.05, 20), [pl[0], y + 0.18, pl[1]], null, null, 0x7fc8c0); var sw = S.toW(pl[0], pl[1]); W.steam = W.steam || []; W.steam.push([sw[0], y + 0.25, sw[1], 2]); });
      for (i = 0; i < 6; i++) A(S, 'vc', K.sph(0.3, 10, 8), [-2.0 + i * 0.8, y + 0.1, 2.2], null, [1.2, 0.6, 1], 0x7a7470);
      H.collider(S, 0, -1.6, 1.8, 0.8); plaque(S, 2.4, 0.6, ['知本溫泉', 'ZHIBEN HOT SPRINGS']); H.finish(S, 'tZhiben'); sight('tZhiben', p, 5, { at: S.toW(2.4, 1.2) }); }
    var o = site(LL(121.0580, 22.7711), 4.0, { bias: 1.0, maxR: 16 }); if (o) { var S2 = F(o, 0.3), y2 = S2.gy, r = K.seeded(9), j, k;
      for (j = 0; j < 5; j++) for (k = 0; k < 6; k++) { var tx = -3 + k * 1.2 + (j % 2) * 0.3, tz = -2.4 + j * 1.2; A(S2, 'vc', K.cyl(0.05, 0.07, 0.6, 6), [tx, y2 + 0.3, tz], null, null, 0x6a5040); A(S2, 'leaf', K.sph(0.42, 10, 8), [tx, y2 + 0.8, tz], null, [1.1, 0.8, 1.1], 0x5f9a48, { sway: 0.3 }); for (var f = 0; f < 3; f++) { var a = r() * 6.28; A(S2, 'vc', K.sph(0.08, 8, 6), [tx + Math.cos(a) * 0.36, y2 + 0.62 + r() * 0.2, tz + Math.sin(a) * 0.36], null, null, 0x9cc46a); } H.ccol(S2, tx, tz, 0.12); }
      stallInFrame(S2, 3.6, 2.4, 0, 'sugarapple', ['釋迦', 'SUGAR APPLES']); plaque(S2, -3.8, 3.2, ['卑南釋迦園', 'SUGAR-APPLE ORCHARD']); H.finish(S2, 'tOrchard'); sight('tOrchard', o, 5, { at: S2.toW(-3.8, 3.8) }); }
    var ch = W.places.chishang || (G.PL.chishang ? { x: G.PL.chishang[0], z: G.PL.chishang[1] } : null); if (ch) stallWorld(site([ch.x + 3, ch.z + 2], 1.0, { allow: ['chishang', 'taitung'], maxR: 10, force: true }), 0, 'chishangbento', ['池上便當', 'CHISHANG LUNCHBOX']); }
  function stallInFrame(S, lx, lz, ry, food, name) { H.stall(S, lx, lz, ry, food, name); }

  /* ================= Penghu: cactus ice at Magong ================= */
  function penghu() { var m = W.places.magong; if (!m || !m.frame) return; var w = m.frame.toW(2.6, 2.4); stallWorld(site(w, 0.9, { allow: ['magong'], maxR: 8, coast: 0.8, force: true }), m.frame.rot, 'cactusice', ['仙人掌冰', 'CACTUS ICE']); }

  /* ================= Sun Moon Lake: built by SCENIC (tw_scenic.js) on the lake's real shore ================= */

  /* night fireworks: shells rise and burst in coloured stars (the Sun Moon Lake fireworks festival; the 2026 nights are 12 Sep, 17 Oct and 14 Nov) */
  function fireworks(c) { var N = 320, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var pm = new THREE.PointsMaterial({ size: 0.55, map: K.glowTex(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), pts = new THREE.Points(pg, pm); pts.frustumCulled = false; W.scene.add(pts);
    var parts = [], tt = 0, nextB = 0, PAL = [[2.6, 1.0, 0.3], [0.4, 1.4, 2.6], [2.4, 0.4, 1.6], [2.4, 2.1, 0.6], [0.6, 2.4, 1.0], [2.4, 2.4, 2.4]];
    W.anim.push(function (dt) { pts.visible = W.night > 0.6; if (!pts.visible) return; tt += dt; if (tt > nextB) { nextB = tt + 0.8 + Math.random() * 1.4; var cx = c[0] + (Math.random() - 0.5) * 6, cz = c[2] + (Math.random() - 0.5) * 6, cy = c[1] + Math.random() * 4, p0 = PAL[Math.floor(Math.random() * PAL.length)], ring = Math.random() < 0.4; for (var i = 0; i < 56; i++) { var a = Math.random() * 6.283, e = ring ? Math.PI / 2 + (Math.random() - 0.5) * 0.2 : Math.acos(2 * Math.random() - 1), sp = 2.4 + Math.random() * 0.8; parts.push({ x: cx, y: cy, z: cz, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp, vz: Math.sin(e) * Math.sin(a) * sp, t: 0, c: p0 }); } if (parts.length > N) parts.splice(0, parts.length - N); }
      for (var j = 0; j < N; j++) { var p = parts[j]; if (!p) { pos[j * 3 + 1] = -99; continue; } p.t += dt; p.vy -= 1.5 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vx *= 0.985; p.vz *= 0.985; var k = Math.max(0, 1 - p.t / 1.9); pos[j * 3] = p.x; pos[j * 3 + 1] = p.y; pos[j * 3 + 2] = p.z; col[j * 3] = p.c[0] * k; col[j * 3 + 1] = p.c[1] * k; col[j * 3 + 2] = p.c[2] * k; } parts = parts.filter(function (p) { return p.t < 1.9; }); pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true; }); }

  /* ================= Alishan: Mikado pheasants and Swinhoe's pheasants in the forest; the lunchbox of Fenqihu ================= */
  function pheasant(kind) { var g = new THREE.Group(), body = new THREE.Group(); g.add(body); var mk = function (geo, c, p, r, s) { var m = new THREE.Mesh(geo, KIT.curved(K.std({ color: c, rough: 0.45, metal: kind === 'mikado' ? 0.25 : 0.2 }))); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); if (s) m.scale.set(s[0], s[1], s[2]); m.castShadow = true; return m; };
    var dark = kind === 'mikado' ? 0x1c2440 : 0x1e2a5a; body.add(mk(K.sph(0.16, 14, 10), dark, [0, 0.3, 0], null, [1, 0.85, 1.45]));
    var neck = new THREE.Group(); neck.position.set(0, 0.36, 0.18); body.add(neck); neck.add(mk(K.cyl(0.05, 0.07, 0.18, 8), dark, [0, 0.07, 0.02], [0.4, 0, 0])); var head = new THREE.Group(); head.position.set(0, 0.17, 0.07); neck.add(head); head.add(mk(K.sph(0.06, 10, 8), dark)); head.add(mk(K.cyl(0.0, 0.02, 0.06, 6), 0xd8d0b0, [0, -0.005, 0.07], [Math.PI / 2, 0, 0])); [-1, 1].forEach(function (s) { head.add(mk(K.sph(0.028, 8, 6), 0xd2302a, [s * 0.04, 0.0, 0.025], null, [0.5, 1.2, 1])); });
    if (kind === 'swinhoe') { head.add(mk(K.sph(0.035, 8, 6), 0xf6f6f2, [0, 0.06, -0.01], null, [0.8, 1.2, 1.6])); body.add(mk(K.sph(0.1, 10, 8), 0xf2f2f0, [0, 0.4, -0.08], null, [1.1, 0.4, 0.9])); }
    if (kind === 'mikado') [-1, 1].forEach(function (s) { for (var b = 0; b < 2; b++) body.add(mk(K.box(0.02, 0.025, 0.14), 0xf2f2f0, [s * 0.15, 0.33 - b * 0.05, -0.02], [0, 0, s * 0.3])); });
    var tail = new THREE.Group(); tail.position.set(0, 0.34, -0.2); body.add(tail); var TL = kind === 'mikado' ? 0.75 : 0.55; tail.add(mk(K.box(0.07, 0.02, TL), dark, [0, 0, -TL / 2], [0.15, 0, 0])); if (kind === 'mikado') for (var tb = 0; tb < 5; tb++) tail.add(mk(K.box(0.075, 0.022, 0.025), 0xf2f2f0, [0, 0.003, -0.12 - tb * 0.13], [0.15, 0, 0])); else tail.add(mk(K.box(0.04, 0.025, TL * 0.9), 0xf2f2f0, [0, 0.01, -TL / 2], [0.15, 0, 0]));
    var legs = []; [-1, 1].forEach(function (s) { var l = mk(K.cyl(0.012, 0.012, 0.2, 6), kind === 'swinhoe' ? 0xd2302a : 0x8a8a7a, [s * 0.05, 0.1, 0.02]); g.add(l); legs.push(l); });
    g.userData = { body: body, neck: neck, head: head, tail: tail, legs: legs }; return g; }
  function alishan() { var a = W.places.alishan; if (!a) return; var r = K.seeded(23), birds = [], i;
    for (i = 0; i < 6; i++) { var kind = i % 2 ? 'mikado' : 'swinhoe', home = site([a.x - 3 + r() * 6, a.z - 6 + r() * 4], 0.4, { allow: ['alishan', 'ali'], maxR: 8, force: true }), b = pheasant(kind); b.scale.setScalar(1.6); W.scene.add(b); birds.push({ g: b, home: home, x: home[0], z: home[1], tx: home[0], tz: home[1], st: 'peck', t: r() * 3, yaw: r() * 6.28, ph: r() * 6 }); }
    W.pheasants = birds; W.anim.push(function (dt) { birds.forEach(function (b) { var u = b.g.userData; b.t -= dt; b.ph += dt * 9;
      if (b.t <= 0) { if (b.st === 'walk' || Math.random() < 0.4) { b.st = 'peck'; b.t = 1.5 + Math.random() * 3; } else { b.st = 'walk'; b.t = 2 + Math.random() * 3; var an = Math.random() * 6.28, rr = Math.random() * 2.6; b.tx = b.home[0] + Math.cos(an) * rr; b.tz = b.home[1] + Math.sin(an) * rr; } }
      if (b.st === 'walk') { var dx = b.tx - b.x, dz = b.tz - b.z, d = Math.hypot(dx, dz); if (d > 0.08) { b.yaw = Math.atan2(dx, dz); b.x += dx / d * dt * 0.7; b.z += dz / d * dt * 0.7; } else b.t = 0; }
      b.g.position.set(b.x, G.height(b.x, b.z), b.z); b.g.rotation.y = b.yaw; var walk = b.st === 'walk' ? 1 : 0; u.legs[0].rotation.x = Math.sin(b.ph) * 0.5 * walk; u.legs[1].rotation.x = -Math.sin(b.ph) * 0.5 * walk; u.neck.rotation.x = b.st === 'peck' ? 0.9 + Math.max(0, Math.sin(b.ph * 0.5)) * 0.5 : Math.sin(b.ph) * 0.15; u.tail.rotation.x = 0.1 + Math.sin(b.ph * 0.3) * 0.05; b.g.visible = Math.hypot(b.x - (W.camX || b.x), b.z - (W.camZ || b.z)) < 60; }); });
    stallWorld(site([a.x + 3.5, a.z + 3.0], 0.9, { allow: ['alishan'], maxR: 8, force: true }), 0, 'fenqihu', ['奮起湖便當', 'FENQIHU LUNCHBOX']); }

  /* ================= the highways' markers: route shields where each cross-island road leaves the coast and at its summit ================= */
  function highwayMarks() { var NM = { t7: ['台7 北部橫貫公路', 'PROV. HWY 7 · NORTHERN CROSS-ISLAND'], t8: ['台8 中部橫貫公路', 'PROV. HWY 8 · CENTRAL CROSS-ISLAND'], t20: ['台20 南部橫貫公路', 'PROV. HWY 20 · SOUTHERN CROSS-ISLAND'], t21: ['台21 新中橫公路', 'PROV. HWY 21 · NEW CENTRAL CROSS-ISLAND'], t14a: ['台14甲 合歡山公路', 'PROV. HWY 14A · HEHUANSHAN'] };
    Object.keys(W.highways || {}).forEach(function (k) { var ln = W.highways[k]; [0, ln.length - 1].forEach(function (ix, e) { var q = ln[ix], nb = ln[e ? ix - 3 : ix + 3] || q, dx = nb[0] - q[0], dz = nb[1] - q[1], dl = Math.hypot(dx, dz) || 1, p = [q[0] - dz / dl * 1.6, q[1] + dx / dl * 1.6]; var S = F(p, Math.atan2(dx, dz)), y = S.gy;
      A(S, 'vc', K.cyl(0.04, 0.04, 1.6, 6), [0, y + 0.8, 0], null, null, 0x9aa0a6); var rect = H.signRect(NM[k.split('_')[0]] || [k, ''], { w: 384, h: 128, bg: '#1d5a9e', ink: '#ffffff', sub: '#ffffff' }); H.signQuad(S, rect, 1.3, 0.43, [0, y + 1.5, 0.05], null, true); H.ccol(S, 0, 0, 0.08); H.finish(S, 'hw_' + k + e); }); }); }

  /* ================= steam over the pots and the springs, the waterfall's spray ================= */
  function steam() { var list = W.steam || []; if (!list.length) return; var N = list.length * 6, tex = K.glowTex(), mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false }), g = new THREE.Group(), puffs = [], i;
    list.forEach(function (s, k) { for (var j = 0; j < 6; j++) { var sp = new THREE.Sprite(mat.clone()); g.add(sp); puffs.push({ s: sp, src: s, t: j / 6, big: s[3] || 1 }); } }); W.scene.add(g);
    W.anim.push(function (dt) { var cx = W.camX, cz = W.camZ; puffs.forEach(function (p) { var near = cx == null || (Math.abs(p.src[0] - cx) < 40 && Math.abs(p.src[2] - cz) < 40); p.s.visible = near; if (!near) return; p.t = (p.t + dt * 0.35) % 1; var u = p.t; p.s.position.set(p.src[0] + Math.sin(u * 7 + p.src[0]) * 0.08 * p.big, p.src[1] + u * 0.9 * p.big, p.src[2]); p.s.scale.setScalar((0.18 + u * 0.5) * p.big); p.s.material.opacity = Math.sin(u * Math.PI) * 0.42; }); });
    (W.falls || []).forEach(function (f) { var fm = new THREE.Mesh(new THREE.PlaneGeometry(0.42, f[1] - f[3]), KIT.curved(K.basic({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false }))); fm.position.set(f[0], (f[1] + f[3]) / 2, f[2]); W.scene.add(fm); W.anim.push(function (dt, t) { fm.material.opacity = 0.55 + Math.sin(t * 9) * 0.1; }); }); }

  function build(world, ctx, helpers) { W = world; G = ctx.G; K = ctx.K; Q = ctx.Q; H = helpers; A = H.A; box = H.box; M = H.M;
    [taipei, airport, hsinchu, taichung, tainan, kaohsiung, kenting, hualien, taitung, penghu, alishan, highwayMarks].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.error('more ' + (f.name || '?'), e); } });
    if (typeof SCENIC !== 'undefined') try { SCENIC.build(W, ctx, H, { site: site, sight: sight, place: place, act: act, plaque: plaque, sign2: sign2, stallWorld: stallWorld, fireworks: fireworks, roadAt: roadAt, sights: function () { return SIGHTS; } }); } catch (e) { if (window.console) console.error('scenic', e); }
    try { steam(); } catch (e) { if (window.console) console.error('more steam', e); }
    SIGHTS.forEach(function (k) { var p = W.places[k]; if (p && W.grassNo) W.grassNo.push([p.x, p.z, Math.min(5, p.rr || 4)]); }); }
  return { build: build, reserve: reserve, sights: function () { return SIGHTS; } };
})();


