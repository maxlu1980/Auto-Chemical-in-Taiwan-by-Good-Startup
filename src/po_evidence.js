/* ===== [po_evidence.js] ===== */
/* ===== PROTECT ONE · the catalogue's four demonstrations, rendered as photographs =====
   PoEvidence.render(cb) builds the four bench scenes the catalogue describes — Oya stone bare and coated, the UV-indicator paper under glass,
   the salt-sprayed nails, the screwdriver on the cured film — and photographs them: a studio environment of softboxes for the reflections,
   a soft key light with 4096 px shadows, physically based materials (clear coat, transmission glass and water, rust, stone, paper), geometry
   with real edges (every box rounded or chamfered, nails and the screwdriver turned on a lathe, the rust raised, the film dented) and
   procedural textures of several octaves with their own roughness maps. Each scene is rendered twice the output size into a render target,
   then a post pass focuses it like a macro lens (depth of field from the depth buffer), tone-maps it (ACES), adds the faint vignette and grain
   of a camera, and the result is downsampled to 1600 × 800 and kept as a JPEG data URL — in memory and, when it fits, in localStorage, so a
   device renders the four photographs once. One scene per task, so the page never stalls; the renderer is released afterwards. */
var PoEvidence = (function () {
  var cache = null, busy = false, waiters = [], KEY = 'ac-po-ev3', OW = 1600, OH = 800;
  function lcg(seed) { var s = seed; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function small() { return !!(window.SMALL3D || (window.ISLE_TIER === 'low') || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 500)); }
  /* ---- fractal value noise, one field per seed, sampled by the texture painters ---- */
  function field(S, seed, oct, lac) { var r = lcg(seed), out = new Float32Array(S * S), o, amp = 1, tot = 0, n = 3, i, j;
    for (o = 0; o < oct; o++) { var G = n + 1, grid = new Float32Array(G * G); for (i = 0; i < grid.length; i++) grid[i] = r();
      for (j = 0; j < S; j++) { var v = j / S * n, vi = Math.floor(v) % n, vf = v - Math.floor(v), vs = vf * vf * (3 - 2 * vf), v1 = (vi + 1) % n; for (i = 0; i < S; i++) { var u = i / S * n, ui = Math.floor(u) % n, uf = u - Math.floor(u), us = uf * uf * (3 - 2 * uf), u1 = (ui + 1) % n; var a = grid[vi * G + ui], b = grid[vi * G + u1], c = grid[v1 * G + ui], d = grid[v1 * G + u1]; out[j * S + i] += amp * (a + (b - a) * us + (c - a) * vs + (a - b - c + d) * us * vs); } }
      tot += amp; amp *= 0.55; n = Math.round(n * (lac || 2)); }
    for (i = 0; i < out.length; i++) out[i] /= tot; return out; }
  function paint(S, fn) { var c = mkCanvas(S, S), g = c.getContext('2d'), img = g.createImageData(S, S), d = img.data, i, j, px = [0, 0, 0]; for (j = 0; j < S; j++) for (i = 0; i < S; i++) { fn(i, j, px); var k = (j * S + i) * 4; d[k] = px[0]; d[k + 1] = px[1]; d[k + 2] = px[2]; d[k + 3] = 255; } g.putImageData(img, 0, 0); return c; }
  function grey(S, fn) { return paint(S, function (i, j, px) { var v = Math.round(255 * clamp01(fn(i, j))); px[0] = px[1] = px[2] = v; }); }
  function blob(g, x, y, rx, ry, a, col, k) { g.save(); g.translate(x, y); g.rotate(a); g.scale(rx, ry); var gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, 'rgba(' + col + ',' + k + ')'); gr.addColorStop(0.6, 'rgba(' + col + ',' + (k * 0.7) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 6.3); g.fill(); g.restore(); }

  /* ---- the surfaces ---- */
  var TX = {};
  function oya() { /* 大谷石: green-grey tuff, the brown "miso" inclusions with their darker cores, open pores, the saw marks of the quarry; a roughness map that dulls the pores */
    if (TX.oya) return TX.oya; var N = 1024, f1 = field(N, 11, 6, 2), f2 = field(N, 12, 4, 2.3), r = lcg(41), i;
    var alb = paint(N, function (i, j, px) { var n = f1[j * N + i], m = f2[j * N + i], l = 0.66 + (n - 0.5) * 0.46 + (m - 0.5) * 0.16 + (r() - 0.5) * 0.09; px[0] = 255 * clamp01(l * 0.8 + 0.03); px[1] = 255 * clamp01(l * 0.83 + 0.03); px[2] = 255 * clamp01(l * 0.73 + 0.02); });
    var g = alb.getContext('2d'); for (i = 0; i < 160; i++) { var x = r() * N, y = r() * N, rx = 6 + r() * r() * 42, ry = rx * (0.35 + r() * 0.6), a = r() * 3.14; blob(g, x, y, rx, ry, a, '112,92,58', 0.72); blob(g, x + rx * 0.1, y + ry * 0.1, rx * 0.55, ry * 0.55, a, '72,56,34', 0.7); if (r() < 0.5) blob(g, x - rx * 0.5, y + ry * 0.3, rx * 0.35, ry * 0.4, a + 0.4, '140,118,76', 0.55); }
    for (i = 0; i < 4200; i++) { var px2 = r() * N, py = r() * N, pr = 0.6 + r() * r() * 4.6; g.fillStyle = 'rgba(52,46,36,' + (0.35 + r() * 0.5) + ')'; g.beginPath(); g.arc(px2, py, pr, 0, 6.3); g.fill(); g.fillStyle = 'rgba(230,226,208,0.35)'; g.beginPath(); g.arc(px2 - pr * 0.5, py - pr * 0.5, pr * 0.5, 0, 6.3); g.fill(); }
    var bump = mkCanvas(N, N), bg = bump.getContext('2d'); bg.fillStyle = '#808080'; bg.fillRect(0, 0, N, N); bg.drawImage(alb, 0, 0); bg.globalAlpha = 0.72; bg.fillStyle = '#8a8a8a'; bg.fillRect(0, 0, N, N); bg.globalAlpha = 1; /* the relief: the pores and the inclusions, the ground flattened */
    g.globalAlpha = 0.05; g.strokeStyle = '#404038'; g.lineWidth = 1; for (i = 0; i < 36; i++) { var yy = r() * N; g.beginPath(); g.moveTo(0, yy); g.lineTo(N, yy + (r() - 0.5) * 3); g.stroke(); } g.globalAlpha = 1;
    var rough = mkCanvas(N, N), ad = alb.getContext('2d').getImageData(0, 0, N, N).data, rg = rough.getContext('2d'), rimg = rg.createImageData(N, N), rd = rimg.data;
    for (i = 0; i < N * N; i++) { var lum = (ad[i * 4] * 0.3 + ad[i * 4 + 1] * 0.59 + ad[i * 4 + 2] * 0.11) / 255, v = Math.round(255 * clamp01(0.55 + (0.62 - lum) * 0.9)); rd[i * 4] = rd[i * 4 + 1] = rd[i * 4 + 2] = v; rd[i * 4 + 3] = 255; } rg.putImageData(rimg, 0, 0); /* the pores and the miso duller than the ground */
    TX.oya = { map: alb, rough: rough, bump: bump }; return TX.oya; }
  function paper(col, seed, blotch) { /* indicator paper: fibres, a faint laid texture; the exposed sheet has turned unevenly */
    var N = 1024, f = field(N, seed, 5, 2.2), r = lcg(seed + 3), c = paint(N, function (i, j, px) { var n = f[j * N + i], k = 0.9 + (n - 0.5) * 0.16 + (r() - 0.5) * 0.05; px[0] = col[0] * k; px[1] = col[1] * k; px[2] = col[2] * k; }), g = c.getContext('2d'), i;
    if (blotch) { for (i = 0; i < 60; i++) blob(g, r() * N, r() * N, 30 + r() * 140, 30 + r() * 140, r() * 3, blotch, 0.18 + r() * 0.22); }
    g.globalAlpha = 0.05; g.strokeStyle = '#000'; for (i = 0; i < N; i += 3) { g.beginPath(); g.moveTo(0, i); g.lineTo(N, i); g.stroke(); } g.globalAlpha = 1; return c; }
  function rust() { /* scale of orange and brown, dark pitting, a few flakes lifting pale at their edges — and the height of it for the displacement */
    if (TX.rust) return TX.rust; var N = 1024, f = field(N, 93, 6, 2.1), f2 = field(N, 94, 3, 3), r = lcg(95), i;
    var alb = paint(N, function (i, j, px) { var n = f[j * N + i], m = f2[j * N + i], t = clamp01(n * 1.3 - 0.2); var c0 = [52, 30, 16], c1 = [150, 76, 30], c2 = [214, 132, 58]; var c = t < 0.5 ? [c0[0] + (c1[0] - c0[0]) * t * 2, c0[1] + (c1[1] - c0[1]) * t * 2, c0[2] + (c1[2] - c0[2]) * t * 2] : [c1[0] + (c2[0] - c1[0]) * (t - 0.5) * 2, c1[1] + (c2[1] - c1[1]) * (t - 0.5) * 2, c1[2] + (c2[2] - c1[2]) * (t - 0.5) * 2]; var k = 0.85 + (m - 0.5) * 0.4; px[0] = c[0] * k; px[1] = c[1] * k; px[2] = c[2] * k; });
    var g = alb.getContext('2d'); for (i = 0; i < 3000; i++) { g.fillStyle = 'rgba(34,18,8,' + (0.35 + r() * 0.55) + ')'; g.beginPath(); g.arc(r() * N, r() * N, 0.6 + r() * r() * 3.5, 0, 6.3); g.fill(); }
    for (i = 0; i < 140; i++) { var x = r() * N, y = r() * N, w = 6 + r() * 26, h = 3 + r() * 10; g.fillStyle = 'rgba(214,190,150,' + (0.15 + r() * 0.25) + ')'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(70,36,14,0.5)'; g.fillRect(x, y + h, w, 1.5); }
    var hgt = grey(N, function (i, j) { return 0.35 + f[j * N + i] * 0.6 + (f2[j * N + i] - 0.5) * 0.2; });
    TX.rust = { map: alb, bump: hgt, f: f, N: N }; return TX.rust; }
  function mortar() { /* a cement-mortar tile: fine sand, a few voids, trowel sweeps, and the roughness of the sanded grains */
    if (TX.mortar) return TX.mortar; var N = 1024, f = field(N, 5, 6, 2.2), f2 = field(N, 6, 2, 2), r = lcg(7), i;
    var alb = paint(N, function (i, j, px) { var n = f[j * N + i], m = f2[j * N + i], l = 0.62 + (n - 0.5) * 0.4 + (m - 0.5) * 0.14 + (r() - 0.5) * 0.18; px[0] = 255 * clamp01(l * 0.88); px[1] = 255 * clamp01(l * 0.87); px[2] = 255 * clamp01(l * 0.82); });
    var g = alb.getContext('2d'); for (i = 0; i < 900; i++) { g.fillStyle = 'rgba(60,58,54,' + (0.25 + r() * 0.5) + ')'; g.beginPath(); g.arc(r() * N, r() * N, 0.8 + r() * r() * 3.2, 0, 6.3); g.fill(); }
    g.globalAlpha = 0.05; g.strokeStyle = '#fff'; g.lineWidth = 2; for (i = 0; i < 40; i++) { var y = r() * N; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(N * 0.3, y + (r() - 0.5) * 40, N * 0.7, y + (r() - 0.5) * 40, N, y + (r() - 0.5) * 20); g.stroke(); } g.globalAlpha = 1;
    var rough = grey(N, function (i, j) { return 0.8 + (f[j * N + i] - 0.5) * 0.3; });
    TX.mortar = { map: alb, bump: alb, rough: rough }; return TX.mortar; }
  function decal(S, fn) { var c = mkCanvas(S, S), g = c.getContext('2d'); g.clearRect(0, 0, S, S); fn(g, S); return c; }
  function stain() { return decal(512, function (g, S) { var r = lcg(17), i; for (i = 0; i < 70; i++) blob(g, S * 0.5 + (r() - 0.5) * S * 0.5, S * 0.5 + (r() - 0.5) * S * 0.42, 14 + r() * 70, 10 + r() * 50, r() * 3, '150,78,28', 0.14 + r() * 0.3); for (i = 0; i < 26; i++) { var sx = S * 0.3 + r() * S * 0.4, sy = S * 0.5 + r() * S * 0.1, len = 30 + r() * 150, gr = g.createLinearGradient(0, sy, 0, sy + len); gr.addColorStop(0, 'rgba(140,70,25,0.5)'); gr.addColorStop(1, 'rgba(140,70,25,0)'); g.fillStyle = gr; g.fillRect(sx, sy, 2 + r() * 6, len); } for (i = 0; i < 400; i++) { g.fillStyle = 'rgba(120,58,20,' + (0.2 + r() * 0.5) + ')'; g.beginPath(); g.arc(S * 0.5 + (r() - 0.5) * S * 0.7, S * 0.5 + (r() - 0.5) * S * 0.6, 0.5 + r() * 2.5, 0, 6.3); g.fill(); } }); }
  function soak() { return decal(512, function (g, S) { var r = lcg(31), i; for (i = 0; i < 40; i++) blob(g, S * 0.5 + (r() - 0.5) * S * 0.36, S * 0.5 + (r() - 0.5) * S * 0.3, 30 + r() * 90, 24 + r() * 70, r() * 3, '48,46,36', 0.3 + r() * 0.35); }); }
  function contact() { return decal(256, function (g, S) { var gr = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.35, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, S, S); }); }
  function floorTex() { var N = 512, f = field(N, 77, 4, 2); return paint(N, function (i, j, px) { var l = 0.93 + (f[j * N + i] - 0.5) * 0.05; px[0] = 255 * l; px[1] = 255 * l; px[2] = 253 * l; }); }

  /* ---- geometry: rounded boxes, smooth normals, lathes, displacement ---- */
  function weld(geo) { /* shared vertices for smooth normals (the bevels of an extrusion are flat-shaded otherwise); the flat caps keep vertices of their own, so a cap stays flat instead of taking the tilted normals of the bevel ring */
    var p = geo.attributes.position, uv = geo.attributes.uv, map = {}, pos = [], uvs = [], idx = [], i, n = 0, A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), flat = new Uint8Array(p.count);
    for (i = 0; i < p.count; i += 3) { A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2); B.sub(A); C.sub(A); A.crossVectors(B, C).normalize(); if (Math.abs(A.y) > 0.999) flat[i] = flat[i + 1] = flat[i + 2] = 1; }
    for (i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = (Math.round(x * 2e5) + ',' + Math.round(y * 2e5) + ',' + Math.round(z * 2e5) + (flat[i] ? 'c' : '')); if (map[k] == null) { map[k] = n++; pos.push(x, y, z); if (uv) uvs.push(uv.getX(i), uv.getY(i)); } idx.push(map[k]); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals(); geo.dispose(); return g; }
  function uvByPos(geo, sx, sy) { /* texture coordinates from the position, metres over `sx`: the top in x·z, the sides in (x or z)·y — one texel size on every face */
    geo.computeVertexNormals(); var p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2), i; for (i = 0; i < p.count; i++) { var nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i)); if (ny >= nx && ny >= nz) { uv[i * 2] = 0.5 + p.getX(i) / sx; uv[i * 2 + 1] = 0.5 + p.getZ(i) / (sy || sx); } else if (nx >= nz) { uv[i * 2] = 0.5 + p.getZ(i) / sx; uv[i * 2 + 1] = p.getY(i) / (sy || sx); } else { uv[i * 2] = 0.5 + p.getX(i) / sx; uv[i * 2 + 1] = p.getY(i) / (sy || sx); } } /* kept positive: the textures repeat, and a clamped edge would smear */ geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return geo; }
  function rrect(w, d, r) { var s = new THREE.Shape(), x = -w / 2, y = -d / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function rbox(w, h, d, r, seg, tex) { /* a box w × h × d with every edge rounded by r, standing on y = 0, centred in x and z */
    var sh = rrect(w, d, r * 1.5), geo = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.0002, h - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelOffset: -r, bevelSegments: seg || 5, curveSegments: 10 }); geo.rotateX(-Math.PI / 2); geo.translate(0, r, 0); geo = weld(geo); geo.computeBoundingBox(); var bb = geo.boundingBox; geo.translate(0, -bb.min.y, 0); return uvByPos(geo, tex || 0.3); }
  function frame(w, d, t, h, r) { var sh = rrect(w, d, r), hole = rrect(w - 2 * t, d - 2 * t, Math.max(0.0005, r - t)); sh.holes.push(hole); var geo = new THREE.ExtrudeGeometry(sh, { depth: h - 0.0016, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0008, bevelOffset: -0.0008, bevelSegments: 3, curveSegments: 10 }); geo.rotateX(-Math.PI / 2); geo = weld(geo); geo.computeBoundingBox(); geo.translate(0, -geo.boundingBox.min.y, 0); return uvByPos(geo, 0.1); }
  function lathe(pts, seg) { var g = new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 96); g.computeVertexNormals(); return g; }
  function smoothSeams(geo) { /* normals averaged across vertices that share a position (the seam of a lathe, the duplicated verts of a displaced surface), the uv left alone */
    geo.computeVertexNormals(); var p = geo.attributes.position, n = geo.attributes.normal, acc = {}, keys = [], i; for (i = 0; i < p.count; i++) { var k = Math.round(p.getX(i) * 2e5) + ',' + Math.round(p.getY(i) * 2e5) + ',' + Math.round(p.getZ(i) * 2e5); keys.push(k); var a = acc[k] || (acc[k] = [0, 0, 0]); a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); }
    for (i = 0; i < p.count; i++) { var a2 = acc[keys[i]], l = Math.hypot(a2[0], a2[1], a2[2]) || 1; n.setXYZ(i, a2[0] / l, a2[1] / l, a2[2] / l); } n.needsUpdate = true; return geo; }
  function displace(geo, fn) { var p = geo.attributes.position, n = geo.attributes.normal, i; for (i = 0; i < p.count; i++) { var d = fn(p.getX(i), p.getY(i), p.getZ(i), i); p.setXYZ(i, p.getX(i) + n.getX(i) * d, p.getY(i) + n.getY(i) * d, p.getZ(i) + n.getZ(i) * d); } p.needsUpdate = true; geo.computeVertexNormals(); return geo; }
  function hash3(x, y, z) { var s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
  function noise3(x, y, z) { var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf); function h(a, b, c) { return hash3(xi + a, yi + b, zi + c); } var x00 = h(0, 0, 0) + (h(1, 0, 0) - h(0, 0, 0)) * u, x10 = h(0, 1, 0) + (h(1, 1, 0) - h(0, 1, 0)) * u, x01 = h(0, 0, 1) + (h(1, 0, 1) - h(0, 0, 1)) * u, x11 = h(0, 1, 1) + (h(1, 1, 1) - h(0, 1, 1)) * u; var y0 = x00 + (x10 - x00) * v, y1 = x01 + (x11 - x01) * v; return y0 + (y1 - y0) * w; }
  function fbm3(x, y, z, o) { var s = 0, a = 1, t = 0, i; for (i = 0; i < o; i++) { s += a * noise3(x, y, z); t += a; x *= 2.1; y *= 2.1; z *= 2.1; a *= 0.5; } return s / t; }

  /* ---- the post pass: depth of field, ACES, vignette, grain ---- */
  var POST_VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  /* (v88) the samplers at full precision too: the depth read through a default (lowp) sampler comes back as a 16-bit float on a phone, and the focus then moved in steps */ var POST_FS = 'precision highp float; precision highp sampler2D; uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 res; uniform float near; uniform float far; uniform float focus; uniform float range; uniform float maxR; uniform float vig; uniform float grain; uniform float seed; uniform float expo; varying vec2 vUv;' +
    'float lin(float d) { float z = d * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }' +
    'float coc(vec2 uv) { float z = lin(texture2D(tDepth, uv).x); float c = (z - focus) / range; return clamp(abs(c), 0.0, 1.0); }' +
    'vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }' +
    'vec3 srgb(vec3 c) { return mix(12.92 * c, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }' +
    'void main() { float c0 = coc(vUv); float rad = c0 * maxR; vec3 acc = vec3(0.0); float wsum = 0.0; const int N = 36; float ga = 2.39996323;' +
    ' for (int i = 0; i < N; i++) { float fi = float(i); float rr = sqrt((fi + 0.5) / float(N)); float th = fi * ga; vec2 off = vec2(cos(th), sin(th)) * rr; vec2 uv = vUv + off * rad / res; float ct = coc(uv); float w = 0.2 + 0.8 * smoothstep(rr * c0 - 0.25, rr * c0 + 0.05, ct); vec3 col = texture2D(tColor, clamp(uv, vec2(0.001), vec2(0.999))).rgb; acc += col * w; wsum += w; }' +
    ' vec3 col = acc / wsum; col = aces(col * expo); vec2 q = vUv - 0.5; col *= 1.0 - vig * dot(q, q) * 2.2; float n = fract(sin(dot(vUv * res + seed, vec2(12.9898, 78.233))) * 43758.5453); col += (n - 0.5) * grain; gl_FragColor = vec4(srgb(clamp(col, 0.0, 1.0)), 1.0); }';

  /* ---- the studio ---- */
  function makeStudioEnv(renderer) { /* the reflections: an overhead softbox, a tall side softbox, a strip light behind, a dim grey hall */
    try { var pm = new THREE.PMREMGenerator(renderer), sc = new THREE.Scene(), c = mkCanvas(8, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#85898d'); gr.addColorStop(0.45, '#5c5f63'); gr.addColorStop(0.55, '#3f4144'); gr.addColorStop(1, '#232426'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256);
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(12, 32, 16), new THREE.MeshBasicMaterial({ map: canvasTex(c), side: THREE.BackSide })));
      [[0, 7, 1.5, 7, 4.5, 3.6, [1, 0.98, 0.95]], [0, 8, -3.5, 7, 1.6, 3.0, [1, 1, 1]], [-7, 3, 2.5, 2.6, 5, 2.4, [0.92, 0.95, 1]], [6, 2.2, -5, 1.2, 4, 2.0, [1, 1, 1]], [0, 1.5, 7.5, 5, 2.4, 0.6, [1, 1, 1]]].forEach(function (p) { var m = new THREE.Mesh(new THREE.PlaneGeometry(p[3], p[4]), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); m.material.color.setRGB(p[5] * p[6][0], p[5] * p[6][1], p[5] * p[6][2]); m.position.set(p[0], p[1], p[2]); m.lookAt(0, 0.4, 0); sc.add(m); });
      var rt = pm.fromScene(sc, 0.03); pm.dispose(); sc.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); return rt.texture; } catch (e) { return null; } }

  function build(renderer, done) {
    var trash = []; function keep(o) { trash.push(o); return o; }
    function mat(p) { return keep(new THREE.MeshStandardMaterial(p)); } function phys(p) { return keep(new THREE.MeshPhysicalMaterial(p)); }
    function tex(c, o) { var t = keep(canvasTex(c, o || {})); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; }
    var SS = small() ? 1.25 : 2, RW = Math.round(OW * SS), RH = Math.round(OH * SS), env = makeStudioEnv(renderer), cam = new THREE.PerspectiveCamera(24, 2, 0.03, 6), scene, key;
    var rt = new THREE.WebGLRenderTarget(RW, RH, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true, stencilBuffer: false }); rt.depthTexture = new THREE.DepthTexture(RW, RH); rt.depthTexture.type = THREE.UnsignedIntType;
    var post = new THREE.ShaderMaterial({ vertexShader: POST_VS, fragmentShader: POST_FS, uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, res: { value: new THREE.Vector2(RW, RH) }, near: { value: cam.near }, far: { value: cam.far }, focus: { value: 0.5 }, range: { value: 0.2 }, maxR: { value: 14 * SS }, vig: { value: 0.22 }, grain: { value: 0.014 }, seed: { value: 1 }, expo: { value: 1.0 } }, depthTest: false, depthWrite: false, toneMapped: false });
    var postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post); postScene.add(quad);
    var outC = mkCanvas(OW, OH), og = outC.getContext('2d'); og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high';
    var floorT = tex(floorTex()); floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(12, 12);
    function backdrop(top, bottom) { var c = mkCanvas(4, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(0.55, bottom); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 512); return tex(c); }
    function studio(bg, keyAt, keyI, floorCol) {
      scene = new THREE.Scene(); scene.background = backdrop(bg ? bg[0] : '#f2f2f0', bg ? bg[1] : '#dddcd8'); scene.environment = env;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xb0afaa, env ? 0.32 : 0.7));
      key = new THREE.DirectionalLight(0xfff8f0, (keyI || 1.3) * 0.86); key.position.set(keyAt ? keyAt[0] : 0.35, keyAt ? keyAt[1] : 0.9, keyAt ? keyAt[2] : 0.55); key.castShadow = true; key.shadow.mapSize.set(small() ? 2048 : 4096, small() ? 2048 : 4096); var sc = key.shadow.camera; sc.left = sc.bottom = -0.4; sc.right = sc.top = 0.4; sc.near = 0.2; sc.far = 3.5; sc.updateProjectionMatrix(); key.shadow.bias = -0.00025; key.shadow.normalBias = 0.0025; key.shadow.radius = small() ? 6 : 10; scene.add(key);
      var fill = new THREE.DirectionalLight(0xeef3ff, 0.3); fill.position.set(-0.9, 0.5, 0.7); scene.add(fill); var rim = new THREE.DirectionalLight(0xffffff, 0.25); rim.position.set(0.3, 0.6, -1.2); scene.add(rim);
      var fl = new THREE.Mesh(keep(new THREE.PlaneGeometry(8, 8)), mat({ map: floorT, color: floorCol || 0xe2e0db, roughness: 0.92, envMapIntensity: 0.35 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
      return scene;
    }
    function add(geo, m, x, y, z, o) { var me = new THREE.Mesh(keep(geo), m); me.position.set(x || 0, y || 0, z || 0); me.castShadow = !(o && o.noCast); me.receiveShadow = !(o && o.noRecv); scene.add(me); return me; }
    function look(az, el, dist, tx, ty, tz, fov) { var a = az * Math.PI / 180, e = el * Math.PI / 180; cam.fov = fov || 24; cam.aspect = 2; cam.updateProjectionMatrix(); cam.position.set(tx + dist * Math.sin(a) * Math.cos(e), ty + dist * Math.sin(e), tz + dist * Math.cos(a) * Math.cos(e)); cam.lookAt(tx, ty, tz); post.uniforms.focus.value = dist; }
    function snap(o) { /* the photograph: the scene into the target, the post pass to the canvas, the canvas downsampled to the output */
      o = o || {}; post.uniforms.range.value = o.range || 0.16; post.uniforms.maxR.value = (o.maxR || 13) * SS; post.uniforms.seed.value = Math.random() * 100; post.uniforms.expo.value = o.expo || 1.0; post.uniforms.vig.value = o.vig != null ? o.vig : 0.22; if (o.focus) post.uniforms.focus.value = o.focus;
      renderer.setRenderTarget(rt); renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null); renderer.render(postScene, postCam);
      og.fillStyle = '#fff'; og.fillRect(0, 0, OW, OH); og.drawImage(renderer.domElement, 0, 0, RW, RH, 0, 0, OW, OH); var u = outC.toDataURL('image/jpeg', 0.9);
      scene.traverse(function (ob) { if (ob.geometry && trash.indexOf(ob.geometry) < 0) ob.geometry.dispose(); }); return u; }
    function beads(m, n, x, z, rx, rz, y, seed, rmin, rmax, sq) { var r = lcg(seed), i; for (i = 0; i < n; i++) { var rad = rmin + r() * r() * (rmax - rmin), d = add(new THREE.SphereGeometry(rad, 28, 20), m, x + (r() - 0.5) * rx, y + rad * (sq || 0.5) * 0.92, z + (r() - 0.5) * rz, { noCast: true }); d.scale.y = sq || 0.5; } }
    var out = {}, steps = [];
    /* 1 · Oya stone, bare and coated: water poured on both — soaked into the bare stone, beading on the film; the film deepens the stone's colour */
    steps.push(function () {
      studio(['#f3f2ee', '#dedcd6'], [0.35, 0.75, 0.6], 1.25); var O = oya(), map = tex(O.map), bump = tex(O.bump, { srgb: false }), rough = tex(O.rough, { srgb: false });
      var bare = mat({ map: map, bumpMap: bump, bumpScale: 0.0028, roughnessMap: rough, color: 0xfaf8f2, roughness: 1, envMapIntensity: 0.12 });
      var coated = phys({ map: map, bumpMap: bump, bumpScale: 0.0016, roughnessMap: rough, color: 0x9aa08e, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.5, reflectivity: 0.6 });
      var a = add(rbox(0.235, 0.038, 0.15, 0.0025, 5, 0.3), bare, -0.126, 0, 0), b = add(rbox(0.235, 0.038, 0.15, 0.0025, 5, 0.3), coated, 0.126, 0, 0); a.rotation.y = 0.035; b.rotation.y = -0.03;
      var sk = add(new THREE.PlaneGeometry(0.16, 0.12), keep(new THREE.MeshBasicMaterial({ map: tex(soak()), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })), -0.11, 0.0383, 0.005, { noCast: true, noRecv: true }); sk.rotation.x = -Math.PI / 2; sk.rotation.z = 0.3;
      var water = phys({ color: 0xffffff, transmission: 1, thickness: 0.004, ior: 1.33, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, attenuationColor: new THREE.Color(0xdfeeff), attenuationDistance: 0.05 });
      beads(water, 40, 0.126, 0.0, 0.17, 0.1, 0.038, 23, 0.0018, 0.0068, 0.48); beads(water, 110, 0.126, 0.0, 0.2, 0.13, 0.038, 24, 0.0005, 0.002, 0.55);
      look(-18, 27, 0.7, 0.005, 0.015, 0.0, 25); out.before = snap({ range: 0.2, maxR: 12, expo: 0.95 });
    });
    /* 2 · UV-indicator paper under glass, 24 h in the sun: bare glass on the left (the paper has turned), PROTECT ONE-coated glass on the right (the paper stays white) */
    steps.push(function () {
      studio(['#f8f6f0', '#e0ddd5'], [-0.45, 0.95, -0.25], 1.45, 0xeceae5);
      var glass = phys({ color: 0xffffff, transmission: 0.96, thickness: 0.004, ior: 1.52, roughness: 0.015, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.1, attenuationColor: new THREE.Color(0xe8f3ec), attenuationDistance: 0.4 });
      var coatedGlass = phys({ color: 0xffffff, transmission: 0.96, thickness: 0.0045, ior: 1.52, roughness: 0.01, clearcoat: 1, clearcoatRoughness: 0.012, envMapIntensity: 1.9, attenuationColor: new THREE.Color(0xeef5f0), attenuationDistance: 0.4 });
      var purple = mat({ map: tex(paper([126, 86, 168], 7, '86,46,130')), roughness: 0.92, envMapIntensity: 0.12 }), white = mat({ map: tex(paper([246, 243, 235], 9, null)), roughness: 0.92, envMapIntensity: 0.12 }), alu = phys({ color: 0x9aa0a6, roughness: 0.38, metalness: mt(0.9), envMapIntensity: 1.1, clearcoat: 0.2 }), felt = mat({ color: 0x3a3b3d, roughness: 0.95 });
      [[-0.145, purple, glass], [0.145, white, coatedGlass]].forEach(function (s) { add(rbox(0.25, 0.006, 0.19, 0.0012, 3, 0.25), felt, s[0], 0, 0); add(new THREE.BoxGeometry(0.205, 0.0012, 0.15), s[1], s[0], 0.0066, 0, { noCast: true }); var g2 = add(rbox(0.238, 0.004, 0.178, 0.0009, 3, 0.25), s[2], s[0], 0.0072, 0, { noCast: true }); add(frame(0.25, 0.19, 0.011, 0.013, 0.004), alu, s[0], 0.0015, 0); });
      look(-8, 36, 0.74, 0, -0.01, 0.0, 24); out.uv = snap({ range: 0.24, maxR: 11, expo: 0.98 });
    });
    /* 3 · salt spray on two nails: bare steel rusted, scaling, weeping onto the tile; the coated one bright with the spray beading on it */
    steps.push(function () {
      studio(['#f4f4f2', '#d9d8d4'], [-0.25, 0.8, -0.45], 1.35, 0xe6e5e0); var tile = phys({ color: 0xf6f5f1, roughness: 0.16, clearcoat: 0.8, clearcoatRoughness: 0.1, envMapIntensity: 1.0 }); add(rbox(0.3, 0.008, 0.2, 0.0012, 3, 0.3), tile, 0, 0, 0);
      var R = rust(), rustM = mat({ map: tex(R.map), bumpMap: tex(R.bump, { srgb: false }), bumpScale: 0.0009, color: 0xf2e2cc, roughness: 0.97, metalness: mt(0.1), envMapIntensity: 0.18 });
      var steel = phys({ color: 0xd4d8dc, roughness: 0.2, metalness: mt(0.95), envMapIntensity: 1.4, clearcoat: 0.3, clearcoatRoughness: 0.08 });
      var water = phys({ color: 0xffffff, transmission: 1, thickness: 0.003, ior: 1.33, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.7 }), brine = phys({ color: 0xeadfcd, transmission: 0.88, thickness: 0.002, ior: 1.33, roughness: 0.04, clearcoat: 1, envMapIntensity: 1.3 });
      function nailGeo(rough, spin) { var L = 0.075, rr = 0.0021, pts = [[0, -L / 2], [rr * 0.2, -L / 2 + 0.0004], [rr, -L / 2 + 0.011], [rr, L / 2 - 0.0016], [0.0046, L / 2 - 0.0012], [0.0047, L / 2 - 0.0004], [0.0044, L / 2], [0, L / 2]], g = lathe(pts, rough ? 128 : 96);
        if (rough) { var fine = [], k, step = 0.0004; for (k = 0; k < pts.length - 1; k++) { var a = pts[k], b = pts[k + 1], n2 = Math.max(1, Math.round(Math.abs(b[1] - a[1]) / step)), q; for (q = 0; q < n2; q++) { var t = q / n2; fine.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } } fine.push(pts[pts.length - 1]); /* a ring every 0.4 mm, so the scale can rise anywhere along the shank */
          g = lathe(fine, 128); smoothSeams(g); displace(g, function (x, y, z) { var r0 = Math.hypot(x, z); if (r0 < 0.0006) return 0; var n = fbm3(x * 1100, y * 1100, z * 1100, 4), f = fbm3(x * 260 + 9, y * 260, z * 260, 3); return (n - 0.45) * 0.0005 + (f - 0.5) * 0.00045; }); smoothSeams(g); }
        g.rotateY(spin || 0); return g; }
      function nail(m, x, z, ang, rough, spin) { var me = add(nailGeo(rough, spin), m, x, 0.008 + 0.0023, z); me.rotation.z = Math.PI / 2; me.rotation.y = ang; return me; }
      nail(rustM, -0.062, 0.004, -0.42, true, 0.3); nail(steel, 0.062, -0.004, -0.46, false, 1.2);
      var st = add(new THREE.PlaneGeometry(0.15, 0.15), keep(new THREE.MeshBasicMaterial({ map: tex(stain()), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })), -0.062, 0.0082, 0.004, { noCast: true, noRecv: true }); st.rotation.x = -Math.PI / 2; st.rotation.z = -0.42;
      var r = lcg(23), i; beads(brine, 70, -0.062, 0.004, 0.12, 0.09, 0.008, 51, 0.0007, 0.0028, 0.5); beads(water, 90, 0.062, -0.004, 0.13, 0.1, 0.008, 52, 0.0007, 0.003, 0.5);
      for (i = 0; i < 18; i++) { var t2 = -0.034 + r() * 0.066, rad2 = 0.0007 + r() * 0.0011, d2 = add(new THREE.SphereGeometry(rad2, 24, 18), water, 0.062 + Math.cos(-0.46) * t2, 0.008 + 0.0023 + 0.0021 + rad2 * 0.35, -0.004 - Math.sin(-0.46) * t2, { noCast: true }); d2.scale.y = 0.5; }
      var salt = mat({ color: 0xfbfbf8, roughness: 0.35, envMapIntensity: 0.6 }); for (i = 0; i < 420; i++) { var sx = -0.062 + (r() - 0.5) * 0.13, sz = 0.004 + (r() - 0.5) * 0.1, sr = 0.00025 + r() * 0.0006, sd = add(new THREE.BoxGeometry(sr, sr * 0.8, sr), salt, sx, 0.008 + sr * 0.4, sz, { noCast: true }); sd.rotation.y = r() * 3; }
      look(-12, 24, 0.27, 0.0, 0.004, 0.0, 25); out.salt = snap({ range: 0.09, maxR: 14, expo: 0.96 });
    });
    /* 4 · a Phillips screwdriver pressed into the cured film on a mortar tile: the film dents and springs, it does not break */
    steps.push(function () {
      studio(['#f5f5f3', '#dad9d5'], [-0.3, 0.85, -0.5], 1.4); var MT = mortar(), mmap = tex(MT.map), mbump = tex(MT.bump, { srgb: false }), mrough = tex(MT.rough, { srgb: false });
      var mortarM = mat({ map: mmap, bumpMap: mbump, bumpScale: 0.0016, roughnessMap: mrough, color: 0xcfccc4, roughness: 1, envMapIntensity: 0.18 });
      var mortarC = phys({ map: mmap, bumpMap: mbump, bumpScale: 0.0009, roughnessMap: mrough, color: 0x8f8b82, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.7 });
      var tileG = rbox(0.36, 0.024, 0.24, 0.0018, 4, 0.36), p = tileG.attributes.position, nrm = tileG.attributes.normal, i; var gi = []; for (i = 0; i < p.count; i++) gi.push(nrm.getY(i) > 0.7 ? 0 : 1); /* the top face takes the coated material */
      var topIdx = [], sideIdx = [], ix = tileG.index.array; for (i = 0; i < ix.length; i += 3) { if (gi[ix[i]] === 0 && gi[ix[i + 1]] === 0 && gi[ix[i + 2]] === 0) topIdx.push(ix[i], ix[i + 1], ix[i + 2]); else sideIdx.push(ix[i], ix[i + 1], ix[i + 2]); }
      tileG.setIndex(topIdx.concat(sideIdx)); tileG.clearGroups(); tileG.addGroup(0, topIdx.length, 0); tileG.addGroup(topIdx.length, sideIdx.length, 1); add(tileG, [mortarC, mortarM], 0, 0, 0);
      var film = phys({ color: 0xf6f8fa, transmission: 0.86, thickness: 0.0014, ior: 1.5, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.035, envMapIntensity: 0.7, attenuationColor: new THREE.Color(0xeef3f6), attenuationDistance: 0.02 });
      var tip = [0.02, 0.0243, 0.01], FY = 0.0262, fg = new THREE.PlaneGeometry(0.359, 0.239, 260, 180); fg.rotateX(-Math.PI / 2); displace(fg, function (x, y, z) { var dx = x - tip[0], dz = z - tip[2], d = Math.hypot(dx, dz); return -(FY - tip[1]) * Math.exp(-(d * d) / (2 * 0.0036 * 0.0036)) + 0.0005 * Math.exp(-((d - 0.0078) * (d - 0.0078)) / (2 * 0.002 * 0.002)); }); smoothSeams(fg); var f = add(fg, film, 0, FY, 0, { noCast: true }); /* the film, drawn thick: dented to the tile under the tip, a low ring heaved up round the dent, unbroken */
      var steel = phys({ color: 0xd6dadd, roughness: 0.22, metalness: mt(0.92), envMapIntensity: 1.4, clearcoat: 0.2 }), handle = phys({ color: 0xf0640f, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.12, envMapIntensity: 0.9 }), grip = mat({ color: 0x202124, roughness: 0.75, envMapIntensity: 0.3 });
      var sd = new THREE.Group(); sd.position.set(tip[0], tip[1], tip[2]); sd.rotation.z = -1.0; sd.rotation.y = 0.55; scene.add(sd); /* tip at the group origin, the shank along +y */
      function part(geo, m, y) { var me = new THREE.Mesh(keep(geo), m); me.position.y = y; me.castShadow = true; me.receiveShadow = true; sd.add(me); return me; }
      part(lathe([[0, 0], [0.0012, 0.0008], [0.0024, 0.004], [0.0029, 0.0075], [0.0029, 0.108], [0.0024, 0.112], [0, 0.112]], 64), steel, 0); [0, Math.PI / 2].forEach(function (a) { var m2 = part(new THREE.BoxGeometry(0.0054, 0.0064, 0.0011), steel, 0.0036); m2.rotation.y = a; });
      part(lathe([[0, 0.112], [0.0105, 0.112], [0.0125, 0.118], [0.0135, 0.13], [0.0128, 0.14], [0.0125, 0.142], [0, 0.142]], 96), grip, 0);
      part(lathe([[0, 0.142], [0.0128, 0.142], [0.0152, 0.15], [0.0168, 0.168], [0.0172, 0.188], [0.0162, 0.206], [0.0138, 0.216], [0.0105, 0.221], [0.006, 0.223], [0, 0.223]], 128), handle, 0);
      var ribs = 6; for (i = 0; i < ribs; i++) { var rb = part(new THREE.BoxGeometry(0.0022, 0.05, 0.0028), grip, 0.182); rb.rotation.y = i * Math.PI / ribs; rb.position.x = Math.cos(i * Math.PI / ribs) * 0.0165; rb.position.z = -Math.sin(i * Math.PI / ribs) * 0.0165; rb.rotation.y = i * Math.PI / ribs; }
      var ct = add(new THREE.PlaneGeometry(0.06, 0.06), keep(new THREE.MeshBasicMaterial({ map: tex(contact()), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })), tip[0], FY + 0.0003, tip[2], { noCast: true, noRecv: true }); ct.rotation.x = -Math.PI / 2;
      look(-34, 30, 0.6, 0.03, 0.055, 0.0, 27); out.film = snap({ range: 0.18, maxR: 12, expo: 0.96 });
    });
    var k = 0; (function next() { if (k < steps.length) { try { steps[k++](); } catch (e) { if (window.console) console.error('PROTECT ONE evidence scene ' + k, e); } setTimeout(next, 16); return; }
      trash.forEach(function (o) { if (o && o.dispose) o.dispose(); }); rt.dispose(); if (rt.depthTexture) rt.depthTexture.dispose(); post.dispose(); quad.geometry.dispose(); if (env && env.dispose) env.dispose(); done(out.before && out.uv && out.salt && out.film ? out : null); })();
  }
  function fromStore() { try { var s = localStorage.getItem(KEY); if (!s) return null; var o = JSON.parse(s); return o && o.before && o.uv && o.salt && o.film ? o : null; } catch (e) { return null; } }
  function toStore(o) { try { var s = JSON.stringify(o); if (s.length < 2800000) localStorage.setItem(KEY, s); } catch (e) {} }
  function render(cb) {
    if (cache) { cb(cache); return; } var st = fromStore(); if (st) { cache = st; cb(cache); return; }
    waiters.push(cb); if (busy) return; busy = true;
    setTimeout(function () {
      var canvas = mkCanvas(Math.round(OW * (small() ? 1.25 : 2)), Math.round(OH * (small() ? 1.25 : 2))), r = null;
      try { r = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }); r.setPixelRatio(1); r.outputEncoding = THREE.LinearEncoding; r.toneMapping = THREE.NoToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.physicallyCorrectLights = false; }
      catch (e) { if (window.console) console.error('PROTECT ONE evidence', e); r = null; }
      function finish(o) { cache = o; if (o) toStore(o); if (r) { try { r.dispose(); r.forceContextLoss(); } catch (e2) {} } busy = false; var w = waiters; waiters = []; w.forEach(function (f) { f(cache); }); }
      if (!r) { finish(null); return; }
      try { build(r, finish); } catch (e) { if (window.console) console.error('PROTECT ONE evidence', e); finish(null); }
    }, 30);
  }
  return { render: render, clear: function () { cache = null; try { localStorage.removeItem(KEY); } catch (e) {} } };
})();

