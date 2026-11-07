/* ===== [tw_cine_a.js] ===== */
/* ===== CINE — the commute between the four stations as a film over the real island (v51) =====
   The island map is no longer walked: every ride between Taipei, Taichung, Tainan and Zuoying is a one-take aerial film over Taiwan as it is.
   The ground is rebuilt for the film at 1 unit = 1 km, heights 1.45 times (a gentle relief): the Natural Earth 1:10m coastline, the ranges as
   they stand (Xueshan 3,886 m, Nanhudashan 3,742 m, Xiuguluan 3,825 m, Yushan 3,952 m, Guanshan 3,668 m, Beidawushan 3,092 m, the Coastal
   Range, the Alishan Range, the western foothills, the Linkou, Taoyuan, Dadu and Bagua tablelands), the basins of Taipei, Taichung, Puli and
   Yilan, the Huadong valley, the rivers with their wide gravel beds on the plains and their gorges in the mountains, the lakes, the cities as
   they spread, the fish ponds of the south-west coast, the rice of late October. The heights, the masks and the light are baked on the GPU
   (half-float targets): a ridged multifractal over the ranges, soft shadows marched towards the real sun of the hour, horizon-based occlusion,
   a Nishita single-scattering sky, aerial perspective with a haze that thins with height, a sea with its glints, a sea of clouds that clings to
   the ranges, the high-speed line on its viaduct with the train upon it, the city lights at night. The camera is one continuous move:
   alongside the train, a crane up over the ranges, the whole island from high above the strait, and down again behind the train as it slows
   into the next city. Original work; the real names appear only as place labels. */
var CINE = (function () {
  var V3 = THREE.Vector3;
  var LON0 = 120.95, LAT0 = 23.6, KX = 102.009, KZ = 110.9, EXV = 1.45;
  function ll(lon, lat) { return [(lon - LON0) * KX, -(lat - LAT0) * KZ]; }
  /* the baked area (km): the main island, Penghu, Green Island, Orchid Island, Liuqiu */
  var BX0 = -160, BX1 = 114, BZ0 = -196, BZ1 = 196, BW = BX1 - BX0, BH = BZ1 - BZ0;
  function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function mix(a, b, t) { return a + (b - a) * t; }

  /* ---------- the ranges: crests (lon, lat, crest height in km), a broad width and a sharp width (km) ---------- */
  var RANGES = [
    /* Central Range */ { p: [[121.72, 24.86, 0.9], [121.57, 24.63, 2.0], [121.44, 24.36, 3.74], [121.33, 24.10, 3.6], [121.24, 23.95, 3.15], [121.12, 23.72, 3.0], [121.06, 23.50, 3.83], [120.98, 23.31, 3.35], [120.91, 23.21, 3.67], [120.86, 22.95, 3.05], [120.79, 22.76, 2.6], [120.76, 22.62, 3.09], [120.78, 22.42, 1.6], [120.80, 22.22, 0.9], [120.83, 22.06, 0.45]], wb: 21, ws: 5.5 },
    /* Hehuan */ { p: [[121.27, 24.14, 3.42], [121.33, 24.10, 3.5]], wb: 6, ws: 2.5 },
    /* Xueshan Range */ { p: [[121.86, 24.99, 0.55], [121.66, 24.83, 1.2], [121.48, 24.62, 1.9], [121.30, 24.47, 3.49], [121.233, 24.383, 3.886], [121.13, 24.25, 3.15], [121.02, 24.12, 2.5], [120.95, 23.99, 1.9], [120.89, 23.86, 1.5]], wb: 13, ws: 4.5 },
    /* Yushan Range */ { p: [[120.93, 23.76, 2.5], [120.94, 23.60, 3.3], [120.957, 23.47, 3.95], [120.93, 23.33, 3.2], [120.88, 23.15, 2.5], [120.83, 23.00, 1.7]], wb: 8, ws: 3 },
    /* Alishan Range */ { p: [[120.78, 23.96, 1.3], [120.79, 23.71, 2.1], [120.80, 23.51, 2.6], [120.76, 23.30, 2.2], [120.70, 23.10, 1.45], [120.63, 22.96, 0.8]], wb: 9, ws: 3.5 },
    /* the foothills of Hsinchu and Miaoli */ { p: [[121.12, 24.76, 1.1], [120.99, 24.56, 2.2], [120.91, 24.36, 1.8], [120.86, 24.20, 1.4]], wb: 10, ws: 4 },
    /* Coastal Range */ { p: [[121.59, 23.99, 0.55], [121.51, 23.76, 1.2], [121.42, 23.50, 1.45], [121.34, 23.15, 1.68], [121.24, 22.95, 1.2], [121.17, 22.83, 0.55]], wb: 5, ws: 2 },
    /* Yangmingshan */ { p: [[121.47, 25.17, 0.75], [121.55, 25.17, 1.12], [121.62, 25.18, 0.85]], wb: 3.6, ws: 1.6 },
    /* Linkou tableland */ { p: [[121.32, 25.08, 0.24], [121.42, 25.05, 0.22]], wb: 6, ws: 4 },
    /* Taoyuan tableland */ { p: [[121.13, 24.96, 0.11], [121.26, 24.88, 0.18]], wb: 10, ws: 6 },
    /* the hills of the north-west coast */ { p: [[121.06, 24.76, 0.33], [120.96, 24.60, 0.5], [120.86, 24.46, 0.62], [120.80, 24.30, 0.5]], wb: 8, ws: 3.5 },
    /* Dadu tableland */ { p: [[120.57, 24.26, 0.27], [120.555, 24.12, 0.24]], wb: 2.6, ws: 1.5 },
    /* Bagua tableland */ { p: [[120.61, 24.08, 0.34], [120.585, 23.93, 0.42], [120.56, 23.82, 0.3]], wb: 2.6, ws: 1.5 },
    /* the foothills of Chiayi and Tainan */ { p: [[120.56, 23.56, 0.6], [120.51, 23.30, 0.6], [120.46, 23.10, 0.5], [120.43, 22.95, 0.38]], wb: 7, ws: 3 },
    /* the hills of inland Kaohsiung */ { p: [[120.42, 22.92, 0.38], [120.46, 22.80, 0.33]], wb: 4, ws: 2 },
    /* Shoushan */ { p: [[120.262, 22.672, 0.36], [120.268, 22.645, 0.33]], wb: 1.3, ws: 0.8 },
    /* Hengchun peninsula, Dajianshan */ { p: [[120.86, 22.25, 0.6], [120.84, 22.10, 0.5], [120.825, 21.965, 0.32]], wb: 4, ws: 1.8 }
  ];
  /* the flat floors: basins and plains held to a level (lon, lat, rx km, rz km, level km, edge as a fraction of the radius, rotation) */
  var BASINS = [[121.52, 25.05, 8.5, 7, 0.008, 0.7, 0.3], [121.77, 24.70, 7, 12, 0.006, 0.6, 0.35], [120.68, 24.15, 9, 17, 0.07, 0.6, 0.2], [120.965, 23.97, 4, 3, 0.45, 0.8, 0], [121.33, 23.40, 4, 34, 0.14, 0.45, -0.42], [120.48, 22.62, 9, 18, 0.03, 0.6, 0.15], [120.912, 23.858, 2.0, 2.6, 0.745, 0.5, 0.4] /* (v61) Sun Moon Lake, 748 m */];
  /* the rivers (lon, lat polylines), their gravel bed on the plains (km) and the width of their valley in the mountains (km) */
  var RIVERS = [
    [[[121.41, 25.17], [121.47, 25.10], [121.485, 25.03], [121.44, 24.97], [121.36, 24.85], [121.30, 24.75], [121.33, 24.62], [121.40, 24.55]], 0.55, 2.6],
    [[[121.485, 25.07], [121.58, 25.07], [121.66, 25.075], [121.72, 25.10]], 0.25, 2.0], [[[121.485, 25.03], [121.54, 24.97], [121.58, 24.90], [121.65, 24.85]], 0.3, 2.2],
    [[[120.93, 24.85], [121.02, 24.82], [121.10, 24.75], [121.18, 24.65]], 0.9, 2.4], [[[120.74, 24.63], [120.85, 24.50], [120.95, 24.40]], 0.6, 2.2],
    [[[120.62, 24.40], [120.75, 24.37], [120.90, 24.38], [121.05, 24.40]], 1.1, 2.6], [[[120.56, 24.30], [120.70, 24.27], [120.85, 24.25], [121.00, 24.25], [121.15, 24.24], [121.25, 24.30]], 1.4, 3.0],
    [[[120.48, 24.12], [120.58, 24.085], [120.68, 24.05], [120.80, 24.02], [120.90, 23.98], [121.00, 23.95]], 0.9, 2.6],
    [[[120.22, 23.84], [120.40, 23.82], [120.55, 23.81], [120.68, 23.80], [120.80, 23.82], [120.90, 23.86], [121.05, 23.91], [121.20, 24.00]], 2.0, 3.2],
    [[[120.15, 23.57], [120.35, 23.58], [120.50, 23.55], [120.62, 23.50]], 0.6, 2.2], [[[120.07, 23.05], [120.25, 23.12], [120.40, 23.15], [120.52, 23.20], [120.60, 23.28], [120.72, 23.36]], 0.7, 2.4],
    [[[120.43, 22.49], [120.48, 22.60], [120.50, 22.72], [120.53, 22.85], [120.60, 22.95], [120.70, 23.10], [120.80, 23.25]], 1.8, 3.0], [[[120.53, 22.86], [120.65, 22.98], [120.75, 23.10]], 0.8, 2.4],
    [[[121.84, 24.71], [121.70, 24.68], [121.58, 24.60], [121.45, 24.50]], 1.2, 2.8], [[[121.62, 24.15], [121.50, 24.18], [121.40, 24.20]], 0.6, 2.2],
    [[[121.62, 23.92], [121.48, 23.72], [121.38, 23.55]], 1.2, 2.8], [[[121.50, 23.45], [121.38, 23.40], [121.30, 23.38], [121.20, 23.30]], 0.8, 2.4], [[[121.17, 22.77], [121.10, 22.85], [121.00, 22.95]], 1.0, 2.6]];
  /* the cities as they spread (lon, lat, rx, rz km, density) */
  var URBAN = [[121.525, 25.045, 8.5, 6.5, 1.0], [121.455, 25.02, 6, 5.5, 0.9], [121.30, 24.99, 6, 5, 0.8], [121.22, 24.955, 5, 4, 0.8], [120.97, 24.80, 6, 5, 0.8], [121.01, 24.835, 3, 3, 0.65], [121.74, 25.13, 3, 2, 0.7],
    [120.665, 24.15, 9, 9, 0.9], [120.54, 24.08, 3.5, 3, 0.7], [120.45, 23.48, 4, 4, 0.7], [120.205, 23.00, 7, 7, 0.85], [120.30, 22.64, 7, 10, 0.95], [120.36, 22.62, 3, 3, 0.8], [120.49, 22.67, 3.5, 3.5, 0.6],
    [121.75, 24.73, 3, 6, 0.5], [121.60, 23.98, 3, 3, 0.55], [121.14, 22.76, 3, 3, 0.5], [120.54, 23.71, 2.5, 2.5, 0.45], [120.57, 23.96, 2.5, 2.5, 0.5], [120.82, 24.56, 2.5, 2.5, 0.45], [120.91, 24.68, 2.5, 2.5, 0.5],
    [120.97, 23.97, 2, 2, 0.4], [121.38, 25.07, 2, 2, 0.6], [121.40, 24.96, 3, 3, 0.6], [121.54, 24.96, 2.5, 2.5, 0.6], [120.62, 24.11, 2.2, 2.2, 0.55], [120.29, 22.925, 1.6, 1.6, 0.45], [120.31, 22.69, 2.2, 2.2, 0.9], [119.57, 23.57, 1.6, 1.6, 0.5], [120.24, 23.10, 2.5, 2.5, 0.45], [120.36, 22.80, 3, 3, 0.5]];
  /* the fish-pond belt of the south-west coast and Yilan's (polylines, half width km) */
  var PONDS = [[[[120.33, 24.02], [120.24, 23.78], [120.15, 23.50], [120.12, 23.25], [120.10, 23.10], [120.14, 22.95]], 6], [[[120.28, 22.60], [120.38, 22.50], [120.47, 22.42]], 4], [[[121.80, 24.80], [121.83, 24.70]], 2.5]];
  /* lakes and reservoirs (lon, lat, rx, rz km, rotation) */
  var LAKES = [[120.912, 23.858, 1.6, 2.3, 0.4], [120.555, 23.22, 1.0, 4.2, 0.5], [121.245, 24.81, 0.8, 2.6, -0.4], [121.60, 24.92, 0.7, 3.6, 0.6], [120.77, 24.335, 0.5, 1.2, 0], [120.385, 23.20, 1.1, 0.9, 0], [120.27, 22.68, 0.45, 0.8, 0]];

  /* the high-speed rail: the stations as they are, the curves between them (Banqiao to Tucheng below ground) */
  var STN = { tpe: [121.5170, 25.0478], bqa: [121.4637, 25.0137], tao: [121.2148, 25.0128], hsz: [121.0402, 24.8079], mli: [120.8248, 24.6058], txg: [120.6159, 24.1121], chw: [120.5748, 23.8741], yun: [120.4163, 23.7362], cyi: [120.3231, 23.4593], tnn: [120.2858, 22.9247], khh: [120.3074, 22.6873] };
  var LINE = [STN.tpe, [121.500, 25.030], STN.bqa, [121.425, 24.993], [121.33, 25.005], STN.tao, [121.140, 24.930], STN.hsz, [120.930, 24.700], STN.mli, [120.735, 24.380], STN.txg, [120.592, 23.990], STN.chw, [120.500, 23.800], STN.yun, [120.370, 23.600], STN.cyi, [120.300, 23.200], [120.282, 23.050], STN.tnn, [120.300, 22.800], STN.khh];
  var PORTAL_LL = [121.425, 24.993];
  /* the landmarks of the four cities */
  var MARKS = { t101: [121.5645, 25.0340], t85: [120.3001, 22.6116] };

  /* ---------- noise shared by the CPU and the GPU (the same arithmetic, a hash without sines) ---------- */
  function fr(x) { return x - Math.floor(x); }
  function h12(x, y) { var a = fr(x * 0.1031), b = fr(y * 0.1031), c = a; var d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33); a += d; b += d; c += d; return fr((a + b) * c); }
  function vn(x, y) { var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); var a = h12(ix, iy), b = h12(ix + 1, iy), c = h12(ix, iy + 1), d = h12(ix + 1, iy + 1); return mix(mix(a, b, ux), mix(c, d, ux), uy); }
  function fbm(x, y) { var v = 0, a = 0.5, k; for (k = 0; k < 5; k++) { v += a * vn(x, y); var nx = (0.8 * x - 0.6 * y) * 2.03 + 1.7, ny = (0.6 * x + 0.8 * y) * 2.03 - 9.2; x = nx; y = ny; a *= 0.5; } return v / 0.96875; }
  function ridged(x, y) { var v = 0, a = 0.5, w = 1, k, s = 0; for (k = 0; k < 5; k++) { var n = 1 - Math.abs(vn(x, y) * 2 - 1); n *= n; n *= w; w = clamp(n * 1.7, 0, 1); v += n * a; s += a; var nx = (0.8 * x - 0.6 * y) * 2.05 + 3.1, ny = (0.6 * x + 0.8 * y) * 2.05 - 4.3; x = nx; y = ny; a *= 0.5; } return v / s; }
  var GLSL_NOISE = [
    'float h12(vec2 p){ vec3 p3 = fract(vec3(p.x, p.y, p.x) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'float vn(vec2 p){ vec2 i = floor(p), f = p - i, u = f * f * (3.0 - 2.0 * f); return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), u.x), mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), u.x), u.y); }',
    'float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int k = 0; k < 5; k++) { v += a * vn(p); p = vec2(0.8 * p.x - 0.6 * p.y, 0.6 * p.x + 0.8 * p.y) * 2.03 + vec2(1.7, -9.2); a *= 0.5; } return v / 0.96875; }',
    'float fbm3(vec2 p){ float v = 0.0, a = 0.5; for (int k = 0; k < 3; k++) { v += a * vn(p); p = vec2(0.8 * p.x - 0.6 * p.y, 0.6 * p.x + 0.8 * p.y) * 2.03 + vec2(1.7, -9.2); a *= 0.5; } return v / 0.875; }',
    'float ridged(vec2 p){ float v = 0.0, a = 0.5, w = 1.0, s = 0.0; for (int k = 0; k < 5; k++) { float n = 1.0 - abs(vn(p) * 2.0 - 1.0); n *= n; n *= w; w = clamp(n * 1.7, 0.0, 1.0); v += n * a; s += a; p = vec2(0.8 * p.x - 0.6 * p.y, 0.6 * p.x + 0.8 * p.y) * 2.05 + vec2(3.1, -4.3); a *= 0.5; } return v / s; }',
    'float segD(vec2 p, vec2 a, vec2 b, out float t){ vec2 d = b - a; float L2 = max(dot(d, d), 1e-6); t = clamp(dot(p - a, d) / L2, 0.0, 1.0); return length(a + d * t - p); }',
    'float smax2(float a, float b, float k){ float h = max(k - abs(a - b), 0.0) / k; return max(a, b) + h * h * k * 0.25; }'].join('\n');
  function segD(px, pz, ax, az, bx, bz) { var dx = bx - ax, dz = bz - az, L2 = Math.max(dx * dx + dz * dz, 1e-6), t = clamp(((px - ax) * dx + (pz - az) * dz) / L2, 0, 1), ex = ax + dx * t - px, ez = az + dz * t - pz; return [Math.sqrt(ex * ex + ez * ez), t]; }
  function smax2(a, b, k) { var h = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + h * h * k * 0.25; }

  /* ---------- the data packed as segments (km) for the CPU and as uniform arrays for the GPU ---------- */
  var RS = [], RH = [], BS = [], BH2 = [], VS = [], VH = [], US = [], PS = [], PH = [], LS = [];
  (function pack() {
    RANGES.forEach(function (r) { for (var i = 0; i + 1 < r.p.length; i++) { var a = ll(r.p[i][0], r.p[i][1]), b = ll(r.p[i + 1][0], r.p[i + 1][1]); RS.push([a[0], a[1], b[0], b[1]]); RH.push([r.p[i][2], r.p[i + 1][2], r.wb, r.ws]); } });
    BASINS.forEach(function (b) { var c = ll(b[0], b[1]); BS.push([c[0], c[1], b[2], b[3]]); BH2.push([b[4], b[5], b[6], 0]); });
    RIVERS.forEach(function (r) { for (var i = 0; i + 1 < r[0].length; i++) { var a = ll(r[0][i][0], r[0][i][1]), b = ll(r[0][i + 1][0], r[0][i + 1][1]); VS.push([a[0], a[1], b[0], b[1]]); VH.push([r[1], r[2], 0, 0]); } });
    URBAN.forEach(function (u) { var c = ll(u[0], u[1]); US.push([c[0], c[1], u[2], u[3], u[4]]); });
    PONDS.forEach(function (q) { for (var i = 0; i + 1 < q[0].length; i++) { var a = ll(q[0][i][0], q[0][i][1]), b = ll(q[0][i + 1][0], q[0][i + 1][1]); PS.push([a[0], a[1], b[0], b[1]]); PH.push(q[1]); } });
    LAKES.forEach(function (l) { var c = ll(l[0], l[1]); LS.push([c[0], c[1], l[2], l[3], l[4]]); }); })();
  var NR = RS.length, NB = BS.length, NV = VS.length, NU = US.length, NP = PS.length, NL = LS.length;

  /* ---------- the coast as a signed distance field (km, positive on land), from the outline rasterised and two exact Euclidean transforms ---------- */
  var SDF = null, SG = { res: 3, w: 0, h: 0 };
  function edt1(f, n, d, v, z) { var k = 0, q, s; v[0] = 0; z[0] = -1e20; z[1] = 1e20; for (q = 1; q < n; q++) { s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); } k++; v[k] = q; z[k] = s; z[k + 1] = 1e20; } k = 0; for (q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; } }
  function edt(grid, W, H) { var n = Math.max(W, H), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1), x, y, out = new Float64Array(W * H);
    for (x = 0; x < W; x++) { for (y = 0; y < H; y++) f[y] = grid[y * W + x]; edt1(f, H, d, v, z); for (y = 0; y < H; y++) out[y * W + x] = d[y]; }
    for (y = 0; y < H; y++) { for (x = 0; x < W; x++) f[x] = out[y * W + x]; edt1(f, W, d, v, z); for (x = 0; x < W; x++) out[y * W + x] = d[x]; } return out; }
  function buildSDF(res) { if (SDF && SG.res === res) return SDF; var W = Math.round(BW * res), H = Math.round(BH * res), cv = document.createElement('canvas'); cv.width = W; cv.height = H; var g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff';
    var C = TW_COAST; ['main', 'penghu', 'penghuW', 'penghuN', 'green', 'liuqiu', 'orchid', 'sandbar'].forEach(function (k) { var a = C[k]; if (!a) return; g.beginPath(); for (var i = 0; i < a.length; i += 2) { var x = (a[i] - BX0) * res, y = (a[i + 1] - BZ0) * res; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.fill(); });
    var px = g.getImageData(0, 0, W, H).data, n = W * H, A = new Float64Array(n), B = new Float64Array(n), inL = new Uint8Array(n), i; for (i = 0; i < n; i++) { inL[i] = px[i * 4] > 127 ? 1 : 0; A[i] = inL[i] ? 1e20 : 0; B[i] = inL[i] ? 0 : 1e20; }
    var dIn = edt(A, W, H), dOut = edt(B, W, H); SDF = new Float32Array(n); for (i = 0; i < n; i++) SDF[i] = ((inL[i] ? Math.sqrt(dIn[i]) - 0.5 : -(Math.sqrt(dOut[i]) - 0.5))) / res;
    /* (v62) on the coast itself the canvas's own anti-aliased cover gives the edge to a fraction of a cell, so the shore is a smooth line, not steps of 330 m */ for (i = 0; i < n; i++) { var cv2 = px[i * 4] / 255; if (cv2 > 0.01 && cv2 < 0.99) SDF[i] = (cv2 - 0.5) / res; } SG.res = res; SG.w = W; SG.h = H; return SDF; }
  function sdfAt(x, z) { if (!SDF) return -10; var gx = (x - BX0) * SG.res - 0.5, gz = (z - BZ0) * SG.res - 0.5, W = SG.w, H = SG.h; if (gx < 0) gx = 0; if (gz < 0) gz = 0; if (gx > W - 1.001) gx = W - 1.001; if (gz > H - 1.001) gz = H - 1.001; var ix = gx | 0, iz = gz | 0, fx = gx - ix, fz = gz - iz, k = iz * W + ix; return (SDF[k] * (1 - fx) + SDF[k + 1] * fx) * (1 - fz) + (SDF[k + W] * (1 - fx) + SDF[k + W + 1] * fx) * fz; }

  /* ---------- the height (km above the sea, real) — the CPU mirror of the shader below, used for the line, the piers and the camera ---------- */
  function heightJS(x, z, out) {
    var sd = sdfAt(x, z) + 0.15 * fbm(x * 1.7, z * 1.7) - 0.07;
    if (sd < -0.4) { if (out) { out.m = 0; out.r = 0; out.sd = sd; } return Math.max(-2.0, sd * 0.015 - 0.01); }
    var m = 0, i, s;
    for (i = 0; i < NR; i++) { var q = RS[i], hh = RH[i]; s = segD(x, z, q[0], q[1], q[2], q[3]); var hc = mix(hh[0], hh[1], s[1]), d = s[0], v = hc * (0.6 * Math.exp(-d * d / (hh[2] * hh[2])) + 0.4 * Math.exp(-d * d / (hh[3] * hh[3]))); m = smax2(m, v, 0.12); }
    m *= sstep(-0.3, 2.2, sd);
    var wx = fbm(x * 0.11 + 3.1, z * 0.11 + 1.3), wz = fbm(x * 0.11 - 7.7, z * 0.11 + 2.9), r = ridged(x * 0.16 + wx * 2.2, z * 0.16 + wz * 2.2), r2 = ridged(x * 0.55 + wz * 1.4 + 11.0, z * 0.55 + wx * 1.4 - 5.0), hm = m * (0.58 + 0.55 * r + 0.14 * (r2 - 0.4));
    var plain = 0.004 + 0.03 * sstep(0, 25, sd) + 0.016 * fbm(x * 0.12, z * 0.12), h = plain + hm, riv = 0;
    var rwx = x + 1.6 * (fbm(x * 0.09 + 5.3, z * 0.09 - 2.1) - 0.5), rwz = z + 1.6 * (fbm(x * 0.09 - 8.4, z * 0.09 + 6.6) - 0.5);
    for (i = 0; i < NV; i++) { var v2 = VS[i], vh = VH[i]; s = segD(rwx, rwz, v2[0], v2[1], v2[2], v2[3]); var dd = s[0], bed = 1 - sstep(vh[0] * 0.42, vh[0] * 0.58 + 0.05, dd), val = Math.exp(-dd * dd / (vh[1] * vh[1])), carve = val * sstep(0.08, 0.5, hm); h = mix(h, plain * 0.85 + hm * 0.32, carve * 0.85); riv = Math.max(riv, bed * (1 - sstep(0.06, 0.22, hm))); }
    for (i = 0; i < NB; i++) { var b = BS[i], bh = BH2[i], dx = x - b[0], dz = z - b[1], c = Math.cos(bh[2]), sn = Math.sin(bh[2]), ex = (dx * c - dz * sn) / b[2], ez = (dx * sn + dz * c) / b[3], e = Math.sqrt(ex * ex + ez * ez), k = 1 - sstep(1, 1 + bh[1], e); h = mix(h, Math.min(h, bh[0] + 0.02 * fbm(x * 0.3, z * 0.3)), k); }
    h = mix(0.0012, h, sstep(0, 0.6, sd)); if (out) { out.m = clamp(hm / 2.2, 0, 1); out.r = riv; out.sd = sd; } return h; }
  /* the segments, basins, cities, ponds and lakes travel to the GPU as one small float texture (a uniform array this long would pass the
     fragment-uniform limit of many phones): one column per item, one row per kind */
  var DW = 128, DH = 12, DATA = null;
  function dataTex() { if (DATA) return DATA; var a = new Float32Array(DW * DH * 4); function put(row, list, f) { list.forEach(function (q, i) { var v = f ? f(q) : q, k = (row * DW + i) * 4; a[k] = v[0] || 0; a[k + 1] = v[1] || 0; a[k + 2] = v[2] || 0; a[k + 3] = v[3] || 0; }); }
    put(0, RS); put(1, RH); put(2, VS); put(3, VH); put(4, BS); put(5, BH2); put(6, US); put(7, US, function (q) { return [q[4], 0, 0, 0]; }); put(8, PS); put(9, PH, function (q) { return [q, 0, 0, 0]; }); put(10, LS); put(11, LS, function (q) { return [q[4], 0, 0, 0]; });
    DATA = new THREE.DataTexture(a, DW, DH, THREE.RGBAFormat, THREE.FloatType); DATA.minFilter = DATA.magFilter = THREE.NearestFilter; DATA.generateMipmaps = false; DATA.needsUpdate = true; return DATA; }
  var GLSL_DATA = 'uniform sampler2D tData; vec4 dat(int i, float row){ return texture2D(tData, vec2((float(i) + 0.5) / ' + DW + '.0, (row + 0.5) / ' + DH + '.0)); }';
  var GLSL_HEIGHT = [
    'uniform sampler2D tSDF; uniform vec4 uBox;',
    'float sdfAt(vec2 p){ return texture2D(tSDF, (p - uBox.xy) / uBox.zw).r; }',
    'float height(vec2 p, out float mtn, out float riv, out float sdo){',
    '  float sd = sdfAt(p) + 0.15 * fbm(p * 1.7) - 0.07; sdo = sd; mtn = 0.0; riv = 0.0;',
    '  if (sd < -0.4) return max(-2.0, sd * 0.015 - 0.01);',
    '  float m = 0.0, t;',
    '  for (int i = 0; i < ' + NR + '; i++) { vec4 q = dat(i, 0.0), hh = dat(i, 1.0); float d = segD(p, q.xy, q.zw, t); float hc = mix(hh.x, hh.y, t); float v = hc * (0.6 * exp(-d * d / (hh.z * hh.z)) + 0.4 * exp(-d * d / (hh.w * hh.w))); m = smax2(m, v, 0.12); }',
    '  m *= smoothstep(-0.3, 2.2, sd);',
    '  vec2 w = vec2(fbm(p * 0.11 + vec2(3.1, 1.3)), fbm(p * 0.11 + vec2(-7.7, 2.9))); float r = ridged(p * 0.16 + w * 2.2), r2 = ridged(p * 0.55 + vec2(w.y, w.x) * 1.4 + vec2(11.0, -5.0)), hm = m * (0.58 + 0.55 * r + 0.14 * (r2 - 0.4));',
    '  float plain = 0.004 + 0.03 * smoothstep(0.0, 25.0, sd) + 0.016 * fbm(p * 0.12), h = plain + hm;',
    '  vec2 rw = p + 1.6 * (vec2(fbm(p * 0.09 + vec2(5.3, -2.1)), fbm(p * 0.09 + vec2(-8.4, 6.6))) - 0.5);',
    '  for (int i = 0; i < ' + NV + '; i++) { vec4 q = dat(i, 2.0), vh = dat(i, 3.0); float d = segD(rw, q.xy, q.zw, t); float bed = 1.0 - smoothstep(vh.x * 0.42, vh.x * 0.58 + 0.05, d), val = exp(-d * d / (vh.y * vh.y)), carve = val * smoothstep(0.08, 0.5, hm); h = mix(h, plain * 0.85 + hm * 0.32, carve * 0.85); riv = max(riv, bed * (1.0 - smoothstep(0.06, 0.22, hm))); }',
    '  for (int i = 0; i < ' + NB + '; i++) { vec4 b = dat(i, 4.0), bh = dat(i, 5.0); vec2 d = p - b.xy; float c = cos(bh.z), s = sin(bh.z); vec2 e2 = vec2((d.x * c - d.y * s) / b.z, (d.x * s + d.y * c) / b.w); float k = 1.0 - smoothstep(1.0, 1.0 + bh.y, length(e2)); h = mix(h, min(h, bh.x + 0.02 * fbm(p * 0.3)), k); }',
    '  h = mix(0.0012, h, smoothstep(0.0, 0.6, sd)); mtn = clamp(hm / 2.2, 0.0, 1.0); return h; }'].join('\n');

  /* the masks: the city's density, the fish ponds, the lakes (CPU mirror for the buildings and the camera) */
  function urbanJS(x, z) { var u = 0, i; for (i = 0; i < NU; i++) { var q = US[i], ex = (x - q[0]) / q[2], ez = (z - q[1]) / q[3], e = Math.sqrt(ex * ex + ez * ez); u = Math.max(u, q[4] * (1 - sstep(0.55, 1.15, e + 0.35 * (fbm(x * 0.5, z * 0.5) - 0.5)))); } return u; }
  var GLSL_MASKS = [
    'float urban(vec2 p){ float u = 0.0, n = fbm(p * 0.5) - 0.5; for (int i = 0; i < ' + NU + '; i++) { vec4 q = dat(i, 6.0); vec2 e = (p - q.xy) / q.zw; u = max(u, dat(i, 7.0).x * (1.0 - smoothstep(0.55, 1.15, length(e) + 0.35 * n))); } return u; }',
    'float ponds(vec2 p){ float f = 0.0, t; for (int i = 0; i < ' + NP + '; i++) { vec4 q = dat(i, 8.0); float w = dat(i, 9.0).x; float d = segD(p, q.xy, q.zw, t); f = max(f, 1.0 - smoothstep(w * 0.6, w, d)); } return f; }',
    'float lakes(vec2 p){ float l = 0.0; for (int i = 0; i < ' + NL + '; i++) { vec4 q = dat(i, 10.0); float rr = dat(i, 11.0).x; vec2 d = p - q.xy; float c = cos(rr), s = sin(rr); vec2 e = vec2((d.x * c - d.y * s) / q.z, (d.x * s + d.y * c) / q.w); l = max(l, 1.0 - smoothstep(0.85, 1.0, length(e) + 0.12 * (vn(p * 3.0) - 0.5))); } return l; }'].join('\n');
