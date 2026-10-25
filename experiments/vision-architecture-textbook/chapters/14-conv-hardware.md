## 14. Convolutions on real silicon

If attention is the poster child of compute-bound optimisation, convolution is the poster child of *everything that has been solved*. Understanding why convolutions are fast tells you what a hardware-friendly operation looks like, and that is the template for judging any new architecture.

### Convolution is a GEMM, and GEMMs are easy

A convolution can be rewritten as an explicit or implicit matrix multiply. Given an input of shape `(C_in, H, W)` and a `k×k` filter, the "im2col" trick unfolds the local patches into a matrix of shape `(C_in·k², H·W)` and multiplies by the flattened filter `(C_in·k², C_out)`. The resulting GEMM has:

```
FLOPs = 2 · C_out · C_in · k² · H · W
```

and it is *compute-bound* by construction — the arithmetic intensity of a GEMM scales with the matrix dimension, and for realistic convolution sizes it is well above the ridge point. That is the first reason convolutions are fast: **they are compute-bound, so they use the tensor cores efficiently.**

### The three tricks that matter

1. **Implicit GEMM.** You never actually materialise `im2col` (which would be enormous). Instead you *pretend* it exists and write a kernel that loads the right data into SRAM and does the GEMM directly. This is the single most important idea in convolutional kernel design, and it was the breakthrough that made cuDNN competitive. It means the same maths, no extra memory traffic, full tensor-core utilisation.
2. **Winograd / FFT convolution for small kernels.** `3×3` convolution can be computed with fewer multiplies using the Winograd transform (F(2×2, 3×3) needs 16 multiplies instead of 36 per 2×2 output). This is a *multiplicative* reduction, not just an IO reduction — it genuinely reduces FLOPs. It is used in cuDNN and in mobile kernels. The tradeoff is numerical stability and numerical precision, which is why it is used selectively.
3. **Depthwise convolution and channel grouping.** Mobile architectures exploit the fact that depthwise convolutions (`C_out = C_in = 1` filter per channel) are memory-bound rather than compute-bound, and that grouped convolutions reduce the arithmetic intensity. This is why **the FLOP count is a misleading metric on mobile** — a depthwise convolution has low FLOPs but is bandwidth-bound, so its latency is dominated by memory, not by the multiply count.

### The mobile/NPU story: why the FLOPs metric lies

This is the single most important systems lesson for vision, and it is the reason the field has a whole sub-literature on "FLOPs versus latency":

> **On mobile and edge hardware, achieved latency is determined by memory traffic, bank conflicts, and instruction issue — not by theoretical FLOPs.**

Evidence: RepViT-M1.0 achieves >80% ImageNet top-1 at 1.0 ms on an iPhone 12 — the first lightweight model to do so — while MobileNetV4-Conv-S, with *fewer* parameters and *fewer* GMACs, is *slower* on CPU in controlled benchmarks. The ranking flips because the two architectures have different memory access patterns and different arithmetic-intensity profiles, and the hardware is sensitive to those, not to the FLOP count.

The practical rule: **always measure latency on the target hardware.** FLOPs/MACs are a useful first-order proxy for server GPUs and a actively misleading one for mobile, NPUs and CPUs.

### Why mobile hardware favours convolution

Mobile and edge silicon (Apple Neural Engine, Qualcomm Hexagon, Google EdgeTPU, ARM NPU) are built around **fixed-function or heavily-specialised convolution engines**, because convolution was the dominant vision operation for a decade and the silicon was designed for it. A depthwise `3×3` convolution with stride 1 maps onto these engines extremely efficiently. Attention, by contrast, requires the generic matrix engine plus the softmax, plus the `N²` score matrix — none of which the mobile NPU is built for.

This is why the mobile vision literature is dominated by CNNs and CNN-hybrids (RepViT, MobileNetV4, EfficientViT, FastViT, MobileViT), and why RepViT's strategy — import the *structural* ideas of ViTs into a CNN — is the right one for that hardware. **The hardware dictates the arithmetic, and the arithmetic dictates the architecture.**

### The desktop/server story: why GPUs favour attention

Server GPUs are built around large matrix engines with high peak FLOPs and relatively lower bandwidth — which is exactly the profile that favours compute-bound, regular operations. Two properties of transformers map onto this well:

1. **Regularity.** Every attention layer has the same shape, which makes tensor parallelism straightforward: split the sequence or the heads across GPUs and each GPU does the same work on a shard. Convolutions have *hierarchical* shapes (different channel counts per stage), which makes them harder to shard evenly and gives poor load balance across GPUs.
2. **Fused-kernel friendliness.** The whole block — QKV projection, attention, output projection, FFN, normalisations — can be fused into a small number of large kernels. This minimises HBM traffic, which is the binding constraint.

This is why frontier models are transformers even where a CNN would be expressively adequate: **the transformer's regularity is what makes it deployable across thousands of accelerators.** It is a systems argument, and it is a strong one.

### The hybrid hardware case

The honest conclusion is that the hardware split is *not* clean:

- **Mobile / edge / NPU** → convolution-first, because the silicon is convolution-first.
- **Server GPU / TPU** → attention-first, because the silicon is matrix-first and attention is regular.
- **Video / long-sequence** → sparse or linear attention, because the quadratic cost binds.
- **Edge with long context** → SSM/hybrid, because neither convolution nor full attention fits.

And the *architecture* that wins is the one that matches its deployment hardware — which means the "why transformers?" question has a different answer depending on whether you are shipping to an iPhone or a data centre.

**What would change my mind:** The "mobile silicon is convolution-first, so CNNs win there" claim would be weakened if a mobile NPU shipped with a fast, generic attention instruction set (or a hardware attention unit) that made transformer blocks as efficient as convolution blocks. Apple's Neural Engine and Qualcomm's Hexagon have been adding more general matrix capability, and a decisive shift here would rewrite the mobile vision literature. Nothing public yet indicates that this has happened at the point where a pure ViT matches a RepViT on iPhone latency.
