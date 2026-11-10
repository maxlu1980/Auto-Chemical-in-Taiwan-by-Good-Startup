/* ===== [island_aw.js] ===== */
  /* ================= (v77) the lens in hand on every device; the keys shown on screen =================
     Looking round, the way each device expects it:
     · a mouse: a drag (either button) turns and tilts the view, the wheel comes closer or draws back; a click on the ground still walks there;
     · a finger: the left half of the picture is the stick (drag to walk), the right half turns and tilts the view — both at once, one thumb
       each (island_b.js); two fingers on the same side pinch and twist as before; a tap walks there;
     · the keyboard: , and . turn (held), - and = come closer and draw back, C puts the lens back behind her — on the island and in the cities
       alike (Q E Z X as before on the island, where those letters are free);
     · on screen: turn left, turn right, closer, farther, “behind her”, the next view — beside the round map, each with its key on it.
     The lens goes on adapting by itself (behind her as she walks on, shorter and steeper where walls and ceilings close in, along stairs and
     passages); after her own turn of the view it waits a few seconds before it takes over again, and “behind her” hands it back at once.
     With a keyboard and a mouse, what a finger has under it is on screen too, each button with its key: the moves (W A S D, Shift to run),
     jump, the strike, the boost, the special, talk, in and out of a car, the phone, and the panels — to read where the keys are, or to click. ================= */
  var CPX = { zh: { zo: '拉遠', zi: '拉近', rs: '回到背後', vw: '切換視角', mv: '移動', run: '跑步', up: '往前', dn: '往後', lf: '往左', rt: '往右' },
    en: { zo: 'Farther', zi: 'Closer', rs: 'Behind her', vw: 'Next view', mv: 'Move', run: 'Run', up: 'Forward', dn: 'Back', lf: 'Left', rt: 'Right' },
    ja: { zo: '離れる', zi: '近づく', rs: '背後へ', vw: '視点切替', mv: '移動', run: '走る', up: '前へ', dn: '後ろへ', lf: '左へ', rt: '右へ' } };
  function cpx(k) { return (CPX[LANG] || CPX.zh)[k]; }
  var CPD = { hold: null, run: false, goal: null, lang: null, keysOn: {} };
  var CP_SVG = { zo: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M7.5 10.5h6"/></svg>', zi: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M7.5 10.5h6M10.5 7.5v6"/></svg>',
    rs: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M6.5 20v-3.5a5.5 5.5 0 0111 0V20"/><path d="M3 12l2.5 2.5L8 12M21 12l-2.5 2.5L16 12" opacity=".0"/></svg>', vw: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>' };
  /* behind her (or behind what she rides), at the view's own height and length; the cities' lens glides there, the island's turns to it */
  function camBehind() { var V = VIEWS[CAM.view] || VIEWS.classic, yw = (VEH.kind !== 'walk' ? VEH.heading : face) + Math.PI; CAM.p = V.p; CAM.d = CAM.base * V.k; CAM.userT = 0; CAM.rot = 0;
    if (typeof TC !== 'undefined' && TK && inTK(pos.x, pos.z)) { TC.yawGoal = yw; TC.p = null; } else CPD.goal = yw; }
  function cpZoom(k) { CAM.d = Math.max(4.5, Math.min(40, CAM.d * k)); }
  function cpUi() { var rot = root && root.querySelector('.isle__rot'), bl = $('isBL'); if (!rot || !bl || $('isCamBack')) return;
    [['zo', 'isCamOut'], ['zi', 'isCamIn'], ['rs', 'isCamBack'], ['vw', 'isCamView']].forEach(function (q) { var b = document.createElement('button'); b.type = 'button'; b.id = q[1]; b.setAttribute('data-c', q[0]); b.innerHTML = CP_SVG[q[0]]; rot.appendChild(b); });
    $('isRotL').setAttribute('data-c', 'rl'); $('isRotR').setAttribute('data-c', 'rr');
    [['isRotL', ','], ['isRotR', '.'], ['isCamOut', '-'], ['isCamIn', '='], ['isCamBack', 'C'], ['isCamView', 'V']].forEach(function (q) { $(q[0]).setAttribute('data-key', q[1]); });
    function hold(id, what) { var b = $(id); function on(e) { e.preventDefault(); e.stopPropagation(); CPD.hold = what; CAM.userT = 4; } function off() { if (CPD.hold === what) CPD.hold = null; } b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
      /* from the keyboard (Enter or Space on the button): one step */ b.addEventListener('click', function (e) { if (e.detail === 0) cpZoom(what === 'zo' ? 1.12 : 0.89); }); }
    hold('isCamOut', 'zo'); hold('isCamIn', 'zi');
    $('isCamBack').addEventListener('click', function () { this.blur(); camBehind(); }); $('isCamView').addEventListener('click', function () { this.blur(); nextView(); });
    /* the moves, for a mouse: W A S D to hold, Shift to switch running on and off */
    var k = document.createElement('div'); k.id = 'isKeys'; k.className = 'isle__keys'; k.setAttribute('role', 'group');
    k.innerHTML = [['KeyW', 'W', 'up'], ['KeyA', 'A', 'lf'], ['KeyS', 'S', 'dn'], ['KeyD', 'D', 'rt']].map(function (q) { return '<button type="button" class="isle__key isle__key--' + q[1].toLowerCase() + '" data-k="' + q[0] + '" data-n="' + q[2] + '">' + q[1] + '</button>'; }).join('') + '<button type="button" class="isle__key isle__key--run" id="isKeyRun" aria-pressed="false"><b>Shift</b><span></span></button>'; bl.appendChild(k);
    [].forEach.call(k.querySelectorAll('[data-k]'), function (b) { var code = b.getAttribute('data-k'); function on(e) { e.preventDefault(); e.stopPropagation(); AU.init(); keys[code] = true; CPD.keysOn[code] = true; b.classList.add('is-down'); } function off() { if (!CPD.keysOn[code]) return; CPD.keysOn[code] = false; keys[code] = false; b.classList.remove('is-down'); }
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off); b.addEventListener('contextmenu', function (e) { e.preventDefault(); }); });
    $('isKeyRun').addEventListener('click', function () { this.blur(); CPD.run = !CPD.run; if (!CPD.run) keys.ShiftLeft = false; this.setAttribute('aria-pressed', CPD.run ? 'true' : 'false'); this.classList.toggle('is-down', CPD.run); });
    /* each button a finger has, with its key on it (drawn only where a keyboard is in use) */
    [['isI_map', 'M'], ['isI_book', 'B'], ['isI_gear', 'G'], ['isI_view', 'V'], ['isI_help', 'H'], ['isAct', 'F'], ['isBoard', 'R']].forEach(function (q) { var b = $(q[0]); if (b) b.setAttribute('data-key', q[1]); });
    [].forEach.call(root.querySelectorAll('#isVeh button'), function (b, i) { b.setAttribute('data-key', String(i + 1)); }); CPD.lang = null;
    /* what is on screen follows the pointer in use (a finger, or a mouse and keys), on the island as in the cities */ root.addEventListener('pointerdown', function (e) { TC.touch = e.pointerType === 'touch' || e.pointerType === 'pen'; }, true); }
  function cpLabels() { if (CPD.lang === LANG || !$('isCamBack')) return; CPD.lang = LANG; [['isCamOut', 'zo'], ['isCamIn', 'zi'], ['isCamBack', 'rs'], ['isCamView', 'vw']].forEach(function (q) { $(q[0]).setAttribute('aria-label', cpx(q[1])); $(q[0]).title = cpx(q[1]); });
    $('isRotL').title = t('rotL'); $('isRotR').title = t('rotR'); $('isKeys').setAttribute('aria-label', cpx('mv')); [].forEach.call($('isKeys').querySelectorAll('[data-n]'), function (b) { b.setAttribute('aria-label', cpx(b.getAttribute('data-n')) + ' (' + b.textContent + ')'); }); $('isKeyRun').lastChild.textContent = cpx('run'); $('isKeyRun').setAttribute('aria-label', cpx('run') + ' (Shift)'); }
  /* the city's own buttons (they come as the city's play is set up): their keys */
  function cpCityKeys() { var act = $('isGsAct'); if (!act) return; [['[data-a="talk"]', 'E'], ['[data-a="car"]', 'F'], ['[data-a="jump"]', 'Space'], ['[data-a="punch"]', 'R'], ['#isOcBtn', 'Q'], ['#isSpBtn', 'X']].forEach(function (q) { var b = act.querySelector(q[0]); if (b && !b.hasAttribute('data-key')) b.setAttribute('data-key', q[1]); }); var ph = $('isGsPhBtn'); if (ph && !ph.hasAttribute('data-key')) ph.setAttribute('data-key', 'P'); }
  function cpTyping(e) { return /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || ''); }
  function cpOn() { return isOpen && mode === 'walk' && !cardOn && !talkQ && !travel && !fall; }
  window.addEventListener('keydown', function (e) { if (!cpOn() || cpTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return; var c = e.code; if (TC.touch && /^(Key[WASD]|Arrow)/.test(c)) TC.touch = false; /* a keyboard taken up on a tablet: its keys come on screen */
    if (c === 'Comma' || c === 'Period') { CAM.rot = c === 'Comma' ? 1 : -1; CAM.userT = 4; CPD.rotKey = c; e.preventDefault(); }
    else if (c === 'Minus' || c === 'NumpadSubtract') { cpZoom(1.1); e.preventDefault(); } else if (c === 'Equal' || c === 'NumpadAdd') { cpZoom(0.91); e.preventDefault(); }
    else if (c === 'KeyC' && !e.repeat) { camBehind(); e.preventDefault(); } }, true);
  window.addEventListener('keyup', function (e) { if (e.code === CPD.rotKey) { CAM.rot = 0; CPD.rotKey = null; } }, true);
  function cpTick(dt) { if (!root) return; cpUi(); if (!$('isCamBack')) return; cpLabels(); cpCityKeys(); if (root.classList.contains('is-touch') !== !!TC.touch) root.classList.toggle('is-touch', !!TC.touch);
    var on = cpOn(); if (!on) { CPD.hold = null; CPD.goal = null; return; }
    if (CPD.hold === 'zo') cpZoom(1 + dt * 0.9); else if (CPD.hold === 'zi') cpZoom(1 - dt * 0.9);
    if (CPD.run) keys.ShiftLeft = true;
    /* the island's lens turning back behind her (the cities' own lens has its goal) */ if (CPD.goal != null) { if (CAM.rot || orbit || gest) CPD.goal = null; else { var d = CPD.goal - CAM.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; CAM.yaw += Math.max(-dt * 3.2, Math.min(dt * 3.2, d)); if (Math.abs(d) < 0.01) CPD.goal = null; } } }
  /* the island's own lens (the cities' has its own, island_h.js) adapts as theirs does: round behind her as she walks on — to where she was sent with a
     tap, and under her own steering only as far as she walks forward, so that steering never loops —, up over the hill that comes between it and her,
     and a little farther out at speed. Her own turn of the view holds for a few seconds; the “free” and “high” views are left alone. */
  var CPA = { up: 0, k: 1 };
  function cpIsle(dt) { var sp = Math.hypot(vel.x, vel.z), walk = VEH.kind === 'walk', i, p, need = 0, T2 = CAM.tgt, sy = Math.sin(CAM.yaw), cy = Math.cos(CAM.yaw), d = CAM.d * CPA.k;
    if (walk && CPD.goal == null && CAM.userT <= 0 && !orbit && !gest && !CAM.rot && (CAM.view === 'classic' || CAM.view === 'close') && sp > 0.5) { var mh = Math.atan2(vel.x, vel.z), bh = mh + Math.PI, fw = Math.cos(adiff(mh, CAM.yaw + Math.PI)), sf = Math.min(1, sp / 2.7), led = !!(target || (path && path.length)) && !keysOrStick();
      if (led) CAM.yaw += adiff(bh, CAM.yaw) * Math.min(1, dt * 1.1 * sf); else if (!tkLateral() && fw > 0.5) CAM.yaw += adiff(bh, CAM.yaw) * Math.min(1, dt * 0.9 * fw * sf); }
    for (p = CAM.p; p < 1.3; p += 0.07) { var ok = true, cp = Math.cos(p), sn = Math.sin(p); for (i = 1; i <= 6; i++) { var f = i / 6; if (W.height(T2.x + sy * cp * d * f, T2.z + cy * cp * d * f) + 0.45 > T2.y + sn * d * f) { ok = false; break; } } if (ok) break; need = p + 0.07 - CAM.p; }
    CPA.up += (need - CPA.up) * Math.min(1, dt * (need > CPA.up ? 6 : 1.4));
    var v = walk ? sp : Math.abs(VEH.speed), want = 1 + (CAM.view === 'high' || CAM.view === 'photo' ? 0 : 0.14 * Math.min(1, Math.max(0, v - 2.4) / (walk ? 3 : 12))); CPA.k += (want - CPA.k) * Math.min(1, dt * 1.6); }
  var _cameraAW = camera; camera = function (dt, snap) { if (snap || window.DBGCAM || fight || travel || fall || mode !== 'walk' || board || (TK && inTK(pos.x, pos.z))) { CPA.up = 0; CPA.k = 1; return _cameraAW(dt, snap); }
    cpIsle(dt || 0.016); var p0 = CAM.p, d0 = CAM.d; CAM.p = Math.min(1.35, p0 + CPA.up); CAM.d = d0 * CPA.k; try { return _cameraAW(dt, snap); } finally { CAM.p = p0; CAM.d = d0; } };
  var _extraTickAW = extraTick; extraTick = function (dt, ts) { _extraTickAW(dt, ts); try { cpTick(dt || 0); } catch (e) { if (window.ISLE_TEST) throw e; } };
  /* a mouse's drag looks round wherever she walks (it used to pull a stick, as a finger does) */
  var _dragLookAW = dragLook; dragLook = function () { return mode === 'walk' || _dragLookAW.apply(this, arguments); };
  var _inputResetAW = window.ISLE_inputReset; window.ISLE_inputReset = function () { CPD.hold = null; CPD.keysOn = {}; var k = $('isKeys'); if (k) [].forEach.call(k.querySelectorAll('.is-down[data-k]'), function (b) { b.classList.remove('is-down'); }); if (_inputResetAW) _inputResetAW.apply(this, arguments); };
  window.ISLE_x.cam = function () { return { yaw: +CAM.yaw.toFixed(3), p: +CAM.p.toFixed(3), d: +CAM.d.toFixed(2), view: CAM.view, rot: CAM.rot, userT: +(CAM.userT || 0).toFixed(1), hold: CPD.hold, run: CPD.run, goal: CPD.goal, stick: !!stick, orbit: orbit ? { id: orbit.id == null ? null : 1, on: !!orbit.on } : null, gest: !!gest, face: +face.toFixed(3), up: +CPA.up.toFixed(3), k: +CPA.k.toFixed(3), touch: !!TC.touch, tk: !!(TK && inTK(pos.x, pos.z)) }; };
