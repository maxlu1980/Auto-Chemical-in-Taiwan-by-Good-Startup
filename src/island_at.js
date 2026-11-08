/* ===== [island_at.js] ===== */
  /* (v74) the opening's recorded music fetched as soon as the island begins to load: the film comes some seconds later, and the music should be
     ready for its first bar (decoded off the page's own thread; the synthesised score stays as the fallback) */
  var _bootStagedAT = bootStaged; bootStaged = function (o) { try { if (window.CINE && CINE.recLoad) CINE.recLoad('film'); } catch (e) {} return _bootStagedAT.apply(this, arguments); };
