/* ===== [engine_crtx.js] CRTX: shared canvases ===== */
/* ---------- canvases shared by all views (each view uploads its own GPU copies) ---------- */
var CRTX = (function () {
  var C = {}, PX = SMALL3D ? 1200 : 2000;
  function once(k, f) { if (!C[k]) C[k] = f(); return C[k]; }
  function tile(g, src, w, h, scale) { var tw = src.width * scale, th = src.height * scale, x, y; for (y = 0; y < h; y += th) for (x = 0; x < w; x += tw) g.drawImage(src, x, y, tw, th); }
  function rough(w, h, seed, dens) { return once('rough:' + w + ':' + h + ':' + seed, function () { SecPhoto.kit(); return CRPhoto.rough(Math.round(w * PX), Math.round(h * PX), seed, PX / 1000, dens || 1.25); }); }
  function mortar(w, h, seed, o) { // repair mortar seen on its surface: paste, sand, pores, the arcs of the trowel
    return once('mortar:' + w + ':' + h + ':' + seed, function () { SecPhoto.kit(); var k = o.k || 1, cw = Math.round(w * PX * k), ch = Math.round(h * PX * k), c = CRPhoto.mortar(cw, ch, seed, { tone: o.tone, grain: o.grain, mm: PX * k / 1000, dens: o.dens }), q = c.getContext('2d'), r = lcg(seed + 2), n;
      if (o.trowel) { q.save(); q.globalCompositeOperation = 'overlay'; q.lineWidth = 0.004 * PX * k; for (n = 0; n < 30; n++) { q.strokeStyle = n % 2 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)'; q.beginPath(); q.arc(cw * (0.2 + r() * 0.7), ch * (1.25 + r() * 0.5), ch * (0.55 + n * 0.04), -2.4, -0.7); q.stroke(); } q.restore(); }
      if (o.felt) { q.save(); q.globalCompositeOperation = 'overlay'; q.lineWidth = 0.012 * PX * k; for (n = 0; n < 90; n++) { q.strokeStyle = n % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)'; q.beginPath(); q.arc(r() * cw, r() * ch, (0.03 + r() * 0.07) * PX * k, r() * 6, r() * 6 + 2.4); q.stroke(); } q.restore(); }
      return c; });
  }
  var rust = once('rust', function () { var c = mkCanvas(128, 256), q = c.getContext('2d'), r = lcg(771), i; q.fillStyle = '#8a4a20'; q.fillRect(0, 0, 128, 256); clouds(q, 128, 256, r, 5, 9, 0.6, 60, 210); for (i = 0; i < 1400; i++) { q.fillStyle = ['rgba(214,128,56,.55)', 'rgba(58,28,12,.6)', 'rgba(150,80,30,.5)', 'rgba(120,58,22,.6)'][Math.floor(r() * 4)]; q.beginPath(); q.ellipse(r() * 128, r() * 256, 0.6 + r() * 3.2, 0.5 + r() * 2.2, r() * 3, 0, 7); q.fill(); } return c; });
  var coat = once('coat', function () { var c = mkCanvas(128, 256), q = c.getContext('2d'), r = lcg(773), i; q.fillStyle = '#c4c5c1'; q.fillRect(0, 0, 128, 256); clouds(q, 128, 256, r, 4, 8, 0.4, 100, 190); q.globalAlpha = 0.3; for (i = 0; i < 160; i++) { q.strokeStyle = i % 2 ? '#fff' : '#77797a'; q.lineWidth = 0.6 + r(); var x = r() * 128, y = r() * 256; q.beginPath(); q.moveTo(x, y); q.lineTo(x + (r() - 0.5) * 8, y + 20 + r() * 50); q.stroke(); } return c; });
  var slurry = once('slurry', function () { var S = 512, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(777), i; q.fillStyle = '#5a5e62'; q.fillRect(0, 0, S, S); clouds(q, S, S, r, 6, 6, 0.35, 70, 150); q.globalAlpha = 0.28; q.lineWidth = 1.2; for (i = 0; i < 700; i++) { q.strokeStyle = i % 3 ? '#c8cccf' : '#2c2e30'; var x = r() * S, y = r() * S; q.beginPath(); q.moveTo(x, y); q.quadraticCurveTo(x + 18, y + 4 + r() * 6, x + 38 + r() * 30, y + r() * 10); q.stroke(); } return c; });
  var soil = once('soil', function () { var S = SMALL3D ? 512 : 1024, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(311), mm = S / 500, K = SecPhoto.kit(); q.fillStyle = '#8d8675'; q.fillRect(0, 0, S, S); clouds(q, S, S, r, 7, 7, 0.5, 60, 190); var pat = q.createPattern(greyNoise(128, 128, r, 30, 225), 'repeat'); q.save(); q.globalCompositeOperation = 'overlay'; q.globalAlpha = 0.5; q.fillStyle = pat; q.fillRect(0, 0, S, S); q.restore(); K.place(S, S, mm, r, [[Math.round(S * S / 9000), 4, 11], [Math.round(S * S / 1100), 1.4, 4]], function () { return true; }).forEach(function (s) { K.paintStone(q, r, s, pat, mm, false); }); return c; });
  var film = once('film', function () { var c = mkCanvas(256, 256), q = c.getContext('2d'), r = lcg(19); q.fillStyle = '#808080'; q.fillRect(0, 0, 256, 256); clouds(q, 256, 256, r, 3, 9, 0.6, 40, 220); clouds(q, 256, 256, r, 14, 40, 0.4, 60, 200); return c; });
  function steelCut(len, r, rusty) { // the flat face of a bar sawn along its axis: bright steel, rib stumps at the edges; when rusting, the rust layer at both flanks
    return once('steelcut:' + len.toFixed(2) + ':' + r + ':' + rusty, function () { var w = 96, h = Math.round(len / (2 * r) * w), c = mkCanvas(w, h), g = c.getContext('2d'), rr = lcg(51), y, i;
      var gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#6d7176'); gr.addColorStop(0.18, '#d9dcdf'); gr.addColorStop(0.5, '#eef0f2'); gr.addColorStop(0.85, '#b9bdc2'); gr.addColorStop(1, '#5e6267'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var pitch = w * 0.6; g.fillStyle = '#34302c'; for (y = 3; y < h; y += pitch) { g.fillRect(0, y, 7, pitch * 0.36); g.fillRect(w - 7, y + pitch / 2, 7, pitch * 0.36); }
      g.globalAlpha = 0.16; g.strokeStyle = '#fff'; g.lineWidth = 1; for (y = 0; y < h; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 2.5); g.stroke(); } g.globalAlpha = 1;
      if (rusty) { [0, 1].forEach(function (side) { var rg = g.createLinearGradient(side ? w - 22 : 22, 0, side ? w : 0, 0); rg.addColorStop(0, 'rgba(160,90,40,0)'); rg.addColorStop(0.35, '#9a501f'); rg.addColorStop(1, '#4a2412'); g.fillStyle = rg; g.beginPath(); g.moveTo(side ? w : 0, 0); for (y = 0; y <= h; y += 5) g.lineTo(side ? w - 8 - rr() * 14 : 8 + rr() * 14, y); g.lineTo(side ? w : 0, h); g.closePath(); g.fill(); for (i = 0; i < h / 2; i++) { g.fillStyle = ['rgba(226,142,62,.7)', 'rgba(62,28,12,.7)', 'rgba(176,92,36,.7)'][Math.floor(rr() * 3)]; g.beginPath(); g.ellipse(side ? w - rr() * 16 : rr() * 16, rr() * h, 1 + rr() * 2.5, 1 + rr() * 3, 0, 0, 7); g.fill(); } }); }
      return c; });
  }
  function disc(rusty) { return once('disc:' + rusty, function () { var c = mkCanvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(24, 24, 4, 32, 32, 32); gr.addColorStop(0, '#f2f3f4'); gr.addColorStop(0.6, '#c5c8cc'); gr.addColorStop(1, rusty ? '#7a3b18' : '#7d8186'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; }); }
  /* the sawn face of the member for one damage type: aggregate concrete with what the damage has done to it. box = [z0, z1, y0, y1]; variant per stage */
  function cutFace(scn, box, variant, P) {
    return once('cutface:' + scn + ':' + variant + ':' + box.join(','), function () {
      var PC = SMALL3D ? 1000 : 1500, w = Math.round((box[1] - box[0]) * PC), h = Math.round((box[3] - box[2]) * PC), c = mkCanvas(w, h), g = c.getContext('2d'), A = TEX.aggregate(), r = lcg(88), i, y;
      function X(z) { return (z - box[0]) * PC; } function Y(yy) { return (box[3] - yy) * PC; }
      tile(g, A, w, h, 0.5 * PC / A.width); g.fillStyle = 'rgba(40,38,36,.35)'; g.fillRect(w - 2, 0, 2, h); // formed skin at the face
      if (scn === 'steel' && variant === 'damage') { // carbonation front, the rust halo round the bar, cracks running to the face, the spall
        g.save(); g.globalCompositeOperation = 'overlay'; var cf = g.createLinearGradient(X(-0.05), 0, X(0), 0); cf.addColorStop(0, 'rgba(235,224,206,0)'); cf.addColorStop(0.4, 'rgba(235,224,206,.28)'); cf.addColorStop(1, 'rgba(240,230,214,.36)'); g.fillStyle = cf; g.beginPath(); g.moveTo(w, 0); for (y = 0; y <= h; y += 6) g.lineTo(X(-0.036 - 0.006 * Math.sin(y / 40) - 0.004 * Math.sin(y / 13)), y); g.lineTo(w, h); g.closePath(); g.fill(); g.restore();
        var ya = P.R.cy - P.R.h / 2 - 0.06, yb = P.R.cy + P.R.h / 2 + 0.06; g.save(); g.globalCompositeOperation = 'multiply'; for (y = ya; y <= yb; y += 0.02) { var fade = Math.min(1, Math.min(y - ya, yb - y) / 0.1), rg = g.createRadialGradient(X(P.vZ), Y(y), P.vR * PC * 0.5, X(P.vZ), Y(y), (P.vR + 0.03 + 0.03 * fade) * PC); rg.addColorStop(0, 'rgba(158,88,38,' + (0.3 * fade + 0.05) + ')'); rg.addColorStop(1, 'rgba(158,88,38,0)'); g.fillStyle = rg; g.fillRect(X(P.vZ) - 0.08 * PC, Y(y) - 0.08 * PC, 0.16 * PC, 0.16 * PC); } g.restore();
        g.strokeStyle = '#1a1512'; g.lineCap = 'round'; g.lineJoin = 'round'; [[P.R.cy - 0.19, 2.2], [P.R.cy + 0.2, 2]].forEach(function (cr) { g.lineWidth = cr[1] * PC / 1500; g.beginPath(); var z = P.vZ + P.vR, yy = cr[0]; g.moveTo(X(z), Y(yy)); while (z < 0) { z += 0.004 + r() * 0.004; yy += (r() - 0.5) * 0.006; g.lineTo(X(Math.min(0, z)), Y(yy)); } g.stroke(); });
        g.lineWidth = 1.6 * PC / 1500; g.beginPath(); var y2 = P.R.cy - 0.24; g.moveTo(X(P.vZ + P.vR + 0.001), Y(y2)); while (y2 < P.R.cy + 0.25) { y2 += 0.006; g.lineTo(X(P.vZ + P.vR + 0.001 + (r() - 0.4) * 0.002), Y(y2)); } g.stroke();
      }
      if (scn === 'water') { // the crack through the wall, from the ground water to the inside: open, later chased at the inside, in the end grown shut with crystals
        var ck = [], z, yy2 = P.crackY + 0.004; for (z = -P.W.t; z <= 0; z += 0.006) { yy2 += (r() - 0.5) * 0.005 + (P.crackY - yy2) * 0.12; ck.push([z, yy2]); } ck[ck.length - 1][1] = P.crackY;
        var zEnd = variant === 'leak' ? 0 : -P.chase.d - 0.002;
        g.save(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = variant === 'healed' ? 'rgba(60,76,92,.14)' : 'rgba(60,76,92,.34)'; g.lineWidth = 0.02 * PC; g.lineJoin = 'round'; g.beginPath(); ck.forEach(function (p, m) { if (m) g.lineTo(X(p[0]), Y(p[1])); else g.moveTo(X(p[0]), Y(p[1])); }); g.stroke(); g.restore();
        g.lineCap = g.lineJoin = 'round'; g.strokeStyle = '#15120f'; g.lineWidth = 0.0024 * PC; g.beginPath(); ck.forEach(function (p, m) { if (p[0] > zEnd + 0.003) return; if (m) g.lineTo(X(p[0]), Y(p[1])); else g.moveTo(X(p[0]), Y(p[1])); }); g.stroke();
        g.strokeStyle = variant === 'healed' ? 'rgba(236,240,242,.95)' : '#3aa9da'; g.lineWidth = 0.0013 * PC; g.beginPath(); ck.forEach(function (p, m) { if (p[0] > zEnd) return; if (m) g.lineTo(X(p[0]), Y(p[1])); else g.moveTo(X(p[0]), Y(p[1])); }); g.stroke();
        if (variant === 'healed') { g.strokeStyle = 'rgba(248,250,252,.85)'; g.lineWidth = 0.0005 * PC; for (i = 0; i < 700; i++) { var near = r() < 0.5, px = near ? X(-P.W.t + r() * P.W.t) : X(-Math.pow(r(), 1.8) * 0.06), py = near ? Y(P.crackY + (r() - 0.5) * 0.012) : Y(r() * P.W.h), a = r() * 6.3, l = (0.0012 + r() * 0.0022) * PC; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); g.stroke(); } }
        g.fillStyle = 'rgba(30,27,24,.6)'; g.fillRect(0, Y(0) - 1, w, 2); // the construction joint under the wall
      }
      return c;
    });
  }
  var honey = function () { return TEX.aggregate('pocket'); };
  return { PX: PX, rough: rough, mortar: mortar, rust: rust, coat: coat, slurry: slurry, soil: soil, film: film, steelCut: steelCut, disc: disc, cutFace: cutFace, honey: honey, formed: function () { return TEX.formed(); }, aggregate: function () { return TEX.aggregate(); }, rebar: function () { return TEX.rebar(); } };
})();

var CRM3D = {}; var CR_STAGES = { steel: ['-'], breakout: ['-'], surface: ['-'], water: ['-'] };

