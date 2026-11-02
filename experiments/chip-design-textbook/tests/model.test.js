'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {counterTrace, trafficTrace, rtlCode, pipelineStages, stageDetail, hlsVariant, nodePresets, nodeEconomics} = require('../model.js');

test('counter: reset dominates the first edge and enables count afterward', () => {
  const r = counterTrace({cycles: 4});
  assert.deepEqual(r.rows.map(x => x.count), [0, 1, 2, 3]);
  assert.equal(r.rows[0].rst_n, 0);
});
test('counter: gated enable holds the value after four edges', () => {
  const r = counterTrace({enableMode: 'gated', cycles: 7});
  assert.deepEqual(r.rows.map(x => x.count), [0, 1, 2, 3, 3, 3, 3]);
});
test('counter: alternating enable counts on every second edge', () => {
  const r = counterTrace({enableMode: 'alt', cycles: 5});
  assert.deepEqual(r.rows.map(x => x.count), [0, 0, 1, 1, 2]);
});
test('counter: width wraps and reset value must fit', () => {
  const r = counterTrace({width: 2, cycles: 6});
  assert.deepEqual(r.rows.map(x => x.count), [0, 1, 2, 3, 0, 1]);
  assert.throws(() => counterTrace({width: 2, resetValue: 4}), RangeError);
});
test('counter: the missing-reset bug leaves X forever (X + 1 is X)', () => {
  const r = counterTrace({breakIt: true, cycles: 5});
  assert.deepEqual(r.rows.map(x => x.count), ['X', 'X', 'X', 'X', 'X']);
  assert.ok(r.rows.every(x => x.rst_n === 1));
});
test('counter: invalid parameters throw', () => {
  assert.throws(() => counterTrace({width: 1}), RangeError);
  assert.throws(() => counterTrace({enableMode: 'sometimes'}), RangeError);
  assert.throws(() => counterTrace({cycles: 0}), RangeError);
});
test('traffic: cycles G -> Y -> R with configured lengths', () => {
  const r = trafficTrace({green: 2, yellow: 1, red: 2, cycles: 9});
  assert.deepEqual(r.rows.map(x => x.state), ['G', 'G', 'Y', 'R', 'R', 'G', 'G', 'Y', 'R']);
});
test('traffic: the missing-transition bug sticks in green', () => {
  const r = trafficTrace({breakIt: true, cycles: 8});
  assert.deepEqual(r.rows.map(x => x.state), ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G']);
});
test('traffic: timers reset at each state change', () => {
  const r = trafficTrace({green: 3, cycles: 5});
  assert.deepEqual(r.rows.map(x => x.state), ['G', 'G', 'G', 'Y', 'R']);
  assert.deepEqual(r.rows.map(x => x.timer), [0, 1, 2, 0, 0]);
});
test('rtlCode: generated verilog tracks parameters and the bug toggle', () => {
  const good = rtlCode({example: 'counter', params: {width: 6, resetValue: 3}});
  assert.match(good, /parameter WIDTH = 6/);
  assert.match(good, /WIDTH'd3/);
  assert.ok(!good.includes('BUG'));
  const bad = rtlCode({example: 'counter', params: {breakIt: true}});
  assert.match(bad, /BUG: the reset branch is gone/);
  const traffic = rtlCode({example: 'traffic', params: {green: 3, breakIt: true}});
  assert.match(traffic, /BUG: the green-to-yellow arc is missing/);
  assert.match(traffic, /timer == 2/);
});
test('pipeline stages: seven stages with the 1x/10x/100x rule-of-thumb ladder', () => {
  assert.equal(pipelineStages.length, 7);
  assert.deepEqual(pipelineStages.map(s => s.escape), [1, 1, 1, 10, 10, 100, 100]);
  for (const s of pipelineStages) {
    assert.ok(s.catches.length >= 2 && s.tools.length >= 2 && s.escapeNote.length > 10);
  }
  assert.equal(stageDetail('tapeout').escape, 100);
  assert.throws(() => stageDetail('nope'), RangeError);
});
test('hls: disclosed toy schedule and pragma placement', () => {
  const base = hlsVariant({});
  assert.equal(base.latency, 10); // 8 sequential passes + 2 overhead
  assert.equal(base.ii, 10);
  assert.equal(base.adds, 1);
  assert.ok(!base.cCode.includes('#pragma'));
  const u8 = hlsVariant({unroll: 8});
  assert.equal(u8.latency, 3);
  assert.equal(u8.adds, 8);
  assert.match(u8.cCode, /#pragma HLS UNROLL factor=8/);
  const pipe = hlsVariant({pipeline: true});
  assert.equal(pipe.ii, 1);
  assert.equal(pipe.latency, 10);
  assert.match(pipe.cCode, /#pragma HLS PIPELINE II=1/);
  assert.match(pipe.rtlCode, /out_valid/);
  assert.throws(() => hlsVariant({unroll: 4}), RangeError);
});
test('node economics: gross dies, Poisson yield, and amortization', () => {
  const r = nodeEconomics({dieArea: 100, waferPrice: 18500, volume: 100000, nre: 40e6, defectDensity: 0.006});
  assert.equal(r.gross, 640); // pi*150^2/100 - pi*300/sqrt(200), floored
  assert.ok(Math.abs(r.yieldRate - Math.exp(-0.6)) < 1e-12);
  assert.ok(Math.abs(r.perDie - 18500 / (640 * Math.exp(-0.6))) < 1e-9);
  assert.equal(r.nrePerChip, 400);
  assert.ok(Math.abs(r.allIn - (r.perDie + 400)) < 1e-9);
});
test('node economics: gross-die approximation matches its closed form', () => {
  // pi*150^2/A - pi*300/sqrt(2A), floored: the edge-loss term shrinks with area.
  assert.equal(nodeEconomics({dieArea: 50}).gross, 1319);
  assert.equal(nodeEconomics({dieArea: 100}).gross, 640);
  assert.equal(nodeEconomics({dieArea: 400}).gross, 143);
  assert.ok(nodeEconomics({dieArea: 100}).gross > nodeEconomics({dieArea: 400}).gross);
});
test('node economics: presets are in-range and validation throws', () => {
  assert.equal(nodePresets.length, 5);
  for (const p of nodePresets) {
    nodeEconomics({dieArea: 100, waferPrice: p.wafer, nre: p.nre, defectDensity: p.d0, volume: 100000});
  }
  assert.throws(() => nodeEconomics({dieArea: 0}), RangeError);
  assert.throws(() => nodeEconomics({volume: 10}), RangeError);
  assert.throws(() => nodeEconomics({defectDensity: 1}), RangeError);
});
