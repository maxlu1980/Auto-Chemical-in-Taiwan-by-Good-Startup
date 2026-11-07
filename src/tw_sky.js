/* ===== [tw_sky.js] ===== */
/* ===== SKY — the real sky over the island: where the sun and the moon stand right now over the place Luna is, the phase of the moon,
   the turning stars, the weather that is really falling there now, and the season of the year.
   Astronomy: the NOAA solar position algorithm (after Meeus, accurate to about 0.01°, with refraction near the horizon) and the
   low-precision lunar theory of P. Schlyter (main perturbations, topocentric parallax; about 2′ of arc), the sidereal time of
   IAU 1982. The map is the island's own projection about 120.95°E 23.6°N (x east, z south; 1 unit = 1 km plan), so a point
   of the map gives back its longitude and latitude.
   Weather: Open-Meteo (api.open-meteo.com, no key; the WMO weather codes) for twelve real places across Taiwan, refreshed every
   15 minutes; the nearest to Luna is used. When the network is not reachable (a page served in a sandbox), the weather of the
   season is modelled instead (the north-east monsoon drizzle of the north in winter, the plum rains of May and June, the
   afternoon thunderstorms of summer), the same for everyone on the same day, and it is said so in the chip. */
var SKY = (function () {
  var D2R = Math.PI / 180, R2D = 180 / Math.PI, LON0 = 120.95, LAT0 = 23.6, KX = 102.009, KZ = 110.9;
  function rev(x) { return x - Math.floor(x / 360) * 360; }
  /* (v36.2) places of the map that stand for somewhere else on the Earth (the Okachimachi district stands for Tokyo): their own longitude and
     latitude for the sun and the moon, and their own weather */ var ANCH = []; function anchor(fn) { ANCH.push(fn); }
  function place(x, z) { for (var i = 0; i < ANCH.length; i++) { var a = ANCH[i](x, z); if (a) return a; } return null; }
  function lonlat(x, z) { var a = place(x, z); if (a) return [a.lon, a.lat]; return [LON0 + x / KX, LAT0 - z / KZ]; }
  function jd(date) { return date.getTime() / 86400000 + 2440587.5; }
  /* the local sidereal time (radians) */
  function lst(J, lon) { var T = (J - 2451545.0) / 36525; return rev(280.46061837 + 360.98564736629 * (J - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000 + lon) * D2R; }
  /* world direction (x east, y up, z south) of a body of right ascension ra and declination dec (radians) seen from latitude lat at sidereal time th */
  function toWorld(ra, dec, lat, th) { var X = Math.cos(dec) * Math.cos(ra), Y = Math.cos(dec) * Math.sin(ra), Z = Math.sin(dec), st = Math.sin(th), ct = Math.cos(th), sp = Math.sin(lat), cp = Math.cos(lat);
    return [-st * X + ct * Y, cp * ct * X + cp * st * Y + sp * Z, sp * ct * X + sp * st * Y - cp * Z]; }
  /* the matrix that takes a world direction into the equatorial frame (for the stars): its rows are the columns of the one above */
  function eqMatrix(lat, th) { var st = Math.sin(th), ct = Math.cos(th), sp = Math.sin(lat), cp = Math.cos(lat); return [-st, cp * ct, sp * ct, ct, cp * st, sp * st, 0, sp, -cp]; }
  function refract(altDeg) { if (altDeg < -1.5) return altDeg; var R = 1.02 / Math.tan((altDeg + 10.3 / (altDeg + 5.11)) * D2R); return altDeg + R / 60; }
  function sunRaDec(J) { var T = (J - 2451545.0) / 36525, L0 = rev(280.46646 + T * (36000.76983 + T * 0.0003032)), M = (357.52911 + T * (35999.05029 - 0.0001537 * T)) * D2R;
    var C = Math.sin(M) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M) * (0.019993 - 0.000101 * T) + Math.sin(3 * M) * 0.000289, om = (125.04 - 1934.136 * T) * D2R;
    var lam = (L0 + C - 0.00569 - 0.00478 * Math.sin(om)) * D2R, eps = (23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(om)) * D2R;
    return { ra: Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)), dec: Math.asin(Math.sin(eps) * Math.sin(lam)), lon: lam }; }
  function moonRaDec(J) { var d = J - 2451543.5, N = rev(125.1228 - 0.0529538083 * d) * D2R, i = 5.1454 * D2R, w = rev(318.0634 + 0.1643573223 * d) * D2R, a = 60.2666, e = 0.0549, M = rev(115.3654 + 13.0649929509 * d) * D2R;
    var E = M + e * Math.sin(M) * (1 + e * Math.cos(M)); for (var k = 0; k < 5; k++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    var xv = a * (Math.cos(E) - e), yv = a * Math.sqrt(1 - e * e) * Math.sin(E), v = Math.atan2(yv, xv), r = Math.sqrt(xv * xv + yv * yv);
    var xh = r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i)), yh = r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i)), zh = r * Math.sin(v + w) * Math.sin(i);
    var lon = Math.atan2(yh, xh) * R2D, lat = Math.atan2(zh, Math.sqrt(xh * xh + yh * yh)) * R2D;
    var Ms = rev(356.0470 + 0.9856002585 * d) * D2R, ws = rev(282.9404 + 4.70935e-5 * d) * D2R, Ls = Ms + ws, Lm = M + w + N, Dd = Lm - Ls, F = Lm - N, s = Math.sin, c = Math.cos;
    lon += -1.274 * s(M - 2 * Dd) + 0.658 * s(2 * Dd) - 0.186 * s(Ms) - 0.059 * s(2 * M - 2 * Dd) - 0.057 * s(M - 2 * Dd + Ms) + 0.053 * s(M + 2 * Dd) + 0.046 * s(2 * Dd - Ms) + 0.041 * s(M - Ms) - 0.035 * s(Dd) - 0.031 * s(M + Ms) - 0.015 * s(2 * F - 2 * Dd) + 0.011 * s(M - 4 * Dd);
    lat += -0.173 * s(F - 2 * Dd) - 0.055 * s(M - F - 2 * Dd) - 0.046 * s(M + F - 2 * Dd) + 0.033 * s(F + 2 * Dd) + 0.017 * s(2 * M + F); r += -0.58 * c(M - 2 * Dd) - 0.46 * c(2 * Dd);
    var ecl = (23.4393 - 3.563e-7 * d) * D2R, lo = lon * D2R, la = lat * D2R, xe = c(la) * c(lo), ye = c(la) * s(lo) * c(ecl) - s(la) * s(ecl), ze = c(la) * s(lo) * s(ecl) + s(la) * c(ecl);
    return { ra: Math.atan2(ye, xe), dec: Math.atan2(ze, Math.sqrt(xe * xe + ye * ye)), lon: lo, lat: la, r: r }; }
  /* everything for one moment at one place */
  function at(date, x, z) { var ll = lonlat(x, z), lon = ll[0], lat = ll[1] * D2R, J = jd(date), th = lst(J, lon), S = sunRaDec(J), Mo = moonRaDec(J);
    var sd = toWorld(S.ra, S.dec, lat, th), sAlt = Math.asin(Math.max(-1, Math.min(1, sd[1]))) * R2D, sAltR = refract(sAlt);
    var md = toWorld(Mo.ra, Mo.dec, lat, th), mAlt = Math.asin(Math.max(-1, Math.min(1, md[1]))) * R2D, par = Math.asin(1 / Mo.r) * R2D, mAltT = refract(mAlt - par * Math.cos(mAlt * D2R));
    function lift(v, alt) { var h = Math.hypot(v[0], v[2]) || 1, ca = Math.cos(alt * D2R); return [v[0] / h * ca, Math.sin(alt * D2R), v[2] / h * ca]; }
    var elong = Math.acos(Math.max(-1, Math.min(1, Math.cos(S.lon - Mo.lon) * Math.cos(Mo.lat)))), pa = Math.PI - elong, illum = (1 + Math.cos(pa)) / 2, waxing = rev((Mo.lon - S.lon) * R2D) < 180;
    var az = function (v) { return rev(Math.atan2(v[0], -v[2]) * R2D); };
    return { lon: lon, lat: ll[1], sun: { dir: lift(sd, sAltR), alt: sAltR, az: az(sd) }, moon: { dir: lift(md, mAltT), alt: mAltT, az: az(md), illum: illum, waxing: waxing, age: rev((Mo.lon - S.lon) * R2D) / 360 * 29.530589 }, eq: eqMatrix(lat, th) }; }

  /* ---------- the season (Taiwan): a smooth year, the cherry blossom, the colour of the green ---------- */
  function season(date) { var start = Date.UTC(date.getUTCFullYear(), 0, 1), doy = (date.getTime() - start) / 86400000, y = doy / 365.25;
    function bump(c, w) { var dd = Math.abs(y - c); dd = Math.min(dd, 1 - dd); return Math.exp(-dd * dd / (2 * w * w)); }
    var key = y < 0.16 || y >= 0.915 ? 'winter' : y < 0.414 ? 'spring' : y < 0.665 ? 'summer' : 'autumn';
    /* the green of the leaves and grass: fresh in spring, deep in summer, warm in autumn, dry and olive in winter */
    var spring = bump(0.3, 0.07), summer = bump(0.55, 0.09), autumn = bump(0.82, 0.07), winter = bump(0.04, 0.08), tot = spring + summer + autumn + winter;
    var T = [[1.02, 1.08, 0.92], [0.94, 1.0, 0.9], [1.08, 0.98, 0.82], [1.03, 0.98, 0.86]], tint = [0, 0, 0], ws = [spring, summer, autumn, winter], k, j;
    for (k = 0; k < 4; k++) for (j = 0; j < 3; j++) tint[j] += T[k][j] * ws[k] / tot;
    /* the cherry blossom: Alishan and the mountains from late January to early April (the peak in March) */
    var bloom = Math.max(0, Math.min(1, (bump(0.18, 0.045) - 0.2) / 0.6));
    return { key: key, doy: doy, tint: tint, bloom: bloom }; }

  /* ---------- the weather ---------- */
  var SITES = [['tpe', 25.0478, 121.5170], ['tao', 25.0127, 121.2149], ['hsz', 24.8079, 121.0403], ['txg', 24.1123, 120.6159], ['tnn', 22.9250, 120.2856], ['khh', 22.6873, 120.3076],
    ['magong', 23.5654, 119.5793], ['kenting', 21.9460, 120.7960], ['sunmoon', 23.8660, 120.9150], ['alishan', 23.5100, 120.8020], ['taroko', 24.1580, 121.6210], ['taitung', 22.7550, 121.1500]];
  var WX = { src: 'none', t: 0, list: null, err: 0, busy: false };
  /* WMO code → what falls, how cloudy, how far one sees */
  function decode(code) { var c = code | 0, o = { rain: 0, drizzle: 0, snow: 0, fog: 0, thunder: 0, cloud: 0 };
    if (c === 1) o.cloud = 0.25; else if (c === 2) o.cloud = 0.55; else if (c === 3) o.cloud = 0.95; else if (c === 45 || c === 48) { o.fog = 1; o.cloud = 0.9; }
    else if (c >= 51 && c <= 57) { o.drizzle = c === 51 ? 0.3 : c === 53 ? 0.55 : 0.8; o.cloud = 0.95; } else if (c >= 61 && c <= 67) { o.rain = c === 61 || c === 66 ? 0.35 : c === 63 ? 0.65 : 1; o.cloud = 1; }
    else if (c >= 71 && c <= 77) { o.snow = c === 71 ? 0.3 : c === 73 ? 0.6 : 1; o.cloud = 1; } else if (c >= 80 && c <= 82) { o.rain = c === 80 ? 0.4 : c === 81 ? 0.7 : 1; o.cloud = 0.85; } else if (c >= 85 && c <= 86) { o.snow = 0.6; o.cloud = 1; }
    else if (c >= 95) { o.rain = 0.85; o.thunder = 1; o.cloud = 1; } return o; }
  function fromApi(cur) { var o = decode(cur.weather_code); if (cur.cloud_cover != null) o.cloud = Math.max(o.cloud * 0.6, cur.cloud_cover / 100); var p = (cur.precipitation || 0) + 0; if (p > 0) o.rain = Math.max(o.rain, Math.min(1, 0.2 + p / 6));
    o.wind = cur.wind_speed_10m == null ? 8 : cur.wind_speed_10m; o.gust = cur.wind_gusts_10m || o.wind * 1.4; o.windDir = cur.wind_direction_10m || 45; o.temp = cur.temperature_2m; o.hum = cur.relative_humidity_2m; o.vis = cur.visibility == null ? null : cur.visibility / 1000; o.code = cur.weather_code; o.time = cur.time; return o; }
  function fetchNow() { if (WX.busy || typeof fetch !== 'function') return; WX.busy = true;
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + SITES.map(function (s) { return s[1]; }).join(',') + '&longitude=' + SITES.map(function (s) { return s[2]; }).join(',') + '&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility&timezone=Asia%2FTaipei';
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 7000);
    fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); }).then(function (j) { clearTimeout(to); var arr = Array.isArray(j) ? j : [j];
      WX.list = arr.map(function (o, k) { return { id: SITES[k][0], lat: SITES[k][1], lon: SITES[k][2], w: fromApi(o.current || {}) }; }); WX.src = 'live'; WX.t = Date.now(); WX.busy = false; WX.err = 0; if (window.console) console.info('[weather] live: Open-Meteo, ' + WX.list.length + ' places'); })
      .catch(function (e) { clearTimeout(to); WX.busy = false; WX.err++; WX.t = Date.now(); if (WX.src !== 'live') WX.src = 'model'; if (window.console) console.info('[weather] network unavailable (' + (e && e.message || e) + '): seasonal model'); }); }
  /* the modelled weather of the season, the same for everyone on the same day and hour */
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function model(date, lon, lat) { var tp = new Date(date.getTime() + 8 * 3600000), m = tp.getUTCMonth() + 1, hr = tp.getUTCHours() + tp.getUTCMinutes() / 60, day = Math.floor(tp.getTime() / 86400000), north = lat > 24.4, east = lon > 121.2;
    var r1 = hash(day * 3.1 + Math.round(lat * 2)), r2 = hash(day * 7.7 + Math.round(lon * 3) + Math.floor(hr / 3)), o = { rain: 0, drizzle: 0, snow: 0, fog: 0, thunder: 0, cloud: 0.3, wind: 10, gust: 16, windDir: 45, temp: null, vis: null, code: 2 };
    if ((m >= 11 || m <= 3) && (north || east)) { o.cloud = 0.75 + r1 * 0.25; o.wind = 18 + r1 * 14; o.windDir = 40; if (r1 > 0.45) { o.drizzle = 0.4 + r2 * 0.4; o.code = 53; } else o.code = 3; }
    else if (m === 5 || m === 6) { o.cloud = 0.6 + r1 * 0.4; if (r1 > 0.55) { o.rain = 0.4 + r2 * 0.6; o.code = 63; } else o.code = 3; }
    else if (m >= 7 && m <= 9) { o.cloud = 0.25 + r1 * 0.3; o.windDir = 220; o.code = 1; if (hr > 13.5 && hr < 18.5 && r1 > 0.4 && !(lon < 120 && lat < 24)) { o.cloud = 0.95; o.rain = 0.5 + r2 * 0.5; o.thunder = r2 > 0.4 ? 1 : 0; o.code = o.thunder ? 95 : 81; } }
    else { o.cloud = 0.15 + r1 * 0.5; o.code = o.cloud > 0.5 ? 2 : 1; o.wind = 12 + r1 * 8; }
    if (lat < 23.6 && lat > 23.4 && lon > 120.75 && lon < 120.9 && (hr > 14 || hr < 8)) { o.fog = 0.6 + r2 * 0.4; o.cloud = Math.max(o.cloud, 0.8); o.code = 45; } /* Alishan's sea of clouds */
    /* the temperature of the season: the monthly normals of the lowlands (north to south by latitude), the day's swing, the mountains colder */
    var TN = [16.1, 16.5, 18.5, 21.9, 25.2, 27.7, 29.6, 29.2, 27.4, 24.5, 21.5, 17.9], TS = [19.3, 20.3, 22.6, 25.5, 27.6, 28.7, 29.3, 28.9, 28.4, 27.0, 24.3, 20.8], kN = Math.max(0, Math.min(1, (lat - 22.6) / 2.45));
    o.temp = TS[m - 1] + (TN[m - 1] - TS[m - 1]) * kN + 3 * Math.cos((hr - 14) / 24 * Math.PI * 2) - (o.rain > 0.3 ? 2 : 0) - (lat < 23.6 && lat > 23.4 && lon > 120.75 && lon < 120.9 ? 12 : 0);
    if (lon < 120) o.wind += 14; /* Penghu is windy */ return o; }
  function sample(date, x, z) { var ap = place(x, z); if (ap && ap.weather && !(typeof window !== 'undefined' && window.ISLE_WX)) { var aw = ap.weather(date); if (aw) return aw; } var ll = lonlat(x, z), lon = ll[0], lat = ll[1];
    if (typeof window !== 'undefined' && window.ISLE_WX) { var tw = Object.assign(decode(window.ISLE_WX.code || 0), { wind: 10, gust: 14, windDir: 45, temp: 22, vis: null }, window.ISLE_WX); tw.src = 'live'; tw.site = 'test'; return tw; }
    if ((!WX.list && WX.src !== 'model' && !WX.busy) || (Date.now() - WX.t > (WX.src === 'live' ? 900000 : 300000) && WX.err < 3)) fetchNow();
    if (WX.list) { var best = null, bd = 1e9; WX.list.forEach(function (s) { var d = Math.hypot((s.lon - lon) * 102, (s.lat - lat) * 111); if (d < bd) { bd = d; best = s; } }); var w = Object.assign({}, best.w); w.src = 'live'; w.site = best.id; w.vendor = 'Open-Meteo'; return w; }
    var mw = model(date, lon, lat); mw.src = WX.src === 'none' && WX.busy ? 'wait' : 'model'; mw.site = null; return mw; }
  return { anchor: anchor, place: place, hash: hash, at: at, lonlat: lonlat, season: season, weather: sample, decode: decode, model: model, WX: WX, refresh: fetchNow, D2R: D2R };
})();


