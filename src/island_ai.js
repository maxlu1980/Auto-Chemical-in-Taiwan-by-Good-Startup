/* ===== [island_ai.js] ===== */
  /* ================= (v55) nothing to wait for in silence: the opening film, the loading veil =================
     Building a place the first time (a station's city, the beach, the lake, the film of the high-speed ride) holds the page for a few seconds.
     That wait is no longer a frozen white screen: a light veil comes up over it (only if the step really takes a moment: it appears after a
     short delay, so quick changes never flash it) with the destination's name, a spinning hexagon and a moving bar that keep turning while the
     scene is built (they run on the compositor, not on the busy main thread), a line saying the first visit takes a few seconds, and a tip
     about the island. While it shows, every new material of the place is compiled, so the first frames after it do not stutter either.
     Opening the game the first time in a session plays the opening film (intro.mp4, published beside the page) full screen while the world is
     built behind it; it can be skipped, and when it ends (or if the film is missing) the title is already there.
     (v83) No film at the start: when the world is ready the loader gives way to the title at Okachimachi. The loader's wide button (“the
     technical data”) and the title's open the guide instead, with its list of products out. ================= */
  var VEIL = { title: null, sub: null, tip: Math.floor(Math.random() * 9) };
  var VTX = { zh: { k: '載入中', first: '第一次前往需要幾秒鐘建立場景，請稍候。', gen: '正在準備場景', tipK: '小提示', hsr: '高鐵 · 前往 {s}',
      tips: ['點地面或使用「導航」，Luna 會自己走到目的地。', '天空依照真實的太陽、月亮位置與即時天氣計算。', '高鐵串連臺北、臺中、臺南與左營四站。', '化學口袋的傳送門通往墾丁小灣與日月潭向山。', '日月潭在傍晚 18:30 之後施放煙火。', '墾丁大街的夜市每天 18:00 到午夜營業。', '下雨後地面會變濕，倒映出街景與燈光。', '太陽低、雨剛停時，背對太陽也許看得到彩虹。', '較舊的裝置可在設定中把畫質調成「中」或「低」。'] },
    en: { k: 'Loading', first: 'Building the scene the first time takes a few seconds.', gen: 'Preparing the scene', tipK: 'Tip', hsr: 'High-speed rail · to {s}',
      tips: ['Tap the ground or use Navigation and Luna walks there herself.', 'The sky follows the real sun, the moon and the live weather.', 'The high-speed rail links Taipei, Taichung, Tainan and Zuoying.', "The chemistry pocket's portal reaches Little Bay in Kenting and Xiangshan at Sun Moon Lake.", 'After 18:30 there are fireworks over Sun Moon Lake.', "Kenting Street's night market opens from 18:00 to midnight.", 'After rain the ground stays wet and mirrors the street and its lights.', 'With the sun low just after rain, look away from it: there may be a rainbow.', 'On older devices, set the quality to Medium or Low in Settings.'] },
    ja: { k: '読み込み中', first: '初めての場所はシーンの構築に数秒かかります。', gen: 'シーンを準備中', tipK: 'ヒント', hsr: '高鉄 · {s} へ',
      tips: ['地面をタップするか「ナビ」を使うと、ルナが自分で歩いて行きます。', '空は実際の太陽と月の位置、リアルタイムの天気で描かれます。', '高鉄は台北・台中・台南・左営の4駅を結びます。', '化学ポケットのポータルは墾丁の小湾と日月潭の向山へ。', '日月潭では18:30以降に花火が上がります。', '墾丁大街の夜市は毎日18時から深夜0時まで。', '雨のあとは地面が濡れて、街並みと灯りを映します。', '太陽が低い雨上がりは、太陽を背にすると虹が見えるかも。', '古い端末では設定で画質を「中」か「低」に。'] } };
  function vt(k) { var lg = 'zh'; try { lg = lx({ zh: 'zh', en: 'en', ja: 'ja' }); } catch (e) {} return (VTX[lg] || VTX.zh)[k]; }
  function veilEl() { var e = $('isLoad'); if (e) return e; e = document.createElement('div'); e.className = 'isle__load'; e.id = 'isLoad'; e.setAttribute('aria-live', 'polite');
    e.innerHTML = '<div class="isle__loadIn"><div class="acb-ring isle__ring" aria-hidden="true"><div class="acb-dash"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="41" fill="none" stroke-width="2.4" stroke-dasharray="4 7" stroke-linecap="round"/></svg></div><div class="acb-arc"><svg viewBox="0 0 120 120"><defs><linearGradient id="isleG" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#e3241c"/><stop offset=".55" stop-color="#f5741d"/><stop offset="1" stop-color="#ffc06a"/></linearGradient></defs><circle class="isle__ringT" cx="60" cy="60" r="53" fill="none" stroke-width="7"/><circle cx="60" cy="60" r="53" fill="none" stroke="url(#isleG)" stroke-width="7" stroke-linecap="round" stroke-dasharray="205 400" transform="rotate(-90 60 60)"/><circle cx="60" cy="7" r="5" fill="#ffb35c"/></svg></div><div class="acb-dot"><svg viewBox="0 0 120 120"><circle cx="60" cy="101" r="3.6" fill="#f5741d"/></svg></div></div><p class="isle__loadK"></p><h3 class="isle__loadT"></h3><p class="isle__loadS"></p><div class="isle__loadBar"><span></span></div><p class="isle__loadTip"><b></b> <span></span></p></div>'; (root || document.body).appendChild(e); try { var bl = document.querySelector('#acBoot .acb-luna'); if (bl && bl.src) { var im = document.createElement('img'); im.className = 'isle__loadLuna'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.src = bl.src; e.insertBefore(im, e.firstChild); } } catch (er) {} return e; }
  function veilFill(e) { var tips = vt('tips'); VEIL.tip = (VEIL.tip + 1) % tips.length; e.querySelector('.isle__loadK').textContent = vt('k'); e.querySelector('.isle__loadT').textContent = VEIL.title || vt('gen'); e.querySelector('.isle__loadS').textContent = VEIL.sub || vt('first');
    e.querySelector('.isle__loadTip b').textContent = vt('tipK'); e.querySelector('.isle__loadTip span').textContent = tips[VEIL.tip]; }
  function raf2(f) { requestAnimationFrame(function () { requestAnimationFrame(f); }); }
  /* the new place's shaders compiled while the veil is up (the cut-out of island_ag first, so its programs are the ones compiled) */
  function warm() { try { if (TK && !TK.occDone) occPrep(TK); } catch (e) {} try { if (R3 && scene && cam) R3.compile(scene, cam); } catch (e) { if (window.console) console.error('warm', e); } }
  /* every fade: the veil rises behind the white only if the middle step takes a while */
  var _fadeAI = fade; fade = function (mid, after) { if (!root) return _fadeAI(mid, after); var F2 = $('isFade'), V = veilEl(); veilFill(V); F2.classList.add('is-on');
    setTimeout(function () { V.classList.add('is-on'); raf2(function () { var t0 = performance.now(), tk0 = TK; try { mid && mid(); } catch (e) { if (window.console) console.error(e); } if (TK !== tk0 || performance.now() - t0 > 150) warm(); VEIL.title = null; VEIL.sub = null;
      requestAnimationFrame(function () { V.classList.remove('is-on'); setTimeout(function () { F2.classList.remove('is-on'); if (after) setTimeout(after, 400); }, 160); }); }); }, 420); };
  /* a step outside a fade (the film's bake before the ride): the same veil, without the white */
  function veilRun(title, fn) { if (!root) return fn(); var V = veilEl(); VEIL.title = title; veilFill(V); V.classList.add('is-on'); raf2(function () { try { fn(); } catch (e) { if (window.console) console.error(e); } VEIL.title = null; requestAnimationFrame(function () { V.classList.remove('is-on'); }); }); }
  var _cineGoAI = cineGo; cineGo = function (from, to) { if (travel || fight || window.ISLE_TEST) return _cineGoAI(from, to); var nm = ''; try { nm = cityTitleOf(CITY4[to]); } catch (e) { nm = to; } veilRun(vt('hsr').replace('{s}', nm), function () { _cineGoAI(from, to); }); };
  /* the destination's name on the veil: the portal's two places, the way back, a city by rail or on foot */
  var _portalGoAI = portalGo; portalGo = function (id) { try { VEIL.title = id === 'back' ? cityTitleOf(CITY4[LASTST || 'tpe']) : String(lv(id) || ''); } catch (e) { VEIL.title = null; } return _portalGoAI(id); };
  var _cityArriveAI = cityArrive; cityArrive = function (id, how, spot) { if (!VEIL.title) { try { VEIL.title = cityTitleOf(id); } catch (e) {} } return _cityArriveAI(id, how, spot); };

  /* ---------- (v55) the start: the page draws its loader before anything else (window.__boot, in the page's head); here it is carried through the
     stages of building the world, each one announced with its share of the bar, the bar running on toward the stage's end while it holds the
     page (the time each stage took is remembered for the next visit). The opening film, once it is published beside the page, plays inside the
     same loader while the world is built behind it. "See the guides first" stops after the stage in progress and opens the guides instead. ---------- */
  var INTRO_FILE = '';
  var BOOT = { src: window.ISLE_INTRO_SRC != null ? window.ISLE_INTRO_SRC : INTRO_FILE, run: false, ready: false, film: false, hold: false, music: null, abort: false, filmOff: null, took: [] };
  if (typeof AU !== 'undefined' && AU.music) { var _musicAI = AU.music; AU.music = function (n) { if (BOOT.hold) { BOOT.music = n; return; } return _musicAI.apply(AU, arguments); }; }
  function bootEst() { var d = [5200, 700, 2600, 2400]; try { var s = JSON.parse(localStorage.getItem('isle-boot-ms') || 'null'); if (s && (s.length === 3 || s.length === 4)) d = s.map(function (v) { return Math.max(300, Math.min(30000, (+v || 0) * 1.05)); }); } catch (e) {} while (d.length < 4) d.push(2400); return d; }
  function bootEnd() { var B = window.__boot; BOOT.hold = false; if (BOOT.music) { var m = BOOT.music; BOOT.music = null; try { AU.music(m); } catch (e) {} } if (B) B.done(); try { sessionStorage.setItem('isle-intro', '1'); } catch (e) {}
    var v = B && B.el.querySelector('.acb-film'); if (v && v.getAttribute('src')) setTimeout(function () { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} }, 900); }
  function bootFilm(B) { var seen = false; try { seen = !!sessionStorage.getItem('isle-intro'); } catch (e) {} if (!BOOT.src || !B || seen) return; var v = B.el.querySelector('.acb-film'), sn = B.el.querySelector('.acb-snd'), btn = B.el.querySelector('.acb-btn'); if (!v) return;
    var SK = { zh: '略過影片 ›', en: 'Skip the film ›', ja: '映像をスキップ ›' }[B.L] || '›'; BOOT.film = true; v.hidden = false; v.preload = 'auto';
    function off() { if (!BOOT.film) return; BOOT.film = false; B.el.classList.remove('is-film'); sn.hidden = true; if (B.btnSet) B.btnSet(); try { v.pause(); } catch (e) {} v.hidden = true; if (BOOT.ready) bootEnd(); }
    v.addEventListener('playing', function () { if (BOOT.film) { B.el.classList.add('is-film'); if (B.btnSet) B.btnSet(SK); } }); v.addEventListener('ended', off); v.addEventListener('error', off); sn.addEventListener('click', function () { v.muted = false; sn.hidden = true; });
    try { v.src = BOOT.src; var pr = v.play(); if (pr && pr.catch) pr.catch(function () { v.muted = true; sn.hidden = false; var p2 = v.play(); if (p2 && p2.catch) p2.catch(off); }); } catch (e) { off(); } BOOT.filmOff = off; }
  function bootStaged(o) { var B = window.__boot; BOOT.run = true; B.show(); B.game = true; BOOT.hold = true; BOOT.ready = false; BOOT.abort = false; BOOT.guided = false; var est = bootEst(), sync = !!window.ISLE_TEST && !window.ISLE_BOOTTEST;
    B.onBtn = function () { if (BOOT.film && BOOT.filmOff) { BOOT.filmOff(); return true; } /* (v83) pressed in the moment between the last stage and the title: the technical data all the same */ if (BOOT.ready) { guide(); return true; } BOOT.abort = true; return false; };
    if (!sync) bootFilm(B);
    /* (v59) the live weather of the four stations and of Tokyo is asked for now, so the opening film and the title have it when they begin */
    if (!sync) { try { Object.keys(OPWEA).forEach(function (k) { if (OPWEA[k]) OPWEA[k].start(); }); if (typeof TKWEA !== 'undefined') TKWEA.start(); } catch (e) {} }
    /* the world (the island, its sky and sea, and Okachimachi's streets, built together), the title scene with its lights, then every shader compiled */
    var S = [[9, 0.8, function () { if (!root) buildDom(); labels(); build3d(); }], [11, 0.86, function () { _openAI(o); }], [12, 0.95, function () { try { portalMesh(); } catch (e) {} warm(); }],
      /* (v59) the film's island; (v83) the film of Taiwan now plays inside the flight from Okachimachi (island_az), so its island is made ready here only when that flight will show it: once a session, not in the tests' synchronous boot, not when a recorded film is set */ [13, 0.985, function () { OP.want = false; OP.tour = !sync && !BOOT.src && !BOOT.abort && tourWant(); if (OP.tour) { try { opPrepare(); } catch (e) { if (window.console) console.error('opening prepare', e); OP.tour = false; } } }]], i = 0;
    function fin() { BOOT.ready = true; try { localStorage.setItem('isle-boot-ms', JSON.stringify(BOOT.took)); } catch (e) {} B.at(1, B.T.ready);
      /* (v83) the world is ready: the title at Okachimachi is the first thing seen and heard (the film of Taiwan waits inside the flight that leaves from it) */
      if (!BOOT.film) setTimeout(function () { if (!BOOT.guided) bootEnd(); }, sync ? 0 : 380); }
    function guide() { BOOT.guided = true; BOOT.hold = false; BOOT.music = null; if (BOOT.filmOff) BOOT.filmOff(); var was = false; try { was = !!isOpen; if (isOpen) close(null, { menu: true }); } catch (e) {} try { if (/^#\/island/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); } catch (e) {} B.done(B.T.guide); if (!was) guideMenu(); }
    if (sync) { S.forEach(function (s, k) { var t0 = performance.now(); s[2](); BOOT.took[k] = performance.now() - t0; }); fin(); return; }
    function next() { if (BOOT.abort) return guide(); if (i >= S.length) return fin(); var s = S[i]; B.at(i ? S[i - 1][1] : 0.4, s[0]); B.toward(s[1] * 0.985, est[i]);
      raf2(function () { var t0 = performance.now(); try { s[2](); } catch (e) { if (window.console) console.error('boot', e); } BOOT.took[i] = performance.now() - t0; B.at(s[1]); i++; setTimeout(next, window.ISLE_BOOTPAUSE || 40); }); }
    next(); }
  var _openAI = open; open = function (o) { var B = window.__boot; if (built || BOOT.run) return _openAI(o);
    if (!B || window.ISLE_NOBOOT) { if (!root) buildDom(); return veilRun(null, function () { _openAI(o); try { portalMesh(); } catch (e2) {} warm(); }); }
    if (B.guide) { try { if (/^#\/island/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); } catch (e) {} B.done(B.T.guide); guideMenu(); return; } bootStaged(o); };
  /* (v83) the technical data chosen on the loader: the guide opens with its list of products out, so the next step is one tap */
  function guideMenu() { setTimeout(function () { try { if (!isOpen && typeof Menu !== 'undefined' && Menu.open) Menu.open(true); } catch (e) {} }, 520); }
  window.ISLE_x.intro = function () { var B = window.__boot; return { run: BOOT.run, ready: BOOT.ready, film: BOOT.film, gone: B ? B.gone : null, took: BOOT.took, pct: B ? B.el.getAttribute('aria-valuenow') : null }; };
