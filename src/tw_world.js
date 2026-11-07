/* ===== [tw_world.js] ===== */
/* ===== TWW — the world of AUTO 台灣島 =====
   The island in chunks: terrain from TWG with a painted ground (beaches, rice paddies, forests, toy-relief cliffs, the paving of the
   towns), a sea that reads its depth from the coast's distance field (shallows, foam, sun glints), a sky dome with the sun, the moon and
   the stars, the light of the hour of Taipei with an environment map, soft shadows that follow the player, forests and coconut and
   betel palms in instanced chunks that sway in the wind, a field of grass blades and flowers around the player, the ring road and the
   viaduct of the high-speed rail. The buildings come from ARCH, the vehicles and creatures from PROPS. Chunks beyond the view are hidden. */
var TWW = (function () {
  var G = TWG, K = KIT, V3 = THREE.Vector3;
  var Q = { low: false, mapK: 3, step: 1.25, shadow: 2048, view: 140, grass: 1, trees: 1 };
  function lin(h) { return K.lin(h); }
  function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function mix3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

  /* ================= the ground paint ================= */
  var CLS = null, CW = 0, CH = 0, PIX = null; /* class grid (1 unit): 0 sea 1 sand 2 grass 3 farm 4 urban 5 forest 6 rock 7 road */
  var TOWNS = [];
  function towns() { var L = G.ll; TOWNS = [
      { id: 'keelung', p: L(121.742, 25.128), r: 4.5 }, { id: 'yilan', p: L(121.753, 24.757), r: 4.5 }, { id: 'hualien', p: L(121.60, 23.985), r: 5 }, { id: 'taitung', p: L(121.14, 22.76), r: 5 },
      { id: 'pingtung', p: L(120.49, 22.67), r: 4.5 }, { id: 'chiayi', p: L(120.45, 23.48), r: 5 }, { id: 'changhua', p: L(120.54, 24.08), r: 4.5 }, { id: 'miaoli', p: L(120.82, 24.56), r: 3.5 }, { id: 'hcity', p: L(120.97, 24.80), r: 4 },
      { id: 'tcity', p: L(120.68, 24.14), r: 5 }, { id: 'tncity', p: L(120.20, 22.995), r: 5 }, { id: 'kcity', p: L(120.30, 22.63), r: 5 }, { id: 'douliu', p: L(120.54, 23.71), r: 3.5 }, { id: 'hengchun', p: L(120.745, 22.0), r: 3 }, { id: 'yuli', p: L(121.31, 23.33), r: 3 }, { id: 'magongT', p: G.PL.magong, r: 4 }
    ]; return TOWNS; }
  function urbanK(x, z) { var k = 0, i; for (i = 0; i < G.ZONES.length; i++) { var Z = G.ZONES[i]; if (!/^(tpe|tao|hsz|txg|chw|yun|cyi|tnn|khh|port|magong|ken|hua|tai)$/.test(Z.id)) continue; var d = Math.hypot(x - Z.x, z - Z.z), rr = Z.r * (/^(ken|hua|tai)$/.test(Z.id) ? 0.45 : 0.6); k = Math.max(k, 1 - sstep(rr - 1.2, rr + 0.8, d)); } for (i = 0; i < TOWNS.length; i++) { var T = TOWNS[i], d2 = Math.hypot(x - T.p[0], z - T.p[1]); k = Math.max(k, (1 - sstep(T.r - 1, T.r + 1, d2)) * 0.85); } return k; }
  function farOk(x, z) { for (var i = 0; i < G.ZONES.length; i++) { var Z = G.ZONES[i]; if (Z.id === 'chishang') continue; if (Math.hypot(x - Z.x, z - Z.z) < Z.r + 6) return false; } return true; }
  function paintGround(roadG) {
    var GW = G.GW, GH = G.GH, X0 = G.X0, Z0 = G.Z0, n = GW * GH, H = new Float32Array(n), D = new Float32Array(n), NY = new Float32Array(n), MM = new Float32Array(n), UR = new Float32Array(n), x, z, k, nrm = { x: 0, y: 1, z: 0 };
    CLS = new Uint8Array(n); var LKw = G.lake && G.lake.sd ? G.lake : null;
    for (z = 0; z < GH; z++) for (x = 0; x < GW; x++) { k = z * GW + x; var wx = X0 + x + 0.5, wz = Z0 + z + 0.5; H[k] = G.height(wx, wz); D[k] = G.sdf(wx, wz); G.normal(wx, wz, nrm); NY[k] = nrm.y; MM[k] = G.mount(wx, wz); UR[k] = D[k] > 0 ? urbanK(wx, wz) : 0;
      var c = 2; if (D[k] < 0 || H[k] < -0.05) c = 0; else if (UR[k] > 0.5) c = 4; else if (D[k] < 2.2 && H[k] < 1.0) c = 1; else if (NY[k] < 0.72 || H[k] > 25) c = 6; else if (MM[k] > 2.2 && H[k] > 2.5) c = 5; else if (H[k] < 2.4 && MM[k] < 0.8 && D[k] > 3 && G.vnoise(wx * 0.06, wz * 0.06) > 0.42) c = 3; if (roadG && roadG[k]) c = 7; if (c && LKw && H[k] < LKw.h + 0.12 && LKw.sd(wx, wz) > -0.12) c = 0; /* the lake: no trees, no grass in the water */ CLS[k] = c; }
    var KM = Q.mapK; CW = GW * KM; CH = GH * KM; var cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; var g = cv.getContext('2d'), im = g.createImageData(CW, CH), d = im.data, px, py;
    function B(A, fx, fz) { if (fx < 0) fx = 0; if (fz < 0) fz = 0; if (fx > GW - 1.001) fx = GW - 1.001; if (fz > GH - 1.001) fz = GH - 1.001; var ix = fx | 0, iz = fz | 0, ax = fx - ix, az = fz - iz, q = iz * GW + ix; return (A[q] * (1 - ax) + A[q + 1] * ax) * (1 - az) + (A[q + GW] * (1 - ax) + A[q + GW + 1] * ax) * az; }
    var GRA = [142, 197, 84], GRB = [116, 178, 70], GRC = [96, 158, 58], FOA = [70, 132, 58], FOB = [52, 108, 48], ROCK = [126, 116, 100], DIRT = [152, 124, 92], HIR = [168, 164, 156], SNOW = [238, 240, 244], SAND = [238, 220, 172], WET = [212, 194, 148], BED = [196, 184, 140], URB = [204, 196, 182], PAD = [[150, 202, 92], [172, 198, 86], [212, 192, 92], [126, 182, 172], [160, 206, 98]];
    for (py = 0; py < CH; py++) for (px = 0; px < CW; px++) {
      var fx = (px + 0.5) / KM - 0.5, fz = (py + 0.5) / KM - 0.5, wx = X0 + fx + 0.5, wz = Z0 + fz + 0.5, h = B(H, fx, fz), dd = B(D, fx, fz), ny = B(NY, fx, fz), m = B(MM, fx, fz), ur = B(UR, fx, fz), nz = G.vnoise(wx * 0.9, wz * 0.9), nz2 = G.vnoise(wx * 0.13 + 7, wz * 0.13 - 3), col;
      if (dd < -0.2) col = mix3(WET, BED, sstep(0, 4, -dd));
      else {
        var gr = mix3(mix3(GRA, GRB, nz2), GRC, sstep(0.55, 0.9, nz) * 0.6); col = gr;
        var fo = mix3(FOA, FOB, nz * 0.8 + nz2 * 0.2); col = mix3(col, fo, sstep(1.2, 3.2, m) * sstep(1.6, 4.0, h));
        var hi = mix3(HIR, SNOW, sstep(30.5, 33.5, h)); col = mix3(col, hi, sstep(22, 27, h));
        var cliff = mix3(DIRT, ROCK, sstep(4, 14, h) * 0.7 + nz * 0.3); col = mix3(col, cliff, sstep(0.86, 0.66, ny));
        if (h < 2.4 && m < 0.9 && dd > 3 && ur < 0.02 && farOk(wx, wz)) { var farm = sstep(0.38, 0.46, G.vnoise(wx * 0.06, wz * 0.06)); if (farm > 0) { var a = 0.42, u = wx * Math.cos(a) + wz * Math.sin(a), v = -wx * Math.sin(a) + wz * Math.cos(a), cu = Math.floor(u / 3.1), cvv = Math.floor(v / 2.2), fu = u / 3.1 - cu, fv = v / 2.2 - cvv, hh = G.hash(cu, cvv), pc = PAD[Math.floor(hh * 5) % 5], dike = (fu < 0.05 || fv < 0.07) ? 0.78 : 1; var stripe = 0.94 + 0.06 * Math.sin(v * 18); col = mix3(col, [pc[0] * dike * stripe, pc[1] * dike * stripe, pc[2] * dike * stripe], farm); } }
        col = mix3(col, mix3(SAND, WET, sstep(0.8, -0.1, dd)), sstep(2.4, 1.2, dd) * sstep(1.3, 0.8, h) * (1 - sstep(0.3, 0.7, ur)));
        if (ur > 0.01) { var gx = (wx * 1.0) % 1, gz = (wz * 1.0) % 1; if (gx < 0) gx += 1; if (gz < 0) gz += 1; var line = (gx < 0.05 || gz < 0.05) ? 0.9 : 1, uc = [URB[0] * line * (0.97 + nz * 0.06), URB[1] * line * (0.97 + nz * 0.06), URB[2] * line * (0.97 + nz * 0.06)]; col = mix3(col, uc, sstep(0.25, 0.6, ur)); }
      }
      var o = (py * CW + px) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255; }
    g.putImageData(im, 0, 0); PIX = d; return cv; }
  function groundRGB(x, z) { if (!PIX) return [120, 180, 70]; var px = Math.max(0, Math.min(CW - 1, Math.floor((x - G.X0) * Q.mapK))), py = Math.max(0, Math.min(CH - 1, Math.floor((z - G.Z0) * Q.mapK))), o = (py * CW + px) * 4; return [PIX[o], PIX[o + 1], PIX[o + 2]]; }
  function cls(x, z) { var ix = Math.floor(x - G.X0), iz = Math.floor(z - G.Z0); if (ix < 0 || iz < 0 || ix >= G.GW || iz >= G.GH) return 0; return CLS[iz * G.GW + ix]; }

  /* ================= terrain chunks ================= */
  var CS = 40;
  function terrainChunk(x0, z0, mat) {
    var st = Q.step, n = Math.round(CS / st) + 1, pos = new Float32Array(n * n * 3), nor = new Float32Array(n * n * 3), uv = new Float32Array(n * n * 2), idx = [], i, j, k = 0, nr = { x: 0, y: 1, z: 0 }, any = false;
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) { var x = x0 + i * st, z = z0 + j * st, h = G.height(x, z); if (G.sdf(x, z) > -7) any = true; h = Math.max(h, -3.6); G.normal(x, z, nr); pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z; nor[k * 3] = nr.x; nor[k * 3 + 1] = nr.y; nor[k * 3 + 2] = nr.z; uv[k * 2] = (x - G.X0) / G.GW; uv[k * 2 + 1] = 1 - (z - G.Z0) / G.GH; k++; }
    if (!any) return null;
    for (j = 0; j < n - 1; j++) for (i = 0; i < n - 1; i++) { var a = j * n + i, b = a + 1, c = a + n, e = c + 1; idx.push(a, c, b, b, c, e); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeBoundingSphere();
    var me = new THREE.Mesh(g, mat); me.receiveShadow = true; me.castShadow = true; me.matrixAutoUpdate = false; me.updateMatrix(); return me; }

  /* ================= trees ================= */
  var TREE = {};
  function treeGeos() {
    if (TREE.round) return TREE; var T = K.Batch({ sway: true }), r = K.seeded(4);
    function trunk(B, h, r0, r1, col) { B.add(K.cyl(r1, r0, h, 7), { p: [0, h / 2, 0] }, col, { sway: function (x, y) { return Math.max(0, y / h - 0.4) * 0.3; } }); }
    function blob(B, cx, cy, cz, rad, det, top, bot, sw) { var geo = new THREE.IcosahedronGeometry(rad, det), p = geo.attributes.position, nrm = geo.attributes.normal, i, v = new V3(); for (i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); var j = 1 + (G.hash(v.x * 9.1 + cx, v.z * 7.3 + cz) - 0.5) * 0.16; v.multiplyScalar(j); p.setXYZ(i, v.x, v.y * 0.92, v.z); v.normalize(); nrm.setXYZ(i, v.x, v.y, v.z); }
      B.add(geo, { p: [cx, cy, cz] }, function (x, y, z, nx, ny) { var t = sstep(cy - rad, cy + rad * 0.9, y); var c = new THREE.Color(bot).lerp(new THREE.Color(top), t); return c; }, { sway: sw == null ? function (x, y) { return 0.6 + 0.4 * sstep(cy - rad, cy + rad, y); } : sw }); }
    /* round: the broadleaf of the plains and the hills */
    var B1 = K.Batch({ sway: true }); trunk(B1, 1.05, 0.12, 0.075, 0x8a6446); blob(B1, 0, 1.55, 0, 0.72, 2, 0x8fcf5e, 0x3f8a3a); blob(B1, 0.42, 1.28, 0.12, 0.46, 1, 0x86c858, 0x3d8638); blob(B1, -0.36, 1.32, -0.2, 0.44, 1, 0x86c858, 0x3d8638); blob(B1, 0.05, 2.02, -0.12, 0.42, 1, 0x9ad66a, 0x4f9a44); TREE.round = B1.geometry();
    /* cone: the cypress and cedar of the mountains */
    var B2 = K.Batch({ sway: true }); trunk(B2, 0.9, 0.11, 0.07, 0x6e4d36); [[0.95, 0.78, 1.0], [1.55, 0.6, 0.85], [2.1, 0.42, 0.7], [2.55, 0.25, 0.55]].forEach(function (q, i) { var cg = new THREE.ConeGeometry(q[1], q[2], 9, 2), p = cg.attributes.position, v = new V3(), j; for (j = 0; j < p.count; j++) { v.fromBufferAttribute(p, j); var w = 1 + (G.hash(v.x * 5 + i, v.z * 5) - 0.5) * 0.18; p.setXYZ(j, v.x * w, v.y, v.z * w); } cg.computeVertexNormals(); B2.add(cg, { p: [0, q[0], 0] }, function (x, y) { return new THREE.Color(0x24603e).lerp(new THREE.Color(0x4f9a5a), sstep(q[0] - q[2] / 2, q[0] + q[2] / 2, y)); }, { sway: 0.25 + i * 0.15 }); }); TREE.cone = B2.geometry();
    /* palm: the coconut palm of the south and the beaches */
    var B3 = K.Batch({ sway: true }), pts = [[0, 0, 0], [0.08, 0.8, 0.02], [0.24, 1.6, 0.05], [0.45, 2.3, 0.08]]; B3.add(K.tube(pts, 0.085, 10, 7), null, 0x9a7a58, { sway: function (x, y) { return y / 2.3 * 0.35; } });
    var top = [0.45, 2.3, 0.08]; for (var f = 0; f < 8; f++) { var a = f / 8 * Math.PI * 2, fg = K.ext([[0, -0.02], [0.35, 0.09], [0.9, 0.06], [1.25, -0.05], [0.9, -0.02], [0.35, -0.06]], 0.02), pp = fg.attributes.position, v2 = new V3(), j2; for (j2 = 0; j2 < pp.count; j2++) { v2.fromBufferAttribute(pp, j2); var dr = v2.x * v2.x * 0.42; pp.setXYZ(j2, v2.x, v2.y, v2.z + dr); } fg.computeVertexNormals(); B3.add(fg, { p: top, r: [Math.PI / 2 - 0.25, a, 0] }, function (x, y) { return new THREE.Color(0x3f9a48).lerp(new THREE.Color(0x7cc45a), sstep(1.6, 2.5, y)); }, { sway: 1.0 }); }
    blob(B3, top[0], top[1] - 0.12, top[2], 0.14, 0, 0x7a5a2e, 0x5a4020, 0.35); TREE.palm = B3.geometry();
    /* betel palm: slender, the plains of the south and the foothills */
    var B4 = K.Batch({ sway: true }); B4.add(K.cyl(0.045, 0.055, 2.6, 6), { p: [0, 1.3, 0] }, 0xb8b4a4, { sway: function (x, y) { return y / 2.6 * 0.4; } }); for (var f2 = 0; f2 < 7; f2++) { var a2 = f2 / 7 * Math.PI * 2, fg2 = K.ext([[0, -0.015], [0.25, 0.06], [0.62, 0.04], [0.85, -0.03], [0.62, -0.01], [0.25, -0.04]], 0.015); var pp2 = fg2.attributes.position, v3 = new V3(), j3; for (j3 = 0; j3 < pp2.count; j3++) { v3.fromBufferAttribute(pp2, j3); pp2.setXYZ(j3, v3.x, v3.y, v3.z + v3.x * v3.x * 0.5); } fg2.computeVertexNormals(); B4.add(fg2, { p: [0, 2.62, 0], r: [Math.PI / 2 - 0.55, a2, 0] }, 0x5aa84a, { sway: 1.0 }); } B4.add(K.cyl(0.07, 0.06, 0.32, 6), { p: [0, 2.48, 0] }, 0x6aa850, { sway: 0.4 }); TREE.betel = B4.geometry();
    /* bamboo: a clump of culms */
    var B5 = K.Batch({ sway: true }); for (var c = 0; c < 6; c++) { var ca = c / 6 * Math.PI * 2 + 0.3, cr = 0.12 + (c % 2) * 0.08, hh = 2.1 + (c % 3) * 0.35, tilt = 0.1 + (c % 2) * 0.08; B5.add(K.cyl(0.03, 0.035, hh, 5), { p: [Math.cos(ca) * cr, hh / 2, Math.sin(ca) * cr], r: [Math.sin(ca) * tilt, 0, -Math.cos(ca) * tilt] }, 0x7aa65a, { sway: function (x, y) { return y / 2.5 * 0.7; } }); blob(B5, Math.cos(ca) * (cr + 0.25), hh * 0.9, Math.sin(ca) * (cr + 0.25), 0.3, 1, 0x9ed46a, 0x5a9a48); } TREE.bamboo = B5.geometry();
    /* sakura: Alishan and the north */
    var B6 = K.Batch({ sway: true }); trunk(B6, 0.95, 0.11, 0.07, 0x6a4a3e); blob(B6, 0, 1.45, 0, 0.66, 2, 0xffd6e6, 0xe28aa8); blob(B6, 0.38, 1.25, 0.15, 0.42, 1, 0xffcfe0, 0xd97f9f); blob(B6, -0.34, 1.3, -0.18, 0.4, 1, 0xffcfe0, 0xd97f9f); TREE.sakura = B6.geometry();
    /* banyan: the wide shade tree of the temples and the squares */
    var B7 = K.Batch({ sway: true }); trunk(B7, 1.2, 0.26, 0.16, 0x7a6450); for (var b = 0; b < 5; b++) { var ba = b / 5 * Math.PI * 2; blob(B7, Math.cos(ba) * 0.85, 1.75 + (b % 2) * 0.15, Math.sin(ba) * 0.85, 0.7, 1, 0x7cc05a, 0x2f7a34); } blob(B7, 0, 2.15, 0, 0.8, 2, 0x8ccc66, 0x3f8a3a); for (var rt = 0; rt < 6; rt++) { var ra = rt / 6 * Math.PI * 2; B7.add(K.cyl(0.02, 0.02, 1.4, 4), { p: [Math.cos(ra) * 0.9, 0.7, Math.sin(ra) * 0.9] }, 0x8a7460, { sway: 0.2 }); } TREE.banyan = B7.geometry();
    return TREE; }
  function scatterTrees(roadG) {
    var r = K.seeded(21), cell = Q.low ? 3.4 : 2.7, list = {}, x, z, step = cell;
    function push(type, x2, z2, s, rot, col) { var cx = Math.floor((x2 - G.X0) / CS), cz = Math.floor((z2 - G.Z0) / CS), key = cx + ',' + cz + ',' + type; (list[key] = list[key] || { type: type, cx: cx, cz: cz, items: [] }).items.push({ p: [x2, G.height(x2, z2) - 0.04, z2], r: [0, rot, 0], s: s, c: col }); }
    var hsr = G.lines().hsr;
    for (z = G.Z0 + 2; z < G.Z0 + G.GH - 2; z += step) for (x = G.X0 + 2; x < G.X0 + G.GW - 2; x += step) {
      var jx = x + (r() - 0.5) * cell * 0.9, jz = z + (r() - 0.5) * cell * 0.9, d = G.sdf(jx, jz); if (d < 0.6) continue; var h = G.height(jx, jz), c = cls(jx, jz); if (c === 4 || c === 7 || c === 0 || h < 0.3) continue;
      var ix = Math.floor(jx - G.X0), iz = Math.floor(jz - G.Z0); if (roadG && roadG[iz * G.GW + ix] > 0) continue; var skip = false; for (var i = 0; i < G.ZONES.length; i++) { var Z = G.ZONES[i]; if (Math.hypot(jx - Z.x, jz - Z.z) < Z.r + 1.5) { skip = true; break; } } if (skip) continue;
      var m = G.mount(jx, jz), u = r(), nr = G.normal(jx, jz); if (nr.y < 0.6) continue; var s = 0.85 + r() * 0.45, rot = r() * 6.283, tint = new THREE.Color(0.9 + r() * 0.18, 0.92 + r() * 0.16, 0.86 + r() * 0.16);
      var near = Math.abs(jx - G.PL.ali[0]) < 14 && Math.abs(jz - G.PL.ali[1]) < 14, ken = jz > 150, south = jz > 40;
      if (m > 2.2 && h > 2.5 && c !== 6) { if (u > 0.78) continue; var type = h > 15 ? 'cone' : h > 8 ? (r() < 0.55 ? 'cone' : 'round') : (r() < 0.12 ? 'bamboo' : 'round'); if (near && r() < 0.25) type = 'sakura'; push(type, jx, jz, s * (type === 'cone' ? 1.05 : 1), rot, type === 'round' ? tint : new THREE.Color(1, 1, 1)); }
      else if (c === 1 || (d < 5 && south)) { if (u < (ken ? 0.3 : 0.12)) push('palm', jx, jz, s, rot, null); }
      else if (c === 2 || c === 5) { if (u < 0.045) push('round', jx, jz, s, rot, tint); else if (south && u < 0.09) push('betel', jx, jz, s, rot, null); else if (!south && u < 0.065 && m > 0.4) push('bamboo', jx, jz, s * 0.9, rot, null); else if (near && u < 0.2) push('sakura', jx, jz, s, rot, null); }
    }
    return list; }

  /* ================= the grass field around the player ================= */
  var GT = { size: 10, tiles: {}, mat: null, queue: [], group: null };
  function grassTile(tx, tz) {
    var S = GT.size, x0 = tx * S, z0 = tz * S, B = K.Batch({ sway: true }), r = K.seeded(1 + Math.abs(tx * 73856093 ^ tz * 19349663) % 2147483646), n = Math.round(S * S * (Q.low ? 5 : 9) * Q.grass), i, pos = [], nor = [], col = [], sw = [];
    for (i = 0; i < n; i++) { var x = x0 + r() * S, z = z0 + r() * S, c = cls(x, z); if (c !== 2 && c !== 5 && c !== 3) continue; if (c === 5 && r() < 0.6) continue; var h = G.height(x, z); if (h < 0.35) continue; var ix = Math.floor(x - G.X0), iz = Math.floor(z - G.Z0); var skip = false; for (var q = 0; q < GT.no.length; q++) { var o = GT.no[q]; if (Math.abs(x - o[0]) < o[2] && Math.abs(z - o[1]) < o[2]) { skip = true; break; } } if (skip) continue;
      var gc = groundRGB(x, z), base = new THREE.Color(gc[0] / 255, gc[1] / 255, gc[2] / 255); base.convertSRGBToLinear(); var tipc = base.clone().multiplyScalar(1.18).lerp(new THREE.Color(0.5, 0.62, 0.16), 0.1), rootc = base.clone().multiplyScalar(0.84);
      var a = r() * Math.PI, w = 0.045 + r() * 0.03, hh = (c === 3 ? 0.2 : 0.26) + r() * 0.2, lean = (r() - 0.5) * 0.12, ca = Math.cos(a) * w, sa = Math.sin(a) * w, nr = G.normal(x, z);
      pos.push(x - ca, h - 0.02, z - sa, x + ca, h - 0.02, z + sa, x + lean, h + hh, z + lean * 0.6);
      for (var k2 = 0; k2 < 3; k2++) nor.push(nr.x, nr.y, nr.z); col.push(rootc.r, rootc.g, rootc.b, rootc.r, rootc.g, rootc.b, tipc.r, tipc.g, tipc.b); sw.push(0, 0, 1.0); }
    /* flowers */
    var nf = Math.round(S * S * 0.12 * Q.grass), FC = [0xffffff, 0xfff2a6, 0xffb3c8, 0xd0b8ff, 0xffd166];
    for (i = 0; i < nf; i++) { var fx = x0 + r() * S, fz = z0 + r() * S; if (cls(fx, fz) !== 2) continue; var fh = G.height(fx, fz); if (fh < 0.4) continue; var fc = lin(FC[Math.floor(r() * FC.length)]), cen = lin(0xf2b134), rr2 = 0.07, k3, yy = fh + 0.16;
      for (k3 = 0; k3 < 5; k3++) { var pa = k3 / 5 * Math.PI * 2, pb = (k3 + 0.5) / 5 * Math.PI * 2; pos.push(fx, yy, fz, fx + Math.cos(pa) * rr2, yy + 0.01, fz + Math.sin(pa) * rr2, fx + Math.cos(pb) * rr2, yy + 0.01, fz + Math.sin(pb) * rr2); nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0); col.push(cen.r, cen.g, cen.b, fc.r, fc.g, fc.b, fc.r, fc.g, fc.b); sw.push(0.4, 0.4, 0.4); }
      var stem = lin(0x4f9a3c); pos.push(fx - 0.012, fh, fz, fx + 0.012, fh, fz, fx, yy, fz); nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0); col.push(stem.r, stem.g, stem.b, stem.r, stem.g, stem.b, stem.r, stem.g, stem.b); sw.push(0, 0, 0.4); }
    if (!pos.length) return null;
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('sway', new THREE.Float32BufferAttribute(sw, 1)); g.computeBoundingSphere();
    var me = new THREE.Mesh(g, GT.mat); me.receiveShadow = true; me.castShadow = false; me.matrixAutoUpdate = false; me.updateMatrix(); return me; }
  function updateGrass(cx, cz) { if (!GT.group || Q.grass <= 0) return; var S = GT.size, R = Q.low ? 2 : 3, tx0 = Math.floor(cx / S), tz0 = Math.floor(cz / S), want = {}, i, j;
    for (j = -R; j <= R; j++) for (i = -R; i <= R; i++) { if (i * i + j * j > R * R + 1) continue; var k = (tx0 + i) + ',' + (tz0 + j); want[k] = 1; if (!GT.tiles[k] && GT.queue.indexOf(k) < 0) GT.queue.push(k); }
    Object.keys(GT.tiles).forEach(function (k) { if (!want[k]) { var m = GT.tiles[k]; if (m) { GT.group.remove(m); m.geometry.dispose(); } delete GT.tiles[k]; } });
    GT.queue = GT.queue.filter(function (k) { return want[k]; }); GT.queue.sort(function (a, b) { var pa = a.split(','), pb = b.split(','); return (Math.pow(pa[0] * S - cx, 2) + Math.pow(pa[1] * S - cz, 2)) - (Math.pow(pb[0] * S - cx, 2) + Math.pow(pb[1] * S - cz, 2)); });
    var budget = 2; while (budget-- > 0 && GT.queue.length) { var key = GT.queue.shift(), p = key.split(','); var m2 = grassTile(+p[0], +p[1]); GT.tiles[key] = m2 || 0; if (m2) GT.group.add(m2); } }

  /* ================= roads ================= */
  function roadTex() { return K.ctex(64, 256, function (g, w, h) { var r = K.seeded(3), i; g.fillStyle = '#5c6067'; g.fillRect(0, 0, w, h); for (i = 0; i < 900; i++) { var v = 80 + r() * 40; g.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 6) + ',.35)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); } g.fillStyle = '#f2f0e6'; g.fillRect(3, 0, 3, h); g.fillRect(w - 6, 0, 3, h); g.fillStyle = '#f5d33c'; g.fillRect(w / 2 - 3, 0, 2, h); g.fillRect(w / 2 + 1, 0, 2, h); g.fillStyle = '#7d7a72'; g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h); }, { rep: [1, 1] }); }
  function ribbon(pts, w, lift, closed) { var n = pts.length, pos = [], nor = [], uv = [], idx = [], i, acc = 0;
    for (i = 0; i < n; i++) { var a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n]; if (!closed) { a = pts[Math.max(0, i - 1)]; b = pts[Math.min(n - 1, i + 1)]; } var tx = b[0] - a[0], tz = b[1] - a[1], tl = Math.hypot(tx, tz) || 1, nx = -tz / tl, nz = tx / tl, p = pts[i];
      var hc = G.height(p[0], p[1]), hl = G.height(p[0] + nx * w / 2, p[1] + nz * w / 2), hr = G.height(p[0] - nx * w / 2, p[1] - nz * w / 2), y = Math.max(hc, hl, hr, 0.22) + lift; if (p[2] != null) y = p[2];
      if (i) acc += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      pos.push(p[0] + nx * w / 2, y, p[1] + nz * w / 2, p[0] - nx * w / 2, y, p[1] - nz * w / 2); nor.push(0, 1, 0, 0, 1, 0); uv.push(0, acc / 5, 1, acc / 5); }
    var m = closed ? n : n - 1; for (i = 0; i < m; i++) { var a2 = i * 2, b2 = ((i + 1) % n) * 2; idx.push(a2, b2, a2 + 1, a2 + 1, b2, b2 + 1); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeBoundingSphere(); return g; }
  function rasterRoads(list) { var R = new Uint8Array(G.GW * G.GH); list.forEach(function (L) { var rad = L.r; L.pts.forEach(function (p) { var cx = Math.floor(p[0] - G.X0), cz = Math.floor(p[1] - G.Z0), k = Math.ceil(rad), i, j; for (j = -k; j <= k; j++) for (i = -k; i <= k; i++) { if (i * i + j * j > rad * rad) continue; var x = cx + i, z = cz + j; if (x >= 0 && z >= 0 && x < G.GW && z < G.GH && !R[z * G.GW + x]) R[z * G.GW + x] = L.v || 1; } }); }); return R; }
  function clampLand(pts, min) { return pts.map(function (p) { var x = p[0], z = p[1], it = 0; while (G.sdf(x, z) < min && it++ < 12) { var e = 0.6, gx = G.sdf(x + e, z) - G.sdf(x - e, z), gz = G.sdf(x, z + e) - G.sdf(x, z - e), l = Math.hypot(gx, gz) || 1; x += gx / l * 0.7; z += gz / l * 0.7; } return [x, z]; }); }
  function smoothPts(pts, it, closed) { var p = pts.map(function (q) { return q.slice(); }), n = p.length, k; for (k = 0; k < it; k++) { var q = p.map(function (a) { return a.slice(); }); for (var i = 0; i < n; i++) { if (!closed && (i === 0 || i === n - 1)) continue; var a = p[(i - 1 + n) % n], b = p[(i + 1) % n]; q[i][0] = (a[0] + b[0] + p[i][0] * 2) / 4; q[i][1] = (a[1] + b[1] + p[i][1] * 2) / 4; } p = q; } return p; }
  function spur(a, b, step) { var d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.ceil(d / (step || 1))), out = [], i; for (i = 0; i <= n; i++) out.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); return out; }

  /* ================= the high-speed rail viaduct ================= */
  function railPath() { var pts = G.lines().hsr, out = [], i, raw = pts.map(function (p) { var m = -9, k; for (k = -3; k <= 3; k++) m = Math.max(m, G.height(p[0] + k * 0.7, p[1]), G.height(p[0], p[1] + k * 0.7)); return Math.max(m, 0.2) + 2.1; });
    for (i = 0; i < pts.length; i++) { var s = 0, w = 0, k2; for (k2 = -8; k2 <= 8; k2++) { var j = Math.max(0, Math.min(pts.length - 1, i + k2)), ww = 1 - Math.abs(k2) / 9; s += raw[j] * ww; w += ww; } out.push([pts[i][0], pts[i][1], Math.max(raw[i] - 0.4, s / w)]); }
    var acc = 0; out[0][3] = 0; for (i = 1; i < out.length; i++) { acc += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i][3] = acc; } return out; }
  function railAt(R, s, out) { out = out || {}; var n = R.length, lo = 0, hi = n - 1; s = Math.max(0, Math.min(R[n - 1][3], s)); while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (R[mid][3] <= s) lo = mid; else hi = mid; } var a = R[lo], b = R[hi], t = (s - a[3]) / Math.max(1e-6, b[3] - a[3]); out.x = a[0] + (b[0] - a[0]) * t; out.z = a[1] + (b[1] - a[1]) * t; out.y = a[2] + (b[2] - a[2]) * t; out.dx = b[0] - a[0]; out.dz = b[1] - a[1]; var l = Math.hypot(out.dx, out.dz) || 1; out.dx /= l; out.dz /= l; out.dy = (b[2] - a[2]) / Math.max(1e-6, b[3] - a[3]); return out; }
  function viaduct(R, group) {
    var prof = [[-0.96, -0.35], [0.96, -0.35], [0.96, 0.0], [1.04, 0.0], [1.04, 0.42], [0.92, 0.42], [0.92, 0.06], [-0.92, 0.06], [-0.92, 0.42], [-1.04, 0.42], [-1.04, 0.0], [-0.96, 0.0]] /* a double-track deck: one track each way */, cols = [0xb9b6ae, 0xb9b6ae, 0xd8d5cc, 0xd8d5cc, 0xe8e6de, 0xd8d5cc, 0x8b8a86, 0x8b8a86, 0xd8d5cc, 0xe8e6de, 0xd8d5cc, 0xb9b6ae];
    var pos = [], col = [], idx = [], n = R.length, i, j, np = prof.length;
    for (i = 0; i < n; i++) { var a = R[Math.max(0, i - 1)], b = R[Math.min(n - 1, i + 1)], tx = b[0] - a[0], tz = b[1] - a[1], tl = Math.hypot(tx, tz) || 1, nx = -tz / tl, nz = tx / tl; for (j = 0; j < np; j++) { pos.push(R[i][0] + nx * prof[j][0], R[i][2] + prof[j][1], R[i][1] + nz * prof[j][0]); var c = lin(cols[j]); col.push(c.r, c.g, c.b); } }
    for (i = 0; i < n - 1; i++) for (j = 0; j < np; j++) { var a2 = i * np + j, b2 = i * np + (j + 1) % np, c2 = a2 + np, d2 = b2 + np; idx.push(a2, b2, c2, b2, d2, c2); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
    var deck = new THREE.Mesh(g, K.std({ vc: true, rough: 0.8, side: THREE.DoubleSide })); deck.castShadow = true; deck.receiveShadow = true; group.add(deck);
    /* the rails and the sleepers: two bright lines on the deck */
    var rp = [], rc = [], ri = []; [-0.555, -0.285, 0.285, 0.555].forEach(function (off, q) { for (i = 0; i < n; i++) { var a3 = R[Math.max(0, i - 1)], b3 = R[Math.min(n - 1, i + 1)], tx3 = b3[0] - a3[0], tz3 = b3[1] - a3[1], tl3 = Math.hypot(tx3, tz3) || 1, nx3 = -tz3 / tl3, nz3 = tx3 / tl3; [-0.04, 0.04].forEach(function (w) { rp.push(R[i][0] + nx3 * (off + w), R[i][2] + 0.1, R[i][1] + nz3 * (off + w)); var cc = lin(0xcfd3d8); rc.push(cc.r, cc.g, cc.b); }); } var base = q * n * 2; for (i = 0; i < n - 1; i++) { var a4 = base + i * 2; ri.push(a4, a4 + 1, a4 + 2, a4 + 1, a4 + 3, a4 + 2); } });
    var rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); rg.setAttribute('color', new THREE.Float32BufferAttribute(rc, 3)); rg.setIndex(ri); rg.computeVertexNormals(); var rails = new THREE.Mesh(rg, K.std({ vc: true, rough: 0.3, metal: 0.7, side: THREE.DoubleSide })); group.add(rails);
    /* the piers */
    var pg = K.Batch(); pg.add(K.rbox(0.55, 1, 0.42, 0.08, 2), { p: [0, -0.5, 0] }, 0xd2cfc6); pg.add(K.rbox(1.62, 0.24, 0.55, 0.06, 2), { p: [0, -0.04, 0] }, 0xc8c5bc); var pgeo = pg.geometry(), plist = [];
    for (var s = 2; s < R[n - 1][3] - 1; s += 3.6) { var P = railAt(R, s), gh = G.height(P.x, P.z), top = P.y - 0.36; if (top - gh < 0.4) continue; var hh = top - Math.min(gh, top) + 0.4; plist.push({ m: K.mtx([P.x, top, P.z], [0, Math.atan2(P.dx, P.dz), 0], [1, hh, 1]), x: P.x, z: P.z }); }
    group.userData.piers = plist.map(function (q) { return [q.x, q.z]; });
    var piers = K.inst(pgeo, K.std({ vc: true, rough: 0.85 }), plist); if (piers) group.add(piers); }

  /* ================= time of day ================= */
  var KEYS = [ /* hour: sky top, horizon, low, sun colour, sun k, hemi sky, hemi ground, hemi k, fog, exposure, night, stars, bloom */
    [0, 0x0b1430, 0x1c2c4f, 0x111a33, 0x9fb4ff, 0.26, 0x3a4c84, 0x1a2036, 0.42, 0x1a2644, 1.1, 1, 1, 0.55],
    [4.6, 0x13204a, 0x2c3a62, 0x1a2444, 0x9fb4ff, 0.24, 0x3e5290, 0x1c2438, 0.42, 0x26355a, 1.06, 1, 0.8, 0.5],
    [5.8, 0x4a5f9a, 0xf2a98a, 0x8b7fa0, 0xffb07a, 0.66, 0x8a9cc8, 0x5a4a44, 0.39, 0xd9a99a, 1.0, 0.5, 0.1, 0.42],
    [7.5, 0x5aa6ea, 0xd8eef6, 0xa8d4e8, 0xfff0d6, 1.43, 0xb8dcf4, 0x7a8a5a, 0.47, 0xcfe6f2, 1.0, 0, 0, 0.3],
    [12, 0x3f92e0, 0xcdeaf8, 0xa0d0e8, 0xfff8ec, 1.7, 0xbfe2f8, 0x80905e, 0.5, 0xc8e4f4, 0.98, 0, 0, 0.28],
    [16, 0x4a98e2, 0xd6ecf4, 0xa8d4e6, 0xfff0d8, 1.53, 0xbcdcf2, 0x84905c, 0.48, 0xd0e6f0, 1.0, 0, 0, 0.3],
    [17.6, 0x6a8fd6, 0xffcf96, 0xe0b090, 0xffc27a, 1.31, 0xd8c4b8, 0x8a7a58, 0.42, 0xf2cfa6, 1.02, 0.1, 0, 0.42],
    [18.6, 0x4a5a9e, 0xff9a6a, 0xb07a86, 0xff8a54, 0.71, 0xb09ab0, 0x5a4a48, 0.36, 0xe39c84, 1.04, 0.55, 0.15, 0.55],
    [19.5, 0x1c2a5a, 0x5a4a78, 0x2a2a48, 0xb0b8ff, 0.28, 0x52609a, 0x22283a, 0.4, 0x3a3a62, 1.08, 1, 0.7, 0.6],
    [24, 0x0b1430, 0x1c2c4f, 0x111a33, 0x9fb4ff, 0.26, 0x3a4c84, 0x1a2036, 0.42, 0x1a2644, 1.1, 1, 1, 0.55]];
  var TITLE = [0, 0x8a7fc8, 0xffb8a0, 0xf0a6a0, 0xffc9a0, 1.3, 0xf0c8c8, 0xc89a8a, 0.5, 0xf4bfae, 1.0, 0, 0, 0.5];
  function preset(h) { if (h === 'title') return unpack(TITLE); h = ((h % 24) + 24) % 24; var i; for (i = 0; i < KEYS.length - 1; i++) if (h >= KEYS[i][0] && h <= KEYS[i + 1][0]) break; var a = KEYS[i], b = KEYS[i + 1], t = (h - a[0]) / Math.max(1e-6, b[0] - a[0]), o = unpack(a), p = unpack(b); Object.keys(o).forEach(function (k) { if (o[k] instanceof THREE.Color) o[k].lerp(p[k], t); else if (typeof o[k] === 'number') o[k] += (p[k] - o[k]) * t; }); o.h = h; return o; }
  function unpack(a) { return { top: lin(a[1]), hz: lin(a[2]), low: lin(a[3]), sunC: lin(a[4]), sunK: a[5], hemiS: lin(a[6]), hemiG: lin(a[7]), hemiK: a[8], fog: lin(a[9]), expo: a[10], night: a[11], stars: a[12], bloom: a[13], h: a[0] }; }
  function sunDir(h) { if (h === 'title') return new V3(-0.55, 0.22, -0.8).normalize(); var day = h >= 5.6 && h <= 18.8, a, e; if (day) { a = Math.PI * (h - 6) / 12; e = Math.max(0.06, Math.sin(Math.PI * (h - 5.6) / 13.2)) * 1.15; } else { var hn = h < 6 ? h + 24 : h; a = Math.PI * (hn - 18.8) / 11.2; e = Math.max(0.25, Math.sin(Math.PI * (hn - 18.8) / 11.2)) * 0.9; } return new V3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e) * 0.7 + 0.35).normalize(); }

  /* ================= build ================= */
  function build(scene, opt) {
    opt = opt || {}; Q.low = !!opt.low; if (Q.low) { Q.mapK = 2; Q.step = 1.6; Q.shadow = 1024; Q.view = 105; Q.grass = 0.55; }
    if (opt.quality) Object.assign(Q, opt.quality);
    G.build(); towns(); K.detailTex();
    var W = { scene: scene, Q: Q, colliders: [], interact: [], places: {}, npcs: [], signs: [], chunks: [], anim: [], night: 0, relabelers: [] };
    var M = K.M();
    /* the lines */
    var R = railPath(); W.rail = R; W.railAt = function (s, o) { return railAt(R, s, o); };
    var stops = {}; G.STATIONS.forEach(function (k) { var p = G.PL[k], best = 0, bd = 1e9; R.forEach(function (q, i) { var d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = i; } }); stops[k] = { s: R[best][3], i: best }; }); W.stops = stops;
    /* the station districts are known before the roads (the frames ARCH will build them in), so the roads go round them, not through */
    var SF = {}; G.STATIONS.forEach(function (k) { var P = railAt(R, stops[k].s, {}), nx = -P.dz, nz = P.dx, t1 = G.sdf(P.x + nx * 10, P.z + nz * 10), t2 = G.sdf(P.x - nx * 10, P.z - nz * 10); if (t2 > t1) { nx = -nx; nz = -nz; } if ((k === 'tpe' || k === 'tao') && nz < 0) { nx = -nx; nz = -nz; }
      var cx = P.x + nx * 4.2, cz = P.z + nz * 4.2; SF[k] = { nx: nx, nz: nz, c: nz, s: nx, toW: function (lx, lz) { return [cx + lx * nz + lz * nx, cz - lx * nx + lz * nz]; } }; });
    function frameOf(p, rot) { var c = Math.cos(rot), sn = Math.sin(rot); return { c: c, s: sn, toW: function (lx, lz) { return [p[0] + lx * c + lz * sn, p[1] - lx * sn + lz * c]; } }; }
    var KO = [], KOS = []; function obb(F2, lx, lz, hw, hd, only) { var w = F2.toW(lx, lz), o = { x: w[0], z: w[1], c: F2.c, s: F2.s, hw: hw, hd: hd }; if (only !== 'spur') KO.push(o); if (only !== 'ring') KOS.push(o); }
    function disc(p, r, ringOnly) { var o = { x: p[0], z: p[1], r: r }; KO.push(o); if (!ringOnly) KOS.push(o); }
    Object.keys(SF).forEach(function (k) { var F2 = SF[k]; obb(F2, -0.5, 6.0, 14.2, 10.6, 'ring'); /* the ring goes round the whole district (behind the station it passes under the viaduct) */ obb(F2, 0, 0, 5.6, 3.8, 'spur'); obb(F2, -4.75, 14.2, 4.7, 1.6, 'spur'); obb(F2, 11.9, 12.6, 2.0, 4.0, 'spur'); obb(F2, -12.6, 9.2, 1.6, 3.8, 'spur'); obb(F2, -8.2, 8.5, 2.4, 2.4, 'spur'); });
    function shrineRot() { var p = G.PL.shrine; return G.PL.shrineRot != null ? G.PL.shrineRot : Math.atan2(G.PL.tao[0] - p[0], G.PL.tao[1] - p[1]); }
    (function () { obb(frameOf(G.PL.shrine, shrineRot()), 0, 1.6, 2.7, 6.4); })();
    (function () { var p = G.PL.diner, q = SF.tpe.toW(0, 8); obb(frameOf(p, Math.atan2(q[0] - p[0], q[1] - p[1])), 0, 0, 3.8, 5.8); })();
    disc(G.PL.temple, 4.6); disc([G.PL.lotus[0], G.PL.lotus[1] + 1.4], 3.6); disc(G.PL.port, 3.0); if (G.PL.kenA) disc(G.PL.kenA, 5.6);
    function pushOut(pts, list, m) { pts.forEach(function (p) { list.forEach(function (o) { var dx = p[0] - o.x, dz = p[1] - o.z; if (o.r != null) { var d = Math.hypot(dx, dz); if (d < o.r + m) { var k2 = (o.r + m) / (d || 1e-3); p[0] = o.x + dx * k2; p[1] = o.z + dz * k2; } return; }
      var lx = dx * o.c - dz * o.s, lz = dx * o.s + dz * o.c, ex = o.hw + m - Math.abs(lx), ez = o.hd + m - Math.abs(lz); if (ex > 0 && ez > 0) { if (ex < ez) lx = (lx < 0 ? -1 : 1) * (o.hw + m); else lz = (lz < 0 ? -1 : 1) * (o.hd + m); p[0] = o.x + lx * o.c + lz * o.s; p[1] = o.z - lx * o.s + lz * o.c; } }); }); return pts; }
    var ring = smoothPts(clampLand(G.lines().ring, 2.2), 3, true), spurs = [], it;
    for (it = 0; it < 4; it++) { ring = pushOut(ring, KO, 1.9); ring = smoothPts(ring, 1, true); } ring = pushOut(ring, KO, 1.9);
    W.ring = ring; W.KO = KO;
    /* the roads and their raster (for the trees and the paint) */
    var roadList = [{ pts: ring, r: 1.6 }], spurTo = ['tpe', 'tao', 'hsz', 'txg', 'chw', 'yun', 'cyi', 'tnn', 'khh', 'shrine', 'port', 'hua', 'tai', 'chishang', 'lotus', 'temple', 'magong', 'eluan', 'taroko'];
    var BACK = { shrine: 0, temple: 4.2, lotus: 4.4, port: 4.2, eluan: 3.4, taroko: 0, ken: 0 };
    spurTo.forEach(function (k) { var p = G.PL[k], sp; if (k === 'magong') return;
      if (SF[k]) { /* into the plaza by its open side: in front between the rows, or at the side by the station */ var F2 = SF[k], E = [[F2.toW(4.6, 19.5), F2.toW(4.6, 13.2)], [F2.toW(17.5, 6.0), F2.toW(10.4, 6.0)]], ni0 = G.nearOn(ring, E[0][0][0], E[0][0][1]), ni1 = G.nearOn(ring, E[1][0][0], E[1][0][1]), e = ni0.d <= ni1.d ? E[0] : E[1], ni = ni0.d <= ni1.d ? ni0 : ni1, q0 = ring[ni.i];
        sp = spur(q0, e[0], 1).concat(spur(e[0], e[1], 1).slice(1)); var last = sp.length - Math.ceil(Math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1])) - 1; for (it = 0; it < 3; it++) { var head = pushOut(sp.slice(0, Math.max(1, last)), KOS, 1.4); sp = smoothPts(head.concat(sp.slice(Math.max(1, last))), 1, false); } }
      else { var ni2 = G.nearOn(ring, p[0], p[1]), q = ring[ni2.i]; if (ni2.d < 1.5) return; var bk = BACK[k] || 0, dd = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, tgt = bk && dd > bk + 1 ? [p[0] + (q[0] - p[0]) / dd * bk, p[1] + (q[1] - p[1]) / dd * bk] : p; sp = spur(q, tgt, 1); if (k === 'shrine') { var Fs = frameOf(p, shrineRot()), e1 = Fs.toW(0, 11.4), e2 = Fs.toW(0, 9.8), nq = G.nearOn(ring, e1[0], e1[1]), hd = spur(ring[nq.i], e1, 1); for (it = 0; it < 3; it++) hd = smoothPts(pushOut(hd, KOS, 1.4), 1, false); sp = hd.concat(spur(e1, e2, 1).slice(1)); } }
      spurs.push(sp); roadList.push({ pts: sp, r: 1.2 }); });
    /* mountain roads: Alishan from Chiayi */
    var ali = smoothPts([G.ll(120.45, 23.48), G.ll(120.56, 23.46), G.ll(120.66, 23.50), G.ll(120.73, 23.52), G.PL.ali].map(function (p) { return p; }), 2, false), aliL = G.line(ali, 1, false); spurs.push(aliL); roadList.push({ pts: aliL, r: 1.1 });
    /* Sun Moon Lake: its own road round the shore (Provincial Highway 21 and the Zhongzheng road of County Road 131), further out where Shuishe,
       Ita Thao and the visitor centre need room between it and the water */
    var Lk = G.lake, LB = [[-1.36, 0.64, 4.2], [2.08, 1.16, 1.6], [-0.12, -1.22, 1.0], [1.78, -1.62, 3.2]].map(function (q) { var c = Lk.local(q[0], q[1]); return [c[0], c[1], q[2]]; });
    var lakeR = G.lakeRoad(function (x, z) { var d = 2.7; LB.forEach(function (b) { var r = Math.hypot(x - b[0], z - b[1]); d += b[2] * Math.exp(-r * r / 40); }); return d; }); W.lakeRoad = lakeR; roadList.push({ pts: lakeR, r: 1.25 });
    function nearLake(p, m) { return Lk.sd(p[0], p[1]) > -(m || 4); }
    function toLakeRoad(p) { var ni = G.nearOn(lakeR, p[0], p[1]); return lakeR[ni.i].slice(0, 2); }
    /* from Taichung's side up to the lake: it joins the lake road at the north-west, by Shuishe */
    var smlIn = G.ll(120.84, 23.90), sml = G.line([G.ll(120.68, 24.0), G.ll(120.76, 23.95), smlIn, toLakeRoad(smlIn)], 1, false); spurs.push(sml); roadList.push({ pts: sml, r: 1.1 });
    /* the culture park's own road, up from the lake road east of Ita Thao */
    if (G.PL.smlPark) { var pk = G.PL.smlPark, pe = [pk[0] - 2.6, pk[1] + 1.6], pq = toLakeRoad(pe), pkL = G.line([pq, [(pq[0] + pe[0]) / 2, (pq[1] + pe[1]) / 2], pe], 1, false); spurs.push(pkL); roadList.push({ pts: pkL, r: 1.0 }); W.parkRoad = pkL; }
    /* the cross-island highways (Provincial Highways 7, 8 and 20), the New Central Cross-Island Highway (21, which meets the lake road and
       leaves it again for Shuili and Tataka) and Highway 14A over Wuling, through their real towns */
    var HW = { t7: [[121.2871, 24.8806], [121.3469, 24.8139], [121.3628, 24.7969], [121.3486, 24.7386], [121.3594, 24.7117], [121.3858, 24.6811], [121.4314, 24.6475], [121.4732, 24.6507], [121.4919, 24.6094], [121.5700, 24.6392], [121.6099, 24.6780], [121.6647, 24.7114], [121.7530, 24.7571]],
      t8: [[120.8282, 24.2587], [120.8598, 24.1616], [121.0069, 24.2033], [121.1003, 24.2325], [121.1611, 24.2492], [121.2089, 24.2581], [121.2544, 24.2544], [121.3100, 24.1807], [121.3375, 24.1872], [121.3850, 24.1764], [121.4511, 24.2072], [121.4936, 24.1828], [121.5672, 24.1758], [121.6046, 24.1645], [121.6216, 24.1557], [121.6511, 24.1264]],
      t20: [[120.2050, 22.9926], [120.3063, 23.0368], [120.4611, 23.1247], [120.5889, 23.0833], [120.6997, 23.1083], [120.7656, 23.1603], [120.8253, 23.2739], [120.9152, 23.2797], [120.9627, 23.2659], [120.9850, 23.2486], [121.0217, 23.1872], [121.0417, 23.1681], [121.1239, 23.1328], [121.1783, 23.1014]],
      t21: [[120.8598, 24.1616], [120.9172, 24.0578], [120.9694, 23.9664], [120.9022, 23.8572], [120.8539, 23.8117], [120.8547, 23.6967], [120.8886, 23.5922], [120.8904, 23.4878]],
      t14a: [[120.9694, 23.9664], [121.0500, 23.9900], [121.1306, 24.0235], [121.1580, 24.0583], [121.2058, 24.1033], [121.2333, 24.1167], [121.2756, 24.1371], [121.3100, 24.1807]] };
    W.highways = {}; Object.keys(HW).forEach(function (k) { var raw = HW[k].map(function (q) { return G.ll(q[0], q[1]); }), segs = [], cur = [], prevNear = false;
      raw.forEach(function (p) { var nr = nearLake(p, 4); if (nr) { if (cur.length) { cur.push(toLakeRoad(cur[cur.length - 1])); segs.push(cur); cur = []; } } else { if (prevNear) cur.push(toLakeRoad(p)); cur.push(p); } prevNear = nr; }); if (cur.length > 1) segs.push(cur);
      segs.forEach(function (sg, si) { if (sg.length < 2) return; var ln = G.line(sg.length > 2 ? smoothPts(sg, 2, false) : sg, 1, false).filter(function (p) { return G.sdf(p[0], p[1]) > 0.6; }); if (ln.length > 2) { spurs.push(ln); roadList.push({ pts: ln, r: 1.0 }); W.highways[k + (si ? '_' + si : '')] = ln; } }); });
    /* the Yushan main-peak trail: from Tataka at the end of Highway 21, in switchbacks up the west face to the summit */
    (function () { var a = (W.highways.t21_1 || W.highways.t21 || [G.PL.tataka]).slice(-1)[0], b = G.PL.yushanTop, dx = b[0] - a[0], dz = b[1] - a[1], dl = Math.hypot(dx, dz) || 1, nx = -dz / dl, nz = dx / dl, pts = [[a[0], a[1]]], N = 11, i;
      for (i = 1; i < N; i++) { var t = i / N, sw = (i % 2 ? 1 : -1) * 1.25 * Math.sin(Math.PI * Math.min(1, t * 1.15)); pts.push([a[0] + dx * t + nx * sw, a[1] + dz * t + nz * sw]); } pts.push([b[0] - dx / dl * 0.6, b[1] - dz / dl * 0.6]);
      var tr = G.line(pts, 0.4, false); W.trail = tr; roadList.push({ pts: tr, r: 0.6, v: 2 }); })();
    /* every road keeps a smooth grade: the ground beneath and its shoulders are cut and filled to meet it (the ring first, then the lake road,
       then the branches, each of which meets the road it leaves at that road's level) */
    G.grade(ring, 1.5, 2.2, { closed: true, grade: 0.32, lift: 0.06 }); G.grade(lakeR, 1.4, 2.0, { closed: true, grade: 0.3, lift: 0.06, min: Lk.h + 0.6 });
    spurs.forEach(function (sp) { if (sp === lakeR) return; G.grade(sp, 1.2, 2.0, { grade: 0.4, lift: 0.05, pinA: true, pinB: true }); });
    W.spurs = spurs; var roadG = rasterRoads(roadList); W.roadG = roadG;
    /* the ground */
    var paint = paintGround(roadG); W.paint = paint; W.cls = cls; W.groundRGB = groundRGB;
    var gTex = new THREE.CanvasTexture(paint); gTex.encoding = THREE.sRGBEncoding; gTex.anisotropy = 8; gTex.minFilter = THREE.LinearMipmapLinearFilter;
    var tMat = K.std({ map: gTex, rough: 0.96, detail: 1 }); W.groundTex = gTex;
    var terr = new THREE.Group(); terr.name = 'terrain'; scene.add(terr);
    for (var cz = G.Z0; cz < G.Z0 + G.GH; cz += CS) for (var cx = G.X0; cx < G.X0 + G.GW; cx += CS) { var ch = terrainChunk(cx, cz, tMat); if (ch) { terr.add(ch); W.chunks.push({ o: ch, x: cx + CS / 2, z: cz + CS / 2, r: CS * 0.75 }); } }
    /* the sea */
    var sd = G.SDFA(), sdD = new Uint8Array(G.GW * G.GH * 4), i; for (i = 0; i < G.GW * G.GH; i++) { var v = Math.max(0, Math.min(255, Math.round((sd[i] + 12) / 24 * 255))); sdD[i * 4] = v; sdD[i * 4 + 1] = v; sdD[i * 4 + 2] = v; sdD[i * 4 + 3] = 255; }
    var sdT = new THREE.DataTexture(sdD, G.GW, G.GH, THREE.RGBAFormat); sdT.magFilter = THREE.LinearFilter; sdT.minFilter = THREE.LinearFilter; sdT.needsUpdate = true;
    var seaG = new THREE.PlaneGeometry(1100, 1100, Q.low ? 110 : 176, Q.low ? 110 : 176); seaG.rotateX(-Math.PI / 2); var sea = new THREE.Mesh(seaG, K.seaMat(sdT, [G.X0, G.Z0, G.GW, G.GH])); sea.position.y = -0.03; sea.frustumCulled = false; sea.receiveShadow = false; scene.add(sea); W.sea = sea;
    /* the lakes: Sun Moon Lake, the lotus pond */
    var lakeMat = K.std({ color: 0x2f8fa8, rough: 0.06, metal: 0.2, env: 1.4 }); W.lakeMat = lakeMat; [{ p: G.PL.lotus, r: 3.6, h: 0.72 }].forEach(function (L) { var lg = new THREE.CircleGeometry(L.r, 48); lg.rotateX(-Math.PI / 2); var lm = new THREE.Mesh(lg, lakeMat); lm.position.set(L.p[0], L.h, L.p[1]); lm.receiveShadow = true; scene.add(lm); });
    /* Sun Moon Lake: a sheet over its real outline, jade green, deeper away from the shore */
    (function () { var L = G.lake, P = L.poly, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, st = 0.45; P.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]); }); x0 -= 1; z0 -= 1; x1 += 1; z1 += 1;
      var nx = Math.ceil((x1 - x0) / st) + 1, nz = Math.ceil((z1 - z0) / st) + 1, pos = new Float32Array(nx * nz * 3), sdA = new Float32Array(nx * nz), idx = [], i, j, wy = L.h - 0.03;
      for (j = 0; j < nz; j++) for (i = 0; i < nx; i++) { var k = j * nx + i, x = x0 + i * st, z = z0 + j * st; pos[k * 3] = x; pos[k * 3 + 1] = wy; pos[k * 3 + 2] = z; sdA[k] = L.sd(x, z); }
      for (j = 0; j < nz - 1; j++) for (i = 0; i < nx - 1; i++) { var a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; if (Math.max(sdA[a], sdA[b], sdA[c], sdA[d]) < -0.5) continue; idx.push(a, c, b, b, c, d); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSd', new THREE.BufferAttribute(sdA, 1)); g.setIndex(idx); g.computeBoundingSphere();
      var lm = new THREE.Mesh(g, K.lakeMat(sea.material.uniforms)); lm.frustumCulled = true; scene.add(lm); W.smlWater = lm; W.smlWY = wy; })();
    /* the sky */
    var sky = new THREE.Mesh(new THREE.SphereGeometry(800, 40, 20), K.skyMat()); sky.frustumCulled = false; sky.renderOrder = 1000; /* (v55) drawn after every opaque surface: the costly sky runs only where it is seen */ scene.add(sky); W.sky = sky; if (typeof ATMO !== 'undefined' && sky.material.uniforms.uSunE) { var SKU = ATMO.SKYU, su0 = sky.material.uniforms; SKU.uSunW = su0.uSun; SKU.uSunE = su0.uSunE; SKU.uMoonW = su0.uMoon; SKU.uMoonE = su0.uMoonE; SKU.uOverW = su0.uOver; }
    /* the clouds: a layer over the island, and the sea of clouds of the title over Taipei */
    var ctex = K.blobTex(), cg = new THREE.PlaneGeometry(1, 0.625), cl = [], r = K.seeded(13); for (i = 0; i < (Q.low ? 50 : 90); i++) { var ccx = G.X0 + r() * (G.GW + 120) - 60, ccz = G.Z0 + r() * G.GH, s2 = 14 + r() * 22; cl.push({ p: [ccx, 34 + r() * 16, ccz], s: [s2, s2, s2] }); }
    var clouds = K.inst(cg, K.cloudMat(ctex), cl, { cast: false, recv: false }); clouds.frustumCulled = false; clouds.renderOrder = 2; clouds.material.uniforms.uNear.value = 36; /* a cloud the camera flies into thins away instead of greying the view (Alishan, the high roads) */ scene.add(clouds); W.clouds = clouds;
    var tp = G.PL.tpe, tl = []; for (i = 0; i < (Q.low ? 70 : 120); i++) { var a = r() * 6.283, d2 = 4 + Math.pow(r(), 0.7) * 90, s3 = 10 + r() * 18; tl.push({ p: [tp[0] + Math.cos(a) * d2, 61 + r() * 4 - d2 * 0.02, tp[1] + 34 + Math.sin(a) * d2], s: [s3, s3, s3] }); }
    var tclouds = K.inst(cg, K.cloudMat(ctex), tl, { cast: false, recv: false }); tclouds.frustumCulled = false; tclouds.renderOrder = 2; tclouds.visible = false; scene.add(tclouds); W.titleClouds = tclouds;
    /* the light */
    var sun = new THREE.DirectionalLight(0xffffff, 3); sun.castShadow = true; sun.shadow.mapSize.set(Q.shadow, Q.shadow); var sc = sun.shadow.camera; sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26; sc.near = 1; sc.far = 160; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.035; scene.add(sun); scene.add(sun.target); W.sun = sun;
    var hemi = new THREE.HemisphereLight(0xbfe2f8, 0x80905e, 0.75); scene.add(hemi); W.hemi = hemi;
    scene.fog = new THREE.Fog(0xcfe6f2, 70, 200); W.fog = scene.fog; if (sky.material.uniforms.uFogC) sky.material.uniforms.uFogC.value = scene.fog.color; /* the sky meets the fog's own colour at the horizon */
    /* the environment map from a small sky scene */
    var envScene = new THREE.Scene(), envSky = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { uTop: { value: lin(0x4f9be0) }, uHz: { value: lin(0xd3ecf7) }, uLow: { value: lin(0x6b8a5a) }, uSun: sky.material.uniforms.uSun, uMoon: sky.material.uniforms.uMoon, uSunE: sky.material.uniforms.uSunE || { value: 0 }, uMoonE: sky.material.uniforms.uMoonE || { value: 0 }, uOver: sky.material.uniforms.uOver || { value: 0 }, tAtm: { value: typeof ATMO !== 'undefined' ? ATMO.tex.atm : null }, uPhys: { value: typeof ATMO !== 'undefined' ? 0.85 : 0 } }, vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: ['uniform vec3 uTop,uHz,uLow,uSun,uMoon; uniform float uPhys,uSunE,uMoonE,uOver; uniform sampler2D tAtm; varying vec3 vD;', (typeof ATMO !== 'undefined' ? ATMO.GLSL : 'vec3 atmSky(sampler2D t, vec3 d, vec3 b, float s){ return vec3(0.0); }'), 'void main(){ vec3 d = normalize(vD); float y = d.y; vec3 g = mix(uHz, uTop, pow(clamp(y,0.0,1.0),0.6)); vec3 c = y > 0.0 ? g : mix(uHz, uLow, clamp(-y*2.5,0.0,1.0)); if (uPhys > 0.0 && y > -0.02) { vec3 a = (atmSky(tAtm, vec3(d.x, max(y, 0.01), d.z), uSun, 0.0) * uSunE + atmSky(tAtm, vec3(d.x, max(y, 0.01), d.z), uMoon, 1.0) * uMoonE) * 0.5; /* (v57) the sky light on materials kept at the old palette level: the far hills had gone white */ c = mix(c, mix(a, g, uOver), uPhys * smoothstep(-0.02, 0.06, y)); } gl_FragColor = vec4(c, 1.0); }'].join('\n') })); envScene.add(envSky); W.envScene = envScene; W.envSky = envSky;
    /* the trees */
    var TG = treeGeos(), tl2 = scatterTrees(roadG), leaf = M.leaf, trees = new THREE.Group(); trees.name = 'trees'; scene.add(trees);
    Object.keys(tl2).forEach(function (k) { var L = tl2[k], im = K.inst(TG[L.type], leaf, L.items); if (!im) return; trees.add(im); L.im = im; W.chunks.push({ o: im, x: G.X0 + (L.cx + 0.5) * CS, z: G.Z0 + (L.cz + 0.5) * CS, r: CS * 0.8 }); });
    /* the trunks are solid: a small round collider at every tree, so nobody walks through one */ var TRK = { round: 0.14, cone: 0.13, palm: 0.1, betel: 0.08, bamboo: 0.22, sakura: 0.13, banyan: 0.3 }; Object.keys(tl2).forEach(function (k) { var L = tl2[k], tr = TRK[L.type] || 0.13; L.items.forEach(function (it) { var sc = typeof it.s === 'number' ? it.s : it.s ? it.s[0] : 1; W.colliders.push({ x: it.p[0], z: it.p[2], r: tr * sc, tree: 1, it: it }); }); });
    W.trees = trees; W.TREE = TG;
    /* the grass field */
    GT.mat = K.noflip(K.std({ vc: true, rough: 0.95, side: THREE.DoubleSide, wind: true })); GT.group = new THREE.Group(); GT.group.name = 'grass'; scene.add(GT.group); GT.no = [];
    G.ZONES.forEach(function (Z) { if (/^(port|magong)$/.test(Z.id)) GT.no.push([Z.x, Z.z, Z.r * 0.72]); }); W.grassNo = GT.no;
    /* the roads */
    var rt = roadTex(); rt.wrapS = rt.wrapT = THREE.RepeatWrapping; function rmat(po) { return K.std({ map: rt, rough: 0.9, po: po }); }
    /* where two roads meet, one is always drawn over the other (a polygon offset per road, the ring on top), so no junction flickers */
    var roads = new THREE.Group(); roads.name = 'roads'; scene.add(roads); var rm = new THREE.Mesh(ribbon(ring, 1.7, 0.06, true), rmat(-2.6)); rm.receiveShadow = true; roads.add(rm);
    var lm2 = new THREE.Mesh(ribbon(lakeR, 1.5, 0.06, true), rmat(-2.2)); lm2.receiveShadow = true; roads.add(lm2);
    spurs.forEach(function (sp, i) { var m = new THREE.Mesh(ribbon(sp, 1.25, 0.05, false), rmat(-1.0 - (i % 6) * 0.18)); m.receiveShadow = true; roads.add(m); });
    /* the mountain trail: packed earth and stone, draped on the slope */
    if (W.trail) { var tt = K.ctex(32, 128, function (g, w, h) { var r = K.seeded(5), i; g.fillStyle = '#8a7458'; g.fillRect(0, 0, w, h); for (i = 0; i < 260; i++) { var v = 100 + r() * 70; g.fillStyle = 'rgba(' + v + ',' + (v - 12) + ',' + (v - 30) + ',.55)'; g.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); } g.fillStyle = 'rgba(70,58,44,.5)'; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h); }, { rep: [1, 1] }); tt.wrapS = tt.wrapT = THREE.RepeatWrapping;
      var trp = W.trail.map(function (p) { var h0 = Math.max(G.height(p[0], p[1]), G.height(p[0] + 0.2, p[1]), G.height(p[0] - 0.2, p[1]), G.height(p[0], p[1] + 0.2), G.height(p[0], p[1] - 0.2)); return [p[0], p[1], h0 + 0.05]; });
      var tm = new THREE.Mesh(ribbon(trp, 0.42, 0.05, false), K.std({ map: tt, rough: 0.95, po: -1 })); tm.receiveShadow = true; roads.add(tm); }
    /* the viaduct */
    var vg = new THREE.Group(); vg.name = 'hsr'; scene.add(vg); viaduct(R, vg); (vg.userData.piers || []).forEach(function (q) { W.colliders.push({ x: q[0], z: q[1], r: 0.3 }); }); /* the piers of the viaduct are solid */
    /* the buildings, the props */
    W.noGrass = function (x, z, r) { var i, j, x0 = Math.floor(x - r - G.X0), x1 = Math.ceil(x + r - G.X0), z0 = Math.floor(z - r - G.Z0), z1 = Math.ceil(z + r - G.Z0); for (j = z0; j <= z1; j++) for (i = x0; i <= x1; i++) { if (i < 0 || j < 0 || i >= G.GW || j >= G.GH) continue; if (Math.hypot(i + G.X0 + 0.5 - x, j + G.Z0 + 0.5 - z) <= r && CLS[j * G.GW + i] > 0) CLS[j * G.GW + i] = 4; } };
    if (typeof ARCH !== 'undefined') ARCH.build(W, { M: M, G: G, K: K, Q: Q, scene: scene, R: R, railAt: function (s, o) { return railAt(R, s, o); }, stops: stops, towns: TOWNS, ring: ring, spurs: spurs });
    if (typeof PROPS !== 'undefined' && PROPS.world) PROPS.world(W, { M: M, G: G, K: K, Q: Q, scene: scene });
    /* a tree that a building, a landmark or a prop was later set on is taken away, with its trunk */ (function () { var zero = new THREE.Matrix4().makeScale(0, 0, 0), solid = W.colliders.filter(function (c) { return !c.tree; });
      Object.keys(tl2).forEach(function (k) { var L = tl2[k], hit = false; if (!L.im) return; L.items.forEach(function (it, i) { var x = it.p[0], z = it.p[2]; if (solid.some(function (c) { if (Math.abs(c.x - x) > 9 || Math.abs(c.z - z) > 9) return false; if (c.r) return Math.hypot(c.x - x, c.z - z) < c.r + 0.15; var co = Math.cos(c.rot), si = Math.sin(c.rot), ex = x - c.x, ez = z - c.z; return Math.abs(ex * co - ez * si) < c.hw + 0.35 && Math.abs(ex * si + ez * co) < c.hd + 0.35; })) { L.im.setMatrixAt(i, zero); it.gone = true; hit = true; } }); if (hit) L.im.instanceMatrix.needsUpdate = true; });
      W.colliders = W.colliders.filter(function (c) { return !(c.tree && c.it && c.it.gone); }); })();
    /* ---------- API ---------- */
    W.height = function (x, z) { return G.height(x, z); };
    W.land = function (x, z) { return G.sdf(x, z) > 0.15; };
    W.preset = preset;
    W.setTime = function (h) { var P = preset(h), sd2 = sunDir(h); W.P = P; W.hour = h;
      sky.material.uniforms.uTop.value.copy(P.top); sky.material.uniforms.uHz.value.copy(P.hz); sky.material.uniforms.uLow.value.copy(P.low); sky.material.uniforms.uSun.value.copy(sd2); sky.material.uniforms.uSunC.value.copy(P.sunC); sky.material.uniforms.uStars.value = P.stars; sky.material.uniforms.uMoonK.value = P.night; sky.material.uniforms.uMoon.value.set(-sd2.x, Math.abs(sd2.y) + 0.2, -sd2.z).normalize();
      if (h !== 'title' && (h < 5.6 || h > 18.8)) { sky.material.uniforms.uSun.value.set(0, -1, 0); }
      sun.color.copy(P.sunC); sun.intensity = P.sunK; W.sunDir = sd2; hemi.color.copy(P.hemiS); hemi.groundColor.copy(P.hemiG); hemi.intensity = P.hemiK; if (W.urban) hemi.groundColor.copy(lin(0x6e6a64)).multiplyScalar(1 - P.night * 0.75);
      W.fogLin = P.fog.clone(); if (W.post) scene.fog.color.copy(P.fog); else { var c = P.fog.clone().convertLinearToSRGB(); scene.fog.color.setRGB(c.r, c.g, c.b); }
      var sm = sea.material.uniforms; sm.uSun.value.copy(sd2); sm.uSunC.value.copy(P.sunC).multiplyScalar(P.night > 0.5 ? 0.25 : 1); sm.uFog.value.copy(P.fog); sm.uSky.value.copy(P.hz); sm.uDeep.value.copy(lin(0x1a6ea8)).multiplyScalar(1 - P.night * 0.75); sm.uShallow.value.copy(lin(0x3fd0d2)).multiplyScalar(1 - P.night * 0.7);
      [clouds, tclouds].forEach(function (c2) { c2.material.uniforms.uCol.value.copy(P.hz).lerp(lin(0xffffff), 0.55).multiplyScalar(1 - P.night * 0.55); c2.material.uniforms.uShade.value.copy(P.low).lerp(P.top, 0.3).multiplyScalar(1 - P.night * 0.5); });
      K.U.uNight.value = P.night; W.night = P.night;
      if (W.post) { W.post.final.uniforms.uExpo.value = P.expo; W.post.final.uniforms.uBloom.value = P.bloom * (W.Q.bloom == null ? 1 : W.Q.bloom); }
      envSky.material.uniforms.uTop.value.copy(P.top); envSky.material.uniforms.uHz.value.copy(P.hz); envSky.material.uniforms.uLow.value.copy(W.urban ? hemi.groundColor : P.hemiG); W.envDirty = true;
      if (W._atmoFix) W._atmoFix(P, sd2, h);
      W.relabelers.forEach(function (f) { if (f.time) f.time(P); }); };
    /* a city's ground (asphalt and concrete, not grass) for the light bounced from below and the reflections of the lower sky */
    W.setUrban = function (on) { on = !!on; if (!!W.urban === on) return; W.urban = on; var P = W.P; if (!P) return; if (on) hemi.groundColor.copy(lin(0x6e6a64)).multiplyScalar(1 - (P.night || 0) * 0.75); else hemi.groundColor.copy(P.hemiG); envSky.material.uniforms.uLow.value.copy(hemi.groundColor); W.envDirty = true; };
    W.follow = function (x, z, camPos) { /* the light, the sea, the sky and the visible chunks follow the camera target */
      var d = W.sunDir || new V3(0.3, 0.8, 0.4); sun.position.set(x + d.x * 60, Math.max(8, d.y * 60), z + d.z * 60); sun.target.position.set(x, 0, z); sun.target.updateMatrixWorld();
      var snap = 1100 / (Q.low ? 110 : 176); sea.position.x = Math.round(x / snap) * snap; sea.position.z = Math.round(z / snap) * snap;
      if (camPos) { sky.position.copy(camPos); var fx = x - camPos.x, fz = z - camPos.z, fl = Math.hypot(fx, fz); if (fl > 0.01 && W._atF) { W._atF[0] = fx / fl; W._atF[1] = fz / fl; } }
      var vr = Q.view; W.chunks.forEach(function (c) { var dd = Math.hypot(c.x - x, c.z - z) - c.r; c.o.visible = dd < vr; });
      W.parts && W.parts.forEach(function (p) { var dd = Math.hypot(p.x - x, p.z - z) - p.r; p.o.visible = dd < vr + 10; });
      updateGrass(x, z); };
    W.update = function (dt, t) { K.U.uTime.value = t; W.anim.forEach(function (f) { f(dt, t); }); };
    W.envUpdate = function (R3) { if (!W.envDirty || !R3) return; W.envDirty = false; if (!W.pmrem) W.pmrem = new THREE.PMREMGenerator(R3); var old = scene.environment; var rtE = W.pmrem.fromScene(envScene, 0, 0.1, 100); scene.environment = rtE.texture; if (W._envRT) W._envRT.dispose(); W._envRT = rtE; };
    W.relabel = function (fn) { W.relabelers.forEach(function (f) { if (f.label) f.label(fn); }); };
    W.region = function (x, z) { var best = null, bd = 1e9; Object.keys(W.places).forEach(function (k) { var p = W.places[k], d = Math.hypot(p.x - x, p.z - z); if (d < (p.rr || 16) && d < bd) { bd = d; best = k; } }); return best; };
    (function () {
    /* ================= the real sky: the hour by the sun's altitude, the moon, the stars, the weather, the season =================
       The palette follows the true solar elevation (degrees): night below -18, the blue hour, the golden hour, the day. The weather
       greys the sky and softens the sun, brings the fog in, wets the ground, rains, flashes. The street lamps light the ground. */
    var SKYK = [ /* alt: top, horizon, low, light colour, light k, hemi sky, hemi ground, hemi k, fog, glow, stars, night, exposure, bloom */
      [-90, 0x03060f, 0x070e1e, 0x050a14, 0x9fb4ff, 0, 0x142038, 0x070a10, 0.16, 0x070d1a, 0x000000, 1, 1, 1.22, 0.3],
      [-18, 0x03060f, 0x070e1e, 0x050a14, 0x9fb4ff, 0, 0x142038, 0x070a10, 0.16, 0x070d1a, 0x000000, 1, 1, 1.22, 0.3],
      [-12, 0x060d24, 0x111d40, 0x0a101e, 0x9fb4ff, 0, 0x1c2a50, 0x0b0f18, 0.2, 0x0d1528, 0x14183a, 0.85, 1, 1.22, 0.32],
      [-6, 0x13205a, 0x343a6c, 0x181d34, 0xffa070, 0, 0x3a4888, 0x181c2a, 0.34, 0x222848, 0x6c3e66, 0.35, 0.85, 1.18, 0.4],
      [-3, 0x283e84, 0x7c6488, 0x342f44, 0xff9a66, 0.06, 0x6676a6, 0x2e2f36, 0.52, 0x6e5a74, 0xc0684e, 0.06, 0.6, 1.15, 0.6],
      [0, 0x3a5aa6, 0xe09c7c, 0x86788a, 0xff8a4a, 0.35, 0x8e9ab8, 0x4c4a40, 0.55, 0xd09884, 0xff8c50, 0, 0.32, 1.1, 0.55],
      [3, 0x4a76c6, 0xf2c29a, 0xb4a6a0, 0xffb070, 0.82, 0xb4bed4, 0x666048, 0.45, 0xe6c2a8, 0xff9e5e, 0, 0.1, 1.04, 0.5],
      [8, 0x4a8ad6, 0xdcdedc, 0xa8c8dc, 0xffdcb4, 1.35, 0xbcd4ec, 0x7a8456, 0.48, 0xd6e2ea, 0x6a4a30, 0, 0, 1.0, 0.45],
      [20, 0x4392e0, 0xd2eaf6, 0xa4d0e8, 0xfff0d8, 1.6, 0xbfe0f6, 0x80905e, 0.5, 0xcde6f4, 0x000000, 0, 0, 0.98, 0.42],
      [45, 0x3f90e0, 0xcdeaf8, 0xa0d0e8, 0xfff8ec, 1.72, 0xbfe2f8, 0x80905e, 0.5, 0xc8e4f4, 0x000000, 0, 0, 0.97, 0.42],
      [90, 0x3f90e0, 0xcdeaf8, 0xa0d0e8, 0xfff8ec, 1.72, 0xbfe2f8, 0x80905e, 0.5, 0xc8e4f4, 0x000000, 0, 0, 0.97, 0.42]];
    function palette(alt) { var i; for (i = 0; i < SKYK.length - 2; i++) if (alt < SKYK[i + 1][0]) break; var a = SKYK[i], b = SKYK[i + 1], t = Math.max(0, Math.min(1, (alt - a[0]) / Math.max(1e-6, b[0] - a[0]))); t = t * t * (3 - 2 * t);
      function C(k) { return lin(a[k]).lerp(lin(b[k]), t); } function N(k) { return a[k] + (b[k] - a[k]) * t; }
      return { top: C(1), hz: C(2), low: C(3), sunC: C(4), sunK: N(5), hemiS: C(6), hemiG: C(7), hemiK: N(8), fog: C(9), glow: C(10), stars: N(11), night: N(12), expo: N(13), bloom: N(14), h: alt }; }
    function grey(c, k, dark) { var l = c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722; c.lerp(new THREE.Color(l, l * 1.01, l * 1.04), k); c.multiplyScalar(dark); return c; }
    /* ================= (v55) the physical sky: the air's tables follow the sun and the moon; the palette leans toward what the air gives =================
       The sky shader draws the scattering itself; here the lights, the fog and the hemisphere take their colours from the same tables (the sun
       reddens through the air it crosses, the fog glows toward the sun), the cloud layer drifts with the real wind, the rainbow appears when the
       sun shines into the rain (or just after it), a bolt is drawn with each flash of a thunderstorm. */
    var AT = { wx: 0, wz: 0, cx: 0, cz: 0, dt: 0, bolt: [0, 0, 0.28], bow: 0, after: 0, rain0: 0, lp: 0.5, dark: 0.2, q: 2, fwd: [0, -1] }; W._atF = AT.fwd;
    var C1 = new THREE.Color(), C2 = new THREE.Color();
    function ac(a, s) { return C1.setRGB(a[0] * s, a[1] * s, a[2] * s); }
    function sEl(v) { return Math.asin(Math.max(-1, Math.min(1, v))); }
    function hashD(n) { var x = Math.sin(n * 91.345 + 7.13) * 43758.5453; return x - Math.floor(x); }
    function atmoTables(sd, md, mie) { if (typeof ATMO === 'undefined') return false; ATMO.want(sEl(sd[1]), md ? sEl(md[1]) : -1, Math.round(mie * 20) / 20); if (ATMO.A.cur.sun < -90) ATMO.now(); else ATMO.step(2.2); return true; }
    /* the palette, before the clouds grey it: the zenith, the horizon, the fog, the sky light and the sun's colour from the air */
    function skyK(P) { return 0.7 + 0.3 * Math.max(0, Math.min(1, P.h / 12)); }
    function atmoBlend(P, sd, cl) { if (typeof ATMO === 'undefined') return; var PRb = ATMO.probe, E = 24 * skyK(P), w = Math.max(0, Math.min(1, (P.h + 9) / 7)) * 0.62;
      if (w <= 0) return; P.top.lerp(ac(PRb.zen, E * 0.95), w * 0.55); P.hz.lerp(ac(PRb.hz, E), w); P.fog.lerp(ac(PRb.hz, E * 0.8), w * 0.6); P.low.lerp(ac(PRb.hz, E * 0.7), w * 0.5);
      var up = ac(PRb.up, E), ul = Math.max(1e-4, up.r * 0.2126 + up.g * 0.7152 + up.b * 0.0722), pl = Math.max(1e-4, P.hemiS.r * 0.2126 + P.hemiS.g * 0.7152 + P.hemiS.b * 0.0722); C2.copy(up).multiplyScalar(pl / ul); P.hemiS.lerp(C2, w * 0.45);
      var T = PRb.sunT, mx = Math.max(T[0], T[1], T[2]); if (mx > 1e-4 && P.h > -1) { C2.setRGB(T[0] / mx, T[1] / mx, T[2] / mx); var sl = Math.max(1e-4, P.sunC.r * 0.2126 + P.sunC.g * 0.7152 + P.sunC.b * 0.0722), cl2 = C2.r * 0.2126 + C2.g * 0.7152 + C2.b * 0.0722; C2.multiplyScalar(sl / Math.max(1e-4, cl2)); P.sunC.lerp(C2, w * 0.7); } }
    /* the sky's uniforms (both the real sky and the fixed hours of the title) */
    function atmoUni(P, sd, md, mIll, cl, rain, storm) { var u = sky.material.uniforms; if (!u.uSunE) return; var PRb = typeof ATMO !== 'undefined' ? ATMO.probe : null, E = 24 * skyK(P) * (1 - cl * 0.42) * (1 - rain * 0.25), mUp = md && md[1] > -0.05;
      u.uSunE.value = E; u.uMoonE.value = mUp ? 24 * 0.0068 * Math.pow(Math.max(0, mIll), 1.25) * (1 - cl * 0.5) : 0; u.uNight.value = Math.pow(Math.max(0, P.night), 1.6);
      u.uOver.value = Math.max(0, Math.min(1, (cl - 0.72) / 0.28)) * 0.86; u.uCl.value.set(Math.min(1, 0.04 + cl * 0.96), AT.cirr == null ? 0.4 : AT.cirr * (1 - Math.max(0, Math.min(1, (cl - 0.65) / 0.3))), Math.min(1, rain * 0.8 + storm * 0.3), AT.q);
      u.uCloud.value = cl; u.uWind.value.set(AT.cx, AT.cz, AT.wx, AT.wz); u.uBow.value = AT.bow;
      var nt = Math.max(0, P.night); u.uLP.value.setRGB(0.0105, 0.0072, 0.0046).multiplyScalar(nt * AT.lp * (1 + cl * 1.4)); u.uMilky.value = Math.max(0, 1 - AT.lp * 1.6) * Math.max(0, 1 - cl * 1.4) * (AT.dark || 0); u.uFogLin.value = W.post ? 1 : 0;
      /* the fog: its glow toward the sun, from the difference the table finds between the horizon under the sun and all round */
      var FS = ATMO.FOGU.kFogS.value, FC = ATMO.FOGU.kFogC.value, sw = Math.max(0, Math.min(1, (P.h + 4) / 5)) * (1 - cl * 0.82);
      if (PRb && sw > 0) { var lob = [Math.max(0, PRb.hzS[0] - PRb.hz[0]), Math.max(0, PRb.hzS[1] - PRb.hz[1]), Math.max(0, PRb.hzS[2] - PRb.hz[2])], k = 24 * skyK(P) * 1.15 * sw;
        if (W.post) { FC.x = lob[0] * k; FC.y = lob[1] * k; FC.z = lob[2] * k; } else { var f0 = scene.fog.color; C2.setRGB(Math.pow(f0.r, 2.2) + lob[0] * k, Math.pow(f0.g, 2.2) + lob[1] * k, Math.pow(f0.b, 2.2) + lob[2] * k).convertLinearToSRGB(); FC.x = Math.max(0, C2.r - f0.r); FC.y = Math.max(0, C2.g - f0.g); FC.z = Math.max(0, C2.b - f0.b); }
        FS.x = sd[0]; FS.y = sd[1]; FS.z = sd[2]; FS.w = 1; } else FS.w = 0;
      var FH = ATMO.FOGU.kFogH.value; FH.x = W.fogBaseY || 0; FH.y = W.fogHeight || 45; FH.z = W.fogHK == null ? 0.3 : W.fogHK;
      /* the sun for the post-processing: its rays strongest low in a broken sky or a haze, its flare while it is seen */
      if (W.post && W.post.sun) { var ps = W.post.sun, vis = Math.max(0, Math.min(1, (P.h + 0.8) / 2.2)) * Math.max(0, 1 - Math.pow(cl, 1.5) * 1.08), low = 1 - Math.max(0, Math.min(1, (P.h - 3) / 45));
        ps.dir.set(sd[0], sd[1], sd[2]).normalize(); ps.rays = vis * (0.45 + 0.85 * low) * (0.7 + 1.1 * Math.min(1, cl * 2.4) * (1 - cl)) * (1 + WXS.fog * 0.8) * (W.raysK == null ? 1 : W.raysK) * 0.42; ps.flare = vis * (W.flareK == null ? 0 : W.flareK);
        ps.col.set(P.sunC.r, P.sunC.g, P.sunC.b).multiplyScalar(1.5 * vis); }
      /* the billboard clouds: their silver lining toward the sun */ K.U.uCSun.value.set(sd[0], sd[1], sd[2]); K.U.uCSunL.value.copy(P.sunC).multiplyScalar(Math.max(0, Math.min(1, (P.h + 1) / 3)) * (1 - cl * 0.7) * 1.4); }
    W._atmoFix = function (P, sd2, h) { if (typeof ATMO === 'undefined') return; var sd = [sd2.x, sd2.y, sd2.z]; atmoTables(sd, null, 1.2); ATMO.now(); AT.cirr = 0.45; AT.bow = 0; var u = sky.material.uniforms; u.uBolt.value.z = 0; atmoUni(P, sd, null, 0, h === 'title' ? 0.05 : 0.22, 0, 0); };
    W.atmoPlace = function (o) { o = o || {}; AT.lp = o.lp == null ? 0.5 : o.lp; AT.dark = o.dark == null ? 0.2 : o.dark; AT.q = o.q == null ? AT.q : o.q; W.fogBaseY = o.fogY || 0; W.fogHeight = o.fogH || 45; W.fogHK = o.fogK == null ? 0.3 : o.fogK; };
    W.atmoState = function () { return { at: AT, cur: typeof ATMO !== 'undefined' ? ATMO.A.cur : null, ver: typeof ATMO !== 'undefined' ? ATMO.A.ver : 0, probe: typeof ATMO !== 'undefined' ? ATMO.probe : null }; };
    /* every frame: the wind carries the cloud layers, the rainbow comes and goes, the cirrus of the day */
    function atmoTick(dt, A, wt, cl) { var wd = ((wt && wt.windDir) || 45) * Math.PI / 180, ws = Math.max(3, WXS.wind || 10) * 0.0045, vx = -Math.sin(wd), vz = Math.cos(wd);
      AT.cx += vx * ws * dt; AT.cz += vz * ws * dt; AT.wx += vx * ws * dt * 2.2 + ws * dt * 0.4; AT.wz += vz * ws * dt * 2.2; AT.cx %= 4000; AT.cz %= 4000; AT.wx %= 4000; AT.wz %= 4000;
      var day = SKYST.date ? Math.floor(SKYST.date.getTime() / 86400000) : 0; AT.cirr = 0.18 + 0.62 * hashD(day) * hashD(day + 0.5 + Math.floor((SKYST.date ? SKYST.date.getUTCHours() : 0) / 6));
      /* the rainbow: the sun low enough (below 42°), out between the clouds, the rain falling, or the last of it */
      if (AT.rain0 > 0.1 && WXS.rain < 0.05) AT.after = 300; AT.rain0 = WXS.rain; AT.after = Math.max(0, AT.after - dt);
      var alt = A.sun.alt, geo = Math.max(0, Math.min(1, (alt - 1) / 4)) * Math.max(0, Math.min(1, (41.5 - alt) / 5)), wet = Math.max(Math.min(1, WXS.rain * 5), AT.after / 300 * 0.75), open = Math.max(0, 1 - Math.max(0, cl - 0.55) / 0.35);
      var bw = window.ISLE_BOW != null ? +window.ISLE_BOW : geo * wet * open; AT.bow += (bw - AT.bow) * (1 - Math.exp(-dt / 3)); if (!dt) AT.bow = bw; }
    var WXS = { cloud: 0.2, rain: 0, fog: 0, thunder: 0, wind: 10, wet: 0, snow: 0, vis: 30 }, SKYST = { A: null, se: null, wx: null, t: 0, envT: 0, x: 0, z: 0 }, FLASH = { k: 0, next: 4, seq: [] };
    var EQ = new THREE.Matrix3();
    /* the brightest stars, where they really are (RA hours, Dec degrees, magnitude): the constellations are there to be found */
    var STARS = [[6.752, -16.72, -1.46], [6.399, -52.7, -0.74], [14.261, 19.18, -0.05], [18.616, 38.78, 0.03], [5.278, 46.0, 0.08], [5.242, -8.2, 0.13], [7.655, 5.22, 0.34], [1.629, -57.24, 0.46], [5.919, 7.41, 0.5], [14.064, -60.37, 0.61], [19.846, 8.87, 0.76], [12.443, -63.1, 0.76], [4.599, 16.51, 0.86], [16.49, -26.43, 0.96], [13.42, -11.16, 0.97], [7.755, 28.03, 1.14], [22.961, -29.62, 1.16], [20.69, 45.28, 1.25], [12.795, -59.69, 1.25], [10.14, 11.97, 1.35], [6.977, -28.97, 1.5], [7.577, 31.89, 1.58], [17.56, -37.1, 1.62], [12.519, -57.11, 1.63], [5.419, 6.35, 1.64], [5.438, 28.61, 1.65], [9.22, -69.72, 1.67], [5.604, -1.2, 1.69], [22.137, -46.96, 1.73], [5.679, -1.94, 1.77], [12.9, 55.96, 1.77], [11.062, 61.75, 1.79], [3.405, 49.86, 1.79], [7.14, -26.39, 1.83], [17.622, -43.0, 1.86], [18.403, -34.38, 1.85], [8.375, -59.51, 1.86], [13.792, 49.31, 1.86], [5.992, 44.95, 1.9], [16.811, -69.03, 1.91], [6.629, 16.4, 1.93], [20.427, -56.74, 1.94], [2.53, 89.26, 1.98], [6.378, -17.96, 1.98], [9.46, -8.66, 1.98], [2.12, 23.46, 2.0], [0.727, -17.99, 2.04], [18.921, -26.3, 2.05], [14.111, -36.37, 2.06], [13.399, 54.93, 2.23], [0.14, 29.09, 2.06], [1.163, 35.62, 2.06], [5.796, -9.67, 2.09], [14.845, 74.16, 2.08], [17.582, 12.56, 2.08], [3.136, 40.96, 2.12], [2.065, 42.33, 2.1], [11.818, 14.57, 2.13], [5.533, -0.3, 2.23], [11.031, 56.38, 2.37], [11.897, 53.69, 2.44], [12.257, 57.03, 3.31], [0.675, 56.54, 2.24], [0.153, 59.15, 2.28], [0.945, 60.72, 2.47], [1.43, 60.24, 2.68], [1.907, 63.67, 3.37], [21.736, 9.88, 2.39], [23.079, 15.21, 2.48], [23.063, 28.08, 2.42], [0.22, 15.18, 2.83], [20.37, 40.26, 2.23], [19.512, 27.96, 3.05], [3.791, 24.11, 2.87], [16.006, -22.62, 2.29], [14.848, -16.04, 2.75], [13.036, 10.96, 2.83], [15.738, 6.43, 2.63], [17.943, 51.49, 2.24], [21.31, 62.59, 2.45]];
    var stG = new THREE.BufferGeometry(), stP = new Float32Array(STARS.length * 3), stS = new Float32Array(STARS.length); STARS.forEach(function (q, k) { stS[k] = Math.max(1.6, 6.2 - (q[2] + 1.5) * 1.15); });
    stG.setAttribute('position', new THREE.BufferAttribute(stP, 3)); stG.setAttribute('size', new THREE.BufferAttribute(stS, 1));
    var stM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: true, fog: false, blending: THREE.AdditiveBlending, uniforms: { uK: { value: 0 }, uDpr: { value: 1 }, uTime: K.U.uTime },
      vertexShader: 'attribute float size; uniform float uDpr, uTime; varying float vA; void main(){ vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w * 0.99985; vA = 0.8 + 0.2 * sin(uTime * 2.1 + position.x * 0.07); gl_PointSize = size * uDpr; }',
      fragmentShader: 'uniform float uK; varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float r = length(q); float a = smoothstep(0.5, 0.0, r); a = a * a; gl_FragColor = vec4(vec3(1.0, 0.97, 0.92) * a * uK * vA * 1.4, 1.0); }' });
    var stars = new THREE.Points(stG, stM); stars.frustumCulled = false; stars.renderOrder = -1; scene.add(stars); W.stars = stars;
    /* the rain: streaks in a box that travels with the camera, drawn by the GPU from a fixed buffer */
    var RN = Q.low ? 900 : 2400, rp = new Float32Array(RN * 2 * 3), ra = new Float32Array(RN * 2 * 4), re = new Float32Array(RN * 2), rr0 = K.seeded(77);
    for (i = 0; i < RN; i++) { var ax = rr0() * 2 - 1, az = rr0() * 2 - 1, ay = rr0(), aw = rr0(); [0, 1].forEach(function (e2) { var k = i * 2 + e2; ra.set([ax, az, ay, aw], k * 4); re[k] = e2; }); }
    var rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); rg.setAttribute('a', new THREE.BufferAttribute(ra, 4)); rg.setAttribute('e', new THREE.BufferAttribute(re, 1));
    var rainM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, uniforms: { uC: { value: new V3() }, uT: K.U.uTime, uBox: { value: 9 }, uH: { value: 12 }, uWv: { value: new THREE.Vector2() }, uA: { value: 0 }, uFall: { value: 11 }, uLen: { value: 0.045 }, uCol: { value: new THREE.Color(0.7, 0.76, 0.86) } },
      vertexShader: 'uniform vec3 uC; uniform float uT, uBox, uH, uFall, uLen; uniform vec2 uWv; attribute vec4 a; attribute float e; varying float vE; void main(){ float sp = uFall * (0.8 + a.w * 0.4); float y = mod(a.z * uH - uT * sp, uH); vec3 p = vec3(uC.x + a.x * uBox, uC.y - 3.0 + y, uC.z + a.y * uBox); vec3 v = vec3(uWv.x, -sp, uWv.y); p += v * uLen * e; vE = e; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }',
      fragmentShader: 'uniform float uA; uniform vec3 uCol; varying float vE; void main(){ gl_FragColor = vec4(uCol, uA * (0.35 + 0.65 * vE)); }' });
    var rain = new THREE.LineSegments(rg, rainM); rain.frustumCulled = false; rain.visible = false; rain.renderOrder = 3; scene.add(rain); W.rain = rain;
    function applySky(P, sunD, moon, cl) {
      var u = sky.material.uniforms; u.uTop.value.copy(P.top); u.uHz.value.copy(P.hz); u.uLow.value.copy(P.low); u.uSun.value.set(sunD[0], sunD[1], sunD[2]); u.uSunC.value.copy(P.sunC); u.uGlowC.value.copy(P.glow);
      u.uSunK.value = Math.max(0, Math.min(1, (P.h + 1.2) / 1.5)) * Math.max(0, 1 - Math.pow(cl, 1.3) * 0.97); u.uStars.value = P.stars * Math.max(0, 1 - cl * 1.1); u.uCloud.value = cl;
      if (moon) { u.uMoon.value.set(moon.dir[0], moon.dir[1], moon.dir[2]); u.uMoonK.value = moon.alt > -1 ? (0.35 + 0.65 * P.night) * Math.max(0, 1 - cl * 0.9) : 0; } else u.uMoonK.value = 0;
      stM.uniforms.uK.value = u.uStars.value;
      /* the light: the sun while it is up (never from below the horizon), else the moon by its phase and height, else the faint sky */
      var ld = sunD, lc = P.sunC, lk = P.sunK * Math.max(0.06, 1 - Math.pow(cl, 1.4) * 0.82);
      if (P.h < -2 && moon && moon.alt > 1.5) { ld = moon.dir; lc = lin(0xa4b8ff); lk = 0.2 * Math.pow(moon.illum, 1.5) * Math.min(1, Math.sin(moon.alt * Math.PI / 180) * 3.5) * Math.max(0.1, 1 - cl * 0.85); }
      else if (P.h < -2) { ld = [0.25, 0.9, 0.35]; lc = lin(0x8ea4e0); lk = 0.05; }
      var lv = new V3(ld[0], Math.max(0.08, ld[1]), ld[2]).normalize(); sun.color.copy(lc); sun.intensity = lk; W.sunDir = lv;
      hemi.color.copy(P.hemiS); hemi.groundColor.copy(P.hemiG); hemi.intensity = P.hemiK * (1 + cl * 0.25);
      W.fogLin = P.fog.clone(); if (W.post) scene.fog.color.copy(P.fog); else { var c = P.fog.clone().convertLinearToSRGB(); scene.fog.color.setRGB(c.r, c.g, c.b); }
      var sm = sea.material.uniforms; sm.uSun.value.copy(lv); sm.uSunC.value.copy(lc).multiplyScalar(lk / 1.7); sm.uFog.value.copy(P.fog); sm.uSky.value.copy(P.hz); sm.uDeep.value.copy(lin(0x1a6ea8)).multiplyScalar((1 - P.night * 0.8) * (1 - cl * 0.3)); sm.uShallow.value.copy(lin(0x3fd0d2)).multiplyScalar((1 - P.night * 0.75) * (1 - cl * 0.3));
      [clouds, tclouds].forEach(function (c2) { c2.material.uniforms.uCol.value.copy(P.hz).lerp(lin(0xffffff), 0.55 - cl * 0.25).multiplyScalar((1 - P.night * 0.7) * (1 - WXS.rain * 0.35)); c2.material.uniforms.uShade.value.copy(P.low).lerp(P.top, 0.3).multiplyScalar((1 - P.night * 0.6) * (1 - cl * 0.35)); });
      K.U.uNight.value = P.night; W.night = P.night; W.P = P;
      if (W.post) { W.post.final.uniforms.uExpo.value = P.expo * (1 + cl * 0.08); W.post.final.uniforms.uBloom.value = P.bloom * (W.Q.bloom == null ? 1 : W.Q.bloom); }
      envSky.material.uniforms.uTop.value.copy(P.top); envSky.material.uniforms.uHz.value.copy(P.hz); envSky.material.uniforms.uLow.value.copy(P.hemiG);
      atmoUni(P, sunD, moon && moon.dir, moon ? moon.illum : 0, cl, WXS.rain, WXS.thunder ? 1 : 0);
      W.relabelers.forEach(function (f) { if (f.time) f.time(P); }); }
    /* where and when: the clock of the island and the place the camera looks at */
    W.skyAt = function (x, z) { SKYST.x = x; SKYST.z = z; };
    W.sky2 = function (date, force) { var A = SKY.at(date, SKYST.x, SKYST.z), se = SKY.season(date), wt = SKY.weather(date, SKYST.x, SKYST.z); SKYST.A = A; SKYST.se = se; SKYST.wx = wt; SKYST.date = date;
      if (force) { WXS.cloud = wt.cloud; WXS.rain = Math.max(wt.rain, wt.drizzle * 0.5); WXS.fog = wt.fog; WXS.wet = Math.max(WXS.wet, WXS.rain > 0.1 ? 0.8 : 0); WXS.snow = wt.snow; }
      K.U.uSeason.value.set(se.tint[0], se.tint[1], se.tint[2]); K.U.uBloomS.value = se.bloom;
      EQ.set.apply(EQ, A.eq); sky.material.uniforms.uEq.value.copy(EQ);
      var lat = A.lat * Math.PI / 180, ll = SKY.lonlat(SKYST.x, SKYST.z);
      STARS.forEach(function (q, k) { var ra = q[0] / 12 * Math.PI, dec = q[1] * Math.PI / 180, X = Math.cos(dec) * Math.cos(ra), Y = Math.cos(dec) * Math.sin(ra), Z = Math.sin(dec), e = A.eq;
        /* world = M v, M the transpose of eq */ stP[k * 3] = (e[0] * X + e[3] * Y + e[6] * Z) * 760; stP[k * 3 + 1] = (e[1] * X + e[4] * Y + e[7] * Z) * 760; stP[k * 3 + 2] = (e[2] * X + e[5] * Y + e[8] * Z) * 760; });
      stG.attributes.position.needsUpdate = true; W.skyTick(0, true); return A; };
    /* every frame: the weather eases toward the latest report, the palette follows the sun, the rain falls, the lightning flashes */
    W.skyTick = function (dt, now) { var A = SKYST.A, wt = SKYST.wx; if (!A || !wt) return; var k = now ? 1 : 1 - Math.exp(-dt / 12);
      WXS.cloud += (wt.cloud - WXS.cloud) * k; var rT = Math.max(wt.rain, wt.drizzle * 0.55, wt.snow * 0.8); WXS.rain += (rT - WXS.rain) * k; WXS.fog += (wt.fog - WXS.fog) * k; WXS.snow += ((wt.snow > 0 ? 1 : 0) - WXS.snow) * k; WXS.wind += ((wt.wind || 10) - WXS.wind) * k; WXS.thunder = wt.thunder;
      var wetT = WXS.rain > 0.05 ? Math.min(1, 0.45 + WXS.rain) : 0; WXS.wet += (wetT - WXS.wet) * (wetT > WXS.wet ? 1 - Math.exp(-dt / 25) : 1 - Math.exp(-dt / 240)); if (now) WXS.wet = Math.max(WXS.wet, wetT * 0.9);
      K.U.uWet.value = WXS.wet; K.U.uWind.value = Math.max(0.5, Math.min(3, 0.6 + WXS.wind / 22));
      var cl = Math.min(1, WXS.cloud + WXS.rain * 0.2), P = palette(A.sun.alt); AT.dt = dt || 0; atmoTables(A.sun.dir, A.moon && A.moon.dir, 0.85 + WXS.fog * 2.5 + cl * 0.6 + WXS.rain * 0.8); atmoBlend(P, A.sun.dir, cl); atmoTick(dt || 0, A, wt, cl); grey(P.top, cl * 0.82, 1 - cl * 0.32 - WXS.rain * 0.18); grey(P.hz, cl * 0.75, 1 - cl * 0.2 - WXS.rain * 0.15); grey(P.low, cl * 0.6, 1 - cl * 0.2); grey(P.fog, cl * 0.7 + WXS.fog * 0.3, 1 - cl * 0.15); grey(P.hemiS, cl * 0.6, 1); P.sunC.lerp(lin(0xf2f0ec), cl * 0.5); P.glow.multiplyScalar(1 - cl * 0.7);
      /* lightning */ if (WXS.thunder && WXS.rain > 0.3) { FLASH.next -= dt; if (FLASH.next <= 0) { FLASH.next = 5 + Math.random() * 14; FLASH.seq = [0, 0.09, 0.2, 0.32].map(function (x, j) { return [x, j % 2 ? 0 : 1]; }); FLASH.t = 0; AT.bolt = [Math.atan2(AT.fwd[0], AT.fwd[1]) + (Math.random() - 0.5) * 1.3, Math.random() * 97, 0.16 + Math.random() * 0.2]; } }
      if (FLASH.seq.length) { FLASH.t += dt; var on = 0; FLASH.seq.forEach(function (q, j) { var nx = FLASH.seq[j + 1]; if (FLASH.t >= q[0] && (!nx || FLASH.t < nx[0])) on = q[1]; }); FLASH.k = on * (FLASH.t < 0.4 ? 1 : 0); if (FLASH.t > 0.5) FLASH.seq = []; } else FLASH.k = 0;
      applySky(P, A.sun.dir, A.moon, cl); sky.material.uniforms.uFlash.value = FLASH.k * 0.9; if (FLASH.k) { hemi.intensity += 1.6; } if (sky.material.uniforms.uBolt) { sky.material.uniforms.uBolt.value.set(AT.bolt[0], AT.bolt[1], FLASH.k ? 1 : (FLASH.seq.length ? 0.25 : 0), AT.bolt[2]); if (window.ISLE_BOLT) { AT.bolt = [Math.atan2(AT.fwd[0], AT.fwd[1]) + 0.2, 13, 0.3]; sky.material.uniforms.uBolt.value.set(AT.bolt[0], AT.bolt[1], 1, AT.bolt[2]); sky.material.uniforms.uFlash.value = 0.5; } }
      /* the fog: haze in the rain, close in a fog, far on a clear day */ var far = 200 - cl * 30 - WXS.rain * 70; if (WXS.fog > 0.05) far = far * (1 - WXS.fog) + 38 * WXS.fog; if (wt.vis != null && wt.vis < 20) far = Math.min(far, Math.max(36, wt.vis * 12)); scene.fog.far = far; scene.fog.near = Math.min(70, far * 0.32);
      /* the clouds: as many as the cover */ clouds.count = Math.max(6, Math.round(clouds.instanceMatrix.count * (0.15 + 0.85 * cl)));
      SKYST.envT -= dt; if (SKYST.envT <= 0 || now) { SKYST.envT = 15; W.envDirty = true; } };
    W.rainTick = function (camPos) { var a = WXS.rain; rain.visible = a > 0.02 && camPos.y < 40; if (!rain.visible) return; var u = rainM.uniforms; u.uC.value.copy(camPos); u.uA.value = Math.min(0.5, 0.12 + a * 0.4) * (W.post ? 1 : 0.8);
      var sn = WXS.snow > 0.5; u.uFall.value = sn ? 1.6 : 11 + a * 4; u.uLen.value = sn ? 0.02 : 0.05; u.uCol.value.setRGB(sn ? 1 : 0.68, sn ? 1 : 0.74, sn ? 1 : 0.85).multiplyScalar(0.5 + (1 - W.night) * 0.6);
      var wr = (WXS.wind / 3.6) * 0.35, wd = ((SKYST.wx && SKYST.wx.windDir) || 45) * Math.PI / 180; u.uWv.value.set(-Math.sin(wd) * wr, Math.cos(wd) * wr); rg.setDrawRange(0, Math.round(RN * Math.min(1, 0.15 + a)) * 2); };
    W.wxState = function () { return { flash: FLASH.k, cloud: WXS.cloud, rain: WXS.rain, fog: WXS.fog, wet: WXS.wet, thunder: WXS.thunder, wind: WXS.wind, snow: WXS.snow, report: SKYST.wx, sun: SKYST.A && SKYST.A.sun, moon: SKYST.A && SKYST.A.moon, season: SKYST.se }; };
    /* the street lamps that light the ground: the nearest twelve to the camera's target, in view space (bent like the world) */
    var LV = new V3(), LS = [], SPW = { p: new V3(), d: new V3(), k: 0 };
    W.setSpot = function (p, d, k, o) { o = o || {}; SPW.p.copy(p); SPW.d.copy(d).normalize(); SPW.k = k; K.U.uSpCos.value.set(Math.cos(o.outer || 0.5), Math.cos(o.inner || 0.28)); K.U.uSpR.value = o.range || 18; if (o.color) K.U.uSpC.value.set(o.color); };
    W.lightsTick = function (cam, tx, tz) { var n = 0, nk = W.night, U2 = K.U, mv = cam.matrixWorldInverse, f = U2.uFocus.value, cv = U2.uCurve.value;
      function toView(v) { v.applyMatrix4(mv); var iDz = Math.max(0, -v.z - f); v.y -= cv * iDz * iDz; return v; }
      if (nk > 0.05 && W.glows) { LS.length = 0; W.glows.forEach(function (g) { var d = Math.hypot(g[0] - tx, g[2] - tz); if (d < 34) LS.push([d, g]); }); LS.sort(function (a, b) { return a[0] - b[0]; });
        for (var j = 0; j < LS.length && n < (Q.low ? 6 : 12); j++) { var g = LS[j][1]; toView(LV.set(g[0], g[1] - 0.05, g[2])); U2.uLLp.value[n].set(LV.x, LV.y, LV.z, 2.8 * nk * Math.min(1, (34 - LS[j][0]) / 8) * (g[4] || 1)); n++; } }
      U2.uLLn.value = n;
      if (SPW.k > 0.01) { toView(LV.copy(SPW.p)); U2.uSpP.value.copy(LV); var d2 = SPW.d.clone().transformDirection(mv); U2.uSpD.value.copy(d2); U2.uSpK.value = SPW.k; } else U2.uSpK.value = 0; };

      var setTimeOld = W.setTime; W.setTimeFixed = function (h) { setTimeOld(h); var u = sky.material.uniforms; u.uMoonK.value = 0; u.uStars.value = 0; stM.uniforms.uK.value = 0; rain.visible = false; K.U.uLLn.value = 0; W.night = 0; };
      W.setTime = function (h) { if (h === 'title' || !SKYST.A) { setTimeOld(h); var u = sky.material.uniforms; if (h === 'title') { u.uSunK.value = 1; u.uGlowC.value.setRGB(0.25, 0.1, 0.06); u.uCloud.value = 0; u.uMoonK.value = 0; u.uStars.value = 0; stM.uniforms.uK.value = 0; rain.visible = false; K.U.uLLn.value = 0; } return; } W.skyTick(0, true); };
    })();
    W.setTime(12); return W; }
  return { build: build, Q: Q, preset: preset, sunDir: sunDir, railAt: railAt, cls: cls, groundRGB: groundRGB };
})();


