/* 2023 Peace — Narges Mohammadi: a candle-lit wall of witness, with an activists' timeline. */
import { exhibitShell, makeCanvas, loop, el, caption, statBox, TAU } from '../kit.js';
import { seeded } from '../kit.js';

const TIMELINE = [
  { y: '1990s', h: 'Physics student → journalist', p: 'Trained as a nuclear physicist in Qazvin and Tehran, Mohammadi moves into journalism as the space for dissent narrows.' },
  { y: '2003', h: 'Joins Ebadi\'s centre', p: 'She helps found the Defenders of Human Rights Center with Nobel laureate Shirin Ebadi.' },
  { y: '2011', h: 'First long sentence', p: 'Arrested and sentenced to 11 years for "propaganda against the state". Released early on medical grounds after global pressure.' },
  { y: '2015', h: 'Children forced into exile', p: 'Her twins, Ali and Kiana, leave Iran to live with their father in France. She has not been able to hug them since.' },
  { y: '2021–22', h: 'White Torture', p: 'Her book documents solitary confinement — the "white torture" — through the testimony of fellow women prisoners.' },
  { y: 'Sep 2022', h: 'Woman, Life, Freedom', p: 'Mahsa (Jina) Amini, 22, dies in morality-police custody. Protests sweep Iran under the slogan Jin, Jiyan, Azadî — Woman, Life, Freedom.' },
  { y: '2022–23', h: 'The cell becomes a newsroom', p: 'From Evin Prison she files reports on abuse of detainees, leads a prisoners\' sit-in against executions, and smuggles out statements.' },
  { y: 'Oct 2023', h: 'The Nobel', p: 'The Peace Prize goes to a prison cell — and to everyone it speaks for. In December her children deliver her acceptance lecture in Oslo.' },
];

const WISHES = ['for the imprisoned', 'for the silenced', 'for the students', 'for every woman\'s choice', 'for the ones who write', 'for the witnesses', 'for the unbroken', 'for life, and freedom', 'for those who keep count', 'for the mothers waiting'];

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Light a candle; read the record',
    hint: 'Click the darkness. Every flame is a witness.',
  });

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { wrap, ctx, W, H } = makeCanvas(grid, 400);
  const panel = el('div', { class: 'controls' });
  grid.append(panel);

  const candles = [];
  const rnd = seeded(20231010);
  let total = 1375; // candles already lit when you arrive — solidarity precedes you
  const st = statBox(panel, { label: 'Candles of witness, burning now' });
  st.set(total.toLocaleString());

  const wishLine = el('p', { style: 'font-size:.85rem;color:var(--gold);min-height:1.6em;font-style:italic' }, '…');
  panel.append(wishLine);
  caption(panel, 'When the prize was announced inside Evin Prison, women prisoners chanted "Woman, Life, Freedom" in the yard. A candle is small; a wall of candles is a record no cell can hold. Click to add yours.');

  const flames = [];
  for (let i = 0; i < 220; i++) { // pre-lit field of others' candles
    flames.push({ x: rnd(), y: rnd(), s: 0.55 + rnd() * 0.8, ph: rnd() * TAU, mine: false });
  }

  wrap.style.cursor = 'pointer';
  wrap.addEventListener('pointerdown', (e) => {
    const r = wrap.getBoundingClientRect();
    flames.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, s: 0.9, ph: Math.random() * TAU, mine: true });
    total++;
    st.set(total.toLocaleString());
    wishLine.textContent = '✦ ' + WISHES[total % WISHES.length];
  });

  loop((dt, t) => {
    const w = W(), h = H();
    ctx.fillStyle = '#03050b'; ctx.fillRect(0, 0, w, h);
    // faint prison bars at edges, dissolving under candlelight
    ctx.strokeStyle = 'rgba(93,106,134,.25)'; ctx.lineWidth = 3;
    for (let x = w * 0.06; x < w; x += w * 0.1) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h * 0.14); ctx.stroke();
    }
    for (const f of flames) {
      const x = f.x * w, y = h - 24 - f.y * (h - 60);
      const flicker = 0.75 + 0.25 * Math.sin(t * 7 + f.ph) * Math.sin(t * 3.1 + f.ph * 2);
      const r = 16 * f.s * flicker;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
      g.addColorStop(0, f.mine ? 'rgba(125,211,252,.5)' : 'rgba(251,191,36,.42)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, TAU); ctx.fill();
      // candle body
      ctx.fillStyle = '#1a2236';
      ctx.fillRect(x - 2.5, y, 5, 14 * f.s);
      // flame
      ctx.fillStyle = f.mine ? '#bfe9ff' : '#ffd98a';
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(t * 5 + f.ph) * 1.2, y - 5, 2.4 * f.s, 5.4 * f.s * flicker, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(238,242,255,.55)';
    ctx.font = '600 12px ui-serif,serif'; ctx.textAlign = 'center';
    ctx.fillText('زن، زندگی، آزادی   ·   Woman · Life · Freedom', w / 2, 26);
    ctx.textAlign = 'left';
  });

  /* timeline */
  const tl = el('div', { style: 'display:grid;gap:.6rem;margin-top:1.2rem' });
  body.append(tl);
  for (const e of TIMELINE) {
    tl.append(el('div', { class: 'step', style: '--cat:#38bdf8' },
      el('div', {},
        el('h3', {}, `${e.y} — ${e.h}`),
        el('p', {}, e.p))));
  }
}
