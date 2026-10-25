# Part IV — Lens 4: Systems

## 12. The roofline and the memory wall

Systems questions are where architecture debates get settled, because a model that is theoretically superior and 3× slower is not superior. The framework that governs all of this is the **roofline model**, and it is worth being able to compute it cold.

### The model

Every kernel does two things: it performs arithmetic (FLOPs) and it moves data (bytes). The ratio is the **arithmetic intensity**:

```
arithmetic intensity (AI) = FLOPs / bytes moved to or from HBM
```

A machine has two ceilings: peak compute (`π`, TFLOP/s) and peak memory bandwidth (`β`, TB/s). Achievable performance is

```
P = min(π, β · AI)
```

and the **ridge point** is where the two ceilings meet:

```
AI_ridge = π / β
```

For a GPU this is typically in the hundreds of FLOPs/byte: **~156 on an A100 (BF16), ~295 on an H100, ~563 on a B200 (FP8)**. Kernels below the ridge are *memory-bound* — they are limited by bandwidth and the compute units sit idle. Kernels above it are *compute-bound* — they are limited by tensor-core throughput.

This is not an abstraction. It is the reason your training run is slow, and it is the reason the same model is fast on one GPU and slow on another.

### The memory wall, and why it governs everything

Over the last decade, peak compute has grown roughly **100×** while HBM bandwidth has grown roughly **10×**. The ridge point has therefore moved *right*, which means more and more operations have become memory-bound. The practical consequence:

> **The bottleneck in modern AI systems is almost never arithmetic. It is moving data.**

Three implications, each of which shows up in real architecture decisions:

1. **Batching is the primary lever at inference.** A decode step is a matrix-vector product: FLOPs `∝ 2NK`, bytes `∝ 2NK`, so AI ≈ 1 — deep in the memory-bound regime. Doubling the batch doubles the FLOPs but keeps the weight-load bytes fixed, so AI doubles. This is why large batches matter so much for decode and why "batch invariance" (Chapter 15) is a real research topic.
2. **Every elementwise operation is brutally memory-bound.** LayerNorm, softmax, dropout, activations: their AI is 1–3 FLOP/byte. On an H100 with a ridge at 295, they run at 1–10% of peak. This is why **operator fusion** (combining several elementwise ops into one kernel that never writes to HBM) is the single highest-leverage systems optimization, and why FlashAttention's fusion matters so much.
3. **Model size is a bandwidth problem, not a compute problem, until you are well into the compute-bound regime.** Loading a 70B-parameter model in BF16 requires 140 GB of bandwidth-bound traffic. That is why quantisation, offloading and MoE (which keeps active weights small) are so valuable.

### Concrete numbers to have in your head

| Operation | FLOPs | Bytes (typical) | AI | Regime on H100 |
|---|---|---|---|---|
| 4096-cube GEMM | ~137 GFLOP | ~100 MB | ~1,365 | Compute-bound |
| Decode GEMV, batch 1 | `2NK` | `2NK` | 1 | Memory-bound, ~0.3% of peak |
| Decode GEMV, batch 56 | `2NKB` | `2NK` | 56 | Memory-bound |
| Decode GEMV, batch 295 | `2NKB` | `2NK` | ~295 | At the ridge point |
| Naive attention, N=8192 | `O(N²d)` | `O(N²)` | ~d (≈128) | Memory-bound |
| FlashAttention, N=8192 | `O(N²d)` | `O(Nd)` | ~N (≈8192) | Compute-bound |
| LayerNorm | ~10/elem | ~4/elem | ~2.5 | Severely memory-bound |
| Residual add | 1/elem | 6/elem | ~0.17 | Severely memory-bound |

Read the table this way: **the same mathematical operation can be compute-bound or memory-bound depending entirely on how you implement it.** That is the entire content of the FlashAttention story, and it is the reason that a "smarter algorithm" can beat a "faster GPU".

Two rows deserve a warning, because they are the most commonly conflated pair in interviews. The **decode GEMV** rows describe the *linear* projections — the QKV and MLP GEMMs whose weight load is fixed at `2NK` bytes while the FLOPs scale with the batch. That is why AI ≈ batch and why batching is the lever. **Decode attention is a different story.** In decode, the query is one token attending over a KV cache of length N, so the score matrix is 1×N instead of N×N; the K/V stream dominates the bytes and the intensity collapses to roughly `1 / bytesPerElement` (≈0.5 in BF16) *regardless of batch size*. Batching raises decode attention's throughput linearly, but it does not move it out of the memory-bound regime — which is exactly why KV-cache management, quantisation and caching, not bigger batches, are the real decode levers.

### Why this matters for the CNN/transformer question

The roofline gives a *systems* answer to the architecture question, independent of any expressivity argument:

- **Convolution is compute-bound and kernel-optimised.** A `3×3` convolution is a small GEMM with high arithmetic intensity, and it has had fifteen years of kernel engineering behind it (implicit GEMM, Winograd, cuDNN, NPU instructions). It runs at a large fraction of peak.
- **Naive attention is memory-bound** because of the `N²` score matrix. It runs at a small fraction of peak unless you fuse it.
- **FlashAttention makes attention compute-bound** by keeping tiles in SRAM, and this is why attention is competitive at all.

So the systems answer to "why transformers?" is: **because FlashAttention (and its successors) moved attention from the memory-bound regime to the compute-bound regime, and because transformers are regular enough to be tensor-parallelised across many GPUs, which CNNs are not as naturally.** That is a complete and defensible answer, and it is the one that a systems-minded interviewer is looking for.

The interactive calculator in the web reader implements exactly this: change the sequence length, head dimension, batch size and hardware, and watch the arithmetic intensity cross the ridge point and the regime flip. It is the fastest way to build the intuition, because the numbers are surprising.

**What would change my mind:** The "memory wall governs everything" framing would be weakened if accelerator vendors shipped a memory technology that closed the compute/bandwidth ratio — e.g., wide on-package memory with near-HBM bandwidth and much higher peak compute, or a fundamentally different memory hierarchy. The ridge point would move left, memory-bound kernels would become compute-bound, and the whole optimisation calculus would invert. Nothing in the current roadmap (HBM3e, CXL, near-memory compute) does this; the ratio continues to worsen.
