/* 2024 Literature — Han Kang: "Becoming a tree" — three lenses, one refusal. */
import { exhibitShell, makeCanvas, button, slider, loop, el, caption, TAU, clamp, lerp } from '../kit.js';
import { seeded } from '../kit.js';

const LENSES = [
  { key: 'husband', label: 'Part I — the husband', tint: '#8b93ad', note: 'He narrates her as an inconvenience: an unremarkable wife who breaks the script. His lens is all surface — which is precisely Han Kang\'s accusation.' },
  { key: 'artist', label: 'Part II — the brother-in-law', tint: '#a78bfa', note: 'He sees her body as an art object, painting flowers on her skin. Desire disguised as aesthetics: another way of not seeing her.' },
  { key: 'sister', label: 'Part III — the sister', tint: '#38bdf8', note: 'In-hye alone watches, helpless, complicit, tender. Through her we finally ask: what is Yeong-hye actually refusing?' },
];

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Becoming a tree — but never in her own voice',
    hint: 'Slide through the novel; switch the lens to feel how the structure denies her a chapter',
  });

  let prog = 0.1;
  let lens = 0;
  let targetProg = 0.1;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W, H } = makeCanvas(grid, 420);
  const panel = el('div', { class: 'controls' });
  grid.append(panel);

  const lensLabel = el('div', { class: 'chip-note', style: '--cat:#fbbf24' }, LENSES[0].label);
  const lensNote = el('p', { style: 'font-size:.84rem;color:var(--muted);min-height:4.2em' }, LENSES[0].note);
  panel.append(lensLabel, lensNote);

  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  LENSES.forEach((L, i) => {
    const b = button(row, ['I', 'II', 'III'][i], () => {
      lens = i; lensLabel.textContent = L.label; lensNote.textContent = L.note;
      row.querySelectorAll('.btn').forEach((x, j) => x.classList.toggle('primary', j === i));
    }, { primary: i === 0, title: L.label });
  });

  slider(panel, {
    label: 'Turn the pages', min: 0, max: 1, step: 0.01, value: prog,
    fmt: v => v < 0.25 ? 'the refusal' : v < 0.55 ? 'the family closes in' : v < 0.85 ? 'the wish to be plant' : 'stillness',
    onInput: v => { targetProg = v; }
  });

  caption(panel, 'In Han Kang\'s The Vegetarian, Yeong-hye\'s quiet act — refusing meat after a dream — meets escalating force. Her transformation toward the plant-like is narrated always by others. This exhibit is textless on purpose: the novel\'s protagonist is the one person whose narration we never get.');

  let rnd = seeded(19800518);

  function branch(x, y, ang, len, depth, t, tint) {
    if (depth <= 0 || len < 2) return;
    const sway = Math.sin(t * 0.8 + len * 0.3) * 0.02;
    const ex = x + Math.cos(ang + sway) * len, ey = y + Math.sin(ang + sway) * len;
    ctx.strokeStyle = tint; ctx.lineWidth = Math.max(1, depth * 1.1);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
    const n = depth > 4 ? 2 : 2;
    for (let i = 0; i < n; i++) {
      const spread = 0.42 + 0.18 * rnd();
      const a = ang + (i === 0 ? -spread : spread) * (0.8 + 0.4 * rnd());
      branch(ex, ey, a, len * (0.66 + rnd() * 0.14), depth - 1, t, tint);
    }
    if (depth <= 2 && prog > 0.62 && rnd() < 0.75) {
      // blossoms appear late in the slide
      const bl = clamp((prog - 0.62) / 0.38, 0, 1);
      ctx.fillStyle = `rgba(251,182,206,${0.85 * bl})`;
      ctx.beginPath(); ctx.arc(ex, ey, 2.6 * bl + 0.8, 0, TAU); ctx.fill();
    }
  }

  loop((dt, t) => {
    prog = lerp(prog, targetProg, dt * 5);
    const w = W(), h = H();
    const T = LENSES[lens].tint;

    // backdrop
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#070b14'); g.addColorStop(1, '#04060b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // ground
    ctx.fillStyle = 'rgba(52,73,54,.5)';
    ctx.beginPath(); ctx.ellipse(w / 2, h * 0.94, w * 0.6, h * 0.09, 0, 0, TAU); ctx.fill();

    // moon (her dream's eye)
    ctx.fillStyle = 'rgba(238,242,255,.1)';
    ctx.beginPath(); ctx.arc(w * 0.82, h * 0.18, 30, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(238,242,255,.22)';
    ctx.beginPath(); ctx.arc(w * 0.82, h * 0.18, 24, 0, TAU); ctx.fill();

    // figure → tree morph
    const bx = w / 2, by = h * 0.92;
    const figure = 1 - clamp(prog / 0.55, 0, 1); // 1 = human, 0 = tree
    const treeNess = clamp((prog - 0.2) / 0.8, 0, 1);

    // spine/trunk
    const trunkLen = 90 + treeNess * 60;
    const trunkTint = `color-mix(in srgb, ${T} ${Math.round(30 + treeNess * 60)}%, #4a3b2a)`;
    ctx.strokeStyle = trunkTint; ctx.lineWidth = lerp(7, 14, treeNess); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by);
    const headX = bx + Math.sin(t * 0.5) * 2, headY = by - trunkLen - lerp(30, 0, treeNess);
    ctx.lineTo(headX, headY);
    ctx.stroke();

    if (figure > 0.05) {
      // human head
      if (figure > 0.4) {
        ctx.fillStyle = `rgba(230,220,210,${figure})`;
        ctx.beginPath(); ctx.arc(headX, headY - 12, 11, 0, TAU); ctx.fill();
      }
      // arms — thinning into branches as prog rises
      const armLen = lerp(44, 20, treeNess);
      ctx.strokeStyle = `rgba(230,220,210,${figure * 0.9})`; ctx.lineWidth = 5;
      const shoulderY = by - trunkLen * 0.8;
      const armAng = lerp(0.5, 1.25, treeNess); // arms rise toward the sky
      ctx.beginPath();
      ctx.moveTo(bx, shoulderY); ctx.lineTo(bx - Math.cos(armAng) * armLen, shoulderY - Math.sin(armAng) * armLen);
      ctx.moveTo(bx, shoulderY); ctx.lineTo(bx + Math.cos(armAng) * armLen, shoulderY - Math.sin(armAng) * armLen);
      ctx.stroke();
      // legs
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx - 16, by + 4);
      ctx.moveTo(bx, by); ctx.lineTo(bx + 16, by + 4);
      ctx.stroke();
    }

    if (treeNess > 0.05) {
      rnd = seeded(19800518); // re-seed per frame so the tree doesn't jitter
      const depth = Math.round(3 + treeNess * 5);
      const branches = Math.round(2 + treeNess * 3);
      ctx.save(); ctx.globalAlpha = treeNess;
      for (let i = 0; i < branches; i++) {
        const baseA = -Math.PI / 2 + (i - (branches - 1) / 2) * 0.55;
        branch(bx, by - trunkLen * (0.55 + 0.45 * (i / branches)), baseA, 26 + treeNess * 46, depth, t, `rgba(122,92,58,${0.85})`);
      }
      ctx.restore();
    }

    // caption strip
    ctx.fillStyle = 'rgba(238,242,255,.72)';
    ctx.font = 'italic 600 13px ui-serif,serif'; ctx.textAlign = 'center';
    const strips = [
      [0.15, '"She was unremarkable in every way." — so he thought'],
      [0.40, 'A dream of blood. The fridge emptied by morning.'],
      [0.62, 'Painted flowers on skin — seen, but never heard.'],
      [0.80, '"Why can\'t you just eat?" The table turned to force.'],
      [0.97, 'If she becomes a tree, no one can make her swallow.'],
    ];
    for (const [p, s] of strips) {
      if (Math.abs(prog - p) < 0.12) ctx.fillText(s, w / 2, 30);
    }
    ctx.textAlign = 'left';
  });

  caption(body, 'The quotes above are <b>paraphrases written for this exhibit</b>, not Han Kang\'s text. Her actual novel does the opposite: controlled, plain sentences carrying unbearable weight. Human Acts turns the same steady gaze on the 1980 Gwangju massacre. If this exhibit moves you at all, the book will floor you — start with The Vegetarian (Deborah Smith\'s English translation).');
}
