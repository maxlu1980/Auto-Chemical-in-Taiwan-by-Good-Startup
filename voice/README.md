# 御徒町站廣播：廣播稿與預錄音檔

`src/okv_lines.js`（頁面用的對照表）、`okachimachi_voicevox.txt`（VOICEVOX 讀入用）與 `okachimachi_lines.csv`（逐句清單）都由 `okv_gen.py` 從同一份台詞產生，三者永遠一致。

```bash
python3 voice/okv_gen.py voice src
```

共 45 句：001–026 為女聲（1、3 番線），027–045 為男聲（2、4 番線）。文字檔預設的角色是九州そら與玄野武宏；目前頁面內嵌的音檔（`src/okv_data.js`）女聲為 **後鬼（人間ver.）**、男聲為 **玄野武宏（ノーマル）**，以 VOICEVOX 0.26.2 產生。內容為預告（今度の…）、接近（まもなく…）、到站、關門與宣導；京浜東北線的種別與行先與月台看板顯示的一致。

## 製作音檔

1. VOICEVOX →「設定」→「保存」：文字コード選 UTF-8，書き出しファイル名パターン維持預設（檔名開頭為行號）。
2. 「ファイル」→「テキスト読み込み」→ `okachimachi_voicevox.txt`。
3. 「ファイル」→「音声書き出し」→ 得到 `001_…wav` 至 `045_…wav`。
4. `python3 voice/okv_pack.py <WAV 資料夾> src 32 1.0 1.0 0.40`：捨棄空白列、依檔名中的台詞開頭核對每個檔案對應的句子（VOICEVOX 的行號是清單的列號，讀入前後若有空白列會錯開），逐句裁切、響度正規化（−18 LUFS）、句中超過 0.40 秒的停頓縮短為 0.40 秒（語速與音高不變，使兩個聲音的節奏相近），轉為單聲道 32 kbps MP3，寫成 `src/okv_data.js`（`window.AC_OKV = { '001': 'data:audio/mpeg;base64,…', … }`），再把 `okv_data.js` 加進 `src/_order.txt`（`okv_lines.js` 之後）重新建置。沒有音檔或缺少某一句時，頁面改用裝置的內建語音朗讀同一句。需要 numpy、scipy、soundfile、pyloudnorm 與 ffmpeg（libmp3lame）。

## 英語廣播

VOICEVOX 只能合成日語，不用於英語。英語句子（接近廣播與五則宣導的英語，共 23 句）由 `okv_gen_en.py` 產生對照表 `src/okv_lines_en.js` 與清單 `okachimachi_lines_en.csv`：

```bash
python3 voice/okv_gen_en.py voice src
```

頁面若內嵌這些句子的預錄音檔（`window.AC_OKV_EN = { 'E01': 'data:audio/…', … }`），會在日語之後播放，同時有另一則同等重要的廣播在等時略過；目前沒有音檔，英語只顯示字幕。御徒町站的廣播一律不使用裝置的內建語音。

## 授權

- 使用 VOICEVOX 產生的音檔須遵守 VOICEVOX 軟體使用規約與各角色的使用規約，並標示「VOICEVOX:角色名」。
- 廣播詞依一般車站廣播的形式撰寫；未使用、也未模仿任何鐵路業者的錄音、播音員的聲音或發車音樂。御徒町站的廣播不使用裝置的內建語音。
