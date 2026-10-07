/* 2026 Chemistry — chirality & the autocatalytic snowball: how 51% becomes 99%. */
import { exhibitShell, makeCanvas, button, slider, loop, el, caption, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';
import { seeded } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Hands, molecules, and the chemical snowball',
    hint: 'Try to rotate a left hand into a right hand — then watch a 51/49 split amplify itself to purity.',
  });

  /* ============ PART A: the mirror test ============ */
  const g1 = el('div', { class: 'sim-grid side' });
  body.append(g1);
  const a = makeCanvas(g1, 300);
  const p1 = controlsPanel(g1);

  let rot = 0;       // rotation applied to left molecule
  let flip3d = 0.15; // pseudo-3D rotation phase
  slider(p1, { label: 'Rotate the LEFT molecule', min: -Math.PI, max: Math.PI, step: 0.01, value: 0, fmt: v => Math.round(v * 180 / Math.PI) + '°', onInput: v => rot = v });
  slider(p1, { label: 'Tumble through space', min: 0, max: Math.PI * 2, step: 0.01, value: 0.15, fmt: v => Math.round(v * 180 / Math.PI) + '°', onInput: v => flip3d = v });
  const matchLabel = el('div', { class: 'chip-note', style: '--cat:#fb7185' }, '✗ No rotation makes them match — that\'s the whole point');
  p1.append(matchLabel);
  caption(p1, 'Each "molecule" below is a carbon centre with four different groups attached (coloured stubs). The right one is the mirror image of the left. Drag the sliders all you like: <b>no rotation in 3D can superimpose them</b> — just as no rotation turns your left hand into your right. Molecules with this property are chiral ("handed"), and biology cares deeply which hand it gets.');

  const STUBS = [ // angle slots, colored groups
    { col: '#f87171', lab: 'A' }, { col: '#60a5fa', lab: 'B' }, { col: '#facc15', lab: 'C' }, { col: '#4ade80', lab: 'D' },
  ];
  function drawMol(ctx, cx, cy, mirrored, t, rotZ = 0, phase = 0) {
    const R = 62;
    // draw center
    const slots = [0, 1, 2, 3].map(i => {
      let ang = (i / 4) * TAU + Math.PI / 4 + rotZ;
      if (mirrored) ang = Math.PI - ang; // mirror across vertical
      // depth from tumble: cos(ang+phase) → draw smaller/larger, dashed if behind
      const depth = Math.cos(ang + phase); // -1..1
      const x = cx + Math.cos(ang) * R * (0.55 + 0.45 * Math.cos(phase) * 0 + 0.45 * Math.abs(Math.sin(phase % Math.PI)));
      const y = cy + Math.sin(ang) * R * 0.55 * Math.cos(phase * 0.5) + Math.sin(ang + phase) * 12;
      return { i, x, y, depth: Math.sin(ang) * Math.sin(phase) * (mirrored ? -1 : 1) + depth * 0.4 };
    }).sort((s1, s2) => s1.depth - s2.depth);
    for (const s of slots) {
      const st = STUBS[s.i];
      const behind = s.depth < -0.15;
      ctx.strokeStyle = st.col; ctx.lineWidth = 3;
      if (behind) ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(s.x, s.y); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath(); ctx.arc(cx, cy, 13, 0, TAU); ctx.fill();
    ctx.fillStyle = '#111'; ctx.font = '700 10px ui-monospace,monospace'; ctx.textAlign = 'center';
    ctx.fillText('C', cx, cy + 3.5);
    for (const s of slots) {
      const st = STUBS[s.i];
      ctx.fillStyle = st.col;
      ctx.beginPath(); ctx.arc(s.x, s.y, 12, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0b0f1a'; ctx.font = '800 11px ui-monospace,monospace';
      ctx.fillText(st.lab, s.x, s.y + 4);
    }
    ctx.textAlign = 'left';
  }

  /* ============ PART B: the snowball ============ */
  body.append(el('hr', { style: 'border:none;border-top:1px solid var(--border-soft);margin:1.5rem 0' }));
  const g2 = el('div', { class: 'sim-grid side' });
  body.append(g2);
  const b = makeCanvas(g2, 320);
  const p2 = controlsPanel(p2);

  let p = 0.51;             // fraction LEFT-handed
  let running = false;
  let hist = [p];
  const NDOT = 240;
  const rnd = seeded(1995);
  let dots = [];
  function resample() {
    dots = [];
    for (let i = 0; i < NDOT; i++) dots.push({ l: rnd() < p, x: rnd(), y: rnd(), ph: rnd() * TAU });
  }
  resample();

  slider(p2, { label: 'Starting advantage of one hand', min: 0.5005, max: 0.6, step: 0.0005, value: 0.51, fmt: v => ((v * 100).toFixed(1)) + '%', onInput: v => { p = v; hist = [p]; resample(); } });
  const rowB = el('div', { class: 'btn-row' });
  p2.append(rowB);
  const runB = button(rowB, '▶ Run autocatalysis', () => { running = !running; runB.textContent = running ? '⏸ Pause' : '▶ Run autocatalysis'; }, { primary: true });
  button(rowB, '↺ Reset to start', () => { p = +p2.querySelector('input').value; hist = [p]; resample(); running = false; runB.textContent = '▶ Run autocatalysis'; });
  const rdB = el('div', { class: 'readout' }); p2.append(rdB);
  const stShare = statBox(rdB, { label: 'Left-hand share now' });
  const stRound = statBox(rdB, { label: 'Generations' });

  caption(p2, 'Kagan found <b>non-linear amplification</b>: mixed-hand catalyst pairs sabotage each other, so a small imbalance in the catalyst yields far purer product. Soai found the extreme case — a product that catalyses its own creation (<b>autocatalysis</b>): each generation, the majority hand breeds faster. Below, every generation applies that snowball rule. Try starting at 50.1%: purity still wins. It\'s the leading hint for why life\'s amino acids are all left-handed.');

  let acc = 0, rounds = 0;
  loop((dt, t) => {
    /* ---- part A draw ---- */
    {
      const { ctx } = a; const w = a.W(), h = a.H();
      ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
      // mirror line
      ctx.strokeStyle = 'rgba(232,197,104,.5)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(w / 2, 18); ctx.lineTo(w / 2, h - 34); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(232,197,104,.8)'; ctx.font = '600 11px -apple-system,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('mirror', w / 2, h - 14);
      drawMol(ctx, w * 0.26, h * 0.5, false, t, rot, flip3d);
      drawMol(ctx, w * 0.74, h * 0.5, true, t, 0, flip3d);
      ctx.fillStyle = 'rgba(151,163,189,.85)'; ctx.font = '11px -apple-system,sans-serif';
      ctx.fillText('“left”', w * 0.26, h - 14); ctx.fillText('“right” (mirror)', w * 0.74, h - 14);
      ctx.textAlign = 'left';
    }

    /* ---- part B sim + draw ---- */
    {
      if (running) {
        acc += dt;
        while (acc > 0.16) {
          acc -= 0.16;
          rounds++;
          // autocatalytic update: next gen share ∝ p² (majority breeds quadratically faster)
          p = (p * p) / (p * p + (1 - p) * (1 - p));
          // cap drift toward 1
          hist.push(p);
          if (hist.length > 260) hist.shift();
          resample();
        }
      }
      stShare.set((p * 100).toFixed(2) + '%');
      stRound.set(String(rounds));

      const { ctx } = b; const w = b.W(), h = b.H();
      ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);

      // crowd field (top 60%)
      const fy = h * 0.60;
      let L = 0;
      for (const d of dots) if (d.l) L++;
      // reassign to track p exactly for display stability
      for (let i = 0; i < NDOT; i++) dots[i].l = i / NDOT < p;
      // shuffle draw order via index hash
      for (let i = 0; i < NDOT; i++) {
        const d = dots[(i * 89) % NDOT];
        const x = 20 + d.x * (w - 40), y = 20 + d.y * (fy - 30);
        const jy = Math.sin(t * 2 + d.ph) * 2;
        ctx.fillStyle = d.l ? '#22d3ee' : '#f472b6';
        ctx.beginPath(); ctx.arc(x, y + jy, 4.6, 0, TAU); ctx.fill();
        // tiny hand marker
        ctx.fillStyle = 'rgba(11,15,26,.8)'; ctx.font = '800 6px ui-monospace,monospace'; ctx.textAlign = 'center';
        ctx.fillText(d.l ? 'L' : 'R', x, y + jy + 2.2);
      }
      ctx.textAlign = 'left';
      ctx.strokeStyle = 'rgba(93,106,134,.4)';
      ctx.beginPath(); ctx.moveTo(0, fy + 8); ctx.lineTo(w, fy + 8); ctx.stroke();

      // chart of share over generations
      const cy0 = fy + 24, chh = h - cy0 - 16;
      if (hist.length > 1) {
        // 50% line
        ctx.strokeStyle = 'rgba(238,242,255,.25)'; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(20, cy0 + chh * 0.5); ctx.lineTo(w - 20, cy0 + chh * 0.5); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(151,163,189,.7)'; ctx.font = '10px ui-monospace,monospace';
        ctx.fillText('50/50', 24, cy0 + chh * 0.5 - 4);
        ctx.fillText('all one hand', 24, cy0 + 10);
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
        ctx.beginPath();
        hist.forEach((v, i) => {
          const X = 20 + (i / (hist.length - 1)) * (w - 40);
          const Y = cy0 + (1 - v) * chh;
          i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
        });
        ctx.stroke();
        if (p > 0.985) {
          ctx.fillStyle = '#a3e635'; ctx.font = '700 13px -apple-system,sans-serif';
          ctx.fillText('✔ Homochirality — one hand runs the world', 24, cy0 + 24);
        }
      }
    }
  });
}
