/* Pure educational models. No HDL simulation, network, storage, or model calls. */
(function (root) {
  'use strict';
  class FIFO {
    constructor(depth = 4) {
      if (!Number.isInteger(depth) || depth < 1) throw new RangeError('Positive integer depth required');
      this.depth = depth;
      this.clear();
    }
    clear() { this.queue = []; this.read = 0; this.write = 0; this.cycle = 0; }
    step({valid = false, ready = false, data = 0, reset = false} = {}) {
      if (!Number.isInteger(data) || data < 0 || data > 255) throw new RangeError('Data must be an integer from 0 to 255');
      const before = [...this.queue], n = before.length;
      const outValid = !reset && n > 0;
      const pop = outValid && Boolean(ready);
      const inReady = !reset && (n < this.depth || pop);
      const push = Boolean(valid) && inReady;
      const oldHead = outValid ? before[0] : null;
      if (reset) { this.queue = []; this.read = 0; this.write = 0; }
      else {
        if (pop) { this.queue.shift(); this.read = (this.read + 1) % this.depth; }
        if (push) { this.queue.push(data); this.write = (this.write + 1) % this.depth; }
      }
      return {cycle: ++this.cycle, before, after: [...this.queue], reset: Boolean(reset),
        occupancy: n, state: n === 0 ? 'empty' : n === this.depth ? 'full' : 'interior',
        inReady, outValid, pop, push, oldHead, data, read: this.read, write: this.write,
        event: push && pop ? 'both' : push ? 'push' : pop ? 'pop' : 'idle'};
    }
  }
  const states = ['empty', 'interior', 'full'];
  const events = ['idle', 'push', 'pop', 'both'];
  const excluded = new Set(['empty:pop', 'empty:both', 'full:push']);
  function coverage(hits, review) {
    const counted = [...hits].filter(k => !excluded.has(k)).length;
    const denominator = review ? 9 : 12;
    return {counted, denominator, percent: 100 * counted / denominator};
  }
  function evidence({spec, run, wave, source, reproduced, truncated}) {
    if (!spec || !run) return {level: 'abstain', text: 'Abstain: contract or run configuration is missing. We cannot classify this behavior reliably.'};
    if (!wave || truncated) return {level: 'abstain', text: 'Abstain: the complete first-divergence window is unavailable. Request a bounded, untruncated waveform query.'};
    if (!source) return {level: 'hypothesis', text: 'Observation supported: count increased on a full simultaneous transfer. Root cause remains a hypothesis until relevant source is inspected.'};
    if (!reproduced) return {level: 'hypothesis', text: 'Supported candidate: the push-priority count update mishandles simultaneous transfer. Run the focused reproducer before declaring a confirmed diagnosis.'};
    return {level: 'supported', text: 'Supported diagnosis for this synthetic case: the push-priority count update breaks F3. A focused reproducer confirms it. A proposed fix still needs independent boundary and regression checks; this is not signoff.'};
  }
  // Instrumented JS reducer: statement labels, NOT an HDL code-coverage engine.
  function hiddenOrdering({mutant = true, suite = 'smoke', checker = true} = {}) {
    if (!['smoke', 'ordering'].includes(suite)) throw new RangeError('Unknown suite');
    const labels = new Set(['init']), queue = [], outputs = [], expected = [];
    let orderingBin = false;
    const operations = suite === 'smoke' ? [['w',10],['r'],['w',20],['r']] : [['w',10],['w',20],['r'],['r']];
    for (const [op,data] of operations) {
      if (op === 'w') { labels.add('write'); queue.push(data); expected.push(data); }
      else {
        labels.add('read'); if (queue.length >= 2) orderingBin = true;
        const value = mutant ? queue.pop() : queue.shift();
        labels.add('emit'); outputs.push(value);
      }
    }
    const matches = outputs.every((value, i) => value === expected[i]);
    return {labels:[...labels], statementPercent:100*labels.size/4, orderingBin,
      outputs, expected, matches, verdict: !checker ? 'unchecked' : matches ? 'pass' : 'fail'};
  }
  function integerIn(value, lo, hi, label) {
    if (!Number.isInteger(value) || value < lo || value > hi) throw new RangeError(`${label} must be an integer ${lo}..${hi}`);
  }
  // Ideal digital sampling only: all coincident clocks read OLD source/control levels.
  function cdcPulse({src = 4, dst = 10, phase = 3, width = 1, spacing = 5, mode = 'pulse'} = {}) {
    integerIn(src,2,20,'Source period'); integerIn(dst,2,30,'Destination period');
    integerIn(phase,0,dst-1,'Phase'); integerIn(width,1,8,'Pulse width'); integerIn(spacing,1,12,'Event spacing');
    if (width > spacing) throw new RangeError('Pulse width cannot exceed event spacing');
    if (!['pulse','toggle','handshake'].includes(mode)) throw new RangeError('Unknown crossing mode');
    const offers = Array.from({length:6},(_,i)=>src*(1+i*spacing));
    const accepted=[], delivered=[], samples=[];
    let req=0, ack=0, ack1=0, ack2=0, q1=0, q2=0;
    const end = offers[5] + width*src + 12*(src+dst);
    for (let t=0;t<=end;t++) {
      const oldReq=req, oldAck=ack, oldAck1=ack1, oldAck2=ack2, oldQ1=q1, oldQ2=q2;
      if (t % src === 0) {
        if (mode==='handshake') { ack1=oldAck; ack2=oldAck1; }
        if (offers.includes(t) && (mode!=='handshake' || oldReq===oldAck2)) {
          accepted.push(t); if (mode!=='pulse') req=1-oldReq;
        }
      }
      if (t>=phase && (t-phase)%dst===0) {
        // At exact start/end boundaries, sample before source transition.
        const sampled = mode==='pulse' ? Number(offers.some(start=>start<t && t<=start+width*src)) : oldReq;
        q1=sampled; q2=oldQ1;
        const event = mode==='pulse' ? q2===1 && oldQ2===0 : q2!==oldQ2;
        if(event) delivered.push(t);
        if(mode==='handshake') ack=q2;
        samples.push({t,input:sampled,q1,q2,event});
      }
    }
    return {offers, accepted, delivered, samples, end, busy:offers.length-accepted.length,
      missed:accepted.length-delivered.length, src,dst,phase,width,spacing,mode};
  }
  // All costs and outcomes below are deliberately disclosed synthetic recipes.
  const budgetCases = [
    {id:'simultaneous',kind:'bug',rounds:2,license:.25,spec:true,check:true,review:6},
    {id:'wrap',kind:'bug',rounds:3,license:.25,spec:false,check:true,review:6},
    {id:'stall',kind:'bug',rounds:2,license:.25,spec:true,check:true,review:6},
    {id:'reset',kind:'bug',rounds:4,license:.25,spec:true,check:true,review:6},
    {id:'license-error',kind:'infrastructure',rounds:1,license:0,spec:false,check:false,review:3},
    {id:'build-mismatch',kind:'infrastructure',rounds:2,license:0,spec:false,check:false,review:3},
    {id:'clean',kind:'clean',rounds:2,license:.25,spec:true,check:true,review:2},
    {id:'ambiguous-spec',kind:'ambiguity',rounds:3,license:0,spec:true,check:false,review:4}
  ];
  function agentBudget({rounds=3, licenseBudget=3, workers=2, retrieval=true, checker=true} = {}) {
    integerIn(rounds,1,6,'Round limit'); integerIn(workers,1,4,'Workers');
    if (!Number.isFinite(licenseBudget) || licenseBudget<0 || licenseBudget>16) throw new RangeError('License budget must be 0..16');
    let license=0,calls=0;
    const lanes=Array(workers).fill(0), results=[];
    for(const item of budgetCases) {
      let done=0;
      while(done<Math.min(rounds,item.rounds) && license+item.license<=licenseBudget+1e-9) {
        done++; calls++; license+=item.license;
      }
      const supported=done>=item.rounds && (!item.spec||retrieval) && (!item.check||checker);
      const minutes=done*(2+item.license*60); // 2 inference/tool minutes + occupied license minutes.
      const lane=lanes.indexOf(Math.min(...lanes)); lanes[lane]+=minutes;
      results.push({...item,done,supported,minutes,reviewMinutes:supported?item.review:8});
    }
    return {results,license,calls,cost:calls*.04,makespan:Math.max(...lanes),
      bugs:results.filter(c=>c.supported&&c.kind==='bug').length,
      supported:results.filter(c=>c.supported).length,
      reproducers:results.filter(c=>c.supported&&c.kind==='bug'&&c.check).length,
      abstentions:results.filter(c=>!c.supported).length,
      reviewMinutes:results.reduce((s,c)=>s+c.reviewMinutes,0)};
  }
  const api = {FIFO, states, events, excluded, coverage, evidence, hiddenOrdering, cdcPulse, budgetCases, agentBudget};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ChipModels = api;
})(typeof window !== 'undefined' ? window : globalThis);
