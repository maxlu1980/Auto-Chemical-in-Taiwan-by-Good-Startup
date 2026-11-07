/* ===== [tw_hsr_a.js] ===== */
/* ===== HSR3D — the elevated high-speed stations of the south, built from one plan (v45): 高鐵台南站 (沙崙) and 高鐵左營站 (高雄) =====
   The third and fourth of the high-speed-rail cities built as maps of their own, on the Taipei engine (TPE3D) with Taichung's pieces (TXG3D:
   its trains, its roof and platform textures). One unit is 1.2 m; +x east, +z south. Both stations are of the same family — the tracks on a
   viaduct running north–south, the platforms on 2F under one roof, the concourse on the ground under the tracks (tickets, machines, the fare
   gates, shops, the exits), the forecourt with its bus bays, taxis and parking on the east — and each has its own roof and its own district:
   Tainan (歸仁 · 沙崙): a wing of a roof that reaches out over the forecourt, the railway's Shalun terminus at the station's north end,
   the convention centre across the avenue, the green-energy campus, the new towers of the station district and the fields beyond;
   Zuoying (高雄): a wave of a roof over a glass hall, the railway's Xinzuoying station on the east with the department store and the
   market beyond it, the metro's R16 entrances on 高鐵路, a bus terminal, the avenue of palms. Original models throughout; real names appear
   only as place labels, no brand or logo is shown. Plan positions are approximate. */
var HSR3D = (function () {
  var V3 = THREE.Vector3, H = null, KT = null, K = null, M = null, MT = null, MX = null, XAS = {}, SGM = {};
  function init() { if (H) return; H = TPE3D.H; KT = H.kit(); K = H.K(); M = H.M(); MT = H.MT(); MX = TXG3D.mats(); }
  function rnd(s) { return K.seeded(s); }
  function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  var FONT = '"Noto Sans TC","PingFang TC","Microsoft JhengHei","Heiti TC",' + (typeof KIT !== 'undefined' && KIT.FONT ? KIT.FONT : 'sans-serif');
  function bx(B, x0, x1, y0, y1, z0, z1, col) { H.bx(B, x0, x1, y0, y1, z0, z1, col); }
  function tbox(p, m, x0, x1, y0, y1, z0, z1, su, sv, cast) { return H.tbox(p, m, x0, x1, y0, y1, z0, z1, su, sv, cast); }
  function ubx(B, x0, x1, y0, y1, z0, z1, su, sv) { H.ubx(B, x0, x1, y0, y1, z0, z1, su, sv); }
  function flat(B, x0, x1, z0, z1, y, su, sv, down) { H.flat(B, x0, x1, z0, z1, y, su, sv, down); }
  function cylY(B, x, y0, y1, z, r, col, seg) { H.cylY(B, x, y0, y1, z, r, col, seg); }
  function inR(x, z, q, m) { m = m || 0; return x > q[0] - m && x < q[1] + m && z > q[2] - m && z < q[3] + m; }
  function spans(a0, a1, cuts) { var out = [], s = a0; cuts.slice().sort(function (p, q) { return p[0] - q[0]; }).forEach(function (c) { if (c[0] > s) out.push([s, c[0]]); s = Math.max(s, c[1]); }); if (a1 > s) out.push([s, a1]); return out; }

  /* ---------------- the plans (local units) ----------------
     Shared: Y1 the kerb's height; P2Y the platforms, RAIL the rail head, CC the concourse's ceiling (the deck's underside); SX the station's half
     width; BZ the body's half length; TRK the tracks' x; PL1/PL2 the islands (east: 1A/1B southbound, west: 2A/2B northbound); PLZ the platforms'
     reach; CONC the concourse; PAID the paid area (its south edge is the line of the gates); ESCP1/2 the wells of the escalators up to the
     platforms (the top at the north end); the plaza east of the station; RA the avenue beyond it; RN/RS the roads north and south; RW the west road. */
  var CFG = {
    tainan: { id: 'tainan', st: 'tnn', Y1: 0.12, P2Y: 8.4, RAIL: 7.36, SX: 20.5, BZ: 136, DZ: 520, PLZ: [-125, 125], TRK: { A1: 17.0, P1: 5.0, P2: -5.0, A2: -17.0 }, through: true, term: false,
      PL1: [6.5, 15.5], PL2: [-15.5, -6.5], CONC: [-20.1, 20.1, -62, 62], PAID: [-16, 16, -44, -2], ESCP1: [8.4, 13.6, -40, -26], ESCP2: [-13.6, -8.4, -40, -26], HSX: 'tnn',
      MAPX: [-150, 250], MAPZ: [-260, 260], PLAZA: [20.5, 94, -84, 84], RA: [100, 114], RN: [-156, -142], RS: [142, 156], RW: [-96, -84], POL: [72, 88, -128, -112], YARD: [-146, -100, 164, 236], TRLOT: [[-136, 182], [-118, 182], [-136, 210], [-118, 210]], AUTO: [-108, 168],
      roof: { kind: 'wing', RZ: 152 }, name: ['台 灣 高 鐵　台 南 站', 'THSR  TAINAN  STATION'], tra: { name: ['臺鐵 沙崙車站', 'TRA  SHALUN  STATION'], trk: [28.6, 37.4], pz: [-200, -100], hall: [24, 46, -92, -80], oz: -146 },
      ex: [['1', '轉運站 · 計程車', 'Buses · Taxis'], ['2', '臺鐵 沙崙站', 'TRA Shalun'], ['3', '會展中心', 'Convention Centre'], ['4', '停車場 · 西側', 'Parking · West']],
      hsS: ['1A 1B 南下 往 左營', '2A 2B 北上 往 嘉義・台中・台北・南港'], hsPlN: ['Southbound to Zuoying', 'Northbound'], roads: [['高鐵大道', 'Gaotie Blvd.'], ['歸仁大道', 'Guiren Blvd.'], ['沙崙 · 科技路', 'Shalun Tech Rd.']],
      shops: [['便利商店 24H', '#1a7a4a'], ['擔仔麵 · 碗粿', '#b8301a'], ['咖啡 CAFÉ', '#4a3022'], ['鳳梨酥 · 伴手禮', '#c8701a'], ['書報 BOOKS', '#2a4a8a'], ['台南便當', '#8a3a1a'], ['手搖飲 TEA', '#d8406a'], ['藥妝 DRUGS', '#1a8aa8']], vendorS: '擔仔麵 · 碗粿',
      auto: ['AUTO CHEMICAL  南部教育訓練中心', '建築化學材料 · 施工實習 · TAINAN TRAINING CENTRE'], land: ['大臺南會展中心', 'ICC TAINAN', '沙崙智慧綠能科學城', 'SHALUN SMART GREEN ENERGY SCIENCE CITY'], lat: 22.9254, lon: 120.2857, wea: 'TNNWEA', weaKey: '697899' },
    zuoying: { id: 'zuoying', st: 'khh', Y1: 0.12, P2Y: 8.4, RAIL: 7.36, SX: 20.5, BZ: 140, DZ: 520, PLZ: [-128, 128], TRK: { A1: 16.4, B1: 4.0, B2: -4.0, A2: -16.4 }, through: false, term: true,
      PL1: [5.5, 14.9], PL2: [-14.9, -5.5], CONC: [-20.1, 20.1, -70, 70], PAID: [-16, 16, -48, -2], ESCP1: [7.6, 12.8, -44, -30], ESCP2: [-12.8, -7.6, -44, -30], HSX: 'khh',
      MAPX: [-150, 250], MAPZ: [-260, 260], PLAZA: [20.5, 70, -90, 90], RA: [76, 90], RN: [-160, -146], RS: [146, 160], RW: [-96, -84], POL: [-130, -114, -140, -124], YARD: [-146, -100, 164, 236], TRLOT: [[-136, 182], [-118, 182], [-136, 210], [-118, 210]], AUTO: [-108, 168],
      roof: { kind: 'wave', RZ: 156 }, name: ['台 灣 高 鐵　左 營 站', 'THSR  ZUOYING  STATION'], tra: { name: ['臺鐵 新左營車站', 'TRA  XINZUOYING  STATION'], trk: [104, 112, 120, 128], pz: [-130, 130], hall: [94, 102, -30, 30] },
      ex: [['1', '公車 轉運站', 'Bus Terminal'], ['2', '臺鐵 新左營', 'TRA Xinzuoying'], ['3', '百貨 · 彩虹市集', 'Mall · Market'], ['4', '捷運 左營 R16', 'MRT Zuoying']],
      hsS: ['1A 1B 終點站 · 左營 (高雄)', '2A 2B 北上 往 台南・台中・台北・南港'], hsPlN: ['Terminus · Zuoying', 'Northbound'], roads: [['高鐵路', 'Gaotie Rd.'], ['站前北路', 'Zhanqian N. Rd.'], ['博愛二路', 'Boai 2nd Rd.']],
      shops: [['便利商店 24H', '#1a7a4a'], ['木瓜牛奶 · 冰品', '#e8a020'], ['咖啡 CAFÉ', '#4a3022'], ['高雄名產 · 伴手禮', '#c8701a'], ['漢堡 · 早餐', '#b8301a'], ['書報 BOOKS', '#2a4a8a'], ['手搖飲 TEA', '#d8406a'], ['藥妝 DRUGS', '#1a8aa8']], vendorS: '木瓜牛奶 · 冰品',
      auto: ['AUTO CHEMICAL  高雄教育訓練中心', '建築化學材料 · 施工實習 · KAOHSIUNG TRAINING CENTRE'], land: ['左營 · 彩虹市集', 'RAINBOW MARKET · DEPARTMENT STORE', '高雄捷運 左營站 R16', 'MRT ZUOYING STATION'], lat: 22.6873, lon: 120.3074, wea: 'KHHWEA', weaKey: '701682' } };
  /* the concourse's ceiling: the deck's underside less its beams */ function ccOf(c) { return c.RAIL - 0.42 - 1.6; }

  /* ---------------- the roofs ----------------
     Tainan's wing: a shallow vault over the tracks whose east eave sweeps out and down over the forecourt (a cantilever on raking struts),
     pointed at both ends. Zuoying's wave: a sheet over the whole hall that rises and falls twice along its length, its edges turned up. */
  function roofFn(c) { var R = c.roof, RZ = R.RZ, SX = c.SX;
    if (R.kind === 'wing') return { RZ: RZ, x0: function (z) { var u = Math.min(1, Math.abs(z) / RZ); return -(SX + 3.5) * Math.pow(Math.max(0, 1 - Math.pow(u, 2.6)), 0.4); }, x1: function (z) { var u = Math.min(1, Math.abs(z) / RZ); return (SX + 19) * Math.pow(Math.max(0, 1 - Math.pow(u, 2.2)), 0.45); },
      y: function (x, z) { var u = Math.min(1, Math.abs(z) / RZ), cz = Math.max(0, 1 - u * u), top = c.P2Y + 9.4 + 2.2 * cz; if (x <= 0) { var k = Math.min(1.2, -x / (SX + 3.5)); return top - 3.2 * k * k; } var k2 = Math.min(1.3, x / (SX + 19)); return top - 1.2 * k2 - 5.6 * k2 * k2; } };
    return { RZ: RZ, x0: function (z) { var u = Math.min(1, Math.abs(z) / RZ); return -(SX + 6) * Math.pow(Math.max(0, 1 - Math.pow(u, 3)), 0.3); }, x1: function (z) { var u = Math.min(1, Math.abs(z) / RZ); return (SX + 6) * Math.pow(Math.max(0, 1 - Math.pow(u, 3)), 0.3); },
      y: function (x, z) { var w = SX + 6, k = Math.min(1.3, Math.abs(x) / w), wave = 2.4 * Math.sin(z / 46) + 1.2 * Math.cos(z / 19), lip = 2.6 * Math.pow(Math.max(0, k - 0.78) / 0.22, 2); return c.P2Y + 10.2 + wave - 1.8 * k * k + lip; } }; }

  /* ---------------- the signs: one atlas per city (2048 × 1024) ---------------- */
  function atlas(c) { if (XAS[c.id]) return XAS[c.id]; init(); var cn = cv(2048, 1024), g = cn.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 2048, 1024); var A = { c: cn, g: g, cells: {} };
    function cell(k, x, y, w, h) { A.cells[k] = [x, y, w, h]; } g.textAlign = 'center'; g.textBaseline = 'middle';
    function txt(s, x, y, size, col, wt) { g.fillStyle = col; g.font = (wt || 800) + ' ' + size + 'px ' + FONT; g.fillText(s, x, y); }
    function fit(s, x, y, maxW, size, col, wt, align) { g.textAlign = align || 'left'; var fs = size; g.font = (wt || 800) + ' ' + fs + 'px ' + FONT; while (g.measureText(s).width > maxW && fs > 10) { fs--; g.font = (wt || 800) + ' ' + fs + 'px ' + FONT; } g.fillStyle = col; g.fillText(s, x, y); g.textAlign = 'center'; }
    /* the station's name (1024 × 128 at 0,0) */ g.fillStyle = '#f4f6f7'; g.fillRect(0, 0, 1024, 128); g.fillStyle = '#e8762a'; g.fillRect(0, 112, 1024, 16); txt(c.name[0], 512, 50, 70, '#2a2e34', 900); txt(c.name[1], 512, 96, 24, '#4a525a', 700); cell('name', 0, 0, 1024, 128);
    /* the railway's name (512 × 128) and the metro's / the landmark's plate */ g.fillStyle = '#1f4f9a'; g.fillRect(1024, 0, 512, 128); txt(c.tra.name[0], 1280, 48, 50, '#ffffff', 900); txt(c.tra.name[1], 1280, 98, 22, '#d8e4f4', 700); cell('tra', 1024, 0, 512, 128);
    g.fillStyle = '#ffffff'; g.fillRect(1536, 0, 512, 128); if (c.id === 'zuoying') { g.fillStyle = '#d8281e'; g.fillRect(1536, 0, 512, 14); g.fillRect(1556, 30, 72, 72); txt('R16', 1592, 66, 30, '#ffffff', 900); txt('左營', 1820, 50, 50, '#3a1a1a', 900); txt('MRT Zuoying Station · Red Line', 1820, 98, 18, '#4a2a2a', 700); }
    else { g.fillStyle = '#1a7a5a'; g.fillRect(1536, 0, 512, 14); txt('沙崙智慧綠能科學城', 1792, 50, 44, '#1a3a2a', 900); txt('SHALUN SMART GREEN ENERGY SCIENCE CITY', 1792, 98, 18, '#2a4a3a', 700); } cell('mrt', 1536, 0, 512, 128);
    /* the exits (256 × 128 each, y 128): yellow on charcoal */ c.ex.forEach(function (s, i) { var x = i * 256, y = 128; g.fillStyle = '#1e2226'; g.fillRect(x, y, 256, 128); g.fillStyle = '#f2c21a'; g.fillRect(x + 10, y + 14, 84, 100); txt(s[0], x + 52, y + 66, 76, '#1e2226', 900); fit('出口 ' + s[1], x + 104, y + 46, 146, 26, '#ffffff', 800); fit('Exit ' + s[0] + ' · ' + s[2], x + 104, y + 90, 146, 16, '#c8d0d8', 600); cell('ex' + s[0], x, y, 256, 128); });
    /* the high-speed rail's signs (512 × 128, y 256..512) */ var HS = [['高鐵 售票', 'THSR Tickets'], ['驗票閘門', 'Fare Gates'], [c.hsS[0], c.hsPlN[0]], [c.hsS[1], c.hsPlN[1]], ['往 月台 ↑', 'To the platforms'], ['臺鐵 TRA  →  出口 2', 'To ' + c.tra.name[1].split('  ')[1]], [c.id === 'zuoying' ? '捷運 MRT  ←  出口 4' : '會展中心  →  出口 3', c.id === 'zuoying' ? 'To the metro' : 'To the convention centre'], ['服務台', 'Information']];
    HS.forEach(function (s, i) { var x = (i % 4) * 512, y = 256 + Math.floor(i / 4) * 128, tra = i === 5, mrt = i === 6; g.fillStyle = '#1f2326'; g.fillRect(x, y, 512, 128); g.fillStyle = tra ? '#2a5aa8' : mrt ? (c.id === 'zuoying' ? '#d8281e' : '#1a7a5a') : '#f07a1a'; g.fillRect(x, y, 512, 10); g.fillRect(x + 14, y + 26, 10, 76); fit(s[0], x + 40, y + 52, 450, s[0].length > 10 ? 30 : 46, '#ffffff', 800); fit(s[1], x + 40, y + 100, 450, 24, '#c8ced4', 600); cell('hs' + i, x, y, 512, 128); });
    /* street plates (256 × 64, y 512) */ c.roads.forEach(function (s, i) { var x = i * 256, y = 512; g.fillStyle = '#0f6a3a'; g.fillRect(x, y, 256, 64); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(x + 4, y + 4, 248, 56); txt(s[0], x + 128, y + 24, 26, '#ffffff', 800); txt(s[1], x + 128, y + 48, 14, '#ffffff', 600); cell('sn' + i, x, y, 256, 64); });
    /* the police station, the forecourt's signs (256 × 64, y 512) */ var PS = [['派 出 所', 'POLICE', '#123a7a'], ['公車 轉運站', 'BUS TERMINAL', '#c8501a'], ['計 程 車', 'TAXI', '#e8b818'], ['P 停車場', 'PARKING', '#1a4a9a'], ['機車停車場', 'SCOOTERS', '#2a6a4a'], ['汽車送客區', 'DROP-OFF', '#3a3e46'], ['公共自行車', 'BIKE SHARE', '#1a8a6a']];
    PS.forEach(function (s, i) { var x = 768 + i * 256, y = 512; if (x >= 2048) { x = 1792; y = 448; } g.fillStyle = s[2]; g.fillRect(x, y, 256, 64); txt(s[0], x + 128, y + 26, 28, i === 2 ? '#1a1a1a' : '#ffffff', 900); txt(s[1], x + 128, y + 52, 13, i === 2 ? '#1a1a1a' : '#ffffff', 700); cell('ps' + i, x, y, 256, 64); });
    /* the concourse's shops (512 × 96, y 576) */ c.shops.forEach(function (s, i) { var x = (i % 4) * 512, y = 576 + Math.floor(i / 4) * 96; g.fillStyle = s[1]; g.fillRect(x, y, 512, 96); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x, y + 78, 512, 18); txt(s[0], x + 256, y + 42, 48, '#ffffff', 900); txt('營業中 · 歡迎光臨', x + 256, y + 87, 14, '#ffe680', 700); cell('sh' + i, x, y, 512, 96); });
    /* AUTO CHEMICAL's training centre (1024 × 128, y 768) */ g.fillStyle = '#ef7a1d'; g.fillRect(0, 768, 1024, 128); g.fillStyle = '#1b1d22'; g.fillRect(0, 868, 1024, 28); txt(c.auto[0], 512, 818, 54, '#ffffff', 900); txt(c.auto[1], 512, 882, 18, '#f2c94c', 700); cell('auto', 0, 768, 1024, 128);
    /* the landmarks' names (1024 × 128, y 896; 512 × 128 at 1024,768 and 1536,768) */ g.fillStyle = c.id === 'zuoying' ? '#2a2a30' : '#f2f2f0'; g.fillRect(0, 896, 1024, 128); txt(c.land[0], 512, 944, 64, c.id === 'zuoying' ? '#ffffff' : '#1a2a3a', 900); txt(c.land[1], 512, 1002, 22, c.id === 'zuoying' ? '#ffd080' : '#3a4a5a', 700); cell('land0', 0, 896, 1024, 128);
    g.fillStyle = c.id === 'zuoying' ? '#d8281e' : '#1a7a5a'; g.fillRect(1024, 768, 1024, 128); txt(c.land[2], 1536, 816, 58, '#ffffff', 900); txt(c.land[3], 1536, 874, 22, '#f0f4f8', 700); cell('land1', 1024, 768, 1024, 128);
    /* the bus bays' numbers (128 × 128, y 896, from x 1024) */ for (var b = 1; b <= 8; b++) { var bxx = 1024 + (b - 1) * 128; g.fillStyle = '#c8501a'; g.fillRect(bxx, 896, 128, 128); g.fillStyle = '#ffffff'; g.fillRect(bxx + 12, 908, 104, 104); txt(String(b), bxx + 64, 962, 64, '#c8501a', 900); cell('bay' + b, bxx, 896, 128, 128); }
    A.tex = KT.toTex(cn); A.tex.wrapS = A.tex.wrapT = THREE.ClampToEdgeWrapping; A.tex.anisotropy = 8; XAS[c.id] = A; return A; }
  function xUV(c, key) { var A = atlas(c), q = A.cells[key]; return { u0: q[0] / 2048, u1: (q[0] + q[2]) / 2048, v0: 1 - (q[1] + q[3]) / 1024, v1: 1 - q[1] / 1024 }; }
  function signMat(c) { if (SGM[c.id]) return SGM[c.id]; var A = atlas(c), m = K.curved(new THREE.MeshStandardMaterial({ map: A.tex, emissive: 0xffffff, emissiveMap: A.tex, emissiveIntensity: 0.3, roughness: 0.5, envMapIntensity: 0.5 })); if (K.llights) K.llights(m); SGM[c.id] = m; return m; }

  /* ---------------- the trains: the high-speed rail's own (TPE3D), the railway's commuters (TXG3D) ----------------
     A terminus (Zuoying): the trains come in from the north, stand, and go back north — every one on a platform track. */
  function termStep(T, tr, dt) { tr.evt = null;
    if (tr.st === 'gone') { tr.wait -= dt; tr.root.visible = false; if (tr.wait <= 0 && !tr.hold) { tr.st = 'in'; tr.dir = -1; tr.x = 400; tr.v = 22; tr.root.rotation.y = -Math.PI / 2; tr.root.visible = true; tr.evt = 'in'; } }
    else if (tr.st === 'in') { var d = tr.x; tr.v = Math.max(0.6, Math.min(tr.v, Math.sqrt(2 * 0.55 * Math.max(0, d)))); tr.x -= tr.v * dt; if (d <= 0.05) { tr.x = 0; tr.v = 0; tr.st = 'dwell'; tr.wait = tr.keep ? 1e9 : 46; tr.openT = 1.6; tr.evt = 'stop'; } }
    else if (tr.st === 'dwell') { if (tr.openT > 0) { tr.openT -= dt; if (tr.openT <= 0) { tr.open = true; tr.evt = 'open'; } } tr.wait -= dt; if (tr.wait <= 5 && tr.open) { tr.open = false; tr.evt = 'close'; } if (tr.wait <= 0) { tr.st = 'out'; tr.dir = 1; tr.v = 0; tr.root.rotation.y = Math.PI / 2; tr.evt = 'go'; } }
    else if (tr.st === 'out') { tr.v = Math.min(24, tr.v + 0.7 * dt); tr.x += tr.v * dt; if (tr.x > 440) { tr.st = 'gone'; tr.wait = 40 + Math.random() * 50; tr.root.visible = false; if (tr.onGone) { var f = tr.onGone; tr.onGone = null; f(); } } }
    tr.root.position.x = tr.x + tr.dir * tr.mid; tr.doors.visible = !tr.open; tr.opn.visible = !!tr.open; }
  function trains(T, c, hi) { var n = hi ? 12 : 8, RAIL = c.RAIL, list = c.term ? [['A1', -1, 0], ['B1', -1, 80], ['A2', -1, 160], ['B2', -1, 240]] : [['A1', -1, 0], ['A2', 1, 120]];
    list.forEach(function (q, k) { var Hs = TPE3D.hsTrain(n); Hs.track = q[0]; Hs.zt = c.TRK[q[0]]; Hs.dir = q[1]; Hs.st = 'gone'; Hs.wait = q[2] * 0.4 + 6; Hs.x = 0; Hs.v = 0; Hs.no = [803, 1515, 622, 1218][k];
      Hs.root.rotation.y = q[1] > 0 ? Math.PI / 2 : -Math.PI / 2; Hs.root.position.set(0, RAIL, Hs.zt); Hs.root.visible = false; T.G.b2.add(Hs.root); Hs.mid = Hs.len / 2; Hs.ns = true; Hs.oz = 0; Hs.rail = RAIL; Hs.line = 'hsr'; if (c.term) Hs.stepFn = termStep; T.trains.push(Hs); });
    var t0 = T.trains[0]; t0.st = 'dwell'; t0.wait = 40; t0.x = 0; t0.root.visible = true; t0.open = true;
    /* the railway: on its own ground-level tracks east (Zuoying) or north-east (Tainan), its trains along z too */ var tr = c.tra, TRAIL = 0.62; if (!tr) return;
    tr.trk.slice(0, hi ? 4 : 2).forEach(function (tx, k) { var R = TXG3D.traTrain(c.id === 'tainan' ? 4 : hi ? 8 : 6); R.track = 'T' + (k + 1); R.zt = tx; R.dir = c.id === 'tainan' ? -1 : (k % 2 ? 1 : -1); R.st = 'gone'; R.wait = 12 + k * 40; R.x = 0; R.v = 0; R.no = [2155, 3186, 2224, 115][k];
      R.root.rotation.y = R.dir > 0 ? Math.PI / 2 : -Math.PI / 2; R.root.position.set(0, TRAIL, R.zt); R.root.visible = false; T.G.tra.add(R.root); R.mid = R.len / 2; R.ns = true; R.oz = tr.oz || 0; R.rail = TRAIL; R.hw = 1.3; R.hh = 3.4; R.loud = 22; R.line = 'tra'; if (c.id === 'tainan') R.stepFn = termStep; T.trains.push(R); }); }


