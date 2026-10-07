/* 2024 Medicine — microRNA: the genome's dimmer switch. */
import { exhibitShell, makeCanvas, slider, button, loop, el, caption, statBox, meter, controlsPanel, TAU, clamp, lerp } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Turn the dimmer, watch the protein flow',
    hint: 'MicroRNAs shred messenger RNAs before they can be read — crank the dial to silence a gene',
  });

  let miLevel = 2;             // 0..10
  let mrnas = [];              // {x,y,v,die,dead,age}
  let mirnas = [];             // {x,y,vx,vy,target}
  let proteins = 0;
  let prodRate = 0;            // smoothed rate
  let rateTick = 0, rateCount = 0;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W: CW, H } = makeCanvas(grid, 400);
  const panel = controlsPanel(grid);

  slider(panel, {
    label: 'microRNA level (lin-4 style)', min: 0, max: 10, step: 1, value: miLevel,
    fmt: v => ['off', 'whisper', 'low', 'low', 'medium', 'medium', 'high', 'high', 'v.high', 'extreme', 'silenced'][v],
    onInput: v => { miLevel = v; }
  });
  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  button(row, '📄 Burst of mRNA', () => { for (let i = 0; i < 6; i++) spawnMrna(true); }, { primary: true });

  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const stProt = statBox(readouts, { label: 'Proteins printed (total)' });
  const stRate = statBox(readouts, { label: 'Print speed' });
  const actM = meter(panel, { label: 'Gene activity (protein output)', color: 'var(--warn)' });

  caption(panel, 'Ambros found that the worm gene lin-4 doesn\'t make a protein — it makes a 22-letter RNA that sticks to another gene\'s messenger RNA and shuts it down. Not a switch: a dimmer. Ruvkun\'s let-7 proved this control layer exists across animals, you included.');

  let W = 800, Hh = 400;
  function spawnMrna(center = false) {
    mrnas.push({ x: center ? W * (0.2 + Math.random() * 0.1) : 40, y: Hh * (0.2 + Math.random() * 0.45), v: 26 + Math.random() * 18, die: 0, wob: Math.random() * TAU });
  }

  loop((dt, t) => {
    W = CW(); Hh = H();
    const w = W, h = Hh;
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);

    /* nucleus */
    ctx.fillStyle = 'rgba(167,139,250,.12)';
    ctx.beginPath(); ctx.arc(30, h * 0.4, 120, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(167,139,250,.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(30, h * 0.4, 120, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(238,242,255,.6)'; ctx.font = '600 11px -apple-system,sans-serif';
    ctx.fillText('nucleus — gene transcribes mRNA', 8, 16);

    /* ribosome station */
    const ribX = w * 0.62;
    ctx.fillStyle = 'rgba(56,189,248,.95)';
    ctx.beginPath(); ctx.arc(ribX, h * 0.40, 26, Math.PI, 0); ctx.fill();
    ctx.fillRect(ribX - 26, h * 0.40, 52, 8);
    ctx.beginPath(); ctx.arc(ribX, h * 0.40 + 20, 19, 0, Math.PI); ctx.fill();
    ctx.fillStyle = 'rgba(238,242,255,.6)'; ctx.font = '600 11px -apple-system,sans-serif';
    ctx.fillText('ribosome printer', ribX - 46, h * 0.40 - 40);

    /* spawn logic */
    if (Math.random() < dt * 1.6) spawnMrna();
    const targetMi = Math.round(miLevel * 2.4);
    while (mirnas.length < targetMi) mirnas.push({ x: w * 0.9, y: Math.random() * h, vx: 0, vy: 0, ph: Math.random() * TAU });
    mirnas.length = Math.min(mirnas.length, targetMi);

    /* mRNAs */
    rateCount = 0;
    for (let i = mrnas.length - 1; i >= 0; i--) {
      const m = mrnas[i];
      if (m.die > 0) {
        m.die += dt * 2.4;
        m.y -= dt * 8;
      } else {
        m.x += m.v * dt;
        m.wob += dt * 3;
        m.y += Math.sin(m.wob) * 22 * dt;
        // printing at ribosome
        if (Math.abs(m.x - ribX) < 8 && Math.abs(m.y - h * 0.43) < 34) {
          proteins++; rateCount++;
        }
      }
      if (m.x > w + 30 || m.die > 1) { mrnas.splice(i, 1); continue; }

      const alpha = m.die > 0 ? Math.max(0, 1 - m.die) : 1;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = m.die > 0 ? '#5d6a86' : '#34d399'; ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let k = -16; k <= 16; k += 2) ctx.lineTo(m.x + k, m.y + Math.sin(k * 0.35 + t * 4 + m.wob) * 3.4);
      ctx.stroke();
      // tail
      ctx.fillStyle = m.die > 0 ? '#5d6a86' : '#34d399';
      ctx.beginPath(); ctx.arc(m.x - 18, m.y, 3, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      if (m.die > 0) { // X mark for degradation
        ctx.strokeStyle = 'rgba(251,113,133,.8)'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x - 6, m.y - 12); ctx.lineTo(m.x + 6, m.y); ctx.moveTo(m.x + 6, m.y - 12); ctx.lineTo(m.x - 6, m.y);
        ctx.stroke();
      }
    }

    /* miRNAs: seek nearest live mRNA, kill on contact */
    for (const mi of mirnas) {
      let tgt = null, bd = 1e9;
      for (const m of mrnas) if (m.die === 0) { const d = (m.x - mi.x) ** 2 + (m.y - mi.y) ** 2; if (d < bd) { bd = d; tgt = m; } }
      if (tgt) {
        const dx = tgt.x - mi.x, dy = tgt.y - mi.y, d = Math.hypot(dx, dy) || 1;
        mi.vx = lerp(mi.vx, dx / d * 70, dt * 2); mi.vy = lerp(mi.vy, dy / d * 70, dt * 2);
        if (d < 12) tgt.die = 0.001;
      } else {
        mi.vx = lerp(mi.vx, Math.cos(t * 0.7 + mi.ph) * 24, dt); mi.vy = lerp(mi.vy, Math.sin(t * 0.9 + mi.ph) * 24, dt);
      }
      mi.x = clamp(mi.x + mi.vx * dt, 6, w - 6); mi.y = clamp(mi.y + mi.vy * dt, 6, h - 6);
      // hairpin shape
      ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mi.x, mi.y, 6, Math.PI * 0.9, Math.PI * 2.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mi.x - 4, mi.y + 4); ctx.lineTo(mi.x - 8, mi.y + 10);
      ctx.moveTo(mi.x + 4, mi.y + 5); ctx.lineTo(mi.x + 9, mi.y + 10); ctx.stroke();
    }

    /* protein counter pile */
    stProt.set(proteins.toLocaleString());
    rateTick += dt;
    if (rateTick > 0.5) { prodRate = lerp(prodRate, rateCount / rateTick, 0.5); rateCount = 0; rateTick = 0; }
    stRate.set(prodRate.toFixed(1) + '/s');
    actM.set(clamp(prodRate / 6, 0, 1));

    /* falling protein dots under ribosome */
    ctx.fillStyle = '#fbbf24';
    const pile = Math.min(proteins, 900);
    for (let i = 0; i < Math.min(pile, 160); i++) {
      const px = ribX + ((i * 53) % 190) - 95 + Math.sin(i) * 6;
      const py = h - 20 - Math.floor((i * 53) / 190) * 12;
      if (py < h * 0.55) break;
      ctx.globalAlpha = 0.5 + (i % 3) * 0.2;
      ctx.beginPath(); ctx.arc(px, py, 3.4, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(238,242,255,.55)'; ctx.font = '10px -apple-system,sans-serif';
    ctx.fillText('protein accumulates here →', ribX + 60, h - 24);
  });

  caption(body, 'Watch what happens at high microRNA levels: messenger RNAs (green) are intercepted and shredded before reaching the printer, so protein output dims — smoothly, not stepwise. Humans have <b>over 1,000 microRNAs</b>, each tuning hundreds of genes; cancers exploit them, and microRNA-based tests and drugs are in trials. A whole hidden volume-control layer, found by two worm geneticists who noticed odd developmental timing.');
}
