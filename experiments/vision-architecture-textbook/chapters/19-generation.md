## 19. Generation: diffusion transformers and video

Vision generation is where the architecture question has the *least* settled answer and the *most* interesting systems work, because the objective is different (sample quality, not prediction accuracy) and the compute profile is different (long sequences, many denoising steps, autoregressive-over-time).

### Diffusion, in one paragraph

A diffusion model learns to reverse a noise-adding process: train on pairs `(x₀, noise)` by predicting the noise (or the clean sample), then sample by iteratively denoising. The appeal is that the objective is a simple regression on data, it scales well, and it produces high-quality samples. The cost is that you must run the network *many times* (20–50 steps) to generate one sample, which makes the per-step efficiency of the network the dominant cost.

Diffusion was originally formulated with U-Nets — CNNs with skip connections, which are a natural fit for the multi-scale structure of denoising. The shift to transformers happened because of scale: **DiT (Diffusion Transformer)** patchified the latent and used a transformer, and it showed that a transformer trained on enough data with a good guidance recipe could match or beat U-Nets — and, crucially, that quality scales with model size in a predictable way.

### Why the transformer won generation

Three reasons, and they are worth separating because they generalise:

1. **Scalability.** DiT's paper showed a clean scaling law: sample quality improves predictably with model size, and a larger transformer beats a smaller one. The U-Net's scaling behaviour was less clean, partly because its architecture was hand-designed for a fixed resolution regime.
2. **Unified modalities.** The same transformer block can condition on text, an image, a video, a 3D point cloud, or an action. A U-Net cannot. This is the same "common currency" argument as VLMs (Chapter 18), and it is why the frontier is moving to unified DiTs — HunyuanVideo 1.5's "Unified DiT" supports text-to-video *and* image-to-video in one backbone, and Wan covers eight downstream tasks from one model family.
3. **Flexible sequence lengths.** Packing and variable resolution (Chapter 4) apply directly to generation, where you want to train on a mixture of resolutions and durations.

### The latent-space trick, and why it matters for systems

Generation is done in **latent space**, not pixel space. A VAE compresses the image (typically 8× spatially, ~500× in total pixels) or the video (HunyuanVideo 1.5: 16× spatial, 4× temporal), and the DiT operates on the compressed latents. This is a systems decision of the first order:

- It reduces the token count by ~10–50×, which makes the transformer's quadratic cost tractable.
- It allows the VAE to do the expensive per-pixel reconstruction once, at the end.
- It means the DiT's token budget is a *compression-ratio* decision, not a resolution decision.

The causal 3D VAE in video models is a particularly interesting piece of engineering: it must be causal along time so that a video can be generated frame-by-frame and cached, and it must preserve temporal consistency. Getting this wrong produces temporal flicker and sliding objects.

### Video: where the quadratic cost bites

Video is the stress test for every architectural choice in this book:

- A 720p, 121-frame clip at patch 16 is on the order of **10⁵–10⁶ tokens**. Full attention over that is impossible.
- The token budget forces either compression (VAE), sparsity (tile/sliding attention), or linear-time models.

The state of the art shows all three:

- **HunyuanVideo 1.5** (8.3B parameters): a Unified DiT with dual-stream blocks, plus **SSTA (Selective and Sliding Tile Attention)**, which prunes redundant spatiotemporal KV blocks. It reports a 1.87× end-to-end speedup over FlashAttention-3 on 10-second 720p, runs 720p 121-frame generation in 13.6 GB peak memory, and ships a separate super-resolution network to reach 1080p. The architecture *is* the systems story.
- **Wan 2.1/2.2** (Alibaba): 1.3B and 14B dense models, plus a 27B MoE (14B active). It covers T2V, I2V, and instruction-guided editing from one family.
- **Cosmos, Sora-class models**: the same recipe at larger scale.

### Sparse and tile attention in practice

SSTA is representative of a broader trend: **attention sparsity as a first-class architectural primitive.** The idea is that in video, most KV pairs are redundant — adjacent frames share most of their content, and distant frames are rarely both relevant to a given query. Pruning redundant blocks is a *content-aware* sparsity decision, not a fixed pattern, and it is exactly the kind of thing that a fixed-window CNN does unconditionally and a dense transformer does never.

The tradeoff is the one you would predict: **sparsity saves compute but loses the ability to attend to anything outside the selected set.** If the model needs to remember a detail from the first frame while generating the last, sparse attention must have kept it. This is the same associative-recall tradeoff from Chapter 10, now in a generation setting.

### Autoregressive generation as an alternative

There is a competing line: generate images/video autoregressively, token by token, as a language model does. This has the advantage of a well-understood training objective and the ability to use RL post-training and long-context reasoning. It has the disadvantage that the number of tokens to generate is enormous (a 1024×1024 image at patch 16 is 4096 tokens, and video is far worse), and that autoregressive error accumulation is a real problem. **RLVR-World** (2025) is a notable attempt to bring verifiable-reward RL to world models, arguing that MLE is misaligned with the actual metric (transition prediction accuracy). The field has not converged: diffusion dominates for image and video quality, autoregressive dominates for reasoning-like generation and for unified multimodal models.

### What this means for the architecture question

Generation is the counterexample to the "CNNs are dead" narrative in a subtle way: **the VAE is a CNN**, and it is essential. The DiT is a transformer, but it operates on a convolutionally-compressed latent. The best systems are *both*, and the split is exactly the split this book has been describing — convolution where the arithmetic is cheap and the structure is local (compression, reconstruction), transformer where the sequence is long and the structure is global (denoising, conditioning, multimodal fusion).

**What would change my mind:** The "diffusion plus transformer is the right recipe for video" claim would be weakened by an autoregressive video model that matched diffusion on quality *and* was cheaper at generation, or by a linear-time diffusion model that matched full attention at the same token count. Both are active research areas; neither has produced a decisive result as of late 2025.
