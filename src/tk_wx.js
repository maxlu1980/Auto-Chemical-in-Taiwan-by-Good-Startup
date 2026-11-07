/* ===== [tk_wx.js] ===== */
/* ===== TKWEA / TPEWEA — the weather now over JR Okachimachi (Taito, Tokyo) and over Taipei Main Station (v36.2, v37) =====
   (v37) one source per city, made by WXSRC from the city's place, its AccuWeather location key, its time zone and its climate normals.
   Live: AccuWeather, through the viewer's own AccuWeather connector (the page itself cannot reach the network): the location "Ueno, Tokyo"
   (key 2409626, 35.71 N 139.775 E, the cell that holds Okachimachi), MinuteCast — the radar's precipitation minute by minute for the next
   hours, with the current conditions — read when the street is shown and every 10 minutes after. Between reads the minute of the forecast
   that is now is used, so a shower starts and stops when the radar says it does.
   Rain rate from radar reflectivity: Marshall–Palmer, Z = 200 R^1.6 (snow: Z = 2000 R^2).
   Without the connector: the climate of Tokyo — the Japan Meteorological Agency's 1991–2020 normals for the Tokyo station (monthly mean,
   mean daily maximum and minimum, precipitation), a wet day drawn with the month's frequency of days with 1 mm or more, the same for every
   viewer on the same day and hour; and it says so. */
function WXSRC(CF) {
  var LAT = CF.lat, LON = CF.lon, KEY = CF.key, SERVER = 'AccuWeather', TOOL = 'widgets-minutecast-claude', TOOL2 = 'widgets-current-claude';
  var S = { src: 'none', cur: null, min: null, loc: null, t: 0, err: null, started: false, mcp: null, fb: false, stamp: 0 };
  var INPUT = { queryParams: { locationKey: KEY, unit: 'metric', lang: 'en' } };
  var DENY = ['needs_reauth', 'server_not_connected', 'selection_required', 'server_not_found', 'blocked_by_policy', 'approval_required', 'not_in_manifest', 'consent_required', 'not_granted', 'capability_disabled', 'capability_removed', 'user_changed'];
  function num(v) { if (typeof v === 'number') return v; var m = String(v == null ? '' : v).match(/-?\d+(\.\d+)?/); return m ? +m[0] : null; }
  var CMP = { N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5, S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5 };
  /* AccuWeather's icon numbers: what the sky looks like and what falls */
  function icon(c) { c = c | 0; var o = { cloud: 0.3, rain: 0, drizzle: 0, snow: 0, fog: 0, thunder: 0 };
    var CL = { 1: 0.04, 2: 0.2, 3: 0.42, 4: 0.58, 5: 0.3, 6: 0.76, 7: 0.92, 8: 1, 11: 0.9, 12: 0.92, 13: 0.85, 14: 0.6, 15: 1, 16: 0.9, 17: 0.65, 18: 1, 19: 0.9, 20: 0.85, 21: 0.6, 22: 1, 23: 0.95, 24: 1, 25: 1, 26: 1, 29: 1, 30: 0.15, 31: 0.3, 32: 0.45, 33: 0.04, 34: 0.2, 35: 0.45, 36: 0.58, 37: 0.3, 38: 0.76, 39: 0.6, 40: 0.85, 41: 0.65, 42: 0.9, 43: 0.85, 44: 0.95 };
    o.cloud = CL[c] != null ? CL[c] : 0.4;
    if (c === 5 || c === 37) o.fog = 0.25; if (c === 11) o.fog = 1;
    if (c === 12 || c === 13 || c === 40) o.rain = 0.5; if (c === 14 || c === 39) o.rain = 0.4; if (c === 18 || c === 26) o.rain = 0.7;
    if (c === 15 || c === 16 || c === 42) { o.rain = 0.8; o.thunder = 1; } if (c === 17 || c === 41) { o.rain = 0.6; o.thunder = 1; }
    if (c === 19 || c === 20 || c === 21 || c === 43) o.snow = 0.3; if (c === 22 || c === 23 || c === 44) o.snow = 0.7; if (c === 24 || c === 25) { o.snow = 0.45; o.rain = 0.25; } if (c === 29) { o.snow = 0.5; o.rain = 0.35; }
    return o; }
  /* the WMO code the island's weather chip reads, from what falls and how cloudy */ function wmo(o) { if (o.thunder) return 95; if (o.snow > 0) return o.snow > 0.6 ? 75 : o.snow > 0.3 ? 73 : 71; if (o.rain > 0) return o.rain > 0.7 ? 65 : o.rain > 0.4 ? 63 : 61; if (o.fog > 0.5) return 45; return o.cloud > 0.8 ? 3 : o.cloud > 0.45 ? 2 : o.cloud > 0.2 ? 1 : 0; }
  function find(o, key, d) { if (!o || typeof o !== 'object' || (d || 0) > 6) return null; if (Object.prototype.hasOwnProperty.call(o, key)) return o[key]; var ks = Array.isArray(o) ? o : Object.keys(o).map(function (k) { return o[k]; });
    for (var i = 0; i < ks.length; i++) { var r = find(ks[i], key, (d || 0) + 1); if (r) return r; } return null; }
  function ingest(p) { if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { return false; } } var cur = find(p, 'currentConditions'), mc = find(p, 'minuteCastForecast'); if (!cur && !mc) return false;
    if (cur) S.cur = cur; if (mc && mc.minutes) S.min = mc.minutes.map(function (m) { return { t: Date.parse(m.dateTime), dbz: +m.dbz || 0, type: m.precipitationType || '', phrase: m.phrase || '' }; }).filter(function (m) { return !isNaN(m.t); });
    if (mc && mc.summary60) S.sum = mc.summary60; S.loc = find(p, 'location') || S.loc; S.t = Date.now(); S.src = 'live'; S.err = null; return true; }
  function rateOf(dbz, type) { if (!(dbz > 0)) return 0; var Z = Math.pow(10, dbz / 10); return /snow/i.test(type) ? Math.sqrt(Z / 2000) : Math.pow(Z / 200, 1 / 1.6); }
  function intens(R) { return R <= 0.02 ? 0 : Math.max(0.15, Math.min(1, 0.4 + 0.3 * Math.log10(R))); }
  function live(date) { var c = S.cur; if (!c) return null; var x = c.extended || {}, o = icon(c.iconCode), t = date.getTime();
    var cc = num(x.cloudCover); if (cc != null) o.cloud = Math.max(o.rain || o.snow ? 0.85 : 0, cc / 100);
    o.temp = c.temperatureValue != null ? +c.temperatureValue : num(c.temperature); o.feel = c.realFeelValue != null ? +c.realFeelValue : null; o.hum = x.humidityValue != null ? +x.humidityValue : num(x.humidity);
    var wv = String(x.wind || ''), wm = wv.match(/^\s*([NSEW]{1,3})\b/); o.windDir = wm && CMP[wm[1]] != null ? CMP[wm[1]] : 45; o.wind = num(wv.replace(/^\s*[NSEW]{1,3}\s*/, '')); if (o.wind == null) o.wind = 8; o.gust = num(x.gusts) || o.wind * 1.4;
    var vis = num(x.visibility); o.vis = vis != null && /km/.test(String(x.visibility)) ? vis : vis != null ? vis * 1.609 : null; if (o.vis != null && o.vis < 1.2) o.fog = Math.max(o.fog, 1 - o.vis / 1.2);
    /* the radar's minute: rain or snow, and how hard, now */ var mn = null; if (S.min && S.min.length) { for (var i = 0; i < S.min.length; i++) if (S.min[i].t <= t && t < S.min[i].t + 60000) { mn = S.min[i]; break; } }
    if (mn) { var R = rateOf(mn.dbz, mn.type), k = intens(R); o.rate = R; o.ptype = mn.type || (R > 0 ? 'rain' : ''); o.rain = 0; o.snow = 0;
      if (k > 0) { if (/snow/i.test(o.ptype)) o.snow = k; else if (/mix|ice/i.test(o.ptype)) { o.snow = k * 0.6; o.rain = k * 0.6; } else o.rain = k; o.cloud = Math.max(o.cloud, 0.85); }
      if (o.thunder && k < 0.3) o.thunder = 0; o.minute = mn.phrase; }
    else if (S.min && S.min.length && t > S.min[S.min.length - 1].t + 60000 && t - S.t > 3600000) { /* the forecast ran out long ago: keep the icon's word */ }
    o.acode = c.iconCode; o.code = wmo(o); o.phrase = c.phrase; o.day = c.isDayTime; o.src = 'live'; o.site = (S.loc && (S.loc.localizedName || (S.loc.info && S.loc.info.name))) || CF.site; o.time = S.stamp || S.t; o.vendor = 'AccuWeather'; return o; }
  /* ---------- the climate of Tokyo, without the connector ---------- */
  var TM = CF.tm, TX = CF.tx, TN = CF.tn, PR = CF.pr, DM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function model(date) { var jt = new Date(date.getTime() + CF.tz * 3600000), m = jt.getUTCMonth(), hr = jt.getUTCHours() + jt.getUTCMinutes() / 60, day = Math.floor(jt.getTime() / 86400000);
    /* the chance of a wet day: Tokyo, the month's precipitation over the mean fall of a wet day (about 13 mm); Taipei, the normals' rain days (0.1 mm or more), a share of them with rain worth seeing */ var pWet = CF.rd ? Math.min(0.6, CF.rd[m] / DM[m] * 0.7) : Math.min(0.55, PR[m] / 13 / DM[m]);
    var r1 = hash(day * 3.17 + 11 + CF.salt), r2 = hash(day * 7.31 + Math.floor(hr / 2) * 1.7 + 5 + CF.salt), wet = r1 < pWet, o = { rain: 0, drizzle: 0, snow: 0, fog: 0, thunder: 0, wind: 11, gust: 18, windDir: CF.wind ? CF.wind[m] : (m >= 4 && m <= 8 ? 180 : 337), vis: null };
    var u = hr >= 5 && hr <= 14 ? 0.5 - 0.5 * Math.cos(Math.PI * (hr - 5) / 9) : 0.5 + 0.5 * Math.cos(Math.PI * ((hr < 5 ? hr + 24 : hr) - 14) / 15);
    o.temp = TN[m] + (TX[m] - TN[m]) * u - (wet ? 1.6 : 0); var base = CF.cloud[m];
    if (wet) { o.cloud = 0.92; if (r2 < 0.6) { o.rain = 0.3 + hash(day * 1.9 + hr) * 0.55; if (o.temp <= 1.5) { o.snow = o.rain; o.rain = 0; } if (m >= CF.thu[0] && m <= CF.thu[1] && hr > 13 && hr < 19 && r2 < CF.thu[2]) { o.thunder = 1; o.rain = Math.max(o.rain, 0.8); } } }
    else o.cloud = Math.max(0.03, Math.min(0.9, base + (r2 - 0.5) * 0.6)); o.hum = wet ? 90 : CF.hum0 + base * 25;
    o.code = wmo(o); return o; }
  /* ---------- the connector ---------- */
  function start() { if (S.started) return; S.started = true; var C = typeof window !== 'undefined' ? window.claude : null; if (!C || typeof C.use !== 'function') { S.err = 'no_runtime'; return; } S.wait = true;
    C.use('mcp').then(function (mcp) { S.wait = false; if (!mcp) { S.err = 'unavailable'; return; } S.mcp = mcp; watch(); }, function () { S.wait = false; S.err = 'unavailable'; }); }
  function onErr(e) { var c = (e && e.code) || 'upstream_error'; S.err = c; if (DENY.indexOf(c) >= 0) { S.src = 'none'; S.cur = null; S.min = null; } }
  function watch() { try { S.un = S.mcp.watchTool(SERVER, TOOL, INPUT, function (ev) { if (ev.type === 'data') { if (ingest(ev.result && (ev.result.payload !== undefined ? ev.result.payload : ev.result.structuredContent))) S.stamp = (ev.result.cache && ev.result.cache.storedAt) || Date.now(); }
        else { var c = ev.error && ev.error.code; if (c === 'tool_error' && !S.fb) { S.fb = true; current(); } else onErr(ev.error); } }, { refetchInterval: 600000, cache: { staleTime: 300000, gcTime: 3600000 } }); }
    catch (e) { S.err = 'bad_request'; } }
  /* MinuteCast refused (the place not covered): the current conditions alone, every 15 minutes */
  function current() { var go = function () { S.mcp.callTool(SERVER, TOOL2, INPUT, { cache: { staleTime: 300000 } }).then(function (r) { if (ingest(r && (r.payload !== undefined ? r.payload : r.structuredContent))) S.stamp = (r.cache && r.cache.storedAt) || Date.now(); }, onErr); }; go(); setInterval(go, 900000); }
  /* the weather now: live while the report is under three hours old, else the climate */
  function sample(date) { start(); var w = S.src === 'live' && Date.now() - S.t < 3 * 3600000 ? live(date || new Date()) : null; if (w) return w;
    var mw = model(date || new Date()); mw.src = S.wait ? 'wait' : 'model'; mw.site = null; mw.err = S.err; return mw; }
  if (typeof window !== 'undefined' && window[CF.fake]) { S.started = true; ingest(window[CF.fake]); S.stamp = Date.now(); }
  return { sample: sample, state: function () { return S; }, start: start, ingest: ingest, model: model, LAT: LAT, LON: LON, KEY: KEY, TZ: CF.tz };
}
/* Tokyo: the Japan Meteorological Agency's 1991–2020 normals for the Tokyo station */
var TKWEA = WXSRC({ lat: 35.7075, lon: 139.7748, key: '2409626', tz: 9, site: 'Ueno', fake: 'TKWX_FAKE', salt: 0, hum0: 55,
  tm: [5.4, 6.1, 9.4, 14.3, 18.8, 21.9, 25.7, 26.9, 23.3, 18.0, 12.5, 7.7], tx: [9.8, 10.9, 14.2, 19.4, 23.6, 26.1, 29.9, 31.3, 27.5, 22.0, 16.7, 12.0], tn: [1.2, 2.1, 5.0, 9.8, 14.6, 18.5, 22.4, 23.5, 20.3, 14.8, 8.8, 3.8],
  pr: [59.7, 56.5, 116.0, 133.7, 139.7, 167.8, 156.2, 154.7, 224.9, 234.8, 96.3, 57.9], cloud: [0.3, 0.35, 0.5, 0.55, 0.55, 0.75, 0.6, 0.5, 0.65, 0.55, 0.4, 0.3], thu: [6, 8, 0.25] });
/* (v37) Taipei: AccuWeather's "Taipei City" (key 315078, 25.048 N 121.514 E, the cell over the station); the Central Weather Administration's
   1991–2020 normals for the Taipei station (mean daily maximum, mean, minimum; precipitation; days with 0.1 mm or more); the northeast monsoon's
   drizzle in winter, the afternoon thunderstorms of May to September */
var TPEWEA = WXSRC({ lat: 25.048, lon: 121.514, key: '315078', tz: 8, site: 'Taipei City', fake: 'TPWX_FAKE', salt: 37, hum0: 64,
  tm: [16.4, 16.9, 18.8, 22.3, 25.6, 28.2, 29.9, 29.5, 27.7, 24.6, 21.9, 18.2], tx: [19.4, 20.3, 22.7, 26.4, 29.7, 32.7, 34.8, 34.2, 31.5, 27.6, 24.8, 21.0], tn: [14.2, 14.4, 16.0, 19.3, 22.6, 25.1, 26.6, 26.4, 25.0, 22.4, 19.7, 16.0],
  pr: [93.8, 102.4, 107.8, 101.4, 225.2, 234.6, 214.2, 236.5, 236.8, 162.6, 89.3, 96.9], rd: [13.6, 12.0, 14.1, 14.5, 14.5, 15.7, 11.8, 14.6, 13.8, 12.8, 12.5, 13.1],
  cloud: [0.78, 0.76, 0.72, 0.66, 0.62, 0.6, 0.48, 0.5, 0.55, 0.62, 0.7, 0.76], thu: [4, 8, 0.32], wind: [67, 67, 67, 90, 135, 180, 180, 160, 67, 67, 67, 67] });
/* (v40) the weather over THSR Taichung (Wuri): AccuWeather's Taichung City cell (315040) when the connector is there; otherwise the climate of
   the Taichung station of the Central Weather Administration, 1991–2020 normals — drier and sunnier than Taipei in autumn and winter, the plum
   rains of May and June and the summer's afternoon thunderstorms; the north wind in the cool months, the south-westerly in summer */
var TXGWEA = WXSRC({ lat: 24.1122, lon: 120.6157, key: '315040', tz: 8, site: 'Taichung City', fake: 'TXWX_FAKE', salt: 41, hum0: 74,
  tm: [17.0, 17.7, 20.1, 23.5, 26.4, 28.1, 28.9, 28.4, 27.8, 25.5, 22.6, 18.7], tx: [22.3, 22.9, 25.2, 28.1, 30.7, 32.3, 33.3, 32.7, 32.2, 30.3, 27.6, 23.9], tn: [13.4, 14.2, 16.4, 20.1, 23.1, 24.9, 25.5, 25.3, 24.6, 22.2, 19.0, 15.1],
  pr: [36.6, 63.0, 86.9, 126.8, 249.6, 329.0, 303.3, 340.8, 147.5, 25.0, 23.8, 30.5], rd: [6.6, 8.0, 10.1, 10.8, 12.3, 14.1, 13.5, 15.8, 8.5, 3.0, 4.1, 5.3],
  cloud: [0.52, 0.6, 0.64, 0.66, 0.66, 0.62, 0.5, 0.56, 0.5, 0.36, 0.42, 0.48], thu: [5, 9, 0.38], wind: [350, 350, 350, 330, 225, 200, 200, 200, 10, 350, 350, 350] });
/* (v45) the weather over THSR Tainan (Guiren · Shalun) and THSR Zuoying (Kaohsiung): AccuWeather's cells (Tainan City 697899, Kaohsiung City 701682)
   when the connector is there; otherwise the climate of the Tainan and Kaohsiung stations of the Central Weather Administration, 1991–2020 normals,
   to the nearest tenth — the south's dry, bright winter, the plum rains and the south-west monsoon's thunderstorms of summer */
var TNNWEA = WXSRC({ lat: 22.9254, lon: 120.2857, key: '697899', tz: 8, site: 'Tainan City', fake: 'TNWX_FAKE', salt: 43, hum0: 76,
  tm: [17.9, 18.9, 21.3, 24.8, 27.4, 28.6, 29.3, 28.9, 28.4, 26.3, 23.1, 19.4], tx: [23.1, 24.2, 26.6, 29.6, 31.6, 32.4, 33.2, 32.6, 32.4, 30.6, 27.8, 24.4], tn: [14.0, 15.0, 17.3, 21.0, 24.0, 25.7, 26.3, 26.0, 25.3, 23.0, 19.6, 15.5],
  pr: [20.4, 30.7, 36.0, 76.6, 171.5, 356.0, 376.6, 453.4, 171.5, 36.8, 19.4, 14.5], rd: [3.6, 4.8, 5.1, 6.7, 9.8, 14.2, 13.3, 15.6, 8.6, 2.5, 2.7, 2.7],
  cloud: [0.42, 0.5, 0.54, 0.58, 0.62, 0.64, 0.56, 0.6, 0.52, 0.36, 0.36, 0.4], thu: [5, 9, 0.42], wind: [350, 350, 340, 320, 220, 200, 200, 200, 20, 350, 350, 350] });
var KHHWEA = WXSRC({ lat: 22.6873, lon: 120.3074, key: '701682', tz: 8, site: 'Kaohsiung City', fake: 'KHWX_FAKE', salt: 47, hum0: 75,
  tm: [19.5, 20.4, 22.8, 25.9, 28.1, 29.0, 29.6, 29.1, 28.8, 27.1, 24.5, 21.0], tx: [24.0, 24.9, 27.2, 29.9, 31.6, 32.2, 32.8, 32.2, 32.1, 30.8, 28.4, 25.1], tn: [16.0, 17.0, 19.4, 22.9, 25.4, 26.5, 26.9, 26.6, 26.1, 24.3, 21.5, 17.8],
  pr: [17.4, 20.9, 36.2, 65.2, 184.9, 372.7, 411.3, 507.9, 263.0, 51.0, 20.5, 16.3], rd: [3.4, 4.1, 4.9, 6.2, 10.1, 15.1, 14.8, 17.6, 11.4, 3.6, 2.9, 2.8],
  cloud: [0.4, 0.46, 0.5, 0.56, 0.6, 0.64, 0.58, 0.62, 0.56, 0.4, 0.36, 0.38], thu: [5, 9, 0.44], wind: [350, 350, 340, 300, 230, 220, 220, 220, 30, 350, 350, 350] });

/* (v59) the two places the portal reaches, each with its own AccuWeather cell (verified against the connector's own answers: the payload's
   currentConditions / minuteCastForecast / location, as read above): Sun Moon Lake — "Shuishe Village, Nantou" (key 698116, 23.861 N 120.905 E,
   the cell over Xiangshan and Shuishe); Kenting — "Kending Village, Pingtung" (key 700058, 21.96 N 120.801 E, Little Bay and the hotel).
   Without the connector: the climate of the Central Weather Administration's Sun Moon Lake (1,015 m) and Hengchun stations, 1991–2020 normals
   to the nearest tenth as recorded here (approximate where the record was rounded) — the lake's cool, misty winters and its long summer rains,
   the cape's dry bright winter with its fierce north-east "falling mountain wind" and the south-west monsoon's rains of summer */
var SMLWEA = WXSRC({ lat: 23.861, lon: 120.905, key: '698116', tz: 8, site: 'Shuishe Village', fake: 'SMWX_FAKE', salt: 53, hum0: 80,
  tm: [14.3, 15.0, 17.0, 19.4, 21.3, 22.4, 22.9, 22.6, 22.0, 20.4, 18.2, 15.4], tx: [19.5, 20.2, 22.1, 24.0, 25.4, 26.1, 26.9, 26.7, 26.1, 24.6, 22.8, 20.4], tn: [10.6, 11.4, 13.3, 15.8, 18.0, 19.5, 19.9, 19.7, 19.0, 17.3, 14.9, 11.9],
  pr: [55.0, 85.0, 118.0, 164.0, 287.0, 426.0, 303.0, 356.0, 171.0, 36.0, 24.0, 36.0], rd: [7.0, 9.0, 11.0, 12.0, 15.0, 17.0, 14.0, 17.0, 10.0, 5.0, 4.0, 5.0],
  cloud: [0.56, 0.62, 0.66, 0.68, 0.7, 0.72, 0.62, 0.66, 0.6, 0.48, 0.46, 0.5], thu: [4, 8, 0.4], wind: [45, 45, 45, 90, 180, 200, 200, 200, 90, 45, 45, 45] });
var KTGWEA = WXSRC({ lat: 21.96, lon: 120.801, key: '700058', tz: 8, site: 'Kending Village', fake: 'KTWX_FAKE', salt: 59, hum0: 74,
  tm: [20.9, 21.6, 23.4, 25.4, 27.1, 28.0, 28.4, 28.1, 27.5, 26.2, 24.3, 22.0], tx: [24.3, 25.0, 26.8, 28.6, 30.2, 31.1, 31.6, 31.2, 30.6, 29.4, 27.5, 25.3], tn: [18.0, 18.7, 20.4, 22.6, 24.4, 25.4, 25.7, 25.5, 24.8, 23.5, 21.6, 19.2],
  pr: [26.0, 24.0, 20.0, 44.0, 160.0, 365.0, 390.0, 480.0, 308.0, 55.0, 21.0, 18.0], rd: [4.0, 4.0, 4.0, 6.0, 10.0, 15.0, 14.0, 17.0, 12.0, 5.0, 4.0, 3.0],
  cloud: [0.44, 0.48, 0.5, 0.54, 0.6, 0.66, 0.6, 0.64, 0.6, 0.46, 0.42, 0.42], thu: [5, 9, 0.4], wind: [20, 20, 20, 30, 200, 210, 210, 210, 20, 20, 20, 20] });
