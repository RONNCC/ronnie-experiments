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
  const api = {FIFO, states, events, excluded, coverage, evidence};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ChipModels = api;
})(typeof window !== 'undefined' ? window : globalThis);
