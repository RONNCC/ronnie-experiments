## 13. Attention kernels on real silicon

The previous chapter said FlashAttention moves attention into the compute-bound regime. This chapter explains *how*, because the mechanism is the template for almost every systems innovation in the field.

### What naive attention does wrong

Standard attention, written naively, computes three things in sequence:

```
S = QKᵀ / √d        # N x N score matrix
P = softmax(S)      # N x N probability matrix
O = PV              # N x d output
```

The problem is not the maths. It is that `S` and `P` are `N × N` matrices that must be written to HBM and read back, once for the forward pass and again (or recomputed) for the backward pass. For `N = 8192` and `d = 128`, the score matrix is 256 MB in BF16 — and you are shuffling it between slow HBM and fast SRAM several times per layer.

The FLOPs are `4N²d` and the bytes are `O(N²)`, giving an arithmetic intensity of about `d ≈ 128`. On an H100 with a ridge at 295, that is *below* the ridge — attention is memory-bound, and the tensor cores are idle while the memory controller works.

### FlashAttention: fuse, tile, recompute

FlashAttention restructures the computation so that the `N × N` matrices are **never materialised in HBM**. It does three things:

1. **Tiling.** Process the sequence in blocks of `B_r` query rows and `B_c` key columns that fit in SRAM. Load a tile of `Q`, a tile of `K`, and a tile of `V` into fast memory, compute the partial attention for that tile, and accumulate.
2. **Fusion.** Fuse the `QKᵀ`, softmax and `PV` steps into a single kernel so the intermediate matrices only exist in registers/SRAM, never in HBM.
3. **Online softmax.** The normalisation cannot be computed until all keys have been seen — but you are processing tiles sequentially. The trick is to keep a running maximum and running sum, and rescale the accumulated output as you go:

```
m_i = max(m_{i-1}, max_j(s_ij))
l_i = ∑_j exp(s_ij - m_i)          # running denominator
O_i = ∑_j exp(s_ij - m_i) v_j / l_i
```

This gives the *exact* same result as standard attention (up to floating-point rounding) while never materialising `P`.

The IO complexity drops from `O(N²)` to `O(N²d²/M)` where `M` is the SRAM size. For typical `d` and `M`, that is many times fewer HBM accesses — up to 9× in the original paper. The arithmetic intensity rises from ~`d` to ~`N`, which is *far* above the ridge, so attention becomes compute-bound and approaches peak tensor-core throughput.

**The key conceptual point:** FlashAttention does not change the FLOPs. It changes the *bytes*. It is an algorithmic optimisation of the memory hierarchy, and it is the clearest example in the field of "a smarter algorithm beats a faster chip."

### The successors, and what each fixed

- **FlashAttention-2** — better parallelism and work partitioning, less non-matmul FLOPs (the softmax and the elementwise scaling are moved off the critical path). ~2× faster than v1.
- **FlashAttention-3** — exploits the Hopper architecture specifically: FP32 accumulate in the tensor cores, WGMMA instructions, TMA for asynchronous data movement, and fusion of the softmax into the second GEMM. Targets 70–90% of H100 peak in the forward pass.
- **SDPA / `scaled_dot_product_attention`** — the PyTorch-level API that dispatches to the best available kernel (Flash, Mem-efficient, Math) based on shape. This matters because it means *the optimisation is now a library problem, not a model problem* — you get FlashAttention for free if you use the right op.
- **Block-sparse / sliding-window / tile attention** — used in video DiTs (HunyuanVideo 1.5's SSTA prunes redundant spatiotemporal KV blocks for a 1.87× speedup over FA3 on 10-second 720p), in long-context LLMs, and in hybrids. These are *sparsity* optimisations: they exploit the fact that attention is often not needed everywhere.

### The hidden trap: the backward pass and recomputation

Forward-pass attention is now well optimised. The backward pass is harder, because gradients require the softmax Jacobian, and the standard solution is to **recompute** the forward activations rather than store them. Recomputation trades FLOPs for memory — which, given that we are in a memory-bound regime, is usually the right trade. This is the same logic as activation checkpointing in deep networks: **spend compute to avoid memory traffic.**

### Attention on TPUs and other accelerators

The same principle applies everywhere: keep data in on-chip memory, fuse elementwise ops, and use the accelerator's matrix unit for the GEMMs. TPUs do this with their own tile/fractal layouts; NPUs and mobile DSPs do it with fixed-function convolution engines. The *reason* convolutions are fast on a mobile NPU and attention is fast on a GPU is that each hardware family has optimised for the operation that its arithmetic-intensity profile favours.

### What this means for the architecture question

Two consequences, and they are both important:

1. **"Attention is too expensive" is now largely a solved systems problem at moderate sequence lengths.** With FlashAttention, attention's *cost* is not the reason to avoid transformers. The remaining cost is the *quadratic growth* with sequence length, which is why long context and high resolution still need sparse, linear or hybrid alternatives.
2. **"Convolutions are faster" is a hardware-dependent claim.** On a GPU with a mature cuDNN stack, a well-tuned convolution is extremely fast. On a tensor-core-optimised machine with a good attention kernel, attention can be comparable. The right comparison is *achieved* throughput on the specific hardware for the specific shapes, not theoretical FLOPs.

**What would change my mind:** The "attention is now compute-bound" claim would be weakened if measurements showed that the best attention kernels on current hardware still run far below the roofline at realistic sequence lengths and batch sizes. The evidence is that FA3 reaches 70–90% of H100 peak in the forward pass at large shapes, which supports the claim — but the *decode* regime (small batch, long KV cache) remains memory-bound, and that is where the claim is weakest. The honest statement is "forward attention is compute-bound at large batch; decode attention is memory-bound."
