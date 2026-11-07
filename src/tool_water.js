/* ===== [tool_water.js] ===== */
/* ===== The water of the high-pressure wash: a particle jet with real ballistics =====
   WaterJet.make(lance, keep, parent) hangs on the kit's lance (nozzle at its origin, jet along its +z). Each frame update(t, on, q, ground):
   droplets leave the nozzle in a narrow cone at 7–9 m/s, fly under gravity, strike the face at q (a wall, normal +z, or a floor, normal +y)
   and break into a splash — most bounce off in a flat fan and fall, a share sheets down the wall as run-off; a fine mist hangs in the
   air; a wet impact bloom with run-off streaks sits on the face under the jet; the stream itself is a bright core inside a hazy sheath
   whose streak texture scrolls with the flow. All positions are in the frame of the kit's parent group, the frame the lance is placed in.
   Scrubbing or freezing the animation (a time jump) restarts the particles with a short warm-up so a still frame shows a developed jet. */
var WaterJet = (function () {
  var texCache = {};
  function dropTex() {
    if (texCache.drop) return texCache.drop;
    var S = 64, c = mkCanvas(S, S), g = c.getContext('2d'), gr = g.createRadialGradient(S * 0.42, S * 0.4, 1, S / 2, S / 2, S / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.28, 'rgba(236,246,255,0.9)'); gr.addColorStop(0.6, 'rgba(200,225,245,0.45)'); gr.addColorStop(1, 'rgba(180,210,240,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S); texCache.drop = c; return c;
  }
  function streakTex() {
    if (texCache.streak) return texCache.streak;
    var W = 128, H = 256, c = mkCanvas(W, H), g = c.getContext('2d'), i, r = 7; function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; }
    g.clearRect(0, 0, W, H);
    for (i = 0; i < 46; i++) { var x = rnd() * W, w = 1 + rnd() * 3, a = 0.25 + rnd() * 0.6, y0 = rnd() * H, len = 30 + rnd() * 120; var gr = g.createLinearGradient(0, y0, 0, y0 + len); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.3, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x, y0, w, len); g.fillRect(x, y0 - H, w, len); g.fillRect(x, y0 + H, w, len); }
    texCache.streak = c; return c;
  }
  function bloomTex() {
    if (texCache.bloom) return texCache.bloom;
    var W = 128, H = 256, c = mkCanvas(W, H), g = c.getContext('2d'), i, r = 3; function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; }
    g.clearRect(0, 0, W, H);
    var gr = g.createRadialGradient(W / 2, 62, 2, W / 2, 62, 56); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.35, 'rgba(240,248,255,0.55)'); gr.addColorStop(1, 'rgba(220,235,250,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 130); // the wet bloom where the jet strikes
    for (i = 0; i < 22; i++) { var x = W * 0.25 + rnd() * W * 0.5, w = 1 + rnd() * 2.5, len = 60 + rnd() * 140, a = 0.2 + rnd() * 0.45; var g2 = g.createLinearGradient(0, 70, 0, 70 + len); g2.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g2.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = g2; g.fillRect(x, 70, w, len); } // the run-off streaks below it
    texCache.bloom = c; return c;
  }
  var VS = 'attribute float aSize; attribute float aAlpha; varying float vA; uniform float uScale; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = clamp(aSize * uScale / max(0.05, -mv.z), 1.0, 90.0); gl_Position = projectionMatrix * mv; vA = aAlpha; }';
  var FS = ['uniform sampler2D map; uniform vec3 color; varying float vA;', 'void main() {', 'vec4 t = texture2D(map, gl_PointCoord); if (t.a * vA < 0.015) discard; gl_FragColor = vec4(color * t.rgb, t.a * vA);', '#include <tonemapping_fragment>', '#include <encodings_fragment>', '}'].join('\n');
  function make(lance, keep, parent) {
    var N = window.SMALL3D ? 1500 : 2800, pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), age = new Float32Array(N), life = new Float32Array(N), kind = new Uint8Array(N), size = new Float32Array(N), alpha = new Float32Array(N), i;
    for (i = 0; i < N; i++) pos[i * 3 + 1] = -100;
    var geo = keep(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1)); geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1)); geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 50);
    var tex = keep(canvasTex(dropTex(), { srgb: false }));
    var mat = keep(new THREE.ShaderMaterial({ uniforms: { map: { value: tex }, color: { value: new THREE.Color(0xe9f4ff) }, uScale: { value: 1500 } }, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, depthTest: true, blending: THREE.NormalBlending }));
    var pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 6; parent.add(pts);
    /* the stream: a bright core in a scrolling hazy sheath, on the lance */
    var J = lance.userData.standoff ? lance.userData.standoff.jet : 0.3, jet = new THREE.Group(); lance.add(jet);
    var streak = keep(canvasTex(streakTex(), { wrap: THREE.RepeatWrapping, srgb: false })); streak.repeat.set(2, 1.5);
    var coreM = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })), hazeM = keep(new THREE.MeshBasicMaterial({ map: streak, color: 0xdff0ff, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    function cone(r0, r1, z0, z1, m, seg) { var g = new THREE.CylinderGeometry(r1, r0, z1 - z0, seg || 16, 1, true); g.rotateX(Math.PI / 2); g.translate(0, 0, (z0 + z1) / 2); var me = new THREE.Mesh(keep(g), m); me.renderOrder = 6; jet.add(me); return me; }
    cone(0.0022, 0.0055, 0.004, J * 0.98, coreM, 12); cone(0.005, 0.021, 0.01, J * 0.995, hazeM, 20);
    /* the wet bloom with its run-off on the face, in the parent frame */
    var bloomM = keep(new THREE.MeshBasicMaterial({ map: keep(canvasTex(bloomTex(), { srgb: false })), color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })), bloom = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.22, 0.44)), bloomM); bloom.renderOrder = 4; bloom.visible = false; parent.add(bloom);
    var on = false, lastT = null, seed = 12345, NZ = new THREE.Vector3(), DIR = new THREE.Vector3(), TX = new THREE.Vector3(), TY = new THREE.Vector3(), G = 9.81, mode = 'off', bloomA = 0;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    function spawnJet(k, f) { // f: fraction of the frame already flown
      var sp = 7.2 + rnd() * 1.8, a = rnd() * 6.283, r = Math.pow(rnd(), 1.6) * 0.055, cx = Math.cos(a) * r, cy = Math.sin(a) * r;
      vel[k * 3] = (DIR.x + TX.x * cx + TY.x * cy) * sp; vel[k * 3 + 1] = (DIR.y + TX.y * cx + TY.y * cy) * sp; vel[k * 3 + 2] = (DIR.z + TX.z * cx + TY.z * cy) * sp;
      pos[k * 3] = NZ.x + vel[k * 3] * f; pos[k * 3 + 1] = NZ.y + vel[k * 3 + 1] * f; pos[k * 3 + 2] = NZ.z + vel[k * 3 + 2] * f;
      age[k] = f; life[k] = 0.5; kind[k] = 1; size[k] = 0.008 + rnd() * 0.009; alpha[k] = 0.7;
    }
    function splash(k, q, wall) { // a jet droplet striking the face: a flat fan off the surface, some of it sheeting down
      var a = rnd() * 6.283, sp = 0.4 + Math.pow(rnd(), 1.6) * 2.1, up = rnd(), sheet = rnd() < 0.3, mist = rnd() < 0.12;
      if (mist) { // a share of every impact hangs as fine mist and drifts
        if (wall) pos[k * 3 + 2] = q.z + 0.02; else pos[k * 3 + 1] = q.y + 0.02;
        vel[k * 3] = (rnd() - 0.5) * 0.5; vel[k * 3 + 1] = 0.1 + rnd() * 0.35; vel[k * 3 + 2] = wall ? 0.1 + rnd() * 0.3 : (rnd() - 0.5) * 0.5;
        kind[k] = 4; age[k] = 0; life[k] = 0.9 + rnd() * 0.6; size[k] = 0.05 + rnd() * 0.06; alpha[k] = 0.16; return; }
      if (wall) { pos[k * 3 + 2] = q.z + 0.003; if (sheet) { vel[k * 3] = (rnd() - 0.5) * 0.25; vel[k * 3 + 1] = -0.2 - rnd() * 0.5; vel[k * 3 + 2] = 0; kind[k] = 3; } else { vel[k * 3] = Math.cos(a) * sp; vel[k * 3 + 1] = Math.sin(a) * sp * 0.9 + 0.3; vel[k * 3 + 2] = 0.15 + up * 0.9; kind[k] = 2; } }
      else { pos[k * 3 + 1] = q.y + 0.003; vel[k * 3] = Math.cos(a) * sp; vel[k * 3 + 2] = Math.sin(a) * sp; vel[k * 3 + 1] = 0.4 + up * 1.6; kind[k] = 2; }
      age[k] = 0; life[k] = kind[k] === 3 ? 1.2 : 0.45 + rnd() * 0.5; size[k] = 0.005 + Math.pow(rnd(), 1.4) * 0.014; alpha[k] = 0.6;
    }
    function step(dt, q, ground) {
      var wall = q && q.kind !== 'floor', k, emit = on ? Math.round(2600 * dt) : 0, next = 0;
      for (k = 0; k < N; k++) {
        if (kind[k]) { age[k] += dt; if (age[k] > life[k]) { kind[k] = 0; pos[k * 3 + 1] = -100; }
          else { var kk = kind[k], g = kk === 1 ? G * 0.6 : kk === 4 ? 0.25 : G; vel[k * 3 + 1] -= g * dt; if (kk === 3) { vel[k * 3 + 2] = 0; }
            pos[k * 3] += vel[k * 3] * dt; pos[k * 3 + 1] += vel[k * 3 + 1] * dt; pos[k * 3 + 2] += vel[k * 3 + 2] * dt;
            if (kk === 1 && q) { if (wall ? pos[k * 3 + 2] < q.z + 0.002 : pos[k * 3 + 1] < q.y + 0.002) splash(k, q, wall); }
            if (ground != null && pos[k * 3 + 1] < ground + 0.002) { kind[k] = 0; pos[k * 3 + 1] = -100; }
            if (kk === 1) alpha[k] = 0.7; else if (kk === 4) alpha[k] = 0.12 * Math.sin(Math.PI * Math.min(1, age[k] / life[k])); else alpha[k] = 0.62 * (1 - age[k] / life[k]) * (kk === 3 ? 0.6 : 1);
          } }
        else if (emit > 0) { spawnJet(k, rnd() * dt); emit--; }
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.aSize.needsUpdate = true; geo.attributes.aAlpha.needsUpdate = true;
    }
    function frame() { // the nozzle and the jet direction in the parent frame
      NZ.set(0, 0, 0).applyQuaternion(lance.quaternion).add(lance.position); DIR.set(0, 0, 1).applyQuaternion(lance.quaternion);
      TX.set(1, 0, 0).applyQuaternion(lance.quaternion); TY.set(0, 1, 0).applyQuaternion(lance.quaternion);
    }
    function update(t, active, q, ground) {
      on = !!active && mode === 'jet' && lance.visible; frame();
      var dt = lastT == null ? 0.033 : t - lastT, k;
      if (dt < 0 || dt > 0.25) { for (k = 0; k < N; k++) { kind[k] = 0; pos[k * 3 + 1] = -100; } var w; for (w = 0; w < 18; w++) step(0.03, q, ground); } // a jump in time: restart with a warm-up
      else { dt = Math.min(dt, 0.05); step(dt, q, ground); }
      lastT = t;
      streak.offset.y -= dt * 7; if (streak.offset.y < -100) streak.offset.y += 100;
      var target = on ? 1 : 0; bloomA += (target - bloomA) * Math.min(1, dt * 9);
      if (q && bloomA > 0.01) { bloom.visible = true; bloomM.opacity = 0.55 * bloomA; if (q.kind !== 'floor') { bloom.position.set(q.x, q.y - 0.13, q.z + 0.0015); bloom.rotation.set(0, 0, 0); } else { bloom.position.set(q.x, q.y + 0.0015, q.z + 0.05); bloom.rotation.set(-Math.PI / 2, 0, 0); } } else bloom.visible = false;
      pts.visible = true; jet.visible = on;
    }
    function setMode(m) { mode = m; jet.visible = m === 'jet' && lance.visible; if (m !== 'jet') on = false; }
    function setScale(px) { mat.uniforms.uScale.value = px; }
    return { update: update, setMode: setMode, setScale: setScale, points: pts };
  }
  return { make: make };
})();


