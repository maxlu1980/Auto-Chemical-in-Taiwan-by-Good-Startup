/* ===== [max.js] ===== */
/* ===== MAX — the owner of Good Startup, modelled from his own photographs, at the Taichung counter =====
   Real proportions (about 7.3 heads tall) rather than the chibi of the island's other people: a sculpted head (the brow, the eye sockets,
   the nose from the bridge to the wings, the lips, the chin and the jaw), black hair swept back from a side parting, full at the crown,
   tucked behind the ears and long at the nape; round glasses with a thin warm-tortoiseshell rim and a keyhole bridge; a calm smile.
   Two outfits from the photographs, chosen by the real temperature where he stands: the charcoal short-sleeved shirt with its spread
   collar and dark grey trousers in warm weather, the black jacket over a light grey shirt when it is cool; a steel watch on the left wrist.
   The rig is the island's person rig (the same joints), so he idles, breathes, blinks and turns to Luna like everyone else. */
var MAX = (function () {
  var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
  function T(hex, o) { return LUNA.toon(hex, Object.assign({ rim: 0.12 }, o || {})); }
  function M(geo, mat, ink) { return LUNA.mesh(geo, mat, { ink: ink === false ? false : (ink || 0.0032) }); }
  function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function gs(x, s) { return Math.exp(-x * x / (2 * s * s)); }
  function lat(pts, seg) { return LUNA.lathe(LUNA.smoothProfile(pts, Math.max(10, pts.length * 4)), seg || 32); }
  function tube(pts, r0, r1, o) { o = o || {}; var cv = new THREE.CatmullRomCurve3(pts.map(function (p) { return V(p[0], p[1], p[2]); }), false, 'catmullrom', 0.5); return LUNA.taper(cv, o.seg || 16, o.rad || 8, typeof r0 === 'function' ? r0 : function (t) { return r0 + (r1 - r0) * t; }, { flat: o.flat || 1, up: o.up }); }

  /* ---------- the head ---------- */
  var HA = 0.0675, HB = 0.1025, HC = 0.085; /* half width, half height, half depth */
  /* the two people modelled from photographs share this head and hair machinery; each has a profile */
  var PROFS = { max: { HA: 0.0675, HB: 0.1025, HC: 0.085, jawA: 0.09, jawB: 0.26, brow: 0.0035, nose: 1, noseW: 1, lips: 1, chin: 0.0055, vol: 1, pole: [-0.11, 0.7], hair: [0x1e1815, 0x0b0807, 0x5e5048],
      hl: [[0, 0.655], [0.3, 0.645], [0.55, 0.6], [0.78, 0.5], [0.97, 0.3], [1.09, 0.04], [1.2, -0.05], [1.31, 0.06], [1.42, 0.25], [1.8, 0.25], [1.97, 0.04], [2.18, -0.46], [2.55, -0.66], [Math.PI, -0.72]] },
    ol: { HA: 0.0625, HB: 0.097, HC: 0.081, jawA: 0.11, jawB: 0.33, brow: 0.0012, nose: 0.68, noseW: 0.82, lips: 1.3, chin: 0.003, vol: 0.72, pole: [0.2, 0.72], hair: [0x3b2a22, 0x1c1410, 0x8a6448], fem: true,
      hl: [[0, 0.6], [0.3, 0.59], [0.55, 0.55], [0.78, 0.45], [0.97, 0.25], [1.1, 0.0], [1.2, -0.08], [1.32, 0.02], [1.42, 0.2], [1.8, 0.2], [1.97, 0.0], [2.18, -0.5], [2.55, -0.7], [Math.PI, -0.78]] } }, PF = PROFS.max;
  /* (v43) her evening look from the newest photograph: warmer, lighter brown hair whose ends turn caramel, a fuller smile (the cheeks lifted) */
  PROFS.ol.capN = [200, 34]; PROFS.ol.headN = [80, 60]; /* (v43) the polygons where the silhouette needs them: the cap and the head lighter (the colour bands carry the clumps) */
  PROFS.olc = Object.assign({}, PROFS.ol, { hair: [0x4b3426, 0x22160f, 0x9c7656], tip: 0xb88a58, cheek: 0.024, vol: 0.74, puff: 0.3, crease: 0.22, pole: [Math.PI, 1.22], part: false, /* the hair falls from the crown: forward into the bangs, round the sides, down the back */
    hl: [[0, 0.55], [0.3, 0.545], [0.55, 0.52], [0.78, 0.44], [0.97, 0.25], [1.1, 0.0], [1.2, -0.08], [1.32, 0.02], [1.42, 0.2], [1.8, 0.2], [1.97, 0.0], [2.18, -0.5], [2.55, -0.7], [Math.PI, -0.78]] });
  function useProf(k) { PF = PROFS[k]; HA = PF.HA; HB = PF.HB; HC = PF.HC; HLT = null; HAIR.c.setHex(PF.hair[0]); HAIR.dk.setHex(PF.hair[1]); HAIR.hi.setHex(PF.hair[2]); HAIR.tip.setHex(PF.tip || PF.hair[2]); }
  function hp(x, y, z) { /* the sculpted head's surface point for a direction on the unit sphere */
    var wx = y > -0.05 ? 1 + 0.035 * gs(y - 0.5, 0.3) * sstep(-0.05, 0.1, y) : 1 - PF.jawA * sstep(-0.05, -0.63, y) - PF.jawB * Math.pow(sstep(-0.63, -1.0, y), 1.3);
    var X = x * HA * wx, Y = y * HB, Z = z * HC * (z > 0 ? 0.93 : 1.07);
    X *= 1 + (PF.cheek || 0.018) * gs(Y + 0.016, 0.02) * sstep(0.1, 0.5, z); /* the cheekbones (lifted further by a smile) */
    if (z > 0) { var ax = Math.abs(X), fz = sstep(0.05, 0.45, z);
      Z -= 0.011 * sstep(0.35, 0.95, y) * z; /* the forehead slopes back */
      Z += (PF.brow * gs(Y - 0.021, 0.007) * sstep(0.062, 0.02, ax)) * fz; /* the brow ridge */
      Z -= 0.0052 * gs(ax - 0.026, 0.011) * gs(Y - 0.002, 0.0095) * fz; /* the eye sockets */
      var t = (0.012 - Y) / 0.05, nh = Y > -0.038 ? 0.003 + 0.0135 * Math.pow(sstep(0, 1, t), 1.25) : 0.0165 * sstep(-0.047, -0.038, Y), nw = 0.0052 + 0.0058 * sstep(0, 1, t);
      Z += nh * PF.nose * gs(X, nw * PF.noseW) * sstep(0.016, 0.006, Y) * fz; /* the nose, bridge to tip */
      Z += 0.0048 * PF.nose * (gs(X - 0.0105 * PF.noseW, 0.0042) + gs(X + 0.0105 * PF.noseW, 0.0042)) * gs(Y + 0.041, 0.0045) * fz; /* its wings */
      Z += (0.0036 * gs(X, 0.017) * gs(Y + 0.059, 0.005) + 0.0034 * gs(X, 0.014) * gs(Y + 0.071, 0.0055) - 0.0014 * gs(X, 0.019) * gs(Y + 0.065, 0.0016)) * fz * PF.lips; /* the lips and the line between */
      Z += PF.chin * gs(Y + 0.094, 0.011) * gs(X, 0.018) * fz; /* the chin */ }
    return [X, Y, Z]; }
  function headGeo() { var g = new THREE.SphereGeometry(1, PF.headN ? PF.headN[0] : 96, PF.headN ? PF.headN[1] : 72), p = g.attributes.position, v = new THREE.Vector3(), i;
    for (i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); var q = hp(v.x, v.y, v.z); p.setXYZ(i, q[0], q[1], q[2]); }
    g.computeVertexNormals(); return g; }
  function dirAE(az, el) { return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]; }
  function aeOf(d) { return [Math.atan2(d[0], d[2]), Math.asin(Math.max(-1, Math.min(1, d[1])))]; }
  function onHead(d, lift) { var P = hp(d[0], d[1], d[2]), nx = P[0] / (HA * HA), ny = P[1] / (HB * HB), nz = P[2] / (HC * HC), l = Math.hypot(nx, ny, nz); return [P[0] + nx / l * lift, P[1] + ny / l * lift, P[2] + nz / l * lift]; }
  /* the face drawn on the head: the eyes in a gentle smile, the brows, the nostrils, the mouth; blinks and smiles on cue */
  function faceDraw(g, kind, X, Y, S) { var ink = '#1c1512', U = function (u) { return u * S; };
    function eye(cx, sd) { var x0 = X(cx), y0 = Y(0.0005), w = U(0.0104), h = U(0.004);
      g.save(); g.translate(x0, y0); g.scale(sd, 1);
      if (kind === 'closed' || kind === 'happy') { g.strokeStyle = ink; g.lineWidth = U(0.0016); g.lineCap = 'round'; g.beginPath(); if (kind === 'happy') { g.moveTo(-w, h * 0.3); g.quadraticCurveTo(0, -h * 1.3, w, h * 0.25); } else { g.moveTo(-w, 0); g.quadraticCurveTo(0, h * 0.7, w, -h * 0.1); } g.stroke(); g.restore(); return; }
      var k = kind === 'half' ? 0.5 : 0, top = -h * (1 - k), bot = h * 0.55;
      g.beginPath(); g.moveTo(-w, h * 0.1); g.bezierCurveTo(-w * 0.55, top * 1.25, w * 0.45, top * 1.3, w * 1.02, -h * 0.05 * (1 - k)); g.bezierCurveTo(w * 0.6, bot * 1.1, -w * 0.5, bot * 1.15, -w, h * 0.1); g.closePath();
      g.save(); g.clip(); g.fillStyle = '#f6efe8'; g.fillRect(-w * 1.3, -h * 2, w * 2.6, h * 4);
      var ir = U(0.0052), ix = w * 0.05, iy = h * 0.05, gr = g.createRadialGradient(ix, iy, ir * 0.2, ix, iy, ir); gr.addColorStop(0, '#1b120d'); gr.addColorStop(0.55, '#3a2418'); gr.addColorStop(1, '#22160f');
      g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, ir, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0b0807'; g.beginPath(); g.arc(ix, iy, ir * 0.45, 0, Math.PI * 2); g.fill();
      var sh = g.createLinearGradient(0, top * 1.2, 0, 0); sh.addColorStop(0, 'rgba(60,30,20,.55)'); sh.addColorStop(1, 'rgba(60,30,20,0)'); g.fillStyle = sh; g.fillRect(-w * 1.3, top * 1.4, w * 2.6, -top * 1.4);
      g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(ix - ir * 0.32, iy - ir * 0.36, ir * 0.24, 0, Math.PI * 2); g.fill(); g.restore();
      g.strokeStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = U(0.0017); g.beginPath(); g.moveTo(-w, h * 0.1); g.bezierCurveTo(-w * 0.55, top * 1.25, w * 0.45, top * 1.3, w * 1.06, -h * 0.05 * (1 - k)); g.stroke();
      g.strokeStyle = 'rgba(70,40,30,.55)'; g.lineWidth = U(0.0007); g.beginPath(); g.moveTo(-w * 0.7, bot * 0.95); g.quadraticCurveTo(0, bot * 1.35, w * 0.85, bot * 0.55); g.stroke(); /* the lower lid, lifted by the smile */
      g.strokeStyle = 'rgba(90,50,38,.4)'; g.lineWidth = U(0.0006); g.beginPath(); g.moveTo(-w * 0.55, top * 1.85); g.quadraticCurveTo(w * 0.2, top * 2.1, w * 0.95, top * 1.2); g.stroke(); /* the crease */
      g.restore(); }
    eye(-0.026, -1); eye(0.026, 1);
    /* the brows: dark, of medium weight, straight with a soft arch toward the ends */
    [-1, 1].forEach(function (sd) { g.save(); g.fillStyle = '#16110e'; g.beginPath(); var x1 = sd * 0.0075, x2 = sd * 0.0405, yb = 0.0205;
      g.moveTo(X(x1), Y(yb - 0.0012)); g.quadraticCurveTo(X(sd * 0.024), Y(yb + 0.0032), X(x2), Y(yb + 0.0002)); g.quadraticCurveTo(X(sd * 0.026), Y(yb + 0.0068), X(x1), Y(yb + 0.0042)); g.closePath(); g.fill(); g.restore(); });
    /* the nose: the nostrils and a shadow under the tip */ g.fillStyle = 'rgba(110,60,45,.55)'; [-1, 1].forEach(function (sd) { g.beginPath(); g.ellipse(X(sd * 0.0062), Y(-0.0435), U(0.0026), U(0.0011), sd * 0.35, 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = 'rgba(140,80,60,.35)'; g.lineWidth = U(0.0008); g.beginPath(); g.moveTo(X(-0.0045), Y(-0.0468)); g.quadraticCurveTo(X(0), Y(-0.0482), X(0.0045), Y(-0.0468)); g.stroke();
    [-1, 1].forEach(function (sd) { g.strokeStyle = 'rgba(150,90,70,.13)'; g.lineWidth = U(0.0008); g.beginPath(); g.moveTo(X(sd * 0.0158), Y(-0.045)); g.quadraticCurveTo(X(sd * 0.0215), Y(-0.056), X(sd * 0.0212), Y(-0.064)); g.stroke(); }); /* the smile lines */
    /* the mouth: closed, the corners lifted */ var my = -0.0652; g.strokeStyle = '#6e3a30'; g.lineWidth = U(0.0013); g.lineCap = 'round'; g.beginPath();
    if (kind === 'happy') { g.moveTo(X(-0.0175), Y(my + 0.002)); g.quadraticCurveTo(X(0), Y(my - 0.006), X(0.0175), Y(my + 0.002)); }
    else { g.moveTo(X(-0.0165), Y(my + 0.0016)); g.bezierCurveTo(X(-0.008), Y(my - 0.0012), X(0.008), Y(my - 0.0012), X(0.0165), Y(my + 0.0016)); } g.stroke();
    var lip = g.createLinearGradient(0, Y(my - 0.001), 0, Y(my - 0.008)); lip.addColorStop(0, 'rgba(176,96,84,.42)'); lip.addColorStop(1, 'rgba(176,96,84,0)'); g.fillStyle = lip; g.beginPath(); g.ellipse(X(0), Y(my - 0.0042), U(0.012), U(0.0035), 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(160,90,80,.25)'; g.beginPath(); g.ellipse(X(0), Y(my + 0.003), U(0.011), U(0.0016), 0, 0, Math.PI * 2); g.fill(); }

  /* ---------- the hair ----------
     Black, with a soft sheen; parted a little to his right at the front, rising from the parting and falling away to both sides and
     back over the crown, covering the tops of the ears, long at the nape and hanging to the line of the jaw at the sides.
     The cap is one surface laid over the skull whose lines all run from the front of the parting (as the hair falls from it), shaded
     clump by clump; over it hang the curtains at the sides and the back, with pointed clumps at their ends, and a few loose strands. */
  var HAIR = { c: new THREE.Color(0x1e1815), dk: new THREE.Color(0x0b0807), hi: new THREE.Color(0x5e5048), tip: new THREE.Color(0x5e5048) };
  var HLT = null; function hairEl(az) { /* the lowest elevation of the hair at an azimuth: the hairline, the sideburns, above the ears, the nape */
    if (!HLT) { var pts = PF.hl;
      var cv = new THREE.SplineCurve(pts.map(function (q) { return new THREE.Vector2(q[0], q[1]); })), raw = cv.getPoints(900); HLT = raw.map(function (v) { return [v.x, v.y]; }); }
    var a = Math.min(Math.PI, Math.abs(az)), lo = 0, hi = HLT.length - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (HLT[m][0] < a) lo = m; else hi = m; }
    var A0 = HLT[lo], A1 = HLT[hi], u = A1[0] > A0[0] ? (a - A0[0]) / (A1[0] - A0[0]) : 0; return A0[1] + (A1[1] - A0[1]) * Math.max(0, Math.min(1, u)); }
  function capVol(az, el) { /* the volume of the hair over the scalp: full on the top, puffed at the temples and over the ears, fuller at the back */
    var sa = Math.abs(Math.sin(az)), ca = Math.cos(az);
    return PF.vol * 0.0115 * sstep(0.05, 0.75, el) + 0.0085 * (PF.puff == null ? 1 : PF.puff) * Math.pow(sa, 1.4) * sstep(0.1, 0.4, el) * sstep(1.05, 0.7, el) + 0.0045 * sstep(-0.1, -0.8, ca) * sstep(0.7, -0.2, el) + 0.003 * sstep(0.3, 0.9, ca) * sstep(0.55, 0.75, el); }
  function capLift(az, el) { return 0.0064 + capVol(az, el) + 0.0012; }
  function inHair(d) { var ae = aeOf(d); return ae[1] >= hairEl(ae[0]); }
  function hairCap() { var Pc = dirAE(PF.pole[0], PF.pole[1]), e1 = [0, 0, -1], k = Pc[2] * -1, i, j;
    e1 = [e1[0] - Pc[0] * k, e1[1] - Pc[1] * k, e1[2] - Pc[2] * k]; var l1 = Math.hypot(e1[0], e1[1], e1[2]); e1 = [e1[0] / l1, e1[1] / l1, e1[2] / l1];
    var e2 = [Pc[1] * e1[2] - Pc[2] * e1[1], Pc[2] * e1[0] - Pc[0] * e1[2], Pc[0] * e1[1] - Pc[1] * e1[0]]; if (e2[0] < 0) e2 = [-e2[0], -e2[1], -e2[2]];
    function ray(al, be) { var ca = Math.cos(al), sa = Math.sin(al), cb = Math.cos(be), sb = Math.sin(be); return [ca * Pc[0] + sa * (cb * e1[0] + sb * e2[0]), ca * Pc[1] + sa * (cb * e1[1] + sb * e2[1]), ca * Pc[2] + sa * (cb * e1[2] + sb * e2[2])]; }
    var NU = PF.capN ? PF.capN[0] : 320, NV = PF.capN ? PF.capN[1] : 46, aMax = [], r = (function () { var s0 = 11; return function () { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; })();
    for (i = 0; i <= NU; i++) { var be = i / NU * Math.PI * 2, al = 0.02, prev = 0.02; while (al < Math.PI && inHair(ray(al, be))) { prev = al; al += 0.01; } var lo = prev, hi = al; for (j = 0; j < 14; j++) { var mid = (lo + hi) / 2; if (inHair(ray(mid, be))) lo = mid; else hi = mid; } aMax.push(lo); }
    /* the clumps, each a band of the fan with its own width */
    var cl = [0], cw; while (cl[cl.length - 1] < Math.PI * 2) { cw = 0.1 + r() * 0.09; cl.push(cl[cl.length - 1] + cw); } var sc = Math.PI * 2 / cl[cl.length - 1]; cl = cl.map(function (q) { return q * sc; });
    function phase(be) { var b = ((be % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), m; for (m = 1; m < cl.length; m++) if (b <= cl[m]) return 2 * (b - cl[m - 1]) / (cl[m] - cl[m - 1]) - 1; return 0; }
    var pos = [], col = [], idx = [], c = new THREE.Color(), BP = Math.PI; /* the parting runs straight back from the pole */
    for (j = 0; j <= NV; j++) for (i = 0; i <= NU; i++) { var bb = i / NU * Math.PI * 2, s = j / NV, al2 = aMax[i] * s, d = ray(al2, bb), ae = aeOf(d), el = ae[1];
      var edge = sstep(1.0, 0.9, s), soft = sstep(1.0, 0.72, s), ph = phase(bb + 0.07 * Math.sin(s * 3.2 + bb * 2.0)), cb2 = Math.cos(bb), dpart = Math.abs(((bb - BP + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI);
      var lift = 0.0022 + 0.0042 * edge + capVol(ae[0], el) * soft + 0.0012 * (1 - ph * ph) * edge;
      var groove = PF.part === false ? 0 : gs(dpart, 0.035) * sstep(0.03, 0.12, s) * sstep(0.55, 0.3, s); lift *= 1 - 0.5 * groove; if (j === NV) lift = -0.0008;
      var P = onHead(d, lift); pos.push(P[0], P[1], P[2]);
      var crease = Math.pow(Math.abs(ph), 3), gl = Math.max(0, 1 - Math.abs(el - 0.86) / 0.12) * (1 - crease) * sstep(0.2, 0.5, s);
      c.copy(HAIR.c).lerp(HAIR.dk, Math.min(1, crease * 0.75 * (PF.crease || 1) + groove * 0.8 + (1 - s) * 0.05)).lerp(HAIR.hi, gl * 0.75); col.push(c.r, c.g, c.b); }
    for (j = 0; j < NV; j++) for (i = 0; i < NU; i++) { var a = j * (NU + 1) + i, b = a + 1, cc = a + NU + 1, dd = cc + 1; idx.push(a, cc, b, b, cc, dd); }
    /* (v43) the fan's handedness follows the pole: keep the faces turned outwards whichever way the basis came out */ var vote = 0; for (i = 0; i < idx.length; i += 3 * 97) { var i0 = idx[i] * 3, i1 = idx[i + 1] * 3, i2 = idx[i + 2] * 3, ux = pos[i1] - pos[i0], uy = pos[i1 + 1] - pos[i0 + 1], uz = pos[i1 + 2] - pos[i0 + 2], vx = pos[i2] - pos[i0], vy = pos[i2 + 1] - pos[i0 + 1], vz = pos[i2 + 2] - pos[i0 + 2]; vote += (uy * vz - uz * vy) * pos[i0] + (uz * vx - ux * vz) * pos[i0 + 1] + (ux * vy - uy * vx) * pos[i0 + 2]; }
    if (vote < 0) for (i = 0; i < idx.length; i += 3) { var tq = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = tq; }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
    /* the seam at β = 0/2π: share the normals of the two columns */ var nA = g.attributes.normal; for (j = 0; j <= NV; j++) { var i0 = j * (NU + 1), i1 = i0 + NU; var nx = nA.getX(i0) + nA.getX(i1), ny = nA.getY(i0) + nA.getY(i1), nz = nA.getZ(i0) + nA.getZ(i1), ln = Math.hypot(nx, ny, nz) || 1; nA.setXYZ(i0, nx / ln, ny / ln, nz / ln); nA.setXYZ(i1, nx / ln, ny / ln, nz / ln); }
    return g; }
  /* a curtain of hair over the head from azimuth az0 to az1, from yTop down to its clumped ends; below "hang" it falls straight */
  function headAt(az, Y, lift, hang) { var yy = Math.max(Y, hang), el = Math.asin(Math.max(-0.97, Math.min(0.99, yy / HB))), P = onHead(dirAE(az, el), lift); if (Y < hang) P[1] = Y; return P; }
  function curtain(az0, az1, yTop, clumps, o) { o = o || {}; var NU = o.nu || 90, NV = o.nv || 22, pos = [], col = [], idx = [], c = new THREE.Color(), u, v;
    function edge(az) { var y = o.yGap, ph = 0, best = 9; clumps.forEach(function (q) { var d = (az - q[0]) / q[1]; if (Math.abs(d) < 1) { var yy = yTop - q[2] * (1 - Math.pow(Math.abs(d), o.sharp || 1.3)); if (yy < y) y = yy; } if (Math.abs(d) < best) { best = Math.abs(d); ph = d; } }); return [y, ph]; }
    for (v = 0; v <= NV; v++) for (u = 0; u <= NU; u++) { var az = az0 + (az1 - az0) * u / NU, E = edge(az), vv = v / NV, Y = yTop + (E[0] - yTop) * vv, own = (typeof o.lift === 'function' ? o.lift(az, Y, vv) : 0.005), elY = Math.asin(Math.max(-0.97, Math.min(0.99, Math.max(Y, -0.09) / HB))), capY = o.capY == null ? 0.02 : o.capY, onCap = Y > capY ? capLift(az, elY) + 0.0016 : 0, bl = sstep(0.0, o.blend || 0.4, vv),
        lf = (o.raw ? o.raw(az, Y, vv, capLift(az, elY)) : Math.max(own, onCap * (1 - bl) + own * bl, Y > capY ? capLift(az, elY) + 0.0008 : 0)) + 0.0012 * (1 - Math.min(1, Math.abs(E[1]))) + (o.flick || 0) * Math.pow(vv, 3);
      var P = headAt(az, Y, lf, o.hang == null ? 0 : o.hang); if (o.tuck) { var k2 = 1 - o.tuck * Math.max(0, (o.hang - Y)) / 0.05; P[0] *= k2; P[2] = P[2] * (1 - o.tuck * 0.3 * Math.max(0, (o.hang - Y)) / 0.05); } pos.push(P[0], P[1], P[2]);
      var crease = Math.pow(Math.min(1, Math.abs(E[1])), 3); c.copy(HAIR.c).lerp(HAIR.dk, Math.min(1, crease * 0.7 * (PF.crease || 1) + vv * 0.15)); if (o.tip) c.lerp(HAIR.tip, sstep(o.tip[0], 1, vv) * o.tip[1] * (1 - crease * 0.45)); if (o.sheen) c.lerp(HAIR.hi, o.sheen * gs(Y - o.sheenY, 0.012) * (1 - crease)); col.push(c.r, c.g, c.b); }
    for (v = 0; v < NV; v++) for (u = 0; u < NU; u++) { var a = v * (NU + 1) + u, b = a + 1, cc = a + NU + 1, d = cc + 1; idx.push(a, cc, b, b, cc, d); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
  function hairBuild(head, look) { var MH = T(0xffffff, { vc: true, rim: 0.22 }), MH2 = T(0xffffff, { vc: true, rim: 0.22, side: THREE.DoubleSide });
    head.add(M(hairCap(), MH, 0.0022));
    if (PF.fem) { var rf = (function () { var s0 = 9; return function () { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; })();
      function clumpsF(a0, a1, n, len, jit) { var out = [], k; for (k = 0; k < n; k++) { var cA = a0 + (a1 - a0) * (k + 0.5) / n; out.push([cA, (a1 - a0) / n * (0.9 + rf() * 0.5), len * (0.86 + rf() * jit)]); } return out; }
      var sideLift = function (az, Y, vv) { var e = sstep(1.3, 1.45, Math.abs(az)) * sstep(2.0, 1.85, Math.abs(az)) * sstep(0.03, 0.0, Y); return 0.006 + 0.004 * vv + 0.011 * e + 0.004 * sstep(-0.04, -0.12, Y); };
      if (look === 'casual') { hairCasual(head, MH, MH2, clumpsF, sideLift); return; }
      /* shoulder-length, soft layers: the sides falling in front of the shoulders, the ends turned a little outward */
      head.add(M(curtain(0.8, 2.35, 0.08, clumpsF(0.8, 2.35, 13, 0.245, 0.14), { yGap: 0.08, sharp: 1.1, lift: sideLift, capY: 0.02, hang: -0.01, flick: 0.012, nu: 130, nv: 34 }), MH2, 0.0018));
      head.add(M(curtain(-2.35, -0.8, 0.08, clumpsF(-2.35, -0.8, 13, 0.235, 0.14), { yGap: 0.08, sharp: 1.1, lift: function (az, Y, vv) { return sideLift(-az, Y, vv); }, capY: 0.02, hang: -0.01, flick: 0.012, nu: 130, nv: 34 }), MH2, 0.0018));
      head.add(M(curtain(2.2, Math.PI * 2 - 2.2, 0.07, clumpsF(2.2, Math.PI * 2 - 2.2, 16, 0.25, 0.1), { yGap: 0.07, lift: function (az, Y, vv) { return 0.006 + 0.004 * vv; }, capY: -0.03, hang: -0.07, tuck: 0.08, sharp: 1.1, flick: 0.01, nu: 150, nv: 30 }), MH2, 0.0018));
      /* the side-swept fringe from her parting across to the right temple */
      var fr = []; for (var q = 0; q < 8; q++) { var cA = 0.22 - q * 0.15; fr.push([cA, 0.17, 0.028 + (0.22 - cA) / 1.2 * 0.062]); }
      head.add(M(curtain(-1.0, 0.3, 0.095, fr, { yGap: 0.095, sharp: 0.9, lift: function (az, Y, vv) { return 0.007 + 0.002 * vv; }, capY: -1, blend: 0.8, flick: 0.004, nu: 70, nv: 18 }), MH2, 0.0016)); return; }
    var r = (function () { var s0 = 5; return function () { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; })();
    function clumps(a0, a1, n, len, jit) { var out = [], k; for (k = 0; k < n; k++) { var cA = a0 + (a1 - a0) * (k + 0.5) / n; out.push([cA, (a1 - a0) / n * (0.85 + r() * 0.5), len * (0.82 + r() * jit)]); } return out; }
    /* his left: over the ear, to the jaw */
    var earLift = function (az, Y, vv) { var e = sstep(1.3, 1.45, az) * sstep(2.0, 1.85, az) * sstep(0.035, 0.0, Y); return 0.006 + 0.003 * vv + 0.0125 * e + 0.005 * sstep(1.35, 1.6, az) * sstep(-0.02, -0.07, Y); };
    head.add(M(curtain(0.98, 2.3, 0.078, clumps(0.98, 2.3, 11, 0.15, 0.38), { yGap: 0.078, sharp: 0.9, lift: earLift, capY: 0.025, hang: -0.005, flick: 0.003, nu: 120, nv: 28 }), MH2, 0.002));
    /* his right: behind the ear, to the jaw */
    head.add(M(curtain(-2.45, -1.88, 0.078, clumps(-2.45, -1.88, 6, 0.16, 0.3), { yGap: 0.078, sharp: 0.9, lift: function (az, Y, vv) { return 0.006 + 0.003 * vv; }, capY: 0.025, hang: -0.01, flick: 0.003, nu: 70, nv: 28 }), MH2, 0.002));
    /* the back: down to the nape, close to the neck, the ends lying on the collar */
    head.add(M(curtain(2.15, Math.PI * 2 - 2.15, 0.07, clumps(2.15, Math.PI * 2 - 2.15, 15, 0.152, 0.2), { yGap: 0.07, lift: function (az, Y, vv) { return 0.005 + 0.002 * vv; }, capY: -0.03, hang: -0.075, tuck: 0.35, sharp: 1.0, flick: 0.003, nu: 150, nv: 28 }), MH2, 0.002));
    /* loose strands: two in front of his right ear down to the jaw, and a few lifted on the top, as in the photographs */
    function lockR(pts, w, th) { var cv = new THREE.CatmullRomCurve3(pts.map(function (q) { return V(q[0], q[1], q[2]); }), false, 'catmullrom', 0.5);
      var g = LUNA.taper(cv, 20, 6, function (t) { return th * Math.pow(1 - t, 0.6) + 0.0006; }, { flat: w / th, up: function (t, P) { return P.clone().normalize(); }, color: function (t, a, cc) { cc.copy(HAIR.c).lerp(HAIR.dk, t * 0.4); } }); head.add(M(g, MH, 0.0012)); }
    /* the thin strands that fall in front of his right ear to the jaw */
    head.add(M(curtain(-1.27, -1.06, 0.06, [[-1.22, 0.05, 0.13], [-1.12, 0.05, 0.12]], { yGap: 0.06, lift: function (az, Y, vv) { return 0.0045 + 0.003 * vv; }, capY: 0.03, hang: -0.02, sharp: 0.7, nu: 30, nv: 22 }), MH2, 0.0012)); }

  /* (v43) her hair in the evening photograph: to the collarbones in soft layers (the ends of the clumps at different lengths, turned a
     little outward), warm brown going caramel towards the ends, a soft sheen across the crown; see-through bangs (thin separate strands
     to the brows, parted a little in the middle, the forehead showing between them) and longer face-framing strands to the cheeks */
  function hairCasual(head, MH, MH2, clumpsF, sideLift) { var tipO = [0.38, 0.85];
    head.add(M(curtain(0.8, 2.35, 0.08, clumpsF(0.8, 2.35, 12, 0.262, 0.28), { yGap: 0.08, sharp: 1.75, lift: sideLift, capY: 0.02, hang: -0.01, flick: 0.017, tip: tipO, nu: 88, nv: 24 }), MH2, 0.0012));
    head.add(M(curtain(-2.35, -0.8, 0.08, clumpsF(-2.35, -0.8, 12, 0.254, 0.28), { yGap: 0.08, sharp: 1.75, lift: sideLift, capY: 0.02, hang: -0.01, flick: 0.017, tip: tipO, nu: 88, nv: 24 }), MH2, 0.0012));
    head.add(M(curtain(2.02, Math.PI * 2 - 2.02, 0.07, clumpsF(2.02, Math.PI * 2 - 2.02, 16, 0.288, 0.14), { yGap: 0.07, lift: function (az, Y, vv) { return 0.0072 + 0.011 * vv * vv; }, capY: -0.03, hang: -0.028, sharp: 1.7, flick: 0.013, tip: tipO, nu: 100, nv: 24 }), MH2, 0.0013));
    /* the see-through bangs: ten pointed locks from under the crown's hair, over the hairline, close over the forehead to just above the
       brows; V-shaped gaps between them show the forehead; parted a little in the middle, the outer ones longer */
    var br = rng(23), BC = [-0.565, -0.435, -0.305, -0.175, -0.05, 0.08, 0.205, 0.335, 0.46, 0.585].map(function (c, k) { var side = Math.abs(c); return [c, 0.074 + br() * 0.01, 0.059 + 0.016 * sstep(0.05, 0.58, side) + (br() - 0.5) * 0.006]; });
    head.add(M(curtain(-0.66, 0.66, 0.088, BC, { yGap: 0.088, sharp: 0.72, raw: function (az, Y, vv, cl) { var k = sstep(0.074, 0.05, Y); return (cl + 0.0012) * (1 - k) + (0.0036 + 0.0012 * vv + 0.003 * sstep(0.4, 0.66, Math.abs(az))) * k; }, flick: 0.0022, tip: [0.55, 0.3], nu: 132, nv: 16 }), MH2, false));
    /* the face-framing locks: from the parting over the temples to below the cheekbones, falling straight past the jaw, ends lighter */
    [1, -1].forEach(function (s) { var cl2 = [[0.6, 0.115, 0.128], [0.79, 0.095, 0.108]].map(function (q) { return [s * q[0], q[1], q[2]]; });
      head.add(M(curtain(s > 0 ? 0.47 : -0.93, s > 0 ? 0.93 : -0.47, 0.078, cl2, { yGap: 0.078, sharp: 0.9, raw: function (az, Y, vv, cl) { var k = sstep(0.062, 0.03, Y); return (cl + 0.0018) * (1 - k) + (0.0062 + 0.0035 * vv + 0.0055 * sstep(-0.01, -0.05, Y)) * k; }, flick: 0.005, tip: [0.4, 0.6], nu: 44, nv: 22 }), MH2, 0.0009)); }); }

  /* ---------- the glasses ---------- */
  function glasses(frame, lensM, rw) { var G = new THREE.Group(), ZG = 0.0805; rw = rw || 0.0011;
    [1, -1].forEach(function (s) { var rim = M(new THREE.TorusGeometry(0.0207, rw, 8, 56), frame, false); rim.position.set(s * 0.0262, 0.001, ZG); rim.rotation.y = s * 0.06; G.add(rim);
      var lens = new THREE.Mesh(new THREE.CircleGeometry(0.0203, 40), lensM); lens.position.set(s * 0.0262, 0.001, ZG - 0.0006); lens.rotation.y = s * 0.06; G.add(lens);
      var gl = new THREE.Mesh(new THREE.TorusGeometry(0.0158, 0.0007, 4, 24, 0.9), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })); gl.position.set(s * 0.0262, 0.001, ZG + 0.0004); gl.rotation.z = 1.9; G.add(gl); /* a glint on the glass */
      G.add(M(tube([[s * 0.0466, 0.004, ZG - 0.002], [s * 0.0612, 0.0065, ZG - 0.022], [s * 0.0705, 0.006, 0.03], [s * 0.0726, 0.003, -0.01], [s * 0.0708, -0.006, -0.03], [s * 0.066, -0.019, -0.037]], rw * 0.95, rw * 0.85, { seg: 20, rad: 6 }), frame, false));
      G.add(M(tube([[s * 0.0046, 0.0025, ZG + 0.0008], [s * 0.0062, -0.006, ZG - 0.006], [s * 0.0068, -0.012, ZG - 0.011]], 0.0007, 0.0007, { seg: 6, rad: 5 }), frame, false)); /* the pad arms */ });
    G.add(M(tube([[-0.0062, 0.0055, ZG + 0.0004], [-0.0032, 0.0098, ZG + 0.0022], [0.0032, 0.0098, ZG + 0.0022], [0.0062, 0.0055, ZG + 0.0004]], rw * 0.9, rw * 0.9, { seg: 10, rad: 6 }), frame, false)); /* the keyhole bridge */
    return G; }

  /* ---------- the hands ---------- */
  function hand(side, skin) { var h = new THREE.Group(); var palm = M(LUNA.rbox(0.024, 0.07, 0.056, 0.011, 3), skin, 0.0024); palm.position.set(0, -0.04, 0); h.add(palm);
    var fing = M(LUNA.rbox(0.021, 0.062, 0.05, 0.01, 3), skin, 0.0022); fing.position.set(side * 0.004, -0.098, 0.003); fing.rotation.z = side * 0.18; fing.rotation.x = -0.08; h.add(fing);
    var th = M(tube([[side * 0.006, -0.02, 0.022], [side * 0.012, -0.05, 0.034], [side * 0.012, -0.075, 0.034]], 0.0105, 0.0085, { seg: 8, rad: 10 }), skin, 0.0022); h.add(th); return h; }

  /* ---------- panels laid on the front of a lathe body (lapels, the shirt front, collar points) ---------- */
  function profR(pts) { var sm = LUNA.smoothProfile(pts, Math.max(10, pts.length * 4)).filter(function (q) { return q[0] > 0.02; }).sort(function (a, b) { return a[1] - b[1]; });
    return function (y) { if (y <= sm[0][1]) return sm[0][0]; for (var i = 1; i < sm.length; i++) if (y <= sm[i][1]) { var u = (y - sm[i - 1][1]) / Math.max(1e-6, sm[i][1] - sm[i - 1][1]); return sm[i - 1][0] + (sm[i][0] - sm[i - 1][0]) * u; } return sm[sm.length - 1][0]; }; }
  function panel(R, zs, yA, yB, xl, xr, lift, nx, ny) { var pos = [], idx = [], i, j; nx = nx || 8; ny = ny || 24;
    for (j = 0; j <= ny; j++) { var y = yA + (yB - yA) * j / ny, r = R(y), a = xl(y), b = xr(y); for (i = 0; i <= nx; i++) { var x = a + (b - a) * i / nx; pos.push(x, y, zs * Math.sqrt(Math.max(0, r * r - x * x)) + lift); } }
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) { var A0 = j * (nx + 1) + i, B0 = A0 + 1, C0 = A0 + nx + 1, D0 = C0 + 1; idx.push(A0, B0, C0, B0, D0, C0); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
  function lerpY(y, y0, y1, a, b) { var u = Math.max(0, Math.min(1, (y - y0) / (y1 - y0))); return a + (b - a) * u; }

  /* ---------- the software saleswoman of Daan Forest Park (modelled after the photographs she was given from) ----------
     A slim oval face, almond eyes that smile, soft arched brows, rosy lips; dark brown hair to the shoulders in soft layers with a
     side-swept fringe and warm lights; a black trouser suit over a camel knit, white sneakers, a tan crossbody bag, a black
     smartwatch on the left wrist; a coffee cup in her right hand. */
  function faceDrawF(g, kind, X, Y, S) { var ink = '#20140f', U = function (u) { return u * S; };
    [-1, 1].forEach(function (sd) { var bl = g.createRadialGradient(X(sd * 0.034), Y(-0.03), 0, X(sd * 0.034), Y(-0.03), U(0.016)); bl.addColorStop(0, 'rgba(232,128,118,.22)'); bl.addColorStop(1, 'rgba(232,128,118,0)'); g.fillStyle = bl; g.fillRect(X(sd * 0.034) - U(0.02), Y(-0.03) - U(0.02), U(0.04), U(0.04)); });
    function eye(cx, sd) { var x0 = X(cx), y0 = Y(0.001), w = U(0.0112), h = U(0.0052); g.save(); g.translate(x0, y0); g.scale(sd, 1);
      if (kind === 'closed' || kind === 'happy') { g.strokeStyle = ink; g.lineWidth = U(0.0022); g.lineCap = 'round'; g.beginPath(); if (kind === 'happy') { g.moveTo(-w, h * 0.3); g.quadraticCurveTo(0, -h * 1.4, w * 1.05, h * 0.1); } else { g.moveTo(-w, 0); g.quadraticCurveTo(0, h * 0.8, w * 1.05, -h * 0.15); } g.stroke(); g.restore(); return; }
      var k = kind === 'half' ? 0.5 : 0, top = -h * (1 - k), bot = h * 0.6;
      g.beginPath(); g.moveTo(-w, h * 0.15); g.bezierCurveTo(-w * 0.5, top * 1.3, w * 0.5, top * 1.3, w * 1.04, -h * 0.15 * (1 - k)); g.bezierCurveTo(w * 0.6, bot * 1.05, -w * 0.5, bot * 1.1, -w, h * 0.15); g.closePath();
      g.save(); g.clip(); g.fillStyle = '#f8f1ea'; g.fillRect(-w * 1.3, -h * 2, w * 2.6, h * 4);
      var ir = U(0.0058), ix = w * 0.04, iy = h * 0.08, gr = g.createRadialGradient(ix, iy, ir * 0.15, ix, iy, ir); gr.addColorStop(0, '#1a0f0a'); gr.addColorStop(0.5, '#4a2c1c'); gr.addColorStop(1, '#2a1810'); g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, ir, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0a0605'; g.beginPath(); g.arc(ix, iy, ir * 0.42, 0, Math.PI * 2); g.fill();
      var sh = g.createLinearGradient(0, top * 1.2, 0, 0); sh.addColorStop(0, 'rgba(60,30,20,.5)'); sh.addColorStop(1, 'rgba(60,30,20,0)'); g.fillStyle = sh; g.fillRect(-w * 1.3, top * 1.4, w * 2.6, -top * 1.4);
      g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(ix - ir * 0.32, iy - ir * 0.38, ir * 0.26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(ix + ir * 0.3, iy + ir * 0.3, ir * 0.1, 0, Math.PI * 2); g.fill(); g.restore();
      g.strokeStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = U(0.0026); g.beginPath(); g.moveTo(-w * 1.02, h * 0.15); g.bezierCurveTo(-w * 0.5, top * 1.3, w * 0.5, top * 1.3, w * 1.06, -h * 0.15 * (1 - k)); g.lineTo(w * 1.28, -h * 0.55 * (1 - k)); g.stroke(); /* the lash line and its little wing */
      g.strokeStyle = 'rgba(70,40,30,.5)'; g.lineWidth = U(0.0008); g.beginPath(); g.moveTo(-w * 0.7, bot * 0.95); g.quadraticCurveTo(0, bot * 1.4, w * 0.85, bot * 0.6); g.stroke();
      g.strokeStyle = 'rgba(90,50,38,.45)'; g.lineWidth = U(0.0007); g.beginPath(); g.moveTo(-w * 0.6, top * 1.75); g.quadraticCurveTo(w * 0.2, top * 2.05, w * 1.0, top * 1.15); g.stroke(); g.restore(); }
    eye(-0.025, -1); eye(0.025, 1);
    [-1, 1].forEach(function (sd) { g.save(); g.fillStyle = '#2c1d16'; g.beginPath(); var x1 = sd * 0.008, x2 = sd * 0.04, yb = 0.0225; g.moveTo(X(x1), Y(yb - 0.0008)); g.quadraticCurveTo(X(sd * 0.026), Y(yb + 0.0042), X(x2), Y(yb - 0.0016)); g.quadraticCurveTo(X(sd * 0.027), Y(yb + 0.0068), X(x1), Y(yb + 0.0028)); g.closePath(); g.fill(); g.restore(); });
    g.fillStyle = 'rgba(150,80,65,.35)'; [-1, 1].forEach(function (sd) { g.beginPath(); g.ellipse(X(sd * 0.0052), Y(-0.04), U(0.0019), U(0.0008), sd * 0.35, 0, Math.PI * 2); g.fill(); });
    var my = -0.0612; g.fillStyle = '#c4645e'; g.beginPath(); g.moveTo(X(-0.0158), Y(my)); g.bezierCurveTo(X(-0.008), Y(my + 0.0052), X(-0.002), Y(my + 0.0038), X(0), Y(my + 0.003)); g.bezierCurveTo(X(0.002), Y(my + 0.0038), X(0.008), Y(my + 0.0052), X(0.0158), Y(my)); g.bezierCurveTo(X(0.008), Y(my - 0.0072), X(-0.008), Y(my - 0.0072), X(-0.0158), Y(my)); g.closePath(); g.fill();
    g.strokeStyle = '#7a3430'; g.lineWidth = U(0.001); g.beginPath(); g.moveTo(X(-0.0158), Y(my + 0.0006)); if (kind === 'happy') g.quadraticCurveTo(X(0), Y(my - 0.004), X(0.0158), Y(my + 0.0006)); else g.quadraticCurveTo(X(0), Y(my - 0.0012), X(0.0158), Y(my + 0.0006)); g.stroke();
    g.fillStyle = 'rgba(255,240,235,.35)'; g.beginPath(); g.ellipse(X(0.003), Y(my - 0.0035), U(0.005), U(0.0012), 0, 0, Math.PI * 2); g.fill(); }
  /* (v43) the face in the evening photograph: a wide, warm smile showing the upper teeth; the eyes smiling with it (the lower lids lifted
     into soft crescents, the fullness under the eyes), soft brown brows lifted a little, a flush on the raised cheeks */
  function faceDrawF2(g, kind, X, Y, S) { var ink = '#24160f', U = function (u) { return u * S; };
    [-1, 1].forEach(function (sd) { var cx = X(sd * 0.0355), cy = Y(-0.0265), bl = g.createRadialGradient(cx, cy, 0, cx, cy, U(0.019)); bl.addColorStop(0, 'rgba(238,128,116,.27)'); bl.addColorStop(1, 'rgba(238,128,116,0)'); g.fillStyle = bl; g.fillRect(cx - U(0.021), cy - U(0.021), U(0.042), U(0.042)); });
    function eye(cx, sd) { var x0 = X(cx), y0 = Y(0.0015), w = U(0.0118), h = U(0.0054); g.save(); g.translate(x0, y0); g.scale(sd, 1);
      g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(255,238,228,.55)'; g.lineWidth = U(0.0017); g.beginPath(); g.moveTo(-w * 0.72, h * 1.3); g.quadraticCurveTo(0, h * 2.05, w * 0.8, h * 1.1); g.stroke();
      g.strokeStyle = 'rgba(150,90,72,.2)'; g.lineWidth = U(0.0008); g.beginPath(); g.moveTo(-w * 0.58, h * 1.95); g.quadraticCurveTo(0, h * 2.55, w * 0.7, h * 1.65); g.stroke();
      if (kind === 'closed' || kind === 'happy') { g.strokeStyle = ink; g.lineWidth = U(0.0024); g.beginPath(); g.moveTo(-w, h * 0.35); g.quadraticCurveTo(0, -h * (kind === 'happy' ? 1.6 : 0.95), w * 1.06, h * 0.2); g.stroke(); g.lineWidth = U(0.0011); g.beginPath(); g.moveTo(w * 1.0, h * 0.12); g.lineTo(w * 1.26, -h * 0.3); g.stroke(); g.restore(); return; }
      var k = kind === 'half' ? 0.55 : 0, top = -h * (1.15 - k), bot = h * 0.42;
      g.beginPath(); g.moveTo(-w, h * 0.25); g.bezierCurveTo(-w * 0.55, top * 1.25, w * 0.5, top * 1.3, w * 1.04, -h * 0.05 * (1 - k)); g.bezierCurveTo(w * 0.55, bot * 0.6, -w * 0.45, bot * 0.95, -w, h * 0.25); g.closePath();
      g.save(); g.clip(); g.fillStyle = '#f8f0e8'; g.fillRect(-w * 1.4, -h * 3, w * 2.8, h * 6);
      var ir = U(0.0064), ix = w * 0.06, iy = h * 0.12, gr = g.createRadialGradient(ix, iy, ir * 0.15, ix, iy, ir); gr.addColorStop(0, '#1d110b'); gr.addColorStop(0.5, '#56341f'); gr.addColorStop(0.85, '#3b2316'); gr.addColorStop(1, '#1e120c'); g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, ir, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#0b0605'; g.beginPath(); g.arc(ix, iy, ir * 0.42, 0, Math.PI * 2); g.fill();
      var sh = g.createLinearGradient(0, top * 1.3, 0, h * 0.1); sh.addColorStop(0, 'rgba(60,28,18,.6)'); sh.addColorStop(1, 'rgba(60,28,18,0)'); g.fillStyle = sh; g.fillRect(-w * 1.4, top * 1.5, w * 2.8, -top * 1.5 + h * 0.1);
      g.fillStyle = 'rgba(255,255,255,.96)'; g.beginPath(); g.arc(ix - ir * 0.3, iy - ir * 0.36, ir * 0.27, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(ix + ir * 0.34, iy + ir * 0.16, ir * 0.11, 0, Math.PI * 2); g.fill(); g.restore();
      g.strokeStyle = ink; g.lineWidth = U(0.0027); g.beginPath(); g.moveTo(-w * 1.02, h * 0.25); g.bezierCurveTo(-w * 0.55, top * 1.25, w * 0.5, top * 1.3, w * 1.06, -h * 0.05 * (1 - k)); g.lineTo(w * 1.3, -h * 0.5 * (1 - k)); g.stroke();
      g.lineWidth = U(0.0009); [[0.72, -0.95, 0.92, -1.55], [0.95, -0.55, 1.22, -1.02]].forEach(function (q) { g.beginPath(); g.moveTo(w * q[0], h * q[1] * (1 - k)); g.lineTo(w * q[2], h * q[3] * (1 - k)); g.stroke(); });
      g.strokeStyle = 'rgba(70,40,30,.55)'; g.lineWidth = U(0.0009); g.beginPath(); g.moveTo(-w * 0.65, bot * 1.05); g.quadraticCurveTo(0, bot * 1.35, w * 0.9, bot * 0.25); g.stroke();
      g.strokeStyle = 'rgba(90,50,38,.42)'; g.lineWidth = U(0.0007); g.beginPath(); g.moveTo(-w * 0.55, top * 1.85); g.quadraticCurveTo(w * 0.2, top * 2.15, w * 1.0, top * 1.2); g.stroke(); g.restore(); }
    eye(-0.0252, -1); eye(0.0252, 1);
    [-1, 1].forEach(function (sd) { var x1 = sd * 0.0078, x2 = sd * 0.0405, yb = 0.0236, gr = g.createLinearGradient(X(x1), 0, X(x2), 0); gr.addColorStop(0, 'rgba(70,46,32,.7)'); gr.addColorStop(0.35, '#4a3122'); gr.addColorStop(1, 'rgba(74,49,34,.8)'); g.fillStyle = gr; g.beginPath();
      g.moveTo(X(x1), Y(yb - 0.0006)); g.quadraticCurveTo(X(sd * 0.027), Y(yb + 0.0046), X(x2), Y(yb - 0.002)); g.quadraticCurveTo(X(sd * 0.027), Y(yb + 0.0072), X(x1), Y(yb + 0.0032)); g.closePath(); g.fill(); });
    g.fillStyle = 'rgba(150,82,66,.38)'; [-1, 1].forEach(function (sd) { g.beginPath(); g.ellipse(X(sd * 0.0052), Y(-0.0402), U(0.0019), U(0.0008), sd * 0.35, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = 'rgba(255,246,240,.32)'; g.beginPath(); g.ellipse(X(0.0006), Y(-0.033), U(0.0016), U(0.0028), 0, 0, Math.PI * 2); g.fill();
    [-1, 1].forEach(function (sd) { g.strokeStyle = 'rgba(160,92,74,.16)'; g.lineWidth = U(0.0009); g.beginPath(); g.moveTo(X(sd * 0.0145), Y(-0.043)); g.quadraticCurveTo(X(sd * 0.0228), Y(-0.052), X(sd * 0.0225), Y(-0.06)); g.stroke(); });
    /* the mouth: the lips round a wide opening, the upper teeth, a little of the tongue; the corners tucked up into the cheeks */
    var my = -0.06, mw = kind === 'happy' ? 0.0198 : 0.0188, cy = my + 0.0018, ow = mw * 0.9;
    g.fillStyle = '#c96a62'; g.beginPath(); g.moveTo(X(-mw), Y(cy)); g.bezierCurveTo(X(-mw * 0.6), Y(my + 0.0052), X(-0.004), Y(my + 0.0062), X(0), Y(my + 0.0052)); g.bezierCurveTo(X(0.004), Y(my + 0.0062), X(mw * 0.6), Y(my + 0.0052), X(mw), Y(cy)); g.bezierCurveTo(X(mw * 0.62), Y(my - 0.0105), X(-mw * 0.62), Y(my - 0.0105), X(-mw), Y(cy)); g.closePath(); g.fill();
    g.save(); g.beginPath(); g.moveTo(X(-ow), Y(cy - 0.0002)); g.bezierCurveTo(X(-ow * 0.55), Y(my + 0.0026), X(ow * 0.55), Y(my + 0.0026), X(ow), Y(cy - 0.0002)); g.bezierCurveTo(X(ow * 0.6), Y(my - 0.0078), X(-ow * 0.6), Y(my - 0.0078), X(-ow), Y(cy - 0.0002)); g.closePath(); g.fillStyle = '#4c1915'; g.fill(); g.clip();
    g.fillStyle = '#b45450'; g.beginPath(); g.ellipse(X(0), Y(my - 0.0072), U(ow * 0.55), U(0.0032), 0, 0, Math.PI * 2); g.fill();
    var tg = g.createLinearGradient(0, Y(my + 0.003), 0, Y(my - 0.0028)); tg.addColorStop(0, '#fffdf9'); tg.addColorStop(1, '#ebe3da'); g.fillStyle = tg; g.beginPath(); g.moveTo(X(-ow), Y(cy + 0.0004)); g.bezierCurveTo(X(-ow * 0.55), Y(my + 0.0032), X(ow * 0.55), Y(my + 0.0032), X(ow), Y(cy + 0.0004)); g.lineTo(X(ow * 0.8), Y(my - 0.0012)); g.bezierCurveTo(X(ow * 0.4), Y(my - 0.0034), X(-ow * 0.4), Y(my - 0.0034), X(-ow * 0.8), Y(my - 0.0012)); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(180,165,150,.35)'; g.lineWidth = U(0.0004); [-0.0085, -0.0042, 0, 0.0042, 0.0085].forEach(function (x) { g.beginPath(); g.moveTo(X(x), Y(my + 0.0026)); g.lineTo(X(x * 1.02), Y(my - 0.002)); g.stroke(); }); g.restore();
    g.strokeStyle = '#8a3a33'; g.lineWidth = U(0.0008); g.beginPath(); g.moveTo(X(-mw), Y(cy)); g.bezierCurveTo(X(-ow * 0.55), Y(my + 0.0026), X(ow * 0.55), Y(my + 0.0026), X(mw), Y(cy)); g.stroke();
    g.fillStyle = 'rgba(255,236,230,.4)'; g.beginPath(); g.ellipse(X(0.002), Y(my - 0.0092), U(0.006), U(0.0011), 0, 0, Math.PI * 2); g.fill();
    [-1, 1].forEach(function (sd) { g.strokeStyle = 'rgba(150,80,66,.4)'; g.lineWidth = U(0.0008); g.beginPath(); g.moveTo(X(sd * (mw - 0.0004)), Y(cy)); g.quadraticCurveTo(X(sd * (mw + 0.0018)), Y(cy + 0.0012), X(sd * (mw + 0.0022)), Y(cy + 0.0032)); g.stroke(); }); }

  /* ---------- (v43) the knit and the denim: drawn once on canvases (seeded, so every build is the same), shared by the parts ---------- */
  var TEXC = {}, TEXT = {};
  function rng(s) { var s0 = s; return function () { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; }
  function cvTex(key, w, h, draw, rep) { var k = key + '@' + (rep ? rep.join('x') : '1x1'); if (TEXT[k]) return TEXT[k]; var c = TEXC[key];
    if (!c) { c = TEXC[key] = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); }
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); return (TEXT[k] = t); }
  function jersey(g, w, h) { var r = rng(31); g.fillStyle = '#f0efed'; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 8) for (var x = 0; x < w; x += 8) { g.strokeStyle = 'rgba(0,0,0,0.11)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + 1, y + 1); g.lineTo(x + 4, y + 7); g.lineTo(x + 7, y + 1); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x + 2, y + 1.2); g.lineTo(x + 4, y + 5.4); g.stroke(); }
    for (var i = 0; i < 700; i++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '0,0,0' : '255,255,255') + ',' + (0.03 + r() * 0.05).toFixed(3) + ')'; g.fillRect(r() * w, r() * h, 2, 1); } }
  function ribV(g, w, h) { for (var x = 0; x < w; x++) { var p = (x % 8) / 8, v = 0.74 + 0.26 * Math.pow(Math.sin(p * Math.PI), 0.7), c = Math.round(255 * v); g.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')'; g.fillRect(x, 0, 1, h); } for (var y = 0; y < h; y += 4) { g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(0, y, w, 1); } }
  function ribH(g, w, h) { for (var y = 0; y < h; y++) { var p = (y % 8) / 8, v = 0.74 + 0.26 * Math.pow(Math.sin(p * Math.PI), 0.7), c = Math.round(255 * v); g.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')'; g.fillRect(0, y, w, 1); } for (var x = 0; x < w; x += 4) { g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(x, 0, 1, h); } }
  function denim(g, w, h) { var r = rng(77), d; g.fillStyle = '#4d6c9a'; g.fillRect(0, 0, w, h);
    for (d = -h; d < w; d += 3) { g.strokeStyle = 'rgba(18,32,68,0.34)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(d, 0); g.lineTo(d + h, h); g.stroke(); g.strokeStyle = 'rgba(214,226,244,0.1)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(d + 1.5, 0); g.lineTo(d + 1.5 + h, h); g.stroke(); }
    for (var i = 0; i < 1500; i++) { g.fillStyle = 'rgba(232,238,250,' + (0.04 + r() * 0.08).toFixed(3) + ')'; g.fillRect(r() * w, r() * h, 1, 3 + r() * 9); }
    var gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(226,236,250,0.2)'); gr.addColorStop(0.17, 'rgba(226,236,250,0.05)'); gr.addColorStop(0.5, 'rgba(10,20,52,0.14)'); gr.addColorStop(0.83, 'rgba(226,236,250,0.05)'); gr.addColorStop(1, 'rgba(226,236,250,0.2)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    [0.25, 0.75].forEach(function (u) { g.fillStyle = 'rgba(36,56,96,0.5)'; g.fillRect(u * w - 2, 0, 4, h); g.fillStyle = 'rgba(214,170,96,0.6)'; for (var y = 0; y < h; y += 6) g.fillRect(u * w + 2.5, y, 1.2, 3); }); }

  /* an open-fronted shell round the trunk (the cardigan): the profile r(y); the front opens by ±gap(y) about +z; the depth squashed by sz */
  function openShell(R, y0, y1, gap, sz, nu, nv, lift) { var pos = [], uv = [], idx = [], i, j;
    for (j = 0; j <= nv; j++) { var y = y0 + (y1 - y0) * j / nv, r = R(y) + (lift || 0), th = gap(y);
      for (i = 0; i <= nu; i++) { var a = th + (Math.PI * 2 - 2 * th) * i / nu; pos.push(Math.sin(a) * r, y, Math.cos(a) * r * sz); uv.push(a / (Math.PI * 2), j / nv); } }
    for (j = 0; j < nv; j++) for (i = 0; i < nu; i++) { var A0 = j * (nu + 1) + i, B0 = A0 + 1, C0 = A0 + nu + 1, D0 = C0 + 1; idx.push(A0, B0, C0, B0, D0, C0); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; }

  /* ---------- the software saleswoman ----------
     look 'suit' (Daan Forest Park, by day): the black trouser suit over a camel knit, the crossbody bag, a coffee.
     look 'casual' (the Taipei station plaza, after work; the newest photograph): an open camel cardigan in a fine knit with ribbed cuffs,
     hem and front bands and two patch pockets, a black crew-neck top tucked into blue jeans (twill, faded at the front, turned up at the
     ankles), white sneakers, the black smartwatch on her left wrist; the warm smile, the caramel-ended hair with its see-through bangs. */
  function buildOL(opt) { opt = opt || {}; var cas = opt.look === 'casual'; useProf('olc'); /* (v43) one head for her in both looks: the newest photograph's hair and smile */ var root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.userData.kind = 'person';
    var C = { skin: T(0xedcab2), suit: T(0x17171a, { rim: 0.18 }), lap: T(0x222226, { rim: 0.22 }), knit: T(0xc9a47c), pants: T(0x1b1b1f), shoe: T(0xf4f4f0, { rim: 0.3 }), sole: T(0xd8d8d2), bag: T(0xa8703c, { rim: 0.25 }), watch: T(0x18181a, { rim: 0.4 }), screen: T(0x2a3440), cup: T(0xd2b07c), lid: T(0xf4f2ee), gold: T(0xd8b45a, { rim: 0.5 }) };
    if (cas) Object.assign(C, { cardi: T(0xc19a6b, { map: cvTex('jersey', 64, 64, jersey, [26, 10]), rim: 0.2 }), cardiS: T(0xc19a6b, { map: cvTex('jersey', 64, 64, jersey, [9, 7]), rim: 0.2 }), ribV: T(0xb6905f, { map: cvTex('ribV', 64, 64, ribV, [11, 1]) }), ribC: T(0xb6905f, { map: cvTex('ribV', 64, 64, ribV, [4, 1]) }), ribB: T(0xb6905f, { map: cvTex('ribH', 64, 64, ribH, [1, 34]) }), cardiP: T(0xbd966a, { rim: 0.2 }),
      top: T(0x1a1a1d, { map: cvTex('jersey', 64, 64, jersey, [22, 9]), rim: 0.24 }), jean: T(0xffffff, { map: cvTex('denim', 512, 512, denim), rim: 0.16 }), band: T(0x3c5784), copper: T(0xb87a3c, { rim: 0.5 }), btn: T(0x5a3a24, { rim: 0.4 }), screen: T(0x16202c, { emissive: 0x2a4a68, ei: 0.35 }) });
    var HIP = 0.79, L1 = 0.36, L2 = 0.37, ANK = 0.06;
    var hips = new THREE.Group(); hips.position.y = HIP; body.add(hips); var torso = new THREE.Group(); torso.position.y = HIP; body.add(torso);
    function leg(side) { var piv = new THREE.Group(); piv.position.set(0.072 * side, 0, 0); hips.add(piv); var PM = cas ? C.jean : C.pants;
      piv.add(M(lat(cas ? [[0.001, 0.035], [0.063, 0.035], [0.066, -0.05], [0.06, -0.2], [0.052, -0.33], [0.049, -0.365], [0.001, -0.37]] : [[0.001, 0.03], [0.062, 0.03], [0.064, -0.06], [0.058, -0.2], [0.052, -0.33], [0.05, -0.365], [0.001, -0.37]], 26), PM));
      var knee = new THREE.Group(); knee.position.y = -L1; piv.add(knee); knee.add(M(lat(cas ? [[0.001, 0.014], [0.049, 0.01], [0.048, -0.12], [0.046, -0.25], [0.047, -0.3], [0.048, -0.322], [0.001, -0.326]] : [[0.001, 0.012], [0.05, 0.008], [0.049, -0.12], [0.052, -0.26], [0.058, -0.33], [0.06, -0.35], [0.001, -0.355]], 24), PM));
      if (cas) { knee.add(M(lat([[0.0475, -0.296], [0.0535, -0.3], [0.0535, -0.326], [0.0475, -0.33]], 24), C.jean, 0.001)); /* the turn-up at the ankle, the ankle above the sneaker */ knee.add(M(lat([[0.001, -0.31], [0.032, -0.31], [0.029, -0.35], [0.03, -0.372], [0.001, -0.375]], 14), C.skin, false)); }
      var foot = new THREE.Group(); foot.position.y = -L2; knee.add(foot); var sh = M(LUNA.rbox(0.078, 0.06, 0.22, 0.026, 4), C.shoe, 0.0026); sh.position.set(0, -0.03, 0.045); foot.add(sh); var so = M(LUNA.rbox(0.082, 0.022, 0.226, 0.009, 2), C.sole, 0.002); so.position.set(0, -0.061, 0.045); foot.add(so);
      if (cas) { var tg2 = M(LUNA.rbox(0.05, 0.012, 0.07, 0.005, 2), T(0xe8e6e0), false); tg2.position.set(0, 0.002, 0.06); tg2.rotation.x = -0.25; foot.add(tg2); /* the tongue and the laces */ for (var lc = 0; lc < 3; lc++) { var lz = M(new THREE.BoxGeometry(0.044, 0.003, 0.005), T(0xf8f8f6), false); lz.position.set(0, -0.004 + lc * 0.004, 0.085 - lc * 0.016); lz.rotation.x = -0.3; foot.add(lz); } }
      return { piv: piv, knee: knee, foot: foot }; }
    var legL = leg(1), legR = leg(-1), armL, armR;
    if (!cas) {
      var JP = [[0.001, -0.11], [0.138, -0.11], [0.136, -0.04], [0.124, 0.08], [0.13, 0.2], [0.142, 0.31], [0.138, 0.385], [0.106, 0.426], [0.05, 0.444], [0.001, 0.446]], RJ = profR(JP.slice(1, -1));
      var jg = lat(JP, 48); jg.scale(1, 1, 0.68); torso.add(M(jg, C.suit));
      var VW = function (y) { return 0.004 + 0.042 * sstep(0.2, 0.42, y); }, LW = function (y) { return y < 0.37 ? 0.015 + 0.022 * sstep(0.19, 0.37, y) : y < 0.386 ? 0.037 - 0.017 * sstep(0.37, 0.386, y) : 0.02 - 0.006 * sstep(0.386, 0.44, y); };
      torso.add(M(panel(RJ, 0.68, 0.19, 0.444, function (y) { return -VW(y) - 0.003; }, function (y) { return VW(y) + 0.003; }, 0.0012, 10, 26), C.knit, false));
      [1, -1].forEach(function (s) { torso.add(M(panel(RJ, 0.68, 0.18, 0.44, function (y) { return s > 0 ? VW(y) : -VW(y) - LW(y); }, function (y) { return s > 0 ? VW(y) + LW(y) : -VW(y); }, 0.0032, 6, 30), C.lap, 0.0011)); });
      var nk = M(new THREE.TorusGeometry(0.034, 0.004, 6, 24, Math.PI), C.knit, false); nk.position.set(0, 0.438, 0.012); nk.rotation.set(-Math.PI / 2 + 0.25, 0, Math.PI); torso.add(nk);
      var bt = M(new THREE.CylinderGeometry(0.005, 0.005, 0.003, 12).rotateX(Math.PI / 2), T(0x0e0e10), false); bt.position.set(0, 0.165, 0.68 * RJ(0.165) + 0.002); torso.add(bt);
      var strap = M(tube([[-0.1, 0.41, 0.075], [-0.02, 0.3, 0.098], [0.08, 0.16, 0.097], [0.13, 0.05, 0.075]], 0.004, 0.004, { seg: 16, rad: 5 }), C.bag, false); torso.add(strap); var strapB = M(tube([[-0.1, 0.41, -0.06], [0.0, 0.25, -0.088], [0.13, 0.05, -0.07]], 0.004, 0.004, { seg: 12, rad: 5 }), C.bag, false); torso.add(strapB);
      var bag = M(LUNA.rbox(0.11, 0.085, 0.04, 0.014, 3), C.bag, 0.0016); bag.position.set(0.148, 0.02, 0.03); bag.rotation.y = 0.5; torso.add(bag); var flap = M(LUNA.rbox(0.104, 0.04, 0.006, 0.006, 2), T(0x8e5c30), false); flap.position.set(0.152, 0.044, 0.052); flap.rotation.y = 0.5; torso.add(flap);
      var arm = function (side) { var sh = new THREE.Group(); sh.position.set(0.142 * side, 0.385, 0); torso.add(sh);
        var cap = M(new THREE.SphereGeometry(0.046, 22, 14), C.suit); cap.scale.set(0.9, 0.72, 0.88); cap.position.set(0.134 * side, 0.375, 0); torso.add(cap);
        sh.add(M(lat([[0.001, 0.03], [0.044, 0.02], [0.042, -0.14], [0.038, -0.255], [0.001, -0.26]], 22), C.suit));
        var el = new THREE.Group(); el.position.y = -0.255; sh.add(el); el.add(M(lat([[0.001, 0.014], [0.04, 0.01], [0.037, -0.12], [0.033, -0.19], [0.001, -0.195]], 20), C.suit)); el.add(M(lat([[0.001, -0.18], [0.023, -0.18], [0.022, -0.218], [0.001, -0.22]], 14), C.skin));
        var wr = new THREE.Group(); wr.position.y = -0.218; el.add(wr); var hd = hand(side, C.skin); hd.scale.setScalar(0.86); wr.add(hd);
        if (side > 0) { var band = M(new THREE.TorusGeometry(0.026, 0.004, 8, 26), C.watch, 0.0008); band.rotation.x = Math.PI / 2; band.scale.set(1, 1.2, 1); band.position.y = 0.008; wr.add(band); var cs = M(LUNA.rbox(0.008, 0.026, 0.022, 0.004, 2), C.watch, 0.0008); cs.position.set(0.027, 0.008, 0); wr.add(cs); var sc = M(new THREE.PlaneGeometry(0.018, 0.015), C.screen, false); sc.position.set(0.0315, 0.008, 0); sc.rotation.y = Math.PI / 2; wr.add(sc); }
        else { var cupG = new THREE.Group(); cupG.position.set(-0.012, -0.075, 0.03); wr.add(cupG); cupG.add(M(new THREE.CylinderGeometry(0.03, 0.024, 0.1, 18), C.cup, 0.0012)); var sl = M(new THREE.CylinderGeometry(0.0305, 0.0275, 0.04, 18, 1, true), T(0x8e6a3e), false); cupG.add(sl); var lid = M(new THREE.CylinderGeometry(0.031, 0.031, 0.008, 18), C.lid, 0.001); lid.position.y = 0.054; cupG.add(lid); }
        return { sh: sh, el: el, wr: wr, hand: hd }; };
      armL = arm(1); armR = arm(-1);
    } else {
      /* the jeans at the hips: the seat, the waistband (a darker blue), the copper button */
      var HP = [[0.001, -0.092], [0.085, -0.09], [0.117, -0.062], [0.125, -0.012], [0.124, 0.035], [0.122, 0.058], [0.001, 0.06]], hg2 = lat(HP, 36); hg2.scale(1, 1, 0.68); hips.add(M(hg2, C.jean));
      var wb = lat([[0.1225, 0.032], [0.1265, 0.034], [0.1265, 0.061], [0.1225, 0.063]], 36); wb.scale(1, 1, 0.68); hips.add(M(wb, C.band, 0.001));
      var cb2 = M(new THREE.CylinderGeometry(0.0046, 0.0046, 0.003, 14).rotateX(Math.PI / 2), C.copper, false); cb2.position.set(0, 0.047, 0.68 * 0.1265 + 0.0016); hips.add(cb2);
      /* the black top, tucked in; its crew neck */ var TP = [[0.001, 0.0], [0.121, 0.0], [0.119, 0.06], [0.112, 0.12], [0.121, 0.21], [0.129, 0.29], [0.127, 0.365], [0.102, 0.415], [0.058, 0.434], [0.036, 0.438], [0.001, 0.44]], tg = lat(TP, 44); tg.scale(1, 1, 0.68); torso.add(M(tg, C.top));
      var cn = lat([[0.039, 0.428], [0.0445, 0.431], [0.0435, 0.441], [0.038, 0.443]], 28); cn.scale(1, 1, 0.82); torso.add(M(cn, C.top, false));
      /* the cardigan: the open shell, the ribbed hem, the front bands round the back of the neck, the buttons, the pockets */
      var CP = [[0.148, -0.07], [0.142, -0.025], [0.132, 0.055], [0.125, 0.12], [0.132, 0.21], [0.14, 0.29], [0.141, 0.36], [0.119, 0.408], [0.082, 0.432], [0.062, 0.441]], RC = profR(CP), SZ = 0.68;
      var gap = function (y) { return 0.4 + 0.06 * sstep(0.0, -0.07, y) + 0.24 * sstep(0.27, 0.38, y) + 0.42 * sstep(0.38, 0.441, y); };
      torso.add(M(openShell(RC, -0.07, 0.441, gap, SZ, 56, 40, 0), Object.assign(C.cardi, { side: THREE.DoubleSide }), 0.0014));
      torso.add(M(openShell(RC, -0.078, -0.044, function (y) { return gap(y) + 0.004; }, SZ, 56, 3, 0.0034), Object.assign(C.ribV, { side: THREE.DoubleSide }), 0.0011));
      var ePts = [], k2, top0 = gap(0.441);
      for (k2 = 0; k2 <= 18; k2++) { var y2 = -0.078 + (0.437 + 0.078) * k2 / 18, r2 = RC(Math.min(0.441, y2)) + 0.0042, a2 = gap(Math.min(0.441, y2)) + 0.005; ePts.push([Math.sin(a2) * r2, y2, Math.cos(a2) * r2 * SZ]); }
      for (k2 = 1; k2 < 12; k2++) { var a3 = top0 + 0.02 + (Math.PI * 2 - 2 * top0 - 0.04) * k2 / 12, r3 = 0.0665; ePts.push([Math.sin(a3) * r3, 0.444 + 0.003 * Math.sin(Math.PI * k2 / 12), Math.cos(a3) * r3 * 0.86]); }
      for (k2 = 18; k2 >= 0; k2--) { var y4 = -0.078 + (0.437 + 0.078) * k2 / 18, r4 = RC(Math.min(0.441, y4)) + 0.0042, a4 = gap(Math.min(0.441, y4)) + 0.005; ePts.push([-Math.sin(a4) * r4, y4, Math.cos(a4) * r4 * SZ]); }
      torso.add(M(tube(ePts, 0.0026, 0.0026, { seg: 150, rad: 6, flat: 6.2, up: function (t, P) { var k = sstep(0.405, 0.44, P.y) * 0.25; return V(P.x * (1 - k), k * 0.07, P.z / SZ * (1 - k)).normalize(); } }), C.ribB, 0.0009));
      [0.05, 0.125, 0.2, 0.275, 0.35].forEach(function (y) { var r5 = RC(y) + 0.0075, a5 = gap(y) + 0.005, b5 = M(new THREE.CylinderGeometry(0.0043, 0.0043, 0.0024, 14).rotateX(Math.PI / 2), C.btn, 0.0006); b5.position.set(Math.sin(a5) * r5, y, Math.cos(a5) * r5 * SZ); b5.rotation.y = Math.atan2(Math.sin(a5), Math.cos(a5) * SZ); torso.add(b5); });
      [1, -1].forEach(function (s) { /* a patch pocket: the shell's band between 0.66 and 1.12 rad on one side, a ribbed edge along its top */
        var keep = new THREE.BufferGeometry(), P2 = [], U2 = [], I2 = [], nu = 10, nv = 6, ii, jj; for (jj = 0; jj <= nv; jj++) { var yy = -0.04 + 0.102 * jj / nv, rr = RC(yy) + 0.0032; for (ii = 0; ii <= nu; ii++) { var aa = s * (0.66 + 0.46 * ii / nu); P2.push(Math.sin(aa) * rr, yy, Math.cos(aa) * rr * SZ); U2.push(ii / nu * 0.45, jj / nv * 0.3); } }
        for (jj = 0; jj < nv; jj++) for (ii = 0; ii < nu; ii++) { var q0 = jj * (nu + 1) + ii, q1 = q0 + 1, q2 = q0 + nu + 1, q3 = q2 + 1; if (s > 0) I2.push(q0, q1, q2, q1, q3, q2); else I2.push(q0, q2, q1, q1, q2, q3); }
        keep.setAttribute('position', new THREE.Float32BufferAttribute(P2, 3)); keep.setAttribute('uv', new THREE.Float32BufferAttribute(U2, 2)); keep.setIndex(I2); keep.computeVertexNormals(); torso.add(M(keep, C.cardiS, 0.0009));
        var pT = []; for (ii = 0; ii <= 8; ii++) { var ab = s * (0.66 + 0.46 * ii / 8), rb = RC(0.06) + 0.0046; pT.push([Math.sin(ab) * rb, 0.06, Math.cos(ab) * rb * SZ]); } torso.add(M(tube(pT, 0.0022, 0.0022, { seg: 16, rad: 5, flat: 3.4, up: function (t, P) { return V(P.x, 0, P.z / SZ).normalize(); } }), C.ribB, false)); });
      var arm2 = function (side) { var sh = new THREE.Group(); sh.position.set(0.142 * side, 0.385, 0); torso.add(sh);
        var cap = M(new THREE.SphereGeometry(0.048, 22, 14), C.cardiP); cap.scale.set(0.92, 0.74, 0.9); cap.position.set(0.134 * side, 0.374, 0); torso.add(cap);
        sh.add(M(lat([[0.001, 0.032], [0.047, 0.022], [0.046, -0.1], [0.043, -0.2], [0.041, -0.255], [0.001, -0.26]], 22), C.cardiS));
        var el = new THREE.Group(); el.position.y = -0.255; sh.add(el); el.add(M(lat([[0.001, 0.014], [0.043, 0.01], [0.041, -0.08], [0.039, -0.13], [0.041, -0.155], [0.0405, -0.163], [0.001, -0.167]], 20), C.cardiS));
        el.add(M(lat([[0.0345, -0.156], [0.0378, -0.16], [0.0362, -0.2], [0.0326, -0.206]], 22), Object.assign(C.ribC, { side: THREE.DoubleSide }), 0.0009)); el.add(M(lat([[0.001, -0.185], [0.022, -0.185], [0.0215, -0.218], [0.001, -0.22]], 14), C.skin, false));
        var wr = new THREE.Group(); wr.position.y = -0.218; el.add(wr); var hd = hand(side, C.skin); hd.scale.setScalar(0.86); wr.add(hd);
        if (side > 0) { /* the smartwatch: a black band, the square case on the back of the wrist, its dark screen (a faint glow at night) */ var band = M(new THREE.TorusGeometry(0.0238, 0.0036, 8, 28), C.watch, 0.0007); band.rotation.x = Math.PI / 2; band.scale.set(1, 1.18, 1); band.position.y = -0.003; wr.add(band);
          var cs = M(LUNA.rbox(0.009, 0.031, 0.026, 0.0042, 3), C.watch, 0.0007); cs.position.set(0.0255, -0.003, 0); wr.add(cs); var sc = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.017), C.screen); sc.position.set(0.0302, -0.003, 0); sc.rotation.y = Math.PI / 2; wr.add(sc);
          var cr = M(new THREE.CylinderGeometry(0.0022, 0.0022, 0.003, 10), C.watch, false); cr.position.set(0.025, -0.003, 0.0145); cr.rotation.x = Math.PI / 2; wr.add(cr); }
        return { sh: sh, el: el, wr: wr, hand: hd }; };
      armL = arm2(1); armR = arm2(-1);
    }
    var neck = new THREE.Group(); neck.position.y = 0.44; torso.add(neck); neck.add(M(lat([[0.001, -0.02], [0.036, -0.02], [0.032, 0.03], [0.03, 0.07], [0.03, 0.1], [0.001, 0.105]], 22), C.skin));
    var head = new THREE.Group(); head.position.set(0, 0.132, 0.01); neck.add(head); var hgeo = headGeo(); head.add(M(hgeo, C.skin, 0.0024));
    var fk = 'olc' + (opt.seed || 0), fo = { draw: faceDrawF2 }; var fm = LUNA.faceMat(LUNA.faceTex('open', fk, fo)); var face = new THREE.Mesh(LUNA.faceDecal(hgeo), fm); face.renderOrder = 2; head.add(face);
    [1, -1].forEach(function (s) { var eg = new THREE.Group(); eg.position.set(s * 0.061, -0.012, -0.008); eg.rotation.set(0, s * 0.3, s * -0.06); head.add(eg); var shell = M(new THREE.SphereGeometry(1, 20, 14), C.skin, 0.0014); shell.scale.set(0.006, 0.023, 0.014); shell.position.x = s * 0.003; eg.add(shell); var stud = M(new THREE.SphereGeometry(0.0035, 8, 6), C.gold, false); stud.position.set(s * 0.008, -0.018, 0.004); eg.add(stud); });
    hairBuild(head, 'casual');
    var A = { root: root, body: body, hips: hips, torso: torso, neck: neck, head: head, face: face, faceMat: fm, legL: legL, legR: legR, armL: armL, armR: armR, tails: [], coll: [], L1: L1, L2: L2, A1: 0.255, A2: 0.218, ank: ANK, footX: 0.078, kind: 'person', fk: fk, fo: fo, hip: HIP, sock: { w: new THREE.Group() }, gear: {}, out: { a: [] }, outfit: 'a',
      t: Math.random() * 10, phase: 0, speed: 0, mode: 'idle', modeT: 0, blinkT: 2 + Math.random() * 3, blink: 0, expr: 'open', exprHold: 0, yawPrev: 0, vPrev: 0, jumpY: 0, squash: 0, isOL: true, look: cas ? 'casual' : 'suit' };
    root.traverse(function (o) { if (o.isMesh && !o.userData.ink) { o.castShadow = true; } }); LUNA.curvedAll(root); root.userData.A = A; if (opt.bake !== false) bake(A); useProf('max'); return A; }

  /* ---------- (v43) the bake: the parts that ride on the same joint and share a look become one mesh ----------
     The rig keeps its joints (they move); under each joint the parts merge by look: solid toon colours become the vertex colours of one
     toon material (one per side), textured parts merge per texture, the ink hulls per outline width (each part's width carried through its
     own scale, so the lines look as they did). Shapes and shading are unchanged; the draw calls fall from hundreds to a few dozen. */
  function mergeGeo(list, uv, cm) { var P = [], N = [], C = [], UV = [], IX = [], base = 0, v = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3(), c = new THREE.Color();
    list.forEach(function (q) { var g = q.g, pa = g.attributes.position, na = g.attributes.normal, ca = g.attributes.color, ta = g.attributes.uv, cnt = pa.count, i; if (!na) { g = g.clone(); g.computeVertexNormals(); na = g.attributes.normal; }
      nm.getNormalMatrix(q.M); var flip = q.M.determinant() < 0;
      for (i = 0; i < cnt; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(q.M); P.push(v.x, v.y, v.z); n.fromBufferAttribute(na, i).applyMatrix3(nm).normalize(); N.push(n.x, n.y, n.z);
        if (cm === 1) { if (q.vc && ca) c.fromBufferAttribute(ca, i).multiply(q.col); else c.copy(q.col); C.push(c.r, c.g, c.b); } else if (cm === 2) { if (ca) C.push(ca.getX(i), ca.getY(i), ca.getZ(i)); else C.push(1, 1, 1); }
        if (uv) { if (ta) UV.push(ta.getX(i), ta.getY(i)); else UV.push(0, 0); } }
      if (g.index) { var ix = g.index.array; for (i = 0; i < ix.length; i += 3) { if (flip) IX.push(ix[i] + base, ix[i + 2] + base, ix[i + 1] + base); else IX.push(ix[i] + base, ix[i + 1] + base, ix[i + 2] + base); } }
      else for (i = 0; i < cnt; i += 3) { if (flip) IX.push(base + i, base + i + 2, base + i + 1); else IX.push(base + i, base + i + 1, base + i + 2); }
      base += cnt; });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); if (cm) g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    g.setIndex(base > 65535 ? new THREE.Uint32BufferAttribute(IX, 1) : new THREE.Uint16BufferAttribute(IX, 1)); g.computeBoundingSphere(); return g; }
  var BMATS = {};
  function bake(A) { var root = A.root; root.updateMatrixWorld(true);
    var J = [A.body, A.hips, A.torso, A.neck, A.head, A.legL.piv, A.legL.knee, A.legL.foot, A.legR.piv, A.legR.knee, A.legR.foot, A.armL.sh, A.armL.el, A.armL.wr, A.armR.sh, A.armR.el, A.armR.wr].filter(Boolean), isJ = new Set(J);
    var st = { calls0: 0, calls1: 0, tris0: 0, tris1: 0 }, inks = [];
    function tris(g) { return (g.index ? g.index.count : g.attributes.position.count) / 3; }
    root.traverse(function (o) { if (o.isMesh && o.visible) { st.calls0++; st.tris0 += tris(o.geometry); } });
    J.forEach(function (j) { var inv = new THREE.Matrix4().copy(j.matrixWorld).invert(), B = {}, I = {}, dead = [];
      (function walk(o) { o.children.slice().forEach(function (c) { if (isJ.has(c) || c.userData.keep) return; if (c.isMesh) take(c); if (c.children.length) walk(c); }); })(j);
      function take(m) { var mat = m.material; if (Array.isArray(mat) || m === A.face || m.renderOrder > 0 || !m.geometry.attributes.position || !m.visible) return; var Mx = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
        if (m.userData.ink) { var w = (mat.userData.w || 0.005) * Math.cbrt(Math.abs(Mx.determinant())), wk = Math.max(0.0004, Math.round(w / 0.0001) * 0.0001).toFixed(4); (I[wk] = I[wk] || []).push({ g: m.geometry, M: Mx }); dead.push(m); return; }
        var em = mat.emissive && (mat.emissive.r + mat.emissive.g + mat.emissive.b) > 0, key = mat.isMeshToonMaterial && !mat.transparent && !em ? (mat.map ? 'map:' + mat.map.uuid : 'vc') + '|' + mat.side : 'm:' + mat.uuid;
        (B[key] = B[key] || { mat: mat, list: [] }).list.push({ g: m.geometry, M: Mx, col: mat.color, vc: !!mat.vertexColors, uv: !!mat.map, cast: m.castShadow }); dead.push(m); }
      Object.keys(B).forEach(function (k) { var b = B[k], own = k.indexOf('m:') === 0, uv = b.list.some(function (q) { return q.uv; }), g = mergeGeo(b.list, uv, own ? (b.mat.vertexColors ? 2 : 0) : 1);
        var mat = own ? b.mat : (BMATS[k] || (BMATS[k] = LUNA.toon(0xffffff, { vc: true, map: b.mat.map || undefined, side: b.mat.side, rim: 0.2 })));
        var mesh = new THREE.Mesh(g, mat); mesh.castShadow = b.list.some(function (q) { return q.cast; }); j.add(mesh); });
      Object.keys(I).forEach(function (wk) { var h = new THREE.Mesh(mergeGeo(I[wk], false, 0), LUNA.ink(+wk)); h.renderOrder = -1; h.userData.ink = true; h.castShadow = false; j.add(h); inks.push(h); });
      dead.forEach(function (m) { var p = m.parent; p.remove(m); while (p && p !== j && !p.children.length && !isJ.has(p)) { var pp = p.parent; pp.remove(p); p = pp; } }); });
    root.traverse(function (o) { if (o.isMesh && o.visible) { st.calls1++; st.tris1 += tris(o.geometry); } }); LUNA.curvedAll(root); A.inks = inks; A.bake = st; return st; }
  /* the outline is drawn only where it reads: near, every line; beyond ~16 m the ink hulls rest (a pixel or less at that distance) */
  function lod(A, d) { var on = d < 16; if (A.inkOn === on || !A.inks) return; A.inkOn = on; A.inks.forEach(function (h) { h.visible = on; }); }
  /* ---------- the build ---------- */
  function build(opt) { opt = opt || {}; useProf('max'); var root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.userData.kind = 'person';
    var C = { skin: T(0xe4b99c), hair: T(0x17110d, { rim: 0.2 }), shirt: T(0x3c3e44), pants: T(0x4c4f55), shoe: T(0x221d1a, { rim: 0.25 }), sole: T(0x3a3430), frame: T(0x6b4a33, { rim: 0.3 }), metal: T(0x2f2c2b, { rim: 0.45 }), steel: T(0xc9cdd3, { rim: 0.5 }), dial: T(0xf4f1ea), jacket: T(0x1d1d21, { rim: 0.16 }), shirt2: T(0xc3c6ca), lip: T(0xd8a08e) };
    var lensM = new THREE.MeshBasicMaterial({ color: 0xdbe8f0, transparent: true, opacity: 0.12, depthWrite: false });
    var HIP = 0.82, L1 = 0.38, L2 = 0.38, ANK = 0.06, joints = [];
    var hips = new THREE.Group(); hips.position.y = HIP; body.add(hips); var torso = new THREE.Group(); torso.position.y = HIP; body.add(torso);
    var OUT = { shirt: [], jacket: [] }; function outfit(key, grp) { OUT[key].push(grp); return grp; }
    /* the legs: dark grey trousers with a soft break over the shoes */
    function leg(side) { var piv = new THREE.Group(); piv.position.set(0.082 * side, 0, 0); hips.add(piv);
      piv.add(M(lat([[0.001, 0.03], [0.066, 0.03], [0.07, -0.06], [0.066, -0.2], [0.056, -0.33], [0.053, -0.385], [0.001, -0.39]], 28), C.pants));
      var knee = new THREE.Group(); knee.position.y = -L1; piv.add(knee);
      knee.add(M(lat([[0.001, 0.012], [0.054, 0.008], [0.05, -0.12], [0.046, -0.26], [0.047, -0.33], [0.05, -0.355], [0.001, -0.36]], 26), C.pants));
      var foot = new THREE.Group(); foot.position.y = -L2; knee.add(foot);
      var sh = M(LUNA.rbox(0.088, 0.058, 0.24, 0.028, 4), C.shoe, 0.003); sh.position.set(0, -0.032, 0.05); foot.add(sh); var so = M(LUNA.rbox(0.09, 0.012, 0.245, 0.006, 2), C.sole, 0.002); so.position.set(0, -0.058, 0.05); foot.add(so);
      joints.push(piv, knee, foot); return { piv: piv, knee: knee, foot: foot }; }
    var legL = leg(1), legR = leg(-1);
    /* the shirt: charcoal, untucked, the spread collar open at the neck, a covered placket */
    var shirtG = outfit('shirt', new THREE.Group()); torso.add(shirtG);
    var TP = [[0.001, -0.085], [0.158, -0.085], [0.155, -0.02], [0.144, 0.1], [0.152, 0.22], [0.164, 0.33], [0.158, 0.4], [0.12, 0.445], [0.055, 0.468], [0.001, 0.47]], RT = profR(TP.slice(1, -1));
    var tg = lat(TP, 48); tg.scale(1, 1, 0.66); shirtG.add(M(tg, C.shirt));
    shirtG.add(M(new THREE.BoxGeometry(0.012, 0.47, 0.004), T(0x34363b), false).translateY(0.18).translateZ(0.1035));
    var collar = function (mat, grp) { [1, -1].forEach(function (s) { var cw = LUNA.taper(new THREE.CatmullRomCurve3([V(s * 0.012, 0.462, 0.052), V(s * 0.045, 0.468, 0.034), V(s * 0.062, 0.462, 0.0), V(s * 0.05, 0.46, -0.04), V(s * 0.02, 0.464, -0.052)]), 18, 6, function (t) { return 0.012 - 0.002 * t; }, { flat: 0.35 }); grp.add(M(cw, mat, 0.002)); }); };
    collar(C.shirt, shirtG);
    /* the open top button: a narrow V of skin; the spread collar's points lying on the chest */
    shirtG.add(M(panel(RT, 0.66, 0.428, 0.466, function (y) { return -0.002 - 0.015 * sstep(0.428, 0.462, y); }, function (y) { return 0.002 + 0.015 * sstep(0.428, 0.462, y); }, 0.0012, 4, 8), C.skin, false));
    [1, -1].forEach(function (s) { var tipY = 0.408, tipX = s * 0.042; shirtG.add(M(panel(RT, 0.66, tipY, 0.466, function (y) { var a = lerpY(y, tipY, 0.466, tipX, s * 0.016), b = lerpY(y, tipY, 0.46, tipX, s * 0.066); return Math.min(a, b); }, function (y) { var a = lerpY(y, tipY, 0.466, tipX, s * 0.016), b = lerpY(y, tipY, 0.46, tipX, s * 0.066); return Math.max(a, b); }, 0.0026, 6, 12), C.shirt, 0.0011)); });
    /* the cool-weather look: the black jacket open over a light grey shirt, notched lapels, the shirt's collar points over them */
    var jackG = outfit('jacket', new THREE.Group()); torso.add(jackG);
    var JP = [[0.001, -0.13], [0.164, -0.13], [0.162, -0.04], [0.152, 0.1], [0.162, 0.22], [0.174, 0.33], [0.17, 0.405], [0.13, 0.448], [0.06, 0.466], [0.001, 0.468]], RJ = profR(JP.slice(1, -1));
    var jg = lat(JP, 48); jg.scale(1, 1, 0.66); jackG.add(M(jg, C.jacket));
    collar(C.shirt2, jackG);
    var VW = function (y) { return 0.004 + 0.05 * sstep(0.2, 0.445, y); }, LW = function (y) { return y < 0.385 ? 0.018 + 0.027 * sstep(0.19, 0.385, y) : y < 0.402 ? 0.045 - 0.021 * sstep(0.385, 0.402, y) : 0.024 - 0.008 * sstep(0.402, 0.462, y); };
    jackG.add(M(panel(RJ, 0.66, 0.192, 0.466, function (y) { return -VW(y) - 0.003; }, function (y) { return VW(y) + 0.003; }, 0.0012, 10, 26), C.shirt2, false));
    [0.25, 0.31, 0.37].forEach(function (y) { var b = M(new THREE.CylinderGeometry(0.0042, 0.0042, 0.002, 12).rotateX(Math.PI / 2), T(0xa9adb2), false); b.position.set(0, y, 0.66 * RJ(y) + 0.0025); jackG.add(b); });
    var LAP = T(0x26262b, { rim: 0.22 }); [1, -1].forEach(function (s) { jackG.add(M(panel(RJ, 0.66, 0.19, 0.462, function (y) { return s > 0 ? VW(y) : -VW(y) - LW(y); }, function (y) { return s > 0 ? VW(y) + LW(y) : -VW(y); }, 0.0034, 6, 30), LAP, 0.0012));
      var tipY = 0.415, tipX = s * 0.036; jackG.add(M(panel(RJ, 0.66, tipY, 0.466, function (y) { var a = lerpY(y, tipY, 0.466, tipX, s * 0.012), b = lerpY(y, tipY, 0.462, tipX, s * 0.056); return Math.min(a, b); }, function (y) { var a = lerpY(y, tipY, 0.466, tipX, s * 0.012), b = lerpY(y, tipY, 0.462, tipX, s * 0.056); return Math.max(a, b); }, 0.0052, 6, 10), C.shirt2, 0.001)); });
    [0.17, 0.07].forEach(function (y) { var b = M(new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 12).rotateX(Math.PI / 2), T(0x111114), false); b.position.set(0.0, y, 0.66 * RJ(y) + 0.002); jackG.add(b); });
    /* the arms: short sleeves over bare forearms, or the jacket's long sleeves with grey cuffs; the watch on the left wrist */
    function arm(side) { var sh = new THREE.Group(); sh.position.set(0.168 * side, 0.405, 0); torso.add(sh);
      var cap = M(new THREE.SphereGeometry(0.05, 24, 16), C.shirt); cap.scale.set(0.88, 0.7, 0.86); shirtG.add(cap); cap.position.set(0.156 * side, 0.392, 0); /* the shoulder under the shirt */
      var jcap = M(new THREE.SphereGeometry(0.054, 24, 16), C.jacket); jcap.scale.set(0.9, 0.7, 0.88); jcap.position.set(0.158 * side, 0.394, 0); jackG.add(jcap);
      var upS = outfit('shirt', new THREE.Group()); sh.add(upS); upS.add(M(lat([[0.001, 0.03], [0.049, 0.02], [0.05, -0.09], [0.047, -0.155], [0.001, -0.157]], 24), C.shirt)); upS.add(M(lat([[0.001, -0.12], [0.039, -0.13], [0.036, -0.27], [0.001, -0.272]], 18), C.skin));
      var upJ = outfit('jacket', new THREE.Group()); sh.add(upJ); upJ.add(M(lat([[0.001, 0.03], [0.053, 0.02], [0.051, -0.14], [0.046, -0.27], [0.001, -0.275]], 24), C.jacket));
      var el = new THREE.Group(); el.position.y = -0.27; sh.add(el);
      var loS = outfit('shirt', new THREE.Group()); el.add(loS); loS.add(M(lat([[0.001, 0.012], [0.036, 0.008], [0.033, -0.12], [0.027, -0.225], [0.001, -0.235]], 18), C.skin));
      var loJ = outfit('jacket', new THREE.Group()); el.add(loJ); loJ.add(M(lat([[0.001, 0.015], [0.05, 0.01], [0.046, -0.13], [0.043, -0.205], [0.001, -0.21]], 22), C.jacket)); loJ.add(M(lat([[0.001, -0.19], [0.032, -0.19], [0.031, -0.222], [0.001, -0.224]], 16), C.shirt2)); loJ.add(M(lat([[0.001, -0.19], [0.026, -0.2], [0.026, -0.235], [0.001, -0.237]], 14), C.skin));
      var wr = new THREE.Group(); wr.position.y = -0.235; el.add(wr); var hd = hand(side, C.skin); wr.add(hd);
      if (side > 0) { var band = M(new THREE.TorusGeometry(0.029, 0.0055, 8, 28), C.steel, 0.0012); band.rotation.x = Math.PI / 2; band.scale.set(1, 1.25, 1); band.position.y = 0.012; wr.add(band); var cs = M(new THREE.CylinderGeometry(0.0145, 0.0145, 0.007, 24).rotateZ(Math.PI / 2), C.steel, 0.0012); cs.position.set(0.031, 0.012, 0); wr.add(cs); var dl = M(new THREE.CircleGeometry(0.0118, 24), C.dial, false); dl.position.set(0.0348, 0.012, 0); dl.rotation.y = Math.PI / 2; wr.add(dl);
        [[0, 0.0085], [0.0045, 0.002]].forEach(function (q, k) { var hn = M(new THREE.BoxGeometry(0.0006, 0.0006, k ? 0.006 : 0.0085), T(0x222222), false); hn.position.set(0.0352, 0.012 + q[1] * 0.3, q[0]); hn.rotation.x = k ? 1.1 : -0.4; wr.add(hn); }); }
      joints.push(sh, el, wr); return { sh: sh, el: el, wr: wr, hand: hd }; }
    var armL = arm(1), armR = arm(-1);
    /* the neck and the head */
    var neck = new THREE.Group(); neck.position.y = 0.462; torso.add(neck); neck.add(M(lat([[0.001, -0.02], [0.045, -0.02], [0.04, 0.03], [0.037, 0.07], [0.036, 0.1], [0.001, 0.105]], 24), C.skin));
    var head = new THREE.Group(); head.position.set(0, 0.14, 0.01); neck.add(head); var hg = headGeo(); head.add(M(hg, C.skin, 0.0026));
    var fk = 'max' + (opt.seed || 0), fo = { draw: faceDraw }; var fm = LUNA.faceMat(LUNA.faceTex('open', fk, fo)); var face = new THREE.Mesh(LUNA.faceDecal(hg), fm); face.renderOrder = 2; head.add(face);
    [1, -1].forEach(function (s) { /* the ears: the shell, the rim of the helix from the top round to the lobe, the hollow of the concha */
      var eg = new THREE.Group(); eg.position.set(s * 0.066, -0.01, -0.008); eg.rotation.set(0, s * 0.3, s * -0.06); head.add(eg);
      var shell = M(new THREE.SphereGeometry(1, 24, 18), C.skin, 0.0016); shell.scale.set(0.0068, 0.0262, 0.0158); shell.position.x = s * 0.003; eg.add(shell);
      var hpts = []; for (var k = 0; k <= 12; k++) { var th = 0.35 + k / 12 * 4.45; hpts.push([s * (0.0078 - 0.002 * Math.max(0, Math.sin(th))), 0.0245 * Math.sin(th) * (th > 3.5 ? 1.05 : 1), 0.0145 * Math.cos(th) - (th > 3.6 ? 0.002 : 0)]); }
      eg.add(M(tube(hpts, function (t) { return t > 0.85 ? 0.0034 + (t - 0.85) * 0.03 : 0.0026; }, 0, { seg: 40, rad: 8, flat: 0.7 }), C.skin, 0.0011));
      var cm = new THREE.Mesh(new THREE.CircleGeometry(1, 24), T(0xd9a58c)); cm.scale.set(0.0085, 0.0115, 1); cm.position.set(s * 0.0072, -0.002, 0.002); cm.rotation.y = s * Math.PI / 2; eg.add(cm); });
    hairBuild(head);
    /* the glasses: thin warm tortoiseshell with the shirt (the stage photograph), thin dark metal with the jacket (the portrait) */
    head.add(outfit('shirt', glasses(C.frame, lensM, 0.00105))); head.add(outfit('jacket', glasses(C.metal, lensM, 0.0008)));
    var sockW = new THREE.Group(); sockW.position.set(0, -0.06, 0.01); armR.wr.add(sockW);
    var A = { root: root, body: body, hips: hips, torso: torso, neck: neck, head: head, face: face, faceMat: fm, legL: legL, legR: legR, armL: armL, armR: armR, tails: [], coll: [], L1: L1, L2: L2, A1: 0.27, A2: 0.235, ank: ANK, footX: 0.088, kind: 'person', fk: fk, fo: fo, hip: HIP, sock: { w: sockW }, gear: {}, out: OUT, outfit: null,
      t: Math.random() * 10, phase: 0, speed: 0, mode: 'idle', modeT: 0, blinkT: 2 + Math.random() * 3, blink: 0, expr: 'open', exprHold: 0, yawPrev: 0, vPrev: 0, jumpY: 0, squash: 0, isMax: true };
    root.traverse(function (o) { if (o.isMesh && !o.userData.ink) { o.castShadow = true; } }); LUNA.curvedAll(root); setOutfit(A, opt.outfit || 'shirt'); root.userData.A = A; return A; }
  /* warm weather: the shirt; at 20 °C and below: the jacket */
  function setOutfit(A, key) { if (A.outfit === key) return; A.outfit = key; Object.keys(A.out).forEach(function (k) { A.out[k].forEach(function (g) { g.visible = k === key; }); }); }
  return { build: build, buildOL: buildOL, setOutfit: setOutfit, faceDraw: faceDraw, bake: bake, lod: lod };
})();


