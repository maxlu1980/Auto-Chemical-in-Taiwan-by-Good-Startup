/* ===== [engine_crprepkit.js] CRPrepKit: tools, clouds, masks, rawAlpha ===== */
/* ===== Concrete Restoration: the work in 3D — tools and effects =====
   For the member (cr-3d.js). Preparation: a disc cutter that cuts the edges square, a high-pressure water lance (breaking out, cleaning,
   pre-wetting), an abrasive blast nozzle (de-rusting to SA 2.5, roughening the skin), with spray, mist, dust, flying debris.
   Application, as the technical data sheets describe it: round brush (corrosion protection), hard block brush (bond coat, crystalline
   slurry), steel trowel and straight edge (repair mortar), finishing trowel and felt/sponge board (fine smoothing), wet-spray nozzle
   (machine application), hose with mist nozzle and a roll of film (curing). A progressive mask removes or changes a surface behind a
   tool. Everything is a function of the stage time, so the picture is the same forwards, backwards and in a still. Dimensions in metres. */
var CRPrepKit = (function () {
  var SOFT = null, GRAIN = null;
  function soft() { if (!SOFT) { var c = mkCanvas(64, 64), q = c.getContext('2d'), g = q.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = g; q.fillRect(0, 0, 64, 64); SOFT = c; } return SOFT; }
  function grain() { if (!GRAIN) { var c = mkCanvas(32, 32), q = c.getContext('2d'); q.fillStyle = '#fff'; q.beginPath(); q.moveTo(16, 3); q.lineTo(28, 12); q.lineTo(24, 28); q.lineTo(8, 27); q.lineTo(4, 12); q.closePath(); q.fill(); GRAIN = c; } return GRAIN; }
  function hash(i, k, s) { var q = Math.imul(i + 1, 374761393) + Math.imul(k + 7, 668265263) + Math.imul(s + 3, 1442695041) | 0; q = Math.imul(q ^ (q >>> 13), 1274126177); q ^= q >>> 16; return (q >>> 0) / 4294967296; }
  function ease(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  var G = 9.81, FAR = -99;

  function Kit(keep, parent) {
    var self = this;
    function mat(o) { return keep(new THREE.MeshStandardMaterial(o)); }
    var steelM = mat({ color: 0xb4b9be, metalness: mt(0.85), roughness: 0.32, envMapIntensity: 1 }), darkM = mat({ color: 0x2b2d30, roughness: 0.55, metalness: mt(0.15) }), rubberM = mat({ color: 0x141414, roughness: 0.92 }),
      aluM = mat({ color: 0x9da2a6, metalness: mt(0.7), roughness: 0.4 }), carbideM = mat({ color: 0x3a3d40, metalness: mt(0.5), roughness: 0.45 }), gripM = mat({ color: 0xc4501e, roughness: 0.7 }), discM = mat({ color: 0x5b5e62, metalness: mt(0.6), roughness: 0.4 }), rimM = mat({ color: 0x8d8f93, metalness: mt(0.5), roughness: 0.35 }),
      jetM = keep(new THREE.MeshBasicMaterial({ color: 0xeaf5fc, transparent: true, opacity: 0.5, depthWrite: false })), coreM = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false })), fanM = keep(new THREE.MeshBasicMaterial({ color: 0xe6f2fa, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
    self.mats = { steel: steelM, dark: darkM, rubber: rubberM };
    function add(g, geo, m, pos, rot) { var me = new THREE.Mesh(keep(geo), m); if (pos) me.position.set(pos[0], pos[1], pos[2]); if (rot) me.rotation.set(rot[0], rot[1], rot[2]); me.castShadow = true; g.add(me); return me; }
    function alongZ(geo, z0, z1) { geo.rotateX(Math.PI / 2); geo.translate(0, 0, (z0 + z1) / 2); return geo; } // a cylinder made along y, laid along z from z0 to z1 (its "top" radius at z1)
    function tube(pts, r, m, g) { var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); })); return add(g, new THREE.TubeGeometry(c, 24, r, 14, false), m); }

    /* the high-pressure lance: tip at the origin, the lance along -z towards the operator; the jet along +z to the surface */
    this.lance = function () {
      var g = new THREE.Group(); g.userData.standoff = { jet: 0.3, fan: 0.42 };
      add(g, alongZ(new THREE.CylinderGeometry(0.0135, 0.011, 0.075, 16), -0.075, 0), darkM);
      add(g, alongZ(new THREE.CylinderGeometry(0.0085, 0.0085, 0.66, 18), -0.735, -0.075), steelM);
      add(g, new THREE.BoxGeometry(0.03, 0.12, 0.042), gripM, [0, -0.075, -0.66]); add(g, new THREE.BoxGeometry(0.008, 0.04, 0.02), darkM, [0, -0.04, -0.63]);
      add(g, alongZ(new THREE.CylinderGeometry(0.0085, 0.0085, 0.16, 18), -0.9, -0.735), steelM); add(g, new THREE.BoxGeometry(0.05, 0.05, 0.05), darkM, [0, 0, -0.915]);
      tube([[0, -0.01, -0.93], [0.06, -0.14, -1.13], [0.26, -0.48, -1.32], [0.56, -1.0, -1.45]], 0.013, rubberM, g);
      var J = g.userData.standoff.jet, F = g.userData.standoff.fan;
      g.userData.jet = new THREE.Group(); g.add(g.userData.jet);
      g.userData.jet.add(new THREE.Mesh(keep(alongZ(new THREE.CylinderGeometry(0.02, 0.0035, J, 14, 1, true), 0, J)), jetM)); g.userData.jet.add(new THREE.Mesh(keep(alongZ(new THREE.CylinderGeometry(0.007, 0.0018, J, 16, 1, true), 0, J)), coreM));
      g.userData.fan = new THREE.Mesh(keep(alongZ(new THREE.CylinderGeometry(0.11, 0.004, F, 18, 1, true), 0, F)), fanM); g.add(g.userData.fan);
      g.userData.mode = function (m) { g.userData.jet.visible = m === 'jet'; g.userData.fan.visible = m === 'fan'; }; if (typeof WaterJet !== 'undefined') { g.userData.water = WaterJet.make(g, keep, parent); var mode0 = g.userData.mode; g.userData.mode = function (m) { mode0(m === 'jet' ? 'off' : m); g.userData.water.setMode(m); }; }
      g.visible = false; parent.add(g); return g;
    };
    /* the abrasive blast nozzle: a venturi nozzle with its coupling and the blast hose */
    this.blaster = function () {
      var g = new THREE.Group(); g.userData.standoff = { blast: 0.28 };
      add(g, alongZ(new THREE.CylinderGeometry(0.0115, 0.0175, 0.16, 16), -0.16, 0), carbideM);
      add(g, alongZ(new THREE.CylinderGeometry(0.026, 0.026, 0.07, 16), -0.235, -0.165), aluM); add(g, alongZ(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16), -0.25, -0.238), darkM);
      tube([[0, 0, -0.25], [0.02, -0.06, -0.5], [0.16, -0.32, -0.82], [0.45, -0.85, -1.15], [0.8, -1.4, -1.35]], 0.019, rubberM, g);
      var n = SMALL3D ? 90 : 160, pos = new Float32Array(n * 3), i; for (i = 0; i < n; i++) pos[i * 3 + 1] = FAR;
      var geo = keep(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var pts = new THREE.Points(geo, keep(new THREE.PointsMaterial({ size: 0.007, map: keep(canvasTex(grain(), { srgb: false })), color: 0xc9bc9c, transparent: true, opacity: 0.9, depthWrite: false, alphaTest: 0.3 }))); g.add(pts); pts.frustumCulled = false;
      g.userData.stream = function (S, on) { var D = g.userData.standoff.blast, k; for (k = 0; k < n; k++) { if (!on) { pos[k * 3 + 1] = FAR; continue; } var s = (S * 9 + hash(k, 0, 1)) % 1, sp = 0.004 + 0.02 * s, a = hash(k, 0, 2) * 6.283, r = sp * Math.sqrt(hash(k, 0, 3)); pos[k * 3] = Math.cos(a) * r; pos[k * 3 + 1] = Math.sin(a) * r; pos[k * 3 + 2] = s * D; } geo.attributes.position.needsUpdate = true; };
      g.visible = false; parent.add(g); return g;
    };
    /* the disc cutter: the disc turns about local x, lies in the local y–z plane; local +y is the surface normal, local +z the direction of the cut */
    this.cutter = function () {
      var g = new THREE.Group(), R = 0.095; g.userData.R = R;
      var disc = add(g, new THREE.CylinderGeometry(R, R, 0.0035, 48), discM, null, [0, 0, Math.PI / 2]); add(g, new THREE.CylinderGeometry(R + 0.001, R + 0.001, 0.0045, 48, 1, true), rimM, null, [0, 0, Math.PI / 2]); g.userData.disc = disc;
      add(g, new THREE.CylinderGeometry(0.02, 0.02, 0.014, 20), aluM, [0.008, 0, 0], [0, 0, Math.PI / 2]); // the flange
      var guard = new THREE.CylinderGeometry(R + 0.014, R + 0.014, 0.034, 36, 1, true, -Math.PI / 2, Math.PI); guard.rotateZ(Math.PI / 2); guard.rotateX(-Math.PI / 2); add(g, guard, darkM, [0.012, 0, 0]);
      var lid = new THREE.RingGeometry(R - 0.02, R + 0.016, 36, 1, 0, Math.PI); lid.rotateY(Math.PI / 2); add(g, lid, darkM, [0.03, 0, 0]);
      add(g, new THREE.BoxGeometry(0.075, 0.065, 0.08), darkM, [0.055, 0.045, 0.005]);
      var body = new THREE.Group(); body.position.set(0.065, 0.065, -0.01); body.lookAt(0.065 + 0.12, 0.065 + 0.62, -0.01 - 0.77); g.add(body);
      add(body, alongZ(new THREE.CylinderGeometry(0.036, 0.032, 0.26, 20), 0, 0.26), darkM); add(body, alongZ(new THREE.CylinderGeometry(0.027, 0.036, 0.035, 20), 0.26, 0.295), gripM); add(body, alongZ(new THREE.CylinderGeometry(0.029, 0.027, 0.08, 20), 0.295, 0.375), darkM);
      add(g, new THREE.CylinderGeometry(0.013, 0.013, 0.15, 18), gripM, [-0.03, 0.1, 0.05], [0, 0, Math.PI / 2]); // the side handle
      tube([[0.065, 0.065, -0.01], [0.08, 0.36, -0.38], [0.18, 0.66, -0.8], [0.4, 0.95, -1.15]], 0.006, rubberM, g);
      g.visible = false; parent.add(g); return g;
    };

    /* particles: stateless, every one is a function of the stage time. src(t) gives the source point at time t, or null when nothing is emitted */
    function Cloud(n, o) {
      var pos = new Float32Array(n * 3), geo = keep(new THREE.BufferGeometry()), i; for (i = 0; i < n; i++) pos[i * 3 + 1] = FAR;
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var pm = keep(new THREE.PointsMaterial({ size: o.size, map: keep(canvasTex(o.grain ? grain() : soft(), { srgb: false })), color: o.color, transparent: true, opacity: o.opacity, depthWrite: false, sizeAttenuation: true, alphaTest: o.grain ? 0.3 : 0.02 }));
      var pts = new THREE.Points(geo, pm); pts.frustumCulled = false; pts.renderOrder = 5; parent.add(pts);
      this.points = pts;
      this.update = function (S, src, ground) {
        var k, on = false;
        for (k = 0; k < n; k++) {
          var h0 = hash(k, 0, 11), life = o.life * (0.55 + 0.9 * h0), phase = hash(k, 0, 12) * life, m = Math.floor((S + phase) / life), born = m * life - phase, age = S - born, p = age >= 0 ? src(born) : null;
          if (!p) { pos[k * 3 + 1] = FAR; continue; }
          var a = hash(k, m, 13) * 6.283, up = hash(k, m, 14), out = hash(k, m, 15), sp = o.speed * (0.4 + 1.2 * hash(k, m, 16)), vx = Math.cos(a) * o.spread * sp, vz = Math.abs(Math.sin(a)) * o.spread * sp * 0.6 + (o.out * (0.3 + out)) * sp, vy = (o.up + (up - 0.5) * o.spread) * sp;
          var x = p[0] + vx * age + (o.wind || 0) * age, y = p[1] + vy * age - (o.g == null ? 0.5 * G : o.g) * age * age, z = p[2] + vz * age;
          if (ground != null && y < ground + 0.003) { if (o.pool) y = ground + 0.003; else { pos[k * 3 + 1] = FAR; continue; } }
          pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z; on = true;
        }
        geo.attributes.position.needsUpdate = true; pts.visible = on;
      };
    }
    this.cloud = function (n, o) { return new Cloud(n, o); };
    /* flying chunks of concrete */
    this.debris = function (n) {
      var geo = keep(new THREE.DodecahedronGeometry(1, 0)), m = mat({ color: 0x9c988f, roughness: 0.96 }), im = new THREE.InstancedMesh(geo, m, n), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sc = new THREE.Vector3(), i;
      im.castShadow = true; im.frustumCulled = false; parent.add(im); for (i = 0; i < n; i++) { M4.makeScale(0, 0, 0); im.setMatrixAt(i, M4); }
      im.update = function (S, src, ground) {
        var k, on = false;
        for (k = 0; k < n; k++) {
          var life = 0.9 * (0.6 + 0.8 * hash(k, 0, 21)), phase = hash(k, 0, 22) * life, m2 = Math.floor((S + phase) / life), born = m2 * life - phase, age = S - born, p = age >= 0 ? src(born) : null;
          if (!p) { M4.makeScale(0, 0, 0); im.setMatrixAt(k, M4); continue; }
          var a = hash(k, m2, 23) * 6.283, sp = 0.5 + 1.3 * hash(k, m2, 24), vx = Math.cos(a) * 0.7 * sp, vz = (0.4 + 0.7 * hash(k, m2, 25)) * sp, vy = (-0.1 + 0.7 * hash(k, m2, 26)) * sp;
          var x = p[0] + vx * age, y = p[1] + vy * age - 0.5 * G * age * age, z = p[2] + vz * age, s = 0.003 + 0.009 * hash(k, m2, 27) * hash(k, m2, 28);
          if (y < ground + s) { M4.makeScale(0, 0, 0); im.setMatrixAt(k, M4); continue; }
          Q.setFromEuler(new THREE.Euler(age * 9 * (hash(k, m2, 29) - 0.5) * 2, age * 7 * hash(k, m2, 30), hash(k, m2, 31) * 6)); V.set(x, y, z); Sc.set(s, s * (0.35 + 0.5 * hash(k, m2, 32)), s * (0.7 + 0.5 * hash(k, m2, 33))); M4.compose(V, Q, Sc); im.setMatrixAt(k, M4); on = true;
        }
        im.instanceMatrix.needsUpdate = true; im.visible = on;
      };
      keep(im); return im;
    };
    /* a puddle spreading on the ground under the work */
    this.puddle = function (z) {
      var me = new THREE.Mesh(keep(new THREE.CircleGeometry(1, 40)), keep(new THREE.MeshStandardMaterial({ color: 0x3f5c6b, transparent: true, opacity: 0.26, roughness: 0.03, metalness: 0, envMapIntensity: 1.4, depthWrite: false })));
      me.rotation.x = -Math.PI / 2; me.position.set(0, 0.0035, z); me.renderOrder = 2; me.receiveShadow = true; me.visible = false; parent.add(me);
      me.set = function (x, r) { me.visible = r > 0.001; me.position.x = x; me.scale.set(r * 1.5, r, 1); };
      return me;
    };

    /* the wet look on a surface: a film that darkens what lies under it (multiply) and a thin gloss on top, both cut to the same mask */
    this.wetFilm = function (geo, z) {
      var dark = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, alphaTest: 0.5 })), gloss = keep(new THREE.MeshStandardMaterial({ color: 0xdfe8ee, transparent: true, opacity: 0, roughness: 0.12, metalness: 0, envMapIntensity: 1.4, depthWrite: false, alphaTest: 0.5 }));
      var g2 = new THREE.Group(), a = new THREE.Mesh(geo, dark), b2 = new THREE.Mesh(geo, gloss); a.position.z = z; b2.position.z = z + 0.0003; a.renderOrder = 3; b2.renderOrder = 4; g2.add(a, b2); g2.visible = false; parent.add(g2);
      var C0 = new THREE.Color(0xffffff), C1 = new THREE.Color(0x87909a);
      g2.set = function (mask, strength) { g2.visible = !!mask && strength > 0.01; if (!g2.visible) return; if (dark.alphaMap !== mask.tex) { dark.alphaMap = mask.tex; gloss.alphaMap = mask.tex; } dark.color.copy(C0).lerp(C1, strength); gloss.opacity = 0.16 * strength; };
      return g2;
    };
    /* a progressive mask: alpha 255 where the texel's order lies below the progress (treated) — or the other way round (invert) */
    this.mask = function (w, h, orderFn, invert) {
      var c = mkCanvas(w, h), q = c.getContext('2d'), img = q.createImageData(w, h), d = img.data, order = new Float32Array(w * h), i, x, y, last = -1, tex = keep(canvasTex(c, { srgb: false }));
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) { i = y * w + x; order[i] = orderFn((x + 0.5) / w, 1 - (y + 0.5) / h); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = 255; }
      var o = { tex: tex, update: function (u) { u = u < 0 ? 0 : u > 1 ? 1 : u; if (Math.abs(u - last) < 0.0015 && !(u === 0 && last !== 0) && !(u === 1 && last !== 1)) return; last = u; var k; for (k = 0; k < w * h; k++) { var on = order[k] < u; if (invert) on = !on; d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = on ? 255 : 0; } q.putImageData(img, 0, 0); tex.needsUpdate = true; } };
      o.update(0); return o;
    };
    /* a raster: rows from the top down, every row worked alternately to the right and to the left, as a nozzle is moved */
    this.raster = function (x0, x1, y0, y1, rowH, noise, up) {
      var W = x1 - x0, n = Math.max(1, Math.round((y1 - y0) / rowH)), rh = (y1 - y0) / n;
      function dirOf(r) { return r % 2 === 0; }
      function flip(y) { return up ? y0 + y1 - y : y; } // `up`: the rows are worked from the bottom
      return { n: n, rowH: rh, up: !!up,
        at: function (u) { u = u < 0 ? 0 : u > 0.99999 ? 0.99999 : u; var r = Math.floor(u * n), f = u * n - r, ff = f > 0.92 ? (f - 0.92) / 0.08 : 0, x = dirOf(r) ? x0 + f * W : x1 - f * W, y = y1 - (r + 0.5) * rh - ease(ff) * rh; return { x: x, y: flip(Math.max(y0 + rh * 0.5 - 0.0001, y)), row: r, frac: f, dir: dirOf(r) }; },
        yFront: function (u) { return flip(y1 - (u < 0 ? 0 : u > 1 ? 1 : u) * (y1 - y0)); },
        order: function (x, y) { y = flip(y); var r = Math.min(n - 1, Math.max(0, Math.floor((y1 - y) / rh))), f = dirOf(r) ? (x - x0) / W : (x1 - x) / W; f = f < 0 ? 0 : f > 1 ? 1 : f; var o = (r + f) / n + (noise ? (noise(x * 60, y * 60) - 0.5) * 0.09 + (noise(x * 190 + 5, y * 190) - 0.5) * 0.03 : 0); return o < 0 ? 0 : o > 0.9995 ? 0.9995 : o; } }; // kept inside [0, 1): a mask at u = 1 is complete, at u = 0 empty
    };
    /* a polyline of legs [x0, y0, z0, x1, y1, z1]: its length and the point at a given length along it */
    this.path = function (legs) {
      var total = 0, L = legs.map(function (l) { var len = Math.hypot(l[3] - l[0], l[4] - l[1], l[5] - l[2]), e = { l: l, len: len, start: total }; total += len; return e; });
      return { total: total, n: L.length, at: function (s) { var k; s = Math.max(0, Math.min(total, s)); for (k = 0; k < L.length; k++) { var e = L[k]; if (s <= e.start + e.len + 1e-9 || k === L.length - 1) { var f = e.len ? Math.max(0, Math.min(1, (s - e.start) / e.len)) : 0; return { x: e.l[0] + (e.l[3] - e.l[0]) * f, y: e.l[1] + (e.l[4] - e.l[1]) * f, z: e.l[2] + (e.l[5] - e.l[2]) * f, leg: k, f: f }; } } return null; } };
    };
    /* the kerf of the disc cutter: a dark line that grows along a path made of straight legs */
    this.kerf = function (legs, clipPlane) {
      var m = keep(new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 1, clippingPlanes: clipPlane ? [clipPlane] : null })), g = new THREE.Group(), boxes = [], total = 0, i;
      for (i = 0; i < legs.length; i++) { var L = legs[i], len = Math.hypot(L[2] - L[0], L[3] - L[1]); total += len; var b = new THREE.Mesh(keep(new THREE.BoxGeometry(1, 1, 1)), m); b.userData = { L: L, len: len, start: total - len }; b.castShadow = false; g.add(b); boxes.push(b); }
      g.userData.total = total; g.visible = false; parent.add(g);
      g.userData.set = function (s) { // s: length cut so far
        boxes.forEach(function (b) { var L = b.userData.L, l = Math.max(0, Math.min(b.userData.len, s - b.userData.start)); if (l <= 0.0005) { b.visible = false; return; } b.visible = true; var dx = (L[2] - L[0]) / b.userData.len, dy = (L[3] - L[1]) / b.userData.len; b.position.set(L[0] + dx * l / 2, L[1] + dy * l / 2, 0.0006); b.scale.set(Math.abs(dx) > 0.5 ? l : 0.0045, Math.abs(dy) > 0.5 ? l : 0.0045, 0.0014); });
      };
      g.userData.pointAt = function (s) { var k; for (k = 0; k < boxes.length; k++) { var b = boxes[k]; if (s <= b.userData.start + b.userData.len || k === boxes.length - 1) { var L = b.userData.L, f = Math.max(0, Math.min(1, (s - b.userData.start) / b.userData.len)); return { x: L[0] + (L[2] - L[0]) * f, y: L[1] + (L[3] - L[1]) * f, tx: (L[2] - L[0]) / b.userData.len, ty: (L[3] - L[1]) / b.userData.len }; } } return null; };
      return g;
    };
    /* ----- the tools of the application ----- */
    var bristleM = mat({ color: 0x3f3b37, roughness: 1 }), woodM = mat({ color: 0xa8865a, roughness: 0.75 }), foamM = mat({ color: 0xd9d2b4, roughness: 1 }), handleM = mat({ color: 0x2f3134, roughness: 0.6 }), wetSlurryM = mat({ color: 0x6f7377, roughness: 0.6, envMapIntensity: 0.6 });
    /* pressed tools: the contact at the origin, local +z into the surface, the body along -z towards the operator */
    this.brush = function () { // a round brush for the corrosion protection
      var g = new THREE.Group(); add(g, alongZ(new THREE.CylinderGeometry(0.02, 0.016, 0.05, 16), -0.05, 0), bristleM); add(g, alongZ(new THREE.CylinderGeometry(0.021, 0.021, 0.03, 16), -0.08, -0.05), aluM); add(g, alongZ(new THREE.CylinderGeometry(0.012, 0.015, 0.17, 18), -0.25, -0.08), woodM);
      var paint = add(g, new THREE.SphereGeometry(0.022, 14, 14), wetSlurryM, [0, 0, -0.006]); paint.scale.set(1, 1, 0.45); g.visible = false; parent.add(g); return g;
    };
    this.broom = function () { // the hard block brush for the bond coat and the crystalline slurry
      var g = new THREE.Group(); add(g, new THREE.BoxGeometry(0.17, 0.055, 0.06), bristleM, [0, 0, -0.03]); add(g, new THREE.BoxGeometry(0.18, 0.065, 0.03), woodM, [0, 0, -0.075]);
      add(g, new THREE.BoxGeometry(0.15, 0.04, 0.008), wetSlurryM, [0, 0, -0.003]); tube([[0, 0.01, -0.09], [0.06, 0.12, -0.25], [0.16, 0.3, -0.42]], 0.013, woodM, g); g.userData.lip = 0.0275; g.visible = false; parent.add(g); return g;
    };
    this.trowel = function (w, h) { // a steel trowel, the blade against the surface, the handle above it along the long side
      var g = new THREE.Group(); w = w || 0.28; h = h || 0.115; add(g, new THREE.BoxGeometry(w, h, 0.0015), steelM, [0, 0, -0.00075]); add(g, new THREE.BoxGeometry(0.02, 0.05, 0.03), aluM, [0, 0, -0.016]); add(g, new THREE.BoxGeometry(Math.min(0.11, w * 0.4), 0.012, 0.012), aluM, [0, 0, -0.033]);
      add(g, new THREE.CylinderGeometry(0.014, 0.016, Math.min(0.12, w * 0.45), 14), woodM, [0, 0, -0.05], [0, 0, Math.PI / 2]); g.userData.w = w; g.userData.h = h; g.visible = false; parent.add(g); return g;
    };
    this.rule = function (len) { var g = new THREE.Group(); add(g, new THREE.BoxGeometry(len, 0.025, 0.1), aluM, [0, 0, -0.05]); g.visible = false; parent.add(g); return g; }; // the straight edge
    this.sponge = function () { // the sponge (felt) board
      var g = new THREE.Group(); add(g, new THREE.BoxGeometry(0.27, 0.135, 0.03), foamM, [0, 0, -0.015]); add(g, new THREE.BoxGeometry(0.28, 0.145, 0.008), handleM, [0, 0, -0.034]);
      add(g, new THREE.BoxGeometry(0.02, 0.03, 0.03), handleM, [-0.06, 0, -0.053]); add(g, new THREE.BoxGeometry(0.02, 0.03, 0.03), handleM, [0.06, 0, -0.053]); add(g, new THREE.CylinderGeometry(0.013, 0.013, 0.14, 18), woodM, [0, 0, -0.07], [0, 0, Math.PI / 2]); g.userData.lip = 0.0675; g.visible = false; parent.add(g); return g;
    };
    this.roll = function (len) { // a roll of curing film
      var g = new THREE.Group(), m = keep(new THREE.MeshStandardMaterial({ color: 0xe6eef4, transparent: true, opacity: 0.6, roughness: 0.15, envMapIntensity: 1.2 })); add(g, new THREE.CylinderGeometry(0.035, 0.035, len, 20), m, null, [0, 0, Math.PI / 2]); add(g, new THREE.CylinderGeometry(0.011, 0.011, len + 0.08, 16), darkM, null, [0, 0, Math.PI / 2]); g.visible = false; parent.add(g); return g;
    };
    /* aimed tools: tip at the origin, body along -z (like the lance) */
    this.sprayGun = function () { // the wet-spray nozzle for the mortar (machine application), mortar hose and air hose behind
      var g = new THREE.Group(); g.userData.standoff = { spray: 0.42 };
      add(g, alongZ(new THREE.CylinderGeometry(0.021, 0.03, 0.12, 18), -0.12, 0), rubberM); add(g, alongZ(new THREE.CylinderGeometry(0.034, 0.034, 0.16, 18), -0.28, -0.12), aluM); add(g, alongZ(new THREE.CylinderGeometry(0.037, 0.037, 0.02, 18), -0.3, -0.28), darkM);
      tube([[0, 0, -0.3], [0.03, -0.1, -0.6], [0.2, -0.45, -0.95], [0.5, -0.95, -1.2]], 0.028, rubberM, g); tube([[0.03, 0.025, -0.28], [0.09, -0.02, -0.55], [0.28, -0.3, -0.9]], 0.008, rubberM, g);
      var n = SMALL3D ? 130 : 240, pos = new Float32Array(n * 3), i; for (i = 0; i < n; i++) pos[i * 3 + 1] = FAR;
      var geo = keep(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var pts = new THREE.Points(geo, keep(new THREE.PointsMaterial({ size: 0.012, map: keep(canvasTex(grain(), { srgb: false })), color: 0xa9a8a1, transparent: true, opacity: 0.95, depthWrite: false, alphaTest: 0.3 }))); g.add(pts); pts.frustumCulled = false;
      g.userData.stream = function (S, on) { var D = g.userData.standoff.spray, k; for (k = 0; k < n; k++) { if (!on) { pos[k * 3 + 1] = FAR; continue; } var s2 = (S * 5 + hash(k, 0, 41)) % 1, sp = 0.012 + 0.07 * s2, a = hash(k, 0, 42) * 6.283, r = sp * Math.sqrt(hash(k, 0, 43)); pos[k * 3] = Math.cos(a) * r; pos[k * 3 + 1] = Math.sin(a) * r; pos[k * 3 + 2] = s2 * D; } geo.attributes.position.needsUpdate = true; };
      g.visible = false; parent.add(g); return g;
    };
    this.hose = function () { // a hose with a spray nozzle: pre-wetting, curing mist
      var g = new THREE.Group(); g.userData.standoff = { fan: 0.4 };
      add(g, alongZ(new THREE.CylinderGeometry(0.012, 0.009, 0.06, 14), -0.06, 0), aluM); add(g, alongZ(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 14), -0.11, -0.06), darkM);
      tube([[0, 0, -0.11], [0.02, -0.1, -0.4], [0.15, -0.5, -0.8], [0.4, -1.0, -1.1]], 0.011, rubberM, g);
      g.userData.fan = new THREE.Mesh(keep(alongZ(new THREE.CylinderGeometry(0.13, 0.004, 0.4, 18, 1, true), 0, 0.4)), fanM); g.add(g.userData.fan);
      g.userData.mode = function (m) { g.userData.fan.visible = m === 'fan'; }; g.visible = false; parent.add(g); return g;
    };
    /* placing a pressed tool at (x, y, z) on a surface facing +z: tilt about the long side, yaw in the surface; `out` moves it away */
    this.press = function (tool, x, y, z, tilt, yaw, out) { tool.visible = out < 0.999; if (!tool.visible) return; var lip = tool.userData.lip != null ? tool.userData.lip : (tool.userData.h ? tool.userData.h / 2 : 0); if (tool.userData.w && yaw) lip = lip * Math.abs(Math.cos(yaw)) + tool.userData.w / 2 * Math.abs(Math.sin(yaw)); tool.position.set(x + out * 0.15, y + out * 0.3, z + lip * Math.sin(Math.abs(tilt)) + out * 0.6); tool.rotation.set(Math.PI + tilt, 0, yaw); };
    /* placing a tool: tip at `standoff` from the impact point along `dir`, pointing at it; `out` (0…1) moves it away, for entering and leaving */
    var TMP = new THREE.Vector3();
    this.aim = function (tool, impact, dir, standoff, out) {
      tool.visible = out < 0.999; if (!tool.visible) return;
      tool.position.set(impact[0] + dir.x * (standoff + out * 0.7), impact[1] + dir.y * (standoff + out * 0.7) + out * 0.35, impact[2] + dir.z * (standoff + out * 0.7));
      TMP.set(impact[0], impact[1], impact[2]); if (tool.parent && tool.parent !== parent) tool.parent.localToWorld(TMP); tool.lookAt(TMP); // a tool in a frame of its own (a second worked wall) aims in that frame
    };
    /* placing the cutter on a path point with tangent (tx, ty) on the face z = 0, its disc dipping `depth` into the concrete */
    var BX = new THREE.Vector3(), BY = new THREE.Vector3(0, 0, 1), BZ = new THREE.Vector3(), M4 = new THREE.Matrix4();
    this.seat = function (cutter, pt, depth, out) {
      cutter.visible = out < 0.999; if (!cutter.visible) return;
      BZ.set(pt.tx, pt.ty, 0).normalize(); BX.crossVectors(BY, BZ).normalize(); M4.makeBasis(BX, BY, BZ); cutter.setRotationFromMatrix(M4);
      cutter.position.set(pt.x, pt.y, cutter.userData.R - depth + out * 0.9); cutter.position.y += out * 0.25;
    };
  }
  /* three r147 samples the alphaMap with the uv transform of the map (one shared uvTransform), so a progressive mask on a material whose map repeats is
     read at the map's repeat and clamped — the sweep shows only in one tile and the rest follows the mask's edge texels. This gives the alphaMap the plain
     uv of the geometry, whatever the map does. Apply it to every material that carries a mask (also to clones: the hook is not copied by clone()). */
  function rawAlpha(m) {
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader.replace('#include <uv_pars_vertex>', '#include <uv_pars_vertex>\nvarying vec2 vUvRaw;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvUvRaw = uv;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <alphamap_pars_fragment>', '#include <alphamap_pars_fragment>\nvarying vec2 vUvRaw;').replace('#include <alphamap_fragment>', '#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, vUvRaw ).g;\n#endif');
    };
    m.customProgramCacheKey = function () { return 'rawAlpha'; };
    m.needsUpdate = true; return m;
  }
  return { Kit: Kit, hash: hash, ease: ease, rawAlpha: rawAlpha };
})();

