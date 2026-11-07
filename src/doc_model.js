/* ===== [doc_model.js] ===== */
/* ===== Documents for project submission: the document model and its builders =====
   A document is a list of plain blocks (headings, paragraphs, lists, tables, figures) built from the guide's own data and rendered sections,
   rendered to Word (doc_out.js: docx) and PDF (pdfmake). Text comes from the page as the reader sees it — same language, same product names,
   same figures with their sources — so a document never says anything the page does not. Figures: the 3D section stills of the engine with
   the page's callouts, dimensioned 2D section drawings and bar charts, all drawn on canvas. */
var DocModel = (function () {
  var BRAND = '#f97b00', BRAND_DARK = '#d75100', INK = '#111111', GREY = '#6d6d6d', LINE = '#b7b7b7';
  var _ta = null;
  function strip(html) { // html → text; block ends become line breaks
    var s = String(html == null ? '' : html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|li|div|tr|h[1-6])>/gi, '\n').replace(/<[^>]+>/g, '');
    if (!_ta) _ta = document.createElement('textarea'); _ta.innerHTML = s; s = _ta.value;
    return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '');
  }
  function T(s) { return strip(tx(String(s == null ? '' : s))); } // text with the product names set plain
  function cellText(el) { return strip(el.innerHTML).replace(/\s*\n\s*/g, ' ').trim(); }
  function isNum(el) { return /\bnum\b/.test(el.className || ''); }

  /* ----- the rendered sections of the page, read back as blocks ----- */
  function fromDom(root, o) {
    o = o || {}; var out = [];
    function walk(el) {
      var tag = el.tagName ? el.tagName.toLowerCase() : '', cls = el.className && typeof el.className === 'string' ? el.className : '';
      if (el.nodeType !== 1 || el.hidden || /\bvh\b|\bcalc__actions\b|\bscnbar\b|\bcr-ptabs\b|\bpmenu\b|\bdownloads\b|\ba4__bar\b/.test(cls) || /^(button|select|input|svg|canvas|style|script|textarea|form|label)$/.test(tag)) {
        if (/\bdownloads\b/.test(cls)) { var ls = [].map.call(el.querySelectorAll('a'), function (a) { return cellText(a) + ' — ' + a.getAttribute('href'); }); if (ls.length) out.push({ t: 'ul', items: ls, small: true }); }
        return;
      }
      if (/\bsec-head\b/.test(cls)) { var k = el.querySelector('.sec-head__kicker'), h = el.querySelector('.sec-head__h'); if (k && cellText(k)) out.push({ t: 'p', s: cellText(k), st: 'label' }); if (h) out.push({ t: 'h', l: o.hl || 1, s: cellText(h) }); return; }
      if (/\bkpis\b/.test(cls)) { out.push({ t: 'kpis', items: [].map.call(el.querySelectorAll('.kpi'), function (kp) { var sp = kp.querySelectorAll('span'), b = kp.querySelector('b'); return [b ? cellText(b) : '', sp[0] ? cellText(sp[0]) : '', sp[1] ? cellText(sp[1]) : '']; }) }); return; }
      if (/\bstats\b/.test(cls) && el.querySelector('.stat')) { out.push({ t: 'kpis', items: [].map.call(el.querySelectorAll('.stat'), function (st) { var n = st.querySelector('.stat__num'), sm = n ? n.querySelector('small') : null, pre = st.querySelector('.stat__pre'), lb = st.querySelector('.stat__label'); return [(n ? n.textContent.replace(sm ? sm.textContent : '', '').trim() : '') + (sm ? ' ' + cellText(sm) : ''), pre ? cellText(pre) : '', lb ? cellText(lb) : '']; }) }); return; }
      if (/\badv\b/.test(cls) && el.querySelector('.adv__item')) { var items = [].map.call(el.querySelectorAll('.adv__item'), function (it) { var v = it.querySelector('.adv__val'), sm = v ? v.querySelector('small') : null, ti = it.querySelector('.adv__title'), de = it.querySelector('.adv__desc'); return [(v ? v.textContent.replace(sm ? sm.textContent : '', '').trim() : ''), (sm ? cellText(sm) + ' · ' : '') + (ti ? cellText(ti) : ''), de ? cellText(de) : '']; }); for (var ii = 0; ii < items.length; ii += 3) out.push({ t: 'kpis', items: items.slice(ii, ii + 3) }); return; }
      if (/\bpictos\b/.test(cls)) { var ps = [].map.call(el.querySelectorAll('.sb-picto'), function (p) { var t2 = p.querySelector('.sb-picto__title'), d2 = p.querySelector('.sb-picto__text'); return (t2 ? cellText(t2) : '') + (d2 ? ' — ' + cellText(d2) : ''); }).filter(Boolean); if (ps.length) out.push({ t: 'ul', items: ps }); return; }
      if (/\bvs-kpis\b/.test(cls)) { out.push({ t: 'kpis', items: [].map.call(el.querySelectorAll('.vs-kpi'), function (kp) { var b = kp.querySelector('b'), v = kp.querySelector('.vs-kpi__vs'), l = kp.querySelector('.vs-kpi__l'); return [b ? cellText(b) : '', l ? cellText(l) : '', v ? cellText(v) : '']; }) }); return; }
      if (/\bcr-prod__head\b/.test(cls)) { var nm = el.querySelector('.cr-prod__name'), sb = el.querySelector('.cr-prod__sub'); if (nm) out.push({ t: 'h', l: o.hl || 1, s: cellText(nm) }); if (sb) out.push({ t: 'p', s: cellText(sb), st: 'lead' }); var dl = el.querySelector('dl'); if (dl) walk(dl); return; }
      if (/\bcr-prod__role\b/.test(cls)) { var lb = el.querySelector('.label'), pr = el.querySelector('p:not(.label)'); if (lb) out.push({ t: 'p', s: cellText(lb), st: 'label' }); if (pr) out.push({ t: 'p', s: cellText(pr), st: 'lead' }); return; }
      if (/\bcr-layer\b/.test(cls) && tag === 'button') return; // the layer buttons are read by layersOf()
      if (/\btl-step\b/.test(cls)) return; // procedure cards are read from the step library
      if (/\btest\b/.test(cls) && el.querySelector('h3')) { // a demonstration card: its photograph (rendered on the page), title and text
        var im = el.querySelector('img.fig'), h3 = el.querySelector('h3'), tp = el.querySelector('p'), caps = [].map.call(el.querySelectorAll('.test__cap span'), cellText).join(' / ');
        out.push({ t: 'h', l: 3, s: cellText(h3) }); if (im && /^data:image\//.test(im.getAttribute('src') || '')) out.push({ t: 'img', src: im.getAttribute('src'), w: im.naturalWidth || 1400, h: im.naturalHeight || 700, size: 'half', cap: caps }); if (tp) out.push({ t: 'p', s: strip(tp.innerHTML) }); return; }
      if (/\bverdict\b/.test(cls)) { out.push({ t: 'box', title: cellText(el.querySelector('b') || el), s: cellText(el.querySelector('p') || el) }); return; }
      if (/\bwarn\b/.test(cls)) { var bb = el.querySelector('b'), ss = el.querySelector('span'); out.push({ t: 'box', title: bb ? cellText(bb) : '', s: ss ? cellText(ss) : cellText(el) }); return; }
      if (tag === 'h1' || tag === 'h2') { out.push({ t: 'h', l: o.hl || 1, s: cellText(el) }); return; }
      if (tag === 'h3') { out.push({ t: 'h', l: (o.hl || 1) + 1, s: cellText(el) }); return; }
      if (tag === 'h4' || tag === 'h5' || tag === 'h6') { out.push({ t: 'h', l: 3, s: cellText(el) }); return; }
      if (tag === 'p' || tag === 'address' || tag === 'small' || tag === 'caption') { var s = strip(el.innerHTML); if (!s) return; out.push({ t: 'p', s: s, st: /\blabel\b/.test(cls) ? 'label' : /\bmuted\b|\bsb-table__note\b|\bnote\b/.test(cls) || tag === 'small' ? 'note' : /\bsec-sub\b|\bcr-prod__sub\b|\blead\b/.test(cls) ? 'lead' : null }); return; }
      if (tag === 'ul' || tag === 'ol') { var items = [].map.call(el.children, function (li) { return strip(li.innerHTML).replace(/\s*\n\s*/g, ' '); }).filter(Boolean); if (items.length) out.push({ t: tag, items: items, small: /\bsb-list--small\b|\bvs-src__list\b/.test(cls) }); return; }
      if (tag === 'dl') { var rows = []; [].forEach.call(el.querySelectorAll('dt'), function (dt) { var dd = dt.nextElementSibling; rows.push([cellText(dt), dd ? cellText(dd) : '']); }); if (rows.length) out.push({ t: 'kv', rows: rows }); return; }
      if (tag === 'table') { out.push(tableOf(el)); return; }
      [].forEach.call(el.childNodes, function (c) { if (c.nodeType === 3) { var tt = c.textContent.replace(/\s+/g, ' ').trim(); if (tt && tt.length > 1) out.push({ t: 'p', s: tt }); } else walk(c); });
    }
    if (root) walk(root);
    return out;
  }
  function tableOf(tbl) {
    var cap = tbl.querySelector('caption'), head = null, rows = [], num = [], hl = -1, n = 0;
    var th = tbl.querySelector('thead tr'); if (th) { head = [].map.call(th.children, function (c, i) { if (isNum(c)) num.push(i); if (/\bis-hg\b/.test(c.className)) hl = i; return cellText(c); }); n = head.length; }
    [].forEach.call(tbl.querySelectorAll('tbody tr, :scope > tr'), function (tr) {
      var cells = [].map.call(tr.children, function (c) { return { s: cellText(c), b: c.tagName === 'TH', num: isNum(c), hl: /\bis-hg\b/.test(c.className), span: c.colSpan > 1 ? c.colSpan : 0 }; }), cl = tr.className || '';
      if (!head && cells.length && cells.every(function (c) { return c.b; }) && !rows.length && tr.parentNode.tagName === 'THEAD') return;
      var r = { cells: cells }; if (/\bgrp\b/.test(cl)) r.grp = true; if (/\bsum\b/.test(cl)) r.sum = true; if (/\btotal\b/.test(cl)) r.total = true; n = Math.max(n, cells.reduce(function (a, c) { return a + (c.span || 1); }, 0)); rows.push(r);
    });
    var w = null; if (head && n > 2) { var narrow = head.map(function (h, i) { return /^(No\.?|#|№)$/i.test(h) ? 0.06 : num.indexOf(i) >= 0 ? 0.13 : 0; }), rest = 1 - narrow.reduce(function (a, x) { return a + x; }, 0), wide = narrow.filter(function (x) { return !x; }).length; if (wide) w = narrow.map(function (x) { return x || rest / wide; }); }
    return { t: 'table', head: head, rows: rows, n: n, num: num, hl: hl, caption: cap ? cellText(cap) : null, w: w };
  }
  /* the system build-up list of a guide (the layer buttons) as a table */
  function layersOf(id, tr2) {
    var el = document.getElementById(id); if (!el) return null; var rows = [];
    [].forEach.call(el.querySelectorAll('li'), function (li) { var n = li.querySelector('.cr-layer__n'), main = li.querySelector('.cr-layer__main'); if (!main) return; var b = main.querySelector('b'), role = main.children[1] ? cellText(main.children[1]) : '', facts = [].map.call(main.querySelectorAll('.cr-layer__facts > span'), function (f) { var em = f.querySelector('em'); return [em ? cellText(em) : '', f.textContent.replace(em ? em.textContent : '', '').trim()]; });
      rows.push({ n: n ? cellText(n) : '', name: b ? cellText(b) : '', role: role, facts: facts }); });
    if (!rows.length) return null;
    var fl = rows.reduce(function (a, r) { return r.facts.length > a.length ? r.facts.map(function (f) { return f[0]; }) : a; }, []);
    return { t: 'table', head: ['No.', tr2.layer, tr2.role].concat(fl), rows: rows.map(function (r) { var fm = {}; r.facts.forEach(function (f) { fm[f[0]] = f[1]; }); return { cells: [{ s: r.n }, { s: r.name, b: true }, { s: r.role }].concat(fl.map(function (k) { return { s: fm[k] || '—' }; })) }; }), n: 3 + fl.length, w: [0.05, 0.2, 0.33].concat(fl.map(function () { return 0.42 / fl.length; })), small: true };
  }

  /* ----- figures ----- */
  function loadImg(src) { return new Promise(function (res, rej) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = rej; im.src = src; }); }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function haloText(g, s, x, y, font, col) { g.font = font; g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.92)'; g.strokeText(s, x, y); g.fillStyle = col || INK; g.fillText(s, x, y); }
  function wrapCanvas(g, s, max, font) { g.font = font; var words = /[　-鿿＀-￯]/.test(s) ? s.split('') : s.split(' '), lines = [], cur = ''; var sep = /[　-鿿＀-￯]/.test(s) ? '' : ' '; words.forEach(function (w) { var t = cur ? cur + sep + w : w; if (g.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  /* a 3D section still of the engine with the page's callouts drawn on it */
  function fig3d(ctx, stageIdx, p, W, H, big) {
    W = W || 1120; H = H || 762; var sec = ctx.sec; if (!sec || !ctx.cam) return Promise.resolve(null);
    var C = ctx.cam(stageIdx), sn; try { sn = sec.snapshot(stageIdx, W, H, { az: C.az, el: C.el, dist: C.dist, t: C.t, fit: 'h', tw: p == null ? 1 : p }); } catch (e) { sn = null; }
    if (!sn || !sn.url) return Promise.resolve(null);
    return loadImg(sn.url).then(function (im) {
      var c = canvas(W, H), g = c.getContext('2d'); g.drawImage(im, 0, 0, W, H);
      var LB = ctx.labels || {}, LX = Math.round(W * 0.7), H2 = UX._h, an = sn.anchors.filter(function (a) { return isFinite(a.x) && isFinite(a.y) && a.x > -0.2 && a.x < 1.2 && a.y > -0.2 && a.y < 1.2; }).map(function (a) { return { k: a.k, x: a.x * W, y: a.y * H }; });
      var RH = big ? 40 : 28, rows = H2.layout(an, H, RH, 68), font = '400 ' + Math.round(W / (big ? 36 : 56)) + 'px ' + getComputedStyle(document.body).fontFamily; if (big) LX = Math.round(W * 0.6);
      rows.forEach(function (qq) { var lines = H2.wrapLabel(LB[qq.k] || qq.k); g.beginPath(); g.moveTo(LX, qq.ly); g.lineTo(qq.x, qq.y); g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(qq.x, qq.y, 4.4, 0, 7); g.fillStyle = INK; g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#fff'; g.stroke();
        lines.forEach(function (t, n) { haloText(g, t, LX + 10, qq.ly + 8 + (lines.length === 2 ? (n ? (big ? 20 : 16) : (big ? -18 : -14)) : 0), font); }); });
      return { t: 'img', src: c.toDataURL('image/jpeg', 0.9), w: W, h: H };
    });
  }
  /* the joint at micro scale (the inspector's micro model: the pressed rod, the primer film, the tooled bead), photographed from its home view */
  function figMicro(ctx, stageIdx, W, H) { W = W || 1120; H = H || 762; var v = ctx.insp; if (!v || !v.setMicro || !v.micro) return Promise.resolve(null);
    var was = v.micro(), sn = null; try { v.setMicro(true); if (v.micro()) { v.reset(); var C = v.microCam ? v.microCam('sec') : null; sn = v.snapshot(stageIdx, W, H, C ? { fit: 'h', tw: 1, az: C.az, el: C.el, dist: C.dist, t: C.t } : { fit: 'h', tw: 1 }); } } catch (e) { sn = null; } try { if (!was) v.setMicro(false); else v.reset(); } catch (e) {}
    return Promise.resolve(sn && sn.url ? { t: 'img', src: sn.url, w: W, h: H } : null); }
  function heroImg(ctx, W, H) { var hv = ctx.hero; if (!hv) return Promise.resolve(null); try { var sn = hv.snapshot(0, W || 1000, H || 1000, { fit: 'h' }); return Promise.resolve(sn && sn.url ? { t: 'img', src: sn.url, w: W || 1000, h: H || 1000 } : null); } catch (e) { return Promise.resolve(null); } }

  /* dimension line between (x1,y1)-(x2,y2) with the text at the middle, offset d to the normal side */
  function dim(g, x1, y1, x2, y2, label, font) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    g.strokeStyle = BRAND_DARK; g.fillStyle = BRAND_DARK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    [[x1, y1, 1], [x2, y2, -1]].forEach(function (e) { g.beginPath(); g.moveTo(e[0], e[1]); g.lineTo(e[0] + e[2] * ux * 10 + nx * 4, e[1] + e[2] * uy * 10 + ny * 4); g.lineTo(e[0] + e[2] * ux * 10 - nx * 4, e[1] + e[2] * uy * 10 - ny * 4); g.closePath(); g.fill(); });
    /* the text beside the line, clear of it, on the left-hand side of the direction of travel; a downward line is lettered bottom-to-top like the others */
    var a = Math.atan2(dy, dx), flip = a > Math.PI / 2 - 1e-6 || a < -Math.PI / 2 - 1e-6; g.font = font; g.textAlign = 'center'; g.textBaseline = flip ? 'top' : 'bottom'; var mx = (x1 + x2) / 2 - nx * 6, my = (y1 + y2) / 2 - ny * 6; g.save(); g.translate(mx, my); g.rotate(flip ? a - Math.PI : a); haloText(g, label, 0, 0, font, BRAND_DARK); g.restore(); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  }
  function ext(g, x, y, ex, ey) { g.strokeStyle = BRAND_DARK; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); }
  function hatch(g, x, y, w, h, step, col, angle) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = col; g.lineWidth = 1; var k; for (k = -h - w; k < w + h; k += step) { g.beginPath(); if (angle === 'back') { g.moveTo(x + k, y); g.lineTo(x + k + h, y + h); } else { g.moveTo(x + k, y + h); g.lineTo(x + k + h, y); } g.stroke(); } g.restore(); }
  function dots(g, x, y, w, h, n, col, seed) { var r = lcg(seed || 7), i; g.fillStyle = col; for (i = 0; i < n; i++) { g.beginPath(); g.arc(x + r() * w, y + r() * h, 1 + r() * 2.2, 0, 7); g.fill(); } }
  function leader(g, x, y, tx2, ty, text, font, align) { g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(tx2, ty); g.lineTo(tx2 + (align === 'left' ? -14 : 14), ty); g.stroke(); g.beginPath(); g.arc(x, y, 3, 0, 7); g.fillStyle = INK; g.fill(); g.textAlign = align === 'left' ? 'right' : 'left'; haloText(g, text, tx2 + (align === 'left' ? -20 : 20), ty + 5, font); g.textAlign = 'left'; }
  function titleBox(g, W, H, title, note, font) { g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(1, 1, W - 2, H - 2); g.font = 'bold ' + font; var tw = g.measureText(title).width; g.font = font; var bw = Math.min(W - 40, Math.max(tw, g.measureText(note).width) + 30); g.fillStyle = '#fff'; g.fillRect(W - bw - 2, H - 58, bw, 56); g.strokeRect(W - bw - 2, H - 58, bw, 56); g.fillStyle = INK; g.font = 'bold ' + font; g.fillText(title, W - bw + 12, H - 36); g.font = font; g.fillStyle = GREY; g.fillText(note, W - bw + 12, H - 14); }

  /* the sealant joint detail: a dimensioned section through the joint as designed on the page (W, D), with the same geometry as the 3D micro view —
     the closed-cell PE rod (nominal ø ≈ 1.3 W) pressed into the joint, its crown setting the sealant depth, the primer film on the two bond faces,
     the tooled (concave) surface, masking tape beside the arrises; behind the rod the joint continues to its backing (thick members: joint filler /
     inner seal as designed, cut by a break line) or to the channel of the steel joiner under a thin cladding board; shallow edge seals without a
     rod are filled to a bond-breaker tape. W, D, the rod and a thin board are to scale (px/mm chosen so the joint fills the sheet) */
  function drawJoint(x) { // x = { w, d (mm), rod, metal, thin, thick (mm), vent, paint, clear, sub, names: { sub, alu, rod, primer, seal, tape, bb, paint, joiner, back }, title, note, font }
    var W = 1600, H = 900, c = canvas(W, H), g = c.getContext('2d'), font = '400 22px ' + x.font, fs = '400 20px ' + x.font; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    var w = Math.max(4, x.w), d = Math.max(3, x.d), hasRod = !!x.rod, thin = !!x.thin, metal = !!x.metal, vent = !!x.vent, tB = thin ? (x.thick || 16) : 0, N = x.names;
    /* the rod as pressed (mm), as in the micro view: half-width 1.08·W/2 (it bulges into the flank), half-height 1.3·1.08·W/2 — the crown at the design depth */
    var ra = hasRod ? w / 2 * 1.08 : 0, rv = hasRod ? w / 2 * 1.3 * 1.08 : 0, rodH = 2 * rv, bbT = 0.6;
    var below = hasRod ? d + rodH : d + bbT; // the bottom of the rod / of the bond-breaker tape (mm below the face)
    var yBackMM = thin ? (hasRod ? Math.max(tB + 10, below + 2.5) : tB) : below + (hasRod ? Math.max(3, w * 0.25) : 0); // the backing top (thick) / the channel bottom (thin)
    var spanMM = thin ? Math.max(yBackMM + 2.5, tB) : yBackMM + 16; // mm of section drawn under the face
    var AY0 = 215, AY1 = 835, cx = 600, bw = 280;
    var S = Math.max(5, Math.min(20, 380 / w, (AY1 - AY0 - 40) / spanMM)); // px per mm
    var top = AY0, jw = w * S, hw = jw / 2, xL = cx - hw, xR = cx + hw, yBot0 = thin ? top + tB * S : AY1, yBot = yBot0, yBk = top + yBackMM * S, L = [];
    var FILM = 4, raP = ra * S, rvP = rv * S, yr = top + (d + rv) * S, tP = hasRod ? Math.acos(Math.min(1, (hw - FILM) / raP)) : 0, yFoot = hasRod ? yr - rvP * Math.sin(tP) : top + d * S;
    /* substrates: a cladding board (fine stipple), ALC (porous), PCa / RC (aggregate and hatch); the right member of a frame or hood joint is metal */
    function member(x0, kind, yB) { var yBot = yB || yBot0, col = kind === 'alu' ? '#c9ccd0' : kind === 'alc' ? '#ebe8df' : kind === 'siding' ? '#ddd7c9' : '#dedad2'; g.fillStyle = col; g.fillRect(x0, top, bw, yBot - top);
      if (kind === 'alu') hatch(g, x0, top, bw, yBot - top, 12, 'rgba(60,64,70,.38)', 'back'); else if (kind === 'alc') dots(g, x0, top, bw, yBot - top, Math.round((yBot - top) * 0.5), 'rgba(120,115,105,.35)', x0 > cx ? 5 : 3); else if (kind === 'siding') dots(g, x0, top, bw, yBot - top, Math.round((yBot - top) * 0.6), 'rgba(90,86,80,.45)', x0 > cx ? 5 : 3); else { hatch(g, x0, top, bw, yBot - top, 16, 'rgba(90,86,80,.45)'); dots(g, x0, top, bw, yBot - top, Math.round((yBot - top) * 0.11), 'rgba(90,86,80,.5)', x0 > cx ? 5 : 3); }
      g.strokeStyle = INK; g.lineWidth = 2; if (thin) g.strokeRect(x0, top, bw, yBot - top); else { g.beginPath(); g.moveTo(x0, yBot); g.lineTo(x0, top); g.lineTo(x0 + bw, top); g.lineTo(x0 + bw, yBot); g.stroke(); } }
    var subKind = x.sub === 'alc' ? 'alc' : x.sub === 'siding' ? 'siding' : 'rc';
    member(xL - bw, subKind); member(xR, metal ? 'alu' : subKind, metal && thin && hasRod ? yBk + 3 : null); // a window frame is deeper than the cladding board: it runs down past the joiner's channel
    if (!thin) { /* the joint continues behind the rod to its backing: joint filler / inner seal as designed (light hatch), then the break line through the members */
      g.fillStyle = '#b9b5ab'; g.fillRect(xL, yBk, jw, yBot - yBk); hatch(g, xL, yBk, jw, yBot - yBk, 9, 'rgba(70,66,60,.5)', 'back'); g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(xL, yBk); g.lineTo(xR, yBk); g.stroke(); L.push([cx, yBk + Math.min(40, (yBot - yBk) / 2), N.back]);
      var zy = yBot - 22, i, X0 = xL - bw, X1 = xR + bw; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(X0 - 2, zy); for (i = 0; i <= 30; i++) g.lineTo(X0 - 2 + (X1 - X0 + 4) * i / 30, zy + (i % 2 ? 14 : 0)); g.lineTo(X1 + 2, yBot + 6); g.lineTo(X0 - 2, yBot + 6); g.closePath(); g.fill();
      g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(X0 - 2, zy); for (i = 0; i <= 30; i++) g.lineTo(X0 - 2 + (X1 - X0 + 4) * i / 30, zy + (i % 2 ? 14 : 0)); g.stroke(); }
    else if (hasRod) { /* the galvanised steel joiner: flanges under the boards, a channel under the joint holding the rod */
      var st = 3, xc0 = xL - st - 2, xc1 = xR + st + 2, ych = yBk; g.fillStyle = '#b8bcbf'; g.strokeStyle = INK; g.lineWidth = 1;
      [[xL - bw - 40, yBot, xc0 - (xL - bw - 40), st], metal ? null : [xc1, yBot, xR + bw + 40 - xc1, st], [xc0 - st, yBot, st, ych - yBot + st], metal ? null : [xc1, yBot, st, ych - yBot + st], [xc0 - st, ych, (metal ? xR : xc1) - xc0 + 2 * st, st]].forEach(function (r) { if (!r) return; g.fillRect(r[0], r[1], r[2], r[3]); g.strokeRect(r[0], r[1], r[2], r[3]); });
      L.push([metal ? xc0 - st / 2 : xc1 + 1, metal ? (yBot + ych) / 2 : ych + st / 2, N.joiner]); }
    else { /* a shallow edge seal (hood flange): the sheet of the flange runs on under the board, the gap is backed up to the bond-breaker tape */
      var st2 = 3; g.fillStyle = '#b8bcbf'; g.strokeStyle = INK; g.lineWidth = 1; g.fillRect(xL - bw - 40, yBot, bw + 40 + jw, st2); g.strokeRect(xL - bw - 40, yBot, bw + 40 + jw, st2);
      g.fillStyle = '#8a877f'; g.fillRect(xL, top + (d + bbT) * S, jw, yBot - top - (d + bbT) * S); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(xL, top + (d + bbT) * S, jw, yBot - top - (d + bbT) * S); L.push([cx, (top + (d + bbT) * S + yBot) / 2, N.backEdge]); }
    if (!thin && metal) { /* the frame continues down past the break line as a solid member: nothing more to draw */ }
    /* the rod: a pressed ellipse, clipped by the flanks; its crown is the bottom of the sealant */
    if (hasRod) { g.save(); g.beginPath(); g.rect(xL, top, jw, (thin ? yBk : yBot) - top); g.clip(); g.fillStyle = '#d6d9db'; g.beginPath(); g.ellipse(cx, yr, raP, rvP, 0, 0, 7); g.fill(); g.save(); g.beginPath(); g.ellipse(cx, yr, raP - 2, rvP - 2, 0, 0, 7); g.clip(); dots(g, cx - raP, yr - rvP, 2 * raP, 2 * rvP, Math.round(raP * rvP / 90), 'rgba(120,125,130,.4)', 11); g.restore(); g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, yr, raP, rvP, 0, 0, 7); g.stroke(); g.restore();
      L.push([cx + hw * 0.35, yr + rvP * 0.25, N.rod + ' ø ≈ ' + Math.round(w * 1.3) + ' mm (≈ 1.3 W)']); }
    else { g.fillStyle = '#efe9d8'; g.fillRect(xL, top + d * S, jw, Math.max(5, bbT * S)); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(xL, top + d * S, jw, Math.max(5, bbT * S)); L.push([cx, top + d * S + Math.max(5, bbT * S) / 2, N.bb]); }
    /* the primer film on the two bond faces: from the arris to the foot of the bond face (the rod's flank or the tape) */
    g.fillStyle = '#d9c46e'; g.fillRect(xL, top - 1, FILM, yFoot - top + 1); g.fillRect(xR - FILM, top - 1, FILM, yFoot - top + 1); L.push([xR - FILM / 2, top + (yFoot - top) * 0.5, N.primer]);
    /* the sealant: tooled concave top, the two bond faces, the rod's crown (or the tape) as the bottom */
    var sag = hw * 0.15; g.fillStyle = x.clear ? 'rgba(205,214,220,.8)' : '#6d7073'; g.beginPath(); g.moveTo(xL + FILM, top); g.quadraticCurveTo(cx, top + 2 * sag, xR - FILM, top); g.lineTo(xR - FILM, yFoot);
    if (hasRod) g.ellipse(cx, yr, raP, rvP, 0, -tP, tP - Math.PI, true); else g.lineTo(xL + FILM, yFoot);
    g.lineTo(xL + FILM, top); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); L.push([cx - hw * 0.3, top + d * S * 0.55, N.seal]);
    /* masking tape beside the arrises (removed after tooling); on a painted joint the paint film over the cured bead and the wall instead */
    if (x.paint) { g.strokeStyle = '#8a8f96'; g.lineWidth = 5; g.beginPath(); g.moveTo(xL - bw, top - 3); g.lineTo(xL + FILM, top - 3); g.quadraticCurveTo(cx, top + 2 * sag - 3, xR - FILM, top - 3); g.lineTo(xR + bw, top - 3); g.stroke(); L.push([xR + 70, top - 3, N.paint]); }
    else { g.fillStyle = 'rgba(230,220,185,.9)'; g.fillRect(xL - 150, top - 6, 150, 6); g.fillRect(xR, top - 6, 150, 6); g.setLineDash([6, 5]); g.strokeStyle = '#8a7d4a'; g.lineWidth = 1.6; g.strokeRect(xL - 150, top - 6, 150, 6); g.strokeRect(xR, top - 6, 150, 6); g.setLineDash([]); L.push([xR + 110, top - 3, N.tape]); }
    L.push([xR + bw * 0.55, top + (yBot - top) * (thin ? 0.5 : 0.28), metal ? N.alu : N.sub]); if (metal) L.push([xL - bw * 0.5, top + (yBot - top) * (thin ? 0.5 : 0.3), N.sub]);
    /* dimensions: W over the joint, D (the sealant depth at the crown) and, for a thin board, its thickness on the left */
    ext(g, xL, top - 8, xL, top - 100); ext(g, xR, top - 8, xR, top - 100); dim(g, xL, top - 78, xR, top - 78, 'W = ' + x.w + ' mm', font);
    ext(g, xL - bw, top, xL - bw - 74, top); g.save(); g.setLineDash([5, 4]); ext(g, xL, top + d * S, xL - bw - 74, top + d * S); g.restore(); dim(g, xL - bw - 54, top, xL - bw - 54, top + d * S, 'D = ' + x.d + ' mm', font);
    if (thin) { ext(g, xL - bw, yBot, xL - bw - 124, yBot); dim(g, xL - bw - 104, top, xL - bw - 104, yBot, tB + ' mm', fs); }
    /* the labels in a column on the right, in the order of their anchors, wrapped, clear of the title box */
    var LX = 1125, LH = 27, maxW = W - LX - 40, rows = L.map(function (lb) { return { x: lb[0], y: lb[1], lines: wrapCanvas(g, lb[2], maxW, font) }; }).sort(function (a, b) { return a.y - b.y; });
    var yMin = 96, yMax = H - 84, py = yMin; rows.forEach(function (r) { r.h = r.lines.length * LH; r.top = Math.max(py, r.y - r.h / 2); py = r.top + r.h + 16; });
    var over = py - 16 - yMax; if (over > 0) { rows.forEach(function (r) { r.top -= over; }); var cum = yMin; rows.forEach(function (r) { r.top = Math.max(r.top, cum); cum = r.top + r.h + 10; }); }
    rows.forEach(function (r) { var ly = r.top + r.h / 2; g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(LX, ly); g.lineTo(LX + 14, ly); g.stroke(); g.beginPath(); g.arc(r.x, r.y, 3.2, 0, 7); g.fillStyle = INK; g.fill(); r.lines.forEach(function (s, i) { haloText(g, s, LX + 22, r.top + LH * (i + 1) - 7, font); }); });
    titleBox(g, W, H, x.title, x.note, '22px ' + x.font);
    return { t: 'img', src: c.toDataURL('image/png'), w: W, h: H };
  }
  /* a layer build-up: the substrate with the system's layers on it, exaggerated thicknesses, labelled and dimensioned; the coats turn up a wall when asked */
  function drawStack(x) { // x = { layers: [{ n, name, thick, kind, col, grit, fillet }], sub: { name, kind }, upstand, upText, total, title, note, font }
    var W = 1600, H = 900, c = canvas(W, H), g = c.getContext('2d'), font = '400 22px ' + x.font, fs = '400 19px ' + x.font; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    var x0 = 140, x1 = x.upstand ? 820 : 900, yBase = 600, hSub = 140, up = x.upstand ? 300 : 0, wallW = 150, HK = { film: 22, coat: 34, adh: 30, bead: 30, board: 54, sheet: 28, panel: 76, mortar: 64, rod: 34 };
    // substrate (and the wall of the upstand)
    g.fillStyle = x.sub.kind === 'frp' ? '#b9c3c9' : x.sub.kind === 'steel' ? '#c9ccd0' : '#dedad2'; g.fillRect(x0, yBase, x1 - x0, hSub); if (x.sub.kind !== 'frp') { hatch(g, x0, yBase, x1 - x0, hSub, 16, 'rgba(90,86,80,.45)'); dots(g, x0, yBase, x1 - x0, hSub, 50, 'rgba(90,86,80,.5)', 3); }
    if (x.upstand) { g.fillStyle = '#dedad2'; g.fillRect(x1, yBase - up, wallW, up + hSub); hatch(g, x1, yBase - up, wallW, up + hSub, 16, 'rgba(90,86,80,.45)'); dots(g, x1, yBase - up, wallW, up + hSub, 40, 'rgba(90,86,80,.5)', 4); }
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); if (x.upstand) { g.moveTo(x0, yBase); g.lineTo(x1, yBase); g.lineTo(x1, yBase - up); g.lineTo(x1 + wallW, yBase - up); g.lineTo(x1 + wallW, yBase + hSub); g.lineTo(x0, yBase + hSub); g.closePath(); } else g.rect(x0, yBase, x1 - x0, hSub); g.stroke();
    var y = yBase, xw = x1, i, L = x.layers, lab = [], upH = 210, sumH = L.reduce(function (a, l) { return a + (HK[l.kind] || 24); }, 0), SC = Math.max(1, Math.min(2.4, 330 / Math.max(1, sumH)));
    for (i = 0; i < L.length; i++) { var l = L[i], h = Math.round((HK[l.kind] || 24) * SC), yt = y - h, turnsUp = x.upstand && (l.kind === 'coat' || l.kind === 'film');
      g.fillStyle = l.col || '#888';
      if (l.kind === 'bead') { var k; for (k = x0 + 40; k < xw - 30; k += 90) { g.beginPath(); g.ellipse(k, y - h / 2, 22, h / 2, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); } }
      else {
        if (l.fillet) { g.beginPath(); g.moveTo(xw - 70, y); g.lineTo(xw, y); g.lineTo(xw, y - 70); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke(); }
        g.fillRect(x0, yt, xw - x0, h);
        if (turnsUp) { g.fillRect(xw - h, yBase - upH, h, upH - (yBase - y)); }
        if (l.kind === 'board') { g.strokeStyle = 'rgba(80,60,30,.35)'; g.lineWidth = 1; var q; for (q = yt + 8; q < y; q += 9) { g.beginPath(); g.moveTo(x0, q); g.lineTo(xw, q); g.stroke(); } var bx; for (bx = x0 + 160; bx < xw; bx += 160) { g.strokeStyle = INK; g.beginPath(); g.moveTo(bx, yt); g.lineTo(bx, y); g.stroke(); } }
        if (l.kind === 'mortar') { hatch(g, x0, yt, xw - x0, h, 14, 'rgba(90,86,80,.35)', 'back'); dots(g, x0, yt, xw - x0, h, 60, 'rgba(90,86,80,.45)', 9 + i); }
        if (l.kind === 'adh') { var t2; g.strokeStyle = 'rgba(60,50,30,.5)'; g.lineWidth = 2; for (t2 = x0 + 6; t2 < xw; t2 += 10) { g.beginPath(); g.moveTo(t2, yt + 4); g.lineTo(t2, y - 2); g.stroke(); } }
        if (l.kind === 'panel') { var pp; g.fillStyle = '#c4501e'; for (pp = x0 + 60; pp < xw; pp += 120) { g.beginPath(); g.arc(pp, yt + h / 2, 12, 0, 7); g.fill(); } }
        if (l.kind === 'coat' && l.grit) dots(g, x0, yt, xw - x0, h, 110, 'rgba(40,40,40,.6)', 21);
        g.strokeStyle = INK; g.lineWidth = 1.2; g.strokeRect(x0, yt, xw - x0, h); if (turnsUp) g.strokeRect(xw - h, yBase - upH, h, upH - (yBase - y));
      }
      lab.push({ x: turnsUp ? xw - h / 2 : (x0 + xw) / 2 + 60 * (i % 3), y: turnsUp ? yBase - upH + 24 + i * 6 : y - h / 2, text: (l.n ? l.n + '  ' : '') + l.name + (l.thick ? ' — ' + l.thick : '') });
      y = yt; if (turnsUp) { xw -= h; upH -= 10; }
    }
    // labels on the right, two lines each when long
    var lx = x1 + (x.upstand ? wallW + 70 : 80), maxW = W - lx - 50, rows = lab.map(function (lb) { return { lb: lb, lines: wrapCanvas(g, lb.text, maxW, fs) }; }).reverse(), gapL = 24, totH = rows.reduce(function (a, r) { return a + r.lines.length * gapL + 14; }, 0), ty = Math.max(60, Math.min(y - 30, yBase + hSub - 40 - totH));
    rows.forEach(function (r) { var need = r.lines.length * gapL + 14; leader(g, r.lb.x, r.lb.y, lx, ty, r.lines[0], fs); r.lines.slice(1).forEach(function (ln, j) { haloText(g, ln, lx + 20, ty + 5 + (j + 1) * gapL, fs); }); ty += need; });
    var sl = wrapCanvas(g, x.sub.name, maxW, fs); leader(g, (x0 + x1) / 2, yBase + hSub / 2, lx, Math.max(ty, yBase + hSub / 2), sl[0], fs); sl.slice(1).forEach(function (ln, j) { haloText(g, ln, lx + 20, Math.max(ty, yBase + hSub / 2) + 5 + (j + 1) * gapL, fs); });
    if (x.total) { ext(g, x0, y, x0 - 60, y); ext(g, x0, yBase, x0 - 60, yBase); dim(g, x0 - 40, y, x0 - 40, yBase, x.total, fs); }
    if (x.upstand && x.upText) { ext(g, x1 + wallW, yBase - 210, x1 + wallW + 50, yBase - 210); ext(g, x1 + wallW, yBase, x1 + wallW + 50, yBase); dim(g, x1 + wallW + 34, yBase - 210, x1 + wallW + 34, yBase, x.upText, fs); }
    titleBox(g, W, H, x.title, x.note, '22px ' + x.font);
    return { t: 'img', src: c.toDataURL('image/png'), w: W, h: H };
  }
  /* a horizontal bar chart of one parameter across the classes; the guide's product first, in the brand colour */
  function barChart(x) { // { title, unit, better, rows: [{ name, sub, v, alts: [{name, v}], jis, hl }], na, jisLabel, font }
    var rows = [], max = 0; x.rows.forEach(function (r) { rows.push({ name: r.name, sub: r.sub, v: r.v, hl: r.hl, jis: r.jis }); (r.alts || []).forEach(function (a) { rows.push({ name: a.name, v: a.v, alt: true, hl: r.hl }); }); [r.v, r.jis].concat((r.alts || []).map(function (a) { return a.v; })).forEach(function (v) { if (v != null) max = Math.max(max, v); }); });
    if (!max) max = 1; var RH = 54, W = 1400, H = 120 + rows.length * RH + 34, c = canvas(W, H), g = c.getContext('2d'), font = '400 27px ' + x.font, fb = '700 30px ' + x.font, fs = '400 23px ' + x.font, X0 = 520, X1 = W - 190;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.font = fb; g.fillText(x.title, 24, 44); g.font = font; g.fillStyle = GREY; g.fillText(x.unit + ' · ' + x.better, 24 + g.measureText(x.title).width * 1.1 + 40, 44);
    g.strokeStyle = LINE; g.lineWidth = 1; g.beginPath(); g.moveTo(X0, 70); g.lineTo(X0, H - 20); g.stroke();
    rows.forEach(function (r, i) { var y = 90 + i * RH, col = r.hl ? (r.alt ? '#fbbf85' : BRAND) : r.alt ? '#c9c9c9' : '#8a8a8a'; g.font = r.alt ? fs : font; g.fillStyle = r.alt ? GREY : INK; g.textAlign = 'right'; g.fillText((r.alt ? '  ' : '') + r.name, X0 - 16, y + 20); if (r.sub && !r.alt) { g.font = fs; g.fillStyle = GREY; g.fillText(r.sub, X0 - 16, y + 40); } g.textAlign = 'left';
      if (r.v == null) { g.font = fs; g.fillStyle = GREY; g.fillText('— ' + x.na, X0 + 12, y + 22); return; }
      var w = Math.max(6, (X1 - X0) * r.v / max); g.fillStyle = col; g.fillRect(X0, y + (r.alt ? 8 : 4), w, r.alt ? 18 : 26); g.font = r.hl && !r.alt ? fb : font; g.fillStyle = r.hl ? BRAND_DARK : INK; g.fillText(fmtN(r.v), X0 + w + 12, y + 24);
      if (r.jis != null) { var jx = X0 + (X1 - X0) * r.jis / max; g.strokeStyle = INK; g.setLineDash([5, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(jx, y - 2); g.lineTo(jx, y + 36); g.stroke(); g.setLineDash([]); g.font = fs; g.fillStyle = GREY; g.fillText(x.jisLabel + ' ' + fmtN(r.jis), jx + 8, y + 50 - 8); } });
    return { t: 'img', src: c.toDataURL('image/png'), w: W, h: H };
  }
  function fmtN(v) { return Number(v).toLocaleString(LANG === 'zh' ? 'zh-TW' : LANG === 'ja' ? 'ja-JP' : 'en-US', { maximumFractionDigits: v < 1 ? 2 : v < 10 ? 1 : 0 }); }
  function lcg(seed) { var s = seed * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  /* ----- the documents ----- */
  var docLang = null; // the language of the document being built (set by build); the page is switched to it meanwhile
  function L(k) { return DocUI.t(k, docLang || LANG); }
  /* the project data entered in the documents dialog, as the key/value block every site document opens with (only the fields that were filled in) */
  function projectRows(meta, o) { var P = meta.project, K = meta.customer, C = meta.company, r = []; o = o || {};
    function add(k, v) { if (v) r.push([L(k), v]); }
    add('fProject', P.name); add('fProjectNo', P.no); add('fSite', P.site); add('fArea', P.area); add('fQty', P.qty); add('fPeriod', P.period); add('fContract', P.contract);
    add('fCustomer', [K.name, K.dept].filter(Boolean).join(' · ') + (K.person ? ' — ' + [K.person, K.title].filter(Boolean).join(' · ') : ''));
    add('fOwner', P.owner); add('fConsultant', P.consultant); add('fContractor', P.contractor || (o.contractorIssuer ? C.name : ''));
    return r; }
  function signNames(meta, keys) { var P = meta.project, C = meta.company, K = meta.customer, M = { prepared: P.prepared || C.person, reviewed: P.reviewed, approved: P.approved, issuer: [C.person, C.title].filter(Boolean).join(' · '), client: [K.person, K.title].filter(Boolean).join(' · '), contractor: P.contractor || C.name, consultant: P.consultant, owner: P.owner }; var n = keys.map(function (k) { return M[k] || ''; }); return n.some(Boolean) ? n : null; }
  function catTitle(cat) { return strip(tr('title.' + cat)); }
  function fontFamily() { return LANG === 'ja' ? '"Noto Sans JP","Noto Sans TC",sans-serif' : '"Noto Sans TC","Noto Sans JP",sans-serif'; }
  function docxFont() { return fontFamily(); }
  function stepBlocks(ctx, st, i) { var c = st.c, out = []; out.push({ t: 'h', l: 2, s: (i + 1) + '. ' + T(c.title) + (c.tag ? '  ·  ' + T(c.tag) : '') }); if (c.short) out.push({ t: 'p', s: T(c.short), st: 'lead' }); if (c.overview) out.push({ t: 'p', s: T(c.overview) }); if (c.points && c.points.length) out.push({ t: 'ul', items: c.points.map(T) }); if (c.src) out.push({ t: 'p', s: L('src') + ': ' + T(c.src), st: 'note' }); return out; }
  function figsOfSteps(ctx, steps, o) { // one still per procedure step (the stage at its progress), in order
    o = o || {}; var jobs = steps.map(function (st) { return { i: st.stage, p: st.p }; });
    return jobs.reduce(function (pr, j) { return pr.then(function (acc) { return fig3d(ctx, j.i, j.p, o.W, o.H, o.big).then(function (f) { acc.push(f); return acc; }); }); }, Promise.resolve([]));
  }
  function drawingOf(ctx) { // the technical section drawing of the current scenario
    var X = ctx.extra || {}, font = fontFamily(), note = L('drawNote'), lr = layersOf(ctx.ids.layers, { layer: '', role: '' }), names = lr ? lr.rows.map(function (r) { return { name: r.cells[1].s, thick: r.cells[3] ? r.cells[3].s : '' }; }) : [];
    if (ctx.cat === 'sl') { var cfg = X.cfg || {}, J = X.joint || { w: 10, d: 10 }, N = L('jointNames'), has = { rod: ctx.stages.indexOf('backer') >= 0, paint: ctx.stages.indexOf('paint') >= 0 };
      var sealName = names.filter(function (n) { return /EXCEED|CLIO|101A|TF2000|R101|イクシード|クリオ/.test(n.name); })[0], primName = names.filter(function (n) { return /OP-20/.test(n.name); })[0];
      return drawJoint({ w: J.w, d: J.d, rod: has.rod, metal: !!(cfg.sash || cfg.vent), vent: !!cfg.vent, thin: cfg.thick < 0.05, thick: Math.round((cfg.thick || 0.016) * 1000), sub: cfg.sub, paint: has.paint, clear: X.seal === 'CLIO', font: font, title: L('drawJoint') + ' — ' + ctx.scnName, note: cfg.thick < 0.05 ? L('drawJointNoteThin') : L('drawJointNote'),
        names: { sub: N.sub, alu: N.alu, rod: N.rod, primer: (primName ? primName.name : N.primer) + ' ' + N.film, seal: (sealName ? sealName.name : N.seal) + ' ' + N.sealD, tape: N.tape, bb: N.bb, paint: N.paint, joiner: N.joiner, back: N.back, backEdge: N.backEdge } }); }
    names = names.filter(function (n, i) { return !(i === 0 && lr && lr.rows[0].cells[0].s === '0'); });
    if (!names.length && X.layers) names = X.layers;
    var cols = { prim: '#d9c46e', nbq: '#8b8e90', hg: '#6d7073', hg2: '#5a5d60', clear: 'rgba(200,215,225,.8)', adh: '#b7ab8a', board: '#d9b377', ply: '#e0c99b', mortar: '#c4c0b6', sheet: '#8f9ba3', panel: '#d8d2c6', bead: '#cfc19a' };
    var layers = names.map(function (n, i) { var nm = n.name, k = 'film', col = cols.prim, grit = false, fillet = null;
      if (/踢腳|skirting|Skirting|巾木|Qィック|RCQ|リペアカラー/i.test(nm)) { k = 'skip'; } else if (/OP-55|OP-30|OP-20|底漆|プライマー|Primer/i.test(nm)) { k = 'film'; col = cols.prim; } else if (/NON-BLEED|NBQ|QUICK|クイック|Qイック/i.test(nm) && ctx.cat === 'ux') { k = 'film'; col = cols.nbq; fillet = cols.nbq; } else if (/UREAX|ウレアックス|HG/.test(nm)) { k = 'coat'; col = i % 2 ? cols.hg2 : cols.hg; grit = /骨材|aggregate|防滑|滑|grip/i.test(n.thick + nm) && i === names.length - 1; } else if (/PROTECT|プロテクト/.test(nm)) { k = 'coat'; col = cols.clear; } else if (/8800|8500|1000R|FS600|フロアスター|アドハー/.test(nm)) { k = /8500|FS600|フロアスター/.test(nm) && ctx.scn !== 'direct' ? 'bead' : 'adh'; col = cols.adh; } else if (/合板|plywood|Plywood|根太|joist|Joist/.test(nm)) { k = 'board'; col = cols.ply; } else if (/地板|flooring|Flooring|床材|フローリング/.test(nm)) { k = 'board'; col = cols.board; } else if (/塩ビ|PVC|sheet|Sheet|捲材|シート/.test(nm)) { k = 'sheet'; col = cols.sheet; } else if (/床暖|heating|Heating|パネル|panel/i.test(nm)) { k = 'panel'; col = cols.panel; } else if (/砂漿|mortar|Mortar|モルタル|整平|screed/i.test(nm)) { k = 'mortar'; col = cols.mortar; } 
      return { n: n.n || (i + 1), name: nm, thick: n.thick, kind: k, col: col, grit: grit, fillet: fillet }; }).filter(function (l) { return l.kind !== 'skip'; });
    var subName = L('subNames')[ctx.cat === 'ux' ? ctx.scn : ctx.cat === 'po' ? 'po' : ctx.scn] || L('subNames').def;
    return drawStack({ layers: layers, sub: { name: subName, kind: ctx.cat === 'ux' && ctx.scn === 'frp' ? 'frp' : 'mineral' }, upstand: ctx.cat === 'ux', upText: ctx.cat === 'ux' ? L('upstand') : null, total: X.total || null, font: font, title: L('drawStack') + ' — ' + ctx.scnName, note: L('drawNTS') + ' · ' + note });
  }
  function metaHead(ctx, kind) { return [{ t: 'meta', kind: kind }]; }

  /* a product section opens with a band (name and type line) rather than a plain heading; the first product follows the section heading, the others start a page */
  function productBand(bl, i) { var out = [], j = 0; if (bl.length && bl[0].t === 'h') { var h = bl[0], sub = bl[1] && bl[1].t === 'p' && bl[1].st === 'lead' ? bl[1] : null; out.push({ t: 'band', title: h.s, sub: sub ? sub.s : '', pb: i > 0 }); j = sub ? 2 : 1; } return out.concat(bl.slice(j)); }
  /* the products named in the system build-up (the layers table) — the materials a submittal carries */
  function systemProducts(ctx, lt) { var txt = lt ? lt.rows.map(function (r) { return r.cells.map(function (c) { return c.s; }).join(' '); }).join(' ') : ''; return ctx.products.filter(function (k) { var nm = pnPlain(k), sfx = (pnParts(k)[1] || '').trim(); return !!nm && (txt.indexOf(nm) >= 0 || (sfx.length > 2 && txt.indexOf(sfx) >= 0)); }); }
  function buildProductData(ctx, meta, opt) {
    var keys = opt.scope === 'all' ? ctx.products : [ctx.prod], cur = ctx.prod, blocks = [];
    keys.forEach(function (k, i) { if (ctx.showProduct && ctx.products.length > 1) ctx.showProduct(k); var el = document.getElementById(ctx.ids.prod); if (!el) return; if (i) blocks.push({ t: 'pb' }); blocks = blocks.concat(productBand(fromDom(el, { hl: 1 }), -1)); });
    if (ctx.showProduct && ctx.products.length > 1) ctx.showProduct(cur); // the page shows its product again
    blocks.push({ t: 'p', s: L('srcNote'), st: 'note' });
    return Promise.resolve(blocks);
  }
  function buildCatalogue(ctx, meta) {
    var M = document.getElementById(ctx.ids.cover), cover = M ? M.querySelector('.cover') : null, blocks = [];
    return heroImg(ctx, 1400, 800).then(function (hero) {
      if (cover) { var tag = cover.querySelector('.cover__tag'), claim = cover.querySelector('.cover__claim'), lead = cover.querySelector('.cover__lead, .cover__text, .cover__body'); if (tag) blocks.push({ t: 'p', s: cellText(tag), st: 'label' }); if (claim) blocks.push({ t: 'h', l: 1, s: cellText(claim) }); [].forEach.call(cover.querySelectorAll('.cover__main p:not(.cover__tag):not(.cover__claim):not(.label), .cover__body p'), function (p) { var s = strip(p.innerHTML); if (s && s.length > 20) blocks.push({ t: 'p', s: s, st: 'lead' }); }); if (!lead && !blocks.some(function (b) { return b.st === 'lead'; })) blocks.push({ t: 'p', s: ctx.problem, st: 'lead' }); }
      if (hero) blocks.unshift({ t: 'meta', kind: 'catalogue', cover: { src: hero.src, w: hero.w, h: hero.h, cap: L('heroCap') } });
      var stats = M ? M.querySelector('.stats, .cover__stats, .kpis') : null; if (stats) blocks = blocks.concat(fromDom(stats));
      blocks.push({ t: 'h', l: 1, s: L('catScenarios') });
      (ctx.extra.scenarios || []).forEach(function (s) { blocks.push({ t: 'h', l: 2, s: T(s.name) }); if (s.problem) blocks.push({ t: 'p', s: T(s.problem) }); if (s.solution) blocks.push({ t: 'p', s: T(s.solution) }); });
      var lt = layersOf(ctx.ids.layers, L('layerHead')); if (lt) { blocks.push({ t: 'h', l: 1, s: L('catSystem') + ' — ' + ctx.scnName }); blocks.push(lt); }
      var adv = document.getElementById(ctx.ids.adv), advL = document.getElementById(ctx.ids.advLists); if (adv) { blocks = blocks.concat(fromDom(adv, { hl: 1 })); } if (advL) blocks = blocks.concat(fromDom(advL, { hl: 2 }));
      blocks.push({ t: 'pb' }, { t: 'h', l: 1, s: L('catProducts') });
      var cur = ctx.prod; ctx.products.forEach(function (k, pi) { if (ctx.showProduct && ctx.products.length > 1) ctx.showProduct(k); var el = document.getElementById(ctx.ids.prod); if (!el) return; var bl = fromDom(el, { hl: 2 }), keep = [], seenTable = 0; bl.forEach(function (b) { if (b.t === 'table') { if (seenTable++ < 1) keep.push(b); return; } if (b.t === 'ul' && b.small) return; keep.push(b); }); blocks = blocks.concat(productBand(keep, -1)); });
      if (ctx.showProduct && ctx.products.length > 1) ctx.showProduct(cur); // the page shows its product again
      var qa = document.getElementById(ctx.ids.qa); if (qa) { blocks.push({ t: 'pb' }); blocks = blocks.concat(fromDom(qa, { hl: 1 })); }
      blocks.push({ t: 'p', s: L('srcNote'), st: 'note' });
      return blocks;
    });
  }
  function buildQuotation(ctx, meta) {
    var calc = document.getElementById(ctx.ids.calc), a4 = calc ? calc.querySelector('.a4') : null, blocks = [];
    if (a4) { var h1 = a4.querySelector('.a4__h'); if (h1) { var b = h1.querySelector('b'); blocks.push({ t: 'h', l: 1, s: (b ? cellText(b) : cellText(h1)) }); }
      [].forEach.call(a4.querySelectorAll('table'), function (tb) { var t = tableOf(tb); t.num = t.head ? t.head.map(function (x, i) { return i; }).filter(function (i) { return tb.querySelector('thead th:nth-child(' + (i + 1) + ')') && isNum(tb.querySelector('thead th:nth-child(' + (i + 1) + ')')); }) : [];
        /* no unit prices entered yet: the amounts read as "—", not as zero */
        var last = t.n - 1, priced = t.rows.some(function (r) { return !r.sum && !r.total && !r.grp && r.cells[last] && /[1-9]/.test(r.cells[last].s); }); if (!priced && t.num.length >= 2) t.rows.forEach(function (r) { t.num.slice(1).forEach(function (ci) { var c = r.cells[ci]; if (c && /^[0\s.,]*$/.test(c.s)) c.s = '—'; }); var c2 = r.cells[r.cells.length - 1]; if (c2 && /^[0\s.,]*$/.test(c2.s)) c2.s = '—'; });
        blocks.push(t); });
      var basis = a4.querySelector('.a4__notes'); var bh = [].filter.call(a4.querySelectorAll('h5'), function (h) { return !h.closest('.a4__meta'); }); bh.forEach(function (h) { blocks.push({ t: 'h', l: 3, s: cellText(h) }); var p = h.nextElementSibling; if (p && p.tagName === 'P') blocks.push({ t: 'p', s: strip(p.innerHTML) }); });
      var exn = a4.querySelector('.a4__ex'); if (exn) blocks.push({ t: 'box', s: cellText(exn) });
      if (basis) blocks.push({ t: 'ul', items: [].map.call(basis.querySelectorAll('li'), function (li) { return strip(li.innerHTML); }) });
    } else if (calc) { blocks = fromDom(calc, { hl: 1 }); }
    var qr = []; if (meta.customer.name || meta.customer.person) qr.push([L('qtTo'), [meta.customer.name, meta.customer.dept].filter(Boolean).join(' · ') + (meta.customer.person ? ' — ' + L('fAttn') + ' ' + [meta.customer.person, meta.customer.title].filter(Boolean).join(' · ') : '')]);
    projectRows(meta).forEach(function (r) { if (r[0] !== L('fCustomer')) qr.push(r); }); qr.push([L('qtRef'), meta.docNo], [L('fDate'), meta.date]); blocks.unshift({ t: 'kv', rows: qr });
    blocks.push({ t: 'h', l: 3, s: L('terms') }, { t: 'ul', items: L('termsList') });
    blocks.push({ t: 'sign', cols: [L('signIssuer'), L('signClient')], names: signNames(meta, ['issuer', 'client']) });
    return Promise.resolve(blocks);
  }
  function buildComparison(ctx, meta) {
    var blocks = [{ t: 'meta', kind: 'comparison', cover: {} }], V = ctx.extra.vs, font = fontFamily();
    if (V) { var Tt = V.T, N = V.N, CLS = V.CLS;
      blocks.push({ t: 'p', s: T(Tt.label), st: 'label' }, { t: 'h', l: 1, s: T(Tt.title) }, { t: 'p', s: T(Tt.sub), st: 'lead' }, { t: 'box', title: L('fair'), s: T(Tt.fair) });
      blocks.push({ t: 'kpis', items: Tt.kpi.map(function (k) { return [k[0], k[2], k[1]]; }) });
      blocks.push({ t: 'h', l: 2, s: L('classes') });
      blocks.push({ t: 'table', head: [''].concat(Tt.cardH), hl: -1, rows: CLS.map(function (k, i) { var c = Tt.classes[k]; return { cells: [{ s: T(c.name), b: true, hl: i === 0 }, { s: T(c.chem), hl: i === 0 }, { s: T(c.apply), hl: i === 0 }, { s: T(c.cure), hl: i === 0 }, { s: T(c.catch), hl: i === 0 }] }; }), n: 5, w: [0.16, 0.21, 0.21, 0.21, 0.21], small: true });
      blocks.push({ t: 'pb' }, { t: 'h', l: 2, s: T(Tt.bars.title) }, { t: 'p', s: L('chartNote'), st: 'note' });
      var charts = Tt.bars.items.map(function (it) { var key = it[0], rows = CLS.map(function (k, i) { var p = N[k]; return { name: T(Tt.rowsH[i + 1]), sub: p.name === Tt.rowsH[i + 1] ? '' : p.name, v: p[key], jis: p.jis && p.jis[key] != null ? p.jis[key] : null, hl: i === 0, alts: Object.keys(p).filter(function (q) { return /^alt/.test(q) && p[q] && p[q][key] != null; }).map(function (q) { return { name: p[q].name, v: p[q][key] }; }) }; });
        var ch = barChart({ title: it[1], unit: it[2], better: V.low && V.low[key] ? T(Tt.barsLow) : T(Tt.barsHigh), rows: rows, na: T(Tt.barsNA), jisLabel: T(Tt.barsJis), font: font }); ch.size = 'col'; return ch; });
      for (var ci = 0; ci < charts.length; ci += 2) blocks.push({ t: 'cols', w: [0.5, 0.5], cols: [[charts[ci]], charts[ci + 1] ? [charts[ci + 1]] : []], keep: true });
      blocks.push({ t: 'p', s: T(Tt.bars.note), st: 'note' });
      blocks.push({ t: 'pb' }, { t: 'h', l: 2, s: T(Tt.matrixTitle) }, { t: 'p', s: T(Tt.matrixSub), st: 'note' });
      blocks.push({ t: 'table', head: Tt.rowsH.map(T), hl: 1, rows: Tt.rows.map(function (r) { return { cells: [{ s: T(r[0]), b: true }].concat(r[1].map(function (c, i) { return { s: T(c), hl: i === 0 }; })) }; }), n: Tt.rowsH.length, w: [0.12].concat(Tt.rowsH.slice(1).map(function (x, i) { return i === 0 ? 0.2 : 0.68 / (Tt.rowsH.length - 2); })), small: true, landscape: true });
      blocks.push({ t: 'pb' }, { t: 'h', l: 2, s: T(Tt.aud.title) }, { t: 'p', s: T(Tt.aud.sub), st: 'lead' });
      Tt.aud.tabs.forEach(function (tb) { blocks.push({ t: 'h', l: 3, s: tb[1] }, { t: 'ol', items: (Tt.aud[tb[0]] || []).map(T) }); });
      blocks.push({ t: 'box', title: T(Tt.honest.title), s: T(Tt.honest.text) });
      blocks.push({ t: 'h', l: 3, s: T(Tt.src.title) }, { t: 'p', s: T(Tt.src.sub), st: 'note' }, { t: 'ol', items: V.SRC.map(function (s) { return s[0] + ' — ' + s[1] + ' — ' + s[2]; }), small: true });
    }
    var cmp = document.getElementById(ctx.ids.cmp); if (cmp) { if (blocks.length) blocks.push({ t: 'pb' }); blocks = blocks.concat(fromDom(cmp, { hl: 1 })); }
    blocks.push({ t: 'p', s: L('srcNote'), st: 'note' });
    return Promise.resolve(blocks);
  }
  function buildMethod(ctx, meta) {
    var blocks = [], steps = ctx.steps;
    return heroImg(ctx, 1400, 800).then(function (hero) { blocks.push({ t: 'meta', kind: 'method', cover: hero ? { src: hero.src, w: hero.w, h: hero.h, cap: L('heroCap') } : {} }); return buildMethodBody(ctx, meta, blocks, steps); });
  }
  function buildMethodBody(ctx, meta, blocks, steps) {
    blocks.push({ t: 'h', l: 1, s: L('ms1') }); var pr = projectRows(meta, { contractorIssuer: true }); if (pr.length) blocks.push({ t: 'kv', rows: pr }); blocks.push({ t: 'p', s: ctx.scnName, st: 'lead' }, { t: 'p', s: T(ctx.problem) });
    if (ctx.extra.solution) blocks.push({ t: 'p', s: T(ctx.extra.solution) });
    var lt = layersOf(ctx.ids.layers, L('layerHead')); if (lt) { blocks.push({ t: 'h', l: 1, s: L('ms2') }, lt); }
    var drawing = drawingOf(ctx); if (drawing) blocks.push({ t: 'h', l: 2, s: L('msDrawing') }, { t: 'img', src: drawing.src, w: drawing.w, h: drawing.h, cap: L('drawCap') });
    /* the sealant joint at micro scale, in 3D: the rod stage and the finished joint — the same geometry as the drawing */
    var microIdx = ctx.cat === 'sl' ? [ctx.stages.indexOf('backer'), ctx.stages.length - 1].filter(function (i, k, arr) { return i >= 0 && arr.indexOf(i) === k; }) : [];
    return microIdx.reduce(function (pr, i) { return pr.then(function (acc) { return figMicro(ctx, i, 800, 560).then(function (f) { if (f) acc.push({ i: i, f: f }); return acc; }); }); }, Promise.resolve([])).then(function (mf) {
      if (!mf.length) return; // the micro views side by side in one figure: (a) the rod in the joint, (b) the finished joint
      return Promise.all(mf.map(function (m) { return loadImg(m.f.src); })).then(function (ims) {
        var PW = 800, PH = 560, GAP = 40, W2 = PW * ims.length + GAP * (ims.length - 1), H2 = PH + 46, c = canvas(W2, H2), g = c.getContext('2d'), fnt = '400 24px ' + fontFamily(), names = [];
        g.fillStyle = '#fff'; g.fillRect(0, 0, W2, H2);
        ims.forEach(function (im, k) { var x0 = k * (PW + GAP), lab = '(' + String.fromCharCode(97 + k) + ') ' + ctx.stageName(ctx.stages[mf[k].i]); g.drawImage(im, x0, 0, PW, PH); g.strokeStyle = LINE; g.lineWidth = 1; g.strokeRect(x0 + 0.5, 0.5, PW - 1, PH - 1); g.font = fnt; g.fillStyle = INK; g.textAlign = 'center'; g.fillText(lab, x0 + PW / 2, PH + 32); names.push(lab); });
        blocks.push({ t: 'img', src: c.toDataURL('image/jpeg', 0.9), w: W2, h: H2, size: 'wide', cap: L('figMicro').replace('{s}', names.join(' · ')) }); }); }).then(function () {
      var cond = L('condList'); blocks.push({ t: 'h', l: 1, s: L('ms3') }, { t: 'ul', items: ctx.extra.conditions || cond });
      return figsOfSteps(ctx, steps, { W: 1000, H: 700, big: true }); }).then(function (figs) {
      blocks.push({ t: 'h', l: 1, s: L('ms4') }, { t: 'p', s: L('ms4sub').replace('{n}', steps.length), st: 'lead' });
      steps.forEach(function (st, i) { var f = figs[i], sb = stepBlocks(ctx, st, i), head = sb.shift(); blocks.push(head); if (f) blocks.push({ t: 'cols', w: [0.5, 0.5], cols: [sb, [{ t: 'img', src: f.src, w: f.w, h: f.h, size: 'col', cap: L('figStep').replace('{n}', i + 1).replace('{s}', ctx.stageName(ctx.stages[st.stage])) }]], keep: true }); else blocks = blocks.concat(sb); });
      var qa = document.getElementById(ctx.ids.qa); if (qa) { blocks.push({ t: 'h', l: 1, s: L('ms5') }); blocks = blocks.concat(fromDom(qa, { hl: 2 }).filter(function (b) { return !(b.t === 'h' && b.l === 1); })); }
      if (ctx.extra.sim) { var r = ctx.extra.sim; blocks.push({ t: 'h', l: 1, s: L('ms6') }, { t: 'table', head: [L('simHead')[0], L('simHead')[1], L('simHead')[2]], rows: r.rows.filter(function (row) { return !row.night; }).map(function (row) { return { cells: [{ s: (ctx.extra.simNames && ctx.extra.simNames[row.k]) || row.k }, { s: fmtHours(row.t) }, { s: fmtDur(row.d) }] }; }), n: 3, w: [0.5, 0.25, 0.25], small: true }); }
      blocks.push({ t: 'h', l: 1, s: L('ms7') }, { t: 'ul', items: L('safetyList') });
      blocks.push({ t: 'sign', cols: [L('signPrepared'), L('signReviewed'), L('signApproved')], names: signNames(meta, ['prepared', 'reviewed', 'approved']) });
      blocks.push({ t: 'p', s: L('srcNote'), st: 'note' });
      return blocks;
    });
  }
  function fmtHours(h) { var d = Math.floor(h / 24), m = Math.round((h - d * 24) * 60), H = Math.floor(m / 60); m %= 60; return (d ? 'D' + (d + 1) + ' ' : 'D1 ') + (H < 10 ? '0' : '') + H + ':' + (m < 10 ? '0' : '') + m; }
  function fmtDur(h) { if (h >= 24) return (Math.round(h / 24 * 10) / 10) + ' d'; var H = Math.floor(h), M = Math.round((h - H) * 60); return (H ? H + ' h ' : '') + (M ? M + ' min' : ''); }
  function buildSubmittal(ctx, meta) {
    var blocks = [], cur = ctx.prod;
    return heroImg(ctx, 1400, 800).then(function (hero) { blocks.push({ t: 'meta', kind: 'submittal', cover: hero ? { src: hero.src, w: hero.w, h: hero.h, cap: L('heroCap') } : {} }); return buildSubmittalBody(ctx, meta, blocks, cur); });
  }
  function buildSubmittalBody(ctx, meta, blocks, cur) {
    var sr = projectRows(meta, { contractorIssuer: true }); if (!meta.project.name) sr.unshift([L('fProject'), '—']); if (!meta.project.site) sr.push([L('fSite'), '—']);
    sr.push([L('fDocNo'), meta.docNo], [L('fDate'), meta.date], [L('fScope'), ctx.scnName], [L('fMaker'), 'AUTO CHEMICAL INDUSTRY CO., LTD. (オート化学工業株式会社) · autochem.co.jp'], [L('fAgent'), 'Good Startup LTD. — ' + strip(tr('util.dist')) + ' · info@good-startup.com']);
    blocks.push({ t: 'h', l: 1, s: L('sub1') }, { t: 'kv', rows: sr });
    blocks.push({ t: 'h', l: 1, s: L('sub2') }, { t: 'p', s: L('sub2sub'), st: 'lead' });
    var lt = layersOf(ctx.ids.layers, L('layerHead')); if (lt) blocks.push(lt);
    blocks.push({ t: 'pb' }, { t: 'h', l: 1, s: L('sub3') });
    var inSys = systemProducts(ctx, lt), list = ctx.products.filter(function (k) { return inSys.indexOf(k) >= 0; }); if (!list.length) list = [cur];
    list.forEach(function (k, i) { if (ctx.showProduct && ctx.products.length > 1) ctx.showProduct(k); var el = document.getElementById(ctx.ids.prod); if (!el) return; var bl = fromDom(el, { hl: 2 }), keep = [], tables = 0; bl.forEach(function (b) { if (b.t === 'table') { tables++; if (tables <= 3) keep.push(b); return; } if (b.t === 'ul' && b.small) { keep.push({ t: 'h', l: 3, s: L('docsOf') }); keep.push(b); return; } if (b.t === 'ul' || b.t === 'ol') { if (keep.length && keep[keep.length - 1].t === 'p' && keep[keep.length - 1].st === 'label') keep.pop(); return; } keep.push(b); }); blocks = blocks.concat(productBand(keep, i)); });
    if (ctx.showProduct && ctx.products.length > 1) ctx.showProduct(cur); // the page shows its product again
    var qa = document.getElementById(ctx.ids.qa); if (qa) { blocks.push({ t: 'h', l: 1, s: L('sub4') }); blocks = blocks.concat(fromDom(qa, { hl: 2 }).filter(function (b) { return !(b.t === 'h' && b.l === 1); })); }
    blocks.push({ t: 'h', l: 1, s: L('sub5') }, { t: 'p', s: L('sub5text') }, { t: 'ul', items: L('sub5list') });
    blocks.push({ t: 'sign', cols: [L('signContractor'), L('signConsultant'), L('signOwner')], names: signNames(meta, ['contractor', 'consultant', 'owner']) });
    blocks.push({ t: 'p', s: L('srcNote'), st: 'note' });
    return Promise.resolve(blocks);
  }
  function buildChecklist(ctx, meta) {
    var blocks = [], steps = ctx.steps, H = L('ckHead');
    var cr = projectRows(meta, { contractorIssuer: true }); if (!meta.project.name) cr.unshift([L('fProject'), '']); if (!meta.project.site) cr.push([L('fSite'), '']);
    cr.push([L('fScope'), ctx.scnName], [L('ckArea'), meta.project.area || ''], [L('ckDate'), ''], [L('ckWeather'), ''], [L('ckTemp'), '        °C   ·   RH        %   ·   ' + L('ckMoist') + '        %'], [L('ckLot'), '']);
    blocks.push({ t: 'h', l: 1, s: L('ck1') }, { t: 'kv', rows: cr.filter(function (r, i, a) { return !(r[0] === L('fArea')); }) });
    blocks.push({ t: 'h', l: 1, s: L('ck2') }, { t: 'p', s: L('ck2sub'), st: 'note' });
    blocks.push({ t: 'table', head: H, rows: steps.map(function (st, i) { var c = st.c; return { cells: [{ s: String(i + 1) }, { s: T(c.title), b: true }, { s: (c.points && c.points.length ? T(c.points[0]) : T(c.short)) }, { s: '□ ' + L('ckOk') + '\n□ ' + L('ckNg') }, { s: '' }, { s: '' }] }; }), n: 6, w: [0.05, 0.22, 0.38, 0.11, 0.12, 0.12], small: true });
    var lt = layersOf(ctx.ids.layers, L('layerHead')); if (lt) { blocks.push({ t: 'h', l: 1, s: L('ck3') }, { t: 'table', head: [H[1], L('ckSpec'), L('ckUsed'), L('ckLotNo'), H[4]], rows: lt.rows.filter(function (r) { return r.cells[0].s !== '0'; }).map(function (r) { return { cells: [r.cells[1], { s: [r.cells[3] ? r.cells[3].s : '', r.cells[4] ? r.cells[4].s : ''].filter(function (x) { return x && x !== '—'; }).join(' · ') }, { s: '' }, { s: '' }, { s: '' }] }; }), n: 5, w: [0.22, 0.34, 0.14, 0.15, 0.15], small: true }); }
    blocks.push({ t: 'h', l: 1, s: L('ck4') }, { t: 'ul', items: L('ck4list') });
    blocks.push({ t: 'sign', cols: [L('signApplicator'), L('signSupervisor'), L('signInspector')], names: signNames(meta, ['contractor', '', 'consultant']) });
    return Promise.resolve(blocks);
  }
  var BUILD = { product: buildProductData, catalogue: buildCatalogue, quotation: buildQuotation, comparison: buildComparison, method: buildMethod, submittal: buildSubmittal, checklist: buildChecklist };
  return { build: function (kind, ctx, meta, opt) { docLang = meta && meta.lang || LANG; return BUILD[kind](ctx, meta, opt || {}); }, strip: strip, T: T, fromDom: fromDom, layersOf: layersOf, fig3d: fig3d, figMicro: figMicro, drawingOf: drawingOf, barChart: barChart, fontFamily: fontFamily, loadImg: loadImg, canvas: canvas, BRAND: BRAND, INK: INK };
})();


