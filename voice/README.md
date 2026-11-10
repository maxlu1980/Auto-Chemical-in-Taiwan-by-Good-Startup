# 御徒町站廣播：廣播稿與預錄音檔

`src/okv_lines.js`（頁面用的對照表）、`okachimachi_voicevox.txt`（VOICEVOX 讀入用）與 `okachimachi_lines.csv`（逐句清單）都由 `okv_gen.py` 從同一份台詞產生，三者永遠一致。

```bash
python3 voice/okv_gen.py voice src
```

共 45 句：001–026 為女聲（1、3 番線），027–045 為男聲（2、4 番線）。內容為預告（今度の…）、接近（まもなく…）、到站、關門與宣導；京浜東北線的種別與行先與月台看板顯示的一致。

## 製作音檔

1. VOICEVOX →「設定」→「保存」：文字コード選 UTF-8，書き出しファイル名パターン維持預設（檔名開頭為行號）。
2. 「ファイル」→「テキスト読み込み」→ `okachimachi_voicevox.txt`。
3. 「ファイル」→「音声書き出し」→ 得到 `001_…wav` 至 `045_…wav`。
4. `python3 voice/okv_pack.py <WAV 資料夾> src`：逐句裁切、響度正規化後轉為單聲道 MP3，寫成 `src/okv_data.js`（`window.AC_OKV = { '001': 'data:audio/mpeg;base64,…', … }`），再把 `okv_data.js` 加進 `src/_order.txt`（`okv_lines.js` 之後）重新建置。沒有音檔或缺少某一句時，頁面改用裝置的內建語音朗讀同一句。需要 numpy、scipy、soundfile、pyloudnorm 與 ffmpeg（libmp3lame）。

## 授權

- 使用 VOICEVOX 產生的音檔須遵守 VOICEVOX 軟體使用規約與各角色的使用規約，並標示「VOICEVOX:角色名」。
- 廣播詞依一般車站廣播的形式撰寫；未使用、也未模仿任何鐵路業者的錄音、播音員的聲音或發車音樂。英語廣播由使用者裝置的內建語音朗讀。
