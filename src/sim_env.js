/* ===== [sim_env.js] ===== */
/* ===== SimEnv — the place around the sample =====
   The guide's 3D sample is a cut-out of a building: a piece of facade, a block wall, the corner of a balcony, the floor of a room. The simulator
   stands the user in front of it at eye height, so the place has to go on beyond the sample: the facade continues with its windows, the
   boundary wall runs down the street, the balcony has its house wall, its partitions and its balustrade, the roof its parapet and bulkhead,
   the room its walls, ceiling and door. Everything here is lightweight — planes and boxes with textures drawn on canvases (noise, laps,
   joints, bond), bump-mapped, lit by the engine's own sun and reflection map — so it renders every frame on a phone, while the detail stays on
   the sample itself, where the work is. Sizes are metres; the sample sits at the origin, its face towards +z, the user stands on the +z side. */
var SimEnv = (function () {
  var cache = {};
  function rng(seed) { var s = seed || 1234; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function cv(n) { var c = document.createElement('canvas'); c.width = n; c.height = n; return c; }
  function noise(g, n, amp, seed) { var img = g.getImageData(0, 0, n, n), d = img.data, r = rng(seed), i; for (i = 0; i < d.length; i += 4) { var v = (r() - 0.5) * amp; d[i] += v; d[i + 1] += v; d[i + 2] += v * 0.92; } g.putImageData(img, 0, 0); }
  function rgb(c) { return 'rgb(' + c.join(',') + ')'; }
  /* the textures: one 512 px tile each, drawn once */
  function tex(kind) {
    if (cache[kind]) return cache[kind];
    var n = 512, c = cv(n), g = c.getContext('2d'), i, k, r = rng(kind.length * 977 + 11);
    if (kind === 'siding') { /* lap siding: 8 laps per tile, the shadow line under every lap */
      g.fillStyle = rgb([214, 211, 204]); g.fillRect(0, 0, n, n); noise(g, n, 14, 3);
      for (i = 0; i < 8; i++) { var y = i * 64; var gr = g.createLinearGradient(0, y, 0, y + 64); gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(0.12, 'rgba(0,0,0,.06)'); gr.addColorStop(0.85, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(255,255,255,.12)'); g.fillStyle = gr; g.fillRect(0, y, n, 64); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y, n, 3); }
      g.globalAlpha = 0.18; g.strokeStyle = '#000'; g.lineWidth = 1; for (i = 0; i < 40; i++) { var yy = r() * n; g.beginPath(); g.moveTo(0, yy); g.lineTo(n, yy + (r() - 0.5) * 2); g.stroke(); }
    } else if (kind === 'panel') { /* precast / ALC panels: a recessed joint every metre, read as a shadow line and a lit edge, not as a black grid */
      g.fillStyle = rgb([178, 178, 174]); g.fillRect(0, 0, n, n); noise(g, n, 22, 5);
      g.globalAlpha = 0.12; for (i = 0; i < 90; i++) { var x = r() * n, y2 = r() * n, rr = 14 + r() * 70, gr2 = g.createRadialGradient(x, y2, 0, x, y2, rr); gr2.addColorStop(0, 'rgba(0,0,0,.6)'); gr2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr2; g.fillRect(x - rr, y2 - rr, rr * 2, rr * 2); }
      g.globalAlpha = 1; [0, 256].forEach(function (j) { g.fillStyle = 'rgba(70,70,68,.55)'; g.fillRect(0, j, n, 5); g.fillRect(j, 0, 5, n); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(0, j + 5, n, 2); g.fillRect(j + 5, 0, 2, n); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, j - 2, n, 2); g.fillRect(j - 2, 0, 2, n); });
    } else if (kind === 'render') { /* rendered and painted wall */
      g.fillStyle = rgb([214, 211, 204]); g.fillRect(0, 0, n, n); noise(g, n, 20, 7);
      g.globalAlpha = 0.08; for (i = 0; i < 160; i++) { var x3 = r() * n, y3 = r() * n, r3 = 6 + r() * 40, gr3 = g.createRadialGradient(x3, y3, 0, x3, y3, r3); gr3.addColorStop(0, r() > 0.5 ? 'rgba(0,0,0,.7)' : 'rgba(255,255,255,.7)'); gr3.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr3; g.fillRect(x3 - r3, y3 - r3, r3 * 2, r3 * 2); }
    } else if (kind === 'block' || kind === 'brick') { /* running bond: 390 × 190 blocks or 210 × 60 bricks on a 2 m tile */
      var bw = kind === 'block' ? 100 : 54, bh = kind === 'block' ? 49 : 15.4, mj = kind === 'block' ? 2.6 : 2.4, base = kind === 'block' ? [150, 150, 146] : [156, 86, 68], row = 0;
      g.fillStyle = rgb(kind === 'block' ? [186, 184, 178] : [205, 196, 182]); g.fillRect(0, 0, n, n);
      for (var y4 = 0; y4 < n + bh; y4 += bh, row++) { var off = (row % 2) * bw / 2; for (var x4 = -bw; x4 < n + bw; x4 += bw) { var v = (r() - 0.5) * (kind === 'block' ? 22 : 40); g.fillStyle = rgb([base[0] + v, base[1] + v, base[2] + v * 0.8]); g.fillRect(x4 + off + mj / 2, y4 + mj / 2, bw - mj, bh - mj); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x4 + off + mj / 2, y4 + bh - mj / 2 - 3, bw - mj, 3); } }
      noise(g, n, 16, 9);
    } else if (kind === 'tile') { /* 300 mm wall tiles */
      g.fillStyle = rgb([188, 186, 180]); g.fillRect(0, 0, n, n); for (i = 0; i < 7; i++) for (k = 0; k < 7; k++) { var v5 = (r() - 0.5) * 16; g.fillStyle = rgb([218 + v5, 214 + v5, 206 + v5]); g.fillRect(i * 76.8 + 3, k * 76.8 + 3, 70.8, 70.8); } noise(g, n, 8, 11);
    } else if (kind === 'yard') { /* concrete pavement, worn — the tone of the sample's own pavement */
      g.fillStyle = rgb([126, 124, 119]); g.fillRect(0, 0, n, n); noise(g, n, 30, 13);
      g.globalAlpha = 0.12; for (i = 0; i < 60; i++) { var x6 = r() * n, y6 = r() * n, r6 = 20 + r() * 90, gr6 = g.createRadialGradient(x6, y6, 0, x6, y6, r6); gr6.addColorStop(0, 'rgba(0,0,0,.5)'); gr6.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr6; g.fillRect(x6 - r6, y6 - r6, r6 * 2, r6 * 2); }
      g.globalAlpha = 0.28; g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, n, 2); g.fillRect(0, 0, 2, n); /* the saw-cut joint of the pavement bay */
    } else if (kind === 'slab') { /* screed, with the saw cuts */
      g.fillStyle = rgb([136, 138, 140]); g.fillRect(0, 0, n, n); noise(g, n, 26, 17);
      g.globalAlpha = 0.35; g.strokeStyle = '#2a2a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, n / 2); g.lineTo(n, n / 2); g.moveTo(n / 2, 0); g.lineTo(n / 2, n); g.stroke();
    } else if (kind === 'deck') { /* the concrete of a balcony, broom finished */
      g.fillStyle = rgb([160, 160, 156]); g.fillRect(0, 0, n, n); noise(g, n, 20, 19); g.globalAlpha = 0.08; g.strokeStyle = '#000'; g.lineWidth = 1; for (i = 0; i < n; i += 3) { g.beginPath(); g.moveTo(0, i + r() * 2); g.lineTo(n, i + r() * 2); g.stroke(); }
    } else if (kind === 'roofcoat') { /* an old grey urethane membrane, chalked */
      g.fillStyle = rgb([158, 160, 158]); g.fillRect(0, 0, n, n); noise(g, n, 18, 23); g.globalAlpha = 0.1; for (i = 0; i < 40; i++) { var x7 = r() * n, y7 = r() * n, r7 = 30 + r() * 120, gr7 = g.createRadialGradient(x7, y7, 0, x7, y7, r7); gr7.addColorStop(0, 'rgba(60,60,55,.8)'); gr7.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr7; g.fillRect(x7 - r7, y7 - r7, r7 * 2, r7 * 2); }
    } else if (kind === 'gravel') { g.fillStyle = rgb([150, 146, 136]); g.fillRect(0, 0, n, n); noise(g, n, 40, 29); for (i = 0; i < 1400; i++) { var v8 = 100 + r() * 90; g.fillStyle = rgb([v8, v8 - 3, v8 - 10]); g.beginPath(); g.arc(r() * n, r() * n, 1.5 + r() * 3.5, 0, 6.3); g.fill(); }
    } else if (kind === 'plaster') { g.fillStyle = rgb([228, 226, 220]); g.fillRect(0, 0, n, n); noise(g, n, 9, 31);
    } else if (kind === 'ceiling') { g.fillStyle = rgb([236, 236, 233]); g.fillRect(0, 0, n, n); noise(g, n, 6, 33); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1.5; g.strokeRect(0.5, 0.5, 255, 255); g.strokeRect(256.5, 0.5, 255, 255); g.strokeRect(0.5, 256.5, 255, 255); g.strokeRect(256.5, 256.5, 255, 255);
    } else if (kind === 'city') { /* the face of a building in the distance: rows of windows */
      g.fillStyle = rgb([176, 178, 180]); g.fillRect(0, 0, n, n); noise(g, n, 10, 37); for (i = 0; i < 8; i++) for (k = 0; k < 8; k++) { g.fillStyle = r() > 0.25 ? 'rgba(40,52,64,.95)' : 'rgba(210,218,224,.9)'; g.fillRect(i * 64 + 14, k * 64 + 10, 36, 40); }
    } else if (kind === 'wood') { g.fillStyle = rgb([176, 134, 92]); g.fillRect(0, 0, n, n); noise(g, n, 24, 41); g.globalAlpha = 0.25; g.strokeStyle = '#4a2e14'; for (i = 0; i < 90; i++) { g.lineWidth = 0.6 + r() * 1.6; g.beginPath(); var ya = r() * n; g.moveTo(0, ya); g.bezierCurveTo(n * 0.3, ya + (r() - 0.5) * 20, n * 0.7, ya + (r() - 0.5) * 20, n, ya + (r() - 0.5) * 8); g.stroke(); }
    } else { g.fillStyle = '#999'; g.fillRect(0, 0, n, n); }
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.encoding = THREE.sRGBEncoding; cache[kind] = t; return t;
  }
  function mat(kind, o) { /* a lit, bump-mapped surface; the tile covers `tile` metres (2 by default) */
    o = o || {}; var t = tex(kind).clone(); t.needsUpdate = true; var tile = o.tile || 2; t.repeat.set(1 / tile, 1 / tile);
    var m = new THREE.MeshStandardMaterial({ map: t, color: o.color != null ? o.color : 0xffffff, roughness: o.rough != null ? o.rough : 0.92, metalness: 0, bumpMap: t, bumpScale: o.bump != null ? o.bump : 0.006 });
    return m;
  }
  function plane(sc, w, h, m, x, y, z, rx, ry, o) { var p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.set(rx || 0, ry || 0, 0); if (m.map) { m.map.repeat.set(w / (o && o.tile || 2), h / (o && o.tile || 2)); } p.receiveShadow = true; sc.add(p); return p; }
  function box(sc, w, h, d, m, x, y, z, o) { var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = !(o && o.noShadow); b.receiveShadow = true; if (o && o.ry) b.rotation.y = o.ry; sc.add(b); return b; }
  function solid(color, rough, metal) { return new THREE.MeshStandardMaterial({ color: color, roughness: rough != null ? rough : 0.7, metalness: metal || 0 }); }
  function glass() { return new THREE.MeshStandardMaterial({ color: 0x2b3a46, roughness: 0.08, metalness: 0.75 }); }
  function cyl(sc, r, h, m, x, y, z) { var c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), m); c.position.set(x, y, z); c.castShadow = true; c.receiveShadow = true; sc.add(c); return c; }
  function window_(sc, x, y, z, w, h, o) { /* a window flush in a wall facing +z (ry = 0) or ±x */
    var g = new THREE.Group(), fr = solid(0x9a9ea3, 0.45, 0.6), t = 0.06; g.position.set(x, y, z); if (o && o.ry) g.rotation.y = o.ry;
    var gl = new THREE.Mesh(new THREE.PlaneGeometry(w - t * 2, h - t * 2), glass()); gl.position.z = 0.02; g.add(gl);
    [[0, h / 2 - t / 2, w, t], [0, -h / 2 + t / 2, w, t], [-w / 2 + t / 2, 0, t, h], [w / 2 - t / 2, 0, t, h], [0, 0, t * 0.7, h]].forEach(function (f) { var b = new THREE.Mesh(new THREE.BoxGeometry(f[2], f[3], 0.08), fr); b.position.set(f[0], f[1], 0.03); b.castShadow = true; g.add(b); });
    var sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.05, 0.12), solid(0xb9bcc0, 0.5)); sill.position.set(0, -h / 2 - 0.02, 0.06); sill.castShadow = true; g.add(sill);
    sc.add(g); return g;
  }
  function skyline(sc, o) { /* blocks of buildings in the haze, on an arc at the given radius; the fog does the rest */
    var r = rng(77), i, n = o.n || 11, R = o.r || 22, a0 = o.a0 != null ? o.a0 : -Math.PI, a1 = o.a1 != null ? o.a1 : Math.PI, base = o.base != null ? o.base : 0;
    for (i = 0; i < n; i++) { var a = a0 + (a1 - a0) * (i + 0.5) / n + (r() - 0.5) * 0.08, w = 7 + r() * 8, h = (o.hmin || 8) + r() * (o.hvar || 12), d = 7 + r() * 6, x = Math.sin(a) * (R + r() * 10), z = Math.cos(a) * (R + r() * 10), tn = 0.72 + r() * 0.26;
      var m = mat('city', { tile: 6, rough: 0.8, bump: 0, color: new THREE.Color(tn, tn * (0.98 + r() * 0.03), tn * (0.96 + r() * 0.05)) }); m.map.repeat.set(Math.round(w / 1.5) / 8, Math.round(h / 3) / 8); /* a window every 1.5 m, a storey every 3 m */
      var b = box(sc, w, h, d, m, x, base + h / 2, z, { noShadow: true, ry: a + Math.PI }); b.receiveShadow = false; }
  }
  function sky(sc, o) { /* a gradient dome with the glow of the sun; no fog on it */
    var top = new THREE.Color(o.top), hz = new THREE.Color(o.hz), sun = o.sun ? new THREE.Vector3().copy(o.sun).normalize() : null, geo = new THREE.SphereGeometry(o.r || 60, 32, 16), pos = geo.attributes.position, col = [], c = new THREE.Color(), v = new THREE.Vector3(), i;
    for (i = 0; i < pos.count; i++) { v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize(); var t = Math.max(0, Math.min(1, (v.y + 0.05) / 0.75)); c.copy(hz).lerp(top, Math.pow(t, 0.65)); if (sun) { var d = Math.max(0, v.dot(sun)); c.lerp(new THREE.Color(0xfff4de), Math.pow(d, 30) * 0.9 + Math.pow(d, 4) * 0.12); } col.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); var s = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, toneMapped: false })); s.position.y = o.y || 0; sc.add(s); return s;
  }
  function uvShift(geo, dx, dy, flipY) { var uv = geo.attributes.uv, i; if (!uv) return geo; for (i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) + dx, flipY ? dy - uv.getY(i) : uv.getY(i) + dy); uv.needsUpdate = true; return geo; }
  function wallWithHole(sc, w, h, m, hole, x, y, z, o) { /* a wall face with the sample's footprint cut out, so the sample's own face carries on into it without a step; the uv in metres, shifted as the member maps its faces (x + 1, y + 0.5) when the material is the sample's */
    var sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h); sh.lineTo(-w / 2, h); sh.closePath();
    if (hole) { var hp = new THREE.Path(); hp.moveTo(hole.x0, hole.y0); hp.lineTo(hole.x1, hole.y0); hp.lineTo(hole.x1, hole.y1); hp.lineTo(hole.x0, hole.y1); hp.closePath(); sh.holes.push(hp); }
    var geo = new THREE.ShapeGeometry(sh, 1); if (o && o.uv) uvShift(geo, o.uv[0], o.uv[1]); var p = new THREE.Mesh(geo, m); p.position.set(x, y, z); if (o && o.ry) p.rotation.y = o.ry; p.receiveShadow = true; sc.add(p); return p; }
  function cloneSurface(src, boxed, bb) { /* a copy of one of the sample's materials for the place: opaque, front-sided, its map repeating; `boxed` tops (0..1 over the box) get the texel size of the box */
    var m = src.clone(); m.side = THREE.FrontSide; m.transparent = false; m.opacity = 1; m.depthWrite = true; if (m.clippingPlanes) m.clippingPlanes = null; m.polygonOffset = false; m.userData = { metres: !boxed };
    if (m.map) { m.map = m.map.clone(); m.map.needsUpdate = true; m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; var rx = m.map.repeat.x || 1, ry = m.map.repeat.y || 1; if (boxed && bb) m.map.repeat.set(rx / Math.max(0.5, bb.max.x - bb.min.x), ry / Math.max(0.5, bb.max.z - bb.min.z)); else m.map.repeat.set(rx, ry); }
    if (m.bumpMap && m.bumpMap !== src.map) { m.bumpMap = m.map || null; } else if (m.map) { m.bumpMap = m.map; if (!src.bumpMap) m.bumpScale = 0.002; } /* a colour map borrowed as bump needs a bump scale of millimetres, never the material's default of 1 */
    return m; }
  function faceMaterial(member, box, face, fallback) { /* the material of the sample's own mesh that fills `box` (world), on the given face (0 +x, 1 -x, 2 +y, 3 -y, 4 +z, 5 -z) */
    if (!box) return fallback; var best = null, score = 1e9; member.group.updateMatrixWorld(true);
    member.group.traverse(function (ob) { if (!ob.isMesh || !ob.visible || !ob.geometry || !ob.material) return; var ml = [].concat(ob.material); if (ml.length < 6) return; if (!ob.geometry.boundingBox) ob.geometry.computeBoundingBox(); var bb = ob.geometry.boundingBox.clone().applyMatrix4(ob.matrixWorld), e = Math.abs(bb.min.x - box.x0) + Math.abs(bb.max.x - box.x1) + Math.abs(bb.min.y - box.y0) + Math.abs(bb.max.y - box.y1) + Math.abs(bb.min.z - box.z0) + Math.abs(bb.max.z - box.z1); if (e < score) { score = e; best = ob; } });
    if (!best || score > 0.3) return fallback; var src = [].concat(best.material)[face]; if (!src || src.visible === false) return fallback; var keys = best.userData.keys || []; return cloneSurface(src, keys[face] === 'box', best.geometry.boundingBox.clone().applyMatrix4(best.matrixWorld)); }
  function topMaterial(member, slab, fallback) { /* the material of the sample's own slab top, so the ground around it is the same surface (colour, map, roughness) and the two read as one */
    if (!slab) return fallback; var best = null, area = 0; member.group.traverse(function (ob) { if (ob.isMesh && ob.visible && ob.geometry && ob.geometry.boundingBox && ob.material) { var mm = [].concat(ob.material)[0]; if (!mm || mm.opacity < 0.6 || mm.visible === false) return; var bb = ob.geometry.boundingBox.clone().applyMatrix4(ob.matrixWorld), w = bb.max.x - bb.min.x, d = bb.max.z - bb.min.z, h = bb.max.y - bb.min.y; if (Math.abs(bb.max.y - slab.y1) < 0.006 && w > 1 && d > 0.3 && h > 0.005 && w * d > area && w < 40) { area = w * d; best = ob; } } }); /* a body with some thickness: the slab itself, not a film laid on it */
    if (!best) return fallback; var ml = [].concat(best.material), src = ml.length >= 3 ? ml[2] : ml[0], keys = best.userData.keys || []; /* the top face of a six-sided box is its third material (+y), not the first (+x) */
    return cloneSurface(src, ml.length >= 3 && keys[2] === 'box', best.geometry.boundingBox.clone().applyMatrix4(best.matrixWorld)); }
  function groundWithHole(sc, x0, x1, z0, z1, m, hole, y) { /* a ground plane (XZ) with the sample's slab cut out, so the two never fight for the same surface */
    var sh = new THREE.Shape(); sh.moveTo(x0, -z1); sh.lineTo(x1, -z1); sh.lineTo(x1, -z0); sh.lineTo(x0, -z0); sh.closePath(); /* the shape's y is −z after the turn */
    if (hole) { var hp = new THREE.Path(); hp.moveTo(hole.x0, -hole.z1); hp.lineTo(hole.x1, -hole.z1); hp.lineTo(hole.x1, -hole.z0); hp.lineTo(hole.x0, -hole.z0); hp.closePath(); sh.holes.push(hp); }
    var geo = new THREE.ShapeGeometry(sh, 1); if (m.userData && m.userData.metres) uvShift(geo, 1, 1, true); /* the sample's own top maps (x + 1, z + 1): the shape's y is -z */ var p = new THREE.Mesh(geo, m); p.rotation.x = -Math.PI / 2; p.position.y = y; p.receiveShadow = true; sc.add(p); return p; }
  function faceZ(member, bx) { /* the front face of the sample's wall: the furthest +z of its wide parts, tools and callouts left out */
    var z = -1; member.group.traverse(function (ob) { if (ob.isMesh && ob.visible && ob.geometry && ob.geometry.boundingBox) { var bb = ob.geometry.boundingBox.clone().applyMatrix4(ob.matrixWorld); if (bb.max.x - bb.min.x > 0.5 && bb.max.z < 0.3 && bb.max.y > 0.3) z = Math.max(z, bb.max.z); } }); return z > -1 ? z : 0; }
  function sampleBox(member) { var box3 = new THREE.Box3(); member.group.updateMatrixWorld(true); member.group.traverse(function (ob) { if (ob.isMesh && ob.visible && ob.geometry) { if (!ob.geometry.boundingBox) ob.geometry.computeBoundingBox(); var bb = ob.geometry.boundingBox.clone().applyMatrix4(ob.matrixWorld); if (bb.max.y - bb.min.y < 40 && bb.max.x - bb.min.x < 40 && bb.max.z - bb.min.z < 40) box3.union(bb); } }); return box3; }

  /* ----- the places ----- */
  function facade(sc, E) { /* the street side of a building: the sample's own cladding goes on, bays each way and rows above (its kit, its joints sealed), the storeys above it rendered behind a drip flashing, the neighbours' facades beyond the run with their windows; a pavement, a kerb, the road, the city in the haze */
    var g = E.ground, W = 44, Hh = 14, fz = E.face, ext = null, i, k;
    if (E.extend) { try { ext = E.extend(sc); } catch (e) { ext = null; if (window.console) console.error('simenv extend', e); } }
    if (ext) { var steel = ext.kind === 'steel', up = steel ? solid(0xdcdedd, 0.45, 0.35) : mat('render', { tile: 2, bump: 0.008, color: 0xe4e1da }), nb = mat('render', { tile: 2, bump: 0.008, color: 0xd6d3cc }), yT = g + ext.y1;
      plane(sc, W, Hh - ext.y1, up, 0, yT + (Hh - ext.y1) / 2, fz - 0.03, 0, 0, { tile: 2 }); /* the upper storeys (the sheeting of an industrial building goes on plain) */
      box(sc, ext.x1 - ext.x0 + 0.06, 0.05, 0.1, solid(0x8d9196, 0.5, 0.5), (ext.x0 + ext.x1) / 2, yT + 0.025, fz + 0.02, { noShadow: true }); /* the flashing over the top row */
      if (!steel) for (k = 0; k < 2; k++) for (i = -3; i <= 3; i++) window_(sc, i * 6.2 + (k % 2 ? 3.1 : 0), yT + 1.6 + k * 3.2, fz - 0.03, 1.7, 1.5);
      [[ext.x1, W / 2], [-W / 2, ext.x0]].forEach(function (sd) { var w = sd[1] - sd[0]; if (w < 0.3) return; var cx = (sd[0] + sd[1]) / 2; plane(sc, w, ext.y1, nb, cx, g + ext.y1 / 2, fz - 0.06, 0, 0, { tile: 2 }); box(sc, 0.5, ext.y1, 0.4, solid(0xc4c1ba, 0.8), sd[0] === ext.x1 ? ext.x1 + 0.2 : ext.x0 - 0.2, g + ext.y1 / 2, fz - 0.08); window_(sc, cx, g + 1.5, fz - 0.06, 1.7, 1.5); }); /* the neighbours: a pilaster at the party line, their own render */ }
    else { var wallM = mat(E.tex || 'render', { tile: 2, bump: E.tex === 'siding' ? 0.012 : 0.008 });
      wallWithHole(sc, W, Hh, wallM, E.hole, 0, g, fz - 0.002);
      for (k = 0; k < 3; k++) for (i = -2; i <= 2; i++) { if (k === 0 && i === 0) continue; window_(sc, i * 6.2 + (k % 2 ? 3.1 : 0), g + 1.6 + k * 3.2, fz - 0.002, 1.7, 1.5); } }
    var pipe = cyl(sc, 0.05, Hh, solid(0x7c8287, 0.5, 0.4), 4.0, g + Hh / 2, fz + 0.09);
    /* the pavement, the sample's own slab cut out of it; a kerb; the road 12 cm lower */
    var pav = mat('yard', { tile: 2.5, bump: 0.004 }); pav.map.repeat.set(1 / 2.5, 1 / 2.5); groundWithHole(sc, -W / 2, W / 2, -20, 4.9, E.slabMat || pav, E.slab, E.slab && E.slab.y1 != null ? E.slab.y1 : g);
    box(sc, W, 0.15, 0.2, solid(0xbfbfba, 0.85), 0, g - 0.045, 5.0, { noShadow: true });
    plane(sc, W, 25, mat('yard', { tile: 2.5, color: 0x5f6164, rough: 1 }), 0, g - 0.12, 17.6, -Math.PI / 2, 0, { tile: 2.5 });
    box(sc, 0.3, 0.1, 0.3, solid(0xf0f0ee, 0.9), 3.3, g + 0.05, 0.9); /* the sealant case and a bucket, beside the work and out of the way */
    cyl(sc, 0.15, 0.3, solid(0x3b4a7a, 0.6), 3.7, g + 0.15, 1.1);
    skyline(sc, { r: 26, a0: -Math.PI * 0.6, a1: Math.PI * 0.6, base: g - 0.5, hmin: 9, hvar: 14, n: 12 });
  }
  function garden(sc, E) { /* a boundary wall along the lane: the sample's own wall runs on both ways (its kit, its materials, its coping), the neighbours' rendered walls beyond, the ground in the pavement's own surface, houses behind */
    var g = E.ground, top = E.top, W = 44, fz = E.face, ext = null;
    if (E.extend) { try { ext = E.extend(sc); } catch (e) { ext = null; if (window.console) console.error('simenv extend', e); } }
    if (ext) { /* beyond the run of the sample's wall: the neighbours' walls, rendered and a little lower, each with its own coping */
      var nm = mat('render', { tile: 2, bump: 0.008, color: 0xd9d6cf }), nh = Math.max(0.9, top - g - 0.12); [[ext.x1, W / 2], [-W / 2, ext.x0]].forEach(function (s) { var w = s[1] - s[0]; if (w < 0.3) return; plane(sc, w, nh, nm, (s[0] + s[1]) / 2, g + nh / 2, fz - 0.03); box(sc, w, 0.05, 0.24, solid(0xc9c9c4, 0.75), (s[0] + s[1]) / 2, g + nh + 0.025, fz - 0.14, { noShadow: true }); box(sc, 0.3, nh + 0.1, 0.3, solid(0xbdbab2, 0.8), s[0] === ext.x1 ? ext.x1 + 0.1 : ext.x0 - 0.1, g + (nh + 0.1) / 2, fz - 0.1); }); }
    else { var m = mat(E.tex || 'block', { tile: 2, bump: 0.01 });
      wallWithHole(sc, W, top - g, m, E.hole ? { x0: E.hole.x0, x1: E.hole.x1, y0: 0, y1: top - g + 0.5 } : null, 0, g, fz - 0.002);
      box(sc, (W - (E.hole ? E.hole.x1 - E.hole.x0 : 0)) / 2, 0.06, 0.26, solid(0xc9c9c4, 0.75), (E.hole ? E.hole.x1 : 0) + (W - (E.hole ? E.hole.x1 - E.hole.x0 : 0)) / 4, top + 0.03, fz - 0.13, { noShadow: true });
      box(sc, (W - (E.hole ? E.hole.x1 - E.hole.x0 : 0)) / 2, 0.06, 0.26, solid(0xc9c9c4, 0.75), (E.hole ? E.hole.x0 : 0) - (W - (E.hole ? E.hole.x1 - E.hole.x0 : 0)) / 4, top + 0.03, fz - 0.13, { noShadow: true }); }
    plane(sc, W, 3.2, mat('render', { tile: 2, color: 0xd8d4cc }), 0, top + 0.06 + 1.6, -5.0); /* the house behind the wall */
    window_(sc, -3.2, top + 1.4, -4.99, 1.6, 1.3); window_(sc, 3.4, top + 1.4, -4.99, 1.6, 1.3);
    box(sc, 0.5, 0.5, 0.32, solid(0x1c1c1c, 0.6), 3.3, g + 0.25, 0.9); /* the pressure washer, a tray, beside the work and out of the way */
    cyl(sc, 0.08, 0.5, solid(0x3a3a3a, 0.5), 3.65, g + 0.25, 1.2);
    box(sc, 0.36, 0.05, 0.26, solid(0xd0d0cc, 0.6), -3.3, g + 0.025, 1.0, { noShadow: true });
    var grv = mat('gravel', { tile: 2.5, bump: 0.004 }); grv.map.repeat.set(1 / 2.5, 1 / 2.5); groundWithHole(sc, -W / 2, W / 2, -20, 4.9, E.slabMat || grv, E.slab, E.slab && E.slab.y1 != null ? E.slab.y1 : g); /* the ground, the sample's slab cut out, in the slab's own surface */
    box(sc, W, 0.12, 0.16, solid(0xbfbfba, 0.85), 0, g - 0.04, 4.98, { noShadow: true });
    plane(sc, W, 25, mat('yard', { tile: 2.5, color: 0x6b6d70, rough: 1 }), 0, g - 0.1, 17.6, -Math.PI / 2, 0, { tile: 2.5 }); /* the lane */
    skyline(sc, { r: 24, a0: Math.PI * 0.45, a1: Math.PI * 1.55, base: g - 1, hmin: 5, hvar: 8, n: 9 });
  }
  function road(sc, E) { /* a parapet or retaining wall along a road: the sample's wall continued with its coping, plain concrete walls beyond, the pavement, the kerb and the road, low buildings far off */
    var g = E.ground, top = E.top, W = 44, fz = E.face, ext = null;
    if (E.extend) { try { ext = E.extend(sc); } catch (e) { ext = null; if (window.console) console.error('simenv extend', e); } }
    var cm = mat('panel', { tile: 2, bump: 0.004, color: 0xd2d0ca }); cm.map.repeat.set(0.5, 0.5);
    var x0 = ext ? ext.x0 : -1.2, x1 = ext ? ext.x1 : 1.2; [[x1, W / 2], [-W / 2, x0]].forEach(function (sd) { var w = sd[1] - sd[0]; if (w < 0.3) return; plane(sc, w, top - g, cm, (sd[0] + sd[1]) / 2, g + (top - g) / 2, fz - 0.02); box(sc, w, 0.09, 0.26, solid(0xc9c9c4, 0.75), (sd[0] + sd[1]) / 2, top + 0.045, fz - 0.12, { noShadow: true }); });
    if (!ext) { wallWithHole(sc, W, top - g, cm, E.hole ? { x0: E.hole.x0, x1: E.hole.x1, y0: 0, y1: top - g + 0.5 } : null, 0, g, fz - 0.002); }
    var pav = mat('yard', { tile: 2.5, bump: 0.004 }); pav.map.repeat.set(1 / 2.5, 1 / 2.5); groundWithHole(sc, -W / 2, W / 2, -20, 2.4, E.slabMat || pav, E.slab, E.slab && E.slab.y1 != null ? E.slab.y1 : g);
    box(sc, W, 0.15, 0.2, solid(0xbfbfba, 0.85), 0, g - 0.045, 2.5, { noShadow: true });
    plane(sc, W, 30, mat('yard', { tile: 2.5, color: 0x55575a, rough: 1 }), 0, g - 0.12, 17.6, -Math.PI / 2, 0, { tile: 2.5 }); /* the road */
    [-6, 0, 6].forEach(function (x) { box(sc, 0.12, 0.004, 3, solid(0xf4f4f0, 0.6), x + 3, g - 0.117, 9.5, { noShadow: true }); }); /* the lane markings */
    box(sc, 0.5, 0.5, 0.32, solid(0x1c1c1c, 0.6), 3.3, g + 0.25, 1.3); cyl(sc, 0.08, 0.5, solid(0x3a3a3a, 0.5), 3.65, g + 0.25, 1.6); /* the compressor and a cartridge box, beside the work */
    skyline(sc, { r: 30, a0: Math.PI * 0.4, a1: Math.PI * 1.6, base: g - 1, hmin: 4, hvar: 8, n: 9 }); skyline(sc, { r: 34, a0: -Math.PI * 0.45, a1: Math.PI * 0.45, base: g - 1.5, hmin: 5, hvar: 10, n: 8 });
  }
  function channel(sc, E) { /* an open concrete drainage channel: the sample's wall and floor continued, the opposite wall (built by the sample's kit), the ground at the top of the walls on both banks, the sky */
    var g = E.ground, top = E.top, fz = E.face, ext = null;
    if (E.extend) { try { ext = E.extend(sc); } catch (e) { ext = null; if (window.console) console.error('simenv extend', e); } }
    var bank = mat('gravel', { tile: 2.5, bump: 0.004, color: 0xb9b6a8 }); bank.map.repeat.set(1 / 2.5, 1 / 2.5);
    var x0 = ext ? ext.x0 : -1.45, x1 = ext ? ext.x1 : 1.45, zb = -0.5, zf = 1.4 + 0.16;
    groundWithHole(sc, -22, 22, -22, 22, bank, { x0: x0 - 0.01, x1: x1 + 0.01, z0: zb - 0.4, z1: zf + 0.01 }, top); /* the banks, at the height of the wall tops */
    box(sc, 0.3, top - g + 0.2, zf - zb + 0.4, solid(0xc9c7c0, 0.8), x1 + 0.15, g + (top - g) / 2, (zb + zf) / 2, { noShadow: true }); /* the end of the run: a headwall */
    var cm = mat('panel', { tile: 2, bump: 0.004, color: 0xcfcdc6 }); cm.map.repeat.set(0.5, 0.5); box(sc, 0.25, top - g, zf - 0.55, cm, x0 - 0.13, g + (top - g) / 2, (0.6 + zf) / 2); /* the channel turns at the sample's return wall: the end of the run closed */
    cyl(sc, 0.06, 0.9, solid(0x6a6e72, 0.5, 0.4), -0.6, top + 0.45, zb - 0.6); cyl(sc, 0.06, 0.9, solid(0x6a6e72, 0.5, 0.4), 2.4, top + 0.45, zb - 0.6); box(sc, 3.2, 0.04, 0.04, solid(0x6a6e72, 0.5, 0.4), 0.9, top + 0.9, zb - 0.6, { noShadow: true }); /* a guard rail on the bank */
    skyline(sc, { r: 30, base: top - 0.5, hmin: 3, hvar: 6, n: 10 });
  }
  function balcony(sc, E) { /* the balcony of the sample is complete to 1.1 m (walls, door, railing): the walls go on up to the slab above in the sample's own surfaces, a partition closes the cut side, the street lies nine metres below */
    var y = E.floor, wall = E.wallMat || mat('render', { tile: 2 }), conc = E.sideMat || mat('panel', { tile: 2, color: 0xbfbfbb }), B = E.wall; /* B: the sample's back wall box */
    wallWithHole(sc, 2.3, 2.75 - B.y1, wall, null, 0, y + B.y1, B.z1 - 0.002, E.wallMat ? { uv: [1, B.y1 + 0.5] } : null); /* the back wall, above */
    if (E.door) { var fr = solid(0x8f9398, 0.4, 0.6), gl = new THREE.Mesh(new THREE.PlaneGeometry(E.door.x1 - E.door.x0, 2.05 - B.y1), glass()); gl.position.set((E.door.x0 + E.door.x1) / 2, y + B.y1 + (2.05 - B.y1) / 2, E.door.z); sc.add(gl);
      var top = new THREE.Mesh(new THREE.BoxGeometry(E.door.x1 - E.door.x0 + 0.12, 0.07, 0.1), fr); top.position.set((E.door.x0 + E.door.x1) / 2, y + 2.05 + 0.035, E.door.z + 0.02); top.castShadow = true; sc.add(top);
      var mid = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.05 - B.y1, 0.06), fr); mid.position.set((E.door.x0 + E.door.x1) / 2, y + B.y1 + (2.05 - B.y1) / 2, E.door.z + 0.02); sc.add(mid); }
    if (E.side) { var sb = box(sc, E.side.x1 - E.side.x0, 2.75 - B.y1, E.side.z1 - E.side.z0, conc, (E.side.x0 + E.side.x1) / 2, y + B.y1 + (2.75 - B.y1) / 2, (E.side.z0 + E.side.z1) / 2); if (E.sideMat) { var gb = sb.geometry, pp = gb.attributes.position, nn = gb.attributes.normal, uu = gb.attributes.uv, q; for (q = 0; q < pp.count; q++) { if (Math.abs(nn.getX(q)) > 0.5) uu.setXY(q, pp.getZ(q) + sb.position.z + 1, pp.getY(q) + sb.position.y + 0.5); else uu.setXY(q, pp.getX(q) + sb.position.x + 1, pp.getY(q) + sb.position.y + 0.5); } uu.needsUpdate = true; } } /* the side wall, above, mapped as the sample maps its faces */
    box(sc, 0.04, 1.9, E.deck.z1 - E.deck.z0 + 0.25, solid(0xcfd2d5, 0.55, 0.2), E.deck.x0 - 0.03, y + 0.95, (E.deck.z0 + E.deck.z1) / 2 - 0.12); /* the partition on the cut side */
    box(sc, 0.06, 1.9, 0.06, solid(0x8f9398, 0.4, 0.6), E.deck.x0 - 0.03, y + 0.95, E.deck.z1 + 0.1);
    box(sc, 2.4, 0.2, E.deck.z1 - B.z0 + 0.2, conc, 0, y + 2.85, (B.z0 + E.deck.z1) / 2 + 0.05, { noShadow: true }); /* the slab of the balcony above */
    plane(sc, 60, 60, mat('yard', { tile: 2.5, color: 0x55575a, rough: 1 }), 0, y - 9, 10, -Math.PI / 2, 0, { tile: 2.5 }); /* the street below */
    skyline(sc, { r: 20, a0: -Math.PI * 0.55, a1: Math.PI * 0.55, base: y - 9, hmin: 6, hvar: 12, n: 10 });
  }
  function roof(sc, E) { /* a flat roof: the deck and the parapets of the sample run on, a stair bulkhead, air-conditioning units, the city below */
    var y = E.floor, m = mat('roofcoat', { tile: 2.5, bump: 0.003 }), pw = E.parMat || solid(0xc4c2bc, 0.85), cp = solid(0xb3b3ae, 0.7), D = E.deck, R = 9;
    m.map.repeat.set(1 / 2.5, 1 / 2.5); groundWithHole(sc, -R, (E.par ? E.par.side.x1 : D.x1) + 0.02, (E.par ? E.par.back.z0 : D.z0) - 0.02, R, E.slabMat || m, E.slab, E.slab ? E.slab.y1 : y); /* the roof deck around the sample, flush with its top and in its own surface */
    var P = E.par; if (P) { box(sc, R + P.back.x0, P.back.y1, P.back.z1 - P.back.z0, pw, (P.back.x0 - R) / 2, y + P.back.y1 / 2, (P.back.z0 + P.back.z1) / 2, { noShadow: true }); box(sc, P.side.x1 - P.side.x0, P.side.y1, R - P.side.z1, pw, (P.side.x0 + P.side.x1) / 2, y + P.side.y1 / 2, (P.side.z1 + R) / 2, { noShadow: true }); }
    var h = P ? P.back.y1 : 0.55; box(sc, 0.3, h, R - (P ? P.back.z0 : -0.2), pw, -R, y + h / 2, (R + (P ? P.back.z0 : -0.2)) / 2, { noShadow: true }); box(sc, R + (P ? P.side.x1 : 0.9) + 0.3, h, 0.3, pw, ((P ? P.side.x1 : 0.9) - R) / 2, y + h / 2, R, { noShadow: true });
    [[-R, (R + (P ? P.back.z0 : -0.2)) / 2, 0.4, R - (P ? P.back.z0 : -0.2)], [((P ? P.side.x1 : 0.9) - R) / 2, R, R + (P ? P.side.x1 : 0.9) + 0.4, 0.4]].forEach(function (c) { box(sc, c[2], 0.05, c[3], cp, c[0], y + h + 0.025, c[1], { noShadow: true }); });
    box(sc, 2.6, 2.6, 2.6, mat('render', { tile: 2 }), -5.5, y + 1.3, 5.5); box(sc, 1.1, 0.9, 0.5, solid(0xd9d9d6, 0.6, 0.3), -3.4, y + 0.45, 3.2); box(sc, 1.1, 0.9, 0.5, solid(0xd9d9d6, 0.6, 0.3), -4.7, y + 0.45, 3.2);
    cyl(sc, 0.17, 0.3, solid(0xe8e8e4, 0.5), -1.8, y + 0.15, 2.0); box(sc, 0.36, 0.05, 0.26, solid(0x2a2a2a, 0.6), -2.3, y + 0.025, 2.1, { noShadow: true });
    skyline(sc, { r: 28, base: y - 14, hmin: 6, hvar: 14, n: 16 });
  }
  function room(sc, E) { /* the room: the screed around the sample in its own surface, the back wall flush with the sample's wall face and in its render, the sample's return wall carried on as the room's side wall, a window, the ceiling with its lights, the door */
    var y = E.floor, B = E.wall, pl = mat('plaster', { tile: 2, bump: 0.002, color: 0xd2d2ce }), zb = B ? B.z1 : -0.002, wm = E.wallMat || pl, RT = E.ret, xl = RT ? RT.x1 : -3.5, xr = 3.5, zf = zb + 4.6;
    var fl = mat('slab', { tile: 2, bump: 0.003 }); fl.map.repeat.set(0.5, 0.5); groundWithHole(sc, xl, xr, zb - 0.2, zf + 0.02, E.slabMat || fl, E.slab, E.slab ? E.slab.y1 : y - 0.004); /* the screed around the sample, flush with its top and in its own surface */
    wallWithHole(sc, xr - xl, 2.6, wm, B ? { x0: B.x0 + 0.002 - (xl + xr) / 2, x1: B.x1 - 0.002 - (xl + xr) / 2, y0: -0.2, y1: B.y1 - y - 0.002 } : null, (xl + xr) / 2, y, zb - 0.0006, E.wallMat ? { uv: [(xl + xr) / 2 + 1, y + 0.5] } : null); /* the back wall around and above the sample's, flush with its face */
    wallWithHole(sc, xr - xl, 2.6, wm, null, (xl + xr) / 2, y, zf, { ry: Math.PI, uv: E.wallMat ? [-(xl + xr) / 2 + 1, y + 0.5] : null });
    if (RT) { var rw = zf - RT.z0 + 0.2; wallWithHole(sc, rw, 2.6, E.retMat || pl, { x0: rw / 2 - 0.2 - (RT.z1 - RT.z0) + 0.002, x1: rw / 2 - 0.2 - 0.002, y0: -0.2, y1: RT.y1 - y - 0.002 }, RT.x1 - 0.0006, y, (RT.z0 - 0.2 + zf) / 2, { ry: Math.PI / 2, uv: E.retMat ? [1, y + 0.5] : null }); } /* the return wall of the sample carried on along the room and up (turned to face +x: its local x runs down -z, the sample's wall cut out of it) */
    else plane(sc, 4.8, 2.6, pl, xl, y + 1.3, zb + 2.3, 0, Math.PI / 2);
    plane(sc, zf - zb, 2.6, wm, xr, y + 1.3, (zb + zf) / 2, 0, -Math.PI / 2);
    plane(sc, xr - xl, zf - zb, mat('ceiling', { tile: 2, bump: 0 }), (xl + xr) / 2, y + 2.6, (zb + zf) / 2, Math.PI / 2);
    window_(sc, xr - 0.01, y + 1.5, zb + 1.6, 1.7, 1.3, { ry: -Math.PI / 2 });
    var lamp = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6e6, emissiveIntensity: 1.6, roughness: 1 }); [[-1.4, zb + 2.3], [1.4, zb + 2.3]].forEach(function (p) { var l = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), lamp); l.position.set(p[0], y + 2.59, p[1]); l.rotation.x = Math.PI / 2; sc.add(l); });
    var df = solid(0xe9e6df, 0.5); box(sc, 0.9, 2.05, 0.05, df, xl + 1.3, y + 1.025, zf - 0.03, { noShadow: true }); box(sc, 1.0, 0.08, 0.14, solid(0x8d8a84, 0.6), xl + 1.3, y + 2.08, zf - 0.03, { noShadow: true });
    cyl(sc, 0.16, 0.35, solid(0xe7e7e3, 0.5), xr - 0.4, y + 0.175, zb + 2.8); box(sc, 0.9, 0.12, 0.3, mat('wood', { tile: 1 }), xr - 0.6, y + 0.06, zb + 3.6); /* the pail, a stack of boards, along the walls */
  }

  /* the place for a guide's scenario */
  function placeOf(cat, scn) {
    if (cat === 'sl') return scn === 'water' ? { kind: 'channel', amb: 'outdoor' } : scn === 'civil' ? { kind: 'road', amb: 'outdoor' } : { kind: 'facade', tex: scn === 'siding' || scn === 'sash' || scn === 'vent' || scn === 'putty' ? 'siding' : (scn === 'pca' || scn === 'paint') ? 'panel' : 'render', amb: 'outdoor' };
    if (cat === 'po') return { kind: 'garden', tex: scn === 'blockwall' ? 'block' : scn === 'brick' ? 'brick' : scn === 'tile' ? 'tile' : scn === 'concrete' ? 'panel' : 'render', amb: 'outdoor' };
    if (cat === 'ux') return scn === 'roof' ? { kind: 'roof', amb: 'roof' } : { kind: 'balcony', amb: 'outdoor' };
    return { kind: 'room', amb: 'indoor' };
  }
  function boxes(member, test) { /* the union box of the sample's blocks that pass the test (world space): the boxes of the member's kit, never a pipe, a tube or a plane */
    var u = null; member.group.updateMatrixWorld(true); member.group.traverse(function (ob) { if (ob.isMesh && ob.visible && ob.geometry && (ob.userData.keys || ob.geometry.type === 'BoxGeometry')) { if (!ob.geometry.boundingBox) ob.geometry.computeBoundingBox(); var bb = ob.geometry.boundingBox.clone().applyMatrix4(ob.matrixWorld), h = bb.max.y - bb.min.y, w = bb.max.x - bb.min.x, d = bb.max.z - bb.min.z; if (h < 40 && w < 40 && d < 40 && test(bb, w, h, d)) { if (!u) u = bb; else u.union(bb); } } });
    return u ? { x0: u.min.x, x1: u.max.x, y0: u.min.y, y1: u.max.y, z0: u.min.z, z1: u.max.z } : null; }
  function build(view, cat, scn) {
    var scene = view.dbg.scene, sc = new THREE.Group(), r = view.dbg.renderer, member = view.dbg.member, P = placeOf(cat, scn), outdoor = P.amb !== 'indoor', g = member.ground || 0, bx = sampleBox(member);
    sc.name = 'simEnv'; scene.add(sc); /* everything of the place goes into one group, so a change of scenario can take it away again */
    var sunDir = view.sun ? view.sun.position.clone().sub(view.sun.target.position) : new THREE.Vector3(2, 3, 4);
    sky(sc, { top: outdoor ? 0x5f93c8 : 0x2a2d31, hz: outdoor ? 0xe4ecf1 : 0x45494e, sun: outdoor ? sunDir : null, r: 60, y: g });
    var fogC = outdoor ? 0xd6dfe6 : 0x3a3e43; scene.fog = new THREE.Fog(screenColor(fogC), outdoor ? 8 : 5, outdoor ? 34 : 16); r.setClearColor(screenColor(fogC), 1);
    var gm = view.sun && view.sun.userData.ground, sh = view.sun && view.sun.userData.shadow;
    if (gm) gm.visible = false; /* the engine's studio floor gives way to the place's own ground */
    if (sh) sh.visible = false;
    var E = { ground: g, floor: 0, tex: P.tex, kind: P.kind };
    if (P.kind === 'facade' || P.kind === 'garden' || P.kind === 'road' || P.kind === 'channel') { /* the wall of the sample: its wide, tall parts near z = 0 */
      var Wa = boxes(member, function (bb, w, h) { return h > 0.4 && w > 0.3 && bb.min.z > -0.5 && bb.max.z < 0.4 && bb.min.y > -0.1; }) || { x0: bx.min.x, x1: bx.max.x, y0: g, y1: bx.max.y, z0: -0.2, z1: 0 };
      var W = boxes(member, function (bb, w, h) { return h > 0.4 && w > 0.3 && bb.max.z >= Wa.z1 - 0.012 && bb.max.z < 0.4 && bb.min.y > -0.1; }) || Wa; /* the front layer only: cladding, panels, blocks — the backing wall stays behind the facade */
      E.face = Wa.z1; E.top = Wa.y1;
      /* the pavement in front of the wall: wide, thin, in front of the face, its top at the member's ground or a little above it (the PROTECT ONE walls show
         their footing, so their ground lies 12 cm under the pavement) — the place stands on the pavement's top, never on the member's ground */
      E.slab = boxes(member, function (bb, w, h, d) { return w > 1.5 && d > 0.3 && h < 0.3 && bb.min.z > -0.1 && bb.max.y > g - 0.05 && bb.max.y <= g + 0.2; });
      if (E.slab) { E.slab = { x0: E.slab.x0, x1: E.slab.x1, z0: E.slab.z0, z1: E.slab.z1, y1: E.slab.y1 }; if (E.slab.y1 > g + 0.005) { g = E.slab.y1; E.ground = g; } }
      E.hole = { x0: W.x0 + 0.004, x1: W.x1 - 0.004, y0: -0.2, y1: W.y1 - g - 0.004 };
      if (member.P && member.P.extend && member.parts && member.parts.ctx) E.extend = function (grp) { return member.P.extend(member.parts.ctx, grp, P.kind === 'facade' ? 4 : 6); }; /* the sample's own wall or cladding, continued: bays each way (and rows above, for a facade) */
    } else if (P.kind === 'balcony') {
      E.wall = boxes(member, function (bb, w, h) { return h > 0.5 && w > 0.2 && bb.max.z <= 0.02 && bb.min.z > -0.4; }) || { x0: -1.05, x1: 1.05, y0: 0, y1: 1.1, z0: -0.25, z1: 0 };
      E.side = boxes(member, function (bb, w, h, d) { return h > 0.5 && d > 0.8 && w < 0.4 && bb.min.x > 0; }); E.deck = { x0: bx.min.x, x1: E.side ? E.side.x0 : bx.max.x, z0: E.wall.z1, z1: bx.max.z };
      E.wallMat = faceMaterial(member, E.wall, 4, null); E.sideMat = E.side ? faceMaterial(member, E.side, 1, null) : null; /* the walls above in the sample's own render */
      var gl = boxes(member, function (bb, w, h, d) { return h > 0.5 && w > 0.5 && d < 0.02 && bb.max.z > -0.1 && bb.max.z < 0 && bb.max.y > 1; }); if (gl) E.door = { x0: gl.x0, x1: gl.x1, z: gl.z1 };
    } else if (P.kind === 'roof') {
      E.slab = boxes(member, function (bb, w, h, d) { return w > 1.2 && d > 0.6 && bb.max.y < g + 0.4 && bb.max.y > g - 0.05 && h < 0.3; });
      if (E.slab) E.slab = { x0: E.slab.x0, x1: E.slab.x1, z0: E.slab.z0, z1: E.slab.z1, y1: Math.min(E.slab.y1, 0.02) };
      var back = boxes(member, function (bb, w, h) { return h > 0.3 && w > 1.5 && bb.max.z <= 0.02 && bb.min.z > -0.4; }), side = boxes(member, function (bb, w, h, d) { return h > 0.3 && d > 0.8 && w < 0.4 && bb.min.x > 0; });
      E.par = back && side ? { back: back, side: side } : null; E.deck = { x0: bx.min.x, x1: side ? side.x0 : bx.max.x, z0: back ? back.z1 : 0, z1: bx.max.z }; E.parMat = back ? faceMaterial(member, back, 4, null) : null;
    } else { E.wall = boxes(member, function (bb, w, h) { return h > 0.5 && w > 1 && bb.max.z <= 0.02 && bb.min.z > -0.4; }); E.wallMat = E.wall ? faceMaterial(member, E.wall, 4, null) : null;
      E.ret = boxes(member, function (bb, w, h, d) { return h > 0.5 && d > 0.8 && w < 0.3 && bb.min.x < 0 && bb.min.z > -0.05; }); E.retMat = E.ret ? faceMaterial(member, E.ret, 0, null) : null; /* the sample's return wall on the left, and its room-side face */
      E.slab = boxes(member, function (bb, w, h, d) { return w > 1.2 && d > 0.6 && bb.max.y < g + 0.4 && bb.max.y > g - 0.05 && h < 0.3; });
      if (E.slab) E.slab = { x0: E.slab.x0, x1: E.slab.x1, z0: E.slab.z0, z1: E.slab.z1, y1: Math.min(E.slab.y1, 0.02) }; /* the finished floor level, whatever the sample cuts away below it */ }
    if (E.slab) E.slabMat = topMaterial(member, E.slab, null);
    if (P.kind === 'facade') facade(sc, E); else if (P.kind === 'garden') garden(sc, E); else if (P.kind === 'road') road(sc, E); else if (P.kind === 'channel') channel(sc, E); else if (P.kind === 'balcony') balcony(sc, E); else if (P.kind === 'roof') roof(sc, E); else room(sc, E);
    scene.traverse(function (ob) { if (ob.isHemisphereLight && ob.parent === scene) ob.intensity = Math.min(ob.intensity, outdoor ? 0.38 : 0.45); });
    r.toneMappingExposure = outdoor ? 0.72 : 0.8;
    if (!outdoor) sc.add(new THREE.HemisphereLight(0xd8dde3, 0x3a3a3a, 0.35));
    P.E = E; P.group = sc; sc.userData.E = E; return P;
  }
  function remove(view, group) { /* the place taken away: meshes, geometries and materials of the group freed */
    if (!group) return; view.dbg.scene.remove(group); group.traverse(function (ob) { if (ob.geometry) ob.geometry.dispose(); if (ob.material && !ob.userData.shared) [].concat(ob.material).forEach(function (m) { if (m.map) m.map.dispose(); if (m.bumpMap && m.bumpMap !== m.map) m.bumpMap.dispose(); m.dispose(); }); }); } /* the continued wall borrows the sample's materials (shared): those are the member's to dispose */
  return { build: build, remove: remove, placeOf: placeOf, tex: tex };
})();


