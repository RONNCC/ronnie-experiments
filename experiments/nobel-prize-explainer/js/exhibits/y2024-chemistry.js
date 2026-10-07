/* 2024 Chemistry — protein folding on a lattice + the AlphaFold confidence key. */
import { exhibitShell, makeCanvas, button, loop, el, caption, statBox, controlsPanel, TAU, clamp } from '../kit.js';
import { seeded } from '../kit.js';

const SEQ = 'HPHHPPHPHHPHHPPHPHHPHHPPHPH'; // hydrophobic/polar beads (kept fixed so it's foldable)
const NB = SEQ.length;
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Fold the chain (or let the computer try)',
    hint: 'Click a bead to pivot everything after it — or press Fold! and watch simulated annealing work',
  });

  const rnd = seeded(1717);
  let chain = [];                    // [{x,y}] straight start
  let running = false, temp = 3.0;
  let explored = 0;
  reset();

  function reset() {
    chain = [];
    let x = -NB / 2;
    for (let i = 0; i < NB; i++) { chain.push({ x: x + i, y: 0 }); }
  }

  function key(x, y) { return x + ',' + y; }
  function occupancy(c = chain) { const s = new Set(); for (const p of c) s.add(key(p.x, p.y)); return s; }
  function score(c = chain) { // -(# of H–H non-consecutive contacts)
    const occ = occupancy(c); let s = 0;
    for (let i = 0; i < NB; i++) {
      if (SEQ[i] !== 'H') continue;
      for (const [dx, dy] of DIRS) {
        const at = c[i].x + dx, cj = c[i].y + dy, k = key(at, cj);
        // neighbour must be occupied by a non-adjacent H
        if (!occ.has(k)) continue;
        for (let j = 0; j < NB; j++) {
          if (Math.abs(i - j) > 1 && SEQ[j] === 'H' && c[j].x === at && c[j].y === cj) s++;
        }
      }
    }
    return -s / 2;
  }

  /* pivot move: rotate tail of chain around bead k by ±90° (works on diagonals-free lattice only if bend allows; we use free rotation and reject overlaps) */
  function tryPivot(k, dir) {
    const p = chain[k];
    const next = chain.map((b, i) => {
      if (i <= k) return { ...b };
      const rx = b.x - p.x, ry = b.y - p.y;
      return dir > 0 ? { x: p.x - ry, y: p.y + rx } : { x: p.x + ry, y: p.y - rx };
    });
    if (occupancy(next).size !== NB) return false;
    chain = next; return true;
  }

  function annealStep() {
    const k = 1 + Math.floor((NB - 2) * rnd());                  // inner pivot point
    const dir = rnd() < 0.5 ? 1 : -1;
    const old = chain;
    const oldE = score(old);
    const trial = chain.map((b, i) => {
      if (i <= k) return { ...b };
      const p = old[k]; const rx = b.x - p.x, ry = b.y - p.y;
      return dir > 0 ? { x: p.x - ry, y: p.y + rx } : { x: p.x + ry, y: p.y - rx };
    });
    if (occupancy(trial).size !== NB) return;
    const dE = score(trial) - oldE;
    explored++;
    if (dE <= 0 || rnd() < Math.exp(-dE / temp)) chain = trial;
  }

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { wrap, c, ctx, W: CW, H } = makeCanvas(grid, 380);
  const panel = controlsPanel(grid);

  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const stScore = statBox(readouts, { label: 'H–H contacts (good)' });
  const stTemp = statBox(readouts, { label: 'Heat' });
  const stExp = statBox(readouts, { label: 'Shapes tried' });

  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  const foldBtn = button(row, '🔥 Fold! (anneal)', () => {
    running = !running; foldBtn.textContent = running ? '⏸ Pause folding' : '🔥 Fold! (anneal)';
    if (running) temp = 3.0;
  }, { primary: true });
  button(row, '↺ Unfold', () => { running = false; foldBtn.textContent = '🔥 Fold! (anneal)'; reset(); });

  caption(panel, 'Orange beads are water-fearing (H), blue are water-loving (P). Good folds hide the orange ones inside. In real life a chain this size has more possible shapes than atoms in a galaxy — yet folds in milliseconds.');

  /* manual pivots */
  wrap.style.cursor = 'pointer';
  wrap.addEventListener('pointerdown', (e) => {
    if (running) return;
    const r = wrap.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    // project to lattice coordinates (mirror of draw transform below)
    const sc = Math.min(r.width, H()) / (NB * 1.15);
    const ox = r.width / 2, oy = H() / 2;
    let best = -1, bd = 1e9;
    chain.forEach((b, i) => {
      const X = ox + b.x * sc, Y = oy + b.y * sc;
      const d = (X - mx) ** 2 + (Y - my) ** 2;
      if (d < bd) { bd = d; best = i; }
    });
    if (best > 0 && best < NB - 1) {
      if (!tryPivot(best, 1)) tryPivot(best, -1);
    }
  });

  loop((dt) => {
    if (running) {
      for (let i = 0; i < 240; i++) annealStep();
      temp = Math.max(0.12, temp * 0.997);
    }
    stScore.set(String(-score()));
    stTemp.set(temp.toFixed(2));
    stExp.set(explored.toLocaleString());

    const w = CW(), h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
    const sc = Math.min(w, h) / (NB * 1.15);
    const ox = w / 2, oy = h / 2;

    // contact lines between non-consecutive H pairs that touch
    ctx.strokeStyle = 'rgba(52,211,153,.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]);
    for (let i = 0; i < NB; i++) for (let j = i + 2; j < NB; j++) {
      if (SEQ[i] === 'H' && SEQ[j] === 'H' && Math.abs(chain[i].x - chain[j].x) + Math.abs(chain[i].y - chain[j].y) === 1) {
        ctx.beginPath();
        ctx.moveTo(ox + chain[i].x * sc, oy + chain[i].y * sc);
        ctx.lineTo(ox + chain[j].x * sc, oy + chain[j].y * sc);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // backbone
    ctx.strokeStyle = 'rgba(238,242,255,.35)'; ctx.lineWidth = 2.4;
    ctx.beginPath();
    chain.forEach((b, i) => { const X = ox + b.x * sc, Y = oy + b.y * sc; i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); });
    ctx.stroke();

    // beads
    chain.forEach((b, i) => {
      const X = ox + b.x * sc, Y = oy + b.y * sc;
      const col = SEQ[i] === 'H' ? '#fb923c' : '#38bdf8';
      if (SEQ[i] === 'H') {
        const g = ctx.createRadialGradient(X, Y, 0, X, Y, sc * 0.7);
        g.addColorStop(0, 'rgba(251,146,60,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, sc * 0.7, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(X, Y, sc * 0.34, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.fillStyle = 'rgba(151,163,189,.85)'; ctx.font = '11px -apple-system,sans-serif';
    ctx.fillText(running ? 'annealing: hot = shake hard, cool = settle into good folds' : 'click a bead to pivot the tail • press Fold! for annealing', 12, h - 12);
  });

  caption(body, 'This is the famous <b>HP lattice model</b> — a toy version of the folding problem. Finding the best fold even here is fiendishly hard (NP-hard!). AlphaFold cracked the real version not by brute force but by pattern-learning from evolution: amino acids that mutate together across thousands of species are usually touching in 3D. Below is how AlphaFold colours its confidence — from "sure" to "guessing".');

  // AlphaFold confidence legend
  const legend = el('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem' });
  const conf = [['#0053d6', 'Very high (pLDDT > 90)'], ['#65cbf3', 'Confident (70–90)'], ['#ffdb13', 'Low (50–70)'], ['#ff7d45', 'Very low (< 50)']];
  for (const [col, lab] of conf) {
    legend.append(el('span', { class: 'chip', style: `--chip-c:${col}` }, el('span', { class: 'swatch', style: `background:${col}` }), lab));
  }
  body.append(legend);
  caption(body, 'DeepMind released predicted shapes with this confidence colouring for <b>~200 million proteins</b> — nearly every one known to science. Meanwhile David Baker\'s lab runs the puzzle backwards: sketch a shape that does a job (bind a toxin, form a vaccine scaffold), compute a sequence that folds into it. Fold some orange into the middle up there — you\'ve felt a sliver of both problems.');
}
