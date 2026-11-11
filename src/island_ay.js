/* ===== [island_ay.js] ===== */
  /* ================= (v82) a station's own lights at night =================
     By day the sun and the sky light everything. At night they are all but gone, and a station stood dark under its roof: only its signs and
     indicators glowed, and her head lamp burned a white disc on whatever was beside her.
     A city may now name its lit places (T.zl): boxes inside which its own lamps are on — at Okachimachi the two platforms under their rows of
     tubes, the concourse and the gates under their ceilings, the two stairs, the passage of the north exit — and the inside of each train
     (T.zlDyn, which moves with it). The shared materials light what lies inside a box from the lamps' height (tw_kit.js: floors most, walls
     less, above the lamps only what faces down), so the whole length of a platform is lit on any device, however few lamps its GPU can
     afford, and the light spills a little way over the tracks and out of the exit.
     The lamps come on as the daylight goes (from a low sun to the end of dusk) and go off the same way. Inside a lit place she has no need
     of her head lamp: it is turned down there. ================= */
  var ZL = { k: 0, inn: 0, n: 0, W: null, id: null, hooked: false, dyn: [], c0: new THREE.Color(0.55, 0.55, 0.5) };
  /* how far on the lamps are: nothing while the sun is well up, all of it by the middle of dusk */
  function zlLevel() { if (window.ISLE_ZLK != null) return +window.ISLE_ZLK; var nk = (W && W.night) || 0, k = Math.min(1, nk / 0.5); return k * k * (3 - 2 * k); }
  function zlWorld(T, z) { var a = T.toW(z[0], z[1], z[2]), b = T.toW(z[3], z[4], z[5]); return [Math.min(a.x, b.x), a.y, Math.min(a.z, b.z), Math.max(a.x, b.x), b.y, Math.max(a.z, b.z), z[6], z[7]]; }
  /* once: the lens of whatever picture is being drawn is the one the lit places are found through; her lamp answers to the place she is in */
  function zlHook() { if (ZL.hooked || !W || !W.setSpot || typeof scene === 'undefined' || !scene) return; ZL.hooked = true;
    var ob = scene.onBeforeRender; scene.onBeforeRender = function (r, s, c) { if (ob) ob.apply(this, arguments); if (c && c.matrixWorld) KIT.U.uZi.value.copy(c.matrixWorld); };
    var ss = W.setSpot; W.setSpot = function (p, d, k, o) { return ss.call(W, p, d, k * (1 - 0.94 * ZL.inn), o); }; }
  function zlTick(dt) { var U = KIT.U; if (!U.uZn) return; var T = TK && TK.T, on = !!(T && T.zl && tkShown() && TK.g && TK.g.visible), k = on ? zlLevel() : 0, i; ZL.k = k;
    /* (v85) in the rain the boxes are kept by day too, unlit: under them the ground stays dry (tw_kit.js) */ if (k < 0.01 && !(on && U.uWet && U.uWet.value > 0.02)) { U.uZn.value = 0; ZL.n = 0; ZL.inn += (0 - ZL.inn) * Math.min(1, dt * 4); return; }
    if (ZL.id !== TK.id || !ZL.W) { ZL.id = TK.id; ZL.W = T.zl.map(function (z) { return zlWorld(T, z); }); }
    var list = ZL.W, dyn = ZL.dyn; dyn.length = 0; if (T.zlDyn) { T.zlDyn(dyn, T.toL(cam.position.x, cam.position.z)); if (dyn.length) { list = ZL.W.slice(); for (i = 0; i < dyn.length; i++) list.push(zlWorld(T, dyn[i])); } }
    var n = Math.min(list.length, U.uZa.value.length); for (i = 0; i < n; i++) { var z = list[i]; U.uZa.value[i].set(z[0], z[1], z[2], z[6] * k); U.uZb.value[i].set(z[3], z[4], z[5], Math.max(0.05, z[7])); } U.uZn.value = n; ZL.n = n;
    /* is she in one of the lit places (the fixed ones) */ var inn = 0; for (i = 0; i < ZL.W.length; i++) { var q = ZL.W[i]; if (q[6] > 0 && pos.x > q[0] - 0.3 && pos.x < q[3] + 0.3 && pos.z > q[2] - 0.3 && pos.z < q[5] + 0.3 && pos.y + 0.9 > q[1] && pos.y < q[4]) { inn = 1; break; } }
    ZL.inn += (inn * k - ZL.inn) * Math.min(1, dt * 4); }
  var _lightsTickAY = lightsTick; lightsTick = function (dt) { try { zlHook(); zlTick(dt || 0.016); } catch (e) { if (window.ISLE_TEST) throw e; }
    var r = _lightsTickAY.apply(this, arguments); if (ZL.inn > 0.01 && typeof LAMP !== 'undefined' && LAMP && LAMP.lens) LAMP.lens.color.lerp(ZL.c0, Math.min(1, ZL.inn)); return r; };
  /* for the tests: how far on, how many places, whether she is in one, what is left of her lamp */
  window.ISLE_x.zl = function () { return { k: +ZL.k.toFixed(3), n: ZL.n, fixed: ZL.W ? ZL.W.length : 0, inn: +ZL.inn.toFixed(2), spot: +KIT.U.uSpK.value.toFixed(3), night: +((W && W.night) || 0).toFixed(2), hooked: ZL.hooked }; };
