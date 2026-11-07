/* ===== [sim_audio.js] ===== */
/* ===== SimAudio — the jobsite in sound =====
   Everything is synthesised in Web Audio at run time (no recordings are shipped): the ambience of the place (wind, birds, distant traffic and
   site noise outdoors; the hum and reverberant quiet of a room indoors), the tools as they work (the ratchet and squeeze of a caulking gun, the
   scrape of a spatula, the wet run of a roller, the hiss of a primer brush, the whine of a disc cutter or a drill mixer, the jet of a pressure
   washer, the slap of a sounding hammer, the rip of masking tape …), footsteps while walking, and the small sounds of the interface.
   Sound starts on the first gesture of the user (browsers require it) and can be muted; the choice is remembered. */
var SimAudio = (function () {
  var ctx = null, master = null, bus = null, comp = null, noiseBuf = null, muted = false, amb = null, tool = null, started = false, listeners = [];
  try { muted = localStorage.getItem('ac-guide-snd') === 'off'; } catch (e) {}
  function has() { return !!(window.AudioContext || window.webkitAudioContext); }
  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} } return ctx; }
    if (!has()) return null;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 4; comp.attack.value = 0.01; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1; bus = ctx.createGain(); bus.gain.value = 0.9;
    bus.connect(comp); comp.connect(master); master.connect(ctx.destination);
    var n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), i; for (i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; noiseBuf = b;
    started = true; return ctx;
  }
  /* ----- building blocks ----- */
  function noise(o) { var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = (o && o.rate) || 1; return s; }
  function filt(type, f, q) { var x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q != null) x.Q.value = q; return x; }
  function gain(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
  function osc(type, f) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; }
  var LF = []; /* the modulators, so a chain can stop its own when it stops */
  function lfo(f, depth, target, base) { var o = osc('sine', f), g = gain(depth); o.connect(g); g.connect(target); if (base != null) target.value = base; o.start(); LF.push({ o: o, g: g, t: target }); return o; }
  function stopLfos(params) { LF = LF.filter(function (l) { if (params.indexOf(l.t) < 0) return true; try { l.o.stop(); l.o.disconnect(); l.g.disconnect(); } catch (e) {} return false; }); }
  function env(g, t0, a, v, hold, r) { var p = g.gain; p.cancelScheduledValues(t0); p.setValueAtTime(0.0001, t0); p.exponentialRampToValueAtTime(Math.max(0.0002, v), t0 + a); p.setValueAtTime(Math.max(0.0002, v), t0 + a + hold); p.exponentialRampToValueAtTime(0.0001, t0 + a + hold + r); }
  /* a chain: nodes connected in order, the last into the bus; .stop() fades it out and disconnects */
  function chain(nodes, vol, out) { var g = gain(0), i; for (i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); nodes[nodes.length - 1].connect(g); g.connect(out || bus); g.gain.setTargetAtTime(vol, ctx.currentTime, 0.08); var srcs = nodes.filter(function (n) { return n.start; }); srcs.forEach(function (s) { try { s.start(); } catch (e) {} });
    return { g: g, nodes: nodes, stop: function (fade) { var t = ctx.currentTime; g.gain.setTargetAtTime(0, t, fade || 0.12); setTimeout(function () { srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); try { g.disconnect(); } catch (e) {} var ps = [g.gain]; nodes.forEach(function (n) { if (n.frequency) ps.push(n.frequency); if (n.gain) ps.push(n.gain); }); stopLfos(ps); }, ((fade || 0.12) * 5 + 0.1) * 1000); }, set: function (v) { g.gain.setTargetAtTime(v, ctx.currentTime, 0.08); } }; }
  /* a repeating one-shot (clicks, strokes, impacts): fn(t) schedules one event at time t; period with jitter */
  function ticker(period, jitter, fn) { var on = true, id = 0; function next() { if (!on) return; var t = ctx.currentTime + 0.02; fn(t); id = setTimeout(next, (period + (Math.random() - 0.5) * 2 * jitter) * 1000); } next(); return { stop: function () { on = false; clearTimeout(id); } }; }
  function burst(t, dur, f, q, vol, type) { var s = noise(), bp = filt(type || 'bandpass', f, q || 1), g = gain(0); s.connect(bp); bp.connect(g); g.connect(bus); env(g, t, 0.004, vol, dur * 0.3, dur * 0.7); s.start(t); s.stop(t + dur + 0.1); }
  function thud(t, f, vol, dur) { var o = osc('sine', f), g = gain(0); o.connect(g); g.connect(bus); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f * 0.4), t + (dur || 0.12)); env(g, t, 0.003, vol, 0.01, dur || 0.12); o.start(t); o.stop(t + (dur || 0.12) + 0.1); }
  function tone(t, f, vol, dur, type) { var o = osc(type || 'sine', f), g = gain(0); o.connect(g); g.connect(bus); env(g, t, 0.01, vol, dur * 0.5, dur * 0.5); o.start(t); o.stop(t + dur + 0.1); }

  /* ----- ambiences ----- */
  var A = {
    /* a facade or a garden wall outdoors: wind in the trees, birds now and then, the far traffic, a distant site */
    outdoor: function () { var parts = [];
      var w = chain([noise({ rate: 0.6 }), filt('lowpass', 420, 0.5)], 0.11); lfo(0.07, 180, w.nodes[1].frequency, 420); lfo(0.13, 0.03, w.g.gain, 0.11); parts.push(w);
      parts.push(chain([noise({ rate: 0.3 }), filt('lowpass', 110, 0.7)], 0.07)); /* traffic rumble */
      var birds = ticker(2.6, 1.6, function (t) { var n = 2 + Math.floor(Math.random() * 3), i; for (i = 0; i < n; i++) { var f0 = 2600 + Math.random() * 1800, o = osc('sine', f0), g = gain(0); o.connect(g); g.connect(bus); var tt = t + i * 0.11; o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f0 * (0.7 + Math.random() * 0.6), tt + 0.09); env(g, tt, 0.01, 0.018, 0.03, 0.06); o.start(tt); o.stop(tt + 0.2); } });
      var site = ticker(7, 4, function (t) { if (Math.random() < 0.5) { var k, n = 2 + Math.floor(Math.random() * 3); for (k = 0; k < n; k++) thud(t + k * 0.42, 140, 0.05, 0.18); } else burst(t, 0.9, 900, 0.6, 0.04); }); /* a hammer or a saw far away */
      return { parts: parts, tickers: [birds, site] }; },
    /* a roof: more wind, the city below */
    roof: function () { var parts = [];
      var w = chain([noise({ rate: 0.8 }), filt('lowpass', 700, 0.6)], 0.14); lfo(0.05, 300, w.nodes[1].frequency, 700); lfo(0.17, 0.05, w.g.gain, 0.14); parts.push(w);
      parts.push(chain([noise({ rate: 0.3 }), filt('lowpass', 140, 0.7)], 0.09));
      var gull = ticker(9, 5, function (t) { var o = osc('sawtooth', 900), g = gain(0), f = filt('lowpass', 1800); o.connect(f); f.connect(g); g.connect(bus); o.frequency.setValueAtTime(700, t); o.frequency.linearRampToValueAtTime(1100, t + 0.25); o.frequency.linearRampToValueAtTime(650, t + 0.6); env(g, t, 0.05, 0.012, 0.3, 0.3); o.start(t); o.stop(t + 0.8); });
      return { parts: parts, tickers: [gull] }; },
    /* a room: the hum of services, a ventilation fan, the quiet reverb of hard walls */
    indoor: function () { var parts = [];
      parts.push(chain([osc('sine', 50), gain(1)], 0.025)); parts.push(chain([osc('sine', 100), gain(1)], 0.012));
      var fan = chain([noise({ rate: 0.5 }), filt('bandpass', 260, 0.8)], 0.05); lfo(0.3, 0.012, fan.g.gain, 0.05); parts.push(fan);
      var knock = ticker(11, 6, function (t) { thud(t, 90, 0.04, 0.25); if (Math.random() < 0.4) burst(t + 0.6, 0.5, 1400, 0.8, 0.02); });
      return { parts: parts, tickers: [knock] }; }
  };
  /* ----- the tools at work: each returns { stop() } ----- */
  var R = {
    gun: function () { /* a cartridge gun: the trigger's ratchet every stroke, the sealant pressed out as a soft, wet hiss */
      var hiss = chain([noise({ rate: 0.7 }), filt('bandpass', 900, 0.7)], 0.03); lfo(2.1, 0.012, hiss.g.gain, 0.03);
      var tk = ticker(0.48, 0.06, function (t) { burst(t, 0.03, 2600, 2.2, 0.08, 'bandpass'); burst(t + 0.012, 0.02, 1400, 3, 0.05); });
      return { stop: function () { hiss.stop(); tk.stop(); } }; },
    spatula: function () { /* a spatula drawn along the joint: a scraping stroke and back, the blade's ring */
      var s = chain([noise({ rate: 1.1 }), filt('bandpass', 2400, 1.1)], 0.0); var tk = ticker(0.9, 0.12, function (t) { var g = s.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.004, t); g.linearRampToValueAtTime(0.06, t + 0.25); g.linearRampToValueAtTime(0.004, t + 0.7); burst(t + 0.02, 0.05, 5200, 6, 0.012); });
      return { stop: function () { s.stop(); tk.stop(); } }; },
    knife: function () { var s = chain([noise({ rate: 1.3 }), filt('highpass', 1800, 0.8)], 0.0); var tk = ticker(0.7, 0.1, function (t) { var g = s.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.003, t); g.linearRampToValueAtTime(0.045, t + 0.12); g.linearRampToValueAtTime(0.003, t + 0.5); var k; for (k = 0; k < 6; k++) burst(t + 0.05 + k * 0.07 + Math.random() * 0.03, 0.012, 3200, 4, 0.02); });
      return { stop: function () { s.stop(); tk.stop(); } }; },
    brush: function () { var s = chain([noise({ rate: 0.9 }), filt('bandpass', 1500, 0.5)], 0.0); var tk = ticker(0.62, 0.08, function (t) { var g = s.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.004, t); g.linearRampToValueAtTime(0.07, t + 0.18); g.linearRampToValueAtTime(0.004, t + 0.5); });
      return { stop: function () { s.stop(); tk.stop(); } }; },
    broom: function () { var s = chain([noise({ rate: 0.8 }), filt('bandpass', 700, 0.6)], 0.0); var tk = ticker(0.85, 0.1, function (t) { var g = s.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.005, t); g.linearRampToValueAtTime(0.1, t + 0.3); g.linearRampToValueAtTime(0.005, t + 0.75); });
      return { stop: function () { s.stop(); tk.stop(); } }; },
    primer: function () { var s = chain([noise({ rate: 1.0 }), filt('bandpass', 2000, 0.8)], 0.0); var tk = ticker(0.55, 0.08, function (t) { var g = s.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.003, t); g.linearRampToValueAtTime(0.035, t + 0.15); g.linearRampToValueAtTime(0.003, t + 0.45); });
      return { stop: function () { s.stop(); tk.stop(); } }; },
    roller: function () { /* a roller in wet coating: the sticky run of the nap, the pass and the return */
      var s = chain([noise({ rate: 0.5 }), filt('lowpass', 1600, 0.6)], 0.0), cr = chain([noise({ rate: 1.6 }), filt('highpass', 3500, 0.7)], 0.0);
      var tk = ticker(1.1, 0.1, function (t) { [s.g.gain, cr.g.gain].forEach(function (g, i) { var v = i ? 0.02 : 0.08; g.cancelScheduledValues(t); g.setValueAtTime(0.003, t); g.linearRampToValueAtTime(v, t + 0.35); g.linearRampToValueAtTime(0.003, t + 0.95); }); });
      return { stop: function () { s.stop(); cr.stop(); tk.stop(); } }; },
    trowel: function () { /* a notched trowel through adhesive: a steel scrape with a wet drag */
      var s = chain([noise({ rate: 0.9 }), filt('bandpass', 1300, 0.9)], 0.0), tk = ticker(0.95, 0.1, function (t) { var g = s.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.004, t); g.linearRampToValueAtTime(0.08, t + 0.3); g.linearRampToValueAtTime(0.004, t + 0.8); burst(t + 0.05, 0.08, 4200, 5, 0.015); });
      return { stop: function () { s.stop(); tk.stop(); } }; },
    tape: function () { var tk = ticker(0.75, 0.15, function (t) { var s = noise({ rate: 1.4 }), f = filt('bandpass', 2800, 0.9), g = gain(0); s.connect(f); f.connect(g); g.connect(bus); env(g, t, 0.01, 0.06, 0.12, 0.1); f.frequency.setValueAtTime(2000, t); f.frequency.linearRampToValueAtTime(3600, t + 0.22); s.start(t); s.stop(t + 0.4); });
      return { stop: function () { tk.stop(); } }; },
    rod: function () { var tk = ticker(0.5, 0.08, function (t) { burst(t, 0.06, 600, 0.9, 0.05); thud(t, 120, 0.03, 0.08); }); return { stop: function () { tk.stop(); } }; },
    hand: function () { var tk = ticker(0.6, 0.15, function (t) { burst(t, 0.09, 1100, 0.7, 0.03); }); return { stop: function () { tk.stop(); } }; },
    hammer: function () { var tk = ticker(0.42, 0.04, function (t) { thud(t, 420, 0.12, 0.05); burst(t, 0.02, 3000, 2, 0.05); }); return { stop: function () { tk.stop(); } }; },
    hose: function () { /* a pressure washer: the pump's drone under the jet */
      var jet = chain([noise({ rate: 1.0 }), filt('bandpass', 2200, 0.5)], 0.12), pump = chain([osc('sawtooth', 95), filt('lowpass', 500)], 0.03); lfo(27, 0.015, jet.g.gain, 0.12);
      return { stop: function () { jet.stop(); pump.stop(); } }; },
    spray: function () { var hiss = chain([noise({ rate: 1.2 }), filt('highpass', 2600, 0.6)], 0.09), comp2 = chain([osc('sawtooth', 120), filt('lowpass', 420)], 0.025); lfo(0.4, 0.015, hiss.g.gain, 0.09);
      return { stop: function () { hiss.stop(); comp2.stop(); } }; },
    mixer: function () { /* a drill with a paddle in the pail: the motor's whine, the slurry slapping */
      var m = chain([osc('sawtooth', 160), filt('lowpass', 1800, 1.2)], 0.035), h = chain([osc('square', 320), filt('lowpass', 2500)], 0.01), sl = chain([noise({ rate: 0.4 }), filt('lowpass', 500, 0.5)], 0.05); lfo(3.1, 6, m.nodes[0].frequency, 160); lfo(1.7, 0.025, sl.g.gain, 0.05);
      return { stop: function () { m.stop(); h.stop(); sl.stop(); } }; },
    cutter: function () { var w = chain([osc('sawtooth', 240), filt('bandpass', 4200, 2.5)], 0.05), g2 = chain([noise({ rate: 1.5 }), filt('highpass', 5000, 0.7)], 0.05); lfo(0.9, 30, w.nodes[0].frequency, 240); lfo(6, 0.02, g2.g.gain, 0.05);
      return { stop: function () { w.stop(); g2.stop(); } }; },
    chisel: function () { var tk = ticker(0.3, 0.03, function (t) { thud(t, 900, 0.09, 0.03); burst(t, 0.015, 4500, 3, 0.05); }); return { stop: function () { tk.stop(); } }; },
    vacuum: function () { var a = chain([osc('sawtooth', 110), filt('lowpass', 900)], 0.03), b2 = chain([noise({ rate: 1.0 }), filt('bandpass', 1200, 0.4)], 0.07); return { stop: function () { a.stop(); b2.stop(); } }; },
    rag: function () { var tk = ticker(0.5, 0.1, function (t) { burst(t, 0.2, 900, 0.5, 0.03); }); return { stop: function () { tk.stop(); } }; },
    meter: function () { var tk = ticker(1.2, 0.2, function (t) { tone(t, 2200, 0.03, 0.06, 'square'); }); return { stop: function () { tk.stop(); } }; },
    sand: function () { var s = chain([noise({ rate: 1.3 }), filt('bandpass', 3200, 0.6)], 0.0), tk = ticker(0.8, 0.1, function (t) { var g = s.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.003, t); g.linearRampToValueAtTime(0.05, t + 0.1); g.linearRampToValueAtTime(0.003, t + 0.6); }); return { stop: function () { s.stop(); tk.stop(); } }; },
    weight: function () { var tk = ticker(1.6, 0.3, function (t) { thud(t, 70, 0.1, 0.2); burst(t + 0.02, 0.05, 500, 1, 0.03); }); return { stop: function () { tk.stop(); } }; },
    look: function () { return { stop: function () {} }; }
  };
  /* ----- the interface and the body ----- */
  var FX = {
    click: function (t) { burst(t, 0.02, 1800, 3, 0.05); },
    ok: function (t) { tone(t, 880, 0.08, 0.1); tone(t + 0.1, 1320, 0.08, 0.16); },
    bad: function (t) { tone(t, 220, 0.09, 0.22, 'square'); tone(t + 0.05, 190, 0.05, 0.25, 'square'); },
    done: function (t) { [660, 880, 1100, 1320].forEach(function (f, i) { tone(t + i * 0.09, f, 0.07, 0.3); }); },
    cartridge: function (t) { burst(t, 0.03, 1200, 2, 0.07); thud(t + 0.12, 300, 0.05, 0.05); burst(t + 0.25, 0.04, 2600, 2, 0.06); },
    rip: function (t) { var s = noise({ rate: 1.4 }), f = filt('bandpass', 2600, 0.9), g = gain(0); s.connect(f); f.connect(g); g.connect(bus); env(g, t, 0.01, 0.07, 0.2, 0.1); s.start(t); s.stop(t + 0.5); },
    step: function (t) { thud(t, 95, 0.045, 0.09); burst(t, 0.05, 700, 0.8, 0.025); },
    tick: function (t) { tone(t, 1500, 0.02, 0.03, 'square'); },
    page: function (t) { burst(t, 0.12, 1400, 0.6, 0.03); }
  };
  function change() { listeners.forEach(function (f) { try { f(muted); } catch (e) {} }); }
  var api = {
    has: has, started: function () { return started; },
    init: function () { return !!ensure(); },
    ambient: function (kind) { if (!ensure()) return; if (amb && amb.kind === kind) return; if (amb) { amb.parts.forEach(function (p) { p.stop(0.6); }); amb.tickers.forEach(function (t) { t.stop(); }); amb = null; } if (!kind || !A[kind]) return; var a = A[kind](); a.kind = kind; amb = a; },
    tool: function (kind) { if (!ensure()) return; if (tool && tool.kind === kind) return; if (tool) { tool.stop(); tool = null; } if (!kind || !R[kind]) return; var t = R[kind](); t.kind = kind; tool = t; },
    fx: function (name) { if (!ensure() || !FX[name]) return; try { FX[name](ctx.currentTime + 0.01); } catch (e) {} },
    stopAll: function () { if (tool) { tool.stop(); tool = null; } if (amb) { amb.parts.forEach(function (p) { p.stop(0.4); }); amb.tickers.forEach(function (t) { t.stop(); }); amb = null; } },
    suspend: function () { api.stopAll(); if (ctx && ctx.state === 'running') { try { ctx.suspend(); } catch (e) {} } },
    mute: function (m) { muted = !!m; try { localStorage.setItem('ac-guide-snd', muted ? 'off' : 'on'); } catch (e) {} if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05); change(); },
    toggle: function () { api.mute(!muted); return muted; }, muted: function () { return muted; }, onChange: function (f) { listeners.push(f); },
    tools: function () { return Object.keys(R); }
  };
  return api;
})();


