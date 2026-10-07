/* 2025 Chemistry — MOFs: build a molecular scaffold, then harvest water from desert air. */
import { exhibitShell, makeCanvas, button, slider, toggle, loop, el, caption, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Molecular Tinkertoys & the desert water trick',
    hint: 'Part 1: snap metals and struts into a framework. Part 2: run the desert machine.',
  });

  /* ================= PART 1 — framework builder ================= */
  const grid1 = el('div', { class: 'sim-grid side' });
  body.append(grid1);
  const b1 = makeCanvas(grid1, 320);
  const panel1 = controlsPanel(grid1);

  let strut = 1; // 1 or 2 = pore size
  const placed = new Set(); // "x,y" lattice nodes
  const st2read = el('div', { class: 'readout' });
  panel1.append(st2read);
  const st1 = statBox(st2read, { label: 'Metal nodes placed' });
  const stSA = statBox(st2read, { label: 'Internal surface / gram' });

  const row1 = el('div', { class: 'btn-row' });
  panel1.append(row1);
  button(row1, '✨ Auto-assemble', () => {
    const [nx, ny] = latticeSize();
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) placed.add(x + ',' + y);
  }, { primary: true });
  button(row1, '🧹 Clear', () => placed.clear());
  slider(panel1, { label: 'Strut length → pore size', min: 1, max: 2, step: 1, value: strut, fmt: v => v === 1 ? 'tight pores' : 'big channels', onInput: v => { strut = v; placed.clear(); } });
  caption(panel1, 'Metal "joints" + rigid organic "struts" self-assemble into open cages — that\'s Robson\'s 1989 trick. Click empty intersections to add a metal node; struts appear automatically wherever two metals meet. Watch the surface area: real MOFs reach ~7,000 m² per gram.');

  function latticeSize() {
    const gx = strut === 1 ? 8 : 5, gy = strut === 1 ? 5 : 4;
    return [gx, gy];
  }

  b1.wrap.style.cursor = 'pointer';
  b1.wrap.addEventListener('pointerdown', (e) => {
    const r = b1.wrap.getBoundingClientRect();
    const [nx, ny] = latticeSize();
    const cell = Math.min(r.width / (nx + 1), b1.H() / (ny + 1));
    const ox = (r.width - cell * (nx - 1)) / 2, oy = (b1.H() - cell * (ny - 1)) / 2;
    const gx = Math.round((e.clientX - r.left - ox) / cell), gy = Math.round((e.clientY - r.top - oy) / cell);
    if (gx >= 0 && gx < nx && gy >= 0 && gy < ny) {
      const k = gx + ',' + gy;
      placed.has(k) ? placed.delete(k) : placed.add(k);
    }
  });

  /* ================= PART 2 — water harvester ================= */
  body.append(el('hr', { style: 'border:none;border-top:1px solid var(--border-soft);margin:1.5rem 0' }));
  const grid2 = el('div', { class: 'sim-grid side' });
  body.append(grid2);
  const b2 = makeCanvas(grid2, 300);
  const panel2 = controlsPanel(grid2);

  let night = true;
  let fill = 0.1;           // MOF saturation 0..1
  let harvested = 0;        // mL collected
  const drips = [];
  toggle(panel2, { label: night ? '🌙 Night — cool, adsorb water' : '☀️ Day — sunlight releases it', on: !night, onChange: v => { night = !v; } });
  const rd2 = el('div', { class: 'readout' }); panel2.append(rd2);
  const stF = statBox(rd2, { label: 'MOF saturation' });
  const stH = statBox(rd2, { label: 'Water collected today' });
  caption(panel2, 'Yaghi\'s desert harvester: at night the MOF pores sponge up moisture even from bone-dry air; at dawn sunlight warms the crystals and the water sweats out — condensed into a jar. No electricity needed; demonstrated making drinking water in the Mojave Desert. Flip the switch to run the cycle.');

  const mols = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), stuck: false, ph: Math.random() * TAU }));

  loop((dt, t) => {
    /* ---------- draw part 1 ---------- */
    {
      const { ctx } = b1; const w = b1.W(), h = b1.H();
      ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
      const [nx, ny] = latticeSize();
      const cell = Math.min(w / (nx + 1), h / (ny + 1));
      const ox = (w - cell * (nx - 1)) / 2, oy = (h - cell * (ny - 1)) / 2;
      const at = (gx, gy) => [ox + gx * cell, oy + gy * cell];

      // pores glow (2x2 complete squares)
      for (let y = 0; y < ny - 1; y++) for (let x = 0; x < nx - 1; x++) {
        if (placed.has(x + ',' + y) && placed.has((x + 1) + ',' + y) && placed.has(x + ',' + (y + 1)) && placed.has((x + 1) + ',' + (y + 1))) {
          const [ax, ay] = at(x, y);
          ctx.fillStyle = 'rgba(52,211,153,.10)';
          ctx.beginPath(); ctx.roundRect(ax + cell * 0.12, ay + cell * 0.12, cell * 0.76, cell * 0.76, 8); ctx.fill();
          ctx.strokeStyle = 'rgba(52,211,153,.35)'; ctx.setLineDash([3, 4]);
          ctx.stroke(); ctx.setLineDash([]);
        }
      }
      // struts
      ctx.lineWidth = cell * 0.09; ctx.lineCap = 'round';
      for (const k of placed) {
        const [x, y] = k.split(',').map(Number);
        for (const [dx, dy] of [[1, 0], [0, 1]]) {
          if (placed.has((x + dx) + ',' + (y + dy))) {
            const [ax, ay] = at(x, y), [bx, by] = at(x + dx, y + dy);
            ctx.strokeStyle = 'rgba(125,211,252,.75)';
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          }
        }
      }
      // nodes
      for (const k of placed) {
        const [x, y] = k.split(',').map(Number);
        const [ax, ay] = at(x, y);
        const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, cell * 0.3);
        g.addColorStop(0, 'rgba(251,191,36,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ax, ay, cell * 0.3, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(ax, ay, cell * 0.14, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1; ctx.stroke();
      }
      // empty lattice hints
      for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
        if (placed.has(x + ',' + y)) continue;
        const [ax, ay] = at(x, y);
        ctx.fillStyle = 'rgba(93,106,134,.35)';
        ctx.beginPath(); ctx.arc(ax, ay, 3, 0, TAU); ctx.fill();
      }
      st1.set(String(placed.size));
      stSA.set(placed.size === 0 ? '0 m²' : '~' + Math.round(placed.size * 62 * (strut === 1 ? 1 : 1.6)) + ' m² (scale model — real: 7,000)');
    }

    /* ---------- draw part 2 ---------- */
    {
      const { ctx } = b2; const w = b2.W(), h = b2.H();
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      if (night) { sky.addColorStop(0, '#0a1024'); sky.addColorStop(1, '#05070d'); }
      else { sky.addColorStop(0, '#1b2b4a'); sky.addColorStop(1, '#0a1220'); }
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

      // sun / moon
      if (night) {
        ctx.fillStyle = 'rgba(226,232,255,.8)';
        ctx.beginPath(); ctx.arc(w * 0.85, 40, 14, 0, TAU); ctx.fill();
      } else {
        const sg = ctx.createRadialGradient(w * 0.85, 40, 0, w * 0.85, 40, 60);
        sg.addColorStop(0, 'rgba(251,191,36,.95)'); sg.addColorStop(1, 'rgba(251,191,36,0)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(w * 0.85, 40, 60, 0, TAU); ctx.fill();
      }

      // ground + device
      ctx.fillStyle = '#141a2c'; ctx.fillRect(0, h - 40, w, 40);
      const devX = w * 0.5, devY = h - 40, devW = Math.min(320, w * 0.55), devH = 86;
      // MOF slab
      ctx.fillStyle = 'rgba(52,211,153,.12)';
      ctx.beginPath(); ctx.roundRect(devX - devW / 2, devY - devH, devW, devH - 20, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(52,211,153,.4)'; ctx.stroke();
      // honeycomb texture + saturation
      for (let i = 0; i < 60; i++) {
        const hx = devX - devW / 2 + 10 + (i % 15) * (devW - 20) / 15;
        const hy = devY - devH + 10 + Math.floor(i / 15) * 16;
        ctx.strokeStyle = 'rgba(125,211,252,.3)';
        ctx.beginPath(); ctx.arc(hx, hy, 5, 0, TAU); ctx.stroke();
      }
      // saturation fill
      ctx.save(); ctx.beginPath(); ctx.roundRect(devX - devW / 2, devY - devH, devW, devH - 20, 8); ctx.clip();
      ctx.fillStyle = 'rgba(56,189,248,.28)';
      ctx.fillRect(devX - devW / 2, devY - 20 - (devH - 20) * fill, devW, (devH - 20) * fill);
      ctx.restore();
      // jar
      ctx.strokeStyle = 'rgba(238,242,255,.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(devX - 40, devY - 18); ctx.lineTo(devX - 40, devY); ctx.lineTo(devX + 40, devY); ctx.lineTo(devX + 40, devY - 18); ctx.stroke();
      ctx.fillStyle = 'rgba(56,189,248,.5)';
      const jh = clamp(harvested / 60, 0, 1) * 16;
      ctx.fillRect(devX - 39, devY - jh, 78, jh);

      // molecules
      for (const m of mols) {
        let x = m.x * w, y = 40 + m.y * (devY - devH - 60);
        if (!night && fill > 0.02) {
          // released: drift toward slab exit then drip
          y = lerp(y, devY - devH - 6, dt * 0.6);
          if (Math.random() < dt * 0.5) drips.push({ x: devX + (Math.random() - 0.5) * devW * 0.7, y: devY - 22, v: 0 });
        } else if (night && fill < 1) {
          // adsorb toward slab
          const ty = devY - devH + 10;
          if (y < ty - 4) m.y += (devY / h) * dt * 0.05; else if (Math.random() < dt * 0.8) fill = Math.min(1, fill + 0.004);
          m.x += Math.sin(t * 1.3 + m.ph) * dt * 0.03;
          y = Math.min(y, ty - 2);
        } else {
          m.x += Math.sin(t * 1.1 + m.ph) * dt * 0.02;
        }
        // vapour wiggles
        x = m.x * w + Math.cos(t * 1.5 + m.ph) * 6;
        ctx.strokeStyle = 'rgba(147,197,253,.85)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x - 3.5, y, 3, 0, TAU);
        ctx.moveTo(x + 6.5, y + 3);
        ctx.arc(x + 3.5, y, 3, 0, TAU);
        ctx.stroke();
      }
      // physics of fill
      if (night) fill = clamp(fill + dt * 0.03 * (1 - fill), 0, 1);
      else {
        fill = clamp(fill - dt * 0.06, 0, 1);
        if (fill > 0.35 && Math.random() < dt * 2) drips.push({ x: devX + (Math.random() - 0.5) * devW * 0.7, y: devY - 22, v: 0 });
      }
      // drips
      for (let i = drips.length - 1; i >= 0; i--) {
        const d = drips[i];
        d.v += 320 * dt; d.y += d.v * dt;
        if (d.y > devY - 2) { drips.splice(i, 1); harvested = Math.min(60, harvested + 1.5); continue; }
        ctx.fillStyle = 'rgba(147,197,253,.9)';
        ctx.beginPath(); ctx.ellipse(d.x, d.y, 2.4, 4, 0, 0, TAU); ctx.fill();
      }

      ctx.fillStyle = 'rgba(238,242,255,.75)'; ctx.font = '600 12px -apple-system,sans-serif';
      ctx.fillText(night ? '🌙 air is dry (<20% humidity) yet the MOF sponge fills…' : '☀️ sunlight warms the crystal — water sweats out into the jar', 12, 20);
      stF.set(Math.round(fill * 100) + '%');
      stH.set(harvested.toFixed(1) + ' mL');
    }
  });

  caption(body, 'The 2025 laureates didn\'t just make one sponge — they made <b>sponge-building a discipline</b> ("reticular chemistry"). Swap strut length, metal, or surface chemistry and the pores become bespoke: grab CO₂ from flue gas, store hydrogen, hold toxic gases, catalyse reactions. Kitagawa showed the frameworks must "breathe" with their guests; Yaghi made them indestructible and industrial.');
}
