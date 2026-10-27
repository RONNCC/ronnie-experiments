// Pure, dependency-free arithmetic for the three teaching labs.
// These are transparent models with documented assumptions, not benchmarks.

export const ADAMW_BYTES_PER_PARAMETER = 16;

/** Idealized mixed-precision AdamW memory budget, in decimal GB.
 *
 * Per parameter: BF16 weights (2) + BF16 gradients (2) + FP32 master
 * weights (4) + two FP32 moments (8) = 16 bytes. DDP replicates this
 * static state; ideal FSDP shards it across ranks. Activations and the
 * user-supplied runtime allowance remain per rank. Real frameworks differ.
 */
export function trainingMemory({
  parametersBillions = 7,
  gpuCount = 8,
  gpuMemoryGB = 80,
  activationGB = 18,
  runtimeGB = 6,
  scheme = "fsdp",
} = {}) {
  const parameters = parametersBillions * 1e9;
  const totalStaticGB = parameters * ADAMW_BYTES_PER_PARAMETER / 1e9;
  const shardCount = scheme === "fsdp" ? gpuCount : 1;
  const staticPerRankGB = totalStaticGB / shardCount;
  const weightsGB = parametersBillions * 2 / shardCount;
  const gradientsGB = parametersBillions * 2 / shardCount;
  const optimizerGB = parametersBillions * 12 / shardCount;
  const totalPerRankGB = staticPerRankGB + activationGB + runtimeGB;
  return {
    scheme,
    totalStaticGB,
    staticPerRankGB,
    weightsGB,
    gradientsGB,
    optimizerGB,
    activationGB,
    runtimeGB,
    totalPerRankGB,
    headroomGB: gpuMemoryGB - totalPerRankGB,
    fits: totalPerRankGB <= gpuMemoryGB,
    clusterActivationGB: activationGB * gpuCount,
  };
}

/** Temperature sampling: p_i proportional to n_i ** alpha. */
export function mixtureWeights(sizes, alpha = 0.5, draws = 100_000) {
  if (!Array.isArray(sizes) || sizes.length === 0 || sizes.some((n) => !Number.isFinite(n) || n <= 0)) {
    throw new RangeError("Dataset sizes must be positive finite numbers");
  }
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError("alpha must be between zero and one");
  }
  if (!Number.isFinite(draws) || draws <= 0) {
    throw new RangeError("draws must be positive");
  }
  const powered = sizes.map((n) => n ** alpha);
  const denominator = powered.reduce((sum, value) => sum + value, 0);
  const total = sizes.reduce((sum, value) => sum + value, 0);
  return sizes.map((size, index) => {
    const probability = powered[index] / denominator;
    const naturalProbability = size / total;
    return {
      size,
      probability,
      expectedDraws: probability * draws,
      epochs: probability * draws / size,
      relativeToNatural: probability / naturalProbability,
    };
  });
}

/** Wilson score interval for a binomial success proportion. */
export function wilsonInterval(successes, trials, z = 1.959963984540054) {
  if (!Number.isInteger(successes) || !Number.isInteger(trials) || trials <= 0 || successes < 0 || successes > trials) {
    throw new RangeError("Require integer 0 <= successes <= trials, with trials > 0");
  }
  if (!Number.isFinite(z) || z <= 0) throw new RangeError("z must be positive");
  const observed = successes / trials;
  const z2 = z * z;
  const denominator = 1 + z2 / trials;
  const center = (observed + z2 / (2 * trials)) / denominator;
  const halfWidth = z * Math.sqrt(observed * (1 - observed) / trials + z2 / (4 * trials * trials)) / denominator;
  return {
    observed,
    lower: Math.max(0, center - halfWidth),
    upper: Math.min(1, center + halfWidth),
    standardError: Math.sqrt(observed * (1 - observed) / trials),
  };
}

/** Rough normal-approximation planning count, not a guarantee for a Wilson CI. */
export function planningTrials(expectedRate = 0.8, margin = 0.05, z = 1.959963984540054) {
  if (![expectedRate, margin, z].every(Number.isFinite) || expectedRate <= 0 || expectedRate >= 1 || margin <= 0 || margin >= 1 || z <= 0) {
    throw new RangeError("Require 0 < expectedRate < 1, 0 < margin < 1, and z > 0");
  }
  return Math.ceil(z * z * expectedRate * (1 - expectedRate) / (margin * margin));
}
