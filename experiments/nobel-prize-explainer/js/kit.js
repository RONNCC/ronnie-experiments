/* kit.js — shared toolbox for every interactive exhibit */
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

/* mulberry32 seeded PRNG */
export function seeded(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- teardown management: router calls cleanupAll() between pages ---- */
const cleanups = [];
export function onCleanup(fn) { cleanups.push(fn); }
export function cleanupAll() {
  while (cleanups.length) { try { cleanups.pop()(); } catch (e) { /* noop */ } }
  loopFns.clear();
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

/* ---- shared requestAnimationFrame pump ---- */
const loopFns = new Set();
let rafId = null, lastT = 0;
function pump(t) {
  const dt = Math.min(60, t - lastT) / 1000; lastT = t;
  loopFns.forEach(f => { try { f(dt, t / 1000); } catch (e) { loopFns.delete(f); } });
  rafId = requestAnimationFrame(pump);
}
export function loop(fn) {
  loopFns.add(fn);
  if (!rafId) { lastT = performance.now(); rafId = requestAnimationFrame(pump); }
  return () => loopFns.delete(fn);
}

/* ---- tiny DOM builder ---- */
export function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) n.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return n;
}

/* ---- DPI-aware auto-resizing canvas inside .sim-canvas wrapper ---- */
export function makeCanvas(parent, height = 380) {
  const wrap = el('div', { class: 'sim-canvas' });
  const c = document.createElement('canvas');
  wrap.append(c); parent.append(wrap);
  const ctx = c.getContext('2d');
  let W = 300, H = height;
  function fit() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = wrap.clientWidth; H = height;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    c.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(wrap);
  onCleanup(() => ro.disconnect());
  return { wrap, c, ctx, W: () => W, H: () => H, refit: fit };
}

/* ---- control widgets ---- */
export function slider(parent, { label, min = 0, max = 100, step = 1, value = 50, fmt = (v) => v, onInput }) {
  const out = el('output', {}, fmt(value));
  const input = el('input', { type: 'range', min, max, step, value, 'aria-label': label });
  const paint = () => {
    const p = ((input.value - min) / (max - min)) * 100;
    input.style.setProperty('--fill', p + '%');
    out.textContent = fmt(+input.value);
  };
  input.addEventListener('input', () => { paint(); onInput && onInput(+input.value); });
  paint();
  parent.append(el('div', { class: 'ctl' }, el('label', {}, el('span', {}, label), out), input));
  return input;
}

export function button(parent, label, onClick, { primary = false, title = '' } = {}) {
  const b = el('button', { class: 'btn' + (primary ? ' primary' : ''), title, onclick: onClick }, label);
  parent.append(b); return b;
}

export function toggle(parent, { label, on = false, onChange }) {
  const tr = el('span', { class: 'tr' });
  const wrap = el('span', { class: 'switch' + (on ? ' on' : ''), role: 'switch', 'aria-checked': String(on), tabindex: '0' }, tr, el('span', {}, label));
  let state = on;
  const flip = () => { state = !state; wrap.classList.toggle('on', state); wrap.setAttribute('aria-checked', String(state)); onChange && onChange(state); };
  wrap.addEventListener('click', flip);
  wrap.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } });
  parent.append(wrap);
  return { set(v) { if (v !== state) flip(); }, get: () => state };
}

export function meter(parent, { label, color = 'var(--ok)', value = 0.5, fmt = (v) => Math.round(v * 100) + '%' }) {
  const val = el('b', {}, fmt(value));
  const fill = el('i');
  fill.style.background = color; fill.style.width = (value * 100) + '%';
  parent.append(el('div', { class: 'meter' },
    el('div', { class: 'm-label' }, el('span', {}, label), val),
    el('div', { class: 'bar' }, fill)));
  return { set(v) { fill.style.width = (clamp(v, 0, 1) * 100) + '%'; val.textContent = fmt(v); } };
}

export function statBox(parent, { label, fmt = (v) => String(v), initial = '—' }) {
  const v = el('div', { class: 's-val' }, String(initial));
  parent.append(el('div', { class: 'stat' }, el('div', { class: 's-lab' }, label), v));
  return { set(x) { v.innerHTML = String(fmt(x)); } };
}

/* ---- standard exhibit scaffolding ---- */
export function exhibitShell(root, { title, hint }) {
  const body = el('div', { class: 'exhibit-body' });
  root.append(
    el('div', { class: 'exhibit-head' },
      el('div', { class: 'ttl' }, el('span', { class: 'ping' }), title),
      hint ? el('div', { class: 'hint' }, hint) : null),
    body);
  return body;
}

export function controlsPanel(grid) {
  const col = el('div', { class: 'controls' });
  grid.append(col);
  return col;
}

export function caption(body, html) {
  body.append(el('p', { class: 'caption', html }));
}

/* ---- misc math/graphics helpers ---- */
export function wavelengthToRGB(w) { // ~380-700nm visible approximation
  let r = 0, g = 0, b = 0;
  if (w < 440) { r = (440 - w) / 60; b = 1; }
  else if (w < 490) { g = (w - 440) / 50; b = 1; }
  else if (w < 510) { g = 1; b = (510 - w) / 20; }
  else if (w < 580) { r = (w - 510) / 70; g = 1; }
  else if (w < 645) { r = 1; g = (645 - w) / 65; }
  else { r = 1; }
  let f = 1;
  if (w < 420) f = 0.3 + 0.7 * (w - 380) / 40;
  else if (w > 660) f = 0.3 + 0.7 * (700 - w) / 40;
  return `rgb(${Math.round(r * f * 255)},${Math.round(g * f * 255)},${Math.round(b * f * 255)})`;
}

export function glow(ctx, x, y, r, color, alpha = 0.55) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
}

export function arrowTo(ctx, x1, y1, x2, y2, color, wdt = 1.5) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save(); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = wdt;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 8 * Math.cos(a - 0.42), y2 - 8 * Math.sin(a - 0.42));
  ctx.lineTo(x2 - 8 * Math.cos(a + 0.42), y2 - 8 * Math.sin(a + 0.42));
  ctx.closePath(); ctx.fill(); ctx.restore();
}
