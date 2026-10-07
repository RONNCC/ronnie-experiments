/* 2023 Medicine — mRNA vaccines: a recipe card in a fat bubble + the base-swap tweak. */
import { exhibitShell, makeCanvas, button, toggle, loop, el, caption, meter, controlsPanel, TAU, clamp, lerp } from '../kit.js';

const STAGES = [
  { n: 'Package the recipe', d: 'A strip of mRNA — the spike-protein recipe — is folded into a lipid nanoparticle, a fat bubble ~100 nm wide that protects it in the bloodstream.' },
  { n: 'Deliver into a cell', d: 'The bubble fuses with a cell membrane and slips the mRNA inside. Nothing enters the nucleus; your DNA is never touched.' },
  { n: 'Print the protein', d: 'Ribosomes — the cell\'s printers — read the recipe and manufacture harmless spike proteins, exactly as they would from a viral invader.' },
  { n: 'Show the flag', d: 'The cell displays spike pieces on its surface like a "wanted" poster.' },
  { n: 'Train the immune system', d: 'Antibodies and T-cells learn the shape. The mRNA degrades within days — the training memory lasts for years.' },
];

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'The vaccine that ships a recipe',
    hint: 'Step through the journey — then try the chemical tweak that made it possible',
  });

  let stage = 0, modified = true;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W, H } = makeCanvas(grid, 380);
  const panel = controlsPanel(grid);

  const stageLabel = el('div', { class: 'chip-note', style: '--cat:#fb7185' }, `Stage 1 of 5 · ${STAGES[0].n}`);
  panel.append(stageLabel);
  panel.append(el('p', { style: 'font-size:.82rem;color:var(--muted)', id: 'stageDesc' }, STAGES[0].d));

  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  const prevB = button(row, '← Back', () => setStage(stage - 1));
  const nextB = button(row, 'Next →', () => setStage(stage + 1), { primary: true });
  function setStage(s) {
    stage = clamp(s, 0, STAGES.length - 1);
    stageLabel.textContent = `Stage ${stage + 1} of 5 · ${STAGES[stage].n}`;
    panel.querySelector('#stageDesc').textContent = STAGES[stage].d;
    prevB.disabled = stage === 0; nextB.disabled = stage === STAGES.length - 1;
  }
  setStage(0);

  panel.append(el('hr', { style: 'border:none;border-top:1px solid var(--border-soft);margin:.4rem 0' }));
  toggle(panel, { label: 'Karikó–Weissman tweak: swap uridine → pseudouridine (Ψ)', on: modified, onChange: v => { modified = v; } });
  const alarmM = meter(panel, { label: 'Cell\'s virus alarm', color: 'var(--bad)' });
  const proteinM = meter(panel, { label: 'Spike protein printed', color: 'var(--warn)' });
  caption(panel, 'Unmodified mRNA trips the cell\'s alarm (left) and gets shredded — little protein, lots of inflammation. Pseudouridine is a letter your body uses itself: alarm stays quiet, the printer keeps printing. That single-letter swap is the 2023 Nobel.');

  let alarm = 0, protein = 0;

  loop((dt, t) => {
    alarm = lerp(alarm, modified ? 0.12 : 0.9, dt * 2);
    protein = lerp(protein, modified ? 0.95 : 0.25, dt * 2);
    alarmM.set(alarm); proteinM.set(protein);

    const w = W(), h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
    const cx = w * 0.5, cy = h * 0.52;

    const drawBubble = (x, y, r, pop = 1) => {
      // lipid nanoparticle: ring of fats
      ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2;
      ctx.globalAlpha = pop;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU + t * 0.3;
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 3, 0, TAU); ctx.fill();
      }
      // mRNA inside
      ctx.strokeStyle = modified ? '#34d399' : '#fb7185'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) {
        const px = x - r * 0.6 + (k / 40) * r * 1.2;
        const py = y + Math.sin(k * 0.5 + t * 2) * r * 0.28;
        k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    const drawCell = (x, y, r, spikes = 0) => {
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(167,139,250,.06)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      // nucleus
      ctx.fillStyle = 'rgba(167,139,250,.35)';
      ctx.beginPath(); ctx.arc(x - r * 0.3, y + r * 0.2, r * 0.22, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(21,29,49,.9)'; ctx.font = '10px ui-monospace,monospace';
      ctx.fillText('DNA', x - r * 0.3 - 10, y + r * 0.2 + 3);
      // spikes on surface
      for (let i = 0; i < spikes; i++) {
        const a = -Math.PI / 2 + (i - (spikes - 1) / 2) * 0.4;
        const bx = x + Math.cos(a) * r, by = y + Math.sin(a) * r;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(a) * 16, by + Math.sin(a) * 16); ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(bx + Math.cos(a) * 19, by + Math.sin(a) * 19, 4, 0, TAU); ctx.fill();
      }
    };
    const drawRibosome = (x, y) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.arc(x, y - 8, 16, Math.PI, 0); ctx.fill();
      ctx.fillRect(x - 16, y - 8, 32, 5);
      ctx.beginPath(); ctx.arc(x, y + 8, 12, 0, Math.PI); ctx.fill();
    };
    const drawAntibody = (x, y, a) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 0);
      ctx.moveTo(0, 0); ctx.lineTo(-7, -8); ctx.moveTo(0, 0); ctx.lineTo(7, -8);
      ctx.stroke(); ctx.restore();
    };
    const strand = (x1, x2, y, amp = 8) => {
      ctx.strokeStyle = modified ? '#34d399' : '#fb7185'; ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) {
        const px = x1 + (k / 60) * (x2 - x1);
        const py = y + Math.sin(k * 0.4 + t * 3) * amp;
        k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      if (!modified && Math.random() < 0.25) { // alarm flares shredding the strand
        ctx.fillStyle = 'rgba(251,113,133,.8)';
        const fx = x1 + Math.random() * (x2 - x1);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; ctx.lineTo(fx + Math.cos(a) * (3 + Math.random() * 6), y + Math.sin(a) * (3 + Math.random() * 6)); }
        ctx.fill();
      }
    };

    if (stage === 0) {
      const x = lerp(w * 0.2, w * 0.5, 0.5 + 0.5 * Math.sin(t * 0.7));
      drawBubble(x, cy, 34);
      caption_(w, h, 'the fat bubble ferries the fragile recipe through the blood');
    } else if (stage === 1) {
      drawCell(w * 0.66, cy, 90);
      const x = lerp(w * 0.15, w * 0.5, (Math.sin(t * 0.9) + 1) / 2);
      drawBubble(x, cy, 30, x < w * 0.5 ? 1 : 0.15);
      if (x > w * 0.48) strand(w * 0.52, w * 0.62, cy - 20, 5);
      caption_(w, h, 'the bubble merges with the membrane and spills the recipe inside');
    } else if (stage === 2) {
      drawCell(cx, cy, 110);
      strand(cx - 70, cx + 70, cy + 6, 4);
      drawRibosome(cx + Math.sin(t * 2) * 34, cy + 6);
      // growing protein chain
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.4;
      ctx.beginPath();
      const n = (t * 6) % 18;
      for (let i = 0; i < n; i++) ctx.lineTo(cx + Math.sin(t * 2) * 34 + i * 6, cy - 30 - i * 3 + Math.sin(i + t * 4) * 3);
      ctx.stroke();
      caption_(w, h, modified ? 'tweaked letters cruise past the alarms — the printer runs at full speed' : 'unmodified mRNA gets shredded — the printer starves');
    } else if (stage === 3) {
      const n = modified ? 7 : 2;
      drawCell(cx, cy, 100, n);
      caption_(w, h, 'spike fragments ride to the surface — practise targets, not the virus itself');
    } else {
      drawCell(cx, cy, 100, modified ? 7 : 2);
      const count = modified ? 8 : 2;
      for (let i = 0; i < count; i++) {
        const a = t * 0.8 + (i / count) * TAU;
        drawAntibody(cx + Math.cos(a) * 150, cy + Math.sin(a) * 95, a + Math.PI / 2);
      }
      caption_(w, h, 'antibodies patrol and learn the shape — immune memory is formed');
    }

    function caption_(w, h, txt) {
      ctx.fillStyle = 'rgba(151,163,189,.85)'; ctx.font = '12px -apple-system,sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(txt, w / 2, h - 14); ctx.textAlign = 'left';
    }
  });
}
