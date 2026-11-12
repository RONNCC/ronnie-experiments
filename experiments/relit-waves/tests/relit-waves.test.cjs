'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const expDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(expDir, '../..');

function loadData() {
  const code = fs.readFileSync(path.join(expDir, 'data.js'), 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.window.RELIT_WAVE_DATA;
}

/* A deliberately small stand in for the handful of DOM APIs app.js touches.
 * It parses generated markup just far enough to click the buttons a reader
 * would click, and records what got written where. */
class FakeElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.value = '';
    this.hidden = false;
    this.dataset = {};
    this.textContent = '';
    this._attrs = new Map();
    this._classes = new Set();
    this._listeners = new Map();
    this._innerHTML = '';
    this._children = [];
  }

  get classList() {
    return {
      add: (...c) => c.forEach((x) => this._classes.add(x)),
      remove: (...c) => c.forEach((x) => this._classes.delete(x)),
      contains: (c) => this._classes.has(c)
    };
  }

  setAttribute(k, v) {
    this._attrs.set(k, String(v));
  }

  getAttribute(k) {
    return this._attrs.has(k) ? this._attrs.get(k) : null;
  }

  removeAttribute(k) {
    this._attrs.delete(k);
  }

  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(fn);
  }

  dispatchEvent(type) {
    (this._listeners.get(type) || []).forEach((fn) => fn({ target: this }));
    return true;
  }

  click() {
    this.dispatchEvent('click');
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = String(html);
    this._children = [];

    const tagRe = /<(button|a|option)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
    let match;
    while ((match = tagRe.exec(this._innerHTML)) !== null) {
      const [, tag, attrs, inner] = match;
      const el = new FakeElement(tag);
      el._innerHTML = inner;
      el.textContent = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      for (const am of attrs.matchAll(/([a-zA-Z0-9_-]+)="([^"]*)"/g)) {
        const [, key, raw] = am;
        const val = raw
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        if (key === 'id') el.id = val;
        else if (key === 'class') val.split(/\s+/).filter(Boolean).forEach((c) => el._classes.add(c));
        else if (key === 'value') el.value = val;
        else if (key.startsWith('data-')) {
          el.dataset[key.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = val;
          el._attrs.set(key, val);
        } else el._attrs.set(key, val);
      }
      this._children.push(el);
    }
  }

  get textContent() {
    if (this._innerHTML) {
      return this._innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return this._text;
  }

  set textContent(t) {
    this._text = String(t);
    this._innerHTML = '';
  }

  querySelectorAll(sel) {
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      return this._children.filter((c) => c._classes.has(cls));
    }
    return this._children.filter((c) => c.tagName === sel.toUpperCase() || sel === '*');
  }
}

function bootApp(html) {
  const elements = new Map();

  for (const [, tag, attrs] of html.matchAll(/<([a-zA-Z0-9]+)\b([^>]*)>/g)) {
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    if (!idMatch) continue;
    const el = new FakeElement(tag, idMatch[1]);
    const valueMatch = attrs.match(/\bvalue="([^"]*)"/);
    if (valueMatch) el.value = valueMatch[1];
    if (/\bhidden\b/.test(attrs)) el.hidden = true;
    elements.set(idMatch[1], el);
  }

  const ctx = {
    window: {
      matchMedia: () => ({ matches: false }),
      setTimeout: (fn) => fn()
    },
    document: {
      getElementById: (id) => {
        const el = elements.get(id);
        assert.ok(el, `app.js requested a missing DOM id #${id}`);
        return el;
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {}
    }
  };

  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(expDir, 'data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(expDir, 'app.js'), 'utf8'), ctx);

  return elements;
}

test('the experiment is registered in experiments.json and the root index', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'experiments.json'), 'utf8'));
  assert.ok(Array.isArray(manifest) && manifest.length > 0);

  const ids = new Set();
  for (const entry of manifest) {
    assert.ok(entry.id && entry.title && entry.description && entry.path && entry.category);
    assert.ok(!ids.has(entry.id), `duplicate manifest id: ${entry.id}`);
    ids.add(entry.id);
    assert.ok(
      fs.existsSync(path.join(repoRoot, entry.path, 'index.html')),
      `missing experiment index: ${entry.path}`
    );
  }

  const relit = manifest.find((e) => e.id === 'relit-waves');
  assert.ok(relit, 'relit-waves is registered in experiments.json');
  assert.equal(relit.path, 'experiments/relit-waves/');
  assert.equal(relit.category, 'Education');

  const rootHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  assert.match(rootHtml, /id:\s*"relit-waves"/);
});

test('data.js covers 11 movements and every date resolves to a source', () => {
  const data = loadData();
  assert.ok(data);
  assert.equal(data.archetypes.length, 4);
  assert.equal(data.domains.length, 11);
  assert.equal(data.quizScenarios.length, 5);
  assert.ok(data.sources.length >= 20);
  assert.ok(data.glossary.length >= 12);

  const archetypeIds = new Set(data.archetypes.map((a) => a.id));
  const sourceIds = new Set(data.sources.map((s) => s.id));
  const domainIds = new Set();

  for (const domain of data.domains) {
    assert.ok(!domainIds.has(domain.id), `duplicate domain id: ${domain.id}`);
    domainIds.add(domain.id);
    assert.ok(archetypeIds.has(domain.archetype), `${domain.id} uses a known archetype`);
    assert.ok(domain.waves.length >= 3, `${domain.id} has at least three waves`);
    assert.ok(domain.critique.length > 30, `${domain.id} carries a critique`);
    assert.ok(domain.labelStatus.length > 10, `${domain.id} states the status of its label`);
    assert.ok(domain.coinedBy.length > 5, `${domain.id} names who coined it`);

    for (const wave of domain.waves) {
      assert.ok(wave.num && wave.era && wave.name && wave.spark && wave.shift && wave.blindSpot);
      assert.ok(Array.isArray(wave.exemplars) && wave.exemplars.length >= 3);
    }

    for (const sourceId of domain.sourceIds) {
      assert.ok(sourceIds.has(sourceId), `${domain.id} references missing source ${sourceId}`);
    }
  }

  for (const marker of data.timelineMarkers) {
    assert.ok(sourceIds.has(marker.sourceId), `timeline marker ${marker.year} has a source`);
  }

  for (const source of data.sources) {
    assert.equal(new URL(source.url).protocol, 'https:', `${source.id} uses HTTPS`);
    assert.ok(source.cite.length > 15 && source.note.length > 15);
  }

  for (const scenario of data.quizScenarios) {
    const correct = scenario.choices.filter((c) => c.correct);
    assert.equal(correct.length, 1, `quiz ${scenario.id} has exactly one right answer`);
    for (const choice of scenario.choices) {
      assert.ok(choice.label && choice.feedback.length > 20);
    }
  }
});

test('timeline years are unique and ascending', () => {
  const data = loadData();
  const years = data.timelineMarkers.map((m) => m.year);
  for (let i = 1; i < years.length; i += 1) {
    assert.ok(years[i] > years[i - 1], `timeline is ordered: ${years[i - 1]} then ${years[i]}`);
  }
});

test('index.html assets, anchors, and self hosted type resolve', () => {
  const html = fs.readFileSync(path.join(expDir, 'index.html'), 'utf8');

  for (const asset of ['styles.css', 'data.js', 'app.js', 'assets/favicon.svg']) {
    assert.ok(fs.existsSync(path.join(expDir, asset)), `${asset} exists`);
  }

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, anchor] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(ids.has(anchor), `anchor #${anchor} exists`);
  }

  assert.match(html, /<link rel="preload"[^>]+geist-latin\.woff2/, 'font is preloaded');
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<link rel="icon"/);
  assert.match(html, /class="skip-link"/);

  const css = fs.readFileSync(path.join(expDir, 'styles.css'), 'utf8');
  assert.ok(fs.existsSync(path.join(expDir, 'assets/fonts/geist-latin.woff2')), 'Geist is vendored');
  assert.match(css, /@font-face/);
  assert.match(css, /font-family: "Geist"/);
  assert.match(css, /@media \(max-width: 920px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);

  // The design rules ban a second typeface, italic styling, and background gradients.
  const families = [...css.matchAll(/font-family:\s*([^;]+);/g)]
    .map((m) => m[1])
    .filter((f) => !f.includes('var(--mono)'));
  for (const family of families) {
    assert.ok(!/Georgia|Palatino|serif"/i.test(family) || /Geist/.test(family), `unexpected face: ${family}`);
  }
  assert.ok(!/font-style:\s*italic/.test(css), 'no italic type');

  // Gradients are allowed only as clipped hero text, never as a background surface.
  const gradientRules = css.match(/[^{}]+\{[^}]*linear-gradient[^}]*\}/g) || [];
  for (const rule of gradientRules) {
    assert.match(rule, /background-clip:\s*text/, `gradient is text only: ${rule.split('{')[0].trim()}`);
  }
});


/* Design guard rails, so a later edit cannot quietly reintroduce the things the
 * skills folder bans. These read the stylesheet as text; the visual checks run
 * in the browser during review. */
function relativeLuminance(hex) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hex.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('text colours clear WCAG AA against the paper surfaces', () => {
  const css = fs.readFileSync(path.join(expDir, 'styles.css'), 'utf8');
  const token = (name) => {
    const m = css.match(new RegExp(`--${name}:\\s*#([0-9a-f]{6})`, 'i'));
    assert.ok(m, `token --${name} is defined`);
    return m[1];
  };

  const surfaces = ['paper', 'paper-sunk'].map(token);
  // Body copy, metadata, and captions all have to stay readable.
  for (const name of ['ink', 'ink-soft', 'ink-muted', 'ink-faint']) {
    for (const surface of surfaces) {
      const ratio = contrast(token(name), surface);
      assert.ok(ratio >= 4.5, `--${name} on #${surface} is ${ratio.toFixed(2)}:1`);
    }
  }

  // The accent is used for links and small labels, so it needs body-text contrast.
  for (const surface of surfaces) {
    const ratio = contrast(token('accent-deep'), surface);
    assert.ok(ratio >= 4.5, `--accent-deep on #${surface} is ${ratio.toFixed(2)}:1`);
  }
});

test('the page keeps to one typeface, no italics, and no background gradients', () => {
  const css = fs.readFileSync(path.join(expDir, 'styles.css'), 'utf8');
  const faces = new Set([...css.matchAll(/font-family:\s*"?([A-Za-z ]+)"?/g)].map((m) => m[1].trim()));
  for (const face of faces) {
    assert.ok(
      ['Geist', 'inherit'].includes(face),
      `only Geist is used, found ${face}`
    );
  }

  assert.ok(!/font-style:\s*italic/.test(css), 'no italic type');
  assert.ok(!/<em>|<i>\s*[A-Za-z]/.test(fs.readFileSync(path.join(expDir, 'index.html'), 'utf8')));

  for (const rule of css.match(/[^{}]+\{[^}]*linear-gradient[^}]*\}/g) || []) {
    assert.match(rule, /background-clip:\s*text/, 'gradients are clipped hero text only');
  }
});

test('typography uses the Tailwind scale and spacing uses the token scale', () => {
  const css = fs.readFileSync(path.join(expDir, 'styles.css'), 'utf8');

  // Every font-size is either a token or a clamp built from tokens.
  const sizes = [...css.matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1].trim());
  for (const size of sizes) {
    assert.ok(
      size.startsWith('var(--text-') || size.startsWith('clamp(') || size === 'inherit' || size === '0.95em',
      `off scale font size: ${size}`
    );
  }

  // Spacing values resolve to tokens, or to the documented optical extras.
  const allowedLiterals = new Set(['0', 'auto', '1px', '2px', '3px', '4px', '1.1', '1.5px', '6px', '7px', '-1px', '5.5px', '-5.5px', '100%', '100dvh', '100vh']);
  const spacing = [...css.matchAll(/(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?:\s*([^;]+);/g)]
    .flatMap((m) => m[1].split(/\s+/))
    .map((v) => v.trim())
    .filter((v) => /^-?[\d.]+(px|rem|em|dvh|vh|%)?$/.test(v));
  for (const value of spacing) {
    assert.ok(
      value.startsWith('var(--sp-') || allowedLiterals.has(value),
      `off scale spacing value: ${value}`
    );
  }
});

test('interactive rows expose a visible focus ring', () => {
  const css = fs.readFileSync(path.join(expDir, 'styles.css'), 'utf8');
  assert.match(css, /:focus-visible\s*\{[^}]*outline:/, 'a global focus ring exists');
  for (const selector of ['.movement', '.lineage-year', '.quiz-opt', '.chip']) {
    const escaped = selector.replace('.', '\\.');
    assert.match(
      css,
      new RegExp(`${escaped}:focus-visible`),
      `${selector} keeps the focus ring visible`
    );
  }
});

test('app.js renders every widget and reacts to interaction', () => {
  const html = fs.readFileSync(path.join(expDir, 'index.html'), 'utf8');
  const elements = bootApp(html);

  // Genealogy rail: eleven markers, detail defaults to the 2002 Rothgeb entry.
  assert.equal(elements.get('lineageTrack').querySelectorAll('button').length, 11);
  assert.match(elements.get('lineageDetail').textContent, /Rothgeb/);

  const firstMarker = elements.get('lineageTrack').querySelectorAll('button')[0];
  firstMarker.click();
  assert.match(elements.get('lineageDetail').textContent, /1968/);
  assert.match(elements.get('lineageDetail').textContent, /Lear/);

  // Atlas: eleven rows, coffee selected by default.
  const domainButtons = elements.get('movementList').querySelectorAll('button');
  assert.equal(domainButtons.length, 11);
  assert.match(elements.get('movementDetail').textContent, /Coffee culture/);
  assert.match(elements.get('movementDetail').textContent, /Rothgeb/);
  assert.match(elements.get('movementDetail').textContent, /Where this bends/);

  const linguistics = domainButtons.find((b) => b.dataset.domain === 'sociolinguistics');
  linguistics.click();
  assert.match(elements.get('movementDetail').textContent, /Variationist sociolinguistics/);
  assert.match(elements.get('movementDetail').textContent, /Eckert/);

  // Filtering to music leaves two movements, and an incompatible shape resets cleanly.
  const music = elements
    .get('categoryFilters')
    .querySelectorAll('button')
    .find((b) => b.dataset.cat === 'Music & subculture');
  music.click();
  assert.equal(elements.get('movementList').querySelectorAll('button').length, 2);

  const craft = elements
    .get('archetypeFilters')
    .querySelectorAll('button')
    .find((b) => b.dataset.arch === 'commodity-craft');
  craft.click();
  assert.equal(
    elements.get('movementList').querySelectorAll('button').length,
    2,
    'falls back to all shapes instead of showing an empty list'
  );

  // Everyday translator swaps scenes and redraws the meters.
  const speech = elements
    .get('sceneButtons')
    .querySelectorAll('button')
    .find((b) => b.dataset.scene === 'speech');
  speech.click();
  assert.equal(elements.get('sceneDomain').textContent, 'Variationist sociolinguistics');
  assert.match(elements.get('sceneCards').textContent, /indexical/i);

  // Comparator rewrites the table and the reading.
  elements.get('compareLeft').value = 'ska';
  elements.get('compareRight').value = 'emo';
  elements.get('compareLeft').dispatchEvent('change');
  assert.match(elements.get('compareInsight').textContent, /Same engine/);

  elements.get('compareRight').value = 'ai';
  elements.get('compareLeft').dispatchEvent('change');
  assert.match(elements.get('compareInsight').textContent, /Different engines/);

  // Sandbox previews the typed value and matches the mechanism.
  elements.get('customName').value = 'Artisanal sourdough';
  elements.get('customMech').value = 'reaction';
  elements.get('customName').dispatchEvent('input');
  assert.match(elements.get('builderPreview').textContent, /Three waves of Artisanal sourdough/);
  assert.match(elements.get('builderPreview').textContent, /Reads like wine and emo/);

  // Metaphor lab switches between the two models and re-reads the sliders.
  assert.match(elements.get('physicsSvg').innerHTML, /Era 1/);
  elements.get('modeRadio').click();
  assert.equal(elements.get('modeRadio').getAttribute('aria-pressed'), 'true');
  assert.equal(elements.get('modeOcean').getAttribute('aria-pressed'), 'false');
  assert.match(elements.get('physicsSvg').innerHTML, /Radio|legal and commodity/);
  assert.match(elements.get('physicsReadout').textContent, /Four frequencies/);

  elements.get('persistSlider').value = '80';
  elements.get('persistSlider').dispatchEvent('input');
  assert.equal(elements.get('persistOut').textContent, '80%');

  // Quiz scores a correct answer.
  const right = elements
    .get('quizList')
    .querySelectorAll('.quiz-opt')
    .find((b) => b.dataset.qid === 'q1' && b.dataset.cidx === '2');
  right.click();
  assert.match(elements.get('quizScore').textContent, /Answered 1 of 5/);
  assert.match(elements.get('quizScore').textContent, /Correct 1 of 5/);

  // Glossary filters and shows an empty state.
  elements.get('glossarySearch').value = 'terroir';
  elements.get('glossarySearch').dispatchEvent('input');
  assert.equal(elements.get('glossaryEmpty').hidden, true);
  assert.match(elements.get('glossaryGrid').textContent, /Terroir/);
  assert.equal(elements.get('glossaryCount').textContent, '1 of 12 terms');

  elements.get('glossarySearch').value = 'zzznothing';
  elements.get('glossarySearch').dispatchEvent('input');
  assert.equal(elements.get('glossaryEmpty').hidden, false);

  // Source ledger renders every entry with a live link.
  assert.equal(elements.get('sourcesList').querySelectorAll('a').length, loadData().sources.length);
});
