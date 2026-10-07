/* app.js — router, gallery with filters, and prize detail pages */
import { PRIZES, CATEGORIES, CAT_ORDER, YEARS, YEAR_NOTES } from './data.js';
import { drawArt } from './art.js';
import { el, cleanupAll, loop, onCleanup } from './kit.js';

const app = document.getElementById('app');
const state = { year: 'all', cat: 'all', q: '', sort: 'new' };

/* ---------- shared chrome ---------- */
function setAccent(color) { document.documentElement.style.setProperty('--accent', color); }

function catChipStyle(cat) { return `--chip-c:${CATEGORIES[cat].color}`; }

function icon(cat, size = 14) {
  const paths = {
    physics: '<circle cx="12" cy="12" r="2.2"/><g fill="none"><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/></g>',
    chemistry: '<path fill="none" d="M9 3h6M10 3v6.3L4.5 19a2.4 2.4 0 0 0 2.1 3.6h10.8a2.4 2.4 0 0 0 2.1-3.6L14 9.3V3"/><path fill="none" d="M7.2 15h9.6"/>',
    medicine: '<path fill="none" d="M4.8 8.5c1.8 3.2 4.6 4.4 7.2 4.4s5.4-1.2 7.2-4.4M4.8 15.5c1.8-3.2 4.6-4.4 7.2-4.4s5.4 1.2 7.2 4.4M12 1.5v21"/>',
    literature: '<path fill="none" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path fill="none" d="M20 17v5H6.5a2.5 2.5 0 0 1 0-5"/>',
    peace: '<path fill="none" d="M12 3v18M12 21c-4 0-7-2-9-5 3 0 5-1 6-3l-5-5c2 0 4 .7 5 2V7l3-4 3 4v3c1-1.3 3-2 5-2l-5 5c1 2 3 3 6 3-2 3-5 5-9 5z"/>',
    economics: '<path fill="none" d="M3 21h18M5 21v-6M10 21V9M15 21v-9M20 21V5"/><path fill="none" d="M4 9l5-4 4 3 6-5"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[cat] || paths.physics}</svg>`;
}

/* ---------- hero background ---------- */
function heroCanvas(mount) {
  const c = document.createElement('canvas');
  c.id = 'heroCanvas';
  mount.prepend(c);
  const ctx = c.getContext('2d');
  let W, H;
  const fit = () => { W = c.width = mount.clientWidth; H = c.height = mount.clientHeight; };
  fit();
  const ro = new ResizeObserver(fit); ro.observe(mount); onCleanup(() => ro.disconnect());
  const cols = ['232,197,104', '129,140,248', '125,211,252', '52,211,153', '251,113,133'];
  const blobs = Array.from({ length: 9 }, (_, i) => ({
    x: Math.random(), y: Math.random(), r: 0.22 + Math.random() * 0.28,
    dx: (Math.random() - .5) * 0.00016, dy: (Math.random() - .5) * 0.00012,
    col: cols[i % cols.length], ph: Math.random() * 7,
  }));
  loop((dt, t) => {
    ctx.fillStyle = '#07090f'; ctx.fillRect(0, 0, W, H);
    for (const b of blobs) {
      b.x = (b.x + b.dx + 1) % 1; b.y = (b.y + b.dy + 1) % 1;
      const r = b.r * Math.min(W, H) * (1 + 0.14 * Math.sin(t * 0.4 + b.ph));
      const g = ctx.createRadialGradient(b.x * W, b.y * H, 0, b.x * W, b.y * H, r);
      g.addColorStop(0, `rgba(${b.col},0.14)`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x * W, b.y * H, r, 0, 7); ctx.fill();
    }
    // faint grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < W; x += 56) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y < H; y += 56) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  });
}

/* ---------- GALLERY ---------- */
function collectFiltered() {
  let list = PRIZES.slice();
  const q = state.q.trim().toLowerCase();
  list = list.filter(p =>
    (state.year === 'all' || p.year === +state.year) &&
    (state.cat === 'all' || p.category === state.cat) &&
    (!q || p.title.toLowerCase().includes(q) ||
      p.laureates.some(l => l.name.toLowerCase().includes(q)) ||
      (p.citation || '').toLowerCase().includes(q) ||
      (p.tagline || '').toLowerCase().includes(q)));
  if (state.sort === 'new') list.sort((a, b) => b.year - a.year || CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category));
  else if (state.sort === 'old') list.sort((a, b) => a.year - b.year || CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category));
  else if (state.sort === 'cat') list.sort((a, b) => CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category) || b.year - a.year);
  return list;
}

function prizeCard(p) {
  const art = el('div', { class: 'card-art' });
  const catC = CATEGORIES[p.category].color;
  const card = p.teaser
    ? el('div', { class: 'card teaser', style: `--cat:${catC}` })
    : el('a', { class: 'card fade-up', href: `#/prize/${p.id}`, style: `--cat:${catC}` });

  const cv = document.createElement('canvas');
  art.append(cv);
  requestAnimationFrame(() => drawArt(cv, p.category, p.artSeed));
  art.append(el('span', { class: 'card-cat', html: icon(p.category, 12) + '&nbsp;' + CATEGORIES[p.category].name }));
  if (p.teaser) {
    art.append(el('div', { class: 'teaser-badge' }, el('span', {}, '🔔 Announces ' + p.teaserDate)));
  } else {
    art.append(el('span', { class: 'card-kind' }, p.kind));
  }

  const laureatesTxt = p.teaser ? 'The winner(s) will appear here the moment they are announced.' :
    p.laureates.map(l => `<b>${l.name.split(',')[0]}</b>`).join(' · ');

  card.append(art,
    el('div', { class: 'card-body' },
      el('div', { class: 'card-title' }, p.title),
      el('div', { class: 'card-laureates', html: laureatesTxt }),
      el('div', { class: 'card-tag' }, p.tagline || ''),
      el('div', { class: 'card-foot' },
        p.teaser ? el('span', { class: 'card-cta', style: 'color:var(--faint)' }, 'Locked') :
          el('span', { class: 'card-cta' }, 'Open the exhibit ',
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`),
        el('span', { class: 'card-year' }, String(p.year)))));
  return card;
}

function renderGallery() {
  setAccent('#e8c568');
  document.title = 'Nobel Prize Explainer — 2023–2026';
  app.innerHTML = '';

  const hero = el('section', { class: 'hero' });
  const inner = el('div', { class: 'hero-inner' },
    el('div', { class: 'hero-kicker' }, el('span', { class: 'dot' }), 'Nobel Week 2026 is live'),
    el('h1', { html: 'Every Nobel Prize, <span class="grad">explained hands-on.</span>' }),
    el('p', { class: 'lede' }, 'All 18 prizes from 2023–2025 — plus the 2026 winners as they\'re announced this very week — turned into interactive exhibits you can poke, tweak and play with. No PhD required. Pick a tile below and actually understand what the prize was for.'),
    el('div', { class: 'hero-stats' },
      el('span', { class: 'hstat' }, el('b', {}, '21'), ' interactive exhibits'),
      el('span', { class: 'hstat' }, el('b', {}, '6'), ' categories'),
      el('span', { class: 'hstat' }, el('b', {}, '4'), ' years of prizes'),
      el('span', { class: 'hstat' }, el('b', {}, '46'), ' laureates')));
  const wb = el('div', { class: 'week-banner' },
    el('div', { class: 'wb' }, '🏅 ', el('b', {}, 'Live now:'), ' Nobel Week 2026 — Medicine, Physics and Chemistry announced Oct 5–7. ',
      'Still to come: ', el('span', { class: 'chip' }, 'Literature Oct 8'), ' · ', el('span', { class: 'chip' }, 'Peace Oct 9'), ' · ', el('span', { class: 'chip' }, 'Economics Oct 12'), ' — check back!'));
  hero.append(inner, wb);
  heroCanvas(hero);

  /* filters */
  const yearRow = el('div', { class: 'f-row' }, el('span', { class: 'f-label' }, 'Year'));
  const mkChip = (label, val, style, cnt) =>
    el('button', {
      class: 'chip' + (String(state.year) === String(val) ? ' active' : ''),
      style: style || '',
      onclick: () => { state.year = val; renderGallery(); }
    }, label, cnt != null ? el('span', { class: 'cnt' }, String(cnt)) : null);
  yearRow.append(mkChip('All years', 'all', '--chip-c:#e8c568', PRIZES.length));
  for (const y of YEARS) yearRow.append(mkChip(String(y), y, '--chip-c:#e8c568', PRIZES.filter(p => p.year === y).length));

  const catRow = el('div', { class: 'f-row' }, el('span', { class: 'f-label' }, 'Category'));
  const catAll = el('button', { class: 'chip' + (state.cat === 'all' ? ' active' : ''), style: '--chip-c:#e8c568', onclick: () => { state.cat = 'all'; renderGallery(); } }, 'All categories');
  catRow.append(catAll);
  for (const c of CAT_ORDER) {
    catRow.append(el('button', {
      class: 'chip' + (state.cat === c ? ' active' : ''), style: catChipStyle(c),
      onclick: () => { state.cat = c; renderGallery(); }
    }, el('span', { class: 'swatch' }), CATEGORIES[c].name, el('span', { class: 'cnt' }, String(PRIZES.filter(p => p.category === c).length))));
  }

  const searchRow = el('div', { class: 'f-row' },
    el('div', { class: 'search-wrap' },
      el('input', { class: 'search', placeholder: 'Search laureates, topics, prizes… (try "quantum" or "Han Kang")', value: state.q, 'aria-label': 'Search prizes' }),
      el('select', { class: 'sortsel', 'aria-label': 'Sort order', onchange: (e) => { state.sort = e.target.value; renderGallery(); } },
        el('option', { value: 'new', selected: state.sort === 'new' ? '' : null }, 'Newest first'),
        el('option', { value: 'old', selected: state.sort === 'old' ? '' : null }, 'Oldest first'),
        el('option', { value: 'cat', selected: state.sort === 'cat' ? '' : null }, 'By category'))),
    el('span', { class: 'result-count' }, ''));

  // search wiring (re-render list only, to preserve focus)
  const searchInput = searchRow.querySelector('.search');
  searchInput.addEventListener('input', () => { state.q = searchInput.value; paintGrid(); });

  const filters = el('div', { class: 'filters' }, el('div', { class: 'filters-inner' }, yearRow, catRow, searchRow));

  const gallery = el('div', { class: 'gallery' });
  const gridHost = el('div', {});
  gallery.append(gridHost);

  function paintGrid() {
    gridHost.innerHTML = '';
    const list = collectFiltered();
    const rc = searchRow.querySelector('.result-count');
    rc.textContent = `${list.filter(p => !p.teaser).length} exhibits${state.q || state.cat !== 'all' || state.year !== 'all' ? ' matching' : ''}`;
    if (!list.length) {
      gridHost.append(el('div', { class: 'empty' }, 'No prizes match that filter — try broadening your search.'));
      return;
    }
    if (state.sort === 'cat') {
      for (const c of CAT_ORDER) {
        const group = list.filter(p => p.category === c);
        if (!group.length) continue;
        const g = el('div', { class: 'year-group' },
          el('div', { class: 'year-head' },
            el('h2', { style: `color:${CATEGORIES[c].color}`, html: icon(c, 20) + '&nbsp;' + CATEGORIES[c].name }),
            el('span', { class: 'sub' }, `${group.length} prize${group.length > 1 ? 's' : ''}`), el('span', { class: 'rule' })),
          el('div', { class: 'grid' }, group.map(prizeCard)));
        gridHost.append(g);
      }
    } else {
      for (const y of YEARS) {
        const group = list.filter(p => p.year === y);
        if (!group.length) continue;
        const g = el('div', { class: 'year-group' },
          el('div', { class: 'year-head' }, el('h2', {}, String(y)), el('span', { class: 'sub' }, YEAR_NOTES[y]), el('span', { class: 'rule' })),
          el('div', { class: 'grid' }, group.map(prizeCard)));
        gridHost.append(g);
      }
    }
  }
  paintGrid();

  app.append(hero, filters, gallery);
}

/* ---------- DETAIL ---------- */
async function renderPrize(id) {
  const p = PRIZES.find(x => x.id === id && !x.teaser);
  if (!p) { location.hash = '#/'; return; }
  const cat = CATEGORIES[p.category];
  setAccent(cat.color);
  document.title = `${p.title} — ${p.year} Nobel Prize in ${cat.name}`;
  app.innerHTML = '';

  const detail = el('div', { class: 'detail fade-up' });
  detail.append(el('a', { class: 'backlink', href: '#/' },
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> All prizes`));

  /* hero */
  const heroArt = el('div', { class: 'd-hero-art' });
  const heroCv = document.createElement('canvas');
  heroArt.append(heroCv);
  requestAnimationFrame(() => drawArt(heroCv, p.category, p.artSeed, 1200, 380));

  const hero = el('div', { class: 'd-hero', style: `--cat:${cat.color}` }, heroArt,
    el('div', { class: 'd-hero-body' },
      el('div', { class: 'd-eyebrow' },
        el('span', { class: 'd-cat', html: icon(p.category, 12) + '&nbsp;' + cat.name }),
        el('span', { class: 'd-year' }, 'Nobel Prize · ' + p.year),
        el('span', { class: 'd-kind' }, p.kind)),
      el('h1', {}, p.title),
      el('p', { class: 'd-tagline' }, p.tagline),
      el('div', { class: 'laureates' }, p.laureates.map(l => {
        const initials = l.name.replace(/[().]/g, '').split(/[\s,]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('');
        return el('div', { class: 'laureate' }, el('div', { class: 'avatar' }, initials),
          el('div', {}, el('div', { class: 'nm' }, l.name), el('div', { class: 'ro' }, l.role)));
      })),
      el('div', { class: 'citation' }, el('b', {}, 'The official citation'), `“${p.citation}”`)));

  detail.append(hero);

  /* big idea */
  detail.append(el('section', { class: 'd-section', style: `--cat:${cat.color}` },
    el('h2', {}, el('span', { class: 'num' }, '01'), 'The 30-second version'),
    el('div', { class: 'big-idea', html: p.summary })));

  /* interactive exhibit */
  const exSec = el('section', { class: 'd-section', style: `--cat:${cat.color}` },
    el('h2', {}, el('span', { class: 'num' }, '02'), 'Play with it — the exhibit'),
    el('p', { class: 'lede' }, 'A simplified, hands-on model. Tweak, poke and break things — that\'s the point.'));
  const exPanel = el('div', { class: 'exhibit', style: `--cat:${cat.color}` });
  exSec.append(exPanel);
  detail.append(exSec);

  /* steps */
  if (p.steps.length) detail.append(el('section', { class: 'd-section', style: `--cat:${cat.color}` },
    el('h2', {}, el('span', { class: 'num' }, '03'), 'How it works, step by step'),
    el('div', { class: 'steps' }, p.steps.map(s =>
      el('div', { class: 'step' }, el('div', {}, el('h3', {}, s.h), el('p', {}, s.p)))))));

  /* why */
  if (p.why.length) detail.append(el('section', { class: 'd-section', style: `--cat:${cat.color}` },
    el('h2', {}, el('span', { class: 'num' }, '04'), 'Why it deserved the medal'),
    el('div', { class: 'why-grid' }, p.why.map(w =>
      el('div', { class: 'why-card' }, el('div', { class: 'ico' }, w.i), el('h3', {}, w.h), el('p', {}, w.p)))))));

  /* facts */
  if (p.facts.length) detail.append(el('section', { class: 'd-section', style: `--cat:${cat.color}` },
    el('h2', {}, el('span', { class: 'num' }, '05'), 'Dinner-party ammunition'),
    el('div', { class: 'facts' }, p.facts.map(f =>
      el('div', { class: 'fact' }, el('span', { class: 'spark' }, '✦'), el('span', {}, f)))))));

  /* prev / next within same sort (newest first) */
  const ordered = PRIZES.filter(x => !x.teaser).sort((a, b) => b.year - a.year || CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category));
  const idx = ordered.findIndex(x => x.id === id);
  const prev = ordered[idx - 1], next = ordered[idx + 1];
  detail.append(el('div', { class: 'pn', style: `--cat:${cat.color}` },
    prev ? el('a', { href: `#/prize/${prev.id}` },
      el('div', { class: 'dir' }, '← Previous'), el('div', { class: 't' }, prev.title),
      el('div', { class: 'who' }, `${prev.year} · ${CATEGORIES[prev.category].name}`)) : el('span'),
    next ? el('a', { class: 'next', href: `#/prize/${next.id}` },
      el('div', { class: 'dir' }, 'Next →'), el('div', { class: 't' }, next.title),
      el('div', { class: 'who' }, `${next.year} · ${CATEGORIES[next.category].name}`)) : el('span')));

  app.append(detail);
  window.scrollTo(0, 0);

  /* mount the exhibit */
  try {
    const mod = await import(p.exhibit);
    mod.default(exPanel);
  } catch (err) {
    console.error('Exhibit failed to load', err);
    exPanel.append(el('div', { class: 'exhibit-body' },
      el('p', { class: 'caption' }, '⚠️ The interactive exhibit failed to load. Try refreshing — the rest of the page still works.')));
  }
}

/* ---------- router ---------- */
function route() {
  cleanupAll();
  const m = location.hash.match(/^#\/prize\/([\w-]+)/);
  if (m) renderPrize(m[1]);
  else { renderGallery(); window.scrollTo(0, 0); }
}
window.addEventListener('hashchange', route);
route();
