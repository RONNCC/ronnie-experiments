import test from "node:test";
import assert from "node:assert/strict";
import { computeAnnualCost, computeBrokenArmEpisode, formatUsd, roundToCents } from "../logic.mjs";

test("formatUsd never rounds a small non-zero amount down to $0.00", () => {
  assert.equal(formatUsd(0), "$0.00");
  assert.equal(formatUsd(0.004), "<$0.01");
  assert.equal(formatUsd(-0.004), "-<$0.01");
  assert.equal(formatUsd(0.005), "$0.01");
  assert.equal(formatUsd(0.006), "$0.01");
});

test("formatUsd prints exact cents and thousands separators", () => {
  assert.equal(formatUsd(1794), "$1,794.00");
  assert.equal(formatUsd(4970.4), "$4,970.40");
  assert.equal(formatUsd(3176), "$3,176.00");
  assert.equal(formatUsd(9500.555), "$9,500.56");
});

test("roundToCents removes IEEE dust from coinsurance products", () => {
  assert.equal(220 * 0.2 === 44, true); // sanity: this happens to be exact
  assert.equal(Number(roundToCents(0.1 + 0.2)), 0.3);
  assert.equal(roundToCents(3470 * 0.2), 694);
  assert.equal(roundToCents(220 * 0.2), 44);
});

test("simulator default view reproduces the book's worked numbers", () => {
  const result = computeAnnualCost({
    monthlyPremium: 480,
    deductible: 1500,
    coinsurancePercent: 20,
    outOfPocketMax: 6000,
    annualAllowed: 4970
  });
  assert.equal(result.annualPremium, 5760);
  assert.equal(result.deductiblePaid, 1500);
  assert.equal(result.remainderAfterDeductible, 3470);
  assert.equal(result.coinsurancePaid, 694);
  assert.equal(result.outOfPocket, 2194);
  assert.equal(result.insurerPaid, 2776);
  assert.equal(result.totalYearlyCost, 7954);
  assert.equal(result.outOfPocketMaxApplied, false);
  assert.equal(result.deductibleMet, true);
});

test("simulator: usage below the deductible costs the allowed amount only", () => {
  const result = computeAnnualCost({
    monthlyPremium: 100,
    deductible: 1500,
    coinsurancePercent: 20,
    outOfPocketMax: 6000,
    annualAllowed: 400
  });
  assert.equal(result.annualPremium, 1200);
  assert.equal(result.deductiblePaid, 400);
  assert.equal(result.coinsurancePaid, 0);
  assert.equal(result.outOfPocket, 400);
  assert.equal(result.insurerPaid, 0);
  assert.equal(result.totalYearlyCost, 1600);
  assert.equal(result.deductibleMet, false);
});

test("simulator: zero usage costs premiums only", () => {
  const result = computeAnnualCost({
    monthlyPremium: 480,
    deductible: 1500,
    coinsurancePercent: 20,
    outOfPocketMax: 6000,
    annualAllowed: 0
  });
  assert.equal(result.outOfPocket, 0);
  assert.equal(result.insurerPaid, 0);
  assert.equal(result.totalYearlyCost, 5760);
});

test("simulator: out-of-pocket maximum caps the patient's year", () => {
  const result = computeAnnualCost({
    monthlyPremium: 0,
    deductible: 1000,
    coinsurancePercent: 50,
    outOfPocketMax: 3000,
    annualAllowed: 50000
  });
  assert.equal(result.outOfPocket, 3000);
  assert.equal(result.insurerPaid, 47000);
  assert.equal(result.totalYearlyCost, 3000);
  assert.equal(result.outOfPocketMaxApplied, true);
});

test("simulator: out-of-pocket maximum of zero yields a fully covered year", () => {
  const result = computeAnnualCost({
    monthlyPremium: 200,
    deductible: 500,
    coinsurancePercent: 20,
    outOfPocketMax: 0,
    annualAllowed: 1234.56
  });
  assert.equal(result.outOfPocket, 0);
  assert.equal(result.insurerPaid, 1234.56);
  assert.equal(result.totalYearlyCost, 2400);
});

test("simulator: boundary at exactly the deductible", () => {
  const result = computeAnnualCost({
    monthlyPremium: 0,
    deductible: 1500,
    coinsurancePercent: 20,
    outOfPocketMax: 6000,
    annualAllowed: 1500
  });
  assert.equal(result.deductiblePaid, 1500);
  assert.equal(result.coinsurancePaid, 0);
  assert.equal(result.outOfPocket, 1500);
  assert.equal(result.insurerPaid, 0);
  assert.equal(result.deductibleMet, true);
});

test("simulator: inputs are clamped, never negative", () => {
  const result = computeAnnualCost({
    monthlyPremium: -50,
    deductible: -1,
    coinsurancePercent: 250,
    outOfPocketMax: -100,
    annualAllowed: -1000
  });
  assert.equal(result.annualPremium, 0);
  assert.equal(result.outOfPocket, 0);
  assert.equal(result.insurerPaid, 0);
  assert.equal(result.totalYearlyCost, 0);
});

test("chapter 11 episode: five claims reconcile to the allowed amount", () => {
  const episode = computeBrokenArmEpisode();
  const { claims, totals } = episode;
  assert.equal(claims.length, 5);
  assert.equal(totals.charge, 9500);
  assert.equal(totals.allowed, 4970);
  assert.equal(totals.toDeductible, 1000);
  assert.equal(totals.patient, 1794);
  assert.equal(totals.insurer, 3176);
  // plan + patient always equals the allowed amount
  assert.equal(roundToCents(totals.patient + totals.insurer), totals.allowed);
});

test("chapter 11 episode: per-line arithmetic matches the printed EOB", () => {
  const { claims } = computeBrokenArmEpisode();
  const byService = Object.fromEntries(claims.map(c => [c.service.split(",")[0], c]));
  assert.deepEqual(
    claims.map(c => [c.toDeductible, c.patientCoinsurance, c.patient, c.insurer]),
    [
      [900, 0, 900, 0],
      [100, 44, 144, 176],
      [0, 480, 480, 1920],
      [0, 140, 140, 560],
      [0, 130, 130, 520]
    ]
  );
  assert.equal(byService["X-ray"].patient, 144);
});

test("chapter 11 episode: write-off and year-to-date figures are exact", () => {
  const episode = computeBrokenArmEpisode();
  assert.equal(episode.writtenOff, 4530);
  assert.equal(episode.deductibleUsed, 1000);
  assert.equal(episode.priorOutOfPocket, 500);
  assert.equal(episode.yearToDateOutOfPocket, 2294);
  assert.equal(episode.outOfPocketRoomLeft, 3706);
  assert.equal(episode.yearToDateOutOfPocket + episode.outOfPocketRoomLeft, 6000);
});

test("chapter 11 episode: line sums never drift from printed totals", () => {
  const { claims, totals } = computeBrokenArmEpisode();
  const sum = (key) => roundToCents(claims.reduce((acc, c) => acc + c[key], 0));
  assert.equal(sum("charge"), totals.charge);
  assert.equal(sum("allowed"), totals.allowed);
  assert.equal(sum("patient"), totals.patient);
  assert.equal(sum("insurer"), totals.insurer);
  assert.equal(sum("toDeductible"), totals.toDeductible);
});
