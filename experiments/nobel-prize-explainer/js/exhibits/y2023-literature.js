/* 2023 Literature — Jon Fosse: the meaning that lives in the pause. */
import { exhibitShell, makeCanvas, button, toggle, loop, el, caption, controlsPanel, slider, TAU, clamp } from '../kit.js';

const SCENE = [
  { t: 'and he stands by the window', p: 0.0 },
  { t: 'and he looks out at the fjord', p: 0.0 },
  { t: '(pause)', p: 1.0 },
  { t: 'and the rain', p: 0.0 },
  { t: 'yes the rain again', p: 0.0 },
  { t: '(a long pause)', p: 1.6 },
  { t: 'she says: you\'re not listening', p: 0.0 },
  { t: '(silence — everything is said)', p: 2.2 },
  { t: 'he says: yes', p: 0.0 },
  { t: '(pause)', p: 1.0 },
  { t: 'and the fjord is still there', p: 0.0 },
  { t: '(the end, which is not an end)', p: 1.8 },
];

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Hear the silence working',
    hint: 'Advance the scene — feel what the pauses carry. (Lines are an original pastiche in Fosse\'s style.)',
  });

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W, H } = makeCanvas(grid, 400);
  const panel = controlsPanel(grid);

  let idx = -1;
  let pauseT = 0;       // remaining pause time
  let withPauses = true;
  let paused = false;
  let pauseScale = 1;
  const speech = el('div', { style: 'min-height:64px;font-size:1.05rem;color:var(--text);line-height:1.6' }, '');
  const hist = el('div', { style: 'font-size:.85rem;color:var(--faint);line-height:1.7' }, '');
  panel.append(speech, hist);

  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  const nextB = button(row, '▶ Begin the scene', next, { primary: true });
  button(row, '↺ Restart', reset);
  toggle(panel, { label: 'Honour the pauses', on: true, onChange: v => { withPauses = v; } });
  slider(panel, { label: 'Pause weight', min: 0.5, max: 2, step: 0.1, value: 1, fmt: v => '×' + v.toFixed(1), onInput: v => { pauseScale = v; } });

  function reset() {
    idx = -1; hist.textContent = ''; speech.textContent = ''; nextB.textContent = '▶ Begin the scene';
  }
  function next() {
    if (pauseT > 0) pauseT = 0.01; // allow skipping through a pause by clicking
    idx++;
    if (idx >= SCENE.length) { reset(); return; }
    const line = SCENE[idx];
    if (idx > 0) hist.textContent += (hist.textContent ? '  ·  ' : '') + SCENE[idx - 1].t;
    speech.textContent = '“' + line.t + '”';
    speech.style.color = line.p > 0 ? 'var(--faint)' : 'var(--text)';
    speech.style.fontStyle = line.p > 0 ? 'italic' : 'normal';
    if (line.p > 0 && withPauses) pauseT = line.p * 2.4 * pauseScale;
    nextB.textContent = idx === SCENE.length - 1 ? 'Finish' : 'Continue →';
  }

  loop((dt, t) => {
    const w = W(), h = H();
    paused = pauseT > 0;
    pauseT = Math.max(0, pauseT - dt);

    // dusk fjord
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0a1020'); sky.addColorStop(0.55, '#0d1526'); sky.addColorStop(1, '#05070d');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // slow fjord water lines
    const waterTop = h * 0.55;
    for (let l = 0; l < 5; l++) {
      ctx.strokeStyle = `rgba(125,211,252,${0.05 + l * 0.025})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const y0 = waterTop + l * (h - waterTop) / 5;
      for (let x = 0; x <= w; x += 8) {
        ctx.lineTo(x, y0 + Math.sin(x * 0.015 + t * (0.3 + l * 0.12) + l * 2) * (3 + l * 2));
      }
      ctx.stroke();
    }

    // distant shore silhouette
    ctx.fillStyle = 'rgba(5,8,15,.8)';
    ctx.beginPath(); ctx.moveTo(0, waterTop);
    for (let x = 0; x <= w; x += 40) ctx.lineTo(x, waterTop - 26 - Math.sin(x * 0.006 + 2) * 18);
    ctx.lineTo(w, waterTop); ctx.closePath(); ctx.fill();

    // pale window light (the household)
    const lw = 120, lh = 90, lx = w * 0.72, ly = waterTop - lh - 50;
    ctx.fillStyle = paused ? 'rgba(232,197,104,.14)' : 'rgba(232,197,104,.07)';
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = 'rgba(232,197,104,.3)';
    ctx.strokeRect(lx, ly, lw, lh);
    ctx.beginPath(); ctx.moveTo(lx + lw / 2, ly); ctx.lineTo(lx + lw / 2, ly + lh);
    ctx.moveTo(lx, ly + lh / 2); ctx.lineTo(lx + lw, ly + lh / 2); ctx.stroke();

    // THE PAUSE visual: breathing ring at center during pauses
    if (paused) {
      const prog = 1 - pauseT / 4.8;
      const r = 30 + Math.sin(t * 1.2) * 10 + prog * 80;
      ctx.strokeStyle = `rgba(251,191,36,${clamp(0.5 - pauseT * 0.06, 0.12, 0.5)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(w / 2, h * 0.34, r, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(w / 2, h * 0.34, r * 0.6, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(251,191,36,.9)';
      ctx.font = '600 13px ui-serif,serif'; ctx.textAlign = 'center';
      ctx.fillText('. . .', w / 2, h * 0.34 + 4);
      ctx.font = '11px -apple-system,sans-serif';
      ctx.fillStyle = 'rgba(151,163,189,.8)';
      ctx.fillText('the silence is speaking — click to skip', w / 2, h * 0.34 + 74);
      ctx.textAlign = 'left';
    } else if (idx < 0) {
      ctx.fillStyle = 'rgba(238,242,255,.75)';
      ctx.font = '600 15px ui-serif,serif'; ctx.textAlign = 'center';
      ctx.fillText('a fjord. a window. two people, and everything unsaid.', w / 2, h * 0.32);
      ctx.textAlign = 'left';
    }
  });

  caption(body, 'Fosse\'s stage directions famously read <b>pause</b>, <b>long silence</b> — and the silence delivers the lines the words can\'t. Turn off "honour the pauses" and re-read the scene: the information is identical, and the meaning is gone. That disappearance is the whole aesthetic of "Fosse minimalism": the unsayable, carried by hesitation, repetition and quiet.');
}
