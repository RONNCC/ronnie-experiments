/* 2023 Chemistry — Quantum dots: colour from size via quantum confinement. */
import { exhibitShell, makeCanvas, slider, toggle, loop, el, statBox, caption, controlsPanel, wavelengthToRGB, glow, TAU, lerp } from '../kit.js';

const sizeToNm = { min: 2, max: 8 };
function nmToLambda(nm) { return lerp(470, 635, (nm - sizeToNm.min) / (sizeToNm.max - sizeToNm.min)); } // 2nm blue → 8nm red

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'Shrink a crystal, change its colour',
    hint: 'One material, whole rainbow — pick a size and switch on the UV lamp',
  });

  let nm = 3.2, uvOn = true, pulse = 0;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W, H } = makeCanvas(grid, 360);
  const panel = controlsPanel(grid);

  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const stLam = statBox(readouts, { label: 'Glows at' });
  const stGap = statBox(readouts, { label: 'Energy gap' });
  function update() {
    const lam = nmToLambda(nm);
    stLam.set(`~${Math.round(lam)} nm`);
    stGap.set(`${(1240 / lam).toFixed(2)} eV`);
  }
  update();

  slider(panel, {
    label: 'Quantum dot diameter', min: sizeToNm.min, max: sizeToNm.max, step: 0.1, value: nm,
    fmt: v => v.toFixed(1) + ' nm', onInput: v => { nm = v; update(); }
  });
  toggle(panel, { label: 'UV lamp', on: uvOn, onChange: v => { uvOn = v; pulse = 1; } });

  // vial row — famous multicolour flasks
  const vials = el('div', { style: 'display:flex;gap:.4rem;margin-top:.4rem' });
  panel.append(vials);
  for (let i = 0; i < 6; i++) {
    const d = sizeToNm.min + (i / 5) * (sizeToNm.max - sizeToNm.min);
    const col = wavelengthToRGB(nmToLambda(d));
    const v = el('button', {
      title: `${d.toFixed(1)} nm`,
      style: `flex:1;height:44px;border-radius:6px 6px 10px 10px;border:1px solid var(--border);cursor:pointer;background:linear-gradient(180deg,#0a0e18 30%,${col} 130%);position:relative`,
      onclick: () => { nm = d; update(); },
    });
    v.innerHTML = `<span style="position:absolute;bottom:2px;left:0;right:0;font-size:9px;color:#dbe3f5;font-family:var(--mono)">${d.toFixed(1)}</span>`;
    vials.append(v);
  }
  caption(panel, 'Same semiconductor in every vial — only the diameter differs. Tap a vial to load that dot.');

  const photons = []; // emitted photon ripples

  loop((dt, t) => {
    const w = W(), h = H();
    pulse = Math.max(0, pulse - dt * 1.5);
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);

    const lam = nmToLambda(nm);
    const col = wavelengthToRGB(lam);
    const cx = w * 0.42, cy = h * 0.46;
    const R = 14 + (nm - sizeToNm.min) * 7; // visual size

    // confinement box (drawn as dashed walls that tighten for small dots)
    const boxHalf = 60 + (nm - sizeToNm.min) * 26;
    ctx.strokeStyle = 'rgba(151,163,189,.35)'; ctx.setLineDash([6, 6]);
    ctx.strokeRect(cx - boxHalf, cy - boxHalf, boxHalf * 2, boxHalf * 2);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(151,163,189,.7)'; ctx.font = '11px ui-monospace,monospace';
    ctx.fillText('the electron\'s shrinking world', cx - boxHalf, cy - boxHalf - 8);

    // UV beam
    if (uvOn) {
      const grad = ctx.createLinearGradient(0, 0, 0, cy - R);
      grad.addColorStop(0, 'rgba(167,139,250,.5)'); grad.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx - 26, 0); ctx.lineTo(cx + 26, 0); ctx.lineTo(cx + 10, cy - R); ctx.lineTo(cx - 10, cy - R);
      ctx.closePath(); ctx.fill();
      // incoming photon wiggles
      ctx.strokeStyle = 'rgba(196,181,253,.9)'; ctx.lineWidth = 1.5;
      for (let k = 0; k < 3; k++) {
        const y0 = ((t * 90 + k * 40) % (cy - R));
        ctx.beginPath();
        for (let y = Math.max(0, y0 - 30); y < y0; y += 3) ctx.lineTo(cx + Math.sin(y * 0.4) * 8, y);
        ctx.stroke();
      }
    }

    // the dot itself
    const emit = uvOn ? (0.6 + 0.4 * Math.sin(t * 3) * Math.sin(t * 3)) : 0.06;
    glow(ctx, cx, cy, R * 3.2, col, 0.5 * emit + pulse * 0.5);
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.25 + 0.75 * emit;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();

    // random emitted photons when glowing
    if (uvOn && Math.random() < 0.1) photons.push({ a: Math.random() * TAU, r: R + 2 });
    for (let i = photons.length - 1; i >= 0; i--) {
      const p = photons[i]; p.r += 90 * dt;
      const x = cx + Math.cos(p.a) * p.r, y = cy + Math.sin(p.a) * p.r;
      ctx.strokeStyle = col; ctx.globalAlpha = Math.max(0, 1 - p.r / 240); ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = -8; k <= 8; k += 2) {
        const aa = p.a + k * 0.012;
        ctx.lineTo(cx + Math.cos(aa) * (p.r + Math.sin(k) * 2), cy + Math.sin(aa) * (p.r + Math.sin(k) * 2));
      }
      ctx.stroke(); ctx.globalAlpha = 1;
      if (p.r > 240) photons.splice(i, 1);
    }

    // energy diagram on the right
    const ex = w * 0.72, ey = h * 0.5, ew = w * 0.22;
    const gap = lerp(90, 34, (nm - sizeToNm.min) / 6); // visual gap shrinks with size
    ctx.strokeStyle = 'rgba(151,163,189,.8)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ex, ey - gap / 2); ctx.lineTo(ex + ew, ey - gap / 2);
    ctx.moveTo(ex, ey + gap / 2); ctx.lineTo(ex + ew, ey + gap / 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(151,163,189,.75)'; ctx.font = '11px ui-monospace,monospace';
    ctx.fillText('empty band', ex, ey - gap / 2 - 8);
    ctx.fillText('filled band', ex, ey + gap / 2 + 16);
    // gap arrow
    ctx.strokeStyle = col; ctx.lineWidth = 2.5;
    const bounce = Math.sin(t * 2.4) * 3;
    ctx.beginPath(); ctx.moveTo(ex + ew / 2, ey + gap / 2 - 4); ctx.lineTo(ex + ew / 2 + bounce, ey - gap / 2 + 5); ctx.stroke();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(ex + ew / 2 + bounce, ey - gap / 2 + 4, 3.5, 0, TAU); ctx.fill();

    ctx.fillStyle = 'rgba(238,242,255,.85)'; ctx.font = '600 13px -apple-system,sans-serif';
    ctx.fillText(`${nm.toFixed(1)} nm dot → ${Math.round(lam)} nm glow`, 16, h - 16);
  });

  caption(body, 'A shorter straw plays a higher note, and a smaller dot holds electrons in a tighter box — raising the energy they need to jump bands. Blue light carries more energy than red, so <b>small dots glow blue, big dots glow red</b>. Ekimov saw it in glass (1981), Brus explained it in beakers (1983), Bawendi made dots good enough to build with (1993) — and now they\'re inside QLED TVs.');
}
