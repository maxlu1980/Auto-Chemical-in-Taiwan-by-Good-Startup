/* ===== [data_sl_vs2.js] ===== */
/* ===== Sealant guide, Versus: two named one-component polyurethanes set beside AUTON =====
   MC-FLEX PU 22 Construct (MC-Bauchemie, TDS 01.10.2026) and Sikaflex® Construction (Sika Taiwan PDS 04/2022, version 01.02). Every figure is the
   data sheet's printed value; what a sheet does not print is said so. Inserted as two columns after the guide's own product in the cards, the
   bar charts and the matrix of all three languages. */
(function () {
  SLV_CLASSES.splice(1, 0, 'mcpu', 'skpu');
  SLV_NUM.mcpu = { name: 'MC-FLEX PU 22 Construct', tensile: null, elong: 500, shore: 40, recovery: 70, weatherH: null, skinH: 20 / 60, mod: null };
  SLV_NUM.skpu = { name: 'Sikaflex® Construction (TW)', tensile: null, elong: 800, shore: null, recovery: 90, weatherH: null, skinH: 1.5, mod: 0.45, modK: 'secant' };
  SLV_SRC.splice(5, 0,
    ['MC-Bauchemie', 'MC-FLEX PU 22 Construct — 1-component polyurethane, ASTM C920 Type S Grade NS Class 35 — product page · TDS 01.10.2026 · SDS · DoP', 'https://www.mc-bauchemie.com/products/joints-and-sealants/joint-sealants/mc-flex-pu-22-construct.html'],
    ['Sika Taiwan (台灣西卡)', 'Sikaflex® Construction 建築用單組份聚胺脂(PU)填縫膠 — ISO 11600 F 25 LM, ASTM C920 Class 25 — 產品頁 · 產品說明書 04/2022 v01.02', 'https://twn.sika.com/zh/construction/52673/66197/sikaflex-construction.html']);
  var A = {
    zh: {
      head: ['MC-FLEX PU 22', 'Sikaflex Construction'], barsT: '數據對照（指名產品與各類別代表產品的 TDS 印行值）', matrixSub: '20 個項目、8 欄（AUTON、MC-FLEX PU 22 Construct、Sikaflex® Construction 與五種技術類別），從化學到保證。左欄固定，表格可橫向捲動。',
      sub: '密封膠市場有六種化學：一液聚氨酯、矽利康、變性矽利康／MS（矽烷改質聚醚）、雙液聚硫、壓克力，以及 Auto Chemical 以 LS 聚合物、不含可塑劑重新定義的一液聚氨酯。下表以 Sika（Sikaflex® Construction 台灣版）、MC-Bauchemie（MC-FLEX PU 22 Construct）、Mapei、Fosroc、Dow 與日本 JIS 認證品的公開 TDS 為對照（2026 年 9–10 月查閱），逐項註明產品與出處。',
      kpi0: '一般一液 PU 500–800%（MC-FLEX PU 22 ≥ 500、Sikaflex Construction 約 800、Sika／Mapei 700）', kpi1: '一般 PU 28–40（MC-FLEX PU 22 約 40）、MS 24–43、矽利康 29',
      classes: {
        mcpu: { name: 'MC-FLEX PU 22 Construct（MC-Bauchemie）', chem: '一液濕氣硬化聚氨酯；ASTM C920 Type S・Grade NS・Class 35、Use T, NT, A, M；UV 穩定、色澤穩定（TDS 2026/10/1）', apply: '打膠槍（手動，或 3–4 bar 氣動）；600 ml 腸衣／280 ml 卡匣；多孔・吸水基材底漆 Mycoflex 251（乾燥 > 1 h，超過 6 h 重塗）；目地寬 10–35 mm；濕抹刀（中性肥皂水）抹平', cure: '表乾約 20 min；硬化約 2 mm／天（23 °C／50% RH）；施工 5–35 °C；硬化後耐 −30～+80 °C', catch: '硬度 Shore A 約 40（7 天）——偏硬；抗拉強度、模數未公布；不適用大理石與天然石；膠帶須在表乾前撕除；耐候「UV 穩定」但無時數' },
        skpu: { name: 'Sikaflex® Construction（Sika 台灣）', chem: '一液濕氣硬化聚氨酯（建築用單組份聚胺脂填縫膠）；ISO 11600 F 25 LM、ASTM C920 Class 25（台灣版 PDS 2022/4）', apply: '打膠槍；600 ml 腸衣 × 20；底漆依基材：Sika Primer-3 N（多孔，≥ 30 min、≤ 8 h）、Aktivator-205 ＋ Primer-3 N（金屬、粉體塗裝）、Primer-215（PVC）；目地寬 10–40 mm、寬深比約 2：1', cure: '表乾約 90 min；修飾時間約 80 min；硬化約 3 mm／24 h（23 °C／50% RH）；施工 +5～+40 °C（高於露點 3 °C）', catch: '紫外線、高溫、化學品下可能變色（淺色尤其明顯）；原則上不全面塗裝（僅兩側約 1 mm、塗料需 DIN 52452-2 相容性試驗）；不可用於玻璃、瀝青、EPDM、會滲油的材料；不可泳池、水壓、長期浸水；天然石先洽 Sika；Shore A 台灣版未印行' }
      },
      rows: [
        ['一液濕氣硬化 PU（MC-Bauchemie）；是否含可塑劑 TDS 未述；GISCODE PU40', '一液濕氣硬化 PU（Sika）；是否含可塑劑 PDS 未述；註明不可接觸會滲出油脂、可塑劑、溶劑的材料'],
        ['總變形 25%（相對初始目地寬）；±25%（ISO 9047）、±35%（ASTM C719）；ASTM C920 Class 35', '±25%（ISO 9047）、±25%（ASTM C719）；ISO 11600 F 25 LM；ASTM C920 Class 25'],
        ['未公布', '割線模數 M100 約 0.45 N/mm²（23 °C）、約 0.75（−20 °C）（ISO 8339）——低模數（LM）'],
        ['未公布', '未公布（撕裂擴散強度約 6.0 N/mm，ISO 34）'],
        ['≥ 500%（DIN 53504 S2）', '約 800%（ISO 37）'],
        ['約 40（7 天）', '台灣版 PDS 未印行數值（他區域版本約 28–35，28 天，ISO 868）'],
        ['回彈率 > 70%（EN 27389）', '約 90%（ISO 7389）'],
        ['「耐候、耐水、UV 穩定、色澤穩定」——無時數', '「紫外線、高溫、化學品下可能變色（淺色尤其明顯），不影響性能」——無時數'],
        ['TDS 未述可塑劑；GISCODE PU40（含溶劑）†', 'PDS 未述可塑劑；註明不可與滲出油脂、可塑劑、溶劑的材料接觸'],
        ['可（TDS：Paintable；塗料系統未指定）', '原則上不全面塗裝：僅兩側約 1 mm、高相容性塗料；必要時依 DIN 52452-2 做相容性試驗'],
        ['無（灰、黑、混凝土灰）', '無（白、混凝土灰、黑、深咖啡）'],
        ['多孔・吸水基材：Mycoflex 251（乾燥 > 1 h，> 6 h 重塗）或 MC-DUR 1177 WV-A（水性環氧）；塑膠、塗裝面多可免底漆（先做附著試驗）', 'Sika Primer-3 N（多孔基材，≥ 30 min、≤ 8 h）；Aktivator-205 ＋ Primer-3 N（金屬、粉體塗裝）；Primer-215（PVC）——皆另購'],
        ['約 20 min（23 °C／50% RH）', '約 90 min（23 °C／50% RH）；修飾時間約 80 min'],
        ['約 2 mm／天（23 °C／50% RH）', '約 3 mm／24 h（23 °C／50% RH）'],
        ['5–35 °C（空氣與基材）；硬化後 −30～+80 °C', '+5～+40 °C（空氣、基材；高於露點 3 °C）；使用溫度 −40～+70 °C'],
        ['單液，開封即用', '單液，開封即用'],
        ['600 ml 腸衣 × 20；280 ml 卡匣 × 12', '600 ml 腸衣 × 20'],
        ['GISCODE PU40；SDS、DoP 公開', '—（PDS 未述）'],
        ['ASTM C920 Type S・Grade NS・Class 35・Use T, NT, A, M（TDS 記載）', 'ISO 11600 F 25 LM；ASTM C920 Class 25（PDS 記載）'],
        ['依製造商', '依製造商']
      ]
    },
    en: {
      head: ['MC-FLEX PU 22', 'Sikaflex Construction'], barsT: 'The numbers (printed TDS values of the named products and of a representative product per class)', matrixSub: '20 criteria in 8 columns (AUTON, MC-FLEX PU 22 Construct, Sikaflex® Construction and the five technology classes), from chemistry to warranty. The first column stays put; the table scrolls sideways.',
      sub: 'The sealant market has six chemistries: one-component polyurethane, silicone, modified-silicone / MS (silane-modified polyether), two-part polysulphide, acrylic — and the one-component polyurethane Auto Chemical redefined with its LS polymer and no plasticiser. The tables set them against the published data sheets of Sika (Sikaflex® Construction, Taiwan edition), MC-Bauchemie (MC-FLEX PU 22 Construct), Mapei, Fosroc, Dow and a JIS-certified Japanese product (accessed September–October 2026), product named and source linked.',
      kpi0: 'ordinary 1K PU 500–800 % (MC-FLEX PU 22 ≥ 500, Sikaflex Construction ~800, Sika / Mapei 700)', kpi1: 'ordinary PU 28–40 (MC-FLEX PU 22 ~40), MS 24–43, silicone 29',
      classes: {
        mcpu: { name: 'MC-FLEX PU 22 Construct (MC-Bauchemie)', chem: 'one-component moisture-curing polyurethane; ASTM C920 Type S, Grade NS, Class 35, Use T, NT, A, M; UV-resistant and colour-stable (TDS 01.10.2026)', apply: 'caulking gun (manual, or air gun at 3–4 bar); 600 ml sausage / 280 ml cartridge; primer Mycoflex 251 on porous, absorbent substrates (flash-off > 1 h, re-prime after 6 h); joint width 10–35 mm; tooled with a trowel wetted with neutral soap water', cure: 'skin ~20 min; cures ~2 mm/day (23 °C / 50 % RH); application 5–35 °C; cured −30 to +80 °C', catch: 'Shore A ~40 (7 d) — on the hard side; tensile strength and modulus not published; not for marble or natural stone; tape must come off before the skin forms; "UV-resistant" without weathering hours' },
        skpu: { name: 'Sikaflex® Construction (Sika Taiwan)', chem: 'one-component moisture-curing polyurethane; ISO 11600 F 25 LM, ASTM C920 Class 25 (Taiwan PDS 04/2022)', apply: 'caulking gun; 600 ml sausage × 20; primer by substrate: Sika Primer-3 N (porous, ≥ 30 min, ≤ 8 h), Aktivator-205 + Primer-3 N (metal, powder coatings), Primer-215 (PVC); joint width 10–40 mm, width : depth ≈ 2 : 1', cure: 'skin ~90 min; tooling time ~80 min; cures ~3 mm/24 h (23 °C / 50 % RH); application +5 to +40 °C (3 °C above dew point)', catch: 'may discolour under UV, heat or chemicals (light shades especially); not meant to be overpainted across the joint (about 1 mm each side with a highly compatible paint; compatibility test to DIN 52452-2); not for glass, bitumen, EPDM or bleeding materials; no pools, water pressure or permanent immersion; natural stone only after consulting Sika; Shore A not printed in the Taiwan edition' }
      },
      rows: [
        ['1K moisture-curing PU (MC-Bauchemie); plasticiser not stated in the TDS; GISCODE PU40', '1K moisture-curing PU (Sika); plasticiser not stated in the PDS; must not contact materials that bleed oils, plasticisers or solvents'],
        ['total deformation 25 % (of the initial joint width); ±25 % (ISO 9047), ±35 % (ASTM C719); ASTM C920 Class 35', '±25 % (ISO 9047), ±25 % (ASTM C719); ISO 11600 F 25 LM; ASTM C920 Class 25'],
        ['not published', 'secant modulus M100 ~0.45 N/mm² (23 °C), ~0.75 (−20 °C) (ISO 8339) — low modulus (LM)'],
        ['not published', 'not published (tear propagation ~6.0 N/mm, ISO 34)'],
        ['≥ 500 % (DIN 53504 S2)', '~800 % (ISO 37)'],
        ['~40 (7 d)', 'no figure printed in the Taiwan PDS (other regional editions ~28–35 after 28 d, ISO 868)'],
        ['resilience > 70 % (EN 27389)', '~90 % (ISO 7389)'],
        ['"resistant to weather and water, UV-resistant and colour-stable" — no hours', '"may discolour under UV, heat or chemicals (light shades especially), performance unaffected" — no hours'],
        ['plasticiser not stated in the TDS; GISCODE PU40 (solvent-containing) †', 'plasticiser not stated in the PDS; stated: no contact with materials that bleed oils, plasticisers or solvents'],
        ['yes (TDS: "paintable"; paint systems not specified)', 'not across the joint as a rule: about 1 mm on each side with a highly compatible paint; compatibility test to DIN 52452-2 where overpainting is required'],
        ['none (grey, black, concrete grey)', 'none (white, concrete grey, black, dark brown)'],
        ['porous, absorbent substrates: Mycoflex 251 (flash-off > 1 h, re-prime after 6 h) or MC-DUR 1177 WV-A (water-based epoxy); many plastics and painted surfaces without primer (adhesion test first)', 'Sika Primer-3 N (porous substrates, ≥ 30 min, ≤ 8 h); Aktivator-205 + Primer-3 N (metal, powder coatings); Primer-215 (PVC) — all bought separately'],
        ['~20 min (23 °C / 50 % RH)', '~90 min (23 °C / 50 % RH); tooling time ~80 min'],
        ['~2 mm/day (23 °C / 50 % RH)', '~3 mm/24 h (23 °C / 50 % RH)'],
        ['5–35 °C (air and substrate); cured −30 to +80 °C', '+5 to +40 °C (air and substrate, 3 °C above dew point); service −40 to +70 °C'],
        ['one-component, ready to use', 'one-component, ready to use'],
        ['600 ml sausage × 20; 280 ml cartridge × 12', '600 ml sausage × 20'],
        ['GISCODE PU40; SDS and DoP published', '— (not stated in the PDS)'],
        ['ASTM C920 Type S, Grade NS, Class 35, Use T, NT, A, M (per TDS)', 'ISO 11600 F 25 LM; ASTM C920 Class 25 (per PDS)'],
        ['per manufacturer', 'per manufacturer']
      ]
    },
    ja: {
      head: ['MC-FLEX PU 22', 'Sikaflex Construction'], barsT: '数値の並列（指名製品と各分類の代表製品の TDS 印刷値）', matrixSub: '20 項目・8 列（オートン、MC-FLEX PU 22 Construct、Sikaflex® Construction と 5 つの技術分類）、化学から保証まで。左列は固定、表は横にスクロール。',
      sub: 'シーリング材市場には 6 つの化学がある：1 液ウレタン、シリコーン、変成シリコーン／MS（シラン変性ポリエーテル）、2 液ポリサルファイド、アクリル、そしてオート化学工業が LS ポリマーと可塑剤なしで定義し直した 1 液ウレタン。表は Sika（Sikaflex® Construction 台湾版）、MC-Bauchemie（MC-FLEX PU 22 Construct）、Mapei、Fosroc、Dow と JIS 認証の国内製品の公開 TDS を対照（2026 年 9〜10 月閲覧）、製品名と出典を明記。',
      kpi0: '一般的な 1 液 PU 500〜800%（MC-FLEX PU 22 ≥ 500、Sikaflex Construction 約 800、Sika／Mapei 700）', kpi1: '一般 PU 28〜40（MC-FLEX PU 22 約 40）、MS 24〜43、シリコーン 29',
      classes: {
        mcpu: { name: 'MC-FLEX PU 22 Construct（MC-Bauchemie）', chem: '1 成分形湿気硬化ウレタン；ASTM C920 Type S・Grade NS・Class 35、Use T, NT, A, M；耐 UV・色安定（TDS 2026/10/1）', apply: 'コーキングガン（手動、またはエアガン 3〜4 bar）；600 ml ソーセージ／280 ml カートリッジ；多孔質・吸水性下地はプライマー Mycoflex 251（乾燥 > 1 h、6 h を超えたら再塗布）；目地幅 10〜35 mm；中性石けん水で湿らせたヘラで仕上げ', cure: '皮張り約 20 分；硬化約 2 mm／日（23 °C／50% RH）；施工 5〜35 °C；硬化後 −30〜+80 °C', catch: 'ショア A 約 40（7 日）——硬め；引張強さ・モジュラスは未公表；大理石・天然石には不可；テープは皮張り前に剥がす；「耐 UV」だが促進耐候時間なし' },
        skpu: { name: 'Sikaflex® Construction（Sika 台湾）', chem: '1 成分形湿気硬化ウレタン（建築用単成分 PU シーリング材）；ISO 11600 F 25 LM、ASTM C920 Class 25（台湾版 PDS 2022/4）', apply: 'コーキングガン；600 ml ソーセージ × 20；下地別プライマー：Sika Primer-3 N（多孔質、≥ 30 分・≤ 8 h）、Aktivator-205 ＋ Primer-3 N（金属、粉体塗装）、Primer-215（PVC）；目地幅 10〜40 mm、幅：深さ ≈ 2：1', cure: '皮張り約 90 分；仕上げ可能時間約 80 分；硬化約 3 mm／24 h（23 °C／50% RH）；施工 +5〜+40 °C（露点 +3 °C 以上）', catch: '紫外線・高温・薬品で変色の可能性（淡色で顕著）；目地全面の塗装は原則不可（両側約 1 mm、相性の良い塗料；DIN 52452-2 で相性試験）；ガラス、アスファルト、EPDM、油分の滲出する材料には不可；プール、水圧、常時浸水は不可；天然石は Sika に要相談；ショア A は台湾版に記載なし' }
      },
      rows: [
        ['1 成分形湿気硬化 PU（MC-Bauchemie）；可塑剤の有無は TDS に記載なし；GISCODE PU40', '1 成分形湿気硬化 PU（Sika）；可塑剤の有無は PDS に記載なし；油分・可塑剤・溶剤の滲出する材料との接触不可と明記'],
        ['総変形 25%（初期目地幅に対して）；±25%（ISO 9047）、±35%（ASTM C719）；ASTM C920 Class 35', '±25%（ISO 9047）、±25%（ASTM C719）；ISO 11600 F 25 LM；ASTM C920 Class 25'],
        ['未公表', '割線モジュラス M100 約 0.45 N/mm²（23 °C）、約 0.75（−20 °C）（ISO 8339）——低モジュラス（LM）'],
        ['未公表', '未公表（引裂伝播強さ約 6.0 N/mm、ISO 34）'],
        ['≥ 500%（DIN 53504 S2）', '約 800%（ISO 37）'],
        ['約 40（7 日）', '台湾版 PDS に数値なし（他地域版は約 28〜35、28 日、ISO 868）'],
        ['復元率 > 70%（EN 27389）', '約 90%（ISO 7389）'],
        ['「耐候・耐水、耐 UV・色安定」——時間数なし', '「紫外線・高温・薬品で変色の可能性（淡色で顕著）、性能には影響なし」——時間数なし'],
        ['可塑剤は TDS に記載なし；GISCODE PU40（溶剤含有）†', '可塑剤は PDS に記載なし；油分・可塑剤・溶剤の滲出する材料との接触不可と明記'],
        ['可（TDS：Paintable；塗料系の指定なし）', '原則として目地全面の塗装は不可：両側約 1 mm、相性の良い塗料；必要なら DIN 52452-2 で相性試験'],
        ['なし（グレー、黒、コンクリートグレー）', 'なし（白、コンクリートグレー、黒、ダークブラウン）'],
        ['多孔質・吸水性下地：Mycoflex 251（乾燥 > 1 h、6 h 超で再塗布）または MC-DUR 1177 WV-A（水系エポキシ）；多くのプラスチック・塗装面はプライマー不要（接着試験を先に）', 'Sika Primer-3 N（多孔質、≥ 30 分・≤ 8 h）；Aktivator-205 ＋ Primer-3 N（金属、粉体塗装）；Primer-215（PVC）——いずれも別売'],
        ['約 20 分（23 °C／50% RH）', '約 90 分（23 °C／50% RH）；仕上げ可能時間約 80 分'],
        ['約 2 mm／日（23 °C／50% RH）', '約 3 mm／24 h（23 °C／50% RH）'],
        ['5〜35 °C（気温・下地）；硬化後 −30〜+80 °C', '+5〜+40 °C（気温・下地、露点 +3 °C 以上）；使用温度 −40〜+70 °C'],
        ['1 成分、開封してそのまま', '1 成分、開封してそのまま'],
        ['600 ml ソーセージ × 20；280 ml カートリッジ × 12', '600 ml ソーセージ × 20'],
        ['GISCODE PU40；SDS・DoP 公開', '—（PDS に記載なし）'],
        ['ASTM C920 Type S・Grade NS・Class 35・Use T, NT, A, M（TDS 記載）', 'ISO 11600 F 25 LM；ASTM C920 Class 25（PDS 記載）'],
        ['メーカーによる', 'メーカーによる']
      ]
    }
  };
  ['zh', 'en', 'ja'].forEach(function (l) { var T = SLT[l], a = A[l], k; T['sl.vs.classes'].mcpu = a.classes.mcpu; T['sl.vs.classes'].skpu = a.classes.skpu; T['sl.vs.rowsH'].splice(2, 0, a.head[0], a.head[1]); T['sl.vs.rows'].forEach(function (r, i) { r[1].splice(1, 0, a.rows[i][0], a.rows[i][1]); }); T['sl.vs.kpi'][0][1] = a.kpi0; T['sl.vs.kpi'][1][1] = a.kpi1; T['sl.vs.sub'] = a.sub; T['sl.vs.bars'].title = a.barsT; T['sl.vs.matrixSub'] = a.matrixSub; if (SLV_T[l]) { SLV_T[l].sub = a.sub; SLV_T[l].matrixSub = a.matrixSub; } });
})();


