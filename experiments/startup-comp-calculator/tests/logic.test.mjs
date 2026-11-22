import test from "node:test";
import assert from "node:assert/strict";
import {
  EXAMPLE,
  breakEvenExit,
  computeScenario,
  decodeState,
  encodeState,
  formatMoney,
  formatPercent,
  parseAmount,
  payoutCurve,
  projectCapTable,
  resolveGrantShares,
  vestedFraction,
  waterfall,
  yourExitPayout
} from "../logic.mjs";

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);

test("parseAmount accepts common shorthand and rejects junk", () => {
  assert.equal(parseAmount("1,234"), 1234);
  assert.equal(parseAmount("$1.2M"), 1200000);
  assert.equal(parseAmount("62m"), 62000000);
  assert.equal(parseAmount("500k"), 500000);
  assert.equal(parseAmount("1.5bn"), 1500000000);
  assert.equal(parseAmount("12%"), 12);
  assert.equal(parseAmount(".25"), 0.25);
  assert.ok(Number.isNaN(parseAmount("")));
  assert.ok(Number.isNaN(parseAmount("abc")));
  assert.ok(Number.isNaN(parseAmount("1.2.3")));
  assert.ok(Number.isNaN(parseAmount("5 m k")));
});

test("formatters stay readable for tiny stakes and large sums", () => {
  assert.equal(formatMoney(2083000), "$2.08M");
  assert.equal(formatMoney(950), "$950");
  assert.equal(formatMoney(1.37), "$1.37");
  assert.equal(formatPercent(0.00387), "0.387%");
  assert.equal(formatPercent(0.25), "25.0%");
});

test("vesting respects the cliff, then accrues by step", () => {
  const base = { vestYears: 4, cliffMonths: 12 };
  assert.equal(vestedFraction({ months: 11, ...base }), 0);
  assert.equal(vestedFraction({ months: 12, ...base }), 0.25);
  close(vestedFraction({ months: 18, ...base }), 18 / 48);
  assert.equal(vestedFraction({ months: 48, ...base }), 1);
  assert.equal(vestedFraction({ months: 120, ...base }), 1);
  close(vestedFraction({ months: 17, ...base, frequency: "quarterly" }), 15 / 48);
  close(vestedFraction({ months: 35, ...base, frequency: "annual" }), 24 / 48);
  close(vestedFraction({ months: 1, vestYears: 4, cliffMonths: 0 }), 1 / 48);
  assert.throws(() => vestedFraction({ months: 3, vestYears: 0 }), RangeError);
});

test("grant can be stated as shares, percent, or dollar value", () => {
  assert.equal(resolveGrantShares({ mode: "shares", amount: 48000 }), 48000);
  close(resolveGrantShares({ mode: "percent", amount: 0.5, fdShares: 10000000 }), 50000);
  close(resolveGrantShares({ mode: "value", amount: 200000, quotePrice: 4 }), 50000);
  assert.throws(() => resolveGrantShares({ mode: "value", amount: 1, quotePrice: 0 }), RangeError);
});

test("each round dilutes by raise / post plus pool top-up", () => {
  const stages = projectCapTable({
    fdShares: 10000000,
    yourShares: 100000,
    postMoney: 50000000,
    raisedToDate: 10000000,
    investorPct: 30,
    rounds: [
      { name: "B", raise: 25000000, preMoney: 100000000, poolTopUp: 5 },
      { name: "C", raise: 50000000, preMoney: 200000000, poolTopUp: 0 }
    ]
  });
  assert.equal(stages.length, 3);
  close(stages[0].ownership, 0.01);
  close(stages[0].pricePerShare, 5);
  // B: 25/125 = 20% to investors, 5% to the pool, holders keep 75%.
  close(stages[1].dilution, 0.25);
  close(stages[1].ownership, 0.0075);
  close(stages[1].pricePerShare, 125000000 / (10000000 / 0.75));
  // New investors own exactly raise / post.
  const seriesB = stages[1].series.find((s) => s.name === "B");
  close(seriesB.shares / stages[1].fdShares, 0.2);
  // C: 50/250 = 20%, keep 80%.
  close(stages[2].ownership, 0.0075 * 0.8);
  close(stages[2].totalPreference, 85000000);
  // The input array is never mutated across snapshots.
  assert.equal(stages[0].series.length, 1);
});

test("rounds that leave nothing for existing holders are rejected", () => {
  assert.throws(
    () =>
      projectCapTable({
        fdShares: 1000,
        yourShares: 10,
        postMoney: 1000,
        rounds: [{ raise: 90, preMoney: 10, poolTopUp: 10 }]
      }),
    RangeError
  );
});

test("waterfall: no preferred means a plain pro rata split", () => {
  const w = waterfall({ exitValue: 1000, commonShares: 100, series: [] });
  assert.equal(w.perCommonShare, 10);
  assert.equal(w.toCommon, 1000);
});

test("waterfall: small exit goes entirely to the preference", () => {
  const series = [{ name: "A", shares: 40, preference: 600 }];
  const w = waterfall({ exitValue: 500, commonShares: 60, series });
  assert.equal(w.perCommonShare, 0);
  assert.equal(w.series[0].payout, 500);
  assert.equal(w.series[0].converted, false);
});

test("waterfall: non-participating converts only when conversion pays more", () => {
  const series = [{ name: "A", shares: 40, preference: 600 }];
  // Exit 1000: as converted A gets 400 < 600, so it takes 600, common splits 400.
  let w = waterfall({ exitValue: 1000, commonShares: 60, series });
  close(w.perCommonShare, 400 / 60);
  assert.equal(w.series[0].converted, false);
  // Exit 2000: as converted A gets 800 > 600, so it converts.
  w = waterfall({ exitValue: 2000, commonShares: 60, series });
  close(w.perCommonShare, 20);
  assert.equal(w.series[0].converted, true);
  close(w.toCommon + w.toPreferred, 2000);
});

test("waterfall: series convert in order of preference per share", () => {
  const series = [
    { name: "Seed", shares: 20, preference: 20 }, // $1 per share threshold
    { name: "B", shares: 20, preference: 400 } // $20 per share threshold
  ];
  // Exit 1000 with both converted would be $10/share, below B's $20 threshold.
  // So B takes 400; Seed converts: (1000 - 400) / (60 + 20) = 7.5 >= 1.
  const w = waterfall({ exitValue: 1000, commonShares: 60, series });
  close(w.perCommonShare, 7.5);
  assert.equal(w.series[0].converted, true);
  assert.equal(w.series[1].converted, false);
  close(w.series.reduce((s, x) => s + x.payout, 0) + w.toCommon, 1000);
});

test("waterfall: a cheap series can convert even when total preference exceeds the exit", () => {
  const series = [
    { name: "Free", shares: 50, preference: 0 },
    { name: "Big", shares: 10, preference: 100 }
  ];
  const w = waterfall({ exitValue: 120, commonShares: 40, series });
  // Big holds (100), Free converts with common: 20 / 90.
  close(w.perCommonShare, 20 / 90);
  close(w.series[1].payout, 100);
});

test("waterfall: participating takes preference and then shares pro rata", () => {
  const series = [{ name: "A", shares: 40, preference: 600 }];
  const w = waterfall({ exitValue: 2000, commonShares: 60, series, participating: true });
  close(w.perCommonShare, 14);
  close(w.series[0].payout, 600 + 40 * 14);
});

test("payout per common share never decreases as exit value grows", () => {
  const stage = projectCapTable({ ...EXAMPLE, yourShares: 48000 })[2];
  let prev = -1;
  for (let E = 1e6; E < 5e9; E *= 1.13) {
    const x = waterfall({ exitValue: E, commonShares: stage.commonShares, series: stage.series }).perCommonShare;
    assert.ok(x >= prev - 1e-9, `drop at ${E}`);
    prev = x;
  }
});

test("options pay the spread, RSUs pay the full share", () => {
  const stage = projectCapTable({ fdShares: 100, yourShares: 10, postMoney: 1000 })[0];
  const opt = yourExitPayout({ stage, exitValue: 2000, vestedShares: 10, grantType: "options", strike: 5 });
  const rsu = yourExitPayout({ stage, exitValue: 2000, vestedShares: 10, grantType: "rsu", strike: 5 });
  assert.equal(opt.payout, 150);
  assert.equal(rsu.payout, 200);
  const underwater = yourExitPayout({ stage, exitValue: 300, vestedShares: 10, grantType: "options", strike: 5 });
  assert.equal(underwater.payout, 0);
});

test("break-even exit hits the target within tolerance", () => {
  const stage = projectCapTable({ fdShares: 100, yourShares: 10, postMoney: 1000, raisedToDate: 300, investorPct: 20 })[0];
  const args = { stage, vestedShares: 10, grantType: "options", strike: 1, participating: false };
  const E = breakEvenExit({ ...args, target: 250 });
  const at = yourExitPayout({ ...args, exitValue: E }).payout;
  assert.ok(at >= 250 && at < 250.01, `payout ${at}`);
  assert.equal(breakEvenExit({ ...args, vestedShares: 0, target: 250 }), null);
});

test("example scenario hangs together", () => {
  const r = computeScenario(EXAMPLE);
  close(r.todayPrice, 58900000 / 12400000);
  close(r.ownershipToday, 48000 / 12400000);
  // Series B keeps 75%, Series C keeps 1 - 65/375 - 0.03.
  close(r.ownershipAtExit, r.ownershipToday * 0.75 * (1 - 65 / 375 - 0.03));
  assert.equal(r.vestedAtExit, 1);
  assert.ok(r.exit.payout > 1.9e6 && r.exit.payout < 2.2e6, `payout ${r.exit.payout}`);
  close(r.cashForgone, (215000 - 172000) * 4);
  assert.ok(r.breakEven > 0 && r.breakEven < r.input.exitValue);
  close(r.exerciseCostTotal, 48000 * 1.37);
  assert.equal(r.scenarioRows.length, 6);
});

test("leaving before exit caps vesting at your tenure", () => {
  const r = computeScenario({ ...EXAMPLE, yearsStay: 2, yearsToExit: 6 });
  assert.equal(r.vestedAtExit, 0.5);
  close(r.exerciseCostOnLeaving, 24000 * 1.37);
});

test("payout curve is log spaced and monotone", () => {
  const r = computeScenario(EXAMPLE);
  const pts = payoutCurve({
    stage: r.exitStage,
    vestedShares: r.vestedShares,
    grantType: "options",
    strike: r.strike,
    minExit: 1e7,
    maxExit: 1e10,
    points: 31
  });
  assert.equal(pts.length, 31);
  close(pts[0].exitValue, 1e7, 1e-6);
  close(pts[30].exitValue, 1e10, 1e-6);
  close(pts[15].exitValue, Math.sqrt(1e17), 1e-6);
  for (let k = 1; k < pts.length; k += 1) assert.ok(pts[k].payout >= pts[k - 1].payout);
});

test("share links round trip and reject garbage", () => {
  const state = { ...EXAMPLE, rounds: [...EXAMPLE.rounds], note: "Série B ✓" };
  assert.deepEqual(decodeState(encodeState(state)), state);
  assert.equal(decodeState("not base64 !!"), null);
  assert.equal(decodeState(encodeState([1, 2])), null);
});
