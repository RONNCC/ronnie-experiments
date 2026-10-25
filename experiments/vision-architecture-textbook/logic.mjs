// Pure helpers for the roofline/attention calculator and the backbone recommender.
// No DOM access here so the numbers can be unit-tested in Node and reused verbatim.

export const HARDWARE = {
  a100: { name: "NVIDIA A100 (BF16)", peakTflops: 312, bandwidthTBps: 2.0 },
  h100: { name: "NVIDIA H100 (BF16)", peakTflops: 989, bandwidthTBps: 3.35 },
  b200: { name: "NVIDIA B200 (FP8)", peakTflops: 4500, bandwidthTBps: 8.0 },
};

export const bytesPerElement = (bits) => bits / 8;

// Arithmetic intensity of a GEMM: FLOPs moved per byte read/written from HBM.
// FLOPs = 2*M*N*K. Bytes = 2*bytesPerElement*(M*K + K*N + M*N).
export function gemmIntensity({ m, n, k, bits = 16 }) {
  const bpe = bytesPerElement(bits);
  const flops = 2 * m * n * k;
  const bytes = 2 * bpe * (m * k + k * n + m * n);
  return { flops, bytes, intensity: flops / bytes };
}

// Arithmetic intensity of attention.
//
// Prefill processes all `seqLen` queries, so QK^T is n x n and the N x N score
// matrix is what naive attention materialises in HBM. FlashAttention keeps
// Q/K/V and partial sums in SRAM, so the matrix only touches HBM in tiles of
// `tileRows` K-rows — the quadratic term survives with a much smaller constant.
//
// Decode appends a single new token per sequence, so QK^T is 1 x n. K and V
// dominate the byte count and the intensity collapses to ~1/bytesPerElement,
// independent of batch size. That is the honest reason decode is memory-bound:
// batching raises throughput, not arithmetic intensity.
export function attentionCost({ seqLen = 4096, headDim = 64, heads = 16, batch = 1, flash = true, bits = 16, decode = false }) {
  const n = seqLen;
  const d = headDim;
  const bpe = bytesPerElement(bits);
  const queries = decode ? 1 : n;

  // QK^T and PV, per head per sequence.
  const attentionFlops = 2 * batch * heads * 2 * queries * n * d;

  const qkvBytes = 2 * bpe * batch * heads * (2 * queries * d + 2 * n * d);
  const outputBytes = 2 * bpe * batch * heads * queries * d;
  const scoreBytesNaive = 2 * bpe * batch * heads * 2 * queries * n;

  const sramBytes = 192 * 1024;
  const tileRows = Math.max(1, Math.floor(sramBytes / (bpe * d * 4)));
  const scoreBytesFlash = 2 * bpe * batch * heads * (2 * (queries * n)) / tileRows;

  const naiveBytes = qkvBytes + outputBytes + scoreBytesNaive;
  const flashBytes = qkvBytes + outputBytes + scoreBytesFlash;

  return {
    seqLen: n,
    headDim: d,
    heads,
    batch,
    phase: decode ? "decode" : "prefill",
    queries,
    flops: attentionFlops,
    naiveBytes,
    flashBytes,
    tileRows,
    intensityNaive: attentionFlops / naiveBytes,
    intensityFlash: attentionFlops / flashBytes,
    bytesUsed: flash ? flashBytes : naiveBytes,
    intensity: flash ? attentionFlops / flashBytes : attentionFlops / naiveBytes,
  };
}

export function roofline(intensity, hardware) {
  const ridge = hardware.peakTflops / hardware.bandwidthTBps;
  const boundTflops = Math.min(hardware.peakTflops, hardware.bandwidthTBps * intensity);
  return {
    ridge,
    boundTflops,
    regime: intensity < ridge ? "memory-bound (bandwidth)" : "compute-bound",
    utilization: hardware.peakTflops > 0 ? boundTflops / hardware.peakTflops : 0,
  };
}

// Time a workload at the roofline bound (microseconds). `flops` is total work.
export function rooflineTimeUs(flops, hardware) {
  const boundFlopsPerUs = Math.min(hardware.peakTflops * 1e6, hardware.bandwidthTBps * 1e12);
  return flops / boundFlopsPerUs;
}

// ---- Backbone recommender -------------------------------------------------
// A transparent scoring heuristic, not a NAS run. Each family scores against
// the four lenses: inductive bias, optimization, expressivity, systems.
export const FAMILIES = {
  cnn: { name: "Modern ConvNet (ConvNeXt / RepViT)", lenses: "locality + equivariance + hierarchy" },
  vit: { name: "Vision Transformer (DINOv3 / SigLIP 2)", lenses: "global attention, weak bias" },
  ssm: { name: "State-space hybrid (VMamba / MambaVision)", lenses: "linear-time global context" },
  mobile: { name: "Mobile CNN (RepViT / MobileNetV4)", lenses: "hardware-aware, low latency" },
  nav: { name: "Native-resolution ViT (NaViT / NaFlex)", lenses: "variable resolution, aspect ratio" },
};

export function recommendBackbone({ dataRegime = "large", latency = "server", resolution = "fixed", dense = false, hardware = "mobile" }) {
  const score = { cnn: 0, vit: 0, ssm: 0, mobile: 0, nav: 0 };
  const smallData = dataRegime === "small";
  const needsGlobal = resolution === "variable" || dense;

  // Inductive bias: CNNs win on small data, ViTs win when data is plentiful.
  score.cnn += smallData ? 3 : 0;
  score.vit += smallData ? -2 : 2;
  score.ssm += smallData ? 0 : 1;
  score.mobile += smallData ? 2 : 0;
  score.nav += smallData ? -1 : 0;

  // Systems: mobile hardware prefers the arithmetic of depthwise convolution.
  if (latency === "mobile" || hardware === "mobile") {
    score.mobile += 4;
    score.cnn += 1;
    score.vit -= 3;
    score.ssm -= 1;
  } else {
    score.vit += 2;
    score.cnn += 1;
    score.ssm += 2;
  }

  // Expressivity: variable resolution and dense features want token grids.
  if (resolution === "variable") {
    score.nav += 4;
    score.vit += 1;
    score.cnn -= 2;
    score.mobile -= 1;
  }
  if (dense) {
    score.vit += 2;
    score.nav += 1;
    score.ssm += 1;
  }
  // Long sequences / high resolution favour linear-time context.
  if (hardware === "edge-long") score.ssm += 3;

  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const [family, points] = ranked[0];
  const runner = ranked[1];
  const meta = FAMILIES[family];

  const readPath = {
    cnn: "Ch. 3 and Ch. 5",
    vit: "Ch. 1, 2 and Ch. 16",
    ssm: "Ch. 11 and Ch. 13",
    mobile: "Ch. 3, 14 and 15",
    nav: "Ch. 4 and Ch. 16",
  }[family];

  const testFirst = {
    cnn: "Ablate the stem and the token/channel mixer split; verify latency on target hardware.",
    vit: "Check dense-feature quality (registers / Gram anchoring) and resolution generalisation.",
    ssm: "Sweep scan direction and state size; measure long-sequence extrapolation.",
    mobile: "Profile MACs versus measured latency; confirm the inference graph fuses branches.",
    nav: "Measure packing efficiency (padding fraction) and per-resolution accuracy.",
  }[family];

  return {
    family,
    title: meta.name,
    lenses: meta.lenses,
    points,
    runner: FAMILIES[runner[0]].name,
    runnerPoints: runner[1],
    reason:
      `Score ${points} vs ${runner[1]} for ${runner[0]}. ` +
      `${smallData ? "Data is scarce, so baked-in locality buys sample efficiency." : "Data is plentiful, so the weak bias of a global token model pays off."}` +
      (resolution === "variable" ? " Variable resolution requires a token grid plus packing." : "") +
      (latency === "mobile" || hardware === "mobile" ? " Mobile deployment rewards depthwise convolution and fused inference graphs." : ""),
    readPath,
    testFirst,
  };
}
