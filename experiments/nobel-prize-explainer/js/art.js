/* art.js — seeded generative cover art for prize tiles (canvas, no image assets) */
import { seeded, TAU } from './kit.js';

const MOTIFS = {
  physics: paintPhysics,
  chemistry: paintChemistry,
  medicine: paintMedicine,
  literature: paintLiterature,
  peace: paintPeace,
  economics: paintEconomics,
};

export function drawArt(canvas, category, seed, w = 640, h = 300) {
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const rnd = seeded(seed * 7919 + category.length * 131);

  // deep background wash with two color glows
  ctx.fillStyle = '#080b14'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = rad(ctx, w * (0.2 + rnd() * 0.25), h * 0.15, w * 0.8, hexA(category, 0.30));
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = rad(ctx, w * (0.65 + rnd() * 0.3), h * 0.95, w * 0.7, hexA(category, 0.16));
  ctx.fillRect(0, 0, w, h);

  (MOTIFS[category] || paintPhysics)(ctx, rnd, w, h);

  // star dust
  ctx.save();
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.06 + rnd() * 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, rnd() * 1.4 + 0.3, 0, TAU); ctx.fill();
  }
  ctx.restore();

  // vignette
  const v = ctx.createLinearGradient(0, h * 0.35, 0, h);
  v.addColorStop(0, 'rgba(7,9,15,0)'); v.addColorStop(1, 'rgba(7,9,15,.65)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}

const COLORS = {
  physics: '#818cf8', chemistry: '#34d399', medicine: '#fb7185',
  literature: '#fbbf24', peace: '#38bdf8', economics: '#a3e635',
};
function hexA(cat, a) {
  const hex = COLORS[cat] || '#818cf8';
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function rad(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  return g;
}

/* -- motif painters -- */
function paintPhysics(ctx, rnd, w, h) {
  const cx = w * 0.68, cy = h * 0.52;
  ctx.save();
  for (let i = 1; i <= 4; i++) {
    ctx.strokeStyle = hexA('physics', 0.5 - i * 0.08);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 34 * i + rnd() * 14, (34 * i) * 0.42, -0.5 + rnd() * 0.24, 0, TAU);
    ctx.stroke();
    // electron
    const a = rnd() * TAU;
    ctx.fillStyle = '#c7d0ff';
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 34 * i, cy + Math.sin(a) * 34 * i * 0.42, 2.6, 0, TAU); ctx.fill();
  }
  glowBlob(ctx, cx, cy, 26, '#c7d0ff', 0.9);
  // wave
  ctx.strokeStyle = hexA('physics', 0.55); ctx.lineWidth = 2;
  ctx.beginPath();
  const f = 2 + rnd() * 3, amp = 26 + rnd() * 14;
  for (let x = 0; x <= w * 0.5; x += 4) ctx.lineTo(w * 0.04 + x, h * 0.74 + Math.sin(x * 0.045 * f) * amp * Math.sin(x / (w * 0.5) * Math.PI));
  ctx.stroke();
  ctx.restore();
}

function paintChemistry(ctx, rnd, w, h) {
  const hex = hexA('chemistry', 0.5);
  ctx.save();
  const s = 30 + rnd() * 8;
  const nodes = [];
  for (let gy = -1; gy < h / (s * 0.75) + 1; gy++) {
    for (let gx = -1; gx < w / s + 1; gx++) {
      const x = gx * s + (gy % 2 ? s / 2 : 0), y = gy * s * 0.75;
      if (rnd() < 0.24) continue;
      nodes.push([x, y]);
    }
  }
  ctx.strokeStyle = hexA('chemistry', 0.22); ctx.lineWidth = 1;
  for (const [x, y] of nodes) {
    for (const [x2, y2] of nodes) {
      const d = Math.hypot(x - x2, y - y2);
      if (d > 0 && d < s * 1.15) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke(); }
    }
  }
  for (const [x, y] of nodes) {
    const r = 3 + rnd() * 5;
    glowBlob(ctx, x, y, r * 2.6, hex, 0.5);
    ctx.fillStyle = rnd() < 0.3 ? '#a7f3d0' : hex;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function paintMedicine(ctx, rnd, w, h) {
  ctx.save();
  const y0 = h * 0.28, y1 = h * 0.78, col = hexA('medicine', 0.65);
  ctx.lineWidth = 3;
  for (const ph of [0, Math.PI]) {
    ctx.strokeStyle = ph ? hexA('medicine', 0.4) : col;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const t = x / w;
      const y = (y0 + y1) / 3.6 * Math.sin(t * TAU * 1.6 + ph) + (y0 + y1) / 2;
      ctx.lineTo(x, y + (y1 - y0) * 0.16);
    }
    ctx.stroke();
  }
  // rungs
  ctx.strokeStyle = hexA('medicine', 0.3); ctx.lineWidth = 2;
  for (let x = 20; x < w; x += 34) {
    const t = x / w;
    const ay = (y0 + y1) / 3.6 * Math.sin(t * TAU * 1.6) + (y0 + y1) / 2 + (y1 - y0) * 0.16;
    const by = (y0 + y1) / 3.6 * Math.sin(t * TAU * 1.6 + Math.PI) + (y0 + y1) / 2 + (y1 - y0) * 0.16;
    ctx.beginPath(); ctx.moveTo(x, ay); ctx.lineTo(x, by); ctx.stroke();
  }
  // cells
  for (let i = 0; i < 8; i++) {
    const x = rnd() * w, y = rnd() * h, r = 10 + rnd() * 22;
    glowBlob(ctx, x, y, r * 2.2, hexA('medicine', 0.35), 0.5);
  }
  ctx.restore();
}

function paintLiterature(ctx, rnd, w, h) {
  ctx.save();
  let y = h * 0.22;
  while (y < h * 0.86) {
    const x0 = w * 0.08, x1 = x0 + (0.25 + rnd() * 0.6) * w * 0.84;
    ctx.strokeStyle = hexA('literature', 0.18 + rnd() * 0.3);
    ctx.lineWidth = 2.5 + rnd() * 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    let cy = y;
    ctx.moveTo(x0, cy);
    for (let x = x0; x < x1; x += 26) {
      cy += (rnd() - 0.5) * 5;
      ctx.quadraticCurveTo(x + 10, cy + (rnd() - 0.5) * 6, Math.min(x + 26, x1), cy);
    }
    ctx.stroke();
    y += 17 + rnd() * 12;
  }
  // feather-ish swoosh
  glowBlob(ctx, w * (0.6 + rnd() * 0.25), h * 0.5, 60, hexA('literature', 0.5), 0.5);
  ctx.restore();
}

function paintPeace(ctx, rnd, w, h) {
  ctx.save();
  const cx = w * 0.5, cy = h * 0.62;
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI / 2 + (i - 13) * 0.145 + (rnd() - 0.5) * 0.03;
    const r1 = 26, r2 = h * (0.55 + rnd() * 0.45);
    ctx.strokeStyle = hexA('peace', 0.10 + rnd() * 0.22);
    ctx.lineWidth = 1.4 + rnd() * 2;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke();
  }
  glowBlob(ctx, cx, cy, 52, '#bfe9ff', 0.9);
  // olive arc
  ctx.strokeStyle = hexA('peace', 0.7); ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(cx, cy, 74, rnd() * TAU, rnd() * TAU + 4.2); ctx.stroke();
  ctx.restore();
}

function paintEconomics(ctx, rnd, w, h) {
  ctx.save();
  const n = 14, bw = w / (n * 2.1);
  for (let i = 0; i < n; i++) {
    const bh = h * (0.12 + (i / n) * 0.5 + rnd() * 0.14);
    ctx.fillStyle = hexA('economics', 0.10 + (i / n) * 0.30);
    const x = w * 0.06 + i * (bw * 1.6);
    ctx.beginPath();
    ctx.roundRect(x, h * 0.9 - bh, bw, bh, 3);
    ctx.fill();
  }
  // rising curve
  ctx.strokeStyle = '#d9f99d'; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
  ctx.beginPath();
  let x = w * 0.05, y = h * 0.8;
  ctx.moveTo(x, y);
  while (x < w * 0.96) {
    const nx = x + w * 0.055; const ny = Math.max(h * 0.14, y - h * (0.02 + rnd() * 0.1));
    ctx.lineTo(nx, ny); x = nx; y = ny;
  }
  ctx.stroke();
  ctx.fillStyle = '#d9f99d';
  ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
  ctx.restore();
}

function glowBlob(ctx, x, y, r, color, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}
