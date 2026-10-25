import { reliability } from './logic.mjs';

const $ = (id) => document.getElementById(id);
const pct = (value) => `${(value * 100).toFixed(1)}%`;

function updateLab() {
  const p = Number($('step-success').value) / 100;
  const n = Number($('steps').value);
  const d = Number($('detect-rate').value) / 100;
  const r = Number($('recover-rate').value) / 100;
  const result = reliability({ stepSuccess: p, steps: n, detection: d, recovery: r });
  $('step-success-out').value = `${(p * 100).toFixed(1)}%`;
  $('steps-out').value = `${n}`;
  $('detect-rate-out').value = `${(d * 100).toFixed(0)}%`;
  $('recover-rate-out').value = `${(r * 100).toFixed(0)}%`;
  $('raw-success').textContent = pct(result.raw);
  $('gated-success').textContent = pct(result.gated);
  $('task-success').textContent = pct(result.gated);
  $('failed-steps').textContent = result.expectedFailures.toFixed(1);
  $('recovery-fraction').textContent = pct(result.recoveryFraction);
}

function renderSearch(query) {
  const results = $('search-results');
  const links = [...document.querySelectorAll('#chapter-nav .toc-link')];
  const q = query.trim().toLowerCase();
  if (!q) { results.hidden = true; results.replaceChildren(); return; }
  const matches = links.filter((link) => link.textContent.toLowerCase().includes(q)).slice(0, 12);
  results.replaceChildren();
  if (!matches.length) {
    const p = document.createElement('p'); p.textContent = 'No chapter matches that term.'; results.append(p);
  } else {
    for (const link of matches) {
      const a = document.createElement('a'); a.className = 'search-hit'; a.href = link.getAttribute('href');
      const strong = document.createElement('strong'); strong.textContent = link.textContent.trim(); a.append(strong); results.append(a);
    }
  }
  results.hidden = false;
}

function init() {
  ['step-success', 'steps', 'detect-rate', 'recover-rate'].forEach((id) => $(id).addEventListener('input', updateLab));
  $('book-search').addEventListener('input', (event) => renderSearch(event.target.value));
  $('book-search').addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.target.value = ''; renderSearch(''); } });

  const progress = $('read-progress');
  const article = document.querySelector('.prose');
  const onScroll = () => {
    if (!article) return;
    const total = article.scrollHeight - window.innerHeight;
    const ratio = total <= 0 ? 0 : Math.min(1, Math.max(0, (window.scrollY - article.offsetTop) / total));
    progress.style.width = `${(ratio * 100).toFixed(2)}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const anchors = [...document.querySelectorAll('#chapter-nav .toc-link')];
  const map = new Map(anchors.map((link) => [document.getElementById(link.hash.slice(1)), link]).filter(([node]) => node));
  if (map.size && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) {
        document.querySelectorAll('#chapter-nav .toc-link.active').forEach((item) => item.classList.remove('active'));
        map.get(visible[0].target)?.classList.add('active');
      }
    }, { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5, 1] });
    for (const marker of map.keys()) observer.observe(marker);
  }
  updateLab();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
