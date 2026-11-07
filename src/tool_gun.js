/* ===== [tool_gun.js] ===== */
/* ===== The caulking gun of every sealing animation: TAJIMA コンボイジャスト CNV-JUST (rotary cartridge gun, 330 ml, 605 g) =====
   Modelled after the manufacturer's product photographs (jpn.tajimatool.co.jp/product/4975364066930): the yellow open half-barrel cradle with
   its two rails and the "JUST" side print, the yellow U-shaped front ring the nozzle passes through, the yellow rotary collar at the rear,
   the black die-cast rear frame with the belt hook on top, the black engineering-plastic grip with its cut-out and the wide curved trigger,
   the black round push rod with its end knob, and — in the cradle — a 330 ml cartridge with the product label and its nozzle cut at 45°.
   Conventions of the kit: the nozzle tip at the origin, the body along +z, the grip hanging in −y; the group starts hidden and is added to
   the kit's parent. Real proportions: length 370 mm, height 220 mm, cartridge up to 216 × ⌀50 mm. Polygons: ~14 k triangles, smooth
   normals, bevelled extrusions; the materials are physically based (the yellow enamel, black polymer, black-oxide steel, paper cartridge). */
var TajimaGun = (function () {
  var YEL = 0xe9b60e, BLK = 0x141517, tex = {};
  function labelTex(name, sub, flip) {
    var key = name + '|' + sub + '|' + (flip ? 1 : 0); if (tex[key]) return tex[key];
    var W = 512, H = 1024, c = mkCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e4e1d8'; g.fillRect(0, 0, W, 26); g.fillRect(0, H - 26, W, 26); g.fillStyle = '#f97b00'; g.fillRect(0, 26, W, 14); // the rims and the brand stripe
    g.save(); if (flip) { g.translate(W, 0); g.rotate(Math.PI / 2); } else { g.translate(0, H); g.rotate(-Math.PI / 2); } // the text runs along the cartridge
    [0, 256].forEach(function (u) { // the label printed twice round the cartridge, so the name is read from either side
      g.fillStyle = '#231f20'; g.font = '700 64px Arial, Helvetica, sans-serif'; g.textBaseline = 'middle'; g.fillText('AUTON', 70, u + 62);
      g.font = '300 54px Arial, Helvetica, sans-serif'; g.fillText(name, 70 + g.measureText('AUTON').width * 1.62, u + 62);
      g.font = '400 22px Arial, Helvetica, sans-serif'; g.fillStyle = '#4a4a4a'; g.fillText(sub, 70, u + 112);
      g.fillStyle = '#a3a19b'; var y, i; for (i = 0; i < 4; i++) { y = u + 140 + i * 20; g.fillRect(70, y, 220 + (i * 97) % 300, 5); }
      g.fillStyle = '#231f20'; g.font = '700 34px Arial, Helvetica, sans-serif'; g.fillText('320 ml', H - 230, u + 112);
      g.fillStyle = '#b5b2aa'; g.font = '400 17px Arial, Helvetica, sans-serif'; g.fillText('AUTO CHEMICAL INDUSTRY CO., LTD.  MADE IN JAPAN', 70, u + 232);
    });
    g.restore();
    var t = canvasTex(c, { wrap: THREE.RepeatWrapping }); tex[key] = t; return t;
  }
  function sideTex() {
    if (tex.side) return tex.side;
    var W = 1024, H = 128, c = mkCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, W, H);
    g.fillStyle = '#111111'; g.fillRect(0, 54, W, 20); // the black groove along the rail
    g.font = 'italic 900 78px Arial, Helvetica, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#111111'; g.fillText('JUST', 560, 64);
    g.font = '700 26px Arial, Helvetica, sans-serif'; g.fillText('CONVOY', 400, 64); g.fillStyle = '#d3170f'; g.fillText('TAJIMA', 120, 64);
    var t = canvasTex(c, { wrap: THREE.ClampToEdgeWrapping }); tex.side = t; return t;
  }
  function annulus(r0, r1, a0, a1) { var s = new THREE.Shape(); s.absarc(0, 0, r1, a0, a1, false); s.absarc(0, 0, r0, a1, a0, true); return s; }
  function build(keep, parent, o) {
    o = o || {}; var g = new THREE.Group(), name = o.name || 'EXCEED', sub = o.sub || 'One-component polyurethane sealant · Non-Bleed · LS polymer';
    function mat(p) { return keep(new THREE.MeshStandardMaterial(p)); }
    function coat(p) { return keep(new THREE.MeshPhysicalMaterial(p)); } // painted and moulded parts: a clear coat over the colour
    function add(geo, m, pos, rot) { var me = new THREE.Mesh(keep(geo), m); if (pos) me.position.set(pos[0], pos[1], pos[2]); if (rot) me.rotation.set(rot[0], rot[1], rot[2]); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; }
    function alongZ(geo, z0, z1) { geo.rotateX(Math.PI / 2); geo.translate(0, 0, (z0 + z1) / 2); return geo; }
    function extrudeZ(shape, z0, z1, m, bevel) { var geo = new THREE.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: !!bevel, bevelSize: bevel || 0, bevelThickness: bevel || 0, bevelSegments: 2, curveSegments: 28 }); geo.translate(0, 0, z0); return add(geo, m); }
    function side(shape, width, bevel, m, segs) { var geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: segs || 20 }); geo.rotateY(-Math.PI / 2); geo.translate(width / 2, 0, 0); return add(geo, m); } // a profile drawn in (z, y), extruded across x and centred
    var yellow = coat({ color: YEL, roughness: 0.4, metalness: 0, envMapIntensity: 0.55, clearcoat: 0.7, clearcoatRoughness: 0.28 }), yellowD = coat({ color: 0xcf9d0a, roughness: 0.45, envMapIntensity: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.35 });
    var poly = coat({ color: BLK, roughness: 0.6, metalness: 0, envMapIntensity: 0.3, clearcoat: 0.25, clearcoatRoughness: 0.5 }), cast = mat({ color: 0x1e2022, roughness: 0.5, metalness: mt(0.35), envMapIntensity: 0.35 });
    var rodM = mat({ color: 0x26282b, roughness: 0.36, metalness: mt(0.7), envMapIntensity: 0.6 }), rivet = mat({ color: 0xc9ccd0, roughness: 0.3, metalness: mt(0.85), envMapIntensity: 1.1 });
    var cartM = mat({ map: labelTex(name, sub, o.flip !== false), roughness: 0.62, envMapIntensity: 0.35 }), cartEnd = mat({ color: 0xe6e2d6, roughness: 0.7 }), nozzleM = mat({ color: 0xe9e4d3, roughness: 0.45, envMapIntensity: 0.5, transparent: true, opacity: 0.94 });
    var sideM = mat({ map: sideTex(), transparent: true, roughness: 0.4, envMapIntensity: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }), sideT2 = keep(sideTex().clone()); sideT2.repeat.x = -1; sideT2.offset.x = 1; sideT2.needsUpdate = true;
    var sideML = mat({ map: sideT2, transparent: true, roughness: 0.4, envMapIntensity: 0.6, polygonOffset: true, polygonOffsetFactor: -2 });
    /* ---- the cartridge and its nozzle (a 216 × ⌀49 mm paper cartridge; the nozzle cut at 45° to the bead width) ---- */
    var RC = 0.0245, ZF = 0.092, ZB = ZF + 0.216; // the cartridge from ZF to ZB
    var nz = new THREE.CylinderGeometry(0.0128, 0.0038, 0.078, 36, 1, true); nz.rotateX(Math.PI / 2); nz.translate(0, 0, 0.039); // the small end at the tip (z = 0)
    (function () { var p = nz.attributes.position, i, x, y, z; for (i = 0; i < p.count; i++) { x = p.getX(i); y = p.getY(i); z = p.getZ(i); if (z < 0.012) { var k = Math.max(0, (0.012 - z) / 0.012); p.setZ(i, z + k * 0.006 * (1 - y / 0.0038)); } } p.needsUpdate = true; nz.computeVertexNormals(); })(); // the 45° cut of the tip
    add(nz, nozzleM);
    add(new THREE.CircleGeometry(0.0038, 24), nozzleM, [0, 0, 0.0005], [Math.PI, 0, 0]);
    add(alongZ(new THREE.CylinderGeometry(0.017, 0.0128, 0.006, 36), 0.078, 0.084), nozzleM); // the nozzle base flange
    add(alongZ(new THREE.CylinderGeometry(0.017, 0.017, 0.008, 36), 0.084, ZF), cartEnd); // the thread collar of the cartridge
    add(alongZ(new THREE.CylinderGeometry(RC, 0.017, 0.012, 48), ZF - 0.002, ZF + 0.01), cartEnd); // the shoulder
    var cart = add(alongZ(new THREE.CylinderGeometry(RC, RC, ZB - ZF - 0.012, 64, 1, false), ZF + 0.01, ZB - 0.002), cartM); cart.receiveShadow = true;
    add(alongZ(new THREE.CylinderGeometry(RC - 0.003, RC, 0.004, 48), ZB - 0.002, ZB + 0.002), cartEnd); // the rear rim of the cartridge
    /* ---- the yellow cradle: an open half-barrel (the lower 205°) with a rail along each top edge, "JUST" printed on the right rail ---- */
    var a0 = Math.PI * 1.5 - Math.PI * 0.57, a1 = Math.PI * 1.5 + Math.PI * 0.57, Z0 = 0.088, Z1 = 0.318;
    extrudeZ(annulus(0.0265, 0.0298, a0, a1), Z0 + 0.012, Z1 - 0.004, yellow);
    [a0, a1].forEach(function (a) { var r = 0.0282, rail = add(new THREE.BoxGeometry(0.0075, 0.0068, Z1 - Z0 - 0.016), yellow, [Math.cos(a) * r, Math.sin(a) * r, (Z0 + Z1) / 2 + 0.004], [0, 0, a - Math.PI / 2]); rail.geometry.translate(0, 0, 0); });
    var deco = add(new THREE.PlaneGeometry(0.19, 0.0238), sideM, [0.0302, -0.006, (Z0 + Z1) / 2 + 0.01], [0, Math.PI / 2, 0]); deco.castShadow = false; // the print on the right side
    var decoL = add(new THREE.PlaneGeometry(0.19, 0.0238), sideM, [-0.0302, -0.006, (Z0 + Z1) / 2 + 0.01], [0, -Math.PI / 2, 0]); decoL.castShadow = false;
    /* the front ring: a U open at the top the nozzle drops through, with a small lip the cartridge shoulder bears on */
    extrudeZ(annulus(0.0178, 0.0325, Math.PI * 1.5 - Math.PI * 0.66, Math.PI * 1.5 + Math.PI * 0.66), Z0 - 0.002, Z0 + 0.013, yellow, 0.0008);
    extrudeZ(annulus(0.0265, 0.0325, Math.PI * 1.5 - Math.PI * 0.66, Math.PI * 1.5 + Math.PI * 0.66), Z0 - 0.006, Z0 - 0.002, yellowD);
    /* the rotary collar at the rear: a full knurled ring the cradle turns with, on a black bearing */
    add(alongZ(new THREE.CylinderGeometry(0.0335, 0.0335, 0.019, 64), Z1 - 0.004, Z1 + 0.015), yellow);
    add(alongZ(new THREE.CylinderGeometry(0.0345, 0.0335, 0.003, 64), Z1 + 0.015, Z1 + 0.018), yellowD);
    (function () { var i, n = 18; for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2; add(new THREE.BoxGeometry(0.004, 0.0024, 0.014), yellowD, [Math.cos(a) * 0.0338, Math.sin(a) * 0.0338, Z1 + 0.0055], [0, 0, a + Math.PI / 2]); } })();
    add(alongZ(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 48), Z1 + 0.018, Z1 + 0.024), cast);
    /* ---- the black rear frame (die-cast): the body the rod passes through, the belt hook on top, two rivets ---- */
    var ZR = Z1 + 0.024; // the front face of the rear frame
    var body = new THREE.Shape(); body.moveTo(ZR, -0.052); body.lineTo(ZR, 0.03); body.quadraticCurveTo(ZR + 0.004, 0.038, ZR + 0.014, 0.038); body.lineTo(ZR + 0.036, 0.036); body.quadraticCurveTo(ZR + 0.046, 0.034, ZR + 0.046, 0.022); body.lineTo(ZR + 0.044, -0.03); body.lineTo(ZR + 0.03, -0.056); body.lineTo(ZR + 0.004, -0.058); body.lineTo(ZR, -0.052);
    side(body, 0.044, 0.0025, cast, 12);
    (function () { var hook = new THREE.Shape(); hook.moveTo(ZR + 0.014, 0.036); hook.lineTo(ZR + 0.014, 0.084); hook.quadraticCurveTo(ZR + 0.014, 0.092, ZR + 0.022, 0.092); hook.lineTo(ZR + 0.05, 0.092); hook.lineTo(ZR + 0.05, 0.084); hook.lineTo(ZR + 0.026, 0.084); hook.quadraticCurveTo(ZR + 0.022, 0.084, ZR + 0.022, 0.08); hook.lineTo(ZR + 0.022, 0.036); hook.lineTo(ZR + 0.014, 0.036); side(hook, 0.012, 0.001, cast, 8); })();
    [[ZR + 0.012, 0.012], [ZR + 0.034, -0.036]].forEach(function (p) { add(new THREE.CylinderGeometry(0.0045, 0.0045, 0.047, 20), rivet, [0, p[1], p[0]], [0, 0, Math.PI / 2]); });
    /* the pressure release catch behind the hook and the rod guide */
    add(new THREE.BoxGeometry(0.012, 0.006, 0.02), poly, [0, 0.03, ZR + 0.052], [0.35, 0, 0]);
    /* ---- the grip: black engineering plastic, raked back 18°, hollowed with a cut-out; the trigger in front of it ---- */
    var GT = -0.05, GB = -0.168, rake = 0.022; // the top and bottom of the grip, the rake (mm the bottom sits further back)
    var grip = new THREE.Shape(); grip.moveTo(ZR + 0.008, GT); grip.lineTo(ZR + 0.044, GT); grip.lineTo(ZR + 0.046 + rake, GB + 0.018); grip.quadraticCurveTo(ZR + 0.046 + rake, GB, ZR + 0.03 + rake, GB); grip.lineTo(ZR + 0.012 + rake, GB + 0.004); grip.quadraticCurveTo(ZR + 0.004 + rake, GB + 0.008, ZR + 0.004 + rake, GB + 0.02); grip.lineTo(ZR + 0.008, GT);
    var hole = new THREE.Path(); hole.absellipse(ZR + 0.028 + rake * 0.6, GB + 0.058, 0.0075, 0.02, 0, Math.PI * 2, false, 0); grip.holes.push(hole);
    side(grip, 0.03, 0.0035, poly, 20);
    /* the trigger: a wide curved lever pivoted at the top of the frame, bowed forward, with a finger stop at its end */
    var TP = -0.046, TB = -0.152, tz = ZR - 0.004; // pivot height, tip height, the pivot's z
    var trig = new THREE.Shape(); trig.moveTo(tz + 0.002, TP + 0.006); trig.lineTo(tz + 0.012, TP + 0.006); trig.quadraticCurveTo(tz - 0.009, TP - 0.05, tz - 0.013, TB + 0.012); trig.quadraticCurveTo(tz - 0.014, TB - 0.003, tz - 0.004, TB - 0.005); trig.lineTo(tz - 0.001, TB - 0.004); trig.quadraticCurveTo(tz - 0.008, TB + 0.004, tz - 0.007, TB + 0.012); trig.quadraticCurveTo(tz - 0.004, TP - 0.04, tz + 0.002, TP + 0.006);
    side(trig, 0.024, 0.0015, poly, 20);
    add(new THREE.CylinderGeometry(0.004, 0.004, 0.032, 16), rivet, [0, TP + 0.004, tz + 0.008], [0, 0, Math.PI / 2]); // the trigger pivot
    /* ---- the push rod: black-oxide round steel, out of the back by the sealant still in the cartridge; the knob at its end ---- */
    var rod = add(alongZ(new THREE.CylinderGeometry(0.0047, 0.0047, 0.24, 20), 0, 0.24), rodM); rod.position.z = ZR + 0.046; rod.userData.z0 = ZR + 0.046;
    var knob = add(alongZ(new THREE.CylinderGeometry(0.011, 0.0095, 0.022, 28), 0, 0.022), poly); knob.position.z = ZR + 0.046 + 0.24;
    var plate = add(alongZ(new THREE.CylinderGeometry(0.0225, 0.0225, 0.006, 40), 0, 0.006), cast); plate.position.z = ZB - 0.02; // the pressure plate in the cartridge
    g.userData.setRod = function (f) { f = Math.max(0, Math.min(1, f == null ? 1 : f)); var out = 0.045 + 0.17 * f; rod.position.z = ZR - 0.19 + out; knob.position.z = rod.position.z + 0.24 - 0.002; plate.position.z = ZB - 0.02 - (1 - f) * 0.19; };
    g.userData.setRod(1);
    var curLabel = name + '|' + sub; g.userData.setLabel = function (nm, sb) { nm = nm || name; sb = sb || sub; if (nm + '|' + sb === curLabel) return; curLabel = nm + '|' + sb; cartM.map = labelTex(nm, sb, o.flip !== false); cartM.needsUpdate = true; };
    g.userData.tajima = true; g.visible = false; if (parent) parent.add(g); return g;
  }
  return { build: build, labelTex: labelTex };
})();
/* ===== Textures for the kit's tools: the nap of a roller cover (so its spin is seen as it rolls) ===== */
var ToolTex = (function () {
  var cache = {};
  function napCanvas() {
    if (cache.nap) return cache.nap;
    var S = 256, c = mkCanvas(S, S), g = c.getContext('2d'), i, r = 1;
    function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; }
    g.fillStyle = '#ece5d2'; g.fillRect(0, 0, S, S);
    for (i = 0; i < 9000; i++) { var x = rnd() * S, y = rnd() * S, l = 200 + Math.floor(rnd() * 50); g.fillStyle = 'rgba(' + l + ',' + (l - 10) + ',' + (l - 30) + ',0.55)'; g.fillRect(x, y, 1 + rnd() * 1.5, 1 + rnd() * 2.5); }
    g.strokeStyle = 'rgba(120,110,90,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, S); g.stroke(); // the seam of the cover
    g.strokeStyle = 'rgba(120,110,90,0.12)'; g.lineWidth = 1; for (i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, i * S / 6); g.lineTo(S, i * S / 6); g.stroke(); }
    cache.nap = c; return c;
  }
  function nap(keep) { var c = napCanvas(), t = keep(canvasTex(c, { wrap: THREE.RepeatWrapping, repeat: [1, 2] })), b = keep(canvasTex(c, { wrap: THREE.RepeatWrapping, repeat: [1, 2], srgb: false })); return keep(new THREE.MeshStandardMaterial({ map: t, bumpMap: b, bumpScale: 0.0015, color: 0xf2ece0, roughness: 0.98, envMapIntensity: 0.15 })); }
  return { nap: nap };
})();


