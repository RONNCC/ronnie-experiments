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

class FakeElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.value = '';
    this.hidden = false;
    this.dataset = {};
    this._attrs = new Map();
    this._classes = new Set();
    this._listeners = new Map();
    this._innerHTML = '';
    this._textContent = '';
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
    return this._attrs.get(k) ?? null;
  }

  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(fn);
  }

  dispatchEvent(type) {
    const fns = this._listeners.get(type) || [];
    for (const fn of fns) fn({ target: this });
  }

  click() {
    this.dispatchEvent('click');
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = String(html);
    this._textContent = this._innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // Parse generated <button ...> elements so tests can click them
    this._children = [];
    const btnRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
    let m;
    while ((m = btnRegex.exec(this._innerHTML)) !== null) {
      const attrs = m[1];
      const inner = m[2];
      const btn = new FakeElement('button');
      btn._innerHTML = inner;
      btn._textContent = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      for (const am of attrs.matchAll(/([a-zA-Z0-9_-]+)="([^"]*)"/g)) {
        const [, k, rawV] = am;
        const v = rawV
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        if (k === 'id') btn.id = v;
        else if (k === 'class') v.split(/\s+/).filter(Boolean).forEach((c) => btn._classes.add(c));
        else if (k.startsWith('data-')) {
          const camel = k.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
          btn.dataset[camel] = v;
          btn._attrs.set(k, v);
        } else {
          btn._attrs.set(k, v);
        }
      }
      this._children.push(btn);
    }
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(t) {
    this._textContent = String(t);
    this._innerHTML = String(t);
  }

  querySelectorAll(sel) {
    if (sel === 'button') return this._children;
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      return this._children.filter((c) => c._classes.has(cls));
    }
    return this._children;
  }
}

test('experiments.json and root index.html register relit-waves validly', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'experiments.json'), 'utf8'));
  assert.ok(Array.isArray(manifest) && manifest.length > 0);

  const ids = new Set();
  for (const entry of manifest) {
    assert.ok(entry.id && entry.title && entry.description && entry.path && entry.category);
    assert.ok(!ids.has(entry.id), `duplicate manifest id: ${entry.id}`);
    ids.add(entry.id);
    const localIndex = path.join(repoRoot, entry.path, 'index.html');
    assert.ok(fs.existsSync(localIndex), `missing experiment index: ${entry.path}`);
  }

  const relit = manifest.find((e) => e.id === 'relit-waves');
  assert.ok(relit, 'relit-waves is registered in experiments.json');
  assert.equal(relit.path, 'experiments/relit-waves/');
  assert.equal(relit.category, 'Education');

  const rootHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  assert.match(rootHtml, /id:\s*"relit-waves"/);
});

test('data.js schema integrity: 4 archetypes, 11 domains, waves, quiz, glossary, and HTTPS sources', () => {
  const data = loadData();
  assert.ok(data);
  assert.equal(data.archetypes.length, 4);
  assert.equal(data.domains.length, 11);

  const archIds = new Set(data.archetypes.map((a) => a.id));
  const sourceIds = new Set(data.sources.map((s) => s.id));
  const domainIds = new Set();

  for (const d of data.domains) {
    assert.ok(!domainIds.has(d.id), `duplicate domain id: ${d.id}`);
    domainIds.add(d.id);
    assert.ok(archIds.has(d.archetype), `unknown archetype ${d.archetype} on ${d.id}`);
    assert.ok(d.waves.length >= 3, `${d.id} has at least 3 waves`);
    assert.ok(d.axes && d.axes.unit.length >= 3 && d.axes.goal.length >= 3, `${d.id} axes`);
    assert.ok(d.critique.length > 30, `${d.id} includes historiographical critique`);

    for (const w of d.waves) {
      assert.ok(w.num && w.era && w.name && w.spark && w.shift && w.blindSpot);
      assert.ok(Array.isArray(w.exemplars) && w.exemplars.length >= 3);
    }

    for (const sid of d.sourceIds) {
      assert.ok(sourceIds.has(sid), `missing sourceId ${sid} referenced by ${d.id}`);
    }
  }

  // Must include Third-Wave Coffee, Sociolinguistics, Food, Music/Culture, etc.
  for (const required of ['coffee', 'sociolinguistics', 'chocolate', 'ska', 'emo', 'feminism']) {
    assert.ok(domainIds.has(required), `missing required domain ${required}`);
  }

  assert.equal(data.quizScenarios.length, 5);
  for (const q of data.quizScenarios) {
    const rights = q.choices.filter((c) => c.correct);
    assert.equal(rights.length, 1, `quiz ${q.id} must have 1 correct answer`);
    for (const c of q.choices) {
      assert.ok(c.label && c.feedback && c.feedback.length > 20);
    }
  }

  assert.ok(data.sources.length >= 20);
  for (const s of data.sources) {
    const parsed = new URL(s.url);
    assert.equal(parsed.protocol, 'https:', `source ${s.id} uses HTTPS`);
    assert.ok(s.cite.length > 15 && s.note.length > 15);
  }
});

test('static HTML anchors, local assets, and responsive CSS rules resolve cleanly', () => {
  const html = fs.readFileSync(path.join(expDir, 'index.html'), 'utf8');
  for (const asset of ['styles.css', 'data.js', 'app.js']) {
    assert.ok(fs.existsSync(path.join(expDir, asset)), `${asset} exists`);
  }

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, anchor] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(ids.has(anchor), `anchor #${anchor} exists in index.html`);
  }

  const css = fs.readFileSync(path.join(expDir, 'styles.css'), 'utf8');
  assert.match(css, /@media\s*\(max-width:\s*920px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('app.js interactive controller executes end-to-end across all widgets', () => {
  const html = fs.readFileSync(path.join(expDir, 'index.html'), 'utf8');
  const elements = new Map();

  for (const [, tag, attrs] of html.matchAll(/<([a-zA-Z0-9]+)\b([^>]*)>/g)) {
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    if (idMatch) {
      const el = new FakeElement(tag, idMatch[1]);
      const valMatch = attrs.match(/\bvalue="([^"]*)"/);
      if (valMatch) el.value = valMatch[1];
      elements.set(idMatch[1], el);
    }
  }

  const ctx = {
    window: {},
    document: {
      getElementById: (id) => {
        const el = elements.get(id);
        assert.ok(el, `app.js requested missing DOM id #${id}`);
        return el;
      }
    }
  };

  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(expDir, 'data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(expDir, 'app.js'), 'utf8'), ctx);

  // 1. Atlas tabs rendered all 11 domains and defaulted to Coffee
  assert.equal(elements.get('domainTabs').querySelectorAll('button').length, 11);
  assert.match(elements.get('domainStage').textContent, /Coffee Culture/);
  assert.match(elements.get('domainStage').textContent, /Trish Rothgeb/);

  // 2. Click Variationist Sociolinguistics tab
  const socioBtn = elements
    .get('domainTabs')
    .querySelectorAll('button')
    .find((b) => b.dataset.domain === 'sociolinguistics');
  assert.ok(socioBtn);
  socioBtn.click();
  assert.match(elements.get('domainStage').textContent, /Variationist Sociolinguistics/);
  assert.match(elements.get('domainStage').textContent, /Penelope Eckert/);

  // 3. Category + incompatible archetype filter recovers cleanly without empty trap
  const musicCat = elements
    .get('categoryFilters')
    .querySelectorAll('button')
    .find((b) => b.dataset.cat.includes('Music'));
  musicCat.click();
  assert.equal(elements.get('domainTabs').querySelectorAll('button').length, 2);

  const craftArch = elements
    .get('archetypeFilters')
    .querySelectorAll('button')
    .find((b) => b.dataset.arch === 'commodity-craft');
  craftArch.click();
  assert.equal(elements.get('domainTabs').querySelectorAll('button').length, 2, 'resets archetype gracefully');

  // 4. Everyday scene translator switches from Cup to Speech
  const speechSceneBtn = elements
    .get('sceneButtons')
    .querySelectorAll('button')
    .find((b) => b.dataset.scene === 'speech');
  speechSceneBtn.click();
  assert.equal(elements.get('sceneDomainBadge').textContent, 'Variationist Sociolinguistics');
  assert.match(elements.get('sceneCards').textContent, /Indexical Field/);

  // 5. Cross-domain comparator updates insight
  elements.get('compareLeft').value = 'ska';
  elements.get('compareRight').value = 'emo';
  elements.get('compareLeft').dispatchEvent('change');
  assert.match(elements.get('compareInsight').textContent, /Shared structural DNA/);

  // 6. Sandbox custom wave mapper
  elements.get('customName').value = 'Artisanal Sourdough';
  elements.get('customMech').value = 'reaction';
  elements.get('customName').dispatchEvent('input');
  assert.match(elements.get('builderPreview').textContent, /Three Waves of Artisanal Sourdough/);
  assert.match(elements.get('builderPreview').textContent, /Anti-Commercial Relighting/);

  // 7. Ocean vs Radio Wave Physics Lab
  assert.match(elements.get('physicsSvg').innerHTML, /Era 1/);
  elements.get('modeRadio').click();
  assert.equal(elements.get('modeRadio').getAttribute('aria-pressed'), 'true');
  assert.match(elements.get('physicsSvg').innerHTML, /CH 1/);
  assert.match(elements.get('physicsReadout').textContent, /Concurrent frequencies/);

  // 8. Quiz scoring
  const rightChoice = elements
    .get('quizList')
    .querySelectorAll('.quiz-opt')
    .find((b) => b.dataset.qid === 'q1' && b.dataset.cidx === '2');
  rightChoice.click();
  assert.match(elements.get('quizScore').textContent, /Answered: 1 \/ 5 · Correct: 1 \/ 5/);

  // 9. Glossary search & empty state
  elements.get('glossarySearch').value = 'terroir';
  elements.get('glossarySearch').dispatchEvent('input');
  assert.equal(elements.get('glossaryEmpty').hidden, true);
  assert.match(elements.get('glossaryGrid').textContent, /Terroir/);

  elements.get('glossarySearch').value = 'xyznonexistent';
  elements.get('glossarySearch').dispatchEvent('input');
  assert.equal(elements.get('glossaryEmpty').hidden, false);
});
