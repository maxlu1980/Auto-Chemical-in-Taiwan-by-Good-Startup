/* ===== [island_b.js] ===== */
  /* ===== ISLE part 2: the overlay, the 3D, the camera, the controls, the vehicles ===== */
  var V3 = THREE.Vector3;
  var root = null, el = {}, built = false, R3 = null, POST = null, scene = null, cam = null, W = null, luna = null, npcs = [], drops = [], raf = 0, last = 0, clockT = 0, mode = 'off', isOpen = false, cameFrom = null, TIER = 'high';
  var pos = new V3(), vel = new V3(), face = Math.PI, keys = {}, target = null, path = null, pendingAct = null, stick = null, ptr = {}, gest = null, orbit = null, near = null, talkQ = null, cardOn = false, board = false, hopping = false, dice = null, fx = [], fall = null, hourNow = 12, perf = { n: 0, acc: 0, dpr: 1, max: 1, cool: 0 };
  var CAM = { yaw: 0, p: 0.6, d: 11, base: 11, view: 'classic', tgt: new V3(), userT: 0, rot: 0 };
  var VIEWS = { classic: { p: 0.6, k: 1 }, close: { p: 0.26, k: 0.58 }, high: { p: 1.08, k: 2.3 }, free: { p: 0.6, k: 1 }, photo: { p: 0.32, k: 0.75 } }, VORDER = ['classic', 'close', 'high', 'free', 'photo'];
  var VEH = { kind: 'walk', speed: 0, heading: 0, objs: {}, obj: null, tilt: 0, roll: 0 };
  var region = null, travel = null, fight = null;
  function $(id) { var e = el[id]; if (!e || (!e.isConnected && document.getElementById(id))) e = el[id] = document.getElementById(id); return e; } /* (v43) a card rebuilt with the same ids is found again (the cache no longer hands back the old, detached button) */
  var COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var ICO = { phone: 'M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2zM11 18h2M9 7h6M9 11h4', bag: 'M6 8h12l-1 12H7zM9 8V6a3 3 0 016 0v2', map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14', book: 'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11', gear: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6zM9 12l2 2 4-4', view: 'M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3M12 9a3 3 0 100 6 3 3 0 000-6z', lang: 'M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c-1 4-4 7-7 8M13 21l4-9 4 9M14.5 18h5', sound: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M18 6a8 8 0 010 12', help: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h0', home: 'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10', guides: 'M4 5h9v14H4zM13 12h8M18 8l3 4-3 4', more: 'M5 12h0M12 12h0M19 12h0', rotL: 'M4 12a8 8 0 1 0 3-6.2M4 4v4h4', rotR: 'M20 12a8 8 0 1 1-3-6.2M20 4v4h-4' };
  function svg(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICO[k] + '"/></svg>'; }

  /* ================= the overlay ================= */
  function buildDom() {
    root = document.createElement('div'); root.className = 'isle'; root.id = 'isle'; root.hidden = true; root.setAttribute('role', 'application');
    var logo = typeof LOGO_IMG !== 'undefined' ? '<span class="isle__logo"><img src="' + LOGO_IMG + '" alt="AUTO CHEMICAL INDUSTRY CO., LTD."></span>' : '';
    var icons = ['map', 'phone', 'bag', 'book', 'gear', 'view', 'lang', 'sound', 'help', 'home', 'guides'].map(function (k) { return '<button type="button" class="isle__ico isle__ico--' + k + (k === 'guides' ? ' isle__ico--exit' : '') + '" id="isI_' + k + '">' + svg(k) + '<span></span></button>'; }).join('') + '<button type="button" class="isle__ico isle__ico--more" id="isI_more">' + svg('more') + '<span></span></button>';
    root.innerHTML = '<div class="isle__view" id="isView"></div>' +
      '<div class="isle__title" id="isTitle"><div class="isle__tin">' + logo + '<p class="isle__kick" id="isTag"></p><h1 class="isle__h1"><span id="isBrand"></span></h1><p class="isle__sub" id="isSub"></p>' +
        '<div class="isle__tact"><button type="button" class="isle__btn isle__btn--go" id="isStart"><span id="isStartL"></span><svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg></button><button type="button" class="isle__btn isle__btn--tech" id="isSkip"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M7 3.5h9.5L22 9v15.5H7z"/><path d="M16.5 3.5V9H22"/><path d="M10.5 13.5h8M10.5 17.5h8M10.5 21.5h5"/></svg><span><b id="isSkipL"></b><small id="isSkipS"></small></span><svg class="isle__chev" viewBox="0 0 22 22" aria-hidden="true"><path d="M8 4.5l7 6.5-7 6.5"/></svg></button></div>' +
        '<div class="isle__tfoot"><div class="isle__langs" role="group"><button type="button" data-l="zh">繁體中文</button><button type="button" data-l="en">English</button><button type="button" data-l="ja">日本語</button></div><p class="isle__snd" id="isSndHint"></p></div><p class="isle__dev isle__dev--title" id="isDev"></p><p class="isle__credit" id="isCredit"></p></div></div>' +
      '<div class="isle__hud" id="isHud" hidden>' +
        '<div class="isle__tl"><div class="isle__chip"><b id="isPlace"></b><span id="isClock"></span></div><div class="isle__chip isle__chip--wx" id="isWx" role="status"><i class="isle__wxi" id="isWxI" aria-hidden="true"></i><b id="isWxT"></b></div><div class="isle__chip isle__chip--coins"><i class="isle__coin" aria-hidden="true"></i><b id="isCoins">0</b></div><div class="isle__chip isle__chip--st"><i class="isle__stampi" aria-hidden="true"></i><b id="isStamps">0</b></div><div class="isle__chip isle__chip--hp" id="isHearts" hidden></div></div>' +
        '<div class="isle__tr" id="isTR">' + icons + '</div>' +
        '<div class="isle__bl" id="isBL"><div class="isle__veh" id="isVeh" role="group"><button type="button" data-v="walk"><i class="isle__vi isle__vi--walk"></i><span></span></button><button type="button" data-v="moped"><i class="isle__vi isle__vi--moped"></i><span></span></button><button type="button" data-v="car"><i class="isle__vi isle__vi--car"></i><span></span></button></div><div class="isle__rot"><button type="button" id="isRotL">' + svg('rotL') + '</button><button type="button" id="isRotR">' + svg('rotR') + '</button></div></div>' +
        '<div class="isle__br"><button type="button" class="isle__board" id="isBoard"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.4"/><circle cx="15" cy="15" r="1.4"/><circle cx="15" cy="9" r="1.4"/><circle cx="9" cy="15" r="1.4"/></svg><span></span></button><button type="button" class="isle__act" id="isAct" hidden><b></b><span></span></button></div>' +
        '<div class="isle__fight" id="isFight" hidden><div class="isle__skills" id="isSkills"></div><button type="button" class="isle__fbtn isle__fbtn--dodge" id="isDodge"></button><button type="button" class="isle__fbtn isle__fbtn--atk" id="isAtk"></button></div>' +
        '<div class="isle__boss" id="isBoss" hidden><b id="isBossN"></b><small id="isBossS"></small><div class="isle__bar"><i id="isBossHP"></i></div></div>' +
        '<div class="isle__banner" id="isBanner" aria-live="polite"></div><div class="isle__viewchip" id="isViewChip"></div>' +
        '<div class="isle__stick" id="isStick" hidden><i></i></div><div class="isle__mark" id="isMark" hidden><span></span></div><div class="isle__hopn" id="isHopN" hidden></div></div>' +
      '<div class="isle__talk" id="isTalk" hidden><div class="isle__who" id="isWho"></div><p id="isLine"></p><i class="isle__more" aria-hidden="true"></i></div>' +
      '<div class="isle__card" id="isCard" hidden></div><div class="isle__pop" id="isPop" hidden></div><div class="isle__toast" id="isToast" aria-live="polite"></div><div class="isle__fade" id="isFade"></div>';
    document.body.appendChild(root);
    $('isStart').addEventListener('click', startGame); /* (v83) the technical data without the game: the guide read last (the first one, for a first visit), its list of products open */ $('isSkip').addEventListener('click', function () { close(null, { menu: true }); });
    [].forEach.call(root.querySelectorAll('.isle__langs button'), function (b) { b.addEventListener('click', function () { chooseLang(b.getAttribute('data-l')); }); });
    $('isI_map').addEventListener('click', mapCard); $('isI_phone').addEventListener('click', function () { phoneCard(); }); $('isI_bag').addEventListener('click', function () { bagCard(); }); $('isI_book').addEventListener('click', bookCard); $('isI_gear').addEventListener('click', gearCard); $('isI_view').addEventListener('click', function () { nextView(); }); $('isI_lang').addEventListener('click', langPop); $('isI_help').addEventListener('click', helpCard); $('isI_home').addEventListener('click', homeAsk); $('isI_guides').addEventListener('click', guidesCard); $('isI_more').addEventListener('click', moreCard);
    $('isI_sound').addEventListener('click', function () { if (typeof SimAudio !== 'undefined') SimAudio.toggle(); AU.init(); sndLabel(); });
    $('isBoard').addEventListener('click', function () { if (fight) return; if (board) { if (!hopping) rollDice(); } else boardOn(); });
    $('isAct').addEventListener('click', act); $('isTalk').addEventListener('click', talkNext);
    [].forEach.call(root.querySelectorAll('#isVeh button'), function (b) { b.addEventListener('click', function () { setVehicle(b.getAttribute('data-v')); }); });
    [['isRotL', 1], ['isRotR', -1]].forEach(function (q) { var b = $(q[0]); function on(e) { e.preventDefault(); CAM.rot = q[1]; CAM.userT = 4; } function off() { CAM.rot = 0; } b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off); });
    $('isAtk').addEventListener('click', function () { if (fight) playerAttack(); }); $('isDodge').addEventListener('click', function () { if (fight) playerDodge(); });
    document.addEventListener('keydown', keyDown); document.addEventListener('keyup', function (e) { keys[e.code] = false; if (e.code === 'KeyQ' || e.code === 'KeyE') CAM.rot = 0; if (fight && fight.soul && window.ISLE_soulKey) window.ISLE_soulKey(e, false); });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (!isOpen) return; if (document.hidden) AU.stop(); else AU.resume(); });
  }
  function sndLabel() { var m = typeof SimAudio !== 'undefined' && SimAudio.muted(); $('isI_sound').setAttribute('aria-pressed', m ? 'false' : 'true'); $('isI_sound').classList.toggle('is-off', !!m); }
  function labels() {
    $('isTag').textContent = t('tag'); $('isBrand').textContent = t('brand'); $('isBrand').parentNode.classList.toggle('is-long', t('brand').length >= 12); $('isSub').textContent = t('sub'); $('isStartL').textContent = P.intro ? t('cont') : t('start'); $('isSkipL').textContent = t('skip'); $('isSkipS').textContent = t('skipS'); $('isSndHint').textContent = '♪ ' + t('soundHint'); $('isCredit').textContent = t('credit'); /* (v75) who made the system */ var dv0 = $('isDev'); if (dv0) dv0.textContent = devMark();
    [].forEach.call(root.querySelectorAll('.isle__langs button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-l') === LANG ? 'true' : 'false'); });
    ['map', 'phone', 'bag', 'book', 'gear', 'view', 'lang', 'sound', 'help', 'home', 'guides', 'more'].forEach(function (k) { var b = $('isI_' + k); if (!b) return; var L2 = k === 'phone' || k === 'bag' ? tx(k) : t(k); b.querySelector('span').textContent = k === 'lang' ? ({ zh: '中文', en: 'EN', ja: '日本語' })[LANG] || 'EN' : L2; b.title = L2; b.setAttribute('aria-label', L2); }); if (typeof soulLabels === 'function') soulLabels();
    [].forEach.call(root.querySelectorAll('#isVeh button'), function (b) { var v = b.getAttribute('data-v'); b.querySelector('span').textContent = t(v); b.setAttribute('aria-pressed', VEH.kind === v ? 'true' : 'false'); b.classList.toggle('is-locked', v === 'car' && !P.veh.car); });
    $('isRotL').setAttribute('aria-label', t('rotL')); $('isRotR').setAttribute('aria-label', t('rotR')); $('isAtk').textContent = t('attack'); $('isDodge').textContent = t('dodge');
    boardLabel(); hud(); sndLabel(); placeLabel(true); relabelWorld(); if (fight) skillsDom(); }
  function relabelWorld() { if (W) W.relabel(function (id) { var c = ST2[id]; return c ? [dn(c), lx(DI[c].p).split('・')[0].split(' · ')[0]] : null; }); relabelHeader(); }
  function boardLabel() { var b = $('isBoard'); b.querySelector('span').textContent = board ? t('roll') : t('board'); b.classList.toggle('is-roll', board); }
  function hud() { if (!root) return; $('isCoins').textContent = P.coins; $('isStamps').textContent = nStamps() + '/' + STAMPS.length; }
  function toast(s, cls) { var x = $('isToast'); x.textContent = s; x.className = 'isle__toast is-on' + (cls ? ' is-' + cls : ''); clearTimeout(toast.t); toast.t = setTimeout(function () { x.className = 'isle__toast'; }, 2600); }
  function banner(s, sub) { var b = $('isBanner'); b.innerHTML = '<b>' + esc(s) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : ''); b.classList.remove('is-on'); void b.offsetWidth; b.classList.add('is-on'); clearTimeout(banner.t); banner.t = setTimeout(function () { b.classList.remove('is-on'); }, 2800); }
  function placeLabel(force) { if (!W || !root) return; var id = W.region(pos.x, pos.z); if (id === region && !force) return; var prev = region; region = id; var nm = id ? (ST2[id] ? lx(STN[id]) + ' · ' + dn(ST2[id]) : dn(id)) : t('island'); if (!nm) nm = t('island'); $('isPlace').textContent = id ? (ST2[id] ? lx(STN[id]) : dn(id).split(' · ')[0]) : t('island');
    if (!force && id && mode === 'walk' && !fight) { banner(nm, ST2[id] ? lx(DI[ST2[id]].p) : ''); var vs = { shrine: 'shrine', diner: 'diner', temple: 'temple', twinHeart: 'twinHeart', kenting: 'kenting', ken: 'kenting', eluan: 'kenting', sunmoon: 'sunmoon', sml: 'sunmoon', alishan: 'alishan', ali: 'alishan', dlc: 'dlc', taroko: 'dlc', taitung: 'taitung', chishang: 'taitung' }[id]; if (vs) stamp(vs + '.visit'); if (ST2[id]) stamp(ST2[id] + '.visit'); } }

  /* ================= the 3D ================= */
  function tierOf(R) { if (window.ISLE_TIER) return window.ISLE_TIER; var gl = R.getContext(), gpu = ''; try { var x = gl.getExtension('WEBGL_debug_renderer_info'); if (x) gpu = String(gl.getParameter(x.UNMASKED_RENDERER_WEBGL)); } catch (e) {} if (!R.capabilities.isWebGL2) return 'low'; if (/SwiftShader|llvmpipe|Software/i.test(gpu)) return 'low'; var small = Math.min(screen.width, screen.height) < 720; if (COARSE && small) return 'mid'; if (/Intel|Mali|Adreno [1-5]|PowerVR/i.test(gpu)) return 'mid'; return 'high'; }
  function build3d() {
    if (built) return true; if (typeof THREE === 'undefined' || typeof LUNA === 'undefined' || typeof TWW === 'undefined') return false;
    try { R3 = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e) { return false; }
    TIER = tierOf(R3); if (window.FAST3D) TIER = 'low'; if (window.ISLE_TIER) TIER = window.ISLE_TIER; /* (v85) the vehicles' bodies: fewer stations along them, plainer wheels below the high tier */ if (typeof TOKYO3D !== 'undefined' && TOKYO3D.vehicle) TOKYO3D.vehicle.lo = TIER === 'high' ? 0 : TIER === 'low' ? 2 : 1;
    var ULTRA = !!window.ISLE_ULTRA && TIER === 'high' && !window.FAST3D; perf.ultra = ULTRA; perf.max = ULTRA ? Math.min(window.devicePixelRatio || 1, 2.5) : TIER === 'high' ? Math.min(window.devicePixelRatio || 1, 1.75) : TIER === 'mid' ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 1.25); perf.min = ULTRA ? Math.min(1, perf.max) : TIER === 'high' ? 0.8 : 0.7; perf.dpr = perf.max; if (window.FAST3D) perf.dpr = window.ISLE_DPR || 0.5;
    R3.setPixelRatio(perf.dpr); R3.outputEncoding = THREE.sRGBEncoding; R3.toneMapping = THREE.ACESFilmicToneMapping; R3.toneMappingExposure = 1.0; R3.shadowMap.enabled = true; R3.shadowMap.type = THREE.PCFSoftShadowMap;
    $('isView').appendChild(R3.domElement); R3.domElement.setAttribute('aria-label', 'AUTO ISLAND 3D');
    scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(35, 1, 0.1, 1600);
    PROPS.init({ K: KIT, M: KIT.M() });
    var q = ULTRA ? { shadow: 4096, view: 190, grass: 1.25 } : TIER === 'high' ? {} : TIER === 'mid' ? { shadow: 1536, view: 120, grass: 0.8 } : { shadow: 1024, view: 100, grass: 0.55 };
    W = TWW.build(scene, { low: TIER === 'low' || COARSE, quality: q });
    if (TIER !== 'low' && !window.NOPOST) { POST = KIT.Post(R3, { msaa: ULTRA ? 8 : TIER === 'high' ? 4 : 2, rays: ULTRA ? 56 : TIER === 'high' ? 40 : 22, /* (v85) the samples of the occlusion and the steps of a reflection's ray */ aoN: ULTRA ? 16 : TIER === 'high' ? 12 : 8, ssrN: ULTRA ? 32 : TIER === 'high' ? 24 : 16 }); W.post = POST; R3.toneMapping = THREE.NoToneMapping; W.Q.bloom = TIER === 'high' ? 1 : 0.8; if (TIER !== 'high') POST.final.uniforms.uTilt.value = 0.35; }
    if (LUNA.setQuality) LUNA.setQuality(ULTRA ? 3 : TIER === 'high' ? 2 : TIER === 'mid' ? 1 : 0); luna = LUNA.build('luna'); scene.add(luna.root); luna.root.traverse(function (o) { if (o.isMesh && !o.userData.ink) o.castShadow = true; });
    /* the people */
    var CATPAL = { lab: 0x2b3550, po: 0x4a3b5c, sl: 0x2b3550, gs: 0xe5600c, ad: 0x5a4030, ux: 0x2f4a3c };
    var ROLE = { kang: { hatKind: 'none', pal: { suit: 0xf2efe6, pants: 0x3a4a5a, hair: 0x2a2420, skin: 0xc8946c }, hair: 'short' }, vendor: { hatKind: 'band', hat: 0xf2f0ea, pal: { suit: 0xd85a3a, pants: 0x3a3f4a, hair: 0x2c241f }, apron: 0xf2f0ea }, staff: { hatKind: 'cap', hat: 0x22313f, pal: { suit: 0x22313f, pants: 0x22313f, hair: 0x2c241f }, skirt: true, hair: 'bun' }, keeper: { hatKind: 'eboshi', hat: 0x2b2420, pal: { suit: 0xf6f4ee, pants: 0x6a8ac0 }, robe: 0x6a8ac0, hair: 'short' }, chef: { hatKind: 'band', hat: 0xf2f0ea, pal: { suit: 0x2e3442, pants: 0x2e3442 }, apron: 0x22313f }, auntie: { hatKind: 'none', pal: { suit: 0xe86a8a, pants: 0x4a4a5a, hair: 0x3a2a24 }, hair: 'bun', skirt: false }, captain: { hatKind: 'cap', hat: 0xffffff, pal: { suit: 0xf6f6f2, pants: 0x22313f } }, captain2: { hatKind: 'cap', hat: 0xffffff, pal: { suit: 0xf6f6f2, pants: 0x22313f } }, clerk: { hatKind: 'cap', hat: 0xef7a1d, pal: { suit: 0xef7a1d, pants: 0x3a3f4a } }, pilot: { hatKind: 'cap', hat: 0xc8302a, pal: { suit: 0xc8302a, pants: 0x3a3f4a } } };
    W.npcs.forEach(function (n) { pushFree(n, 0.34); }); /* nobody stands inside a wall, a bench or a tree */
    function maxOutfit() { var r = W.wxState ? W.wxState().report : null, t0 = r && r.temp != null ? r.temp : null; if (t0 == null) { var mo = new Date().getMonth() + 1; return mo >= 11 || mo <= 3 ? 'jacket' : 'shirt'; } return t0 <= 20 ? 'jacket' : 'shirt'; } window.ISLE_maxOutfit = maxOutfit;
    W.npcs.forEach(function (n, k) { var o = n.role === 'master' ? { hatKind: 'hard', vest: 0xf07a12, pal: { suit: CATPAL[ST2[n.id]] || 0x2b3550 }, seed: k } : Object.assign({ seed: k }, ROLE[n.role] || {}); if (n.role === 'master' && ST2[n.id] === 'lab') { var dr = LUNA.droplet(); dr.root.position.set(n.x, W.height(n.x, n.z), n.z); dr.root.rotation.y = n.rot; scene.add(dr.root); npcs.push({ id: n.id, role: 'drop', D: dr, x: n.x, z: n.z, r: 1.6, rot: n.rot }); return; }
      var own = n.role === 'master' && ST2[n.id] === 'gs' && typeof MAX !== 'undefined'; /* the owner of Good Startup, as he is */
      var A = own ? MAX.build({ seed: k, outfit: maxOutfit() }) : LUNA.build(n.role === 'master' ? 'worker' : 'person', o); A.root.position.set(n.x, W.height(n.x, n.z), n.z); A.root.rotation.y = n.rot; A.root.scale.setScalar(own ? (A.isAnime ? 1.18 : 0.9) : 1.18); scene.add(A.root); npcs.push({ id: n.id, role: n.role, A: A, x: n.x, z: n.z, r: 1.7, rot: n.rot, owner: own }); W.colliders.push({ x: n.x, z: n.z, r: 0.35 }); });
    var tp = W.places.tpe; for (var i = 0; i < 3; i++) { var D2 = LUNA.droplet({ color: [0xf27c18, 0xf59a2a, 0xe5600c][i] }); var hp = tp.frame.toW(-3 + i * 2.6, 6.5 + (i % 2)); D2.root.position.set(hp[0], tp.y, hp[1]); D2.root.scale.setScalar(0.9); scene.add(D2.root); drops.push({ D: D2, home: hp, y: tp.y, wait: Math.random() * 3 }); }
    /* the vehicles */ VEH.objs.moped = PROPS.moped(0xef7a1d); VEH.objs.car = PROPS.roadster(); [VEH.objs.moped, VEH.objs.car].forEach(function (o) { o.visible = false; o.traverse(function (x) { if (x.isMesh) x.castShadow = true; }); scene.add(o); });
    /* the die */ var dg = LUNA.rbox(0.62, 0.62, 0.62, 0.11, 3), mats = [1, 6, 2, 5, 3, 4].map(function (n) { return KIT.curved(new THREE.MeshToonMaterial({ map: dieFace(n), gradientMap: LUNA.grad() })); }); var dm = new THREE.Mesh(dg, mats); dice = { m: dm, t: 0, on: false, n: 1 }; dm.visible = false; scene.add(dm);
    /* the tap marker */ var tm = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.44, 32), KIT.basic({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })); tm.rotation.x = -Math.PI / 2; tm.visible = false; scene.add(tm); el.tapMark = tm;
    buildTiles(); extraBuild(); colliderGrid(); applyGear(); dogsBuild();
    built = true; resize(); return true; }
  function dieFace(n) { return KIT.ctex(128, 128, function (g) { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, 128, 128); var P2 = { 1: [[64, 64]], 2: [[38, 38], [90, 90]], 3: [[34, 34], [64, 64], [94, 94]], 4: [[38, 38], [90, 38], [38, 90], [90, 90]], 5: [[36, 36], [92, 36], [64, 64], [36, 92], [92, 92]], 6: [[38, 32], [90, 32], [38, 64], [90, 64], [38, 96], [90, 96]] }[n]; g.fillStyle = n === 1 ? '#e5600c' : '#2b2420'; P2.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], n === 1 ? 17 : 11, 0, 7); g.fill(); }); }); }
  var FACEROT = { 1: [0, -Math.PI / 2, 0], 6: [0, Math.PI / 2, 0], 2: [Math.PI / 2, 0, 0], 5: [-Math.PI / 2, 0, 0], 3: [0, 0, 0], 4: [0, Math.PI, 0] };
  function resize() { if (!R3 || !root) return; var w = root.clientWidth || window.innerWidth, h = root.clientHeight || window.innerHeight; R3.setSize(w, h, false); if (POST) POST.setSize(w, h, R3.getPixelRatio()); cam.aspect = w / h; cam.fov = w / h < 0.8 ? 46 : 36; cam.updateProjectionMatrix(); CAM.base = w / h < 0.8 ? 14.5 : w / h < 1.2 ? 12.5 : 11; if (!resize.done) { resize.done = true; CAM.d = CAM.base; } root.classList.toggle('is-narrow', w < 760); root.classList.toggle('is-touch', COARSE); }

  /* ================= collisions ================= */
  var CG = null, CGS = 6;
  function colliderGrid() { CG = {}; W.colliders.forEach(function (c, i) { var r = c.r || Math.hypot(c.hw, c.hd), x0 = Math.floor((c.x - r) / CGS), x1 = Math.floor((c.x + r) / CGS), z0 = Math.floor((c.z - r) / CGS), z1 = Math.floor((c.z + r) / CGS), x, z; for (x = x0; x <= x1; x++) for (z = z0; z <= z1; z++) (CG[x + ',' + z] = CG[x + ',' + z] || []).push(c); }); }
  function pushOut(p, rad) { var hit = false, cx = Math.floor(p.x / CGS), cz = Math.floor(p.z / CGS), seen = [], i, j; for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) { var L2 = CG[(cx + i) + ',' + (cz + j)]; if (!L2) continue; L2.forEach(function (c) { if (seen.indexOf(c) >= 0) return; seen.push(c);
        if (c.r) { var dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + rad; if (d < m && d > 1e-5) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; hit = true; } }
        else { var co = Math.cos(c.rot), si = Math.sin(c.rot), ex = p.x - c.x, ez = p.z - c.z, lxx = ex * co - ez * si, lzz = ex * si + ez * co, qx = Math.max(-c.hw, Math.min(c.hw, lxx)), qz = Math.max(-c.hd, Math.min(c.hd, lzz)), ddx = lxx - qx, ddz = lzz - qz, dd = Math.hypot(ddx, ddz);
          if (dd < rad) { if (dd < 1e-5) { var px = c.hw - Math.abs(lxx), pz = c.hd - Math.abs(lzz); if (px < pz) lxx = (lxx > 0 ? c.hw : -c.hw) + (lxx > 0 ? rad : -rad); else lzz = (lzz > 0 ? c.hd : -c.hd) + (lzz > 0 ? rad : -rad); } else { lxx = qx + ddx / dd * rad; lzz = qz + ddz / dd * rad; } p.x = c.x + lxx * co + lzz * si; p.z = c.z - lxx * si + lzz * co; hit = true; } } }); }
    return hit; }
  function pierAt(x, z) { var L0 = W.piers || (W.pier ? [W.pier] : []), i; for (i = 0; i < L0.length; i++) { var pr = L0[i], S = pr.S, dx = x - S.x, dz = z - S.z, co = Math.cos(S.rot), si = Math.sin(S.rot), lxx = dx * co - dz * si, lzz = dx * si + dz * co; if (Math.abs(lxx) < pr.w - 0.05 && lzz > (pr.z0 || 0) && lzz < pr.L) return pr; } return null; }
  function onPier(x, z) { return !!pierAt(x, z); }
  /* the nearest place to stand: walkable ground, clear of every solid thing, searched in widening rings */
  function solidAt(x, z, r) { var C = W.colliders, i; for (i = 0; i < C.length; i++) { var c = C[i]; if (Math.abs(c.x - x) > 8 || Math.abs(c.z - z) > 8) continue; if (c.r) { if (Math.hypot(x - c.x, z - c.z) < c.r + r) return true; } else { var co = Math.cos(c.rot || 0), si = Math.sin(c.rot || 0), ex = x - c.x, ez = z - c.z, lx = ex * co - ez * si, lz = ex * si + ez * co; if (Math.abs(lx) < c.hw + r && Math.abs(lz) < c.hd + r) return true; } } return false; }
  function standAt(x, z, maxR) { var R = 0, a; if (walkable(x, z) && !solidAt(x, z, 0.4)) return [x, z]; for (R = 0.6; R <= (maxR || 30); R += 0.6) { var n = Math.max(8, Math.round(R * 6)); for (a = 0; a < n; a++) { var t = a / n * Math.PI * 2, px = x + Math.sin(t) * R, pz = z + Math.cos(t) * R; if (walkable(px, pz) && !solidAt(px, pz, 0.4) && walkable(px + 0.5, pz) && walkable(px - 0.5, pz) && walkable(px, pz + 0.5) && walkable(px, pz - 0.5)) return [px, pz]; } } return [x, z]; }
  function walkable(x, z, from) { if (onPier(x, z)) return true; var h = W.height(x, z); if (h < 0.1) return false; var L2 = G_lake(); if (L2 && h < L2.h - 0.02 && (L2.sd ? L2.sd(x, z) > 0 : Math.hypot(x - L2.x, z - L2.z) < L2.r - 0.3)) return false; if (fight) { var a = fight.arena; if (Math.hypot(x - a.x, z - a.z) > a.R - 0.4) return false; } return true; }
  function G_lake() { return TWG.lake; }
  function groundY(x, z) { var pr = pierAt(x, z); if (pr) return Math.max(pr.y == null ? 0.45 : pr.y, W.height(x, z)); return Math.max(W.height(x, z), 0.1); }

  /* ================= time of Taipei ================= */
  function taipei() { try { var s = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', hour12: false }); var m = s.match(/(\d+):(\d+)/); return [+m[1] % 24, +m[2]]; } catch (e) { var d = new Date(); return [d.getHours(), d.getMinutes()]; } }
  function clock() { var hm = taipei(); hourNow = hm[0] + hm[1] / 60; if (window.ISLE_HOUR != null) hourNow = window.ISLE_HOUR; $('isClock').textContent = ('0' + Math.floor(hourNow)).slice(-2) + ':' + ('0' + Math.floor((hourNow % 1) * 60)).slice(-2); }
  /* the moment the sky shows: now (or a test hour / date) */
  function skyDate() { if (window.ISLE_DATE) return new Date(window.ISLE_DATE); if (window.ISLE_HOUR != null) { var d = new Date(), tp = new Date(d.getTime() + 8 * 3600000), base = Date.UTC(tp.getUTCFullYear(), tp.getUTCMonth(), tp.getUTCDate()) - 8 * 3600000; return new Date(base + window.ISLE_HOUR * 3600000); } return new Date(); }
  function isNight() { return W && W.P && W.P.h != null ? W.P.h < -4 : (hourNow >= 19.3 || hourNow < 5.2); }
  function dinerOpen() { return hourNow >= 19 || hourNow < 7; }

  /* ================= the camera ================= */
  function setView(v, quiet) { CAM.view = v; var V = VIEWS[v]; CAM.p = V.p; CAM.d = CAM.base * V.k; root.classList.toggle('is-photo', v === 'photo'); if (!quiet) { var c = $('isViewChip'); c.textContent = f(t('viewT'), { v: t('views')[v] }); c.classList.remove('is-on'); void c.offsetWidth; c.classList.add('is-on'); } }
  function nextView() { var i = VORDER.indexOf(CAM.view); setView(VORDER[(i + 1) % VORDER.length]); AU.fx('pop'); }
  function snapCam() { CAM.tgt.set(pos.x, pos.y + 0.8, pos.z); camera(1, true); }
  function camera(dt, snap) { if (window.DBGCAM) { var Dc = window.DBGCAM; cam.position.set(Dc[0], Dc[1], Dc[2]); cam.lookAt(Dc[3], Dc[4], Dc[5]); KIT.U.uFocus.value = Math.hypot(Dc[0] - Dc[3], Dc[1] - Dc[4], Dc[2] - Dc[5]); W.follow(Dc[3], Dc[5], cam.position); KIT.U.uSeeC.value.copy(cam.position); return; }
    var k = snap ? 1 : Math.min(1, dt * (VEH.kind === 'walk' ? 5 : 7)), ty = pos.y + (VEH.kind === 'walk' ? 0.85 : 1.0);
    if (fight) { var a = fight.lockP || fight.arena, wq = fight.lockP ? 0.32 : 0.4; CAM.tgt.x += ((pos.x * (1 - wq) + a.x * wq) - CAM.tgt.x) * k; CAM.tgt.z += ((pos.z * (1 - wq) + a.z * wq) - CAM.tgt.z) * k; ty += fight.camY || 0; } else { CAM.tgt.x += (pos.x - CAM.tgt.x) * k; CAM.tgt.z += (pos.z - CAM.tgt.z) * k; } CAM.tgt.y += (ty - CAM.tgt.y) * k;
    CAM.yaw += CAM.rot * dt * 1.6; if (CAM.userT > 0) CAM.userT -= dt;
    if (VEH.kind !== 'walk' && CAM.view !== 'free' && CAM.view !== 'high' && CAM.userT <= 0 && Math.abs(VEH.speed) > 1.5) { var want = VEH.heading + Math.PI, dy = want - CAM.yaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2; CAM.yaw += dy * Math.min(1, dt * 1.8); }
    var d = fight ? (fight.soul ? 7.4 * (fight.camK || 1.25) : CAM.d * 1.25) : CAM.d, cp = Math.cos(CAM.p), sp = Math.sin(CAM.p), T2 = CAM.tgt;
    cam.position.set(T2.x + Math.sin(CAM.yaw) * cp * d, T2.y + sp * d, T2.z + Math.cos(CAM.yaw) * cp * d);
    var gh = W.height(cam.position.x, cam.position.z); if (cam.position.y < gh + 1.0) cam.position.y = gh + 1.0;
    cam.lookAt(T2); KIT.U.uFocus.value = d * 0.9; W.follow(T2.x, T2.z, cam.position); KIT.U.uSeeP.value.set(pos.x, pos.y + 0.7, pos.z); KIT.U.uSeeC.value.copy(cam.position); }

  /* ================= input ================= */
  var RCV = new V3(), RCD = new V3();
  function groundHit(x, y) { var w = root.clientWidth, h = root.clientHeight, v = new THREE.Vector2(x / w * 2 - 1, -(y / h) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(v, cam); RCV.copy(rc.ray.origin); RCD.copy(rc.ray.direction); var tt = 0, i, step = 0.6; for (i = 0; i < 600; i++) { tt += step; var px = RCV.x + RCD.x * tt, py = RCV.y + RCD.y * tt, pz = RCV.z + RCD.z * tt, gh = W.height(px, pz); if (py <= gh) { var lo = tt - step, hi = tt, j; for (j = 0; j < 10; j++) { var mid = (lo + hi) / 2, qy = RCV.y + RCD.y * mid, qx = RCV.x + RCD.x * mid, qz = RCV.z + RCD.z * mid; if (qy <= W.height(qx, qz)) hi = mid; else lo = mid; } return [RCV.x + RCD.x * hi, RCV.z + RCD.z * hi]; } if (tt > 300) break; } return null; }
  function dragLook() { return false; } /* (v35.1) a left-button mouse drag looks around instead of walking (the free walk sets it) */
  function bindInput() {
    var cv = R3.domElement; cv.style.touchAction = 'none'; cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv.addEventListener('pointerdown', function (e) { if (mode !== 'walk' && mode !== 'board' && mode !== 'fight') return; AU.init(); var r = cv.getBoundingClientRect(); ptr[e.pointerId] = { x: e.clientX - r.left, y: e.clientY - r.top, x0: e.clientX - r.left, y0: e.clientY - r.top, t0: performance.now(), type: e.pointerType, btn: e.button, mod: e.altKey || e.ctrlKey || e.metaKey }; try { cv.setPointerCapture(e.pointerId); } catch (er) {}
      var ks = Object.keys(ptr), me = ptr[e.pointerId]; /* (v77) a finger on the right half of the picture looks round, one on the left half walks */ me.lk = e.pointerType !== 'mouse' && mode === 'walk' && me.x0 > (root.clientWidth || 1) * 0.5;
      if (ks.length === 2 && !(e.pointerType !== 'mouse' && ptr[ks[0]].lk !== ptr[ks[1]].lk)) { var a = ptr[ks[0]], b = ptr[ks[1]]; gest = { d: Math.hypot(a.x - b.x, a.y - b.y), ang: Math.atan2(b.y - a.y, b.x - a.x), my: (a.y + b.y) / 2, D: CAM.d, yaw: CAM.yaw, p: CAM.p }; stickEnd(); orbit = null; }
      else if (me.lk && ks.length <= 2 && !gest) orbit = { x: e.clientX, y: e.clientY, yaw: CAM.yaw, p: CAM.p, left: true, on: false, id: e.pointerId };
      else if (e.pointerType === 'mouse' && (e.button === 2 || e.button === 1 || ptr[e.pointerId].mod || (e.button === 0 && dragLook()))) orbit = { x: e.clientX, y: e.clientY, yaw: CAM.yaw, p: CAM.p, left: e.button === 0 && !ptr[e.pointerId].mod, on: false }; });
    cv.addEventListener('pointermove', function (e) { var p = ptr[e.pointerId]; if (!p) return; var r = cv.getBoundingClientRect(); p.x = e.clientX - r.left; p.y = e.clientY - r.top;
      if (gest) { var ks = Object.keys(ptr); if (ks.length === 2) { var a = ptr[ks[0]], b = ptr[ks[1]], d = Math.hypot(a.x - b.x, a.y - b.y), ang = Math.atan2(b.y - a.y, b.x - a.x), my = (a.y + b.y) / 2; CAM.d = Math.max(4.5, Math.min(40, gest.D * gest.d / Math.max(20, d))); var da = ang - gest.ang; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; CAM.yaw = gest.yaw - da; CAM.p = Math.max(0.12, Math.min(1.35, gest.p + (my - gest.my) * 0.004)); CAM.userT = 4; } return; }
      if (orbit && (orbit.id == null || orbit.id === e.pointerId)) { if (orbit.left && !orbit.on && Math.hypot(e.clientX - orbit.x, e.clientY - orbit.y) < (orbit.id != null ? 9 : 5)) return; orbit.on = true; CAM.yaw = orbit.yaw - (e.clientX - orbit.x) * 0.008; CAM.p = Math.max(0.12, Math.min(1.35, orbit.p + (e.clientY - orbit.y) * 0.005)); CAM.userT = 4; return; }
      var dx = p.x - p.x0, dy = p.y - p.y0, m = Math.hypot(dx, dy); if (m > 14 && !p.lk && !cardOn && !talkQ && (p.type !== 'mouse' || e.buttons === 1)) { p.stk = 1; if (!stick) stickStart(p); var R = 60; stick.x = Math.max(-1, Math.min(1, dx / R)); stick.y = Math.max(-1, Math.min(1, dy / R)); var mm = Math.hypot(stick.x, stick.y); if (mm > 1) { stick.x /= mm; stick.y /= mm; } stickDraw(); } });
    function up(e) { var p = ptr[e.pointerId]; if (!p) return; delete ptr[e.pointerId]; if (Object.keys(ptr).length < 2) gest = null; if (orbit && (orbit.id == null || orbit.id === e.pointerId)) { var ob = orbit; orbit = null; if (!(ob.left && !ob.on)) return; } /* a left click that did not drag still walks */ var moved = Math.hypot(p.x - p.x0, p.y - p.y0); if (stick) { if (p.stk) stickEnd(); return; } if (moved < 14 && performance.now() - p.t0 < 600 && e.type === 'pointerup' && p.btn === 0 && !p.mod) tap(p.x, p.y); }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('lostpointercapture', up);
    window.addEventListener('blur', inputReset); document.addEventListener('visibilitychange', function () { if (document.hidden) inputReset(); }); window.addEventListener('pagehide', inputReset);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); CAM.d = Math.max(4.5, Math.min(40, CAM.d * (e.deltaY > 0 ? 1.08 : 0.93))); }, { passive: false });
  }
  function stickStart(p) { stick = { on: true, x: 0, y: 0 }; var s = $('isStick'); s.hidden = false; s.style.left = p.x0 + 'px'; s.style.top = p.y0 + 'px'; }
  function stickDraw() { $('isStick').firstChild.style.transform = 'translate(' + stick.x * 34 + 'px,' + stick.y * 34 + 'px)'; }
  function stickEnd() { stick = null; $('isStick').hidden = true; }
  function scr(x, y, z) { var v = new V3(x, y, z).project(cam); return { x: (v.x + 1) / 2 * root.clientWidth, y: (1 - v.y) / 2 * root.clientHeight, on: v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1 }; }
  function tap(x, y) {
    if (cardOn) return; if (talkQ) { talkNext(); return; } if (travel && travel.kind === 'ferry' && (travel.warp || 1) < 4) { travel.warp = 4; toast(t('ferryFast')); return; } if (hopping || travel) return;
    if (fight) { var bs = scr(fight.boss.root.position.x, fight.boss.h * 0.6, fight.boss.root.position.z); if (Math.hypot(bs.x - x, bs.y - y) < 110) { playerAttack(); return; } }
    var hit = null, hd = 56; npcs.forEach(function (n) { if (n.hidden) return; var s = scr(n.x, W.height(n.x, n.z) + 1.0, n.z), d = Math.hypot(s.x - x, s.y - y); if (s.on && d < hd) { hd = d; hit = { kind: 'npc', n: n, to: [n.x, n.z] }; } });
    if (!hit) W.interact.forEach(function (it) { var s = scr(it.x, W.height(it.x, it.z) + 0.8, it.z), d = Math.hypot(s.x - x, s.y - y); if (s.on && d < 60 && d < hd + 30) { hd = d; hit = { kind: 'it', it: it, to: [it.x, it.z] }; } });
    var g = groundHit(x, y);
    if (hit) { if (board) boardOff(true); var to = hit.to, ax = pos.x - to[0], az = pos.z - to[1], ad = Math.hypot(ax, az) || 1, stopD = hit.kind === 'it' ? 0 : 1.0; walkTo([to[0] + ax / ad * stopD, to[1] + az / ad * stopD], { act: hit.kind === 'it' ? { kind: 'it', it: hit.it } : hit }); return; }
    if (g) { if (board) boardOff(true); walkTo(g); } }
  function walkTo(p, o) { o = o || {}; var d = Math.hypot(p[0] - pos.x, p[1] - pos.z); target = [p[0], p[1], d > 6]; path = null; pendingAct = o.act || null; var tm = el.tapMark; tm.position.set(p[0], W.height(p[0], p[1]) + 0.06, p[1]); tm.visible = true; tm.scale.setScalar(1); fx.push({ kind: 'tap', t: 0 }); }
  function keyDown(e) {
    if (!isOpen) return; if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (mode === 'title') { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); startGame(); } return; }
    if (e.code === 'Escape') { if (!$('isPop').hidden) popClose(); else if (cardOn) cardClose(); else if (talkQ) talkEnd(); else if (CAM.view === 'photo') setView('classic'); return; }
    keys[e.code] = true; if (/^Arrow|Space|Tab/.test(e.code)) e.preventDefault();
    if (fight && fight.soul && window.ISLE_soulKey && window.ISLE_soulKey(e, true)) return;
    if (e.code === 'KeyQ') { CAM.rot = 1; CAM.userT = 4; } else if (e.code === 'KeyE') { CAM.rot = -1; CAM.userT = 4; }
    else if (e.code === 'KeyZ') CAM.p = Math.max(0.12, CAM.p - 0.08); else if (e.code === 'KeyX') CAM.p = Math.min(1.35, CAM.p + 0.08);
    if (fight) { if (e.code === 'KeyJ' || e.code === 'Enter') playerAttack(); else if (e.code === 'KeyK' || e.code === 'Space') playerDodge(); else if (e.code === 'Tab') nextSkill(); return; }
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyF') { if (cardOn) return; act(); }
    else if (e.code === 'KeyR') { if (!cardOn && !talkQ) { if (!board) boardOn(); else if (!hopping) rollDice(); } }
    else if (e.code === 'KeyM') mapCard(); else if (e.code === 'KeyB') bookCard(); else if (e.code === 'KeyG') gearCard(); else if (e.code === 'KeyV') nextView(); else if (e.code === 'KeyH') helpCard();
    else if (e.code === 'Digit1') setVehicle('walk'); else if (e.code === 'Digit2') setVehicle('moped'); else if (e.code === 'Digit3') setVehicle('car'); }
  function inputVec() { var ix = 0, iz = 0, run = false; if (!cardOn && !talkQ && !hopping && !travel) { if (keys.KeyW || keys.ArrowUp) iz -= 1; if (keys.KeyS || keys.ArrowDown) iz += 1; if (keys.KeyA || keys.ArrowLeft) ix -= 1; if (keys.KeyD || keys.ArrowRight) ix += 1; run = keys.ShiftLeft || keys.ShiftRight; if (stick && stick.on) { ix = stick.x; iz = stick.y; run = Math.hypot(ix, iz) > 0.85; } }
    var m = Math.min(1, Math.hypot(ix, iz)); if (m > 0) { var l = Math.hypot(ix, iz); ix /= l; iz /= l; }
    /* (v36.2) on foot, the directions keep the frame of the camera as it was when the keys (or the stick) were pressed: the camera swinging round
       by itself (behind her, along a stair, round a pillar) no longer bends her course; turning the camera on purpose (Q/E, a drag, two fingers) steers */
    var yaw = CAM.yaw; if (VEH.kind === 'walk' && m > 0) { var kk = stick && stick.on ? 'stick' : (keys.KeyW || keys.ArrowUp ? 'w' : '') + (keys.KeyS || keys.ArrowDown ? 's' : '') + (keys.KeyA || keys.ArrowLeft ? 'a' : '') + (keys.KeyD || keys.ArrowRight ? 'd' : '');
      if (kk !== LATCH.k || CAM.rot || orbit || gest) LATCH.yaw = CAM.yaw; LATCH.k = kk; yaw = LATCH.yaw; } else LATCH.k = '';
    var c = Math.cos(yaw), s = Math.sin(yaw); return { x: (ix * c + iz * s) * m, z: (-ix * s + iz * c) * m, m: m, run: run }; }
  var LATCH = { k: '', yaw: 0 };
  /* (v36.2) a key or a finger let go of where this page cannot hear it (the window lost focus, the tab was hidden, the pointer capture was lost):
     nothing stays pressed, so she never walks on by herself */
  function inputReset() { for (var k in keys) keys[k] = false; CAM.rot = 0; orbit = null; gest = null; Object.keys(ptr).forEach(function (id) { delete ptr[id]; }); if (stick) stickEnd(); LATCH.k = ''; if (window.ISLE_inputReset) window.ISLE_inputReset(); }

  /* ================= walking ================= */
  var STEPT = 0;
  function move(dt) {
    var I = inputVec(), ix = I.x, iz = I.z, run = I.run, ctl = I.m > 0.01;
    if (ctl) { target = null; path = null; pendingAct = null; el.tapMark.visible = false; if (board && !hopping) boardOff(true); }
    if (pendingAct && pendingAct.kind === 'it' && Math.hypot(pendingAct.it.x - pos.x, pendingAct.it.z - pos.z) < Math.min(1.0, (pendingAct.it.r || 1.5) * 0.6)) { target = null; path = null; el.tapMark.visible = false; var pa0 = pendingAct; pendingAct = null; doAct(pa0); } /* close enough to the spot: act, even when the spot itself sits against a wall */
    if (!ctl && !hopping && (target || (path && path.length))) { if (!target && path && path.length) target = path.shift(); if (target) { var dx = target[0] - pos.x, dz = target[1] - pos.z, d = Math.hypot(dx, dz); if (d < 0.3 && VEH.kind === 'walk') { target = null; if (!path || !path.length) { el.tapMark.visible = false; path = null; if (pendingAct) { var pa = pendingAct; pendingAct = null; doAct(pa); } } } else { ix = dx / d; iz = dz / d; run = run || target[2]; if (d < 1.2 && (!path || !path.length) && VEH.kind === 'walk') { ix *= d / 1.2 + 0.2; iz *= d / 1.2 + 0.2; } } } }
    if (VEH.kind !== 'walk') { drive(dt, ix, iz); return; }
    if (fight && fight.soul && window.ISLE_soulMove) { window.ISLE_soulMove(dt, ix, iz, run, Math.min(1, Math.hypot(ix, iz))); nearest(); return; }
    var m = Math.min(1, Math.hypot(ix, iz)), sp = hopping ? 0 : (run ? 5.6 : 2.7) * m * (fight ? 1.15 : 1);
    if (luna.mode === 'roll') sp = (P.buff.tamago ? 9 : 7.5);
    if (m > 0.01) { var dir = Math.atan2(ix, iz), da = dir - face; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; face += da * Math.min(1, dt * 12); vel.set(Math.sin(dir) * sp, 0, Math.cos(dir) * sp); }
    else if (luna.mode === 'roll') vel.set(Math.sin(face) * sp, 0, Math.cos(face) * sp); else vel.multiplyScalar(Math.max(0, 1 - dt * 12));
    if (!hopping) {
      var nx = pos.x + vel.x * dt, nz = pos.z + vel.z * dt, r = { x: nx, z: nz };
      if (!walkable(nx, nz) && walkable(pos.x, pos.z)) { r.x = pos.x; r.z = pos.z; if (walkable(nx, pos.z)) r.x = nx; else if (walkable(pos.x, nz)) r.z = nz; if (m > 0.5 && !fight && W.height(nx, nz) < 0.1 && !onPier(nx, nz) && (performance.now() - (move.wt || 0) > 4000)) { move.wt = performance.now(); toast(t('water')); } }
      var h0 = groundY(pos.x, pos.z), h1 = groundY(r.x, r.z), dd = Math.hypot(r.x - pos.x, r.z - pos.z); if (dd > 1e-4 && (h1 - h0) / dd > 1.6) { r.x = pos.x; r.z = pos.z; }
      pushOut(r, 0.3); pos.x = r.x; pos.z = r.z; pos.y = groundY(pos.x, pos.z);
      var spd = Math.hypot(vel.x, vel.z); luna.speed = spd; if (['wave', 'cheer', 'jump', 'hop', 'attack', 'roll', 'hurt', 'peace', 'victory'].indexOf(luna.mode) < 0) LUNA.setMode(luna, spd > 0.05 ? (spd > 3.4 ? 'run' : 'walk') : 'idle');
      if (spd > 0.4) { STEPT -= dt * spd; if (STEPT <= 0) { STEPT = 1.2; AU.fx(onPier(pos.x, pos.z) ? 'stepWood' : 'step'); } } }
    luna.root.position.copy(pos); luna.root.rotation.set(0, face, 0); nearest(); }

  /* ================= vehicles ================= */
  function setVehicle(v, quiet) {
    if (travel || hopping || fight) return; if (v === 'car' && !P.veh.car) { toast(t('vehLocked')); AU.fx('bad'); return; } if (v === VEH.kind) return;
    var prev = VEH.objs[VEH.kind]; if (prev) prev.visible = false; VEH.kind = v; VEH.obj = VEH.objs[v] || null; VEH.speed = 0; VEH.heading = face;
    if (VEH.obj) { VEH.obj.visible = true; LUNA.setMode(luna, v === 'car' ? 'drive' : 'ride'); AU.init(); AU.engine(0.05, v); if (!quiet) { toast(f(t('vehOn'), { v: t(v) })); puff(pos.x, pos.z); } } else { LUNA.setMode(luna, 'idle'); AU.engine(0); luna.root.rotation.set(0, face, 0); }
    target = null; path = null; el.tapMark.visible = false; [].forEach.call(root.querySelectorAll('#isVeh button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); }); placeVehicle(0); }
  var NRM = { x: 0, y: 1, z: 0 };
  function keysOrStick() { return !!(keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight || (stick && Math.hypot(stick.x, stick.y) > 0.05)); }
  function drive(dt, ix, iz) {
    var car = VEH.kind === 'car', vmax = car ? 19 : 12, acc = car ? 9 : 8, turn = car ? 2.2 : 2.9, m = Math.min(1, Math.hypot(ix, iz)), want = m > 0.05 ? Math.atan2(ix, iz) : VEH.heading;
    var dh = want - VEH.heading; while (dh > Math.PI) dh -= Math.PI * 2; while (dh < -Math.PI) dh += Math.PI * 2;
    var tr = turn * Math.min(1, 0.3 + Math.abs(VEH.speed) / 6) * dt; VEH.steer = Math.max(-1, Math.min(1, dh * 2)); VEH.heading += Math.max(-tr, Math.min(tr, dh));
    var tgtV = m > 0.05 ? vmax * m * (Math.abs(dh) > 1.6 ? 0.25 : 1) : 0;
    /* driving to a tapped point: brake in time to stop on it (v² = 2·a·d), creep round when it lies to the side, and stop for good on arrival */
    if (target && (!path || !path.length) && !hopping) { var tx = target[0] - pos.x, tz = target[1] - pos.z, td = Math.hypot(tx, tz), stopR = car ? 0.9 : 0.6, brk = acc * 1.1;
      tgtV = Math.min(tgtV, Math.sqrt(2 * brk * Math.max(0, td - stopR * 0.5)) * (Math.abs(dh) > 0.9 ? 0.45 : 1));
      if (VEH.tgtRef !== target) { VEH.tgtRef = target; VEH.bestD = td; VEH.stuckT = 0; } if (td < VEH.bestD - 0.25) { VEH.bestD = td; VEH.stuckT = 0; } else VEH.stuckT += dt; /* blocked by a wall: give up rather than grind against it */
      if (td < stopR || (td < stopR * 2.6 && Math.abs(dh) > 1.1 && Math.abs(VEH.speed) < 2.2) || VEH.stuckT > 2.5) { target = null; path = null; el.tapMark.visible = false; tgtV = 0; VEH.arrived = true; if (pendingAct) { var pa1 = pendingAct; pendingAct = null; doAct(pa1); } } }
    if (VEH.arrived && !target) { tgtV = m > 0.05 && keysOrStick() ? tgtV : 0; if (Math.abs(VEH.speed) < 0.05) { VEH.speed = 0; VEH.arrived = false; } }
    VEH.speed += Math.max(-acc * 1.6 * dt, Math.min(acc * dt, tgtV - VEH.speed));
    var nx = pos.x + Math.sin(VEH.heading) * VEH.speed * dt, nz = pos.z + Math.cos(VEH.heading) * VEH.speed * dt, r = { x: nx, z: nz };
    if (!walkable(nx, nz) || W.height(nx, nz) < 0.2) { r.x = pos.x; r.z = pos.z; VEH.speed *= -0.25; if (Math.abs(VEH.speed) > 3 && performance.now() - (drive.wt || 0) > 3500) { drive.wt = performance.now(); toast(t('water')); } }
    var h0 = groundY(pos.x, pos.z), h1 = groundY(r.x, r.z), dd = Math.hypot(r.x - pos.x, r.z - pos.z); if (dd > 1e-4 && (h1 - h0) / dd > 1.1) { r.x = pos.x; r.z = pos.z; VEH.speed *= 0.3; }
    if (pushOut(r, car ? 0.75 : 0.5)) VEH.speed *= 0.85; pos.x = r.x; pos.z = r.z; pos.y = groundY(pos.x, pos.z); face = VEH.heading;
    AU.engine(0.08 + Math.abs(VEH.speed) / vmax, VEH.kind); placeVehicle(dt); nearest(); }
  var MOUNT = { hands: [new V3(), new V3()], feet: [new V3(), new V3()], lean: 0, headX: 0 }, WIND = new V3(), SPIN = 0;
  function placeVehicle(dt) { var o = VEH.obj; if (!o) return; o.position.set(pos.x, pos.y, pos.z); var e = 0.9, hf = groundY(pos.x + Math.sin(VEH.heading) * e, pos.z + Math.cos(VEH.heading) * e), hb = groundY(pos.x - Math.sin(VEH.heading) * e, pos.z - Math.cos(VEH.heading) * e), pitch = Math.atan2(hf - hb, 2 * e), roll = VEH.kind === 'moped' ? -(VEH.steer || 0) * Math.min(1, Math.abs(VEH.speed) / 8) * 0.32 : 0;
    VEH.tilt += (pitch - VEH.tilt) * Math.min(1, (dt || 1) * 8); VEH.roll += (roll - VEH.roll) * Math.min(1, (dt || 1) * 6); o.rotation.set(0, 0, 0); o.rotateY(VEH.heading); o.rotateX(-VEH.tilt); o.rotateZ(VEH.roll);
    /* the handlebar or the steering wheel and the front wheels turn with the steering; the wheels roll with the speed */
    var ud = o.userData, st = VEH.steer || 0; VEH.stS = (VEH.stS || 0) + (st - (VEH.stS || 0)) * Math.min(1, (dt || 1) * 8);
    if (ud.steerG) ud.steerG.rotation.y = VEH.stS * 0.42; if (ud.wheelG) ud.wheelG.rotation.y = -VEH.stS * 1.7; if (ud.fronts) ud.fronts.forEach(function (f2) { f2.rotation.y = VEH.stS * 0.42; });
    SPIN += VEH.speed * (dt || 0) / (ud.wr || 0.2); if (ud.wheels) ud.wheels.forEach(function (w, i) { var base = ud.kind === 'moped' && i === 1 ? -o.userData.steerG.parent.rotation.x : 0; w.rotation.x = base + (w.rotation.y > 1 ? -SPIN : SPIN); });
    o.updateMatrixWorld(true);
    /* the rider: her hip joint on the seat, upright with the vehicle; hands and feet to the mount points (by IK in LUNA.update) */
    var mk = ud.mk, up = new V3(0, 1, 0).applyQuaternion(o.quaternion); mk.seat.getWorldPosition(luna.root.position).addScaledVector(up, -luna.hip * luna.root.scale.y); luna.root.quaternion.copy(o.quaternion);
    mk.gripL.getWorldPosition(MOUNT.hands[0]); mk.gripR.getWorldPosition(MOUNT.hands[1]); mk.footL.getWorldPosition(MOUNT.feet[0]); mk.footR.getWorldPosition(MOUNT.feet[1]); MOUNT.lean = ud.lean + (ud.kind === 'moped' ? Math.min(0.12, Math.abs(VEH.speed) * 0.01) : 0); MOUNT.headX = ud.headX; MOUNT.look = ud.kind === 'car' ? 0 : -VEH.stS * 0.25;
    WIND.set(-Math.sin(VEH.heading), 0.15, -Math.cos(VEH.heading)).multiplyScalar(Math.abs(VEH.speed) * 1.6);
    luna.speed = 0; if (luna.mode !== (VEH.kind === 'car' ? 'drive' : 'ride')) LUNA.setMode(luna, VEH.kind === 'car' ? 'drive' : 'ride'); }
  /* ================= the title and the sky-dive over Taipei ================= */
  function titlePos() { var tp = W.places.tpe.plazaW; return [tp[0], 66, tp[1] + 30]; }
  function titleScene() { W.setTime('title'); W.titleClouds.visible = true; var tp = titlePos(); pos.set(tp[0], tp[1], tp[2]); luna.root.position.copy(pos); setVehicle('walk', true); LUNA.setMode(luna, 'fall'); luna.root.rotation.set(0.35, -0.35, 0); fall = { phase: 'title', t: 0 }; AU.music('title'); }
  function startGame() { AU.init(); AU.music('title'); AU.fx('whoosh'); $('isTitle').classList.add('is-out'); setTimeout(function () { $('isTitle').hidden = true; $('isTitle').classList.remove('is-out'); }, 600);
    var lp = luna.root.position; fall = { phase: 'dive', t: 0, w0: performance.now(), y0: lp.y, x0: lp.x, z0: lp.z }; mode = 'dive'; AU.fx('wind'); }
  function updateFall(dt) {
    if (!fall) return; fall.t += dt; var L2 = luna, tp = titlePos(), land = W.places.tpe.plazaW, ly = W.places.tpe.y;
    if (fall.phase === 'title') { var tt = fall.t; L2.root.position.set(tp[0] + Math.sin(tt * 0.6) * 0.25, tp[1] + Math.sin(tt * 0.9) * 0.35, tp[2]); L2.root.rotation.set(0.5 + Math.sin(tt * 0.7) * 0.08, -0.4 + Math.sin(tt * 0.5) * 0.15, Math.sin(tt * 0.8) * 0.12);
      var w = root.clientWidth || 1000, h = root.clientHeight || 700, narrow = w / h < 1.0; if (narrow) { cam.position.set(tp[0], tp[1] + 1.9, tp[2] + 8.8); cam.lookAt(tp[0], tp[1] - 1.45, tp[2]); } else { var key = w + 'x' + h; if (fall.key !== key) { fall.key = key; var tin = document.querySelector('#isTitle .isle__tin'), cr = tin ? tin.getBoundingClientRect().right - root.getBoundingClientRect().left : w * 0.45; var ndc = Math.min(0.62, Math.max(0.22, cr / w)); fall.off = ndc * 6.2 * Math.tan(18 * Math.PI / 180) * (w / h) * 0.94; } cam.position.set(tp[0] - fall.off, tp[1] + 1.4, tp[2] + 6.2); cam.lookAt(tp[0] - fall.off, tp[1] + 0.45, tp[2]); }
      KIT.U.uFocus.value = 70; W.follow(tp[0], tp[2] - 20, cam.position); return; }
    if (fall.phase === 'dive') { var D3 = 3.4, u = Math.min(1, (performance.now() - fall.w0) / 1000 / D3), e = u * u; var y = fall.y0 + (ly + 1.0 - fall.y0) * e, x = fall.x0 + (land[0] - fall.x0) * u, z = fall.z0 + (land[1] - fall.z0) * (1 - Math.pow(1 - u, 2));
      L2.root.position.set(x, y, z); L2.root.rotation.set(0.5 + u * 0.9, -0.4 * (1 - u) + u * Math.PI * 2, 0);
      cam.position.set(x + 0.4, y + 4.5 + (1 - u) * 2, z + 7.5 - u * 1.5); cam.lookAt(x, y - 0.6, z); KIT.U.uFocus.value = 30; W.titleClouds.visible = u < 0.5;
      var hb = Math.max(0, Math.min(1, (y - 18) / 40)); blendTime(hb); W.follow(x, z, cam.position);
      if (u >= 1) { fall.phase = 'land'; fall.t = 0; L2.root.rotation.set(0, Math.PI, 0); pos.set(land[0], groundY(land[0], land[1]), land[1]); face = W.places.tpe.rot + Math.PI; L2.root.position.copy(pos); LUNA.setMode(L2, 'idle'); L2.jumpY = 0; L2.squash = 0.3; AU.fx('land'); puff(pos.x, pos.z); blendTime(0); CAM.yaw = W.places.tpe.rot; snapCam(); } return; }
    if (fall.phase === 'land') { if (!fall.w1) fall.w1 = performance.now(); if (performance.now() - fall.w1 > 600) { fall = null; mode = 'walk'; LUNA.setMode(L2, 'wave'); setTimeout(function () { if (luna.mode === 'wave') LUNA.setMode(luna, 'idle'); }, 1800); enterHud(); if (!P.intro) { setTimeout(function () { if (mode !== 'walk' || cardOn || talkQ) return; P.intro = 1; save(); talk(lunaName(), t('introLines'), true); }, 900); } else toast(t('welcomeBack')); } } }
  function lunaName() { return LANG === 'en' ? 'Luna' : 'ルナ'; }
  function blendTime(k) { if (k >= 1) { W.setTime('title'); return; } W.sky2(skyDate(), true); W.setTime(hourNow); if (k > 0) { var a = W.preset('title'), b = W.P || W.preset(hourNow), u = W.sky.material.uniforms; u.uTop.value.copy(b.top).lerp(a.top, k); u.uHz.value.copy(b.hz).lerp(a.hz, k); } }
  function enterIsland(how) { mode = 'walk'; fall = null; W.titleClouds.visible = false; var at = how === 'back' && cameFrom && DI[cameFrom] ? W.places[DI[cameFrom].st] : W.places.tpe, p = how === 'back' && at.dist ? at.dist : at.plazaW; pos.set(p[0], groundY(p[0], p[1] + 0.6), p[1] + 0.6); face = at.rot + Math.PI; CAM.yaw = at.rot; setView(CAM.view || 'classic', true);
    W.setTime(hourNow); LUNA.setMode(luna, 'wave'); setTimeout(function () { if (luna.mode === 'wave') LUNA.setMode(luna, 'idle'); }, 1500); enterHud(); AU.init(); AU.music('island', isNight()); snapCam(); if (how === 'back') toast(t('welcomeBack')); }
  function enterHud() { $('isHud').hidden = false; W.skyAt(pos.x, pos.z); W.sky2(skyDate(), true); AU.music('island', isNight()); W.setTime(hourNow); wxChip(); hud(); boardLabel(); labels(); placeLabel(true); }
  function homeAsk() { var C = card('<h2>' + esc(t('homeQ')) + '</h2><div class="isle__cact"><button type="button" class="isle__btn isle__btn--go" id="isHomeGo"><b>' + esc(t('homeGo')) + '</b></button><button type="button" class="isle__btn" data-x2><b>' + esc(t('cancel')) + '</b></button></div>'); $('isHomeGo').addEventListener('click', function () { cardClose(); toTitle(); }); C.querySelector('[data-x2]').addEventListener('click', cardClose); }
  /* end a journey under way at once, leaving the train, the ferry or the balloon where it belongs */
  function endTravel() { if (!travel) return; var T0 = travel; try { if (T0.kind === 'hsr' && T0.T) { scene.remove(T0.T.group); (W.trains || []).forEach(function (Tq) { Tq.group.visible = true; }); } if (T0.kind === 'ferry' && T0.F) { ferrySwap(T0); T0.F.position.set(T0.B.dock[0], 0, T0.B.dock[1]); T0.F.rotation.set(0, T0.B.dockRot, 0); T0.F.userData.busy = false; T0.F.userData.at = T0.to; W.ferries[T0.to] = T0.F; } if (T0.kind === 'balloon') { T0.bl.busy = false; W.Q.view = T0.view; W.fog.far = T0.fog; } if (T0.end) T0.end(); } catch (e) { if (window.console) console.error(e); } travel = null; mode = 'walk'; luna.root.visible = true; }
  function toTitle() { if (board) boardOff(true); if (fight) endFight(false, true);
    /* leave nothing open behind the title: the card, Luna's words, a journey under way */ cardClose.after = null; cardClose(); if (talkQ) { TW.after = null; talkEnd(); }
    endTravel();
    setVehicle('walk', true); fade(function () { $('isHud').hidden = true; mode = 'title'; labels(); $('isTitle').hidden = false; titleScene(); }); }
  function fade(mid, after) { var F2 = $('isFade'); F2.classList.add('is-on'); setTimeout(function () { try { mid && mid(); } catch (e) { if (window.console) console.error(e); } setTimeout(function () { F2.classList.remove('is-on'); if (after) setTimeout(after, 400); }, 120); }, 420); }


