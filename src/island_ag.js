/* ===== [island_ag.js] ===== */
  /* ================= (v54) nothing may stand between the lens and her =================
     The follow camera keeps its arm clear of the boxes each city registers as solid, but not every slab, soffit, stair cheek, escalator side or
     roof is one of them; on a stair between two floors (and wherever a mesh was missed) a polygon could fill the view and hide her completely.
     Now every opaque surface of the city or the place she is in carries a small cut-out: a narrow cone round the line from the lens to her chest
     (from a little in front of the lens to a little short of her) is dithered away, softly at its rim. She is always seen; what was in the way
     shows as a clean opening round her, as in the games that do this. Off in the open the cone usually holds nothing and costs a few
     instructions per pixel. ================= */
  var OCU = { uOcP: { value: new THREE.Vector3() }, uOcC: { value: new THREE.Vector3() }, uOcR: { value: 0 }, uOcY: { value: 1.62 } };  /* her feet, the lens, her silhouette's half-width (0 = off), her height */
  var OC_V = 'varying vec3 vOcW;\n', OC_F = 'uniform vec3 uOcP, uOcC; uniform float uOcR, uOcY; varying vec3 vOcW;\n';
  var OC_MAINV = '\n{ vec4 ow = vec4(position, 1.0);\n#ifdef USE_INSTANCING\n ow = instanceMatrix * ow;\n#endif\n vOcW = (modelMatrix * ow).xyz; }\n';
  /* a fragment is cut only where it hides her: the ray from the lens through it passes, beyond it, within a body's width of her upright axis (feet to hat);
     the rim of that silhouette is dithered. A floor merely near the line of sight, a wall beside her, stay whole */
  var OC_MAINF = '\n if (uOcR > 0.0) { vec3 ord = vOcW - uOcC; float otf = length(ord); ord /= max(otf, 1e-4); vec2 oh = ord.xz; float ohl = dot(oh, oh); float ots = ohl > 1e-5 ? dot(uOcP.xz - uOcC.xz, oh) / ohl : (uOcP.y + 0.8 - uOcC.y) / min(ord.y, -1e-3); vec3 opc = uOcC + ord * ots; float odh = length(opc.xz - uOcP.xz); if (ots > otf + 0.3 && otf > 0.12 && odh < uOcR && opc.y > uOcP.y + 0.2 && opc.y < uOcP.y + uOcY) { vec2 oq = floor(gl_FragCoord.xy); if (odh < uOcR * 0.7 || mod(oq.x + oq.y, 2.0) < 1.0) discard; } }\n';
  var OC_RE = /void\s+main\s*\(\s*\)\s*\{/;
  /* (v55) the reflections of the floors: the planar reflection (island_ah) found at the fragment's own place on the screen, for every up-facing
     surface at the plane's height; its strength from the Fresnel term and the gloss, the wet ground and its puddles nearly a mirror, the rain's
     rings breaking it, a polished floor's faint grain; a rough dry floor keeps only a trace at grazing angles */
  var RFU = typeof ATMO !== 'undefined' ? ATMO.RFU : { kRf: { value: null }, kRfP: { value: new THREE.Vector4(0, 0, 1, 1) }, kRfK: { value: new THREE.Vector4(1, 0, 0, 0) }, kRfN: { value: null } };
  var RF_F = 'uniform sampler2D kRf, kRfN; uniform vec4 kRfP, kRfK;\n';
  var RF_MAIN = ['#ifdef KRF', ' if (kRfP.y > 0.5) { vec3 rN = normalize(cross(dFdx(vOcW), dFdy(vOcW))); float rM = smoothstep(0.9, 0.985, abs(rN.y)) * (1.0 - smoothstep(0.06, 0.26, abs(vOcW.y - kRfP.x)));',
    '  if (rM > 0.003) { vec3 rV = normalize(cameraPosition - vOcW); float rCos = clamp(rV.y, 0.0, 1.0);',
    '#ifdef STANDARD', '   float rR = roughnessFactor, rMe = metalnessFactor;', '#else', '   float rR = 0.75, rMe = 0.0;', '#endif',
    '   vec4 rNz = texture2D(kRfN, vOcW.xz * 0.045), rNz2 = texture2D(kRfN, vOcW.xz * 0.21 + 0.3); float rPud = smoothstep(0.52, 0.6, rNz.r * 0.75 + rNz2.b * 0.25 + kRfK.y * 0.3 - 0.1) * kRfK.y; float rWet = max(kRfK.y * 0.5, rPud);',
    '   float rG = clamp(max((1.0 - rR) * (1.0 - rR) * 1.5, rWet), 0.0, 1.0); float rF = 0.04 + 0.96 * pow(1.0 - rCos, 5.0); float rK = rM * clamp(mix(rF * 0.08, 0.05 + 0.95 * rF, rG) * kRfK.x, 0.0, 0.88);',
    '   vec2 rOff = (rNz2.xy - 0.5) * 0.003 * (1.0 - rWet); if (kRfK.z > 0.01) { vec2 cp = vOcW.xz * 2.2; vec2 ci = floor(cp), cf = fract(cp) - 0.5; float ph = fract(kRfK.w * 1.1 + fract(sin(dot(ci, vec2(12.9898, 78.233))) * 43758.5)); float rr = length(cf), rad = ph * 0.48; float ring = sin((rr - rad) * 70.0) * exp(-pow((rr - rad) * 14.0, 2.0)) * (1.0 - ph); rOff += cf / max(rr, 1e-3) * ring * 0.007 * kRfK.z * rWet; }',
    '   vec2 ruv = gl_FragCoord.xy * kRfP.zw + rOff; float rb = (1.0 - rG) * 0.009 + (rWet - rPud) * 0.006 + 0.0012; vec3 rC = texture2D(kRf, ruv).rgb * 0.4 + (texture2D(kRf, ruv + vec2(rb, rb * 0.6)).rgb + texture2D(kRf, ruv - vec2(rb, rb * 0.6)).rgb + texture2D(kRf, ruv + vec2(-rb * 0.6, rb)).rgb + texture2D(kRf, ruv + vec2(rb * 0.6, -rb)).rgb) * 0.15;',
    '   rC *= mix(vec3(1.0), diffuseColor.rgb * 1.3, rMe); outgoingLight = mix(outgoingLight, rC, rK); } }', '#endif', ''].join('\n');
  var RF_OK = function () { return typeof R3 !== 'undefined' && R3 && R3.capabilities.isWebGL2 && TIER !== 'low'; };
  function occHook(m) { if (!m || m.userData.occ) return; var k0 = ''; try { k0 = m.customProgramCacheKey(); } catch (e) { k0 = ''; } m.userData.occ = 1; var prev = m.onBeforeCompile;
    m.onBeforeCompile = function (s, r) { if (prev) prev.call(m, s, r); if (!OC_RE.test(s.vertexShader) || !OC_RE.test(s.fragmentShader)) return; s.uniforms.uOcP = OCU.uOcP; s.uniforms.uOcC = OCU.uOcC; s.uniforms.uOcR = OCU.uOcR; s.uniforms.uOcY = OCU.uOcY;
      s.vertexShader = OC_V + s.vertexShader.replace(OC_RE, function (t) { return t + OC_MAINV; }); s.fragmentShader = OC_F + s.fragmentShader.replace(OC_RE, function (t) { return t + OC_MAINF; });
      if (rf && s.fragmentShader.indexOf('#include <output_fragment>') >= 0) { s.uniforms.kRf = RFU.kRf; s.uniforms.kRfN = RFU.kRfN; s.uniforms.kRfP = RFU.kRfP; s.uniforms.kRfK = RFU.kRfK; s.fragmentShader = '#define KRF\n' + RF_F + s.fragmentShader.replace('#include <output_fragment>', RF_MAIN + '#include <output_fragment>'); } };
    var rf = RF_OK(); m.customProgramCacheKey = function () { return k0 + (rf ? '|occR' : '|occ'); }; m.needsUpdate = true; }
  /* every opaque, depth-writing surface of a place (not the water, the sky, the glows, the lines, the see-through glass) */
  function occPrep(c) { if (!c || !c.g || c.occDone) return; c.occDone = true; c.g.traverse(function (o) { if (!o.isMesh || o.isPoints || o.isLine || o.isSprite) return; var ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach(function (m) { if (!m || m.isShaderMaterial || m.isRawShaderMaterial || m.isPointsMaterial || m.isLineBasicMaterial || m.isSpriteMaterial) return; if (m.transparent && m.opacity < 0.98) return; if (m.depthWrite === false || m.blending === THREE.AdditiveBlending) return; occHook(m); }); }); }
  var _tkCameraAG = tkCamera; tkCamera = function (dt, snap) { if (TK && !TK.occDone) { try { occPrep(TK); } catch (e) { if (window.ISLE_TEST) throw e; } } _tkCameraAG(dt, snap);
    OCU.uOcC.value.copy(cam.position); OCU.uOcP.value.set(pos.x, pos.y, pos.z); OCU.uOcY.value = 1.62; OCU.uOcR.value = TC.hid || !luna.root.visible ? 0 : 0.62; };
  var _cameraAG = camera; camera = function (dt, snap) { OCU.uOcR.value = 0; return _cameraAG(dt, snap); };
  window.ISLE_x.occ = function () { return { r: OCU.uOcR.value, done: !!(TK && TK.occDone) }; };
