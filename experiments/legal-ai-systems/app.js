/* Inside Legal AI — interaction and rendering layer */
(function () {
  'use strict';

  const guide = window.LEGAL_AI_GUIDE;
  if (!guide) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const byId = (id) => document.getElementById(id);
  const vendorsById = Object.fromEntries(guide.vendors.map((vendor) => [vendor.id, vendor]));
  const sourcesById = Object.fromEntries(guide.sources.map((source) => [source.id, source]));
  const state = {
    activeVendor: guide.vendors[0].id,
    scenarios: {},
    sourceFilter: 'All',
    lensIndex: 0,
    drillIndex: 0,
    drillRevealed: false
  };

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  function sourceLink(sourceId, short = true) {
    const source = sourcesById[sourceId];
    if (!source) return '';
    const label = short ? 'Source ↗' : source.title;
    return `<a class="source-inline" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHTML(source.title)}">${escapeHTML(label)}</a>`;
  }

  function sourceChip(sourceId) {
    const source = sourcesById[sourceId];
    if (!source) return '';
    return `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHTML(source.note)}">${escapeHTML(source.title)} ↗</a>`;
  }

  function renderComparison() {
    const body = byId('comparison-body');
    if (!body) return;
    const fields = ['job', 'data', 'model', 'orchestration', 'proof'];
    body.innerHTML = guide.vendors.map((vendor) => {
      const cells = fields.map((field) => `
        <td><button type="button" class="matrix-cell-button" data-vendor="${vendor.id}"><span class="cell-label">${escapeHTML(vendor.matrix[field])}</span></button></td>
      `).join('');
      return `<tr>
        <td>
          <button type="button" class="matrix-cell-button" data-vendor="${vendor.id}">
            <span class="matrix-system"><span class="system-color" style="color:${vendor.color};background:${vendor.color}"></span>${escapeHTML(vendor.name)}</span>
          </button>
        </td>
        ${cells}
      </tr>`;
    }).join('');
    body.addEventListener('click', (event) => {
      const button = event.target.closest('[data-vendor]');
      if (!button) return;
      selectVendor(button.dataset.vendor, { scroll: true, pushHash: true });
    });
  }

  function renderTabs() {
    const tabList = byId('vendor-tabs');
    if (!tabList) return;
    tabList.innerHTML = guide.vendors.map((vendor) => {
      const selected = vendor.id === state.activeVendor;
      return `<button
        class="vendor-tab"
        style="--vendor-color:${vendor.color}"
        role="tab"
        type="button"
        id="tab-${vendor.id}"
        aria-selected="${selected}"
        aria-controls="vendor-panel-content"
        tabindex="${selected ? '0' : '-1'}"
        data-vendor-tab="${vendor.id}">
        <span class="vendor-dot" aria-hidden="true"></span>${escapeHTML(vendor.name)}
      </button>`;
    }).join('');
  }

  function wrapSvgText(value, maxChars) {
    const words = String(value).split(/\s+/);
    const rows = [];
    let row = '';
    words.forEach((word) => {
      const candidate = row ? `${row} ${word}` : word;
      if (candidate.length > maxChars && row) {
        rows.push(row);
        row = word;
      } else {
        row = candidate;
      }
    });
    if (row) rows.push(row);
    return rows.slice(0, 2);
  }

  function svgText(rows, x, y, className, lineHeight) {
    return `<text class="${className}" x="${x}" y="${y}">${rows.map((row, index) => `<tspan x="${x}" dy="${index === 0 ? '0' : lineHeight}">${escapeHTML(row)}</tspan>`).join('')}</text>`;
  }

  function architectureDiagram(vendor, activeNodes) {
    const positions = [
      { x: 18, y: 121 }, { x: 174, y: 121 }, { x: 330, y: 121 },
      { x: 501, y: 42 }, { x: 501, y: 199 }, { x: 720, y: 121 }
    ];
    const width = 142;
    const height = 72;
    const active = new Set(activeNodes || vendor.nodes.map((_, index) => index));
    const edges = [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5]];
    const statusInfo = {
      public: { label: 'PUBLIC', color: '#80e7bb' },
      inferred: { label: 'RECON.', color: '#96b7ff' }
    };
    const edgeSvg = edges.map(([from, to]) => {
      const a = positions[from];
      const b = positions[to];
      const startX = a.x + width;
      const startY = a.y + height / 2;
      const endX = b.x;
      const endY = b.y + height / 2;
      const horizontal = Math.max(38, (endX - startX) / 2);
      const highlighted = active.has(from) && active.has(to);
      return `<path class="arch-edge ${highlighted ? 'is-highlight' : 'is-muted'}" d="M ${startX} ${startY} C ${startX + horizontal} ${startY}, ${endX - horizontal} ${endY}, ${endX} ${endY}" fill="none" stroke="#5f6e8b" stroke-width="1.35" marker-end="url(#arrow-${vendor.id})"/>`;
    }).join('');
    const nodesSvg = vendor.nodes.map((node, index) => {
      const position = positions[index];
      const status = statusInfo[node.status] || statusInfo.inferred;
      const highlighted = active.has(index);
      const titleRows = wrapSvgText(node.title, 18);
      const subRows = wrapSvgText(node.sub, 23);
      const titleY = position.y + 25 - (titleRows.length - 1) * 6;
      const subY = position.y + 49;
      return `<g class="arch-node ${highlighted ? 'is-highlight' : 'is-muted'}" data-node="${index}" transform="translate(${position.x} ${position.y})">
        <rect x="0" y="0" width="${width}" height="${height}" rx="6" fill="#121c32" stroke="${status.color}" stroke-opacity="${highlighted ? '.72' : '.4'}" stroke-width="1.1"/>
        <rect x="9" y="9" width="5" height="5" rx="2" fill="${status.color}"/>
        <text class="arch-status" x="88" y="14" fill="${status.color}">${status.label}</text>
        ${svgText(titleRows, width / 2, titleY, 'arch-label', 13)}
        ${svgText(subRows, width / 2, subY, 'arch-sub', 10)}
      </g>`;
    }).join('');
    return `<div class="arch-diagram-wrap">
      <svg class="arch-diagram" viewBox="0 0 884 315" role="img" aria-label="${escapeHTML(vendor.name)} rough architecture diagram" style="--vendor:${vendor.color}">
        <defs>
          <marker id="arrow-${vendor.id}" markerWidth="8" markerHeight="8" refX="6.2" refY="3.5" orient="auto"><path d="M0,0 L0,7 L7,3.5 z" fill="#657493"/></marker>
          <linearGradient id="faint-${vendor.id}" x1="0" x2="1"><stop offset="0" stop-color="${vendor.color}" stop-opacity=".07"/><stop offset="1" stop-color="${vendor.color}" stop-opacity="0"/></linearGradient>
        </defs>
        <rect x="4" y="15" width="875" height="284" rx="7" fill="url(#faint-${vendor.id})" opacity=".45"/>
        <text x="21" y="36" fill="#7987a1" font-family="var(--sans)" font-size="8" font-weight="800" letter-spacing="1.1">INPUT / STATE</text>
        <text x="507" y="28" fill="#7987a1" font-family="var(--sans)" font-size="8" font-weight="800" letter-spacing="1.1">INTELLIGENCE / CONTROL</text>
        ${edgeSvg}
        ${nodesSvg}
      </svg>
    </div>`;
  }

  function renderFacts(vendor) {
    return vendor.facts.map((fact) => `<article class="fact-item">
      <h4>${escapeHTML(fact.title)}</h4>
      <p>${escapeHTML(fact.text)}</p>
      ${sourceLink(fact.source)}
    </article>`).join('');
  }

  function renderScenario(vendor, scenarioIndex) {
    const scenario = vendor.scenarios[scenarioIndex];
    const pills = vendor.scenarios.map((item, index) => `<button class="scenario-pill" type="button" data-scenario="${index}" aria-pressed="${index === scenarioIndex}">${escapeHTML(item.title)}</button>`).join('');
    const steps = scenario.steps.map(([title, text]) => `<li class="trace-step is-active"><div><strong>${escapeHTML(title)}</strong><p>${escapeHTML(text)}</p></div></li>`).join('');
    return `<section class="flow-card" aria-labelledby="scenario-title">
      <div class="card-heading">
        <div><h3 id="scenario-title">Trace a request</h3><p>Switch the scenario to see which state, evidence, and control path must exist.</p></div>
        <span class="tag decision">WHITEBOARD FLOW</span>
      </div>
      <div class="scenario-pills" role="group" aria-label="${escapeHTML(vendor.name)} scenarios">${pills}</div>
      <div class="flow-body">
        <ol class="trace-steps">${steps}</ol>
        <aside class="trace-prompt">
          <span class="prompt-label">User / job prompt</span>
          <p>${escapeHTML(scenario.prompt)}</p>
          <p class="result-label">Result contract</p>
          <p class="result">${scenario.result}</p>
        </aside>
      </div>
    </section>`;
  }

  function renderVendor(vendor) {
    const panel = byId('vendor-panel');
    if (!panel) return;
    const scenarioIndex = Number.isInteger(state.scenarios[vendor.id]) ? state.scenarios[vendor.id] : 0;
    state.scenarios[vendor.id] = scenarioIndex;
    const scenario = vendor.scenarios[scenarioIndex];
    const sourceRows = vendor.sourceIds.map(sourceChip).join('');

    panel.innerHTML = `<article class="vendor-panel" id="vendor-panel-content" role="tabpanel" aria-labelledby="tab-${vendor.id}" style="--vendor:${vendor.color}">
      <header class="vendor-hero">
        <div>
          <p class="vendor-type">${escapeHTML(vendor.type)}</p>
          <h2 class="vendor-title">${escapeHTML(vendor.name)}</h2>
          <p class="vendor-subtitle">${escapeHTML(vendor.subtitle)}</p>
        </div>
        <div class="vendor-thesis"><p>${vendor.thesis}</p></div>
      </header>

      <div class="vendor-kpis">${vendor.kpis.map((item) => `<article class="kpi"><span class="kpi-value">${escapeHTML(item.label)}</span><p>${escapeHTML(item.text)}</p></article>`).join('')}</div>

      <div class="vendor-layout">
        <section class="arch-card" aria-labelledby="architecture-title">
          <div class="card-heading">
            <div><h3 id="architecture-title">Rough system architecture</h3><p>Boxes marked PUBLIC are based on vendor materials. RECON. boxes are a deliberately labeled implementation hypothesis.</p></div>
            <span class="tag inferred">RECONSTRUCTION</span>
          </div>
          ${architectureDiagram(vendor, scenario.activeNodes)}
          <p class="arch-caption"><strong>How to read it:</strong> models are only one service in the path. The production contract is the evidence-bearing state, the policy boundary, and the human-approved output.</p>
        </section>

        <aside class="right-stack">
          <section class="facts-card" aria-labelledby="public-facts-title">
            <div class="card-heading"><div><h3 id="public-facts-title">What is public</h3><p>Product claims; open the primary source before repeating a detail in an interview.</p></div><span class="tag public">PUBLIC</span></div>
            <div class="fact-list">${renderFacts(vendor)}</div>
            <p class="unknown-note"><strong>What is not public:</strong> ${escapeHTML(vendor.unknown)}</p>
          </section>
        </aside>

        ${renderScenario(vendor, scenarioIndex)}

        <section class="stack-card" aria-labelledby="reconstruction-title">
          <div class="card-heading"><div><h3 id="reconstruction-title">Engineering reconstruction</h3><p>These are the hidden primitives you would likely design to make the product behavior reliable, scalable, and defensible.</p></div><span class="tag inferred">RECONSTRUCTION</span></div>
          <div class="reconstruction-grid">
            ${vendor.reconstruction.map((item) => `<article class="reconstruction-block"><span class="tag inferred">LIKELY LAYER</span><h4>${escapeHTML(item.title)}</h4><p>${item.text}</p></article>`).join('')}
          </div>
        </section>

        <section class="data-card" aria-labelledby="pipeline-title">
          <div class="card-heading"><div><h3 id="pipeline-title">Data &amp; inference pipeline</h3><p>One way to build the data plane so the system survives real document volume, access changes, and audit questions.</p></div><span class="tag decision">DESIGN CALL</span></div>
          <div class="pipeline-grid">${vendor.pipeline.map((item) => `<article class="pipeline-step"><h4>${escapeHTML(item.title)}</h4><p>${escapeHTML(item.text)}</p></article>`).join('')}</div>
        </section>

        <section class="interview-card" aria-labelledby="interview-question-title">
          <div class="interview-question"><span class="tag decision">INTERVIEW PROMPT</span><h3 id="interview-question-title">${escapeHTML(vendor.interview.question)}</h3><p>${escapeHTML(vendor.interview.framing)}</p></div>
          <div><div class="card-heading"><div><h3>Strong answer outline</h3><p>Architecture, model choice, eval, and rollout — in that order.</p></div></div><ul class="design-list">${vendor.interview.bullets.map((bullet) => `<li><span>${bullet}</span></li>`).join('')}</ul></div>
        </section>

        <section class="eval-card" aria-labelledby="eval-title">
          <div class="card-heading"><div><h3 id="eval-title">What to measure</h3><p>Legal systems fail at multiple stages. Instrument the pipeline; never collapse this into one “accuracy” number.</p></div><span class="tag decision">EVALS</span></div>
          <div class="eval-grid">${vendor.evals.map((item) => `<article class="eval-item"><h4>${escapeHTML(item.title)}</h4><p>${escapeHTML(item.text)}</p></article>`).join('')}</div>
        </section>

        <section class="source-card" aria-labelledby="vendor-sources-title">
          <div class="card-heading"><div><h3 id="vendor-sources-title">Vendor research trail</h3><p>Primary product / engineering materials used for public claims in this deep dive.</p></div><span class="tag public">SOURCES</span></div>
          <div class="vendor-source-row">${sourceRows}</div>
        </section>
      </div>
    </article>`;

    panel.querySelectorAll('[data-scenario]').forEach((button) => {
      button.addEventListener('click', () => {
        state.scenarios[vendor.id] = Number(button.dataset.scenario);
        renderVendor(vendor);
      });
    });
  }

  function selectVendor(id, options = {}) {
    const vendor = vendorsById[id];
    if (!vendor) return;
    state.activeVendor = id;
    renderTabs();
    renderVendor(vendor);
    if (options.pushHash) {
      const hash = `#system-${id}`;
      if (window.location.hash !== hash) history.pushState(null, '', hash);
    }
    if (options.scroll) {
      requestAnimationFrame(() => byId('systems-title').scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  function renderReferenceStack() {
    const stack = byId('reference-stack');
    if (!stack) return;
    stack.innerHTML = guide.referenceStack.map((layer) => `<article class="reference-layer" style="--layer:${layer.color}" data-index="${layer.index}">
      <span class="layer-mode">${escapeHTML(layer.mode)}</span>
      <h3>${escapeHTML(layer.title)}</h3><p>${escapeHTML(layer.text)}</p>
    </article>`).join('');
  }

  function renderLens() {
    const card = byId('lens-card');
    const lens = guide.lenses[state.lensIndex];
    if (!card || !lens) return;
    card.innerHTML = `<div><p class="lens-label">${escapeHTML(lens.label)}</p><h3>${escapeHTML(lens.title)}</h3></div><p>${lens.text}</p>`;
  }

  function renderDrill() {
    const drill = guide.drills[state.drillIndex];
    const prompt = byId('drill-prompt');
    const answer = byId('drill-answer');
    const reveal = byId('reveal-drill');
    if (!drill || !prompt || !answer || !reveal) return;
    prompt.textContent = drill.prompt;
    answer.innerHTML = `<ul>${drill.answer.map((item) => `<li>${item}</li>`).join('')}</ul>`;
    answer.hidden = !state.drillRevealed;
    reveal.textContent = state.drillRevealed ? 'Hide outline' : 'Reveal a strong outline';
  }

  function renderSourceFilters() {
    const container = byId('source-filters');
    if (!container) return;
    const filters = ['All', ...new Set(guide.sources.map((source) => source.system))];
    container.innerHTML = filters.map((filter) => `<button type="button" class="source-filter" data-source-filter="${escapeHTML(filter)}" aria-pressed="${filter === state.sourceFilter}">${escapeHTML(filter)}</button>`).join('');
  }

  function renderSourceList() {
    const list = byId('source-list');
    if (!list) return;
    const sources = state.sourceFilter === 'All'
      ? guide.sources
      : guide.sources.filter((source) => source.system === state.sourceFilter);
    list.innerHTML = sources.map((source) => `<article class="source-item">
      <div class="source-system">${escapeHTML(source.system)}</div>
      <div class="source-main"><a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} ↗</a><p>${escapeHTML(source.note)}</p></div>
      <time class="source-date">${escapeHTML(source.date)}</time>
    </article>`).join('');
  }

  async function copySources() {
    const button = byId('copy-sources');
    const sources = state.sourceFilter === 'All' ? guide.sources : guide.sources.filter((source) => source.system === state.sourceFilter);
    const text = sources.map((source) => `${source.system} — ${source.title}\n${source.url}\n${source.note}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied source list';
    } catch (error) {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      try { document.execCommand('copy'); button.textContent = 'Copied source list'; } catch (copyError) { button.textContent = 'Select sources manually'; }
      document.body.removeChild(helper);
    }
    window.setTimeout(() => { button.textContent = 'Copy source list'; }, 1800);
  }

  function handleHash() {
    const match = window.location.hash.match(/^#system-([a-z-]+)$/);
    if (match && vendorsById[match[1]] && match[1] !== state.activeVendor) {
      selectVendor(match[1], { scroll: false, pushHash: false });
    }
  }

  function initEvents() {
    const tabList = byId('vendor-tabs');
    tabList.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-vendor-tab]');
      if (!tab) return;
      selectVendor(tab.dataset.vendorTab, { scroll: false, pushHash: true });
    });
    tabList.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const tabs = Array.from(tabList.querySelectorAll('[data-vendor-tab]'));
      const focusedTab = event.target.closest('[data-vendor-tab]') || document.activeElement?.closest?.('[data-vendor-tab]');
      const currentIndex = focusedTab ? tabs.indexOf(focusedTab) : tabs.findIndex((tab) => tab.dataset.vendorTab === state.activeVendor);
      let targetIndex = currentIndex;
      if (event.key === 'ArrowRight') targetIndex = (currentIndex + 1) % tabs.length;
      if (event.key === 'ArrowLeft') targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') targetIndex = 0;
      if (event.key === 'End') targetIndex = tabs.length - 1;
      event.preventDefault();
      const targetVendor = tabs[targetIndex].dataset.vendorTab;
      selectVendor(targetVendor, { scroll: false, pushHash: true });
      requestAnimationFrame(() => {
        const refreshedTab = tabList.querySelector(`[data-vendor-tab="${targetVendor}"]`);
        if (refreshedTab) refreshedTab.focus();
      });
    });
    byId('open-first-vendor').addEventListener('click', () => selectVendor('docusign', { scroll: true, pushHash: true }));
    byId('rotate-lens').addEventListener('click', () => {
      state.lensIndex = (state.lensIndex + 1) % guide.lenses.length;
      renderLens();
    });
    byId('reveal-drill').addEventListener('click', () => {
      state.drillRevealed = !state.drillRevealed;
      renderDrill();
    });
    byId('next-drill').addEventListener('click', () => {
      state.drillIndex = (state.drillIndex + 1) % guide.drills.length;
      state.drillRevealed = false;
      renderDrill();
    });
    byId('copy-sources').addEventListener('click', copySources);
    byId('source-filters').addEventListener('click', (event) => {
      const button = event.target.closest('[data-source-filter]');
      if (!button) return;
      state.sourceFilter = button.dataset.sourceFilter;
      renderSourceFilters();
      renderSourceList();
    });
    window.addEventListener('hashchange', handleHash);
  }

  function init() {
    const initial = window.location.hash.match(/^#system-([a-z-]+)$/);
    if (initial && vendorsById[initial[1]]) state.activeVendor = initial[1];
    renderComparison();
    renderTabs();
    renderVendor(vendorsById[state.activeVendor]);
    renderReferenceStack();
    renderLens();
    renderDrill();
    renderSourceFilters();
    renderSourceList();
    initEvents();
  }

  init();
})();
