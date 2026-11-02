/* All interactions are local. No persistence, telemetry, or network requests. */
'use strict';
const $ = id => document.getElementById(id);
const M = window.ChipDesignModels;
const sections = [...document.querySelectorAll('.chapter')];
const navLinks = [...document.querySelectorAll('#contents nav a')];
function search() {
  const query = $('search').value.trim().toLocaleLowerCase();
  let count = 0;
  sections.forEach((section, i) => {
    const matches = !query || section.textContent.toLocaleLowerCase().includes(query);
    section.hidden = !matches;
    navLinks[i].hidden = !matches;
    if (matches) count++;
  });
  $('search-status').textContent = query ? `${count} of ${sections.length} sections match` : 'All chapters shown';
  $('empty-search').hidden = count !== 0;
}
$('search').addEventListener('input', search);
// Fragment shortcuts remain usable even with active filters or a closed mobile TOC.
function revealTarget(target, moveFocus = true) {
  if (!target) return;
  const chapter = target.closest('.chapter');
  if ((chapter && chapter.hidden) || target.id === 'contents') {
    $('search').value = ''; search();
  }
  if (target.id === 'contents') target.open = true;
  requestAnimationFrame(() => {
    if (moveFocus) {
      const focusTarget = target.id === 'contents' ? target.querySelector('summary') : target;
      focusTarget.focus({preventScroll:true});
    }
    target.scrollIntoView({block:'start'});
  });
}
function revealHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (id) revealTarget(document.getElementById(id));
}
window.addEventListener('hashchange', revealHash);
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  const target = document.getElementById(link.getAttribute('href').slice(1));
  revealTarget(target);
}));
$('clear-search').addEventListener('click', () => {
  $('search').value = ''; search(); $('search').focus();
});
const glossaryEntries = [...document.querySelectorAll('.glossary-entry')];
function filterGlossary() {
  const query = $('glossary-search').value.trim().toLocaleLowerCase();
  let count = 0;
  glossaryEntries.forEach(entry => {
    entry.hidden = Boolean(query) && !entry.textContent.toLocaleLowerCase().includes(query);
    if (!entry.hidden) count++;
  });
  $('glossary-status').textContent = count ? `${count} of ${glossaryEntries.length} definitions shown` : 'No terms match. Try another word or choose Show all terms.';
}
$('glossary-search').addEventListener('input', filterGlossary);
$('clear-glossary').addEventListener('click', () => {
  $('glossary-search').value = ''; filterGlossary(); $('glossary-search').focus();
});
filterGlossary();
const routes = {
  software: {text: 'Software engineer route: 3 teams → 5 RTL → 7 HLS → 9 synthesis → 15 AI. Exit artifact: explain why “tests passed” and “the chip works” differ.', ids: [3,5,7,9,15]},
  newgrad: {text: 'New grad route: 3 → 4 → 5 → 6 → 8 → 9 → 10 → 11. Exit artifact: narrate one bug from spec to signoff.', ids: [3,4,5,6,8,9,10,11]},
  product: {text: 'Product-minded route: 12 foundries → 13 packaging → 14 economics → 3 teams → 15 AI. Exit artifact: a one-page make-vs-buy sketch.', ids: [3,12,13,14,15]}
};
document.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', () => {
  $('search').value = ''; search();
  const route = routes[link.dataset.route];
  $('route-status').textContent = route.text;
  sections.forEach(s => s.classList.toggle('on-route', route.ids.some(id => s.id === `chapter-${id}`)));
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('selected', a === link));
}));
$('print').addEventListener('click', () => window.print());
let closedBeforePrint = null;
window.addEventListener('beforeprint', () => {
  if (closedBeforePrint !== null) return;
  closedBeforePrint = [...document.querySelectorAll('details:not([open])')];
  closedBeforePrint.forEach(d => { d.open = true; });
});
window.addEventListener('afterprint', () => {
  if (closedBeforePrint !== null) closedBeforePrint.forEach(d => { d.open = false; });
  closedBeforePrint = null;
});
if (window.matchMedia('(max-width: 720px)').matches) $('contents').open = false;

// ===== Demo B: pipeline cost explorer =====
function paintStage(id) {
  const s = M.stageDetail(id);
  const detail = $('stage-detail');
  detail.replaceChildren();
  const h = document.createElement('h4'); h.textContent = s.name;
  const cost = document.createElement('p');
  const chip = document.createElement('span'); chip.className = 'cost-chip';
  chip.textContent = s.escape === 1 ? 'RULE OF THUMB: 1x HERE' : s.escape === 10 ? 'RULE OF THUMB: ~10x IF LATE' : 'RULE OF THUMB: ~100x IF LATE';
  cost.append(chip);
  const catches = document.createElement('p');
  catches.innerHTML = '<strong>What gets caught here:</strong> ';
  catches.append(document.createTextNode(s.catches.join('; ') + '.'));
  const tools = document.createElement('p');
  tools.innerHTML = '<strong>Typical tools:</strong> ';
  tools.append(document.createTextNode(s.tools.join(', ') + '.'));
  const note = document.createElement('p');
  note.innerHTML = '<strong>Cost of escaping this stage:</strong> ';
  note.append(document.createTextNode(s.escapeNote));
  detail.append(h, cost, catches, tools, note);
  document.querySelectorAll('#stage-buttons button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.stage === id)));
}
(function initPipeline() {
  const box = $('stage-buttons');
  M.pipelineStages.forEach((s, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.stage = s.id;
    button.textContent = `${i + 1}. ${s.name}`;
    button.addEventListener('click', () => paintStage(s.id));
    box.append(button);
  });
  paintStage('spec');
})();

// ===== Demo A: RTL playground =====
function svgNode(name, attributes, text) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key,value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  if (text !== undefined) element.textContent = text;
  return element;
}
let rtlRows = [];
function rtlParams() {
  return $('rtl-example').value === 'counter'
    ? {example: 'counter', params: {width: Number($('rtl-width').value), resetValue: Number($('rtl-reset-value').value), enableMode: $('rtl-enable').value, breakIt: $('rtl-bug').checked}}
    : {example: 'traffic', params: {green: Number($('rtl-green').value), yellow: Number($('rtl-yellow').value), red: Number($('rtl-red').value), breakIt: $('rtl-bug').checked}};
}
function paintRTLCode() {
  const {example, params} = rtlParams();
  $('rtl-code').textContent = M.rtlCode({example, params});
}
function paintWave() {
  const svg = $('wave-svg');
  svg.replaceChildren();
  const isCounter = $('rtl-example').value === 'counter';
  const shown = rtlRows.slice(-12);
  const add = (name, attrs, text) => svg.append(svgNode(name, attrs, text));
  if (!shown.length) {
    // Compact empty state: a tall label column with nothing in it wastes half a phone screen.
    svg.setAttribute('viewBox', '0 0 640 44');
    add('text', {x: 320, y: 27, 'text-anchor': 'middle', 'font-size': 14, fill: '#536761'}, 'No edges yet — advance one rising edge to draw the waveform.');
    return;
  }
  const cw = 62, x0 = 135;
  svg.setAttribute('viewBox', `0 0 ${x0 + cw * shown.length + 10} 260`);
  const rows = isCounter
    ? [['clk', 30], ['rst_n', 75], ['en', 120], ['count', 175]]
    : [['clk', 30], ['rst_n', 75], ['state', 120], ['timer', 175]];
  rows.forEach(([label, y]) => {
    add('text', {x: 5, y: y + 4, fill: '#183c37', 'font-size': 12}, label);
    add('line', {x1: x0, y1: y, x2: x0 + cw * shown.length, y2: y, stroke: '#c3cbbc'});
  });
  shown.forEach((row, i) => {
    const x = x0 + i * cw;
    // Clock: one rising edge marker per cycle.
    add('line', {x1: x + 4, x2: x + 4, y1: 22, y2: 30, stroke: '#6e8866', 'stroke-width': 2});
    add('line', {x1: x + 4, x2: x + cw - 4, y1: 30, y2: 30, stroke: '#6e8866'});
    // Level signals: high band = y-10, low band = y.
    const level = (value, y) => add('line', {x1: x + 2, x2: x + cw - 2, y1: value ? y - 9 : y, y2: value ? y - 9 : y, stroke: value ? '#386747' : '#a4afa0', 'stroke-width': 2.5});
    level(row.rst_n, 75);
    if (isCounter) {
      level(row.en, 120);
      const unknown = row.count === 'X';
      add('rect', {x: x + 2, y: 158, width: cw - 4, height: 26, fill: unknown ? '#f3d9cd' : '#e7efcf', stroke: unknown ? '#af4d2e' : '#8ba18b'});
      add('text', {x: x + cw / 2, y: 176, 'text-anchor': 'middle', 'font-size': 13, fill: unknown ? '#af4d2e' : '#183c37'}, String(row.count));
    } else {
      add('rect', {x: x + 2, y: 103, width: cw - 4, height: 26, fill: '#e7efcf', stroke: '#8ba18b'});
      add('text', {x: x + cw / 2, y: 121, 'text-anchor': 'middle', 'font-size': 13, fill: '#183c37'}, row.state);
      add('text', {x: x + cw / 2, y: 176, 'text-anchor': 'middle', 'font-size': 13, fill: '#183c37'}, String(row.timer));
    }
    add('text', {x: x + cw / 2, y: 222, 'text-anchor': 'middle', 'font-size': 10, fill: '#536761'}, `c${row.cycle}`);
  });
  add('text', {x: 5, y: 250, 'font-size': 11, fill: '#536761'}, rtlRows.length > 12 ? `Showing last 12 of ${rtlRows.length} edges · each column is one rising edge` : `${rtlRows.length} rising edge(s) · each column shows values after that edge`);
}
function paintRTLHistory() {
  $('rtl-history').replaceChildren();
  const isCounter = $('rtl-example').value === 'counter';
  [...rtlRows].reverse().forEach(row => {
    const tr = document.createElement('tr');
    (isCounter ? [row.cycle, row.rst_n, row.en, row.count] : [row.cycle, row.rst_n, row.state, row.timer])
      .forEach(value => { const td = document.createElement('td'); td.textContent = String(value); tr.append(td); });
    $('rtl-history').append(tr);
  });
}
function paintRTLResult() {
  const isCounter = $('rtl-example').value === 'counter';
  if (!rtlRows.length) {
    $('rtl-result').textContent = 'No edge yet. Reset the session to begin.';
  } else {
    const last = rtlRows[rtlRows.length - 1];
    if (isCounter) {
      const bug = $('rtl-bug').checked ? ' Bug active: no reset, so count is X (undefined) and X + 1 stays X.' : '';
      $('rtl-result').textContent = `Edge ${last.cycle}: rst_n=${last.rst_n}, en=${last.en}, count=${last.count} after the edge.${bug}`;
    } else {
      const bug = $('rtl-bug').checked ? ' Bug active: the G→Y transition is missing, so the light is stuck in green.' : '';
      $('rtl-result').textContent = `Edge ${last.cycle}: state=${last.state} (timer ${last.timer}) after the edge.${bug}`;
    }
  }
  paintWave();
  paintRTLHistory();
}
function rtlStep(n = 1) {
  for (let i = 0; i < n; i++) {
    const {example, params} = rtlParams();
    const trace = example === 'counter' ? M.counterTrace({...params, cycles: rtlRows.length + 1}) : M.trafficTrace({...params, cycles: rtlRows.length + 1});
    rtlRows = trace.rows;
  }
  paintRTLResult();
}
function rtlReset() {
  rtlRows = [];
  const isCounter = $('rtl-example').value === 'counter';
  $('rtl-bug-label').textContent = isCounter ? 'Break it: remove the reset' : 'Break it: drop the green→yellow transition';
  $('rtl-counter-params').hidden = !isCounter;
  $('rtl-traffic-params').hidden = isCounter;
  paintRTLCode();
  paintRTLResult();
}
$('rtl-step').addEventListener('click', () => rtlStep(1));
$('rtl-run').addEventListener('click', () => rtlStep(8));
$('rtl-clear').addEventListener('click', rtlReset);
['rtl-example', 'rtl-width', 'rtl-reset-value', 'rtl-enable', 'rtl-green', 'rtl-yellow', 'rtl-red', 'rtl-bug'].forEach(id => $(id).addEventListener('change', rtlReset));

// ===== Demo C: HLS side-by-side =====
function paintHLS() {
  const r = M.hlsVariant({unroll: Number($('hls-unroll').value), pipeline: $('hls-pipeline').checked});
  $('hls-c-code').textContent = r.cCode;
  $('hls-rtl-code').textContent = r.rtlCode;
  $('hls-metrics').replaceChildren();
  const metrics = [['Latency (cycles)', r.latency], ['Initiation interval', r.ii], ['Adders', r.adds], ['Relative area', r.area.toFixed(1)]];
  metrics.forEach(([name, value]) => {
    const cell = document.createElement('div');
    const label = document.createElement('span'); label.textContent = name;
    const strong = document.createElement('strong'); strong.textContent = String(value);
    cell.append(label, strong); $('hls-metrics').append(cell);
  });
  $('hls-result').textContent = r.note + ' Teaching schedule only — real tool reports are the numbers to trust.';
}
$('hls-unroll').addEventListener('change', paintHLS);
$('hls-pipeline').addEventListener('change', paintHLS);

// ===== Demo D: node economics explorer =====
function paintNode() {
  const die = Number($('node-die').value);
  const wafer = Number($('node-wafer').value);
  const volume = Math.round(10 ** Number($('node-volume').value));
  const nre = Math.round(10 ** Number($('node-nre').value));
  const d0 = Number($('node-d0').value);
  $('node-die-value').textContent = `${die} mm²`;
  $('node-wafer-value').textContent = `$${wafer.toLocaleString('en-US')}`;
  $('node-volume-value').textContent = volume.toLocaleString('en-US');
  $('node-nre-value').textContent = `$${nre.toLocaleString('en-US')}`;
  $('node-d0-value').textContent = d0.toFixed(3);
  const r = M.nodeEconomics({dieArea: die, waferPrice: wafer, volume, nre, defectDensity: d0});
  $('node-result').textContent = `At ${die} mm² and $${wafer.toLocaleString('en-US')}/wafer: ~${r.gross} gross dies/wafer, ${Math.round(r.yieldRate * 100)}% modeled yield → ~${r.good.toFixed(0)} good dies. Simplified estimates only — not a quote.`;
  $('node-metrics').replaceChildren();
  const metrics = [
    ['Gross dies / wafer', r.gross],
    ['Modeled yield', `${(r.yieldRate * 100).toFixed(1)}%`],
    ['Cost per good die', `$${r.perDie.toFixed(2)}`],
    ['NRE per chip at volume', `$${r.nrePerChip.toFixed(2)}`],
    ['All-in cost per chip', `$${r.allIn.toFixed(2)}`],
    ['Volume', volume.toLocaleString('en-US')]
  ];
  metrics.forEach(([name, value]) => {
    const cell = document.createElement('div');
    const label = document.createElement('span'); label.textContent = name;
    const strong = document.createElement('strong'); strong.textContent = String(value);
    cell.append(label, strong); $('node-metrics').append(cell);
  });
}
function applyNodePreset() {
  const preset = M.nodePresets.find(p => p.name === $('node-preset').value);
  if (!preset) return;
  $('node-wafer').value = String(preset.wafer);
  $('node-d0').value = String(preset.d0);
  $('node-nre').value = String(Math.log10(preset.nre).toFixed(1));
  paintNode();
}
$('node-preset').addEventListener('change', applyNodePreset);
['node-die', 'node-wafer', 'node-volume', 'node-nre', 'node-d0'].forEach(id => $(id).addEventListener('input', paintNode));

paintRTLCode();
paintRTLResult();
paintHLS();
applyNodePreset();
revealHash();
