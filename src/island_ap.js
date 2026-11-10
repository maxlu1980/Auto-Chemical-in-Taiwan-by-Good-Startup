/* ===== [island_ap.js] ===== */
  /* ================= (v68) the music at the start: let in by the first touch, kept on the title =================
     A browser lets a page make sound only after a person has touched it (Chrome, Safari and Firefox alike), and the island opens by itself, so
     the film began silent until a touch, and the title after it had no music at all. Now:
     · the first touch anywhere — on the loading screen, the film or the title — opens the sound: the context is created or resumed inside that
       very touch (a silent sample started with it, for the older iPhones), on every kind of touch the browsers count (a press of a key, a
       mouse button down, a finger lifted: pointerup and touchend, not the pointerdown of a finger, which does not count on a phone);
     · while the island loads, a clear “♪ Tap to turn the music on” on the loading screen, so the film can begin with its music;
     · in the film, if the sound is still held back, a larger chip that pulses gently; the music comes in where the film is;
     · on the title, the music goes on, softer — 望春風 and 雨夜花 by turns (CINE.scoreLoop) — and fades when the title is left. ================= */
  var AUX = {
    /* (v83) the title at Okachimachi is the first thing after the loader: what the touch lets in is the station itself (its trains, its announcements) and the music */
    zh: { boot: '輕觸開啟聲音', on: '聲音已開啟', film: '輕觸畫面，播放音樂', hint: '輕觸畫面，聽見御徒町站的聲音' },
    en: { boot: 'Tap to turn the sound on', on: 'Sound on', film: 'Tap for the music', hint: 'Tap anywhere to hear Okachimachi Station' },
    ja: { boot: 'タップで音をオン', on: '音オン', film: 'タップで音楽を再生', hint: '画面をタップすると御徒町駅の音が流れます' } };
  function aux(k) { var L = AUX[LANG] || AUX.zh; return L[k] != null ? L[k] : AUX.zh[k]; }
  var AUL = { armed: false, ok: false, cbs: [], ev: ['pointerup', 'touchend', 'mousedown', 'click', 'keydown', 'pointerdown'], seen: null };
  function aulCtx() { try { var a = AU.ctxOf ? AU.ctxOf() : null; return a && a.ctx ? a : null; } catch (e) { return null; } }
  function aulPeek() { /* the context as it is, never created here */ try { var a = AU.ctxOf && AU.ctxOf.peek ? AU.ctxOf.peek() : null; return a; } catch (e) { return null; } }
  function aulMuted() { try { return typeof SimAudio !== 'undefined' && SimAudio.muted(); } catch (e) { return false; } }
  function aulRunning() { if (window.ISLE_SNDCHIP && !AUL.tapped) return false; /* (a test holds the sound back as a browser would) */ var a = aulPeek(); return !!(a && a.ctx && a.ctx.state === 'running'); }
  function aulDone() { if (AUL.ok || (window.ISLE_SNDCHIP && !AUL.tapped)) return; AUL.ok = true; AUL.ev.forEach(function (ev) { document.removeEventListener(ev, aulGesture, true); }); aulBootChip(); aulFilmChip(); aulHint();
    var L = AUL.cbs.slice(); AUL.cbs.length = 0; L.forEach(function (fn) { try { fn(); } catch (e) { if (window.console) console.error('sound', e); } }); }
  function aulWatch(c) { if (!c || c.__aulW) return; c.__aulW = 1; try { c.addEventListener('statechange', function () { if (c.state === 'running') aulDone(); }); } catch (e) {} }
  function aulGesture(e) { if (AUL.ok) return; if (e && e.type === 'keydown' && (e.key === 'Escape' || e.key === 'Tab' || e.metaKey || e.ctrlKey || e.altKey)) return; /* the keys a browser does not count */
    AUL.tapped = true; var a = aulCtx(); if (!a) return; var c = a.ctx; aulWatch(c);
    try { var b = c.createBuffer(1, 1, c.sampleRate || 44100), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e2) {}
    var p = null; try { p = c.state === 'running' ? null : c.resume(); } catch (e3) {} var fin = function () { if (c.state === 'running') aulDone(); };
    if (p && p.then) p.then(fin, function () {}); else fin(); }
  function aulArm() { if (AUL.armed) return; AUL.armed = true; AUL.ev.forEach(function (ev) { document.addEventListener(ev, aulGesture, { capture: true, passive: true }); }); var a = aulPeek(); if (a && a.ctx) { aulWatch(a.ctx); if (a.ctx.state === 'running') aulDone(); } }
  function aulWhen(fn) { if (AUL.ok || aulRunning()) { if (!AUL.ok) aulDone(); try { fn(); } catch (e) {} return; } AUL.cbs.push(fn); aulArm(); }
  /* the island's context, looked at without making one (a context made before a touch would only sit suspended) */
  if (typeof AU !== 'undefined' && AU.ctxOf && !AU.ctxOf.peek) { (function () { var _c = AU.ctxOf, made = null; AU.ctxOf = function () { var r = _c.apply(AU, arguments); if (r) made = r; if (r && r.ctx) aulWatch(r.ctx); return r; }; AU.ctxOf.peek = function () { return made; }; })(); }

  /* ---------- the loading screen: the music can be let in before the film ---------- */
  function aulBootChip() { var B = window.__boot; if (!B || !B.el) return; var b = B.el.querySelector('.acb-snd'); if (!b) return; var wantLock = !AUL.ok && !aulMuted() && !B.gone; if (B.gone && b.classList.contains('is-mus') && !AUL.ok) { b.hidden = true; b.classList.remove('is-mus'); return; }
    if (BOOT && BOOT.film) return; /* (a recorded film uses this button for its own sound) */
    if (wantLock) { b.hidden = false; b.classList.add('is-mus'); b.textContent = '♪ ' + aux('boot'); b.setAttribute('aria-label', aux('boot')); }
    else if (b.classList.contains('is-mus')) { b.textContent = '♪ ' + aux('on'); b.classList.add('is-ok'); setTimeout(function () { b.hidden = true; b.classList.remove('is-mus'); b.classList.remove('is-ok'); }, 1400); } }
  var _bootStagedAP = bootStaged; bootStaged = function (o) { var r = _bootStagedAP.apply(this, arguments); try { aulArm(); var act = navigator.userActivation; if (act && act.hasBeenActive && !AUL.ok) { /* touched before (the guide's own button): the browser may already allow it */ var a = aulCtx(); if (a && a.ctx.state !== 'running') { var p = a.ctx.resume(); if (p && p.then) p.then(function () { if (a.ctx.state === 'running') aulDone(); }, function () {}); } else if (a) aulDone(); } aulBootChip(); } catch (e) {} return r; };

  /* ---------- the film: the chip, larger, and the score in where the film is ---------- */
  var FCH = null;
  function aulFilmChip() { if (AUL.ok || !OP.on || aulMuted() || window.ISLE_NOCHIP) { if (FCH) { if (FCH.parentNode) FCH.parentNode.removeChild(FCH); FCH = null; } return; }
    if (FCH || !OP.ov) return; var b = document.createElement('button'); b.type = 'button'; b.className = 'isle__op-snd is-big'; b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.6" fill="currentColor"/><circle cx="16.5" cy="16" r="2.6" fill="currentColor"/></svg><span></span>'; b.lastChild.textContent = aux('film'); b.setAttribute('aria-label', aux('film')); OP.ov.appendChild(b); FCH = b; }
  rdSound = function () { if (RD.snd) { try { RD.snd.off(); } catch (e) {} } RD.snd = { off: function () { RD.snd = null; } };
    try { aulBootChip(); } catch (e) {} if (aulRunning()) { aulDone(); return; } if (window.ISLE_SNDCHIP) { AUL.ok = false; AUL.tapped = false; aulArm(); } aulFilmChip(); aulWhen(function () { var a2 = aulCtx(); if (OP.on && a2) { try { CINE.rescore(a2); } catch (e) {} } }); };

  /* ---------- the title: the music goes on, softer ---------- */
  var TWZ = { A: null, want: 0, night: null };
  function titleUp() { var T0 = $('isTitle'); return !!(isOpen && !OP.on && T0 && !T0.hidden && fall && fall.phase === 'title' && !document.hidden); }
  function twzTick(dt) { var w = titleUp() && !aulMuted(), now = performance.now(); if (!w) TWZ.since = 0; else if (!TWZ.since) TWZ.since = now; TWZ.want = w ? (now - TWZ.since) / 1000 : 0; /* by the clock: a slow frame does not delay it */
    if (w && !TWZ.A && TWZ.want > 1.1 && AUL.ok) { var a = aulCtx(); if (a && a.ctx.state === 'running') { var nt = false; try { nt = isNight(); } catch (e) {} try { TWZ.A = CINE.scoreLoop(a.ctx, a.dest, nt); TWZ.night = nt; } catch (e) { if (window.console) console.error('title music', e); TWZ.A = null; } } }
    if (!w && TWZ.A) { try { TWZ.A.stop(document.hidden ? 0.15 : 0.6); } catch (e) {} TWZ.A = null; } }
  function aulHint() { var h = $('isSndHint'); if (!h) return; h.textContent = '♪ ' + (AUL.ok || aulMuted() ? t('soundHint') : aux('hint')); }
  var _tkTickAP = tkTick; tkTick = function (dt) { var r = _tkTickAP.apply(this, arguments); try { twzTick(dt || 0); } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  var _opEndAP = opEnd; opEnd = function () { var r = _opEndAP.apply(this, arguments); try { aulFilmChip(); aulHint(); } catch (e) {} return r; };
  var _closeAP = close; close = function () { if (TWZ.A) { try { TWZ.A.stop(0.3); } catch (e) {} TWZ.A = null; } return _closeAP.apply(this, arguments); };
  /* Okachimachi's own sounds of the street come in with the same touch */
  AUL.cbs.push(function () { try { if (tkWant && !tkMuted() && TKM && TKM.soundStart) TKM.soundStart(); } catch (e) {} });
  window.ISLE_x.snd = function () { var a = aulPeek(); return { ok: AUL.ok, armed: AUL.armed, st: a && a.ctx ? a.ctx.state : null, loop: !!TWZ.A, loopN: TWZ.A ? TWZ.A.n : 0, film: !!(CINE.aud && CINE.aud()), chip: !!FCH, boot: !!(window.__boot && window.__boot.el && !window.__boot.el.querySelector('.acb-snd').hidden) }; };
  window.ISLE_x.sndTap = function () { aulGesture({ type: 'pointerup' }); return AUL.ok; };

  /* ================= (v69) her voice through the island's own sound =================
     The lines were played as <audio> elements. A phone's web view (the app's viewer on Android) lets an <audio> element play only within a few
     seconds of a touch, so on the flight the first lines spoke (just after the start button) and the rest were silent from about the airliner on.
     Now each clip is decoded once into the island's audio context — the one the first touch opened, which may play at any time — and played through
     its master (so the mute switch reaches it); a new line fades the one before it. Where there is no open context, the <audio> element as before. ================= */
  var VCX = { buf: {}, pend: {}, cur: null, n: 0, web: 0, el: 0 };
  function vcBytes(clip) { var b64 = clip.indexOf('data:') === 0 ? clip.slice(clip.indexOf(',') + 1) : clip, bin = atob(b64), u = new Uint8Array(bin.length), i; for (i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  function vcLoad(id, ctx) { if (VCX.buf[id]) return Promise.resolve(VCX.buf[id]); if (VCX.pend[id]) return VCX.pend[id]; var clip = window.LUNA_VOICE && window.LUNA_VOICE[id]; if (!clip) return Promise.reject(new Error('no clip'));
    VCX.pend[id] = new Promise(function (res, rej) { var fin = false; function ok(b) { if (fin) return; fin = true; VCX.buf[id] = b; delete VCX.pend[id]; res(b); } function bad(e) { if (fin) return; fin = true; delete VCX.pend[id]; rej(e || new Error('decode')); }
      try { var p = ctx.decodeAudioData(vcBytes(clip), ok, bad); if (p && p.then) p.then(ok, bad); } catch (e) { bad(e); } }); return VCX.pend[id]; }
  function vcPlay(b, a) { var c = a.ctx, t = c.currentTime; if (VCX.cur) { try { VCX.cur.g.gain.setTargetAtTime(0.0001, t, 0.04); VCX.cur.s.stop(t + 0.25); } catch (e) {} }
    var s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = 0.95; s.connect(g); g.connect(a.dest); s.start(t + 0.01); var me = { s: s, g: g }; VCX.cur = me; VCX.n++; VCX.web++; s.onended = function () { if (VCX.cur === me) VCX.cur = null; try { g.disconnect(); } catch (e) {} }; }
  var _sayAP = VOICE.say; VOICE.say = function (id) { var clip = window.LUNA_VOICE && window.LUNA_VOICE[id], a = aulPeek(); if (!clip || !FSL[id] || aulMuted() || !a || !a.ctx || a.ctx.state !== 'running') { VCX.el++; return _sayAP.apply(VOICE, arguments); }
    if (VCX.buf[id]) { vcPlay(VCX.buf[id], a); return; } /* not decoded yet (a first line): the element now, the buffer for the next time */ vcLoad(id, a.ctx).catch(function () {}); VCX.el++; return _sayAP.apply(VOICE, arguments); };
  /* the flight's lines decoded ahead (when the sound opens, and again as the flight starts), a few at a time */
  var VC_FLY = ['fly_go', 'fly_throw', 'fly_catch', 'fly_plane', 'fly_jet', 'fly_burst', 'fly_boom', 'fly_ufo', 'fly_land'];
  function vcPrefetch(ids) { var a = aulPeek(); if (!a || !a.ctx || a.ctx.state !== 'running') return; ids.forEach(function (id, k) { setTimeout(function () { vcLoad(id, a.ctx).catch(function () {}); }, 60 * k); }); }
  AUL.cbs.push(function () { setTimeout(function () { vcPrefetch(VC_FLY); }, 1500); });
  var _flyStartAP = flyStart; flyStart = function () { try { vcPrefetch(VC_FLY); } catch (e) {} return _flyStartAP.apply(this, arguments); };
  window.ISLE_x.voice = function () { return { web: VCX.web, el: VCX.el, decoded: Object.keys(VCX.buf).length }; };
