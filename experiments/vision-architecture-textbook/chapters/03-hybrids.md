## 3. Hybrids, soft biases, and the great reverse migration

If the previous chapter is a verdict, this one is the history of the appeals. The field has repeatedly tried to combine the two architectures, and the pattern of what worked — and what did not — is more informative than any single paper.

### Soft biases: get the CNN behaviour without the CNN constraint

ConViT (2021) is the cleanest statement of the idea: add a convolution-like branch to a ViT, but gate it with a learnable parameter so the model can switch the prior off. The result is a ViT that is a CNN when data is scarce and a transformer when data is plentiful. CoAtNet merged convolution and attention in a single block; MobileViT put lightweight attention inside a MobileNet-style body; CvT and the "tokenmerge" family compressed attention cost.

The consistent finding across all of them is that **soft bias works, but the gain is modest once data is abundant.** The CNN branch is paid for in latency, parameters and architectural complexity, and it buys sample efficiency — which is only valuable if you are data-limited. This is why hybrids dominate the *mobile* and *small-data* literature and are rare in the *frontier-scale* literature, where the data is not the constraint.

### Early convolutions: the cheapest possible bias

If you want the locality prior without the cost of a full hybrid, there is a cheaper option: put a couple of convolutions in the *stem*. The original ViT used a single stride-16 convolution as its patch embedding — effectively no locality, and a hard 16× downsample that throws away sub-patch structure. Trockman and Kolter (2022) showed that replacing the patchify stem with a few small convolutions (`3×3` → `3×3`, stride 2) improves optimization stability *and* performance, especially for small models, with essentially no downside at scale. RepViT adopted exactly this ("early convolutions as stem") and credited it with both stability and latency.

This is a good interview nugget because it is a *structural* claim about where locality matters: locality is most valuable at the input, where the raw signal is high-dimensional and the model has not yet learned a useful representation. By the later layers, attention has learned enough structure that an explicit convolution adds less.

### MetaFormer: the ViT idea that survived the ViT

The most consequential theoretical result about transformers for vision is arguably not about attention at all. The **MetaFormer** framing (Yu et al., 2022) argues that the effectiveness of a transformer block comes from the *generic* structure — a token mixer (any spatial mixing operation) followed by a channel mixer (an MLP) with a normalisation and a residual — and **not** from attention specifically. They demonstrated that replacing attention with random mixing, or with other token mixers, leaves performance largely intact.

This is a powerful result because it *generalises the transformer's insight into a design template that CNNs can adopt*. RepViT is the direct application: a MobileNetV3 block restructured as `depthwise-conv (token mixer) → 1×1 expansion → GELU → 1×1 projection (channel mixer) → residual`, with the expansion ratio reduced from 4 to 2 and width increased. The result beat lightweight ViTs on iPhone latency. RepNeXt and MobileNetV4's Universal Inverted Bottleneck (UIB) — which explicitly unifies the Inverted Bottleneck, ConvNeXt block and FFN into one searchable block — are the same idea at different scales.

The lesson: **the transformer's contribution to vision was partly "attention" and partly "the block structure".** The block structure was portable; attention was not always necessary. That is why the frontier contains both pure ViTs at 7B parameters and pure CNNs at sub-millisecond mobile latency, and why the question "why not a CNN?" is a question about *which part* of the transformer you need.

### Registers: the ViT's own locality bug

The most striking *failure* of the pure ViT inductive bias is the **register** phenomenon. Darcet et al. (ICLR 2024) observed that trained ViTs develop high-norm "artifact" tokens — about 2% of the sequence, concentrated in low-information background regions — which the model repurposes as scratch space for global computation. These tokens produce noisy attention maps and degrade dense prediction.

The fix is embarrassingly simple: add a handful of learnable tokens (4–8) after the patch embedding and discard them at the output. They give the model a legitimate place to put global scratch work, and the artifacts disappear, dense features improve, and object discovery gets a large boost. The follow-up work is instructive:

- **Test-time registers** (2025) found that the high-norm activations concentrate on a sparse set of neurons, and that shifting them into an untrained token *after* training reproduces most of the benefit — i.e., the problem is not the training, it is the architecture's lack of a designated scratch space.
- **"Vision Transformers need more than registers"** (2026) argues the deeper cause is *lazy aggregation*: the CLS token learns to pool global semantics from the many background patches, because they dominate. Moving the scratch space does not fix the *behaviour*. Their fix is frequency-aware channel-wise aggregation that selects stable, foreground-relevant patches.

The register story is a complete miniature of this whole book. It is an inductive-bias story (the ViT has no designated place for global computation), an optimization story (the model exploits the structure it is given), and a systems story (the fix costs tokens). It is also a caution against the "architectures are neutral" view: the *absence* of a structural element can create a behaviour that no amount of regularisation fixes cleanly.

### The reverse migration

The strongest evidence that the CNN/transformer divide is not a progress ladder is that **the field has been re-importing ViT ideas into CNNs for five years**:

- ConvNeXt (2022) modernised ResNet-50 with ViT-style block design (inverted bottleneck, GELU, LayerNorm, large kernel depthwise, fewer activations) and matched or beat Swin at lower FLOPs.
- RepViT (2024) modernised MobileNetV3 with the MetaFormer split and beat lightweight ViTs on mobile.
- MobileNetV4 (2024) unified the inverted bottleneck, ConvNeXt block and FFN into one Universal Inverted Bottleneck search space.
- ConvNeXt V2 (2023) added Global Response Normalization and a fully convolutional masked autoencoder, and reached 88.9% ImageNet-1K with public data only.

This is not nostalgia. It is the correct response to a tradeoff: if the transformer's win is *partly* a block-structure win, then you can take the block structure and keep the convolution, and you get the advantages of both at the cost of the transformer's global mixing. Whether that is the right trade depends on whether your task needs arbitrary long-range dependencies — which is again the inductive-bias question.

### Hybrids at the frontier

At the largest scales the trend is *not* pure attention. **MambaVision** (CVPR 2025) is a hybrid: a hierarchical Mamba backbone with self-attention added in the final layers, where downsampling has made the token count small enough for exact attention to be affordable. The ratio is roughly 9:1 Mamba-to-attention, and hybrids outperform both pure architectures in several settings. Video DiTs use sliding/tile attention and selective attention rather than full attention (Chapter 19). And in language, the hybrid Mamba-Transformer is the dominant architecture for long context (Chapter 11).

The pattern is the same one ConViT discovered in 2021, now at trillion-dollar scale: **attention is the most expensive and most expressive operation, so you use it where you can afford it and substitute a cheaper, structurally-biased operation where you cannot.**

**What would change my mind:** The "block structure is the real contribution" claim would be substantially weakened if a pure-CNN block with an identical parameter count, FLOP budget and training recipe matched a ViT on a task requiring *arbitrary* long-range composition at large scale — not a fixed-receptive-field task, but one where the relevant dependency length is unbounded. The evidence so far says CNNs with large kernels and deep stacks can approximate long-range mixing but pay in parameters or depth, which is exactly the tradeoff this chapter describes.
