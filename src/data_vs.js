/* ===== [data_vs.js] ===== */
/* ===== UREAX-HG guide: the technology comparison =====
   Six classes of liquid-applied waterproofing set against each other: UREAX-HG (one-component polyurethane-urea), ordinary two-component
   polyurethane, conventional one-component moisture-curing polyurethane, two-component polyurea hybrids, pure polyurea and water-based
   dispersions. Every competitor figure is taken from the manufacturer's published product data sheet (accessed September 2026) and named
   with its product; the class limits of JIS A 6021 frame the Japanese market. Values are those printed; where a sheet gives none, the cell says so. */
var VS_CLASSES = ['hg', 'pu2k', 'pu1k', 'hyb', 'pure', 'wb'];
/* the numbers behind the bars: representative product per class; tensile N/mm², tear N/mm, elongation %, hours to foot traffic, kg/m² of the finished system, days to a finished system (two coats, no topcoat wait) */
var VS_NUM = {
  hg: { name: 'UREAX-HG', tensile: 17, tear: 59, elong: 470, walkH: 5, kgm2: 0.8, days: 1, shoreA: 95, coats: 2, topcoat: 0, mixing: 0 },
  pu2k: { name: 'Sika アスミック NB (2K PU)', tensile: 13, tear: 39, elong: 710, walkH: 18, kgm2: 2.4, days: 3, shoreA: null, coats: 2, topcoat: 1, mixing: 1, jis: { tensile: 2.3, tear: 14, elong: 450 } },
  pu1k: { name: 'Sikalastic-618 (1K PU)', tensile: 4.6, tear: null, elong: 150, walkH: 10, kgm2: 2.4, days: 2, shoreA: null, coats: 2, topcoat: 1, mixing: 0, alt: { name: 'Fosroc Nitoproof 600', tensile: 1.5, tear: 10, elong: 620, walkH: 15 } },
  hyb: { name: 'Sikalastic-800 HA (2K hybrid, hand)', tensile: 10, tear: 13.8, elong: 900, walkH: 7, kgm2: 2.5, days: 2, shoreA: 75, coats: 1, topcoat: 1, mixing: 1, alt: { name: 'Mapei Purtop 400 M (spray)', tensile: 12, tear: 45, elong: 400, walkH: 0.05 } },
  pure: { name: 'Mapei Purtop 1000 (pure polyurea, spray)', tensile: 20, tear: 80, elong: 300, walkH: 0.05, kgm2: 2.2, days: 1, shoreA: 90, coats: 1, topcoat: 1, mixing: 1, alt: { name: 'Fosroc Polyurea WPE110', tensile: 15, tear: 62, elong: 350, walkH: 0.05 } },
  wb: { name: 'Sikalastic-560 (water-based)', tensile: 1.5, tear: null, elong: 350, walkH: 96, kgm2: 1.4, days: 4, shoreA: null, coats: 3, topcoat: 0, mixing: 0, alt: { name: 'Mapei Aquaflex Roof', tensile: 1.0, tear: null, elong: 300, walkH: 48 } }
};
/* the data sheets behind the figures */
var VS_SRC = [
  ['Sika', 'アスミック NB (2K urethane, JIS A 6021 高強度形／高伸長形) — brochure', 'https://jpn.sika.com/dam/dms/jp01/roofing/brochure/CK002_asmic.pdf'],
  ['Sika', 'Sikalastic®-800 HA — 2-part polyurea hybrid, hand applied — PDS 05/2025', 'https://gbr.sika.com/dam/dms/gb01/y/sikalastic-800-ha.pdf'],
  ['Sika', 'Sikalastic®-851 — 2-part PU/polyurea hybrid, hot spray — PDS 07/2023', 'https://gbr.sika.com/dam/dms/gb01/u/sikalastic-851.pdf'],
  ['Sika', 'Sikalastic®-618 — 1-component moisture-triggered PU — PDS 06/2025', 'https://gbr.sika.com/dam/dms/gb01/g/sikalastic-618.pdf'],
  ['Sika', 'Sikalastic®-560 — water-based PU-modified acrylic dispersion — PDS 12/2024', 'https://hkg.sika.com/dam/dms/hk01/2/sikalastic_-560.pdf'],
  ['Mapei', 'Purtop 400 M — 2-component hybrid polyurea, spray — TDS', 'https://cdnmedia.mapei.com/docs/librariesprovider37/products-documents/1_02120_purtop-400-m_en_2b98abadc23b4ebeb6abc7157e4378c7.pdf?sfvrsn=b1d9068_0'],
  ['Mapei', 'Purtop 1000 — 2-component pure polyurea, spray — TDS', 'https://cdnmedia.mapei.com/docs/librariesprovider60/products-documents/1_02126_purtop-1000_en_3c883b0422a6420f9ef52fcd9981b8c1.pdf?sfvrsn=eb776519_0'],
  ['Mapei', 'Aquaflex Roof — water-dispersed synthetic resin membrane — TDS', 'https://cdnmedia.mapei.com/docs/librariesprovider2/products-documents/1_02121_aquaflex-roof_en_b2e5455607a04efc91ebca307789772b.pdf?sfvrsn=c17f26bb_0'],
  ['Fosroc', 'Polyurea WPE110 — 2-component pure polyurea, spray — TDS (Australia)', 'https://www.fosroc.com.au/sites/default/files/products_file_storage/Fosroc_Polyurea_WPE110_TDS.pdf'],
  ['Fosroc', 'Nitoproof 600 — 1-component pitch-modified PU — TDS', 'https://www.petrolinetech.com/wp-content/uploads/2021/12/Nitoproof-600.pdf'],
  ['MC-Bauchemie (MC-BIFI)', 'MC-Proof PU 920 — 1-component hybrid PU — TDS V3', 'https://mcbifi-bauchemie.com/wp-content/uploads/2024/02/TDS_MC-Proof-PU-920_EN_V3.pdf'],
  ['Master Builders Solutions', 'MasterSeal M 800 — 2-component PU/polyurea hybrid, spray — product page', 'https://mbcc.sika.com/en-my/products/masterseal/masterseal-m-800-%E2%80%93-spray-applied-elastomeric-polymer-waterproofing-membrane'],
  ['JIS', 'JIS A 6021:2011 建築用塗膜防水材 — quality table (urethane rubber: high-elongation / high-strength)', 'https://kikakurui.com/a6/A6021-2011-01.html'],
  ['Auto Chemical', 'UREAX-HG TDS 2026/8/7, method statement 2026/8/6, catalogue 2024.02, warranty checklist', 'https://autochem.co.jp/1052/']
];

var VS_T = {};
VS_T.zh = {
  cardH: ['化學組成', '施工方式', '硬化・工程間隔', '注意事項'], tag: '本指南產品', vsTag: '對照',
  kpi: [['7.4×', '對 JIS A 6021 高伸長形下限', '抗拉強度 17 N/mm² 對 2.3 N/mm²'], ['4.2×', '對 JIS A 6021 高伸長形下限', '撕裂強度 59 N/mm 對 14 N/mm'], ['1 天', '一般 PU 系統 2–3 天、水性 4 天', '完成一套系統（FU08）'], ['0.8 kg/㎡', '雙液 PU／聚脲系統 2.2–2.5 kg/㎡', '完成系統的材料用量']],
  barsLow: '越低越好', barsHigh: '越高越好', barsAlt: '同類第二例', barsJis: 'JIS 下限', barsNA: 'TDS 未公布', matrixTitle: '逐項對照表', matrixSub: '18 個項目，從成分到保證。左欄固定，表格可橫向捲動。',
  label: '技術比較', title: '為什麼是 UREAX-HG——與六種液態防水技術正面比較',
  sub: '業主、設計者、總承包商與施工者各有不同的問題。下表把 UREAX-HG 與市場上的一般雙液型 PU、傳統單液 PU、混合型聚脲、純聚脲及水性產品並列，數據取自 Sika、Mapei、Fosroc、MC-Bauchemie、Master Builders 等世界級製造商公開的 TDS（2026 年 9 月查閱），逐項註明產品名稱與出處。',
  fair: '公平原則：所有數字均為各製造商 TDS 印行值（23 °C 標準條件），未做換算或推估；同一類別中不同產品差異很大，表中以具代表性的產品為例，並列出日本 JIS A 6021 的等級下限作為市場基準。報價與規範前請以各製造商最新版 TDS 核對。',
  classes: {
    hg: { name: 'UREAX-HG', chem: '單液型聚氨酯・聚脲塗覆材（濕氣硬化，NV 91%）', apply: '滾筒／毛刷，開罐即用；免面漆', cure: '指觸 60 分；步行 5 h（FU08）；工程間隔 3–10 h', catch: '溶劑型（閃火點 36 °C）：需通風、遠離火源；含水率 < 8% 的乾燥基材' },
    pu2k: { name: '一般雙液型 PU', chem: '雙液聚氨酯（主劑＋硬化劑，現場計量混合）', apply: '滾筒／鏝刀；需底漆＋面漆', cure: '可使用時間 30–60 分†；工程間隔 13–24 h；完全硬化 7 天', catch: '配比與混合品質決定成敗；芳香族塗膜必須靠面漆防紫外線，面漆需週期性重塗' },
    pu1k: { name: '傳統單液 PU', chem: '單液濕氣硬化聚氨酯（部分為瀝青改質或混合型）', apply: '滾筒／刮板；常需織布補強與面漆', cure: '指觸 4–15 h；工程間隔 ≥ 6–18 h；完全硬化 36–48 h', catch: '強度低（1.5–4.6 N/mm²），膜厚靠 2–2.4 kg/㎡ 堆疊；含水率 ≤ 4% 的嚴格要求' },
    hyb: { name: '混合型聚脲', chem: '雙液 PU／聚脲混合（噴塗型或手工型）', apply: '噴塗型：加熱雙組分高壓機（160–200 bar、65–85 °C）；手工型：可使用時間 25 分', cure: '噴塗：凝膠 7–11 秒、完全硬化 1–7 天；手工：步行 4–10 h、完全硬化 20–28 h', catch: '需底漆（常雙道）＋脂肪族面漆（24 h 內）；設備、遮蔽與專業噴塗班；200 kg 級桶裝' },
    pure: { name: '純聚脲', chem: '雙液純聚脲（噴塗）', apply: '加熱雙組分高壓機（2,000–2,500 psi、60–85 °C）', cure: '凝膠 5–10 秒；2 分鐘可步行；完全硬化 1–7 天', catch: '最高強度但也最高門檻：機具、專業班、底漆與 UV 面漆缺一不可；每 2 mm 用量 2.2 kg/㎡' },
    wb: { name: '水性產品', chem: '水性壓克力／PU 改質分散體', apply: '滾筒／毛刷；2–3 道；常需織布補強', cure: '指觸 2–8 h；耐雨 2–4 天；完全乾燥 48 h–4 天', catch: '強度 1.0–1.5 N/mm²；不耐積水、不可浸水；乾燥期間怕雨；低溫高濕不能施工' }
  },
  rows: [
    ['成分・混合', ['單液，免混合；硬化促進劑 S 依季節添加', '雙液，現場精確計量混合（如 Sika アスミック NB 主劑：硬化劑 1:2）', '單液，免混合', '雙液；噴塗型由機器 1:1 混合；手工型（Sikalastic-800 HA）現場混合', '雙液，由高壓機加熱混合', '單液，免混合（可加水稀釋作底漆）']],
    ['可使用時間', ['無（開罐即用，開罐後儘速用完）', '30–60 分†（超過即報廢）', '無', '手工型 ≈ 25 分（20 °C）；噴塗型凝膠 7–11 秒', '凝膠 5–10 秒（只能機噴）', '無']],
    ['設備', ['滾筒、毛刷、打膠槍', '滾筒、鏝刀、攪拌機', '滾筒、刮板', '噴塗型：加熱雙組分高壓機、加熱管、發電機、遮蔽', '加熱雙組分高壓機（2,000–2,500 psi）', '滾筒、毛刷']],
    ['底漆', ['需要：OP-55F（FRP，免打磨）／OP-30B 0.15 kg/㎡', '需要', '視基材（Sikalastic-618 需要；Nitoproof 600 通常不需）', '需要，常建議雙道（Sikalastic-800 HA）', '需要（Primer SN／Nitomortar 903）', '需要（本體加水稀釋）']],
    ['面漆', ['不需要——塗膜本身耐候、耐磨（碳弧 6,000 h 無異常）', '需要（芳香族 PU 粉化）；面漆需定期重塗', '建議／需要（Nitoproof Reflectacoat 等）', '需要脂肪族面漆（Sikalastic-701／Mapecoat PU 20 N，24 h 內）', '需要 UV 面漆（Mapecoat PU 20 N，24 h 內）', '不需要（本身即面層）']],
    ['道數與用量', ['2 道 0.8 kg/㎡（FU08，0.5 mm）；標準 2–3 道 × 0.6 kg/㎡（0.83–1.25 mm）', '2 道 × 1.2 kg/㎡ ≈ 2.4 kg/㎡（2 mm）', '2 道 2.4 kg/㎡（618）；1.3 L/㎡（600）；2 × 1.5 kg/㎡（PU 920）', '2.5 kg/㎡（2 mm，手工）；1.05 kg/㎡ 每 mm（噴塗）', '2.2 kg/㎡ 每 2 mm；最少 1.5 L/㎡', '0.9–1.4 kg/㎡（0.3–0.5 mm）；2 kg/㎡（0.8–1 mm）']],
    ['工程間隔・可步行', ['工程間隔 3–10 h；步行 5 h（FU08）／24 h', '13–24 h（15–25 °C）；完全硬化 7 天', '≥ 4–18 h；步行 6–15 h', '手工：步行 4–10 h；噴塗：數分鐘', '2 分鐘可步行', '≈ 8 h 重塗；耐雨 2–4 天']],
    ['完成一套系統', ['1 天（FU08）；標準 2–3 天', '3 天以上（含面漆）', '2–3 天', '1–2 天（含面漆）', '1 天（含面漆）', '2–5 天']],
    ['抗拉強度', ['17 N/mm²（JIS 高強度形 ≥ 10）', 'JIS 高伸長形 ≥ 2.3；アスミック NB 13', '4.6（618）；1.5（600）；≥ 2（PU 920）', '10（800 HA）；≈ 11（851）；> 12（Purtop 400 M）', '> 20（Purtop 1000）；15（WPE110）', '1.5（560，無補強）；1.0（Aquaflex Roof）']],
    ['撕裂強度', ['59 N/mm（JIS 高強度形 ≥ 30）', 'JIS 高伸長形 ≥ 14；アスミック NB 39', '10 N/mm（600）；其餘未公布', '13.8（800 HA）；> 45（Purtop 400 M）', '> 80（Purtop 1000）；60–65（WPE110）', '未公布']],
    ['破斷伸長率', ['470%', '≥ 450%；710%（アスミック NB）', '150%（618）；620%（600）；> 600%（PU 920）', '900%（800 HA）；≈ 350%（851）；> 400%（400 M）', '> 300%（Purtop 1000）；> 350%（WPE110）', '350%（560）；300%（Aquaflex Roof）']],
    ['硬度', ['Shore A 95', '未公布（一般 A 30–50†）', 'A 15（600）；A 50（PU 920）', 'A 75（800 HA）；A 85（851）；A 70／D 35（400 M）', 'A 90／D 45（Purtop 1000）；D 40（WPE110）', '未公布']],
    ['耐候', ['碳弧 4,000／6,000 h 無異常，8,000 h 細裂；免面漆', '塗膜靠面漆', '塗膜靠面漆或補強層', '需脂肪族面漆', '需 UV 面漆', '本體耐候但強度低']],
    ['基材含水率', ['< 8%', '乾燥（通常 ≤ 4–5%†）；濕氣導致發泡', '≤ 4%（618）；≤ 10%（PU 920）', '< 4%（800 HA）', '乾燥基材＋底漆', '≤ 6%（560）；不可潮濕']],
    ['施工溫度', ['5–35 °C（冬季加促進劑）', '5–35 °C', '5–40 °C', '2–40 °C（手工）；1–40 °C（噴塗）', '5–40 °C', '8–35 °C（560）；5–35 °C（Aquaflex Roof）']],
    ['VOC・氣味', ['溶劑型（NV 91%；環保型稀釋劑 K）；F☆☆☆☆', '溶劑型（多數）', '溶劑型（NV 79–80%）', '無溶劑（0.09 g/L）；噴塗型 < 500 g/L', '無溶劑', '水性（< 50 g/L）']],
    ['包裝', ['18 kg 罐（3.2 kg 小罐）', '12 kg ＋ 12 kg 套組', '15 L／20 L／22 kg 桶', '25 kg 套組（手工）；211＋202 kg 桶（噴塗）', '220＋225 kg 桶', '20 kg 桶']],
    ['保證', ['專案限定型材料保證 10 年（依檢核表）', '依製造商', '依製造商', '依製造商', '依製造商', '依製造商']]
  ],
  rowsH: ['項目', 'UREAX-HG', '一般雙液 PU', '傳統單液 PU', '混合型聚脲', '純聚脲', '水性'],
  bars: { title: '數據對照（各類別代表產品的 TDS 印行值）', items: [['tensile', '抗拉強度', 'N/mm²'], ['tear', '撕裂強度', 'N/mm'], ['elong', '破斷伸長率', '%'], ['walkH', '可步行所需時間', 'h'], ['kgm2', '完成系統用量', 'kg/㎡'], ['days', '完成一套系統', '天']], note: '撕裂強度：Sikalastic-618 與水性產品 TDS 未公布，以「—」表示。可步行時間：噴塗聚脲為數分鐘，圖上以 0.05 h 顯示。' },
  aud: {
    title: '對每一位讀者的答案', sub: '同一個產品，四種角度。',
    tabs: [['owner', '業主'], ['designer', '設計者'], ['gc', '總承包商'], ['app', '施工者']],
    owner: ['沒有面漆，就沒有面漆的重塗週期：一般 PU 系統的面漆每幾年要重塗一次†，UREAX-HG 的塗膜本身通過 6,000 小時碳弧耐候無異常，20 年生命週期內少一整項維護成本。', '17 N/mm² 的抗拉、59 N/mm 的撕裂與 Shore A 95：盆栽、桌椅、推車與人流留下的是痕跡，不是破洞——比一般雙液 PU（JIS 高伸長形 2.3 N/mm²、14 N/mm）高一個數量級。', '1 天完工（FU08）：住戶當天傍晚就能走上陽台；純聚脲同樣快，但需要噴塗機具、遮蔽與專業班，小面積的動員成本落在你的報價裡。', '製造商專案限定型材料保證 10 年：底漆、下地調整材（NBQ）、端末密封材（EXCEED）與塗膜同一製造商，責任單一。', 'F☆☆☆☆ 低甲醛登錄，0.5–1.25 mm 的薄膜不增加結構荷載，也不改變門檻與排水口的高差。'],
    designer: ['JIS A 6021 高強度形的規格值是抗拉 ≥ 10 N/mm²、撕裂 ≥ 30 N/mm、伸長 ≥ 200%；UREAX-HG 自主試驗 17／59／470%，兼具高強度與高伸長，可寫入規範作為最低要求。', '膜厚可依用途規範：0.5 mm（FU08）、0.83 mm（2 道）、1.25 mm（3 道）——每 0.1 kg/㎡ ＝ 0.0695 mm，換算透明。', 'FRP 基材免打磨（OP-55F）、既有聚氨酯層可直接翻新（OP-30B）：拆除量最少、廢棄物最少，翻新設計最省。', '收邊有標準答案：入隅・出隅・裂縫用 NON-BLEED QUICK、塗膜端末用 EXCEED（ASTM C920 class 50、30 年級耐候），不必自行拼湊細部。', '基材含水率允許 < 8%，而混合型聚脲與傳統單液 PU 常要求 ≤ 4%——在台灣的濕度條件下，這是能否如期施工的差別。', '標準施工規範、TDS、保證檢核表齊備（日文＋繁體中文），規範引用有據。'],
    gc: ['工期：FU08 一個工作日；標準規格 2–3 天。一般雙液 PU 每道間隔 13–24 小時、完全硬化 7 天再加面漆；水性產品耐雨要 2–4 天——雨季的風險完全不同。', '不需要噴塗設備：混合型／純聚脲的雙組分加熱高壓機（160–200 bar、65–85 °C）、加熱管、發電機、遮蔽與專業班，在陽台、走廊這種零碎面積上是不成比例的成本。', '沒有混合失誤、沒有可使用時間的報廢：單液開罐即用，材料損耗可控，18 kg 罐裝人力可搬運（噴塗聚脲為 200 kg 級桶）。', '指觸乾燥 60 分鐘、工程間隔 3–10 小時：突發降雨的暴露窗口短；1Day 模擬器可依氣溫與促進劑排程。', '品保簡單：檢核表只要記錄各工程面積、用量與 LOT 照片——不需要膜厚儀與噴塗參數紀錄。', '安全：閃火點 36 °C 的溶劑型材料，仍需通風與禁火管理；純聚脲雖無溶劑，但異氰酸酯噴霧的呼吸防護要求更高。'],
    app: ['開罐即用：沒有計量、沒有攪拌配比、沒有硬化劑用錯的風險，也不會因為可使用時間到了而倒掉半罐。', '滾筒與毛刷就能完成，立面 0.4 kg/㎡ 一道不流掛；防滑面只要在最後一道加珪砂。', '下地調整 NBQ 約 1 小時後就能上塗，不用等一天；裂縫與入隅用打膠槍一次處理。', '天冷加硬化促進劑 S（2.5／5.0 wt%），黏度高加稀釋劑 K（≤ 7.5%）——早見表告訴你多久能塗下一道。', '不需要織布補強、不需要面漆、不需要清洗噴槍與管線；工具用稀釋劑 K 清潔。', '塗布量一目了然：每罐 18 kg 約 30 ㎡（第一道 0.6 kg/㎡），配合 0.15 kg/㎡ 底漆一算就準。']
  },
  honest: { title: '什麼時候別的技術更合適', text: '大面積車行甲板、蓄水池與需要 2–3 mm 一次成膜的水利工程：噴塗純聚脲的機具投資在那裡才划算。全面禁止溶劑氣味的室內：水性產品。上千平方米的屋頂由專業噴塗班承包：混合型聚脲的每平方米速度。UREAX-HG 的主場是陽台、露台、走廊、樓梯平台、FRP 與既有聚氨酯的翻新——面積零碎、需要當天開放、而且要 10 年不回頭。' },
  src: { title: '數據出處', sub: '各製造商公開文件（2026 年 9 月查閱）；† 為一般實務經驗值，非製造商規範。' }
};

VS_T.en = {
  cardH: ['Chemistry', 'Application', 'Curing and intervals', 'Watch-outs'], tag: 'this guide', vsTag: 'compared',
  kpi: [['7.4×', 'JIS A 6021 high-elongation minimum', 'tensile strength 17 vs 2.3 N/mm²'], ['4.2×', 'JIS A 6021 high-elongation minimum', 'tear strength 59 vs 14 N/mm'], ['1 day', 'ordinary PU systems 2–3 days, water-based 4', 'to a finished system (FU08)'], ['0.8 kg/m²', '2K PU and polyurea systems 2.2–2.5 kg/m²', 'material for the finished system']],
  barsLow: 'lower is better', barsHigh: 'higher is better', barsAlt: 'second example of the class', barsJis: 'JIS minimum', barsNA: 'not published', matrixTitle: 'Criterion by criterion', matrixSub: '18 criteria, from chemistry to warranty. The first column stays put; the table scrolls sideways.',
  label: 'Technology comparison', title: 'Why UREAX-HG — six liquid waterproofing technologies side by side',
  sub: 'Owners, designers, main contractors and applicators ask different questions. The tables set UREAX-HG against ordinary two-component polyurethane, conventional one-component polyurethane, polyurea hybrids, pure polyurea and water-based products, with every figure taken from the published data sheets of Sika, Mapei, Fosroc, MC-Bauchemie and Master Builders Solutions (accessed September 2026), product named and source linked.',
  fair: 'Fair play: all numbers are the values printed in the manufacturers’ data sheets at 23 °C standard conditions, neither converted nor estimated; products within a class differ, so one representative product stands for each, with the class limits of JIS A 6021 as the market baseline. Check the current data sheet before specifying or quoting.',
  classes: {
    hg: { name: 'UREAX-HG', chem: 'one-component polyurethane-urea coating (moisture-curing, 91 % solids)', apply: 'roller or brush, straight from the can; no topcoat', cure: 'tack-free 60 min; walkable 5 h (FU08); interval 3–10 h', catch: 'solvent-borne (flash point 36 °C): ventilation, no naked flames; dry substrate < 8 %' },
    pu2k: { name: 'Ordinary 2-component PU', chem: 'two-component polyurethane (base + hardener metered and mixed on site)', apply: 'roller or trowel; primer and topcoat', cure: 'pot life 30–60 min†; interval 13–24 h; full cure 7 days', catch: 'the mix ratio decides everything; the aromatic film needs a topcoat against UV, and the topcoat needs renewing' },
    pu1k: { name: 'Conventional 1-component PU', chem: 'one-component moisture-curing polyurethane (some pitch-modified or hybrid)', apply: 'roller or squeegee; often fleece reinforcement and a topcoat', cure: 'tack-free 4–15 h; interval ≥ 6–18 h; full cure 36–48 h', catch: 'low strength (1.5–4.6 N/mm²), thickness built up with 2–2.4 kg/m²; substrate moisture ≤ 4 %' },
    hyb: { name: 'Polyurea hybrid', chem: 'two-component PU/polyurea hybrid (spray or hand grade)', apply: 'spray: heated plural-component pump (160–200 bar, 65–85 °C); hand: pot life 25 min', cure: 'spray: gel 7–11 s, full cure 1–7 days; hand: walkable 4–10 h, full cure 20–28 h', catch: 'primer (often twice) plus an aliphatic topcoat within 24 h; plant, masking and a trained spray crew; 200 kg drums' },
    pure: { name: 'Pure polyurea', chem: 'two-component pure polyurea (spray)', apply: 'heated plural-component pump (2,000–2,500 psi, 60–85 °C)', cure: 'gel 5–10 s; walkable in 2 min; full cure 1–7 days', catch: 'the strongest film and the highest entry ticket: plant, crew, primer and UV topcoat are all mandatory; 2.2 kg/m² per 2 mm' },
    wb: { name: 'Water-based', chem: 'water-based acrylic / PU-modified dispersions', apply: 'roller or brush; 2–3 coats; often fleece', cure: 'tack-free 2–8 h; rain resistant after 2–4 days; dry in 48 h–4 days', catch: 'strength 1.0–1.5 N/mm²; no ponding water, no immersion; rain during drying ruins it; not in cold, humid weather' }
  },
  rows: [
    ['Components, mixing', ['one component, no mixing; Accelerator S by season', 'two components metered on site (Sika アスミック NB base : hardener 1 : 2)', 'one component, no mixing', 'two components; spray grade mixed 1 : 1 by the machine; hand grade (Sikalastic-800 HA) mixed on site', 'two components, heated and mixed by the pump', 'one component, no mixing (diluted with water as its own primer)']],
    ['Pot life', ['none (ready to use; use opened cans promptly)', '30–60 min† (then waste)', 'none', 'hand ≈ 25 min at 20 °C; spray gel 7–11 s', 'gel 5–10 s (machine only)', 'none']],
    ['Equipment', ['roller, brush, caulking gun', 'roller, trowel, mixer', 'roller, squeegee', 'spray: heated plural-component pump, heated hoses, generator, masking', 'heated plural-component pump (2,000–2,500 psi)', 'roller, brush']],
    ['Primer', ['yes: OP-55F on FRP (no sanding) / OP-30B, 0.15 kg/m²', 'yes', 'by substrate (Sikalastic-618 yes; Nitoproof 600 usually not)', 'yes, often twice (Sikalastic-800 HA)', 'yes (Primer SN / Nitomortar 903)', 'yes (the product diluted)']],
    ['Topcoat', ['none — the film itself weathers and wears (carbon arc 6,000 h unchanged)', 'yes (aromatic PU chalks); renewed periodically', 'recommended / required (Nitoproof Reflectacoat etc.)', 'aliphatic topcoat required (Sikalastic-701 / Mapecoat PU 20 N within 24 h)', 'UV topcoat required (Mapecoat PU 20 N within 24 h)', 'none (it is the finish)']],
    ['Coats and consumption', ['2 coats 0.8 kg/m² (FU08, 0.5 mm); standard 2–3 × 0.6 kg/m² (0.83–1.25 mm)', '2 × 1.2 kg/m² ≈ 2.4 kg/m² (2 mm)', '2 coats 2.4 kg/m² (618); 1.3 l/m² (600); 2 × 1.5 kg/m² (PU 920)', '2.5 kg/m² for 2 mm (hand); 1.05 kg/m² per mm (spray)', '2.2 kg/m² per 2 mm; min. 1.5 l/m²', '0.9–1.4 kg/m² (0.3–0.5 mm); 2 kg/m² (0.8–1 mm)']],
    ['Interval, walkable', ['interval 3–10 h; walkable 5 h (FU08) / 24 h', '13–24 h (15–25 °C); full cure 7 days', '≥ 4–18 h; walkable 6–15 h', 'hand: walkable 4–10 h; spray: minutes', 'walkable in 2 minutes', 'recoat ≈ 8 h; rain resistant after 2–4 days']],
    ['Finished system', ['1 day (FU08); standard 2–3 days', '3 days or more (with topcoat)', '2–3 days', '1–2 days (with topcoat)', '1 day (with topcoat)', '2–5 days']],
    ['Tensile strength', ['17 N/mm² (JIS high-strength ≥ 10)', 'JIS high-elongation ≥ 2.3; アスミック NB 13', '4.6 (618); 1.5 (600); ≥ 2 (PU 920)', '10 (800 HA); ≈ 11 (851); > 12 (Purtop 400 M)', '> 20 (Purtop 1000); 15 (WPE110)', '1.5 (560, unreinforced); 1.0 (Aquaflex Roof)']],
    ['Tear strength', ['59 N/mm (JIS high-strength ≥ 30)', 'JIS high-elongation ≥ 14; アスミック NB 39', '10 N/mm (600); others not published', '13.8 (800 HA); > 45 (Purtop 400 M)', '> 80 (Purtop 1000); 60–65 (WPE110)', 'not published']],
    ['Elongation at break', ['470 %', '≥ 450 %; 710 % (アスミック NB)', '150 % (618); 620 % (600); > 600 % (PU 920)', '900 % (800 HA); ≈ 350 % (851); > 400 % (400 M)', '> 300 % (Purtop 1000); > 350 % (WPE110)', '350 % (560); 300 % (Aquaflex Roof)']],
    ['Hardness', ['Shore A 95', 'not published (typically A 30–50†)', 'A 15 (600); A 50 (PU 920)', 'A 75 (800 HA); A 85 (851); A 70 / D 35 (400 M)', 'A 90 / D 45 (Purtop 1000); D 40 (WPE110)', 'not published']],
    ['Weathering', ['carbon arc 4,000 / 6,000 h unchanged, fine cracks at 8,000 h; no topcoat', 'the film relies on its topcoat', 'relies on a topcoat or reinforcement', 'aliphatic topcoat needed', 'UV topcoat needed', 'weathers on its own but weak']],
    ['Substrate moisture', ['< 8 %', 'dry (typically ≤ 4–5 %†); moisture foams the film', '≤ 4 % (618); ≤ 10 % (PU 920)', '< 4 % (800 HA)', 'dry substrate + primer', '≤ 6 % (560); never damp']],
    ['Application temperature', ['5–35 °C (accelerator in winter)', '5–35 °C', '5–40 °C', '2–40 °C (hand); 1–40 °C (spray)', '5–40 °C', '8–35 °C (560); 5–35 °C (Aquaflex Roof)']],
    ['VOC, odour', ['solvent-borne (91 % solids; low-emission Thinner K); F☆☆☆☆', 'solvent-borne (mostly)', 'solvent-borne (79–80 % solids)', 'solvent-free (0.09 g/l); spray grade < 500 g/l', 'solvent-free', 'water-based (< 50 g/l)']],
    ['Packaging', ['18 kg can (3.2 kg small can)', '12 kg + 12 kg set', '15 l / 20 l / 22 kg pails', '25 kg set (hand); 211 + 202 kg drums (spray)', '220 + 225 kg drums', '20 kg pails']],
    ['Warranty', ['project-limited 10-year material warranty (per checklist)', 'by manufacturer', 'by manufacturer', 'by manufacturer', 'by manufacturer', 'by manufacturer']]
  ],
  rowsH: ['Criterion', 'UREAX-HG', 'Ordinary 2K PU', 'Conventional 1K PU', 'Polyurea hybrid', 'Pure polyurea', 'Water-based'],
  bars: { title: 'The figures side by side (data-sheet values of one representative product per class)', items: [['tensile', 'Tensile strength', 'N/mm²'], ['tear', 'Tear strength', 'N/mm'], ['elong', 'Elongation at break', '%'], ['walkH', 'Time to foot traffic', 'h'], ['kgm2', 'Material for the finished system', 'kg/m²'], ['days', 'Days to a finished system', 'days']], note: 'Tear strength: not published for Sikalastic-618 and the water-based products (shown as —). Foot traffic: sprayed polyurea takes minutes, drawn as 0.05 h.' },
  aud: {
    title: 'An answer for every reader', sub: 'One product, four points of view.',
    tabs: [['owner', 'Owner'], ['designer', 'Designer'], ['gc', 'Main contractor'], ['app', 'Applicator']],
    owner: ['No topcoat means no topcoat renewal cycle: ordinary PU systems have their topcoat redone every few years†; the UREAX-HG film itself passed 6,000 h of carbon-arc weathering unchanged — one whole maintenance item less over a 20-year life.', '17 N/mm² tensile, 59 N/mm tear and Shore A 95: planters, furniture, trolleys and foot traffic leave marks, not holes — an order of magnitude above ordinary two-component PU (JIS high-elongation class 2.3 N/mm², 14 N/mm).', 'Finished in a day (FU08): tenants walk on the balcony the same evening. Pure polyurea is as fast, but its spray plant, masking and crew put a mobilisation cost into your quote that small areas cannot carry.', 'A project-limited 10-year material warranty from the manufacturer: primer, adjustment sealant (NBQ), termination sealant (EXCEED) and the film from one maker — one responsibility.', 'F☆☆☆☆ low-emission registration; a 0.5–1.25 mm film adds no structural load and does not change threshold and drain levels.'],
    designer: ['The JIS A 6021 high-strength class asks for tensile ≥ 10 N/mm², tear ≥ 30 N/mm and elongation ≥ 200 %; UREAX-HG’s in-house tests give 17 / 59 / 470 % — high strength and high elongation together, usable as a minimum in the specification.', 'Thickness follows the use: 0.5 mm (FU08), 0.83 mm (two coats), 1.25 mm (three coats) — 0.1 kg/m² = 0.0695 mm, a transparent conversion.', 'FRP without sanding (OP-55F) and old urethane overcoated directly (OP-30B): minimum demolition, minimum waste — the most economical renewal design.', 'The details have standard answers: NON-BLEED QUICK for internal and external corners and cracks, EXCEED for the film edges (ASTM C920 class 50, 30-year-class weathering) — nothing to improvise.', 'Substrate moisture up to 8 % is allowed, where polyurea hybrids and conventional 1K PU often demand ≤ 4 % — in Taiwan’s humidity that decides whether the work starts on time.', 'Method statement, TDS and warranty checklist (Japanese and Traditional Chinese) are available for citation.'],
    gc: ['Programme: FU08 in one working day; the standard specification in 2–3 days. Ordinary 2K PU waits 13–24 h between coats and 7 days to full cure before its topcoat; water-based products need 2–4 days before rain — in the wet season these are different risks.', 'No spray plant: the heated plural-component pumps (160–200 bar, 65–85 °C), heated hoses, generator, masking and trained crew of hybrid and pure polyurea are out of proportion on balconies and corridors.', 'No mixing errors, no pot-life waste: one component, straight from the can, controllable wastage, 18 kg cans a person can carry (sprayed polyurea comes in 200 kg drums).', 'Tack-free in 60 minutes, interval 3–10 h: a short exposure window for a sudden shower; the 1Day simulator plans the day by temperature and accelerator.', 'Simple QA: the checklist records area, consumption and LOT photographs per step — no film gauges or spray-parameter logs.', 'Safety: a solvent-borne material with a 36 °C flash point still needs ventilation and a no-flame regime; pure polyurea is solvent-free but its isocyanate spray mist demands higher respiratory protection.'],
    app: ['Straight from the can: no metering, no mix ratio, no wrong hardener, and no half can poured away because the pot life ran out.', 'Roller and brush do the job; upstands take 0.4 kg/m² per coat without sagging; the anti-slip surface is sand in the last coat.', 'NBQ adjustment can be overcoated after about an hour — no waiting a day; cracks and corners are one pass with the caulking gun.', 'Cold: add Accelerator S (2.5 / 5.0 wt%); thick: add Thinner K (≤ 7.5 %) — the cure table says when the next coat goes on.', 'No fleece, no topcoat, no gun and hose cleaning; tools clean with Thinner K.', 'Consumption is transparent: an 18 kg can does about 30 m² of first coat (0.6 kg/m²); with 0.15 kg/m² of primer the take-off is a one-line sum.']
  },
  honest: { title: 'When another technology fits better', text: 'Large vehicle decks, water tanks and hydraulic structures that need 2–3 mm in one pass: that is where the plant investment of sprayed pure polyurea pays. Interiors where solvent odour is banned outright: water-based. Thousands of square metres of roof contracted to a spray crew: the per-square-metre speed of a polyurea hybrid. UREAX-HG’s home ground is balconies, terraces, corridors, landings and the renewal of FRP and old urethane — fragmented areas that must reopen the same day and stay closed for ten years.' },
  src: { title: 'Sources', sub: 'Manufacturers’ public documents (accessed September 2026); † marks general trade experience, not a manufacturer’s specification.' }
};

VS_T.ja = {
  cardH: ['化学組成', '施工方法', '硬化・工程間隔', '注意点'], tag: '本ガイドの製品', vsTag: '比較対象',
  kpi: [['7.4 倍', 'JIS A 6021 高伸長形の下限比', '引張強さ 17 N/mm² 対 2.3 N/mm²'], ['4.2 倍', 'JIS A 6021 高伸長形の下限比', '引裂強さ 59 N/mm 対 14 N/mm'], ['1 日', '一般的なウレタン系 2〜3 日、水系 4 日', 'システム完成まで（FU08）'], ['0.8 kg/㎡', '2 液ウレタン／ポリウレア系 2.2〜2.5 kg/㎡', 'システム完成の材料量']],
  barsLow: '低いほど良い', barsHigh: '高いほど良い', barsAlt: '同クラスの第 2 例', barsJis: 'JIS 下限', barsNA: 'TDS 未公表', matrixTitle: '項目別対照表', matrixSub: '成分から保証まで 18 項目。左列は固定、表は横スクロールできます。',
  label: '技術比較', title: 'なぜウレアックスHGか——6 種の塗膜防水技術を並べて比較',
  sub: '発注者、設計者、元請、施工者はそれぞれ違う問いを持っています。表はウレアックスHGを一般的な 2 液ウレタン、従来の 1 液ウレタン、ポリウレアハイブリッド、純ポリウレア、水系製品と並べ、数値はすべて Sika、Mapei、Fosroc、MC-Bauchemie、Master Builders Solutions などが公開する TDS（2026 年 9 月閲覧）から製品名と出典付きで引用しています。',
  fair: 'フェアプレー：数値は各社 TDS の印刷値（23 °C 標準条件）であり、換算や推定はしていません。同じ分類でも製品差が大きいため代表製品を 1 つずつ示し、日本市場の基準として JIS A 6021 の種別下限を併記しています。仕様決定や見積の前に最新の TDS で確認してください。',
  classes: {
    hg: { name: 'ウレアックスHG', chem: '1 液ウレタン・ウレアコーティング材（湿気硬化、不揮発分 91%）', apply: 'ローラー／刷毛、缶からそのまま；トップコート不要', cure: '指触 60 分；歩行 5 h（FU08）；工程間隔 3〜10 h', catch: '溶剤系（引火点 36 °C）：換気と火気厳禁；含水率 8% 未満の乾燥した下地' },
    pu2k: { name: '一般的な 2 液ウレタン', chem: '2 液ウレタン（主剤＋硬化剤を現場で計量・混合）', apply: 'ローラー／コテ；プライマー＋トップコート', cure: '可使時間 30〜60 分†；工程間隔 13〜24 h；完全硬化 7 日', catch: '配合と混合の品質がすべて；芳香族塗膜は紫外線をトップコートで防ぎ、トップコートは塗替えが必要' },
    pu1k: { name: '従来の 1 液ウレタン', chem: '1 液湿気硬化ウレタン（ピッチ変性やハイブリッドを含む）', apply: 'ローラー／ゴムベラ；多くは補強布とトップコート', cure: '指触 4〜15 h；工程間隔 6〜18 h 以上；完全硬化 36〜48 h', catch: '強度が低く（1.5〜4.6 N/mm²）、膜厚は 2〜2.4 kg/㎡ の積み重ね；含水率 4% 以下の厳しい条件' },
    hyb: { name: 'ポリウレアハイブリッド', chem: '2 液ウレタン／ポリウレア ハイブリッド（吹付けまたは手塗り）', apply: '吹付け：加熱 2 液高圧機（160〜200 bar、65〜85 °C）；手塗り：可使時間 25 分', cure: '吹付け：ゲル 7〜11 秒、完全硬化 1〜7 日；手塗り：歩行 4〜10 h、完全硬化 20〜28 h', catch: 'プライマー（多くは 2 回）＋24 h 以内の脂肪族トップコート；機材、養生、専門の吹付け班；200 kg 級ドラム' },
    pure: { name: '純ポリウレア', chem: '2 液純ポリウレア（吹付け）', apply: '加熱 2 液高圧機（2,000〜2,500 psi、60〜85 °C）', cure: 'ゲル 5〜10 秒；2 分で歩行可；完全硬化 1〜7 日', catch: '最高強度だが最も参入コストが高い：機材、班、プライマー、UV トップコートのすべてが必須；2 mm あたり 2.2 kg/㎡' },
    wb: { name: '水系製品', chem: '水系アクリル／ウレタン変性ディスパージョン', apply: 'ローラー／刷毛；2〜3 回；多くは補強布', cure: '指触 2〜8 h；耐雨 2〜4 日；完全乾燥 48 h〜4 日', catch: '強度 1.0〜1.5 N/mm²；水たまり・浸水不可；乾燥中の雨で台無し；低温多湿では施工不可' }
  },
  rows: [
    ['成分・混合', ['1 液、混合不要；季節により硬化促進剤 S', '2 液を現場で計量混合（Sika アスミック NB 主剤：硬化剤 1:2）', '1 液、混合不要', '2 液；吹付け型は機械が 1:1 で混合；手塗り型（Sikalastic-800 HA）は現場混合', '2 液、高圧機で加熱混合', '1 液、混合不要（水で希釈してプライマーに）']],
    ['可使時間', ['なし（開缶後は早めに使い切る）', '30〜60 分†（超過分は廃棄）', 'なし', '手塗り ≈ 25 分（20 °C）；吹付けはゲル 7〜11 秒', 'ゲル 5〜10 秒（機械吹付けのみ）', 'なし']],
    ['機材', ['ローラー、刷毛、コーキングガン', 'ローラー、コテ、撹拌機', 'ローラー、ゴムベラ', '吹付け：加熱 2 液高圧機、加熱ホース、発電機、養生', '加熱 2 液高圧機（2,000〜2,500 psi）', 'ローラー、刷毛']],
    ['プライマー', ['必要：OP-55F（FRP、サンディング不要）／OP-30B 0.15 kg/㎡', '必要', '下地による（Sikalastic-618 は必要；Nitoproof 600 は通常不要）', '必要、多くは 2 回（Sikalastic-800 HA）', '必要（Primer SN／Nitomortar 903）', '必要（本体を希釈）']],
    ['トップコート', ['不要——塗膜自体が耐候・耐摩耗（カーボンアーク 6,000 h 異常なし）', '必要（芳香族ウレタンは白亜化）；定期的に塗替え', '推奨／必要（Nitoproof Reflectacoat など）', '脂肪族トップコートが必要（Sikalastic-701／Mapecoat PU 20 N、24 h 以内）', 'UV トップコートが必要（Mapecoat PU 20 N、24 h 以内）', '不要（それ自体が仕上げ）']],
    ['回数と塗布量', ['2 回 0.8 kg/㎡（FU08、0.5 mm）；標準 2〜3 回 × 0.6 kg/㎡（0.83〜1.25 mm）', '2 回 × 1.2 kg/㎡ ≈ 2.4 kg/㎡（2 mm）', '2 回 2.4 kg/㎡（618）；1.3 L/㎡（600）；2 × 1.5 kg/㎡（PU 920）', '2 mm で 2.5 kg/㎡（手塗り）；1 mm あたり 1.05 kg/㎡（吹付け）', '2 mm あたり 2.2 kg/㎡；最少 1.5 L/㎡', '0.9〜1.4 kg/㎡（0.3〜0.5 mm）；2 kg/㎡（0.8〜1 mm）']],
    ['工程間隔・歩行', ['工程間隔 3〜10 h；歩行 5 h（FU08）／24 h', '13〜24 h（15〜25 °C）；完全硬化 7 日', '4〜18 h 以上；歩行 6〜15 h', '手塗り：歩行 4〜10 h；吹付け：数分', '2 分で歩行可', '塗り重ね ≈ 8 h；耐雨 2〜4 日']],
    ['システム完成まで', ['1 日（FU08）；標準 2〜3 日', '3 日以上（トップコート含む）', '2〜3 日', '1〜2 日（トップコート含む）', '1 日（トップコート含む）', '2〜5 日']],
    ['引張強さ', ['17 N/mm²（JIS 高強度形 ≥ 10）', 'JIS 高伸長形 ≥ 2.3；アスミック NB 13', '4.6（618）；1.5（600）；≥ 2（PU 920）', '10（800 HA）；≈ 11（851）；> 12（Purtop 400 M）', '> 20（Purtop 1000）；15（WPE110）', '1.5（560、無補強）；1.0（Aquaflex Roof）']],
    ['引裂強さ', ['59 N/mm（JIS 高強度形 ≥ 30）', 'JIS 高伸長形 ≥ 14；アスミック NB 39', '10 N/mm（600）；他は未公表', '13.8（800 HA）；> 45（Purtop 400 M）', '> 80（Purtop 1000）；60〜65（WPE110）', '未公表']],
    ['破断伸び', ['470%', '≥ 450%；710%（アスミック NB）', '150%（618）；620%（600）；> 600%（PU 920）', '900%（800 HA）；≈ 350%（851）；> 400%（400 M）', '> 300%（Purtop 1000）；> 350%（WPE110）', '350%（560）；300%（Aquaflex Roof）']],
    ['硬さ', ['ショア A 95', '未公表（一般に A 30〜50†）', 'A 15（600）；A 50（PU 920）', 'A 75（800 HA）；A 85（851）；A 70／D 35（400 M）', 'A 90／D 45（Purtop 1000）；D 40（WPE110）', '未公表']],
    ['耐候性', ['カーボンアーク 4,000／6,000 h 異常なし、8,000 h で微細亀裂；トップコート不要', '塗膜はトップコート頼み', 'トップコートか補強層頼み', '脂肪族トップコートが必要', 'UV トップコートが必要', '自身は耐候だが低強度']],
    ['下地含水率', ['8% 未満', '乾燥（通常 4〜5% 以下†）；湿気で発泡', '4% 以下（618）；10% 以下（PU 920）', '4% 未満（800 HA）', '乾燥下地＋プライマー', '6% 以下（560）；湿った下地は不可']],
    ['施工温度', ['5〜35 °C（冬は促進剤）', '5〜35 °C', '5〜40 °C', '2〜40 °C（手塗り）；1〜40 °C（吹付け）', '5〜40 °C', '8〜35 °C（560）；5〜35 °C（Aquaflex Roof）']],
    ['VOC・臭気', ['溶剤系（不揮発分 91%；環境対応型希釈溶剤 K）；F☆☆☆☆', '溶剤系（多くは）', '溶剤系（不揮発分 79〜80%）', '無溶剤（0.09 g/L）；吹付け型 < 500 g/L', '無溶剤', '水系（< 50 g/L）']],
    ['荷姿', ['18 kg 缶（3.2 kg 缶）', '12 kg ＋ 12 kg セット', '15 L／20 L／22 kg 缶', '25 kg セット（手塗り）；211＋202 kg ドラム（吹付け）', '220＋225 kg ドラム', '20 kg 缶']],
    ['保証', ['プロジェクト限定 材料保証 10 年（チェックリスト前提）', 'メーカーによる', 'メーカーによる', 'メーカーによる', 'メーカーによる', 'メーカーによる']]
  ],
  rowsH: ['項目', 'ウレアックスHG', '一般的な 2 液ウレタン', '従来の 1 液ウレタン', 'ポリウレアハイブリッド', '純ポリウレア', '水系'],
  bars: { title: '数値の並列（各分類の代表製品の TDS 印刷値）', items: [['tensile', '引張強さ', 'N/mm²'], ['tear', '引裂強さ', 'N/mm'], ['elong', '破断伸び', '%'], ['walkH', '歩行可能まで', 'h'], ['kgm2', 'システム完成の材料量', 'kg/㎡'], ['days', 'システム完成までの日数', '日']], note: '引裂強さ：Sikalastic-618 と水系製品は TDS 未公表（— で表示）。歩行可能まで：吹付けポリウレアは数分のため 0.05 h として描画。' },
  aud: {
    title: 'それぞれの読者への答え', sub: '同じ製品を 4 つの視点から。',
    tabs: [['owner', '発注者'], ['designer', '設計者'], ['gc', '元請'], ['app', '施工者']],
    owner: ['トップコートがなければ、トップコートの塗替え周期もない：一般的なウレタン系はトップコートを数年ごとに塗り替える†が、ウレアックスHGの塗膜自体がカーボンアーク 6,000 時間で異常なし——20 年のライフサイクルで維持項目が丸ごと一つ減る。', '引張 17 N/mm²、引裂 59 N/mm、ショア A 95：プランター、家具、台車、人の往来が残すのは跡であって穴ではない——一般的な 2 液ウレタン（JIS 高伸長形 2.3 N/mm²、14 N/mm）より一桁上。', '1 日で完成（FU08）：入居者はその日の夕方にベランダへ出られる。純ポリウレアも同じ速さだが、吹付け機材、養生、専門班の動員コストが小面積には見合わない。', 'メーカーのプロジェクト限定 材料保証 10 年：プライマー、下地調整材（NBQ）、端末シール材（イクシード）、塗膜が同一メーカーで責任が一本化。', 'F☆☆☆☆ 登録；0.5〜1.25 mm の薄膜は構造荷重を増やさず、敷居やドレンの段差も変えない。'],
    designer: ['JIS A 6021 高強度形の規格値は引張 ≥ 10 N/mm²、引裂 ≥ 30 N/mm、伸び ≥ 200%；ウレアックスHGの自社試験は 17／59／470%——高強度と高伸長を両立し、仕様書の最低要求として記載できる。', '膜厚は用途に合わせて：0.5 mm（FU08）、0.83 mm（2 回）、1.25 mm（3 回）——0.1 kg/㎡ ＝ 0.0695 mm と換算が明快。', 'FRP はサンディング不要（OP-55F）、旧ウレタンは直接塗り重ね（OP-30B）：撤去も廃材も最少の改修設計。', '納まりには標準の答えがある：入隅・出隅・ひび割れはノンブリードQイック、塗膜端末はイクシード（ASTM C920 class 50、30 年級の耐候）——現場で工夫する必要がない。', '下地含水率は 8% 未満まで許容。ハイブリッドや従来の 1 液ウレタンは 4% 以下を求めることが多く、湿度の高い台湾では着工できるかどうかの差になる。', '標準施工仕様書、TDS、保証チェックリスト（日本語・繁体字中国語）が揃い、引用の根拠になる。'],
    gc: ['工程：FU08 は 1 作業日、標準仕様は 2〜3 日。一般的な 2 液ウレタンは工程間隔 13〜24 h、完全硬化 7 日のあとにトップコート；水系は耐雨まで 2〜4 日——雨季のリスクがまるで違う。', '吹付け機材が要らない：ハイブリッド／純ポリウレアの加熱 2 液高圧機（160〜200 bar、65〜85 °C）、加熱ホース、発電機、養生、専門班は、ベランダや廊下の細切れ面積には不釣り合いなコスト。', '混合ミスも可使時間切れの廃棄もない：1 液を缶からそのまま、ロスは管理でき、18 kg 缶は人力で運べる（吹付けポリウレアは 200 kg 級ドラム）。', '指触乾燥 60 分、工程間隔 3〜10 時間：急な雨への露出時間が短い；1Day シミュレーターが気温と促進剤で工程を組む。', '品質管理が簡単：チェックリストは工程ごとの面積・使用量・LOT 写真を記録するだけ——膜厚計や吹付けパラメータの記録は不要。', '安全：引火点 36 °C の溶剤系材料として換気と火気管理は必要；純ポリウレアは無溶剤だがイソシアネートの吹付けミストに対する呼吸保護の要求がより高い。'],
    app: ['缶からそのまま：計量なし、配合なし、硬化剤の取り違えなし、可使時間切れで半缶捨てることもない。', 'ローラーと刷毛で仕上がる；立上りは 1 回 0.4 kg/㎡ でダレない；防滑面は最後の回に珪砂を加えるだけ。', '下地調整の NBQ は約 1 時間で上塗り可——1 日待たない；ひび割れと入隅はコーキングガンで一度に。', '寒ければ硬化促進剤 S（2.5／5.0 wt%）、粘度が高ければ希釈溶剤 K（7.5% 以下）——早見表が次の回のタイミングを教える。', '補強布なし、トップコートなし、ガンとホースの洗浄なし；道具は希釈溶剤 K で洗える。', '塗布量が明快：18 kg 缶で 1 回目（0.6 kg/㎡）約 30 ㎡；プライマー 0.15 kg/㎡ と合わせて一行の計算。']
  },
  honest: { title: '他の技術が向いている場面', text: '大面積の車路デッキ、貯水槽、2〜3 mm を一度に成膜する必要のある水利構造物：そこでは吹付け純ポリウレアの機材投資が報われる。溶剤臭を全面的に禁じる屋内：水系製品。数千平方メートルの屋根を吹付け班に一括発注：ハイブリッドの平米あたりの速さ。ウレアックスHGの主戦場はベランダ、バルコニー、廊下、踊り場、FRP と旧ウレタンの改修——細切れの面積を当日開放し、10 年戻らないこと。' },
  src: { title: '出典', sub: '各社の公開文書（2026 年 9 月閲覧）；† は一般的な実務経験値で、メーカー規格ではありません。' }
};


