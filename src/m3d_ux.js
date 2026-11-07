/* ===== [m3d_ux.js] ===== */
/* ===== UREAX-HG guide: the applications in 3D =====
   Three members built with the waterproofing member's kit through its hooks (WPM3D[id].build/state/anchors/rig/micro): the FRP balcony
   (FU08), the mortar corridor and the flat roof over an old urethane membrane. The build-up follows the chosen specification (window.UX_SPEC:
   the catalogue's FU08 with the aggregate in the second coat, or the standard method statement with two or three coats of 0.6 kg/m² and the
   anti-slip layer as an option) — primer, the NON-BLEED QUICK adjustment of corners and cracks, the coats, the EXCEED termination of the film
   edges; the substrate, the primer and the room differ. The reinforced concrete carries its bars (seen cut at the saw face and in the x-ray).
   Plus the title object: a floor sample with the seven steps side by side. Coordinates in metres: the house wall (or parapet) stands on y = 0
   with its face at z = 0, the floor runs to +z. */

/* ---------- the surfaces of this guide ---------- */
var UXTX = (function () {
  var C = {}, PX = SMALL3D ? 1200 : 2000;
  function once(k, f) { if (!C[k]) C[k] = f(); return C[k]; }
  function wrapAll(q, S, f) { var ox, oy; for (oy = -S; oy <= S; oy += S) for (ox = -S; ox <= S; ox += S) { q.save(); q.translate(ox, oy); f(); q.restore(); } }
  /* the roller-applied polyurea-urethane coat: a near-smooth film with the fine stipple of the roller and faint lap lines; `grit`: the aggregate of the second coat */
  function puCoat(tone, o) { return once('pu:' + tone + ':' + JSON.stringify(o || {}), function () { var S = 512, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(o && o.seed || 501), i; q.fillStyle = tone; q.fillRect(0, 0, S, S); clouds(q, S, S, r, 5, 5, 0.16, 110, 150);
    q.globalAlpha = 0.12; for (i = 0; i < 2400; i++) { q.fillStyle = i % 2 ? '#ffffff' : '#000000'; q.beginPath(); q.arc(r() * S, r() * S, 0.6 + r() * 1.6, 0, 7); q.fill(); } // the stipple of the roller
    q.globalAlpha = 0.07; q.lineWidth = 3; for (i = 0; i < 14; i++) { q.strokeStyle = i % 2 ? '#ffffff' : '#000000'; var y = r() * S; q.beginPath(); q.moveTo(0, y); q.bezierCurveTo(S * 0.3, y + (r() - 0.5) * 14, S * 0.7, y + (r() - 0.5) * 14, S, y + (r() - 0.5) * 8); q.stroke(); } // lap lines
    q.globalAlpha = 1;
    if (o && o.grit) { var n = o.grit === 2 ? 1500 : 900; for (i = 0; i < n; i++) { (function () { var x = r() * S, y = r() * S, rad = 1.6 + r() * 2.2, g = q.createRadialGradient(x - rad * 0.35, y - rad * 0.35, 0, x, y, rad), l = 150 + Math.floor(r() * 90); g.addColorStop(0, 'rgba(' + l + ',' + l + ',' + (l - 6) + ',.95)'); g.addColorStop(0.6, 'rgba(' + (l - 40) + ',' + (l - 40) + ',' + (l - 44) + ',.85)'); g.addColorStop(1, 'rgba(40,40,42,0)'); q.fillStyle = g; wrapAll(q, S, function () { q.beginPath(); q.arc(x, y, rad, 0, 7); q.fill(); }); })(); } } // the aggregate grains in the second coat
    return c; }); }
  /* a crack on a face canvas: the same jittered polyline the sealant bead follows (seeded by the crack itself), drawn as a wide open core, a darker centre and the light lifted edge */
  function crackPts(cr, cw, ch) { var r2 = lcg(Math.round(cr[0] * 1000 + cr[1] * 7919)), x = cr[0] * cw, y = cr[1] * ch, n = 14, dx = (cr[2] - cr[0]) * cw / n, dy = (cr[3] - cr[1]) * ch / n, pts = [[x, y]], k; for (k = 1; k <= n; k++) { x += dx + (r2() - 0.5) * 0.012 * cw; y += dy + (r2() - 0.5) * 0.012 * cw; pts.push([x, y]); } return pts; }
  function crackPath(q, cr, cw, ch, r, S, dark, light) { var pts = crackPts(cr, cw, ch), w = Math.max(2.2, 0.0032 * S), draw = function (lw, st) { q.lineWidth = lw; q.strokeStyle = st; q.lineCap = 'round'; q.lineJoin = 'round'; q.beginPath(); pts.forEach(function (p2, i) { if (i) q.lineTo(p2[0], p2[1]); else q.moveTo(p2[0], p2[1]); }); q.stroke(); }; draw(w * 2.2, light); draw(w, dark); draw(w * 0.45, 'rgba(12,11,10,.95)'); }
  /* the existing FRP waterproofing seen from above, w × h m (canvas top = wall side): grey gel-coat topcoat, the weave of the glass mat faintly through it,
     chalking, hairline cracks (o.cracks: [[u0,v0,u1,v1], …]), and — unless `clean` — the dirt: rain streaks towards the drain, sand, the ring round the puddle */
  function frpFace(w, h, o) { o = o || {}; return once('frp:' + w + ':' + h + ':' + (o.clean ? 'c' : 'd') + ':' + (o.seed || 0), function () { var S = PX * 0.55, cw = Math.round(w * S), ch = Math.round(h * S), c = mkCanvas(cw, ch), q = c.getContext('2d'), r = lcg(o.seed || 611), i, k;
    q.fillStyle = o.tone || '#7d8380'; q.fillRect(0, 0, cw, ch); clouds(q, cw, ch, r, 5, 4, 0.2, 90, 170); clouds(q, cw, ch, r, 30, 24, 0.1, 110, 200);
    q.save(); q.globalAlpha = 0.07; q.strokeStyle = '#3c4240'; q.lineWidth = 1; for (i = -ch; i < cw + ch; i += 7) { q.beginPath(); q.moveTo(i, 0); q.lineTo(i + ch, ch); q.stroke(); q.beginPath(); q.moveTo(i, ch); q.lineTo(i + ch, 0); q.stroke(); } q.restore(); // the glass mat under the gel-coat
    q.save(); q.globalCompositeOperation = 'screen'; q.globalAlpha = 0.16; clouds(q, cw, ch, r, 7, 5, 0.55, 30, 160); q.restore(); q.fillStyle = 'rgba(255,255,255,.03)'; q.fillRect(0, 0, cw, ch); // chalking: a whitish haze, patchy
    var gs = q.createLinearGradient(0, 0, 0, ch * 0.25); gs.addColorStop(0, 'rgba(255,255,255,.1)'); gs.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = gs; q.fillRect(0, 0, cw, ch); // faded most along the wall, where the sun stands longest
    if (!o.clean) {
      q.save(); q.globalCompositeOperation = 'multiply'; q.globalAlpha = 0.5; clouds(q, cw, ch, r, 4, 3, 0.5, 120, 255); q.restore();
      q.globalAlpha = 0.18; q.lineWidth = 2; for (i = 0; i < 120; i++) { q.strokeStyle = '#4a4a46'; var x0 = r() * cw, y0 = r() * ch * 0.6; q.beginPath(); q.moveTo(x0, y0); q.lineTo(x0 + (r() - 0.5) * 30, y0 + 60 + r() * ch * 0.35); q.stroke(); } // rain streaks down towards the drain
      q.globalAlpha = 0.6; for (i = 0; i < 3200; i++) { q.fillStyle = i % 3 ? 'rgba(70,64,54,.6)' : 'rgba(200,190,170,.7)'; q.beginPath(); q.arc(r() * cw, r() * ch, 0.6 + r() * 1.5, 0, 7); q.fill(); } // sand and dust
      if (o.puddle) { var pu = o.puddle, px = pu[0] * cw, py = pu[1] * ch, rx = pu[2] * cw, ry = pu[3] * ch, rg = q.createRadialGradient(px, py, rx * 0.7, px, py, rx * 1.25); rg.addColorStop(0, 'rgba(60,56,48,0)'); rg.addColorStop(0.75, 'rgba(60,56,48,.5)'); rg.addColorStop(1, 'rgba(60,56,48,0)'); q.save(); q.translate(px, py); q.scale(1, ry / rx); q.translate(-px, -py); q.fillStyle = rg; q.beginPath(); q.arc(px, py, rx * 1.3, 0, 7); q.fill(); q.restore(); } // the dirt ring round the standing water
      var gd = q.createLinearGradient(0, 0, 0, ch * 0.12); gd.addColorStop(0, 'rgba(50,46,40,.35)'); gd.addColorStop(1, 'rgba(50,46,40,0)'); q.fillStyle = gd; q.fillRect(0, 0, cw, ch); // dirt collected along the wall
      q.globalAlpha = 1;
    }
    (o.cracks || []).forEach(function (cr) { crackPath(q, cr, cw, ch, r, S, 'rgba(40,38,36,.92)', 'rgba(255,255,255,.5)'); }); // the cracks: a dark open core with the light edge of the lifted gel-coat
    return c; }); }
  /* the old liquid urethane membrane of a roof: grey topcoat chalked and faded, blisters (o.blisters: [[u, v, r], …]) with their dark rims, dirt in the low spots, cracks */
  function ureFace(w, h, o) { o = o || {}; return once('ure:' + w + ':' + h + ':' + (o.clean ? 'c' : 'd'), function () { var S = PX * 0.55, cw = Math.round(w * S), ch = Math.round(h * S), c = mkCanvas(cw, ch), q = c.getContext('2d'), r = lcg(o.seed || 641), i, k;
    q.fillStyle = '#84857f'; q.fillRect(0, 0, cw, ch); clouds(q, cw, ch, r, 6, 4, 0.25, 80, 170); clouds(q, cw, ch, r, 26, 20, 0.12, 100, 200);
    q.save(); q.globalCompositeOperation = 'screen'; q.globalAlpha = 0.25; clouds(q, cw, ch, r, 8, 6, 0.5, 30, 160); q.restore(); q.fillStyle = 'rgba(255,255,255,.05)'; q.fillRect(0, 0, cw, ch);
    if (!o.clean) { q.save(); q.globalCompositeOperation = 'multiply'; q.globalAlpha = 0.45; clouds(q, cw, ch, r, 4, 3, 0.5, 130, 255); q.restore(); q.globalAlpha = 0.5; for (i = 0; i < 2600; i++) { q.fillStyle = i % 3 ? 'rgba(60,56,50,.6)' : 'rgba(190,184,170,.7)'; q.beginPath(); q.arc(r() * cw, r() * ch, 0.6 + r() * 1.6, 0, 7); q.fill(); } q.globalAlpha = 1; }
    (o.blisters || []).forEach(function (b) { var bx = b[0] * cw, by = b[1] * ch, br = b[2] * cw, g = q.createRadialGradient(bx - br * 0.3, by - br * 0.3, 0, bx, by, br); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(0.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); q.fillStyle = g; q.beginPath(); q.arc(bx, by, br, 0, 7); q.fill(); });
    (o.cracks || []).forEach(function (cr) { crackPath(q, cr, cw, ch, r, S, 'rgba(34,32,30,.92)', 'rgba(255,255,255,.4)'); });
    return c; }); }
  /* the mortar screed of a corridor or balcony as found: float marks, dust, cracks (o.cracks), a damp patch */
  function mortarFace(w, h, o) { o = o || {}; return once('mor:' + w + ':' + h + ':' + (o.clean ? 'c' : 'd'), function () { var S = PX * 0.55, cw = Math.round(w * S), ch = Math.round(h * S), c = mkCanvas(cw, ch), q = c.getContext('2d'), r = lcg(o.seed || 661), i, k;
    q.fillStyle = '#a19d94'; q.fillRect(0, 0, cw, ch); clouds(q, cw, ch, r, 6, 4, 0.3, 80, 170); clouds(q, cw, ch, r, 28, 20, 0.14, 90, 200);
    var pat = q.createPattern(greyNoise(128, 128, r, 60, 200), 'repeat'); q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.35; q.fillStyle = pat; q.fillRect(0, 0, cw, ch); q.restore();
    q.save(); q.globalCompositeOperation = 'overlay'; q.lineWidth = 0.005 * S; for (i = 0; i < 40; i++) { q.strokeStyle = i % 2 ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.12)'; q.beginPath(); q.arc(cw * (0.1 + r() * 0.8), ch * (0.9 + r() * 0.6), ch * (0.4 + i * 0.03), -2.5, -0.6); q.stroke(); } q.restore(); // the arcs of the float
    if (!o.clean) { q.globalAlpha = 0.55; for (i = 0; i < 3000; i++) { q.fillStyle = i % 3 ? 'rgba(70,64,54,.55)' : 'rgba(210,200,180,.6)'; q.beginPath(); q.arc(r() * cw, r() * ch, 0.6 + r() * 1.6, 0, 7); q.fill(); } q.globalAlpha = 1; if (o.damp) { var d = o.damp, dg = q.createRadialGradient(d[0] * cw, d[1] * ch, 0, d[0] * cw, d[1] * ch, d[2] * cw); dg.addColorStop(0, 'rgba(70,66,60,.45)'); dg.addColorStop(1, 'rgba(70,66,60,0)'); q.fillStyle = dg; q.fillRect(0, 0, cw, ch); } }
    (o.cracks || []).forEach(function (cr) { crackPath(q, cr, cw, ch, r, S, 'rgba(40,38,36,.92)', 'rgba(255,255,255,.35)'); });
    return c; }); }
  /* the dirt alone, on a transparent canvas (the overlay that the broom takes away): streaks, sand, the ring */
  function dirtLayer(w, h, o) { o = o || {}; return once('dirt:' + w + ':' + h + ':' + (o.kind || ''), function () { var S = PX * 0.45, cw = Math.round(w * S), ch = Math.round(h * S), c = mkCanvas(cw, ch), q = c.getContext('2d'), r = lcg(o.seed || 671), i; q.clearRect(0, 0, cw, ch);
    q.globalAlpha = 0.22; q.lineWidth = 2; for (i = 0; i < 140; i++) { q.strokeStyle = '#3e3c38'; var x0 = r() * cw, y0 = r() * ch * 0.6; q.beginPath(); q.moveTo(x0, y0); q.lineTo(x0 + (r() - 0.5) * 30, y0 + 50 + r() * ch * 0.35); q.stroke(); }
    q.globalAlpha = 0.7; for (i = 0; i < 4200; i++) { q.fillStyle = i % 3 ? 'rgba(66,60,50,.7)' : 'rgba(205,195,175,.8)'; q.beginPath(); q.arc(r() * cw, r() * ch, 0.6 + r() * 1.7, 0, 7); q.fill(); }
    q.globalAlpha = 1; var gd = q.createLinearGradient(0, 0, 0, ch * 0.14); gd.addColorStop(0, 'rgba(50,46,40,.45)'); gd.addColorStop(1, 'rgba(50,46,40,0)'); q.fillStyle = gd; q.fillRect(0, 0, cw, ch);
    var m = q.createLinearGradient(0, 0, cw, 0); q.save(); q.globalCompositeOperation = 'destination-in'; q.globalAlpha = 1; var cl = mkCanvas(cw, ch), cq = cl.getContext('2d'); cq.fillStyle = '#fff'; cq.fillRect(0, 0, cw, ch); clouds(cq, cw, ch, r, 5, 4, 0.9, 60, 255); q.drawImage(cl, 0, 0); q.restore(); void m; // patchy: more here, less there
    return c; }); }
  /* the sealant beads along the cracks, on a transparent canvas: a dark grey tooled bead, slightly wider than the crack */
  function sealLayer(w, h, cracks, S, wk) { S = S || PX * 0.45; wk = wk || 1; var cw = Math.round(w * S), ch = Math.round(h * S), c = mkCanvas(cw, ch), q = c.getContext('2d'), r = lcg(681), k; q.clearRect(0, 0, cw, ch);
    (cracks || []).forEach(function (cr) { var x = cr[0] * cw, y = cr[1] * ch, n = 14, dx = (cr[2] - cr[0]) * cw / n, dy = (cr[3] - cr[1]) * ch / n, pts = [[x, y]]; for (k = 1; k <= n; k++) { x += dx + (r() - 0.5) * 9; y += dy + (r() - 0.5) * 9; pts.push([x, y]); }
      [[0.016 * S * wk, 'rgba(70,72,74,.98)'], [0.009 * S * wk, 'rgba(96,98,100,.9)'], [0.0035 * S * wk, 'rgba(130,132,134,.6)']].forEach(function (pass) { q.lineWidth = pass[0]; q.strokeStyle = pass[1]; q.lineCap = 'round'; q.lineJoin = 'round'; q.beginPath(); pts.forEach(function (p, i) { if (i) q.lineTo(p[0], p[1]); else q.moveTo(p[0], p[1]); }); q.stroke(); }); });
    return c; }
  /* an aluminium termination bar / drip edge: brushed metal */
  var alu = once('alu', function () { var c = mkCanvas(256, 64), q = c.getContext('2d'), r = lcg(691), i; q.fillStyle = '#b9bdc0'; q.fillRect(0, 0, 256, 64); q.globalAlpha = 0.25; for (i = 0; i < 400; i++) { q.strokeStyle = i % 2 ? '#fff' : '#6c7073'; q.lineWidth = 0.6; var y = r() * 64; q.beginPath(); q.moveTo(0, y); q.lineTo(256, y + (r() - 0.5) * 2); q.stroke(); } return c; });
  /* the label of the 10 kg can: white band with the orange brand block */
  var canLabel = once('can', function () { var c = mkCanvas(512, 128), q = c.getContext('2d'); q.fillStyle = '#e9e9e7'; q.fillRect(0, 0, 512, 128); q.fillStyle = '#f97b00'; q.fillRect(0, 0, 512, 22); q.fillRect(0, 106, 512, 22); q.fillStyle = '#222'; q.font = 'bold 34px sans-serif'; q.fillText('UREAX-HG', 40, 74); q.fillStyle = '#f97b00'; q.fillRect(300, 40, 160, 44); q.fillStyle = '#fff'; q.font = 'bold 26px sans-serif'; q.fillText('AUTO', 336, 72); return c; });
  /* terracotta: warm fired clay with throwing lines, a little mica speckle and the pale lime bloom near the foot; a bump map of the throwing lines */
  var terracotta = function () { return once('terra', function () { var S = 256, c = mkCanvas(S, S), q = c.getContext('2d'), bm = mkCanvas(S, S), b = bm.getContext('2d'), r = lcg(731), i; q.fillStyle = '#b8643f'; q.fillRect(0, 0, S, S); clouds(q, S, S, r, 4, 4, 0.25, 120, 200); b.fillStyle = '#808080'; b.fillRect(0, 0, S, S);
    q.globalAlpha = 0.14; for (i = 0; i < 40; i++) { var y = r() * S; q.strokeStyle = i % 2 ? '#e0a07a' : '#7a3a20'; q.lineWidth = 1 + r() * 2; q.beginPath(); q.moveTo(0, y); q.lineTo(S, y + (r() - 0.5) * 2); q.stroke(); b.strokeStyle = i % 2 ? '#a0a0a0' : '#606060'; b.lineWidth = q.lineWidth; b.beginPath(); b.moveTo(0, y); b.lineTo(S, y); b.stroke(); }
    q.globalAlpha = 0.5; for (i = 0; i < 900; i++) { q.fillStyle = i % 5 ? 'rgba(60,30,18,.5)' : 'rgba(255,230,200,.8)'; q.beginPath(); q.arc(r() * S, r() * S, 0.5 + r() * 1.2, 0, 7); q.fill(); }
    q.globalAlpha = 1; var gd = q.createLinearGradient(0, S, 0, S * 0.6); gd.addColorStop(0, 'rgba(235,225,210,.55)'); gd.addColorStop(1, 'rgba(235,225,210,0)'); q.fillStyle = gd; q.fillRect(0, 0, S, S); // the lime bloom creeping up from the foot
    return { map: c, bump: bm }; }); };
  /* the blade of a snake plant: deep green with irregular pale cross-bands, a yellow margin on both edges, the fine longitudinal grain */
  var sansevieria = function () { return once('sans', function () { var W2 = 128, H2 = 512, c = mkCanvas(W2, H2), q = c.getContext('2d'), r = lcg(733), i, k; q.fillStyle = '#2f5a38'; q.fillRect(0, 0, W2, H2);
    for (i = 0; i < 26; i++) { var y = i * 20 + r() * 8, h = 5 + r() * 9; q.fillStyle = 'rgba(150,178,140,' + (0.45 + r() * 0.4) + ')'; q.beginPath(); q.moveTo(0, y); for (k = 0; k <= 8; k++) q.lineTo(k * W2 / 8, y + (r() - 0.5) * 7); for (k = 8; k >= 0; k--) q.lineTo(k * W2 / 8, y + h + (r() - 0.5) * 7); q.closePath(); q.fill(); }
    q.globalAlpha = 0.18; for (i = 0; i < 90; i++) { q.strokeStyle = i % 2 ? '#1c3a22' : '#6f9a6a'; q.lineWidth = 1; var x0 = r() * W2; q.beginPath(); q.moveTo(x0, 0); q.lineTo(x0 + (r() - 0.5) * 6, H2); q.stroke(); } q.globalAlpha = 1;
    var mg = 11; q.fillStyle = '#d8c455'; q.fillRect(0, 0, mg, H2); q.fillRect(W2 - mg, 0, mg, H2); q.fillStyle = 'rgba(190,170,70,.6)'; q.fillRect(mg, 0, 3, H2); q.fillRect(W2 - mg - 3, 0, 3, H2);
    var gd = q.createLinearGradient(0, 0, 0, H2); gd.addColorStop(0, 'rgba(255,255,255,0)'); gd.addColorStop(0.97, 'rgba(255,255,255,0)'); gd.addColorStop(1, 'rgba(120,90,40,.7)'); q.fillStyle = gd; q.fillRect(0, 0, W2, H2); // the darker tip
    return c; }); };
  /* the bag of silica sand: kraft paper with a band */
  var bagLabel = once('bag', function () { var c = mkCanvas(256, 256), q = c.getContext('2d'), r = lcg(707), i; q.fillStyle = '#e4dcc8'; q.fillRect(0, 0, 256, 256); q.globalAlpha = 0.12; for (i = 0; i < 1600; i++) { q.fillStyle = i % 2 ? '#fff' : '#7a6a50'; q.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); } q.globalAlpha = 1; q.fillStyle = '#2f3336'; q.fillRect(0, 96, 256, 40); q.fillStyle = '#fff'; q.font = 'bold 22px sans-serif'; q.fillText('SILICA SAND 0.35–0.5', 14, 124); return c; });
  return { PX: PX, puCoat: puCoat, frpFace: frpFace, ureFace: ureFace, mortarFace: mortarFace, dirtLayer: dirtLayer, sealLayer: sealLayer, crackPts: crackPts, alu: alu, canLabel: canLabel, bagLabel: bagLabel, terracotta: terracotta, sansevieria: sansevieria };
})();

/* ---------- the three applications ---------- */
var UX3D = (function () {
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function E(t) { t = clamp(t); return t * t * (3 - 2 * t); }
  var HG1 = 0x7b7d7e, HG2 = 0x878a8b; // grey ≈ N50; the second coat reads a shade lighter with its aggregate
  /* the materials of the system, made once per member */
  function mats(ctx, sub) {
    var keep = ctx.keep, RWm = ctx.RWm, RWp = ctx.RWp, M = {};
    M.hg1 = ctx.wettable(ctx.layerMat({ map: keep(canvasTex(UXTX.puCoat('#7b7d7e', { seed: 503 }), { wrap: RWm })), color: 0xffffff, roughness: 0.42, envMapIntensity: 0.6 }));
    M.hg2 = ctx.wettable(ctx.layerMat({ map: keep(canvasTex(UXTX.puCoat('#868889', { seed: 505, grit: 1 }), { wrap: RWm })), color: 0xffffff, roughness: 0.62, envMapIntensity: 0.45 })); // FU08: the second coat carries the aggregate
    M.hg2p = ctx.wettable(ctx.layerMat({ map: keep(canvasTex(UXTX.puCoat('#808283', { seed: 507 }), { wrap: RWm })), color: 0xffffff, roughness: 0.4, envMapIntensity: 0.62 })); // standard specification: a plain second coat of 0.6 kg/m²
    M.hg3 = ctx.wettable(ctx.layerMat({ map: keep(canvasTex(UXTX.puCoat('#848687', { seed: 509 }), { wrap: RWm })), color: 0xffffff, roughness: 0.38, envMapIntensity: 0.64 })); // the third coat
    M.grip = ctx.wettable(ctx.layerMat({ map: keep(canvasTex(UXTX.puCoat('#8a8c8d', { seed: 511, grit: 1 }), { wrap: RWm })), color: 0xffffff, roughness: 0.66, envMapIntensity: 0.42 })); // the anti-slip layer: 0.2 kg/m² with the silica sand
    M.prim = ctx.layerMat({ color: sub === 'frp' ? 0xe8d68c : 0xe4d38e, roughness: 0.14, envMapIntensity: 0.9, opacity: 0.28, depthWrite: false }); M.prim.userData.op = 0.28; // the member resets layer opacities at every stage; userData.op is the translucent one it keeps // the pale yellow one-component urethane primer, translucent
    M.seal = ctx.layerMat({ color: 0x9a9ea0, roughness: 0.5, envMapIntensity: 0.5 }); M.seal.userData.op = 1; // NON-BLEED QUICK: the grey, fast-curing adjustment sealant, tooled to a fillet and into the cracks, covered by the film
    M.term = ctx.layerMat({ color: 0x4c4f52, roughness: 0.38, envMapIntensity: 0.65 }); M.term.userData.op = 1; // EXCEED: the termination bead on the film edges, darker satin grey
    var RB = TEX.rebar(); M.rebar = ctx.mat({ map: keep(canvasTex(RB.map, { wrap: RWp, repeat: [1, 6] })), bumpMap: keep(canvasTex(RB.bump, { wrap: RWp, repeat: [1, 6], srgb: false })), bumpScale: 0.0012, color: 0x9a8a80, roughness: 0.7, metalness: ctx.mt(0.25), envMapIntensity: 0.4 }); // deformed bars, lightly rusted
    M.alu = ctx.mat({ map: keep(canvasTex(UXTX.alu, { wrap: RWp, repeat: [6, 1] })), color: 0xd0d4d7, metalness: ctx.mt(0.7), roughness: 0.38, envMapIntensity: 1 });
    M.frpEdge = ctx.mat({ color: 0x8d9490, roughness: 0.7, envMapIntensity: 0.3 }, ctx.concMats);
    M.puddle = ctx.mat({ color: 0x8fa3ad, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.45, envMapIntensity: 1.6, depthWrite: false });
    M.pot = ctx.mat({ color: 0xb5643c, roughness: 0.85 }); M.soil = ctx.mat({ color: 0x3d2f24, roughness: 1 }); M.leaf = ctx.mat({ color: 0x3f7a3a, roughness: 0.8 });
    M.can = ctx.mat({ map: keep(canvasTex(UXTX.canLabel, { wrap: RWp, repeat: [1, 1] })), color: 0xffffff, roughness: 0.5, metalness: ctx.mt(0.3), envMapIntensity: 0.6 }); M.canTop = ctx.mat({ color: 0xc9ccce, roughness: 0.4, metalness: ctx.mt(0.6), envMapIntensity: 0.8 });
    M.canIn = ctx.mat({ color: 0x8e9295, roughness: 0.5, metalness: ctx.mt(0.4), side: THREE.BackSide }); M.mixTop = ctx.mat({ map: M.hg2.map, color: 0xffffff, roughness: 0.25, envMapIntensity: 0.9 });
    M.bag = ctx.mat({ map: keep(canvasTex(UXTX.bagLabel, { wrap: RWp })), color: 0xffffff, roughness: 0.95 }); M.sand = ctx.mat({ color: 0xcfc3a6, roughness: 1 }); M.paddle = ctx.mat({ color: 0x4b4f53, metalness: ctx.mt(0.6), roughness: 0.5 });
    M.bottle = ctx.mat({ color: 0xf2f2ee, roughness: 0.55 }); M.cap = ctx.mat({ color: 0xf97b00, roughness: 0.5 }); M.meter = ctx.mat({ color: 0x3a3d40, roughness: 0.6 }); M.meterFace = ctx.mat({ color: 0xb9d7a2, roughness: 0.3, emissive: 0x2a4a1a, emissiveIntensity: 0.6 }); M.pin = ctx.mat({ color: 0xc9ccce, metalness: ctx.mt(0.8), roughness: 0.3 });
    return M;
  }
  /* the top face of a block gets the whole canvas: u along x, v from the far edge (v = 0) to the wall (v = 1) */
  function remapTop(me, x0, x1, z0, z1) { if (!me) return; var uv = me.geometry.attributes.uv, p = me.geometry.attributes.position, n = me.geometry.attributes.normal, k; for (k = 0; k < uv.count; k++) if (n.getY(k) > 0.5) uv.setXY(k, (p.getX(k) + me.position.x - x0) / (x1 - x0), 1 - (p.getZ(k) + me.position.z - z0) / (z1 - z0)); uv.needsUpdate = true; }
  /* an overlay plane over the floor (x0..x1, z 0..zf at height y) carrying a transparent canvas, cut at the saw in cut mode; its texture coordinates stay 0..1 over the whole floor */
  function overlay(ctx, canvas, x0, x1, z0, z1, y, o) { o = o || {}; var cut = ctx.cut, XC = ctx.XC, xa = cut ? Math.max(x0, XC) : x0; if (x1 <= xa + 1e-6) return null; var m = ctx.mat({ map: ctx.keep(canvasTex(canvas)), transparent: true, alphaTest: 0.02, roughness: o.rough || 0.9, envMapIntensity: 0.25, polygonOffset: true, polygonOffsetFactor: o.pof || -1, depthWrite: false }, o.list); var me = ctx.mesh(new THREE.PlaneGeometry(x1 - xa, z1 - z0), m, { noCast: true }); me.rotation.x = -Math.PI / 2; me.position.set((xa + x1) / 2, y, (z0 + z1) / 2); var uv = me.geometry.attributes.uv, k; for (k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) * (x1 - xa) + (xa - x0)) / (x1 - x0), uv.getY(k)); uv.needsUpdate = true; me.userData.m = m; return me; }
  /* the planter of the finished balcony: a thrown terracotta pot with its rim and foot on a saucer, moist soil with a few pebbles, and a snake plant
     (Sansevieria) — a dozen upright, folded, slightly twisted blades with the grey-green cross-banding and the yellow margin of the common variety */
  function planter(ctx, M, x, z) {
    var g = new THREE.Group(), keep = ctx.keep, r = lcg(701), i; ctx.g.add(g);
    var potTex = UXTX.terracotta(), potM = ctx.mat({ map: keep(canvasTex(potTex.map, { wrap: THREE.RepeatWrapping })), bumpMap: keep(canvasTex(potTex.bump, { wrap: THREE.RepeatWrapping, srgb: false })), bumpScale: 0.0008, color: 0xffffff, roughness: 0.88, envMapIntensity: 0.25 });
    var potIn = ctx.mat({ color: 0x8a4a2e, roughness: 0.92, side: THREE.BackSide }), saucerM = ctx.mat({ map: potM.map, color: 0xd9c4b0, roughness: 0.9 });
    var prof = [[0.055, 0.0], [0.09, 0.0], [0.092, 0.012], [0.094, 0.06], [0.104, 0.15], [0.113, 0.212], [0.124, 0.214], [0.126, 0.24], [0.12, 0.242], [0.113, 0.235]].map(function (p2) { return new THREE.Vector2(p2[0], p2[1]); }); // foot, belly, the rolled rim
    var pot = new THREE.Mesh(keep(new THREE.LatheGeometry(prof, 40)), potM); pot.castShadow = true; pot.receiveShadow = true; g.add(pot);
    var inner = new THREE.Mesh(keep(new THREE.LatheGeometry([[0.086, 0.04], [0.098, 0.14], [0.108, 0.235]].map(function (p2) { return new THREE.Vector2(p2[0], p2[1]); }), 40)), potIn); g.add(inner);
    var saucer = new THREE.Mesh(keep(new THREE.LatheGeometry([[0, 0], [0.115, 0], [0.122, 0.004], [0.128, 0.022], [0.122, 0.024], [0.116, 0.008], [0.1, 0.006], [0, 0.006]].map(function (p2) { return new THREE.Vector2(p2[0], p2[1]); }), 40)), saucerM); saucer.castShadow = true; saucer.receiveShadow = true; saucer.position.y = -0.0005; g.add(saucer); pot.position.y = 0.006;
    var soilM = ctx.mat({ map: keep(canvasTex(CRTX.soil, { wrap: THREE.RepeatWrapping, repeat: [0.8, 0.8] })), color: 0x5a4636, roughness: 1, envMapIntensity: 0.1 }), soil = new THREE.Mesh(keep(new THREE.CircleGeometry(0.104, 36)), soilM); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.205; soil.receiveShadow = true; g.add(soil);
    var pebM = ctx.mat({ color: 0xcfc6b8, roughness: 0.75 }); for (i = 0; i < 14; i++) { var pb = new THREE.Mesh(keep(new THREE.SphereGeometry(0.005 + r() * 0.007, 20, 14)), pebM), a2 = r() * 6.283, d2 = 0.035 + r() * 0.06; pb.position.set(Math.cos(a2) * d2, 0.207, Math.sin(a2) * d2); pb.scale.y = 0.55; pb.castShadow = true; g.add(pb); }
    /* the blades: a tapered, folded, gently twisted strip; each leans outward from the crown and carries its own banding */
    var leafM = ctx.mat({ map: keep(canvasTex(UXTX.sansevieria(), { wrap: THREE.RepeatWrapping })), color: 0xffffff, roughness: 0.55, envMapIntensity: 0.35, side: THREE.DoubleSide });
    function blade(H, W0, lean, twist, curve) { var NL = 22, NW = 6, pos = [], nor = [], uv = [], idx = [], k2, j2; for (k2 = 0; k2 <= NL; k2++) { var u = k2 / NL, hw2 = W0 * Math.pow(1 - Math.pow(u, 2.2), 0.55) * (0.55 + 0.45 * Math.sin(Math.min(1, u * 1.35) * Math.PI)), y = u * H, zc = curve * u * u * H, tw = twist * u; for (j2 = 0; j2 <= NW; j2++) { var v = j2 / NW * 2 - 1, xx = v * hw2, fold = (1 - Math.abs(v)) * hw2 * 0.55, xr = xx * Math.cos(tw), zr = xx * Math.sin(tw) - fold; pos.push(xr, y, zc + zr); nor.push(0, 0, 1); uv.push(j2 / NW, u * 0.98); } } for (k2 = 0; k2 < NL; k2++) for (j2 = 0; j2 < NW; j2++) { var a0 = k2 * (NW + 1) + j2, b0 = a0 + NW + 1; idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1); } var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals(); var me = new THREE.Mesh(keep(geo), leafM); me.castShadow = true; me.rotation.x = -lean; return me; }
    var crown = new THREE.Group(); crown.position.y = 0.2; g.add(crown); var NB = 13;
    for (i = 0; i < NB; i++) { var ang = i / NB * 6.283 + (r() - 0.5) * 0.5, ring = i % 3 === 0 ? 0.012 : i % 3 === 1 ? 0.03 : 0.046, H = 0.3 + r() * 0.3 - (ring - 0.03) * 2.5, b3 = blade(H, 0.022 + r() * 0.012, 0.12 + ring * 6 + r() * 0.12, (r() - 0.5) * 0.9, 0.12 + r() * 0.16); var arm = new THREE.Group(); arm.rotation.y = ang; b3.position.set(0, -0.01, ring); arm.add(b3); crown.add(arm); }
    g.position.set(x, 0, z); g.userData.home = g.position.clone(); g.visible = false; return g; }
  /* the mixing corner of the coat that carries the aggregate (FU08's second coat, or the anti-slip layer): the 18 kg can with its lid off, the bag of silica
     sand that is tipped over the rim so that it pours into the middle of the can, the accelerator bottle, the paddle mixer — on the floor, visible only while mixing */
  function mixKit(ctx, M, x, z) {
    var g = new THREE.Group(); ctx.g.add(g);
    var can = new THREE.Mesh(ctx.keep(new THREE.CylinderGeometry(0.135, 0.13, 0.26, 28, 1, true)), M.can); can.position.y = 0.13; can.castShadow = true; can.receiveShadow = true; g.add(can);
    var inner = new THREE.Mesh(ctx.keep(new THREE.CylinderGeometry(0.128, 0.124, 0.25, 28, 1, true)), M.canIn); inner.position.y = 0.132; g.add(inner); // the inside of the can
    var bottom = new THREE.Mesh(ctx.keep(new THREE.CircleGeometry(0.13, 28)), M.canTop); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.001; g.add(bottom);
    var rim = new THREE.Mesh(ctx.keep(new THREE.TorusGeometry(0.133, 0.005, 12, 40)), M.canTop); rim.rotation.x = Math.PI / 2; rim.position.y = 0.26; g.add(rim);
    var mix = new THREE.Mesh(ctx.keep(new THREE.CircleGeometry(0.127, 28)), M.mixTop); mix.rotation.x = -Math.PI / 2; mix.position.y = 0.2; g.add(mix); g.userData.mix = mix; // the coating in the can, its surface at 200 mm
    var lid = new THREE.Mesh(ctx.keep(new THREE.CylinderGeometry(0.14, 0.14, 0.012, 28)), M.canTop); lid.position.set(0.32, 0.006, 0.1); lid.castShadow = true; g.add(lid);
    /* the sand bag hangs on a pivot at its lower right edge: at rest it stands on the floor beside the can; poured, the pivot sits on the rim and the bag tips over the can so that its mouth is above the middle */
    var pivot = new THREE.Group(); g.add(pivot); var bag = new THREE.Mesh(ctx.keep(new THREE.BoxGeometry(0.15, 0.2, 0.09)), M.bag); bag.position.set(-0.075, 0.1, 0); bag.castShadow = true; pivot.add(bag);
    var mouth = new THREE.Mesh(ctx.keep(new THREE.BoxGeometry(0.11, 0.014, 0.06)), M.sand); mouth.position.set(-0.075, 0.2, 0); pivot.add(mouth); // the open top: the sand inside
    g.userData.pivot = pivot; pivot.userData.rest = new THREE.Vector3(-0.3, 0, 0.03); pivot.userData.pour = new THREE.Vector3(-0.13, 0.3, 0); pivot.userData.tilt = 0.95; pivot.userData.spout = new THREE.Vector3(-0.075, 0.207, 0); pivot.position.copy(pivot.userData.rest);
    var bottle = new THREE.Group(); var bb = new THREE.Mesh(ctx.keep(new THREE.CylinderGeometry(0.034, 0.036, 0.15, 18)), M.bottle); bb.position.y = 0.075; bb.castShadow = true; bottle.add(bb); var cap = new THREE.Mesh(ctx.keep(new THREE.CylinderGeometry(0.017, 0.017, 0.028, 24)), M.cap); cap.position.y = 0.164; bottle.add(cap); bottle.position.set(0.25, 0, -0.16); g.add(bottle); g.userData.bottle = bottle; // Accelerator S, 800 ml
    var paddle = new THREE.Group(); var shaft = new THREE.Mesh(ctx.keep(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 16)), M.paddle); shaft.position.y = 0.25; paddle.add(shaft); var blade = new THREE.Mesh(ctx.keep(new THREE.TorusKnotGeometry(0.045, 0.008, 40, 6, 2, 3)), M.paddle); blade.rotation.x = Math.PI / 2; blade.position.y = 0.03; paddle.add(blade); var head = new THREE.Mesh(ctx.keep(new THREE.BoxGeometry(0.07, 0.12, 0.14)), M.paddle); head.position.y = 0.55; paddle.add(head); var grip = new THREE.Mesh(ctx.keep(new THREE.BoxGeometry(0.2, 0.03, 0.03)), M.paddle); grip.position.set(0, 0.6, 0.06); paddle.add(grip); paddle.position.set(0, 0.06, 0); paddle.visible = false; g.add(paddle); g.userData.paddle = paddle; // the drill mixer
    g.position.set(x, 0, z); g.visible = false; return g; }
  /* the pin-type moisture meter: a hand-held body with its display, two pins pressed into the substrate (the warranty checklist: < 8 %) */
  function moistureMeter(ctx, M) { var g = new THREE.Group(); var body = new THREE.Mesh(ctx.keep(new THREE.BoxGeometry(0.07, 0.15, 0.028)), M.meter); body.position.set(0, 0, -0.04); body.castShadow = true; g.add(body); var face = new THREE.Mesh(ctx.keep(new THREE.PlaneGeometry(0.05, 0.03)), M.meterFace); face.position.set(0, 0.04, -0.0545); face.rotation.y = Math.PI; g.add(face); [-0.012, 0.012].forEach(function (dx) { var pin = new THREE.Mesh(ctx.keep(new THREE.CylinderGeometry(0.0018, 0.001, 0.03, 16)), M.pin); pin.rotation.x = Math.PI / 2; pin.position.set(dx, -0.06, -0.012); g.add(pin); }); g.userData.lip = 0.06; g.visible = false; ctx.g.add(g); return g; }
  /* the reinforcement of the structure: D10 mesh top and bottom in the slab, two layers of vertical D13 and horizontal D10 in the wall or parapet. Hidden in the concrete until
     the x-ray; at the saw face of the cut member the bars along x show as cut circles and one bar of each layer lies exposed along the cut */
  function rebars(ctx, M, kind) {
    var P = ctx.P, S = ctx.S, W = ctx.W, cut = ctx.cut, XC = ctx.XC, keep = ctx.keep, g = ctx.g, D = S.zf, zb = ctx.zb, top = P.frp || 0, sp = 0.2, cv = 0.03, r10 = 0.005, r13 = 0.0065, list = [], x, y, z;
    function bar(r, a, b, axis, at1, at2) { var L = b - a; if (L <= 0.01) return; var me = new THREE.Mesh(keep(new THREE.CylinderGeometry(r, r, L, 16)), M.rebar); me.castShadow = false; me.receiveShadow = true; if (axis === 'x') { me.rotation.z = Math.PI / 2; me.position.set((a + b) / 2, at1, at2); } else if (axis === 'z') { me.rotation.x = Math.PI / 2; me.position.set(at1, at2, (a + b) / 2); } else me.position.set(at1, (a + b) / 2, at2); g.add(me); list.push(me); }
    var xa = cut ? XC - 0.0006 : -S.x, yB = -S.y + cv + r10, yT = -top - cv - r10, ySub = kind === 'mortar' ? -P.screed : -top;
    if (kind === 'mortar') yT = ySub - cv - r10;
    for (z = S.zb + cv + 0.06; z < D - cv; z += sp) { bar(r10, xa, S.x, 'x', yB, z); bar(r10, xa, S.x, 'x', yT, z); } // the slab mesh along x: their ends show on the cut face
    var xs = []; if (cut) { xs.push(XC + 0.0044); for (x = XC + 0.2; x < S.x - 0.05; x += sp) xs.push(x); } else for (x = -S.x + 0.1; x < S.x - 0.05; x += sp) xs.push(x);
    xs.forEach(function (x2) { bar(r10, S.zb + cv, D - cv, 'z', x2, yB + 2 * r10 + 0.0005); bar(r10, S.zb + cv, D - cv, 'z', x2, yT - 2 * r10 - 0.0005); });
    var segs = [[xa, S.x]], y0 = -S.y + 0.06, y1 = W.h - 0.05, WI = kind === 'mortar' ? P.window : null;
    if (kind === 'frp') segs = cut ? [[Math.max(XC, P.door.x1) + 0.02, S.x]] : [[-S.x, P.door.x0 - 0.02], [P.door.x1 + 0.02, S.x]];
    [[zb + cv + r13, 1], [-cv - r13, -1]].forEach(function (L2) { var zl = L2[0], zh = zl + L2[1] * (r13 + r10 + 0.0005);
      segs.forEach(function (seg) {
        for (x = seg[0] + (cut && seg[0] < XC + 0.01 ? 0.005 : 0.08); x < seg[1] - 0.03; x += sp) { if (WI && x > WI.x0 - 0.02 && x < WI.x1 + 0.02) { bar(r13, y0, WI.y0 - 0.03, 'y', x, zl); bar(r13, WI.y1 + 0.03, y1, 'y', x, zl); } else bar(r13, y0, y1, 'y', x, zl); }
        for (y = y0 + 0.08; y < y1; y += sp) { if (WI && y > WI.y0 - 0.02 && y < WI.y1 + 0.02) { if (seg[0] < WI.x0 - 0.06) bar(r10, seg[0], WI.x0 - 0.03, 'x', y, zh); if (seg[1] > WI.x1 + 0.06) bar(r10, WI.x1 + 0.03, seg[1], 'x', y, zh); } else bar(r10, seg[0], seg[1], 'x', y, zh); }
      }); });
    return list; }

  /* ================= the FRP balcony (FU08) ================= */
  var CRACKS_F = [[0.62, 0.2, 0.74, 0.62], [0.3, 0.62, 0.42, 0.97], [0.86, 0.72, 0.97, 0.9]]; // in canvas fractions: u along x, v = 0 at the wall
  var PUDDLE_F = [0.6, 0.55, 0.12, 0.09];
  var frpApp = {
    W: { w: 1.4, h: 1.1, t: 0.25 }, S: { x: 1.05, y: 0.25, zb: -0.25, zf: 1.0 }, frp: 0.004, up: 0.12, skirt: 0.1, room: { rt: 0.25, lt: 0 }, door: { x0: -0.5, x1: 0.36 }, drain: { x: 0.72, z: 0.8, r: 0.08 }, XC: 0, shift: 0.14, ground: -0.3, floor: 0, sub: 'frp',
    cam: { full: { az: -33, el: 38, dist: 3.4, t: [0.05, 0.2, 0.42] }, cut: { az: -52, el: 26, dist: 3.1, t: [0.36, 0.22, 0.42] } },
    build: function (ctx) { buildFloor(ctx, 'frp'); },
    state: function (st, ctx) { stateFloor(st, ctx); },
    anchors: function (id, a, o, ctx) { anchorsFloor(id, a, o, ctx, 'frp'); },
    rig: function (R) { rigFloor(R, 'frp'); },
    micro: function (M) { return microFloor(M, 'frp'); }
  };
  /* ================= the mortar corridor / balcony ================= */
  var CRACKS_M = [[0.2, 0.15, 0.36, 0.55], [0.7, 0.4, 0.62, 0.95]];
  var mortarApp = {
    W: { w: 1.4, h: 1.1, t: 0.25 }, S: { x: 1.05, y: 0.25, zb: -0.25, zf: 1.0 }, frp: 0, screed: 0.04, up: 0, skirt: 0.15, room: { rt: 0.25, lt: 0 }, window: { x0: -0.35, x1: 0.45, y0: 0.55, y1: 1.05 }, drain: null, XC: 0, shift: 0.14, ground: -0.3, floor: 0, sub: 'mortar',
    cam: { full: { az: -33, el: 38, dist: 3.4, t: [0.05, 0.2, 0.42] }, cut: { az: -52, el: 26, dist: 3.1, t: [0.36, 0.22, 0.42] } },
    build: function (ctx) { buildFloor(ctx, 'mortar'); }, state: function (st, ctx) { stateFloor(st, ctx); }, anchors: function (id, a, o, ctx) { anchorsFloor(id, a, o, ctx, 'mortar'); }, rig: function (R) { rigFloor(R, 'mortar'); }, micro: function (M) { return microFloor(M, 'mortar'); }
  };
  /* ================= the flat roof over an old urethane membrane ================= */
  var CRACKS_R = [[0.55, 0.3, 0.7, 0.75]], BLISTERS_R = [[0.3, 0.45, 0.05], [0.42, 0.25, 0.035]];
  var roofApp = {
    W: { w: 1.4, h: 0.55, t: 0.2 }, S: { x: 1.05, y: 0.25, zb: -0.2, zf: 1.0 }, frp: 0.003, up: 0.2, skirt: 0.19, room: { rt: 0.2, lt: 0 }, drain: { x: 0.68, z: 0.78, r: 0.09 }, coping: true, XC: 0, shift: 0.14, ground: -0.3, floor: 0, sub: 'roof',
    cam: { full: { az: -33, el: 38, dist: 3.2, t: [0.05, 0.12, 0.42] }, cut: { az: -52, el: 27, dist: 2.9, t: [0.36, 0.12, 0.42] } },
    build: function (ctx) { buildFloor(ctx, 'roof'); }, state: function (st, ctx) { stateFloor(st, ctx); }, anchors: function (id, a, o, ctx) { anchorsFloor(id, a, o, ctx, 'roof'); }, rig: function (R) { rigFloor(R, 'roof'); }, micro: function (M) { return microFloor(M, 'roof'); }
  };

  function buildFloor(ctx, kind) {
    var P = ctx.P, W = P.W, S = P.S, hw = ctx.hw, zb = ctx.zb, cut = ctx.cut, XC = ctx.XC, parts = ctx.parts, block = ctx.block, mesh = ctx.mesh, keep = ctx.keep, Coat = ctx.Coat, KIT = ctx.KIT, K2 = ctx.K2, noise = ctx.noise, RWp = ctx.RWp, RWm = ctx.RWm, g = ctx.g, D = S.zf, M = mats(ctx, kind); parts.M = M; parts.kind = kind;
    var top = P.frp || 0, x0c = cut ? XC : -hw, cracks = kind === 'frp' ? CRACKS_F : kind === 'mortar' ? CRACKS_M : CRACKS_R;
    parts.cracks = cracks; parts.puddleUV = kind === 'frp' ? PUDDLE_F : kind === 'mortar' ? [0.35, 0.6, 0.1, 0.075] : [0.6, 0.62, 0.1, 0.08];
    /* the substrate: the slab; over it the existing FRP skin (frp), the mortar screed (mortar) or the old urethane membrane (roof), each with its face as found and its clean twin */
    var faceD = kind === 'frp' ? UXTX.frpFace(2 * S.x, D, { cracks: cracks, puddle: PUDDLE_F }) : kind === 'mortar' ? UXTX.mortarFace(2 * S.x, D, { cracks: cracks, damp: [0.35, 0.6, 0.12] }) : UXTX.ureFace(2 * S.x, D, { cracks: cracks, blisters: BLISTERS_R });
    var faceC = kind === 'frp' ? UXTX.frpFace(2 * S.x, D, { cracks: cracks, clean: true }) : kind === 'mortar' ? UXTX.mortarFace(2 * S.x, D, { cracks: cracks, clean: true }) : UXTX.ureFace(2 * S.x, D, { cracks: cracks, clean: true });
    var topD = ctx.mat({ map: keep(canvasTex(faceD)), roughness: kind === 'mortar' ? 0.97 : 0.9, envMapIntensity: kind === 'mortar' ? 0.2 : 0.25 }, ctx.concMats), topC = ctx.mat({ map: keep(canvasTex(faceC)), roughness: kind === 'mortar' ? 0.95 : 0.84, envMapIntensity: kind === 'mortar' ? 0.22 : 0.3 }, ctx.concMats); parts.topD = topD; parts.topC = topC;
    var screedM = kind === 'mortar' ? ctx.mat({ map: keep(canvasTex(TEX.slab(), { wrap: RWp, repeat: [0.8, 0.8] })), color: 0xd9d6cd, roughness: 0.92, envMapIntensity: 0.3 }, ctx.concMats) : null;
    if (kind === 'mortar') { block(-S.x, S.x, -S.y, -P.screed, S.zb, D, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); parts.floor = block(-S.x, S.x, -P.screed, 0, 0, D, ['sc', 'sc', 'top', 'sc', 'sc', 'sc'], { sc: screedM, top: topD }); }
    else { block(-S.x, S.x, -S.y, -top, S.zb, D, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed']); parts.floor = block(-S.x, S.x, -top, 0, 0, D, ['fe', 'fe', 'top', 'fe', 'fe', 'fe'], { fe: M.frpEdge, top: topD }); }
    remapTop(parts.floor, -S.x, S.x, 0, D); if (parts.floor) { parts.floor.userData.mats = parts.floor.material; }
    /* the walls: the house wall with the balcony door (frp), the house wall with a window (mortar), the parapet with its coping (roof) */
    var renderM = ctx.mat({ map: keep(canvasTex(CRTX.mortar(0.5, 0.5, 781, { tone: '#d8d3c6', grain: 0.9, dens: 0.4, k: 0.6, felt: true }), { wrap: RWm })), color: 0xe8e4da, roughness: 0.96, envMapIntensity: 0.22 }, ctx.concMats); ctx.UVR.render = [0.5, 0.5];
    var yW0 = kind === 'mortar' ? -P.screed : -top, wallKeys = ['formed', 'formed', 'formed', 'formed', 'render', 'formed'], wm = { render: renderM };
    if (kind === 'frp') { var DO = P.door; ctx.setWall(block(-hw, DO.x0, yW0, W.h, zb, 0, ['render', 'formed', 'formed', 'formed', 'render', 'formed'], wm)); block(DO.x1, hw, yW0, W.h, zb, 0, ['formed', 'render', 'formed', 'formed', 'render', 'formed'], wm); block(-S.x, -hw, yW0, W.h, zb, 0, wallKeys, wm, 'formed'); block(hw + P.room.rt, S.x, yW0, W.h, zb, 0, wallKeys, wm, 'formed'); }
    else if (kind === 'mortar') { var WI = P.window; ctx.setWall(block(-hw, WI.x0, yW0, W.h, zb, 0, ['render', 'formed', 'formed', 'formed', 'render', 'formed'], wm)); block(WI.x1, hw, yW0, W.h, zb, 0, ['formed', 'render', 'formed', 'formed', 'render', 'formed'], wm); block(WI.x0, WI.x1, yW0, WI.y0, zb, 0, wallKeys, wm); block(WI.x0, WI.x1, WI.y1, W.h, zb, 0, wallKeys, wm); block(-S.x, -hw, yW0, W.h, zb, 0, wallKeys, wm, 'formed'); block(hw + P.room.rt, S.x, yW0, W.h, zb, 0, wallKeys, wm, 'formed'); }
    else { ctx.setWall(block(-S.x, S.x, yW0, W.h, zb, 0, ['formed', 'formed', 'formed', 'formed', 'formed', 'formed'])); var cop = block(cut ? XC : -S.x, S.x, W.h, W.h + 0.04, zb - 0.03, 0.03, ['e', 'e', 'e', 'e', 'e', 'e'], { e: M.alu }, 'e'); if (cop) cop.castShadow = true; }
    /* the existing membrane turned up the wall and its termination bar (frp, roof); the puddle in the low spot */
    if (P.up) { var upM = kind === 'frp' ? M.frpEdge : ctx.mat({ color: 0xa6a7a3, roughness: 0.82, envMapIntensity: 0.3 }, ctx.concMats); parts.upstand = block(x0c, kind === 'frp' ? hw : S.x, 0, P.up, 0, top, ['u', 'u', 'u', 'u', 'u', 'u'], { u: upM }, 'u'); parts.bar = block(x0c, kind === 'frp' ? hw : S.x, P.up, P.up + 0.02, 0, 0.008, ['e', 'e', 'e', 'e', 'e', 'e'], { e: M.alu }, 'e'); }
    var doorSpan = kind === 'frp' ? P.door : null, onlyW = function (x, a, kind2) { if (kind2 === 'wall' && doorSpan && x > doorSpan.x0 + 0.01 && x < doorSpan.x1 - 0.01) return false; return true; };
    var pu = parts.puddleUV; parts.puddle = mesh(new THREE.CircleGeometry(1, 40), M.puddle, { noCast: true }); parts.puddle.rotation.x = -Math.PI / 2; parts.puddle.position.set(-S.x + pu[0] * 2 * S.x, 0.0012, pu[1] * D); parts.puddle.scale.set(pu[2] * 2 * S.x, pu[3] * D, 1); if (cut && parts.puddle.position.x - parts.puddle.scale.x < XC) parts.puddle.scale.x = Math.max(0.02, parts.puddle.position.x - XC);
    /* the drip edge at the free edge */
    var edgeM = ctx.mat({ color: 0xaeb3b7, metalness: ctx.mt(0.6), roughness: 0.4, envMapIntensity: 1 }); parts.edge = block(-S.x, S.x, -0.06, 0.003, D - 0.002, D + 0.004, ['e', 'e', 'e', 'e', 'e', 'e'], { e: edgeM }, 'e');
    /* the dirt as found, taken away by the broom; the sealant beads that appear along the cracks; the blisters of the roof, cut out at the preparation */
    var dirtC = UXTX.dirtLayer(2 * S.x, D, { kind: kind }); parts.dirt = overlay(ctx, dirtC, -S.x, S.x, 0, D, 0.0006, { list: ctx.concMats });
    var RD = KIT ? KIT.raster(x0c, S.x, 0.01, D - 0.01, 0.22, noise, false) : null; parts.dirtRaster = RD;
    parts.dirtMask = KIT && parts.dirt ? KIT.mask(220, 120, function (u, v) { var x = -S.x + u * 2 * S.x, z = D - v * D; return RD ? 0.01 + RD.order(x, z) * 0.98 : 1 - v; }, true) : null; if (parts.dirtMask && parts.dirt) { parts.dirt.userData.m.alphaMap = parts.dirtMask.tex; CRPrepKit.rawAlpha(parts.dirt.userData.m); }
    /* the substrate adjustment with NON-BLEED QUICK: the fillet along the wall–floor joint, up the corner and along the return wall, and a tooled bead in every crack — each cut by its own clip plane so the gun can lay it */
    var RS = 0.02, zJ = top, pX = ctx.plane('sealX', -1, 0, 0), pY = ctx.plane('sealY', 0, -1, 0), pZ = ctx.plane('sealZ', 0, 0, -1), pC = ctx.plane('sealC', -1, 0, 0);
    parts.filletX = ctx.coveShell(x0c, hw, 0, zJ, RS, 0, M.seal, M.seal, pX); parts.filletX.castShadow = false;
    (function () { var m2 = keep(M.seal.clone()); m2.clippingPlanes = [pY]; m2.side = THREE.DoubleSide; ctx.layerMats.push(m2); var corner = mesh(ctx.coveGeo(0, P.skirt + 0.02, 0, 0, RS, 0, false), [m2, m2], { noCast: true }); corner.rotation.z = Math.PI / 2; corner.position.set(hw, 0, zJ); parts.filletY = corner; if (cut && hw < XC) corner.visible = false;
      var m3 = keep(M.seal.clone()); m3.clippingPlanes = [pZ]; m3.side = THREE.DoubleSide; ctx.layerMats.push(m3); var ret = mesh(ctx.coveGeo(0, D - zJ - 0.01, 0, 0, RS, 0, false), [m3, m3], { noCast: true }); ret.rotation.y = -Math.PI / 2; ret.position.set(hw, 0, zJ); parts.filletZ = ret; })();
    parts.crackRibbons = []; var mK = ctx.mat({ color: 0x1f1d1b, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 }, ctx.concMats);
    cracks.forEach(function (cr) { var pts = UXTX.crackPts(cr, 2 * S.x, D), v3 = pts.map(function (p2) { return new THREE.Vector3(-S.x + p2[0], 0.0008, p2[1]); }).filter(function (v) { return !cut || v.x > XC + 0.01; }); if (v3.length < 3) return; var rib = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v3), 40, 0.0045, 14, false), mK, { noCast: true }); rib.scale.y = 0.22; parts.crackRibbons.push(rib); });
    parts.beads = []; var mB = keep(M.seal.clone()); mB.clippingPlanes = [pC]; ctx.layerMats.push(mB); mB.userData.op = 1;
    cracks.forEach(function (cr) { var pts = UXTX.crackPts(cr, 2 * S.x, D), v3 = pts.map(function (p2) { return new THREE.Vector3(-S.x + p2[0], 0.0022, p2[1]); }).filter(function (v) { return !cut || v.x > XC + 0.01; }); if (v3.length < 3) return; var curve = new THREE.CatmullRomCurve3(v3), tube = mesh(new THREE.TubeGeometry(curve, 40, 0.011, 14, false), mB, { noCast: true }); tube.scale.y = 0.17; tube.position.y = 0.0012 - 0.0022 * 0.17; parts.beads.push(tube); }); // 22 mm wide, standing about 1.8 mm proud: under the first coat's plane
    parts.sealClips = { x: pX, y: pY, z: pZ, c: pC };
    if (kind === 'roof') { parts.patches = []; BLISTERS_R.forEach(function (b) { var bx = -S.x + b[0] * 2 * S.x, bz = b[1] * D, br = b[2] * 2 * S.x; if (cut && bx + br < XC) return; var pm = ctx.layerMat({ map: keep(canvasTex(CRTX.mortar(0.3, 0.3, 771, { tone: '#c9c7bf', grain: 1.2, dens: 0.6, k: 0.6 }))), color: 0xd8d6cf, roughness: 0.96 }); var p = mesh(new THREE.CircleGeometry(br * 1.15, 24), pm, { noCast: true }); p.rotation.x = -Math.PI / 2; p.position.set(bx, 0.0014, bz); p.visible = false; parts.patches.push(p); }); }
    /* the coats of the chosen specification — over the floor and up the wall (the skirt), round the drain but not into it: the primer, the first coat, the second coat
       (FU08: with the aggregate; standard: plain 0.6 kg/m²), the third coat where the thickness asks for it, the anti-slip layer where it is wanted */
    var SP = window.UX_SPEC || { spec: 'fu08', grip: true, coats: 2, mix: 'coat2' }, fu = SP.spec === 'fu08'; parts.SP = SP;
    var dr = P.drain, onlyP = function (x, z, kind2) { if (!onlyW(x, z, kind2)) return false; return kind2 !== 'floor' || !dr || Math.hypot(x - dr.x, z - dr.z) > dr.r + 0.02; };
    var skirt = function (off) { return { kind: 'wall', x0: -hw, x1: hw, a0: 0.0, a1: P.skirt, off: off }; };
    parts.prim = new Coat([skirt(0.0012 + top), { kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: D - 0.01, off: 0.0024 }], M.prim, 0, { rowH: 0.16, rep: 1, maskW: 90, only: onlyP });
    parts.c1 = new Coat([skirt(0.002 + top), { kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: D - 0.008, off: 0.0032 }], M.hg1, 0.0006, { rowH: 0.12, rep: 0.25, only: onlyP });
    parts.c2 = new Coat([skirt(0.0028 + top), { kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: D - 0.008, off: 0.0038 }], fu ? M.hg2 : M.hg2p, fu ? 0.0004 : 0.0006, { rowH: 0.12, rep: 0.25, only: onlyP });
    var offW = 0.0028 + top, offF = 0.0038, roomCoats = [{ k: 'prim', m: M.prim, off: 0.0012 + top, a0: 0.0, a1: P.skirt, rowH: 0.16, rep: 1, maskW: 90, follow: true }, { k: 'c1', m: M.hg1, off: 0.002 + top, a0: 0.0, a1: P.skirt }, { k: 'c2', m: fu ? M.hg2 : M.hg2p, off: offW, a0: 0.0, a1: P.skirt, follow: true }];
    if (SP.coats > 2) { offW += 0.0008; offF += 0.0008; parts.c3 = new Coat([skirt(offW), { kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: D - 0.008, off: offF }], M.hg3, 0.0006, { rowH: 0.12, rep: 0.25, only: onlyP }); roomCoats.push({ k: 'c3', m: M.hg3, off: offW, a0: 0.0, a1: P.skirt, follow: true }); }
    if (!fu && SP.grip) { offF += 0.0006; parts.grip = new Coat([{ kind: 'floor', x0: -hw, x1: hw, a0: 0.0, a1: D - 0.008, off: offF }], M.grip, 0.0003, { rowH: 0.12, rep: 0.25, only: onlyP }); } // the anti-slip layer is a floor layer: the upstands stay plain
    parts.filmTop = { wall: offW, floor: offF };
    /* the termination of the film with EXCEED: a tooled bead along the top edge of the skirt on the wall (outside the door) and on the return wall, each laid by the gun behind a clip plane */
    var pT = ctx.plane('termX', -1, 0, 0), pTZ = ctx.plane('termZ', 0, 0, -1), mT = keep(M.term.clone()); mT.clippingPlanes = [pT]; ctx.layerMats.push(mT); mT.userData.op = 1; var mTZ = keep(M.term.clone()); mTZ.clippingPlanes = [pTZ]; ctx.layerMats.push(mTZ); mTZ.userData.op = 1;
    var tSegs = kind === 'frp' ? [[-hw, P.door.x0 - 0.01], [P.door.x1 + 0.01, hw]] : [[-hw, hw]], rT = 0.009; parts.termBeads = [];
    tSegs.forEach(function (sg) { var xa2 = Math.max(sg[0], x0c), xb2 = sg[1]; if (xb2 - xa2 < 0.02) return; var me = mesh(new THREE.CylinderGeometry(rT, rT, xb2 - xa2, 18), mT, { noCast: true }); me.rotation.z = Math.PI / 2; me.scale.set(1, 1, 0.55); me.position.set((xa2 + xb2) / 2, P.skirt + 0.001, offW + 0.003); parts.termBeads.push(me); });
    (function () { var me = mesh(new THREE.CylinderGeometry(rT, rT, D - 0.02 - (top + 0.01), 18), mTZ, { noCast: true }); me.rotation.x = Math.PI / 2; me.scale.set(0.55, 1, 1); me.position.set(hw - offW - 0.003, P.skirt + 0.001, (top + 0.01 + D - 0.02) / 2); parts.termBeadZ = me; if (cut && hw < XC) me.visible = false; })();
    parts.termClips = { x: pT, z: pTZ }; parts.termSpan = { x0: x0c, x1: hw, z0: top + 0.01, z1: D - 0.02 };
    parts.blob = mesh(new THREE.SphereGeometry(0.009, 20, 14), M.seal, { noCast: true }); parts.blob.scale.set(1, 0.7, 1); parts.blob.visible = false; // the sealant leaving the nozzle
    /* the reinforcement of the slab and the wall */
    parts.rebars = rebars(ctx, M, kind);
    /* the room: the return wall with the same skirt, the door / window / coping, the railing, the drain, a lamp */
    var Rm = ctx.room({ rt: P.room.rt, lt: 0, keysR: ['formed', 'render', 'formed', 'formed', 'formed', 'formed'], mats: { render: renderM }, cutKey: 'formed', h: W.h,
      coats: roomCoats,
      fittings: function (RK, F, R) {
        var M2 = RK.M; parts.RK = RK; parts.F = F;
        function bx(w, h, d, m, pos, parent) { var me = new THREE.Mesh(keep(new THREE.BoxGeometry(w, h, d)), m); me.position.set(pos[0], pos[1], pos[2]); me.castShadow = true; me.receiveShadow = true; (parent || g).add(me); return me; }
        if (kind === 'frp') { // the balcony door: threshold, frame, the leaf with its glass, the dark of the room
          var DO = P.door, x0d = DO.x0, x1d = DO.x1, wD = x1d - x0d, cx = (x0d + x1d) / 2, H = W.h, frameM = M2.black, glassM = keep(new THREE.MeshStandardMaterial({ color: 0xbfd6e0, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0, envMapIntensity: 1.4, depthWrite: false, side: THREE.DoubleSide })), darkM = keep(new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.9 }));
          if (!cut || x1d > XC) { bx(wD, 0.035 + top, 0.12, M2.ssDull, [cx, (0.035 - top) / 2, -0.06]); bx(0.06, H - 0.035, 0.07, frameM, [x0d + 0.03, 0.035 + (H - 0.035) / 2, -0.06]); bx(0.06, H - 0.035, 0.07, frameM, [x1d - 0.03, 0.035 + (H - 0.035) / 2, -0.06]); bx(wD - 0.12, 0.1, 0.055, frameM, [cx, 0.085, -0.06]); bx(0.05, H - 0.14, 0.055, frameM, [cx + 0.04, 0.135 + (H - 0.14) / 2, -0.06]); var gl = new THREE.Mesh(keep(new THREE.PlaneGeometry(wD - 0.12, H - 0.14)), glassM); gl.position.set(cx, 0.135 + (H - 0.14) / 2, -0.06); g.add(gl); var hd = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 18)), M2.ss); hd.position.set(cx + 0.09, 0.98, -0.02); hd.castShadow = true; g.add(hd); var bk = new THREE.Mesh(keep(new THREE.PlaneGeometry(wD + 0.1, H + 0.1)), darkM); bk.position.set(cx, H / 2, -0.24); g.add(bk); }
        }
        if (kind === 'mortar') { // the window: an aluminium sash with two panes in the opening
          var WI = P.window, x0w = WI.x0, x1w = WI.x1, cw = (x0w + x1w) / 2, glassM2 = keep(new THREE.MeshStandardMaterial({ color: 0xbfd6e0, transparent: true, opacity: 0.4, roughness: 0.05, metalness: 0, envMapIntensity: 1.4, depthWrite: false, side: THREE.DoubleSide })), darkM2 = keep(new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.9 }));
          if (!cut || x1w > XC) { bx(x1w - x0w, 0.04, 0.09, M.alu, [cw, WI.y0 + 0.02, -0.05]); bx(x1w - x0w, 0.04, 0.06, M.alu, [cw, WI.y1 - 0.02, -0.06]); bx(0.04, WI.y1 - WI.y0, 0.06, M.alu, [x0w + 0.02, (WI.y0 + WI.y1) / 2, -0.06]); bx(0.04, WI.y1 - WI.y0, 0.06, M.alu, [x1w - 0.02, (WI.y0 + WI.y1) / 2, -0.06]); bx(0.03, WI.y1 - WI.y0, 0.05, M.alu, [cw, (WI.y0 + WI.y1) / 2, -0.06]); var gw = new THREE.Mesh(keep(new THREE.PlaneGeometry(x1w - x0w - 0.08, WI.y1 - WI.y0 - 0.08)), glassM2); gw.position.set(cw, (WI.y0 + WI.y1) / 2, -0.06); g.add(gw); var bk2 = new THREE.Mesh(keep(new THREE.PlaneGeometry(x1w - x0w + 0.1, WI.y1 - WI.y0 + 0.1)), darkM2); bk2.position.set(cw, (WI.y0 + WI.y1) / 2, -0.22); g.add(bk2); }
        }
        if (kind !== 'roof') { // the railing along the free edge: posts, handrail, bottom rail, vertical bars
          var zR = D - 0.06, yTop = 1.07, xs = [-0.95, -0.35, 0.25, 0.85].filter(function (x) { return !cut || x > XC; }), rail = new THREE.Group(); g.add(rail); parts.railing = rail;
          function cy(r, len, m, pos, rot) { var me = new THREE.Mesh(keep(new THREE.CylinderGeometry(r, r, len, 24)), m); me.position.set(pos[0], pos[1], pos[2]); if (rot) me.rotation.set(rot[0], rot[1], rot[2]); me.castShadow = true; rail.add(me); return me; }
          xs.forEach(function (x) { cy(0.02, yTop, M2.steel, [x, yTop / 2 + 0.004, zR]); var bp = new THREE.Mesh(keep(new THREE.BoxGeometry(0.1, 0.008, 0.1)), M2.steel); bp.position.set(x, 0.008, zR); rail.add(bp); });
          var xa = cut ? XC : -S.x, xb = S.x; cy(0.021, xb - xa, M2.steel, [(xa + xb) / 2, yTop, zR], [0, 0, Math.PI / 2]); var br = new THREE.Mesh(keep(new THREE.BoxGeometry(xb - xa, 0.03, 0.03)), M2.steel); br.position.set((xa + xb) / 2, 0.13, zR); br.castShadow = true; rail.add(br);
          for (var xb2 = -S.x + 0.09; xb2 < S.x; xb2 += 0.11) { if (cut && xb2 < XC) continue; cy(0.006, yTop - 0.15, M2.steel, [xb2, 0.145 + (yTop - 0.15) / 2, zR]); }
        } else { // the roof: the coping runs on along the return parapet
          bx(P.room.rt + 0.06, 0.04, D - zb + 0.03, M.alu, [hw + P.room.rt / 2, W.h + 0.02, (zb + D) / 2]);
        }
        if (P.drain) { var gl2 = RK.gully(P.drain.r * 2); gl2.position.set(P.drain.x, 0.0015, P.drain.z); g.add(gl2); parts.gully = gl2; if (kind === 'roof') { var rim = new THREE.Mesh(keep(new THREE.RingGeometry(P.drain.r + 0.01, P.drain.r + 0.05, 32)), M.alu); rim.rotation.x = -Math.PI / 2; rim.position.set(P.drain.x, 0.0022, P.drain.z); g.add(rim); } }
        R.lamp([-0.3, 1.6, 0.8], [0.1, 0.1, 0.5], { intensity: kind === 'roof' ? 0.2 : 0.35, angle: 0.9 });
      } });
    parts.room = Rm;
    /* the mixing corner and the planter of the finished floor */
    parts.mixkit = mixKit(ctx, M, hw - 0.36, 0.36); parts.pot = planter(ctx, M, hw - 0.2, D - 0.28); parts.meter = moistureMeter(ctx, M); // inside the room, clear of the return wall
    if (cut) { parts.mixkit.position.x = Math.max(parts.mixkit.position.x, XC + 0.3); }
  }

  function stateFloor(st, ctx) {
    var parts = ctx.parts, F2 = st.F2, si = st.si, ST = st.ST, t = st.t, id = st.id, M = parts.M;
    var pr = F2('prep'), pm = F2('prime');
    if (parts.floor) parts.floor.material[2] = pr ? parts.topC : parts.topD;
    if (parts.dirt) { parts.dirt.visible = !pr; if (parts.dirtMask) parts.dirtMask.update(0); }
    if (parts.puddle) parts.puddle.visible = !pr;
    if (parts.patches) parts.patches.forEach(function (p) { p.visible = pr; p.scale.set(1, 1, 1); });
    if (parts.crackRibbons) parts.crackRibbons.forEach(function (rb) { rb.visible = !F2('coat1'); }); // the open crack disappears under the first coat (the bead over it has closed it)
    parts.prim.show(pm); parts.prim.set(pm ? 1 : 0);
    var se = F2('seal'), SC = parts.sealClips; if (SC) { SC.x.constant = se ? 10 : -10; SC.y.constant = se ? 10 : -10; SC.z.constant = se ? 10 : -10; SC.c.constant = se ? 10 : -10; }
    parts.c1.show(F2('coat1')); parts.c1.set(F2('coat1') ? 1 : 0); parts.c2.show(F2('coat2')); parts.c2.set(F2('coat2') ? 1 : 0);
    if (parts.c3) { parts.c3.show(F2('coat3')); parts.c3.set(F2('coat3') ? 1 : 0); } if (parts.grip) { parts.grip.show(F2('grip')); parts.grip.set(F2('grip') ? 1 : 0); }
    var dn = F2('done'), TC = parts.termClips; if (TC) { TC.x.constant = dn ? 10 : -10; TC.z.constant = dn ? 10 : -10; }
    var fc = F2('coat1') ? 0x7f8182 : 0x9a9ea0; [parts.filletX, parts.filletY, parts.filletZ].forEach(function (f) { if (!f) return; (Array.isArray(f.material) ? f.material : [f.material]).forEach(function (m) { m.color.setHex(fc); }); }); // the fillet is coated over with the film
    var wet = /coat|grip/.test(id) ? 0.6 : (id === 'done' ? 0.6 * (1 - t) : 0);
    ctx.wetLook.forEach(function (w) { if (w.m === M.hg1 || w.m === M.hg2 || w.m === M.hg2p || w.m === M.hg3 || w.m === M.grip) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.18 * wet); w.m.roughness = w.r - (w.r - 0.2) * wet; } });
    if (parts.mixkit) parts.mixkit.visible = false; if (parts.meter) parts.meter.visible = false; if (parts.blob) parts.blob.visible = false;
    if (parts.pot) { parts.pot.visible = dn && (si !== ST.indexOf('done') || t > 0.999); parts.pot.position.copy(parts.pot.userData.home); }
  }

  function anchorsFloor(id, a, o, ctx, kind) {
    var P = ctx.P, S = ctx.S, cut = ctx.cut, XC = ctx.XC, parts = ctx.parts, D = S.zf, xl = o.xl, xr2 = o.xr2, hw = ctx.hw, cr = parts.cracks[0], cx = -S.x + (cr[0] + cr[2]) / 2 * 2 * S.x, cz = (cr[1] + cr[3]) / 2 * D, pu = parts.puddleUV, px = -S.x + pu[0] * 2 * S.x, pz = pu[1] * D, SP = parts.SP || {}, fu = SP.spec === 'fu08';
    if (cut && cx < XC + 0.05) { cx = XC + 0.1; }
    var subK = kind === 'frp' ? 'frp' : kind === 'mortar' ? 'mortar' : 'ure', primK = kind === 'frp' ? 'prim55' : 'prim30', xRb = cut ? XC + 0.002 : -S.x + 0.3;
    if (id === 'state') { a(subK, xr2, 0.001, 0.45); if (kind === 'frp') a('chalk', xl, 0.001, 0.75); a(kind === 'mortar' ? 'crackM' : 'crackF', cx, 0.001, cz); if (kind !== 'mortar') a('puddle', Math.max(px, cut ? XC + 0.08 : px), 0.001, pz); if (kind === 'roof') { a('blister', -S.x + BLISTERS_R[0][0] * 2 * S.x, 0.002, BLISTERS_R[0][1] * D); a('parapet', xl, P.W.h - 0.1, 0.002); } else a('wallF', xl, 0.18, 0.002); if (P.drain) a('drainF', P.drain.x + 0.06, 0.003, P.drain.z + 0.02); if (cut) a('rebar', xRb, -S.y + 0.035, 0.5); if (kind !== 'roof' && parts.F) { var w2 = kind === 'frp' ? [(P.door.x0 + P.door.x1) / 2 + 0.2, 0.6, -0.05] : [(P.window.x0 + P.window.x1) / 2 + 0.15, P.window.y0 + 0.2, -0.05]; a(kind === 'frp' ? 'door' : 'window', w2[0], w2[1], w2[2]); a(kind === 'frp' ? 'railing' : 'handrail', 0.55, 1.0, D - 0.06); } }
    else if (id === 'prep') { a(kind === 'mortar' ? 'blast' : 'clean', xr2, 0.002, 0.5); a('wash', xl + 0.2, 0.002, 0.8); a('dryP', xl, 0.002, 0.25); a('meter', xr2 - 0.1, 0.002, 0.2); a(kind === 'mortar' ? 'crackM' : 'crackF', cx, 0.001, cz); if (kind === 'roof') a('cutB', -S.x + BLISTERS_R[0][0] * 2 * S.x, 0.002, BLISTERS_R[0][1] * D); }
    else if (id === 'prime') { a(primK, xr2, 0.003, 0.55); a('open', xl, 0.004, 0.2); a(kind === 'mortar' ? 'crackM' : 'crackF', cx, 0.001, cz); }
    else if (id === 'seal') { a('sealN', xl + 0.15, 0.012, 0.012); a('cornerN', hw - 0.01, P.skirt * 0.5, 0.012); a('sealNC', cx, 0.006, cz); a('recoat1', xr2, 0.004, 0.6); }
    else if (id === 'coat1') { a('c1', xr2, 0.004, 0.55); a('skirt', xl, P.skirt * 0.6, 0.004); if (P.drain) a('gully', P.drain.x + 0.1, 0.004, P.drain.z - 0.14); }
    else if (id === 'coat2') { if (fu) { a('c2', xr2, 0.005, 0.55); a('gritS', xl, 0.005, 0.25); a('film', xl + 0.35, 0.005, 0.8); } else { a('c2p', xr2, 0.005, 0.55); a('interval', xl, 0.005, 0.25); } }
    else if (id === 'coat3') { a('c3', xr2, 0.005, 0.55); a('interval', xl, 0.005, 0.25); }
    else if (id === 'grip') { a('gripL', xr2, 0.006, 0.55); a('gritS', xl, 0.006, 0.25); a('walk24', xl + 0.35, 0.006, 0.8); }
    else { a('termE', xl + 0.2, P.skirt + 0.01, 0.012); a(fu ? 'walk' : 'walk24', xr2, 0.005, 0.45); a('insp', xl, 0.005, 0.2); if (parts.pot && parts.pot.visible) a('pot', parts.pot.position.x, 0.3, parts.pot.position.z); }
  }

  function rigFloor(R, kind) {
    var P = R.P, S = R.S, W = R.W, hw = R.hw, cut = R.cut, XC = R.XC, parts = R.parts, K = R.K, T = R.tools, C = R.clouds, E2 = R.E, D = S.zf, M = parts.M, x0c = cut ? XC : -hw, xl = cut ? XC + 0.05 : -0.35, xr2 = cut ? XC + 0.6 : 0.5, SP = parts.SP || {}, fu = SP.spec === 'fu08';
    var sponge = T.sponge, broom = T.broom, roller = T.roller, igun = T.igun, lance = T.lance, blaster = T.blaster, cutter = T.cutter, trowel = T.trowel, meter = parts.meter ? R.addTool(parts.meter) : null, none = function () { return null; };
    /* ---- substrate preparation, the professional way: (mortar) blasting off the weak skin — (roof) cutting out the blisters and patching — then sweeping,
       the high-pressure wash, drying, the moisture meter (< 8 %) at three points, and the corners wiped ---- */
    var RD = parts.dirtRaster, prepPath = new R.C.self.Coat([{ kind: 'floor', x0: -hw, x1: hw, a0: 0.02, a1: D - 0.02, off: 0.003 }], M.prim, 0, { rowH: 0.22, rep: 1, maskW: 80, noNoise: true }); prepPath.show(false); var wetF = R.wetOn(prepPath, 0.0005);
    var wipeAt = [[cut ? XC + 0.25 : -0.55, 0.12], [0.7, 0.1], [0.5, 0.75]], meterAt = [[cut ? XC + 0.3 : -0.6, 0.3], [0.55, 0.62], [cut ? XC + 0.75 : 0.1, 0.85]], bl = kind === 'roof' ? BLISTERS_R.map(function (b2) { return [-S.x + b2[0] * 2 * S.x, b2[1] * D, b2[2] * 2 * S.x]; }).filter(function (b2) { return !cut || b2[0] + b2[2] > XC + 0.02; }) : [];
    var phP = kind === 'mortar' ? { blast: [0.3, 5.4], sweep: [5.7, 7.6], wash: [7.9, 10.6], dry: [10.6, 12.2], meter: [12.4, 14.2], wipe: [14.4, 15.6] } : kind === 'roof' ? { cutB: [0.3, 2.6], patch: [2.8, 4.2], sweep: [4.5, 7.4], wash: [7.7, 10.4], dry: [10.4, 12.0], meter: [12.2, 14.0], wipe: [14.2, 15.4] } : { sweep: [0.3, 4.4], wash: [4.7, 7.6], dry: [7.6, 9.2], meter: [9.4, 11.2], wipe: [11.4, 12.8] };
    var durP = kind === 'frp' ? 13.2 : 16.0, DIRBF = new THREE.Vector3(0.35, 1, 0.5).normalize();
    var srcD = function (t) { var k2 = phP.blast ? 'blast' : 'sweep'; if (!RD || t < phP[k2][0] || t > phP[k2][1]) return null; var q = RD.at((t - phP[k2][0]) / (phP[k2][1] - phP[k2][0])); return [q.x, phP.blast ? 0.04 : 0.02, q.y]; };
    var srcG = function (t) { if (!RD || !phP.blast || t < phP.blast[0] || t > phP.blast[1]) return null; var q = RD.at((t - phP.blast[0]) / (phP.blast[1] - phP.blast[0])); return [q.x, 0.006, q.y]; };
    function seatFloor(tool, x, z, dx, dz, depth, out) { tool.visible = out < 0.999; if (!tool.visible) return; var BZ = new THREE.Vector3(dx, 0, dz).normalize(), BY = new THREE.Vector3(0, 1, 0), BX = new THREE.Vector3().crossVectors(BY, BZ).normalize(), M4 = new THREE.Matrix4().makeBasis(BX, BY, BZ); tool.setRotationFromMatrix(M4); tool.position.set(x, tool.userData.R - depth + out * 0.6, z + out * 0.3); }
    R.stage('prep', durP, phP, function (S2, ph) {
      var uB = phP.blast ? R.u(ph, 'blast', S2) : -9, bo = phP.blast ? R.io(ph, 'blast', S2) : 1, uS = R.u(ph, 'sweep', S2), so = R.io(ph, 'sweep', S2), uW = R.u(ph, 'wash', S2), uD = R.u(ph, 'dry', S2), uM = R.u(ph, 'meter', S2), mo = R.io(ph, 'meter', S2), uC = R.u(ph, 'wipe', S2), wo = R.io(ph, 'wipe', S2), uK = phP.cutB ? R.u(ph, 'cutB', S2) : -9, ko = phP.cutB ? R.io(ph, 'cutB', S2) : 1, uP = phP.patch ? R.u(ph, 'patch', S2) : -9, po = phP.patch ? R.io(ph, 'patch', S2) : 1;
      var gone = phP.blast ? uB : uS; // the dirt and the weak skin go with the blasting (mortar) or the sweeping
      if (parts.dirt) { parts.dirt.visible = gone < 1.02; if (parts.dirtMask) parts.dirtMask.update(R.clamp(gone)); }
      if (parts.floor) parts.floor.material[2] = gone > 0.98 ? parts.topC : parts.topD; if (parts.puddle) parts.puddle.visible = gone < 0.5;
      if (bo < 0.999 && RD) { var qb = RD.at(R.clamp(uB)); K.aim(blaster, [qb.x, 0.002, qb.y], DIRBF, blaster.userData.standoff.blast, bo); blaster.userData.stream(S2, bo < 0.6); } else if (phP.blast) { blaster.visible = false; blaster.userData.stream(S2, false); }
      C.grit.update(S2, srcG, 0.001); C.dust.update(S2, srcD, R.ground);
      if (kind === 'roof') { var bi = Math.min(bl.length - 1, Math.floor(R.clamp(uK) * bl.length)), bf = R.clamp(uK) * bl.length - bi, b2 = bl[bi] || [0.3, 0.5, 0.05]; if (ko < 0.999) { var ang = bf * Math.PI * 2, rr = b2[2] * 1.15; seatFloor(cutter, b2[0] + rr * Math.cos(ang), b2[1] + rr * Math.sin(ang), -Math.sin(ang), Math.cos(ang), 0.004, ko); cutter.userData.disc.rotation.x = -S2 * 42; } else cutter.visible = false;
        C.sawdust.update(S2, function (t) { if (t < phP.cutB[0] || t > phP.cutB[1]) return null; var u2 = (t - phP.cutB[0]) / (phP.cutB[1] - phP.cutB[0]), i2 = Math.min(bl.length - 1, Math.floor(u2 * bl.length)), f2 = u2 * bl.length - i2, b3 = bl[i2] || b2, a2 = f2 * Math.PI * 2; return [b3[0] + b3[2] * 1.15 * Math.cos(a2), 0.01, b3[1] + b3[2] * 1.15 * Math.sin(a2)]; }, R.ground);
        if (parts.patches) parts.patches.forEach(function (pt, i3) { var uu = R.clamp(uP * parts.patches.length - i3); pt.visible = uu > 0; var sc = 0.3 + 0.7 * E2(uu); pt.scale.set(sc, sc, 1); }); // the cut-out blisters filled with repair mortar and levelled
        if (po < 0.999 && parts.patches && parts.patches.length) { var pi = Math.min(parts.patches.length - 1, Math.floor(R.clamp(uP) * parts.patches.length)), pf = R.clamp(uP) * parts.patches.length - pi, pp = parts.patches[pi]; R.pressF(trowel, pp.position.x + 0.05 * Math.cos(pf * 9), 0.004, pp.position.z + 0.04 * Math.sin(pf * 9), 0.3, 0.2, po); } else trowel.visible = false;
      }
      if (so < 0.999 && RD) { var q = RD.at(R.clamp(uS)); R.pressF(broom, q.x + 0.02 * Math.sin(S2 * 14), 0.004, q.y, 0.55, q.dir ? 0.4 : -0.4, so); } else broom.visible = false;
      /* the high-pressure wash: the lance runs the raster, the floor is wet and stays wet until the drying phase has run; the meter reads the dry floor */
      if (uW > -0.5 && uW < 1.5) R.jetOver(prepPath, ph, S2, 'wash', null); else { lance.visible = false; lance.userData.mode('off'); if (lance.userData.water) lance.userData.water.update(S2, false, null, R.ground); }
      prepPath.set(R.clamp(uW)); var wetS = uW <= 0 ? 0 : uW <= 1 ? 1 : (uD < 0 ? 1 : 1 - E2(R.clamp(uD))); wetF.set(R.clamp(uW), wetS); R.puddle.set(cut ? XC + 0.15 : 0, R.PR * (uW > 0 ? Math.max(0, wetS - 0.3) / 0.7 : 0));
      if (meter && mo < 0.999) { var mi = Math.min(meterAt.length - 1, Math.floor(R.clamp(uM) * meterAt.length)), mf = R.clamp(uM) * meterAt.length - mi, mp = meterAt[mi], dip = Math.sin(Math.min(1, mf * 1.4) * Math.PI); R.pressF(meter, mp[0], 0.004 + 0.06 * (1 - dip), mp[1], -0.35, 0.3, mo); } else if (meter) meter.visible = false;
      if (wo < 0.999) { var i = Math.min(wipeAt.length - 1, Math.floor(R.clamp(uC) * wipeAt.length)), f = R.clamp(uC) * wipeAt.length - i, w = wipeAt[i]; R.pressF(sponge, w[0] + 0.05 * Math.sin(f * 12), 0.003, w[1] + 0.04 * Math.cos(f * 12), 0.05, 0.1 * Math.sin(f * 12), wo); } else sponge.visible = false;
    }, function (S2, ph) { var k = R.active(ph, S2), L = [], q;
      if (k === 'blast') { q = RD ? RD.at(R.clamp(R.u(ph, 'blast', S2))) : { x: 0, y: 0.5 }; L.push({ k: 'blast', p: [q.x, 0.14, q.y + 0.1] }); L.push({ k: 'dust', p: [xl, 0.003, 0.2] }); }
      else if (k === 'cutB') { L.push({ k: 'cutB', p: [bl[0] ? bl[0][0] : 0.3, 0.08, bl[0] ? bl[0][1] : 0.5] }); L.push({ k: 'blister', p: [xl, 0.003, 0.25] }); }
      else if (k === 'patch') { L.push({ k: 'repairM', p: [parts.patches && parts.patches[0] ? parts.patches[0].position.x : 0.3, 0.06, parts.patches && parts.patches[0] ? parts.patches[0].position.z : 0.5] }); }
      else if (k === 'sweep') { q = RD ? RD.at(R.clamp(R.u(ph, 'sweep', S2))) : { x: 0, y: 0.5 }; L.push({ k: 'broomC', p: [q.x, 0.12, q.y + 0.08] }); L.push({ k: kind === 'mortar' ? 'vac' : 'dust', p: [xl, 0.003, 0.2] }); }
      else if (k === 'wash') { var qw = prepPath.at(R.clamp(R.u(ph, 'wash', S2))); L.push({ k: 'wash', p: [qw.x, 0.16, qw.z + 0.1] }); L.push({ k: 'clean', p: [xl, 0.003, 0.15] }); }
      else if (k === 'dry') { L.push({ k: 'dryP', p: [xr2, 0.003, 0.5] }); L.push({ k: 'dry', p: [xl, 0.003, 0.2] }); }
      else if (k === 'meter') { var mi = Math.min(meterAt.length - 1, Math.floor(R.clamp(R.u(ph, 'meter', S2)) * meterAt.length)); L.push({ k: 'meter', p: [meterAt[mi][0], 0.1, meterAt[mi][1] + 0.06] }); L.push({ k: 'dryP', p: [xl, 0.003, 0.7] }); }
      else { var i = Math.min(wipeAt.length - 1, Math.floor(R.clamp(R.u(ph, 'wipe', S2)) * wipeAt.length)); L.push({ k: 'clean', p: [wipeAt[i][0], 0.08, wipeAt[i][1] + 0.05] }); L.push({ k: 'dry', p: [xl, 0.003, 0.5] }); }
      return L; });
    /* ---- the primer: rolled over floor and skirt; its open time ---- */
    var phM = { roll: [0.3, 4.6], open: [4.9, 6.2] }, cracks = parts.cracks.map(function (cr) { return [-S.x + cr[0] * 2 * S.x, cr[1] * D, -S.x + cr[2] * 2 * S.x, cr[3] * D]; }).filter(function (c) { return !cut || Math.max(c[0], c[2]) > XC + 0.05; }).sort(function (a, b) { return Math.min(a[0], a[2]) - Math.min(b[0], b[2]); });
    function crackAt(u) { var n = cracks.length, i = Math.min(n - 1, Math.floor(u * n)), f = u * n - i, c = cracks[i] || [0, 0.5, 0.2, 0.6]; return { x: c[0] + (c[2] - c[0]) * f, z: c[1] + (c[3] - c[1]) * f, i: i, f: f }; }
    R.stage('prime', 6.4, phM, function (S2, ph) {
      var uR = R.u(ph, 'roll', S2), ro = R.io(ph, 'roll', S2);
      parts.prim.show(uR > 0); parts.prim.set(R.clamp(uR)); if (ro < 0.999) { var q = parts.prim.at(R.clamp(uR)); R.placeRoller(roller, q, ro, 0.005); roller.userData.roll.rotation.y = S2 * 12; } else roller.visible = false;
    }, function (S2, ph) { var k = R.active(ph, S2), L = []; if (k === 'open') { L.push({ k: 'open', p: [xl, 0.004, 0.25] }); L.push({ k: kind === 'mortar' ? 'crackM' : 'crackF', p: [cracks[0] ? (cracks[0][0] + cracks[0][2]) / 2 : 0.3, 0.003, cracks[0] ? (cracks[0][1] + cracks[0][3]) / 2 : 0.5] }); } else { var q = parts.prim.at(R.clamp(R.u(ph, 'roll', S2))); L.push(R.toolAnchor(q, 'rollP')); if (R.u(ph, 'roll', S2) > 0.5) L.push({ k: kind === 'frp' ? 'prim55' : 'prim30', p: [xl, 0.004, 0.7] }); } return L; });
    /* ---- the adjustment with NON-BLEED QUICK: the gun lays the fillet along the wall–floor joint, up the corner and back along the return wall, then a bead into every crack; each clip plane follows the nozzle ---- */
    var SC = parts.sealClips, zJ = P.frp || 0, phS = { joint: [0.3, 3.4], corner: [3.6, 4.6], ret: [4.8, 6.8], crack: [7.1, 10.2] }, xJ0 = x0c, xJ1 = hw;
    var GV = new THREE.Vector3(), GD = new THREE.Vector3(), blob = parts.blob;
    function flip(u) { return 1 - 2 * E2(R.clamp((u - 0.08) / 0.3)); } // a bead started in a corner: the gun first points into the corner (body forward), then turns to trail behind the nozzle
    function gunLay(x, y, z, dx, dy, dz, out, m) { if (igun.userData.setLabel) igun.userData.setLabel(m === M.term ? 'EXCEED' : 'NON-BLEED QUICK', m === M.term ? 'One-component polyurethane sealant · Non-Bleed · LS polymer' : 'Quick-drying non-bleed sealant for waterproofing substrates'); igun.visible = out < 0.999; if (blob) blob.visible = igun.visible && out < 0.6; if (!igun.visible) return; GD.set(dx, dy, dz).normalize(); igun.position.set(x + GD.x * out * 0.35, y + GD.y * out * 0.35 + out * 0.25, z + GD.z * out * 0.35); GV.copy(igun.position).add(GD); igun.lookAt(GV); if (blob) { blob.position.set(x, y, z); if (m) blob.material = m; } } // the nozzle tip on the bead, the body along d (up, out, trailing); lifted away outside the run
    R.stage('seal', 10.8, phS, function (S2, ph) {
      var uJ = R.clamp(R.u(ph, 'joint', S2)), jo = R.io(ph, 'joint', S2), uC = R.clamp(R.u(ph, 'corner', S2)), co = R.io(ph, 'corner', S2), uZ = R.clamp(R.u(ph, 'ret', S2)), zo = R.io(ph, 'ret', S2), uK = R.clamp(R.u(ph, 'crack', S2)), ko = R.io(ph, 'crack', S2);
      if (SC) { SC.x.constant = R.u(ph, 'joint', S2) <= 0 ? -10 : (uJ >= 1 ? 10 : xJ0 + uJ * (xJ1 - xJ0)); SC.y.constant = R.u(ph, 'corner', S2) <= 0 ? -10 : (uC >= 1 ? 10 : uC * (P.skirt + 0.02)); SC.z.constant = R.u(ph, 'ret', S2) <= 0 ? -10 : (uZ >= 1 ? 10 : zJ + uZ * (D - zJ)); SC.c.constant = R.u(ph, 'crack', S2) <= 0 ? -10 : (uK >= 1 ? 10 : crackAt(uK).x + 0.012); }
      igun.visible = false; if (blob) blob.visible = false;
      if (jo < 0.999) gunLay(xJ0 + uJ * (xJ1 - xJ0), 0.008, zJ + 0.008, 0.45 * flip(uJ), 0.5, 0.75, jo, M.seal); // along the wall–floor joint, travelling +x
      else if (co < 0.999) gunLay(hw - 0.008, uC * (P.skirt + 0.02) + 0.004, zJ + 0.008, -0.6, -0.3, 0.6, co, M.seal); // up the corner
      else if (zo < 0.999) gunLay(hw - 0.008, 0.008, zJ + uZ * (D - zJ), -0.75, 0.5, 0.45 * flip(uZ), zo, M.seal); // along the return wall, travelling +z
      else if (ko < 0.999) { var c = crackAt(uK), c2 = crackAt(Math.min(1, uK + 0.02)), tx = c2.x - c.x, tz = c2.z - c.z, tl = Math.hypot(tx, tz) || 1; gunLay(c.x, 0.004, c.z, -tx / tl * 0.5, 0.8, -tz / tl * 0.5 + 0.35, ko, M.seal); }
    }, function (S2, ph) { var k = R.active(ph, S2), L = []; if (k === 'joint') { L.push({ k: 'gunN', p: [xJ0 + R.clamp(R.u(ph, 'joint', S2)) * (xJ1 - xJ0), 0.1, 0.09] }); L.push({ k: 'sealN', p: [xl, 0.01, 0.014] }); } else if (k === 'corner') { L.push({ k: 'cornerN', p: [hw - 0.01, 0.06, 0.02] }); L.push({ k: 'toolE', p: [xl, 0.01, 0.014] }); } else if (k === 'ret') { L.push({ k: 'sealN', p: [hw - 0.01, 0.01, zJ + R.clamp(R.u(ph, 'ret', S2)) * (D - zJ) * 0.8] }); L.push({ k: 'toolE', p: [xl, 0.01, 0.014] }); } else { var c = crackAt(R.clamp(R.u(ph, 'crack', S2))); L.push({ k: 'gunN', p: [c.x, 0.12, c.z + 0.06] }); L.push({ k: 'sealNC', p: [c.x + 0.05, 0.004, c.z - 0.1] }); L.push({ k: 'recoat1', p: [xr2, 0.004, 0.7] }); } return L; });
    /* ---- the first coat: rolled, the return wall first by the frame's own roller ---- */
    R.coatStage('coat1', 7.8, parts.c1, { tool: 'roller', layer: 'c1', layerAt: [xl, 0.005, 0.7], lift: 0.002, label: 'rollC' });
    /* ---- a coat that carries the aggregate: the bag is tipped over the rim of the can (the sand runs into the middle), the paddle stirs, then the roller ---- */
    var kit = parts.mixkit, pv = kit.userData.pivot;
    function spoutAt(e) { var v = pv.userData.spout.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -pv.userData.tilt * e); v.add(pv.userData.rest.clone().lerp(pv.userData.pour, e)); v.add(kit.position); return [v.x, v.y, v.z]; }
    function mixRollStage(id, coat, dur, labelK, labelMix) {
      var phC = { lift: [0.3, 1.2], pour: [1.2, 2.6], back: [2.6, 3.2], stir: [3.4, 5.2], roll: [5.6, dur - 0.6] };
      var srcG2 = function (t) { if (t < phC.pour[0] + 0.15 || t > phC.pour[1]) return null; return spoutAt(1); };
      R.stage(id, dur, phC, function (S2, ph) {
        var uL = R.u(ph, 'lift', S2), uP = R.u(ph, 'pour', S2), uBk = R.u(ph, 'back', S2), uS = R.u(ph, 'stir', S2), uR = R.u(ph, 'roll', S2), ro = R.io(ph, 'roll', S2), pad = kit.userData.paddle;
        kit.visible = S2 < ph.roll[0] + 0.25;
        var e = uL < 0 ? 0 : uL < 1 ? E2(uL) : (uBk < 0 ? 1 : uBk < 1 ? 1 - E2(uBk) : 0); // the bag rises from the floor onto the rim and tips over the can, then goes back down
        pv.position.copy(pv.userData.rest).lerp(pv.userData.pour, e); pv.rotation.z = -pv.userData.tilt * e; if (uP > 0 && uP < 1) pv.rotation.z -= 0.08 * Math.sin(S2 * 20); // the bag is shaken while it pours
        C.grit.update(S2, srcG2, 0.2 - kit.position.y + 0.002);
        pad.visible = uS > -0.25 && uS < 1.2; if (pad.visible) { var e2 = E2(R.clamp(uS < 0 ? (uS + 0.25) * 4 : uS > 1 ? (1.2 - uS) * 5 : 1)); pad.position.y = 0.06 + (1 - e2) * 0.4; pad.rotation.y = uS > 0 && uS < 1 ? S2 * 22 : 0; kit.userData.mix.position.y = 0.2 + (uS > 0 && uS < 1 ? 0.004 * Math.sin(S2 * 30) : 0); }
        coat.show(uR > 0); coat.set(R.clamp(uR)); if (ro < 0.999) { var q = coat.at(R.clamp(uR)); R.placeRoller(roller, q, ro, 0.006); roller.userData.roll.rotation.y = S2 * 12; } else roller.visible = false;
      }, function (S2, ph) { var k = R.active(ph, S2), L = []; if (k === 'roll') { var q = coat.at(R.clamp(R.u(ph, 'roll', S2))); L.push(R.toolAnchor(q, 'rollC')); if (R.u(ph, 'roll', S2) > 0.5) L.push({ k: labelK, p: [xl, 0.006, 0.7] }); } else if (k === 'stir') { L.push({ k: 'mix', p: [kit.position.x, 0.5, kit.position.z] }); L.push({ k: 'acc', p: [kit.position.x + kit.userData.bottle.position.x, 0.2, kit.position.z + kit.userData.bottle.position.z] }); } else { var sp2 = spoutAt(1); L.push({ k: 'agg', p: [sp2[0] - 0.08, sp2[1] + 0.12, sp2[2]] }); L.push({ k: labelMix, p: [kit.position.x + 0.3, 0.05, kit.position.z + 0.2] }); } return L; });
    }
    if (fu) mixRollStage('coat2', parts.c2, 10.6, 'c2', 'gritS'); else R.coatStage('coat2', 7.8, parts.c2, { tool: 'roller', layer: 'c2p', layerAt: [xl, 0.005, 0.7], lift: 0.0025, label: 'rollC' });
    if (parts.c3) R.coatStage('coat3', 7.8, parts.c3, { tool: 'roller', layer: 'c3', layerAt: [xl, 0.005, 0.7], lift: 0.003, label: 'rollC' });
    if (parts.grip) mixRollStage('grip', parts.grip, 10.6, 'gripL', 'gritS');
    /* ---- finished: the termination bead of EXCEED along the top edge of the skirt and the return wall, the wet gloss goes as the film dries, then the planter ---- */
    var TC = parts.termClips, TS = parts.termSpan, phD = { term: [0.3, 3.2], termZ: [3.4, 5.2], dry: [5.4, 8.0], pot: [8.2, 9.4] };
    R.stage('done', 9.8, phD, function (S2, ph) {
      var uT = R.u(ph, 'term', S2), to = R.io(ph, 'term', S2), uZ = R.u(ph, 'termZ', S2), zo = R.io(ph, 'termZ', S2), f = R.clamp(R.u(ph, 'dry', S2)), fp = R.clamp(R.u(ph, 'pot', S2));
      if (TC) { TC.x.constant = uT <= 0 ? -10 : (uT >= 1 ? 10 : TS.x0 + R.clamp(uT) * (TS.x1 - TS.x0)); TC.z.constant = uZ <= 0 ? -10 : (uZ >= 1 ? 10 : TS.z0 + R.clamp(uZ) * (TS.z1 - TS.z0)); }
      igun.visible = false; if (blob) blob.visible = false;
      if (to < 0.999) gunLay(TS.x0 + R.clamp(uT) * (TS.x1 - TS.x0), P.skirt + 0.001, parts.filmTop.wall + 0.004, 0.45 * flip(R.clamp(uT)), 0.25, 0.85, to, M.term); // along the top edge of the skirt, travelling +x
      else if (zo < 0.999) gunLay(hw - parts.filmTop.wall - 0.004, P.skirt + 0.001, TS.z0 + R.clamp(uZ) * (TS.z1 - TS.z0), -0.85, 0.25, 0.45 * flip(R.clamp(uZ)), zo, M.term); // along the return wall, travelling +z
      var wet = S2 < ph.dry[0] ? 0.6 : 0.6 * (1 - f); R.C.wetLook.forEach(function (w) { if (w.m === M.hg1 || w.m === M.hg2 || w.m === M.hg2p || w.m === M.hg3 || w.m === M.grip) { w.m.color.setHex(w.c).multiplyScalar(1 - 0.18 * wet); w.m.roughness = w.r - (w.r - 0.2) * wet; } });
      if (parts.pot) { parts.pot.visible = fp > 0; var e = E2(fp); parts.pot.position.copy(parts.pot.userData.home); parts.pot.position.y += (1 - e) * 0.5; }
    }, function (S2, ph) { var k = R.active(ph, S2); if (k === 'term') return [{ k: 'gunE2', p: [TS.x0 + R.clamp(R.u(ph, 'term', S2)) * (TS.x1 - TS.x0), P.skirt + 0.1, 0.08] }, { k: 'termE', p: [xl, P.skirt + 0.01, 0.014] }]; if (k === 'termZ') return [{ k: 'termE', p: [hw - 0.01, P.skirt + 0.01, TS.z0 + R.clamp(R.u(ph, 'termZ', S2)) * (TS.z1 - TS.z0) * 0.8] }, { k: 'insp', p: [xl, 0.005, 0.3] }]; if (k === 'pot') return [{ k: fu ? 'walk' : 'walk24', p: [parts.pot.position.x, parts.pot.position.y + 0.42, parts.pot.position.z] }]; return [{ k: 'dryF', p: [xl, 0.005, 0.3] }, { k: 'cure', p: [cut ? XC + 0.4 : 0.3, 0.005, 0.7] }]; });
  }

  /* the micro scale: the chalked skin (frp) or the pores of the mortar / old membrane, the primer soaking in, the NON-BLEED QUICK bead that fills the crack to the
     surrounding surface and stands a little proud (tooled), the coats of the specification bridging smoothly over it, the aggregate grains where a coat carries them */
  function microFloor(M, kind) {
    var MM = M.MM, n = M.n, H0 = M.H0, B0 = M.B0, X = M.X, k, SP = window.UX_SPEC || { spec: 'fu08', grip: true, coats: 2 }, fu = SP.spec === 'fu08';
    var primM = M.keep(new THREE.MeshStandardMaterial({ color: 0xe6d38a, roughness: 0.18, transparent: true, opacity: 0.42, envMapIntensity: 1.2, depthWrite: false }));
    var hg1 = M.slurryMat(UXTX.puCoat('#7b7d7e', { seed: 503 }), 0xffffff, 0.38), hg2 = M.slurryMat(UXTX.puCoat(fu ? '#868889' : '#808283', fu ? { seed: 505, grit: 2 } : { seed: 507 }), 0xffffff, fu ? 0.55 : 0.36), hg3 = SP.coats > 2 ? M.slurryMat(UXTX.puCoat('#848687', { seed: 509 }), 0xffffff, 0.35) : null, gripM = (!fu && SP.grip) ? M.slurryMat(UXTX.puCoat('#8a8c8d', { seed: 511, grit: 2 }), 0xffffff, 0.58) : null;
    var Yl = M.fillPores(H0, B0, 0.12 * MM); M.layer('prim', Yl, H0, primM, { end: 0.92 * X, stage: 'prime', noCap: true });
    /* the bead: for every row the sound surface beside the crack is the reference; inside the crack and over a margin round it the sealant is filled up to that
       reference and tooled to a low convex bead (about 0.35 mm proud), so that the crack is bridged and the coats run over it without a step */
    var sealM = M.keep(new THREE.MeshStandardMaterial({ color: 0x9a9ea0, roughness: 0.5, envMapIntensity: 0.5 })), NX = M.NX, NZ = M.NZ, CRK = M.CRK, Yb = new Float32Array(n), maskB = new Uint8Array(n), DB = new Float32Array(n), j, i, q, mg = Math.max(4, Math.round(NX / 22));
    for (j = 0; j < NZ; j++) { var i0 = -1, i1 = -1; for (i = 0; i < NX; i++) { q = j * NX + i; if (CRK[q]) { if (i0 < 0) i0 = i; i1 = i; } }
      var ref = 0, cnt = 0; if (i0 >= 0) { for (i = i0 - mg - 3; i <= i0 - mg; i++) if (i >= 0) { ref += B0[j * NX + i]; cnt++; } for (i = i1 + mg; i <= i1 + mg + 3; i++) if (i < NX) { ref += B0[j * NX + i]; cnt++; } } ref = cnt ? ref / cnt + 0.004 : 0;
      for (i = 0; i < NX; i++) { q = j * NX + i; var d = i0 < 0 ? 99 : (i < i0 ? i0 - i : i > i1 ? i - i1 : 0), inB = d <= mg; DB[q] = d; maskB[q] = inB ? 0 : 1; var s2 = inB ? Math.sqrt(Math.max(0, 1 - (d / (mg + 0.5)) * (d / (mg + 0.5)))) : 0; Yb[q] = inB ? Math.max(ref + 0.35 * MM * s2, Yl[q] + 0.02 * MM) : H0[q]; } }
    M.layer('seal', Yb, H0, sealM, { end: 0.7 * X, stage: 'seal', mask: maskB, noCap: true });
    /* the coats: a roller-applied liquid film of 0.6 kg/m² levels the pores and micro-voids of a mineral substrate — it runs into them and its top surface
       settles towards the mean level of the surrounding surface (fully on mortar, less on the dense FRP and urethane skins), still covering every peak with a
       minimum film; each further coat levels what is left. Over the bead the coats follow its curve, smoothed across the margin */
    var LV = kind === 'mortar' ? 1 : kind === 'roof' ? 0.6 : 0.4, RL = Math.max(4, Math.round(M.RB * 2.2));
    function levelled(H, film, kL) { var B = M.blur(H, RL, 2), out = new Float32Array(n); for (k = 0; k < n; k++) { var follow = H[k] + film, mean = B[k] + film * 0.85; out[k] = Math.max(H[k] + film * 0.35, follow + (mean - follow) * kL); } return out; }
    function over(Y, lift, F) { var out = Float32Array.from(Y); for (k = 0; k < n; k++) if (!maskB[k]) out[k] = Math.max(out[k], Yb[k] + lift); var sm = M.blur(out, 3, 1); for (k = 0; k < n; k++) { var w = DB[k] <= mg + 4 ? 1 : DB[k] <= mg + 8 ? (mg + 8 - DB[k]) / 4 : 0; out[k] = out[k] + (sm[k] - out[k]) * w; if (F) out[k] = Math.max(out[k], F[k] + 0.08 * MM); } return out; }
    var Y1 = over(levelled(Yl, 0.34 * MM, LV), 0.3 * MM, Yl); M.layer('coat1', Y1, H0, hg1, { end: 0.55 * X }); // levelled on the primed surface, never thinner than the minimum film
    var Y2 = fu ? M.grainRelief(0, 0.045, 191, 26) : new Float32Array(n), Y2b = levelled(Y1, (fu ? 0.16 : 0.32) * MM, LV * 0.8); for (k = 0; k < n; k++) Y2[k] = Y2b[k] + (fu ? Math.max(0, Y2[k]) * 1.2 : 0); if (!fu) Y2 = M.blur(Y2, 2, 1); M.layer('coat2', Y2, Y1, hg2, { end: (SP.coats > 2 || gripM) ? 0.34 * X : 0.12 * X });
    var top = Y2, prev = Y2;
    if (hg3) { var Y3 = levelled(prev, 0.32 * MM, LV * 0.7); Y3 = M.blur(Y3, 2, 1); M.layer('coat3', Y3, prev, hg3, { end: gripM ? 0.24 * X : 0.12 * X, stage: 'coat3' }); prev = Y3; top = Y3; }
    if (gripM) { var Yg = M.grainRelief(0, 0.05, 193, 24); for (k = 0; k < n; k++) Yg[k] = prev[k] + 0.12 * MM + Math.max(0, Yg[k]) * 1.3; M.layer('grip', Yg, prev, gripM, { end: 0.12 * X, stage: 'grip' }); top = Yg; }
    var tint = kind === 'frp' ? new THREE.Color(0.86, 0.9, 0.87) : kind === 'roof' ? new THREE.Color(0.82, 0.82, 0.8) : new THREE.Color(1, 1, 1);
    return { top: top, open: null, set: function (id, t, from, si, x) { var c = M.matPaste.color; c.multiply(tint); if (x.waterCrack) x.waterCrack.visible = id === 'state'; } };
  }

  return { frp: frpApp, mortar: mortarApp, roof: roofApp };
})();

/* the applications register with the waterproofing member and the viewer */
var WPM3D = { frp: UX3D.frp, mortar: UX3D.mortar, roof: UX3D.roof };
var WP_STAGES = AC_STAGES;
var WP_ORDER = AC_ORDER;

/* ---------- the title object: a floor sample on which every step of the build-up is left standing beside the next ---------- */
function WPPanel(M, kind) {
  var self = this, g = new THREE.Group(), trash = [], RWp = THREE.RepeatWrapping, RWm = THREE.MirroredRepeatWrapping;
  var po = kind === 'po', W = 0.7, Dp = 0.42, T = 0.06, UH = 0.11, BX = [-0.35, -0.25, -0.15, -0.05, 0.05, 0.15, 0.25, 0.35], NB = 7;
  this.group = g; this.scn = 'panel'; this.cut = false; this.cam = po ? { az: -26, el: 22, dist: 0.86, t: [0, 0.16, 0.02] } : { az: -30, el: 36, dist: 0.8, t: [0, 0.05, 0.16] }; this.ground = po ? 0 : -T - 0.002;
  function keep(o) { trash.push(o); return o; }
  function mat(o) { return keep(new THREE.MeshStandardMaterial(o)); }
  function mesh(geo, m) { var me = new THREE.Mesh(keep(geo), m); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; }
  var F = TEX.formed(), formed = mat({ map: keep(canvasTex(F.base, { wrap: RWp })), bumpMap: keep(canvasTex(WPTX.softBump(F.bump), { wrap: RWp, srgb: false })), bumpScale: 0.0016, roughness: 0.93, envMapIntensity: 0.35 }), sawn = mat({ map: keep(canvasTex(TEX.aggregate(), { wrap: RWp })), roughness: 0.85, envMapIntensity: 0.4 });
  function box(x0, x1, y0, y1, z0, z1, m, sc) { var geo = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), p = geo.attributes.position, nrm = geo.attributes.normal, uv = geo.attributes.uv, i; for (i = 0; i < p.count; i++) { var x = p.getX(i) + (x0 + x1) / 2, y = p.getY(i) + (y0 + y1) / 2, z = p.getZ(i) + (z0 + z1) / 2, f = Math.abs(nrm.getX(i)) > 0.5 ? 0 : Math.abs(nrm.getY(i)) > 0.5 ? 1 : 2, s = sc || 2; if (f === 0) uv.setXY(i, (z + 0.6) / s, (y + 0.3) / s); else if (f === 1) uv.setXY(i, (x + 1) / s, (z + 0.6) / s); else uv.setXY(i, (x + 1) / s, (y + 0.3) / s); } uv.needsUpdate = true; var me = mesh(geo, m); me.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return me; }
  function band(i, y, z0, z1, m, o) { o = o || {}; var x0 = BX[i] + 0.0006, x1 = o.toEnd ? W / 2 - 0.0006 : BX[i + 1] - 0.0006, me = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m); me.rotation.x = -Math.PI / 2; me.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); me.castShadow = false; if (m.map) { var uv = me.geometry.attributes.uv, k; for (k = 0; k < uv.count; k++) uv.setXY(k, (x0 + W / 2 + uv.getX(k) * (x1 - x0)) / W * (o.rep || 1), uv.getY(k) * (o.rep || 1)); uv.needsUpdate = true; } return me; }
  if (!po) {
    /* the slab of the sample, sawn on both ends; the existing FRP over it and 11 cm up the small upstand at the back; the termination bar */
    box(-W / 2, W / 2, -T, -0.004, 0, Dp, [sawn, sawn, formed, formed, formed, formed]);
    (function () { var RB = TEX.rebar(), rbM = mat({ map: keep(canvasTex(RB.map, { wrap: RWp, repeat: [1, 12] })), color: 0x9a8a80, roughness: 0.7, metalness: mt(0.25), envMapIntensity: 0.4 }); [[-T + 0.017, 0.11], [-T + 0.017, 0.31], [-0.004 - 0.016, 0.21]].forEach(function (b2) { var me = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, W + 0.0012, 16), rbM); me.rotation.z = Math.PI / 2; me.position.set(0, b2[0], b2[1]); me.castShadow = false; }); })(); // the slab's bars, cut at both sawn ends
    var CRP = [0.47, 0.3, 0.53, 0.85], frpD = mat({ map: keep(canvasTex(UXTX.frpFace(0.7, 0.42, { cracks: [[0.07, 0.35, 0.14, 0.9]], puddle: [0.08, 0.62, 0.045, 0.07], seed: 617 }))), roughness: 0.9, envMapIntensity: 0.25 }), frpC = mat({ map: keep(canvasTex(UXTX.frpFace(0.7, 0.42, { cracks: [[0.07, 0.35, 0.14, 0.9], CRP], clean: true, seed: 617 }))), roughness: 0.84, envMapIntensity: 0.3 }), frpE = mat({ color: 0x8d9490, roughness: 0.7 });
    var skin = box(-W / 2, W / 2, -0.004, 0, 0, Dp, [frpE, frpE, frpC, frpE, frpE, frpE]); (function () { var uv = skin.geometry.attributes.uv, p = skin.geometry.attributes.position, n = skin.geometry.attributes.normal, k; for (k = 0; k < uv.count; k++) if (n.getY(k) > 0.5) uv.setXY(k, (p.getX(k) + skin.position.x + W / 2) / W, 1 - (p.getZ(k) + skin.position.z) / Dp); uv.needsUpdate = true; })();
    box(-W / 2, W / 2, -T, 0.16, -0.05, 0, [sawn, sawn, formed, formed, formed, formed]); // the upstand at the back
    box(-W / 2, W / 2, 0, UH, 0, 0.004, [frpE, frpE, frpE, frpE, frpE, frpE]); // the existing FRP turned up
    var aluM = mat({ map: keep(canvasTex(UXTX.alu, { wrap: RWp, repeat: [6, 1] })), color: 0xd0d4d7, metalness: mt(0.7), roughness: 0.38, envMapIntensity: 1 }); box(-W / 2, W / 2, UH, UH + 0.016, 0, 0.008, aluM);
    /* band 1: as found — the dirt on top of the chalked face, a puddle; band 2: cleaned */
    var dirtM = mat({ map: keep(canvasTex(UXTX.dirtLayer(0.6, 0.42, { kind: 'panel', seed: 677 }))), transparent: true, alphaTest: 0.02, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -1, depthWrite: false }); var dirt = mesh(new THREE.PlaneGeometry(0.1, Dp), dirtM); dirt.rotation.x = -Math.PI / 2; dirt.position.set(BX[0] + 0.05, 0.0004, Dp / 2); dirt.castShadow = false; (function () { var uv = dirt.geometry.attributes.uv, k; for (k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) / 7, uv.getY(k)); uv.needsUpdate = true; })();
    var pud = mesh(new THREE.CircleGeometry(1, 32), mat({ color: 0x8fa3ad, roughness: 0.04, transparent: true, opacity: 0.45, envMapIntensity: 1.6, depthWrite: false })); pud.rotation.x = -Math.PI / 2; pud.position.set(BX[0] + 0.054, 0.0009, Dp * 0.62); pud.scale.set(0.03, 0.028, 1); pud.castShadow = false;
    /* band 3: the primer; band 4: the primer with the NON-BLEED QUICK fillet along the upstand joint and the bead in the crack; bands 5–7: the coats, each turned up the upstand; band 7 also carries the EXCEED termination bead on the film edge */
    var primM = mat({ color: 0xe8d68c, roughness: 0.14, envMapIntensity: 1.3, transparent: true, opacity: 0.36, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }); band(2, 0.0007, 0.004, Dp, primM, { toEnd: true }); var pw = mesh(new THREE.PlaneGeometry(W / 2 - BX[2], UH - 0.002), primM); pw.position.set((BX[2] + W / 2) / 2, UH / 2, 0.0047); pw.castShadow = false;
    var sealM = mat({ color: 0x9a9ea0, roughness: 0.5, envMapIntensity: 0.5, polygonOffset: true, polygonOffsetFactor: -3 });
    (function () { var pts = UXTX.crackPts(CRP, W, Dp).map(function (p2) { return new THREE.Vector3(-W / 2 + p2[0], 0.0016, p2[1]); }), tube = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.0075, 14, false), sealM); tube.scale.y = 0.5; tube.castShadow = false; })(); // the NON-BLEED QUICK bead tooled into the crack
    (function () { var RS = 0.012, n2 = 12, x0 = BX[3] + 0.0006, x1 = W / 2 - 0.0006, pos = [], nor = [], idx = [], k2, a; for (k2 = 0; k2 <= n2; k2++) { a = Math.PI / 2 * k2 / n2; var zz = 0.004 + RS - RS * Math.cos(a), yy = RS - RS * Math.sin(a); [x0, x1].forEach(function (x) { pos.push(x, yy, zz); nor.push(0, Math.sin(a), Math.cos(a)); }); } for (k2 = 0; k2 < n2; k2++) { var b = k2 * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); } var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setIndex(idx); var fm = mat({ color: 0x9a9ea0, roughness: 0.5, envMapIntensity: 0.5, side: THREE.DoubleSide }); var fil = mesh(geo, fm); fil.castShadow = false; })(); // the NON-BLEED QUICK fillet along the upstand joint, from band 4 to the end
    var hg1 = mat({ map: keep(canvasTex(UXTX.puCoat('#7b7d7e', { seed: 503 }), { wrap: RWm })), roughness: 0.42, envMapIntensity: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }), hg2 = mat({ map: keep(canvasTex(UXTX.puCoat('#868889', { seed: 505, grit: 1 }), { wrap: RWm })), roughness: 0.3, envMapIntensity: 0.7, polygonOffset: true, polygonOffsetFactor: -3 }), hg2d = mat({ map: hg2.map, roughness: 0.68, envMapIntensity: 0.4, polygonOffset: true, polygonOffsetFactor: -4 });
    [[4, hg1, 0.0016, 0.0056], [5, hg2, 0.0024, 0.0066], [6, hg2d, 0.0026, 0.0068]].forEach(function (c) { var x0 = BX[c[0]] + 0.0006, x1 = c[0] === 6 ? W / 2 - 0.0006 : BX[c[0] + 1] - 0.0006; var fl = box(x0, x1, 0.0004, c[2], 0.006, Dp - 0.002, c[1], 0.25); fl.castShadow = false; var wl = box(x0, x1, c[2], UH - 0.004, 0.0047, c[3], c[1], 0.25); wl.castShadow = false; });
    (function () { var tm = mat({ color: 0x4c4f52, roughness: 0.38, envMapIntensity: 0.65 }), x0 = BX[6] + 0.0006, x1 = W / 2 - 0.0006, me = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, x1 - x0, 18), tm); me.rotation.z = Math.PI / 2; me.scale.set(1, 1, 0.6); me.position.set((x0 + x1) / 2, UH - 0.005, 0.0068 + 0.003); me.castShadow = false; })(); // the EXCEED termination bead on the top edge of the film, band 7
    this.anchors = function () { var L = [], i; for (i = 0; i < NB; i++) L.push({ k: String(i + 1), p: [(BX[i] + BX[i + 1]) / 2, i >= 4 ? 0.003 : 0.001, 0.2] }); return L; };
  } else {
    /* PROTECT ONE: a block wall sample, seven bands — as found (efflorescence, carbonation), cleaned, test patch, primer OP-2020, first coat, second coat, cured */
    var blockM = mat({ map: keep(canvasTex(CRTX.mortar(0.4, 0.4, 793, { tone: '#b9b7b0', grain: 1.4, dens: 0.7, k: 0.6 }), { wrap: RWm })), color: 0xcfcdc6, roughness: 0.97, envMapIntensity: 0.22 }), jointM = mat({ color: 0xa8a59c, roughness: 1 });
    box(-W / 2 - 0.02, W / 2 + 0.02, 0, 0.05, -0.12, 0.1, [sawn, sawn, formed, formed, formed, formed]);
    var BH = 0.19, BW = 0.39, JW = 0.01, rows = 2, r2, c2; for (r2 = 0; r2 < rows; r2++) { var y0 = 0.05 + r2 * (BH + JW), off = r2 % 2 ? BW / 2 : 0; for (c2 = -2; c2 < 3; c2++) { var x0 = -W / 2 + off + c2 * (BW + JW), x1 = x0 + BW; x0 = Math.max(x0, -W / 2); x1 = Math.min(x1, W / 2); if (x1 - x0 < 0.02) continue; box(x0, x1, y0, y0 + BH, -0.1, 0, [blockM, blockM, blockM, blockM, blockM, blockM], 0.4); } }
    box(-W / 2, W / 2, 0.05, 0.05 + rows * (BH + JW), -0.1, -0.001, [jointM, jointM, jointM, jointM, jointM, jointM]);
    var H2 = 0.05 + rows * (BH + JW), effC = mkCanvas(256, 512), eq = effC.getContext('2d'), rr = lcg(97), i2; eq.clearRect(0, 0, 256, 512); for (i2 = 0; i2 < 60; i2++) { var ex = rr() * 256, ey = 300 + rr() * 200, er = 4 + rr() * 22, eg = eq.createRadialGradient(ex, ey, 0, ex, ey, er); eg.addColorStop(0, 'rgba(255,255,252,.9)'); eg.addColorStop(1, 'rgba(255,255,252,0)'); eq.fillStyle = eg; eq.fillRect(ex - er, ey - er, 2 * er, 2 * er); } var gd = eq.createLinearGradient(0, 0, 0, 512); gd.addColorStop(0, 'rgba(60,56,50,.25)'); gd.addColorStop(0.5, 'rgba(60,56,50,0)'); eq.fillStyle = gd; eq.fillRect(0, 0, 256, 512);
    var effM = mat({ map: keep(canvasTex(effC)), transparent: true, alphaTest: 0.02, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, depthWrite: false }); var eff = mesh(new THREE.PlaneGeometry(0.1, H2 - 0.05), effM); eff.position.set(BX[0] + 0.05, 0.05 + (H2 - 0.05) / 2, 0.0004); eff.castShadow = false;
    var clearM = mat({ color: 0xffffff, transparent: true, opacity: 0.16, roughness: 0.08, envMapIntensity: 1.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), clear2 = mat({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.05, envMapIntensity: 1.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }), wetM = mat({ color: 0x86827a, transparent: true, opacity: 0.35, roughness: 0.2, envMapIntensity: 1.2, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    var tp = mesh(new THREE.PlaneGeometry(0.06, 0.12), wetM); tp.position.set(BX[2] + 0.05, 0.3, 0.0006); tp.castShadow = false; // the test patch: the wet tone the manufacturer warns of
    var primP = mat({ color: 0xe4d38e, transparent: true, opacity: 0.3, roughness: 0.14, envMapIntensity: 1.2, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    [[3, primP, 0.0007, false], [4, clearM, 0.0009, false], [5, clear2, 0.0012, false], [6, clear2, 0.0014, true]].forEach(function (c) { var x0 = BX[c[0]] + 0.0006, x1 = c[3] ? W / 2 - 0.0006 : BX[c[0] + 1] - 0.0006, pl = mesh(new THREE.PlaneGeometry(x1 - x0, H2 - 0.05), c[1]); pl.position.set((x0 + x1) / 2, 0.05 + (H2 - 0.05) / 2, c[2]); pl.castShadow = false; });
    (function () { var x0 = BX[3] + 0.0006, x1 = W / 2 - 0.0006, pl = mesh(new THREE.PlaneGeometry(x1 - x0, H2 - 0.05), primP); pl.position.set((x0 + x1) / 2, 0.05 + (H2 - 0.05) / 2, 0.0007); pl.castShadow = false; })(); // the primer runs on under the coats
    var wet2 = mesh(new THREE.PlaneGeometry(0.1 - 0.0012, H2 - 0.05), mat({ color: 0x8a867e, transparent: true, opacity: 0.22, roughness: 0.2, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); wet2.position.set(BX[4] + 0.05, 0.05 + (H2 - 0.05) / 2, 0.0016); wet2.castShadow = false; // the first coat still wet
    (function () { var tm = mat({ color: 0xdfe6ea, roughness: 0.1, envMapIntensity: 1.4, transparent: true, opacity: 0.55, depthWrite: false }), x0 = BX[6] + 0.0006, x1 = W / 2 - 0.0006, me = mesh(new THREE.CylinderGeometry(0.004, 0.004, x1 - x0, 18), tm); me.rotation.z = Math.PI / 2; me.scale.set(1, 1, 0.6); me.position.set((x0 + x1) / 2, H2 - 0.006, 0.0014 + 0.0022); me.castShadow = false; })(); // the CLIO NEO termination under the coping, band 7
    this.anchors = function () { var L = [], i; for (i = 0; i < 7; i++) L.push({ k: String(i + 1), p: [(BX[i] + BX[i + 1]) / 2, 0.09, i >= 3 ? 0.002 : 0.0005] }); return L; };
  }
  this.set = function () {};
  this.dispose = function () { trash.forEach(function (o) { if (o && o.dispose) o.dispose(); }); trash = []; };
}


