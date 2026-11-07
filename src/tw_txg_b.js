/* ===== [tw_txg_b.js] ===== */
  /* ===== TXG3D part 2: the build — the ground, the streets and their markings ===== */
  function build(scene, o) { init(); mats(); o = o || {}; var X = o.x || 0, Z = o.z || 0, Y = o.y || 0, hi = o.tier !== 'low', root = new THREE.Group(); root.position.set(X, Y, Z); scene.add(root);
    var T = { low: !hi, root: root, X: X, Z: Z, Y: Y, f: 1, trains: [], cars: [], peds: [], colliders: [], glows: [], raised: [], walk: [], ramps: [], cam: [], mass: [], air: [], sig: { t: 0, ph: 'A' }, heads: [], ped: [], spots: {}, crows: [], z0: MAPZ[0], z1: MAPZ[1], x0: MAPX[0], x1: MAPX[1], id: 'taichung', esc: [], boards: [], rd: { road: [], walk: [], bld: [], stn: [], pol: [] }, elev: true };
    T.toW = function (lx, ly, lz) { return new V3(X + lx, Y + (ly || 0), Z + lz); }; T.toL = function (wx, wz) { return [wx - X, wz - Z]; };
    /* the groups: the district and the station's shell; the station's insides (lobby, concourse, platforms); the three lines' trains (each line's
       group turned so that its trains, built to run along x, run north–south); the bar's inside */
    var G = { ext: new THREE.Group(), hall: new THREE.Group(), b1: new THREE.Group(), b2: new THREE.Group(), tra: new THREE.Group(), mrt: new THREE.Group(), bar: new THREE.Group() }; Object.keys(G).forEach(function (k) { root.add(G[k]); }); T.G = G;
    G.b2.rotation.y = Math.PI / 2; G.tra.rotation.y = Math.PI / 2; G.tra.position.z = TOZ; G.mrt.rotation.y = Math.PI / 2; G.mrt.position.z = MOZ;
    function col(x0, x1, z0, z1, y0, y1) { T.colliders.push([X + (x0 + x1) / 2, Z + (z0 + z1) / 2, Math.abs(x1 - x0) / 2, Math.abs(z1 - z0) / 2, y0 == null ? -1 : y0, y1 == null ? 3 : y1]); }
    function cb(x0, x1, y0, y1, z0, z1) { T.cam.push([Math.min(x0, x1), Math.max(x0, x1), y0, y1, Math.min(z0, z1), Math.max(z0, z1)]); return T.cam[T.cam.length - 1]; }
    function mass(x0, x1, y0, y1, z0, z1) { T.mass.push([x0, x1, y0, y1, z0, z1]); return T.mass[T.mass.length - 1]; } function air(x0, x1, y0, y1, z0, z1) { T.air.push([x0, x1, y0, y1, z0, z1]); }
    function walk(x0, x1, z0, z1, y0, y1) { T.walk.push([x0, x1, z0, z1, y0, y1]); } function floor(x0, x1, z0, z1, h) { T.raised.push([x0, x1, z0, z1, h]); } function ramp(x0, x1, z0, z1, h0, h1, ax) { T.ramps.push(ax === 'x' ? [x0, x1, z0, z1, h0, h1, 'x'] : [x0, x1, z0, z1, h0, h1]); }
    function gw(x, y, z, r, k) { T.glows.push([X + x, Y + y, Z + z, r, k || 1]); }
    /* the batches: one draw per material and group */
    function batches(extra) { var b = { paint: K.Batch(), dark: K.Batch(), metal: K.Batch(), glass: K.Batch(), glow: K.Batch(), mat: K.Batch(), line: K.Batch(), yel: K.Batch(), red: K.Batch(), sign: K.Batch({ uv: true }), xs: K.Batch({ uv: true }), atlT: K.Batch({ uv: true }), skyl: K.Batch(), gran: K.Batch({ uv: true }), gran2: K.Batch({ uv: true }), gran3: K.Batch({ uv: true }), pav: K.Batch({ uv: true }), plz: K.Batch({ uv: true }), asph: K.Batch({ uv: true }), conc: K.Batch({ uv: true }), curtain: K.Batch({ uv: true }), tile2: K.Batch({ uv: true }), tact: K.Batch({ uv: true }), ball: K.Batch({ uv: true }), plat: K.Batch({ uv: true }), girder: K.Batch({ uv: true }), barf: K.Batch({ uv: true }), neon: K.Batch({ uv: true }), curtN: K.Batch({ uv: true }), fac: [] }; for (var i = 0; i < 8; i++) b.fac.push(K.Batch({ uv: true })); return b; }
    var B = batches(), HB = batches(), BB = batches(); B.leaf = K.Batch(); B.trunk = K.Batch();
    var r0 = rnd(7701), MK = 0.012;

    /* ================= the ground ================= */
    flat(B.asph, MAPX[0] - 60, MAPX[1] + 60, MAPZ[0] - 60, MAPZ[1] + 60, 0, 9, 9); flat(B.asph, -1600, 1600, -1600, 1600, -0.06, 30, 30);
    function pave(x0, x1, z0, z1, mat, kerb) { if (x1 - x0 < 0.05 || z1 - z0 < 0.05) return; flat(mat === 'plz' ? B.plz : B.pav, x0, x1, z0, z1, Y1, mat === 'plz' ? 4.8 : 2.6); floor(x0, x1, z0, z1, Y1); T.rd.walk.push([x0, x1, z0, z1]);
      (kerb || '').split('').forEach(function (s) { if (s === 'N') bx(B.paint, x0, x1, 0, Y1 + 0.005, z0, z0 + 0.25, 0xa8a6a0); if (s === 'S') bx(B.paint, x0, x1, 0, Y1 + 0.005, z1 - 0.25, z1, 0xa8a6a0); if (s === 'W') bx(B.paint, x0, x0 + 0.25, 0, Y1 + 0.005, z0, z1, 0xa8a6a0); if (s === 'E') bx(B.paint, x1 - 0.25, x1, 0, Y1 + 0.005, z0, z1, 0xa8a6a0); }); }
    /* the east plaza (the station's forecourt, the bus and taxi bays, the parking): stone; the pavement along 站區二路 */ pave(SX, R2[0] - 6, MAPZ[0], MAPZ[1], 'plz'); pave(R2[0] - 6, R2[0], MAPZ[0], MAPZ[1], 'pav', 'E');
    /* east of 站區二路: the blocks between the roads, paved to their edges (the buildings stand on them) */ var EB = [[MAPZ[0], RN[0]], [RN[1], RM[0]], [RM[1], RS[0]], [RS[1], MAPZ[1]]];
    EB.forEach(function (q, k) { pave(R2[1], RE[0], q[0], q[1], 'pav', 'W' + (k > 0 ? 'N' : '') + (k < 3 ? 'S' : '') + 'E'); pave(RE[1], MAPX[1], q[0], q[1], 'pav', 'W' + (k > 0 ? 'N' : '') + (k < 3 ? 'S' : '')); });
    /* west: the shophouses of Wuri beyond 高鐵一路; between it and the railway's fence the plaza and lots of Xinwuri; the lane between the railway and the high-speed station */
    pave(MAPX[0], RW[0], MAPZ[0], MAPZ[1], 'pav', 'E'); pave(RW[1], -65, MAPZ[0], MAPZ[1], 'pav', 'W'); pave(-33, -SX, MAPZ[0], MAPZ[1], 'plz');
    /* under the viaduct north and south of the station */ pave(-SX, SX, MAPZ[0], -140, 'plz'); pave(-SX, SX, 140, MAPZ[1], 'plz');
    /* the railway's bed: ballast between the fences */ flat(B.ball, -65, -33, MAPZ[0], MAPZ[1], 0.32, 3, 3); bx(B.paint, -65, -33, 0, 0.3, MAPZ[0], MAPZ[1], 0x6a665e);
    walk(MAPX[0], MAPX[1], MAPZ[0], MAPZ[1], -1, 3);
    T.rd.road.push([R2[0], R2[1], MAPZ[0], MAPZ[1]], [RE[0], RE[1], MAPZ[0], MAPZ[1]], [RW[0], RW[1], MAPZ[0], MAPZ[1]], [R2[1], MAPX[1], RN[0], RN[1]], [R2[1], MAPX[1], RM[0], RM[1]], [R2[1], MAPX[1], RS[0], RS[1]]);

    /* ================= road markings: lanes, the double yellow, crossings, waiting boxes for scooters, stop lines ================= */
    function lineX(x0, x1, z, w, B2, dash) { if (!dash) { bx(B2 || B.line, x0, x1, 0, MK, z - w / 2, z + w / 2, 0xffffff); return; } for (var x = x0; x < x1; x += dash * 2) bx(B2 || B.line, x, Math.min(x1, x + dash), 0, MK, z - w / 2, z + w / 2, 0xffffff); }
    function lineZ(z0, z1, x, w, B2, dash) { if (!dash) { bx(B2 || B.line, x - w / 2, x + w / 2, 0, MK, z0, z1, 0xffffff); return; } for (var z = z0; z < z1; z += dash * 2) bx(B2 || B.line, x - w / 2, x + w / 2, 0, MK, z, Math.min(z1, z + dash), 0xffffff); }
    function spans(lo, hi2, cuts) { var out = [], a = lo; cuts.slice().sort(function (p, q) { return p[0] - q[0]; }).forEach(function (c) { if (c[0] > a) out.push([a, c[0]]); a = Math.max(a, c[1]); }); if (a < hi2) out.push([a, hi2]); return out; }
    var CWW = 4.2, GAP = CWW + 8;
    function nsRoad(R, ln) { var cx = (R[0] + R[1]) / 2, cuts = []; Object.keys(INT).forEach(function (id) { var I = INT[id]; if (I.x === R) cuts.push([I.z[0] - GAP, I.z[1] + GAP]); });
      spans(MAPZ[0], MAPZ[1], cuts).forEach(function (s) { lineZ(s[0], s[1], cx - 0.18, 0.13, B.yel); lineZ(s[0], s[1], cx + 0.18, 0.13, B.yel); ln.forEach(function (x) { lineZ(s[0], s[1], x, 0.13, null, 1.6); }); lineZ(s[0], s[1], R[0] + 0.45, 0.12); lineZ(s[0], s[1], R[1] - 0.45, 0.12); }); }
    function ewRoad(R, ln) { var cz = (R[0] + R[1]) / 2, cuts = [[R2[0] - 1, R2[1] + GAP]]; Object.keys(INT).forEach(function (id) { var I = INT[id]; if (I.z === R && I.x === RE) cuts.push([RE[0] - GAP, RE[1] + GAP]); });
      spans(R2[1], MAPX[1], cuts).forEach(function (s) { lineX(s[0], s[1], cz - 0.18, 0.13, B.yel); lineX(s[0], s[1], cz + 0.18, 0.13, B.yel); ln.forEach(function (z) { lineX(s[0], s[1], z, 0.13, null, 1.6); }); lineX(s[0], s[1], R[0] + 0.45, 0.12); lineX(s[0], s[1], R[1] - 0.45, 0.12); }); }
    nsRoad(R2, [100.0, 108.0]); nsRoad(RE, [199.8, 206.2]); nsRoad(RW, [-94.2, -87.8]); ewRoad(RN, [-146.2, -139.8]); ewRoad(RM, [-2.2, 4.2]); ewRoad(RS, [139.8, 146.2]);
    /* RW has no crossing in the district: its lines run the whole way */
    function zebraX(x0, x1, zc, w) { for (var x = x0 + 0.3; x < x1 - 0.3; x += 1.0) bx(B.line, x, x + 0.5, 0, MK, zc - w / 2, zc + w / 2, 0xffffff); }
    function zebraZ(z0, z1, xc, w) { for (var z = z0 + 0.3; z < z1 - 0.3; z += 1.0) bx(B.line, xc - w / 2, xc + w / 2, 0, MK, z, z + 0.5, 0xffffff); }
    function wbox(x0, x1, z0, z1) { bx(B.line, x0, x1, 0, MK, z0, z0 + 0.14, 0xffffff); bx(B.line, x0, x1, 0, MK, z1 - 0.14, z1, 0xffffff); bx(B.line, x0, x0 + 0.14, 0, MK, z0, z1, 0xffffff); bx(B.line, x1 - 0.14, x1, 0, MK, z0, z1, 0xffffff);
      var cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, lx = Math.abs(x1 - x0) > Math.abs(z1 - z0); bx(B.line, cx - (lx ? 0.9 : 0.3), cx + (lx ? 0.9 : 0.3), 0, MK, cz - (lx ? 0.3 : 0.9), cz + (lx ? 0.3 : 0.9), 0xffffff); }
    T.cross = [];
    Object.keys(INT).forEach(function (id) { var I = INT[id], xa = I.x[0], xb = I.x[1], za = I.z[0], zb = I.z[1];
      if (I.legs.indexOf('W') >= 0) { zebraZ(za, zb, xa - CWW / 2 - 0.3, CWW); T.cross.push([xa - CWW - 0.3, xa - 0.3, za, zb, 'ew', id]); wbox(xa - CWW - 4.2, xa - CWW - 0.6, (za + zb) / 2 + 0.5, zb - 0.5); bx(B.line, xa - CWW - 4.8, xa - CWW - 4.4, 0, MK, (za + zb) / 2 + 0.2, zb - 0.2, 0xffffff); }
      if (I.legs.indexOf('E') >= 0) { zebraZ(za, zb, xb + CWW / 2 + 0.3, CWW); T.cross.push([xb + 0.3, xb + CWW + 0.3, za, zb, 'ew', id]); wbox(xb + CWW + 0.6, xb + CWW + 4.2, za + 0.5, (za + zb) / 2 - 0.5); bx(B.line, xb + CWW + 4.4, xb + CWW + 4.8, 0, MK, za + 0.2, (za + zb) / 2 - 0.2, 0xffffff); }
      if (I.legs.indexOf('N') >= 0) { zebraX(xa, xb, za - CWW / 2 - 0.3, CWW); T.cross.push([xa, xb, za - CWW - 0.3, za - 0.3, 'ns', id]); wbox(xa + 0.5, (xa + xb) / 2 - 0.5, za - CWW - 4.2, za - CWW - 0.6); bx(B.line, xa + 0.2, (xa + xb) / 2 - 0.2, 0, MK, za - CWW - 4.8, za - CWW - 4.4, 0xffffff); }
      if (I.legs.indexOf('S') >= 0) { zebraX(xa, xb, zb + CWW / 2 + 0.3, CWW); T.cross.push([xa, xb, zb + 0.3, zb + CWW + 0.3, 'ns', id]); wbox((xa + xb) / 2 + 0.5, xb - 0.5, zb + CWW + 0.6, zb + CWW + 4.2); bx(B.line, (xa + xb) / 2 + 0.2, xb - 0.2, 0, MK, zb + CWW + 4.4, zb + CWW + 4.8, 0xffffff); } });
    /* the plaza's drives: the bus lanes either side of the bus platform, the taxis' lane, the parking — asphalt laid into the stone */
    flat(B.asph, 36, 44, -24, 64, Y1 + 0.004, 9, 9); flat(B.asph, 50, 58, -24, 64, Y1 + 0.004, 9, 9); flat(B.asph, 60, 66, -6, 62, Y1 + 0.004, 9, 9); flat(B.asph, 36, 90, 76, 182, Y1 + 0.004, 9, 9); flat(B.asph, 22, 33, 130, 182, Y1 + 0.004, 9, 9);
    [[36, 44, -24, 64], [50, 58, -24, 64], [60, 66, -6, 62]].forEach(function (q) { lineZ(q[2], q[3], q[0] + 0.3, 0.14, B.yel); lineZ(q[2], q[3], q[1] - 0.3, 0.14, B.yel); });
    for (var pk = 40; pk < 88; pk += 2.6) [[80, 86], [96, 102], [112, 118], [128, 134], [146, 152], [162, 168]].forEach(function (q) { bx(B.line, pk, pk + 0.1, Y1 + 0.004, Y1 + 0.004 + MK, q[0], q[1], 0xffffff); });


