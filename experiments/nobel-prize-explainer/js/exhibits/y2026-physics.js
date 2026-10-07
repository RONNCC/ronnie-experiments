/* 2026 Physics — IceCube: catch a ghost particle in a cubic kilometre of Antarctic ice. */
import { exhibitShell, makeCanvas, button, slider, loop, el, caption, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Ghost hunting in a glacier',
    hint: 'Launch neutrinos into the ice and watch 5,160 frozen eyes catch the blue flash',
  });

  let energy = 0.6;     // 0..1 scale
  let event = null;     // {type, x0,y0, ang, t}
  const doms = [];
  const photons = [];   // expanding cherenkov photons for flavor
  let hits = 0, total = 0;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W: CW, H } = makeCanvas(grid, 400);
  const panel = controlsPanel(grid);

  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  button(row, '🎯 Launch muon neutrino', () => launch('muon'), { primary: true, title: 'A muon track: a long straight streak of light' });
  button(row, '💥 Launch electron neutrino', () => launch('cascade'), { title: 'A cascade: a glowing blob instead of a track' });
  slider(panel, { label: 'Neutrino energy', min: 0.2, max: 1, step: 0.05, value: energy, fmt: v => (v * 500).toFixed(0) + ' TeV', onInput: v => { energy = v; } });
  const rd = el('div', { class: 'readout' }); panel.append(rd);
  const stHits = statBox(rd, { label: 'DOMs that saw light (this event)' });
  const stTot = statBox(rd, { label: 'Photons detected' });

  caption(panel, 'IceCube is a cubic kilometre of ultra-clear glacier ice, 1.5–2.5 km under the South Pole, threaded with 86 cables holding 5,160 basketball-sized light sensors. A neutrino striking the ice spawns a particle that outruns light <i>in the ice</i>, radiating a blue Cherenkov cone. Timing which sensors light up — and in what order — reconstructs the track back to its cosmic source. In 2013 it found the first high-energy neutrinos from deep space; in 2017 one was traced to a flaring blazar.');

  // DOM strings layout
  function layout(w, h) {
    doms.length = 0;
    const nx = 9, ny = 7;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      doms.push({ x: ((i + 0.5 + (j % 2) * 0.3) / nx) * w * 0.94 + w * 0.02, y: h * 0.16 + (j + 0.5) / ny * h * 0.74, lit: 0, ph: Math.random() * TAU });
    }
  }

  function launch(type) {
    const ang = -Math.PI * (0.18 + Math.random() * 0.2); // travelling up-left through the ice (came through Earth)
    event = { type, x: 0.86 + Math.random() * 0.06, y: 0.94, ang, t: 0, len: 0.75 + energy * 0.9, done: false };
    for (const d of doms) d.lit = 0;
    hits = 0; total = 0;
    stHits.set('0'); stTot.set('0');
  }

  let laidW = 0, laidH = 0;
  loop((dt, t) => {
    const w = CW(), h = H();
    if (w !== laidW || h !== laidH) { layout(w, h); laidW = w; laidH = h; }

    /* ice */
    const ice = ctx.createLinearGradient(0, 0, 0, h);
    ice.addColorStop(0, '#071426'); ice.addColorStop(0.3, '#04101f'); ice.addColorStop(1, '#02080f');
    ctx.fillStyle = ice; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(226,240,255,.55)'; ctx.font = '600 11px -apple-system,sans-serif';
    ctx.fillText('SURFACE — South Pole station', 12, h * 0.075);
    ctx.strokeStyle = 'rgba(226,240,255,.3)'; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(0, h * 0.10); ctx.lineTo(w, h * 0.10); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(125,211,252,.5)'; ctx.font = '10px ui-monospace,monospace';
    ctx.fillText('depth ~2 km · darkest, clearest ice on Earth', 12, h - 10);

    /* strings + DOMs */
    ctx.strokeStyle = 'rgba(148,163,184,.16)';
    for (let i = 0; i < 9; i++) {
      const x = ((i + 0.65) / 9) * w * 0.94 + w * 0.02;
      ctx.beginPath(); ctx.moveTo(x, h * 0.10); ctx.lineTo(x, h * 0.92); ctx.stroke();
    }
    for (const d of doms) {
      d.lit = Math.max(0, d.lit - dt * 0.7);
      if (d.lit > 0.02) {
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 34 * d.lit);
        g.addColorStop(0, `rgba(96,165,250,${0.75 * d.lit})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, 34 * d.lit, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = d.lit > 0.05 ? '#dbeafe' : '#1f2c45';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.lit > 0.05 ? 4 : 3, 0, TAU); ctx.fill();
    }

    /* event */
    if (event) {
      event.t += dt * 0.55;
      const E = event;
      if (E.type === 'muon') {
        // head position
        const dist = event.t * 1.1;
        const hx = (E.x + Math.cos(E.ang) * dist) , hy = (E.y + Math.sin(E.ang) * dist);
        const hxPx = hx * w, hyPx = hy * h;
        // track fades with distance beyond len
        const tailT = clamp((dist - E.len) * 2, 0, 1);
        const tx = E.x * w, ty = E.y * h;
        // glowy line
        const grad = ctx.createLinearGradient(tx, ty, hxPx, hyPx);
        grad.addColorStop(0, 'rgba(96,165,250,0)');
        grad.addColorStop(clamp(1 - tailT - 0.15, 0, 1), 'rgba(147,197,253,.9)');
        grad.addColorStop(1, 'rgba(219,234,254,1)');
        ctx.strokeStyle = grad; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
        ctx.shadowColor = '#60a5fa'; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hxPx, hyPx); ctx.stroke();
        ctx.shadowBlur = 0;
        // cherenkov cone wisp
        ctx.fillStyle = 'rgba(96,165,250,.07)';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hxPx - Math.cos(E.ang - 0.7) * 120, hyPx - Math.sin(E.ang - 0.7) * 120);
        ctx.lineTo(hxPx - Math.cos(E.ang + 0.7) * 120, hyPx - Math.sin(E.ang + 0.7) * 120);
        ctx.closePath(); ctx.fill();
        // light DOMs near track portion already travelled
        for (const d of doms) {
          // distance from track line
          const dx = Math.cos(E.ang), dy = Math.sin(E.ang);
          const rx = d.x - tx, ry = d.y - ty;
          const proj = (rx * dx + ry * dy) / w; // in track units
          if (proj < 0 || proj > dist || proj > E.len * 1.15) continue;
          const perp = Math.abs(rx * dy - ry * dx);
          if (perp < 22) {
            if (d.lit < 0.5 && Math.abs(proj - dist) < 0.06) {
              if (d.lit === 0) { hits++; stHits.set(String(hits)); }
              d.lit = 1;
              total += Math.round(20 + energy * 160 * Math.random());
              stTot.set(total.toLocaleString());
              for (let k = 0; k < 3; k++) photons.push({ x: d.x, y: d.y, a: Math.random() * TAU, v: 40 + Math.random() * 60, life: 1 });
            }
          }
        }
        if (hyPx < -40 || hxPx < -80 || event.t > 3.2) event.done = true;
      } else {
        // cascade: expanding blob
        const r = 8 + event.t * 130 * (0.6 + energy);
        const cx = E.x * w, cy = E.y * h - r * 0.15;
        const alpha = clamp(1.4 - event.t * 0.55, 0, 1);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(191,219,254,${0.85 * alpha})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
        for (const d of doms) {
          const dd = Math.hypot(d.x - cx, d.y - cy);
          if (Math.abs(dd - r) < 26 && d.lit === 0) {
            d.lit = 1; hits++; stHits.set(String(hits));
            total += Math.round(15 + energy * 120 * Math.random()); stTot.set(total.toLocaleString());
          }
        }
        if (alpha <= 0.05) event.done = true;
      }
      if (event.done) event = null;
    }

    /* photon sparkles */
    for (let i = photons.length - 1; i >= 0; i--) {
      const p = photons[i];
      p.life -= dt * 1.4;
      if (p.life <= 0) { photons.splice(i, 1); continue; }
      p.x += Math.cos(p.a) * p.v * dt; p.y += Math.sin(p.a) * p.v * dt;
      ctx.fillStyle = `rgba(191,219,254,${p.life})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, TAU); ctx.fill();
    }

    if (!event && total === 0) {
      ctx.fillStyle = 'rgba(238,242,255,.55)'; ctx.font = '600 13px -apple-system,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('the ice is dark… trillions of neutrinos pass through every second, unseen', w / 2, h * 0.45);
      ctx.fillText('launch one to see the flash', w / 2, h * 0.45 + 20);
      ctx.textAlign = 'left';
    }
  });
}
