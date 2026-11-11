/* ===== [island_al.js] ===== */
  /* ================= (v62) the quality, measured =================
     When the 3D starts, the device is probed: its graphics chip (the renderer's own name), WebGL 2, its multisampling, its memory and cores, its
     screen, and a short timed run of a fixed shader (a few dozen milliseconds, its result kept for the chip). From these a level is recommended —
     the highest that should hold an average of 30 frames a second — and "Auto" uses it. While playing, the real frame rate (the time between
     frames, not the script's own time) is watched: below the target the resolution steps down first, then the costliest effects are set aside one
     by one (bloom, the light rays, the reflections, the shadows' size, the anti-aliasing), and if even that is not enough a lower level is offered;
     with frames to spare the resolution comes back. The frame rates measured for each level are kept, so the card can say what each would give.
     Each setting can also be chosen by hand (applied at once): the render resolution, the dynamic resolution, the target of 30 or 60, the
     shadows, the anti-aliasing, the bloom, the rays and the lens's flare, the depth of field, the reflections of the floors and the bay.
     The level itself (the detail of the models, the people, the plants) still applies after a reload. ================= */
  var QQ = {
    zh: { rec: '建議畫質', recS: '依此裝置的顯示晶片與實測效能，維持平均 {f} fps 以上', recM: '依實測推估', gpu: '顯示晶片', cores: '{n} 核心', mem: '{n} GB', score: '效能分數 {n}', now: '目前 {n} fps · 解析度 {r}%', est: '約 {n} fps', meas: '實測 {n} fps', badge: '建議', warn: '「{c}」在此裝置預估低於 {f} fps，畫面會自動降低解析度；建議改用「{q}」。', det: '細項設定', detS: '即時套用 · 「自動」跟隨所選畫質', reset: '恢復預設', resetD: '細項已恢復預設', fpsT2: '目標幀率', fpsS2: '動態解析度維持的最低平均幀率', dyn: '動態解析度', dynS: '幀率不足時先降解析度，再依序關閉耗能特效', scale: '渲染解析度', scaleS: '相對螢幕原生解析度（動態解析度開啟時為上限）', shadow: '陰影', aa: '抗鋸齒', bloom: '泛光', rays: '光束與鏡頭光暈', dof: '景深（移軸）', refl: '地面與海面反射', reflS: '需「高」以上畫質', ssr: '螢幕空間反射', ssrS: '濕地面、地板與車身映出燈光與列車（目前用於御徒町）', ao: '環境光遮蔽', aoS: '牆角與物件接地處的柔和陰影（目前用於御徒町）', postN: '「低」畫質不使用後製，此項無效', auto: '自動', off: '關', on: '開', lo: '低', mid2: '中', hi: '高', vhi: '最高', shed: '為維持 {f} fps，已自動調低：{l}', shedL: { ssr: '螢幕反射', ao: '光遮蔽', bloom: '泛光', rays: '光束', refl: '反射', dof: '景深', shadow: '陰影', shrate: '陰影更新率', shoff: '陰影', aa: '抗鋸齒', res: '解析度' }, slow: '目前約 {n} fps，低於 {f} fps。建議改用「{q}」畫質', tryQ: '改用「{q}」', later: '稍後', native: '原生', shedNow: '自動調低中：{l}', autoUse: '採用「{q}」', curV: '目前：{v}', note: '畫質等級（低／中／高／超高）變更後重新載入即套用；細項設定立即生效。', none: '—' },
    en: { rec: 'Recommended', recS: 'From this device’s graphics chip and measured performance, to hold an average of {f} fps or more', recM: 'from measured play', gpu: 'Graphics', cores: '{n} cores', mem: '{n} GB', score: 'score {n}', now: 'Now {n} fps · resolution {r}%', est: '≈ {n} fps', meas: 'measured {n} fps', badge: 'Recommended', warn: '“{c}” is expected to run below {f} fps here; the resolution will drop to keep up. “{q}” is recommended.', det: 'Settings in detail', detS: 'Applied at once · “Auto” follows the level', reset: 'Reset', resetD: 'Settings reset', fpsT2: 'Target frame rate', fpsS2: 'The average the dynamic resolution holds', dyn: 'Dynamic resolution', dynS: 'When frames fall short: resolution first, then the costliest effects', scale: 'Render resolution', scaleS: 'Of the screen’s native resolution (the ceiling when dynamic)', shadow: 'Shadows', aa: 'Anti-aliasing', bloom: 'Bloom', rays: 'Light rays and lens flare', dof: 'Depth of field (tilt)', refl: 'Floor and sea reflections', reflS: 'Needs High or above', ssr: 'Screen-space reflections', ssrS: 'Lamps and trains mirrored in wet ground, floors and car bodies (at Okachimachi for now)', ao: 'Ambient occlusion', aoS: 'The soft dark of corners and of things standing on the ground (at Okachimachi for now)', postN: 'No post effects at Low; no effect', auto: 'Auto', off: 'Off', on: 'On', lo: 'Low', mid2: 'Med', hi: 'High', vhi: 'Max', shed: 'To hold {f} fps, lowered: {l}', shedL: { ssr: 'screen reflections', ao: 'occlusion', bloom: 'bloom', rays: 'rays', refl: 'reflections', dof: 'depth of field', shadow: 'shadows', shrate: 'shadow update rate', shoff: 'shadows', aa: 'anti-aliasing', res: 'resolution' }, slow: 'About {n} fps, below {f}. “{q}” is recommended', tryQ: 'Use “{q}”', later: 'Later', native: 'Native', shedNow: 'Lowered for now: {l}', autoUse: 'using “{q}”', curV: 'now: {v}', note: 'A level (Low/Medium/High/Ultra) applies after a reload; the settings in detail apply at once.', none: '—' },
    ja: { rec: '推奨画質', recS: 'この端末のGPUと実測性能から、平均 {f} fps 以上を保てる画質', recM: '実測から推定', gpu: 'GPU', cores: '{n} コア', mem: '{n} GB', score: '性能スコア {n}', now: '現在 {n} fps · 解像度 {r}%', est: '約 {n} fps', meas: '実測 {n} fps', badge: '推奨', warn: '「{c}」はこの端末で {f} fps を下回る見込みです（解像度が自動で下がります）。「{q}」を推奨します。', det: '詳細設定', detS: 'すぐに反映 · 「自動」は選んだ画質に従う', reset: '初期設定に戻す', resetD: '詳細設定を初期化しました', fpsT2: '目標フレームレート', fpsS2: '動的解像度が保つ平均', dyn: '動的解像度', dynS: '不足時はまず解像度、次に負荷の高い効果を順に', scale: 'レンダリング解像度', scaleS: '画面のネイティブ解像度に対して（動的時は上限）', shadow: '影', aa: 'アンチエイリアス', bloom: 'ブルーム', rays: '光芒とレンズフレア', dof: '被写界深度（ティルト）', refl: '床と海の反射', reflS: '「高」以上で有効', ssr: 'スクリーンスペース反射', ssrS: '濡れた路面・床・車体に灯りや電車が映ります（現在は御徒町のみ）', ao: 'アンビエントオクルージョン', aoS: '壁の隅や物の接地部の柔らかい影（現在は御徒町のみ）', postN: '「低」は後処理なし（無効）', auto: '自動', off: 'オフ', on: 'オン', lo: '低', mid2: '中', hi: '高', vhi: '最高', shed: '{f} fps を保つため自動で下げました：{l}', shedL: { ssr: '画面反射', ao: 'AO', bloom: 'ブルーム', rays: '光芒', refl: '反射', dof: '被写界深度', shadow: '影', shrate: '影の更新頻度', shoff: '影', aa: 'AA', res: '解像度' }, slow: '約 {n} fps（目標 {f}）。「{q}」を推奨します', tryQ: '「{q}」にする', later: 'あとで', native: 'ネイティブ', shedNow: '一時的に低下：{l}', autoUse: '「{q}」を使用', curV: '現在：{v}', note: '画質レベル（低／中／高／最高）は再読み込み後に反映、詳細設定はすぐに反映されます。', none: '—' } };
  function qq(k) { var L2 = QQ[LANG] || QQ.zh; return L2[k] != null ? L2[k] : QQ.zh[k]; }
  var QORD = ['low', 'mid', 'high', 'ultra'];
  /* what each level costs, relative (the work per frame on the same screen: resolution², shadows, the post pass, the models) */
  var QCOST = { low: 1, mid: 2.3, high: 4.4, ultra: 8.5 };
  /* each level's own settings (what "Auto" means) */
  function qPreset(tier, ultra) { var k = ultra ? 'ultra' : tier, dev = window.devicePixelRatio || 1;
    return { low: { cap: Math.min(dev, 1.0), shadow: 1024, aa: 0, bloom: false, rays: false, dof: false, refl: false, ao: false, ssr: false },
      mid: { cap: Math.min(dev, 1.5), shadow: 1536, aa: 2, bloom: true, rays: true, dof: true, refl: false, ao: true, ssr: true },
      high: { cap: Math.min(dev, 1.75), shadow: 2048, aa: 4, bloom: true, rays: true, dof: true, refl: true, ao: true, ssr: true },
      ultra: { cap: Math.min(dev, 2.5), shadow: 4096, aa: COARSE ? 4 : 8, bloom: true, rays: true, dof: true, refl: true, ao: true, ssr: true } }[k] || null; }

  /* ---------- the probe ---------- */
  var HWK = 'ac-guide-hw', HW = null;
  function hwBench(R) { try { if (!R.capabilities.isWebGL2) return 0; var rt = new THREE.WebGLRenderTarget(256, 256, { depthBuffer: false }), m = new THREE.ShaderMaterial({ uniforms: { uS: { value: 0 } }, depthTest: false, depthWrite: false,
        vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: 'precision highp float; uniform float uS; void main(){ vec2 p = gl_FragCoord.xy * 0.013 + uS; float a = 0.0; for (int i = 0; i < 64; i++) { p = vec2(p.x * 1.7 - p.y * 0.9, p.x * 0.8 + p.y * 1.3); p = fract(p + vec2(0.37, 0.61)); a += sin(p.x * 6.2831) * cos(p.y * 6.2831); } gl_FragColor = vec4(fract(a), 0.0, 0.0, 1.0); }' });
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); var q = new THREE.Mesh(g, m); q.frustumCulled = false; var sc = new THREE.Scene(); sc.add(q); var cm = new THREE.Camera(), px = new Uint8Array(4), prev = R.getRenderTarget(), ac = R.autoClear;
      function run(n) { R.setRenderTarget(rt); for (var i = 0; i < n; i++) { m.uniforms.uS.value = i * 0.01; R.render(sc, cm); } R.readRenderTargetPixels(rt, 0, 0, 1, 1, px); }
      run(1); var n = 2, ms = 0, t0, k; for (k = 0; k < 9; k++) { t0 = performance.now(); run(n); ms = performance.now() - t0; if (ms > 10 || n >= 512) break; n *= 2; }
      var best = ms; for (k = 0; k < 2; k++) { t0 = performance.now(); run(n); best = Math.min(best, performance.now() - t0); }
      R.setRenderTarget(prev); R.autoClear = ac; rt.dispose(); m.dispose(); g.dispose(); return 256 * 256 * 64 * n / Math.max(0.05, best) / 1e6; } catch (e) { return 0; } }
  /* the level for the chip: the families first (what they are known to manage), then the timed run (which can only lower or raise it one step) */
  function hwRec(H) { var g = H.raw || H.gpu || '', s = H.score || 0, mob = H.coarse, lv;
    if (!H.gl2 || /SwiftShader|llvmpipe|Software|Basic Render/i.test(g)) return 'low';
    if (/RTX|RX ?[6-9]\d{3}|Radeon Pro W|Arc A[57]|Apple M\d (Pro|Max|Ultra)/i.test(g)) lv = 'ultra';
    else if (/GeForce|Quadro|Radeon (RX|Pro)|Arc|Apple M\d/i.test(g)) lv = 'high';
    else if (/Adreno.*(8\d\d|7[3-9]\d)|Immortalis|Mali-G7[1-9]\d|Xclipse 9|Apple GPU|Apple A1[7-9]/i.test(g)) lv = mob ? 'mid' : 'high';
    else if (/Iris|UHD|Radeon|Vega|Adreno.*(6\d\d|7[0-2]\d)|Mali-G(5[7-9]|6\d|7[0-8])|Xclipse|PowerVR (Series|IMG B|IMG C|IMG D)/i.test(g)) lv = 'mid';
    else if (/Intel|HD Graphics/i.test(g)) lv = 'mid';
    else if (/Mali|Adreno|PowerVR|Tegra|Vivante|VideoCore/i.test(g)) lv = 'low';
    else lv = mob ? 'mid' : 'high';
    /* the timed run (millions of shader steps a millisecond): a weak result lowers the level, a strong one lifts it a step (never to Ultra on a phone) */
    if (s > 0) { var i = QORD.indexOf(lv), want = s >= (mob ? 400 : 260) ? 3 : s >= (mob ? 170 : 80) ? 2 : s >= (mob ? 22 : 16) ? 1 : 0; if (want < i) i = Math.max(want, i - 2); else if (want > i) i = Math.min(want, i + 1); lv = QORD[i]; }
    if (H.mem && H.mem <= 2) lv = 'low'; else if (H.mem && H.mem <= 4 && QORD.indexOf(lv) > 1) lv = 'mid';
    if (mob && lv === 'ultra') lv = 'high';
    /* what was measured in play outranks the guess: the highest level expected to hold the target with a margin */
    var M = qmGet(), best = null; QORD.forEach(function (k2) { var e = qEstFps(k2); if (e != null && e >= QS.fps * 1.1) best = k2; }); if (best && Object.keys(M).length) lv = best;
    return lv; }
  function hwProbe(R) { var H = { gpu: '', gl2: !!R.capabilities.isWebGL2, samples: 0, tex: 0, mem: navigator.deviceMemory || 0, cores: navigator.hardwareConcurrency || 0, coarse: !!COARSE, scr: [screen.width, screen.height, window.devicePixelRatio || 1], score: 0 };
    try { var gl = R.getContext(), x = gl.getExtension('WEBGL_debug_renderer_info'); H.raw = String(x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || ''); H.samples = H.gl2 ? gl.getParameter(gl.MAX_SAMPLES) || 0 : 0; H.tex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0; } catch (e) { H.raw = ''; }
    /* the name as shown (ANGLE's "vendor, device (id) API…" cut to the device); the whole string is what is matched */ var m = H.raw.match(/^ANGLE \((.*)\)$/), nm = m ? (m[1].split(', ')[1] || m[1].split(', ')[0]) : H.raw;
    if (/SwiftShader/i.test(H.raw)) nm = 'SwiftShader (software)'; nm = nm.replace(/^ANGLE Metal Renderer: /, '');
    H.gpu = nm.replace(/ \(0x[0-9A-F]+\)/ig, '').replace(/ (Direct3D|vs_\d|OpenGL|Vulkan|Metal).*$/i, '').replace(/ \((Subzero|TM)\)/g, function (a) { return a.indexOf('TM') >= 0 ? ' (TM)' : ''; }).trim() || H.raw;
    var old = null; try { old = JSON.parse(localStorage.getItem(HWK) || 'null'); } catch (e) {}
    if (old && old.gpu === H.raw && old.v === 2 && Date.now() - (old.t || 0) < 30 * 864e5) H.score = old.score; else if (!window.ISLE_TEST) { H.score = Math.round(hwBench(R)); try { localStorage.setItem(HWK, JSON.stringify({ gpu: H.raw, score: H.score, t: Date.now(), v: 2 })); } catch (e) {} }
    H.rec = hwRec(H); return H; }
  var _tierOfQ = tierOf; tierOf = function (R) { try { HW = hwProbe(R); } catch (e) { HW = null; } if (window.ISLE_TIER) return window.ISLE_TIER; var rec = HW && HW.rec; if (rec === 'ultra') { window.ISLE_ULTRA = true; return 'high'; } return rec || _tierOfQ(R); };

  /* ---------- the settings ---------- */
  var QSK = 'ac-guide-qs', QMK = 'ac-guide-qm', QS = { fps: 30, dyn: true, scale: 'auto', shadow: 'auto', aa: 'auto', bloom: 'auto', rays: 'auto', dof: 'auto', refl: 'auto', ao: 'auto', ssr: 'auto' };
  (function () { try { var s = JSON.parse(localStorage.getItem(QSK) || 'null'); if (s) Object.keys(QS).forEach(function (k) { if (s[k] != null) QS[k] = s[k]; }); } catch (e) {} })();
  function qsSave() { try { localStorage.setItem(QSK, JSON.stringify(QS)); } catch (e) {} }
  function qmGet() { try { return JSON.parse(localStorage.getItem(QMK) || '{}') || {}; } catch (e) { return {}; } }
  function qLevel() { return typeof TIER === 'string' ? (perf.ultra ? 'ultra' : TIER) : null; }
  /* the frame rate each level would give: measured, or scaled from another level's measure by their costs */
  function qEstFps(k) { var M = qmGet(); if (M[k] && M[k].fps) return M[k].fps * (M[k].k ? Math.pow(M[k].k, 1.6) : 1); var ref = null; QORD.forEach(function (k2) { if (M[k2] && M[k2].fps && !ref) ref = k2; }); if (!ref) return null; var base = M[ref].fps * (M[ref].k ? Math.pow(M[ref].k, 1.6) : 1); return Math.min(120, base * QCOST[ref] / QCOST[k]); }
  /* the dynamic part: the resolution's factor, and the effects set aside */
  var GV = { last: 0, acc: 0, n: 0, fps: 0, slow: 0, fast: 0, cool: 3, k: 1, shed: [], ops: [], told: false, offer: false, hist: [], play: 0, iv: [], pa: 0, cpu: 0, busy: 0, bo: 6, tDown: -1e9, tUp: -1e9, tDecay: 0, sf: 0, shRate: 1, low: 0 };
  var KMIN = 0.55, KSOFT = 0.85;
  /* (v65) at High and Ultra the floor of the target is held with a margin, and the resolution may go further down */
  function qHiLv() { var lv = qLevel(); return lv === 'high' || lv === 'ultra'; }
  function qKmin() { return qHiLv() ? 0.45 : KMIN; }
  function qEff() { var P = qPreset(TIER, perf.ultra) || qPreset('mid'), sh = GV.shed, e = {};
    e.cap = QS.scale === 'auto' ? P.cap : Math.max(0.5, Math.min(3, (window.devicePixelRatio || 1) * QS.scale));
    e.shadow = QS.shadow === 'auto' ? P.shadow : +QS.shadow; e.aa = QS.aa === 'auto' ? P.aa : +QS.aa; ['bloom', 'rays', 'dof', 'refl', 'ao', 'ssr'].forEach(function (k) { e[k] = QS[k] === 'auto' ? !!P[k] : QS[k] === 'on'; });
    if (TIER !== 'high') e.refl = false; if (!POST) { e.aa = 0; e.bloom = e.rays = e.dof = false; } /* (v85) the two effects that read the depth need the post chain and its depth texture */ if (!POST || !POST.fx || !POST.fx.ok) e.ao = e.ssr = false;
    sh.forEach(function (s) { if (s === 'bloom') e.bloom = false; else if (s === 'rays') e.rays = false; else if (s === 'ssr') e.ssr = false; else if (s === 'ao') e.ao = false; else if (s === 'refl') e.refl = false; else if (s === 'dof') e.dof = false; else if (s === 'shadow') e.shadow = e.shadow > 1024 ? e.shadow / 2 : e.shadow; else if (s === 'shoff') e.shadow = 0; else if (s === 'aa') e.aa = e.aa > 2 ? e.aa / 2 : 0; });
    e.shRate = 1 + sh.filter(function (s) { return s === 'shrate'; }).length;
    if (HW && HW.samples) e.aa = Math.min(e.aa, HW.samples); return e; }
  var QA = { dpr: 0, shadow: -1, aa: -1, bloom: null, rays: null, dof: null, refl: null, ao: null, ssr: null };
  function qApply(force) { if (!R3 || !W) return; var e = qEff(), d = Math.max(0.5, e.cap * (QS.dyn ? GV.k : 1));
    if (window.FAST3D) d = perf.dpr; /* the tests draw small */
    if (force || Math.abs(QA.dpr - d) > 0.01) { QA.dpr = d; perf.dpr = d; perf.max = e.cap; perf.min = e.cap * KMIN; if (Math.abs(R3.getPixelRatio() - d) > 0.01) { R3.setPixelRatio(d); resize(); } }
    if (force || QA.shadow !== e.shadow) { var was = QA.shadow; QA.shadow = e.shadow; var on = e.shadow > 0; if (R3.shadowMap.enabled !== on) { R3.shadowMap.enabled = on; scene.traverse(function (o) { if (o.material) [].concat(o.material).forEach(function (m) { m.needsUpdate = true; }); }); }
      if (on && W.sun && W.sun.shadow && W.sun.shadow.mapSize.x !== e.shadow) { W.sun.shadow.mapSize.set(e.shadow, e.shadow); if (W.sun.shadow.map) { W.sun.shadow.map.dispose(); W.sun.shadow.map = null; } } }
    if (POST && (force || QA.aa !== e.aa)) { QA.aa = e.aa; var tg = POST.target; if (tg && R3.capabilities.isWebGL2 && tg.samples !== e.aa) { tg.samples = e.aa; tg.dispose(); } }
    if (POST && (force || QA.bloom !== e.bloom)) { QA.bloom = e.bloom; W.Q.bloom = e.bloom ? (TIER === 'high' ? 1 : 0.8) : 0; if (!e.bloom) POST.final.uniforms.uBloom.value = 0; }
    if (POST && (force || QA.rays !== e.rays)) { QA.rays = e.rays; if (e.rays) { POST.rayK = TIER === 'low' ? 0 : 1; W.flareK = TIER === 'high' ? 1 : 0; } }
    if (POST && (force || QA.dof !== e.dof)) { QA.dof = e.dof; if (e.dof && !(typeof CN !== 'undefined' && CN.on)) POST.final.uniforms.uTilt.value = TIER === 'high' ? 0.55 : 0.35; }
    QA.refl = e.refl; QA.ao = e.ao; QA.ssr = e.ssr; GV.shRate = e.shRate || 1; }
  /* every frame: what the places and the film set again on their own is held to the settings */
  function qHold() { var e = QA;
    /* (v65) the shadows drawn every second or third frame (no shader is rebuilt; what stands still keeps its shadow exactly) */ if (R3 && R3.shadowMap) { var rt = GV.shRate || 1; R3.shadowMap.autoUpdate = rt <= 1; if (rt > 1 && ++GV.sf >= rt) { GV.sf = 0; R3.shadowMap.needsUpdate = true; } }
    if (!POST) return; if (e.rays === false) { POST.rayK = 0; W.flareK = 0; } if (e.dof === false) POST.final.uniforms.uTilt.value = 0; if (e.bloom === false) { W.Q.bloom = 0; POST.final.uniforms.uBloom.value = 0; } if (e.refl === false && typeof RFX !== 'undefined') RFX.off = true; }
  /* the governor: the real frame rate over each half second (a frame of two seconds or more — a tab in the background — does not count;
     the longest tenth of a window's frames is left out, so a single hitch — a place being built — is not taken for the device's pace).
     (v65) It also reads how much of each frame the script itself takes: a device held up by its processor (many things drawn) is helped by
     drawing less (the reflections, the shadows every other frame), one held up by its graphics by fewer pixels. Below the floor it acts at once
     and by as much as the shortfall asks; what it lowered comes back one step at a time, in the reverse order, only with frames to spare and
     never soon after a step that had to be taken back (the wait doubles each time, so it does not see-saw). */
  function qNext(e, cpuB, kmin) { var gpu = ['k1', 'ssr', 'bloom', 'rays', 'refl', 'ao', 'dof', 'aa', 'shadow', 'aa', 'shadow', 'aa', 'k2', 'shrate', 'shrate', 'shoff'],
      cpu = ['refl', 'shrate', 'shadow', 'shadow', 'ssr', 'bloom', 'rays', 'ao', 'dof', 'shrate', 'aa', 'aa', 'aa', 'k1', 'k2', 'shoff'], L = cpuB ? cpu : gpu, i;
    for (i = 0; i < L.length; i++) { var s = L[i]; if (s === 'k1' && GV.k > KSOFT + 1e-3) return s; if (s === 'k2' && GV.k > kmin + 1e-3) return s; if ((s === 'bloom' || s === 'rays' || s === 'refl' || s === 'dof' || s === 'ao' || s === 'ssr') && e[s]) return s;
      if (s === 'aa' && e.aa > 0) return s; if (s === 'shadow' && e.shadow > 1024) return s; if (s === 'shrate' && e.shadow > 0 && e.shRate < 3) return s; if (s === 'shoff' && e.shadow > 0) return s; } return null; }
  function qOpsFix() { var c = {}; GV.shed.forEach(function (s) { c[s] = (c[s] || 0) + 1; }); GV.ops = GV.ops.filter(function (o) { if (o.a === 'k') return true; if (c[o.a] > 0) { c[o.a]--; return true; } return false; }); }
  function qGov() { var now = performance.now(); if (GV.last) { var d = now - GV.last; if (d < 2000) { GV.acc += d; GV.n++; GV.iv.push(d); } } GV.last = now; perf.n = 0; /* the old governor (the script's own time) sleeps */
    /* (a frame of two seconds or more is a tab in the background, not counted; a window holds at least three frames, so a very slow device is still read) */ if (GV.acc < 500 || (GV.n < 3 && GV.acc < 6000)) return; var iv = GV.iv.slice().sort(function (a, b) { return a - b; }), cut = Math.max(1, Math.floor(iv.length * 0.9)), sum = 0, i; for (i = 0; i < cut; i++) sum += iv[i];
    /* a window of hitches (a place, a shader, a texture being made: a few long frames among quick ones) is noted, not acted on */ var md = iv[iv.length >> 1] || 16, nLong = 0; for (i = 0; i < iv.length; i++) if (iv[i] > md * 2.2) nLong++; var hitchy = iv.length > 4 && iv[iv.length - 1] > md * 4 && nLong < iv.length * 0.25;
    var fps = 1000 * cut / sum, fpsM = 1000 * GV.n / GV.acc; GV.cpu = GV.pa ? (perf.acc - GV.pa) / GV.n : 0; GV.pa = perf.acc; GV.busy = GV.cpu * GV.n / GV.acc; if (window.ISLE_QBUSY != null) GV.busy = window.ISLE_QBUSY;
    GV.acc = 0; GV.n = 0; GV.iv.length = 0; GV.fps = fpsM; GV.hist.push(fpsM); if (GV.hist.length > 20) GV.hist.shift();
    if (mode === 'walk' && !travel && !cardOn) { GV.play++; if (GV.play % 20 === 0 && GV.hist.length >= 16) qmRecord(); }
    if (window.NO_GOV || window.FAST3D || !QS.dyn) return; if (GV.cool > 0) { GV.cool--; return; } if (hitchy) return;
    var tgt = QS.fps, hi = qHiLv(), kmin = qKmin(), e = qEff(), t = now / 1000, cpuB = GV.busy > 0.72;
    var lo = tgt >= 55 ? tgt * 0.93 : tgt * (hi ? 1.1 : 1.0), crit = tgt * (tgt >= 55 ? 0.85 : 0.95);
    if (fps < lo) { GV.fast = 0; GV.slow++; var urgent = fps < crit; if (!urgent && GV.slow < 2) return;
      var steps = urgent ? (fps < crit * 0.75 ? 3 : 2) : 1, did = false;
      while (steps-- > 0) { var nx = qNext(e, cpuB, kmin); if (!nx) break; did = true;
        if (nx === 'k1' || nx === 'k2') { var k0 = GV.k, f2 = Math.min(0.95, Math.max(0.75, Math.sqrt(fps / (lo * 1.12)))); GV.k = Math.max(nx === 'k1' ? KSOFT : kmin, Math.min(GV.k - 0.03, GV.k * f2)); GV.ops.push({ a: 'k', from: k0 }); break; }
        GV.shed.push(nx); GV.ops.push({ a: nx }); e = qEff(); }
      if (did) { if (t - GV.tUp < 12) GV.bo = Math.min(120, GV.bo * 2); GV.tDown = t; GV.slow = 0; GV.low = 0; qApply(); GV.cool = 1; if (GV.shed.length) qShedTell(); return; }
      if (urgent && ++GV.low >= 4) { GV.low = 0; qOffer(fps); } return; }
    GV.slow = 0; GV.low = 0; if (t - GV.tDown > 60 && t - GV.tDecay > 60) { GV.tDecay = t; GV.bo = Math.max(6, GV.bo / 2); }
    if (t - GV.tDown < GV.bo || !GV.ops.length) { GV.fast = 0; return; }
    var up = tgt >= 55 ? fps >= 58.5 : fps > tgt * (hi ? 1.45 : 1.3); if (!up) { GV.fast = 0; return; } if (++GV.fast < (tgt >= 55 ? 5 : 3)) return; GV.fast = 0;
    /* the last step taken comes back: the resolution a little at a time (if the pixels it adds should still leave the margin), an effect only with plenty to spare */
    var op = GV.ops[GV.ops.length - 1];
    if (op.a === 'k') { var k1 = Math.min(op.from, GV.k * 1.08, GV.k + 0.08); if (fps * Math.pow(GV.k / k1, 2) < lo * 1.15 && !(GV.busy > 0.72)) return; GV.k = k1; if (GV.k >= op.from - 1e-3) { GV.k = op.from; GV.ops.pop(); } qApply(); GV.cool = 2; GV.tUp = t; return; }
    if (fps < tgt * (op.a === 'shoff' ? 2.0 : hi ? 1.7 : 1.6) && tgt < 55) return; GV.ops.pop(); var j = GV.shed.lastIndexOf(op.a); if (j >= 0) GV.shed.splice(j, 1); qApply(); GV.cool = 3; GV.tUp = t; }
  function qShedTell() { if (GV.told) return; GV.told = true; var L2 = qq('shedL'), names = GV.shed.map(function (s) { return L2[s]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }); toast(f(qq('shed'), { f: QS.fps, l: names.join('、') })); }
  /* the measured rate of the level in use (the median of the last seconds of walking), and the resolution's factor it took */
  function qmRecord() { var lv = qLevel(); if (!lv) return; var h = GV.hist.slice().sort(function (a, b) { return a - b; }), med = h[Math.floor(h.length / 2)], M = qmGet(); M[lv] = { fps: Math.round(med * 10) / 10, k: Math.round(GV.k * 100) / 100, sh: GV.shed.length, sl: GV.shed.slice(), t: Date.now() }; try { localStorage.setItem(QMK, JSON.stringify(M)); } catch (e) {} if (HW) HW.rec = hwRec(HW); }
  /* the offer of a lower level, once a session */
  function qOffer(fps) { if (GV.offer) return; var lv = qLevel(), i = QORD.indexOf(lv); if (i <= 0) return; GV.offer = true; var to = HW && QORD.indexOf(HW.rec) < i ? HW.rec : QORD[i - 1];
    toast(f(qq('slow'), { n: Math.round(fps), f: QS.fps, q: qx(to) })); if (!cardOn) { var C = card('<h2>' + esc(qx('t')) + '</h2><p class="isle__pitch">' + esc(f(qq('slow'), { n: Math.round(fps), f: QS.fps, q: qx(to) })) + '</p><div class="isle__cact"><button type="button" class="isle__btn isle__btn--go" id="isQOff"><b>' + esc(f(qq('tryQ'), { q: qx(to) })) + '</b></button><button type="button" class="isle__btn" data-x2><b>' + esc(qq('later')) + '</b></button></div>');
      $('isQOff').addEventListener('click', function () { qSet(to); cardClose(); setTimeout(function () { qualReload(to); }, 60); }); C.querySelector('[data-x2]').addEventListener('click', cardClose); } }
  /* (v65) a level that needed lowering here before starts where it settled (it comes back up by itself if this time there is room) */
  function qSeed() { if (window.ISLE_TEST && !window.ISLE_QSEED) return; var lv = qLevel(), M = qmGet(), r = lv && M[lv]; if (!r || !QS.dyn || Date.now() - (r.t || 0) > 14 * 864e5) return; var sl = (r.sl || []).filter(function (s) { return /^(bloom|rays|refl|dof|shadow|shrate|shoff|aa)$/.test(s); }); if (!(r.k < 1 - 1e-3 || sl.length)) return;
    GV.k = Math.max(qKmin(), Math.min(1, r.k || 1)); GV.shed = sl; GV.ops = (GV.k < 1 ? [{ a: 'k', from: 1 }] : []).concat(sl.map(function (s) { return { a: s }; })); GV.tDown = performance.now() / 1000 - 4; }
  var _tkUseQ = tkUse; tkUse = function (c) { var was = TK; _tkUseQ.apply(this, arguments); if (TK !== was) { GV.cool = Math.max(GV.cool, 6); GV.acc = 0; GV.n = 0; GV.iv.length = 0; GV.slow = 0; } };
  var _build3dQ = build3d; build3d = function () { var r = _build3dQ.apply(this, arguments); if (r && W && !W.__q) { W.__q = true; try { qSeed(); qApply(true); } catch (e) { if (window.ISLE_TEST) throw e; } var eu = W.envUpdate; W.envUpdate = function (R) { try { qGov(); qHold(); } catch (e) { if (window.ISLE_TEST) throw e; } return eu.apply(W, arguments); }; } return r; };

  /* ---------- the card ---------- */
  function qCur(k) { var e = qEff(), on = qq('on'), off = qq('off'); if (k === 'scale') return Math.round(100 * (R3 ? R3.getPixelRatio() : 1) / (window.devicePixelRatio || 1)) + '%'; if (k === 'shadow') return e.shadow ? e.shadow + ' px' : off; if (k === 'aa') return e.aa ? e.aa + '×' : off; if (k === 'fps') return Math.round(GV.fps || QFPS.v || 0) + ' fps'; if (k === 'dyn') return QS.dyn ? on : off; return e[k] ? on : off; }
  /* (v84) only the card's own labels: the card's timer called this with no card, so every element of the page with a data-c was written over — the lens's buttons (island_aw, v77) lost their arrows to “now: off” as soon as the quality card had been open a second */
  function qCurAll(C) { [].forEach.call((C || $('isCard') || document).querySelectorAll('.isle__qcur[data-c]'), function (n) { n.textContent = f(qq('curV'), { v: qCur(n.getAttribute('data-c')) }); }); }
  function qRow(k, label, sub, opts, cur, dis) { return '<div class="isle__qrow' + (dis ? ' is-dis' : '') + '"><span><b>' + esc(label) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '<em class="isle__qcur" data-c="' + k + '"></em></span><div class="isle__seg" role="group" aria-label="' + esc(label) + '" data-k="' + k + '">' + opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" class="' + (String(o[0]) === String(cur) ? 'is-on' : '') + '"' + (dis ? ' disabled' : '') + ' aria-pressed="' + (String(o[0]) === String(cur)) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div></div>'; }
  function qNowText() { return f(qq('now'), { n: Math.round(GV.fps || QFPS.v || 0), r: Math.round(100 * (R3 ? R3.getPixelRatio() : 1) / (window.devicePixelRatio || 1)) }) + (GV.shed.length ? ' · ' + f(qq('shedNow'), { l: GV.shed.map(function (s) { return qq('shedL')[s]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join('、') }) : ''); }
  qualCard = function () { var cur = qGet(), lvNow = qLevel(), rec = HW ? HW.rec : null, M = qmGet(), h = '<p class="isle__kick2">' + esc(t('more')) + '</p><h2>' + esc(qx('t')) + '</h2>';
    if (rec) { var hw = []; if (HW.gpu) hw.push(HW.gpu); if (HW.cores) hw.push(f(qq('cores'), { n: HW.cores })); if (HW.mem) hw.push(f(qq('mem'), { n: HW.mem })); if (HW.score) hw.push(f(qq('score'), { n: HW.score }));
      h += '<div class="isle__qrec"><div class="isle__qrec-top"><small>' + esc(qq('rec')) + '</small><b>' + esc(qx(rec)) + '</b></div><p>' + esc(f(qq('recS'), { f: QS.fps })) + (Object.keys(M).length ? ' · ' + esc(qq('recM')) : '') + '</p>' + (hw.length ? '<p class="isle__qhw">' + esc(hw.join(' · ')) + '</p>' : '') + '<p class="isle__qnow" id="isQNow">' + esc(qNowText()) + '</p></div>'; }
    h += '<div class="isle__menu isle__menu--qual">' + QLEV.map(function (k, i) { var sub = k === 'auto' ? qx('autoS') + (rec ? ' · ' + f(qq('autoUse'), { q: qx(rec) }) : '') : qx(k + 'S'), m = M[k], est = k !== 'auto' ? qEstFps(k) : null;
      if (k !== 'auto') { if (m && m.fps) sub += ' · ' + f(qq('meas'), { n: Math.round(m.fps) }); else if (est) sub += ' · ' + f(qq('est'), { n: Math.round(est) }); }
      return '<button type="button" class="isle__opt' + (k === cur ? ' is-on' : '') + (k === rec ? ' is-rec' : '') + '" data-q="' + k + '"><i>' + (k === 'auto' ? 'A' : i) + '</i><span><b>' + esc(qx(k)) + (k === cur ? ' · ' + esc(qx('cur')) : '') + '</b><small>' + esc(sub) + '</small></span>' + (k === rec ? '<em class="isle__qbadge">' + esc(qq('badge')) + '</em>' : '') + '</button>'; }).join('') + '</div>';
    var curLv = cur === 'auto' ? rec : cur; if (rec && curLv && QORD.indexOf(curLv) > QORD.indexOf(rec)) h += '<p class="isle__qwarn">' + esc(f(qq('warn'), { c: qx(curLv), f: QS.fps, q: qx(rec) })) + '</p>';
    var noPost = !POST, A2 = qq('auto'), noFx = !POST || !POST.fx || !POST.fx.ok;
    h += '<h3 class="isle__qh">' + esc(qq('det')) + '<small>' + esc(qq('detS')) + '</small></h3><div class="isle__qgrid">' +
      qRow('fps', qq('fpsT2'), qq('fpsS2'), [[30, '30'], [60, '60']], QS.fps) +
      qRow('dyn', qq('dyn'), qq('dynS'), [['1', qq('on')], ['0', qq('off')]], QS.dyn ? '1' : '0') +
      qRow('scale', qq('scale'), qq('scaleS'), [['auto', A2], [0.5, '50%'], [0.7, '70%'], [0.85, '85%'], [1, '100%']], QS.scale) +
      qRow('shadow', qq('shadow'), null, [['auto', A2], [0, qq('off')], [1024, qq('lo')], [2048, qq('mid2')], [4096, qq('hi')]], QS.shadow) +
      qRow('aa', qq('aa'), noPost ? qq('postN') : null, [['auto', A2], [0, qq('off')], [2, '2×'], [4, '4×'], [8, '8×']], QS.aa, noPost) +
      qRow('bloom', qq('bloom'), noPost ? qq('postN') : null, [['auto', A2], ['off', qq('off')], ['on', qq('on')]], QS.bloom, noPost) +
      qRow('rays', qq('rays'), noPost ? qq('postN') : null, [['auto', A2], ['off', qq('off')], ['on', qq('on')]], QS.rays, noPost) +
      qRow('dof', qq('dof'), noPost ? qq('postN') : null, [['auto', A2], ['off', qq('off')], ['on', qq('on')]], QS.dof, noPost) +
      qRow('refl', qq('refl'), TIER !== 'high' ? qq('reflS') : null, [['auto', A2], ['off', qq('off')], ['on', qq('on')]], QS.refl, TIER !== 'high') +
      /* (v85) */ qRow('ssr', qq('ssr'), noFx ? qq('postN') : qq('ssrS'), [['auto', A2], ['off', qq('off')], ['on', qq('on')]], QS.ssr, noFx) +
      qRow('ao', qq('ao'), noFx ? qq('postN') : qq('aoS'), [['auto', A2], ['off', qq('off')], ['on', qq('on')]], QS.ao, noFx) + '</div>';
    var on = fpsOn(); h += '<div class="isle__qfps"><span><b>' + esc(qx('fpsT')) + '</b><small>' + esc(qx('fpsS')) + '</small></span><button type="button" role="switch" aria-checked="' + on + '" class="isle__sw' + (on ? ' is-on' : '') + '" id="isQFps"><i></i><em>' + esc(on ? qx('on') : qx('off')) + '</em></button></div>';
    h += '<div class="isle__cact isle__cact--q"><button type="button" class="isle__btn isle__btn--small" id="isQReset"><b>' + esc(qq('reset')) + '</b></button></div><p class="isle__why">' + esc(qq('note')) + '</p>';
    var C = card(h, 'isle__cin--menu isle__cin--q'); qCurAll(C);
    [].forEach.call(C.querySelectorAll('[data-q]'), function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-q'); qSet(v); AU.fx('ok'); cardClose(); qualLabel(); if (built && QAT !== v) { setTimeout(function () { qualReload(v); }, 80); } else toast(f(qx('set'), { q: qx(v) }), 'stamp'); }); });
    [].forEach.call(C.querySelectorAll('.isle__seg'), function (sg) { var k = sg.getAttribute('data-k'); [].forEach.call(sg.querySelectorAll('button'), function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-v'); if (k === 'fps') QS.fps = +v; else if (k === 'dyn') QS.dyn = v === '1'; else if (k === 'scale' || k === 'shadow' || k === 'aa') QS[k] = v === 'auto' ? 'auto' : +v; else QS[k] = v; qsSave();
      if (k === 'dyn' && !QS.dyn) { GV.k = 1; GV.shed = []; GV.ops = []; } if (k !== 'fps' && k !== 'dyn') { GV.shed = GV.shed.filter(function (s) { return s !== k && !(k === 'shadow' && (s === 'shrate' || s === 'shoff')); }); if (k === 'scale') { GV.k = 1; GV.ops = GV.ops.filter(function (o) { return o.a !== 'k'; }); } qOpsFix(); } GV.cool = 3; GV.told = false; qApply(true); AU.fx('ok');
      [].forEach.call(sg.querySelectorAll('button'), function (b2) { var o = b2 === b; b2.classList.toggle('is-on', o); b2.setAttribute('aria-pressed', String(o)); }); setTimeout(function () { qCurAll(C); }, 120); }); }); });
    var sw = $('isQFps'); sw.addEventListener('click', function () { var v = !fpsOn(); fpsSet(v); sw.classList.toggle('is-on', v); sw.setAttribute('aria-checked', String(v)); sw.querySelector('em').textContent = v ? qx('on') : qx('off'); AU.fx('ok'); });
    $('isQReset').addEventListener('click', function () { QS = { fps: 30, dyn: true, scale: 'auto', shadow: 'auto', aa: 'auto', bloom: 'auto', rays: 'auto', dof: 'auto', refl: 'auto', ao: 'auto', ssr: 'auto' }; qsSave(); GV.k = 1; GV.shed = []; GV.ops = []; GV.cool = 3; qApply(true); toast(qq('resetD'), 'stamp'); qualCard(); });
    clearInterval(qualCard.t); qualCard.t = setInterval(function () { var n = $('isQNow'); if (!n || !cardOn) { clearInterval(qualCard.t); return; } n.textContent = qNowText(); qCurAll(); }, 1000); };
  window.ISLE_x.q2 = function (set) { if (set) { Object.keys(set).forEach(function (k) { QS[k] = set[k]; }); qsSave(); qApply(true); } return { hw: HW, qs: QS, eff: qEff(), gv: { k: GV.k, fps: Math.round(GV.fps), shed: GV.shed.slice() }, dpr: R3 ? R3.getPixelRatio() : null, level: qLevel(), meas: qmGet(), est: QORD.map(function (k) { var e = qEstFps(k); return [k, e && Math.round(e)]; }) }; };
  window.ISLE_x.qGov = function (fps, n) { for (var i = 0; i < (n || 1); i++) { GV.acc = 500; GV.n = Math.max(1, Math.round(fps / 2)); GV.iv = []; for (var q = 0; q < GV.n; q++) GV.iv.push(500 / GV.n); GV.cool = 0; GV.last = 0; if (window.ISLE_QT != null) { GV.tDown -= window.ISLE_QT; GV.tUp -= window.ISLE_QT; } var nf = window.NO_GOV, ff = window.FAST3D; window.NO_GOV = false; window.FAST3D = false; try { qGov(); } finally { window.NO_GOV = nf; window.FAST3D = ff; } } return { k: +GV.k.toFixed(3), shed: GV.shed.slice(), ops: GV.ops.map(function (o) { return o.a; }), bo: GV.bo, dpr: R3 && R3.getPixelRatio(), shRate: GV.shRate, auto: R3 && R3.shadowMap.autoUpdate }; };
