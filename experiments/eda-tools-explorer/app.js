'use strict';
const map = document.querySelector('#stage-map');
const stage = document.querySelector('#stage');
const license = document.querySelector('#license');
const free = document.querySelector('#free');
const cards = document.querySelector('#cards');
const count = document.querySelector('#count');
const empty = document.querySelector('#empty');
for (const [id, name, description] of stages) {
  const option = document.createElement('option'); option.value = id; option.textContent = name; stage.append(option);
  const button = document.createElement('button'); button.type = 'button'; button.dataset.stage = id; button.setAttribute('aria-pressed', 'false');
  const title = document.createElement('strong'); title.textContent = name;
  const detail = document.createElement('span'); detail.textContent = description; button.append(title, detail);
  button.addEventListener('click', () => { stage.value = stage.value === id ? 'all' : id; render(); document.querySelector('#catalog').scrollIntoView(); }); map.append(button);
}
function render() {
  const filtered = tools.filter(t => (stage.value === 'all' || t[1].includes(stage.value)) && (license.value === 'all' || t[2] === license.value) && (!free.checked || t[3]));
  map.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.stage === stage.value)));
  cards.replaceChildren();
  for (const [name, ids, model, hasFree, description, users, workflow, pain, source] of filtered) {
    const article = document.createElement('article'); article.className = 'card';
    const tag = document.createElement('p'); tag.className = 'card-tag'; tag.textContent = ids.map(id => stages.find(s => s[0] === id)[1]).join(' / ');
    const title = document.createElement('h3'); title.textContent = name;
    const summary = document.createElement('p'); summary.className = 'card-summary'; summary.textContent = description;
    const badge = document.createElement('p'); badge.className = 'badge'; badge.textContent = model === 'open' ? 'OPEN SOURCE / OPEN RESOURCE' : hasFree ? 'COMMERCIAL / FREE OFFERING' : 'COMMERCIAL LICENSE';
    const list = document.createElement('dl');
    for (const [label, value] of [['Who uses it', users], ['In the workflow', workflow], ['Common friction', pain]]) { const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = value; list.append(dt, dd); }
    const link = document.createElement('a'); link.href = source; link.textContent = 'Source & documentation ↗';
    article.append(tag, title, summary, badge, list, link); cards.append(article);
  }
  count.textContent = `Showing ${filtered.length} of ${tools.length} tools and resources`;
  empty.hidden = filtered.length !== 0;
}
stage.addEventListener('change', render); license.addEventListener('change', render); free.addEventListener('change', render);
document.querySelector('#reset').addEventListener('click', () => { stage.value = 'all'; license.value = 'all'; free.checked = false; render(); });
render();
