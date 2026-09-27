/* Tiny WebAudio instrument sketches for the "octave" keys.
   Everything is synthesized on the fly; nothing plays until a user presses a key. */
(function () {
  'use strict';

  var ctx = null;
  var master = null;
  var noiseBuf = null;
  var pluckCache = {};

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.6;
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 4;
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function noise() {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    return src;
  }

  function envGain(t, attack, peak, hold, release) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    return g;
  }

  /* ---- piano: additive partials with a hammer-like decay ---- */
  function pianoNote(f, t, vel) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3 * vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.07 * vel, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    g.connect(master);
    var partials = [[1, 1, 'triangle'], [2, 0.42, 'sine'], [3, 0.16, 'sine'], [4.02, 0.07, 'sine']];
    partials.forEach(function (p) {
      var o = ctx.createOscillator();
      var pg = ctx.createGain();
      o.type = p[2];
      o.frequency.value = f * p[0];
      pg.gain.value = p[1];
      o.connect(pg);
      pg.connect(g);
      o.start(t);
      o.stop(t + 2.7);
    });
  }
  function piano() {
    var t = ctx.currentTime + 0.02;
    [48, 60, 64, 67, 72].forEach(function (n, i) { pianoNote(hz(n), t + i * 0.06, 1 - i * 0.1); });
  }

  /* ---- guitar: Karplus-Strong plucked strings ---- */
  function pluckBuffer(f) {
    var key = f.toFixed(2);
    if (pluckCache[key]) return pluckCache[key];
    var sr = ctx.sampleRate;
    var n = Math.max(2, Math.round(sr / f));
    var len = Math.floor(sr * 2.4);
    var buf = ctx.createBuffer(1, len, sr);
    var out = buf.getChannelData(0);
    var ring = new Float32Array(n);
    var last = 0;
    for (var i = 0; i < n; i++) {
      var r = Math.random() * 2 - 1;
      last = last * 0.55 + r * 0.45;
      ring[i] = last;
    }
    var idx = 0;
    for (var j = 0; j < len; j++) {
      var nxt = (idx + 1) % n;
      out[j] = ring[idx];
      ring[idx] = 0.4985 * (ring[idx] + ring[nxt]);
      idx = nxt;
    }
    pluckCache[key] = buf;
    return buf;
  }
  function guitar() {
    var t = ctx.currentTime + 0.02;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3800;
    var body = ctx.createBiquadFilter();
    body.type = 'peaking';
    body.frequency.value = 220;
    body.Q.value = 1.1;
    body.gain.value = 4;
    var g = ctx.createGain();
    g.gain.value = 0.5;
    lp.connect(body);
    body.connect(g);
    g.connect(master);
    [43, 47, 50, 55, 59, 67].forEach(function (n, i) {
      var src = ctx.createBufferSource();
      src.buffer = pluckBuffer(hz(n));
      src.connect(lp);
      src.start(t + i * 0.022);
    });
  }

  /* ---- bowed strings: detuned saws, body resonance, delayed vibrato ---- */
  function bowed(f, t, dur, bodyHz, level) {
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = Math.min(f * 6, 6000);
    lp.Q.value = 0.7;
    var body = ctx.createBiquadFilter();
    body.type = 'peaking';
    body.frequency.value = bodyHz;
    body.Q.value = 1.3;
    body.gain.value = 6;
    var g = envGain(t, 0.22, level, dur - 0.6, 0.4);
    lp.connect(body);
    body.connect(g);
    g.connect(master);
    var lfo = ctx.createOscillator();
    var depth = ctx.createGain();
    lfo.frequency.value = 5.4;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(f * 0.007, t + 0.55);
    lfo.connect(depth);
    [0, 6, -5].forEach(function (cents) {
      var o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = cents;
      depth.connect(o.frequency);
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.1);
    });
    lfo.start(t);
    lfo.stop(t + dur + 0.1);
  }
  function violin() { bowed(hz(74), ctx.currentTime + 0.02, 1.5, 2900, 0.1); }
  function viola() { bowed(hz(64), ctx.currentTime + 0.02, 1.6, 1500, 0.12); }
  function cello() {
    var t = ctx.currentTime + 0.02;
    bowed(hz(41), t, 1.8, 520, 0.12);
    bowed(hz(48), t, 1.8, 520, 0.08);
  }

  /* ---- voice: sawtooth source through "ah" formants ---- */
  function voice() {
    var t = ctx.currentTime + 0.02;
    var dur = 1.5;
    var f = hz(69);
    var src = ctx.createOscillator();
    src.type = 'sawtooth';
    src.frequency.setValueAtTime(f * 0.985, t);
    src.frequency.linearRampToValueAtTime(f, t + 0.12);
    var lfo = ctx.createOscillator();
    var depth = ctx.createGain();
    lfo.frequency.value = 5.2;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(f * 0.012, t + 0.5);
    lfo.connect(depth);
    depth.connect(src.frequency);
    var out = envGain(t, 0.14, 0.9, dur - 0.5, 0.36);
    out.connect(master);
    [[800, 9, 1], [1150, 11, 0.5], [2900, 14, 0.22]].forEach(function (fm) {
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = fm[0];
      bp.Q.value = fm[1];
      var fg = ctx.createGain();
      fg.gain.value = fm[2];
      src.connect(bp);
      bp.connect(fg);
      fg.connect(out);
    });
    src.start(t);
    lfo.start(t);
    src.stop(t + dur + 0.1);
    lfo.stop(t + dur + 0.1);
  }

  /* ---- drums: kick, snare, hat ---- */
  function kick(t) {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.45);
  }
  function snare(t) {
    var n = noise();
    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1300;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    n.connect(hp);
    hp.connect(g);
    g.connect(master);
    n.start(t);
    n.stop(t + 0.22);
    var o = ctx.createOscillator();
    var og = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 190;
    og.gain.setValueAtTime(0.35, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(og);
    og.connect(master);
    o.start(t);
    o.stop(t + 0.12);
  }
  function hat(t) {
    var n = noise();
    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    n.connect(hp);
    hp.connect(g);
    g.connect(master);
    n.start(t);
    n.stop(t + 0.06);
  }
  function drums() {
    var t = ctx.currentTime + 0.03;
    var e = 60 / 116 / 2;
    var bar = ['kh', 'h', 'sh', 'h', 'kh', 'kh', 'sh', 'h'];
    bar.forEach(function (hit, i) {
      var at = t + i * e;
      if (hit.indexOf('k') > -1) kick(at);
      if (hit.indexOf('s') > -1) snare(at);
      if (hit.indexOf('h') > -1) hat(at);
    });
  }

  var voices = { piano: piano, violin: violin, viola: viola, cello: cello, guitar: guitar, voice: voice, drums: drums };

  window.SFLCMSynth = {
    play: function (name) {
      if (!voices[name] || !audio()) return false;
      voices[name]();
      return true;
    }
  };
})();
