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

VOICEVOX 只能合成日語，不用於英語。英語（接近廣播與五則宣導的英語，共 23 句）以開源的英語語音模型 **Kokoro-82M**（Apache-2.0）在本機產生：1・3 番線為聲音 `af_heart`，2・4 番線為 `am_michael`；站名（Ōfuna、Ōmiya、Ueno…）以音標指定為日語讀音，不讓模型照英文拼字去唸。

```bash
python3 voice/okv_gen_en.py voice src                      # 句子清單 → src/okv_lines_en.js、okachimachi_lines_en.csv
python3 voice/okv_en_jobs.py src jobs.json af_heart am_michael 0.95
npm i kokoro-js@1.2.1 kokoro-q8-shards@1.0.0               # 模型權重（q8 ONNX，分成六段）
mkdir -p models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx
cat node_modules/kokoro-q8-shards/kokoro-q8.part*.bin > models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_quantized.onnx
sha256sum models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_quantized.onnx   # 應為 fbae9257…9028a1478（與 Hugging Face 官方檔案相同）
echo '{"model_type":"style_text_to_speech_2"}' > models/onnx-community/Kokoro-82M-v1.0-ONNX/config.json
node voice/okv_en_gen.mjs node_modules models jobs.json wav_en   # E01.wav … E23.wav
python3 voice/okv_pack_en.py wav_en src 32 "Kokoro-82M, voices af_heart and am_michael"   # → src/okv_data_en.js（window.AC_OKV_EN）
```

頁面在日語之後播放對應的英語；同時有另一則同等重要的廣播在等（另一班車也要進站）時略過英語。御徒町站的廣播一律不使用裝置的內建語音。

## 月台擴音

所有廣播、提示音與發車旋律都經過同一條「月台擴音」音訊鏈播放（`src/island_ax.js` 的 `OKV_PA`、`okvIR`、`okvPa`）：號角喇叭的窄頻（300 Hz–4.3 kHz，2.5 kHz 略為突出）與輕微飽和；沿月台其他喇叭較晚到、較小聲、較悶的四次重複（43–197 ms）；雨棚、列車與對面建築的殘響（約 1.25 秒，另有 0.24 與 0.41 秒兩道較清楚的回聲）。依聽的位置切換三種設定：月台上、改札大廳（較悶、殘響多）、站外街道（遠而模糊）。

`voice/okv_pa_render.py` 以 Chromium 的離線音訊圖執行同一段程式，把任一音檔算成「在遊戲裡聽到的樣子」，供試聽與調整：

```bash
python3 voice/okv_pa_render.py src/island_ax.js in.wav out.wav plat 0.85
```

## 授權

- 使用 VOICEVOX 產生的音檔須遵守 VOICEVOX 軟體使用規約與各角色的使用規約，並標示「VOICEVOX:角色名」。
- 廣播詞依一般車站廣播的形式撰寫；未使用、也未模仿任何鐵路業者的錄音、播音員的聲音或發車音樂。御徒町站的廣播不使用裝置的內建語音。
