/* ===== [data_ux.js] ===== */
/* ===== UREAX-HG guide: content =====
   Every figure is taken from the Auto Chemical catalogue オートンウレアックスHG (2024.02, 4 pages: FU08 method, performance, cure curves,
   1Day process chart), the product pages on autochem.co.jp and the SDS (2026/05/27). Where practice is described that the manufacturer does not
   publish, the step is marked as general practice (†). Product names stay in the manufacturer's form. ===== */
var AC = 'https://autochem.co.jp';
var AC_UP = AC + '/site/wp-content/uploads/';
var AC_FILES = {
  cat: AC_UP + '2024/02/fa6d4538d5a675fbaae27bac658717cc.pdf',
  sdsHG: AC_UP + '2020/02/bff3a683707e6db966f80017c813657c.pdf',
  sds55: AC_UP + '2020/02/02130ee33893754320833aeefe7bb3fc.pdf',
  sds30: AC_UP + '2020/02/0cc6a01f688b0693913980e12b1af807.pdf',
  sdsAcc: AC_UP + '2020/02/fa77e90a8b9044ec5cf44d7c77baa240.pdf',
  sdsK: AC_UP + '2020/02/2f9e80c92a260de636d664cfd00c3ef5.pdf'
};
var ACP = { // the products of the UREAX range, in the order of autochem.co.jp
  HG: { url: AC + '/1052/', pack: 18, packKind: 'can', rate: 0.8, coat1: 0.6, coat2: 0.2, cov: 22.5, files: [['cat', AC_FILES.cat], ['sds', AC_FILES.sdsHG]] },
  OP55: { url: AC + '/1067/', pack: 16, packKind: 'can', rate: 0.15, cov: 106.6, files: [['sds', AC_FILES.sds55], ['cat', AC_FILES.cat]] },
  OP30: { url: AC + '/1064/', pack: 16, packKind: 'can', rate: 0.15, cov: 106.6, files: [['sds', AC_FILES.sds30]] },
  NBQ: { url: AC + '/976/', pack: 0.32, packKind: 'cartridge', files: [] },
  EX: { url: AC + '/929/', pack: 0.32, packKind: 'cartridge', files: [['excat', AC_UP + '2023/04/0241dcd09e79c55a3498096ad1695f94.pdf'], ['vid1', 'https://youtu.be/Yasgf3Lo-cQ'], ['vid2', 'https://youtu.be/ItOJSMuf6cw']] },
  ACC: { url: AC + '/1072/', pack: 0.8, packKind: 'bottle', files: [['sds', AC_FILES.sdsAcc], ['cat', AC_FILES.cat]] },
  SOLV: { url: AC + '/1075/', pack: 3.5, packKind: 'can', files: [['sds', AC_FILES.sdsK]] }
};
var AC_PART = { OP2019: {}, QS: { url: AC + '/969/' }, CTA: { url: AC + '/1088/' }, AGG: {}, PO: { hash: '#/protect-one' } };
var AC_LINKS = { SUB: AC + '/products/waterproofing/ureax/', CAT: AC + '/products/catalog/catalog_b/', SDS: AC + '/products/sds/sds-waterproofing/', HG: AC + '/1052/', EX: AC + '/929/', EXCAT: AC_UP + '2023/04/0241dcd09e79c55a3498096ad1695f94.pdf', VID1: 'https://youtu.be/Yasgf3Lo-cQ', VID2: 'https://youtu.be/ItOJSMuf6cw' };
/* the registrations of the range (certificates supplied by the distributor): F☆☆☆☆ formaldehyde-emission class of the Japanese industry associations */
var AC_CERT = { HG: ['NUK-F15829', 'F☆☆☆☆', '日本ウレタン建材工業会', '2025-02-12'], EX: ['JSIA-001019', 'F☆☆☆☆', '日本シーリング材工業会', '2026-08-31'], OP2019: ['JSIA-001024', 'F☆☆☆☆', '日本シーリング材工業会', '2027-08-31'], OP2020: ['JSIA-001031', 'F☆☆☆☆', '日本シーリング材工業会', '2027-08-31'], NB101: ['JSIA-001018', 'F☆☆☆☆', '日本シーリング材工業会', '2028-08-31'], CLIO: ['JSIA-001026', 'F☆☆☆☆', '日本シーリング材工業会', '2027-08-31'], NBQ: ['JAIA-006864', 'F☆☆☆☆', '日本接着剤工業会', '2029-03-31'], ULTRA: ['JAIA-012251', 'F☆☆☆☆', '日本接着剤工業会', '2029-03-31'], ULTRA4: ['JAIA-606138', '4VOC', '日本接着剤工業会', '2029-03-31'] };
var AC_ORDER = ['frp', 'mortar', 'roof'];
var AC_STAGES = { frp: ['state', 'prep', 'prime', 'seal', 'coat1', 'coat2', 'done'], mortar: ['state', 'prep', 'prime', 'seal', 'coat1', 'coat2', 'done'], roof: ['state', 'prep', 'prime', 'seal', 'coat1', 'coat2', 'done'] };
/* 56 × 40 line pictograms of the applications: ink lines, .r the orange coat, .w water, .d2 filled grey */
var AC_ICON = {
  frp: '<path d="M4 30h48M4 30v-8h4v8M52 30v-8h-4v8" class="k"/><path d="M8 30h40" class="r"/><path d="M10 18v-8h20M30 10v20" /><path d="M12 12h14M12 15h14" /><path d="M36 22l3-5 3 5" class="w"/><path d="M43 30v-6h6v6" /><path d="M14 30v-4" /><path d="M20 27l3-1 2 2" /><path d="M6 33h44" class="d"/>',
  mortar: '<path d="M4 30h48" class="k"/><path d="M8 30h40" class="r"/><path d="M6 30v-20h12v20" /><path d="M9 14h6M9 18h6" /><path d="M24 21l4-2 3 3 4-3" /><path d="M36 30v-5h10v5" /><path d="M6 33h44" class="d"/>',
  roof: '<path d="M4 34h48" class="k"/><path d="M8 34h34" class="r"/><path d="M42 34v-14h8v14" /><path d="M42 20h8" /><path d="M42 26v8" class="r"/><path d="M10 34v-3M14 31h-8" /><path d="M11 29l2-3 2 3" class="w"/><path d="M22 34v-6h6v6" /><path d="M6 37h44" class="d"/>'
};
function acSteps(scn, spec, grip) { // the procedure cards of a scenario for a specification: [libraryKey, stage, progress]
  var K = scn === 'frp' ? 'F' : scn === 'mortar' ? 'M' : 'R', L = [['plan' + K, 'state'], ['clean' + K, 'prep', 0.5], ['prime' + K, 'prime', 0.4], ['repair' + K, 'seal', 0.62]], n = AC_SPECS[spec].coats.length;
  L.push([scn === 'roof' ? 'coat1R' : 'coat1F', 'coat1', 0.5]);
  if (spec === 'fu08') { L.push(['mixF', 'coat2', 0.06], [scn === 'roof' ? 'coat2R' : 'coat2F', 'coat2', 0.55]); } else { L.push(['coat2P', 'coat2', 0.55]); if (n > 2) L.push(['coat3P', 'coat3', 0.55]); if (grip) L.push(['mixF', 'grip', 0.06], ['gripF', 'grip', 0.55]); }
  L.push(['termF', 'done', 0.35], ['inspF', 'done', 0.75], ['cureF', 'done', 0.95], ['handF', 'done']); return L;
}
function acStages(spec, grip) { var L = ['state', 'prep', 'prime', 'seal', 'coat1', 'coat2']; if (spec === 'std3') L.push('coat3'); if (spec !== 'fu08' && grip) L.push('grip'); L.push('done'); return L; }
function acLayers(scn, spec, grip) { var pr = scn === 'frp' ? 'prim55' : 'prim30', r = scn === 'roof' ? 'r' : '', L = [{ p: scn === 'frp' ? 'OP55' : 'OP30', stage: 'prime', k: pr }, { p: 'NBQ', stage: 'seal', k: 'seal' }, { p: 'HG', stage: 'coat1', k: 'c1' + r }]; if (spec === 'fu08') L.push({ p: 'HG', stage: 'coat2', k: 'c2' + r }); else { L.push({ p: 'HG', stage: 'coat2', k: 'c2p' }); if (spec === 'std3') L.push({ p: 'HG', stage: 'coat3', k: 'c3' }); if (grip) L.push({ p: 'HG', stage: 'grip', k: 'grip' }); } L.push({ p: 'EX', stage: 'done', k: 'term' }); return L; }
var ACS = { // the applications: procedure cards [libraryKey, stage, progressForStill?], products in the system, the headline product, the calculator preset, the build-up
  frp: { steps: [['planF', 'state'], ['cleanF', 'prep', 0.45], ['primeF', 'prime', 0.3], ['repairF', 'seal', 0.62], ['coat1F', 'coat1', 0.5], ['mixF', 'coat2', 0.06], ['coat2F', 'coat2', 0.55], ['cureF', 'done', 0.45], ['handF', 'done']],
    products: ['HG', 'OP55', 'NBQ', 'EX', 'ACC', 'AGG', 'CTA'], main: 'HG', calc: { sub: 'frp', up: 0.3 },
    layers: [{ p: 'OP55', stage: 'prime', k: 'prim55' }, { p: 'NBQ', stage: 'seal', k: 'seal' }, { p: 'HG', stage: 'coat1', k: 'c1' }, { p: 'HG', stage: 'coat2', k: 'c2' }] },
  mortar: { steps: [['planM', 'state'], ['cleanM', 'prep', 0.45], ['primeM', 'prime', 0.3], ['repairM', 'seal', 0.62], ['coat1F', 'coat1', 0.5], ['mixF', 'coat2', 0.06], ['coat2F', 'coat2', 0.55], ['cureF', 'done', 0.45], ['handF', 'done']],
    products: ['HG', 'OP30', 'NBQ', 'EX', 'ACC', 'AGG'], main: 'HG', calc: { sub: 'concrete', up: 0.15 },
    layers: [{ p: 'OP30', stage: 'prime', k: 'prim30' }, { p: 'NBQ', stage: 'seal', k: 'seal' }, { p: 'HG', stage: 'coat1', k: 'c1' }, { p: 'HG', stage: 'coat2', k: 'c2' }] },
  roof: { steps: [['planR', 'state'], ['cleanR', 'prep', 0.45], ['primeR', 'prime', 0.3], ['repairR', 'seal', 0.62], ['coat1R', 'coat1', 0.5], ['mixF', 'coat2', 0.06], ['coat2R', 'coat2', 0.55], ['cureF', 'done', 0.45], ['handF', 'done']],
    products: ['HG', 'OP30', 'NBQ', 'EX', 'ACC', 'AGG'], main: 'HG', calc: { sub: 'urethane', up: 0.25 },
    layers: [{ p: 'OP30', stage: 'prime', k: 'prim30' }, { p: 'NBQ', stage: 'seal', k: 'seal' }, { p: 'HG', stage: 'coat1', k: 'c1r' }, { p: 'HG', stage: 'coat2', k: 'c2r' }] }
};
/* catalogue numbers used by the simulator, the take-off and the labels */
var AC_NUM = { cons: { hg1: 0.6, hg2: 0.2, hg: 0.8, primer: 0.15 }, film: 0.5, cure: 5, openMin: { spring: 15, summer: 15, winter: 30 }, acc: { spring: 2.5, summer: 0, winter: 5 }, accMax: 7.5, solvMax: 7.5, aggMin: 50, aggMax: 100 };
/* cure curves: cure depth (mm) against time (h), read from the catalogue's graphs at 5 °C, 20 °C and 35 °C, 50 % RH (approximate) */
var AC_CURVES = { // hours to a cured thickness of 0.5 / 1.0 / 1.5 / 2.0 mm (TDS 2026/8/7, table 4-3): [h, mm]; > 24 h is left out
  spring: { '0': [[0, 0], [6.5, 0.5], [20, 1.0]], '2.5': [[0, 0], [3.5, 0.5], [7.5, 1.0], [12, 1.5], [16.5, 2.0]], '5': [[0, 0], [2.5, 0.5], [4.8, 1.0], [6.5, 1.5], [8, 2.0]] },
  summer: { '0': [[0, 0], [3, 0.5], [6.5, 1.0], [11, 1.5], [20, 2.0]], '2.5': [[0, 0], [1.5, 0.5], [3, 1.0], [4.8, 1.5], [6.5, 2.0]], '5': [[0, 0], [1, 0.5], [2, 1.0], [3, 1.5], [4, 2.0]] },
  winter: { '0': [[0, 0], [9.5, 0.5]], '2.5': [[0, 0], [5.5, 0.5], [17, 1.0]], '5': [[0, 0], [4, 0.5], [7, 1.0], [15.5, 1.5]] }
};
var AC_SEASON_TEMP = { spring: '23 °C', summer: '35 °C', winter: '5 °C' };
/* the catalogue's 1Day process chart, hours per segment: g substrate, p primer, o open time, n waterproofing, tc topcoat */
var AC_GANTT = [[['g', 1.5], ['p', 0.5], ['o', 1.0], ['n', 2.0], ['o', 1.0], ['tc', 0.5]], [['g', 1.1], ['p', 0.4], ['o', 1.3], ['n', 2.6]], [['g', 1.5], ['p', 0.5], ['o', 1.0], ['tc', 0.5]]];
/* working hours of the FU08 stages for a typical balcony of 25 m² and a crew of two, read from the process chart (planning estimate) */
var AC_BASE = { clean: 1.6, primer: 0.4, open: 0.5, seal: 0.8, coat1: 1.6, coat2: 1.6, coat3: 1.6, grip: 1.0, term: 0.4, cure: 5 };
/* the coating specifications: FU08 (catalogue 2024.02, one day) and the distributor's standard method statement 4-1 / 4-2 (2026/8/6) */
var AC_SPECS = {
  fu08: { coats: [0.6, 0.2], upCoats: [0.6, 0.2], gripIn: 2, film: 0.5, walkH: 5, intervalH: null, grip: 'fixed' },   // second coat = the anti-slip coat with sand
  std2: { coats: [0.6, 0.6], upCoats: [0.4, 0.4], film: 0.83, walkH: 24, intervalH: [3, 10], grip: 'option' },
  std3: { coats: [0.6, 0.6, 0.6], upCoats: [0.4, 0.4, 0.4], film: 1.25, walkH: 24, intervalH: [3, 10], grip: 'option' }
};
var AC_GRIP = { rate: 0.2, sandMin: 50, sandMax: 100, grain: '0.35–0.5 mm', intervalH: 24 };
var AC_NBQ = { cart: 0.32, recoatH: 1 };
var AC_TERM = { cart: 0.32, mPerCart: 2.7 }; // EXCEED 10 × 10 mm bead, TDS yield table incl. 20 % loss
var AC_QA = { tMin: 5, tMax: 35, rhMax: 80, moistMax: 8 };
/* EXCEED joint sealant: a 320 ml cartridge, a triangular fillet b × b mm holds b²/2 mm² per metre */
var AC_SEAL = { cart: 0.32, bead: 10, pailL: 6 }; // NON-BLEED QUICK fillets and crack beads
var AC_PACK = { HG: 18, OP55: 16, OP30: 16, ACC: 0.8, SOLV: 3.5, EX: 0.32, NBQ: 0.32 };

var ACT = { en: {}, zh: {}, ja: {} };
var ACP_T = {}, AC_STEPS = {}, ACS_T = {};

/* ======================================================= 繁體中文 ======================================================= */
ACT.zh = {
  'ux.kicker': '防水材 · UREAX 系列 · 單液型聚氨酯・聚脲塗覆材',
  'ux.title': 'オートン<br>ウレアックスHG', 'ux.titleEn': 'AUTON UREAX-HG', 'ux.sub': '複合式防水塗覆材，免面漆。', 'ux.tag': 'Surface protection + waterproofing in one film.',
  'ux.intro': '{HG} 把保護塗層的耐候、耐磨性能與塗膜防水材的防水性能放進同一層 0.5 mm 的膜裡。FRP 陽台、露台的翻新以 FU08 工法一天完成：專用底漆 {OP55} 免打磨、不需丙酮擦拭，塗布兩道，不另塗面漆，養生 5 小時以上即可步行。',
  'ux.claim': '表面保護＋防水，一種材料同時完成。',
  'ux.btn1': '查看系統構成', 'ux.btn2': '估算用量與報價', 'ux.btn3': '產品型錄（PDF）', 'ux.photoCap': 'FU08 工法樣板：既有 FRP 面上的每一道工序並列呈現',
  'ux.hero.legend': '系統構成，逐步呈現', 'ux.hero.alt': 'FU08 工法的 3D 樣板：既有 FRP、清掃、OP-55F 底漆、UREAX-HG 第一道、第二道＋骨材、完工，六段並列',
  'ux.stats': [['標準塗布量', '0.8', 'kg/㎡', '兩道合計：第一道 0.6 ＋ 第二道 0.2 kg/㎡'], ['每罐 18 kg', '22.5', '㎡', '可塗面積（型錄標準塗布量）'], ['完成膜厚', '0.5', 'mm', '兩道塗布後的塗膜厚度'], ['養生', '≥ 5', 'h', '塗布後靜置養生，之後可步行']],
  'ux.strip': [['單液型', '聚氨酯・聚脲塗覆材，開罐即用，18 kg 罐'], ['免面漆', '耐候性與耐磨性在防水層本身——沒有面漆工序'], ['免打磨', '專用底漆 {OP55} 在 FRP 上免打磨、免丙酮擦拭'], ['1Day 工法', '清掃、底漆、兩道塗布、養生——一個工作日（FU08）']],
  'ux.spec.label': '塗布規格', 'ux.spec.title': '選擇塗布規格——防滑面是選項', 'ux.spec.sub': '型錄的 FU08 工法把防滑骨材放在第二道；代理商標準施工規範（2026/8/6）以 0.6 kg/㎡ 為一道、依要求膜厚塗 2–3 道，防滑層為選用。3D 模型、系統構成、工期與報價都隨規格改變。',
  'ux.spec.opts': [['fu08', 'FU08 型錄工法 · 1Day', '0.6 ＋ 0.2 kg/㎡（第二道含骨材）＝ 0.8 kg/㎡ · 0.5 mm · 養生 5 h 可步行'], ['std2', '標準規格 · 2 道', '0.6 ＋ 0.6 kg/㎡ ＝ 1.2 kg/㎡ ≈ 0.83 mm · 工程間隔 3–10 h · 最終工程後 24 h'], ['std3', '標準規格 · 3 道（要求膜厚）', '0.6 × 3 ＝ 1.8 kg/㎡ ≈ 1.25 mm · 工程間隔 3–10 h · 最終工程後 24 h']],
  'ux.grip.label': '防滑層（珪砂）', 'ux.grip.on': '有：HG 0.2 kg/㎡ ＋ 珪砂', 'ux.grip.off': '無防滑面', 'ux.grip.fixed': 'FU08：第二道即防滑面（含骨材）', 'ux.grip.note': '防滑規格（選用）：UREAX-HG 0.2 kg/㎡（163.9 ml/㎡）＋ 珪砂，HG：砂 ＝ 1 kg：50–100 g，粒徑約 0.35–0.5 mm，工程間隔 24 h。不需要防滑面時省略——塗膜本身就是完成面。',
  'ux.spec.up': '立面（施工規範 4-2）：每道 0.4 kg/㎡（不流掛的基準值），工程間隔 3–10 h；補強網布為選用。', 'ux.spec.film': '理論膜厚：0.1 kg/㎡ ＝ 0.0695 mm。',
  'ux.sys.label': '系統構成', 'ux.sys.title': '從既有基材到完工的防水面', 'ux.sys.sub': '選擇施工情境。系統構成顯示哪個產品接在哪個之後、塗布量多少、之後要等多久。點選任一層可在剖面圖中顯示。',
  'ux.scn.label': '施工情境', 'ux.scn.title': '哪一種基材，用哪一種底漆', 'ux.scn.problem': '現況', 'ux.scn.solution': '系統', 'ux.scn.products': '本系統的產品',
  'ux.layers': '系統構成（由基材向上）', 'ux.layer.thick': '厚度', 'ux.layer.cons': '塗布量', 'ux.layer.wait': '下一步', 'ux.layer.water': '混合',
  'ux.sub0': ['基材', '既有 FRP 防水層、砂漿／混凝土面或既有聚氨酯防水層：清潔、乾燥、附著牢固；不陸與裂縫先處理'],
  'ux.note': '剖面示意：塗層厚度經誇大。塗布量取自 FU08 工法表；完成膜厚 0.5 mm。細節請確認標準施工規範書。',
  'ux.stage.of': '第 {i}／{n} 階段', 'ux.prev': '上一階段', 'ux.next': '下一階段', 'ux.play': '播放系統構成', 'ux.pause': '暫停', 'ux.show': '在剖面圖中顯示', 'ux.bar': '施工情境', 'ux.bar.all': '全部施工情境',
  'ux.adv.label': '產品優勢', 'ux.adv.title': '{HG} 的產品優勢——W 的效果',
  'ux.adv.cards': [['', '免面漆', 'W 的效果', '表面保護機能＋防水機能：耐候、耐磨的塗膜同時就是防水層，面漆工序從工期中消失。'], ['Shore A', '95', '強韌的塗膜', '硬化後為高耐久的強韌塗膜：抗拉強度 17 N/mm²、斷裂伸長率 470%、抗張積 1600 N/mm（型錄性能數據）。'], ['', '6,000 h', '優異耐候性', '開放式碳弧燈促進曝露試驗，膜厚 0.5 mm：4,000 與 6,000 小時無異常，8,000 小時出現微細裂紋。'], ['', '1 Day', '一天完工', '底漆免打磨、免丙酮擦拭，沒有面漆要等；養生 5 小時以上後可步行。'], ['約', '0.8 kg/㎡', '標準塗布量', '第一道 0.6 ＋ 第二道 0.2 kg/㎡；每 18 kg 罐可塗 22.5 ㎡。'], ['最多', '5.0 wt%', '硬化促進劑 S', '春秋 2.5 wt%、冬季 5.0 wt%，縮短硬化時間；切勿達 7.5 wt% 以上。']],
  'ux.pictos': [['can', '單液型', '開罐即用的聚氨酯・聚脲塗覆材；添加硬化促進劑 S 或稀釋溶劑 K 依季節調整'], ['roller', '滾塗施工', '底漆與兩道 HG 都以滾筒施作；第二道在塗布時混入骨材形成防滑面'], ['shield', '免面漆', '塗膜本身耐候、耐磨——沒有面漆，也就沒有面漆的重塗週期']],
  'ux.adv.lists': [['應用領域：', ['FRP 陽台、露台的翻新（FU08 工法，{OP55}）', '砂漿、混凝土面（{OP30}）', '既有聚氨酯防水層的層間翻新（{OP30}，層間用）†', '走廊、樓梯等步行面†']], ['產品特性：', ['單液型聚氨酯・聚脲塗覆材', '灰（近似日塗工 N50）、淺灰（近似日塗工 N65）', '18 kg 罐；非特定化學物質障害預防規則適用品', '於 ISO 9001／ISO 14001 認證工廠製造']], ['產品優勢：', ['免面漆（W 的效果）', 'FRP 免打磨、免丙酮擦拭', '1Day 施工', '強韌塗膜、優異耐候性']]],
  'ux.tl.label': '施工步驟', 'ux.tl.title': '逐步施作說明', 'ux.tl.sub': '本情境共 {n} 個步驟，依作業順序排列；點選任一步驟查看型錄的細節。', 'ux.more': '詳細內容…',
  'ux.step': '步驟', 'ux.overview': '概要', 'ux.points': '重點', 'ux.warning': '注意', 'ux.notes': '備註', 'ux.src': '資料來源', 'ux.practice': '† 一般施工實務，非製造商公布的規定；請以標準施工規範書為準。',
  'ux.m3d.label': '3D 模型', 'ux.m3d.title': '以 3D 檢視每一個施工階段',
  'ux.m3d.sub': '選擇施工情境與階段，再拖曳旋轉、放大查看細節。透視模式讓基材與既有防水層變透明，可看見塗層如何覆蓋裂縫、翻上立面、避開排水口。',
  'ux.m3d.stages': ['現況', '基材處理完成', '底漆', '下地調整', '第一道', '第二道＋骨材', '端末處理・完工'],
  'ux.m3d.xray': '透視模式', 'ux.m3d.reset': '重設視角', 'ux.m3d.zin': '放大', 'ux.m3d.zout': '縮小', 'ux.tl.prev': '上一組步驟', 'ux.tl.next': '下一組步驟', 'ux.m3d.hint': '拖曳旋轉 · Shift＋拖曳平移 · Ctrl＋滾輪縮放', 'ux.m3d.aria': 'FU08 工法的互動式 3D 模型', 'ux.m3d.micro': '微觀尺度',
  'ux.sec.aria': '構件的 3D 剖面，逐階段呈現', 'ux.sec.hint': '構件剖面 · 拖曳旋轉', 'ux.hero.hint': '拖曳旋轉 · 點選步驟編號', 'ux.hero.aria': 'FU08 工法的 3D 樣板：六段工序並列',
  'ux.m3d.fallback': '3D 檢視需要 WebGL 並連線載入 three.js。系統構成的階段圖以示意圖呈現相同的順序。',
  'ux.m3d.microNote': '微觀尺度：塗層界面剖切試體的示意放大圖，未按比例。每一階段會播放一段短動畫。', 'ux.m3d.microBuild': '正在建立微觀尺度模型…',
  'ux.m3d.microSub': { frp: '微觀尺度呈現粉化的 FRP 面漆表層、滲入其中的 {OP55}、填平表面的第一道 {HG}、混有骨材的第二道，以及在塗層下張開卻於表面保持封閉的細裂縫——強韌塗膜（斷裂伸長率 470%）的橋接。', mortar: '微觀尺度呈現砂漿表皮的孔隙、滲入孔隙的 {OP30}、填平孔隙的第一道 {HG}、混有骨材的第二道，以及在塗層下張開的細裂縫。', roof: '微觀尺度呈現老化聚氨酯防水層的表面、作為層間底漆的 {OP30}、兩道 {HG}，以及在既有防水層中張開、被新塗層橋接的裂縫。' },
  'ux.m3d.co': { frp: [['清掃就是全部的基材處理', 'FRP 面不打磨、不用丙酮擦拭：以抹布、掃帚除去塵土、油分與砂粒，髒污嚴重時用 {CTA}，確認完全乾燥。不陸與裂縫在底漆之後、第一道之前以 {NBQ} 填補（約 1 h 後即可上塗）；塗膜端部最後以 {EX} 收邊。'], ['底漆，然後兩道', '{OP55} 滾塗 0.15 kg/㎡，開放時間夏季 15 分鐘以上、冬季 30 分鐘以上；{HG} 第一道 0.6 kg/㎡，第二道 0.2 kg/㎡ 並在塗布時添加骨材（每 1 kg 50–100 g）。'], ['養生，然後走上去', '塗布後靜置養生 5 小時以上即可步行。沒有面漆：塗膜本身就是耐候、耐磨的面。「完工」階段顯示乾燥後的防滑面。']],
    mortar: [['砂漿面的底漆', '{OP30} 是防水材用的砂漿基材底漆（一般混凝土及層間用），滾塗 0.15 kg/㎡（16 kg 罐約 106.6 ㎡）。基材須乾燥、附著牢固；裂縫與不陸在底漆之後以 {NBQ} 填補、抹平；塗膜端部最後以 {EX} 收邊。'], ['與 FRP 相同的兩道', '{HG} 第一道 0.6 kg/㎡、第二道 0.2 kg/㎡＋骨材；完成膜厚 0.5 mm。塗層沿牆腳翻上（高度依現場規範）†。'], ['養生後開放', '養生 5 小時以上後可步行。走廊、樓梯等步行面以第二道的骨材形成防滑面。']],
    roof: [['既有防水層的層間', '{OP30} 可作層間用底漆（製造商產品頁）；既有聚氨酯防水層的附著性、膨脹與剝離處先確認並處理†。清掃後滾塗 0.15 kg/㎡。'], ['翻上女兒牆，避開排水口', '每一道 {HG} 都沿女兒牆翻上（立上高度依現場規範）†，排水口周圍留出或依排水口做法處理†。塗布量與地坪相同：0.6 ＋ 0.2 kg/㎡。'], ['養生後開放', '養生 5 小時以上後可步行；屋頂設備、步道的荷載依規範確認†。']] },
  'ux.lb': { wash: '高壓水洗（必要時）', dryP: '完全乾燥', meter: '含水率計：< 8%', blast: '噴砂／研磨：除去弱層與粉塵', vac: '吸塵、清掃', repairM: '砂漿補修：欠損與不陸', cutB: '切除膨脹、剝離處', sealN: 'NON-BLEED QUICK 三角填角：入隅', sealNC: 'NON-BLEED QUICK：裂縫填實', cornerN: 'NON-BLEED QUICK：轉角', gunN: '打膠槍：NON-BLEED QUICK', recoat1: '填充後約 1 h 可上塗', c2p: 'UREAX-HG 第二道 0.6 kg/㎡', c3: 'UREAX-HG 第三道 0.6 kg/㎡', gripL: '防滑層：HG 0.2 kg/㎡ ＋ 珪砂', termE: 'EXCEED 端末處理', gunE2: '打膠槍：EXCEED 320 ml', rebar: '鋼筋（RC 樓板・牆）', insp: '檢查：漏塗、針孔 → 補修', interval: '工程間隔 3–10 h', walk24: '最終工程後 24 h', sealE: 'EXCEED 三角填角：牆腳接合部', sealC: 'EXCEED：裂縫填實', corner: 'EXCEED：轉角密封', gunE: '打膠槍：EXCEED 320 ml 卡匣', toolE: '抹刀抹平成三角填角', tack: '表面乾燥後再塗第一道', frp: '既有 FRP 防水層（面漆粉化）', chalk: '面漆粉化、褪色', crackF: '裂縫', puddle: '積水', door: '陽台門、門檻', railing: '欄杆', drainF: '排水口', wallF: '外牆與立上部', dust: '塵土、砂粒、油分', clean: '清掃：抹布、掃帚', dry: '確認完全乾燥', sealQ: 'EXCEED：裂縫填實', prim55: 'OP-55F 0.15 kg/㎡，免打磨', prim30: 'OP-30B 0.15 kg/㎡', open: '開放時間：夏 ≥15 min・冬 ≥30 min', c1: 'UREAX-HG 第一道 0.6 kg/㎡', c2: 'UREAX-HG 第二道 0.2 kg/㎡＋骨材', agg: '骨材 50–100 g／kg HG', mix: '骨材加入罐中攪拌均勻', cure: '養生 ≥5 h', walk: '可步行、開放使用', rollP: '滾筒塗布底漆', rollC: '滾筒塗布', broomC: '清掃中', gunQ: '打膠槍：EXCEED', acc: '硬化促進劑 S：春秋 2.5 / 冬 5.0 wt%', film: '完成膜厚 0.5 mm', skirt: '塗層翻上立面', parapet: '女兒牆', gully: '排水口周圍', ure: '既有聚氨酯防水層（老化）', blister: '膨脹、剝離處', mortar: '砂漿面', crackM: '裂縫', window: '窗', handrail: '扶手', dryF: '乾燥中（無光澤）', wet: '塗布後（濕潤光澤）', pot: '盆栽', gritS: '防滑面' },
  'ux.sim.label': '1Day 工期模擬', 'ux.sim.title': '今天能不能完工，今天能不能走上去', 'ux.sim.sub': '現場溫度、硬化促進劑用量與開工時間 → 今天的作業時鐘與背後的硬化曲線。作業時數依型錄工程圖的典型陽台為基準，按面積與人數換算；視為規劃用的推估值。',
  'ux.sim.season': '季節／現場溫度', 'ux.sim.seasonNote': '型錄提供 5 °C、20 °C、35 °C（50% RH）三種條件的硬化曲線。', 'ux.sim.acc': '硬化促進劑 S（wt%）', 'ux.sim.accNote': '型錄建議：春秋 2.5 wt%、冬季 5.0 wt%。切勿達 7.5 wt% 以上——會損及性能。',
  'ux.sim.start': '開工時間', 'ux.sim.area': '面積（㎡）', 'ux.sim.crew': '人數', 'ux.sim.chart': '硬化深度對時間', 'ux.sim.chartNote': '硬化深度（mm）對時間，依所選條件讀自型錄曲線；虛線為 0.5 mm 完成膜厚。讀值為近似。', 'ux.sim.gantt': '作業時數比較（推估，小時）', 'ux.sim.timeline': '今天的作業時鐘',
  'ux.sim.seasons': [['spring', '春・秋 20 °C'], ['summer', '夏 35 °C'], ['winter', '冬 5 °C']], 'ux.sim.accs': [['0', '無添加'], ['2.5', '2.5 wt%'], ['5', '5.0 wt%']],
  'ux.sim.tl': [['清掃・周邊養生', '除去塵土、油分、砂粒；確認乾燥'], ['底漆塗布', '{primer} 滾塗 0.15 kg/㎡'], ['底漆開放時間', '夏 ≥15 min・冬 ≥30 min'], ['接縫密封 EXCEED', '牆腳、轉角、裂縫打膠抹平；表乾後塗第一道'], ['HG 第一道', '0.6 kg/㎡，一般面'], ['HG 第二道＋骨材', '0.2 kg/㎡，防滑面'], ['靜置養生', '5 小時以上後方可步行']],
  'ux.sim.ok': '今天可以完工並開放步行', 'ux.sim.late': '養生會跨到隔日', 'ux.sim.verdict': '完工 {finish}，可步行 {walk}（養生 5 小時以上）。依 {cond} 的硬化曲線，0.5 mm 膜厚約於塗布後 {cure} 達到硬化深度。', 'ux.sim.noCurve': '型錄未提供此組合的硬化曲線。', 'ux.sim.tip': '提示：改用 {acc} 促進劑或提早開工，可把可步行時間拉回當天。',
  'ux.sim.k': [['完工', '最後一道塗完'], ['可步行', '養生 ≥5 h 之後'], ['0.5 mm 硬化', '依型錄曲線']],
  'ux.sim.gantt.rows': [['FRP 防水（1 ply）', '打磨、丙酮擦拭、面漆'], ['UREAX-HG', 'FU08 工法'], ['FRP 面漆重塗', '僅換面漆']], 'ux.sim.gantt.legend': [['g', '基材處理'], ['p', '底漆塗布'], ['o', '開放時間'], ['n', '防水材塗布'], ['tc', '面漆']],
  'ux.prod.label': '產品資料', 'ux.prod.title': 'FU08 工法的產品', 'ux.prod.sub': '製造商產品頁與型錄的資料。選擇一項產品。',
  'ux.prod.pack': '包裝', 'ux.prod.colour': '色調', 'ux.prod.kind': '材質／種類', 'ux.prod.use': '主要用途', 'ux.prod.role': '在系統中的角色', 'ux.prod.areas': '應用領域', 'ux.prod.adv': '產品優勢', 'ux.prod.feat': '產品特性', 'ux.prod.data': '技術資料（型錄）', 'ux.prod.safety': '處理與安全（SDS）', 'ux.prod.dl': '文件', 'ux.prod.page': 'autochem.co.jp 產品頁', 'ux.prod.src': '資料來源：Auto Chemical 型錄（2024.02）、autochem.co.jp 產品頁、SDS。使用前請詳閱 SDS。', 'ux.prod.rate': '塗布量與可塗面積',
  'ux.cert.title': '認證與登錄（F☆☆☆☆・4VOC）', 'ux.cert.sub': '日本各工業會的甲醛揮發自主管理等級 F☆☆☆☆（最高等級）登錄；證書由代理商提供。', 'ux.cert.heads': ['產品', '登錄號', '等級', '登錄單位', '有效期／確認日'], 'ux.cert.names': { HG: 'AUTON UREAX-HG（オートンウレアックスHG）', EX: 'AUTON EXCEED（オートンイクシード）', OP2019: 'OP-2019 底漆', OP2020: 'OP-2020 底漆', NB101: 'AUTON SEALER 101A NON-BLEED', CLIO: 'AUTON CLIO NEO', NBQ: 'AUTON NON-BLEED QUICK（接著劑）', ULTRA: 'AUTON ULTRACOAT（現 PROTECT ONE）', ULTRA4: 'AUTON ULTRACOAT（現 PROTECT ONE）· 4VOC 基準適合' },
  'ux.co.title': '製造商', 'ux.co.text': 'AUTO CHEMICAL INDUSTRY CO., LTD.（オート化学工業株式会社）：1965 年創立，總部東京上野；土浦工場（1970）與北茨城工場（1994）為日本聚氨酯系密封材產量與設備的頂尖規模，原料樹脂合成到充填包裝一貫生產；1976 年取得美國 DuPont 一成分形聚氨酯密封材製造銷售實施權；土浦工場 JIS（1986）、北茨城工場 JIS（1995）、ISO 9001（2000）、ISO 14001（2006）。主力產品：建築・土木・工業用密封材、防水材、接著劑，以及塗料用中間原料樹脂。',
  'ux.dl.tds': '技術資料（Good Startup 繁體中文版）', 'ux.dl.excat': 'EXCEED 產品型錄（PDF，日文）', 'ux.dl.vid1': '影片：EXCEED PV（短版，6:29）', 'ux.dl.vid2': '影片：EXCEED PV 完整版（含公司介紹）', 'ux.dl.brochure': 'UREAX-HG 繁體中文型錄（2023.11）', 'ux.dl.jis': 'JIS A 6021 原廠試驗報告（2025.08）', 'ux.qa.label': '品質保證', 'ux.qa.title': '施工前確認與保證檢核表', 'ux.qa.sub': '製造商發行的專案限定型製品保證（材料保證 10 年）以標準施工規範與檢核表為前提；下列項目由現場責任者在開工前實測、記錄。',
  'ux.qa.rows': [['施工日時・天候', '晴或陰；無降雨風險；雨天或朝露未乾時禁止施工'], ['現場氣溫', '5 °C ～ 35 °C'], ['相對濕度', '≤ 80% RH（建議）'], ['下地含水率', '< 8%（未達乾燥即強行施工為保證除外）'], ['下地清掃狀態', '粉塵、油污、滯留水除去；基材強韌、清潔'], ['下地處理材', '轉角、裂縫補修、配管周圍：AUTON NON-BLEED QUICK（製造商指定）'], ['端末處理材', '防水塗膜端末：AUTON EXCEED（製造商指定）'], ['氣體干擾', '現場不得混用他牌矽利康、變性矽利康等產生醇類氣體的材料'], ['各工程用量', '記錄面積與用量，換算平均塗布量：底漆 0.15、HG 0.6、HG 0.6、防滑層 0.2 kg/㎡（基準）'], ['稀釋劑・促進劑', '甲苯、二甲苯、PMA；硬化促進劑 S——各 ≤ 7.5%'], ['紀錄', '含 LOT 的產品照片、完工多處照片、特記事項（排水坡度不良、跨日打繼、突發降雨處置）']],
  'ux.qa.heads': ['確認項目', '製造商基準／判定'], 'ux.qa.warranty': '保證除外（摘要）：平均塗布量未達最低基準造成的膜厚不足與破斷；含水率 ≥ 8% 強行施工；使用醇類／酮類溶劑或促進劑過量造成的硬化不良；未使用指定密封材而混用他牌矽利康／變性矽利康造成的未硬化；基材本身的瑕疵、含水引起的水蒸氣頂起、青苔藻類、外部污染。', 'ux.qa.dl': '施工記錄及檢核表、標準施工規範、TDS、保證書：向 Good Startup 索取（日文版；繁體中文版備有）。',
  'ux.sim.tl2': { clean: ['基材處理', '清掃、高壓水洗、乾燥、含水率 < 8%'], primer: ['底漆塗布', '{primer} 滾塗 0.15 kg/㎡'], open: ['底漆開放時間', '30 分（施工規範）；夏 ≥15 min・冬 ≥30 min'], seal: ['下地調整 NBQ', '入隅、轉角、裂縫、排水口周圍；約 1 h 後可上塗'], coat1: ['HG 第一道', '0.6 kg/㎡'], coat2: ['HG 第二道＋骨材', '0.2 kg/㎡，防滑面'], coat2p: ['HG 第二道', '0.6 kg/㎡（工程間隔 3–10 h）'], coat3: ['HG 第三道', '0.6 kg/㎡（要求膜厚）'], grip: ['防滑層', 'HG 0.2 kg/㎡ ＋ 珪砂（間隔 24 h）'], term: ['端末處理 EXCEED', '塗膜端部封邊'], cure: ['靜置養生', '5 小時以上後方可步行'], cure24: ['最終工程後養生', '24 h 後開放'], wait: ['等待硬化（工程間隔）', '依早見表：0.5 mm 硬化後再塗'] }, 'ux.sim.stdOk': '{spec}：{d} 個工作日；最後一道後 24 h（{walk}）開放', 'ux.sim.stdVerdict': '{cond} 早見表：0.5 mm 硬化約 {cure}，工程間隔取 {ivl}（施工規範 3–10 h）；最後一道於 {finish} 完成。', 'ux.sim.day': '第 {d} 天', 'ux.sim.specNote': '標準規格的工程間隔取早見表「0.5 mm 硬化」的時間（3–10 h）；超過當日作業時間則排到隔日。最終工程後 24 h 開放。',
  'ux.dl.cat': 'UREAX-HG 產品型錄（PDF，4 頁，2024.02）', 'ux.dl.sds': 'SDS（PDF）', 'ux.dl.all': '各種商品型錄・防水材', 'ux.dl.sdsAll': 'SDS 一覽・防水材',
  'ux.calc.label': '估算報價', 'ux.calc.title': '用量估算與報價單', 'ux.calc.sub': '由面積算出主材罐數、底漆、促進劑與骨材；單價由你填入，只存在這部瀏覽器。A4 報價單可下載為 HTML 或 CSV。',
  'ux.q.s1': '1 · 案件', 'ux.q.client': '客戶', 'ux.q.site': '工地', 'ux.q.ref': '報價編號', 'ux.q.date': '日期',
  'ux.q.s2': '2 · 面積與基材', 'ux.q.area': '地坪面積（㎡）', 'ux.q.up': '立上高度（m）', 'ux.q.per': '立上長度（m）', 'ux.q.substrate': '基材', 'ux.q.waste': '損耗率（%）', 'ux.q.season': '季節（促進劑用量）', 'ux.q.agg': '第二道骨材（g／kg HG）',
  'ux.q.subs': [['frp', 'FRP（OP-55F）'], ['concrete', '砂漿／混凝土（OP-30B）'], ['urethane', '既有聚氨酯層間（OP-30B）']],
  'ux.q.s3': '3 · 單價與工資', 'ux.q.cur': '幣別', 'ux.q.tax': '稅率（%）', 'ux.q.rate': '工資（每人・小時）', 'ux.q.hours': '工時（人・小時）', 'ux.q.hoursNote': '預設帶入模擬器的人數 × 作業時間；可自行修改。', 'ux.q.misc': '其他費用（金額）', 'ux.q.notes': '報價備註',
  'ux.q.priceHead': ['品項', '包裝', '單價'], 'ux.q.prices': '單價由報價人填入；製造商未公布售價。',
  'ux.q.dlHtml': '下載報價單（HTML）', 'ux.q.dlCsv': '下載 CSV', 'ux.q.copy': '複製文字', 'ux.q.example': '範例數值——請換成你的案件。',
  'ux.q.kpi': [['主材', 'UREAX-HG 18 kg 罐'], ['底漆', '罐'], ['密封材', 'NBQ ＋ EXCEED 卡匣'], ['合計（含稅）', '{cur}']],
  'ux.q.title': '報價單', 'ux.q.subtitle': 'AUTON UREAX-HG・FU08 工法', 'ux.q.items': '品項', 'ux.q.pack': '包裝', 'ux.q.qty': '數量', 'ux.q.unit': '單價', 'ux.q.amount': '金額', 'ux.q.material': '材料', 'ux.q.labour': '工資與其他', 'ux.q.subtotal': '小計', 'ux.q.taxRow': '稅額', 'ux.q.total': '合計',
  'ux.q.joint': '下地調整接縫長度（m）', 'ux.q.jointNote': 'NON-BLEED QUICK：入隅＋轉角＋裂縫＋排水口周圍的合計長度；預設為立上長度。', 'ux.q.bead': '三角填角尺寸（mm）', 'ux.q.term': '端末處理長度（m）', 'ux.q.termNote': 'EXCEED：塗膜端部（立面上端等）長度；預設為立上長度。', 'ux.q.spec': '塗布規格', 'ux.q.grip': '防滑層', 'ux.q.basis': '計算依據', 'ux.q.basisText': '塗布面積 {area} ㎡（地坪 {floor} ㎡＋立上 {up} ㎡）；損耗 {waste}%。規格：{spec}——地坪每道 {rates} kg/㎡、立面每道 {uprates} kg/㎡{gripTxt}；底漆 {primer} 0.15 kg/㎡；硬化促進劑 S {acc} wt%。NON-BLEED QUICK 三角填角 {bead} mm，接縫 {joint} m（{cart} 支）；EXCEED 端末處理 {term} m（{tcart} 支，2.7 m／支）。',
  'ux.q.notesTitle': '備註', 'ux.q.defaultNotes': ['數量以 Auto Chemical 標準施工規範（2026/8/6）與型錄的標準塗布量計算，並向上取整至整罐；實際用量依基材狀況而異。', '施工前請確認標準施工規範與保證檢核表：氣溫 5–35 °C、RH ≤ 80%、下地含水率 < 8%；底漆開放時間 30 分；工程間隔依硬化促進劑早見表；最終工程後 24 h（FU08：養生 5 h 可步行）。', '本報價有效期 30 天。價格未含運費，除非另有註明。'],
  'ux.q.sign': '客戶確認', 'ux.q.by': '報價人', 'ux.q.dist': '台灣認定代理商 Good Startup LTD.（好時新創有限公司）',
  'ux.q.items.n': { NBQ: 'NON-BLEED QUICK 下地調整材（320 ml 卡匣）', EX: 'EXCEED 端末處理密封材（320 ml 卡匣）', HG: 'UREAX-HG 灰／淺灰', OP55: 'OP-55F 底漆（FRP）', OP30: 'OP-30B 底漆（砂漿／混凝土・層間）', ACC: '硬化促進劑 S', AGG: '骨材（防滑用）', SOLV: '稀釋溶劑 K（選用）', labour: '施工工資', misc: '其他' },
  'ux.q.packs': { NBQ: '320 ml 卡匣', EX: '320 ml 卡匣', HG: '18 kg 罐', OP55: '16 kg UN 罐', OP30: '16 kg 罐', ACC: '800 g 瓶', AGG: 'kg', SOLV: '3.5 kg 罐', labour: '人・小時', misc: '式' },
  'ux.cmp.label': '產品比較', 'ux.cmp.title': 'UREAX 系列與相關產品一覽', 'ux.cmp.sub': 'FU08 工法會用到的 Auto Chemical 產品，依製造商產品頁整理。',
  'ux.cmp.heads': ['產品', '種類', '用途', '包裝', '色調', '塗布量／添加量', '備註'],
  'ux.cmp.rows': [['{HG}', '單液型聚氨酯・聚脲塗覆材（高強度）', '兼具塗料與防水性能的高強度塗覆材；FRP 陽台・露台翻新', '18 kg 罐', '灰（≈N50）、淺灰（≈N65）', '0.6 ＋ 0.2 kg/㎡；每罐 22.5 ㎡', '免面漆；1Day 施工'], ['{NBQ}', '一液速乾型聚氨酯下地調整材', '入隅・出隅、裂縫補修、排水口周圍（由塗膜被覆）', '320 ml 卡匣 × 10', '灰', '10 × 10 mm 填角約 0.05 L/m；約 1 h 可上塗', '製造商指定（保證條件）；F☆☆☆☆'], ['{EX}', '一液高耐候・高耐久聚氨酯密封材（LS 聚合物）', '塗膜端末處理（立面上端、塗膜端部）；外裝接縫', '320 ml 卡匣／6 L 桶', '多色（本系統用灰）', '10 × 10 mm 密封條每卡匣約 2.7 m（含損耗 20%）', '免塗膜被覆、耐用約 30 年；ASTM C920 class 50；F☆☆☆☆'], ['{OP2019}', '溶劑型單液濕氣固化聚氨酯底漆', 'EXCEED 專用底漆（金屬、PVC、FRP 等收邊）', '100 ml（隨卡匣附）、3.2 kg 罐', '—', '乾固 15–30 分鐘；固形分 33%', 'F☆☆☆☆ JSIA-001024'], ['{OP55}', '單液聚氨酯底漆', 'FRP、PVC 等；防水材用 FRP 底漆', '16 kg UN 罐', '淡黃色', '0.15 kg/㎡；每罐 106.6 ㎡', 'FRP 免打磨即可疊塗；Auto Chemical 防水材專用'], ['{OP30}', '單液聚氨酯底漆', '一般混凝土及層間用；砂漿基材', '16 kg 罐', '淡黃色', '0.15 kg/㎡；每罐 106.6 ㎡', 'Auto Chemical 防水材專用'], ['{ACC}', 'UREAX 專用硬化促進劑', '縮短 HG 的硬化時間', '800 g 瓶（附計量蓋）× 6 瓶/箱', '乳白色', '冬 5.0 wt%・春秋 2.5 wt%', '切勿達 7.5 wt% 以上'], ['{SOLV}', 'UREAX 專用環保型稀釋溶劑', '調整 HG 黏度', '3.5 kg 罐', '無色透明', '重量比 7.5% 以內', '切勿達 7.5 wt% 以上'], ['{CTA}', '清潔・除去劑', '除去金屬等上的底漆、樹脂污染、殘膠', '250 ml × 2 罐（附布、刷）', '—', '依需要', '對已硬化的底漆亦有效；先確認對基材的影響']],
  'ux.rel.title': '相關指南與頁面', 'ux.rel.sub': '同一代理商的其他指南，以及製造商網站上的頁面。',
  'ux.rel.rows': [['{PO}', '濕氣硬化型聚脲聚氨酯透明塗覆劑：砂漿、石板瓦、陽極鋁、硬質 PVC、ALC 的保護——本站的第二本指南。', '開啟指南', '#/protect-one'], ['{EX}', '一液高耐候・高耐久聚氨酯密封材：本系統塗膜端末處理（收邊）的指定密封材；製造商產品頁與影片。', '製造商產品頁', AC + '/929/'], ['{CTA}', '清掃・除去・剝離劑：髒污嚴重的 FRP 面清潔用。', '製造商產品頁', AC + '/1088/'], ['UREAX 系列', '製造商網站的 UREAX 系列產品一覽。', '製造商頁面', AC + '/products/waterproofing/ureax/']],
  'ux.cta.sub': '你的陽台、露台、屋頂翻新工程', 'ux.cta.desc': '台灣的技術諮詢、型錄、樣品與報價，請洽 Auto Chemical 台灣認定代理商 Good Startup LTD.。', 'ux.cta.page': 'autochem.co.jp 的 UREAX-HG 產品頁'
};
ACS_T.zh = {
  frp: { name: 'FRP 陽台・露台翻新', problem: '既有 FRP 防水層的面漆粉化、褪色，出現細裂縫，低處積水。傳統做法要打磨、丙酮擦拭、重做面漆——粉塵、噪音、溶劑味，而且要等面漆乾。', solution: 'FU08 工法：清掃後以專用底漆 {OP55} 滾塗（免打磨），底漆後以 {NBQ} 填補不陸與裂縫（下地調整），{HG} 塗布兩道（0.6＋0.2 kg/㎡，第二道添加骨材），養生 5 小時以上即可步行。沒有面漆。' },
  mortar: { name: '砂漿・混凝土面（走廊・陽台）', problem: '砂漿面或混凝土面的陽台、走廊、樓梯平台：吸水、起砂、有裂縫；需要一個耐步行磨耗、耐候的防水面，而且不能封閉太多天。', solution: '{OP30}（防水材用砂漿基材底漆，0.15 kg/㎡）滾塗後，裂縫與不陸以 {NBQ} 填補（下地調整），{HG} 塗布兩道並在第二道添加骨材形成防滑面；養生 5 小時以上後開放步行。' },
  roof: { name: '屋頂平場・既有聚氨酯防水層翻新', problem: '屋頂既有聚氨酯塗膜防水層老化：面漆粉化、局部膨脹與剝離，女兒牆立上部與排水口周圍是弱點。', solution: '附著牢固的既有防水層清掃後以 {OP30}（層間用）打底†，膨脹剝離處先切除修補†；{HG} 兩道沿女兒牆翻上、避開排水口†；養生 5 小時以上後可步行。' },
  layers: {
    prim55: ['專用底漆（FRP 用）', '清潔乾燥的 FRP 面上滾塗；免打磨、免丙酮擦拭', '底漆薄膜', '0.15 kg/㎡（每 16 kg UN 罐 106.6 ㎡）', '開放時間夏 ≥15 min・冬 ≥30 min，之後塗第一道', '單液，開罐即用'],
    prim30: ['防水材用底漆（砂漿・混凝土・層間）', '清潔乾燥的基材上滾塗', '底漆薄膜', '0.15 kg/㎡（每 16 kg 罐 106.6 ㎡）', '開放時間夏 ≥15 min・冬 ≥30 min，之後塗第一道', '單液，開罐即用'],
    seal: ['下地調整材（入隅・出隅、裂縫、排水口周圍）', '底漆後、第一道前：牆腳入隅、轉角、裂縫與排水口周圍以 {NBQ} 打膠、抹平成三角填角；之後由 HG 塗膜被覆', '三角填角約 10 × 10 mm', '約 0.05 L/m（10 mm 填角）；320 ml 卡匣約 6 m', '填充後約 1 小時即可塗第一道', '一液速乾型，開匣即用（打膠槍）'],
    c2p: ['第二道（一般面）', '第一道硬化後（3–10 h）滾塗第二道', '2 道合計 1.2 kg/㎡ ≈ 0.83 mm', '0.6 kg/㎡（491.8 ml/㎡）', '第三道（要求膜厚時）或防滑層，否則最終工程後 24 h', '單液；依季節添加硬化促進劑 S'],
    c3: ['第三道（依要求膜厚調整）', '第二道硬化後（3–10 h）滾塗', '3 道合計 1.8 kg/㎡ ≈ 1.25 mm', '0.6 kg/㎡（491.8 ml/㎡）', '最終工程後 24 h', '單液；依季節添加硬化促進劑 S'],
    grip: ['防滑層（選用）', '塗布時添加珪砂，滾塗', '薄層', '0.2 kg/㎡（163.9 ml/㎡）；珪砂 50–100 g／kg HG，粒徑約 0.35–0.5 mm', '24 h', 'HG ＋ 珪砂攪拌均勻'],
    term: ['端末處理（EXCEED）', '塗膜完成後，立面上端與塗膜端部以 {EX} 打膠封邊——不需塗膜被覆也耐久', '10 × 10 mm 密封條', '每 320 ml 卡匣約 2.7 m（含 20% 損耗，TDS 表）', '指觸乾燥 5 h（23 °C）・24 h（5 °C）；完全硬化 3–7 天', '一液型，開匣即用'],
    c1: ['第一道（一般面）', '滾塗或鏝塗均勻施作', '兩道合計 0.5 mm', '0.6 kg/㎡', '第二道（1Day 工法內接續施作）', '單液；依季節添加硬化促進劑 S（春秋 2.5、冬 5.0 wt%）'],
    c2: ['第二道（防滑面）', '塗布時添加骨材，滾塗', '兩道合計 0.5 mm（完成膜厚）', '0.2 kg/㎡；骨材每 1 kg HG 50–100 g', '養生 ≥5 h 後可步行', 'HG＋骨材攪拌均勻'],
    c1r: ['第一道（一般面），翻上女兒牆', '滾塗；立上部以刷或短毛滾筒塗布†', '兩道合計 0.5 mm', '0.6 kg/㎡', '第二道（1Day 工法內接續施作）', '單液；依季節添加硬化促進劑 S'],
    c2r: ['第二道（防滑面），翻上女兒牆', '塗布時添加骨材，滾塗', '兩道合計 0.5 mm（完成膜厚）', '0.2 kg/㎡；骨材每 1 kg HG 50–100 g', '養生 ≥5 h 後可步行', 'HG＋骨材攪拌均勻']
  },
  stages: { state: '現況', prep: '基材處理完成', prime: '底漆', seal: '下地調整 NBQ', coat1: '第一道', coat2: '第二道＋骨材', coat2p: '第二道', coat3: '第三道', grip: '防滑層＋珪砂', done: '端末處理・完工' }
};
ACP_T.zh = {
  HG: { sub: '單液型聚氨酯・聚脲塗覆材（高強度）', pack: '18 kg 罐', colour: '灰（近似日塗工 N50）、淺灰（近似日塗工 N65）', kind: '單液型聚氨酯・聚脲塗覆材', use: 'FRP 陽台・露台的翻新；兼具塗料與防水性能的高強度塗覆材',
    role: '系統的主材：依規格滾塗 2–3 道（每道 0.6 kg/㎡；FU08 型錄工法 0.6 ＋ 0.2）形成複合式防水塗膜，同時是耐候、耐磨的完成面（免面漆）。防滑面為選用：HG 0.2 kg/㎡ ＋ 珪砂。依季節添加硬化促進劑 S，黏度高時以甲苯、二甲苯或 PMA 稀釋（皆 ≤ 7.5 wt%；醇類、酮類、酯類禁用）。',
    areas: ['FRP 陽台、露台的翻新（FU08 工法）', '砂漿、混凝土面（搭配 {OP30}）', '既有聚氨酯防水層的層間翻新†'], adv: ['免面漆（W 的效果：表面保護＋防水）', '強韌的塗膜：Shore A 95、抗拉 17 N/mm²、伸長 470%', '優異耐候性：6,000 h 無異常', '1Day 施工'], feat: ['F☆☆☆☆（NUK-F15829）', '18 kg UN 罐', '單液型，開罐即用', '塗布量 0.8 kg/㎡（0.6＋0.2）', '完成膜厚 0.5 mm', '非特定化學物質障害預防規則適用品'],
    data: [['理論膜厚', '0.1 kg/㎡ ＝ 0.0695 mm（施工規範）；硬化物密度 1.31'], ['指觸乾燥時間（JIS A 1439）', '60 min（23 °C 50% RH）・240 min（5 °C 50% RH）'], ['耐熱・耐溫水・耐鹼・耐酸（JIS K 6251，28 天）', '抗拉約 20 N/mm²、伸長約 400% 維持（TDS 圖）'], ['稀釋劑適合性', '甲苯、二甲苯、PGMAC(PMA) ○；甲醇、乙醇、IPA、丙酮、MEK、乙酸乙酯 ×；添加 ≤ 7.5 wt%'], ['立面塗布量', '每道 0.4 kg/㎡（不流掛基準）'], ['JIS A 6021 原廠試驗・抗拉強度（23 °C）', '17 N/mm²（規格 ≥10）'], ['JIS A 6021 原廠試驗・斷裂伸長率', '470%（規格 ≥200）'], ['JIS A 6021 原廠試驗・抗張積', '1600 N/mm（規格 ≥700）'], ['JIS A 6021 原廠試驗・夾具間伸長率', '305%（規格 ≥120）'], ['JIS A 6021 原廠試驗・撕裂強度', '59 N/mm（規格 ≥30）'], ['JIS A 6021 原廠試驗・加熱伸縮率', '−0.3%（規格 −1.0～1.0）'], ['固化後適應溫度', '−20 °C～80 °C（JIS A 6021）'], ['認證', 'F☆☆☆☆ NUK-F15829（日本ウレタン建材工業会）'], ['液狀性狀・黏度（25 °C）', '3,000 mPa·s'], ['液狀性狀・比重（23 °C）', '1.22'], ['液狀性狀・不揮發分', '91%'], ['橡膠物性・硬度（Shore A）', '95'], ['橡膠物性・抗拉強度', '17 N/mm²'], ['橡膠物性・斷裂伸長率', '470%'], ['橡膠物性・抗張積', '1600 N/mm'], ['耐候性（開放式碳弧燈，0.5 mm）', '4,000 h・6,000 h 無異常；8,000 h 微細裂紋'], ['落球衝擊', '無異常'], ['標準塗布量', '0.8 kg/㎡（第一道 0.6、第二道 0.2）'], ['可塗面積', '22.5 ㎡／18 kg 罐'], ['完成膜厚', '0.5 mm'], ['養生', '5 小時以上後可步行'], ['硬化促進劑 S 添加量', '春秋 2.5 wt%・冬 5.0 wt%（未達 7.5%）']],
    rate: [['第一道（一般面）', '0.6 kg/㎡', '≈30 ㎡／罐'], ['第二道（防滑面）', '0.2 kg/㎡＋骨材', '≈90 ㎡／罐'], ['兩道合計', '0.8 kg/㎡', '22.5 ㎡／罐']],
    safety: [['GHS 分類', '圖示：火焰。信號詞：警告。H226 易燃液體及蒸氣；H361 懷疑對生育能力或胎兒造成傷害；H373 長期或反覆暴露可能對器官造成傷害'], ['物理性狀', '黏稠液體、表示色、特有臭；密度 1.22 g/cm³（25 °C）；閃火點 36 °C（Seta 閉杯）'], ['主要成分（SDS）', '鄰苯二甲酸二異壬酯 5.4–6.0%、氧化鈦(IV) 5.3%、硫酸鋇 2.4%、碳酸二甲酯 0.89%、碳黑 0.10–0.22%'], ['處理', '勿吸入霧滴、蒸氣、噴霧；於室外或通風良好處作業；避免接觸眼睛與皮膚；遠離熱、火花、明火、高溫；穿戴手套、護目鏡、防護口罩'], ['保管', '容器密閉，置於陰涼通風處；避免直射日光與火源；開封後儘速用完'], ['運輸', 'UN1139，Class 3，包裝等級 III'], ['廢棄', '依當地法規委託合格廢棄物處理業者']] },
  OP55: { sub: '防水材用 FRP 底漆', pack: '16 kg UN 罐', colour: '淡黃色', kind: '單液聚氨酯', use: 'FRP、PVC 及其他',
    role: 'FU08 工法的第一步：FRP 面免打磨、免丙酮擦拭，滾塗 0.15 kg/㎡ 後即可疊塗防水材。開放時間夏季 15 分鐘以上、冬季 30 分鐘以上；在這段時間內以 Qick Sealant 處理不陸與裂縫。Auto Chemical 防水材專用，請勿用於他牌產品。',
    areas: ['既有 FRP 防水層上的翻新', 'PVC 等（依製造商產品頁）'], adv: ['FRP 免打磨即可疊塗——沒有粉塵與噪音', '不需丙酮擦拭', '開罐即用'], feat: ['單液聚氨酯', '淡黃色，可辨識已塗布範圍', '16 kg UN 罐'],
    data: [['標準塗布量', '0.15 kg/㎡'], ['可塗面積', '106.6 ㎡／罐'], ['開放時間', '夏 15 分鐘以上・冬 30 分鐘以上'], ['基材', 'FRP（免打磨）、PVC 及其他'], ['備註', 'Auto Chemical 防水材專用']] },
  OP30: { sub: '防水材用砂漿基材底漆', pack: '16 kg 罐', colour: '淡黃色', kind: '單液聚氨酯', use: '一般混凝土及層間用',
    role: '砂漿、混凝土面與層間（既有防水層上）的底漆：滾塗 0.15 kg/㎡，一罐約 106.6 ㎡。開放時間與 OP-55F 相同。Auto Chemical 防水材專用，請勿用於他牌產品。',
    areas: ['砂漿、混凝土面的陽台、走廊', '層間（既有聚氨酯防水層的翻新）'], adv: ['一罐 16 kg 可塗約 106.6 ㎡', '開罐即用'], feat: ['單液聚氨酯', '淡黃色', '16 kg 罐'],
    data: [['包裝', '3.2 kg／16 kg 桶'], ['固形分', '33%'], ['乾固時間', '15–30 分鐘'], ['密度（液態）', '1.00'], ['保存', '製造日起 12 個月；+5～+25 °C，避免日曬雨淋'], ['固化後適應溫度', '−20～80 °C（JIS A 6021）'], ['施工溫度', '5 °C 以上'], ['接著性（OP-30B／OP-55F）', '砂漿混凝土 ○／○；清水水泥 ○／○；ABS ×／○；FRP ×／○；PE、PP ×／×；PVC 窗框 ○／○；陽極氧化鋁、壓克力・聚酯處理鋁板 ○／○；鍍鋅、鍍鋁鋅、聚酯鋼板 ○／○；304／430 不鏽鋼 ○／○；EPDM ×／×'], ['相容性', '避免醇類溶劑；勿與矽利康、變性矽利康同時使用'], ['標準塗布量', '0.15 kg/㎡'], ['可塗面積', '約 106.6 ㎡／罐'], ['開放時間', '夏 15 分鐘以上・冬 30 分鐘以上'], ['基材', '一般混凝土、砂漿；層間用'], ['備註', 'Auto Chemical 防水材專用']] },
  NBQ: { sub: '下地調整用速乾型聚氨酯密封材', pack: '320 ml 卡匣 × 10／箱', colour: '灰', kind: '一液速乾型聚氨酯', use: '轉角部（入隅・出隅）、裂縫補修、排水口・貫通部周圍的密封——由 UREAX-HG 塗膜被覆',
    role: '標準施工規範指定的下地調整材：底漆後、第一道前，入隅・出隅、裂縫與排水口周圍以 NON-BLEED QUICK 填充、抹平成三角填角。速乾——填充後約 1 小時即可上塗 UREAX-HG；不具自身耐紫外線性，必須由塗膜完全被覆。非滲出型（non-bleed）。',
    areas: ['牆腳入隅、轉角（出隅）', '裂縫補修', '排水口、配管周圍的密封', 'UREAX-HG／PROTECT ONE 系統的下地調整'], adv: ['速乾：約 1 小時後可上塗', '非滲出型，不污染塗膜', '製造商指定——保證條件', 'F☆☆☆☆（JAIA-006864）'], feat: ['一液型，卡匣直接以打膠槍施打', '320 ml 卡匣 × 10／箱', '灰色'],
    data: [['種類', '一液速乾型聚氨酯下地調整材（密封材）'], ['登錄', 'F☆☆☆☆ JAIA-006864（日本接着剤工業会，登錄 2026-04-01，有效至 2029-03-31）'], ['包裝', '320 ml 卡匣 × 10／箱'], ['上塗', '填充後約 1 小時'], ['被覆', '必須由塗膜被覆（無自身耐紫外線性）'], ['三角填角用量', '10 × 10 mm 約 0.05 L/m（320 ml ≈ 6 m）'], ['指定用途', '入隅・出隅、裂縫補修、排水口・配管周圍（保證檢核表）']],
    rate: [['三角填角 10 × 10 mm', '≈0.05 L/m', '≈6 m／卡匣'], ['裂縫填實（約 5 × 8 mm）', '≈0.04 L/m', '≈8 m／卡匣']],
    safety: [['基材', '乾燥、無粉塵、無油分；含水的基材會使密封材隆起'], ['相容性', '未固化時勿接觸醇類、未固化變性矽利康（MS）——固化不良'], ['SDS', '使用前確認 SDS；依當地法規廢棄']] },
  EX: { sub: '一液型聚氨酯接縫密封材（長期耐久型）', pack: '320 ml 卡匣 × 10／箱（附 100 ml OP-2019 底漆 1 罐、刷 1 支）；6 L 桶 × 2／箱（附底漆 4 罐、刷 2 支）', colour: '多色（製造商提供各品牌纖維水泥外牆板的對應色查詢）；本系統選用近似 HG 塗膜的灰色', kind: '聚氨酯系（單成分形）· LS 聚合物配方', use: '牆腳接合部、轉角、門檻與排水口收邊、裂縫的密封；纖維水泥外牆板外裝接縫、PCa 板與 RC 接縫、磁磚與石材接縫',
    role: '底漆後、第一道 UREAX-HG 前的接縫密封材：牆腳（地坪與立面）、轉角與裂縫以 EXCEED 打膠抹平成三角填角，讓塗膜在動態接縫處有彈性的墊底。新開發的「LS 聚合物」不含經年流失的可塑劑，長期保持柔軟；非滲出型，表面可再塗覆；製造商標示耐用年數約 30 年。',
    areas: ['UREAX-HG 系統的牆腳、轉角與裂縫密封', '纖維水泥外牆板外裝接縫', 'PCa 板、RC 接縫', '磁磚、石材接縫'], adv: ['耐用年數約 30 年（製造商標示）', 'LS 聚合物：不含流失型可塑劑，長期維持柔軟', '非滲出型（non-bleed）：表面可塗裝', '高耐久、高耐候', 'F☆☆☆☆（JSIA-001019）'], feat: ['一液型，卡匣直接以打膠槍施打', '320 ml 卡匣／6 L 桶', '附專用底漆 OP-2019 與刷', '以 OP-2019 打底後之接著（JIS A 1439-2022）：M50 0.18 N/mm²、斷裂 1.39 N/mm²、伸長 1,000%、可負載伸縮率 ±25%'],
    data: [['種類', '聚氨酯系（單成分形）· 一液濕氣硬化 · LS 聚合物'], ['規格', 'ASTM C 920 class 50；F☆☆☆☆ JSIA-001019（有效至 2026-08-31）'], ['期待耐用年數', '約 30 年（促進耐候試驗 6,000 h 無異常，相當 30 年）'], ['包裝', '320 ml 卡匣 × 10／箱（附 OP-2019 100 ml、噴嘴 10、刷）；6 L 桶（附 OP-2019 × 2、刷）'], ['保存', '製造日起 12 個月；+5～+25 °C'], ['色調', '色見本帳（多色）；本系統選用近似塗膜的灰'], ['密度／不揮發分', '1.30／95%'], ['硬化物物性', 'Shore A 15；M100 0.24 N/mm²；抗拉 2.37 N/mm²；斷裂伸長 1,135%；彈性復原 > 90%；可負載伸縮率 ±25%'], ['接著（OP-2019，JIS A 1439-2022，H 型）', 'M50 0.18・斷裂 1.39 N/mm²・伸長 1,000%；23 °C 浸水 7 天 0.14／1.04／1,100%；90 °C 14 天 0.25／1.85／880%'], ['指觸乾燥', '5 h（23 °C）・24 h（5 °C）'], ['完全硬化', '3–7 天（23 °C）・17–21 天（5 °C）；完全防水效果需 7 天'], ['押出性／垂流', '3 s（23 °C）・6 s（5 °C）／0 mm（5・50 °C，水平・垂直）'], ['接縫尺寸（保證對象）', '寬 10–20 mm、深 8–15 mm，深 ≤ 寬；密封材厚度 ≥ 5 mm；二面接著（背襯材）'], ['每卡匣施工長度（含 20% 損耗）', '寬 10 × 深 8 mm：3.3 m；10 × 10：2.7 m；12 × 10：2.2 m；15 × 10：1.8 m'], ['基材適配（OP-2019）', '纖維水泥板・混凝土 ◎；擠出成型水泥板 ◎；ALC △；陽極氧化鋁 ◎；塗裝鋁 ◎；不鏽鋼 △；PVC 板・軟質・硬質 PVC ◎；FRP ◎'], ['塗裝性', '大多數塗料可塗，施工前確認相容性；無彈性塗料可能因伸縮而開裂']],
    rate: [['接縫 10 × 8 mm', '≈0.096 L/m', '3.3 m／卡匣'], ['接縫 10 × 10 mm（端末處理）', '≈0.12 L/m', '2.7 m／卡匣'], ['接縫 15 × 10 mm', '≈0.18 L/m', '1.8 m／卡匣'], ['6 L 桶 10 × 10 mm', '—', '50 m／桶']],
    safety: [['基材', '清潔、乾燥、無油分；含水氣的基底所釋放之水蒸氣會使固化中的密封材隆起'], ['底漆', 'AUTON EXCEED 可在無底漆下接著，但強烈建議使用 OP-2019；底漆乾固（15–30 分鐘）後再施打；開封後約一週內用完'], ['施打', '填實至基底，避免留有空洞；過度塗佈底漆的揮發溶劑會使密封材隆起'], ['不適用', '碳化處理部材、EPDM 或會析出油分之基材'], ['相容性', '未固化時勿接觸醇類、未硬化變性矽利康（MS）——固化不良'], ['固化', '完全防水效果需 7 天固化；物性以完全固化後測得'], ['SDS', '使用前確認 SDS；依當地法規廢棄']] },
  ACC: { sub: 'UREAX 專用硬化促進劑', pack: '800 g 瓶（附計量蓋）× 6 瓶／箱', colour: '乳白色', kind: '硬化促進劑', use: '縮短 UREAX-HG 的硬化時間',
    role: '依季節加入 UREAX-HG：春秋 2.5 wt%、冬季 5.0 wt%，硬化時間大幅縮短（見 1Day 模擬的曲線）。切勿達 7.5 wt% 以上——會損及性能。瓶附計量蓋，按 18 kg 罐計量。',
    areas: ['冬季與低溫的施工', '需要當天開放步行的工程'], adv: ['硬化時間大幅縮短', '附計量蓋，用量好掌握'], feat: ['800 g 瓶', '乳白色', '6 瓶／箱'],
    data: [['添加量（重量比）', '冬 5.0%・春秋 2.5%'], ['上限', '未達 7.5%（7.5% 以上會損及性能）'], ['每 18 kg HG', '2.5 wt% = 450 g・5.0 wt% = 900 g'], ['包裝', '800 g 瓶 × 6／箱，附計量蓋']] },
  SOLV: { sub: 'UREAX 專用環保型稀釋溶劑', pack: '3.5 kg 罐', colour: '無色透明', kind: '稀釋溶劑', use: '調整 UREAX-HG 的黏度',
    role: '黏度高（低溫）時加入 UREAX-HG 調整作業性：重量比 7.5% 以內。切勿達 7.5% 以上——會損及性能。',
    areas: ['低溫時的黏度調整', '滾筒作業性的調整'], adv: ['環保型', '專用配方'], feat: ['3.5 kg 罐', '無色透明'],
    data: [['添加量（重量比）', '7.5% 以內'], ['上限', '未達 7.5%（7.5% 以上會損及性能）'], ['每 18 kg HG', '最多約 1,350 g'], ['包裝', '3.5 kg 罐']] }
};
AC_STEPS.zh = {
  planF: { tag: '規劃', title: '現況調查與工法決定', short: '確認既有 FRP 的狀態：面漆粉化、裂縫、積水、立上部與排水口；決定 FU08 工法。', overview: '既有 FRP 防水層本體附著牢固、只有面漆老化的陽台、露台，是 FU08 工法的對象。調查時看四件事：面漆的粉化與褪色、裂縫（多在角落與立上根部）、低處的積水，以及排水口與門檻的收邊。', points: ['以手擦拭確認粉化程度；粉化嚴重的面清掃後仍可直接上底漆（免打磨）。', '裂縫與不陸記錄下來——在底漆之後以 {NBQ} 填補（下地調整）。', '積水處確認排水口通暢；排水口周圍的做法依現場規範†。', '面積、立上高度與長度量測後帶入本頁的用量估算。'], practice: [2], src: 'catalogue 2024.02 · autochem.co.jp/1052' },
  cleanF: { tag: '基材處理', title: '清掃・高壓水洗・乾燥確認', short: '除去塵土、油分、砂粒；必要時高壓水洗；完全乾燥後量測含水率 < 8% 再進入下一工序；周邊養生。', overview: '標準施工規範的第一步是下地清掃：除去灰塵、砂礫等汙染物，使底漆能發揮最佳接著；必要時使用高壓洗淨機，並在基材完全乾燥後才施工（保證檢核表：下地含水率 < 8%、氣溫 5–35 °C、相對濕度 ≤ 80%、無降雨或朝露）。FRP 面不打磨、不用丙酮擦拭（FU08）；髒污嚴重時用 {CTA}。周邊以養生膠帶與養生布保護。', points: ['以掃帚、抹布除去塵土、砂粒、油分；髒污嚴重時使用 {CTA}。', '必要時高壓水洗（禁用溶劑清潔）；洗淨後讓基材完全乾燥。', '施工前量測：下地含水率 < 8%、氣溫 5–35 °C、RH ≤ 80%——不符合即禁止施工（保證條件）。', '明顯的缺損與不平整以砂漿等無機材料補修、抹平。', '周邊養生（門檻、排水口、欄杆基座）。'], warning: '含水的基材會因水蒸氣頂起而使塗膜膨脹、剝離——這是保證除外事項；乾燥前不得塗布底漆。', src: '標準施工規範 7-1・7-2（2026/8/6）；保證檢核表' },
  primeF: { tag: '底漆', title: '底漆塗布 OP-55F', short: '專用底漆 OP-55F 以滾筒均勻塗布，0.15 kg/㎡；開放時間夏季 15 分鐘以上、冬季 30 分鐘以上。', overview: '使用專用底漆『OP-55F』，以滾筒均勻塗布，塗布量 0.15 kg/㎡（每 16 kg UN 罐約 106.6 ㎡）。淡黃色讓已塗布的範圍容易辨識。底漆開放時間：夏季 15 分鐘以上、冬季 30 分鐘以上。', points: ['使用專用底漆 {OP55}。', '以滾筒均勻塗布。', '塗布量 0.15 kg/㎡。', '底漆開放時間：夏季 15 分鐘以上、冬季 30 分鐘以上。'], ordered: true, note: 'OP-55F 是 Auto Chemical 防水材專用底漆，請勿用於他牌產品。', src: 'catalogue 2024.02 (FU08 ②) · autochem.co.jp/1067' },
  repairF: { tag: '下地調整', title: '下地調整 NON-BLEED QUICK：入隅・出隅、裂縫、排水口周圍', short: '底漆後、第一道前：牆腳入隅、轉角、裂縫與排水口周圍以 AUTON NON-BLEED QUICK 打膠、抹平；約 1 小時後即可塗 UREAX-HG。', overview: '標準施工規範指定的下地調整材是一液速乾型聚氨酯密封材『AUTON NON-BLEED QUICK』：用於轉角部（入隅・出隅）、裂縫補修、排水口・配管周圍的密封等下地調整處理。它不具自身耐紫外線性，必須由上方的塗膜被覆；填充後約 1 小時即可上塗。以打膠槍施打後抹平成約 10 × 10 mm 的三角填角；裂縫沿線填實抹平。', points: ['接合部與裂縫先確認乾燥、無粉塵、無油分。', '沿牆腳入隅、轉角以打膠槍連續施打，抹刀抹平成三角填角；裂縫沿線填實；排水口周圍密封。', '填實勿留空洞——底部的空氣或水氣膨脹會使密封材隆起。', '填充後約 1 小時即可塗 UREAX-HG 第一道；NBQ 必須被塗膜完全被覆。', '塗膜的端末處理另用 EXCEED（完工時）。'], warning: '保證檢核表：轉角、裂縫補修及配管周圍必須使用製造商指定的 NON-BLEED QUICK；未固化的聚氨酯勿接觸醇類或未固化的變性矽利康（MS）。', src: '標準施工規範 5-2・7-4（2026/8/6）；保證檢核表' },
  coat1F: { tag: '第一道', title: 'UREAX-HG 第一道（一般面）', short: 'UREAX-HG 第一道以滾筒均勻塗布，0.6 kg/㎡。依季節添加硬化促進劑 S。', overview: '『ウレアックスHG』分兩道塗布。第一道塗布量 0.6 kg/㎡（一般面）。單液型，開罐攪拌均勻後即可施工；依季節添加硬化促進劑 S（春秋 2.5 wt%、冬季 5.0 wt%），黏度高時以稀釋溶劑 K 調整，兩者皆未達 7.5 wt%。', points: ['第一道塗布量 0.6 kg/㎡。', '硬化促進劑 S：春秋 2.5 wt%、冬季 5.0 wt%；切勿達 7.5 wt% 以上。', '稀釋溶劑 K：重量比 7.5% 以內。', '塗布時避免漏塗與過厚堆積；立上部先塗†。'], practice: [3], warning: '硬化促進劑 S 與稀釋溶劑 K 添加 7.5 wt% 以上會損及性能。', src: 'catalogue 2024.02 (FU08 ④) · autochem.co.jp/1072 · autochem.co.jp/1075' },
  mixF: { tag: '混合', title: '第二道：骨材加入攪拌', short: '第二道塗布時添加骨材：每 1 kg UREAX-HG 添加 50–100 g，攪拌均勻。', overview: '第二道的防滑面來自塗布時添加的骨材。骨材以每 1 kg『ウレアックスHG』添加 50–100 g 為準，加入罐中攪拌均勻後塗布。', points: ['骨材添加量：每 1 kg HG 50–100 g（18 kg 罐：0.9–1.8 kg）。', '加入後攪拌均勻，避免沉澱。', '硬化促進劑 S 依季節一併添加。'], src: 'catalogue 2024.02 (FU08 ④)' },
  coat2F: { tag: '第二道', title: 'UREAX-HG 第二道（防滑面）', short: '第二道 0.2 kg/㎡，含骨材，以滾筒塗布；兩道合計 0.8 kg/㎡、完成膜厚 0.5 mm。', overview: '第二道塗布量 0.2 kg/㎡（防滑面），塗布時添加骨材。兩道合計 0.8 kg/㎡，完成膜厚 0.5 mm；每 18 kg 罐可塗 22.5 ㎡。這一道就是完成面——不再塗面漆。', points: ['第二道塗布量 0.2 kg/㎡。', '含骨材的材料以滾筒均勻塗布，形成防滑面。', '兩道合計 0.8 kg/㎡；完成膜厚 0.5 mm。', '沒有面漆工序。'], src: 'catalogue 2024.02 (FU08 ④)' },
  cureF: { tag: '養生', title: '靜置養生', short: '塗布後靜置養生 5 小時以上，之後可步行。硬化時間依溫度與促進劑用量而異。', overview: '養生 5 小時以上後方可步行。硬化深度隨時間增加，添加硬化促進劑 S 可大幅縮短——型錄提供 5 °C、20 °C、35 °C 的硬化曲線，本頁的 1Day 模擬依此估算今天的可步行時間。', points: ['養生 5 小時以上後方可步行。', '養生期間避免雨水、塵土與踩踏†。', '低溫時延長養生或使用硬化促進劑 S。'], practice: [1], src: 'catalogue 2024.02 (FU08 ⑤)' },
  handF: { tag: '完工', title: '完工・開放使用', short: '養生後開放步行。塗膜本身耐候、耐磨——沒有面漆的重塗週期。', overview: '完工的面是防滑的灰色（或淺灰）塗膜。強韌的塗膜（Shore A 95、伸長率 470%）與優異的耐候性（6,000 小時無異常）就是完成面，不需要面漆。', points: ['確認塗膜均勻、無漏塗。', '排水口通暢、門檻收邊完好。', '向業主說明維護：日常清掃即可；髒污以中性清潔劑清洗†。'], practice: [2], src: 'catalogue 2024.02' },
  coat2P: { tag: '第二道', title: 'UREAX-HG 第二道 0.6 kg/㎡（無骨材）', short: '第一道硬化後（工程間隔 3–10 h），第二道以滾筒均勻塗布 0.6 kg/㎡；兩道合計 1.2 kg/㎡ ≈ 0.83 mm。', overview: '標準施工規範 4-1：每道 0.6 kg/㎡（491.8 ml/㎡），工程間隔 3–10 小時（隨硬化促進劑 S 添加比率而變，見早見表）。不需要防滑面時，第二道就是完成面；需要更厚的膜時再塗第三道，最終工程後養生 24 小時。立面每道 0.4 kg/㎡。', points: ['第二道塗布量 0.6 kg/㎡；立面 0.4 kg/㎡。', '工程間隔 3–10 h：前一道達硬化（早見表 0.5 mm 欄）後再塗。', '滾筒均勻塗布，避免漏塗與極端積料。', '異種材料（變性矽利康等）的施工需在塗布 24 小時後。'], src: '標準施工規範 4-1・4-2；TDS 早見表' },
  coat3P: { tag: '第三道', title: 'UREAX-HG 第三道（依要求膜厚調整）', short: '要求膜厚較高時再塗第三道 0.6 kg/㎡；三道合計 1.8 kg/㎡ ≈ 1.25 mm。', overview: '標準施工規範 4-1 的第 4 工程「依要求膜厚調整」：每加一道 0.6 kg/㎡ 增加約 0.42 mm。工程間隔 3–10 h；最終工程後 24 h。', points: ['第三道 0.6 kg/㎡（491.8 ml/㎡）。', '工程間隔 3–10 h。', '最終工程後養生 24 h。'], src: '標準施工規範 4-1' },
  gripF: { tag: '防滑層', title: '防滑層（選用）：UREAX-HG 0.2 kg/㎡ ＋ 珪砂', short: '需要防滑面時，最後以 HG 0.2 kg/㎡ 加珪砂（50–100 g/kg，粒徑約 0.35–0.5 mm）滾塗一層；工程間隔 24 h。', overview: '防滑規格（選項）：UREAX-HG ＋ 珪砂，塗布量 0.2 kg/㎡（163.9 ml/㎡），HG：砂 ＝ 1 kg：50–100 g，粒徑約 0.35–0.5 mm；工程間隔 24 小時。攪拌均勻後以滾筒塗布。', points: ['珪砂 50–100 g／kg HG，粒徑約 0.35–0.5 mm。', '加入罐中攪拌均勻，避免沉澱；滾筒均勻塗布。', '工程間隔 24 h。'], src: '標準施工規範 4-1（防滑規格）' },
  termF: { tag: '端末處理', title: '端末處理 AUTON EXCEED', short: '塗膜完成後，立面上端等塗膜端部以 AUTON EXCEED 密封——高耐候、高耐久，不需塗膜被覆。', overview: '標準施工規範把『AUTON EXCEED』（一液高耐候・高耐久聚氨酯密封材）指定為防水塗膜的端末處理材：塗膜端部（立面上端、押緣下、貫通部周圍）以 EXCEED 打膠封邊，上方不需塗膜被覆也發揮高耐久性；完全硬化需較長時間（23 °C 3–7 天、5 °C 17–21 天；指觸乾燥 5 h／24 h）。', points: ['塗膜端部確認乾燥、無粉塵。', '以打膠槍沿端部連續施打 10 × 10 mm 密封條，抹平；每 320 ml 卡匣約 2.7 m（TDS 表，含 20% 損耗）。', '接著面為金屬、PVC 等時，先塗 EXCEED 專用底漆 OP-2019（乾燥 15 分以上、冬 30 分以上）。', '未硬化時避免雨水；完全硬化 3–7 天（23 °C）。'], warning: '保證檢核表：塗膜端末處理必須使用製造商指定的 EXCEED；現場不得混用矽利康、變性矽利康（醇類氣體干擾硬化）。', src: '標準施工規範 5-2；EXCEED TDS（2026/8/5）；保證檢核表' },
  inspF: { tag: '檢查', title: '檢查與補修（touch-up）', short: '確認表面無漏塗、針孔等欠損；有則以 UREAX-HG 再補修。記錄每道用量、LOT 與照片。', overview: '施工手順的最後一步：檢查表面是否有漏塗、針孔等缺陷，有則以 UREAX-HG 補修（touch-up）。同時完成保證檢核表：各工程施工面積與使用量（換算平均塗布量對照基準 0.15／0.6／0.6／0.2 kg/㎡）、稀釋劑與促進劑添加量（皆 ≤ 7.5%）、含 LOT 的產品照片與完工照片。', points: ['目視檢查漏塗、針孔、氣泡；補修後再確認。', '換算各工程平均塗布量是否達基準（膜厚不足為保證除外）。', '記錄稀釋劑（甲苯、二甲苯、PMA）與促進劑 S 添加量 ≤ 7.5%。', '保存產品 LOT 照片與完工照片。'], src: '標準施工規範 7-6・7-7；保證檢核表' },
  planM: { tag: '規劃', title: '現況調查（砂漿・混凝土面）', short: '確認砂漿面的起砂、裂縫、含水；決定底漆 OP-30B 與立上高度。', overview: '砂漿或混凝土面的陽台、走廊：確認表面是否起砂或鬆動、裂縫的位置與寬度、含水狀態（須乾燥），以及牆腳立上的高度與收邊。', points: ['鬆動、起砂的部分先除去至堅實面†。', '裂縫記錄下來，在底漆之後以 {NBQ} 填補（下地調整）。', '基材須乾燥；雨後或洗淨後留足乾燥時間†。'], practice: [0, 2], src: 'autochem.co.jp/1064' },
  cleanM: { tag: '基材處理', title: '噴砂／研磨・高壓水洗・乾燥確認', short: '砂漿、混凝土面以噴砂或研磨除去弱層、粉化與舊塗膜，吸塵後高壓水洗；完全乾燥、含水率 < 8% 後才上底漆。', overview: '砂漿、混凝土基材的專業處理：以噴砂（或研磨機）除去表面弱層（浮漿層）、起砂與舊塗膜，露出堅實面；吸塵、清掃後高壓水洗，禁用化學清潔劑；明顯的裂縫與欠損以砂漿補修、抹平。基材必須完全乾燥（含水率 < 8%）——含水的基材會因水蒸氣頂起而使塗膜膨脹，屬保證除外事項。', points: ['噴砂／研磨除去弱層、起砂、舊塗膜至堅實面†。', '吸塵、清掃後高壓水洗；洗淨後完全乾燥。', '明顯的裂縫、欠損、不陸以砂漿等無機材料補修、抹平。', '量測下地含水率 < 8%、氣溫 5–35 °C、RH ≤ 80% 後才進入底漆。'], warning: '未乾燥即強行施工（含水率 ≥ 8%）為保證除外事項。', practice: [0], src: '標準施工規範 7-1・7-2；保證檢核表；一般混凝土基材處理實務†' },
  primeM: { tag: '底漆', title: '底漆塗布 OP-30B', short: '防水材用砂漿基材底漆 OP-30B 以滾筒塗布，0.15 kg/㎡；開放時間夏 15 分鐘以上、冬 30 分鐘以上。', overview: '使用『OP-30B』（防水材用砂漿基材底漆；一般混凝土及層間用），以滾筒均勻塗布，塗布量 0.15 kg/㎡，一罐 16 kg 約 106.6 ㎡。開放時間與 OP-55F 相同：夏季 15 分鐘以上、冬季 30 分鐘以上。', points: ['使用 {OP30}。', '以滾筒均勻塗布，0.15 kg/㎡。', '吸水性強的面可能需要補塗†。', '開放時間：夏 15 分鐘以上、冬 30 分鐘以上。'], ordered: true, practice: [2], note: 'OP-30B 是 Auto Chemical 防水材專用底漆，請勿用於他牌產品。', src: 'autochem.co.jp/1064 · catalogue 2024.02' },
  repairM: { tag: '下地調整', title: '下地調整 NON-BLEED QUICK：入隅・出隅、裂縫、排水口周圍', short: '底漆後、第一道前：牆腳入隅、轉角、裂縫與排水口周圍以 AUTON NON-BLEED QUICK 打膠、抹平；約 1 小時後即可塗 UREAX-HG。', overview: '標準施工規範指定的下地調整材是一液速乾型聚氨酯密封材『AUTON NON-BLEED QUICK』：用於轉角部（入隅・出隅）、裂縫補修、排水口・配管周圍的密封等下地調整處理。它不具自身耐紫外線性，必須由上方的塗膜被覆；填充後約 1 小時即可上塗。以打膠槍施打後抹平成約 10 × 10 mm 的三角填角；裂縫沿線填實抹平。', points: ['接合部與裂縫先確認乾燥、無粉塵、無油分。', '沿牆腳入隅、轉角以打膠槍連續施打，抹刀抹平成三角填角；裂縫沿線填實；排水口周圍密封。', '填實勿留空洞——底部的空氣或水氣膨脹會使密封材隆起。', '填充後約 1 小時即可塗 UREAX-HG 第一道；NBQ 必須被塗膜完全被覆。', '塗膜的端末處理另用 EXCEED（完工時）。'], warning: '保證檢核表：轉角、裂縫補修及配管周圍必須使用製造商指定的 NON-BLEED QUICK；未固化的聚氨酯勿接觸醇類或未固化的變性矽利康（MS）。', src: '標準施工規範 5-2・7-4（2026/8/6）；保證檢核表' },
  planR: { tag: '規劃', title: '現況調查（既有聚氨酯防水層）', short: '確認既有防水層的附著、膨脹與剝離、女兒牆立上部與排水口；決定層間底漆與翻上高度。', overview: '既有聚氨酯塗膜防水層的翻新：附著牢固的部分可直接作為基材，以 OP-30B（層間用）打底†；膨脹、剝離處切除修補†。女兒牆立上部與排水口周圍是弱點，先看清楚。', points: ['附著性以現場試驗確認†。', '膨脹與剝離處切除，以砂漿等修補材整平，細裂縫以 {NBQ} 填補†。', '排水口：清潔、確認通暢；周圍做法依現場規範†。', '立上高度依現場規範†。'], practice: [0, 1, 2, 3], src: 'autochem.co.jp/1064' },
  cleanR: { tag: '基材處理', title: '切除膨脹處・清掃・高壓水洗・乾燥確認', short: '既有防水層的膨脹、剝離處切除並以砂漿補修；清掃、高壓水洗；完全乾燥、含水率 < 8% 後才上底漆。', overview: '既有聚氨酯防水層：先確認附著牢固的範圍，膨脹、剝離處切除到附著牢固為止，欠損以砂漿等補修抹平；然後清掃、必要時高壓水洗（禁用溶劑），完全乾燥後量測含水率 < 8%。粉化嚴重的面漆以清掃除去粉塵即可（層間用底漆 OP-30B）。', points: ['膨脹、剝離處切除；欠損以砂漿補修、抹平。', '清掃塵土、砂粒；必要時高壓水洗；完全乾燥。', '含水率 < 8%、氣溫 5–35 °C、RH ≤ 80% 後才進入底漆。', '排水口周圍、女兒牆立上部的收邊先確認。'], warning: '含水的舊防水層下方水氣會頂起新塗膜——乾燥確認是保證條件。', src: '標準施工規範 7-1・7-2；保證檢核表；一般實務†' },
  primeR: { tag: '底漆', title: '層間底漆 OP-30B', short: 'OP-30B（層間用）以滾筒塗布，0.15 kg/㎡，含女兒牆立上部；開放時間夏 15 分鐘以上、冬 30 分鐘以上。', overview: '『OP-30B』的用途包含層間用：既有防水層上的底漆。滾塗 0.15 kg/㎡，立上部一併塗布。開放時間：夏季 15 分鐘以上、冬季 30 分鐘以上。', points: ['使用 {OP30}（層間用）。', '地坪與立上部滾塗 0.15 kg/㎡。', '開放時間：夏 15 分鐘以上、冬 30 分鐘以上。'], ordered: true, note: '既有防水層的種類與狀態不同，附著性請以現場試驗確認†。', practice: [], src: 'autochem.co.jp/1064' },
  repairR: { tag: '下地調整', title: '下地調整 NON-BLEED QUICK：入隅・出隅、裂縫、排水口周圍', short: '底漆後、第一道前：牆腳入隅、轉角、裂縫與排水口周圍以 AUTON NON-BLEED QUICK 打膠、抹平；約 1 小時後即可塗 UREAX-HG。', overview: '標準施工規範指定的下地調整材是一液速乾型聚氨酯密封材『AUTON NON-BLEED QUICK』：用於轉角部（入隅・出隅）、裂縫補修、排水口・配管周圍的密封等下地調整處理。它不具自身耐紫外線性，必須由上方的塗膜被覆；填充後約 1 小時即可上塗。以打膠槍施打後抹平成約 10 × 10 mm 的三角填角；裂縫沿線填實抹平。', points: ['接合部與裂縫先確認乾燥、無粉塵、無油分。', '沿牆腳入隅、轉角以打膠槍連續施打，抹刀抹平成三角填角；裂縫沿線填實；排水口周圍密封。', '填實勿留空洞——底部的空氣或水氣膨脹會使密封材隆起。', '填充後約 1 小時即可塗 UREAX-HG 第一道；NBQ 必須被塗膜完全被覆。', '塗膜的端末處理另用 EXCEED（完工時）。'], warning: '保證檢核表：轉角、裂縫補修及配管周圍必須使用製造商指定的 NON-BLEED QUICK；未固化的聚氨酯勿接觸醇類或未固化的變性矽利康（MS）。', src: '標準施工規範 5-2・7-4（2026/8/6）；保證檢核表' },
  coat1R: { tag: '第一道', title: 'UREAX-HG 第一道，翻上女兒牆', short: '第一道 0.6 kg/㎡：先塗立上部，再塗地坪；避開排水口。', overview: '第一道塗布量 0.6 kg/㎡。立上部先塗†（刷或短毛滾筒），再以滾筒塗布地坪。依季節添加硬化促進劑 S。', points: ['立上部先塗，地坪後塗†。', '第一道塗布量 0.6 kg/㎡。', '硬化促進劑 S：春秋 2.5 wt%、冬季 5.0 wt%；切勿達 7.5 wt% 以上。', '排水口周圍依規範處理†。'], practice: [0, 3], src: 'catalogue 2024.02 (FU08 ④)' },
  coat2R: { tag: '第二道', title: 'UREAX-HG 第二道（防滑面），翻上女兒牆', short: '第二道 0.2 kg/㎡，含骨材；立上部與地坪；兩道合計 0.8 kg/㎡、完成膜厚 0.5 mm。', overview: '第二道塗布量 0.2 kg/㎡（防滑面），塗布時添加骨材（每 1 kg HG 50–100 g）。立上部一併塗布。這一道就是完成面。', points: ['第二道塗布量 0.2 kg/㎡，含骨材。', '立上部與地坪皆塗布。', '兩道合計 0.8 kg/㎡；完成膜厚 0.5 mm。'], src: 'catalogue 2024.02 (FU08 ④)' }
};


