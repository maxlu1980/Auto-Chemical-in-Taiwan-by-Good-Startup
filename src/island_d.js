/* ===== [island_d.js] ===== */

  /* ===== ISLE part 2c: the dogs — Luna's Maltese, who follows her everywhere, and the two border collies of the Good Startup
     representative in Taichung, who never stop playing.
     The Maltese walks in Luna's own footsteps (a breadcrumb trail, so she goes round whatever Luna went round) and cuts the corner when
     the way is clear; she trots up beside Luna when Luna stops, sits after a while and lies down when Luna lingers, has a sniff about,
     hops up on her hind legs when Luna waves or cheers, rides on the pillion of the scooter, in the passenger seat of the roadster and
     on the ferry's deck, and waits outside the ring while Luna fights. The collies chase each other round and round with the roles
     swapping, bow to invite, rear up to wrestle, spin after their tails, and come over to say hello when Luna stands by them. ===== */
  var DOGS = null;
  function dogGround(x, z) { if (onPier(x, z)) return true; var h = W.height(x, z); if (h < 0.1) return false; var L2 = G_lake(); if (L2 && h < L2.h - 0.02 && (L2.sd ? L2.sd(x, z) > 0 : Math.hypot(x - L2.x, z - L2.z) < L2.r - 0.3)) return false; return true; }
  function wrapA(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
  function clearance(x, z) { var best = 9; W.colliders.forEach(function (c) { var d; if (Math.abs(c.x - x) > 12 || Math.abs(c.z - z) > 12) return; if (c.r) d = Math.hypot(x - c.x, z - c.z) - c.r; else { var co = Math.cos(c.rot), si = Math.sin(c.rot), ex = x - c.x, ez = z - c.z, lxx = ex * co - ez * si, lzz = ex * si + ez * co, qx = Math.abs(lxx) - c.hw, qz = Math.abs(lzz) - c.hd; d = qx > 0 || qz > 0 ? Math.hypot(Math.max(0, qx), Math.max(0, qz)) : Math.max(qx, qz); } if (d < best) best = d; }); return best; }
  function pushFree(p, rad) { /* at build time, before the grid: move a point out of every collider it overlaps */ for (var it = 0; it < 4; it++) { var moved = false; W.colliders.forEach(function (c) { if (Math.abs(c.x - p.x) > 8 || Math.abs(c.z - p.z) > 8) return; if (c.r) { if (c.r === 0.35 && Math.hypot(c.x - p.x, c.z - p.z) < 1e-3) return; var dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + rad; if (d < m) { if (d < 1e-4) { dx = 1; dz = 0; d = 1; } p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; moved = true; } return; }
      var co = Math.cos(c.rot), si = Math.sin(c.rot), ex = p.x - c.x, ez = p.z - c.z, lxx = ex * co - ez * si, lzz = ex * si + ez * co, qx = Math.max(-c.hw, Math.min(c.hw, lxx)), qz = Math.max(-c.hd, Math.min(c.hd, lzz)), ddx = lxx - qx, ddz = lzz - qz, dd = Math.hypot(ddx, ddz);
      if (dd < rad) { if (dd < 1e-5) { var px = c.hw - Math.abs(lxx), pz = c.hd - Math.abs(lzz); if (px < pz) lxx = (lxx > 0 ? c.hw : -c.hw) + (lxx > 0 ? rad : -rad); else lzz = (lzz > 0 ? c.hd : -c.hd) + (lzz > 0 ? rad : -rad); } else { lxx = qx + ddx / dd * rad; lzz = qz + ddz / dd * rad; } p.x = c.x + lxx * co + lzz * si; p.z = c.z - lxx * si + lzz * co; moved = true; } }); if (!moved) break; } return p; }
  function lineClear(x0, z0, x1, z1, rad) { var d = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(d / 0.25)), q = { x: 0, z: 0 }; for (var i = 1; i <= n; i++) { var t2 = i / n; q.x = x0 + (x1 - x0) * t2; q.z = z0 + (z1 - z0) * t2; if (!dogGround(q.x, q.z)) return false; if (pushOut(q, rad)) return false; } return true; }
  /* where the collies play: beside the representative (not in front of him, where Luna talks to him), flat, clear of walls and doors */
  function playSpot(n) { var best = null, bs = -1e9, fx = Math.sin(n.rot), fz = Math.cos(n.rot), pz = W.places[n.id] && W.places[n.id].plazaW;
    [1.1, 0.95, 0.8, 0.7].forEach(function (Rp) {
      for (var r = 1.5; r <= 4.4; r += 0.3) for (var a = 0; a < 32; a++) { var an = a / 32 * Math.PI * 2, x = n.x + Math.sin(an) * r, z = n.z + Math.cos(an) * r, cl = clearance(x, z); if (cl < Rp + 0.35) continue;
        var ok = true, h0 = W.height(x, z), k; for (k = 0; k < 10 && ok; k++) { var b = k / 10 * Math.PI * 2, px = x + Math.sin(b) * (Rp + 0.3), pz2 = z + Math.cos(b) * (Rp + 0.3); if (!dogGround(px, pz2) || Math.abs(W.height(px, pz2) - h0) > 0.2) ok = false; } if (!ok) continue;
        if (W.interact.some(function (it) { return Math.hypot(it.x - x, it.z - z) < it.r + Rp * 0.7; })) continue;
        var ux = (x - n.x) / r, uz = (z - n.z) / r; if (!lineClear(n.x + ux * 0.6, n.z + uz * 0.6, x, z, 0.25)) continue; /* in plain sight of him: no wall in between */
        var front = ux * fx + uz * fz, onPlaza = pz && Math.hypot(pz[0] - x, pz[1] - z) < 9 ? 1.4 : 0, sc = -r * 1.2 + Rp * 1.5 - Math.abs(front) * 0.4 + onPlaza + Math.min(cl - Rp, 1) * 0.3; if (sc > bs) { bs = sc; best = { x: x, z: z, R: Rp }; } } });
    return best; }
  function dogsBuild() { if (DOGS || typeof DOG === 'undefined' || !W) return; DOGS = { trail: [], di: 0, chk: 0, state: 'hidden', why: 'title', collies: [], play: null };
    var D = DOG.build('maltese'); D.root.scale.setScalar(1.12); D.root.visible = false; scene.add(D.root); DOGS.m = { D: D, x: pos.x, z: pos.z, hd: 0, v: 0, sp: 0, idle: 0, exc: 0, side: 1, sniff: null, rad: 0.15 };
    var mst = W.npcs.filter(function (n) { return n.role === 'master' && ST2[n.id] === 'gs'; })[0], c = mst && playSpot(mst); if (!c) return;
    c.y = W.height(c.x, c.z); var looks = [{ coat: 0x1d1c22, eye: 0x4a2c16 }, { coat: 0x5c2c18, eye: 0x7a4a22, inner: 0x4a2a22 }];
    looks.forEach(function (o, i) { var C = DOG.build('collie', o), an = i * Math.PI; scene.add(C.root); DOGS.collies.push({ D: C, x: c.x + Math.cos(an) * c.R, z: c.z + Math.sin(an) * c.R, hd: an, v: 0, sp: 0, goal: null, pose: null, rad: 0.2, arr: false }); });
    DOGS.play = { c: c, st: 'chase', t: 0, dur: 6, dir: 1, th: 0, lead: 0, gap: 0.8, gapT: 0.8, v: 2.9, seed: Math.random() * 6, greetCD: 4, nearT: 0, master: mst }; setPlay('chase'); }

  /* ---------- the Maltese ---------- */
  function dogPlace(how) { if (!DOGS) return; var M = DOGS.m, f = face, fx = Math.sin(f), fz = Math.cos(f), rx = -Math.cos(f), rz = Math.sin(f), cand, i, q = { x: 0, z: 0 };
    if (how === 'run') cand = [[0.6, -3.4], [-0.6, -3.4], [2.6, -2.2], [-2.6, -2.2], [0, -2.2], [0.55, -0.5]]; else cand = [[0.55, -0.45], [-0.55, -0.45], [0, -0.75], [0.7, 0.2], [-0.7, 0.2], [0, 0.8]];
    var at = null; for (i = 0; i < cand.length && !at; i++) { var x = pos.x + rx * cand[i][0] + fx * cand[i][1], z = pos.z + rz * cand[i][0] + fz * cand[i][1]; q.x = x; q.z = z; if (dogGround(x, z) && !pushOut(q, 0.14) && Math.abs(groundY(x, z) - pos.y) < 0.6 && (how !== 'run' || lineClear(x, z, pos.x, pos.z, 0.14))) at = [x, z]; }
    if (!at) at = [pos.x - fx * 0.3, pos.z - fz * 0.3]; M.x = at[0]; M.z = at[1]; M.hd = how === 'run' ? Math.atan2(pos.x - M.x, pos.z - M.z) : f; M.v = 0; M.sp = 0; M.idle = 0; M.sniff = null; M.exc = how ? 3 : 0;
    DOGS.trail = how === 'run' ? [[M.x, M.z], [pos.x, pos.z]] : [[pos.x, pos.z]]; DOGS.di = 0; DOG.setMode(M.D, 'stand'); M.D.root.visible = true; M.D.root.position.set(M.x, groundY(M.x, M.z), M.z); M.D.root.rotation.set(0, M.hd, 0); }
  function dogRide(F, spot, hd) { if (!DOGS || !spot) return; var M = DOGS.m, D = M.D; D.root.position.set(spot[0], F.userData.deck(spot[1]), spot[1]).applyMatrix4(F.matrixWorld); D.root.rotation.set(0, hd, 0); D.root.visible = true; DOG.setMode(D, 'sit'); D.spd = 0; M.v = 0; M.sp = 0; }
  function dogStep(o, gx, gz, vmax, dt, acc, far) { var dx = gx - o.x, dz = gz - o.z, d = Math.hypot(dx, dz), vt = Math.min(vmax, (d + (far || 0)) * 4.2); o.v += Math.max(-acc * 1.7 * dt, Math.min(acc * dt, vt - o.v)); if (o.v < 0) o.v = 0;
    var step = Math.min(d, o.v * dt), x0 = o.x, z0 = o.z; if (d > 1e-4 && step > 0) { var nx = o.x + dx / d * step, nz = o.z + dz / d * step, r = { x: nx, z: nz }; if (dogGround(nx, nz)) { pushOut(r, o.rad); o.x = r.x; o.z = r.z; } }
    dogAvoid(o); var mv = Math.hypot(o.x - x0, o.z - z0); o.sp += ((dt > 0 ? mv / dt : 0) - o.sp) * Math.min(1, dt * 12); if (mv > 0.002) { var want = Math.atan2(o.x - x0, o.z - z0); o.hd += wrapA(want - o.hd) * Math.min(1, dt * (o.sp > 1.8 ? 7 : 11)); } return d; }
  function dogAvoid(o) { /* make way for Luna (or her vehicle) and for each other */ var lr = (VEH.kind === 'car' ? 1.05 : VEH.kind === 'moped' ? 0.7 : 0.36) + o.rad, dx = o.x - pos.x, dz = o.z - pos.z, d = Math.hypot(dx, dz);
    if (d < lr && d > 1e-4) { var nx = pos.x + dx / d * lr, nz = pos.z + dz / d * lr; if (dogGround(nx, nz)) { o.x = nx; o.z = nz; } }
    var all = [DOGS.m].concat(DOGS.collies); all.forEach(function (p) { if (p === o || p.noSep || o.noSep) return; var ex = o.x - p.x, ez = o.z - p.z, e = Math.hypot(ex, ez), m = o.rad + p.rad + 0.04; if (e < m && e > 1e-4) { o.x += ex / e * (m - e) * 0.5; o.z += ez / e * (m - e) * 0.5; } }); }
  function malteseWalk(dt) { var M = DOGS.m, D = M.D, T = DOGS.trail, n = T.length, last = T[n - 1], lsp = luna.speed || 0;
    if (!n) { T.push([pos.x, pos.z]); n = 1; last = T[0]; } var dl = Math.hypot(pos.x - last[0], pos.z - last[1]); if (dl > 6) { dogPlace(false); return; } if (dl > 0.3) { T.push([pos.x, pos.z]); n++; }
    if (n > 420) { T.splice(0, n - 400); DOGS.di -= n - 400; n = T.length; if (DOGS.di < 0) { dogPlace(false); return; } }
    if (Math.hypot(M.x - pos.x, M.z - pos.z) > 18) { dogPlace(false); return; }
    var excite = ['wave', 'cheer', 'jump', 'hop', 'victory', 'peace'].indexOf(luna.mode) >= 0; if (excite) M.exc = Math.max(M.exc, 1.5); M.exc = Math.max(0, M.exc - dt);
    var gx, gz, vmax = 7.6, want = null, sitting = false;
    if (fight) { /* wait outside the ring, facing the fight */ var a = fight.arena, ax = M.x - a.x, az = M.z - a.z, ad = Math.hypot(ax, az) || 1, rr = a.R + 0.8; gx = a.x + ax / ad * rr; gz = a.z + az / ad * rr; if (!dogGround(gx, gz)) { gx = M.x; gz = M.z; } DOGS.inFight = true;
      var d0 = dogStep(M, gx, gz, 4, dt, 10); if (d0 < 0.1) { want = Math.atan2(a.x - M.x, a.z - M.z); DOG.setMode(D, 'sit'); M.exc = 1; } else DOG.setMode(D, 'stand'); }
    else { if (DOGS.inFight) { DOGS.inFight = false; DOGS.trail = lineClear(M.x, M.z, pos.x, pos.z, 0.14) ? [[M.x, M.z], [pos.x, pos.z]] : [[pos.x, pos.z]]; DOGS.di = 0; T = DOGS.trail; n = T.length; if (n === 1) { dogPlace(false); return; } }
      /* the point on Luna's path a little behind her, the waypoint the dog is on, a short cut when the way is clear */
      var lag = lsp > 3.4 ? 1.1 : 0.8, ti = n - 1, acc = Math.hypot(pos.x - T[n - 1][0], pos.z - T[n - 1][1]); while (ti > DOGS.di && acc < lag) { acc += Math.hypot(T[ti][0] - T[ti - 1][0], T[ti][1] - T[ti - 1][1]); ti--; }
      while (DOGS.di < ti && Math.hypot(M.x - T[DOGS.di][0], M.z - T[DOGS.di][1]) < 0.45) DOGS.di++;
      DOGS.chk -= dt; if (DOGS.chk <= 0 && DOGS.di < ti) { DOGS.chk = 0.3; for (var k = ti; k > DOGS.di; k -= 2) { if (Math.hypot(T[k][0] - M.x, T[k][1] - M.z) < 4 && lineClear(M.x, M.z, T[k][0], T[k][1], 0.14)) { DOGS.di = k; break; } } }
      var rem = 0, j; for (j = DOGS.di; j < ti; j++) rem += Math.hypot(T[j + 1][0] - T[j][0], T[j + 1][1] - T[j][1]);
      if (DOGS.di >= ti && lsp < 0.3 && !M.sniff) { /* beside Luna: her right, else her left */ var fx = Math.sin(face), fz = Math.cos(face), rx = -Math.cos(face), rz = Math.sin(face), q = { x: 0, z: 0 }, s2, ok = null;
        for (s2 = 0; s2 < 2 && !ok; s2++) { var sd = s2 ? -M.side : M.side; q.x = pos.x + rx * 0.55 * sd - fx * 0.3; q.z = pos.z + rz * 0.55 * sd - fz * 0.3; var qx = q.x, qz = q.z; if (dogGround(qx, qz) && !pushOut(q, 0.13) && (Math.hypot(M.x - qx, M.z - qz) < 0.6 || lineClear(M.x, M.z, qx, qz, 0.13))) { ok = [qx, qz]; if (s2) M.side = sd; } }
        if (ok) { gx = ok[0]; gz = ok[1]; } else { gx = T[ti][0]; gz = T[ti][1]; } }
      else if (M.sniff) { gx = M.sniff[0]; gz = M.sniff[1]; vmax = 0.35; }
      else { var wp = T[Math.min(DOGS.di, ti)]; gx = wp[0]; gz = wp[1]; }
      dogStep(M, gx, gz, vmax, dt, 11, DOGS.di < ti ? rem : 0); /* the speed aims at the whole way left, not at the next footstep */
      /* the idle life: stand and watch, sniff about, sit, lie down */
      var lunaIdle = lsp < 0.2, still = M.sp < 0.1; M.idle = lunaIdle ? M.idle + dt : 0; if (!lunaIdle) M.sniffed = false; var lookL = wrapA(Math.atan2(pos.x - M.x, pos.z - M.z) - M.hd);
      if (M.sniff) { M.sniff[2] -= dt; if (M.sniff[2] <= 0 || !lunaIdle || Math.hypot(gx - M.x, gz - M.z) < 0.05) M.sniff = null; }
      if (M.sniff) DOG.setMode(D, 'sniff'); else if (!still) DOG.setMode(D, 'stand');
      else if (talkQ) { DOG.setMode(D, 'sit'); want = M.hd + lookL; sitting = true; }
      else if (M.exc > 0 && Math.hypot(M.x - pos.x, M.z - pos.z) < 2.2) { DOG.setMode(D, 'rear'); want = M.hd + lookL; }
      else if (M.idle < 2.5) { DOG.setMode(D, 'stand'); }
      else if (M.idle < 4.5 && !M.sniffed) { M.sniffed = true; var an = Math.random() * Math.PI * 2, sx = pos.x + Math.sin(an) * 0.9, sz = pos.z + Math.cos(an) * 0.9, q2 = { x: sx, z: sz }; if (dogGround(sx, sz) && !pushOut(q2, 0.13) && lineClear(M.x, M.z, sx, sz, 0.13)) M.sniff = [sx, sz, 2.2]; }
      else if (M.idle < 16) { DOG.setMode(D, 'sit'); want = M.hd + lookL; sitting = true; } else { DOG.setMode(D, 'lie'); want = M.hd + lookL * 0.6; }
    }
    if (want != null && M.sp < 0.1) { var da = wrapA(want - M.hd); if (Math.abs(da) > (sitting ? 0.9 : 1.3) || M.turning) { M.turning = Math.abs(da) > 0.08; M.hd += da * Math.min(1, dt * 5); } } else M.turning = false;
    D.spd = M.turning && M.sp < 0.1 ? 0.25 : M.sp; D.root.position.set(M.x, groundY(M.x, M.z), M.z); D.root.rotation.set(0, M.hd, 0);
    DOG.update(D, dt, { look: M.sp < 0.3 ? wrapA(Math.atan2(pos.x - M.x, pos.z - M.z) - M.hd) : 0, excited: M.exc > 0 }); }
  function malteseRide(dt) { var M = DOGS.m, D = M.D, o = VEH.obj, mk = o.userData.mk; if (!mk || !mk.dog) return; mk.dog.getWorldPosition(D.root.position); D.root.quaternion.copy(o.quaternion); DOG.setMode(D, 'ride'); D.spd = 0; M.v = 0; M.sp = 0; M.x = D.root.position.x; M.z = D.root.position.z; M.hd = VEH.heading;
    var sp = Math.abs(VEH.speed || 0); DOG.update(D, dt, { wind: Math.min(1, sp / 9), look: sp < 1 ? Math.sin(performance.now() / 1700) * 0.6 : 0, excited: sp > 6 });
    /* Luna's twin tails rest on the pillion and on the dog instead of passing through them */ if (o.userData.kind === 'moped') { var L0 = MOUNT.colliders || (MOUNT.colliders = [0, 1, 2, 3].map(function () { return { p: new V3(), r: 0.1 }; })), loc = [[0, 0.47, -0.4, 0.09], [0, 0.47, -0.62, 0.09], [0, 0.66, -0.55, 0.11], [0, 0.77, -0.49, 0.065]];
      loc.forEach(function (q, i) { L0[i].p.set(q[0], q[1], q[2]); o.localToWorld(L0[i].p); L0[i].r = q[3]; }); } else MOUNT.colliders = null; }

  /* ---------- the collies at play ---------- */
  function circ(th) { var P = DOGS.play, c = P.c, rr = c.R * (1 + 0.16 * Math.sin(th * 2 + P.seed)); return [c.x + Math.cos(th) * rr, c.z + Math.sin(th) * rr]; }
  function setPlay(st) { var P = DOGS.play, c = P.c, A = DOGS.collies[0], B = DOGS.collies[1]; P.st = st; P.t = 0; P.ready = false; A.pose = B.pose = null; A.arr = B.arr = false; A.noSep = B.noSep = false;
    if (st === 'chase') { P.dur = 5 + Math.random() * 4; P.v = 2.5 + Math.random() * 1.0; P.gap = P.gapT = 0.7; var L = P.lead ? B : A; P.th = Math.atan2(L.z - c.z, L.x - c.x); A.goal = B.goal = null; return; }
    if (st === 'greet') { var ux = c.x - pos.x, uz = c.z - pos.z, ud = Math.hypot(ux, uz) || 1; ux /= ud; uz /= ud; var bx = pos.x + ux * 0.85, bz = pos.z + uz * 0.85, la = Math.atan2(-ux, -uz);
      A.goal = [bx - uz * 0.38, bz + ux * 0.38, la]; B.goal = [bx + uz * 0.38, bz - ux * 0.38, la]; A.pose = Math.random() < 0.5 ? 'bow' : 'rear'; B.pose = A.pose === 'bow' ? 'rear' : 'bow'; P.dur = 2.6; P.greetCD = 14; return; }
    var mx = c.x + (Math.random() - 0.5) * 0.6, mz = c.z + (Math.random() - 0.5) * 0.6, vx = B.x - A.x, vz = B.z - A.z, vd = Math.hypot(vx, vz) || 1; vx /= vd; vz /= vd; var dd = st === 'wrestle' ? 0.44 : 0.9;
    A.goal = [mx - vx * dd / 2, mz - vz * dd / 2, Math.atan2(vx, vz)]; B.goal = [mx + vx * dd / 2, mz + vz * dd / 2, Math.atan2(-vx, -vz)];
    if (st === 'bow') { A.pose = 'bow'; B.pose = Math.random() < 0.5 ? 'bow' : 'stand'; P.dur = 1.6 + Math.random() * 0.9; }
    else if (st === 'wrestle') { A.pose = B.pose = 'rear'; A.noSep = B.noSep = true; P.dur = 1.5 + Math.random() * 0.7; }
    else { A.pose = 'spin'; B.pose = 'bow'; P.dur = 1.3 + Math.random() * 0.4; }
    if (Math.random() < 0.5) { var g = A.goal, p0 = A.pose; A.goal = B.goal; A.pose = B.pose; B.goal = g; B.pose = p0; } }
  function nextPlay() { var P = DOGS.play, r = Math.random(); if (P.st !== 'chase') { P.lead = Math.random() < 0.5 ? 0 : 1; if (Math.random() < 0.45) P.dir = -P.dir; setPlay('chase'); return; } setPlay(r < 0.38 ? 'bow' : r < 0.74 ? 'wrestle' : 'spin'); }
  function playStep(dt) { var P = DOGS.play, c = P.c, A = DOGS.collies[0], B = DOGS.collies[1]; P.t += dt; P.greetCD = Math.max(0, P.greetCD - dt);
    var lunaBy = VEH.kind === 'walk' && !travel && !fight && Math.hypot(pos.x - c.x, pos.z - c.z) < c.R + 1.6; if (lunaBy && (luna.speed || 0) < 0.2) P.nearT += dt; else P.nearT = 0;
    if (P.st !== 'greet' && P.nearT > 1.0 && P.greetCD <= 0) setPlay('greet');
    if (P.st === 'chase') { P.th += P.dir * (P.v / c.R) * dt; if (Math.random() < dt * 0.5) P.gapT = 0.4 + Math.random() * 0.8; P.gap += (P.gapT - P.gap) * Math.min(1, dt * 0.9);
      var L = P.lead ? B : A, F = P.lead ? A : B, gl = circ(P.th), gf = circ(P.th - P.dir * P.gap); [[L, gl], [F, gf]].forEach(function (q) { var o = q[0]; DOG.setMode(o.D, 'stand'); dogStep(o, q[1][0], q[1][1], 4.6, dt, 9); });
      if (P.t > P.dur) nextPlay(); }
    else { [A, B].forEach(function (o) { var g = o.goal, d = Math.hypot(g[0] - o.x, g[1] - o.z); if (!o.arr) { DOG.setMode(o.D, 'stand'); dogStep(o, g[0], g[1], P.st === 'greet' ? 3.4 : 2.6, dt, 9); if (d < 0.07 || P.t > 3) o.arr = true; }
        else { var da = wrapA(g[2] - o.hd); o.hd += da * Math.min(1, dt * 7); o.sp *= Math.max(0, 1 - dt * 10); if (P.ready) { DOG.setMode(o.D, o.pose); if (o.pose === 'rear') { var w = Math.sin(P.t * 6 + (o === A ? 0 : 2)) * 0.02; o.x = g[0] + Math.sin(g[2]) * w; o.z = g[1] + Math.cos(g[2]) * w; } } else DOG.setMode(o.D, 'stand'); o.turn = Math.abs(da) > 0.25; } });
      if (!P.ready && A.arr && B.arr) { P.ready = true; P.t0 = P.t; } if (P.ready && P.t - P.t0 > P.dur) nextPlay(); }
    [A, B].forEach(function (o) { var D = o.D, other = o === A ? B : A, lk = P.st === 'greet' ? Math.atan2(pos.x - o.x, pos.z - o.z) : Math.atan2(other.x - o.x, other.z - o.z); D.spd = o.turn && o.sp < 0.1 && !P.ready ? 0.4 : o.sp;
      D.root.position.set(o.x, groundY(o.x, o.z), o.z); D.root.rotation.set(0, o.hd, 0); DOG.update(D, dt, { look: o.sp < 0.6 ? wrapA(lk - o.hd) : 0, excited: true }); o.hd = D.root.rotation.y; }); }

  /* ---------- every frame ---------- */
  function dogsUpdate(dt) { if (!DOGS) return; var M = DOGS.m, D = M.D, st;
    if (fall || mode === 'title' || mode === 'dive' || TKW) { st = 'hidden'; DOGS.why = 'title'; } else if (travel && travel.kind === 'ferry') st = 'ferry'; else if (travel) { st = 'hidden'; DOGS.why = 'travel'; } else if (VEH.kind !== 'walk' && VEH.obj) st = 'veh'; else st = 'walk';
    if (st !== DOGS.state) { var prev = DOGS.state; DOGS.state = st; D.root.visible = st !== 'hidden'; if (st !== 'veh') MOUNT.colliders = null; if (st === 'walk') dogPlace(prev === 'hidden' ? (DOGS.why === 'title' ? 'run' : true) : prev === 'ferry' ? true : false); }
    if (st === 'walk') malteseWalk(dt); else if (st === 'veh') malteseRide(dt); else if (st === 'ferry') DOG.update(D, dt, { look: Math.sin(performance.now() / 1900) * 0.7 });
    if (DOGS.play) { var c = DOGS.play.c, vis = st !== 'hidden' && Math.abs(c.x - CAM.tgt.x) < 45 && Math.abs(c.z - CAM.tgt.z) < 45; DOGS.collies.forEach(function (o) { o.D.root.visible = vis; }); if (vis) playStep(Math.min(dt, 0.05)); } }


