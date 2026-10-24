import test from "node:test";
import assert from "node:assert/strict";
import { PRESETS, calculateCapacity, recommendArchitecture } from "../logic.mjs";

const example = {
  sessions: 100_000, calls: 3, peakPercent: 10, meanSeconds: 4,
  inputTokens: 4_000, outputTokens: 500,
  inputPrice: 0.5, outputPrice: 2,
  stablePercent: 50, hitPercent: 60, cacheFactorPercent: 10,
};

test("teaching example matches the printed derivation", () => {
  const r = calculateCapacity(example);
  assert.equal(r.callsPerDay, 300_000);
  assert.ok(Math.abs(r.peakRps - 8.3333333) < 0.00001);
  assert.ok(Math.abs(r.meanConcurrency - 33.33333) < 0.00001);
  assert.ok(Math.abs(r.inputTPM - 2_000_000) < 0.001);
  assert.ok(Math.abs(r.outputTPM - 250_000) < 0.001);
  assert.ok(Math.abs(r.inputMultiplier - 0.73) < 1e-10);
  assert.ok(Math.abs(r.costPerCall - 0.00246) < 1e-10);
  assert.ok(Math.abs(r.dailyCost - 738) < 1e-8);
  assert.ok(Math.abs(r.monthlyCost - 22_140) < 1e-7);
});

test("no cache vs fully free cache changes only eligible input", () => {
  const noCache = calculateCapacity({ ...example, hitPercent: 0 });
  assert.equal(noCache.dailyCost, 900);
  const freeCache = calculateCapacity({ ...example, stablePercent: 100, hitPercent: 100, cacheFactorPercent: 0 });
  assert.equal(freeCache.dailyCost, 300);
  assert.equal(freeCache.outputTPM, noCache.outputTPM);
});

test("zero traffic stays finite and nonnegative", () => {
  const r = calculateCapacity({ ...example, sessions: 0 });
  assert.equal(r.dailyCost, 0);
  assert.equal(r.peakRps, 0);
});

test("out-of-bounds, missing, infinite, and non-number inputs are rejected", () => {
  for (const change of [
    { sessions: -1 }, { hitPercent: 101 }, { calls: Infinity },
    { meanSeconds: NaN }, { inputPrice: "5" }, { outputTokens: undefined },
    { sessions: 100_000_000 },
  ]) {
    assert.throws(() => calculateCapacity({ ...example, ...change }), RangeError);
  }
});

test("all presets have a matching distinct design and chapter", () => {
  const chapters = new Set();
  for (const [scenario, preset] of Object.entries(PRESETS)) {
    const r = recommendArchitecture({ scenario, ...preset });
    assert.ok(r.title && r.reason && r.data && r.gate && r.test);
    assert.match(r.gate, /approval|policy|permissions|idempotent|controller/i);
    chapters.add(r.chapter);
  }
  assert.deepEqual([...chapters].sort((a, b) => a - b), [14, 15, 16, 17, 18, 19, 20, 21]);
});

test("constraint changes alter the relevant architecture and action boundary", () => {
  const read = recommendArchitecture({ scenario: "support", effect: "read", risk: "moderate", path: "known", freshness: "static" });
  assert.match(read.title, /read/i);
  assert.match(read.gate, /no.*write/);
  assert.match(read.data, /fetch time/);
  const write = recommendArchitecture({ scenario: "support", ...PRESETS.support });
  assert.match(write.gate, /Exact-payload approval/);
  assert.match(write.gate, /UNKNOWN reconciliation/);
  assert.match(write.data, /authoritative service/);
  assert.notEqual(read.title, write.title);
  const scripted = recommendArchitecture({ scenario: "code", ...PRESETS.code, path: "known" });
  assert.match(scripted.title, /Scripted/);
});

test("invalid scenario including inherited object keys cannot be selected", () => {
  assert.throws(() => recommendArchitecture({ scenario: "toString", ...PRESETS.support }), RangeError);
  assert.throws(() => recommendArchitecture({ scenario: "support", ...PRESETS.support, risk: "unknown" }), RangeError);
});
