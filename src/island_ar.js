/* ===== [island_ar.js] ===== */
  /* ================= (v70) between the floors of the stations, the lens never behind a surface =================
     The follow camera kept its arm clear of the boxes each city registers as solid, and the see-through cut (island_ag) opened a body-wide hole round her
     where something was still in the way. On the stairs and escalators between floors that was not enough: the slab of the floor above or below, the
     soffit over an escalator, its side panels and its handrails were not boxes, so the lens sat behind them — she showed through a hole, and the floor
     she was going to did not show at all.
     Now the arm is also measured against the stations' own geometry: every opaque surface of the city is given a bounding-volume tree (three-mesh-bvh,
     built a few meshes per frame as the city is entered), and each arm the camera considers is cast from her chest and from the top of her head —
     the first surface on it, less 0.3 m, is as far as the lens may go; the slabs of the floors are tested from the floors themselves as well (a lens
     whose line to her crosses a floor's 0.5 m depth is blocked); and where the lens comes to rest it keeps 0.34 m from anything beside it (a handrail
     just by the lens filled the picture), stepping away from it and, if that is not enough, in along the arm. ================= */
  var CBV = { ok: typeof MeshBVHLib !== 'undefined' && !!MeshBVHLib.acceleratedRaycast, C: {}, cur: null, rc: new THREE.Raycaster(), o: new THREE.Vector3(), d: new THREE.Vector3(), n: 0, ms: 0 };
  if (CBV.ok) { THREE.Mesh.prototype.raycast = MeshBVHLib.acceleratedRaycast; CBV.rc.firstHitOnly = true; }
  function cbvMat(o) { var m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.visible === false) return false; if (m.isMeshToonMaterial) return false; /* (v70) the people of the city (drawn in toon shading) are not walls: one walking past behind her snapped the arm onto her */ if (m.transparent && (m.opacity < 0.6 || m.depthWrite === false)) return false; if (m.colorWrite === false || m.depthTest === false) return false; return true; }
  function cbvPrep(id) { if (!CBV.ok || !id || CBV.C[id]) return CBV.C[id] || null; var C = CITY[id]; if (!C || !C.g) return null; var L = [];
    C.g.traverse(function (o) { if (o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !o.userData.ink && o.geometry && o.geometry.attributes && o.geometry.attributes.position && o.geometry.attributes.position.count >= 3 && cbvMat(o)) L.push(o); });
    return (CBV.C[id] = { id: id, all: L, i: 0, done: false, vis: [] }); }
  /* the trees, a few meshes at a time (about 6 ms of a frame), so entering a city does not stall */
  function cbvStep(E, budget) { if (!E || E.done) return; var t0 = performance.now(); while (E.i < E.all.length && performance.now() - t0 < budget) { var m = E.all[E.i++]; try { if (!m.geometry.boundsTree) m.geometry.boundsTree = new MeshBVHLib.MeshBVH(m.geometry, { maxLeafTris: 10 }); } catch (e) {} } if (E.i >= E.all.length) E.done = true; }
  function cbvVis(E) { E.vis.length = 0; for (var i = 0; i < E.all.length; i++) { var o = E.all[i], q = o, v = true; while (q) { if (!q.visible) { v = false; break; } q = q.parent; } if (v && o.geometry.boundsTree) E.vis.push(o); } }
  /* the first opaque surface along a ray (world), or far */
  function cbvRay(ox, oy, oz, dx, dy, dz, far) { var E = CBV.cur; if (!E || !E.vis.length) return far; var l = Math.hypot(dx, dy, dz) || 1, best = far, i; CBV.o.set(ox, oy, oz); CBV.d.set(dx / l, dy / l, dz / l); CRW.set(CBV.o, CBV.d); CBV.n++;
    /* both faces count: a panel seen from the lens's side hides her whether or not it faces her */
    for (i = 0; i < E.vis.length; i++) { var m = E.vis[i], g = m.geometry, u = m.userData; if (!g.boundingSphere) g.computeBoundingSphere(); if (u.cbvF !== CBV.f) { u.cbvF = CBV.f; u.cbvS = (u.cbvS || new THREE.Sphere()).copy(g.boundingSphere).applyMatrix4(m.matrixWorld); (u.cbvI = u.cbvI || new THREE.Matrix4()).copy(m.matrixWorld).invert(); }
      var S = u.cbvS; if (S.center.distanceTo(CBV.o) - S.radius > best || !CRW.intersectsSphere(S)) continue; CRL.copy(CRW).applyMatrix4(u.cbvI); var h = g.boundsTree.raycastFirst(CRL, THREE.DoubleSide); if (h) { CRV.copy(h.point).applyMatrix4(m.matrixWorld); var dd = CRV.distanceTo(CBV.o); if (dd < best) best = dd; } }
    return best; }
  var CRW = new THREE.Ray(), CRL = new THREE.Ray(), CRV = new THREE.Vector3(); CBV.f = 0;
  /* for the arm (local coordinates of the city, which share the world's axes): how far from her chest and her head the lens may go along dv */
  function camMesh(o, oh, dv, far) { var T = TK.T; if (!CBV.cur || !CBV.cur.vis.length) return far + 1; var a = T.toW(o[0], o[1], o[2]), b = T.toW(oh[0], oh[1], oh[2]), k = T.toW(o[0], o[1] - 0.5, o[2]); /* her chest, the top of her head, her knees: all of her in sight, not her head alone over a slab's edge */
    /* (v70) a point of her that is itself touching something (her knees at the comb of an escalator's head, against a step's nosing) says nothing about the way out: a hit nearer than 0.25 m is not counted */
    var r = [cbvRay(a.x, a.y, a.z, dv[0], dv[1], dv[2], far + 0.5), cbvRay(b.x, b.y, b.z, dv[0], dv[1], dv[2], far + 0.5), cbvRay(k.x, k.y, k.z, dv[0], dv[1], dv[2], far + 0.5)], m = far + 1; for (var i = 0; i < 3; i++) if (r[i] >= 0.25 && r[i] < m) m = r[i]; return m; }
  /* (v70) from where the lens would be, all of her in sight: rays from it to her knees, her chest and the top of her head (local coordinates), each clear to
     within 0.25 m of her; a lens just over the edge of a floor sees her head but not her body, and that is a lens behind a surface too */
  function camSee(o, cq) { var T = TK.T; if (!CBV.cur || !CBV.cur.vis.length) return true; var c = T.toW(cq[0], cq[1], cq[2]), P = [[o[0], o[1] - 0.5, o[2]], [o[0], o[1], o[2]], [o[0], o[1] + 0.38, o[2]]];
    for (var i = 0; i < P.length; i++) { var w = T.toW(P[i][0], P[i][1], P[i][2]), dx = w.x - c.x, dy = w.y - c.y, dz = w.z - c.z, L = Math.hypot(dx, dy, dz); if (L < 0.4) continue; if (cbvRay(c.x, c.y, c.z, dx, dy, dz, L) < L - 0.25) return false; } return true; }
  /* a floor's slab between her head and the lens (from the floors themselves; no tree needed) */
  function tkSlab(a0, c) { return tkSlab1(a0, c) || tkSlab1([a0[0], a0[1] - 0.88, a0[2]], c); } /* from her head and from her knees */
  function tkSlab1(a, c) { var T = TK.T, n = 12, j, m; for (j = 2; j <= n; j++) { var u = j / n, px = a[0] + (c[0] - a[0]) * u, py = a[1] + (c[1] - a[1]) * u, pz = a[2] + (c[2] - a[2]) * u, fl = TKM.floorsL(T, px, pz); for (m = 0; m < fl.length; m++) if (py < fl[m] - 0.02 && py > fl[m] - 0.5) return true; } return false; }
  /* where the lens rests: room round it, and her head still in sight from it */
  var CRD = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [0.7, 0, 0.7], [-0.7, 0, 0.7], [0.7, 0, -0.7], [-0.7, 0, -0.7]], CRP = new THREE.Vector3(), CRH = new THREE.Vector3();
  function camRoom(cp, hx, hy, hz) { if (!CBV.cur || !CBV.cur.vis.length) return; var R0 = 0.34, k, i; for (k = 0; k < 2; k++) { CRP.set(0, 0, 0); var any = false; for (i = 0; i < CRD.length; i++) { var d = CRD[i], h = cbvRay(cp.x, cp.y, cp.z, d[0], d[1], d[2], R0); if (h < R0) { var l = Math.hypot(d[0], d[1], d[2]); CRP.x -= d[0] / l * (R0 - h); CRP.y -= d[1] / l * (R0 - h); CRP.z -= d[2] / l * (R0 - h); any = true; } } if (!any) break; if (CRP.length() > 0.3) CRP.setLength(0.3); cp.add(CRP); }
    /* and nothing between her head and the lens after the step: else the lens comes in along the line, short of it */ CRH.set(cp.x - hx, cp.y - hy, cp.z - hz); var L = CRH.length(); if (L < 0.5) return; var hh = cbvRay(hx, hy, hz, CRH.x, CRH.y, CRH.z, L); if (hh < L - 0.05) { var t = Math.max(0.45, hh - 0.3) / L; cp.set(hx + CRH.x * t, hy + CRH.y * t, hz + CRH.z * t); } }
  /* each frame in a city: its trees built on, the visible list refreshed */
  var _tkTickAR = tkTick; tkTick = function (dt) { var r = _tkTickAR.apply(this, arguments); CBV.f++; try { if (TK && CBV.ok) { var E = cbvPrep(TK.id); CBV.cur = E; if (E) { cbvStep(E, E.done ? 0 : 6); var G = TK.T && TK.T.G, sg = ''; if (G) for (var gk in G) sg += G[gk] && G[gk].visible ? '1' : '0'; var cp = cam.position, jumped = !E.vP || Math.abs(cp.x - E.vP[0]) + Math.abs(cp.y - E.vP[1]) + Math.abs(cp.z - E.vP[2]) > 6;
        /* (v70) at once when a level of the city is drawn or hidden or the lens has jumped (a stair's foot after a ride, a fast trip): a list left over from elsewhere let the lens into surfaces it did not know, then snapped it onto her */
        if (!E.vF || --E.vF <= 0 || sg !== E.vS || jumped) { cbvVis(E); E.vF = 15; E.vS = sg; E.vP = [cp.x, cp.y, cp.z]; } } } } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  var _tkCameraAR = tkCamera; tkCamera = function (dt, snap) { if (snap && CBV.cur && CBV.ok) { try { cbvVis(CBV.cur); } catch (e) {} } return _tkCameraAR.apply(this, arguments); };
  window.ISLE_x.cbv = function () { var E = CBV.cur; return { ok: CBV.ok, id: E && E.id, n: E ? E.all.length : 0, built: E ? E.i : 0, done: !!(E && E.done), vis: E ? E.vis.length : 0, rays: CBV.n }; };
