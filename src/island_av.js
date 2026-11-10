/* ===== [island_av.js] ===== */
  /* ================= (v76) the stations speak =================
     At JR Okachimachi and at the four high-speed rail stations the public address now says what a station's says:
     · JR Okachimachi, in the form of the Tokyo area's automatic announcements: a train coming in («まもなく、3番線に、山手線、上野・池袋方面行きが
       まいります。危ないですから…»), in Japanese and then in English; a departure tune, then «3番線、ドアが閉まります。ご注意ください。»;
       the voice changes with the track (1 and 3 one voice, 2 and 4 the other), as it does there; the numbers are the station's own
       (1 Keihin-Tohoku for Tokyo and Yokohama, 2 Yamanote outer loop, 3 Yamanote inner loop, 4 Keihin-Tohoku for Omiya); now and then a word about walking with a phone;
     · the high-speed rail's stations (Taipei, Taichung, Tainan, Zuoying): a chime, then a train coming in (the platform, where it goes, the yellow
       line), boarding (the train's number, the gap), about to leave — in the Mandarin of Taiwan and then in English; now and then a word about
       the escalators and about queuing. The platform, the number and the destination are the ones the station's own boards show.
     What is said follows the trains that really run in the scene (the platform nearest to the listener first), one announcement at a time.
     The words are written here after the form such announcements take: nothing is taken from the railways' recordings, and the chime and the
     departure tunes are this project's own. The voice is the device's own (Web Speech API) — Japanese, Mandarin of Taiwan (never Cantonese or
     another accent in its place), English; where the device has no such voice, the chime and the line on screen remain.
     A line on screen gives each announcement in the reader's language, with the words as spoken under it. The island's mute switch reaches it. ================= */
  var ANX = { zh: { tag: '車站廣播' }, en: { tag: 'Station announcement' }, ja: { tag: '構内放送' } };
  var AN_AT = { tokyo: { zh: 'JR 御徒町站', en: 'JR Okachimachi', ja: 'JR 御徒町駅' }, taipei: { zh: '高鐵台北站', en: 'THSR Taipei', ja: '台湾高鉄 台北駅' }, taichung: { zh: '高鐵台中站', en: 'THSR Taichung', ja: '台湾高鉄 台中駅' },
    tainan: { zh: '高鐵台南站', en: 'THSR Tainan', ja: '台湾高鉄 台南駅' }, zuoying: { zh: '高鐵左營站', en: 'THSR Zuoying', ja: '台湾高鉄 左営駅' } };
  /* JR Okachimachi, by the track's place across the viaduct (T.TRK, east to west): the platform's number, whose voice, which tune, the line, where it goes
     (sp: as it is to be spoken, where a voice could stumble) */
  var AN_JR = [
    { n: 1, v: 'f', mel: 0, line: { ja: '京浜東北線', sp: '京浜東北線', en: 'Keihin-Tohoku Line', zh: '京濱東北線' }, to: { ja: '東京・横浜方面', sp: '東京、横浜方面', en: 'Tokyo and Yokohama', zh: '東京・橫濱' } },
    { n: 2, v: 'm', mel: 1, line: { ja: '山手線', sp: 'やまのて線', en: 'Yamanote Line', zh: '山手線' }, to: { ja: '東京・品川方面', sp: '東京、品川方面', en: 'Tokyo and Shinagawa', zh: '東京・品川' } },
    { n: 3, v: 'f', mel: 0, line: { ja: '山手線', sp: 'やまのて線', en: 'Yamanote Line', zh: '山手線' }, to: { ja: '上野・池袋方面', sp: '上野、池袋方面', en: 'Ueno and Ikebukuro', zh: '上野・池袋' } },
    { n: 4, v: 'm', mel: 1, line: { ja: '京浜東北線', sp: '京浜東北線', en: 'Keihin-Tohoku Line', zh: '京濱東北線' }, to: { ja: '大宮方面', sp: '大宮方面', en: 'Omiya', zh: '大宮' } }];
  var AN_ST = { '左營': { en: 'Zuoying', ja: '左営' }, '南港': { en: 'Nangang', ja: '南港' }, '台中': { en: 'Taichung', ja: '台中' }, '台北': { en: 'Taipei', ja: '台北' }, '台南': { en: 'Tainan', ja: '台南' } };
  var AN_ZH = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function anDigits(n, sep) { return String(n).split('').map(function (d) { return sep == null ? AN_ZH[+d] : d; }).join(sep == null ? '' : sep); }

  /* ---------- what is said ---------- */
  function jrIn(q) { var n = q.n, ja = 'まもなく、' + n + '番線に、' + q.line.ja + '、' + q.to.ja + '行きがまいります。危ないですから、黄色い点字ブロックまでお下がりください。', en = 'The ' + q.line.en + ' train bound for ' + q.to.en + ' will soon arrive at track ' + n + '. Please stand behind the yellow warning blocks.';
    return { key: 'jr.in.' + n, pri: 3, ttl: 12, cue: 1, src: { l: 'ja', t: ja }, cap: { ja: ja, en: en, zh: n + ' 號月台，' + q.line.zh + '往' + q.to.zh + '方向的電車即將進站。為了安全，請退到黃色導盲磚後方。' },
      segs: [{ l: 'ja', v: q.v, t: 'まもなく、' + n + '番線に、' + q.line.sp + '、' + q.to.sp + 'ゆきが、まいります。' }, { l: 'ja', v: q.v, t: '危ないですから、黄色い点字ブロックまで、お下がりください。' }, { l: 'en', v: q.v, opt: 1, t: en }] }; }
  function jrDoors(q) { var n = q.n, ja = n + '番線、ドアが閉まります。ご注意ください。';
    return { key: 'jr.go.' + n, pri: 2.5, delay: 4.2, ttl: 4.6, src: { l: 'ja', t: ja }, cap: { ja: ja, en: 'Track ' + n + ': the doors are closing. Please take care.', zh: n + ' 號月台，車門即將關閉，請小心。' }, segs: [{ l: 'ja', v: q.v, t: ja }] }; }
  function jrCare() { var ja = 'お客さまにお願いいたします。駅構内やホームでの歩きスマホは、危険ですのでおやめください。', en = 'Attention, please. For your safety, please do not use your smartphone while walking in the station.';
    return { key: 'jr.care', pri: 0, ttl: 8, cue: 1, src: { l: 'ja', t: ja }, cap: { ja: ja, en: en, zh: '敬請各位旅客配合：在站內與月台上邊走邊滑手機十分危險，請勿這麼做。' }, segs: [{ l: 'ja', v: 'f', t: 'お客さまにお願いいたします。' }, { l: 'ja', v: 'f', t: '駅構内やホームでの歩きスマホは、危険ですので、おやめください。' }, { l: 'en', v: 'f', opt: 1, t: en }] }; }
  /* the high-speed rail: the platform (the track's own digit), the destination and the number as the platform's board has them */
  function hsOf(T, tr) { var p = String(tr.track || '').charAt(1) || '1', B = T.brd && T.brd['p' + p], d = B && B.dest ? B.dest(tr) : p === '1' ? (tr.no % 2 ? '台中' : '左營') : '南港'; d = String(d || '').replace(/臺/g, '台'); var end = /到站/.test(d); d = d.split(/[\s·]/)[0] || '南港';
    return { p: p, pz: AN_ZH[+p] || p, zh: d, en: (AN_ST[d] || {}).en || d, ja: (AN_ST[d] || {}).ja || d, end: end, no: tr.no }; }
  function hsIn(D) { var zh = D.end ? '各位旅客您好，第' + D.pz + '月台，列車即將進站，請勿跨越月台黃色警戒線。' : '各位旅客您好，第' + D.pz + '月台，往' + D.zh + '的列車即將進站，請勿跨越月台黃色警戒線。',
      en = D.end ? 'Attention, please. A train is arriving at platform ' + D.p + '. Please stay behind the yellow line.' : 'Attention, please. The train bound for ' + D.en + ' is arriving at platform ' + D.p + '. Please stay behind the yellow line.';
    return { key: 'hs.in.' + D.p + D.no, pri: 3, ttl: 14, chime: 1, src: { l: 'zh', t: zh }, cap: { zh: zh, en: en, ja: D.end ? 'まもなく、' + D.p + '番ホームに列車がまいります。黄色い線の内側でお待ちください。' : 'まもなく、' + D.p + '番ホームに' + D.ja + '行きの列車がまいります。黄色い線の内側でお待ちください。' }, segs: [{ l: 'zh', v: 'f', t: zh }, { l: 'en', v: 'f', opt: 1, t: en }] }; }
  function hsBoard(D) { var zh = anDigits(D.no) + '車次，往' + D.zh + '的列車，現在開放上車。上下車時，請留意月台間隙。', en = 'Train ' + anDigits(D.no, ' ') + ', bound for ' + D.en + ', is now boarding. Please mind the gap between the train and the platform.';
    return { key: 'hs.on.' + D.p + D.no, pri: 2, ttl: 8, chime: 1, src: { l: 'zh', t: D.no + ' 車次，往' + D.zh + '的列車，現在開放上車。上下車時，請留意月台間隙。' }, cap: { en: 'Train ' + D.no + ', bound for ' + D.en + ', is now boarding. Please mind the gap between the train and the platform.', ja: D.no + '号、' + D.ja + '行きは、ただいまご乗車いただけます。列車とホームのすき間にご注意ください。' }, segs: [{ l: 'zh', v: 'f', t: zh }, { l: 'en', v: 'f', opt: 1, t: en }] }; }
  function hsGo(D) { var zh = '往' + D.zh + '的列車即將開車，車門關閉時，請勿強行上下車。', en = 'The train bound for ' + D.en + ' is about to depart. Please do not rush for the doors.';
    return { key: 'hs.go.' + D.p + D.no, pri: 2.5, ttl: 4, src: { l: 'zh', t: zh }, cap: { zh: zh, en: en, ja: D.ja + '行きの列車がまもなく発車します。駆け込み乗車はおやめください。' }, segs: [{ l: 'zh', v: 'f', t: zh }, { l: 'en', v: 'f', opt: 1, t: en }] }; }
  function hsCare(k) { var S = [['各位旅客您好，搭乘電扶梯時，請緊握扶手、站穩踏階，並留意隨身行李。', 'When riding the escalators, please hold the handrail, stand firm, and take care of your belongings.', 'エスカレーターをご利用の際は、手すりにつかまり、お手回り品にご注意ください。'],
      ['各位旅客您好，候車時請在月台黃色警戒線後方排隊，並禮讓下車旅客先行。', 'While waiting, please queue behind the yellow line, and let passengers alight first.', 'お待ちの際は黄色い線の後ろに並び、降りるお客さまを先にお通しください。']][k % 2];
    return { key: 'hs.care', pri: 0, ttl: 8, chime: 1, src: { l: 'zh', t: S[0] }, cap: { zh: S[0], en: S[1], ja: S[2] }, segs: [{ l: 'zh', v: 'f', t: S[0] }, { l: 'en', v: 'f', opt: 1, t: S[1] }] }; }

  /* ---------- the voice: the device's own ---------- */
  var SPV = { ja: { re: /^ja(-|$)/i, tag: 'ja-JP', f: /Nanami|Kyoko|O-?ren|Haruka|Ayumi|Sayaka|Aoi|Mayu|Shiori|Google 日本語/i, m: /Keita|Otoya|Hattori|Ichiro|Daichi|Naoki/i, rate: 1, cps: 6.2 },
    zh: { re: /^(zh|cmn)(-Hant)?-TW\b/i, tag: 'zh-TW', f: /HsiaoChen|HsiaoYu|Google 國語|Mei-?Jia|美佳|Yating|Hanhan/i, m: /YunJhe|Zhiwei/i, rate: 0.95, cps: 4.2 },
    en: { re: /^en(-|$)/i, tag: 'en-US', f: /Aria|Jenny|Samantha|Ava\b|Allison|Susan|Zira|Google US English|\bFemale\b|Karen|Moira|Tessa|Serena|Kate|Hazel|Sonia|Libby|Michelle/i, m: /\bGuy\b|Daniel|Alex\b|David|Mark\b|\bMale\b|George|Ryan|Aaron|Arthur|Oliver/i, rate: 0.96, cps: 14 } };
  var SP_BAD = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Deranged|Hysterical|Junior|Ralph|Fred|Kathy|Princess/i, SP_LOW = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)\b/i;
  var ANN = { t: 0, list: [], cur: null, gap: 0, idle: 0, genT: 45 + Math.random() * 30, genK: Math.floor(Math.random() * 2), log: [], fails: 0, ok: null, okT: 0, pick: {}, city: null, sync: 0, n: 0, said: 0, u: null, bus: null };
  function spSS() { try { return window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null; } catch (e) { return null; } }
  function spInit() { var SS = spSS(); if (!SS || ANN.spOn) return; ANN.spOn = true; try { SS.getVoices(); if (SS.addEventListener) SS.addEventListener('voiceschanged', function () { ANN.pick = {}; }); } catch (e) {} }
  /* the voice for a language: one made for it, the most natural the device has; undefined where the device does not say which voices it has
     (it is then asked by the language alone), null where it has voices but none for this language */
  function spPick(l, sex) { var key = l + sex; if (key in ANN.pick) return ANN.pick[key]; var SS = spSS(), P = SPV[l], vs = []; try { vs = (SS && SS.getVoices()) || []; } catch (e) {} if (!vs.length) return undefined;
    var best = null, bs = -1e9; for (var i = 0; i < vs.length; i++) { var v = vs[i], lg = String(v.lang || '').replace(/_/g, '-'), n = String(v.name || ''); if (!P.re.test(lg) || SP_BAD.test(n)) continue;
      var isM = P.m.test(n), isF = !isM && P.f.test(n), s = (/Natural|Neural|Premium|Enhanced|Siri/i.test(n) ? 100 : 0) + (SP_LOW.test(n) ? -60 : 0) + (sex === 'm' ? (isM ? 60 : isF ? 0 : 10) : (isF ? 60 : isM ? -30 : 10)) + (/Google/i.test(n) ? 30 : 0) + (l === 'en' ? (/^en-US/i.test(lg) ? 12 : /^en-GB/i.test(lg) ? 8 : 0) : 0) + (v.default ? 3 : 0) + (v.localService ? 2 : 0);
      if (s > bs) { bs = s; best = { v: v, male: isM, lang: lg }; } }
    ANN.pick[key] = best; return best; }
  function spDur(s) { return s.t.length / (SPV[s.l].cps * SPV[s.l].rate) + 0.8; }
  /* one sentence; done(why, started). A voice that never starts (a browser that holds speech back, a missing engine) is noticed and, after a few, no longer asked for a while */
  function spSay(s, vol, done) { var SS = spSS(); if (!SS || (ANN.ok === false && ANN.t < ANN.okT)) return done('off', false); var P = SPV[s.l], pk = spPick(s.l, s.v); if (pk === null) return done('novoice', false);
    var u, fin = false, started = false, t1 = 0, t2 = 0; function end(why) { if (fin) return; fin = true; clearTimeout(t1); clearTimeout(t2); if (ANN.u === u) ANN.u = null; if (started) { ANN.fails = 0; ANN.ok = true; ANN.said++; } else if (why !== 'stop') { ANN.fails++; if (ANN.fails >= 3) { ANN.ok = false; ANN.okT = ANN.t + 150; ANN.fails = 0; } } done(why, started); }
    try { u = new window.SpeechSynthesisUtterance(s.t); u.lang = pk ? pk.lang : P.tag; if (pk) u.voice = pk.v; u.volume = Math.max(0, Math.min(1, vol)); u.rate = P.rate; u.pitch = s.v === 'm' && !(pk && pk.male) ? 0.84 : 1;
      u.onstart = function () { started = true; }; u.onend = function () { end('end'); }; u.onerror = function (e) { end('error:' + ((e && e.error) || '')); }; ANN.u = u; u._stop = function () { end('stop'); };
      if (SS.speaking && !started && SS.paused) { try { SS.resume(); } catch (e3) {} } SS.speak(u); } catch (e) { return end('throw'); }
    t1 = setTimeout(function () { if (!started && !fin) { try { SS.cancel(); } catch (e) {} end('nostart'); } }, 3600);
    t2 = setTimeout(function () { if (!fin) { try { SS.cancel(); } catch (e) {} end('timeout'); } }, (spDur(s) * 1.9 + 4) * 1000); }
  /* a phone's browser lets a page speak only once a finger has asked for it: the first touch says nothing, and opens the way */
  var AN_EV = ['pointerup', 'touchend', 'click', 'keydown'];
  function spUnlock() { if (ANN.unl || !isOpen) return; ANN.unl = true; AN_EV.forEach(function (ev) { document.removeEventListener(ev, spUnlock, true); }); var SS = spSS(); if (!SS) return; try { spInit(); var u = new window.SpeechSynthesisUtterance(''); u.volume = 0; SS.speak(u); } catch (e) {} }
  AN_EV.forEach(function (ev) { document.addEventListener(ev, spUnlock, { capture: true, passive: true }); });

  /* ---------- the chime and the departure tunes (this project's own), through the island's sound ---------- */
  function annBus(vol) { var a = aulPeek(); if (!a || !a.ctx || a.ctx.state !== 'running' || !a.dest) return null; var c = a.ctx; if (!ANN.bus || ANN.bus.c !== c) { /* a station's loudspeakers: a narrowed band, and the hall answering */
      var g = c.createGain(), bp = c.createBiquadFilter(), dl = c.createDelay(0.5), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.4; dl.delayTime.value = 0.137; fb.gain.value = 0.34; lp.type = 'lowpass'; lp.frequency.value = 2300; wet.gain.value = 0.45;
      g.connect(bp); bp.connect(a.dest); bp.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(a.dest); ANN.bus = { c: c, g: g }; }
    ANN.bus.g.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), c.currentTime, 0.02); return ANN.bus; }
  function annBell(B, f, t0, dur, v) { var c = B.c; [[1, 1], [2, 0.3], [3.01, 0.11], [4.2, 0.05]].forEach(function (h) { var o = c.createOscillator(), g = c.createGain(), d = dur / (0.6 + h[0] * 0.4); o.type = 'sine'; o.frequency.value = f * h[0]; g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v * h[1], t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(g); g.connect(B.g); o.start(t0); o.stop(t0 + d + 0.05); }); }
  function anHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  /* the chime before an announcement at the high-speed rail's stations: four notes rising; returns how long it takes */
  function annChime(vol) { var B = annBus(vol); if (!B) return 0; var t = B.c.currentTime + 0.05; [79, 84, 88, 91].forEach(function (m, k) { annBell(B, anHz(m), t + k * 0.3, 1.3, 0.085); }); return 1.7; }
  /* a soft two-note call, where no voice can speak the line */
  function annCue(vol) { var B = annBus(vol); if (!B) return 0; var t = B.c.currentTime + 0.05; annBell(B, anHz(81), t, 1.0, 0.08); annBell(B, anHz(77), t + 0.36, 1.3, 0.08); return 1.2; }
  /* the departure tunes: two short ones of this project's own — broken chords on a bell, four bars */
  var AN_MEL = [{ n: [78, 81, 86, 81, 79, 83, 88, 83, 81, 85, 90, 88, 86, 90, 93, 98], b: [62, 64, 57, 62] }, { n: [82, 77, 74, 77, 79, 75, 72, 75, 77, 74, 70, 74, 72, 77, 81, 82], b: [58, 60, 58, 53] }];
  function annMel(k, vol) { var B = annBus(vol); if (!B) return 0; var M2 = AN_MEL[k % 2], t = B.c.currentTime + 0.05, st = 0.215; M2.n.forEach(function (m, i) { annBell(B, anHz(m), t + i * st, i === 15 ? 1.6 : 0.75, i % 4 === 0 ? 0.075 : 0.058); }); M2.b.forEach(function (m, i) { annBell(B, anHz(m), t + i * 4 * st, 1.1, 0.05); }); return 16 * st + 0.9; }

  /* ---------- the line on screen ---------- */
  var AN_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4z" fill="currentColor"/><path d="M15.2 8.6a4.6 4.6 0 0 1 0 6.8M17.8 6.2a8 8 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  function annCap(a) { var x = $('isAnn'); if (!a) { if (x) x.classList.remove('is-on'); return; } if (!root) return; if (!x) { x = document.createElement('div'); x.id = 'isAnn'; x.className = 'isle__ann'; x.setAttribute('aria-hidden', 'true'); root.appendChild(x); }
    var L = String(typeof LANG === 'string' ? LANG : 'zh').slice(0, 2), X = ANX[L] || ANX.zh, W2 = AN_AT[a.at] || {}, main = a.cap[L] || a.src.t, orig = a.src.l !== L ? a.src.t : '';
    x.innerHTML = '<small>' + AN_ICON + '<span>' + esc(X.tag + (W2[L] ? ' · ' + W2[L] : '')) + '</span></small><b>' + esc(main) + '</b>' + (orig ? '<i lang="' + (a.src.l === 'zh' ? 'zh-Hant' : a.src.l) + '">' + esc(orig) + '</i>' : ''); x.classList.remove('is-on'); void x.offsetWidth; x.classList.add('is-on'); }

  /* ---------- one announcement at a time ---------- */
  function annPush(a) { a.t0 = ANN.t; a.due = ANN.t + (a.delay || 0); a.end = a.due + (a.ttl || 6); ANN.list = ANN.list.filter(function (b) { return b.key !== a.key; }); ANN.list.push(a); if (ANN.list.length > 4) { ANN.list.sort(function (p, q) { return q.pri - p.pri; }); ANN.list.length = 4; } }
  function annNext() { var best = null; ANN.list = ANN.list.filter(function (a) { return a.end > ANN.t; }); ANN.list.forEach(function (a) { if (a.due <= ANN.t && (!best || a.pri > best.pri)) best = a; }); if (!best) return; ANN.list.splice(ANN.list.indexOf(best), 1); annPlay(best); }
  function annPlay(a) { var me = { a: a, i: 0, spoke: 0, dead: false, tm: 0, why: [] }; ANN.cur = me; ANN.n++; ANN.idle = 0; var rec = { key: a.key, at: a.at, vol: +a.vol.toFixed(2), src: a.src.t, segs: [], cap: a.vol >= 0.3 }; ANN.log.push(rec); if (ANN.log.length > 40) ANN.log.shift();
    var pre = a.chime ? annChime(a.vol) : 0; if (rec.cap) annCap(a);
    function done() { if (me.dead) return; me.dead = true; ANN.cur = null; ANN.gap = ANN.list.length ? 0.7 : 2.4; /* another one waits: a breath, no more */ rec.done = 1; annCap(null); }
    function step() { if (me.dead) return; var s = a.segs[me.i++]; if (!s) { rec.spoke = me.spoke; if (me.spoke) return done(); /* no voice here: the call, and the line stays for the time it takes to read */ if (a.cue) annCue(a.vol); me.tm = setTimeout(done, Math.max(4200, Math.min(9000, a.src.t.length * 150))); return; }
      if (s.opt && (ANN.list.some(function (b) { return b.due <= ANN.t + 1.5 && b.pri >= a.pri; }) || (s.skip && s.skip()))) return step(); /* the second language is left out while another announcement of the same weight waits (another train coming in) */
      spSay(s, a.vol, function (why, started) { rec.segs.push([s.l, started ? 1 : 0, why]); if (me.dead) return; if (started) me.spoke++; else if (/^(nostart|throw|off)/.test(why)) me.i = a.segs.length; /* speech is held back here: no use asking for the rest */ me.tm = setTimeout(step, started ? 320 : 0); }); }
    me.stop = function () { if (me.dead) return; me.dead = true; clearTimeout(me.tm); rec.cut = 1; };
    me.tm = setTimeout(step, pre * 1000); }
  function annStop() { ANN.list.length = 0; if (ANN.cur) { ANN.cur.stop(); ANN.cur = null; } if (ANN.u) { var u = ANN.u; if (u._stop) u._stop(); try { var SS = spSS(); if (SS) SS.cancel(); } catch (e) {} ANN.u = null; } annCap(null); }

  /* ---------- who hears what ---------- */
  function anTrk(T, tr) { var K2 = T.TRK || []; for (var i = 0; i < K2.length; i++) if (Math.abs(tr.x - K2[i]) < 0.6) return i; return -1; }
  /* at Okachimachi: on a platform (which island), under them in the concourse, or out in the street beside the viaduct — fainter with the distance */
  function anEarJR(T, c) { var L = T.toL(c.x, c.z), cx = L[0], cz = L[1], cy = c.y - T.Y, A = 1e9, B = -1e9; T.trains.forEach(function (tr) { var h = tr.stopZ, e = tr.stopZ - tr.dir * tr.len; A = Math.min(A, h, e); B = Math.max(B, h, e); });
    var yp = T.Y_PLAT != null ? T.Y_PLAT : 7.5, dH = Math.hypot(Math.max(0, Math.abs(cx) - 12.5), Math.max(0, A - cz, cz - B)), d = Math.hypot(dH, Math.abs(cy - yp) * 0.6), k = Math.max(0, Math.min(1, 1 - (d - 8) / 56)), inS = dH < 0.5;
    return { vol: (inS ? 0.85 : 0.62) * k, side: inS && cy > yp - 1.4 ? (cx > 0 ? 1 : -1) : 0, inS: inS }; }
  function anEarHS(T, c) { var L = T.toL(c.x, c.z), cx = L[0], cz = L[1], cy = c.y - T.Y, under = !T.elev && cy < -0.6, inSt = T.inStFn ? T.inStFn(cx, cz, cy) : Math.abs(cx) < T.SX && Math.abs(cz) < T.SZ && cy < 14; var E = { on: !!(inSt || under), cx: cx, cz: cz, cy: cy }; if (!E.on) E.on = T.trains.some(function (tr) { if (tr.line && tr.line !== 'hsr') return false; var ca = tr.ns ? -(cz - (tr.oz || 0)) : cx, cl = tr.ns ? cx : cz, rl = tr.rail != null ? tr.rail : T.RAIL; return Math.abs(ca - (tr.stopX || 0)) < tr.len / 2 + 12 && Math.abs(tr.zt - cl) < 26 && cy - rl > -9 && cy - rl < 9; }); return E; }
  /* is this train's platform the one the listener stands on (or right beside) */
  function anNear(T, tr, E) { var ca = tr.ns ? -(E.cz - (tr.oz || 0)) : E.cx, cl = tr.ns ? E.cx : E.cz, rl = tr.rail != null ? tr.rail : T.RAIL, da = Math.max(0, Math.abs(ca - (tr.stopX || 0)) - tr.len / 2), dy = E.cy - rl, lvl = dy > 0.5 && dy < 6.6; return { lvl: lvl, near: lvl && da < 30 && Math.abs(tr.zt - cl) < 9.5 }; }
  function anScanJR(T, E, quiet) { T.trains.forEach(function (tr) { var q = AN_JR[anTrk(T, tr)]; if (!q) return; var S = tr._ann || (tr._ann = { ap: false, mel: false }), d = (tr.stopZ - tr.z) * tr.dir, can = !quiet && E.vol >= 0.12 && (E.side === 0 || (q.n <= 2 ? -1 : 1) === E.side);
      if (tr.st === 'run') { S.mel = false; if (d > 0 && d < 150) { if (!S.ap) { S.ap = true; if (can && d > 60) annPush(anAt(jrIn(q), E.vol)); } } else S.ap = false; }
      else if (tr.st === 'dwell') { S.ap = false; if (!S.mel && tr.wait <= 10.5) { S.mel = true; if (can && tr.wait > 8.5) { annMel(q.mel, E.vol * 0.9); annPush(anAt(jrDoors(q), E.vol)); } } } }); }
  function anScanHS(T, E, quiet) { T.trains.forEach(function (tr) { if (tr.line && tr.line !== 'hsr') return; var S = tr._ann || (tr._ann = { st: tr.st, open: !!tr.open, dep: false }), N = anNear(T, tr, E), vol = N.lvl ? 0.82 : 0.6, can = !quiet && E.on;
      if (tr.st !== S.st) { if (tr.st === 'in' && can) { var a = anAt(hsIn(hsOf(T, tr)), vol); if (N.near) a.pri += 0.4; annPush(a); } if (tr.st !== 'dwell') S.dep = false; S.st = tr.st; }
      if (!!tr.open !== S.open) { S.open = !!tr.open; if (S.open && tr.st === 'dwell' && can && !hsOf(T, tr).end && (N.near || (!ANN.cur && !ANN.list.length && Math.random() < 0.4))) annPush(anAt(hsBoard(hsOf(T, tr)), vol)); }
      if (tr.st === 'dwell' && tr.open && !S.dep && tr.wait <= 15) { S.dep = true; if (can && N.near && tr.wait > 9 && !hsOf(T, tr).end) annPush(anAt(hsGo(hsOf(T, tr)), vol)); } }); }
  function anAt(a, vol) { a.at = TK.id; a.vol = vol; if (!a.cap[a.src.l]) a.cap[a.src.l] = a.src.t; return a; }
  function annTick(dt) { var on = !!(TK && TK.T && TK.T.trains && tkWant && !document.hidden && !tkMuted() && (AUL.ok || aulRunning())); if (!on) { if (ANN.cur || ANN.list.length || ANN.u) annStop(); ANN.city = null; return; }
    var T = TK.T, jr = TK.id === 'tokyo', hs = !jr && !!AN_AT[TK.id]; if (!jr && !hs) { if (ANN.cur || ANN.list.length) annStop(); return; } spInit(); ANN.t += dt;
    if (ANN.city !== TK.id) { /* just arrived: what the trains are doing is taken in before anything is said */ annStop(); ANN.city = TK.id; ANN.sync = 1.2; ANN.gap = 2; }
    var quiet = ANN.sync > 0 || !!fight; if (ANN.sync > 0) ANN.sync -= dt; var E, inSt;
    var C0 = ANN.at || cam.position; if (jr) { E = anEarJR(T, C0); inSt = E.inS; anScanJR(T, E, quiet); } else { E = anEarHS(T, C0); inSt = E.on; anScanHS(T, E, quiet); var S0 = TKM && TKM.snd ? TKM.snd() : null; if (S0 && S0.chimeT < 1e8) S0.chimeT = 1e9; /* the chime now belongs to the announcements */ }
    if (ANN.cur) return; ANN.idle += dt; if (ANN.gap > 0) { ANN.gap -= dt; return; }
    /* now and then, in the station, a word about safety */ if (inSt && !quiet) { ANN.genT -= dt; if (ANN.genT <= 0 && !ANN.list.length && ANN.idle > 8) { ANN.genT = 170 + Math.random() * 90; annPush(anAt(jr ? jrCare() : hsCare(ANN.genK++), jr ? E.vol : 0.6)); } }
    annNext(); }
  var _tkTickAV = tkTick; tkTick = function (dt) { var r = _tkTickAV.apply(this, arguments); try { annTick(dt || 0); } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  var _closeAV = close; close = function () { try { annStop(); ANN.city = null; } catch (e) {} return _closeAV.apply(this, arguments); };
  /* for the tests: what was announced, what is on screen, which voices were chosen; say(kind, i) puts one announcement in the queue */
  window.ISLE_x.ann = function () { var x = $('isAnn'), pk = {}; ['ja', 'zh', 'en'].forEach(function (l) { ['f', 'm'].forEach(function (s) { var p = spPick(l, s); pk[l + s] = p === undefined ? '?' : p ? p.v.name : null; }); });
    return { city: ANN.city, ok: ANN.ok, n: ANN.n, said: ANN.said, cur: ANN.cur ? ANN.cur.a.key : null, list: ANN.list.map(function (a) { return a.key; }), log: ANN.log.slice(-12), cap: x && x.classList.contains('is-on') ? x.textContent : '', pick: pk, t: +ANN.t.toFixed(1), genT: +ANN.genT.toFixed(1), bus: !!ANN.bus }; };
  window.ISLE_x.annSay = function (kind, i) { if (!TK || !TK.T) return null; var T = TK.T, a = null, tr; if (TK.id === 'tokyo') { var q = AN_JR[i || 0]; a = kind === 'go' ? jrDoors(q) : kind === 'care' ? jrCare() : jrIn(q); if (kind === 'go') { a.delay = 0; annMel(q.mel, 0.8); } }
    else { tr = T.trains[i || 0]; var D = hsOf(T, tr); a = kind === 'on' ? hsBoard(D) : kind === 'go' ? hsGo(D) : kind === 'care' ? hsCare(i || 0) : hsIn(D); } a = anAt(a, 0.8); a.ttl = 30; annPush(a); return a.key; };
  /* ================= (v76) the title's picture kept steady =================
     The title's lens stands on the sidewalk across the side street, where people walk: one of them would pass straight through it, a head
     filling the picture. Now the lens is a little higher (island_h.js), and anyone within a few steps of it is not drawn while the title is up —
     they come into the picture from its lower edge, already a few metres away. ================= */
  var TTL = { hid: [] };
  function titlePeds() { var T3 = TK && TK.T, on = !!(T3 && fall && fall.tk && fall.phase === 'title'); if (!on) { if (TTL.hid.length) { TTL.hid.forEach(function (r) { r.visible = true; }); TTL.hid.length = 0; } return; }
    var L0 = T3.toL(cam.position.x, cam.position.z); (T3.peds || []).forEach(function (p) { var r = p.A && p.A.root; if (!r || p.st === 'still') return; var near = Math.hypot(r.position.x - L0[0], r.position.z - L0[1]) < 2.7, i = TTL.hid.indexOf(r); if (near && i < 0) { r.visible = false; TTL.hid.push(r); } else if (!near && i >= 0) { r.visible = true; TTL.hid.splice(i, 1); } }); }
  var _tkTickAV2 = tkTick; tkTick = function (dt) { var r = _tkTickAV2.apply(this, arguments); try { titlePeds(); } catch (e) { if (window.ISLE_TEST) throw e; } return r; };
  /* ================= (v76) in the rain, Max holds an umbrella over the software company's account manager =================
     She sits out in the open, on the lawn by Taipei station. When the city's weather turns to rain, Max stands at her side — half a step to
     her left, turned a little towards her — and holds a wide umbrella over her and her things; when the rain stops he is gone again.
     He only holds the umbrella: nothing is said here. ================= */
  var OLR = { A: null, u: null, V: new THREE.Vector3() };
  function olrTick(dt) { if (typeof OLW === 'undefined' || !OLW.A || !TK || TK.id !== 'taipei' || !CITYW) return; var rain = window.ISLE_RAIN != null ? window.ISLE_RAIN : (TK.T.rain || 0), want = rain > 0.06 && !!(OLW.G && OLW.G.visible);
    if (!OLR.A) { if (!want || typeof MAX === 'undefined' || !MAX.build) return; var A = MAX.build({ seed: 93, outfit: window.ISLE_maxOutfit ? window.ISLE_maxOutfit() : 'shirt' }), H = OLW.A.root, ry = H.rotation.y, side = 0.72, back = 0.16;
      A.root.scale.setScalar(A.isAnime ? 1.16 : 0.86); A.root.position.set(H.position.x + Math.cos(ry) * side - Math.sin(ry) * back, H.position.y - 0.022, H.position.z - Math.sin(ry) * side - Math.cos(ry) * back); A.root.rotation.y = ry - 0.22; H.parent.add(A.root); LUNA.setMode(A, 'idle'); if (TK.T.low) A.root.traverse(function (m) { if (m.isMesh) m.castShadow = false; });
      var u = umbrella('navy'); u.scale.setScalar(1.32); A.root.add(u); OLR.A = A; OLR.u = u; }
    var M2 = OLR.A; if (M2.root.visible !== want) M2.root.visible = want; OLR.u.visible = want; if (!want) { if (M2.holdR === UMBPOSE) M2.holdR = null; return; }
    M2.holdR = UMBPOSE; M2.root.getWorldPosition(OLR.V); var dc = Math.hypot(cam.position.x - OLR.V.x, cam.position.z - OLR.V.z); LUNA.update(M2, dt, { look: -0.35 }); if (MAX.lod) MAX.lod(M2, dc);
    /* the shaft rises from his right hand — the hand next to her — and leans over her */ var hp = M2.armR && M2.armR.wr ? M2.armR.wr.getWorldPosition(new THREE.Vector3()) : null; if (hp) { M2.root.worldToLocal(hp); OLR.u.position.set(hp.x, hp.y - 0.02, hp.z); } else OLR.u.position.set(-0.22, 1.05, 0.12); OLR.u.rotation.set(0, 0, 0.3); }
  var _extraTickAV = extraTick; extraTick = function (dt, ts) { _extraTickAV(dt, ts); try { olrTick(dt); } catch (e) { if (window.ISLE_TEST) throw e; } };
  window.ISLE_x.olr = function () { if (!OLR.A) return { built: false }; var a = OLR.A.root.getWorldPosition(new THREE.Vector3()), h = OLW.A.root.getWorldPosition(new THREE.Vector3()), can = OLR.u.children[0].getWorldPosition(new THREE.Vector3()), hd = OLW.A.head ? OLW.A.head.getWorldPosition(new THREE.Vector3()) : h;
    return { built: true, on: OLR.A.root.visible && OLR.u.visible, gap: +Math.hypot(a.x - h.x, a.z - h.z).toFixed(2), canOverHer: +Math.hypot(can.x - hd.x, can.z - hd.z).toFixed(2), canAbove: +(can.y - hd.y).toFixed(2), canR: +(0.5 * OLR.u.getWorldScale(new THREE.Vector3()).x).toFixed(2), hold: OLR.A.holdR === UMBPOSE }; };
  if (window.ISLE_TEST) window.ISLE_x.annAt = function (l) { if (!l || !TK) { ANN.at = null; return null; } var w = TK.T.toW(l[0], 0, l[1]); ANN.at = { x: w.x, y: TK.T.Y + l[2], z: w.z }; return ANN.at; }; /* the listener put somewhere in the station (local x, z, height) */
