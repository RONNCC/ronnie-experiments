// DOM wiring for the Lenses Lab. All arithmetic lives in logic.mjs so it stays
// testable in Node and identical in the browser.

import { HARDWARE, attentionCost, roofline, recommendBackbone } from './logic.mjs';

const $ = (id) => document.getElementById(id);

const number = (id, fallback = 0) => {
  const raw = $(id)?.value;
  const value = raw === undefined ? fallback : Number(raw);
  return Number.isFinite(value) ? value : fallback;
};

// ---- formatting helpers ---------------------------------------------------

const fmt = (value, digits = 0) =>
  value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const fmtBig = (value, suffix = '') => {
  const units = [
    { limit: 1e9, scale: 1e9, symbol: 'G' },
    { limit: 1e6, scale: 1e6, symbol: 'M' },
    { limit: 1e3, scale: 1e3, symbol: 'K' },
  ];
  if (value < units[units.length - 1].limit) return `${fmt(value, value < 100 ? 1 : 0)}${suffix}`;
  for (const unit of units) {
    if (value >= unit.limit) {
      const scaled = value / unit.scale;
      return `${fmt(scaled, scaled < 10 ? 1 : 0)} ${unit.symbol}${suffix}`;
    }
  }
  return `${fmt(value, 1)}${suffix}`;
};

const fmtBytes = (bytes) => `${fmtBig(bytes)}B`;

// ---- 01 — roofline explorer ----------------------------------------------

function renderRoofline() {
  const key = $('roofline-hardware').value;
  const hardware = HARDWARE[key];
  if (!hardware) return;
  const intensity = Math.max(0, number('roofline-intensity'));
  const result = roofline(intensity, hardware);
  $('roofline-tflops').textContent = `${fmt(result.boundTflops, result.boundTflops < 10 ? 2 : 0)} TF/s`;
  $('roofline-ridge').textContent = `${fmt(result.ridge, 1)} FLOP/byte`;
  $('roofline-regime').textContent = intensity < result.ridge
    ? 'Memory-bound'
    : intensity > result.ridge * 1.001
      ? 'Compute-bound'
      : 'At the ridge';
  $('roofline-util').textContent = `${fmt(result.utilization * 100, 1)}%`;
  $('roofline-rate').textContent = intensity > 0
    ? `${fmt(result.boundTflops / intensity, 2)} TB/s of ${fmt(hardware.bandwidthTBps, 1)}`
    : `${fmt(hardware.bandwidthTBps, 1)} TB/s`;
}

// ---- 02 — attention memory ----------------------------------------------

function renderAttention() {
  const seqLen = number('att-seq', 4096);
  const headDim = number('att-dim', 128);
  const heads = number('att-heads', 16);
  const batch = number('att-batch', 8);
  const flash = $('att-flash').checked;
  const decode = $('att-phase').value === 'decode';

  const usable =
    seqLen >= 64 && seqLen <= 65536 && headDim >= 8 && headDim <= 1024 &&
    heads >= 1 && heads <= 256 && batch >= 1 && batch <= 8192;
  $('attention-error').hidden = usable;
  if (!usable) return;

  const cost = attentionCost({ seqLen, headDim, heads, batch, flash, decode });
  $('attention-scheme').textContent = `${cost.phase} · ${flash ? 'fused' : 'naive'}`;
  $('att-flops').textContent = `${fmtBig(cost.flops)} FLOPs`;
  $('att-bytes').textContent = fmtBytes(cost.bytesUsed);
  $('att-intensity').textContent = `${fmt(cost.intensity, 1)} FLOP/byte`;
  $('att-naive').textContent = `${fmt(cost.intensityNaive, 1)} FLOP/byte`;
}

// ---- 03 — backbone recommender -------------------------------------------

const RECOMMEND_CHAPTERS = { cnn: 3, vit: 1, ssm: 11, mobile: 14, nav: 4 };

function renderRecommendation() {
  const rec = recommendBackbone({
    dataRegime: $('rec-data').value,
    latency: $('rec-latency').value,
    resolution: $('rec-resolution').value,
    hardware: $('rec-hardware').value,
    dense: $('rec-dense').checked,
  });
  $('route-title').textContent = rec.title;
  $('route-reason').textContent = rec.reason;
  $('route-runner').textContent = `${rec.runner} (score ${rec.runnerPoints})`;
  $('route-lenses').textContent = rec.lenses;
  $('route-data').textContent = rec.readPath;
  $('route-test').textContent = rec.testFirst;
  $('route-link').href = `#chapter-${RECOMMEND_CHAPTERS[rec.family]}`;
}

// ---- reading progress, TOC highlight, search ------------------------------

function renderSearch(query) {
  const results = $('search-results');
  const links = Array.from(document.querySelectorAll('#chapter-nav .toc-link'));
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    results.hidden = true;
    results.innerHTML = '';
    return;
  }
  const matches = links.filter((link) => link.textContent.toLowerCase().includes(trimmed)).slice(0, 12);
  if (!matches.length) {
    results.innerHTML = '<p>No chapter matches that term.</p>';
  } else {
    results.innerHTML = matches.map((link) => {
      const num = link.querySelector('.toc-num')?.textContent ?? '';
      const title = link.querySelector('span:last-child')?.textContent ?? link.textContent;
      return `<a class="search-hit" href="${link.getAttribute('href')}"><strong>${num} ${title}</strong></a>`;
    }).join('');
  }
  results.hidden = false;
}

function init() {
  $('roofline-hardware').addEventListener('change', renderRoofline);
  $('roofline-intensity').addEventListener('input', renderRoofline);

  ['att-seq', 'att-dim', 'att-heads', 'att-batch'].forEach((id) =>
    $(id).addEventListener('input', renderAttention));
  ['att-phase', 'att-flash'].forEach((id) => $(id).addEventListener('change', renderAttention));

  ['rec-data', 'rec-latency', 'rec-resolution', 'rec-hardware'].forEach((id) =>
    $(id).addEventListener('change', renderRecommendation));
  $('rec-dense').addEventListener('change', renderRecommendation);

  $('book-search').addEventListener('input', (event) => renderSearch(event.target.value));
  $('book-search').addEventListener('keydown', (event) => {
    if (event.key === 'Escape') renderSearch('');
  });

  const progress = $('read-progress');
  const article = document.querySelector('.prose');
  const onScroll = () => {
    if (!article) return;
    const start = article.offsetTop;
    const total = article.scrollHeight - window.innerHeight;
    const ratio = total <= 0 ? 0 : Math.min(1, Math.max(0, (window.scrollY - start) / total));
    progress.style.width = `${(ratio * 100).toFixed(2)}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the chapter heading nearest the top of the viewport.
  const links = new Map();
  const markers = Array.from(article?.querySelectorAll('div[id^="chapter-"]') ?? []);
  document.querySelectorAll('#chapter-nav .toc-link').forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    const marker = document.getElementById(id);
    if (marker) links.set(marker, link);
  });
  if (markers.length && links.size) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) {
        const link = links.get(visible[0].target);
        document.querySelectorAll('#chapter-nav .toc-link.active').forEach((active) => active.classList.remove('active'));
        link?.classList.add('active');
      }
    }, { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5, 1] });
    markers.forEach((marker) => observer.observe(marker));
  }

  renderRoofline();
  renderAttention();
  renderRecommendation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
