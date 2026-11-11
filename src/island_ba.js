/* ===== [island_ba.js] ===== */
  /* ================= (v85) Okachimachi in a better light: ambient occlusion and reflections on the screen =================
     The post chain (tw_kit.js) can now read the depth of what it drew. Two passes use it: ambient occlusion — the soft dark where surfaces close
     in on one another (the corner of a wall, under a canopy, where a vending machine or a wheel meets the ground) — and screen-space reflections:
     every lit surface writes how smooth it is, and a smooth one (wet asphalt, a platform's floor, a train's side, glass) mirrors what the lens
     sees along its reflected view — the lamps, the trains, the signs — sharper the smoother it is. Both are drawn at half the resolution.
     They are on at Okachimachi (the title, the walk, the start of the flight) where the settings allow: “Auto” follows the quality level
     (Medium and above), the governor sets them aside first when the frames run short, and each has its row in the quality card. The mirrored
     second drawing of the street (the planar reflection of v55, High only) gives way to the reflections on the screen where those are on:
     they cost far less and reach every floor, not only the street's. ================= */
  var FXQ = { on: false, ao: false, ssr: false };
  function fxPlace() { /* where the two effects are used: Okachimachi, drawn (not the film, not over the cloud) */ return !!(TK && TK.id === 'tokyo' && TK.g && TK.g.visible && !(typeof CN !== 'undefined' && CN.on) && !window.ISLE_NOFX); }
  function fxTick() { /* the ground's own variation (worn, patched, polished): Okachimachi's, not on the low tier (two more samples of the noise for every point of ground) */ if (KIT.U.uGv) KIT.U.uGv.value = TIER !== 'low' && TK && TK.id === 'tokyo' && TK.g && TK.g.visible ? 1 : 0; if (!POST || !POST.fx) return; var F = POST.fx, here = fxPlace(), e = QA; F.ao = here && e.ao === true; F.ssr = here && e.ssr === true; FXQ.on = here; FXQ.ao = F.ao; FXQ.ssr = F.ssr;
    /* the occlusion a little lighter by day in the open (the sky fills the corners), full under a roof and at night; the reflections as they are */ F.aoK = 0.9; F.ssrK = 1.0;
    /* the planar reflection steps aside while the reflections on the screen are drawn */ if (F.ssr && typeof RFX !== 'undefined' && !RFX.off) { RFX.off = true; try { ATMO.RFU.kRfP.value.y = 0; } catch (e2) {} FXQ.rfx = 1; } }
  var _qHoldBA = qHold; qHold = function () { var r = _qHoldBA.apply(this, arguments); try { fxTick(); } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  window.ISLE_x.fx = function (set) { if (set && POST && POST.fx) Object.keys(set).forEach(function (k) { if (k === 'aoRad') POST.fx.mAO.uniforms.uRad.value = set[k]; else if (k === 'aoInt') POST.fx.mAO.uniforms.uInt.value = set[k]; else window['ISLE_FX_' + k] = set[k]; }); var F = POST && POST.fx; return { post: !!POST, ok: !!(F && F.ok), place: fxPlace(), ao: !!(F && F.ao), ssr: !!(F && F.ssr), n: F ? F.n : 0, qa: { ao: QA.ao, ssr: QA.ssr }, eff: (function () { var e = qEff(); return { ao: e.ao, ssr: e.ssr, refl: e.refl }; })(), rfxOff: typeof RFX !== 'undefined' ? RFX.off : null, tier: TIER }; };
