/* ===== [engine_rctx.js] RCTX: textures of the retrospective works ===== */
var RCTX = (function () {
  var C = {};
  function once(k, f) { if (!C[k]) C[k] = f(); return C[k]; }
  /* burlap: a jute sheet soaked in water and hung over the fresh coating — the weave with its open gaps (alpha) */
  var jute = once('jute', function () { var S = 256, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(611), i; q.clearRect(0, 0, S, S); q.fillStyle = '#a98d5f'; q.fillRect(0, 0, S, S); q.globalCompositeOperation = 'destination-out'; for (i = 0; i < S; i += 8) { q.fillRect(i + 5, 0, 2.2, S); q.fillRect(0, i + 5, S, 2.2); } q.globalCompositeOperation = 'source-over'; for (i = 0; i < 2600; i++) { q.fillStyle = r() < 0.5 ? 'rgba(120,96,58,.55)' : 'rgba(214,190,140,.5)'; q.fillRect(r() * S, r() * S, 1 + r() * 2, 1); } for (i = 0; i < S; i += 8) { q.fillStyle = 'rgba(70,52,28,.35)'; q.fillRect(i, 0, 1, S); q.fillRect(0, i, S, 1); } return c; });
  /* the crystallised zone in the concrete (x-ray): a frost of fine white needles */
  var needles = once('needles', function () { var S = 256, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(613), i; q.fillStyle = '#c7d3d9'; q.fillRect(0, 0, S, S); q.lineCap = 'round'; for (i = 0; i < 900; i++) { var x = r() * S, y = r() * S, a = r() * 6.3, l = 3 + r() * 14; q.strokeStyle = r() < 0.7 ? 'rgba(255,255,255,.75)' : 'rgba(160,190,205,.6)'; q.lineWidth = 0.6 + r() * 1.2; q.beginPath(); q.moveTo(x, y); q.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); q.stroke(); } return c; });
  /* the plugging mortar: cement grey, coarse, trowelled */
  var f20 = once('f20', function () { return CRTX.mortar(0.3, 0.3, 783, { tone: '#a3a39d', grain: 1.6, dens: 0.6, k: 0.8, trowel: true }); });
  var im = once('im', function () { return CRTX.mortar(0.4, 0.4, 785, { tone: '#b8b7b0', grain: 1.1, dens: 0.6, k: 0.6, trowel: true }); });
  /* the cement-grey, brushed crystalline slurry: the brush marks of the wide brush */
  var ic = once('ic', function () { return WPTX.slurry('#767b7f', { seed: 831 }); });
  /* hot-dip galvanised steel: the zinc spangle, crystals of slightly different brightness */
  var galv = once('galv', function () { var S = 256, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(617), pts = [], i, k; q.fillStyle = '#b9bdbf'; q.fillRect(0, 0, S, S); for (i = 0; i < 60; i++) pts.push([r() * S, r() * S, 0.82 + r() * 0.3]); var img = q.getImageData(0, 0, S, S), d = img.data, x, y; for (y = 0; y < S; y++) for (x = 0; x < S; x++) { var best = 1e9, bk = 0; for (k = 0; k < pts.length; k++) { var dx = pts[k][0] - x, dy = pts[k][1] - y, dd = dx * dx + dy * dy; if (dd < best) { best = dd; bk = k; } } var t = pts[bk][2] * (0.96 + r() * 0.08), o = (y * S + x) * 4; d[o] = Math.min(255, 185 * t); d[o + 1] = Math.min(255, 189 * t); d[o + 2] = Math.min(255, 192 * t); } q.putImageData(img, 0, 0); return c; });
  /* the shading of an inner corner: alpha from full at the joint (v = 0) to nothing (v = 1) */
  var ao = once('ao', function () { var c = mkCanvas(8, 64), q = c.getContext('2d'), g = q.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#000000'); g.addColorStop(0.35, '#3a3a3a'); g.addColorStop(1, '#ffffff'); q.fillStyle = g; q.fillRect(0, 0, 8, 64); return c; });
  /* washed gravel 16/32 for a drainage bed: rounded stones of grey and brown, packed */
  var gravel = once('gravel', function () { var S = 256, c = mkCanvas(S, S), q = c.getContext('2d'), r = lcg(619), i; q.fillStyle = '#6a625a'; q.fillRect(0, 0, S, S); for (i = 0; i < 700; i++) { var x = r() * S, y = r() * S, rr = 5 + r() * 9, t = 0.55 + r() * 0.5, hue = r(); var col = hue < 0.5 ? [150 * t, 142 * t, 128 * t] : hue < 0.8 ? [160 * t, 150 * t, 132 * t] : [125 * t, 128 * t, 130 * t]; q.fillStyle = 'rgb(' + Math.round(col[0]) + ',' + Math.round(col[1]) + ',' + Math.round(col[2]) + ')'; q.beginPath(); q.ellipse(x, y, rr, rr * (0.65 + r() * 0.35), r() * 3, 0, 7); q.fill(); q.fillStyle = 'rgba(255,255,255,.22)'; q.beginPath(); q.ellipse(x - rr * 0.3, y - rr * 0.3, rr * 0.35, rr * 0.25, 0, 0, 7); q.fill(); q.fillStyle = 'rgba(0,0,0,.28)'; q.beginPath(); q.ellipse(x + rr * 0.35, y + rr * 0.4, rr * 0.5, rr * 0.3, 0, 0, 7); q.fill(); } return c; });
  return { jute: jute, needles: needles, f20: f20, im: im, ic: ic, galv: galv, ao: ao, gravel: gravel };
})();

