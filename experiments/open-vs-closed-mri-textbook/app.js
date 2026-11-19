/* Open vs closed MRI — app.js
 * Progressive enhancement: every control starts hidden in the markup and is
 * revealed here, so the page stays complete without JavaScript.
 */

// Reveal interactive controls only when JS can drive them.
for (const controls of document.querySelectorAll('[data-controls]')) controls.hidden = false;

/* ---------------------------------------------------------------
 * Fig 3: scanner front views
 * ------------------------------------------------------------- */

const shapeViews = {
  standard: {
    ring: true, r: 74, inner: 61, plates: false, access: false,
    label: 'Front view of a standard tunnel surrounding the table and the person on it',
    note: 'Standard bore: the housing surrounds the table on all sides in this front view.',
  },
  wide: {
    ring: true, r: 86, inner: 73, plates: false, access: false,
    label: 'Front view of a wider tunnel surrounding the same table and person',
    note: 'Wide bore: there is more room around the table, but the housing still surrounds it.',
  },
  open: {
    ring: false, r: 74, inner: 61, plates: true, access: true,
    label: 'Front view of two plates above and below the table with open sides',
    note: 'Open sided: the sides are accessible, but the plates still limit vertical clearance.',
  },
};

const geometry = document.querySelector('#geometry');
if (geometry) {
  const ring = document.querySelector('#geo-ring');
  const circle = document.querySelector('#geo-circle');
  const circleInner = document.querySelector('#geo-circle-inner');
  const plates = document.querySelector('#geo-plates');
  const access = document.querySelector('#geo-access');
  const shapeNote = document.querySelector('#shape-note');

  const updateShape = () => {
    const view = shapeViews[document.querySelector('input[name="shape"]:checked').value];
    circle.setAttribute('r', String(view.r));
    circleInner.setAttribute('r', String(view.inner));
    ring.hidden = !view.ring;
    plates.hidden = !view.plates;
    access.hidden = !view.access;
    geometry.setAttribute('aria-label', view.label);
    shapeNote.textContent = view.note;
  };
  for (const input of document.querySelectorAll('input[name="shape"]')) {
    input.addEventListener('change', updateShape);
  }
  updateShape();
}

/* ---------------------------------------------------------------
 * Fig 5: signal and noise
 * ------------------------------------------------------------- */

// Keep the irregular offsets identical; only the added central rise changes.
const baseline = [92, 77, 97, 80, 94, 81, 99, 79, 95, 78, 96, 78, 91];
const pattern = [0, 0, 0, 0, 6, 16, 23, 16, 6, 0, 0, 0, 0];

const signalPlot = document.querySelector('#signal-plot');
if (signalPlot) {
  const trace = document.querySelector('#trace');
  const signalNote = document.querySelector('#signal-note');

  const updateSignal = () => {
    const strong = document.querySelector('input[name="signal"]:checked').value === 'strong';
    const points = baseline.map((y, i) => `${22 + i * 26},${y - pattern[i] * (strong ? 3 : 1)}`);
    trace.setAttribute('points', points.join(' '));
    signalPlot.setAttribute('aria-label', strong
      ? 'A pronounced central rise, with the same random variation'
      : 'A small central rise partly masked by random variation');
    signalNote.textContent = strong
      ? 'Stronger signal: the same bumps are present, but the central rise is clearer.'
      : 'Weaker signal: the central rise is hard to separate from nearby bumps.';
  };
  for (const input of document.querySelectorAll('input[name="signal"]')) {
    input.addEventListener('change', updateSignal);
  }
  updateSignal();
}

/* ---------------------------------------------------------------
 * Practice quiz
 * ------------------------------------------------------------- */

for (const card of document.querySelectorAll('.quiz-card')) {
  const answer = card.dataset.answer;
  const feedback = card.querySelector('.quiz-feedback');
  const why = card.querySelector('.quiz-why');

  for (const button of card.querySelectorAll('.quiz-opts button')) {
    button.addEventListener('click', () => {
      for (const other of card.querySelectorAll('.quiz-opts button')) {
        other.classList.remove('is-correct', 'is-wrong');
      }
      const correct = button.dataset.opt === answer;
      button.classList.add(correct ? 'is-correct' : 'is-wrong');
      feedback.classList.toggle('is-correct', correct);
      feedback.classList.toggle('is-wrong', !correct);
      feedback.textContent = correct
        ? 'Correct. The reasoning is below.'
        : 'Not quite. Try another option, or reveal the reasoning.';
      if (correct) why.open = true;
    });
  }
}

/* ---------------------------------------------------------------
 * Glossary filter
 * ------------------------------------------------------------- */

const glossFilter = document.querySelector('#gloss-filter');
if (glossFilter) {
  const glossCount = document.querySelector('#gloss-count');
  const pairs = [];
  for (const dt of document.querySelectorAll('#glossGroups dt')) {
    pairs.push({ dt, dd: dt.nextElementSibling, text: (dt.textContent + ' ' + dt.nextElementSibling.textContent).toLowerCase() });
  }

  const applyFilter = () => {
    const query = glossFilter.value.trim().toLowerCase();
    let shown = 0;
    for (const pair of pairs) {
      const match = !query || pair.text.includes(query);
      pair.dt.dataset.hidden = String(!match);
      pair.dd.dataset.hidden = String(!match);
      if (match) shown += 1;
    }
    for (const group of document.querySelectorAll('#glossGroups .gloss-group')) {
      const anyVisible = [...group.querySelectorAll('dt')].some((dt) => dt.dataset.hidden !== 'true');
      group.dataset.empty = String(!anyVisible);
    }
    glossCount.textContent = query
      ? (shown === 0 ? 'No terms match' : `${shown} of ${pairs.length} terms`)
      : `${pairs.length} terms`;
  };
  glossFilter.addEventListener('input', applyFilter);
  applyFilter();
}

/* ---------------------------------------------------------------
 * Table of contents: active section and mobile disclosure
 * ------------------------------------------------------------- */

const tocNav = document.querySelector('#tocNav');
if (tocNav) {
  const links = new Map();
  for (const link of tocNav.querySelectorAll('a')) {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) links.set(section, link);
  }

  const setCurrent = (section) => {
    for (const [el, link] of links) {
      if (el === section) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  if ('IntersectionObserver' in window) {
    const visible = new Set();
    const spy = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      if (visible.size) {
        const top = [...visible]
          .map((el) => [el, Math.abs(el.getBoundingClientRect().top)])
          .sort((a, b) => a[1] - b[1])[0][0];
        setCurrent(top);
      }
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
    for (const section of links.keys()) spy.observe(section);
  }
}

const contents = document.querySelector('#contents');
if (contents && window.matchMedia) {
  const narrow = window.matchMedia('(max-width: 900px)');
  const syncDisclosure = () => { contents.open = !narrow.matches; };
  syncDisclosure();
  narrow.addEventListener('change', syncDisclosure);
}

/* ---------------------------------------------------------------
 * Scroll reveals and reading progress
 * ------------------------------------------------------------- */

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });
  for (const item of revealItems) revealObserver.observe(item);
} else {
  for (const item of revealItems) item.classList.add('is-visible');
}

const progressBar = document.querySelector('#progressBar');
if (progressBar) {
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();
}
