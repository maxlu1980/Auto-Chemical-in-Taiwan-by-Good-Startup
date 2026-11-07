/* ===== [engine_rckit.js] RCKit: the fittings of the rooms ===== */
/* ===== Retrospective concrete waterproofing: the fittings of the rooms =====
   What stands in a water tank, a sewage tank, a basement and a lift pit: flanged wall nozzles, pipe runs on clips, ladders, a suction strainer,
   a float switch, the guide rails of a lift with their brackets and sole plates, buffers on their pedestals, the pit stop-switch box, bulkhead
   and work lamps, a governor rope tension pulley, floor gullies and gratings, a submersible mixer. Every builder returns a THREE.Group with its
   origin where it is fixed (the foot on the floor, the flange on the wall); the caller places it. Dimensions in metres. */
var RCKit = (function () {
  function Kit(ctx) {
    var keep = ctx.keep, self = this, X = [];
    function mat(o, list) { var m = keep(new THREE.MeshStandardMaterial(o)); if (list) list.push(m); return m; }
    this.xrMats = X; // faded in x-ray, so the structure stays readable
    var M = this.M = {
      ss: mat({ color: 0xd4d8db, metalness: mt(0.9), roughness: 0.28, envMapIntensity: 1.1 }, X), ssDull: mat({ color: 0xb6bbbf, metalness: mt(0.8), roughness: 0.48, envMapIntensity: 0.9 }, X),
      galv: mat({ map: keep(canvasTex(RCTX.galv, { wrap: THREE.RepeatWrapping, repeat: [2, 2] })), color: 0xc0c4c6, metalness: mt(0.65), roughness: 0.5, envMapIntensity: 0.8 }, X),
      steel: mat({ color: 0x4b4f53, metalness: mt(0.6), roughness: 0.5, envMapIntensity: 0.7 }, X), railFace: mat({ color: 0xa3a7ab, metalness: mt(0.85), roughness: 0.22, envMapIntensity: 1.1 }, X),
      black: mat({ color: 0x1f2124, roughness: 0.6, metalness: mt(0.2) }, X), yellow: mat({ color: 0xe6b41c, roughness: 0.5 }, X), red: mat({ color: 0xc0272d, roughness: 0.5 }, X), blue: mat({ color: 0x2f5f97, roughness: 0.5 }, X),
      rubber: mat({ color: 0x141414, roughness: 0.92 }, X), pvc: mat({ color: 0x8f959a, roughness: 0.35, envMapIntensity: 0.8 }, X), pvcDark: mat({ color: 0x5b6065, roughness: 0.4 }, X),
      grey: mat({ color: 0xbfc3c6, roughness: 0.45, metalness: mt(0.25) }, X), cast: mat({ color: 0x35373a, roughness: 0.72, metalness: mt(0.4) }, X), cable: mat({ color: 0x2a2c2e, roughness: 0.7 }, X), orange: mat({ color: 0xe0621c, roughness: 0.6 }, X),
      glass: mat({ color: 0xfff6e0, emissive: 0xffe6b0, emissiveIntensity: 1.6, roughness: 0.15, transparent: true, opacity: 0.92 }, X), glassOff: mat({ color: 0xc9cfd3, roughness: 0.1, transparent: true, opacity: 0.55, envMapIntensity: 1.2 }, X),
      pp: mat({ color: 0xe6ebee, roughness: 0.45 }, X), bore: mat({ color: 0x1c1f22, roughness: 0.6, side: THREE.BackSide }, X)
    };
    function add(g, geo, m, pos, rot, o) { var me = new THREE.Mesh(keep(geo), m); if (pos) me.position.set(pos[0], pos[1], pos[2]); if (rot) me.rotation.set(rot[0], rot[1], rot[2]); me.castShadow = !(o && o.noCast); me.receiveShadow = true; g.add(me); return me; }
    function cyl(g, r0, r1, h, m, pos, rot, seg) { return add(g, new THREE.CylinderGeometry(r0, r1, h, seg || 24), m, pos, rot); }
    function box(g, w, h, d, m, pos, rot) { return add(g, new THREE.BoxGeometry(w, h, d), m, pos, rot); }
    function tube(g, pts, r, m, seg) { var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); })); return add(g, new THREE.TubeGeometry(c, seg || 32, r, 12, false), m); }
    var UP = new THREE.Vector3(0, 1, 0), DV = new THREE.Vector3();
    function bar(g, a, b, r, m, seg) { DV.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); var L = DV.length(); var me = cyl(g, r, r, L, m, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], null, seg || 12); me.quaternion.setFromUnitVectors(UP, DV.normalize()); return me; }
    function alongZ(geo, z0, z1) { geo.rotateX(Math.PI / 2); geo.translate(0, 0, (z0 + z1) / 2); return geo; }
    function cylZ(g, r, z0, z1, m, open) { return add(g, alongZ(new THREE.CylinderGeometry(r, r, z1 - z0, 32, 1, !!open), z0, z1), m); }
    /* bolts round a circle in the x–y plane at z: hex heads */
    function bolts(g, n, R, z, m, len) { var i; for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + Math.PI / n; cyl(g, 0.006, 0.006, len || 0.014, m, [Math.cos(a) * R, Math.sin(a) * R, z], [Math.PI / 2, 0, 0], 6); } }
    /* a flange: the disc in the x–y plane, its face towards +z, bolts on it */
    function flange(g, r, z, m, bm) { var R = r * 1.55; cylZ(g, R, z - 0.011, z + 0.011, m); bolts(g, 8, r * 1.28, z + 0.011, bm || M.ssDull, 0.012); return R; }

    /* a pipe through the wall (the face at z = 0): the stub out to `out`, a flange on its end (or an open end), a backing plate on the wall */
    this.wallNozzle = function (r, out, o) { o = o || {}; var g = new THREE.Group(), m = o.m || M.ss, wall = r * 0.08;
      cylZ(g, r, -0.35, out, m); add(g, alongZ(new THREE.CylinderGeometry(r - wall, r - wall, out + 0.34, 32, 1, true), -0.34, out), M.bore, null, null, { noCast: true });
      if (o.blind) { cylZ(g, r * 1.55, out - 0.011, out + 0.011, m); bolts(g, 8, r * 1.28, out + 0.011, M.ssDull); } else if (o.flange !== false) { flange(g, r, out - 0.02, m); add(g, new THREE.RingGeometry(r - wall, r, 32), m, [0, 0, out], null, { noCast: true }); } else add(g, new THREE.RingGeometry(r - wall, r, 32), m, [0, 0, out], null, { noCast: true });
      if (o.plate !== false) { cylZ(g, r * 1.7, 0.0008, 0.012, o.plateM || m); bolts(g, 6, r * 1.45, 0.012, M.ssDull, 0.01); }
      g.userData = { r: r, out: out }; return g; };
    /* a pipe run: a smooth tube through the points, clips where asked ([x, y, z] of the wall point, the pipe axis `standoff` in front of it) */
    this.pipeRun = function (pts, r, m, clips, standoff) { var g = new THREE.Group(); tube(g, pts, r, m || M.pvc, Math.max(16, pts.length * 12)); (clips || []).forEach(function (c) { self.clip(g, r, c, standoff || r + 0.02); }); return g; };
    /* a pipe clip on the wall (face +z): a plate on the wall, a stem, a half ring round the pipe */
    this.clip = function (g, r, at, standoff) { var s = new THREE.Group(); s.position.set(at[0], at[1], at[2]); box(s, 0.05, 0.03, 0.006, M.galv, [0, 0, 0.003]); cyl(s, 0.007, 0.007, standoff - r, M.galv, [0, 0, (standoff - r) / 2 + 0.006], [Math.PI / 2, 0, 0], 10); add(s, new THREE.TorusGeometry(r + 0.004, 0.004, 12, 24, Math.PI), M.galv, [0, 0, standoff], [Math.PI, 0, 0]); add(s, new THREE.TorusGeometry(r + 0.004, 0.004, 12, 24, Math.PI), M.galv, [0, 0, standoff], [0, 0, 0]); g.add(s); return s; };
    /* an elbow of a pipe: a quarter torus in the local x–y plane from +x to +y */
    this.elbow = function (r, m) { var g = new THREE.Group(); add(g, new THREE.TorusGeometry(r * 1.5, r, 16, 24, Math.PI / 2), m || M.pvc); return g; };

    /* a ladder fixed to a wall (the wall face at z = 0, the ladder standing off it): two stiles, rungs, wall brackets; origin at the foot centre */
    this.ladder = function (h, w, o) { o = o || {}; var g = new THREE.Group(), m = o.m || M.galv, so = o.standoff || 0.15, rs = o.rung || 0.28, n = Math.max(2, Math.floor((h - 0.1) / rs)), i, sr = o.flat ? null : 0.016;
      [-w / 2, w / 2].forEach(function (x) { if (sr) cyl(g, sr, sr, h, m, [x, h / 2, so], null, 16); else box(g, 0.012, h, 0.05, m, [x, h / 2, so]); });
      for (i = 0; i < n; i++) cyl(g, 0.012, 0.012, w, m, [0, 0.15 + i * rs, so], [0, 0, Math.PI / 2], 14);
      var brk = o.brackets || [0.32, h - 0.25]; brk.forEach(function (y) { [-w / 2, w / 2].forEach(function (x) { var b = new THREE.Group(); b.position.set(x, y, 0); g.add(b); box(b, 0.05, 0.035, so - 0.01, m, [0, 0, (so - 0.01) / 2 + 0.005]); box(b, 0.08, 0.08, 0.008, m, [0, 0, 0.004]); bolts(b, 2, 0.026, 0.008, M.ssDull, 0.008); }); });
      if (o.hooks) { [-w / 2, w / 2].forEach(function (x) { add(g, new THREE.TorusGeometry(0.06, 0.014, 10, 20, Math.PI), m, [x, h, so - 0.06], [0, Math.PI / 2, 0]); }); } // hooked over the top edge
      return g; };
    /* the suction pipe of a tank with its strainer bell close to the floor: vertical, the bell opening downwards; origin at the floor under the bell */
    this.suction = function (r, hTop, o) { o = o || {}; var g = new THREE.Group(), m = o.m || M.ss, gap = o.gap || 0.08, i;
      cyl(g, r, r, hTop - gap - 0.12, m, [0, gap + 0.12 + (hTop - gap - 0.12) / 2, 0], null, 28);
      var prof = [], k; for (k = 0; k <= 8; k++) { var t = k / 8; prof.push(new THREE.Vector2(r + (r * 1.9 - r) * Math.sin(t * Math.PI / 2), 0.12 - t * 0.12)); } prof.push(new THREE.Vector2(r * 1.9, 0)); prof.push(new THREE.Vector2(r * 1.9 - 0.004, 0));
      var bell = add(g, new THREE.LatheGeometry(prof, 32), m, [0, gap, 0]); bell.material = keep(m.clone()); bell.material.side = THREE.DoubleSide; X.push(bell.material);
      for (i = 0; i < 4; i++) add(g, new THREE.TorusGeometry(r * 1.6 - i * 0.008, 0.0025, 6, 40), M.black, [0, gap + 0.02 + i * 0.022, 0], [Math.PI / 2, 0, 0], { noCast: true }); // the slots of the strainer
      if (o.flangeY != null) { cyl(g, r * 1.5, r * 1.5, 0.02, m, [0, o.flangeY, 0], null, 32); bolts(g, 8, r * 1.25, 0, M.ssDull, 0.012); }
      var sup = box(g, 0.05, 0.05, o.support || 0.22, m, [0, hTop * 0.55, -(o.support || 0.22) / 2 - r]); box(g, 0.1, 0.1, 0.008, m, [0, hTop * 0.55, -(o.support || 0.22) - r]); void sup; // a bracket back to the wall
      return g; };
    /* a float switch hanging on its cable from above: the cable, a counterweight, the float; origin at the point the cable hangs from */
    this.floatSwitch = function (len) { var g = new THREE.Group(); tube(g, [[0, 0, 0], [0.01, -len * 0.4, 0.01], [0.02, -len, 0.005]], 0.004, M.cable, 16); add(g, new THREE.SphereGeometry(0.03, 20, 14), M.pp, [0.02, -len - 0.02, 0.005]).scale.set(1, 1.5, 1); cyl(g, 0.006, 0.006, 0.03, M.black, [0.02, -len - 0.075, 0.005], null, 10); cyl(g, 0.012, 0.012, 0.06, M.black, [0.012, -len * 0.55, 0.008], null, 12); return g; };

    /* a lift guide rail: T-profile (foot 89 × 16, blade 62 deep) standing on its sole plate; the foot against the wall (z = 0), the blade towards +z */
    this.tRail = function (h, o) { o = o || {}; var g = new THREE.Group(), fw = o.foot || 0.089, ft = 0.012, bd = o.blade || 0.05, bt = 0.016, so = o.standoff || 0.045; // the foot stands `so` off the wall on its brackets
      box(g, fw, h, ft, M.steel, [0, h / 2, so + ft / 2]); box(g, bt, h, bd, M.steel, [0, h / 2, so + ft + bd / 2]);
      [-1, 1].forEach(function (s) { box(g, 0.0015, h - 0.02, bd - 0.008, M.railFace, [s * (bt / 2 + 0.0008), h / 2, so + ft + bd / 2]); }); box(g, bt + 0.002, h - 0.02, 0.0015, M.railFace, [0, h / 2, so + ft + bd + 0.0008]); // the machined guide faces
      var base = box(g, 0.2, 0.02, 0.17, M.steel, [0, 0.01, so + 0.06]); void base; bolts(g, 4, 0.075, 0, M.ssDull, 0.012); g.children.slice(-4).forEach(function (b) { b.rotation.set(0, 0, 0); b.position.set(b.position.x, 0.027, so + 0.06 + b.position.y); }); // the sole plate with its anchor bolts
      (o.brackets || [0.4, h - 0.3]).forEach(function (y) { self.railBracket(g, y, so, fw); });
      return g; };
    this.railBracket = function (g, y, so, fw) { var b = new THREE.Group(); b.position.y = y; g.add(b); box(b, 0.22, 0.12, 0.01, M.galv, [0, 0, 0.005]); box(b, 0.22, 0.08, so, M.galv, [0, 0, so / 2 + 0.006]); [-1, 1].forEach(function (s) { box(b, 0.04, 0.06, 0.018, M.galv, [s * (fw / 2 + 0.008), 0, so + 0.012 + 0.009]); cyl(b, 0.007, 0.007, 0.02, M.ssDull, [s * (fw / 2 + 0.008), 0, so + 0.03], [Math.PI / 2, 0, 0], 6); }); [-0.08, 0.08].forEach(function (x) { cyl(b, 0.007, 0.007, 0.012, M.ssDull, [x, 0.035, 0.012], [Math.PI / 2, 0, 0], 6); cyl(b, 0.007, 0.007, 0.012, M.ssDull, [x, -0.035, 0.012], [Math.PI / 2, 0, 0], 6); }); return b; };
    /* an oil tray at the foot of a rail */
    this.oilTray = function () { var g = new THREE.Group(); box(g, 0.26, 0.004, 0.2, M.galv, [0, 0.002, 0]); [[-0.13, 0, 0.004, 0.2], [0.13, 0, 0.004, 0.2], [0, -0.1, 0.26, 0.004], [0, 0.1, 0.26, 0.004]].forEach(function (s) { box(g, s[2], 0.03, s[3], M.galv, [s[0], 0.017, s[1]]); }); return g; };
    /* a polyurethane buffer on its base plate: the yellow elastomer with black bands; origin at the underside of the base plate */
    this.bufferPU = function () { var g = new THREE.Group(); box(g, 0.24, 0.012, 0.24, M.steel, [0, 0.006, 0]); bolts(g, 4, 0.1, 0, M.ssDull, 0.012); g.children.slice(-4).forEach(function (b) { b.rotation.set(0, 0, 0); b.position.set(b.position.x, 0.017, b.position.y); });
      cyl(g, 0.085, 0.09, 0.19, M.yellow, [0, 0.012 + 0.095, 0], null, 32); [0.05, 0.11, 0.17].forEach(function (y) { add(g, new THREE.TorusGeometry(0.089, 0.006, 12, 32), M.black, [0, 0.012 + y, 0], [Math.PI / 2, 0, 0]); }); cyl(g, 0.1, 0.1, 0.012, M.steel, [0, 0.012 + 0.19 + 0.006, 0], null, 32); return g; };
    /* an oil buffer: the cylinder with its plunger and striker plate, the return spring guard, a mounting flange; origin at the underside */
    this.bufferOil = function (h) { var g = new THREE.Group(); cyl(g, 0.12, 0.12, 0.016, M.steel, [0, 0.008, 0], null, 32); bolts(g, 6, 0.1, 0, M.ssDull, 0.012); g.children.slice(-6).forEach(function (b) { b.rotation.set(0, 0, 0); b.position.set(b.position.x, 0.02, b.position.y); });
      cyl(g, 0.075, 0.08, h * 0.62, M.blue, [0, 0.016 + h * 0.31, 0], null, 32); cyl(g, 0.09, 0.09, 0.03, M.black, [0, 0.016 + h * 0.62 + 0.015, 0], null, 32); cyl(g, 0.036, 0.036, h * 0.3, M.railFace, [0, 0.016 + h * 0.62 + 0.03 + h * 0.15, 0], null, 24); box(g, 0.2, 0.02, 0.2, M.yellow, [0, 0.016 + h * 0.92 + 0.04, 0]);
      cyl(g, 0.012, 0.012, 0.05, M.glassOff, [0.078, 0.016 + h * 0.2, 0], [0, 0, Math.PI / 2], 12); [0.28, 0.55].forEach(function (f) { add(g, new THREE.TorusGeometry(0.081, 0.004, 12, 32), M.yellow, [0, 0.016 + h * 0.62 * f, 0], [Math.PI / 2, 0, 0]); }); return g; };
    /* the pit stop-switch box: a grey enclosure with the red mushroom button on its yellow ring, a light switch, a socket, the conduit up the wall */
    this.switchBox = function (conduitH) { var g = new THREE.Group(); box(g, 0.14, 0.2, 0.075, M.grey, [0, 0.1, 0.0375]); cyl(g, 0.03, 0.03, 0.01, M.yellow, [0, 0.145, 0.08], [Math.PI / 2, 0, 0], 24); cyl(g, 0.02, 0.022, 0.018, M.red, [0, 0.145, 0.092], [Math.PI / 2, 0, 0], 24);
      box(g, 0.05, 0.05, 0.012, M.pp, [-0.03, 0.06, 0.081]); box(g, 0.02, 0.028, 0.008, M.grey, [-0.03, 0.06, 0.09]); cyl(g, 0.02, 0.02, 0.014, M.pp, [0.035, 0.06, 0.082], [Math.PI / 2, 0, 0], 20); [-0.008, 0.008].forEach(function (x) { cyl(g, 0.003, 0.003, 0.01, M.black, [0.035 + x, 0.06, 0.09], [Math.PI / 2, 0, 0], 8); });
      cyl(g, 0.011, 0.011, conduitH, M.grey, [0.04, 0.2 + conduitH / 2, 0.02], null, 12); cyl(g, 0.015, 0.015, 0.02, M.grey, [0.04, 0.21, 0.02], null, 12); self.clip(g, 0.011, [0.04, 0.2 + conduitH * 0.55, 0], 0.02); return g; };
    /* a bulkhead lamp: the oval body on the wall, the glass, the wire guard; origin at the wall behind its centre */
    this.bulkhead = function (on) { var g = new THREE.Group(), body = cyl(g, 0.075, 0.075, 0.03, M.grey, [0, 0, 0.015], [Math.PI / 2, 0, 0], 32); body.scale.set(1.5, 1, 1); var gl = add(g, new THREE.SphereGeometry(0.068, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2), on ? M.glass : M.glassOff, [0, 0, 0.03], [Math.PI / 2, 0, 0]); gl.scale.set(1, 0.72, 1);
      var i; for (i = 0; i < 4; i++) { var a = i / 4 * Math.PI, arc = add(g, new THREE.TorusGeometry(0.071, 0.0025, 6, 24, Math.PI), M.galv, [0, 0, 0.03]); arc.rotation.set(Math.PI / 2, 0, a, 'ZYX'); arc.scale.set(1, 1, 0.75); } add(g, new THREE.TorusGeometry(0.05, 0.0025, 6, 32), M.galv, [0, 0, 0.062]); return g; };
    /* a halogen work light with a hook, hung over the top edge of a wall: the head with its glass and grill, the yoke, the hook; origin at the hook's bearing point on the edge */
    this.hookLamp = function () { var g = new THREE.Group(); box(g, 0.09, 0.008, 0.2, M.steel, [0, 0.004, -0.1]); box(g, 0.09, 0.008, 0.03, M.steel, [0, 0.004, 0.015]); cyl(g, 0.012, 0.012, 0.04, M.black, [0, 0.028, -0.17], null, 12); cyl(g, 0.007, 0.007, 0.2, M.steel, [0, -0.1, 0.03], null, 10); box(g, 0.09, 0.08, 0.008, M.steel, [0, -0.04, 0.004]);
      var head = new THREE.Group(); head.position.set(0, -0.2, 0.09); head.rotation.x = 0.55; g.add(head); box(head, 0.2, 0.15, 0.09, M.black, [0, 0, -0.045]); box(head, 0.17, 0.12, 0.004, M.glass, [0, 0, 0.001]); var i; for (i = 0; i < 4; i++) box(head, 0.19, 0.004, 0.003, M.galv, [0, -0.05 + i * 0.033, 0.006]); box(head, 0.004, 0.14, 0.003, M.galv, [0, 0, 0.006]); [-1, 1].forEach(function (s) { box(head, 0.006, 0.05, 0.02, M.steel, [s * 0.104, 0.02, -0.04]); }); tube(g, [[0.09, -0.2, 0.06], [0.14, -0.3, 0.03], [0.16, -0.6, -0.02]], 0.005, M.orange, 12); return g; };
    /* a tripod halogen work light standing on the floor; origin at the floor under the mast */
    this.tripodLamp = function (h) { var g = new THREE.Group(), i; for (i = 0; i < 3; i++) { var a = i / 3 * Math.PI * 2 + 0.5; bar(g, [Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34], [0, h * 0.58, 0], 0.011, M.galv, 10); box(g, 0.03, 0.01, 0.05, M.rubber, [Math.cos(a) * 0.34, 0.005, Math.sin(a) * 0.34]); }
      cyl(g, 0.016, 0.016, h * 0.5, M.galv, [0, h * 0.58 + h * 0.25 - 0.1, 0], null, 12); cyl(g, 0.03, 0.03, 0.05, M.black, [0, h * 0.58, 0], null, 14);
      var head = new THREE.Group(); head.position.set(0, h, 0); head.rotation.set(0.35, 0, 0); g.add(head); box(head, 0.24, 0.17, 0.1, M.black, [0, 0, -0.05]); box(head, 0.2, 0.14, 0.004, M.glass, [0, 0, 0.001]); for (i = 0; i < 4; i++) box(head, 0.22, 0.004, 0.003, M.galv, [0, -0.06 + i * 0.04, 0.006]); [-1, 1].forEach(function (s) { box(head, 0.006, 0.06, 0.02, M.steel, [s * 0.124, -0.02, -0.05]); });
      tube(g, [[0.1, h - 0.05, -0.08], [0.2, h * 0.6, -0.1], [0.3, 0.02, 0.1], [0.7, 0.01, 0.4]], 0.006, M.orange, 24); return g; };
    /* the tension pulley of the governor rope: a sheave in its frame with the tension weight, the rope going up; origin at the floor */
    this.tensionPulley = function (ropeH) { var g = new THREE.Group(); box(g, 0.22, 0.012, 0.16, M.steel, [0, 0.006, 0]); [-1, 1].forEach(function (s) { box(g, 0.012, 0.36, 0.14, M.yellow, [s * 0.05, 0.19, 0]); }); cyl(g, 0.1, 0.1, 0.04, M.steel, [0, 0.26, 0], [0, 0, Math.PI / 2], 32); add(g, new THREE.TorusGeometry(0.1, 0.006, 12, 40), M.railFace, [0, 0.26, 0], [0, Math.PI / 2, 0]);
      box(g, 0.14, 0.16, 0.12, M.steel, [0, 0.1, 0]); [-1, 1].forEach(function (s) { cyl(g, 0.0045, 0.0045, ropeH, M.railFace, [0, 0.26 + ropeH / 2, s * 0.1], null, 8); }); cyl(g, 0.012, 0.012, 0.13, M.black, [0, 0.26, 0], [0, 0, Math.PI / 2], 12); return g; };
    /* a grating over a sump or a gully: bars in a frame; origin at the floor level, centred */
    this.grate = function (w, d, o) { o = o || {}; var g = new THREE.Group(), m = o.m || M.cast, n = Math.max(3, Math.round(w / 0.03)), i; for (i = 0; i < n; i++) box(g, 0.006, 0.02, d - 0.012, m, [-w / 2 + 0.008 + i * (w - 0.016) / (n - 1), -0.01, 0]); [-1, 1].forEach(function (s) { box(g, w, 0.02, 0.006, m, [0, -0.01, s * (d / 2 - 0.003)]); box(g, 0.006, 0.02, d, m, [s * (w / 2 - 0.003), -0.01, 0]); }); box(g, w * 0.8, 0.004, 0.006, m, [0, -0.011, 0]); return g; };
    /* a submersible mixer on its guide tube: the motor with the propeller, the bracket sliding on the square tube, the lifting chain and the cable; origin at the floor under the tube */
    this.mixer = function (h, o) { o = o || {}; var g = new THREE.Group(), y = o.y || 0.38; box(g, 0.28, 0.014, 0.28, M.galv, [0, 0.007, 0]); box(g, 0.06, h, 0.06, M.galv, [0, h / 2, 0]);
      var mm = new THREE.Group(); mm.position.set(0, y, 0); mm.rotation.y = o.yaw || 0; g.add(mm); box(mm, 0.1, 0.12, 0.1, M.galv, [0, 0, 0]); box(mm, 0.08, 0.08, 0.18, M.cast, [0, 0, 0.13]);
      cyl(mm, 0.09, 0.075, 0.42, M.cast, [0, 0, 0.42], [Math.PI / 2, 0, 0], 28); cyl(mm, 0.04, 0.03, 0.08, M.cast, [0, 0, 0.67], [Math.PI / 2, 0, 0], 20); var i; for (i = 0; i < 3; i++) { var b = box(mm, 0.05, 0.2, 0.012, M.ss, [0, 0, 0.7]); b.rotation.set(0.5, 0, i / 3 * Math.PI * 2); b.translateY(0.11); }
      tube(g, [[0.03, y + 0.06, 0], [0.04, h * 0.7, 0.04], [0.02, h, 0.05]], 0.006, M.railFace, 16); tube(g, [[-0.04, y + 0.06, 0.02], [-0.08, h * 0.6, 0.1], [-0.06, h, 0.14]], 0.008, M.cable, 16); return g; };
    /* a floor gully: the cast frame and grate flush with the floor, the dark trap below; origin at the floor centre */
    this.gully = function (s) { var g = new THREE.Group(); box(g, s + 0.02, 0.03, s + 0.02, M.cast, [0, -0.02, 0]); box(g, s - 0.01, 0.06, s - 0.01, M.bore, [0, -0.045, 0]); g.add(self.grate(s, s, { m: M.cast })); return g; };
    /* a junction box with a lid, conduits leaving it */
    this.junction = function () { var g = new THREE.Group(); box(g, 0.11, 0.11, 0.05, M.grey, [0, 0, 0.025]); box(g, 0.1, 0.1, 0.008, M.grey, [0, 0, 0.054]); [[-0.04, -0.04], [0.04, -0.04], [-0.04, 0.04], [0.04, 0.04]].forEach(function (p) { cyl(g, 0.004, 0.004, 0.004, M.ssDull, [p[0], p[1], 0.06], [Math.PI / 2, 0, 0], 8); }); return g; };
    /* a concrete pedestal of a buffer, through the member's block so that it is sawn in the section; y0 = the floor */
    this.pedestal = function (x, z, w, d, h, off) { return ctx.block(x - w / 2, x + w / 2, off || 0, (off || 0) + h, z - d / 2, z + d / 2, ['formed', 'formed', 'slabTop', 'formed', 'formed', 'formed']); };
    /* the corner shading of a room: a gradient (multiply) that darkens the joint between two faces; `len` along x, `wdt` from the joint, on a face +z; the caller turns it */
    this.aoStrip = function (len, wdt, alpha) { var m = keep(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: keep(canvasTex(RCTX.ao, { srgb: false })), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, opacity: alpha == null ? 0.5 : alpha })); var me = new THREE.Mesh(keep(new THREE.PlaneGeometry(len, wdt)), m); me.renderOrder = 6; me.receiveShadow = false; me.castShadow = false; return me; };
  }
  return { Kit: Kit };
})();

