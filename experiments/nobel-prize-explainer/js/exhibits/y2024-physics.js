/* 2024 Physics — Hopfield network: associative memory you can draw, scramble and heal. */
import { exhibitShell, makeCanvas, button, loop, el, caption, statBox, controlsPanel, TAU } from '../kit.js';

const N = 10;                 // 10x10 neurons
const NEU = N * N;
const PRESETS = {
  '☺ Smiley': ['0000000000','0011001100','0011001100','0000000000','0000000000','0100000010','0010000100','0001111000','0000000000','0000000000'],
  '♥ Heart':  ['0000000000','0011001100','0111111110','0111111110','0111111110','0011111100','0001111000','0000110000','0000000000','0000000000'],
  '✕ Letter':  ['0000000000','0110000110','0011001100','0001111000','0000110000','0001111000','0011001100','0110000110','0000000000','0000000000'],
};

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'A memory that heals itself',
    hint: 'Draw a pattern, memorize it, scramble it — then watch the network roll downhill into the memory',
  });

  let cells = new Array(NEU).fill(-1);   // -1 or +1 (physics spin notation)
  let W = new Float32Array(NEU * NEU);   // connection strengths
  let memories = 0;
  let recalling = false;
  let energyHist = [];

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { wrap, ctx, W: CW, H } = makeCanvas(grid, 380);
  const panel = controlsPanel(grid);

  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const stMem = statBox(readouts, { label: 'Memories stored' });
  const stE = statBox(readouts, { label: 'Network energy' });

  const row1 = el('div', { class: 'btn-row' });
  panel.append(row1);
  for (const [name, bmp] of Object.entries(PRESETS)) {
    button(row1, name, () => { recallStop(); cells = bmp.flatMap(r => [...r].map(c => c === '1' ? 1 : -1)); });
  }
  button(row1, '✏ Blank', () => { recallStop(); cells.fill(-1); });

  const row2 = el('div', { class: 'btn-row' });
  panel.append(row2);
  button(row2, '🧠 Memorize this', memorize, { primary: true, title: 'Tune the connections so this pattern becomes an energy valley (Hebb\'s rule)' });
  button(row2, '🎲 Scramble 35%', () => { recallStop(); for (let i = 0; i < NEU; i++) if (Math.random() < 0.35) cells[i] *= -1; });
  const recallBtn = button(row2, '⚡ Recall', () => { recalling = !recalling; recallBtn.textContent = recalling ? '⏸ Stop' : '⚡ Recall'; });
  button(row2, '🗑 Forget all', () => { memories = 0; W.fill(0); stMem.set('0'); energyHist = []; });

  function recallStop() { recalling = false; recallBtn.textContent = '⚡ Recall'; }
  function memorize() {
    if (memories >= 3) { memories = 0; W.fill(0); } // keep it honest: limited capacity
    for (let i = 0; i < NEU; i++) for (let j = 0; j < NEU; j++) if (i !== j) W[i * NEU + j] += cells[i] * cells[j];
    memories++; stMem.set(String(memories));
  }
  function energy() {
    let e = 0;
    for (let i = 0; i < NEU; i++) { let h = 0; const row = i * NEU; for (let j = 0; j < NEU; j++) h += W[row + j] * cells[j]; e -= 0.5 * h * cells[i]; }
    return e / NEU;
  }

  /* paint on the grid */
  let painting = -1, drawVal = 1;
  const cellAt = (e) => {
    const r = wrap.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const m = 12, gw = (r.width - m * 2) / N, gh = (H() - m * 2) / N;
    const cx = Math.floor((x - m) / gw), cy = Math.floor((y - m) / gh);
    return (cx >= 0 && cx < N && cy >= 0 && cy < N) ? cy * N + cx : -1;
  };
  wrap.addEventListener('pointerdown', e => { recallStop(); const i = cellAt(e); if (i >= 0) { painting = i; drawVal = -cells[i]; cells[i] = drawVal; } });
  wrap.addEventListener('pointermove', e => { if (painting >= 0) { const i = cellAt(e); if (i >= 0) cells[i] = drawVal; } });
  window.addEventListener('pointerup', () => painting = -1);
  wrap.style.touchAction = 'none';

  let stepAcc = 0;
  loop((dt) => {
    /* recall dynamics: random neurons update toward local consensus */
    if (recalling && memories > 0) {
      stepAcc += dt;
      const steps = 14;
      for (let s = 0; s < steps; s++) {
        const i = (Math.random() * NEU) | 0;
        let h = 0; const row = i * NEU;
        for (let j = 0; j < NEU; j++) h += W[row + j] * cells[j];
        cells[i] = h >= 0 ? 1 : -1;
      }
      energyHist.push(energy());
      if (energyHist.length > 240) energyHist.shift();
      stE.set(energy().toFixed(1));
    }

    /* draw */
    const w = CW(), h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
    const m = 12, gw = (w - m * 2) / N, gh = (h - m * 2) / N;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const on = cells[y * N + x] === 1;
      ctx.fillStyle = on ? '#a5b4fc' : '#141b30';
      const inset = on ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(m + x * gw + inset, m + y * gh + inset, gw - inset * 2, gh - inset * 2, 5);
      ctx.fill();
      if (on) {
        ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#818cf8';
        ctx.beginPath(); ctx.roundRect(m + x * gw - 1, m + y * gh - 1, gw + 2, gh + 2, 6); ctx.fill(); ctx.restore();
        ctx.fillStyle = '#a5b4fc';
        ctx.beginPath(); ctx.roundRect(m + x * gw + 2, m + y * gh + 2, gw - 4, gh - 4, 5); ctx.fill();
      }
    }

    /* energy sparkline */
    if (energyHist.length > 2) {
      const ex = 12, ey = h - 46, ew = w - 24, eh = 34;
      ctx.strokeStyle = 'rgba(251,191,36,.85)'; ctx.lineWidth = 2;
      ctx.beginPath();
      const mn = Math.min(...energyHist), mx = Math.max(...energyHist), rng = Math.max(1e-6, mx - mn);
      energyHist.forEach((v, i) => {
        const X = ex + (i / (energyHist.length - 1)) * ew;
        const Y = ey + eh - ((v - mn) / rng) * eh;
        i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
      });
      ctx.stroke();
      ctx.fillStyle = 'rgba(251,191,36,.8)'; ctx.font = '10px ui-monospace,monospace';
      ctx.fillText('energy ↓ = falling into the memory', ex, ey - 5);
    }

    ctx.fillStyle = 'rgba(151,163,189,.8)'; ctx.font = '11px -apple-system,sans-serif';
    if (memories === 0) ctx.fillText('Tip: load ☺, hit 🧠 Memorize (do 2–3 patterns), scramble, then Recall.', 12, h - 54);
  });

  caption(body, 'This is genuinely Hopfield\'s 1982 network: 100 spinning "neurons", each wired to every other. Storing a memory strengthens links between neurons that agree — carving a <b>valley</b> in an energy landscape, like water pooling. Scramble the pattern and the network is on a hillside: every neuron flip lowers the energy until it falls back into the nearest valley — the closest memory. Content-addressable, error-healing recall from pure physics. Hinton\'s Boltzmann machine added heat (probabilistic flips) to escape shallow valleys and <i>learn</i> structure — the road to deep learning.');
}
