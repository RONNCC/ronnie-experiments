/* 2024 Economics — Institutions: two Nogales, one fence, divergent fates. */
import { exhibitShell, makeCanvas, button, slider, toggle, loop, el, caption, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'The fence experiment',
    hint: 'Same land, same people — write different rules and run 150 years',
  });

  // institutional quality for each country: 0..1 each slider
  let north = { rules: 0.85, courts: 0.8, open: 0.75 };
  let south = { rules: 0.35, courts: 0.3, open: 0.3 };
  let reversal = false;   // start the extractive side richer ("reversal of fortune")
  let running = false, yr = 0, done = false;
  const MAXY = 150;

  let hist = { N: [], S: [] };

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W, H } = makeCanvas(grid, 380);
  const panel = controlsPanel(grid);

  function reset() {
    running = false; done = false; yr = 0;
    hist.N = [reversal ? 1 : 1];
    hist.S = [reversal ? 3 : 1]; // extractive empires started richer in 1500
    runBtn.textContent = '▶ Run 150 years';
  }

  function inst(q) { return (q.rules * 0.4 + q.courts * 0.35 + q.open * 0.25); }

  row: for (const _ of []) { } // (noop)

  function stepYear() {
    const iqN = inst(north), iqS = inst(south);
    const gN = hist.N[yr], gS = hist.S[yr];
    // growth = base + institutional premium + investment feedback - congestion of idea-blockers
    const shock = (Math.sin(yr * 12.9898) * 43758.5453) % 1 * 0.006; // same shock for both
    const rN = 0.004 + 0.030 * iqN * (1 - 0.3 * hist.N[yr] / 40) + (gN > 1 ? 0.006 * iqN : 0) + shock;
    const rS = 0.004 + 0.022 * iqS + (reversal && hist.S[yr] > 2 ? -0.006 * (1 - iqS) : 0) + shock;
    hist.N.push(Math.max(0.4, gN * (1 + rN)));
    hist.S.push(Math.max(0.3, gS * (1 + rS)));
    yr++;
  }

  const mkSliders = (title, obj) => {
    panel.append(el('div', { class: 'chip-note', style: '--cat:#a3e635' }, title));
    slider(panel, { label: 'Property rights — is what you build safe?', min: 0, max: 1, step: 0.05, value: obj.rules, fmt: v => Math.round(v * 100) + '%', onInput: v => { obj.rules = v; reset(); } });
    slider(panel, { label: 'Courts — can you sue the powerful and win?', min: 0, max: 1, step: 0.05, value: obj.courts, fmt: v => Math.round(v * 100) + '%', onInput: v => { obj.courts = v; reset(); } });
    slider(panel, { label: 'Openness — can newcomers challenge incumbents?', min: 0, max: 1, step: 0.05, value: obj.open, fmt: v => Math.round(v * 100) + '%', onInput: v => { obj.open = v; reset(); } });
  };
  mkSliders('🟢 North Nogales (inclusive),', north);
  mkSliders('🔴 South Nogales (extractive)', south);

  const rowEl = el('div', { class: 'btn-row' });
  panel.append(rowEl);
  const runBtn = button(rowEl, '▶ Run 150 years', () => {
    if (done) { reset(); }
    running = !running;
    runBtn.textContent = running ? '⏸ Pause' : (yr > 0 ? '▶ Resume' : '▶ Run 150 years');
  }, { primary: true });
  button(rowEl, '↺ Reset', reset);
  toggle(panel, {
    label: 'Start in 1500: the extractive side begins 3× richer', on: reversal,
    onChange: v => { reversal = v; reset(); }
  });

  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const stRatio = statBox(readouts, { label: 'Income gap after 150 yrs' });
  const stYear = statBox(readouts, { label: 'Year' });

  caption(panel, 'This is Acemoglu–Johnson–Robinson in one picture: <b>institutions compound</b>. Small differences in the rules — can you keep what you build, can courts check the powerful, can upstarts topple monopolies — snowball into enormous income gaps. With the 1500 toggle you get their famous "reversal of fortune": the initially rich extractive world gets overtaken by the initially poor inclusive one.');

  let acc = 0;
  loop((dt, t) => {
    if (running && !done) {
      acc += dt;
      while (acc > 0.02 && yr < MAXY) { stepYear(); acc -= 0.02; }
      if (yr >= MAXY) { done = true; running = false; runBtn.textContent = '↺ Run again'; }
    }
    stYear.set(String(1850 + yr));
    const gap = hist.S[yr] && hist.N[yr] ? hist.N[yr] / hist.S[yr] : 1;
    stRatio.set(gap >= 1 ? gap.toFixed(1) + '× (north richer)' : (1 / gap).toFixed(1) + '× (south richer)');

    const w = W(), h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
    const padL = 44, padR = 12, padT = 30, padB = 30;
    const iw = w - padL - padR, ih = h - padT - padB;
    const maxG = Math.max(40, ...hist.N, ...hist.S) * 1.08;
    const xOf = i => padL + (i / MAXY) * iw;
    const yOf = v => padT + ih - (Math.log2(v + 0.5) / Math.log2(maxG + 0.5)) * ih;

    // gridlines
    ctx.strokeStyle = 'rgba(93,106,134,.3)'; ctx.fillStyle = 'rgba(151,163,189,.7)';
    ctx.font = '10px ui-monospace,monospace';
    for (const v of [1, 2, 5, 10, 20, 40]) {
      ctx.beginPath(); ctx.moveTo(padL, yOf(v)); ctx.lineTo(w - padR, yOf(v)); ctx.stroke();
      ctx.fillText(v + '×', 8, yOf(v) + 3);
    }

    const plot = (arr, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
      ctx.beginPath();
      arr.forEach((v, i) => { const X = xOf(i), Y = yOf(v); i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); });
      ctx.stroke();
    };
    plot(hist.N, '#a3e635');
    plot(hist.S, '#fb7185');

    // legend
    ctx.font = '600 11px -apple-system,sans-serif';
    ctx.fillStyle = '#a3e635'; ctx.fillText('— inclusive rules', padL + 4, padT - 10);
    ctx.fillStyle = '#fb7185'; ctx.fillText('— extractive rules', padL + 120, padT - 10);

    // fence line down the middle when running (the Nogales border)
    if (!done && yr > 4) {
      ctx.strokeStyle = 'rgba(238,242,255,.15)'; ctx.setLineDash([3, 6]);
      ctx.beginPath(); ctx.moveTo(xOf(yr), padT); ctx.lineTo(xOf(yr), padT + ih); ctx.stroke(); ctx.setLineDash([]);
    }
  });
}
