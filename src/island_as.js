/* ===== [island_as.js] ===== */
  /* ================= (v71) a quieter HUD on a phone =================
     On a narrow screen the dashboard covered the picture: three rows of chips, the frame-rate counter, the route's bar laid across the action
     buttons, toasts over the chips. Now: the coins and the stamps share one pill; the frame rate is off until it is switched on in the quality
     card; the route's bar stays clear of the action column, shows its two lines for eight seconds and then folds into the navigation pill —
     which from then on names the destination and the distance left, and a tap on it opens the bar again (a second tap, the list of
     destinations, as before); toasts come up over the bottom of the picture, where nothing else is. The arrows on the ground, the distance
     marker and the minimap stay as they were. ================= */
  var HQ = { min: false, t: 0, dst: null };
  function hqNarrow() { return !!(root && root.classList.contains('is-narrow')); }
  /* the frame-rate chip: on a phone only when it has been switched on */
  var _fpsOnAS = fpsOn; fpsOn = function () { try { if (hqNarrow() && localStorage.getItem(FPSK) == null) return false; } catch (e) {} return _fpsOnAS.apply(this, arguments); };
  /* the route's bar: open for eight seconds on a phone, then folded into the pill; opened again for eight seconds by a tap on the pill, and for good when the viewer taps its own buttons */
  function hqFold(on) { var nb = $('isNav'); if (!nb) return; HQ.min = !!on; nb.classList.toggle('is-min', HQ.min); try { navPill(); hudLay(); } catch (e) {} }
  function hqArm() { clearTimeout(HQ.t); HQ.t = 0; if (!hqNarrow()) { hqFold(false); return; } hqFold(false); HQ.t = setTimeout(function () { HQ.t = 0; var nb = $('isNav'); if (nb && !nb.hidden && NAV.on && hqNarrow()) hqFold(true); }, 8000); }
  var _navBarAS = navBar; navBar = function (show) { var nb0 = $('isNav'), wasHidden = !nb0 || nb0.hidden, dst = NAV.dst ? NAV.dst.id : null, r = _navBarAS.apply(this, arguments);
    if (show) { if (wasHidden || dst !== HQ.dst) { HQ.dst = dst; hqArm(); } } else { clearTimeout(HQ.t); HQ.t = 0; HQ.min = false; HQ.dst = null; if (nb0) nb0.classList.remove('is-min'); } return r; };
  /* the pill: folded, it reads the destination and the distance left */
  var _navPillAS = navPill; navPill = function () { var p = _navPillAS.apply(this, arguments); if (!p) return p; var nb = $('isNav'), folded = HQ.min && nb && !nb.hidden && NAV.on && NAV.dst;
    p.classList.toggle('is-fold', !!folded); if (folded) { var left = 0; try { left = Math.max(0, NAV.len - NAV.S[NAV.k][3]); } catch (e) {} var b = p.querySelector('b'); var tx = NAV.dst.nm + ' · ' + navM(left); if (b.textContent !== tx) b.textContent = tx; } return p; };
  /* the bar on a phone: the destination on its first line, the distance left and the step on its second (one line held both, and was cut short) */
  var _navBarTextAS = navBarText; navBarText = function (force) { var r = _navBarTextAS.apply(this, arguments); try { var b = $('isNav'); if (!b || b.hidden || !NAV.on || !NAV.S || !NAV.dst || !hqNarrow()) return r; var left = Math.max(0, NAV.len - NAV.S[NAV.k][3]), B = b.querySelector('b'), S = b.querySelector('small'), pre = navM(left) + ' · ', s0 = (S.textContent || '').replace(/^▶ /, ''); if (s0.indexOf(pre) !== 0) s0 = pre + s0; var t2 = (NAV.auto ? '▶ ' : '') + s0; if (B.textContent !== NAV.dst.nm) B.textContent = NAV.dst.nm; if (S.textContent !== t2) S.textContent = t2; } catch (e) {} return r; };
  /* a tap on the folded pill opens the bar (before the pill's own handler, which opens the list) */
  var _buildDomAS = buildDom; buildDom = function () { _buildDomAS.apply(this, arguments); try { root.addEventListener('click', function (e) { var p = e.target && e.target.closest ? e.target.closest('#isNavP') : null; if (!p || !HQ.min) return; var nb = $('isNav'); if (!nb || nb.hidden) return; e.stopPropagation(); e.preventDefault(); p.blur(); AU.fx('ok'); hqArm(); }, true); } catch (e) { if (window.ISLE_TEST) throw e; } };
  /* turning the phone, or a window that grows: the bar unfolds where there is room for it */
  var _resizeAS = resize; resize = function () { _resizeAS.apply(this, arguments); try { if (!hqNarrow() && HQ.min) hqFold(false); } catch (e) {} };
  var _cityLeaveAS = cityLeave; cityLeave = function () { clearTimeout(HQ.t); HQ.t = 0; HQ.min = false; return _cityLeaveAS.apply(this, arguments); };
  window.ISLE_x.hq = function (o) { if (o && o.fold != null) hqFold(!!o.fold); var p = $('isNavP'), nb = $('isNav'); return { narrow: hqNarrow(), min: HQ.min, pill: p ? p.textContent : null, bar: nb ? !nb.hidden && !nb.classList.contains('is-min') : null, fps: fpsOn() }; };
