/* ===== [island_bb.js] ===== */
  /* ================= (v87) through the gates with her card =================
     She used to walk through the ticket gates as if they were not there: the leaves stood shut and she passed through them, and a beep
     sounded as she crossed the line. Now she does what everyone does there. Walking up to a lane she takes out her IC card and holds it to
     the reader on her right hand (going in: the one at the entry end; coming out: the one at the paid end); the reader lights green and
     beeps at the touch, the two leaves swing away before her, she walks through, puts the card away, and the leaves fall back behind her.
     She does not have to stop: the card is out a step before the leaves, and they are open by the time she reaches them — at a walk or at
     a run, led by the guide or by hand.
     The card is this game's own (an orange band, “IC” — no railway's card or mark is drawn). The two closed lanes (the red discs) stay
     shut and are no longer walked through. The beep is the station's own made sound (tw_tokyo_e.js), heard only when the sound is on. ================= */
  var GTE = { st: null, cd: false, card: null, lx: null, n: 0, POSE: [-1.78, -0.5, -0.12] };
  function gteCard() { if (GTE.card) return GTE.card; var c = document.createElement('canvas'); c.width = 160; c.height = 100; var g = c.getContext('2d'), r = 12;
    g.fillStyle = '#fbfaf6'; g.beginPath(); g.moveTo(r, 0); g.lineTo(160 - r, 0); g.quadraticCurveTo(160, 0, 160, r); g.lineTo(160, 100 - r); g.quadraticCurveTo(160, 100, 160 - r, 100); g.lineTo(r, 100); g.quadraticCurveTo(0, 100, 0, 100 - r); g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0); g.closePath(); g.fill(); g.save(); g.clip();
    g.fillStyle = '#ef7a1d'; g.beginPath(); g.moveTo(0, 62); g.bezierCurveTo(50, 44, 100, 84, 160, 58); g.lineTo(160, 100); g.lineTo(0, 100); g.closePath(); g.fill(); g.fillStyle = '#f6a04a'; g.beginPath(); g.moveTo(0, 76); g.bezierCurveTo(60, 60, 110, 96, 160, 74); g.lineTo(160, 100); g.lineTo(0, 100); g.closePath(); g.fill(); g.restore();
    g.fillStyle = '#16233c'; g.font = '800 40px ' + (KIT.FONT || 'sans-serif'); g.textBaseline = 'middle'; g.fillText('IC', 14, 30); g.fillStyle = '#16233c'; [0, 1, 2].forEach(function (i) { g.beginPath(); g.arc(122 + i * 11, 26, 3.4, 0, 7); g.fill(); });
    var tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4; var m = new THREE.Mesh(new THREE.PlaneGeometry(0.104, 0.065), KIT.basic({ map: tex, side: THREE.DoubleSide, transparent: true })); m.rotation.z = Math.PI / 2; m.renderOrder = 2; GTE.card = m; return m; }
  /* the card out and the arm up, or both away. Her right hand, the reader's side; if that hand holds something up already (the umbrella), the left */
  function gteShow(on) { if (!luna || !luna.armR) return; var st = GTE.st, c = gteCard();
    if (on) { var left = !!luna.holdR && !!luna.armL && !!luna.armL.wr, arm = left ? luna.armL : luna.armR; if (!arm || !arm.wr) return; st.left = left; arm.wr.add(c); c.position.set(0, -0.092, 0.012); c.rotation.set(0.25, 0, Math.PI / 2); st.pose = left ? [GTE.POSE[0], -GTE.POSE[1], GTE.POSE[2]] : GTE.POSE; if (left) luna.holdL = st.pose; else luna.holdR = st.pose; }
    else { if (c.parent) c.parent.remove(c); if (st) { if (st.left) { if (luna.holdL === st.pose) luna.holdL = null; } else if (luna.holdR === st.pose) luna.holdR = null; } } }
  function gteEnd() { var st = GTE.st; if (!st) return; gteShow(false); try { var O = TK && TK.T && TK.T.oka; if (O && O.gateShut) O.gateShut(st.i); } catch (e) {} GTE.st = null; }
  function gteTick(dt) { var T = TK && TK.T, O = T && T.oka, S = T && T.ST;
    if (!O || !O.gates || !S || TK.id !== 'tokyo' || !tkShown() || VEH.kind !== 'walk' || fight || travel || !luna || luna.root.visible === false || (typeof GS !== 'undefined' && (GS.car || GS.arrest))) { if (GTE.st) gteEnd(); GTE.lx = null; GTE.cd = false; return; }
    var L = T.toL(pos.x, pos.z), y = pos.y - TK.y, gx = S.GX + 0.08, dx = L[0] - gx, vx = GTE.lx == null ? 0 : (L[0] - GTE.lx) / Math.max(dt, 0.004), gi = -1, i; GTE.lx = L[0];
    if (Math.abs(y - S.YF) < 0.5 && Math.abs(dx) < 1.2) for (i = 0; i < O.gates.length; i++) if (Math.abs(L[1] - O.gates[i].z) < 0.36) { gi = i; break; }
    var st = GTE.st;
    if (!st) { /* out of the lane again before the next touch (she may turn about inside it) */ if (GTE.cd) { if (gi < 0 || Math.abs(dx) > 1.05) GTE.cd = false; return; }
      /* walking toward the leaves, a step short of them */ if (gi >= 0 && !O.gates[gi].shut && Math.abs(dx) < 0.98 && Math.abs(dx) > 0.1 && dx * vx < -0.2) { GTE.st = { i: gi, t: 0, dir: vx < 0 ? -1 : 1, tapped: false, out: 0, down: false }; gteShow(true); } return; }
    st.t += dt; if (!st.tapped && st.t >= 0.1) { st.tapped = true; if (O.gateTap(st.i, st.dir)) GTE.n++; }
    var passed = dx * st.dir > 0.6, left = gi !== st.i;
    if (st.tapped && (passed || left || st.t > 4)) st.out += dt;
    if (st.out > 0.16 && !st.down) { st.down = true; gteShow(false); }
    if (st.out > 0.5) { O.gateShut(st.i); GTE.st = null; GTE.cd = !left; } }
  var _extraTickBB = extraTick; extraTick = function (dt, ts) { _extraTickBB(dt, ts); try { gteTick(Math.min(0.1, dt || 0.016)); } catch (e) { if (window.ISLE_TEST) throw e; } };
  /* for the tests: where the touch stands */
  window.ISLE_x.gate = function () { var O = TK && TK.T && TK.T.oka; return { n: GTE.n, on: !!GTE.st, lane: GTE.st ? GTE.st.i : -1, dir: GTE.st ? GTE.st.dir : 0, tapped: !!(GTE.st && GTE.st.tapped), card: !!(GTE.card && GTE.card.parent), holdR: !!(luna && luna.holdR), holdL: !!(luna && luna.holdL), cd: GTE.cd, taps: O ? O.taps : null, lanes: O && O.gates ? O.gates.map(function (g) { return g.shut ? 'x' : +g.k.toFixed(2); }) : null, flash: !!(O && O.gFlash && O.gFlash.visible) }; };
