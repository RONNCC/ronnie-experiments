# Part I — Lens 1: Inductive Bias

## 1. The priors, formally

Every architecture is an inductive bias: a set of assumptions about the data-generating process that are baked into the *structure* of the function class, before any data is seen. To compare CNNs and transformers you have to be precise about which priors are in play, because most of the disagreement in the literature is about priors that people have not actually separated.

### What a convolution assumes

A 2D convolution is a *shared stencil* applied at every spatial location. Writing a single filter as a weight tensor `W ∈ R^{k×k×C_in×C_out}`, the operation is

```
y[i, j] = sum_{a, b} W[a, b] · x[i + a, j + b]
```

That equation contains four separable assumptions, and they are worth naming individually because they fail independently:

1. **Locality.** The output at `(i, j)` depends only on a `k×k` neighbourhood. This is a claim that *nearby pixels are more informative than distant ones* — true for natural images, much less true for documents, video, or satellite imagery, and actively harmful for tasks like counting or spatial reasoning where the answer is a global property.
2. **Translation equivariance / weight sharing.** The same `W` is used everywhere. The model does not need to learn that an edge in the top-left is the same kind of thing as an edge in the bottom-right. This is the prior that makes CNNs sample-efficient: it acts as a hard constraint that reduces the number of free parameters per *distinct* pattern.
3. **Hierarchy through composition.** Stacking convolutions with stride-2 downsampling builds a receptive field that grows exponentially with depth, so a `ResNet-50` sees a large fraction of the image by layer 4. Hierarchy is not a free gift — it is a structural choice that the transformer must *learn* to approximate, or explicitly build in (Swin, PVT, hierarchical hybrids).
4. **Scale and shape invariance as an emergent property.** Pooling and increasing receptive field give the network a soft invariance to translation, and to some degree scale. This is why CNNs are robust to object position and size — and why they are *not* robust to occlusion, texture-vs-shape confusion, and other OOD shifts (Chapter 2).

### What a transformer assumes

The Vision Transformer (ViT) patchifies the image into a grid of non-overlapping patches, projects each patch to a token via a learned linear map, adds a positional embedding, and runs a standard transformer encoder. The assumptions:

1. **Permutation equivariance.** Attention treats the token sequence as a *set* with an ordering. `Attention(Q, K, V) = softmax(QKᵀ/√d)V` is invariant to the ordering of the input — the model must *learn* that spatial adjacency matters. This is the single most important difference, and it is why ViTs are data-hungry from scratch.
2. **Global mixing by default.** In a full bidirectional ViT, every token can attend to every other token in one layer. There is no notion of "receptive field grows with depth" — the receptive field is the whole image after layer one. This is the source of both the expressivity advantage and the optimization difficulty (Chapter 5).
3. **Locality is a *learned* prior.** The MLP layers are position-wise, so they are local and (with weight sharing across positions) translation-equivariant. The attention layers are global. This mix is subtle: a ViT is not "non-local", it is *locality-optional* — the model can choose to use attention for local or global mixing. Empirically, early layers do use attention in a locally-structured way, and the structure emerges rather than being imposed.
4. **The positional embedding is the only spatial prior.** This is the one piece of geometry that ViTs must get right, and it is where most of the recent innovation has happened (Chapter 4). A learned absolute positional embedding fixes the grid and cannot extrapolate to a different resolution; a relative or rotary embedding encodes relative position and can extrapolate. Getting this wrong is a common and quiet cause of poor dense-prediction performance.

### The taxonomy that resolves most arguments

Distinguish **hard** from **soft** inductive bias. A hard bias is a structural constraint (weight sharing in a convolution, the token grid in a ViT). A soft bias is a term in the objective that *encourages* a property without forcing it.

This distinction matters because the strongest recent result in this area is not "CNNs beat transformers" or vice versa, but that **you can add soft biases to a ViT that disappear when they are not needed**. ConViT (d'Ascoli et al., 2021) introduced "soft convolutional inductive biases": a convolution-like branch gated by a learned parameter that learns to switch off as data increases. The result is a model that behaves like a CNN in the low-data regime and like a ViT in the high-data regime — which is exactly the behaviour you would want if you believed that the optimal bias is data-dependent. ConViT, CoAtNet and MobileViT all explore this space; the conclusion across them is consistent: **hard CNN bias is a good prior for small data and a constraint at scale; soft bias is the best of both, at the cost of architectural complexity and latency.**

There is also a third option worth naming: **hard bias in the right place**. RepViT (Wang et al., CVPR 2024) took the *opposite* direction — it modernised MobileNetV3 by importing the structural lessons of efficient ViTs (separate token mixer and channel mixer, narrower expansion ratio, early convolutional stem) while keeping convolutions throughout. It beat lightweight ViTs on mobile hardware. That is the "great reverse migration" of Chapter 3, and it is the strongest single piece of evidence that the CNN/transformer divide is not a ladder of progress.

### The cost of each prior

Priors are not free; they are a debt paid at a specific point:

- A CNN's locality and equivariance debt is paid **at scale**, when the model could have used the extra freedom to learn long-range dependencies it never needed in the low-data regime. Empirically, that debt is small for classification and large for dense prediction and video.
- A ViT's "no locality" debt is paid **at the start**, in the small-data regime, where it must learn from scratch what a convolution gets for free.
- Both debts are *repayable* — CNNs can learn long-range dependencies given depth, and ViTs can learn locality given data — which is why the crossover happens and why the choice is a tradeoff rather than a verdict.

**What would change my mind:** If a ViT trained from scratch on ImageNet-1k (1.28M images, no pretraining) beat a matched CNN by a wide margin, the "CNN priors are necessary for small data" claim would be substantially weakened. That has not happened, and the failure is robust across dozens of architectures and hyperparameter settings, which is strong evidence that the mechanism is structural rather than tuning-related.
