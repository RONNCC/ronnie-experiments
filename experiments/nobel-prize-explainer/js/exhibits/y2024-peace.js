/* 2024 Peace — Nihon Hidankyo: fold a paper crane; walk the testimony timeline. */
import { exhibitShell, makeCanvas, button, toggle, loop, el, caption, statBox, TAU, clamp, lerp } from '../kit.js';

const TIMELINE = [
  { y: 'Aug 1945', h: 'Two bombs, two cities', p: 'Hiroshima (Aug 6) and Nagasaki (Aug 9) are destroyed. More than 110,000 people die by year\'s end; survivors suffer burns, keloid scars, radiation sickness — and later, discrimination.' },
  { y: '1956', h: 'Hidankyo is founded', p: 'Survivor groups unify as Nihon Hidankyo with a double demand: state support for hibakusha — and abolition of nuclear weapons so no one ever suffers this again.' },
  { y: '1960s–80s', h: 'The witnesses travel', p: 'Members carry their testimony to schools, the UN, and world leaders. The slogan crystallises: "No more hibakusha" — anywhere, for anyone.' },
  { y: '1982', h: 'To the United Nations', p: 'Hidankyo delegations address the UN Special Sessions on Disarmament; survivor art — charred lunchboxes, melted bottles — speaks where words stall.' },
  { y: '2017', h: 'The ban treaty', p: 'Decades of testimony help deliver the UN Treaty on the Prohibition of Nuclear Weapons, the first global ban (in force from 2021).' },
  { y: '2024', h: 'The Nobel Peace Prize', p: 'With the average survivor now over 85, the Committee honours the organisation\'s lifetime of witness — and warns the nuclear taboo is under pressure.' },
];

/* polygon states for the folding sequence, in unit space [-1,1] */
const STATES = [
  { name: 'a square of paper', pts: [[-1, -1], [1, -1], [1, 1], [-1, 1]] },
  { name: 'fold to a diamond', pts: [[0, -1], [1, 0], [0, 1], [-1, 0]] },
  { name: 'kite fold', pts: [[0, -1], [0.62, 0.1], [0.3, 0.6], [0, 1], [-0.3, 0.6], [-0.62, 0.1]] },
  { name: 'the bird base', pts: [[0, -1], [0.35, -0.1], [0.5, 0.5], [0.12, 0.35], [0, 1], [-0.12, 0.35], [-0.5, 0.5], [-0.35, -0.1]] },
  { name: 'a crane', pts: [[0, -0.95], [0.16, -0.5], [0.95, -0.2], [0.3, 0.05], [0.55, 0.85], [0, 0.3], [-0.55, 0.85], [-0.3, 0.05], [-0.95, -0.2], [-0.16, -0.5]] },
];

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Fold a crane for the witnesses',
    hint: 'Each fold honours a story the hibakusha made sure we would inherit',
  });

  let state = 0, anim = 0, flop = false;
  let cranes = 2489;
  let folded = Array(STATES.length).fill(false);

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W, H } = makeCanvas(grid, 400);
  const panel = el('div', { class: 'controls' });
  grid.append(panel);

  const foldLabel = el('div', { class: 'chip-note', style: '--cat:#38bdf8' }, 'Sheet ready — ' + STATES[0].name);
  panel.append(foldLabel);
  const foldBtn = button(panel, '🕊 Fold', () => {
    if (anim > 0) return;
    if (state < STATES.length - 1) { state++; anim = 1; folded[state] = true; }
    else { cranes++; stCr.set(cranes.toLocaleString()); state = 0; anim = 1; folded = Array(STATES.length).fill(false); }
  }, { primary: true });
  toggle(panel, { label: 'Flap the wings', on: flop, onChange: v => { flop = v; } });
  const stCr = statBox(panel, { label: 'Cranes folded for peace' });
  stCr.set(cranes.toLocaleString());
  caption(panel, 'At the Hiroshima Peace Memorial, millions of paper cranes arrive every year — the tradition began in part with Sadako Sasaki, a survivor who developed leukemia a decade after the bomb and folded cranes while hoping to live. Her story made the crane the movement\'s emblem.');

  function drawPoly(pts, cx, cy, scale, fillAlpha) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => { const X = cx + x * scale, Y = cy + y * scale; i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); });
    ctx.closePath();
    const g = ctx.createLinearGradient(cx - scale, cy - scale, cx + scale, cy + scale);
    g.addColorStop(0, `rgba(125,211,252,${fillAlpha})`); g.addColorStop(1, `rgba(56,189,248,${fillAlpha * 0.5})`);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(191,233,255,.85)'; ctx.lineWidth = 1.6; ctx.stroke();
  }

  loop((dt, t) => {
    anim = Math.max(0, anim - dt * 1.4);
    const w = W(), h = H();
    ctx.fillStyle = '#04060b'; ctx.fillRect(0, 0, w, h);

    // rising mini-cranes in the background
    ctx.save(); ctx.globalAlpha = 0.12;
    for (let i = 0; i < 14; i++) {
      const x = ((i * 97) % 100) / 100 * w + Math.sin(t * 0.4 + i) * 10;
      const y = h - ((t * 12 + i * 60) % (h + 80)) + 40;
      drawPoly(STATES[4].pts, x, y, 12, 0.7);
    }
    ctx.restore();

    const cx = w / 2, cy = h / 2, scale = Math.min(w, h) * 0.30;
    const from = STATES[Math.max(0, state - (anim > 0 ? 1 : 0))];
    const to = STATES[state];
    // interpolate point sets (zip to same length)
    const n = Math.max(from.pts.length, to.pts.length);
    const z = 1 - anim;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = from.pts[i % from.pts.length], b = to.pts[i % to.pts.length];
      pts.push([lerp(a[0], b[0], z), lerp(a[1], b[1], z)]);
    }
    drawPoly(pts, cx, cy, scale, 0.28);

    // wing flap: pulse the side points when finished
    if (state === STATES.length - 1 && anim === 0 && flop) {
      const flap = Math.sin(t * 6) * 0.22;
      const fl = to.pts.map(([x, y]) => (Math.abs(x) > 0.5 && y < 0.3) ? [x, y - flap * (x > 0 ? 1 : 1)] : [x, y]);
      drawPoly(fl, cx, cy, scale, 0.30);
    }

    foldLabel.textContent = (state === STATES.length - 1 ? '🕊 ' : 'Folding… ') + to.name + (state === STATES.length - 1 ? ' — fold once more to release it' : '');

    // progress dots
    for (let i = 0; i < STATES.length; i++) {
      ctx.fillStyle = i <= state ? '#38bdf8' : 'rgba(93,106,134,.5)';
      ctx.beginPath(); ctx.arc(w / 2 + (i - (STATES.length - 1) / 2) * 18, h - 20, 4, 0, TAU); ctx.fill();
    }
  });

  /* timeline */
  const tl = el('div', { style: 'display:grid;gap:.6rem;margin-top:1.2rem' });
  body.append(tl);
  for (const e of TIMELINE) {
    tl.append(el('div', { class: 'step', style: '--cat:#38bdf8' }, el('div', {}, el('h3', {}, `${e.y} — ${e.h}`), el('p', {}, e.p))));
  }
}
