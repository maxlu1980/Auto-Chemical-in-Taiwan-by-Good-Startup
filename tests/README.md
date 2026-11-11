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
| `open_chk.py` | 起始順序（v83）：載入後直接是御徒町標題、沒有先播影片；影片的島嶼已備妥；「開始」後的飛行在俯衝處轉白、接上飛越台灣的影片（飛行停在原處等候、標題不出現、飛行自己的讀數與略過鈕收起），片尾的片名與聲音標示，結束後降落臺北並開始遊玩；影片中按略過；同一階段第二次不再播放；載入畫面與標題畫面的「直接看技術資料」按鈕（位置、寬度、開啟指南並展開產品選單）。`SHOTS=1` 另存截圖 | `python3 tests/open_chk.py tests/out/open desk` ／ `python3 tests/open_chk.py tests/out/open mobile boot,tech,fly` |
| `boot_prev.py` | 單獨的載入畫面（不含指南與遊戲）在各尺寸、三種語言的版面：卡片與按鈕都在畫面內、不溢出，並存截圖 | `python3 tests/boot_prev.py tests/out/boot src/_boot.html desk,lap,wide,tab,phone,small,land zh,en,ja` |
| `title_prev.py` | 標題卡片在各尺寸、三種語言是否完整在畫面內、不需捲動，各按鈕的位置與大小（`SHOTS=0` 只列數字） | `python3 tests/title_prev.py tests/out/title 1280x760,390x780,780x360 zh,en,ja` |
| `snd_flow.py` | 聲音解鎖流程（v83 起的順序）：載入畫面的聲音按鈕、標題在觸碰前無聲並有提示、觸碰後標題音樂與車站聲音、開始後標題音樂退出、飛行途中的影片有配樂且不再出現「輕觸開啟聲音」（`TAP=boot｜title｜none`） | `TK_FILE=build/test_min.html DEV=mobile TAP=boot python3 tests/snd_flow.py` |
| `rec_flow.py` | 同上，但以 http 開啟，確認播放的是管弦樂錄音（影片從第幾秒起播、標題每一輪的錄音）；先在倉庫根目錄執行 `python3 -m http.server 8766` | `BASEURL=http://127.0.0.1:8766/ TK_FILE=build/test_min.html DEV=desk TAP=boot python3 tests/rec_flow.py` |
| `dev_chk.py` | 「系統由 好時新創 開發」標示：載入、標題、開場影片結尾、轉場、乘車影片、各面板、結算畫面、模擬現場的用字與位置；遊玩畫面不得出現（`SHOTS=1` 另存截圖） | `python3 tests/dev_chk.py tests/out/dev desk zh,en,ja` |
| `ann_chk.py` | 車站廣播（以替身語音記錄會說出的內容）：高鐵四站與御徒町的進站、上車、發車、宣導廣播，語言與語音的選擇、月台與目的地、畫面字幕的語言與位置、靜音、裝置無語音時的退路 | `python3 tests/ann_chk.py tests/out/ann desk zh tpe,all4,tyo,mute,novoice` |
| `ad_chk.py` | 接著劑指南（三種工法、六支產品）的功能檢查，以及四本指南與產品選單不再出現已移除的產品與用語、內文產品名稱不加粗 | `python3 tests/ad_chk.py desk zh,en,ja` |
| `cam_chk.py` | 鏡頭與操作：滑鼠鍵盤時畫面上的按鈕（旋轉、拉遠拉近、回到背後、切換視角、W A S D、Shift、城市中的動作鍵）與其按鍵標示、互不重疊、都在畫面內；`,` `.` `-` `=` `C`、滑鼠拖曳與各按鈕的作用；點地面行走時鏡頭繞到背後、側向移動時不轉動；觸控時左半邊走路、右半邊轉視角、可同時進行、同側兩指縮放 | `python3 tests/cam_chk.py tests/out/cam desk zh isle,city,tkw` |
| `rot_chk.py` | 鏡頭列按鈕的圖示（v84）：畫質面板開啟前、開啟中、關閉後，六顆按鈕都仍是圖示而沒有被寫入文字；面板自己的「目前：…」標示照常顯示。在御徒町步行與臺北各檢查一次 | `python3 tests/rot_chk.py mobile zh,en,ja` |
| `fx_chk.py` | 御徒町的畫面與模型（v85）：後製流程讀得到深度；環境光遮蔽與螢幕空間反射在御徒町開啟、可個別開關、畫質面板有對應的兩列；雨天時有反射與沒有反射的畫面確實不同；白天下雨時屋簷區域保留（其下乾燥）而不發光；七種車輛的車身沒有壞點、不超出自身的長寬高；高架橋下有乾燥區；到臺北後兩種效果與地面變化都關閉 | `python3 tests/fx_chk.py high`（另有 `mid`、`low`） |
| `fx_shots.py` | 御徒町各視角的成品圖，以及遮蔽、反射、光滑度三張除錯圖；可指定等級、時刻、天氣（`WX` 為 WMO 代碼：63 雨、1 晴） | `WX=63 python3 tests/fx_shots.py tests/out/fx high exitN,p34n,taxi,bld 20.5 on,ao,ssr,gloss` |
| `fx_perf.py` | 同一畫面在兩種效果全關／只開遮蔽／只開反射／全開時各畫三次的平均時間，以及三角形數與繪製次數（軟體繪圖下只有比例有意義） | `python3 tests/fx_perf.py high 960x540` |
| `nav_scan.py` | 御徒町的帶路（v86）：約一萬個站位（月台、大廳、樓梯、北口前、巷道、高架另一側、馬路兩側）與貼著每個障礙物的站位都找得到往月台（或往北口）的路；十一個起點實際走完全程並到達，過馬路時在路緣等行人綠燈、沒有違規 | `python3 tests/nav_scan.py 0.5`（`WALK_ONLY=1` 只走全程；`REG=east,road` 只掃指定區域；`DBG=1` 列出失敗站位周圍的狀態） |
| `oka_chk.py` / `tyo_shots.py` | 御徒町站：月台門只在列車停妥開門時開啟、發車前關閉；出發案內看板的內容（山手線「約 n 分後／まもなく／停車中」，京浜東北線的種別、時刻、行先）；時鐘；街道到月台的路徑仍可尋得。`tyo_shots.py` 以對照照片的固定視點截圖 | `python3 tests/oka_chk.py tests/out/oka high` ／ `TKTIER=high python3 tests/tyo_shots.py tests/out/tyo low p34n,p12s,gate,arch,corner` |
| `snd_chk.py` | 御徒町站的音效（以分析器監聽街道音效輸出，檢查各音效的音高是否出現）：月台門與列車車門的提示音、樓梯口鳥鳴、改札口導盲鈴與讀卡提示音、主角通過改札的提示音。只確認有發聲，不判斷聽感 | `python3 tests/snd_chk.py tests/out/snd` |
| `ann_rt.py` | 御徒町站廣播的實際節奏（不加速）：站在月台上若干秒，列出每一句廣播何時播出、排隊等了多久、哪些因為過時而略過；用來確認同一班列車的預告、接近、到站、關門廣播依序而不擁擠 | `python3 tests/ann_rt.py 200` |
| `night_chk.py` | 御徒町站的夜間照明：入夜後「亮區」啟用、白天關閉；她站在月台、改札、樓梯時在亮區內（頭燈調暗），在街上則不在；同一視點分別以燈亮與強制關燈各畫一張，亮的那張地面明顯較亮。截圖存於輸出資料夾 | `python3 tests/night_chk.py tests/out/night plat,hall,stair,street` |
| `jit_chk.py` | 鏡頭靜止檢查：她站在御徒町站的月台、改札或街道上不動（各位置 × 八個方向），以不均勻的每格時間（模擬手機）逐格推進；鏡頭定下來之後，位置、角度、視野都不得再變動。列車進站掃過鏡頭所在位置時的單次切換會列出，需人工判讀 | `python3 tests/jit_chk.py mobile plat,hall,street 200` |
| `cred_chk.py` | 標題畫面與載入畫面的聲音標示：完整、不被裁切、在畫面內，標題卡片不超出視窗（手機與桌面、三種語言） | `python3 tests/cred_chk.py mobile zh,en,ja` |
| `sc3.py` | 開場音樂與標題音樂離線渲染：每秒音量（dBFS）、峰值、WAV | `python3 tests/sc3.py` |

`tests/plans/` 內是 `tk2.py` 用的計畫：`zy_fix.json`（高鐵流程與車站）、`hs8_plan.json`（模擬現場）、`film_plan.json`（開場影片）、`fl6.json`（飛行）、`vc2.json`（飛行中語音）、`hz3.json`（乘車影片的霧）、`hq_plan.json`（手機 HUD）、`op71_plan.json`（開場影片與標題）。其中 `film_plan.json`、`op71_plan.json` 是 v83 之前「載入後先播影片」的流程，留作影片本身（`ISLE_x.op.start()`）的檢查；新的順序由 `open_chk.py` 檢查。

頁面在測試時以 `window.ISLE_TEST = 1` 啟動，會把被攔截的例外重新拋出；`window.FAST3D`、`window.NO_GOV` 降低 3D 負載並略過政府開放資料的讀取。測試用的鉤子都掛在 `window.ISLE_x`。測試模式下飛行不會播放飛越台灣的影片（逐格推進的測試才不會停在途中），需要時加上 `window.ISLE_TOUR = 1`（依每階段一次的規則）或 `'always'`；`window.ISLE_NOTOUR = 1` 則一律不播。
