/* ===== [island_ao.js] ===== */
  /* ================= (v65) what is drawn is solid =================
     The places were walked by their plans (walk areas, solid boxes): wherever something was drawn but not planned — a bench, a planter, a guard
     rail, a parked car or scooter, a kiosk, a fountain's rim, the edge of a stage or a platform — she could walk through it. Now each place, once
     shown, reads its own drawn geometry: every triangle of what stands still, where it is between knee and head height above a floor she could
     stand on, goes into a fine grid (12.5 cm cells, the heights each cell is filled at). It is read a few milliseconds a frame, so play never
     stalls. From then on a step that would put her body (16 cm round her axis) through drawn geometry is refused like a wall, by the walk and
     by the route finder alike. What moves (people, cars, trains, boats, anything seen to move), what is not solid (water, light, glows,
     foliage cards) and what is hidden at the moment (the night's stalls by day) is left out. */
  var SOLQ = { cs: 0.125, R: 0.16, s0: 0.45, s1: 1.35, b0: 0.4, st: 0.1, cap: 6000, f: 0, mw: null, mi: null, bb: null, wlT: null, wlL: null, on: true };
  /* the walk tests as the places define them (kept unwrapped for the reading itself) */
  if (typeof TOKYO3D !== 'undefined' && TOKYO3D.walkL && !TOKYO3D.__sq) { SOLQ.wlT = TOKYO3D.walkL; }
  if (typeof LV !== 'undefined' && LV.MOD && LV.MOD.walkL && !LV.MOD.__sq) { SOLQ.wlL = LV.MOD.walkL; }
  function sqMat(m) { if (!m || m.visible === false || m.colorWrite === false || m.depthWrite === false) return 0; if (m.isShaderMaterial || m.isRawShaderMaterial || m.isPointsMaterial || m.isSpriteMaterial || m.isLineBasicMaterial) return 0;
    if (m.alphaTest > 0 || m.blending === THREE.AdditiveBlending) return 0; if (m.transparent) return m.opacity >= 0.5 ? 2 : 0; return 1; }
  /* what is known to move, or is a person */
  function sqExcl(T, R) { var ex = new Set(); PPL.forEach(function (r) { ex.add(r); }); if (luna && luna.root) ex.add(luna.root);
    ['cars', 'trains', 'boats', 'extraCars'].forEach(function (k) { (T[k] || []).forEach(function (c) { if (!c) return; if (c.isObject3D) { ex.add(c); return; } ['root', 'g', 'm', 'mesh', 'group', 'obj', 'body'].forEach(function (q) { var v = c[q]; if (v && v.isObject3D && v !== R && v !== scene) ex.add(v); }); }); });
    if (typeof GS !== 'undefined' && GS) (GS.parked || []).concat(GS.car ? [GS.car] : [], GS.pc ? [GS.pc] : []).forEach(function (C) { if (C && C.V && C.V.root) ex.add(C.V.root); });
    return ex; }
  /* the cells: an open-addressed table of cell keys, each with up to three height ranges (local heights) and the mesh that filled it first */
  /* (heights kept in 2 cm steps; an empty range is -32768) */
  var SQE = -32768;
  function sqNew(cap) { var H = { cap: cap, mask: cap - 1, n: 0, key: new Int32Array(cap), iv: new Int16Array(cap * 6), own: new Uint16Array(cap) }; H.iv.fill(SQE); return H; }
  function sqH(k, m) { return (Math.imul(k, 0x9E3779B1) >>> 0) & m; }
  function sqGrow(H) { var N = sqNew(H.cap * 2), s, j; for (s = 0; s < H.cap; s++) { var k = H.key[s]; if (!k) continue; var d = sqH(k, N.mask); while (N.key[d]) d = (d + 1) & N.mask; N.key[d] = k; N.own[d] = H.own[s]; for (j = 0; j < 6; j++) N.iv[d * 6 + j] = H.iv[s * 6 + j]; N.n++; } return N; }
  function sqPut(G, k, yf, mi) { var H = G.H, y = Math.max(-32000, Math.min(32000, Math.round(yf * 50))); if (H.n > H.cap * 0.6) { if (H.cap >= (1 << 21)) { G.full = true; return; } H = G.H = sqGrow(H); }
    var m = H.mask, s = sqH(k, m), q, b, j; while (true) { q = H.key[s]; if (q === k) break; if (q === 0) { H.key[s] = k; H.own[s] = mi; b = s * 6; H.iv[b] = y; H.iv[b + 1] = y; H.n++; return; } s = (s + 1) & m; }
    b = s * 6; var best = 0, bd = 1e9; for (j = 0; j < 3; j++) { var lo = H.iv[b + 2 * j], hi = H.iv[b + 2 * j + 1]; if (lo === SQE) { H.iv[b + 2 * j] = y; H.iv[b + 2 * j + 1] = y; return; } if (y >= lo - 15 && y <= hi + 15) { if (y < lo) H.iv[b + 2 * j] = y; else if (y > hi) H.iv[b + 2 * j + 1] = y; return; } var dd = y < lo ? lo - y : y - hi; if (dd < bd) { bd = dd; best = j; } }
    if (y < H.iv[b + 2 * best]) H.iv[b + 2 * best] = y; else H.iv[b + 2 * best + 1] = y; }
  function sqCell(G, x, z, y0, y1) { var ix = Math.floor((x - G.x0) / SOLQ.cs), iz = Math.floor((z - G.z0) / SOLQ.cs); if (ix < 0 || iz < 0 || ix >= G.nx || iz >= G.nz) return false;
    var H = G.H, k = ix * G.nz + iz + 1, m = H.mask, s = sqH(k, m), q; while ((q = H.key[s]) !== k) { if (q === 0) return false; s = (s + 1) & m; }
    if (!G.vis[H.own[s]]) return false; var b = s * 6; for (var j = 0; j < 3; j++) { var lo = H.iv[b + 2 * j]; if (lo === SQE) break; if (lo <= y1 && H.iv[b + 2 * j + 1] >= y0) return true; } return false; }
  /* is a body standing on the floor yr at (x, z) (the place's frame) through drawn geometry? */
  function sqBlockL(G, x, z, yr) { if (!G || !G.H || !SOLQ.on) return false; var y0 = (yr + SOLQ.s0) * 50, y1 = (yr + SOLQ.s1) * 50, r = SOLQ.R;
    return sqCell(G, x, z, y0, y1) || sqCell(G, x + r, z, y0, y1) || sqCell(G, x - r, z, y0, y1) || sqCell(G, x, z + r, y0, y1) || sqCell(G, x, z - r, y0, y1); }
  /* the reading: started when a place is first walked, then a few milliseconds a frame */
  function sqStart(T) { var R = (TK && TK.T === T && TK.g) || T.root; if (!R || !T.walk || !T.walk.length || !T.toL) return null; var lv = !!T.navF, NB = lv ? null : navBuckets(T);
    var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; T.walk.forEach(function (r) { x0 = Math.min(x0, r[0]); x1 = Math.max(x1, r[1]); z0 = Math.min(z0, r[2]); z1 = Math.max(z1, r[3]); });
    var nx = Math.ceil((x1 - x0) / SOLQ.cs) + 2, nz = Math.ceil((z1 - z0) / SOLQ.cs) + 2; if (nx * nz > 2e9) return null;
    /* the floors' span (the cities: the street and every raised floor and ramp; the portal places follow their ground) */ var fl0 = 0, fl1 = 0; (T.raised || []).forEach(function (r) { fl0 = Math.min(fl0, r[4]); fl1 = Math.max(fl1, r[4]); }); (T.ramps || []).forEach(function (q) { fl0 = Math.min(fl0, q[4], q[5]); fl1 = Math.max(fl1, q[4], q[5]); });
    /* the world-to-place map (a shift and maybe a turn of the plan): three points of T.toL */ var a = T.toL(0, 0), b = T.toL(1, 0), c = T.toL(0, 1);
    var ex = sqExcl(T, R), M = [], K = []; R.updateMatrixWorld(true);
    R.traverse(function (o) { if (!o.isMesh || o.isSkinnedMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return; if (o.userData && o.userData.noSolid) return; var mt = Array.isArray(o.material) ? o.material[0] : o.material, k = sqMat(mt); if (!k) return;
      for (var p = o; p && p !== R; p = p.parent) if (ex.has(p)) return; M.push(o); K.push(k); });
    /* nearest first: the meshes ordered by how far their middle lies from her (a mesh over the whole place counts as here) */
    var od = M.map(function (o, i) { var g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); var c2 = g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld), r2 = g.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis(); return [Math.max(0, Math.hypot(c2.x - pos.x, c2.z - pos.z) - r2), i]; }).sort(function (p1, p2) { return p1[0] - p2[0]; });
    M = od.map(function (q) { return M[q[1]]; }); K = od.map(function (q) { return K[q[1]]; });
    var Lc = T.toL(pos.x, pos.z), RW = lv ? 110 : 1e9; if (lv) { x0 = Math.max(x0, Lc[0] - RW); x1 = Math.min(x1, Lc[0] + RW); z0 = Math.max(z0, Lc[1] - RW); z1 = Math.min(z1, Lc[1] + RW); nx = Math.ceil((x1 - x0) / SOLQ.cs) + 2; nz = Math.ceil((z1 - z0) / SOLQ.cs) + 2; }
    var G = { T: T, lv: lv, NB: NB, c: Lc, x0: x0 - SOLQ.cs, z0: z0 - SOLQ.cs, x1: x1, z1: z1, nx: nx, nz: nz, ylo: lv ? -1e9 : fl0 + 0.3, yhi: lv ? 1e9 : fl1 + SOLQ.s1 + 0.1, A: [a[0], b[0] - a[0], c[0] - a[0], a[1], b[1] - a[1], c[1] - a[1]], Y: T.Y,
      H: sqNew(1 << 15), M: M.length > 65000 ? M.slice(0, 65000) : M, K: K, dyn: new Uint8Array(M.length), vis: new Uint8Array(M.length + 1), m0: M.map(function (o) { return o.isInstancedMesh ? null : Float32Array.from(o.matrixWorld.elements); }), v0: M.map(function (o) { return o.isInstancedMesh ? o.instanceMatrix.version : -1; }),
      mi: 0, ki: 0, ti: 0, e: new Float64Array(16), fc: lv ? new Map() : null, wc: lv ? new Map() : null, done: false, t0: performance.now(), ms: 0, tri: 0, trs: 0, sam: 0, lastK: -1, lastF: [], skipI: false };
    G.vis.fill(1); return G; }
  /* the floors she could stand on at a point, and whether she may (the place's own test, unwrapped) */
  /* a portal place's floors, kept for each half metre while it is read */
  function sqLvF(G, x, z) { var T = G.T, fk = Math.floor(x * 2) * 100003 + Math.floor(z * 2), FC = G.fc, fl = FC && FC.get(fk); if (!fl) { fl = T.floorsFn ? T.floorsFn(x, z) : [T.gfn(x, z, 99)]; if (FC) { if (FC.size > 400000) FC.clear(); FC.set(fk, fl); } } return fl; }
  function sqFloors(G, x, z, out) { out.length = 0; var T = G.T, fl, i;
    if (G.lv) { fl = sqLvF(G, x, z); var WC = G.wc, bx = Math.floor(x * 4) * 100003 + Math.floor(z * 4); for (i = 0; i < fl.length; i++) { var wk = bx * 64 + (Math.round(fl[i] * 20) & 63), wv = WC.get(wk); if (wv === undefined) { wv = SOLQ.wlL.call(LV.MOD, T, x, z, fl[i]); if (WC.size > 600000) WC.clear(); WC.set(wk, wv); } if (wv) out.push(fl[i]); } return out; }
    var bk = G.NB.at(x, z); if (!bk) return out; fl = TOKYO3D.floorsL(bk, x, z); for (i = 0; i < fl.length; i++) if (SOLQ.wlT.call(TOKYO3D, bk, x, z, fl[i], bk.c, bk.w)) out.push(fl[i]); return out; }
  function sqRel(G, x, z, ya, yb) { var f = sqFloors(G, x, z, SOLQ.tmp || (SOLQ.tmp = [])); for (var i = 0; i < f.length; i++) if (yb >= f[i] + SOLQ.b0 && ya <= f[i] + SOLQ.s1 + 0.1) return true; return false; }
  var SQV = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
  function sqTri(G, P, I, t, mi, kind) { var e = G.e, A = G.A, j, V = SQV;
    for (j = 0; j < 3; j++) { var ix = I ? I.getX(3 * t + j) : 3 * t + j, px = P.getX(ix), py = P.getY(ix), pz = P.getZ(ix), wx = e[0] * px + e[4] * py + e[8] * pz + e[12], wy = e[1] * px + e[5] * py + e[9] * pz + e[13], wz = e[2] * px + e[6] * py + e[10] * pz + e[14];
      V[j][0] = A[0] + A[1] * wx + A[2] * wz; V[j][1] = wy - G.Y; V[j][2] = A[3] + A[4] * wx + A[5] * wz; }
    var a = V[0], b = V[1], c = V[2], yl = Math.min(a[1], b[1], c[1]), yh = Math.max(a[1], b[1], c[1]); if (yh < G.ylo || yl > G.yhi) return;
    var xl = Math.min(a[0], b[0], c[0]), xh = Math.max(a[0], b[0], c[0]), zl = Math.min(a[2], b[2], c[2]), zh = Math.max(a[2], b[2], c[2]); if (xh < G.x0 || xl > G.x1 || zh < G.z0 || zl > G.z1) return;
    var e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2], e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2], nxv = e1y * e2z - e1z * e2y, nyv = e1z * e2x - e1x * e2z, nzv = e1x * e2y - e1y * e2x, nl = Math.hypot(nxv, nyv, nzv); if (nl < 1e-9) return;
    if (kind === 2 && Math.abs(nyv) > 0.7 * nl) return; /* see-through and lying flat: water, not a pane */
    /* lying flat: a thing only if it stands well clear of a floor she could stand on below it (a table, a counter, a platform's top seen from the
       street beside it); a ground, a road, a deck, a paving a hand's breadth off the plan's ground is a floor, not a thing to bump into */
    var flat = Math.abs(nyv) > 0.85 * nl, hb = flat ? 0.6 : SOLQ.b0, big = Math.max(Math.max(a[0], b[0], c[0]) - Math.min(a[0], b[0], c[0]), Math.max(a[2], b[2], c[2]) - Math.min(a[2], b[2], c[2])) > 3;
    if (flat && !big) { var my = (a[1] + b[1] + c[1]) / 3, wf = sqFloors(G, (a[0] + b[0] + c[0]) / 3, (a[2] + b[2] + c[2]) / 3, SOLQ.tmp2 || (SOLQ.tmp2 = [])), keep = false; for (j = 0; j < wf.length; j++) { var hh = my - wf[j]; if (hh >= 0.6 && hh <= SOLQ.s1 + 0.1) keep = true; } if (!keep) return; }
    /* near a floor she could stand on at all (four corners and the middle of its footprint)? */ var mx = (xl + xh) / 2, mz = (zl + zh) / 2;
    var rel = sqRel(G, mx, mz, yl, yh) || sqRel(G, xl, zl, yl, yh) || sqRel(G, xh, zl, yl, yh) || sqRel(G, xl, zh, yl, yh) || sqRel(G, xh, zh, yl, yh) || sqRel(G, a[0], a[2], yl, yh) || sqRel(G, b[0], b[2], yl, yh) || sqRel(G, c[0], c[2], yl, yh);
    /* a large one (a platform's top, a long wall) is looked over every two units, not only at its corners */ if (!rel && (xh - xl > 3 || zh - zl > 3)) { var nn = Math.min(24, Math.ceil(Math.max(xh - xl, zh - zl) / 2)), i3, j3; for (i3 = 0; i3 <= nn && !rel; i3++) for (j3 = 0; j3 <= nn - i3 && !rel; j3++) { var px3 = a[0] + e1x * i3 / nn + e2x * j3 / nn, pz3 = a[2] + e1z * i3 / nn + e2z * j3 / nn, py3 = a[1] + e1y * i3 / nn + e2y * j3 / nn; rel = sqRel(G, px3, pz3, py3 - 0.05, py3 + 0.05); } }
    if (!rel) return;
    G.trs++;
    /* sampled from the vertex facing the longest edge; the inner run along the steeper side (a wall's cells are then met one after another) */
    var dab = e1x * e1x + e1y * e1y + e1z * e1z, dac = e2x * e2x + e2y * e2y + e2z * e2z, dbc = (c[0] - b[0]) * (c[0] - b[0]) + (c[1] - b[1]) * (c[1] - b[1]) + (c[2] - b[2]) * (c[2] - b[2]), o = a, p = b, q = c;
    if (dab >= dac && dab >= dbc) { o = c; p = a; q = b; } else if (dac >= dab && dac >= dbc) { o = b; p = a; q = c; }
    var u = [p[0] - o[0], p[1] - o[1], p[2] - o[2]], w = [q[0] - o[0], q[1] - o[1], q[2] - o[2]], lu = Math.hypot(u[0], u[1], u[2]), lw = Math.hypot(w[0], w[1], w[2]); if (Math.abs(u[1]) / (lu || 1) > Math.abs(w[1]) / (lw || 1)) { var tt = u; u = w; w = tt; tt = lu; lu = lw; lw = tt; }
    var st = SOLQ.st, n1 = Math.max(1, Math.ceil(lu / st)), n2 = Math.max(1, Math.ceil(lw / st)), cs = SOLQ.cs, nz = G.nz, i2, j2, F = G.lastF;
    for (i2 = 0; i2 <= n1; i2++) { var fu = i2 / n1, jm = Math.floor(n2 * (1 - fu) + 1e-6); for (j2 = 0; j2 <= jm; j2++) { var fw = j2 / n2, x = o[0] + u[0] * fu + w[0] * fw, y = o[1] + u[1] * fu + w[1] * fw, z = o[2] + u[2] * fu + w[2] * fw; G.sam++;
        if (y < G.ylo || y > G.yhi) continue; var cx = Math.floor((x - G.x0) / cs), cz = Math.floor((z - G.z0) / cs); if (cx < 0 || cz < 0 || cx >= G.nx || cz >= nz) continue; var k = cx * nz + cz + 1;
        if (k !== G.lastK) { G.lastK = k; sqFloors(G, x, z, F); } for (var f = 0; f < F.length; f++) { var h = y - F[f]; if (h >= hb && h <= SOLQ.s1 + 0.1) { sqPut(G, k, y, mi); break; } } } } }
  function sqRun(G, ms) { var t0 = performance.now(), M = G.M, cnt = 0, mw = SOLQ.mw || (SOLQ.mw = new THREE.Matrix4()), m4 = SOLQ.mi || (SOLQ.mi = new THREE.Matrix4()), bb = SOLQ.bb || (SOLQ.bb = new THREE.Box3());
    while (G.mi < M.length) { var o = M[G.mi], g = o.geometry, P = g.attributes.position, I = g.index, nI = o.isInstancedMesh ? o.count : 1, nT = ((I ? I.count : P.count) / 3) | 0;
      if (G.ti === 0) { if (o.isInstancedMesh) { o.getMatrixAt(G.ki, m4); mw.multiplyMatrices(o.matrixWorld, m4); } else mw.copy(o.matrixWorld); G.e.set(mw.elements);
        if (!g.boundingBox) g.computeBoundingBox(); bb.copy(g.boundingBox).applyMatrix4(mw); var by0 = bb.min.y - G.Y, by1 = bb.max.y - G.Y, A = G.A, cx0 = A[0] + A[1] * bb.min.x + A[2] * bb.min.z, cx1 = A[0] + A[1] * bb.max.x + A[2] * bb.max.z, cz0 = A[3] + A[4] * bb.min.x + A[5] * bb.min.z, cz1 = A[3] + A[4] * bb.max.x + A[5] * bb.max.z;
        G.skipI = by1 < G.ylo || by0 > G.yhi || Math.max(cx0, cx1) < G.x0 || Math.min(cx0, cx1) > G.x1 || Math.max(cz0, cz1) < G.z0 || Math.min(cz0, cz1) > G.z1;
        if (!G.skipI && Math.abs(cx1 - cx0) < 12 && Math.abs(cz1 - cz0) < 12) { var qx0 = Math.min(cx0, cx1), qx1 = Math.max(cx0, cx1), qz0 = Math.min(cz0, cz1), qz1 = Math.max(cz0, cz1), qm = (qx0 + qx1) / 2, qn = (qz0 + qz1) / 2; G.skipI = !(sqRel(G, qm, qn, by0, by1) || sqRel(G, qx0, qz0, by0, by1) || sqRel(G, qx1, qz0, by0, by1) || sqRel(G, qx0, qz1, by0, by1) || sqRel(G, qx1, qz1, by0, by1) || sqRel(G, qm, qz0, by0, by1) || sqRel(G, qm, qz1, by0, by1) || sqRel(G, qx0, qn, by0, by1) || sqRel(G, qx1, qn, by0, by1)); } }
      if (G.ms + performance.now() - t0 > SOLQ.cap) { G.capped = true; G.mi = M.length; break; }
      if (!G.skipI) while (G.ti < nT) { sqTri(G, P, I, G.ti, G.mi, G.K[G.mi]); G.ti++; G.tri++; if ((++cnt & 31) === 0 && performance.now() - t0 > ms) { G.ms += performance.now() - t0; return; } }
      G.ti = 0; G.ki++; if (G.ki >= nI) { G.ki = 0; G.mi++; } if ((++cnt & 31) === 0 && performance.now() - t0 > ms) { G.ms += performance.now() - t0; return; } }
    G.ms += performance.now() - t0; G.done = true; G.fc = null; G.wc = null; G.tDone = performance.now(); sqDyn(G); sqVis(G); }
  /* what is shown now, and what has been seen to move since it was read (then it is no wall) */
  function sqVis(G) { for (var i = 0; i < G.M.length; i++) { var v = !G.dyn[i]; if (v) for (var p = G.M[i]; p; p = p.parent) { if (!p.visible) { v = false; break; } if (p === scene) break; } G.vis[i] = v ? 1 : 0; } }
  function sqDyn(G) { for (var i = 0; i < G.M.length; i++) { if (G.dyn[i]) continue; var o = G.M[i]; if (o.isInstancedMesh) { if (o.instanceMatrix.version !== G.v0[i]) G.dyn[i] = 1; continue; } var a = o.matrixWorld.elements, b = G.m0[i]; for (var j = 12; j < 15; j++) if (Math.abs(a[j] - b[j]) > 2e-3) { G.dyn[i] = 1; break; } if (!G.dyn[i]) for (j = 0; j < 11; j++) if (Math.abs(a[j] - b[j]) > 2e-3) { G.dyn[i] = 1; break; } } }
  /* the reading's share of a frame: what is left under a thirtieth of a second, at most 5 ms (3 on a phone), at least 1 */
  function sqBud() { var b = COARSE ? 3 : 5; if (typeof GV !== 'undefined' && GV.fps > 1) b = Math.max(1, Math.min(b, (1000 / 30 - 1000 / GV.fps) * 0.6)); return b; }
  function sqTick() { SOLQ.f++; if (!TK || !TK.T || !(LVL.on || CITYW || TKW) || travel || fall) return; var T = TK.T, G = T.__sq;
    if (G === undefined) { try { G = sqStart(T); } catch (e) { G = null; if (window.console) console.error('solid read', e); if (window.ISLE_TEST) throw e; } T.__sq = G || null; if (!G) return; }
    if (!G) return;
    /* a portal place: gone far from where it was read, it is read again round her (the old reading serves until the new one is whole) */ if (G.done && G.lv && !T.__sqN) { var Lh = T.toL(pos.x, pos.z); if (Math.hypot(Lh[0] - G.c[0], Lh[1] - G.c[1]) > 70) { try { T.__sqN = sqStart(T); } catch (e) { T.__sqN = null; } } }
    var N = T.__sqN; if (N) { if (!N.done) { try { sqRun(N, window.ISLE_SQMS || sqBud()); } catch (e) { N.done = true; N.fail = String(e); } } if (N.done) { T.__sq = N; T.__sqN = null; G = N; } }
    if (!G.done) { var bud = window.ISLE_SQMS || sqBud(); try { sqRun(G, bud); } catch (e) { G.done = true; G.fail = String(e); if (window.console) console.error('solid read', e); if (window.ISLE_TEST) throw e; } }
    if (SOLQ.f % 15 === 0) sqVis(G); if (SOLQ.f % 45 === 0) sqDyn(G); }
  /* a place left behind lets its reading go (it is read again, in the background, when she comes back) */
  var _tkUseSQ = tkUse; tkUse = function (c) { var old = TK; _tkUseSQ.apply(this, arguments); if (old && old !== TK && old.T && (old.T.__sq || old.T.__sqN)) { old.T.__sq = undefined; old.T.__sqN = null; } };
  var _build3dSQ = build3d; build3d = function () { var r = _build3dSQ.apply(this, arguments); if (r && W && !W.__sq) { W.__sq = true; var eu = W.envUpdate; W.envUpdate = function () { try { sqTick(); } catch (e) { if (window.ISLE_TEST) throw e; } return eu.apply(W, arguments); }; } return r; };
  /* the walk tests, with the drawn geometry: the place's own (the step, the camera's routes) and the route finder's */
  if (SOLQ.wlT) { TOKYO3D.walkL = function (T, x, z, yr, cols, walks) { if (!SOLQ.wlT.apply(TOKYO3D, arguments)) return false; var G = T.__sq || (!T.walk && TK && TK.T && TK.T.__sq) || null; return !(G && sqBlockL(G, x, z, yr == null ? 0.14 : yr)); }; TOKYO3D.__sq = true;
    var _wkT = TOKYO3D.walkable; TOKYO3D.walkable = function (T, wx, wz, y) { if (!_wkT.apply(TOKYO3D, arguments)) return false; var G = T.__sq; if (!G) return true; var L = T.toL(wx, wz); return !sqBlockL(G, L[0], L[1], y == null ? 0.14 : y - T.Y); }; }
  if (SOLQ.wlL) { LV.MOD.walkL = function (T, x, z, yr) { if (!SOLQ.wlL.apply(LV.MOD, arguments)) return false; var G = T.__sq; return !(G && sqBlockL(G, x, z, yr)); }; LV.MOD.__sq = true; }
  /* she is inside drawn geometry (put there by a step of the story, or the reading arrived round her): she steps out (see unstick) */
  var _stuckAO = stuckAt; stuckAt = function (x, z) { if (_stuckAO(x, z)) return true; var T = TK && TK.T, G = T && T.__sq; if (!G || !G.H || !inTK(x, z)) return false; var L = T.toL(x, z); return sqBlockL(G, L[0], L[1], pos.y - T.Y); };
  window.ISLE_x.sqAt = function () { var T = TK.T, G = T.__sq, L = T.toL(pos.x, pos.z), yr = pos.y - T.Y, out = [], r = SOLQ.R; if (!G) return null;
    [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].forEach(function (d) { var x = L[0] + d[0], z = L[1] + d[1], ix = Math.floor((x - G.x0) / SOLQ.cs), iz = Math.floor((z - G.z0) / SOLQ.cs), H = G.H, k = ix * G.nz + iz + 1, s2 = sqH(k, H.mask), q; while ((q = H.key[s2]) !== k && q !== 0) s2 = (s2 + 1) & H.mask; if (q !== k) { out.push(null); return; }
      var o = G.M[H.own[s2]], g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); var sz = new THREE.Vector3(); g.boundingBox.getSize(sz); var iv = []; for (var j = 0; j < 3; j++) { var lo = H.iv[s2 * 6 + 2 * j]; if (lo === SQE) break; iv.push([+(lo / 50 - yr).toFixed(2), +(H.iv[s2 * 6 + 2 * j + 1] / 50 - yr).toFixed(2)]); }
      var m = Array.isArray(o.material) ? o.material[0] : o.material; out.push({ iv: iv, own: [o.type, sz.toArray().map(function (v) { return +v.toFixed(1); }).join('x'), m.color ? m.color.getHexString() : '-', m.type, o.name || (o.parent && o.parent.name) || ''] }); }); return { yr: +yr.toFixed(2), cells: out }; };
  window.ISLE_x.sq = function (k) { var T = TK && TK.T, G = T && T.__sq; if (k === 'dyn' && G) { var out = []; G.M.forEach(function (o, i) { if (!G.dyn[i]) return; var g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); var sz = new THREE.Vector3(); g.boundingBox.getSize(sz); var nm = []; for (var q = o; q && q !== scene && nm.length < 3; q = q.parent) if (q.name) nm.push(q.name); out.push([o.isInstancedMesh ? 'I' + o.count : 'M', sz.toArray().map(function (v) { return +v.toFixed(1); }).join('x'), nm.join('<'), (Array.isArray(o.material) ? o.material[0] : o.material).color ? (Array.isArray(o.material) ? o.material[0] : o.material).color.getHexString() : '-']); }); return out; } if (k === 'off') SOLQ.on = false; if (k === 'on') SOLQ.on = true; if (k === 'run' && G) { while (!G.done) sqRun(G, 1e9); } if (!G) return { none: true, id: TK && TK.id };
    var nd = 0; for (var i = 0; i < G.dyn.length; i++) nd += G.dyn[i]; return { id: TK.id, done: G.done, fail: G.fail || null, meshes: G.M.length, mi: G.mi, tri: G.tri, trs: G.trs, sam: G.sam, cells: G.H.n, cap: G.H.cap, ms: Math.round(G.ms), wall: G.tDone ? Math.round(G.tDone - G.t0) : null, dyn: nd, full: !!G.full, capped: !!G.capped, here: (function () { var L = T.toL(pos.x, pos.z); return sqBlockL(G, L[0], L[1], pos.y - T.Y); })() }; };
  /* (v65) the cars: the traffic (standing at a light or moving off), a parked one of the street play, the police car — she is held a body's
     width off their sides, along the shorter way out, never pushed into a wall (then she keeps her place) */
  function carPush(px0, pz0) { if (!TK || !TK.T || !inTK(pos.x, pos.z)) return false; var T = TK.T, L = [], moved = false, i;
    (T.cars || []).forEach(function (V) { if (!V || !V.root || !V.root.visible || V.mode === 'wait' || V.L == null || V.W == null) return; var w; try { w = trafficW(V); } catch (e) { return; } L.push([w.x, w.z, w.h, V.L, V.W, V.root]); });
    if (typeof GS !== 'undefined' && GS && GS.built && gsOn()) (GS.parked || []).concat(GS.pc ? [GS.pc] : []).forEach(function (C) { if (C && C.V && C.V.root && C.V.root.visible && C.V.L) L.push([C.x, C.z, C.h, C.V.L, C.V.W, C.V.root]); });
    for (i = 0; i < L.length; i++) { var c = L[i], dx = pos.x - c[0], dz = pos.z - c[1]; if (Math.abs(dx) > 7 || Math.abs(dz) > 7) continue; if (Math.abs(c[5].matrixWorld.elements[13] - pos.y) > 1.4) continue;
      var s = Math.sin(c[2]), co = Math.cos(c[2]), al = dx * s + dz * co, sd = dx * co - dz * s, hl = c[3] / 2 + 0.22, hw = c[4] / 2 + 0.22; if (Math.abs(al) >= hl || Math.abs(sd) >= hw) continue;
      if (hl - Math.abs(al) < hw - Math.abs(sd)) al = (al >= 0 ? 1 : -1) * hl; else sd = (sd >= 0 ? 1 : -1) * hw;
      var nx = c[0] + al * s + sd * co, nz = c[1] + al * co - sd * s; if (walkable(nx, nz)) { pos.x = nx; pos.z = nz; } else { pos.x = px0; pos.z = pz0; } moved = true; }
    return moved; }
  var _moveAO = move; move = function (dt) { var px0 = pos.x, pz0 = pos.z; _moveAO(dt); if (!pplFree()) return; var m = false; try { m = carPush(px0, pz0); } catch (e) { if (window.ISLE_TEST) throw e; } if (m) { pos.y = groundY(pos.x, pos.z); luna.root.position.copy(pos); } };
