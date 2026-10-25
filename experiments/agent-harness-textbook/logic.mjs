// Transparent teaching calculation; these independence assumptions are not empirical.
export function reliability({ stepSuccess = 0.98, steps = 30, detection = 0.8, recovery = 0.6 }) {
  const values = [stepSuccess, steps, detection, recovery];
  if (!values.every(Number.isFinite) || stepSuccess < 0 || stepSuccess > 1 || steps < 1 || detection < 0 || detection > 1 || recovery < 0 || recovery > 1) {
    throw new RangeError("Inputs outside the probability-model domain");
  }
  const raw = Math.min(1, stepSuccess ** steps);
  const repairedStep = Math.min(1, stepSuccess + (1 - stepSuccess) * detection * recovery);
  return {
    raw,
    repairedStep,
    gated: repairedStep ** steps,
    expectedFailures: steps * (1 - stepSuccess),
    recoveryFraction: detection * recovery,
  };
}
