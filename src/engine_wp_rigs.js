/* ===== [engine_wp_rigs.js] WPRigs: the stages as work in progress ===== */
/* ===== Waterproofing materials – mineral-based: the stages as work in progress =====
   WPRigs.build(C) makes, for one member, every stage that is animated: the substrate preparation (jetting, levelling, raking, milling,
   priming, pre-wetting), the details (cove, pipe sleeve, tape, drill holes and injection) and the coats (brush, notched trowel, flat trowel,
   spray), then boards, tiles, plaster, curing, backfill and filling. Everything is a function of the stage time S = tw · dur, so scrubbing
   and stills work. Tools and effects come from CRPrepKit (cr-prep.js) and WPKit (wp-3d.js). */
var WPRigs = (function () {
  var E = function (t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function tri(x) { x = x % 1; return x < 0.5 ? x * 2 : 2 - x * 2; }
  function build(C) {
    var P = C.P, K = C.K, K2 = C.K2, parts = C.parts, clip = C.clip, cut = C.cut, XC = C.XC, scn = C.scn, noise = C.noise, ground = C.floor != null ? C.floor : C.ground, N = SMALL3D ? 0.55 : 1, none = function () { return null; }, W = C.W, S = C.S, hw = C.hw;
    var ST = {}, rig = { dur: {}, has: function (id) { return !!ST[id]; } };
    function stage(id, dur, phases, run, an) { ST[id] = { dur: dur, ph: phases, run: run, an: an }; rig.dur[id] = dur; }
    function u(ph, k, S2) { var p = ph[k]; return p ? (S2 - p[0]) / (p[1] - p[0]) : -9; }
    function io(ph, k, S2) { var p = ph[k], IN = 0.4, OUT = 0.32; if (!p || S2 < p[0] - IN || S2 > p[1] + OUT) return 1; if (S2 < p[0]) return 1 - E((S2 - (p[0] - IN)) / IN); if (S2 > p[1]) return E((S2 - p[1]) / OUT); return 0; }
    function active(ph, S2) { var best = null, k; for (k in ph) if (S2 >= ph[k][0] - 0.4 && (!best || ph[k][0] > ph[best][0])) best = k; return best; }
    /* tools */
    var lance = K.lance(), hose = K.hose(), broom = K.broom(), trowel = K.trowel(), flat = K.trowel(0.3, 0.12), trowelS = K.trowel(0.16, 0.075), sponge = K.sponge(), gun = K.sprayGun(), blaster = K.blaster(), notched = K2.notched(), roller = K2.roller(), drill = K2.drill(P.holes ? P.holes.d + 0.04 : 0.34), igun = K2.gun(), cutter = K.cutter(), darby = K2.darby(0.9), chipper = K2.chipper(), scarifier = scn === 'park' ? K2.scarifier() : null, SCS = 0.8; if (scarifier) scarifier.scale.setScalar(SCS);
    var tools = [lance, hose, broom, trowel, flat, trowelS, sponge, gun, blaster, notched, roller, drill, igun, cutter, darby, chipper]; if (scarifier) tools.push(scarifier, scarifier.userData.hose, scarifier.userData.cable);
    function hideTools() { tools.forEach(function (t) { t.visible = false; }); }
    /* effects */
    var spray = K.cloud(Math.round(240 * N), { size: 0.011, color: 0xeef7fc, opacity: 0.8, life: 0.42, speed: 2.2, spread: 0.9, up: 0.35, out: 0.9 }), mist = K.cloud(Math.round(90 * N), { size: 0.07, color: 0xf4fafd, opacity: 0.16, life: 0.9, speed: 0.6, spread: 0.7, up: 0.5, out: 0.7, g: 0.4 }),
      mistC = K.cloud(Math.round(120 * N), { size: 0.05, color: 0xf6fbfe, opacity: 0.2, life: 1.1, speed: 0.5, spread: 0.9, up: 0.1, out: 0.8, g: 0.6 }), splat = K.cloud(Math.round(120 * N), { size: 0.012, color: 0x8e9295, opacity: 0.95, life: 0.35, speed: 1.4, spread: 1, up: 0.1, out: 0.7, grain: true }),
      dust = K.cloud(Math.round(150 * N), { size: 0.1, color: 0x9d9990, opacity: 0.26, life: 1.6, speed: 0.45, spread: 0.8, up: 0.7, out: 0.6, g: 0.02, wind: 0.08 }), grit = K.cloud(Math.round(160 * N), { size: 0.0045, color: 0xcfc3a6, opacity: 0.9, life: 0.3, speed: 2.6, spread: 1, up: 0.2, out: 0.8, grain: true }), sawdust = K.cloud(Math.round(60 * N), { size: 0.07, color: 0xa8a49c, opacity: 0.26, life: 0.7, speed: 1.3, spread: 0.5, up: 0.9, out: 0.4, g: 0.6 }), chips = K.debris(Math.round(70 * N)), plasterDust = K.cloud(Math.round(110 * N), { size: 0.09, color: 0xcfc9bc, opacity: 0.22, life: 1.4, speed: 0.5, spread: 0.8, up: 0.5, out: 0.7, g: 0.05 }), millDust = K.cloud(Math.round(120 * N), { size: 0.075, color: 0xa8a49b, opacity: 0.2, life: 1.1, speed: 0.4, spread: 0.9, up: 0.28, out: 0.25, g: 0.03, wind: 0.05 }), puddle = K.puddle(scn === 'ext' ? P.toe * 0.5 : 0.3), PR = scn === 'ext' ? P.toe * 0.45 : 0.28;
    var clouds = [spray, mist, mistC, splat, dust, grit, sawdust, plasterDust, millDust]; function clearClouds() { clouds.forEach(function (c) { c.update(0, none); }); chips.update(0, none); }
    var DIRJ = new THREE.Vector3(0.42, 0.36, 1).normalize(), DIRW = new THREE.Vector3(0.3, 0.6, 1).normalize(), DIRS = new THREE.Vector3(0.22, 0.3, 1).normalize(), DIRB = new THREE.Vector3(0.5, 0.24, 1).normalize(), DIRJF = new THREE.Vector3(0.35, 1, 0.55).normalize(), DIRWF = new THREE.Vector3(0.25, 1, 0.7).normalize(), DIRSF = new THREE.Vector3(0.2, 1, 0.45).normalize();
    function midOf(x, y, z, D, so) { return [x + D.x * so * 0.5, y + D.y * so * 0.5, z + D.z * so * 0.5]; }
    /* placing a pressed tool on the floor (facing +y): the body up and towards the operator */
    function pressF(tool, x, y, z, tilt, yaw, out) { tool.visible = out < 0.999; if (!tool.visible) return; var lip = tool.userData.lip != null ? tool.userData.lip : (tool.userData.h ? tool.userData.h / 2 : 0); if (tool.userData.w && yaw) lip = lip * Math.abs(Math.cos(yaw)) + tool.userData.w / 2 * Math.abs(Math.sin(yaw)); tool.position.set(x + out * 0.15, y + lip * Math.sin(Math.abs(tilt)) + out * 0.6, z + out * 0.3); tool.rotation.set(Math.PI / 2 + tilt, 0, yaw); }
    /* a pressed tool following a coat sweep: wall → K.press, floor → pressF */
    function follow(tool, q, tilt, yaw, out, lift) { if (q.kind === 'wall') K.press(tool, q.x, q.y, q.z + (lift || 0.001), tilt, yaw, out); else pressF(tool, q.x, q.y + (lift || 0.001), q.z, tilt, yaw, out); }
    function aimAt(tool, q, standoff, out, lift) { if (q.kind === 'wall') K.aim(tool, [q.x, q.y, q.z + (lift || 0)], tool === gun ? DIRS : DIRW, standoff, out); else K.aim(tool, [q.x, q.y + (lift || 0), q.z], tool === gun ? DIRSF : DIRWF, standoff, out); }
    /* the roller rolls along the row: its handle trails the direction of travel */
    function rollYaw(q) { var d = q.seg && q.seg.r ? q.seg.r.at(q.su).dir : true; return d ? 0 : Math.PI; }
    var RM4 = new THREE.Matrix4(), RBX = new THREE.Vector3(), RBY = new THREE.Vector3(), RBZ = new THREE.Vector3();
    function placeRoller(tool, q, out, lift) { tool.visible = out < 0.999; if (!tool.visible) return; var fwd = q.seg && q.seg.r ? (q.seg.r.at(q.su).dir ? 1 : -1) : 1;
      if (q.kind === 'wall') { RBX.set(fwd, 0, 0); RBY.set(0, -fwd, 0); RBZ.set(0, 0, -1); RM4.makeBasis(RBX, RBY, RBZ); tool.setRotationFromMatrix(RM4); tool.position.set(q.x - 0.04 * fwd * out, q.y + 0.02 + out * 0.3, q.z + (lift || 0.001) + out * 0.35); }
      else { RBX.set(fwd, 0, 0); RBY.set(0, 0, fwd); RBZ.set(0, -1, 0); RM4.makeBasis(RBX, RBY, RBZ); tool.setRotationFromMatrix(RM4); tool.position.set(q.x - 0.15 * fwd * out, q.y + (lift || 0.001) + out * 0.45, q.z + out * 0.25); }
      var rl = tool.userData.roll; if (rl) { var lp = tool.userData.lp || (tool.userData.lp = new THREE.Vector3(q.x, q.y, q.z)); var dd = Math.sqrt((q.x - lp.x) * (q.x - lp.x) + (q.y - lp.y) * (q.y - lp.y) + (q.z - lp.z) * (q.z - lp.z)); if (dd < 0.25) rl.rotation.y -= dd / 0.024; lp.set(q.x, q.y, q.z); } }
    function toolAnchor(q, k) { return q.kind === 'wall' ? { k: k, p: [q.x, q.y + 0.03, q.z + 0.09] } : { k: k, p: [q.x, q.y + 0.09, q.z] }; }
    /* the matt damp look: a film over the worked faces, cut to a mask that follows a raster */
    var allFilms = [];
    function wetOn(coat, z) { // wet films on the faces of a coat's patches (the film sits where the coat will be)
      var films = coat.segs.map(function (s) { var pt = s.pt, x0 = s.x0, x1 = pt.x1, w = x1 - x0, h = pt.a1 - pt.a0, geo = C.keep(new THREE.PlaneGeometry(w, h)); if (pt.kind === 'wall') geo.translate((x0 + x1) / 2, (pt.a0 + pt.a1) / 2, 0); else { geo.rotateX(-Math.PI / 2); geo.translate((x0 + x1) / 2, 0, (pt.a0 + pt.a1) / 2); }
        var uv = geo.attributes.uv, k; for (k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) * w + (x0 - pt.x0)) / (pt.x1 - pt.x0), uv.getY(k)); uv.needsUpdate = true;
        var f = K.wetFilm(geo, pt.kind === 'wall' ? (pt.off + (z || 0)) : 0); if (pt.kind === 'floor') { f.children[0].position.set(0, pt.off + (z || 0), 0); f.children[1].position.set(0, pt.off + (z || 0) + 0.0003, 0); } return { f: f, s: s }; });
      allFilms.push.apply(allFilms, films);
      return { set: function (u2, strength) { films.forEach(function (o) { var su = clamp(coat.total ? (u2 * coat.total - o.s.start) / o.s.w : u2); if (o.s.mask) { o.f.set(su > 0.001 || strength > 0 ? o.s.mask : null, strength); } }); }, setMaskProgress: function (u2) { coat.set(u2); } };
    }
    /* the room's return wall: a second set of tools that live in its frame, made when a coat asks for them */
    var RT = {};
    function roomTool(kind) { var F = C.room && C.room.F; if (!F) return null; if (!RT[kind]) { var t = kind === 'roller' ? K2.roller() : kind === 'notched' ? K2.notched() : kind === 'trowel' ? K.trowel() : kind === 'spray' ? K.sprayGun() : K.broom(); F.g.add(t); tools.push(t); RT[kind] = t; } return RT[kind]; }
    /* a coat applied by a tool over its sweep, with an optional smoothing pass; a coat with a twin on the return wall (coat.R) is swept there first, by the frame's own tool */
    function coatStage(id, dur, coat, o) {
      o = o || {}; var R = coat.R, F = C.room && C.room.F, tR = R && F ? Math.min(2.8, dur * 0.3) : 0; if (tR) dur += tR + 0.3;
      var ph = { apply: [0.3 + (tR ? tR + 0.3 : 0), dur - (o.smooth ? 2.2 : 1.1)] }; if (tR) ph.applyR = [0.3, 0.3 + tR]; if (o.smooth) ph.smooth = [dur - 1.9, dur - 0.5];
      var tool = o.tool || 'broom', lift = o.lift || 0.0012, pre = coat.total ? 1 : 1;
      var srcS = function (t) { if (tR && t >= ph.applyR[0] && t <= ph.applyR[1]) { var qR = R.at((t - ph.applyR[0]) / (ph.applyR[1] - ph.applyR[0])); return F.to([qR.x, qR.y, qR.z + 0.004]); } if (t < ph.apply[0] || t > ph.apply[1]) return null; var q = coat.at((t - ph.apply[0]) / (ph.apply[1] - ph.apply[0])); return [q.x, q.y + (q.kind === 'floor' ? 0.004 : 0), q.z + (q.kind === 'wall' ? 0.004 : 0)]; };
      stage(id, dur, ph, function (S2, ph2, xr) {
        var uA = u(ph2, 'apply', S2), ao = io(ph2, 'apply', S2), q = coat.at(clamp(uA));
        if (tR) { var uR = u(ph2, 'applyR', S2), oR = io(ph2, 'applyR', S2); R.show(true); R.set(clamp(uR)); if (oR < 0.999) { var qR = R.at(clamp(uR)), tl = roomTool(tool); if (tool === 'spray') { K.aim(tl, [qR.x, qR.y, qR.z + 0.001], DIRS, tl.userData.standoff.spray, oR); tl.userData.stream(S2, oR < 0.6); } else if (tool === 'roller') { placeRoller(tl, qR, oR, lift + 0.004); tl.userData.roll.rotation.y = S2 * 12; } else { K.press(tl, qR.x + (tool === 'broom' ? 0.012 * Math.sin(S2 * 16) : 0), qR.y, qR.z + lift, tool === 'broom' ? 0.35 : 0.3, tool === 'broom' ? 0 : Math.PI / 2, oR); } } else if (RT[tool] && RT[tool].userData.stream) RT[tool].userData.stream(S2, false); }
        coat.show(true); coat.set(clamp(uA)); if (o.cove) coveSweep(o.cove, coat, clamp(uA));
        if (ao < 0.999) { if (tool === 'broom') { follow(broom, q, 0.35, q.kind === 'wall' ? 0 : 0.2, ao, lift); broom.position.x += 0.012 * Math.sin(S2 * 16); } else if (tool === 'notched') { follow(notched, q, -0.3, q.kind === 'wall' ? Math.PI / 2 : 0.1, ao, lift); } else if (tool === 'trowel') { follow(trowel, q, 0.32, q.kind === 'wall' ? Math.PI / 2 : 0.1, ao, lift); } else if (tool === 'spray') { aimAt(gun, q, gun.userData.standoff.spray, ao, 0.001); gun.userData.stream(S2, ao < 0.6); } else if (tool === 'roller') { placeRoller(roller, q, ao, lift + 0.004); roller.userData.roll.rotation.y = S2 * 12; } }
        if (tool === 'spray') splat.update(S2, srcS, ground); else splat.update(0, none);
        if (o.smooth) { var uS = u(ph2, 'smooth', S2), so = io(ph2, 'smooth', S2); if (so < 0.999) { var qs = coat.at(clamp(uS)); follow(flat, qs, 0.22, qs.kind === 'wall' ? Math.PI / 2 : 0.1, so, lift + 0.0006); flat.position.x += 0.02 * Math.sin(S2 * 5); } }
        if (o.wet) o.wet(clamp(uA), S2);
      }, function (S2, ph2) { var L = [], k = active(ph2, S2), lb = o.label || (tool === 'spray' ? 'sprayC' : tool === 'notched' ? 'trowelC' : tool === 'roller' ? 'rollP' : tool === 'trowel' ? 'trowelC' : (o.second ? 'brushC2' : 'brushC')); if (k === 'smooth') { var qs = coat.at(clamp(u(ph2, 'smooth', S2))); L.push(toolAnchor(qs, 'smoothC')); } else if (k === 'applyR') { var qR = R.at(clamp(u(ph2, 'applyR', S2))); L.push({ k: lb, p: F.to([qR.x, qR.y + 0.03, qR.z + 0.09]) }); } else { var q = coat.at(clamp(u(ph2, 'apply', S2))); L.push(toolAnchor(q, lb)); if (u(ph2, 'apply', S2) > 0.5 && o.layer) L.push({ k: o.layer, p: o.layerAt || [cut ? XC + 0.05 : -0.35, 0.8, 0.008] }); } return L; });
    }
    /* the cove shell of a coat is brushed when the sweep passes from the wall to the floor */
    function coveSweep(pl, coat, uA) { var seg0 = coat.segs[0], uB = coat.total ? (seg0.start + seg0.w) / coat.total : 0.5, x0 = cut ? XC : -hw, x1 = hw; if (coat.segs.length < 2) uB = 1.02; if (uA < uB - 0.05) pl.constant = -10; else if (uA > uB + 0.05) pl.constant = 10; else pl.constant = x0 + (uA - (uB - 0.05)) / 0.1 * (x1 - x0); }
    /* the trowelled cove itself: a pointing trowel runs along the joint while the shell grows along x */
    function coveStage(id, dur, pl, preM, o) {
      o = o || {}; var ph = preM ? { pre: [0.3, 2.2], cove: [2.6, dur - 0.5] } : { cove: [0.3, dur - 0.5] }, x0 = cut ? XC : -hw, x1 = hw, R = o.R || P.cove;
      stage(id, dur, ph, function (S2, ph2) {
        if (preM) { var uP = u(ph2, 'pre', S2), po = io(ph2, 'pre', S2); preM.visible = uP > 0; clip.pre.constant = uP <= 0 ? -10 : x0 - 0.002 + clamp(uP) * (x1 - x0 + 0.004); if (po < 0.999) { K.press(broom, x0 + clamp(uP) * (x1 - x0) - 0.03, R * 0.6 + 0.02, 0.003, 0.5, 0, po); } }
        var uC = u(ph2, 'cove', S2), co = io(ph2, 'cove', S2); if (o.mesh) o.mesh.visible = uC > 0; pl.constant = uC <= 0 ? -10 : x0 - 0.002 + clamp(uC) * (x1 - x0 + 0.004);
        if (co < 0.999) K.press(trowelS, x0 + clamp(uC) * (x1 - x0) - 0.03, R * 0.55, R * 0.55, -0.7, Math.PI / 2, co);
      }, function (S2, ph2) { var k = active(ph2, S2), L = []; if (k === 'pre') { L.push({ k: 'pre', p: [x0 + clamp(u(ph2, 'pre', S2)) * (x1 - x0), R + 0.06, 0.08] }); } else { var f = clamp(u(ph2, 'cove', S2)); L.push({ k: 'troCove', p: [x0 + f * (x1 - x0), R + 0.05, 0.09] }); if (f > 0.4) L.push({ k: 'cove', p: [x0 + f * (x1 - x0) * 0.4, R * 0.5, R * 0.6] }); } return L; });
    }
    /* the curing mist from the hose over the wall (and the floor), the dryer put down */
    function cureStage(id, dur, coat, o) {
      o = o || {}; var ph = { mist: [0.3, dur - 2.0] }; if (o.dryer) ph.dryer = [dur - 1.7, dur - 0.5];
      var srcM = function (t) { if (t < ph.mist[0] || t > ph.mist[1]) return null; var q = coat.at((t - ph.mist[0]) / (ph.mist[1] - ph.mist[0])); return [q.x, q.y + (q.kind === 'floor' ? 0.004 : 0), q.z + (q.kind === 'wall' ? 0.004 : 0)]; };
      stage(id, dur, ph, function (S2, ph2) {
        var uM = u(ph2, 'mist', S2), mo = io(ph2, 'mist', S2); if (mo < 0.999) { var q = coat.at(clamp(uM)); aimAt(hose, q, hose.userData.standoff.fan, mo, 0.002); hose.userData.mode(mo < 0.6 ? 'fan' : 'off'); }
        mistC.update(S2, srcM, ground); var wet = clamp(uM * 1.5); C.wetLook.forEach(function (w) { if (o.mats.indexOf(w.m) >= 0) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.25 * wet); w.m.roughness = w.r - (w.r - 0.3) * wet; } });
        if (parts.film) { parts.film.visible = false; }
        if (o.dryer && parts.dryer) { var uD = u(ph2, 'dryer', S2); parts.dryer.visible = uD > -0.3; var e = E(clamp(uD)); parts.dryer.position.y = (o.floorY || 0) + (1 - e) * 0.6; parts.dryer.scale.setScalar(0.75 * (0.6 + 0.4 * e)); }
      }, function (S2, ph2) { var k = active(ph2, S2), L = []; if (k === 'dryer' && parts.dryer) L.push({ k: 'dryer', p: [parts.dryer.position.x, 0.5, parts.dryer.position.z] }); else { var q = coat.at(clamp(u(ph2, 'mist', S2))); L.push(q.kind === 'wall' ? { k: 'mistT', p: midOf(q.x, q.y, q.z, DIRW, hose.userData.standoff.fan) } : { k: 'mistT', p: midOf(q.x, q.y, q.z, DIRWF, hose.userData.standoff.fan) }); } return L; });
    }
    /* high-pressure jetting over a set of faces (a Coat object gives the sweep), the water film and the puddle */
    function jetOver(coat, ph2, S2, kJet, wetF) { var uJ = u(ph2, kJet, S2), jo = io(ph2, kJet, S2); if (jo < 0.999) { var q = coat.at(clamp(uJ)); aimAt(lance, q, lance.userData.standoff.jet, jo, 0.001); lance.userData.mode(jo < 0.6 ? 'jet' : 'off'); if (lance.userData.water) lance.userData.water.update(S2, jo < 0.6, q, ground); } else if (lance.userData.water) lance.userData.water.update(S2, false, null, ground); var src = function (t) { if (t < ph2[kJet][0] || t > ph2[kJet][1]) return null; var q2 = coat.at((t - ph2[kJet][0]) / (ph2[kJet][1] - ph2[kJet][0])); return [q2.x, q2.y + (q2.kind === 'floor' ? 0.003 : 0), q2.z + (q2.kind === 'wall' ? 0.003 : 0)]; }; if (!lance.userData.water) { spray.update(S2, src, ground); mist.update(S2, src, null); } else { spray.update(S2, none, ground); mist.update(S2, none, null); } if (wetF) wetF.set(clamp(uJ), uJ > 0 ? (uJ <= 1 ? 1 : Math.max(0, 1 - (S2 - ph2[kJet][1]) / 1.2)) : 0); puddle.set(cut ? 0.15 : 0, PR * (uJ > 0 ? (uJ <= 1 ? 1 : Math.max(0, 1 - (S2 - ph2[kJet][1]) / 2.5)) : 0)); return uJ; }
    function wetOver(coat, ph2, S2, kWet, wetF, keepAfter) { var uW = u(ph2, kWet, S2), wo = io(ph2, kWet, S2); if (wo < 0.999) { var q = coat.at(clamp(uW)); aimAt(hose, q, hose.userData.standoff.fan, wo, 0.001); hose.userData.mode(wo < 0.6 ? 'fan' : 'off'); } var src = function (t) { if (t < ph2[kWet][0] || t > ph2[kWet][1]) return null; var q2 = coat.at((t - ph2[kWet][0]) / (ph2[kWet][1] - ph2[kWet][0])); return [q2.x, q2.y + (q2.kind === 'floor' ? 0.003 : 0), q2.z + (q2.kind === 'wall' ? 0.003 : 0)]; }; mistC.update(S2, src, ground); if (wetF) wetF.set(clamp(uW), uW > 0 ? (uW <= 1 ? 1 : (keepAfter ? 0.6 : Math.max(0.6, 1 - (S2 - ph2[kWet][1]) / 1.5))) : 0); return uW; }

    /* ========== the applications ========== */
    if (scn === 'ext') {
      var faceE = parts.c1, wetE = wetOn(faceE, -0.0016); // the film lies on the concrete, under the coats
      var phP = { jet: [0.3, 3.2], level: [3.6, 6.2], wet: [6.6, 8.4] };
      stage('prep', 9.0, phP, function (S2, ph2) {
        var uJ = jetOver(faceE, ph2, S2, 'jet', null), uL = u(ph2, 'level', S2), lo = io(ph2, 'level', S2), uW = u(ph2, 'wet', S2);
        parts.level.show(uL > 0); parts.level.set(clamp(uL)); if (lo < 0.999) { var q = parts.level.at(clamp(uL)); K.press(trowel, q.x, q.y, 0.0018, 0.3, Math.PI / 2 + 0.2 * Math.sin(S2 * 4), lo); }
        var wetA = uJ > 0 ? (uJ <= 1 ? 1 : Math.max(0, 1 - (S2 - ph2.jet[1]) / 1.4)) : 0; wetOver(faceE, ph2, S2, 'wet', null); var wetB = uW > 0 ? Math.max(0.6, clamp(uW)) : 0; wetE.set(uJ > 0 && uW <= 0 ? clamp(uJ) : clamp(uW), Math.max(wetA, wetB));
      }, function (S2, ph2) { var k = active(ph2, S2), L = []; if (k === 'wet') { var q = faceE.at(clamp(u(ph2, 'wet', S2))); L.push(toolAnchor(q, 'hoseW')); if (u(ph2, 'wet', S2) > 0.5) L.push({ k: 'matt', p: [cut ? XC + 0.05 : -0.35, 0.5, 0.002] }); } else if (k === 'level') { var q2 = parts.level.at(clamp(u(ph2, 'level', S2))); L.push(toolAnchor(q2, 'troLevel')); L.push({ k: 'level', p: [cut ? XC + 0.05 : -0.35, 0.85, 0.002] }); } else { var q3 = faceE.at(clamp(u(ph2, 'jet', S2))); L.push(q3.kind === 'wall' ? { k: 'jet', p: midOf(q3.x, q3.y, q3.z, DIRW, lance.userData.standoff.jet) } : { k: 'jet', p: midOf(q3.x, q3.y, q3.z, DIRWF, lance.userData.standoff.jet) }); } return L; });
      coveStage('cove', 5.6, clip.cove, parts.pre, { mesh: parts.cove });
      /* the pipe: RB400 combed round the pipe with the notched trowel, the sleeve pressed on, the overcoat with the flat trowel */
      var PP = P.pipe, phPipe = { bed: [0.3, 2.2], sleeve: [2.6, 3.7], over: [4.0, 5.3] };
      stage('pipe', 5.8, phPipe, function (S2, ph2) {
        var uB = u(ph2, 'bed', S2), bo = io(ph2, 'bed', S2), uS = u(ph2, 'sleeve', S2), uO = u(ph2, 'over', S2), oo = io(ph2, 'over', S2);
        parts.bed.visible = uB > 0; if (parts.bedMask) parts.bedMask.update(clamp(uB)); if (bo < 0.999) { var a = clamp(uB) * Math.PI * 2 * 1.3, r = PP.r + 0.09; K.press(notched, PP.x + Math.cos(a) * r, PP.y + Math.sin(a) * r, 0.0025, 0.3, a + Math.PI / 2, bo); }
        var e = E(clamp(uS)); parts.sleeve.visible = uS > 0; parts.sleeve.scale.set(1, 1, 1); parts.sleeve.position.z = (1 - e) * 0.25; parts.sleeve.children.forEach(function (c) { c.material.opacity = 1; });
        parts.over.visible = uO > 0; if (parts.overMask) parts.overMask.update(clamp(uO)); if (oo < 0.999) { var a2 = clamp(uO) * Math.PI * 2 * 1.2, r2 = PP.r + 0.1; K.press(flat, PP.x + Math.cos(a2) * r2, PP.y + Math.sin(a2) * r2, 0.0045, 0.25, a2 + Math.PI / 2, oo); }
      }, function (S2, ph2) { var k = active(ph2, S2), L = []; if (k === 'over') L.push({ k: 'sleeve', p: [PP.x, PP.y + PP.r + 0.08, 0.01] }); else if (k === 'sleeve') L.push({ k: 'sleeveT', p: [PP.x, PP.y + PP.r + 0.06, 0.02 + (1 - E(clamp(u(ph2, 'sleeve', S2)))) * 0.25] }); else { var a = clamp(u(ph2, 'bed', S2)) * Math.PI * 2 * 1.3; L.push({ k: 'notch', p: [PP.x + Math.cos(a) * (PP.r + 0.09), PP.y + Math.sin(a) * (PP.r + 0.09) + 0.03, 0.09] }); } return L; });
      coatStage('coat1', 7.4, parts.c1, { tool: 'broom', cove: clip.c1c, layer: 'c1', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.005] });
      coatStage('coat2', 7.8, parts.c2, { tool: 'spray', smooth: true, cove: clip.c2c, layer: 'c2', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.007] });
      /* the boards: the adhesive combed with the notched trowel, then each panel pressed into the bed */
      var phB = { comb: [0.3, 3.0], boards: [3.3, 5.8] };
      stage('board', 6.4, phB, function (S2, ph2) {
        var uC = u(ph2, 'comb', S2), co = io(ph2, 'comb', S2), uB = u(ph2, 'boards', S2);
        parts.sand.show(uC > 0); parts.sand.set(clamp(uC)); if (co < 0.999) { var q = parts.sand.at(clamp(uC)); K.press(notched, q.x, q.y, 0.0085, 0.3, Math.PI / 2, co); }
        var nb = parts.boards.length; parts.boards.forEach(function (b, i) { var f = clamp((clamp(uB) * nb - i)); b.visible = f > 0; var e = E(f); b.position.copy(b.userData.home); b.position.z += (1 - e) * 0.35; b.position.y += (1 - e) * 0.1; });
      }, function (S2, ph2) { var k = active(ph2, S2), L = []; if (k === 'boards') { var nb = parts.boards.length, i = Math.min(nb - 1, Math.floor(clamp(u(ph2, 'boards', S2)) * nb)), b = parts.boards[i]; L.push({ k: 'boardT', p: [b.position.x, 0.6, b.position.z + 0.05] }); } else { var q = parts.sand.at(clamp(u(ph2, 'comb', S2))); L.push(toolAnchor(q, 'sandT')); } return L; });
      stage('done', 4.6, { fill: [0.3, 4.2] }, function (S2, ph2) { C.self.setFill(E(clamp(u(ph2, 'fill', S2)))); },
        function (S2, ph2) { var L = -S.y + (P.fill + S.y) * E(clamp(u(ph2, 'fill', S2))); return [{ k: 'backfill', p: [cut ? XC + 0.02 : 0.3, L, 0.3] }, { k: 'board', p: [cut ? XC + 0.05 : -0.35, P.board.y1 - 0.02, 0.014] }]; });
    }
    if (scn === 'inner') {
      var faceI = parts.c1, wetI = wetOn(faceI, -0.0036);
      var phPI = { strip: [0.3, 4.4], rake: [4.7, 7.4], jet: [7.7, 9.6], level: [10.0, 12.6], cove: [12.9, 14.4] }, x0i = cut ? XC : -hw, RJ = K.raster(x0i, hw, 0.08, W.h - 0.08, 0.142, null), RS = parts.stripRaster || K.raster(x0i, hw, 0.05, W.h - 0.02, 0.16, noise);
      var srcChip = function (t) { if (t < phPI.strip[0] || t > phPI.strip[1]) return null; var q = RS.at((t - phPI.strip[0]) / (phPI.strip[1] - phPI.strip[0])); return [q.x, q.y, P.plaster + 0.01]; };
      stage('prep', 14.9, phPI, function (S2, ph2) {
        var uS = u(ph2, 'strip', S2), so = io(ph2, 'strip', S2), uR = u(ph2, 'rake', S2), ro = io(ph2, 'rake', S2), uL = u(ph2, 'level', S2), lo = io(ph2, 'level', S2), uC = u(ph2, 'cove', S2), co = io(ph2, 'cove', S2);
        parts.old.visible = uS < 1.05; if (parts.oldTop) parts.oldTop.visible = uS < 0.08; if (parts.oldSide) { parts.oldSide.visible = uS < 1; var yF = RS.yFront(clamp(uS)); parts.oldSide.scale.y = Math.max(0.001, yF / W.h); parts.oldSide.position.y = yF / 2; } if (parts.oldMask) parts.oldMask.update(clamp(uS)); if (parts.chips) parts.chips.visible = uS < 0.98; if (parts.raked) { parts.raked.visible = uR > 0; if (parts.rakedMask) parts.rakedMask.update(clamp(uR)); }
        if (so < 0.999) { var qs = RS.at(clamp(uS)); chipper.visible = true; chipper.position.set(qs.x + (qs.dir ? -0.02 : 0.02), qs.y + 0.012, P.plaster + 0.004 + so * 0.5 + 0.006 * Math.abs(Math.sin(S2 * 38))); chipper.rotation.set(-0.62, (qs.dir ? -1 : 1) * 0.18, 0); chipper.position.y += so * 0.3; } else chipper.visible = false; // the chisel edge just under the plaster, the machine held up and to the side, hammering
        chips.update(S2, srcChip, ground); plasterDust.update(S2, srcChip, ground);
        if (ro < 0.999) { var q = RJ.at(clamp(uR)); K.seat(cutter, { x: q.x, y: q.y, tx: q.dir ? 1 : -1, ty: 0 }, 0.02, ro); cutter.userData.disc.rotation.x = -S2 * 42; } var srcSaw = function (t) { if (t < ph2.rake[0] || t > ph2.rake[1]) return null; var q2 = RJ.at((t - ph2.rake[0]) / (ph2.rake[1] - ph2.rake[0])); return [q2.x, q2.y, 0.012]; }; sawdust.update(S2, srcSaw, null);
        var uJ = jetOver(faceI, ph2, S2, 'jet', wetI);
        parts.level.show(uL > 0); parts.level.set(clamp(uL)); if (lo < 0.999) { var q3 = parts.level.at(clamp(uL)); K.press(trowel, q3.x, q3.y, 0.0018, 0.3, Math.PI / 2 + 0.2 * Math.sin(S2 * 4), lo); }
        parts.cove.visible = uC > 0; clip.cove.constant = uC <= 0 ? -10 : x0i - 0.002 + clamp(uC) * (hw - x0i + 0.004); if (co < 0.999) K.press(trowelS, x0i + clamp(uC) * (hw - x0i) - 0.03, P.cove * 0.55, P.cove * 0.55, -0.7, Math.PI / 2, co);
        if (uJ > 1 && uL > 0.2) wetI.set(1, 0.5);
      }, function (S2, ph2) { var k = active(ph2, S2), L = [], xl = cut ? XC + 0.05 : -0.35; if (k === 'cove') { var f = clamp(u(ph2, 'cove', S2)); L.push({ k: 'troCove', p: [x0i + f * (hw - x0i), P.cove + 0.05, 0.09] }); L.push({ k: 'level', p: [xl, 0.6, 0.003] }); } else if (k === 'level') { var q = parts.level.at(clamp(u(ph2, 'level', S2))); L.push(toolAnchor(q, 'troLevel')); L.push({ k: 'matt', p: [xl, 0.3, 0.002] }); } else if (k === 'jet') { var q2 = faceI.at(clamp(u(ph2, 'jet', S2))); L.push(q2.kind === 'wall' ? { k: 'jet', p: midOf(q2.x, q2.y, q2.z, DIRW, lance.userData.standoff.jet) } : { k: 'jet', p: midOf(q2.x, q2.y, q2.z, DIRWF, lance.userData.standoff.jet) }); } else if (k === 'rake') { var q3 = RJ.at(clamp(u(ph2, 'rake', S2))); L.push({ k: 'joints', p: [q3.x, q3.y + 0.05, 0.08] }); } else { var q4 = RS.at(clamp(u(ph2, 'strip', S2))); L.push({ k: 'chipT', p: [q4.x, q4.y + 0.16, 0.3] }); if (u(ph2, 'strip', S2) > 0.35) L.push({ k: 'stripOff', p: [xl, 0.9, 0.003] }); } return L; });
      /* the horizontal barrier: drilling the row, injecting the cream, plugging the holes */
      var HO = parts.holes, nh = HO.length, phBa = { drill: [0.3, 3.4], inject: [3.7, 5.9], plug: [6.2, 7.3] };
      stage('barrier', 7.8, phBa, function (S2, ph2) {
        var uD = u(ph2, 'drill', S2), dO = io(ph2, 'drill', S2), uI = u(ph2, 'inject', S2), iO = io(ph2, 'inject', S2), uP = u(ph2, 'plug', S2), pO = io(ph2, 'plug', S2);
        HO.forEach(function (h, i) { var fd = clamp(clamp(uD) * nh - i), fi = clamp(clamp(uI) * nh - i), fp = clamp(clamp(uP) * nh - i); h.hole.visible = fd > 0; h.hole.scale.set(1, fd > 0 ? fd : 0.001, 1); h.hole.position.z = -P.holes.d * fd / 2 + 0.0005; var LC = P.holes.d - 0.02; h.cream.visible = fi > 0; h.cream.scale.set(1, Math.max(0.001, fi), 1); h.cream.position.z = -0.01 - LC + LC * fi / 2; h.plug.visible = fp > 0; });
        if (dO < 0.999) { var i = Math.min(nh - 1, Math.floor(clamp(uD) * nh)), f = clamp(uD) * nh - i, h = HO[i]; drill.visible = true; drill.position.set(h.x, P.holes.y, 0.002 - P.holes.d * f + dO * 0.5 + 0.004 * Math.abs(Math.sin(S2 * 30))); drill.rotation.set(0, 0, 0); drill.userData.bit.rotation.z = S2 * 30; drill.position.y += dO * 0.3; } else drill.visible = false; // the bit runs into the hole, the machine stays in front of the wall
        if (iO < 0.999) { var i2 = Math.min(nh - 1, Math.floor(clamp(uI) * nh)), h2 = HO[i2]; igun.visible = true; igun.position.set(h2.x, P.holes.y, -0.04 + iO * 0.5); igun.position.y += iO * 0.3; igun.rotation.set(0, 0, 0); } else igun.visible = false; // the nozzle 4 cm into the hole
        if (pO < 0.999) { var i3 = Math.min(nh - 1, Math.floor(clamp(uP) * nh)), h3 = HO[i3]; K.press(trowelS, h3.x, P.holes.y, 0.002, 0.5, 0.3 + 0.2 * Math.sin(S2 * 9), pO); }
        var srcD = function (t) { if (t < ph2.drill[0] || t > ph2.drill[1]) return null; var f2 = (t - ph2.drill[0]) / (ph2.drill[1] - ph2.drill[0]), i4 = Math.min(nh - 1, Math.floor(f2 * nh)); return [HO[i4].x, P.holes.y - 0.01, 0.004]; }; dust.update(S2, srcD, ground);
      }, function (S2, ph2) { var k = active(ph2, S2), L = [], pick = function (uu) { return HO[Math.min(nh - 1, Math.floor(clamp(uu) * nh))]; }; if (k === 'plug') { var h = pick(u(ph2, 'plug', S2)); L.push({ k: 'reseal', p: [h.x, P.holes.y + 0.03, 0.06] }); } else if (k === 'inject') { var h2 = pick(u(ph2, 'inject', S2)); L.push({ k: 'gunT', p: [h2.x, P.holes.y + 0.04, 0.2] }); L.push({ k: 'cream', p: [HO[0].x, P.holes.y - 0.02, 0.002] }); } else { var h3 = pick(u(ph2, 'drill', S2)); L.push({ k: 'drillT', p: [h3.x, P.holes.y + 0.06, 0.34] }); } return L; });
      coatStage('coat1', 7.0, parts.c1, { tool: 'broom', cove: clip.c1c, layer: 'c1i', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.006] });
      coatStage('coat2', 7.2, parts.c2, { tool: 'spray', smooth: true, cove: clip.c2c, layer: 'c2i', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.007] });
      coatStage('coat3', 7.0, parts.c3, { tool: 'broom', second: true, cove: clip.c3c, layer: 'c3i', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.008], label: 'brushC2' });
      cureStage('cure', 5.6, parts.c3, { mats: [C.mats.K1], dryer: true, floorY: 0 });
      /* the restoration plaster: the splatterdash thrown on from the trowel, then the plaster with the trowel and the darby */
      var phPl = { spl: [0.3, 2.9], pl: [3.2, 6.2], darby: [6.4, 7.4] };
      stage('plaster', 7.9, phPl, function (S2, ph2) {
        var uS = u(ph2, 'spl', S2), so = io(ph2, 'spl', S2), uP = u(ph2, 'pl', S2), po = io(ph2, 'pl', S2), uD = u(ph2, 'darby', S2), dO2 = io(ph2, 'darby', S2);
        parts.splatter.show(uS > 0); parts.splatter.set(clamp(uS)); parts.plaster.show(uP > 0); parts.plaster.set(clamp(uP)); if (parts.plasterBody) parts.plasterBody.visible = false;
        if (so < 0.999) { var q = parts.splatter.at(clamp(uS)); K.press(trowelS, q.x + 0.06, q.y - 0.05 + 0.04 * Math.sin(S2 * 12), 0.05 + 0.03 * Math.abs(Math.sin(S2 * 12)), 0.9, 0.3, so); }
        var srcSp = function (t) { if (t < ph2.spl[0] || t > ph2.spl[1]) return null; var q2 = parts.splatter.at((t - ph2.spl[0]) / (ph2.spl[1] - ph2.spl[0])); return [q2.x + 0.05, q2.y - 0.03, 0.06]; }; splat.update(S2, srcSp, ground);
        if (po < 0.999) { var q3 = parts.plaster.at(clamp(uP)); K.press(trowel, q3.x, q3.y + 0.03, 0.031, 0.42, Math.PI / 2 + 0.15 * Math.sin(S2 * 3), po); }
        if (dO2 < 0.999) { darby.visible = true; var yD = 0.06 + clamp(uD) * (W.h - 0.14); darby.position.set(cut ? (XC + hw) / 2 : 0, yD + dO2 * 0.3, 0.033 + dO2 * 0.5); darby.rotation.set(Math.PI + 0.2, 0, 0.03 * Math.sin(S2 * 9)); }
      }, function (S2, ph2) { var k = active(ph2, S2), L = [], xl = cut ? XC + 0.05 : -0.35; if (k === 'darby') { L.push({ k: 'plaster', p: [xl, 0.6, 0.031] }); } else if (k === 'pl') { var q = parts.plaster.at(clamp(u(ph2, 'pl', S2))); L.push({ k: 'plasterT', p: [q.x, q.y + 0.06, 0.1] }); L.push({ k: 'splatter', p: [xl, 0.2, 0.012] }); } else { var q2 = parts.splatter.at(clamp(u(ph2, 'spl', S2))); L.push({ k: 'splatter', p: [q2.x, q2.y + 0.05, 0.1] }); } return L; });
    }
    if (scn === 'tank') {
      var faceT = parts.c1, wetT = wetOn(faceT, -0.004), phPT = { jet: [0.3, 3.4], repair: [3.8, 5.6], smooth: [5.9, 8.6], sponge: [8.8, 9.9] };
      stage('prep', 10.4, phPT, function (S2, ph2) {
        var uJ = jetOver(faceT, ph2, S2, 'jet', wetT), uR = u(ph2, 'repair', S2), ro = io(ph2, 'repair', S2), uS = u(ph2, 'smooth', S2), so = io(ph2, 'smooth', S2), uP = u(ph2, 'sponge', S2), po = io(ph2, 'sponge', S2), nv = parts.voids.length;
        if (parts.floorMask && faceT.segs[1]) { var sF = faceT.segs[1], suF = clamp((clamp(uJ) * faceT.total - sF.start) / sF.w); parts.floorMask.update(suF); parts.floorOld.visible = suF < 1; if (parts.puddleT) parts.puddleT.visible = suF < 0.35; }
        parts.voids.forEach(function (v, i) { var f = clamp(clamp(uR) * nv - i); v.patch.visible = f > 0; v.patch.scale.set(f, 1, f); });
        if (ro < 0.999) { var i = Math.min(nv - 1, Math.floor(clamp(uR) * nv)), v = parts.voids[i]; K.press(trowelS, v.v[0] + 0.02 * Math.sin(S2 * 7), v.v[1], 0.002, 0.45, 0.3 + 0.3 * Math.sin(S2 * 5), ro); }
        parts.smooth.show(uS > 0); parts.smooth.set(clamp(uS)); if (so < 0.999) { var q = parts.smooth.at(clamp(uS)); follow(trowel, q, 0.32, q.kind === 'wall' ? Math.PI / 2 : 0.1, so, 0.0012); }
        if (po < 0.999) { var q2 = parts.smooth.at(clamp(uP)); follow(sponge, q2, 0.06, 0.1 * Math.sin(S2 * 14), po, 0.0014); sponge.position.x += 0.03 * Math.sin(S2 * 14); }
        if (uJ > 1 && uS > 0.1) wetT.set(1, 0.5);
      }, function (S2, ph2) { var k = active(ph2, S2), L = [], xl = cut ? XC + 0.05 : -0.35; if (k === 'sponge') { var q = parts.smooth.at(clamp(u(ph2, 'sponge', S2))); L.push(toolAnchor(q, 'smooth')); } else if (k === 'smooth') { var q2 = parts.smooth.at(clamp(u(ph2, 'smooth', S2))); L.push(toolAnchor(q2, 'smooth')); if (u(ph2, 'smooth', S2) > 0.5) L.push({ k: 'repair', p: [0.28, 0.62, 0.003] }); } else if (k === 'repair') { var nv = parts.voids.length, v = parts.voids[Math.min(nv - 1, Math.floor(clamp(u(ph2, 'repair', S2)) * nv))]; L.push({ k: 'repair', p: [v.v[0], v.v[1] + v.v[2] + 0.03, 0.08] }); } else { var q3 = faceT.at(clamp(u(ph2, 'jet', S2))); L.push(q3.kind === 'wall' ? { k: 'jet', p: midOf(q3.x, q3.y, q3.z, DIRW, lance.userData.standoff.jet) } : { k: 'jet', p: midOf(q3.x, q3.y, q3.z, DIRWF, lance.userData.standoff.jet) }); } return L; });
      /* the joint: RB400 brushed along the junction, the tape pressed in, brushed over */
      var x0t = cut ? XC : -hw, phJ = { bed: [0.3, 2.2], tape: [2.5, 4.5], over: [4.8, 6.0] };
      stage('joint', 6.5, phJ, function (S2, ph2) {
        var uB = u(ph2, 'bed', S2), bo = io(ph2, 'bed', S2), uT = u(ph2, 'tape', S2), to = io(ph2, 'tape', S2), uO = u(ph2, 'over', S2), oo = io(ph2, 'over', S2);
        parts.tapeBed.visible = uB > 0; clip.tbed.constant = uB <= 0 ? -10 : x0t - 0.002 + clamp(uB) * (hw - x0t + 0.004); parts.tapeBed.scale.set(1, 1, 1);
        if (bo < 0.999) K.press(broom, x0t + clamp(uB) * (hw - x0t) - 0.04, 0.04, 0.003, 0.5, 0, bo);
        parts.tape.visible = uT > 0; clip.tape.constant = uT <= 0 ? -10 : x0t - 0.002 + clamp(uT) * (hw - x0t + 0.004);
        if (to < 0.999) { flat.visible = true; var xt = x0t + clamp(uT) * (hw - x0t); flat.position.set(xt - 0.02 + to * 0.15, 0.03 + to * 0.3, 0.03 + to * 0.6); flat.rotation.set(Math.PI - 0.8, 0, Math.PI / 2); }
        if (oo < 0.999) K.press(broom, x0t + clamp(uO) * (hw - x0t) - 0.04, 0.05 + 0.03 * Math.sin(S2 * 10), 0.006, 0.5, 0, oo);
      }, function (S2, ph2) { var k = active(ph2, S2), L = []; if (k === 'over') { L.push({ k: 'over', p: [x0t + clamp(u(ph2, 'over', S2)) * (hw - x0t), 0.12, 0.09] }); L.push({ k: 'tape', p: [cut ? XC + 0.02 : 0.3, 0.03, 0.006] }); } else if (k === 'tape') { L.push({ k: 'tapeT', p: [x0t + clamp(u(ph2, 'tape', S2)) * (hw - x0t), 0.09, 0.09] }); } else { L.push({ k: 'brushC', p: [x0t + clamp(u(ph2, 'bed', S2)) * (hw - x0t), 0.1, 0.08] }); } return L; });
      coatStage('coat1', 8.0, parts.c1, { tool: 'spray', smooth: true, layer: 'c1t', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.007] });
      coatStage('coat2', 7.6, parts.c2, { tool: 'broom', second: true, label: 'brushC2', layer: 'c2t', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.008] });
      cureStage('cure', 5.6, parts.c2, { mats: [C.mats.RB], dryer: true, floorY: 0.007 });
      stage('fill', 5.2, { fill: [0.3, 4.8] }, function (S2, ph2) { var f = E(clamp(u(ph2, 'fill', S2))), hh = parts.water.userData.h * f; parts.water.visible = f > 0; parts.water.scale.y = Math.max(0.001, hh / parts.water.userData.h); parts.water.position.y = 0.007 + hh / 2; },
        function (S2, ph2) { var hh = parts.water.userData.h * E(clamp(u(ph2, 'fill', S2))); return [{ k: 'fillT', p: [cut ? XC + 0.02 : 0.2, 0.007 + hh, 0.4] }]; });
    }
    if (scn === 'balcony') {
      var faceB = parts.c1, wetB = wetOn(faceB, -0.0036), phPB = { prime: [0.3, 3.4], level: [3.8, 5.8], wet: [6.2, 8.0] };
      stage('prep', 8.5, phPB, function (S2, ph2) {
        var uP = u(ph2, 'prime', S2), po = io(ph2, 'prime', S2), uL = u(ph2, 'level', S2), lo = io(ph2, 'level', S2);
        parts.prim.show(uP > 0); parts.prim.set(clamp(uP)); if (po < 0.999) { var q = parts.prim.at(clamp(uP)); pressF(roller, q.x, 0.006, q.z, 0, rollYaw(q), po); roller.userData.roll.rotation.y = S2 * 12; }
        parts.level.show(uL > 0); parts.level.set(clamp(uL)); if (lo < 0.999) { var q2 = parts.level.at(clamp(uL)); pressF(trowel, q2.x, 0.002, q2.z, 0.3, 0.1 + 0.2 * Math.sin(S2 * 4), lo); }
        wetOver(faceB, ph2, S2, 'wet', wetB, true);
      }, function (S2, ph2) { var k = active(ph2, S2), L = [], xl = cut ? XC + 0.05 : -0.35; if (k === 'wet') { var q = faceB.at(clamp(u(ph2, 'wet', S2))); L.push(toolAnchor(q, 'hoseW')); if (u(ph2, 'wet', S2) > 0.5) L.push({ k: 'matt', p: [xl, 0.003, 0.45] }); } else if (k === 'level') { var q2 = parts.level.at(clamp(u(ph2, 'level', S2))); L.push(toolAnchor(q2, 'troLevel')); L.push({ k: 'primU', p: [xl, 0.002, 0.7] }); } else { var q3 = parts.prim.at(clamp(u(ph2, 'prime', S2))); L.push(toolAnchor(q3, 'rollP')); } return L; });
      var x0b = cut ? XC : -hw, phTb = { bed: [0.3, 2.2], tape: [2.5, 4.5], over: [4.8, 6.0] };
      stage('tape', 6.5, phTb, function (S2, ph2) {
        var uB = u(ph2, 'bed', S2), bo = io(ph2, 'bed', S2), uT = u(ph2, 'tape', S2), to = io(ph2, 'tape', S2), uO = u(ph2, 'over', S2), oo = io(ph2, 'over', S2);
        parts.tapeBed.visible = uB > 0; clip.tbed.constant = uB <= 0 ? -10 : x0b - 0.002 + clamp(uB) * (hw - x0b + 0.004); if (bo < 0.999) K.press(broom, x0b + clamp(uB) * (hw - x0b) - 0.04, 0.04, 0.003, 0.5, 0, bo);
        parts.tape.visible = uT > 0; clip.tape.constant = uT <= 0 ? -10 : x0b - 0.002 + clamp(uT) * (hw - x0b + 0.004); if (to < 0.999) { flat.visible = true; var xt = x0b + clamp(uT) * (hw - x0b); flat.position.set(xt - 0.02 + to * 0.15, 0.03 + to * 0.3, 0.03 + to * 0.6); flat.rotation.set(Math.PI - 0.8, 0, Math.PI / 2); }
        if (oo < 0.999) K.press(broom, x0b + clamp(uO) * (hw - x0b) - 0.04, 0.05 + 0.03 * Math.sin(S2 * 10), 0.005, 0.5, 0, oo);
      }, function (S2, ph2) { var k = active(ph2, S2), L = []; if (k === 'over') { L.push({ k: 'brushC', p: [x0b + clamp(u(ph2, 'over', S2)) * (hw - x0b), 0.12, 0.09] }); L.push({ k: 'tapeB', p: [cut ? XC + 0.02 : 0.3, 0.03, 0.005] }); } else if (k === 'tape') L.push({ k: 'tapeT', p: [x0b + clamp(u(ph2, 'tape', S2)) * (hw - x0b), 0.09, 0.09] }); else L.push({ k: 'brushC', p: [x0b + clamp(u(ph2, 'bed', S2)) * (hw - x0b), 0.1, 0.08] }); return L; });
      coatStage('coat1', 7.6, parts.c1, { tool: 'notched', smooth: true, layer: 'c1b', layerAt: [cut ? XC + 0.05 : -0.35, 0.006, 0.6] });
      coatStage('coat2', 7.0, parts.c2, { tool: 'broom', second: true, label: 'brushC2', layer: 'c2b', layerAt: [cut ? XC + 0.05 : -0.35, 0.007, 0.6] });
      /* the tiles: the adhesive combed, then every tile laid into it */
      var TL = parts.tiles, nt = TL.length, phTi = { comb: [0.3, 3.2], lay: [3.5, 8.0] };
      stage('tiles', 8.5, phTi, function (S2, ph2) {
        var uC = u(ph2, 'comb', S2), co = io(ph2, 'comb', S2), uL = u(ph2, 'lay', S2);
        parts.adh.show(uC > 0); parts.adh.set(clamp(uC)); if (co < 0.999) { var q = parts.adh.at(clamp(uC)); pressF(notched, q.x, 0.013, q.z, 0.35, 0.1, co); }
        TL.forEach(function (t, i) { var f = clamp(clamp(uL) * nt - i * 0.85), e = E(f); t.visible = f > 0; t.position.copy(t.userData.home); t.position.y += (1 - e) * 0.18; t.position.z += (1 - e) * 0.08; });
      }, function (S2, ph2) { var k = active(ph2, S2), L = []; if (k === 'lay') { var i = Math.min(nt - 1, Math.floor(clamp(u(ph2, 'lay', S2)) * nt / 0.85)), t = TL[Math.max(0, Math.min(nt - 1, i))]; L.push({ k: 'tileT', p: [t.position.x, t.position.y + 0.06, t.position.z] }); if (u(ph2, 'lay', S2) > 0.5) L.push({ k: 'adhesive', p: [cut ? XC + 0.05 : -0.35, 0.012, 0.9] }); } else { var q = parts.adh.at(clamp(u(ph2, 'comb', S2))); L.push(toolAnchor(q, 'sandT')); } return L; });
      stage('done', 4.2, { grout: [0.3, 2.6], seal: [2.9, 3.8] }, function (S2, ph2) { var uG = u(ph2, 'grout', S2), go = io(ph2, 'grout', S2), uS = u(ph2, 'seal', S2); if (parts.grout) { parts.grout.visible = uG > 0; parts.grout.material[2].opacity = clamp(uG); parts.grout.material.forEach(function (m) { m.opacity = clamp(uG); }); } if (parts.seal) parts.seal.visible = uS > 0; if (go < 0.999) { var q = parts.adh.at(clamp(uG)); pressF(sponge, q.x + 0.03 * Math.sin(S2 * 14), 0.022, q.z + 0.03 * Math.cos(S2 * 14), 0.06, 0.1 * Math.sin(S2 * 14), go); } },
        function (S2, ph2) { var k = active(ph2, S2); if (k === 'seal') return [{ k: 'grout', p: [cut ? XC + 0.05 : -0.3, 0.03, 0.02] }]; var q = parts.adh.at(clamp(u(ph2, 'grout', S2))); return [toolAnchor(q, 'grout')]; });
    }
    if (scn === 'negc') {
      /* preparation: the face jetted from the top down (paint and lime runs go, the substrate matt damp), then the honeycombed zones broken out to sound concrete with the chipping hammer */
      var faceC = parts.seal, wetC = wetOn(faceC, -0.0012), RJc = parts.jetRaster, HZ = P.honey.map(function (h) { return { x: -hw + h[0] * W.w, y: h[1] * W.h, rx: h[2], ry: h[3] }; }).filter(function (h) { return !cut || h.x + h.rx > XC; });
      var phPC = { jet: [0.3, 4.6], breakout: [5.0, 8.2] }, chipAt = function (u) { var i = Math.min(HZ.length - 1, Math.floor(u * HZ.length)), f = u * HZ.length - i, h = HZ[i] || HZ[0], a = f * Math.PI * 4; return { x: h.x + Math.cos(a) * h.rx * 0.6, y: h.y + Math.sin(a) * h.ry * 0.6 }; };
      var srcChipC = function (t) { if (t < phPC.breakout[0] || t > phPC.breakout[1]) return null; var q = chipAt((t - phPC.breakout[0]) / (phPC.breakout[1] - phPC.breakout[0])); return [q.x, q.y, 0.01]; };
      stage('prep', 8.7, phPC, function (S2, ph2) {
        var uJ = u(ph2, 'jet', S2), jo = io(ph2, 'jet', S2), uB = u(ph2, 'breakout', S2), bo = io(ph2, 'breakout', S2);
        if (parts.paintMask) parts.paintMask.update(clamp(uJ)); if (parts.stainMask) parts.stainMask.update(clamp(uJ)); parts.paint.visible = uJ < 1.02; parts.stains.visible = uJ < 1.02; parts.stainsDry.visible = uJ > 0.02; if (parts.seep) parts.seep.visible = true;
        if (jo < 0.999 && RJc) { var q = RJc.at(clamp(uJ)); K.aim(lance, [q.x, q.y, 0.002], DIRW, lance.userData.standoff.jet, jo); lance.userData.mode(jo < 0.6 ? 'jet' : 'off'); }
        var srcJ = function (t) { if (t < ph2.jet[0] || t > ph2.jet[1] || !RJc) return null; var q2 = RJc.at((t - ph2.jet[0]) / (ph2.jet[1] - ph2.jet[0])); return [q2.x, q2.y, 0.003]; }; spray.update(S2, srcJ, ground); mist.update(S2, srcJ, null); puddle.set(cut ? 0.15 : 0, 0.28 * (uJ > 0 ? (uJ <= 1 ? 1 : Math.max(0, 1 - (S2 - ph2.jet[1]) / 2.5)) : 0));
        wetC.set(clamp(uJ), uJ > 0 ? 1 : 0);
        if (bo < 0.999 && HZ.length) { var qc = chipAt(clamp(uB)); chipper.visible = true; chipper.position.set(qc.x, qc.y + 0.01, 0.004 + bo * 0.5 + 0.006 * Math.abs(Math.sin(S2 * 38))); chipper.rotation.set(-0.5, 0.3, 0); chipper.position.y += bo * 0.3; } else chipper.visible = false;
        chips.update(S2, srcChipC, ground); plasterDust.update(S2, srcChipC, ground);
      }, function (S2, ph2) { var k = active(ph2, S2), L = [], xl = cut ? XC + 0.05 : -0.35; if (k === 'breakout') { var qc = chipAt(clamp(u(ph2, 'breakout', S2))); L.push({ k: 'breakout', p: [qc.x, qc.y + 0.14, 0.3] }); L.push({ k: 'matt', p: [xl, 0.6, 0.002] }); } else { var q = RJc ? RJc.at(clamp(u(ph2, 'jet', S2))) : { x: 0, y: 0.5 }; L.push({ k: 'jetC', p: midOf(q.x, q.y, 0.002, DIRW, lance.userData.standoff.jet) }); } return L; });
      /* repair: the pockets and tie holes filled with M30 from the trowel, the chased joint filled from the bottom up, then the cove on its bonding slurry */
      var phR = { fill: [0.3, 3.4], joint: [3.7, 5.6], pre: [5.9, 7.4], cove: [7.7, 9.6] }, x0c = cut ? XC : -hw;
      stage('repair', 10.1, phR, function (S2, ph2) {
        var uF = u(ph2, 'fill', S2), fo = io(ph2, 'fill', S2), uJ2 = u(ph2, 'joint', S2), jo2 = io(ph2, 'joint', S2), uP = u(ph2, 'pre', S2), po = io(ph2, 'pre', S2), uCv = u(ph2, 'cove', S2), co = io(ph2, 'cove', S2);
        parts.repair.show(uF > 0); parts.repair.set(clamp(uF)); if (fo < 0.999) { var q = parts.repair.at(clamp(uF)); K.press(trowel, q.x, q.y, 0.0022, 0.3, Math.PI / 2 + 0.2 * Math.sin(S2 * 4), fo); }
        if (parts.jointFill) { var fj = clamp(uJ2); parts.jointFill.visible = fj > 0; parts.jointFill.scale.y = Math.max(0.001, fj); parts.jointFill.position.y = W.h * fj / 2; if (parts.jointGroove) parts.jointGroove.visible = true; if (jo2 < 0.999) K.press(trowelS, P.joint.x, W.h * fj, 0.003, 0.5, 0.2, jo2); }
        parts.pre.visible = uP > 0; clip.pre.constant = uP <= 0 ? -10 : x0c - 0.002 + clamp(uP) * (hw - x0c + 0.004); if (po < 0.999) K.press(broom, x0c + clamp(uP) * (hw - x0c) - 0.03, P.cove * 0.6 + 0.02, 0.003, 0.5, 0, po);
        parts.cove.visible = uCv > 0; clip.cove.constant = uCv <= 0 ? -10 : x0c - 0.002 + clamp(uCv) * (hw - x0c + 0.004); if (co < 0.999) K.press(trowelS, x0c + clamp(uCv) * (hw - x0c) - 0.03, P.cove * 0.55, P.cove * 0.55, -0.7, Math.PI / 2, co);
      }, function (S2, ph2) { var k = active(ph2, S2), L = [], xl = cut ? XC + 0.05 : -0.35; if (k === 'cove') { var f = clamp(u(ph2, 'cove', S2)); L.push({ k: 'troCove', p: [x0c + f * (hw - x0c), P.cove + 0.05, 0.09] }); } else if (k === 'pre') { L.push({ k: 'pre', p: [x0c + clamp(u(ph2, 'pre', S2)) * (hw - x0c), P.cove + 0.06, 0.08] }); } else if (k === 'joint') { L.push({ k: 'jointFill', p: [P.joint.x, W.h * clamp(u(ph2, 'joint', S2)) + 0.05, 0.08] }); } else { var q2 = parts.repair.at(clamp(u(ph2, 'fill', S2))); L.push(toolAnchor(q2, 'troLevel')); L.push({ k: 'repairC', p: [xl, 0.85, 0.003] }); } return L; });
      coatStage('seal', 6.4, parts.seal, { tool: 'broom', cove: clip.sealc, layer: 'preseal', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.004] });
      coatStage('joint', 5.8, parts.band, { tool: 'notched', smooth: true, layer: 'bandC', layerAt: [P.joint.x, 0.85, 0.008], label: 'notchC' });
      coatStage('coat1', 7.0, parts.c1, { tool: 'trowel', cove: clip.c1c, layer: 'c1', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.007] });
      coatStage('coat2', 7.2, parts.c2, { tool: 'spray', smooth: true, cove: clip.c2c, layer: 'c2', layerAt: [cut ? XC + 0.05 : -0.35, 0.85, 0.008] });
      cureStage('cure', 5.6, parts.c2, { mats: [C.mats.RB], dryer: true, floorY: 0 });
    }
    if (scn === 'park') {
      /* the salt-damaged skin is milled off lane by lane with the walk-behind scarifier (a 320 mm machine at 0.8, so a 250 mm drum on the four lanes of the sample): it rolls in, works the rows boustrophedon —
         at the end of a row the drum is lifted and the machine swung round on the spot — then rolls off; then the deck is primed with the roller and pre-wetted */
      var faceP = parts.c1, wetP = wetOn(faceP, -0.0016), phPP = { blast: [0.3, 4.7], prime: [5.4, 7.6], wet: [7.9, 9.6] }, RM = parts.millRaster, RW = S.x - (cut ? XC : -S.x);
      function millPose(S2, ph2) { // the machine's pose at a stage time: position of the drum axis, heading, pitch (drum lifted), distance rolled, milling?
        var p = ph2.blast, uB = clamp((S2 - p[0]) / (p[1] - p[0])), q = RM.at(uB), yaw0 = q.dir ? 0 : Math.PI, yaw = yaw0, pitch = 0, x = q.x, z = q.y, s = (q.row + Math.min(q.frac, 0.92) / 0.92) * RW, on = true, dx = q.dir ? 1 : -1;
        if (q.frac > 0.92) { // the turn: tilted back on to the rear wheels (drum lifted), swung round through the side of the next lane while the axle rolls on by one lane
          var e = E((q.frac - 0.92) / 0.08), R = 0.6 * SCS, rh = RM.rowH * (RM.up ? 1 : -1), zRow = q.y - rh * e, ax = q.x - dx * R + 2 * R * dx * e, az = zRow + rh * e;
          yaw = yaw0 + (q.dir ? -1 : 1) * Math.PI * e; x = ax + R * Math.cos(yaw); z = az - R * Math.sin(yaw); pitch = 0.14 * Math.sin(Math.PI * e); s += e * 2 * R; on = false; }
        if (S2 < p[0]) { var ei = clamp((p[0] - S2) / 0.7); x -= dx * ei * 0.9; s -= ei * 0.9; on = false; } // rolling in
        else if (S2 > p[1]) { var eo = E(clamp((S2 - p[1]) / 0.65)); x += dx * eo * 1.1; s += eo * 1.1; on = false; if (eo >= 1) return null; } // rolling off
        return { x: x, z: z, yaw: yaw, pitch: pitch, s: s, on: on, dir: q.dir, u: uB };
      }
      stage('prep', 10.1, phPP, function (S2, ph2) {
        var uB = u(ph2, 'blast', S2), uP = u(ph2, 'prime', S2), po = io(ph2, 'prime', S2);
        parts.blast.visible = uB > 0; if (parts.blastMask) parts.blastMask.update(clamp(uB));
        if (scarifier && RM) { var mp = S2 < ph2.blast[1] + 0.7 ? millPose(S2, ph2) : null; scarifier.visible = !!mp; if (mp) {
          var vib = mp.on ? 1 : 0.15, jy = vib * 0.0007 * Math.sin(S2 * 143), jr = vib * 0.0035 * Math.sin(S2 * 97 + 1);
          scarifier.position.set(mp.x, 0.6 * SCS * Math.sin(mp.pitch) + jy, mp.z); scarifier.rotation.set(jr, mp.yaw, mp.pitch);
          scarifier.userData.drum.rotation.z = -S2 * 34; scarifier.userData.wheels.forEach(function (w) { w.g.rotation.z = -mp.s / w.r; }); scarifier.userData.trail([0.4, 0, -1.7], [-0.05, 0, -1.85], function (x, z) { return Math.abs(x) <= S.x && z >= S.zb && z <= S.zf ? 0 : ground; }); } }
        var srcB = function (t) { if (!RM || t < ph2.blast[0] || t > ph2.blast[1]) return null; var q2 = RM.at((t - ph2.blast[0]) / (ph2.blast[1] - ph2.blast[0])); if (q2.frac > 0.92) return null; return [q2.x - (q2.dir ? 0.22 : -0.22) * SCS, 0.02, q2.y]; };
        var srcD = function (t) { var p2 = srcB(t); return p2 ? [p2[0], 0.05, p2[2]] : null; }; grit.update(S2, srcB, ground); millDust.update(S2, srcD, null); chips.update(S2, srcB, 0);
        parts.prim.show(uP > 0); parts.prim.set(clamp(uP)); if (po < 0.999) { var q3 = parts.prim.at(clamp(uP)); if (q3.kind === 'wall') K.press(roller, q3.x, q3.y, q3.z + 0.005, 0, rollYaw(q3), po); else pressF(roller, q3.x, 0.006, q3.z, 0, rollYaw(q3), po); roller.userData.roll.rotation.y = S2 * 12; }
        wetOver(faceP, ph2, S2, 'wet', wetP, true);
      }, function (S2, ph2) { var k = active(ph2, S2), L = [], xl = cut ? XC + 0.05 : -0.4; if (k === 'wet') { var q = faceP.at(clamp(u(ph2, 'wet', S2))); L.push(toolAnchor(q, 'hoseW')); if (u(ph2, 'wet', S2) > 0.5) L.push({ k: 'matt', p: [xl, 0.003, -0.2] }); } else if (k === 'prime') { var q2 = parts.prim.at(clamp(u(ph2, 'prime', S2))); L.push(toolAnchor(q2, 'rollP')); } else { var mp = RM ? millPose(S2, ph2) : null; if (mp) L.push({ k: 'mill', p: [mp.x + (mp.dir ? 0.12 : -0.12) * SCS, 0.31 * SCS, mp.z] }); else { var q3 = RM ? RM.at(clamp(u(ph2, 'blast', S2))) : { x: 0, y: 0 }; L.push({ k: 'mill', p: [q3.x, 0.02, q3.y] }); } } return L; });
      coatStage('scratch', 5.2, parts.scratch, { tool: 'trowel', label: 'scratch', layer: 'scratch', layerAt: [cut ? XC + 0.05 : -0.4, 0.004, -0.3] });
      coatStage('coat1', 7.2, parts.c1, { tool: 'notched', smooth: true, layer: 'c1p', layerAt: [cut ? XC + 0.05 : -0.4, 0.005, -0.3] });
      coatStage('coat2', 7.2, parts.c2, { tool: 'spray', smooth: true, layer: 'c2p', layerAt: [cut ? XC + 0.05 : -0.4, 0.006, -0.3] });
      stage('done', 4.4, { dry: [0.3, 2.6], roll: [2.8, 4.1] }, function (S2, ph2) { var f = clamp(u(ph2, 'dry', S2)), fr = clamp(u(ph2, 'roll', S2)); C.wetLook.forEach(function (w) { if (w.m === C.mats.OS) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.22 * (1 - f)); w.m.roughness = w.r - (w.r - 0.3) * (1 - f); } }); if (parts.wheel) { parts.wheel.visible = fr > 0; var e = E(fr); parts.wheel.position.x = 0.05; parts.wheel.position.z = 1.25 - 0.68 * e; parts.wheel.children[0].rotation.x = parts.wheel.children[1].rotation.x = -(1.25 - 0.68 * e) / 0.325; } },
        function (S2, ph2) { return [{ k: 'traffic', p: [cut ? XC + 0.05 : -0.4, 0.006, 0.1] }]; });
    }

    /* an application defined outside this file (rc-3d.js) writes its stages through P.rig with the helpers of this module */
    if (P.rig) P.rig({ stage: stage, u: u, io: io, active: active, E: E, clamp: clamp, tri: tri, K: K, K2: K2, C: C, P: P, scn: scn, cut: cut, XC: XC, hw: hw, W: W, S: S, parts: parts, clip: clip, ground: ground, noise: noise, N: N, none: none,
      tools: { lance: lance, hose: hose, broom: broom, trowel: trowel, flat: flat, trowelS: trowelS, sponge: sponge, gun: gun, blaster: blaster, notched: notched, roller: roller, drill: drill, igun: igun, cutter: cutter, darby: darby, chipper: chipper }, addTool: function (t) { tools.push(t); return t; },
      clouds: { spray: spray, mist: mist, mistC: mistC, splat: splat, dust: dust, grit: grit, sawdust: sawdust, plasterDust: plasterDust, millDust: millDust, chips: chips }, addCloud: function (c) { clouds.push(c); return c; }, puddle: puddle, PR: PR, DIR: { J: DIRJ, W: DIRW, S: DIRS, B: DIRB, JF: DIRJF, WF: DIRWF, SF: DIRSF }, midOf: midOf,
      pressF: pressF, follow: follow, aimAt: aimAt, rollYaw: rollYaw, placeRoller: placeRoller, toolAnchor: toolAnchor, wetOn: wetOn, allFilms: allFilms, coatStage: coatStage, coveSweep: coveSweep, coveStage: coveStage, cureStage: cureStage, jetOver: jetOver, wetOver: wetOver });

    rig.tools = tools; rig.clouds = clouds;
    rig.set = function (id, tw, xr) {
      hideTools(); var st = ST[id], on = !!st && tw < 1;
      if (!on) { clearClouds(); puddle.set(0, 0); lance.userData.mode('off'); hose.userData.mode('off'); allFilms.forEach(function (o) { o.f.visible = false; }); return; }
      clearClouds(); st.run(tw * st.dur, st.ph, xr);
    };
    rig.anchors = function (id, tw) { var st = ST[id]; if (!st || tw >= 1) return null; return st.an ? st.an(tw * st.dur, st.ph) : []; };
    return rig;
  }
  return { build: build };
})();

