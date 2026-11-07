/* ===== [engine_wp_micro.js] WPMicro: the coating interface at micro scale ===== */
/* ===== Waterproofing materials – mineral-based, micro scale =====
   A sectioned sample at the coating interface, seen from above at an angle: the skin of the concrete (or screed) with its pores and a fine
   crack, and what each step of the system adds on it. The layers are height surfaces over the sample; every one is left standing a little
   short of the one before, so the whole build-up remains visible side by side. In the last stage the crack of the substrate opens while a
   flexible coating stays closed above it (crack bridging); the rigid slurry of the inner application holds back the water pressing from the
   rear instead. Stages are the ones of WP_STAGES. Scale: 1 unit = 1/60 m (sample 40 × 27 mm), so 1 mm = 0.06 units. */
function WPMicro(scn) {
  var self = this, X = 1.2, Z = 0.8, BASE = -0.62, LIFT = -BASE + 0.02, trash = [], ST = WP_STAGES[scn];
  var NX = window.FAST3D ? 120 : SMALL3D ? 220 : 330, NZ = Math.round(NX * Z / X), n = NX * NZ, DX = 2 * X / (NX - 1), DZ = 2 * Z / (NZ - 1), RWp = THREE.RepeatWrapping, i, j, k;
  this.scn = scn; this.group = new THREE.Group(); this.group.position.y = LIFT;
  function keep(o) { trash.push(o); return o; }
  function hsh(ix, iy, s) { var q = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(s, 1442695041) | 0; q = Math.imul(q ^ (q >>> 13), 1274126177); q = q ^ (q >>> 16); return (q >>> 0) / 4294967296; }
  function vn(x, y, s) { var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), a = hsh(ix, iy, s), b = hsh(ix + 1, iy, s), c = hsh(ix, iy + 1, s), d = hsh(ix + 1, iy + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, oct, s) { var sum = 0, a = 0.5, f = 1, nn = 0, o; for (o = 0; o < oct; o++) { sum += a * vn(x * f, y * f, s + o * 7); nn += a; a *= 0.5; f *= 2.03; } return sum / nn; }
  var WD = 0, WID = 0;
  function wor(x, y, s) { var ix = Math.floor(x), iy = Math.floor(y), best = 9, a, b; for (b = -1; b <= 1; b++) for (a = -1; a <= 1; a++) { var cx = ix + a, cy = iy + b, px = cx + hsh(cx, cy, s) - x, py = cy + hsh(cx, cy, s + 1) - y, d = px * px + py * py; if (d < best) { best = d; WID = hsh(cx, cy, s + 2); } } WD = Math.sqrt(best); }
  function gx(q) { return -X + (q % NX) * DX; } function gz(q) { return -Z + Math.floor(q / NX) * DZ; }
  function sample(A, x, z) { var fx = clamp01((x + X) / (2 * X)) * (NX - 1), fz = clamp01((z + Z) / (2 * Z)) * (NZ - 1), ix = Math.min(NX - 2, Math.floor(fx)), iz = Math.min(NZ - 2, Math.floor(fz)), u = fx - ix, v = fz - iz, a = iz * NX + ix; return (A[a] * (1 - u) + A[a + 1] * u) * (1 - v) + (A[a + NX] * (1 - u) + A[a + NX + 1] * u) * v; }
  function blur(src, r, passes) { var a = Float32Array.from(src), b = new Float32Array(n), p, q, x, z, s2, m; for (p = 0; p < passes; p++) { for (z = 0; z < NZ; z++) { s2 = 0; m = 0; for (x = -r; x <= r; x++) { q = z * NX + Math.min(NX - 1, Math.max(0, x)); s2 += a[q]; m++; } for (x = 0; x < NX; x++) { b[z * NX + x] = s2 / m; var xo = x - r, xi2 = x + r + 1; s2 += a[z * NX + Math.min(NX - 1, xi2)] - a[z * NX + Math.max(0, xo)]; } } for (x = 0; x < NX; x++) { s2 = 0; m = 0; for (z = -r; z <= r; z++) { q = Math.min(NZ - 1, Math.max(0, z)) * NX + x; s2 += b[q]; m++; } for (z = 0; z < NZ; z++) { a[z * NX + x] = s2 / m; var zo = z - r, zi2 = z + r + 1; s2 += b[Math.min(NZ - 1, zi2) * NX + x] - b[Math.max(0, zo) * NX + x]; } } } return a; }

  /* ----- the substrate: paste with pores and aggregate, a fine crack across it; masonry (inner) has a mortar joint instead of the aggregate ----- */
  var inner = scn === 'inner', negc = scn === 'negc', neg = inner || negc, rigid = inner, park = scn === 'park', balcony = scn === 'balcony';
  var grains = inner ? [] : [[0.66, 0.34, 0.28, 0.24, 0.1], [-0.72, -0.5, 0.24, 0.2, 0.09], [0.1, -0.55, 0.2, 0.17, 0.07]];
  var pores = [], rr = lcg(313); for (i = 0; i < (balcony ? 22 : 30); i++) pores.push([(rr() - 0.5) * 2.3 * X, (rr() - 0.5) * 1.9 * Z, 0.04 + rr() * rr() * 0.16]);
  var CW = inner ? 0.028 : 0.03; // the crack as found (half width)
  function crackX(z) { return -0.32 + 0.05 * Math.sin(z * 4.1 + 0.7) + 0.025 * Math.sin(z * 9.3 + 2.1) + 0.012 * Math.sin(z * 21 + 1); }
  var H0 = new Float32Array(n), HO = new Float32Array(n), TONE = new Float32Array(n), GRN = new Float32Array(n), CRK = new Uint8Array(n), JNT = new Uint8Array(n);
  function field(open) { var H = open ? HO : H0, wmul = open ? 3.2 : 1;
    for (j = 0; j < NZ; j++) for (i = 0; i < NX; i++) {
      var x = -X + i * DX, z = -Z + j * DZ, q, g, p, h; k = j * NX + i;
      h = 0.004 + 0.045 * (fbm(x * 1.25 + 3.1, z * 1.25 + 1.7, 3, 11) - 0.5); var gm = 0.4 + 0.8 * smooth(clamp01((fbm(x * 1.9, z * 1.9, 2, 23) - 0.35) / 0.3)), gsm = 1;
      for (g = 0; g < grains.length; g++) { var ga = (x - grains[g][0]) / grains[g][2], gb = (z - grains[g][1]) / grains[g][3], g2 = ga * ga + gb * gb; if (g2 < 1) { var ge = Math.sqrt(1 - g2); h += grains[g][4] * ge * 0.25; gsm = Math.min(gsm, 1 - 0.86 * smooth(clamp01(ge * 2.6))); } }
      var glob = 0; wor(x * 6.5, z * 6.5, 31); q = WD / 0.78; if (q < 1) glob += 0.04 * Math.pow(1 - q * q, 0.6) * (0.55 + 0.9 * WID); var tone = WID;
      wor(x * 13, z * 13, 37); q = WD / 0.78; if (q < 1) glob += 0.022 * Math.pow(1 - q * q, 0.7) * (0.5 + WID);
      wor(x * 25, z * 25, 41); q = WD / 0.8; if (q < 1) glob += 0.01 * (1 - q * q) * (0.5 + WID);
      h += ((glob - 0.03) * gm - 0.026 * Math.abs(fbm(x * 4.2, z * 4.2, 3, 53) * 2 - 1) * gm) * gsm * (balcony ? 0.6 : 1);
      for (p = 0; p < pores.length; p++) { var pdx = x - pores[p][0], pdz = z - pores[p][1], pd = Math.sqrt(pdx * pdx + pdz * pdz) / pores[p][2]; if (pd < 1.12) h += (pd < 1 ? -0.95 * pores[p][2] * Math.sqrt(1 - pd * pd) : 0) + 0.01 * smooth(clamp01(1 - Math.abs(pd - 1) / 0.12)); }
      if (inner) { var jz = Math.abs(z - 0.28); if (jz < 0.11) { h -= 0.07 * (1 - jz / 0.11); JNT[k] = 1; } } // a bed joint of the masonry, raked a little
      var dcr = Math.abs(x - crackX(z)), t = (dcr + (fbm(x * 8, z * 8, 3, 61) - 0.5) * 0.03) / (CW * wmul); if (t < 1.4) { var kc = 1 - smooth(clamp01((t - 0.5) / 0.85)); h += (Math.min(h, -0.7) - h) * kc; if (t < 1.12 && !open) CRK[k] = 1; }
      H[k] = h; if (!open) { TONE[k] = tone; GRN[k] = Math.max(GRN[k], 1 - gsm); }
    } }
  field(false); field(true);
  var RB = Math.max(3, Math.round(NX / 56)), B0 = blur(H0, RB, 2);
  function shade(H, B, damaged) {
    var B2 = blur(H, Math.max(1, Math.round(RB / 3)), 1), c = new Float32Array(n * 3), q;
    for (q = 0; q < n; q++) {
      var cav = H[q] - B[q], ao = Math.max(0.14, Math.min(1.18, 0.74 + cav * 5.6 + (H[q] - B2[q]) * 16)), v = (inner ? 0.6 : balcony ? 0.7 : 0.64) * (1 + 0.16 * (TONE[q] - 0.5)) * ao, r = v, g = v * 0.995, b = v * 0.975;
      if (inner) { r = v * 1.08; g = v * 0.82; b = v * 0.74; if (JNT[q]) { r = v * 0.92; g = v * 0.9; b = v * 0.86; } } // the brick, the mortar of the joint
      if (H[q] < -0.07) { var dk = Math.max(0.2, 1 + (H[q] + 0.07) * 1.9); r *= dk; g *= dk; b *= dk; }
      if (GRN[q] > 0) { var gg = GRN[q]; r += (0.56 * ao - r) * gg; g += (0.585 * ao - g) * gg; b += (0.63 * ao - b) * gg; }
      if (damaged && park) { var st = 0.55 + 0.45 * fbm(gx(q) * 3, gz(q) * 3, 2, 91); r = r * (1 + 0.16 * st); g = g * (1 + 0.08 * st); b = b * (1 - 0.1 * st); } // chlorides and dirt in the skin
      if (damaged && neg) { var dmp = clamp01((0.5 - gz(q)) / 1.2); r *= 1 - 0.28 * dmp; g *= 1 - 0.24 * dmp; b *= 1 - 0.16 * dmp; if (fbm(gx(q) * 9, gz(q) * 9, 2, 95) > 0.68) { r = g = b = 0.92; } } // damp, and salt in the pores
      if (damaged && CRK[q]) { r *= 0.75; g *= 0.8; b *= 0.86; }
      c[q * 3] = r; c[q * 3 + 1] = g; c[q * 3 + 2] = b;
    }
    return c;
  }
  var COL_D = shade(H0, B0, true), COL_P = shade(H0, B0, false), COL_O = shade(HO, blur(HO, RB, 2), false);

  /* ----- height surfaces: a top over the sample, a wall along every boundary down to a floor ----- */
  function surface(Y, o) {
    o = o || {}; var uvk = o.uvk || 2.1, mask = o.mask, fl = function (q) { return typeof o.floor === 'number' ? o.floor : o.floor ? o.floor[q] : BASE; }, sd = o.skirtCol || 0.62, q;
    var pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = o.col ? new Float32Array(n * 3) : null, idx = [], cell = new Uint8Array((NX - 1) * (NZ - 1));
    for (q = 0; q < n; q++) { pos[q * 3] = gx(q); pos[q * 3 + 1] = Y[q]; pos[q * 3 + 2] = gz(q); uv[q * 2] = (gx(q) + 0.42 * Y[q]) * uvk; uv[q * 2 + 1] = (gz(q) + 0.3 * Y[q]) * uvk; if (col) { col[q * 3] = o.col[q * 3]; col[q * 3 + 1] = o.col[q * 3 + 1]; col[q * 3 + 2] = o.col[q * 3 + 2]; } }
    for (j = 0; j < NZ - 1; j++) for (i = 0; i < NX - 1; i++) { q = j * NX + i; if (mask && (mask[q] || mask[q + 1] || mask[q + NX] || mask[q + NX + 1])) continue; cell[j * (NX - 1) + i] = 1; idx.push(q, q + NX, q + 1, q + 1, q + NX, q + NX + 1); }
    var top = keep(new THREE.BufferGeometry()); top.setAttribute('position', new THREE.BufferAttribute(pos, 3)); top.setIndex(idx); top.computeVertexNormals(); var nrm = top.attributes.normal.array, nTop = idx.length;
    var wp = [], wn = [], wu = [], wc = [], wi = [], base = n, inc = function (i2, j2) { return i2 >= 0 && j2 >= 0 && i2 < NX - 1 && j2 < NZ - 1 && cell[j2 * (NX - 1) + i2] === 1; };
    function wall(a, b, nx, nz) { var fa = fl(a), fb = fl(b); if (Y[a] <= fa + 1e-4 && Y[b] <= fb + 1e-4) return; var along = nx ? [gz(a), gz(b)] : [gx(a), gx(b)];
      [[a, Y[a]], [b, Y[b]], [a, fa], [b, fb]].forEach(function (v, w) { wp.push(gx(v[0]), v[1], gz(v[0])); wn.push(nx, 0, nz); wu.push(along[w % 2] * uvk, v[1] * uvk); if (col) { var cc = o.col ? [o.col[v[0] * 3] * 0.9, o.col[v[0] * 3 + 1] * 0.9, o.col[v[0] * 3 + 2] * 0.9] : [sd, sd, sd * 0.975]; wc.push(cc[0], cc[1], cc[2]); } });
      var A = base, B = base + 1, C = base + 2, D = base + 3, e1x = gx(b) - gx(a), e1z = gz(b) - gz(a), e2y = fb - Y[a], faces = -(e1z) * e2y * nx + e1x * e2y * nz; base += 4;
      if (faces > 0) wi.push(A, B, D, A, D, C); else wi.push(A, D, B, A, C, D); }
    for (j = 0; j < NZ - 1; j++) for (i = 0; i < NX - 1; i++) { if (!inc(i, j)) continue; q = j * NX + i; if (!inc(i - 1, j)) wall(q, q + NX, -1, 0); if (!inc(i + 1, j)) wall(q + 1, q + NX + 1, 1, 0); if (!inc(i, j - 1)) wall(q, q + 1, 0, -1); if (!inc(i, j + 1)) wall(q + NX, q + NX + 1, 0, 1); }
    var nv = n + wp.length / 3, P2 = new Float32Array(nv * 3), N2 = new Float32Array(nv * 3), U2 = new Float32Array(nv * 2), C2 = col ? new Float32Array(nv * 3) : null;
    P2.set(pos); N2.set(nrm); U2.set(uv); if (col) C2.set(col); P2.set(wp, n * 3); N2.set(wn, n * 3); U2.set(wu, n * 2); if (col) C2.set(wc, n * 3);
    var geo = keep(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.BufferAttribute(P2, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N2, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U2, 2)); if (C2) geo.setAttribute('color', new THREE.BufferAttribute(C2, 3));
    geo.setIndex(idx.concat(wi)); geo.addGroup(0, nTop, 0); geo.addGroup(nTop, wi.length, 1); top.dispose();
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2.6); return geo;
  }
  function Cap(Ybot, Ytop, mat) { var N = NZ, pos = new Float32Array(N * 2 * 3), uv = new Float32Array(N * 2 * 2), idx = [], q; for (q = 0; q < N - 1; q++) idx.push(q * 2, q * 2 + 1, q * 2 + 2, q * 2 + 1, q * 2 + 3, q * 2 + 2);
    var geo = keep(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx); var mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.setFront = function (f) { var a = geo.attributes.position, u = geo.attributes.uv, m; for (m = 0; m < N; m++) { var c = -Z + m * DZ, yb = sample(Ybot, f, c), yt = Math.max(yb, sample(Ytop, f, c)); a.setXYZ(m * 2, f, yb, c); a.setXYZ(m * 2 + 1, f, yt, c); u.setXY(m * 2, c * 2.1, yb * 2.1); u.setXY(m * 2 + 1, c * 2.1, yt * 2.1); } a.needsUpdate = true; u.needsUpdate = true; geo.computeVertexNormals(); geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2.6); };
    return mesh; }

  /* ----- textures ----- */
  function pasteTex() { var S = SMALL3D ? 384 : 512, c = mkCanvas(S, S), g = c.getContext('2d'), r = lcg(97), q; g.fillStyle = '#b4b4b4'; g.fillRect(0, 0, S, S); clouds(g, S, S, r, 7, 7, 0.5, 120, 215); clouds(g, S, S, r, 28, 28, 0.35, 110, 225);
    function wrap(f) { for (var oy = -S; oy <= S; oy += S) for (var ox = -S; ox <= S; ox += S) { g.save(); g.translate(ox, oy); f(); g.restore(); } }
    for (q = 0; q < 1500; q++) { (function () { var x = r() * S, y = r() * S, rad = 1.5 + r() * r() * 9, gr = g.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 0, x, y, rad), l = 170 + Math.floor(r() * 70); gr.addColorStop(0, 'rgba(' + l + ',' + l + ',' + l + ',.9)'); gr.addColorStop(0.7, 'rgba(150,150,150,.55)'); gr.addColorStop(1, 'rgba(70,70,70,0)'); g.fillStyle = gr; wrap(function () { g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); }); })(); }
    g.lineCap = 'round'; for (q = 0; q < 420; q++) { (function () { var x = r() * S, y = r() * S, a = r() * 7, l = 4 + r() * 14; g.strokeStyle = r() < 0.6 ? 'rgba(236,236,236,.75)' : 'rgba(60,60,60,.5)'; g.lineWidth = 0.6 + r() * 0.9; wrap(function () { g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }); })(); }
    return c; }
  var paste = pasteTex(), texPaste = keep(canvasTex(paste, { wrap: RWp })), texPasteB = keep(canvasTex(paste, { wrap: RWp, srgb: false }));
  SecPhoto.kit(); var mmU = 1 / 60;
  function mortarC(grainMM, tone, seed, dens) { var S = 512, pxPerUnit = S / 2.4, mm = pxPerUnit * mmU * 1000; return CRPhoto.mortar(S, S, seed, { tone: tone, grain: grainMM, mm: mm, dens: dens }); }
  var fineC = mortarC(1, '#d3d1c9', 911, 0.7), m30C = mortarC(1, '#c9c7bf', 913, 0.6), plasterC = mortarC(1.5, '#e6e3da', 915, 0.5);
  function tex(c, o) { return keep(canvasTex(c, Object.assign({ wrap: RWp }, o || {}))); }
  var SL = { RB: WPTX.slurry('#666b6f', { seed: 811 }), K1: WPTX.slurry('#7c8083', { seed: 813 }), K2: WPTX.slurry('#4b5054', { seed: 815 }), OS: WPTX.slurry('#6f7376', { seed: 817 }) };

  /* ----- the sample: as found, prepared, and with the crack opened ----- */
  var matPaste = keep(new THREE.MeshStandardMaterial({ vertexColors: true, map: texPaste, bumpMap: texPasteB, bumpScale: 0.014, roughness: 0.92, metalness: 0, envMapIntensity: 0.22 }));
  var geoSub = surface(H0, { col: COL_D, floor: BASE }), sub = new THREE.Mesh(geoSub, [matPaste, matPaste]); sub.castShadow = true; sub.receiveShadow = true; this.group.add(sub);
  var geoOpen = surface(HO, { col: COL_O, floor: BASE }), subOpen = new THREE.Mesh(geoOpen, [matPaste, matPaste]); subOpen.castShadow = true; subOpen.receiveShadow = true; subOpen.visible = false; this.group.add(subOpen);
  function setSubColours(damaged) { var c = geoSub.attributes.color, src = damaged ? COL_D : COL_P, q; for (q = 0; q < n; q++) c.setXYZ(q, src[q * 3], src[q * 3 + 1], src[q * 3 + 2]); c.needsUpdate = true; }

  /* ----- the layers ----- */
  var layers = {}, order = [];
  function layer(name, Y, floorY, mat, o) { o = o || {}; var geo = surface(Y, { floor: floorY, mask: o.mask, uvk: o.uvk }), plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 9), sm = mat; mat.clippingPlanes = [plane]; if (o.skirtMat) { sm = keep(o.skirtMat.clone()); sm.clippingPlanes = [plane]; }
    var m = new THREE.Mesh(geo, [mat, sm]); m.castShadow = true; m.receiveShadow = true; m.visible = false; self.group.add(m); var cm = o.noCap ? null : keep((o.capMat || mat).clone()); if (cm) { cm.clippingPlanes = null; cm.side = THREE.DoubleSide; } var cap = o.noCap ? null : Cap(floorY, Y, cm); if (cap) { cap.visible = false; self.group.add(cap); }
    layers[name] = { mesh: m, cap: cap, plane: plane, end: o.end, stage: o.stage || name, Y: Y }; order.push(name); return layers[name]; }
  function add(A, d) { var out = new Float32Array(n), q; for (q = 0; q < n; q++) out[q] = A[q] + d; return out; }
  function fillPores(H, B, film) { var out = new Float32Array(n), q; for (q = 0; q < n; q++) out[q] = Math.max(H[q], B[q] + 0.004) + film; return out; }
  function grainRelief(level, amp, seed, sc) { var out = new Float32Array(n), q; for (q = 0; q < n; q++) { var x = gx(q), z = gz(q); wor(x * sc, z * sc, seed); var d = WD / 0.8, bump = d < 1 ? amp * Math.pow(1 - d * d, 0.7) * (0.5 + WID) : 0; out[q] = level + bump + amp * 0.3 * (fbm(x * 3, z * 3, 2, seed + 5) - 0.5); } return out; }
  function flatOver(A, lift) { var out = new Float32Array(n), q, top = -9; for (q = 0; q < n; q++) top = Math.max(top, A[q]); for (q = 0; q < n; q++) out[q] = Math.max(A[q] + 0.01, top + lift); return out; }
  var MM = 0.06; // one millimetre
  function slurryMat(c, col, rough) { return keep(new THREE.MeshStandardMaterial({ map: tex(c, { repeat: [1.4, 1.4] }), color: col, roughness: rough || 0.4, metalness: 0, envMapIntensity: 0.8, bumpMap: texPasteB, bumpScale: 0.004 })); }
  var mats = { RB: slurryMat(SL.RB, 0xa9adaf), RB2: slurryMat(SL.RB, 0xb6babc), K1: slurryMat(SL.K1, 0xbfc2c4, 0.6), K1b: slurryMat(SL.K1, 0xc8cbcd, 0.6), K1c: slurryMat(SL.K1, 0xd0d3d5, 0.6), K2: slurryMat(SL.K2, 0x9a9ea1), K2b: slurryMat(SL.K2, 0xa6aaad), OS: slurryMat(SL.OS, 0xb4b7b9, 0.5), OS2: slurryMat(SL.OS, 0xbdc0c2, 0.5), OSs: slurryMat(SL.OS, 0x9ea1a3, 0.6) };
  var fineM = keep(new THREE.MeshStandardMaterial({ map: tex(fineC, { repeat: [1.2, 1.2] }), color: 0xe6e4de, bumpMap: tex(fineC, { repeat: [1.2, 1.2], srgb: false }), bumpScale: 0.006, roughness: 0.97, envMapIntensity: 0.25 })), m30M = keep(new THREE.MeshStandardMaterial({ map: tex(m30C, { repeat: [1.2, 1.2] }), color: 0xe0ded6, roughness: 0.96, envMapIntensity: 0.25 })), plasterM = keep(new THREE.MeshStandardMaterial({ map: tex(plasterC, { repeat: [1, 1] }), color: 0xf1efe8, roughness: 0.97, envMapIntensity: 0.22 })), plasterCut = keep(new THREE.MeshStandardMaterial({ map: tex(plasterC, { repeat: [1, 1] }), color: 0xd9d6cc, roughness: 0.97 }));
  var primM = keep(new THREE.MeshStandardMaterial({ color: 0xbfd3df, roughness: 0.2, transparent: true, opacity: 0.35, envMapIntensity: 1.2, depthWrite: false })), adhM = keep(new THREE.MeshStandardMaterial({ map: tex(WPTX.slurry('#8a8f92', { seed: 823, ridges: true }), { repeat: [1.4, 1.4] }), color: 0xc4c7c9, roughness: 0.85, envMapIntensity: 0.3 }));
  var tileM = keep(new THREE.MeshStandardMaterial({ map: tex(WPTX.tile, { repeat: [1, 1] }), roughness: 0.18, envMapIntensity: 1.1 })), tileCut = keep(new THREE.MeshStandardMaterial({ color: 0xc9a98a, roughness: 0.9 })), boardM = keep(new THREE.MeshStandardMaterial({ map: tex(WPTX.board.map, { repeat: [2, 2] }), bumpMap: tex(WPTX.board.bump, { repeat: [2, 2], srgb: false }), bumpScale: 0.02, roughness: 0.7, envMapIntensity: 0.3 })), boardCut = keep(new THREE.MeshStandardMaterial({ color: 0x2f3336, roughness: 0.7 }));
  var Y1, Y2, Y3, Ys, Yp, Yb, Ya, Yt, Yl, Yc, extM = null;
  var MCTX = { scn: scn, n: n, NX: NX, NZ: NZ, X: X, Z: Z, BASE: BASE, MM: MM, RB: RB, H0: H0, B0: B0, HO: HO, CRK: CRK, TONE: TONE, GRN: GRN, gx: gx, gz: gz, fbm: fbm, vn: vn, wor: function (x, y, sd) { wor(x, y, sd); return { d: WD, id: WID }; }, sample: sample, blur: blur, surface: surface, Cap: Cap, layer: layer, layers: layers, add: add, fillPores: fillPores, grainRelief: grainRelief, flatOver: flatOver, mats: mats, slurryMat: slurryMat, tex: tex, keep: keep, fineM: fineM, m30M: m30M, texPasteB: texPasteB, group: this.group, matPaste: matPaste };
  if (typeof WPM3D !== 'undefined' && WPM3D[scn] && WPM3D[scn].micro) { extM = WPM3D[scn].micro(MCTX); }
  else if (scn === 'ext') {
    Y1 = fillPores(H0, B0, 1.1 * MM); layer('coat1', Y1, H0, mats.RB, { end: 0.62 * X, noCap: true });
    Y2 = grainRelief(0, 0.004, 131, 30); for (k = 0; k < n; k++) Y2[k] = Math.max(Y1[k] + 0.6 * MM, Y1[k] * 0.4 + 1.0 * MM) + Y2[k]; layer('coat2', Y2, Y1, mats.RB2, { end: 0.2 * X, noCap: true });
    Ya = flatOver(Y2, 0.4 * MM); layer('sand', Ya, Y2, adhM, { end: -0.22 * X, stage: 'board' }); Yb = add(Ya, 8 * MM); layer('board', Yb, Ya, boardM, { end: -0.22 * X, capMat: boardCut, skirtMat: boardCut });
  } else if (inner) {
    Yl = fillPores(H0, B0, 0.3 * MM); var lvMask = new Uint8Array(n); for (k = 0; k < n; k++) lvMask[k] = (JNT[k] || H0[k] < -0.05) ? 0 : 1; layer('level', Yl, H0, m30M, { end: 0.9 * X, stage: 'prep', mask: lvMask, noCap: true });
    var Ysub = new Float32Array(n); for (k = 0; k < n; k++) Ysub[k] = lvMask[k] ? H0[k] : Yl[k];
    Y1 = fillPores(Ysub, blur(Ysub, RB, 2), 0.9 * MM); layer('coat1', Y1, Ysub, mats.K1, { end: 0.6 * X, noCap: true });
    Y2 = add(Y1, 0.9 * MM); for (k = 0; k < n; k++) Y2[k] = Math.max(Y2[k], -0.02 + 1.6 * MM); layer('coat2', Y2, Y1, mats.K1b, { end: 0.3 * X, noCap: true });
    Y3 = add(Y2, 0.9 * MM); layer('coat3', Y3, Y2, mats.K1c, { end: 0.0, noCap: true });
    Ys = flatOver(Y3, 0.3 * MM); var Ysp = grainRelief(0, 0.05, 171, 9); for (k = 0; k < n; k++) Ysp[k] = Ys[k] + Math.max(0, Ysp[k]); layer('splatter', Ysp, Y3, keep(new THREE.MeshStandardMaterial({ map: tex(m30C, { repeat: [1.2, 1.2] }), color: 0xb9b7ae, roughness: 0.98 })), { end: -0.3 * X, stage: 'plaster', noCap: true });
    Yp = flatOver(Ysp, 11 * MM); layer('plaster', Yp, Ysp, plasterM, { end: -0.3 * X, capMat: plasterCut, skirtMat: plasterCut });
  } else if (negc) {
    Y1 = fillPores(H0, B0, 0.9 * MM); layer('seal', Y1, H0, mats.K1, { end: 0.7 * X, noCap: true });
    Y2 = add(blur(Y1, Math.round(RB / 2), 1), 1.1 * MM); for (k = 0; k < n; k++) Y2[k] = Math.max(Y2[k], Y1[k] + 0.5 * MM); layer('coat1', Y2, Y1, mats.RB, { end: 0.4 * X, noCap: true });
    Y3 = add(Y2, 1.1 * MM); layer('coat2', Y3, Y2, mats.RB2, { end: 0.05 * X, noCap: true });
  } else if (scn === 'tank') {
    Ys = fillPores(H0, B0, 0.9 * MM); layer('smooth', Ys, H0, fineM, { end: 0.85 * X, stage: 'prep', noCap: true });
    Y1 = add(blur(Ys, Math.round(RB / 2), 1), 1.1 * MM); for (k = 0; k < n; k++) Y1[k] = Math.max(Y1[k], Ys[k] + 0.5 * MM); layer('coat1', Y1, Ys, mats.RB, { end: 0.5 * X, noCap: true });
    Y2 = add(Y1, 1.1 * MM); layer('coat2', Y2, Y1, mats.RB2, { end: 0.05 * X, noCap: true });
  } else if (balcony) {
    Yl = fillPores(H0, B0, 0.2 * MM); layer('prim', Yl, H0, primM, { end: 0.95 * X, stage: 'prep', noCap: true });
    Y1 = fillPores(H0, B0, 1.1 * MM); layer('coat1', Y1, H0, mats.K2, { end: 0.6 * X, noCap: true });
    Y2 = add(Y1, 1.1 * MM); layer('coat2', Y2, Y1, mats.K2b, { end: 0.2 * X, noCap: true });
    Ya = flatOver(Y2, 0.5 * MM); Ya = add(grainRelief(0, 0.02, 177, 12), 0); for (k = 0; k < n; k++) Ya[k] = Math.max(Y2[k] + 0.5 * MM, -0.02 + 2.7 * MM) + Math.max(0, Ya[k]) * 1.5; layer('adh', Ya, Y2, adhM, { end: -0.25 * X, stage: 'tiles' });
    Yt = flatOver(Ya, 9 * MM); layer('tile', Yt, Ya, tileM, { end: -0.25 * X, stage: 'tiles', capMat: tileCut, skirtMat: tileCut });
  } else {
    Yl = fillPores(H0, B0, 0.2 * MM); layer('prim', Yl, H0, primM, { end: 0.95 * X, stage: 'prep', noCap: true });
    Ys = fillPores(H0, B0, 0.6 * MM); layer('scratch', Ys, H0, mats.OSs, { end: 0.75 * X, noCap: true });
    Y1 = add(blur(Ys, Math.round(RB / 2), 1), 1.5 * MM); for (k = 0; k < n; k++) Y1[k] = Math.max(Y1[k], Ys[k] + 0.6 * MM); layer('coat1', Y1, Ys, mats.OS, { end: 0.35 * X });
    Y2 = add(Y1, 1.5 * MM); layer('coat2', Y2, Y1, mats.OS2, { end: -0.1 * X });
  }
  /* the water: in the crack as found (leaking through) and, for the rigid inner slurry, pressing from the rear under the coats; on top of the finished tank */
  var waterM = keep(new THREE.MeshStandardMaterial({ color: 0x2f9bd6, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.8, envMapIntensity: 1.6, depthWrite: false })), waterCrack = null, waterTop = null, waterHeld = null;
  (function () { var Yw = new Float32Array(n), wMask = new Uint8Array(n), Yw2 = new Float32Array(n), wMask2 = new Uint8Array(n); for (k = 0; k < n; k++) { Yw[k] = Math.max(H0[k], -0.05); wMask[k] = CRK[k] && H0[k] < -0.075 ? 0 : 1; Yw2[k] = Math.max(H0[k], -0.16); wMask2[k] = CRK[k] && H0[k] < -0.18 ? 0 : 1; }
    waterCrack = new THREE.Mesh(surface(Yw, { floor: H0, mask: wMask, uvk: 1 }), [waterM, waterM]); waterCrack.renderOrder = 2; waterCrack.visible = false; self.group.add(waterCrack);
    waterHeld = new THREE.Mesh(surface(Yw2, { floor: H0, mask: wMask2, uvk: 1 }), [waterM, waterM]); waterHeld.renderOrder = 2; waterHeld.visible = false; self.group.add(waterHeld);
    if (scn === 'tank') { var top = layers.coat2.Y, Ywt = flatOver(top, 6 * MM); waterTop = new THREE.Mesh(surface(Ywt, { floor: top, uvk: 1 }), [waterM, waterM]); waterTop.renderOrder = 2; waterTop.visible = false; self.group.add(waterTop); } })();
  /* the film that keeps a slurry damp while it cures */
  var filmM = keep(new THREE.MeshStandardMaterial({ color: 0xdfe9f2, roughness: 0.06, metalness: 0, transparent: true, opacity: 0, envMapIntensity: 1.8, depthWrite: false, side: THREE.DoubleSide })), filmMesh = null;
  if (extM && extM.top) { var YfilmX = add(extM.top, 0.06); for (k = 0; k < n; k++) YfilmX[k] += 0.02 * Math.sin(gx(k) * 9) * Math.sin(gz(k) * 7); filmMesh = new THREE.Mesh(surface(YfilmX, { floor: YfilmX }), filmM); filmMesh.visible = false; this.group.add(filmMesh); }
  else if (neg || scn === 'tank') { var topY = (inner || negc) ? Y3 : Y2, Yfilm = add(topY, 0.06); for (k = 0; k < n; k++) Yfilm[k] += 0.02 * Math.sin(gx(k) * 9) * Math.sin(gz(k) * 7); filmMesh = new THREE.Mesh(surface(Yfilm, { floor: Yfilm }), filmM); filmMesh.visible = false; this.group.add(filmMesh); }
  var OPEN = extM ? (extM.open || null) : ({ ext: 'done', tank: 'fill', balcony: 'done', park: 'done' }[scn] || null);

  this.stages = ST; this.dur = { state: 0.8, prep: 3.0, repair: 1.6, seal: 3.0, cove: 1.4, pipe: 1.4, coat1: 3.2, coat2: 3.2, coat3: 3.0, board: 3.2, done: 3.4, barrier: 1.4, cure: 2.6, plaster: 3.4, joint: 1.4, fill: 3.4, tape: 1.4, tiles: 3.6, scratch: 3.0 };
  this.home = { az: 36, el: 36, dist: 4.9, t: [0.1, LIFT + 0.15, 0.1] }; if (extM && extM.home) this.home = extM.home; this.cams = extM && extM.cams || null; // a guide's micro model may stand its sample differently (the sealant joint is deeper than the coating sample)
  var lastStage = null;
  this.set = function (id, tw, xr) {
    var si = ST.indexOf(id), at = function (s) { return ST.indexOf(s); }, from = function (s) { return si >= at(s); }, t = smooth(clamp01(tw));
    var damaged = id === 'state'; if ((damaged ? 'd' : 'p') !== lastStage) { setSubColours(damaged); lastStage = damaged ? 'd' : 'p'; }
    var opening = OPEN && id === OPEN ? t : (OPEN && from(OPEN) ? 1 : 0); subOpen.visible = opening > 0.5; sub.visible = opening <= 0.5;
    order.forEach(function (nm) { var L = layers[nm], on = from(L.stage), prog = si === at(L.stage) ? t : 1, f = -X - 0.02 + (L.end + X + 0.02) * prog; L.mesh.visible = on; L.plane.constant = f; if (L.cap) { L.cap.visible = on && f < X; if (on) L.cap.setFront(f); } });
    if (waterCrack) waterCrack.visible = damaged || (!neg && !from('coat1') && !from('prep'));
    if (waterHeld) waterHeld.visible = (inner && from('coat1')) || (negc && from('seal'));
    if (waterTop) waterTop.visible = from('fill') && (id !== 'fill' || t > 0.2);
    if (filmMesh) { filmMesh.visible = id === 'cure'; filmM.opacity = 0.28 * t; }
    var wet = id === 'cure' ? t : (/coat/.test(id) ? 0.6 : 0); Object.keys(mats).forEach(function (m) { mats[m].roughness = (m.indexOf('K1') === 0 || m.indexOf('OS') === 0 ? 0.55 : 0.4) - 0.25 * wet; });
    if (id === 'prep') { matPaste.color.setScalar(1 - 0.18 * t); matPaste.roughness = 0.92 - 0.5 * t; } else if (from('prep') && !from(ST[Math.min(ST.length - 1, at('prep') + 1)])) { matPaste.color.setScalar(0.82); matPaste.roughness = 0.42; } else { matPaste.color.setScalar(1); matPaste.roughness = 0.92; }
    if (extM && extM.set) extM.set(id, t, from, si, { waterCrack: waterCrack, waterHeld: waterHeld, filmMesh: filmMesh, filmM: filmM, wet: wet });
  };
  this.set(ST[0], 1, 0);
  this.info = { verts: n, grid: [NX, NZ] };
  this.dispose = function () { trash.forEach(function (o) { if (o && o.dispose) o.dispose(); }); trash = []; };
}

