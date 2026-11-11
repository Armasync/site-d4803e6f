/* المشغّل: يربط السيناريو بالمحرّك والصوت والواجهة */
(function () {
  'use strict';
  const T = window.VyFight, R = window.VyRender, AUD = window.VyAudio;
  const $ = (id) => document.getElementById(id);
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const ar = (n) => String(n).replace(/\d/g, (d) => AR[+d]);
  const pad = (n) => (n < 10 ? '0' : '') + n;
  const clamp = T.clamp;
  const fmt = (s) => {
    s = clamp(s, 0, T.DURATION);
    return ar(Math.floor(s / 60)) + ':' + ar(pad(Math.floor(s % 60)));
  };

  const el = {
    start: $('view-start'), player: $('view-player'),
    cv: $('cv'), shell: $('stageShell'),
    barA: $('barA'), barB: $('barB'), eA: $('energyA'), eB: $('energyB'),
    chapter: $('chapter'), clock: $('clock'), fnum: $('fnum'),
    fill: $('fill'), fill2: $('fill2'), seek: $('seek'),
    impact: $('impact'), sub: $('sub'), title: $('titlecard'),
    slowmo: $('slowmo'), pause: $('pause'), pauseInfo: $('pauseInfo'),
    end: $('endcard'), tag: $('tag')
  };

  let t = 0, playing = false, ptr = 0, lastTs = 0, ended = false;
  let fadeAt = -99;
  let mode = 'start';
  let muted = false;
  let fadeVal = 0, slow = { until: 0, rate: 1 };
  const charge = { a: null, b: null };
  const subTimer = { id: 0 }, titleTimer = { id: 0 }, impactTimer = { id: 0 };

  /* ---------------- الأحداث ---------------- */
  function setSub(ev) {
    const who = ev.who ? ev.who + ': ' : '';
    el.sub.innerHTML = '<b>' + who + '</b>' + ev.text;
    el.sub.classList.toggle('ash', !!ev.ash);
    el.sub.hidden = false;
    clearTimeout(subTimer.id);
    subTimer.id = setTimeout(() => { el.sub.hidden = true; }, (ev.dur || 3) * 1000);
  }
  function setTitle(ev) {
    el.title.innerHTML = '<b>' + ev.text + '</b><span>' + (ev.sub || '') + '</span>';
    el.title.hidden = false;
    el.title.classList.remove('in');
    void el.title.offsetWidth;
    el.title.classList.add('in');
    clearTimeout(titleTimer.id);
    titleTimer.id = setTimeout(() => { el.title.hidden = true; }, (ev.dur || 3) * 1000);
  }
  function setImpact(ev) {
    el.impact.textContent = ev.text;
    el.impact.hidden = false;
    el.impact.classList.remove('in');
    void el.impact.offsetWidth;
    el.impact.classList.add('in');
    clearTimeout(impactTimer.id);
    impactTimer.id = setTimeout(() => { el.impact.hidden = true; }, (ev.dur || 1.2) * 1000);
  }

  function fire(ev) {
    switch (ev.type) {
      case 'audio': AUD.play(ev.sfx, ev.opt); break;
      case 'hit':
        R.hit(ev.x, ev.y, ev.p);
        AUD.play('hit', { p: ev.p });
        break;
      case 'boom':
        R.boom(ev.x, ev.y, ev.p);
        AUD.play('boom', { p: ev.p });
        break;
      case 'beam':
        R.beam({ who: ev.who, dur: ev.dur || 1, big: !!ev.big });
        AUD.play('beam', { big: !!ev.big });
        break;
      case 'slash':
        R.slash(ev.who === 2 ? '#FF2E88' : '#00E1FF');
        AUD.play('slash');
        break;
      case 'flash': R.flash(ev.p || 0.5); break;
      case 'shake': R.shake(ev.amp || 8, ev.dur || 0.5); break;
      case 'charge':
        charge[ev.who === 1 ? 'a' : 'b'] = { start: ev.t, end: ev.t + (ev.dur || 1.4), big: !!ev.big };
        R.ring(ev.x, ev.y, ev.who === 1 ? '#00E1FF' : '#FF2E88', !!ev.big);
        break;
      case 'sub': setSub(ev); break;
      case 'title': setTitle(ev); break;
      case 'impact': setImpact(ev); break;
      case 'slowmo': slow = { until: ev.t + (ev.dur || 3), rate: ev.rate || 0.4 }; break;
      case 'fade': fadeAt = ev.t; break;
      case 'phase': break;
      case 'end': onEnd(); break;
    }
  }

  function runEvents(upTo) {
    while (ptr < T.events.length && T.events[ptr].t <= upTo) fire(T.events[ptr++]);
  }
  function resetEvents(from) {
    ptr = 0;
    while (ptr < T.events.length && T.events[ptr].t <= from) ptr++;
  }

  /* ---------------- الحالة لكل إطار ---------------- */
  function aura() {
    const now = t, out = { a: 0, b: 0 };
    ['a', 'b'].forEach((k) => {
      const c = charge[k];
      if (!c) return;
      if (now < c.start) return;
      const up = clamp((now - c.start) / 0.45, 0, 1);
      const down = now > c.end ? clamp(1 - (now - c.end) / 0.5, 0, 1) : 1;
      out[k] = up * down * (c.big ? 1.25 : 1);
      if (now > c.end + 0.6) charge[k] = null;
    });
    return out;
  }

  function draw(dt) {
    const st = T.sample(t);
    st.pose = null;
    st.a.pose = st.u < 0.5 ? st.pa[0] : st.pa[1];
    st.b.pose = st.u < 0.5 ? st.pb[0] : st.pb[1];
    st.aura = aura();
    const endFade = fadeAt > 0 ? clamp((t - fadeAt) / 1.8, 0, 1) * 0.94 : 0;
    const introFade = t < 1.4 ? clamp(1 - t / 1.4, 0, 1) * 0.9 : 0;
    st.fade = Math.max(endFade, introFade);
    R.render(st, dt);
    hud();
  }

  function hud() {
    const p = clamp(t / T.DURATION, 0, 1);
    const ph = T.phaseAt(t);
    el.fill.style.width = (p * 100).toFixed(2) + '%';
    el.fill2.style.width = (p * 100).toFixed(2) + '%';
    el.seek.setAttribute('aria-valuenow', Math.round(t));
    el.clock.textContent = fmt(t) + ' / ' + fmt(T.DURATION);
    el.chapter.textContent = ph.name + ' · ' + fmt(t);
    el.fnum.textContent = 'إطار ' + ar(Math.round(t * 60)) + ' / ' + ar(T.DURATION * 60);
    const e = Math.round(clamp(100 - p * 74 + Math.sin(t * 2.2) * 1.6, 8, 100));
    el.barA.style.width = e + '%';
    el.barB.style.width = Math.max(6, 100 - Math.round(p * 88)) + '%';
    el.eA.textContent = ar(e) + '٪';
    el.eB.textContent = ar(Math.max(6, 100 - Math.round(p * 88))) + '٪';
    const s = slow.until > t;
    el.slowmo.hidden = !s;
    if (s) el.slowmo.textContent = '×٠.٣ · بطيء';
    el.tag.textContent = t > 90 && t < 95 ? 'SLOW MO' : '٦٠FPS';
  }

  /* ---------------- الحلقة ---------------- */
  function loop(ts) {
    requestAnimationFrame(loop);
    const dtReal = lastTs ? Math.min(0.06, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    if (playing && !ended) {
      const rate = slow.until > t ? slow.rate : 1;
      const dt = dtReal * rate;
      t = Math.min(T.DURATION, t + dt);
      runEvents(t);
      draw(dt);
      if (t >= T.DURATION) onEnd();
    } else {
      draw(0);
    }
  }

  /* ---------------- الحالة العامة ---------------- */
  function start(player) {
    if (player) { go('player'); }
    playing = true; ended = false;
    t = 0; slow = { until: 0, rate: 1 }; fadeAt = -99;
    charge.a = charge.b = null;
    resetEvents(-1);
    updatePauseBtn();
  }
  function onEnd() {
    if (ended) return;
    ended = true; playing = false;
    const s = T.stats();
    $('stTime').textContent = fmt(T.DURATION);
    $('stHits').textContent = ar(s.hits);
    $('stEnergy').textContent = ar(s.energy);
    $('stFrames').textContent = ar(s.frames);
    el.end.hidden = false;
    updatePauseBtn();
  }
  function toggle() {
    if (ended) { start(false); el.end.hidden = true; return; }
    playing = !playing;
    if (playing) AUD.init();
    el.pause.hidden = playing ? true : el.pause.hidden;
    updatePauseBtn();
  }
  function updatePauseBtn() {
    const lbl = playing ? '⏸ إيقاف مؤقت' : '▶ متابعة';
    $('btn_toggle').textContent = lbl;
    $('btn_pause').textContent = lbl;
    el.pauseInfo.textContent = 'العرض متوقف عند ' + fmt(t);
  }
  function seekTo(v) {
    t = clamp(v, 0, T.DURATION);
    resetEvents(t);
    slow = { until: 0, rate: 1 };
    charge.a = charge.b = null;
    fadeAt = -99;
    el.end.hidden = true;
    ended = false;
    el.sub.hidden = true; el.title.hidden = true; el.impact.hidden = true;
    draw(0);
  }
  function setMute(v) {
    muted = v;
    if (v) AUD.silence(); else { AUD.init(); AUD.unsilence(); }
    const lbl = v ? '🔊 تشغيل الصوت' : '🔇 كتم';
    $('btn_mute').textContent = v ? '🔇 الصوت مكتوم' : '🔇 كتم';
    $('btn_mute2').textContent = lbl;
    $('btn_sound').textContent = v ? '🔇 الصوت مكتوم' : '🔊 الصوت مفعّل';
    $('btn_sound').setAttribute('aria-pressed', String(!v));
  }
  function go(which) {
    mode = which;
    el.start.hidden = which !== 'start';
    el.player.hidden = which !== 'player';
    if (which === 'player') { R.resize(); window.scrollTo(0, 0); }
  }
  function fullscreen() {
    const d = document;
    if (!d.fullscreenElement) {
      (el.shell.requestFullscreen || el.shell.webkitRequestFullscreen || function () {}).call(el.shell);
    } else {
      (d.exitFullscreen || d.webkitExitFullscreen || function () {}).call(d);
    }
  }

  /* ---------------- الشاشة الأولى ---------------- */
  function begin(paused) {
    AUD.init();
    go('player');
    R.resize();
    start(false);
    if (paused) { playing = false; el.pause.hidden = false; }
    updatePauseBtn();
  }

  $('btn_start').addEventListener('click', () => begin(false));
  $('btn_sound').addEventListener('click', () => setMute(!muted));
  $('btn_pause').addEventListener('click', () => begin(true));
  $('btn_replay').addEventListener('click', () => {
    begin(false);
  });
  $('btn_full').addEventListener('click', () => { begin(true); fullscreen(); });
  $('btn_mute').addEventListener('click', () => setMute(!muted));

  /* ---------------- المشغّل ---------------- */
  $('btn_toggle').addEventListener('click', toggle);
  $('btn_replay3').addEventListener('click', () => { el.end.hidden = true; start(false); });
  $('btn_full2').addEventListener('click', fullscreen);
  $('btn_mute2').addEventListener('click', () => setMute(!muted));
  $('btn_resume').addEventListener('click', () => { el.pause.hidden = true; playing = true; AUD.init(); updatePauseBtn(); });
  $('btn_restart').addEventListener('click', () => { el.pause.hidden = true; el.end.hidden = true; start(false); });
  $('btn_home1').addEventListener('click', () => { playing = false; el.pause.hidden = true; go('start'); });
  $('btn_replay2').addEventListener('click', () => { el.end.hidden = true; start(false); });
  $('btn_last').addEventListener('click', () => { el.end.hidden = true; seekTo(99.2); playing = true; updatePauseBtn(); });
  $('btn_home2').addEventListener('click', () => { playing = false; el.end.hidden = true; go('start'); });
  el.cv.addEventListener('click', toggle);

  el.seek.addEventListener('click', (e) => {
    const r = el.seek.getBoundingClientRect();
    const x = 1 - (e.clientX - r.left) / r.width; /* RTL */
    seekTo(clamp(x, 0, 1) * T.DURATION);
  });
  el.seek.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { seekTo(t - 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { seekTo(t + 5); e.preventDefault(); }
  });

  window.addEventListener('keydown', (e) => {
    if (mode !== 'player') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); begin(false); } return; }
    if (e.key === ' ') { e.preventDefault(); toggle(); }
    else if (e.key === 'f' || e.key === 'F') fullscreen();
    else if (e.key === 'm' || e.key === 'M') setMute(!muted);
    else if (e.key === 'r' || e.key === 'R') { el.end.hidden = true; start(false); }
    else if (e.key === 'ArrowLeft') seekTo(t + 5);
    else if (e.key === 'ArrowRight') seekTo(t - 5);
  });

  document.addEventListener('fullscreenchange', () => setTimeout(() => R.resize(), 60));

  /* ---------------- الإقلاع ---------------- */
  R.init(el.cv);
  muted = false;
  $('btn_mute').textContent = '🔇 كتم';
  $('btn_mute2').textContent = '🔇 كتم';
  $('btn_sound').textContent = '🔊 الصوت مفعّل';
  $('btn_sound').setAttribute('aria-pressed', 'true');
  updatePauseBtn();
  draw(0);
  requestAnimationFrame(loop);
})();
