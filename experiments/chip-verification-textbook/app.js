/* All interactions are local. No persistence, telemetry, or network requests. */
'use strict';
const $ = id => document.getElementById(id);
const M = window.ChipModels;
let fifo = new M.FIFO(4), hits = new Set(), history = [], hypothetical = false;
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
  // Also handles a repeated click on the current hash, which emits no hashchange.
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
  quick: {text: '45 minutes: chapters 1 → 3 → 4 + FIFO lab → 12 → 16; drills 1–5.', ids: [1,3,4,12,16,17]},
  study: {text: '3 hours: 1–8 (60m), 9–12 (25m), 19 code (30m), 20 CDC + lab (30m), 13–16 (15m), drills 6–15 (20m).', ids: [...Array.from({length:17}, (_,i)=>i+1),19,20]},
  deep: {text: 'Deep route: all 22 chapters, all four labs + evidence exercise, 25 drills, and the five portfolio milestones in chapter 15.', ids: Array.from({length:22}, (_,i)=>i+1)}
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
function paintFIFO(result) {
  $('queue').replaceChildren();
  for (let i = 0; i < 4; i++) {
    const box = document.createElement('div'); box.className = 'slot' + (i < fifo.queue.length ? ' occupied' : '');
    const label = document.createElement('small'); label.textContent = i === 0 ? 'HEAD' : i === 3 ? 'TAIL SIDE' : `POSITION ${i+1}`;
    const word = document.createElement('strong'); word.textContent = fifo.queue[i] ?? '—';
    box.append(label, word); $('queue').append(box);
  }
  $('pointers').textContent = `Post-edge occupancy ${fifo.queue.length}/4 · read pointer ${fifo.read} · write pointer ${fifo.write} · cycle ${fifo.cycle}`;
  if (result) {
    $('edge-result').textContent = result.reset ? `Edge ${result.cycle}: reset dominates. No transfers; queue flushed.` :
      `Edge ${result.cycle}: pre-edge in_ready=${+result.inReady}, out_valid=${+result.outValid}. Push=${+result.push}, pop=${+result.pop}. ${result.pop ? `Old head ${result.oldHead} consumed. ` : ''}Count ${result.before.length} → ${result.after.length}.`;
  }
  $('history').replaceChildren();
  [...history].reverse().forEach(r => {
    const tr = document.createElement('tr');
    [r.cycle, `[${r.before.join(', ')}]`, `${+r.inReady} / ${+r.outValid}`, r.reset ? 'RESET' : r.event, r.pop ? r.oldHead : '—', `[${r.after.join(', ')}]`].forEach(value => {
      const td = document.createElement('td'); td.textContent = value; tr.append(td);
    });
    $('history').append(tr);
  });
  paintCoverage();
}
function record(input) {
  const result = fifo.step(input);
  history.push(result); if (history.length > 40) history.shift();
  if (!result.reset) hits.add(`${result.state}:${result.event}`);
  paintFIFO(result);
}
function clear() {
  fifo = new M.FIFO(4); hits = new Set(); history = []; hypothetical = false;
  $('fifo-error').textContent = '';
  $('edge-result').textContent = 'New session: empty queue, no recorded transfers.';
  paintFIFO();
}
$('step').addEventListener('click', () => {
  const value = $('data').value;
  if (!value.trim() || !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 255) {
    $('fifo-error').textContent = 'Enter an integer input word from 0 to 255. No edge advanced.'; return;
  }
  $('fifo-error').textContent = '';
  record({valid: $('valid').checked, ready: $('ready').checked, reset: $('reset').checked, data: Number(value)});
});
$('clear-fifo').addEventListener('click', clear);
$('fill').addEventListener('click', () => {
  clear(); [10,20,30,40].forEach(data => record({valid:true, ready:false, data}));
  $('valid').checked = true; $('ready').checked = true; $('reset').checked = false; $('data').value = '50';
});
function paintCoverage() {
  const shown = hypothetical ? new Set(M.states.flatMap(s => M.events.map(e => `${s}:${e}`)).filter(k => !M.excluded.has(k))) : hits;
  $('coverage-grid').replaceChildren();
  for (const state of M.states) for (const event of M.events) {
    const key = `${state}:${event}`, excluded = M.excluded.has(key), reached = shown.has(key);
    const cell = document.createElement('div'); cell.className = 'bin' + (excluded ? ' excluded' : reached ? ' hit' : '');
    cell.textContent = `${state} / ${event} — ${excluded ? 'unreachable' : reached ? 'HIT' : 'not hit'}`;
    $('coverage-grid').append(cell);
  }
  const c = M.coverage(shown, $('review-exclusions').checked);
  $('coverage-result').textContent = `${hypothetical ? 'Hypothetical plan' : 'Live FIFO observations'}: ${c.counted}/${c.denominator} = ${c.percent.toFixed(1)}%. ${$('review-exclusions').checked ? 'Three contract-based exclusions applied.' : 'Raw nominal denominator; no exclusions applied.'} Correctness is not established by this percentage.`;
  $('live-coverage').setAttribute('aria-pressed', String(!hypothetical));
  $('planned-coverage').setAttribute('aria-pressed', String(hypothetical));
}
$('live-coverage').addEventListener('click', () => { hypothetical = false; paintCoverage(); });
$('planned-coverage').addEventListener('click', () => { hypothetical = true; paintCoverage(); });
$('review-exclusions').addEventListener('change', paintCoverage);
function paintEvidence() {
  const input = Object.fromEntries(['spec','run','wave','source','reproduced','truncated'].map(k => [k, $(`ev-${k}`).checked]));
  const answer = M.evidence(input);
  $('evidence-result').textContent = answer.text;
  $('evidence-result').dataset.level = answer.level;
}
document.querySelectorAll('#evidence-lab input').forEach(input => input.addEventListener('change', paintEvidence));
paintFIFO(); paintEvidence(); revealHash();

// New deep-route technical labs: all computations remain in pure local models.
if (window.matchMedia('(max-width: 720px)').matches) $('contents').open = false;
function paintHidden() {
  $('hidden-code').textContent = `const queue = [];                  // 1: init
// For each command in the selected suite:
if (command.kind === 'write') {
  queue.push(command.word);         // 2: write
} else {
  const word = queue.${$('hidden-mutant').checked ? 'pop()' : 'shift()'}; ${$('hidden-mutant').checked ? '// 3: read — BUG: newest first' : '// 3: read — oldest first'}
  outputs.push(word);               // 4: emit
}`;
  const r = M.hiddenOrdering({mutant:$('hidden-mutant').checked, suite:$('hidden-suite').value, checker:$('hidden-checker').checked});
  $('hidden-result').textContent = `Labeled statements hit: ${r.labels.length}/4 = ${r.statementPercent}%. Multi-item ordering bin: ${r.orderingBin ? 'HIT' : 'not hit'}. Independent checker: ${r.verdict.toUpperCase()}.`;
  $('hidden-trace').textContent = `Observed outputs [${r.outputs.join(', ')}]; specified outputs [${r.expected.join(', ')}]. ${r.verdict === 'unchecked' ? 'No correctness verdict without the checker.' : r.verdict === 'fail' ? 'Ordering bug detected, despite all statements running.' : 'This suite did not detect a mismatch; smoke alone cannot distinguish FIFO from LIFO.'}`;
}
['hidden-mutant','hidden-suite','hidden-checker'].forEach(id => $(id).addEventListener('change', paintHidden));
function svgNode(name, attributes, text) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key,value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  if (text !== undefined) element.textContent = text;
  return element;
}
function paintCDC() {
  const input = Object.fromEntries(['src','dst','phase','width','spacing'].map(k=>[k, $(`cdc-${k}`).value.trim() ? Number($(`cdc-${k}`).value) : NaN]));
  input.mode = $('cdc-mode').value;
  let r;
  try {r = M.cdcPulse(input);} catch(error) {
    $('cdc-error').textContent = `${error.message}. Previous results cleared.`;
    $('cdc-result').textContent = 'Invalid controls: no simulation result.';
    $('cdc-diagram').replaceChildren(); $('cdc-samples').replaceChildren(); $('cdc-answer').textContent = ''; return;
  }
  $('cdc-error').textContent = '';
  $('cdc-result').textContent = `${r.offers.length} offered; ${r.accepted.length} accepted; ${r.delivered.length} delivered; ${r.busy} refused while busy; ${r.missed} accepted events not delivered. Ideal digital model only.`;
  $('cdc-answer').textContent = input.mode === 'pulse' ?
    'Two flops only propagate a level the first stage samples. Short pulses can be missed; contiguous highs can merge. Adding stages cannot reconstruct absent events. Try toggle mode with well-spaced events.' : input.mode === 'toggle' ?
    'Toggling makes a narrow event persistent, but rapid pairs can cancel before a sample. No acknowledgment enforces the rate bound. Compare fast-event mode with handshake.' :
    'Acknowledgment prevents another accepted toggle until the prior one returns. Busy offers are refused, not queued or retried. Delivery of all accepted events is not delivery of all offered events.';
  const svg = $('cdc-diagram'); svg.replaceChildren();
  const displayEnd = r.offers[5]+input.width*input.src+3*input.dst;
  const x = t => 135 + t/displayEnd*620;
  const add = (name,attrs,text) => svg.append(svgNode(name,attrs,text));
  [['Offered pulse',40],['Source edges',90],['Dst samples',140],['Delivered event',190]].forEach(([label,y])=> {
    add('text',{x:5,y:y+4,fill:'#183c37','font-size':12},label);
    add('line',{x1:135,y1:y,x2:760,y2:y,stroke:'#c3cbbc'});
  });
  r.offers.forEach(t=>add('rect',{x:x(t),y:25,width:Math.max(1,x(t+input.width*input.src)-x(t)),height:15,fill:'#abc966'}));
  for(let t=0;t<=displayEnd;t+=input.src) add('line',{x1:x(t),x2:x(t),y1:82,y2:90,stroke:'#6e8866'});
  r.samples.filter(s=>s.t<=displayEnd).forEach(s=>add('circle',{cx:x(s.t),cy:140,r:s.input?4:2.5,fill:s.input?'#386747':'#a4afa0'}));
  r.delivered.filter(t=>t<=displayEnd).forEach(t=>add('line',{x1:x(t),x2:x(t),y1:174,y2:190,stroke:'#a64a2d','stroke-width':3}));
  add('text',{x:135,y:225,'font-size':11,fill:'#536761'},'0 ticks');
  add('text',{x:690,y:225,'font-size':11,fill:'#536761'},`${displayEnd} ticks`);
  $('cdc-samples').replaceChildren();
  r.samples.slice(0,32).forEach(sample => {
    const row = document.createElement('tr');
    [sample.t,sample.input,sample.q1,sample.q2,sample.event?'EVENT':'—'].forEach(value => {const cell=document.createElement('td');cell.textContent=value;row.append(cell);});
    $('cdc-samples').append(row);
  });
}
['src','dst','phase','width','spacing','mode'].forEach(k=>$(`cdc-${k}`).addEventListener('input',paintCDC));
$('cdc-miss').addEventListener('click',()=>{
  for(const [k,v] of Object.entries({src:4,dst:10,phase:3,width:1,spacing:5,mode:'pulse'})) $(`cdc-${k}`).value=v;
  paintCDC();
});
$('cdc-fast').addEventListener('click',()=>{
  for(const [k,v] of Object.entries({src:2,dst:12,phase:1,width:1,spacing:1,mode:'toggle'})) $(`cdc-${k}`).value=v;
  paintCDC();
});
function paintBudget() {
  const r=M.agentBudget({rounds:Number($('budget-rounds').value),licenseBudget:Number($('budget-hours').value),workers:Number($('budget-workers').value),retrieval:$('budget-retrieval').checked,checker:$('budget-checker').checked});
  for(const k of ['rounds','hours','workers']) $(`budget-${k}-value`).textContent=$(`budget-${k}`).value;
  $('budget-result').textContent=`${r.bugs}/4 validated seeded bugs; ${r.supported}/8 supported outcomes; ${r.abstentions} abstentions. These outcomes follow the disclosed recipes, not measured AI accuracy.`;
  $('budget-metrics').replaceChildren();
  const metrics=[['License-hours charged',r.license.toFixed(2)],['Synthetic model cost',`$${r.cost.toFixed(2)}`],['Ideal makespan',`${r.makespan} min`],['Synthetic review',`${r.reviewMinutes} min`],['Reproducers',r.reproducers],['Model rounds',r.calls]];
  metrics.forEach(([name,value])=>{const cell=document.createElement('div');const label=document.createElement('span');label.textContent=name;const strong=document.createElement('strong');strong.textContent=value;cell.append(label,strong);$('budget-metrics').append(cell);});
  $('budget-cases').replaceChildren();
  r.results.forEach(item=>{const row=document.createElement('tr');
    [`${item.id} / ${item.kind}`,item.rounds,item.license.toFixed(2),[item.spec?'spec':'',item.check?'checker':''].filter(Boolean).join(' + ')||'run metadata',item.done,item.supported?`SUPPORTED ${item.kind}`:'ABSTAIN'].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell);});
    $('budget-cases').append(row);
  });
}
['rounds','hours','workers','retrieval','checker'].forEach(k=>$(`budget-${k}`).addEventListener('input',paintBudget));
paintHidden(); paintCDC(); paintBudget();
