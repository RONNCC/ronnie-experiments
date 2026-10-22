/* Fogline Books — Demos 1–5 */
(function () {
  'use strict';
  const { $, $$, money, esc, setMeter, journalTable, setLive } = window.Fogline;

  document.addEventListener('DOMContentLoaded', () => {
    initDemo1(); initDemo2(); initDemo3(); initDemo4(); initDemo5();
  });

  /* ================= DEMO 1 ================= */
  function initDemo1() {
    const ACCOUNTS = [
      { id: 'checking', name: 'Checking cash', type: 'asset' },
      { id: 'savings', name: 'Savings cash', type: 'asset' },
      { id: 'equity', name: 'Owner equity', type: 'equity' },
      { id: 'loan', name: 'Loan payable', type: 'liability' },
      { id: 'hosting', name: 'Hosting expense', type: 'expense' },
      { id: 'revenue', name: 'Subscription revenue', type: 'revenue' },
    ];
    const EVENTS = [
      { id: 'invest', label: '💰 Founder invests $20,000', desc: 'The founder wires $20,000 into the business. Cash arrives — but is it revenue?', amount: 20000,
        expect: { debit: ['checking', 'savings'], credit: ['equity'] }, lesson: 'Cash received is not necessarily revenue — this one creates equity, not income.' },
      { id: 'loan', label: '🏦 Borrow $10,000', desc: 'The bank lends Fogline $10,000. Try it right — then try crediting Revenue on purpose.', amount: 10000,
        expect: { debit: ['checking', 'savings'], credit: ['loan'] }, lesson: 'Cash can rise without profit rising: asset up, liability up, income untouched.' },
      { id: 'hosting', label: '🖥️ Pay $300 hosting', desc: "Pay this month's hosting bill from checking.", amount: 300,
        expect: { debit: ['hosting'], credit: ['checking', 'savings'] }, lesson: 'An operating expense reduces both cash and profit.' },
      { id: 'transfer', label: '🔀 Move $2,000 checking → savings', desc: 'Sweep $2,000 between company bank accounts. Expense? Revenue? Neither?', amount: 2000,
        expect: { debit: ['savings'], credit: ['checking'] }, lesson: 'Moving money between your own accounts is neither expense nor revenue.' },
    ];
    let current = EVENTS[0];
    let entries = [];
    let balances = {};
    ACCOUNTS.forEach(a => balances[a.id] = 0);

    const tabsEl = $('#d1-events'), descEl = $('#d1-event-desc');
    const dAcct = $('#d1-debit-acct'), cAcct = $('#d1-credit-acct');
    const dAmt = $('#d1-debit-amt'), cAmt = $('#d1-credit-amt');

    function fillSelect(sel) {
      sel.innerHTML = ACCOUNTS.map(a => '<option value="' + a.id + '">' + esc(a.name) + ' · ' + a.type + '</option>').join('');
    }
    fillSelect(dAcct); fillSelect(cAcct);

    EVENTS.forEach((e, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'event-tab' + (i === 0 ? ' is-active' : '');
      b.textContent = e.label;
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => {
        $$('#d1-events .event-tab').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        current = e;
        dAmt.value = e.amount; cAmt.value = e.amount;
        descEl.textContent = e.desc;
        setMeter($('#d1-m-balance'), '', 'Pick accounts and post.');
        setMeter($('#d1-m-correct'), '', 'A balanced entry can still be economically wrong.');
      });
      tabsEl.appendChild(b);
    });
    dAmt.value = current.amount; cAmt.value = current.amount;
    descEl.textContent = current.desc;

    function acctName(id) { const a = ACCOUNTS.find(x => x.id === id); return a ? a.name : id; }
    function acctType(id) { const a = ACCOUNTS.find(x => x.id === id); return a ? a.type : ''; }

    $('#d1-post').addEventListener('click', () => {
      const da = dAcct.value, ca = cAcct.value;
      const dv = Math.max(0, Number(dAmt.value) || 0), cv = Math.max(0, Number(cAmt.value) || 0);
      const balanced = dv === cv && dv > 0;
      if (!balanced) {
        setMeter($('#d1-m-balance'), 'bad', 'Debits ' + money(dv) + ' ≠ credits ' + money(cv) + '. The ledger refuses to post — fix the amounts.');
        setMeter($('#d1-m-correct'), '', 'Unbalanced entries never reach the books.');
        return;
      }
      setMeter($('#d1-m-balance'), 'ok', 'Debits ' + money(dv) + ' = credits ' + money(cv) + '. The arithmetic checks out.');
      const debitOk = current.expect.debit.includes(da);
      const creditOk = current.expect.credit.includes(ca);
      const amtOk = dv === current.amount;
      if (debitOk && creditOk && amtOk) {
        setMeter($('#d1-m-correct'), 'ok', '✓ Correct: ' + esc(current.lesson));
        postEntry(da, ca, dv);
      } else {
        let why = '';
        if (current.id === 'loan' && ca === 'revenue') {
          why = 'The loan was recorded as <b>revenue</b>. The entry balances — and profit is now overstated by $10,000. This is the red meter that matters: <b>balanced ≠ correct</b>. (' + esc(current.lesson) + ')';
        } else if (current.id === 'transfer' && da === 'checking' && ca === 'savings') {
          why = 'Backwards: that entry moves money <b>savings → checking</b>. Direction is meaning in double-entry.';
        } else if (!amtOk) {
          why = 'Accounts look plausible, but the event was <b>' + money(current.amount) + '</b> and you posted ' + money(dv) + '. Amounts are evidence too.';
        } else {
          why = 'Not quite. <b>' + esc(current.lesson) + '</b> Debit should be ' + current.expect.debit.map(acctName).join(' or ') + '; credit should be ' + current.expect.credit.map(acctName).join(' or ') + '.';
        }
        setMeter($('#d1-m-correct'), 'bad', why + ' <em>Entry rejected — nothing posted.</em>');
      }
    });

    function postEntry(da, ca, amt) {
      entries.push({ memo: current.label.replace(/^[^\s]+\s/, ''), date: 'Jan', lines: [
        { account: acctName(da), tag: acctType(da), debit: amt, credit: 0 },
        { account: acctName(ca), tag: acctType(ca), debit: 0, credit: amt },
      ] });
      bump(da, amt, 'debit'); bump(ca, amt, 'credit');
      render();
    }
    function bump(id, amt, side) {
      const type = acctType(id);
      const normalDebit = (type === 'asset' || type === 'expense');
      const up = (side === 'debit') === normalDebit;
      balances[id] += up ? amt : -amt;
    }
    function render() {
      $('#d1-journal').innerHTML = journalTable(entries);
      let h = '<table class="plain"><tr><th>Account</th><th style="text-align:right">Balance</th></tr>';
      ACCOUNTS.forEach(a => { h += '<tr><td>' + esc(a.name) + '<span class="acct-tag">' + a.type + '</span></td><td class="num">' + money(balances[a.id]) + '</td></tr>'; });
      $('#d1-balances').innerHTML = h + '</table>';
      const cash = balances.checking + balances.savings;
      const rev = balances.revenue, exp = balances.hosting;
      setLive({ cash, rev, profit: rev - exp, ar: 0, def: 0 });
    }
    $('#d1-reset').addEventListener('click', () => {
      entries = []; ACCOUNTS.forEach(a => balances[a.id] = 0);
      render();
      setMeter($('#d1-m-balance'), '', 'Pick accounts and post.');
      setMeter($('#d1-m-correct'), '', 'A balanced entry can still be economically wrong.');
      $('#d1-journal').innerHTML = '<p class="hint">No entries yet.</p>';
      $('#d1-balances').innerHTML = '<p class="hint">Post entries to build balances.</p>';
    });
  }

  /* ================= DEMO 2 ================= */
  function initDemo2() {
    let accounts = [
      { id: 'acct_cash', name: 'Checking cash', type: 'asset', role: 'operating_cash' },
      { id: 'acct_save', name: 'Savings cash', type: 'asset', role: 'savings_cash' },
      { id: 'acct_ar', name: 'Accounts receivable', type: 'asset', role: 'receivables' },
      { id: 'acct_host', name: 'Hosting expense', type: 'expense', role: 'hosting' },
      { id: 'acct_host2', name: 'Hosting (duplicate)', type: 'expense', role: 'hosting' },
      { id: 'acct_sw', name: 'Software subscriptions', type: 'expense', role: 'software' },
      { id: 'acct_rev', name: 'Subscription revenue', type: 'revenue', role: 'subscription_revenue' },
      { id: 'acct_loan', name: 'Loan payable', type: 'liability', role: 'debt' },
    ];
    let classes = ['Engineering'];
    const byId = id => accounts.find(a => a.id === id);

    function renderAccounts() {
      let h = '<table class="plain"><tr><th>ID</th><th>Name</th><th>Type</th><th>Role</th></tr>';
      accounts.forEach(a => {
        h += '<tr><td style="font-family:var(--mono);font-size:.76rem">' + esc(a.id) + '</td><td><b>' + esc(a.name) + '</b></td><td><span class="badge blue">' + a.type + '</span></td><td style="font-family:var(--mono);font-size:.76rem;color:var(--teal)">' + esc(a.role) + '</td></tr>';
      });
      $('#d2-accounts').innerHTML = h + '</table>';
      const opts = accounts.map(a => '<option value="' + a.id + '">' + esc(a.name) + ' (' + a.type + ')</option>').join('');
      $('#d2-merge-a').innerHTML = opts; $('#d2-merge-b').innerHTML = opts;
      if (byId('acct_host')) $('#d2-merge-a').value = 'acct_host';
      if (byId('acct_host2')) $('#d2-merge-b').value = 'acct_host2';
    }
    function renderClasses() {
      $('#d2-classes').innerHTML = classes.map(c =>
        '<button type="button" class="seg-btn' + (c === $('#d2-class-tag').textContent ? ' is-active' : '') + '" data-cls="' + esc(c) + '">' + esc(c) + '</button>'
      ).join(' ');
      $$('#d2-classes [data-cls]').forEach(b => b.addEventListener('click', () => {
        $('#d2-class-tag').textContent = b.getAttribute('data-cls');
        renderClasses();
      }));
    }
    renderAccounts(); renderClasses();

    $('#d2-rename-btn').addEventListener('click', () => {
      const acct = byId('acct_sw');
      if (!acct) {
        $('#d2-auto-out').innerHTML = '<div class="callout gold"><strong>Nothing to rename.</strong> “Software subscriptions” (<code>acct_sw</code>) was merged away earlier — the surviving account carries its entries, and retired IDs are never reused.</div>';
        return;
      }
      const v = $('#d2-rename').value.trim() || 'Tools';
      acct.name = v;
      renderAccounts();
      $('#d2-auto-out').innerHTML = '<div class="callout"><strong>Renamed.</strong> <code>acct_sw</code> now displays as “' + esc(v) + '” — ID and role <code>software</code> untouched. Run the automation to verify.</div>';
    });
    $('#d2-auto').addEventListener('click', () => {
      const byRole = r => accounts.find(a => a.role === r);
      const host = byRole('hosting'), sw = byRole('software');
      if (!host || !sw) {
        $('#d2-auto-out').innerHTML = '<div class="callout gold"><strong>Automation stalled.</strong> A merge retired the account behind the <code>' + (!host ? 'hosting' : 'software') + '</code> role, so there is nothing to route to. Remap the role to a surviving account before re-running — roles are stable, but they still need a live account behind them.</div>';
        return;
      }
      $('#d2-auto-out').innerHTML = '<div class="callout green"><strong>Automation ran on roles, not labels.</strong><br>“ACME CLOUD $300” → <code>' + host.id + '</code> (role <code>hosting</code>, shown as “' + esc(host.name) + '”).<br>“Fogline seats $49” → <code>' + sw.id + '</code> (role <code>software</code>, shown as “' + esc(sw.name) + '”).<br>Renames never break routing.</div>';
    });
    $('#d2-class-btn').addEventListener('click', () => {
      const v = $('#d2-class-input').value.trim();
      if (!v) return;
      if (!classes.includes(v)) classes.push(v);
      $('#d2-class-input').value = '';
      renderClasses();
    });
    $('#d2-merge-btn').addEventListener('click', () => {
      const a = byId($('#d2-merge-a').value), b = byId($('#d2-merge-b').value);
      if (!a || !b || a.id === b.id) {
        $('#d2-merge-out').innerHTML = '<div class="callout gold">Pick two <b>different</b> accounts.</div>';
        return;
      }
      if (a.type !== b.type) {
        $('#d2-merge-out').innerHTML = '<div class="callout red"><strong>⛔ Merge blocked.</strong> Cannot merge a <b>' + b.type + '</b> account (“' + esc(b.name) + '”) into a <b>' + a.type + '</b> account (“' + esc(a.name) + '”). Merging ' +
          (a.type === 'revenue' || b.type === 'revenue' ? 'bank balances into revenue would fabricate income and corrupt every report, tax filing, and automation rule downstream.' : 'across types would corrupt balances, reports, and automation roles.') + ' Type compatibility is enforced before any entries are repointed.</div>';
        return;
      }
      accounts = accounts.filter(x => x.id !== b.id);
      renderAccounts();
      $('#d2-merge-out').innerHTML = '<div class="callout green"><strong>✓ Merged.</strong> “' + esc(b.name) + '” absorbed into “' + esc(a.name) + '”. ' + (3 + Math.floor(Math.random() * 5)) + ' historical entries repointed to <code>' + a.id + '</code>; <code>' + b.id + '</code> retired (never reused).</div>';
    });
    $('#d2-template').addEventListener('click', () => {
      const tpl = { acct_cash: 'Operating Checking', acct_save: 'Savings Reserve', acct_ar: 'Trade Receivables', acct_host: 'Cloud Hosting', acct_sw: 'SaaS & Software', acct_rev: 'Subscription Revenue', acct_loan: 'Bank Loan' };
      accounts.forEach(a => { if (tpl[a.id]) a.name = tpl[a.id]; });
      renderAccounts();
      $('#d2-template-out').innerHTML = '<div class="callout green"><strong>✓ Template applied.</strong> Display names standardized — every <code>id</code> and <code>role</code> unchanged, so rules, reports, and the API keep working.</div>';
    });
  }

  /* ================= DEMO 3 ================= */
  function initDemo3() {
    const SOURCES = [
      { id: 'card', title: '💳 Corporate-card feed', badge: 'feed', raw: 'ACME CLOUD           $300.00\n01/14 · settled · ref cc_99120', norm: '<b>Acme Cloud</b> · $300.00 · 01/14' },
      { id: 'receipt', title: '🧾 Uploaded receipt', badge: 'scan', raw: 'Acme Cloud — January hosting\nHosting, 1 mo ........ $300.00\nOCR confidence 0.98', norm: '<b>Acme Cloud</b> · $300.00 · January hosting' },
      { id: 'csv', title: '📄 CSV export', badge: 'import', raw: '2026-01-14,ACME*CLD,300.00\nbatch imp_2201, row 17', norm: '<b>Acme Cloud</b> · $300.00 · 01/14' },
    ];
    let selected = new Set(['card', 'receipt', 'csv']);
    let expenseEvents = 0, reversals = 0, extraCards = [];
    let trail = [];

    function render() {
      const all = SOURCES.concat(extraCards);
      $('#d3-sources').innerHTML = all.map(s =>
        '<div class="source-card"><h5><input type="checkbox" data-src="' + s.id + '" ' + (selected.has(s.id) ? 'checked' : '') + ' style="width:16px;height:16px;accent-color:var(--green)"> ' + esc(s.title) + ' <span class="badge">' + esc(s.badge) + '</span></h5>' +
        '<div class="raw">' + esc(s.raw) + '</div><p class="norm">Normalized → ' + s.norm + '</p></div>'
      ).join('');
      $$('#d3-sources [data-src]').forEach(c => c.addEventListener('change', () => {
        if (c.checked) selected.add(c.getAttribute('data-src')); else selected.delete(c.getAttribute('data-src'));
      }));
    }
    function paintTrail() {
      $('#d3-trail').innerHTML = trail.length ? trail.join('<br>') : 'provenance trail: (empty — link records to begin)';
    }
    function paintMeters() {
      const m1 = $('#d3-m-events'), m2 = $('#d3-m-prov');
      if (expenseEvents === 0) { setMeter(m1, '', 'Goal: exactly 1 event from 3 records.'); }
      else if (expenseEvents === 1) { setMeter(m1, 'ok', '<b>' + expenseEvents + ' expense event' + (reversals ? ' + ' + reversals + ' linked reversal' : '') + '.</b> N records → 1 event. ' + (reversals ? 'Net expense $0, history preserved.' : '')); }
      else { setMeter(m1, 'bad', '<b>' + expenseEvents + ' expense events!</b> Over-counted — duplicates leaked through.'); }
      if (trail.length) setMeter(m2, 'ok', '<b>' + trail.length + ' trail entries.</b> Every event cites its sources.');
    }
    render(); paintTrail(); paintMeters();

    $('#d3-link').addEventListener('click', () => {
      if (!selected.size) { trail.push('<span class="warn">link: no records selected — nothing to do</span>'); paintTrail(); return; }
      const ids = Array.from(selected).join(', ');
      if (expenseEvents === 0) {
        expenseEvents = 1;
        trail.push('<span class="ok">evt_exp_001 created</span> ← [' + esc(ids) + '] · merchant=Acme Cloud · amount=$300.00 · dedupe_key=acme|300.00|0114');
      } else {
        trail.push('<span class="ok">[' + esc(ids) + '] attached as further evidence</span> to evt_exp_001 · still 1 event (no double-count)');
      }
      paintTrail(); paintMeters();
    });
    $('#d3-f-dup').addEventListener('click', () => {
      if (!extraCards.find(c => c.id === 'csv2')) {
        extraCards.push({ id: 'csv2', title: '📄 CSV export (re-import!)', badge: 'import', raw: '2026-01-14,ACME*CLD,300.00\nbatch imp_2207, row 3  ← same row, new batch', norm: '<b>Acme Cloud</b> · $300.00 · 01/14' });
        render();
      }
      trail.push(expenseEvents
        ? '<span class="warn">dedupe: csv row matches key acme|300.00|0114</span> → flagged DUPLICATE of evt_exp_001 · suppressed, operator notified'
        : '<span class="warn">dedupe: csv row matches key acme|300.00|0114</span> → held as duplicate candidate · link records first to attach it to evt_exp_001');
      paintTrail(); paintMeters();
    });
    $('#d3-f-pending').addEventListener('click', () => {
      trail.push('feed: <span class="warn">PENDING</span> “ACME CLOUD $300” → held, not posted (pending ≠ expense)');
      trail.push('feed: <span class="ok">SETTLED</span> cc_99120 → matched to pending, posted once' + (expenseEvents ? ' as evidence for evt_exp_001' : ' as evt_exp_001 (created)'));
      if (expenseEvents === 0) { expenseEvents = 1; }
      paintTrail(); paintMeters();
    });
    $('#d3-f-misread').addEventListener('click', () => {
      trail.push('<span class="bad">AMOUNT MISMATCH:</span> scan reads $3,000 vs feed $300 (10×) → quarantined for review, NOT posted · confidence 0.41 below floor');
      paintTrail(); paintMeters();
    });
    $('#d3-f-refund').addEventListener('click', () => {
      reversals++;
      if (expenseEvents === 0) expenseEvents = 1;
      trail.push('<span class="ok">evt_rev_001 (reversal) linked</span> ← refund $300.00 · original evt_exp_001 untouched · net expense $0, full history kept');
      paintTrail(); paintMeters();
    });
    $('#d3-reset').addEventListener('click', () => {
      selected = new Set(['card', 'receipt', 'csv']); expenseEvents = 0; reversals = 0; extraCards = []; trail = [];
      render(); paintTrail(); paintMeters();
    });
  }

  /* ================= DEMO 4 ================= */
  function initDemo4() {
    const OPTS = ['Office supplies', 'Computer equipment', 'Software expense', 'Owner draw (personal)', 'Refund (contra-expense)'];
    const TXNS = [
      { id: 't1', amt: 1299.00, truth: 'Computer equipment', receipt: '💻 MacBook Pro 14” — engineering laptop (business asset, multi-year life)' },
      { id: 't2', amt: 86.40, truth: 'Owner draw (personal)', receipt: '🐶 Dog food + birthday card — founder’s personal card use, must NOT hit expenses' },
      { id: 't3', amt: 42.10, truth: 'Office supplies', receipt: '🖊️ Pens, paper, one toner cartridge — ordinary office supplies' },
      { id: 't4', amt: -42.10, truth: 'Refund (contra-expense)', receipt: '↩️ Return processed: toner cartridge — vendor refund, reverses prior supplies' },
    ];
    let phase = 'name';
    let picks = { t1: 'Office supplies', t2: 'Office supplies', t3: 'Office supplies', t4: 'Office supplies' };
    let scoreByPhase = {};

    function render() {
      $('#d4-txns').innerHTML = TXNS.map(t =>
        '<div class="subpanel"><h4>🧾 Northwind Supply · <span class="num">' + money(t.amt, { cents: true }) + '</span></h4>' +
        (phase === 'receipt' ? '<div class="callout" style="margin:.4rem 0"><strong>Receipt:</strong> ' + esc(t.receipt) + '</div>' : '<p class="hint">Receipt hidden — classify from the merchant name alone.</p>') +
        '<label class="field-label" for="d4-' + t.id + '">Classify as</label><select id="d4-' + t.id + '" data-txn="' + t.id + '">' +
        OPTS.map(o => '<option' + (picks[t.id] === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>' +
        '<div id="d4-mark-' + t.id + '" style="margin-top:.4rem"></div></div>'
      ).join('');
      $$('#d4-txns [data-txn]').forEach(s => s.addEventListener('change', () => { picks[s.getAttribute('data-txn')] = s.value; }));
      const conf = phase === 'receipt';
      $('#d4-prop-ev').textContent = conf ? 'Receipt line items (“annual license”, “per-seat SaaS”)' : 'Merchant prior only (no receipt yet)';
      $('#d4-prop-conf').textContent = 'illustrative model score: ' + (conf ? '0.97' : '0.92');
    }
    render();
    $('#d4-phase-name').addEventListener('click', () => {
      phase = 'name';
      $('#d4-phase-name').classList.add('is-active'); $('#d4-phase-receipt').classList.remove('is-active');
      render();
    });
    $('#d4-phase-receipt').addEventListener('click', () => {
      phase = 'receipt';
      $('#d4-phase-receipt').classList.add('is-active'); $('#d4-phase-name').classList.remove('is-active');
      render();
    });
    $('#d4-grade').addEventListener('click', () => {
      let right = 0;
      TXNS.forEach(t => {
        const ok = picks[t.id] === t.truth;
        if (ok) right++;
        $('#d4-mark-' + t.id).innerHTML = ok ? '<span class="badge green">✓ correct</span>' : '<span class="badge red">✗ should be: ' + esc(t.truth) + '</span>';
      });
      scoreByPhase[phase] = right;
      let extra = '';
      if (scoreByPhase.name !== undefined && scoreByPhase.receipt !== undefined) {
        extra = ' Merchant-only: <b>' + scoreByPhase.name + '/4</b> → with receipts: <b>' + scoreByPhase.receipt + '/4</b>. That gap is the value of context.';
      }
      $('#d4-grade-out').innerHTML = '<div class="callout ' + (right === 4 ? 'green' : 'gold') + '"><strong>' + right + ' / 4 correct</strong> (' + (phase === 'name' ? 'merchant name only' : 'with receipts') + ').' + extra + '</div>';
    });
    $('#d4-act-auto').addEventListener('click', () => {
      $('#d4-act-out').innerHTML = '<div class="callout red"><strong>Auto-applied on a merchant prior.</strong> If this was the laptop, the dog food, or the refund, the books are now wrong at 0.92 “confidence”. Evidence-poor auto-apply is how small errors compound.</div>';
    });
    $('#d4-act-ask').addEventListener('click', () => {
      $('#d4-act-out').innerHTML = '<div class="callout"><strong>Asked for the receipt.</strong> The system abstains until line-item evidence arrives — cheap to request, expensive to guess.</div>';
    });
    $('#d4-act-review').addEventListener('click', () => {
      $('#d4-act-out').innerHTML = '<div class="callout green"><strong>Queued for human review</strong> with merchant prior + uncertainty flag. Correct call when evidence is thin and the amount is material.</div>';
    });
    let rules = [];
    function renderRules(conflict) {
      let h = rules.length ? '<table class="plain"><tr><th>#</th><th>Rule</th></tr>' + rules.map((r, i) => '<tr><td>' + (i + 1) + '</td><td>' + esc(r) + '</td></tr>').join('') + '</table>' : '<p class="hint">No rules yet.</p>';
      if (conflict) h += '<div class="callout red" style="margin-top:.5rem"><strong>⚠️ Rule conflict.</strong> Two rules match “Northwind Supply $49 subscription, receipt shows hardware”. Resolve precedence:<div class="btn-row" style="margin:.5rem 0 0"><button class="btn btn-sm btn-green" id="d4-res-cond" type="button">Prefer conditional rule</button><button class="btn btn-sm" id="d4-res-always" type="button">Prefer always-rule</button></div></div>';
      $('#d4-rules').innerHTML = h;
      const rc = $('#d4-res-cond'), ra = $('#d4-res-always');
      if (rc) rc.addEventListener('click', () => { renderRules(false); $('#d4-rules').innerHTML += '<div class="callout green"><strong>Resolved:</strong> conditional rule wins (specificity precedence). The hardware receipt routes to Computer equipment. Precedence recorded in the rule registry.</div>'; });
      if (ra) ra.addEventListener('click', () => { renderRules(false); $('#d4-rules').innerHTML += '<div class="callout gold"><strong>Resolved:</strong> always-rule wins (recency precedence) — but the hardware receipt is now <b>overridden</b>. Flagged for monthly review: blanket rules that defeat evidence are a smell.</div>'; });
    }
    renderRules(false);
    $('#d4-rule-add').addEventListener('click', () => {
      const v = $('#d4-rule-vendor').value.trim() || 'Northwind Supply';
      const c = $('#d4-rule-cond').selectedOptions[0].textContent;
      const a = $('#d4-rule-acct').value;
      rules.push('IF vendor = “' + v + '” [' + c + '] THEN ' + a);
      renderRules(false);
    });
    $('#d4-rule-conflict').addEventListener('click', () => {
      rules.push('IF vendor = “Northwind Supply” [Always] THEN Office supplies');
      renderRules(true);
    });
    $('#d4-reset').addEventListener('click', () => {
      picks = { t1: 'Office supplies', t2: 'Office supplies', t3: 'Office supplies', t4: 'Office supplies' };
      rules = []; scoreByPhase = {};
      $('#d4-grade-out').innerHTML = ''; $('#d4-act-out').innerHTML = '';
      render(); renderRules(false);
    });
  }

  /* ================= DEMO 5 ================= */
  function initDemo5() {
    const BOOKS = 5000, BANK = 5175;
    let check = null, fee = null, plug = null;

    function paint() {
      const bankAdj = BANK - (check === 'timing' ? 200 : 0);
      let booksAdj = BOOKS - (fee === 'entry' ? 25 : 0);
      if (check === 'entry') booksAdj -= 200; // bogus compensating expense
      if (plug) booksAdj += plug;
      $('#d5-adj-bank').textContent = '$5,175' + (check === 'timing' ? ' − $200 (outstanding check)' : ' − ?') + ' = ' + money(bankAdj);
      let bl = '$5,000';
      if (fee === 'entry') bl += ' − $25 (fee)';
      if (check === 'entry') bl += ' − $200 (BOGUS)';
      if (plug) bl += ' + ' + money(plug) + ' (plug)';
      if (fee !== 'entry' && check !== 'entry' && !plug) bl += ' − ?';
      $('#d5-adj-books').textContent = bl + ' = ' + money(booksAdj);
      const st = $('#d5-status');
      if (plug) { st.innerHTML = '<span class="badge red">⚠️ FORCED — unresolved plug</span>'; }
      else if (check === 'timing' && fee === 'entry') { st.innerHTML = '<span class="badge green">✓ RECONCILED · $4,975 = $4,975</span>'; }
      else { st.textContent = 'not reconciled'; }
      // journal
      const es = [];
      if (fee === 'entry') es.push({ memo: 'Record missing bank fee', date: 'Jan 31', lines: [
        { account: 'Bank fees', tag: 'expense', debit: 25, credit: 0 }, { account: 'Checking cash', tag: 'asset', debit: 0, credit: 25 }] });
      if (check === 'entry') es.push({ memo: 'Bogus compensating entry (do not do this)', date: 'Jan 31', lines: [
        { account: 'Mystery expense', tag: 'expense', debit: 200, credit: 0 }, { account: 'Checking cash', tag: 'asset', debit: 0, credit: 200 }] });
      if (plug) es.push({ memo: 'Plug — unexplained adjustment', date: 'Jan 31', lines: [
        { account: 'Unexplained plug', tag: '???', debit: 0, credit: 0 }] });
      const plugNote = plug ? '<div class="callout red"><strong>Plug of ' + money(plug) + ':</strong> an unexplained adjustment that forces agreement while hiding the real cause. Marked as an unresolved accounting problem.</div>' : '';
      const showEs = (plug && es.length === 1) ? [] : es;
      $('#d5-journal').innerHTML = showEs.length ? journalTable(showEs) + plugNote : (plugNote || '<p class="hint">The fee entry will appear here when posted.</p>');
      $('#d5-item-check').className = 'recon-item' + (check === 'timing' ? ' matched-ok' : check ? ' matched-warn' : '');
      $('#d5-item-fee').className = 'recon-item' + (fee === 'entry' ? ' matched-ok' : fee ? ' matched-warn' : '');
    }
    $$('[data-d5]').forEach(b => b.addEventListener('click', () => {
      const k = b.getAttribute('data-d5');
      if (k === 'check-timing') { check = 'timing'; $('#d5-books-adjust').innerHTML = '<div class="callout green">✓ Check #1041 marked as a <b>timing difference</b>: books already correct, bank will catch up. No entry posted.</div>'; }
      if (k === 'check-entry') { check = 'entry'; $('#d5-books-adjust').innerHTML = '<div class="callout red"><strong>✗ You invented a transaction.</strong> The check was already recorded — this bogus $200 expense double-counts it and corrupts the books.</div>'; }
      if (k === 'fee-entry') { fee = 'entry'; $('#d5-bank-adjust').innerHTML = '<div class="callout green">✓ Missing fee posted: <b>Debit Bank fees $25 / Credit Cash $25</b>. Only genuinely-missing items get entries.</div>'; }
      if (k === 'fee-ignore') { fee = 'ignore'; $('#d5-bank-adjust').innerHTML = '<div class="callout red"><strong>✗ Ignored.</strong> The $25 fee is real — the bank took it. Books now overstate cash by $25 forever (until someone investigates).</div>'; }
      paint();
    }));
    $('#d5-plug').addEventListener('click', () => {
      const bankAdj = BANK - (check === 'timing' ? 200 : 0);
      let booksAdj = BOOKS - (fee === 'entry' ? 25 : 0);
      if (check === 'entry') booksAdj -= 200;
      plug = bankAdj - booksAdj;
      if (plug === 0) plug = null;
      $('#d5-plug-out').innerHTML = plug
        ? '<div class="callout red"><strong>Numbers match. Understanding: zero.</strong> The ' + money(plug) + ' plug hides ' + (check !== 'timing' ? 'an unexplained outstanding item' : '') + (check !== 'timing' && fee !== 'entry' ? ' and ' : '') + (fee !== 'entry' ? 'a missing fee entry' : '') + '. Auditors (and future you) will not be amused.</div>'
        : '<div class="callout green">No difference to plug — reconcile properly instead.</div>';
      paint();
    });
    $('#d5-reset').addEventListener('click', () => {
      check = null; fee = null; plug = null;
      $('#d5-books-adjust').innerHTML = ''; $('#d5-bank-adjust').innerHTML = ''; $('#d5-plug-out').innerHTML = '';
      paint();
    });
    paint();
  }
})();
