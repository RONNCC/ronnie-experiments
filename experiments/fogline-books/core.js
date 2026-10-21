/* Fogline Books — shared core: formatting, meters, predict cards, story tracker, live meters */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function money(n, opts) {
    const neg = n < 0;
    const v = Math.abs(n);
    const s = v.toLocaleString('en-US', { minimumFractionDigits: (opts && opts.cents) ? 2 : 0, maximumFractionDigits: (opts && opts.cents) ? 2 : 0 });
    return (neg ? '−$' : '$') + s;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function setMeter(el, state, html) {
    // state: 'ok' | 'bad' | 'warn' | '' (neutral)
    el.classList.remove('ok', 'bad', 'warn');
    if (state) el.classList.add(state);
    const p = el.querySelector('p');
    if (html !== undefined) {
      const b = p.querySelector('b');
      p.innerHTML = '';
      if (b) p.appendChild(b);
      const span = document.createElement('span');
      span.innerHTML = html;
      p.appendChild(span);
    }
  }

  function journalTable(entries, opts) {
    // entries: [{memo, date, lines:[{account, type, debit, credit}]}]
    if (!entries.length) return '<p class="hint">No entries yet.</p>';
    let h = '';
    entries.forEach(e => {
      let td = 0, tc = 0;
      h += '<table class="journal"><thead><tr><th>' + esc(e.memo || 'Journal entry') + (e.date ? ' · ' + esc(e.date) : '') + '</th><th style="text-align:right">Debit</th><th style="text-align:right">Credit</th></tr></thead><tbody>';
      e.lines.forEach(l => {
        td += l.debit || 0; tc += l.credit || 0;
        const cls = (l.debit > 0) ? 'debit' : 'credit';
        h += '<tr class="' + cls + '"><td class="acct">' + esc(l.account) + (l.tag ? '<span class="acct-tag">' + esc(l.tag) + '</span>' : '') + '</td><td class="num">' + (l.debit ? money(l.debit) : '') + '</td><td class="num">' + (l.credit ? money(l.credit) : '') + '</td></tr>';
      });
      h += '<tr class="total"><td class="acct">Totals</td><td class="num">' + money(td) + '</td><td class="num">' + money(tc) + '</td></tr></tbody></table>';
    });
    return h;
  }

  function flashDemo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  /* ---- predict cards (generic) ---- */
  function initPredictCards() {
    $$('.predict-card[data-correct]').forEach(card => {
      const correct = card.getAttribute('data-correct');
      const reveal = card.querySelector('.predict-reveal');
      const verdict = card.querySelector('.verdict');
      const btns = $$('.predict-options button', card);
      btns.forEach(b => b.addEventListener('click', () => {
        const choice = b.getAttribute('data-choice');
        btns.forEach(x => x.disabled = true);
        if (choice === correct) {
          b.classList.add('picked-correct');
          verdict.textContent = '✓ Correct.';
          verdict.className = 'verdict good';
        } else {
          b.classList.add('picked-wrong');
          const right = btns.find(x => x.getAttribute('data-choice') === correct);
          if (right) right.classList.add('picked-correct');
          verdict.textContent = 'Not quite — the highlighted answer is correct.';
          verdict.className = 'verdict meh';
        }
        reveal.hidden = false;
      }));
    });
  }

  /* ---- live company meters (mirrors demo 1) ---- */
  const live = { cash: 0, rev: 0, profit: 0, ar: 0, def: 0 };
  function setLive(next) {
    Object.assign(live, next);
    paintLive();
  }
  function paintLive() {
    const map = { cash: 'lm-cash', rev: 'lm-rev', profit: 'lm-profit', ar: 'lm-ar', def: 'lm-def' };
    Object.keys(map).forEach(k => {
      const box = document.getElementById(map[k]);
      if (!box) return;
      const val = box.querySelector('p:last-child');
      val.textContent = money(live[k]);
      box.classList.remove('up', 'down', 'flat');
      box.classList.add(live[k] > 0 ? 'up' : (live[k] < 0 ? 'down' : 'flat'));
    });
  }

  /* ---- guided story checklist ---- */
  const STEPS = [
    { t: 'Fund the company', d: 'Post the founder investment in Demo 1.', demo: 'demo-1' },
    { t: 'Import & categorize a hosting expense', d: 'Link 3 records to 1 event (Demo 3), then classify with context (Demo 4).', demo: 'demo-3' },
    { t: 'Detect a duplicate', d: 'Import the CSV twice and watch dedupe hold at 1 event (Demo 3).', demo: 'demo-3' },
    { t: 'Issue & collect an annual subscription invoice', d: 'Run the $3,000 invoice lifecycle (Demo 7).', demo: 'demo-7' },
    { t: 'Recognize one month of revenue', d: 'Slide to end of January on the $12,000 contract (Demo 6).', demo: 'demo-6' },
    { t: 'Match a net processor payout', d: '$970 = $1,000 − $30 fee (Demo 8).', demo: 'demo-8' },
    { t: 'Reconcile the bank account', d: 'Reach $4,975 on both sides (Demo 5).', demo: 'demo-5' },
    { t: 'Inspect the financial statements', d: 'Toggle moves and drill into the numbers (Demo 10).', demo: 'demo-10' },
    { t: 'Add a subsidiary, eliminate an internal loan', d: 'Consolidate the $5,000 loan (Demo 11).', demo: 'demo-11' },
    { t: 'Let an agent prepare changes', d: 'Approve and execute the reclassification proposal (Demo 13).', demo: 'demo-13' },
    { t: 'Survive a retry + an authorization failure', d: 'Timeout then safe retry (Demo 14); revoked permission blocks execution (Demo 13).', demo: 'demo-14' },
    { t: 'Review exceptions & close the month', d: 'Finish the checklist, sign off, lock January (Demo 12).', demo: 'demo-12' },
  ];
  function initStory() {
    const list = $('#story-list');
    if (!list) return;
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('fogline-story') || '[]'); } catch (e) { saved = []; }
    STEPS.forEach((s, i) => {
      const li = document.createElement('li');
      if (saved[i]) li.classList.add('done');
      li.innerHTML = '<input type="checkbox" ' + (saved[i] ? 'checked' : '') + ' aria-label="Mark step ' + (i + 1) + ' complete">' +
        '<div><a href="#' + s.demo + '" data-goto="' + s.demo + '">' + esc(s.t) + '</a><br><span style="color:var(--text-muted);font-size:.83rem">' + esc(s.d) + '</span></div>';
      const box = li.querySelector('input');
      box.addEventListener('change', () => {
        li.classList.toggle('done', box.checked);
        saved[i] = box.checked;
        try { localStorage.setItem('fogline-story', JSON.stringify(saved)); } catch (e) {}
        paintStory();
      });
      li.querySelector('a').addEventListener('click', ev => {
        ev.preventDefault();
        flashDemo(s.demo);
      });
      list.appendChild(li);
    });
    paintStory();
    function paintStory() {
      const n = $$('#story-list li.done').length;
      $('#story-bar').style.width = (100 * n / STEPS.length) + '%';
    }
  }

  /* ---- smooth anchor offset for chapter nav ---- */
  function initNav() {
    $$('.chapter-nav a').forEach(a => {
      a.addEventListener('click', ev => {
        const id = a.getAttribute('href');
        if (!id || !id.startsWith('#')) return;
        ev.preventDefault();
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPredictCards();
    initStory();
    initNav();
    paintLive();
  });

  window.Fogline = { $, $$, money, esc, setMeter, journalTable, flashDemo, setLive, live };
})();
