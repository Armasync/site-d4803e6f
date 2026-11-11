/* سيناريو «مواجهة الفجر» — الجزء ١: الإعداد + الفصلان ١ و٢ */
window.VyFight = (function () {
  'use strict';
  const DURATION = 120;
  const keys = [], cams = [], events = [];
  const F = (x, y, pose) => ({ x: x, y: y, pose: pose });
  const K = (t, a, b) => keys.push({ t: t, a: a, b: b });
  const C = (t, zoom, fx, fy) => cams.push({ t: t, zoom: zoom, fx: fx, fy: fy });
  const E = (t, ev) => { ev.t = t; events.push(ev); };

  /* ضربة: ١ = رين (يمين) · ٢ = كورو (يسار) */
  function strike(who, t, power, o) {
    o = o || {};
    const ya = o.ya === undefined ? 0 : o.ya;
    const yb = o.yb === undefined ? ya : o.yb;
    if (who === 1) {
      K(t - 0.30, F(0.66, ya, 'dash'), F(0.38, yb, 'guard'));
      K(t - 0.05, F(0.56, ya, 'strike'), F(0.44, yb, 'hurt'));
      K(t + 0.26, F(0.63, ya, 'stance'), F(0.37, yb, 'hurt'));
      E(t, 'hit', { x: 0.48, y: ya + 0.34, p: power });
    } else {
      K(t - 0.30, F(0.62, ya, 'guard'), F(0.42, yb, 'dash'));
      K(t - 0.05, F(0.44, ya, 'hurt'), F(0.56, yb, 'strike'));
      K(t + 0.26, F(0.37, ya, 'hurt'), F(0.63, yb, 'stance'));
      E(t, 'hit', { x: 0.52, y: ya + 0.34, p: power });
    }
  }

  /* ===== الفصل ١ · هدوء (٠–٢٠) ===== */
  K(0, F(0.84, 0, 'idle'), F(0.16, 0, 'idle'));
  C(0, 1.04, 0.5, 0.56);
  E(0.8, 'audio', { sfx: 'wind' });
  E(1.4, 'title', { text: 'مواجهة الفجر', sub: 'مقطع قتالي · ١٢٠ ثانية', dur: 3.2 });
  E(2.3, 'audio', { sfx: 'shimmer' });
  E(5.0, 'phase', { name: 'هدوء', idx: 0 });
  E(5.4, 'sub', { who: 'كورو', ash: true, dur: 3.6, text: 'أرِني إن كنتَ تستحق ذلك الفجر.' });
  C(6.5, 1.10, 0.5, 0.58);
  K(7.6, F(0.84, 0, 'idle'), F(0.16, 0, 'idle'));
  K(10.4, F(0.79, 0, 'walk'), F(0.21, 0, 'walk'));
  E(10.6, 'audio', { sfx: 'step' }); E(11.1, 'audio', { sfx: 'step' }); E(11.7, 'audio', { sfx: 'step' });
  E(11.2, 'sub', { who: 'رين', dur: 3.4, text: 'لن أموت قبل أن أرى شمس الغد.' });
  K(12.9, F(0.71, 0, 'walk'), F(0.29, 0, 'stance'));
  E(13.1, 'audio', { sfx: 'shimmer' });
  K(13.7, F(0.66, 0, 'stance'), F(0.34, 0, 'stance'));
  C(13.4, 1.16, 0.5, 0.58);
  strike(1, 14.8, 0.7); strike(2, 15.7, 0.7);
  strike(1, 16.5, 0.8); strike(2, 17.4, 0.8);
  strike(1, 18.2, 0.95);
  C(18.2, 1.30, 0.5, 0.50);
  E(18.2, 'impact', { text: 'تقاطع!', dur: 1.3 });
  E(18.6, 'flash', { p: 0.55 });
  K(19.0, F(0.62, 0, 'guard'), F(0.38, 0, 'guard'));
  E(19.3, 'shake', { amp: 8, dur: 0.5 });
  K(19.8, F(0.66, 0, 'stance'), F(0.34, 0, 'stance'));
  C(20.2, 1.14, 0.5, 0.58);

  /* ===== الفصل ٢ · اشتباك (٢٠–٤٥) ===== */
  E(20.4, 'phase', { name: 'اشتباك', idx: 1 });
  E(20.8, 'sub', { who: 'كورو', ash: true, dur: 3.2, text: 'قف مكانك، وستموت واقفاً.' });
  K(21.0, F(0.63, 0, 'stance'), F(0.37, 0, 'stance'));
  K(21.5, F(0.60, 0.20, 'air'), F(0.44, 0.14, 'air'));
  E(21.5, 'audio', { sfx: 'whoosh' });
  K(22.0, F(0.55, 0.42, 'air'), F(0.45, 0.36, 'air'));
  strike(1, 22.3, 0.85, { ya: 0.42, yb: 0.36 });
  strike(2, 23.1, 0.85, { ya: 0.36, yb: 0.42 });
  K(23.7, F(0.57, 0.20, 'air'), F(0.43, 0.24, 'air'));
  K(24.3, F(0.60, 0, 'stance'), F(0.40, 0, 'stance'));
  E(24.3, 'audio', { sfx: 'land' });
  C(24.4, 1.16, 0.5, 0.55);
  strike(1, 25.1, 0.8); strike(2, 26.0, 0.8);
  K(26.7, F(0.64, 0, 'stance'), F(0.36, 0, 'guard'));
  E(26.9, 'sub', { who: 'رين', dur: 3.0, text: 'هذه المرة لن أتراجع.' });
  K(27.4, F(0.58, 0.06, 'guard'), F(0.30, 0, 'charge'));
  E(27.6, 'charge', { who: 2, dur: 2.2, x: 0.30, y: 0.44 });
  E(27.6, 'audio', { sfx: 'charge' });
  C(28.4, 1.26, 0.42, 0.55);
  E(29.6, 'beam', { who: 2, dur: 1.3 });
  E(29.6, 'audio', { sfx: 'beam' });
  K(29.9, F(0.58, 0.55, 'air'), F(0.30, 0.02, 'cast'));
  E(30.4, 'boom', { x: 0.68, y: 0.06, p: 1.0 });
  K(31.0, F(0.62, 0, 'stance'), F(0.32, 0, 'stance'));
  C(31.3, 1.14, 0.5, 0.55);
  strike(1, 31.9, 0.9); strike(1, 32.6, 0.9);
  strike(2, 33.4, 0.85); strike(1, 34.1, 0.95);
  E(34.1, 'flash', { p: 0.45 });
  K(34.7, F(0.58, 0, 'stance'), F(0.42, 0, 'hurt'));
  E(34.9, 'sub', { who: 'كورو', ash: true, dur: 3.2, text: 'جيّد… لكن هذا ليس كل شيء.' });
  K(36.0, F(0.55, 0.05, 'guard'), F(0.28, 0, 'charge'));
  E(36.1, 'impact', { text: 'زوبعة الرماد!', ash: true, dur: 2.0 });
  E(36.2, 'charge', { who: 2, dur: 2.0, x: 0.28, y: 0.48 });
  E(36.2, 'audio', { sfx: 'charge' });
  C(36.6, 1.30, 0.38, 0.55);
  E(38.2, 'beam', { who: 2, dur: 1.6, big: true });
  E(38.2, 'audio', { sfx: 'beam' });
  K(38.6, F(0.50, 0.30, 'guard'), F(0.30, 0.02, 'cast'));
  E(39.4, 'boom', { x: 0.55, y: 0.38, p: 1.2 });
  E(39.4, 'flash', { p: 0.7 });
  K(39.8, F(0.52, 0.10, 'hurt'), F(0.32, 0, 'cast'));
  K(40.6, F(0.46, 0, 'hurt'), F(0.34, 0, 'stance'));
  E(41.0, 'audio', { sfx: 'land' });
  K(42.0, F(0.52, 0, 'stance'), F(0.36, 0, 'guard'));
  E(42.4, 'charge', { who: 1, dur: 2.2, x: 0.55, y: 0.42 });
  E(42.4, 'audio', { sfx: 'charge' });
  C(42.8, 1.24, 0.60, 0.55);
  E(44.4, 'phase', { name: 'تصعيد', idx: 2 });
  E(44.7, 'beam', { who: 1, dur: 1.2 });
  E(44.7, 'audio', { sfx: 'beam' });
  K(45.0, F(0.62, 0.16, 'cast'), F(0.34, 0.10, 'guard'));
  E(45.6, 'boom', { x: 0.34, y: 0.14, p: 1.1 });
  E(45.6, 'hit', { x: 0.34, y: 0.22, p: 0.7 });

  /* ===== الدوال المساعدة للعرض ===== */
  const PHASES = [
    { t: 0, name: 'هدوء' }, { t: 20, name: 'اشتباك' }, { t: 45, name: 'تصعيد' },
    { t: 58, name: 'ذروة' }, { t: 90, name: 'لحظة بطيئة' }, { t: 108, name: 'الحسم' },
    { t: 112, name: 'سكون' }
  ];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lastIndex(arr, t) {
    let lo = 0, hi = arr.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (arr[mid].t <= t) lo = mid; else hi = mid - 1; }
    return lo;
  }
  function sample(t) {
    const s = clamp(t, 0, DURATION);
    const i = lastIndex(keys, s);
    const k0 = keys[i], k1 = keys[i + 1] || k0;
    let u = k1.t > k0.t ? (s - k0.t) / (k1.t - k0.t) : 1;
    u = clamp(u, 0, 1); u = u * u * (3 - 2 * u);
    const j = lastIndex(cams, s);
    const c0 = cams[j], c1 = cams[j + 1] || c0;
    let v = c1.t > c0.t ? (s - c0.t) / (c1.t - c0.t) : 1;
    v = clamp(v, 0, 1); v = v * v * (3 - 2 * v);
    return {
      t: s, u: u,
      a: { x: k0.a.x + (k1.a.x - k0.a.x) * u, y: k0.a.y + (k1.a.y - k0.a.y) * u },
      b: { x: k0.b.x + (k1.b.x - k0.b.x) * u, y: k0.b.y + (k1.b.y - k0.b.y) * u },
      pa: [k0.a.pose, k1.a.pose], pb: [k0.b.pose, k1.b.pose],
      cam: {
        zoom: c0.zoom + (c1.zoom - c0.zoom) * v,
        fx: c0.fx + (c1.fx - c0.fx) * v,
        fy: c0.fy + (c1.fy - c0.fy) * v
      }
    };
  }
  function phaseAt(t) {
    let p = PHASES[0];
    for (let i = 0; i < PHASES.length; i++) if (t >= PHASES[i].t) p = PHASES[i];
    return p;
  }
  function stats() {
    let hits = 0, energy = 0, frames = 0;
    for (let i = 0; i < events.length; i++) {
      const ty = events[i].type;
      if (ty === 'hit') hits++;
      else if (ty === 'charge') energy++;
      else if (ty === 'impact') frames++;
    }
    return { hits: hits, energy: energy, frames: frames };
  }

  return { DURATION, keys, cams, events, F, K, C, E, strike, sample, phaseAt, stats, PHASES, clamp };
})();
