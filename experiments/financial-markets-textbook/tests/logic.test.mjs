import test from "node:test";
import assert from "node:assert/strict";
import { convertUsdKrw, simulatePosition } from "../logic.mjs";

test("USD/KRW conversion has explicit units and uses the correct quote direction", () => {
  const result = convertUsdKrw(100_000, 1_350);
  assert.equal(result.usd, 100_000);
  assert.equal(result.rate, 1_350);
  assert.equal(result.krw, 135_000_000);
});

test("ordinary model shock reduces equity but does not call before maintenance is breached", () => {
  const result = simulatePosition({ notionalMillions: 10, leverage: 5, gapPercent: 8 });
  assert.equal(result.initialEquity, 2_000_000);
  assert.equal(result.priceLoss, 800_000);
  assert.equal(result.maintenance, 500_000);
  assert.equal(result.liquidation, false);
  assert.equal(result.equityAfterCosts, 1_200_000);
  assert.equal(result.uncoveredDeficit, 0);
});

test("gap beyond collateral triggers liquidation cost and an uncovered deficit", () => {
  const result = simulatePosition({ notionalMillions: 10, leverage: 5, gapPercent: 20 });
  assert.equal(result.liquidation, true);
  assert.equal(result.callToRestoreInitialEquity, 2_000_000);
  assert.equal(result.closeoutCost, 25_000);
  assert.equal(result.equityAfterCosts, -25_000);
  assert.equal(result.uncoveredDeficit, 25_000);
});

test("model handles boundary values without negative exposure", () => {
  const fx = convertUsdKrw(-100, 1_350);
  assert.equal(fx.krw, 0);
  const position = simulatePosition({ notionalMillions: 0, leverage: 0, gapPercent: 0 });
  assert.equal(position.notional, 0);
  assert.equal(position.leverage, 1);
  assert.equal(position.uncoveredDeficit, 0);
});
