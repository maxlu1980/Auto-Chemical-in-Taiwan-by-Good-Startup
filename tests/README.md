# 自動測試

Python 3 + Playwright（Chromium，SwiftShader 軟體繪圖），所有測試由 `file://` 開啟 `build/test_local.html` 或 `build/test_min.html`（`TK_FILE` 環境變數），不需要網路。先執行 `python3 build.py`。

```bash
pip install playwright
playwright install chromium
```

| 腳本 | 用途 | 範例 |
|---|---|---|
| `qa2.py` | 路由 × 裝置 × 語言的版面掃描：橫向溢出、過小的按鈕、裁切文字、未翻譯字串、原始佔位字、壞圖、console 錯誤 | `python3 tests/qa2.py tests/out/q_desk desk zh,en,ja '#/ureax-hg,#/protect-one,#/sealant,#/adhesive' shots` |
| `axe_run.py` | axe-core WCAG 2.1 AA 稽核（需 `npm i axe-core`，路徑由 `AXE` 環境變數指定） | `AXE=node_modules/axe-core/axe.min.js python3 tests/axe_run.py tests/out/axe desk,mobile zh,en,ja '#/ureax-hg'` |
| `tk2.py` | 以 JSON 計畫驅動的流程測試（截圖、輪詢、JS、滑鼠／觸控），遊戲與模擬現場都用它 | `TK_FILE=build/test_min.html python3 tests/tk2.py tests/out/g zh desk "$(cat tests/plans/zy_fix.json)"` |
| `stsweep.py` / `stwalk.py` / `stwell.py` / `stshot.py` | 高鐵站上下樓層的視線檢查：固定取樣、實際行走、樓梯井淨空、截圖 | `python3 tests/stsweep.py taichung,taipei,tainan,zuoying mob sw` |
| `snd_flow.py` | 聲音解鎖流程（載入畫面按鈕、影片提示、點擊、標題音樂） | `TK_FILE=build/test_min.html DEV=mobile TAP=boot python3 tests/snd_flow.py` |
| `rec_flow.py` | 同上，但以 http 開啟，確認播放的是管弦樂錄音（影片從第幾秒起播、標題每一輪的錄音）；先在倉庫根目錄執行 `python3 -m http.server 8766` | `BASEURL=http://127.0.0.1:8766/ TK_FILE=build/test_min.html DEV=desk TAP=boot python3 tests/rec_flow.py` |
| `dev_chk.py` | 「系統由 好時新創 開發」標示：載入、標題、開場影片結尾、轉場、乘車影片、各面板、結算畫面、模擬現場的用字與位置；遊玩畫面不得出現（`SHOTS=1` 另存截圖） | `python3 tests/dev_chk.py tests/out/dev desk zh,en,ja` |
| `ann_chk.py` | 車站廣播（以替身語音記錄會說出的內容）：高鐵四站與御徒町的進站、上車、發車、宣導廣播，語言與語音的選擇、月台與目的地、畫面字幕的語言與位置、靜音、裝置無語音時的退路 | `python3 tests/ann_chk.py tests/out/ann desk zh tpe,all4,tyo,mute,novoice` |
| `ad_chk.py` | 接著劑指南（三種工法、六支產品）的功能檢查，以及四本指南與產品選單不再出現已移除的產品與用語、內文產品名稱不加粗 | `python3 tests/ad_chk.py desk zh,en,ja` |
| `cam_chk.py` | 鏡頭與操作：滑鼠鍵盤時畫面上的按鈕（旋轉、拉遠拉近、回到背後、切換視角、W A S D、Shift、城市中的動作鍵）與其按鍵標示、互不重疊、都在畫面內；`,` `.` `-` `=` `C`、滑鼠拖曳與各按鈕的作用；點地面行走時鏡頭繞到背後、側向移動時不轉動；觸控時左半邊走路、右半邊轉視角、可同時進行、同側兩指縮放 | `python3 tests/cam_chk.py tests/out/cam desk zh isle,city,tkw` |
| `oka_chk.py` / `tyo_shots.py` | 御徒町站：月台門只在列車停妥開門時開啟、發車前關閉；出發案內看板的內容（山手線「約 n 分後／まもなく／停車中」，京浜東北線的種別、時刻、行先）；時鐘；街道到月台的路徑仍可尋得。`tyo_shots.py` 以對照照片的固定視點截圖 | `python3 tests/oka_chk.py tests/out/oka high` ／ `TKTIER=high python3 tests/tyo_shots.py tests/out/tyo low p34n,p12s,gate,arch,corner` |
| `sc3.py` | 開場音樂與標題音樂離線渲染：每秒音量（dBFS）、峰值、WAV | `python3 tests/sc3.py` |

`tests/plans/` 內是 `tk2.py` 用的計畫：`zy_fix.json`（高鐵流程與車站）、`hs8_plan.json`（模擬現場）、`film_plan.json`（開場影片）、`fl6.json`（飛行）、`vc2.json`（飛行中語音）、`hz3.json`（乘車影片的霧）、`hq_plan.json`（手機 HUD）、`op71_plan.json`（開場影片與標題）。

頁面在測試時以 `window.ISLE_TEST = 1` 啟動，會把被攔截的例外重新拋出；`window.FAST3D`、`window.NO_GOV` 降低 3D 負載並略過政府開放資料的讀取。測試用的鉤子都掛在 `window.ISLE_x`。
