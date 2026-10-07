/* 2025 Peace — María Corina Machado: the tally-sheet operation. Verify the count yourself. */
import { exhibitShell, makeCanvas, button, loop, el, caption, meter, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';
import { seeded } from '../kit.js';

const N_SHEETS = 600;                 // scale model of thousands of actas
const TRUE_A = 0.43, TRUE_B = 0.52;   // shares reflected by citizen-collected actas (scale model)
const OFFICIAL_A = 0.512, OFFICIAL_B = 0.443; // the government-announced figures, July 2024

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Audit an election with your own eyes',
    hint: 'Volunteers photographed the printed tally sheet (acta) at each voting station. Verify sheets one by one and watch the truth converge.',
  });

  const rnd = seeded(20240728);
  let verified = 0;
  let sheets = [];
  let flying = [];
  let countA = 0, countB = 0, countO = 0;
  genSheets();
  function genSheets() {
    sheets = [];
    verified = 0; flying = []; countA = 0; countB = 0; countO = 0;
    for (let i = 0; i < N_SHEETS; i++) {
      const total = 300 + Math.floor(rnd() * 500);
      const a = Math.round(total * (TRUE_A + (rnd() - 0.5) * 0.14));
      const b = Math.round(total * (TRUE_B + (rnd() - 0.5) * 0.14));
      sheets.push({ a, b, o: total - a - b, done: false, x: rnd(), y: rnd(), z: rnd() });
    }
  }

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W: CW, H } = makeCanvas(grid, 380);
  const panel = controlsPanel(grid);

  const rd = el('div', { class: 'readout' }); panel.append(rd);
  const stN = statBox(rd, { label: 'Sheets verified (n)' });
  const stEst = statBox(rd, { label: 'Citizen tally: opposition lead' });
  const confM = meter(panel, { label: 'Confidence the real result is provable', color: 'var(--ok)' });

  const row = el('div', { class: 'btn-row' });
  panel.append(row);
  button(row, '🧾 Verify 1 sheet', () => verify(1), { primary: true });
  button(row, '📬 Verify 25', () => verify(25));
  button(row, '🔥 Verify everything', () => verify(N_SHEETS));
  button(row, '↺ Restart', () => { genSheets(); });

  panel.append(stN);
  caption(panel, 'Machado\'s movement trained hundreds of thousands of poll watchers who, by law, could collect the printed <b>acta</b> from each machine. On election night the government announced a win without publishing polling data. Within days the opposition had scanned and posted ~85% of all actas online — anyone on Earth could add them up. Independent statisticians (and media outlets) did: the totals showed a landslide the other way. That\'s why "receipts, not rumours" is a democratic weapon.');

  function verify(n) {
    let k = 0;
    for (const s of sheets) {
      if (k >= n) break;
      if (!s.done) { s.done = true; k++; flying.push({ s, t: 0 }); countA += s.a; countB += s.b; countO += s.o; verified++; }
    }
  }

  let w = 800, h = 380;
  loop((dt, t) => {
    w = CW(); h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);

    /* ---- paper pile (left region) ---- */
    const pileX = w * 0.5 - 150, pileY = h - 90;
    ctx.save();
    ctx.fillStyle = 'rgba(238,242,255,.9)';
    ctx.font = '600 11px -apple-system,sans-serif';
    for (let i = 0; i < sheets.length; i++) {
      const s = sheets[i];
      if (s.done) continue;
      if (i % 8 !== 0) continue; // draw subset for perf
      const x = pileX + (s.x - 0.5) * 120, y = pileY + (s.y - 0.5) * 46;
      ctx.save(); ctx.translate(x, y); ctx.rotate((s.z - 0.5) * 0.5);
      ctx.fillStyle = 'rgba(233,238,250,.9)';
      ctx.fillRect(-13, -17, 26, 34);
      ctx.strokeStyle = '#aab4cf'; ctx.lineWidth = 0.7;
      for (let l = 0; l < 4; l++) { ctx.beginPath(); ctx.moveTo(-9, -10 + l * 7); ctx.lineTo(9, -10 + l * 7); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();

    /* ---- flying verified sheets into the chart ---- */
    for (let i = flying.length - 1; i >= 0; i--) {
      const f = flying[i]; f.t += dt * 1.2;
      if (f.t >= 1) { flying.splice(i, 1); continue; }
      const z = f.t;
      const x = lerp(pileX + (f.s.x - 0.5) * 120, w * 0.5 + 150, z);
      const y = lerp(pileY + (f.s.y - 0.5) * 46, h - 60, z) - Math.sin(z * Math.PI) * 90;
      ctx.save(); ctx.translate(x, y); ctx.rotate((1 - z) * 0.6); ctx.globalAlpha = 1 - z * 0.6;
      ctx.fillStyle = '#fff'; ctx.fillRect(-10, -13, 20, 26);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(-10, -13, 20 * 0.55, 6);
      ctx.restore();
    }

    /* ---- chart: official vs citizen tally (right region) ---- */
    const cx = w * 0.5 + 150, base = h - 60, bw = 52, scale = 240;
    const vA = countA, vB = countB, vTot = Math.max(1, vA + vB + countO);
    const shareA = vA / vTot, shareB = vB / vTot;

    // bars: official
    drawBar(cx - bw - 16, base - OFFICIAL_A * scale * 0.55, bw, OFFICIAL_A * scale * 0.55, 'rgba(251,113,133,.55)', `official A ${(OFFICIAL_A * 100).toFixed(1)}%`);
    drawBar(cx - bw - 16, base - OFFICIAL_B * scale * 0.55 - OFFICIAL_A * scale * 0.55, bw, OFFICIAL_B * scale * 0.55, 'rgba(125,211,252,.35)', `B ${(OFFICIAL_B * 100).toFixed(1)}%`);
    // bars: citizen counted (animated toward share)
    drawBar(cx + 16, base - shareA * scale * 0.55, bw, shareA * scale * 0.55, 'rgba(251,113,133,.85)', verified ? `actas A ${(shareA * 100).toFixed(1)}%` : 'actas A —');
    drawBar(cx + 16, base - (shareA + shareB) * scale * 0.55, bw, shareB * scale * 0.55, 'rgba(125,211,252,.85)', verified ? `B ${(shareB * 100).toFixed(1)}%` : 'B —');

    // true-result dashed band
    ctx.strokeStyle = 'rgba(52,211,153,.7)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.6;
    const yTrue = base - (TRUE_A + TRUE_B) * scale * 0.55;
    ctx.beginPath(); ctx.moveTo(cx + 4, yTrue); ctx.lineTo(cx + 16 + bw + 8, yTrue); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(52,211,153,.9)'; ctx.font = '10px ui-monospace,monospace';
    ctx.fillText('true total', cx + 16, yTrue - 5);

    ctx.fillStyle = 'rgba(151,163,189,.8)'; ctx.font = '600 11px -apple-system,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('announced', cx - bw / 2 - 16, base + 16);
    ctx.fillText('your audit', cx + bw / 2 + 16, base + 16);
    ctx.textAlign = 'left';

    function drawBar(x, y, wd, ht, col, label) {
      ctx.fillStyle = col;
      ctx.fillRect(x, y, wd, ht);
      ctx.strokeStyle = 'rgba(238,242,255,.25)'; ctx.lineWidth = 1;
      ctx.strokeRect(x, y, wd, ht);
      ctx.save();
      ctx.fillStyle = 'rgba(238,242,255,.85)'; ctx.font = '10px ui-monospace,monospace';
      ctx.translate(x + wd / 2, y + ht + 0); ctx.rotate(-Math.PI / 2.6);
      ctx.restore();
    }

    /* labels above bars */
    ctx.font = '600 11px -apple-system,sans-serif';
    ctx.fillStyle = 'rgba(251,113,133,.95)';
    ctx.fillText('A (incumbent)', cx - bw - 16, base - OFFICIAL_A * scale * 0.55 - 24);
    ctx.fillStyle = 'rgba(125,211,252,.95)';
    ctx.fillText('B (opposition)', cx - bw - 16, base - 12);

    /* convergence states */
    stN.set(`${verified.toLocaleString()} of ${N_SHEETS}`);
    stEst.set(verified ? (shareB > shareA ? `+${((shareB - shareA) * 100).toFixed(1)} pts` : `${((shareB - shareA) * 100).toFixed(1)} pts`) : 'no data yet');
    confM.set(clamp(verified / (N_SHEETS * 0.7), 0, 1));

    if (verified === 0) {
      ctx.fillStyle = 'rgba(238,242,255,.8)'; ctx.font = '600 13px -apple-system,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('The state announces: A wins 51.2% to 44.3%. No polling data published.', w / 2, 30);
      ctx.fillText('Can that be challenged? Only if citizens kept the receipts.', w / 2, 48);
      ctx.textAlign = 'left';
    } else if (verified > N_SHEETS * 0.7) {
      ctx.fillStyle = 'rgba(52,211,153,.95)'; ctx.font = '700 13px -apple-system,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('With most actas public, the true count is provable by anyone — no permission needed.', w / 2, 30);
      ctx.textAlign = 'left';
    }
  });
}
