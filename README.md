# Auto Chemical in Taiwan by Good Startup

**Auto Chemical 互動產品指南** · 線上版：<https://maxlu1980.github.io/Auto-Chemical-in-Taiwan-by-Good-Startup/>

オート化学工業（Auto Chemical Industry Co., Ltd.）建築用防水、密封、接著產品的互動式產品指南，由台灣認定代理商 **Good Startup LTD.（好時新創有限公司）** 發行，系統由好時新創開發。

整個網站是一個單一的 HTML 檔案（`docs/index.html`），不需要後端，可直接放在 GitHub Pages 或任何靜態主機上。

## 內容

| 區塊 | 說明 |
|---|---|
| 四本產品指南 | UREAX 系列（FU08 工法、W 效果、1Day 工期模擬、3D 施工模型）、PROTECT ONE（四大性能、適用基材、型錄示範、施工概要）、建築用密封膠（一液 PU 密封系統、六種接縫情境、3D 接縫剖面、硬化時程模擬）、建築用接著劑（地板接著系統、三種地板工法情境、3D 地板剖面、副資材）；各附技術比較與施工步驟 |
| 用量計算與報價 | 依面積、縫寬、層數估算用量，輸出 CSV／HTML 報價單 |
| 文件產生 | 以貴公司名義產出材料送審文件、施工計畫書（施工說明）、報價單：內容取自頁面目前顯示的指南與數據，於瀏覽器內產生 Word（docx）與 PDF（pdfmake，內嵌 Noto Sans CJK 子集字型） |
| 模擬現場（HSIM） | 第一人稱施工模擬：取景、跟隨、免瞄準施作，含真實工具音效 |
| AUTO 台灣島 | three.js 3D 遊戲：從東京御徒町出發，乘高鐵往返台北、台中、台南、左營四站，前往各訓練中心完成教育訓練任務；另有墾丁、日月潭關卡 |
| 三種語言 | 繁體中文（預設）／English／日本語，全站即時切換 |

## 倉庫結構

```
.
├── docs/                 GitHub Pages 站台（建置產物，請勿手動編輯）
│   ├── index.html        整個網站
│   ├── audio/            開場與標題音樂的管弦樂錄音（MP3）
│   └── docgen/           文件產生器的程式庫與字型（docx、pdfmake、Noto Sans CJK 子集）
├── src/                  原始碼：_pre.html／_boot.html／_post.html 為頁面骨架，_order.txt 為模組順序，其餘為模組
│   ├── css_extra_add.css, css_final.css   附加樣式表（依序接在頁面樣式之後）
│   ├── engine_*.js       3D 引擎：程序化材質、構件、檢驗模型與動畫
│   ├── data_*.js, m3d_*.js, mod_*.js      各指南的資料、3D 與互動模組
│   ├── doc_*.js          文件模型與輸出
│   ├── hsim.js, sim_*.js 模擬現場
│   ├── tw_*.js           台灣：地形、天空、城市、高鐵站、關卡、開場影片與音樂
│   ├── island_*.js       AUTO 台灣島的遊戲邏輯（同一閉包，後面的模組以重新指派包裝前面的函式）
│   ├── luna.js, max*.js, dogs.js          角色
│   └── bvh.js            three-mesh-bvh（MIT）
├── vendor/three.min.js   three.js r147（測試版頁面內嵌用；正式站由 jsDelivr 載入）
├── music/                開場音樂的取樣分析、取樣器、音樂廳與編曲算繪腳本（見 music/README.md）
├── tests/                Playwright 自動測試與測試計畫
├── build.py              建置腳本
├── THIRD_PARTY_NOTICES.md
└── LICENSE
```

## 建置

需求：Python 3.9 以上、Node.js 18 以上（`terser`，可用 `npm i -g terser@5.31.0` 安裝（與已提交的 `docs/index.html` 同一版本，`--check` 才會一致），或由 `npx` 自動取得）。

```bash
python3 build.py            # 產生 docs/index.html 與 build/ 下的各版本
python3 build.py --check    # 重新建置並與 docs/index.html 比對（CI 用）
```

建置產物：

| 檔案 | 用途 |
|---|---|
| `docs/index.html` | 正式站台（完整 HTML 文件，含 meta 與 favicon） |
| `build/guide.min.html` | 同一內容但不含文件骨架，供會自行包裝頁面的主機（例如 claude.ai artifact）使用 |
| `build/guide.html` | 未壓縮版本，便於閱讀與除錯 |
| `build/test_local.html`、`build/test_min.html` | 內嵌 three.js 的測試版本，自動測試由 `file://` 開啟 |

壓縮只去除註解與多餘空白（不改名、不改變語意），`VOICEVOX`、`@license`、`MIT` 相關註解保留。

## 部署到 GitHub Pages

1. 推送到 GitHub 後，到 **Settings → Pages**。
2. **Source** 選 *Deploy from a branch*，**Branch** 選 `main`、資料夾選 `/docs`，儲存。
3. 幾分鐘後站台會出現在 `https://maxlu1980.github.io/Auto-Chemical-in-Taiwan-by-Good-Startup/`。

`docs/.nojekyll` 已包含，GitHub 不會對檔案做 Jekyll 處理。每次修改 `src/` 後請重新執行 `python3 build.py` 並一併提交 `docs/index.html`；CI（`.github/workflows/ci.yml`）會檢查提交的 `docs/index.html` 是否與原始碼一致。

## 執行環境

- 瀏覽器：需要 WebGL 2 與 Web Audio；桌機、平板與手機皆可，手機以直式為主。3D 畫質依裝置自動偵測，可於遊戲內「裝備」調整。
- 外部資源：Google Fonts（Barlow、Oswald、Noto Sans TC/JP）、jsDelivr（three.js r147）、Open-Meteo（台灣各地即時天氣，無需金鑰）。離線或被擋時會退回系統字型與氣候模型，功能不受影響。
- claude.ai artifact 專屬：東京與台北車站的即時天氣可透過觀看者自己的 AccuWeather 連接器讀取，檔案下載經由 artifact 的 downloads 能力；在 GitHub Pages 上則以氣候模型顯示、由瀏覽器直接下載檔案。
- 設定與進度存在瀏覽器的 localStorage，不會上傳。

## 測試

`tests/` 內是本專案的自動測試（Python + Playwright，Chromium 以 SwiftShader 軟體繪圖執行）：

```bash
pip install playwright && playwright install chromium
python3 build.py
python3 tests/qa2.py tests/out/q_desk desk zh,en,ja '#/ureax-hg,#/protect-one,#/sealant,#/adhesive' shots   # 版面、i18n、錯誤
python3 tests/sc3.py                                                                                           # 開場音樂離線渲染
TK_FILE=build/test_min.html python3 tests/tk2.py tests/out/g zh desk "$(cat tests/plans/zy_fix.json)"         # 遊戲流程
```

詳見 `tests/README.md`。

## 授權

Copyright © 2026 Good Startup LTD. 本倉庫的原始碼、文字、圖像、3D 模型與編曲保留所有權利（見 `LICENSE`）。產品名稱與商標屬各權利人所有。第三方元件（three.js、three-mesh-bvh、docx、pdfmake、Noto Sans CJK、Google Fonts）依各自授權使用，見 `THIRD_PARTY_NOTICES.md`。

## 致謝

- 聲音：**VOICEVOX:春日部つむぎ**（角色語音）、**VOICEVOX:後鬼**、**VOICEVOX:玄野武宏**（御徒町站的日語廣播，依 `voice/` 的廣播稿預錄後內嵌，見 `voice/README.md`）；英語廣播與高鐵各站的廣播由使用者裝置的內建語音朗讀（Web Speech API）
- 音樂：鄧雨賢〈望春風〉（1933）、〈雨夜花〉（1934）旋律（公共領域），本專案自行編曲，以 VSCO 2 Community Edition（CC0）真實樂器取樣錄製為完整管弦樂團；未使用歌詞
- 天氣：Open-Meteo、AccuWeather

---

### English

**Auto Chemical in Taiwan by Good Startup** — an interactive product guide for Auto Chemical Industry's architectural waterproofing, sealing and adhesive products, published by Good Startup LTD. (authorised distributor, Taiwan), which also developed the system. One static HTML file (`docs/index.html`): four product guides in Traditional Chinese, English and Japanese, take-off calculators, in-browser Word/PDF document generation, a first-person hands-on jobsite simulator and a three.js game set in Taiwan. Build with `python3 build.py`; deploy the `docs/` folder with GitHub Pages. All rights reserved; third-party components under their own licences (see `THIRD_PARTY_NOTICES.md`).
