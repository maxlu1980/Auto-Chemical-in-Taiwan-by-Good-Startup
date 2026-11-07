/* ===== [island_e.js] ===== */

  /* ===== ISLE part 2d: the lights of the night and the weather chip =====
     After dark the vehicle Luna rides lights the road ahead with its headlamp (a real light on every surface it reaches, the pool
     on the asphalt, the glint on a wet road), its lamps glow; on foot Luna switches on the lamp clipped to the band of her helmet.
     The chip by the clock says what the weather is where Luna is, and whether it is the live report or the season's model. */
  var LAMP = null, skyT = 0;
  function lampBuild() { if (LAMP || !luna || !luna.head) return;
    var g = new THREE.Group(); g.position.set(0, 0.014, -0.004); g.rotation.x = -0.2; luna.head.add(g); var R = 0.112;
    var house = LUNA.mesh(new THREE.CylinderGeometry(0.019, 0.021, 0.024, 20).rotateX(Math.PI / 2), LUNA.toon(0x3a3a40), { ink: 0.0018 }); house.position.set(0, 0.016, R * 1.16 + 0.006); g.add(house);
    var lensM = new THREE.MeshBasicMaterial({ color: 0x8a8a80 }); KIT.curved(lensM); var lens = new THREE.Mesh(new THREE.CircleGeometry(0.0155, 20), lensM); lens.position.set(0, 0.016, R * 1.16 + 0.0185); g.add(lens);
    var aim = new THREE.Object3D(); aim.position.set(0, 0.016, R * 1.16 + 0.02); aim.rotation.x = 0.5; g.add(aim);
    LAMP = { g: g, lens: lensM, aim: aim, on: 0 }; }
  function vehLamp(o) { if (o.userData.lampL) return o.userData.lampL; var q = o.quaternion.clone(), p = o.position.clone(); o.position.set(0, 0, 0); o.quaternion.identity(); o.updateMatrixWorld(true);
    var b = new THREE.Box3().setFromObject(o); o.position.copy(p); o.quaternion.copy(q); o.updateMatrixWorld(true);
    o.userData.lampL = new V3(0, b.min.y + (b.max.y - b.min.y) * (o.userData.kind === 'car' ? 0.42 : 0.72), b.max.z - 0.04); return o.userData.lampL; }
  var LT = { p: new V3(), d: new V3(), q: new THREE.Quaternion() };
  function lightsTick(dt) { if (!W || !W.setSpot) return; lampBuild(); var nk = W.night || 0, dark = Math.max(0, Math.min(1, (nk - 0.35) / 0.4)); var wx = W.wxState ? W.wxState() : null; if (wx && (wx.fog > 0.4 || wx.rain > 0.6) && nk > 0.15) dark = Math.max(dark, 0.6);
    if (LAMP) { LAMP.on += ((dark > 0.05 && VEH.kind === 'walk' && luna.root.visible && !travel ? 1 : 0) - LAMP.on) * Math.min(1, dt * 6); LAMP.lens.color.setRGB(0.55 + LAMP.on * 2.2, 0.55 + LAMP.on * 2.0, 0.5 + LAMP.on * 1.6); }
    if (dark < 0.02 || travel || (fall && fall.phase !== 'land')) { W.setSpot(LT.p, LT.d, 0); return; }
    if (VEH.kind !== 'walk' && VEH.obj && VEH.obj.visible) { var o = VEH.obj, car = o.userData.kind === 'car', L = vehLamp(o); LT.p.copy(L).applyMatrix4(o.matrixWorld); LT.d.set(0, car ? -0.1 : -0.13, 1).applyQuaternion(o.quaternion);
      W.setSpot(LT.p, LT.d, dark * (car ? 11 : 8), { outer: car ? 0.55 : 0.46, inner: car ? 0.3 : 0.24, range: car ? 24 : 19, color: 0xfff4e2 }); return; }
    if (LAMP && LAMP.on > 0.02) { LAMP.aim.getWorldPosition(LT.p); LAMP.aim.getWorldDirection(LT.d); W.setSpot(LT.p, LT.d, LAMP.on * dark * 3.2, { outer: 0.5, inner: 0.26, range: 13, color: 0xfff6ea }); return; }
    W.setSpot(LT.p, LT.d, 0); }
  /* ---------- the weather chip ---------- */
  var WXI = { sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    moon: '<path d="M15.5 3.5a8.5 8.5 0 1 0 5 13.6A7 7 0 0 1 15.5 3.5z"/>', cloud: '<path d="M7 18.5h10.2a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7 18.5z"/>',
    sunc: '<circle cx="8.5" cy="8.5" r="3.4"/><path d="M8.5 1.8v1.8M1.8 8.5h1.8M3.8 3.8l1.2 1.2M13.2 3.8l-1.2 1.2"/><path d="M9 19.5h9.2a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6 1.2A3 3 0 0 0 9 19.5z"/>',
    rain: '<path d="M7 14.5h10.2a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7 14.5z"/><path d="M8.5 17.5l-1 2.5M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5"/>',
    ts: '<path d="M7 13.5h10.2a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7 13.5z"/><path d="M12.5 14.5l-2.2 3.6h3l-2 3.6"/>', fog: '<path d="M4 9h16M3 13h18M5 17h14"/>' };
  function wxKind(r, night) { if (!r) return ['c2', 'cloud']; var c = r.code | 0; if (r.thunder) return ['ts', 'ts']; if (r.fog > 0.4 || c === 45 || c === 48) return ['fog', 'fog']; if (r.snow > 0) return ['snow', 'rain'];
    if (c >= 80 && c <= 82) return ['shw', 'rain']; if (r.rain > 0.15 || (c >= 61 && c <= 67)) return ['rain', 'rain']; if (r.drizzle > 0.1 || (c >= 51 && c <= 57)) return ['dz', 'rain'];
    if (r.cloud > 0.8 || c === 3) return ['c3', 'cloud']; if (r.cloud > 0.45 || c === 2) return ['c2', night ? 'cloud' : 'sunc']; if (r.cloud > 0.2 || c === 1) return ['c1', night ? 'moon' : 'sunc']; return ['c0', night ? 'moon' : 'sun']; }
  function wxChip() { var el = $('isWx'); if (!el || !W || !W.wxState) return; var s = W.wxState(), r = s.report, L = t('wx') || {}, k = wxKind(r, isNight()), src = r ? r.src : 'wait';
    $('isWxI').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + WXI[k[1]] + '</svg>';
    var temp = r && r.temp != null ? (src === 'live' ? '' : '≈') + Math.round(r.temp) + '°' : ''; $('isWxT').textContent = (temp ? temp + ' ' : '') + (L[k[0]] || '');
    var full = (src === 'live' ? (L.live || '') : src === 'wait' ? (L.wait || '') : (L.model || '')) + ' · ' + (L[k[0]] || '') + (temp ? ' · ' + temp + 'C' : '') + (src === 'live' ? ' · ' + (L.src || '') : '');
    el.title = full; el.setAttribute('aria-label', full); el.classList.toggle('is-model', src !== 'live'); }


