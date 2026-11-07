/* ===== [m3d_sl.js] ===== */
/* ===== Sealant guide: the joints in 3D =====
   Six members built through the waterproofing member's hooks, one facade each: fibre-cement siding with its panel joints (renewal, the old
   sealant cut out), a window frame with its perimeter joint, precast concrete panels with a wide movement joint, ALC panels whose joints are
   painted over, a wall with a vent hood and an electrical box sealed with the clear sealant, and the concrete wall of a water channel. Each is
   worked to the EXCEED standard method statement: removal, cleaning, backer rod, masking tape, dedicated primer, filling from the gun, two
   passes of the spatula, tape off, and the finished joint. Coordinates in metres: the face of the cladding is z = 0, the wall behind it, the
   pavement in front (+z); the section is cut at x = XC. Every joint is a path; the beads, rods, tapes and primer strips grow along it behind
   clipping planes so that stills, scrubbing and the animation agree. */
var SL3D = (function () {
  var PX = SMALL3D ? 900 : 1400, C = {};
  function once(k, f) { if (!C[k]) C[k] = f(); return C[k]; }
  /* ---------- canvases ---------- */
  function sidingFace() { return once('sid', function () { var S = 1024, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(1201), i; q.fillStyle = '#cfcac0'; q.fillRect(0, 0, S, S); clouds(q, S, S, r, 8, 8, 0.18, 120, 200); var pat = q.createPattern(greyNoise(96, 96, r, 90, 200), 'repeat'); q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.35; q.fillStyle = pat; q.fillRect(0, 0, S, S); q.restore();
    q.globalAlpha = 0.5; for (i = 0; i < 900; i++) { q.fillStyle = i % 3 ? 'rgba(90,86,80,.55)' : 'rgba(240,238,232,.7)'; q.beginPath(); q.arc(r() * S, r() * S, 0.5 + r() * 1.6, 0, 7); q.fill(); } q.globalAlpha = 1; // the stipple of a fibre-cement board
    for (i = 0; i < 7; i++) { var y = S * (0.07 + i * 0.13) + (r() - 0.5) * 6; q.fillStyle = 'rgba(70,66,60,.28)'; q.fillRect(0, y, S, 5); q.fillStyle = 'rgba(255,255,250,.22)'; q.fillRect(0, y + 5, S, 2); } // the shadow lines of the pressed pattern
    return c; }); }
  function alcFace() { return once('alc', function () { var S = 1024, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(1301), i; q.fillStyle = '#dedad1'; q.fillRect(0, 0, S, S); clouds(q, S, S, r, 6, 6, 0.14, 150, 220); q.globalAlpha = 0.6; for (i = 0; i < 2600; i++) { var rr = 0.6 + r() * 2.6; q.fillStyle = 'rgba(120,116,108,' + (0.25 + r() * 0.4) + ')'; q.beginPath(); q.arc(r() * S, r() * S, rr, 0, 7); q.fill(); } q.globalAlpha = 1; return c; }); } // the open pores of autoclaved aerated concrete
  function paintFace() { return once('pnt', function () { var S = 256, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(1401), i; q.fillStyle = '#e9e4d8'; q.fillRect(0, 0, S, S); q.globalAlpha = 0.14; for (i = 0; i < 1400; i++) { q.fillStyle = i % 2 ? '#ffffff' : '#8a847a'; q.beginPath(); q.arc(r() * S, r() * S, 0.6 + r() * 1.4, 0, 7); q.fill(); } q.globalAlpha = 1; return c; }); }
  function rodFace() { return once('rod', function () { var S = 256, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(1601), i; q.fillStyle = '#c6cacd'; q.fillRect(0, 0, S, S); clouds(q, S, S, r, 6, 6, 0.18, 180, 215); for (i = 0; i < 1400; i++) { var x = r() * S, y = r() * S, rad = 0.8 + r() * 2.4, g = q.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 0, x, y, rad); g.addColorStop(0, 'rgba(236,238,240,.55)'); g.addColorStop(0.6, 'rgba(150,155,160,.35)'); g.addColorStop(1, 'rgba(120,125,130,0)'); q.fillStyle = g; q.beginPath(); q.arc(x, y, rad, 0, 7); q.fill(); } return c; }); } // the skin of a closed-cell PE foam rod
  function oldSealFace() { return once('old', function () { var S = 256, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(1501), i; q.fillStyle = '#8f8c86'; q.fillRect(0, 0, S, S); clouds(q, S, S, r, 5, 5, 0.3, 90, 170); q.strokeStyle = 'rgba(40,38,34,.8)'; q.lineWidth = 2; for (i = 0; i < 26; i++) { var x = r() * S; q.beginPath(); q.moveTo(x, 0); q.lineTo(x + (r() - 0.5) * 30, S * (0.3 + r() * 0.7)); q.stroke(); } q.globalAlpha = 0.5; for (i = 0; i < 500; i++) { q.fillStyle = '#5c5954'; q.beginPath(); q.arc(r() * S, r() * S, 0.5 + r() * 1.2, 0, 7); q.fill(); } q.globalAlpha = 1; return c; }); } // the crazed, dirty surface of a plasticised sealant after years in the sun
  function crackStrip() { return once('crk', function () { var Wc = 96, Hc = 1024, c = mkCanvas(Wc, Hc), q = c.getContext('2d'), r = lcg(1701), i, x = Wc / 2, y = 0; q.fillStyle = '#b8b5ad'; q.fillRect(0, 0, Wc, Hc); clouds(q, Wc, Hc, r, 3, 12, 0.16, 140, 200); q.globalAlpha = 0.45; for (i = 0; i < 700; i++) { q.fillStyle = i % 2 ? '#8a877f' : '#d8d5cd'; q.beginPath(); q.arc(r() * Wc, r() * Hc, 0.5 + r() * 1.3, 0, 7); q.fill(); } q.globalAlpha = 1;
    q.strokeStyle = 'rgba(38,36,33,.92)'; q.lineWidth = 2.2; q.lineJoin = 'round'; q.beginPath(); q.moveTo(x, 0); while (y < Hc) { y += 6 + r() * 14; x += (r() - 0.5) * 9; x = Math.max(Wc * 0.3, Math.min(Wc * 0.7, x)); q.lineTo(x, y); } q.stroke(); q.strokeStyle = 'rgba(38,36,33,.35)'; q.lineWidth = 5; q.stroke(); // a jagged shrinkage crack running the length of the strip
    q.strokeStyle = 'rgba(60,58,54,.5)'; q.lineWidth = 1; for (i = 0; i < 9; i++) { var yy = r() * Hc, xx = Wc / 2 + (r() - 0.5) * 20; q.beginPath(); q.moveTo(xx, yy); q.lineTo(xx + (r() - 0.5) * 26, yy + (r() - 0.5) * 30); q.stroke(); } return c; }); }
  function steelFace() { return once('stl', function () { var S = 512, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(1801), i; q.fillStyle = '#e4e5e0'; q.fillRect(0, 0, S, S); q.globalAlpha = 0.08; for (i = 0; i < 2600; i++) { q.fillStyle = i % 2 ? '#ffffff' : '#9a9c98'; q.fillRect(r() * S, r() * S, 1 + r() * 3, 0.6); } q.globalAlpha = 1; return c; }); } // the faint brush of a factory-painted steel sheet
  /* ---------- geometry ---------- */
  function beadShape(w, d, top) { // the cross-section of a bead in the joint: u across the width, v outward (the face at v = 0, the bottom at v = -d)
    var s = new THREE.Shape(), hw = w / 2, k; s.moveTo(-hw, -d); s.lineTo(hw, -d);
    if (top === 'raw') { s.lineTo(hw, 0.0004); s.quadraticCurveTo(0, 0.0004 + w * 0.22, -hw, 0.0004); }
    else if (top === 'old') { s.lineTo(hw, -0.0006); s.quadraticCurveTo(0, -0.0006 - w * 0.26, -hw, -0.0006); }
    else if (top === 'flat') { s.lineTo(hw, 0.0002); s.lineTo(-hw, 0.0002); } // the putty: struck off flush with the board
    else { s.lineTo(hw, 0); s.quadraticCurveTo(0, -w * 0.13, -hw, 0); } // tooled: the shallow concave face
    s.lineTo(-hw, -d); (k = 0); return s;
  }
  function filletShape(a) { var s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(a, 0); s.quadraticCurveTo(a * 0.32, a * 0.32, 0, a); s.lineTo(0, 0); return s; } // the triangular fillet of the clear sealant: a along the wall, a up the flange
  function lapShape(step, a, b, full) { var s = new THREE.Shape(); s.moveTo(-b, step); s.lineTo(0, step); s.lineTo(0, 0); s.lineTo(a, 0); s.quadraticCurveTo(a * 0.3, step + a * (full ? 0.55 : 0.38), -b, step + 0.0003); s.lineTo(-b, step); return s; } // the bead over a lap seam: on the lower sheet for a, over the edge (step), b onto the upper sheet
  /* a sweep of a 2D profile (in the x–y plane of the profile, x outward from the axis, y along the axis) around the z axis, triangles ordered by angle so that drawRange reveals it */
  function sweep(profile, segs, r0) { var pos = [], idx = [], n = profile.length, i, j; for (i = 0; i <= segs; i++) { var a = i / segs * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a); for (j = 0; j < n; j++) { var px = r0 + profile[j][0], pz = profile[j][1]; pos.push(px * ca, px * sa, pz); } } for (i = 0; i < segs; i++) for (j = 0; j < n - 1; j++) { var a0 = i * n + j, b0 = (i + 1) * n + j; idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1); } var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); g.userData.tri = idx.length; return g; }
  /* ---------- the joint path: a list of straight joints worked one after the other; u ∈ [0, 1] over the whole length ---------- */
  function Path(joints) { var L = 0; joints.forEach(function (j) { j.len = j.dir.dot(j.p1.clone().sub(j.p0)); j.s0 = L; L += Math.max(0.01, j.len); }); this.joints = joints; this.L = L;
    this.at = function (u) { var s = Math.max(0, Math.min(1, u)) * L, i; for (i = 0; i < joints.length; i++) { var j = joints[i]; if (s <= j.s0 + j.len + 1e-6 || i === joints.length - 1) { var t = Math.max(0, Math.min(j.len, s - j.s0)), p = j.p0.clone().add(j.dir.clone().multiplyScalar(t)); return { j: j, i: i, t: t, p: p, dir: j.dir, kind: j.kind }; } } return null; };
    this.front = function (u, i) { var j = joints[i], s = Math.max(0, Math.min(1, u)) * L; return Math.max(0, Math.min(j.len, s - j.s0)); }; }
  /* a progressive layer along one joint: meshes whose materials carry the clip planes; kind 'to' keeps [0, s], 'from' keeps [s, len]; a ring reveals by drawRange */
  function Prog(ctx, joint) { var self = this, list = []; this.add = function (mesh, kind) { if (!mesh) return mesh; if (joint.kind === 'ring') { list.push({ mesh: mesh, ring: true, kind: kind }); return mesh; } var pl = new THREE.Plane(joint.dir.clone().multiplyScalar(kind === 'from' ? 1 : -1), 0); var m = mesh.material; if (!m.userData.owned) { m = ctx.keep(m.clone()); m.userData.owned = true; mesh.material = m; ctx.layerMats.push(m); if (m.userData.op == null) m.userData.op = m.opacity; } m.clippingPlanes = (m.clippingPlanes || []).concat([pl]); list.push({ mesh: mesh, pl: pl, kind: kind }); return mesh; };
    this.set = function (s) { var base = joint.dir.dot(joint.p0); list.forEach(function (e) { if (e.ring) { var g = e.mesh.geometry, tri = g.userData.tri || (g.index ? g.index.count : g.attributes.position.count), f = Math.max(0, Math.min(1, s / joint.len)); if (e.kind === 'from') g.setDrawRange(Math.floor(tri * f / 3) * 3, Infinity); else g.setDrawRange(0, Math.floor(tri * f / 3) * 3); e.mesh.visible = e.kind === 'from' ? f < 0.999 : f > 0.001; } else { var full = s >= joint.len - 1e-6, EPS = 0.0015; e.pl.constant = e.kind === 'from' ? (full ? -(base + s) - EPS : -(base + s) + EPS) : (full ? base + s + EPS : base + s - EPS); } }); }; }
  /* ---------- the member ---------- */
  var EXG = 2; // the joints are modelled at twice their true width and depth so that the section stays legible; the captions say so
  function make(cfg) {
    var W = { w: 2.4, h: 1.95, t: 0.16 }, H = W.h, T = W.t, xc = cfg.xc || 0;
    var yj = cfg.crack && cfg.crack.y != null ? cfg.crack.y : cfg.hy && cfg.hy.length ? cfg.hy[0] : cfg.sash ? cfg.sash.y1 + cfg.w * EXG / 2 : cfg.vent ? cfg.vent.y : cfg.lap ? cfg.lap.y : 0.95; // the joint the section is cut through
    var full = cfg.sash ? { az: -26, el: 14, dist: 3.7, t: [(cfg.sash.x0 + cfg.sash.x1) / 2 + 0.25, 1.0, 0.1] } : cfg.vent ? { az: -30, el: 14, dist: 2.1, t: [0.66, 1.0, 0.1] } : cfg.water ? { az: -30, el: 13, dist: 3.4, t: [0.1, 0.8, 0.25] } : { az: -28, el: 15, dist: 3.9, t: [0.1, 1.0, 0.1] };
    return {
      W: W, S: { x: 1.45, y: 0.12, zb: -0.6, zf: 0.95 }, XC: xc, shift: 0.14, ground: 0, floor: null, sub: cfg.sub === 'rc' ? 'block' : 'mortar', noMicro: !!(cfg.ind || cfg.putty),
      cam: { full: full, cut: { az: -48, el: 21, dist: cfg.vent ? 0.9 : cfg.ind ? 0.8 : cfg.putty ? 0.85 : 0.62, t: [xc + (cfg.vent ? 0.3 : cfg.ind ? 0.26 : cfg.putty ? 0.3 : 0.17), yj - (cfg.putty ? 0.1 : 0.02), -0.004] } },
      camS: cfg.civil && cfg.crack ? { ucut: { cut: { az: -48, el: 21, dist: 1.05, t: [xc + 0.2, (cfg.crack.y0 + cfg.crack.y1) / 2, -0.004] }, full: { az: -28, el: 15, dist: 3.2, t: [0.2, 0.75, 0.1] } } } : null, // the U-cut runs down the crack: the section camera follows it
      cfg: cfg, build: function (ctx) { build(cfg, ctx); }, state: function (st, ctx) { state(cfg, st, ctx); }, anchors: function (id, a, o, ctx) { anchors(cfg, id, a, o, ctx); }, rig: function (R) { rig(cfg, R); }, micro: function (M) { return micro(cfg, M); },
      extend: function (ctx, group, n) { return extend(cfg, ctx, group, n); }
    };
  }
  /* the same facade, continued: the simulator stands the user in front of the whole sample, so the cladding has to go on — `n` bays of 2.4 m each way
     and, for a building facade, three rows of bays above (the civil wall and the channel are one storey). Every bay is built with the sample's own kit
     and materials: the structural wall or the dark of the building behind as one long body per side, the panels or sheets of the bay split at the same
     joints as the sample (one merged mesh), the joints themselves finished — a tooled bead of sound sealant (the old, crazed sealant where the sample is
     a renewal) — including the joint where one bay meets the next and one row the next. The window, the vent, the box, the crack, the moulding and
     everything of the work itself stay on the sample. The channel keeps its floor and gets its opposite wall; the parapet keeps its coping. */
  function extend(cfg, ctx, group, n) {
    if (!ctx || ctx.cut || !ctx.parts || !ctx.parts.M) return null;
    var P = ctx.P, W = P.W, S = P.S, hw = ctx.hw, M = ctx.parts.M, H = W.h, T = W.t, BW = W.w, sid = cfg.sub === 'siding', F = ctx.formed;
    var zc = cfg.thick < 0.05 ? cfg.thick * EXG : cfg.thick, xs = cfg.vx || [], ys = cfg.hy || [], w = cfg.w * EXG, d = cfg.d * EXG, CAV = sid ? 0.018 * EXG : 0, zW = -zc - CAV;
    var faceM = sid ? M.sid : cfg.sub === 'alc' ? M.alc : F, PM = { f: faceM, e: M.edge, ab: M.alcBody }, keysP = ['e', 'e', 'e', 'e', 'f', 'e'];
    if (!sid && cfg.sub !== 'alc') keysP = ['formed', 'formed', 'formed', 'formed', 'f', 'formed']; /* a concrete face: its own formed sides, as the sample's block() gives them */
    var rows = cfg.civil || cfg.water ? 0 : 3, left = cfg.water ? 0 : n, right = n, RH = H * (rows + 1), out = { x0: -hw - left * BW, x1: hw + right * BW, y1: RH, rows: rows, kind: cfg.lap ? 'steel' : cfg.sub };
    var beadM = cfg.reno ? M.old : M.sealDone, clad = !cfg.lap && !cfg.civil && !cfg.water && cfg.sub !== 'rc', UPZ0 = new THREE.Vector3(0, 0, 1);
    function matOf(k) { return PM[k] || (k === 'ab' ? M.alcBody : k === 'e' ? M.edge : F); }
    function beadGeo(p0, p1) { var dir = new THREE.Vector3(p1[0] - p0[0], p1[1] - p0[1], 0), len = dir.length(); dir.normalize(); var xb2 = UPZ0.clone().cross(dir), g = new THREE.ExtrudeGeometry(beadShape(w, d, 'tool'), { depth: len, bevelEnabled: false, curveSegments: 6 }), m4 = new THREE.Matrix4().makeBasis(xb2, UPZ0, dir); m4.setPosition(p0[0], p0[1], 0); g.applyMatrix4(m4); return g; }
    function bay(gk, k, r) { /* one bay in its own coordinates: the panels or sheets, the beads of its joints */
      var list = [], beads = [], xb = [-hw].concat(xs).concat([hw]), yb = [0].concat(ys).concat([H]), i, j;
      if (cfg.lap) { var LP = cfg.lap, t = LP.t, yl = LP.y, xl = LP.x, SM = { s: M.steel, e: M.steelE }; /* four factory-painted sheets lapped, as the sample */
        [[-hw, xl + 0.03, 0, yl + 0.03, -3 * t, -2 * t], [xl, hw, 0, yl + 0.03, -2 * t, -t], [-hw, xl + 0.03, yl, H, -2 * t, -t], [xl, hw, yl, H, -t, 0]].forEach(function (b) { list.push(b); });
        var me = WPMerge(ctx, list, ['e', 'e', 'e', 'e', 's', 'e'], function (key) { return SM[key] || F; }); if (me) gk.add(me); return; }
      /* the seams with the neighbouring bays and rows: a gap of half the joint on each side of a seam (the whole joint on the bay's side where the neighbour is the sample itself), the bead centred in it */
      var gL = clad && k > -left ? (k === 1 && r === 0 ? w : w / 2) : 0, gR = clad && k < right ? (k === -1 && r === 0 ? w : w / 2) : 0, gB = clad && r > 0 ? (k === 0 && r === 1 ? w : w / 2) : 0, gT = clad && r < rows ? w / 2 : 0;
      xb[0] = -hw + gL; xb[xb.length - 1] = hw - gR; yb[0] = gB; yb[yb.length - 1] = H - gT;
      for (i = 0; i < xb.length - 1; i++) for (j = 0; j < yb.length - 1; j++) { var x0 = xb[i] + (i ? w / 2 : 0), x1 = xb[i + 1] - (i < xb.length - 2 ? w / 2 : 0), y0 = yb[j] + (j ? w / 2 : 0), y1 = yb[j + 1] - (j < yb.length - 2 ? w / 2 : 0); if (x1 - x0 > 0.01 && y1 - y0 > 0.01) list.push([x0, x1, y0, y1, -zc, 0]); }
      var pm = WPMerge(ctx, list, keysP, matOf); if (pm) gk.add(pm);
      xs.forEach(function (x) { beads.push(beadGeo([x, H - gT], [x, gB])); }); ys.forEach(function (y) { beads.push(beadGeo([-hw + gL, y], [hw - gR, y])); });
      if (gL) beads.push(beadGeo([-hw + gL - w / 2, H], [-hw + gL - w / 2, 0])); if (k === -1 && r === 0 && gR) beads.push(beadGeo([hw - w / 2, H], [hw - w / 2, 0])); if (gB) beads.push(beadGeo([-hw, gB - w / 2], [hw, gB - w / 2]));
      if (beads.length) { var bg = WPConcat(beads), bm = new THREE.Mesh(bg, beadM); bm.castShadow = false; bm.receiveShadow = true; gk.add(bm); }
    }
    ctx.into(group, function () {
      var side, k, r;
      for (side = -1; side <= 1; side += 2) { var nn = side > 0 ? right : left; if (!nn) continue; var a = side > 0 ? hw : -hw - nn * BW, b = side > 0 ? hw + nn * BW : -hw; /* the long bodies of this side */
        if (sid) ctx.block(a, b, 0, RH, -T + zW, zW, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']);
        else if (cfg.sub === 'steel') { ctx.block(a, b, 0, RH, -0.3, -0.29, ['k', 'k', 'k', 'k', 'k', 'k'], { k: M.dark }); for (r = 0; r <= rows; r++) [0.45, 1.5].forEach(function (gy) { ctx.block(a, b, r * H + gy - 0.05, r * H + gy + 0.05, -0.07, -0.012, ['g', 'g', 'g', 'g', 'g', 'g'], { g: M.girt }); }); }
        else if (cfg.sub === 'alc') ctx.block(a, b, 0, RH, -T - zc, -zc, ['k', 'k', 'k', 'k', 'k', 'k'], { k: M.dark });
        else ctx.block(a, b, 0, RH, cfg.sub === 'rc' ? -zc - 0.02 : -T - zc, -zc, ['b', 'b', 'b', 'b', 'b', 'b'], { b: M.back });
        if (cfg.civil) ctx.block(a + (side > 0 ? 0.03 : -0.03), b + (side > 0 ? 0.03 : -0.03), H, H + 0.09, -zc - 0.05, 0.05, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); /* the coping of the parapet */
        if (cfg.water && side > 0) { ctx.block(S.x, b, -S.y, 0, -T - 0.3, 1.4, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); ctx.block(-S.x, b, 0, H, 1.4, 1.4 + T, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); ctx.block(-S.x, b, -S.y, 0, 1.4, 1.4 + T, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); } /* the floor of the channel and its opposite wall */
      }
      if (rows) { if (sid) ctx.block(-hw, hw, H, RH, -T + zW, zW, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); else if (cfg.sub === 'steel') { ctx.block(-hw, hw, H, RH, -0.3, -0.29, ['k', 'k', 'k', 'k', 'k', 'k'], { k: M.dark }); for (r = 1; r <= rows; r++) [0.45, 1.5].forEach(function (gy) { ctx.block(-hw, hw, r * H + gy - 0.05, r * H + gy + 0.05, -0.07, -0.012, ['g', 'g', 'g', 'g', 'g', 'g'], { g: M.girt }); }); } else if (cfg.sub === 'alc') ctx.block(-hw, hw, H, RH, -T - zc, -zc, ['k', 'k', 'k', 'k', 'k', 'k'], { k: M.dark }); else ctx.block(-hw, hw, H, RH, cfg.sub === 'rc' ? -zc - 0.02 : -T - zc, -zc, ['b', 'b', 'b', 'b', 'b', 'b'], { b: M.back }); } /* above the sample */
      for (r = 0; r <= rows; r++) for (k = -left; k <= right; k++) { if (r === 0 && k === 0) continue; var gk = new THREE.Group(); gk.position.set(k * BW, r * H, 0); group.add(gk); gk.userData.bay = [k, r]; ctx.into(gk, function () { bay(gk, k, r); }); }
    });
    group.traverse(function (ob) { if (ob.isMesh) ob.userData.shared = true; }); /* the materials belong to the sample: the place must not dispose them */
    return out;
  }
  /* materials, the wall and its substructure, the panels with their joints, the parts of every stage */
  function build(cfg, ctx) {
    var P = ctx.P, W = P.W, S = P.S, hw = ctx.hw, cut = ctx.cut, XC = ctx.XC, parts = ctx.parts, block = ctx.block, mesh = ctx.mesh, keep = ctx.keep, RWp = ctx.RWp, H = W.h, T = W.t, M = {}, k;
    parts.M = M; parts.cfg = cfg; parts.joints = []; parts.progs = {}; parts.ctx = ctx; var UPZ0 = new THREE.Vector3(0, 0, 1), RM0 = new THREE.Matrix4(); /* the kit stays reachable: the simulator continues the facade with it (extend) */
    var seal = cfg.seal || 'EX', putty = !!(SLP[seal] && SLP[seal].putty), sealCol = seal === 'CLIO' ? 0xf4f7f8 : seal === 'NB101' ? 0x8b8e90 : seal === 'TF2000' ? 0x707376 : seal === 'R101' ? 0x9a9c9e : putty ? 0xd9d2c4 : 0x6d7073, sid = cfg.sub === 'siding';
    M.back = ctx.mat({ map: keep(canvasTex(CRTX.mortar(0.4, 0.4, 907, { tone: '#6f6c66', grain: 1.2, dens: 0.5, k: 0.6 }), { wrap: RWp })), color: 0x8a877f, roughness: 0.97, envMapIntensity: 0.15 }, ctx.concMats); // the wall or sheathing behind the cladding, seen through the open joint
    M.sid = ctx.mat({ map: keep(canvasTex(sidingFace(), { wrap: RWp })), roughness: 0.9, envMapIntensity: 0.28 }, ctx.concMats);
    M.alc = ctx.mat({ map: keep(canvasTex(alcFace(), { wrap: RWp })), roughness: 0.96, envMapIntensity: 0.2 }, ctx.concMats);
    M.edge = ctx.mat({ color: 0xa29d93, roughness: 0.95 }, ctx.concMats); // the sawn edge of a panel inside the joint, and its cut face
    M.alcBody = ctx.mat({ map: M.alc.map, color: 0xd9d5cb, roughness: 0.97, envMapIntensity: 0.15 }, ctx.concMats);
    M.pave = ctx.mat({ map: keep(canvasTex(TEX.slab(), { wrap: RWp, repeat: [0.8, 0.8] })), color: 0xd4d2cb, roughness: 0.93, envMapIntensity: 0.25 }, ctx.concMats);
    M.memb = ctx.mat({ color: 0xe9eaea, roughness: 0.6, envMapIntensity: 0.3 }, ctx.concMats); // the breathable membrane on the sheathing
    M.furr = ctx.mat({ map: keep(canvasTex(TEX.slab(), { wrap: RWp, repeat: [2, 2] })), color: 0xc8a06a, roughness: 0.85, envMapIntensity: 0.2 }, ctx.concMats); // the furring strips of the ventilation cavity
    M.hat = ctx.mat({ color: 0xb8bcbf, metalness: mt(0.75), roughness: 0.42, envMapIntensity: 0.8 }); M.hat.userData.op = 1; // the galvanised hat joiner behind the siding joints
    M.bbOld = ctx.mat({ color: 0x2c3540, roughness: 0.8 }); M.bb = ctx.layerMat({ color: 0x1f6fb5, roughness: 0.5, envMapIntensity: 0.4, polygonOffsetFactor: -2 }); M.bb.userData.op = 1; // the bond breaker tape: the old one dull, the new one blue
    M.old = ctx.layerMat({ map: keep(canvasTex(oldSealFace(), { wrap: RWp, repeat: [1, 8] })), color: 0xa7a49d, roughness: 0.92, envMapIntensity: 0.15, emissive: 0x1a1918 }); M.old.userData.op = 1;
    M.rod = ctx.mat({ color: 0xcfd3d6, roughness: 0.75, envMapIntensity: 0.2, emissive: 0x2a2c2e }); M.rod.userData.op = 1; // a little self-light: the rod sits deep in the shadow of the joint
    M.tape = ctx.layerMat({ color: 0xe6dcb9, roughness: 0.85, envMapIntensity: 0.2, polygonOffsetFactor: -2 }); M.tape.userData.op = 1;
    M.prim = ctx.layerMat({ color: 0xe4d38e, roughness: 0.16, envMapIntensity: 0.9, opacity: 0.55, depthWrite: false, polygonOffsetFactor: -3 }); M.prim.userData.op = 0.55;
    M.raw = ctx.layerMat({ color: sealCol, roughness: seal === 'CLIO' ? 0.08 : 0.25, envMapIntensity: seal === 'CLIO' ? 1.9 : 0.7, opacity: seal === 'CLIO' ? 0.36 : 1, depthWrite: seal !== 'CLIO', emissive: seal === 'CLIO' ? 0x000000 : 0x141516 }); M.raw.userData.op = seal === 'CLIO' ? 0.36 : 1;
    M.seal = ctx.wettable(ctx.layerMat({ color: sealCol, roughness: seal === 'CLIO' ? 0.1 : 0.42, envMapIntensity: seal === 'CLIO' ? 1.8 : 0.6, opacity: seal === 'CLIO' ? 0.36 : 1, depthWrite: seal !== 'CLIO', emissive: seal === 'CLIO' ? 0x000000 : 0x141516 })); M.seal.userData.op = seal === 'CLIO' ? 0.36 : 1;
    M.paint = ctx.wettable(ctx.layerMat({ map: keep(canvasTex(paintFace(), { wrap: RWp })), color: 0xf1ede4, roughness: 0.55, envMapIntensity: 0.35, opacity: 0.86 })); M.paint.userData.op = 0.86; // the finish lets the relief of the cladding and the line of the filled joint read through, as a painted wall does
    M.alu = ctx.mat({ map: keep(canvasTex(UXTX.alu, { wrap: RWp, repeat: [6, 1] })), color: 0xd4d7da, metalness: mt(0.7), roughness: 0.4, envMapIntensity: 1 });
    M.aluD = ctx.mat({ color: 0x2b2e32, roughness: 0.6, envMapIntensity: 0.3 });
    M.glass = ctx.mat({ color: 0xc9dde6, transparent: true, opacity: 0.38, roughness: 0.02, metalness: mt(0.15), envMapIntensity: 2.0, depthWrite: false });
    M.pvc = ctx.mat({ color: 0xe9e6dc, roughness: 0.5, envMapIntensity: 0.4 }); M.hood = ctx.mat({ color: 0xd9dcdf, metalness: mt(0.5), roughness: 0.42, envMapIntensity: 0.9 });
    M.water = ctx.mat({ color: 0x1f8fc4, transparent: true, opacity: 0.5, roughness: 0.04, envMapIntensity: 1.2, depthWrite: false });
    M.strand = ctx.mat({ map: M.old.map, color: 0xa7a49d, roughness: 0.92 }); M.curl = ctx.mat({ color: 0xe6dcb9, roughness: 0.85, side: THREE.DoubleSide });
    M.skin = ctx.layerMat({ map: keep(canvasTex(crackStrip(), { wrap: RWp })), roughness: 0.95, envMapIntensity: 0.15 }); M.skin.userData.op = 1; // the uncut concrete over the crack: the strip that the cutter takes out
    M.steel = ctx.mat({ map: keep(canvasTex(steelFace(), { wrap: RWp, repeat: [2, 2] })), color: 0xe2e3de, metalness: mt(0.3), roughness: 0.36, envMapIntensity: 1.1 }, ctx.concMats); M.steelE = ctx.mat({ color: 0x7c8084, metalness: mt(0.6), roughness: 0.5 }, ctx.concMats); // factory-painted steel sheet and its sheared edge
    M.pvcM = ctx.mat({ color: 0xeeebe2, roughness: 0.45, envMapIntensity: 0.5 }); M.nail = ctx.mat({ color: 0x8e9093, metalness: mt(0.7), roughness: 0.45 }); M.hole = ctx.mat({ color: 0x3a3732, roughness: 0.95 });
    M.sealDone = ctx.mat({ color: 0x6d7073, roughness: 0.5, envMapIntensity: 0.5 }, ctx.concMats); // the sound sealant of the board joints that are not the work of the putty scenario
    /* the ground: the pavement in front (or the channel floor) */
    var zf = cfg.water ? 1.4 : S.zf;
    block(-S.x, S.x, -S.y, 0, cfg.water ? -T - 0.3 : 0, zf, ['formed', 'formed', cfg.water ? 'formed' : 'pv', 'formed', 'formed', 'formed'], { pv: M.pave });
    if (!cfg.water) block(-S.x, S.x, -S.y, -0.02, S.zb, 0, ['soil', 'soil', 'soil', 'soil', 'soil', 'soil']);
    var zc = cfg.thick < 0.05 ? cfg.thick * EXG : cfg.thick; // the cladding: from z = -zc to 0 (a thin board is drawn at the same enlargement as the joint)
    var xs = cfg.vx || [], ys = cfg.hy || [], w = cfg.w * EXG, d = cfg.d * EXG, CAV = sid ? 0.018 * EXG : 0, zW = -zc - CAV; // the ventilation cavity of a siding wall: 18 mm furring strips on the membrane
    var backing;
    if (sid) { // the structural wall, the breathable membrane on it, the furring strips (at every joint and at 455 mm), the boards on the furring
      backing = block(-hw, hw, 0, H, -T + zW, zW, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']);
      block(-hw, hw, 0, H, zW, zW + 0.001, ['m', 'm', 'm', 'm', 'm', 'm'], { m: M.memb }, 'm');
      var FX = xs.slice(), fx; for (fx = -hw + 0.2275; fx < hw; fx += 0.455) { if (!xs.some(function (x) { return Math.abs(x - fx) < 0.12; })) FX.push(fx); } if (cfg.sash) FX = FX.filter(function (x) { return x < cfg.sash.x0 - w - 0.03 || x > cfg.sash.x1 + w + 0.03; }).concat([cfg.sash.x0 - w - 0.03, cfg.sash.x1 + w + 0.03]);
      FX.forEach(function (x) { block(x - 0.0225, x + 0.0225, 0, H, zW + 0.001, -zc, ['fr', 'fr', 'fr', 'fr', 'fr', 'fr'], { fr: M.furr }, 'fr'); }); parts.furring = FX;
    } else if (cfg.sub === 'steel') { M.dark = ctx.mat({ color: 0x33363a, roughness: 0.95, envMapIntensity: 0.1 }, ctx.concMats); M.girt = ctx.mat({ color: 0x9da2a6, metalness: mt(0.6), roughness: 0.5, envMapIntensity: 0.7 }, ctx.concMats); backing = block(-hw, hw, 0, H, -0.3, -0.29, ['k', 'k', 'k', 'k', 'k', 'k'], { k: M.dark }, 'k'); // the steel sheets hang on girts; behind them the dark inside of the housing
      [0.45, 1.5].forEach(function (gy) { block(-hw, hw, gy - 0.05, gy + 0.05, -0.07, -0.012, ['g', 'g', 'g', 'g', 'g', 'g'], { g: M.girt }, 'g'); block(-hw, hw, gy - 0.05, gy - 0.044, -0.12, -0.012, ['g', 'g', 'g', 'g', 'g', 'g'], { g: M.girt }, 'g'); }); // the C-girts
    } else if (cfg.sub === 'alc') { M.dark = ctx.mat({ color: 0x3a3c3f, roughness: 0.95, envMapIntensity: 0.1 }, ctx.concMats); backing = block(-hw, hw, 0, H, -T - zc, -zc, ['k', 'k', 'k', 'k', 'k', 'k'], { k: M.dark }, 'k'); } // ALC panels hang on the frame: behind them the dark of the building, not a wall
    else { backing = block(-hw, hw, 0, H, cfg.sub === 'rc' ? -zc - 0.02 : -T - zc, -zc, ['b', 'b', 'b', 'b', 'b', 'b'], { b: M.back }); } // for the concrete wall the joint is cut into the wall itself: a thin render behind it
    ctx.setWall(backing);
    if (cfg.civil) { block(-hw - 0.03, hw + 0.03, H, H + 0.09, -zc - 0.05, 0.05, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); } // the coping of the parapet
    if (cfg.lap) { var LP = cfg.lap, t = LP.t, yl = LP.y, xl = LP.x, SM = { s: M.steel, e: M.steelE }; // four factory-painted sheets lapped: the right over the left, the upper over the lower
      block(-hw, xl + 0.03, 0, yl + 0.03, -3 * t, -2 * t, ['e', 'e', 'e', 'e', 's', 'e'], SM, 'e'); block(xl, hw, 0, yl + 0.03, -2 * t, -t, ['e', 'e', 'e', 'e', 's', 'e'], SM, 'e');
      block(-hw, xl + 0.03, yl, H, -2 * t, -t, ['e', 'e', 'e', 'e', 's', 'e'], SM, 'e'); block(xl, hw, yl, H, -t, 0, ['e', 'e', 'e', 'e', 's', 'e'], SM, 'e');
      [-0.9, -0.2, 1.2].forEach(function (gx) { [0.45, 1.5].forEach(function (gy) { var sc = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 18)), M.nail); sc.rotation.x = Math.PI / 2; sc.position.set(gx, gy, gx > xl ? 0.0015 : -t + 0.0015); sc.castShadow = false; ctx.g.add(sc); }); }); // the fixing screws on the girt lines
      if (cfg.mould) { var MD = cfg.mould; block(MD.x0, MD.x1, MD.y0, MD.y1, 0, 0.02, ['p', 'p', 'p', 'p', 'p', 'p'], { p: M.pvcM }, 'p'); block(MD.x0 + 0.003, MD.x1 - 0.003, MD.y0 + 0.003, MD.y1 - 0.003, 0.02, 0.023, ['p', 'p', 'p', 'p', 'p', 'p'], { p: M.pvcM }, 'p'); } // the cable moulding: a PVC raceway with its clip-on lid
    }
    if (cfg.water) { block(-S.x, -hw, 0, H * 0.55, -T - 0.3, 0.6, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); } // the return wall of the channel at the far end
    /* the cladding panels, split at the joints; every joint is recorded with its geometry */
    var faceM = sid ? M.sid : cfg.sub === 'alc' ? M.alc : ctx.formed, cutK = sid ? 'e' : cfg.sub === 'alc' ? 'ab' : undefined, PM = { f: faceM, e: M.edge, ab: M.alcBody }, J = [];
    function joint(id, kind, p0, p1, w, d, extra) { var j = { id: id, kind: kind, p0: p0, p1: p1, w: w, d: d, dir: p1.clone().sub(p0).normalize() }; if (extra) { for (var q in extra) j[q] = extra[q]; } J.push(j); return j; }
    var xb = [-hw].concat(xs).concat([hw]), yb = [0].concat(ys).concat([H]), i, j;
    var open = cfg.sash ? cfg.sash : null;
    if (cfg.lap) { xb = []; yb = []; }
    for (i = 0; i < xb.length - 1; i++) for (j = 0; j < yb.length - 1; j++) {
      var x0 = xb[i] + (i ? w / 2 : 0), x1 = xb[i + 1] - (i < xb.length - 2 ? w / 2 : 0), y0 = yb[j] + (j ? w / 2 : 0), y1 = yb[j + 1] - (j < yb.length - 2 ? w / 2 : 0);
      if (open) { // the panel with the opening is built as four pieces around it
        var ox0 = open.x0 - w, ox1 = open.x1 + w, oy0 = open.y0 - w, oy1 = open.y1 + w;
        if (x0 < ox1 && x1 > ox0 && y0 < oy1 && y1 > oy0) { block(x0, ox0, y0, y1, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK); block(ox1, x1, y0, y1, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK); block(ox0, ox1, y0, oy0, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK); block(ox0, ox1, oy1, y1, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK); continue; }
      }
      if (cfg.crack && cfg.civil && x0 < cfg.crack.x && x1 > cfg.crack.x && y0 < cfg.crack.y1 && y1 > cfg.crack.y0) { // the crack groove carved out of this panel: the wall on either side, the wall above and below the groove, the groove floor
        var cx = cfg.crack.x, hc = 0.01 * EXG / 2, dc = 0.01 * EXG, ca = Math.max(y0, cfg.crack.y0), cb = Math.min(y1, cfg.crack.y1);
        block(x0, cx - hc, y0, y1, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK); block(cx + hc, x1, y0, y1, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK);
        if (ca > y0) block(cx - hc, cx + hc, y0, ca, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK); if (cb < y1) block(cx - hc, cx + hc, cb, y1, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK);
        block(cx - hc, cx + hc, ca, cb, -zc, -dc, ['e', 'e', 'e', 'e', 'e', 'e'], PM, cutK); continue; }
      if (cfg.crack && cfg.putty && y0 < cfg.crack.y && y1 > cfg.crack.y && x0 < cfg.crack.x1 && x1 > cfg.crack.x0) {
        var cy = cfg.crack.y, hp = cfg.w * EXG / 2, dp = cfg.d * EXG, pa = Math.max(x0, cfg.crack.x0), pb = Math.min(x1, cfg.crack.x1);
        block(x0, x1, y0, cy - hp, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK); block(x0, x1, cy + hp, y1, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK);
        if (pa > x0) block(x0, pa, cy - hp, cy + hp, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK); if (pb < x1) block(pb, x1, cy - hp, cy + hp, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK);
        block(pa, pb, cy - hp, cy + hp, -zc, -dp, ['e', 'e', 'e', 'e', 'e', 'e'], PM, cutK); continue; }
      block(x0, x1, y0, y1, -zc, 0, ['e', 'e', 'e', 'e', 'f', 'e'], PM, cutK);
    }
    var sJ = cfg.staticJoints ? { stat: true } : null; // the putty scenario: the board joints are sound and already sealed — they are drawn, not worked
    xs.forEach(function (x, n) { if (cut && x < XC + 0.02) return; joint('v' + n, 'v', new THREE.Vector3(x, H, 0), new THREE.Vector3(x, 0, 0), w, d, sJ); });
    ys.forEach(function (y, n) { joint('h' + n, 'h', new THREE.Vector3(-hw, y, 0), new THREE.Vector3(hw, y, 0), w, d, sJ); });
    /* the shrinkage crack of the civil scenario (vertical, up to the construction joint) and the opened crack of the putty scenario (horizontal, part of a board) */
    if (cfg.crack && cfg.civil) { var CK = cfg.crack, wc = 0.01 * EXG; if (!(cut && CK.x < XC + 0.02)) joint('crack', 'v', new THREE.Vector3(CK.x, CK.y1, 0), new THREE.Vector3(CK.x, CK.y0, 0), wc, 0.01 * EXG, { ucut: true }); }
    if (cfg.crack && cfg.putty) { var CP = cfg.crack; joint('crack', 'h', new THREE.Vector3(CP.x0, CP.y, 0), new THREE.Vector3(CP.x1, CP.y, 0), cfg.w * EXG, cfg.d * EXG, { opened: true }); }
    /* the lap seams of the steel wall: the horizontal lap on each half (the lower sheet's face lies one sheet lower on the left), the vertical lap above and below it */
    if (cfg.lap) { var LQ = cfg.lap, tq = LQ.t, aL = cfg.w * EXG, dn = new THREE.Vector3(0, -1, 0), lf = new THREE.Vector3(-1, 0, 0);
      joint('lapHL', 'h', new THREE.Vector3(-hw, LQ.y, 0), new THREE.Vector3(LQ.x, LQ.y, 0), aL, 0.001, { lap: true, away: dn, z0: -2 * tq, step: tq });
      joint('lapHR', 'h', new THREE.Vector3(LQ.x, LQ.y, 0), new THREE.Vector3(hw, LQ.y, 0), aL, 0.001, { lap: true, away: dn, z0: -tq, step: tq });
      joint('lapVU', 'v', new THREE.Vector3(LQ.x, H, 0), new THREE.Vector3(LQ.x, LQ.y, 0), aL, 0.001, { lap: true, away: lf, z0: -tq, step: tq });
      joint('lapVL', 'v', new THREE.Vector3(LQ.x, LQ.y, 0), new THREE.Vector3(LQ.x, 0, 0), aL, 0.001, { lap: true, away: lf, z0: -2 * tq, step: tq });
      if (cfg.mould) { var MQ = cfg.mould, wm = 0.01; joint('mTop', 'h', new THREE.Vector3(MQ.x0, MQ.y1 + wm / 2, 0), new THREE.Vector3(MQ.x1, MQ.y1 + wm / 2, 0), wm, 0.001, { fillet: true, away: new THREE.Vector3(0, 1, 0) }); joint('mBottom', 'h', new THREE.Vector3(MQ.x1, MQ.y0 - wm / 2, 0), new THREE.Vector3(MQ.x0, MQ.y0 - wm / 2, 0), wm, 0.001, { fillet: true, away: new THREE.Vector3(0, -1, 0) }); } }
    if (cfg.ebox && !cfg.vent) { var EB2 = cfg.ebox; parts.ebox = EB2; block(EB2.x0, EB2.x1, EB2.y0, EB2.y1, 0, 0.045, ['p', 'p', 'p', 'p', 'p', 'p'], { p: M.pvcM }, 'p'); block(EB2.x0 + 0.006, EB2.x1 - 0.006, EB2.y0 + 0.006, EB2.y1 - 0.006, 0.045, 0.052, ['p', 'p', 'p', 'p', 'p', 'p'], { p: M.pvcM }, 'p');
      var wf2 = 0.01; joint('eTop', 'h', new THREE.Vector3(EB2.x0 - wf2, EB2.y1 + wf2 / 2, 0), new THREE.Vector3(EB2.x1 + wf2, EB2.y1 + wf2 / 2, 0), wf2, 0.001, { fillet: true, away: new THREE.Vector3(0, 1, 0) }); joint('eRight', 'v', new THREE.Vector3(EB2.x1 + wf2 / 2, EB2.y1, 0), new THREE.Vector3(EB2.x1 + wf2 / 2, EB2.y0, 0), wf2, 0.001, { fillet: true, away: new THREE.Vector3(1, 0, 0) }); joint('eBottom', 'h', new THREE.Vector3(EB2.x1 + wf2, EB2.y0 - wf2 / 2, 0), new THREE.Vector3(EB2.x0 - wf2, EB2.y0 - wf2 / 2, 0), wf2, 0.001, { fillet: true, away: new THREE.Vector3(0, -1, 0) }); joint('eLeft', 'v', new THREE.Vector3(EB2.x0 - wf2 / 2, EB2.y0, 0), new THREE.Vector3(EB2.x0 - wf2 / 2, EB2.y1, 0), wf2, 0.001, { fillet: true, away: new THREE.Vector3(-1, 0, 0) }); } // the junction box of the industrial scenario, worked round like the electrical box
    /* the window: an aluminium frame in the opening, glass, and the perimeter joint worked round it in one continuous run — top, right side down, bottom back, left side up */
    if (open) { var fx0 = open.x0, fx1 = open.x1, fy0 = open.y0, fy1 = open.y1, ft = 0.05, fd = 0.07;
      [[fx0, fx0 + ft, fy0, fy1], [fx1 - ft, fx1, fy0, fy1], [fx0, fx1, fy0, fy0 + ft], [fx0, fx1, fy1 - ft, fy1]].forEach(function (b) { block(b[0], b[1], b[2], b[3], -zc - 0.03, -zc + fd, ['a', 'a', 'a', 'a', 'a', 'a'], { a: M.alu }, 'a'); });
      block(fx0 + ft, fx1 - ft, fy0 + ft, fy1 - ft, -zc - 0.02, -zc - 0.012, ['g', 'g', 'g', 'g', 'g', 'g'], { g: M.glass }, 'g');
      block(fx0 + ft, fx1 - ft, fy0 + ft, fy1 - ft, -zc - 0.032, -zc - 0.02, ['d', 'd', 'd', 'd', 'd', 'd'], { d: M.aluD }, 'd'); // the dark interior behind the glass
      block(fx0 - w, fx1 + w, fy0 - w, fy0, -zc - 0.06, -zc - 0.03, ['a', 'a', 'a', 'a', 'a', 'a'], { a: M.alu }, 'a'); // the sill
      joint('top', 'h', new THREE.Vector3(fx0 - w, fy1 + w / 2, 0), new THREE.Vector3(fx1 + w, fy1 + w / 2, 0), w, d, { sash: true });
      joint('right', 'v', new THREE.Vector3(fx1 + w / 2, fy1, 0), new THREE.Vector3(fx1 + w / 2, fy0, 0), w, d, { sash: true });
      joint('bottom', 'h', new THREE.Vector3(fx1 + w, fy0 - w / 2, 0), new THREE.Vector3(fx0 - w, fy0 - w / 2, 0), w, d, { sash: true });
      joint('left', 'v', new THREE.Vector3(fx0 - w / 2, fy0, 0), new THREE.Vector3(fx0 - w / 2, fy1, 0), w, d, { sash: true });
      parts.open = open; }
    /* the penetrations: a round vent hood on its flange and an electrical box; their seals are fillets, the box worked round in one run */
    if (cfg.vent) { var V = cfg.vent, EB = cfg.ebox; parts.vent = V; parts.ebox = EB;
      var hood = new THREE.Group(); ctx.g.add(hood); hood.position.set(V.x, V.y, 0);
      var fl = new THREE.Mesh(keep(new THREE.CylinderGeometry(V.r, V.r, 0.004, 48)), M.hood); fl.rotation.x = Math.PI / 2; fl.position.z = 0.002; fl.castShadow = true; hood.add(fl); // the flange on the wall
      var body = new THREE.Mesh(keep(new THREE.CylinderGeometry(V.r * 0.72, V.r * 0.72, 0.05, 48)), M.hood); body.rotation.x = Math.PI / 2; body.position.z = 0.029; body.castShadow = true; hood.add(body); // the drum
      var cap = new THREE.Mesh(keep(new THREE.SphereGeometry(V.r * 0.72, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2)), M.hood); cap.rotation.x = Math.PI / 2; cap.scale.z = 0.5; cap.position.z = 0.054; cap.castShadow = true; hood.add(cap); // the domed front, pointing out of the wall
      var slot = new THREE.Mesh(keep(new THREE.BoxGeometry(V.r * 0.9, 0.014, 0.03)), M.aluD); slot.position.set(0, -V.r * 0.62, 0.032); hood.add(slot); // the louvre opening at the underside: the cap breathes downwards
      joint('ring', 'ring', new THREE.Vector3(V.x, V.y, 0), new THREE.Vector3(V.x + Math.PI * 2 * (V.r + 0.005), V.y, 0), 0.01, 0.01, { cx: V.x, cy: V.y, r: V.r + 0.004 });
      block(EB.x0, EB.x1, EB.y0, EB.y1, 0, 0.045, ['p', 'p', 'p', 'p', 'p', 'p'], { p: M.pvc }, 'p'); block(EB.x0 + 0.006, EB.x1 - 0.006, EB.y0 + 0.006, EB.y1 - 0.006, 0.045, 0.052, ['p', 'p', 'p', 'p', 'p', 'p'], { p: M.pvc }, 'p');
      var wf = 0.01; joint('eTop', 'h', new THREE.Vector3(EB.x0 - wf, EB.y1 + wf / 2, 0), new THREE.Vector3(EB.x1 + wf, EB.y1 + wf / 2, 0), wf, 0.001, { fillet: true, away: new THREE.Vector3(0, 1, 0) }); joint('eRight', 'v', new THREE.Vector3(EB.x1 + wf / 2, EB.y1, 0), new THREE.Vector3(EB.x1 + wf / 2, EB.y0, 0), wf, 0.001, { fillet: true, away: new THREE.Vector3(1, 0, 0) }); joint('eBottom', 'h', new THREE.Vector3(EB.x1 + wf, EB.y0 - wf / 2, 0), new THREE.Vector3(EB.x0 - wf, EB.y0 - wf / 2, 0), wf, 0.001, { fillet: true, away: new THREE.Vector3(0, -1, 0) }); joint('eLeft', 'v', new THREE.Vector3(EB.x0 - wf / 2, EB.y0, 0), new THREE.Vector3(EB.x0 - wf / 2, EB.y1, 0), wf, 0.001, { fillet: true, away: new THREE.Vector3(-1, 0, 0) }); }
    /* the section keeps what lies right of the saw: horizontal joints are shortened to it, vertical ones left of it dropped; every joint then knows its length */
    if (cut) J.forEach(function (jj) { if (jj.kind === 'h') { jj.p0.x = Math.max(jj.p0.x, XC); jj.p1.x = Math.max(jj.p1.x, XC); } });
    parts.joints = J.filter(function (jj) { return jj.kind === 'ring' || (!(cut && jj.kind === 'v' && jj.p0.x < XC + 0.02) && jj.p1.clone().sub(jj.p0).length() > 0.02); });
    parts.joints.filter(function (jj) { return jj.stat; }).forEach(function (jj) { var e = jj.dir.clone(), xb2 = UPZ0.clone().cross(e), me = new THREE.Mesh(keep(new THREE.ExtrudeGeometry(beadShape(jj.w, jj.d, 'tool'), { depth: jj.p1.clone().sub(jj.p0).length(), bevelEnabled: false, curveSegments: 8 })), M.sealDone); RM0.makeBasis(xb2, UPZ0, e); me.setRotationFromMatrix(RM0); me.position.copy(jj.p0); me.castShadow = false; ctx.g.add(me); }); // the sound joints of the putty scenario: a tooled bead, there from the start
    parts.joints = parts.joints.filter(function (jj) { return !jj.stat; });
    if (!cfg.sash && !cfg.vent && !cfg.lap) parts.joints.sort(function (a, b) { return (a.kind === 'h' ? 0 : 1) - (b.kind === 'h' ? 0 : 1); }); // the horizontal joint first: it starts at the saw face, so the section watches every tool begin its run
    if (cfg.lap) parts.joints.sort(function (a, b) { var o = function (j) { return j.id === 'lapHR' ? 0 : j.id === 'lapHL' ? 1 : j.lap ? 2 : j.fillet ? 3 : 4; }; return o(a) - o(b); });
    if (cfg.sash) parts.joints.sort(function (a, b) { var o = function (j) { return j.id === 'top' ? 0 : j.id === 'right' ? 1 : j.id === 'bottom' ? 2 : j.id === 'left' ? 3 : 4; }; return o(a) - o(b); }); // the window perimeter first — the top joint starts at the saw face — then the panel joint // the lap at the saw face first, then the other laps, then the moulding and the box
    parts.joints.forEach(function (jj) { jj.len = jj.dir.dot(jj.p1.clone().sub(jj.p0)); jj.across = jj.kind === 'h' ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0); jj.mid = function (t) { return jj.p0.clone().add(jj.dir.clone().multiplyScalar(t == null ? jj.len / 2 : t)); }; });
    /* where joints meet: every straight joint records the perpendicular joints that cross it, and on which of its two sides the other joint continues. Tapes, primer and bond breaker stop at the panel
       corners (nothing may lie across an open joint, or the gun could not fill the crossing); the vertical rod butts against the horizontal one; the horizontal joiner against the vertical one */
    parts.joints.forEach(function (jj) { jj.cross = []; if (jj.kind !== 'h' && jj.kind !== 'v' || jj.fillet) return; var ax = jj.kind === 'h' ? 'x' : 'y', ay = jj.kind === 'h' ? 'y' : 'x';
      parts.joints.forEach(function (jk) { if (jk === jj || jk.kind === jj.kind || jk.kind === 'ring' || jk.fillet) return; var t = (jk.p0[ax] - jj.p0[ax]) * jj.dir[ax], lo = Math.min(jk.p0[ay], jk.p1[ay]), hi = Math.max(jk.p0[ay], jk.p1[ay]), c = jj.p0[ay]; if (t < -jk.w / 2 - 0.001 || t > jj.len + jk.w / 2 + 0.001) return; if (c < lo - jj.w / 2 - 0.001 || c > hi + jj.w / 2 + 0.001) return;
        jj.cross.push({ t: t, w: jk.w, plus: hi > c + jj.w / 2 + 0.002, minus: lo < c - jj.w / 2 - 0.002, j: jk }); });
      if (jj.sash && open) { var fc = new THREE.Vector3((open.x0 + open.x1) / 2, (open.y0 + open.y1) / 2, 0); jj.frameSide = jj.across.dot(fc.clone().sub(jj.p0)) > 0 ? 1 : -1; } }); // which side of a perimeter joint the frame is on
    /* the layers of every joint: the old bead (renewal), the hat joiner with its bond breaker (siding), the rod, the two tapes, the primer strips, the raw bead, the tooled bead — each behind its own clip */
    var RM = new THREE.Matrix4(), UPZ = new THREE.Vector3(0, 0, 1);
    function orient(m, jj) { var e = jj.dir.clone(), xb2 = UPZ.clone().cross(e); RM.makeBasis(xb2, UPZ, e); m.setRotationFromMatrix(RM); m.position.copy(jj.p0); return m; } // the profile's u across the joint, v outward, extruded along the joint's own direction
    function extrude(shape, jj, mat, o) { var geo = keep(new THREE.ExtrudeGeometry(shape, { depth: jj.len, bevelEnabled: false, curveSegments: 10 })), me = new THREE.Mesh(geo, mat); me.castShadow = false; me.receiveShadow = true; ctx.g.add(me); orient(me, jj); if (o && o.dz) me.position.z += o.dz; return me; }
    function strip(jj, off, thick, zc0, zc1, mat) { var L = jj.len, geo, me, c = jj.mid(); if (jj.kind === 'h') { geo = keep(new THREE.BoxGeometry(L, thick, zc1 - zc0)); me = new THREE.Mesh(geo, mat); me.position.set(c.x, c.y + off, (zc0 + zc1) / 2); } else { geo = keep(new THREE.BoxGeometry(thick, L, zc1 - zc0)); me = new THREE.Mesh(geo, mat); me.position.set(c.x + off, c.y, (zc0 + zc1) / 2); } me.castShadow = false; ctx.g.add(me); return me; } // a box along the joint, `off` across it in world terms (+y for horizontal joints, +x for vertical ones)
    function spans(jj, o) { var L = jj.len, cuts = [], iv = [], a = 0; (jj.cross || []).forEach(function (cr) { if (o.use && !o.use(cr)) return; if (o.side > 0 && !cr.plus) return; if (o.side < 0 && !cr.minus) return; var h = o.half ? o.half(cr) : cr.w / 2; cuts.push([cr.t - h, cr.t + h]); }); cuts.sort(function (p, q) { return p[0] - q[0]; }); cuts.forEach(function (ck) { if (ck[0] > a + 0.004) iv.push([a, Math.min(L, ck[0])]); a = Math.max(a, ck[1]); }); if (L > a + 0.004) iv.push([a, L]); return iv; } // the free runs of a joint between the crossings that concern this element (o.side: the element sits on that side of the joint and stops only where the crossing joint continues on that side)
    function strips(jj, off, thick, zc0, zc1, mat, o) { return spans(jj, o || { side: off > 0 ? 1 : off < 0 ? -1 : 0 }).map(function (sp) { var len = sp[1] - sp[0], c = jj.mid((sp[0] + sp[1]) / 2), geo, me; if (jj.kind === 'h') { geo = keep(new THREE.BoxGeometry(len, thick, zc1 - zc0)); me = new THREE.Mesh(geo, mat); me.position.set(c.x, c.y + off, (zc0 + zc1) / 2); } else { geo = keep(new THREE.BoxGeometry(thick, len, zc1 - zc0)); me = new THREE.Mesh(geo, mat); me.position.set(c.x + off, c.y, (zc0 + zc1) / 2); } me.castShadow = false; ctx.g.add(me); return me; }); } // like strip, in pieces that end at the panel corners
    function rods(jj, rr, zr, sz, o) { return spans(jj, o).map(function (sp) { var len = sp[1] - sp[0], c = jj.mid((sp[0] + sp[1]) / 2), me = new THREE.Mesh(keep(new THREE.CylinderGeometry(rr, rr, len, 18)), M.rod); if (jj.kind === 'h') me.rotation.z = Math.PI / 2; me.position.set(c.x, c.y, zr); me.scale.set(1, 1, sz); me.castShadow = false; ctx.g.add(me); return me; }); }
    var NOCUT = { use: function () { return false; } }, FRAME = { use: function (cr) { return !!cr.j.sash; }, half: function (cr) { return cr.w / 2; } }, VONLY = { use: function (cr) { return cr.j.kind === 'v'; } }, HONLY = { use: function (cr) { return cr.j.kind === 'h'; } };
    parts.joints.forEach(function (jj) {
      var PG = { old: new Prog(ctx, jj), oldGone: new Prog(ctx, jj), bb: new Prog(ctx, jj), rod: new Prog(ctx, jj), tapeA: new Prog(ctx, jj), tapeB: new Prog(ctx, jj), prim: new Prog(ctx, jj), primGone: new Prog(ctx, jj), raw: new Prog(ctx, jj), rawGone: new Prog(ctx, jj), seal: new Prog(ctx, jj) }; parts.progs[jj.id] = PG; jj.PG = PG;
      if (jj.kind === 'ring') { // the hood: the tape on the wall round the flange, the tape on the flange, the primer as a ring on the flange edge, the fillet swept round it
        var R0 = jj.r, segs = 64, tapeIn = new THREE.Mesh(keep(sweep([[0.012, 0.0025], [0.036, 0.0025]], segs, R0)), M.tape); tapeIn.position.set(jj.cx, jj.cy, 0); ctx.g.add(tapeIn); PG.tapeA.add(tapeIn, 'to');
        var flangeTape = new THREE.Mesh(keep(sweep([[-0.03, 0.0045], [-0.012, 0.0045]], segs, R0)), M.tape); flangeTape.position.set(jj.cx, jj.cy, 0); ctx.g.add(flangeTape); PG.tapeB.add(flangeTape, 'to');
        var prim = new THREE.Mesh(keep(sweep([[0, 0.0007], [0.012, 0.0007], [0.012, 0.0007], [0, 0.0058]], segs, R0)), M.prim); prim.position.set(jj.cx, jj.cy, 0); ctx.g.add(prim); PG.prim.add(prim, 'to'); PG.primGone.add(prim, 'from');
        var fr = new THREE.Mesh(keep(sweep([[0, 0.0009], [0.0125, 0.0009], [0.0095, 0.004], [0.0058, 0.0075], [0.0015, 0.0105], [0, 0.011]], segs, R0)), M.raw); fr.position.set(jj.cx, jj.cy, 0); ctx.g.add(fr); PG.raw.add(fr, 'to'); PG.rawGone.add(fr, 'from');
        var ft = new THREE.Mesh(keep(sweep([[0, 0.0009], [0.011, 0.0009], [0.0075, 0.0034], [0.004, 0.0064], [0.0015, 0.0092], [0, 0.0105]], segs, R0)), M.seal); ft.position.set(jj.cx, jj.cy, 0); ctx.g.add(ft); PG.seal.add(ft, 'to');
        jj.face = 0.011; jj.tapeOff = [0.024, -0.021]; return; }
      if (jj.fillet) { // the box: a straight fillet against the flank of the box, on the face; the tape on the wall side only
        var a = 0.011, sh = filletShape(a), fr2 = extrude(sh, jj, M.raw), ft2 = extrude(sh, jj, M.seal), xb3 = UPZ.clone().cross(jj.dir), sgn = xb3.dot(jj.away) > 0 ? 1 : -1, offB = -jj.away.clone().multiplyScalar(jj.w / 2);
        [fr2, ft2].forEach(function (me) { me.position.add(offB); me.scale.x = sgn; me.position.z = 0.0008; }); // the fillet's wall leg points away from the box, its upright leg stands against the box flank
        fr2.scale.y = 1.25; PG.raw.add(fr2, 'to'); PG.rawGone.add(fr2, 'from'); PG.seal.add(ft2, 'to');
        var awayOff = jj.kind === 'h' ? jj.away.y : jj.away.x, tp = strip(jj, awayOff * (jj.w / 2 + 0.014), 0.024, 0.0004, 0.0009, M.tape); PG.tapeA.add(tp, 'to');
        var pr = strip(jj, awayOff * (-jj.w / 2 + 0.0055), 0.011, 0.0005, 0.0011, M.prim); PG.prim.add(pr, 'to'); PG.primGone.add(pr, 'from'); jj.face = 0.011; jj.tapeOff = [awayOff * (jj.w / 2 + 0.014), null]; return; }
      if (jj.lap) { // a lap seam: the bead sits on the lower sheet, rides over the sheet end and laps a little onto the upper sheet; the tape on the lower sheet only
        var a2 = jj.w, b2 = 0.004, stp = jj.step, frL = extrude(lapShape(stp, a2, b2, true), jj, M.raw), ftL = extrude(lapShape(stp, a2, b2, false), jj, M.seal), xbL = UPZ.clone().cross(jj.dir), sgL = xbL.dot(jj.away) > 0 ? 1 : -1;
        [frL, ftL].forEach(function (me) { me.scale.x = sgL; me.position.z = jj.z0 + 0.0003; }); PG.raw.add(frL, 'to'); PG.rawGone.add(frL, 'from'); PG.seal.add(ftL, 'to');
        var awL = jj.kind === 'h' ? jj.away.y : jj.away.x; strips(jj, awL * (a2 + 0.013), 0.024, jj.z0 + 0.0003, jj.z0 + 0.0008, M.tape, NOCUT).forEach(function (tp) { PG.tapeA.add(tp, 'to'); });
        if (!M.shade) M.shade = ctx.mat({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false, polygonOffsetFactor: -1 }); strips(jj, awL * 0.004, 0.008, jj.z0 + 0.00012, jj.z0 + 0.0002, M.shade, NOCUT); // the contact shadow of the sheet end on the lower sheet: the step reads at any size
        jj.face = jj.z0 + stp + 0.004; jj.tapeZ = jj.z0; jj.tapeOff = [awL * (a2 + 0.013), null]; return; }
      var wj = jj.w, dj = jj.d, zBot = -zc; // the bottom of the open joint: the back of the boards — or the top of the hat joiner on a siding wall
      if (jj.ucut) { var sk = strip(jj, 0, wj + 0.014, -0.0012, 0.0006, M.skin); PG.old.add(sk, 'from'); jj.skin = sk; } // the crack: the uncut concrete over the groove, taken out by the cutter from the start of the joint
      if (sid && !jj.sash) { // the hat joiner under a siding joint: flanges on the furring, the web up into the joint, its top face a little proud of the boards' back, the old bond breaker on it
        var hz0 = -zc - 0.0012, hz1 = -zc + 0.004, hwid = wj / 2 + 0.004; zBot = hz1;
        var hatO = jj.kind === 'h' ? { use: function (cr) { return cr.j.kind === 'v'; }, half: function (cr) { return cr.w / 2 + 0.03; } } : NOCUT; // the vertical joiner runs through, the horizontal one butts against it
        strips(jj, 0, 2 * hwid, hz1 - 0.001, hz1, M.hat, hatO); strips(jj, hwid - 0.0005, 0.001, hz0, hz1, M.hat, hatO); strips(jj, -hwid + 0.0005, 0.001, hz0, hz1, M.hat, hatO); strips(jj, hwid + 0.012, 0.024, hz0, hz0 + 0.001, M.hat, hatO); strips(jj, -hwid - 0.012, 0.024, hz0, hz0 + 0.001, M.hat, hatO);
        var bbO = { half: function (cr) { return cr.w / 2 + 0.004; } };
        if (cfg.reno) strips(jj, 0, wj * 0.9, hz1, hz1 + 0.0004, M.bbOld, bbO).forEach(function (bbo) { PG.old.add(bbo, 'from'); }); // the old bond breaker comes out with the old sealant
        strips(jj, 0, wj * 0.9, hz1, hz1 + 0.0005, M.bb, bbO).forEach(function (bbn) { PG.bb.add(bbn, 'to'); }); jj.hasBB = true; }
      if (cfg.reno) { var old = extrude(beadShape(wj * 0.92, dj * 0.8, 'old'), jj, M.old, { dz: -0.001 }); PG.old.add(old, 'from'); jj.old = old; } // the old sealant: shrunk, crazed, a little below the face; removed from the start of the joint
      var avail = Math.max(0.003, (-dj) - zBot), rr = wj / 2, zr = -dj - Math.min(avail, 2 * rr) / 2; // the rod: as wide as the joint, compressed to what is left of the depth behind the sealant (a thin board takes a flat, squeezed rod; a deep joint a round one that stays where it is pressed)
      if (!jj.ucut && !jj.opened) rods(jj, rr, zr, Math.min(1, avail / (2 * rr)), jj.kind === 'v' ? HONLY : NOCUT).forEach(function (rod) { PG.rod.add(rod, 'to'); }); jj.rodZ = zr; // the horizontal rod runs through the crossing, the vertical rods butt against it; a U-cut groove and an opened crack take no rod
      var fs = jj.frameSide || 0, offA = wj / 2 + 0.013, offB = -wj / 2 - 0.013; jj.tapeOff = [fs > 0 ? wj / 2 + 0.002 : offA, fs < 0 ? -wj / 2 - 0.002 : offB];
      (fs > 0 ? strips(jj, fs * (wj / 2 + 0.0004), 0.0008, 0.0004, 0.026, M.tape, FRAME) : strips(jj, offA, 0.024, 0.0004, 0.0009, M.tape)).forEach(function (t) { PG.tapeA.add(t, 'to'); });
      (fs < 0 ? strips(jj, fs * (wj / 2 + 0.0004), 0.0008, 0.0004, 0.026, M.tape, FRAME) : strips(jj, offB, 0.024, 0.0004, 0.0009, M.tape)).forEach(function (t) { PG.tapeB.add(t, 'to'); }); // the tapes along both edges, each stopping at the panel corners; at a window frame the inner tape goes up the frame's flank
      strips(jj, wj / 2 - 0.0004, 0.0008, -dj - 0.002, 0, M.prim).concat(strips(jj, -wj / 2 + 0.0004, 0.0008, -dj - 0.002, 0, M.prim)).forEach(function (pr) { PG.prim.add(pr, 'to'); PG.primGone.add(pr, 'from'); }); // the primer on both flanks of the joint (a flank ends where a crossing joint opens), hidden again behind the bead
      var raw = extrude(beadShape(wj, dj, 'raw'), jj, M.raw), tooled = extrude(beadShape(wj, dj, jj.opened ? 'flat' : 'tool'), jj, M.seal); PG.raw.add(raw, 'to'); PG.rawGone.add(raw, 'from'); PG.seal.add(tooled, 'to'); jj.face = 0;
    });
    /* the strand of old sealant being pulled out, and the two ribbons of tape peeling off: curls that follow the fronts */
    function curl(mat, r, big) { var c = new THREE.CatmullRomCurve3(big ? [new THREE.Vector3(0, 0, -0.004), new THREE.Vector3(0.01, 0.015, 0.02), new THREE.Vector3(0.03, 0.055, 0.045), new THREE.Vector3(0.02, 0.1, 0.03)] : [new THREE.Vector3(0, 0, 0.0005), new THREE.Vector3(0, -0.012, 0.012), new THREE.Vector3(0, -0.03, 0.035), new THREE.Vector3(0, -0.06, 0.05)]), me = new THREE.Mesh(keep(new THREE.TubeGeometry(c, 16, r, 14, false)), mat); me.visible = false; ctx.g.add(me); return me; }
    if (cfg.reno) parts.strand = curl(M.strand, 0.0045, true);
    parts.curlA = curl(M.curl, 0.0022); parts.curlB = curl(M.curl, 0.0022); parts.curlA.scale.x = 4; parts.curlB.scale.x = 4; // flattened tubes: ribbons
    /* the nail heads of the putty scenario: the dimple of every face nail on the furring lines (two rows per board); for each, the dab of primer, the dab of putty and the struck-off putty */
    if (cfg.nails) { parts.nails = []; var NXs = parts.furring || [], ry = [0.06, (ys[0] || 0.95) - w / 2 - 0.045, (ys[0] || 0.95) + w / 2 + 0.045, H - 0.06];
      NXs.forEach(function (nx) { if (xs.some(function (x) { return Math.abs(x - nx) < 0.01; })) return; if (cut && nx < XC + 0.03) return; ry.forEach(function (ny) {
        function disc(r2, h2, z2, m2) { var me = new THREE.Mesh(keep(new THREE.CylinderGeometry(r2, r2, h2, 18)), m2); me.rotation.x = Math.PI / 2; me.position.set(nx, ny, z2); me.castShadow = false; ctx.g.add(me); return me; }
        var hole = disc(0.0064, 0.0004, 0.0002, M.hole), head = disc(0.0038, 0.0004, 0.0005, M.nail), pr = disc(0.0094, 0.0004, 0.0008, M.prim), flat = disc(0.0098, 0.0009, 0.0012, M.seal), dab = new THREE.Mesh(keep(new THREE.SphereGeometry(0.0092, 20, 12)), M.raw); dab.scale.set(1, 1, 0.42); dab.position.set(nx, ny, 0.0008); dab.castShadow = false; ctx.g.add(dab);
        pr.visible = false; dab.visible = false; flat.visible = false; parts.nails.push({ x: nx, y: ny, pr: pr, dab: dab, flat: flat }); }); });
      parts.nails.sort(function (a, b) { return a.y - b.y || a.x - b.x; }); }
    /* the paint over everything (the painted scenario), the water of the channel (the water scenario) */
    if (cfg.paint) parts.paintCoat = new ctx.Coat([{ kind: 'wall', x0: -hw, x1: hw, a0: 0, a1: H, off: 0.0022 }], M.paint, 0.0004, { rowH: 0.22, rep: 0.5, maskW: 110 });
    if (cfg.water) { var wl = 0.55, wb = new THREE.Mesh(keep(new THREE.BoxGeometry((cut ? hw - XC : 2 * hw) + 0.001, wl, 1.3)), M.water); wb.position.set(cut ? (XC + hw) / 2 : 0, wl / 2, 0.65); wb.castShadow = false; wb.receiveShadow = false; ctx.g.add(wb); parts.water = wb; parts.waterLevel = wl; wb.visible = false; }
  }
  /* which layers stand at a stage (stills and the end of every animation) */
  function state(cfg, st, ctx) {
    var parts = ctx.parts, F2 = st.F2, id = st.id, t = st.t, M = parts.M, ST = SL_STAGES[ctx.scn] || [], has = function (s) { return ST.indexOf(s) >= 0; };
    var removed = (has('remove') ? F2('remove') : true) && (has('ucut') ? F2('ucut') : true), rod = has('backer') && F2('backer'), tape = has('tape') && F2('tape'), prim = has('prime') && F2('prime'), fill = F2('fill'), tool = F2('tool'), done = F2('done'), paint = has('paint') && F2('paint');
    if (parts.nails) parts.nails.forEach(function (n) { n.pr.visible = prim; n.dab.visible = fill && !tool; n.dab.scale.set(1, 1, 0.42); n.flat.visible = tool; });
    parts.joints.forEach(function (jj) { var PG = jj.PG, L = jj.len; PG.old.set(removed ? L : 0); PG.oldGone.set(0); PG.bb.set(rod ? L : 0); PG.rod.set(rod ? L : 0); PG.tapeA.set(tape && !tool ? L : 0); PG.tapeB.set(tape && !tool ? L : 0); PG.prim.set(prim ? L : 0); PG.primGone.set(fill ? L : 0); PG.raw.set(fill && !tool ? L : 0); PG.rawGone.set(0); PG.seal.set(tool ? L : 0); });
    if (parts.strand) parts.strand.visible = false; if (parts.curlA) { parts.curlA.visible = false; parts.curlB.visible = false; }
    if (parts.paintCoat) { parts.paintCoat.show(paint); parts.paintCoat.set(paint ? 1 : 0); }
    if (parts.water) parts.water.visible = cfg.water && done && t > 0.999;
    var wet = id === 'fill' || id === 'tool' ? 1 : id === 'done' ? 1 - t : 0; ctx.wetLook.forEach(function (w) { if (w.m === M.seal) w.m.roughness = w.r - (w.r - 0.12) * wet; if (w.m === M.paint) w.m.roughness = w.r - (w.r - 0.2) * (id === 'paint' ? 1 : 0); });
  }
  function anchors(cfg, id, a, o, ctx) {
    var parts = ctx.parts, cut = ctx.cut, XC = ctx.XC, hw = ctx.hw, J = parts.joints, H = ctx.P.W.h, jh = J.filter(function (j) { return j.kind === 'h'; })[0], jv = J.filter(function (j) { return j.kind === 'v'; })[0], sid = cfg.sub === 'siding';
    var DX = cut ? 0.1 : 0.4, DY = cut ? 0.085 : 0.3, DYs = cut ? 0.12 : 0.45, xm = cut ? XC + 0.1 : 0.35, xl = cut ? XC + 0.02 : -0.85, y0 = jh ? jh.p0.y : cfg.vent ? cfg.vent.y : 0.95, ym = jv ? 1.35 : y0 + 0.3, xv = cut ? xm : jv ? jv.p0.x : xm, primK = (cfg.seal === 'EX' || cfg.seal === 'TF2000') ? (cfg.civil ? 'prim19s' : 'prim19') : (SLP[cfg.seal] && SLP[cfg.seal].putty) ? 'primP' : 'prim20', sub = sid ? 'siding' : cfg.sub === 'alc' ? 'alc' : cfg.sub === 'pca' ? 'pca' : cfg.civil ? 'coping' : cfg.sub === 'steel' ? 'steel' : 'rc';
    var crk = J.filter(function (j) { return j.id === 'crack'; })[0], nl = parts.nails && parts.nails[0], mq = parts.cfg.mould;
    if (cfg.civil) { // the parapet: the expansion joint, the crack and its U-groove, the coping, the primer sold separately, the pail
      var cx = crk ? crk.p0.x : xm, cy = crk ? (crk.p0.y + crk.p1.y) / 2 : y0 - 0.4;
      if (id === 'state') { a('ej', xm + DX, y0, 0.002); if (crk) a('crack', cx, cy, 0.002); a(sub, xl, y0 + DYs, 0.002); if (cut) a('wall', XC + 0.002, y0 - DY, -ctx.P.W.t / 2 - cfg.thick); return; }
      if (id === 'ucut') { a('ucut', cx, cy, 0.004); a('cutterD', cx + DX, cy + DY, 0.002); a('dustC', cx + DX, cy - DY, 0.002); return; }
      if (id === 'clean') { a('brush', xm, y0, 0.002); a('dust', xl, y0 - DY, 0.002); if (crk) a('ucut', cx, cy, 0.004); return; }
      if (id === 'prime') { a('prim19s', xm, y0, 0.002); a('open', xl, y0 - DY, 0.002); if (crk) a('ucut', cx, cy, 0.004); return; }
      if (id === 'fill') { a('bead', xm, y0, 0.004); a('gun', xl, y0 - DY, 0.004); a('pail', xm + DX, y0 + DY, 0.002); return; }
      if (id === 'done') { a('exposed', xm, y0, 0.004); a('full', xl, y0 - DY, 0.004); a('record', xm + DX, y0 + DY, 0.002); return; } }
    if (cfg.ind) { // the steel wall: the lap seams, the moulding and the box, the degreasing, the fillet
      var mx = mq ? (mq.x0 + mq.x1) / 2 : xm, my = mq ? mq.y1 + 0.03 : y0 + 0.4, bx = parts.ebox ? (parts.ebox.x0 + parts.ebox.x1) / 2 : xm, by = parts.ebox ? parts.ebox.y0 - 0.02 : y0;
      if (id === 'state') { a('lap', xm, y0 - 0.02, 0.002); a('steel', xl, y0 + DYs, 0.002); if (!cut || mx > XC) a('mould', mx, my, 0.03); if (!cut || bx > XC) a('jbox', bx, by, 0.05); return; }
      if (id === 'clean') { a('rag', xm, y0 - 0.01, 0.002); a('dust', xl, y0 - DY, 0.002); return; }
      if (id === 'tape') { a('tape', xm, y0 - 0.03, 0.002); a('tapeRoll', xl, y0 - DY, 0.002); return; }
      if (id === 'fill') { a('fillet', xm, y0 - 0.01, 0.004); a('gun', xl, y0 - DY, 0.004); a('corner', bx, by, 0.004); return; }
      if (id === 'tool') { a('spat', xm, y0 - 0.01, 0.004); a('untape', xm + DX, y0 + DY, 0.002); return; }
      if (id === 'done') { a('cured', xm, y0 - 0.01, 0.004); a('tgrey', xl, y0 - DY, 0.004); a('record', xm + DX, y0 + DY, 0.002); return; } }
    if (cfg.putty) { // the siding: the nail heads, the crack, the dabs
      var nx = nl ? nl.x : xm, ny = nl ? nl.y : y0 - 0.5, n2 = parts.nails && parts.nails[parts.nails.length - 1];
      if (id === 'state') { if (nl) a('nail', nx, ny, 0.002); if (crk) a('chip', (crk.p0.x + crk.p1.x) / 2, crk.p0.y, 0.002); a('siding', xl, y0 + DYs, 0.002); return; }
      if (id === 'clean') { a('brush', xm, y0, 0.002); a('dust', xl, y0 - DY, 0.002); return; }
      if (id === 'prime') { if (nl) a('primP', nx, ny, 0.004); a('open', xl, y0 - DY, 0.002); return; }
      if (id === 'fill') { if (nl) a('dab', nx, ny, 0.006); if (crk) a('bead', (crk.p0.x + crk.p1.x) / 2, crk.p0.y, 0.004); a('gun', xl, y0 - DY, 0.004); return; }
      if (id === 'tool') { if (n2) a('flat', n2.x, n2.y, 0.004); a('spat', xm, y0, 0.004); return; }
      if (id === 'paint') { a('paintU', xm, y0 + DYs, 0.004); a('paintR', xl, y0 - DY, 0.004); return; }
      if (id === 'done') { a('cured', xm, y0, 0.004); a('record', xm + DX, y0 + DY, 0.002); return; } }
    if (id === 'state') { if (cfg.reno) a('old', xm, y0, 0.002); else a('joint', xm, y0, 0.002); a(sub, xl, y0 + DYs, 0.002); if (cfg.sash) { if (cut) a('sash', XC + 0.05, y0 - 0.1, 0.002); else a('sash', parts.open.x1 - 0.1, parts.open.y1 - 0.15, 0.002); } if (cfg.vent) { a('vent', parts.vent.x, parts.vent.y + parts.vent.r + 0.02, 0.06); if (!cut) a('ebox', (parts.ebox.x0 + parts.ebox.x1) / 2, parts.ebox.y0 - 0.02, 0.05); } if (cfg.water) a('cj', xm + DX * 0.75, y0, 0.002); if (cfg.pca) a('wj', xv, y0 + DYs, 0.002); if (cut) { a('wall', XC + 0.002, y0 - DY, -ctx.P.W.t / 2 - cfg.thick - (sid ? 0.036 : 0)); if (sid) { a('cav', XC + 0.002, y0 + DY * 0.6, -cfg.thick * EXG - 0.018); if (jh && !jh.sash) a('hat', XC + 0.01, y0, -cfg.thick * EXG + 0.003); } } }
    else if (id === 'remove') { a('gap', xm, y0, 0.002); a('scrape', xl, y0 - DY, 0.002); a('cutter', xm + DX, y0 + DY, 0.002); }
    else if (id === 'clean') { a('brush', xm, y0, 0.002); a('dust', xl, y0 - DY, 0.002); if (cfg.water) a('rain', xl, y0 + DYs, 0.002); }
    else if (id === 'backer') { a('rod', xm, y0, 0.002); a('bb', xl, y0 - DY, 0.002); if (sid && jh && jh.hasBB) a('bbTape', xm + DX, y0 + DY, 0.002); else a('joint', xm + DX, y0 + DY, 0.002); }
    else if (id === 'tape') { a('tape', xm, y0 + 0.016 * (cut ? 1.5 : 1), 0.002); a('tapeRoll', xl, y0 - DY, 0.002); }
    else if (id === 'prime') { a(primK, xm, y0, 0.002); a('open', xl, y0 - DY, 0.002); a('ms', xm + DX, y0 + DY, 0.002); }
    else if (id === 'fill') { a('bead', xm, y0, 0.004); a('gun', xl, y0 - DY, 0.004); a('loose', xm + DX, y0 + DY, 0.002); }
    else if (id === 'tool') { a('spat', xm, y0, 0.004); a('spat2', xl, y0 - DY, 0.004); a('untape', xm + DX, y0 + DY, 0.002); }
    else if (id === 'paint') { a('paint', xm, y0 + DYs, 0.004); a('paintR', xl, y0 - DY, 0.004); }
    else { if (cfg.seal === 'CLIO') a('clear', xm, y0, 0.006); else a('cured', xm, y0, 0.004); a('full', xl, y0 - DY, 0.004); a('record', xm + DX, y0 + DY, 0.002); if (cfg.water && !cut) a('water', xm, 0.56, 0.7); }
  }
  /* the work of every stage, with the hand tools of the trade: cutter knife, scraper, hand brush, backer-rod spatula, tape roll, small primer brush, the gun, the tooling spatula */
  function rig(cfg, R) {
    var parts = R.parts, K = R.K, T = R.tools, C = R.clouds, E2 = R.E, cut = R.cut, XC = R.XC, hw = R.hw, M = parts.M, J = parts.joints, ctx = R.C, keep = ctx.keep, sid = cfg.sub === 'siding';
    var steel = keep(new THREE.MeshStandardMaterial({ color: 0xd8dadd, metalness: mt(0.8), roughness: 0.3 })), grip = keep(new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.7 })), white = keep(new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.6 })), wood = keep(new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.8 })), bristle = keep(new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: 0.95 })), bristleP = keep(new THREE.MeshStandardMaterial({ color: 0xcfc3a6, roughness: 0.95 }));
    function tool(g) { g.visible = false; ctx.g.add(g); return R.addTool(g); }
    /* a spatula (ヘラ) standing on its edge: the blade in the x–z plane, `wd` wide across the joint, its contact edge at the origin, the grip up along +z */
    function makeHera(wd, bladeM, gripM) { var g = new THREE.Group(); var b = new THREE.Mesh(keep(new THREE.BoxGeometry(wd, 0.0015, 0.05)), bladeM); b.position.set(0, 0, 0.025); g.add(b); var h = new THREE.Mesh(keep(new THREE.BoxGeometry(Math.min(0.022, wd), 0.016, 0.1)), gripM); h.position.set(0, 0, 0.095); g.add(h); var cap = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.009, 0.009, 0.014, 18)), gripM); cap.rotation.x = Math.PI / 2; cap.position.set(0, 0, 0.15); g.add(cap); g.userData.wd = wd; return tool(g); }
    function makeKnife() { var g = new THREE.Group(), body = keep(new THREE.MeshStandardMaterial({ color: 0xf2b21b, roughness: 0.6 })); var b = new THREE.Mesh(keep(new THREE.BoxGeometry(0.0012, 0.018, 0.024)), steel); b.position.set(0, 0.006, 0.004); g.add(b); var h = new THREE.Mesh(keep(new THREE.BoxGeometry(0.014, 0.024, 0.13)), body); h.position.set(0, 0.014, -0.07); g.add(h); return tool(g); }
    function makeTapeRoll() { var g = new THREE.Group(), m = keep(new THREE.MeshStandardMaterial({ color: 0xe6dcb9, roughness: 0.85 })), core = keep(new THREE.MeshStandardMaterial({ color: 0x8b7d63, roughness: 0.9 })); var r = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.034, 0.034, 0.024, 28)), m); r.rotation.z = Math.PI / 2; r.position.set(0, 0, -0.034); g.add(r); var c = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.02, 0.02, 0.026, 20)), core); c.rotation.z = Math.PI / 2; c.position.set(0, 0, -0.034); g.add(c); return tool(g); }
    function makeHandBrush() { var g = new THREE.Group(); var bl = new THREE.Mesh(keep(new THREE.BoxGeometry(0.028, 0.11, 0.018)), wood); bl.position.set(0, 0, -0.029); g.add(bl); var br = new THREE.Mesh(keep(new THREE.BoxGeometry(0.024, 0.1, 0.02)), bristle); br.position.set(0, 0, -0.01); g.add(br); var hd = new THREE.Mesh(keep(new THREE.BoxGeometry(0.022, 0.09, 0.016)), wood); hd.position.set(0, -0.09, -0.04); hd.rotation.x = 0.35; g.add(hd); return tool(g); } // a stiff hand brush, bristles down
    function makeSmallBrush() { var g = new THREE.Group(); var br = new THREE.Mesh(keep(new THREE.BoxGeometry(0.014, 0.006, 0.022)), bristleP); br.position.set(0, 0, -0.011); g.add(br); var fe = new THREE.Mesh(keep(new THREE.BoxGeometry(0.016, 0.008, 0.016)), steel); fe.position.set(0, 0, -0.03); g.add(fe); var hd = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.005, 0.007, 0.13, 16)), wood); hd.rotation.x = Math.PI / 2; hd.position.set(0, 0, -0.1); g.add(hd); return tool(g); } // a 15 mm flat brush for the primer, bristles down (−z), the handle up
    /* the disc cutter of the U-cut: the diamond disc on its axle (local x), the half guard over it, the gear head and the motor body back along −y and up, the side handle */
    function makeCutter() { var g = new THREE.Group(), body = keep(new THREE.MeshStandardMaterial({ color: 0x2f6a3c, roughness: 0.55 })), guardM = keep(new THREE.MeshStandardMaterial({ color: 0x3b3f44, roughness: 0.5, metalness: mt(0.5), side: THREE.DoubleSide }));
      var disc = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.055, 0.055, 0.0025, 36)), steel); disc.rotation.z = Math.PI / 2; g.add(disc); var seg = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.0555, 0.0555, 0.004, 24, 1, true)), grip); seg.rotation.z = Math.PI / 2; g.add(seg); // the segmented rim
      var guard = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.063, 0.063, 0.028, 24, 1, true, -Math.PI / 2, Math.PI)), guardM); guard.rotation.z = Math.PI / 2; guard.position.x = 0.01; g.add(guard); var hub = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.013, 0.013, 0.03, 24)), steel); hub.rotation.z = Math.PI / 2; hub.position.x = 0.018; g.add(hub);
      var head = new THREE.Mesh(keep(new THREE.BoxGeometry(0.058, 0.07, 0.06)), body); head.position.set(0.05, -0.01, 0.07); g.add(head); var motor = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.031, 0.028, 0.25, 18)), body); motor.rotation.x = Math.PI / 2 - 0.35; motor.position.set(0.05, -0.15, 0.115); g.add(motor); var side = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 18)), grip); side.rotation.z = Math.PI / 2; side.position.set(0.11, -0.01, 0.085); g.add(side);
      g.userData.disc = disc; g.userData.seg = seg; return tool(g); }
    function makeChisel() { var g = new THREE.Group(); var bar = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.0075, 0.0075, 0.2, 16)), steel); bar.rotation.x = Math.PI / 2; bar.position.set(0, 0, 0.1); g.add(bar); var tip = new THREE.Mesh(keep(new THREE.BoxGeometry(0.012, 0.004, 0.03)), steel); tip.position.set(0, 0, 0.012); g.add(tip); var hd = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.011, 0.009, 0.03, 16)), steel); hd.rotation.x = Math.PI / 2; hd.position.set(0, 0, 0.2); g.add(hd); return tool(g); } // a cold chisel standing on its tip (the origin), the shank up along +z
    function makeRag() { var g = new THREE.Group(), cloth = keep(new THREE.MeshStandardMaterial({ color: 0xf1eee6, roughness: 0.95 })); var r2 = new THREE.Mesh(keep(new THREE.SphereGeometry(0.045, 16, 14)), cloth); r2.scale.set(1, 0.75, 0.42); r2.position.set(0, 0, -0.018); g.add(r2); var fold = new THREE.Mesh(keep(new THREE.BoxGeometry(0.05, 0.028, 0.012)), cloth); fold.position.set(0.012, 0.01, -0.032); fold.rotation.z = 0.4; g.add(fold); return tool(g); } // a wad of cloth, its underside on the surface; like every pressed tool its body lies along −z, K.press turns it out of the wall
    function makeTube() { var g = new THREE.Group(), lab = keep(new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.55 })), cap = keep(new THREE.MeshStandardMaterial({ color: 0xf97b00, roughness: 0.5 })); var noz = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.0022, 0.0045, 0.028, 18)), cap); noz.position.set(0, 0.014, 0); g.add(noz); var sh = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.0115, 0.0115, 0.012, 24)), cap); sh.position.set(0, 0.034, 0); g.add(sh); var bd = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.0115, 0.017, 0.11, 24)), lab); bd.position.set(0, 0.095, 0); g.add(bd); var tl = new THREE.Mesh(keep(new THREE.BoxGeometry(0.036, 0.012, 0.004)), lab); tl.position.set(0, 0.155, 0); g.add(tl); return tool(g); } // the 170 g tube: the nozzle tip at the origin, the body back along +y, the crimped end last
    var knife = makeKnife(), scraper = makeHera(0.014, steel, grip), rodHera = makeHera(0.016, white, grip), tapeRoll = makeTapeRoll(), hbrush = makeHandBrush(), pbrush = makeSmallBrush(), igun = T.igun, cutterD = cfg.civil ? makeCutter() : null, chisel = cfg.civil ? makeChisel() : null, rag = cfg.ind ? makeRag() : null, tube = cfg.putty && cfg.seal === 'FLATP' ? makeTube() : null;
    var heraW = Math.min(0.05, Math.max(0.02, (J.length && !J[0].fillet && J[0].kind !== 'ring' ? J[0].w : 0.012) + 0.012)), hera = makeHera(heraW, steel, grip);
    var GL = { CLIO: ['CLIO NEO', 'One-component clear polyurethane sealant · quick-drying · paintable'], NB101: ['SEALER 101A-NB', 'One-component polyurethane sealant · Perfect Non-Bleed'], TF2000: ['超耐シーラー TF2000', 'One-component polyurethane sealant · civil engineering · NETIS KT-190076-VE'], R101: ['SEALER 101R', 'Quick-drying polyurethane sealant · industrial · high elasticity'], AD3500: ['アドハー 3500', 'One-component flexible urethane putty · non-bleed · paintable'], FLATP: ['フラットパテ', 'One-component flexible urethane putty · non-bleed · paintable'] }[cfg.seal] || ['EXCEED', 'One-component polyurethane sealant · Non-Bleed · LS polymer'];
    if (igun.userData.setLabel) igun.userData.setLabel(GL[0], GL[1]); // the cartridge in the gun is the sealant of this scenario
    var path = new Path(J), GV = new THREE.Vector3(), GD = new THREE.Vector3(), UP = new THREE.Vector3(0, 0, 1), QB = new THREE.Matrix4(), QX = new THREE.Quaternion(), QR = new THREE.Quaternion(), AX = new THREE.Vector3(1, 0, 0);
    function pointOf(q) { if (q.kind === 'ring') { var a = (q.t / q.j.len) * Math.PI * 2; return { x: q.j.cx + Math.cos(a) * q.j.r, y: q.j.cy + Math.sin(a) * q.j.r, dir: new THREE.Vector3(-Math.sin(a), Math.cos(a), 0), across: new THREE.Vector3(Math.cos(a), Math.sin(a), 0) }; } return { x: q.p.x, y: q.p.y, dir: q.dir, across: q.j.across }; }
    function yawOf(q) { return q.kind === 'ring' ? (q.t / q.j.len) * Math.PI * 2 : q.kind === 'h' ? Math.PI / 2 : 0; } // K.press: the tool's long side along the joint
    function place(tl, q, out, lift, tilt, yawExtra, acrossOff) { var p = pointOf(q), ao = acrossOff || 0; K.press(tl, p.x + p.across.x * ao, p.y + p.across.y * ao, (q.j.face || 0) + (lift || 0.001), tilt || 0, yawOf(q) + (yawExtra || 0), out); }
    /* a hera is placed with its edge on the joint face, standing across the joint and leaning towards the direction of travel: it is pulled, the blade pressing the sealant ahead of its edge */
    function placeHera(tl, q, out, tilt, lift, acrossOff, dip) { var p = pointOf(q); tl.visible = out < 0.999; if (!tl.visible) return; var e = p.dir.clone(), xa = p.across.clone(); if (xa.clone().cross(e).z < 0) xa.negate(); QB.makeBasis(xa, e, UP); QR.setFromRotationMatrix(QB); QX.setFromAxisAngle(AX, -(tilt || 0.6)); QR.multiply(QX); tl.quaternion.copy(QR); var ao = acrossOff || 0; tl.position.set(p.x + xa.x * ao + out * 0.12 * e.x, p.y + xa.y * ao + out * 0.12 * e.y, (q.j.face || 0) + (lift || 0.0006) + (dip || 0) + out * 0.35); }
    function gunAt(q, out) { var p = pointOf(q), z = (q.j.face || 0) + 0.002; igun.visible = out < 0.999; if (!igun.visible) return; GD.set(-p.dir.x * 0.6 + p.across.x * 0.12, -p.dir.y * 0.6 + p.across.y * 0.12, 0.8).normalize(); igun.position.set(p.x + GD.x * out * 0.35, p.y + GD.y * out * 0.35 + out * 0.2, z + GD.z * out * 0.35); GV.copy(igun.position).add(GD); igun.lookAt(GV); } // the nozzle in the joint, the body leaning back over the bead just laid: the gun pushes the sealant into the joint ahead of the nozzle
    function setAll(key, u) { J.forEach(function (jj, i) { jj.PG[key].set(path.front(u, i)); }); }
    function frontOf(u) { return path.at(u); }
    var yv = function (q) { return q.kind === 'ring' ? q.j.cy : q.p.y; };
    function curlAt(me, q, side) { var p = pointOf(q), off = q.j.tapeOff ? q.j.tapeOff[side] : null; if (off == null) { me.visible = false; return; } me.visible = true; var xa = p.across.clone(); if (xa.clone().cross(p.dir).z < 0) xa.negate(); QB.makeBasis(xa.negate(), p.dir.clone().negate(), UP); me.quaternion.setFromRotationMatrix(QB); me.position.set(p.x + p.across.x * off, p.y + p.across.y * off, (q.j.tapeZ != null ? q.j.tapeZ : (q.j.face || 0)) + 0.0008); } // the ribbon of tape lifting off at the removal front, curling back over the part already stripped
    /* 1 · removal (renewal only): the knife down both faces, the old bead pulled out from the start of the joint, the flanks scraped clean */
    if (cfg.reno) { var phR = { cutA: [0.3, 3.1], cutB: [3.3, 6.1], pull: [6.4, 9.6], scrape: [9.9, 12.2] };
      R.stage('remove', 12.6, phR, function (S2, ph) { var uA = R.u(ph, 'cutA', S2), oA = R.io(ph, 'cutA', S2), uB = R.u(ph, 'cutB', S2), oB = R.io(ph, 'cutB', S2), uP = R.u(ph, 'pull', S2), oP = R.io(ph, 'pull', S2), uS = R.u(ph, 'scrape', S2), oS = R.io(ph, 'scrape', S2);
        if (oA < 0.999) { var q = frontOf(R.clamp(uA)); place(knife, q, oA, 0.001, 0.15, 0, q.j.w / 2); } else if (oB < 0.999) { var q2 = frontOf(R.clamp(uB)); place(knife, q2, oB, 0.001, 0.15, 0, -q2.j.w / 2); } else knife.visible = false;
        setAll('old', uP <= 0 ? 0 : R.clamp(uP));
        if (parts.strand) { parts.strand.visible = oP < 0.999 && uP > 0.02 && uP < 0.98; if (parts.strand.visible) { var q3 = frontOf(R.clamp(uP)); parts.strand.position.set(q3.p.x, q3.p.y, 0); parts.strand.rotation.z = q3.kind === 'h' ? (q3.dir.x > 0 ? 0 : Math.PI) : (q3.dir.y < 0 ? -Math.PI / 2 : Math.PI / 2); } }
        if (oS < 0.999) { var q4 = frontOf(R.clamp(uS)); placeHera(scraper, q4, oS, 0.65, -q4.j.d * 0.5, (q4.j.w / 2 - 0.005) * Math.sin(S2 * 6), 0); } else scraper.visible = false;
        C.dust.update(S2, function (t) { if (t < ph.scrape[0] || t > ph.scrape[1]) return null; var q5 = frontOf(R.clamp(R.u(ph, 'scrape', t))); return [q5.p.x, q5.p.y, 0.01]; }, R.ground);
      }, function (S2, ph) { var k = R.active(ph, S2); if (k === 'cutA' || k === 'cutB') { var q = frontOf(R.clamp(R.u(ph, k, S2))); return [{ k: 'cutter', p: [q.p.x, yv(q) + 0.06, 0.08] }, { k: 'old', p: [q.p.x + 0.25, yv(q) - 0.15, 0.003] }]; } if (k === 'pull') { var q2 = frontOf(R.clamp(R.u(ph, 'pull', S2))); return [{ k: 'pull', p: [q2.p.x, yv(q2) + 0.1, 0.05] }, { k: 'gap', p: [q2.p.x - 0.3, yv(q2) - 0.15, 0.003] }]; } var q3 = frontOf(R.clamp(R.u(ph, 'scrape', S2))); return [{ k: 'scrape', p: [q3.p.x, yv(q3) + 0.06, 0.06] }, { k: 'gap', p: [q3.p.x - 0.3, yv(q3) - 0.15, 0.003] }]; }); }
    /* 1b · the U-cut (civil): the disc cutter down one side of the crack, then the other, the chisel takes the strip out and the groove opens behind it; the dust of the cut */
    var crk = J.filter(function (j) { return j.ucut; })[0];
    if (cfg.civil && crk && cutterD) { var phU = { cutA: [0.3, 3.3], cutB: [3.6, 6.6], chip: [6.9, 10.1] };
      var crackQ = function (u) { var t = R.clamp(u) * crk.len; return { j: crk, kind: 'v', t: t, p: crk.p0.clone().add(crk.dir.clone().multiplyScalar(t)), dir: crk.dir }; };
      var cutterAt = function (q, out, side) { var p = pointOf(q), e = p.dir.clone(), xa = p.across.clone(); if (xa.clone().cross(e).z < 0) xa.negate(); cutterD.visible = out < 0.999; if (!cutterD.visible) return; QB.makeBasis(xa, e, UP); cutterD.quaternion.setFromRotationMatrix(QB); var ao = side * (q.j.w / 2 - 0.0015); cutterD.position.set(p.x + p.across.x * ao, p.y + p.across.y * ao, 0.055 - q.j.d + 0.0015 + out * 0.4); cutterD.userData.disc.rotation.x += 0.9; cutterD.userData.seg.rotation.x += 0.9; };
      R.stage('ucut', 10.5, phU, function (S2, ph) { var uA = R.u(ph, 'cutA', S2), oA = R.io(ph, 'cutA', S2), uB = R.u(ph, 'cutB', S2), oB = R.io(ph, 'cutB', S2), uC = R.u(ph, 'chip', S2), oC = R.io(ph, 'chip', S2);
        if (oA < 0.999) cutterAt(crackQ(uA), oA, 1); else if (oB < 0.999) cutterAt(crackQ(uB), oB, -1); else cutterD.visible = false;
        crk.PG.old.set(uC <= 0 ? 0 : R.clamp(uC) * crk.len);
        if (oC < 0.999) { placeHera(chisel, crackQ(uC), oC, -0.75, -crk.d * 0.4, 0, 0.01 * Math.abs(Math.sin(S2 * 18))); } else chisel.visible = false;
        C.dust.update(S2, function (t) { var k = R.active(ph, t); if (!k || t > ph[k][1]) return null; var q5 = crackQ(R.u(ph, k, t)); return [q5.p.x, q5.p.y, 0.02]; }, R.ground); },
        function (S2, ph) { var k = R.active(ph, S2) || 'cutA', q = crackQ(R.u(ph, k, S2)); if (k === 'chip') return [{ k: 'ucut', p: [q.p.x + 0.08, q.p.y, 0.05] }, { k: 'dustC', p: [q.p.x - 0.3, q.p.y - 0.18, 0.003] }]; return [{ k: 'cutterD', p: [q.p.x + 0.1, q.p.y + 0.08, 0.12] }, { k: 'crack', p: [q.p.x - 0.3, q.p.y - 0.18, 0.003] }]; }); }
    /* 2 · cleaning: the hand brush along the joint (a solvent rag on the steel wall), the dust of the cuttings */
    var phC = { brush: [0.3, 4.6] }, cleanTool = rag || hbrush;
    R.stage('clean', 5.0, phC, function (S2, ph) { var u = R.u(ph, 'brush', S2), o = R.io(ph, 'brush', S2); if (o < 0.999) { var q = frontOf(R.clamp(u)); place(cleanTool, q, o, rag ? 0.001 : 0.004, rag ? 0 : 0.3, 0); cleanTool.position.x += 0.006 * Math.sin(S2 * 20); cleanTool.position.y += 0.006 * Math.cos(S2 * 17); } else cleanTool.visible = false; C.dust.update(S2, function (t) { if (t < ph.brush[0] || t > ph.brush[1]) return null; var q2 = frontOf(R.clamp(R.u(ph, 'brush', t))); return [q2.p.x, yv(q2), 0.02]; }, R.ground); },
      function (S2, ph) { var q = frontOf(R.clamp(R.u(ph, 'brush', S2))); return [{ k: rag ? 'rag' : 'brush', p: [q.p.x, yv(q) + 0.05, 0.07] }, { k: 'dust', p: [q.p.x - 0.3, yv(q) - 0.2, 0.003] }]; });
    /* 3 · the joint bottom: on a siding wall the bond breaker is re-stuck on the hat joiner first; then the backer rod is pressed in along the joint with the spatula to the depth the sealant needs */
    if ((SL_STAGES[R.scn] || []).indexOf('backer') >= 0) { var hasBB = J.some(function (jj) { return jj.hasBB; }), phB = hasBB ? { bb: [0.3, 2.9], rod: [3.1, 6.3] } : { rod: [0.3, 4.8] }, JR = J.filter(function (jj) { return !jj.ucut && !jj.opened && !jj.lap && !jj.fillet; }), pathR = new Path(JR.map(function (jj) { return jj; })), frontR = function (u) { return pathR.at(u); }, setR = function (key, u) { JR.forEach(function (jj, i) { jj.PG[key].set(pathR.front(u, i)); }); };
      R.stage('backer', hasBB ? 6.7 : 5.2, phB, function (S2, ph) { var u = R.u(ph, 'rod', S2), o = R.io(ph, 'rod', S2), uB = hasBB ? R.u(ph, 'bb', S2) : 1, oB = hasBB ? R.io(ph, 'bb', S2) : 1; setR('bb', uB <= 0 ? 0 : R.clamp(uB)); setR('rod', u <= 0 ? 0 : R.clamp(u));
        if (oB < 0.999) { var qb = frontR(R.clamp(uB)); placeHera(rodHera, qb, oB, 0.5, -qb.j.d + 0.001, 0, 0.004 * Math.abs(Math.sin(S2 * 7))); } else if (o < 0.999) { var q = frontR(R.clamp(u)); placeHera(rodHera, q, o, 0.6, -q.j.d + 0.0015, 0, 0.012 * Math.abs(Math.sin(S2 * 9))); } else rodHera.visible = false; },
        function (S2, ph) { var k = R.active(ph, S2); if (k === 'bb') { var qb = frontR(R.clamp(R.u(ph, 'bb', S2))); return [{ k: 'bbTape', p: [qb.p.x, yv(qb) + 0.05, 0.07] }, { k: 'hat', p: [qb.p.x - 0.3, yv(qb) - 0.2, 0.003] }]; } var q = frontR(R.clamp(R.u(ph, 'rod', S2))); return [{ k: 'rodPush', p: [q.p.x, yv(q) + 0.05, 0.07] }, { k: 'bb', p: [q.p.x - 0.3, yv(q) - 0.2, 0.003] }]; }); }
    /* 4 · the masking tape: rolled along one edge of the joint, then along the other (the hood: round the flange on the wall, then on the flange itself) */
    var phT = { tapeA: [0.3, 2.9], tapeB: [3.1, 5.7] };
    function rollAt(q, o, side) { var off = q.j.tapeOff ? q.j.tapeOff[side] : null; if (off == null) { tapeRoll.visible = false; return; } var fs = q.j.frameSide || 0; if (fs && (side === 0 ? fs > 0 : fs < 0)) { var p = pointOf(q); tapeRoll.visible = o < 0.999; if (!tapeRoll.visible) return; var zA = UP.clone(), tw = p.across.clone().multiplyScalar(fs), yA = tw.clone().cross(zA); QB.makeBasis(zA, yA, tw); tapeRoll.quaternion.setFromRotationMatrix(QB); tapeRoll.position.set(p.x + p.across.x * fs * (q.j.w / 2 + 0.001) - tw.x * o * 0.2, p.y + p.across.y * fs * (q.j.w / 2 + 0.001) - tw.y * o * 0.2, 0.013 + o * 0.3); return; } place(tapeRoll, q, o, (q.j.tapeZ != null ? q.j.tapeZ - (q.j.face || 0) : 0) + (q.kind === 'ring' && side === 1 ? 0.0055 : 0.001), 0, q.kind === 'ring' ? -Math.PI / 2 : 0, off); } // the roll's axle across the joint (radial on the hood), rolling along it; on the frame's flank it turns on an axle pointing out of the wall
    R.stage('tape', 6.1, phT, function (S2, ph) { var uA = R.u(ph, 'tapeA', S2), oA = R.io(ph, 'tapeA', S2), uB = R.u(ph, 'tapeB', S2), oB = R.io(ph, 'tapeB', S2); setAll('tapeA', uA <= 0 ? 0 : R.clamp(uA)); setAll('tapeB', uB <= 0 ? 0 : R.clamp(uB)); if (oA < 0.999) rollAt(frontOf(R.clamp(uA)), oA, 0); else if (oB < 0.999) rollAt(frontOf(R.clamp(uB)), oB, 1); else tapeRoll.visible = false; },
      function (S2, ph) { var k = R.active(ph, S2), q = frontOf(R.clamp(R.u(ph, k, S2))); return [{ k: 'tapeRoll', p: [q.p.x, yv(q) + 0.06, 0.08] }, { k: 'tape', p: [q.p.x - 0.3, yv(q) - 0.2, 0.003] }]; });
    /* 5–7 (putty): the primer dabbed on every nail head and brushed into the crack, the putty squeezed onto every head and into the crack, the spatula striking each dab and the crack flush */
    if (cfg.putty) { var NL = parts.nails || [], NN = NL.length, SLOT = 0.42, XDIR = new THREE.Vector3(1, 0, 0), YDIR = new THREE.Vector3(0, 1, 0), crkP = J.filter(function (j) { return j.opened; })[0];
      var spotPos = function (u) { if (!NN) return { x: 0, y: 0, dwell: 1 }; var x = Math.max(0, Math.min(NN - 1e-6, u * NN)), i = Math.floor(x), f = x - i, n0 = NL[i], n1 = NL[Math.min(NN - 1, i + 1)], mv = f < 0.6 ? 0 : (f - 0.6) / 0.4, sm = mv * mv * (3 - 2 * mv); return { i: i, f: f, dwell: f < 0.6 ? f / 0.6 : 1, x: n0.x + (n1.x - n0.x) * sm, y: n0.y + (n1.y - n0.y) * sm }; };
      var spotQ = function (sp) { return { kind: 'h', p: { x: sp.x, y: sp.y }, dir: XDIR, j: { face: 0, across: YDIR, w: 0.012, d: 0.004 }, t: 0 }; };
      var tubeAt = function (q, out) { var p = pointOf(q); tube.visible = out < 0.999; if (!tube.visible) return; GD.set(-p.dir.x * 0.55, -p.dir.y * 0.55, 0.84).normalize(); var xa = p.across.clone(), za = xa.clone().cross(GD).normalize(); xa.copy(GD).cross(za).normalize(); QB.makeBasis(xa, GD, za); tube.quaternion.setFromRotationMatrix(QB); tube.position.set(p.x + GD.x * out * 0.3, p.y + GD.y * out * 0.3, (q.j.face || 0) + 0.002 + GD.z * out * 0.3); };
      var phPP = { spots: [0.3, 0.3 + NN * SLOT], joint: [0.6 + NN * SLOT, 3.2 + NN * SLOT] }, durP = 3.6 + NN * SLOT;
      var lbl = function (k1, k2) { return function (S2, ph) { var k = R.active(ph, S2); if (k === 'joint' && crkP) { var q = frontOf(R.clamp(R.u(ph, 'joint', S2))); return [{ k: k1, p: [q.p.x, yv(q) + 0.05, 0.07] }, { k: k2, p: [q.p.x - 0.3, yv(q) - 0.2, 0.003] }]; } var sp = spotPos(R.clamp(R.u(ph, 'spots', S2))); return [{ k: k1, p: [sp.x, sp.y + 0.05, 0.07] }, { k: k2, p: [sp.x - 0.3, sp.y - 0.2, 0.003] }]; }; };
      R.stage('prime', durP, phPP, function (S2, ph) { var uS = R.u(ph, 'spots', S2), oS = R.io(ph, 'spots', S2), uJ = R.u(ph, 'joint', S2), oJ = R.io(ph, 'joint', S2);
        NL.forEach(function (n, i) { n.pr.visible = uS * NN > i + 0.3; }); setAll('prim', uJ <= 0 ? 0 : R.clamp(uJ));
        if (oS < 0.999 && NN) { var sp = spotPos(R.clamp(uS)); place(pbrush, spotQ(sp), oS, 0.002, 0.5, 0); pbrush.position.x += 0.004 * Math.sin(S2 * 14); pbrush.position.y += 0.004 * Math.cos(S2 * 11); } else if (oJ < 0.999 && crkP) { var q = frontOf(R.clamp(uJ)); place(pbrush, q, oJ, -Math.min(q.j.d * 0.6, 0.012), 0.5, 0); } else pbrush.visible = false; }, lbl('primP', 'open'));
      R.stage('fill', durP, phPP, function (S2, ph) { var uS = R.u(ph, 'spots', S2), oS = R.io(ph, 'spots', S2), uJ = R.u(ph, 'joint', S2), oJ = R.io(ph, 'joint', S2);
        NL.forEach(function (n, i) { var g2 = Math.max(0, Math.min(1, uS * NN - i)), sc = g2 < 0.6 ? g2 / 0.6 : 1; n.dab.visible = g2 > 0.02; n.dab.scale.set(Math.max(0.05, sc), Math.max(0.05, sc), 0.42 * Math.max(0.05, sc)); });
        setAll('raw', uJ <= 0 ? 0 : R.clamp(uJ)); setAll('primGone', uJ <= 0 ? 0 : R.clamp(uJ));
        var ap = function (q, o, u) { if (tube) { tubeAt(q, o); igun.visible = false; } else { gunAt(q, o); if (igun.userData.setRod) igun.userData.setRod(1 - 0.7 * u); } };
        if (oS < 0.999 && NN) ap(spotQ(spotPos(R.clamp(uS))), oS, R.clamp(uS) * 0.5); else if (oJ < 0.999 && crkP) ap(frontOf(R.clamp(uJ)), oJ, 0.5 + R.clamp(uJ) * 0.5); else { if (tube) tube.visible = false; igun.visible = false; } }, lbl('dab', 'bead'));
      R.stage('tool', durP, phPP, function (S2, ph) { var uS = R.u(ph, 'spots', S2), oS = R.io(ph, 'spots', S2), uJ = R.u(ph, 'joint', S2), oJ = R.io(ph, 'joint', S2);
        NL.forEach(function (n, i) { var done = uS * NN > i + 0.45; n.dab.visible = !done; n.dab.scale.set(1, 1, 0.42); n.flat.visible = done; });
        setAll('raw', 1); setAll('rawGone', uJ <= 0 ? 0 : R.clamp(uJ)); setAll('seal', uJ <= 0 ? 0 : R.clamp(uJ)); J.forEach(function (jj) { jj.PG.raw.set(uJ >= 1 ? 0 : jj.len); });
        if (oS < 0.999 && NN) { var sp = spotPos(R.clamp(uS)), q0 = spotQ(sp); q0.p.x += 0.014 * (sp.dwell - 0.5); placeHera(hera, q0, oS, 0.55, 0.0012, 0, 0); } else if (oJ < 0.999 && crkP) { placeHera(hera, frontOf(R.clamp(uJ)), oJ, 0.5, 0.0004, 0, 0); } else hera.visible = false;
        var wet = 1; ctx.wetLook.forEach(function (w2) { if (w2.m === M.seal) w2.m.roughness = w2.r - (w2.r - 0.12) * wet; }); }, lbl('flat', 'spat'));
    } else {
    /* 5 · the dedicated primer: the small brush into the joint, both flanks in one pass */
    var phP = { prime: [0.3, 5.6] }, primK = cfg.seal === 'EX' ? 'prim19' : 'prim20';
    R.stage('prime', 6.2, phP, function (S2, ph) { var u = R.u(ph, 'prime', S2), o = R.io(ph, 'prime', S2); setAll('prim', u <= 0 ? 0 : R.clamp(u)); if (o < 0.999) { var q = frontOf(R.clamp(u)); place(pbrush, q, o, q.j.fillet || q.kind === 'ring' ? 0.002 : -Math.min(q.j.d * 0.45, 0.008), 0.5, 0); pbrush.position.x += 0.003 * Math.sin(S2 * 14); } else pbrush.visible = false; },
      function (S2, ph) { var q = frontOf(R.clamp(R.u(ph, 'prime', S2))); return [{ k: primK, p: [q.p.x, yv(q) + 0.05, 0.07] }, { k: 'open', p: [q.p.x - 0.3, yv(q) - 0.2, 0.003] }]; });
    /* 6 · filling: the gun along the joint, the raw bead behind it, the plunger advancing */
    var phF = { fill: [0.3, 5.5] };
    R.stage('fill', 6.0, phF, function (S2, ph) { var u = R.u(ph, 'fill', S2), o = R.io(ph, 'fill', S2); setAll('raw', u <= 0 ? 0 : R.clamp(u)); setAll('primGone', u <= 0 ? 0 : R.clamp(u)); if (o < 0.999) { gunAt(frontOf(R.clamp(u)), o); if (igun.userData.setRod) igun.userData.setRod(1 - 0.8 * R.clamp(u)); } else igun.visible = false; },
      function (S2, ph) { var q = frontOf(R.clamp(R.u(ph, 'fill', S2))); return [{ k: 'gun', p: [q.p.x, yv(q) + 0.1, 0.16] }, { k: q.j.lap || q.j.fillet ? 'fillet' : 'bead', p: [q.p.x - 0.3, yv(q) - 0.2, 0.004] }]; });
    /* 7 · tooling: the first pass presses the raw bead into the joint and gives it its concave face, the second smooths it, then both tapes come off from the far end, lifting back over the joint */
    var phS = { pass1: [0.3, 3.4], pass2: [3.6, 6.4], untape: [6.7, 9.2] };
    R.stage('tool', 9.6, phS, function (S2, ph) { var u1 = R.u(ph, 'pass1', S2), o1 = R.io(ph, 'pass1', S2), u2 = R.u(ph, 'pass2', S2), o2 = R.io(ph, 'pass2', S2), uT = R.u(ph, 'untape', S2), oT = R.io(ph, 'untape', S2);
      setAll('raw', 1); setAll('rawGone', u1 <= 0 ? 0 : R.clamp(u1)); setAll('seal', u1 <= 0 ? 0 : R.clamp(u1)); J.forEach(function (jj, i) { jj.PG.raw.set(u1 >= 1 ? 0 : jj.len); });
      if (o1 < 0.999) { var q = frontOf(R.clamp(u1)); placeHera(hera, q, o1, 0.6, 0.0004, 0, 0); } else if (o2 < 0.999) { var q2 = frontOf(R.clamp(u2)); placeHera(hera, q2, o2, 0.42, 0.0002, 0, 0); } else hera.visible = false;
      J.forEach(function (jj, i) { var f = uT <= 0 ? jj.len : (uT >= 1 ? 0 : Math.max(0, Math.min(jj.len, path.L * (1 - R.clamp(uT)) - jj.s0))); jj.PG.tapeA.set(f); jj.PG.tapeB.set(f); }); // the tapes come off from the far end of the run back towards its start
      if (oT < 0.999 && uT > 0.01 && uT < 0.99) { var q3 = frontOf(1 - R.clamp(uT)); curlAt(parts.curlA, q3, 0); curlAt(parts.curlB, q3, 1); } else { parts.curlA.visible = false; parts.curlB.visible = false; }
      var wet = 1; ctx.wetLook.forEach(function (w2) { if (w2.m === M.seal) w2.m.roughness = w2.r - (w2.r - 0.12) * wet; });
    }, function (S2, ph) { var k = R.active(ph, S2); if (k === 'untape') { var q = frontOf(1 - R.clamp(R.u(ph, 'untape', S2))); return [{ k: 'untape', p: [q.p.x, yv(q) + 0.08, 0.08] }, { k: 'cured', p: [q.p.x - 0.3, yv(q) - 0.2, 0.004] }]; } var q2 = frontOf(R.clamp(R.u(ph, k, S2))); return [{ k: k === 'pass1' ? 'spat' : 'spat2', p: [q2.p.x, yv(q2) + 0.06, 0.07] }, { k: 'bead', p: [q2.p.x - 0.3, yv(q2) - 0.2, 0.004] }]; });
    }
    /* 8 · the paint rolled over the whole face (painted joints) */
    if (parts.paintCoat) R.coatStage('paint', 7.0, parts.paintCoat, { tool: 'roller', layer: 'paint', layerAt: [cut ? XC + 0.15 : -0.85, 0.5, 0.006], lift: 0.001, label: 'paintR' });
    /* 9 · finished: the sheen goes matt as the sealant cures; the channel fills */
    var phD = { cure: [0.2, 3.0], water: [3.0, 4.8] };
    R.stage('done', 5.0, phD, function (S2, ph) { var f = R.clamp(R.u(ph, 'cure', S2)), uW = R.u(ph, 'water', S2); ctx.wetLook.forEach(function (w2) { if (w2.m === M.seal) w2.m.roughness = w2.r - (w2.r - 0.12) * (1 - E2(f)); }); if (parts.water) { parts.water.visible = uW > 0; var lv = parts.waterLevel * R.clamp(uW); parts.water.scale.y = Math.max(0.01, lv / parts.waterLevel); parts.water.position.y = lv / 2; } },
      function (S2, ph) { var k = R.active(ph, S2), jh = J.filter(function (j) { return j.kind === 'h'; })[0], y0 = jh ? jh.p0.y : 0.95, xm = cut ? XC + 0.55 : 0.35; if (k === 'water' && parts.water) return [{ k: 'water', p: [xm, parts.waterLevel * R.clamp(R.u(ph, 'water', S2)) + 0.02, 0.7] }, { k: 'full', p: [xm - 0.5, y0 - 0.3, 0.004] }]; return [{ k: cfg.seal === 'CLIO' ? 'cured3' : 'cured', p: [xm, y0, 0.004] }, { k: 'record', p: [xm + 0.4, y0 + 0.3, 0.002] }]; });
  }
  /* the bond line at micro scale: the primer into the pores, the sealant fused to it */
  /* the micro model: the engine's sample (40 × 27 mm, 1 unit = 1/60 m) rebuilt as a cut across the joint — the porous flanks of the two panels
     (a flat aluminium block where the joint meets a sash or a hood flange), the old bead with its adhesion failure, the pressed-in rod, the
     primer film on both bond faces, the raw and the tooled bead on the rod, the paint over it all. The joint is drawn at the width and depth of
     the guide's joint design (the inputs of the system section). Solid parts grow along the joint by scaling, so their ends stay closed; the
     thin films and tapes grow behind clip planes. The coating sample of the engine (with its crack) is hidden. */
  function micro(cfg, M) {
    var MM = M.MM, n = M.n, NX = M.NX, X = M.X, Z = M.Z, H0 = M.H0, B0 = M.B0, CRK = M.CRK, gx = M.gx, gz = M.gz, keep = M.keep, G = M.group, ST = SL_STAGES[M.scn] || [], k, i;
    var clear = cfg.seal === 'CLIO', metal = !!(cfg.sash || cfg.vent), reno = !!cfg.reno, sealCol = clear ? 0xf4f7f8 : cfg.seal === 'NB101' ? 0x8b8e90 : cfg.seal === 'TF2000' ? 0x707376 : 0x6d7073;
    /* the joint as designed (mm): the guide allows 10–20 wide, 8–15 deep, depth ≤ width; the 40 mm sample takes up to 24 mm */
    var wmm = Math.max(6, Math.min(24, cfg.w * 1000)), dmm = Math.max(5, Math.min(20, cfg.d * 1000));
    var w2 = wmm / 2 * MM, dj = dmm * MM;
    /* the backer rod: closed-cell PE foam about 1.3 × the joint width (the guide's rule), pressed in — its section ends a little taller than wide; its crown sets the sealant depth */
    var r0 = w2 * 1.3, ra = w2 * 1.08, rv = r0 * 1.08, zj = 0.06, zf0 = zj - w2, zf1 = zj + w2, yr = -dj - rv;
    var FILM = 0.006, hw = w2 - FILM - 0.0015; // the primer film (0.1 mm) stands proud of each flank; the sealant bonds to it
    var tC = Math.acos(Math.min(1, w2 / ra)), yc = yr + rv * Math.sin(tC); // where the pressed rod meets the flank: the foot of the bond face
    var hasRod = ST.indexOf('backer') >= 0; if (!hasRod) { ra = 0; rv = 0; yr = -dj; yc = -dj; } // a shallow edge seal (hood flange, box) is filled to a bond-breaker tape, no rod
    var ycF = yc;
    /* behind the joint: a thin cladding board (16 mm) ends at its back face and the rod sits in the channel of the steel joiner behind it; a thick
       panel or RC member carries the joint on down to the backing (joint filler, inner seal) just below the rod */
    var thin = cfg.thick < 0.05, tB = thin ? cfg.thick * 1000 * MM : 0, SHEET = 0.05, yBoard = thin ? -tB : null;
    var yBack = !hasRod ? -dj - 0.012 : thin ? Math.min(-tB - 12 * MM, yr - rv - 0.04) : yr - rv - 0.06, FLOOR = thin ? Math.min(yBack, yBoard) - SHEET : yBack - 0.32;
    var own = G.children.slice(0, 2); own.forEach(function (c) { c.visible = false; });
    G.position.y = -FLOOR + 0.02; // the sample stands on the floor of the stage whatever its depth
    /* the substrate: the crack of the engine's sample filled with the surface beside it, the joint cut out as a trench */
    var Hs = new Float32Array(n), JM = new Uint8Array(n), CR2 = new Uint8Array(n);
    for (k = 0; k < n; k++) if (CRK[k]) { var i0 = k - k % NX, j; for (j = -9; j <= 9; j++) { var q = k + j; if (q >= i0 && q < i0 + NX) CR2[q] = 1; } }
    for (k = 0; k < n; k++) { var z = gz(k), src = CR2[k] ? Math.max(k - k % NX, k - 20) : k; Hs[k] = H0[src]; JM[k] = (z > zf0 - 0.001 && z < zf1 + 0.001) || (metal && z >= zf1) ? 1 : 0; }
    var subM = keep(M.matPaste.clone()); subM.vertexColors = false; subM.color.setHex(cfg.sub === 'alc' ? 0xe6e3da : cfg.sub === 'siding' ? 0xd9d6cf : cfg.sub === 'pca' ? 0xc8c6c0 : 0xbfbdb7); subM.needsUpdate = true;
    var sub = new THREE.Mesh(M.surface(Hs, { floor: thin ? yBoard : FLOOR, mask: JM }), [subM, subM]); sub.castShadow = true; sub.receiveShadow = true; G.add(sub);
    function slab(x0, x1, y0, y1, z0, z1, mat) { var me = new THREE.Mesh(keep(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0)), mat); me.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); me.castShadow = true; me.receiveShadow = true; G.add(me); return me; }
    var backM = keep(new THREE.MeshStandardMaterial({ color: 0x8a877f, roughness: 0.97, envMapIntensity: 0.15 }));
    if (thin && hasRod) { // the galvanised joiner: a channel under the joint for the rod, flanges under the boards
      var steelM = keep(new THREE.MeshStandardMaterial({ map: M.tex(UXTX.alu, { repeat: [3, 1] }), color: 0xb8bcbf, metalness: mt(0.65), roughness: 0.48, envMapIntensity: 0.9 })), cz0 = zf0 - 2.5 * MM, cz1 = zf1 + 2.5 * MM;
      slab(-X, X, yBack - SHEET, yBack, cz0 - SHEET, cz1 + SHEET, steelM); slab(-X, X, yBack - SHEET, yBoard, cz0 - SHEET, cz0, steelM); slab(-X, X, yBack - SHEET, yBoard, cz1, cz1 + SHEET, steelM);
      slab(-X, X, yBoard - SHEET, yBoard, -Z, cz0 - SHEET, steelM); slab(-X, X, yBoard - SHEET, yBoard, cz1 + SHEET, Z, steelM);
    } else if (thin) { // the flange's return behind a shallow edge seal: the gap is backed up to the bond-breaker tape, the sheet continues under the boards
      var steelM2 = keep(new THREE.MeshStandardMaterial({ map: M.tex(UXTX.alu, { repeat: [3, 1] }), color: 0xb8bcbf, metalness: mt(0.65), roughness: 0.48, envMapIntensity: 0.9 }));
      slab(-X, X, yBoard - SHEET, yBoard, -Z, Z, steelM2); slab(-X, X, yBoard, yBack, zf0 - 0.001, zf1 + 0.001, backM);
    } else slab(-X, X, FLOOR, yBack, zf0 - 0.001, zf1 + 0.001, backM);
    if (!hasRod) { var bbM = keep(new THREE.MeshStandardMaterial({ color: 0xdedcd6, roughness: 0.6, envMapIntensity: 0.3 })); slab(-X, X, yBack, -dj, zf0 - 0.001, zf1 + 0.001, bbM); } // the bond-breaker tape: the sealant bonds on two faces only
    if (metal) { var alu = keep(new THREE.MeshStandardMaterial({ map: M.tex(UXTX.alu, { repeat: [3, 1] }), color: 0xd4d7da, metalness: mt(0.7), roughness: 0.4, envMapIntensity: 1 })); slab(-X, X, thin ? yBoard : FLOOR, 0.02, zf1, Z, alu); }
    /* parts along the joint: the part from a to b (0..1 along x) */
    var L = 2 * X - 0.01, RB = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 0));
    function clipped(me) { var a = new THREE.Plane(new THREE.Vector3(1, 0, 0), X), b = new THREE.Plane(new THREE.Vector3(-1, 0, 0), X), ms = [].concat(me.material).map(function (m) { var c = keep(m.clone()); c.clippingPlanes = [a, b]; return c; }); me.material = Array.isArray(me.material) ? ms : ms[0]; me.userData.show = function (a0, b0) { a.constant = X - L * a0; b.constant = -X + L * b0; }; me.frustumCulled = false; me.visible = false; G.add(me); return me; }
    function show(me, a, b) { if (!me) return; me.visible = b - a > 0.002; if (me.visible) me.userData.show(a, b); }
    function prism(shape, mat, dz, onShow) { var geo = keep(new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false, curveSegments: 18 })), me = new THREE.Mesh(geo, mat); me.setRotationFromMatrix(RB); me.position.set(L / 2, 0, zj + (dz || 0)); me.castShadow = true; me.receiveShadow = true; me.frustumCulled = false; me.visible = false;
      me.userData.show = function (a, b) { var s2 = Math.max(1e-4, b - a); me.scale.z = s2; me.position.x = -L / 2 + L * b; if (onShow) onShow(s2); }; G.add(me); return me; }
    /* the bead section: a tooled (concave) or raw (convex) top, the flanks down to the foot of the bond face, the pressed rod's crown as the bottom */
    function bead(hw2, top, lift) { var s = new THREE.Shape(), yt = lift || 0; s.moveTo(-hw2, yt);
      if (top === 'raw') s.quadraticCurveTo(0, yt + hw2 * 0.45, hw2, yt); else s.quadraticCurveTo(0, yt - hw2 * 0.3, hw2, yt);
      if (hasRod) { s.lineTo(hw2, yc); s.absellipse(0, yr, ra, rv, tC, Math.PI - tC, false); s.lineTo(-hw2, yc); } else { s.lineTo(hw2, -dj); s.lineTo(-hw2, -dj); } s.lineTo(-hw2, yt); return s; }
    var oldM = keep(new THREE.MeshStandardMaterial({ map: M.tex(oldSealFace(), { repeat: [1, 6] }), color: 0xa39f97, roughness: 0.95, envMapIntensity: 0.1 }));
    var rodM = keep(new THREE.MeshStandardMaterial({ map: M.tex(rodFace(), { repeat: [2, 6] }), color: 0xd0d3d5, roughness: 0.92, envMapIntensity: 0.12 }));
    var tapeM = keep(new THREE.MeshStandardMaterial({ color: 0xe6dcb9, roughness: 0.85, envMapIntensity: 0.2 }));
    var primM = keep(new THREE.MeshStandardMaterial({ color: 0xd9c46e, roughness: 0.22, envMapIntensity: 1.2, side: THREE.DoubleSide }));
    var rawM = keep(new THREE.MeshStandardMaterial({ color: sealCol, roughness: clear ? 0.08 : 0.2, transparent: clear, opacity: clear ? 0.36 : 1, envMapIntensity: clear ? 1.9 : 0.7, depthWrite: !clear }));
    var sealM = keep(new THREE.MeshStandardMaterial({ color: sealCol, roughness: clear ? 0.1 : 0.42, transparent: clear, opacity: clear ? 0.36 : 1, envMapIntensity: clear ? 1.4 : 0.6, depthWrite: !clear }));
    var paintM = keep(new THREE.MeshStandardMaterial({ color: 0xe9e4d6, roughness: 0.6, envMapIntensity: 0.3 }));
    /* the old bead (renewal): shrunk below the face, crazed, torn off the far flank — the adhesion failure that lets water in; it is cut out from one end */
    var old = reno ? prism((function () { var s = new THREE.Shape(), a = -w2 + 0.09, b = w2 - 0.015, yb = -dj - 0.06, yt = -0.09; s.moveTo(a, yt); s.quadraticCurveTo((a + b) / 2, yt - w2 * 0.55, b, yt); s.lineTo(b, yb); s.lineTo(a + 0.05, yb + 0.05); s.lineTo(a, yt); return s; })(), oldM, 0, function (s2) { oldM.map.repeat.y = 6 * s2; }) : null;
    /* the rod: an elliptical cylinder, pressed to the joint width, its crown at the sealant depth */
    var rod = !hasRod ? null : (function () { var me = new THREE.Mesh(keep(new THREE.CylinderGeometry(1, 1, 1, 40)), rodM); me.rotation.z = Math.PI / 2; me.position.set(0, yr, zj); me.scale.set(rv, L, ra); me.castShadow = true; me.receiveShadow = true; me.frustumCulled = false; me.visible = false;
      me.userData.show = function (a, b) { me.scale.y = Math.max(1e-4, L * (b - a)); me.position.x = -L / 2 + L * (a + b) / 2; }; G.add(me); return me; })();
    /* masking tape (0.2 mm) laid on the surface beside the arris, following the relief; on the aluminium a flat strip */
    function tapeOn(z0, z1) { var Yt = new Float32Array(n), mk = new Uint8Array(n); for (k = 0; k < n; k++) { var zz = gz(k); mk[k] = (zz >= z0 && zz <= z1) ? 0 : 1; Yt[k] = Hs[k] + 0.012; } var me = new THREE.Mesh(M.surface(Yt, { floor: Hs, mask: mk, uvk: 1 }), [tapeM, tapeM]); me.castShadow = true; me.receiveShadow = true; return clipped(me); }
    function tapeBox(y0, z0, z1) { var me = new THREE.Mesh(keep(new THREE.BoxGeometry(2 * X, 0.012, z1 - z0)), tapeM); me.position.set(0, y0 + 0.006, (z0 + z1) / 2); me.castShadow = true; me.receiveShadow = true; return clipped(me); }
    var tapes = [metal ? tapeBox(0.02, zf1 + 0.03, Z) : tapeOn(zf1 + 0.03, Z + 1), tapeOn(-Z - 1, zf0 - 0.03)];
    /* the primer film on each bond face: 0.1 mm proud of the flank, soaked into it, from the arris (following the surface) down to the foot of the bond face */
    function film(side) { var zF = side > 0 ? zf1 : zf0, zIn = zF - side * FILM, zOut = zF + side * 0.02, zs = zF + side * 0.012, P = [], tops = [], x, t2, yc = thin ? Math.max(ycF, yBoard) : ycF; // the primer stops at the board's back face
      for (i = 0; i < NX; i++) { x = gx(i); t2 = (metal && side > 0) ? 0.02 : M.sample(Hs, x, zs); tops.push(Math.min(t2, (metal && side > 0) ? 0.02 : 0) - 0.002); }
      function quad(p1, p2, p3, p4) { P.push.apply(P, p1); P.push.apply(P, p2); P.push.apply(P, p3); P.push.apply(P, p1); P.push.apply(P, p3); P.push.apply(P, p4); }
      for (i = 0; i < NX - 1; i++) { var x0 = gx(i), x1 = gx(i + 1), t0 = tops[i], t1 = tops[i + 1];
        quad([x0, t0, zIn], [x0, yc, zIn], [x1, yc, zIn], [x1, t1, zIn]); quad([x0, t0, zOut], [x0, t0, zIn], [x1, t1, zIn], [x1, t1, zOut]); quad([x0, yc, zOut], [x0, yc, zIn], [x1, yc, zIn], [x1, yc, zOut]); }
      quad([gx(0), tops[0], zIn], [gx(0), yc, zIn], [gx(0), yc, zOut], [gx(0), tops[0], zOut]); quad([gx(NX - 1), tops[NX - 1], zIn], [gx(NX - 1), yc, zIn], [gx(NX - 1), yc, zOut], [gx(NX - 1), tops[NX - 1], zOut]);
      var geo = keep(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3)); geo.computeVertexNormals(); geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 3);
      var me = new THREE.Mesh(geo, primM); me.castShadow = false; me.receiveShadow = true; return clipped(me); }
    var films = [film(1), film(-1)];
    /* the paint over the tooled bead: a skin of 0.45 mm on the concave top, lapping over the arris — a crescent, not a second bead, so the two end faces never share a plane */
    function skin(hw2, th) { var s = new THREE.Shape(), hwi = hw, d2 = hwi * 0.3; s.moveTo(-hw2, th); s.quadraticCurveTo(0, th - d2, hw2, th); s.lineTo(hw2, 0.0005); s.lineTo(hwi, 0); s.quadraticCurveTo(0, -d2, -hwi, 0); s.lineTo(-hw2, 0.0005); s.lineTo(-hw2, th); return s; }
    var raw = prism(bead(hw, 'raw', 0.01), rawM), tooled = prism(bead(hw, 'tool', 0), sealM), cap = cfg.paint ? prism(skin(hw + FILM + 0.015, 0.028), paintM) : null;
    if (cfg.paint) { var Yp = new Float32Array(n); for (k = 0; k < n; k++) Yp[k] = Math.max(Hs[k], B0[k] + 0.004) + 0.45 * MM; M.layer('paint', Yp, Hs, paintM, { end: X, stage: 'paint', mask: JM, noCap: true }); }
    function f(id, si, t, stage) { var i2 = ST.indexOf(stage); return i2 < 0 ? 0 : si > i2 ? 1 : si === i2 ? t : 0; }
    var depth = -FLOOR + 0.1, Yg = G.position.y;
    return { top: null, open: null, home: { az: 34, el: 52, dist: 5.2 + Math.max(0, depth - 1.9) * 1.0, t: [0.1, Yg - 0.2 - depth * 0.3, 0.1] },
      cams: { sec: { az: -62, el: 17, dist: 3.8 + Math.max(0, depth - 1.2) * 0.9, t: [-X * 0.6, Yg - depth * 0.24, 0.08] } }, // the end face of the sample: the section through the joint, for the documents
      set: function (id, t, from, si, x) {
      own.forEach(function (c) { c.visible = false; }); if (x.waterCrack) x.waterCrack.visible = false; if (x.waterHeld) x.waterHeld.visible = false;
      var rem = ST.indexOf('remove') < 0 ? 1 : f(id, si, t, 'remove'), fr = f(id, si, t, 'backer'), ft = f(id, si, t, 'tape'), fp = f(id, si, t, 'prime'), ff = f(id, si, t, 'fill'), fo = f(id, si, t, 'tool'), fpt = f(id, si, t, 'paint');
      show(old, rem, 1); show(rod, 0, fr); tapes.forEach(function (tp) { show(tp, 0, fo > 0.999 ? 0 : ft); }); films.forEach(function (p) { show(p, 0, fp); });
      show(raw, fo, ff); show(tooled, 0, fo); show(cap, 0, fpt);
      var wet = id === 'fill' || id === 'tool' ? 1 : id === 'done' ? 1 - t : 0; sealM.roughness = (clear ? 0.1 : 0.42) - (clear ? 0.04 : 0.3) * wet;
    } };
  }
  /* ---------- the six members ---------- */
  var APPS = {
    siding: make({ sub: 'siding', thick: 0.016, w: 0.01, d: 0.01, vx: [-0.42, 0.56], hy: [0.95], reno: true, seal: 'EX' }),
    sash: make({ sub: 'siding', thick: 0.016, w: 0.012, d: 0.01, vx: [0.98], hy: [], sash: { x0: -0.55, x1: 0.42, y0: 0.55, y1: 1.5 }, seal: 'EX' }),
    pca: make({ sub: 'pca', thick: 0.15, w: 0.02, d: 0.015, vx: [-0.2, 1.0], hy: [0.95], pca: true, seal: 'EX' }),
    paint: make({ sub: 'alc', thick: 0.1, w: 0.015, d: 0.01, vx: [-0.6, 0.0, 0.6], hy: [0.95], paint: true, seal: 'NB101', xc: 0.3 }),
    vent: make({ sub: 'siding', thick: 0.016, w: 0.01, d: 0.01, vx: [], hy: [], vent: { x: 0.42, y: 1.05, r: 0.1 }, ebox: { x0: 0.9, x1: 1.06, y0: 0.9, y1: 1.1 }, seal: 'CLIO', xc: 0.22 }),
    water: make({ sub: 'rc', thick: 0.16, w: 0.02, d: 0.015, vx: [0.5], hy: [0.95], water: true, seal: 'NB101' }),
    civil: make({ sub: 'rc', thick: 0.16, w: 0.02, d: 0.015, vx: [0.5], hy: [0.95], civil: true, crack: { x: 0.12, y0: 0, y1: 0.93 }, seal: 'TF2000' }),
    ind: make({ sub: 'steel', thick: 0.0028, w: 0.01, d: 0.008, vx: [], hy: [], lap: { y: 0.95, x: 0.5, t: 0.0028 }, mould: { x0: 0.56, x1: 1.04, y0: 0.72, y1: 0.76 }, ebox: { x0: 1.05, x1: 1.19, y0: 0.67, y1: 0.81 }, ind: true, seal: 'R101', xc: 0.3 }),
    putty: make({ sub: 'siding', thick: 0.016, w: 0.005, d: 0.008, vx: [0.56], hy: [0.95], putty: true, staticJoints: true, crack: { y: 1.25, x0: -0.3, x1: 0.45 }, nails: true, paint: true, seal: 'FLATP' })
  };
  APPS.water.sub = 'block'; APPS.civil.sub = 'block';
  /* the title object: a wall sample with one horizontal joint, its seven stages side by side */
  function panel(self, M) {
    var g = new THREE.Group(), trash = [], RWp = THREE.RepeatWrapping, W = 0.42, Hh = 0.24, BX = [-0.21, -0.15, -0.09, -0.03, 0.03, 0.09, 0.15, 0.21], NB = 7, zc = 0.016, yj = 0.105, w = 0.02, d = 0.02;
    self.group = g; self.scn = 'panel'; self.cut = false; self.cam = { az: -24, el: 16, dist: 0.43, t: [0, 0.12, 0.02] }; self.ground = 0;
    function keep(o) { trash.push(o); return o; }
    function mat(o) { return keep(new THREE.MeshStandardMaterial(o)); }
    function mesh(geo, m) { var me = new THREE.Mesh(keep(geo), m); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; }
    var sid = mat({ map: keep(canvasTex(sidingFace(), { wrap: RWp, repeat: [0.42, 0.24] })), roughness: 0.9, envMapIntensity: 0.28 }), back = mat({ color: 0x77746d, roughness: 0.97 }), edge = mat({ color: 0xb9b4aa, roughness: 0.95 }), sawn = mat({ map: keep(canvasTex(TEX.aggregate(), { wrap: RWp })), roughness: 0.85 });
    function box(x0, x1, y0, y1, z0, z1, m) { var me = mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); me.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return me; }
    box(-W / 2, W / 2, 0, Hh, -0.12 - zc, -zc, [sawn, sawn, back, back, back, back]);
    box(-W / 2, W / 2, 0, yj - w / 2, -zc, 0, [edge, edge, edge, edge, sid, edge]); box(-W / 2, W / 2, yj + w / 2, Hh, -zc, 0, [edge, edge, edge, edge, sid, edge]);
    var old = mat({ map: keep(canvasTex(oldSealFace(), { wrap: RWp, repeat: [1, 8] })), color: 0xa7a49d, roughness: 0.92 }), rod = mat({ color: 0xcfd3d6, roughness: 0.75 }), tape = mat({ color: 0xe6dcb9, roughness: 0.85 }), prim = mat({ color: 0xe4d38e, roughness: 0.16, transparent: true, opacity: 0.55, depthWrite: false }), raw = mat({ color: 0x6d7073, roughness: 0.25, envMapIntensity: 0.7 }), seal = mat({ color: 0x6d7073, roughness: 0.42, envMapIntensity: 0.6 });
    var RM = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
    function bead(i0, i1, top, m, dz) { var x0 = BX[i0] + 0.0006, x1 = BX[i1] - 0.0006, geo = keep(new THREE.ExtrudeGeometry(beadShape(top === 'old' ? w * 0.92 : w, top === 'old' ? d * 0.8 : d, top), { depth: x1 - x0, bevelEnabled: false, curveSegments: 8 })), me = new THREE.Mesh(geo, m); me.setRotationFromMatrix(RM); me.position.set(x0, yj, dz || 0); me.castShadow = false; g.add(me); return me; }
    bead(0, 1, 'old', old, -0.001); // band 1: as found
    (function () { var me = mesh(new THREE.CylinderGeometry(w * 0.62, w * 0.62, W / 2 - BX[2] - 0.001, 18), rod); me.rotation.z = Math.PI / 2; me.position.set((BX[2] + W / 2) / 2, yj, -d - w * 0.55); me.castShadow = false; })(); // bands 3–7: the rod
    [yj + w / 2 + 0.014, yj - w / 2 - 0.014].forEach(function (y) { var me = box(BX[3] + 0.0006, BX[6] - 0.0006, y - 0.012, y + 0.012, 0.0004, 0.0009, tape); me.castShadow = false; }); // bands 4–6: the tape
    [[yj + w / 2 - 0.0006], [yj - w / 2 + 0.0006]].forEach(function (y) { var me = box(BX[3] + 0.0006, W / 2 - 0.0006, y[0] - 0.0006, y[0] + 0.0006, -d - 0.003, 0, prim); me.castShadow = false; }); // bands 4–7: the primer on the flanks
    bead(4, 5, 'raw', raw); bead(5, 7, 'tool', seal);
    self.anchors = function () { var L = [], i; for (i = 0; i < NB; i++) L.push({ k: String(i + 1), p: [(BX[i] + BX[i + 1]) / 2, yj + 0.06, 0.002] }); return L; };
    self.set = function () {}; self.dispose = function () { trash.forEach(function (o) { if (o && o.dispose) o.dispose(); }); trash = []; };
  }
  return { apps: APPS, panel: panel, make: make, EXG: EXG };
})();
SL_ORDER.forEach(function (id) { WPM3D[id] = SL3D.apps[id]; WP_STAGES[id] = SL_STAGES[id]; });
(function () { var _WPPanel = WPPanel; WPPanel = function (M, kind) { if (kind === 'sl') { SL3D.panel(this, M); return this; } return _WPPanel.call(this, M, kind); }; })();


