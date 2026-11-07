/* ===== [hsim.js] ===== */
/* ===== HSIM — the hands-on jobsite simulator, first person =====
   One engine for the four guides. The simulator stands the user on the jobsite of the guide's own 3D sample (the balcony, the garden wall, the
   facade joint, the floor) at the applicator's eye height and lets him do the works of the procedure step by step: he picks the tool the step
   asks for, aims at the red work ring and holds — the tool works while he is on it and the stage of the 3D sample advances with him (the same
   rigs the guide plays), with the sounds of the tool and the place. Between the works: the survey of the damage, the waiting times of the data
   sheet on the site clock, the questions a data sheet asks (quiz), the doses to set, the preparation of the material.
   Controls: look by dragging (or the mouse, locked on request), walk with WASD / arrows / the joystick, work by holding the ring, the WORK
   button or the space bar; the view steers itself onto the ring while the user works, the ring never leaves the screen unannounced (an arrow
   points to it), and "go to the work" always brings him back to the right spot. Desktop, tablet and phone share one interface. */
var HSIM = (function () {
  /* ----- strings ----- */
  var T = {
    zh: { btn: '進入模擬現場', exit: '離開', score: '分數', clock: '現場時間', day: '第 {d} 天', phase: '工序', of: '/', start: '開始作業', again: '再做一次', back: '回到指南', next: '繼續', skip: '略過等待', ok: '確定', help: '操作說明', sound: '音效', goto: '到工作位置', zin: '拉近', zout: '拉遠', lock: '鎖定滑鼠', work: '施作', hold: '按住', look: '環視',
      brief: '作業簡報', briefSub: '{n} 個工序 · 現場時間從 {t} 開始', tools: '本次使用的工具', ctrlD: ['拖曳畫面或鎖定滑鼠：環視', 'W A S D／方向鍵：走動', '選好工具後按住左鍵或空白鍵：施作（工具自己完成作業、視角自動跟著；工具離開畫面時作業暫停）', '1–9：選工具　滾輪：拉近拉遠', '⌖：回到工作位置　H：說明　M：音效　Esc：離開'], ctrlT: ['單指拖曳：環視', '左下搖桿：走動', '選好工具後按住「施作」：工具自己完成作業、視角自動跟著（不必瞄準；工具離開畫面時作業暫停）', '點工具列選工具　雙指：拉近拉遠', '⌖：回到工作位置'],
      survey: '現況勘查', surveyP: '環視現場，把準星停在每個標示點上，確認 {n} 處現況。', found: '已確認 {a} / {n}', toolNeed: '請選工具：{t}', toolNow: '工具：{t}', aimOff: '按住施作', aimOn: '施作中', wrongTool: '這一步要用{t}。', offRing: '工具離開畫面——視角正在跟上，作業暫停。', prog: '進度 {p} %',
      wait: '等待時間', waitP: '{h} 小時的等待（乾燥／硬化）——現場時間快轉。', waitDone: '時間到。', cure: '養生', quiz: '施工判斷', quizOk: '正確。', quizBad: '不對——技術資料的規定：', dose: '設定用量', doseOk: '在規定範圍內。', doseBad: '超出規定範圍：', prep: '材料準備', prepHold: '按住準備', assist: '示範', assistP: '示範一次（扣分）', assisted: '本工序由示範完成。',
      res: '作業結果', resScore: '分數', resTime: '作業時間', resDays: '現場天數', rank: '評等', ranks: ['見習', '施工員', '現場技師'], notes: '檢討', noNotes: '沒有扣分事項——標準作業。', cons: '本次材料', quizMiss: '判斷題答錯 {n} 題', toolMiss: '選錯工具 {n} 次', offMiss: '脫離工作環 {s} 秒', assistN: '示範 {n} 次', no3d: '這個裝置無法建立 3D 畫面，模擬現場無法開啟。', pct: '%',
      phaseDone: '完成：{n}', tip: '提示', tapFull: '點一下看完整說明', helpT: '操作方式', loading: '正在建立現場…' },
    en: { btn: 'Enter the simulator', exit: 'Exit', score: 'Score', clock: 'Site clock', day: 'Day {d}', phase: 'Step', of: 'of', start: 'Begin the works', again: 'Run again', back: 'Back to the guide', next: 'Continue', skip: 'Skip the wait', ok: 'OK', help: 'Controls', sound: 'Sound', goto: 'Go to the work', zin: 'Zoom in', zout: 'Zoom out', lock: 'Lock the mouse', work: 'Work', hold: 'hold', look: 'Look',
      brief: 'Briefing', briefSub: '{n} steps · the site clock starts at {t}', tools: 'Tools of this run', ctrlD: ['Drag the view, or lock the mouse: look around', 'W A S D / arrows: walk', 'Pick the tool, then hold the left button or the space bar: work (the tool does the job and the view follows it; the work pauses if the tool leaves the screen)', '1–9: tools · wheel: zoom', '⌖: go to the work · H: help · M: sound · Esc: exit'], ctrlT: ['One finger drag: look around', 'Joystick, bottom left: walk', 'Pick the tool, then hold WORK: the tool does the job and the view follows it (no aiming; the work pauses if the tool leaves the screen)', 'Tap a tool · pinch: zoom', '⌖: go to the work'],
      survey: 'Survey', surveyP: 'Look around the site and rest the crosshair on each marker to confirm the {n} findings.', found: 'Confirmed {a} / {n}', toolNeed: 'Select the tool: {t}', toolNow: 'Tool: {t}', aimOff: 'hold to work', aimOn: 'working', wrongTool: 'This step needs the {t}.', offRing: 'The tool left the screen — the view is catching up; the work waits.', prog: 'Progress {p} %',
      wait: 'Waiting time', waitP: '{h} hours of waiting (drying / curing) — the site clock runs forward.', waitDone: 'Time is up.', cure: 'Curing', quiz: 'Site decision', quizOk: 'Correct.', quizBad: 'Not what the data sheet says: ', dose: 'Set the dose', doseOk: 'Within the data sheet range.', doseBad: 'Outside the range: ', prep: 'Material', prepHold: 'Hold to prepare', assist: 'Show me', assistP: 'Play the step once (costs points)', assisted: 'Step done by the demonstration.',
      res: 'Result', resScore: 'Score', resTime: 'Working time', resDays: 'Site days', rank: 'Rating', ranks: ['Trainee', 'Applicator', 'Site specialist'], notes: 'Review', noNotes: 'No deductions — standard work.', cons: 'Materials of this run', quizMiss: '{n} decisions wrong', toolMiss: 'wrong tool {n} times', offMiss: '{s} s off the ring', assistN: '{n} demonstrations', no3d: 'This device cannot build the 3D view; the simulator cannot open.', pct: '%',
      phaseDone: 'Done: {n}', tip: 'Hint', tapFull: 'Tap for the whole instruction', helpT: 'Controls', loading: 'Building the site…' },
    ja: { btn: 'シミュレーターに入る', exit: '退出', score: 'スコア', clock: '現場時刻', day: '{d} 日目', phase: '工程', of: '/', start: '作業開始', again: 'もう一度', back: 'ガイドへ戻る', next: '続ける', skip: '待ち時間を飛ばす', ok: 'OK', help: '操作説明', sound: '音', goto: '作業位置へ', zin: '拡大', zout: '縮小', lock: 'マウスを固定', work: '作業', hold: '長押し', look: '見回す',
      brief: '作業ブリーフィング', briefSub: '{n} 工程 · 現場時刻は {t} から', tools: '今回使う工具', ctrlD: ['画面をドラッグ、またはマウス固定：見回す', 'W A S D／矢印キー：歩く', '工具を選んで左ボタンかスペースを長押し：作業（工具が作業し、視点が自動で追従。工具が画面外に出ると一時停止）', '1–9：工具　ホイール：拡大縮小', '⌖：作業位置へ　H：説明　M：音　Esc：退出'], ctrlT: ['一本指ドラッグ：見回す', '左下のスティック：歩く', '工具を選んで「作業」を長押し：工具が作業し、視点が自動で追従（照準不要。工具が画面外に出ると一時停止）', '工具バーをタップ　二本指：拡大縮小', '⌖：作業位置へ'],
      survey: '現況調査', surveyP: '現場を見回し、各マーカーに照準を止めて {n} か所を確認。', found: '確認 {a} / {n}', toolNeed: '工具を選択：{t}', toolNow: '工具：{t}', aimOff: '長押しで作業', aimOn: '作業中', wrongTool: 'この工程は{t}を使います。', offRing: '工具が画面外です——視点が追いつくまで一時停止。', prog: '進捗 {p} %',
      wait: '待ち時間', waitP: '{h} 時間の待ち（乾燥／硬化）— 現場時刻が進みます。', waitDone: '時間になりました。', cure: '養生', quiz: '現場判断', quizOk: '正解。', quizBad: '技術資料の規定は：', dose: '量の設定', doseOk: '規定範囲内。', doseBad: '範囲外：', prep: '材料の準備', prepHold: '長押しで準備', assist: '手本', assistP: '一度手本を再生（減点）', assisted: 'この工程は手本で完了。',
      res: '結果', resScore: 'スコア', resTime: '作業時間', resDays: '現場日数', rank: '評価', ranks: ['見習い', '施工者', '現場技能者'], notes: '振り返り', noNotes: '減点なし — 標準作業。', cons: '今回の材料', quizMiss: '判断の誤り {n}', toolMiss: '工具の選択ミス {n} 回', offMiss: 'リングを外れた {s} 秒', assistN: '手本 {n} 回', no3d: 'この端末では 3D 画面を作成できず、シミュレーターを開けません。', pct: '%',
      phaseDone: '完了：{n}', tip: 'ヒント', tapFull: 'タップで説明全文', helpT: '操作方法', loading: '現場を作成中…' }
  };
  function L() { return T[LANG] || T.en; }
  function f(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  /* ----- the tools: kind → icon, sound, name ----- */
  var TOOLS = {
    knife: { snd: 'knife', n: { zh: '美工刀', en: 'Knife', ja: 'カッター' } }, spatula: { snd: 'spatula', n: { zh: '抹刀（抹刀）', en: 'Spatula', ja: 'ヘラ' } }, brush: { snd: 'brush', n: { zh: '刷子', en: 'Brush', ja: 'ブラシ' } }, broom: { snd: 'broom', n: { zh: '掃帚', en: 'Broom', ja: 'ほうき' } },
    tape: { snd: 'tape', n: { zh: '遮蔽膠帶', en: 'Masking tape', ja: 'マスキングテープ' } }, rod: { snd: 'rod', n: { zh: '背襯材', en: 'Backer rod', ja: 'バックアップ材' } }, primer: { snd: 'primer', n: { zh: '底漆刷', en: 'Primer brush', ja: 'プライマー刷毛' } }, roller: { snd: 'roller', n: { zh: '滾筒', en: 'Roller', ja: 'ローラー' } },
    gun: { snd: 'gun', n: { zh: '填縫槍', en: 'Caulking gun', ja: 'コーキングガン' } }, hammer: { snd: 'hammer', n: { zh: '打診鎚', en: 'Sounding hammer', ja: '打診ハンマー' } }, hose: { snd: 'hose', n: { zh: '高壓水槍', en: 'Pressure washer', ja: '高圧洗浄機' } }, trowel: { snd: 'trowel', n: { zh: '鋸齒鏝刀', en: 'Notched trowel', ja: 'クシ目ゴテ' } },
    hand: { snd: 'hand', n: { zh: '徒手', en: 'By hand', ja: '手作業' } }, meter: { snd: 'meter', n: { zh: '含水率計', en: 'Moisture meter', ja: '含水率計' } }, mixer: { snd: 'mixer', n: { zh: '攪拌機', en: 'Mixer', ja: '攪拌機' } }, cutter: { snd: 'cutter', n: { zh: '切割機', en: 'Disc cutter', ja: 'ディスクカッター' } },
    chisel: { snd: 'chisel', n: { zh: '鑿刀', en: 'Chisel', ja: 'タガネ' } }, rag: { snd: 'rag', n: { zh: '抹布', en: 'Rag', ja: 'ウエス' } }, sand: { snd: 'sand', n: { zh: '骨材撒布', en: 'Aggregate', ja: '骨材散布' } }, weight: { snd: 'weight', n: { zh: '壓重', en: 'Weights', ja: '重し' } }, vacuum: { snd: 'vacuum', n: { zh: '吸塵器', en: 'Vacuum', ja: '集じん機' } },
    look: { snd: 'look', n: { zh: '觀察・等待', en: 'Observe / wait', ja: '観察・待ち' } }
  };
  var ICON = { knife: 'M4 20L18 6l2 2L6 22zM16 4l4 4', spatula: 'M3 14h11l3-3v-4h3v4l-3 3v4H3zM5 15v2h8v-2', brush: 'M4 4h12v6H4zM7 10v10h6V10', broom: 'M14 3l-7 9M5 21l4-9h5l-1 9z', tape: 'M12 3a6 6 0 100 12 6 6 0 000-12zm0 4a2 2 0 100 4 2 2 0 000-4zM12 15l9 2v4h-9', rod: 'M3 12a9 3 0 0018 0a9 3 0 00-18 0', primer: 'M6 3h5v8H6zM8 11v10', roller: 'M3 5h12v6H3zM15 8h4v4h-4M17 12v9', gun: 'M3 10h12l3-3h3v4h-3l-3 3h-4l-2 7H6l1-7H3z', hammer: 'M4 7h9v5H4zM13 9h7M8 12v9', hose: 'M3 12h6l2-3h4l2 3h4M15 15v6M3 12v6', trowel: 'M3 9h14l3 3H3zM10 12v8', hand: 'M8 11V5a1 1 0 012 0v6M10 10V4a1 1 0 012 0v6M12 10V5a1 1 0 012 0v6M14 11V7a1 1 0 012 0v8a5 5 0 01-10 0v-3a1 1 0 012 0', meter: 'M4 4h16v10H4zM8 8h8M12 14v6', mixer: 'M12 2v12M6 14a6 6 0 0012 0M8 14h8', cutter: 'M12 12m-7 0a7 7 0 1014 0a7 7 0 10-14 0M12 5v14M5 12h14', chisel: 'M6 3h4v12l-2 6-2-6z', rag: 'M4 6c4-2 8 2 12 0s4 2 4 2v10c-4 2-8-2-12 0s-4-2-4-2z', sand: 'M6 18h12M8 14h8M10 10h4M12 6h0', weight: 'M5 20h14l-2-10H7zM10 10V6h4v4', vacuum: 'M4 20h10v-6H4zM14 14l6-8', look: 'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 10a3 3 0 110-6 3 3 0 010 6z' };
  /* anchor key of a rig → the tool that works there (unknown keys that look like tools are guessed by their stem; the rest is observing) */
  var AKEY = { cutter: 'knife', cutterD: 'cutter', chisel: 'chisel', pull: 'hand', scrape: 'spatula', brush: 'brush', brushB: 'brush', brushT: 'brush', brushC: 'brush', broomC: 'broom', sweep: 'broom', bbTape: 'tape', tapeRoll: 'tape', untape: 'tape', rodPush: 'rod', rod: 'rod', prim19: 'primer', prim20: 'primer', prim19s: 'primer', primP: 'primer', rollP: 'roller', rollC: 'roller', rollB: 'roller', paintR: 'roller', paintU: 'roller', gun: 'gun', gunN: 'gun', gunNQ: 'gun', gunE2: 'gun', cornerN: 'gun', beadS: 'gun', rcqA: 'gun', beads: 'gun', termC: 'gun', dab: 'gun', spat: 'spatula', spat2: 'spatula', flat: 'spatula', tap: 'hammer', wash: 'hose', dryB: 'hose', notchedT: 'trowel', board: 'hand', tongue: 'hand', weight: 'weight', wipeA: 'rag', rag: 'rag', meterA: 'meter', agg: 'sand', mix: 'mixer', gritS: 'sand', sheet: 'hand', press: 'hand' };
  function kindOf(key) { if (AKEY[key]) return AKEY[key]; if (/^roll/.test(key)) return 'roller'; if (/^gun|bead/.test(key)) return 'gun'; if (/^brush/.test(key)) return 'brush'; if (/^spat/.test(key)) return 'spatula'; if (/^prim/.test(key)) return 'primer'; if (/^tape/.test(key)) return 'tape'; if (/^(dry|open|cure|wait|walk|record|clean|adhesion|wetlook|same|coping|patch|recoat|c[12]|seal|term|crack|dust|gap|old|joint|hat|bb|exposed|full|cured|tgrey|loose|ms|rain)/.test(key)) return 'look'; return 'look'; }
  function tname(k) { var t = TOOLS[k] || TOOLS.look; return t.n[LANG] || t.n.en; }

  /* ----- state ----- */
  var root = null, el = {}, view = null, cfg = null, S = null, raf = 0, lastT = 0, built = false, opener = null, COARSE = false, keys = {}, PTR = {}, pinch = null, feedTimer = 0, helpOpen = false, locked = false;
  var V3 = null, V3b = null, FWD = null, UP = null, RIGHT = null;
  function $(id) { var e = el[id]; if (e && e.isConnected) return e; e = document.getElementById(id); if (e) el[id] = e; else delete el[id]; return e; } /* the cards are rebuilt, so a cached element may be gone */
  function isTouch() { return COARSE; }
  function rect() { return $('hsimView').getBoundingClientRect(); }
  function tol() { var r = rect(), m = Math.min(r.width, r.height); return (isTouch() ? Math.max(76, m * 0.17) : Math.max(60, m * 0.12)); }
  function vib(p) { try { if (COARSE && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

  /* ----- the overlay ----- */
  function build() {
    if (built) return; built = true; COARSE = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    root = document.createElement('div'); root.className = 'hsim'; root.id = 'hsim'; root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.innerHTML = '<div class="hsim__view" id="hsimView"><canvas aria-label="3D"></canvas></div>' +
      '<div class="hsim__cross" id="hsCross" aria-hidden="true"><i></i></div>' +
      '<div class="hsim__ring" id="hsRing" hidden aria-hidden="true"><svg viewBox="0 0 80 80"><circle class="r0" cx="40" cy="40" r="34"/><circle class="r1" id="hsRingArc" cx="40" cy="40" r="34" pathLength="100"/></svg><span class="hsim__ringlbl" id="hsRingLbl"></span></div>' +
      '<div class="hsim__arrow" id="hsArrow" hidden aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 4l14 26-14-7-14 7z"/></svg></div>' +
      '<div class="hsim__marks" id="hsMarks" aria-hidden="true"></div>' +
      '<div class="hsim__top"><div class="hsim__box" id="hsBox"><div class="hsim__phase" id="hsPhase"></div><div class="hsim__prompt" id="hsPrompt"></div><div class="hsim__count" id="hsCount"></div></div><div class="hsim__stat"><div class="hsim__score"><b id="hsScore">0</b><span id="hsScoreL"></span></div><div class="hsim__clock" id="hsClock"></div></div></div>' +
      '<div class="hsim__side"><button type="button" class="hsim__ico" id="hsExit" title=""><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button><button type="button" class="hsim__ico" id="hsGoto" title=""><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg></button><button type="button" class="hsim__ico" id="hsZin" title=""><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5M8 11h6M11 8v6"/></svg></button><button type="button" class="hsim__ico" id="hsZout" title=""><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5M8 11h6"/></svg></button><button type="button" class="hsim__ico" id="hsSnd" title="" aria-pressed="true"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M18 6a8 8 0 010 12"/></svg></button><button type="button" class="hsim__ico" id="hsLock" title="" aria-pressed="false"><svg viewBox="0 0 24 24"><rect x="6" y="11" width="12" height="9"/><path d="M9 11V7a3 3 0 016 0v4"/></svg></button><button type="button" class="hsim__ico" id="hsHelp" title=""><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h0"/></svg></button></div>' +
      '<div class="hsim__feed" id="hsFeed" aria-live="polite"></div>' +
      '<div class="hsim__toolname" id="hsToolName" aria-hidden="true"></div>' +
      '<div class="hsim__tools" id="hsTools" role="toolbar"></div>' +
      '<div class="hsim__stick" id="hsStick" aria-hidden="true"><i id="hsStickKnob"></i></div>' +
      '<button type="button" class="hsim__work" id="hsWork"><b></b><span></span></button>' +
      '<div class="hsim__card" id="hsCard" hidden></div><div class="hsim__help" id="hsHelp2" hidden></div>';
    document.body.appendChild(root);
    V3 = new THREE.Vector3(); V3b = new THREE.Vector3(); FWD = new THREE.Vector3(); UP = new THREE.Vector3(0, 1, 0); RIGHT = new THREE.Vector3();
    var cv = $('hsimView');
    cv.addEventListener('pointerdown', pDown); cv.addEventListener('pointermove', pMove); ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { cv.addEventListener(n, pUp); });
    cv.addEventListener('wheel', function (e) { e.preventDefault(); zoomBy(e.deltaY > 0 ? 1.08 : 0.93); }, { passive: false });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv.addEventListener('click', function () { if (locked && document.pointerLockElement !== cv) { try { cv.requestPointerLock(); } catch (e) {} } });
    document.addEventListener('pointerlockchange', function () { var on = document.pointerLockElement === cv; $('hsLock').setAttribute('aria-pressed', on ? 'true' : 'false'); root.classList.toggle('is-locked', on); });
    document.addEventListener('mousemove', function (e) { if (document.pointerLockElement === cv && S) { S.look.yaw -= e.movementX * 0.0022; S.look.pitch = clampP(S.look.pitch - e.movementY * 0.0022); S.auto = 0; } });
    $('hsExit').addEventListener('click', close); $('hsGoto').addEventListener('click', function () { goWork(true); }); $('hsZin').addEventListener('click', function () { zoomBy(0.86); }); $('hsZout').addEventListener('click', function () { zoomBy(1.16); });
    $('hsSnd').addEventListener('click', function () { var m = SimAudio.toggle(); $('hsSnd').setAttribute('aria-pressed', m ? 'false' : 'true'); if (!m) ambient(); });
    $('hsLock').addEventListener('click', function () { locked = !locked; if (locked) { try { cv.requestPointerLock(); } catch (e) {} } else if (document.pointerLockElement) document.exitPointerLock(); });
    $('hsHelp').addEventListener('click', function () { help(!helpOpen); });
    var wk = $('hsWork'); wk.addEventListener('pointerdown', function (e) { e.preventDefault(); S && (S.btn = true); try { wk.setPointerCapture(e.pointerId); } catch (er) {} }); ['pointerup', 'pointercancel'].forEach(function (n) { wk.addEventListener(n, function () { if (S) S.btn = false; }); });
    $('hsBox').addEventListener('click', function () { $('hsBox').classList.toggle('is-open'); });
    var st = $('hsStick'); st.addEventListener('pointerdown', stickDown); st.addEventListener('pointermove', stickMove); ['pointerup', 'pointercancel'].forEach(function (n) { st.addEventListener(n, stickUp); });
    document.addEventListener('keydown', keyDown); document.addEventListener('keyup', function (e) { keys[e.code] = false; if (e.code === 'Space' && S) S.key = false; });
    document.addEventListener('visibilitychange', function () { if (document.hidden && S) SimAudio.stopAll(); else if (S && !root.hidden) ambient(); });
    SimAudio.onChange(function (m) { $('hsSnd').setAttribute('aria-pressed', m ? 'false' : 'true'); });
    window.addEventListener('resize', function () { if (S) layout(); });
  }
  function labels() { var l = L(); $('hsExit').title = l.exit; $('hsGoto').title = l.goto; $('hsZin').title = l.zin; $('hsZout').title = l.zout; $('hsSnd').title = l.sound; $('hsLock').title = l.lock; $('hsHelp').title = l.help; $('hsScoreL').textContent = l.score; $('hsWork').querySelector('b').textContent = l.work; $('hsWork').querySelector('span').textContent = l.hold; $('hsSnd').setAttribute('aria-pressed', SimAudio.muted() ? 'false' : 'true'); }
  function layout() { root.classList.toggle('is-touch', isTouch()); root.classList.toggle('is-narrow', rect().width < 700); }

  /* ----- the view: the guide's sample, first person ----- */
  function makeView() {
    var host = $('hsimView');
    if (view && view.scenario && view.scenario() === cfg.scn && view.__cat === cfg.cat) return;
    if (view) { /* the same view, another sample: the engine swaps the sample, the place is rebuilt around it */
      if (view.__env) { try { SimEnv.remove(view, view.__env); } catch (e) {} view.__env = null; }
      try { view.setScenario(cfg.scn); } catch (e) {} view.__cat = cfg.cat; dress(); return; }
    view = new CRView(host, { mode: 'full', scenario: cfg.scn }); view.__cat = cfg.cat; view.lockCam = true; view.fps = fpsCam; try { view.setTheme('light'); } catch (e) {}
    /* full screen and every frame: the resolution is capped (the governor of the engine lowers it further on weak hardware, then the shadows) */
    if (!window.FAST3D) { try { view.dbg.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, COARSE ? 1.25 : 1.5)); } catch (e) {} }
    dress();
  }
  function fpsCam(cam, now) {
    if (!S) return; var k = S.look, bob = S.walking ? 0.012 * Math.sin(now / 1000 * 9) : (S.engaged ? 0.002 * Math.sin(now / 1000 * 2.2) : 0);
    cam.position.set(S.pos.x, S.pos.y + bob, S.pos.z); cam.rotation.order = 'YXZ'; cam.rotation.set(k.pitch, k.yaw, 0);
    var r = rect(), asp = r.height ? r.width / r.height : 1.6, fov = Math.max(34, Math.min(100, k.fov + (asp < 0.8 ? 18 : asp < 1.15 ? 9 : 0)));
    /* a wide screen keeps a natural picture: the horizontal field of view is capped at 96°, so the work face is not stretched at the edges */
    var hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * asp) * 180 / Math.PI; if (hf > 96) fov = 2 * Math.atan(Math.tan(48 * Math.PI / 180) / asp) * 180 / Math.PI;
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld(true); var lp = view && view.__lamp; if (lp) { cam.getWorldDirection(FWD); lp.position.copy(cam.position).addScaledVector(UP, 0.15); lp.target.position.copy(cam.position).addScaledVector(FWD, 3); lp.target.updateMatrixWorld(true); }
  }
  /* the place: SimEnv builds the surroundings of the sample (facade, lane, balcony, roof, room) and the sky; a site lamp rides over the shoulder for the indoor work */
  function dress() {
    var sc = view.dbg.scene, P = null;
    try { P = SimEnv.build(view, cfg.cat, cfg.scn); view.__env = P.group; } catch (e) { if (window.console) console.error('hsim env', e); }
    var outdoor = !P || P.amb !== 'indoor';
    if (!view.__lamp) { var lamp = new THREE.SpotLight(0xfff0dc, 0.25, 10, 0.9, 0.5, 1.3); lamp.castShadow = false; sc.add(lamp); sc.add(lamp.target); view.__lamp = lamp; }
    view.__lamp.intensity = outdoor ? 0.25 : 0.9;
    view.wake();
  }

  /* ----- the run: phases from the procedure of the guide ----- */
  function sampleRigs() { /* the tool at work along every rigged stage, sampled: which tool the step needs at each moment, and where the work is (read off the rigs, nothing rendered) */
    var seq = {}, st = cfg.stages, m = view.dbg.member, M4; m.group.updateMatrixWorld(true); M4 = m.group.matrixWorld;
    st.forEach(function (id) { var d = view.dur(id); if (!d) return; var list = [], t; for (t = 0.02; t < 0.995; t += 0.03) { var A = m.anchors(id, t); if (A && A.length) { var a = A[0]; list.push({ t: t, k: a.k, kind: kindOf(a.k), p: new THREE.Vector3(a.p[0], a.p[1], a.p[2]).applyMatrix4(M4) }); } } seq[id] = list; });
    return seq;
  }
  function toolAt(stage, t) { var list = S.seq[stage]; if (!list || !list.length) return null; var best = list[0], i; for (i = 0; i < list.length; i++) if (list[i].t <= t) best = list[i]; return best; }
  function phasesOf() {
    var ph = [], st = cfg.stages, steps = cfg.steps, lastP = {}, i, l = L(), surveyDone = false, quizUsed = {}, prepUsed = {}, doseUsed = {};
    function before(stageId) { (cfg.prep || []).forEach(function (p) { if (p.at === stageId && !prepUsed[p.at + p.kind]) { prepUsed[p.at + p.kind] = 1; ph.push({ kind: 'prep', stage: stageId, prep: p }); } }); (cfg.quiz || []).forEach(function (q, qi) { if (q.at === stageId && !quizUsed[qi]) { quizUsed[qi] = 1; ph.push({ kind: 'quiz', stage: stageId, q: q }); } }); (cfg.dose || []).forEach(function (d, di) { if (d.at === stageId && !doseUsed[di]) { doseUsed[di] = 1; ph.push({ kind: 'dose', stage: stageId, d: d }); } }); }
    function after(stageId) { var h = cfg.waits && cfg.waits[stageId]; if (h) ph.push({ kind: 'wait', stage: stageId, hours: h }); }
    steps.forEach(function (s, si) {
      var id = st[s.stage], nxt = steps[si + 1], last = !nxt || nxt.stage !== s.stage;
      if (s.p == null) { if (s.stage === 0) { if (!surveyDone) { surveyDone = true; ph.push({ kind: 'survey', stage: id, steps: steps.filter(function (x) { return x.stage === 0; }) }); } return; } return; }
      var from = lastP[id] != null ? lastP[id] : 0, to = last ? 1 : s.p; if (to <= from) return;
      if (lastP[id] == null) before(id);
      ph.push({ kind: 'drive', stage: id, from: from, to: to, step: s, secs: Math.max(4, Math.min(16, (view.dur(id) || 6) * (to - from) * 2.1)) }); lastP[id] = to;
      if (last) after(id);
    });
    if (cfg.cure) ph.push({ kind: 'wait', stage: st[st.length - 1], hours: cfg.cure, cure: true });
    ph.push({ kind: 'final' });
    return ph;
  }
  function fresh() { return { phase: -1, tool: -1, score: 0, t0: performance.now(), clock: cfg.clock0 || 8, tw: 0, look: { yaw: 0, pitch: 0, fov: cfg.fov || 62 }, pos: new THREE.Vector3(0, 1.55, 2.5), vel: new THREE.Vector3(), walking: false, hold: false, btn: false, key: false, ptr: null, engaged: false, auto: 0, move: null, lamp: null, seq: null, ring: null, found: {}, feed: 0, notes: { quiz: 0, tool: 0, off: 0, assist: 0 }, off: 0, toolErr: 0, done: {}, fin: false, lapse: null, card: null, lastStep: 0, prevKind: null, mode: 'free', hudTool: null }; }

  /* ----- open / close ----- */
  function open(cat, M, btn) {
    build(); opener = btn || document.activeElement; cfg = M._sim(); if (!cfg) return; cfg.module = M;
    if (typeof CRView === 'undefined' || !window.THREE) { alert(L().no3d); return; }
    root.hidden = false; labels(); layout(); document.body.classList.add('hsim-open'); try { document.documentElement.style.overflow = 'hidden'; } catch (e) {}
    S = fresh(); card('<p class="hsim__kick">' + esc(L().brief) + '</p><h2>' + esc((cfg.t && cfg.t.title) || cfg.scnName || '') + '</h2><p class="hsim__loading"><i></i>' + esc(L().loading) + '</p>');
    var my = S; setTimeout(function () { if (S !== my) return; /* the overlay is painted; now the site is built */
      try { makeView(); S.seq = sampleRigs(); S.phases = phasesOf(); S.mats = cfg.mats || []; } catch (e) { if (window.console) console.error('hsim open', e); card('<p>' + esc(L().no3d) + '</p><div class="hsim__cardact"><button class="sb-btn sb-btn--primary" type="button" id="hsBack">' + esc(L().back) + '</button></div>'); $('hsBack').addEventListener('click', close); return; }
      SimAudio.init(); ambient();
      tools(); $('hsScore').textContent = '0'; feed('');
      brief();
      lastT = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    }, 40);
  }
  function close() { if (!root || root.hidden) return; cancelAnimationFrame(raf); SimAudio.suspend(); if (document.pointerLockElement) { try { document.exitPointerLock(); } catch (e) {} } root.hidden = true; document.body.classList.remove('hsim-open'); try { document.documentElement.style.overflow = ''; } catch (e) {} S = null; if (opener && opener.focus) { try { opener.focus(); } catch (e) {} } }
  function ambient() { SimAudio.ambient(cfg.amb === 'indoor' ? 'indoor' : cfg.amb === 'roof' ? 'roof' : 'outdoor'); }

  /* ----- the tools bar ----- */
  function toolKinds() { var seen = {}, out = []; cfg.stages.forEach(function (id) { (S.seq[id] || []).forEach(function (x) { if (x.kind !== 'look' && !seen[x.kind]) { seen[x.kind] = 1; out.push(x.kind); } }); }); return out; }
  function tools() { var ks = toolKinds(); S.kinds = ks; $('hsTools').innerHTML = ks.map(function (k, i) { return '<button type="button" class="hsim__tool" data-i="' + i + '" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (ICON[k] || ICON.look) + '"/></svg><span>' + esc(tname(k)) + '</span><i>' + (i + 1) + '</i></button>'; }).join('');
    [].forEach.call($('hsTools').children, function (b) { b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); }); b.addEventListener('click', function () { pick(+b.getAttribute('data-i')); }); }); }
  function pick(i) { if (!S || i < 0 || i >= S.kinds.length) return; if (S.tool === i) return; S.tool = i; SimAudio.fx('click'); vib(8); var need = needKind(); if (need && need !== 'look' && S.kinds[i] !== need) { S.toolErr++; S.notes.tool++; feed(f(L().wrongTool, { t: tname(need) }), 'bad'); } hud(); }
  function needKind() { var p = cur(); if (!p || p.kind !== 'drive') return null; var at = toolAt(p.stage, S.tw); return at ? at.kind : null; }
  function toolOk() { var n = needKind(); return !n || n === 'look' || (S.tool >= 0 && S.kinds[S.tool] === n); }

  /* ----- phases ----- */
  function cur() { return S && S.phases ? S.phases[S.phase] : null; }
  function stageIdx(id) { return Math.max(0, cfg.stages.indexOf(id)); }
  function stepText(s) { var c = s.c || {}; return { n: plain(c.title || ''), p: plain(c.short || ''), pts: (c.points || []).map(plain), warn: c.warning ? plain(c.warning) : '' }; }
  function nextPhase() {
    S.phase++; var p = cur(); if (!p) return; S.engaged = false; S.hold = false; S.card = null; card(null); $('hsRing').hidden = true; $('hsMarks').innerHTML = '';
    if (p.kind === 'drive') { view.setStage(stageIdx(p.stage), true); S.tw = p.from; view.freeze(S.tw); S.lastRing = null; goWork(false); hud(); boxOpen(true); SimAudio.fx('page'); }
    else if (p.kind === 'survey') { view.setStage(0, true); view.freeze(1); S.found = {}; S.gaze = { k: null, t: 0 }; var A = view.anchorsWorld(); S.targets = A.filter(function (a) { return cfg.labels[a.k]; }).slice(0, 6); goWork(false, true); hud(); boxOpen(true); }
    else if (p.kind === 'wait') { view.setStage(stageIdx(p.stage), true); view.freeze(1); waitCard(p); }
    else if (p.kind === 'quiz') quizCard(p);
    else if (p.kind === 'dose') doseCard(p);
    else if (p.kind === 'prep') prepCard(p);
    else if (p.kind === 'final') results();
    hud();
  }
  function donePhase(p) { SimAudio.fx('ok'); feed(f(L().phaseDone, { n: p.kind === 'drive' ? stepText(p.step).n : (L()[p.kind] || '') }), 'ok'); S.done[S.phase] = 1; setTimeout(function () { if (S) nextPhase(); }, 650); }
  /* ----- the work ring: where the tool is, projected ----- */
  function ringWorld() { var p = cur(); if (!p) return null; if (p.kind === 'drive') { var A = view.anchorsWorld(); if (!A.length) return null; var pick0 = A[0]; S.ringKey = pick0.k; return pick0.p; } return null; }
  function project(w, out) { var cam = view.dbg.cam, r = rect(); V3b.copy(w).project(cam); out.x = (V3b.x + 1) / 2 * r.width; out.y = (1 - V3b.y) / 2 * r.height; out.behind = V3b.z > 1; out.on = !out.behind && V3b.x > -1 && V3b.x < 1 && V3b.y > -1 && V3b.y < 1; return out; }
  var RP = { x: 0, y: 0 };
  function crossAt() { var r = rect(); return { x: r.width / 2, y: r.height / 2 }; }
  function aimOk(px) { var c = S.ptr && S.ptr.hold ? S.ptr : crossAt(), d = Math.hypot(px.x - c.x, px.y - c.y), t = tol() * (S.engaged ? 1.7 : 1); return d < t; }
  function steer(w, dt, rate) { /* the view turns onto a world point by itself (the work moves, the user keeps it in the ring without chasing) */
    var dx = w.x - S.pos.x, dy = w.y - S.pos.y, dz = w.z - S.pos.z, yaw = Math.atan2(-dx, -dz), pitch = Math.atan2(dy, Math.hypot(dx, dz)), k = Math.min(1, dt * (rate || 3));
    var dyaw = yaw - S.look.yaw; while (dyaw > Math.PI) dyaw -= Math.PI * 2; while (dyaw < -Math.PI) dyaw += Math.PI * 2; S.look.yaw += dyaw * k; S.look.pitch += (clampP(pitch) - S.look.pitch) * k; }
  function clampP(p) { return Math.max(-1.5, Math.min(1.15, p)); } /* down to the feet, up to the slab above */

  /* ----- standing: the spot in front of the work ----- */
  function floorAt(x, z) { var fl = cfg.floor; if (fl && x > fl.x0 && x < fl.x1 && z > fl.z0 && z < fl.z1) return fl.y; var E = view.__env && view.__env.userData && view.__env.userData.E; if (E && E.ground != null) return E.ground; return view.dbg.member.ground || 0; } /* the place's ground: the pavement top where the sample shows its footing below it */
  function standFor(w, d) { var dir = cfg.face ? new THREE.Vector3(cfg.face[0], 0, cfg.face[1]) : new THREE.Vector3(0, 0, 1); d = d || cfg.standoff || 1.3; var pos = new THREE.Vector3(w.x + dir.x * d, 0, w.z + dir.z * d); if (cfg.walk) pos.x = Math.max(cfg.walk.x0, Math.min(cfg.walk.x1, pos.x)), pos.z = Math.max(cfg.walk.z0, Math.min(cfg.walk.z1, pos.z)); pos.y = floorAt(pos.x, pos.z) + (cfg.eye || 1.55); return pos; }
  /* (v65) the work of a phase, read whole: where its tool goes (the rig's own path between its two progress marks), its centre, its box, whether it
     lies on the floor. The stand point is chosen from it — not from the tool's first touch — so the work is in front of the eyes at a working
     distance, never under the feet; and the view follows a point between the centre of the work and the tool, so it frames the job and turns
     gently as the tool goes, instead of chasing a tool that sweeps past the feet */
  function pathOf(p) { if (p._path) return p._path; var L = (S.seq[p.stage] || []).filter(function (x) { return x.t >= p.from - 0.015 && x.t <= p.to + 0.015 && x.kind !== 'look'; }); if (!L.length) L = (S.seq[p.stage] || []).filter(function (x) { return x.t >= p.from - 0.015 && x.t <= p.to + 0.015; }); if (!L.length) return null;
    var C = new THREE.Vector3(), mn = new THREE.Vector3(1e9, 1e9, 1e9), mx = new THREE.Vector3(-1e9, -1e9, -1e9); L.forEach(function (x) { C.add(x.p); mn.min(x.p); mx.max(x.p); }); C.multiplyScalar(1 / L.length);
    var fy = floorAt(C.x, C.z), floorLike = mx.y - fy < 0.7 && mx.y - mn.y < 0.65; p._path = { C: C, mn: mn, mx: mx, pts: L, floor: floorLike }; return p._path; }
  function standForPath(p) { var P = pathOf(p); if (!P) return null; var W = cfg.walk, eye = cfg.eye || 1.55, face = cfg.face ? new THREE.Vector3(cfg.face[0], 0, cfg.face[1]).normalize() : new THREE.Vector3(0, 0, 1);
    if (!W) return standFor(P.C, P.floor ? 1.1 : 0);
    var want = P.floor ? Math.max(0.75, Math.min(1.6, (eye - P.C.y) * 0.8)) : (cfg.standoff || 1.2), best = null, bs = 1e9, i, j, N = 10;
    for (i = 0; i <= N; i++) for (j = 0; j <= N; j++) { var x = W.x0 + (W.x1 - W.x0) * i / N, z = W.z0 + (W.z1 - W.z0) * j / N; if (cfg.keep && x > cfg.keep.x0 && x < cfg.keep.x1 && z > cfg.keep.z0 && z < cfg.keep.z1) continue;
      var dx = P.C.x - x, dz = P.C.z - z, dh = Math.hypot(dx, dz), sc = Math.abs(dh - want), fd = -(dx * face.x + dz * face.z) / Math.max(1e-3, dh);
      if (fd < 0.2) sc += P.floor ? 0.12 * (0.2 - fd) : 1.2 * (0.2 - fd); /* in front of the work's face (for a floor, any side will do) */
      /* not standing on the work itself, and the work not spread round the eye wider than a turn of the head */ var ex = 0.12; if (x > P.mn.x - ex && x < P.mx.x + ex && z > P.mn.z - ex && z < P.mx.z + ex) sc += 0.45;
      var a0 = 1e9, a1 = -1e9, base = Math.atan2(dx, dz); [[P.mn.x, P.mn.z], [P.mn.x, P.mx.z], [P.mx.x, P.mn.z], [P.mx.x, P.mx.z]].forEach(function (q) { var a = Math.atan2(q[0] - x, q[1] - z) - base; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; a0 = Math.min(a0, a); a1 = Math.max(a1, a); }); var spread = a1 - a0; if (spread > 1.6) sc += (spread - 1.6) * 0.5;
      if (sc < bs) { bs = sc; best = [x, z]; } }
    var pos = new THREE.Vector3(best[0], 0, best[1]); pos.y = floorAt(pos.x, pos.z) + eye; return pos; }
  function frameAt(p, w) { var P = pathOf(p); if (!P || !w) return w; return (RV9 || (RV9 = new THREE.Vector3())).copy(P.C).lerp(w, P.floor ? 0.6 : 0.85); }
  var RV9 = null;
  function goWork(user, survey) {
    var w = null, p0 = cur(); if (p0 && p0.kind === 'survey') survey = true; if (survey) { var A = view.anchorsWorld(); if (A.length) { w = new THREE.Vector3(); A.forEach(function (a) { w.add(a.p); }); w.multiplyScalar(1 / A.length); } }
    else w = ringWorld(); if (!w) return;
    var to = null, aim = w; if (!survey && p0 && p0.kind === 'drive') { to = standForPath(p0); aim = frameAt(p0, w); } if (!to) to = standFor(w, survey ? Math.max(cfg.standoff || 1.3, 1.1) : 0);
    S.move = { a: S.pos.clone(), b: to, t: 0, w: aim.clone(), dur: user ? 0.7 : 0.9 }; S.auto = 1.2; if (user) SimAudio.fx('click');
  }

  /* ----- input ----- */
  function pDown(e) { if (!S || S.card) return; if (e.target.closest && e.target.closest('.hsim__tool, .hsim__stick, .hsim__work, .hsim__side, .hsim__top')) return; var r = rect(); e.preventDefault(); var p = { id: e.pointerId, x: e.clientX - r.left, y: e.clientY - r.top, x0: e.clientX - r.left, y0: e.clientY - r.top, t0: performance.now(), hold: false, type: e.pointerType, moved: 0 }; PTR[e.pointerId] = p; try { $('hsimView').setPointerCapture(e.pointerId); } catch (er) {} var n = Object.keys(PTR).length; if (n === 2) { var ks = Object.keys(PTR); pinch = { d: Math.hypot(PTR[ks[0]].x - PTR[ks[1]].x, PTR[ks[0]].y - PTR[ks[1]].y), fov: S.look.fov }; S.ptr = null; return; } if (!document.pointerLockElement) S.ptr = p; if (S.ring && Math.hypot(p.x - S.ring.x, p.y - S.ring.y) < tol()) { p.hold = true; S.ptr = p; } }
  function pMove(e) { var p = PTR[e.pointerId]; if (!p || !S) return; var r = rect(), x = e.clientX - r.left, y = e.clientY - r.top, dx = x - p.x, dy = y - p.y; p.x = x; p.y = y; p.moved += Math.hypot(dx, dy);
    if (pinch) { var ks = Object.keys(PTR); if (ks.length === 2) { var d = Math.hypot(PTR[ks[0]].x - PTR[ks[1]].x, PTR[ks[0]].y - PTR[ks[1]].y); S.look.fov = Math.max(34, Math.min(95, pinch.fov * pinch.d / Math.max(10, d))); } return; }
    if (p.hold) { if (S.ring && Math.hypot(x - S.ring.x, y - S.ring.y) > tol() * 2.4) { p.hold = false; } else return; }
    if (document.pointerLockElement) return; var k = (isTouch() ? 0.0048 : 0.0036) * (S.look.fov / 62), sg = p.type === 'touch' ? 1 : -1; /* a finger drags the world, a mouse steers the eye */ S.look.yaw += dx * k * sg; S.look.pitch = clampP(S.look.pitch + dy * k * sg); S.auto = 0; }
  function pUp(e) { var p = PTR[e.pointerId]; if (!p) return; delete PTR[e.pointerId]; if (S && S.ptr === p) S.ptr = null; if (Object.keys(PTR).length < 2) pinch = null; }
  function keyDown(e) { if (!S || root.hidden) return; if (helpOpen && e.code === 'Escape') { help(false); return; } if (S.card) { if (e.code === 'Escape') close(); return; } keys[e.code] = true;
    if (e.code === 'Space') { S.key = true; e.preventDefault(); } else if (e.code === 'Escape') close(); else if (e.code === 'KeyM') { SimAudio.toggle(); } else if (e.code === 'KeyH') help(!helpOpen); else if (e.code === 'KeyL') $('hsLock').click(); else if (/^Digit[1-9]$/.test(e.code)) pick(+e.code.slice(5) - 1); else if (e.code === 'KeyG' || e.code === 'KeyF') goWork(true); }
  var stick = null;
  function stickDown(e) { e.preventDefault(); e.stopPropagation(); var r = $('hsStick').getBoundingClientRect(); stick = { id: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: r.width / 2, x: 0, y: 0 }; try { $('hsStick').setPointerCapture(e.pointerId); } catch (er) {} stickMove(e); }
  function stickMove(e) { if (!stick || e.pointerId !== stick.id) return; var dx = e.clientX - stick.cx, dy = e.clientY - stick.cy, d = Math.hypot(dx, dy), m = Math.min(1, d / (stick.R * 0.7)); if (d > 0) { dx /= d; dy /= d; } stick.x = dx * m; stick.y = dy * m; $('hsStickKnob').style.transform = 'translate(' + (stick.x * stick.R * 0.5) + 'px,' + (stick.y * stick.R * 0.5) + 'px)'; }
  function stickUp(e) { if (!stick || e.pointerId !== stick.id) return; stick = null; $('hsStickKnob').style.transform = ''; }
  function zoomBy(k) { if (!S) return; S.look.fov = Math.max(34, Math.min(95, S.look.fov * k)); }

  /* ----- the frame ----- */
  function frame(now) { if (!S) return; raf = requestAnimationFrame(frame); var dt = lastT ? Math.min(0.08, (now - lastT) / 1000) : 0; lastT = now; try { tick(dt, now); } catch (e) { if (window.console) console.error('hsim', e); } }
  function tick(dt, now) {
    var p = cur(); if (!p) return;
    /* the camera: a walk to the stand point, or the user's own walking */
    if (S.move) { S.move.t = Math.min(1, S.move.t + dt / S.move.dur); var e = S.move.t * S.move.t * (3 - 2 * S.move.t); S.pos.lerpVectors(S.move.a, S.move.b, e); steer(S.move.w, dt, 6); if (S.move.t >= 1) S.move = null; }
    else if (!S.card) walk(dt, now);
    if (S.auto > 0) S.auto -= dt;
    view.wake();
    if (S.card) { $('hsRing').hidden = true; $('hsArrow').hidden = true; SimAudio.tool(null); return; }
    if (p.kind === 'drive') drive(dt, now); else if (p.kind === 'survey') survey(dt);
    S.clock += dt / 60; /* the site clock runs 60× while working */
    if ((now - (S.hudAt || 0)) > 150) { S.hudAt = now; hud(); }
  }
  function walk(dt, now) {
    var fx = 0, fz = 0; if (keys.KeyW || keys.ArrowUp) fz -= 1; if (keys.KeyS || keys.ArrowDown) fz += 1; if (keys.KeyA || keys.ArrowLeft) fx -= 1; if (keys.KeyD || keys.ArrowRight) fx += 1; if (stick) { fx += stick.x; fz += stick.y; }
    var m = Math.hypot(fx, fz); S.walking = m > 0.05; if (!S.walking) return; if (m > 1) { fx /= m; fz /= m; }
    var sp = 1.15 * dt, sy = Math.sin(S.look.yaw), cy = Math.cos(S.look.yaw), dx = (fx * cy + fz * sy) * sp, dz = (-fx * sy + fz * cy) * sp; /* forward is −z at yaw 0: right = (cos, 0, −sin), forward = (−sin, 0, −cos) */
    var nx = S.pos.x + dx, nz = S.pos.z + dz, W = cfg.walk; if (W) { nx = Math.max(W.x0, Math.min(W.x1, nx)); nz = Math.max(W.z0, Math.min(W.z1, nz)); }
    var keep = cfg.keep; if (keep && nx > keep.x0 && nx < keep.x1 && nz > keep.z0 && nz < keep.z1) { if (Math.abs(dz) >= Math.abs(dx)) nz = S.pos.z; else nx = S.pos.x; if (nx > keep.x0 && nx < keep.x1 && nz > keep.z0 && nz < keep.z1) { nx = S.pos.x; nz = S.pos.z; } }
    S.pos.x = nx; S.pos.z = nz; S.pos.y += ((floorAt(nx, nz) + (cfg.eye || 1.55)) - S.pos.y) * Math.min(1, dt * 8);
    if (!S.stepAt || now - S.stepAt > 480) { S.stepAt = now; SimAudio.fx('step'); }
  }
  function drive(dt, now) {
    var p = cur(), w = ringWorld(); if (!w) return; var px = project(w, RP); S.ring = { x: px.x, y: px.y, on: px.on, behind: px.behind, w: w };
    var holding = S.btn || S.key || (S.ptr && S.ptr.hold) || (S.ptr && !isTouch() && Object.keys(PTR).length === 1 && S.ptr.moved < 12 && now - S.ptr.t0 > 160);
    /* (v65) the work goes on while the right tool is held and the tool is in sight — no aiming at a moving ring: the view frames the work and follows
       the tool by itself (a finger dragging the view takes over until it lets go); a tool that leaves the screen pauses the work while the view catches up */
    var need = needKind(), ok = toolOk(), rr = rect(), mgX = rr.width * 0.04, mgY = rr.height * 0.06, seen = px.on && !px.behind && px.x > mgX && px.x < rr.width - mgX && px.y > mgY && px.y < rr.height - mgY, fw = frameAt(p, w), dragging = !!(S.ptr && !S.ptr.hold && S.ptr.moved > 12);
    if (holding && !ok) { if (!S.warnAt || now - S.warnAt > 2500) { S.warnAt = now; feed(f(L().wrongTool, { t: tname(need) }), 'bad'); SimAudio.fx('bad'); } S.engaged = false; }
    else if (holding && seen) { S.engaged = true; S.tw = Math.min(p.to, S.tw + dt * (p.to - p.from) / p.secs); view.freeze(S.tw); S.score += (aimOk(px) ? 14 : 10) * dt; /* a steady eye on the tool earns a little more */ var edge = Math.max(Math.abs(px.x - rr.width / 2) / (rr.width / 2), Math.abs(px.y - rr.height / 2) / (rr.height / 2)); /* the nearer the edge, the quicker the view follows */ if (!dragging && !(S.ptr && S.ptr.hold)) steer(edge > 0.6 ? w : fw, dt, 2.0 + Math.max(0, edge - 0.5) * 8); }
    else { if (holding) { S.off += dt; if (!S.offAt || now - S.offAt > 3000) { S.offAt = now; feed(L().offRing, ''); } if (!dragging) steer(fw, dt, 3.4); } S.engaged = false; }
    if (S.auto > 0 && !holding) steer(fw, dt, 1.6);
    SimAudio.tool(S.engaged ? (TOOLS[need] || TOOLS.look).snd : null);
    ring(px, (S.tw - p.from) / (p.to - p.from), S.engaged, S.ringKey);
    $('hsWork').classList.toggle('is-on', S.engaged);
    if (S.tw >= p.to - 1e-6) { S.engaged = false; SimAudio.tool(null); S.tw = p.to; view.freeze(S.tw); if (!S.done[S.phase]) donePhase(p); }
  }
  function survey(dt) {
    var c = crossAt(), hit = null, i, items = S.targets || [];
    $('hsMarks').innerHTML = items.map(function (a, k) { var px = project(a.p, { x: 0, y: 0 }); if (!px.on) return ''; var d = Math.hypot(px.x - c.x, px.y - c.y), near = d < tol() * 0.9; if (near && !hit && !S.found[a.k]) hit = a; return '<div class="hsim__mark' + (S.found[a.k] ? ' is-found' : near ? ' is-near' : '') + '" style="left:' + px.x + 'px;top:' + px.y + 'px"><i>' + (k + 1) + '</i><span>' + esc(plain(cfg.labels[a.k] || a.k)) + '</span></div>'; }).join('');
    if (hit && !S.found[hit.k]) { if (S.gaze.k === hit.k) { S.gaze.t += dt; if (S.gaze.t > 0.7) { S.found[hit.k] = 1; S.score += 40; SimAudio.fx('tick'); vib(10); } } else { S.gaze.k = hit.k; S.gaze.t = 0; } } else { S.gaze.k = null; S.gaze.t = 0; }
    var n = items.length, a = Object.keys(S.found).length; $('hsCount').textContent = f(L().found, { a: a, n: n });
    var rest = items.filter(function (x) { return !S.found[x.k]; }); if (rest.length) { var px2 = project(rest[0].p, RP); arrow(px2); } else $('hsArrow').hidden = true;
    if (n && a >= n && !S.done[S.phase]) { $('hsMarks').innerHTML = ''; donePhase(cur()); }
  }
  function ring(px, prog, on, key) {
    var R = $('hsRing'); if (px.behind || !px.on) { R.hidden = true; arrow(px); return; } $('hsArrow').hidden = true; R.hidden = false; var s = tol() * 2; R.style.width = s + 'px'; R.style.height = s + 'px'; R.style.left = px.x + 'px'; R.style.top = px.y + 'px'; R.classList.toggle('is-on', !!on); $('hsRingArc').style.strokeDashoffset = String(100 - Math.round(100 * Math.max(0, Math.min(1, prog))));
    var lb = cfg.labels && key ? plain(cfg.labels[key] || '') : ''; if (lb !== S.lastLbl) { S.lastLbl = lb; $('hsRingLbl').textContent = lb; }
  }
  function arrow(px) { var A = $('hsArrow'), r = rect(), cx = r.width / 2, cy = r.height / 2, dx = px.x - cx, dy = px.y - cy; if (px.behind) { dx = -dx; dy = -dy; } var ang = Math.atan2(dy, dx), rad = Math.min(cx, cy) - 70; A.hidden = false; A.style.left = (cx + Math.cos(ang) * rad) + 'px'; A.style.top = (cy + Math.sin(ang) * rad) + 'px'; A.style.transform = 'translate(-50%,-50%) rotate(' + (ang * 180 / Math.PI + 90) + 'deg)'; }

  /* ----- HUD ----- */
  function hud() {
    var p = cur(), l = L(); if (!p) return; var n = S.phases.length - 1, i = Math.min(S.phase + 1, n);
    var title = '', prompt = '', count = '';
    if (p.kind === 'drive') { var tx2 = stepText(p.step); title = tx2.n; prompt = tx2.p; var need = needKind(), ok = toolOk(); count = f(l.prog, { p: Math.round(100 * (S.tw - p.from) / (p.to - p.from)) }) + ' · ' + (need && need !== 'look' ? (ok ? f(l.toolNow, { t: tname(need) }) + ' ✓ · ' + (S.engaged ? l.aimOn : l.aimOff) : f(l.toolNeed, { t: tname(need) }) + ' →') : l.aimOff); }
    else if (p.kind === 'survey') { title = l.survey; prompt = f(l.surveyP, { n: (S.targets || []).length }); }
    else if (p.kind === 'wait') { title = l.wait; } else if (p.kind === 'quiz') title = l.quiz; else if (p.kind === 'dose') title = l.dose; else if (p.kind === 'prep') title = l.prep;
    $('hsPhase').textContent = l.phase + ' ' + i + ' ' + l.of + ' ' + n + (title ? ' — ' + title : ''); $('hsPrompt').textContent = prompt; if (p.kind !== 'survey') $('hsCount').textContent = count;
    $('hsScore').textContent = String(Math.round(S.score)); $('hsClock').textContent = clockText();
    var needK = needKind(), ni = needK ? S.kinds.indexOf(needK) : -1; [].forEach.call($('hsTools').children, function (b, k) { b.setAttribute('aria-pressed', k === S.tool ? 'true' : 'false'); b.classList.toggle('is-next', k === ni && ni !== S.tool); });
    var tn = S.tool >= 0 ? tname(S.kinds[S.tool]) : (ni >= 0 ? tname(S.kinds[ni]) + ' →' : ''); if (tn !== S.hudTool) { S.hudTool = tn; $('hsToolName').textContent = tn; }
    if (ni >= 0 && ni !== S.tool) { var tb = $('hsTools').children[ni]; if (tb && tb.scrollIntoView) { try { tb.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {} } }
  }
  function clockText() { var h = S.clock, d = Math.floor(h / 24) + 1, hh = Math.floor(h % 24), mm = Math.floor((h % 1) * 60); return f(L().day, { d: d }) + ' · ' + ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2); }
  function boxOpen(on) { if (on && root.classList.contains('is-narrow')) return; /* a phone keeps the two-line box; a tap opens it */ $('hsBox').classList.toggle('is-open', !!on); clearTimeout(S.boxT); if (on) S.boxT = setTimeout(function () { if (S) $('hsBox').classList.remove('is-open'); }, 7000); }
  function feed(s, cls) { var F = $('hsFeed'); F.textContent = s; F.className = 'hsim__feed' + (cls ? ' is-' + cls : '') + (s ? ' is-on' : ''); clearTimeout(feedTimer); if (s) feedTimer = setTimeout(function () { F.className = 'hsim__feed'; }, 2600); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function plain(s) { return typeof window.plain === 'function' ? window.plain(String(s)).replace(/<[^>]+>/g, '') : String(s).replace(/<[^>]+>/g, ''); }

  /* ----- cards ----- */
  function card(html) { var C = $('hsCard'); if (!html) { C.hidden = true; C.innerHTML = ''; S && (S.card = null); return; } C.innerHTML = '<div class="hsim__cardin">' + html + '</div>'; C.hidden = false; S.card = true; if (document.pointerLockElement) { try { document.exitPointerLock(); } catch (e) {} } /* a card needs the mouse */ var first = C.querySelector('button.sb-btn--primary, button'); if (first) { try { first.focus(); } catch (e) {} } }
  function brief() {
    var l = L(), t = cfg.t || {}, drives = S.phases.filter(function (p) { return p.kind === 'drive'; }), ks = S.kinds, ctrl = isTouch() ? l.ctrlT : l.ctrlD;
    var h = '<p class="hsim__kick">' + esc(l.brief) + '</p><h2>' + esc(t.title || cfg.scnName) + '</h2><p class="hsim__sub">' + esc(t.sub || '') + '</p>' +
      '<p class="hsim__meta">' + esc(f(l.briefSub, { n: drives.length, t: ('0' + Math.floor(cfg.clock0 || 8)).slice(-2) + ':00' })) + '</p>' +
      '<div class="hsim__cols"><div><p class="hsim__h4">' + esc(l.tools) + '</p><ul class="hsim__toollist">' + ks.map(function (k, i) { return '<li><svg viewBox="0 0 24 24"><path d="' + (ICON[k] || ICON.look) + '"/></svg>' + esc(tname(k)) + '<i>' + (i + 1) + '</i></li>'; }).join('') + '</ul></div>' +
      '<div><p class="hsim__h4">' + esc(l.helpT) + '</p><ol class="hsim__ctrl">' + ctrl.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol></div></div>' +
      '<div class="hsim__cardact"><button class="sb-btn sb-btn--primary sb-btn--lg" type="button" id="hsStart">' + esc(l.start) + '</button><button class="sb-btn sb-btn--secondary" type="button" id="hsBack">' + esc(l.back) + '</button></div>';
    card(h); $('hsStart').addEventListener('click', function () { SimAudio.init(); ambient(); card(null); S.t0 = performance.now(); nextPhase(); }); $('hsBack').addEventListener('click', close);
  }
  function waitCard(p) {
    var l = L(), hrs = p.hours, h = '<p class="hsim__kick">' + esc(p.cure ? l.cure : l.wait) + '</p><h2>' + esc(cfg.stageName(p.stage)) + '</h2><p>' + esc(f(l.waitP, { h: hrs })) + '</p><div class="hsim__lapse"><b id="hsLapse"></b><u id="hsLapseBar"><i></i></u></div><div class="hsim__cardact"><button class="sb-btn sb-btn--primary" type="button" id="hsSkip" disabled>' + esc(l.skip) + '</button></div>';
    card(h); var t0 = S.clock, t1 = t0 + hrs, secs = Math.max(2.5, Math.min(7, hrs * 0.35)), start = performance.now();
    S.lapse = 1; var lapseIv = setInterval(function () { if (!S || !$('hsLapseBar')) { clearInterval(lapseIv); return; } var u = Math.min(1, (performance.now() - start) / 1000 / secs); S.clock = t0 + (t1 - t0) * u; $('hsLapse').textContent = clockText(); $('hsLapseBar').firstChild.style.width = Math.round(u * 100) + '%'; $('hsClock').textContent = clockText(); if (u >= 1) { clearInterval(lapseIv); S.lapse = null; $('hsSkip').disabled = false; $('hsSkip').textContent = l.next; feed(l.waitDone, 'ok'); SimAudio.fx('tick'); } }, 80);
    setTimeout(function () { if (S && $('hsSkip')) { $('hsSkip').disabled = false; } }, 1200);
    $('hsSkip').addEventListener('click', function () { clearInterval(lapseIv); S.lapse = null; S.clock = t1; card(null); nextPhase(); });
  }
  function quizCard(p) {
    var l = L(), q = p.q, QT = q.t[LANG] || q.t.en, h = '<p class="hsim__kick">' + esc(l.quiz) + ' · ' + esc(cfg.stageName(p.stage)) + '</p><h2>' + esc(QT.q) + '</h2><div class="hsim__opts">' + QT.a.map(function (a, i) { return '<button type="button" class="hsim__opt" data-i="' + i + '">' + esc(a) + '</button>'; }).join('') + '</div><p class="hsim__why" id="hsWhy" hidden></p><div class="hsim__cardact"><button class="sb-btn sb-btn--primary" type="button" id="hsNext" hidden>' + esc(l.next) + '</button></div>';
    card(h); var done = false; [].forEach.call($('hsCard').querySelectorAll('.hsim__opt'), function (b) { b.addEventListener('click', function () { if (done) return; done = true; var i = +b.getAttribute('data-i'), ok = i === q.ok; [].forEach.call($('hsCard').querySelectorAll('.hsim__opt'), function (x, k) { x.classList.toggle('is-ok', k === q.ok); x.classList.toggle('is-bad', k === i && !ok); x.disabled = true; }); if (ok) { S.score += 120; SimAudio.fx('ok'); } else { S.score -= 40; S.notes.quiz++; SimAudio.fx('bad'); } var W = $('hsWhy'); W.hidden = false; W.textContent = (ok ? l.quizOk : l.quizBad) + ' ' + (QT.why || ''); $('hsNext').hidden = false; $('hsNext').focus(); }); });
    $('hsNext').addEventListener('click', function () { card(null); nextPhase(); });
  }
  function doseCard(p) {
    var l = L(), d = p.d, DT = d.t[LANG] || d.t.en, v0 = d.min + (d.max - d.min) * 0.5, h = '<p class="hsim__kick">' + esc(l.dose) + ' · ' + esc(cfg.stageName(p.stage)) + '</p><h2>' + esc(DT.q) + '</h2><p>' + esc(DT.hint || '') + '</p><div class="hsim__dose"><input type="range" id="hsDose" min="' + d.min + '" max="' + d.max + '" step="' + (d.step || 1) + '" value="' + v0 + '"><output id="hsDoseV"></output></div><p class="hsim__why" id="hsWhy" hidden></p><div class="hsim__cardact"><button class="sb-btn sb-btn--primary" type="button" id="hsSet">' + esc(l.ok) + '</button><button class="sb-btn sb-btn--primary" type="button" id="hsNext" hidden>' + esc(l.next) + '</button></div>';
    card(h); var inp = $('hsDose'), out = $('hsDoseV'); function show() { out.textContent = inp.value + ' ' + (d.unit || ''); } show(); inp.addEventListener('input', show);
    $('hsSet').addEventListener('click', function () { var v = +inp.value, ok = v >= d.ok[0] && v <= d.ok[1]; if (ok) { S.score += 100; SimAudio.fx('ok'); } else { S.score -= 30; S.notes.quiz++; SimAudio.fx('bad'); } var W = $('hsWhy'); W.hidden = false; W.textContent = (ok ? l.doseOk : l.doseBad) + ' ' + (DT.why || ''); inp.disabled = true; $('hsSet').hidden = true; $('hsNext').hidden = false; $('hsNext').focus(); });
    $('hsNext').addEventListener('click', function () { card(null); nextPhase(); });
  }
  function prepCard(p) {
    var l = L(), pr = p.prep, PT = pr.t[LANG] || pr.t.en, secs = pr.secs || 3, h = '<p class="hsim__kick">' + esc(l.prep) + ' · ' + esc(cfg.stageName(p.stage)) + '</p><h2>' + esc(PT.title) + '</h2><p>' + esc(PT.text || '') + '</p><div class="hsim__holdbar"><u id="hsHoldBar"><i></i></u></div><div class="hsim__cardact"><button class="sb-btn sb-btn--primary sb-btn--lg" type="button" id="hsHold">' + esc(PT.btn || l.prepHold) + '</button></div>';
    card(h); var held = false, acc = 0, lastN = 0, done = false, b = $('hsHold'); b.addEventListener('pointerdown', function (e) { e.preventDefault(); held = true; lastN = performance.now(); SimAudio.tool(pr.snd || 'mixer'); try { b.setPointerCapture(e.pointerId); } catch (er) {} }); ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { b.addEventListener(n, function () { held = false; SimAudio.tool(null); }); });
    var iv = setInterval(function () { if (!S || !$('hsHoldBar')) { clearInterval(iv); return; } if (held && !done) { var n = performance.now(); acc += (n - lastN) / 1000; lastN = n; } $('hsHoldBar').firstChild.style.width = Math.round(Math.min(1, acc / secs) * 100) + '%'; if (acc >= secs && !done) { done = true; clearInterval(iv); SimAudio.tool(null); S.score += 60; SimAudio.fx(pr.kind === 'cartridge' ? 'cartridge' : 'ok'); setTimeout(function () { if (S) { card(null); nextPhase(); } }, 500); } }, 60);
  }
  function results() {
    var l = L(), secs = (performance.now() - S.t0) / 1000, mins = Math.floor(secs / 60), days = Math.floor(S.clock / 24) + 1, sc = Math.round(S.score), max = S.phases.filter(function (p) { return p.kind === 'drive'; }).reduce(function (a, p) { return a + 12 * p.secs; }, 0) + 120 * (cfg.quiz || []).length + 100 * (cfg.dose || []).length + 60 * (cfg.prep || []).length + 40 * (S.targets ? S.targets.length : 0);
    var r = sc / Math.max(1, max), rank = r > 0.85 ? 2 : r > 0.55 ? 1 : 0, notes = [];
    if (S.notes.quiz) notes.push(f(l.quizMiss, { n: S.notes.quiz })); if (S.notes.tool) notes.push(f(l.toolMiss, { n: S.notes.tool })); if (S.off > 3) notes.push(f(l.offMiss, { s: Math.round(S.off) })); if (S.notes.assist) notes.push(f(l.assistN, { n: S.notes.assist }));
    var cons = (cfg.mats || []).map(function (m) { return '<tr><th>' + esc(m.name) + '</th><td>' + esc(m.rate) + '</td></tr>'; }).join('');
    var h = '<p class="hsim__kick">' + esc(l.rank) + ' — ' + esc(l.ranks[rank]) + '</p><h2>' + esc(l.res) + '</h2><div class="hsim__kpis"><div><b>' + sc + '</b><span>' + esc(l.resScore) + '</span></div><div><b>' + mins + ':' + ('0' + Math.floor(secs % 60)).slice(-2) + '</b><span>' + esc(l.resTime) + '</span></div><div><b>' + days + '</b><span>' + esc(l.resDays) + '</span></div></div>' +
      '<p class="hsim__h4">' + esc(l.notes) + '</p>' + (notes.length ? '<ul class="hsim__notes">' + notes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p>' + esc(l.noNotes) + '</p>') +
      (cons ? '<p class="hsim__h4">' + esc(l.cons) + '</p><table class="hsim__cons">' + cons + '</table>' : '') +
      '<div class="hsim__cardact"><button class="sb-btn sb-btn--primary sb-btn--lg" type="button" id="hsAgain">' + esc(l.again) + '</button><button class="sb-btn sb-btn--secondary" type="button" id="hsBack">' + esc(l.back) + '</button></div>';
    card(h); SimAudio.fx('done'); SimAudio.tool(null); $('hsAgain').addEventListener('click', function () { var M = cfg.module; close(); open(cfg.cat, M); }); $('hsBack').addEventListener('click', close);
    try { if (window.ISLE) { ISLE.onSimDone(cfg.cat, rank, sc); if (ISLE.cameFrom() === cfg.cat) { var bi = document.createElement('button'); bi.type = 'button'; bi.className = 'sb-btn sb-btn--secondary'; bi.textContent = ISLE.t('backIsle'); bi.addEventListener('click', function () { close(); ISLE.open({ back: true }); }); $('hsCard').querySelector('.hsim__cardact').appendChild(bi); } } } catch (e) {}
  }
  function help(on) { helpOpen = !!on; var H = $('hsHelp2'); if (!on) { H.hidden = true; return; } var l = L(), ctrl = isTouch() ? l.ctrlT : l.ctrlD; H.innerHTML = '<div class="hsim__cardin"><h2>' + esc(l.helpT) + '</h2><ol class="hsim__ctrl">' + ctrl.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol><div class="hsim__cardact"><button class="sb-btn sb-btn--primary" type="button" id="hsHelpOk">' + esc(l.ok) + '</button></div></div>'; H.hidden = false; $('hsHelpOk').addEventListener('click', function () { help(false); }); }
  /* the gate on the page: title, text and figures of the exercise, the button that opens it */
  function gate(cat, M) {
    var tt = document.getElementById(cat + 'HsTitle'); if (!tt) return; var c; try { c = M._sim(); } catch (e) { c = null; } if (!c) return;
    var works = c.steps.filter(function (s) { return s.p != null; }).length, dec = (c.quiz || []).length + (c.dose || []).length, cure = c.cure || 0;
    tt.innerHTML = esc(c.t.title); document.getElementById(cat + 'HsDesc').textContent = c.t.sub || '';
    document.getElementById(cat + 'HsMeta').innerHTML = [[works, tr('hs.m0')], [dec, tr('hs.m1')], [cure, tr('hs.m2')]].map(function (x) { return '<div><b>' + x[0] + '</b><span>' + esc(x[1]) + '</span></div>'; }).join('');
    var b = document.getElementById(cat + 'HsOpen'); if (b && !b.__hs) { b.__hs = true; b.addEventListener('click', function () { open(cat, M, b); }); }
  }
  return { open: open, close: close, gate: gate, T: T, TOOLS: TOOLS, kindOf: kindOf, tname: tname, state: function () { return S; }, view: function () { return view; }, jump: function (i) { if (S) { S.phase = i - 1; nextPhase(); } }, relabel: function () { if (built && !root.hidden) { labels(); tools(); hud(); } } };
})();


