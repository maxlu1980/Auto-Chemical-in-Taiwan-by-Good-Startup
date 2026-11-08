// the songs and the film's bars, taken from the page's own source (src/tw_cine_c.js), so the recording keeps the film's timing exactly
//   node export_song.js ../src/tw_cine_c.js song.json
const fs = require('fs'); const [src, out] = process.argv.slice(2);
const s = fs.readFileSync(src, 'utf8'); const a = s.indexOf('  var SONG = (function'); const b = s.lastIndexOf('\n', s.indexOf('function pentUp('));
const m = { exports: {} }; new Function('module', s.slice(a, b) + '; module.exports = { SONG: SONG };')(m);
const S = m.exports.SONG, ch = h => ({ b: h.b, c: h.c });
const o = { BCH: S.BCH, UIH: S.UIH, BCH_H: S.BCH_H.map(ch), UIH_H: S.UIH_H.map(ch), PENT: S.PENT };
// the film's bar map as score() lays it out (a film of 40 s; its last note where the bars put it, 36.35 s, for any title moment from 36.6 s on)
const T = 40, tT = 36.6, k = T / 40, tS = 0.35 * k, W = [0.6]; for (let i = 0; i < 12; i++) W.push(i >= 10 ? 1.12 : 1);
const tF = Math.max(tS + 20 * k, Math.min(tS + 36 * k, tT - 0.25)), unit = (tF - tS) / (W.reduce((x, y) => x + y, 0) - W[12] * 0.75);
let tb = tS; const bars = []; for (let i = 0; i < 13; i++) { bars.push([tb, W[i] * unit]); tb += W[i] * unit; }
o.film = { T, tT, tS, tF, unit, bars, hold: Math.max(2.5, (T + 0.4) - tF) }; o.loop = { bl: 3.1 };
fs.writeFileSync(out, JSON.stringify(o)); console.log(JSON.stringify(o.film));
