/* ===== [mod_po.js] ===== */
/* ===== PROTECT ONE guide: the view =====
   Cover with the 3D title object (the block-wall sample), the four points, substrates and uses, the catalogue's demonstrations, the procedure
   with the stage player (sectioned block wall) and 3D-rendered stills, the inspection model, product data with the TBC list, the take-off. */
var PO = (function () {
  var H = UX._h, scn = PO_ORDER[0], stage = 0, m3d = 0, sub = 'mortar', xray = false, micro = false, built = false, insp = null, secView = null, heroView = null, heroAsked = false, snaps = {}, snapBusy = false, snapRedo = false, timer = 0, secTween = false, secShown = '';
  var q = { area: 20, cov: 250, coats: 2, waste: 10, price: 0, cur: 'TWD', sub: 'mortar' }, covTouched = false;
  try { var st = JSON.parse(localStorage.getItem('ac-guide-po') || 'null'); if (st) { if (st.q) { for (var k in q) if (st.q[k] != null && typeof st.q[k] === typeof q[k]) q[k] = st.q[k]; } covTouched = !!st.covTouched; if (!covTouched) { q.cov = PO_SPEC.rate * 1000; q.coats = PO_SPEC.coats; } if (PO_SUBS.indexOf(st.sub) >= 0) sub = st.sub; if (PO_ORDER.indexOf(st.scn) >= 0) scn = st.scn; } } catch (e) {}
  if (PO_SUBS.indexOf(q.sub) < 0) q.sub = 'mortar';
  function save() { try { localStorage.setItem('ac-guide-po', JSON.stringify({ q: q, sub: sub, scn: scn, covTouched: covTouched })); } catch (e) {} }
  function nf(v, d) { return H.nf(v, d); } function num(v) { return H.num(v); } function fmtS(s, v) { return H.fmtS(s, v); }
  function SC() { return tr('po.scn')[scn]; } // the texts of the chosen scenario
  function LB() { var base = tr('po.lb'), o = SC().lb || {}, r = {}, k; for (k in base) r[k] = base[k]; for (k in o) r[k] = o[k]; return r; } // the callout labels, the scenario's own over the shared ones
  function capOf(st) { var c = SC().cap || {}; return c[st] || tr('po.capT')[st]; }
  function scnbar(id) { return '<div class="scnbar"><label class="scnbar__label" for="' + id + '" data-po="po.bar"></label><div class="scnbar__sel"><svg class="scnbar__icon" viewBox="0 0 56 40" aria-hidden="true"></svg><select id="' + id + '" class="scnbar__select" data-po-scnsel></select></div><a class="sb-link scnbar__all" href="#poScn" data-po="po.bar.all"></a></div>'; }
  function head(id, label, title) { return '<div class="sec-head"><div><p class="sec-head__kicker" data-po="' + label + '"></p><h2 class="sec-head__h" data-po="' + title + '"></h2></div>' + RING_SVG + '</div>'; }
  function icoBtn(id, label, path) { return '<button class="sb-btn sb-btn--secondary sb-btn--icon" type="button" id="' + id + '" data-po-aria="' + label + '" aria-label="' + esc(tr(label) || label) + '" title="' + esc(tr(label) || label) + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="' + path + '"/></svg></button>'; }
  function stages() { return PO_STAGES; }
  function stName(s) { return tr('po.stages')[s]; }

  /* ---------- the shell ---------- */
  function shell() {
    var h = '';
    h += '<section class="cover" id="po-top"><div class="wrap"><div class="cover__grid"><div><p class="cover__kicker" data-po="po.kicker"></p><h1 class="cover__title"><span data-po="po.title"></span><span class="en" data-po="po.titleEn"></span></h1><p class="cover__sub" data-po="po.sub"></p><p class="cover__tag" data-po="po.tag"></p><p class="cover__intro" data-po="po.intro"></p><p class="cover__claim" data-po="po.claim"></p>' +
      '<div class="cover__actions"><a class="sb-btn sb-btn--primary sb-btn--lg" href="#po-points" data-po="po.btn1"></a><a class="sb-btn sb-btn--secondary sb-btn--lg" href="#po-calculator" data-po="po.btn2"></a><a class="sb-link" href="' + PO_FILES.cat + '" target="_blank" rel="noopener" data-po="po.btn3"></a></div></div>' +
      '<div class="cover__side">' + RING_SVG + '<figure class="cr-hero"><div class="cr-hero__pic" id="poHeroPic"><canvas id="poHeroCanvas" role="img" hidden></canvas><div class="cr-hero__vec" id="poHeroVec"></div><div class="cr-hero__marks" id="poHeroMarks" hidden></div><div class="m3d-hint cr-hero__hint" id="poHeroHint" data-po="po.hero.hint" hidden></div></div><figcaption><p class="cover__cap" data-po="po.photoCap"></p><p class="cr-hero__lead" data-po="po.hero.legend"></p><ol class="cr-hero__legend" id="poHeroLegend"></ol></figcaption></figure></div></div><div class="stats" id="poStats"></div></div></section>';
    h += '<div class="strip"><div class="wrap"><div class="strip__grid" id="poStrip"></div></div></div>';
    h += '<section class="sec" id="po-points"><div class="wrap">' + head('p', 'po.pt.label', 'po.pt.title') + '<p class="sec-sub" data-po="po.pt.sub"></p><div class="points" id="poPoints"></div></div></section>';
    h += '<section class="sec sec--band" id="po-substrates"><div class="wrap">' + head('s', 'po.sb.label', 'po.sb.title') + '<p class="sec-sub" data-po="po.sb.sub"></p><div class="subs" id="poSubs" role="tablist"></div><div class="sub-panel" id="poSubPanel" role="tabpanel" aria-live="polite"></div><h3 class="sub-h" data-po="po.sb.usesH"></h3><div class="pictos" id="poUses" style="margin-top:0"></div></div></section>';
    h += '<section class="sec" id="po-scenarios"><div class="wrap"><div class="scn" id="poScn"><div class="scn__head"><p class="label" data-po="po.scn.label"></p><h2 class="scn__title" data-po="po.scn.title"></h2><p class="scn__sub" data-po="po.scn.sub"></p></div><div class="scn__tiles cr-tiles wp-tiles ux-tiles" id="poTiles" role="tablist"></div><div class="scn__panel" id="poPanel" role="tabpanel" aria-live="polite"></div></div></div></section>';
    h += '<section class="sec sec--band" id="po-tests"><div class="wrap">' + head('e', 'po.ts.label', 'po.ts.title') + '<p class="sec-sub" data-po="po.ts.sub"></p><div class="tests" id="poTests"></div></div></section>';
    h += '<section class="sec" id="po-procedure"><div class="wrap">' + head('t', 'po.tl.label', 'po.tl.title') + scnbar('poSelProc') +
      '<div class="cr-build cr-build--wide"><div class="cr-build__fig"><div class="cr-stagebar"><button class="sb-btn sb-btn--primary sb-btn--icon" type="button" id="poPlay"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path id="poPlayIcon" d="M3 1l11 7-11 7z" fill="currentColor"/></svg></button>' + icoBtn('poPrev', 'po.prev', 'M15 5l-7 7 7 7') + '<div class="seg seg--scroll" id="poStages" role="group"></div>' + icoBtn('poNext', 'po.next', 'M9 5l7 7-7 7') + '</div><div class="diagram cr-diagram" id="poDiagram"></div><div class="cr-colist" id="poCoList" hidden></div><div class="cr-cap" aria-live="polite"><p class="cr-cap__n" id="poCapN"></p><p class="cr-cap__t" id="poCapT"></p></div></div></div>' +
      '<div class="tl-bar"><p class="sec-sub" id="poTlSub"></p><div class="tl-ctrl">' + icoBtn('poTlPrev', 'po.tl.prev', 'M15 5l-7 7 7 7') + icoBtn('poTlNext', 'po.tl.next', 'M9 5l7 7-7 7') + '</div></div><div class="tl" id="poTl" tabindex="0"></div></div></section>';
    h += '<section class="sec sec--band" id="po-model3d"><div class="wrap">' + head('m', 'po.m3d.label', 'po.m3d.title') + '<p class="sec-sub" id="poM3dSub"></p>' + scnbar('poSelM3d') + '<div class="m3d-bar"><div class="seg seg--scroll" id="poM3dTabs" role="group"></div><div class="m3d-tools"><button class="sb-btn sb-btn--secondary" type="button" id="poXray" aria-pressed="false" data-po="po.m3d.xray"></button><button class="sb-btn sb-btn--secondary" type="button" id="poMicro" aria-pressed="false" data-po="po.m3d.micro"></button>' + icoBtn('poZoomIn', 'po.m3d.zin', 'M12 5v14M5 12h14') + icoBtn('poZoomOut', 'po.m3d.zout', 'M5 12h14') + '<button class="sb-btn sb-btn--secondary" type="button" id="poReset" data-po="po.m3d.reset"></button></div></div>' +
      '<div class="stage3d" id="poM3dStage" style="background:var(--white)"><canvas role="img"></canvas><div class="stage3d__cap"><div class="stage3d__capbox"><span id="poM3dNum">—</span><span id="poM3dCap"></span></div></div><div class="m3d-hint" data-po="po.m3d.hint"></div><div class="stage3d__fallback" id="poM3dFallback" hidden data-po="po.m3d.fallback"></div></div><p class="m3d-note muted" id="poM3dNote" hidden></p><div class="callouts" id="poCallouts"></div></div></section>';
    h += '<section class="gate" id="po-handson"><div class="wrap"><div class="gate__grid"><div><p class="gate__eyebrow" data-po="hs.eyebrow"></p><h2 class="gate__title" id="poHsTitle"></h2><p class="gate__desc" id="poHsDesc"></p><div class="cover__actions"><button class="sb-btn sb-btn--primary sb-btn--lg" type="button" id="poHsOpen" data-po="hs.btn"></button></div></div><div><div class="gate__meta" id="poHsMeta"></div><p class="gate__foot" data-po="hs.foot"></p></div></div></div></section>';
    h += '<section class="sec" id="po-products"><div class="wrap">' + head('d', 'po.prod.label', 'po.prod.title') + '<p class="sec-sub" data-po="po.prod.sub"></p><div class="cr-prod" id="poProd"></div></div></section>';
    h += '<section class="sec sec--band" id="po-calculator"><div class="wrap">' + head('c', 'po.calc.label', 'po.calc.title') + '<p class="sec-sub" data-po="po.calc.sub"></p><div class="calc cr-calc"><form class="calc__form" id="poCalcForm" novalidate></form><div class="calc__preview" id="poCalcOut" aria-live="polite"></div></div></div></section>';
    h += '<section class="sec" id="po-related"><div class="wrap"><h3 class="sub-h" data-po="po.rel.title" style="margin-top:0"></h3><p class="sec-sub" data-po="po.rel.sub" style="margin-bottom:0"></p><div class="prows" id="poRel"></div></div></section>';
    h += '<section class="cta"><div class="wrap"><p class="cta__claim" data-po="po.claim"></p><p class="cta__sub" data-po="po.cta.sub"></p><p class="cta__desc" data-po="po.cta.desc"></p><div class="cta__actions"><a class="sb-btn sb-btn--primary sb-btn--lg" href="#po-calculator" data-po="po.btn2"></a><a class="sb-link" href="mailto:info@good-startup.com">info@good-startup.com</a><a class="sb-link" href="' + PO_FILES.page + '" target="_blank" rel="noopener" data-po="po.cta.page"></a></div></div></section>';
    return h;
  }

  /* ---------- pictograms: the substrates, the four demonstrations ---------- */
  var SUB_ICON = {
    mortar: '<rect class="f" x="6" y="8" width="44" height="26"/><path d="M6 17h44M6 26h44M20 8v9M36 8v9M13 17v9M28 17v9M43 17v9M20 26v8M36 26v8"/>',
    slate: '<path class="f" d="M4 30L28 8l24 22z"/><path d="M12 30l16-14 16 14M18 30l10-9 10 9"/>',
    alu: '<path class="f" d="M8 12h40v6H30v12h18v6H8v-6h18V18H8z"/>',
    pvc: '<rect class="f" x="8" y="6" width="40" height="22" rx="1"/><path d="M28 28v8M20 36h16"/><path class="r" d="M16 14h12M16 20h20"/>',
    alc: '<rect class="f" x="6" y="9" width="44" height="24"/><circle cx="16" cy="17" r="1.6"/><circle cx="27" cy="24" r="1.6"/><circle cx="38" cy="15" r="1.6"/><circle cx="41" cy="27" r="1.6"/><circle cx="21" cy="28" r="1.2"/><circle cx="33" cy="20" r="1.2"/>',
    other: '<circle class="f" cx="28" cy="20" r="14"/><path d="M23 16a5 5 0 0 1 10 0c0 3-5 3-5 7M28 28v1"/>',
    block: '<rect class="f" x="6" y="8" width="44" height="26"/><path d="M6 17h44M6 26h44M20 8v9M36 8v9M13 17v9M28 17v9M43 17v9M20 26v8M36 26v8"/>',
    concrete: '<rect class="f" x="6" y="6" width="44" height="30"/><path d="M28 6v30M6 22h44"/><circle cx="17" cy="14" r="1.8"/><circle cx="39" cy="14" r="1.8"/><circle cx="17" cy="30" r="1.8"/><circle cx="39" cy="30" r="1.8"/><path class="r" d="M32 24l6 9"/>',
    tile: '<rect class="f" x="6" y="8" width="44" height="26"/><path d="M6 14.5h44M6 21h44M6 27.5h44M17 8v6.5M28 8v6.5M39 8v6.5M11.5 14.5v6.5M22.5 14.5v6.5M33.5 14.5v6.5M44.5 14.5v6.5M17 21v6.5M28 21v6.5M39 21v6.5M11.5 27.5v6.5M22.5 27.5v6.5M33.5 27.5v6.5M44.5 27.5v6.5"/>',
    stone: '<rect class="f" x="6" y="8" width="44" height="26"/><path d="M6 21h44M24 8v13M38 21v13M12 21v13"/><circle cx="16" cy="14" r="1.4"/><circle cx="31" cy="27" r="1.6"/><circle cx="44" cy="13" r="1.2"/><circle cx="24" cy="28" r="1"/>',
    brick: '<rect class="f" x="6" y="8" width="44" height="26"/><path d="M6 13h44M6 18h44M6 23h44M6 28h44M17 8v5M28 8v5M39 8v5M11 13v5M22 13v5M33 13v5M44 13v5M17 18v5M28 18v5M39 18v5M11 23v5M22 23v5M33 23v5M44 23v5M17 28v6M28 28v6M39 28v6"/>',
    wood: '<rect class="f" x="6" y="6" width="44" height="30"/><path d="M13 6v30M20 6v30M27 6v30M34 6v30M41 6v30"/><path d="M6 12h44M6 30h44" stroke-dasharray="2 2"/><ellipse cx="30.5" cy="20" rx="1.6" ry="2.4"/>'
  };
  function testFig(kind) {
    var g = '<svg class="fig" viewBox="0 0 400 200" role="img" aria-hidden="true" font-family="inherit"><rect width="400" height="200" fill="#f5f5f5"/>';
    if (kind === 'before') g += '<rect x="30" y="40" width="160" height="120" fill="#bdb8a8"/><rect x="210" y="40" width="160" height="120" fill="#9f9a8a"/><rect x="210" y="40" width="160" height="120" fill="none" stroke="#f97b00" stroke-width="3"/><g fill="#8d887a" opacity=".5"><circle cx="70" cy="80" r="9"/><circle cx="130" cy="120" r="12"/><circle cx="100" cy="140" r="6"/><circle cx="250" cy="80" r="9"/><circle cx="310" cy="120" r="12"/><circle cx="280" cy="140" r="6"/></g><path d="M225 60l40 -8" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/><text x="110" y="180" font-size="13" text-anchor="middle" fill="#111">—</text><text x="290" y="180" font-size="13" font-weight="700" text-anchor="middle" fill="#d75100">PROTECT ONE</text>';
    else if (kind === 'uv') g += '<rect x="40" y="30" width="140" height="130" fill="#fff" stroke="#b7b7b7"/><rect x="40" y="30" width="140" height="130" fill="#7a4fa3" opacity=".75"/><rect x="220" y="30" width="140" height="130" fill="#fff" stroke="#b7b7b7"/><rect x="220" y="30" width="140" height="130" fill="none" stroke="#f97b00" stroke-width="3"/><path d="M60 10l8 14M100 8l0 16M140 10l-8 14M240 10l8 14M280 8l0 16M320 10l-8 14" stroke="#111" stroke-width="1.5"/><text x="110" y="180" font-size="13" text-anchor="middle" fill="#111">—</text><text x="290" y="180" font-size="13" font-weight="700" text-anchor="middle" fill="#d75100">PROTECT ONE</text>';
    else if (kind === 'salt') g += '<g transform="translate(110 100) rotate(-35)"><rect x="-80" y="-6" width="160" height="12" fill="#8a6a4a"/><rect x="-86" y="-14" width="10" height="28" fill="#7a5c40"/><path d="M80 -6l16 6-16 6z" fill="#7a5c40"/><g fill="#b3502a" opacity=".8"><circle cx="-30" cy="-2" r="7"/><circle cx="10" cy="3" r="9"/><circle cx="50" cy="-3" r="6"/></g></g><g transform="translate(290 100) rotate(-35)"><rect x="-80" y="-6" width="160" height="12" fill="#a9acb0"/><rect x="-86" y="-14" width="10" height="28" fill="#8d9195"/><path d="M80 -6l16 6-16 6z" fill="#8d9195"/><rect x="-86" y="-18" width="176" height="36" rx="18" fill="none" stroke="#f97b00" stroke-width="3"/></g><g stroke="#1a8fd0" stroke-width="1.5" opacity=".7"><path d="M40 20l6 10M70 14l6 10M100 24l6 10M220 20l6 10M250 14l6 10M280 24l6 10"/></g><text x="110" y="180" font-size="13" text-anchor="middle" fill="#111">—</text><text x="290" y="180" font-size="13" font-weight="700" text-anchor="middle" fill="#d75100">PROTECT ONE</text>';
    else g += '<rect x="40" y="110" width="320" height="50" fill="#b3b1aa"/><rect x="40" y="104" width="320" height="8" fill="#fff" opacity=".7"/><rect x="40" y="104" width="320" height="8" fill="none" stroke="#f97b00" stroke-width="2"/><g transform="translate(200 104) rotate(-20)"><rect x="-6" y="-90" width="12" height="70" fill="#d75100"/><rect x="-3" y="-22" width="6" height="22" fill="#8d9195"/><path d="M-6 0l6 4 6-4" fill="#8d9195"/></g><text x="200" y="185" font-size="13" font-weight="700" text-anchor="middle" fill="#d75100">PROTECT ONE</text>';
    return g + '</svg>';
  }

  /* ---------- the vector stand-in of the section (until the 3D stills exist, and without WebGL) ---------- */
  function vec(st) {
    var o = [], si = PO_STAGES.indexOf(st), from = function (s) { return si >= PO_STAGES.indexOf(s); }, r = function (x, y, w, h, f, extra) { o.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (extra || '') + '/>'); }, k;
    var kind = (WPM3D[scn] && WPM3D[scn].kind) || 'block', j;
    r(40, 300, 480, 40, '#cccccc'); r(60, 80, 400, 220, kind === 'conc' ? '#b8b9b5' : kind === 'tile' ? '#b39a7e' : kind === 'stone' ? '#a9ab9d' : kind === 'brick' ? '#a35a4a' : kind === 'wood' ? '#b89466' : '#b3b1aa');
    if (kind === 'block') { for (k = 0; k < 6; k++) o.push('<path d="M60 ' + (80 + k * 36.7) + 'h400" stroke="#d6d3ca" stroke-width="3"/>'); for (k = 0; k < 5; k++) o.push('<path d="M' + (60 + k * 100 + (k % 2 ? 50 : 0)) + ' 80v220" stroke="#d6d3ca" stroke-width="3"/>'); }
    else if (kind === 'conc') { o.push('<path d="M210 80v220M360 80v220M60 175h400" stroke="#8e8f8b" stroke-width="1.5"/>'); for (k = 0; k < 4; k++) for (j = 0; j < 2; j++) o.push('<circle cx="' + (110 + k * 100) + '" cy="' + (120 + j * 100) + '" r="5" fill="#7a7b77"/>'); }
    else if (kind === 'tile') { for (k = 0; k < 18; k++) { o.push('<path d="M60 ' + (80 + k * 12.2) + 'h400" stroke="#8d8981" stroke-width="1.5"/>'); for (j = 0; j < 10; j++) o.push('<path d="M' + (60 + j * 40 + (k % 2 ? 20 : 0)) + ' ' + (80 + k * 12.2) + 'v12" stroke="#8d8981" stroke-width="1.5"/>'); } }
    else if (kind === 'stone') { for (k = 0; k < 4; k++) { o.push('<path d="M60 ' + (80 + k * 55) + 'h400" stroke="#8f8c82" stroke-width="2"/>'); for (j = 0; j < 4; j++) o.push('<path d="M' + (60 + j * 150 + (k % 2 ? 75 : 0)) + ' ' + (80 + k * 55) + 'v55" stroke="#8f8c82" stroke-width="2"/>'); } for (k = 0; k < 40; k++) o.push('<circle cx="' + (70 + ((k * 97) % 380)) + '" cy="' + (90 + ((k * 61) % 200)) + '" r="' + (2 + (k % 3)) + '" fill="#6e5641" opacity=".6"/>'); }
    else if (kind === 'brick') { for (k = 0; k < 15; k++) { o.push('<path d="M60 ' + (80 + k * 14.7) + 'h400" stroke="#c3bba9" stroke-width="2"/>'); for (j = 0; j < 20; j++) o.push('<path d="M' + (60 + j * (k % 2 ? 20 : 40) + (k % 2 ? 10 : 0)) + ' ' + (80 + k * 14.7) + 'v14.7" stroke="#c3bba9" stroke-width="2"/>'); } }
    else { for (k = 1; k < 22; k++) o.push('<path d="M' + (60 + k * 18.2) + ' 80v220" stroke="#2b2622" stroke-width="1.5"/>'); o.push('<path d="M60 120h400M60 190h400M60 260h400" stroke="#8a6a45" stroke-width="1" opacity=".5"/>'); }
    r(52, 68, 416, 14, kind === 'wood' ? '#a98454' : '#c4c4c2');
    if (!from('prep')) { for (k = 0; k < 40; k++) o.push('<circle cx="' + (70 + ((k * 53) % 390)) + '" cy="' + (200 + ((k * 29) % 95)) + '" r="' + (3 + (k % 4)) + '" fill="#fff" opacity=".8"/>'); r(60, 250, 400, 50, 'rgba(84,92,80,.35)'); }
    if (from('prep')) o.push('<path d="M184 84l4 30-3 32 5 30-2 34 4 30-3 30 4 28" stroke="#9a9ea0" stroke-width="5" fill="none" stroke-linecap="round"/>'); else o.push('<path d="M184 84l4 30-3 32 5 30-2 34 4 30-3 30 4 28" stroke="#3a3836" stroke-width="1.6" fill="none"/>');
    if (from('test') && !from('coat1')) r(370, 150, 60, 70, 'rgba(110,106,98,.35)', ' stroke="#e9e2c8" stroke-width="5"');
    if (from('prime')) r(60, 80, 400, 220, 'rgba(232,214,140,.28)');
    if (from('coat1')) r(60, 80, 400, 220, 'rgba(110,106,98,.22)'); if (from('coat2')) r(60, 80, 400, 220, 'rgba(255,255,255,.18)');
    for (k = 0; k < 8; k++) o.push('<circle cx="' + (68 + k * 56) + '" cy="320" r="3" fill="#5c5f63"/>');
    if (from('done')) for (k = 0; k < 20; k++) o.push('<circle cx="' + (80 + ((k * 71) % 380)) + '" cy="' + (100 + ((k * 37) % 190)) + '" r="4" fill="#bfe0f2" opacity=".9"/>');
    o.push('<path d="M52 68H468V82H460V300H60V82H52z M40 300H520V340H40z" stroke="#111" stroke-width="1" fill="none"/>');
    return o.join('');
  }
  var VLB = { state: ['wall', 'effl', 'damp', 'crackB', 'rebar'], prep: ['tap', 'wash', 'moist', 'sealNQ'], test: ['patch', 'wetlook', 'adhesion'], prime: ['prim20', 'open20'], coat1: ['clear1', 'soak'], coat2: ['clear2', 'interval'], done: ['beads', 'cured', 'termC'] };
  function standIn(idx, crop) { var st = PO_STAGES[idx], LBm = LB(), o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (crop ? '60 30 400 330' : '0 0 560 381') + '" role="img" aria-label="' + esc(stName(st)) + '" font-family="inherit"><rect x="0" y="0" width="560" height="381" fill="#fff"/><g class="sec-vec">' + vec(st) + '</g>']; if (!crop) { var halo = ' stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"', y = 24; (VLB[st] || []).forEach(function (k) { var lines = H.wrapLabel(LBm[k] || k); lines.forEach(function (t, n) { o.push('<text x="400" y="' + (y + n * 15) + '" font-size="13" fill="#111"' + halo + '>' + esc(t) + '</text>'); }); y += lines.length * 15 + 10; }); } o.push('</svg>'); return o.join(''); }
  function figSVG(sn, idx) {
    var W = 560, Hh = 381, LX = 0.7 * W, LBm = LB(), st = PO_STAGES[idx], o = ['<svg class="cr-fig" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="' + esc(stName(st)) + '" font-family="inherit"><image href="' + sn.url + '" x="0" y="0" width="' + W + '" height="' + Hh + '"/>'];
    var halo = ' stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"', rows = H.layout(sn.anchors.filter(function (a) { return isFinite(a.x) && isFinite(a.y) && a.x > -0.2 && a.x < 1.2 && a.y > -0.2 && a.y < 1.2; }).map(function (a) { return { k: a.k, x: a.x * W, y: a.y * Hh }; }), Hh, 14, 34);
    rows.forEach(function (qq) { var lines = H.wrapLabel(LBm[qq.k] || qq.k), d = 'M' + LX + ' ' + qq.ly + 'L' + qq.x + ' ' + qq.y; o.push('<path d="' + d + '" stroke="#fff" stroke-width="2.8" opacity=".85" fill="none"/><path d="' + d + '" stroke="#111" stroke-width=".9" fill="none"/><circle cx="' + qq.x + '" cy="' + qq.y + '" r="2.2" fill="#111" stroke="#fff" stroke-width=".9"/>'); lines.forEach(function (t, n) { o.push('<text x="' + (LX + 5) + '" y="' + (qq.ly + 4.5 + (lines.length === 2 ? (n ? 8 : -7) : 0)) + '" font-size="13" fill="#111"' + halo + '>' + esc(t) + '</text>'); }); });
    o.push('</svg>'); return o.join('');
  }
  function snapKey(idx, p) { return p != null ? idx + '@' + p : String(idx); }
  function section(idx, crop, p) { var S = snaps[scn] || {}, sn = S[snapKey(idx, p)] || (p != null ? null : S[idx]); if (sn) return crop ? '<img class="cr-snap" src="' + sn.card + '" alt="">' : figSVG(sn.fig, idx); return standIn(idx, crop); }

  /* ---------- static parts ---------- */
  function renderStatic() {
    [].forEach.call(document.querySelectorAll('#catProtect [data-po]'), function (el) { var v = tr(el.getAttribute('data-po')); if (v != null && typeof v === 'string') el.innerHTML = tx(v); });
    [].forEach.call(document.querySelectorAll('#catProtect [data-po-aria]'), function (el) { var k = el.getAttribute('data-po-aria'); el.setAttribute('aria-label', tr(k) || k); });
    $('poStats').innerHTML = tr('po.stats').map(function (s) { return '<div class="stat"><span class="stat__pre">' + s[0] + '</span><div class="stat__num">' + s[1] + (s[2] ? ' <small>' + s[2] + '</small>' : '') + '</div><div class="stat__label">' + tx(s[3]) + '</div></div>'; }).join('');
    $('poStrip').innerHTML = tr('po.strip').map(function (s) { return '<div class="strip__item"><b>' + s[0] + '</b><span>' + tx(s[1]) + '</span></div>'; }).join('');
    $('poHeroLegend').innerHTML = PO_STAGES.map(function (s, i) { return '<li><button type="button" data-pohero="' + i + '"><span>' + (i + 1) + '</span>' + stName(s) + '</button></li>'; }).join('');
    $('poPoints').innerHTML = tr('po.points').map(function (p) { return '<div class="point"><p class="k">' + p[0] + '</p><h3>' + p[1] + '</h3><p class="en">' + p[2] + '</p><p>' + tx(p[3]) + '</p></div>'; }).join('');
    $('poUses').innerHTML = tr('po.uses').map(function (u, i) { return '<div class="sb-picto">' + picto(i === 0 ? 'shield' : i === 1 ? 'sun' : 'salt') + '<div><p class="label" style="margin-bottom:2px">' + u[0] + '</p><p class="sb-picto__title">' + u[1] + '</p><p class="sb-picto__text">' + tx(u[2]) + '</p></div></div>'; }).join('');
    $('poTests').innerHTML = tr('po.tests').map(function (t) { var k = t[0], cap = evid && evid[k] ? '<div class="test__cap">' + (k === 'film' ? '<span class="is-po">PROTECT ONE</span>' : '<span>' + tr('po.ts.bare') + '</span><span class="is-po">PROTECT ONE</span>') + '</div>' : ''; return '<div class="test">' + (evid && evid[k] ? '<img class="fig fig--photo" src="' + evid[k] + '" alt="" width="1600" height="800">' : testFig(k)) + cap + '<h3>' + t[1] + '</h3><p>' + tx(t[2]) + '</p></div>'; }).join('');
    $('poRel').innerHTML = tr('po.rel.rows').map(function (r) { return '<div class="prow"><div class="prow__name cr-rel__name">' + tx(r[0]) + '</div><div><p>' + tx(r[1]) + '</p></div><a class="sb-link" href="' + r[3] + '" data-go="ux">' + r[2] + '</a></div>'; }).join('');
    renderSubs(); renderTiles(); renderProduct();
    if (!heroView) heroVec();
  }
  function statusOf(id) { return PO_SUB_STATUS[id] || 'ask'; }
  function renderTiles() {
    var T = tr('po.scn'), t = SC(), st = PO_SCN[scn].status, ico = function (id) { return SUB_ICON[PO_SCN[id].icon].replace(/class="f"/g, 'class="d2"'); };
    $('poTiles').innerHTML = PO_ORDER.map(function (id) { return '<button class="scn-tile" type="button" role="tab" data-poscn="' + id + '" aria-selected="' + (id === scn) + '" tabindex="' + (id === scn ? 0 : -1) + '"><svg viewBox="0 0 56 40" aria-hidden="true">' + ico(id) + '</svg><span>' + T[id].short + '</span></button>'; }).join('');
    $('poPanel').innerHTML = '<div><p class="scn__name">' + t.name + '</p><p class="po-status"><span class="tbc' + (st === 'ask' ? '' : ' is-ok') + '">' + tr('po.sub.st')[st] + '</span></p><h4>' + tr('po.scn.problem') + '</h4><p>' + tx(t.problem) + '</p></div><div><h4>' + tr('po.scn.solution') + '</h4><p>' + tx(t.solution) + '</p></div><div><h4>' + tr('po.scn.products') + '</h4><ul class="scn-chips"><li><a href="#po-products">' + tx('{PO}') + '</a></li><li><a href="#po-products">' + tx('{OP2020}') + '</a></li><li><a href="#/sealant" data-go="sl">' + tx('{CLIO}') + '</a></li></ul><p style="margin-top:12px"><a class="sb-link" href="#po-procedure">' + tr('po.tl.label') + '</a> · <a class="sb-link" href="#po-model3d">' + tr('po.m3d.label') + '</a></p></div>';
    [].forEach.call(document.querySelectorAll('[data-po-scnsel]'), function (sel) { sel.innerHTML = PO_ORDER.map(function (id, i) { return '<option value="' + id + '">' + (i + 1) + ' · ' + T[id].short + '</option>'; }).join(''); sel.value = scn; sel.parentNode.querySelector('.scnbar__icon').innerHTML = ico(scn); });
  }
  function setScn(id) { if (PO_ORDER.indexOf(id) < 0 || !WPM3D[id]) return; if (timer) { clearTimeout(timer); timer = 0; } scn = id; stage = 0; m3d = 0; sub = PO_SCN[id].sub; q.sub = sub; save(); if (!built) return; if (secView) secView.setScenario(id); if (insp) insp.setScenario(id); renderTiles(); renderSubs(); renderStage(); renderProcedure(); renderM3d(); renderCalcForm(); renderCalcOut(); if (secView) queueSnaps(); }
  function renderSubs() {
    var SB = tr('po.subs');
    $('poSubs').innerHTML = PO_SUBS.map(function (id) { return '<button class="sub" type="button" role="tab" data-posub="' + id + '" aria-selected="' + (id === sub) + '" tabindex="' + (id === sub ? 0 : -1) + '"><svg viewBox="0 0 56 40" aria-hidden="true">' + SUB_ICON[id] + '</svg><span>' + SB[id][0] + '</span></button>'; }).join('');
    var s = SB[sub], st = statusOf(sub), ok = st !== 'ask';
    $('poSubPanel').innerHTML = '<div><p class="scn__name">' + s[0] + ' <span class="tbc' + (ok ? ' is-ok' : '') + '">' + tr('po.sub.st')[st] + '</span></p><p>' + tx(s[1]) + '</p></div><div><h4>' + tr('po.q.cov') + '</h4><p>' + tx(tr('po.q.note')) + '</p><p style="margin-top:12px"><a class="sb-link" href="#po-calculator">' + tr('po.btn2') + '</a></p></div>';
  }
  function renderProduct() {
    var kv = tr('po.prod.kv'), h = '';
    h += '<div class="cr-prod__head"><div><h3 class="cr-prod__name">' + tr('po.prod.name') + '</h3><p class="cr-prod__sub">' + tr('po.prod.sub2') + '</p></div><dl class="cr-prod__meta">' + kv.slice(0, 3).map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + tx(r[1]) + '</dd></div>'; }).join('') + '</dl></div>';
    h += '<div class="cr-prod__role"><h4>' + tr('po.overview') + '</h4><p>' + tx(tr('po.prod.role')) + '</p></div>';
    h += '<div class="cr-prod__grid"><div><h4>' + tr('po.prod.label') + '</h4><table class="sb-table"><tbody>' + kv.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + tx(r[1]) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    h += '<div><h4>' + tr('po.gap.h') + '</h4><ul class="sb-list gaps">' + tr('po.gaps').map(function (g) { return '<li>' + tx(g) + ' <span class="tbc">TBC</span></li>'; }).join('') + '</ul><h4 style="margin-top:24px">' + tr('po.docs.h') + '</h4><ul class="sb-list">' + tr('po.docs').map(function (d) { return '<li><a class="sb-link" href="' + PO_FILES[d[2]] + '" target="_blank" rel="noopener">' + d[0] + '</a> <small class="muted">' + d[1] + '</small></li>'; }).join('') + '</ul></div></div>';
    $('poProd').innerHTML = h;
  }

  /* ---------- the stage player and the procedure ---------- */
  function renderStage() {
    var st = stages(); if (stage >= st.length) stage = 0;
    $('poStages').innerHTML = st.map(function (s, i) { return '<button type="button" data-postage="' + i + '" aria-pressed="' + (i === stage) + '"><span class="n">' + (i + 1) + '</span>' + stName(s) + '</button>'; }).join('');
    if (secView) { var key = scn + ':' + stage; if (secTween || key !== secShown) { secView.setStage(stage, !secTween); secShown = key; } drawCallouts(); } else $('poDiagram').innerHTML = section(stage, false); secTween = false;
    $('poCapN').textContent = tr('po.stage.of').replace('{i}', stage + 1).replace('{n}', st.length) + ' — ' + stName(st[stage]); $('poCapT').innerHTML = tx(capOf(st[stage]));
    $('poPrev').disabled = stage === 0; $('poNext').disabled = stage === st.length - 1; renderPlayBtn();
    var b = document.querySelector('#poStages [aria-pressed="true"]'), tb = $('poStages'); if (b && tb.scrollWidth > tb.clientWidth) tb.scrollLeft = Math.max(0, b.offsetLeft - (tb.clientWidth - b.offsetWidth) / 2);
  }
  function renderPlayBtn() { $('poPlay').setAttribute('aria-label', tr(timer ? 'po.pause' : 'po.play')); $('poPlayIcon').setAttribute('d', timer ? 'M3 1h4v14H3zM9 1h4v14H9z' : 'M3 1l11 7-11 7z'); }
  function play(on) { clearTimeout(timer); timer = 0; if (on) { var n = stages().length, running = secView && secView.progress() < 1; if (stage >= n - 1 && !running) { stage = -1; running = false; } if (!running) setStage(stage + 1, false, true); schedule(); } renderPlayBtn(); }
  function schedule() { var left = secView ? secView.duration() * (1 - secView.progress()) : 1.3, ms = left * 1000 + 1500; timer = setTimeout(function () { if (stage >= stages().length - 1 || Menu.cat() !== 'po') return play(false); setStage(stage + 1, false, true); schedule(); }, ms); }
  function setStage(i, focusTab, playing) { if (!playing && timer) { clearTimeout(timer); timer = 0; } var n = stages().length; stage = Math.max(0, Math.min(n - 1, i)); secTween = true; renderStage(); if (focusTab) { var b = document.querySelector('#poStages [aria-pressed="true"]'); if (b) b.focus({ preventScroll: true }); } }
  function procList() { var lib = tr('po.steps'); return PO_STEPS.map(function (s) { return { key: s[0], stage: PO_STAGES.indexOf(s[1]), p: s[2], c: lib[s[0]] }; }); }
  function renderProcedure() {
    var list = procList(); $('poTlSub').innerHTML = tx(tr('po.tl.sub').replace('{n}', list.length));
    $('poTl').innerHTML = list.map(function (st, i) { return '<button class="tl-step" type="button" data-postep="' + i + '"><span class="tl-step__img">' + section(st.stage, true, st.p) + '<span class="tl-step__tag">' + st.c.tag + '</span></span><span class="tl-step__title">' + (i + 1) + '. ' + tx(st.c.title) + '</span><span class="tl-step__text">' + tx(st.c.short) + '</span><span class="sb-link">' + tr('po.more') + '</span></button>'; }).join('');
  }
  var modal = {
    count: function () { return procList().length; },
    fill: function (idx) {
      var list = procList(), st = list[Math.min(idx, list.length - 1)], c = st.c, h = '';
      $('modalTag').textContent = tr('po.step') + ' ' + (idx + 1) + ' — ' + c.tag; $('modalTitle').innerHTML = tx(c.title); $('modalFig').innerHTML = section(st.stage, false, st.p);
      h += '<div><h4>' + tr('po.overview') + '</h4><p>' + tx(c.overview) + '</p></div>';
      h += '<div><h4>' + tr('po.pointsH') + '</h4><ul class="sb-list">' + c.points.map(function (p) { return '<li>' + tx(p) + '</li>'; }).join('') + '</ul></div>';
      if (c.warning) h += '<div class="warn"><div><b>' + tr('po.warning') + '</b>' + tx(c.warning) + '</div></div>';
      if (c.note) h += '<div><h4>' + tr('po.notes') + '</h4><p>' + tx(c.note).replace(/TBC/g, '<span class="tbc">TBC</span>') + '</p></div>';
      h += '<p class="modal__src">' + tr('po.src') + ': ' + esc(c.src) + (/†/.test(c.src) ? '<br>' + tr('po.practice') : '') + '</p>';
      $('modalText').innerHTML = h;
    }
  };

  /* ---------- 3D ---------- */
  function renderM3d() {
    var st = stages(); if (m3d >= st.length) m3d = 0;
    $('poM3dTabs').innerHTML = st.map(function (sId, i) { return '<button type="button" data-pom3d="' + i + '" aria-pressed="' + (i === m3d) + '"><span class="n">' + (i + 1) + '</span>' + stName(sId) + '</button>'; }).join('');
    var t3 = fmtS(tr('po.m3d.titleF'), { name: SC().name }), h2 = document.querySelector('#po-model3d .sec-head__h'); if (h2) h2.textContent = t3;
    $('poM3dNum').textContent = '0' + (m3d + 1); $('poM3dCap').innerHTML = t3 + ' — ' + stName(st[m3d]);
    $('poM3dSub').innerHTML = tx(micro ? tr('po.m3d.microSub') : tr('po.m3d.sub'));
    $('poCallouts').innerHTML = tr('po.m3d.co').map(function (c, i) { if (i === 0 && SC().wall) c = SC().wall; return '<div class="callout"><h3>' + tx(c[0]) + '</h3><p>' + tx(c[1]) + '</p></div>'; }).join('');
    var note = $('poM3dNote'); note.hidden = !micro || !insp; note.textContent = tr('po.m3d.microNote');
    var mb = $('poMicro'); mb.setAttribute('aria-pressed', micro ? 'true' : 'false'); if (!insp || typeof WPMicro === 'undefined') mb.setAttribute('aria-disabled', 'true'); else mb.removeAttribute('aria-disabled'); var xb = $('poXray'); if (micro) xb.setAttribute('aria-disabled', 'true'); else xb.removeAttribute('aria-disabled');
    document.querySelector('#poM3dStage canvas').setAttribute('aria-label', fmtS(tr('po.m3d.ariaF'), { name: SC().name }));
  }
  function secStageMarkup() { return '<div class="stage3d cr-sec" id="poSecStage"><canvas role="img" aria-label="' + esc(fmtS(tr('po.sec.ariaF'), { name: SC().name })) + '"></canvas><svg class="cr-co" id="poSecCo" aria-hidden="true"></svg><div class="m3d-hint" id="poSecHint">' + esc(tr('po.sec.hint')) + '</div><div class="cr-sec__tools">' + icoBtn('poSecZoomIn', 'po.m3d.zin', 'M12 5v14M5 12h14') + icoBtn('poSecZoomOut', 'po.m3d.zout', 'M5 12h14') + icoBtn('poSecReset', 'po.m3d.reset', 'M4 12a8 8 0 1 0 3-6.2M4 4v5h5') + '</div></div>'; }
  function start3D() {
    var no = function () { $('poM3dFallback').hidden = false; document.querySelector('#poM3dStage .m3d-hint').hidden = true; document.querySelector('#poM3dStage .stage3d__cap').hidden = true; renderM3d(); };
    if (!H.has3D()) return no();
    setTimeout(function () { (window.requestAnimationFrame || setTimeout)(function () {
      try { insp = new CRView($('poM3dStage'), { mode: 'full', scenario: scn }); insp.setStage(m3d, true); insp.setXray(xray); window.poInspector = insp; renderM3d(); } catch (e) { if (window.console) console.error('PROTECT ONE 3D', e); insp = null; no(); }
      setTimeout(function () { try { $('poDiagram').innerHTML = secStageMarkup(); secView = new CRView($('poSecStage'), { mode: 'cut', scenario: scn }); secView.setStage(stage, true); secView.onRender = drawCallouts; window.poSection = secView; drawCallouts(); queueSnaps(); } catch (e) { if (window.console) console.error('PROTECT ONE section 3D', e); secView = null; $('poDiagram').innerHTML = section(stage, false); } }, 200);
    }); }, 120);
  }
  function drawCallouts() {
    var svg = $('poSecCo'), host = $('poSecStage'), list = $('poCoList'); if (!svg || !secView) return;
    var w = host.clientWidth, h = host.clientHeight, narrow = w < 640, LBm = LB(), o = [], halo = ' stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"'; secView.setNarrow(narrow); var an = secView.anchors().filter(function (a) { return isFinite(a.x) && isFinite(a.y); });
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    if (!an.length || secView.micro()) { svg.innerHTML = ''; list.hidden = true; return; }
    if (narrow) { an.forEach(function (a, i) { if (!a.in) return; o.push('<circle cx="' + a.x + '" cy="' + a.y + '" r="10" fill="#fff" stroke="#111" stroke-width="1"/><text x="' + a.x + '" y="' + (a.y + 4.5) + '" font-size="12" font-weight="700" text-anchor="middle" fill="#111">' + (i + 1) + '</text>'); }); list.hidden = false; list.innerHTML = '<ol>' + an.map(function (a, i) { return '<li><span>' + (i + 1) + '</span>' + esc(LBm[a.k] || a.k) + '</li>'; }).join('') + '</ol>'; }
    else { list.hidden = true; var LX = Math.round(w * 0.7), rows = H.layout(an, h - 44, 14, 38); rows.forEach(function (qq) { var lines = H.wrapLabel(LBm[qq.k] || qq.k), d = 'M' + LX + ' ' + qq.ly + 'L' + qq.x + ' ' + qq.y; o.push('<path d="' + d + '" stroke="#fff" stroke-width="2.8" opacity=".85" fill="none"/><path d="' + d + '" stroke="#111" stroke-width=".9" fill="none"/><circle cx="' + qq.x + '" cy="' + qq.y + '" r="2.2" fill="#111" stroke="#fff" stroke-width=".9"/>'); lines.forEach(function (t, n) { o.push('<text x="' + (LX + 5) + '" y="' + (qq.ly + 4.5 + (lines.length === 2 ? (n ? 8 : -7) : 0)) + '" font-size="13" fill="#111"' + halo + '>' + esc(t) + '</text>'); }); }); }
    svg.innerHTML = o.join('');
  }
  function queueSnaps() {
    if (!secView) return; var id = scn, st = PO_STAGES, i = 0, jobs = []; snaps[id] = snaps[id] || {};
    st.forEach(function (s, k) { jobs.push({ k: k, p: null }); }); PO_STEPS.forEach(function (s) { if (s[2] != null) jobs.push({ k: st.indexOf(s[1]), p: s[2] }); });
    if (snapBusy) return; snapBusy = true;
    (function next() { if (scn !== id) { snapBusy = false; queueSnaps(); return; } while (i < jobs.length && snaps[id][snapKey(jobs[i].k, jobs[i].p)]) i++; if (i >= jobs.length || !secView) { snapBusy = false; if (snapRedo && secView) { snapRedo = false; snaps = {}; queueSnaps(); } return; }
      var J = jobs[i++], k = J.k, sk = snapKey(k, J.p); (window.requestIdleCallback || function (f) { setTimeout(f, 40); })(function () {
        if (!secView || scn !== id) { snapBusy = false; if (secView) queueSnaps(); return; }
        try { var C = WPM3D[id].cam.cut, card = secView.snapshot(k, 660, 600, { az: C.az, el: C.el, dist: C.dist * 0.66, t: [C.t[0] - (WPM3D[id].shift || 0.1), C.t[1], C.t[2]], fit: 'h', tw: J.p }), fig = secView.snapshot(k, 1120, 762, { az: C.az, el: C.el, dist: C.dist, t: C.t, fit: 'h', tw: J.p }); if (card && fig) snaps[id][sk] = { card: card.url, fig: fig }; } catch (e) {}
        [].forEach.call(document.querySelectorAll('#poTl .tl-step'), function (b) { var li = procList()[+b.getAttribute('data-postep')]; if (li && snapKey(li.stage, li.p) === sk && snaps[id][sk]) b.querySelector('.tl-step__img').firstChild.outerHTML = section(k, true, li.p); });
        if (modalIdx >= 0 && modalAlt === modal) fillModal(); next();
      }, { timeout: 1500 });
    })();
  }
  function heroVec() { var o = ['<svg viewBox="0 0 600 340" role="img" aria-label="' + esc(tr('po.hero.alt')) + '" font-family="inherit"><rect width="600" height="340" fill="#f5f5f5"/>'], i, F = ['rgba(255,255,255,.35)', 'none', 'rgba(110,106,98,.18)', 'rgba(232,214,140,.3)', 'rgba(110,106,98,.25)', 'rgba(255,255,255,.2)', 'rgba(255,255,255,.14)'], BW = 600 / 7; for (i = 0; i < 7; i++) { o.push('<rect x="' + (i * BW) + '" y="60" width="' + BW + '" height="220" fill="#b3b1aa"/>'); if (F[i] !== 'none') o.push('<rect x="' + (i * BW) + '" y="60" width="' + BW + '" height="220" fill="' + F[i] + '"/>'); o.push('<rect x="' + (i * BW) + '" y="60" width="' + BW + '" height="220" fill="none" stroke="#111" stroke-width="1"/><circle cx="' + (i * BW + BW / 2) + '" cy="300" r="11" fill="#fff" stroke="#111"/><text x="' + (i * BW + BW / 2) + '" y="304.5" font-size="12" font-weight="700" text-anchor="middle" fill="#111">' + (i + 1) + '</text>'); } o.push('</svg>'); $('poHeroVec').innerHTML = o.join(''); $('poHeroVec').hidden = false; }
  /* day / night: the live stages follow CRView.setTheme (page.js); the stills carry the background they were rendered with, so the cache is rendered again */
  function retheme() { if (!secView) return; if (snapBusy) snapRedo = true; else { snaps = {}; queueSnaps(); } try { drawCallouts(); } catch (e) {} if (modalIdx >= 0 && modalAlt === modal) fillModal(); }
  function heroMarks() { if (!heroView) return; var an = heroView.anchors(), M = $('poHeroMarks'); if (an.some(function (a) { return !isFinite(a.x) || !isFinite(a.y); })) return; M.innerHTML = an.map(function (a, i) { return '<button type="button" data-pohero="' + i + '" style="left:' + a.x.toFixed(1) + 'px;top:' + a.y.toFixed(1) + 'px" aria-label="' + esc(stName(PO_STAGES[i])) + '">' + (i + 1) + '</button>'; }).join(''); }
  function hero() { if (H.has3D() && typeof WPPanel !== 'undefined' && !heroView && !heroAsked) { heroAsked = true; setTimeout(function () { try { var pic = $('poHeroPic'); $('poHeroCanvas').hidden = false; heroView = new CRView(pic, { mode: 'panel', panel: 'po', sway: true }); heroView.onRender = heroMarks; $('poHeroVec').hidden = true; $('poHeroMarks').hidden = false; $('poHeroHint').hidden = false; pic.classList.add('is-3d'); $('poHeroCanvas').setAttribute('aria-label', tr('po.hero.aria')); heroMarks(); } catch (e) { if (window.console) console.error('PROTECT ONE hero 3D', e); heroView = null; $('poHeroCanvas').hidden = true; heroAsked = false; heroVec(); } }, 60); } }

  /* ---------- the take-off ---------- */
  function takeoff() { var area = num(q.area), cov = num(q.cov), coats = Math.max(1, Math.round(num(q.coats)) || 1), waste = Math.max(0, num(q.waste)), kg = area * cov / 1000 * coats * (1 + waste / 100), cans = kg > 0 ? Math.ceil(kg / PO_PACK - 1e-9) : 0, per = cov > 0 ? PO_PACK * 1000 / (cov * coats * (1 + waste / 100)) : 0, pkg = area * PO_SPEC.primer * (1 + waste / 100), pcans = pkg > 0 ? Math.ceil(pkg / PO_SPEC.primerPack - 1e-9) : 0, price = num(q.price), amount = cans * price; return { area: area, cov: cov, coats: coats, waste: waste, kg: kg, cans: cans, per: per, pkg: pkg, pcans: pcans, price: price, amount: amount, priced: price > 0 }; }
  function field(k, label, unit, o) { o = o || {}; return '<div class="field"><label for="poq_' + k + '">' + label + (o.tbc ? ' <span class="tbc" title="' + esc(tr('po.q.tbc')) + '">TBC</span>' : '') + '</label>' + (unit ? '<div class="cr-unit">' : '') + '<input id="poq_' + k + '" type="number" inputmode="decimal" step="' + (o.step || 'any') + '" min="0" value="' + q[k] + '" data-poq="' + k + '">' + (unit ? '<span>' + unit + '</span></div>' : '') + (o.help ? '<small>' + o.help + '</small>' : '') + '</div>'; }
  function renderCalcForm() {
    var SB = tr('po.subs'), h = '';
    h += '<div class="field"><label for="poq_sub">' + tr('po.q.sub') + '</label><div class="cr-unit"><select id="poq_sub" data-poq="sub">' + PO_SUBS.map(function (id) { return '<option value="' + id + '"' + (id === q.sub ? ' selected' : '') + '>' + SB[id][0] + '</option>'; }).join('') + '</select></div></div>';
    h += '<div class="fgrid">' + field('area', tr('po.q.area'), '㎡') + field('cov', tr('po.q.cov'), 'g/㎡', { help: tr('po.q.tbc') + ' — ' + tr('po.q.assumed') }) + field('coats', tr('po.q.coats'), '', { step: 1 }) + field('waste', tr('po.q.waste'), '%') + '</div>';
    h += '<div class="fgrid"><div class="field"><label for="poq_cur">' + tr('po.q.cur') + '</label><div class="cr-unit"><select id="poq_cur" data-poq="cur">' + ['TWD', 'JPY', 'USD', 'EUR'].map(function (c) { return '<option value="' + c + '"' + (c === q.cur ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div></div>' + field('price', tr('po.q.price'), q.cur, { help: tr('po.q.priceNote') }) + '</div>';
    h += '<p class="sb-table__note">' + tx(tr('po.q.note')) + '</p>';
    $('poCalcForm').innerHTML = h;
  }
  function renderCalcOut() {
    var r = takeoff(), K = tr('po.kpi'), IT = tr('po.q.items'), SB = tr('po.subs'), h = '';
    h += '<div class="kpis cr-kpis q-kpis"><div class="kpi"><span>' + K[0][0] + '</span><b>' + nf(r.kg, 1) + '</b><span>' + K[0][1] + '</span></div><div class="kpi"><span>' + K[1][0] + '</span><b>' + r.cans + '</b><span>' + K[1][1] + '</span></div><div class="kpi"><span>' + K[2][0] + '</span><b>' + nf(r.pkg, 1) + '</b><span>' + K[2][1] + ' · ' + r.pcans + '</span></div><div class="kpi"><span>' + fmtS(K[3][0], { cur: q.cur }) + '</span><b>' + (r.priced ? nf(r.amount, 0) : '—') + '</b><span>' + fmtS(K[3][1], { cur: q.cur }) + '</span></div></div>';
    h += '<div class="sb-panel"><div class="sb-panel__card"><p class="sb-panel__title">' + tr('po.calc.label') + '</p><div class="sb-panel__body"><p>' + fmtS(tr('po.q.basis'), { area: nf(r.area, 1), cov: nf(r.cov, 0), coats: r.coats, waste: nf(r.waste, 0), kg: nf(r.kg, 1), cans: r.cans, per: nf(r.per, 1), pkg: nf(r.pkg, 1), pcans: r.pcans }) + '</p><table class="sb-table" style="margin-top:12px"><tbody>' + [[IT[0], SB[q.sub][0]], [IT[1], nf(r.area, 1)], [IT[2], nf(r.cov, 0)], [IT[3], r.coats], [IT[4], nf(r.waste, 0)], [IT[5], nf(r.kg, 2)], [IT[6], r.cans], [IT[7], r.per ? nf(r.per, 1) : '—'], [IT[10], nf(r.pkg, 2)], [IT[11], r.pcans], [IT[8], r.priced ? nf(r.price, 0) + ' ' + q.cur : '—'], [IT[9], r.priced ? nf(r.amount, 0) + ' ' + q.cur : '—']].map(function (row) { return '<tr><th scope="row">' + row[0] + '</th><td class="num">' + row[1] + '</td></tr>'; }).join('') + '</tbody></table><p class="sb-table__note">' + tr('po.q.priceNote') + '</p></div></div></div>';
    h += '<div class="calc__actions"><button class="sb-btn sb-btn--primary" type="button" id="poCopyQ">' + tr('po.q.copy') + '</button><button class="sb-btn sb-btn--secondary" type="button" id="poDlCsv">' + tr('po.q.dlCsv') + '</button></div>';
    $('poCalcOut').innerHTML = h;
  }
  function summaryText() { var r = takeoff(); return fmtS(tr('po.q.summary'), { sub: tr('po.subs')[q.sub][0], area: nf(r.area, 1), cov: nf(r.cov, 0), coats: r.coats, waste: nf(r.waste, 0), kg: nf(r.kg, 1), cans: r.cans, per: nf(r.per, 1), amount: r.priced ? nf(r.amount, 0) + ' ' + q.cur : '—', pkg: nf(r.pkg, 1), pcans: r.pcans }); }
  function csvText() { var r = takeoff(), IT = tr('po.q.items'), rows = [IT, [tr('po.subs')[q.sub][0], r.area, r.cov, r.coats, r.waste, Math.round(r.kg * 100) / 100, r.cans, Math.round(r.per * 10) / 10, r.priced ? r.price : '', r.priced ? Math.round(r.amount) : '', Math.round(r.pkg * 100) / 100, r.pcans]]; return '﻿' + rows.map(function (rw) { return rw.map(function (c) { c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n'); }

  function render() { if (!built) return; renderStatic(); if (window.HSIM && window.PO) HSIM.gate('po', window.PO); renderStage(); renderProcedure(); renderM3d(); renderCalcForm(); renderCalcOut(); if (secView) { var hint = $('poSecHint'); if (hint) hint.textContent = tr('po.sec.hint'); drawCallouts(); } if (heroView) { $('poHeroCanvas').setAttribute('aria-label', tr('po.hero.aria')); heroMarks(); } }
  var evid = null; // the four rendered demonstrations, once PoEvidence has drawn them
  function start() {
    if (built) return; built = true; var M = $('catProtect'); M.innerHTML = shell(); render(); hero(); start3D();
    if (window.PoEvidence && !window.FAST3D) setTimeout(function () { PoEvidence.render(function (r) { if (r) { evid = r; if (built) renderStatic(); } }); }, 600);
    M.addEventListener('click', function (e) {
      var b = e.target.closest('[data-poscn]'); if (b) { setScn(b.getAttribute('data-poscn')); var nt = document.querySelector('#poTiles [aria-selected="true"]'); if (nt) nt.focus(); return; }
      b = e.target.closest('[data-posub]'); if (b) { sub = b.getAttribute('data-posub'); q.sub = sub; save(); renderSubs(); renderCalcForm(); renderCalcOut(); var n = document.querySelector('#poSubs [aria-selected="true"]'); if (n) n.focus(); return; }
      b = e.target.closest('[data-postage]'); if (b) { setStage(+b.getAttribute('data-postage'), true); return; }
      b = e.target.closest('[data-pohero]'); if (b) { var hs = +b.getAttribute('data-pohero'); setStage(hs); m3d = hs; renderM3d(); if (insp) insp.setStage(m3d, true); var t = $('poStages').getBoundingClientRect().top + window.pageYOffset - Menu.headerH() - 8; window.scrollTo({ top: t, behavior: 'smooth' }); return; }
      b = e.target.closest('[data-postep]'); if (b) { openModal(+b.getAttribute('data-postep'), b, modal); return; }
      b = e.target.closest('[data-pom3d]'); if (b) { m3d = +b.getAttribute('data-pom3d'); renderM3d(); if (insp) insp.setStage(m3d); var nb = document.querySelector('#poM3dTabs [aria-pressed="true"]'); if (nb) nb.focus({ preventScroll: true }); return; }
      if (e.target.closest('#poPlay')) return play(!timer);
      if (e.target.closest('#poPrev')) return setStage(stage - 1); if (e.target.closest('#poNext')) return setStage(stage + 1);
      if (e.target.closest('#poCopyQ')) return copyText(summaryText());
      if (e.target.closest('#poDlCsv')) return saveFile('takeoff-protect-one.csv', csvText());
      if (e.target.closest('#poXray')) { if (micro) return; xray = !xray; $('poXray').setAttribute('aria-pressed', xray ? 'true' : 'false'); if (insp) insp.setXray(xray); return; }
      if (e.target.closest('#poMicro')) { if (!insp || typeof WPMicro === 'undefined') return; micro = !micro; var mbtn = $('poMicro'); mbtn.setAttribute('aria-busy', 'true'); if (micro) $('poM3dCap').textContent = tr('po.m3d.microBuild'); setTimeout(function () { try { insp.setMicro(micro); insp.setStage(m3d, true); } catch (er) { if (window.console) console.error('micro scale', er); micro = false; } renderM3d(); mbtn.removeAttribute('aria-busy'); }, 40); return; }
      if (e.target.closest('#poSecZoomIn')) { if (secView) secView.zoom(0.85); return; } if (e.target.closest('#poSecZoomOut')) { if (secView) secView.zoom(1.18); return; } if (e.target.closest('#poSecReset')) { if (secView) secView.reset(); return; }
      if (e.target.closest('#poZoomIn')) { if (insp) insp.zoom(0.85); return; } if (e.target.closest('#poZoomOut')) { if (insp) insp.zoom(1.18); return; } if (e.target.closest('#poReset')) { if (insp) insp.reset(); return; }
      if (e.target.closest('#poTlPrev') || e.target.closest('#poTlNext')) { var el = $('poTl'), card = el.querySelector('.tl-step'), w = card ? card.offsetWidth + 13 : 300; el.scrollBy({ left: (e.target.closest('#poTlPrev') ? -1 : 1) * w * 2, behavior: 'smooth' }); }
    });
    M.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; if (e.target.closest('#poTiles')) { e.preventDefault(); setScn(PO_ORDER[(PO_ORDER.indexOf(scn) + d + PO_ORDER.length) % PO_ORDER.length]); var nt = document.querySelector('#poTiles [aria-selected="true"]'); if (nt) nt.focus(); } else if (e.target.closest('#poSubs')) { e.preventDefault(); sub = PO_SUBS[(PO_SUBS.indexOf(sub) + d + PO_SUBS.length) % PO_SUBS.length]; q.sub = sub; save(); renderSubs(); renderCalcForm(); renderCalcOut(); var n = document.querySelector('#poSubs [aria-selected="true"]'); if (n) n.focus(); } else if (e.target.closest('#poStages')) { e.preventDefault(); setStage(stage + d, true); } });
    M.addEventListener('change', function (e) { var sc = e.target.closest('[data-po-scnsel]'); if (sc) { setScn(sc.value); return; } var f = e.target.closest('select[data-poq]'); if (f) { var k = f.getAttribute('data-poq'); q[k] = f.value; if (k === 'sub') { sub = f.value; renderSubs(); } save(); renderCalcForm(); renderCalcOut(); } });
    M.addEventListener('input', function (e) { var f = e.target.closest('input[data-poq]'); if (f) { var k = f.getAttribute('data-poq'); q[k] = num(f.value); if (k === 'cov') covTouched = true; save(); renderCalcOut(); } });
    $('poCalcForm').addEventListener('submit', function (e) { e.preventDefault(); });
  }
  function docCtx() { return { cat: 'po', scn: scn, scnName: plain(SC().name), problem: SC().problem, stages: stages(), stageName: function (sid) { return tr('po.stages')[sid] || capOf(sid) || sid; }, steps: procList(), labels: LB(), sec: secView, hero: heroView, insp: insp, ids: { layers: 'poLayers', prod: 'poProd', adv: 'poPoints', advLists: 'poUses', qa: 'poTests', cmp: 'poCmp', calc: 'poCalcOut', tl: 'poTl', cover: 'catProtect' }, products: ['PO'], prod: 'PO', showProduct: null, cam: function (i) { var M = M3D(scn), st = stages()[i]; return (M.camS && M.camS[st] && M.camS[st].cut) || M.cam.cut; }, extra: { solution: SC().solution, layers: [{ name: 'OP-2020 — ' + (tr('po.stages').prime || ''), thick: PO_SPEC.primer + ' kg/㎡' }, { name: 'PROTECT ONE — ' + (tr('po.stages').coat1 || ''), thick: PO_SPEC.rate + ' kg/㎡' }, { name: 'PROTECT ONE — ' + (tr('po.stages').coat2 || ''), thick: PO_SPEC.rate + ' kg/㎡ · ' + PO_SPEC.film + ' mm' }], scenarios: PO_ORDER.map(function (id) { var t = tr('po.scn')[id]; return { id: id, name: plain(t.name), problem: t.problem, solution: t.solution }; }) } }; }
  /* the 3D views given up while another guide is open (a phone keeps few WebGL contexts) and built again when this guide returns */
  function release3d() { [insp, secView, heroView].forEach(function (v) { if (v && v.release) { try { v.release(); } catch (e) {} } }); insp = null; secView = null; heroView = null; heroAsked = false; window.poInspector = null; window.poSection = null; try { var hc = $('poHeroCanvas'); if (hc) hc.hidden = true; $('poHeroPic').classList.remove('is-3d'); $('poHeroVec').hidden = false; $('poHeroMarks').hidden = true; } catch (e) {} }
  function revive3d() { if (!built || insp || secView || heroView) return; hero(); start3D(); }
  return { release3d: release3d, revive3d: revive3d, _doc: docCtx, retheme: retheme, start: start, render: render, showProduct: function () { var el = $('po-products'); if (el) el.scrollIntoView(); }, modal: modal, state: function () { return { scn: scn, stage: stage, m3d: m3d, sub: sub, micro: micro, snaps: Object.keys(snaps[scn] || {}).length, sec3d: !!secView, hero3d: !!heroView }; }, setScenario: setScn, setStage: setStage, setM3d: function (i) { m3d = i; renderM3d(); if (insp) insp.setStage(i, true); }, drawCallouts: drawCallouts, takeoff: takeoff, calc: function (o) { var k; for (k in o) q[k] = o[k]; if (built) { renderCalcForm(); renderCalcOut(); } return takeoff(); } };
})();


