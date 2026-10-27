import test from "node:test";
import assert from "node:assert/strict";
import {
  ADAMW_BYTES_PER_PARAMETER,
  mixtureWeights,
  planningTrials,
  trainingMemory,
  wilsonInterval,
} from "../logic.mjs";

test("DDP replicates the documented 16-byte AdamW static state", () => {
  const result = trainingMemory({ parametersBillions: 1, gpuCount: 8, gpuMemoryGB: 80, activationGB: 10, runtimeGB: 2, scheme: "ddp" });
  assert.equal(ADAMW_BYTES_PER_PARAMETER, 16);
  assert.equal(result.totalStaticGB, 16);
  assert.equal(result.staticPerRankGB, 16);
  assert.equal(result.weightsGB, 2);
  assert.equal(result.gradientsGB, 2);
  assert.equal(result.optimizerGB, 12);
  assert.equal(result.totalPerRankGB, 28);
  assert.equal(result.headroomGB, 52);
  assert.ok(result.fits);
});

test("ideal FSDP shards static state but not per-rank activations", () => {
  const ddp = trainingMemory({ parametersBillions: 7, gpuCount: 8, activationGB: 18, runtimeGB: 6, scheme: "ddp" });
  const fsdp = trainingMemory({ parametersBillions: 7, gpuCount: 8, activationGB: 18, runtimeGB: 6, scheme: "fsdp" });
  assert.equal(fsdp.staticPerRankGB, ddp.staticPerRankGB / 8);
  assert.equal(fsdp.activationGB, ddp.activationGB);
  assert.equal(fsdp.totalStaticGB, ddp.totalStaticGB);
  assert.equal(fsdp.clusterActivationGB, 144);
  assert.equal(fsdp.totalPerRankGB, 38);
  assert.ok(fsdp.headroomGB > ddp.headroomGB);
});

test("memory fit boundary is inclusive and headroom reports overflow", () => {
  const exact = trainingMemory({ parametersBillions: 1, gpuCount: 1, gpuMemoryGB: 20, activationGB: 2, runtimeGB: 2, scheme: "ddp" });
  assert.equal(exact.totalPerRankGB, 20);
  assert.ok(exact.fits);
  const overflow = trainingMemory({ parametersBillions: 1, gpuCount: 1, gpuMemoryGB: 19, activationGB: 2, runtimeGB: 2, scheme: "ddp" });
  assert.equal(overflow.headroomGB, -1);
  assert.ok(!overflow.fits);
});

test("temperature endpoints give equal and natural sampling", () => {
  const sizes = [80_000, 20_000, 5_000];
  const equal = mixtureWeights(sizes, 0, 105_000);
  for (const row of equal) assert.ok(Math.abs(row.probability - 1 / 3) < 1e-12);
  const natural = mixtureWeights(sizes, 1, 105_000);
  assert.ok(Math.abs(natural[0].probability - 80 / 105) < 1e-12);
  assert.ok(Math.abs(natural[2].probability - 5 / 105) < 1e-12);
  assert.equal(natural[0].epochs, 1);
  assert.equal(natural[1].epochs, 1);
  assert.equal(natural[2].epochs, 1);
});

test("temperature balances oversampling and expected draws", () => {
  const rows = mixtureWeights([80_000, 20_000, 5_000], 0.5, 100_000);
  assert.ok(Math.abs(rows.reduce((sum, row) => sum + row.probability, 0) - 1) < 1e-12);
  assert.ok(Math.abs(rows.reduce((sum, row) => sum + row.expectedDraws, 0) - 100_000) < 1e-8);
  assert.ok(rows[2].relativeToNatural > rows[0].relativeToNatural);
  assert.ok(rows[2].epochs > rows[0].epochs);
  for (const row of rows) {
    assert.ok(Number.isFinite(row.epochs));
    assert.ok(row.relativeToNatural > 0);
  }
});

test("mixture validation rejects degenerate inputs", () => {
  for (const sizes of [[], [0], [10, -1], [Number.NaN]]) {
    assert.throws(() => mixtureWeights(sizes), RangeError);
  }
  assert.throws(() => mixtureWeights([10], -0.1), RangeError);
  assert.throws(() => mixtureWeights([10], 1.1), RangeError);
  assert.throws(() => mixtureWeights([10], 0.5, 0), RangeError);
});

test("Wilson interval matches a standard 50-out-of-100 example", () => {
  const result = wilsonInterval(50, 100);
  assert.equal(result.observed, 0.5);
  assert.ok(Math.abs(result.lower - 0.4038315303659956) < 1e-12);
  assert.ok(Math.abs(result.upper - 0.5961684696340044) < 1e-12);
  assert.ok(Math.abs(result.standardError - 0.05) < 1e-12);
});

test("Wilson interval stays bounded at extreme observations", () => {
  const zero = wilsonInterval(0, 20);
  const all = wilsonInterval(20, 20);
  assert.equal(zero.lower, 0);
  assert.ok(zero.upper > 0 && zero.upper < 1);
  assert.equal(all.upper, 1);
  assert.ok(all.lower > 0 && all.lower < 1);
  assert.ok(zero.lower <= zero.observed && zero.observed <= zero.upper);
  assert.ok(all.lower <= all.observed && all.observed <= all.upper);
});

test("Wilson interval narrows with more evidence at the same rate", () => {
  const small = wilsonInterval(8, 10);
  const large = wilsonInterval(80, 100);
  assert.ok(large.upper - large.lower < small.upper - small.lower);
});

test("Wilson and planning validation reject impossible values", () => {
  for (const [successes, trials] of [[-1, 10], [11, 10], [1.5, 10], [1, 0], [1, 10.5]]) {
    assert.throws(() => wilsonInterval(successes, trials), RangeError);
  }
  assert.equal(planningTrials(0.8, 0.05), 246);
  assert.ok(planningTrials(0.5, 0.05) > planningTrials(0.8, 0.05));
  assert.ok(planningTrials(0.8, 0.025) > planningTrials(0.8, 0.05));
  assert.throws(() => planningTrials(0, 0.05), RangeError);
  assert.throws(() => planningTrials(0.8, 0), RangeError);
});
