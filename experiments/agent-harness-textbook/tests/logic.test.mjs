import test from 'node:test';
import assert from 'node:assert/strict';
import { reliability } from '../logic.mjs';

test('long sequential horizon compounds even high per-step reliability', () => {
  const out = reliability({ stepSuccess: 0.98, steps: 50, detection: 0, recovery: 0 });
  assert.ok(Math.abs(out.raw - 0.98 ** 50) < 1e-12);
  assert.equal(out.gated, out.raw);
  assert.ok(Math.abs(out.expectedFailures - 1) < 1e-12);
});

test('effective independent recovery raises task success without exceeding one', () => {
  const out = reliability({ stepSuccess: 0.98, steps: 30, detection: 0.8, recovery: 0.6 });
  assert.ok(out.gated > out.raw);
  assert.ok(out.gated <= 1);
  assert.equal(out.recoveryFraction, 0.48);
});

test('perfect steps, zero horizon edge case within domain', () => {
  const out = reliability({ stepSuccess: 1, steps: 1, detection: 0, recovery: 0 });
  assert.equal(out.raw, 1);
  assert.equal(out.gated, 1);
});

test('rejects invalid probabilities and horizons', () => {
  assert.throws(() => reliability({ stepSuccess: 1.1, steps: 2 }), RangeError);
  assert.throws(() => reliability({ stepSuccess: 0.9, steps: 0 }), RangeError);
  assert.throws(() => reliability({ stepSuccess: 0.9, steps: 2, recovery: Number.NaN }), RangeError);
});
