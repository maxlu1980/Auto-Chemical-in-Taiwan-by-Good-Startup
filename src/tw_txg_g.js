/* ===== [tw_txg_g.js] ===== */
  /* ===== TXG3D part 3: the city's own rules on the shared engine — its road network, its trains, its levels, its people's ways ===== */
  function inR(x, z, q, m) { m = m || 0; return x > q[0] - m && x < q[1] + m && z > q[2] - m && z < q[3] + m; }
  /* the road network: links between the crossings; lanes across them (the inner lane first) */
  function lanes(T) { var L = []; function link(road, head, s0, s1, lat, node, from) { var ax = head === 'E' || head === 'W' ? 'x' : 'z', sg = head === 'E' || head === 'S' ? 1 : -1, l = { id: L.length, road: road, head: head, ax: ax, sg: sg, s0: s0, s1: s1, len: Math.abs(s1 - s0), lat: lat, node: node, from: from, bus: [] }; L.push(l); return l; }
    function ns(road, R, J, S, N) { /* J: the junctions north to south on this road */ var zs = [MAPZ[0]].concat([].concat.apply([], J.map(function (j) { return [INT[j].z[0], INT[j].z[1]]; }))).concat([MAPZ[1]]), i;
      for (i = 0; i <= J.length; i++) link(road, 'S', zs[2 * i], zs[2 * i + 1], S, J[i] || null, i ? J[i - 1] : null);
      for (i = J.length; i >= 0; i--) link(road, 'N', zs[2 * i + 1], zs[2 * i], N, i ? J[i - 1] : null, J[i] || null); }
    function ew(road, R, J, E, W) { var xs = [R2[1]].concat([].concat.apply([], J.slice(1).map(function (j) { return [INT[j].x[0], INT[j].x[1]]; }))).concat([MAPX[1]]), i;
      for (i = 0; i < J.length; i++) link(road, 'E', xs[2 * i], xs[2 * i + 1], E, J[i + 1] || null, J[i]);
      for (i = J.length - 1; i >= 0; i--) link(road, 'W', xs[2 * i + 1], xs[2 * i], W, J[i], J[i + 1] || null); }
    ns('r2', R2, ['J1', 'J2', 'J3'], [101.6, 98.4], [106.4, 109.6]); ns('re', RE, ['J4', 'J5', 'J6'], [201.2, 198.4], [204.8, 207.6]); ns('rw', RW, [], [-92.8, -95.6], [-89.2, -86.4]);
    ew('rn', RN, ['J1', 'J4'], [-141.2, -138.4], [-144.8, -147.6]); ew('rm', RM, ['J2', 'J5'], [2.8, 5.6], [-0.8, -3.6]); ew('rs', RS, ['J3', 'J6'], [144.8, 147.6], [141.2, 138.4]);
    L.forEach(function (l) { l.out = {}; }); L.forEach(function (l) { if (!l.node) return; L.forEach(function (m) { if (m.from === l.node) l.out[m.head] = m; }); });
    T.net = { L: L, entries: L.filter(function (l) { return !l.from; }) }; }

  /* the trains: the high-speed rail's four on the platform tracks (one standing at platform 1), the railway's commuters, the metro's two-car trains
     that run in to the terminus and go back the way they came */
  function trains(T, hi) { var n = hi ? 12 : 8; [['A1', -1, 0], ['B1', -1, 70], ['A2', 1, 140], ['B2', 1, 210]].forEach(function (q, k) { var Hs = TPE3D.hsTrain(n); Hs.track = q[0]; Hs.zt = TRK[q[0]]; Hs.dir = q[1]; Hs.st = 'gone'; Hs.wait = q[2] * 0.4 + 6; Hs.x = 0; Hs.v = 0; Hs.no = [803, 1515, 622, 1218][k];
      Hs.root.rotation.y = q[1] > 0 ? Math.PI / 2 : -Math.PI / 2; Hs.root.position.set(0, RAIL, Hs.zt); Hs.root.visible = false; T.G.b2.add(Hs.root); Hs.mid = Hs.len / 2; Hs.ns = true; Hs.oz = 0; Hs.rail = RAIL; Hs.line = 'hsr'; T.trains.push(Hs); });
    var t0 = T.trains[0]; t0.st = 'dwell'; t0.wait = 40; t0.x = 0; t0.root.visible = true; t0.open = true;
    (hi ? [['T1', -1, 12], ['T2', -1, 80], ['T3', 1, 40], ['T4', 1, 120]] : [['T1', -1, 12], ['T4', 1, 60]]).forEach(function (q, k) { var R = traTrain(hi ? 8 : 6); R.track = q[0]; R.zt = TT[q[0]]; R.dir = q[1]; R.st = 'gone'; R.wait = q[2]; R.x = 0; R.v = 0; R.no = [2155, 3186, 2224, 115][k];
      R.root.rotation.y = q[1] > 0 ? Math.PI / 2 : -Math.PI / 2; R.root.position.set(0, TRAIL, R.zt); R.root.visible = false; T.G.tra.add(R.root); R.mid = R.len / 2; R.ns = true; R.oz = TOZ; R.rail = TRAIL; R.hw = 1.3; R.hh = 3.4; R.loud = 22; R.line = 'tra'; T.trains.push(R); });
    ['M1', 'M2'].forEach(function (tk, k) { var R = mrtTrain(); R.track = tk; R.zt = MTRK[tk]; R.dir = -1; R.st = 'gone'; R.wait = 4 + k * 70; R.x = 200; R.v = 0; R.no = 0; R.root.rotation.y = -Math.PI / 2; R.root.position.set(0, MRAIL, R.zt); R.root.visible = false; T.G.mrt.add(R.root); R.mid = R.len / 2; R.ns = true; R.oz = MOZ; R.rail = MRAIL; R.hw = 1.3; R.hh = 3.3; R.loud = 18; R.line = 'mrt'; R.stepFn = mrtStep; T.trains.push(R); }); }
  /* the metro's terminus: in from the north, a stop, the doors, then back north */ function mrtStep(T, tr, dt) { tr.evt = null;
    if (tr.st === 'gone') { tr.wait -= dt; tr.root.visible = false; if (tr.wait <= 0) { tr.st = 'in'; tr.dir = -1; tr.x = 230; tr.v = 14; tr.root.rotation.y = -Math.PI / 2; tr.root.visible = true; tr.evt = 'in'; } }
    else if (tr.st === 'in') { var d = tr.x; tr.v = Math.max(0.5, Math.min(tr.v, Math.sqrt(2 * 0.9 * Math.max(0, d)))); tr.x -= tr.v * dt; if (d <= 0.05) { tr.x = 0; tr.v = 0; tr.st = 'dwell'; tr.wait = 34; tr.openT = 1.2; tr.evt = 'stop'; } }
    else if (tr.st === 'dwell') { if (tr.openT > 0) { tr.openT -= dt; if (tr.openT <= 0) { tr.open = true; tr.evt = 'open'; } } tr.wait -= dt; if (tr.wait <= 5 && tr.open) { tr.open = false; tr.evt = 'close'; } if (tr.wait <= 0) { tr.st = 'out'; tr.dir = 1; tr.v = 0; tr.root.rotation.y = Math.PI / 2; tr.evt = 'go'; } }
    else if (tr.st === 'out') { tr.v = Math.min(16, tr.v + 0.9 * dt); tr.x += tr.v * dt; if (tr.x > 260) { tr.st = 'gone'; tr.wait = 40 + Math.random() * 40; tr.root.visible = false; } }
    tr.root.position.x = tr.x + tr.dir * tr.mid; tr.doors.visible = !tr.open; tr.opn.visible = !!tr.open; }

  /* ---------- the city's hooks into the shared engine ---------- */
  function hooks(T) {
    T.busRoads = ['r2', 're']; T.busStops = [-58, 58]; T.kinds = ['sedan', 'taxi', 'sedan', 'van', 'bus', 'sedan', 'taxi', 'truck', 'sedan', 'sedan', 'bus', 'van', 'taxi', 'sedan', 'sedan', 'taxi'];
    /* which parts are worth drawing from where the camera is: the station's insides from the district, the bar's inside only near it */ T.levels = function (T, cam) { var cl = T.toL(cam.x, cam.z), cx = cl[0], cz = cl[1]; T.G.hall.visible = cx > -110 && cx < 120 && Math.abs(cz) < 240; T.G.bar.visible = Math.hypot(cx - (BAR[0] + BAR[1]) / 2, cz - (BAR[2] + BAR[3]) / 2) < 70; T.G.b1.visible = false; T.under = 0; var nk = K.U.uNight ? K.U.uNight.value : 0; if (T.nk2 !== nk) { T.nk2 = nk; MX.curtN.emissiveIntensity = nk * 0.55; MX.soff.emissiveIntensity = nk * 0.32; MX.roof.emissiveIntensity = nk * 0.55; } if (T.nightG) { T.nightG.visible = nk > 0.12; if (T.holo) T.holo.material.opacity = 0.75 + 0.25 * Math.sin(performance.now() / 260) * Math.sin(performance.now() / 1700); } };
    T.zoneFn = function (T, x, z, yr) { var E = [ESC1, ESCP1, ESCP2, MESC, [TS1[0], TS1[1], TSZ[0], TSZ[1]], [TS2[0], TS2[1], TSZ[0], TSZ[1]], MGS, [-29, -24, EX4[3], EX4[3] + 12]], i; for (i = 0; i < E.length; i++) { var q = E[i]; if (x > q[0] - 0.5 && x < q[1] + 0.5 && z > Math.min(q[2], q[3]) && z < Math.max(q[2], q[3]) && yr > Y1 + 0.5 && yr < P3Y - 0.4) return 'stair'; }
      if (x > XWS[0] && x < XWS[1] && z > XWS[2] - 0.5 && z < XWS[3] + 0.5 && yr > Y1 + 0.5) return 'stairx';
      if (inR(x, z, BARIN)) return 'diner';
      if (yr > P3Y - 0.8 && ((Math.abs(x) < SX && Math.abs(z) < 140) || inR(x, z, [MPL[0], MPL[1], MPZ[0], MPZ[1]], 1))) return 'plat';
      if (yr > TPY - 0.5 && yr < TPY + 1 && (inR(x, z, [TI1[0], TI1[1], TPZ[0], TPZ[1]]) || inR(x, z, [TI2[0], TI2[1], TPZ[0], TPZ[1]]))) return 'plat';
      if (yr > C2Y - 0.6 && yr < C2Y + 1.5 && (inR(x, z, CONC) || inR(x, z, THALL) || inR(x, z, [MBOX[0], MBOX[1], MCON[0], MCON[1]]) || inR(x, z, BR1) || inR(x, z, BR3))) return 'hall';
      if (yr < 2 && inR(x, z, [LOB[0], SX, LOB[2], LOB[3]])) return 'hall'; return null; };
    T.noDriveFn = function (T, x, z) { return Math.abs(x) < SX + 0.4 && Math.abs(z) < 140 || (x > -66 && x < -32); };
    var ROADS = [[R2[0], R2[1], MAPZ[0], MAPZ[1]], [RE[0], RE[1], MAPZ[0], MAPZ[1]], [RW[0], RW[1], MAPZ[0], MAPZ[1]], [R2[1], MAPX[1], RN[0], RN[1]], [R2[1], MAPX[1], RM[0], RM[1]], [R2[1], MAPX[1], RS[0], RS[1]]];
    T.onRoadFn = function (x, z) { for (var i = 0; i < ROADS.length; i++) if (inR(x, z, ROADS[i], -0.4)) return true; return false; };
    T.inStFn = function (cx, cz, cy) { return (Math.abs(cx) < SX && Math.abs(cz) < 140 && cy > C2Y - 1 && cy < 24) || inR(cx, cz, [LOB[0], SX, LOB[2], LOB[3]]) && cy < C2Y || inR(cx, cz, THALL) && cy > C2Y - 1 && cy < C2Y + 5 || inR(cx, cz, BARIN) && cy < BARH; };
    T.brd = { traT: '臺鐵  新烏日  出發列車  TRA Departures', tra: [['區間', '彰化'], ['區間', '新竹'], ['自強', '高雄'], ['區間快', '嘉義'], ['自強', '臺北'], ['區間', '苗栗'], ['莒光', '屏東'], ['區間', '潮州'], ['自強', '花蓮'], ['區間', '基隆']], traPl: ['1A', '1B', '2A', '2B'],
      hsr: [['左營', '1A'], ['南港', '2A'], ['左營', '1B'], ['南港', '2B'], ['左營', '1A'], ['南港', '2A']],
      p1: { t: '1A 1B  南下 Southbound', dest: function (tr) { return '左營'; }, s: function (tr) { return tr.no % 2 ? '停靠：彰化　雲林　嘉義　台南　左營' : '停靠：嘉義　台南　左營'; } },
      p2: { t: '2A 2B  北上 Northbound', dest: function (tr) { return '南港'; }, s: function (tr) { return tr.no % 2 ? '停靠：苗栗　新竹　桃園　板橋　台北　南港' : '停靠：板橋　台北　南港'; } } };
    T.routesFn = routes; T.standFn = stand; }
  /* the people's ways (local x, z, level); a {cross: [group, axis]} waits for the green man; {wait: s} stands a while */
  function routes(T) { var C = C2Y, P = P3Y, x1 = R2[0] - 1.0, x2 = R2[1] + 1.0;
    return [
      /* from the lobby up to the concourse, through the gates, up to platform 1; a wait; back down and out to the plaza */ [[16, 30, Y1], [15.5, 10, Y1], [10.5, 9.6, Y1], [10.5, 25.4, C], [6, 26, C], [5, 12, C], [6, 7.4, C], [6, -1, C], [12.5, -3.2, C], [12.5, -17, P], [15.6, -22, P], [15.6, -40, P], { wait: 10 }, [15.6, -24, P], [12.5, -17.2, P], [12.5, -3, C], [4, 6, C], [4, 11, C], [5, 26.5, C], [10.5, 26.5, C], [10.5, 10.2, Y1], [15.5, 10.5, Y1], [16, 23, Y1], [26, 23, Y1], [32, 30, Y1], [26, 23, Y1], [16, 23, Y1]],
      /* the concourse to the railway by exit 1 and the bridge, through the railway's gates, down to its east island; a wait; back */ [[0, 30, C], [-20, 30, C], [-30, 30, C], [-48, 30, C], [-48, 35.2, C], [-48, 37, C], [-41.9, 37.4, C], [-41.9, 47.8, TPY], [-41.9, 70, TPY], { wait: 12 }, [-41.9, 48.2, TPY], [-41.9, 37.4, C], [-48, 37, C], [-48, 30, C], [-30, 30, C], [-20, 30, C]],
      /* the railway's west stairs, the west plaza and 高鐵一路's pavement */ [[-60, 30, C], [-66.5, 30, C], [-78.6, 30, Y1], [-81, 30, Y1], [-81, -40, Y1], [-81, 80, Y1], [-81, 30, Y1], [-78.6, 30, Y1], [-66.5, 30, C]],
      /* the plaza: the bus bays, the taxis, the forecourt */ [[30, 0, Y1], [46.8, -26, Y1], [46.8, 50, Y1], [68, 50, Y1], [68, -8, Y1], [30, -10, Y1], [30, 40, Y1]],
      /* the concourse to the metro by exit 3 and the bridge, through its gates, up to the platform; a wait; back */ [[0, -32, C], [20, -30.5, C], [40, -30.5, C], [62, -30.5, C], [71, -31, C], [71.3, -38.4, C], [70.2, -41, C], [70.2, -55, P], [70.8, -72, P], { wait: 10 }, [72, -56, P], [72, -41, C], [71.3, -34, C], [62, -30.5, C], [40, -30.5, C]],
      /* the metro's stair down to the plaza and back up */ [[71, -32, C], [71, -27.4, C], [71, -13.4, Y1], [71, -2, Y1], [80, 10, Y1], [71, -2, Y1], [71, -13.8, Y1], [71, -27.6, C]],
      /* 站區二路's west pavement, across at the junction with the green man, its east pavement past the bar and back */ [[x1 - 1.4, -100, Y1], [x1 - 1.4, -12, Y1], { x: x1, z: RM[0] - 2.4, cross: ['A', 'ns'] }, [x2, RM[0] - 2.4, Y1], [x2 + 1.4, 22, Y1], [x2 + 1.4, 60, Y1], [x2 + 1.4, 128, Y1], { x: x2, z: RS[0] - 2.4, cross: ['A', 'ns'] }, [x1, RS[0] - 2.4, Y1], [x1 - 1.4, 60, Y1], [x1 - 1.4, -100, Y1]],
      /* the towers' pavements on the mid road */ [[120, RM[1] + 1.6, Y1], [192, RM[1] + 1.6, Y1], { x: 193.6, z: RM[1] + 1.6, cross: ['B', 'ew'] }, [193.6, RM[0] - 1.6, Y1], [120, RM[0] - 1.6, Y1], { x: 114.4, z: RM[0] - 1.6, cross: ['A', 'ew'] }, [114.4, RM[1] + 1.6, Y1]],
      /* the arcades of Wuri along 高鐵一路 */ [[-105.8, -150, Y1], [-105.8, 150, Y1], [-101, 150, Y1], [-101, -150, Y1]],
      /* platform 2: a slow walk */ [[-15.4, -60, P], [-15.4, 60, P], { wait: 9 }, [-9.4, 90, P], [-9.4, -60, P], { wait: 6 }],
      /* the north hall: the bakery, the books, the kiosk */ [[-12, -30, C], [12, -44, C], [0, -36, C], [-12, -44, C]],
      /* the training yard's visitors */ [[121, 95, Y1], [140, 96, Y1], [172, 96, Y1], [172, 120, Y1], [130, 120, Y1], [121, 95, Y1], [114.5, 95, Y1]]]; }
  function stand(T) { return [[2, 17, Math.PI, C2Y], [-1.2, 17.4, Math.PI - 0.4, C2Y], [15.6, 18, -Math.PI / 2, P3Y], [-15.6, -30, Math.PI / 2, P3Y], [30, 44, 0.4, Y1], [31, 45, -2.4, Y1], [-41.9, 80, 0, TPY], [70.6, -66, Math.PI, P3Y], [47, 12, Math.PI / 2, Y1], [46.6, 30, -Math.PI / 2, Y1]]; }

  /* ---------- under cover (umbrellas stay closed), and the way across levels for a tap on another floor ---------- */
  function isOut(T, x, z, y) { if (y > P3Y - 1 && Math.abs(x) < SX && Math.abs(z) < 120) return false; if (Math.abs(x) < SX + 0.5 && Math.abs(z) < 140 && y < P3Y - 1) return false; if (inR(x, z, BAR, 0.2) || inR(x, z, THALL) || inR(x, z, [MBOX[0], MBOX[1], MCON[0], MPZ[1]]) || inR(x, z, BR1) || inR(x, z, BR3) || inR(x, z, [42.4, 51.6, -22, 62]) || inR(x, z, [DECK[0], DECK[0] + 6, DECK[2], DECK[3]]) && y < C2Y + 0.5) return false;
    if (y > TPY - 0.5 && y < TPY + 1 && (inR(x, z, [TI1[0], TI1[1], -60, 100]) || inR(x, z, [TI2[0], TI2[1], -60, 100]))) return false; var Bd = T.rd.bld, i; for (i = 0; i < Bd.length; i++) if (inR(x, z, Bd[i], 0.2)) return false; return true; }
  /* the levels: the street east of the railway (0) and west of it (7), 2F (1: the concourse, the bridges, the deck, the railway's hall, the
     metro's concourse), the platforms (2: east, 3: west, 4: the metro's), the railway's islands (5: east, 6: west). Every way between them
     passes through 2F, and on 2F through the doors between its rooms and the fare gates (a small graph of rooms). */
  function areaOf(T, q) { var x = q[0], y = q[1], z = q[2]; if (y > P3Y - 1.2) { if (inR(x, z, [MPL[0], MPL[1], MPZ[0], MPZ[1]], 1)) return 4; return x > 0 ? 2 : 3; } if (y > C2Y - 1.2) return 1; if (y > TPY - 0.6 && y < TPY + 0.8 && inR(x, z, [TI1[0], TI1[1], TPZ[0], TPZ[1]])) return 5; if (y > TPY - 0.6 && y < TPY + 0.8 && inR(x, z, [TI2[0], TI2[1], TPZ[0], TPZ[1]])) return 6; return x < -65 ? 7 : 0; }
  var LINKS = { /* [a point on the level, a point on 2F] */ 0: [[[10.5, Y1, 10.6], [10.5, C2Y, 25.4]], [[71, Y1, -13.2], [71, C2Y, -27.4]], [[-26.5, Y1, -23.4], [-26.5, C2Y, -36.6]], [[27.5, Y1, 132], [27.5, C2Y, 66]]], 7: [[[-80, Y1, 30], [-65.4, C2Y, 30]]], 2: [[[12.5, P3Y, -17.2], [12.5, C2Y, -2.8]]], 3: [[[-12.5, P3Y, -17.2], [-12.5, C2Y, -2.8]]], 4: [[[70.6, P3Y, -55.2], [70.6, C2Y, -40.8]]], 5: [[[-41.9, TPY, 48.2], [-41.9, C2Y, 37.2]]], 6: [[[-56.5, TPY, 48.2], [-56.5, C2Y, 37.2]]] };
  /* the rooms of 2F and the ways between them (through doors and gates) */
  function room(x, z) { if (inR(x, z, [MBOX[0] - 0.5, MBOX[1], MCON[0] - 20, MCON[1]])) return z < MGATE ? 'MP' : 'M'; if (inR(x, z, BR3, 0.5)) return 'B3'; if (inR(x, z, [DECK[0], DECK[1] + 1, DECK[2], DRAMP[3]])) return 'D'; if (inR(x, z, [THALL[0] - 2, THALL[1], THALL[2], THALL[3] + 4])) return z > TPAID ? 'HP' : 'H'; if (inR(x, z, BR1, 0.5)) return 'B1'; if (inR(x, z, [EX4[0], -SX, EX4[2], EX4[3]])) return 'L';
    if (z > PAID[3]) return 'CS'; if (z < PAID[2]) return 'CN'; return Math.abs(x) > PAID[1] ? 'CC' : 'CP'; }
  var RE2 = { 'CS|CP': [[6, 10], [6, 7]], 'CS|CC': [[19, 10]], 'CC|CN': [[19, -26]], 'CS|B1': [[-19, 30], [-22, 30]], 'B1|H': [[-27.5, 30], [-30, 30]], 'H|HP': [[-48, 34.6], [-48, 37.4]], 'CS|D': [[19, 30], [22.5, 30]], 'CN|B3': [[19, -30.5], [22.5, -30.5]], 'B3|M': [[59.5, -30.5], [62, -30.5]], 'M|MP': [[71.3, -34.6], [71.3, -37.4]], 'CN|L': [[-19, -41], [-22.5, -41]] };
  function path2F(a, b) { var A = room(a[0], a[2]), Bt = room(b[0], b[2]); if (A === Bt) return []; var Q = [[A]], seen = {}; seen[A] = 1; while (Q.length) { var p = Q.shift(), cur = p[p.length - 1]; if (cur === Bt) { var out = []; for (var i = 0; i < p.length - 1; i++) { var k = p[i] + '|' + p[i + 1], w = RE2[k]; if (!w) { w = RE2[p[i + 1] + '|' + p[i]].slice().reverse(); } w.forEach(function (q) { out.push([q[0], C2Y, q[1]]); }); } return out; }
      Object.keys(RE2).forEach(function (k) { var e = k.split('|'), nx = e[0] === cur ? e[1] : e[1] === cur ? e[0] : null; if (nx && !seen[nx]) { seen[nx] = 1; Q.push(p.concat([nx])); } }); } return []; }
  function stairPlan(T, A, G2) { var a = areaOf(T, A), g = areaOf(T, G2); if (a === g && a !== 1) return []; function best(lv, from, to) { var L = LINKS[lv], b = null, bd = 1e9; L.forEach(function (k) { var d = Math.hypot(k[0][0] - from[0], k[0][2] - from[2]) + Math.hypot(k[1][0] - to[0], k[1][2] - to[2]); if (d < bd) { bd = d; b = k; } }); return b; }
    var out = [], s2 = A, e2 = G2, k1 = null, k2 = null; if (a !== 1) { k1 = best(a, A, g !== 1 ? LINKS[g][0][1] : G2); s2 = k1[1]; out.push(k1[0], k1[1]); } if (g !== 1) { k2 = best(g, G2, s2); e2 = k2[1]; }
    out = out.concat(path2F(s2, e2)); if (k2) out.push(k2[1], k2[0]); return out; }

  var MOD = Object.assign({}, TPE3D, { build: build, isOut: isOut, stairPlan: stairPlan, tpeNow: TPE3D.tpeNow, mats: function () { init(); return mats(); }, traTrain: traTrain, mrtTrain: mrtTrain, emu: emu, atlas: atlas, xUV: xUV, roofY: roofY, roofW: roofW, mrtStep: mrtStep });
  return MOD;
})();


