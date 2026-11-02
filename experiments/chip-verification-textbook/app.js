/* All interactions are local. No persistence, telemetry, or network requests. */
'use strict';
const $ = id => document.getElementById(id);
const M = window.ChipModels;
let fifo = new M.FIFO(4), hits = new Set(), history = [], hypothetical = false;
const sections = [...document.querySelectorAll('.chapter')];
const navLinks = [...document.querySelectorAll('nav a')];
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
// Deep links always reveal their target, including when a previous search hid it.
function revealHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (target && target.hidden) { $('search').value = ''; search(); target.scrollIntoView(); }
}
window.addEventListener('hashchange', revealHash);
const routes = {
  quick: {text: '45 minutes: chapters 1 → 3 → 4 + FIFO lab → 12 → 16; drills 1–5.', ids: [1,3,4,12,16,17]},
  study: {text: '3 hours: chapters 1–8 (90m), 9–12 (30m), 13–16 (20m), drills 6–15 (20m).', ids: Array.from({length:17}, (_,i)=>i+1)},
  deep: {text: 'Deep route: all chapters, all labs, 25 drills, and the five portfolio milestones in chapter 15.', ids: Array.from({length:18}, (_,i)=>i+1)}
};
document.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', () => {
  $('search').value = ''; search();
  const route = routes[link.dataset.route];
  $('route-status').textContent = route.text;
  sections.forEach(s => s.classList.toggle('on-route', route.ids.some(id => s.id === `chapter-${id}`)));
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('selected', a === link));
}));
$('print').addEventListener('click', () => window.print());
let closedBeforePrint = [];
window.addEventListener('beforeprint', () => {
  closedBeforePrint = [...document.querySelectorAll('details:not([open])')];
  closedBeforePrint.forEach(d => { d.open = true; });
});
window.addEventListener('afterprint', () => closedBeforePrint.forEach(d => { d.open = false; }));
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
