/* ===== [tw_geo.js] ===== */
/* ===== TWG — the geography of AUTO 台灣島 =====
   Taiwan as a game island at 1 unit = 1 km in plan (heights exaggerated about eight times, as a relief map does). The coastline is the
   Natural Earth 1:10m outline (public domain, via the world-atlas package), projected about 120.95°E 23.6°N; Penghu, Green Island and
   Orchid Island are enlarged about their centres so that they can be walked. On the outline: a signed distance field, the Central,
   Xueshan, Yushan, Alishan and Coastal ranges as ridges, terraced like a toy relief, the basins of the lakes, the flat ground of the six
   high-speed-rail station districts, and the lines of the island: the ring road and the high-speed rail. North is −z. */
var TWG = (function () {
  var LON0 = 120.95, LAT0 = 23.6, KX = 102.009, KZ = 110.9;
  function ll(lon, lat) { return [(lon - LON0) * KX, -(lat - LAT0) * KZ]; }
  var X0 = -182, Z0 = -206, GW = 322, GH = 412; /* the grid: 1 unit cells, x −182..140, z −206..206 */
  function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------- the outlines ---------- */
  function poly(arr, s, c) { var out = [], i; for (i = 0; i < arr.length; i += 2) out.push([c[0] + (arr[i] - c[0]) * s, c[1] + (arr[i + 1] - c[1]) * s]); return out; }
  function centroid(list) { var x = 0, z = 0, n = 0; list.forEach(function (a) { for (var i = 0; i < a.length; i += 2) { x += a[i]; z += a[i + 1]; n++; } }); return [x / n, z / n]; }
  var C = TW_COAST, PH = centroid([C.penghu, C.penghuW, C.penghuN]), GR = centroid([C.green]), OR = centroid([C.orchid]), LQ = centroid([C.liuqiu]);
  var POLYS = [
    { id: 'main', p: poly(C.main, 1, [0, 0]) },
    { id: 'penghu', p: poly(C.penghu, 2.4, PH) }, { id: 'penghuW', p: poly(C.penghuW, 2.4, PH) }, { id: 'penghuN', p: poly(C.penghuN, 2.4, PH) },
    { id: 'green', p: poly(C.green, 1.9, GR) }, { id: 'liuqiu', p: poly(C.liuqiu, 1.9, LQ) }, { id: 'orchid', p: poly(C.orchid, 1.7, OR) }, { id: 'sandbar', p: poly(C.sandbar, 1, [0, 0]) }
  ];

  /* ---------- places (lon, lat of the real places) ---------- */
  /* the high-speed-rail stations, north to south (the nine the game builds) */
  var STATIONS = ['tpe', 'tao', 'hsz', 'txg', 'chw', 'yun', 'cyi', 'tnn', 'khh'];
  var PL = {
    tpe: ll(121.517, 25.048), tao: ll(121.215, 25.013), hsz: ll(121.040, 24.808), txg: ll(120.616, 24.112), chw: ll(120.5748, 23.8741), yun: ll(120.4173, 23.7336), cyi: ll(120.3233, 23.4596), tnn: ll(120.286, 22.925), khh: ll(120.330, 22.688),
    shrine: ll(121.300, 25.000), diner: ll(121.527, 25.056), sml: ll(120.912, 23.858), ali: ll(120.808, 23.512), ken: ll(120.792, 21.948), eluan: ll(120.852, 21.905),
    hua: ll(121.598, 23.985), taroko: ll(121.50, 24.16), tai: ll(121.150, 22.758), chishang: ll(121.215, 23.105), port: ll(120.262, 22.640), magong: ll(119.566, 23.566),
    lotus: ll(120.297, 22.682), temple: ll(120.203, 22.997), keelung: ll(121.742, 25.130), yilan: ll(121.752, 24.757), hsinchuCoast: ll(120.920, 24.830), yushan: ll(120.957, 23.470), twinHeart: ll(119.420, 23.300)
  };
  PL.khh = [PL.khh[0] + 3.0, PL.khh[1] - 1.0]; /* the Zuoying district a little inland: in the game it needs room to the sea */
  PL.port = [PL.port[0] + 2.2, PL.port[1]];
  PL.magong = [PH[0] + (PL.magong[0] - PH[0]) * 2.4, PH[1] + (PL.magong[1] - PH[1]) * 2.4];
  PL.twinHeart = [PL.magong[0] - 6, PL.magong[1] + 13];

  /* ---------- the signed distance to the coast (positive on land) ---------- */
  var SDF = new Float32Array(GW * GH);
  function edt1(f, n, d, v, z) { var k = 0, q, s; v[0] = 0; z[0] = -1e20; z[1] = 1e20; for (q = 1; q < n; q++) { s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); } k++; v[k] = q; z[k] = s; z[k + 1] = 1e20; } k = 0; for (q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; } }
  function edt(grid) { /* grid: 0 at the sites, 1e20 elsewhere; returns squared distances */ var W = GW, H = GH, n = Math.max(W, H), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1), x, y, out = new Float64Array(W * H);
    for (x = 0; x < W; x++) { for (y = 0; y < H; y++) f[y] = grid[y * W + x]; edt1(f, H, d, v, z); for (y = 0; y < H; y++) out[y * W + x] = d[y]; }
    for (y = 0; y < H; y++) { for (x = 0; x < W; x++) f[x] = out[y * W + x]; edt1(f, W, d, v, z); for (x = 0; x < W; x++) out[y * W + x] = d[x]; } return out; }
  var LAND = null;
  function buildSDF() {
    var cv = document.createElement('canvas'); cv.width = GW; cv.height = GH; var g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, GW, GH); g.fillStyle = '#fff';
    POLYS.forEach(function (P) { g.beginPath(); P.p.forEach(function (q, i) { var x = q[0] - X0, y = q[1] - Z0; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); g.fill(); });
    var px = g.getImageData(0, 0, GW, GH).data, n = GW * GH, inL = new Uint8Array(n), a = new Float64Array(n), b = new Float64Array(n), i;
    for (i = 0; i < n; i++) { inL[i] = px[i * 4] > 127 ? 1 : 0; a[i] = inL[i] ? 1e20 : 0; b[i] = inL[i] ? 0 : 1e20; }
    var dIn = edt(a), dOut = edt(b); for (i = 0; i < n; i++) SDF[i] = inL[i] ? Math.sqrt(dIn[i]) - 0.5 : -(Math.sqrt(dOut[i]) - 0.5);
    LAND = inL; return cv; }
  function bil(A, x, z) { var gx = x - X0 - 0.5, gz = z - Z0 - 0.5; if (gx < 0) gx = 0; if (gz < 0) gz = 0; if (gx > GW - 1.001) gx = GW - 1.001; if (gz > GH - 1.001) gz = GH - 1.001; var ix = gx | 0, iz = gz | 0, fx = gx - ix, fz = gz - iz, k = iz * GW + ix; return (A[k] * (1 - fx) + A[k + 1] * fx) * (1 - fz) + (A[k + GW] * (1 - fx) + A[k + GW + 1] * fx) * fz; }
  function sdf(x, z) { return bil(SDF, x, z); }

  /* ---------- noise ---------- */
  function hash(x, z) { var h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return h - Math.floor(h); }
  function vnoise(x, z) { var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz; fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz); var a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1); return (a + (b - a) * fx) * (1 - fz) + (c + (d - c) * fx) * fz; }
  function fbm(x, z) { return vnoise(x, z) * 0.55 + vnoise(x * 2.1 + 17, z * 2.1 - 9) * 0.3 + vnoise(x * 4.3 - 31, z * 4.3 + 5) * 0.15; }

  /* ---------- the ranges: polylines with a crest height and a half width ---------- */
  function R(pts, h, w) { return { p: pts.map(function (q) { return ll(q[0], q[1]); }), h: h, w: w }; }
  var RIDGES = [
    R([[121.62, 24.80], [121.40, 24.45], [121.27, 24.17], [121.10, 23.80], [121.00, 23.47], [120.90, 23.05], [120.82, 22.62], [120.76, 22.25]], [10, 19, 24, 22, 20, 15, 9, 5], 15),   /* Central Range */
    R([[121.78, 24.98], [121.50, 24.65], [121.24, 24.38], [121.08, 24.16], [120.98, 23.98]], [6, 14, 23, 16, 10], 10),                                          /* Xueshan Range */
    R([[120.90, 23.62], [120.957, 23.47], [121.0, 23.36]], [16, 29, 18], 6),                                                                                  /* Yushan massif */
    R([[120.74, 23.86], [120.78, 23.62], [120.80, 23.45], [120.74, 23.20]], [7, 11, 13, 8], 7),                                                            /* Alishan Range */
    R([[121.58, 23.92], [121.47, 23.55], [121.36, 23.22], [121.22, 22.92]], [5, 8, 8, 5], 4.5),                                                             /* Coastal Range */
    R([[121.50, 25.20], [121.58, 25.17]], [6, 6], 4),                                                                                                        /* Yangmingshan */
    R([[120.80, 21.98], [120.86, 22.08]], [3.5, 2.5], 2.6)                                                                                                    /* Dajianshan, Kenting */
  ];
  function segD(px, pz, a, b) { var dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, t = L2 ? clamp(((px - a[0]) * dx + (pz - a[1]) * dz) / L2, 0, 1) : 0, x = a[0] + dx * t - px, z = a[1] + dz * t - pz; return [Math.sqrt(x * x + z * z), t]; }
  function ridges(x, z) { var m = 0; RIDGES.forEach(function (r) { var bd = 1e9, bh = 0, i; for (i = 0; i < r.p.length - 1; i++) { var s = segD(x, z, r.p[i], r.p[i + 1]); if (s[0] < bd) { bd = s[0]; bh = r.h[i] + (r.h[i + 1] - r.h[i]) * s[1]; } } var w = r.w * (0.85 + 0.3 * vnoise(x * 0.05, z * 0.05)); var v = bh * Math.exp(-(bd * bd) / (w * w)); if (v > m) m = v + (m > 0 ? m * 0.15 : 0); }); return m; }

  /* ---------- Sun Moon Lake: its real outline ---------- */
  /* the shoreline traced from OpenStreetMap (© OpenStreetMap contributors, ODbL): km east (x) and south (z) of Lalu Island, 308 points,
     7.98 km² against the 7.93 km² on record. The round "sun" basin to the north and east (Wenwu Temple, Songbolun, the Dazhu bay to the
     east), Shuishe and the Hanbi peninsula to the north-west, the long "moon" arm reaching south past Qinglong Hill and Xuanguang Temple
     towards Toushe, the Ita Thao bay to the south-east. Drawn SML_K (six) times larger than the island around it, so that its shores, villages
     and ropeway can be walked. */
  var SML_OUT = [[1.11, -1.61], [1.14, -1.59], [1.11, -1.52], [1.13, -1.5], [1.06, -1.42], [1.13, -1.37], [1.11, -1.35], [1.15, -1.31], [1.2, -1.32], [1.25, -1.38], [1.25, -1.42], [1.3, -1.39], [1.34, -1.44], [1.32, -1.47], [1.34, -1.5], [1.41, -1.46], [1.35, -1.35], [1.37, -1.19], [1.44, -1.13], [1.48, -1.17], [1.6, -1.12], [1.56, -1.03], [1.63, -0.89], [1.55, -0.79], [1.58, -0.76], [1.7, -0.77], [1.76, -0.72], [1.97, -0.97], [2.02, -0.95], [2.08, -0.86], [2.23, -0.99], [2.31, -0.93], [2.36, -0.98], [2.4, -0.92], [2.37, -0.87], [2.38, -0.84], [2.41, -0.8], [2.51, -0.8], [2.54, -0.74], [2.61, -0.71], [2.51, -0.55], [2.54, -0.51], [2.57, -0.5], [2.68, -0.58], [2.9, -0.58], [3.11, -0.4], [3.06, -0.34], [3.11, -0.26], [2.9, -0.05], [2.8, -0.05], [2.75, -0.09], [2.64, -0.05], [2.54, -0.05], [2.43, -0.11], [2.4, -0.06], [2.47, 0.02], [2.47, 0.08], [2.53, 0.14], [2.53, 0.22], [2.43, 0.25], [2.28, 0.21], [2.24, 0.28], [2.15, 0.28], [2.12, 0.31], [2.14, 0.37], [2.01, 0.49], [2.01, 0.53], [2.07, 0.62], [2.17, 0.59], [2.23, 0.62], [2.3, 0.74], [2.26, 0.76], [2.23, 0.73], [2.19, 0.77], [2.23, 0.82], [2.26, 0.79], [2.29, 0.87], [2.23, 0.91], [2.18, 0.89], [2.09, 0.92], [2.04, 0.89], [2.01, 0.92], [1.97, 0.89], [1.94, 0.93], [1.95, 0.97], [1.91, 0.94], [1.86, 0.97], [1.82, 0.94], [1.72, 1.02], [1.76, 1.06], [1.8, 1.03], [1.72, 1.16], [1.69, 1.37], [1.73, 1.46], [1.71, 1.51], [1.77, 1.59], [1.7, 1.51], [1.57, 1.5], [1.55, 1.48], [1.49, 1.5], [1.51, 1.44], [1.37, 1.28], [1.36, 1.19], [1.33, 1.16], [1.34, 1.09], [1.32, 1.04], [1.34, 0.97], [1.24, 0.88], [1.19, 0.88], [1.21, 0.73], [1.15, 0.66], [1.13, 0.53], [1.16, 0.46], [1.11, 0.36], [0.99, 0.51], [0.87, 0.51], [0.83, 0.56], [0.86, 0.62], [0.92, 0.62], [0.92, 0.67], [0.97, 0.74], [0.84, 0.96], [0.89, 1.03], [0.94, 1.02], [0.94, 1.17], [0.92, 1.17], [0.72, 1], [0.64, 0.83], [0.5, 0.89], [0.43, 0.86], [0.35, 0.91], [0.32, 0.89], [0.28, 0.9], [0.26, 0.76], [0.32, 0.7], [0.25, 0.65], [0.27, 0.62], [0.23, 0.56], [0.2, 0.52], [0.16, 0.53], [0.03, 0.64], [0.04, 0.75], [0.13, 0.84], [0.11, 0.95], [0.05, 1.04], [0.06, 1.3], [0.1, 1.33], [0.18, 1.22], [0.21, 1.35], [0.24, 1.38], [0.34, 1.39], [0.43, 1.47], [0.48, 1.55], [0.46, 1.63], [0.31, 1.61], [0.22, 1.71], [0.13, 1.63], [0.08, 1.7], [0.16, 1.82], [0.22, 1.78], [0.29, 1.84], [0.29, 1.91], [0.37, 2], [0.49, 2.03], [0.49, 2.06], [0.42, 2.1], [0.45, 2.14], [0.52, 2.12], [0.52, 2.17], [0.43, 2.25], [0.43, 2.35], [0.46, 2.38], [0.53, 2.38], [0.58, 2.44], [0.57, 2.59], [0.51, 2.58], [0.48, 2.62], [0.51, 2.73], [0.47, 2.85], [0.41, 2.81], [0.36, 2.83], [0.33, 2.79], [0.28, 2.82], [0.29, 2.75], [0.25, 2.71], [0.22, 2.75], [0.1, 2.7], [0.11, 2.64], [0.08, 2.6], [-0.03, 2.64], [-0.13, 2.55], [-0.15, 2.58], [-0.17, 2.55], [-0.12, 2.48], [-0.24, 2.36], [-0.29, 2.4], [-0.3, 2.45], [-0.36, 2.47], [-0.34, 2.45], [-0.36, 2.41], [-0.35, 2.25], [-0.26, 2.17], [-0.29, 2.1], [-0.27, 2.06], [-0.3, 2.02], [-0.33, 1.85], [-0.41, 1.75], [-0.47, 1.8], [-0.45, 1.84], [-0.49, 1.93], [-0.5, 1.91], [-0.56, 1.96], [-0.66, 1.96], [-0.71, 1.91], [-0.73, 1.71], [-0.5, 1.35], [-0.57, 1.29], [-0.57, 1.19], [-0.61, 1.16], [-0.76, 1.16], [-0.78, 1.04], [-0.64, 1.01], [-0.55, 0.86], [-0.51, 0.91], [-0.45, 0.76], [-0.53, 0.69], [-0.58, 0.71], [-0.63, 0.59], [-0.6, 0.52], [-0.71, 0.39], [-0.77, 0.42], [-0.79, 0.4], [-0.83, 0.43], [-0.8, 0.47], [-0.88, 0.53], [-0.92, 0.63], [-0.97, 0.58], [-1.03, 0.63], [-0.98, 0.56], [-1.01, 0.51], [-1.04, 0.52], [-1, 0.43], [-1.02, 0.4], [-0.98, 0.36], [-0.94, 0.38], [-0.88, 0.31], [-0.97, 0.2], [-0.96, 0.11], [-0.86, 0.06], [-0.91, -0.01], [-0.99, 0.06], [-1.06, 0.07], [-1.1, 0.02], [-1.13, 0.05], [-1.17, 0], [-1.12, -0.07], [-1.12, -0.18], [-1.07, -0.23], [-1.12, -0.27], [-1.19, -0.22], [-1.23, -0.27], [-1.15, -0.41], [-0.91, -0.48], [-0.81, -0.48], [-0.77, -0.52], [-0.79, -0.68], [-0.84, -0.72], [-0.83, -0.8], [-0.9, -0.88], [-0.86, -0.93], [-0.89, -0.98], [-0.84, -0.93], [-0.82, -0.96], [-0.64, -0.91], [-0.6, -0.93], [-0.53, -0.92], [-0.42, -0.83], [-0.35, -0.83], [-0.35, -0.79], [-0.42, -0.78], [-0.46, -0.72], [-0.54, -0.72], [-0.6, -0.68], [-0.59, -0.48], [-0.48, -0.38], [-0.4, -0.45], [-0.19, -0.52], [-0.07, -0.65], [-0.05, -0.74], [0.02, -0.79], [0.24, -0.76], [0.31, -0.81], [0.32, -0.96], [0.45, -1.08], [0.44, -1.15], [0.49, -1.2], [0.44, -1.26], [0.5, -1.32], [0.47, -1.35], [0.49, -1.43], [0.45, -1.48], [0.47, -1.54], [0.58, -1.49], [0.67, -1.52], [0.75, -1.52], [0.82, -1.56], [0.92, -1.5], [0.98, -1.56]];
  var SML_K = 6.0, SML_ISLE = [-0.07, 0.03, 0.09], LK = null;
  function lakeLocal(lx, lz) { var c = PL.sml; return [c[0] + lx * SML_K, c[1] + lz * SML_K]; }
  function lakePrep() { var raw = SML_OUT.map(function (q) { return lakeLocal(q[0], q[1]); }), n = raw.length, pts = raw, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, mr = 0, c = PL.sml, it, i;
    for (it = 0; it < 2; it++) { var q = pts.map(function (a) { return a.slice(); }); for (i = 0; i < n; i++) { var a = q[(i - 1 + n) % n], b = q[(i + 1) % n]; pts[i] = [(a[0] + b[0] + q[i][0] * 2) / 4, (a[1] + b[1] + q[i][1] * 2) / 4]; } }
    pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); mr = Math.max(mr, Math.hypot(p[0] - c[0], p[1] - c[1])); });
    var isl = lakeLocal(SML_ISLE[0], SML_ISLE[1]); LK = { pts: pts, x0: x0 - 13, x1: x1 + 13, z0: z0 - 13, z1: z1 + 13, r: mr, h: 1.7, carve: 1.6, edge: 11.5, isle: [isl[0], isl[1], SML_ISLE[2] * SML_K] }; }
  /* signed distance to the shore: positive over the water */
  function lakeSD(x, z) { if (!LK || x < LK.x0 || x > LK.x1 || z < LK.z0 || z > LK.z1) return -99; var P = LK.pts, n = P.length, inside = false, best = 1e9, i, j;
    for (i = 0, j = n - 1; i < n; j = i++) { var a = P[i], b = P[j]; if (((a[1] > z) !== (b[1] > z)) && (x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0])) inside = !inside; var dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, t = L2 ? clamp(((x - a[0]) * dx + (z - a[1]) * dz) / L2, 0, 1) : 0, ex = a[0] + dx * t - x, ez = a[1] + dz * t - z, d = ex * ex + ez * ez; if (d < best) best = d; }
    best = Math.sqrt(best); return inside ? best : -best; }
  /* the basin: a lake bed below the water, a narrow shore just above it, and the wooded hills that rise straight from the water all round
     (Qinglong, Shabalan, the ridge of the culture park), before the land returns to its own relief */
  function lakeShape(x, z, h) { if (!LK) return h; var d = lakeSD(x, z); if (d < -LK.edge) return h; var H0 = LK.h, shore = H0 + 0.22, I = LK.isle, di = Math.hypot(x - I[0], z - I[1]);
    if (d > 0) { var bed = H0 - 0.2 - LK.carve * sstep(0.15, 2.4, d) * (0.75 + 0.25 * vnoise(x * 0.4, z * 0.4)), out = shore + (bed - shore) * sstep(0, 0.42, d);
      if (di < I[2] + 0.6) out = Math.max(out, H0 + 0.24 - 0.7 * sstep(I[2] - 0.1, I[2] + 0.6, di)); return out; }
    var e = -d, hill = (1.6 + 2.4 * fbm(x * 0.21 + 3, z * 0.21 - 7)) * sstep(0.35, 4.5, e) + 0.2 * Math.max(0, e - 4.5), k = 1 - sstep(LK.edge - 4.5, LK.edge, e), tgt = shore + hill; return h + (tgt - h) * k; }
  /* ---------- flat ground and basins ---------- */
  var ZONES = []; /* { x, z, r, edge, h (target) | carve } */
  function zone(o) { ZONES.push(o); return o; }
  var lastM = 0;
  function natural(x, z) {
    var d = sdf(x, z), h;
    h = -3.2 + 3.6 * sstep(-9, 2.6, d);                    /* sea floor → beach (≈0.4 at 2.6 units inland) */
    h += 0.75 * sstep(2.6, 14, d);                          /* the plains */
    var m = ridges(x, z), n = fbm(x * 0.07, z * 0.07); lastM = m;
    var mm = m * (0.75 + 0.5 * n) * sstep(1.5, 14, d);
    h += mm + sstep(3, 16, d) * (n - 0.45) * 1.2 * sstep(0.5, 4, m + 1.5);
    if (h > 2.6) { var T = 2.3, k = h / T, f = k - Math.floor(k), tr = (Math.floor(k) + sstep(0.62, 1.0, f)) * T; h = h + (tr - h) * 0.16 * sstep(2.6, 6, h); } /* a hint of benches on the slopes (v35: the stepped relief made cliffs that roads could not climb) */
    return h; }
  function natural2(x, z) { return lakeShape(x, z, natural(x, z)); }
  function height0(x, z) { var h = natural2(x, z), m0 = lastM, i; for (i = 0; i < ZONES.length; i++) { var Z = ZONES[i], dx = x - Z.x, dz = z - Z.z, dd = Math.sqrt(dx * dx + dz * dz); if (dd > Z.r + Z.edge) continue; if (Z.dry && lakeSD(x, z) > -0.3) continue; var k = 1 - sstep(Z.r, Z.r + Z.edge, dd);
      if (Z.carve) { var u = Math.min(1, dd / Z.r), bed = Z.h - Z.carve * (1 - u * u); h = h + (Math.min(h, dd < Z.r ? bed : Z.h + 0.6) - h) * k; } else h = h + (Z.h - h) * k; m0 *= 1 - k; }
    lastM = m0; return h; }
  var HG = null; /* the height grid (1 unit) */
  var RG = null; /* the ridge strength grid (mountain-ness) */
  function buildHeights() { HG = new Float32Array(GW * GH); RG = new Float32Array(GW * GH); var x, z; for (z = 0; z < GH; z++) for (x = 0; x < GW; x++) { HG[z * GW + x] = height0(X0 + x + 0.5, Z0 + z + 0.5); RG[z * GW + x] = lastM; } }
  function mount(x, z) { return RG ? bil(RG, x, z) : 0; }
  function height(x, z) { return HG ? bil(HG, x, z) : height0(x, z); }
  function normal(x, z, out) { var e = 0.6, hx = height(x + e, z) - height(x - e, z), hz = height(x, z + e) - height(x, z - e); out = out || { x: 0, y: 1, z: 0 }; var l = Math.sqrt(hx * hx + 4 * e * e + hz * hz); out.x = -hx / l; out.y = 2 * e / l; out.z = -hz / l; return out; }

  /* ---------- lines: a Catmull-Rom through lon/lat points, sampled every `step` units ---------- */
  function line(pts, step, closed, isLL) { var P = pts.map(function (q) { return isLL ? ll(q[0], q[1]) : q; }), n = P.length, out = [], i;
    function cr(p0, p1, p2, p3, t) { var t2 = t * t, t3 = t2 * t; return [0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]; }
    var dense = [], segs = closed ? n : n - 1; for (i = 0; i < segs; i++) { var p0 = P[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[closed ? (i + 2) % n : Math.min(n - 1, i + 2)], L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), k = Math.max(2, Math.ceil(L / 0.5)), j; for (j = 0; j < k; j++) dense.push(cr(p0, p1, p2, p3, j / k)); } if (!closed) dense.push(P[n - 1]); else dense.push(dense[0]);
    var acc = 0; out.push(dense[0].slice()); for (i = 1; i < dense.length; i++) { var a = dense[i - 1], b = dense[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]); acc += d; while (acc >= step) { acc -= step; var u = 1 - acc / d; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); } }
    if (closed) out.pop(); return out; }
  /* the high-speed rail: Taipei → Zuoying through the real stations */
  var HSR_LL = [[121.517, 25.048], [121.464, 25.014], [121.215, 25.013], [121.040, 24.808], [120.826, 24.606], [120.616, 24.112], [120.574, 23.874], [120.416, 23.736], [120.323, 23.459], [120.286, 22.925], [120.330, 22.688]];
  /* the ring road: west coast through the cities, Kenting, the south link, the Huatung valley, the Su-Hua coast, the north coast */
  var RING_LL = [[121.742, 25.13], [121.60, 25.08], [121.517, 25.040], [121.30, 24.985], [121.13, 24.88], [120.98, 24.80], [120.82, 24.56], [120.68, 24.16], [120.55, 24.06], [120.45, 23.72], [120.44, 23.47], [120.30, 23.12], [120.25, 22.96], [120.30, 22.72], [120.42, 22.66], [120.56, 22.42], [120.68, 22.12], [120.76, 21.97], [120.84, 21.93], [120.86, 22.03], [120.88, 22.28], [120.98, 22.52], [121.14, 22.76], [121.17, 23.02], [121.23, 23.13], [121.32, 23.35], [121.44, 23.70], [121.56, 23.94], [121.66, 24.17], [121.76, 24.40], [121.83, 24.60], [121.76, 24.76], [121.84, 24.92], [121.86, 25.04]];
  var lines = null;
  function buildLines() { var hsr = line(HSR_LL, 1, false, true); hsr[0] = PL.tpe.slice(); var ring = line(RING_LL, 1, true, true); lines = { hsr: hsr, ring: ring }; return lines; }
  function nearOn(L, x, z) { var b = 0, bd = 1e18, i; for (i = 0; i < L.length; i++) { var dx = L[i][0] - x, dz = L[i][1] - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; b = i; } } return { i: b, d: Math.sqrt(bd) }; }

  /* ---------- road grading: the road keeps a smooth grade; the ground under it and its shoulders is cut or filled to meet it ---------- */
  function grade(pts, hw, edge, o) { o = o || {}; var n = pts.length, hs = [], i, k, pass; if (!HG || n < 2) return null;
    for (i = 0; i < n; i++) hs.push(Math.max(height(pts[i][0], pts[i][1]), o.min == null ? 0.25 : o.min)); var raw = hs.slice();
    for (pass = 0; pass < (o.passes || 4); pass++) { var t = hs.slice(); for (i = 0; i < n; i++) { var sm = 0, c = 0; for (k = -3; k <= 3; k++) { var j = o.closed ? (i + k + n) % n : Math.max(0, Math.min(n - 1, i + k)); sm += t[j]; c++; } hs[i] = sm / c; } }
    var g = o.grade || 0.4; for (pass = 0; pass < 3; pass++) { for (i = 1; i < n; i++) hs[i] = clamp(hs[i], hs[i - 1] - g, hs[i - 1] + g); for (i = n - 2; i >= 0; i--) hs[i] = clamp(hs[i], hs[i + 1] - g, hs[i + 1] + g); }
    if (o.pinA || o.pinB) pinEnds(hs, raw, o.pinA, o.pinB);
    var best = {}, R2 = hw + edge; for (i = 0; i < n - (o.closed ? 0 : 1); i++) { var a = pts[i], b = pts[(i + 1) % n], ha = hs[i], hb = hs[(i + 1) % n], gx0 = Math.floor(Math.min(a[0], b[0]) - R2 - X0), gx1 = Math.ceil(Math.max(a[0], b[0]) + R2 - X0), gz0 = Math.floor(Math.min(a[1], b[1]) - R2 - Z0), gz1 = Math.ceil(Math.max(a[1], b[1]) + R2 - Z0), ix, iz;
      for (iz = Math.max(0, gz0); iz <= Math.min(GH - 1, gz1); iz++) for (ix = Math.max(0, gx0); ix <= Math.min(GW - 1, gx1); ix++) { var wx = X0 + ix + 0.5, wz = Z0 + iz + 0.5, sd = segD(wx, wz, a, b); if (sd[0] > R2) continue; var key = iz * GW + ix, cur = best[key]; if (!cur || cur[0] > sd[0]) best[key] = [sd[0], ha + (hb - ha) * sd[1]]; } }
    Object.keys(best).forEach(function (key) { var q = best[key], kk = +key, w = 1 - sstep(hw, R2, q[0]); if (SDF[kk] < 0.3) return; var wx = X0 + (kk % GW) + 0.5, wz = Z0 + Math.floor(kk / GW) + 0.5; if (LK && lakeSD(wx, wz) > -0.45) return; HG[kk] = HG[kk] + (q[1] - HG[kk]) * w; });
    for (i = 0; i < n; i++) pts[i][2] = hs[i] + (o.lift || 0.06); return hs; }
  /* the ends of a branch meet the road they leave at that road's own level: blend the graded profile back to the ground there */
  function pinEnds(hs, raw, a, b) { var n = hs.length, i, m = Math.min(5, Math.floor(n / 2)); for (i = 0; i < m; i++) { var t = sstep(0, m, i); if (a) hs[i] = raw[0] + (hs[i] - raw[0]) * t; if (b) hs[n - 1 - i] = raw[n - 1] + (hs[n - 1 - i] - raw[n - 1]) * t; } }
  /* the lake's own road: the outer level line at a set distance from the shore (more where a village or the visitor centre needs room),
     traced by marching squares over the lake's distance field — so a neck of land too narrow for it is passed round, never entered */
  function lakeRoad(D) { if (!LK) return null; var st = 0.5, x0 = LK.x0 + 2, z0 = LK.z0 + 2, nx = Math.ceil((LK.x1 - LK.x0 - 4) / st) + 1, nz = Math.ceil((LK.z1 - LK.z0 - 4) / st) + 1, f = new Float32Array(nx * nz), i, j;
    for (j = 0; j < nz; j++) for (i = 0; i < nx; i++) { var x = x0 + i * st, z = z0 + j * st; f[j * nx + i] = (i === 0 || j === 0 || i === nx - 1 || j === nz - 1) ? -9 : lakeSD(x, z) + D(x, z); }
    var pts = {}, adj = {}; function key(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
    function ep(a, b) { var k = key(a, b); if (!pts[k]) { var ia = a % nx, ja = (a - ia) / nx, ib = b % nx, jb = (b - ib) / nx, va = f[a], vb = f[b], t = va / (va - vb); pts[k] = [x0 + (ia + (ib - ia) * t) * st, z0 + (ja + (jb - ja) * t) * st]; } return k; }
    function link(p, q) { (adj[p] = adj[p] || []).push(q); (adj[q] = adj[q] || []).push(p); }
    for (j = 0; j < nz - 1; j++) for (i = 0; i < nx - 1; i++) { var a = j * nx + i, b = a + 1, c = a + nx + 1, d = a + nx, ca = f[a] > 0, cb = f[b] > 0, cc = f[c] > 0, cd = f[d] > 0, E = [], n = (ca ? 1 : 0) + (cb ? 2 : 0) + (cc ? 4 : 0) + (cd ? 8 : 0); if (n === 0 || n === 15) continue;
      if (ca !== cb) E.push(ep(a, b)); if (cb !== cc) E.push(ep(b, c)); if (cc !== cd) E.push(ep(c, d)); if (cd !== ca) E.push(ep(d, a));
      if (E.length === 2) link(E[0], E[1]); else if (E.length === 4) { var mid = (f[a] + f[b] + f[c] + f[d]) / 4 > 0; if ((mid ? 1 : 0) === (ca ? 1 : 0)) { link(E[0], E[1]); link(E[2], E[3]); } else { link(E[0], E[3]); link(E[1], E[2]); } } }
    var seen = {}, loops = []; Object.keys(adj).forEach(function (k0) { if (seen[k0]) return; var loop = [], cur = k0, prev = null, guard = 0; while (cur && !seen[cur] && guard++ < 100000) { seen[cur] = 1; loop.push(pts[cur]); var nb = adj[cur].filter(function (q) { return q !== prev && !seen[q]; }); prev = cur; cur = nb[0]; } if (loop.length > 8) loops.push(loop); });
    loops.sort(function (p, q) { return q.length - p.length; }); var P = loops[0]; if (!P) return null;
    for (var it = 0; it < 3; it++) { var Q = P.map(function (q) { return q.slice(); }), m = P.length; for (i = 0; i < m; i++) { var u = Q[(i - 1 + m) % m], v = Q[(i + 1) % m]; P[i] = [(u[0] + v[0] + Q[i][0] * 2) / 4, (u[1] + v[1] + Q[i][1] * 2) / 4]; } }
    return line(P.filter(function (q, k) { return k % 2 === 0; }), 1, true); }
  /* ---------- build everything once ---------- */
  var built = false, maskCanvas = null;
  function build() {
    if (built) return API; built = true; maskCanvas = buildSDF(); buildLines();
    /* the Eluanbi cape: the outline is coarse, so the lighthouse is drawn back onto land */
    (function () { var x = PL.eluan[0], z = PL.eluan[1], i; for (i = 0; i < 40 && sdf(x, z) < 1.4; i++) { var e = 0.6, gx = sdf(x + e, z) - sdf(x - e, z), gz = sdf(x, z + e) - sdf(x, z - e), l = Math.hypot(gx, gz) || 1; x += gx / l * 0.5; z += gz / l * 0.5; } PL.eluan = [x, z]; })();
    /* Magong town on the broadest ground of its peninsula (the outline is coarse at this scale) */
    (function () { var m = PL.magong, best = m, bs = -1e9, x, z; for (x = -7; x <= 7; x += 0.5) for (z = -7; z <= 7; z += 0.5) { var d = Math.hypot(x, z); if (d > 7) continue; var sc = sdf(m[0] + x, m[1] + z) - d * 0.12; if (sc > bs) { bs = sc; best = [m[0] + x, m[1] + z]; } } PL.magong = best; PL.twinHeart = [best[0] - 6, best[1] + 13]; })();
    /* the station districts: flat ground at the plains' level */
    STATIONS.forEach(function (k) { var p = PL[k]; zone({ id: k, x: p[0], z: p[1], r: 13, edge: 7, h: 0.95 }); });
    /* the frames of the six stations, as the world will build them (the stop is the nearest point of the line; the plaza opens away from the sea, south for the two of the north) */
    var SFR = {}; STATIONS.forEach(function (k) { var L = lines.hsr, p = PL[k], bi = 0, bd = 1e18, i; for (i = 0; i < L.length; i++) { var d = (L[i][0] - p[0]) * (L[i][0] - p[0]) + (L[i][1] - p[1]) * (L[i][1] - p[1]); if (d < bd) { bd = d; bi = i; } }
      var i0 = Math.min(bi, L.length - 2), a = L[i0], b = L[i0 + 1], tx = b[0] - a[0], tz = b[1] - a[1], tl = Math.hypot(tx, tz) || 1, nx = -tz / tl, nz = tx / tl, P = L[bi]; if (sdf(P[0] - nx * 10, P[1] - nz * 10) > sdf(P[0] + nx * 10, P[1] + nz * 10)) { nx = -nx; nz = -nz; } if ((k === 'tpe' || k === 'tao') && nz < 0) { nx = -nx; nz = -nz; }
      var cx = P[0] + nx * 4.2, cz = P[1] + nz * 4.2; SFR[k] = { nx: nx, nz: nz, toW: function (lx, lz) { return [cx + lx * nz + lz * nx, cz - lx * nx + lz * nz]; } };
      var zc = SFR[k].toW(0, 7.8); zone({ id: k + 'P', x: zc[0], z: zc[1], r: 12.5, edge: 6, h: 0.95 }); /* the plaza and its blocks, flat */ });
    API.SFR = SFR;
    /* the late-night diner's alley: north-east of Taipei station, beyond the end of the viaduct (as the bar alleys of 中山 lie from the main station) */
    PL.diner = SFR.tpe.toW(16.5, -2.0); zone({ id: 'diner', x: PL.diner[0], z: PL.diner[1], r: 6.5, edge: 4, h: 0.95 });
    /* the shrine on its own hill just beyond Taoyuan's district, across the ring road */
    PL.shrine = SFR.tao.toW(-4, 24); PL.shrineRot = Math.atan2(SFR.tao.nz, -SFR.tao.nx); /* its approach runs east, parallel to the line, and meets the ring road */
    zone({ id: 'shrine', x: PL.shrine[0], z: PL.shrine[1], r: 4.2, edge: 5, h: 2.75 });     /* the shrine on its hill */
    zone({ id: 'port', x: PL.port[0], z: PL.port[1], r: 5, edge: 4, h: 0.8 });
    zone({ id: 'magong', x: PL.magong[0], z: PL.magong[1], r: 6, edge: 4, h: 0.8 });
    zone({ id: 'ken', x: PL.ken[0], z: PL.ken[1], r: 8.5, edge: 5, h: 0.75 });
    PL.kenA = [PL.ken[0] - 0.5, PL.ken[1] - 15]; zone({ id: 'kenA', x: PL.kenA[0], z: PL.kenA[1], r: 5.4, edge: 2.5, h: 0.9 }); /* the sealed ring: between the two coast roads, north of the beach town and clear of Hengchun */
    zone({ id: 'hua', x: PL.hua[0] - 3, z: PL.hua[1], r: 7, edge: 5, h: 0.95 });
    zone({ id: 'tai', x: PL.tai[0] - 2, z: PL.tai[1], r: 8, edge: 5, h: 0.95 });
    zone({ id: 'chishang', x: PL.chishang[0], z: PL.chishang[1], r: 6, edge: 6, h: 2.3 });
    zone({ id: 'lotus', x: PL.lotus[0], z: PL.lotus[1], r: 3.2, edge: 2, h: 0.9, carve: 1.2 });
    /* the lake lies in its own basin: its water set so that the hills that rise from it meet the land round about (the median of the ground 8–11 units out, less the height of those hills) */
    lakePrep(); var rim = [], ai; for (ai = 0; ai < LK.pts.length; ai += 3) { var P0 = LK.pts[ai], P1 = LK.pts[(ai + 1) % LK.pts.length], tx = P1[0] - P0[0], tz = P1[1] - P0[1], tl = Math.hypot(tx, tz) || 1; [8, 9.5, 11].forEach(function (o) { [1, -1].forEach(function (sg) { var qx = P0[0] - tz / tl * o * sg, qz = P0[1] + tx / tl * o * sg; if (lakeSD(qx, qz) < -o + 1.5) rim.push(natural(qx, qz)); }); }); }
    rim.sort(function (a, b) { return a - b; }); var smlH = Math.round(clamp((rim[Math.floor(rim.length / 2)] || 4) - 3.3, 1.6, 9) * 10) / 10; LK.h = smlH;
    /* the flats of the lake: Shuishe, Ita Thao and the visitor centre stand on the shore just above the water; the culture park on its ridge; the ropeway's lower station */
    [['smlShuishe', -0.12, -1.22, 1.9, 1.6, 0.42], ['smlIta', 2.08, 1.16, 2.1, 1.6, 0.42], ['smlXiang', -1.25, 0.64, 3.0, 1.6, 0.36], ['smlXuan', 0.2, 0.68, 0.9, 1.0, 0.5], ['smlRopeA', 2.42, 0.56, 0.9, 1.2, 0.6]].forEach(function (q) { var c = lakeLocal(q[1], q[2]); zone({ id: q[0], x: c[0], z: c[1], r: q[3], edge: q[4], h: smlH + q[5], dry: true }); });
    (function () { var c = lakeLocal(3.92, -0.78); PL.smlPark = c; zone({ id: 'smlPark', x: c[0], z: c[1], r: 3.0, edge: 2.2, h: Math.round(natural2(c[0], c[1]) * 10) / 10 }); })();
    var aliH = Math.max(9.2, Math.round(natural(PL.ali[0], PL.ali[1]) * 0.8 * 10) / 10); zone({ id: 'ali', x: PL.ali[0], z: PL.ali[1], r: 7.5, edge: 6, h: aliH });
    /* the sealed rings of Sun Moon Lake and Alishan stand on level pads cut into the slope */
    PL.smlA = lakeLocal(-2.8, -0.95); zone({ id: 'smlA', x: PL.smlA[0], z: PL.smlA[1], r: 5.4, edge: 3.5, h: Math.round(Math.max(smlH + 0.6, natural2(PL.smlA[0], PL.smlA[1]) - 0.4) * 10) / 10 }); /* below the Shuishe dam, west of the lake road */
    PL.aliA = [PL.ali[0] - 1.0, PL.ali[1] + 9.0]; if (sdf(PL.aliA[0], PL.aliA[1]) < 2) PL.aliA = [PL.ali[0], PL.ali[1] - 9]; zone({ id: 'aliA', x: PL.aliA[0], z: PL.aliA[1], r: 6.6, edge: 4, h: Math.round(Math.max(aliH - 0.4, Math.min(natural(PL.aliA[0], PL.aliA[1]), aliH + 1.5)) * 10) / 10 });
    zone({ id: 'taroko', x: PL.taroko[0], z: PL.taroko[1], r: 3.5, edge: 4, h: 1.2 });
    /* Wuling, the highest point of any road in Taiwan (3275 m, Provincial Highway 14A): the pass is drawn as the top of its road */
    PL.wuling = ll(121.2756, 24.1371); PL.tataka = ll(120.8904, 23.4878); zone({ id: 'wuling', x: PL.wuling[0], z: PL.wuling[1], r: 1.6, edge: 3.4, h: Math.round((natural2(PL.wuling[0], PL.wuling[1]) + 1.2) * 10) / 10 });
    buildHeights();
    /* Yushan's main peak (3952 m): the highest point of the massif as it is drawn */
    (function () { var c = PL.yushan, b = c, bh = -1, x, z; for (x = -4; x <= 4; x += 0.25) for (z = -4; z <= 4; z += 0.25) { var h = height(c[0] + x, c[1] + z); if (h > bh) { bh = h; b = [c[0] + x, c[1] + z]; } } PL.yushanTop = b; API.yushanH = bh; })(); API.lake = { x: PL.sml[0], z: PL.sml[1], r: LK.r, h: smlH, poly: LK.pts, isle: LK.isle, sd: lakeSD, local: lakeLocal }; API.aliH = aliH; return API; }
  var API = { grade: grade, pinEnds: pinEnds, lakeRoad: function (D) { return lakeRoad(D); }, lakeSD: function (x, z) { return lakeSD(x, z); }, lakeLocal: function (lx, lz) { return lakeLocal(lx, lz); }, STATIONS: STATIONS, ll: ll, X0: X0, Z0: Z0, GW: GW, GH: GH, POLYS: POLYS, PL: PL, ZONES: ZONES, build: build, sdf: sdf, height: height, normal: normal, ridges: ridges, fbm: fbm, vnoise: vnoise, hash: hash, sstep: sstep, line: line, mount: mount, bil: bil, SDFA: function () { return SDF; }, nearOn: nearOn, lines: function () { return lines; }, land: function (x, z) { return sdf(x, z) > 0; }, mask: function () { return maskCanvas; }, PH: PH };
  return API;
})();


