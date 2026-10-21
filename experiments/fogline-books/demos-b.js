/* Fogline Books — Demos 6–9 */
(function () {
  'use strict';
  const { $, $$, money, esc, journalTable } = window.Fogline;

  document.addEventListener('DOMContentLoaded', () => {
    initDemo6(); initDemo7(); initDemo8(); initDemo9();
  });

  /* ================= DEMO 6 ================= */
  function initDemo6() {
    const MONTHS = ['Payment received · before service', 'End of January', 'End of February', 'End of March', 'End of April', 'End of May', 'End of June', 'End of July', 'End of August', 'End of September', 'End of October', 'End of November', 'End of December'];
    const SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    let basis = 'accrual', mirror = false;
    const slider = $('#d6-month');

    $('#d6-cells').innerHTML = SHORT.map((s, i) => '<div class="month-cell"><small>' + s + '</small><div class="fill" id="d6f' + i + '" style="height:0%"></div></div>').join('');

    function paint() {
      const m = Number(slider.value);
      $('#d6-month-val').textContent = MONTHS[m] + (m > 0 ? ' · ' + m + ' of 12 months delivered' : '');
      for (let i = 0; i < 12; i++) $('#d6f' + i).style.height = (i < m ? 100 : 0) + '%';
      const cash = 12000;
      let rev, def;
      if (basis === 'accrual') { rev = m * 1000; def = 12000 - rev; }
      else { rev = 12000; def = 0; }
      $('#d6-cash').textContent = money(cash);
      $('#d6-rev').textContent = money(rev);
      $('#d6-def').textContent = money(def);
      $('#d6-basis-label').textContent = basis;
      $('#d6-ins-row').hidden = !mirror;
      if (mirror) $('#d6-ins').textContent = money(1200 - m * 100);
      // journal
      const es = [];
      if (basis === 'accrual') {
        es.push({ memo: 'Jan 1 · cash collected upfront', lines: [
          { account: 'Cash', tag: 'asset', debit: 12000, credit: 0 }, { account: 'Deferred revenue', tag: 'liability', debit: 0, credit: 12000 }] });
        if (m > 0) es.push({ memo: 'Adjusting entry · ' + m + ' month(s) of service delivered', lines: [
          { account: 'Deferred revenue', tag: 'liability', debit: m * 1000, credit: 0 }, { account: 'Subscription revenue', tag: 'revenue', debit: 0, credit: m * 1000 }] });
        if (mirror) {
          es.push({ memo: 'Jan 1 · insurance prepaid for the year', lines: [
            { account: 'Prepaid insurance', tag: 'asset', debit: 1200, credit: 0 }, { account: 'Cash', tag: 'asset', debit: 0, credit: 1200 }] });
          if (m > 0) es.push({ memo: 'Adjusting entry · insurance used (' + m + ' mo × $100)', lines: [
            { account: 'Insurance expense', tag: 'expense', debit: m * 100, credit: 0 }, { account: 'Prepaid insurance', tag: 'asset', debit: 0, credit: m * 100 }] });
        }
      } else {
        es.push({ memo: 'Jan 1 · cash view: receipt = revenue', lines: [
          { account: 'Cash', tag: 'asset', debit: 12000, credit: 0 }, { account: 'Subscription revenue', tag: 'revenue', debit: 0, credit: 12000 }] });
        if (m > 0 || true) es.push({ memo: 'No adjusting entries under cash basis', lines: [] });
        es.pop();
      }
      $('#d6-journal').innerHTML = journalTable(es) +
        (basis === 'cash' ? '<div class="callout gold"><strong>Cash view:</strong> the full $12,000 counts as January revenue and no liability is ever recorded. Simple — and blind to the 11 months of service still owed.</div>' : '');
    }
    slider.addEventListener('input', paint);
    $('#d6-basis-accrual').addEventListener('click', () => {
      basis = 'accrual';
      $('#d6-basis-accrual').classList.add('is-active', 'green'); $('#d6-basis-cash').classList.remove('is-active');
      paint();
    });
    $('#d6-basis-cash').addEventListener('click', () => {
      basis = 'cash';
      $('#d6-basis-cash').classList.add('is-active'); $('#d6-basis-accrual').classList.remove('is-active', 'green');
      paint();
    });
    $('#d6-mirror').addEventListener('click', () => {
      mirror = !mirror;
      $('#d6-mirror').classList.toggle('is-active', mirror);
      $('#d6-mirror').setAttribute('aria-pressed', mirror);
      paint();
    });
    paint();
  }

  /* ================= DEMO 7 ================= */
  function initDemo7() {
    // AR side
    let s = 0;
    const arBtn = $('#d7-ar-next');
    const AR_LABELS = ['Advance: issue invoice', 'Advance: collect $1,000', 'Advance: collect $2,000', 'Fully paid ✓'];
    function paintAR() {
      $$('#d7-ar-steps .step').forEach(el => {
        const i = Number(el.getAttribute('data-s'));
        el.className = 'step' + (i < s ? ' done' : i === s ? ' now' : '');
      });
      arBtn.textContent = AR_LABELS[s];
      arBtn.disabled = s >= 3;
      $('#d7-ar-rev').textContent = money(s >= 1 ? 3000 : 0);
      $('#d7-ar-ar').textContent = money(s === 1 ? 3000 : s === 2 ? 2000 : 0);
      $('#d7-ar-cash').textContent = money(s === 2 ? 1000 : s === 3 ? 3000 : 0);
      const es = [];
      if (s >= 1) es.push({ memo: 'Issue invoice #INV-2041 (work delivered)', lines: [
        { account: 'Accounts receivable', tag: 'asset', debit: 3000, credit: 0 }, { account: 'Subscription revenue', tag: 'revenue', debit: 0, credit: 3000 }] });
      if (s >= 2) es.push({ memo: 'Collect $1,000 (partial)', lines: [
        { account: 'Cash', tag: 'asset', debit: 1000, credit: 0 }, { account: 'Accounts receivable', tag: 'asset', debit: 0, credit: 1000 }] });
      if (s >= 3) es.push({ memo: 'Collect $2,000 (final — settles receivable, NOT new revenue)', lines: [
        { account: 'Cash', tag: 'asset', debit: 2000, credit: 0 }, { account: 'Accounts receivable', tag: 'asset', debit: 0, credit: 2000 }] });
      $('#d7-ar-journal').innerHTML = s ? journalTable(es) : '<p class="hint">Entries will appear here.</p>';
    }
    arBtn.addEventListener('click', () => { if (s < 3) { s++; paintAR(); } });
    $('#d7-ar-reset').addEventListener('click', () => { s = 0; paintAR(); });
    paintAR();

    // AP side
    let p = 0;
    const apBtn = $('#d7-ap-next');
    const AP_LABELS = ['Advance: receive bill', 'Advance: pay $800', 'Paid ✓'];
    function paintAP() {
      $$('#d7-ap-steps .step').forEach(el => {
        const i = Number(el.getAttribute('data-s'));
        el.className = 'step' + (i < p ? ' done' : i === p ? ' now' : '');
      });
      apBtn.textContent = AP_LABELS[p];
      apBtn.disabled = p >= 2;
      $('#d7-ap-exp').textContent = money(p >= 1 ? 800 : 0);
      $('#d7-ap-ap').textContent = money(p === 1 ? 800 : 0);
      $('#d7-ap-cash').textContent = money(p === 2 ? 800 : 0);
      const es = [];
      if (p >= 1) es.push({ memo: 'Contractor bill received (work performed)', lines: [
        { account: 'Contractor expense', tag: 'expense', debit: 800, credit: 0 }, { account: 'Accounts payable', tag: 'liability', debit: 0, credit: 800 }] });
      if (p >= 2) es.push({ memo: 'Pay contractor $800 (settles payable)', lines: [
        { account: 'Accounts payable', tag: 'liability', debit: 800, credit: 0 }, { account: 'Cash', tag: 'asset', debit: 0, credit: 800 }] });
      $('#d7-ap-journal').innerHTML = p ? journalTable(es) : '<p class="hint">Entries will appear here.</p>';
    }
    apBtn.addEventListener('click', () => { if (p < 2) { p++; paintAP(); } });
    $('#d7-ap-reset').addEventListener('click', () => { p = 0; paintAP(); });
    paintAP();
  }

  /* ================= DEMO 8 ================= */
  function initDemo8() {
    $('#d8-match').addEventListener('click', () => {
      $('#d8-out').innerHTML =
        '<div class="callout green"><strong>✓ Settlement matched.</strong> Customer obligation settled <b>$1,000</b> = cash <b>$970</b> + processing expense <b>$30</b>. Receivable cleared; no new revenue created.</div>' +
        journalTable([{ memo: 'Match Stripe payout po_88121', date: 'Feb 3', lines: [
          { account: 'Cash', tag: 'asset', debit: 970, credit: 0 },
          { account: 'Processing fees', tag: 'expense', debit: 30, credit: 0 },
          { account: 'Accounts receivable (INV-2041)', tag: 'asset', debit: 0, credit: 1000 }] }]);
    });
    $('#d8-trap').addEventListener('click', () => {
      $('#d8-out').innerHTML =
        '<div class="callout red"><strong>✗ Duplicate revenue.</strong> You booked the $970 payout as a <b>new sale</b> — but INV-2041 already recorded $1,000 of revenue, so income is now overstated at $1,970 while the $1,000 receivable sits <b>unresolved</b>, aging toward a write-off that will surprise everyone.</div>' +
        journalTable([{ memo: 'WRONG: payout booked as new sale', date: 'Feb 3', lines: [
          { account: 'Cash', tag: 'asset', debit: 970, credit: 0 },
          { account: 'Subscription revenue', tag: 'revenue', debit: 0, credit: 970 }] }]);
    });
    $('#d8-reset').addEventListener('click', () => { $('#d8-out').innerHTML = ''; });
  }

  /* ================= DEMO 9 ================= */
  function initDemo9() {
    const mapped = { software: false, training: false, billing: false };
    let midmonth = false, amend = false;

    function paintObs() {
      const bits = [];
      if (mapped.software) bits.push('<span class="obligation-chip">💻 Software access · $12,000 · over time (12 mo)</span>');
      if (mapped.training) bits.push('<span class="obligation-chip">🎓 Training · $3,000 · point in time (March)</span>');
      if (mapped.billing) bits.push('<span class="badge gold">§3 → billing milestone: invoicing only, NOT an obligation</span>');
      $('#d9-obs').innerHTML = bits.length ? bits.join(' ') : '<p class="hint">No obligations mapped yet — click §1 and §2.</p>';
    }
    $$('#d9-contract mark').forEach(m => {
      const go = () => {
        const k = m.getAttribute('data-ob');
        mapped[k] = true;
        m.classList.add('mapped');
        paintObs();
      };
      m.addEventListener('click', go);
      m.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    $('#d9-midmonth').addEventListener('click', () => {
      midmonth = !midmonth;
      $('#d9-midmonth').classList.toggle('is-active', midmonth);
      $('#d9-midmonth').setAttribute('aria-pressed', midmonth);
    });
    $('#d9-amend').addEventListener('click', () => {
      amend = !amend;
      $('#d9-amend').classList.toggle('is-active', amend);
    });
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $('#d9-build').addEventListener('click', () => {
      const method = $('#d9-method').value;
      if (method !== 'correct') {
        $('#d9-sched').innerHTML = '<div class="callout red"><strong>⛔ Guardrail: schedule rejected.</strong> ' +
          (method === 'billings'
            ? 'Recognizing $15,000 at the Milestone-1 <b>billing</b> books a full year of revenue before any service is delivered — the pattern must reflect <b>satisfaction of obligations</b>, not invoicing.'
            : 'Cash timing ignores the obligations entirely: $12,000 of access delivered over 12 months plus March training. The method must follow the contract’s satisfied obligations.') +
          ' You cannot choose a recognition method just to produce attractive results.</div>';
        return;
      }
      if (!mapped.software) {
        $('#d9-sched').innerHTML = '<div class="callout gold">Map <b>§1</b> (software access) first — the schedule needs at least one obligation. Click the highlighted clause.</div>';
        return;
      }
      let sw = MON.map(() => 1000);
      if (midmonth) { sw = [500, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1500]; }
      const tr = MON.map((_, i) => (mapped.training && i === 2) ? 3000 : 0);
      const su = MON.map(() => amend ? 200 : 0);
      let tot = 0;
      let h = '<table class="plain"><tr><th>Month</th><th style="text-align:right">Software</th><th style="text-align:right">Training</th>' + (amend ? '<th style="text-align:right">Support</th>' : '') + '<th style="text-align:right">Total</th></tr>';
      MON.forEach((mn, i) => {
        const t = sw[i] + tr[i] + su[i]; tot += t;
        h += '<tr><td>' + mn + '</td><td class="num">' + money(sw[i]) + '</td><td class="num">' + (tr[i] ? money(tr[i]) + ' ★' : '—') + '</td>' + (amend ? '<td class="num">' + money(su[i]) + '</td>' : '') + '<td class="num"><b>' + money(t) + '</b></td></tr>';
      });
      h += '<tr><td><b>Full year</b></td><td class="num"><b>' + money(sw.reduce((a, b) => a + b, 0)) + '</b></td><td class="num"><b>' + (mapped.training ? money(3000) : money(0)) + '</b></td>' + (amend ? '<td class="num"><b>' + money(2400) + '</b></td>' : '') + '<td class="num"><b>' + money(tot) + '</b></td></tr></table>';
      if (midmonth) h += '<p class="fine-print">Mid-month start: January pro-rated to $500 (simplified daily pro-rata), December picks up the $500 balance. Total still $12,000.</p>';
      if (amend) h += '<p class="fine-print">Amendment: $2,400 support treated as a separate obligation, $200/mo.</p>';
      if (!mapped.training) h += '<p class="fine-print">Training not mapped — click §2 to add the $3,000 March obligation.</p>';
      $('#d9-sched').innerHTML = h;
    });
    function paintReview() {
      const ex = ['d9-ex1', 'd9-ex2', 'd9-ex3'].every(id => $('#' + id).checked);
      const tr = ['d9-tr1', 'd9-tr2', 'd9-tr3'].every(id => $('#' + id).checked);
      $('#d9-review-out').innerHTML =
        (ex && tr ? '<div class="callout green"><strong>✓ Both panels signed.</strong> Extraction ✓ and treatment ✓ — the agent’s work is reviewable <em>because</em> the two judgments stayed separate. Either panel failing would block posting.</div>'
          : ex ? '<div class="callout"><strong>Panel 1 signed:</strong> the contract was read correctly. Panel 2 (accounting treatment) still open.</div>'
            : tr ? '<div class="callout"><strong>Panel 2 signed:</strong> the treatment is sound <em>given the extracted terms</em> — but extraction isn’t verified yet. Order matters.</div>' : '');
    }
    ['d9-ex1', 'd9-ex2', 'd9-ex3', 'd9-tr1', 'd9-tr2', 'd9-tr3'].forEach(id => $('#' + id).addEventListener('change', paintReview));
    paintObs();
  }
})();
