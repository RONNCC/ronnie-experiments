/* 2025 Economics — Creative destruction: a living economy of firms that birth and bury each other. */
import { exhibitShell, makeCanvas, slider, button, loop, el, caption, statBox, meter, controlsPanel, TAU, clamp, lerp } from '../kit.js';

const COLS = 9, ROWS = 5, NF = COLS * ROWS;

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'The innovation treadmill',
    hint: 'Firms invent, leapfrog, and get buried by the next invention. Set the rules — watch growth roar or stall.',
  });

  let dynamism = 0.5;   // innovation investment
  let barriers = 0.2;   // entry barriers / incumbent protection
  let firms = [], gdpHist = [], tick = 0;
  reset();

  function reset() {
    firms = Array.from({ length: NF }, () => ({ tech: 5 + Math.random() * 3, age: 0, flash: 0, born: tick }));
    gdpHist = [];
  }

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W: CW, H } = makeCanvas(grid, 400);
  const panel = controlsPanel(grid);

  slider(panel, { label: 'Innovation investment (R&D, science, skills)', min: 0, max: 1, step: 0.05, value: dynamism, fmt: v => v < 0.3 ? 'starved' : v < 0.7 ? 'healthy' : 'feverish', onInput: v => { dynamism = v; } });
  slider(panel, { label: 'Incumbent protection (blocking new challengers)', min: 0, max: 1, step: 0.05, value: barriers, fmt: v => v < 0.3 ? 'contestable' : v < 0.7 ? 'cozy' : 'cartel', onInput: v => { barriers = v; } });
  button(panel, '↺ Restart economy', reset);

  const rd = el('div', { class: 'readout' });
  panel.append(rd);
  const stGDP = statBox(rd, { label: 'Living standards (GDP index)' });
  const stChurn = statBox(rd, { label: 'Firms destroyed & replaced' });
  const warnM = meter(panel, { label: 'Zombie-firm share (outdated but alive)', color: 'var(--bad)' });

  caption(panel, 'Aghion & Howitt\'s model, animated: growth = a chain of innovations, each making the previous top technology obsolete — <b>creative destruction</b>. Starve innovation and the treadmill stops. Protect incumbents from challengers and zombies wander forever while living standards flatline. Mokyr adds the deep history: this engine only ignited when societies institutionalised "useful knowledge" — science feeding technique — and tolerated the disruption it brings.');

  let destroyed = 0, leaderTech = 8;
  let acc = 0;

  function econStep() {
    tick++;
    leaderTech = Math.max(...firms.map(f => f.tech));
    for (let i = 0; i < NF; i++) {
      const f = firms[i];
      f.age++;
      // innovation attempt: more likely with investment; slightly more likely near frontier
      const pInno = 0.004 + dynamism * 0.05 * (0.6 + 0.4 * (f.tech / leaderTech));
      if (Math.random() < pInno) {
        f.tech = leaderTech + 0.5 + Math.random() * 1.5;
        f.flash = 1; f.age = 0;
      }
      // creative destruction: far-behind firms die
      const gap = leaderTech - f.tech;
      const deathP = gap > 6 ? 0.10 + dynamism * 0.10 : 0;
      if (Math.random() < deathP * (1 - barriers * 0.95)) {
        f.kill = 1; destroyed++;
      }
      if (f.kill) {
        f.killT = (f.killT || 0) + 1;
        if (f.killT > 12) firms[i] = { tech: leaderTech * (0.55 + Math.random() * 0.2), age: 0, flash: 0, born: tick };
      }
      f.flash = Math.max(0, f.flash - 0.06);
    }
    const gdp = firms.reduce((s, f) => s + f.tech, 0) / NF;
    gdpHist.push(gdp);
    if (gdpHist.length > 460) gdpHist.shift();
  }

  loop((dt, t) => {
    acc += dt;
    while (acc > 0.12) { econStep(); acc -= 0.12; }

    const w = CW(), h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);

    /* -- firms grid (left ~55%) -- */
    const gx0 = 16, gy0 = 30, gw = w * 0.54 - 16;
    const cellW = gw / COLS, cellH = (h - 60) / ROWS;
    const maxT = leaderTech;
    ctx.font = '600 11px -apple-system,sans-serif';
    ctx.fillStyle = 'rgba(151,163,189,.8)';
    ctx.fillText('the economy — each tile a firm (brightness = tech level)', gx0, 18);

    let zombies = 0;
    firms.forEach((f, i) => {
      const cx = gx0 + (i % COLS) * cellW, cy = gy0 + Math.floor(i / COLS) * cellH;
      const heat = clamp((f.tech - 2) / (maxT + 2), 0, 1);
      let col;
      if (f.kill) col = `rgba(93,106,134,${clamp(f.killT / 12, 0.2, 0.9)})`;
      else if (maxT - f.tech > 6) { col = `rgba(251,113,133,${0.25 + heat * 0.3})`; zombies++; }
      else col = `hsl(${150 + heat * 60}, ${60 + heat * 30}%, ${18 + heat * 42}%)`;
      ctx.fillStyle = col;
      const inset = f.flash > 0 ? 1 : 3;
      ctx.beginPath(); ctx.roundRect(cx + inset, cy + inset, cellW - inset * 2, cellH - inset * 2, 6); ctx.fill();
      if (f.flash > 0) {
        ctx.strokeStyle = `rgba(217,249,157,${f.flash})`; ctx.lineWidth = 2.4;
        ctx.stroke();
      }
      if (f.kill) {
        ctx.strokeStyle = 'rgba(238,242,255,.5)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy + 8); ctx.lineTo(cx + cellW - 8, cy + cellH - 8);
        ctx.moveTo(cx + cellW - 8, cy + 8); ctx.lineTo(cx + 8, cy + cellH - 8);
        ctx.stroke();
      }
    });

    /* -- GDP chart (right ~46%) -- */
    const px0 = w * 0.58, px1 = w - 16, py0 = 34, py1 = h * 0.62;
    ctx.fillStyle = 'rgba(151,163,189,.8)';
    ctx.fillText('living standards over time', px0, 18);
    ctx.strokeStyle = 'rgba(93,106,134,.4)';
    ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);
    if (gdpHist.length > 1) {
      const mn = Math.min(...gdpHist), mx = Math.max(...gdpHist), rg = Math.max(0.4, mx - mn);
      ctx.strokeStyle = '#d9f99d'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
      ctx.beginPath();
      gdpHist.forEach((v, i) => {
        const X = px0 + (i / (gdpHist.length - 1)) * (px1 - px0);
        const Y = py1 - 4 - ((v - mn) / rg) * (py1 - py0 - 8);
        i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
      });
      ctx.stroke();
      const slope = gdpHist.length > 30 ? (gdpHist[gdpHist.length - 1] - gdpHist[gdpHist.length - 30]) / 30 : 0;
      ctx.fillStyle = slope > 0.01 ? '#a3e635' : slope > -0.005 ? '#fbbf24' : '#fb7185';
      ctx.font = '700 12px -apple-system,sans-serif';
      ctx.fillText(slope > 0.01 ? '▲ growing' : slope > -0.005 ? '■ stagnating' : '▼ declining', px0 + 8, py0 + 18);
    }

    /* regime diagnosis */
    ctx.fillStyle = 'rgba(238,242,255,.8)'; ctx.font = '11.5px -apple-system,sans-serif';
    const msg = dynamism < 0.25 ? 'Innovation starved → the treadmill barely turns. (Mokyr: growth needs societies that fund and spread useful knowledge.)'
      : barriers > 0.6 ? 'Incumbents protected → zombies roam; new ideas can\'t clear out the old. Growth stalls. (Aghion–Howitt: competition policy IS growth policy.)'
      : dynamism > 0.6 && barriers < 0.4 ? 'Creative destruction in full swing: bright firms leapfrog, laggards die, standards climb — the post-1800 story.'
      : 'A mixed regime: some leapfrogging, some drag. Push investment up and protection down to see the difference.';
    wrapText(ctx, msg, px0, py1 + 22, px1 - px0, 15);

    stGDP.set((gdpHist[gdpHist.length - 1] || 6).toFixed(1));
    stChurn.set(String(destroyed));
    warnM.set(clamp(zombies / NF, 0, 1));
  });

  function wrapText(ctx, txt, x, y, maxW, lh) {
    const words = txt.split(' ');
    let line = '';
    for (const w2 of words) {
      if (ctx.measureText(line + w2).width > maxW) { ctx.fillText(line, x, y); y += lh; line = ''; }
      line += w2 + ' ';
    }
    ctx.fillText(line, x, y);
  }
}
