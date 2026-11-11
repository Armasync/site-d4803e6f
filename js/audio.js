/* مؤثرات صوتية مولَّدة بالكامل بـ Web Audio (لا ملفات صوت) */
window.VyAudio = (function () {
  'use strict';
  let ctx = null, master = null, noiseBuf = null, muted = false, ready = false;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 2);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    ready = true;
    return ctx;
  }
  const now = () => ctx.currentTime;

  function noise(dur, gain, filterType, f0, f1, q) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const flt = ctx.createBiquadFilter();
    flt.type = filterType || 'lowpass';
    flt.frequency.setValueAtTime(f0, now());
    if (f1 && f1 !== f0) flt.frequency.exponentialRampToValueAtTime(Math.max(30, f1), now() + dur);
    flt.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, now());
    g.gain.exponentialRampToValueAtTime(0.0001, now() + dur);
    src.connect(flt); flt.connect(g); g.connect(master);
    src.start(); src.stop(now() + dur + 0.05);
  }

  function tone(type, f0, f1, dur, gain, delay) {
    const t = now() + (delay || 0);
    const o = ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.04, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  const SFX = {
    wind: () => noise(2.2, 0.1, 'lowpass', 520, 220, 0.7),
    shimmer: () => { tone('sine', 520, 1500, 1.5, 0.07); tone('sine', 780, 2200, 1.5, 0.04, 0.08); },
    step: () => noise(0.1, 0.09, 'lowpass', 240, 120, 1),
    whoosh: () => noise(0.36, 0.11, 'bandpass', 420, 2100, 1.4),
    land: () => { noise(0.24, 0.16, 'lowpass', 300, 80, 1); tone('sine', 90, 45, 0.22, 0.16); },
    charge: (o) => {
      const d = Math.min(2.6, o && o.dur ? o.dur : 1.6);
      tone('triangle', 90, 620, d, 0.09);
      noise(d, 0.07, 'bandpass', 300, 1600, 3);
    },
    beam: (o) => {
      noise(0.55, 0.16, 'bandpass', 1800, 400, 1.2);
      tone('sawtooth', 260, 70, 0.5, 0.1);
    },
    hit: (o) => {
      const p = (o && o.p) || 1;
      noise(0.16, 0.2 * p, 'bandpass', 900, 260, 1.1);
      tone('sine', 150, 55, 0.18, 0.16 * p);
    },
    boom: (o) => {
      const p = (o && o.p) || 1;
      noise(1.1 * Math.min(1.4, p), 0.24 * p, 'lowpass', 1100, 50, 0.8);
      tone('sine', 80, 28, 0.9, 0.24 * p);
    },
    slash: () => { noise(0.42, 0.15, 'highpass', 3000, 400, 0.9); tone('triangle', 1400, 300, 0.3, 0.06); },
    impact: () => { tone('triangle', 1250, 900, 0.35, 0.08); noise(0.3, 0.1, 'bandpass', 2400, 900, 2); },
    title: () => { tone('sine', 55, 55, 1.6, 0.12); tone('sine', 82.5, 82.5, 1.8, 0.07, 0.1); },
    end: () => { tone('sine', 220, 110, 2.4, 0.09); tone('sine', 330, 165, 2.2, 0.05, 0.12); }
  };

  return {
    init: function () {
      if (!ensure()) return false;
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    },
    isReady: function () { return ready; },
    play: function (name, opts) {
      if (muted || !ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      const f = SFX[name];
      if (!f) return;
      try { f(opts || {}); } catch (e) { /* تجاهل */ }
    },
    silence: function () {
      if (!ctx || !master) return;
      master.gain.cancelScheduledValues(now());
      master.gain.setTargetAtTime(0, now(), 0.02);
      muted = true;
    },
    unsilence: function () {
      muted = false;
      if (!ctx || !master) return;
      if (ctx.state === 'suspended') ctx.resume();
      master.gain.setTargetAtTime(0.8, now(), 0.05);
    },
    isMuted: function () { return muted; }
  };
})();
