/* ===== [island_az.js] ===== */
  /* ================= (v83) one opening: Okachimachi → the sea of cloud → round Taiwan → Taipei =================
     The page used to open on the film of Taiwan and only then show the title at Okachimachi, with a second flight (Okachimachi to Taipei) after
     Start. Now the title at Okachimachi is the first thing seen and heard — where the maker is from — and the two flights are one: she slings
     her glider down the street by the station, climbs through the cloud, meets the airliner, the jets and the saucer, rolls and dives — and comes
     out of the cloud over Taiwan: the island's own film (the real hour, the real weather, the birds beside her, 望春風), down the west coast,
     over the range, home up the east coast to Taipei, its name over the whole island — and from that height straight down onto the plaza of
     Taipei Main Station. The film of Taiwan plays once a session (a second start in the same session dives straight to Taipei); “skip” in the
     film ends the film and she lands; “skip” anywhere else in the flight puts her on the plaza at once, as before. ================= */
  var TOUR = { seen: false, n: 0 };
  function tourSeen() { if (TOUR.seen) return true; try { return !!sessionStorage.getItem('isle-tour'); } catch (e) { return false; } }
  /* will the flight show the film? (a test's stepped flight does not, unless it asks for it) */
  function tourWant() { if (window.ISLE_NOTOUR) return false; if (window.ISLE_TEST && !window.ISLE_TOUR) return false; if (window.ISLE_TOUR === 'always') return opOk(); return !tourSeen() && opOk(); }
  function tourDone(F) { if (!fall || fall !== F || F.phase !== 'fly') return; F.tour = 2; /* out of the film as she went in: in the white of the cloud; Taipei is built under it */ white(1); speedLines(0, 0); }
  function tourStart(F) { var ok = false; try { AU.init(); } catch (e) {} try { opHook(); ok = !!opStart(function () { tourDone(F); }); } catch (e) { if (window.console) console.error('flight film', e); ok = false; } if (!ok) return false;
    F.tour = 1; F.tourT = 0; F.tourOff = 0; TOUR.seen = true; TOUR.n++; try { sessionStorage.setItem('isle-tour', '1'); } catch (e) {} white(1); speedLines(0, 0); FLY.slow = 0;
    /* her last word of the cruise leaves the screen with the cloud */ try { var fe = $('isFsSub'); if (fe) fe.classList.remove('is-on'); FSV.subT = 0; } catch (e) {} return true; }
  /* while the film plays the flight waits where it dived: its white stays up while the film's own layer comes in over it, then thins away under the film's veil (which lifts over the island like a dawn); at the film's end it is whole again */
  function tourHold(dt0) { var F = fall; F.wt += dt0; F.tourT += dt0; var wu = Math.max(0, Math.min(1, (F.tourT - 0.5) / 1.3)); white(!OP.on ? 1 : 1 - wu * wu * (3 - 2 * wu));
    /* a film that stopped without saying so (a frame that failed): the flight goes on by itself */ if (!OP.on) { F.tourOff += dt0; if (F.tourOff > 2.5) { F.tourOff = -1e9; OP.on = true; OP.mid = function () { tourDone(F); }; try { opEnd(); } catch (e) { tourDone(F); } } } else F.tourOff = 0; }
  var _flyTickAZ = flyTick; flyTick = function (dt0) { var F = fall;
    if (F.tour === 1) { tourHold(dt0); return; }
    if (!F.tour && !F.tpe && F.t + dt0 >= FT.tpe) { F.tour = 2; if (tourWant() && tourStart(F)) return; }
    return _flyTickAZ(dt0); };
  /* skip, in the film: the film ends (its own skip does the same), and she comes down to Taipei */
  var _flySkipAZ = flySkip; flySkip = function () { if (fall && fall.phase === 'fly' && fall.tour === 1) { if (OP.on) opSkip(); return; } return _flySkipAZ.apply(this, arguments); }; window.ISLE_x.flySkip = flySkip;
  window.ISLE_x.tour = function () { return { want: tourWant(), seen: tourSeen(), n: TOUR.n, on: !!(fall && fall.phase === 'fly' && fall.tour === 1), stage: fall && fall.phase === 'fly' ? (fall.tour || 0) : null, t: fall && fall.phase === 'fly' ? +fall.t.toFixed(2) : null, op: OP.on, mid: !!OP.mid, prepared: OP.ready, boot: OP.tour }; };

  /* ---------- (v83) the title card: the technical data is a wide button under Start (island_b), so the quality link moves to the languages' row;
     and the sound hint says what a touch lets in while the sound is still held back (it was set only once the film had ended) ---------- */
  var _buildDomAZ = buildDom; buildDom = function () { var r = _buildDomAZ.apply(this, arguments); try { var q = $('isQual'), tf = root.querySelector('.isle__tfoot'); if (q && tf && q.parentNode !== tf) tf.insertBefore(q, tf.querySelector('.isle__snd')); } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  var _labelsAZ = labels; labels = function () { var r = _labelsAZ.apply(this, arguments); try { aulHint(); } catch (e) {} return r; };
