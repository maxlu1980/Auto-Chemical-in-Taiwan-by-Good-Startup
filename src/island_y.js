/* ===== [island_y.js] ===== */
  /* ================= (v45) the island is the high-speed rail's own: once a station has its city map, its ground on the island is never walked =================
     The whole-island map now serves only the ride between stations (the train's cutscene). Wherever a station has a city map — Taipei, Taichung,
     Tainan, Zuoying — every way of arriving there lands in the city: the train (as before), the map's fast travel, the phone's ride-hailing, a
     portal, a walk back from a diner, and simply walking into the station's ground on the island, which opens the city at once. Stations without
     a map yet still set her down on the island. */
  function cityStationNear(x, z) { for (var st in CITYMAP) { var p = W.places[st]; if (!p) continue; var d = Math.hypot(p.x - x, p.z - z); if (p.plazaW) d = Math.min(d, Math.hypot(p.plazaW[0] - x, p.plazaW[1] - z)); if (p.dist) d = Math.min(d, Math.hypot(p.dist[0] - x, p.dist[1] - z)); if (p.door) d = Math.min(d, Math.hypot(p.door[0] - x, p.door[1] - z)); if (d < 40) return st; } return null; }
  var AUTOIN = { t: 0, busy: false };
  function cityEnterFrom(st, how) { if (AUTOIN.busy) return; var id = CITYMAP[st]; if (!id) return; AUTOIN.busy = true; try { if (board) boardOff(true); } catch (e) {} try { setVehicle('walk', true); } catch (e) {} toast(cityTx(id, 'build'));
    fade(function () { try { cityArrive(id, how || 'walk'); } finally { AUTOIN.busy = false; } }, function () { banner(cityTitleOf(id), cityTx(id, 'plaza')); AU.fx('chime'); }); }
  /* walking (or riding) onto a mapped station's ground on the island: the city opens; a short dwell first, so a landing or a card finishes */
  var _extraTickY = extraTick; extraTick = function (dt, ts) { _extraTickY(dt, ts); if (!isOpen || CITYW || travel || fall || fight || TKW || AUTOIN.busy || cardOn || talkQ || mode !== 'walk') { AUTOIN.t = 0; return; } if (TK && inTK(pos.x, pos.z)) { AUTOIN.t = 0; return; }
    var st = cityStationNear(pos.x, pos.z); if (!st) { AUTOIN.t = 0; return; } AUTOIN.t += dt; if (AUTOIN.t < 0.9) return; AUTOIN.t = 0; cityEnterFrom(st, 'walk'); };
  /* the map's fast travel to a mapped station goes straight into its city */
  var _fastTravelY = fastTravel; fastTravel = function (id) { if (CITYMAP[id] && W.places[id] && !fight) { endTravel(); cityEnterFrom(id, 'walk'); return; } return _fastTravelY(id); };
  /* the phone's ride to a mapped station: the car comes, she boards, and the ride ends in the city's plaza */
  var _rideTickY = rideTick; rideTick = function (dt) { var R = RIDE; if (R && R.o && R.o.g === 'st' && CITYMAP[R.o.id] && R.ph === 'board' && (Math.hypot(pos.x - R.to[0], pos.z - R.to[1]) < 1.4 || R.t > 6)) { var o = R.o, c = R.car; R.ph = 'go'; luna.root.visible = false; toast(f(tx('rideIn'), { n: o.n })); AU.fx('whoosh'); try { scene.remove(c); } catch (e) {} RIDE = null; AU.engine(0);
      fade(function () { try { cityArrive(CITYMAP[o.id], 'ride'); } finally { AUTOIN.busy = false; } }, function () { toast(f(tx('rideArrive'), { n: o.n }), 'stamp'); AU.fx('chime'); rateCard(); }); return; } return _rideTickY(dt); };
  window.ISLE_x.cityNear = function () { return cityStationNear(pos.x, pos.z); };


