/* ===== [tw_atmo.js] ===== */
/* ===== ATMO — the physical sky of AUTO 台灣島 (v55) =====
   The sky is no longer a gradient by the hour: it is computed from the air itself, the way current engines do it (a transmittance table and a
   sky-view table, after Hillaire 2020 / the sky atmosphere of today's engines). Rayleigh scattering by the air (the blue, the reddened sun),
   Mie scattering by the haze (the white glow round the sun, thicker on a humid or foggy day), the ozone layer (the deep blue of twilight), the
   planet's own shadow (the blue band rising in the east after sunset, the pink belt above it), and an isotropic term for the light scattered
   more than once. The tables are computed on the CPU, a few rows a frame, whenever the sun or the moon has moved; the GPU only looks them up.
   Over that: a layer of cumulus lit through its own depth toward the sun (Beer's law, the powder effect at the edges, a two-lobed phase for the
   silver lining), high cirrus that stays pink after the low clouds have gone grey, the 22° halo in the cirrus, the primary and secondary
   rainbow with Alexander's dark band when the sun shines into the rain, lightning drawn as a branching bolt, the Milky Way where it really is.
   The same air colours the fog of every material (the haze glows toward the sun and thins with height), and the planar reflection used by the
   floors and the sea lives here too. */
var ATMO = (function () {
  var V3 = THREE.Vector3, PI = Math.PI;
  /* ---------- the shared fog uniforms: every built-in material gets the same objects (plain objects pass through three's uniform cloning by reference) ---------- */
  var FOGU = { kFogS: { value: { x: 0, y: 1, z: 0, w: 0 } }, kFogC: { value: { x: 0, y: 0, z: 0 } }, kFogH: { value: { x: 0, y: 60, z: 0, w: 0 } } };
  (function patchFog() { var C = THREE.ShaderChunk;
    C.fog_pars_vertex = '#ifdef USE_FOG\n\tvarying float vFogDepth;\n\tvarying vec3 vFogWD;\n#endif';
    C.fog_vertex = '#ifdef USE_FOG\n\tvFogDepth = - mvPosition.z;\n\tvFogWD = ( vec4( mvPosition.xyz, 0.0 ) * viewMatrix ).xyz;\n#endif';
    C.fog_pars_fragment = '#ifdef USE_FOG\n\tuniform vec3 fogColor;\n\tvarying float vFogDepth;\n\tvarying vec3 vFogWD;\n\tuniform vec4 kFogS;\n\tuniform vec3 kFogC;\n\tuniform vec4 kFogH;\n\t#ifdef FOG_EXP2\n\t\tuniform float fogDensity;\n\t#else\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n#endif';
    C.fog_fragment = '#ifdef USE_FOG\n\t#ifdef FOG_EXP2\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );\n\t#else\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, vFogDepth );\n\t#endif\n\tvec3 kFC = fogColor;\n'
      + '\tif ( kFogS.w > 0.0 ) { vec3 kD = normalize( vFogWD ); float kc = max( dot( kD, kFogS.xyz ), 0.0 ); float kc2 = kc * kc; float kc4 = kc2 * kc2; kFC += kFogC * ( kc4 * kc4 * 0.72 + kc2 * 0.28 ) * kFogS.w;\n'
      + '\t\tif ( kFogH.z > 0.0 ) { float kY = cameraPosition.y + vFogWD.y; fogFactor *= mix( 1.0, clamp( exp2( - ( kY - kFogH.x ) / kFogH.y ), 0.0, 1.0 ), kFogH.z ); } }\n'
      + '\tgl_FragColor.rgb = mix( gl_FragColor.rgb, kFC, fogFactor );\n#endif';
    Object.keys(THREE.ShaderLib).forEach(function (k) { var u = THREE.ShaderLib[k].uniforms; if (u && u.fogColor) { u.kFogS = FOGU.kFogS; u.kFogC = FOGU.kFogC; u.kFogH = FOGU.kFogH; } });
    var F = THREE.UniformsLib.fog; F.kFogS = FOGU.kFogS; F.kFogC = FOGU.kFogC; F.kFogH = FOGU.kFogH; })();

  /* ---------- the air ---------- */
  var RE = 6360, RA = 6460, HR = 8, HM = 1.2, BR = [5.802e-3, 13.558e-3, 33.1e-3], BO = [0.650e-3, 1.881e-3, 0.085e-3];
  var TW = 64, TH = 32, SW = 64, SH = 48;
  var A = { mie: 1, ms: 1, T: new Float32Array(TW * TH * 3), S: new Float32Array(SW * 2 * SH * 3), B: new Float32Array(SW * 2 * SH * 3), job: null, cur: { sun: -99, moon: -99, mie: -1 }, want: { sun: 0.5, moon: -0.5, mie: 1 }, ver: 0 };
  function ozo(h) { return Math.max(0, 1 - Math.abs(h - 25) / 15); }
  function muOf(u) { var x = u * 2 - 1; return x * Math.abs(x) * 0.5 + x * 0.5; }
  function uOf(mu) { var s = mu < 0 ? -1 : 1, x = -0.5 + Math.sqrt(0.25 + 2 * Math.abs(mu)); return (s * x + 1) / 2; }
  function rayTop(r, mu) { return -r * mu + Math.sqrt(Math.max(0, r * r * (mu * mu - 1) + RA * RA)); }
  function hitsGround(r, mu) { return mu < 0 && r * r * (mu * mu - 1) + RE * RE >= 0; }
  /* the transmittance from a height toward the top of the air, by the cosine of the zenith angle; the curve of the planet hides a low sun softly */
  function buildT() { var t = A.T, BM = 4.44e-3 * A.mie, i, j, k, s;
    for (j = 0; j < TH; j++) { var v = j / (TH - 1), h = v * v * (RA - RE), r = RE + h; for (i = 0; i < TW; i++) { var mu = muOf(i / (TW - 1)), o = (j * TW + i) * 3;
      var dip = -Math.sqrt(Math.max(0, 1 - (RE * RE) / (r * r))), gk = Math.max(0, Math.min(1, (mu - dip) / 0.012 + 0.5)); if (gk <= 0) { t[o] = t[o + 1] = t[o + 2] = 0; continue; }
      var L = rayTop(r, Math.max(mu, dip + 0.002)), n = 36, ds = L / n, oR = 0, oM = 0, oO = 0, m2 = Math.max(mu, dip + 0.002);
      for (s = 0; s < n; s++) { var tt = (s + 0.5) * ds, rr = Math.sqrt(r * r + tt * tt + 2 * r * m2 * tt), hh = Math.max(0, rr - RE); oR += Math.exp(-hh / HR) * ds; oM += Math.exp(-hh / HM) * ds; oO += ozo(hh) * ds; }
      for (k = 0; k < 3; k++) t[o + k] = Math.exp(-(BR[k] * oR + BM * oM + BO[k] * oO)) * gk; } }
    A.cur.mie = A.mie; }
  function trans(h, mu, out) { var x = uOf(Math.max(-1, Math.min(1, mu))) * (TW - 1), y = Math.sqrt(Math.max(0, Math.min(1, h / (RA - RE)))) * (TH - 1), x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(TW - 1, x0 + 1), y1 = Math.min(TH - 1, y0 + 1), fx = x - x0, fy = y - y0, t = A.T;
    for (var k = 0; k < 3; k++) out[k] = (t[(y0 * TW + x0) * 3 + k] * (1 - fx) + t[(y0 * TW + x1) * 3 + k] * fx) * (1 - fy) + (t[(y1 * TW + x0) * 3 + k] * (1 - fx) + t[(y1 * TW + x1) * 3 + k] * fx) * fy; return out; }
  function elOf(v) { var x = v * 2 - 1; return (x < 0 ? -1 : 1) * x * x * PI / 2; }
  var TS = [0, 0, 0];
  /* the light scattered toward the eye along one view ray (elevation el, azimuth phi from the body, the body at elevation be) */
  function skyRay(el, phi, be, out) { var r0 = RE + 0.2, ce = Math.cos(el), dx = ce * Math.cos(phi), dy = Math.sin(el), dz = ce * Math.sin(phi), sx = Math.cos(be), sy = Math.sin(be), mu = dx * sx + dy * sy;
    var g = 0.8, pR = 3 / (16 * PI) * (1 + mu * mu), pM = 3 / (8 * PI) * ((1 - g * g) * (1 + mu * mu)) / ((2 + g * g) * Math.pow(1 + g * g - 2 * g * mu, 1.5));
    var L = hitsGround(r0, dy) ? (-r0 * dy - Math.sqrt(Math.max(0, r0 * r0 * (dy * dy - 1) + RE * RE))) : rayTop(r0, dy); L = Math.min(L, 500);
    var n = 22, a0 = 0, a1 = 0, a2 = 0, t0 = 1, t1 = 1, t2 = 1, tp = 0, s, BMs = 3.996e-3 * A.mie, BMe = 4.44e-3 * A.mie;
    for (s = 0; s < n; s++) { var f = (s + 1) / n, tq = L * f * f, ds = tq - tp, tm = tp + ds * 0.5; tp = tq;
      var px = dx * tm, py = r0 + dy * tm, pz = dz * tm, rr = Math.sqrt(px * px + py * py + pz * pz), h = Math.max(0, rr - RE), dR = Math.exp(-h / HR), dM = Math.exp(-h / HM), dO = ozo(h), muS = (px * sx + py * sy) / rr; trans(h, muS, TS);
      var ms = A.ms * 0.055 * Math.max(0, Math.min(1, (muS + 0.3) / 0.4)), sM = BMs * dM;
      var sR = BR[0] * dR, ex = sR + BMe * dM + BO[0] * dO, st = Math.exp(-ex * ds), S = TS[0] * (sR * pR + sM * pM) + (sR + sM) * ms * (0.3 + 0.7 * Math.sqrt(TS[0])); a0 += t0 * S * (1 - st) / ex; t0 *= st;
      sR = BR[1] * dR; ex = sR + BMe * dM + BO[1] * dO; st = Math.exp(-ex * ds); S = TS[1] * (sR * pR + sM * pM) + (sR + sM) * ms * (0.3 + 0.7 * Math.sqrt(TS[1])); a1 += t1 * S * (1 - st) / ex; t1 *= st;
      sR = BR[2] * dR; ex = sR + BMe * dM + BO[2] * dO; st = Math.exp(-ex * ds); S = TS[2] * (sR * pR + sM * pM) + (sR + sM) * ms * (0.3 + 0.7 * Math.sqrt(TS[2])); a2 += t2 * S * (1 - st) / ex; t2 *= st; }
    out[0] = a0; out[1] = a1; out[2] = a2; return out; }
  /* one row of the sky-view table (both halves: the sun's sky and the moon's) */
  var RO = [0, 0, 0];
  function row(buf, j, sunEl, moonEl) { var el = elOf((j + 0.5) / SH), i, q; for (i = 0; i < SW; i++) { var phi = i / (SW - 1) * PI; q = (j * SW * 2 + i) * 3;
      if (sunEl > -0.42) { skyRay(el, phi, sunEl, RO); buf[q] = RO[0]; buf[q + 1] = RO[1]; buf[q + 2] = RO[2]; } else buf[q] = buf[q + 1] = buf[q + 2] = 0;
      q = (j * SW * 2 + SW + i) * 3; if (moonEl > -0.12) { skyRay(el, phi, moonEl, RO); buf[q] = RO[0]; buf[q + 1] = RO[1]; buf[q + 2] = RO[2]; } else buf[q] = buf[q + 1] = buf[q + 2] = 0; } }
  /* ---------- the textures ---------- */
  var H16 = THREE.DataUtils.toHalfFloat;
  function halfTex(w, h) { var t = new THREE.DataTexture(new Uint16Array(w * h * 4), w, h, THREE.RGBAFormat, THREE.HalfFloatType); t.minFilter = t.magFilter = THREE.LinearFilter; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = false; t.needsUpdate = true; return t; }
  var tTr = halfTex(TW, TH), tAtm = halfTex(SW * 2, SH);
  function upload(tex, src, n) { var d = tex.image.data, i; for (i = 0; i < n; i++) { d[i * 4] = H16(Math.min(60000, src[i * 3])); d[i * 4 + 1] = H16(Math.min(60000, src[i * 3 + 1])); d[i * 4 + 2] = H16(Math.min(60000, src[i * 3 + 2])); d[i * 4 + 3] = 15360; } tex.needsUpdate = true; }
  /* a tiling noise: R a gradient-noise fbm, G puffy cells (inverted Worley), B a finer fbm, A finer cells */
  var tNz = (function () { var N = 128, d = new Uint8Array(N * N * 4), seed = 1;
    function hs(x, y, s) { var h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); }
    function grad(ix, iy, per, s) { ix = ((ix % per) + per) % per; iy = ((iy % per) + per) % per; var a = hs(ix, iy, s) * PI * 2; return [Math.cos(a), Math.sin(a)]; }
    function perlin(x, y, per, s) { var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10), uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
      function dg(i, j) { var g = grad(ix + i, iy + j, per, s); return g[0] * (fx - i) + g[1] * (fy - j); }
      var a = dg(0, 0), b = dg(1, 0), c = dg(0, 1), e = dg(1, 1); return (a + (b - a) * ux) + ((c + (e - c) * ux) - (a + (b - a) * ux)) * uy; }
    function worley(x, y, per, s) { var ix = Math.floor(x), iy = Math.floor(y), best = 9, i, j; for (j = -1; j <= 1; j++) for (i = -1; i <= 1; i++) { var cx = ix + i, cy = iy + j, wx = ((cx % per) + per) % per, wy = ((cy % per) + per) % per, px = cx + hs(wx, wy, s + 3), py = cy + hs(wx, wy, s + 7), dd = (px - x) * (px - x) + (py - y) * (py - y); if (dd < best) best = dd; } return Math.sqrt(best); }
    var ch = [new Float32Array(N * N), new Float32Array(N * N), new Float32Array(N * N), new Float32Array(N * N)], i, j, k;
    for (j = 0; j < N; j++) for (i = 0; i < N; i++) { var u = i / N, v = j / N, q = j * N + i;
      ch[0][q] = perlin(u * 4, v * 4, 4, 1) * 0.5 + perlin(u * 8, v * 8, 8, 2) * 0.27 + perlin(u * 16, v * 16, 16, 3) * 0.14 + perlin(u * 32, v * 32, 32, 4) * 0.07;
      ch[1][q] = -(worley(u * 6, v * 6, 6, 5) * 0.65 + worley(u * 12, v * 12, 12, 6) * 0.35);
      ch[2][q] = perlin(u * 16, v * 16, 16, 7) * 0.55 + perlin(u * 32, v * 32, 32, 8) * 0.3 + perlin(u * 64, v * 64, 64, 9) * 0.15;
      ch[3][q] = -(worley(u * 16, v * 16, 16, 10) * 0.6 + worley(u * 32, v * 32, 32, 11) * 0.4); }
    for (k = 0; k < 4; k++) { var a = ch[k], lo = 1e9, hi = -1e9; for (i = 0; i < N * N; i++) { if (a[i] < lo) lo = a[i]; if (a[i] > hi) hi = a[i]; } for (i = 0; i < N * N; i++) d[i * 4 + k] = Math.round((a[i] - lo) / (hi - lo) * 255); }
    var t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat, THREE.UnsignedByteType); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t; })();

  /* ---------- the tables, kept current: a whole table at once the first time, afterwards a few rows a frame into a back buffer ---------- */
  function want(sunEl, moonEl, mie) { A.want.sun = sunEl; A.want.moon = moonEl; A.want.mie = mie; }
  function stale() { var w = A.want, c = A.cur; return Math.abs(w.sun - c.sun) > 0.0026 || (w.moon > -0.12 || c.moon > -0.12) && Math.abs(w.moon - c.moon) > 0.006 || Math.abs(w.mie - c.mie) > 0.04; }
  function finish(J) { var t = A.S; A.S = J.buf; A.B = t; A.cur.sun = J.sun; A.cur.moon = J.moon; upload(tAtm, A.S, SW * 2 * SH); probe(); A.ver++; }
  function step(ms) { if (!A.job) { if (!stale()) return false; var w = A.want; if (Math.abs(w.mie - A.cur.mie) > 0.04) { A.mie = w.mie; buildT(); upload(tTr, A.T, TW * TH); }
      A.job = { sun: w.sun, moon: w.moon, j: 0, buf: A.B }; }
    var J = A.job, t0 = performance.now(); while (J.j < SH) { row(J.buf, J.j, J.sun, J.moon); J.j++; if (ms != null && performance.now() - t0 > ms) break; }
    if (J.j >= SH) { A.job = null; finish(J); return true; } return false; }
  function now() { A.job = null; step(null); if (A.job) step(null); }
  /* colours read back from the table for the lights and the fog: the zenith, the horizon all round, toward the sun, away from it */
  var PR = { zen: [0, 0, 0], hz: [0, 0, 0], hzS: [0, 0, 0], hzA: [0, 0, 0], up: [0, 0, 0], sunT: [0, 0, 0], mzen: [0, 0, 0], mhz: [0, 0, 0] };
  function look(el, phi, side, out) { var v = (Math.sqrt(Math.abs(el) / (PI / 2)) * (el < 0 ? -1 : 1)) * 0.5 + 0.5, y = Math.max(0, Math.min(SH - 1, v * SH - 0.5)), x = phi / PI * (SW - 1), y0 = Math.floor(y), y1 = Math.min(SH - 1, y0 + 1), x0 = Math.floor(x), x1 = Math.min(SW - 1, x0 + 1), fx = x - x0, fy = y - y0, S = A.S, o = side * SW, k;
    for (k = 0; k < 3; k++) out[k] = (S[(y0 * SW * 2 + o + x0) * 3 + k] * (1 - fx) + S[(y0 * SW * 2 + o + x1) * 3 + k] * fx) * (1 - fy) + (S[(y1 * SW * 2 + o + x0) * 3 + k] * (1 - fx) + S[(y1 * SW * 2 + o + x1) * 3 + k] * fx) * fy; return out; }
  function probe() { var t = [0, 0, 0], k, a; look(1.5, 0, 0, PR.zen); look(1.5, 0, 1, PR.mzen); PR.hz[0] = PR.hz[1] = PR.hz[2] = 0; PR.mhz[0] = PR.mhz[1] = PR.mhz[2] = 0; PR.up[0] = PR.up[1] = PR.up[2] = 0;
    for (a = 0; a < 8; a++) { look(0.035, a / 7 * PI, 0, t); for (k = 0; k < 3; k++) PR.hz[k] += t[k] / 8; look(0.035, a / 7 * PI, 1, t); for (k = 0; k < 3; k++) PR.mhz[k] += t[k] / 8; look(0.5, a / 7 * PI, 0, t); for (k = 0; k < 3; k++) PR.up[k] += t[k] / 8; }
    look(0.035, 0, 0, PR.hzS); look(0.035, PI, 0, PR.hzA); trans(0.2, Math.sin(A.cur.sun), PR.sunT); }

  /* ---------- the sky's shader ---------- */
  var GLSL_ATM = [
    'const float APi = 3.14159265;',
    'vec2 atmTrUV(float h, float mu){ float m = abs(mu); float x = -0.5 + sqrt(0.25 + 2.0 * m); float u = (sign(mu) * x + 1.0) * 0.5; float v = sqrt(clamp(h / 100.0, 0.0, 1.0)); return vec2((0.5 + u * 63.0) / 64.0, (0.5 + v * 31.0) / 32.0); }',
    'vec3 atmTr(sampler2D tt, float h, float mu){ return texture2D(tt, atmTrUV(h, mu)).rgb; }',
    'vec3 atmSky(sampler2D ta, vec3 d, vec3 b, float side){ float el = asin(clamp(d.y, -1.0, 1.0)); vec2 dh = d.xz, bh = b.xz; float ld = dot(dh, dh), lb = dot(bh, bh); float cp = (ld > 1e-8 && lb > 1e-8) ? dot(dh, bh) * inversesqrt(ld * lb) : 1.0; float phi = acos(clamp(cp, -1.0, 1.0)); float x = sqrt(abs(el) / (APi * 0.5)) * sign(el); return texture2D(ta, vec2((0.5 + phi / APi * 63.0 + side * 64.0) / 128.0, x * 0.5 + 0.5)).rgb; }',
    'float atmHG(float c, float g){ float g2 = g * g; return (1.0 - g2) / pow(max(1.0 + g2 - 2.0 * g * c, 1e-4), 1.5); }'].join('\n');
  var SKY_FRAG = ['precision highp float;',
    'uniform sampler2D tAtm, tTr, tNz; uniform vec3 uSun, uMoon, uSunC, uTop, uHz, uLow, uFogC, uLP, uGlowC; uniform vec4 uWind, uBolt, uCl, uFogS; uniform vec3 uFogSC;',
    'uniform float uSunE, uMoonE, uSunK, uMoonK, uMoonR, uStars, uMilky, uTime, uFlash, uBow, uNight, uOver, uFogLin, uCloud; uniform mat3 uEq; varying vec3 vD;',
    GLSL_ATM,
    'float h3(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }',
    'float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h3(vec3(i, 1.0)), h3(vec3(i + vec2(1.0, 0.0), 1.0)), f.x), mix(h3(vec3(i + vec2(0.0, 1.0), 1.0)), h3(vec3(i + 1.0, 1.0)), f.x), f.y); }',
    /* the cumulus: puffy cells and a gradient noise, eroded by a finer pass, thresholded by the cover */
    'float cDen(vec2 p, float cov){ vec4 a = texture2D(tNz, p * 0.05); vec4 b = texture2D(tNz, p * 0.21 + vec2(0.31, 0.67)); float n = a.r * 0.55 + a.g * 0.45 - (1.0 - b.g) * 0.17 - (b.r - 0.5) * 0.12; float th = mix(0.74, 0.22, cov); return clamp((n - th) / (0.07 + cov * 0.24), 0.0, 1.0); }',
    'float cLo(vec2 p, float cov){ vec4 a = texture2D(tNz, p * 0.05); float n = a.r * 0.55 + a.g * 0.45 - 0.09; float th = mix(0.74, 0.22, cov); return clamp((n - th) / (0.07 + cov * 0.24), 0.0, 1.0); }',
    'vec3 bowCol(float t){ return vec3(smoothstep(0.45, 0.85, t) * (1.0 - smoothstep(0.92, 1.08, t)), exp(-pow((t - 0.52) / 0.2, 2.0)), exp(-pow((t - 0.16) / 0.17, 2.0))) * smoothstep(-0.12, 0.08, t); }',
    'float bWalk(float k, float s){ float x = 0.0; for (int i = 0; i < 12; i++) { if (float(i) >= k) break; x += (h3(vec3(float(i), s, 3.1)) - 0.5) * 0.075; } return x; }',
    'void main(){ vec3 d = normalize(vD); float y = d.y; float mu = dot(d, uSun);',
    /* the air, lit by the sun and by the moon */
    ' vec3 c = atmSky(tAtm, d, uSun, 0.0) * uSunE; if (uMoonE > 0.0) c += atmSky(tAtm, d, uMoon, 1.0) * uMoonE * vec3(0.8, 0.9, 1.12);',
    /* the night's own glow (airglow, the towns' light low on the horizon) */
    ' c += mix(uHz, uTop, pow(clamp(y * 1.25, 0.0, 1.0), 0.62)) * uNight * 0.85 + vec3(0.0035, 0.0065, 0.016) * uNight * (0.55 + 0.45 * (1.0 - max(y, 0.0))) * (1.0 - uOver * 0.7) + uLP * exp(-max(y, 0.0) * 9.0);',
    /* the stars and the Milky Way, fixed in the equatorial frame */
    ' float sk = uStars * smoothstep(-0.03, 0.14, y); if (sk > 0.002) { vec3 e = uEq * d; vec3 g = e * 260.0; vec3 q = floor(g); float r = h3(q); float sth = 0.9972 - uMilky * 0.0022; if (r > sth) { float mag = (r - sth) / (1.0 - sth); float pt = smoothstep(0.42, 0.08, length(fract(g) - 0.5)); float tw = 0.7 + 0.3 * sin(uTime * (1.3 + mag * 2.0) + r * 61.0); c += mix(vec3(1.0, 0.86, 0.72), vec3(0.78, 0.86, 1.0), h3(q + 3.0)) * pt * tw * (0.35 + mag * 1.4) * sk; }',
    '  if (uMilky > 0.002) { float b = dot(e, vec3(-0.8676, -0.1981, 0.4560)); float l = dot(e, vec3(-0.0550, -0.8734, -0.4839)); float l2 = dot(e, vec3(0.4940, -0.4448, 0.7470)); float lon = atan(l2, l); vec4 nz = texture2D(tNz, vec2(lon * 0.7, b * 2.2)); vec4 nz2 = texture2D(tNz, vec2(lon * 2.1, b * 6.0) + 0.3);',
    '   float band = exp(-b * b / (0.018 + 0.03 * smoothstep(0.0, 1.0, l))) * (0.35 + 0.65 * smoothstep(-0.5, 1.0, l)); float dust = smoothstep(0.42, 0.62, nz.r * 0.6 + nz2.b * 0.4) * exp(-b * b / 0.004); float glow = band * (0.55 + 0.45 * nz.g) * (1.0 - dust * 0.75) + exp(-b * b / 0.003) * exp(-pow(acos(clamp(l, -1.0, 1.0)) / 0.3, 2.0)) * 0.6;',
    '   c += mix(vec3(0.55, 0.62, 0.85), vec3(1.0, 0.86, 0.66), smoothstep(0.3, 1.0, l)) * glow * uMilky * 0.16 * sk; } }',
    /* the moon: a sphere lit by the real sun, its phase and the tilt of its bright limb from the geometry */
    ' float mc = dot(d, uMoon); if (uMoonK > 0.002 && mc > 0.995) { vec3 t1 = normalize(cross(vec3(0.0, 1.0, 0.0001), uMoon)); vec3 t2 = cross(uMoon, t1); vec2 q = vec2(dot(d, t1), dot(d, t2)) / sin(uMoonR); float r2 = dot(q, q);',
    '  c += vec3(0.75, 0.82, 1.0) * exp(-r2 * 0.09) * 0.05 * uMoonK * smoothstep(0.0, 0.3, dot(-uMoon, uSun) + 0.6);',
    '  if (r2 < 1.0) { vec3 n = -uMoon * sqrt(1.0 - r2) + t1 * q.x + t2 * q.y; float lit = clamp(dot(n, uSun) * 3.0 + 0.04, 0.0, 1.0); float mar = n2(q * 2.6 + 3.7) * 0.55 + n2(q * 6.1 + 1.3) * 0.3 + n2(q * 14.0) * 0.15; vec3 alb = vec3(1.0, 0.97, 0.9) * (0.58 + 0.42 * smoothstep(0.38, 0.62, mar)); c = mix(c, alb * (lit * 2.6 + 0.03) * (0.82 + 0.18 * sqrt(1.0 - r2)), uMoonK * smoothstep(1.0, 0.9, r2)); } }',
    /* the sun: a limb-darkened disc reddened by the air it is seen through */
    ' vec3 sT = atmTr(tTr, 0.2, uSun.y);',
    ' c += sT * uSunK * (pow(max(mu, 0.0), 1400.0) * 2.2 + pow(max(mu, 0.0), 90.0) * 0.16) * (1.0 - uOver * 0.6);',
    /* the rainbow: the primary (40.6°–42.4°, red outside), the secondary (50.2°–53.3°, reversed), Alexander's dark band between, the brighter sky inside */
    ' if (uBow > 0.002) { float ang = acos(clamp(-mu, -1.0, 1.0)); float t1 = (ang - 0.7086) / 0.0314; float t2 = (0.9303 - ang) / 0.054; float fade = smoothstep(-0.01, 0.07, y) * uBow; vec3 lum = sT * uSunE * 0.03;',
    '  c *= 1.0 - fade * (0.13 * smoothstep(0.738, 0.75, ang) * smoothstep(0.885, 0.872, ang) - 0.07 * smoothstep(0.74, 0.55, ang)); c += (bowCol(t1) + bowCol(t2) * 0.42 + bowCol(t1 + 1.25) * 0.12 * smoothstep(0.6, 0.0, -t1)) * lum * fade; }',
    /* lightning: a bolt that walks down from the cloud base, with a branch, while it lasts */
    ' if (uBolt.z > 0.001) { float az = atan(d.x, d.z); float da = mod(az - uBolt.x + APi, 2.0 * APi) - APi; float el = asin(clamp(y, -1.0, 1.0)); if (el > -0.02 && el < uBolt.w && abs(da) < 0.4) { float s = (uBolt.w - el) / uBolt.w * 11.0, i0 = floor(s), f = fract(s);',
    '  float xp = mix(bWalk(i0, uBolt.y), bWalk(i0 + 1.0, uBolt.y), f) * uBolt.w; float dd = abs(da - xp) * cos(el); float core = exp(-dd / 0.0011) + exp(-dd / 0.0045) * 0.3; float glow = exp(-dd / 0.03);',
    '  float bs = s - 3.0; float br = 0.0; if (bs > 0.0 && bs < 5.0) { float j0 = floor(bs), g = fract(bs); float xb = xp + mix(bWalk(j0, uBolt.y + 7.0), bWalk(j0 + 1.0, uBolt.y + 7.0), g) * uBolt.w * 1.6 + bs * 0.012 * sign(h3(vec3(uBolt.y)) - 0.5); br = exp(-abs(da - xb) * cos(el) / 0.0012) * (1.0 - bs / 5.0); }',
    '  c += vec3(0.82, 0.86, 1.0) * ((core + br * 0.7) * 26.0 + glow * 1.4) * uBolt.z; } }',
    /* high cirrus, still lit when the low clouds have gone grey; the 22° halo in it */
    ' float cA = 0.0, ci = 0.0; if (uCl.y > 0.01 && y > 0.0) { float t2 = 8.0 / (y + 0.02); vec2 q = d.xz * t2 + uWind.zw; q = vec2(q.x * 0.8 + q.y * 0.6, -q.x * 0.6 + q.y * 0.8);',
    '  float s1 = texture2D(tNz, q * vec2(0.011, 0.042)).b, s2 = texture2D(tNz, q * vec2(0.028, 0.1) + 0.5).r; ci = smoothstep(0.5, 0.86, s1 * 0.68 + s2 * 0.46) * uCl.y * smoothstep(0.0, 0.1, y);',
    '  vec3 sH = pow(atmTr(tTr, 8.0, uSun.y), vec3(1.5)) * uSunE, mH = atmTr(tTr, 8.0, uMoon.y) * uMoonE; vec3 cc = sH * (atmHG(mu, 0.75) * 0.05 + 0.1) + atmSky(tAtm, vec3(0.0, 1.0, 0.0), uSun, 0.0) * uSunE * 0.6 + mH * 0.12 + uTop * uNight * 0.5;',
    '  float ang = acos(clamp(mu, -1.0, 1.0)); c += (vec3(1.0, 0.78, 0.6) * exp(-pow((ang - 0.384) / 0.0085, 2.0)) + vec3(0.7, 0.82, 1.0) * exp(-pow((ang - 0.398) / 0.014, 2.0)) * 0.6) * ci * sH * 0.012 * smoothstep(0.05, 0.3, uSun.y);',
    '  c = mix(c, cc, ci * 0.6); }',
    /* the cumulus: the eye ray meets the layer 1.4 km up; the light marched toward the sun through it; the haze between */
    ' if (uCl.x > 0.02 && y > -0.02) { float yy = max(y, 0.0); float t = 1.4 / (yy + 0.032); vec2 p = d.xz * t + uWind.xy; float cov = uCl.x; float dn = cDen(p, cov);',
    '  if (dn > 0.002) { vec2 sd = uSun.xz / max(uSun.y + 0.2, 0.15) * 0.32; float tau = uCl.w > 1.5 ? cLo(p + sd, cov) + cLo(p + sd * 2.3, cov) * 0.8 + cLo(p + sd * 4.0, cov) * 0.6 : cLo(p + sd * 1.8, cov) * 2.1;',
    '   float Tl = exp(-tau * (0.45 + cov * 0.75)) * (0.4 + 0.6 * exp(-dn * cov * 1.2)); float ph = atmHG(mu, 0.62) * 0.6 + atmHG(mu, -0.22) * 0.4; float pw = 1.0 - exp(-dn * 6.0);',
    '   vec3 sL = atmTr(tTr, 1.4, uSun.y) * uSunE, mL = atmTr(tTr, 1.4, uMoon.y) * uMoonE * vec3(0.8, 0.9, 1.1);',
    '   vec3 amb = atmSky(tAtm, normalize(vec3(-uSun.x, 1.2, -uSun.z)), uSun, 0.0) * uSunE * 1.7 + atmSky(tAtm, normalize(vec3(d.x, 0.12, d.z)), uSun, 0.0) * uSunE * 0.6 + atmSky(tAtm, vec3(0.0, 1.0, 0.0), uMoon, 1.0) * uMoonE * 2.0 + uHz * uNight * 0.6;',
    '   vec3 cc = (sL * (Tl * ph * 0.6 * (0.35 + pw)) + mL * (Tl * atmHG(dot(d, uMoon), 0.6) * 0.5 * (0.35 + pw))) * (1.0 - uCl.z * 0.5) + amb * (0.5 + 0.5 * (1.0 - dn)) * (1.0 - cov * 0.3) * (1.0 - uCl.z * 0.55 * dn);',
    '   cc += vec3(0.62, 0.68, 0.95) * uFlash * (0.5 + dn) * 1.6; float hz = 1.0 - exp(-t * 0.016); cA = dn * smoothstep(0.0, 0.045, yy); cc = mix(cc, c, hz * 0.8); c = mix(c, cc, cA); } }',
    /* the overcast: the deck of a grey day closes over everything */
    ' c = mix(c, mix(uHz, uTop, pow(clamp(y * 1.2, 0.0, 1.0), 0.7)) * (1.0 + uFlash * 1.8), uOver * (1.0 - 0.3 * cA));',
    ' c += vec3(0.62, 0.66, 0.82) * uFlash * 0.25;',
    /* at the horizon the sky meets the fog of the world exactly */
    ' vec3 fd = uFogC; if (uFogS.w > 0.0) { float kc = max(dot(d, uFogS.xyz), 0.0); float kc2 = kc * kc; float kc4 = kc2 * kc2; fd += uFogSC * (kc4 * kc4 * 0.72 + kc2 * 0.28) * uFogS.w; } if (uFogLin < 0.5) fd = pow(max(fd, vec3(0.0)), vec3(2.2));',
    ' c = mix(fd, c, smoothstep(-0.03, 0.014, y));',
    ' float sr = sqrt(max(0.0, 1.0 - mu * mu)) / 0.0098; if (mu > 0.0 && sr < 1.15) { float limb = 0.42 + 0.58 * sqrt(max(0.0, 1.0 - min(sr, 1.0) * min(sr, 1.0))); c += sT * uSunK * 46.0 * limb * smoothstep(1.06, 0.94, sr) * (1.0 - cA * 0.92) * (1.0 - uOver) * smoothstep(-0.012, 0.0, y); }',
    ' gl_FragColor = vec4(max(c, vec3(0.0)), clamp(max(cA, ci * 0.45) + uOver * 0.5, 0.0, 1.0));' + KIT.ENC + '}'].join('\n');
  function skyMat() { var lin = KIT.lin;
    var m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: {
      tAtm: { value: tAtm }, tTr: { value: tTr }, tNz: { value: tNz }, uTop: { value: lin(0x4f9be0) }, uHz: { value: lin(0xd3ecf7) }, uLow: { value: lin(0x9fd0e6) }, uSun: { value: new V3(0.3, 0.6, -0.7) }, uSunC: { value: lin(0xfff2dc) }, uSunK: { value: 1 }, uGlowC: { value: new THREE.Color(0, 0, 0) },
      uStars: { value: 0 }, uMilky: { value: 0 }, uTime: KIT.U.uTime, uMoon: { value: new V3(-0.4, 0.5, 0.6) }, uMoonK: { value: 0 }, uMoonR: { value: 0.014 }, uCloud: { value: 0 }, uFlash: { value: 0 }, uEq: { value: new THREE.Matrix3() },
      uSunE: { value: 24 }, uMoonE: { value: 0 }, uWind: { value: new THREE.Vector4() }, uBolt: { value: new THREE.Vector4() }, uCl: { value: new THREE.Vector4(0.3, 0.3, 0, 2) }, uBow: { value: 0 }, uNight: { value: 0 }, uOver: { value: 0 }, uLP: { value: new THREE.Color(0, 0, 0) },
      uFogC: { value: new THREE.Color(0.8, 0.9, 0.95) }, uFogLin: { value: 1 }, uFogS: FOGU.kFogS, uFogSC: FOGU.kFogC },
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }',
      fragmentShader: SKY_FRAG }); return m; }
  KIT.skyMat = skyMat;

  /* ---------- the planar reflection of the floors and the water: the scene drawn through the plane y = h from the same lens (the reflected camera
     has the main camera's projection, so a floor's fragment finds its reflection at its own place on the screen), the plane's far side clipped
     away by an oblique near plane (Lengyel), at a fraction of the screen's resolution ---------- */
  function Refl(R, o) { o = o || {}; var rt = new THREE.WebGLRenderTarget(4, 4, { type: R.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true, stencilBuffer: !window.ISLE_D16 }); /* (v69) 24-bit depth, as the main target */ rt.texture.generateMipmaps = false; rt.texture.minFilter = rt.texture.magFilter = THREE.LinearFilter;
    var vc = new THREE.PerspectiveCamera(); vc.matrixAutoUpdate = false; vc.matrixWorldAutoUpdate = false; var M = new THREE.Matrix4(), plane = new THREE.Plane(), clip = new THREE.Vector4(), q = new THREE.Vector4(), sz = new THREE.Vector2();
    var X = { rt: rt, cam: vc, k: o.k || 0.5, on: false, y: 0, res: new THREE.Vector4(1, 1, 1, 1),
      render: function (scene, cam, y, pre, post) { X.y = y; R.getDrawingBufferSize(sz); var w = Math.max(32, Math.round(sz.x * X.k)), h = Math.max(32, Math.round(sz.y * X.k)); if (rt.width !== w || rt.height !== h) rt.setSize(w, h); X.res.set(1 / sz.x, 1 / sz.y, w, h);
        M.set(1, 0, 0, 0, 0, -1, 0, 2 * y, 0, 0, 1, 0, 0, 0, 0, 1); vc.matrixWorld.multiplyMatrices(M, cam.matrixWorld); vc.matrixWorldInverse.copy(vc.matrixWorld).invert(); vc.matrix.copy(vc.matrixWorld);
        vc.projectionMatrix.copy(cam.projectionMatrix); vc.near = cam.near; vc.far = cam.far; vc.fov = cam.fov; vc.aspect = cam.aspect;
        plane.set(new V3(0, 1, 0), -y - 0.002); plane.applyMatrix4(vc.matrixWorldInverse); clip.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant); var pm = vc.projectionMatrix.elements;
        q.x = (Math.sign(clip.x) + pm[8]) / pm[0]; q.y = (Math.sign(clip.y) + pm[9]) / pm[5]; q.z = -1.0; q.w = (1.0 + pm[10]) / pm[14]; clip.multiplyScalar(2.0 / clip.dot(q)); pm[2] = clip.x; pm[6] = clip.y; pm[10] = clip.z + 1.0; pm[14] = clip.w;
        vc.projectionMatrixInverse.copy(vc.projectionMatrix).invert();
        var st = R.state, fs = st.setFlipSided, cur = R.getRenderTarget(), sa = R.shadowMap.autoUpdate, tm = R.toneMapping; st.setFlipSided = function (f) { return fs.call(st, !f); };
        try { if (pre) pre(vc); R.shadowMap.autoUpdate = false; R.toneMapping = THREE.NoToneMapping; R.setRenderTarget(rt); R.clear(); R.render(scene, vc); }
        finally { st.setFlipSided = fs; R.shadowMap.autoUpdate = sa; R.toneMapping = tm; R.setRenderTarget(cur); if (post) post(vc); } X.on = true; },
      dispose: function () { rt.dispose(); } };
    return X; }

  /* the reflection's shared uniforms (the floors' hook in island_ag, the sea of Kenting): its texture, the plane (y, on, 1/width, 1/height), the strength (k, wet, rain, time) */
  var RFU = { kRf: { value: null }, kRfP: { value: new THREE.Vector4(0, 0, 1, 1) }, kRfK: { value: new THREE.Vector4(1, 0, 0, 0) }, kRfN: { value: tNz } };
  /* the sky's shared values for other shaders (the sea's fallback reflection): filled by the world when it builds its sky */
  var SKYU = { tAtm: { value: tAtm }, tTr: { value: tTr }, uSunW: { value: new V3(0, 1, 0) }, uSunE: { value: 24 }, uMoonW: { value: new V3(0, -1, 0) }, uMoonE: { value: 0 }, uOverW: { value: 0 } };
  return { FOGU: FOGU, RFU: RFU, SKYU: SKYU, tex: { atm: tAtm, tr: tTr, nz: tNz }, want: want, step: step, now: now, probe: PR, trans: trans, A: A, GLSL: GLSL_ATM, Refl: Refl, skyRay: skyRay, buildT: buildT };
})();
