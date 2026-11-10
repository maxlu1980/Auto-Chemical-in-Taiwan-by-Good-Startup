/* ===== [island_au.js] ===== */
  /* ================= (v75) who made the system =================
     「系統由 好時新創 開發」 / “System developed by Good Startup” / 「システム開発：Good Startup」 — one small line, in moderation, on the
     game's own screens:
     · the title card, the loading screen (the loader's own), the veil between two places and the ride film between two stations (in its
       lower black bar), the end of the opening film (under its title);
     · at the foot of the panels a player opens: the map, the chemistry pocket, the phone, the method notebook, the gear, the “more” menu
       (and the help and the picture-quality cards it leads to);
     · on the cards that sum something up: the end of a fight, the rehearsal's score (the simulator shows it on its briefing and its result).
     Never on the picture while playing: the dashboard stays as clear as it was made in v71.
     The words are kept in one place (window.AC_DEV, set by the loader). ================= */
  function devMark() { var d = window.AC_DEV || {}; return d[LANG] || d.zh || '系統由 好時新創 開發'; }
  function devP(cls) { var p = document.createElement('p'); p.className = cls; p.textContent = devMark(); return p; }
  /* the line at the foot of the card now open (once) */
  function devFoot() { try { var C = $('isCard'), box = C && !C.hidden ? C.querySelector('.isle__cin') : null; if (!box) return; var p = box.querySelector('.isle__dev'); if (p) { p.textContent = devMark(); return; } box.appendChild(devP('isle__dev')); } catch (e) { if (window.ISLE_TEST) throw e; } }
  /* ---------- the panels ---------- */
  var _mapCardAU = mapCard; mapCard = function () { var r = _mapCardAU.apply(this, arguments); devFoot(); return r; };
  var _pocketCardAU = pocketCard; pocketCard = function () { var r = _pocketCardAU.apply(this, arguments); devFoot(); return r; };
  var _phoneCardAU = phoneCard; phoneCard = function () { var was = cardOn, r = _phoneCardAU.apply(this, arguments); if (cardOn || was) devFoot(); return r; };
  var _bookCardAU = bookCard; bookCard = function () { var r = _bookCardAU.apply(this, arguments); devFoot(); return r; };
  var _gearCardAU = gearCard; gearCard = function () { var r = _gearCardAU.apply(this, arguments); devFoot(); return r; };
  var _moreCardAU = moreCard; moreCard = function () { var r = _moreCardAU.apply(this, arguments); devFoot(); return r; };
  var _helpCardAU = helpCard; helpCard = function () { var r = _helpCardAU.apply(this, arguments); devFoot(); return r; };
  var _qualCardAU = qualCard; qualCard = function () { var r = _qualCardAU.apply(this, arguments); devFoot(); return r; };
  /* the phone she holds in the cities: a strip under its screen */
  var _phOpenAU = phOpen; phOpen = function () { var r = _phOpenAU.apply(this, arguments); try { var H = $('isPh'); if (H) { var p = H.querySelector('.isle__phdev'); if (!p) H.appendChild(devP('isle__phdev')); else p.textContent = devMark(); } } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  /* ---------- the cards that sum something up: the end of a fight (won or lost — the card comes straight after endFight), the rehearsal's score ---------- */
  var DEVQ = { t: 0 };
  var _endFightAU = endFight; endFight = function (won, quiet) { var had = !!fight, r = _endFightAU.apply(this, arguments); if (had && !quiet) DEVQ.t = performance.now() + 400; return r; };
  var _cardAU = card; card = function () { var C = _cardAU.apply(this, arguments); if (DEVQ.t) { var due = performance.now() < DEVQ.t; DEVQ.t = 0; if (due) devFoot(); } return C; };
  var _olwRehDoneAU = olwRehDone; olwRehDone = function () { var r = _olwRehDoneAU.apply(this, arguments); devFoot(); return r; };
  /* ---------- between two places: the veil's card; between two stations: the film's lower bar ---------- */
  var _veilFillAU = veilFill; veilFill = function (e) { var r = _veilFillAU.apply(this, arguments); try { var box = e.querySelector('.isle__loadIn'), p = box.querySelector('.isle__dev'); if (!p) box.appendChild(devP('isle__dev isle__dev--load')); else p.textContent = devMark(); } catch (e2) { if (window.ISLE_TEST) throw e2; } return r; };
  var _cineOverlayAU = cineOverlay; cineOverlay = function (on) { var r = _cineOverlayAU.apply(this, arguments); try { var O = CN.ov; if (O) { var p = O.querySelector('.isle__cine-dev'); if (!p) O.appendChild(devP('isle__cine-dev')); else p.textContent = devMark(); } } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  window.ISLE_x.dev = function () { var q = function (s) { var e = document.querySelector(s); return e ? e.textContent : null; }; return { mark: devMark(), title: q('#isDev'), film: q('#isOpT .isle__op-dev'), card: q('#isCard .isle__dev'), boot: q('#acBoot .acb-dev'), veil: q('#isLoad .isle__dev'), ride: q('.isle__cine-dev'), phone: q('#isPh .isle__phdev') }; };
