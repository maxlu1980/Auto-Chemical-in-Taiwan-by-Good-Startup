/* ===== [page.js] ===== */
/* ===== Page logic: language, product-name typography, the Products menu and the three guides (categories), the step modal ===== */
var LANG = 'zh';
try { var _l = localStorage.getItem('ac-guide-lang'); if (_l === 'zh' || _l === 'en' || _l === 'ja') LANG = _l; } catch (e) {}
var LANG_TAG = { zh: 'zh-Hant-TW', en: 'en', ja: 'ja' };

/* product names: [family, suffix] per language; the family is set bold, the suffix light (the ProductName typography of the design system) */
var PN = {
  HG: { zh: ['UREAX', '-HG'], en: ['UREAX', '-HG'], ja: ['ウレアックス', 'HG'] },
  HGJ: { zh: ['オートンウレアックス', 'HG'], en: ['AUTON UREAX', '-HG'], ja: ['オートンウレアックス', 'HG'] },
  OP55: { zh: ['OP', '-55F'], en: ['OP', '-55F'], ja: ['OP', '-55F'] },
  OP30: { zh: ['OP', '-30B'], en: ['OP', '-30B'], ja: ['OP', '-30B'] },
  ACC: { zh: ['硬化促進劑', ' S'], en: ['Accelerator', ' S'], ja: ['硬化促進剤', 'S'] },
  SOLV: { zh: ['稀釋溶劑', ' K'], en: ['Thinner', ' K'], ja: ['希釈溶剤', 'K'] },
  QS: { zh: ['AUTON', ' QUICK SEALANT'], en: ['AUTON', ' QUICK SEALANT'], ja: ['オートン', 'Qイックシーラント'] },
  NBQ: { zh: ['AUTON', ' NON-BLEED QUICK'], en: ['AUTON', ' NON-BLEED QUICK'], ja: ['オートン', 'ノンブリードQイック'] },
  CTA: { zh: ['オートン', 'クリアトールα'], en: ['オートン', 'クリアトールα'], ja: ['オートン', 'クリアトールα'] },
  PO: { zh: ['PROTECT', ' ONE'], en: ['PROTECT', ' ONE'], ja: ['プロテクト', 'ワン'] },
  POJ: { zh: ['オートンプロテクトワン', ''], en: ['AUTON PROTECT', ' ONE'], ja: ['オートンプロテクトワン', ''] },
  AGG: { zh: ['骨材', ''], en: ['Aggregate', ''], ja: ['骨材', ''] },
  EG: { zh: ['ENAGUARD', ''], en: ['ENAGUARD', ''], ja: ['エナガード', ''] },
  EX: { zh: ['AUTON', ' EXCEED'], en: ['AUTON', ' EXCEED'], ja: ['オートン', 'イクシード'] },
  EXJ: { zh: ['オートンイクシード', ''], en: ['AUTON', ' EXCEED'], ja: ['オートンイクシード', ''] },
  OP2019: { zh: ['OP', '-2019'], en: ['OP', '-2019'], ja: ['OP', '-2019'] },
  OP2020: { zh: ['OP', '-2020'], en: ['OP', '-2020'], ja: ['OP', '-2020'] },
  CLIO: { zh: ['AUTON', ' CLIO NEO'], en: ['AUTON', ' CLIO NEO'], ja: ['オートン', 'クリオNEO'] },
  CLIOJ: { zh: ['オートンクリオNEO', ''], en: ['AUTON', ' CLIO NEO'], ja: ['オートンクリオNEO', ''] },
  NB101: { zh: ['AUTON SEALER', ' 101A-NB'], en: ['AUTON SEALER', ' 101A NON-BLEED'], ja: ['オートンシーラー', '101Aノンブリード'] },
  NB101J: { zh: ['オートンシーラー101A', 'ノンブリード'], en: ['AUTON SEALER', ' 101A NON-BLEED'], ja: ['オートンシーラー101A', 'ノンブリード'] },
  ROD: { zh: ['背襯材', '（PE 圓棒）'], en: ['Backer rod', ' (PE)'], ja: ['バックアップ材', '（PE丸棒）'] },
  PAINT: { zh: ['外牆塗料', '（他廠）'], en: ['Facade paint', ' (third party)'], ja: ['外壁塗料', '（他社）'] },
  COKE: { zh: ['オートン', 'コークワンNEO'], en: ['オートン', 'コークワンNEO'], ja: ['オートン', 'コークワンNEO'] },
  SIDING: { zh: ['オートン', 'サイディングシーラント'], en: ['オートン', 'サイディングシーラント'], ja: ['オートン', 'サイディングシーラント'] },
  SMART: { zh: ['オートン', 'スマートシールWJ'], en: ['オートン', 'スマートシールWJ'], ja: ['オートン', 'スマートシールWJ'] },
  NB101S: { zh: ['オートンシーラー', '101NB'], en: ['オートンシーラー', '101NB'], ja: ['オートンシーラー', '101NB'] },
  CRH: { zh: ['オートンシーラー', '101CR-H'], en: ['オートンシーラー', '101CR-H'], ja: ['オートンシーラー', '101CR-H'] },
  /* the residual products of the manufacturer's portfolio (names as printed on autochem.co.jp; no official Latin names published) */
  TF2000: { zh: ['オートン超耐シーラー', 'TF2000'], en: ['オートン超耐シーラー', 'TF2000'], ja: ['オートン超耐シーラー', 'TF2000'] },
  R101: { zh: ['オートンシーラー', '101R'], en: ['オートンシーラー', '101R'], ja: ['オートンシーラー', '101R'] },
  FLATP: { zh: ['オートン', 'フラットパテ'], en: ['オートン', 'フラットパテ'], ja: ['オートン', 'フラットパテ'] },
  AD3500: { zh: ['オートンアドハー', '3500'], en: ['オートンアドハー', '3500'], ja: ['オートンアドハー', '3500'] },
  FS600: { zh: ['オートンフロアスター', '600'], en: ['オートンフロアスター', '600'], ja: ['オートンフロアスター', '600'] },
  NEDA: { zh: ['オートンアドハー', 'ネダジャンボ'], en: ['オートンアドハー', 'ネダジャンボ'], ja: ['オートンアドハー', 'ネダジャンボ'] },
  AD8500: { zh: ['オートンアドハー', '8500'], en: ['オートンアドハー', '8500'], ja: ['オートンアドハー', '8500'] },
  AD8800: { zh: ['オートンアドハー', '8800'], en: ['オートンアドハー', '8800'], ja: ['オートンアドハー', '8800'] },
  AD1000R: { zh: ['オートンアドハー', '1000R'], en: ['オートンアドハー', '1000R'], ja: ['オートンアドハー', '1000R'] },
  FGS: { zh: ['オートンフロアーグリップ', 'S'], en: ['オートンフロアーグリップ', 'S'], ja: ['オートンフロアーグリップ', 'S'] },
  RCQ: { zh: ['オートンリペアカラー', 'Qィック'], en: ['オートンリペアカラー', 'Qィック'], ja: ['オートンリペアカラー', 'Qィック'] },
  EGE: { zh: ['ENAGUARD', ' E'], en: ['ENAGUARD', ' E'], ja: ['エナガード', 'E'] },
  EGT: { zh: ['ENAGUARD', ' T'], en: ['ENAGUARD', ' T'], ja: ['エナガード', 'T'] },
  EGV: { zh: ['ENAGUARD', ' V'], en: ['ENAGUARD', ' V'], ja: ['エナガード', 'V'] },
  PROPEEL: { zh: ['オートン', 'プロピールX'], en: ['オートン', 'プロピールX'], ja: ['オートン', 'プロピールX'] },
  SOKKAN: { zh: ['速乾帝王', 'M'], en: ['速乾帝王', 'M'], ja: ['速乾帝王', 'M'] },
  SEALDRYER: { zh: ['オートン', 'シールドライヤー'], en: ['オートン', 'シールドライヤー'], ja: ['オートン', 'シールドライヤー'] },
  HOLDERSC: { zh: ['軟卡匣', '專用固定筒'], en: ['ソフトカート', '専用ホルダー'], ja: ['ソフトカート', '専用ホルダー'] },
  HOLDERDP: { zh: ['兩用軟包', '專用固定筒'], en: ['どっちもパック', '専用ホルダー'], ja: ['どっちもパック', '専用ホルダー'] },
  PAILCAN: { zh: ['提桶', '分裝容器'], en: ['ペール缶', '詰替え容器'], ja: ['ペール缶', '詰替え容器'] },
  PRIMP: { zh: ['補土專用底漆', '（隨附）'], en: ['Putty primer', ' (supplied)'], ja: ['パテ専用プライマー', '（付属）'] },
  TF2000P: { zh: ['オートン超耐シーラー', 'TF2000 · 6 L'], en: ['オートン超耐シーラー', 'TF2000 · 6 L'], ja: ['オートン超耐シーラー', 'TF2000 · 6L'] },
  OP2019S: { zh: ['OP', '-2019 · 500 ml'], en: ['OP', '-2019 · 500 ml'], ja: ['OP', '-2019 · 500ml'] }
};
function pnParts(key) { var p = PN[key]; return p ? (p[LANG] || p.en) : [key, '']; }
function pn(key, reg) { var p = pnParts(key); return '<span class="sb-pname">' + p[0] + (p[1] ? '<span class="sb-pname__suffix">' + p[1] + '</span>' : '') + '</span>'; }
function pnPlain(key) { var p = pnParts(key); return p[0] + p[1]; }
function tx(s) { return String(s).replace(/\{([A-Z][A-Z0-9]*)(r?)\}/g, function (m, k) { return PN[k] ? pn(k) : m; }); }
function plain(s) { return String(s).replace(/\{([A-Z][A-Z0-9]*)r?\}/g, function (m, k) { return PN[k] ? pnPlain(k) : m; }); }
var COARSE_PTR = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
var TOUCH_HINT = [['Shift＋拖曳平移', '雙指拖曳平移'], ['Ctrl＋滾輪縮放', '雙指縮放'], ['滾輪縮放', '雙指縮放'], ['Shift + drag to move', 'two fingers to move'], ['Ctrl + wheel to zoom', 'pinch to zoom'], ['scroll to zoom', 'pinch to zoom'], ['Shift＋ドラッグで移動', '二本指で移動'], ['Ctrl＋ホイールでズーム', 'ピンチでズーム'], ['ホイールで拡大', 'ピンチで拡大'], ['スクロールでズーム', 'ピンチでズーム']];
function tr(key) { var S = [typeof MT !== 'undefined' ? MT : {}, typeof ACT !== 'undefined' ? ACT : {}, typeof POT !== 'undefined' ? POT : {}, typeof SLT !== 'undefined' ? SLT : {}, typeof ADT !== 'undefined' ? ADT : {}], i, v = null; for (i = 0; i < S.length && v == null; i++) v = S[i][LANG] && S[i][LANG][key]; for (i = 0; i < S.length && v == null; i++) v = S[i].en && S[i].en[key];
  if (COARSE_PTR && typeof v === 'string' && /\.hint$/.test(key)) { for (i = 0; i < TOUCH_HINT.length; i++) v = v.split(TOUCH_HINT[i][0]).join(TOUCH_HINT[i][1]); } /* the 3D hints speak of the mouse; a finger pinches and drags */
  return v; }
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
var RING_SVG = '<svg class="ic-ring" viewBox="0 0 54 54" aria-hidden="true"><circle class="r" cx="27" cy="27" r="22"/><path class="c" d="M22 16 L33 27 L22 38"/></svg>';
function logoMarkup(variant, tone, h, label) { if (variant === 'signet' || variant === 'ring') return RING_SVG; var src = tone === 'white' ? LOGO_FOOTER_IMG : LOGO_IMG; return '<img src="' + src + '" alt="' + (label ? 'AUTO CHEMICAL INDUSTRY CO., LTD.' : '') + '" height="' + h + '" style="height:' + h + 'px;width:auto">'; }
function picto(kind) { // three pictograms of the advantages card: one-component can, roller, sun/shield
  var s = '<svg class="sb-picto__icon" viewBox="0 0 72 72" aria-hidden="true" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round">';
  if (kind === 'can') s += '<rect x="20" y="18" width="32" height="40" rx="2"/><path d="M20 26h32M20 50h32M28 12h16v6H28z" /><path d="M30 34h12M36 30v8" stroke="#f97b00" stroke-width="3"/>';
  else if (kind === 'roller') s += '<rect x="14" y="22" width="30" height="14" rx="2" fill="#f97b00" stroke="#f97b00"/><path d="M44 29h8v8M52 37v10M48 47h8" /><path d="M52 47v12"/>';
  else if (kind === 'shield') s += '<path d="M36 12l20 7v16c0 12-9 20-20 25C25 55 16 47 16 35V19z"/><path d="M27 35l6 6 12-12" stroke="#f97b00" stroke-width="3"/>';
  else if (kind === 'clock') s += '<circle cx="36" cy="36" r="22"/><path d="M36 22v14l9 6" stroke="#f97b00" stroke-width="3"/>';
  else if (kind === 'clear') s += '<rect x="16" y="20" width="40" height="32" rx="2"/><path d="M22 46l10-12 8 8 6-6 8 10" /><circle cx="46" cy="30" r="3" fill="#f97b00" stroke="#f97b00"/>';
  else if (kind === 'sun') s += '<circle cx="36" cy="36" r="10" stroke="#f97b00" stroke-width="3"/><path d="M36 14v6M36 52v6M14 36h6M52 36h6M21 21l4 4M47 47l4 4M21 51l4-4M47 25l4-4"/>';
  else if (kind === 'salt') s += '<path d="M14 44c8-8 14 6 22 0s14-8 22 0" /><path d="M36 14l10 16H26z" stroke="#f97b00" stroke-width="3"/><path d="M30 44v8M42 44v8"/>';
  return s + '</svg>';
}

/* ---------- the Products menu: group ▸ subgroup ▸ products, as on autochem.co.jp ---------- */
var AC = 'https://autochem.co.jp';
/* The Products menu follows the manufacturer's own tree (autochem.co.jp/products/): major category ▸ sub-category ▸ products, in the
   manufacturer's order. A sub-category with `guide` has its products on this site (anchors into that guide); `hash` marks the guide's home
   sub-category (breadcrumbs, the switcher). Products with `url` instead of `anchor` link to their page on autochem.co.jp; `bundled` marks a
   primer that is only supplied with its sealant (no page of its own). */
var CATALOG = [
  { id: 'seal', tone: 'orange', url: AC + '/products/sealing/', name: { zh: '密封材', en: 'Sealants', ja: 'シーリング材' },
    subs: [
      { id: 'arch', hash: '#/sealant', guide: 'sl', url: AC + '/products/sealing/architecture/', name: { zh: '建築用密封材', en: 'Architectural sealants', ja: '建築用シーリング材' },
        lead: { zh: '應用指南：一液 PU 密封系統、六種接縫情境、技術比較、施工步驟、3D 接縫剖面、硬化時程模擬、用量與報價', en: 'The guide: the 1K PU sealing system, six joint scenarios, Versus, procedure, 3D joint sections, cure-time simulator, quantities and quotation', ja: '施工ガイド：1成分ウレタンシーリングシステム、6つの目地シーン、技術比較、施工手順、3D目地断面、硬化シミュレーター、数量と見積' },
        products: [
          { key: 'EX', anchor: '#sl-top', d: { zh: '不滲出・高耐久・高耐候：期待耐用年數約 30 年，外裝翻新的熱門選擇', en: 'Non-bleed, high durability, high weathering: an expected service life of about 30 years, popular for exterior renovation', ja: 'ノンブリード・高耐久・高耐候：驚異の耐用年数約 30 年。外装リフォームでも人気。' } },
          { key: 'NB101', anchor: '#sl-products', d: { zh: '不滲出・高耐久：耐久性優異的通用型（Perfect Non-Bleed）', en: 'Non-bleed, high durability: the general-purpose type with excellent durability (Perfect Non-Bleed)', ja: 'ノンブリード・高耐久：耐久性に優れた汎用タイプ。' } },
          { key: 'OP2019', anchor: '#sl-products', bundled: true, d: { zh: 'EXCEED 專用底漆：金屬、塑膠與無機基材', en: 'Primer for EXCEED on metal, plastics and mineral substrates', ja: 'イクシード専用プライマー。金属・プラスチック・無機下地に。' } },
          { key: 'OP2020', anchor: '#sl-products', bundled: true, d: { zh: '101A-NB／CLIO NEO 用底漆：多孔與無機基材', en: 'Primer for 101A-NB and CLIO NEO on porous and mineral substrates', ja: '101A-NB／クリオNEO用プライマー。多孔質・無機下地に。' } },
          { key: 'COKE', url: AC + '/15421/', d: { zh: '不滲出・高耐久・高耐候：建築用途廣泛適用的高品質密封材', en: 'Non-bleed, high durability, high weathering: a high-quality sealant for a wide range of building joints', ja: 'ノンブリード・高耐久・高耐候：建築用途で幅広く使える高品質シーリング材。' } },
          { key: 'SIDING', url: AC + '/935/', d: { zh: '不滲出・高耐久・高耐候：窯業系外牆板用的標準品，庫存色豐富', en: 'Non-bleed, high durability, high weathering: the standard for fibre-cement siding, with many stock colours', ja: 'ノンブリード・高耐久・高耐候：窯業系サイディング用の定番。在庫色が豊富。' } },
          { key: 'SMART', url: AC + '/945/', d: { zh: '高耐久・高耐候：對應大樓等工作縫的一液型', en: 'High durability, high weathering: a one-component sealant for the working joints of buildings', ja: '高耐久・高耐候：ビルなどのワーキングジョイントに対応する一成分形。' } },
          { key: 'NB101S', url: AC + '/958/', d: { zh: '不滲出：塗裝基材用不滲出型的標準品', en: 'Non-bleed: the standard non-bleed sealant for painted substrates', ja: 'ノンブリード：塗装下地用ノンブリードの定番。' } }
        ] },
      { id: 'putty', guide: 'sl', url: AC + '/products/sealing/crack-repair/', name: { zh: '建築用補土', en: 'Architectural putties', ja: '建築用パテ材' },
        products: [
          { key: 'FLATP', anchor: '#sl-products', d: { zh: '軟管裝可撓性聚氨酯補土：外牆材裂縫・缺損補修、螺絲孔・釘頭填補；收縮少、不滲出、可塗裝。170 g 軟管附 20 ml 專用底漆', en: 'Flexible urethane putty in a tube: repairs cracks and chips in facade materials, fills screw holes and nail heads; little shrinkage, non-bleed, paintable. 170 g tube with 20 ml primer', ja: 'チューブ入りの可撓性ウレタンパテ：外壁材の割れ・欠けの補修、ビス穴・釘頭の補填。肉やせ少なく、ノンブリード、塗装可。170 g チューブ、20 ml 専用プライマー付属' } },
          { key: 'AD3500', anchor: '#sl-products', d: { zh: '320 ml 卡匣裝可撓性聚氨酯補土：與フラットパテ同性能，改以膠槍施工；每箱 10 支，隨附 100 ml 底漆 ×2 與刷', en: 'Flexible urethane putty in a 320 ml cartridge: the same putty applied with a gun; 10 per box with 100 ml primer ×2 and a brush', ja: '320 ml カートリッジの可撓性ウレタンパテ：フラットパテと同じ性能をガン施工で。10 本/箱、100 ml プライマー×2・刷毛付属' } }
        ] },
      { id: 'civil', guide: 'sl', url: AC + '/products/sealing/civil-engineering/', name: { zh: '土木用密封材', en: 'Civil-engineering sealants', ja: '土木用シーリング材' },
        products: [
          { key: 'TF2000', anchor: '#sl-products', d: { zh: 'NETIS 登錄（KT-190076-VE）的一液型聚氨酯：超高耐候・高耐久、可施工寬接縫。農業用水路、橋梁、護欄、混凝土二次製品接縫與 U 形切割補修；6 L 桶／320 ml，底漆 OP-2019 另售', en: 'One-component polyurethane, NETIS-registered (KT-190076-VE): very high weathering, high durability, wide joints. Irrigation channels, bridges, parapets, precast-concrete joints and U-cut crack repair; 6 L pail / 320 ml, primer OP-2019 sold separately', ja: 'NETIS 登録（KT-190076-VE）の1成分形ポリウレタン：超高耐候・高耐久、幅広目地可。農業用水路・橋梁・壁高欄・コンクリート二次製品の目地、Uカット補修。6 L ペール／320 ml、プライマー OP-2019 別売' } },
          { key: 'OP2019', anchor: '#sl-products', d: { zh: 'TF2000 專用高性能底漆（另售）：100 ml／500 ml 罐，廣泛適用各種被著材', en: 'High-performance primer for TF2000 (sold separately): 100 ml / 500 ml cans, for a wide range of substrates', ja: '超耐シーラーTF2000 専用高性能プライマー（別売）：100 ml／500 ml 缶、各種被着材に幅広く適応' } },
          { key: 'NB101', anchor: '#sl-products', d: { zh: '不滲出・高耐久：耐久性優異的通用型', en: 'Non-bleed, high durability: the general-purpose type with excellent durability', ja: 'ノンブリード・高耐久：耐久性に優れた汎用タイプ。' } }
        ] },
      { id: 'wpseal', url: AC + '/products/sealing/waterproof/', name: { zh: '防水基材處理用密封材', en: 'Sealants for waterproofing substrates', ja: '防水下地用シーリング材' },
        products: [
          { key: 'QS', url: AC + '/969/', d: { zh: '速乾型：防水基材處理用的速乾密封材', en: 'Quick-drying sealant for waterproofing substrate preparation', ja: '速乾性。防水下地処理用の速乾タイプ。' } },
          { key: 'NBQ', url: AC + '/976/', d: { zh: '補修用速乾型：也可用於防水、塗裝基材', en: 'Quick-drying non-bleed sealant for repairs, waterproofing and paint substrates', ja: '補修用速乾性。防水、塗装下地にも使える速乾ノンブリード。' } },
          { key: 'NB101', anchor: '#sl-products', guide: 'sl', d: { zh: '不滲出・高耐久：耐久性優異的通用型', en: 'Non-bleed, high durability: the general-purpose type with excellent durability', ja: 'ノンブリード・高耐久：耐久性に優れた汎用タイプ。' } }
        ] },
      { id: 'ind', guide: 'sl', url: AC + '/products/sealing/industry/', name: { zh: '工業用密封材', en: 'Industrial sealants', ja: '工業用シーリング材' },
        products: [
          { key: 'R101', anchor: '#sl-products', d: { zh: '為產業用途開發的速乾型・高彈性聚氨酯：鋼板接縫、水密・氣密部位、電纜線槽、金屬與塑膠接合處。白・T 灰・黑，320 ml ×25', en: 'Quick-drying, high-elasticity polyurethane developed for industry: steel-sheet seams, watertight and airtight details, cable moulding, metal-to-plastic joints. White, T-grey, black; 320 ml ×25', ja: '産業用に開発した速乾タイプ・高弾性のポリウレタン：鋼板継ぎ目、水密・気密部、ケーブルモール、金属とプラスチックのジョイント。白・Tグレー・黒、320 ml ×25' } }
        ] },
      { id: 'other', guide: 'sl', url: AC + '/products/sealing/other/', name: { zh: '其他密封材等', en: 'Other sealants', ja: 'その他シーリング材等' },
        products: [
          { key: 'CRH', url: AC + '/986/', d: { zh: 'VOC 對策，最適合無塵室', en: 'Low-VOC formulation, ideal for clean rooms', ja: 'VOC対策でクリーンルームに最適。' } },
          { key: 'CLIO', anchor: '#sl-products', d: { zh: '速乾・高耐候・高耐久的透明密封材：透明、可塗裝、不污染', en: 'Quick-drying, high-weathering, high-durability clear sealant: transparent, paintable, non-staining', ja: '速乾性 高耐候、高耐久の透明なシーリング材。' } },
          { key: 'OP2020', anchor: '#sl-products', bundled: true, d: { zh: 'CLIO NEO／101A-NB 用底漆：多孔與無機基材', en: 'Primer for CLIO NEO and 101A-NB on porous and mineral substrates', ja: 'クリオNEO／101A-NB用プライマー。多孔質・無機下地に。' } }
        ] }
    ] },
  { id: 'adh', tone: 'grey', url: AC + '/products/adhesive/', name: { zh: '接著劑', en: 'Adhesives', ja: '接着剤' },
    subs: [
      { id: 'adhArch', hash: '#/adhesive', guide: 'ad', url: AC + '/products/adhesive/architecture-adhesive/', name: { zh: '建築用接著劑', en: 'Architectural adhesives', ja: '建築用接着剤' },
        lead: { zh: '應用指南：木質地板接著系統、四種地板工法情境、施工步驟、3D 地板剖面、用量估算、副資材', en: 'The guide: the wood-flooring adhesive system, four floor-method scenarios, procedure, 3D floor sections, take-off, accessories', ja: '施工ガイド：木質床材接着システム、4つの床工法シーン、施工手順、3D床断面、数量、副資材' },
        products: [
          { key: 'FS600', anchor: '#ad-top', d: { zh: '木質地板材／木質基材用聚氨酯接著劑：JIS A 5536 耐熱型認證、地暖對應、防止地板異音。600 ml 雙用包裝（每支約 21 m）', en: 'Urethane adhesive for wood flooring and wood sub-floors: JIS A 5536 heat-resistant certification, floor-heating compatible, stops floor squeak. 600 ml dual pack (about 21 m per pack)', ja: '木質床材／木質下地用ウレタン接着剤：JIS A 5536 耐熱型認証、床暖房対応、床鳴り防止。600 ml どっちもパック（1本約 21 m）' } },
          { key: 'NEDA', anchor: '#ad-products', d: { zh: '龍骨・合板・地板・鋼製支柱用一液型聚氨酯：大容量 850 ml、地暖對應、抑制地板異音，F☆☆☆☆・4VOC', en: 'One-component polyurethane for joists, plywood, flooring and steel floor posts: large 850 ml cartridge, floor-heating compatible, suppresses squeak, F☆☆☆☆ / 4VOC', ja: '根太・合板・フローリング・鋼製束用の1成分形ポリウレタン：大容量 850 ml、床暖房対応、床鳴り抑制、F☆☆☆☆・4VOC' } },
          { key: 'AD8500', anchor: '#ad-products', d: { zh: '以 TVOC 對策為優先的濕氣硬化型聚氨酯：無溶劑・無可塑劑，亦可接著砂漿・ALC，最適合地暖用途。600 ml 軟卡匣', en: 'Moisture-curing urethane with TVOC countermeasures as the priority: solvent- and plasticiser-free, bonds to mortar and ALC, ideal for floor heating. 600 ml soft cartridge', ja: 'TVOC 対策を最優先した湿気硬化型ウレタン：無溶剤・可塑剤なし、モルタル・ALC にも接着、床暖房用途に最適。600 ml ソフトカートリッジ' } },
          { key: 'AD8800', anchor: '#ad-products', d: { zh: '直貼木質地板用：可直貼於混凝土・砂漿・ALC・溫水面板，JIS A 5536 認證、地暖對應。10 kg 罐', en: 'For direct-glued wood flooring: bonds to concrete, mortar, ALC and hot-water panels, JIS A 5536 certified, floor-heating compatible. 10 kg can', ja: '直貼り木質フローリング用：コンクリート・モルタル・ALC・温水パネルへ直貼り可、JIS A 5536 認証、床暖房対応。10 kg 缶' } },
          { key: 'AD1000R', anchor: '#ad-products', d: { zh: '速硬化高強度多用途接著劑：木材・混凝土・砂漿・磁磚・FRP・玻璃・硬質 PVC・石膏板。320 ml，JAI 12', en: 'Fast-curing, high-strength multi-purpose adhesive: wood, concrete, mortar, tile, FRP, glass, rigid PVC, plasterboard. 320 ml, JAI 12', ja: '速硬化の高強度多用途接着剤：木材・コンクリート・モルタル・タイル・FRP・ガラス・硬質塩ビ・石膏ボード。320 ml、JAI 12' } }
        ] },
      { id: 'adhResin', guide: 'ad', url: AC + '/products/adhesive/resin/', name: { zh: '樹脂地板材用接著劑', en: 'Adhesives for resin flooring', ja: '樹脂床材用接着剤' },
        products: [
          { key: 'FGS', anchor: '#ad-products', d: { zh: '無甲苯一液濕氣硬化型：長尺 PVC 捲材・PVC 地磚・緩衝地板・合成橡膠地磚・人工草皮。JIS A 5536 認定，5 kg／18 kg 罐', en: 'Toluene-free one-component moisture-curing adhesive: sheet vinyl, vinyl tile, cushion floor, synthetic-rubber tile, artificial turf. JIS A 5536 certified, 5 kg / 18 kg cans', ja: 'ノントルエンの1液湿気硬化型：長尺塩ビシート・塩ビタイル・クッションフロア・合成ゴムタイル・人工芝。JIS A 5536 認定、5 kg／18 kg 缶' } }
        ] },
      { id: 'adhOther', guide: 'ad', url: AC + '/products/adhesive/other-adhesive/', name: { zh: '其他接著劑等', en: 'Other adhesives', ja: 'その他接着剤等' },
        products: [
          { key: 'RCQ', anchor: '#ad-products', d: { zh: '水性・速乾的室內用填縫材：踢腳板・PVC 捲材・陰陽角・磁磚・PVC 壁紙接縫的縫隙修飾。表面硬化 5–10 分，200 g，提供對應色查詢', en: 'Water-based quick-drying interior filler: finishes gaps at skirting, vinyl sheet, internal and external corners, tile and vinyl-wallpaper joints. Surface-dry in 5–10 min, 200 g, colour-matching search available', ja: '水性・速乾の内装用充填材：巾木・塩ビシート・入隅出隅・タイル・塩ビクロス目地の隙間を仕上げる。表面硬化 5–10 分、200 g、対応色検索あり' } }
        ] }
    ] },
  { id: 'wpm', tone: 'orange', url: AC + '/products/waterproofing/', name: { zh: '防水材', en: 'Waterproofing materials', ja: '防水材' },
    subs: [
      { id: 'ux', hash: '#/ureax-hg', guide: 'ux', url: AC + '/products/waterproofing/ureax/', name: { zh: 'UREAX 系列', en: 'UREAX range', ja: 'ウレアックス関連' },
        lead: { zh: '應用指南：FU08 工法、W 效果、1Day 工期模擬、3D 施工模型、用量與報價', en: 'The guide: FU08 method, the W effect, 1Day schedule simulator, 3D model, quantities and quotation', ja: '施工ガイド：FU08工法、Wの効果、1Day工程シミュレーター、3Dモデル、数量と見積' },
        products: [
          { key: 'HG', anchor: '#ux-top', d: { zh: '高強度。兼具塗料與防水性能的高強度塗覆材', en: 'High strength. Coating with the performance of a paint and a waterproofing membrane', ja: '高強度。塗料と防水性能を併せ持った高強度コーティング材。' } },
          { key: 'SOLV', anchor: '#ux-products', d: { zh: 'UREAX-HG 專用稀釋溶劑', en: 'Thinner for UREAX-HG', ja: 'ウレアックスHG専用の希釈溶剤。' } },
          { key: 'OP55', anchor: '#ux-products', d: { zh: 'FRP 基材免打磨即可施工的專用底漆', en: 'Primer for FRP substrates without sanding', ja: 'FRP下地のサンディング処理なしで施工が可能。' } },
          { key: 'OP30', anchor: '#ux-products', d: { zh: '防水材用通用底漆。砂漿基材等', en: 'General primer for waterproofing. Mortar substrates and the like', ja: '防水材用汎用プライマー。モルタル下地などに。' } },
          { key: 'ACC', anchor: '#ux-products', d: { zh: 'UREAX-HG 專用硬化促進劑', en: 'Curing accelerator for UREAX-HG', ja: 'ウレアックスHG専用硬化促進剤。' } }
        ] },
      { id: 'eg', url: AC + '/products/waterproofing/enaguard/', name: { zh: 'ENAGUARD 系列', en: 'ENAGUARD range', ja: 'エナガード関連' },
        products: [
          { key: 'EGE', url: AC + '/1055/', disc: true, d: { zh: '一液聚氨酯塗膜防水材（平面用）：混凝土基材平面防水、既有 FRP 防水的平面翻新。18 kg 罐、2.6 kg 袋 ×5', en: 'One-component urethane liquid membrane (horizontal areas): concrete decks and refurbishment of existing FRP waterproofing. 18 kg can, 2.6 kg bags ×5', ja: '1液ウレタン塗膜防水材（平場用）：コンクリート下地の平場防水、既設 FRP 防水の平場改修。18 kg 缶・2.6 kg 袋×5' } },
          { key: 'EGT', url: AC + '/1061/', disc: true, d: { zh: '速硬化・高強度的二液丙烯酸聚氨酯面漆：ENAGUARD 用面塗，灰／銀灰，1.4 kg／14 kg 套組', en: 'Fast-curing, high-strength two-component acrylic-urethane top coat for ENAGUARD: grey / silver grey, 1.4 kg and 14 kg sets', ja: '速硬化・高強度の2液アクリルウレタントップコート：エナガード用仕上げ塗料、グレー／シルバーグレー、1.4 kg／14 kg セット' } },
          { key: 'EGV', url: AC + '/1058/', disc: true, d: { zh: '一液聚氨酯塗膜防水材（立面用）：混凝土基材立面防水。10 kg 罐', en: 'One-component urethane liquid membrane (upstands): concrete upstands. 10 kg can', ja: '1液ウレタン塗膜防水材（立上り用）：コンクリート下地の立上り防水。10 kg 缶' } },
          { key: 'OP55', anchor: '#ux-products', guide: 'ux', d: { zh: 'FRP 基材免打磨即可施工的專用底漆', en: 'Primer for FRP substrates without sanding', ja: 'FRP下地のサンディング処理なしで施工が可能。' } },
          { key: 'OP30', anchor: '#ux-products', guide: 'ux', d: { zh: '防水材用通用底漆。砂漿基材等', en: 'General primer for waterproofing. Mortar substrates and the like', ja: '防水材用汎用プライマー。モルタル下地などに。' } }
        ] },
      { id: 'ps', url: AC + '/products/waterproofing/pre-sealing/', name: { zh: '防水基材處理用密封材', en: 'Sealants for waterproofing substrates', ja: '防水下地用シーリング材' },
        products: [
          { key: 'QS', url: AC + '/969/', d: { zh: '速乾型：防水基材處理用的速乾密封材', en: 'Quick-drying sealant for waterproofing substrate preparation', ja: '速乾性。防水下地処理用の速乾タイプ。' } },
          { key: 'NBQ', url: AC + '/976/', d: { zh: '補修用速乾型：也可用於防水、塗裝基材', en: 'Quick-drying non-bleed sealant for repairs, waterproofing and paint substrates', ja: '補修用速乾性。防水、塗装下地にも使える速乾ノンブリード。' } }
        ] }
    ] },
  { id: 'trs', tone: 'orange', url: AC + '/products/transparent-resin/', name: { zh: '透明樹脂', en: 'Transparent resin', ja: '透明樹脂' },
    subs: [
      { id: 'po', hash: '#/protect-one', guide: 'po', url: AC + '/products/transparent-resin/', name: { zh: 'PROTECT ONE', en: 'PROTECT ONE', ja: 'オートンプロテクトワン' },
        lead: { zh: '應用指南：四大性能、適用基材、型錄示範、施工概要、3D 模型、用量估算（待確認項目標示 TBC）', en: 'The guide: four points, substrates, catalogue demonstrations, procedure outline, 3D model, take-off (unpublished figures marked TBC)', ja: '施工ガイド：4つのポイント、適用部材、カタログの実証、施工概要、3Dモデル、数量（未公表値はTBC表示）' },
        products: [{ key: 'PO', anchor: '#po-top', d: { zh: '「在變成那樣之前」的新標準。次世代透明塗層', en: 'The new standard "before it gets that far": next-generation clear coating', ja: '「こうなる前に」の新定番。次世代のクリアコーティング、誕生。' } }] }
    ] },
  { id: 'rel', tone: 'grey', url: AC + '/products/related-products/', name: { zh: '關聯商品', en: 'Related products', ja: '関連商品' },
    subs: [
      { id: 'relClean', url: AC + '/products/related-products/dirt-prevention/', name: { zh: '清潔・除去・剝離劑', en: 'Cleaning, removal and stripping agents', ja: '清掃・除去・剥離剤' },
        products: [
          { key: 'CTA', url: AC + '/1088/', d: { zh: '除去金屬等上的底漆、塗料樹脂污染與殘膠；對已硬化的底漆亦有效。250 ml ×2 罐＋拭布＋刷的套組', en: 'Removes primer from metal and the like, resin stains from paint and adhesive-tape residue; works on fully cured primer. Set of 250 ml ×2 with cloths and brushes', ja: '金属等に付着したプライマー、塗料の樹脂汚れ、粘着剤残りを除去。硬化したプライマーにも対応。250 ml×2 缶・クロス・刷毛のセット' } },
          { key: 'PROPEEL', url: AC + '/1085/', d: { zh: '除去地板表面附著的業務用接著劑；對樹脂強度高的聚氨酯系接著劑亦有效。50 ml ×2＋專用刮刀＋滴管等套組', en: 'Removes professional adhesive from flooring surfaces, including high-strength urethane adhesives. Set of 50 ml ×2 with scraper, droppers and more', ja: 'フローリング表面に付着した業務用接着剤の除去。樹脂強度の強いウレタン系接着剤にも有効。50 ml×2・専用スクレーパー・スポイト等のセット' } }
        ] },
      { id: 'relSurf', url: AC + '/products/related-products/surface-effect-promotion/', name: { zh: '表面處理・硬化促進劑', en: 'Surface treatment and curing accelerators', ja: '表面処理・硬化促進剤' },
        products: [
          { key: 'SOKKAN', url: AC + '/18746/', d: { zh: 'Auton 專用表面硬化噴劑：促進密封材表面硬化，使塗裝等後續工序更順暢。290 ml ×10', en: 'Surface-curing spray for Auton sealants: accelerates skinning so painting and the following trades can start sooner. 290 ml ×10', ja: 'オートン専用の表面硬化スプレー：シーリング材の表面硬化を促進し、塗装など次工程への移行をスムーズに。290 ml×10' } },
          { key: 'SEALDRYER', url: AC + '/1082/', disc: true, d: { zh: '只需噴於密封材表面即可加速表面乾燥（硬化）。420 ml ×10', en: 'Sprayed on the sealant to speed up surface drying (skinning). 420 ml ×10', ja: 'シーリング材にスプレーするだけで表面の乾燥（硬化）がスピードアップ。420 ml×10' } }
        ] },
      { id: 'relOther', url: AC + '/products/related-products/other-related/', name: { zh: '其他副資材', en: 'Other accessories', ja: 'その他副資材' },
        products: [
          { key: 'HOLDERSC', url: AC + '/1098/', d: { zh: '軟卡匣製品的膠槍施工用固定筒：不易夾咬容器、施工順暢，對應市售 Jumbo 膠槍', en: 'Gun holder for soft-cartridge products: less pinching of the pack, smooth extrusion, fits commercial jumbo guns', ja: 'ソフトカート製品のガン打ち用ホルダー：容器の噛み込みが少なくスムーズ、市販のジャンボガン対応' } },
          { key: 'HOLDERDP', url: AC + '/1095/', d: { zh: 'フロアスター・ENAGUARD V 用的膠槍施工固定筒：對應市售 Jumbo 膠槍', en: 'Gun holder for the フロアスター and ENAGUARD V packs: fits commercial jumbo guns', ja: 'フロアスター・エナガードV 用のガン打ち用ホルダー：市販のジャンボガン対応' } },
          { key: 'PAILCAN', url: AC + '/1092/', d: { zh: '將桶裝密封材分裝至卡匣的容器：留存供貫通部、小補修使用。25 支一組', en: 'Cartridges for decanting pail sealant: keeps a reserve for penetrations and small repairs. Set of 25', ja: 'ペール缶のシーリング材をカートリッジへ詰め替える容器：貫通部や補修用の取り置きに。25 本セット' } }
        ] }
    ] },
  { id: 'db', tone: 'grey', url: AC + '/products/db-product/', name: { zh: 'DB 製品（工業用接著劑）', en: 'DB products (industrial adhesives)', ja: 'DB製品' },
    subs: (typeof DB_CATS !== 'undefined' ? DB_CATS : []).map(function (c) {
      return { id: 'db_' + c[0], url: c[1], name: c[2], intro: c[3], db: true, products: (typeof DB_PRODUCTS !== 'undefined' ? DB_PRODUCTS : []).filter(function (p) { return p[0] === c[0]; }).map(function (p) {
        var sds = p[2] ? ([].concat(p[2])).map(function (x) { return typeof x === 'string' ? ['SDS', DB_SDS + x + '.pdf'] : [x[0], DB_SDS + x[1] + '.pdf']; }) : [];
        return { code: p[1], sds: sds, url: c[1], d: { ja: p[3], zh: p[4], en: p[5] } };
      }) };
    }) }
];
var MT = {
  en: { 'hs.eyebrow': 'Interactive · Hands-on simulation', 'hs.btn': 'Enter the simulator', 'hs.foot': 'First person on the 3D sample of this page: the stages, tools and figures of the guide; the waiting times run on the site clock. No site, no risk — repeat it as often as you like. Desktop, tablet and phone.', 'hs.m0': 'work steps', 'hs.m1': 'site decisions', 'hs.m2': 'h of curing', 'nav.hs': 'Hands-on', 'a11y.skip': 'Skip to content', 'util.dist': 'Authorized agent of Auto Chemical for Taiwan', 'util.tds': 'Catalogue / SDS', 'util.calc': 'Quantities and quotation',
    'theme.group': 'Display theme', 'theme.day': 'Day', 'theme.night': 'Night', 'theme.day.aria': 'Day theme (light background)', 'theme.night.aria': 'Night theme (dark background)',
    'menu.products': 'Products', 'menu.cats': 'Sub-categories', 'menu.guide': 'Guide on this site', 'menu.bundled': 'supplied with the sealant', 'menu.allof': 'All {g} · on autochem.co.jp', 'menu.inguide': 'In the guide', 'menu.back': 'Back', 'menu.open': 'Open the guide', 'menu.onsite': 'On this site', 'menu.external': 'on autochem.co.jp', 'menu.allsubs': 'All products', 'menu.close': 'Close menu', 'menu.switch': 'Product group', 'menu.ext': 'Product page on autochem.co.jp',
    'nav.ux.system': 'System', 'nav.ux.adv': 'Advantages', 'nav.ux.vs': 'Versus', 'nav.ux.tl': 'Procedure', 'nav.ux.3d': '3D Model', 'nav.ux.sim': '1Day', 'nav.ux.products': 'Product data', 'nav.ux.qa': 'Quality', 'nav.ux.calc': 'Quotation', 'nav.ux.cmp': 'Comparison', 'nav.ux.cta': 'Quotation',
    'nav.po.points': 'Four points', 'nav.po.subs': 'Substrates', 'nav.po.tests': 'Evidence', 'nav.po.tl': 'Procedure', 'nav.po.3d': '3D Model', 'nav.po.products': 'Product data', 'nav.po.calc': 'Take-off', 'nav.po.cta': 'Take-off',
    'nav.sl.system': 'System', 'nav.sl.adv': 'Advantages', 'nav.sl.vs': 'Versus', 'nav.sl.tl': 'Procedure', 'nav.sl.3d': '3D Joint', 'nav.sl.qa': 'Quality', 'nav.sl.sim': 'Cure time', 'nav.sl.products': 'Product data', 'nav.sl.calc': 'Quotation', 'nav.sl.cmp': 'Comparison', 'nav.sl.cta': 'Quotation',
    'nav.ad.system': 'System', 'nav.ad.adv': 'Advantages', 'nav.ad.tl': 'Procedure', 'nav.ad.3d': '3D Floor', 'nav.ad.qa': 'Quality', 'nav.ad.products': 'Product data', 'nav.ad.calc': 'Take-off', 'nav.ad.cmp': 'Comparison', 'nav.ad.cta': 'Take-off',
    'menu.disc': 'Discontinued', 'menu.sds': 'Safety data sheet (PDF) on autochem.co.jp', 'menu.dbsrc': 'Codes and notes as printed on the manufacturer\'s list; the SDS (2026/03) open on autochem.co.jp.',
    'title.ux': 'Auton UREAX-HG Guide', 'title.po': 'Auton PROTECT ONE Guide', 'title.sl': 'Auton Sealants Guide — EXCEED · CLIO NEO · 101A-NB', 'title.ad': 'Auton Adhesives Guide — Wood flooring · Resin flooring',
    'foot.boiler': 'AUTO CHEMICAL INDUSTRY CO., LTD. (オート化学工業株式会社), Tokyo — founded 1965 — manufacturer of sealants, adhesives, waterproofing materials and polyurethane resins for the building, civil-engineering, vehicle and industrial sectors. Product groups:', 'foot.areas': ['Sealants', 'Adhesives', 'Waterproofing materials', 'Transparent resin', 'Related products', 'DB products (industrial adhesives)'],
    'foot.maker': 'Manufacturer', 'foot.addr': 'AUTO CHEMICAL INDUSTRY CO., LTD.\nHead office / Tokyo branch: 5-8-5 Ueno, Taito-ku, Tokyo 110-0005, Japan · TEL +81-3-5812-7310\nOsaka branch: 2-18-23 Minamikaneda, Suita, Osaka 564-0044, Japan · TEL +81-6-6821-8011\nFactories: Tsuchiura and Kitaibaraki (ISO 9001 / ISO 14001)\nwww.autochem.co.jp',
    'foot.gs.reg': '好時新創有限公司 · GOOD STARTUP CO., LTD.', 'foot.gs': 'Authorized agent of AUTO CHEMICAL INDUSTRY CO., LTD. for Taiwan — certificate issued 1 September 2025, valid 1 September 2025 to 31 August 2026 and renewed before expiry — for the sale, marketing and customer support of AUTON XH-470, XE-680, XE-680T, ULTRACOAT (now PROTECT ONE), EXCEED, CLIO NEO, QuickSealant and NonBleed Quick in Taiwan. Quotations, samples, technical advice and site support in 繁體中文 / English / 日本語.', 'foot.links': 'Links',
    'foot.link.ux': 'UREAX range (manufacturer)', 'foot.link.hg': 'UREAX-HG product page', 'foot.link.po': 'PROTECT ONE product page', 'foot.link.sl': 'Sealants (manufacturer)', 'foot.link.ex': 'EXCEED product page', 'foot.link.cat': 'Catalogues', 'foot.link.sds': 'SDS, waterproofing materials',
    'foot.disclaimer': 'Product data are taken from the Auto Chemical documentation supplied by the agent — the UREAX-HG brochure in Traditional Chinese (2023.11), the manufacturer\'s in-house JIS A 6021 test report (2025.08), the OP-30B, OP-2019 and OP-2020 technical data sheets (2025.08 / 2026.01), the EXCEED catalogue (2023.04), the F☆☆☆☆ / 4VOC registration certificates and the corporate profile (2019.07) — as well as the catalogues (UREAX-HG 2024.02, PROTECT ONE 2026.04), the product pages on autochem.co.jp and the SDS (2026.05); figures the manufacturer has not published are marked TBC. Product names are the property of AUTO CHEMICAL INDUSTRY CO., LTD. The agent certificate attests to the authority to sell the manufacturer\'s products; the manufacturer gives no warranty and accepts no liability for the quality or result of application work or for any damage arising from it. Subject to change; consult the current catalogue and the standard specification.', 'foot.product.ux': 'UREAX-HG product page', 'foot.tds.ux': 'Catalogue 2024.02 · SDS 2026/05/27', 'foot.product.po': 'PROTECT ONE product page', 'foot.tds.po': 'Catalogue 2026.04', 'foot.product.sl': 'Sealants (manufacturer)', 'foot.tds.sl': 'EXCEED catalogue 2023.04 · TDS 2025.08 / 2026.01 · SGS report 2013', 'foot.product.ad': 'Adhesives (manufacturer)', 'foot.tds.ad': 'Product pages on autochem.co.jp · SDS (adhesives)',
    'modal.prev': 'Previous step', 'modal.next': 'Next step', 'copied': 'Copied to the clipboard.', 'copyFail': 'The clipboard is not available — select the text by hand.', 'saved': 'Handed to the browser to save.', 'declined': 'Saving cancelled.', 'unavail': 'This view cannot save files — use “Copy text” instead.' },
  zh: { 'hs.eyebrow': '互動・親手施作模擬', 'hs.btn': '進入模擬現場', 'hs.foot': '以第一人稱站在本頁的 3D 樣本上：指南的工序、工具與數據，等待時間在現場時鐘上流逝。沒有工地、沒有風險——想練幾次就幾次。桌機、平板、手機皆可。', 'hs.m0': '個施作工序', 'hs.m1': '項現場判斷', 'hs.m2': '小時養生', 'nav.hs': '模擬現場', 'a11y.skip': '跳至主要內容', 'util.dist': 'Auto Chemical 台灣認定代理商', 'util.tds': '型錄／SDS', 'util.calc': '用量與報價',
    'theme.group': '顯示主題', 'theme.day': '日間', 'theme.night': '夜間', 'theme.day.aria': '日間模式（淺色底）', 'theme.night.aria': '夜間模式（深色底）',
    'menu.products': '產品', 'menu.cats': '分類', 'menu.guide': '本站指南', 'menu.bundled': '隨密封材附', 'menu.allof': '{g}全部產品 · 前往 autochem.co.jp', 'menu.inguide': '本站指南內', 'menu.back': '返回', 'menu.open': '開啟指南', 'menu.onsite': '本站內容', 'menu.external': '前往 autochem.co.jp', 'menu.allsubs': '全部產品', 'menu.close': '關閉選單', 'menu.switch': '產品類別', 'menu.ext': 'autochem.co.jp 產品頁',
    'nav.ux.system': '系統構成', 'nav.ux.adv': '產品優勢', 'nav.ux.vs': '技術比較', 'nav.ux.tl': '施工步驟', 'nav.ux.3d': '3D 模型', 'nav.ux.sim': '1Day 模擬', 'nav.ux.products': '產品資料', 'nav.ux.qa': '品質保證', 'nav.ux.calc': '估算報價', 'nav.ux.cmp': '產品比較', 'nav.ux.cta': '報價單',
    'nav.po.points': '四大性能', 'nav.po.subs': '適用基材', 'nav.po.tests': '實證', 'nav.po.tl': '施工概要', 'nav.po.3d': '3D 模型', 'nav.po.products': '產品資料', 'nav.po.calc': '用量估算', 'nav.po.cta': '用量估算',
    'nav.sl.system': '系統構成', 'nav.sl.adv': '產品優勢', 'nav.sl.vs': '技術比較', 'nav.sl.tl': '施工步驟', 'nav.sl.3d': '3D 接縫', 'nav.sl.qa': '品質保證', 'nav.sl.sim': '硬化時程', 'nav.sl.products': '產品資料', 'nav.sl.calc': '估算報價', 'nav.sl.cmp': '產品比較', 'nav.sl.cta': '報價單',
    'nav.ad.system': '系統構成', 'nav.ad.adv': '產品優勢', 'nav.ad.tl': '施工步驟', 'nav.ad.3d': '3D 地板', 'nav.ad.qa': '品質保證', 'nav.ad.products': '產品資料', 'nav.ad.calc': '用量估算', 'nav.ad.cmp': '產品比較', 'nav.ad.cta': '用量估算',
    'menu.disc': '已停售', 'menu.sds': 'autochem.co.jp 的安全資料表（PDF）', 'menu.dbsrc': '品號與說明依製造商一覽表；SDS（2026/03）於 autochem.co.jp 開啟。',
    'title.ux': 'Auton UREAX-HG 施工指南', 'title.po': 'Auton PROTECT ONE 施工指南', 'title.sl': 'Auton 密封材施工指南 — EXCEED · CLIO NEO · 101A-NB', 'title.ad': 'Auton 接著劑施工指南 — 木質地板 · 樹脂地板',
    'foot.boiler': 'AUTO CHEMICAL INDUSTRY CO., LTD.（オート化学工業株式会社，東京）創立於 1965 年，為密封材、接著劑、防水材與聚氨酯樹脂的製造商，產品用於建築、土木、車輛與工業領域。產品類別：', 'foot.areas': ['密封材', '接著劑', '防水材', '透明樹脂', '關聯商品', 'DB 製品（工業用接著劑）'],
    'foot.maker': '製造商', 'foot.addr': 'AUTO CHEMICAL INDUSTRY CO., LTD.\n本社・東京支店：〒110-0005 東京都台東区上野5-8-5 · TEL 03-5812-7310\n大阪支店：〒564-0044 大阪府吹田市南金田2-18-23 · TEL 06-6821-8011\n工廠：土浦、北茨城（ISO 9001／ISO 14001 認證）\nwww.autochem.co.jp',
    'foot.gs.reg': '好時新創有限公司 · GOOD STARTUP CO., LTD.', 'foot.gs': 'オート化学工業株式会社（AUTO CHEMICAL INDUSTRY CO., LTD.）認定代理店（台灣）：認定書 2025 年 9 月 1 日發行，有效期間 2025 年 9 月 1 日至 2026 年 8 月 31 日，期滿前辦理更新。認定範圍為下列製品在台灣的銷售、行銷與客戶支援：AUTON XH-470・XE-680・XE-680T・ULTRACOAT（現 PROTECT ONE）・EXCEED・CLIO NEO・QuickSealant・NonBleed Quick。報價、樣品、技術諮詢與現場支援，提供繁體中文／English／日本語服務。', 'foot.links': '連結',
    'foot.link.ux': 'UREAX 系列（製造商）', 'foot.link.hg': 'UREAX-HG 產品頁', 'foot.link.po': 'PROTECT ONE 產品頁', 'foot.link.sl': '密封材（製造商）', 'foot.link.ex': 'EXCEED 產品頁', 'foot.link.cat': '各種商品型錄', 'foot.link.sds': 'SDS・防水材',
    'foot.disclaimer': '產品資料轉載自代理商提供的 Auto Chemical 文件——UREAX-HG 繁體中文型錄（2023.11）、製造商 JIS A 6021 原廠試驗報告（2025.08）、OP-30B／OP-2019／OP-2020 技術資料（2025.08／2026.01）、EXCEED 型錄（2023.04）、F☆☆☆☆／4VOC 登錄證書與公司簡介（2019.07）——以及型錄（UREAX-HG 2024.02、PROTECT ONE 2026.04）、autochem.co.jp 產品頁與 SDS（2026.05）；製造商未公布的數值標示為 TBC。商品名稱為 AUTO CHEMICAL INDUSTRY CO., LTD. 所有。認定代理店認定書證明代理銷售製造商產品之權限；施工品質、結果或施工所致之任何損害，製造商不予保證亦不負責。內容可能變更，請以最新型錄與標準施工規範書為準。', 'foot.product.ux': 'UREAX-HG 產品頁', 'foot.tds.ux': '型錄 2024.02 · SDS 2026/05/27', 'foot.product.po': 'PROTECT ONE 產品頁', 'foot.tds.po': '型錄 2026.04', 'foot.product.sl': '密封材（製造商）', 'foot.tds.sl': 'EXCEED 型錄 2023.04 · TDS 2025.08／2026.01 · SGS 報告 2013', 'foot.product.ad': '接著劑（製造商）', 'foot.tds.ad': 'autochem.co.jp 產品頁 · SDS（接著劑）',
    'modal.prev': '上一步', 'modal.next': '下一步', 'copied': '已複製到剪貼簿。', 'copyFail': '無法存取剪貼簿——請手動選取文字。', 'saved': '已交給瀏覽器儲存。', 'declined': '已取消儲存。', 'unavail': '此檢視無法儲存檔案；請改用「複製文字」。' },
  ja: { 'hs.eyebrow': 'インタラクティブ・実習シミュレーション', 'hs.btn': 'シミュレーターに入る', 'hs.foot': 'このページの 3D サンプル上に一人称で立つ：ガイドの工程・工具・数値そのまま、待ち時間は現場時計で進む。現場も危険もなく、何度でも練習できる。PC・タブレット・スマートフォン対応。', 'hs.m0': '作業工程', 'hs.m1': '現場判断', 'hs.m2': '時間の養生', 'nav.hs': '実習', 'a11y.skip': '本文へ移動', 'util.dist': 'オート化学工業株式会社 認定代理店（台湾）', 'util.tds': 'カタログ／SDS', 'util.calc': '数量と見積',
    'theme.group': '表示テーマ', 'theme.day': '昼', 'theme.night': '夜', 'theme.day.aria': '昼間モード（明るい背景）', 'theme.night.aria': '夜間モード（暗い背景）',
    'menu.products': '商品', 'menu.cats': '分類', 'menu.guide': 'このサイトのガイド', 'menu.bundled': 'シーリング材に同梱', 'menu.allof': '{g}の全商品 · autochem.co.jp へ', 'menu.inguide': 'ガイド内', 'menu.back': '戻る', 'menu.open': 'ガイドを開く', 'menu.onsite': 'このサイトの内容', 'menu.external': 'autochem.co.jp へ', 'menu.allsubs': '全商品', 'menu.close': 'メニューを閉じる', 'menu.switch': '商品分類', 'menu.ext': 'autochem.co.jp の商品ページ',
    'nav.ux.system': 'システム', 'nav.ux.adv': '特長', 'nav.ux.vs': '技術比較', 'nav.ux.tl': '施工手順', 'nav.ux.3d': '3Dモデル', 'nav.ux.sim': '1Day', 'nav.ux.products': '商品データ', 'nav.ux.qa': '品質保証', 'nav.ux.calc': '見積', 'nav.ux.cmp': '比較', 'nav.ux.cta': '見積書',
    'nav.po.points': '4つのポイント', 'nav.po.subs': '適用部材', 'nav.po.tests': '実証', 'nav.po.tl': '施工概要', 'nav.po.3d': '3Dモデル', 'nav.po.products': '商品データ', 'nav.po.calc': '数量', 'nav.po.cta': '数量',
    'nav.sl.system': 'システム', 'nav.sl.adv': '特長', 'nav.sl.vs': '技術比較', 'nav.sl.tl': '施工手順', 'nav.sl.3d': '3D目地', 'nav.sl.qa': '品質保証', 'nav.sl.sim': '硬化時間', 'nav.sl.products': '商品データ', 'nav.sl.calc': '見積', 'nav.sl.cmp': '比較', 'nav.sl.cta': '見積書',
    'nav.ad.system': 'システム', 'nav.ad.adv': '特長', 'nav.ad.tl': '施工手順', 'nav.ad.3d': '3D床', 'nav.ad.qa': '品質保証', 'nav.ad.products': '商品データ', 'nav.ad.calc': '数量', 'nav.ad.cmp': '比較', 'nav.ad.cta': '数量',
    'menu.disc': '販売終了', 'menu.sds': 'autochem.co.jp の安全データシート（PDF）', 'menu.dbsrc': '品番と説明はメーカーの一覧表のまま。SDS（2026/03）は autochem.co.jp で開きます。',
    'title.ux': 'オートンウレアックスHG 施工ガイド', 'title.po': 'オートンプロテクトワン 施工ガイド', 'title.sl': 'オートン シーリング材 施工ガイド — イクシード・クリオNEO・101A-NB', 'title.ad': 'オートン 接着剤 施工ガイド — 木質床材・樹脂床材',
    'foot.boiler': 'オート化学工業株式会社（AUTO CHEMICAL INDUSTRY CO., LTD.、東京）は 1965 年創業。シーリング材・接着剤・防水材・ウレタン樹脂の製造メーカーとして、建築・土木・車両・工業の各分野に製品を供給しています。商品分類：', 'foot.areas': ['シーリング材', '接着剤', '防水材', '透明樹脂', '関連商品', 'DB製品'],
    'foot.maker': '製造元', 'foot.addr': 'オート化学工業株式会社\n本社・東京支店：〒110-0005 東京都台東区上野5-8-5 · TEL 03-5812-7310\n大阪支店：〒564-0044 大阪府吹田市南金田2-18-23 · TEL 06-6821-8011\n工場：土浦、北茨城（ISO 9001／ISO 14001 認証）\nwww.autochem.co.jp',
    'foot.gs.reg': '好時新創有限公司（GOOD STARTUP CO., LTD.）', 'foot.gs': 'オート化学工業株式会社の認定代理店（台湾）。認定書は 2025 年 9 月 1 日発行、有効期間は 2025 年 9 月 1 日〜2026 年 8 月 31 日（期間満了前に更新）。対象製品 AUTON XH-470・XE-680・XE-680T・ULTRACOAT（現 プロテクトワン）・EXCEED・CLIO NEO・QuickSealant・NonBleed Quick の台湾における販売・マーケティング・顧客サポートを行います。見積・サンプル・技術相談・現場サポートは繁體中文／English／日本語で対応します。', 'foot.links': 'リンク',
    'foot.link.ux': 'ウレアックス関連（製造元）', 'foot.link.hg': 'オートンウレアックスHG 商品ページ', 'foot.link.po': 'オートンプロテクトワン 商品ページ', 'foot.link.sl': 'シーリング材（製造元）', 'foot.link.ex': 'オートンイクシード 商品ページ', 'foot.link.cat': '各種商品カタログ', 'foot.link.sds': 'SDS・防水材',
    'foot.disclaimer': '商品データは代理店提供のオート化学工業の資料——ウレアックスHG 繁体字中国語版パンフレット（2023.11）、メーカーの JIS A 6021 社内試験報告書（2025.08）、OP-30B／OP-2019／OP-2020 技術資料（2025.08／2026.01）、イクシードカタログ（2023.04）、F☆☆☆☆／4VOC 登録証明書、会社案内（2019.07）——およびカタログ（ウレアックスHG 2024.02、プロテクトワン 2026.04）、autochem.co.jp の商品ページ、SDS（2026.05）から転載。製造元未公表の数値は TBC と表示しています。商品名はオート化学工業株式会社に帰属します。認定代理店の認定書はメーカー製品の代理販売権限を証するものであり、施工の品質、結果、施工に伴う損害について製造元が保証または責任を負うものではありません。内容は変更されることがあります。最新のカタログと標準施工仕様書をご確認ください。', 'foot.product.ux': 'ウレアックスHG 商品ページ', 'foot.tds.ux': 'カタログ 2024.02 · SDS 2026/05/27', 'foot.product.po': 'プロテクトワン 商品ページ', 'foot.tds.po': 'カタログ 2026.04', 'foot.product.sl': 'シーリング材（製造元）', 'foot.tds.sl': 'イクシードカタログ 2023.04 · TDS 2025.08／2026.01 · SGS 報告書 2013', 'foot.product.ad': '接着剤（製造元）', 'foot.tds.ad': 'autochem.co.jp 商品ページ · SDS（接着剤）',
    'modal.prev': '前の手順', 'modal.next': '次の手順', 'copied': 'クリップボードにコピーしました。', 'copyFail': 'クリップボードを使用できません。テキストを手動で選択してください。', 'saved': 'ブラウザに保存を依頼しました。', 'declined': '保存を取り消しました。', 'unavail': 'このビューではファイルを保存できません。「テキストをコピー」をご利用ください。' }
};
var NAVS = {
  ux: { links: [['#ux-system', 'nav.ux.system'], ['#ux-advantages', 'nav.ux.adv'], ['#ux-vs', 'nav.ux.vs'], ['#ux-procedure', 'nav.ux.tl'], ['#ux-model3d', 'nav.ux.3d'], ['#ux-handson', 'nav.hs'], ['#ux-qa', 'nav.ux.qa'], ['#ux-simulator', 'nav.ux.sim'], ['#ux-products', 'nav.ux.products'], ['#ux-calculator', 'nav.ux.calc'], ['#ux-compare', 'nav.ux.cmp']], cta: ['#ux-calculator', 'nav.ux.cta'], skip: '#ux-system', tds: '#ux-products', calc: '#ux-calculator', product: AC + '/1052/' },
  po: { links: [['#po-points', 'nav.po.points'], ['#po-substrates', 'nav.po.subs'], ['#po-tests', 'nav.po.tests'], ['#po-procedure', 'nav.po.tl'], ['#po-model3d', 'nav.po.3d'], ['#po-handson', 'nav.hs'], ['#po-products', 'nav.po.products'], ['#po-calculator', 'nav.po.calc']], cta: ['#po-calculator', 'nav.po.cta'], skip: '#po-points', tds: '#po-products', calc: '#po-calculator', product: AC + '/19440/' },
  ad: { links: [['#ad-system', 'nav.ad.system'], ['#ad-advantages', 'nav.ad.adv'], ['#ad-procedure', 'nav.ad.tl'], ['#ad-model3d', 'nav.ad.3d'], ['#ad-handson', 'nav.hs'], ['#ad-qa', 'nav.ad.qa'], ['#ad-products', 'nav.ad.products'], ['#ad-calculator', 'nav.ad.calc'], ['#ad-compare', 'nav.ad.cmp']], cta: ['#ad-calculator', 'nav.ad.cta'], skip: '#ad-system', tds: '#ad-products', calc: '#ad-calculator', product: AC + '/products/adhesive/' },
  sl: { links: [['#sl-system', 'nav.sl.system'], ['#sl-advantages', 'nav.sl.adv'], ['#sl-vs', 'nav.sl.vs'], ['#sl-procedure', 'nav.sl.tl'], ['#sl-model3d', 'nav.sl.3d'], ['#sl-handson', 'nav.hs'], ['#sl-qa', 'nav.sl.qa'], ['#sl-simulator', 'nav.sl.sim'], ['#sl-products', 'nav.sl.products'], ['#sl-calculator', 'nav.sl.calc'], ['#sl-compare', 'nav.sl.cmp']], cta: ['#sl-calculator', 'nav.sl.cta'], skip: '#sl-system', tds: '#sl-products', calc: '#sl-calculator', product: AC + '/products/sealing/' }
};
var FOOT_LINKS = [['foot.link.ux', AC + '/products/waterproofing/ureax/'], ['foot.link.hg', AC + '/1052/'], ['foot.link.po', AC + '/19440/'], ['foot.link.sl', AC + '/products/sealing/'], ['foot.link.ex', AC + '/929/'], ['foot.link.cat', AC + '/products/catalog/catalog_b/'], ['foot.link.sds', AC + '/products/sds/sds-waterproofing/']];

var Menu = (function () {
  var cat = 'ux', openGroup = '', openSub = '', spy = null, isOpen = false, started = {};
  function L(o) { return o[LANG] || o.en; }
  function group(id) { return CATALOG.filter(function (g) { return g.id === id; })[0]; }
  function allSubs() { var a = []; CATALOG.forEach(function (g) { (g.subs || []).forEach(function (s) { s.group = g; a.push(s); }); }); return a; }
  function sub(id) { return allSubs().filter(function (s) { return s.id === id; })[0]; }
  function guides() { return allSubs().filter(function (s) { return s.hash; }); }
  function home(c) { return guides().filter(function (s) { return s.guide === c; })[0]; }
  function guideOf(s, p) { return (p && p.guide) || s.guide || null; }
  function mains() { return { ux: $('catUreax'), po: $('catProtect'), sl: $('catSealant'), ad: $('catAdhesive') }; }
  function headerH() { var H = $('siteHeader'), mb = H.querySelector('.mainbar'); return (window.innerWidth <= 900 && mb ? mb.offsetHeight : H.offsetHeight) + 12; } /* on a phone or a tablet held upright only the logo-and-sections bar stays at the top; the distributor line, the island, language and theme scroll away with the page */
  function jump(top, smooth) { var de = document.documentElement, was = de.style.scrollBehavior; if (!smooth) de.style.scrollBehavior = 'auto'; window.scrollTo({ top: top, behavior: smooth ? 'smooth' : 'auto' }); if (!smooth) de.style.scrollBehavior = was; }
  var EXT = '<svg class="pmenu__ext" width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 1.5h6.5V8M10.5 1.5L2 10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>', CHEV = '<svg class="pmenu__chev" width="9" height="14" viewBox="0 0 9 14" aria-hidden="true"><path d="M1.5 1.5L7 7l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  /* the three columns of the desktop panel: major categories, the sub-categories of the open one, the products of the open sub-category */
  function groupsCol() {
    return CATALOG.map(function (g) { var cur = home(cat) && home(cat).group === g; return '<button type="button" class="pmenu__group' + (g.id === openGroup ? ' is-open' : '') + (cur ? ' is-active' : '') + '" data-tone="' + g.tone + '" data-group="' + g.id + '" aria-expanded="' + (g.id === openGroup) + '"' + (cur ? ' aria-current="true"' : '') + '><span>' + L(g.name) + '</span>' + CHEV + '</button>'; }).join('');
  }
  function subRow(s, mobile) {
    var cur = s.hash && s.guide === cat, has = (s.products && s.products.length) || s.guide, badge = s.guide ? '<em class="pmenu__badge">' + tr('menu.guide') + '</em>' : '';
    if (!has) return '<a class="pmenu__sub pmenu__sub--ext" href="' + s.url + '" target="_blank" rel="noopener"><span>' + L(s.name) + '<small>' + tr('menu.external') + '</small></span>' + EXT + '</a>';
    if (mobile) return '<button type="button" class="pmenu__sub" data-asub="' + s.id + '" aria-expanded="false"' + (cur ? ' aria-current="page"' : '') + '><span>' + L(s.name) + badge + '</span>' + CHEV + '</button><div class="pmenu__inline" data-for="' + s.id + '" hidden>' + products(s) + '</div>';
    return '<a class="pmenu__sub" href="' + (s.hash || s.url) + '"' + (s.hash ? '' : ' target="_blank" rel="noopener"') + ' data-sub="' + s.id + '" aria-expanded="' + (s.id === openSub) + '"' + (cur ? ' aria-current="page"' : '') + '><span>' + L(s.name) + badge + '</span>' + CHEV + '</a>';
  }
  function subsCol(g, mobile) {
    var h = mobile ? '' : '<p class="pmenu__cap">' + tr('menu.cats') + ' · ' + L(g.name) + '</p>';
    (g.subs || []).forEach(function (s) { h += subRow(s, mobile); });
    h += '<a class="pmenu__sub pmenu__sub--ext pmenu__sub--all" href="' + g.url + '" target="_blank" rel="noopener"><span>' + tr('menu.allof').replace('{g}', L(g.name)) + '</span>' + EXT + '</a>';
    return h;
  }
  function products(s) {
    var h = '', gd = s.hash ? s : (s.guide ? home(s.guide) : null);
    if (gd) h += '<a class="pmenu__lead" href="' + gd.hash + '" data-go="' + gd.guide + '"><b>' + tr('menu.open') + ': ' + L(gd.name) + '</b><span>' + L(gd.lead) + '</span></a>';
    /* a DB製品 sub-category: the manufacturer's category page as the lead, then the grades as compact rows (code · SDS · note) */
    if (s.db) h += '<a class="pmenu__lead pmenu__lead--ext" href="' + s.url + '" target="_blank" rel="noopener"><b>' + L(s.name) + ' ' + EXT + '</b><span>' + L(s.intro) + ' ' + tr('menu.dbsrc') + '</span></a>';
    (s.products || []).forEach(function (p) {
      if (p.code) { h += '<div class="pmenu__product pmenu__product--db"><span class="pmenu__pname"><b class="pmenu__code">' + esc(p.code) + '</b>' + p.sds.map(function (x) { return '<a class="pmenu__sds" href="' + x[1] + '" target="_blank" rel="noopener" title="' + esc(tr('menu.sds')) + '">' + esc(x[0]) + '</a>'; }).join('') + '</span><b>' + esc(L(p.d)) + '</b></div>'; return; }
      var g2 = guideOf(s, p), disc = p.disc ? '<small class="pmenu__tag pmenu__tag--disc">' + tr('menu.disc') + '</small>' : '';
      if (p.anchor && g2) h += '<a class="pmenu__product" href="' + p.anchor + '" data-go="' + g2 + '" data-product="' + p.key + '"><span class="pmenu__pname">' + pn(p.key) + (p.bundled ? '<small class="pmenu__tag">' + tr('menu.bundled') + '</small>' : '<small class="pmenu__tag pmenu__tag--in">' + tr('menu.inguide') + '</small>') + '</span><b>' + L(p.d) + '</b></a>';
      else h += '<a class="pmenu__product pmenu__product--ext" href="' + p.url + '" target="_blank" rel="noopener" title="' + esc(tr('menu.ext')) + '"><span class="pmenu__pname">' + pn(p.key) + disc + EXT + '</span><b>' + L(p.d) + '</b></a>';
    });
    return h;
  }
  function productsCol(s) { var el = $('pmenuProducts'); if (!el) return; el.innerHTML = s ? products(s) : ''; el.classList.toggle('is-db', !!(s && s.db)); el.scrollTop = 0; }
  function renderPanel() {
    var g = group(openGroup) || home(cat).group, s = sub(openSub);
    if (!s || s.group !== g) { s = firstSub(g); openSub = s ? s.id : ''; } openGroup = g.id;
    var h = '<div class="pmenu__desk"><div class="pmenu__col pmenu__col--groups" role="group" aria-label="' + esc(tr('menu.switch')) + '">' + groupsCol() + '</div>';
    h += '<div class="pmenu__col pmenu__col--subs" id="pmenuSubs">' + subsCol(g) + '</div>';
    h += '<div class="pmenu__col pmenu__col--products' + (s && s.db ? ' is-db' : '') + '" id="pmenuProducts">' + (s ? products(s) : '') + '</div></div>';
    /* the phone: one accordion — category ▸ sub-categories ▸ products */
    h += '<div class="pmenu__acc">' + CATALOG.map(function (g2) { var cur = home(cat).group === g2; return '<button type="button" class="pmenu__group" data-tone="' + g2.tone + '" data-agroup="' + g2.id + '" aria-expanded="' + cur + '"' + (cur ? ' aria-current="true"' : '') + '><span>' + L(g2.name) + '</span>' + CHEV + '</button><div class="pmenu__asubs" data-for="' + g2.id + '"' + (cur ? '' : ' hidden') + '>' + subsCol(g2, true) + '</div>'; }).join('') + '</div>';
    $('pmenuPanel').innerHTML = h;
  }
  function firstSub(g) { return (g.subs || []).filter(function (s) { return (s.products && s.products.length) || s.guide; })[0] || null; }
  function setGroup(id) { if (id === openGroup || !group(id)) return; openGroup = id; var s = home(cat) && home(cat).group.id === id ? home(cat) : firstSub(group(id)); openSub = s ? s.id : ''; [].forEach.call(document.querySelectorAll('.pmenu__desk .pmenu__group[data-group]'), function (b) { var on = b.getAttribute('data-group') === id; b.classList.toggle('is-open', on); b.setAttribute('aria-expanded', on); }); $('pmenuSubs').innerHTML = subsCol(group(id)); productsCol(s); }
  function setSub(id) { var s = sub(id); if (!s || id === openSub) return; openSub = id; [].forEach.call(document.querySelectorAll('.pmenu__desk .pmenu__sub[data-sub]'), function (a) { a.setAttribute('aria-expanded', a.getAttribute('data-sub') === id); }); productsCol(s); }
  function open(b) { isOpen = b; $('pmenuPanel').hidden = !b; $('pmenuBtn').setAttribute('aria-expanded', b ? 'true' : 'false'); $('pmenu').classList.toggle('is-open', b); if (b) { var hm = home(cat); openGroup = hm.group.id; openSub = hm.id; renderPanel(); } }
  function renderChrome() {
    var N = NAVS[cat], s = home(cat);
    $('pmenuLabel').textContent = tr('menu.products');
    $('nav').innerHTML = N.links.map(function (l) { return '<a href="' + l[0] + '">' + tr(l[1]) + '</a>'; }).join('');
    var c = $('navCta'); c.setAttribute('href', N.cta[0]); c.textContent = tr(N.cta[1]);
    $('skipLink').setAttribute('href', N.skip); $('utilTds').setAttribute('href', N.tds); $('utilCalc').setAttribute('href', N.calc);
    $('crumbs').innerHTML = '<div class="wrap"><ol class="crumbs__path"><li><button type="button" class="crumbs__btn" data-openmenu>' + tr('menu.products') + '</button></li><li>' + L(s.group.name) + '</li><li aria-current="page">' + L(s.name) + '</li></ol>' +
      '<div class="crumbs__switch" role="group" aria-label="' + esc(tr('menu.switch')) + '">' + guides().map(function (x) { return '<a href="' + x.hash + '" data-go="' + x.guide + '"' + (x.guide === cat ? ' aria-current="page"' : '') + '>' + L(x.name) + '</a>'; }).join('') + '</div></div>';
    var fp = $('footProduct'), ft = $('footTds'); fp.href = N.product; fp.textContent = tr('foot.product.' + cat); ft.textContent = tr('foot.tds.' + cat);
    document.title = tr('title.' + cat);
    if (isOpen) renderPanel(); buildSpy();
  }
  function buildSpy() {
    if (spy) spy.disconnect(); spy = null; if (!window.IntersectionObserver) return;
    var links = [].slice.call(document.querySelectorAll('#nav a')), map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    spy = new IntersectionObserver(function (en) { en.forEach(function (x) { if (!x.isIntersecting) return; links.forEach(function (a) { a.removeAttribute('aria-current'); }); var a = map[x.target.id]; if (a) { a.setAttribute('aria-current', 'true'); var nav = $('nav'); if (nav.scrollWidth > nav.clientWidth + 1) { var l = a.offsetLeft, r = l + a.offsetWidth; if (l < nav.scrollLeft) nav.scrollTo({ left: Math.max(0, l - 24), behavior: 'smooth' }); else if (r > nav.scrollLeft + nav.clientWidth) nav.scrollTo({ left: r - nav.clientWidth + 24, behavior: 'smooth' }); } } }); }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = $(id); if (s) spy.observe(s); });
  }
  function show(id, o) {
    o = o || {}; if (!NAVS[id]) id = 'ux'; var M = mains(), changed = id !== cat || !started[id]; cat = id;
    Object.keys(M).forEach(function (k) { if (M[k]) M[k].hidden = k !== id; });
    try { localStorage.setItem('ac-guide-cat', id); } catch (e) {}
    if (!started[id]) { started[id] = true; if (id === 'ux' && window.UX) UX.start(); if (id === 'po' && window.PO) PO.start(); if (id === 'sl' && window.SL) SL.start(); if (id === 'ad' && window.AD) AD.start(); }
    else { var cur = { ux: window.UX, po: window.PO, sl: window.SL, ad: window.AD }[id]; if (cur && cur.revive3d) { try { cur.revive3d(); } catch (e) {} } }
    /* the WebGL contexts of the guides that are not on screen: once more than six views are alive on a phone or tablet (nine on a desktop) the other guides give theirs up and build them again when they return */
    if (changed) { var alive = window.CRView && CRView.all ? CRView.all.length : 0; if (alive > (COARSE_PTR ? 6 : 9)) { ['ux', 'po', 'sl', 'ad'].forEach(function (k) { if (k === id) return; var mod = { ux: window.UX, po: window.PO, sl: window.SL, ad: window.AD }[k]; if (mod && mod.release3d && started[k]) { try { mod.release3d(); } catch (e) {} } }); } }
    renderChrome(); open(false); setTimeout(a11yWraps, 600); setTimeout(a11yWraps, 2500);
    if (o.hash !== false) { var want = o.anchor && o.anchor.length > 1 ? o.anchor : home(id).hash; if (location.hash !== want) { try { history.replaceState(null, '', want); } catch (e) {} } }
    if (o.anchor && o.anchor.length > 1 && $(o.anchor.slice(1))) { var el = $(o.anchor.slice(1)), go = function () { jump(Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - headerH()), !changed); }; if (changed) { go(); setTimeout(go, 80); } else go(); }
    else if (changed && o.scroll !== false) jump(0, false);
    if (o.product && id === 'ux' && window.UX) UX.showProduct(o.product); if (o.product && id === 'po' && window.PO) PO.showProduct(o.product); if (o.product && id === 'sl' && window.SL) SL.showProduct(o.product); if (o.product && id === 'ad' && window.AD) AD.showProduct(o.product);
  }
  function catOfAnchor(h) { if (/^#\/ureax-hg/.test(h)) return 'ux'; if (/^#\/protect-one/.test(h)) return 'po'; if (/^#\/sealant/.test(h)) return 'sl'; if (/^#\/adhesive/.test(h)) return 'ad'; if (h.length > 1) { var el = $(h.slice(1)); if (el) { var m = el.closest('main[data-cat]'); if (m) return m.getAttribute('data-cat'); } if (/^#ux-/.test(h)) return 'ux'; if (/^#po-/.test(h)) return 'po'; if (/^#sl-/.test(h)) return 'sl'; if (/^#ad-/.test(h)) return 'ad'; } return null; }
  function desktop() { return window.matchMedia('(min-width: 901px)').matches; }
  function boot() {
    var start = catOfAnchor(location.hash || ''), stored = null; try { stored = localStorage.getItem('ac-guide-cat'); } catch (e) {}
    show(start || (NAVS[stored] ? stored : 'ux'), { scroll: false, anchor: /^#\//.test(location.hash) ? null : location.hash, hash: !!start });
    $('pmenuBtn').addEventListener('click', function (e) { e.stopPropagation(); open(!isOpen); });
    var P = $('pmenuPanel');
    function hoverTarget(e) { if (!desktop()) return; var g = e.target.closest('.pmenu__desk [data-group]'); if (g) { setGroup(g.getAttribute('data-group')); return; } var a = e.target.closest('.pmenu__desk [data-sub]'); if (a) setSub(a.getAttribute('data-sub')); }
    P.addEventListener('mouseover', hoverTarget); P.addEventListener('focusin', hoverTarget);
    P.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (b) {
        e.preventDefault();
        if (b.hasAttribute('data-group')) { setGroup(b.getAttribute('data-group')); return; }
        if (b.hasAttribute('data-agroup')) { var id = b.getAttribute('data-agroup'), on = b.getAttribute('aria-expanded') !== 'true'; [].forEach.call(P.querySelectorAll('.pmenu__acc [data-agroup]'), function (x) { var me = x.getAttribute('data-agroup') === id; x.setAttribute('aria-expanded', me && on); }); [].forEach.call(P.querySelectorAll('.pmenu__asubs'), function (d) { d.hidden = !(on && d.getAttribute('data-for') === id); }); return; }
        if (b.hasAttribute('data-asub')) { var sid = b.getAttribute('data-asub'), on2 = b.getAttribute('aria-expanded') !== 'true'; [].forEach.call(P.querySelectorAll('.pmenu__acc [data-asub]'), function (x) { var me = x.getAttribute('data-asub') === sid; x.setAttribute('aria-expanded', me && on2); }); [].forEach.call(P.querySelectorAll('.pmenu__acc .pmenu__inline'), function (d) { d.hidden = !(on2 && d.getAttribute('data-for') === sid); }); return; }
        return;
      }
      var a = e.target.closest('a'); if (!a) return;
      var go = a.getAttribute('data-go'); if (!go) { open(false); return; }
      e.preventDefault(); show(go, { anchor: a.getAttribute('data-product') ? a.getAttribute('href') : null, product: a.getAttribute('data-product') });
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-openmenu]')) { e.preventDefault(); e.stopPropagation(); open(true); var f = document.querySelector('.pmenu__desk .pmenu__sub[aria-current]') || document.querySelector('.pmenu__desk .pmenu__sub'); if (f && desktop()) f.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (isOpen && !e.target.closest('#pmenu')) open(false);
      var a = e.target.closest('a[href^="#"]'); if (!a || a.closest('#pmenuPanel')) return;
      var h = a.getAttribute('href'), go = a.getAttribute('data-go') || catOfAnchor(h); if (!go) return;
      if (go !== cat || a.hasAttribute('data-go')) { e.preventDefault(); show(go, { anchor: /^#\//.test(h) ? null : h }); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) { open(false); $('pmenuBtn').focus(); } });
    window.addEventListener('hashchange', function () { var c = catOfAnchor(location.hash || ''); if (c && c !== cat) show(c, { anchor: /^#\//.test(location.hash) ? null : location.hash, hash: false }); });    /* on a phone or a tablet held upright the header sticks with its top rows (distributor, island, language, theme) tucked above the screen: only the logo-and-sections bar stays in view once the reader scrolls */
    function utilH() { var u = $('siteHeader').querySelector('.util'); document.documentElement.style.setProperty('--util-h', (u ? u.offsetHeight : 0) + 'px'); }
    window.addEventListener('resize', utilH); utilH(); setTimeout(utilH, 600); if (document.fonts && document.fonts.ready) document.fonts.ready.then(utilH);
  }
  return { boot: boot, show: show, render: renderChrome, cat: function () { return cat; }, headerH: headerH, sub: sub, home: home, open: open, setGroup: setGroup, setSub: setSub };
})();

/* ---------- toast, clipboard, downloads ---------- */
var toastTimer = 0;
function toast(msg) { var el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600); }
function copyText(t) {
  var done = function () { toast(tr('copied')); }, fail = function () { toast(tr('copyFail')); };
  var legacy = function () { var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-999px;top:0'; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); if (ok) done(); else fail(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, legacy); else legacy();
}
function saveFile(filename, data) { // on claude.ai the file goes through the runtime's downloads capability; anywhere else (GitHub Pages, a local copy) the browser saves it itself
  if (!(window.claude && window.claude.use)) { saveFileLocal(filename, data); return; }
  window.claude.use('downloads').then(function (dl) { if (!dl) throw new Error('unavailable'); return dl.save({ filename: filename, data: data }); }).then(function (r) { toast(r && r.cancelled ? tr('declined') : tr('saved')); }, function () { saveFileLocal(filename, data); });
}
function saveFileLocal(filename, data) {
  try { var type = /\.csv$/i.test(filename) ? 'text/csv;charset=utf-8' : /\.html?$/i.test(filename) ? 'text/html;charset=utf-8' : 'application/octet-stream';
    var blob = data instanceof Blob ? data : new Blob([typeof data === 'string' && /\.csv$/i.test(filename) ? '\ufeff' + data : data], { type: type }), u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = filename; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 4000); toast(tr('saved')); }
  catch (e) { toast(tr('unavail')); }
}

/* ---------- the step modal: shared by both guides ---------- */
var modalIdx = -1, modalOpener = null, modalAlt = null;
function modalNav(n) { $('modalPrev').textContent = tr('modal.prev'); $('modalNext').textContent = tr('modal.next'); $('modalPrev').style.visibility = modalIdx > 0 ? 'visible' : 'hidden'; $('modalNext').style.visibility = modalIdx < n - 1 ? 'visible' : 'hidden'; }
function fillModal() { if (!modalAlt) return; var n = modalAlt.count(); if (modalIdx >= n) modalIdx = n - 1; modalAlt.fill(modalIdx); modalNav(n); $('modalFig').setAttribute('aria-label', ($('modalTitle').textContent || '').trim() || 'figure'); $('modalText').parentNode.scrollTop = 0; }
function openModal(i, opener, alt) { if (alt !== undefined) modalAlt = alt; modalIdx = i; if (opener) modalOpener = opener; fillModal(); $('modalOv').hidden = false; document.body.style.overflow = 'hidden'; $('modalClose').focus(); }
function closeModal() { modalIdx = -1; $('modalOv').hidden = true; document.body.style.overflow = ''; if (modalOpener && modalOpener.focus) modalOpener.focus(); }

/* ---------- language ---------- */
function applyLang() {
  document.documentElement.lang = LANG_TAG[LANG];
  [].forEach.call(document.querySelectorAll('[data-i18n]'), function (el) { var v = tr(el.getAttribute('data-i18n')); if (v != null && typeof v === 'string') el.innerHTML = tx(v); });
  [].forEach.call(document.querySelectorAll('.lang button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === LANG ? 'true' : 'false'); });
  if (typeof themeLabels === 'function') themeLabels();
  if (window.DocUI) DocUI.relabel();
  $('footAreas').innerHTML = tr('foot.areas').map(function (a) { return '<li>' + a + '</li>'; }).join('');
  $('footAddr').textContent = tr('foot.addr');
  $('footLinks').innerHTML = FOOT_LINKS.map(function (l) { return '<li><a href="' + l[1] + '" target="_blank" rel="noopener">' + tr(l[0]) + '</a></li>'; }).join('');
  if (window.ISLE) ISLE.relabel();
  Menu.render(); if (window.UX) UX.render(); if (window.PO) PO.render(); if (window.SL) SL.render(); if (window.AD) AD.render(); if (modalIdx >= 0) fillModal();
  [].forEach.call(document.querySelectorAll('[data-a11y]'), function (w) { w.removeAttribute('data-a11y'); w.removeAttribute('aria-label'); }); setTimeout(a11yWraps, 400);
}
/* (v67) a table that scrolls sideways is a named region the keyboard can reach and scroll (WCAG 2.1.1) */
function a11yWraps() { [].forEach.call(document.querySelectorAll('.sb-table-wrap, .vs-wrap'), function (w) { if (w.hasAttribute('data-a11y')) return; w.setAttribute('data-a11y', '1'); if (!w.hasAttribute('tabindex')) w.tabIndex = 0; if (!w.getAttribute('role')) w.setAttribute('role', 'region');
    if (!w.getAttribute('aria-label')) { var s = w.closest('section') || w.parentNode, h = s && s.querySelector('h2, h3'), c = w.querySelector('caption'); w.setAttribute('aria-label', ((c && c.textContent) || (h && h.textContent) || '').trim().slice(0, 80) || 'table'); } }); }
function setLang(l) { LANG = l; try { localStorage.setItem('ac-guide-lang', l); } catch (e) {} applyLang(); }

/* ---------- day / night theme: both available from the header, independent of the OS setting; the choice persists ----------
   the inline script at the top of the body applies the theme before the first paint; here the buttons, the OS/host changes and the labels */
var THEME_KEY = 'ac-guide-theme', THEME = 'light', THEME_EXPLICIT = false;
var THEME_MQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function themeStored() { try { var t = localStorage.getItem(THEME_KEY); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; } }
function applyTheme() {
  if (document.documentElement.getAttribute('data-theme') !== THEME) document.documentElement.setAttribute('data-theme', THEME);
  [].forEach.call(document.querySelectorAll('.theme button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-theme') === THEME ? 'true' : 'false'); });
  // the 3D stages: white studio by day, the page's black behind the specimen by night; the stills of the procedure are rendered again on the new background
  if (typeof CRView !== 'undefined' && CRView.setTheme && CRView.theme !== THEME) { CRView.setTheme(THEME); ['UX', 'PO', 'SL', 'AD'].forEach(function (k) { if (window[k] && window[k].retheme) { try { window[k].retheme(); } catch (e) {} } }); }
}
function setTheme(t, persist) {
  if (t !== 'light' && t !== 'dark') return;
  THEME = t;
  if (persist !== false) { THEME_EXPLICIT = true; try { localStorage.setItem(THEME_KEY, t); } catch (e) {} }
  applyTheme();
}
function themeLabels() {
  var g = $('themeGroup'); if (!g) return;
  g.setAttribute('aria-label', tr('theme.group'));
  [].forEach.call(g.querySelectorAll('button'), function (b) { var k = b.getAttribute('data-theme') === 'dark' ? 'night' : 'day'; b.setAttribute('aria-label', tr('theme.' + k + '.aria')); b.setAttribute('title', tr('theme.' + k + '.aria')); });
}
function bootTheme() {
  var s = themeStored(), h = document.documentElement.getAttribute('data-theme');
  if (s) { THEME = s; THEME_EXPLICIT = true; }
  else THEME = (h === 'light' || h === 'dark') ? h : (THEME_MQ && THEME_MQ.matches ? 'dark' : 'light');
  applyTheme();
  [].forEach.call(document.querySelectorAll('.theme button'), function (b) { b.addEventListener('click', function () { setTheme(b.getAttribute('data-theme')); }); });
  if (THEME_MQ) { var onMq = function (e) { if (!THEME_EXPLICIT) setTheme(e.matches ? 'dark' : 'light', false); }; if (THEME_MQ.addEventListener) THEME_MQ.addEventListener('change', onMq); else if (THEME_MQ.addListener) THEME_MQ.addListener(onMq); }
  if (window.MutationObserver) new MutationObserver(function () { // the host may switch data-theme with its own appearance setting: follow it unless the reader chose here
    var v = document.documentElement.getAttribute('data-theme'); if (v === THEME) return;
    if (THEME_EXPLICIT) applyTheme(); else if (v === 'light' || v === 'dark') { THEME = v; applyTheme(); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('storage', function (e) { if (e.key === THEME_KEY && (e.newValue === 'light' || e.newValue === 'dark')) { THEME_EXPLICIT = true; THEME = e.newValue; applyTheme(); } });
}

(function boot() {
  [].forEach.call(document.querySelectorAll('[data-logo]'), function (el) { el.innerHTML = logoMarkup(el.getAttribute('data-logo'), el.getAttribute('data-tone') || 'orange', +el.getAttribute('data-h') || 40, !el.hasAttribute('aria-hidden')); });
  [].forEach.call(document.querySelectorAll('.lang button'), function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  bootTheme();
  $('modalClose').addEventListener('click', closeModal); $('modalOv').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  $('modalPrev').addEventListener('click', function () { if (modalIdx > 0) openModal(modalIdx - 1); }); $('modalNext').addEventListener('click', function () { if (modalAlt && modalIdx < modalAlt.count() - 1) openModal(modalIdx + 1); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modalIdx >= 0) closeModal(); });
  applyLang();
  Menu.boot();
  if (window.DocUI) DocUI.boot();
  if (window.ISLE) ISLE.boot();
})();


