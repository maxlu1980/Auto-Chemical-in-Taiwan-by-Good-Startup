/* ===== [vs_ui.js] ===== */
/* ===== The technology comparison ("Versus") section, shared by the guides =====
   VsUI.render(el, D, aud, pfx): D = { T (texts of the current language), N (numbers per class), CLS (class keys, the first is the guide's
   product), SRC (sources), low (bar keys where lower is better), nf (number format), tx, esc }. The section: header, KPI strip, technology
   cards, the bar charts from the printed figures (second and further examples as thinner bars, a JIS minimum as a dashed marker), the matrix,
   the audience tabs, the honest note and the sources. VsUI.aud(el, D, aud, pfx) re-renders the audience tabs alone. */
var VsUI = (function () {
  function vsN(v, nf) { return nf(v, v < 1 ? 2 : v < 10 ? 1 : 0); }
  function render(el, D, aud, pfx) {
    var T = D.T, N = D.N, CLS = D.CLS, tx = D.tx, esc = D.esc, nf = D.nf, LOW = D.low || {}, h = '';
    h += '<div class="sec-head"><div><p class="sec-head__kicker">' + T.label + '</p><h2 class="sec-head__h">' + tx(T.title) + '</h2></div>' + RING_SVG + '</div>';
    h += '<p class="sec-sub">' + tx(T.sub) + '</p>';
    h += '<div class="vs-kpis">' + T.kpi.map(function (k) { return '<div class="vs-kpi"><b>' + k[0] + '</b><span class="vs-kpi__vs">' + k[1] + '</span><span class="vs-kpi__l">' + k[2] + '</span></div>'; }).join('') + '</div>';
    h += '<div class="vs-cards">' + CLS.map(function (k, i) { var c = T.classes[k]; return '<div class="vs-card' + (i === 0 ? ' is-hg' : '') + '"><p class="vs-card__tag">' + (i === 0 ? T.tag : T.vsTag) + '</p><h3 class="vs-card__name">' + tx(c.name) + '</h3><dl class="vs-card__dl">' + ['chem', 'apply', 'cure', 'catch'].map(function (f, j) { return '<div><dt>' + T.cardH[j] + '</dt><dd>' + tx(c[f]) + '</dd></div>'; }).join('') + '</dl></div>'; }).join('') + '</div>';
    h += '<h3 class="sub-h">' + T.bars.title + '</h3><div class="vs-bars">' + T.bars.items.map(function (it) {
      var key = it[0], rows = [], max = 0;
      CLS.forEach(function (k) { var p = N[k], v = p[key], alts = Object.keys(p).filter(function (q) { return /^alt/.test(q) && p[q] && p[q][key] != null; }).map(function (q) { return p[q]; }), j = p.jis && p.jis[key] != null ? p.jis[key] : null; [v, j].concat(alts.map(function (a) { return a[key]; })).forEach(function (x) { if (x != null) max = Math.max(max, x); }); rows.push([k, v, alts, j]); });
      if (!max) max = 1;
      function track(v, cls, j) { if (v == null) return '<div class="vs-bar__track ' + cls + '"><span class="vs-bar__in"><b class="na">— <small>' + T.barsNA + '</small></b></span></div>'; var w = Math.max(0.8, 100 * v / max); return '<div class="vs-bar__track ' + cls + '"><span class="vs-bar__in"><i style="width:' + w.toFixed(1) + '%"></i>' + (j != null ? '<u style="left:' + (100 * j / max).toFixed(1) + '%" title="' + T.barsJis + ' ' + j + '"></u>' : '') + '<b style="left:' + w.toFixed(1) + '%">' + vsN(v, nf) + (j != null ? ' <small>' + T.barsJis + ' ' + vsN(j, nf) + '</small>' : '') + '</b></span></div>'; }
      return '<div class="vs-metric"><div class="vs-metric__head"><b>' + it[1] + '</b><span>' + it[2] + ' · ' + (LOW[key] ? T.barsLow : T.barsHigh) + '</span></div>' + rows.map(function (r) { var k = r[0], p = N[k], i0 = CLS.indexOf(k), name = T.rowsH[i0 + 1]; return '<div class="vs-bar' + (i0 === 0 ? ' is-hg' : '') + '"><div class="vs-bar__k"><b>' + name + '</b>' + (p.name === name ? '' : '<small>' + esc(p.name) + '</small>') + r[2].map(function (a) { return '<small class="alt">' + esc(a.name) + '</small>'; }).join('') + '</div><div class="vs-bar__t">' + track(r[1], i0 === 0 ? 'is-hg' : '', r[3]) + r[2].map(function (a) { return track(a[key], 'vs-bar__track--alt', null); }).join('') + '</div></div>'; }).join('') + '</div>';
    }).join('') + '</div><p class="sb-table__note muted vs-note">' + T.bars.note + ' · ' + T.barsAlt + ': ' + T.rowsH.slice(1).filter(function (x, i) { var p = N[CLS[i]]; return Object.keys(p).some(function (q) { return /^alt/.test(q); }); }).join(', ') + '.</p>';
    h += '<h3 class="sub-h">' + T.matrixTitle + '</h3><p class="sec-sub">' + T.matrixSub + '</p><div class="sb-table-wrap vs-wrap" tabindex="0" role="region" aria-label="' + String(T.matrixTitle).replace(/<[^>]+>/g, '').replace(/"/g, '&quot;') + '"><table class="sb-table vs-table"><thead><tr>' + T.rowsH.map(function (x, i) { return '<th scope="col"' + (i === 1 ? ' class="is-hg"' : '') + '>' + tx(x) + '</th>'; }).join('') + '</tr></thead><tbody>' + T.rows.map(function (r) { return '<tr><th scope="row">' + tx(r[0]) + '</th>' + r[1].map(function (c, i) { return '<td' + (i === 0 ? ' class="is-hg"' : '') + '>' + tx(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    h += '<div class="vs-aud"><div><h3 class="sub-h">' + T.aud.title + '</h3><p class="sec-sub">' + T.aud.sub + '</p><div class="seg vs-aud__tabs" role="group" id="' + pfx + 'VsTabs"></div></div><ol class="sb-list sb-list--num vs-aud__list" id="' + pfx + 'VsAud" aria-live="polite"></ol></div>';
    h += '<div class="warn vs-honest"><div><b>' + T.honest.title + '</b><span>' + tx(T.honest.text) + '</span></div></div>';
    h += '<div class="vs-src"><p class="label">' + T.src.title + '</p><p class="muted">' + T.src.sub + '</p><ol class="vs-src__list">' + D.SRC.map(function (s) { return '<li><b>' + esc(s[0]) + '</b><a href="' + s[2] + '" target="_blank" rel="noopener">' + esc(s[1]) + '</a></li>'; }).join('') + '</ol></div>';
    el.innerHTML = h; audience(el, D, aud, pfx); watch(el);
  }
  /* The value labels sit at the end of their bars; a long label (a figure plus the JIS minimum in English or Japanese) can run past the
     track on a phone. fit() measures each label against its track and flips an overflowing one inside the bar when the bar is wide enough. */
  var ELS = [], fitT = null;
  function fit(el) {
    var ins = el.querySelectorAll('.vs-bar__in');
    for (var i = 0; i < ins.length; i++) {
      var s = ins[i], b = s.querySelector('b'), bar = s.querySelector('i'); if (!b || !bar || b.classList.contains('na')) continue;
      b.classList.remove('is-flip'); s.classList.remove('is-below');
      var tr = s.parentNode.getBoundingClientRect(), br = b.getBoundingClientRect(); if (!tr.width || !br.width) continue;
      if (br.right > tr.right + 1) { if (bar.getBoundingClientRect().width > br.width + 14) b.classList.add('is-flip'); else s.classList.add('is-below'); }
    }
  }
  function fitAll() { ELS = ELS.filter(function (e) { return e.isConnected !== false && document.body.contains(e); }); ELS.forEach(fit); }
  function watch(el) {
    if (ELS.indexOf(el) < 0) ELS.push(el);
    fit(el);
    if (ELS.length === 1 && !watch.on) {
      watch.on = true;
      window.addEventListener('resize', function () { clearTimeout(fitT); fitT = setTimeout(fitAll, 150); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(fitAll, 0); });
    }
    if (typeof IntersectionObserver !== 'undefined') {
      if (!el.__vsIO) { el.__vsIO = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) fit(x.target); }); }, { rootMargin: '200px 0px' }); el.__vsIO.observe(el); }
    }
  }
  function audience(el, D, aud, pfx) { var T = D.T, tabs = document.getElementById(pfx + 'VsTabs'), list = document.getElementById(pfx + 'VsAud'); if (!tabs || !list) return; if (!T.aud[aud]) aud = T.aud.tabs[0][0]; tabs.innerHTML = T.aud.tabs.map(function (t) { return '<button type="button" data-' + pfx + 'aud="' + t[0] + '" aria-pressed="' + (t[0] === aud ? 'true' : 'false') + '">' + t[1] + '</button>'; }).join(''); list.innerHTML = T.aud[aud].map(function (x) { return '<li>' + D.tx(x) + '</li>'; }).join(''); }
  return { render: render, aud: audience };
})();


