# 開場音樂：取樣、編曲與算繪

開場影片與標題畫面的音樂（`docs/audio/opening.mp3`、`title_bch.mp3`、`title_uih.mp3`）由本資料夾的腳本，以 **VS Chamber Orchestra: Community Edition（VSCO 2 CE，CC0）** 的真實樂器取樣算繪而成。曲目為鄧雨賢〈望春風〉（1933）與〈雨夜花〉（1934），旋律屬公共領域，本專案自行編曲，未使用歌詞。

| 檔案 | 內容 |
|---|---|
| `analyze.py` | 量測每個取樣的實際音高（取樣庫的檔名有兩種八度記法）、響度與起音點 → `lib.json` |
| `export_song.js` | 從頁面原始碼（`src/tw_cine_c.js`）取出兩首歌的音符、和聲與影片的小節時間 → `song.json` |
| `sampler.py` | 取樣器（依音高、力度層、輪替選取取樣，±2 半音內移調；力度在強弱層間交叉漸變；連奏接續）與音樂廳（舞台座位、鏡像法早期反射、分頻衰減殘響）、母帶處理 |
| `arrange.py` | 編曲與算繪：弦樂五部（連奏、斷奏、撥奏、顫弓）、木管、銅管、定音鼓、豎琴、鐘琴、大鼓、鈸 |

重新算繪：

```bash
git clone --filter=blob:none --no-checkout https://github.com/sgossner/VSCO-2-CE.git && cd VSCO-2-CE && git checkout HEAD && cd ..
python3 analyze.py VSCO-2-CE lib.json
node export_song.js ../src/tw_cine_c.js song.json
python3 arrange.py VSCO-2-CE lib.json song.json out all
for f in opening title_bch title_uih; do ffmpeg -i out/$f.wav -codec:a libmp3lame -q:a 3 ../docs/audio/$f.mp3; done
```

需要 Python 3.9 以上（numpy、scipy、soundfile、pyloudnorm）、Node.js、ffmpeg（libmp3lame）。完整取樣庫約 3 GB；只需弦樂、木管、銅管、打擊與豎琴各資料夾（約 1.1 GB）。

時間對齊：影片長 40 秒，最後一個 F 大和弦落在 36.35 秒（♩＝80，前奏一小節為 0.6 倍長，最後兩小節為 1.12 倍長）；標題畫面每小節 3.1 秒，每一輪是兩小節銜接加一首歌（〈望春風〉16 小節、〈雨夜花〉8 小節），頁面把每一輪接在前一輪之後播放，殘響自然重疊。
