/* محرك الرسم: خلفية نيون + شخصيتان مرسومتان بالمسارات + مؤثرات */
window.VyRender = (function () {
  'use strict';
  let cv, g, W = 0, H = 0, DPR = 1, groundY = 0;
  const P = [], RINGS = [], BEAMS = [], SLASH = [], AMB = [];
  let flash = 0, shakeAmp = 0;
  const COL = { a: '#00E1FF', b: '#FF2E88' };
  const hands = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };

  function init(el) {
    cv = el; g = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 46; i++) {
      AMB.push({ x: Math.random(), y: Math.random(), s: 0.4 + Math.random() * 1.4, v: 0.01 + Math.random() * 0.05, r: 0.4 + Math.random() * 1.6, c: Math.random() > 0.5 ? COL.a : COL.b });
    }
  }
  function resize() {
    if (!cv) return;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth || 960; H = cv.clientHeight || 540;
    cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    groundY = H * 0.86;
  }

  /* ---------- الخلفية ---------- */
  function sky(t) {
    const rise = Math.min(1, t / 120);
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#050918');
    grd.addColorStop(0.52, '#0B1230');
    grd.addColorStop(0.82, '#2A1140');
    grd.addColorStop(1, '#4A1233');
    g.fillStyle = grd; g.fillRect(-W, -H, W * 3, H * 3);

    const sy = groundY - H * (0.06 + 0.10 * rise);
    const sunR = Math.min(W, H) * 0.16;
    const sg = g.createRadialGradient(W * 0.5, sy, sunR * 0.1, W * 0.5, sy, sunR * 2.1);
    sg.addColorStop(0, 'rgba(255,190,120,0.55)');
    sg.addColorStop(0.35, 'rgba(255,90,120,0.22)');
    sg.addColorStop(1, 'rgba(255,46,136,0)');
    g.fillStyle = sg; g.beginPath(); g.arc(W * 0.5, sy, sunR * 2.1, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,205,150,' + (0.45 + rise * 0.25) + ')';
    g.beginPath(); g.arc(W * 0.5, sy, sunR * (0.34 + rise * 0.16), 0, Math.PI * 2); g.fill();

    g.strokeStyle = 'rgba(0,225,255,0.13)'; g.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) {
      g.beginPath(); g.arc(W * 0.5, sy, sunR * (0.75 + i * 0.4), Math.PI * 1.06, Math.PI * 1.94); g.stroke();
    }
  }
  function skyline(t) {
    g.save();
    for (let layer = 0; layer < 2; layer++) {
      const base = groundY - layer * H * 0.012;
      const hMax = H * (layer ? 0.15 : 0.26);
      g.fillStyle = layer ? 'rgba(6,10,26,0.92)' : 'rgba(10,14,36,0.85)';
      let x = -W * 0.2;
      let seed = layer ? 977 : 331;
      while (x < W * 1.2) {
        seed = (seed * 16807) % 2147483647;
        const bw = W * (0.03 + (seed % 100) / 100 * 0.05);
        seed = (seed * 16807) % 2147483647;
        const bh = hMax * (0.35 + (seed % 100) / 100 * 0.65);
        g.fillRect(x, base - bh, bw, bh);
        if (layer === 0) {
          g.fillStyle = 'rgba(0,225,255,0.30)';
          for (let wy = base - bh + 8; wy < base - 6; wy += 12) {
            for (let wx = x + 6; wx < x + bw - 6; wx += 11) {
              const s = Math.sin(wx * 0.31 + wy * 0.17 + t * 0.35);
              if (s > 0.35) g.fillRect(wx, wy, 3, 4);
            }
          }
          g.fillStyle = 'rgba(10,14,36,0.85)';
        }
        x += bw + W * 0.006;
      }
    }
    g.restore();
  }
  function floor(t) {
    const fg = g.createLinearGradient(0, groundY - 4, 0, H);
    fg.addColorStop(0, 'rgba(0,225,255,0.18)');
    fg.addColorStop(0.4, 'rgba(6,10,24,0.96)');
    fg.addColorStop(1, 'rgba(3,5,12,1)');
    g.fillStyle = fg; g.fillRect(-W, groundY, W * 3, H * 2);
    g.strokeStyle = 'rgba(0,225,255,0.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-W, groundY); g.lineTo(W * 2, groundY); g.stroke();
    g.lineWidth = 1;
    g.strokeStyle = 'rgba(0,225,255,0.13)';
    for (let i = -8; i <= 24; i++) {
      const x0 = W * 0.5 + i * W * 0.09;
      g.beginPath(); g.moveTo(x0, groundY); g.lineTo(W * 0.5 + (x0 - W * 0.5) * 2.6, H * 1.6); g.stroke();
    }
    for (let i = 1; i < 9; i++) {
      const y = groundY + Math.pow(i / 9, 2.1) * (H - groundY) * 1.3;
      g.beginPath(); g.moveTo(-W, y); g.lineTo(W * 2, y); g.stroke();
    }
  }
  function ambient(dt, t) {
    for (const p of AMB) {
      p.y += p.v * dt * 0.5;
      p.x += Math.sin(t * 0.6 + p.s * 7) * dt * 0.004;
      if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
      g.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + p.s * 3);
      g.fillStyle = p.c;
      g.beginPath(); g.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }

  /* ---------- الشخصيات ---------- */
  const POSES = {
    idle:  { lean: 0.03, la: [0.12, 0.02], lb: [-0.12, 0.06], aa: [0.32, 0.62], ab: [-0.28, 0.5], bob: 0.012 },
    walk:  { lean: 0.06, la: [0.30, -0.06], lb: [-0.26, 0.10], aa: [0.5, 0.7], ab: [-0.45, 0.55], bob: 0.018 },
    stance:{ lean: 0.12, la: [0.34, -0.16], lb: [-0.30, 0.22], aa: [0.85, 0.5], ab: [-0.42, 1.0], bob: 0.014 },
    guard: { lean: -0.02, la: [0.26, -0.10], lb: [-0.26, 0.14], aa: [1.45, 0.75], ab: [1.30, 0.95], bob: 0.008 },
    dash:  { lean: 0.42, la: [0.55, -0.25], lb: [-0.50, 0.30], aa: [-0.75, 0.35], ab: [-0.95, 0.45], bob: 0.004 },
    strike:{ lean: 0.30, la: [0.48, -0.18], lb: [-0.48, 0.28], aa: [1.62, 0.06], ab: [-0.85, 0.35], bob: 0 },
    hurt:  { lean: -0.34, la: [0.20, 0.10], lb: [-0.34, 0.28], aa: [1.10, 1.35], ab: [0.85, 1.20], bob: 0.02 },
    air:   { lean: 0.10, la: [0.62, 0.55], lb: [-0.30, 0.75], aa: [1.0, 0.6], ab: [-0.5, 0.8], bob: 0 },
    charge:{ lean: 0.06, la: [0.34, -0.12], lb: [-0.34, 0.18], aa: [0.55, 0.25], ab: [-0.30, 0.9], bob: 0.02 },
    cast:  { lean: 0.14, la: [0.34, -0.14], lb: [-0.34, 0.20], aa: [1.35, 0.10], ab: [-0.35, 0.9], bob: 0.006 }
  };
  function limb(ox, oy, a1, l1, a2, l2) {
    const x1 = ox + Math.sin(a1) * l1, y1 = oy - Math.cos(a1) * l1;
    return [x1, y1, x1 + Math.sin(a2) * l2, y1 - Math.cos(a2) * l2];
  }
  function drawFighter(px, py, poseName, dir, ch, color, t, aura) {
    const ps = POSES[poseName] || POSES.idle;
    const sw = Math.max(2, ch * 0.055);
    g.save();
    g.translate(px, py);
    g.scale(dir, 1);
    if (poseName === 'down') {
      g.rotate(-0.42 * dir);
      g.translate(0, ch * 0.06);
    }
    const bob = Math.sin(t * 2.4) * ch * (ps.bob || 0);
    const hipY = ch * 0.47 + bob;
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.shadowColor = color; g.shadowBlur = ch * 0.22;
    g.strokeStyle = color; g.lineWidth = sw;

    const lean = ps.lean + (poseName === 'down' ? -0.5 : 0);
    const TL = ch * 0.40;
    const nx = Math.sin(lean) * TL, ny = hipY + Math.cos(lean) * TL;
    const sx = Math.sin(lean) * TL * 0.86, sy = hipY + Math.cos(lean) * TL * 0.86;

    // الساقان
    let L = limb(0, hipY, ps.lb[0], ch * 0.26, ps.lb[1], ch * 0.26);
    g.globalAlpha = 0.75;
    g.beginPath(); g.moveTo(0, hipY); g.lineTo(L[0], L[1]); g.lineTo(L[2], L[3]); g.stroke();
    g.globalAlpha = 1;
    L = limb(0, hipY, ps.la[0], ch * 0.26, ps.la[1], ch * 0.26);
    g.lineWidth = sw * 1.12;
    g.beginPath(); g.moveTo(0, hipY); g.lineTo(L[0], L[1]); g.lineTo(L[2], L[3]); g.stroke();

    // الجذع
    g.lineWidth = sw * 1.5;
    g.beginPath(); g.moveTo(0, hipY); g.quadraticCurveTo(nx * 0.5, hipY + (ny - hipY) * 0.55, nx, ny); g.stroke();

    // الرأس
    const hx = nx + Math.sin(lean) * ch * 0.13, hy = ny + Math.cos(lean) * ch * 0.13;
    g.fillStyle = 'rgba(6,10,24,0.95)';
    g.beginPath(); g.arc(hx, hy, ch * 0.105, 0, Math.PI * 2); g.fill(); g.stroke();
    // عين
    g.shadowBlur = ch * 0.12; g.fillStyle = '#fff';
    g.beginPath(); g.arc(hx + ch * 0.045, hy - ch * 0.01, ch * 0.017, 0, Math.PI * 2); g.fill();

    // الذراعان
    g.lineWidth = sw * 0.92;
    let A = limb(sx, sy, ps.ab[0], ch * 0.20, ps.ab[1], ch * 0.19);
    g.globalAlpha = 0.72;
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(A[0], A[1]); g.lineTo(A[2], A[3]); g.stroke();
    g.globalAlpha = 1;
    A = limb(sx, sy, ps.aa[0], ch * 0.20, ps.aa[1], ch * 0.19);
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(A[0], A[1]); g.lineTo(A[2], A[3]); g.stroke();
    // قبضة
    g.shadowBlur = ch * 0.3; g.fillStyle = color;
    g.beginPath(); g.arc(A[2], A[3], ch * 0.045, 0, Math.PI * 2); g.fill();

    // هالة الشحن
    if (aura > 0.02) {
      g.shadowBlur = ch * 0.6;
      g.strokeStyle = color; g.globalAlpha = 0.18 + 0.35 * aura * Math.abs(Math.sin(t * 9));
      g.lineWidth = sw * 1.8;
      g.beginPath(); g.arc(0, ch * 0.45, ch * (0.42 + 0.1 * Math.sin(t * 5)), 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 1;
    }
    g.restore();
    return { x: px + dir * A[2], y: py - A[3] };
  }

  /* ---------- المؤثرات ---------- */
  function spark(x, y, n, c1, c2) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 420;
      P.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90, life: 0, max: 0.28 + Math.random() * 0.55, r: 1 + Math.random() * 2.6, c: Math.random() > 0.5 ? c1 : c2 });
    }
  }
  function ring(x, y, c, max, w) { RINGS.push({ x: x, y: y, r: 4, max: max, c: c, w: w || 3, life: 0, ttl: 0.55 }); }
  function update(dt) {
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.life += dt;
      if (p.life > p.max) { P.splice(i, 1); continue; }
      p.vy += 620 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (let i = RINGS.length - 1; i >= 0; i--) {
      const r = RINGS[i]; r.life += dt; r.r += (r.max - r.r) * Math.min(1, dt * 7);
      if (r.life > r.ttl) RINGS.splice(i, 1);
    }
    for (let i = BEAMS.length - 1; i >= 0; i--) { BEAMS[i].life += dt; if (BEAMS[i].life > BEAMS[i].dur) BEAMS.splice(i, 1); }
    for (let i = SLASH.length - 1; i >= 0; i--) { SLASH[i].life += dt; if (SLASH[i].life > SLASH[i].dur) SLASH.splice(i, 1); }
    flash = Math.max(0, flash - dt * 2.6);
    shakeAmp = Math.max(0, shakeAmp - dt * 22);
  }
  function drawEffects(t) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const b of BEAMS) {
      const k = 1 - b.life / b.dur;
      const wMax = (b.big ? 34 : 16) * (W / 960);
      const x0 = b.x0, y0 = b.y0, x1 = b.x1, y1 = b.y1;
      const grd = g.createLinearGradient(x0, y0, x1, y1);
      grd.addColorStop(0, 'rgba(255,255,255,0.95)');
      grd.addColorStop(0.4, b.c + 'cc');
      grd.addColorStop(1, 'rgba(255,255,255,0.15)');
      g.strokeStyle = grd; g.lineWidth = wMax * (0.55 + 0.45 * k);
      g.globalAlpha = 0.55 + 0.45 * k;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = wMax * 0.22 * k;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.globalAlpha = 1;
    }
    for (const s of SLASH) {
      const k = s.life / s.dur;
      g.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')';
      g.lineWidth = 10 * (1 - k) + 1;
      g.beginPath();
      g.arc(s.x, s.y, s.r * (0.5 + k), s.a0, s.a0 + s.span * (0.3 + k));
      g.stroke();
    }
    for (const r of RINGS) {
      const k = 1 - r.life / r.ttl;
      g.strokeStyle = r.c; g.globalAlpha = k * 0.9; g.lineWidth = r.w * k;
      g.beginPath(); g.arc(r.x, r.y, r.r, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 1;
    }
    for (const p of P) {
      const k = 1 - p.life / p.max;
      g.globalAlpha = k; g.fillStyle = p.c;
      g.beginPath(); g.arc(p.x, p.y, p.r * k, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  function render(st, dt) {
    resize2();
    g.clearRect(0, 0, W, H);
    g.save();
    const sh = shakeAmp > 0.2 ? shakeAmp : 0;
    g.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
    sky(st.t); skyline(st.t);
    const cam = st.cam || { zoom: 1, fx: 0.5, fy: 0.55 };
    const cx = cam.fx * W, cy = groundY - cam.fy * H * 0.8;
    g.save();
    g.translate(W / 2, H * 0.56);
    g.scale(cam.zoom, cam.zoom);
    g.translate(-cx, -cy);

    floor(st.t);
    ambient(dt, st.t);

    const ch = H * 0.42;
    const ax = st.a.x * W, ay = groundY - st.a.y * H * 0.8;
    const bx = st.b.x * W, by = groundY - st.b.y * H * 0.8;
    hands.a = drawFighter(ax, ay, st.a.pose, -1, ch, COL.a, st.t, st.aura ? st.aura.a : 0);
    hands.b = drawFighter(bx, by, st.b.pose, 1, ch, COL.b, st.t, st.aura ? st.aura.b : 0);
    drawEffects(st.t);
    g.restore();

    // وميض
    if (flash > 0.01) {
      g.fillStyle = 'rgba(255,255,255,' + Math.min(0.92, flash) + ')';
      g.fillRect(0, 0, W, H);
    }
    // إضاءة جانبية
    const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.62)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    if (st.fade > 0.001) { g.fillStyle = 'rgba(2,3,8,' + st.fade + ')'; g.fillRect(0, 0, W, H); }
    g.restore();
    update(dt);
  }
  function resize2() {
    if (!cv) return;
    if (cv.clientWidth && (Math.abs(cv.clientWidth - W) > 1 || Math.abs(cv.clientHeight - H) > 1)) resize();
  }

  /* ---------- واجهة للأحداث ---------- */
  function worldFrom(nx, ny) { return { x: nx * W, y: groundY - ny * H * 0.8 }; }

  const api = {
    init: init,
    render: render,
    hands: hands,
    worldFrom: worldFrom,
    hit: function (nx, ny, p) {
      const w = worldFrom(nx, ny);
      spark(w.x, w.y, Math.round(14 + 10 * p), COL.a, '#FFFFFF');
      ring(w.x, w.y, p > 1.2 ? '#FFFFFF' : COL.a, (60 + 70 * p) * (W / 960), 2 + p);
      if (p > 0.9) { flash = Math.max(flash, 0.25 * p); shakeAmp = Math.max(shakeAmp, 5 * p); }
    },
    boom: function (nx, ny, p) {
      const w = worldFrom(nx, ny);
      spark(w.x, w.y, Math.round(26 * p), '#FFD08A', COL.b);
      ring(w.x, w.y, '#FFFFFF', 140 * p * (W / 960), 4 * p);
      ring(w.x, w.y, COL.b, 90 * p * (W / 960), 3 * p);
      flash = Math.max(flash, 0.4 * p);
    },
    slash: function (c) {
      SLASH.push({ x: W * 0.5, y: groundY - H * 0.28, r: W * 0.22, a0: -1.1, span: 2.2, life: 0, dur: 0.5, c: c });
    },
    beam: function (opts) {
      const from = opts.who === 1 ? hands.a : hands.b;
      const to = opts.who === 1 ? hands.b : hands.a;
      const c = opts.who === 1 ? COL.a : COL.b;
      BEAMS.push({ x0: from.x || W * (opts.who === 1 ? 0.55 : 0.45), y0: from.y || groundY - H * 0.3, x1: to.x, y1: to.y, life: 0, dur: opts.dur || 1, big: !!opts.big, c: c });
      flash = Math.max(flash, opts.big ? 0.45 : 0.22);
    },
    shake: function (amp) { shakeAmp = Math.max(shakeAmp, amp); },
    flash: function (p) { flash = Math.max(flash, Math.min(0.92, p || 0.4)); },
    ring: function (nx, ny, c, big) {
      const w = worldFrom(nx, ny), k = W / 960;
      ring(w.x, w.y, c, (big ? 120 : 70) * k, big ? 4 : 2.5);
      spark(w.x, w.y, big ? 18 : 9, c);
    },
    resize: function () { resize(); }
  };
  return api;
})();
