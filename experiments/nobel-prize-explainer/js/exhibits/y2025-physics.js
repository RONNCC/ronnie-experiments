/* 2025 Physics — Macroscopic quantum tunnelling: the phase particle in a tilted washboard (Josephson junction). */
import { exhibitShell, makeCanvas, button, slider, toggle, loop, el, caption, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Escape through the wall',
    hint: 'A ball of electricity trapped in a dip. Classically it needs enough energy to climb out. Quantumly? It just… leaves.',
  });

  let quantum = true;
  let tilt = 0.55;          // bias current, 0..0.98
  let phi = -0.8;           // phase ball position (domain -1.6..1.6)
  let vel = 0;
  let escaped = { tunnel: 0, over: 0 };
  let announce = null;      // {txt, col, ttl}
  let rungs = true;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W: CW, H } = makeCanvas(grid, 400);
  const panel = controlsPanel(grid);

  toggle(panel, { label: 'Quantum rules (OFF = classical)', on: quantum, onChange: v => { quantum = v; } });
  slider(panel, {
    label: 'Bias current (tilts the washboard; helps escape)', min: 0.2, max: 0.98, step: 0.01, value: tilt,
    fmt: v => Math.round(v * 100) + '% of critical', onInput: v => { tilt = v; }
  });
  toggle(panel, { label: 'Show quantized energy rungs', on: rungs, onChange: v => { rungs = v; } });
  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  button(row, '↺ Drop the ball again', () => { phi = -0.8; vel = 0; });

  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const stTun = statBox(readouts, { label: 'Escapes THROUGH the wall' });
  const stOver = statBox(readouts, { label: 'Escapes OVER the wall' });

  caption(panel, 'In their 1980s experiments, Clarke, Devoret and Martinis trapped the "phase" of a superconducting circuit in an energy dip shaped like a washboard — then counted how often it escaped. Classical physics said escape should wait until the tilt wiped the dip away, or the ball got hot enough to climb out. Instead the circuit kept leaving early, <b>through</b> the barrier — tunnelling, by a "particle" made of billions of electrons acting as one. And absorbed microwaves only in exact lumps (the rungs): energy quantisation in a hand-built circuit. Those rungs are today\'s superconducting qubits.');

  /* potential: V(phi) = -(cos(pi*phi) + tilt * pi * phi) — dip around phi≈-0.5→ escape over right side */
  const V = (x) => -(Math.cos(Math.PI * x) + tilt * Math.PI * x * 0.45);
  const dV = (x) => (V(x + 1e-3) - V(x - 1e-3)) / 2e-3;

  function doEscape(kind) {
    escaped[kind]++;
    stTun.set(String(escaped.tunnel));
    stOver.set(String(escaped.over));
    announce = { txt: kind === 'tunnel' ? '⚡ TUNNELLED THROUGH THE BARRIER' : '🔥 CLIMBED OVER THE BARRIER', col: kind === 'tunnel' ? '#34d399' : '#fbbf24', ttl: 1.6 };
    phi = -0.8; vel = 0;
  }

  let w = 800, h = 400;
  const xMin = -1.6, xMax = 1.6;
  const xOf = (x) => 30 + ((x - xMin) / (xMax - xMin)) * (w - 60);
  // compute y-range for V
  function yRange() {
    let mn = 1e9, mx = -1e9;
    for (let i = 0; i <= 100; i++) { const x = xMin + (xMax - xMin) * i / 100; const v = V(x); mn = Math.min(mn, v); mx = Math.max(mx, v); }
    return [mn, mx];
  }

  loop((dt, t) => {
    w = CW(); h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
    const [vMn, vMx] = yRange();
    const yOf = (v) => h - 50 - ((v - vMn) / (vMx - vMn)) * (h - 120);

    /* landscape */
    ctx.strokeStyle = '#93a5ff'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (xMax - xMin) * i / 200;
      const X = xOf(x), Y = yOf(V(x));
      i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(147,165,255,.07)';
    ctx.lineTo(xOf(xMax), h - 30); ctx.lineTo(xOf(xMin), h - 30); ctx.closePath(); ctx.fill();

    /* rungs inside the well: find local min around -0.45 area */
    let wellX = -0.5;
    for (let i = -150; i <= 50; i++) { const x = i / 100; if (V(x) < V(wellX)) wellX = x; }
    const v0 = V(wellX);
    if (rungs) {
      for (let k = 0; k < 3; k++) {
        const lvl = v0 + (k + 0.5) * 0.55;
        if (lvl > v0 + 2.2) break;
        // width of well at this level: solve V(x)=lvl near well
        let xl = wellX, xr = wellX;
        for (let x = wellX; x > xMin; x -= 0.01) { if (V(x) > lvl) { xl = x; break; } }
        for (let x = wellX; x < xMax; x += 0.01) { if (V(x) > lvl) { xr = x; break; } }
        ctx.strokeStyle = `rgba(232,197,104,${0.75 - k * 0.2})`; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(xOf(xl), yOf(lvl)); ctx.lineTo(xOf(xr), yOf(lvl)); ctx.stroke();
        ctx.fillStyle = 'rgba(232,197,104,.7)'; ctx.font = '10px ui-monospace,monospace';
        ctx.fillText('|' + k + '⟩', xOf(xr) + 4, yOf(lvl) + 3);
      }
    }

    /* ball physics (overdamped wiggle + escape rules) */
    vel += (-dV(phi) * 3 - vel * 2.4) * dt + (Math.random() - 0.5) * dt * 3;
    // confine: soft reflect at edges except past barrier top to the right
    phi += vel * dt;
    if (phi < xMin + 0.05) { phi = xMin + 0.05; vel = Math.abs(vel) * 0.5; }

    // barrier top location: first local max right of well
    let barX = wellX;
    for (let x = wellX; x < xMax; x += 0.005) { if (V(x) > V(barX)) barX = x; else if (x - barX > 0.3) break; }
    const barrier = V(barX) - v0;

    if (phi > xMax - 0.1) doEscape('over'); // rolled past the top region and off
    if (phi > barX && V(phi) < v0) doEscape('over');

    // quantum tunnelling: rate strongly depends on barrier area
    if (quantum && phi < barX) {
      const rate = 0.9 * Math.exp(-6.5 * (1 - tilt)) * clamp(barrier, 0.2, 3);
      if (Math.random() < rate * dt) doEscape('tunnel');
    }

    /* ball */
    const bx = xOf(phi), by = yOf(V(phi)) - 8;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, 26);
    g.addColorStop(0, 'rgba(125,211,252,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, 26, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath(); ctx.arc(bx, by, 8.5, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(21,29,49,.9)'; ctx.font = '700 9px -apple-system,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Φ', bx, by + 3); ctx.textAlign = 'left';

    /* barrier ghost arrow (tunnel hint) */
    if (quantum) {
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 3);
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
      const yG = yOf(v0 + 0.55);
      ctx.beginPath(); ctx.moveTo(xOf(wellX), yG); ctx.lineTo(xOf(barX + 0.35), yG); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(xOf(barX + 0.35), yG); ctx.lineTo(xOf(barX + 0.28), yG - 5); ctx.lineTo(xOf(barX + 0.28), yG + 5);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    /* announcement */
    if (announce) {
      announce.ttl -= dt;
      ctx.fillStyle = announce.col; ctx.font = '800 16px -apple-system,sans-serif'; ctx.textAlign = 'center';
      ctx.globalAlpha = clamp(announce.ttl, 0, 1);
      ctx.fillText(announce.txt, w / 2, 34);
      ctx.globalAlpha = 1; ctx.textAlign = 'left';
      if (announce.ttl <= 0) announce = null;
    }

    ctx.fillStyle = 'rgba(151,163,189,.85)'; ctx.font = '11px -apple-system,sans-serif';
    ctx.fillText(quantum
      ? 'Quantum mode: escapes happen early — the dotted line is the ball "walking through" the wall.'
      : 'Classical mode: the ball only escapes if the tilt nearly erases the dip (drag the slider right).', 14, h - 12);
  });
}
