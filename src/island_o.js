/* ===== [island_o.js] ===== */
  /* ================= (v38) the city's people, the chase's balance, phones, the language chip, the district's name =================
     The people of every street wear a near-future look of our own (dark techwear, neon hair, glowing implants and trims) — original
     designs in a general cyberpunk vein. The police no longer outrun her, and while she is wanted a hand on her shoulder is not an
     arrest: only when she is stunned (a net, a dart, a stagger) can they take her — so a long spree runs on to its rampage.
     Phones: people far off lose their ink lines and their shadows, the farthest are not drawn; pools and props are thinner. */
  var MOB = !!(COARSE && Math.min(screen.width, screen.height) < 720);
  var _dxLowO = dxLow; dxLow = function () { return MOB || _dxLowO(); };

  /* ---------- the people: a look of our own in a cyberpunk vein, and a cheap way to draw a crowd ---------- */
  var CYB = { list: [], t: 0, mat: null, chrome: null };
  var CYN = [0x2ae8ff, 0xff2a8a, 0xb8ff2a, 0xffb02a, 0x9a6aff, 0xff4a4a, 0x2affb8];
  function cybMats() { if (!CYB.mat) { CYB.mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }); CYB.chrome = KIT.curved(new THREE.MeshStandardMaterial({ color: 0x9aa4ae, metalness: 0.85, roughness: 0.28 })); } return CYB; }
  function cybOpt(opt) { var o = Object.assign({}, opt || {}), r = dxRnd(((o.seed || 7) * 2654435761) >>> 0), P = Object.assign({}, o.pal || {});
    var cop = o.vest === 0xc4dc3a || (o.hatKind === 'cap' && (o.hat === 0x1c2a4a)) || o.dxCop; o.cyb = { cop: cop, r: r, neon: CYN[Math.floor(r() * CYN.length)], neon2: CYN[Math.floor(r() * CYN.length)] };
    if (cop || o.dxKeep) return o;
    if (r() < 0.8) { P.suit = [0x15171e, 0x1e1a28, 0x101c24, 0x24161a, 0x1a2420, 0x2a2a30, 0xd8d6d0, 0x3a2a1a, 0x2a1030][Math.floor(r() * 9)]; P.pants = [0x101216, 0x1a1a20, 0x22252c, 0x2a2026][Math.floor(r() * 4)]; P.boot = 0x121214; }
    if (r() < 0.55) P.hair = [0xf2f2f2, 0xff3a9a, 0x3ae8ff, 0xa8ff3a, 0x9a6aff, 0xff7a2a, 0xe8d24a][Math.floor(r() * 7)];
    if (!o.vest && !o.apron && r() < 0.45) o.vest = [0x2a2c32, 0x3a3e46, 0x1a1c22, 0x4a2a3a][Math.floor(r() * 4)];
    o.pal = P; return o; }
  function cybAdd(A, o) { var C = o.cyb; if (!C) return; var M = cybMats(), r = C.r, R = 0.108, n1 = C.neon, n2 = C.neon2, W1 = { uvRect: null };
    function batch(par, fn) { var B = KIT.Batch(); fn(function (geo, p, rot, col) { B.add(geo, dxMx(p, rot), col); }); if (!B.count()) return null; var m = B.mesh(M.mat, { cast: false, recv: false }); m.userData.cyb = true; par.add(m); return m; }
    /* the head: a visor, an ear implant and jaw line, a neon crest, or circuit lines on the brow (a cap band for an officer) */
    var hk = C.cop ? 9 : Math.floor(r() * 5); A.cybH = batch(A.head, function (add) {
      if (hk === 0) { add(new THREE.TorusGeometry(R * 1.02, 0.011, 5, 20, Math.PI * 0.62), [0, -0.012, 0], [0, 0, Math.PI * 0.19 + Math.PI], n1); add(new THREE.BoxGeometry(0.17, 0.03, 0.03), [0, -0.012, R * 0.96], null, n1); }
      else if (hk === 1) { [-1, 1].forEach(function (s) { add(new THREE.BoxGeometry(0.018, 0.04, 0.03), [s * R * 1.0, -0.015, 0.005], null, n1); }); add(new THREE.BoxGeometry(0.008, 0.008, 0.06), [R * 0.86, -0.06, 0.05], [0, 0.6, 0.3], n1); }
      else if (hk === 2) { add(new THREE.BoxGeometry(0.026, 0.05, R * 2.0), [0, R * 1.0, -0.005], null, n1); add(new THREE.BoxGeometry(0.03, 0.012, R * 2.05), [0, R * 1.04, -0.005], null, n2); }
      else if (hk === 3) { add(new THREE.BoxGeometry(0.06, 0.004, 0.004), [0, R * 0.55, R * 0.86], [-0.5, 0, 0], n1); add(new THREE.BoxGeometry(0.004, 0.03, 0.004), [0.03, R * 0.6, R * 0.82], [-0.5, 0, 0], n1); add(new THREE.BoxGeometry(0.004, 0.03, 0.004), [-0.024, R * 0.6, R * 0.82], [-0.5, 0, 0], n2); }
      else if (hk === 4) { add(new THREE.BoxGeometry(0.15, 0.045, 0.02), [0, -0.06, R * 0.9], null, 0x14161a); [-0.04, 0, 0.04].forEach(function (x) { add(new THREE.BoxGeometry(0.02, 0.006, 0.006), [x, -0.06, R * 0.9 + 0.012], null, n1); }); }
      else { add(new THREE.TorusGeometry(R * 1.12, 0.008, 4, 28), [0, 0.035, 0], [Math.PI / 2, 0, 0], 0x2ae8ff); } });
    /* the body: neon trims down the jacket and round the collar, a row of lights down the spine, or a chest lamp for an officer */
    var bk = C.cop ? 9 : Math.floor(r() * 3); A.cybB = batch(A.torso, function (add) {
      if (bk === 0) { [-1, 1].forEach(function (s) { add(new THREE.BoxGeometry(0.008, 0.26, 0.008), [s * 0.05, 0.2, 0.074], [0.12, 0, 0], n1); }); add(new THREE.TorusGeometry(0.062, 0.006, 4, 18), [0, 0.39, 0.005], [Math.PI / 2 - 0.2, 0, 0], n2); }
      else if (bk === 1) { for (var i = 0; i < 5; i++) add(new THREE.BoxGeometry(0.02, 0.012, 0.01), [0, 0.08 + i * 0.06, -0.072], null, n1); add(new THREE.BoxGeometry(0.12, 0.006, 0.006), [0, 0.32, 0.076], null, n2); }
      else if (bk === 2) { add(new THREE.BoxGeometry(0.2, 0.008, 0.008), [0, 0.16, 0.08], null, n1); add(new THREE.BoxGeometry(0.008, 0.12, 0.008), [-0.06, 0.24, 0.078], null, n1); }
      else { add(new THREE.BoxGeometry(0.03, 0.02, 0.01), [0.05, 0.3, 0.08], null, 0x2ae8ff); add(new THREE.BoxGeometry(0.012, 0.3, 0.008), [-0.088, 0.2, 0.0], [0, 0, 0.05], 0x2ae8ff); } });
    /* a chrome forearm with a light down it (one in four) */ if (!C.cop && r() < 0.25) { var arm = r() < 0.5 ? A.armR : A.armL, cm = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.03, 0.115, 10), M.chrome); cm.position.y = -0.058; cm.castShadow = false; arm.el.add(cm); var ln = batch(arm.el, function (add) { add(new THREE.BoxGeometry(0.006, 0.1, 0.006), [0, -0.058, 0.033], null, n1); }); A.cybA = cm; }
    CYB.list.push(A); }
  /* (v60) the near-future restyle is off: everyone keeps the look they were given (the police their cap band); ISLE_CYB brings it back */
  function cybOptLite(opt) { var o = Object.assign({}, opt || {}), r = dxRnd(((o.seed || 7) * 2654435761) >>> 0), cop = o.vest === 0xc4dc3a || (o.hatKind === 'cap' && (o.hat === 0x1c2a4a)) || o.dxCop; o.cyb = { cop: cop, r: r, neon: CYN[0], neon2: CYN[1], lite: true }; return o; }
  var _buildO = LUNA.build; LUNA.build = function (kind, opt) { if (kind !== 'person' && kind !== 'worker') return _buildO(kind, opt); var o = window.ISLE_CYB ? cybOpt(opt) : cybOptLite(opt); var A = _buildO(kind, o); try { if (!o.cyb.lite || o.cyb.cop) cybAdd(A, o); } catch (e) {} if (A && !A.inks) { A.inks = []; A.main = []; A.root.traverse(function (m) { if (!m.isMesh) return; if (m.userData.ink) A.inks.push(m); else if (!m.userData.cyb) A.main.push(m); }); } if (MOB) A.main.forEach(function (m) { m.castShadow = false; }); return A; };
  /* level of detail by distance from the camera: ink lines near, shadows nearer still (none on a phone), nobody drawn far away */
  function cybLod(dt) { CYB.t -= dt; if (CYB.t > 0) return; CYB.t = 0.25; var cx = cam.position.x, cy = cam.position.y, cz = cam.position.z, inkD = MOB ? 8 : 14, shD = MOB ? 0 : 12, farD = MOB ? 42 : 72, glowD = MOB ? 30 : 50;
    CYB.list = CYB.list.filter(function (A) { var R = A.root; if (!R.parent) return false; if (!R.visible) return true; var e = R.matrixWorld.elements, d = Math.hypot(e[12] - cx, e[13] - cy, e[14] - cz), ink = d < inkD, sh = d < shD, far = d > farD;
      if (A.lodInk !== ink) { A.lodInk = ink; A.inks.forEach(function (m) { m.visible = ink; }); } if (A.lodSh !== sh) { A.lodSh = sh; A.main.forEach(function (m) { m.castShadow = sh; }); } if (A.lodFar !== far) { A.lodFar = far; A.body.visible = !far; } var gl = d < glowD; if (A.lodGl !== gl) { A.lodGl = gl; if (A.cybH) A.cybH.visible = gl; if (A.cybB) A.cybB.visible = gl; } return true; }); }

  /* ---------- the chase: she outruns them, and they take her only when she is down ---------- */
  var _inputVecO = inputVec; inputVec = function () { var I = _inputVecO(); if (gsOn() && GS.built && !GS.car && typeof stick !== 'undefined' && stick && stick.on) { var m = Math.hypot(I.x, I.z); if (m > (GS.wanted ? 0.42 : 0.62)) I.run = true; } else if (gsOn() && GS.built && GS.wanted && I.m > 0.3) I.run = true; return I; };
  var _copTickO = copTick; copTick = function (n, dt) { return _copTickO(n, n.heavy ? dt : dt * 0.86); };
  var _arrestStartO = arrestStart; arrestStart = function (n) { if (GS.arrest) return; if (GS.car) return _arrestStartO(n); var down = (GS.stun > 0 || !!DXO.netOn || luna.mode === 'hurt') && !(DXO.post > 0); if (DXO.bz || DXO.post > 0 || (!down && (GS.wanted >= 2 || Math.hypot(vel.x, vel.z) > 1.2))) { /* she twists free and the officer staggers back */ var me = nL(n), Lu = gL(), dx = me[0] - Lu[0], dz = me[2] - Lu[2], d = Math.hypot(dx, dz) || 1, R = n.A.root, nx = R.position.x + dx / d * 0.9, nz = R.position.z + dz / d * 0.9; if (gWalk(nx, nz, gGround(nx, nz, R.position.y))) { R.position.x = nx; R.position.z = nz; } LUNA.setMode(n.A, 'stagger'); setTimeout(function () { if (n.A.mode === 'stagger' && !n.ko) LUNA.setMode(n.A, 'idle'); }, 700); n.grab = -2.6; AU.fx('swish'); var now = performance.now(); if (GS.wanted >= 3 && !(now - (DXO.shT || 0) < 2500)) { DXO.shT = now; DXO.v = Math.min(100, DXO.v + 2); } return; } return _arrestStartO(n); };
  /* every offence heats her a little: a long spree ends in a rampage */
  var HEAT = { assault: 3, vandal: 3, wreck: 5, cop: 4, brawl: 3, carjack: 4, hitped: 4, crash: 2, signal: 1 };
  var _crimeO = crime; crime = function (kind) { var r = _crimeO(kind); if (!DXO.bz && HEAT[kind]) { DXO.v = Math.min(100, DXO.v + HEAT[kind]); DXO.idle = Math.min(DXO.idle, 1.5); } return r; };

  /* ---------- the language, always one tap away (a small chip at the start of the top-left row) ---------- */
  function langChip() { var tl = root && root.querySelector('.isle__tl'); if (!tl) return; var pl = $('isPlace'); if (pl && pl.parentNode) pl.parentNode.classList.add('isle__chip--place'); var b = $('isLangQ'); if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = 'isLangQ'; b.className = 'isle__chip isle__chip--lang'; b.setAttribute('aria-haspopup', 'true'); tl.insertBefore(b, tl.firstChild); b.addEventListener('click', function (e) { e.stopPropagation(); langMenu(b); }); }
    var L = String(typeof LANG === 'string' ? LANG : 'zh').slice(0, 2), lbl = { zh: '中', en: 'EN', ja: '日' }[L] || 'EN'; if (b.textContent !== lbl) { b.textContent = lbl; b.setAttribute('aria-label', { zh: '語言', en: 'Language', ja: '言語' }[L] || 'Language'); } }
  function langMenu(b) { var m = $('isLangM'); if (m) { m.remove(); return; } m = document.createElement('div'); m.id = 'isLangM'; m.className = 'isle__langm'; m.setAttribute('role', 'menu'); var L = String(typeof LANG === 'string' ? LANG : 'zh').slice(0, 2);
    m.innerHTML = [['zh', '繁體中文'], ['en', 'English'], ['ja', '日本語']].map(function (q) { return '<button type="button" role="menuitemradio" aria-checked="' + (L === q[0]) + '" data-l="' + q[0] + '">' + q[1] + '</button>'; }).join(''); var r0 = root.getBoundingClientRect(), rb = b.getBoundingClientRect(); m.style.left = Math.round(rb.left - r0.left) + 'px'; m.style.top = Math.round(rb.bottom - r0.top + 6) + 'px'; root.appendChild(m);
    [].forEach.call(m.querySelectorAll('[data-l]'), function (x) { x.addEventListener('click', function (e) { e.stopPropagation(); m.remove(); chooseLang(x.getAttribute('data-l')); langChip(); }); }); setTimeout(function () { document.addEventListener('pointerdown', function off(e) { if (!m.contains(e.target) && e.target !== b) { m.remove(); document.removeEventListener('pointerdown', off, true); } }, true); }, 0); }
  var _labelsO = labels; labels = function () { var r = _labelsO.apply(this, arguments); try { langChip(); } catch (e) {} return r; };

  /* ---------- each frame (the title's street too) ---------- */
  var _lightsTickO = lightsTick; lightsTick = function (dt) { _lightsTickO(dt); try { cybLod(dt); } catch (e) {} hudT2 -= dt; if (hudT2 <= 0) { hudT2 = 0.8; try { hudFit(); langChip(); } catch (e) {} } }; var hudT2 = 0;

  /* ---------- the district's name: an original one for this near-future Tokyo (新東都 · Neo-Tōto) ---------- */
  (function () { function re(s) { return typeof s === 'string' ? s.replace(/^東京 · /, '新東都 · ').replace(/^東京・/, '新東都・').replace(/^Tokyo · /, 'Neo-Tōto · ') : s; }
    ['ueno', 'okachi', 'tkarea'].forEach(function (k) { var q = LN[k]; if (q) { q.zh = re(q.zh); q.en = re(q.en); q.ja = re(q.ja); } });
    ['zh', 'en', 'ja'].forEach(function (lg) { var tt = T[lg]; if (tt && typeof tt.sub === 'string') tt.sub = tt.sub.replace(/^東京・/, '新東都・').replace(/^Tokyo, /, 'Neo-Tōto, '); });
    ['zh', 'en', 'ja'].forEach(function (lg) { var a = TXH[lg]; if (a && a.tokyo) a.tokyo = { zh: '新東都', en: 'Neo-Tōto', ja: '新東都' }[lg]; var b = TKWX[lg]; if (b && b.place) b.place = re(b.place); }); })();


