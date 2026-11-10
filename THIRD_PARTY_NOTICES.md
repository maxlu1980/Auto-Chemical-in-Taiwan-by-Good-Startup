# 第三方元件與授權聲明 · Third-party notices

本專案內含或引用下列第三方元件，各依其授權使用。原始授權條款以各專案為準。

| 元件 | 版本 | 授權 | 位置 / 用途 |
|---|---|---|---|
| [three.js](https://threejs.org/) | r147 | MIT — Copyright © 2010-2022 Three.js Authors | 正式站由 jsDelivr 載入（`https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js`）；`vendor/three.min.js` 僅供測試頁面內嵌 |
| [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | 0.5.23 | MIT — Copyright (c) 2018 Garrett Johnson | `src/bvh.js`（高鐵站內鏡頭與場景表面的快速光線求交） |
| [docx](https://github.com/dolanmiu/docx) | — | MIT — Copyright (c) 2015 Dolan Miu | `docs/docgen/docx.min.js`（Word 文件輸出） |
| [pdfmake](http://pdfmake.org/) | 0.3.11 | MIT — Copyright (c) 2014 Bartek Pampuch | `docs/docgen/pdfmake.min.js`（PDF 輸出） |
| [Noto Sans CJK](https://github.com/notofonts/noto-cjk) TC / JP, Regular & Bold（子集） | — | SIL Open Font License 1.1 — Copyright 2014-2021 Adobe | `docs/docgen/fonts/`（PDF 內嵌字型；授權全文見該資料夾的 `OFL.txt`） |
| [Google Fonts](https://fonts.google.com/)：Barlow、Oswald、Noto Sans TC、Noto Sans JP | — | SIL Open Font License 1.1 | 由 Google Fonts 載入，未隨倉庫散布 |
| [terser](https://terser.org/) | 5.x | BSD-2-Clause | 建置工具，不含於產物 |
| [Playwright](https://playwright.dev/) | 1.x | Apache-2.0 | 自動測試，不含於產物 |

## 資料與服務

| 來源 | 條款 | 用途 |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | 非商業免費方案，資料 CC BY 4.0 | 台灣各地即時天氣（天空、雲、雨）；頁面內註明來源 |
| [AccuWeather](https://www.accuweather.com/) | 僅在 claude.ai artifact 中，經觀看者自己的 AccuWeather 連接器讀取 | 東京御徒町、台北車站即時天氣（MinuteCast）；頁面內標示「天氣 AccuWeather」 |

## 聲音與音樂

| 來源 | 條款 | 用途 |
|---|---|---|
| VOICEVOX：春日部つむぎ | 依 VOICEVOX 與春日部つむぎ的使用規約，標示「VOICEVOX:春日部つむぎ」 | 角色語音（`src/luna_voice.js` 內嵌音檔）；標示保留於開場、標題與片尾 |
| 鄧雨賢〈望春風〉（1933）、〈雨夜花〉（1934） | 旋律為公共領域（作曲者於 1944 年逝世）；歌詞仍受保護，本專案未使用 | 開場影片與標題音樂，本專案自行編曲：錄音版 `docs/audio/*.mp3`（由 `music/` 的腳本以下列取樣算繪），瀏覽器合成版（`src/tw_cine_c.js`）作為退路 |
| [VS Chamber Orchestra: Community Edition（VSCO 2 CE）](https://github.com/sgossner/VSCO-2-CE) | CC0 1.0（公眾領域貢獻） — Versilian Studios，Sam Gossner、Simon Dalzell 錄製 | 開場與標題音樂的樂器取樣（弦樂五部、木管、銅管、定音鼓、豎琴、鐘琴、大鼓、鈸）；取樣本身未隨倉庫散布，僅散布算繪後的錄音 |
| 車站廣播 | 廣播詞依一般車站廣播的形式由本專案撰寫，提示音與發車旋律為本專案原創；語音為使用者裝置的內建語音（Web Speech API），不隨附語音檔，亦未使用鐵路業者的錄音或發車音樂 | JR 御徒町站與高鐵四站的進站、上車、發車與宣導廣播（`src/island_av.js`） |
| 其他音效與配樂 | 本專案自行合成（Web Audio） | 環境音、工具音、介面音 |

## 地名與品牌

遊戲中的車站、地標與店鋪為本專案原創的簡化造型，真實地名（臺北車站、高鐵台中站等）僅作為地點標示；日本的 JR 御徒町站周邊同樣為原創造型。所有品牌與商標屬各權利人。

---

### MIT License（three.js、three-mesh-bvh、docx、pdfmake）

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
