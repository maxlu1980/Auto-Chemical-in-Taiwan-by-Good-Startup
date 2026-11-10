/* ===== [tw_cine_b.js] ===== */
  /* ===== CINE part 2: the bakes (heights, masks, light, sky) and the materials of the ground, the sea, the clouds and the sky ===== */
  var PI = Math.PI;
  /* ---------- the sky: Nishita single scattering (Rayleigh and Mie, the planet and its atmosphere in km), on the CPU for the light's colours ---------- */
  var RE = 6360, RA = 6420, BR = [5.8e-3, 13.5e-3, 33.1e-3], BO = [0.65e-3, 1.881e-3, 0.085e-3], BM = 25e-3, HR = 7.994, HM = 1.2, MG = 0.76, SUNI = 20;
  /* (the ozone layer as a tent about 25 km up: it takes the green out of the twilight and leaves the zenith blue) */
  function ozo(hh) { return Math.max(0, 1 - Math.abs(hh - 25) / 15); }
  function rsph(o, d, r) { var b = o[0] * d[0] + o[1] * d[1] + o[2] * d[2], c = o[0] * o[0] + o[1] * o[1] + o[2] * o[2] - r * r, q = b * b - c; if (q < 0) return [1e9, -1e9]; q = Math.sqrt(q); return [-b - q, -b + q]; }
  function nishitaJS(dir, sun, n, m) { n = n || 12; m = m || 6; var o = [0, RE + 0.2, 0], a = rsph(o, dir, RA), tmax = a[1], g = rsph(o, dir, RE); if (g[0] > 0) tmax = Math.min(tmax, g[0]); var seg = tmax / n, t = 0, sR = [0, 0, 0], sM = [0, 0, 0], oR = 0, oM = 0, oO = 0, mu = dir[0] * sun[0] + dir[1] * sun[1] + dir[2] * sun[2];
    var pR = 3 / (16 * PI) * (1 + mu * mu), pM = 3 / (8 * PI) * ((1 - MG * MG) * (1 + mu * mu)) / ((2 + MG * MG) * Math.pow(1 + MG * MG - 2 * MG * mu, 1.5)), i, j, k;
    for (i = 0; i < n; i++) { var x = [o[0] + dir[0] * (t + seg / 2), o[1] + dir[1] * (t + seg / 2), o[2] + dir[2] * (t + seg / 2)], hh = Math.hypot(x[0], x[1], x[2]) - RE, dR = Math.exp(-hh / HR) * seg, dM = Math.exp(-hh / HM) * seg; oR += dR; oM += dM; oO += ozo(hh) * seg;
      var ls = rsph(x, sun, RA), sl = ls[1] / m, tl = 0, lR = 0, lM = 0, lO = 0, ok = true; for (j = 0; j < m; j++) { var y = [x[0] + sun[0] * (tl + sl / 2), x[1] + sun[1] * (tl + sl / 2), x[2] + sun[2] * (tl + sl / 2)], hl = Math.hypot(y[0], y[1], y[2]) - RE; if (hl < 0) { ok = false; break; } lR += Math.exp(-hl / HR) * sl; lM += Math.exp(-hl / HM) * sl; lO += ozo(hl) * sl; tl += sl; }
      if (ok) for (k = 0; k < 3; k++) { var at = Math.exp(-(BR[k] * (oR + lR) + BM * 1.1 * (oM + lM) + BO[k] * (oO + lO))); sR[k] += at * dR; sM[k] += at * dM; } t += seg; }
    return [0, 1, 2].map(function (k) { return SUNI * (sR[k] * BR[k] * (pR + 0.03) + sM[k] * BM * (pM + 0.03)); }); }
  /* the light that reaches the ground straight from a body at this elevation (transmittance through the whole air mass) */
  function transmit(sun) { if (sun[1] < -0.12) return [0, 0, 0]; var o = [0, RE + 0.2, 0], a = rsph(o, sun, RA), n = 32, seg = a[1] / n, oR = 0, oM = 0, oO = 0, i; for (i = 0; i < n; i++) { var x = [o[0] + sun[0] * seg * (i + 0.5), o[1] + sun[1] * seg * (i + 0.5), o[2] + sun[2] * seg * (i + 0.5)], hh = Math.hypot(x[0], x[1], x[2]) - RE; if (hh < -0.5) return [0, 0, 0]; oR += Math.exp(-Math.max(0, hh) / HR) * seg; oM += Math.exp(-Math.max(0, hh) / HM) * seg; oO += ozo(hh) * seg; }
    return [0, 1, 2].map(function (k) { return Math.exp(-(BR[k] * oR + BM * 1.1 * oM + BO[k] * oO)); }); }
  var GLSL_SKY = [
    'const float RE = 6360.0, RA = 6420.0, HR = 7.994, HM = 1.2, MG = 0.76; const vec3 BR = vec3(5.8e-3, 13.5e-3, 33.1e-3), BO = vec3(0.65e-3, 1.881e-3, 0.085e-3); const float BM = 25e-3;',
    'float ozo(float h){ return max(0.0, 1.0 - abs(h - 25.0) / 15.0); }',
    'vec2 rsph(vec3 o, vec3 d, float r){ float b = dot(o, d), c = dot(o, o) - r * r, q = b * b - c; if (q < 0.0) return vec2(1e9, -1e9); q = sqrt(q); return vec2(-b - q, -b + q); }',
    'vec3 nishita(vec3 dir, vec3 sun){ vec3 o = vec3(0.0, RE + 0.2, 0.0); vec2 a = rsph(o, dir, RA); float tmax = a.y; vec2 g = rsph(o, dir, RE); if (g.x > 0.0) tmax = min(tmax, g.x);',
    '  float seg = tmax / 16.0, t = 0.0, oR = 0.0, oM = 0.0, oO = 0.0; vec3 sR = vec3(0.0), sM = vec3(0.0); float mu = dot(dir, sun);',
    '  float pR = 3.0 / (16.0 * 3.14159265) * (1.0 + mu * mu), pM = 3.0 / (8.0 * 3.14159265) * ((1.0 - MG * MG) * (1.0 + mu * mu)) / ((2.0 + MG * MG) * pow(1.0 + MG * MG - 2.0 * MG * mu, 1.5));',
    '  for (int i = 0; i < 16; i++) { vec3 x = o + dir * (t + seg * 0.5); float hh = length(x) - RE, dR = exp(-hh / HR) * seg, dM = exp(-hh / HM) * seg; oR += dR; oM += dM; oO += ozo(hh) * seg;',
    '    vec2 ls = rsph(x, sun, RA); float sl = ls.y / 8.0, tl = 0.0, lR = 0.0, lM = 0.0, lO = 0.0; float ok = 1.0;',
    '    for (int j = 0; j < 8; j++) { vec3 y = x + sun * (tl + sl * 0.5); float hl = length(y) - RE; if (hl < 0.0) { ok = 0.0; break; } lR += exp(-hl / HR) * sl; lM += exp(-hl / HM) * sl; lO += ozo(hl) * sl; tl += sl; }',
    '    vec3 at = exp(-(BR * (oR + lR) + BM * 1.1 * (oM + lM) + BO * (oO + lO))); sR += at * dR * ok; sM += at * dM * ok; t += seg; }',
    '  return 20.0 * (sR * BR * (pR + 0.03) + sM * BM * (pM + 0.03)); }'].join('\n');
  /* the sky's map: azimuth across, the sine of the elevation (−0.3 … 1) up */
  var GLSL_SKYUV = 'vec2 skyUV(vec3 d){ return vec2(atan(d.x, -d.z) / 6.2831853 + 0.5, clamp((d.y + 0.3) / 1.3, 0.002, 0.998)); }';

  /* ---------- full-screen passes ---------- */
  var QS = null, QC = null, QM = null;
  function quad() { if (QS) return; QS = new THREE.Scene(); QC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2)); QM = new THREE.Mesh(g, null); QM.frustumCulled = false; QS.add(QM); }
  function pass(R, mat, rt) { quad(); QM.material = mat; var prev = R.getRenderTarget(), at = R.autoClear; R.autoClear = true; R.setRenderTarget(rt); R.render(QS, QC); R.setRenderTarget(prev); R.autoClear = at; }
  var VS_QUAD = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  function rtOf(w, h, type, filter) { var r = new THREE.WebGLRenderTarget(w, h, { type: type, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false, generateMipmaps: false, minFilter: filter || THREE.LinearFilter, magFilter: filter || THREE.LinearFilter }); r.texture.wrapS = r.texture.wrapT = THREE.ClampToEdgeWrapping; return r; }

  var G = { ready: false, res: 3, geo: null, lc: null, sh: null, sky: null, sdfTex: null, box: null, shSun: null, skySun: null };
  function sdfTexture(res) { var a = buildSDF(res), n = a.length, u = new Uint16Array(n), i, H = THREE.DataUtils.toHalfFloat; for (i = 0; i < n; i++) u[i] = H(Math.max(-60000, Math.min(60000, a[i]))); var t = new THREE.DataTexture(u, SG.w, SG.h, THREE.RedFormat, THREE.HalfFloatType); t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; }
  /* the heights, the masks: once */
  function bakeGround(R, res) { if (G.ready && G.res === res) return; G.res = res; var w = Math.round(BW * res), h = Math.round(BH * res); G.box = new THREE.Vector4(BX0, BZ0, BW, BH); G.sdfTex = sdfTexture(res);
    var common = { tSDF: { value: G.sdfTex }, tData: { value: dataTex() }, uBox: { value: G.box } };
    G.geo = rtOf(w, h, THREE.HalfFloatType); var mGeo = new THREE.ShaderMaterial({ uniforms: common, vertexShader: VS_QUAD, fragmentShader: ['precision highp float; varying vec2 vUv;', GLSL_NOISE, GLSL_DATA, GLSL_HEIGHT, 'void main(){ vec2 p = uBox.xy + vUv * uBox.zw; float m, r, sd; float hh = height(p, m, r, sd); gl_FragColor = vec4(hh, m, r, sd); }'].join('\n') });
    pass(R, mGeo, G.geo); mGeo.dispose();
    G.lc = rtOf(w, h, THREE.UnsignedByteType); var mLc = new THREE.ShaderMaterial({ uniforms: Object.assign({ tGeo: { value: G.geo.texture } }, common), vertexShader: VS_QUAD, fragmentShader: ['precision highp float; varying vec2 vUv; uniform sampler2D tGeo; uniform vec4 uBox;', GLSL_NOISE, GLSL_DATA, GLSL_MASKS,
      'void main(){ vec2 p = uBox.xy + vUv * uBox.zw; vec4 g = texture2D(tGeo, vUv); float land = smoothstep(-0.05, 0.1, g.a); float u = urban(p) * land * (1.0 - smoothstep(0.25, 0.6, g.r));',
      ' float f = ponds(p) * (1.0 - smoothstep(0.012, 0.03, g.r)) * smoothstep(0.1, 0.6, g.a) * (1.0 - u); float l = lakes(p) * land; float vil = smoothstep(0.52, 0.74, fbm(p * 0.35 + 7.0)) * (1.0 - smoothstep(0.12, 0.35, g.r)) * land;',
      ' gl_FragColor = vec4(u, f, l, vil); }'].join('\n') });
    pass(R, mLc, G.lc); mLc.dispose(); G.ready = true; }
  /* the light of this hour: soft shadows marched towards the key light, horizon-based occlusion */
  function bakeShade(R, key) { var w = G.geo.width, h = G.geo.height; if (!G.sh) G.sh = rtOf(w, h, THREE.UnsignedByteType); if (G.shSun && Math.abs(G.shSun[0] - key[0]) + Math.abs(G.shSun[1] - key[1]) + Math.abs(G.shSun[2] - key[2]) < 0.004) return; G.shSun = key.slice();
    var m = new THREE.ShaderMaterial({ uniforms: { tGeo: { value: G.geo.texture }, uBox: { value: G.box }, uKey: { value: new V3(key[0], key[1], key[2]) }, uExv: { value: EXV } }, vertexShader: VS_QUAD, fragmentShader: ['precision highp float; varying vec2 vUv; uniform sampler2D tGeo; uniform vec4 uBox; uniform vec3 uKey; uniform float uExv;',
      'float hy(vec2 uv){ return max(texture2D(tGeo, uv).r, 0.0) * uExv; }',
      'void main(){ float h0 = hy(vUv) + 0.004; float sh = 1.0; vec2 kd = uKey.xz; float kl = length(kd);',
      ' if (uKey.y <= -0.02) sh = 0.0; else if (kl > 1e-4) { vec2 du = (kd / kl) / uBox.zw; float tn = uKey.y / kl; for (int i = 1; i <= 44; i++) { float t = 0.06 * float(i) * float(i) * 0.5 + 0.1 * float(i); vec2 uv = vUv + du * t; if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) break; float d = h0 + t * tn - hy(uv); sh = min(sh, clamp(7.0 * d / t + 0.45, 0.0, 1.0)); } }',
      ' float occ = 0.0; for (int a = 0; a < 8; a++) { float an = float(a) * 0.785398; vec2 dv = vec2(cos(an), sin(an)) / uBox.zw; float mx = 0.0; for (int s = 1; s <= 6; s++) { float t = 0.35 * float(s) * float(s); mx = max(mx, (hy(vUv + dv * t) - h0) / t); } occ += atan(mx); }',
      ' float ao = clamp(1.0 - occ / 8.0 * 1.05, 0.25, 1.0); gl_FragColor = vec4(sh, ao, 0.0, 1.0); }'].join('\n') });
    pass(R, m, G.sh); m.dispose(); }
  /* the sky of this hour (and the moon's sky at night): a 256 × 128 map */
  function bakeSky(R, sun, moon, moonK) { if (!G.sky) G.sky = rtOf(256, 128, THREE.HalfFloatType); var sig = sun.concat(moon, [moonK]).map(function (v) { return v.toFixed(3); }).join(','); if (G.skySun === sig) return; G.skySun = sig;
    var m = new THREE.ShaderMaterial({ uniforms: { uSun: { value: new V3(sun[0], sun[1], sun[2]) }, uMoon: { value: new V3(moon[0], moon[1], moon[2]) }, uMK: { value: moonK } }, vertexShader: VS_QUAD, fragmentShader: ['precision highp float; varying vec2 vUv; uniform vec3 uSun, uMoon; uniform float uMK;', GLSL_SKY,
      'void main(){ float az = (vUv.x - 0.5) * 6.2831853, sy = vUv.y * 1.3 - 0.3, cy = sqrt(max(0.0, 1.0 - sy * sy)); vec3 d = normalize(vec3(sin(az) * cy, sy, -cos(az) * cy));',
      ' vec3 c = uSun.y > -0.25 ? nishita(d, normalize(uSun)) : vec3(0.0); if (uMK > 0.0 && uMoon.y > -0.1) c += nishita(d, normalize(uMoon)) * uMK * 0.55 * vec3(0.75, 0.86, 1.15);',
      ' c += vec3(0.0012, 0.0022, 0.0055) * (1.0 - smoothstep(-0.2, 0.0, uSun.y)) * (0.6 + 0.4 * (1.0 - abs(sy)));',
      ' gl_FragColor = vec4(c, 1.0); }'].join('\n') });
    pass(R, m, G.sky); m.dispose(); }

  /* ---------- the materials ---------- */
  var ENC = '\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n';
  var U = { /* (v83) the sky's alpha: 0 for the post chain (its sun rays stream from where the sky is), 1 when the film is drawn straight to the screen — there an alpha of 0 let the page show through the sky (white at night, washed out by day) */ uSkyA: { value: 0 }, uCam: { value: new V3() }, uKey: { value: new V3(0, 1, 0) }, uKeyCol: { value: new V3(1, 1, 1) }, uSunDir: { value: new V3(0, 1, 0) }, uSkyUp: { value: new V3(0.3, 0.4, 0.6) }, uSkyHz: { value: new V3(0.6, 0.65, 0.7) },
    uExpo: { value: 1 }, uNight: { value: 0 }, uTime: { value: 0 }, uHaze: { value: 0.03 }, uHazeH: { value: 1.6 }, uCov: { value: 0.35 }, uCloudY: { value: 2.6 }, uMtnCov: { value: 0.42 }, uWind: { value: new THREE.Vector2() }, uExv: { value: EXV }, uMoonDir: { value: new V3(0, 1, 0) }, uMoonK: { value: 0 },
    uRoute: { value: 0 }, uFade: { value: 1 } };
  var GLSL_AIR = [
    'uniform sampler2D tSky; uniform vec3 uCam, uSunDir; uniform float uHaze, uHazeH;',
    GLSL_SKYUV,
    'vec3 skyAt(vec3 d){ return texture2D(tSky, skyUV(d)).rgb; }',
    /* aerial perspective: haze (Mie) that thins with height, the air's own blue (Rayleigh), lit with the sky's colour towards the view and a forward glow towards the sun */
    'vec3 aerial(vec3 col, vec3 wp, out float T){ vec3 d = wp - uCam; float dist = length(d); vec3 v = d / max(dist, 1e-4); float y0 = max(uCam.y, 0.0), y1 = max(wp.y, 0.0), H = uHazeH;',
    '  float od = abs(y1 - y0) > 0.02 ? uHaze * H * (exp(-y0 / H) - exp(-y1 / H)) / (y1 - y0) * dist : uHaze * exp(-y0 / H) * dist; float H8 = 8.0 * 1.45;',
    '  float odr = abs(y1 - y0) > 0.02 ? H8 * (exp(-y0 / H8) - exp(-y1 / H8)) / (y1 - y0) * dist : exp(-y0 / H8) * dist; vec3 tr = exp(-(vec3(od) + vec3(5.8e-3, 13.5e-3, 33.1e-3) * odr * 0.9)); T = dot(tr, vec3(0.333));',
    '  vec3 hz = skyAt(normalize(vec3(v.x, clamp(abs(v.y) * 0.5 + 0.07, 0.07, 0.45), v.z)));',
    '  float mu = dot(v, uSunDir); float mie = 0.035 * (1.0 - 0.58) / pow(1.0 + 0.336 - 1.16 * mu, 1.5);',
    '  return col * tr + (hz * 0.92 + hz * mie) * (1.0 - tr); }'].join('\n');

  /* the ground: the masks and the light baked, the cover drawn per pixel (fields of late October, the towns, the forests, the alpine grass and
     rock, the gravel beds, the fish ponds, the beaches), city lights at night, cloud shadows, aerial perspective */
  function groundMat() {
    return new THREE.ShaderMaterial({ extensions: { derivatives: true }, uniforms: Object.assign({ tGeo: { value: G.geo.texture }, tLC: { value: G.lc.texture }, tSH: { value: G.sh.texture }, tSky: { value: G.sky.texture }, uBox: { value: G.box }, uTex: { value: new THREE.Vector2(1 / G.geo.width, 1 / G.geo.height) }, uTexKm: { value: 1 / G.res } }, U),
      vertexShader: ['precision highp float; uniform sampler2D tGeo; uniform vec4 uBox; uniform float uExv; varying vec3 vW; varying vec2 vUv;',
        'void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vec2 uv = (w.xz - uBox.xy) / uBox.zw; float h = texture2D(tGeo, uv).r; w.y = h > 0.0 ? h * uExv + 0.0006 : h * 3.0 - 0.01; vW = w.xyz; vUv = uv; gl_Position = projectionMatrix * viewMatrix * w; }'].join('\n'),
      fragmentShader: ['precision highp float; varying vec3 vW; varying vec2 vUv; uniform sampler2D tGeo, tLC, tSH; uniform vec4 uBox; uniform vec2 uTex, uWind; uniform float uTexKm, uExv, uExpo, uNight, uTime, uCov, uCloudY, uMtnCov;',
        'uniform vec3 uKey, uKeyCol, uSkyUp, uSkyHz;', GLSL_NOISE, GLSL_AIR,
        'float edgeL(vec2 f, float w){ vec2 d = min(f, 1.0 - f); return 1.0 - smoothstep(0.0, w, min(d.x, d.y)); }',
        'vec3 fields(vec2 p, float fw, out float wet){ float an = (vn(p * 0.03) - 0.5) * 0.7 + 0.2; float c = cos(an), s = sin(an); vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y); vec2 cs = vec2(0.13, 0.06) * (0.85 + 0.35 * vn(p * 0.15));',
        '  vec2 g = q / cs, id = floor(g), f = g - id; float r0 = h12(id + 3.1), ns = 1.0 + floor(r0 * 3.0); float fx = f.x * ns, sid = floor(fx); vec2 f2 = vec2(fract(fx), f.y); vec2 cid = id * 4.0 + vec2(sid, 0.0);',
        '  float r = h12(cid + 17.0), r2 = h12(cid * 1.7 + 3.0), reg = vn(p * 0.4); vec3 col; wet = 0.0;',
        '  if (r < 0.26 + 0.12 * reg) col = mix(vec3(0.15, 0.125, 0.055), vec3(0.20, 0.165, 0.07), r2); else if (r < 0.50) col = mix(vec3(0.058, 0.098, 0.034), vec3(0.085, 0.13, 0.045), r2); else if (r < 0.62) col = mix(vec3(0.11, 0.095, 0.065), vec3(0.15, 0.125, 0.085), r2);',
        '  else if (r < 0.655) { col = vec3(0.06, 0.07, 0.068); wet = 0.45; } else if (r < 0.84) col = mix(vec3(0.04, 0.068, 0.03), vec3(0.056, 0.086, 0.036), r2); else col = mix(vec3(0.08, 0.105, 0.05), vec3(0.11, 0.13, 0.06), r2);',
        '  col = mix(col, vec3(0.095, 0.11, 0.05), 0.18); float near = 1.0 - smoothstep(0.0015, 0.005, fw); float n1 = vn(p * 60.0 + r * 31.0), n2 = vn(p * 190.0 - r * 17.0), rows = 0.5 + 0.5 * sin(f2.y * (26.0 + r * 30.0) * 6.2831);',
        '  col *= 1.0 + near * (0.22 * (n1 - 0.5) + 0.14 * (n2 - 0.5) + 0.1 * (rows - 0.5) * step(0.5, r));',
        '  float ex = edgeL(vec2(f2.x, 0.5), 0.004 / (cs.x / ns)), ez = edgeL(vec2(0.5, f.y), 0.004 / cs.y), et = h12(id + 5.5); float e = max(ex, ez); vec3 ec = et < 0.14 ? vec3(0.025, 0.045, 0.02) : et < 0.3 ? vec3(0.17, 0.16, 0.14) : vec3(0.085, 0.10, 0.055); float ew = et < 0.14 ? 1.8 : 1.0;',
        '  e = max(edgeL(vec2(f2.x, 0.5), 0.004 * ew / (cs.x / ns)), edgeL(vec2(0.5, f.y), 0.004 * ew / cs.y)); col = mix(col, ec, e * 0.8 * (1.0 - smoothstep(0.003, 0.012, fw)));',
        '  float hs = h12(id * 3.3 + 9.0); if (hs > 0.94) { vec2 hp = vec2(0.15 + 0.7 * h12(id + 1.7), 0.2 + 0.6 * h12(id + 2.9)); float hd = length((f - hp) * cs); col = mix(col, mix(vec3(0.32, 0.31, 0.29), vec3(0.03, 0.05, 0.02), step(0.009, hd)), (1.0 - smoothstep(0.008, 0.02, hd)) * near); }',
        '  float lod = smoothstep(0.008, 0.03, fw); col = mix(col, vec3(0.095, 0.11, 0.05), lod); wet *= 1.0 - lod; return col; }',
        'vec3 town(vec2 p, float fw, out float lt, out float street){ vec2 g = p / 0.095, id = floor(g), f = g - id; float r = h12(id + 5.0); street = edgeL(f, 0.065); vec2 g2 = p / 0.017, id2 = floor(g2), f2 = g2 - id2; float rb = h12(id2 + 11.0);',
        '  vec3 roof = mix(vec3(0.15, 0.15, 0.14), vec3(0.33, 0.32, 0.30), rb); if (rb > 0.88) roof = vec3(0.08, 0.14, 0.19); else if (rb < 0.07) roof = vec3(0.24, 0.12, 0.07); roof *= 0.82 + 0.3 * edgeL(f2, 0.12);',
        '  if (r > 0.94) roof = vec3(0.045, 0.09, 0.035); vec3 col = mix(roof, vec3(0.06, 0.06, 0.065), street); float lod = smoothstep(0.004, 0.02, fw); col = mix(col, vec3(0.16, 0.16, 0.155), lod);',
        /* (v62) the lights by night, filtered to the pixel. Every street of the 95 m grid is a line of lamps (dots 25 m apart, close to); every fourth
           line may be an avenue — wider, brighter, the cars on it — and some are. Each line is a gaussian widened by the pixel's own footprint
           and dimmed by the same factor (its light conserved), so far off a street becomes a fainter, wider line, never a square, and only
           past its own spacing a mean. The avenues therefore still draw the city's net from high above, as they do. Lit windows in clusters */
        '  float sig = 0.0045, s2 = sig * sig, fwh = 0.5 * fw, se = sqrt(s2 + fwh * fwh), kq = sig / se, dA = min(f.x, 1.0 - f.x) * 0.095, dB = min(f.y, 1.0 - f.y) * 0.095, da = (fract(p.y / 0.025) - 0.5) * 0.025, db = (fract(p.x / 0.025) - 0.5) * 0.025;',
        '  float dotk = smoothstep(sig * 0.5, sig * 1.8, fw), stA = kq * exp(-0.5 * dA * dA / (se * se)) * mix(exp(-0.5 * da * da / s2) * 1.6, 1.0, dotk), stB = kq * exp(-0.5 * dB * dB / (se * se)) * mix(exp(-0.5 * db * db / s2) * 1.6, 1.0, dotk);',
        '  float streets = mix(stA + stB, 0.237, smoothstep(0.035, 0.08, fw)); vec2 ka = floor(p / 0.38 + 0.5), dv = p - ka * 0.38; float avx = step(0.5, h12(vec2(ka.x, 3.0))), avz = step(0.5, h12(vec2(7.0, ka.y)));',
        '  float sa = 0.008, sea = sqrt(sa * sa + fwh * fwh), ave = sa / sea * (exp(-0.5 * dv.x * dv.x / (sea * sea)) * avx + exp(-0.5 * dv.y * dv.y / (sea * sea)) * avz); ave = mix(ave, 0.053, smoothstep(0.12, 0.3, fw));',
        '  vec2 gw = p / 0.012, fwn = fract(gw) - 0.5; float on = step(0.66, h12(floor(gw) + 23.0)), wn = (1.0 - smoothstep(0.18, 0.4, max(abs(fwn.x), abs(fwn.y)))) * on, wmean = 0.34 * 0.31;',
        '  float clus = smoothstep(0.3, 0.85, fbm3(p * 2.2 + 9.0)), win = mix(wn, wmean, smoothstep(0.004, 0.014, fw)) * (1.0 - street) * (0.35 + 0.9 * clus);',
        '  float dist = mix(0.22, 1.25, smoothstep(0.28, 0.72, fbm3(p * 1.1 + 2.0))) /* districts: bright cores, darker housing, black parks */; lt = (streets * 0.3 + ave * 1.6 + win * 0.22 + 0.006 * clus) * dist; return col; }',
        'vec3 forest(vec2 p, float h, float slope, float fw){ float n1 = vn(p * 9.0), n2 = vn(p * 41.0 + 5.0); vec3 lowF = mix(vec3(0.028, 0.056, 0.020), vec3(0.058, 0.096, 0.036), n1), hiF = mix(vec3(0.018, 0.040, 0.028), vec3(0.032, 0.056, 0.036), n1);',
        '  vec3 col = mix(lowF, hiF, smoothstep(1.7, 2.6, h)); col *= 0.82 + 0.34 * mix(n2, 0.5, smoothstep(0.003, 0.012, fw));',
        '  col = mix(col, mix(vec3(0.15, 0.14, 0.06), vec3(0.21, 0.19, 0.09), n1), smoothstep(3.05, 3.4, h + 0.25 * (n1 - 0.5)));',
        '  col = mix(col, mix(vec3(0.16, 0.15, 0.14), vec3(0.25, 0.24, 0.22), n2), smoothstep(0.52, 0.82, slope + 0.2 * (n1 - 0.5)) * smoothstep(0.5, 1.4, h));',
        '  float sc = smoothstep(0.78, 0.86, vn(p * 2.3 + 11.0)) * smoothstep(0.33, 0.55, slope); col = mix(col, vec3(0.22, 0.19, 0.15), sc * 0.8); return col; }',
        'float clouds(vec2 p){ vec2 q = p * 0.07 + uWind; vec2 w = vec2(fbm3(q * 1.3 + vec2(5.2, 1.3)), fbm3(q * 1.3 + vec2(-3.7, 8.1))); return fbm3(q + w * 1.1) * 0.68 + vn(p * 0.75 + uWind * 5.0) * 0.32; }',
        'void main(){ vec4 g = texture2D(tGeo, vUv); float h = g.r, mtn = g.g, riv = g.b, sd = g.a; if (h < -0.0004) discard; vec2 p = vW.xz;',
        '  float hl = texture2D(tGeo, vUv - vec2(uTex.x, 0.0)).r, hr = texture2D(tGeo, vUv + vec2(uTex.x, 0.0)).r, hd = texture2D(tGeo, vUv - vec2(0.0, uTex.y)).r, hu = texture2D(tGeo, vUv + vec2(0.0, uTex.y)).r;',
        '  vec3 n = normalize(vec3((hl - hr) * uExv, 2.0 * uTexKm, (hd - hu) * uExv)); float fw = max(length(fwidth(p)), 1e-5);',
        '  float dd = (1.0 - smoothstep(0.01, 0.05, fw)) * smoothstep(0.05, 0.6, mtn); if (dd > 0.0) { float e = 0.02; float a0 = fbm3(p * 9.0), ax = fbm3(p * 9.0 + vec2(e * 9.0, 0.0)), az = fbm3(p * 9.0 + vec2(0.0, e * 9.0)); n = normalize(n + vec3(a0 - ax, 0.0, a0 - az) * 1.6 * dd); }',
        '  vec4 lc = texture2D(tLC, vUv); vec4 sh = texture2D(tSH, vUv); float urb = lc.r, fish = lc.g, lake = lc.b, vil = lc.a; float slope = 1.0 - n.y;',
        '  vec3 alb = forest(p, h, slope, fw); float wet = 0.0, lt = 0.0, street = 0.0, fwet = 0.0;',
        '  float low = (1.0 - smoothstep(0.1, 0.32, h + 0.25 * mtn)) * (1.0 - smoothstep(0.18, 0.4, slope)); if (low > 0.001) { vec3 fl = fields(p, fw, fwet); alb = mix(alb, fl, low); wet = fwet * low; }',
        '  float tv = max(smoothstep(0.12, 0.55, urb), vil * 0.65 * smoothstep(0.55, 0.62, h12(floor(p / 0.12) + 41.0))); if (tv > 0.001) { float lt0, st0; vec3 tc = town(p, fw, lt0, st0); alb = mix(alb, tc * (1.0 - 0.8 * uNight) /* roofs go dark at night: the city is its lights */, tv); lt = lt0 * tv * max(urb, vil * 0.5); street = st0; wet *= 1.0 - tv; }',
        '  if (fish > 0.02) { vec2 g4 = p / vec2(0.07, 0.05), id4 = floor(g4), f4 = g4 - id4; float pe = edgeL(f4, 0.09), r4 = h12(id4 + 31.0); vec3 pc = mix(vec3(0.05, 0.10, 0.10), vec3(0.08, 0.13, 0.09), r4); vec3 fc = mix(pc, vec3(0.22, 0.21, 0.17), pe); fc = mix(fc, vec3(0.08, 0.11, 0.1), smoothstep(0.004, 0.015, fw)); float fm = smoothstep(0.02, 0.4, fish) * step(0.18, r4); alb = mix(alb, fc, fm); wet = mix(wet, 0.85 * (1.0 - pe), fm); }',
        '  if (riv > 0.01) { float ch = smoothstep(0.62, 0.7, ridged(p * vec2(3.0, 3.0) + 2.0)); vec3 gv = mix(vec3(0.20, 0.195, 0.175), vec3(0.27, 0.26, 0.235), vn(p * 30.0)); alb = mix(alb, mix(gv, vec3(0.08, 0.1, 0.1), ch), riv); wet = mix(wet, ch * 0.9, riv); }',
        '  float beach = (1.0 - smoothstep(0.02, 0.09, sd + 0.04 * (vn(p * 3.0) - 0.5))) * (1.0 - smoothstep(0.004, 0.02, h)); vec3 sand = vW.z > 150.0 ? vec3(0.36, 0.34, 0.28) : vW.x > 30.0 ? vec3(0.15, 0.15, 0.14) : vec3(0.27, 0.26, 0.23); alb = mix(alb, sand, beach * 0.85);',
        '  if (lake > 0.02) { alb = mix(alb, vec3(0.02, 0.05, 0.05), lake); wet = max(wet, lake); }',
        '  float shadow = sh.r, ao = sh.g; vec2 cp = p + uKey.xz / max(uKey.y, 0.15) * max(uCloudY - vW.y, 0.0); float cd = clouds(cp); float cov = uCov + mtn * uMtnCov * 1.07; float cs = 1.0 - 0.75 * smoothstep(1.0 - cov, 1.0 - cov + 0.22, cd) * step(vW.y, uCloudY);',
        '  float ndl = max(dot(n, uKey), 0.0); vec3 amb = mix(uSkyHz, uSkyUp, 0.5 + 0.5 * n.y) * ao; vec3 col = alb * (uKeyCol * ndl * shadow * cs / 3.14159 + amb);',
        '  vec3 V = normalize(uCam - vW); if (wet > 0.01) { vec3 R = reflect(-V, vec3(0.0, 1.0, 0.0)); float fres = 0.02 + 0.98 * pow(1.0 - max(V.y, 0.0), 5.0); vec3 rc = skyAt(normalize(vec3(R.x, max(R.y, 0.07), R.z))); float gl = pow(max(dot(R, uKey), 0.0), 400.0) * 18.0 * shadow * cs; col = mix(col, rc * 0.9 + uKeyCol * gl, wet * clamp(fres + 0.08, 0.0, 1.0)); }',
        '  float T; col = aerial(col, vW, T); col *= uExpo;',
        '  float night = uNight; if (night > 0.0) { vec3 lc2 = mix(vec3(1.0, 0.6, 0.3), vec3(1.0, 0.9, 0.78), smoothstep(0.38, 0.62, fbm3(p * 0.55 + 4.0))) /* sodium districts and LED districts, by area */; col += lc2 * lt * night * 1.25 * T * smoothstep(0.08, 0.3, urb + vil * 0.4) * (0.55 + 0.45 * smoothstep(0.3, 0.8, urb)); col += vec3(1.0, 0.6, 0.3) * urb * urb * night * 0.012 * T; }',
        '  gl_FragColor = vec4(col, 1.0);' + ENC + '}'].join('\n') }); }

  /* the sea: its colour from the depth (turbid green-grey off the west coast, deep blue off the east), waves at three scales, the sky in it, the glint, the surf line */
  function seaMat() {
    return new THREE.ShaderMaterial({ extensions: { derivatives: true }, uniforms: Object.assign({ tGeo: { value: G.geo.texture }, tSky: { value: G.sky.texture }, uBox: { value: G.box } }, U),
      vertexShader: 'precision highp float; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: ['precision highp float; varying vec3 vW; uniform sampler2D tGeo; uniform vec4 uBox; uniform vec3 uKey, uKeyCol, uSkyUp, uSkyHz; uniform float uTime, uExpo, uNight;', GLSL_NOISE, GLSL_AIR,
        'void main(){ vec2 uv = (vW.xz - uBox.xy) / uBox.zw; vec4 g = vec4(-2.0, 0.0, 0.0, -40.0); if (uv.x > 0.0 && uv.y > 0.0 && uv.x < 1.0 && uv.y < 1.0) g = texture2D(tGeo, uv); if (g.r > 0.0015) discard;',
        '  float depth = max(-g.r, 0.0), sd = g.a; vec2 p = vW.xz; vec3 V = normalize(uCam - vW); float dist = length(uCam - vW), k = clamp(dist * 0.006, 0.0, 1.0); float t = uTime;',
        '  vec2 gr = vec2(0.0); float e = 0.004; vec2 q1 = p * 18.0 + vec2(t * 0.6, t * 0.35), q2 = p * 4.0 - vec2(t * 0.15, t * 0.2), q3 = p * 0.9 + vec2(t * 0.03, -t * 0.02);',
        '  float a1 = vn(q1), a2 = vn(q2), a3 = vn(q3); gr += (vec2(vn(q1 + vec2(0.06, 0.0)), vn(q1 + vec2(0.0, 0.06))) - a1) / 0.06 * 0.010 * (1.0 - k);',
        '  gr += (vec2(vn(q2 + vec2(0.06, 0.0)), vn(q2 + vec2(0.0, 0.06))) - a2) / 0.06 * 0.016; gr += (vec2(vn(q3 + vec2(0.06, 0.0)), vn(q3 + vec2(0.0, 0.06))) - a3) / 0.06 * 0.014;',
        '  vec3 N = normalize(vec3(-gr.x, 1.0, -gr.y)); vec3 R = reflect(-V, N); R.y = max(abs(R.y), 0.07); vec3 sky = skyAt(normalize(R)); float fres = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);',
        '  vec3 shallow = mix(vec3(0.016, 0.040, 0.044), vec3(0.010, 0.050, 0.062), smoothstep(10.0, 60.0, vW.x)), deep = mix(vec3(0.0025, 0.011, 0.022), vec3(0.0015, 0.009, 0.028), smoothstep(10.0, 60.0, vW.x));',
        '  vec3 body = mix(shallow, deep, smoothstep(0.0, 0.06, depth)) * (uSkyUp * 1.2 + uKeyCol * max(uKey.y, 0.0) * 0.04);',
        '  vec3 col = mix(body, sky, fres); float rough = mix(0.0, 1.0, k); float sp = pow(max(dot(R, uKey), 0.0), mix(1400.0, 90.0, rough)) * mix(40.0, 5.0, rough); col += uKeyCol * sp * smoothstep(-0.05, 0.05, uKey.y);',
        '  float fm = (1.0 - smoothstep(0.0, 0.025 + 0.03 * vn(p * 25.0 + t * 0.2), -sd)) * step(-0.5, sd); float br = 0.5 + 0.5 * sin(sd * 220.0 + t * 1.6 + vn(p * 6.0) * 6.0); col = mix(col, (uSkyUp + uKeyCol * max(uKey.y, 0.0) * 0.05) * 1.6, fm * mix(0.35, 0.85, br) * (1.0 - smoothstep(0.004, 0.03, length(fwidth(p)))));',
        '  float T; col = aerial(col, vW, T); col *= uExpo; gl_FragColor = vec4(col, 1.0);' + ENC + '}'].join('\n') }); }

  /* the sky: the baked map, the sun's disc, the moon with its phase, the stars */
  function skyMat() {
    return new THREE.ShaderMaterial({ depthWrite: false, side: THREE.BackSide, uniforms: Object.assign({ tSky: { value: G.sky.texture }, uMoonPh: { value: new V3() } }, U),
      vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
      fragmentShader: ['precision highp float; varying vec3 vD; uniform sampler2D tSky; uniform vec3 uSunDir, uMoonDir, uKeyCol, uMoonPh; uniform float uExpo, uNight, uMoonK, uSkyA;', GLSL_SKYUV,
        'float hs(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
        'void main(){ vec3 d = normalize(vD); vec3 c = texture2D(tSky, skyUV(normalize(vec3(d.x, max(d.y, 0.04), d.z)))).rgb; float mu = dot(d, normalize(uSunDir));',
        '  c += uKeyCol * (smoothstep(0.99996, 0.99999, mu) * 60.0 + pow(max(mu, 0.0), 2000.0) * 2.0) * step(-0.02, uSunDir.y); c *= uExpo;',
        '  float mm = dot(d, normalize(uMoonDir)); if (mm > 0.99994) { vec3 md = normalize(uMoonDir); vec3 ax = normalize(cross(md, vec3(0.0, 1.0, 0.0))), ay = cross(ax, md); vec2 q = vec2(dot(d - md, ax), dot(d - md, ay)) / 0.0105; float r = length(q); float lit = smoothstep(0.0, 0.25, dot(normalize(vec3(q, sqrt(max(0.0, 1.0 - r * r)))), uMoonPh) + 0.05); c += vec3(0.9, 0.92, 0.95) * lit * (1.0 - smoothstep(0.95, 1.0, r)) * 0.9 * uNight; }',
        '  if (uNight > 0.0 && d.y > 0.0) { vec3 sp = d * 380.0; vec3 id = floor(sp); float r = hs(id); float st = step(0.9965, r) * smoothstep(0.42, 0.0, length(fract(sp) - 0.5)); c += vec3(0.8, 0.85, 1.0) * st * uNight * (0.4 + 2.2 * hs(id + 3.0)) * smoothstep(0.0, 0.25, d.y); }',
        '  gl_FragColor = vec4(c, uSkyA);' + ENC + '}'].join('\n') }); } /* (v61) the sky writes alpha 0: the post chain's sun rays stream from it */

  /* the sea of clouds: a deck at about 1.8 km that thickens over the ranges and thins over the sea and the plains; lit from above, grey below */
  function cloudMat() {
    return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: Object.assign({ tGeo: { value: G.geo.texture }, tSky: { value: G.sky.texture }, uBox: { value: G.box } }, U),
      vertexShader: 'precision highp float; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: ['precision highp float; varying vec3 vW; uniform sampler2D tGeo; uniform vec4 uBox; uniform vec3 uKey, uKeyCol, uSkyUp, uSkyHz; uniform vec2 uWind; uniform float uCov, uExpo, uCloudY, uNight, uFade, uMtnCov;', GLSL_NOISE, GLSL_AIR,
        'float dens(vec2 p){ vec2 q = p * 0.07 + uWind; vec2 w = vec2(fbm3(q * 1.3 + vec2(5.2, 1.3)), fbm3(q * 1.3 + vec2(-3.7, 8.1))); float far = smoothstep(40.0, 140.0, length(uCam - vec3(p.x, uCloudY, p.y))); return fbm(q + w * 1.1) * 0.68 + mix(fbm3(p * 0.75 + uWind * 5.0), 0.5, far) * 0.32; }',
        'void main(){ vec2 p = vW.xz, uv = (p - uBox.xy) / uBox.zw; float m = 0.0, sd = -20.0, gy = -1.0; if (uv.x > 0.0 && uv.y > 0.0 && uv.x < 1.0 && uv.y < 1.0) { vec4 g = texture2D(tGeo, uv); m = g.g; sd = g.a; gy = g.r * 1.45; }',
        '  float cov = uCov + m * uMtnCov - 0.14 * (1.0 - smoothstep(-8.0, 0.0, sd)); float d = dens(p); float a = smoothstep(1.0 - cov, 1.0 - cov + 0.16, d) * smoothstep(-0.35, 0.3, uCloudY - gy); if (a < 0.003) discard;',
        '  float d2 = dens(p + normalize(uKey.xz + 1e-4) * 0.5); float th = clamp((d - (1.0 - cov)) / 0.3, 0.0, 1.0); float lit = clamp(0.6 + (d - d2) * 5.0, 0.1, 1.0) * (0.75 + 0.25 * (1.0 - th)); vec3 V = normalize(uCam - vW); float above = step(uCloudY, uCam.y);',
        '  vec3 top = uKeyCol * max(uKey.y, 0.0) * 0.32 * lit + uSkyUp * 1.05, bot = (uSkyHz * 0.55 + uSkyUp * 0.35) * (0.7 + 0.3 * lit); vec3 col = mix(bot, top, above);',
        '  float mu = dot(-V, uKey); col += uKeyCol * pow(max(mu, 0.0), 10.0) * 0.18 * (1.0 - a) ; col = mix(col, col * vec3(1.0, 0.9, 0.82), smoothstep(0.2, 0.0, uKey.y) * (1.0 - uNight));',
        '  col *= 1.0 - 0.55 * uNight; float near = smoothstep(0.08, 0.5, abs(uCam.y - uCloudY)); float T; col = aerial(col, vW, T); float fd = 1.0 - smoothstep(180.0, 340.0, length(uCam.xz - p));',
        '  col *= uExpo; gl_FragColor = vec4(col, a * near * fd * mix(0.92, 0.75, above) * uFade);' + ENC + '}'].join('\n') }); }

  /* the towers of the cities: their walls, their windows lit at night (by the world position, so every tower differs) */
  function towerMat() {
    return new THREE.ShaderMaterial({ extensions: { derivatives: true }, uniforms: Object.assign({ tSky: { value: G.sky.texture } }, U), vertexColors: false,
      vertexShader: ['precision highp float; varying vec3 vW, vN, vC; varying float vHf;',
        'void main(){ mat4 m = modelMatrix;', '#ifdef USE_INSTANCING', ' m = modelMatrix * instanceMatrix;', '#endif', ' vec4 w = m * vec4(position, 1.0); vW = w.xyz; vHf = clamp(position.y, 0.0, 1.0); vN = normalize(mat3(m) * normal); vC = vec3(1.0);', '#ifdef USE_INSTANCING_COLOR', ' vC = instanceColor;', '#endif', ' gl_Position = projectionMatrix * viewMatrix * w; }'].join('\n'),
      fragmentShader: ['precision highp float; varying vec3 vW, vN, vC; varying float vHf; uniform vec3 uKey, uKeyCol, uSkyUp, uSkyHz; uniform float uExpo, uNight;', GLSL_AIR, 'float h1(vec2 p){ vec3 p3 = fract(vec3(p.x, p.y, p.x) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
        'void main(){ vec3 n = normalize(vN); float ndl = max(dot(n, uKey), 0.0); vec3 alb = vC * (n.y > 0.5 ? 0.16 : 0.12) * (1.0 - 0.8 * uNight); float side = 1.0 - abs(n.y); vec2 f = vec2(dot(vW.xz, vec2(-n.z, n.x)) / 0.0042, vW.y / 0.0035); vec2 id = floor(f), q = fract(f); vec2 fwf = fwidth(f); float aa = smoothstep(0.3, 0.9, max(fwf.x, fwf.y)); float win = mix(step(0.18, q.x) * step(q.x, 0.82) * step(0.25, q.y) * step(q.y, 0.85), 0.385, aa) * side;',
        '  alb *= 1.0 - 0.55 * win; vec3 col = alb * (uKeyCol * ndl / 3.14159 + mix(uSkyHz, uSkyUp, 0.5 + 0.5 * n.y) * 0.8); vec3 V = normalize(uCam - vW); vec3 R = reflect(-V, n); col = mix(col, skyAt(normalize(vec3(R.x, max(abs(R.y), 0.07), R.z))) * 0.35, win * 0.3 * (1.0 - uNight));',
        '  float T; col = aerial(col, vW, T); col *= uExpo; float on = mix(step(0.7, h1(id + floor(vW.xz * 20.0))), step(0.66, h1(floor(vW.xz * 20.0) + 3.1)) * 0.3, aa) * win /* far off: not a mean grey over every wall, but some towers lit and most not */; col += mix(vec3(1.0, 0.74, 0.44), vec3(0.88, 0.93, 1.0), step(0.62, h1(id * 1.3))) * on * uNight * (0.4 + 0.6 * h1(id * 2.1)) * mix(1.0, 0.7, aa) * T + vC * vec3(0.03, 0.019, 0.01) * uNight * (1.0 - abs(n.y)) * (1.0 - vHf) * (1.0 - vHf) * T /* the street light on the lowest floors */; gl_FragColor = vec4(col, 1.0);' + ENC + '}'].join('\n') }); }
  /* the glowing line of the journey and the train's light, seen from high above */
  function glowMat(col) { return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uCol: { value: new V3(col[0], col[1], col[2]) }, uA: { value: 0 }, uExpo: U.uExpo, uHead: { value: 0 }, uTail: { value: 0 } },
    vertexShader: 'attribute float s; varying float vS; varying vec2 vUv; void main(){ vS = s; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uCol; uniform float uA, uExpo, uHead, uTail; varying float vS; varying vec2 vUv; void main(){ if (vS > uHead || vS < uTail) discard; float x = abs(vUv.y - 0.5) * 2.0; float a = (1.0 - smoothstep(0.0, 1.0, x)) * uA * (0.35 + 0.65 * smoothstep(uTail, uHead, vS)); gl_FragColor = vec4(uCol * a * uExpo, a); }' }); }
