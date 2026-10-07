/* 2023 Physics — Attosecond pulse builder. Stack light-waves: many "colours" = one short flash. */
import { exhibitShell, makeCanvas, slider, button, loop, el, statBox, caption, controlsPanel, TAU } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Build an attosecond flash',
    hint: 'Add overtones — watch one chord of light become a strobe',
  });

  let N = 3;          // number of harmonics
  let playing = true;
  let phase = 0;

  /* exhibit 1: fourier pulse builder */
  const grid1 = el('div', { class: 'sim-grid side' });
  body.append(grid1);
  const cv1 = makeCanvas(grid1, 320);
  const panel = controlsPanel(grid1);

  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const stPeriod = statBox(readouts, { label: 'Strobe repeats every' });
  const stFlash = statBox(readouts, { label: 'Each flash lasts' });
  stPeriod.set('≈ 2.7 fs');
  function updateReadout() {
    // model: laser period T≈2.7fs; pulse width ≈ period / (#harmonics)
    const as = 2700 / N;
    stFlash.set(as >= 1000 ? (as / 1000).toFixed(2) + ' fs' : Math.round(as) + ' as');
  }
  updateReadout();

  slider(panel, {
    label: 'Overtones stacked (harmonics)', min: 1, max: 24, step: 1, value: N,
    fmt: v => v, onInput: v => { N = v; updateReadout(); }
  });
  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  const playBtn = button(row, '⏸ Pause', () => {
    playing = !playing;
    playBtn.textContent = playing ? '⏸ Pause' : '▶ Play';
  }, { primary: true });

  caption(body, 'Anne L\'Huillier discovered that laser light hitting a gas spawns many <b>overtones</b> — frequencies at exact multiples of the original. When many overtones are locked in step, their peaks line up for a tiny instant and cancel everywhere else: a <b>strobe</b>. Agostini and Krausz measured and isolated these flashes — each lasting attoseconds, i.e. billionths of a billionth of a second.');

  /* exhibit 2: shutter speed analogy */
  const grid2 = el('div', { class: 'sim-grid side' });
  body.append(el('hr', { style: 'border:none;border-top:1px solid var(--border-soft);margin:1.4rem 0' }), grid2);
  const cv2 = makeCanvas(grid2, 250);
  const panel2 = controlsPanel(grid2);
  let flashAs = 2700; // attoseconds
  slider(panel2, {
    label: 'Camera flash duration', min: 40, max: 2700, step: 20, value: 2700,
    fmt: v => v >= 1000 ? (v / 1000).toFixed(1) + ' fs' : v + ' as', onInput: v => { flashAs = v; }
  });
  caption(grid2, 'An electron zips around an atom in ~150 attoseconds. A long flash photographs it like a year-long shutter photographs a hummingbird — a smear (left, red trail). Make the flash short enough and motion freezes into a crisp snapshot. That crispness is the whole prize.');

  loop((dt) => {
    if (playing) phase += dt * 0.9;

    // --- canvas 1: harmonics + sum ---
    {
      const { ctx, W, H } = { ctx: cv1.ctx, W: cv1.W(), H: cv1.H() };
      ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, W, H);
      const mid = H * 0.62, span = W - 40;
      const f0 = 0.9; // fundamental cycles across screen * phase movement handled below
      const wave = x => {
        let s = 0;
        for (let k = 1; k <= N; k++) s += Math.cos(TAU * f0 * k * (x / W) - phase * k * 1.0) / N;
        return s;
      };
      // faint individual harmonics (first 6)
      for (let k = 1; k <= Math.min(N, 6); k++) {
        ctx.strokeStyle = `rgba(129,140,248,${0.10 + 0.05 * k})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let px = 0; px <= span; px += 3) {
          const x = 20 + px;
          const y = mid - Math.cos(TAU * f0 * k * (x / W) - phase * k) * 64 * (1 / N);
          px === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // the sum
      ctx.strokeStyle = '#c7d0ff'; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
      ctx.shadowColor = '#818cf8'; ctx.shadowBlur = 12;
      ctx.beginPath();
      for (let px = 0; px <= span; px += 2) {
        const x = 20 + px;
        const y = mid - wave(x) * 64;
        px === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // labels
      ctx.fillStyle = 'rgba(151,163,189,0.85)';
      ctx.font = '12px ui-monospace,monospace';
      ctx.fillText(`${N} overtone${N > 1 ? 's' : ''} (faint) + their sum (bright)`, 20, 22);
      ctx.fillText(N === 1 ? '→ one wave. No strobe yet.' : N < 5 ? '→ peaks are forming…' : N < 12 ? '→ a train of short flashes!' : '→ attosecond strobe train', 20, H - 16);
    }

    // --- canvas 2: electron snapshot ---
    {
      const { ctx, W, H } = { ctx: cv2.ctx, W: cv2.W(), H: cv2.H() };
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.34;
      const t = performance.now() / 1000;
      const speed = 3.2; // revs per second (scaled for display)
      const angleNow = t * TAU * speed;
      const blur = flashAs / 2700; // 0..1 -> arc fraction of orbit
      ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, W, H);
      // nucleus
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, TAU); ctx.fill();
      // orbit guide
      ctx.strokeStyle = 'rgba(151,163,189,.25)'; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      // smear trail: arc length proportional to flash duration
      const arc = TAU * blur * 0.9;
      for (let i = 0; i < 40; i++) {
        const a = angleNow - (i / 40) * arc;
        const alpha = (1 - i / 40) * (blur > 0.02 ? 0.5 : 0);
        if (alpha <= 0.01 && blur > 0.02) continue;
        ctx.fillStyle = `rgba(251,113,133,${alpha})`;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6, 0, TAU); ctx.fill();
      }
      // electron
      const crisp = blur < 0.09;
      ctx.fillStyle = crisp ? '#7dd3fc' : '#fb7185';
      ctx.beginPath(); ctx.arc(cx + Math.cos(angleNow) * r, cy + Math.sin(angleNow) * r, crisp ? 8 : 6, 0, TAU); ctx.fill();
      // flash indicator
      const flashOn = (t * 1.2) % 1 < 0.08;
      if (flashOn) { ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(0, 0, W, H); }
      ctx.fillStyle = 'rgba(151,163,189,.9)'; ctx.font = '12px ui-monospace,monospace';
      ctx.fillText(crisp ? '✔ flash short enough — electron frozen crisply' : '✘ flash too long — the electron is a blur you can\'t study', 16, 20);
    }
  });
}
