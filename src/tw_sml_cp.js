/* ===== [tw_sml_cp.js] ===== */
/* ===== SMLCP — the two on the red stools under Xiangshan's arch (v58) =====
   Two original characters drawn in the island's own manner (three soft tones, a thin ink line, a rim light, faces painted on canvases),
   on an evening a little before one of them says it.
   She: long soft waves of chestnut hair with see-through bangs, a white bow and a small gold star clip; a black knit dress with a round
   cream collar and a wine ribbon at the neck and the waist; a camel wool coat whose sleeves cover half her hands; cream frilled socks and
   dark Mary Janes, toes turned in; her feet swing.
   He: fluffy dark-brown hair with one stubborn curl on top; a black turtleneck under an olive field jacket, black trousers, white sneakers.
   Every sixteen seconds he steals a look, she catches it, both turn away blushing; his hand creeps along the stool until a little finger
   touches hers, and she leans her head toward him. When the fireworks rise they look up.
   Units: the level's (1.2 m); the stool's seat 0.45 m. Facing +z (the lake). */
var SMLCP = (function () {
  var V3 = THREE.Vector3, PI = Math.PI;
  function Q() { return LUNA.quality ? LUNA.quality() : 2; }
  function sg(n, mn) { var k = [0.6, 0.8, 1, 1.35][Q()] || 1; return Math.max(mn || 6, Math.round(n * k)); }
  function sm(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function mix(a, b, k) { return a + (b - a) * k; }
  function hx(c) { return '#' + ('000000' + c.toString(16)).slice(-6); }
  function M4(p, r, s) { return LUNA.M4(p, r, s); }
  /* a limb's segment: a soft capsule along −y from its joint, radius r0 at the top to r1 at the end */
  function capsule(L, r0, r1, bul) { var m = (r0 + r1) / 2 * (1 + (bul || 0)); return LUNA.lathe(LUNA.smoothProfile([[0.001, r0 * 0.8], [r0 * 0.78, r0 * 0.5], [r0, 0], [m, -L * 0.5], [r1, -L], [r1 * 0.78, -L - r1 * 0.5], [0.001, -L - r1 * 0.8]], 12), sg(14, 8)); }
  /* a surface given by a function of (u, v) */
  function sheet(nu, nv, fn) { var pos = [], uv = [], idx = [], i, j, p = new V3(); for (j = 0; j <= nv; j++) for (i = 0; i <= nu; i++) { fn(i / nu, j / nv, p); pos.push(p.x, p.y, p.z); uv.push(i / nu, 1 - j / nv); }
    for (j = 0; j < nv; j++) for (i = 0; i < nu; i++) { var a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
  function paint(g, fn) { var p = g.attributes.position, uv = g.attributes.uv, c = new THREE.Color(), col = new Float32Array(p.count * 3); for (var i = 0; i < p.count; i++) { fn(uv.getX(i), 1 - uv.getY(i), c); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; }
  /* a point on the head's surface: azimuth th (0 the face, + towards the head's left), height y, lifted off it */
  function onS(R, th, y, lift) { var yy = y / (R * 1.04), rr = Math.sqrt(Math.max(0.03, 1 - yy * yy)), r1 = R * 1.05 + (lift || 0); return new V3(Math.sin(th) * rr * r1, y, Math.cos(th) * rr * r1); }
  /* a lock of hair: a flat tapering ribbon along a curve, lying on the surface round the centre C, pointed at its tip */
  function lock(pts, w, th, o) { o = o || {}; var cv = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), C = o.c || new V3(0, 0, 0), tp = o.tip == null ? 1 : o.tip, uy = o.uy == null ? 0.35 : o.uy, U0 = new V3();
    return LUNA.taper(cv, o.seg || sg(16, 7), o.rad || 6, function (t) { var root = t < 0.12 ? 0.7 + t / 0.12 * 0.3 : 1; return th * root * Math.pow(Math.max(0, 1 - t), 0.55 * tp) + 0.0004; },
      { flat: w / th, up: function (t, P) { U0.subVectors(P, C); U0.y *= uy; if (U0.lengthSq() < 1e-8) U0.set(0, 0, 1); return U0.normalize(); } }); }
  function starShape(r0, r1) { var s = new THREE.Shape(); for (var i = 0; i < 10; i++) { var a = PI / 2 + i * PI / 5, r = i % 2 ? r1 : r0; if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return s; }
  /* the cheeks' blush, painted to the face's own frame (x −0.12…0.12, y −0.16…0.08 of the head), shown over the face and faded in and out */
  function blushTex(o) { var N = 512, S = N / 0.24; return LUNA.ctex(N, N, function (g) { function X(x) { return (x + 0.12) * S; } function Y(y) { return (0.08 - y) * S; }
    [-1, 1].forEach(function (sd) { var bx = X(sd * (o.eyeX + 0.009)), by = Y(o.eyeY - 0.037), r = 0.019 * S; g.save(); g.translate(bx, by); g.scale(1.55, 0.66); var gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, 'rgba(255,86,108,0.9)'); gr.addColorStop(0.55, 'rgba(255,104,124,0.5)'); gr.addColorStop(1, 'rgba(255,120,135,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, PI * 2); g.fill(); g.restore();
      g.strokeStyle = 'rgba(222,66,88,0.9)'; g.lineCap = 'round'; g.lineWidth = 0.0011 * S; for (var q = -1; q <= 1; q++) { g.beginPath(); g.moveTo(bx + (q * 0.0056 - 0.0022) * S, by + 0.0034 * S); g.lineTo(bx + (q * 0.0056 + 0.0018) * S, by - 0.0034 * S); g.stroke(); } }); }); }
  /* the crown of the hair: the base colour, strands, and the ring of light the drawings give glossy hair */
  function hairTex(base, hi, lo) { return LUNA.ctex(256, 256, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, hx(lo)); gr.addColorStop(0.3, hx(base)); gr.addColorStop(1, hx(base)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = hx(hi); g.globalAlpha = 0.85; g.beginPath(); g.moveTo(0, h * 0.5); for (var i = 0; i <= 32; i++) { var x = i / 32 * w; g.lineTo(x, h * (0.47 + (i % 2 ? 0.0 : 0.035) + 0.01 * Math.sin(i * 1.7))); } for (i = 32; i >= 0; i--) { var x2 = i / 32 * w; g.lineTo(x2, h * (0.6 + (i % 2 ? 0.07 : 0.0) + 0.012 * Math.sin(i * 2.3))); } g.closePath(); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(0,0,0,0.14)'; g.lineWidth = 1.2; for (i = 0; i < 70; i++) { var sx = (i * 37 % 256) / 256 * w; g.beginPath(); g.moveTo(sx, h * 0.05); g.quadraticCurveTo(sx + 4, h * 0.5, sx - 2, h); g.stroke(); } }); }

  var _x = new V3(), _yv = new V3(), _z = new V3(), _m = new THREE.Matrix4(), _d = new V3(), _p = new V3(), _dn = new V3(0, -1, 0);
  function aim(o, a, b) { o.position.copy(a); _d.subVectors(b, a).normalize(); o.quaternion.setFromUnitVectors(_dn, _d); }
  function frame(o, pos, ydir, zh) { _yv.copy(ydir).normalize(); _x.crossVectors(_yv, zh).normalize(); _z.crossVectors(_x, _yv).normalize(); _m.makeBasis(_x, _yv, _z); o.quaternion.setFromRotationMatrix(_m); o.position.copy(pos); }
  /* two bones by IK: the joint A, the target T, the bend towards the pole */
  function limb(par, L1, L2, g1, g2, m1, m2, ink) { var s1 = LUNA.mesh(g1, m1, { ink: ink || 0.0035 }), s2 = LUNA.mesh(g2, m2, { ink: ink || 0.0035 }); par.add(s1); par.add(s2); return { s1: s1, s2: s2, L1: L1, L2: L2, A: new V3(), E: new V3(), T: new V3() }; }
  function solve(Lm, A, T, pole) { var L1 = Lm.L1, L2 = Lm.L2, dv = new V3().subVectors(T, A), d0 = dv.length() || 1e-6, d = Math.min(L1 + L2 - 1e-4, Math.max(Math.abs(L1 - L2) + 1e-4, d0)); dv.multiplyScalar(1 / d0);
    var a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a)); _p.copy(pole).addScaledVector(dv, -pole.dot(dv)); if (_p.lengthSq() < 1e-8) _p.set(0, 0, 1); _p.normalize();
    Lm.A.copy(A); Lm.E.copy(A).addScaledVector(dv, a).addScaledVector(_p, h); Lm.T.copy(A).addScaledVector(dv, d); aim(Lm.s1, Lm.A, Lm.E); aim(Lm.s2, Lm.E, Lm.T); }

  /* ---------- the face, its expressions and the blush ---------- */
  function face(head, skull, key, fo) { var fm = LUNA.faceMat(LUNA.faceTex('open', key, fo)), f = new THREE.Mesh(LUNA.faceDecal(skull), fm); f.renderOrder = 2; head.add(f);
    var bm = LUNA.faceMat(blushTex(fo)); bm.polygonOffsetFactor = bm.polygonOffsetUnits = -6; bm.opacity = 0; bm.alphaTest = 0.02; var b = new THREE.Mesh(f.geometry, bm); b.renderOrder = 3; head.add(b);
    return { key: key, fo: fo, mat: fm, bm: bm, kind: 'open', set: function (k) { if (this.kind === k) return; this.kind = k; var t = LUNA.faceTex(k, key, fo); fm.map = t; fm.emissiveMap = t; } }; }
  function hand(par, mat, side) { var g = new THREE.Group(); par.add(g); var pa = LUNA.mesh(LUNA.blob(0.024, 0.031, 0.0145, 14), mat, { ink: 0.003 }); pa.position.y = -0.026; g.add(pa); var th = LUNA.mesh(LUNA.blob(0.0085, 0.016, 0.0085, 10), mat, { ink: 0.0025 }); th.position.set(0.019 * side, -0.016, -0.004); th.rotation.z = 0.5 * side; g.add(th); return g; }

  /* ================= she ================= */
  function girl(H) {
    var C = { skin: 0xf9d9c6, dress: 0x1b1b20, dressDk: 0x111114, lace: 0x2c2a2e, collar: 0xf4efe6, rose: 0x7a2a36, card: 0xb08a5a, hair: 0x4b2a1f, hairHi: 0x93613f, hairLo: 0x2c170f, sock: 0xfbf8f2, shoe: 0x4a2e24, clip: 0xf2c55c }; /* (v60) black knit dress, a camel wool coat */
    var M = { skin: LUNA.toon(C.skin, { rim: 0.2 }), vc: LUNA.toon(0xffffff, { vc: true, rim: 0.2 }), vc2: LUNA.toon(0xffffff, { vc: true, rim: 0.2, side: THREE.DoubleSide }), card: LUNA.toon(C.card, { rim: 0.22, side: THREE.DoubleSide }), hair: LUNA.toon(0xffffff, { vc: true, rim: 0.3 }), hairD: LUNA.toon(C.hair, { rim: 0.3, side: THREE.DoubleSide }), shoe: LUNA.toon(C.shoe, { rim: 0.35 }), sock: LUNA.toon(C.sock, { rim: 0.2 }) };
    M.cap = LUNA.toon(0xffffff, { rim: 0.3, map: hairTex(C.hair, C.hairHi, C.hairLo) });
    var root = new THREE.Group(), WY = H + 0.115, R = 0.112, HC = 0.372;
    /* the torso from the waist: the bodice, the collar, the ribbons, the neck; the cardigan open in front */
    var torso = new THREE.Group(); torso.position.y = WY; root.add(torso); var TP = [];
    var bod = LUNA.lathe(LUNA.smoothProfile([[0.001, -0.02], [0.068, -0.02], [0.064, 0.04], [0.073, 0.105], [0.079, 0.145], [0.072, 0.185], [0.083, 0.215], [0.058, 0.243], [0.026, 0.254], [0.001, 0.257]], 20), sg(28, 14)); bod.scale(1, 1, 0.74); TP.push([bod, null, C.dress]);
    TP.push([new THREE.TorusGeometry(0.074, 0.0075, 6, sg(28, 14)), M4([0, 0.004, 0], [PI / 2, 0, 0], [1.1, 0.78, 1]), C.rose]);
    [-1, 1].forEach(function (sd) { var cg = new THREE.CylinderGeometry(0.034, 0.034, 0.004, 16, 1, false, sd < 0 ? 0 : PI, PI); TP.push([cg, M4([sd * 0.006, 0.232, 0.03], [-1.05, 0, sd * 0.12]), C.collar]); });
    [-1, 1].forEach(function (sd) { TP.push([LUNA.blob(0.016, 0.01, 0.006, 10), M4([sd * 0.015, 0.226, 0.054], [-0.3, 0, sd * -0.35]), C.rose]); TP.push([LUNA.taper(new THREE.CatmullRomCurve3([new V3(sd * 0.003, 0.222, 0.055), new V3(sd * 0.01, 0.2, 0.058), new V3(sd * 0.014, 0.18, 0.056)]), 6, 4, function (t) { return 0.0035 * (1 - t * 0.5); }, { flat: 2.2 }), null, C.rose]); });
    TP.push([LUNA.blob(0.007, 0.007, 0.006, 8), M4([0, 0.225, 0.057]), C.rose]);
    [-1, 1].forEach(function (sd) { TP.push([new THREE.TorusGeometry(0.018, 0.006, 6, 14), M4([sd * 0.021, 0.01, -0.062], [0.1, 0, sd * 0.38], [1.15, 0.62, 0.45]), C.rose]); TP.push([LUNA.taper(new THREE.CatmullRomCurve3([new V3(sd * 0.004, 0.004, -0.064), new V3(sd * 0.014, -0.04, -0.075), new V3(sd * 0.02, -0.085, -0.082)]), 8, 4, function (t) { return 0.0042 * (1 - t * 0.3); }, { flat: 2.4 }), null, C.rose]); }); TP.push([LUNA.blob(0.009, 0.009, 0.006, 8), M4([0, 0.008, -0.066]), C.rose]);
    TP.push([capsule(0.06, 0.022, 0.024), M4([0, 0.3, -0.004]), C.skin]);
    torso.add(LUNA.mesh(LUNA.merge(TP), M.vc, { ink: 0.0035 }));
    var cd = LUNA.lathe(LUNA.smoothProfile([[0.08, -0.03], [0.075, 0.04], [0.083, 0.105], [0.088, 0.145], [0.08, 0.185], [0.092, 0.215], [0.064, 0.24], [0.04, 0.25]], 16), sg(28, 14), { start: 0.46, len: PI * 2 - 0.92 }); cd.scale(1, 1, 0.76); torso.add(LUNA.mesh(cd, M.card, { ink: 0.003 }));
    /* the skirt: a standing flared skirt bent onto her lap the way she sits — the front along the thighs and over the knees, the sides between,
       the back on the seat and over the stool's edge; soft pleats, a lace hem */
    var SK = { rw: 0.072, rh: 0.205, Ls: 0.4, hipD: 0.07, seatD: 0.112, knee: 0.255, zf: 0.62, hx: 1.1 };
    var skg = sheet(sg(60, 30), sg(26, 12), function (u, v, p) { var a = u * PI * 2, d = v * SK.Ls, r = SK.rw + (SK.rh - SK.rw) * Math.pow(v, 0.8), pl = 1 + 0.05 * Math.sin(a * 16) * Math.min(1, v * 2.2), x = Math.sin(a) * r * SK.hx * pl, zo = Math.cos(a) * r * pl * mix(0.74, 1, sm(0, 0.35, v)), f = sm(-0.3, 0.7, Math.cos(a)), y, z;
      if (d <= SK.hipD) { y = -d; z = zo; } else { var s = d - SK.hipD, th = PI / 2 * f, th2 = th * 0.94, s1 = Math.min(s, SK.knee), s2 = Math.max(0, s - SK.knee), zf = mix(1, SK.zf, f), na = th - th2 * sm(SK.knee - 0.05, SK.knee + 0.05, s), t2 = th - th2;
        y = -SK.hipD - Math.cos(th) * s1 - Math.cos(t2) * s2 + Math.sin(na) * zo * zf; z = Math.sin(th) * s1 + Math.sin(t2) * s2 + Math.cos(na) * zo * zf; }
      if (y < -SK.seatD + 0.012 && f < 0.98) { var ex = Math.max(0, -SK.seatD - y), k = 1 + Math.min(ex, 0.08) * 1.6 * (1 - f); y = Math.min(y, -SK.seatD - ex * mix(0.72, 1, f)); x *= k; z *= k; var rr = Math.hypot(x, z), rm = mix(0.17, 0.11, f); if (rr < rm) { var kk = rm / Math.max(0.03, rr); x *= kk; z *= kk; } }
      p.set(x, y, z); });
    var cL = new THREE.Color(C.lace), cD = new THREE.Color(C.dress), cK = new THREE.Color(C.dressDk); paint(skg, function (u, v, c) { if (v > 0.93) c.copy(cL); else c.copy(cD).lerp(cK, 0.25 + 0.25 * Math.sin(u * PI * 32)); });
    var skirt = LUNA.mesh(skg, M.vc2, { ink: 0.003 }); skirt.position.y = WY; root.add(skirt);
    /* the head: the face, the crown of the hair with its ring of light, the see-through bangs, the locks that frame the face, the bow, the star */
    var neck = new THREE.Group(); neck.position.y = HC; torso.add(neck); var head = new THREE.Group(); head.rotation.order = 'YXZ'; neck.add(head);
    var skull = LUNA.animeSkull(R, sg(52, 28), sg(40, 20)); head.add(LUNA.mesh(skull, M.skin, { ink: 0.004 }));
    var fo = { eyeX: 0.0442, eyeY: -0.027, ew: 0.0288, eh: 0.0352, lashW: 0.0052, iris: ['#24100c', '#5c2a1c', '#b0603e', '#f6c08e'], lash: '#2a140e', brow: '#7a4630', fn: Q() >= 2 ? 1024 : 512 }, F = face(head, skull, 'cpG', fo);
    var cap = new THREE.SphereGeometry(1, sg(40, 20), sg(20, 10), 0, PI * 2, 0, PI * 0.5); cap.scale(R * 1.075, R * 1.09, R * 1.07); var capM = LUNA.mesh(cap, M.cap, { ink: 0.004 }); capM.position.y = 0.004; capM.rotation.x = -0.22; head.add(capM);
    var HP = [], hc = new THREE.Color(C.hair), cHi = C.hairHi;
    var shell = new THREE.SphereGeometry(1, sg(32, 16), sg(12, 6), PI * 0.94, PI * 1.12, PI * 0.46, PI * 0.36); shell.scale(R * 1.075, R * 1.09, R * 1.07); HP.push([shell, null, C.hair]);
    [[-0.62, 0.05], [-0.42, 0.03], [-0.22, 0.042], [-0.04, 0.022], [0.14, 0.036], [0.32, 0.026], [0.5, 0.044], [0.66, 0.06]].forEach(function (b, i) { var th = b[0], s = 0.1; HP.push([lock([onS(R, th - 0.05, R * 0.95, 0.002), onS(R, th + s * 0.3, R * 0.7, 0.011), onS(R, th + s * 0.7, R * 0.42, 0.014), onS(R, th + s, b[1], 0.012)], 0.019, 0.0052, { tip: 1.2 }), null, i % 3 === 1 ? 0x5a3424 : C.hair]); });
    [-1, 1].forEach(function (sd) { HP.push([lock([onS(R, sd * 0.98, R * 0.62, 0.004), onS(R, sd * 1.06, R * 0.1, 0.012), onS(R, sd * 1.1, -R * 0.55, 0.016), onS(R, sd * 1.02, -R * 1.05, 0.03), new V3(sd * 0.072, -R * 1.38, 0.05)], 0.017, 0.0055, { tip: 1.1 }), null, C.hair]);
      HP.push([lock([onS(R, sd * 1.28, R * 0.6, 0.004), onS(R, sd * 1.36, 0.0, 0.012), onS(R, sd * 1.42, -R * 0.62, 0.018), new V3(sd * 0.1, -R * 1.18, 0.01)], 0.02, 0.006), null, 0x573222]); });
    /* the bow at the back of the head, and the star clip over her left temple */
    var bwP = onS(R, PI, R * 0.32, 0.02); [-1, 1].forEach(function (sd) { HP.push([new THREE.TorusGeometry(0.024, 0.008, 6, 16), M4([bwP.x + sd * 0.026, bwP.y + 0.004, bwP.z - 0.004], [0, 0, sd * 0.42], [1.1, 0.62, 0.42]), C.lace]); HP.push([LUNA.taper(new THREE.CatmullRomCurve3([new V3(bwP.x + sd * 0.004, bwP.y - 0.004, bwP.z - 0.006), new V3(bwP.x + sd * 0.018, bwP.y - 0.04, bwP.z - 0.012), new V3(bwP.x + sd * 0.026, bwP.y - 0.08, bwP.z - 0.008)]), 8, 4, function (t) { return 0.004 * (1 - t * 0.35); }, { flat: 2.6 }), null, C.lace]); });
    HP.push([LUNA.blob(0.011, 0.011, 0.008, 10), M4([bwP.x, bwP.y + 0.002, bwP.z - 0.008]), C.lace]);
    var stP = onS(R, 0.98, R * 0.62, 0.012); HP.push([new THREE.ExtrudeGeometry(starShape(0.013, 0.0058), { depth: 0.003, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0012, bevelSegments: 1 }), M4([stP.x, stP.y, stP.z], [0, 0.98, -0.25]), C.clip]);
    head.add(LUNA.mesh(LUNA.merge(HP), M.hair, { ink: 0.003 }));
    /* the long hair hangs from the nape over her back and, in two locks, over each shoulder to the chest: it lies on the body, so it follows the
       torso, not the head; a soft curtain under the waves fills the gaps */
    var BP = [], HY = HC; function hv(x, y, z) { return new V3(x, y + HY, z); }
    var nB = Q() >= 2 ? 13 : 9; for (var i = 0; i < nB; i++) { var k = i / (nB - 1), th = PI + (k - 0.5) * 2.05, s0 = Math.sin(th), c0 = Math.cos(th), wv = 0.012 * Math.sin(i * 2.1), ln = 0.34 + 0.04 * Math.sin(i * 1.3) - Math.abs(k - 0.5) * 0.06, ox = s0 * 0.112, oz = c0 * 0.1 - 0.012;
      BP.push([lock([hv(s0 * R * 0.95, R * 0.3, c0 * R * 0.95), hv(s0 * R * 1.07, -R * 0.4, c0 * R * 1.03), hv(ox * 1.04 + wv, -0.16, oz - 0.004), hv(ox * 1.08 - wv, -0.24, oz - 0.014), hv(ox * 1.14 + wv, -ln + 0.02, oz - 0.012), hv(ox * 1.24 + wv * 0.5, -ln - 0.01, oz * 0.86 - 0.01)], 0.026, 0.0075, { c: new V3(0, -0.2 + HY, 0.02), uy: 0.05, seg: sg(20, 9) }), null, i % 4 === 2 ? 0x5a3424 : C.hair]); }
    [-1, 1].forEach(function (sd) { [0, 1].forEach(function (j) { var dz = j * 0.018, dx = j * 0.012; BP.push([lock([hv(sd * R * 0.9, R * 0.05, -0.02 - dz), hv(sd * (0.104 + dx), -R * 0.7, 0.0 - dz), hv(sd * (0.104 + dx), -0.17, 0.038 - dz * 0.5), hv(sd * (0.09 + dx), -0.26, 0.082 - dz * 0.3), hv(sd * (0.082 + dx * 0.5), -0.34, 0.088), hv(sd * (0.068 + dx * 0.5), -0.37, 0.07)], 0.022, 0.0068, { c: new V3(sd * 0.03, -0.2 + HY, -0.02), uy: 0.1, seg: sg(18, 8) }), null, j ? 0x573222 : C.hair]); }); });
    torso.add(LUNA.mesh(LUNA.merge(BP), M.hair, { ink: 0.003 }));
    var cur = LUNA.lathe(LUNA.smoothProfile([[R * 1.02, R * 0.2], [R * 1.06, -R * 0.5], [0.104, -0.17], [0.108, -0.26], [0.1, -0.33]], 12), sg(24, 12), { start: PI * 0.64, len: PI * 0.72 }); cur.scale(1, 1, 0.92); var curM = LUNA.mesh(cur, M.hairD, { ink: false }); curM.position.set(0, HY, -0.012); torso.add(curM);
    /* the legs, the arms, the hands: by IK every frame; the socks and the shoes at the ankles */
    var legs = [-1, 1].map(function (sd) { return limb(root, 0.255, 0.352, capsule(0.255, 0.047, 0.037), capsule(0.352, 0.036, 0.024, 0.08), M.skin, M.skin, 0.0032); });
    var feet = [-1, 1].map(function (sd) { var f = new THREE.Group(); root.add(f); var sock = LUNA.mesh(new THREE.CylinderGeometry(0.03, 0.028, 0.05, 14), M.sock, { ink: 0.0025 }); sock.position.y = -0.008; f.add(sock); var fr = LUNA.mesh(new THREE.TorusGeometry(0.031, 0.006, 6, 18), M.sock, { ink: 0.002 }); fr.rotation.x = PI / 2; fr.position.y = 0.018; f.add(fr);
      var sh = LUNA.mesh(LUNA.blob(0.036, 0.028, 0.068, 14), M.shoe, { ink: 0.003 }); sh.position.set(0, -0.034, 0.03); f.add(sh); var so = LUNA.mesh(LUNA.rbox(0.07, 0.01, 0.13, 0.004, 2), LUNA.toon(0x4a2a22, { rim: 0.2 }), { ink: false }); so.position.set(0, -0.058, 0.03); f.add(so);
      var st = LUNA.mesh(new THREE.TorusGeometry(0.03, 0.004, 5, 14, PI), M.shoe, { ink: 0.002 }); st.rotation.set(0, PI / 2, 0); st.position.set(0, -0.022, 0.03); f.add(st); var bt = LUNA.mesh(LUNA.blob(0.005, 0.005, 0.004, 6), LUNA.toon(C.clip, { rim: 0.3 }), { ink: false }); bt.position.set(sd * 0.028, -0.02, 0.03); f.add(bt); f.rotation.order = 'YXZ'; return f; });
    var arms = [-1, 1].map(function (sd) { return limb(root, 0.156, 0.152, capsule(0.156, 0.034, 0.03), capsule(0.152, 0.029, 0.037, -0.05), M.card, M.card, 0.003); });
    var hands = [-1, 1].map(function (sd) { return hand(root, M.skin, sd); });
    return { root: root, torso: torso, head: head, face: F, legs: legs, feet: feet, arms: arms, hands: hands, WY: WY, R: R, sh: [0.083, 0.214, -0.004], hip: [0.048, WY - 0.07, 0.0],
      yaw: 0, pitch: 0, roll: 0, blush: 0, blinkT: 2 + Math.random() * 2, blinking: 0, sw: 0, lean: 0, hx: 0, kind: 'girl' }; }

  /* ================= he ================= */
  function boy(H) {
    var C = { skin: 0xf6d3bc, shirt: 0x1c1c20, card: 0x6c6a4a, cardDk: 0x55533a, pants: 0x151518, hair: 0x2e2420, hairHi: 0x6a5446, hairLo: 0x1c1512, shoe: 0xfafaf6, sole: 0xe2ddd6, accent: 0x1c1c20, btn: 0xd8cfb4 }; /* (v60) a black turtleneck, an olive field jacket, black trousers */
    var M = { skin: LUNA.toon(C.skin, { rim: 0.2 }), vc: LUNA.toon(0xffffff, { vc: true, rim: 0.2 }), card: LUNA.toon(C.card, { rim: 0.25, side: THREE.DoubleSide }), pants: LUNA.toon(C.pants, { rim: 0.2 }), hair: LUNA.toon(0xffffff, { vc: true, rim: 0.32 }), shoe: LUNA.toon(0xffffff, { vc: true, rim: 0.3 }) };
    M.cap = LUNA.toon(0xffffff, { rim: 0.32, map: hairTex(C.hair, C.hairHi, C.hairLo) });
    var root = new THREE.Group(), WY = H + 0.12, R = 0.114, HC = 0.412;
    var torso = new THREE.Group(); torso.position.y = WY; root.add(torso); var TP = [];
    var PR = [[0.088, -0.04], [0.089, 0.05], [0.096, 0.15], [0.104, 0.23], [0.1, 0.262], [0.06, 0.284], [0.03, 0.292]];
    var sh = LUNA.lathe(LUNA.smoothProfile([[0.001, -0.04]].concat(PR).concat([[0.001, 0.294]]), 18), sg(28, 14)); sh.scale(1, 1, 0.74); TP.push([sh, null, C.shirt]);
    TP.push([new THREE.CylinderGeometry(0.034, 0.038, 0.05, sg(16, 10)), M4([0, 0.29, -0.004]), C.shirt]); /* the turtleneck's rolled collar */
    TP.push([capsule(0.07, 0.028, 0.03), M4([0, 0.34, -0.006]), C.skin]);
    /* the cardigan: a V open over the shirt, three buttons, the ribbed hem */
    function rP(y) { for (var i = 0; i < PR.length - 1; i++) if (y <= PR[i + 1][1]) { var k = (y - PR[i][1]) / (PR[i + 1][1] - PR[i][1]); return mix(PR[i][0], PR[i + 1][0], Math.max(0, Math.min(1, k))); } return PR[PR.length - 1][0]; }
    var cdg = sheet(sg(40, 20), sg(16, 8), function (u, v, p) { var y = mix(0.262, -0.07, v), g = mix(0.1, 0.46, sm(0.0, 0.24, y)), a = g + u * (PI * 2 - 2 * g), r = rP(Math.max(-0.04, Math.min(0.262, y))) + 0.009 + (y < -0.04 ? (-0.04 - y) * 0.25 : 0); p.set(Math.sin(a) * r, y, Math.cos(a) * r * 0.76); });
    paint(cdg, function (u, v, c) { c.set(v > 0.86 ? C.cardDk : C.card); });
    torso.add(LUNA.mesh(cdg, LUNA.toon(0xffffff, { vc: true, rim: 0.25, side: THREE.DoubleSide }), { ink: 0.003 }));
    [0.0, 0.055, 0.11].forEach(function (y) { var g = mix(0.1, 0.46, sm(0.0, 0.24, y)) + 0.07, r = rP(y) + 0.012; TP.push([LUNA.blob(0.0065, 0.0065, 0.003, 8), M4([-Math.sin(g) * r, y, Math.cos(g) * r * 0.76]), C.btn]); });
    torso.add(LUNA.mesh(LUNA.merge(TP), M.vc, { ink: 0.0035 }));
    var pel = LUNA.mesh(LUNA.blob(0.104, 0.07, 0.084, 18), M.pants, { ink: 0.003 }); pel.position.set(0, WY - 0.075, -0.004); root.add(pel);
    var neck = new THREE.Group(); neck.position.y = HC; torso.add(neck); var head = new THREE.Group(); head.rotation.order = 'YXZ'; neck.add(head);
    var skull = LUNA.animeSkull(R, sg(52, 28), sg(40, 20)); head.add(LUNA.mesh(skull, M.skin, { ink: 0.0042 }));
    var fo = { eyeX: 0.0438, eyeY: -0.027, ew: 0.0248, eh: 0.0272, lashW: 0.0036, iris: ['#141418', '#2c3340', '#58657c', '#a3b2c8'], lash: '#1e1714', brow: '#2a201b', blushLines: false, fn: Q() >= 2 ? 1024 : 512 }, F = face(head, skull, 'cpB', fo);
    [-1, 1].forEach(function (sd) { var e = LUNA.mesh(LUNA.blob(0.013, 0.022, 0.01, 10), M.skin, { ink: 0.0025 }); e.position.set(sd * R * 0.97, -0.022, -0.006); e.rotation.y = sd * 0.3; head.add(e); });
    var cap = new THREE.SphereGeometry(1, sg(40, 20), sg(20, 10), 0, PI * 2, 0, PI * 0.5); cap.scale(R * 1.08, R * 1.1, R * 1.08); var capM = LUNA.mesh(cap, M.cap, { ink: 0.004 }); capM.position.y = 0.006; capM.rotation.x = -0.2; head.add(capM);
    var HP = [];
    var shell = new THREE.SphereGeometry(1, sg(32, 16), sg(12, 6), PI * 1.16, PI * 0.68, PI * 0.46, PI * 0.28); shell.scale(R * 1.08, R * 1.1, R * 1.08); HP.push([shell, null, C.hair]);
    /* the fringe, parted a little to his right, the tips falling to the brows */
    [[-0.6, 0.012], [-0.4, -0.004], [-0.2, 0.014], [-0.02, -0.006], [0.16, 0.01], [0.34, -0.002], [0.54, 0.016]].forEach(function (b, i) { var th = b[0], s = -0.08; HP.push([lock([onS(R, th + 0.04, R * 0.98, 0.004), onS(R, th + s * 0.3, R * 0.72, 0.016), onS(R, th + s * 0.7, R * 0.42, 0.018), onS(R, th + s, b[1] + 0.02, 0.014)], 0.024, 0.0068, { tip: 1.3 }), null, i % 3 === 2 ? 0x3e302a : C.hair]); });
    [-1, 1].forEach(function (sd) { HP.push([lock([onS(R, sd * 1.0, R * 0.62, 0.006), onS(R, sd * 1.1, R * 0.3, 0.014), onS(R, sd * 1.16, R * 0.02, 0.012)], 0.019, 0.006, { tip: 1.4 }), null, C.hair]); HP.push([lock([onS(R, sd * 1.42, R * 0.66, 0.006), onS(R, sd * 1.56, R * 0.36, 0.016), onS(R, sd * 1.66, R * 0.12, 0.014)], 0.02, 0.0062, { tip: 1.4 }), null, C.hair]); HP.push([lock([onS(R, sd * 1.9, R * 0.7, 0.006), onS(R, sd * 2.0, R * 0.3, 0.02), onS(R, sd * 2.1, -R * 0.02, 0.018)], 0.022, 0.0065, { tip: 1.4 }), null, 0x3a2c26]); });
    for (var i = 0; i < 7; i++) { var th = PI + (i / 6 - 0.5) * 2.2; HP.push([lock([onS(R, th, R * 0.7, 0.006), onS(R, th + 0.05, R * 0.1, 0.018), onS(R, th + 0.08, -R * 0.42, 0.016), onS(R, th + 0.1, -R * 0.66, 0.026)], 0.026, 0.007, { tip: 1.2 }), null, i % 2 ? 0x3a2c26 : C.hair]); }
    /* volume on the crown, and the one curl that will not lie down */
    [[0.3, 0.6], [-0.6, 0.5], [1.0, 0.7], [-1.3, 0.6], [2.6, 0.5], [-2.4, 0.6], [3.3, 0.55]].forEach(function (b, i) { var a0 = b[0], dl = b[1]; HP.push([lock([onS(R, a0, R * 0.97, 0.002), onS(R, a0 + 0.22 * dl, R * 0.86, 0.026), onS(R, a0 + 0.42 * dl, R * 0.62, 0.024)], 0.024, 0.0068, { tip: 1.5, uy: 1 }), null, i % 2 ? 0x3e302a : C.hair]); });
    HP.push([LUNA.taper(new THREE.CatmullRomCurve3([new V3(0.004, R * 1.06, 0.014), new V3(0.01, R * 1.3, 0.028), new V3(0.006, R * 1.46, 0.05), new V3(-0.008, R * 1.46, 0.07), new V3(-0.016, R * 1.36, 0.068), new V3(-0.01, R * 1.3, 0.056)]), sg(16, 8), 6, function (t) { return 0.0075 * Math.pow(1 - t, 0.5) + 0.0005; }, { flat: 1.8, up: new V3(1, 0, 0) }), null, C.hair]);
    head.add(LUNA.mesh(LUNA.merge(HP), M.hair, { ink: 0.003 }));
    var legs = [-1, 1].map(function (sd) { return limb(root, 0.28, 0.372, capsule(0.28, 0.044, 0.038), capsule(0.372, 0.036, 0.032), M.pants, M.pants, 0.0032); });
    var feet = [-1, 1].map(function (sd) { var f = new THREE.Group(); root.add(f); var SP = [];
      SP.push([LUNA.rbox(0.078, 0.05, 0.15, 0.024, 3), M4([0, -0.03, 0.035]), C.shoe]); SP.push([LUNA.rbox(0.082, 0.016, 0.156, 0.006, 2), M4([0, -0.054, 0.035]), C.sole]); SP.push([LUNA.rbox(0.004, 0.016, 0.06, 0.002, 1), M4([sd * 0.04, -0.03, 0.03], [0, 0, 0]), C.accent]); SP.push([LUNA.rbox(0.004, 0.016, 0.06, 0.002, 1), M4([-sd * 0.04, -0.03, 0.03]), C.accent]);
      [0, 1, 2].forEach(function (q) { SP.push([LUNA.rbox(0.03, 0.004, 0.006, 0.002, 1), M4([0, -0.004 - q * 0.004, 0.05 + q * 0.018], [-0.35, 0, 0]), C.sole]); }); SP.push([new THREE.TorusGeometry(0.04, 0.008, 6, 18), M4([0, 0.03, -0.002], [PI / 2, 0, 0]), C.pants]);
      f.add(LUNA.mesh(LUNA.merge(SP), M.shoe, { ink: 0.003 })); f.rotation.order = 'YXZ'; return f; });
    var arms = [-1, 1].map(function (sd) { return limb(root, 0.17, 0.165, capsule(0.17, 0.039, 0.034), capsule(0.165, 0.033, 0.03), M.card, M.card, 0.003); });
    var hands = [-1, 1].map(function (sd) { var hgp = hand(root, M.skin, sd); var cuff = LUNA.mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.014, 14), LUNA.toon(C.shirt, { rim: 0.2 }), { ink: 0.002 }); cuff.position.y = 0.004; hgp.add(cuff); return hgp; });
    /* the bouquet, held behind his back: a cone of pink paper inside cream, a rose ribbon, five roses, baby's breath, leaves */
    return { root: root, torso: torso, head: head, face: F, legs: legs, feet: feet, arms: arms, hands: hands, WY: WY, R: R, sh: [0.1, 0.262, -0.005], hip: [0.062, WY - 0.075, 0.0],
      yaw: 0, pitch: 0, roll: 0, blush: 0, blinkT: 3 + Math.random() * 2, blinking: 0, sw: 0, lean: 0, hx: 0, kind: 'boy' }; }


  /* ================= the two, and their sixteen seconds ================= */
  function build(o) { var U = o.U, H = 0.45 * U, g = new THREE.Group(), XB = -0.2, XG = 0.2;
    [XB, XG].forEach(function (x) { var s = o.stool(); s.position.x = x; g.add(s); });
    var B = boy(H), G = girl(H); B.root.position.x = XB; G.root.position.x = XG; g.add(B.root); g.add(G.root); LUNA.curvedAll(g);
    var S = { t: 0, last: 0, tf: null }, A = new V3(), T = new V3(), pole = new V3(), tmp = new V3(), up = new V3(0, 1, 0);
    function shoulder(c, sd, out) { c.torso.updateMatrix(); return out.set(sd * c.sh[0], c.sh[1], c.sh[2]).applyMatrix4(c.torso.matrix); }
    function headW(c, out) { c.head.updateMatrixWorld(true); return c.head.getWorldPosition(out); }
    function ease(c, key, v, k, dt) { c[key] += (v - c[key]) * (S.snap ? 1 : 1 - Math.exp(-dt * k)); }
    function blinkStep(c, dt, want) { c.blinkT -= dt; if (c.blinking > 0) { c.blinking -= dt; if (c.blinking <= 0) c.blinkT = 2.2 + Math.random() * 3; } else if (c.blinkT <= 0 && want !== 'happy') c.blinking = 0.12; c.face.set(c.blinking > 0 ? 'closed' : want); }
    function pose(c, dt, P) {
      ease(c, 'yaw', P.yaw, P.k, dt); ease(c, 'pitch', P.pitch, P.k, dt); ease(c, 'roll', P.roll || 0, P.k * 0.6, dt); ease(c, 'lean', P.lean || 0, 3, dt); ease(c, 'blush', P.blush, 5, dt); ease(c, 'hx', P.hx || 0, 2.4, dt);
      c.head.rotation.set(c.pitch, c.yaw, c.roll); c.torso.rotation.set(0.05 + (P.fwd || 0), c.yaw * 0.12, c.lean); c.torso.position.y = c.WY + (P.shrug || 0); c.torso.scale.y = 1 + 0.008 * Math.sin(S.t * 1.7 + (c.kind === 'girl' ? 1 : 0));
      c.face.bm.opacity = Math.min(1, c.blush); blinkStep(c, dt, P.expr);
      /* the legs */ for (var i = 0; i < 2; i++) { var sd = i ? 1 : -1, L = c.legs[i]; A.set(sd * c.hip[0], c.hip[1], c.hip[2]); T.copy(P.ank[i]); pole.set(sd * (c.kind === 'boy' ? 0.3 : -0.1), 1, 0.55); solve(L, A, T, pole);
        var f = c.feet[i]; f.position.copy(L.T); f.rotation.set(P.fp ? P.fp[i] : 0, P.fy ? P.fy[i] : 0, 0); }
      /* the arms and hands */ for (i = 0; i < 2; i++) { sd = i ? 1 : -1; var Lm = c.arms[i]; shoulder(c, sd, A); T.copy(P.hand[i]); pole.copy(P.pole[i]); solve(Lm, A, T, pole);
        tmp.subVectors(Lm.E, Lm.T); frame(c.hands[i], Lm.T, tmp, P.hz ? P.hz[i] : up); } }
    function tick(dt, ctx) { ctx = ctx || {}; dt = Math.min(dt, 0.1); S.t += dt; var t = S.t, P0 = 16, tau = S.tf != null ? S.tf : ((t % P0) + P0) % P0, fw = ctx.fw ? 1 : 0, up2 = fw ? -0.3 : 0;
      /* he */ var by = 0, bp = -0.04, br = 0, bk = 5, be = 'open', bfw = 0.03;
      if (tau >= 3 && tau < 5.4) { by = 0.78; bk = 3.2; } else if (tau >= 5.4 && tau < 8.6) { by = -0.42; bp = -0.16; br = -0.06; bk = tau < 6 ? 16 : 5; be = tau < 7.6 ? 'half' : 'open'; } else if (tau >= 8.6 && tau < 15.2) { by = 0.06; be = tau >= 10 && tau < 13.6 ? 'happy' : 'open'; }
      var creep = sm(8.2, 9.8, tau) * (1 - sm(14.6, 15.6, tau)), tap = (tau > 2 && tau < 5) || (tau > 6 && tau < 8.4) ? Math.abs(Math.sin(t * 10)) : 0;
      var blush = tau < 5.25 ? 0.14 : tau < 6.8 ? 1 : tau < 9.7 ? mix(1, 0.45, sm(6.8, 9.7, tau)) : tau < 11 ? 0.92 : tau < 15.5 ? mix(0.92, 0.25, sm(11, 15.5, tau)) : 0.14;
      pose(B, dt, { yaw: by, pitch: bp + up2, roll: br, k: bk, blush: blush, expr: fw && be === 'open' && Math.sin(t * 0.9) > 0.3 ? 'happy' : be, fwd: bfw,
        ank: [new V3(-0.088, 0.064 + 0.028 * tap, 0.3), new V3(0.09, 0.064, 0.3)], fp: [tap * 0.35, 0], fy: [-0.1, 0.1],
        hand: [new V3(-0.078, 0.535, -0.13), new V3(mix(0.128, 0.205, creep), 0.44, mix(0.035, 0.054, creep))], pole: [new V3(-1, -0.1, -0.45), new V3(0.7, -0.2, -0.5)], hz: [new V3(0.4, 0.2, -1), new V3(1, 0, 0.3)] });
      /* she */ var gy = 0, gp = 0.02, gr = 0, gk = 5, ge = 'open', lean = 0, shrug = 0, om = 2.2, am = 0.2;
      if (tau >= 4.6 && tau < 5.45) { gy = -0.66; gk = 6; ge = tau > 5.1 ? 'wide' : 'open'; } else if (tau >= 5.45 && tau < 8.8) { gy = 0.18; gp = 0.3; gk = tau < 6 ? 16 : 5; ge = 'half'; shrug = 0.008; om = 3.6; am = 0.28; } else if (tau >= 8.8 && tau < 10.4) { gp = 0.12; } else if (tau >= 10.4 && tau < 14.6) { gy = -0.12; gp = 0.06; gr = 0.16; lean = 0.05; ge = tau >= 10.6 && tau < 14.4 ? 'happy' : 'open'; }
      G.sw += dt * om; var nudge = sm(9.6, 10.2, tau) * (1 - sm(14.6, 15.4, tau)), ph0 = -0.1 + am * Math.sin(G.sw), ph1 = -0.1 + am * Math.sin(G.sw + PI);
      function ga(sd, ph) { return new V3(sd * 0.05, 0.418 - 0.352 * Math.cos(ph), 0.255 + 0.352 * Math.sin(ph)); }
      pose(G, dt, { yaw: gy, pitch: gp + up2, roll: gr, k: gk, blush: blush, expr: fw && ge === 'open' && Math.sin(t * 0.8 + 1) > 0.3 ? 'happy' : ge, lean: lean, shrug: shrug, fwd: 0.02,
        ank: [ga(-1, ph0), ga(1, ph1)], fp: [-ph0 * 0.6 + 0.15, -ph1 * 0.6 + 0.15], fy: [0.32, -0.32],
        hand: [new V3(mix(-0.158, -0.17, nudge), 0.438, mix(0.05, 0.056, nudge)), new V3(0.028, 0.528, 0.17)], pole: [new V3(-0.8, -0.2, -0.6), new V3(0.8, -0.3, -0.4)], hz: [new V3(-0.6, 0.8, 0.2), new V3(0, 1, 0.3)] });
      S.last = tau; }
    return { g: g, tick: tick, boy: B, girl: G, setT: function (x, snap) { S.tf = x == null ? null : x; S.snap = !!snap; }, jump: function (x) { S.tf = null; S.t = x; S.last = x - 0.01; } }; }
  return { build: build };
})();
