/* 2023 Economics — Claudia Goldin: the U-curve of women's work, and the child-penalty career sim. */
import { exhibitShell, makeCanvas, button, slider, toggle, loop, el, caption, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Run two careers, meet the child penalty',
    hint: 'Simulate a lifetime of earnings — then change the workplace and watch the gap move',
  });

  /* ---------- part 1: career simulator ---------- */
  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W, H } = makeCanvas(grid, 340);
  const panel = controlsPanel(grid);

  let flexibility = 0.25; // 0 = greedy rigid work, 1 = fully flexible
  let hasChild = true;
  let running = false, simT = 0; // 0..1 across ages 22..60

  slider(panel, {
    label: 'Workplace flexibility (vs "greedy" always-on jobs)', min: 0, max: 1, step: 0.05, value: flexibility,
    fmt: v => v < 0.25 ? 'greedy' : v < 0.6 ? 'mixed' : 'flexible', onInput: v => { flexibility = v; populate(); }
  });
  toggle(panel, { label: 'A child arrives at 30', on: hasChild, onChange: v => { hasChild = v; populate(); } });
  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  button(row, '▶ Run both careers', () => { running = true; simT = 0; }, { primary: true });

  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const gapStat = statBox(readouts, { label: 'Lifetime earnings gap' });
  const penStat = statBox(readouts, { label: 'Earnings lost at 40' });

  // stylised earnings curves (index, $k/yr): equal skill start
  function earnings(age, mother) {
    let w = 42 + (age - 22) * 2.2;            // base growth
    w += 14 * (1 - Math.exp(-(age - 22) / 9)); // early career boost
    if (mother && hasChild) {
      const after = age - 30;
      if (after > 0) {
        const dip = 22 * (1 - flexibility) * Math.exp(-after / 9);   // time out / part-time
        const slopeLoss = 1.6 * (1 - flexibility) / (1 + Math.exp(-(after - 6) / 3));
        w -= dip + slopeLoss * (age - 22);
      }
    }
    return Math.max(18, w);
  }
  function lifeEarn(mother) {
    let s = 0; for (let a = 22; a <= 60; a++) s += earnings(a, mother); return s;
  }
  function populate() {
    const lm = lifeEarn(false), lf = lifeEarn(true);
    gapStat.set(hasChild ? Math.round((1 - lf / lm) * 100) + '%' : '0%');
    penStat.set(hasChild ? Math.round(100 * (1 - earnings(40, true) / earnings(40, false))) + '%' : '0%');
  }
  populate();

  const SERIES = { m: [], f: [] };
  loop((dt, t) => {
    const w = W(), h = H();
    const padL = 46, padB = 34, padT = 26, padR = 14;
    const iw = w - padL - padR, ih = h - padT - padB;
    const xOf = a => padL + ((a - 22) / 38) * iw;
    const yOf = v => padT + ih - (v / 110) * ih;

    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);

    // axes + gridlines
    ctx.strokeStyle = 'rgba(93,106,134,.35)'; ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(151,163,189,.7)'; ctx.font = '10px ui-monospace,monospace';
    for (let v = 0; v <= 100; v += 25) {
      ctx.beginPath(); ctx.moveTo(padL, yOf(v)); ctx.lineTo(w - padR, yOf(v)); ctx.stroke();
      ctx.fillText('$' + v + 'k', 6, yOf(v) + 3);
    }
    for (let a = 25; a <= 60; a += 5) ctx.fillText(String(a), xOf(a) - 8, h - 12);
    ctx.fillText('age →', w - 54, h - 12);

    // child marker
    if (hasChild) {
      ctx.fillStyle = 'rgba(251,191,36,.09)';
      ctx.fillRect(xOf(30), padT, xOf(60) - xOf(30), ih);
      ctx.fillStyle = 'rgba(251,191,36,.9)'; ctx.font = '600 11px -apple-system,sans-serif';
      ctx.fillText('👶 child arrives', xOf(30) + 6, padT + 16);
    }

    const drawLine = (mother, col, dash) => {
      ctx.save(); if (dash) ctx.setLineDash([6, 5]);
      ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
      ctx.beginPath();
      const maxA = running ? 22 + simT * 38 : 60;
      for (let a = 22; a <= maxA; a += 0.5) {
        const X = xOf(a), Y = yOf(earnings(a, mother));
        a === 22 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
      }
      ctx.stroke(); ctx.restore();
    };
    drawLine(false, '#7dd3fc');
    drawLine(true, '#fb7185');

    // legend
    ctx.font = '600 11px -apple-system,sans-serif';
    ctx.fillStyle = '#7dd3fc'; ctx.fillText('— father (or no-child path)', padL + 4, padT + 12);
    ctx.fillStyle = '#fb7185'; ctx.fillText('— mother', padL + 4, padT + 26);

    if (running) simT = Math.min(1, simT + dt * 0.45);
  });
  caption(body, 'Goldin\'s central finding about <b>today\'s</b> gap: it\'s driven mostly by what happens around parenthood inside occupations — "greedy" careers pay huge premiums for constant availability, so the parent who steps back (usually the mother) pays for years. Drag the flexibility slider right and re-run: the gap nearly closes. (Stylised curves — the patterns, not the digits, are the research.)');

  /* ---------- part 2: the U-shaped century ---------- */
  const grid2 = el('div', { class: 'sim-grid side' });
  body.append(el('hr', { style: 'border:none;border-top:1px solid var(--border-soft);margin:1.5rem 0' }));
  body.append(grid2);
  const cv2 = makeCanvas(grid2, 260);
  const panel2 = controlsPanel(grid2);
  let play2 = false, prog2 = 0;
  button(panel2, '▶ Animate 120 years', () => { play2 = true; prog2 = 0; }, { primary: true });
  caption(panel2, 'Goldin dug through 200 years of records and found participation is not a straight rise: it fell when farming gave way to factories, then returned with office jobs and the pill\'s "quiet revolution". Stylised shape below.');

  const uCurve = x => 0.62 * Math.pow(x - 0.52, 2) / 0.25 + 0.18 + (x > 0.55 ? (x - 0.55) * 1.35 : 0) + (x > 0.25 && x < 0.45 ? -0.03 : 0);
  const events = [
    [0.08, '1890s: farm & home work\n(under-counted in censuses)'],
    [0.34, '1930s–50s: factory era —\nstigma of the working wife'],
    [0.55, 'WWII: women drafted\ninto the workforce'],
    [0.72, '1970s: the pill & the\n"quiet revolution"'],
    [0.97, '2000s: widest education\nedge — gap persists'],
  ];
  loop((dt) => {
    if (play2) prog2 = Math.min(1, prog2 + dt * 0.3);
    const { ctx: g, W: w, H: h } = { ctx: cv2.ctx, W: cv2.W(), H: cv2.H() };
    const padL = 40, padB = 30, padT = 20, iw = w - padL - 20, ih = h - padT - padB;
    g.fillStyle = '#05070d'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(93,106,134,.35)';
    g.beginPath(); g.moveTo(padL, padT); g.lineTo(padL, padT + ih); g.lineTo(padL + iw, padT + ih); g.stroke();
    g.fillStyle = 'rgba(151,163,189,.7)'; g.font = '10px ui-monospace,monospace';
    g.fillText('share of women working for pay', 6, padT + 10);
    g.fillText('1890', padL, padT + ih + 16); g.fillText('2010', padL + iw - 26, padT + ih + 16);

    const upto = 4 + prog2 * (iw - 8);
    g.strokeStyle = '#a3e635'; g.lineWidth = 2.6; g.shadowColor = '#a3e635'; g.shadowBlur = 8;
    g.beginPath();
    for (let px = 0; px <= upto; px += 3) {
      const x = px / iw;
      const y = uCurve(x);
      const X = padL + px, Y = padT + ih - clamp(y, 0, 1) * ih;
      px === 0 ? g.moveTo(X, Y) : g.lineTo(X, Y);
    }
    g.stroke(); g.shadowBlur = 0;

    // event labels
    if (prog2 > 0.95) {
      g.fillStyle = 'rgba(238,242,255,.75)'; g.font = '10px -apple-system,sans-serif';
      for (const [x, label] of events) {
        const X = padL + x * iw, Y = padT + ih - clamp(uCurve(x), 0, 1) * ih;
        g.fillStyle = '#a3e635';
        g.beginPath(); g.arc(X, Y, 3, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(238,242,255,.75)';
        const lines = label.split('\n');
        lines.forEach((ln, i) => g.fillText(ln, clamp(X - 30, 4, w - 150), Y - 14 - (lines.length - 1 - i) * 11));
      }
    }
  });
}
