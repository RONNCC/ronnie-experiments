import test from "node:test";
import assert from "node:assert/strict";
import {
  HARDWARE, attentionCost, gemmIntensity, recommendBackbone, roofline, rooflineTimeUs,
} from "../logic.mjs";

// ---- roofline -------------------------------------------------------------

test("hardware table reproduces the ridge points quoted in Chapter 12", () => {
  assert.deepEqual(Object.keys(HARDWARE), ["a100", "h100", "b200"]);
  const ridge = (key) => HARDWARE[key].peakTflops / HARDWARE[key].bandwidthTBps;
  assert.ok(Math.abs(ridge("a100") - 156) < 0.5, "A100 ridge ~156");
  assert.ok(Math.abs(ridge("h100") - 295) < 0.5, "H100 ridge ~295");
  assert.ok(Math.abs(ridge("b200") - 562.5) < 0.5, "B200 ridge ~563");
});

test("roofline switches from memory-bound to compute-bound at the ridge", () => {
  const hw = HARDWARE.h100;
  const below = roofline(10, hw);
  assert.equal(below.regime, "memory-bound (bandwidth)");
  assert.ok(below.utilization < 0.1, `below-ridge utilisation was ${below.utilization}`);
  const above = roofline(1000, hw);
  assert.equal(above.regime, "compute-bound");
  assert.equal(above.utilization, 1);
  const at = roofline(295, hw);
  assert.ok(Math.abs(at.utilization - 0.99966) < 0.01);
});

test("roofline time is bounded by the slower of compute and memory", () => {
  const hw = HARDWARE.a100;
  const computeOnly = rooflineTimeUs(1e12, { ...hw, peakTflops: 100e12 });
  const memoryOnly = rooflineTimeUs(1e12, { ...hw, bandwidthTBps: 1e6 });
  assert.ok(computeOnly < memoryOnly, "compute-bound finish beats a bandwidth-starved one");
  assert.ok(rooflineTimeUs(2e12, hw) > rooflineTimeUs(1e12, hw), "twice the work takes twice the time");
});

test("GEMM intensity matches the textbook example", () => {
  const gemm = gemmIntensity({ m: 64, n: 64, k: 64, bits: 16 });
  assert.equal(gemm.flops, 524_288);
  assert.equal(gemm.bytes, 49_152);
  assert.ok(Math.abs(gemm.intensity - 32 / 3) < 1e-9, "64^3 GEMM is ~10.67 FLOP/byte");
});

// ---- attention -----------------------------------------------------------

test("prefill: naive attention is memory-bound, fused attention clears the ridge", () => {
  const cost = attentionCost({ seqLen: 4096, headDim: 64, heads: 16, batch: 1, flash: false });
  const ridge = HARDWARE.h100.peakTflops / HARDWARE.h100.bandwidthTBps;
  assert.ok(Math.abs(cost.intensityNaive - 30.8) < 0.2, `naive intensity ${cost.intensityNaive}`);
  assert.ok(Math.abs(cost.intensityFlash - 768) < 5, `fused intensity ${cost.intensityFlash}`);
  assert.ok(cost.intensityNaive < ridge, "naive prefill is bandwidth-bound");
  assert.ok(cost.intensityFlash > ridge, "fused prefill is compute-bound");
  assert.ok(cost.intensityFlash > cost.intensityNaive * 20, "fusion is more than an order of magnitude");
});

test("fusion moves bytes, not FLOPs", () => {
  const args = { seqLen: 4096, headDim: 64, heads: 16, batch: 1 };
  const naive = attentionCost({ ...args, flash: false });
  const fused = attentionCost({ ...args, flash: true });
  assert.equal(naive.flops, fused.flops);
  assert.ok(fused.flashBytes < naive.naiveBytes / 20, "the N x N matrix leaves HBM");
});

test("naive attention traffic scales quadratically with sequence length", () => {
  const base = attentionCost({ seqLen: 4096, headDim: 64, heads: 16, batch: 1, flash: false });
  const doubled = attentionCost({ seqLen: 8192, headDim: 64, heads: 16, batch: 1, flash: false });
  // The N^2 score term dominates; the linear Q/K/V term pulls the ratio just below 4.
  const ratio = doubled.naiveBytes / base.naiveBytes;
  assert.ok(ratio > 3.8 && ratio < 4, `naive traffic ratio was ${ratio}`);
});

test("fused attention still grows quadratically, but far more slowly", () => {
  const base = attentionCost({ seqLen: 4096, headDim: 64, heads: 16, batch: 1, flash: true });
  const doubled = attentionCost({ seqLen: 8192, headDim: 64, heads: 16, batch: 1, flash: true });
  assert.ok(doubled.intensityFlash > base.intensityFlash, "longer sequences still benefit from fusion");
  assert.ok(doubled.flashBytes < base.flashBytes * 4, "the constant shrinks even though the order does not");
});

test("decode is memory-bound at every batch size — batching raises throughput, not intensity", () => {
  const args = { seqLen: 2048, headDim: 64, heads: 16, flash: true, decode: true };
  const one = attentionCost({ ...args, batch: 1 });
  const eight = attentionCost({ ...args, batch: 8 });
  assert.ok(Math.abs(one.intensityFlash - 0.5) < 0.05, `decode intensity ${one.intensityFlash}`);
  assert.ok(Math.abs(eight.intensityFlash - 0.5) < 0.05, "batch cancels between FLOPs and bytes");
  assert.equal(eight.phase, "decode");
  assert.ok(eight.flops > one.flops, "eight sequences do eight times the work");
  assert.ok(eight.bytesUsed > one.bytesUsed, "and move eight times the bytes");
});

test("decode at the same sequence length is far less intense than prefill", () => {
  const prefill = attentionCost({ seqLen: 2048, headDim: 64, heads: 16, batch: 1, flash: true });
  const decode = attentionCost({ seqLen: 2048, headDim: 64, heads: 16, batch: 1, flash: true, decode: true });
  assert.ok(decode.intensityFlash < prefill.intensityFlash / 100);
});

test("attention cost stays finite for degenerate inputs", () => {
  for (const seqLen of [64, 512, 65536]) {
    for (const headDim of [8, 64, 512]) {
      for (const decode of [false, true]) {
        const cost = attentionCost({ seqLen, headDim, heads: 8, batch: 2, flash: true, decode });
        assert.ok(Number.isFinite(cost.intensityFlash) && cost.intensityFlash > 0);
      }
    }
  }
});

// ---- backbone recommender -------------------------------------------------

test("large-data, server, fixed-resolution prefers a ViT", () => {
  const rec = recommendBackbone({ dataRegime: "large", latency: "server", resolution: "fixed", hardware: "short" });
  assert.equal(rec.family, "vit");
  assert.equal(rec.title, "Vision Transformer (DINOv3 / SigLIP 2)");
  assert.match(rec.reason, /Score \d+ vs \d+ for/);
});

test("scarce data flips the recommendation to a convolution", () => {
  const rec = recommendBackbone({ dataRegime: "small", latency: "server", resolution: "fixed", hardware: "short" });
  assert.equal(rec.family, "cnn");
  assert.match(rec.reason, /Data is scarce/);
});

test("mobile deployment rewards depthwise convolution and fused inference graphs", () => {
  const rec = recommendBackbone({ dataRegime: "large", latency: "mobile", resolution: "fixed", hardware: "short" });
  assert.equal(rec.family, "mobile");
  assert.match(rec.reason, /Mobile deployment/);
  assert.match(rec.testFirst, /inference graph fuses branches/);
});

test("variable resolution surfaces a token-grid family as the runner-up", () => {
  const rec = recommendBackbone({ dataRegime: "large", latency: "server", resolution: "variable", hardware: "short" });
  assert.ok(["vit", "nav"].includes(rec.family));
  assert.match(rec.runner, /Native-resolution ViT|Vision Transformer/);
  assert.match(rec.reason, /Variable resolution/);
});

test("long sequences favour a linear-time state-space hybrid", () => {
  const rec = recommendBackbone({ dataRegime: "large", latency: "server", resolution: "fixed", hardware: "edge-long" });
  assert.equal(rec.family, "ssm");
  assert.match(rec.reason, /plentiful/);
});

test("dense prediction pulls toward token grids in both regimes", () => {
  const small = recommendBackbone({ dataRegime: "small", latency: "server", resolution: "fixed", dense: true, hardware: "short" });
  const large = recommendBackbone({ dataRegime: "large", latency: "server", resolution: "fixed", dense: true, hardware: "short" });
  assert.ok(["vit", "nav"].includes(large.family));
  assert.notEqual(small.family, large.family, "dense features should matter even when data is scarce");
});

test("the recommender is a pure function that never returns an unknown family", () => {
  const call = () => recommendBackbone({ dataRegime: "large", latency: "server", resolution: "variable", dense: true, hardware: "edge-long" });
  assert.deepEqual(call(), call());
  const recipes = [
    { dataRegime: "large", latency: "server", resolution: "fixed", hardware: "short" },
    { dataRegime: "small", latency: "mobile", resolution: "fixed", hardware: "short" },
    { dataRegime: "small", latency: "mobile", resolution: "variable", dense: true, hardware: "edge-long" },
    { dataRegime: "large", latency: "server", resolution: "variable", dense: true, hardware: "edge-long" },
  ];
  for (const recipe of recipes) {
    const rec = recommendBackbone(recipe);
    assert.ok(["cnn", "vit", "ssm", "mobile", "nav"].includes(rec.family));
    assert.ok(rec.title && rec.lenses && rec.readPath && rec.testFirst);
    assert.ok(Number.isFinite(rec.points));
    assert.match(rec.readPath, /Ch\./);
  }
});
