/* ===== [island_ab.js] ===== */
  /* ================= (v51) four stations, the ride as a film, the island never walked =================
     The high-speed rail now serves the four stations that have their city maps and their AUTO training centres — Taipei, Taichung, Tainan
     and Zuoying (Kaohsiung). Every ride between them is the commute film (CINE): one continuous aerial take over the real island, skippable at
     any moment. The island map is no longer a place to walk: whatever would have set Luna down on it (an old save, a menu, a portal) takes her
     to a station instead. The map card shows the island as it is, the four stations and the two places her portal reaches: Kenting and Sun
     Moon Lake. */
  var STOP4 = ['tpe', 'txg', 'tnn', 'khh'], CITY4 = { tpe: 'taipei', txg: 'taichung', tnn: 'tainan', khh: 'zuoying' };
  /* the timetable's real running times (minutes, the usual stopping service) between the four */
  var RUNMIN = { 'tpe-txg': 60, 'tpe-tnn': 105, 'tpe-khh': 115, 'txg-tnn': 46, 'txg-khh': 58, 'tnn-khh': 12 };
  function runMin(a, b) { return RUNMIN[a + '-' + b] || RUNMIN[b + '-' + a] || 60; }
  var CNX = {
    zh: { hsrQ: '從 {s} 出發，要去哪一站？', min: '約 {m} 分鐘', film: '車程以空拍過場呈現，隨時可點「略過」。', skip: '略過', route: '台灣高鐵', dist: '{d} 公里 · 約 {m} 分鐘', arrive: '即將抵達 {s}', mapT: '台灣', mapSt: '高鐵四站（城市地圖 · 原廠教育訓練中心）', mapPt: '傳送門（化學口袋）', ptK: '墾丁 · 凱撒大飯店與小灣', ptS: '日月潭 · 向山遊客中心', here: '目前所在', go: '前往', yushan: '玉山 3,952 m', sml: '日月潭', noIsle: '島上地圖已改為車程過場，先帶妳回到 {s}。', cineFail: '此裝置無法播放空拍過場，直接前往。', tpe: '台北', txg: '台中', tnn: '台南', khh: '高雄（左營）', kenting: '墾丁', taroko: '太魯閣', hualien: '花蓮', yilan: '宜蘭' },
    en: { hsrQ: 'From {s} — where to?', min: 'about {m} min', film: 'The ride plays as an aerial film; tap “Skip” any time.', skip: 'Skip', route: 'Taiwan High Speed Rail', dist: '{d} km · about {m} min', arrive: 'Arriving at {s}', mapT: 'Taiwan', mapSt: 'The four HSR stations (city maps · AUTO training centres)', mapPt: 'The portal (chemistry pocket)', ptK: 'Kenting · Caesar Park and Little Bay', ptS: 'Sun Moon Lake · Xiangshan Visitor Center', here: 'You are here', go: 'Go', yushan: 'Yushan 3,952 m', sml: 'Sun Moon Lake', noIsle: 'The island map is now the ride’s film — taking you back to {s}.', cineFail: 'This device can’t play the aerial film; going straight there.', tpe: 'Taipei', txg: 'Taichung', tnn: 'Tainan', khh: 'Kaohsiung (Zuoying)', kenting: 'Kenting', taroko: 'Taroko', hualien: 'Hualien', yilan: 'Yilan' },
    ja: { hsrQ: '{s} から、どの駅へ？', min: '約 {m} 分', film: '移動は空撮ムービーで。「スキップ」でいつでも飛ばせます。', skip: 'スキップ', route: '台湾高速鉄道', dist: '{d} km · 約 {m} 分', arrive: 'まもなく {s}', mapT: '台湾', mapSt: '高鉄の4駅（都市マップ · メーカー研修センター）', mapPt: 'ポータル（ケミカルポケット）', ptK: '墾丁 · シーザーパークと小湾', ptS: '日月潭 · 向山ビジターセンター', here: '現在地', go: '行く', yushan: '玉山 3,952 m', sml: '日月潭', noIsle: '島のマップは移動ムービーになりました。{s} へ戻ります。', cineFail: 'この端末では空撮ムービーを再生できないため、直接向かいます。', tpe: '台北', txg: '台中', tnn: '台南', khh: '高雄（左営）', kenting: '墾丁', taroko: '太魯閣', hualien: '花蓮', yilan: '宜蘭' } };
  function cn(k) { var L = CNX[LANG] || CNX.zh; return L[k] != null ? L[k] : CNX.zh[k]; }
  /* the station she is at (in a city map), else the one she last left from */
  var LASTST = 'tpe';
  function stHere() { var h = cityHere(); if (h && CITYST[h]) LASTST = CITYST[h]; return h ? (CITYST[h] || LASTST) : LASTST; }

  /* ---------- the high-speed rail's card: the four stations ---------- */
  hsrCard = function (st) { var here = cityHere(), from = here ? stHere() : (STOP4.indexOf(st) >= 0 ? st : LASTST);
    var h = '<p class="isle__kick2">' + esc(lx(STN[from])) + (here ? ' · ' + esc(tp('city')) : '') + '</p><h2>' + esc(tp('hsrT')) + '</h2><p class="isle__pitch">' + esc(f(cn('hsrQ'), { s: lx(STN[from]) })) + '</p><div class="isle__line isle__line--4">' + STOP4.map(function (id) { var cur = id === from && !!here, km = Math.round(Math.abs((HSKM[id] || 0) - (HSKM[from] || 0)));
      var sub = cur ? tp('now') : f(tp('km'), { d: km }) + ' · ' + f(cn('min'), { m: runMin(from, id) }); return '<button type="button" class="isle__stop is-city' + (cur ? ' is-here' : '') + '" data-to="' + id + '"' + (cur ? ' disabled' : '') + '><i></i><b>' + esc(lx(STN[id])) + '</b><small>' + esc(sub) + '</small></button>'; }).join('') + '</div><p class="isle__why">' + esc(cn('film')) + '</p>';
    var C = card(h, 'isle__cin--hsr'); [].forEach.call(C.querySelectorAll('[data-to]'), function (b) { b.addEventListener('click', function () { var to = b.getAttribute('data-to'); cardClose(); if (to === from && here) return; if (here) hsrGo(from, to, true); else cineGo(from, to); }); }); };
  hsrOk = function (id) { return STOP4.indexOf(id) >= 0; };

  /* ---------- the film ---------- */
  var CN = { on: false, ok: null, tilt: null, curve: null, see: null, ov: null, lab: {}, patched: false, t0: 0, fails: 0 };
  function cineOk() { if (CN.ok === null) { CN.ok = !!(typeof CINE !== 'undefined' && R3 && CINE.ok(R3) && !window.ISLE_NOCINE); } return CN.ok; }
  /* the island's renderer and post chain draw the film's scene while it plays */
  function cinePatch() { if (CN.patched) return; CN.patched = true; var r0 = R3.render.bind(R3); R3.render = function (sc, c) { if (CN.on && sc === scene) return r0(CINE.scene(), CINE.cam()); return r0(sc, c); };
    if (POST) { var p0 = POST.render; POST.render = function (sc, c, ts) { if (CN.on && sc === scene) return p0.call(POST, CINE.scene(), CINE.cam(), ts); return p0.call(POST, sc, c, ts); }; } }
  function cineOverlay(on, from, to) { var O = CN.ov; if (!O) { O = document.createElement('div'); O.className = 'isle__cine'; O.innerHTML = '<i class="isle__cine-bar isle__cine-bar--t"></i><i class="isle__cine-bar isle__cine-bar--b"></i><div class="isle__cine-lbl" id="isCineL"></div><div class="isle__cine-tt" id="isCineT"><small></small><b></b><span></span></div><button type="button" class="isle__cine-skip" id="isCineSkip"></button>'; root.appendChild(O); CN.ov = O;
      $('isCineSkip').addEventListener('click', function (e) { e.stopPropagation(); cineSkip(); }); }
    if (on) { var T = $('isCineT'); T.querySelector('small').textContent = cn('route'); T.querySelector('b').textContent = lx(STN[from]) + '  →  ' + lx(STN[to]); T.querySelector('span').textContent = f(cn('dist'), { d: Math.round(Math.abs((HSKM[to] || 0) - (HSKM[from] || 0))), m: runMin(from, to) }); $('isCineSkip').textContent = cn('skip') + ' ›'; $('isCineL').innerHTML = ''; CN.lab = {}; }
    O.classList.toggle('is-on', !!on); root.classList.toggle('is-cine', !!on); }
  function cineLabels() { var L = $('isCineL'); if (!L) return; var w = root.clientWidth, h = root.clientHeight, list = CINE.labels(w, h); list.forEach(function (q) { var e = CN.lab[q.id]; if (!e) { e = document.createElement('span'); e.className = 'isle__cine-pin'; L.appendChild(e); CN.lab[q.id] = e; e.textContent = q.id === 'yushan' ? cn('yushan') : q.id === 'sml' ? cn('sml') : cn(q.id); }
      e.style.transform = 'translate(' + Math.round(q.x) + 'px,' + Math.round(q.y) + 'px)'; e.style.opacity = q.on ? q.a.toFixed(2) : 0; e.classList.toggle('is-to', !!q.to); e.classList.toggle('is-from', !!q.from); e.classList.toggle('is-peak', q.id === 'yushan' || q.id === 'sml'); });
    Object.keys(CN.lab).forEach(function (k) { if (!list.some(function (q) { return q.id === k; })) CN.lab[k].style.opacity = 0; }); }
  function cineGo(from, to) { if (travel || fight) return; if (board) boardOff(true); setVehicle('walk', true); HSRFROM = from; LASTST = from;
    if (!cineOk()) { toast(cn('cineFail')); fade(function () { if (CITYW) cityLeave(); travel = null; mode = 'walk'; luna.root.visible = true; cityArrive(CITY4[to], 'hsr'); LASTST = to; }, function () { banner(cityTx(CITY4[to], 'arr'), cityTx(CITY4[to], (HSKM[from] || 0) < HSKM[to] ? 'arrS' : 'arrS2')); AU.fx('chime'); }); return; }
    try { CINE.prepare(R3, { tier: TIER }); } catch (e) { if (window.console) console.error('cine prepare', e); CN.ok = false; CN.fails++; return cineGo(from, to); }
    cinePatch(); var wx = null; try { wx = W.wxState ? W.wxState() : null; } catch (e) {} var au = null; try { au = AU.ctxOf ? AU.ctxOf() : null; } catch (e) {}
    try { CINE.start({ from: from, to: to, date: skyDate(), cov: wx ? Math.max(0.15, Math.min(0.9, wx.cloud || 0.35)) : 0.35, audio: au, onDone: function () { cineEnd(); } }); } catch (e) { if (window.console) console.error('cine start', e); CN.ok = false; return cineGo(from, to); }
    CN.on = true; CN.t0 = performance.now(); if (POST) { CN.tilt = POST.final.uniforms.uTilt.value; POST.final.uniforms.uTilt.value = 0; } CN.curve = KIT.U.uCurve.value; KIT.U.uCurve.value = 0; CN.see = [KIT.U.uSeeP.value.clone(), KIT.U.uSeeC.value.clone()]; KIT.U.uSeeP.value.set(1e7, 1e7, 1e7); KIT.U.uSeeC.value.set(1e7 + 1, 1e7, 1e7);
    travel = { kind: 'cine', from: from, to: to, t: 0, cam: true }; mode = 'travel'; luna.root.visible = false; $('isAct').hidden = true; cineOverlay(true, from, to); AU.fx('chime'); }
  FX_TRAVEL.cine = function (dt) { var Tv = travel; if (!CN.on) return; var cc = CINE.cam(); if (cc && Math.abs(cc.aspect - cam.aspect) > 1e-4) cc.aspect = cam.aspect; var r = CINE.update(dt); KIT.U.uNight.value = CINE.U.uNight.value; try { cineLabels(); } catch (e) {} Tv.t = r ? r.u : 1;
    /* by the clock too (a slow device's clamped steps must not keep her waiting): the film never runs past its length plus a margin */ if (!Tv.done && !window.ISLE_CINE_NOGUARD && performance.now() - CN.t0 > (CINE.F() ? CINE.F().T * 1000 * 1.6 + 4000 : 60000)) cineSkip(true); };
  function cineRestore() { CN.on = false; if (POST && CN.tilt != null) POST.final.uniforms.uTilt.value = CN.tilt; if (CN.curve != null) KIT.U.uCurve.value = CN.curve; if (CN.see) { KIT.U.uSeeP.value.copy(CN.see[0]); KIT.U.uSeeC.value.copy(CN.see[1]); } try { CINE.stop(); } catch (e) {} cineOverlay(false); }
  function cineEnd() { var Tv = travel; if (!Tv || Tv.kind !== 'cine' || Tv.done) return; Tv.done = true; var to = Tv.to, from = Tv.from, id = CITY4[to];
    fade(function () { cineRestore(); travel = null; mode = 'walk'; luna.root.visible = true; HSRFROM = from; cityArrive(id, 'hsr'); LASTST = to; }, function () { banner(cityTx(id, 'arr'), cityTx(id, (HSKM[from] || 0) < HSKM[to] ? 'arrS' : 'arrS2')); AU.fx('chime'); }); }
  function cineSkip(hard) { var Tv = travel; if (!Tv || Tv.kind !== 'cine' || Tv.done) return; if (hard) { cineEnd(); return; } CINE.skip(); }
  /* the ride from a city's platform: the departing scene (as before), then the film instead of the island's line */
  startHSR = function (from, to) { if (STOP4.indexOf(to) < 0) to = 'tpe'; if (STOP4.indexOf(from) < 0) from = LASTST; cineGo(from, to); };
  window.addEventListener('keydown', function (e) { if (!isOpen || !travel || travel.kind !== 'cine') return; if (e.code === 'Escape' || e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); cineSkip(); } }, true);
  /* a title or a page closed mid-film: put everything back */ var _toTitleAB = toTitle; toTitle = function () { if (CN.on) { cineRestore(); travel = null; } return _toTitleAB.apply(this, arguments); };

  /* ---------- the island is never walked: whatever sets her down on it takes her to a station ---------- */
  var GUARD = { t: 0 };
  var _extraTickAB = extraTick; extraTick = function (dt, ts) { _extraTickAB(dt, ts); if (!isOpen || mode !== 'walk' || travel || fall || fight || TKW || cardOn || talkQ || CITYW || (typeof LVL !== 'undefined' && LVL.on)) { GUARD.t = 0; return; } if (TK && inTK(pos.x, pos.z)) { GUARD.t = 0; return; }
    GUARD.t += dt; if (GUARD.t < 0.6) return; GUARD.t = 0; var st = LASTST || 'tpe'; toast(f(cn('noIsle'), { s: lx(STN[st]) })); fade(function () { cityArrive(CITY4[st], 'walk'); }, function () { banner(cityTitleOf(CITY4[st]), cityTx(CITY4[st], 'plaza')); }); };
  /* the map's fast travel, the phone's rides: only the four stations (by the film) */
  fastTravel = function (id) { if (STOP4.indexOf(id) >= 0) { var here = cityHere(); if (here) hsrGo(stHere(), id, true); else cineGo(LASTST, id); return; } if (id === 'kenting' || id === 'sunmoon') { if (typeof portalGo === 'function') portalGo(id); return; } };
  var _cityArriveAB = cityArrive; cityArrive = function (id) { var r = _cityArriveAB.apply(this, arguments); try { var k; for (k in CITY4) if (CITY4[k] === id) LASTST = k; } catch (e) {} try { if (board) boardOff(true); var bb = $('isBoard'); if (bb) bb.hidden = true; } catch (e) {} return r; };

  /* ---------- the map: the island as it is, the four stations, the two places of the portal ---------- */
  mapCard = function () { var S = 2, cw = 300, ch = Math.round(cw * TWG.GH / TWG.GW), here = cityHere() ? stHere() : null;
    var h = '<h2>' + esc(cn('mapT')) + '</h2><div class="isle__map isle__map--tw isle__map--4"><canvas id="isMapC" width="' + cw * S + '" height="' + ch * S + '"></canvas></div>' +
      '<h3>' + esc(cn('mapSt')) + '</h3><div class="isle__cact isle__cact--grid isle__cact--st">' + STOP4.map(function (id) { var cur = id === here; return '<button type="button" class="isle__btn isle__btn--small' + (cur ? ' is-here' : '') + '" data-st="' + id + '"' + (cur ? ' disabled' : '') + '><b>' + esc(lx(STN[id])) + '</b><small>' + esc(cur ? cn('here') : f(cn('min'), { m: runMin(here || LASTST, id) })) + '</small></button>'; }).join('') + '</div>' +
      '<h3>' + esc(cn('mapPt')) + '</h3><div class="isle__cact isle__cact--grid">' + [['kenting', 'ptK'], ['sunmoon', 'ptS']].map(function (q) { var nm = cn(q[1]).split(' · '); return '<button type="button" class="isle__btn isle__btn--small" data-pl="' + q[0] + '"><b>' + esc(nm[0]) + '</b><small>' + esc(nm[1] || '') + '</small></button>'; }).join('') + '</div>';
    var C = card(h, 'isle__cin--map'), g = C.querySelector('#isMapC').getContext('2d'), k = cw * S / TWG.GW; function P2(x, z) { return [(x - TWG.X0) * k, (z - TWG.Z0) * k]; }
    g.fillStyle = '#5fb4d8'; g.fillRect(0, 0, cw * S, ch * S); try { g.drawImage(mapCanvas(), 0, 0, cw * S, ch * S); } catch (e) {}
    g.lineWidth = 3; g.strokeStyle = '#ef7a1d'; g.beginPath(); (W.rail || []).forEach(function (p, i) { var q = P2(p[0], p[1]); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke();
    g.font = '700 ' + 12 * S + 'px "Noto Sans TC","Noto Sans JP",sans-serif'; g.textBaseline = 'middle';
    function label(x, z, s, col, rad) { var q = P2(x, z); g.fillStyle = col; g.strokeStyle = '#2b2420'; g.lineWidth = 2; g.beginPath(); g.arc(q[0], q[1], rad, 0, 7); g.fill(); g.stroke(); if (s) { g.lineWidth = 6; g.strokeStyle = 'rgba(255,248,236,.95)'; g.strokeText(s, q[0] + rad + 5, q[1]); g.fillStyle = '#2b2420'; g.fillText(s, q[0] + rad + 5, q[1]); } }
    STOP4.forEach(function (id) { var p = W.places[id]; if (p) label(p.x, p.z, lx(STN[id]), id === here ? '#0e9fb0' : '#ef7a1d', 8); });
    [['kenting', 'ptK'], ['sunmoon', 'ptS']].forEach(function (q) { var p = W.places[q[0]]; if (p) label(p.x, p.z, cn(q[1]).split(' · ')[0], '#ffffff', 6); });
    [].forEach.call(C.querySelectorAll('[data-st]'), function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-st'); cardClose(); fastTravel(id); }); });
    [].forEach.call(C.querySelectorAll('[data-pl]'), function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-pl'); cardClose(); fastTravel(id); }); }); };
  /* the board game and the island's own vehicles have no ground to run on any more */
  var _labelsAB = labels; labels = function () { _labelsAB.apply(this, arguments); try { var bb = $('isBoard'); if (bb) bb.hidden = true; } catch (e) {}
    /* the map button was bound to the old card when the HUD was built: bind it to this one */ try { var mb = $('isI_map'); if (mb && !mb.dataset.v51) { var nb = mb.cloneNode(true); nb.dataset.v51 = '1'; mb.parentNode.replaceChild(nb, mb); el.isI_map = nb; nb.addEventListener('click', function () { this.blur(); mapCard(); }); } } catch (e) {} };

  window.ISLE_x.cine = function (from, to) { if (cityHere()) { hsrGo(stHere(), to || 'txg', true); } else cineGo(from || 'tpe', to || 'txg'); return { ok: cineOk(), on: CN.on }; };
  window.ISLE_x.cineNow = function () { return { on: CN.on, f: CINE && CINE.F() ? { t: CINE.F().t, T: CINE.F().T } : null, info: typeof CINE !== 'undefined' ? CINE.info() : null, travel: travel && travel.kind }; };
  window.ISLE_x.cineSkip = function (hard) { cineSkip(hard); return true; };
