/* ============================================================
   Thin Film Lab: ALD vs PVD — simulations
   Three interactive labs:
     Lab 1: self-limiting half-reactions (pulse/purge cycle machine)
     Lab 2: trench conformality vs. line-of-sight shadowing
     Lab 3: nucleation delay + the ALD temperature window
   All models are pedagogical cartoons; see the simplification
   ledger in the page for where each one cheats.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- tiny utilities ---------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d) => v.toFixed(d);
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLORS = {
    bg: '#0a0e14',
    grid: 'rgba(110, 118, 129, 0.22)',
    axis: '#6e7681',
    text: '#8b949e',
    textBright: '#f0f6fc',
    accent: '#58a6ff',
    ald: '#3fb950',
    pvd: '#f0883e',
    precursorA: '#bc8cff',
    precursorB: '#56d4dd',
    film: '#7aa2f7',
    site: '#d29922',
    warn: '#d29922',
    good: '#3fb950',
    danger: '#f85149'
  };

  function fitCanvas(canvas, logicalW, logicalH) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function paintSlider(input) {
    const min = +input.min || 0;
    const max = +input.max || 100;
    const v = +input.value;
    input.style.setProperty('--fill', ((v - min) / (max - min)) * 100 + '%');
  }

  // deterministic RNG so slider scrubbing is stable
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rr(ctx, x, y, w, h, r) {
    const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  /* ---------------- predict cards ---------------- */
  function initPredictCards() {
    $$('.predict-card').forEach(card => {
      const buttons = $$('.predict-options button', card);
      const reveal = $('.predict-reveal', card);
      const verdict = $('.verdict', reveal);
      const correct = card.dataset.correct;
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (card.dataset.answered === '1') return;
          card.dataset.answered = '1';
          const ok = btn.dataset.choice === correct;
          buttons.forEach(b => {
            b.disabled = true;
            if (b.dataset.choice === correct) b.classList.add('is-correct');
            else if (b === btn) b.classList.add('is-wrong');
          });
          btn.classList.add('is-picked');
          verdict.textContent = ok ? '✓ Correct — nice call.' : '✗ Not quite — here is what actually happens.';
          verdict.className = 'verdict ' + (ok ? 'good' : 'bad');
          reveal.hidden = false;
        });
      });
    });

    $$('.jump-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.jump);
        if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });
  }

  /* ============================================================
     LAB 1 — self-limiting half-reactions
     ============================================================ */
  const GPC_MAX = 0.10; // nm per full row, nominal
  const N_COLS = 18;

  const l1 = {
    ctx: null,
    chartCtx: null,
    running: false,
    stepMode: false,
    instant: reducedMotion,
    phase: 'idle',
    phaseT: 0,
    dose: 100,
    temp: 225,
    heights: new Array(N_COLS).fill(0),   // completed rows per column
    boundA: new Array(N_COLS).fill(false),
    targetA: new Set(),                   // columns A should bind this pulse
    planB: new Set(),                     // columns that will convert this pulse
    molecules: [],
    spawnQueueA: [], // x-hints: one per target column, then surplus (null = random)
    spawnQueueB: [],
    spawnRateA: 0,
    spawnRateB: 0,
    spawnAcc: 0,
    flashes: new Array(N_COLS).fill(-10),
    cycle: 0,
    wasted: 0,
    grownThisCycle: 0,
    decompThisCycle: 0,
    lastGpc: null,
    runPoints: []
  };

  const PHASES = ['pulseA', 'purgeA', 'pulseB', 'purgeB'];
  const PHASE_LEN = { pulseA: 2.2, purgeA: 1.3, pulseB: 2.2, purgeB: 1.3 };
  const PHASE_LEN_INSTANT = { pulseA: 0.4, purgeA: 0.25, pulseB: 0.4, purgeB: 0.25 };
  const PHASE_LABEL = {
    idle: 'Ready',
    pulseA: 'Pulse A — self-limiting adsorption',
    purgeA: 'Purge — sweep out leftovers',
    pulseB: 'Pulse B — surface reaction',
    purgeB: 'Purge — reset for next cycle'
  };

  function l1_pConv(T) { // fraction of A-sites that convert during a B pulse
    if (T <= 150) return lerp(0.25, 1, clamp((T - 25) / 125, 0, 1));
    return 1;
  }
  function l1_decomp(T, dose) { // non-self-limiting extra growth (nm) at high T
    if (T <= 300) return 0;
    return GPC_MAX * 0.55 * ((T - 300) / 150) * (dose / 100);
  }
  function l1_modelGpc(dose, T) {
    const cov = 1 - Math.exp(-3 * dose / 100);
    const desorb = T > 300 ? 1 - 0.5 * ((T - 300) / 150) : 1;
    return GPC_MAX * cov * l1_pConv(T) * desorb + l1_decomp(T, dose);
  }

  function l1_siteY(j) {
    return 316 - l1.heights[j] * 6.2;
  }
  function l1_colX(j) {
    return 54 + 42.9 * (j + 0.5);
  }

  function l1_reset() {
    l1.heights = new Array(N_COLS).fill(0);
    l1.boundA = new Array(N_COLS).fill(false);
    l1.targetA = new Set();
    l1.planB = new Set();
    l1.molecules = [];
    l1.flashes = new Array(N_COLS).fill(-10);
    l1.cycle = 0;
    l1.wasted = 0;
    l1.grownThisCycle = 0;
    l1.decompThisCycle = 0;
    l1.lastGpc = null;
    l1.runPoints = [];
    l1.phase = 'idle';
    l1.phaseT = 0;
    l1_updateReadouts();
    l1_draw();
    l1_drawChart();
  }

  function l1_beginPhase(name) {
    l1.phase = name;
    l1.phaseT = 0;
    if (name === 'pulseA') {
      l1.targetA = new Set();
      const vacant = [];
      for (let j = 0; j < N_COLS; j++) if (!l1.boundA[j]) vacant.push(j);
      const want = Math.min(vacant.length, Math.round(N_COLS * (1 - Math.exp(-3 * l1.dose / 100))));
      // deterministic-ish sample so scrubbing dose feels stable
      const rng = mulberry32(1000 + l1.cycle * 31 + l1.dose);
      for (let i = vacant.length - 1; i > 0; i--) {
        const k = Math.floor(rng() * (i + 1));
        [vacant[i], vacant[k]] = [vacant[k], vacant[i]];
      }
      for (let i = 0; i < want; i++) l1.targetA.add(vacant[i]);
      // Spawn queue: one molecule aimed at each target column (so the sampled
      // coverage is realized), plus surplus at random x — surplus is the
      // "wasted precursor" visual and grows with dose.
      l1.spawnQueueA = [];
      for (const j of l1.targetA) l1.spawnQueueA.push(l1_colX(j));
      const targets = l1.targetA.size;
      for (let i = 0; i < Math.ceil(targets * 0.4); i++) {
        l1.spawnQueueA.push(l1_colX(Array.from(l1.targetA)[i % Math.max(1, targets)]));
      }
      const totalA = Math.round(Math.max(targets * 1.5, N_COLS * (l1.dose / 100) * 2.2));
      while (l1.spawnQueueA.length < totalA) l1.spawnQueueA.push(null);
      l1.spawnRateA = l1.spawnQueueA.length / PHASE_LEN.pulseA;
      l1.spawnAcc = 0;
      if (l1.instant) l1_applyPulseAInstant();
    } else if (name === 'pulseB') {
      l1.planB = new Set();
      let bound = 0;
      for (let j = 0; j < N_COLS; j++) {
        if (l1.boundA[j]) bound++;
        if (l1.boundA[j] && Math.random() < l1_pConv(l1.temp)) l1.planB.add(j);
      }
      // Aimed B molecules guarantee every planned conversion; surplus gives
      // the visible bounces on stalled sites (cold T) and general flooding.
      l1.spawnQueueB = [];
      for (const j of l1.planB) l1.spawnQueueB.push(l1_colX(j));
      for (let j = 0; j < N_COLS; j++) {
        if (l1.boundA[j] && !l1.planB.has(j)) l1.spawnQueueB.push(l1_colX(j)); // guaranteed bounce
      }
      while (l1.spawnQueueB.length < Math.round(bound * 2.2 + l1.planB.size * 0.6)) l1.spawnQueueB.push(null);
      l1.spawnRateB = l1.spawnQueueB.length / PHASE_LEN.pulseB;
      l1.spawnAcc = 0;
      l1.grownThisCycle = 0;
      l1.decompThisCycle = 0;
      if (l1.instant) l1_applyPulseBInstant();
    }
    // note: planB stays live through purgeB so late-arriving B can still
    // convert; it is cleared when the cycle completes
  }

  function l1_applyPulseAInstant() {
    const bound = l1.targetA.size;
    l1.targetA.forEach(j => { l1.boundA[j] = true; });
    l1.wasted += Math.max(0, l1.spawnQueueA.length - bound);
    l1.spawnQueueA = [];
    l1.targetA.clear();
    l1_updateReadouts();
    l1_draw();
    l1_drawChart();
  }

  function l1_applyPulseBInstant() {
    l1.planB.forEach(j => {
      l1.boundA[j] = false;
      l1.heights[j] += 1;
      l1.flashes[j] = performance.now() / 1000;
      l1.grownThisCycle++;
    });
    // high-T parasitic decomposition growth on bare sites
    if (l1.temp > 300) {
      const p = 0.5 * ((l1.temp - 300) / 150);
      for (let j = 0; j < N_COLS; j++) {
        if (!l1.boundA[j] && Math.random() < p) {
          l1.heights[j] += 1;
          l1.decompThisCycle++;
        }
      }
    }
    l1.planB.clear();
  }

  function l1_spawnMolecule(type, xHint) {
    const x0 = xHint == null
      ? 54 + Math.random() * 772
      : clamp(xHint + (Math.random() - 0.5) * 16, 58, 822);
    l1.molecules.push({
      type,
      x: x0,
      y: 2 + Math.random() * 16,
      vx: (Math.random() - 0.5) * 26,
      vy: 250 + Math.random() * 150,
      state: 'free', // free | bound | bounced
      col: -1,
      life: 0
    });
  }

  function l1_update(dt) {
    // keep the cycle machine cycling while "Run" is engaged
    if (l1.phase === 'idle' && l1.running && !l1.stepMode) l1_beginPhase('pulseA');

    // phase timing
    if (l1.phase !== 'idle') {
      const dur = (l1.instant ? PHASE_LEN_INSTANT : PHASE_LEN)[l1.phase];
      l1.phaseT += dt;
      if (!l1.instant && l1.phase === 'pulseA' && l1.spawnQueueA.length > 0) {
        l1.spawnAcc += l1.spawnRateA * dt;
        while (l1.spawnAcc >= 1 && l1.spawnQueueA.length > 0) {
          l1_spawnMolecule('A', l1.spawnQueueA.shift());
          l1.spawnAcc -= 1;
        }
      }
      if (!l1.instant && l1.phase === 'pulseB' && l1.spawnQueueB.length > 0) {
        l1.spawnAcc += l1.spawnRateB * dt;
        while (l1.spawnAcc >= 1 && l1.spawnQueueB.length > 0) {
          l1_spawnMolecule('B', l1.spawnQueueB.shift());
          l1.spawnAcc -= 1;
        }
      }
      if (l1.phaseT >= dur) {
        const idx = PHASES.indexOf(l1.phase);
        if (idx === PHASES.length - 1) {
          // cycle complete
          l1.planB.clear();
          const grown = l1.grownThisCycle + l1.decompThisCycle;
          l1.lastGpc = (grown / N_COLS) * GPC_MAX;
          l1.runPoints.push({ dose: l1.dose, gpc: l1.lastGpc });
          l1.cycle++;
          l1.phase = 'idle';
          l1.phaseT = 0;
          if (l1.stepMode) {
            l1.stepMode = false;
            l1.running = false;
            $('#l1-play').setAttribute('aria-pressed', 'false');
            $('#l1-play').classList.remove('is-running');
            $('#l1-play-label').textContent = 'Run';
          }
          l1_updateReadouts();
          l1_drawChart();
        } else {
          l1_beginPhase(PHASES[idx + 1]);
        }
      }
    }

    // molecules
    const now = performance.now() / 1000;
    for (const m of l1.molecules) {
      if (m.state === 'bound') {
        // high-T: bound A can pop off during purges
        if (m.type === 'A' && l1.temp > 300 && (l1.phase === 'purgeA' || l1.phase === 'pulseB')) {
          const p = 0.55 * ((l1.temp - 300) / 150) * dt;
          if (Math.random() < p) {
            l1.boundA[m.col] = false;
            l1.targetA.delete(m.col);
            m.state = 'bounced';
            m.vy = -60;
            m.vx = (Math.random() - 0.5) * 60;
          }
        }
        continue;
      }
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      if (m.state === 'bounced') {
        m.vy -= 40 * dt;
        continue;
      }

      // binding test — the surface is continuous: every downward molecule
      // meets the column it is over (index partitions the full width)
      const j = Math.floor((m.x - 54) / 42.9);
      if (j >= 0 && j < N_COLS && m.vy > 0) {
        const siteY = l1_siteY(j);
        if (m.y >= siteY - 14 && m.y <= siteY + 14) {
          if (m.type === 'A') {
            if (!l1.boundA[j] && l1.targetA.has(j)) {
              l1.boundA[j] = true;
              l1.targetA.delete(j);
              m.state = 'bound';
              m.col = j;
              m.x = l1_colX(j);
              m.y = siteY - 9;
            } else {
              m.state = 'bounced';
              m.vy = -m.vy * 0.55;
              m.vx += (Math.random() - 0.5) * 70;
              l1.wasted++;
            }
          } else { // B
            if (l1.boundA[j] && l1.planB.has(j)) {
              l1.planB.delete(j);
              l1.boundA[j] = false;
              l1.heights[j] += 1;
              l1.grownThisCycle++;
              l1.flashes[j] = now;
              m.state = 'bounced';
              m.vy = -m.vy * 0.5;
              m.vx += (Math.random() - 0.5) * 70;
            } else if (!l1.boundA[j] && l1.temp > 300 && Math.random() < 0.5 * ((l1.temp - 300) / 150)) {
              // parasitic decomposition: sticks without self-limitation
              l1.heights[j] += 1;
              l1.decompThisCycle++;
              l1.flashes[j] = now;
              m.state = 'bounced';
              m.vy = -m.vy * 0.5;
            } else {
              m.state = 'bounced';
              m.vy = -m.vy * 0.55;
              m.vx += (Math.random() - 0.5) * 70;
            }
          }
        }
      }
    }

    // remove dead molecules (and A molecules whose site has since reacted)
    l1.molecules = l1.molecules.filter(m => {
      if (m.state === 'bound') return l1.boundA[m.col] === true;
      return m.y > -30 && m.y < 430 && m.x > -40 && m.x < 920 && m.life < 6;
    });

    // purge sweeps free molecules away
    if (l1.phase === 'purgeA' || l1.phase === 'purgeB') {
      for (const m of l1.molecules) {
        if (m.state !== 'bound') {
          m.vx += 260 * dt;
          m.vy *= 0.98;
        }
      }
    }

    if (l1.phase !== 'idle' && !l1.instant) {
      l1_updateReadouts();
      l1_draw();
    }
  }

  function l1_draw() {
    const ctx = l1.ctx;
    const W = 880, H = 380;
    ctx.clearRect(0, 0, W, H);

    // background gas region
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0c1420');
    g.addColorStop(0.75, '#101724');
    g.addColorStop(1, '#0d1320');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // faint flow chevrons during purges
    if (l1.phase === 'purgeA' || l1.phase === 'purgeB') {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 2;
      const t = performance.now() / 1000;
      for (let row = 0; row < 3; row++) {
        const y = 50 + row * 60;
        for (let k = 0; k < 7; k++) {
          const x = ((t * 160 + k * 130 + row * 40) % (W + 80)) - 40;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 14, y + 6);
          ctx.lineTo(x, y + 12);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // substrate
    const baseY = 316;
    const sg = ctx.createLinearGradient(0, baseY, 0, H);
    sg.addColorStop(0, '#2b3442');
    sg.addColorStop(1, '#1a212c');
    ctx.fillStyle = sg;
    ctx.fillRect(0, baseY, W, H - baseY);
    ctx.strokeStyle = 'rgba(139, 148, 158, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(W, baseY);
    ctx.stroke();

    // film rows
    for (let j = 0; j < N_COLS; j++) {
      for (let r = 0; r < l1.heights[j]; r++) {
        const y = baseY - (r + 1) * 6.2;
        const shade = 0.35 + 0.65 * Math.min(1, (r + 1) / 12);
        ctx.fillStyle = `rgba(122, 162, 247, ${0.55 + 0.35 * shade})`;
        rr(ctx, l1_colX(j) - 17, y + 0.6, 34, 5, 2);
        ctx.fill();
      }
    }

    // sites / bound A
    const now = performance.now() / 1000;
    for (let j = 0; j < N_COLS; j++) {
      const x = l1_colX(j);
      const y = l1_siteY(j);
      // flash
      const ft = now - l1.flashes[j];
      if (ft >= 0 && ft < 0.6) {
        const a = 1 - ft / 0.6;
        const fg = ctx.createRadialGradient(x, y - 8, 1, x, y - 8, 26);
        fg.addColorStop(0, `rgba(86, 212, 221, ${0.55 * a})`);
        fg.addColorStop(1, 'rgba(86, 212, 221, 0)');
        ctx.fillStyle = fg;
        ctx.fillRect(x - 26, y - 34, 52, 52);
      }
      if (l1.boundA[j]) {
        ctx.fillStyle = COLORS.precursorA;
        ctx.beginPath();
        ctx.arc(x, y - 8, 6.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.strokeStyle = COLORS.site;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 2);
        ctx.lineTo(x, y - 8);
        ctx.lineTo(x + 4, y - 2);
        ctx.stroke();
      }
    }

    // molecules
    for (const m of l1.molecules) {
      const col = m.type === 'A' ? COLORS.precursorA : COLORS.precursorB;
      ctx.fillStyle = col;
      ctx.globalAlpha = m.state === 'bounced' ? clamp(1 - (m.life - 1) / 3, 0.25, 1) : 1;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(m.x - 1.6, m.y - 1.8, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // phase banner
    ctx.fillStyle = 'rgba(13, 17, 23, 0.72)';
    rr(ctx, 14, 12, 360, 30, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.textBright;
    ctx.font = '600 13px ' + getComputedStyle(document.body).fontFamily;
    ctx.textBaseline = 'middle';
    ctx.fillText(PHASE_LABEL[l1.phase] + (l1.phase !== 'idle' ? '' : ' — press Run or Step'), 28, 27);

    // cycle counter right
    ctx.fillStyle = 'rgba(13, 17, 23, 0.72)';
    rr(ctx, W - 190, 12, 176, 30, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.text;
    ctx.font = '600 12px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillText(`cycle ${l1.cycle}  ·  ${(l1.cycle * GPC_MAX).toFixed(2)} nm ideal`, W - 176, 27);
  }

  function l1_drawChart() {
    const ctx = l1.chartCtx;
    const W = 520, H = 300;
    ctx.clearRect(0, 0, W, H);
    const padL = 52, padR = 16, padT = 18, padB = 42;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const xMin = 0, xMax = 250, yMin = 0, yMax = 0.20;
    const X = d => padL + (d - xMin) / (xMax - xMin) * plotW;
    const Y = v => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

    // grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = COLORS.text;
    for (let v = 0; v <= yMax; v += 0.05) {
      ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(W - padR, Y(v)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(v.toFixed(2), padL - 8, Y(v));
    }
    for (let d = 0; d <= xMax; d += 50) {
      ctx.beginPath(); ctx.moveTo(X(d), padT); ctx.lineTo(X(d), H - padB); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(d + '%', X(d), H - padB + 8);
    }

    // plateau shade (dose >= 100%)
    ctx.fillStyle = 'rgba(63, 185, 80, 0.07)';
    ctx.fillRect(X(100), padT, X(250) - X(100), plotH);
    ctx.fillStyle = 'rgba(63, 185, 80, 0.6)';
    ctx.font = '600 11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'left';
    ctx.fillText('saturated plateau', X(108), padT + 12);

    // model curve
    ctx.beginPath();
    for (let d = 0; d <= xMax; d += 2.5) {
      const y = Y(l1_modelGpc(d, l1.temp));
      if (d === 0) ctx.moveTo(X(d), y); else ctx.lineTo(X(d), y);
    }
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // user run points
    for (const p of l1.runPoints) {
      ctx.fillStyle = 'rgba(240, 246, 252, 0.75)';
      ctx.beginPath();
      ctx.arc(X(p.dose), Y(p.gpc), 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // current dose marker
    const cx = X(l1.dose);
    const cy = Y(l1_modelGpc(l1.dose, l1.temp));
    ctx.strokeStyle = COLORS.warn;
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, padT); ctx.lineTo(cx, H - padB); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.warn;
    ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2; ctx.stroke();

    // axes labels
    ctx.fillStyle = COLORS.text;
    ctx.font = '600 11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A dose (% of nominal saturation exposure)', padL + plotW / 2, H - 14);
    ctx.save();
    ctx.translate(14, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('GPC (nm / cycle)', 0, 0);
    ctx.restore();
  }

  function l1_updateReadouts() {
    const cov = l1.boundA.filter(Boolean).length / N_COLS;
    $('#l1-coverage').textContent = Math.round(cov * 100) + '%';
    $('#l1-gpc').textContent = l1.lastGpc == null ? '—' : fmt(l1.lastGpc, 3) + ' nm';
    const mean = l1.heights.reduce((a, b) => a + b, 0) / N_COLS;
    $('#l1-thickness').textContent = fmt(mean * GPC_MAX, 3) + ' nm';
    $('#l1-cycles').textContent = String(l1.cycle);
    const m = mean;
    const varc = l1.heights.reduce((a, b) => a + (b - m) * (b - m), 0) / N_COLS;
    $('#l1-roughness').textContent = fmt(Math.sqrt(varc) * GPC_MAX, 3) + ' nm';
    $('#l1-wasted').textContent = String(l1.wasted);

    // live phase caption (cached by phase so we don't re-parse HTML every frame)
    const cap = $('#l1-caption');
    const phaseText = {
      idle: 'Press <strong>Run</strong> — watch A coat the surface, the purge clear leftovers, then B convert the surface and add a layer slice.',
      pulseA: '<strong>Pulse A:</strong> A molecules find open sites and stick. Covered sites <em>reject</em> more A — watch the bounces pile up. That is self-limitation.',
      purgeA: '<strong>Purge:</strong> unbound A leaves the chamber. If it stayed, it would meet B in the gas phase — that is CVD, and it makes particles, not films.',
      pulseB: '<strong>Pulse B:</strong> B reacts only with A-terminated sites, converting them back to open sites and locking in one slice of film.',
      purgeB: '<strong>Purge:</strong> leftovers out. The surface is reset — ready for the next cycle.'
    };
    if (cap && cap.dataset.phaseKey !== l1.phase) {
      cap.dataset.phaseKey = l1.phase;
      cap.innerHTML = phaseText[l1.phase];
    }
  }

  function l1_updateWhyTexts() {
    const d = l1.dose, T = l1.temp;
    const doseWhy = $('#l1-dose-why');
    if (d < 60) {
      doseWhy.innerHTML = `Dose at ${d}% — <strong>starved</strong>: many sites never see an A, so this cycle grows less than it could. GPC ≈ ${fmt(l1_modelGpc(d, T), 3)} nm.`;
    } else if (d <= 130) {
      doseWhy.innerHTML = `Dose at ${d}% — near the <strong>saturation</strong> knee: almost every open site gets an A. GPC ≈ ${fmt(l1_modelGpc(d, T), 3)} nm.`;
    } else {
      doseWhy.innerHTML = `Dose at ${d}% — <strong>self-limited</strong>: the surface was already full, so extra precursor is wasted in the pump. GPC still ≈ ${fmt(l1_modelGpc(d, T), 3)} nm.`;
    }
    const tempWhy = $('#l1-temp-why');
    if (T < 150) {
      tempWhy.innerHTML = `At ${T} °C — <strong>too cold</strong>: B cannot fully displace A's ligands. Only ~${Math.round(l1_pConv(T) * 100)}% of A-sites convert per cycle (leftover A stays on the film).`;
    } else if (T <= 300) {
      tempWhy.innerHTML = `At ${T} °C — <strong>inside the ALD window</strong>: both half-reactions go to completion every cycle.`;
    } else {
      tempWhy.innerHTML = `At ${T} °C — <strong>too hot</strong>: A desorbs (coverage drops) and B starts <em>decomposing</em> on bare surface — growth is no longer self-limiting (watch GPC creep with dose).`;
    }
  }

  function initLab1() {
    const canvas = $('#lab1-canvas');
    l1.ctx = fitCanvas(canvas, 880, 380);
    l1.chartCtx = fitCanvas($('#lab1-chart'), 520, 300);

    const dose = $('#l1-dose');
    const temp = $('#l1-temp');

    function syncControls() {
      l1.dose = +dose.value;
      l1.temp = +temp.value;
      $('#l1-dose-val').textContent = l1.dose + '%';
      $('#l1-temp-val').textContent = l1.temp + ' °C';
      paintSlider(dose);
      paintSlider(temp);
      l1_updateWhyTexts();
      l1_updateReadouts();
      l1_drawChart();
      l1_draw();
    }
    dose.addEventListener('input', syncControls);
    temp.addEventListener('input', syncControls);

    const playBtn = $('#l1-play');
    playBtn.addEventListener('click', () => {
      l1.running = !l1.running;
      l1.stepMode = false;
      playBtn.setAttribute('aria-pressed', String(l1.running));
      playBtn.classList.toggle('is-running', l1.running);
      $('#l1-play-label').textContent = l1.running ? 'Pause' : 'Run';
      if (l1.running && l1.phase === 'idle') l1_beginPhase('pulseA');
    });

    $('#l1-step').addEventListener('click', () => {
      if (l1.phase === 'idle') l1_beginPhase('pulseA');
      l1.running = true;
      l1.stepMode = true;
      playBtn.setAttribute('aria-pressed', 'true');
      $('#l1-play-label').textContent = 'Pause';
    });

    $('#l1-reset').addEventListener('click', () => {
      l1.running = false;
      l1.stepMode = false;
      playBtn.setAttribute('aria-pressed', 'false');
      playBtn.classList.remove('is-running');
      $('#l1-play-label').textContent = 'Run';
      l1_reset();
    });

    syncControls();
    l1_reset();
  }

  /* ============================================================
     LAB 2 — trench conformality (ray-cast line-of-sight PVD)
     ============================================================ */
  const l2 = {
    ctx: null,
    ar: 6,
    spread: 18,
    cycles: 40,
    playing: false,
    // geometry (built from scratch on demand)
    base: null,          // array of {x,y} in canvas coords, shared shape params
    aldVerts: null,
    pvdVerts: null,
    pvdHits: null,
    fieldPx: 0,
    bottomPx: 0,
    pvdFieldPx: 0,
    pvdBottomPx: 0,
    animT: 0
  };

  const L2_PX_PER_NM = 4; // px per nm of film (trench drawn to scale)
  const L2_GPC_VIS = 0.4; // px per ALD cycle (= 0.1 nm/cycle at 4 px/nm)
  const L2_PARTICLES_PER_UNIT = 260;
  let l2Dirty = false;

  function l2_buildBase(ar) {
    // trench in "unit pane" coords: x in [0, 400], field top at y=88, depth 280
    const pts = [];
    const push = (x, y) => pts.push({ x, y });
    const W = 400, Y0 = 88, D = 280;
    const WL = clamp(D / ar, 14, 290);
    const left = W / 2 - WL / 2, right = W / 2 + WL / 2;
    const step = 13;
    // left field
    for (let x = -10; x <= left; x += step) push(x, Y0);
    if (pts[pts.length - 1].x < left) push(left, Y0);
    // left wall
    for (let y = Y0 + step; y < Y0 + D; y += step) push(left, y);
    push(left, Y0 + D);
    // bottom
    for (let x = left + step; x < right; x += step) push(x, Y0 + D);
    if (pts[pts.length - 1].x < right) push(right, Y0 + D);
    // right wall
    for (let y = Y0 + D - step; y > Y0; y -= step) push(right, y);
    push(right, Y0);
    // right field
    for (let x = right + step; x <= W + 10; x += step) push(x, Y0);
    const verts = pts.map(p => ({ x: p.x, y: p.y, nx: 0, ny: -1, ox: p.x, oy: p.y }));
    return l2_computeNormals(verts);
  }

  function l2_computeNormals(verts) {
    const n = verts.length;
    for (let i = 0; i < n; i++) {
      const prev = verts[Math.max(0, i - 1)];
      const next = verts[Math.min(n - 1, i + 1)];
      const self = verts[i];
      // edge into this vertex (i-1 → i)
      const e1x = self.x - prev.x, e1y = self.y - prev.y;
      const L1 = Math.hypot(e1x, e1y) || 1;
      const n1x = e1y / L1, n1y = -e1x / L1;
      // edge out of this vertex (i → i+1)
      const e2x = next.x - self.x, e2y = next.y - self.y;
      const L2e = Math.hypot(e2x, e2y) || 1;
      const n2x = e2y / L2e, n2y = -e2x / L2e;
      // Displacement for a unit uniform offset that satisfies v·n = 1 on both
      // edges: v = (n1+n2)/(1+n1·n2). On straight runs this is the unit
      // normal; at 90° corners it is the diagonal (n1+n2) — so concave trench
      // corners fill squarely and convex rims advance diagonally (bread-loaf).
      const denom = 1 + (n1x * n2x + n1y * n2y);
      if (denom > 1e-6) {
        self.nx = (n1x + n2x) / denom;
        self.ny = (n1y + n2y) / denom;
      } else {
        self.nx = n1x;
        self.ny = n1y;
      }
    }
    return verts;
  }

  function l2_thicknessAt(verts, xTarget, yTarget) {
    // displacement of the base vertex nearest to (xTarget, yTarget)
    let best = null, bestD = 1e18;
    for (const v of verts) {
      const dd = (v.ox - xTarget) * (v.ox - xTarget) + (v.oy - yTarget) * (v.oy - yTarget);
      if (dd < bestD) { bestD = dd; best = v; }
    }
    return best ? Math.hypot(best.x - best.ox, best.y - best.oy) : 0;
  }

  function l2_simulatePVD(base, spreadDeg, nParticles, seed) {
    const verts = base.map(v => ({ x: v.x, y: v.y, nx: v.nx, ny: v.ny, ox: v.ox, oy: v.oy }));
    const hits = new Array(verts.length).fill(0);
    const rng = mulberry32(seed);
    const sigma = (spreadDeg * Math.PI / 180) * 0.6;
    const BATCH = 900;
    const segCount = verts.length - 1;

    for (let p = 0; p < nParticles; p++) {
      // gaussian-ish angle via Box-Muller-lite
      const u1 = Math.max(1e-6, rng()), u2 = rng();
      const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const theta = clamp(g * sigma, -1.2, 1.2);
      const dx = Math.sin(theta), dy = Math.cos(theta);
      const x0 = -30 + rng() * 460, y0 = -40;

      // nearest intersection with polyline
      let bestT = 1e18, bestSeg = -1, bestS = 0;
      for (let s = 0; s < segCount; s++) {
        const a = verts[s], b = verts[s + 1];
        const ex = b.x - a.x, ey = b.y - a.y;
        const denom = dx * ey - dy * ex;
        if (Math.abs(denom) < 1e-12) continue;
        const t = ((a.x - x0) * ey - (a.y - y0) * ex) / denom;
        const sPar = ((a.x - x0) * dy - (a.y - y0) * dx) / denom;
        if (t > 1e-6 && t < bestT && sPar >= -0.001 && sPar <= 1.001) {
          bestT = t; bestSeg = s; bestS = sPar;
        }
      }
      if (bestSeg >= 0) {
        hits[bestSeg] += 1 - bestS;
        hits[bestSeg + 1] += bestS;
      }

      if ((p + 1) % BATCH === 0) {
        // grow on current geometry (this is what makes bread-loafing)
        for (let i = 0; i < verts.length; i++) {
          const segLen = estimateLocalLength(verts, i);
          const dens = hits[i] / Math.max(6, segLen);
          const grow = Math.min(dens * 0.55, segLen * 0.8);
          verts[i].x += verts[i].nx * grow;
          verts[i].y += verts[i].ny * grow;
          hits[i] = 0;
        }
      }
    }
    // final partial batch
    for (let i = 0; i < verts.length; i++) {
      const segLen = estimateLocalLength(verts, i);
      const dens = hits[i] / Math.max(6, segLen);
      const grow = Math.min(dens * 0.55, segLen * 0.8);
      verts[i].x += verts[i].nx * grow;
      verts[i].y += verts[i].ny * grow;
      hits[i] = 0;
    }
    return verts;
  }

  function estimateLocalLength(verts, i) {
    const a = verts[Math.max(0, i - 1)];
    const b = verts[Math.min(verts.length - 1, i + 1)];
    return Math.hypot(b.x - a.x, b.y - a.y) || 1;
  }

  function l2_recompute() {
    const base = l2_buildBase(l2.ar);
    l2.base = base;
    const targetField = l2.cycles * L2_GPC_VIS;

    // ALD: perfectly conformal offset along each vertex normal
    l2.aldVerts = base.map(v => ({
      x: v.x + v.nx * targetField,
      y: v.y + v.ny * targetField,
      nx: v.nx, ny: v.ny, ox: v.ox, oy: v.oy
    }));

    // PVD: ray-cast simulation with deterministic seed
    const nParticles = Math.round(l2.cycles * L2_PARTICLES_PER_UNIT);
    const pvd = l2_simulatePVD(base, l2.spread, nParticles, 2024);
    // rescale so field thickness matches ALD's field thickness for the same budget
    const tField = l2_thicknessAt(pvd, 40, 88);
    const tBottom = l2_thicknessAt(pvd, 200, 368);
    const scale = tField > 0.2 ? clamp(targetField / tField, 0, 8) : 1;
    for (const v of pvd) {
      v.x = v.ox + (v.x - v.ox) * scale;
      v.y = v.oy + (v.y - v.oy) * scale;
    }
    l2.pvdVerts = pvd;
    l2.fieldPx = targetField;
    l2.bottomPx = targetField; // ALD is conformal by construction
    l2.pvdFieldPx = targetField;
    l2.pvdBottomPx = tBottom * scale;

    l2_updateReadouts();
    l2_draw();
  }

  function l2_updateReadouts() {
    const toNm = px => px / L2_PX_PER_NM;
    const scAld = 100;
    const scPvd = l2.pvdFieldPx > 0.01 ? Math.round((l2.pvdBottomPx / l2.pvdFieldPx) * 100) : 100;
    $('#l2-ald-sc').textContent = scAld + '%';
    $('#l2-pvd-sc').textContent = (l2.cycles === 0 ? '—' : scPvd + '%');
    $('#l2-ald-bottom').textContent = `${fmt(toNm(l2.bottomPx), 2)} / ${fmt(toNm(l2.fieldPx), 2)} nm`;
    $('#l2-pvd-bottom').textContent = l2.cycles === 0 ? '—' : `${fmt(toNm(l2.pvdBottomPx), 2)} / ${fmt(toNm(l2.pvdFieldPx), 2)} nm`;

    // why texts
    const ar = l2.ar;
    $('#l2-ar-why').innerHTML = ar < 4
      ? `AR = ${fmt(ar, 1)} — a <strong>shallow</strong> feature: even PVD reaches the bottom reasonably well.`
      : ar < 9
        ? `AR = ${fmt(ar, 1)} — a <strong>moderately deep</strong> trench: PVD's bottom already lags the field (${scPvd}% step coverage).`
        : `AR = ${fmt(ar, 1)} — a <strong>deep</strong> feature: the bottom sees only a sliver of the beam. PVD step coverage ≈ ${scPvd}%, ALD stays ~100%.`;
    const sp = l2.spread;
    $('#l2-spread-why').innerHTML = sp < 12
      ? `±${sp}° — nearly <strong>collimated</strong> (evaporation-like): great directionality, brutal shadowing.`
      : sp < 35
        ? `±${sp}° — moderate spread: sidewalls pick up a little extra flux, but shadowing still governs.`
        : `±${sp}° — <strong>sputter-like</strong> broad angular distribution: sidewalls thicken some, and the top corners bread-loaf faster.`;
    $('#l2-cycles-why').innerHTML = l2.cycles === 0
      ? 'No time yet — both films are zero.'
      : `Same budget in both panes. PVD has already spent most of its flux on the field and top corners; the bottom holds ${scPvd}% of the field thickness.`;

    const cap = $('#l2-caption');
    if (cap) {
      const trenchW = clamp(280 / l2.ar, 14, 290);
      const pinch = l2.cycles * L2_GPC_VIS * 2 >= trenchW * 0.92;
      if (l2.cycles === 0) {
        cap.innerHTML = 'Set process time above zero and compare where each film thickens.';
      } else {
        cap.innerHTML = `At AR ≈ ${fmt(ar, 1)}: <strong>PVD step coverage ≈ ${scPvd}%</strong> (bottom ${fmt(toNm(l2.pvdBottomPx), 2)} nm vs field ${fmt(toNm(l2.pvdFieldPx), 2)} nm) — shadowing in action. <strong>ALD ≈ 100%</strong>: every surface site saturated every cycle.`
          + (pinch ? ' <em>Note: this trench is pinching closed — films this thick in holes this narrow do that in real fabs too.</em>' : '');
      }
    }
  }

  function l2_draw() {
    const ctx = l2.ctx;
    const W = 880, H = 420;
    ctx.clearRect(0, 0, W, H);

    drawPane(ctx, 20, 20, 415, 380, 'ALD', l2.aldVerts, l2.base, true);
    drawPane(ctx, 445, 20, 415, 380, 'PVD', l2.pvdVerts, l2.base, false);
  }

  function drawPane(ctx, ox, oy, w, h, title, verts, base, isAld) {
    ctx.save();
    ctx.translate(ox, oy);
    // pane background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0c1420');
    bg.addColorStop(1, '#0e1522');
    ctx.fillStyle = bg;
    rr(ctx, 0, 0, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    rr(ctx, 0, 0, w, h, 10);
    ctx.stroke();

    // title
    ctx.fillStyle = isAld ? COLORS.ald : COLORS.pvd;
    ctx.font = '700 13px ' + getComputedStyle(document.body).fontFamily;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(title + (isAld ? '  ·  self-limiting' : '  ·  line-of-sight'), 14, 12);

    // map unit-pane coords (x 0..400, y 0..320) into pane with padding
    const mapX = x => 12 + (x + 10) / 420 * (w - 24);
    const mapY = y => 42 + (y - 60) / 300 * (h - 62);

    // source glow for PVD
    if (!isAld) {
      const sg = ctx.createLinearGradient(0, 30, 0, 70);
      sg.addColorStop(0, 'rgba(240, 136, 62, 0.35)');
      sg.addColorStop(1, 'rgba(240, 136, 62, 0)');
      ctx.fillStyle = sg;
      ctx.fillRect(12, 30, w - 24, 40);
      ctx.fillStyle = 'rgba(240, 136, 62, 0.8)';
      ctx.font = '600 10px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'right';
      ctx.fillText('source flux  ↓', w - 16, 34);
    } else {
      ctx.fillStyle = 'rgba(63, 185, 80, 0.8)';
      ctx.font = '600 10px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'right';
      ctx.fillText('precursor gas floods feature', w - 16, 34);
    }

    // substrate fill (base polyline down to bottom)
    if (base && verts) {
      ctx.beginPath();
      ctx.moveTo(mapX(base[0].ox), mapY(base[0].oy));
      for (const v of base) ctx.lineTo(mapX(v.ox), mapY(v.oy));
      const last = base[base.length - 1];
      ctx.lineTo(mapX(last.ox), h - 6);
      ctx.lineTo(mapX(base[0].ox), h - 6);
      ctx.closePath();
      const sub = ctx.createLinearGradient(0, 80, 0, h);
      sub.addColorStop(0, '#2f3947');
      sub.addColorStop(1, '#222b38');
      ctx.fillStyle = sub;
      ctx.fill();

      // trench interior = vacuum void (darker), so the notch reads instantly
      let maxY = -Infinity, minX = Infinity, maxX = -Infinity;
      for (const v of base) if (v.oy > maxY) maxY = v.oy;
      for (const v of base) {
        if (Math.abs(v.oy - maxY) < 0.5) {
          if (v.ox < minX) minX = v.ox;
          if (v.ox > maxX) maxX = v.ox;
        }
      }
      const yTop = base[0].oy; // field surface height
      ctx.fillStyle = '#0b111b';
      ctx.fillRect(mapX(minX), mapY(yTop), mapX(maxX) - mapX(minX), mapY(maxY) - mapY(yTop));

      // film band — per-segment quads so pinch-off/self-crossing still renders
      if (verts) {
        const filmG = ctx.createLinearGradient(0, 60, 0, h);
        if (isAld) {
          filmG.addColorStop(0, 'rgba(63, 185, 80, 0.85)');
          filmG.addColorStop(1, 'rgba(63, 185, 80, 0.55)');
        } else {
          filmG.addColorStop(0, 'rgba(240, 136, 62, 0.85)');
          filmG.addColorStop(1, 'rgba(240, 136, 62, 0.55)');
        }
        ctx.beginPath();
        for (let i = 0; i < base.length - 1; i++) {
          const a = verts[i], b = verts[i + 1];
          const ab = base[i], bb = base[i + 1];
          ctx.moveTo(mapX(ab.ox), mapY(ab.oy));
          ctx.lineTo(mapX(bb.ox), mapY(bb.oy));
          ctx.lineTo(mapX(b.x), mapY(b.y));
          ctx.lineTo(mapX(a.x), mapY(a.y));
          ctx.closePath();
        }
        ctx.fillStyle = filmG;
        ctx.fill();

        // grown surface stroke
        ctx.beginPath();
        ctx.moveTo(mapX(verts[0].x), mapY(verts[0].y));
        for (const v of verts) ctx.lineTo(mapX(v.x), mapY(v.y));
        ctx.strokeStyle = isAld ? 'rgba(126, 231, 135, 0.95)' : 'rgba(255, 190, 140, 0.95)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // base surface dashed
        ctx.beginPath();
        ctx.moveTo(mapX(base[0].ox), mapY(base[0].oy));
        for (const v of base) ctx.lineTo(mapX(v.ox), mapY(v.oy));
        ctx.strokeStyle = 'rgba(139, 148, 158, 0.55)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // thickness callouts
    const nmField = (isAld ? l2.fieldPx : l2.pvdFieldPx) / L2_PX_PER_NM;
    const nmBottom = (isAld ? l2.bottomPx : l2.pvdBottomPx) / L2_PX_PER_NM;
    if (l2.cycles > 0) {
      ctx.font = '600 10.5px ' + getComputedStyle(document.body).fontFamily;
      ctx.fillStyle = COLORS.textBright;
      ctx.textAlign = 'left';
      ctx.fillText(`field ${fmt(nmField, 2)} nm`, 20, 52);
      ctx.fillText(`bottom ${fmt(nmBottom, 2)} nm`, w / 2 - 34, h - 24);
    }
    ctx.restore();
  }

  function initLab2() {
    l2.ctx = fitCanvas($('#lab2-canvas'), 880, 420);
    const ar = $('#l2-ar'), spread = $('#l2-spread'), cycles = $('#l2-cycles');

    function sync() {
      l2.ar = +ar.value;
      l2.spread = +spread.value;
      l2.cycles = +cycles.value;
      $('#l2-ar-val').textContent = fmt(l2.ar, 1);
      $('#l2-spread-val').textContent = '±' + l2.spread + '°';
      $('#l2-cycles-val').textContent = String(l2.cycles);
      paintSlider(ar); paintSlider(spread); paintSlider(cycles);
      l2Dirty = true; // throttled: recompute happens at most once per frame
    }
    ar.addEventListener('input', sync);
    spread.addEventListener('input', sync);
    cycles.addEventListener('input', sync);

    const playBtn = $('#l2-play');
    playBtn.addEventListener('click', () => {
      l2.playing = !l2.playing;
      playBtn.setAttribute('aria-pressed', String(l2.playing));
      $('#l2-play-label').textContent = l2.playing ? 'Pause' : 'Grow';
    });

    $('#l2-reset').addEventListener('click', () => {
      l2.playing = false;
      playBtn.setAttribute('aria-pressed', 'false');
      $('#l2-play-label').textContent = 'Grow';
      ar.value = 6; spread.value = 18; cycles.value = 40;
      sync();
    });

    sync();
  }

  /* ============================================================
     LAB 3 — growth curves (incubation + ALD temperature window)
     ============================================================ */
  const l3 = {
    mainCtx: null,
    tempCtx: null,
    surface: 'oxide',
    temp: 225,
    cycles: 100
  };

  function l3_gpc(T) {
    if (T < 150) return GPC_MAX * (0.15 + 0.85 * clamp((T - 25) / 125, 0, 1));
    if (T <= 300) return GPC_MAX;
    const u = (T - 300) / 150;
    return Math.max(0, GPC_MAX * (1 + 1.2 * u - 2.2 * u * u));
  }
  function l3_delay(surface) { return surface === 'inert' ? 6 : 0; }
  function l3_aldThick(N, surface, T) {
    return l3_gpc(T) * Math.max(0, N - l3_delay(surface));
  }
  const L3_PVD_RATE = 0.08; // nm per process unit

  function l3_drawMain() {
    const ctx = l3.mainCtx;
    const W = 520, H = 320;
    ctx.clearRect(0, 0, W, H);
    const padL = 52, padR = 16, padT = 18, padB = 44;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const xMax = 200, yMax = 22;
    const X = n => padL + n / xMax * plotW;
    const Y = v => padT + (1 - clamp(v, 0, yMax) / yMax) * plotH;

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = COLORS.text;
    for (let v = 0; v <= yMax; v += 5) {
      ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(W - padR, Y(v)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(v + ' nm', padL - 8, Y(v));
    }
    for (let n = 0; n <= xMax; n += 50) {
      ctx.beginPath(); ctx.moveTo(X(n), padT); ctx.lineTo(X(n), H - padB); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(String(n), X(n), H - padB + 8);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('cycles (ALD)  /  time units (PVD)', padL + plotW / 2, H - 14);

    const gpc = l3_gpc(l3.temp);
    const Nd = l3_delay(l3.surface);

    // incubation shade
    if (Nd > 1) {
      ctx.fillStyle = 'rgba(210, 153, 34, 0.12)';
      ctx.fillRect(padL, padT, X(Nd) - padL, plotH);
      ctx.fillStyle = 'rgba(210, 153, 34, 0.85)';
      ctx.font = '600 10px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'left';
      ctx.fillText('islands — no closed film', X(2), padT + 14);
    }

    // ideal ALD (dashed, no delay)
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(xMax), Y(gpc * xMax));
    ctx.strokeStyle = 'rgba(122, 162, 247, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.setLineDash([]);

    // real ALD
    ctx.beginPath();
    let started = false;
    for (let n = 0; n <= xMax; n += 2) {
      const y = Y(l3_aldThick(n, l3.surface, l3.temp));
      if (!started) { ctx.moveTo(X(n), y); started = true; } else ctx.lineTo(X(n), y);
    }
    ctx.strokeStyle = COLORS.ald;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // PVD
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(xMax), Y(L3_PVD_RATE * xMax));
    ctx.strokeStyle = COLORS.pvd;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // legend (bottom-right — the curve-free corner)
    const lx = padL + plotW * 0.55;
    ctx.font = '600 10.5px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.ald;
    ctx.fillText('ALD (with incubation)', lx, padT + plotH - 42);
    ctx.fillStyle = 'rgba(122, 162, 247, 0.85)';
    ctx.fillText('ALD ideal: d = N × GPC', lx, padT + plotH - 26);
    ctx.fillStyle = COLORS.pvd;
    ctx.fillText('PVD: d = R × t', lx, padT + plotH - 10);

    // marker
    const n = l3.cycles;
    ctx.strokeStyle = COLORS.warn;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(X(n), padT); ctx.lineTo(X(n), H - padB); ctx.stroke();
    ctx.setLineDash([]);
    for (const [v, col] of [[l3_aldThick(n, l3.surface, l3.temp), COLORS.ald], [L3_PVD_RATE * n, COLORS.pvd]]) {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(X(n), Y(v), 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  function l3_drawTemp() {
    const ctx = l3.tempCtx;
    const W = 520, H = 320;
    ctx.clearRect(0, 0, W, H);
    const padL = 52, padR = 16, padT = 18, padB = 44;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const xMin = 25, xMax = 450, yMax = 0.16;
    const X = t => padL + (t - xMin) / (xMax - xMin) * plotW;
    const Y = v => padT + (1 - v / yMax) * plotH;

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = COLORS.text;
    for (let v = 0; v <= yMax; v += 0.04) {
      ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(W - padR, Y(v)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(v.toFixed(2), padL - 8, Y(v));
    }
    for (let t = 50; t <= xMax; t += 100) {
      ctx.beginPath(); ctx.moveTo(X(t), padT); ctx.lineTo(X(t), H - padB); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(t + '°', X(t), H - padB + 8);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('temperature (°C) — qualitative', padL + plotW / 2, H - 14);

    // window band
    ctx.fillStyle = 'rgba(63, 185, 80, 0.12)';
    ctx.fillRect(X(150), padT, X(300) - X(150), plotH);
    ctx.fillStyle = 'rgba(63, 185, 80, 0.85)';
    ctx.font = '700 11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center';
    ctx.fillText('ALD WINDOW', X(225), padT + 14);

    // annotations
    ctx.font = '600 10px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = 'rgba(210, 153, 34, 0.9)';
    ctx.textAlign = 'left';
    ctx.fillText('too cold: reactions stall', X(32), padT + plotH - 12);
    ctx.fillStyle = 'rgba(248, 81, 73, 0.85)';
    ctx.textAlign = 'right';
    ctx.fillText('too hot: desorb / decompose', X(440), padT + plotH - 12);

    // curve
    ctx.beginPath();
    for (let t = xMin; t <= xMax; t += 2.5) {
      const y = Y(l3_gpc(t));
      if (t === xMin) ctx.moveTo(X(t), y); else ctx.lineTo(X(t), y);
    }
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // marker
    const g = l3_gpc(l3.temp);
    ctx.strokeStyle = COLORS.warn;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(X(l3.temp), padT); ctx.lineTo(X(l3.temp), H - padB); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.warn;
    ctx.beginPath(); ctx.arc(X(l3.temp), Y(g), 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = COLORS.text;
    ctx.font = '600 11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(14, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('GPC (nm / cycle)', 0, 0);
    ctx.restore();
  }

  function l3_updateReadouts() {
    const gpc = l3_gpc(l3.temp);
    const Nd = l3_delay(l3.surface);
    $('#l3-gpc').textContent = fmt(gpc, 3) + ' nm';
    $('#l3-delay').textContent = Nd <= 1 ? '~0 cycles' : `~${Nd} cycles`;
    $('#l3-thickness-ald').textContent = fmt(l3_aldThick(l3.cycles, l3.surface, l3.temp), 2) + ' nm';
    $('#l3-thickness-pvd').textContent = fmt(L3_PVD_RATE * l3.cycles, 2) + ' nm';

    const T = l3.temp;
    const tempWhy = $('#l3-temp-why');
    if (T < 150) {
      tempWhy.innerHTML = `At ${T} °C — <strong>below the window</strong>: half-reactions are incomplete; GPC falls and film quality suffers.`;
    } else if (T <= 300) {
      tempWhy.innerHTML = `At ${T} °C — <strong>inside the window</strong>: GPC is flat (≈ ${fmt(gpc, 3)} nm) and set by surface site density — the practical sweet spot.`;
    } else {
      tempWhy.innerHTML = `At ${T} °C — <strong>above the window</strong>: precursor desorbs and/or decomposes. GPC wanders and growth loses self-limitation (CVD-like creep).`;
    }
    const surfWhy = $('#l3-surface-why');
    surfWhy.innerHTML = l3.surface === 'oxide'
      ? 'A hydroxylated oxide: the precursor finds anchor sites on cycle 1, so growth starts almost immediately.'
      : 'Bare platinum has almost no –OH anchors. Early cycles form scattered islands — measurable thickness starts only after they merge (the shaded incubation band).';

    const cap = $('#l3-caption');
    if (cap) {
      const ideal = l3.cycles * gpc;
      const real = l3_aldThick(l3.cycles, l3.surface, l3.temp);
      cap.innerHTML = l3.surface === 'inert' && l3.cycles > 0
        ? `On inert Pt the first ~${Nd} cycles are invisible (islands): at ${l3.cycles} cycles you have <strong>${fmt(real, 2)} nm</strong> instead of the ideal ${fmt(ideal, 2)} nm — the gap is nucleation delay, and it shrinks in relative terms as cycles stack up.`
        : `On reactive SiO<sub>2</sub> the curve hugs the ideal line: ${l3.cycles} cycles → <strong>${fmt(real, 2)} nm</strong> (ideal ${fmt(ideal, 2)} nm). Move temperature out of the window and the slope itself changes.`;
    }
  }

  function l3_sync() {
    l3_drawMain();
    l3_drawTemp();
    l3_updateReadouts();
  }

  function initLab3() {
    l3.mainCtx = fitCanvas($('#lab3-chart-main'), 520, 320);
    l3.tempCtx = fitCanvas($('#lab3-chart-temp'), 520, 320);

    $$('.seg-btn', $('#lab3-controls')).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.seg-btn', $('#lab3-controls')).forEach(b => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        l3.surface = btn.dataset.surface;
        l3_sync();
      });
    });

    const temp = $('#l3-temp'), cycles = $('#l3-cycles');
    function syncSliders() {
      l3.temp = +temp.value;
      l3.cycles = +cycles.value;
      $('#l3-temp-val').textContent = l3.temp + ' °C';
      $('#l3-cycles-val').textContent = l3.cycles + ' cycles';
      paintSlider(temp);
      paintSlider(cycles);
      l3_sync();
    }
    temp.addEventListener('input', syncSliders);
    cycles.addEventListener('input', syncSliders);
    syncSliders();
  }

  /* ============================================================
     shared animation loop
     ============================================================ */
  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    if (l1.running) l1_update(dt);

    if (l2.playing) {
      const el = $('#l2-cycles');
      const next = Math.min(120, Math.round(l2.cycles + dt * 22));
      if (next !== l2.cycles) {
        l2.cycles = next;
        el.value = String(next);
        paintSlider(el);
        $('#l2-cycles-val').textContent = String(next);
        l2Dirty = true;
      } else if (l2.cycles >= 120) {
        l2.playing = false;
        $('#l2-play').setAttribute('aria-pressed', 'false');
        $('#l2-play-label').textContent = 'Grow';
      }
    }

    if (l2Dirty) {
      l2Dirty = false;
      l2_recompute();
    }

    requestAnimationFrame(frame);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    initPredictCards();
    initLab1();
    initLab2();
    initLab3();
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
