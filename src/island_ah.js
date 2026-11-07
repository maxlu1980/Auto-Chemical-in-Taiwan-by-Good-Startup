/* ===== [island_ah.js] ===== */
  /* ================= (v55) the sky of each place, the sun's rays, the reflections of the floors and of the sea =================
     The physical sky (ATMO) is set for the place she is in: a town's own light low on its horizon and few stars, the dark sky of the beach and
     of the lake with the Milky Way; the haze thins with height at each place's own scale. The sun's rays stream through the gaps of buildings,
     trees and clouds (high and middle quality), the lens answers the sun with a glare and its ghosts (high). The floors of the stations and the
     streets, the wet ground in the rain, the bay at Kenting reflect the world: a planar reflection drawn each frame from the same lens (high
     quality, WebGL 2), its strength from the Fresnel term and the gloss of each surface. The lake keeps its own mirror. If the frame grows too
     slow the reflection first draws at a lower resolution, then stops, and comes back in the next place. ================= */
  var RFX = { X: null, hooked: false, ok: false, k: 0.5, ema: 16, slowT: 0, off: false, place: null, last: 0, n: 0 };
  function rfxPlaceId() { return TK && TK.g && TK.g.visible ? TK.id : null; }
  function rfxPlace() { var id = rfxPlaceId(); if (id === RFX.place) return; RFX.place = id; RFX.off = false; RFX.slowT = 0; RFX.k = TIER === 'high' ? (perf.ultra ? 0.6 : 0.5) : 0.4;
    var y0 = TK && TK.y != null ? TK.y : 0.62, q = TIER === 'high' ? 2 : 1;
    if (!id) W.atmoPlace({ lp: 0.3, dark: 0.45, q: q, fogY: 0, fogH: 40, fogK: 0.25 });
    else if (id === 'kenting') W.atmoPlace({ lp: 0.16, dark: 1, q: q, fogY: y0, fogH: 520, fogK: 0.3 });
    else if (id === 'sunmoon') W.atmoPlace({ lp: 0.22, dark: 0.9, q: q, fogY: y0, fogH: 420, fogK: 0.55 });
    else W.atmoPlace({ lp: 0.8, dark: 0.12, q: q, fogY: y0, fogH: 70, fogK: 0.32 });
    if (POST) { POST.rayK = TIER === 'low' ? 0 : 1; W.flareK = TIER === 'high' ? 1 : 0; W.raysK = id === 'kenting' || id === 'sunmoon' ? 1.15 : 1; } }
  function rfxWant() { if (!POST || !RFX.ok || RFX.off || window.ISLE_NOREFL) return false; if (!TK || !TK.T || !TK.g || !TK.g.visible) return false; if (CN && CN.on) return false; if (TK.id === 'sunmoon') return false; if (mode === 'title' && !(fall && fall.tk)) return false; return true; }
  function rfxPlane() { return TK.id === 'kenting' ? (TK.y != null ? TK.y : 0.62) : pos.y; }
  var RF_SAVE = { r: 0, sp: new THREE.Vector3(), sc: new THREE.Vector3(), hid: [] };
  function rfxPre(vc) { var U = KIT.U, RU = ATMO.RFU; RU.kRfP.value.y = 0; RF_SAVE.r = OCU.uOcR.value; OCU.uOcR.value = 0;
    RF_SAVE.sp.copy(U.uSeeP.value); RF_SAVE.sc.copy(U.uSeeC.value); U.uSeeP.value.set(0, -9999, 0); U.uSeeC.value.set(0, -9998, 0);
    RF_SAVE.hid.length = 0; if (TK.id === 'kenting' && TK.T.sea) TK.T.sea.forEach(function (m) { if (m.visible) { m.visible = false; RF_SAVE.hid.push(m); } }); if (W.rain && W.rain.visible) { W.rain.visible = false; RF_SAVE.hid.push(W.rain); }
    try { W.lightsTick(vc, CAM.tgt.x, CAM.tgt.z); } catch (e) {} }
  function rfxPost(vc) { var U = KIT.U; OCU.uOcR.value = RF_SAVE.r; U.uSeeP.value.copy(RF_SAVE.sp); U.uSeeC.value.copy(RF_SAVE.sc); RF_SAVE.hid.forEach(function (m) { m.visible = true; }); RF_SAVE.hid.length = 0; try { W.lightsTick(cam, CAM.tgt.x, CAM.tgt.z); } catch (e) {} }
  function rfxFrame() { var RU = ATMO.RFU, now = performance.now(), dt = RFX.last ? Math.min(250, now - RFX.last) : 16; RFX.last = now; RFU_T(now); rfxPlace();
    if (!rfxWant()) { RU.kRfP.value.y = 0; return; }
    /* the governor: a frame slower than 30 ms for three seconds halves the reflection's resolution, then stops it in this place */
    RFX.ema += (dt - RFX.ema) * 0.05; if (RFX.ema > 30 && !window.NO_GOV) { RFX.slowT += dt; if (RFX.slowT > 3000) { RFX.slowT = 0; if (RFX.k > 0.3) RFX.k = 0.28; else { RFX.off = true; RU.kRfP.value.y = 0; return; } } } else RFX.slowT = Math.max(0, RFX.slowT - dt * 0.5);
    var y = rfxPlane(); if (cam.position.y < y + 0.25) { RU.kRfP.value.y = 0; return; }
    if (!RFX.X) { RFX.X = ATMO.Refl(R3, { k: RFX.k }); RU.kRf.value = RFX.X.rt.texture; } var sz = R3.getDrawingBufferSize(new THREE.Vector2()); RFX.X.k = Math.min(RFX.k, 1100 / Math.max(1, sz.x));
    cam.updateMatrixWorld(); RFX.X.render(scene, cam, y, rfxPre, rfxPost); RFX.n++;
    var wx = null; try { wx = W.wxState(); } catch (e) {} var wet = Math.max(KIT.U.uWet.value || 0, 0), rain = wx ? wx.rain || 0 : 0;
    RU.kRfP.value.set(y, 1, RFX.X.res.x, RFX.X.res.y); RU.kRfK.value.x = TK.id === 'kenting' ? 1 : 1.15; RU.kRfK.value.y = Math.min(1, wet); RU.kRfK.value.z = rain > 0.05 ? Math.min(1, rain * 1.5) : 0; }
  function RFU_T(now) { ATMO.RFU.kRfK.value.w = now / 1000; }
  function rfxHook() { if (RFX.hooked || !W || !R3 || typeof ATMO === 'undefined') return; RFX.hooked = true; RFX.ok = R3.capabilities.isWebGL2 && TIER === 'high' && (!window.FAST3D || !!window.ISLE_REFL);
    var e0 = W.envUpdate; W.envUpdate = function (R) { e0.call(W, R); try { rfxFrame(); } catch (e) { if (window.console) console.error('reflection', e); if (window.ISLE_TEST) throw e; RFX.ok = false; ATMO.RFU.kRfP.value.y = 0; } }; }
  var _extraTickAH = extraTick; extraTick = function (dt, ts) { _extraTickAH(dt, ts); if (!RFX.hooked) rfxHook(); };
  window.ISLE_x.refl = function () { return { ok: RFX.ok, on: ATMO.RFU.kRfP.value.y > 0.5, y: ATMO.RFU.kRfP.value.x, k: RFX.X ? RFX.X.k : 0, n: RFX.n, off: RFX.off, ema: RFX.ema, place: RFX.place, size: RFX.X ? [RFX.X.rt.width, RFX.X.rt.height] : null }; };
  window.ISLE_x.atmo = function () { var s = W.atmoState ? W.atmoState() : null, u = W.sky.material.uniforms; return { st: s, sunE: u.uSunE && u.uSunE.value, moonE: u.uMoonE && u.uMoonE.value, cl: u.uCl && u.uCl.value.toArray(), bow: u.uBow && u.uBow.value, over: u.uOver && u.uOver.value, post: POST ? { rays: POST.final.uniforms.uRaysK.value, flare: POST.final.uniforms.uFlare.value, uv: POST.final.uniforms.uSunUV.value.toArray() } : null }; };
