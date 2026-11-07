/* ===== [engine_wp_member.js] WPMember: the building component with every stage of the build-up ===== */
function WPMember(scn, cut, M) {
  var P = WPM3D[scn], self = this, g = new THREE.Group(), trash = [], XC = P.XC, RWp = THREE.RepeatWrapping, SEG = window.FAST3D ? 0.35 : SMALL3D ? 0.6 : 1, ST = WP_STAGES[scn];
  this.group = g; this.scn = scn; this.cut = cut; this.cam = cut ? P.cam.cut : P.cam.full; this.ground = P.ground;
  this.stageCam = function (id) { var c = P.camS && P.camS[id]; return c ? (cut ? c.cut : c.full) : null; };
  var concMats = [], layerMats = [], stageNow = ST[0];
  function keep(o) { trash.push(o); return o; }
  function mat(o, list) { var m = keep(new THREE.MeshStandardMaterial(o)); if (list) list.push(m); return m; }
  var curParent = null; // a frame (a second worked wall in its own coordinates) collects what is built while it is current
  function into(parent, fn) { var prev = curParent; curParent = parent; try { return fn(); } finally { curParent = prev; } }
  function mesh(geo, m, o) { var me = new THREE.Mesh(keep(geo), m); me.castShadow = !(o && o.noCast); me.receiveShadow = !(o && o.noReceive); (o && o.parent || curParent || g).add(me); return me; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* materials of the component */
  var F = TEX.formed(), formed = mat({ map: keep(canvasTex(F.base, { wrap: RWp })), bumpMap: keep(canvasTex(WPTX.softBump(F.bump), { wrap: RWp, srgb: false })), bumpScale: 0.0016, roughness: 0.93, envMapIntensity: 0.35 }, concMats);
  var sawn = mat({ map: keep(canvasTex(TEX.aggregate(), { wrap: RWp })), roughness: 0.85, envMapIntensity: 0.4 }, concMats);
  var soilM = mat({ map: keep(canvasTex(CRTX.soil, { wrap: RWp, repeat: [1, 1] })), roughness: 1, envMapIntensity: 0.1 }, concMats), wetSoilM = mat({ map: keep(canvasTex(CRTX.soil, { wrap: RWp, repeat: [1, 1] })), color: 0xa9bcc6, roughness: 0.75, envMapIntensity: 0.3 }, concMats);
  var waterM = mat({ color: 0x1f8fc4, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0, envMapIntensity: 1.2, depthWrite: false });
  var slabTopM = mat({ map: keep(canvasTex(TEX.slab(), { wrap: RWp, repeat: [0.6, 0.6] })), roughness: 0.9, envMapIntensity: 0.4 }, concMats);
  var UVR = { formed: [2, 1.5], sawn: [0.5, 0.5], soil: [0.7, 0.7], slabTop: [1, 1], masonry: [1.0, 1.0], ws: [0.7, 0.7] };
  function faceUV(geo, cx, cy, cz, keys) { // texture coordinates from the position in the member, per face: 0 +x, 1 -x, 2 +y, 3 -y, 4 +z, 5 -z
    var p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv, i;
    for (i = 0; i < p.count; i++) {
      var x = p.getX(i) + cx, y = p.getY(i) + cy, z = p.getZ(i) + cz, f = Math.abs(n.getX(i)) > 0.5 ? (n.getX(i) > 0 ? 0 : 1) : Math.abs(n.getY(i)) > 0.5 ? (n.getY(i) > 0 ? 2 : 3) : (n.getZ(i) > 0 ? 4 : 5), k = keys[f], R = UVR[k] || [1, 1];
      if (k === 'box') uv.setXY(i, f < 2 ? (z - geo.userData.z0) / geo.userData.dz : (x - geo.userData.x0) / geo.userData.dx, f === 2 || f === 3 ? (z - geo.userData.z0) / geo.userData.dz : (y - geo.userData.y0) / geo.userData.dy);
      else { if (f < 2) uv.setXY(i, (z + 1) / R[0], (y + 0.5) / R[1]); else if (f < 4) uv.setXY(i, (x + 1) / R[0], (z + 1) / R[1]); else uv.setXY(i, (x + 1) / R[0], (y + 0.5) / R[1]); }
    }
    uv.needsUpdate = true; return geo;
  }
  var cutFaceM = mat({ map: keep(canvasTex(TEX.aggregate(), { wrap: RWp, repeat: [1, 1] })), roughness: 0.86, envMapIntensity: 0.4 }, concMats);
  /* a box of the member; keys: 6 material keys; in cut mode the box is clamped at XC and its new -x face gets the sawn aggregate */
  function block(x0, x1, y0, y1, z0, z1, keys, mats, cutKey) {
    if (cut) { if (x1 <= XC + 1e-6) return null; if (x0 < XC) { x0 = XC; keys = keys.slice(); keys[1] = cutKey || 'cutface'; } }
    var w = x1 - x0, h = y1 - y0, d = z1 - z0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2, geo = new THREE.BoxGeometry(w, h, d);
    geo.userData = { x0: x0, dx: w, y0: y0, dy: h, z0: z0, dz: d }; faceUV(geo, cx, cy, cz, keys);
    var ml = keys.map(function (k, fi) { if (k === 'cutface' && fi === 1 && (keys[0] === 'soil' || keys[0] === 'ws')) k = keys[0]; return (mats && mats[k]) || (k === 'cutface' ? cutFaceM : k === 'sawn' ? sawn : k === 'soil' ? soilM : k === 'ws' ? wetSoilM : k === 'slabTop' ? slabTopM : formed); });
    var me = mesh(geo, ml); me.position.set(cx, cy, cz); me.userData.keys = keys; return me;
  }
  var noise = (function () { var r = lcg(757), Pm = [], i; for (i = 0; i < 256; i++) Pm.push(r()); function h(a, b) { return Pm[((a * 73856093) ^ (b * 19349663)) & 255]; } return function (x, y) { var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d2 = h(xi + 1, yi + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d2) * fx * fy; }; })();
  this.noise = noise;
  var parts = {}, clip = {};
  function plane(name, nx, ny, nz, c) { var pl = new THREE.Plane(new THREE.Vector3(nx, ny, nz), c == null ? 10 : c); clip[name] = pl; return pl; }
  function layerMat(o, list) { o.transparent = true; if (o.polygonOffset == null) { o.polygonOffset = true; o.polygonOffsetFactor = -1; } var m = mat(o, layerMats); if (list) list.push(m); return m; }
  var wetLook = []; function wettable(m) { wetLook.push({ m: m, c: m.color.getHex(), r: m.roughness }); return m; }
  this.wetLook = wetLook;

  /* ===== a coat on the worked faces: a picture on each face cut to a progressive mask, and (cut mode) its thin edge at the sawn face =====
     patches: [{ kind: 'wall'|'floor', x0, x1, a0, a1, off }] — a wall patch spans y ∈ [a0, a1] at z = off; a floor patch spans z ∈ [a0, a1] at y = off.
     The sweep works the patches in order, each row by row (boustrophedon), so that a brush can follow it. */
  var KIT = typeof CRPrepKit !== 'undefined' ? new CRPrepKit.Kit(keep, g) : null, K2 = KIT ? new WPKit(KIT, keep, g) : null;
  function Coat(patches, m, thick, o) {
    o = o || {}; var self2 = this, segs = [], total = 0, meshes = [], edges = [];
    this.m = m; this.meshes = meshes; this.group = new THREE.Group(); (curParent || g).add(this.group);
    patches.forEach(function (pt) {
      var x0 = cut ? Math.max(pt.x0, XC) : pt.x0, x1 = pt.x1; if (x1 <= x0 + 1e-6) return;
      var w = x1 - x0, h = pt.a1 - pt.a0, r = KIT ? KIT.raster(x0, x1, pt.a0, pt.a1, o.rowH || 0.11, o.noNoise ? null : noise, pt.kind === 'floor') : null, weight = w * h;
      var geo = keep(new THREE.PlaneGeometry(w, h, 1, 1)), uv = geo.attributes.uv, k; for (k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) * w + (x0 - pt.x0)) / (pt.x1 - pt.x0), uv.getY(k)); uv.needsUpdate = true;
      var mask = KIT ? KIT.mask(o.maskW || 120, Math.max(8, Math.round((o.maskW || 120) * h / (pt.x1 - pt.x0))), function (uu, vv) { var x = pt.x0 + uu * (pt.x1 - pt.x0), a = pt.kind === 'wall' ? pt.a0 + vv * h : pt.a1 - vv * h; if (o.only && !o.only(x, a, pt.kind)) return 2; return x < x0 - 0.003 ? 0 : r.order(x, a); }, false) : null; // a floor plane is rotated about x: its v runs from the far edge (v = 0) to the wall (v = 1)
      var mm = keep(m.clone()); layerMats.push(mm); if (mask) { mm.alphaMap = mask.tex; mm.alphaTest = 0.1; CRPrepKit.rawAlpha(mm); } if (m.map) { mm.map = keep(m.map.clone()); mm.map.repeat.set((pt.x1 - pt.x0) / (o.rep || 0.25), h / (o.rep || 0.25)); mm.map.needsUpdate = true; }
      var me = new THREE.Mesh(geo, mm); me.receiveShadow = true; me.castShadow = false;
      if (pt.kind === 'wall') { me.position.set((x0 + x1) / 2, (pt.a0 + pt.a1) / 2, pt.off); } else { me.rotation.x = -Math.PI / 2; me.position.set((x0 + x1) / 2, pt.off, (pt.a0 + pt.a1) / 2); }
      self2.group.add(me); meshes.push(me);
      var seg = { pt: pt, r: r, w: weight, start: total, mask: mask, mm: mm, x0: x0 }; segs.push(seg); total += weight;
      if (cut && thick > 0 && Math.abs(pt.x0 - XC) < 0.2) { // the edge of the coat at the sawn face, cut to the row front
        var pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), 10), em = keep(m.clone()); em.clippingPlanes = [pl]; em.polygonOffset = false; em.transparent = true; layerMats.push(em);
        var eg = keep(new THREE.PlaneGeometry(thick, h)), ee = new THREE.Mesh(eg, em);
        if (pt.kind === 'wall') { ee.rotation.set(0, -Math.PI / 2, 0); ee.position.set(XC - 0.0002, (pt.a0 + pt.a1) / 2, pt.off + thick / 2); } else { ee.rotation.set(0, -Math.PI / 2, Math.PI / 2); ee.position.set(XC - 0.0002, pt.off + thick / 2, (pt.a0 + pt.a1) / 2); }
        self2.group.add(ee); edges.push({ mesh: ee, pl: pl, seg: seg });
      }
    });
    this.total = total; this.segs = segs;
    function segU(s, u) { return clamp(total ? (u * total - s.start) / s.w : u); }
    /* progress u ∈ [0, 1] over the whole sweep: masks and edges follow */
    this.u = 0;
    this.set = function (u) { u = clamp(u); self2.u = u; segs.forEach(function (s) { if (s.mask) s.mask.update(segU(s, u)); }); edges.forEach(function (e) { var s = e.seg, su = segU(s, u), front = s.r ? s.r.yFront(su) : s.pt.a1; if (s.pt.kind === 'wall') { e.pl.normal.set(0, 1, 0); e.pl.constant = -front; } else { e.pl.normal.set(0, 0, -1); e.pl.constant = front; } if (su >= 0.9999) e.pl.constant = 10; if (su <= 0.0001) e.pl.constant = -10; }); };
    /* where the tool is at progress u: the patch, the point on it */
    this.at = function (u) { u = clamp(u); var k, s = segs[segs.length - 1]; for (k = 0; k < segs.length; k++) if (u * total <= segs[k].start + segs[k].w + 1e-9) { s = segs[k]; break; } var su = segU(s, u), q = s.r ? s.r.at(su) : { x: (s.x0 + s.pt.x1) / 2, y: s.pt.a0 }; return s.pt.kind === 'wall' ? { kind: 'wall', x: q.x, y: q.y, z: s.pt.off, seg: s, su: su } : { kind: 'floor', x: q.x, y: s.pt.off, z: q.y, seg: s, su: su }; };
    this.show = function (b) { self2.group.visible = b; };
    this.opacity = function (v) { meshes.forEach(function (me) { me.material.opacity = v; }); edges.forEach(function (e) { e.mesh.material.opacity = v; }); };
    this.set(0);
  }
  this.Coat = Coat;

  /* the concave fillet along the wall–floor joint: profile from the wall (y = R at z = z0) down to the floor (z = z0 + R at y = y0), extruded along x */
  function coveGeo(x0, x1, y0, z0, R, off, cutCap) {
    var n = 14, prof = [], k2, o2 = off || 0; // a coat lies ON the concave cove: a quarter circle round the centre (z0 + R, y0 + R) with radius R − o2
    for (k2 = 0; k2 <= n; k2++) { var a2 = Math.PI / 2 * k2 / n, rr = R - o2; prof.push([z0 + R - rr * Math.cos(a2), y0 + R - rr * Math.sin(a2)]); }
    var pos = [], nor = [], uv = [], idx = [], i2;
    prof.forEach(function (p2, k3) { [x0, x1].forEach(function (x) { pos.push(x, p2[1], p2[0]); var cz = z0 + R, cy = y0 + R, nz = cz - p2[0], ny = cy - p2[1], l = Math.hypot(nz, ny) || 1; nor.push(0, ny / l, nz / l); uv.push((x - x0) * 3, k3 / n); }); });
    for (i2 = 0; i2 < n; i2++) { var a0 = i2 * 2; idx.push(a0, a0 + 2, a0 + 1, a0 + 1, a0 + 2, a0 + 3); }
    var base = pos.length / 3, capN = 0; if (cutCap) { prof.forEach(function (p2) { pos.push(x0, p2[1], p2[0]); nor.push(-1, 0, 0); uv.push(p2[0] * 6, p2[1] * 6); }); pos.push(x0, y0, z0); nor.push(-1, 0, 0); uv.push(0, 0); var cc = pos.length / 3 - 1; for (i2 = 0; i2 < n; i2++) idx.push(cc, base + i2 + 1, base + i2); capN = n * 3; }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.addGroup(0, n * 6, 0); if (cutCap) geo.addGroup(n * 6, capN, 1); return geo;
  }
  /* a strip of coating with a concave shell over the cove, clipped along x while it is being formed */
  function coveShell(x0, x1, y0, z0, R, off, m, mcut, pl) { var mm = keep(m.clone()); mm.clippingPlanes = pl ? [pl] : null; mm.side = THREE.DoubleSide; layerMats.push(mm); var mc = keep((mcut || m).clone()); mc.clippingPlanes = pl ? [pl] : null; mc.side = THREE.DoubleSide; layerMats.push(mc); var me = new THREE.Mesh(keep(coveGeo(cut ? Math.max(x0, XC) : x0, x1, y0, z0, R, off, cut)), [mm, mc]); me.castShadow = true; me.receiveShadow = true; (curParent || g).add(me); return me; }

  function stripL(x0, x1, wdt, off, m, pl) { var mm = keep(m.clone()); mm.clippingPlanes = pl ? [pl] : null; layerMats.push(mm); var xa = cut ? Math.max(x0, XC) : x0, gg = new THREE.Group(), a = new THREE.Mesh(keep(new THREE.PlaneGeometry(x1 - xa, wdt)), mm), b = new THREE.Mesh(keep(new THREE.PlaneGeometry(x1 - xa, wdt)), mm); a.position.set((xa + x1) / 2, wdt / 2, off); b.rotation.x = -Math.PI / 2; b.position.set((xa + x1) / 2, off, wdt / 2); a.receiveShadow = b.receiveShadow = true; gg.add(a, b); (curParent || g).add(gg); return gg; }
  var W = P.W, S = P.S, hw = W ? W.w / 2 : 0, zb = W ? -W.t : 0, wall = null, wallCut = null;
  var RWm = THREE.MirroredRepeatWrapping; // the paste textures are not periodic: mirrored tiling leaves no seams on the coats
  var slurryM = { RB: layerMat({ map: keep(canvasTex(WPTX.slurry('#666b6f', { seed: 811 }), { wrap: RWm })), color: 0xa9adaf, roughness: 0.55, envMapIntensity: 0.5 }), K1: layerMat({ map: keep(canvasTex(WPTX.slurry('#7c8083', { seed: 813 }), { wrap: RWm })), color: 0xbfc2c4, roughness: 0.7, envMapIntensity: 0.4 }), K2: layerMat({ map: keep(canvasTex(WPTX.slurry('#4b5054', { seed: 815 }), { wrap: RWm })), color: 0x9a9ea1, roughness: 0.6, envMapIntensity: 0.5 }), OS: layerMat({ map: keep(canvasTex(WPTX.slurry('#6f7376', { seed: 817 }), { wrap: RWm })), color: 0xb4b7b9, roughness: 0.65, envMapIntensity: 0.45 }), M30: layerMat({ map: keep(canvasTex(CRTX.mortar(0.4, 0.4, 771, { tone: '#c9c7bf', grain: 1.2, dens: 0.6, k: 0.6 }), { wrap: RWm })), color: 0xe0ded6, roughness: 0.96, envMapIntensity: 0.25 }) };
  Object.keys(slurryM).forEach(function (k) { wettable(slurryM[k]); });
  var primM = layerMat({ color: 0xaabfcc, roughness: 0.18, envMapIntensity: 1.2, opacity: 0.22, depthWrite: false });
  var filmM = layerMat({ color: 0xdfe9f2, roughness: 0.08, metalness: 0, opacity: 0.3, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide });
  var blocks = [];
  /* an L of tape along a wall–floor joint: the strip up the wall and the strip on the floor, one clipped material */
  function tapeL(tx0, tx1, off, tapeMc) { var tl = tx1 - tx0, gg = new THREE.Group(), a = new THREE.Mesh(keep(new THREE.PlaneGeometry(tl, 0.06)), tapeMc), b = new THREE.Mesh(keep(new THREE.PlaneGeometry(tl, 0.06)), tapeMc); a.position.set((tx0 + tx1) / 2, 0.033, off); b.rotation.x = -Math.PI / 2; b.position.set((tx0 + tx1) / 2, off, 0.033); var uva = a.geometry.attributes.uv, uvb = b.geometry.attributes.uv, k7; for (k7 = 0; k7 < uva.count; k7++) { uva.setXY(k7, uva.getX(k7) * tl / 0.25, 0.5 + uva.getY(k7) * 0.5); uvb.setXY(k7, uvb.getX(k7) * tl / 0.25, uvb.getY(k7) * 0.5); } uva.needsUpdate = uvb.needsUpdate = true; a.receiveShadow = b.receiveShadow = true; gg.add(a, b); (curParent || g).add(gg); return gg; }

  /* ===== the room: the return walls, the second worked wall in its own frame, the fillets up the corner, the shading, the fittings =====
     o: { rt, lt, leftH, faceKey/mats (the right wall's inner face), coats: [{ k, m, off, a0, a1, rowH, rep, color, follow }], coves: [{ pl, part, m, R, off }],
     strips: [{ pl, part, wdt, off, m }], fittings: fn(RK, F, ROOM) }. A coat with `follow` copies its original's progress (the finished picture and the run);
     one without is swept by the rig's own tool in the frame first (coatStage). Fillets and strips in the frame follow the clip plane of their original. */
  var ROOM = null;
  function room(o) {
    var D = S.zf, H = o.h || W.h, ctxL = { P: P, g: g, hw: hw, zb: zb, cut: cut, XC: XC, keep: keep, block: block, mesh: mesh, mat: mat, coveGeo: coveGeo, layerMats: layerMats, into: into };
    var RK = new RCKit.Kit({ keep: keep, block: block }), F = WPRoom.frame(ctxL, hw, -Math.PI / 2), R = { F: F, RK: RK, D: D, H: H, coats: [], coves: [], strips: [], mirrors: [], spots: [], ctx: ctxL };
    R.walls = o.rt ? WPRoom.returnWalls(ctxL, { rt: o.rt, lt: o.lt, leftH: o.leftH, faceKey: o.faceKey, faceKeyL: o.faceKeyL, mats: o.mats, uvR: o.uvR, uvL: o.uvL, keysR: o.keysR, keysL: o.keysL, cutKey: o.cutKey, depth: o.depth, h: H, y0: o.y0 }) : null;
    (o.coats || []).forEach(function (c) { var main = parts[c.k], cR = into(F.g, function () { return new Coat([{ kind: 'wall', x0: 0.0, x1: D - 0.02, a0: c.a0 != null ? c.a0 : (P.cove || 0), a1: c.a1 != null ? c.a1 : H - 0.03, off: c.off }], c.m, 0, { rowH: c.rowH || 0.1, rep: c.rep || 0.25, noNoise: c.noNoise, maskW: c.maskW, only: c.only }); }); if (c.color) cR.meshes.forEach(function (me) { me.material.color.setHex(c.color); }); parts[c.k + 'R'] = cR; main.R = cR; R.coats.push({ k: c.k, main: main, R: cR, follow: !!c.follow }); });
    (o.coves || []).forEach(function (c) { var mR = into(F.g, function () { return coveShell(0, D - 0.02, 0, 0, c.R, c.off || 0, c.m, c.m, plane(c.pl + 'R', 0, 0, -1)); }), mV = WPRoom.coveV(ctxL, H - 0.03, c.R, c.off || 0, c.m, plane(c.pl + 'V', 0, -1, 0)); mR.castShadow = mV.castShadow = !!c.cast; parts[c.part + 'R'] = mR; parts[c.part + 'V'] = mV; R.coves.push({ pl: c.pl, from: parts[c.part], R: mR, V: mV }); });
    (o.strips || []).forEach(function (c) { var mR = into(F.g, function () { return stripL(0, D - 0.02, c.wdt, c.off, c.m, plane(c.pl + 'R', 0, 0, -1)); }); parts[c.part + 'R'] = mR; R.strips.push({ pl: c.pl, from: parts[c.part], R: mR }); });
    R.shade = WPRoom.shading(ctxL, RK, o.rt ? F : null, { left: !!o.lt, alpha: o.alpha || 0.5, y0: o.y0, h: H, floor: o.floor });
    function prog(pl) { var c = pl.constant, x0 = cut ? XC : -hw; if (c >= 9) return 1; if (c <= -9) return 0; return clamp((c - x0) / (hw - x0)); } // the progress of a main clip plane (normal −x) along the back wall
    R.sync = function (run) {
      R.coats.forEach(function (c) { c.R.show(c.main.group.visible); if (c.follow || !run) c.R.set(c.main.u); });
      R.coves.forEach(function (c) { var p2 = prog(clip[c.pl]); c.R.visible = c.V.visible = c.from.visible; clip[c.pl + 'R'].constant = p2 >= 1 ? 10 : p2 <= 0 ? -10 : p2 * D; clip[c.pl + 'V'].constant = p2 >= 1 ? 10 : p2 <= 0 ? -10 : p2 * H; });
      R.strips.forEach(function (c) { var p2 = prog(clip[c.pl]); c.R.visible = c.from.visible; clip[c.pl + 'R'].constant = p2 >= 1 ? 10 : p2 <= 0 ? -10 : p2 * D; });
      R.mirrors.forEach(function (m) { m(run); });
    };
    R.xray = function (xr) { RK.xrMats.forEach(function (m) { if (m.userData.tr == null) { m.userData.tr = m.transparent; m.userData.op = m.opacity; } var tr = xr > 0.01 || m.userData.tr; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = m.userData.op * (1 - xr * 0.8); }); R.shade.set(xr); R.spots.forEach(function (sp) { sp.intensity = sp.userData.base * (1 - xr); }); };
    R.lamp = function (at, target, o2) { var sp = WPRoom.lamp(ctxL, at, target, o2); R.spots.push(sp); return sp; };
    /* a progressive mask that remembers its progress, so a copy on the return wall can follow it */
    R.track = function (mask) { if (!mask || mask.u != null) return mask; var upd = mask.update; mask.u = 0; mask.update = function (u2) { mask.u = u2; upd(u2); }; return mask; };
    if (o.fittings) o.fittings(RK, F, R);
    ROOM = R; return R;
  }

  /* the ground round a basement room: saturated soil to the water table, dry soil above it — behind the back wall, outside the right wall and (full model) the left */
  function soilAround(rt, lt, table) { var L = [], H = W.h; function soilAt(xa, xb, za, zc) { block(xa, xb, -S.y, table, za, zc, ['ws', 'ws', 'ws', 'ws', 'ws', 'ws']); if (table < H) block(xa, xb, table, H, za, zc, ['soil', 'soil', 'soil', 'soil', 'soil', 'soil']); var wt = block(xa, xb, table - 0.003, table + 0.003, za - 0.001, zc + 0.001, ['w', 'w', 'w', 'w', 'w', 'w'], { w: waterM }); if (wt) { wt.castShadow = false; L.push(wt); } } soilAt(-1.45, 1.45, -1.3, zb); soilAt(hw + rt, 1.45, zb, S.zf + 0.15); if (!cut && lt) soilAt(-1.45, -hw - lt, zb, S.zf + 0.15); parts.wtL = L; return L; }

  /* ===== the component ===== */
  /* a convex prism: the profile prof = [[z, y], …] (counter-clockwise, z to the right and y up) extruded along x from x0 to x1; one material for every face */
  function prism(x0, x1, prof, m, uvScale) {
    if (cut) { if (x1 <= XC + 1e-6) return null; if (x0 < XC) x0 = XC; }
    var pos = [], nor = [], uv = [], idx = [], n = prof.length, i, sc = uvScale || 0.7, base;
    for (i = 0; i < n; i++) { var a = prof[i], b = prof[(i + 1) % n], dz = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dz, dy) || 1, nz = dy / l, ny = -dz / l; base = pos.length / 3;
      [[x0, a], [x1, a], [x1, b], [x0, b]].forEach(function (v, k) { pos.push(v[0], v[1][1], v[1][0]); nor.push(0, ny, nz); uv.push((v[0] + 1) / sc, (k < 2 ? 0 : l) / sc + (a[1] + 1) / sc); });
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3); }
    [[x0, -1], [x1, 1]].forEach(function (cp) { base = pos.length / 3; for (i = 0; i < n; i++) { pos.push(cp[0], prof[i][1], prof[i][0]); nor.push(cp[1], 0, 0); uv.push((prof[i][0] + 1) / sc, (prof[i][1] + 0.5) / sc); }
      for (i = 1; i < n - 1; i++) { if (cp[1] < 0) idx.push(base, base + i + 1, base + i); else idx.push(base, base + i, base + i + 1); } });
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    return mesh(geo, m);
  }

  if (scn === 'ext') {
    // the base slab (projecting P.toe beyond the outer face, running back under the basement) and the wall on it; behind the wall the basement
    var PT = P.pit, yPit = -S.y, yGnd = P.fill, zWS = S.zf + PT.ws, zCrest = zWS + (yGnd - yPit) / Math.tan(PT.slope * Math.PI / 180), zEnd = zCrest + PT.top, yBot = -S.y - PT.depth, yWater = -S.y - PT.water;
    block(-S.x, S.x, -S.y, 0, S.zb, S.zf, ['formed', 'formed', 'slabTop', 'formed', 'formed', 'formed']);
    wall = block(-hw, hw, 0, W.h, zb, 0, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']);
    // the subgrade under the slab and the pit floor at the level of its underside; the design water level in it; the battered bank of the excavation
    block(-PT.x, PT.x, yWater, yPit, S.zb, zEnd, ['soil', 'soil', 'soil', 'soil', 'soil', 'soil']); block(-PT.x, PT.x, yBot, yWater, S.zb, zEnd, ['ws', 'ws', 'ws', 'ws', 'ws', 'ws']); // dry above, saturated below the design water level
    var wtE = block(-PT.x, PT.x, yWater - 0.004, yWater + 0.004, S.zb - 0.001, zEnd + 0.001, ['w', 'w', 'w', 'w', 'w', 'w'], { w: waterM }); if (wtE) { wtE.castShadow = false; parts.wt = wtE; }
    parts.bank = prism(-PT.x, PT.x, [[zWS, yPit], [zEnd, yPit], [zEnd, yGnd], [zCrest, yGnd]], soilM);
    self.ext = { zWS: zWS, zCrest: zCrest, yWater: yWater, yBot: yBot };
    // the pipe through the wall: a hollow grey PVC-U pipe (OD 2r, wall 3.2 mm — DN 100 sewer pipe) through a cored hole whose annular gap is grouted; it runs
    // on into the basement. The open end shows the pipe wall and the bore.
    (function () {
      var PP = P.pipe, tw2 = 0.0032, ri = PP.r - tw2, zIn = -W.t - 0.12, zOut = PP.out, L = zOut - zIn, seg = 48;
      var pvcC = mkCanvas(128, 256), pq = pvcC.getContext('2d'), rp = lcg(431), i; pq.fillStyle = '#8f959a'; pq.fillRect(0, 0, 128, 256); pq.globalAlpha = 0.05; for (i = 0; i < 160; i++) { pq.fillStyle = i % 2 ? '#ffffff' : '#3a3f44'; pq.fillRect(rp() * 128, 0, 1, 256); } pq.globalAlpha = 1; // faint extrusion lines along the pipe (u runs round the pipe, v along it)
      pq.fillStyle = '#3e4347'; pq.fillRect(58, 0, 2, 256); pq.save(); pq.translate(72, 250); pq.rotate(-Math.PI / 2); pq.fillStyle = 'rgba(40,44,48,.8)'; pq.font = 'bold 8px sans-serif'; pq.fillText('PVC-U  DN 100  SN 4', 0, 0); pq.restore(); // the printed marking line along the pipe
      var pvcM = mat({ map: keep(canvasTex(pvcC, { wrap: RWp, repeat: [1, 1] })), roughness: 0.32, metalness: 0, envMapIntensity: 0.9 }), boreM = mat({ color: 0x2b2e31, roughness: 0.6, metalness: 0, envMapIntensity: 0.25, side: THREE.BackSide }), endM = mat({ color: 0xa9aeb2, roughness: 0.45, metalness: 0, envMapIntensity: 0.6 });
      var pg = new THREE.Group(); pg.position.set(PP.x, PP.y, 0); g.add(pg);
      var outer = mesh(new THREE.CylinderGeometry(PP.r, PP.r, L, seg, 1, true), pvcM, { parent: pg }); outer.rotation.x = Math.PI / 2; outer.rotation.y = P.pipe.spin || 0; outer.position.z = (zIn + zOut) / 2; // the marking line turned to where it is seen
      var bore = mesh(new THREE.CylinderGeometry(ri, ri, L - 0.002, seg, 1, true), boreM, { parent: pg, noCast: true }); bore.rotation.x = Math.PI / 2; bore.position.z = (zIn + zOut) / 2;
      [zOut, zIn].forEach(function (z, k) { var e = mesh(new THREE.RingGeometry(ri, PP.r, seg), endM, { parent: pg, noCast: true }); e.position.z = z; if (k) e.rotation.y = Math.PI; }); // the cut ends of the pipe wall
      var groutM = mat({ map: keep(canvasTex(CRTX.mortar(0.3, 0.3, 773, { tone: '#9d9c96', grain: 1.1, dens: 0.7, k: 0.6 }), { wrap: RWp })), roughness: 0.97, envMapIntensity: 0.2 }, concMats);
      [[0.0006, 0], [-W.t - 0.0006, Math.PI]].forEach(function (q) { var gr = mesh(new THREE.RingGeometry(PP.r - 0.0005, PP.r + 0.014, seg), groutM, { parent: pg, noCast: true }); gr.position.z = q[0]; gr.rotation.y = q[1]; }); // the grouted annular gap of the cored hole, on both faces
      parts.pipe = pg;
    })();
    // levelling: patches of M30 on the face
    parts.level = new Coat([{ kind: 'wall', x0: -hw, x1: hw, a0: 0.02, a1: W.h - 0.02, off: 0.0008 }], slurryM.M30, 0.003, { rowH: 0.16, rep: 0.3, only: function (x, y) { return noise(x * 7 + 3, y * 7) > 0.6; } }); // the levelling fills the low spots only
    // the sealing cove of M30 and the bonding slurry under it
    parts.pre = stripL(-hw, hw, P.cove + 0.025, 0.0004, slurryM.K1, plane('pre', -1, 0, 0)); // the bonding slurry on the concrete where the cove will sit
    parts.cove = coveShell(-hw, hw, 0, 0, P.cove, 0, slurryM.M30, slurryM.M30, plane('cove', -1, 0, 0)); parts.cove.castShadow = true;
    // pipe detail: the bed of RB400 combed round the pipe, the sleeve, the overcoat
    var bedM = layerMat({ map: keep(canvasTex(WPTX.slurry('#666b6f', { seed: 819, ridges: true }), { wrap: RWm, repeat: [2, 2] })), color: 0xa9adaf, roughness: 0.55, envMapIntensity: 0.5 }), bedMask = KIT ? KIT.mask(96, 96, function (u, v) { var dx = u - 0.5, dy = v - 0.5; return Math.hypot(dx, dy) * 2; }, false) : null; if (bedMask) { bedM.alphaMap = bedMask.tex; bedM.alphaTest = 0.1; CRPrepKit.rawAlpha(bedM); }
    parts.bed = mesh(new THREE.PlaneGeometry(0.34, 0.34), bedM, { noCast: true }); parts.bed.position.set(P.pipe.x, P.pipe.y, 0.0012); parts.bedMask = bedMask;
    var sleeveM = layerMat({ map: keep(canvasTex(WPTX.tape, { wrap: RWp, repeat: [6, 1] })), color: 0xc9ced2, roughness: 0.9, envMapIntensity: 0.3, side: THREE.DoubleSide });
    parts.sleeve = new THREE.Group(); g.add(parts.sleeve); var ring = new THREE.Mesh(keep(new THREE.RingGeometry(P.pipe.r + 0.002, P.pipe.r + 0.11, 40)), sleeveM); ring.position.set(P.pipe.x, P.pipe.y, 0.0022); parts.sleeve.add(ring); var collar = new THREE.Mesh(keep(new THREE.CylinderGeometry(P.pipe.r + 0.002, P.pipe.r + 0.002, 0.06, 40, 1, true)), sleeveM); collar.rotation.x = Math.PI / 2; collar.position.set(P.pipe.x, P.pipe.y, 0.032); parts.sleeve.add(collar);
    var overM = keep(slurryM.RB.clone()); layerMats.push(overM); overM.polygonOffsetFactor = -2; parts.over = mesh(new THREE.RingGeometry(P.pipe.r + 0.003, P.pipe.r + 0.15, 40), overM, { noCast: true }); parts.over.position.set(P.pipe.x, P.pipe.y, 0.0032); parts.overMask = KIT ? KIT.mask(96, 96, function (u, v) { return Math.hypot(u - 0.5, v - 0.5) * 2; }, false) : null; if (parts.overMask) { overM.alphaMap = parts.overMask.tex; overM.alphaTest = 0.1; CRPrepKit.rawAlpha(overM); }
    // the two coats over the wall, the cove, the top of the slab projection and 15 cm down its front face (AQUAFIN-RB400 TDS: wall/floor transition)
    var toeOf = function (off) { return [{ kind: 'wall', x0: -hw, x1: hw, a0: P.cove, a1: W.h, off: off }, { kind: 'floor', x0: -hw, x1: hw, a0: P.cove, a1: S.zf + off, off: off }, { kind: 'wall', x0: -hw, x1: hw, a0: -Math.min(0.15, S.y), a1: off, off: S.zf + off }]; }; // the patches meet at the outer edge of the slab
    parts.c1 = new Coat(toeOf(0.0028), slurryM.RB, 0.0012, { rowH: 0.1, rep: 0.25 }); parts.c1cove = coveShell(-hw, hw, 0, 0, P.cove, 0.0012, slurryM.RB, slurryM.RB, plane('c1c', -1, 0, 0));
    parts.c2 = new Coat(toeOf(0.004), slurryM.RB, 0.0012, { rowH: 0.1, rep: 0.25 }); parts.c2cove = coveShell(-hw, hw, 0, 0, P.cove, 0.0024, slurryM.RB, slurryM.RB, plane('c2c', -1, 0, 0));
    parts.c2.meshes.forEach(function (me) { me.material.color.setHex(0xb2b6b8); });
    // the protection and drainage board up to just above the ground level: the adhesive bed combed with the notched trowel, two panels
    var sandM = layerMat({ map: keep(canvasTex(WPTX.slurry('#7a7f83', { seed: 821, ridges: true }), { wrap: RWm })), color: 0xb6b9bb, roughness: 0.8, envMapIntensity: 0.3 });
    parts.sand = new Coat([{ kind: 'wall', x0: -hw, x1: hw, a0: P.board.y0, a1: P.board.y1, off: 0.0052 }], sandM, 0.003, { rowH: 0.16, rep: 0.2, noNoise: true });
    var BD = WPTX.board, boardM = mat({ map: keep(canvasTex(BD.map, { wrap: RWp, repeat: [3, 3] })), bumpMap: keep(canvasTex(BD.bump, { wrap: RWp, repeat: [3, 3], srgb: false })), bumpScale: 0.004, roughness: 0.7, envMapIntensity: 0.3 }), boardE = mat({ color: 0x2f3336, roughness: 0.7 });
    parts.boards = [[-hw, 0], [0, hw]].map(function (xx) { var b = block(xx[0] + 0.002, xx[1] - 0.002, P.board.y0, P.board.y1, 0.0055, 0.0135, ['e', 'e', 'e', 'e', 'b', 'e'], { e: boardE, b: boardM }, 'e'); if (b) { b.userData.home = b.position.clone(); b.visible = false; } return b; }).filter(function (b) { return b; });
    // the backfill: soil rising in the working space between the board and the bank — over the slab projection and, beyond its edge, from the pit floor
    parts.fills = [block(-PT.x, PT.x, 0.003, yGnd, 0.014, S.zf + 0.003, ['soil', 'soil', 'soil', 'soil', 'soil', 'soil']), block(-PT.x, PT.x, yPit, yGnd, S.zf + 0.003, zCrest, ['soil', 'soil', 'soil', 'soil', 'soil', 'soil'])].filter(function (b) { return b; });
    parts.fills.forEach(function (b) { b.userData.y0 = b.geometry.userData.y0; b.userData.y1 = b.geometry.userData.y0 + b.geometry.userData.dy; b.visible = false; });
    /* the excavation's fittings: the perforated drainage pipe in its gravel bed at the toe, the inspection chamber it runs into (both buried by the backfill) */
    room({ rt: 0, floor: true, fittings: function (RK, F, R) {
      var DR = P.drain, zD = S.zf + 0.27, yB = -S.y, gravelM = mat({ map: keep(canvasTex(RCTX.gravel, { wrap: RWp, repeat: [3, 3] })), roughness: 0.95, envMapIntensity: 0.25 }, concMats);
      var bed = block(-PT.x, PT.x, yB, yB + 0.085, S.zf + 0.1, S.zf + 0.44, ['gv', 'gv', 'gv', 'gv', 'gv', 'gv'], { gv: gravelM }, 'gv'); if (bed) bed.castShadow = false; // the pipe lies on the first layer of gravel; the rest of the bed goes in with the backfill
      var pipeM = mat({ color: 0xd9b23a, roughness: 0.45, envMapIntensity: 0.6 }), xa = cut ? XC : -PT.x, xb = DR.x + 0.4, dp = mesh(new THREE.CylinderGeometry(DR.r, DR.r, xb - xa, 28), pipeM); dp.rotation.z = Math.PI / 2; dp.position.set((xa + xb) / 2, yB + DR.r + 0.06, zD); RK.xrMats.push(pipeM);
      var slotM = mat({ color: 0x3a3320, roughness: 1 }), k; for (k = 0; k < 40; k++) { var xs = -PT.x + 0.05 + k * 0.06; if (xs < xa || xs > xb - 0.05) continue; var sl = mesh(new THREE.TorusGeometry(DR.r + 0.001, 0.0025, 6, 24, Math.PI * 1.2), slotM, { noCast: true }); sl.rotation.set(0, Math.PI / 2, 0); sl.rotation.z = 0.9; sl.position.set(xs, yB + DR.r + 0.06, zD); } // the slots of the drainage pipe
      var chM = mat({ color: 0x4f6a52, roughness: 0.55, envMapIntensity: 0.4 }), ch = mesh(new THREE.CylinderGeometry(0.16, 0.16, P.fill + S.y + 0.12, 36), chM); ch.position.set(DR.x + 0.4, (P.fill + 0.12 - S.y) / 2, zD); RK.xrMats.push(chM); var lid = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 36), RK.M.cast); lid.position.set(DR.x + 0.4, P.fill + 0.125, zD); var rim = mesh(new THREE.TorusGeometry(0.155, 0.006, 12, 36), RK.M.cast, { noCast: true }); rim.rotation.x = Math.PI / 2; rim.position.set(DR.x + 0.4, P.fill + 0.14, zD); parts.chamber = ch; // the inspection chamber DN 300 with its cast lid at ground level
    } });
    /* the level of the backfill, f ∈ [0, 1] from the pit floor to the ground level */
    self.setFill = function (f) { var L = yPit + (yGnd - yPit) * f; parts.fills.forEach(function (b) { var y0 = b.userData.y0, y1 = b.userData.y1, h = Math.max(0.001, Math.min(y1 - y0, L - y0)); b.visible = f > 0 && L > y0 + 0.002; b.scale.y = h / (y1 - y0); b.position.y = y0 + h / 2; }); return L; };
  }
  if (scn === 'inner') {
    // the floor slab; the masonry wall — English bond on both faces, bricks in section on the sawn and the end faces, the course in plan on top, damp below the tide line; the soil behind it with the ground water
    var MS = WPTX.masonry(W.w, W.h, false, { damp: 1 }), MSr = WPTX.masonry(W.w, W.h, true, { damp: 1 }), masonryM = mat({ map: keep(canvasTex(MS)), roughness: 0.95, envMapIntensity: 0.25 }, concMats), rakedM = mat({ map: keep(canvasTex(MSr)), roughness: 0.95, envMapIntensity: 0.25 }, concMats);
    var msecM = mat({ map: keep(canvasTex(WPTX.masonrySection(W.t, W.h, 1))), roughness: 0.92, envMapIntensity: 0.25 }, concMats), mtopM = mat({ map: keep(canvasTex(WPTX.masonryPlan(W.w, W.t))), roughness: 0.92, envMapIntensity: 0.25 }, concMats);
    block(-S.x, S.x, -S.y, 0, S.zb, S.zf, ['formed', 'formed', 'slabTop', 'formed', 'formed', 'formed']);
    wall = block(-hw, hw, 0, W.h, zb, 0, ['msec', 'msec', 'mtop', 'mtop', 'masonry', 'masonry'], { masonry: masonryM, msec: msecM, mtop: mtopM }, 'msec');
    if (wall) { var uv = wall.geometry.attributes.uv, pp = wall.geometry.attributes.position, nn = wall.geometry.attributes.normal, k3; for (k3 = 0; k3 < uv.count; k3++) { var wx = pp.getX(k3) + wall.position.x, wy = pp.getY(k3) + wall.position.y, wz = pp.getZ(k3) + wall.position.z; if (Math.abs(nn.getZ(k3)) > 0.5) uv.setXY(k3, (wx + hw) / W.w, wy / W.h); else if (Math.abs(nn.getX(k3)) > 0.5) uv.setXY(k3, (wz - zb) / W.t, wy / W.h); else uv.setXY(k3, (wx + hw) / W.w, (wz - zb) / W.t); } uv.needsUpdate = true; } // every face mapped to its place in the wall, so the courses run round it
    parts.raked = wall ? mesh(new THREE.PlaneGeometry(cut ? hw - XC : W.w, W.h), rakedM, { noCast: true }) : null; if (parts.raked) { parts.raked.position.set(cut ? (XC + hw) / 2 : 0, W.h / 2, 0.0003); var ruv = parts.raked.geometry.attributes.uv, rp = parts.raked.geometry.attributes.position; for (k3 = 0; k3 < ruv.count; k3++) ruv.setXY(k3, (rp.getX(k3) + parts.raked.position.x + hw) / W.w, ruv.getY(k3)); ruv.needsUpdate = true; parts.rakedMask = KIT ? KIT.mask(140, 140, function (u, v) { return 0; }, false) : null; if (parts.rakedMask) { CRPrepKit.rawAlpha(rakedM); rakedM.alphaMap = parts.rakedMask.tex; rakedM.alphaTest = 0.5; rakedM.transparent = true; } }
    soilAround(P.room.rt, P.room.lt, P.table);
    // the old plaster as found: the picture of the damaged rendering, cut out where it has spalled off (holeVal > 0.42); the same function shades the rims in the picture
    var holeVal = function (u, v) { return Math.max(0, 1 - Math.hypot((u - 0.62) * 1.4, (v - 0.18) * 2.2) / 0.5) + Math.max(0, 1 - Math.hypot((u - 0.2) * 1.6, (v - 0.32) * 2) / 0.45) + Math.max(0, 1 - Math.hypot((u - 0.86) * 2.2, (v - 0.4) * 2.6) / 0.3) + (noise(u * 9, v * 9) - 0.5) * 0.5; };
    var OP = WPTX.oldPlaster(W.w, W.h, holeVal), oldM = mat({ map: keep(canvasTex(OP)), roughness: 0.9, envMapIntensity: 0.3, transparent: true, alphaTest: 0.5 }, concMats);
    parts.old = mesh(new THREE.PlaneGeometry(cut ? hw - XC : W.w, W.h - 0.02), oldM, { noCast: true }); parts.old.position.set(cut ? (XC + hw) / 2 : 0, W.h / 2 + 0.01, P.plaster); (function () { var ouv = parts.old.geometry.attributes.uv, op = parts.old.geometry.attributes.position, k4; for (k4 = 0; k4 < ouv.count; k4++) ouv.setXY(k4, (op.getX(k4) + parts.old.position.x + hw) / W.w, ouv.getY(k4)); ouv.needsUpdate = true; })();
    // the strip order: the chipping hammer works the plaster off row by row from the top (a raster the tool follows); the spalled zones are open already (-1)
    var RS = KIT ? KIT.raster(cut ? XC : -hw, hw, 0.05, W.h - 0.02, 0.16, noise) : null; parts.stripRaster = RS;
    parts.oldMask = KIT ? KIT.mask(300, 300, function (u, v) { var hv = holeVal(u, v); if (hv > 0.42) return -1; var x = -hw + u * W.w, y = v * W.h; if (cut && x < XC - 0.003) return -1; return 0.01 + (RS ? RS.order(x, y) : 1 - v) * 0.98; }, true) : null; if (parts.oldMask) { oldM.alphaMap = parts.oldMask.tex; CRPrepKit.rawAlpha(oldM); }
    var oldEdge = block(cut ? XC : -hw, hw, W.h - 0.02, W.h - 0.0, 0, P.plaster, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed'], null, 'formed'); parts.oldTop = oldEdge; if (oldEdge) { oldEdge.material = oldEdge.material.map(function () { return oldM; }); }
    if (cut) { var sideM = mat({ color: 0xcfc9bb, roughness: 0.95 }, concMats), oldSide = mesh(new THREE.PlaneGeometry(P.plaster, W.h), sideM, { noCast: true }); oldSide.rotation.y = -Math.PI / 2; oldSide.position.set(XC - 0.0002, W.h / 2, P.plaster / 2); parts.oldSide = oldSide; } // the plaster seen in section at the saw cut
    // plaster that has fallen: chips lying on the floor under the spalled zones (as found), cleared away in the preparation
    var chipM = mat({ map: keep(canvasTex(OP)), roughness: 0.95, envMapIntensity: 0.2 }, concMats), chipG = new THREE.Group(); g.add(chipG); parts.chips = chipG; (function () { var rc = lcg(433), i6; for (i6 = 0; i6 < 14; i6++) { var cx = -hw + 0.1 + rc() * (W.w - 0.2), cz = 0.02 + rc() * rc() * 0.2, cw2 = 0.03 + rc() * 0.06, cd = 0.025 + rc() * 0.045; if (cut && cx - cw2 / 2 < XC) continue; var ch2 = mesh(new THREE.BoxGeometry(cw2, P.plaster * (0.6 + rc() * 0.5), cd), chipM, { parent: chipG }); ch2.position.set(cx, P.plaster * 0.5, cz); ch2.rotation.set((rc() - 0.5) * 0.3, rc() * 6.28, (rc() - 0.5) * 0.4); } })();
    // the plaster removed: the wall stays; the damp patches on the masonry (wet film)
    // drill holes of the horizontal barrier
    parts.holes = []; var HM = mat({ color: 0x1c1a18, roughness: 1 }), creamM = layerMat({ map: keep(canvasTex(WPTX.cream)), roughness: 0.6, envMapIntensity: 0.4 }), plugM = layerMat({ color: 0xcfcdc5, roughness: 0.95 }), hx0 = -hw + 0.06, dx = (W.w - 0.12) / (P.holes.n - 1), i5;
    for (i5 = 0; i5 < P.holes.n; i5++) { var hx = hx0 + i5 * dx; if (cut && hx < XC + P.holes.r) continue; var hole = mesh(new THREE.CylinderGeometry(P.holes.r, P.holes.r, P.holes.d, 14, 1, true), HM, { noCast: true }); hole.rotation.x = Math.PI / 2; hole.position.set(hx, P.holes.y, -P.holes.d / 2 + 0.0005); hole.material.side = THREE.BackSide; hole.visible = false; var cr = mesh(new THREE.CylinderGeometry(P.holes.r - 0.0005, P.holes.r - 0.0005, P.holes.d - 0.02, 14), creamM, { noCast: true }); cr.rotation.x = Math.PI / 2; cr.position.set(hx, P.holes.y, -P.holes.d / 2 - 0.01); cr.visible = false; var pg = mesh(new THREE.CylinderGeometry(P.holes.r + 0.0005, P.holes.r + 0.0005, 0.02, 14), plugM, { noCast: true }); pg.rotation.x = Math.PI / 2; pg.position.set(hx, P.holes.y, -0.0095); pg.visible = false; parts.holes.push({ x: hx, hole: hole, cream: cr, plug: pg }); }
    // levelling M30 over the raked joints, the fillet, the three coats over wall and floor, the film, the plaster
    parts.level = new Coat([{ kind: 'wall', x0: -hw, x1: hw, a0: 0.02, a1: W.h - 0.02, off: 0.0009 }], slurryM.M30, 0.004, { rowH: 0.16, rep: 0.3, only: function (x, y) { return noise(x * 6 + 5, y * 6) > 0.52; } });
    parts.cove = coveShell(-hw, hw, 0, 0, P.cove, 0, slurryM.M30, slurryM.M30, plane('cove', -1, 0, 0));
    var faces = [{ kind: 'wall', x0: -hw, x1: hw, a0: P.cove, a1: W.h - 0.03, off: 0.0048 }, { kind: 'floor', x0: -hw, x1: hw, a0: P.cove, a1: S.zf - 0.03, off: 0.0016 }];
    ['c1', 'c2', 'c3'].forEach(function (k, i) { parts[k] = new Coat(faces.map(function (f) { var u = {}; for (var kk in f) u[kk] = f[kk]; u.off = f.off + i * 0.0011; return u; }), slurryM.K1, 0.0011, { rowH: 0.1, rep: 0.25 }); parts[k + 'cove'] = coveShell(-hw, hw, 0, 0, P.cove, 0.0011 * (i + 1), slurryM.K1, slurryM.K1, plane(k + 'c', -1, 0, 0)); parts[k].meshes.forEach(function (me) { me.material.color.setHex([0xbfc2c4, 0xc8cbcd, 0xd0d3d5][i]); }); });
    parts.film = block(cut ? XC : -hw, hw, 0.04, W.h - 0.02, 0.0085, 0.009, ['f', 'f', 'f', 'f', 'f', 'f'], { f: filmM }, 'f'); if (parts.film) { parts.film.castShadow = false; parts.film.visible = false; }
    var splM = layerMat({ map: keep(canvasTex(CRTX.mortar(0.4, 0.4, 773, { tone: '#b9b7ae', grain: 3, dens: 0.35, k: 0.6 }), { wrap: RWp })), roughness: 0.98, envMapIntensity: 0.2 }), plasterM = wettable(layerMat({ map: keep(canvasTex(CRTX.mortar(0.4, 0.4, 775, { tone: '#e6e3da', grain: 0.8, dens: 0.4, k: 0.6, felt: true }), { wrap: RWp })), color: 0xf1efe8, roughness: 0.97, envMapIntensity: 0.22 }));
    parts.splatter = new Coat([{ kind: 'wall', x0: -hw, x1: hw, a0: 0.05, a1: W.h - 0.03, off: 0.0092 }], splM, 0.003, { rowH: 0.14, rep: 0.3 }); parts.splatter.meshes.forEach(function (me) { me.material.alphaTest = 0.1; });
    parts.plaster = new Coat([{ kind: 'wall', x0: -hw, x1: hw, a0: 0.05, a1: W.h - 0.03, off: 0.012 }], plasterM, 0.02, { rowH: 0.24, rep: 0.35, noNoise: true });
    parts.plasterBody = block(cut ? XC : -hw, hw, 0.05, W.h - 0.03, 0.0095, 0.03, ['p', 'p', 'p', 'p', 'p', 'p'], { p: plasterM }, 'p'); if (parts.plasterBody) parts.plasterBody.visible = false;
    parts.dryer = K2 ? K2.dryer() : null; if (parts.dryer) { parts.dryer.position.set(0.4, 0, 0.66); parts.dryer.scale.setScalar(0.72); }
    /* the room: the return wall in the same masonry under the same old plaster (stripped with the back wall), levelled, coated three times, plastered; the cellar's fittings */
    (function () {
      var D = S.zf, rt = P.room.rt, H = W.h, masonryR = mat({ map: keep(canvasTex(WPTX.masonry(D - zb, H, false, { damp: 1, r: 1 }))), roughness: 0.95, envMapIntensity: 0.25 }, concMats);
      var Rm = room({ rt: rt, lt: P.room.lt, leftH: P.room.leftH, keysR: ['msec', 'masonryR', 'mtop', 'mtop', 'msec', 'msec'], keysL: ['masonryR', 'msec', 'mtop', 'mtop', 'msec', 'msec'], mats: { masonryR: masonryR, msec: msecM, mtop: mtopM }, cutKey: 'msec', uvR: function (x, y, z) { return [(z - zb) / (D - zb), y / H]; }, uvL: function (x, y, z) { return [1 - (z - zb) / (D - zb), y / H]; },
        coats: [{ k: 'level', m: slurryM.M30, off: 0.0009, a0: 0.02, a1: H - 0.02, rowH: 0.16, rep: 0.3, follow: true, only: function (x, y) { return noise(x * 6 + 9, y * 6 + 3) > 0.52; } }, { k: 'c1', m: slurryM.K1, off: 0.0048, color: 0xbfc2c4 }, { k: 'c2', m: slurryM.K1, off: 0.0059, color: 0xc8cbcd }, { k: 'c3', m: slurryM.K1, off: 0.007, color: 0xd0d3d5 }, { k: 'splatter', m: splM, off: 0.0092, a0: 0.05, rowH: 0.14, rep: 0.3, follow: true }, { k: 'plaster', m: plasterM, off: 0.012, a0: 0.05, rowH: 0.24, rep: 0.35, noNoise: true, follow: true }],
        coves: [{ pl: 'cove', part: 'cove', m: slurryM.M30, R: P.cove }, { pl: 'c1c', part: 'c1cove', m: slurryM.K1, R: P.cove, off: 0.0011 }, { pl: 'c2c', part: 'c2cove', m: slurryM.K1, R: P.cove, off: 0.0022 }, { pl: 'c3c', part: 'c3cove', m: slurryM.K1, R: P.cove, off: 0.0033 }],
        fittings: function (RK, F, R) {
          var lp = RK.bulkhead(true); lp.position.set(0.62, H - 0.16, 0); lp.scale.setScalar(0.8); F.g.add(lp); var cd = RK.pipeRun([[0.62, H - 0.1, 0.016], [0.62, H + 0.02, 0.016]], 0.011, RK.M.grey, [], 0.016); F.g.add(cd); R.lamp(F.to([0.62, H - 0.16, 0.08]), [0.1, 0.25, 0.3], { intensity: 0.75, angle: 0.8 });
          var dp = RK.pipeRun([[0.22, -0.02, 0.085], [0.22, H + 0.02, 0.085]], 0.05, RK.M.cast, [[0.22, 0.3, 0], [0.22, H - 0.2, 0]], 0.085); F.g.add(dp); var sock = RK.pipeRun([[0.22, 0.28, 0.085], [0.22, 0.4, 0.085]], 0.058, RK.M.cast, [], 0.085); F.g.add(sock); // an old cast-iron downpipe with its socket
          var gl = RK.gully(0.15); gl.position.set(0.3, 0.001, 0.62); g.add(gl); parts.gully = gl;
        } });
      parts.splatterR.meshes.forEach(function (me) { me.material.alphaTest = 0.1; });
      var OPR = WPTX.oldPlaster(D - 0.02, H, function () { return 0; }), oldMR = mat({ map: keep(canvasTex(OPR)), roughness: 0.9, envMapIntensity: 0.3, transparent: true, alphaTest: 0.5 }, concMats), oldR = into(Rm.F.g, function () { return mesh(new THREE.PlaneGeometry(D - 0.02, H - 0.02), oldMR, { noCast: true }); }); oldR.position.set((D - 0.02) / 2, H / 2 + 0.01, P.plaster); parts.oldR = oldR;
      var RSR = KIT ? KIT.raster(0, D - 0.02, 0.05, H - 0.02, 0.16, noise) : null, oldMaskR = KIT ? KIT.mask(220, 220, function (u, v) { return 0.01 + (RSR ? RSR.order(u * (D - 0.02), v * H) : 1 - v) * 0.98; }, true) : null; if (oldMaskR) { oldMR.alphaMap = oldMaskR.tex; CRPrepKit.rawAlpha(oldMR); } Rm.track(parts.oldMask);
      var oldTopR = into(Rm.F.g, function () { return block(0, D - 0.02, H - 0.02, H, 0, P.plaster, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed'], null, 'formed'); }); if (oldTopR) oldTopR.material = oldTopR.material.map(function () { return oldMR; });
      var plasterBodyR = into(Rm.F.g, function () { return block(0, D - 0.02, 0.05, H - 0.03, 0.0095, 0.03, ['p', 'p', 'p', 'p', 'p', 'p'], { p: plasterM }, 'p'); }), filmR = into(Rm.F.g, function () { return block(0, D - 0.02, 0.04, H - 0.02, 0.0085, 0.009, ['f', 'f', 'f', 'f', 'f', 'f'], { f: filmM }, 'f'); }); if (filmR) filmR.castShadow = false;
      Rm.mirrors.push(function () { oldR.visible = parts.old.visible; if (oldMaskR) oldMaskR.update(parts.oldMask ? parts.oldMask.u || 0 : 0); if (oldTopR) oldTopR.visible = parts.oldTop ? parts.oldTop.visible : false; if (plasterBodyR) plasterBodyR.visible = parts.plasterBody ? parts.plasterBody.visible : false; if (filmR) { filmR.visible = parts.film ? parts.film.visible : false; } });
    })();
  }
  if (scn === 'tank') {
    var TF = WPTX.tankFace(W.w, W.h, { crackU: 0.72 }), tankM = mat({ map: keep(canvasTex(TF)), roughness: 0.75, envMapIntensity: 0.4 }, concMats), tankFloorM = mat({ map: keep(canvasTex(WPTX.tankFloor(W.w, S.zf))), roughness: 0.8, envMapIntensity: 0.35 }, concMats), xT0 = cut ? XC : -hw, sumpAt = { x: 0.15, z: 0.62 }, onlyT = function (x, a, kind) { return kind !== 'floor' || Math.abs(x - sumpAt.x) > 0.14 || Math.abs(a - sumpAt.z) > 0.14; };
    var slabT = block(-S.x, S.x, -S.y, 0, S.zb, S.zf, ['formed', 'formed', 'slabTop', 'formed', 'formed', 'formed']);
    parts.floorOld = mesh(new THREE.PlaneGeometry(hw - xT0, S.zf), tankFloorM, { noCast: true }); parts.floorOld.rotation.x = -Math.PI / 2; parts.floorOld.position.set((xT0 + hw) / 2, 0.0004, S.zf / 2); (function () { var fuv = parts.floorOld.geometry.attributes.uv, k13; for (k13 = 0; k13 < fuv.count; k13++) fuv.setXY(k13, (xT0 + hw) / W.w + fuv.getX(k13) * (hw - xT0) / W.w, fuv.getY(k13)); fuv.needsUpdate = true; })(); tankFloorM.polygonOffset = true; tankFloorM.polygonOffsetFactor = -1; // the sludge on the floor as found (gone with the jetting)
    var wetTank = mat({ color: 0x5a6f6a, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.4, envMapIntensity: 1.6, depthWrite: false }); parts.puddleT = mesh(new THREE.CircleGeometry(1, 40), wetTank, { noCast: true }); parts.puddleT.rotation.x = -Math.PI / 2; parts.puddleT.position.set(0.15, 0.0012, 0.14); parts.puddleT.scale.set(0.3, 0.11, 1); // the residual water in the corner
    wall = block(-hw, hw, 0, W.h, zb, 0, ['formed', 'formed', 'formed', 'formed', 'tank', 'formed'], { tank: tankM }); if (wall) { var tuv = wall.geometry.attributes.uv, tp = wall.geometry.attributes.position, tn = wall.geometry.attributes.normal, k6; for (k6 = 0; k6 < tuv.count; k6++) if (tn.getZ(k6) > 0.5) tuv.setXY(k6, (tp.getX(k6) + wall.position.x + hw) / W.w, (tp.getY(k6) + wall.position.y) / W.h); tuv.needsUpdate = true; }
    // voids in the wall as found, filled with BIS-5/40 in the preparation: recesses with a mortar patch
    var voidM = mat({ map: keep(canvasTex(WPTX.pocket, { wrap: RWp, repeat: [1, 1] })), roughness: 0.95, envMapIntensity: 0.2 }, concMats), patchM = layerMat({ map: keep(canvasTex(CRTX.mortar(0.3, 0.3, 777, { tone: '#bdbcb5', grain: 2.4, dens: 0.5, trowel: true }))), roughness: 0.95, envMapIntensity: 0.3 });
    parts.voids = [[0.28, 0.62, 0.11], [-0.22, 0.34, 0.09], [0.1, 0.18, 0.07]].map(function (v) { if (cut && v[0] + v[2] < XC) return null; var vm = mesh(new THREE.CylinderGeometry(v[2], v[2] * 0.8, 0.018, 24, 1, false), voidM, { noCast: true }); vm.rotation.x = Math.PI / 2; vm.position.set(v[0], v[1], -0.009 + 0.0002); var pm = mesh(new THREE.CylinderGeometry(v[2] + 0.004, v[2] + 0.004, 0.02, 24), patchM, { noCast: true }); pm.rotation.x = Math.PI / 2; pm.position.set(v[0], v[1], -0.0095); pm.visible = false; return { v: v, hole: vm, patch: pm }; }).filter(function (v) { return v; });
    var smoothM = layerMat({ map: keep(canvasTex(CRTX.mortar(0.4, 0.4, 779, { tone: '#d6d4cc', grain: 0.9, dens: 0.6, k: 0.7, felt: true }), { wrap: RWp })), color: 0xe0ded6, roughness: 0.97, envMapIntensity: 0.25 });
    var tf = [{ kind: 'wall', x0: -hw, x1: hw, a0: 0.0, a1: W.h - 0.02, off: 0.0012 }, { kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: S.zf - 0.02, off: 0.0012 }];
    parts.smooth = new Coat(tf, smoothM, 0.003, { rowH: 0.14, rep: 0.35, only: onlyT });
    var tapeM = layerMat({ map: keep(canvasTex(WPTX.tape, { wrap: RWp, repeat: [4, 1] })), roughness: 0.85, envMapIntensity: 0.3 }); parts.tapeM = tapeM;
    parts.tapeBed = stripL(-hw, hw, 0.09, 0.0036, slurryM.RB, plane('tbed', -1, 0, 0));
    var tplane = plane('tape', -1, 0, 0), tapeMc = keep(tapeM.clone()); tapeMc.clippingPlanes = [tplane]; layerMats.push(tapeMc); parts.tape = tapeL(cut ? XC : -hw, hw, 0.0044, tapeMc);
    var tfc = [{ kind: 'wall', x0: -hw, x1: hw, a0: 0.0, a1: W.h - 0.02, off: 0.0052 }, { kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: S.zf - 0.02, off: 0.0052 }];
    parts.c1 = new Coat(tfc, slurryM.RB, 0.0012, { rowH: 0.1, rep: 0.25, only: onlyT }); parts.c2 = new Coat(tfc.map(function (f) { var u = {}; for (var kk in f) u[kk] = f[kk]; u.off = f.off + 0.0012; return u; }), slurryM.RB, 0.0012, { rowH: 0.1, rep: 0.25, only: onlyT }); parts.c2.meshes.forEach(function (me) { me.material.color.setHex(0xb2b6b8); });
    (function () { var sF = parts.c1.segs[1]; if (sF && KIT && parts.floorOld) { parts.floorMask = KIT.mask(220, 150, function (u, v) { var x = xT0 + u * (hw - xT0), z = S.zf - v * S.zf; return sF.r.order(x, z); }, true); tankFloorM.alphaMap = parts.floorMask.tex; tankFloorM.transparent = true; tankFloorM.alphaTest = 0.5; CRPrepKit.rawAlpha(tankFloorM); } })(); // the sludge goes with the jet over the floor
    parts.film = null; parts.dryer = K2 ? K2.dryer() : null; if (parts.dryer) { parts.dryer.position.set(0.24, 0.007, 0.86); parts.dryer.scale.setScalar(0.7); }
    parts.water = block(cut ? XC : -hw, hw, 0.007, P.level, 0.007, S.zf, ['w', 'w', 'w', 'w', 'w', 'w'], { w: waterM }, 'w'); if (parts.water) { parts.water.castShadow = false; parts.water.visible = false; parts.water.userData.h = P.level - 0.007; }
    /* the room: the tank's return walls with the same crust at the water line, smoothed, taped along their feet, coated twice; the tank's fittings */
    (function () {
      var D = S.zf, H = W.h, tankMR = mat({ map: keep(canvasTex(WPTX.tankFace(D - zb, H, { noCrack: true, seed: 523, ties: [[0.35, 0.28], [0.75, 0.28]] }))), roughness: 0.75, envMapIntensity: 0.4 }, concMats), tankML = mat({ map: keep(canvasTex(WPTX.tankFace(D - zb, H, { noCrack: true, seed: 527, ties: [[0.4, 0.28]] }))), roughness: 0.75, envMapIntensity: 0.4 }, concMats);
      var Rm = room({ rt: P.room.rt, lt: P.room.lt, leftH: P.room.leftH, faceKey: 'tankR', faceKeyL: 'tankL', mats: { tankR: tankMR, tankL: tankML },
        coats: [{ k: 'smooth', m: smoothM, off: 0.0012, a0: 0.0, a1: H - 0.02, rowH: 0.14, rep: 0.35, follow: true }, { k: 'c1', m: slurryM.RB, off: 0.0052, a0: 0.0, a1: H - 0.02 }, { k: 'c2', m: slurryM.RB, off: 0.0064, a0: 0.0, a1: H - 0.02, color: 0xb2b6b8 }],
        strips: [{ pl: 'tbed', part: 'tapeBed', wdt: 0.09, off: 0.0036, m: slurryM.RB }],
        fittings: function (RK, F, R) {
          var IN = P.inlet, noz = RK.wallNozzle(IN.r, IN.out, {}); noz.position.set(IN.x, IN.y, 0); g.add(noz); parts.inlet = noz;
          var su = RK.suction(0.04, H + 0.12, { gap: 0.08, support: 0.13 }); su.position.set(0.53, 0, 0.78); su.rotation.y = -Math.PI / 2; g.add(su); parts.suction = su; var fs = RK.floatSwitch(0.42); fs.position.set(0.1, H + 0.02, 0.6); g.add(fs);
          var gr = RK.grate(0.26, 0.26); gr.position.set(sumpAt.x, 0.022, sumpAt.z); g.add(gr); parts.sump = gr;
          var ld = RK.ladder(H, 0.4, { m: RK.M.ss, standoff: 0.16, brackets: [0.3, H - 0.2] }); ld.position.set(0.55, 0, 0); F.g.add(ld); parts.ladder = ld; var ov = RK.wallNozzle(0.04, 0.12, { flange: false }); ov.position.set(0.2, H - 0.12, 0); F.g.add(ov);
          var lp = RK.hookLamp(); lp.position.set(0.78, H, 0); F.g.add(lp); R.lamp(F.to([0.78, H - 0.22, 0.12]), [0.1, 0.25, 0.15], { intensity: 0.7 });
        } });
      var tplR = plane('tapeR', 0, 0, -1), tapeMcR = keep(tapeM.clone()); tapeMcR.clippingPlanes = [tplR]; layerMats.push(tapeMcR); parts.tapeR = into(Rm.F.g, function () { return tapeL(0, D - 0.02, 0.0044, tapeMcR); }); Rm.strips.push({ pl: 'tape', from: parts.tape, R: parts.tapeR });
    })();
  }
  if (scn === 'balcony') {
    var screedM = mat({ map: keep(canvasTex(TEX.slab(), { wrap: RWp, repeat: [0.8, 0.8] })), color: 0xd9d6cd, roughness: 0.92, envMapIntensity: 0.3 }, concMats), screedTop = mat({ map: keep(canvasTex(WPTX.screedFace(2 * S.x, S.zf))), roughness: 0.9, envMapIntensity: 0.3 }, concMats);
    var renderM = mat({ map: keep(canvasTex(CRTX.mortar(0.5, 0.5, 781, { tone: '#d8d3c6', grain: 0.9, dens: 0.4, k: 0.6, felt: true }), { wrap: RWm })), color: 0xe8e4da, roughness: 0.96, envMapIntensity: 0.22 }, concMats); UVR.render = [0.5, 0.5];
    block(-S.x, S.x, -S.y, -P.screed, S.zb, S.zf, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); // the slab
    parts.screed = block(-S.x, S.x, -P.screed, 0, 0, S.zf, ['sc', 'sc', 'top', 'sc', 'sc', 'sc'], { sc: screedM, top: screedTop }); // the screed, up to the upstand
    if (parts.screed) { var suv = parts.screed.geometry.attributes.uv, sp = parts.screed.geometry.attributes.position, sn = parts.screed.geometry.attributes.normal, k12; for (k12 = 0; k12 < suv.count; k12++) if (sn.getY(k12) > 0.5) suv.setXY(k12, (sp.getX(k12) + parts.screed.position.x + S.x) / (2 * S.x), 1 - (sp.getZ(k12) + parts.screed.position.z) / S.zf); suv.needsUpdate = true; } // canvas top = the wall side
    var DO = P.door; wall = block(-hw, DO.x0, -P.screed, W.h, zb, 0, ['render', 'formed', 'formed', 'formed', 'render', 'formed'], { render: renderM }); block(DO.x1, hw, -P.screed, W.h, zb, 0, ['formed', 'render', 'formed', 'formed', 'render', 'formed'], { render: renderM }); block(-S.x, -hw, -P.screed, W.h, zb, 0, ['formed', 'formed', 'formed', 'formed', 'render', 'formed'], { render: renderM }, 'formed'); block(hw + P.room.rt, S.x, -P.screed, W.h, zb, 0, ['formed', 'formed', 'formed', 'formed', 'render', 'formed'], { render: renderM }, 'formed'); // the house wall, rendered, with the opening of the balcony door
    var puddleM = mat({ color: 0x8fa3ad, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.45, envMapIntensity: 1.6, depthWrite: false }); parts.puddle = mesh(new THREE.CircleGeometry(1, 40), puddleM, { noCast: true }); parts.puddle.rotation.x = -Math.PI / 2; parts.puddle.position.set(0.17, 0.0015, S.zf * 0.55); parts.puddle.scale.set(0.24, 0.12, 1); if (cut && 0.17 - 0.24 < XC) parts.puddle.scale.x = 0.24; // the rain standing in the low spot
    var edgeM = mat({ color: 0xaeb3b7, metalness: mt(0.6), roughness: 0.4, envMapIntensity: 1 }); parts.edge = block(-S.x, S.x, -0.06, 0.004, S.zf - 0.002, S.zf + 0.004, ['e', 'e', 'e', 'e', 'e', 'e'], { e: edgeM }, 'e'); // the drip edge profile
    parts.prim = new Coat([{ kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: S.zf - 0.01, off: 0.0006 }], primM, 0, { rowH: 0.15, rep: 1, maskW: 90 });
    parts.level = new Coat([{ kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: S.zf - 0.01, off: 0.001 }], slurryM.M30, 0.003, { rowH: 0.2, rep: 0.3, only: function (x, z) { return noise(x * 7 + 1, z * 7 + 2) > 0.62; } });
    parts.tapeBed = stripL(-hw, hw, 0.09, 0.0026, slurryM.K2, plane('tbed', -1, 0, 0));
    var tapeMb = layerMat({ map: keep(canvasTex(WPTX.tape, { wrap: RWp, repeat: [4, 1] })), roughness: 0.85, envMapIntensity: 0.3 }), tplane2 = plane('tape', -1, 0, 0), tapeMc2 = keep(tapeMb.clone()); tapeMc2.clippingPlanes = [tplane2]; layerMats.push(tapeMc2); parts.tape = tapeL(cut ? XC : -hw, hw, 0.0034, tapeMc2);
    var bf = [{ kind: 'wall', x0: -hw, x1: hw, a0: 0.0, a1: 0.15, off: 0.0042 }, { kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: S.zf - 0.006, off: 0.0042 }];
    parts.c1 = new Coat(bf, slurryM.K2, 0.0011, { rowH: 0.1, rep: 0.25 }); parts.c2 = new Coat(bf.map(function (f) { var u = {}; for (var kk in f) u[kk] = f[kk]; u.off = f.off + 0.0011; return u; }), slurryM.K2, 0.0011, { rowH: 0.1, rep: 0.25 }); parts.c2.meshes.forEach(function (me) { me.material.color.setHex(0xa6aaad); });
    var adhM = layerMat({ map: keep(canvasTex(WPTX.slurry('#8a8f92', { seed: 823, ridges: true }), { wrap: RWm })), color: 0xc4c7c9, roughness: 0.85, envMapIntensity: 0.3 });
    parts.adh = new Coat([{ kind: 'floor', x0: -hw, x1: hw, a0: 0.006, a1: S.zf - 0.012, off: 0.0066 }], adhM, 0.005, { rowH: 0.3, rep: 0.2, noNoise: true });
    var tileM = mat({ map: keep(canvasTex(WPTX.tile, { wrap: RWp })), roughness: 0.22, envMapIntensity: 1.1 }), tileE = mat({ color: 0xb9c1c4, roughness: 0.5 }), groutM = mat({ color: 0x7d8286, roughness: 0.95 }, concMats), tileVar = [0xffffff, 0xf6f6f4, 0xecedeb, 0xf9f8f5].map(function (cc, ci) { var tm = keep(tileM.clone()); tm.color.setHex(cc); tm.map = keep(tileM.map.clone()); tm.map.rotation = ci % 2 ? Math.PI / 2 : 0; tm.map.center.set(0.5, 0.5); tm.map.needsUpdate = true; concMats.push(tm); return tm; }); // slight variation from tile to tile
    parts.tiles = []; var TJ = P.tile.j, nx = Math.round(W.w / (P.tile.s + TJ)), nz = Math.round((S.zf - 0.018) / (P.tile.s + TJ)), TSx = (W.w - (nx + 1) * TJ) / nx, TSz = (S.zf - 0.018 - (nz + 1) * TJ) / nz, ix, iz;
    for (iz = 0; iz < nz; iz++) for (ix = 0; ix < nx; ix++) { var x0t = -hw + TJ + ix * (TSx + TJ), z0t = 0.006 + TJ + iz * (TSz + TJ); var t = block(x0t, x0t + TSx, 0.0066 + 0.005, 0.0066 + 0.005 + P.tile.t, z0t, z0t + TSz, ['e', 'e', 't', 'e', 'e', 'e'], { e: tileE, t: tileVar[(ix * 3 + iz * 5) % tileVar.length] }, 'e'); if (t) { t.userData.home = t.position.clone(); t.userData.k = iz * nx + ix; t.visible = false; parts.tiles.push(t); } }
    parts.grout = block(cut ? XC : -hw, hw, 0.0066 + 0.005 + P.tile.t - 0.004, 0.0066 + 0.005 + P.tile.t - 0.0015, 0.006, S.zf - 0.012, ['g', 'g', 'g', 'g', 'g', 'g'], { g: groutM }, 'g'); if (parts.grout) parts.grout.visible = false;
    var sealM = layerMat({ color: 0x6f7477, roughness: 0.6 }); parts.seal = block(cut ? XC : -hw, hw, 0.0066 + 0.005 + P.tile.t, 0.0066 + 0.005 + P.tile.t + 0.006, 0.0042, 0.006 + TJ / 2, ['s', 's', 's', 's', 's', 's'], { s: sealM }, 's'); if (parts.seal) parts.seal.visible = false;
    /* the balcony as a room: the rendered side wall with the tape and the two coats turned up its foot, the balcony door in the house wall, the railing along the free edge */
    (function () {
      var D = S.zf, H = W.h, TT = 0.0066 + 0.005 + P.tile.t;
      var Rm = room({ rt: P.room.rt, lt: 0, keysR: ['formed', 'render', 'formed', 'formed', 'formed', 'formed'], mats: { render: renderM }, cutKey: 'formed',
        coats: [{ k: 'c1', m: slurryM.K2, off: 0.0042, a0: 0.0, a1: 0.15 }, { k: 'c2', m: slurryM.K2, off: 0.0053, a0: 0.0, a1: 0.15, color: 0xa6aaad }],
        strips: [{ pl: 'tbed', part: 'tapeBed', wdt: 0.09, off: 0.0026, m: slurryM.K2 }],
        fittings: function (RK, F, R) {
          var M2 = RK.M, frameM = M2.black, glassM = keep(new THREE.MeshStandardMaterial({ color: 0xbfd6e0, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0, envMapIntensity: 1.4, depthWrite: false, side: THREE.DoubleSide })), darkM = keep(new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.9 }));
          function bx(w, h, d, m, pos) { var me = new THREE.Mesh(keep(new THREE.BoxGeometry(w, h, d)), m); me.position.set(pos[0], pos[1], pos[2]); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; }
          var x0d = DO.x0, x1d = DO.x1, wD = x1d - x0d, cx = (x0d + x1d) / 2; if (!cut || x1d > XC) { // the door: threshold, frame, the leaf with its glass; the dark of the room behind it
            bx(wD, 0.035 + P.screed, 0.12, M2.ssDull, [cx, (0.035 - P.screed) / 2, -0.06]); bx(0.06, H - 0.035, 0.07, frameM, [x0d + 0.03, 0.035 + (H - 0.035) / 2, -0.06]); bx(0.06, H - 0.035, 0.07, frameM, [x1d - 0.03, 0.035 + (H - 0.035) / 2, -0.06]);
            bx(wD - 0.12, 0.1, 0.055, frameM, [cx, 0.085, -0.06]); bx(0.05, H - 0.14, 0.055, frameM, [cx + 0.04, 0.135 + (H - 0.14) / 2, -0.06]); var gl = new THREE.Mesh(keep(new THREE.PlaneGeometry(wD - 0.12, H - 0.14)), glassM); gl.position.set(cx, 0.135 + (H - 0.14) / 2, -0.06); g.add(gl); var hd = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 18)), M2.ss); hd.position.set(cx + 0.09, 0.98, -0.02); hd.castShadow = true; g.add(hd); var hd2 = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 16)), M2.ss); hd2.rotation.x = Math.PI / 2; hd2.position.set(cx + 0.09, 1.05, -0.04); g.add(hd2); // the handle
            var bk = new THREE.Mesh(keep(new THREE.PlaneGeometry(wD + 0.1, H + 0.1)), darkM); bk.position.set(cx, H / 2, -0.24); g.add(bk); }
          // the railing along the free edge: posts on the slab top, the handrail, a bottom rail, vertical bars
          var zR = D - 0.06, yTop = 1.07, xs = [-0.95, -0.35, 0.25, 0.85].filter(function (x) { return !cut || x > XC; }), rail = new THREE.Group(); g.add(rail); parts.railing = rail;
          function cy(r, len, m, pos, rot) { var me = new THREE.Mesh(keep(new THREE.CylinderGeometry(r, r, len, 14)), m); me.position.set(pos[0], pos[1], pos[2]); if (rot) me.rotation.set(rot[0], rot[1], rot[2]); me.castShadow = true; rail.add(me); return me; }
          xs.forEach(function (x) { cy(0.02, yTop, M2.steel, [x, yTop / 2 + 0.004, zR]); var bp = new THREE.Mesh(keep(new THREE.BoxGeometry(0.1, 0.008, 0.1)), M2.steel); bp.position.set(x, 0.008, zR); rail.add(bp); });
          var xa = cut ? XC : -S.x, xb = S.x; cy(0.021, xb - xa, M2.steel, [(xa + xb) / 2, yTop, zR], [0, 0, Math.PI / 2]); var br = new THREE.Mesh(keep(new THREE.BoxGeometry(xb - xa, 0.03, 0.03)), M2.steel); br.position.set((xa + xb) / 2, 0.13, zR); br.castShadow = true; rail.add(br);
          for (var xb2 = -S.x + 0.09; xb2 < S.x; xb2 += 0.11) { if (cut && xb2 < XC) continue; cy(0.006, yTop - 0.15, M2.steel, [xb2, 0.145 + (yTop - 0.15) / 2, zR]); }
          R.lamp([-0.3, 1.6, 0.8], [0.1, 0.1, 0.5], { intensity: 0.35, angle: 0.9 });
        } });
      var tplR = plane('tapeR', 0, 0, -1), tapeMcR = keep(tapeMb.clone()); tapeMcR.clippingPlanes = [tplR]; layerMats.push(tapeMcR); parts.tapeR = into(Rm.F.g, function () { return tapeL(0, D - 0.02, 0.0034, tapeMcR); }); Rm.strips.push({ pl: 'tape', from: parts.tape, R: parts.tapeR });
      var skirtM = keep(tileE.clone()); var sk = into(Rm.F.g, function () { return block(0.006, D - 0.012, TT + 0.003, TT + 0.08, 0.0066 + 0.005, 0.0066 + 0.005 + P.tile.t, ['e', 'e', 'e', 'e', 't', 'e'], { e: skirtM, t: tileVar[1] }, 'e'); }); if (sk) { sk.visible = false; parts.skirtR = sk; } // the tiled skirting on the side wall, set with the tiles
      var sk2 = block(cut ? XC : -hw, DO.x0 - 0.006, TT + 0.003, TT + 0.08, 0.0066 + 0.005, 0.0066 + 0.005 + P.tile.t, ['e', 'e', 'e', 'e', 't', 'e'], { e: skirtM, t: tileVar[2] }, 'e'), sk3 = block(DO.x1 + 0.006, hw - 0.006, TT + 0.003, TT + 0.08, 0.0066 + 0.005, 0.0066 + 0.005 + P.tile.t, ['e', 'e', 'e', 'e', 't', 'e'], { e: skirtM, t: tileVar[3] }, 'e'); parts.skirts = [sk2, sk3].filter(function (b) { return b; }); parts.skirts.forEach(function (b) { b.visible = false; });
      Rm.mirrors.push(function () { var on = parts.tiles.length ? parts.tiles[parts.tiles.length - 1].visible : false; if (sk) sk.visible = on; parts.skirts.forEach(function (b) { b.visible = on; }); });
    })();
  }
  if (scn === 'negc') {
    // the floor slab, the concrete wall (formed on every face — the sawn face shows the aggregate), the soil behind it with the ground water
    block(-S.x, S.x, -S.y, 0, S.zb, S.zf, ['formed', 'formed', 'slabTop', 'formed', 'formed', 'formed']);
    wall = block(-hw, hw, 0, W.h, zb, 0, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']);
    soilAround(P.room.rt, P.room.lt, P.table);
    // the construction joint: a vertical groove through the face; water comes through it as found
    var J = P.joint, jU = (J.x + hw) / W.w, jointM = mat({ color: 0x2a2826, roughness: 1 }, concMats); parts.jointGroove = (!cut || J.x + J.w / 2 > XC) ? mesh(new THREE.BoxGeometry(J.w, W.h, J.d), jointM, { noCast: true }) : null; if (parts.jointGroove) parts.jointGroove.position.set(J.x, W.h / 2, -J.d / 2 + 0.0004);
    var wetJ = mat({ color: 0x2c3a42, roughness: 0.12, transparent: true, opacity: 0.22, envMapIntensity: 1.4, depthWrite: false }); parts.seep = parts.jointGroove ? mesh(new THREE.PlaneGeometry(J.w * 1.6, W.h * 0.7), wetJ, { noCast: true }) : null; if (parts.seep) parts.seep.position.set(J.x, W.h * 0.35, 0.0011); // the wet sheen of the seepage below the joint
    // the face as found: the stains (damp zone, lime runs, honeycombing, tie holes) and the old paint over them, flaked where the water worked
    var faceMats = []; parts.faceMats = faceMats; var facePlane = function (cv, off, o) { o = o || {}; var m = mat({ map: keep(canvasTex(cv)), transparent: true, alphaTest: 0.02, roughness: 0.92, envMapIntensity: 0.25, polygonOffset: true, polygonOffsetFactor: -1 }, faceMats), me = mesh(new THREE.PlaneGeometry(o.w || (cut ? hw - XC : W.w), W.h), m, { noCast: true, parent: o.parent }); me.position.set(o.xc != null ? o.xc : (cut ? (XC + hw) / 2 : 0), W.h / 2, off); if (!o.parent) { var uv = me.geometry.attributes.uv, pp = me.geometry.attributes.position, k5; for (k5 = 0; k5 < uv.count; k5++) uv.setXY(k5, (pp.getX(k5) + me.position.x + hw) / W.w, uv.getY(k5)); uv.needsUpdate = true; } return me; };
    var holePaint = function (u, v) { var d = Math.abs(u - jU); return Math.max(0, 1 - Math.hypot(d * 1.2, (v - 0.35) * 0.9) / 0.34) * 1.1 + Math.max(0, 1 - Math.hypot((u - 0.15) * 1.6, (v - 0.12) * 2.4) / 0.35) + Math.max(0, 1 - Math.hypot((u - 0.62) * 1.6, (v - 0.12) * 2.2) / 0.4) + (noise(u * 8 + 2, v * 8) - 0.5) * 0.5; };
    parts.stains = facePlane(WPTX.concStains(W.w, W.h, { jointU: jU, honey: P.honey, ties: P.ties }), 0.0006);
    parts.paint = facePlane(WPTX.paintOld(W.w, W.h, holePaint), 0.0009); parts.paint.material.alphaTest = 0.4;
    var RJc = KIT ? KIT.raster(cut ? XC : -hw, hw, 0.05, W.h - 0.03, 0.1, noise) : null; parts.jetRaster = RJc;
    parts.paintMask = KIT ? KIT.mask(300, 300, function (u, v) { var x = -hw + u * W.w, y = v * W.h; return 0.01 + (RJc ? RJc.order(x, y) : 1 - v) * 0.98; }, true) : null; if (parts.paintMask) { parts.paint.material.alphaMap = parts.paintMask.tex; CRPrepKit.rawAlpha(parts.paint.material); }
    parts.stainMask = KIT ? KIT.mask(300, 300, function (u, v) { var x = -hw + u * W.w, y = v * W.h; return 0.01 + (RJc ? RJc.order(x, y) : 1 - v) * 0.98; }, true) : null; if (parts.stainMask) { parts.stains.material.alphaMap = parts.stainMask.tex; CRPrepKit.rawAlpha(parts.stains.material); } // the lime runs go with the jet; the pockets and tie holes stay (drawn again below)
    var stainsDry = facePlane(WPTX.concStains(W.w, W.h, { jointU: jU, honey: P.honey, ties: P.ties, dry: 1 }), 0.0005); parts.stainsDry = stainsDry; stainsDry.visible = false; // after jetting: pockets and tie holes only
    // honeycombs broken out to sound concrete, then filled with M30; the tie holes filled; the joint chased and filled
    var hz = P.honey.map(function (h) { return { x: -hw + h[0] * W.w, y: h[1] * W.h, rx: h[2] * 1.15, ry: h[3] * 1.15 }; }), tz = P.ties.map(function (t) { return { x: -hw + t[0] * W.w, y: t[1] * W.h, r: 0.02 }; });
    var inPatch = function (x, y) { var k6; for (k6 = 0; k6 < hz.length; k6++) { var h = hz[k6]; if (Math.hypot((x - h.x) / h.rx, (y - h.y) / h.ry) < 1 + 0.15 * (noise(x * 30, y * 30) - 0.5)) return true; } for (k6 = 0; k6 < tz.length; k6++) if (Math.hypot(x - tz[k6].x, y - tz[k6].y) < tz[k6].r) return true; return false; };
    parts.repair = new Coat([{ kind: 'wall', x0: -hw, x1: hw, a0: 0.02, a1: W.h - 0.02, off: 0.0012 }], slurryM.M30, 0.004, { rowH: 0.16, rep: 0.3, only: inPatch, maskW: 200 });
    var fillM = keep(slurryM.M30.clone()); layerMats.push(fillM); parts.jointFill = parts.jointGroove ? mesh(new THREE.BoxGeometry(J.w + 0.002, W.h, J.d), fillM, { noCast: true }) : null; if (parts.jointFill) { parts.jointFill.position.set(J.x, W.h / 2, -J.d / 2 + 0.0008); parts.jointFill.visible = false; }
    // the sealing cove on its bonding slurry; the pre-seal of AQUAFIN-1K; the joint band of RB400; the two coats; the curing film; the dryer
    parts.pre = stripL(-hw, hw, P.cove + 0.025, 0.0004, slurryM.K1, plane('pre', -1, 0, 0)); parts.cove = coveShell(-hw, hw, 0, 0, P.cove, 0, slurryM.M30, slurryM.M30, plane('cove', -1, 0, 0));
    var facesC = [{ kind: 'wall', x0: -hw, x1: hw, a0: P.cove, a1: W.h - 0.03, off: 0.0024 }, { kind: 'floor', x0: -hw, x1: hw, a0: P.cove, a1: S.zf - 0.03, off: 0.0016 }];
    parts.seal = new Coat(facesC, slurryM.K1, 0.001, { rowH: 0.1, rep: 0.25 }); parts.sealcove = coveShell(-hw, hw, 0, 0, P.cove, 0.001, slurryM.K1, slurryM.K1, plane('sealc', -1, 0, 0));
    parts.band = new Coat([{ kind: 'wall', x0: J.x - P.band, x1: J.x + P.band, a0: P.cove, a1: W.h - 0.03, off: 0.0036 }], slurryM.RB, 0.0024, { rowH: 0.12, rep: 0.25, maskW: 80 });
    parts.c1 = new Coat(facesC.map(function (f) { var u = {}; for (var kk in f) u[kk] = f[kk]; u.off = f.off + 0.0026; return u; }), slurryM.RB, 0.0012, { rowH: 0.1, rep: 0.25 }); parts.c1cove = coveShell(-hw, hw, 0, 0, P.cove, 0.0022, slurryM.RB, slurryM.RB, plane('c1c', -1, 0, 0));
    parts.c2 = new Coat(facesC.map(function (f) { var u = {}; for (var kk in f) u[kk] = f[kk]; u.off = f.off + 0.0038; return u; }), slurryM.RB, 0.0012, { rowH: 0.1, rep: 0.25 }); parts.c2cove = coveShell(-hw, hw, 0, 0, P.cove, 0.0034, slurryM.RB, slurryM.RB, plane('c2c', -1, 0, 0)); parts.c2.meshes.forEach(function (me) { me.material.color.setHex(0xb2b6b8); });
    parts.film = block(cut ? XC : -hw, hw, 0.04, W.h - 0.02, 0.0075, 0.008, ['f', 'f', 'f', 'f', 'f', 'f'], { f: filmM }, 'f'); if (parts.film) { parts.film.castShadow = false; parts.film.visible = false; }
    parts.dryer = K2 ? K2.dryer() : null; if (parts.dryer) { parts.dryer.position.set(0.4, 0, 0.64); parts.dryer.scale.setScalar(0.72); }
    /* the room: the return wall with the same damp stains and flaking paint (jetted with the back wall), the pre-seal, the fillets and the two coats over it; the basement's fittings */
    (function () {
      var D = S.zf, H = W.h, x0c = cut ? XC : -hw;
      var Rm = room({ rt: P.room.rt, lt: P.room.lt, leftH: P.room.leftH,
        coats: [{ k: 'seal', m: slurryM.K1, off: 0.0024, a0: P.cove, a1: H - 0.03 }, { k: 'c1', m: slurryM.RB, off: 0.005, a0: P.cove, a1: H - 0.03 }, { k: 'c2', m: slurryM.RB, off: 0.0062, a0: P.cove, a1: H - 0.03, color: 0xb2b6b8 }],
        coves: [{ pl: 'cove', part: 'cove', m: slurryM.M30, R: P.cove }, { pl: 'sealc', part: 'sealcove', m: slurryM.K1, R: P.cove, off: 0.001 }, { pl: 'c1c', part: 'c1cove', m: slurryM.RB, R: P.cove, off: 0.0022 }, { pl: 'c2c', part: 'c2cove', m: slurryM.RB, R: P.cove, off: 0.0034 }],
        strips: [{ pl: 'pre', part: 'pre', wdt: P.cove + 0.025, off: 0.0004, m: slurryM.K1 }],
        fittings: function (RK, F, R) {
          var pr = RK.pipeRun([[-0.02, 0.86, 0.075], [D + 0.02, 0.86, 0.075]], 0.055, RK.M.pvc, [[0.2, 0.86, 0], [D - 0.2, 0.86, 0]], 0.075); F.g.add(pr); parts.pipeR = pr;
          var jb = RK.junction(); jb.position.set(0.62, 0.42, 0); F.g.add(jb); var cd = RK.pipeRun([[0.62, 0.47, 0.016], [0.62, H + 0.02, 0.016]], 0.011, RK.M.grey, [[0.62, 0.72, 0]], 0.016); F.g.add(cd); var cd2 = RK.pipeRun([[0.68, 0.42, 0.016], [D + 0.02, 0.42, 0.016]], 0.011, RK.M.grey, [[0.78, 0.42, 0]], 0.016); F.g.add(cd2);
          var gl = RK.gully(0.16); gl.position.set(0.16, 0.001, 0.6); g.add(gl); parts.gully = gl;
          if (!cut) { var tl = RK.tripodLamp(1.15); tl.position.set(-0.42, 0, 0.52); tl.rotation.y = 0.5; g.add(tl); R.lamp([-0.42, 1.15, 0.52], [0.3, 0.35, 0], { intensity: 0.8, angle: 0.75 }); }
        } });
      var stainsR = facePlane(WPTX.concStains(D, H, { jointU: 2.5, honey: [], ties: [[0.3, 0.6], [0.72, 0.6]], seed: 3 }), 0.0006, { w: D, xc: D / 2, parent: Rm.F.g }), paintR = facePlane(WPTX.paintOld(D, H, function (u, v) { return Math.max(0, 1 - Math.hypot((u - 0.3) * 1.6, (v - 0.14) * 2.4) / 0.35) + Math.max(0, 1 - Math.hypot((u - 0.7) * 1.8, (v - 0.1) * 2.2) / 0.3) + (noise(u * 8 + 4, v * 8 + 1) - 0.5) * 0.5; }), 0.0009, { w: D, xc: D / 2, parent: Rm.F.g }); paintR.material.alphaTest = 0.4;
      var RJR = KIT ? KIT.raster(0, D, 0.05, H - 0.03, 0.1, noise) : null, mkR = function () { return KIT ? KIT.mask(220, 220, function (u, v) { return 0.01 + (RJR ? RJR.order(u * D, v * H) : 1 - v) * 0.98; }, true) : null; }, paintMaskR = mkR(), stainMaskR = mkR(); if (paintMaskR) { paintR.material.alphaMap = paintMaskR.tex; CRPrepKit.rawAlpha(paintR.material); } if (stainMaskR) { stainsR.material.alphaMap = stainMaskR.tex; CRPrepKit.rawAlpha(stainsR.material); }
      var stainsDryR = facePlane(WPTX.concStains(D, H, { jointU: 2.5, honey: [], ties: [[0.3, 0.6], [0.72, 0.6]], dry: 1, seed: 3 }), 0.0005, { w: D, xc: D / 2, parent: Rm.F.g }); stainsDryR.visible = false; Rm.track(parts.paintMask); Rm.track(parts.stainMask);
      var filmR = into(Rm.F.g, function () { return block(0, D - 0.02, 0.04, H - 0.02, 0.0075, 0.008, ['f', 'f', 'f', 'f', 'f', 'f'], { f: filmM }, 'f'); }); if (filmR) filmR.castShadow = false;
      Rm.mirrors.push(function () { stainsR.visible = parts.stains.visible; paintR.visible = parts.paint.visible; stainsDryR.visible = parts.stainsDry.visible; if (paintMaskR) paintMaskR.update(parts.paintMask ? parts.paintMask.u || 0 : 0); if (stainMaskR) stainMaskR.update(parts.stainMask ? parts.stainMask.u || 0 : 0); if (filmR) { filmR.visible = parts.film ? parts.film.visible : false; if (parts.film) filmR.material.opacity = parts.film.material.opacity; } });
      void x0c;
    })();
  }
  if (scn === 'park') {
    var DF = WPTX.deckFace(2 * S.x, S.zf - S.zb), deckM = mat({ map: keep(canvasTex(DF)), roughness: 0.85, envMapIntensity: 0.35 }, concMats), deckClean = mat({ map: keep(canvasTex(WPTX.milled(2 * S.x, S.zf - S.zb))), roughness: 0.98, envMapIntensity: 0.2 }, concMats);
    block(-S.x, S.x, -S.y, 0, zb - 0.05, S.zb, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); wall = block(-S.x, S.x, 0, W.h, zb, 0, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); // the slab runs on under the parapet wall at the back of the bay
    parts.deck = block(-S.x, S.x, -S.y, 0, S.zb, S.zf, ['formed', 'formed', 'deck', 'formed', 'formed', 'formed'], { deck: deckM }); if (parts.deck) { var duv = parts.deck.geometry.attributes.uv, dp = parts.deck.geometry.attributes.position, dn = parts.deck.geometry.attributes.normal, k9; for (k9 = 0; k9 < duv.count; k9++) if (dn.getY(k9) > 0.5) duv.setXY(k9, (dp.getX(k9) + parts.deck.position.x + S.x) / (2 * S.x), (dp.getZ(k9) + parts.deck.position.z - S.zb) / (S.zf - S.zb)); duv.needsUpdate = true; }
    parts.blast = mesh(new THREE.PlaneGeometry(cut ? S.x - XC : 2 * S.x, S.zf - S.zb), deckClean, { noCast: true }); parts.blast.rotation.x = -Math.PI / 2; parts.blast.position.set(cut ? (XC + S.x) / 2 : 0, 0.0004, (S.zb + S.zf) / 2); var RM = KIT ? KIT.raster(cut ? XC : -S.x, S.x, S.zb + 0.01, S.zf - 0.01, 0.25, null, true) : null; parts.millRaster = RM; parts.blastMask = KIT ? KIT.mask(200, 140, function (u, v) { var x = (cut ? XC : -S.x) + u * (S.x - (cut ? XC : -S.x)), z = S.zf - v * (S.zf - S.zb); return RM ? RM.order(x, z) : 0; }, false) : null; if (parts.blastMask) { deckClean.alphaMap = parts.blastMask.tex; deckClean.alphaTest = 0.5; CRPrepKit.rawAlpha(deckClean); deckClean.transparent = true; } // the milled skin appears lane by lane behind the machine (drum 30 cm wide)
    if (cut) { deckClean.map.offset.set((XC + S.x) / (2 * S.x), 0); deckClean.map.repeat.set((S.x - XC) / (2 * S.x), 1); } // the kept half of the milled picture through the map's own transform: the mask reads the plane's raw texture coordinates (rawAlpha), which must stay 0..1 over the kept half
    // the crack across the deck, seen as a dark line on top; the reinforcement inside (x-ray)
    (function () { var PXc = WPTX.PX, w = Math.round(2 * S.x * 500), h = Math.round((S.zf - S.zb) * 500), c = mkCanvas(w, h), q = c.getContext('2d'), r = lcg(41), x = w * 0.3, y = 0; q.clearRect(0, 0, w, h); q.strokeStyle = '#15120f'; q.lineWidth = 2.2; q.lineJoin = 'round'; q.beginPath(); q.moveTo(x, 0); while (y < h) { y += 8; x += (r() - 0.45) * 7 + 1.2; q.lineTo(x, y); } q.stroke(); q.strokeStyle = 'rgba(120,80,40,.45)'; q.lineWidth = 9; q.stroke(); var cm = layerMat({ map: keep(canvasTex(c)), transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); parts.crack = mesh(new THREE.PlaneGeometry(cut ? S.x - XC : 2 * S.x, S.zf - S.zb), cm, { noCast: true }); parts.crack.rotation.x = -Math.PI / 2; parts.crack.position.set(cut ? (XC + S.x) / 2 : 0, 0.0008, (S.zb + S.zf) / 2); if (cut) { var cuv = parts.crack.geometry.attributes.uv, k10; for (k10 = 0; k10 < cuv.count; k10++) cuv.setXY(k10, (XC + S.x) / (2 * S.x) + cuv.getX(k10) * (S.x - XC) / (2 * S.x), cuv.getY(k10)); cuv.needsUpdate = true; } void PXc; })();
    var skirt = function (off) { return { kind: 'wall', x0: -S.x, x1: S.x, a0: 0.0, a1: P.skirt, off: off }; }, gullyAt = { x: -0.42, z: 0.8 }, onlyP = function (x, a, kind) { return kind !== 'floor' || Math.abs(x - gullyAt.x) > 0.09 || Math.abs(a - gullyAt.z) > 0.09; }; // every layer turns 15 cm up the parapet (the skirting) and leaves the gully out
    parts.prim = new Coat([skirt(0.0012), { kind: 'floor', x0: -S.x, x1: S.x, a0: S.zb + 0.01, a1: S.zf - 0.01, off: 0.0012 }], primM, 0, { rowH: 0.18, rep: 1, maskW: 90, only: onlyP });
    var pf = [skirt(0.0018), { kind: 'floor', x0: -S.x, x1: S.x, a0: S.zb + 0.01, a1: S.zf - 0.01, off: 0.0018 }];
    parts.scratch = new Coat(pf, slurryM.OS, 0.0008, { rowH: 0.16, rep: 0.3, only: onlyP }); parts.scratch.meshes.forEach(function (me) { me.material.color.setHex(0x9ea1a3); });
    parts.c1 = new Coat([skirt(0.0028), { kind: 'floor', x0: -S.x, x1: S.x, a0: S.zb + 0.01, a1: S.zf - 0.01, off: 0.0028 }], slurryM.OS, 0.0015, { rowH: 0.12, rep: 0.3, only: onlyP }); parts.c2 = new Coat([skirt(0.0043), { kind: 'floor', x0: -S.x, x1: S.x, a0: S.zb + 0.01, a1: S.zf - 0.01, off: 0.0043 }], slurryM.OS, 0.0015, { rowH: 0.12, rep: 0.3, only: onlyP }); parts.c2.meshes.forEach(function (me) { me.material.color.setHex(0xbdc0c2); });
    parts.wheel = K2 ? K2.wheel() : null; if (parts.wheel) { parts.wheel.position.set(0.05, 0.004, 0.57); parts.wheel.scale.setScalar(0.72); parts.wheel.visible = false; } // a car wheel on the finished deck, against the wheel stop
    /* the parking bay: the column with its warning band, the wheel stop, the gully, the bulkhead lamp on the parapet; the shading of the parapet foot */
    (function () {
      var CL = P.column;
      room({ rt: 0, floor: true, fittings: function (RK, F, R) {
        var col = mesh(new THREE.CylinderGeometry(CL.r, CL.r, 1.5, 40), formed); col.position.set(CL.x, 0.75, CL.z); var pl = block(CL.x - CL.r - 0.05, CL.x + CL.r + 0.05, 0, 0.06, CL.z - CL.r - 0.05, CL.z + CL.r + 0.05, ['formed', 'formed', 'slabTop', 'formed', 'formed', 'formed']); void pl;
        [[0.92, 0.1, RK.M.yellow], [1.02, 0.05, RK.M.black], [1.07, 0.1, RK.M.yellow], [1.17, 0.05, RK.M.black]].forEach(function (b) { var ring = mesh(new THREE.CylinderGeometry(CL.r + 0.003, CL.r + 0.003, b[1], 40, 1, true), b[2], { noCast: true }); ring.position.set(CL.x, b[0] + b[1] / 2, CL.z); }); // the warning band
        var rub = mat({ color: 0x1b1b1b, roughness: 0.9 }, concMats), ws = block(-0.27, 0.37, 0, 0.1, 0.19, 0.31, ['r', 'r', 'r', 'r', 'r', 'r'], { r: rub }, 'r'); if (ws) { [-0.16, 0.26].forEach(function (x) { if (cut && x < XC) return; var st = mesh(new THREE.BoxGeometry(0.06, 0.003, 0.125), RK.M.yellow, { noCast: true }); st.position.set(x, 0.1015, 0.25); }); } // the wheel stop with its reflective stripes
        if (!cut) { var gl = RK.gully(0.16); gl.position.set(gullyAt.x, 0.001, gullyAt.z); g.add(gl); }
        var bl = RK.bulkhead(true); bl.position.set(0.5, W.h - 0.12, 0); bl.scale.setScalar(0.85); g.add(bl); R.lamp([0.5, W.h - 0.12, 0.1], [0.1, 0.05, 0.55], { intensity: 0.7, angle: 0.85 });
      } });
    })();
  }
  /* an application defined outside this file (the crystalline guide, rc-3d.js) builds its geometry through P.build with the member's kit */
  var CTX = { P: P, scn: scn, cut: cut, XC: XC, g: g, S: S, W: W, hw: hw, zb: zb, parts: parts, clip: clip, block: block, prism: prism, mesh: mesh, mat: mat, layerMat: layerMat, plane: plane, Coat: Coat, coveShell: coveShell, coveGeo: coveGeo, stripL: stripL, slurryM: slurryM, primM: primM, filmM: filmM, waterM: waterM, formed: formed, sawn: sawn, cutFaceM: cutFaceM, slabTopM: slabTopM, soilM: soilM, wetSoilM: wetSoilM, concMats: concMats, layerMats: layerMats, wettable: wettable, wetLook: wetLook, keep: keep, noise: noise, KIT: KIT, K2: K2, faceUV: faceUV, UVR: UVR, RWp: RWp, RWm: RWm, self: self, ease: ease, clamp: clamp, setWall: function (w2) { wall = w2; }, into: into, room: room, tapeL: tapeL, ROOM: function () { return ROOM; }, mt: mt, WPTX: WPTX, CRTX: CRTX, TEX: TEX, canvasTex: canvasTex };
  if (P.build) P.build(CTX);

  /* ===== the rigs: the preparation and the application stages as work in progress ===== */
  var RIG = null; if (KIT && typeof WPRigs !== 'undefined') { try { RIG = WPRigs.build({ P: P, scn: scn, cut: cut, XC: XC, g: g, K: KIT, K2: K2, parts: parts, clip: clip, mats: slurryM, room: ROOM, keep: keep, mesh: mesh, mat: mat, layerMat: layerMat, noise: noise, ground: P.ground, floor: scn === 'ext' ? -S.y : (P.floor != null ? P.floor : null), wetLook: wetLook, primM: primM, filmM: filmM, W: W, S: S, hw: hw, self: self }); } catch (e) { RIG = null; if (window.console) console.error('waterproofing rig', scn, e); } }
  this.rig = RIG; this.parts = parts; this.P = P;
  this.dur = {}; if (RIG) { var dk; for (dk in RIG.dur) this.dur[dk] = RIG.dur[dk]; }

  /* ===== state per stage: the finished picture of every stage; the rig overrides while a stage is under way ===== */
  var xrNow = 0;
  function from(id, si) { return si >= ST.indexOf(id); }
  this.set = function (id, tw, xr) {
    var t = ease(clamp(tw)), i, si = ST.indexOf(id), F2 = function (s) { return from(s, si); }, sw = function (s) { return si === ST.indexOf(s) ? t : 1; }, run = !!RIG && RIG.has(id) && tw < 1;
    stageNow = id; xrNow = xr;
    layerMats.forEach(function (m) { m.opacity = m.userData.op != null ? m.userData.op : 1; });
    wetLook.forEach(function (w) { w.m.color.setHex(w.c); w.m.roughness = w.r; });
    Object.keys(clip).forEach(function (k) { clip[k].constant = 10; });
    if (scn === 'ext') {
      parts.level.show(F2('prep')); parts.level.set(F2('prep') ? 1 : 0);
      parts.pre.visible = F2('cove'); parts.cove.visible = F2('cove'); if (si === ST.indexOf('cove') && !run) { clip.pre.constant = 10; clip.cove.constant = 10; }
      parts.bed.visible = si === ST.indexOf('pipe'); parts.sleeve.visible = F2('pipe'); parts.over.visible = F2('pipe'); if (parts.bedMask) parts.bedMask.update(1); if (parts.overMask) parts.overMask.update(F2('pipe') ? 1 : 0); parts.sleeve.scale.set(1, 1, 1); parts.sleeve.position.z = 0;
      parts.c1.show(F2('coat1')); parts.c1.set(F2('coat1') ? 1 : 0); parts.c1cove.visible = F2('coat1'); parts.c2.show(F2('coat2')); parts.c2.set(F2('coat2') ? 1 : 0); parts.c2cove.visible = F2('coat2');
      parts.sand.show(si === ST.indexOf('board')); parts.sand.set(si === ST.indexOf('board') ? 1 : 0); parts.boards.forEach(function (b) { b.visible = F2('board'); b.position.copy(b.userData.home); });
      self.setFill(F2('done') ? (si === ST.indexOf('done') ? t : 1) : 0); if (parts.wt) parts.wt.material.opacity = 0.55 * (1 - xr * 0.8);
      var wetE = si === ST.indexOf('coat1') || si === ST.indexOf('coat2') ? 0.6 : 0; wetLook.forEach(function (w) { if (w.m === slurryM.RB) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.25 * wetE); w.m.roughness = w.r - (w.r - 0.3) * wetE; } });
    } else if (scn === 'inner') {
      var pr = F2('prep'); parts.old.visible = !pr; if (parts.oldTop) parts.oldTop.visible = !pr; if (parts.oldSide) parts.oldSide.visible = !pr; if (parts.oldMask) parts.oldMask.update(0); if (parts.chips) parts.chips.visible = !pr; if (parts.raked) { parts.raked.visible = pr; if (parts.rakedMask) parts.rakedMask.update(pr ? 1 : 0); }
      parts.level.show(pr); parts.level.set(pr ? 1 : 0); parts.cove.visible = pr;
      parts.holes.forEach(function (h) { h.hole.visible = F2('barrier'); h.cream.visible = F2('barrier'); h.plug.visible = F2('barrier'); });
      ['c1', 'c2', 'c3'].forEach(function (k, n) { var on = F2(['coat1', 'coat2', 'coat3'][n]); parts[k].show(on); parts[k].set(on ? 1 : 0); parts[k + 'cove'].visible = on; });
      if (parts.film) { parts.film.visible = si === ST.indexOf('cure'); parts.film.material.opacity = 0.3 * t; } if (parts.dryer) parts.dryer.visible = si === ST.indexOf('cure');
      parts.splatter.show(F2('plaster')); parts.splatter.set(F2('plaster') ? 1 : 0); parts.plaster.show(F2('plaster')); parts.plaster.set(F2('plaster') ? 1 : 0); if (parts.plasterBody) parts.plasterBody.visible = F2('plaster') && !run;
      var wetI = /coat/.test(id) || id === 'cure' ? 0.55 : 0; wetLook.forEach(function (w) { if (w.m === slurryM.K1) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.22 * wetI); w.m.roughness = w.r - (w.r - 0.35) * wetI; } });
    } else if (scn === 'tank') {
      var prT = F2('prep'); parts.voids.forEach(function (v) { v.patch.visible = prT; }); parts.smooth.show(prT); parts.smooth.set(prT ? 1 : 0); if (parts.floorOld) { parts.floorOld.visible = !prT; if (parts.floorMask) parts.floorMask.update(0); } if (parts.puddleT) parts.puddleT.visible = !prT;
      parts.tapeBed.visible = F2('joint'); parts.tape.visible = F2('joint');
      parts.c1.show(F2('coat1')); parts.c1.set(F2('coat1') ? 1 : 0); parts.c2.show(F2('coat2')); parts.c2.set(F2('coat2') ? 1 : 0);
      if (parts.dryer) parts.dryer.visible = si === ST.indexOf('cure');
      if (parts.water) { parts.water.visible = F2('fill'); var hw2 = parts.water.userData.h * (si === ST.indexOf('fill') ? t : 1); parts.water.scale.y = Math.max(0.001, hw2 / parts.water.userData.h); parts.water.position.y = 0.007 + hw2 / 2; parts.water.material.opacity = 0.55 * (1 - xr * 0.5); }
      var wetT = /coat/.test(id) || id === 'cure' ? 0.55 : 0; wetLook.forEach(function (w) { if (w.m === slurryM.RB) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.25 * wetT); w.m.roughness = w.r - (w.r - 0.3) * wetT; } });
    } else if (scn === 'balcony') {
      var prB = F2('prep'); parts.prim.show(prB); parts.prim.set(prB ? 1 : 0); parts.level.show(prB); parts.level.set(prB ? 1 : 0); if (parts.puddle) parts.puddle.visible = !prB;
      parts.tapeBed.visible = F2('tape'); parts.tape.visible = F2('tape');
      parts.c1.show(F2('coat1')); parts.c1.set(F2('coat1') ? 1 : 0); parts.c2.show(F2('coat2')); parts.c2.set(F2('coat2') ? 1 : 0);
      parts.adh.show(si === ST.indexOf('tiles')); parts.adh.set(si === ST.indexOf('tiles') ? 1 : 0); parts.tiles.forEach(function (tl) { tl.visible = F2('tiles'); tl.position.copy(tl.userData.home); });
      if (parts.grout) parts.grout.visible = F2('done'); if (parts.seal) parts.seal.visible = F2('done');
      var wetB = /coat/.test(id) ? 0.55 : 0; wetLook.forEach(function (w) { if (w.m === slurryM.K2) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.22 * wetB); w.m.roughness = w.r - (w.r - 0.3) * wetB; } });
    } else if (scn === 'negc') {
      var prC = F2('prep'), rpC = F2('repair');
      parts.paint.visible = !prC; if (parts.paintMask) parts.paintMask.update(0); parts.stains.visible = !prC; if (parts.stainMask) parts.stainMask.update(0); parts.stainsDry.visible = prC && !rpC; if (parts.seep) parts.seep.visible = !rpC; parts.faceMats.forEach(function (fm) { fm.opacity = 1 - xr * 0.9; });
      if (parts.jointGroove) parts.jointGroove.visible = !rpC; if (parts.jointFill) { parts.jointFill.visible = rpC; parts.jointFill.scale.y = 1; parts.jointFill.position.y = W.h / 2; }
      parts.repair.show(rpC); parts.repair.set(rpC ? 1 : 0); parts.pre.visible = rpC; parts.cove.visible = rpC;
      parts.seal.show(F2('seal')); parts.seal.set(F2('seal') ? 1 : 0); parts.sealcove.visible = F2('seal');
      parts.band.show(F2('joint')); parts.band.set(F2('joint') ? 1 : 0);
      parts.c1.show(F2('coat1')); parts.c1.set(F2('coat1') ? 1 : 0); parts.c1cove.visible = F2('coat1'); parts.c2.show(F2('coat2')); parts.c2.set(F2('coat2') ? 1 : 0); parts.c2cove.visible = F2('coat2');
      if (parts.film) { parts.film.visible = si === ST.indexOf('cure'); parts.film.material.opacity = 0.3 * t; } if (parts.dryer) parts.dryer.visible = si === ST.indexOf('cure');
      var wetC = /coat|joint/.test(id) || id === 'cure' ? 0.55 : 0; wetLook.forEach(function (w) { if (w.m === slurryM.RB) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.25 * wetC); w.m.roughness = w.r - (w.r - 0.3) * wetC; } });
    } else if (P.state) {
      P.state({ id: id, tw: tw, t: t, si: si, ST: ST, F2: F2, sw: sw, run: run, xr: xr }, CTX);
    } else if (scn === 'park') {
      var prP = F2('prep'); if (parts.blastMask) parts.blastMask.update(prP ? 1 : 0); parts.blast.visible = prP; parts.crack.visible = !F2('scratch') || xr > 0.02; parts.crack.material.opacity = F2('scratch') ? xr : 1;
      parts.prim.show(prP); parts.prim.set(prP ? 1 : 0);
      parts.scratch.show(F2('scratch')); parts.scratch.set(F2('scratch') ? 1 : 0); parts.c1.show(F2('coat1')); parts.c1.set(F2('coat1') ? 1 : 0); parts.c2.show(F2('coat2')); parts.c2.set(F2('coat2') ? 1 : 0);
      if (parts.wheel) { parts.wheel.visible = F2('done') && (si !== ST.indexOf('done') || t > 0.999); parts.wheel.position.x = 0.05; parts.wheel.position.z = 0.57; }
      var wetP = /coat|scratch/.test(id) ? 0.55 : (id === 'done' ? 0.55 * (1 - t) : 0); wetLook.forEach(function (w) { if (w.m === slurryM.OS) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.22 * wetP); w.m.roughness = w.r - (w.r - 0.3) * wetP; } });
    }
    if (RIG) RIG.set(id, tw, xr);
    if (ROOM) { ROOM.sync(run); ROOM.xray(xr); } if (parts.wtL) parts.wtL.forEach(function (wt2) { wt2.material.opacity = 0.55 * (1 - xr * 0.8); });
    for (i = 0; i < concMats.length; i++) { var m = concMats[i], tr2 = xr > 0.01 || m.alphaTest > 0; if (m.transparent !== tr2) { m.transparent = tr2; m.needsUpdate = true; } m.opacity = 1 - xr * 0.84; m.depthWrite = xr < 0.5; }
    for (i = 0; i < layerMats.length; i++) { var lm = layerMats[i]; if (lm !== filmM && lm !== primM) lm.opacity *= 1 - xr * 0.6; lm.depthWrite = lm.opacity > 0.6; }
  };

  /* ===== callout anchors per stage ===== */
  this.anchors = function (id, tw) {
    var L = [], xl = cut ? XC + 0.05 : -0.35, xr2 = cut ? XC + 0.02 : 0.3;
    function a(k, x, y, z) { L.push({ k: k, p: [x, y, z] }); }
    if (RIG && tw != null && tw < 1 && RIG.has(id)) { var LR = RIG.anchors(id, tw); if (LR) return LR; }
    if (P.anchors) { P.anchors(id, a, { xl: xl, xr2: xr2 }, CTX); return L; }
    if (scn === 'ext') {
      if (id === 'state') { var EX = self.ext, zSl = EX.zWS + (EX.zCrest - EX.zWS) * 0.45; a('conc', xl, 0.86, 0.001); a('slab', xr2, 0.001, S.zf * 0.5); a('bank', cut ? XC : -0.9, -S.y + (P.fill + S.y) * 0.45, zSl); a('gwl', cut ? XC : -P.pit.x, EX.yWater, cut ? S.zf + 0.25 : 0.4); }
      else if (id === 'prep') { a('level', xl, 0.7, 0.002); a('chamfer', cut ? XC : hw - 0.002, W.h, 0.0); a('matt', xr2, 0.3, 0.002); }
      else if (id === 'cove') { a('cove', xl, P.cove * 0.5, P.cove * 0.6); a('pre', xr2, P.cove + 0.03, 0.001); }
      else if (id === 'pipe') { a('sleeve', P.pipe.x, P.pipe.y + P.pipe.r + 0.06, 0.003); a('notch', P.pipe.x - 0.1, P.pipe.y - 0.08, 0.002); }
      else if (id === 'coat1') { a('c1', xl, 0.75, 0.004); a('cove', xr2, P.cove * 0.4, P.cove * 0.7); }
      else if (id === 'coat2') { a('c2', xl, 0.75, 0.006); a('dft', xr2, 0.3, 0.006); }
      else if (id === 'board') { a('board', xl, P.board.y1 - 0.15, 0.014); a('sand', xr2, 0.2, 0.006); }
      else { a('backfill', xr2, P.fill - 0.02, 0.3); a('board', xl, P.board.y1 - 0.02, 0.014); }
    } else if (scn === 'inner') {
      if (id === 'state') { a('plasterOld', xl, 0.8, P.plaster + 0.001); a('damp', xr2, 0.22, P.plaster + 0.001); a('ground', cut ? XC : -0.8, P.table, -0.6); a('soil', cut ? XC : 0.6, 0.9, -0.6); }
      else if (id === 'prep') { a('joints', xl, 0.7, 0.002); a('level', xr2, 0.45, 0.002); a('cove', xr2, P.cove * 0.5, P.cove * 0.6); }
      else if (id === 'barrier') { var h0 = parts.holes[0]; a('cream', h0 ? h0.x : 0.2, P.holes.y, 0.002); a('reseal', parts.holes[2] ? parts.holes[2].x : 0.4, P.holes.y + 0.03, 0.002); a('masonry', xl, 0.8, 0.001); }
      else if (id === 'coat1') a('c1i', xl, 0.75, 0.006); else if (id === 'coat2') a('c2i', xl, 0.75, 0.007); else if (id === 'coat3') a('c3i', xl, 0.75, 0.008);
      else if (id === 'cure') { a('mist', xl, 0.7, 0.01); a('dryer', parts.dryer ? parts.dryer.position.x : 0.36, 0.5, 0.45); }
      else { a('plaster', xl, 0.7, 0.031); a('splatter', xr2, 0.3, 0.012); }
    } else if (scn === 'negc') {
      var JX = P.joint.x;
      if (id === 'state') { a('paintOld', xl, 0.86, 0.001); a('cjoint', JX, 0.78, 0.002); a('leachC', JX - 0.02, 0.4, 0.002); a('honey', -hw + P.honey[0][0] * W.w, P.honey[0][1] * W.h, 0.002); a('ground', cut ? XC : -0.8, P.table, -0.6); }
      else if (id === 'prep') { a('jetC', xl, 0.7, 0.002); a('breakout', -hw + P.honey[0][0] * W.w, P.honey[0][1] * W.h + 0.02, 0.002); a('matt', xr2, 0.45, 0.002); }
      else if (id === 'repair') { a('repairC', -hw + P.honey[0][0] * W.w, P.honey[0][1] * W.h, 0.004); a('jointFill', JX, 0.6, 0.002); a('cove', xr2, P.cove * 0.5, P.cove * 0.6); }
      else if (id === 'seal') { a('preseal', xl, 0.75, 0.004); }
      else if (id === 'joint') { a('bandC', JX, 0.7, 0.006); }
      else if (id === 'coat1') { a('c1', xl, 0.75, 0.006); a('cove', xr2, P.cove * 0.4, P.cove * 0.7); } else if (id === 'coat2') { a('c2', xl, 0.75, 0.008); a('dftC', xr2, 0.3, 0.008); }
      else { a('mist', xl, 0.7, 0.01); a('dryer', parts.dryer ? parts.dryer.position.x : 0.36, 0.5, 0.45); }
    } else if (scn === 'tank') {
      if (id === 'state') { a('leach', xl, 0.6, 0.001); a('voids', 0.28, 0.62, 0.002); a('crackw', xr2, 0.2, 0.002); }
      else if (id === 'prep') { a('repair', 0.28, 0.62, 0.002); a('smooth', xl, 0.8, 0.002); a('jet', xr2, 0.0, 0.5); }
      else if (id === 'joint') { a('tape', xr2, 0.03, 0.005); a('over', xl, 0.1, 0.002); }
      else if (id === 'coat1') { a('c1t', xl, 0.7, 0.006); a('c1t', xr2, 0.006, 0.5); } else if (id === 'coat2') { a('c2t', xl, 0.7, 0.008); a('dft', xr2, 0.3, 0.008); }
      else if (id === 'cure') { a('mist', xl, 0.7, 0.01); a('dryer', parts.dryer ? parts.dryer.position.x : 0.36, 0.5, 0.5); }
      else { a('fill', xl, P.level, 0.3); a('water', xr2, P.level - 0.2, 0.4); }
    } else if (scn === 'balcony') {
      if (id === 'state') { a('screed', xr2, 0.001, 0.4); a('rain', xl, 0.0, 0.7); a('crackm', xr2, 0.001, 0.2); }
      else if (id === 'prep') { a('primU', xr2, 0.002, 0.5); a('level', xl, 0.002, 0.25); a('matt', xr2, 0.1, 0.001); }
      else if (id === 'tape') { a('tapeB', xr2, 0.03, 0.005); a('corner', cut ? XC : hw - 0.01, 0.03, 0.005); }
      else if (id === 'coat1') { a('c1b', xr2, 0.006, 0.5); a('c1b', xl, 0.12, 0.005); } else if (id === 'coat2') { a('c2b', xr2, 0.007, 0.5); a('dft', xl, 0.12, 0.007); }
      else if (id === 'tiles') { a('tiles', xr2, 0.022, 0.5); a('adhesive', xl, 0.012, 0.15); }
      else { a('grout', xr2, 0.022, 0.45); a('tiles', xl, 0.022, 0.7); }
    } else {
      if (id === 'state') { a('chlor', xl, 0.001, 0.2); a('crackm', -0.6 * 0 + (cut ? XC + 0.1 : -0.25), 0.001, 0.0); a('conc', xr2, -0.12, S.zf); }
      else if (id === 'prep') { a('mill', xl, 0.001, -0.2); a('prim', xr2, 0.002, 0.3); a('matt', xr2 + 0.2, 0.002, -0.1); }
      else if (id === 'scratch') a('scratch', xl, 0.003, 0.2); else if (id === 'coat1') a('c1p', xl, 0.004, 0.2); else if (id === 'coat2') { a('c2p', xl, 0.006, 0.2); a('dft', xr2, 0.006, -0.2); }
      else { a('traffic', xl, 0.006, 0.1); a('c2p', xr2, 0.006, -0.3); }
    }
    if (id === 'state' && ROOM && !P.anchors) { var FT = ROOM.F, aF = function (k, p2) { var w2 = FT.to(p2); a(k, w2[0], w2[1], w2[2]); }, HH = W ? W.h : 0;
      if (scn === 'inner') { aF('lampF', [0.62, HH - 0.16, 0.08]); aF('downpipe', [0.22, 0.6, 0.14]); a('gully', 0.3, 0.02, 0.62); }
      else if (scn === 'negc') { aF('pipeR', [0.5, 0.86, 0.13]); a('gully', 0.16, 0.02, 0.6); }
      else if (scn === 'tank') { a('inletF', P.inlet.x, P.inlet.y + P.inlet.r + 0.02, P.inlet.out); a('suction', 0.53, 0.12, 0.78); aF('ladder', [0.55, 0.55, 0.17]); a('floatSw', 0.12, HH - 0.1, 0.6); }
      else if (scn === 'balcony') { a('door', (P.door.x0 + P.door.x1) / 2 + 0.2, 0.6, -0.05); a('railing', 0.55, 1.0, S.zf - 0.06); }
      else if (scn === 'park') { a('column', P.column.x, 1.2, P.column.z); a('wheelStop', 0.3, 0.1, 0.25); a('skirt', xr2, P.skirt + 0.04, 0.002); }
      else if (scn === 'ext') { a('drain', P.drain.x + 0.1, -S.y + 0.12, S.zf + 0.27); a('chamber', P.drain.x + 0.4, P.fill + 0.14, S.zf + 0.27); } }
    return L;
  };
  this.parts = parts; this.clip = clip;
  this.dispose = function () { trash.forEach(function (o) { if (o && o.dispose) o.dispose(); }); trash = []; };
}

/* ===== the continued member: helpers shared by the applications that extend their sample for the jobsite simulator =====
   WPMerge: boxes [x0, x1, y0, y1, z0, z1] that share six material keys become one mesh with six material groups, every face mapped as the
   member's own block() maps it (ctx.faceUV), so a bay of bricks or boards costs one draw call. WPConcat: several non-indexed geometries
   (beads, extrusions) with their matrices applied become one, for a single mesh of one material. */
function WPMerge(ctx, list, keys, matOf) {
  var pos = [], nor = [], uv = [], idx = [[], [], [], [], [], []], base = 0; if (!list || !list.length) return null;
  list.forEach(function (b) { var w = b[1] - b[0], h = b[3] - b[2], d = b[5] - b[4], cx = (b[0] + b[1]) / 2, cy = (b[2] + b[3]) / 2, cz = (b[4] + b[5]) / 2, geo = new THREE.BoxGeometry(w, h, d), i, j; geo.userData = { x0: b[0], dx: w, y0: b[2], dy: h, z0: b[4], dz: d }; ctx.faceUV(geo, cx, cy, cz, keys);
    var p = geo.attributes.position, nn = geo.attributes.normal, u = geo.attributes.uv, ix = geo.index; for (i = 0; i < p.count; i++) { pos.push(p.getX(i) + cx, p.getY(i) + cy, p.getZ(i) + cz); nor.push(nn.getX(i), nn.getY(i), nn.getZ(i)); uv.push(u.getX(i), u.getY(i)); }
    geo.groups.forEach(function (gr) { var a = idx[gr.materialIndex]; for (j = gr.start; j < gr.start + gr.count; j++) a.push(ix.getX(j) + base); }); base += p.count; geo.dispose(); });
  var g2 = new THREE.BufferGeometry(), all = [], s = 0; g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g2.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g2.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); idx.forEach(function (a, mi) { g2.addGroup(s, a.length, mi); all = all.concat(a); s += a.length; }); g2.setIndex(all); g2.computeBoundingBox(); g2.computeBoundingSphere();
  var me = new THREE.Mesh(g2, keys.map(function (key) { return matOf(key); })); me.castShadow = true; me.receiveShadow = true; return me;
}
function WPConcat(geos) {
  var pos = [], nor = [], uv = [], hasUv = true; if (!geos.length) return null;
  geos.forEach(function (g) { var ng = g.index ? g.toNonIndexed() : g, p = ng.attributes.position, n = ng.attributes.normal, u = ng.attributes.uv, i; if (!n) { ng.computeVertexNormals(); n = ng.attributes.normal; } if (!u) hasUv = false; for (i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); if (u) uv.push(u.getX(i), u.getY(i)); } if (ng !== g) ng.dispose(); g.dispose(); });
  var out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); if (hasUv) out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); out.computeBoundingBox(); out.computeBoundingSphere(); return out;
}
