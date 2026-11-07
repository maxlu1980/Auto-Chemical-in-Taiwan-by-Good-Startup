/* ===== [tw_props.js] ===== */
/* ===== PROPS — what moves on AUTO 台灣島 =====
   An original high-speed train (white, the orange band of the brand, a long nose), an original step-through moped and an original
   two-seat open roadster for Luna, the ferry to Penghu, the hot-air balloons of Taitung, the little red train of Alishan, the turning
   wind turbines of Hsinchu, the fireworks over Magong; the three secret bosses (the Leak Dragon of Sun Moon Lake, the Crack Golem of
   Alishan, the Blazing Salt Demon of Kenting: the defects of a building, made monsters), and the gear they leave behind. All original
   designs, merged per object into a few draw calls. */
var PROPS = (function () {
  var K = null, M = null, V3 = THREE.Vector3;
  function lin(h) { return K.lin(h); }
  function B() { return K.Batch(); }
  function mesh(b, mat, o) { var m = b.mesh(mat, o); return m; }
  function grp(list) { var g = new THREE.Group(); list.forEach(function (m) { if (m) g.add(m); }); return g; }
  function wheel(b, x, y, z, r, w) { var t = new THREE.CylinderGeometry(r, r, w, 18); t.rotateZ(Math.PI / 2); b.add(t, { p: [x, y, z] }, 0x26272a); var h = new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.01, 14); h.rotateZ(Math.PI / 2); b.add(h, { p: [x, y, z] }, 0xc9ccd0); }

  /* ---------- the high-speed train ---------- */
  function trainCar(nose, flip) { var b = B(), g = B(), L = 2.5, w = 0.62, h = 0.6, i;
    if (!nose) { b.add(K.rbox(L, h, w, 0.16, 3), { p: [0, h / 2 + 0.08, 0] }, 0xf6f6f4); }
    else { var body = K.surf(24, 12, function (u, v, p) { var x = -L / 2 + u * L, t = Math.max(0, (x + L / 2 - 1.15) / 1.35), nz = 1 - Math.pow(t, 1.7) * 0.92, hh = h * (1 - Math.pow(t, 1.4) * 0.72), a = v * Math.PI * 2, cy = Math.cos(a), sz = Math.sin(a); p.set(x, 0.08 + hh / 2 + cy * hh / 2 * (cy < 0 ? 0.9 : 1) - (1 - nz) * 0.08, sz * w / 2 * (0.6 + 0.4 * nz)); });
      b.add(body, { r: [0, flip ? Math.PI : 0, 0] }, 0xf6f6f4); }
    var len = nose ? L * 0.62 : L * 0.92; g.add(K.box(len, 0.13, w + 0.012), { p: [nose ? (flip ? 0.42 : -0.42) : 0, 0.5, 0] }, 0x2b3440);
    b.add(K.box(nose ? L * 0.8 : L * 0.96, 0.06, w + 0.014), { p: [nose ? (flip ? 0.2 : -0.2) : 0, 0.33, 0] }, 0xef7a1d); b.add(K.box(nose ? L * 0.8 : L * 0.96, 0.02, w + 0.016), { p: [nose ? (flip ? 0.2 : -0.2) : 0, 0.29, 0] }, 0x22313f);
    for (i = 0; i < 2; i++) b.add(K.box(0.5, 0.12, w * 0.8), { p: [(i ? 0.7 : -0.7), 0.04, 0] }, 0x3a3c40);
    if (nose) g.add(K.sph(0.07, 10, 8), { p: [flip ? -1.18 : 1.18, 0.2, 0.14], s: [1, 0.6, 1] }, 0xfff6d0);
    return grp([mesh(b, M.gloss), mesh(g, M.glass)]); }
  function train(nCars) { var cars = [], i, g = new THREE.Group(); for (i = 0; i < nCars; i++) { var c = trainCar(i === 0 || i === nCars - 1, i === nCars - 1); g.add(c); cars.push(c); } return { group: g, cars: cars, gap: 2.56 }; }
  /* each train keeps to its own track: the left one in its direction of travel, as Taiwan's high-speed line runs; after reversing at a terminus it crosses over gently */
  var TRACK = 0.42;
  function placeTrain(T, railAt, s, dir) { var P = {}, want = dir * TRACK; if (T.lat == null) T.lat = want; T.lat += (want - T.lat) * 0.04; if (Math.abs(want - T.lat) < 0.002) T.lat = want; T.cars.forEach(function (c, i) { var si = s - dir * i * T.gap; railAt(si, P); c.position.set(P.x + P.dz * T.lat, P.y + 0.12, P.z - P.dx * T.lat); c.rotation.set(0, Math.atan2(P.dx, P.dz) - Math.PI / 2 + (dir < 0 ? Math.PI : 0), 0); }); }

  /* ---------- the vehicles: original designs, modelled part by part, sized to Luna's own proportions (her reach and her legs) ----------
     Each carries its mount points as empty objects (the seat at her hip joint, the grips or the wheel rim, the floor or the pedals, a
     place for the dog) so that the rider is placed and posed by IK, and turns its handlebar or wheel and its wheels as it moves. */
  var VM = null;
  function vmats() { if (VM) return VM; VM = { paint: KIT.curved(K.std({ vc: true, rough: 0.22, metal: 0.32, env: 1.1 })), chrome: KIT.curved(K.std({ vc: true, rough: 0.12, metal: 0.95, env: 1.6 })), rubber: KIT.curved(K.std({ vc: true, rough: 0.94 })), matte: KIT.curved(K.std({ vc: true, rough: 0.66, metal: 0.12 })), glass: M.glass, lights: M.lights }; return VM; }
  function vmesh(b, key) { var m = b.mesh(vmats()[key]); if (m) { m.castShadow = true; m.receiveShadow = true; } return m; }
  function mk(parent, name, p) { var o = new THREE.Object3D(); o.name = name; o.position.set(p[0], p[1], p[2]); parent.add(o); return o; }
  /* a wheel: a tyre with its shoulders and tread grooves, a cast rim of n twin spokes, the hub, a brake disc and its caliper (a group turning on x) */
  function vwheel(r, w, o) { o = o || {}; var gW = new THREE.Group(), tb = B(), rb = B(), cb = B(), i, rim = r * 0.7;
    var tp = [[rim * 0.98, -w * 0.46], [r * 0.9, -w * 0.5], [r * 0.985, -w * 0.4], [r, -w * 0.18], [r, w * 0.18], [r * 0.985, w * 0.4], [r * 0.9, w * 0.5], [rim * 0.98, w * 0.46]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    var tg = new THREE.LatheGeometry(tp, 40); tg.rotateZ(Math.PI / 2); tb.add(tg, null, 0x1e1f22);
    for (i = 0; i < 24; i++) { var a = i / 24 * Math.PI * 2; tb.add(K.box(w * 0.5, 0.006, r * 0.09), { p: [0, Math.cos(a) * r * 1.0, Math.sin(a) * r * 1.0], r: [a, 0, 0] }, 0x141518); }
    var rp = [[rim * 0.86, -w * 0.4], [rim, -w * 0.42], [rim, w * 0.42], [rim * 0.86, w * 0.4]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }); var rg = new THREE.LatheGeometry(rp, 36); rg.rotateZ(Math.PI / 2); rb.add(rg, null, o.rim || 0xc9ced4);
    var bar = new THREE.CylinderGeometry(rim * 0.86, rim * 0.86, w * 0.5, 32, 1, true); bar.rotateZ(Math.PI / 2); cb.add(bar, null, 0x2a2b2e);
    var n = o.spokes || 5; for (i = 0; i < n; i++) { var a2 = i / n * Math.PI * 2; [-0.12, 0.12].forEach(function (d) { rb.add(K.box(0.018, rim * 0.78, 0.016), { p: [w * 0.18, Math.cos(a2 + d) * rim * 0.48, Math.sin(a2 + d) * rim * 0.48], r: [a2 + d, 0, 0] }, o.rim || 0xc9ced4); }); }
    var hub = K.cyl(rim * 0.22, rim * 0.26, w * 0.7, 16); hub.rotateZ(Math.PI / 2); rb.add(hub, null, o.rim || 0xc9ced4); var cap = K.cyl(rim * 0.1, rim * 0.1, w * 0.74, 12); cap.rotateZ(Math.PI / 2); cb.add(cap, null, 0x2a2b2e);
    if (o.disc) { var dg = K.cyl(rim * 0.74, rim * 0.74, 0.008, 28); dg.rotateZ(Math.PI / 2); rb.add(dg, { p: [-w * 0.32, 0, 0] }, 0xa8acb2); var di = K.cyl(rim * 0.42, rim * 0.42, 0.01, 18); di.rotateZ(Math.PI / 2); cb.add(di, { p: [-w * 0.32, 0, 0] }, 0x3a3b3e); }
    [vmesh(tb, 'rubber'), vmesh(rb, 'chrome'), vmesh(cb, 'matte')].forEach(function (m) { if (m) gW.add(m); }); return gW; }

  /* a lofted solid: rounded rings (superellipses) through a list of sections, closed with caps; colour by the ring angle a and the section t */
  function loft(secs, axis, n, col, NA) { NA = NA || 40; var pos = [], cols = [], idx = [], c3 = new THREE.Color(), NS = secs.length, i, j;
    function ring(S2, a) { var ca = Math.cos(a), sa = Math.sin(a), e = 2 / (S2[4] || n), x = Math.sign(ca) * Math.pow(Math.abs(ca), e) * S2[2], y = Math.sign(sa) * Math.pow(Math.abs(sa), e) * S2[3]; return axis === 'z' ? [x, S2[0] + y, S2[1]] : [x, S2[0], S2[1] + y]; }
    function put(p, t, a) { pos.push(p[0], p[1], p[2]); var r = typeof col === 'function' ? col(t, a, p) : col; c3.set(r); cols.push(c3.r, c3.g, c3.b); }
    for (i = 0; i < NS; i++) for (j = 0; j <= NA; j++) { var a = j / NA * Math.PI * 2; put(ring(secs[i], a), i / (NS - 1), a); }
    for (i = 0; i < NS - 1; i++) for (j = 0; j < NA; j++) { var q0 = i * (NA + 1) + j, q1 = q0 + 1, q2 = q0 + NA + 1, q3 = q2 + 1; idx.push(q0, q2, q1, q1, q2, q3); }
    [0, NS - 1].forEach(function (k, e2) { var S2 = secs[k], ctr = axis === 'z' ? [0, S2[0], S2[1]] : [0, S2[0], S2[1]], c0 = pos.length / 3; put(ctr, k / (NS - 1), 0); for (j = 0; j <= NA; j++) { var a = j / NA * Math.PI * 2; put(ring(S2, a), k / (NS - 1), a); } for (j = 0; j < NA; j++) { if (e2) idx.push(c0, c0 + 1 + j, c0 + 2 + j); else idx.push(c0, c0 + 2 + j, c0 + 1 + j); } });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
  function smoothSecs(secs, k) { /* more sections between the given ones, by Catmull-Rom on every field */ var out = [], i, f, n2 = secs.length; for (i = 0; i < n2 - 1; i++) for (f = 0; f < k; f++) { var t = f / k, p0 = secs[Math.max(0, i - 1)], p1 = secs[i], p2 = secs[i + 1], p3 = secs[Math.min(n2 - 1, i + 2)], r = []; for (var q = 0; q < p1.length; q++) { var a = p0[q], b = p1[q], c = p2[q], d = p3[q]; r.push(0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)); } out.push(r); } out.push(secs[n2 - 1].slice()); return out; }

  /* ---------- the scooter: an original Taiwanese-street scooter, AUTO orange and warm white ---------- */
  function moped(col) { col = col || 0xef7a1d; var V = new THREE.Group(), pb = B(), cb = B(), mb = B(), rb = B(), lb = B(), i, cream = 0xf3ece0, dark = 0x2b2c30;
    var RA = [0, 0.2, -0.6], FA = [0, 0.2, 0.5], PIV = [0, 0.8, 0.2], rake = Math.atan2(FA[2] - PIV[2], PIV[1] - FA[1]), flen = Math.hypot(FA[2] - PIV[2], PIV[1] - FA[1]);
    /* the rear body: under the seat to the tail, its sides down over the wheel, a warm-white stripe along each side */
    var rear = smoothSecs([[0.355, -0.05, 0.13, 0.105], [0.37, -0.13, 0.15, 0.13], [0.38, -0.26, 0.165, 0.13], [0.395, -0.4, 0.17, 0.118], [0.41, -0.55, 0.165, 0.11], [0.425, -0.7, 0.15, 0.105], [0.452, -0.82, 0.12, 0.093], [0.485, -0.89, 0.08, 0.065], [0.495, -0.915, 0.035, 0.035]], 3);
    pb.add(loft(rear, 'z', 3.4, function (t, a) { var s2 = Math.sin(a); return s2 > 0.9 ? dark : (s2 > 0.42 && s2 < 0.6) ? cream : col; }, 48), null, 0xffffff);
    /* the floorboard: a flat rounded slab, its ribbed mat */ pb.add(loft(smoothSecs([[0.21, -0.1, 0.165, 0.04], [0.21, 0.08, 0.17, 0.04], [0.215, 0.27, 0.165, 0.042]], 2), 'z', 4, function (t, a) { return Math.sin(a) > 0.2 ? cream : 0x55575c; }, 32), null, 0xffffff); for (i = 0; i < 6; i++) mb.add(K.box(0.24, 0.012, 0.02), { p: [0, 0.255, -0.06 + i * 0.056] }, 0x3a3b3f);
    /* the front body: the leg shield behind (warm white), the nose in front (orange), rising from the floor to the handlebar */
    var front = smoothSecs([[0.2, 0.31, 0.165, 0.06], [0.38, 0.295, 0.19, 0.085], [0.55, 0.275, 0.2, 0.1], [0.7, 0.255, 0.185, 0.105], [0.8, 0.24, 0.13, 0.09], [0.86, 0.23, 0.07, 0.062]], 3);
    pb.add(loft(front, 'y', 2.7, function (t, a) { return Math.sin(a) < -0.25 ? cream : col; }, 48), null, 0xffffff);
    mb.add(K.rbox(0.02, 0.5, 0.012, 0.006, 2), { p: [0, 0.52, 0.375], r: [-0.15, 0, 0] }, cream); lb.add(K.rbox(0.13, 0.02, 0.02, 0.008, 2), { p: [0, 0.68, 0.36], r: [-0.25, 0, 0] }, 0xfff4dc); [-1, 1].forEach(function (s) { lb.add(K.rbox(0.05, 0.018, 0.02, 0.007, 2), { p: [s * 0.13, 0.62, 0.34], r: [-0.25, s * 0.5, 0] }, 0xffb43a); });
    /* the seat: padded, its piping, the grab rail behind it */ cb.add(K.rbox(0.26, 0.075, 0.56, 0.035, 4), { p: [0, 0.515, -0.38], r: [0.04, 0, 0] }, dark); mb.add(K.rbox(0.265, 0.012, 0.565, 0.006, 2), { p: [0, 0.48, -0.38], r: [0.04, 0, 0] }, cream);
    rb.add(K.tube([[-0.15, 0.5, -0.45], [-0.158, 0.52, -0.66], [0, 0.545, -0.78], [0.158, 0.52, -0.66], [0.15, 0.5, -0.45]], 0.011, 28, 6), null, 0xc9ced4);
    /* the tail: the lamp bar, the turn signals, the plate */ lb.add(K.rbox(0.13, 0.026, 0.02, 0.01, 2), { p: [0, 0.505, -0.91] }, 0xff3a2a); [-1, 1].forEach(function (s) { lb.add(K.rbox(0.035, 0.02, 0.02, 0.008, 2), { p: [s * 0.095, 0.47, -0.89] }, 0xffb43a); });
    mb.add(K.rbox(0.05, 0.12, 0.03, 0.01, 2), { p: [0, 0.36, -0.86], r: [0.35, 0, 0] }, dark); pb.add(K.rbox(0.15, 0.075, 0.008, 0.006, 2), { p: [0, 0.31, -0.89], r: [0.3, 0, 0] }, 0xf6f6f2);
    /* the drive: the CVT case on the left with its fins, the shock on the right, the exhaust with its heat shield */
    mb.add(K.rbox(0.07, 0.13, 0.46, 0.05, 3), { p: [0.1, 0.23, -0.4] }, 0x9aa0a6); for (i = 0; i < 4; i++) mb.add(K.box(0.074, 0.01, 0.1), { p: [0.101, 0.2 + i * 0.022, -0.22] }, 0x7a8086);
    rb.add(K.cyl(0.016, 0.016, 0.22, 8), { p: [-0.095, 0.33, -0.55], r: [0.3, 0, 0] }, 0xc9ced4); for (i = 0; i < 6; i++) lb.add(new THREE.TorusGeometry(0.024, 0.005, 6, 12), { p: [-0.095, 0.26 + i * 0.024, -0.572 + i * 0.0074], r: [Math.PI / 2 + 0.3, 0, 0] }, 0xef7a1d);
    rb.add(K.cyl(0.03, 0.034, 0.34, 14), { p: [-0.125, 0.235, -0.6], r: [Math.PI / 2 - 0.1, 0, 0] }, 0xc9ced4); mb.add(K.cyl(0.036, 0.036, 0.2, 14, true), { p: [-0.13, 0.24, -0.56], r: [Math.PI / 2 - 0.1, 0, 0] }, 0x2b2c30); rb.add(K.cyl(0.02, 0.024, 0.04, 12), { p: [-0.125, 0.255, -0.79], r: [Math.PI / 2 - 0.1, 0, 0] }, 0x8a9096);
    var rw = vwheel(0.2, 0.09, { spokes: 5 }); rw.position.set(RA[0], RA[1], RA[2]); V.add(rw);
    /* the steering: the column on its rake, the handlebar and its cover with the headlamp and the dial, the mirrors, the fork, the front wheel and its mudguard */
    var sP = new THREE.Group(); sP.position.set(PIV[0], PIV[1], PIV[2]); sP.rotation.x = -rake; V.add(sP); var st = new THREE.Group(); sP.add(st); var sb = B(), sc = B(), sr = B(), sl = B(), sk = B();
    var HY = 0.125, HZ = -0.116; sb.add(K.rbox(0.3, 0.09, 0.16, 0.044, 3), { p: [0, HY + 0.005, HZ + 0.06] }, col); sb.add(K.rbox(0.18, 0.05, 0.1, 0.03, 2), { p: [0, HY + 0.05, HZ + 0.03] }, cream); sb.add(K.cyl(0.05, 0.06, 0.16, 14), { p: [0, HY - 0.07, HZ + 0.07] }, col);
    sk.add(K.rbox(0.12, 0.012, 0.065, 0.01, 2), { p: [0, HY + 0.077, HZ + 0.025], r: [-0.3, 0, 0] }, 0x1a1c20); sl.add(K.cyl(0.024, 0.024, 0.004, 18), { p: [0, HY + 0.084, HZ + 0.025], r: [-0.3, 0, 0] }, 0x7fe0f0);
    sl.add(K.rbox(0.16, 0.04, 0.02, 0.018, 3), { p: [0, HY, HZ + 0.14] }, 0xfffbea); [-1, 1].forEach(function (s) { sl.add(K.rbox(0.035, 0.02, 0.03, 0.008, 2), { p: [s * 0.14, HY, HZ + 0.12] }, 0xffb43a); });
    [-1, 1].forEach(function (s) { sr.add(K.cyl(0.011, 0.011, 0.2, 8), { p: [s * 0.11, HY, HZ], r: [0, 0, Math.PI / 2] }, 0x9aa0a6); sc.add(K.cyl(0.017, 0.017, 0.09, 12), { p: [s * 0.2, HY, HZ], r: [0, 0, Math.PI / 2] }, 0x1a1b1e); sr.add(K.box(0.09, 0.008, 0.016), { p: [s * 0.19, HY + 0.008, HZ + 0.04], r: [0, s * 0.25, 0] }, 0xb8bcc2);
      sr.add(K.cyl(0.005, 0.005, 0.16, 6), { p: [s * 0.13, HY + 0.1, HZ + 0.02], r: [0, 0, s * 0.25] }, 0x9aa0a6); sc.add(K.cyl(0.035, 0.035, 0.012, 16), { p: [s * 0.155, HY + 0.18, HZ + 0.02], r: [Math.PI / 2 - 0.2, 0, 0] }, 0x1a1b1e); sk.add(K.cyl(0.03, 0.03, 0.004, 16), { p: [s * 0.155, HY + 0.18, HZ + 0.013], r: [Math.PI / 2 - 0.2, 0, 0] }, 0xc8d8e2); });
    [-1, 1].forEach(function (s) { sc.add(K.cyl(0.02, 0.02, flen * 0.5, 10), { p: [s * 0.06, -flen * 0.35, 0] }, 0x2b2c30); sr.add(K.cyl(0.016, 0.016, flen * 0.46, 10), { p: [s * 0.06, -flen * 0.74, 0] }, 0xc9ced4); });
    sb.add(K.surf(18, 4, function (u, v, p) { var ph = 0.62 + u * 1.45, R2 = 0.228; p.set((v * 2 - 1) * 0.052, Math.sin(ph) * R2, Math.cos(ph) * R2); }, true), { p: [0, -flen, 0], r: [rake, 0, 0] }, col);
    sc.add(K.rbox(0.03, 0.06, 0.05, 0.01, 2), { p: [-0.065, -flen + 0.03, -0.06] }, 0xd8441e);
    [vmesh(sb, 'paint'), vmesh(sc, 'matte'), vmesh(sr, 'chrome'), vmesh(sl, 'lights'), vmesh(sk, 'glass')].forEach(function (m) { if (m) st.add(m); });
    var fw = vwheel(0.2, 0.085, { spokes: 5, disc: true }); fw.position.set(0, -flen, 0); fw.rotation.x = rake; st.add(fw);
    [vmesh(pb, 'paint'), vmesh(cb, 'matte'), vmesh(mb, 'matte'), vmesh(rb, 'chrome'), vmesh(lb, 'lights')].forEach(function (m) { if (m) V.add(m); });
    /* the mount points: her hip on the seat, the grips (left = +x), her feet on the board, the dog sitting on the pillion behind her */
    var mkG = { seat: mk(V, 'seat', [0, 0.6, -0.22]), gripL: mk(st, 'gripL', [0.2, HY, HZ]), gripR: mk(st, 'gripR', [-0.2, HY, HZ]), footL: mk(V, 'footL', [0.085, 0.28, 0.03]), footR: mk(V, 'footR', [-0.085, 0.28, 0.03]), dog: mk(V, 'dog', [0, 0.556, -0.56]) };
    V.userData = { mk: mkG, lean: 0.24, headX: -0.08, wheels: [rw, fw], steerG: st, wr: 0.2, seat: [0, 0.6, -0.22], kind: 'moped' }; return V; }

  /* ---------- the roadster: an original two-seat open sports car, deep teal over a tan interior ---------- */
  function roadster(col) { col = col || 0x1d7480; var V = new THREE.Group(), pb = B(), ib = B(), cb = B(), rb = B(), gb = B(), lb = B(), tb = B(), i, tan = 0xb98a5c, dark = 0x24262a;
    var FZ = 0.64, RZ = -0.66, TR = 0.43, WR = 0.2;
    /* the body: two lofted sides from the sills to the belt line with the wheel arches cut in their lower edge, the hood, the rear deck, the nose and the tail closing it */
    function arch(z) { var d1 = Math.abs(z - FZ), d2 = Math.abs(z - RZ), d = Math.min(d1, d2), R2 = WR + 0.045; return d < R2 ? Math.sqrt(R2 * R2 - d * d) + 0.2 - 0.03 : 0.12; }
    function hw(z) { var t = (z + 1.02) / 2.08, w = 0.5 - 0.05 * Math.pow(Math.max(0, t - 0.78) / 0.22, 2) - 0.04 * Math.pow(Math.max(0, 0.12 - t) / 0.12, 2); w += 0.025 * Math.exp(-Math.pow((z - FZ) / 0.25, 2)) + 0.03 * Math.exp(-Math.pow((z - RZ) / 0.25, 2)); return w; }
    function belt(z) { return 0.44 - 0.07 * Math.pow(Math.max(0, z - 0.4) / 0.62, 1.6) + 0.02 * Math.exp(-Math.pow((z + 0.7) / 0.3, 2)); }
    [1, -1].forEach(function (s) { pb.add(K.surf(60, 10, function (u, v, p) { var z = -0.955 + u * (0.81 + 0.955), yb = arch(z), yt = belt(z), y = yb + (yt - yb) * v, w = hw(z) * (1 - 0.06 * Math.pow(1 - v, 2) - 0.08 * Math.pow(v, 3)); p.set(s * w, y, z); }, true), null, col); });
    pb.add(K.surf(30, 14, function (u, v, p) { var x0 = (v * 2 - 1) * 0.455, zf = 1.0 + 0.012 - 0.2 * Math.pow(Math.abs(x0) / 0.48, 2.2), z = 0.32 + u * (zf - 0.32), x = (v * 2 - 1) * hw(z) * 0.94, y = belt(z) + 0.035 * (1 - Math.pow(x / (hw(z) || 1), 2)) + 0.025 * Math.exp(-Math.pow(x / 0.12, 2)) * (1 - u); p.set(x, y, z); }, true), null, col);
    pb.add(K.surf(20, 14, function (u, v, p) { var z = -1.0 + u * 0.56, x = (v * 2 - 1) * hw(z) * 0.94, y = belt(z) + 0.03 * (1 - Math.pow(x / (hw(z) || 1), 2)); p.set(x, y, z); }, true), null, col);
    pb.add(K.surf(24, 10, function (u, v, p) { var x = (u * 2 - 1) * hw(1.0) * 0.95, ax = Math.abs(x) / 0.48, y = 0.12 + v * (belt(1.0) + 0.02 - 0.12), z = 1.0 + 0.06 * Math.sin(v * Math.PI * 0.9) - 0.05 * v - 0.2 * Math.pow(ax, 2.2); p.set(x, y, z); }, true), null, col);
    pb.add(K.surf(20, 8, function (u, v, p) { var x = (u * 2 - 1) * hw(-1.0) * 0.95, y = 0.12 + v * (belt(-1.0) + 0.02 - 0.12), z = -1.0 - 0.04 * Math.sin(v * Math.PI) + 0.06 * Math.pow(Math.abs(x) / 0.5, 2); p.set(x, y, z); }, true), null, col);
    pb.add(K.box(0.9, 0.02, 1.7), { p: [0, 0.12, -0.08] }, dark);
    /* the door line, the side intake, a fine orange pinstripe along the belt */ [1, -1].forEach(function (s) { gb.add(K.box(0.004, 0.24, 0.006), { p: [s * (hw(0.28) + 0.002), 0.3, 0.28] }, 0x0e1416); gb.add(K.box(0.004, 0.24, 0.006), { p: [s * (hw(-0.4) + 0.002), 0.3, -0.4] }, 0x0e1416); gb.add(K.rbox(0.01, 0.05, 0.16, 0.02, 2), { p: [s * (hw(0.06) + 0.003), 0.26, 0.06] }, 0x10181a);
      var line = []; for (i = 0; i <= 24; i++) { var zz = -0.93 + i / 24 * 1.7; line.push([s * (hw(zz) * 0.985 + 0.003), belt(zz) - 0.035, zz]); } lb.add(K.tube(line, 0.004, 48, 4), null, 0xf08a2a); });
    /* the cockpit: the tub, two seats, the dashboard with its dials, the console, the steering wheel (left-hand drive), the roll hoops */
    ib.add(K.box(0.82, 0.03, 0.72), { p: [0, 0.16, -0.06] }, dark); [1, -1].forEach(function (s) { ib.add(K.box(0.02, 0.26, 0.72), { p: [s * 0.4, 0.3, -0.06] }, tan); });
    [0.2, -0.2].forEach(function (x) { ib.add(K.rbox(0.25, 0.08, 0.32, 0.035, 3), { p: [x, 0.24, -0.2] }, tan); ib.add(K.rbox(0.25, 0.34, 0.07, 0.035, 3), { p: [x, 0.42, -0.4], r: [-0.22, 0, 0] }, tan); ib.add(K.rbox(0.14, 0.1, 0.06, 0.03, 2), { p: [x, 0.64, -0.45], r: [-0.22, 0, 0] }, tan);
      rb.add(K.tube([[x - 0.11, belt(-0.5), -0.5], [x - 0.1, 0.72, -0.52], [x, 0.78, -0.53], [x + 0.1, 0.72, -0.52], [x + 0.11, belt(-0.5), -0.5]], 0.018, 24, 8), null, 0xc9ced4); });
    ib.add(K.rbox(0.84, 0.13, 0.16, 0.04, 3), { p: [0, 0.47, 0.25] }, dark); ib.add(K.rbox(0.14, 0.18, 0.3, 0.03, 2), { p: [0, 0.26, 0.06] }, dark); for (i = 0; i < 2; i++) lb.add(K.cyl(0.03, 0.03, 0.01, 16), { p: [0.16 + i * 0.08, 0.5, 0.168], r: [Math.PI / 2 - 0.3, 0, 0] }, 0xffe8b8);
    var wheelG = new THREE.Group(); wheelG.position.set(0.2, 0.58, -0.02); wheelG.rotation.x = -1.0; V.add(wheelG); var wb = B(); wb.add(new THREE.TorusGeometry(0.075, 0.011, 8, 28), { r: [Math.PI / 2, 0, 0] }, 0x1a1b1e); [0, 2.1, 4.2].forEach(function (a) { wb.add(K.box(0.012, 0.004, 0.07), { p: [Math.sin(a) * 0.035, 0, Math.cos(a) * 0.035], r: [0, a, 0] }, 0x5a5c60); }); wb.add(K.cyl(0.02, 0.02, 0.02, 12), null, 0x2a2b2e); wb.add(K.cyl(0.012, 0.012, 0.16, 8), { p: [0, -0.08, 0] }, 0x2a2b2e); var wm = vmesh(wb, 'matte'); wheelG.add(wm);
    /* the windscreen in its frame, the mirrors */ var wsF = [[-0.4, 0.46, 0.33], [-0.38, 0.7, 0.16], [0.38, 0.7, 0.16], [0.4, 0.46, 0.33]]; cb.add(K.tube(wsF, 0.014, 30, 6), null, dark); gb.add(K.surf(10, 6, function (u, v, p) { var x = (u * 2 - 1) * (0.39 - v * 0.01), y = 0.46 + v * 0.24, z = 0.33 - v * 0.17 - 0.04 * Math.pow(x / 0.4, 2); p.set(x, y, z); }, true), null, 0x6f8fa0);
    [1, -1].forEach(function (s) { cb.add(K.box(0.07, 0.012, 0.012), { p: [s * 0.47, 0.47, 0.3] }, dark); pb.add(K.rbox(0.09, 0.05, 0.035, 0.02, 2), { p: [s * 0.53, 0.48, 0.3] }, col); gb.add(K.box(0.075, 0.035, 0.004), { p: [s * 0.53, 0.48, 0.282] }, 0x9ab8c8); });
    /* the face: slim lamp bars across the front corners, a wide air intake below with a single bar, the tail: one lamp bar across */
    [1, -1].forEach(function (s) { gb.add(K.rbox(0.25, 0.06, 0.03, 0.025, 3), { p: [s * 0.27, 0.35, 0.985 - 0.2 * Math.pow(0.27 / 0.48, 2.2)], r: [0, s * 0.42, 0] }, 0x1a2226); lb.add(K.rbox(0.22, 0.03, 0.03, 0.014, 3), { p: [s * 0.27, 0.355, 0.993 - 0.2 * Math.pow(0.27 / 0.48, 2.2)], r: [0, s * 0.42, 0] }, 0xfffbea); lb.add(K.rbox(0.05, 0.016, 0.02, 0.006, 2), { p: [s * 0.4, 0.3, 0.86], r: [0, s * 0.7, 0] }, 0xffb43a); });
    gb.add(K.rbox(0.56, 0.1, 0.03, 0.04, 3), { p: [0, 0.22, 1.035] }, 0x0f1214); cb.add(K.box(0.5, 0.012, 0.03), { p: [0, 0.22, 1.045] }, 0x5a5c60);
    lb.add(K.rbox(0.82, 0.026, 0.02, 0.012, 2), { p: [0, 0.4, -1.025] }, 0xff3a2a); lb.add(K.rbox(0.82, 0.008, 0.022, 0.004, 2), { p: [0, 0.37, -1.024] }, 0x8a1a12); pb.add(K.rbox(0.2, 0.08, 0.01, 0.006, 2), { p: [0, 0.25, -1.042] }, 0xf6f6f2); rb.add(K.cyl(0.025, 0.028, 0.06, 12), { p: [0.18, 0.15, -1.03], r: [Math.PI / 2, 0, 0] }, 0xc9ced4); rb.add(K.cyl(0.025, 0.028, 0.06, 12), { p: [-0.18, 0.15, -1.03], r: [Math.PI / 2, 0, 0] }, 0xc9ced4);
    /* the wheel arch liners and the calipers */ [[FZ, 1], [FZ, -1], [RZ, 1], [RZ, -1]].forEach(function (q) { cb.add(new THREE.CylinderGeometry(WR + 0.04, WR + 0.04, 0.16, 22, 1, true, -Math.PI * 0.5, Math.PI).rotateZ(Math.PI / 2), { p: [q[1] * (TR - 0.02), WR, q[0]], r: [Math.PI, 0, 0] }, 0x101214); });
    [vmesh(pb, 'paint'), vmesh(ib, 'matte'), vmesh(cb, 'matte'), vmesh(rb, 'chrome'), vmesh(gb, 'glass'), vmesh(lb, 'lights')].forEach(function (m) { if (m) V.add(m); });
    var wheels = [], fronts = []; [[FZ, 1], [FZ, -1], [RZ, 1], [RZ, -1]].forEach(function (q) { var piv = new THREE.Group(); piv.position.set(q[1] * TR, WR, q[0]); V.add(piv); var w = vwheel(WR, 0.13, { spokes: 5, disc: true, rim: 0xd2d6dc }); w.rotation.y = q[1] < 0 ? Math.PI : 0; piv.add(w); var cl = B(); cl.add(K.rbox(0.03, 0.06, 0.08, 0.012, 2), { p: [q[1] * -0.05, 0.06, -0.04] }, 0xef7a1d); var clm = vmesh(cl, 'paint'); piv.add(clm); wheels.push(w); if (q[0] > 0) fronts.push(piv); });
    var mkG = { seat: mk(V, 'seat', [0.2, 0.33, -0.17]), gripL: mk(wheelG, 'gripL', [0.066, 0.0, 0.036]), gripR: mk(wheelG, 'gripR', [-0.066, 0.0, 0.036]), footL: mk(V, 'footL', [0.25, 0.19, 0.22]), footR: mk(V, 'footR', [0.14, 0.19, 0.22]), dog: mk(V, 'dog', [-0.2, 0.29, -0.2]) };
    V.userData = { mk: mkG, lean: -0.1, headX: 0.02, wheels: wheels, fronts: fronts, wheelG: wheelG, wr: WR, seat: [0.2, 0.33, -0.17], kind: 'car' }; return V; }
  /* ---------- the owner's vehicles, parked beside the Good Startup counter (original designs: no maker's shapes, names or liveries) ----------
     A red electric crossover: a closed, smooth nose with slim separate lamps and a low black intake, black cladding round the arches and
     along the sills, a gently sloping roof with silver rails, separate wrap-round tail lamps, dark aero wheels. A green racing superbike:
     a twin-spar frame, a tall tank, a sharp nose with two slit lamps and a central intake, a white accent line, a black belly pan,
     inverted forks, an under-slung exhaust and a short canister, parked leaning on its side stand. Lenses are unlit while parked. */
  function crossover(col) { col = col || 0xb0141e; var V = new THREE.Group(), pb = B(), kb = B(), cb = B(), rb = B(), gb = B(), i, blk = 0x161719, dark = 0x232528;
    var FZ = 0.93, RZ = -0.9, TR = 0.52, WR = 0.235, ZF = 1.48, ZB = -1.48;
    function arch(z) { var d = Math.min(Math.abs(z - FZ), Math.abs(z - RZ)), R2 = WR + 0.055; return d < R2 ? WR + Math.sqrt(R2 * R2 - d * d) : 0.17; }
    function hw(z) { var w = 0.6; if (z > 1.05) w -= 0.085 * Math.pow((z - 1.05) / (ZF - 1.05), 2); if (z < -1.1) w -= 0.06 * Math.pow((z + 1.1) / (ZB + 1.1), 2); return w + 0.02 * Math.exp(-Math.pow((z - FZ) / 0.3, 2)) + 0.024 * Math.exp(-Math.pow((z - RZ) / 0.3, 2)); }
    function hood(z) { return 0.665 - 0.105 * Math.pow(Math.max(0, z - 0.56) / (ZF - 0.56), 1.5); }
    function belt(z) { return z > 0.56 ? hood(z) : 0.665 + 0.035 * Math.max(0, -z) / 1.48; }
    var cv = new THREE.SplineCurve([[0.6, 0.668], [0.3, 0.84], [0.04, 0.962], [-0.2, 0.995], [-0.7, 0.99], [-1.0, 0.948], [-1.22, 0.862], [-1.38, 0.745]].map(function (q) { return new THREE.Vector2(q[0], q[1]); })), CS = cv.getPoints(160);
    function cabY(z) { for (var k = 1; k < CS.length; k++) if (CS[k].x <= z) { var a = CS[k - 1], b = CS[k], u = (z - a.x) / ((b.x - a.x) || 1e-6); return a.y + (b.y - a.y) * u; } return CS[CS.length - 1].y; }
    function wg(z, y) { return hw(z) - 0.035 - 0.15 * Math.max(0, y - 0.665) / 0.33; }
    /* the body: the sides from the sills (cut round the arches) to the belt, the hood, the nose, the tail */
    [1, -1].forEach(function (s) { pb.add(K.surf(72, 10, function (u, v, p) { var z = ZB + 0.03 + u * (ZF - 0.05 - ZB - 0.03), yb = arch(z) + 0.06, yt = belt(z), y = yb + (yt - yb) * v; p.set(s * hw(z) * (1 - 0.04 * Math.pow(1 - v, 2) - 0.045 * Math.pow(v, 3)), y, z); }, true), null, col);
      kb.add(K.surf(72, 3, function (u, v, p) { var z = ZB + 0.03 + u * (ZF - 0.05 - ZB - 0.03), yb = arch(z), y = yb + 0.07 * v; p.set(s * (hw(z) * 0.958 + 0.006), y, z); }, true), null, blk); });
    pb.add(K.surf(30, 16, function (u, v, p) { var z = 0.56 + u * (ZF - 0.04 - 0.56), x = (v * 2 - 1) * hw(z) * 0.955, y = hood(z) + 0.028 * (1 - Math.pow(x / hw(z), 2)); p.set(x, y, z); }, true), null, col);
    pb.add(K.surf(26, 10, function (u, v, p) { var x = (u * 2 - 1) * hw(ZF - 0.04) * 0.955, ax = Math.abs(x) / 0.6, y = 0.2 + v * (hood(ZF - 0.04) + 0.01 - 0.2), z = ZF - 0.04 + 0.05 * Math.sin(v * Math.PI * 0.85) - 0.035 * v - 0.17 * Math.pow(ax, 2.4); p.set(x, y, z); }, true), null, col);
    pb.add(K.surf(26, 10, function (u, v, p) { var x = (u * 2 - 1) * hw(ZB + 0.03) * 0.955, ax = Math.abs(x) / 0.6, y = 0.22 + v * (0.75 - 0.22), z = ZB + 0.03 - 0.03 * Math.sin(v * Math.PI) + 0.09 * Math.pow(ax, 2.4) + 0.05 * Math.pow(v, 3); p.set(x, y, z); }, true), null, col);
    cb.add(K.box(1.1, 0.05, 2.7), { p: [0, 0.17, 0] }, dark);
    /* the cabin: the windscreen, the roof, the rear glass; the side glass, the pillars, the window surround, the roof rails */
    gb.add(K.surf(14, 12, function (u, v, p) { var z = 0.6 - u * 0.56, y = cabY(z), w = wg(z, y), x = (v * 2 - 1) * w; p.set(x, y + 0.012 * (1 - Math.pow(x / w, 2)), z); }, true), null, 0x1c2a33);
    pb.add(K.surf(24, 12, function (u, v, p) { var z = 0.04 - u * 0.99, y = cabY(z), w = wg(z, y), x = (v * 2 - 1) * w; p.set(x, y + 0.016 * (1 - Math.pow(x / w, 2)), z); }, true), null, col);
    gb.add(K.surf(12, 12, function (u, v, p) { var z = -0.95 - u * 0.43, y = cabY(z), w = wg(z, y), x = (v * 2 - 1) * w; p.set(x, y + 0.012 * (1 - Math.pow(x / w, 2)), z); }, true), null, 0x1c2a33);
    [1, -1].forEach(function (s) { gb.add(K.surf(40, 6, function (u, v, p) { var z = 0.59 - u * 1.56, y0 = belt(z), y1 = cabY(z), y = y0 + (y1 - y0) * v * 0.985; p.set(s * (wg(z, y) + 0.002), y, z); }, true), null, 0x1c2a33);
      pb.add(K.surf(12, 6, function (u, v, p) { var z = -0.98 - u * 0.4, y0 = belt(z), y1 = cabY(z), y = y0 + (y1 - y0) * v; p.set(s * (wg(z, y) + 0.006), y, z); }, true), null, col); /* the C pillar */
      cb.add(K.surf(3, 8, function (u, v, p) { var z = -0.23 - u * 0.065, y0 = belt(z), y1 = cabY(z), y = y0 + (y1 - y0) * v * 0.99; p.set(s * (wg(z, y) + 0.005), y, z); }, true), null, blk); /* the B pillar */
      var edge = []; for (i = 0; i <= 30; i++) { var zz = 0.6 - i / 30 * 1.58, yy = cabY(zz); edge.push([s * (wg(zz, yy) + 0.003), yy - 0.004, zz]); } cb.add(K.tube(edge, 0.008, 60, 5), null, blk);
      var bl = []; for (i = 0; i <= 24; i++) { var z2 = 0.59 - i / 24 * 1.56; bl.push([s * (wg(z2, belt(z2)) + 0.004), belt(z2) + 0.003, z2]); } cb.add(K.tube(bl, 0.006, 48, 5), null, blk);
      var rail = []; for (i = 0; i <= 12; i++) { var z3 = -0.05 - i / 12 * 0.85; rail.push([s * (wg(z3, cabY(z3)) - 0.05), cabY(z3) + 0.045, z3]); } rb.add(K.tube(rail, 0.011, 30, 6), null, 0xc3c8ce); [-0.05, -0.9].forEach(function (z4) { rb.add(K.box(0.02, 0.05, 0.05), { p: [s * (wg(z4, cabY(z4)) - 0.05), cabY(z4) + 0.022, z4] }, 0x9aa0a6); });
      /* the door lines, the flush handles, the mirror */ [[0.585, 0.21, 0.66], [-0.25, 0.19, 0.69], [-0.99, 0.5, 0.69]].forEach(function (d) { cb.add(K.box(0.004, d[2] - d[1], 0.006), { p: [s * (hw(d[0]) * 0.985 + 0.001), (d[1] + d[2]) / 2, d[0]] }, 0x2a0a0c); });
      [0.18, -0.6].forEach(function (z5) { cb.add(K.rbox(0.008, 0.016, 0.09, 0.004, 2), { p: [s * (hw(z5) * 0.99 + 0.002), 0.6, z5] }, blk); });
      cb.add(K.box(0.05, 0.012, 0.03), { p: [s * (hw(0.48) + 0.02), 0.7, 0.48] }, blk); pb.add(K.rbox(0.11, 0.06, 0.05, 0.022, 3), { p: [s * (hw(0.48) + 0.065), 0.715, 0.47] }, col); gb.add(K.box(0.09, 0.045, 0.004), { p: [s * (hw(0.48) + 0.065), 0.715, 0.444] }, 0x9ab0bc);
      /* the lamps: slim, separate, high on the nose corners; the tail lamps wrapping round the rear corners */
      gb.add(K.rbox(0.27, 0.042, 0.035, 0.016, 3), { p: [s * 0.37, 0.565, ZF - 0.03 - 0.17 * Math.pow(0.37 / 0.6, 2.4)], r: [0, s * 0.42, 0] }, 0xe8eef4); gb.add(K.rbox(0.25, 0.008, 0.036, 0.003, 2), { p: [s * 0.37, 0.548, ZF - 0.028 - 0.17 * Math.pow(0.37 / 0.6, 2.4)], r: [0, s * 0.42, 0] }, 0x8fa4b4);
      gb.add(K.rbox(0.24, 0.05, 0.03, 0.014, 3), { p: [s * 0.4, 0.63, ZB + 0.06], r: [0, s * -0.32, 0] }, 0x9a1418); gb.add(K.rbox(0.03, 0.05, 0.12, 0.012, 2), { p: [s * (hw(-1.38) - 0.005), 0.63, -1.38] }, 0x9a1418);
      /* the arch liners */ [FZ, RZ].forEach(function (z6) { cb.add(new THREE.CylinderGeometry(WR + 0.05, WR + 0.05, 0.2, 22, 1, true, -Math.PI * 0.5, Math.PI).rotateZ(Math.PI / 2), { p: [s * (TR - 0.02), WR, z6], r: [Math.PI, 0, 0] }, 0x0e0f11); }); });
    /* the nose: the low intake with its fine bar, the plate; the tail: the plate, the black diffuser */
    kb.add(K.rbox(0.74, 0.11, 0.04, 0.04, 3), { p: [0, 0.29, ZF + 0.004] }, 0x101113); rb.add(K.box(0.62, 0.008, 0.012), { p: [0, 0.3, ZF + 0.026] }, 0x8a9096); pb.add(K.rbox(0.25, 0.07, 0.01, 0.006, 2), { p: [0, 0.39, ZF + 0.012] }, 0xf4f4f0);
    kb.add(K.rbox(0.9, 0.09, 0.05, 0.03, 3), { p: [0, 0.25, ZB + 0.01] }, 0x101113); pb.add(K.rbox(0.25, 0.07, 0.01, 0.006, 2), { p: [0, 0.43, ZB - 0.008] }, 0xf4f4f0);
    [vmesh(pb, 'paint'), vmesh(kb, 'matte'), vmesh(cb, 'matte'), vmesh(rb, 'chrome'), vmesh(gb, 'glass')].forEach(function (m) { if (m) V.add(m); });
    [[FZ, 1], [FZ, -1], [RZ, 1], [RZ, -1]].forEach(function (q) { var w = vwheel(WR, 0.19, { spokes: 5, disc: true, rim: 0x34373c }); w.position.set(q[1] * TR, WR, q[0]); w.rotation.y = q[1] < 0 ? Math.PI : 0; V.add(w); });
    V.userData = { kind: 'parked', hw: 0.66, hd: 1.5 }; return V; }

  function superbike(col) { col = col || 0x0e8a46; var V = new THREE.Group(), body = new THREE.Group(), pb = B(), kb = B(), cb = B(), rb = B(), gb = B(), i, white = 0xf2f4f5, blk = 0x141518;
    V.add(body); var FA = [0, 0.205, 0.53], RA = [0, 0.21, -0.45], HEAD = [0, 0.67, 0.3], PIVZ = -0.1;
    /* the frame: two spars from the steering head round the engine to the swingarm pivot; the engine, its cylinders tilted forward */
    [1, -1].forEach(function (s) { rb.add(K.tube([[s * 0.05, 0.66, 0.29], [s * 0.12, 0.58, 0.16], [s * 0.125, 0.47, -0.02], [s * 0.105, 0.36, PIVZ]], 0.026, 24, 8), null, 0x8c9198);
      cb.add(K.tube([[s * 0.1, 0.34, PIVZ], [s * 0.085, 0.27, -0.3], [s * 0.07, 0.21, -0.45]], 0.024, 16, 8), null, 0x2a2c30); });
    cb.add(K.rbox(0.25, 0.23, 0.3, 0.04, 3), { p: [0, 0.29, 0.05] }, 0x2b2d31); cb.add(K.rbox(0.23, 0.15, 0.14, 0.03, 3), { p: [0, 0.45, 0.17], r: [-0.5, 0, 0] }, 0x35383d); cb.add(K.rbox(0.27, 0.06, 0.1, 0.02, 2), { p: [0, 0.2, 0.18] }, 0x1f2124);
    /* the exhaust: the headers down under the engine, the canister on the right */ rb.add(K.tube([[0.04, 0.4, 0.25], [0.05, 0.2, 0.22], [0.02, 0.13, 0.02], [-0.09, 0.18, -0.2], [-0.13, 0.26, -0.27]], 0.022, 30, 8), null, 0xb9a98e);
    var can = K.cyl(0.05, 0.045, 0.26, 16); rb.add(can, { p: [-0.14, 0.31, -0.36], r: [Math.PI / 2 - 0.42, 0, 0] }, 0xc5c9ce); cb.add(K.cyl(0.03, 0.03, 0.02, 12), { p: [-0.14, 0.36, -0.48], r: [Math.PI / 2 - 0.42, 0, 0] }, 0x1a1b1d);
    /* the shock with its spring */ cb.add(K.cyl(0.018, 0.018, 0.2, 10), { p: [0, 0.42, -0.14], r: [0.5, 0, 0] }, 0x2a2c30); for (i = 0; i < 7; i++) rb.add(new THREE.TorusGeometry(0.026, 0.005, 6, 14), { p: [0, 0.36 + i * 0.022, -0.17 + i * 0.011], r: [Math.PI / 2 + 0.5, 0, 0] }, 0xc89a2a);
    /* the tank, the seat, the tail with its white line and its lamp, the plate on its hanger */
    pb.add(loft(smoothSecs([[0.6, -0.1, 0.1, 0.07, 2.6], [0.645, 0.0, 0.13, 0.09, 2.8], [0.67, 0.12, 0.14, 0.09, 2.8], [0.655, 0.22, 0.12, 0.075, 2.6], [0.63, 0.28, 0.07, 0.05, 2.4]], 3), 'z', 2.8, function (t, a) { return Math.sin(a) < -0.45 ? blk : col; }, 40), null, 0xffffff);
    cb.add(K.rbox(0.19, 0.045, 0.28, 0.02, 3), { p: [0, 0.575, -0.22], r: [0.1, 0, 0] }, 0x1b1c1f);
    pb.add(loft(smoothSecs([[0.57, -0.3, 0.115, 0.055, 2.5], [0.61, -0.42, 0.1, 0.058, 2.5], [0.655, -0.55, 0.075, 0.05, 2.3], [0.69, -0.66, 0.042, 0.032, 2]], 3), 'z', 2.5, function (t, a) { var sa = Math.sin(a); return sa < -0.5 ? blk : (sa > 0.05 && sa < 0.3 && Math.abs(Math.cos(a)) > 0.6) ? white : col; }, 36), null, 0xffffff);
    gb.add(K.rbox(0.07, 0.02, 0.02, 0.008, 2), { p: [0, 0.69, -0.672] }, 0x9a1418); cb.add(K.box(0.02, 0.18, 0.02), { p: [0, 0.52, -0.6], r: [-0.5, 0, 0] }, blk); pb.add(K.rbox(0.12, 0.08, 0.008, 0.005, 2), { p: [0, 0.43, -0.66], r: [-0.25, 0, 0] }, 0xf4f4f0);
    /* the fairing: the sharp nose with two slit lamps and a central intake, the sides with a white line, the black belly pan, the screen */
    pb.add(loft(smoothSecs([[0.545, 0.665, 0.018, 0.016, 2.2], [0.55, 0.6, 0.07, 0.05, 2.4], [0.53, 0.5, 0.112, 0.098, 2.8], [0.48, 0.38, 0.132, 0.162, 3.4], [0.43, 0.24, 0.134, 0.205, 3.8], [0.4, 0.12, 0.124, 0.195, 3.8]], 3), 'z', 3, function (t, a, p) { return p[1] < 0.27 ? blk : col; }, 56), null, 0xffffff);
    [1, -1].forEach(function (s) { var ln = [[s * 0.07, 0.535, 0.585], [s * 0.112, 0.505, 0.49], [s * 0.134, 0.455, 0.36], [s * 0.137, 0.4, 0.22], [s * 0.128, 0.37, 0.13]]; pb.add(K.tube(ln, 0.0075, 30, 5), null, white); }); /* the white line along each side */
    kb.add(loft(smoothSecs([[0.17, 0.26, 0.1, 0.06, 2.5], [0.15, 0.06, 0.13, 0.07, 2.5], [0.17, -0.12, 0.1, 0.06, 2.5]], 2), 'z', 2.5, blk, 28), null, 0xffffff);
    [1, -1].forEach(function (s) { gb.add(K.rbox(0.06, 0.014, 0.012, 0.006, 2), { p: [s * 0.04, 0.562, 0.598], r: [0, s * 0.62, s * 0.3] }, 0xe8eef4); cb.add(K.cyl(0.006, 0.006, 0.08, 6), { p: [s * 0.15, 0.665, 0.42], r: [0, 0, s * 1.1] }, blk); kb.add(K.rbox(0.06, 0.03, 0.012, 0.01, 2), { p: [s * 0.19, 0.69, 0.42], r: [0, s * 0.3, 0] }, blk); });
    kb.add(K.rbox(0.04, 0.026, 0.03, 0.01, 2), { p: [0, 0.528, 0.628] }, 0x0c0c0d);
    gb.add(K.surf(8, 6, function (u, v, p) { var x = (u * 2 - 1) * (0.1 - v * 0.035), y = 0.6 + v * 0.115, z = 0.55 - v * 0.17 - 0.04 * x * x / 0.01; p.set(x, y, z); }, true), null, 0x2c363d);
    /* the steering: the inverted forks, the clamps, the clip-ons, the front mudguard */
    var rake = Math.atan2(FA[2] - HEAD[2], HEAD[1] - FA[1]), flen = Math.hypot(FA[2] - HEAD[2], HEAD[1] - FA[1]);
    var st = new THREE.Group(); st.position.set(HEAD[0], HEAD[1], HEAD[2]); st.rotation.x = -rake; V.add(st); var sb = B(), sr = B(), sk = B();
    [1, -1].forEach(function (s) { sr.add(K.cyl(0.024, 0.024, flen * 0.55, 12), { p: [s * 0.075, -flen * 0.32, 0] }, 0xc9a24a); sk.add(K.cyl(0.018, 0.018, flen * 0.5, 10), { p: [s * 0.075, -flen * 0.72, 0] }, 0x24262a); sk.add(K.tube([[s * 0.075, 0.0, 0.0], [s * 0.17, 0.005, -0.04], [s * 0.23, 0.0, -0.06]], 0.012, 8, 6), null, 0x2a2c30); sk.add(K.cyl(0.016, 0.016, 0.08, 10), { p: [s * 0.24, 0.0, -0.065], r: [0, 0, Math.PI / 2] }, 0x111213); });
    sk.add(K.rbox(0.2, 0.03, 0.07, 0.012, 2), { p: [0, 0.0, 0.0] }, 0x2a2c30); sb.add(K.surf(14, 4, function (u, v, p) { var ph = 0.75 + u * 1.3, R2 = 0.23; p.set((v * 2 - 1) * 0.055, Math.sin(ph) * R2, Math.cos(ph) * R2); }, true), { p: [0, -flen, 0], r: [rake, 0, 0] }, col);
    [vmesh(sb, 'paint'), vmesh(sr, 'chrome'), vmesh(sk, 'matte')].forEach(function (m) { if (m) st.add(m); });
    var fw = vwheel(0.205, 0.1, { spokes: 5, disc: true, rim: 0x1d1f22 }); fw.position.set(0, -flen, 0); fw.rotation.x = rake; st.add(fw);
    var rw = vwheel(0.21, 0.14, { spokes: 5, disc: true, rim: 0x1d1f22 }); rw.position.set(RA[0], RA[1], RA[2]); rw.rotation.y = Math.PI; V.add(rw);
    kb.add(K.surf(12, 3, function (u, v, p) { var ph = 1.15 + u * 0.9, R2 = 0.235; p.set((v * 2 - 1) * 0.07, RA[1] + Math.sin(ph) * R2, RA[2] + Math.cos(ph) * R2); }, true), null, blk);
    /* the side stand, out on the left */ cb.add(K.tube([[0.09, 0.33, -0.03], [0.16, 0.16, -0.05], [0.215, 0.012, -0.07]], 0.009, 8, 6), null, blk);
    [vmesh(pb, 'paint'), vmesh(kb, 'matte'), vmesh(cb, 'matte'), vmesh(rb, 'chrome'), vmesh(gb, 'glass')].forEach(function (m) { if (m) V.add(m); });
    V.rotation.z = -0.12; /* resting on the stand */ V.userData = { kind: 'parked', hw: 0.24, hd: 0.72 }; return V; }

  /* ---------- an airliner: an original twin-engine jet, white over pale grey, the tail in deep teal with an orange sweep ---------- */
  function airliner(o) { o = o || {}; var V = new THREE.Group(), pb = B(), cb = B(), gb = B(), rb = B(), teal = 0x1f6f8b, orange = 0xef7a1d, white = 0xf6f7f6, grey = 0xc9cdd1;
    var secs = smoothSecs([[0.0, 3.05, 0.02, 0.02, 2], [-0.03, 2.9, 0.17, 0.15, 2], [-0.01, 2.62, 0.28, 0.27, 2], [0.02, 2.2, 0.33, 0.33, 2], [0.02, -1.5, 0.33, 0.33, 2], [0.07, -2.2, 0.27, 0.27, 2], [0.18, -2.8, 0.13, 0.15, 2], [0.24, -3.05, 0.03, 0.04, 2]], 3);
    pb.add(loft(secs, 'z', 2, function (t, a, p) { var s = Math.sin(a); if (s < -0.45) return grey; if (s > 0.18 && s < 0.32 && p[2] < 2.45 && p[2] > -2.0) return 0x2b3440; if (s > 0.05 && s < 0.11 && p[2] < 2.5 && p[2] > -2.4) return orange; if (p[2] > 2.6 && s > 0.35 && s < 0.6 && Math.abs(Math.cos(a)) > 0.3) return 0x1e252c; return white; }, 40), null, 0xffffff);
    function wing(span, root, tip, sweep, th) { return K.ext([[0, root / 2], [span, root / 2 - sweep], [span, root / 2 - sweep - tip], [0, -root / 2]], th); }
    [1, -1].forEach(function (s) { var wg = wing(2.6, 1.1, 0.32, 1.25, 0.07); wg.rotateX(Math.PI / 2); if (s < 0) wg.scale(-1, 1, 1); pb.add(wg, { p: [s * 0.25, -0.16, 0.25], r: [0, 0, s * 0.08] }, white);
      var tw = wing(1.0, 0.55, 0.2, 0.5, 0.05); tw.rotateX(Math.PI / 2); if (s < 0) tw.scale(-1, 1, 1); pb.add(tw, { p: [s * 0.12, 0.2, -2.55], r: [0, 0, s * 0.06] }, white);
      cb.add(K.cyl(0.17, 0.15, 0.7, 18), { p: [s * 1.0, -0.38, 0.75], r: [Math.PI / 2, 0, 0] }, grey); gb.add(K.cyl(0.14, 0.14, 0.02, 18), { p: [s * 1.0, -0.38, 1.1], r: [Math.PI / 2, 0, 0] }, 0x1a1c1f); cb.add(K.box(0.05, 0.22, 0.5), { p: [s * 1.0, -0.22, 0.65] }, grey);
      if (o.gear !== false) { rb.add(K.cyl(0.03, 0.03, 0.3, 8), { p: [s * 0.45, -0.42, -0.1] }, 0x8a9096); cb.add(K.cyl(0.08, 0.08, 0.1, 12), { p: [s * 0.45, -0.6, -0.1], r: [0, 0, Math.PI / 2] }, 0x1a1b1d); } });
    var fin = K.ext([[0, 0], [1.05, 1.25], [1.5, 1.25], [1.45, 0]], 0.07); fin.rotateY(Math.PI / 2); pb.add(fin, { p: [0, 0.22, -1.75] }, teal);
    var sweep = K.ext([[0.5, 0.25], [1.12, 1.0], [1.3, 1.0], [0.75, 0.25]], 0.075); sweep.rotateY(Math.PI / 2); pb.add(sweep, { p: [0, 0.22, -1.75] }, orange);
    if (o.gear !== false) { rb.add(K.cyl(0.025, 0.025, 0.3, 8), { p: [0, -0.42, 2.3] }, 0x8a9096); cb.add(K.cyl(0.07, 0.07, 0.08, 12), { p: [0, -0.58, 2.3], r: [0, 0, Math.PI / 2] }, 0x1a1b1d); }
    [vmesh(pb, 'paint'), vmesh(cb, 'matte'), vmesh(gb, 'glass'), vmesh(rb, 'chrome')].forEach(function (m) { if (m) V.add(m); }); V.userData = { kind: 'plane', groundY: 0.64 }; return V; }

  /* ---------- (v42) the opening flight: Luna's chemistry glider, an escort jet, a flying saucer — all original designs ----------
     The glider is her own gadget, in the language of her portal: a white board with orange rails, a spine of hexagonal cells that glow,
     two small thrusters at the tail. The jet is an original twin-finned single-seater in two greys with orange fin tips (no markings, no
     stores). The saucer is the classic form: a lens of polished metal, a glass dome, a ring of lights round its rim and one beneath. */
  function glider() { var V = new THREE.Group(), pb = B(), gb = B(), db = B(), i;
    var secs = smoothSecs([[0, 1.02, 0.02, 0.012, 2], [0, 0.86, 0.15, 0.028, 2], [0, 0.5, 0.28, 0.042, 2.2], [0, 0.0, 0.33, 0.05, 2.5], [0, -0.55, 0.3, 0.048, 2.5], [0, -0.88, 0.22, 0.04, 2.2], [0, -1.0, 0.12, 0.028, 2]], 3);
    pb.add(loft(secs, 'z', 2, function (t, a, p) { var s = Math.sin(a), c = Math.abs(Math.cos(a)); if (s < -0.25) return 0x22262c; if (c > 0.9) return 0xef7a1d; return 0xf7f5f0; }, 40), null, 0xffffff);
    for (i = -3; i <= 3; i++) { var hz = i * 0.21, hw = 0.075 * (1 - Math.abs(i) * 0.06); gb.add(new THREE.CylinderGeometry(hw, hw, 0.014, 6), { p: [0, 0.052, hz], r: [0, Math.PI / 6, 0] }, i === 0 ? 0xffe2b0 : 0xff8a2a); if (Math.abs(i) < 3) [-1, 1].forEach(function (sx) { gb.add(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 6), { p: [sx * 0.13, 0.048, hz + 0.105], r: [0, Math.PI / 6, 0] }, 0xff7a1a); }); }
    [-1, 1].forEach(function (sx) { var fin = K.ext([[0, 0], [0.22, 0], [0.05, -0.16]], 0.02); fin.rotateY(Math.PI / 2); db.add(fin, { p: [sx * 0.14, -0.035, -0.62] }, 0x22262c); db.add(K.cyl(0.045, 0.06, 0.18, 12), { p: [sx * 0.1, -0.03, -0.98], r: [Math.PI / 2, 0, 0] }, 0x5a6066); gb.add(K.cyl(0.04, 0.04, 0.01, 12), { p: [sx * 0.1, -0.03, -1.075], r: [Math.PI / 2, 0, 0] }, 0xffb060); });
    [vmesh(pb, 'paint'), vmesh(db, 'chrome'), mesh(gb, M.lights)].forEach(function (m) { if (m) V.add(m); }); V.userData = { kind: 'glider', top: 0.05, tail: [0, -0.03, -1.1] }; return V; }
  function fighter() { var V = new THREE.Group(), pb = B(), db = B(), gb = B(), lb = B(), lg = 0xb2b9bf, dg = 0x5f686f, acc = 0xef7a1d;
    var secs = smoothSecs([[0.03, 3.3, 0.02, 0.02, 2], [0.01, 3.0, 0.1, 0.09, 2], [0.0, 2.4, 0.21, 0.19, 2], [0.02, 1.6, 0.3, 0.26, 2.2], [0.0, 0.6, 0.44, 0.27, 2.6], [0.0, -0.8, 0.47, 0.25, 2.8], [0.0, -2.2, 0.4, 0.2, 2.6], [0.0, -2.8, 0.35, 0.17, 2.4], [0.0, -2.95, 0.31, 0.15, 2.2]], 3);
    pb.add(loft(secs, 'z', 2, function (t, a) { return Math.sin(a) < -0.35 ? dg : lg; }, 32), null, 0xffffff);
    gb.add(K.sph(1, 18, 10), { p: [0, 0.22, 1.7], s: [0.18, 0.17, 0.62] }, 0x1a2834);
    function wing(span, root, tip, sweep, th) { return K.ext([[0, root / 2], [span, root / 2 - sweep], [span, root / 2 - sweep - tip], [0, -root / 2]], th); }
    [1, -1].forEach(function (sx) { var w = wing(2.3, 3.0, 0.55, 2.15, 0.07); w.rotateX(Math.PI / 2); if (sx < 0) w.scale(-1, 1, 1); pb.add(w, { p: [sx * 0.36, -0.02, -0.55] }, lg);
      var lx = K.ext([[0, 1.1], [0.32, -0.1], [0.32, -0.4], [0, -0.4]], 0.04); lx.rotateX(Math.PI / 2); if (sx < 0) lx.scale(-1, 1, 1); pb.add(lx, { p: [sx * 0.3, 0.0, 1.05] }, lg);
      var hs = wing(1.15, 1.05, 0.4, 0.75, 0.05); hs.rotateX(Math.PI / 2); if (sx < 0) hs.scale(-1, 1, 1); pb.add(hs, { p: [sx * 0.32, -0.04, -2.35] }, lg);
      var fin = K.ext([[0, 0], [0.95, 1.25], [1.32, 1.25], [1.5, 0]], 0.06); fin.rotateY(Math.PI / 2); pb.add(fin, { p: [sx * 0.3, 0.16, -1.55], r: [0, 0, -sx * 0.32] }, lg); db.add(K.box(0.07, 0.12, 0.36), { p: [sx * (0.3 + 0.42), 0.16 + 1.18, -1.55 - 1.13], r: [0, 0, -sx * 0.32] }, acc);
      db.add(K.box(0.24, 0.32, 1.5), { p: [sx * 0.43, -0.1, 0.8] }, dg); db.add(K.box(0.2, 0.26, 0.04), { p: [sx * 0.43, -0.1, 1.56] }, 0x15181b);
      db.add(K.cyl(0.17, 0.15, 0.42, 16), { p: [sx * 0.19, 0.0, -3.08], r: [Math.PI / 2, 0, 0] }, 0x3b4046); lb.add(K.cyl(0.12, 0.12, 0.02, 16), { p: [sx * 0.19, 0.0, -3.3], r: [Math.PI / 2, 0, 0] }, 0xff9a40);
      lb.add(K.sph(0.05, 8, 6), { p: [sx * 2.68, -0.02, -1.95] }, sx > 0 ? 0x30ff6a : 0xff2a2a); });
    [vmesh(pb, 'paint'), vmesh(db, 'matte'), mesh(gb, M.glass), mesh(lb, M.lights)].forEach(function (m) { if (m) V.add(m); });
    var bm = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }); KIT.curved(bm); var burners = [-1, 1].map(function (sx) { var c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 1.4, 12, 1, true), bm); c.rotation.x = -Math.PI / 2; c.position.set(sx * 0.19, 0, -3.95); c.renderOrder = 4; V.add(c); return c; });
    V.userData = { kind: 'jet', burners: burners, tips: [[2.68, -0.02, -1.95], [-2.68, -0.02, -1.95]], tails: [[0.19, 0, -3.3], [-0.19, 0, -3.3]] }; return V; }
  /* (v44) a second original jet for the formation: a tailless cranked delta with canards and a single fin, in a deep blue-grey with an
     orange chevron on the fin and the wing tips; one engine, a wider burner. No markings, no stores. */
  function fighter2() { var V = new THREE.Group(), pb = B(), db = B(), gb = B(), lb = B(), bl = 0x3d4a5a, dk = 0x2a323c, acc = 0xef7a1d;
    var secs = smoothSecs([[0.02, 3.4, 0.02, 0.02, 2], [0.0, 3.1, 0.09, 0.09, 2], [0.0, 2.4, 0.2, 0.19, 2.2], [0.0, 1.5, 0.31, 0.27, 2.6], [0.0, 0.4, 0.42, 0.3, 3.0], [0.0, -1.0, 0.44, 0.28, 3.0], [0.0, -2.3, 0.36, 0.22, 2.6], [0.0, -2.9, 0.26, 0.17, 2.2], [0.0, -3.05, 0.2, 0.14, 2]], 3);
    pb.add(loft(secs, 'z', 2, function (t, a) { return Math.sin(a) < -0.3 ? dk : bl; }, 32), null, 0xffffff);
    gb.add(K.sph(1, 18, 10), { p: [0, 0.2, 1.75], s: [0.17, 0.16, 0.6] }, 0x16222c);
    [1, -1].forEach(function (sx) { var w = K.ext([[0, 1.6], [1.2, -0.3], [2.6, -1.45], [2.6, -2.0], [0, -2.0]], 0.07); w.rotateX(Math.PI / 2); if (sx < 0) w.scale(-1, 1, 1); pb.add(w, { p: [sx * 0.34, -0.03, -0.2] }, bl);
      db.add(K.box(0.1, 0.09, 0.42), { p: [sx * 2.88, -0.03, -1.95] }, acc); var cn = K.ext([[0, 0.3], [0.75, -0.05], [0.75, -0.25], [0, -0.3]], 0.05); cn.rotateX(Math.PI / 2); if (sx < 0) cn.scale(-1, 1, 1); pb.add(cn, { p: [sx * 0.33, 0.04, 1.35] }, bl);
      db.add(K.box(0.22, 0.3, 1.3), { p: [sx * 0.4, -0.12, 0.5] }, dk); db.add(K.box(0.18, 0.24, 0.04), { p: [sx * 0.4, -0.12, 1.16] }, 0x121518); lb.add(K.sph(0.05, 8, 6), { p: [sx * 2.9, 0.03, -2.2] }, sx > 0 ? 0x30ff6a : 0xff2a2a); });
    var fin = K.ext([[0, 0], [0.85, 1.35], [1.25, 1.35], [1.55, 0]], 0.06); fin.rotateY(Math.PI / 2); pb.add(fin, { p: [0, 0.2, -1.75] }, bl); var chev = K.ext([[0.55, 0.55], [0.95, 1.2], [1.18, 1.2], [0.8, 0.55]], 0.065); chev.rotateY(Math.PI / 2); pb.add(chev, { p: [0, 0.2, -1.75] }, acc);
    db.add(K.cyl(0.24, 0.21, 0.5, 18), { p: [0, 0.0, -3.2], r: [Math.PI / 2, 0, 0] }, 0x3b4046); lb.add(K.cyl(0.17, 0.17, 0.02, 18), { p: [0, 0.0, -3.46], r: [Math.PI / 2, 0, 0] }, 0xff9a40);
    [vmesh(pb, 'paint'), vmesh(db, 'matte'), mesh(gb, M.glass), mesh(lb, M.lights)].forEach(function (m) { if (m) V.add(m); });
    var bm = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }); KIT.curved(bm); var c = new THREE.Mesh(new THREE.ConeGeometry(0.19, 1.7, 12, 1, true), bm); c.rotation.x = -Math.PI / 2; c.position.set(0, 0, -4.25); c.renderOrder = 4; V.add(c);
    V.userData = { kind: 'jet', burners: [c], tips: [[2.9, 0.03, -2.2], [-2.9, 0.03, -2.2]], tails: [[0, 0, -3.46]] }; return V; }
  /* (v44) the vapour cone of a transonic pass: a soft white cone, open at the back, faded towards its rim */
  function vaporCone() { var c = document.createElement('canvas'); c.width = 16; c.height = 128; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.75)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 16, 128);
    var m = new THREE.Mesh(new THREE.ConeGeometry(2.6, 5.5, 36, 1, true), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false, opacity: 0 })); m.geometry.rotateX(Math.PI / 2); m.geometry.translate(0, 0, -1.2); m.renderOrder = 5; KIT.curved(m.material); return m; }
  function ufo() { var V = new THREE.Group(), pb = B(), gb = B(), i;
    var prof = [[0.001, -0.44], [0.8, -0.4], [1.8, -0.2], [2.55, -0.05], [2.75, 0.0], [2.6, 0.07], [1.9, 0.22], [1.15, 0.34], [0.001, 0.38]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    pb.add(new THREE.LatheGeometry(prof, 56), null, 0xc4ccd4); pb.add(new THREE.TorusGeometry(2.66, 0.05, 8, 56), { r: [Math.PI / 2, 0, 0] }, 0x8a949e);
    var dome = new THREE.SphereGeometry(1.05, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2); gb.add(dome, { p: [0, 0.34, 0], s: [1, 0.72, 1] }, 0x6ad8ff);
    var rim = new THREE.Group(), rb = B(); for (i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2; rb.add(K.sph(0.11, 8, 6), { p: [Math.cos(a) * 2.5, 0.04, Math.sin(a) * 2.5] }, [0x3af0ff, 0xff4ad8, 0xfff06a][i % 3]); } rim.add(mesh(rb, M.lights)); V.add(rim);
    var under = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.1, 8, 40), new THREE.MeshBasicMaterial({ color: 0x7af6ff, toneMapped: false })); under.rotation.x = Math.PI / 2; under.position.y = -0.4; KIT.curved(under.material); V.add(under);
    [vmesh(pb, 'paint'), mesh(gb, M.glass)].forEach(function (m) { if (m) V.add(m); }); V.userData = { kind: 'ufo', rim: rim, under: under }; return V; }

  /* ---------- the ferry ---------- */
  function ferry() { /* an original passenger ferry: a lofted hull with sheer and flare, a deck cut to the hull's own outline, rails,
     two decks of cabins with their window bands, the bridge, the funnel, lifeboats on davits, life rings, the stern ramp. Waterline y = 0, bow +z. */
    var b = B(), g = B(), l = B(), d = B(), i, LEN = 6.6, HB = 1.0;
    function hw(u) { var w = HB; if (u < 0.1) w *= 0.88 + 0.12 * (u / 0.1); if (u > 0.6) { var t = (u - 0.6) / 0.4; w *= Math.max(0.02, Math.cos(Math.pow(t, 1.3) * Math.PI / 2)); } return w; }
    function sheer(u) { return 0.6 + Math.pow(Math.max(0, u - 0.55) / 0.45, 2) * 0.3 + Math.max(0, 0.08 - u) * 0.6; }
    function keel(u) { return -0.32 + Math.pow(Math.max(0, u - 0.78) / 0.22, 2.2) * 0.56; }
    function uz(z) { return Math.max(0, Math.min(1, z / LEN + 0.5)); }
    var hullCol = function (x, y, z) { var u = uz(z), top = sheer(u), dd = top - y; if (dd < 0.06) return 0xf4f4f0; if (dd < 0.15) return 0xef7a1d; if (y > 0.1) return 0xf6f6f2; if (y > -0.03) return 0x22313f; return 0xa8342a; };
    var hull = K.surf(56, 18, function (u, v, p) { var z = (u - 0.5) * LEN, w = hw(u), top = sheer(u), bot = keel(u), a = v * Math.PI, c = Math.cos(a), sn = Math.sin(a), n = 5.2;
      p.set(Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * w, top - (top - bot) * Math.pow(sn, 2 / n), z); }, true);
    b.add(hull, null, hullCol);
    /* the transom: the stern closed by a flat plate shaped to the section */
    var tp = []; for (i = 0; i <= 18; i++) { var a0 = i / 18 * Math.PI, c0 = Math.cos(a0), s0 = Math.sin(a0); tp.push(new THREE.Vector2(Math.sign(c0) * Math.pow(Math.abs(c0), 2 / 5.2) * hw(0), sheer(0) - (sheer(0) - keel(0)) * Math.pow(s0, 2 / 5.2))); }
    var tg = new THREE.ShapeGeometry(new THREE.Shape(tp)); [0, Math.PI].forEach(function (ry) { b.add(tg, { p: [0, 0, -LEN / 2 + 0.002], r: [0, ry, 0] }, function (x, y, z) { return y > sheer(0) - 0.15 && y < sheer(0) - 0.06 ? 0xef7a1d : y > 0.1 ? 0xf6f6f2 : y > -0.03 ? 0x22313f : 0xa8342a; }); });
    /* the deck: the hull's own outline at its sheer */
    var dp = [], nU = 40; for (i = 0; i <= nU; i++) { var u1 = 0.005 + i / nU * 0.985; dp.push(new THREE.Vector2(hw(u1) * 0.985, -((u1 - 0.5) * LEN))); } for (i = nU; i >= 0; i--) { var u2 = 0.005 + i / nU * 0.985; dp.push(new THREE.Vector2(-hw(u2) * 0.985, -((u2 - 0.5) * LEN))); }
    var dg = new THREE.ShapeGeometry(new THREE.Shape(dp), 2); dg.rotateX(-Math.PI / 2); var dpa = dg.attributes.position; for (i = 0; i < dpa.count; i++) dpa.setY(i, sheer(uz(dpa.getZ(i))) - 0.012); dg.computeVertexNormals(); b.add(dg, null, 0xa9b8b0);
    /* the rails: two rails on stanchions along both sides, a solid bulwark at the bow */
    [1, -1].forEach(function (sd) { var top = [], mid = []; for (i = 0; i <= 30; i++) { var u3 = 0.02 + i / 30 * 0.76, z3 = (u3 - 0.5) * LEN, x3 = sd * hw(u3) * 0.97, y3 = sheer(u3); top.push([x3, y3 + 0.27, z3]); mid.push([x3, y3 + 0.14, z3]); if (i % 2 === 0) b.add(K.cyl(0.012, 0.012, 0.27, 6), { p: [x3, y3 + 0.135, z3] }, 0xf2f2ee); }
      b.add(K.tube(top, 0.018, 40, 6), null, 0xf6f6f2); b.add(K.tube(mid, 0.011, 40, 5), null, 0xf6f6f2);
      var bw = K.surf(16, 1, function (u, v, p) { var u4 = 0.77 + u * 0.225, z4 = (u4 - 0.5) * LEN, x4 = sd * hw(u4) * 0.985, y4 = sheer(u4); p.set(x4, y4 + v * 0.28, z4); }, true); b.add(bw, null, 0xf6f6f2); });
    /* the cabins: the main deckhouse and its window band, the promenade roof, the bridge with its wrap-round windows, the funnel */
    var D0 = sheer(0.45);
    b.add(K.rbox(1.5, 0.62, 3.0, 0.12, 3), { p: [0, D0 + 0.31, -0.45] }, 0xfbfbf8); g.add(K.rbox(1.52, 0.2, 2.72, 0.08, 2), { p: [0, D0 + 0.4, -0.45] }, 0x2d4a5c); l.add(K.box(1.46, 0.14, 2.66), { p: [0, D0 + 0.4, -0.45] }, 0xffe6b8);
    b.add(K.rbox(1.8, 0.06, 3.4, 0.03, 2), { p: [0, D0 + 0.65, -0.5] }, 0xf0f0ec);
    [1, -1].forEach(function (sd) { var tr = []; for (i = 0; i <= 8; i++) tr.push([sd * 0.86, D0 + 0.9, -2.15 + i * 0.41]); b.add(K.tube(tr, 0.014, 10, 5), null, 0xf6f6f2); for (i = 0; i <= 8; i += 2) b.add(K.cyl(0.01, 0.01, 0.24, 5), { p: [sd * 0.86, D0 + 0.78, -2.15 + i * 0.41] }, 0xf6f6f2); });
    b.add(K.rbox(1.3, 0.46, 1.4, 0.1, 3), { p: [0, D0 + 0.91, 0.25] }, 0xfbfbf8); g.add(K.rbox(1.32, 0.17, 1.36, 0.06, 2), { p: [0, D0 + 0.98, 0.27] }, 0x2d4a5c); l.add(K.box(1.26, 0.11, 1.3), { p: [0, D0 + 0.98, 0.27] }, 0xffe6b8);
    b.add(K.rbox(1.62, 0.05, 0.5, 0.02, 2), { p: [0, D0 + 1.16, 0.62] }, 0xf0f0ec); b.add(K.rbox(1.42, 0.05, 1.52, 0.02, 2), { p: [0, D0 + 1.16, 0.25] }, 0xf0f0ec);
    var fun = K.cyl(0.19, 0.25, 0.62, 18); fun.scale(0.72, 1, 1); b.add(fun, { p: [0, D0 + 0.98, -1.35], r: [-0.1, 0, 0] }, 0xef7a1d); var fb = K.cyl(0.195, 0.2, 0.1, 18); fb.scale(0.72, 1, 1); b.add(fb, { p: [0, D0 + 1.25, -1.38], r: [-0.1, 0, 0] }, 0x22313f);
    b.add(K.cyl(0.018, 0.022, 0.72, 6), { p: [0, D0 + 1.52, 0.3] }, 0xf2f2ee); b.add(K.box(0.4, 0.02, 0.02), { p: [0, D0 + 1.7, 0.3] }, 0xf2f2ee); l.add(K.sph(0.03, 8, 6), { p: [0, D0 + 1.9, 0.3] }, 0xfff6e0); l.add(K.sph(0.025, 8, 6), { p: [0.2, D0 + 1.7, 0.3] }, 0x40e070); l.add(K.sph(0.025, 8, 6), { p: [-0.2, D0 + 1.7, 0.3] }, 0xff4030);
    /* lifeboats on davits, life rings */
    [1, -1].forEach(function (sd) { var lb = new THREE.CapsuleGeometry(0.12, 0.5, 4, 10); lb.rotateX(Math.PI / 2); lb.scale(1, 0.8, 1); b.add(lb, { p: [sd * 0.84, D0 + 0.82, -1.1] }, 0xf07a1a); b.add(K.box(0.26, 0.03, 0.66), { p: [sd * 0.84, D0 + 0.9, -1.1] }, 0xf6f6f2);
      [-1.38, -0.82].forEach(function (z5) { b.add(K.tube([[sd * 0.62, D0 + 0.66, z5], [sd * 0.74, D0 + 1.02, z5], [sd * 0.86, D0 + 0.96, z5]], 0.012, 8, 5), null, 0xd8d8d4); });
      [1.25, -2.6].forEach(function (z6) { var u6 = uz(z6), x6 = sd * (hw(u6) * 0.97 + 0.01); b.add(new THREE.TorusGeometry(0.07, 0.018, 8, 18), { p: [x6, sheer(u6) + 0.2, z6], r: [0, Math.PI / 2, 0] }, 0xf07a1a); }); });
    /* the stern: the ramp, the flagstaff and its pennant; the bow: bollards, the anchor */
    b.add(K.box(1.1, 0.04, 0.42), { p: [0, sheer(0) + 0.17, -LEN / 2 - 0.12], r: [-1.25, 0, 0] }, 0x8a8e92); b.add(K.cyl(0.01, 0.012, 0.62, 6), { p: [0, sheer(0) + 0.3, -LEN / 2 + 0.2] }, 0xf2f2ee); b.add(K.box(0.012, 0.12, 0.26), { p: [0, sheer(0) + 0.54, -LEN / 2 + 0.07] }, 0xef7a1d);
    [[0.32, 2.35], [-0.32, 2.35], [0.6, -2.7], [-0.6, -2.7]].forEach(function (q) { var u7 = uz(q[1]); b.add(K.cyl(0.04, 0.05, 0.12, 8), { p: [q[0], sheer(u7) + 0.05, q[1]] }, 0x2b2b2e); });
    [1, -1].forEach(function (sd) { var u8 = 0.9, z8 = (u8 - 0.5) * LEN; b.add(K.cyl(0.05, 0.05, 0.03, 10), { p: [sd * (hw(u8) + 0.005), sheer(u8) - 0.2, z8], r: [0, 0, Math.PI / 2] }, 0x2b2b2e); });
    /* the name on both bows */
    var nm = K.ctex(512, 96, function (g2, w, h) { g2.clearRect(0, 0, w, h); g2.fillStyle = '#22313f'; g2.font = '900 54px "Noto Sans TC", "PingFang TC", sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText('澎湖號 · PENGHU', w / 2, h / 2 + 2); });
    var nmat = K.std({ map: nm, transparent: true, alphaTest: 0.3, rough: 0.6 }); var nms = [];
    [1, -1].forEach(function (sd) { var u9 = 0.74, z9 = (u9 - 0.5) * LEN, x9 = sd * (hw(u9) + 0.012), slope = (hw(u9 + 0.01) - hw(u9 - 0.01)) / (0.02 * LEN), pm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.17), nmat); pm.position.set(x9, sheer(u9) - 0.3, z9); pm.rotation.y = sd > 0 ? Math.PI / 2 + Math.atan(slope) : -Math.PI / 2 - Math.atan(slope); nms.push(pm); });
    var grp2 = grp([mesh(b, M.gloss), mesh(g, M.glass), mesh(l, M.lights)].concat(nms)); KIT.curved(nmat);
    grp2.rotation.order = 'YXZ'; grp2.scale.setScalar(1.5); /* a ship the size of the island's people */ grp2.userData.deck = function (z) { return sheer(uz(z)); }; grp2.userData.spots = { luna: [0.3, 1.95], dog: [-0.26, 1.75] }; grp2.userData.len = LEN; return grp2; }
  /* ---------- a balloon ---------- */
  function balloon(col) { var b = B(), c2 = lin(col), white = lin(0xffffff);
    var env = K.lathe([[0.001, 0.0], [0.35, 0.05], [0.9, 0.6], [1.15, 1.4], [1.1, 2.1], [0.75, 2.6], [0.001, 2.75]], 24); b.add(env, { p: [0, 1.0, 0] }, function (x, y, z) { var a = Math.atan2(x, z); return Math.floor((a + Math.PI) / (Math.PI * 2) * 12) % 2 ? c2 : white; });
    b.add(K.rbox(0.42, 0.32, 0.42, 0.04, 2), { p: [0, 0.16, 0] }, 0x8a6440); [[0.18, 0.18], [-0.18, 0.18], [0.18, -0.18], [-0.18, -0.18]].forEach(function (q) { b.add(K.cyl(0.008, 0.008, 0.8, 4), { p: [q[0] * 1.2, 0.68, q[1] * 1.2] }, 0x5a5a5a); });
    return grp([mesh(b, M.gloss)]); }
  /* ---------- the little red train of Alishan ---------- */
  function aliTrain() { var b = B(); [0, 1, 2].forEach(function (i) { var x = -i * 0.95; b.add(K.rbox(0.85, 0.5, 0.48, 0.06, 2), { p: [x, 0.36, 0] }, i ? 0xc8302a : 0xb8221e); b.add(K.box(0.86, 0.06, 0.5), { p: [x, 0.45, 0] }, 0xf2e6c8); b.add(K.rbox(0.9, 0.06, 0.52, 0.02, 2), { p: [x, 0.64, 0] }, 0x5a3a2a); }); b.add(K.sph(0.05, 8, 6), { p: [0.45, 0.35, 0] }, 0xfff2c0); return grp([mesh(b, M.gloss)]); }
  /* ---------- a turbine rotor ---------- */
  function rotor() { var b = B(); for (var i = 0; i < 3; i++) { var a = i / 3 * Math.PI * 2; b.add(K.ext([[0, -0.06], [2.6, -0.02], [2.7, 0.03], [0, 0.08]], 0.03), { r: [0, 0, a] }, 0xf6f6f4); } b.add(K.sph(0.14, 10, 8), null, 0xf6f6f4); return grp([mesh(b, M.gloss)]); }

  /* ---------- the bosses ---------- */
  function waterMat() { return K.std({ color: 0x3fa6d8, rough: 0.1, metal: 0.1, transparent: true, opacity: 0.82, emissive: 0x0a3a6a, ei: 0.6, env: 1.6 }); }
  function bossDragon() { var root = new THREE.Group(), segs = [], wm = waterMat(), foam = K.std({ color: 0xffffff, rough: 0.6, emissive: 0x88ccff, ei: 0.25 }), crack = K.basic({ color: 0xffb04a }), i;
    for (i = 0; i < 14; i++) { var r = 0.55 * (1 - i / 18), s = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), wm); s.castShadow = true; var fm = new THREE.Mesh(new THREE.ConeGeometry(r * 0.35, r * 0.9, 8), foam); fm.position.y = r * 0.85; s.add(fm); root.add(s); segs.push(s); }
    var head = new THREE.Group(), hb = new THREE.Mesh(K.rbox(1.1, 0.7, 1.5, 0.3, 3), wm); head.add(hb); var jaw = new THREE.Mesh(K.rbox(0.9, 0.22, 1.2, 0.1, 2), wm); jaw.position.set(0, -0.42, 0.18); head.add(jaw);
    [-0.32, 0.32].forEach(function (x) { var e = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), crack); e.position.set(x, 0.16, 0.66); e.scale.set(1, 0.6, 0.5); head.add(e); var h2 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.6, 8), foam); h2.position.set(x * 1.2, 0.5, -0.3); h2.rotation.x = -0.6; head.add(h2); });
    var ck = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.02), crack); ck.position.set(0.1, 0.1, 0.76); ck.rotation.z = 0.5; head.add(ck); root.add(head);
    var B2 = { root: root, segs: segs, head: head, jaw: jaw, t: 0, rise: 0, h: 4.2 };
    B2.update = function (dt, st) { B2.t += dt; var t = B2.t, i2; for (i2 = 0; i2 < segs.length; i2++) { var u = i2 / segs.length, a = t * 1.3 - u * 5; segs[i2].position.set(Math.sin(a) * (1.4 + u * 1.6), (-0.4 + Math.sin(a * 0.7) * 0.4 + (1 - u) * 2.6) * B2.rise - (1 - B2.rise) * 3, Math.cos(a * 0.8) * 1.2 - u * 2.4); }
      head.position.copy(segs[0].position); head.position.y += 0.7 * B2.rise + (st && st.atk ? 0.3 : 0); head.lookAt(st && st.target ? st.target : new V3(0, 0, 10)); jaw.rotation.x = (st && st.atk ? 0.5 : 0.1) + Math.sin(t * 6) * 0.05; };
    return B2; }
  function bossGolem() { var root = new THREE.Group(), b = B(), c = B(), i, r = K.seeded(4);
    b.add(K.rbox(1.6, 1.4, 1.0, 0.12, 2), { p: [0, 2.0, 0] }, 0x9c968c); b.add(K.rbox(0.9, 0.7, 0.8, 0.1, 2), { p: [0, 3.0, 0.05] }, 0xa8a296); b.add(K.rbox(1.2, 0.5, 0.8, 0.1, 2), { p: [0, 1.15, 0] }, 0x8e887e);
    for (i = 0; i < 14; i++) { var y = 1.2 + r() * 2.0, x = (r() - 0.5) * 1.4, ry = r() * 3; c.add(K.box(0.05, 0.3 + r() * 0.4, 0.04), { p: [x, y, 0.52], r: [0, 0, ry] }, 0xffa040); }
    [-0.2, 0.2].forEach(function (x) { c.add(K.box(0.16, 0.08, 0.04), { p: [x, 3.08, 0.46] }, 0xffd070); });
    var body = grp([b.mesh(M.vc), c.mesh(M.lights)]); root.add(body);
    var arms = [-1, 1].map(function (sd) { var a = new THREE.Group(); a.position.set(sd * 1.05, 2.5, 0); var ab = B(); ab.add(K.rbox(0.45, 1.1, 0.45, 0.1, 2), { p: [0, -0.5, 0] }, 0x948e84); ab.add(K.rbox(0.7, 0.6, 0.7, 0.16, 2), { p: [0, -1.25, 0] }, 0x8a8478); a.add(ab.mesh(M.vc)); root.add(a); return a; });
    var legs = [-1, 1].map(function (sd) { var l = new THREE.Group(); l.position.set(sd * 0.42, 0.95, 0); var lb = B(); lb.add(K.rbox(0.5, 0.95, 0.55, 0.1, 2), { p: [0, -0.47, 0] }, 0x8e887e); l.add(lb.mesh(M.vc)); root.add(l); return l; });
    var B2 = { root: root, arms: arms, legs: legs, body: body, t: 0, h: 3.4 };
    B2.update = function (dt, st) { B2.t += dt; var t = B2.t, w = st && st.moving ? 1 : 0; legs[0].rotation.x = Math.sin(t * 4) * 0.4 * w; legs[1].rotation.x = -Math.sin(t * 4) * 0.4 * w; body.position.y = Math.abs(Math.sin(t * 4)) * 0.06 * w; arms[0].rotation.x = st && st.atk ? -2.4 * st.atkK : Math.sin(t * 4) * 0.3 * w; arms[1].rotation.x = st && st.atk ? -2.4 * st.atkK : -Math.sin(t * 4) * 0.3 * w; };
    return B2; }
  function bossSun() { var root = new THREE.Group(), core = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 24), K.std({ color: 0xffb02a, rough: 0.4, emissive: 0xff7a10, ei: 1.6 })), salt = K.std({ color: 0xf6f8fa, rough: 0.2, metal: 0.1, env: 1.4 }), halo = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.06, 8, 48), K.basic({ color: 0xffd060 })), i;
    root.add(core); halo.rotation.x = Math.PI / 2; root.add(halo); var spikes = new THREE.Group(); for (i = 0; i < 14; i++) { var sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), salt); var a = i / 14 * Math.PI * 2, e = (i % 3 - 1) * 0.6; sp.position.set(Math.cos(a) * 1.15 * Math.cos(e), Math.sin(e) * 1.1, Math.sin(a) * 1.15 * Math.cos(e)); sp.scale.set(0.6, 1.5, 0.6); sp.lookAt(0, 0, 0); spikes.add(sp); } root.add(spikes);
    [-0.32, 0.32].forEach(function (x) { var e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), K.basic({ color: 0x3a1a0a })); e.position.set(x, 0.18, 0.88); e.scale.set(1, 1.4, 0.4); root.add(e); });
    var B2 = { root: root, core: core, spikes: spikes, halo: halo, t: 0, h: 3.2 }; B2.update = function (dt, st) { B2.t += dt; spikes.rotation.y += dt * 0.8; halo.rotation.z += dt * 1.2; core.position.y = 2.2 + Math.sin(B2.t * 1.6) * 0.25; spikes.position.y = core.position.y; halo.position.y = core.position.y; root.children.forEach(function (o) { if (o.geometry && o.geometry.type === 'SphereGeometry' && o !== core) o.position.y = core.position.y + 0.18; }); };
    return B2; }
  /* ---------- the gear ---------- */
  function gearBlade() { var b = B(); b.add(K.cyl(0.018, 0.018, 0.2, 8), { p: [0, -0.02, 0] }, 0x5a3a2a); b.add(K.box(0.12, 0.03, 0.03), { p: [0, 0.08, 0] }, 0xef7a1d); b.add(K.ext([[-0.05, 0], [0.05, 0], [0.09, 0.42], [0, 0.5], [-0.09, 0.42]], 0.012), { p: [0, 0.1, 0] }, 0xdfe6ea); b.add(K.box(0.012, 0.36, 0.016), { p: [0.075, 0.3, 0], r: [0, 0, -0.1] }, 0xef7a1d); var g = grp([b.mesh(M.gloss)]); g.rotation.x = Math.PI / 2; g.rotation.z = Math.PI; return g; }
  function gearShield() { var b = B(); b.add(K.cyl(0.13, 0.13, 0.03, 28), { r: [Math.PI / 2, 0, 0] }, 0xf6f6f2); b.add(K.cyl(0.136, 0.136, 0.036, 28, true), { r: [Math.PI / 2, 0, 0] }, 0xef7a1d); var em = LUNA.emblemGeo(0.12, 0.03); b.add(em, { p: [0, 0, 0.02] }, 0xef7a1d); var g = grp([b.mesh(M.gloss)]); g.rotation.y = Math.PI / 2; return g; }
  function gearCape() { var b = B(); var cape = K.surf(10, 12, function (u, v, p) { var x = (u - 0.5) * 0.26 * (1 + v * 0.7), y = -v * 0.48, z = -0.02 - Math.sin(u * Math.PI) * 0.05 - v * 0.04 + Math.sin(u * 9) * 0.008; p.set(x, y, z); }, true); b.add(cape, null, 0x3a8a9a); b.add(K.box(0.24, 0.03, 0.03), null, 0xef7a1d); var g = grp([b.mesh(M.gloss)]); return g; }

  /* ---------- the world's moving things ---------- */
  function world(W, ctx) { K = ctx.K; M = ctx.M; var G = ctx.G, scene = ctx.scene;
    /* two trains run the line, one each way */ var L = W.rail[W.rail.length - 1][3]; W.trains = [];
    [[0.15, 1], [0.7, -1]].forEach(function (q) { var T = train(6); scene.add(T.group); T.s = L * q[0]; T.dir = q[1]; T.wait = 0; T.v = 0; W.trains.push(T); });
    var stopS = Object.keys(W.stops).map(function (k) { return W.stops[k].s; }).sort(function (a, b) { return a - b; });
    W.anim.push(function (dt) { W.trains.forEach(function (T) { if (T.player) return; if (T.wait > 0) { T.wait -= dt; return; } var next = null; stopS.forEach(function (s) { if ((s - T.s) * T.dir > 0.5 && (next == null || Math.abs(s - T.s) < Math.abs(next - T.s))) next = s; }); var vmax = 26, dist = next == null ? 999 : Math.abs(next - T.s); T.v = Math.min(vmax, Math.max(2.5, Math.sqrt(dist * 2 * 6)), T.v + dt * 7); T.s += T.dir * T.v * dt; if (next != null && dist < 0.4) { T.s = next; T.v = 0; T.wait = 4; } if (T.s > L - 3 && T.dir > 0) { T.dir = -1; T.wait = 5; } if (T.s < 0 && T.dir < 0) { T.dir = 1; T.wait = 5; T.s = 0; } placeTrain(T, W.railAt, T.s, T.dir); }); });
    /* the ferries: one alongside each pier, rocking gently; the journey takes the one at the pier where it starts (W.ferries by port) */
    W.ferries = {}; ['port', 'magong'].forEach(function (id) { var pl = W.places[id]; if (!pl || !pl.dock) return; var F2 = ferry(); F2.position.set(pl.dock[0], 0, pl.dock[1]); F2.rotation.set(0, pl.dockRot, 0); F2.userData.at = id; scene.add(F2); W.ferries[id] = F2; F2.traverse(function (o) { if (o.isMesh) o.castShadow = true; }); });
    W.anim.push(function (dt, t) { Object.keys(W.ferries).forEach(function (k, n) { var F3 = W.ferries[k]; if (F3.userData.busy) return; F3.position.y = Math.sin(t * 1.1 + n * 2) * 0.035; F3.rotation.z = Math.sin(t * 0.9 + n) * 0.012; F3.rotation.x = Math.sin(t * 0.7 + n) * 0.006; }); });
    /* the balloons */ (W.balloons || []).forEach(function (bl, k) { var m = balloon(bl.col); m.position.set(bl.x, bl.y, bl.z); scene.add(m); bl.m = m; if (!k) W.colliders.push({ x: bl.x, z: bl.z, r: 0.32 }); /* the tethered basket is solid */ W.anim.push(function (dt, t) { if (bl.busy) return; m.position.y = bl.y + 0.4 + Math.sin(t * 0.6 + k) * 0.25 + (k ? 3 + k * 0.8 : 0); }); });
    /* Alishan's little train */ if (W.aliTrack) { var at = W.aliTrack, tr = aliTrain(), a0 = 0; scene.add(tr); W.anim.push(function (dt) { a0 += dt * 0.35; var x = at.cx + Math.cos(a0) * at.R, z = at.cz + Math.sin(a0) * at.R * 0.7, wp = at.S.toW(x, z), dx = -Math.sin(a0) * at.R, dz = Math.cos(a0) * at.R * 0.7; tr.position.set(wp[0], at.y + 0.02, wp[1]); tr.rotation.y = at.S.rot + Math.atan2(dz, -dx) + Math.PI / 2 * 0; tr.rotation.y = at.S.rot + Math.atan2(dx, dz) - Math.PI / 2; }); }
    /* the owner's car and superbike, parked beside the Good Startup counter */ var gsP = W.places.txg; if (gsP && gsP.frame) { var GS = gsP.frame;
      [[crossover(), -4.33, 7.2], [superbike(), -3.12, 7.05]].forEach(function (q) { var o = q[0], wp = GS.toW(q[1], q[2]), wrap = new THREE.Group(); wrap.add(o); wrap.position.set(wp[0], (G && G.height ? G.height(wp[0], wp[1]) : GS.y) + 0.005, wp[1]); wrap.rotation.y = GS.rot; scene.add(wrap); o.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
        W.colliders.push({ x: wp[0], z: wp[1], hw: o.userData.hw, hd: o.userData.hd, rot: GS.rot }); }); }
    /* the turbines */ (W.turbines || []).forEach(function (tb, k) { var r = rotor(); r.position.set(tb.x, tb.y, tb.z); scene.add(r); W.anim.push(function (dt) { r.rotation.z += dt * (0.9 + k * 0.07); }); });
    /* fireworks over Magong at night */ if (W.fireworks) { var N = 240, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3)); var pm = new THREE.PointsMaterial({ size: 0.6, map: KIT.glowTex(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }); /* round, soft sparks */ var pts = new THREE.Points(pg, pm); pts.frustumCulled = false; scene.add(pts); var parts = [], tt = 0, nextB = 0, PAL = [[2.6, 1.2, 0.3], [0.4, 1.6, 2.6], [2.4, 0.4, 1.4], [2.4, 2.2, 0.6], [0.6, 2.4, 1.0]];
      W.anim.push(function (dt) { pts.visible = W.night > 0.6; if (!pts.visible) return; tt += dt; if (tt > nextB) { nextB = tt + 1.2 + Math.random() * 1.6; var cx = W.fireworks.x + (Math.random() - 0.5) * 8, cz = W.fireworks.z + (Math.random() - 0.5) * 8, cy = 9 + Math.random() * 4, c = PAL[Math.floor(Math.random() * PAL.length)]; for (var i = 0; i < 48; i++) { var a = Math.random() * 6.283, e = Math.acos(2 * Math.random() - 1), sp = 2.6 + Math.random() * 0.8; parts.push({ x: cx, y: cy, z: cz, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp, vz: Math.sin(e) * Math.sin(a) * sp, t: 0, c: c }); } if (parts.length > N) parts.splice(0, parts.length - N); }
        for (var j = 0; j < N; j++) { var p = parts[j]; if (!p) { pos[j * 3 + 1] = -99; continue; } p.t += dt; p.vy -= 1.6 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vx *= 0.985; p.vz *= 0.985; var k = Math.max(0, 1 - p.t / 1.8); pos[j * 3] = p.x; pos[j * 3 + 1] = p.y; pos[j * 3 + 2] = p.z; col[j * 3] = p.c[0] * k; col[j * 3 + 1] = p.c[1] * k; col[j * 3 + 2] = p.c[2] * k; } parts = parts.filter(function (p) { return p.t < 1.8; }); pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true; }); }
  }
  function init(ctx) { K = ctx.K || KIT; M = ctx.M || KIT.M(); }
  return { world: world, init: init, train: train, placeTrain: placeTrain, moped: moped, roadster: roadster, crossover: crossover, superbike: superbike, airliner: airliner, glider: glider, fighter2: fighter2, vaporCone: vaporCone, fighter: fighter, ufo: ufo, ferry: ferry, balloon: balloon, bossDragon: bossDragon, bossGolem: bossGolem, bossSun: bossSun, gearBlade: gearBlade, gearShield: gearShield, gearCape: gearCape };
})();


