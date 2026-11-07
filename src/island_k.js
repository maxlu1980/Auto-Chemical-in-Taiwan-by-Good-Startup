/* ===== [island_k.js] ===== */
  /* ================= (v36.2) Luna's five fighting styles — all original (names, moves, lines, effects) =================
     Each strike (R, or the strike button) draws one style at random, never the same twice running; each has its own reach, force, speed and
     weapon, and Luna calls the move out in Japanese:
       剛拳・鬼哭  close (1.6 m), the heaviest blow, slow to come (0.42 s): the ground cracks in a ring, a car in the way is shaken.
       流水・蒼波  close (1.5 m), three quick blows (0.16 s apart), each one turning to the next man.
       居合・月影  a wooden sword (bokken), a wide cut (2.6 m, 140°) from a still stance (0.36 s) — the back of the blade, no one is cut.
       幻月・迷宮掌 a palm that throws a dream (6 m, a 60° cone): everyone in it loses their footing.
       星輝砲      gathered light (0.75 s), then a beam 14 m long: everyone in its line is thrown, cars stop.
     Voice: a clip embedded for the line when there is one (window.LUNA_VOICE, id → base64 audio); else the device's own Japanese voice, as
     young and bright as it allows (Web Speech API). A subtitle shows the line, with its meaning in the reader's language. */
  var FSX = {
    zh: { styles: { goken: '剛拳・鬼哭', ryusui: '流水・蒼波', iai: '居合・月影', genmu: '幻月・迷宮掌', seiki: '星輝砲' }, mean: { goken: '「鬼哭碎！」', ryusui: '「蒼波連擊！」', iai: '「居合――月影。」', iai2: '「用的是刀背，放心吧。」', genmu: '「歡迎光臨夢之迷宮～！」', seiki: '「衝啊――星輝砲！」', win: '「好耶！」', miss: '「咦？」' }, bStrike: '出招', hintR: 'R 出招（隨機流派）' },
    en: { styles: { goken: 'Gōken: Kikoku', ryusui: 'Ryūsui: Sōha', iai: 'Iai: Tsukikage', genmu: 'Gengetsu: Labyrinth Palm', seiki: 'Seiki Cannon' }, mean: { goken: '"Kikoku Crusher!"', ryusui: '"Blue Wave Combo!"', iai: '"Iai — Moonshadow."', iai2: '"Back of the blade — you\'ll be fine."', genmu: '"Welcome to the dream maze!"', seiki: '"Go! Seiki Cannon!"', win: '"Yay!"', miss: '"Huh?"' }, bStrike: 'Strike', hintR: 'R strike (random style)' },
    ja: { styles: { goken: '剛拳・鬼哭', ryusui: '流水・蒼波', iai: '居合・月影', genmu: '幻月・迷宮掌', seiki: '星輝砲' }, mean: {}, bStrike: '技', hintR: 'R 技（ランダムな流派）' } };
  /* the lines: what is shown, and what is spoken (in kana where a reader could stumble) */
  var FSL = { goken: ['はあああっ！ 鬼哭砕（きこくさい）！', 'はあああっ！ きこくさい！'], ryusui: ['流れるように――蒼波連撃（そうはれんげき）！', 'ながれるように、そうはれんげき！'], iai: ['居合――月影（つきかげ）。', 'いあい、つきかげ。'], iai2: ['峰打ちだから、安心してね。', 'みねうちだから、あんしんしてね。'],
    genmu: ['夢の迷宮へ、ご案内～！', 'ゆめのめいきゅうへ、ごあんない！'], seiki: ['いっけええっ！ 星輝砲（せいきほう）！', 'いっけええっ！ せいきほう！'], win: ['やったね！', 'やったね！'], miss: ['あれれ？', 'あれれ？'] };
  var FS = { goken: { range: 1.6, cos: 0.55, wind: 0.42, act: 0.14, rec: 0.45, hits: 1, hard: true, car: true, poseW: 'charge', poseA: 'heavy' },
    ryusui: { range: 1.5, cos: 0.4, wind: 0.08, act: 0.48, rec: 0.25, hits: 3, hard: false, car: false, poseW: 'attack', poseA: 'combo2' },
    iai: { range: 2.6, cos: -0.35, wind: 0.36, act: 0.08, rec: 0.42, hits: 1, hard: false, car: true, poseW: 'guard', poseA: 'combo2', weapon: true },
    genmu: { range: 6.0, cos: 0.866, wind: 0.32, act: 0.3, rec: 0.35, hits: 1, hard: false, car: false, poseW: 'parry', poseA: 'thrust' },
    seiki: { range: 14, beam: 0.9, wind: 0.75, act: 0.5, rec: 0.35, hits: 1, hard: true, car: true, poseW: 'charge', poseA: 'idle' } };
  var FSK = ['goken', 'ryusui', 'iai', 'genmu', 'seiki'], FSV = { last: null, fx: [], bokken: null, subT: 0 };
  function fsx() { return FSX[String(typeof LANG === 'string' ? LANG : 'zh').slice(0, 2)] || FSX.en; }

  /* ---------- the voice ---------- */
  var VOICE = (function () { var ja = null; function pick() { if (ja !== null || !window.speechSynthesis) return ja; var vs = speechSynthesis.getVoices().filter(function (v) { return /^ja/i.test(v.lang); }); if (!vs.length) return null;
      var pref = vs.filter(function (v) { return /Kyoko|Haruka|Nanami|Ayumi|Sayaka|Mizuki|O-?Ren|Hikari|Female|女性/i.test(v.name); }); ja = pref[0] || vs.filter(function (v) { return /Google/i.test(v.name); })[0] || vs[0]; return ja; }
    if (window.speechSynthesis && speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', function () { ja = null; });
    function muted() { try { return (typeof SimAudio !== 'undefined' && SimAudio.muted()) || (typeof tkMuted === 'function' && tkMuted()); } catch (e) { return false; } }
    function say(id) { if (muted()) return; var L = FSL[id]; if (!L) return; var clip = window.LUNA_VOICE && window.LUNA_VOICE[id];
      if (clip) { try { var a = new Audio(clip.indexOf('data:') === 0 ? clip : 'data:audio/mpeg;base64,' + clip); a.volume = 0.95; var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} return; }
      if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return; try { var u = new SpeechSynthesisUtterance(L[1]); u.lang = 'ja-JP'; var v = pick(); if (v) u.voice = v; u.pitch = 1.55; u.rate = 1.12; u.volume = 1; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
    return { say: say }; })();
  function fsSub(id, style) { var el = $('isFsSub'); if (!el) { el = document.createElement('div'); el.id = 'isFsSub'; el.className = 'isle__fssub'; el.setAttribute('aria-live', 'polite'); root.appendChild(el); }
    var X = fsx(), L = FSL[id]; el.innerHTML = (style ? '<small>' + esc(X.styles[style] || '') + '</small>' : '') + '<b lang="ja">' + esc(L[0]) + '</b>' + (X.mean[id] ? '<i>' + esc(X.mean[id]) + '</i>' : ''); el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on'); FSV.subT = 2.6; }

  /* ---------- the effects (additive light on the ground and in the air) ---------- */
  function fxMat(col, op) { var m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }); return m; }
  function fxAdd(mesh, life, upd) { TK.T.root.add(mesh); FSV.fx.push({ m: mesh, t: 0, life: life, upd: upd }); }
  function fxTick(dt) { FSV.fx = FSV.fx.filter(function (f) { f.t += dt; var u = Math.min(1, f.t / f.life); if (f.upd) f.upd(f.m, u, dt); if (u >= 1) { f.m.parent && f.m.parent.remove(f.m); f.m.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); return false; } return true; }); }
  function lFace() { var T = TK.T; return [T.f * Math.sin(face), T.f * Math.cos(face)]; } /* her facing in the street's own frame */
  function fxQuake(p) { var g = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.32, 40), fxMat(0xffc070, 0.9)); g.rotation.x = -Math.PI / 2; g.position.set(p[0], p[1] + 0.05, p[2]); fxAdd(g, 0.55, function (m, u) { var s = 1 + u * 9; m.scale.set(s, s, 1); m.material.opacity = 0.9 * (1 - u); });
    for (var i = 0; i < 7; i++) (function (k) { var c = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.5 + Math.random() * 0.6), fxMat(0xffe0a0, 0.8)); var a = k / 7 * Math.PI * 2 + Math.random() * 0.4; c.position.set(p[0] + Math.sin(a) * 0.45, p[1] + 0.04, p[2] + Math.cos(a) * 0.45); c.rotation.y = a; fxAdd(c, 0.8, function (m, u) { m.material.opacity = 0.8 * (1 - u); }); })(i); }
  function fxArc(p, fd, r, col, span, life, y) { var ang = Math.atan2(fd[0], fd[1]), g = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 6, 40, span), fxMat(col, 0.95)); g.rotation.x = Math.PI / 2; g.rotation.z = -(ang - span / 2) + Math.PI / 2; g.position.set(p[0], p[1] + (y || 1.0), p[2]);
    fxAdd(g, life, function (m, u) { m.material.opacity = 0.95 * (1 - u); var s = 1 + u * 0.25; m.scale.set(s, s, 1); }); }
  function fxDream(p, fd) { for (var i = 0; i < 3; i++) (function (k) { var g = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 40, 1, true), fxMat(k % 2 ? 0x8ad8ff : 0xc89aff, 0.5)); g.position.set(p[0] + fd[0] * 0.6, p[1] + 0.9, p[2] + fd[1] * 0.6);
      fxAdd(g, 0.9 + k * 0.15, function (m, u) { var uu = Math.max(0, u - k * 0.12), s = 1 + uu * 9; m.scale.set(s, 1 - uu * 0.5, s); m.position.x += fd[0] * 0.05; m.position.z += fd[1] * 0.05; m.material.opacity = 0.5 * (1 - uu); }); })(i);
    for (var j = 0; j < 14; j++) { var sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), fxMat(0xf0e0ff, 0.9)), a = (Math.random() - 0.5) * 1.1 + Math.atan2(fd[0], fd[1]), d = 1 + Math.random() * 4.5; sp.position.set(p[0] + Math.sin(a) * d, p[1] + 0.4 + Math.random() * 1.6, p[2] + Math.cos(a) * d); fxAdd(sp, 1.2, function (m, u) { m.rotation.y += 0.2; m.position.y += 0.01; m.material.opacity = 0.9 * (1 - u); }); } }
  function fxOrb(A) { var g = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), fxMat(0xfff2b0, 0.95)), h = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), fxMat(0x5ae0ff, 0.45)); g.add(h); TK.T.root.add(g); return g; }
  function fxBeam(p, fd, len) { var grp = new THREE.Group(), core = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, len, 16, 1, true), fxMat(0xfffbe8, 1)), glow = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, len, 20, 1, true), fxMat(0x58d8ff, 0.5)), ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 30), fxMat(0xffe27a, 0.8));
    [core, glow].forEach(function (c) { c.rotation.x = Math.PI / 2; c.position.z = len / 2; grp.add(c); }); ring.position.z = 0.3; grp.add(ring); grp.position.set(p[0], p[1] + 1.05, p[2]); grp.rotation.y = Math.atan2(fd[0], fd[1]);
    fxAdd(grp, 0.6, function (m, u) { var w = u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85; core.scale.set(w, 1, w); glow.scale.set(0.6 + w * 0.6, 1, 0.6 + w * 0.6); core.material.opacity = w; glow.material.opacity = 0.5 * w; ring.scale.setScalar(1 + u * 3); ring.position.z = 0.3 + u * len * 0.8; ring.material.opacity = 0.8 * (1 - u); }); }
  /* the wooden sword (an oak bokken, the edge never sharpened), in her right hand while she draws */
  function bokken() { if (FSV.bokken) return FSV.bokken; var g = new THREE.Group(), wood = LUNA.toon(0x9a7448, { rim: 0.15 }), b = LUNA.mesh(new THREE.CylinderGeometry(0.014, 0.019, 0.82, 10), wood, { ink: 0.003 }); b.rotation.x = Math.PI / 2; b.position.z = 0.44; g.add(b);
    var ts = LUNA.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 16), LUNA.toon(0x2a2a2a, { rim: 0.1 }), { ink: 0.002 }); ts.rotation.x = Math.PI / 2; ts.position.z = 0.04; g.add(ts); g.position.set(0, -0.04, 0.0); g.visible = false; luna.armR.wr.add(g); FSV.bokken = g; return g; }

  /* ---------- the strike ---------- */
  function targets(S, Lu, fd) { var out = []; GS.npcs.forEach(function (n) { if (n.ko || n.off || n.gone || !n.A.root.visible || n.kind === 'master' || n.seat) return; var l = nL(n), dx = l[0] - Lu[0], dz = l[2] - Lu[2], d = Math.hypot(dx, dz); if (Math.abs(l[1] - Lu[1]) > 1.0) return;
      if (S.beam) { var al = dx * fd[0] + dz * fd[1], sd = Math.abs(dx * fd[1] - dz * fd[0]); if (al > 0.2 && al < S.range && sd < S.beam) out.push({ n: n, d: al }); } else if (d < S.range && (dx * fd[0] + dz * fd[1]) / (d || 1) > S.cos) out.push({ n: n, d: d }); }); return out.sort(function (a, b) { return a.d - b.d; }); }
  function strikeNpc(n, Lu, S) { var l = nL(n); if (n.kind === 'boss') { AU.fx('hit'); LUNA.setMode(n.A, 'guard'); setTimeout(function () { if (n.A.mode === 'guard') LUNA.setMode(n.A, 'idle'); }, 1100); try { phSeq('kage', gd('kageHit')); } catch (e) {} GS.hostT = 16; return; }
    knock(n, [l[0] - Lu[0], l[2] - Lu[2]], S.hard); if (S.hard && n.ko) n.ko.slide = Math.min(5.5, n.ko.slide * 1.4); AU.fx('hit'); if (n.kind === 'yak') { GS.hostT = 16; crime('brawl'); } else if (n.kind === 'cop') crime('cop'); else crime('assault'); }
  function strikeCars(S, fd) { var T = TK.T, Lu = gL(), any = false; if (Math.abs(pos.y - TK.y) > 1) return false; T.cars.forEach(function (V) { var dx = V.x - Lu[0], dz = V.z - Lu[2], al = dx * fd[0] + dz * fd[1], sd = Math.abs(dx * fd[1] - dz * fd[0]); var reach = S.beam ? S.range : S.range + V.L / 2, wide = S.beam ? S.beam + V.W / 2 : V.W / 2 + 0.6;
      if (al > 0 && al < reach && sd < wide) { V.v = 0; V.hold = 2.5; V.root.userData.jolt = 0.35; any = true; } }); if (any) { AU.fx('hit'); setTimeout(function () { AU.fx('horn'); }, 180); crime('vandal'); } return any; }
  var _gsPunchK = gsPunch; gsPunch = function () { if (GS.punchCD > 0 || GS.car || GS.stun > 0 || GS.lko || GS.fm || GS.arrest) return; var pool = FSK.filter(function (k) { return k !== FSV.last; }), id = window.ISLE_FS || pool[Math.floor(Math.random() * pool.length)]; FSV.last = id; var S = FS[id];
    /* aim: turn to the nearest one within reach (a soft lock) */ var T = TK.T, Lu = gL(), best = null, bd = S.range * 1.15; GS.npcs.forEach(function (n) { if (n.ko || n.off || n.gone || !n.A.root.visible || n.kind === 'master' || n.seat) return; var l = nL(n), d = Math.hypot(l[0] - Lu[0], l[2] - Lu[2]); if (d < bd && Math.abs(l[1] - Lu[1]) < 1) { bd = d; best = l; } });
    var bestN = null; GS.npcs.forEach(function (n) { if (bestN || n.ko || n.off || n.gone || !n.A.root.visible || n.kind === 'master' || n.seat) return; var l = nL(n); if (best && l[0] === best[0] && l[2] === best[2]) bestN = n; });
    if (best) face = Math.atan2(T.f * (best[0] - Lu[0]), T.f * (best[2] - Lu[2])); luna.root.rotation.set(0, face, 0); target = null; path = null; el.tapMark.visible = false;
    GS.fm = { id: id, S: S, t: 0, hit: 0, done: false, any: false, aim: bestN }; GS.punchCD = S.wind + S.act + S.rec; LUNA.setMode(luna, S.poseW); /* (v38) one of two lines; in a rampage she says none */ var lid = FSL[id + '_b'] && Math.random() < 0.5 ? id + '_b' : id; if (!(typeof DXO !== 'undefined' && DXO.bz)) VOICE.say(lid); fsSub(lid, id); AU.fx('swish');
    if (S.weapon) bokken().visible = true; if (id === 'seiki') GS.fm.orb = fxOrb(); };
  function fmTick(dt) { var M = GS.fm; if (!M) return; var S = M.S, Lu = gL(), fd = lFace(); M.t += dt;
    /* the one she aimed at: she keeps turning to them while she gathers herself, and for a close blow closes the last step (a short lunge) */
    if (M.aim && !M.aim.ko && M.t - dt < S.wind) { var al = nL(M.aim), dxa = al[0] - Lu[0], dza = al[2] - Lu[2], da = Math.hypot(dxa, dza); if (da < S.range * 1.6) { face = Math.atan2(TK.T.f * dxa, TK.T.f * dza); luna.root.rotation.set(0, face, 0); fd = lFace(); }
      if (!S.beam && S.range < 3 && M.t >= S.wind && da > S.range * 0.75 && da < S.range + 1.1) { var st = Math.min(0.75, da - S.range * 0.6), wv = TK.T.toW(Lu[0] + dxa / da * st, 0, Lu[2] + dza / da * st); if (walkable(wv.x, wv.z) && !tkCarPush(wv.x, wv.z, 0.3)) { pos.x = wv.x; pos.z = wv.z; pos.y = groundY(pos.x, pos.z); luna.root.position.copy(pos); Lu = gL(); } } }
    if (M.orb) { var hp = luna.armR.wr.getWorldPosition(new THREE.Vector3()), hl = TK.T.toL(hp.x, hp.z); M.orb.position.set(hl[0] + fd[0] * 0.25, hp.y - TK.y + 0.05, hl[1] + fd[1] * 0.25); var gs = Math.min(1, M.t / S.wind); M.orb.scale.setScalar(0.4 + gs * 1.4); }
    if (M.id === 'seiki' && M.t < S.wind + S.act) { luna.holdR = [-1.45, -0.05, -0.15]; luna.holdL = [-1.45, 0.05, -0.15]; }
    var per = S.act / S.hits; while (M.hit < S.hits && M.t >= S.wind + M.hit * per) { var k = M.hit++; LUNA.setMode(luna, M.id === 'ryusui' ? (k % 2 ? 'attack' : 'combo2') : S.poseA); AU.fx('swish');
      var hitsN = targets(S, Lu, fd); if (M.id === 'goken') fxQuake([Lu[0] + fd[0] * 1.1, Lu[1], Lu[2] + fd[1] * 1.1]); if (M.id === 'ryusui') fxArc(Lu, fd, 0.9 + k * 0.15, 0x6ad0ff, 1.6, 0.25, 0.9 + (k % 2) * 0.25); if (M.id === 'iai') fxArc(Lu, fd, 1.9, 0xeef4ff, 2.4, 0.3, 0.95); if (M.id === 'genmu') fxDream(Lu, fd);
      if (M.id === 'seiki') { if (M.orb) { M.orb.parent && M.orb.parent.remove(M.orb); M.orb = null; } fxBeam(Lu, fd, S.range); }
      if (M.id === 'ryusui') hitsN = hitsN.slice(0, 1); else if (M.id === 'goken' || M.id === 'iai') hitsN = hitsN.slice(0, M.id === 'iai' ? 4 : 2);
      hitsN.forEach(function (h) { strikeNpc(h.n, Lu, S); M.any = true; }); if (S.car && strikeCars(S, fd)) M.any = true; }
    if (M.t >= S.wind + S.act + 0.05 && !M.done) { M.done = true; if (M.id === 'iai') { setTimeout(function () { if (M.any) { VOICE.say('iai2'); fsSub('iai2', null); } }, 380); } else if (!M.any && Math.random() < 0.5) { VOICE.say('miss'); fsSub('miss', null); } else if (M.any && Math.random() < 0.3) setTimeout(function () { VOICE.say('win'); fsSub('win', null); }, 500); }
    if (M.t >= S.wind + S.act + S.rec) { GS.fm = null; luna.holdR = null; luna.holdL = null; if (FSV.bokken) FSV.bokken.visible = false; if (['charge', 'guard', 'parry', 'thrust', 'heavy', 'combo2', 'attack'].indexOf(luna.mode) >= 0) LUNA.setMode(luna, 'idle'); } }
  /* while a strike is under way she stands her ground (a step at most) */
  var _moveK = move; move = function (dt) { if (gsOn() && GS.fm && !GS.car && !GS.arrest) { vel.multiplyScalar(0.7); luna.speed = 0; luna.root.position.copy(pos); luna.root.rotation.set(0, face, 0); return; } _moveK(dt); };
  var _extraTickK = extraTick; extraTick = function (dt, ts) { _extraTickK(dt, ts); if (gsOn() && GS.built) { var d2 = dt / (FSV.slow || 1); fmTick(d2); fxTick(d2); if (FSV.subT > 0) { FSV.subT -= dt; if (FSV.subT <= 0) { var se = $('isFsSub'); if (se) se.classList.remove('is-on'); } } } else if (FSV.fx.length) fxTick(dt); };
  var _gsStopK = gsStop; gsStop = function () { if (GS.fm) { GS.fm = null; luna.holdR = luna.holdL = null; } if (FSV.bokken) FSV.bokken.visible = false; FSV.fx.slice().forEach(function (f) { f.t = f.life; }); fxTick(0); var se = $('isFsSub'); if (se) se.classList.remove('is-on'); return _gsStopK.apply(this, arguments); };
  var _arrestStartK = arrestStart; arrestStart = function (n) { if (GS.fm) { GS.fm = null; luna.holdR = luna.holdL = null; if (FSV.bokken) FSV.bokken.visible = false; } return _arrestStartK(n); };
  /* the words for the strike in the help line and on the button */ (function () { ['zh', 'en', 'ja'].forEach(function (lg) { var G = GX[lg]; if (!G) return; var X = FSX[lg]; G.hintM = G.hintM.replace(/R [^·]+·/, X.hintR + ' ·'); G.bPunch = X.bStrike; G.hintT = G.hintT.replace(lg === 'zh' ? '揮拳' : lg === 'ja' ? 'パンチ' : 'punch', X.bStrike.toLowerCase ? (lg === 'en' ? 'strike' : X.bStrike) : X.bStrike); if (TKWX[lg]) { TKWX[lg].hintM = G.hintM; TKWX[lg].hintT = G.hintT; } }); })();
  window.ISLE_x.fs = function (id) { window.ISLE_FS = id || null; return FSK; };


