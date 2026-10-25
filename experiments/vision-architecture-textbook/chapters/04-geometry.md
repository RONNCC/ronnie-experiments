## 4. Geometry, resolution, and the 2D structure of vision

There is a prior in the ViT that people forget to name, and it is the one that most often breaks in practice: **the assumption that the input is a flat, fixed-size token grid with a fixed aspect ratio.** The original ViT resizes every image to a square and patchifies on a fixed grid. That is not neutral. It discards aspect ratio (a 4:3 panoramic photo becomes a square), it discards resolution (a 4000×3000 image becomes 224×224), and it makes the positional embedding a hard constraint — the model has *seen* a specific grid, and generalising to a different one is an extrapolation it has not been trained for.

CNNs never had this problem. A convolution is scale-agnostic in the sense that it applies the same stencil at any resolution; downsampling is learned rather than fixed. When vision moved to tokens, it silently traded that flexibility for a fixed, batchable grid. Almost all of the resolution-related innovation since 2023 is the attempt to get that flexibility back.

### The hierarchy that CNNs had for free

CNNs are hierarchical by construction: each stage downsamples by 2, so a ResNet-50 has a receptive field covering most of a 224² image by stage 4. Transformers are flat: a ViT-Base processes 197 tokens in one stack with no downsampling, and every layer sees the same token count. This is not a small difference. It means:

- A ViT has no built-in notion of "coarse to fine", which is the dominant structure in dense prediction (segmentation, detection, depth).
- A ViT's FLOPs scale *quadratically* with resolution, because the token count scales with resolution squared. A CNN's FLOPs scale linearly with pixel count at fixed channel width.
- A ViT cannot take advantage of the fact that most of the information in an image is redundant at high resolution.

Hierarchical ViTs (Swin, PVT, MViT) fix this by introducing windowed attention and downsampling. They were dominant for a few years, and they are still common in dense prediction. But the modern view is that **hierarchy is a systems choice, not an expressivity requirement**: NaViT showed that a flat ViT with packing can beat a hierarchical one at equal compute, because the flat model can allocate its tokens more flexibly. The tradeoff is memory: a flat ViT at high resolution has a huge token count, and quadratic attention becomes the binding constraint (Chapter 12).

### NaViT: packing to get variable resolution

NaViT (Dehghani et al., 2023, "Patch n' Pack") is the pivotal paper here, and it is worth understanding precisely because it changed how every frontier vision model handles input. The idea is to borrow *sequence packing* from language models: take multiple images of arbitrary aspect ratio and resolution, patchify each at native resolution, and concatenate their tokens into a single sequence. Three architectural changes are required:

1. **Masked attention and masked pooling.** Tokens from different images must not attend to each other, and the CLS/pooling must be per-image. This is a block-diagonal attention pattern — and it is exactly what FlashAttention can express with a block mask, so the systems cost is low.
2. **Factorized / fractional positional embeddings.** A learned 2D positional table indexed by `(x, y)` patch coordinates is replaced by embeddings of the `x` and `y` coordinates summed together, so the model can interpolate to unseen grids.
3. **Resolution sampling and token dropping.** Because you control the sequence length, you can sample resolutions during training — mix 64px and 512px images — and pack them efficiently, with less than 2% padding.

The payoff is large and it is *not* just accuracy. At a fixed compute budget, NaViT matches a ViT that uses 4× the compute, because it processes ~5× more images during training. Variable-resolution training beats fixed-resolution training *even at the fixed resolution's own evaluation size*. And a single NaViT checkpoint can be evaluated at many resolutions, giving a smooth cost-quality tradeoff at inference.

NaViT's descendants are now standard: **FlexiViT** (random patch size per step), **Pix2Struct** (aspect-ratio-preserving patching for documents), **NaFlex** in SigLIP 2 (native aspect ratio plus variable sequence length, shipped as the default for open VLMs), **LLaVA-NeXT's AnyRes** (tiled high-resolution inputs for VLMs), and **Qwen2-VL's M-RoPE** (which drops absolute positional tables entirely). DINOv3 adds axial RoPE with box jittering.

### Positional encodings: the quiet third rail

Positional encodings are the least-discussed and most-consequential architectural choice in vision transformers. The options are:

| Encoding | What it assumes | Failure mode |
|---|---|---|
| Learned absolute | A fixed grid of a fixed size | Cannot extrapolate to new resolutions/aspect ratios; must be interpolated (bilinearly, with quality loss) |
| Sinusoidal | Periodicity, no scale | Poor transfer, weak extrapolation |
| Relative / shifted | Only *relative* position matters | Better transfer, more parameters, breaks with packing |
| 2D RoPE (axial) | Position is a rotation applied in head subspaces | Needs care for non-square grids; DINOv3 adds jittering for robustness |
| M-RoPE (tiling) | Position has 2D + temporal + ... structure | Very flexible; used by Qwen2-VL/3-VL |

The practical rule: **if your model must handle variable resolution or aspect ratio, you cannot use a fixed learned absolute table.** You need a relative or rotary scheme, and you need to have trained on a distribution of grids. This is a systems constraint (the packing machinery) and an inductive-bias constraint (what the model assumes about space) simultaneously.

### Why "2D" matters more than it looks

The deepest point here is that vision is *not* a sequence. It is a 2D signal with a semantic structure that is roughly scale-invariant, translation-covariant and compositional. A CNN encodes that structure in its stencils. A ViT encodes it in its positional encoding and then has to *learn* the rest. The fact that most of the recent progress has come from making the token grid more flexible — packing, rotary encodings, tiling — rather than from making attention better, is evidence that **the 2D structure was the binding constraint, not the mixing operation.**

This is a strong interview claim, and it is defensible: the two biggest vision-architecture wins of the last three years (NaViT-style packing and 2D rotary encodings) are both *geometry* wins, not *attention* wins. The mixing operation was already good enough.

**What would change my mind:** The claim "geometry was the binding constraint" would be weakened if a model with a fixed, square, absolute-positional-embedding input matched a NaViT-style variable-resolution model on a task where resolution genuinely matters — e.g., fine-grained document understanding or high-resolution remote sensing — at equal compute. The current evidence is the opposite: variable-resolution training wins even when evaluated at a fixed resolution, which points to the training distribution of grids rather than to the evaluation resolution as the mechanism.
