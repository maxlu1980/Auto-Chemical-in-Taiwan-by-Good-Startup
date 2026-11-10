/* ===== [island_ax.js] ===== */
  /* ================= (v79) Okachimachi's announcements as the station makes them =================
     For each train, in the order heard on the platforms there: “the next train on track n is …” while it is still a way off; “a train is
     coming in on track n … stand back behind the yellow blocks” as it nears, and the same in English; the station's name as it stops; the
     departure tune, then “track n, the doors are closing”. On the Keihin-Tōhoku tracks the kind of train and where it goes are the ones the
     platform's indicator shows at that moment. Tracks 1 and 3 are spoken by a woman, tracks 2 and 4 by a man.
     The Japanese lines can be recordings — made with VOICEVOX from okv/okachimachi_voicevox.txt, one file a line, carried by the page as
     window.AC_OKV = { number: data URI } — and are then played through the station's loudspeakers; until they are there, and wherever one is
     missing, the device's own voice says the same words. English stays with the device's voice.
     No railway's recordings, announcers' voices or departure tunes are used or imitated: the words follow the usual form of such
     announcements, the tunes and every sound are this project's own. ================= */
  var OKV = { data: null, buf: {}, st: 0, gain: 1.0, played: 0 };
  function okvHave(ids) { for (var i = 0; i < ids.length; i++) if (!OKV.buf[ids[i]]) return false; return ids.length > 0; }
  /* the recordings are decoded one after another once the page may make sound (a few milliseconds each) */
  function okvLoad() { if (OKV.st) return; OKV.data = OKV.data || window.AC_OKV || null; if (!OKV.data) return; var a = aulPeek(); if (!a || !a.ctx || a.ctx.state !== 'running') return; OKV.st = 1; var ids = Object.keys(OKV.data), i = 0;
    (function next() { if (i >= ids.length) { OKV.st = 2; return; } var id = ids[i++], go = function () { setTimeout(next, 25); }; try { var s = OKV.data[id], bin = atob(s.slice(s.indexOf(',') + 1)), u8 = new Uint8Array(bin.length), k; for (k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k); a.ctx.decodeAudioData(u8.buffer, function (b) { OKV.buf[id] = b; go(); }, go); } catch (e) { go(); } })(); }
  /* a line that has its recording is played through the loudspeakers; any other line is spoken as before */
  var _spSayAX = spSay; spSay = function (s, vol, done) { var ids = s.clip && okvHave(s.clip) ? s.clip : null, B = ids ? annBus(vol) : null; if (!B) return _spSayAX(s, vol, done);
    var c = B.c, t = c.currentTime + 0.06, srcs = [], fin = false, u = {}, tm = 0; function end(why) { if (fin) return; fin = true; clearTimeout(tm); if (ANN.u === u) ANN.u = null; if (why === 'stop') srcs.forEach(function (n) { try { n.stop(); } catch (e) {} }); else { ANN.said++; OKV.played++; } done(why, true); }
    ids.forEach(function (id) { var n = c.createBufferSource(), g = c.createGain(); n.buffer = OKV.buf[id]; g.gain.value = OKV.gain; n.connect(g); g.connect(B.g); n.start(t); srcs.push(n); t += n.buffer.duration + 0.2; });
    u._stop = function () { end('stop'); }; ANN.u = u; tm = setTimeout(function () { end('clip'); }, Math.max(100, (t - c.currentTime - 0.15) * 1000)); };

  /* ---------- what is said ---------- */
  var OKV_D = { '大船': ['Ofuna', '大船'], '磯子': ['Isogo', '磯子'], '桜木町': ['Sakuragicho', '櫻木町'], '蒲田': ['Kamata', '蒲田'], '大宮': ['Omiya', '大宮'], '南浦和': ['Minami-Urawa', '南浦和'], '赤羽': ['Akabane', '赤羽'] };
  /* the track's next train: on the Yamanote tracks the way it goes; on the Keihin-Tōhoku tracks the kind and the destination of the indicator's first line */
  function okvTrain(q) { if (q.n === 2 || q.n === 3) return { yam: true, key: String(q.n), den: q.to.en, dzh: q.to.zh + '方向' }; var O = TK && TK.T && TK.T.oka, B = O && O.led ? O.led[q.n] : null, r = B && B.data && B.data.rows ? B.data.rows[0] : null, dest = r && OKV_D[r[2]] ? r[2] : (q.n === 1 ? '大船' : '大宮'), rapid = !!(r && r[3]);
    return { key: q.n + '.' + (rapid ? 'R' : 'L') + '.' + dest, ken: rapid ? 'rapid' : 'local', kzh: rapid ? '快速' : '各站停車', den: OKV_D[dest][0], dzh: OKV_D[dest][1] }; }
  function okvSeg(key) { var L = OKV_T[key]; return { l: 'ja', v: L[1], t: L[2].replace(/・/g, '、'), clip: [L[0]] }; }
  function okvShow(key) { return OKV_T[key][2].replace(/ゆき/g, '行き'); }
  jrIn = function (q) { var I = okvTrain(q), n = q.n, k = 'in.' + I.key, ja = okvShow(k) + okvShow('caution.' + q.v), en = 'The ' + (I.yam ? '' : I.ken + ' ') + 'train bound for ' + I.den + ' will soon arrive at track ' + n + '. Please stand behind the yellow warning blocks.';
    return { key: 'jr.in.' + n, pri: 3, ttl: 14, cue: 1, src: { l: 'ja', t: ja }, cap: { ja: ja, en: en, zh: n + ' 號月台，' + (I.yam ? '' : I.kzh + '、') + '開往' + I.dzh + '的電車即將進站。為了安全，請退到黃色導盲磚後方。' }, segs: [okvSeg(k), okvSeg('caution.' + q.v), { l: 'en', v: q.v, opt: 1, t: en }] }; };
  function jrNext(q) { var I = okvTrain(q), n = q.n, k = 'nx.' + I.key, ja = okvShow(k);
    return { key: 'jr.nx.' + n, pri: 1.5, ttl: 9, cue: 1, src: { l: 'ja', t: ja }, cap: { ja: ja, en: 'The next train on track ' + n + ' is ' + (I.yam ? '' : 'the ' + I.ken + ' train ') + 'bound for ' + I.den + '.', zh: '下一班 ' + n + ' 號月台的電車' + (I.yam ? '' : '是' + I.kzh) + '，開往' + I.dzh + '。' }, segs: [okvSeg(k)] }; }
  function jrArr(q) { var k = 'arr.' + q.v, ja = okvShow(k); return { key: 'jr.ar.' + q.n, pri: 2, ttl: 5, delay: 1.4, src: { l: 'ja', t: ja }, cap: { ja: ja, en: 'Okachimachi. This is Okachimachi. Thank you for riding.', zh: '御徒町，御徒町到了。感謝您的搭乘。' }, segs: [okvSeg(k)] }; }
  jrDoors = function (q, after) { var n = q.n, k = 'go.' + n, ja = okvShow(k); return { key: 'jr.go.' + n, pri: 2.5, delay: after == null ? 4.2 : after, ttl: 4.6, src: { l: 'ja', t: ja }, cap: { ja: ja, en: 'Track ' + n + ': the doors are closing. Please take care.', zh: n + ' 號月台，車門即將關閉，請小心。' }, segs: [okvSeg(k)] }; };
  var OKV_CARE = [['care.1', 'Attention, please. For your safety, please do not use your smartphone while walking in the station.', '敬請各位旅客配合：在站內與月台上邊走邊滑手機十分危險，請勿這麼做。'], ['care.3', 'Please do not lean on the platform doors or lean over them.', '請勿倚靠月台門，也不要將身體探出月台門外。'], ['care.5', 'Please walk on the inner side of the yellow tactile blocks.', '請走在黃色導盲磚的內側。'],
    ['care.2', 'Rushing to board a train is dangerous. Please do not do so.', '趕著衝上車十分危險，請勿這麼做。'], ['care.4', 'On the escalator, please hold the handrail and stand inside the yellow lines.', '搭乘電扶梯時，請緊握扶手，並站在黃線內側。']];
  jrCare = function (k) { if (k == null) { OKV.careK = ((OKV.careK == null ? Math.floor(Math.random() * 5) : OKV.careK) + 1) % OKV_CARE.length; k = OKV.careK; } var C = OKV_CARE[k % OKV_CARE.length], ja = okvShow(C[0]);
    return { key: 'jr.care', pri: 0, ttl: 8, cue: 1, src: { l: 'ja', t: ja }, cap: { ja: ja, en: C[1], zh: C[2] }, segs: [okvSeg(C[0]), { l: 'en', v: OKV_T[C[0]][1], opt: 1, t: C[1] }] }; };
  /* ---------- the departure tunes: this project's own two, on a softer struck tone, played through twice (about seven seconds) ---------- */
  function okvKey(B, f, t0, dur, v) { var c = B.c; [[1, 1, 1], [1.003, 0.5, 1], [2, 0.36, 0.5], [4, 0.13, 0.12], [0.5, 0.1, 1.1]].forEach(function (h) { var o = c.createOscillator(), g = c.createGain(), d = dur * h[2]; o.type = 'sine'; o.frequency.value = f * h[0]; g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v * h[1], t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(g); g.connect(B.g); o.start(t0); o.stop(t0 + d + 0.05); }); }
  annMel = function (k, vol) { var B = annBus(vol); if (!B) return 0; var M2 = AN_MEL[k % 2], t = B.c.currentTime + 0.05, st = 0.215, rep;
    for (rep = 0; rep < 2; rep++) { M2.n.forEach(function (m, i) { var tt = t + (rep * 16 + i) * st, last = rep === 1 && i === 15; okvKey(B, anHz(m), tt, last ? 2.2 : 0.85, i % 4 === 0 ? 0.066 : 0.05); if (rep === 1 && (i % 4 === 0 || last)) okvKey(B, anHz(m - 12), tt, last ? 2.2 : 0.9, 0.026); });
      M2.b.forEach(function (m, i) { okvKey(B, anHz(m), t + (rep * 16 + i * 4) * st, 1.3, 0.05); okvKey(B, anHz(m + 12), t + (rep * 16 + i * 4 + 2) * st, 0.8, 0.024); }); }
    return 32 * st + 0.5; };
  /* ---------- when ---------- */
  anScanJR = function (T, E, quiet) { T.trains.forEach(function (tr) { var q = AN_JR[anTrk(T, tr)]; if (!q) return; var S = tr._ann || (tr._ann = {}), d = (tr.stopZ - tr.z) * tr.dir, can = !quiet && E.vol >= 0.12 && (E.side === 0 || (q.n <= 2 ? -1 : 1) === E.side), onPl = can && E.side !== 0; /* off the platforms (the hall, the street) only the approach and the doors carry */
      if (tr.st === 'run') { S.mel = false; S.arr = false; if (d > 0 && d < 150) { if (!S.ap) { S.ap = true; if (can && d > 60) annPush(anAt(jrIn(q), E.vol)); } } else S.ap = false;
        /* still a way off (it has just come round again): the next train is named */ if (d > 170 && d < 430) { if (!S.nx) { S.nx = true; if (onPl) annPush(anAt(jrNext(q), E.vol)); } } else if (d <= 0) S.nx = false; }
      else if (tr.st === 'dwell') { S.ap = false; S.nx = false; if (!S.arr) { S.arr = true; if (onPl && tr.wait > 16.5) annPush(anAt(jrArr(q), E.vol)); }
        if (!S.mel && tr.wait <= 13.5) { S.mel = true; if (can && tr.wait > 11.5) { var ml = annMel(q.mel, E.vol * 0.9); annPush(anAt(jrDoors(q, Math.max(0.5, ml - 0.4)), E.vol)); } } } }); };
  /* where she stands, for the station's own sounds (the gates know when she passes); the recordings made ready */
  var _tkTickAX = tkTick; tkTick = function (dt) { var r = _tkTickAX.apply(this, arguments); try { if (TK && TK.T && TK.id === 'tokyo' && tkWant) { var L0 = TK.T.toL(pos.x, pos.z); TK.T.me = [L0[0], L0[1], pos.y - TK.T.Y]; okvLoad(); } } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  var _annSayAX = window.ISLE_x.annSay; window.ISLE_x.annSay = function (kind, i) { if (TK && TK.T && TK.id === 'tokyo' && (kind === 'nx' || kind === 'ar')) { var a = anAt(kind === 'nx' ? jrNext(AN_JR[i || 0]) : jrArr(AN_JR[i || 0]), 0.8); a.ttl = 30; a.delay = 0; annPush(a); return a.key; } return _annSayAX.apply(this, arguments); };
  window.ISLE_x.okv = function () { return { st: OKV.st, have: Object.keys(OKV.buf).length, want: OKV.data ? Object.keys(OKV.data).length : 0, lines: Object.keys(OKV_T).length, played: OKV.played }; };
