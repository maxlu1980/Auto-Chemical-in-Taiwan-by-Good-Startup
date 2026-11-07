/* ===== [tw_boss.js] ===== */
/* ===== BOSSM — the great foes of the island (v33): original designs for a soulslike duel =====
   Two code rigs drive them all. A giant humanoid (hips, spine, chest, neck, head, two arms of two bones with a hand socket, two legs of
   two bones) for the Crack Colossus of the old grove, the Salt Demon of the blazing sun, the anchor-swinging boss of the harbour crew and
   his men, and the lacquered knight who runs the counterfeit works. A great beast (body, a neck and a tail of chained segments, a head
   with a jaw, four legs, optional wings) for the Leak Dragon of the deep lake and the iron rail-beast under Ueno. Every pose is a set of
   joint angles; the duel drives them through the phases of an attack — wind-up, strike, recovery — so the tell is always readable.
   Cel-shaded like the people (vertex-coloured toon parts with ink hulls); glowing parts unlit so the bloom picks them up. */
var BOSSM = (function () {
  var K = null, TVM = null, GLM = null, V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
  function init() { if (K) return; K = KIT; TVM = LUNA.toon(0xffffff, { vc: true, rim: 0.28 }); GLM = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }); }
  function grp(parent, p) { var g = new THREE.Group(); if (p) g.position.set(p[0], p[1], p[2]); if (parent) parent.add(g); return g; }
  /* fill a joint with a toon batch (inked) and a glow batch */
  function skin(g, fill, glow, ink) { var b = K.Batch(), c = K.Batch(); if (fill) fill(b); if (glow) glow(c); if (b.count()) g.add(LUNA.mesh(b.geometry(), TVM, { ink: ink || 0.014 })); if (c.count()) { var m = new THREE.Mesh(c.geometry(), GLM); m.userData.glow = true; g.add(m); } return g; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function ease(u) { return u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u); }
  function sh(u) { return u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); } /* snappy */
  function tubeG(pts, r0, r1, seg) { var cv = new THREE.CatmullRomCurve3(pts.map(function (p) { return V(p[0], p[1], p[2]); })); return LUNA.taper(cv, seg || 12, 8, function (t) { return r0 + (r1 - r0) * t; }, {}); }

  /* ================= the giant humanoid ================= */
  /* o: { hip, hipW, torso, shW, a1, a2, l1, l2, parts: { pelvis, torso, head, uarm(side), farm(side), thigh(side), shin(side), handR, handL, back }, ink } */
  function humanoid(o) { init(); var R = { root: new THREE.Group(), o: o, t: Math.random() * 9, pose: {}, j: {} }, j = R.j, P = o.parts, ink = o.ink || 0.014;
    j.base = grp(R.root); j.hips = grp(j.base, [0, o.hip, 0]); skin(j.hips, P.pelvis && P.pelvis.f, P.pelvis && P.pelvis.g, ink);
    j.spine = grp(j.hips, [0, 0.02 * o.torso, 0]); if (P.waist) skin(j.spine, P.waist.f, P.waist.g, ink); j.chest = grp(j.spine, [0, o.torso * 0.45, 0]); skin(j.chest, P.torso.f, P.torso.g, ink);
    j.neck = grp(j.chest, [0, o.neckY != null ? o.neckY : o.torso * 0.55, o.neckZ || 0]); j.head = grp(j.neck, [0, o.neck || 0.1, 0]); skin(j.head, P.head.f, P.head.g, ink);
    if (P.back) { j.back = grp(j.chest, [0, o.torso * 0.4, -o.torso * 0.2]); skin(j.back, P.back.f, P.back.g, ink); }
    [1, -1].forEach(function (s) { var k = s > 0 ? 'L' : 'R';
      var sp = grp(j.chest, [s * o.shW, o.shY != null ? o.shY : o.torso * 0.48, 0]); skin(sp, P.uarm && P.uarm.f && function (b) { P.uarm.f(b, s); }, P.uarm && P.uarm.g && function (b) { P.uarm.g(b, s); }, ink);
      var el = grp(sp, [0, -o.a1, 0]); skin(el, P.farm && P.farm.f && function (b) { P.farm.f(b, s); }, P.farm && P.farm.g && function (b) { P.farm.g(b, s); }, ink);
      var hd = grp(el, [0, -o.a2, 0]); var H2 = s > 0 ? P.handL : P.handR; if (H2) skin(hd, H2.f, H2.g, ink);
      j['sh' + k] = sp; j['el' + k] = el; j['hd' + k] = hd;
      var hp = grp(j.hips, [s * o.hipW, 0, 0]); skin(hp, P.thigh && P.thigh.f && function (b) { P.thigh.f(b, s); }, P.thigh && P.thigh.g && function (b) { P.thigh.g(b, s); }, ink);
      var kn = grp(hp, [0, -o.l1, 0]); skin(kn, P.shin && P.shin.f && function (b) { P.shin.f(b, s); }, P.shin && P.shin.g && function (b) { P.shin.g(b, s); }, ink);
      j['hp' + k] = hp; j['kn' + k] = kn; });
    if (o.extra) o.extra(R);
    R.h = o.h || (o.hip + o.torso + 0.5); LUNA.curvedAll(R.root); R.root.traverse(function (m) { if (m.isMesh && !m.userData.ink) m.castShadow = true; });
    R.update = function (dt, st) { humUpdate(R, dt, st || {}); }; humUpdate(R, 0.016, {}); return R; }
  /* the poses: angles in radians; shoulders x swing (negative raises forward), z spread (+ outwards on the left), elbows x (negative bends) */
  var HP0 = { y: 0, sp: 0.06, spy: 0, ch: 0.04, hx: 0, hy: 0, sLx: 0.1, sLz: 0.28, eL: -0.35, sRx: 0.1, sRz: -0.28, eR: -0.35, hLx: 0, kL: 0.08, hRx: 0, kR: 0.08, lean: 0, roll: 0 };
  function pose(base, add) { var p = Object.assign({}, base); for (var k in add) p[k] = add[k]; return p; }
  function mix(a, b, k) { var p = {}; for (var x in a) p[x] = lerp(a[x], b[x] == null ? a[x] : b[x], k); return p; }
  /* attack tables: [wind pose, strike pose, (recover → idle)] */
  var HA = {
    slam: [{ sp: -0.3, ch: -0.2, sLx: -2.9, sLz: 0.15, eL: -0.9, sRx: -2.9, sRz: -0.15, eR: -0.9, hx: -0.25, y: 0.05 }, { sp: 0.55, ch: 0.25, sLx: -0.5, sLz: 0.1, eL: -0.1, sRx: -0.5, sRz: -0.1, eR: -0.1, hLx: -0.5, kL: 0.7, hRx: 0.3, kR: 0.5, y: -0.18, hx: 0.3 }],
    sweep: [{ spy: 1.0, sp: 0.05, sRx: -1.1, sRz: -1.4, eR: -0.5, sLx: -0.3, sLz: 0.6, eL: -0.6, hy: -0.4, hLx: -0.2, kL: 0.3 }, { spy: -1.1, sp: 0.15, sRx: -1.3, sRz: -0.4, eR: -0.1, sLx: 0.3, sLz: 0.9, eL: -0.4, hy: 0.3, hRx: -0.3, kR: 0.35 }],
    backhand: [{ spy: -0.9, sRx: -1.2, sRz: 0.2, eR: -1.6, hy: 0.3 }, { spy: 1.0, sRx: -1.3, sRz: -1.5, eR: -0.1, hy: -0.3, hLx: -0.25, kL: 0.3 }],
    thrust: [{ sp: -0.15, spy: 0.5, sRx: 0.4, sRz: -0.3, eR: -1.9, sLx: -0.8, sLz: 0.5, eL: -0.6, hRx: 0.4, kR: 0.4 }, { sp: 0.35, spy: -0.25, sRx: -1.55, sRz: -0.1, eR: -0.05, sLx: 0.4, sLz: 0.5, eL: -0.3, hLx: -0.7, kL: 0.5, hRx: 0.45, kR: 0.1, y: -0.08 }],
    stomp: [{ hRx: -1.3, kR: 1.4, sp: -0.15, sLz: 0.8, sRz: -0.8, eL: -0.2, eR: -0.2, y: 0.04 }, { hRx: -0.2, kR: 0.2, sp: 0.3, sLz: 0.6, sRz: -0.6, hLx: -0.2, kL: 0.5, y: -0.15 }],
    jump: [{ y: -0.35, sp: 0.5, hLx: -1.0, kL: 1.5, hRx: -1.0, kR: 1.5, sLx: 0.8, sRx: 0.8, eL: -0.2, eR: -0.2 }, { y: -0.2, sp: 0.6, hLx: -0.7, kL: 1.1, hRx: -0.7, kR: 1.1, sLx: -0.4, sRx: -0.4, sLz: 0.1, sRz: -0.1, eL: -0.1, eR: -0.1, hx: 0.3 }],
    roar: [{ sp: -0.35, ch: -0.3, hx: -0.5, sLz: 1.2, sRz: -1.2, sLx: -0.4, sRx: -0.4, eL: -0.5, eR: -0.5 }, { sp: -0.4, ch: -0.35, hx: -0.6, sLz: 1.35, sRz: -1.35, sLx: -0.6, sRx: -0.6, eL: -0.2, eR: -0.2 }],
    grab: [{ sp: -0.1, sLx: -0.8, sLz: 0.9, eL: -1.2, sRx: -0.8, sRz: -0.9, eR: -1.2 }, { sp: 0.45, sLx: -1.5, sLz: 0.25, eL: -0.2, sRx: -1.5, sRz: -0.25, eR: -0.2, hLx: -0.6, kL: 0.4, y: -0.06 }],
    twin: [{ spy: 0.6, sRx: -2.4, sRz: -0.5, eR: -0.4, sLx: 0.5, sLz: 0.9, eL: -0.8, hx: -0.2 }, { spy: -0.5, sRx: 0.3, sRz: -0.2, eR: -0.2, sLx: -2.3, sLz: 0.4, eL: -0.4, sp: 0.3, hLx: -0.4, kL: 0.4 }],
    cast: [{ sp: -0.2, sLx: -2.6, sLz: 0.4, eL: -0.2, sRx: -2.6, sRz: -0.4, eR: -0.2, hx: -0.4 }, { sp: 0.2, sLx: -1.4, sLz: 0.6, eL: -0.1, sRx: -1.4, sRz: -0.6, eR: -0.1, hx: 0.1 }],
    spin: [{ spy: 1.4, sRx: -1.5, sRz: -1.5, sLx: -1.5, sLz: 1.5, eL: -0.1, eR: -0.1, hRx: -0.2, kR: 0.4 }, { spy: -1.4, sRx: -1.5, sRz: -1.5, sLx: -1.5, sLz: 1.5, eL: -0.1, eR: -0.1, hLx: -0.2, kL: 0.4 }]
  };
  var HS = { stagger: { y: -0.55, sp: 0.75, ch: 0.3, hx: 0.5, hLx: -1.5, kL: 2.0, hRx: 0.4, kR: 1.7, sLx: 0.3, sLz: 0.5, eL: -0.6, sRx: -0.6, sRz: -0.3, eR: -0.8 },
    die: { y: -0.8, sp: 1.0, ch: 0.4, hx: 0.6, hLx: -1.6, kL: 2.2, hRx: -1.6, kR: 2.2, sLx: 0.2, sLz: 0.7, eL: -0.2, sRx: 0.2, sRz: -0.7, eR: -0.2 },
    hurt: { sp: -0.25, ch: -0.2, hx: -0.3, sLz: 0.5, sRz: -0.5 } };
  function humUpdate(R, dt, st) { R.t += dt; var t = R.t, o = R.o, j = R.j, a = st.anim, p = pose(HP0, o.idle || {}), mv = st.moving ? 1 : 0, sp = st.speed || 1;
    /* breathing and the walk cycle */ var br = Math.sin(t * 1.6) * 0.03; p.ch += br; p.sp += br * 0.5; p.sLz += br; p.sRz -= br;
    if (mv) { var w = t * 4.2 * sp; p.hLx = Math.sin(w) * 0.55; p.hRx = -Math.sin(w) * 0.55; p.kL = 0.15 + Math.max(0, -Math.cos(w)) * 0.9; p.kR = 0.15 + Math.max(0, Math.cos(w)) * 0.9; p.sLx += -Math.sin(w) * 0.35; p.sRx += Math.sin(w) * 0.35; p.y = -Math.abs(Math.cos(w)) * 0.06 * o.hip; p.sp += 0.12; p.spy = Math.sin(w) * 0.12; }
    if (a && HA[a.name]) { var T = HA[a.name], wp = pose(p, T[0]), sp2 = pose(p, T[1]), q;
      if (a.ph === 'wind') q = mix(p, wp, ease(a.k * 1.4)); else if (a.ph === 'act') q = mix(wp, sp2, sh(a.k * 1.6)); else q = mix(sp2, p, ease(a.k)); p = q; }
    else if (a && HS[a.name]) p = mix(p, pose(p, HS[a.name]), ease(Math.min(1, (a.k || 0) * 2.5)));
    if (R.pose.y == null) R.pose = p; var k = 1 - Math.exp(-dt * (a && a.ph === 'act' ? 26 : 12)); R.pose = mix(R.pose, p, k); p = R.pose;
    var H = o.hip; j.hips.position.y = H + p.y * H; j.spine.rotation.set(p.sp, p.spy, p.roll); j.chest.rotation.set(p.ch, 0, 0); j.head.rotation.set(p.hx - p.sp * 0.4, p.hy, 0);
    j.shL.rotation.set(p.sLx, 0, p.sLz); j.shR.rotation.set(p.sRx, 0, p.sRz); j.elL.rotation.set(p.eL, 0, 0); j.elR.rotation.set(p.eR, 0, 0);
    j.hpL.rotation.set(p.hLx, 0, 0.04); j.hpR.rotation.set(p.hRx, 0, -0.04); j.knL.rotation.set(p.kL, 0, 0); j.knR.rotation.set(p.kR, 0, 0);
    /* keep the feet on the ground: lower the hips by the shortening of the stance leg */ var lL = o.l1 * Math.cos(p.hLx) + o.l2 * Math.cos(p.hLx + p.kL), lR = o.l1 * Math.cos(p.hRx) + o.l2 * Math.cos(p.hRx + p.kR), drop = (o.l1 + o.l2) - Math.max(lL, lR); j.base.position.y = -drop;
    if (R.tick) R.tick(dt, st, p); }

  /* ================= the great beast ================= */
  /* o: { bodyY, len, neckN, neckL, tailN, tailL, legH, parts: { body, neck(i), head, jaw, tail(i), leg(f, s, upper), wing(s) } } */
  function beast(o) { init(); var R = { root: new THREE.Group(), o: o, t: Math.random() * 9, j: {}, pose: null }, j = R.j, P = o.parts, ink = o.ink || 0.016;
    j.base = grp(R.root); j.body = grp(j.base, [0, o.bodyY, 0]); skin(j.body, P.body.f, P.body.g, ink);
    var prev = grp(j.body, [0, o.neckY || 0.2, o.len * 0.5]); j.neck = []; for (var i = 0; i < o.neckN; i++) { var s = grp(prev, i ? [0, 0, o.neckL] : [0, 0, 0]); skin(s, P.neck && function (b) { P.neck.f(b, i); }, P.neck && P.neck.g && function (b) { P.neck.g(b, i); }, ink); j.neck.push(s); prev = s; }
    j.head = grp(prev, [0, 0, o.neckL]); skin(j.head, P.head.f, P.head.g, ink); j.jaw = grp(j.head, o.jawAt || [0, -0.15, 0.1]); skin(j.jaw, P.jaw.f, P.jaw.g, ink);
    prev = grp(j.body, [0, o.tailY || 0, -o.len * 0.5]); j.tail = []; for (i = 0; i < o.tailN; i++) { var t2 = grp(prev, i ? [0, 0, -o.tailL] : [0, 0, 0]); skin(t2, P.tail && function (b) { P.tail.f(b, i); }, P.tail && P.tail.g && function (b) { P.tail.g(b, i); }, ink); j.tail.push(t2); prev = t2; }
    j.legs = []; [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (q) { var f = q[1] > 0, s = q[0], hp = grp(j.body, [s * o.legX, o.legYb || 0, f ? o.len * 0.33 : -o.len * 0.3]); skin(hp, function (b) { P.leg.f(b, f, s, 0); }, P.leg.g && function (b) { P.leg.g(b, f, s, 0); }, ink); var kn = grp(hp, [0, -o.legH * 0.5, 0]); skin(kn, function (b) { P.leg.f(b, f, s, 1); }, P.leg.g && function (b) { P.leg.g(b, f, s, 1); }, ink); j.legs.push({ hp: hp, kn: kn, f: f, s: s }); });
    if (P.wing) { j.wings = [1, -1].map(function (s) { var w = grp(j.body, [s * o.legX * 0.9, o.bodyR || 0.6, o.len * 0.18]); var w2 = grp(w, [s * o.wingL * 0.5, 0, 0]); skin(w, function (b) { P.wing.f(b, s, 0); }, null, ink); skin(w2, function (b) { P.wing.f(b, s, 1); }, null, ink); return { a: w, b: w2, s: s }; }); }
    if (o.extra) o.extra(R);
    R.h = o.h || o.bodyY * 2; LUNA.curvedAll(R.root); R.root.traverse(function (m) { if (m.isMesh && !m.userData.ink) m.castShadow = true; });
    R.update = function (dt, st) { beastUpdate(R, dt, st || {}); }; beastUpdate(R, 0.016, {}); return R; }
  var BP0 = { y: 0, pitch: 0, yaw: 0, nx: 0, ny: 0, hx: 0, jaw: 0.05, tx: 0.08, ty: 0, fl: 0, hl: 0, wing: 0, wf: 0 };
  var BA = {
    bite: [{ nx: -0.35, ny: 0, hx: -0.3, jaw: 0.6, pitch: -0.08, y: 0.05 }, { nx: 0.55, hx: 0.25, jaw: 0.05, pitch: 0.12, y: -0.08 }],
    tail: [{ yaw: -0.9, tx: 0.2, ty: 0.6, nx: -0.1 }, { yaw: 1.6, tx: 0.05, ty: -0.9, nx: 0 }],
    breath: [{ nx: -0.6, hx: -0.5, jaw: 0.2, pitch: -0.15 }, { nx: 0.15, hx: 0.2, jaw: 0.9, pitch: 0.05 }],
    stomp: [{ pitch: -0.55, fl: 1.0, y: 0.3, nx: -0.3 }, { pitch: 0.12, fl: -0.2, y: -0.1, nx: 0.3, hx: 0.2 }],
    charge: [{ pitch: 0.2, nx: 0.35, hx: 0.2, y: -0.1 }, { pitch: 0.25, nx: 0.45, hx: 0.25, y: -0.05 }],
    leap: [{ y: -0.25, pitch: -0.2, nx: -0.2, fl: 0.4, hl: 0.4 }, { y: -0.12, pitch: 0.2, nx: 0.35, fl: -0.2, hl: -0.2 }],
    wing: [{ wing: 1.2, wf: 0, nx: -0.4, pitch: -0.2 }, { wing: -0.6, wf: 0, nx: 0.1, pitch: 0.05 }],
    roar: [{ nx: -0.7, hx: -0.6, jaw: 0.8, pitch: -0.25, wing: 0.9 }, { nx: -0.8, hx: -0.7, jaw: 1.0, pitch: -0.3, wing: 1.1 }],
    volley: [{ pitch: -0.1, nx: -0.4, hx: -0.4 }, { pitch: 0.0, nx: -0.3, hx: -0.3 }]
  };
  var BS = { stagger: { y: -0.45, pitch: 0.2, nx: 0.6, hx: 0.4, jaw: 0.4, fl: -0.4, hl: 0.3 }, die: { y: -0.7, pitch: 0.05, nx: 0.9, hx: 0.5, jaw: 0.5, tx: -0.2, wing: -0.6 }, hurt: { nx: -0.3, hx: -0.4, jaw: 0.5 } };
  function beastUpdate(R, dt, st) { R.t += dt; var t = R.t, o = R.o, j = R.j, a = st.anim, p = Object.assign({}, BP0), mv = st.moving ? 1 : 0;
    p.nx += Math.sin(t * 0.9) * 0.05; p.ny = Math.sin(t * 0.5) * 0.15; p.ty = Math.sin(t * 1.1) * 0.25; p.jaw += Math.max(0, Math.sin(t * 0.7)) * 0.08; p.wing = Math.sin(t * 0.8) * 0.05;
    if (st.look != null) p.ny = Math.max(-0.7, Math.min(0.7, st.look));
    if (a && BA[a.name]) { var T = BA[a.name], wp = Object.assign({}, p, T[0]), sp2 = Object.assign({}, p, T[1]);
      p = a.ph === 'wind' ? mix(p, wp, ease(a.k * 1.4)) : a.ph === 'act' ? mix(wp, sp2, sh(a.k * 1.6)) : mix(sp2, p, ease(a.k)); }
    else if (a && BS[a.name]) p = mix(p, Object.assign({}, p, BS[a.name]), ease(Math.min(1, (a.k || 0) * 2.5)));
    if (!R.pose) R.pose = p; var k = 1 - Math.exp(-dt * (a && a.ph === 'act' ? 24 : 10)); R.pose = mix(R.pose, p, k); p = R.pose;
    j.base.position.y = p.y * o.bodyY; j.body.rotation.set(p.pitch, p.yaw, 0);
    var nn = j.neck.length; j.neck.forEach(function (s, i) { s.rotation.set((p.nx + (i === 0 ? -0.35 : 0.1)) / nn * 1.6 + (o.neckArch ? o.neckArch[i] || 0 : 0), p.ny / nn, 0); });
    j.head.rotation.set(p.hx + (o.headTilt || 0), 0, 0); j.jaw.rotation.set(p.jaw, 0, 0);
    var tn = j.tail.length; j.tail.forEach(function (s, i) { s.rotation.set(-p.tx / tn * 2 + (o.tailArch || 0), p.ty / tn * 1.5 + Math.sin(t * 1.4 - i * 0.6) * 0.06, 0); });
    var w = t * 3.4 * (st.speed || 1); j.legs.forEach(function (L, i) { var ph = (i === 0 || i === 3) ? 0 : Math.PI, sw = mv ? Math.sin(w + ph) * 0.5 : 0, lift = mv ? Math.max(0, Math.cos(w + ph)) * 0.6 : 0; L.hp.rotation.set((L.f ? -p.fl : -p.hl) + sw - p.pitch, 0, 0); L.kn.rotation.set((L.f ? -0.15 : 0.25) + (L.f ? -lift : lift) + (L.f ? p.fl * 1.2 : 0), 0, 0); });
    if (j.wings) j.wings.forEach(function (W2) { var f = p.wing + (a && a.name === 'wing' && a.ph === 'act' ? Math.sin(t * 22) * 0.4 : 0); W2.a.rotation.set(0.55, 0, W2.s * (0.55 + f)); W2.b.rotation.set(0, 0, W2.s * (-0.25 + f * 0.6)); });
    if (R.tick) R.tick(dt, st, p); }

  /* ================= the bosses ================= */
  /* — the Crack Colossus: a knight of stacked stone and old roots, its cracks glowing like molten sealant, a slab of rock for a sword — */
  function colossus() { var S = 0x8f877b, S2 = 0x7a7368, MO = 0x5f7a3a, RT = 0x5a4430, GL = 0xff8a2a, r = K ? K.seeded(7) : null; init(); r = K.seeded(7);
    function stone(b, w, h, d, p, col, rot) { b.add(K.rbox(w, h, d, Math.min(w, h, d) * 0.18, 2), { p: p, r: rot || [0, 0, 0] }, col || S); }
    function cracks(c, n, w, h, d, y0) { for (var i = 0; i < n; i++) { var x = (r() - 0.5) * w, y = y0 + r() * h, ang = r() * 3; c.add(K.box(0.05, 0.25 + r() * 0.35, 0.03), { p: [x, y, d], r: [0, 0, ang] }, GL); } }
    return humanoid({ hip: 1.75, hipW: 0.36, torso: 1.55, shW: 0.95, a1: 0.95, a2: 0.9, l1: 0.88, l2: 0.86, neck: 0.18, h: 4.6, ink: 0.02, idle: { sp: 0.18, ch: 0.08, sRx: 0.0, eR: -0.2 },
      parts: {
        pelvis: { f: function (b) { stone(b, 1.05, 0.5, 0.7, [0, 0, 0], S2); stone(b, 0.5, 0.55, 0.15, [0, -0.25, 0.32], RT); }, g: function (c) { cracks(c, 3, 0.9, 0.3, 0.36, -0.15); } },
        waist: { f: function (b) { stone(b, 0.95, 0.75, 0.66, [0, 0.38, 0.0], S); b.add(K.tube([[-0.4, 0.1, 0.34], [0, 0.4, 0.38], [0.4, 0.7, 0.33]], 0.05, 8, 5), null, RT); } },
        torso: { f: function (b) { stone(b, 1.5, 0.9, 0.95, [0, 0.55, 0.0]); stone(b, 1.2, 0.6, 0.85, [0, 0.0, 0.02], S2); stone(b, 1.75, 0.35, 1.0, [0, 1.05, -0.02]); [-1, 1].forEach(function (s) { stone(b, 0.75, 0.55, 0.8, [s * 0.95, 1.12, 0], S, [0, 0, s * 0.25]); b.add(K.sph(0.32, 10, 8), { p: [s * 1.0, 1.42, 0], s: [1.3, 0.55, 1.1] }, MO); for (var i = 0; i < 3; i++) b.add(K.cyl(0.02, 0.05, 0.4, 5), { p: [s * (0.85 + i * 0.12), 1.6, (i - 1) * 0.2], r: [0.3 * (i - 1), 0, s * 0.3] }, 0x6a8a3a); }); for (var k = 0; k < 4; k++) b.add(K.tube([[-0.7 + k * 0.4, 1.0, 0.45], [-0.6 + k * 0.38, 0.5, 0.52], [-0.65 + k * 0.42, -0.1, 0.42]], 0.05, 8, 5), null, RT); },
          g: function (c) { cracks(c, 9, 1.2, 1.0, 0.49, 0.05); c.add(K.sph(0.16, 12, 10), { p: [0, 0.6, 0.47], s: [1, 1, 0.4] }, 0xffb050); } },
        head: { f: function (b) { stone(b, 0.62, 0.62, 0.6, [0, 0.3, 0.05]); b.add(K.cyl(0.36, 0.42, 0.18, 6), { p: [0, 0.66, 0.02] }, S2); for (var i = 0; i < 5; i++) b.add(K.cyl(0.0, 0.07, 0.34, 5), { p: [-0.28 + i * 0.14, 0.86, 0.02], r: [0, 0, (i - 2) * -0.12] }, S); stone(b, 0.66, 0.12, 0.2, [0, 0.36, 0.32], S2); }, g: function (c) { c.add(K.box(0.42, 0.06, 0.04), { p: [0, 0.3, 0.36] }, 0xffc060); } },
        uarm: { f: function (b, s) { stone(b, 0.48, 0.95, 0.5, [0, -0.45, 0]); b.add(K.tube([[0.15 * s, -0.1, 0.2], [0.2 * s, -0.5, 0.26], [0.1 * s, -0.85, 0.2]], 0.045, 8, 5), null, RT); }, g: function (c, s) { cracks(c, 2, 0.3, 0.6, 0.26, -0.8); } },
        farm: { f: function (b, s) { stone(b, 0.55, 0.8, 0.55, [0, -0.38, 0], S2); stone(b, 0.62, 0.35, 0.62, [0, -0.85, 0]); } },
        handR: { f: function (b) { /* the slab sword: a long rough blade of stone with a root-bound grip */ b.add(K.cyl(0.07, 0.07, 0.7, 8), { p: [0, -0.05, 0.1], r: [Math.PI / 2, 0, 0] }, RT); stone(b, 0.75, 0.16, 0.18, [0, -0.05, 0.45], S2); var sw = new THREE.Matrix4().makeRotationX(Math.PI / 2 + 0.55), g2 = K.ext([[-0.24, 0], [0.24, 0], [0.2, 2.6], [0, 3.0], [-0.22, 2.5]], 0.14); g2.translate(0, 0.25, -0.07); g2.applyMatrix4(sw); b.add(g2, { p: [0, -0.05, 0.12] }, 0x9d968a); }, g: function (c) { var sw = new THREE.Matrix4().makeRotationX(Math.PI / 2 + 0.55); for (var i = 0; i < 6; i++) { var g3 = K.box(0.04, 0.32, 0.03); g3.rotateZ(i % 2 ? 0.4 : -0.4); g3.translate((i % 2 ? 0.06 : -0.06), 0.55 + i * 0.4, 0.075); g3.applyMatrix4(sw); c.add(g3, { p: [0, -0.05, 0.12] }, GL); } } },
        handL: { f: function (b) { stone(b, 0.4, 0.3, 0.45, [0, -0.1, 0.08], S); } },
        thigh: { f: function (b, s) { stone(b, 0.58, 0.9, 0.6, [0, -0.42, 0]); }, g: function (c) { cracks(c, 2, 0.3, 0.5, 0.31, -0.7); } },
        shin: { f: function (b, s) { stone(b, 0.52, 0.82, 0.55, [0, -0.4, 0], S2); stone(b, 0.62, 0.22, 0.85, [0, -0.78, 0.12]); b.add(K.tube([[0.1 * s, -0.1, -0.25], [0.18 * s, -0.5, -0.3], [0.1 * s, -0.86, -0.32]], 0.04, 8, 5), null, RT); } }
      },
      extra: function (R2) { R2.tick = function (dt, st, p) { var ph2 = st.phase2 ? 1 : 0; R2.root.traverse(function (m) { if (m.userData && m.userData.glow) m.material.color.setScalar(1 + ph2 * 0.6 + Math.sin(R2.t * (ph2 ? 9 : 2.2)) * 0.15); }); }; } }); }

  /* — the Salt Demon: a tall figure of white salt crystal with a burning sun-ring at its back, two curved crystal blades, a torn cloak — */
  function saltDemon() { init(); var SA = 0xeef3f6, SB = 0xcfdde6, CL = 0xc4501c, CD = 0x7a2c14, HG = 0xffb63a, EY = 0xff7a1a;
    function cr(b, p, s, rot, col) { b.add(new THREE.OctahedronGeometry(0.5, 1), { p: p, s: s, r: rot || [0, 0, 0] }, col || SA); }
    return humanoid({ hip: 1.3, hipW: 0.2, torso: 1.1, shW: 0.52, a1: 0.66, a2: 0.6, l1: 0.66, l2: 0.66, neck: 0.16, h: 3.3, ink: 0.014, idle: { sp: 0.1, sLz: 0.45, sRz: -0.45, eL: -0.6, eR: -0.6 },
      parts: {
        waist: { f: function (b) { cr(b, [0, 0.3, 0], [0.55, 0.7, 0.42], null, SB); } },
        pelvis: { f: function (b) { cr(b, [0, 0, 0], [0.7, 0.45, 0.5], null, SB); b.add(K.surf(10, 4, function (u, v, p) { var a = (u - 0.5) * Math.PI * 1.7, rr = 0.36 + v * 0.18; p.set(Math.sin(a) * rr, -v * 1.1 + Math.sin(u * 23) * 0.04 * v, -Math.cos(a) * rr * 0.8); }, true), null, CL); } },
        torso: { f: function (b) { cr(b, [0, 0.45, 0], [0.95, 1.25, 0.6]); cr(b, [0, 0.95, 0.02], [1.15, 0.5, 0.65], null, SB); [-1, 1].forEach(function (s) { cr(b, [s * 0.5, 1.05, 0], [0.62, 0.62, 0.58], [0, 0, s * 0.5]); cr(b, [s * 0.6, 1.4, -0.05], [0.2, 0.8, 0.2], [0, 0, s * -0.45], SB); cr(b, [s * 0.75, 1.25, 0.05], [0.14, 0.55, 0.14], [0, 0, s * -0.9], SA); }); b.add(K.surf(12, 5, function (u, v, p) { var a = (u - 0.5) * Math.PI * 1.1; p.set(Math.sin(a) * (0.55 + v * 0.1), 1.15 - v * 1.95 + (v > 0.85 ? Math.abs(Math.sin(u * 31)) * 0.18 : 0), -0.3 - Math.cos(a) * 0.06 - v * 0.3 + Math.sin(u * 19 + v * 3) * 0.04 * v); }, true), null, CL); } },
        head: { f: function (b) { cr(b, [0, 0.2, 0], [0.42, 0.62, 0.42]); for (var i = 0; i < 7; i++) { var a = (i - 3) * 0.32; cr(b, [Math.sin(a) * 0.2, 0.5 + Math.cos(a) * 0.12, -0.05], [0.09, 0.42, 0.09], [0, 0, -a], SB); } }, g: function (c) { [-1, 1].forEach(function (s) { c.add(K.box(0.1, 0.035, 0.03), { p: [s * 0.08, 0.2, 0.2], r: [0, 0, s * -0.3] }, EY); }); } },
        back: { g: function (c) { c.add(new THREE.TorusGeometry(1.0, 0.045, 8, 64), { p: [0, 0.35, -0.3] }, HG); c.add(new THREE.TorusGeometry(0.82, 0.018, 6, 64), { p: [0, 0.35, -0.32] }, 0xffe6a0); for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; c.add(K.cyl(0.0, 0.05, 0.35, 4), { p: [Math.cos(a) * 1.18, 0.35 + Math.sin(a) * 1.18, -0.3], r: [0, 0, a - Math.PI / 2] }, HG); } } },
        uarm: { f: function (b, s) { cr(b, [0, -0.33, 0], [0.36, 0.78, 0.36]); } },
        farm: { f: function (b, s) { cr(b, [0, -0.3, 0], [0.32, 0.72, 0.32], null, SB); cr(b, [s * 0.12, -0.2, 0], [0.1, 0.4, 0.1], [0, 0, s * 0.6], SA); } },
        handR: { f: function (b) { b.add(K.cyl(0.04, 0.04, 0.3, 6), { p: [0, -0.06, 0.02], r: [Math.PI / 2, 0, 0] }, 0x6a5a4a); b.add(K.ext([[-0.08, 0], [0.1, 0], [0.32, 0.8], [0.18, 1.6], [0.02, 1.75], [0.06, 0.8]], 0.04), { p: [0, -0.06, 0.15], r: [Math.PI / 2, 0, 0] }, 0xdff0ff); } },
        handL: { f: function (b) { b.add(K.cyl(0.04, 0.04, 0.3, 6), { p: [0, -0.06, 0.02], r: [Math.PI / 2, 0, 0] }, 0x6a5a4a); b.add(K.ext([[-0.1, 0], [0.08, 0], [-0.06, 0.8], [-0.02, 1.75], [-0.18, 1.6], [-0.32, 0.8]], 0.04), { p: [0, -0.06, 0.15], r: [Math.PI / 2, 0, 0] }, 0xdff0ff); } },
        thigh: { f: function (b, s) { cr(b, [0, -0.32, 0], [0.4, 0.78, 0.4]); } },
        shin: { f: function (b, s) { cr(b, [0, -0.32, 0], [0.34, 0.75, 0.34], null, SB); cr(b, [0, -0.64, 0.08], [0.25, 0.14, 0.42]); } }
      },
      extra: function (R2) { R2.tick = function (dt, st) { if (R2.j.back) { R2.j.back.rotation.z += dt * (st.phase2 ? 2.4 : 0.8); var s2 = 1 + (st.phase2 ? 0.25 : 0) + Math.sin(R2.t * 3) * 0.03; R2.j.back.scale.set(s2, s2, 1); } }; } }); }

  /* — the harbour crew: men in black, and their boss who swings a ship's anchor on a chain — */
  function suitMan(o) { o = o || {}; init(); var SU = o.suit || 0x17181c, SH = 0xf2f0ea, SK = o.skin || 0xd9a888, HA = 0x111111, big = !!o.big;
    var R2 = humanoid({ hip: big ? 1.1 : 0.82, hipW: big ? 0.2 : 0.12, torso: big ? 0.95 : 0.66, shW: big ? 0.5 : 0.3, a1: big ? 0.52 : 0.36, a2: big ? 0.5 : 0.34, l1: big ? 0.56 : 0.42, l2: big ? 0.54 : 0.4, neck: big ? 0.06 : 0.04, neckY: big ? 0.78 : 0.54, shY: big ? 0.62 : 0.44, h: big ? 2.55 : 1.8, ink: big ? 0.012 : 0.008, idle: { sp: 0.04, sLz: 0.18, sRz: -0.18, eL: -0.2, eR: -0.2 },
      parts: {
        pelvis: { f: function (b) { b.add(K.rbox(big ? 0.66 : 0.4, big ? 0.42 : 0.3, big ? 0.46 : 0.28, 0.08, 2), { p: [0, big ? 0.06 : 0.04, 0] }, SU); } },
        torso: { f: function (b) { var w = big ? 0.95 : 0.55, d = big ? 0.6 : 0.34, h = big ? 1.05 : 0.72; b.add(K.rbox(w, h, d, 0.14, 3), { p: [0, h * 0.26, 0] }, SU); b.add(K.box(w * 0.18, h * 0.55, 0.02), { p: [0, h * 0.5, d / 2 + 0.005] }, big ? 0x4a1a1e : SH); if (!big) b.add(K.box(0.035, h * 0.45, 0.012), { p: [0, h * 0.5, d / 2 + 0.016] }, 0x111111); [-1, 1].forEach(function (s) { b.add(K.box(w * 0.2, h * 0.5, 0.02), { p: [s * w * 0.17, h * 0.5, d / 2 + 0.01], r: [0, 0, s * 0.3] }, SU); }); b.add(K.cyl(w * 0.16, w * 0.2, 0.12, 12), { p: [0, h * 0.76 + 0.04, 0] }, SK); if (big) { b.add(K.rbox(1.05, 1.05, 0.66, 0.16, 3), { p: [0, 0.28, -0.02] }, 0x1c1c22); [-1, 1].forEach(function (s) { b.add(K.box(0.2, 0.62, 0.03), { p: [s * 0.2, 0.58, 0.34], r: [0, 0, s * 0.25] }, 0x111114); }); } } },
        head: { f: function (b) { var r = big ? 0.3 : 0.19; b.add(K.sph(r, 16, 12), { p: [0, r * 0.9, 0], s: [0.92, 1.05, 1] }, SK); b.add(K.sph(r * 1.0, 16, 10), { p: [0, r * 1.32, -r * 0.22], s: [0.98, 0.62, 0.92] }, HA); b.add(K.sph(r * 0.9, 12, 8), { p: [0, r * 0.95, -r * 0.42], s: [1.0, 0.8, 0.6] }, HA); b.add(K.rbox(r * 1.5, r * 0.28, 0.04, 0.02, 2), { p: [0, r * 1.0, r * 0.92] }, 0x0c0c0e); if (big) { b.add(K.box(r * 0.08, r * 0.6, 0.02), { p: [-r * 0.4, r * 0.62, r * 0.97], r: [0, 0, 0.5] }, 0xb0705a); b.add(K.sph(r * 0.5, 10, 8), { p: [0, r * 0.32, r * 0.62], s: [1.05, 0.42, 0.5] }, 0x3a2e28); } } },
        uarm: { f: function (b) { b.add(K.cyl(big ? 0.13 : 0.075, big ? 0.11 : 0.065, big ? 0.55 : 0.38, 10), { p: [0, big ? -0.26 : -0.18, 0] }, SU); } },
        farm: { f: function (b) { b.add(K.cyl(big ? 0.11 : 0.065, big ? 0.1 : 0.055, big ? 0.52 : 0.35, 10), { p: [0, big ? -0.25 : -0.17, 0] }, SU); b.add(K.sph(big ? 0.1 : 0.055, 8, 6), { p: [0, big ? -0.52 : -0.36, 0] }, SK); } },
        handR: big ? { f: function (b) { /* the anchor on its chain */ for (var i = 0; i < 7; i++) b.add(new THREE.TorusGeometry(0.07, 0.022, 6, 12), { p: [0, -0.1 - i * 0.12, 0.05 + i * 0.03], r: [0, i % 2 ? Math.PI / 2 : 0, 0] }, 0x55585e); var y0 = -1.0; b.add(K.cyl(0.06, 0.06, 1.0, 8), { p: [0, y0 - 0.5, 0.25] }, 0x3a3d42); b.add(K.box(0.6, 0.08, 0.08), { p: [0, y0 - 0.15, 0.25] }, 0x3a3d42); b.add(new THREE.TorusGeometry(0.42, 0.07, 8, 24, Math.PI), { p: [0, y0 - 0.95, 0.25], r: [0, 0, Math.PI] }, 0x5a4030); [-1, 1].forEach(function (s) { b.add(K.cyl(0.0, 0.12, 0.3, 4), { p: [s * 0.42, y0 - 0.85, 0.25], r: [0, 0, s * 0.6] }, 0x5a4030); }); } } : { f: function (b) { b.add(K.cyl(0.025, 0.025, 0.7, 6), { p: [0, -0.05, 0.25], r: [Math.PI / 2 - 0.3, 0, 0] }, 0x8a8d92); } },
        thigh: { f: function (b) { b.add(K.cyl(big ? 0.15 : 0.085, big ? 0.13 : 0.075, big ? 0.58 : 0.44, 10), { p: [0, big ? -0.28 : -0.21, 0] }, SU); } },
        shin: { f: function (b) { b.add(K.cyl(big ? 0.13 : 0.075, big ? 0.11 : 0.065, big ? 0.55 : 0.42, 10), { p: [0, big ? -0.27 : -0.2, 0] }, SU); b.add(K.rbox(big ? 0.22 : 0.13, 0.1, big ? 0.38 : 0.25, 0.04, 2), { p: [0, big ? -0.55 : -0.41, 0.06] }, 0x0c0c0e); } }
      } });
    if (big) { var coat = new THREE.Group(); var b = K.Batch(); b.add(K.surf(14, 4, function (u, v, p) { var a = (u - 0.5) * Math.PI * 1.75; p.set(Math.sin(a) * (0.42 + v * 0.14), -v * 0.75, -Math.cos(a) * (0.3 + v * 0.1)); }, true), null, 0x1c1c22); coat.add(LUNA.mesh(b.geometry(), TVM, { ink: 0.01 })); R2.j.hips.add(coat); coat.position.y = 0.2; R2.coat = coat; LUNA.curvedAll(coat); }
    return R2; }

  /* — the lacquered knight who runs the counterfeit works: plates of grey lacquer, a crest, a halberd with a scraper's blade; in the second phase the lacquer cracks and the tar inside burns — */
  function knight() { init(); var AR = 0x6e747b, AD = 0x4a4f56, TR = 0x8a6a3a, TA = 0x141416, FI = 0xff6a1a;
    function pl(b, w, h, d, p, col, rot) { b.add(K.rbox(w, h, d, Math.min(w, h, d) * 0.3, 3), { p: p, r: rot || [0, 0, 0] }, col || AR); }
    return humanoid({ hip: 1.45, hipW: 0.26, torso: 1.25, shW: 0.68, a1: 0.78, a2: 0.72, l1: 0.74, l2: 0.72, neck: 0.16, h: 3.9, ink: 0.016, idle: { sp: 0.1, sLz: 0.3, sRz: -0.2, sRx: -0.3, eR: -0.9 },
      parts: {
        waist: { f: function (b) { pl(b, 0.72, 0.62, 0.5, [0, 0.33, 0], 0x3e4248); } },
        pelvis: { f: function (b) { pl(b, 0.85, 0.42, 0.6, [0, 0, 0], AD); [-1, 1].forEach(function (s) { pl(b, 0.42, 0.6, 0.08, [s * 0.25, -0.32, 0.3], AR, [0.15, 0, 0]); pl(b, 0.42, 0.6, 0.08, [s * 0.25, -0.32, -0.3], AR, [-0.15, 0, 0]); }); } },
        torso: { f: function (b) { pl(b, 1.05, 0.7, 0.72, [0, 0.12, 0], AD); b.add(K.lathe([[0.001, 0.0], [0.48, 0.05], [0.58, 0.45], [0.6, 0.8], [0.4, 1.02], [0.001, 1.05]], 16), { p: [0, 0.15, 0.02], s: [1, 1, 0.72] }, AR); b.add(K.box(0.05, 0.8, 0.02), { p: [0, 0.6, 0.43] }, TR); [-1, 1].forEach(function (s) { b.add(K.lathe([[0.001, 0], [0.34, 0.02], [0.38, 0.18], [0.3, 0.32], [0.001, 0.34]], 14), { p: [s * 0.7, 1.0, 0], s: [1.15, 1, 1] }, AR); b.add(new THREE.TorusGeometry(0.33, 0.025, 6, 20), { p: [s * 0.7, 1.04, 0], r: [Math.PI / 2, 0, 0] }, TR); }); b.add(K.surf(12, 4, function (u, v, p) { var a = (u - 0.5) * Math.PI; p.set(Math.sin(a) * 0.62, 1.0 - v * 2.3, -0.4 - Math.cos(a) * 0.1 - v * 0.15 + Math.sin(u * 17) * 0.03); }, true), null, 0x3a2a2a); }, g: function (c) { for (var i = 0; i < 5; i++) c.add(K.box(0.03, 0.22, 0.02), { p: [-0.3 + i * 0.15, 0.4 + (i % 2) * 0.25, 0.44], r: [0, 0, (i % 2 ? 0.5 : -0.4)] }, FI); } },
        head: { f: function (b) { b.add(K.lathe([[0.001, -0.05], [0.24, -0.02], [0.27, 0.2], [0.24, 0.42], [0.12, 0.52], [0.001, 0.54]], 16), { p: [0, 0.05, 0] }, AR); b.add(K.box(0.36, 0.04, 0.05), { p: [0, 0.27, 0.25] }, 0x0a0a0c); for (var i = 0; i < 6; i++) b.add(K.box(0.02, 0.18, 0.02), { p: [-0.1 + i * 0.04, 0.12, 0.26] }, 0x0a0a0c); b.add(K.ext([[0, 0], [0.05, 0.0], [0.08, 0.45], [-0.25, 0.75], [-0.05, 0.35]], 0.04), { p: [0.02, 0.5, -0.05], r: [0, -Math.PI / 2, 0] }, 0x8a1a1a); }, g: function (c) { c.add(K.box(0.3, 0.02, 0.02), { p: [0, 0.27, 0.27] }, FI); } },
        uarm: { f: function (b, s) { pl(b, 0.34, 0.78, 0.36, [0, -0.36, 0]); } },
        farm: { f: function (b, s) { pl(b, 0.3, 0.72, 0.32, [0, -0.34, 0], AD); b.add(K.lathe([[0.001, 0], [0.2, 0.0], [0.22, 0.2], [0.16, 0.3], [0.001, 0.3]], 12), { p: [0, -0.75, 0], r: [Math.PI, 0, 0] }, AR); } },
        handR: { f: function (b) { /* the halberd: a long haft, a wide scraper blade, a spike, a back hook */ b.add(K.cyl(0.05, 0.05, 4.2, 8), { p: [0, -0.1, 0.0], r: [Math.PI / 2, 0, 0] }, 0x3a2a1e); b.add(K.ext([[-0.05, 0], [0.75, 0.05], [0.8, 0.72], [-0.05, 0.62]], 0.05), { p: [0, -0.1, 1.55], r: [Math.PI / 2, 0, Math.PI / 2] }, 0xb8bcc2); b.add(K.cyl(0.0, 0.08, 0.7, 6), { p: [0, -0.1, 2.45], r: [Math.PI / 2, 0, 0] }, 0xb8bcc2); b.add(K.ext([[0, 0], [0.35, 0.1], [0.4, 0.18], [0, 0.1]], 0.04), { p: [0, -0.1, 1.7], r: [Math.PI / 2, 0, -Math.PI / 2] }, 0x8a8e94); for (var i = 0; i < 3; i++) b.add(K.cyl(0.07, 0.07, 0.05, 8), { p: [0, -0.1, -1.2 + i * 0.1], r: [Math.PI / 2, 0, 0] }, TR); }, g: function (c) { c.add(K.box(0.02, 0.6, 0.02), { p: [-0.3, -0.1, 1.85], r: [Math.PI / 2, 0, 0.2] }, FI); } },
        handL: { f: function (b) { pl(b, 0.22, 0.26, 0.26, [0, -0.08, 0.04], AD); } },
        thigh: { f: function (b, s) { pl(b, 0.4, 0.75, 0.42, [0, -0.36, 0]); } },
        shin: { f: function (b, s) { pl(b, 0.36, 0.72, 0.4, [0, -0.34, 0], AD); b.add(K.lathe([[0.001, 0], [0.18, 0.0], [0.21, 0.12], [0.001, 0.14]], 12), { p: [0, -0.02, 0.18] }, AR); pl(b, 0.36, 0.18, 0.6, [0, -0.7, 0.1], AR); } }
      },
      extra: function (R2) { R2.tick = function (dt, st) { var on = st.phase2 ? 1 : 0.25; R2.root.traverse(function (m) { if (m.userData && m.userData.glow) m.material.color.setRGB(on * (1.2 + Math.sin(R2.t * 11) * 0.3), on * 0.45, on * 0.12); }); }; } }); }

  /* — the Leak Dragon of the deep lake: dark teal scales split by glowing water-veins, horns of old bone, torn membrane wings — */
  function dragon() { init(); var SC = 0x1f4b54, SD = 0x16363d, BE = 0x7fb0a4, HO = 0xddd3bb, GW = 0x72f0ff, WM = 0x2b5d66;
    return beast({ bodyY: 1.5, len: 2.8, neckN: 4, neckL: 0.42, neckY: 0.4, tailN: 7, tailL: 0.55, legX: 0.6, legH: 1.55, legYb: -0.1, wingL: 3.0, bodyR: 0.55, h: 3.6, neckArch: [-0.55, -0.15, 0.25, 0.35], headTilt: 0.4, tailArch: 0.08,
      parts: {
        body: { f: function (b) { b.add(K.sph(1, 20, 14), { s: [0.95, 0.85, 1.65] }, SC); b.add(K.sph(1, 16, 12), { p: [0, 0.15, 1.0], s: [0.85, 0.8, 0.8] }, SC); b.add(K.sph(1, 16, 10), { p: [0, -0.28, 0.1], s: [0.68, 0.48, 1.35] }, BE); for (var i = 0; i < 9; i++) b.add(K.cyl(0.0, 0.12, 0.42, 4), { p: [0, 0.7, 1.2 - i * 0.3], r: [-0.35, 0, 0] }, HO); }, g: function (c) { for (var i = 0; i < 6; i++) c.add(K.box(0.04, 0.03, 0.9), { p: [(i % 2 ? 0.55 : -0.55), 0.15 - (i % 3) * 0.12, 0.6 - i * 0.28], r: [0, (i % 2 ? 0.3 : -0.3), 0] }, GW); } },
        neck: { f: function (b, i) { var r = 0.55 - i * 0.05; b.add(K.sph(r, 12, 10), { p: [0, 0, 0.18], s: [1, 1, 1.3] }, SC); b.add(K.cyl(0.0, 0.09, 0.3, 4), { p: [0, r * 0.95, 0.1], r: [-0.4, 0, 0] }, HO); } },
        head: { f: function (b) { b.add(K.rbox(0.8, 0.58, 1.15, 0.2, 3), { p: [0, 0.05, 0.35] }, SC); b.add(K.rbox(0.58, 0.28, 0.7, 0.1, 2), { p: [0, 0.02, 1.0] }, SD); b.add(K.box(0.7, 0.08, 0.5), { p: [0, 0.32, 0.25] }, SD); [-1, 1].forEach(function (s) { b.add(K.tube([[s * 0.2, 0.2, 0.05], [s * 0.38, 0.45, -0.3], [s * 0.4, 0.55, -0.75], [s * 0.3, 0.45, -1.0]], 0.07, 10, 6), null, HO); b.add(K.cyl(0.0, 0.05, 0.25, 4), { p: [s * 0.24, -0.05, 0.75], r: [0.3, 0, s * -0.4] }, HO); }); }, g: function (c) { [-1, 1].forEach(function (s) { c.add(K.sph(0.07, 8, 6), { p: [s * 0.24, 0.16, 0.6], s: [1, 0.5, 0.6] }, GW); }); } },
        jaw: { f: function (b) { b.add(K.rbox(0.42, 0.14, 0.85, 0.06, 2), { p: [0, -0.02, 0.45] }, SD); for (var i = 0; i < 5; i++) [-1, 1].forEach(function (s) { b.add(K.cyl(0.0, 0.025, 0.1, 4), { p: [s * 0.16, 0.08, 0.2 + i * 0.14] }, 0xf6f0e0); }); }, g: function (c) { c.add(K.box(0.3, 0.02, 0.6), { p: [0, 0.06, 0.5] }, 0x2aa8c8); } },
        tail: { f: function (b, i) { var r = 0.5 - i * 0.06; b.add(K.sph(Math.max(0.08, r), 10, 8), { p: [0, 0, -0.26], s: [1, 0.9, 1.6] }, SC); if (i % 2 === 0) b.add(K.cyl(0.0, 0.07, 0.25, 4), { p: [0, r * 0.9, -0.2], r: [0.4, 0, 0] }, HO); if (i === 6) b.add(K.ext([[-0.35, 0], [0, -0.5], [0.35, 0], [0, 0.15]], 0.04), { p: [0, 0, -0.45], r: [Math.PI / 2, 0, 0] }, HO); }, g: function (c, i) { if (i < 5) c.add(K.box(0.03, 0.03, 0.4), { p: [0.18, 0.05, -0.2] }, GW); } },
        leg: { f: function (b, f, s, k) { if (!k) { b.add(K.sph(0.5, 12, 10), { p: [0, -0.3, 0], s: [0.85, 1.25, 1.0] }, SC); } else { b.add(K.cyl(0.26, 0.2, 0.85, 10), { p: [0, -0.4, 0] }, SD); b.add(K.sph(0.24, 10, 8), { p: [0, -0.82, 0.08], s: [1.1, 0.5, 1.4] }, SD); for (var i = 0; i < 3; i++) b.add(K.cyl(0.0, 0.05, 0.22, 4), { p: [(i - 1) * 0.1, -0.85, 0.18], r: [1.3, 0, 0] }, HO); } } },
        wing: { f: function (b, s, k) { if (!k) { b.add(K.cyl(0.06, 0.08, 1.5, 6), { p: [s * 0.75, 0, 0], r: [0, 0, Math.PI / 2] }, SD); b.add(K.surf(8, 4, function (u, v, p) { p.set(s * u * 1.5, -v * 0.55 * (1 - u * 0.4), -v * (1.0 - u * 0.3)); }, true), null, WM); } else { b.add(K.cyl(0.04, 0.06, 1.6, 6), { p: [s * 0.8, 0.1, -0.2], r: [0, 0.3 * s, Math.PI / 2] }, SD); b.add(K.surf(10, 4, function (u, v, p) { p.set(s * u * 1.7, 0.1 - v * 0.6 * (1 - u * 0.5), -v * (1.15 - u * 0.6) - u * 0.4 + (v > 0.9 ? Math.sin(u * 30) * 0.08 : 0)); }, true), null, WM); for (var i = 0; i < 3; i++) b.add(K.cyl(0.015, 0.03, 1.2, 5), { p: [s * (0.5 + i * 0.45), -0.1, -0.6 - i * 0.1], r: [0.9 - i * 0.15, 0, 0] }, SD); } } }
      } }); }

  /* — the Railbreaker: an iron beast assembled from rail stock, its head a turret with one red eye, pistons for knees, a tail of chained bogies — */
  function railBeast() { init(); var GM = 0x3d444b, GD = 0x2a2f34, YE = 0xe6b42a, RS = 0x7a4a2a, SL = 0xb8bec4, RE = 0xff2a2a;
    return beast({ bodyY: 1.8, len: 3.6, neckN: 3, neckL: 0.55, neckY: 0.5, tailN: 6, tailL: 0.6, legX: 0.95, legH: 1.8, legYb: -0.2, h: 4.4, neckArch: [-0.5, 0.1, 0.3], headTilt: 0.25,
      parts: {
        body: { f: function (b) { b.add(K.rbox(1.9, 1.3, 3.8, 0.25, 3), { p: [0, 0.1, 0] }, GM); b.add(K.rbox(2.05, 0.3, 3.9, 0.08, 2), { p: [0, -0.45, 0] }, GD); for (var i = 0; i < 6; i++) { b.add(K.box(2.08, 0.12, 0.14), { p: [0, 0.2, -1.5 + i * 0.6] }, i % 2 ? YE : 0x1a1a1a); } [-1, 1].forEach(function (s) { for (var i = 0; i < 3; i++) b.add(K.cyl(0.14, 0.18, 0.9, 10), { p: [s * 0.55, 1.05, -0.9 - i * 0.45] }, GD); b.add(K.box(0.1, 0.9, 3.4), { p: [s * 1.02, 0.0, 0] }, SL); }); b.add(K.rbox(1.2, 0.5, 1.2, 0.1, 2), { p: [0, 0.95, 0.8] }, GD); }, g: function (c) { [-1, 1].forEach(function (s) { for (var i = 0; i < 3; i++) c.add(K.cyl(0.1, 0.1, 0.02, 10), { p: [s * 0.55, 1.51, -0.9 - i * 0.45] }, 0xff7a2a); }); } },
        neck: { f: function (b, i) { b.add(K.rbox(0.8 - i * 0.1, 0.7 - i * 0.08, 0.6, 0.1, 2), { p: [0, 0, 0.25] }, i % 2 ? GD : GM); b.add(K.cyl(0.08, 0.08, 0.7, 8), { p: [0.3, 0.2, 0.25], r: [Math.PI / 2, 0, 0] }, SL); } },
        head: { f: function (b) { b.add(K.rbox(1.1, 0.75, 1.3, 0.18, 3), { p: [0, 0.1, 0.4] }, GM); b.add(K.box(1.15, 0.12, 1.32), { p: [0, 0.32, 0.4] }, YE); b.add(K.cyl(0.12, 0.12, 0.9, 10), { p: [-0.35, 0.55, 0.6], r: [Math.PI / 2, 0, 0] }, GD); b.add(K.cyl(0.12, 0.12, 0.9, 10), { p: [0.35, 0.55, 0.6], r: [Math.PI / 2, 0, 0] }, GD); b.add(K.cyl(0.28, 0.32, 0.12, 20), { p: [0, 0.12, 1.06], r: [Math.PI / 2, 0, 0] }, GD); }, g: function (c) { c.add(K.sph(0.2, 16, 12), { p: [0, 0.12, 1.1], s: [1, 1, 0.4] }, RE); } },
        jaw: { f: function (b) { b.add(K.rbox(0.9, 0.22, 0.9, 0.06, 2), { p: [0, -0.1, 0.45] }, GD); for (var i = 0; i < 4; i++) b.add(K.box(0.12, 0.12, 0.08), { p: [-0.3 + i * 0.2, 0.04, 0.88] }, SL); } },
        tail: { f: function (b, i) { b.add(K.rbox(0.7 - i * 0.06, 0.45, 0.5, 0.08, 2), { p: [0, 0, -0.28] }, i % 2 ? GD : GM); [-1, 1].forEach(function (s) { b.add(K.cyl(0.12, 0.12, 0.08, 12), { p: [s * (0.36 - i * 0.03), -0.18, -0.28], r: [0, 0, Math.PI / 2] }, SL); }); if (i === 5) b.add(K.cyl(0.0, 0.28, 0.6, 6), { p: [0, 0, -0.75], r: [-Math.PI / 2, 0, 0] }, RS); } },
        leg: { f: function (b, f, s, k) { if (!k) { b.add(K.rbox(0.55, 1.0, 0.65, 0.1, 2), { p: [0, -0.45, 0] }, GM); b.add(K.cyl(0.07, 0.07, 1.0, 8), { p: [s * 0.32, -0.5, 0.2] }, SL); } else { b.add(K.rbox(0.45, 0.95, 0.5, 0.08, 2), { p: [0, -0.45, 0] }, GD); b.add(K.rbox(0.7, 0.2, 0.95, 0.06, 2), { p: [0, -0.92, 0.12] }, GM); b.add(K.box(0.72, 0.06, 0.2), { p: [0, -0.8, 0.5] }, YE); } } }
      } }); }

  var BUILD = { colossus: colossus, salt: saltDemon, gang: function () { return suitMan({}); }, barle: function () { return suitMan({ big: true }); }, knight: knight, dragon: dragon, rail: railBeast };
  return { build: function (k, o) { return BUILD[k](o); }, humanoid: humanoid, beast: beast, suitMan: suitMan };
})();


