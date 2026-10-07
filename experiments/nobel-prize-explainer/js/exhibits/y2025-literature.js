/* 2025 Literature — Krasznahorkai: the endless sentence. Hold to read on one breath, in the rain. */
import { exhibitShell, makeCanvas, slider, loop, el, caption, meter, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';

const SENTENCE = `and the rain kept falling on the estate as it had fallen all through October and as it would surely fall forever, drumming on the corrugated tin of the cowsheds and pooling in the ruts of the yard where the tractor had sunk to its axles, while inside the tavern the landlord drew another round for men who had nowhere left to go, men who watched the door because Irimiás had promised to return with money and a plan and neither ever quite arrived, and the wind moved through the poplars with a sound like pages turning, as if the whole valley were one long sentence no one could stop reading, not even the reader, not even at the end,`;

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'One breath, one sentence',
    hint: 'Press and hold to read. The sentence does not stop. Neither, if you can help it, should you. (An original pastiche, not his text.)',
  });

  let holding = false, breath = 1, offset = 0, wordsRead = 0, best = 0, speed = 1;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { wrap, ctx, W: CW, H } = makeCanvas(grid, 360);
  const panel = controlsPanel(grid);

  const breathM = meter(panel, { label: 'Your literary breath', color: 'var(--warn)', value: 1 });
  const rd = el('div', { class: 'readout' });
  panel.append(rd);
  const stWords = statBox(rd, { label: 'Words read this breath' });
  const stBest = statBox(rd, { label: 'Best streak' });
  slider(panel, { label: 'Sentence momentum', min: 0.5, max: 2, step: 0.1, value: 1, fmt: v => '×' + v.toFixed(1), onInput: v => { speed = v; } });
  caption(panel, 'This is the Krasznahorkai effect in miniature: the sentence <b>refuses to end</b>, so the reader can\'t rest — dread and momentum wind tighter with every comma. He has joked that the full stop is unnecessary — the period "belongs to God". Run out of breath mid-sentence and feel what his characters feel: the sentence goes on without you.');

  const words = SENTENCE.split(' ');
  const drops = Array.from({ length: 130 }, () => ({ x: Math.random(), y: Math.random(), l: 0.5 + Math.random(), v: 0.7 + Math.random() * 0.6 }));

  wrap.style.cursor = 'pointer';
  wrap.addEventListener('pointerdown', () => holding = true);
  window.addEventListener('pointerup', () => holding = false);
  window.addEventListener('keydown', (e) => { if (e.code === 'Space' && wrap.matches(':hover')) { e.preventDefault(); holding = true; } });
  window.addEventListener('keyup', (e) => { if (e.code === 'Space') holding = false; });

  let suffocate = 0;
  loop((dt, t) => {
    const w = CW(), h = H();
    const active = holding && breath > 0.02;
    if (holding) breath = clamp(breath - dt / 16, 0, 1);
    else breath = clamp(breath + dt / 5, 0, 1);
    breathM.set(breath);

    if (active) {
      offset += dt * 60 * speed;
      const wr = Math.floor(offset / 14);
      if (wr !== wordsRead) { wordsRead = wr; best = Math.max(best, wr); stWords.set(String(wr % (words.length + 1))); stBest.set(String(best)); }
      suffocate = 0;
    } else if (holding) {
      suffocate = clamp(suffocate + dt * 4, 0, 1); // holding but out of breath: panic blur
    } else suffocate = clamp(suffocate - dt * 3, 0, 1);

    /* stormy plain backdrop */
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b0d12'); g.addColorStop(0.7, '#10131c'); g.addColorStop(1, '#06070a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // rain
    ctx.strokeStyle = 'rgba(148,163,184,.32)'; ctx.lineWidth = 1.1;
    for (const d of drops) {
      d.y += d.v * dt * 1.1 * (active ? 1.6 : 1);
      if (d.y > 1) { d.y = -0.1; d.x = Math.random(); }
      const x = d.x * w + d.y * 40, y = d.y * h;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4 * d.l, y - 12 * d.l); ctx.stroke();
    }
    // sodden ground
    ctx.fillStyle = 'rgba(10,12,18,.9)';
    ctx.beginPath(); ctx.moveTo(0, h * 0.86);
    for (let x = 0; x <= w; x += 30) ctx.lineTo(x, h * 0.86 + Math.sin(x * 0.02 + t * 0.5) * 4);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

    /* the sentence, scrolling like film credits sideways */
    const lineY = h * 0.42;
    ctx.save();
    ctx.font = 'italic 500 22px ui-serif, Georgia, serif';
    ctx.textBaseline = 'middle';
    const jitter = suffocate * 2.4;
    const blurG = ctx.createLinearGradient(0, lineY - 40, 0, lineY + 40);
    if (suffocate > 0.1) {
      ctx.shadowColor = 'rgba(238,242,255,.7)'; ctx.shadowBlur = suffocate * 9;
    }
    const fullText = SENTENCE + ' ' + SENTENCE;
    const tw = ctx.measureText(fullText.slice(0, fullText.length / 2)).width;
    let sx = w * 0.9 - (offset % tw);
    ctx.fillStyle = `rgba(238,242,255,${0.92 - suffocate * 0.5})`;
    ctx.fillText(fullText, sx + (Math.random() - 0.5) * jitter, lineY + (Math.random() - 0.5) * jitter);
    ctx.restore();

    // progress: comma count as chapters
    ctx.fillStyle = 'rgba(251,191,36,.85)'; ctx.font = '12px ui-monospace,monospace';
    const commas = (SENTENCE.slice(0, clamp(wordsRead, 0, words.length)).match(/,/g) || []).length;
    ctx.fillText('commas survived: ' + commas + '   periods encountered: 0', 16, h - 18);

    if (!holding && wordsRead === 0) {
      ctx.fillStyle = 'rgba(238,242,255,.75)'; ctx.font = '600 14px -apple-system,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('press and hold anywhere to begin reading', w / 2, h * 0.62);
      ctx.textAlign = 'left';
    }
  });
}
