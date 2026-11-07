/* ===== [island_an.js] ===== */
  /* ================= (v65) nobody walks through anybody, nor through the furniture; and Okachimachi's moves everywhere in Taiwan =================
     Every person the island builds (the passers-by of every city and place, the bar's regulars and its bartender, the vendors, the guides, Max)
     is registered once; whoever stands within half a metre of Luna holds her off, and she slides round them — in every city map, in Kenting
     and at Sun Moon Lake, on the island. The solid things of the city maps (counters, tables, booths, walls, machines) were tested at a single
     point, so half of her went into them: she is now held a body's width off (a soft push, never a wall in a narrow passage), and if anything
     ever sets her down inside a thing (a scripted step, a talk spot), she steps out to the nearest free ground at once.
     The street play — the five styles, the super moves, the overclock and the overload, the jump, the talk, the cars, the phone — now goes with
     her into the portal places as well (Kenting, Sun Moon Lake); there is no police box there, so nobody calls the police. */
  var PPL = [];
  (function () { if (typeof LUNA !== 'undefined' && LUNA.build && !LUNA.__ppl) { var b0 = LUNA.build; LUNA.build = function (kind) { var A = b0.apply(LUNA, arguments); if (kind !== 'luna' && A && A.root) PPL.push(A.root); return A; }; LUNA.__ppl = true; }
    if (typeof MAX !== 'undefined' && !MAX.__ppl) { ['build', 'buildOL'].forEach(function (k) { if (typeof MAX[k] !== 'function') return; var m0 = MAX[k]; MAX[k] = function () { var A = m0.apply(MAX, arguments); if (A && A.root) PPL.push(A.root); return A; }; }); MAX.__ppl = true; } })();
  function pplShown(o) { for (var p = o; p; p = p.parent) { if (!p.visible) return false; if (p === scene) return true; } return false; }
  function pplFree() { return !travel && !fall && VEH.kind === 'walk' && luna.root.visible && !(typeof GS !== 'undefined' && GS && (GS.car || GS.arrest)) && mode !== 'dive'; }
  /* the people: half a metre each way, the push along the line between them (or back along her step when she stands right on someone) */
  function pplPush(px0, pz0) { var R = 0.5, moved = false, i, n = PPL.length; for (i = 0; i < n; i++) { var r = PPL[i], e = r.matrixWorld.elements, dx = pos.x - e[12], dz = pos.z - e[14]; if (dx * dx + dz * dz >= R * R || Math.abs(e[13] - pos.y) > 1.3 || !pplShown(r)) continue;
      var d = Math.hypot(dx, dz); if (d < 1e-4) { dx = pos.x - px0; dz = pos.z - pz0; d = Math.hypot(dx, dz); if (d < 1e-4) { dx = 1; dz = 0; d = 1; } } var nx = e[12] + dx / d * R, nz = e[14] + dz / d * R; if (walkable(nx, nz)) { pos.x = nx; pos.z = nz; } else { pos.x = px0; pos.z = pz0; } moved = true; }
    return moved; }
  /* the city maps' solid boxes (world, axis-aligned, with a height range): she is held 0.2 off each, pushed out along its nearer side */
  function solidPush() { if (!TK || !TK.T || LVL.on || !inTK(pos.x, pos.z)) return false; var T = TK.T, C = T.colliders || [], r = 0.2, yr = pos.y - T.Y, moved = false, i; for (i = 0; i < C.length; i++) { var c = C[i], dx = pos.x - c[0], dz = pos.z - c[1], ex = c[2] + r, ez = c[3] + r; if (dx >= ex || dx <= -ex || dz >= ez || dz <= -ez) continue;
      if (yr < (c[4] == null ? -1 : c[4]) || yr > (c[5] == null ? 3 : c[5])) continue; if (Math.abs(dx) < c[2] && Math.abs(dz) < c[3]) continue; /* inside: the step-out below handles it */
      var px = ex - Math.abs(dx), pz = ez - Math.abs(dz), nx = pos.x, nz = pos.z; if (px < pz) nx = c[0] + (dx >= 0 ? ex : -ex); else nz = c[1] + (dz >= 0 ? ez : -ez); if (walkable(nx, nz)) { pos.x = nx; pos.z = nz; moved = true; } }
    return moved; }
  /* inside something? (the point test of the place itself: a collider of the city, a solid or a "no walking" area of a portal place) */
  function stuckAt(x, z) { if (!TK || !TK.T || !inTK(x, z)) return false; var T = TK.T, yr = pos.y - T.Y, i;
    if (LVL.on) { var L = T.toL(x, z); if (T.nowalk && T.nowalk(L[0], L[1], yr)) return true; var B = T.solid || []; for (i = 0; i < B.length; i++) { var b = B[i]; if (L[0] > b[0] && L[0] < b[1] && L[1] > b[4] && L[1] < b[5] && b[2] < yr + 1.2 && b[3] > yr + 0.25) return true; } return false; }
    var C = T.colliders || []; for (i = 0; i < C.length; i++) { var c = C[i]; if (Math.abs(x - c[0]) < c[2] && Math.abs(z - c[1]) < c[3] && yr >= (c[4] == null ? -1 : c[4]) && yr <= (c[5] == null ? 3 : c[5])) return true; } return false; }
  function unstick() { if (!stuckAt(pos.x, pos.z)) return false; var y0 = pos.y, R, a; for (R = 0.25; R <= 3; R += 0.25) { var n = Math.max(10, Math.round(R * 14)); for (a = 0; a < n; a++) { var t = a / n * Math.PI * 2 + (face || 0), x = pos.x + Math.sin(t) * R, z = pos.z + Math.cos(t) * R; if (stuckAt(x, z) || !walkable(x, z) || Math.abs(groundY(x, z) - y0) > 0.5) continue; pos.x = x; pos.z = z; return true; } } return false; }
  var _moveAN = move; move = function (dt) { var px0 = pos.x, pz0 = pos.z; _moveAN(dt); if (!pplFree()) return; var m = false; try { m = pplPush(px0, pz0) || m; m = solidPush() || m; if (Math.abs(groundY(pos.x, pos.z) - pos.y) < 0.35) m = unstick() || m; } catch (e) { if (window.ISLE_TEST) throw e; } if (m) { pos.y = groundY(pos.x, pos.z); luna.root.position.copy(pos); } };

  /* ---------- the street play in the portal places ---------- */
  var _lvArriveAN = lvArrive; lvArrive = function (id) { var ok = _lvArriveAN.apply(this, arguments); if (ok !== false && LVL.on && TK && TK.T) { var T = TK.T; T.noLaw = true; T.spots = T.spots || {};
      /* no police box here: the street play's radar and patrol code still read one, so it is put far out of the place, never shown */
      if (!T.KOBAN) T.KOBAN = { x0: 1e5, x1: 1e5 + 1, z0: 1e5, z1: 1e5 + 1 }; if (!T.spots.koban) T.spots.koban = [1e5, 1e5]; if (!T.spots.kobanDoor) T.spots.kobanDoor = [1e5, 1e5]; if (T.spots.kobanRy == null) T.spots.kobanRy = 0;
      try { gsStart(); } catch (e) { if (window.console) console.error('level street play', e); if (window.ISLE_TEST) throw e; } } return ok; };
  var _lvLeaveAN = lvLeave; lvLeave = function () { if (LVL.on) { try { gsStop(); } catch (e) {} } return _lvLeaveAN.apply(this, arguments); };
  /* a portal place's own cast for the street play: its walkers (no officer at a door, no extra passers-by placed for a city) */
  var _gsBuildCityAN = gsBuildCity; gsBuildCity = function () { if (!(LVL.on && TK && TK.T && TK.T.noLaw)) return _gsBuildCityAN.apply(this, arguments); (TK.T.peds || []).forEach(function (p) { if (p && p.A && p.A.root && p.st !== 'still' && p.r) GS.npcs.push({ A: p.A, kind: 'tped', p: p }); }); GS.talkers = [];
    /* the driver who steps out of a car she takes; the little mosaic the street play puts over her eyes when she is wanted (here: never) */ GS.driver = person({ pal: { suit: 0x3a3e46, pants: 0x2a2c30, hair: 0x1a1410 }, seed: 2360, hair: 'short', hatKind: 'none' }, 0, 300, 0, 'driver'); GS.driver.A.root.visible = false; GS.driver.off = true;
    var mc = document.createElement('canvas'); mc.width = 8; mc.height = 3; var mt = new THREE.CanvasTexture(mc); mt.magFilter = THREE.NearestFilter; mt.minFilter = THREE.NearestFilter; mt.encoding = THREE.sRGBEncoding;
    GS.mos = new THREE.Mesh(new THREE.PlaneGeometry(0.215, 0.078), KIT.curved(new THREE.MeshBasicMaterial({ map: mt, toneMapped: false }))); GS.mos.userData.c = mc; GS.mos.userData.t = mt; GS.mos.position.set(0, -0.012, 0.122); GS.mos.renderOrder = 4; GS.mos.visible = false; luna.head.add(GS.mos); mosaic(); };
  /* no police box: a misdeed here calls nobody (the moves stay non-lethal as everywhere) */
  var _crimeAN = crime; crime = function (kind) { if (TK && TK.T && TK.T.noLaw) return; return _crimeAN.apply(this, arguments); };
  window.ISLE_x.ppl = function () { return { n: PPL.length, near: PPL.filter(function (r) { var e = r.matrixWorld.elements; return Math.hypot(pos.x - e[12], pos.z - e[14]) < 1.5 && pplShown(r); }).length, stuck: stuckAt(pos.x, pos.z), gs: typeof gsOn === 'function' ? gsOn() : null }; };
  /* a portal place's radar: its own ground read off the place (the sea and what cannot be walked dark, the roads grey, the rest the walk colour,
     the solid things black), once, on a three-metre grid */
  var _radarMapCityAN = radarMapCity; radarMapCity = function (T) { if (!(T && T.noLaw)) return _radarMapCityAN.apply(this, arguments);
    RM.x0 = T.MAPX[0]; RM.x1 = T.MAPX[1]; RM.z0 = T.MAPZ[0]; RM.z1 = T.MAPZ[1]; RM.k = 1.7; var c = document.createElement('canvas'); c.width = Math.round((RM.x1 - RM.x0) * RM.k); c.height = Math.round((RM.z1 - RM.z0) * RM.k); var g = c.getContext('2d'), k = RM.k, st = 3, x, z;
    g.fillStyle = '#1d2a36'; g.fillRect(0, 0, c.width, c.height);
    for (x = RM.x0; x < RM.x1; x += st) for (z = RM.z0; z < RM.z1; z += st) { var cx = x + st / 2, cz = z + st / 2, col = null; try { var ar = T.areaFn ? T.areaFn(cx, cz) : null, nw = T.nowalk ? T.nowalk(cx, cz, 0.2) : false, gy = T.gfn ? T.gfn(cx, cz, 99) : 0; if (gy < -0.6) col = null; else if (nw) col = '#2a3138'; else if (ar === 'road') col = '#3b4047'; else col = '#5f6770'; } catch (e) { col = '#5f6770'; } if (col) { g.fillStyle = col; g.fillRect((x - RM.x0) * k, (z - RM.z0) * k, st * k + 0.5, st * k + 0.5); } }
    g.fillStyle = '#1b1e22'; (T.solid || []).forEach(function (b) { if (b[3] - b[2] < 1.6) return; g.fillRect((b[0] - RM.x0) * k, (b[4] - RM.z0) * k, (b[1] - b[0]) * k, (b[5] - b[4]) * k); });
    RM.c = c; GS.rmc = c; };
