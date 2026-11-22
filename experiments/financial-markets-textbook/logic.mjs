export function convertUsdKrw(amountUsd, krwPerUsd) {
  const usd = Math.max(0, Number(amountUsd) || 0);
  const rate = Math.max(0, Number(krwPerUsd) || 0);
  return { usd, rate, krw: usd * rate };
}

export function simulatePosition({ notionalMillions, leverage, gapPercent, maintenanceFraction = 0.25, closeoutCostFraction = 0.0025 }) {
  const notional = Math.max(0, Number(notionalMillions) || 0) * 1_000_000;
  const leverageMultiple = Math.max(1, Number(leverage) || 1);
  const adverseMove = Math.max(0, Number(gapPercent) || 0) / 100;
  const initialEquity = notional / leverageMultiple;
  const priceLoss = notional * adverseMove;
  const maintenance = initialEquity * maintenanceFraction;
  const equityBeforeClose = initialEquity - priceLoss;
  const liquidation = equityBeforeClose < maintenance;
  const closeoutCost = liquidation ? notional * closeoutCostFraction : 0;
  const equityAfterCosts = equityBeforeClose - closeoutCost;
  return {
    notional,
    leverage: leverageMultiple,
    gapPercent: adverseMove * 100,
    initialEquity,
    priceLoss,
    maintenance,
    equityBeforeClose,
    liquidation,
    closeoutCost,
    equityAfterCosts,
    uncoveredDeficit: Math.max(0, -equityAfterCosts),
    callToRestoreInitialEquity: liquidation ? Math.max(0, initialEquity - equityBeforeClose) : 0
  };
}
