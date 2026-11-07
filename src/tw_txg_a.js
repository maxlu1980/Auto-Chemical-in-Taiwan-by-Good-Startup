/* ===== [tw_txg_a.js] ===== */
/* ===== TXG3D — 高鐵台中站 (THSR Taichung) and the station district at Wuri, at true scale (v40) =====
   The second of the high-speed-rail cities built as a map of its own, on the Taipei engine (TPE3D: its signals, road network, traffic, scooters,
   trains, boards and sounds; the street play on top). One unit is 1.2 m; +x east, +z south. The station as it stands: elevated, the tracks
   running north–south, the shuttle-shaped roof (about 420 m long, 50 m wide, 30 m high) over two island platforms and six tracks — the two in
   the middle are through tracks without a platform; the platforms on 3F (1A/1B southbound, 2A/2B northbound), the concourse on 2F (tickets,
   machines, fare gates, shops, exits 1–4), the street level on 1F (exits 5–7, the transit plaza with the bus bays, the taxis, the drop-off and
   the parking). On the west, the railway's Xinwuri station (its hall on 2F across four tracks and two island platforms), joined to the
   concourse by a covered bridge; on the east, the metro's elevated terminus (Taichung MRT Green line, G17), reached by another bridge. Round
   them: 站區二路 east of the plaza, 高鐵一路 west of the railway, the new blocks of towers to the east, the old shophouses of Wuri to the west, a
   police station, AUTO CHEMICAL's training centre with its practice yard, and a bar on 站區二路 that only opens its neon at night.
   Original models throughout; real names appear only as place labels, no brand or logo is shown. Plan positions are approximate. */
var TXG3D = (function () {
  var V3 = THREE.Vector3, H = null, KT = null, K = null, M = null, MT = null, MX = null, XA = null;
  function init() { if (H) return; H = TPE3D.H; KT = H.kit(); K = H.K(); M = H.M(); MT = H.MT(); }
  function rnd(s) { return K.seeded(s); }
  function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  var FONT = '"Noto Sans TC","PingFang TC","Microsoft JhengHei","Heiti TC",' + (typeof KIT !== 'undefined' && KIT.FONT ? KIT.FONT : 'sans-serif');
  function bx(B, x0, x1, y0, y1, z0, z1, col) { H.bx(B, x0, x1, y0, y1, z0, z1, col); }
  function tbox(p, m, x0, x1, y0, y1, z0, z1, su, sv, cast) { return H.tbox(p, m, x0, x1, y0, y1, z0, z1, su, sv, cast); }
  function ubx(B, x0, x1, y0, y1, z0, z1, su, sv) { H.ubx(B, x0, x1, y0, y1, z0, z1, su, sv); }
  function flat(B, x0, x1, z0, z1, y, su, sv, down) { H.flat(B, x0, x1, z0, z1, y, su, sv, down); }
  function cylY(B, x, y0, y1, z, r, col, seg) { H.cylY(B, x, y0, y1, z, r, col, seg); }

  /* ---------------- the plan (local units) ---------------- */
  var SX = 21.5, SZ = 175, Y1 = 0.12, C2Y = 6.6, CC2 = 10.6, P3Y = 13.4, RAIL = 12.36;
  var CONC = [-21, 21, -52, 52], PAID = [-17, 17, -24, 8.5], LOB = [4, 21.2, 2, 40];
  var ESC1 = [8, 13, 12, 24]; /* lobby (1F) → concourse (2F): rising southward, foot at z 12 */
  var ESCP1 = [10.3, 14.7, -16, -4], ESCP2 = [-14.7, -10.3, -16, -4]; /* concourse → platforms: rising northward, foot at z −4 */
  var PL1 = [8.1, 16.9], PL2 = [-16.9, -8.1], PLZ = [-130, 130], TRK = { A1: 18.4, B1: 6.6, A2: -18.4, B2: -6.6, P1: 1.9, P2: -1.9 }; /* (v41) the tracks 1.5 from the platform edges: the car's widest half is 1.41, a hand's breadth of gap */
  /* the railway: four tracks, two island platforms, the hall over them on 2F */
  var TRAIL = 0.62, TPY = 1.5, TT = { T1: -37.5, T2: -46.3, T3: -52.1, T4: -60.9 }, TI1 = [-45.0, -38.8], TI2 = [-59.6, -53.4], TPZ = [-80, 110], TOZ = 10;
  var THALL = [-66, -28, 16, 44], TPAID = 35.5 /* (v70) half a metre north: 2.5 m clear before the head of the stairs down to the platforms */, TS1 = [-43.4, -40.4], TS2 = [-58.0, -55.0], TSZ = [38, 47], XWS = [-78, -66, 26, 34], BR1 = [-28, -21.5, 26, 34];
  /* the metro: the elevated terminus east of the plaza, its concourse on 2F, the island platform on 3F */
  var MBOX = [61, 81], MCON = [-50, -26], MPL = [67, 75], MPZ = [-84, -40], MTRK = { M1: 65.7, M2: 76.3 }, MRAIL = 12.45, MOZ = -62, MESC = [69.4, 72.6, -54, -42], MGS = [69, 73, -28, -14], MGATE = -36, BR3 = [21.5, 61, -34, -27];
  /* the drop-off deck along the east face (2F) and its ramp down to the plaza; exit 4's stair to the west lane */
  var DECK = [21.5, 33, -20, 70], DRAMP = [22, 33, 70, 130], EX4 = [-30, -23, -48, -36];
  /* the streets */ var R2 = [96, 112], RE = [196, 210], RW = [-98, -84], RN = [-150, -136], RM = [-6, 8], RS = [136, 150], MAPX = [-130, 250], MAPZ = [-250, 250];
  var INT = { J1: { x: R2, z: RN, legs: 'NSE' }, J2: { x: R2, z: RM, legs: 'NSE' }, J3: { x: R2, z: RS, legs: 'NSE' }, J4: { x: RE, z: RN, legs: 'NSWE' }, J5: { x: RE, z: RM, legs: 'NSWE' }, J6: { x: RE, z: RS, legs: 'NSWE' } };
  var BAR = [118, 150, 14, 40], BARIN = [118.6, 149.4, 14.6, 39.4], BARH = 5.0, BARDOOR = [24, 27.4], YARD = [118, 190, 56, 130], POL = [74, 90, -124, -108];

  /* the roof's shape: its half-width and its height at a point (the crown 25 units high in the middle, falling to 19 at the pointed ends) */
  var RZ = 176; function roofW(z) { var u = Math.min(1, Math.abs(z) / RZ); return 25.5 * Math.pow(Math.max(0, 1 - Math.pow(u, 2.4)), 0.42); }
  function roofY(x, z) { var u = Math.min(1, Math.abs(z) / RZ), c = Math.max(0, 1 - u * u), ya = 19.0 + 6.0 * c, d = 3.5 + 2.0 * c, w = Math.max(0.5, roofW(z)), k = Math.min(1.2, Math.abs(x) / w); return ya - d * k * k; }

  /* ---------------- generated textures ---------------- */
  function tset(key, w, h, dc, dh, nk, o) { return KT.texSet('txg_' + key, w, h, dc, dh, nk, o); }
  /* the roof's skin: standing-seam metal in long panels running down the slope, a soft sheen, the odd darker sheet */
  function roofT() { return tset('roof', 256, 256, function (g, w, h) { var r = rnd(4401); g.fillStyle = '#c9ced2'; g.fillRect(0, 0, w, h); for (var y = 0; y < 8; y++) { var t = r(); g.fillStyle = 'rgba(' + (200 + t * 30 | 0) + ',' + (206 + t * 28 | 0) + ',' + (212 + t * 26 | 0) + ',0.9)'; g.fillRect(0, y * 32 + 2, w, 28); g.fillStyle = 'rgba(90,96,102,0.55)'; g.fillRect(0, y * 32, w, 2); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, y * 32 + 2, w, 1); }
      KT.noise(g, w, h, 600, 0.05, '#5a6066', 0.5, 2, 4402); },
    function (g, w, h) { for (var y = 0; y < 8; y++) { g.fillStyle = '#ffffff'; g.fillRect(0, y * 32, w, 3); g.fillStyle = '#202020'; g.fillRect(0, y * 32 + 3, w, 1); } }, 1.6); }
  /* the soffit seen from the platforms: white perforated panels, the lines of lamps between them */
  function soffitT() { return tset('soff', 256, 256, function (g, w, h) { g.fillStyle = '#e9ebec'; g.fillRect(0, 0, w, h); for (var y = 0; y < 4; y++) { g.fillStyle = 'rgba(120,126,132,0.35)'; g.fillRect(0, y * 64, w, 3); } for (var x = 0; x < w; x += 6) for (var yy = 0; yy < h; yy += 6) { g.fillStyle = 'rgba(80,86,92,0.18)'; g.fillRect(x + 2, yy + 2, 2, 2); } },
    function (g, w, h) { for (var y = 0; y < 4; y++) { g.fillStyle = '#000'; g.fillRect(0, y * 64, w, 3); } }, 0.6); }
  /* the platforms' floor: light granite tiles, the joints, a polished sheen */
  function platT() { return tset('plat', 256, 256, function (g, w, h) { var r = rnd(4411); for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) { var t = r(); g.fillStyle = 'rgb(' + (198 + t * 14 | 0) + ',' + (196 + t * 12 | 0) + ',' + (188 + t * 12 | 0) + ')'; g.fillRect(x * 64, y * 64, 64, 64); } KT.noise(g, w, h, 4000, 0.12, '#6a665e', 0.4, 1.2, 4412); KT.noise(g, w, h, 1500, 0.12, '#ffffff', 0.4, 1.0, 4413);
      g.strokeStyle = 'rgba(70,66,60,0.5)'; g.lineWidth = 2; for (var i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } },
    function (g, w, h) { g.strokeStyle = '#303030'; g.lineWidth = 3; for (var i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, 0.7); }
  /* the bar's floor: dark polished concrete with a faint grid of light lines */
  function barFloorT() { return tset('barf', 256, 256, function (g, w, h) { g.fillStyle = '#14161c'; g.fillRect(0, 0, w, h); KT.noise(g, w, h, 3000, 0.1, '#3a3e48', 0.4, 1.4, 4421); g.strokeStyle = 'rgba(60,220,230,0.22)'; g.lineWidth = 2; for (var i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, null, 0, {}); }

  /* ---------------- the district's own sign atlas (2048 × 1024) ---------------- */
  function atlas() { if (XA) return XA; init(); var c = cv(2048, 1024), g = c.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 2048, 1024); XA = { c: c, g: g, cells: {} };
    function cell(k, x, y, w, h) { XA.cells[k] = [x, y, w, h]; } g.textAlign = 'center'; g.textBaseline = 'middle';
    function txt(s, x, y, size, col, wt) { g.fillStyle = col; g.font = (wt || 800) + ' ' + size + 'px ' + FONT; g.fillText(s, x, y); }
    /* the station's name (1024 × 128 at 0,0): white on the roof's grey band */ g.fillStyle = '#f4f6f7'; g.fillRect(0, 0, 1024, 128); g.fillStyle = '#e8762a'; g.fillRect(0, 112, 1024, 16); txt('台 灣 高 鐵　台 中 站', 512, 50, 70, '#2a2e34', 900); txt('THSR  TAICHUNG  STATION', 512, 96, 24, '#4a525a', 700); cell('name', 0, 0, 1024, 128);
    /* the railway's and the metro's names (512 × 128) */ g.fillStyle = '#1f4f9a'; g.fillRect(1024, 0, 512, 128); txt('臺鐵 新烏日車站', 1280, 48, 50, '#ffffff', 900); txt('TRA  XINWURI  STATION', 1280, 98, 22, '#d8e4f4', 700); cell('tra', 1024, 0, 512, 128);
    g.fillStyle = '#ffffff'; g.fillRect(1536, 0, 512, 128); g.fillStyle = '#1aa058'; g.fillRect(1536, 0, 512, 14); g.fillRect(1556, 30, 72, 72); txt('G17', 1592, 66, 30, '#ffffff', 900); txt('高鐵臺中站', 1820, 50, 46, '#1a3a2a', 900); txt('Taichung MRT · HSR Taichung Station', 1820, 98, 18, '#2a4a3a', 700); cell('mrt', 1536, 0, 512, 128);
    /* the exits (256 × 128 each, y 128): yellow on charcoal, the number big */ var EX = [['1', '臺鐵 新烏日', 'TRA Xinwuri'], ['2', '汽車送客區', 'Drop-off'], ['3', '臺中捷運', 'Metro (MRT)'], ['4', '西側通道', 'West lane'], ['5', '公車 轉運站', 'Buses'], ['6', '計程車', 'Taxis'], ['7', '停車場', 'Parking']];
    EX.forEach(function (s, i) { var x = i * 256, y = 128; g.fillStyle = '#1e2226'; g.fillRect(x, y, 256, 128); g.fillStyle = '#f2c21a'; g.fillRect(x + 10, y + 14, 84, 100); txt(s[0], x + 52, y + 66, 76, '#1e2226', 900); g.textAlign = 'left'; g.fillStyle = '#ffffff';
      var t1 = '出口 ' + s[1], fs = 26; g.font = '800 ' + fs + 'px ' + FONT; while (g.measureText(t1).width > 146 && fs > 12) { fs--; g.font = '800 ' + fs + 'px ' + FONT; } g.fillText(t1, x + 104, y + 46); var t2 = 'Exit ' + s[0] + ' · ' + s[2], f2 = 16; g.font = '600 ' + f2 + 'px ' + FONT; while (g.measureText(t2).width > 146 && f2 > 9) { f2--; g.font = '600 ' + f2 + 'px ' + FONT; } g.fillStyle = '#c8d0d8'; g.fillText(t2, x + 104, y + 90); g.textAlign = 'center'; cell('ex' + s[0], x, y, 256, 128); });
    /* the high-speed rail's signs, orange edge on charcoal (512 × 128, y 256..512) */ var HS = [['高鐵 售票', 'THSR Tickets'], ['驗票閘門', 'Fare Gates'], ['1A 1B 南下 往 彰化・嘉義・台南・左營', 'Southbound'], ['2A 2B 北上 往 新竹・桃園・台北・南港', 'Northbound'], ['往 月台 ↑', 'To the platforms'], ['臺鐵 TRA  ←  出口 1', 'To Xinwuri Station'], ['捷運 MRT  →  出口 3', 'To the metro'], ['服務台', 'Information']];
    HS.forEach(function (s, i) { var x = (i % 4) * 512, y = 256 + Math.floor(i / 4) * 128, tra = i === 5, mrt = i === 6; g.fillStyle = '#1f2326'; g.fillRect(x, y, 512, 128); g.fillStyle = tra ? '#2a5aa8' : mrt ? '#1aa058' : '#f07a1a'; g.fillRect(x, y, 512, 10); g.fillRect(x + 14, y + 26, 10, 76); g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = '800 ' + (s[0].length > 10 ? 30 : 46) + 'px ' + FONT; g.fillText(s[0], x + 40, y + 52); g.fillStyle = '#c8ced4'; g.font = '600 24px ' + FONT; g.fillText(s[1], x + 40, y + 100); g.textAlign = 'center'; cell('hs' + i, x, y, 512, 128); });
    /* street plates (256 × 64, y 512) */ [['站區二路', 'Zhanqu 2nd Rd.'], ['高鐵一路', 'Gaotie 1st Rd.']].forEach(function (s, i) { var x = i * 256, y = 512; g.fillStyle = '#0f6a3a'; g.fillRect(x, y, 256, 64); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(x + 4, y + 4, 248, 56); txt(s[0], x + 128, y + 24, 26, '#ffffff', 800); txt(s[1], x + 128, y + 48, 14, '#ffffff', 600); cell('sn' + i, x, y, 256, 64); });
    /* the police station, the transit plaza's signs (256 × 64, y 512) */ var PS = [['派 出 所', 'POLICE', '#123a7a'], ['公車 轉運站', 'BUS TERMINAL', '#c8501a'], ['計 程 車', 'TAXI', '#e8b818'], ['P 停車場', 'PARKING', '#1a4a9a'], ['機車停車場', 'SCOOTERS', '#2a6a4a'], ['汽車送客區', 'DROP-OFF', '#3a3e46']];
    PS.forEach(function (s, i) { var x = 512 + i * 256, y = 512; if (x >= 2048) { x = (i - 6) * 256; } g.fillStyle = s[2]; g.fillRect(x, y, 256, 64); txt(s[0], x + 128, y + 26, 28, i === 2 ? '#1a1a1a' : '#ffffff', 900); txt(s[1], x + 128, y + 52, 13, i === 2 ? '#1a1a1a' : '#ffffff', 700); cell('ps' + i, x, y, 256, 64); });
    /* the concourse's shops (512 × 96, y 576) */ var SH = [['便利商店 24H', '#1a7a4a'], ['太陽餅 · 伴手禮', '#c8701a'], ['咖啡 CAFÉ', '#4a3022'], ['麵包坊 BAKERY', '#a8481a'], ['書報 BOOKS', '#2a4a8a'], ['台中便當', '#b8301a'], ['手搖飲 TEA', '#d8406a'], ['藥妝 DRUGS', '#1a8aa8']];
    SH.forEach(function (s, i) { var x = (i % 4) * 512, y = 576 + Math.floor(i / 4) * 96; g.fillStyle = s[1]; g.fillRect(x, y, 512, 96); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x, y + 78, 512, 18); txt(s[0], x + 256, y + 42, 48, '#ffffff', 900); txt('營業中 · 歡迎光臨', x + 256, y + 87, 14, '#ffe680', 700); cell('sh' + i, x, y, 512, 96); });
    /* AUTO CHEMICAL's training centre (1024 × 128, y 768) */ g.fillStyle = '#ef7a1d'; g.fillRect(0, 768, 1024, 128); g.fillStyle = '#1b1d22'; g.fillRect(0, 768 + 100, 1024, 28); txt('AUTO CHEMICAL  中部教育訓練中心', 512, 768 + 50, 56, '#ffffff', 900); txt('建築化學材料 · 施工實習 · TAICHUNG TRAINING CENTRE', 512, 768 + 114, 18, '#f2c94c', 700); cell('auto', 0, 768, 1024, 128);
    /* the bar's sign (1024 × 128, y 896): an original word-mark in two lines of neon tube, magenta and cyan, on black */ g.fillStyle = '#05060a'; g.fillRect(1024, 768, 1024, 256); g.save(); g.shadowColor = '#ff3aa8'; g.shadowBlur = 26; g.strokeStyle = '#ff6ac0'; g.lineWidth = 5; g.font = 'italic 900 112px ' + FONT; g.strokeText('NO AFTERLIFE', 1536, 768 + 92); g.fillStyle = '#ffd0ec'; g.font = 'italic 900 112px ' + FONT; g.globalAlpha = 0.85; g.fillText('NO AFTERLIFE', 1536, 768 + 92); g.globalAlpha = 1; g.shadowColor = '#3af0ff'; g.strokeStyle = '#3af0ff'; g.lineWidth = 6; g.beginPath(); g.moveTo(1104, 768 + 150); g.lineTo(1968, 768 + 150); g.stroke(); g.fillStyle = '#c8fbff'; g.font = '800 54px ' + FONT; g.fillText('無 來 生 · B A R · 站區二路', 1536, 768 + 204); g.restore(); cell('bar', 1024, 768, 1024, 256);
    XA.tex = KT.toTex(c); XA.tex.wrapS = XA.tex.wrapT = THREE.ClampToEdgeWrapping; XA.tex.anisotropy = 8; return XA; }
  function xUV(key) { var A = atlas(), c = A.cells[key]; return { u0: c[0] / 2048, u1: (c[0] + c[2]) / 2048, v0: 1 - (c[1] + c[3]) / 1024, v1: 1 - c[1] / 1024 }; }
  function xsign(B, key, w, h, x, y, z, ry) { B.add(new THREE.PlaneGeometry(w, h), { p: [x, y, z], r: [0, ry || 0, 0] }, 0xffffff, { uvRect: xUV(key) }); }

  /* ---------------- materials ---------------- */
  function mats() { if (MX) return MX; init(); var LL = function (m) { return K.llights ? K.llights(m) : m; }, C = function (m) { return LL(K.curved(m)); }, S = function (m) { return LL(K.see(K.curved(m))); };
    var rf = roofT(), sf = soffitT(), pl = platT(), bf = barFloorT(), A = atlas();
    MX = { roof: C(new THREE.MeshStandardMaterial({ map: rf.map, normalMap: rf.normalMap, metalness: 0.55, roughness: 0.32, envMapIntensity: 1.2, emissive: 0x24304e, emissiveIntensity: 0 })),
      soff: C(new THREE.MeshStandardMaterial({ map: sf.map, normalMap: sf.normalMap, metalness: 0.05, roughness: 0.6, envMapIntensity: 0.6, side: THREE.BackSide, emissive: 0xdfe8ff, emissiveMap: sf.map, emissiveIntensity: 0 })),
      plat: C(new THREE.MeshStandardMaterial({ map: pl.map, normalMap: pl.normalMap, roughness: 0.35, envMapIntensity: 0.9 })),
      barf: C(new THREE.MeshStandardMaterial({ map: bf.map, roughness: 0.25, metalness: 0.1, envMapIntensity: 1.2 })),
      sign: C(new THREE.MeshStandardMaterial({ map: A.tex, emissive: 0xffffff, emissiveMap: A.tex, emissiveIntensity: 0.3, roughness: 0.5, envMapIntensity: 0.5 })),
      neon: C(new THREE.MeshBasicMaterial({ map: A.tex, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })),
      curtN: S(new THREE.MeshStandardMaterial({ map: M.curtain.map, normalMap: M.curtain.normalMap, metalness: 0.55, roughness: 0.12, envMapIntensity: 1.6, emissive: 0xffe2b8, emissiveMap: M.curtain.map, emissiveIntensity: 0 })),
      night: K.curved(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: false })),
      skyl: C(new THREE.MeshStandardMaterial({ color: 0xdfeef6, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.4, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide })) };
    return MX; }

  /* ---------------- trains of the railway and the metro (original designs) ----------------
     A boxy electric multiple unit along local −z from its nose at z 0 (as the high-speed trains are built): the body, the window band, the
     livery's stripes, doors (shut: panels; open: dark gaps), the lit inside, the cab's windscreen and lamps, bogies, pantographs. */
  function emu(n, o) { init(); var root = new THREE.Group(), BW = K.Batch(), BK = K.Batch(), BS = K.Batch(), BD = K.Batch(), BE = K.Batch(), BDR = K.Batch(), BOP = K.Batch(), BG = K.Batch(), z = 0, cars = [], i, CL = o.carL, W = o.w, Hh = o.h;
    for (i = 0; i < n; i++) { var zc = z - CL / 2, front = i === 0, rear = i === n - 1; cars.push(zc);
      BW.add(K.rbox(W, Hh - 0.45, CL - 0.3, 0.32, 3), { p: [0, 0.45 + (Hh - 0.45) / 2 + 0.25, zc] }, o.body);
      [-1, 1].forEach(function (s) { BK.add(K.box(0.02, o.winH, CL - 1.6), { p: [s * (W / 2 + 0.006), o.winY, zc] }, 0x15191d); BS.add(K.box(0.02, o.stH, CL - 0.6), { p: [s * (W / 2 + 0.008), o.stY, zc] }, o.stripe); if (o.stripe2 != null) BS.add(K.box(0.02, o.stH * 0.5, CL - 0.6), { p: [s * (W / 2 + 0.008), o.stY - o.stH * 0.9, zc] }, o.stripe2);
        for (var d = 0; d < o.doors; d++) { var dz = zc - CL / 2 + CL * (d + 0.5) / o.doors; BDR.add(K.box(0.03, 1.75, 1.15), { p: [s * (W / 2 + 0.012), 0.45 + 0.25 + 0.9, dz] }, o.door); BOP.add(K.box(0.035, 1.72, 1.1), { p: [s * (W / 2 + 0.014), 0.45 + 0.25 + 0.88, dz] }, 0x0a0c0e); } });
      BE.add(K.box(W - 0.3, 0.05, CL - 1.2), { p: [0, Hh - 0.15, zc] }, 0xf4f8ff);
      [zc - CL / 2 + 2.2, zc + CL / 2 - 2.2].forEach(function (bz) { BD.add(K.box(W - 0.5, 0.5, 2.4), { p: [0, 0.42, bz] }, 0x2a2c2e); [-0.75, 0.75].forEach(function (wz) { [-1, 1].forEach(function (s) { BD.add(K.cyl(0.36, 0.36, 0.12, 10), { p: [s * (W / 2 - 0.42), 0.36, bz + wz], r: [0, 0, Math.PI / 2] }, 0x1a1a1a); }); }); });
      if (o.panto && i % 2 === 1) { KT.cylAB(BD, [0, Hh + 0.3, zc - 1], [0, Hh + 1.0, zc + 0.4], 0.035, 0x2a2e32, 6); BD.add(K.box(1.3, 0.04, 0.1), { p: [0, Hh + 1.04, zc + 0.4] }, 0x2a2e32); BD.add(K.box(1.2, 0.18, 2.2), { p: [0, Hh + 0.32, zc] }, 0x6a6e72); }
      if (front || rear) { var s2 = front ? 1 : -1, ez = zc + s2 * (CL / 2 - 0.2); BG.add(K.box(W - 0.5, 0.95, 0.06), { p: [0, Hh - 0.75, ez + s2 * 0.02] }, 0xffffff); BK.add(K.box(W - 0.2, 0.5, 0.05), { p: [0, o.stY, ez + s2 * 0.03] }, o.stripe); [-1, 1].forEach(function (sx) { BE.add(K.box(0.36, 0.16, 0.05), { p: [sx * (W / 2 - 0.45), 1.15, ez + s2 * 0.04] }, front ? 0xf6f8ff : 0xff2a1a); }); }
      z -= CL; }
    [[BW, M.gloss], [BK, M.gloss], [BS, M.gloss], [BD, M.dark], [BG, M.glass], [BE, M.glow]].forEach(function (q) { if (q[0].count()) { var m = q[0].mesh(q[1], { cast: false, recv: true }); if (q[1] === M.glass) m.renderOrder = 2; root.add(m); } });
    var doors = BDR.mesh(M.paint, { cast: false, recv: true }), opn = BOP.mesh(M.dark, { cast: false, recv: false }); opn.visible = false; root.add(doors); root.add(opn);
    return { root: root, len: -z, n: n, cars: cars, doors: doors, opn: opn }; }
  /* the railway's commuter train: stainless, a blue window band, a yellow stripe (eight cars of 20 m) */
  function traTrain(n) { return emu(n, { carL: 16.7, w: 2.36, h: 3.2, body: 0xd8dcdf, stripe: 0xf2c21a, stripe2: 0x1f4f9a, stY: 1.2, stH: 0.16, winY: 2.05, winH: 0.7, doors: 3, door: 0xc8ccd0, panto: true }); }
  /* the metro's two-car train: white, a green band */ function mrtTrain() { return emu(2, { carL: 18.4, w: 2.4, h: 3.15, body: 0xf4f6f6, stripe: 0x1aa058, stripe2: 0x9ad83a, stY: 1.3, stH: 0.22, winY: 2.05, winH: 0.72, doors: 4, door: 0xe8eaea, panto: false }); }


