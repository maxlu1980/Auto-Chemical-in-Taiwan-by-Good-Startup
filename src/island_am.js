/* ===== [island_am.js] ===== */
  /* ================= (v63) the opening flown by Luna on her chemistry glider, with the birds of Taiwan beside her =================
     The film now begins by itself when the world is ready. If the browser has not yet allowed sound, it plays silent with a small “tap for
     sound”, and at the first touch the score comes in for what is left of the film. Luna rides the glider she flew from JR Okachimachi to
     Taipei (her chemistry pocket's board): drawn into the film's own frame just before its grade, so the light, the bloom and the vignette are
     the film's; she flies a few metres ahead of the lens, level with the horizon, banking into the turns of the way, the board's jets aglow and
     a ribbon of orange light behind her. Over the island the birds Taiwan is known for keep her company, each in its place and its season: the
     grey-faced buzzards passing Kenting (late September to October); the black-faced spoonbills of the Zengwen estuary off Tainan (October to
     April; the little egrets in the other months); a family of Taiwan blue magpies over Sun Moon Lake and into the range; a pair of crested
     serpent eagles over Taroko. Every bird is this guide's own model, drawn in Luna's cel style, named by a small tag while it flies with her. */
  var RD = { built: false, on: false, patched: false, scene: null, cam: null, A: null, G: null, GB: null, board: null, glow: null, jet: null, tr: null, key: null, hemi: null, pl: null, flocks: [], tags: [], t: 0, yaw: null, yawP: null, roll: 0, sv: { bank: 0, look: -0.1, wave: false, point: false, crouch: 0.15 }, lo: null, snd: null, waveT: 0, look: 0 };
  var RQ = new THREE.Quaternion(), RQi = new THREE.Quaternion(), RQw = new THREE.Quaternion(), RE = new THREE.Euler(0, 0, 0, 'YXZ'), RV1 = new THREE.Vector3(), RV2 = new THREE.Vector3(), RV3 = new THREE.Vector3(), RV4 = new THREE.Vector3(), RV5 = new THREE.Vector3();
  var RDX = {
    zh: { magpie: ['台灣藍鵲', '台灣特有種 · 長尾山娘'], spoon: ['黑面琵鷺', '冬候鳥 · 臺南曾文溪口'], egret: ['小白鷺', '田野與溪口的白鷺'], buzz: ['灰面鵟鷹', '十月過境墾丁 · 國慶鳥'], eagle: ['大冠鷲', '盤旋山谷 · 台灣特有亞種'], snd: '輕觸畫面開啟聲音' },
    en: { magpie: ['Taiwan blue magpie', 'Endemic to Taiwan'], spoon: ['Black-faced spoonbill', 'Winter visitor · Zengwen estuary, Tainan'], egret: ['Little egret', 'Over the fields and estuaries'], buzz: ['Grey-faced buzzard', 'Passes Kenting each October'], eagle: ['Crested serpent eagle', 'Soaring the gorges · Taiwan subspecies'], snd: 'Tap for sound' },
    ja: { magpie: ['ヤマムスメ（台湾藍鵲）', '台湾固有種'], spoon: ['クロツラヘラサギ', '冬鳥 · 台南・曽文渓口'], egret: ['コサギ', '田んぼと河口の白いサギ'], buzz: ['サシバ', '10月に墾丁を渡る「国慶鳥」'], eagle: ['カンムリワシ', '谷の上を舞う · 台湾亜種'], snd: 'タップで音を出す' } };
  function rdx(k) { var L = RDX[LANG] || RDX.zh; return L[k] != null ? L[k] : RDX.zh[k]; }
  function rdSm(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  /* ---------- the birds: flat feather rdPanels in zones of colour, the bodies merged with vertex colours, cel-shaded with Luna's ink ---------- */
  function rdTone(o) { return LUNA.toon(0xffffff, Object.assign({ vc: true, rim: 0.22 }, o || {})); }
  /* a panel across the span x0..x1: leading edge at zf, chord c (both linear in x); zones [from, to, colour] in fractions of the chord */
  function rdPanels(list) { var P = [], C = [], N = [], col = new THREE.Color();
    list.forEach(function (q) { var x0 = q[0], x1 = q[1], zf0 = q[2], zf1 = q[3], c0 = q[4], c1 = q[5]; q[6].forEach(function (zn) { var a = zn[0], b = zn[1]; col.setHex(zn[2]);
      var v = [[x0, zf0 - a * c0], [x1, zf1 - a * c1], [x1, zf1 - b * c1], [x0, zf0 - b * c0]]; [[0, 1, 2], [0, 2, 3]].forEach(function (tr) { tr.forEach(function (k) { P.push(v[k][0], 0, v[k][1]); N.push(0, 1, 0); C.push(col.r, col.g, col.b); }); }); }); });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; }
  /* a feather: a tapered strip from (0,0) back along -z, length L, width w0 → w1, at angle a; zones along its length */
  function rdFeathers(list) { var P = [], C = [], N = [], col = new THREE.Color();
    list.forEach(function (q) { var L = q[0], w0 = q[1], w1 = q[2], ang = q[3], ox = q[4] || 0, oz = q[5] || 0, ca = Math.cos(ang), sa = Math.sin(ang); function pt(s, side) { var w = (w0 + (w1 - w0) * s) * side, z = -L * s, x = w; return [ox + x * ca + z * sa, oz - x * sa + z * ca]; }
      q[6].forEach(function (zn) { col.setHex(zn[2]); var v = [pt(zn[0], -1), pt(zn[0], 1), pt(zn[1], 1), pt(zn[1], -1)]; [[0, 1, 2], [0, 2, 3]].forEach(function (tr) { tr.forEach(function (k) { P.push(v[k][0], 0, v[k][1]); N.push(0, 1, 0); C.push(col.r, col.g, col.b); }); }); }); });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); return g; }
  function rdBody(parts, ink) { return LUNA.mesh(LUNA.merge(parts.map(function (q) { return [q[0], LUNA.M4(q[1], q[2] || null, q[3] || 1), q[4]]; })), rdTone(), { ink: ink || 0.006, shadow: false }); }
  function rdCone(r, h, s) { var g = new THREE.ConeGeometry(r, h, s || 10); g.rotateX(Math.PI / 2); return g; }
  function rdCyl(r0, r1, h) { var g = new THREE.CylinderGeometry(r1, r0, h, 8); g.rotateX(Math.PI / 2); return g; }
  /* the bird's rig: the body, two wings of two joints (arm and hand), the tail; it faces +z */
  function rdRig(spec) { var root = new THREE.Group(), body = rdBody(spec.body, spec.ink); root.add(body); var mw = rdTone({ side: THREE.DoubleSide, rim: 0.12 });
    function wing(side) { var sh = new THREE.Group(); sh.position.set(spec.sh[0] * side, spec.sh[1], spec.sh[2]); if (side < 0) sh.scale.x = -1; var arm = new THREE.Mesh(spec.arm, mw), el = new THREE.Group(); el.position.x = spec.armL; var hand = new THREE.Mesh(spec.hand, mw); sh.add(arm); sh.add(el); el.add(hand); root.add(sh); return { sh: sh, el: el, side: side }; }
    var W = [wing(1), wing(-1)], tail = new THREE.Group(); tail.position.set(0, spec.tl[1], spec.tl[2]); tail.add(new THREE.Mesh(spec.tail, mw)); root.add(tail);
    root.traverse(function (o) { if (o.isMesh) { o.frustumCulled = false; o.castShadow = false; } }); root.scale.setScalar(spec.sc || 1); return { root: root, W: W, tail: tail, spec: spec, ph: Math.random() * 6.28, fl: 0 }; }
  /* the pose of a wing rdBeat: phase p, the flap's size A (0 = held out), the dihedral; the hand follows the arm a little late */
  function rdBeat(B, p, A, dih, fold) { var up = Math.sin(p), hand = Math.sin(p - 0.7); B.W.forEach(function (w) { var s = w.side; w.sh.rotation.z = s * (dih + A * up * 0.85); w.el.rotation.z = A * hand * 0.5; w.el.rotation.y = (fold || 0) * 0.9; w.sh.rotation.y = s * (fold || 0) * 0.5; w.sh.rotation.x = -A * Math.cos(p) * 0.12; }); B.tail.rotation.x = -(B.spec.droop || 0) + Math.sin(p + 1.2) * 0.05 * A; }

  /* the species (sizes in metres, the island's units; colours as seen in the field) */
  var RSP = {
    /* 台灣藍鵲 Urocissa caerulea: black hood, cobalt-blue body and wings with white tips to the flight rdFeathers, a long graduated tail tipped white
       with a black bar before each tip, red bill and legs, a yellow eye */
    magpie: function () { var K = 0x101216, Bl = 0x1d55c4, Bd = 0x173f96, Wt = 0xf4f6f8, R = 0xd42a2a;
      return rdRig({ sc: 1.85, ink: 0.004, droop: 0.14, sh: [0.03, 0.02, 0.02], armL: 0.1, tl: [0, -0.005, -0.1],
        body: [[LUNA.blob(0.045, 0.042, 0.1, 16), [0, 0, 0], null, 1, Bl], [LUNA.blob(0.04, 0.034, 0.06, 12), [0, -0.012, 0.02], null, 1, 0x3c6fd0], [LUNA.blob(0.036, 0.036, 0.042, 14), [0, 0.022, 0.1], null, 1, K], [LUNA.blob(0.032, 0.03, 0.04, 12), [0, 0.004, 0.065], null, 1, K],
          [rdCone(0.011, 0.045, 8), [0, 0.018, 0.155], null, 1, R], [LUNA.blob(0.007, 0.007, 0.007, 8), [0.026, 0.03, 0.115], null, 1, 0xf0d040], [LUNA.blob(0.007, 0.007, 0.007, 8), [-0.026, 0.03, 0.115], null, 1, 0xf0d040], [rdCyl(0.006, 0.004, 0.06), [0.012, -0.03, -0.06], [0.3, 0, 0], 1, R], [rdCyl(0.006, 0.004, 0.06), [-0.012, -0.03, -0.06], [0.3, 0, 0], 1, R]],
        arm: rdPanels([[0, 0.1, 0.05, 0.045, 0.11, 0.12, [[0, 0.5, Bl], [0.5, 1, Bd]]]]),
        hand: rdPanels([[0, 0.1, 0.045, 0.02, 0.12, 0.06, [[0, 0.45, Bl], [0.45, 0.86, Bd], [0.86, 1, Wt]]], [0.1, 0.135, 0.02, -0.005, 0.06, 0.025, [[0, 0.7, Bd], [0.7, 1, Wt]]]]),
        tail: rdFeathers([[0.42, 0.029, 0.038, 0, 0, 0, [[0, 0.8, Bl], [0.8, 0.88, K], [0.88, 1, Wt]]], [0.34, 0.027, 0.034, 0.06, 0.006, 0, [[0, 0.74, Bl], [0.74, 0.84, K], [0.84, 1, Wt]]], [0.34, 0.027, 0.034, -0.06, -0.006, 0, [[0, 0.74, Bl], [0.74, 0.84, K], [0.84, 1, Wt]]],
          [0.26, 0.025, 0.030, 0.12, 0.012, 0, [[0, 0.68, Bl], [0.68, 0.8, K], [0.8, 1, Wt]]], [0.26, 0.025, 0.030, -0.12, -0.012, 0, [[0, 0.68, Bl], [0.68, 0.8, K], [0.8, 1, Wt]]], [0.18, 0.023, 0.028, 0.18, 0.016, 0, [[0, 0.6, Bl], [0.6, 0.75, K], [0.75, 1, Wt]]], [0.18, 0.023, 0.028, -0.18, -0.016, 0, [[0, 0.6, Bl], [0.6, 0.75, K], [0.75, 1, Wt]]]]) }); },
    /* 黑面琵鷺 Platalea minor (winter plumage): all white, the bare black face running into the long black spoon of the bill, the neck held out,
       the black legs trailing; the young have black tips to the outer primaries */
    spoon: function (young) { var Wt = 0xf6f5f0, Ws = 0xe6e4dc, K = 0x141414;
      return rdRig({ sc: 1.25, ink: 0.006, sh: [0.05, 0.02, 0.06], armL: 0.26, tl: [0, 0.0, -0.17],
        body: [[LUNA.blob(0.075, 0.07, 0.17, 16), [0, 0, 0], null, 1, Wt], [rdCyl(0.03, 0.022, 0.2), [0, 0.012, 0.25], null, 1, Wt], [LUNA.blob(0.034, 0.032, 0.042, 12), [0, 0.016, 0.36], null, 1, Wt], [LUNA.blob(0.03, 0.026, 0.03, 10), [0, 0.012, 0.385], null, 1, K],
          [LUNA.blob(0.011, 0.007, 0.09, 8), [0, 0.006, 0.47], null, 1, K], [LUNA.blob(0.026, 0.006, 0.03, 10), [0, 0.0, 0.56], null, 1, K], [rdCyl(0.008, 0.006, 0.26), [0.018, -0.03, -0.27], [0.08, 0, 0], 1, K], [rdCyl(0.008, 0.006, 0.26), [-0.018, -0.03, -0.27], [0.08, 0, 0], 1, K]],
        arm: rdPanels([[0, 0.26, 0.09, 0.08, 0.22, 0.21, [[0, 0.55, Wt], [0.55, 1, Ws]]]]),
        hand: rdPanels([[0, 0.24, 0.08, 0.04, 0.21, 0.14, [[0, 0.5, Wt], [0.5, 1, Ws]]], [0.24, 0.3, 0.04, 0.0, 0.14, 0.07, [[0, 1, young ? K : Ws]]]]),
        tail: rdFeathers([[0.11, 0.05, 0.045, 0, 0, 0, [[0, 1, Wt]]]]) }); },
    /* 小白鷺 Egretta garzetta: white, the neck drawn in, black bill and legs, yellow feet */
    egret: function () { var Wt = 0xf8f8f4, K = 0x18181a, Y = 0xe8c840;
      return rdRig({ sc: 1.25, ink: 0.005, sh: [0.04, 0.02, 0.04], armL: 0.2, tl: [0, 0.0, -0.13],
        body: [[LUNA.blob(0.055, 0.055, 0.13, 14), [0, 0, 0], null, 1, Wt], [LUNA.blob(0.035, 0.04, 0.05, 12), [0, 0.03, 0.12], null, 1, Wt], [LUNA.blob(0.026, 0.026, 0.034, 10), [0, 0.05, 0.17], null, 1, Wt], [rdCone(0.009, 0.08, 8), [0, 0.046, 0.235], null, 1, K],
          [rdCyl(0.006, 0.005, 0.22), [0.014, -0.025, -0.22], [0.06, 0, 0], 1, K], [rdCyl(0.006, 0.005, 0.22), [-0.014, -0.025, -0.22], [0.06, 0, 0], 1, K], [LUNA.blob(0.012, 0.006, 0.02, 6), [0.014, -0.03, -0.34], null, 1, Y], [LUNA.blob(0.012, 0.006, 0.02, 6), [-0.014, -0.03, -0.34], null, 1, Y]],
        arm: rdPanels([[0, 0.2, 0.07, 0.065, 0.17, 0.16, [[0, 1, Wt]]]]), hand: rdPanels([[0, 0.2, 0.065, 0.03, 0.16, 0.1, [[0, 1, Wt]]], [0.2, 0.25, 0.03, 0.0, 0.1, 0.05, [[0, 1, 0xeeeee8]]]]), tail: rdFeathers([[0.08, 0.04, 0.035, 0, 0, 0, [[0, 1, Wt]]]]) }); },
    /* 灰面鵟鷹 Butastur indicus: brown above, a grey-brown face, a white throat with a dark centre stripe, rufous bars below, long wings, a barred tail */
    buzz: function () { var Br = 0x7a5132, Bd = 0x4e3322, Ru = 0xb07448, Pl = 0xe8dcc8, Gr = 0x8a8478, Y = 0xf0c838;
      return rdRig({ sc: 1.25, ink: 0.006, sh: [0.045, 0.02, 0.05], armL: 0.24, tl: [0, 0.0, -0.14],
        body: [[LUNA.blob(0.06, 0.058, 0.14, 14), [0, 0, 0], null, 1, Br], [LUNA.blob(0.052, 0.045, 0.11, 12), [0, -0.018, 0.01], null, 1, Ru], [LUNA.blob(0.045, 0.044, 0.05, 12), [0, 0.02, 0.13], null, 1, Gr], [LUNA.blob(0.026, 0.024, 0.026, 8), [0, -0.004, 0.155], null, 1, Pl],
          [rdCone(0.012, 0.03, 8), [0, 0.012, 0.185], [0.35, 0, 0], 1, 0x2a2622], [LUNA.blob(0.008, 0.008, 0.008, 8), [0.03, 0.03, 0.155], null, 1, Y], [LUNA.blob(0.008, 0.008, 0.008, 8), [-0.03, 0.03, 0.155], null, 1, Y]],
        arm: rdPanels([[0, 0.24, 0.07, 0.07, 0.19, 0.2, [[0, 0.5, Br], [0.5, 1, Pl]]]]),
        hand: rdPanels([[0, 0.22, 0.07, 0.05, 0.2, 0.16, [[0, 0.4, Br], [0.4, 0.82, Pl], [0.82, 1, Bd]]], [0.22, 0.29, 0.05, 0.015, 0.16, 0.09, [[0, 0.6, Pl], [0.6, 1, Bd]]]]),
        tail: rdFeathers([[0.17, 0.035, 0.05, 0, 0, 0, [[0, 0.25, Br], [0.25, 0.33, Bd], [0.33, 0.55, Br], [0.55, 0.63, Bd], [0.63, 0.85, Br], [0.85, 1, Bd]]]]) }); },
    /* 大冠鷲 Spilornis cheela hoya: dark brown, the underparts spotted white, a bare yellow face, a short crest at the nape; broad rounded wings
       with a broad white band across the flight rdFeathers, and a white band across the tail */
    eagle: function () { var Br = 0x3a2a1e, Bm = 0x55402e, Wt = 0xf2efe6, Y = 0xf2c429, Sp = 0x7a6450;
      return rdRig({ sc: 1.15, ink: 0.007, sh: [0.06, 0.025, 0.06], armL: 0.32, tl: [0, 0.0, -0.18],
        body: [[LUNA.blob(0.085, 0.08, 0.2, 16), [0, 0, 0], null, 1, Br], [LUNA.blob(0.07, 0.06, 0.15, 12), [0, -0.025, 0.02], null, 1, Sp], [LUNA.blob(0.06, 0.058, 0.066, 12), [0, 0.03, 0.19], null, 1, Bm], [LUNA.blob(0.03, 0.022, 0.03, 8), [0, 0.02, 0.245], null, 1, Y],
          [rdCone(0.015, 0.035, 8), [0, 0.012, 0.27], [0.4, 0, 0], 1, 0x222020], [LUNA.blob(0.05, 0.03, 0.04, 10), [0, 0.07, 0.15], null, 1, Br], [LUNA.blob(0.01, 0.01, 0.01, 8), [0.04, 0.042, 0.22], null, 1, 0xf6d23a], [LUNA.blob(0.01, 0.01, 0.01, 8), [-0.04, 0.042, 0.22], null, 1, 0xf6d23a]],
        arm: rdPanels([[0, 0.32, 0.1, 0.1, 0.3, 0.32, [[0, 0.45, Br], [0.45, 0.62, Bm], [0.62, 0.84, Wt], [0.84, 1, Br]]]]),
        hand: rdPanels([[0, 0.28, 0.1, 0.08, 0.32, 0.27, [[0, 0.42, Br], [0.42, 0.62, Bm], [0.62, 0.84, Wt], [0.84, 1, Br]]], [0.28, 0.36, 0.08, 0.04, 0.27, 0.16, [[0, 0.5, Bm], [0.5, 1, Br]]]]),
        tail: rdFeathers([[0.24, 0.05, 0.075, 0, 0, 0, [[0, 0.5, Br], [0.5, 0.75, Wt], [0.75, 1, Br]]]]) }); } };

  /* ---------- (v64) the birds of this film, one of each kind: where (between which passes of the way), which (by the date), how it flies ---------- */
  function rdFlocks(F) { var d = (F && F.date) || new Date(), tp = new Date(d.getTime() + 8 * 3600000), M = tp.getUTCMonth() + 1, D = tp.getUTCDate(), P = (F && F.p && F.p.pass) || {}, out = [];
    function at(k, def) { return P[k] != null ? P[k] : def; }
    /* late September to October: a grey-faced buzzard on its way south over the Hengchun peninsula, turning on the rising air above her */
    if (M === 10 || (M === 9 && D >= 20)) out.push({ id: 'buzz', kind: 'kettle', n: 1, u0: at('kenting', 0.1) - 0.035, u1: at('kenting', 0.1) + 0.075, c: [-2.2, 2.2, -3.6], r: [1.7, 1.7], w: 0.5 });
    /* October to April a black-faced spoonbill of the Tainan coast; in the warm months a little egret of the fields */
    var win = M >= 10 || M <= 4; out.push({ id: win ? 'spoon' : 'egret', kind: 'line', n: 1, u0: at('tnn', 0.32) - 0.055, u1: at('tnn', 0.32) + 0.035, lead: [-2.0, 0.25, -1.6], step: [0, 0, 0], beat: win ? 3.1 : 2.7, A: win ? 0.58 : 0.55 });
    /* a Taiwan blue magpie, bounding beside her: a burst of beats, a glide on spread wings */
    out.push({ id: 'magpie', kind: 'file', n: 1, u0: at('sml', 0.59) - 0.07, u1: at('sml', 0.59) + 0.05, lead: [-1.5, 0.55, -0.6], step: [0, 0, 0], beat: 6.2, A: 0.6 });
    /* over Taroko a crested serpent eagle soaring in the shallow V of its wings, above her and to the left */
    out.push({ id: 'eagle', kind: 'kettle', n: 1, u0: at('taroko', 0.68) - 0.02, u1: at('taroko', 0.68) + 0.075, c: [-2.0, 2.0, -3.4], r: [1.6, 1.6], w: 0.4 });
    return out; }

  function rdBuild() { if (RD.built) return; RD.built = true; var sc = new THREE.Scene(); sc.fog = scene.fog || null; RD.scene = sc; RD.cam = new THREE.PerspectiveCamera(44, 1, 0.05, 400);
    RD.key = new THREE.DirectionalLight(0xffffff, 1); sc.add(RD.key); sc.add(RD.key.target); RD.hemi = new THREE.HemisphereLight(0xbfd4ff, 0x6a6458, 0.6); sc.add(RD.hemi); RD.pl = new THREE.PointLight(0xff8a30, 0, 4, 2); sc.add(RD.pl);
    var G = new THREE.Group(); sc.add(G); RD.G = G; var GB = new THREE.Group(); sc.add(GB); RD.GB = GB; /* the birds' group: the lens's own frame */
    RD.board = PROPS.glider(); RD.board.scale.setScalar(1.15); RD.board.position.y = -0.07; G.add(RD.board); var gt = glowTex(); RD.glow = sprite(gt, 0xff9a40, 1.1, 0.2); RD.glow.position.set(0, -0.12, -0.4); RD.board.add(RD.glow); RD.jet = sprite(gt, 0xffc070, 0.6, 0.6); RD.jet.position.set(0, -0.03, -1.15); RD.board.add(RD.jet);
    RD.A = LUNA.build('luna'); G.add(RD.A.root); LUNA.setMode(RD.A, 'surf'); RD.A.root.traverse(function (o) { if (o.isMesh) { o.frustumCulled = false; o.castShadow = false; } }); RD.lo = { surf: RD.sv, wind: new THREE.Vector3() };
    RD.tr = Trail(12, 0.045, 0xff8a30, true, 0.5); RD.tr.m.frustumCulled = false; sc.add(RD.tr.m);
    try { R3.compile(sc, RD.cam); } catch (e) {} }
  /* the flock's birds, made when the film begins (by the date) and kept for the session */
  var RDB = {}; function rdBirds(id, n) { var L = RDB[id] || (RDB[id] = []); while (L.length < n) { var B = id === 'spoon' ? RSP.spoon(L.length % 3 === 2) : RSP[id](); B.root.visible = false; RD.GB.add(B.root); L.push(B); } return L.slice(0, n); }

  function rdStart() { rdBuild(); var F = CINE.F(); if (!F || !F.p || !F.p.fly) return; RD.on = true; RD.t = 0; RD.uP = null; RD.yaw = null; RD.yawP = null; RD.roll = 0; RD.waveT = 0; RD.look = 0; RD.tr.reset();
    Object.keys(RDB).forEach(function (k) { RDB[k].forEach(function (B) { B.root.visible = false; }); });
    RD.flocks = rdFlocks(F).map(function (q) { q.B = rdBirds(q.id, q.n); q.waved = false; return q; });
    var L = $('isOpL'); RD.tags = RD.flocks.map(function (q) { var e = document.createElement('span'); e.className = 'isle__cine-pin is-bird'; e.innerHTML = '<b></b><small></small>'; e.firstChild.textContent = rdx(q.id)[0]; e.lastChild.textContent = rdx(q.id)[1]; e.style.opacity = 0; if (L) L.appendChild(e); return e; });
    rdSound(); }
  function rdStop() { RD.on = false; RD.tags.forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); }); RD.tags = []; if (RD.snd) RD.snd.off(); Object.keys(RDB).forEach(function (k) { RDB[k].forEach(function (B) { B.root.visible = false; }); }); }

  /* the sound held back by the browser: the film plays silent with a small “tap for sound”; the first touch brings the score in where the film is */
  function rdSound() { if (RD.snd) RD.snd.off(); var au = null; try { au = AU.ctxOf ? AU.ctxOf() : null; } catch (e) {} var mute = false; try { mute = typeof SimAudio !== 'undefined' && SimAudio.muted(); } catch (e) {}
    if (!window.ISLE_SNDCHIP && (mute || (au && au.ctx && au.ctx.state === 'running'))) return; var O = OP.ov; if (!O) return; var b = document.createElement('button'); b.type = 'button'; b.className = 'isle__op-snd'; b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span></span>'; b.lastChild.textContent = rdx('snd'); O.appendChild(b);
    function unlock() { off(); try { AU.init(); } catch (e) {} var a2 = null; try { a2 = AU.ctxOf ? AU.ctxOf() : null; } catch (e) {} if (!a2 || !a2.ctx) return; var go = function () { if (OP.on) try { CINE.rescore(a2); } catch (e) {} }; var pr = null; try { pr = a2.ctx.resume ? a2.ctx.resume() : null; } catch (e) {} if (pr && pr.then) pr.then(go, function () {}); else go(); }
    function off() { document.removeEventListener('pointerdown', unlock, true); document.removeEventListener('keydown', unlock, true); if (b.parentNode) b.parentNode.removeChild(b); RD.snd = null; }
    document.addEventListener('pointerdown', unlock, true); document.addEventListener('keydown', unlock, true); RD.snd = { off: off }; }

  /* ---------- each frame: where she is in the lens, how she leans, the birds, the tags ---------- */
  function rdTick(dt0) { var F = CINE.F(), c = CINE.cam(); if (!RD.on || !F || !F.p || !F.p.fly || !c) { if (RD.G) RD.G.visible = false; return; }
    var dt = window.ISLE_OP_HOLD ? 1 / 60 : Math.min(0.1, dt0); RD.t += dt; var T = F.T, u = Math.max(0, Math.min(1, F.t / T)), du = 0.35 / T; if (RD.uP != null && Math.abs(u - RD.uP) > 0.01) { RD.tr.reset(); RD.yaw = null; RD.yawP = null; } RD.uP = u;
    var a = CINE.rigAt(Math.max(0, u - du)), b = CINE.rigAt(Math.min(1, u + du)); if (!a || !b) return; RV1.set(b.p[0] - a.p[0], b.p[1] - a.p[1], b.p[2] - a.p[2]); if (RV1.lengthSq() < 1e-10) RV1.set(0, 0, 1); RV1.normalize();
    /* the lens: its aspect and field are the film's; the world turned into the lens's own frame */ RD.cam.fov = c.fov; RD.cam.aspect = c.aspect; RD.cam.updateProjectionMatrix(); c.updateMatrixWorld(); RQ.copy(c.quaternion); RQi.copy(RQ).invert();
    /* her heading in the world: the way's (its climb kept small), turned smoothly, and kept within 40° of the lens's own heading so she flies into the
       picture even when the lens turns aside to a landmark; the bank from how fast it turns */ var yaw = Math.atan2(RV1.x, RV1.z), climb = Math.max(-0.16, Math.min(0.16, Math.asin(Math.max(-1, Math.min(1, RV1.y))) * 0.6));
    c.getWorldDirection(RV3); var lyaw = Math.atan2(RV3.x, RV3.z), rel = yaw - lyaw; while (rel > Math.PI) rel -= 2 * Math.PI; while (rel < -Math.PI) rel += 2 * Math.PI; yaw = lyaw + Math.max(-0.7, Math.min(0.7, rel));
    if (RD.yaw == null) RD.yaw = yaw; var dy = yaw - RD.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; var ky = 1 - Math.exp(-dt * 2.2); RD.yaw += dy * ky; var rate = RD.yawP == null ? 0 : (function () { var d2 = RD.yaw - RD.yawP; while (d2 > Math.PI) d2 -= 2 * Math.PI; while (d2 < -Math.PI) d2 += 2 * Math.PI; return d2 / Math.max(1e-3, dt); })(); RD.yawP = RD.yaw;
    RD.roll += (Math.max(-0.42, Math.min(0.42, -rate * 0.9)) - RD.roll) * (1 - Math.exp(-dt * 2.5));
    /* where in the frame: right of centre in the lower third, some nine metres ahead; she rises into it as the film opens and flies on ahead
       towards the island as the title comes */ var hh = Math.tan(c.fov * Math.PI / 360), en = rdSm(0.012, 0.07, u), lv = rdSm(0.895, 0.955, u), D0 = Math.max(5.5, Math.min(10, 1.45 / (0.4 * hh))), D = D0 + lv * lv * 80, ox = Math.min(2.2, 0.34 * D * hh * c.aspect) * (1 - lv * 0.85), oy = -0.4 * D * hh * (1 - lv * 0.6) - (1 - en) * 5;
    var bob = Math.sin(RD.t * 1.15) * 0.07, sway = Math.sin(RD.t * 0.62) * 0.1; RD.G.visible = u < 0.985; RD.GB.visible = RD.G.visible; RD.G.position.set(ox + sway, oy + bob, -D); RD.GB.position.set(0, 0, 0); RD.GB.quaternion.identity();
    RE.set(-climb, RD.yaw, RD.roll + Math.sin(RD.t * 0.9) * 0.03, 'YXZ'); RQw.setFromEuler(RE); RD.G.quaternion.copy(RQi).multiply(RQw); RE.set(0, RD.yaw, 0, 'YXZ'); RQw.setFromEuler(RE); var QL = RD.QL || (RD.QL = new THREE.Quaternion()); QL.copy(RQi).multiply(RQw);
    /* the air: against her, from ahead (in the lens's frame), for her hair and coat */ RV2.set(0, 0, 1).applyQuaternion(QL); RD.lo.wind.copy(RV2).multiplyScalar(-46);
    /* the light: the film's sun (its direction and colour, turned into the lens's frame) at the strength the island gives its characters by day;
       the moon's by night, with the board's glow lighting her from below */ var Lw = CINE.lights ? CINE.lights() : null, sn = CINE.sun ? CINE.sun() : null, night = sn ? sn.night || 0 : 0, dayK = sn ? Math.max(0, Math.min(1, sn.up)) * (1 - night) : 1;
    if (Lw) { RV3.copy(Lw.sun.position).sub(Lw.sun.target.position).normalize().applyQuaternion(RQi); RD.key.position.copy(RD.G.position).addScaledVector(RV3, 10); RD.key.target.position.copy(RD.G.position); RD.key.target.updateMatrixWorld(); var kc = Lw.sun.color, km = Math.max(kc.r, kc.g, kc.b) || 1; RD.key.color.setRGB(0.75 * kc.r / km + 0.25, 0.75 * kc.g / km + 0.25, 0.75 * kc.b / km + 0.25); RD.key.intensity = 1.9 * dayK + 0.32 * night + 0.25 * (1 - night) * (1 - dayK);
      var hc = Lw.hemi.color, hm = Math.max(hc.r, hc.g, hc.b) || 1, gc = Lw.hemi.groundColor, gm = Math.max(gc.r, gc.g, gc.b) || 1; RD.hemi.color.setRGB(hc.r / hm, hc.g / hm, hc.b / hm); RD.hemi.groundColor.setRGB(gc.r / gm, gc.g / gm, gc.b / gm).multiplyScalar(0.7); RD.hemi.intensity = 0.42 + 0.22 * dayK - 0.18 * night; RD.hemi.position.set(0, 1, 0).applyQuaternion(RQi); }
    RD.pl.position.copy(RD.G.position).add(RV4.set(0, -0.35, 0)); RD.pl.intensity = 0.1 + 0.9 * night;
    /* the board: its jets flicker; a short ribbon of light runs back from its tail with the air */ RD.jet.material.opacity = (0.45 + Math.random() * 0.2) * (0.6 + 0.4 * night); RD.glow.material.opacity = 0.12 + 0.3 * night;
    /* (v64) the ribbon of light behind the board: laid fresh every frame from the tail back along the way (a fixed metre or so — it runs towards the lens, so
       more would streak the picture — a flutter in it), never a history that could grow */ RD.G.updateMatrixWorld(true); var trP = RD.trP || (RD.trP = []), NT2 = 12; while (trP.length < NT2) trP.push(new THREE.Vector3()); RV4.set(0, -0.03, -1.15).applyMatrix4(RD.board.matrixWorld); RV5.copy(RV2).multiplyScalar(-1);
    for (var ti = 0; ti < NT2; ti++) { var fq = ti / (NT2 - 1); trP[ti].copy(RV4).addScaledVector(RV5, ti * 0.075).y += Math.sin(RD.t * 7 + ti * 0.7) * 0.015 * fq; } RD.tr.pts = trP.slice(0, NT2); RD.tr.m.visible = RD.G.visible && en > 0.5 && lv < 0.35; RD.tr.draw(RV3.set(0, 0, 0));
    /* the birds: laid out in the lens's frame about Luna (x right, y up, z towards the lens), facing her heading, level; they come in from the left
       and leave again up and away to the left */ var lookW = 0, anyIn = false, G0 = RD.G.position, bsc = D0 / 9, bnx = Math.max(0.55, Math.min(1, c.aspect / 1.4)); /* nearer and narrower on a tall screen */ RD.flocks.forEach(function (q, qi) { var e = rdSm(q.u0, q.u0 + 0.03, u) * (1 - rdSm(q.u1 - 0.03, q.u1, u)), tag = RD.tags[qi]; if (e <= 0.001) { q.B.forEach(function (B) { B.root.visible = false; }); if (tag) tag.style.opacity = 0; return; }
      var ein = rdSm(q.u0, q.u0 + 0.03, u), eout = rdSm(q.u1 - 0.03, q.u1, u), sx = 1 - ein, lead = null; if (ein > 0.7 && !q.waved) { q.waved = true; RD.waveT = 1.6; }
      q.B.forEach(function (B, k) { B.root.visible = true; var tt = RD.t + k * 0.37, x, y, z, hd = 0, rl = 0;
        if (q.kind === 'kettle') { var rr = q.r[0] + (q.r[1] - q.r[0]) * (k / Math.max(1, q.n - 1)), w = q.w * (k % 2 ? 1 : 0.88), ang = tt * w + k * 2.3; RV4.set(Math.cos(ang) * rr, 0, Math.sin(ang) * rr).applyQuaternion(QL);
          x = q.c[0] + RV4.x; y = q.c[1] + k * 0.3 + RV4.y + Math.sin(tt * 0.5 + k) * 0.15; z = q.c[2] + RV4.z; hd = -ang; rl = 0.42;
          /* held out on the air, a few beats now and then */ var fl = (tt * 0.23 + k * 0.31) % 1 < 0.1 ? 0.55 : 0; rdBeat(B, tt * 15, fl, q.id === 'eagle' ? 0.2 : 0.07, 0); }
        else { var st = q.step; x = q.lead[0] + st[0] * k + Math.sin(tt * 0.7) * 0.12; y = q.lead[1] + st[1] * k + Math.sin(tt * 1.3 + k) * 0.09; z = q.lead[2] + st[2] * k + Math.sin(tt * 0.5) * 0.15; rl = Math.sin(tt * 0.9) * 0.05;
          if (q.id === 'magpie') { /* bounding: a burst of beats, then a glide on spread wings */ var cyc = (tt * 0.8 + k * 0.17) % 1, flap = cyc < 0.55; rdBeat(B, tt * q.beat * 2 * Math.PI, flap ? q.A : 0.04, 0.05, flap ? 0 : 0.1); y += flap ? 0 : -0.04; }
          else rdBeat(B, tt * q.beat * 2 * Math.PI, q.A, 0.04, 0); }
        x += -sx * (8 + k * 0.6) - eout * (7 + k * 0.5); y += -sx * 1.2 + eout * 2.8; z += -sx * 1.5 - eout * 3;
        B.root.position.set(G0.x + x * bsc * bnx, G0.y + y * bsc, G0.z + z * bsc); RE.set(0, hd, rl + sx * 0.25 - eout * 0.3, 'YXZ'); RQw.setFromEuler(RE); B.root.quaternion.copy(QL).multiply(RQw); if (!lead) lead = B.root; });
      if (lead && tag) { RD.GB.updateMatrixWorld(true); RV4.setFromMatrixPosition(lead.matrixWorld).project(RD.cam); var w2 = root.clientWidth || 1, h2 = root.clientHeight || 1, sxp = (RV4.x * 0.5 + 0.5) * w2, syp = (-RV4.y * 0.5 + 0.5) * h2, vis = RV4.z < 1 && sxp > 8 && sxp < w2 - 8 && syp > 70 && syp < h2 - 50;
        RV5.copy(G0).project(RD.cam); var lx2 = (RV5.x * 0.5 + 0.5) * w2, tw = tag.offsetWidth || 150, flip = w2 < 760 && sxp < lx2, tx = flip ? sxp + 14 - tw : sxp - 10; tag.classList.toggle('is-r', flip); /* above the bird, clear of Luna: on a narrow screen it opens to the bird's far side */ tag.style.transform = 'translate(' + Math.round(Math.max(8, Math.min(w2 - tw - 8, tx))) + 'px,' + Math.round(Math.max(48, syp - 62)) + 'px)'; tag.style.opacity = vis ? (Math.min(1, e * 1.6) * (1 - eout)).toFixed(2) : 0; }
      if (e > 0.3) { anyIn = true; lookW = Math.max(lookW, e); } });
    /* her: the board stance, a look across to the birds and a wave as they come */ RD.waveT = Math.max(0, RD.waveT - dt); var sv = RD.sv; sv.bank = RD.roll * 0.5; RD.look += ((anyIn ? 0.55 : -0.08) - RD.look) * (1 - Math.exp(-dt * 2)); sv.look = RD.look; sv.wave = RD.waveT > 0.2; sv.crouch = 0.15 + lv * 0.6;
    try { LUNA.update(RD.A, dt, RD.lo); } catch (e) {} }

  /* drawn into the film's frame right after the land and sky, before the grade: the depth cleared, the island's own lamps and wet kept off her */
  function rdDraw(R, r0) { if (!RD.on || !RD.G || !RD.G.visible) return; var U = KIT.U, sv = [U.uLLn.value, U.uSpK.value, U.uWet.value, U.uSnowC.value, U.uZn.value], ac = R.autoClear; U.uLLn.value = 0; U.uSpK.value = 0; U.uWet.value = 0; U.uSnowC.value = 0; U.uZn.value = 0; /* (v81) nor the lit places, which are found through the main lens */
    try { R.autoClear = false; R.clearDepth(); r0(RD.scene, RD.cam); } finally { R.autoClear = ac; U.uLLn.value = sv[0]; U.uSpK.value = sv[1]; U.uWet.value = sv[2]; U.uSnowC.value = sv[3]; U.uZn.value = sv[4]; } }
  function rdPatch() { if (RD.patched) return; RD.patched = true; var rPrev = R3.render; R3.render = function (sc, c) { var out = rPrev.apply(R3, arguments); if (RD.on && CN.on && (sc === scene || (typeof CINE !== 'undefined' && sc === CINE.scene()))) { try { rdDraw(R3, function (s2, c2) { rPrev.call(R3, s2, c2); }); } catch (e) { RD.on = false; if (window.console) console.error('opening rider', e); } } return out; }; }

  /* into the opening: built with the film's island (at the boot's last stage), started and stopped with it, advanced in its frame */
  var _opPrepareAM = opPrepare; opPrepare = function () { _opPrepareAM.apply(this, arguments); try { rdBuild(); } catch (e) { if (window.console) console.error('opening rider build', e); } };
  var _opStartAM = opStart; opStart = function () { var ok = _opStartAM.apply(this, arguments); if (ok) { try { rdPatch(); rdStart(); } catch (e) { RD.on = false; if (window.console) console.error('opening rider', e); } } return ok; };
  var _opTickAM = opTick; opTick = function (dt) { _opTickAM(dt); if (RD.on && OP.on) { try { rdTick(dt); } catch (e) { RD.on = false; if (window.console) console.error('opening rider tick', e); } } };
  var _opEndAM = opEnd; opEnd = function () { var was = OP.on; _opEndAM.apply(this, arguments); if (was) rdStop(); };
  window.ISLE_x.rider = function () { return { on: RD.on, vis: !!(RD.G && RD.G.visible), pos: RD.G ? RD.G.position.toArray().map(function (v) { return +v.toFixed(2); }) : null, flocks: RD.flocks.map(function (q) { return [q.id, q.n, +q.u0.toFixed(3), +q.u1.toFixed(3), q.B.filter(function (B) { return B.root.visible; }).length]; }), tags: RD.tags.map(function (e) { return [e.firstChild.textContent, e.style.opacity]; }), snd: !!RD.snd }; };
