# Vision Models & ML Architecture — A Four-Lens Field Guide

*Research edition · 25 October 2026 · A Ronnie's Experiments learning sandbox*

## Contents

**Orientation**
- [0. How to read this book](#chapter-0)

**Part I — Lens 1: Inductive Bias**
- [1. The priors, formally](#chapter-1)
- [2. The empirical verdict: when inductive bias helps and when it hurts](#chapter-2)
- [3. Hybrids, soft biases, and the great reverse migration](#chapter-3)
- [4. Geometry, resolution, and the 2D structure of vision](#chapter-4)

**Part II — Lens 2: Optimization**
- [5. Optimization dynamics: norms, recipes, and instability](#chapter-5)
- [6. Scaling: laws, data curation, and self-supervision](#chapter-6)
- [7. Post-training: from SFT to RLVR and on-policy distillation](#chapter-7)

**Part III — Lens 3: Expressivity**
- [8. What attention can compute](#chapter-8)
- [9. Rank collapse, signal propagation, and the depth/width trade](#chapter-9)
- [10. Memory, association, and the token budget](#chapter-10)
- [11. Beyond softmax: SSMs, linear attention, and hybrids](#chapter-11)

**Part IV — Lens 4: Systems**
- [12. The roofline and the memory wall](#chapter-12)
- [13. Attention kernels on real silicon](#chapter-13)
- [14. Convolutions on real silicon](#chapter-14)
- [15. ViT versus CNN in production: parallelism, quantization, and inference](#chapter-15)

**Part V — The State of the Art**
- [16. The backbone landscape (2025–2026)](#chapter-16)
- [17. Dense prediction and segmentation](#chapter-17)
- [18. Vision-language and unified models](#chapter-18)
- [19. Generation: diffusion transformers and video](#chapter-19)
- [20. Inside the labs: Anthropic and Thinking Machines through the four lenses](#chapter-20)

**Part VI — Interview Preparation**
- [21. Interview drills: the one-page model and 40 questions](#chapter-21)
- [22. Sources and further reading](#chapter-22)

[Open the interactive web reader](index.html) · This single-file edition is generated as `TEXTBOOK.md` from the canonical chapters.

> **Scope and provenance.** This is an original synthesis of public research, written to prepare for technical interviews at frontier AI labs. It is not a transcript of any company's internal material, it does not describe non-public systems, and it makes no claim about any specific lab's production stack. Where a paper is cited, the link is given in Chapter 22 so you can read the primary source. Benchmark numbers are quoted as reported by their authors, on their own protocols — they are not independently re-run here, and small differences in recipe (patch size, resolution, data mix, epoch count) can move results by more than the differences being discussed.

<div id="chapter-0"></div>

## 0. How to read this book

The question you were asked is the right one, and it is usually answered badly. *"Why do we use transformers instead of CNNs?"* gets answered with a slogan — "transformers are better" — which is false in half the regimes you will actually be asked about. The honest answer is that **architecture is a set of tradeoffs across four independent dimensions**, and the right choice depends on which dimension is binding in your specific situation.

This book organises everything around the four lenses you supplied:

| Lens | Core question | The one-sentence answer |
|---|---|---|
| **1. Inductive bias** | What priors are baked in? | CNNs bake in locality, translation equivariance and hierarchy; ViTs bake in global mixing and a flat token grid. Strong bias is free regularisation and a small-data advantage; weak bias is a larger ceiling once data is plentiful. |
| **2. Optimization** | How well does it train? | CNNs train with SGD/BN and converge fast from scratch; ViTs need AdamW, long schedules, strong augmentation and warmup. Both are solved problems now — the gap closed by *recipes*, not architecture. |
| **3. Expressivity** | What can it represent? | Attention is a universal, permutation-equivariant sequence mixer, but it collapses rank with depth and pays quadratic cost. CNNs are a constrained but efficient function class. Neither dominates in theory; both are fine in practice at scale. |
| **4. Systems** | How does it map to hardware? | Attention is memory-bound unless you use FlashAttention; convolution is compute-bound and kernel-optimised. ViTs are regular, parallel and tensor-parallel friendly; CNNs win on mobile and at small batch. |

Everything else in this book is the evidence behind those four sentences.

### The framing that makes this useful in an interview

There are two ways to talk about architecture in an interview, and one of them sinks you:

- **The trivia way:** "ViT has self-attention and CNNs have convolutions." This is a description, not an analysis. It tells the interviewer nothing they don't already know and invites the follow-up *"so why did ViT win?"* — which you will then be unable to answer at depth.
- **The tradeoff way:** "The choice between them is a tradeoff between sample efficiency and capacity ceiling, mediated by data scale, and then re-mediated by systems constraints." This is a position. It can be argued with, tested, and — crucially — it is *falsifiable*, which is what interviewers at research labs are actually listening for.

When you are asked a architecture question, do three things in order: **name the tradeoff, name the regime where each side wins, then name the mechanism that explains the crossover.** That sequence is the spine of this book and the spine of Chapter 21's drills.

### Why the four lenses, specifically

These four lenses are not arbitrary. They are the four places where an architecture decision can *fail*:

1. **Inductive bias** is where you fail by being too rigid — a CNN that cannot represent a long-range dependency, or a model whose prior is wrong for the domain (medical imaging, satellite imagery, document understanding).
2. **Optimization** is where you fail by being unable to train what you designed — a beautifully expressive architecture that never converges, or that needs 10× the compute for the same accuracy.
3. **Expressivity** is where you fail by being unable to represent the function — this is the pure theory question, and it is the one interviewers probe with "can a transformer do X?" questions.
4. **Systems** is where you fail in production — a model that is theoretically superior and 3× slower, or that cannot be batched, quantised, or sharded.

A good architecture answer touches all four and identifies which one is binding. A bad answer treats them as one thing.

### How the chapters are built

Each chapter is written to be read in one sitting and to leave you with a claim you can defend. Every chapter ends with a short **"What would change my mind"** note: the experiment or observation that would falsify its central claim. That is deliberate. Research interviews are not memory tests; they are tests of whether you can reason about evidence. Being able to say *"this claim would be wrong if X were true"* is more valuable than being able to recite ten papers.

Chapters 1–4 are Lens 1. Chapters 5–7 are Lens 2. Chapters 8–11 are Lens 3. Chapters 12–15 are Lens 4. Chapters 16–20 map the actual state of the art as of late 2025–2026. Chapter 21 is the interview drill. Chapter 22 is the annotated source list.

The interactive lab on the web reader is not decoration. It implements the two calculations that most often decide these debates in practice: **the roofline/attention-cost calculator** (Lens 4) and **the backbone recommender** (Lens 1 × Lens 4). Changing the assumptions there and watching the recommendation flip is the fastest way to build the intuition that the whole book is arguing for: there is no dominant architecture, only dominant architectures *for a constraint set*.

### A note on the labs you are interviewing with

You mentioned Anthropic and Thinking Machines. Both are worth studying not because they publish their architectures — they do not, in detail — but because their *public research* reveals what they optimise for. Anthropic's interpretability work (Chapter 20) treats the internal geometry of a transformer as the primary object of study, which tells you something about how they think about capability. Thinking Machines' on-policy distillation work (Chapter 7) is a bet that *post-training signal density* matters more than pre-training scale, which is a claim about optimization economics. Neither is a vision-architecture paper. Both are the kind of argument you should be able to make, in any modality, on any architecture.

**What would change my mind:** If a single architecture family dominated across all four lenses simultaneously — small data *and* large data, mobile *and* server, dense prediction *and* generation — then this book's central claim would be wrong and the question "why transformers?" would have a clean answer. That has not happened. The strongest current evidence that it will not is that the frontier keeps re-introducing convolutions (RepViT, MobileNetV4, ConvNeXt) *after* the transformer won the benchmark wars.

# Part I — Lens 1: Inductive Bias

<div id="chapter-1"></div>

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

<div id="chapter-2"></div>

## 2. The empirical verdict: when inductive bias helps and when it hurts

Theoretical priors settle nothing on their own. What settles it is a consistent, replicated pattern of empirical results, and that pattern is now clear enough to state as a law of the field.

### The data-scale crossover

The original ViT paper made the finding that still governs this entire debate: **a ViT trained from scratch on ImageNet-1k underperforms a comparably sized ResNet; a ViT pretrained on ImageNet-21k or JFT-300M beats it by a wide margin.** The gap is not marginal — on ImageNet-1k a ViT-Base sits several points behind ResNet-50, while after large-scale pretraining it surpasses every CNN of its era.

That result has been replicated and refined many times, and the general shape is stable:

| Regime | Winner | Mechanism |
|---|---|---|
| From scratch, ~1M images | CNN (ResNet, MobileNet) | Locality + equivariance act as regularisation; the model cannot afford to learn them |
| From scratch, ~10–30M images | Approaching parity | The prior is "paid for" out of the data budget |
| Pretrained at 100M–1B+ images | ViT (or a ViT-like hybrid) | Weak bias buys a higher capacity ceiling; global mixing is worth the training cost |
| Fine-tuning a foundation model on a small task-specific set | Depends on backbone, not on new architecture | The backbone's prior has already been learned; the question is whether the head can adapt |

The reason this is not a mere engineering detail: the crossover is **not a function of parameter count**. A ViT-Base and a ResNet-50 have similar parameter counts; the ViT is worse at small data and better at large data at *the same size*. That is the signature of an inductive-bias effect, not a capacity effect.

### Shape bias: the CNN tells you what it thinks an object is

The sharpest behavioural signature of the CNN prior is **shape-vs-texture bias**. Geirhos et al. (2019) showed that ImageNet-trained ResNets classify by *texture* — they will call a texture-swapped object the same class — while humans classify by *shape*. This is a direct consequence of the local, texture-oriented receptive field: a ResNet's early layers are essentially a texture dictionary.

ViTs trained at scale are markedly more shape-biased, and their errors are more human-like in a variety of error-consistency metrics. This is not merely a benchmark curiosity. It is the mechanism behind a family of results that matter a great deal in practice:

- **Corruption robustness.** ViTs are substantially more robust to common image corruptions (noise, blur, contrast, weather) than CNNs and MLP-Mixers of comparable accuracy, measured by mean corruption error (mCE) on ImageNet-C. A tiny DeiT-Tiny beats far larger CNNs on this metric. This tracks shape bias: a model that keys on global structure is less disrupted by local texture corruption.
- **Occlusion and adversarial robustness.** ViTs degrade more gracefully under occlusion, and are robust to high-frequency noise that defeats CNNs. The causal story is that attention redistributes information globally, so losing a patch does not destroy a feature.
- **Domain transfer.** When the data distribution shifts — medical images, satellite imagery, OCR — the weakly-biased ViT often generalises better *because its prior is not wrong about the new domain*. A CNN's texture bias is a prior tuned to natural-image statistics; a ViT has no such commitment.

The counterpoint is important and often omitted: **shape bias is not automatically desirable.** In texture-discriminating tasks (material classification, surface defect detection, some medical imaging) a CNN's texture bias is the *correct* prior, and ViTs can be worse. "ViTs are more human-like" is a claim about ImageNet-style classification, not a universal truth.

### The Nature Communications result: architecture is not the main variable

A 2024 study (Borsoi et al., *Nature Communications*) compared 34 CNNs and 21 transformers — 224 models total, 1.8 billion regressions — all trained on ImageNet-1k with the same classification objective, and measured their ability to predict human visual cortex responses. The headline finding is a striking null result: **CNNs and transformers achieve essentially equal brain predictivity** (`r ≈ 0.67` vs `0.66`). What mattered far more was the *training diet* — the objective and the data mixture. Models trained with different objectives (contrastive vs. vision-language alignment) differed far more in brain alignment than models with different architectures.

Read this carefully, because it is easy to misuse. It does *not* say architecture is irrelevant. It says that once you control for training objective and data, the architectural divide explains less of the representational variance than people assume — at least for the property of "predicting human cortex responses." That is a specific and testable claim, and it is a good example of the kind of careful, qualified result you should be able to cite in an interview. It also cautions against the common sloppy inference "ViTs are more brain-like, therefore better."

### The small-data and few-shot regimes

The crossover law has a corollary that shows up constantly in applied interviews: **when data is scarce, the CNN prior is worth more than the ViT's capacity.** Controlled studies on few-shot rigid-transformation and fundamental-matrix estimation found that ViTs outperform CNNs during refinement when downstream data is large, but that CNNs match or beat ViTs in small-data regimes, and that ViTs generalise better under distribution shift. Digital pathology studies found ViTs performed *on par* with ResNet-18 while requiring more effort to train. Face presentation-attack detection found a pretrained DeiT-S far better on unseen demographic groups while a ResNet-18 was better on seen groups — again, a distribution-shift story.

The consistent story across these very different tasks is:

- **Small data → prior wins.** Locality and equivariance are regularisation you do not have to pay for with data.
- **Large data → capacity wins.** Weak bias buys a higher ceiling, and the data pays for the freedom.
- **Distribution shift → weak bias wins, usually.** A prior tuned to the training distribution is a liability when the distribution changes.

### The "data scale determines superiority" result

One paper makes this explicit in a way that is worth quoting as a summary of the whole lens. Using Fourier analysis of feature maps, it shows that the *frequency response* of a model changes with its inductive bias: convolution-like models respond differently to signal frequency than attention-like models, and the more convolution-like the bias, the *smaller* the data scale required before a ViT-like model outperforms a ResNet. That is a mechanism, not a correlation: the prior determines which frequency bands the model can efficiently represent, and the data determines whether the model can afford to learn the ones it was not given.

### What this means for the interview

When someone asks "why transformers instead of CNNs?", the answer is not "transformers are better." It is:

> "Because in the regimes that matter for frontier systems — billions of training examples, long sequences, global reasoning, and hardware that rewards regular computation — the weak inductive bias of a transformer buys a higher capacity ceiling, and the cost of learning the bias out of data is smaller than the cost of being unable to represent long-range dependencies. In the regimes where data is scarce, or where the target distribution is close to natural-image statistics, or where you are deploying to mobile silicon, convolutions are still the right answer — and the frontier has been re-importing them, which is the strongest evidence that the tradeoff is real."

**What would change my mind:** The claim "weak bias buys a higher ceiling at scale" would be weakened by a demonstration that a CNN with an equivalent number of parameters and equivalent training compute matches a ViT on a task that *requires* arbitrary long-range composition — e.g., counting objects in a cluttered scene, or solving a visual analogy over a large canvas — at large data scale. Progress on CNN-based counting and on ViT-based dense prediction has been going in opposite directions, and a decisive result here would meaningfully rewrite the field.

<div id="chapter-3"></div>

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

<div id="chapter-4"></div>

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

# Part II — Lens 2: Optimization

<div id="chapter-5"></div>

## 5. Optimization dynamics: norms, recipes, and instability

If Lens 1 is about what the architecture *can* represent, Lens 2 is about whether you can *train* it. This is where the CNN/transformer gap was largest in 2020 and is smallest today — not because the architectures converged, but because the *recipes* did. Understanding that history is essential, because it explains why frontier labs now treat training recipe as a first-class research object rather than an engineering detail.

### BatchNorm is the quiet reason CNNs train easily

A ResNet trains with SGD and BatchNorm, and the combination is remarkably forgiving: it normalises across the batch, which makes the loss landscape smooth, allows large learning rates, and provides a form of noise injection that acts as implicit regularisation. It also interacts with the residual structure to keep gradients well-conditioned through depth.

ViTs replaced BatchNorm with LayerNorm (and later RMSNorm). This is not a minor change. LayerNorm normalises per-sample, per-position, which means:

- It provides **no batch-level regularisation** — the model must find its own regularisation in the data.
- It **couples channels** in a way that interacts badly with the attention's rank collapse (Chapter 9), because the normalisation can be absorbed into the residual stream's scale.
- The **loss landscape is less smooth**, which makes large learning rates unstable, which forces warmup, which makes the training schedule a research object.

The historical consequence was a five-year recipe arms race: the ViT needed long warmup, careful learning-rate scaling, label smoothing, heavy augmentation (RandAugment, MixUp, CutMix), stochastic depth, dropout, EMA, and — the thing people forget — **much longer schedules than a CNN of the same size**. DeiT III and the ConvNeXt recipe are the codified versions of this. ConvNeXt's contribution was largely *recipe*: the same architecture trained with a modern recipe beats the same architecture trained with an old one by several points.

### The modern recipe is now the baseline

By 2023–2024 the recipe had stabilised enough that it is worth stating as a default:

- **Optimizer:** AdamW, cosine schedule with warmup, weight decay decoupled from the adaptive update.
- **Augmentation:** RandAugment or AugMix, plus MixUp/CutMix for the classifier.
- **Regularisation:** stochastic depth (drop paths), label smoothing, sometimes EMA of weights.
- **Norm:** LayerNorm (or RMSNorm) — batch norm is deliberately avoided because it breaks at inference when batch statistics change, and because it is a poor fit for the token-wise normalisation of attention.
- **Schedule:** cosine with warmup; length scaled to model size.

Two results show that this is now a *shared* baseline rather than a ViT special:

1. **ConvNeXt V2** reached 88.9% ImageNet-1K with public data using a fully convolutional masked autoencoder and the same recipe family.
2. **DINOv3** trains a 7B-parameter ViT on 1.7B images with a *constant* learning rate and no schedule, explicitly citing the stability of the modern recipe.

The practical lesson: when someone asks "why does a ViT need a bigger batch than a CNN?", the answer is that the LayerNorm + AdamW combination has a narrower basin of attraction, so you need more samples per update to estimate the gradient reliably. When someone asks "why do we use AdamW everywhere now?", the answer is that adaptive optimisers decouple per-parameter learning rate from weight decay, which matters when you have millions of parameters with heterogeneous scales.

### EMA, and why the model you ship is not the model you trained

An increasingly standard component is the **exponential moving average (EMA)** of weights. The idea is that the final weights of a stochastic optimisation are noisy; averaging them over training gives a point that generalises better and is more stable. EMA is now standard in diffusion models (where it is essential) and common in self-supervised and large-scale supervised training. In an interview, mentioning EMA signals that you understand that "training" and "the model" are not the same thing — and that the *optimisation trajectory* is part of the architecture.

### Instability at scale, and how to read it

Large ViTs exhibit a family of instabilities that are worth being able to diagnose:

- **Loss spikes** early in training → warmup too short, learning rate too high, or a bad initialisation (this is why so many recipes use `init`-time LayerNorm scaling).
- **Feature degradation with training length** → this is the DINOv3 finding. Global metrics (classification) keep improving while dense metrics (segmentation, depth) degrade after ~200k steps, because patch-level features lose locality. Their fix, **Gram anchoring**, regularises the *pairwise similarity structure* of patch features rather than the features themselves — an elegant example of regularising a *relation* rather than a *value*.
- **Rank collapse** (Chapter 9) → the model's representations converge to a low-dimensional subspace. LayerNorm, skip connections and MLPs all mitigate it; pure attention does not.

The DINOv3 result is the most important of these because it is a *scaling* result: the problem only appears at scale and long schedules, and it is a reminder that **longer training is not monotonically better**. That is a genuinely non-obvious claim, and it is the kind of thing a research interviewer will want you to be able to justify.

**What would change my mind:** The claim that the recipe gap is closed would be weakened if a ViT trained with a *deliberately minimal* recipe (SGD, no augmentation beyond resize/crop, short schedule, no EMA) matched a ResNet of equal size from scratch on ImageNet-1k. The current evidence is that the recipe is load-bearing: the ConvNeXt paper's central finding is that its gains came from the recipe, and the DINOv3 paper's central finding is that a 7B ViT needs a careful constant-LR schedule to train at all.

<div id="chapter-6"></div>

## 6. Scaling: laws, data curation, and self-supervision

Lens 2 has a second half: once the recipe is fixed, the remaining lever is *scale*, and the question becomes what scales and what does not. This is where the field has had its clearest successes and its most expensive failures.

### Scaling laws: the vocabulary you need

Kaplan et al. (2020) and Chinchilla (Hoffmann et al., 2022) established that loss falls as a power law in compute, parameters and data, with the three related but *not* equivalent:

```
L(N) ≈ (N_c / N)^α      L(D) ≈ (D_c / D)^β
```

and compute `C ≈ N · D`. The **Chinchilla insight** is that for a fixed compute budget you should scale parameters and data together, keeping the ratio roughly constant — training a much larger model on much less data is a misallocation. That result was derived for language, and its vision analogue is *complicated*:

- Vision has a much larger and cheaper data supply (unlabelled web images), so the optimal parameter/data ratio is *lower* than in language — i.e., vision models are relatively more data-hungry and relatively smaller.
- Vision scaling is not a single curve. Patch size, resolution, and the *supervision objective* all change the exponent. Resolution scaling is a particularly important and under-discussed dimension: a 512² image has 5× the tokens of a 224² image, and the FLOPs scale with token count, so "scale the resolution" is a way to scale compute *without* scaling parameters.

The practical vocabulary for an interview: **parameters, data, compute, resolution, batch size, and training duration are six coupled knobs**, and the "scaling law" is a statement about how loss responds to moving them along a compute-constrained manifold. Conflating "more parameters" with "more compute" is the most common error.

### Data curation is now the dominant term

The single biggest change in vision research between 2021 and 2025 is that **data curation became a first-class research contribution**. Two examples make the point:

- **DINOv3** trains on LVD-1689M, a 1.689-billion-image subset of ~17 billion Instagram images, selected by hierarchical k-means clustering for diversity, retrieval-based selection for downstream relevance, and the inclusion of standard datasets. The paper's framing is that data preparation, not architecture, was the main driver of the improvement.
- **SAM 3** builds a 4-million-concept data engine with human and AI verifiers, including hard negatives, across images and video. The model's gains on promptable concept segmentation are attributed to the data engine, not to a new block.

The general lesson: **the frontier is data-limited on *quality*, not on quantity.** You can get a billion images for free; getting a billion images with the right distribution of concepts, resolutions, aspect ratios, domains and difficulty is a research problem. If you are asked "what's the biggest lever in vision today?", "curated data at scale" is a defensible and current answer.

### Self-supervision: the objective that changed the backbone

Three families of self-supervised objective dominate, and each makes a different assumption about what is learnable from unlabelled images:

1. **Masked image modelling (MIM).** Mask patches and predict them (MAE, BEiT, ConvNeXt V2's FCMAE, DINOv3's LiBOT). The assumption is that occlusion-invariance is a good proxy for visual understanding. MIM is *strong on dense features* because it forces the model to reconstruct local structure — but it alone is weak on semantic, high-level representation, which is why it is usually combined with other losses.
2. **Contrastive learning (CLIP, SigLIP, OpenCLIP).** Maximise agreement between paired image and text embeddings (or between views). The assumption is that *matching the caption* is a proxy for understanding. This is strong on *semantics* and weak on *localisation* — CLIP's dense features are famously poor at segmentation.
3. **Self-distillation / clustering (DINO, DINOv2, DINOv3).** A teacher-student with a momentum encoder, no text, no labels. The assumption is that the *distribution of features* carries the structure. DINO produces high-frequency, shape-like, object-discovering features — and it is the source of the register phenomenon (Chapter 3).

**SigLIP 2** is the most instructive recent example because it is explicitly a *unification*: it takes the original contrastive sigmoid objective and adds captioning-based pretraining, self-distillation, masked prediction, and online data curation — and reports improvements across the board. That is the field's current consensus: **no single objective is sufficient, and the best recipe combines them.**

**DINOv3** goes further and combines an image-level loss (LDINO), a patch-level reconstruction loss (LiBOT), and a uniformity regulariser (LKoleo) — and adds Gram anchoring to stop dense features degrading. The result is the first self-supervised backbone that beats weakly-supervised baselines on dense prediction *with a frozen backbone*, outperforming specialised detection and segmentation models without fine-tuning. That is a large claim and it is the current state of the art.

### The self-supervision verdict, stated carefully

The honest summary of the self-supervision literature:

- **Self-supervision closes or exceeds the supervised gap at scale.** With enough data and enough compute, self-supervised pretraining matches or beats supervised pretraining of the same size.
- **The gains are largest for dense prediction and transfer**, and smallest for tasks where the label already gives you the answer.
- **The objective determines the *type* of feature**, not just its quality: contrastive gives semantic, MIM gives local, DINO-style gives shape/foreground. Choosing the objective is choosing the inductive bias — which loops back to Lens 1.

**What would change my mind:** The claim "data curation is the dominant term" would be weakened if a model trained on an uncurated, unfiltered web corpus of comparable size matched a curated one. The evidence in both DINOv3 and SAM 3 is that curation (diversity sampling, retrieval selection, hard negatives) is where the gains come from, and the papers are explicit about this.

<div id="chapter-7"></div>

## 7. Post-training: from SFT to RLVR and on-policy distillation

The most important structural change in frontier AI between 2023 and 2026 is that **the centre of gravity moved from pretraining to post-training**. This is the lens you said you were interviewing for, and it is worth being precise about what actually happened, because the popular story is wrong in an important way.

### The three-stage pipeline, and why it exists

A modern frontier model is trained in roughly four stages:

1. **Pretraining** — next-token (or masked-patch) prediction on a massive corpus. This gives the model knowledge and a general representation. It is the expensive stage.
2. **Supervised fine-tuning (SFT)** — train on high-quality demonstrations of the desired behaviour. This teaches *format* and *instruction following*, and it is short.
3. **Preference optimisation (RLHF / DPO)** — train on pairs of responses where one is preferred. This teaches *alignment* with human or AI judgement, and it uses a reward model.
4. **Reinforcement learning with verifiable rewards (RLVR)** — train against a *programmatically checkable* reward, with no reward model. This is the stage that taught frontier models to *reason*.

The key insight of the last two years is that stage 4 is not a variant of stage 3. RLHF/DPO optimise a *preference*, which is subjective and must be learned from data; RLVR optimises a *verification*, which is objective and can be computed at scale. That difference matters enormously: a verifiable reward can be generated for mathematics, code, and any task with a deterministic checker, and it can be generated *on-policy* — from the model's own rollouts — which means the training distribution matches the inference distribution.

### RLVR and GRPO

RLVR is typically implemented with **GRPO** (Group Relative Policy Optimisation): sample a group of rollouts, compute the advantage *relative to the group*, and apply a policy-gradient update with a KL penalty to the reference model. The reason GRPO won in practice is not that it is theoretically superior to PPO — it is not — but that it removes the value model and the reward model, and therefore removes two of the three things that make RLHF expensive and unstable.

The mechanism matters: RLVR is *selection*, not instruction. It increases the probability of trajectories that reach a verifiable success state. It does not "teach" the model facts. If the base model cannot reach the success state at all, RLVR has nothing to select. That is the correct mental model, and it is the basis for a whole family of follow-up papers (Chapter 7's discussion of process reward models).

### The reward-density argument: Thinking Machines' on-policy distillation

Thinking Machines Lab's **on-policy distillation** (October 2025) is the most interesting post-training result of the period, and it is a direct attack on the sparsity problem. The observation is:

> RL signal per episode is `O(1)` (a single scalar at the end of the rollout). On-policy distillation signal per episode is `O(N)` — every token of the student's rollout is graded against the teacher's distribution.

If the student rollout is 150 tokens long, that is a 150× difference in learning signal per episode. The recipe: sample rollouts from the student, score every token against the teacher's next-token distribution, and optimise a reverse KL. Because you can score partial rollouts, you do not need to wait for a full generation, which cuts latency.

The reported numbers (which are worth knowing cold): starting from the same SFT checkpoint, on-policy distillation reached ~70% on AIME'24 in ~150 steps using ~77k prompts, versus Qwen3's RL reaching 67.6% with 17,920 GPU-hours. Thinking Machines report 9–30× lower compute than the equivalent RL run, and a compute efficiency of 50–100× when accounting for context and batch effects. They also show a striking continual-learning result: after fine-tuning Qwen3-8B on internal documents, instruction-following dropped from 85% to 45%; on-policy distillation from the *pre-adaptation* model as teacher recovered it to 83% while preserving the new knowledge.

The reason this is a *structural* argument rather than an engineering trick: it says that **dense, per-token, on-policy supervision dominates sparse, outcome-level, on-policy reward in this regime.** That is a claim about the information content of the training signal, and it generalises beyond distillation to any setting where you can grade intermediate steps. It is exactly the kind of claim a research interviewer wants you to be able to make and defend.

### Multimodal RLVR: where vision makes it harder

Applying RLVR to vision-language models is harder, and the difficulty is *specifically about vision*. Three problems dominate:

1. **Reward sparsity plus visual grounding.** Most RLVR rewards are answer-matching: `r ∈ {0, 1}` at the end of the chain. If the model fails, you do not know whether it failed at perception or at reasoning. Work on **perception-aware policy optimisation** found that ~67% of multimodal reasoning errors originate in visual perception, not in logic. That is a strong and quotable result, and it implies that the reward structure — not the model — is the bottleneck.
2. **Language shortcuts.** A VLM can answer without looking at the image, using text priors. If your reward only checks the final answer, you will happily reward a model that has learned to ignore the image. **Vision-SR1** addresses this by decomposing reasoning into *visual perception* and *language reasoning*, requiring the model to produce a self-contained visual description that is sufficient to answer the question, and then re-prompting the model on that description alone to verify it. **Perception-R1** introduces a visual perception reward based on spatial outputs (bounding boxes compared to ground truth) and achieves strong results with 1,442 training samples versus Vision-R1's 200k.
3. **Verification heterogeneity.** Different tasks need different verifiers: symbolic checking for math, IoU for localisation, LLM-judge rubrics for open-ended physics reasoning. **V-Triune** proposes a unified methodology with sample-level reward routing, verifier-level outcome verification, and source-level diagnostics, plus **Dynamic IoU** — a staged reward schedule that starts dense and becomes strict, because a fixed IoU threshold is either too loose (reward ambiguity) or too strict (reward sparsity).

The emerging consensus is that **process reward models (PRMs)** — which supervise intermediate steps rather than only the final outcome — are the fix, and the frontier is building perception-centric PRMs that can localise *which* step failed and *where* in the image it went wrong.

### Distillation, and why it keeps coming back

Distillation appears at every stage of the pipeline and for the same reason: a teacher's distribution carries more information than a label. Off-policy distillation (train on teacher-generated sequences) is the standard SFT replacement; on-policy distillation is the RL replacement. The open question — and the one Thinking Machines' work raises — is how much of RL's expensive search is genuinely necessary versus being the prerequisite that makes cheap distillation possible. The evidence so far leans toward "most of it is the prerequisite", which is a strong and controversial claim, and exactly the kind of thing worth arguing about in an interview.

**What would change my mind:** The "dense on-policy supervision dominates sparse reward" claim would be weakened if a pure RLVR run with a sparse verifiable reward, at matched compute, beat on-policy distillation on a task where the teacher has no advantage — i.e., where the teacher is the same size as the student. Thinking Machines' strongest results use a *larger* teacher, so part of the gain could be teacher capability rather than signal density. Their self-distillation experiment (same architecture) is the right control, and it is the one to cite if asked.

# Part III — Lens 3: Expressivity

<div id="chapter-8"></div>

## 8. What attention can compute

Expressivity questions in interviews usually take one of two forms: "can a transformer do X?" or "why is a transformer better than a CNN if they're both universal approximators?" Both are best answered by being precise about *what kind* of universality is in play, because the answer differs.

### Three different meanings of "universal"

1. **Universal function approximation on a fixed-size input.** Any continuous function on a compact set can be approximated by a sufficiently wide network — CNNs, ViTs and MLPs all satisfy this. This is the weakest and least useful sense, and it is the one that makes "but they're both universal!" a non-answer.
2. **Universal sequence-to-sequence approximation.** A transformer with a strongly-connected attention graph can approximate any continuous sequence-to-sequence function, with the number of layers scaling with the *diameter* of the graph. This is a genuine result (Yun et al., 2020; and follow-ups showing that even *one* attention layer plus softmax, or two attention layers, suffices for universality). It is stronger than (1) because it is uniform over sequence length and it respects the token structure.
3. **In-context learning / universal in-context learners.** Deep transformers can implement induction and regression heads directly from the context, which is a much stronger claim — it is about *learning without parameter updates*. This is where the modern expressivity results are, and it is the most relevant to how frontier models actually behave.

The key distinction for the CNN/ViT question: **a CNN is universal on the *image* as a whole, but its compositional structure means it cannot easily implement a *content-dependent, long-range* function without depth. A transformer is universal on the *sequence*, which means it can implement a function of the entire input in a bounded number of layers, but it must learn the locality.** Neither is "more universal"; they are universal in different spaces.

### Attention is an average — and that is the whole story

The most important theoretical fact about attention is that it is an *average* of value vectors, weighted by content-dependent scores. `Attention(Q,K,V) = Σ_j softmax(q·k_j) v_j`. Because the weights sum to one, the output is a convex combination of the value vectors. This has three consequences that show up everywhere:

- **Attention cannot create information.** It can only redistribute what is in `V`. If the relevant signal is not in the value vectors, attention cannot recover it — no matter how many layers.
- **Attention can implement "copy this token's value to that position".** By making the softmax sharply peaked, attention becomes an identity/copy operation. This is why transformers are so good at retrieval-like tasks: they can route a value from a distant position to a query position in one layer.
- **Attention cannot implement a *density*-like operation without an MLP.** The MLP is what allows the model to transform the mixed representation non-linearly. This is why the "MLP is the real expressivity" claim has some truth: attention mixes, the MLP computes.

The practical implication for the CNN/ViT debate: **a ViT's advantage is not that it can represent more functions, but that it can route information across arbitrary distances in one layer.** A CNN needs depth proportional to the distance. If your task requires long-range routing — counting, spatial reasoning, referring to an object mentioned anywhere in the context, matching across a large canvas — that routing cost is the real difference, and it is a systems-and-depth cost, not a representational one.

### What attention cannot do cheaply

Three well-known limitations, each with a specific cost:

1. **Associative memory is quadratic.** To recall "the third object" or "the object mentioned two paragraphs ago", attention must compare the query against all keys. This is `O(N²)` in tokens and `O(N²)` in memory for the score matrix. Linear attention and SSMs trade expressivity for linear cost (Chapter 11).
2. **Precision of positional information degrades.** Softmax attention with learned absolute positions has limited precision for *fine* spatial relationships. This is why relative and rotary encodings exist, and why vision models that need precise localisation (detection, segmentation, OCR) use them or add convolutional refinement.
3. **No built-in scale invariance.** A CNN with pooling is approximately scale-covariant. A ViT at a fixed resolution is not: an object that doubles in size occupies four times the tokens. This is why resolution and scale are the dominant practical knobs in vision, and why models like NaViT sample resolutions during training.

### The "attention is not all you need" line of work

There is a productive body of theory that argues attention *alone* is expressively limited, and the result is worth knowing precisely because it is often misquoted:

- **Rank collapse in depth.** Pure attention-only networks lose rank doubly-exponentially with depth: all tokens converge to a common representation. The skip connection and the MLP counteract this. This is a *structural* result, not an implementation detail.
- **The MLP is necessary for universality.** Attention alone (without MLP) cannot achieve full sequence-to-sequence universality; the MLP provides the non-linear transformation that attention's convex-combination structure lacks.
- **LayerNorm changes the picture.** A 2024 analysis showed that with LayerNorm, the attention dynamics can have equilibria of *any rank between one and full*, and that for a generic class of inputs tokens provably do *not* collapse — refuting the earlier hypothesis that LayerNorm plays no role. This is a good example of a theory result that overturned a prior belief, and it is worth citing because it shows the theory is still moving.

The synthesis: **attention is a powerful but structurally constrained mixer. It is universal in the sequence sense, it routes information globally, and it needs the MLP and the residual to avoid collapse. A CNN is a structurally constrained but efficiently-composable mixer that is universal in the image sense but pays in depth for long-range routing.** The right architecture is the one whose constraints align with the task's structure — which is, again, the inductive-bias answer, seen from the expressivity side.

**What would change my mind:** The "attention routes globally in one layer, CNNs need depth" claim would be weakened by a CNN architecture that implements arbitrary content-dependent global routing in `O(1)` depth with `O(1)` additional parameters per routing decision. Large-kernel convolutions and deformable convolutions approximate this but pay in parameters or in the discreteness of the sampling grid. A continuous, content-addressable routing primitive in a convolutional framework would be a genuine architectural novelty.

<div id="chapter-9"></div>

## 9. Rank collapse, signal propagation, and the depth/width trade

This is the chapter that most interviewees have never read, and it is the one that most impresses people who do read it — because it is a *theoretical* result with *practical* consequences, and because it explains behaviours you can observe in any trained model.

### The phenomenon

Train a transformer and look at the pairwise cosine similarity of its token representations. In a healthy model, tokens from different parts of the image should be *different* — a patch of sky and a patch of car should not be similar. In a model suffering from **rank collapse**, the token representations converge to a common point: all tokens become similar, the effective dimensionality of the representation falls, and the model's ability to distinguish tokens degrades.

Two distinct forms exist, and they have different causes:

- **Rank collapse in depth.** As representations propagate through many layers, they converge to a low-dimensional subspace. This is partly a consequence of repeated matrix multiplication (a general property of deep networks, not specific to attention) and partly specific to attention's averaging structure.
- **Rank collapse in width.** A 2024 random-matrix-theory analysis identified a *new* phenomenon: even within a *single* attention layer, the stable rank of the token representations collapses as the context length grows. The cause is a **spectral gap** between the largest and second-largest singular values of the attention matrix — the largest eigenvalue "escapes" the bulk of the spectrum, which makes the attention operator behave like a rank-one projection.

The width-collapse result is important because it explains a practical phenomenon that had no explanation: **longer contexts make attention worse, not just more expensive.** It is not merely that attention costs `O(N²)`; it is that the *quality* of the attention computation degrades as `N` grows. This gives a theoretical justification for the many practical fixes (attention scaling, relative position biases, rotary encodings) that people adopted heuristically.

### The spectral picture, in one paragraph

Model the attention matrix as a random Markov matrix. Its eigenvalues form a bulk plus a single outlier. The outlier is the uniform component — the "average everything" direction — and it has eigenvalue 1, while the bulk shrinks as `O(1/√N)`. The gap between them is what drives collapse. **Removing the outlier** (the paper's proposed fix) restores the bulk and prevents width-collapse. This is a rare case where a purely spectral argument produces a *simple, effective, implementable* fix, and it is the kind of result that rewards understanding the mechanism rather than the recipe.

### What prevents collapse in practice

If pure attention collapses, why do real transformers work? Because real transformers are not pure attention. The mitigating components, in order of importance:

1. **Skip connections.** They preserve the input's rank and let information bypass the collapsing attention. The skip connection is not just an optimisation trick — it is what stops the network from being an ensemble of shallow attention layers.
2. **MLPs.** They provide the non-linear transformation that attention's convex-combination structure cannot. They are essential for universality and they slow collapse.
3. **LayerNorm.** The 2024 analysis showed that LayerNorm allows a rich set of equilibria of any rank — it does *not* prevent collapse in general, but it makes the dynamics far more expressive than the pure-attention analysis suggested, and it refutes the earlier claim that it is irrelevant.
4. **Local / sparse attention patterns.** Collapse is slower for graphs with larger radius (i.e., more sparse, less globally-connected attention). This is a *theoretical* justification for sliding-window and sparse attention — they are not only faster, they are *less collapsing*.
5. **Warmup and initialisation.** Small initial learning rates and careful init keep the early training trajectory in a non-collapsed regime.

### The depth/width trade

Rank collapse gives a concrete meaning to the depth/width tradeoff:

- **Deep and narrow** (many layers, small embedding) → collapse is fast in depth; the model must rely on skip connections and MLPs to preserve information, and its effective capacity is limited.
- **Shallow and wide** (few layers, large embedding) → collapse is slower per layer, but the model has fewer compositional steps, so it cannot build hierarchical features.
- **The practical optimum** is a balance, and it is *task-dependent*: classification wants fewer layers, dense prediction wants more, and the optimum shifts as you scale.

This is a useful interview answer to "why not just make the transformer deeper?" — because depth buys collapse, and collapse costs you the ability to distinguish tokens, which is exactly what dense prediction needs.

### A practical corollary: the register connection

Rank collapse and the register phenomenon (Chapter 3) are related but distinct. Rank collapse is about the *dimensionality* of the token representations across the network. Registers are about the model *repurposing* specific tokens as scratch space for global computation. Both are symptoms of the same underlying fact: **the transformer has no structural place to put "global" information, so it puts it wherever it can — which is wherever the locality constraint is weakest.**

That framing unifies three otherwise-unrelated results:

- **Registers** fix it by adding dedicated scratch tokens.
- **Gram anchoring** (DINOv3) fixes it by regularising the *structure* of patch similarities, which keeps dense features from being absorbed into the global representation.
- **Frequency-aware aggregation** ("more than registers") fixes it by preventing the CLS from aggregating background patches in the first place.

Three different fixes, one mechanism. That is the kind of synthesis an interviewer is looking for.

**What would change my mind:** The claim "attention collapses and the MLP/skip rescue it" would be weakened by a trained transformer in which the attention layers demonstrably preserve full token rank across depth without any skip or MLP — or, conversely, by a proof that collapse is unavoidable in any attention-based architecture of practical depth. The current theory says collapse is inevitable in *pure* attention and avoidable in *complete* transformers, and the experiments support that; the boundary case (attention-only but with normalisation and residual-like structure) is still being explored.

<div id="chapter-10"></div>

## 10. Memory, association, and the token budget

There is a family of expressivity limitations that is neither about universal approximation nor about rank collapse, and it is the one that most directly shapes modern architecture decisions: **the cost of remembering and associating information.** This is where the "why not a CNN?" question gets its most interesting answers, because the answer is not about representation at all — it is about the *budget* of tokens and parameters.

### The three budgets

Every sequence model manages three resources, and they are coupled:

1. **Parameter budget.** The number of weights. This is the "knowledge" budget: what the model can store as learned transformations.
2. **Token budget (context length).** How many tokens can be attended to simultaneously. This is the "working memory" budget: what the model can hold *in the input*.
3. **Compute budget.** FLOPs per forward pass. This is the "thinking" budget: how much the model can compute over what it holds.

The central expressivity result of the modern era is that **these are not interchangeable**. A model with a small context can hold less working memory but can still know a lot; a model with a large context can hold more but pays quadratic attention cost; a model with more compute can reason longer over the same context. Frontier models are scaling all three, but the *ratios* matter, and the ratios are what architecture determines.

### Why long context is not free

Attention is `O(N²)` in tokens, which means:

- Doubling the context quadruples the attention FLOPs (and, for the score matrix, the memory).
- The *effective* precision of positional information degrades with `N` (rank collapse in width, Chapter 9).
- The model must learn to *ignore* irrelevant context, and that is a learned skill that requires training data with irrelevant context in it.

This is why "just make the context longer" is not a solution, and why architectures that make long context cheap (SSMs, linear attention, sparse attention, hybrid) are interesting — but also why they trade away something (Chapter 11).

### Associative recall: the canonical test

The standard test for a model's memory machinery is **associative recall**: given a sequence of tokens where `A1 B1 A2 B2 ... AN BN`, and a query `A3`, return `B3`. A transformer can do this with exact attention, because the query `A3` can attend directly to the token `A3` and copy its paired value. An SSM can do it only if the state has not been overwritten by intervening tokens. A CNN cannot do it without depth proportional to `N`.

This is the sharpest illustration of the architecture tradeoff, and it is worth stating as a table:

| Architecture | Associative recall cost | Working memory | Long-range precision |
|---|---|---|---|
| Full attention | `O(N²)`, exact | Full context | Exact (given positional encoding) |
| Sliding window / sparse | `O(N·k)`, k = window | Bounded | Degrades beyond window |
| Linear attention / SSM | `O(N)`, state-limited | Compressed state | Bounded by state size |
| CNN | `O(N·k)`, depth-limited | Receptive field | Degrades beyond field |

The key insight: **there is no free lunch, but the lunches have different shapes.** Attention buys exact long-range recall at quadratic cost. SSMs buy linear cost at the price of a compressed, lossy state. CNNs buy hardware efficiency at the price of depth. The "best" architecture depends on which of these you can afford — which is a systems question, and it loops back to Lens 4.

### The parameter-vs-token trade, and why it matters for vision

There is a specific version of this trade that is very important for vision: **the number of visual tokens grows with resolution, and resolution is how you get detail.** A 4K image at patch 16 gives 16,000+ tokens; a 4K video frame at the same patch gives 16,000 tokens *per frame*. Video is where this bites hardest: a 10-second 24fps video at 720p is roughly 10,000 frames' worth of visual information, and you cannot put that in a context window.

The practical consequences:

- **Video models compress aggressively.** HunyuanVideo 1.5 uses a 3D causal VAE with 16× spatial and 4× temporal compression, so a 720p 121-frame clip becomes a manageable latent sequence, and then uses selective/sliding tile attention to prune redundant KV blocks. That is a *systems* decision driven by an *expressivity* constraint.
- **VLMs use visual token budgets deliberately.** Qwen3-VL and InternVL cap the number of visual tokens and use downsampling or tiling to control the tradeoff between detail and context. The "visual token budget" is a first-class hyperparameter in modern VLM design.
- **High-resolution vision uses hierarchical or tiled processing.** LLaVA-NeXT's AnyRes tiles a high-res image into a base image plus sub-images; NaViT packs variable resolutions. Both are ways of managing the token budget.

This is a genuinely useful interview point, because it is the intersection of expressivity and systems, and because most people think of "context length" as a language-model problem. In vision it is a *resolution* problem, and the two are the same problem.

### In-context learning: memory as computation

The strongest modern expressivity results are about **in-context learning** — the ability to learn from the input without parameter updates. Transformers are universal in-context learners for a broad class of functions, and this is not an accident: the attention mechanism can implement induction heads, regression over the context, and copying, all in a forward pass. The implication is that **"memory" and "computation" are the same thing in a transformer** — attending to the right tokens *is* the computation. That is why a transformer with a long context can do more than a transformer with the same parameters and a short context, and why increasing context length is a form of scaling *capability*, not just capacity.

**What would change my mind:** The claim "attention's exact recall is worth the quadratic cost" would be weakened by a linear-time architecture that matched full attention on associative-recall benchmarks *at the same context length and parameter count* — especially on the *hard* recall tasks where the target is far away and the state must be preserved through distractors. Current SSMs and linear attention do well on short-range and simple tasks and degrade on long-range, many-key recall. A decisive result here would be the most important architecture result in years.

<div id="chapter-11"></div>

## 11. Beyond softmax: SSMs, linear attention, and hybrids

Everything above assumed softmax attention. The last three years have produced a serious research programme on *replacing* it, and you need to understand it, because it is the live frontier of architecture research and because it is where the "why transformers?" question is genuinely open.

### The problem with softmax attention

Softmax attention has three costs that are structural, not implementation-related:

1. **Quadratic time and memory** in sequence length. This is the famous one, and it is what makes video, long documents, and high-resolution vision expensive.
2. **Dense, unstructured mixing.** Every token attends to every other token. This is a *waste* when most of the context is irrelevant — and in real data, most of it is.
3. **No compression.** The model must keep the entire history in the input. There is no mechanism for summarising the past.

Linear attention, SSMs and sparse attention each address a different subset of these.

### Linear attention: cheap, but rank-limited

Linear attention replaces the softmax with a kernel function applied to queries and keys, so that the attention matrix is factorised and the computation can be reordered into a linear recurrence:

```
softmax(QKᵀ/√d)V      →      (QKᵀ)V  with Φ(Q), Φ(K)
```

The consequence: **the effective rank of the attention matrix is bounded by the head dimension**, which is typically 64–128. That is a *strong* expressivity constraint — it means linear attention cannot represent an arbitrary dense attention pattern. Empirically, linear attention underperforms softmax attention at matched size, and the reason is now well understood: it is a low-rank approximation of softmax attention, and the rank is the limiting factor.

The practical lesson: **linear attention is not "softmax attention but faster".** It is a *different function class* with a *bounded rank*, and you pay for that bound in capability. The systems win is real, but it is not free.

### SSMs / Mamba: selective, input-dependent recurrence

The **selective state-space model** (S6, Mamba) is the most important alternative. It keeps the linear recurrence but makes the transition parameters *input-dependent* — `Δ`, `B`, `C` are functions of the input. This gives the model the ability to *filter* its memory: it can choose to remember or forget based on content. The result is a model with:

- **Linear time and memory** in sequence length.
- **Content-dependent memory**, which linear attention lacks.
- **No quadratic attention**, and no `O(N²)` memory.

The theoretical framing that makes this intelligible: **Mamba can be viewed as a low-rank approximation of softmax attention with a learned, data-dependent mask.** That places it between linear attention (fixed, rank-limited) and softmax attention (dense, full-rank) — it gets the rank of a low-rank model but the selectivity of a dense one. It is also why the "hidden attention" analysis of Mamba finds that it produces *more* attention matrices than a transformer — it is not that it lacks attention, it is that its attention is *implicit* and *dense in a different basis*.

### The vision versions

Vision adaptations are non-trivial because images are 2D, not 1D, and the scan order matters:

- **Vision Mamba (Vim)** — bidirectional scan with position embeddings; reports 2.8× faster inference and 86.8% memory reduction at 1248² resolution versus DeiT, at comparable accuracy.
- **VMamba** — 2D selective scan (SS2D) that traverses four directions and merges; hierarchical backbone for dense prediction.
- **PlainMamba / spatial Mamba** — continuous 4-directional scanning, better spatial continuity.
- **MambaVision** — the *hybrid*: hierarchical Mamba backbone with self-attention added in the final layers where the token count is small enough for exact attention. Roughly 9:1 Mamba-to-attention, and hybrids beat both pure architectures in several settings.

The consistent finding across all of them: **Mamba-based vision models are competitive with ViTs on classification and dense prediction at matched size, and they are significantly cheaper at high resolution or long sequence.** But they are *not* uniformly better, and they are weaker in settings that need exact, dense, associative recall (Chapter 10).

### The hybrid is the practical answer

The pattern across the whole literature is that **pure alternatives do not win outright; hybrids do.** MambaVision adds attention where it is affordable. Video DiTs use sliding/tile attention rather than full attention. Language models use hybrid Mamba-Transformer stacks for long context. Thinking Slow, Fast showed that distilled Mamba models can beat their transformer teachers *at fixed time budget* because they generate faster, which lets them spend more compute on the same answer.

The reason is structural, and it is the same reason ConViT found in 2021: **attention is the most expressive and most expensive operation, so you use it where you can afford it and substitute a cheaper, structurally-biased operation where you cannot.** The specific split varies — attention in the last layers for MambaVision, attention in the first layers for some hybrids, attention everywhere for short sequences — and the optimal split is a *systems* decision driven by the token budget.

### Where this leaves the "why transformers?" question

This is the honest answer, and it is the one to give in an interview:

> Transformers won because softmax attention is the most general and most expressive mixing operation we have, and because for the sequence lengths and the hardware of the last decade, the quadratic cost was affordable. That affordability is changing. Linear-time models are closing the gap, and hybrids are starting to win in the regimes where the quadratic cost binds — long context, high resolution, video, and edge deployment. The frontier is not "transformers vs. alternatives"; it is "at what density of attention does the expressivity win justify the cost, given the token budget and the hardware?"

That is a defensible, current, and non-obvious position. It also demonstrates that you understand the question is *not* settled — which is exactly what a research interviewer wants to hear.

**What would change my mind:** The "hybrids win" claim would be weakened if a *pure* linear-time architecture matched a full softmax transformer on a task requiring exact, dense, long-range associative recall — with matched parameters, matched token budget, and matched training compute. The evidence so far is that linear-time models are close on classification and dense prediction and clearly worse on hard recall. A decisive win on hard recall would be the single most important architecture result since the transformer.

# Part IV — Lens 4: Systems

<div id="chapter-12"></div>

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

<div id="chapter-13"></div>

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

<div id="chapter-14"></div>

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

<div id="chapter-15"></div>

## 15. ViT versus CNN in production: parallelism, quantization, and inference

Lens 4 ends with the question that actually matters in a deployment: given two architectures that are close on accuracy, which one do you ship? The answer is almost never "the one with fewer FLOPs."

### Distributed training: regularity beats efficiency

Training a large model means splitting it across many accelerators. The three standard dimensions are:

- **Data parallelism (DP)** — each GPU holds a copy of the whole model and processes a different shard of the batch. Cheap, but it does not reduce per-GPU memory or enable larger models.
- **Tensor parallelism (TP)** — split individual layers across GPUs (e.g., the attention heads or the FFN columns). Requires all-reduce communication every layer, so it only pays off when the model is large enough that the communication is a small fraction of the work.
- **Pipeline parallelism (PP)** — put different layers on different GPUs. Reduces memory but adds bubbles.

**Transformers are tensor-parallel friendly because they are regular.** Every block has the same shape, so you can split heads or FFN columns evenly and the load balances. **CNNs are not**, because their shapes change from stage to stage (stem, stage 1, stage 2, ... each with different channel counts), which makes even splitting hard and creates load imbalance.

This is a *structural* reason, not a tuning one, and it is why frontier training infrastructure was built around transformers. If you are training a 7B-parameter model across 256 GPUs, the architecture that shards cleanly is the architecture you can train at all.

### MoE: sparse compute, dense memory

Mixture-of-Experts is a different kind of systems trade: keep the parameter count (and therefore the memory) large, but activate only a subset per token. Wan 2.2 uses a 27B-parameter MoE with ~14B active; ERNIE 5.0 uses an ultra-sparse MoE. MoE is a *compute-vs-memory* trade: you buy capability by buying memory bandwidth and paying for it in communication.

The systems cost is **all-to-all communication** — every token must be routed to the right expert, and the experts are distributed across devices. MoE therefore only pays off when the compute saved exceeds the communication added, which depends on the sparsity and the network topology. It is also a *training-and-inference* asymmetry: the paper on ERNIE 5.0 explicitly notes that ultra-sparse MoE "exacerbates the training–inference discrepancy," which is a real engineering problem.

### Quantization: memory-bound problems are quantisation-friendly

Quantisation (FP8, INT8, INT4) reduces both memory footprint and bandwidth, and therefore helps *memory-bound* operations most. Since decode is memory-bound (Chapter 12), quantisation is the single highest-leverage inference optimisation for a large model. Two consequences:

- **Attention and FFN GEMMs benefit directly** from FP8/INT8, because they are compute-bound but the weights still must be loaded.
- **The softmax, LayerNorm and elementwise ops do not benefit much** — they are already memory-bound and their arithmetic is cheap, so reducing their precision saves little.

This is why a quantised model's speedup is not proportional to its size reduction. The practical rule: **quantise the weights and activations of the GEMMs, and keep the normalisations and softmax in higher precision.**

### KV cache, and why decode is different

For autoregressive models, the KV cache grows with the sequence length and the batch size, and it is *the* memory bottleneck at long context. Attention with a cached KV is a matrix-vector product per query, which is memory-bound (AI ≈ batch size). This is why:

- **Batch invariance matters.** Thinking Machines' "Defeating Nondeterminism in LLM Inference" argues that GPU kernels should produce bitwise-identical results regardless of batch size, so that the KV cache can be shared across requests of different sizes. Without batch invariance, you cannot batch a small request with a large one, and you waste compute. This is a *systems* result with a direct product consequence, and it is a good example of research that is not about accuracy at all.
- **Sliding-window and sparse attention help decode** because they bound the KV cache growth.
- **Speculative decoding** trades a small model's cheap guesses for the large model's verification, improving throughput without changing the output distribution.

### Distillation and compression as deployment decisions

The most common production move is not to deploy the model you trained. You deploy a **distilled, quantised, pruned, or sparsified** version, and the choice of architecture for the *small* model is different from the choice for the *teacher*. This is where the CNN/transformer tradeoff reappears in a new form:

- A **7B ViT teacher** can be distilled into a **RepViT mobile student** for edge deployment, because the student only needs to reproduce the teacher's *decisions*, not its representations.
- Thinking Slow, Fast showed that a distilled **Mamba** model can beat its transformer teacher at fixed time budget, because it generates faster and therefore spends more compute per answer.

The general principle: **the architecture of the deployed model is chosen for the deployment constraint, not for the training objective.** This is why a single frontier model spawns a whole family of edge variants, and why architecture selection is a *product* decision as much as a research one.

### The production checklist

When asked "which architecture should I deploy?", run this list:

1. **Latency budget on target hardware** — measure, do not estimate. Mobile NPUs and server GPUs have completely different optimal arithmetic.
2. **Batch size at serving** — small batches favour memory-bound ops (convolution, decode); large batches favour compute-bound ops (attention, FFN).
3. **Memory footprint** — model size, KV cache growth, activation memory.
4. **Sequence/resolution length** — quadratic attention binds at high resolution and long context.
5. **Training infrastructure** — can you shard it across your cluster?
6. **Distillation path** — is there a teacher whose decisions you can transfer to a smaller, cheaper student?

**What would change my mind:** The "regularity makes transformers trainable at scale" claim would be weakened if a CNN family demonstrated clean, communication-efficient tensor parallelism at frontier scale — e.g., a 7B-parameter CNN trained across thousands of GPUs with load balance comparable to a transformer. The current evidence is that CNNs have a harder time (variable shapes per stage), which is why the frontier is transformer-based. A demonstrated counterexample would be a major result.

# Part V — The State of the Art

<div id="chapter-16"></div>

## 16. The backbone landscape (2025–2026)

With the four lenses established, here is what the field actually looks like. This chapter is a map, not an argument — but the map itself is informative, because the spread of architectures in use tells you the tradeoffs are real.

### The three backbone families

**A. Self-supervised ViT foundation models.** DINOv3 (Meta, Aug 2025) is the current reference point: a 7B-parameter ViT trained on 1.7B curated images with a combined loss (image-level LDINO, patch-level LiBOT, uniformity LKoleo), axial RoPE with box jittering, a constant learning rate, and **Gram anchoring** to stop dense features degrading over long schedules. The result is the first self-supervised backbone that beats weakly-supervised baselines on dense prediction *with a frozen backbone* — 86.6 mIoU on PASCAL VOC vs DINOv2's 83.1 and SigLIP 2's 72.7. It also reports 88.4% ImageNet linear accuracy, which is *below* weakly-supervised SigLIP 2 (89.1) and PECore (89.3) — a useful reminder that "best dense features" and "best classification" are different objectives.

DINOv3 ships a family: the 7B teacher, distilled ViT-B/ViT-L students, and ConvNeXt variants for deployment flexibility. **The fact that the distilled student includes ConvNeXts is itself a statement about the tradeoffs** — the distillation path goes through convolutions for the small end.

**B. Vision-language encoders.** SigLIP 2 (Google, Feb 2025) unifies contrastive alignment with captioning, self-distillation and masked prediction, in four sizes from ViT-B (86M) to Giant (1B), with a **NaFlex** variant that supports native aspect ratio and variable sequence length. It is multilingual (109 languages, 256k-token Gemma tokenizer) and is the default vision encoder for open VLMs that want one checkpoint to serve every aspect ratio. SigLIP 2's dense features are its headline improvement over SigLIP — it was trained explicitly to fix the localisation weakness that CLIP had.

**C. The Perception Encoder (PE).** Meta's PE is a supervised ViT trained on a mixture of public datasets with a focus on *localisation*, and it is the backbone inside SAM 3. Its existence signals something important: the field has decided that "a good vision encoder" is a *multi-objective* object — semantics, localisation and dense features are separable objectives that require different training mixtures, and no single recipe optimises all three.

### What the map tells you

Read the three families together and the tradeoffs become visible:

| Model | Optimised for | Architecture | Deployment |
|---|---|---|---|
| DINOv3 | Dense features, self-supervision, universal transfer | ViT (7B), distilled to ViT/ConvNeXt | Frozen feature extractor |
| SigLIP 2 | Semantic alignment, retrieval, multilingual, variable resolution | ViT (86M–1B), NaFlex | Frozen encoder for VLMs |
| PE | Localisation, open-vocabulary detection | ViT | Frozen encoder for SAM 3 |
| ConvNeXt V2 | Strong supervised baseline, dense features | CNN | General purpose |
| RepViT / MobileNetV4 | Mobile latency | CNN | Edge / NPU |
| VMamba / MambaVision | High-resolution, long-sequence efficiency | SSM / hybrid | Server, high-res |

**The pattern: nobody is trying to make one model do everything.** The field has converged on a portfolio, where each model is optimised for a specific constraint set, and the choice between them is made by the four lenses. That is the strongest possible evidence for the thesis of this book.

### The resolved questions, and the open ones

**Resolved (for now):**

- *Is self-supervision enough at scale?* Yes — DINOv3 beats weakly-supervised baselines on dense prediction with a frozen backbone.
- *Does the CNN still have a place?* Yes — at mobile latency, and as a distillation target, and for deployment flexibility.
- *Is a flat ViT better than a hierarchical one?* Mostly — NaViT beats hierarchical ViTs at equal compute, though hierarchical designs still dominate dense-prediction tooling for historical reasons.
- *Does variable resolution help?* Yes, robustly — it helps even when evaluated at the fixed resolution's own size.

**Open:**

- *Can a linear-time model match full attention on hard recall?* (Chapter 11)
- *Is attention density the right axis to scale, or is there a better one?* (Chapter 7's distillation result suggests signal density may matter more.)
- *What is the right objective mixture for a general-purpose vision backbone?* DINOv3, SigLIP 2 and PE each answer differently, and the differences are large.
- *Can a single backbone serve generation and understanding?* Video DiTs and VLMs are both moving toward unified multimodal trunks, but the objectives are still separate.

**What would change my mind:** The "portfolio" conclusion would be weakened if a single backbone dominated across all four lenses — small and large, mobile and server, dense and semantic, understanding and generation. No such backbone exists, and the absence is not an accident of engineering but a consequence of the tradeoffs this book has described.

<div id="chapter-17"></div>

## 17. Dense prediction and segmentation

Dense prediction — segmentation, detection, depth, tracking, keypoint matching — is where the architecture debate is most concrete, because it is where token count, resolution and locality all bind simultaneously. It is also where the self-supervised revolution has been most decisive.

### Why dense prediction is the hard case

A classification head needs one number per image. A dense head needs a prediction *per pixel*, which means:

- The model must produce a *spatially-resolved* representation, not a pooled one.
- The output resolution must be preserved through the network — which is the opposite of what a classification backbone does.
- Small objects need fine resolution, large objects need context, and both must be handled by the same weights.

This is exactly the regime where CNNs' hierarchical structure was a virtue and ViTs' flat structure was a liability. The history of dense prediction is therefore a good test of the four-lens framework.

### The detection story: from anchors to sets

**DETR (2020)** replaced the entire hand-engineered detection pipeline — anchors, region proposals, non-maximum suppression — with a transformer encoder-decoder that outputs a *fixed set* of predictions in a single pass, trained with **Hungarian bipartite matching** between predictions and ground truth. The matching is computed once per image at each step, without gradients, and enforces one-to-one correspondence so that duplicate suppression is learned rather than heuristically applied.

The result was not an instant win. DETR matched Faster R-CNN at 500 epochs, which was absurdly expensive, because Hungarian matching is *unstable in early training*: a small change in the cost matrix can flip the matching, which changes the optimisation target mid-training. **DN-DETR** fixed this with query denoising — feed noisy versions of the ground-truth boxes into the decoder and train the model to reconstruct the clean ones, which stabilises the matching and cuts the training cost by an order of magnitude. **DINO** and its successors added contrastive denoising, query selection and two-stage refinement, and by 2023 DINO-based detectors held COCO state of the art.

The lesson for the architecture question: **the transformer won detection not because attention is a better mixer, but because the set-prediction formulation removes the heuristic machinery that anchor-based CNNs depended on.** That is a *representational* win (the model predicts a set, not a scored list) enabled by an *architectural* choice. It is also why the win was slow to materialise — the formulation was right and the optimisation was wrong, and the fix was a training-dynamics insight, not an architecture change.

### SAM 3: segmentation as a data-engine problem

**SAM 3** (Meta, Nov 2025) is the current state of the art and it is instructive for what it chooses *not* to do. It formalises **Promptable Concept Segmentation (PCS)**: given a short noun phrase ("yellow school bus"), an image exemplar, or both, return masks and identities for *every* matching instance in an image or video. It is a strict generalisation of SAM 2's promptable *visual* segmentation (which segmented the object you clicked).

The architecture is a dual encoder-decoder transformer: an image-level **detector** and a memory-based video **tracker** sharing one backbone (the Perception Encoder), with a **presence head** that decouples recognition from localisation. The headline result is a 2× gain over existing systems on both image and video PCS, and 48.8 mask AP on LVIS versus the previous best of 38.5.

But read the contribution list carefully. The gains are attributed to:

1. **A data engine** — 4M unique concept labels with hard negatives, built by iterating a model with human and AI verifiers. The SA-Co benchmark has 207k concepts, 120k images, 1.7k videos.
2. **The presence head** — ablations show cgF1 rising from 50.7 to 52.2 and image-level MCC from 0.77 to 0.82, while positive micro-F1 *falls* from 65.4 to 63.4. That is a *recognition/calibration* gain, not a uniform improvement, and it is a good example of an honest ablation.
3. **Hard negatives** and the detector/tracker decoupling.

**The architecture is not the story.** The data engine is. That is the field-level conclusion: at this scale, dense prediction is a data problem, and the model is the substrate.

### The frozen-backbone revolution

The most important structural change in dense prediction is that **you no longer fine-tune the backbone.** DINOv3 demonstrated that a *frozen* self-supervised backbone outperforms specialised supervised models on segmentation, depth and tracking — no fine-tuning, just a lightweight adapter or a linear probe. SigLIP 2 made the same claim for its dense features. This changes the engineering calculus entirely:

- You train one backbone, once, on unlabelled data.
- You adapt it to a new task with a small trainable head or adapter.
- The backbone's *inductive bias* is fixed at pretraining time, and you cannot change it per task.

This is a *stronger* form of the inductive-bias tradeoff: because the backbone is frozen, **choosing the backbone is choosing the prior for every downstream task.** That is why DINOv3 (dense features, shape-biased) and SigLIP 2 (semantic, aligned) serve different purposes despite both being "vision encoders".

### What this means for the architecture question

Dense prediction is where the "why not a CNN?" question has the most nuanced answer:

- **At the backbone level**, a self-supervised ViT with dense-friendly features (DINOv3) is the current best, because its weak bias lets it learn dense structure that a CNN's prior would constrain.
- **At the head level**, convolutions and hierarchical structures are still standard — most dense-prediction heads are convolutional, because they operate on feature maps at multiple scales.
- **At the deployment level**, mobile dense prediction uses CNNs (RepViT-SAM achieves ~10× faster inference than MobileSAM with better zero-shot transfer).

So the answer is *both*: ViT backbone for representation, convolutional head for local refinement, and the choice depends on the hardware. That is the four-lens answer, applied to a real task.

**What would change my mind:** The "frozen self-supervised backbone beats specialised fine-tuned models" claim would be weakened if a task-specific fine-tuned model substantially beat a frozen DINOv3 backbone on a dense task where the task's inductive bias is *known* and *important* — e.g., a task where local texture is the signal rather than global shape. The evidence so far is that frozen SSL backbones win on tasks where the bias is uncertain, and the field has not yet tested the boundary where a known, strong prior beats a flexible one.

<div id="chapter-18"></div>

## 18. Vision-language and unified models

The most consequential architectural shift in vision is that **the vision encoder stopped being the product.** It became a component inside a larger system — a vision-language model (VLM) — and the design questions moved up a level.

### The three-part architecture

A modern VLM has three parts, and each has its own inductive-bias/optimization/expressivity/systems story:

1. **Vision encoder (VE).** Usually a ViT (SigLIP 2, DINOv3, PE, InternVL's own). Its job is to produce a sequence of visual tokens that carry both semantics and localisation.
2. **Projector.** A mapping from the VE's output dimension to the LLM's embedding dimension, and often a *resolution* control — how many visual tokens survive into the context. Choices here include linear, MLP, and pixel-shuffle/resample (Qwen-VL's resampler, which can downsample a high-resolution grid into a fixed number of tokens).
3. **LLM trunk.** The language model, which processes the interleaved image and text tokens. This is where almost all the capability lives, and where the training signal is densest.

The **visual token budget** is the key hyperparameter: it is the resolution/detail tradeoff, and it is bounded by the context window. Qwen2-VL's M-RoPE and InternVL's dynamic resolution both exist to manage this tradeoff, and the choice of how many visual tokens to keep is a *systems* decision (context length) with an *expressivity* consequence (detail).

### The unification trend

The 2025–2026 trend is to stop treating the vision encoder as a separate frozen component and instead **pretrain a single multimodal trunk** with interleaved image and text tokens. The survey literature describes this as the centre of gravity shifting "from attaching a vision encoder to a text model toward pretraining a single multimodal trunk with longer context, stronger tool use, and better support for agentic workflows." Frontier systems (Gemini, GPT-4o, Claude, ERNIE 5.0) are all in this category.

The architectural implications:

- **Early fusion** (mixing image and text tokens early in the network) is now standard, replacing the late-fusion two-tower design. This is a change in *inductive bias*: early fusion allows the model to build cross-modal representations in early layers rather than only at the top.
- **The vision encoder is trained jointly** with the language model, which means its features are optimised for the *downstream objective* rather than for a standalone proxy (contrastive alignment). SigLIP 2 is the last of the great "frozen encoder" designs; the frontier has moved past it.
- **The unit of training is the interleaved sequence**, which means packing, resolution sampling and token budget are all shared concerns (NaViT's packing machinery now serves VLMs, not just image encoders).

### What the vision side actually contributes

A useful interview question is: *given that the LLM does all the reasoning, what does the vision encoder need to provide?* The answer, from the multimodal RL literature (Chapter 7), is:

1. **Enough visual detail to ground the answer.** If the encoder downsamples too aggressively, the model cannot see the object it needs to count or localise. This is the "visual token budget" question.
2. **Localisation information.** A VLM that can answer "what is in this image" but not "where is it" is useless for grounding tasks. SigLIP 2's dense-feature training, PE's localisation focus, and the IoU-based rewards in Perception-R1 all address this.
3. **Robustness to resolution and aspect ratio.** Documents, screenshots, medical images, satellite imagery — all have different aspect ratios and resolutions. NaFlex-style variable resolution is now standard for exactly this reason.

### The post-training layer, and why vision is the hard part

Chapter 7 covered RLVR. The vision-specific version is worth summarising here because it determines what the architecture must support:

- **Answer-matching rewards are too sparse.** A binary reward at the end of a chain gives no signal about whether the failure was perception or reasoning. Perception-aware work found that ~67% of multimodal reasoning errors are *perceptual*.
- **Language shortcuts are the failure mode.** A VLM can learn to ignore the image and answer from text priors, and a reward that only checks the final answer will happily reinforce that. Vision-SR1's fix — require a self-contained visual description that is sufficient to answer, then verify by re-prompting on that description alone — is a *structural* fix that changes what the model must do before it can be rewarded.
- **Perceptual grounding needs spatial outputs.** Perception-R1's bounding-box reward gives the RL signal a spatial component, and it achieves strong results with 1,442 training samples versus Vision-R1's 200k. That is a *sample-efficiency* result, and it is the strongest evidence that the reward structure, not the model, was the bottleneck.

The architectural conclusion: **a VLM designed for RL post-training must produce intermediate, checkable, spatially-grounded outputs** — not just a final answer. That is a requirement on the *output format* and the *decoder head*, and it is a design decision that is usually invisible in the architecture diagram.

### Where this leaves the "why transformers?" question

VLMs are the strongest case for the transformer thesis, and the reason is subtle:

> It is not that a transformer is a better vision encoder than a CNN. It is that a transformer is a *shared* representation space for images, text, and eventually video, audio and action — and the transformer's token interface is what makes that sharing possible.

A CNN can produce a good image representation. It cannot produce a representation that lives in the same space as a language model's tokens, to be attended to by the same attention weights, in the same sequence, with the same positional encoding. The transformer won because it is a **common currency** across modalities, and the value of that currency grows with every modality you add. That is an argument no CNN can answer, and it is the real reason the frontier is unified-multimodal-transformer-based.

**What would change my mind:** The "shared token space is the reason for unification" claim would be weakened if a modality-specific encoder (a CNN for vision, a spectrogram front-end for audio) could be fused into a language trunk as effectively as a token-based encoder — i.e., if a *non-token* representation could be attended to by the same attention weights without a loss of capacity. Early-fusion VLMs with convolutional vision front-ends (e.g., ConvNeXt-based VEs) do exist and perform well, which suggests the claim is *approximately* true rather than exactly true. The open question is whether the token interface is essential or merely convenient.

<div id="chapter-19"></div>

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

<div id="chapter-20"></div>

## 20. Inside the labs: Anthropic and Thinking Machines through the four lenses

This chapter does not describe either company's production architecture — neither publishes it in detail, and anything claimed about it here would be speculation. What it does is take the *public* research and engineering writing from both and read it through the four lenses, because that is the best available signal for what each lab believes and optimises for. If you are interviewing at either, this is the kind of reasoning they will expect you to be able to do about *any* lab.

### Anthropic: the interpretability-first lab

Anthropic's public research is distinctive in that a large fraction of it is about the *internal geometry* of the model rather than about benchmark scores. Three threads matter for this book:

**1. The Jacobian lens and the "global workspace."** Anthropic's J-Lens work decodes the internal activations of Claude by transporting residual-stream vectors into a final-layer basis and reading them with the model's own unembedding. The headline finding is that Claude appears to have an internal "workspace" — a set of dimensions that hold a summary of what the model is about to do — and that this workspace acquires a "point of view" during *post-training*. In the base model it mostly tracks what is needed to predict the next token; in the post-trained model it starts holding Claude's own reactions.

Read this through the four lenses:

- **Inductive bias:** the workspace is not designed in. It emerges from the residual stream's structure and the training objective. Anthropic's claim is that post-training *installs* a point of view, which is a statement about how the objective shapes the geometry.
- **Optimization:** the finding that post-training changes the internal geometry, and that "helpful-only" variants perform *better* on introspection than production variants, is a statement about what the alignment objective does to capability. It is not obvious, and it cuts against the naive "more alignment = more capable" story.
- **Expressivity:** the workspace is a *compression* of the forward pass into a readable basis. It is an expressivity statement: the model's computation is (partially) expressible in a human-readable coordinate system.
- **Systems:** the J-Lens requires a full forward-pass Jacobian, which is expensive. The fact that they can do it at all is a systems result, and the code release matters for reproducibility.

**2. Tracing thoughts and circuits.** Anthropic's circuit-tracing work identifies intermediate conceptual steps inside Claude's reasoning — e.g., activating "Dallas is in Texas" then "the capital of Texas is Austin" — and shows the model *combining* facts rather than regurgitating. They also show the model can be caught making up plausible reasoning to agree with a false user hint. The architectural implication: **the model's reasoning is distributed across layers and can be interrogated layer by layer**, which is a property of the residual stream and the attention pattern, not of the output tokens.

**3. Constitutional AI and post-training.** Anthropic's alignment approach trains on *principles* (the constitution) rather than only on demonstrations, and their "Teaching Claude why" paper argues that demonstrations alone are insufficient — teaching the model to explain *why* an action was better generalises better. That is an *optimization* claim with an *inductive-bias* flavour: a principle is a soft prior over behaviour, and it generalises better than a set of examples.

**What this tells you about how to answer at Anthropic.** Their interviewers will push on:

- Whether you can reason about *mechanisms* rather than correlations (this is the house style).
- Whether you understand that post-training is not a benign add-on but a *structural* intervention that changes the model's internal geometry.
- Whether you can talk about *evaluation* carefully — Anthropic's own writing is unusually precise about what their evaluations can and cannot show, and they repeatedly flag that their interpretability tools capture only a fraction of the computation.

### Thinking Machines: the signal-density lab

Thinking Machines Lab's public work is narrower but sharper, and it is squarely a *post-training* thesis. Three threads:

**1. On-policy distillation (Chapter 7).** The core claim is that dense, per-token, on-policy supervision dominates sparse, outcome-level reward in the regime they tested, at 9–30× lower compute. This is an *optimization* claim with a *systems* consequence (it changes what you should spend compute on) and an *expressivity* subtext (the teacher's distribution carries more information than a label or a verifier).

**2. Batch invariance in inference.** "Defeating Nondeterminism in LLM Inference" argues that GPU kernels should produce bitwise-identical outputs regardless of batch size. This is a pure *systems* result: it is not about accuracy at all, it is about whether you can share a KV cache across requests of different sizes, which determines whether you can batch efficiently. It is a good example of research that improves *productivity* rather than capability, and it signals a lab that cares about the engineering of inference as much as the model.

**3. LoRA without regret.** Their work on low-rank adaptation argues that LoRA can match full fine-tuning when the training distribution is right, and that the gap closes further with on-policy distillation. This is an *optimization* claim about parameter-efficient adaptation, and it matters for anyone deploying custom models.

**What this tells you about how to answer at Thinking Machines.** Their interviewers will push on:

- Whether you can compute the *information content* of a training signal, not just its accuracy.
- Whether you understand the training/inference *distribution mismatch* (on-policy vs. off-policy) as a first-class problem.
- Whether you can reason about *cost* — their whole thesis is that the same capability can be reached at a fraction of the compute if you choose the right signal.

### The common thread: both labs are making the same argument

Read both through the four lenses and the same claim appears:

> **The bottleneck is not model capacity. It is the information content of the training signal and the efficiency of the systems that deliver it.**

Anthropic argue this from the interpretability side: the model's internal geometry already contains the reasoning, and the question is how to elicit and verify it. Thinking Machines argue it from the post-training side: the model's capability is bounded by the density and relevance of the signal it is trained on, and on-policy distillation is a way to increase that density cheaply.

Neither is a vision-architecture claim. Both are *optimization* claims, and both are arguments that the field's centre of gravity has moved from "make the model bigger" to "make the signal denser and the systems tighter."

### What to do with this in an interview

If you are asked about either lab, do not try to recite their papers. Instead:

1. **Name the claim** in one sentence ("on-policy distillation gets more learning signal per episode than sparse RL reward").
2. **Name the mechanism** (dense per-token supervision vs. sparse outcome reward; `O(N)` vs `O(1)` signal per episode).
3. **Name the regime where it holds** (reasoning benchmarks, matched architecture, same SFT init).
4. **Name what would falsify it** (a matched-compute pure RLVR run that beats it; or a task where the teacher has no advantage).

That four-step pattern works for any research question, at any lab, in any modality. It is the single most valuable thing in this book, and it is what Chapter 21 drills.

**What would change my mind:** The "signal density is the bottleneck" claim would be weakened if a pure scale-up — more parameters, more data, more compute, with no change in signal structure — produced a proportional capability gain that on-policy distillation could not match. The evidence from the post-training literature is that this is not what happens: gains from RLVR and distillation are *not* explainable by pretraining scale alone, and labs have confirmed the shift in their own scaling curves and methodology papers. But the claim is strongest for reasoning-like tasks with verifiable outcomes; it is much less established for open-ended generation and for tasks where the reward is a learned preference.

# Part VI — Interview Preparation

<div id="chapter-21"></div>

## 21. Interview drills: the one-page model and 40 questions

This chapter is deliberately practical. It contains a one-page mental model you can recite, and forty questions with answer sketches, ordered by lens. The questions are not a script — they are a checklist of things you should be able to talk about for five minutes each without notes.

### The one-page mental model

> **Architecture is a four-way tradeoff. There is no dominant architecture; there is a dominant architecture for a given constraint set.**
>
> **1. Inductive bias** — CNNs bake in locality, translation equivariance and hierarchy. ViTs bake in global mixing, a flat token grid, and learned positional encodings. Strong bias is free regularisation and a small-data advantage; weak bias is a higher ceiling once data is plentiful. **The crossover happens at roughly 10–30M images.** Below it, CNNs win; above it, ViTs win. Soft biases (ConViT) and hybrid blocks (CoAtNet, MambaVision) get the best of both, at the cost of complexity and latency.
>
> **2. Optimization** — CNNs train with SGD/BN and converge fast from scratch. ViTs need AdamW, warmup, heavy augmentation, long schedules and EMA, because LayerNorm gives no batch-level regularisation and attention is rank-collapsing. The recipe gap closed by 2023–2024; today the recipe is a shared baseline, not a differentiator. The remaining optimization frontier is *post-training*: RLVR, on-policy distillation, process reward models.
>
> **3. Expressivity** — attention is a universal, permutation-equivariant sequence mixer that routes information globally in one layer, at quadratic cost, and collapses rank with depth unless the MLP and skip connection rescue it. CNNs are universal in the image sense and route long-range information only with depth. Neither dominates; the question is which routing cost you can afford. Linear-time models (SSMs, linear attention) trade exact recall for linear cost — a *different function class*, not a faster implementation.
>
> **4. Systems** — the roofline governs: `P = min(π, β·AI)`. Convolution is compute-bound and kernel-optimised. Naive attention is memory-bound; FlashAttention makes it compute-bound by fusing and tiling. Mobile silicon is convolution-first; server GPUs are matrix-first and favour attention's regularity for tensor parallelism. Decode is memory-bound; large batch is the only lever.
>
> **The synthesis:** the frontier is not "transformers vs CNNs." It is "at what density of attention does the expressivity win justify the cost, given the token budget, the data regime and the deployment hardware?" The field's answer is a *portfolio* — DINOv3 for dense features, SigLIP 2 for semantics and variable resolution, PE for localisation, ConvNeXt/RepViT for mobile, MambaVision for long sequences, DiTs for generation. The fact that no single backbone dominates all four lenses is the strongest evidence that the tradeoffs are real.

### How to answer any architecture question

1. **Reframe it as a tradeoff.** "What priors are baked in, and what does each cost?"
2. **Name the regime.** Small data, large data, mobile, server, dense, semantic, long-context.
3. **Name the mechanism.** Not "transformers are better" but "attention routes globally in one layer, CNNs need depth proportional to distance."
4. **Name the systems constraint.** Roofline, batch size, hardware, token budget.
5. **Name the falsifier.** What observation would make your answer wrong?

### Questions, by lens

**Lens 1 — Inductive bias**

1. *Why do ViTs need more data than CNNs?* Weak bias means the model must learn locality and translation equivariance from data; a CNN gets them for free via weight sharing. The cost is paid upfront, and it is only worth paying if the data budget is large enough.
2. *What is translation equivariance, and why does it matter?* The same filter is applied at every location, so a feature is detected wherever it appears. It reduces the number of free parameters per distinct pattern and makes the model sample-efficient.
3. *Where does the CNN/ViT crossover happen, and why?* Empirically around 10–30M images for ImageNet-scale architectures; below it CNNs win, above it ViTs win. The crossover is not a function of parameter count (matched-size ViT-B vs ResNet-50 show it), which identifies it as an inductive-bias effect.
4. *Is shape bias good or bad?* Neither, universally. It is good for ImageNet-style classification and for corruption robustness; it is bad for texture-discriminating tasks (material classification, surface defect detection, some medical imaging). "More human-like" is a claim about a specific benchmark, not a universal truth.
5. *What is a soft inductive bias, and why is it interesting?* A term in the objective that encourages a property without forcing it (ConViT's gated convolutional branch). Interesting because it lets the model behave like a CNN when data is scarce and a ViT when it is abundant — the optimal bias is data-dependent.
6. *Why do ViTs have "registers"?* Because the transformer has no designated place for global scratch computation, so it repurposes low-information background patch tokens, producing high-norm artifacts that hurt dense prediction. Adding a few learnable tokens that are discarded at the output gives the model a legitimate scratch space. The deeper cause is *lazy aggregation*: the CLS learns to pool global semantics from background patches.
7. *If ViTs are better at scale, why are there still new CNNs?* Because the transformer's win is partly a *block-structure* win (token mixer + channel mixer), which CNNs can adopt (RepViT, ConvNeXt, MobileNetV4). CNNs also win on mobile hardware, where the silicon is convolution-first.
8. *What is MetaFormer, and why does it matter?* The argument that a transformer block's effectiveness comes from the generic structure (token mixer + channel mixer + norm + residual), not from attention specifically. It matters because it generalises the insight into a design template that CNNs can use.

**Lens 2 — Optimization**

9. *Why LayerNorm instead of BatchNorm in ViTs?* LayerNorm is per-sample and per-position, so it provides no batch-level regularisation and does not assume the batch statistics are stable at inference. It also interacts with attention's rank collapse. The cost is a less smooth landscape, which forces warmup, augmentation and long schedules.
10. *What is the modern ViT recipe?* AdamW, cosine schedule with warmup, decoupled weight decay, RandAugment/MixUp/CutMix, stochastic depth, label smoothing, EMA. ConvNeXt's contribution was largely *this recipe*.
11. *Why does a ViT need a bigger batch than a CNN?* The LayerNorm + AdamW combination has a narrower basin of attraction; more samples per update gives a more reliable gradient estimate.
12. *What is EMA and why use it?* An exponential moving average of weights. The final weights of stochastic optimisation are noisy; averaging gives a point that generalises better. Standard in diffusion and large-scale SSL.
13. *What is Gram anchoring, and what problem does it solve?* DINOv3 observed that global metrics keep improving while dense metrics degrade after ~200k steps, because patch features lose locality. Gram anchoring regularises the *pairwise similarity structure* of patch features against an earlier teacher checkpoint — preserving relations without freezing values.
14. *What is the Chinchilla result, and does it apply to vision?* For a fixed compute budget, scale parameters and data together. Vision's optimal ratio is *lower* than language's (more and cheaper unlabelled data), and resolution is a fourth knob that vision has and language does not.
15. *What is the single biggest lever in vision today?* Curated data at scale. DINOv3 and SAM 3 both attribute their gains primarily to data preparation, not architecture.
16. *Compare RLHF, DPO and RLVR.* RLHF optimises a learned preference model; DPO removes the reward model and optimises a contrastive objective against a reference; RLVR replaces the preference with a programmatically checkable reward, enabling on-policy training at scale with no reward model.
17. *Why is RLVR a selection process, not an instruction?* It increases the probability of trajectories that reach a verifiable success state. If the base model cannot reach the state at all, RLVR has nothing to select.
18. *What is on-policy distillation, and why is it cheaper than RL?* Sample rollouts from the student, score every token against the teacher's distribution, optimise reverse KL. Signal per episode is `O(N)` tokens rather than `O(1)` scalar, so it needs far fewer episodes.
19. *What is the main failure mode of multimodal RLVR?* Reward sparsity plus language shortcuts: the model learns to ignore the image and answer from text priors. Fixes include decomposing perception and reasoning (Vision-SR1), spatial rewards (Perception-R1), and process reward models.
20. *What is a process reward model?* A model that supervises intermediate steps rather than only the final outcome, giving dense credit assignment and localising which step failed.

**Lens 3 — Expressivity**

21. *If CNNs and ViTs are both universal, what's the difference?* They are universal in different spaces: CNNs on the image, ViTs on the sequence. The ViT can route information globally in one layer; the CNN needs depth proportional to distance. Neither is more universal.
22. *What can attention do that a CNN cannot?* Route a value from an arbitrary position to an arbitrary position in one layer, content-dependently. This is what makes it good at retrieval-like tasks, counting, and referring to distant objects.
23. *What can attention not do?* It cannot create information (it is a convex combination of values), it cannot be exact at quadratic cost, and it cannot be precise about fine spatial relationships without a good positional encoding.
24. *What is rank collapse?* Token representations converge to a common point as depth grows, reducing effective dimensionality. Two forms: in depth (from repeated matrix multiplication and attention's averaging) and in width (from a spectral gap in the attention matrix, which worsens with context length).
25. *What prevents collapse in practice?* Skip connections (preserve input rank), MLPs (non-linear transformation), LayerNorm (richer set of equilibria), local/sparse attention (slower collapse), and careful initialisation.
26. *Why is local attention theoretically justified?* Collapse is slower for graphs with larger radius, so sparse/local attention is not only faster but also less collapsing — a rare case where an efficiency argument has a theoretical basis.
27. *Why is linear attention not just "fast softmax attention"?* Its effective rank is bounded by the head dimension, so it is a *different function class* with limited capacity. It is a low-rank approximation of softmax attention.
28. *What is the difference between SSMs and linear attention?* SSMs (Mamba) make the transition parameters input-dependent, giving content-dependent memory that linear attention lacks. Mamba can be viewed as a low-rank approximation of softmax attention with a learned mask.
29. *How do you decide between attention and an SSM?* By whether you need exact, dense, long-range associative recall. If yes, attention. If you need linear cost and can tolerate a lossy state, SSM. Hybrids use attention where the token count is small enough to afford it.

**Lens 4 — Systems**

30. *What is the roofline model?* `P = min(π, β·AI)` where AI is FLOPs per byte. Below the ridge point (`AI = π/β`, ~295 on an H100) you are memory-bound; above it, compute-bound.
31. *Why is the memory wall the dominant constraint?* Compute has grown ~100× in a decade while bandwidth grew ~10×, so the ridge point moved right and more operations became memory-bound.
32. *Why does batch size matter so much at inference?* Decode is a matrix-vector product: AI ≈ batch size. Doubling the batch doubles the FLOPs at fixed weight-load bytes, so AI doubles. At batch 1 you use ~0.3% of peak.
33. *What does FlashAttention actually do?* Tiles the computation, fuses QKᵀ/softmax/PV into one kernel, and uses online softmax so the N×N matrix never exists in HBM. Same FLOPs, far fewer bytes, so AI rises from ~d to ~N and attention becomes compute-bound.
34. *Why is operator fusion the highest-leverage optimisation?* Elementwise ops have AI of 1–3; on an H100 with a ridge at 295 they run at 1–10% of peak. Fusing them means the intermediate never touches HBM.
35. *Why are transformers easier to shard than CNNs?* Every block has the same shape, so tensor parallelism balances evenly. CNNs change shape per stage, which creates load imbalance.
36. *Why does quantisation help more than the size reduction suggests?* It helps memory-bound ops most (the weight load), and GEMMs benefit; elementwise ops and normalisations benefit little. The speedup is not proportional to the size reduction.
37. *Why is batch invariance a research topic?* If kernels are not bitwise-invariant across batch sizes, you cannot share a KV cache across requests of different sizes, which wastes compute. It is a systems result with a direct product consequence.
38. *Why are FLOPs a bad metric on mobile?* Mobile and NPU latency is determined by memory traffic, bank conflicts and instruction issue, not by theoretical FLOPs. A depthwise convolution has low FLOPs but is bandwidth-bound. Always measure on target hardware.
39. *Why is a VAE a CNN inside a transformer generation system?* Because convolution is the right tool for local compression and reconstruction, and it is cheap. The DiT handles the long, global sequence; the VAE handles the local, redundant pixel structure. The split is exactly the CNN/transformer split.

**Cross-lens**

40. *So why transformers instead of CNNs?* Because for the regimes that matter at the frontier — billions of examples, long sequences, global reasoning, hardware that rewards regular computation — the weak bias buys a higher ceiling, the quadratic cost is manageable with fused kernels, and the token interface makes multimodal fusion possible. In the regimes where data is scarce, the distribution is close to natural-image statistics, or the deployment is mobile, convolutions are still the right answer. The frontier's answer is a portfolio, and the portfolio is the proof that the tradeoffs are real.

**What would change my mind:** The drills would be wrong twice over. First, if you can answer every question by recall rather than reasoning — meaning the book has taught you the *papers* rather than the *tradeoffs*. Second, if the four-lens frame turns out to be a false dichotomy: for instance, if someone showed that expressivity and systems are the same axis (that what a model *can represent* is entirely determined by what the hardware will *run*), the four-part split would collapse into two, and this book's structure would be the wrong one. That is a real possibility — the roofline has been known to explain architecture choices that people attributed to inductive bias — and it is worth defending the split explicitly when asked.

<div id="chapter-22"></div>

## 22. Sources and further reading

Every claim in this book is traceable to one of these. The list is organised by topic so you can read around a single lens, and each entry notes *what to look for* — the one result or table worth remembering. Links are to arXiv or the publisher; blog posts are linked directly. Numbers quoted in the text come from the papers' own protocols and are not independently re-run.

### Foundations

- **Attention Is All You Need** — Vaswani et al., 2017. [arXiv:1706.03762](https://arxiv.org/abs/1706.03762). The transformer block, and the original argument that attention is a sufficient mixing operation.
- **An Image is Worth 16×16 Words: Transformers for Image Recognition at Scale** — Dosovitskiy et al., 2021. [arXiv:2010.11929](https://arxiv.org/abs/2010.11929). The ViT paper. Look for the ImageNet-1k vs. ImageNet-21k/JFT crossover — it is the origin of the whole inductive-bias debate.
- **Deep Residual Learning for Image Recognition** — He et al., 2016. [arXiv:1512.03385](https://arxiv.org/abs/1512.03385). The residual connection; the single most important optimisation in deep vision.
- **MobileNetV3** — Howard et al., 2019. [arXiv:1905.02244](https://arxiv.org/abs/1905.02244). The mobile baseline RepViT modernises.
- **MobileNetV4: Universal Models for the Mobile Ecosystem** — Qin et al., 2024. [ECCV paper](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/05647.pdf). The Universal Inverted Bottleneck, which unifies the Inverted Bottleneck, ConvNeXt block and FFN.

### Lens 1 — Inductive bias

- **ConViT: Improving Vision Transformers with Soft Convolutional Inductive Biases** — d'Ascoli et al., 2021. [PMLR](https://proceedings.mlr.press/v139/d-ascoli21a/d-ascoli21a.pdf). The soft-bias idea: a gated convolutional branch that switches off as data grows.
- **CoAtNet: Merging Convolution and Attention from Everywhere** — Dai et al., 2021. [arXiv:2106.05968](https://arxiv.org/abs/2106.05968). Conv-attention merging at multiple scales.
- **Training Data-Efficient Image Transformers & Distillation Through Attention (DeiT)** — Touvron et al., 2021. [arXiv:2103.13965](https://arxiv.org/abs/2103.13965). The recipe: how a ViT trains from scratch without a huge dataset.
- **Early Convolutions Help Transformers See Better** — Trockman & Kolter, 2022. [arXiv:2201.01991](https://arxiv.org/abs/2201.01991). The cheapest possible locality prior — a convolutional stem.
- **MetaFormer: What Really Matters in Transformer Architecture?** — Yu et al., 2022. [arXiv:2111.11418](https://arxiv.org/abs/2111.11418). The token-mixer/channel-mixer argument; the theoretical basis for RepViT.
- **A ConvNet for the 2020s (ConvNeXt)** — Liu et al., 2022. [arXiv:2201.03545](https://arxiv.org/abs/2201.03545). Modernising ResNet with ViT-style blocks.
- **ConvNeXt V2: Co-designing and Scaling ConvNets with Masked Autoencoders** — Woo et al., 2023. [arXiv:2301.00808](https://arxiv.org/abs/2301.00808). Fully convolutional MAE + Global Response Normalization.
- **RepViT: Revisiting Mobile CNN From ViT Perspective** — Wang et al., 2024. [arXiv:2307.09283](https://arxiv.org/abs/2307.09283). ViT design ideas re-imported into MobileNetV3; >80% ImageNet at 1.0 ms on iPhone 12.
- **Vision Transformers Need Registers** — Darcet et al., 2023. [arXiv:2309.16588](https://arxiv.org/abs/2309.16588). The high-norm artifact tokens and the register fix.
- **Vision Transformers Don't Need Trained Registers** — 2025. [arXiv:2506.08010](https://arxiv.org/abs/2506.08010). The register neurons mechanism and the training-free fix.
- **Vision Transformers Need More Than Registers** — 2026. [arXiv:2602.22394](https://arxiv.org/abs/2602.22394). Lazy aggregation as the root cause.
- **Swin Transformer: Hierarchical Vision Transformer** — Liu et al., 2021. [arXiv:2103.14030](https://arxiv.org/abs/2103.14030). The hierarchical-ViT line.
- **Intriguing Properties of Vision Transformers** — Naseer et al., 2021. [NeurIPS](https://proceedings.neurips.cc/paper/2021/file/c404a5adbf90e09631678b13b05d9d7a-Paper.pdf). Corruption robustness and shape bias.
- **ImageNet-trained CNNs are biased towards texture** — Geirhos et al., 2019. [arXiv:1811.12231](https://arxiv.org/abs/1811.12231). The texture-vs-shape finding.
- **Are CNNs or Transformers more like human vision?** — Geirhos et al., 2021. [arXiv:2105.07197](https://arxiv.org/abs/2105.07197). Error-consistency evidence for ViTs being more human-like.
- **Understanding Robustness of Transformers for Image Classification** — Bhojanapalli et al., 2021. [arXiv:2111.05464](https://arxiv.org/abs/2111.05464). ViT corruption robustness versus CNNs.
- **A large-scale examination of inductive biases shaping high-level visual representation in brains and machines** — Borsoi et al., 2024. [Nature Communications](https://www.nature.com/articles/s41467-024-53147-y). 224 models; architecture explains less than training diet.
- **Towards Flexible Inductive Bias via Progressive Reparameterization Scheduling** — 2022. [arXiv:2210.01370](https://arxiv.org/abs/2210.01370). The Fourier-analysis result that the more convolution-like the bias, the smaller the data scale needed before a ViT wins.

### Lens 2 — Optimization

- **Masked Autoencoders Are Scalable Vision Learners (MAE)** — He et al., 2022. [arXiv:2111.06377](https://arxiv.org/abs/2111.06377). The masked-image-modelling baseline.
- **Emerging Properties of Self-Supervised Vision Transformers (DINO)** — Caron et al., 2021. [arXiv:2104.14294](https://arxiv.org/abs/2104.14294). Self-distillation with no labels; the origin of the register phenomenon.
- **DINOv2** — Oquab et al., 2023. [arXiv:2304.07193](https://arxiv.org/abs/2304.07193). Large-scale self-supervised ViT with strong dense features.
- **DINOv3** — Siméoni et al., 2025. [arXiv:2508.10104](https://arxiv.org/abs/2508.10104) · [Meta AI blog](https://ai.meta.com/blog/dinov3-self-supervised-vision-model/). The 7B SSL backbone, Gram anchoring, and the dense-feature degradation finding.
- **SigLIP** — Zhai et al., 2023. [arXiv:2303.15334](https://arxiv.org/abs/2303.15334). Sigmoid loss for language-image pretraining.
- **SigLIP 2: Multilingual Vision-Language Encoders** — Tschannen et al., 2025. [arXiv:2502.14786](https://arxiv.org/abs/2502.14786). Unified recipe, NaFlex variable resolution.
- **CLIP** — Radford et al., 2021. [arXiv:2103.00020](https://arxiv.org/abs/2103.00020). Contrastive image-text pretraining.
- **Perception Encoder: The best visual embeddings are not at the output of the network** — Bolya et al., 2025. [arXiv:2504.13181](https://arxiv.org/abs/2504.13181). The encoder inside SAM 3; intermediate-layer features and spatial alignment.
- **Scaling Vision Transformers to 22 Billion Parameters (ViT-22B)** — Dehghani et al., 2023. [arXiv:2302.05442](https://arxiv.org/abs/2302.05442). Parallel layers, QK normalisation, omitted biases; the training-instability story at scale.
- **Training Compute-Optimal Large Language Models (Chinchilla)** — Hoffmann et al., 2022. [arXiv:2203.15556](https://arxiv.org/abs/2203.15556). The parameter/data ratio.
- **Scaling Laws for Neural Language Models** — Kaplan et al., 2020. [arXiv:2001.08361](https://arxiv.org/abs/2001.08361). Power-law scaling.
- **Thinking Machines Lab — On-Policy Distillation** — Lu, 2025. [Blog](https://thinkingmachines.ai/blog/on-policy-distillation/). Dense per-token on-policy supervision versus sparse RL reward.
- **Thinking Machines Lab — Defeating Nondeterminism in LLM Inference** — He, 2025. [Blog](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/). Batch-invariant kernels and KV-cache sharing.
- **Thinking Machines Lab — LoRA Without Regret** — Schulman et al., 2025. [Blog](https://thinkingmachines.ai/blog/). Parameter-efficient adaptation that matches full fine-tuning.

### Lens 3 — Expressivity

- **Attention Is Not All You Need: Pure Attention Loses Rank Doubly Exponentially with Depth** — Dong et al., 2021. [arXiv:2103.03404](https://arxiv.org/abs/2103.03404). Rank collapse in depth; the role of skip connections.
- **On the Role of Attention Masks and LayerNorm in Transformers** — Wu et al., 2024. [arXiv:2405.18781](https://arxiv.org/abs/2405.18781). Local attention slows collapse; LayerNorm gives equilibria of any rank.
- **Mind the Gap: A Spectral Analysis of Rank Collapse and Signal Propagation in Attention Layers** — 2024. [arXiv:2410.07799](https://arxiv.org/abs/2410.07799). Rank collapse in *width* and the spectral-gap mechanism.
- **On the Ability of Self-Attention Networks to Recognize Regular Languages** — Yun et al., 2019. [arXiv:1906.06755](https://arxiv.org/abs/1906.06755). Expressivity limits of attention.
- **Transformers are Universal In-context Learners** — 2024. [arXiv:2408.01367](https://arxiv.org/abs/2408.01367). In-context learning as a universal property.
- **Mamba: Linear-Time Sequence Modeling with Selective State Spaces** — Gu & Dao, 2023. [arXiv:2312.00752](https://arxiv.org/abs/2312.00752). The S6 selective scan.
- **Vision Mamba: Efficient Visual Representation Learning with Bidirectional State Space Model** — Zhu et al., 2024. [arXiv:2401.09417](https://arxiv.org/abs/2401.09417). Bidirectional SSM for vision.
- **VMamba: Visual State Space Model** — Liu et al., 2024. [arXiv:2401.10166](https://arxiv.org/abs/2401.10166). 2D selective scan; the hierarchical SSM backbone.
- **MambaVision: A Hybrid Mamba-Transformer Vision Backbone** — Hatamizadeh et al., 2025. [CVPR](https://openaccess.thecvf.com/). Attention where the token count is affordable.
- **Demystify Mamba in Vision: A Linear Attention Perspective** — 2024. [arXiv:2405.16605](https://arxiv.org/abs/2405.16605). Why Mamba works where linear attention does not.
- **The Hidden Attention of Mamba Models** — 2025. [ACL](https://aclanthology.org/2025.acl-long.76.pdf). SSMs as attention with implicit, dense basis.
- **Thinking Slow, Fast: Scaling Inference Compute with Distilled Reasoners** — 2025. [arXiv:2502.20339](https://arxiv.org/abs/2502.20339). Faster models win at fixed time budget.

### Lens 4 — Systems

- **A Roofline Model of Performance** — Williams, Waterman & Patterson, 2009. [CACM](https://cacm.acm.org/research/a-roofline-model-for-performance/). The arithmetic-intensity framework.
- **FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness** — Dao et al., 2022. [arXiv:2205.14135](https://arxiv.org/abs/2205.14135). Tiling, fusion, online softmax.
- **FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning** — Dao, 2023. [arXiv:2307.08691](https://arxiv.org/abs/2307.08691).
- **FlashAttention-3: Fast, Accurate, and Memory-Efficient Attention for Hopper GPUs** — Shah et al., 2024. [arXiv:2407.08608](https://arxiv.org/abs/2407.08608).
- **Patch n' Pack: NaViT, a Vision Transformer for any Aspect Ratio and Resolution** — Dehghani et al., 2023. [arXiv:2307.06304](https://arxiv.org/abs/2307.06304). Sequence packing, masked attention, factorized positional embeddings.
- **FlexiViT: One Model for All Patch Sizes** — Beyer et al., 2023. [arXiv:2212.08013](https://arxiv.org/abs/2212.08013). Variable patch size via weight resizing.
- **Pix2Struct: Screenshot Parsing as Visual Language Modeling** — Lee et al., 2022. [arXiv:2210.03347](https://arxiv.org/abs/2210.03347). Aspect-ratio-preserving patching.

### Dense prediction and segmentation

- **End-to-End Object Detection with Transformers (DETR)** — Carion et al., 2020. [arXiv:2005.12872](https://arxiv.org/abs/2005.12872). Set prediction and Hungarian matching.
- **DN-DETR: Accelerate DETR Training by Introducing Query Denoising** — Li et al., 2022. [arXiv:2203.01305](https://arxiv.org/abs/2203.01305). Why Hungarian matching is unstable and how to fix it.
- **DINO: DETR with Improved DeNoising Anchor Boxes** — Zhu et al., 2022. [arXiv:2203.03605](https://arxiv.org/abs/2203.03605).
- **Mask2Former: Unified Image Segmentation** — Cheng et al., 2022. [arXiv:2112.01527](https://arxiv.org/abs/2112.01527).
- **Segment Anything (SAM)** — Kirillov et al., 2023. [arXiv:2304.02643](https://arxiv.org/abs/2304.02643).
- **SAM 2: Segment Anything in Images and Videos** — Ravi et al., 2024. [arXiv:2408.00714](https://arxiv.org/abs/2408.00714).
- **SAM 3: Segment Anything with Concepts** — Carion et al., 2025. [arXiv:2511.16719](https://arxiv.org/abs/2511.16719) · [Meta AI](https://ai.meta.com/research/publications/sam-3-segment-anything-with-concepts/). Promptable concept segmentation, the presence head, and the 4M-concept data engine.

### Vision-language and unified models

- **LLaVA: Visual Instruction Tuning** — Liu et al., 2023. [arXiv:2304.08485](https://arxiv.org/abs/2304.08485).
- **InternVL: Scaling up Vision Foundation Models** — Zhu et al., 2023. [arXiv:2312.14238](https://arxiv.org/abs/2312.14238).
- **Qwen2-VL** — Bai et al., 2024. [arXiv:2409.12191](https://arxiv.org/abs/2409.12191). M-RoPE and dynamic resolution.
- **Frontier Vision-Language Models: Architectural Evolution, Benchmarks, Applications, and Challenges** — 2025. [arXiv:2501.02189](https://arxiv.org/abs/2501.02189). A survey of the VLM landscape and its post-training shift.
- **Reinforcement Learning in Vision: A Survey** — 2025. [arXiv:2508.08189](https://arxiv.org/abs/2508.08189). RLHF → RLVR → GRPO in vision.
- **Perception-R1: Advancing Multimodal Reasoning via Visual Perception Reward** — 2025. [arXiv:2506.07218](https://arxiv.org/abs/2506.07218). IoU-based visual rewards and sample efficiency.
- **Vision-SR1: Self-Rewarding VLM via Reasoning Decomposition** — 2025. [arXiv:2508.19652](https://arxiv.org/abs/2508.19652).
- **V-Triune / Orsta: Visual Triple Unified Reinforcement Learning** — 2025. [arXiv:2505.18129](https://arxiv.org/abs/2505.18129). Reward routing, verifier-level verification, Dynamic IoU.
- **Perception-Aware Policy Optimization for Multimodal Reasoning** — 2025. [arXiv:2507.06448](https://arxiv.org/abs/2507.06448). The ~67% perception-error finding.
- **Improving VLMs with Perception-centric Process Reward Models (Perceval)** — 2026. [arXiv:2604.24583](https://arxiv.org/abs/2604.24583). Token-level error grounding.

### Generation

- **Denoising Diffusion Probabilistic Models (DDPM)** — Ho et al., 2020. [arXiv:2006.11239](https://arxiv.org/abs/2006.11239).
- **High-Resolution Image Synthesis with Latent Diffusion Models** — Rombach et al., 2022. [arXiv:2112.10752](https://arxiv.org/abs/2112.10752). Latent-space diffusion — the reason DiTs are affordable.
- **Scalable Diffusion Models with Transformers (DiT)** — Peebles & Xie, 2023. [arXiv:2212.09748](https://arxiv.org/abs/2212.09748). DiT scaling laws.
- **Scaling Rectified Flow Transformers (SD3)** — Esser et al., 2023. [arXiv:2303.01469](https://arxiv.org/abs/2303.01469). MMDiT.
- **HunyuanVideo: A Systematic Framework for Large Video Generative Models** — Kong et al., 2024. [arXiv:2412.03602](https://arxiv.org/abs/2412.03602).
- **Wan: Open and Advanced Large-Scale Video Generative Models** — Wan et al., 2025. [arXiv:2503.20314](https://arxiv.org/abs/2503.20314).
- **HunyuanVideo 1.5 Technical Report** — Wu et al., 2025. [arXiv:2511.18870](https://arxiv.org/abs/2511.18870). Unified DiT, 3D causal VAE, SSTA, super-resolution.

### Anthropic and Thinking Machines (public material)

- **Anthropic — A global workspace in language models** — [research](https://www.anthropic.com/research/global-workspace). The Jacobian lens, the J-space, and post-training's effect on internal geometry.
- **Anthropic — Tracing the thoughts of a large language model** — [research](https://www.anthropic.com/research/tracing-thoughts-language-model). Circuit tracing and multi-step reasoning.
- **Anthropic — Teaching Claude why** — [research](https://www.anthropic.com/research/teaching-claude-why). Principles versus demonstrations in alignment training.
- **Anthropic — Claude's Constitution** — [constitution](https://www.anthropic.com/constitution). The principle-based alignment target.
- **Anthropic — System Card: Claude Opus 4.5** — [system card](https://www.anthropic.com/claude-opus-4-5-system-card). Post-training and hybrid reasoning.
- **Thinking Machines Lab — Connectionism blog index** — [blog](https://thinkingmachines.ai/blog/). On-policy distillation, batch invariance, LoRA, modular manifolds.
- **Thinking Machines Lab — Tinker** — [tinker](https://thinkingmachines.ai/tinker/). The training API that the distillation work was built on.

### Reading order if you only have a week

1. ViT (2021) → DeiT → ConvNeXt → RepViT. This gives you the whole inductive-bias arc in four papers.
2. MAE → DINOv2 → DINOv3. The self-supervision arc, and the dense-feature degradation result.
3. FlashAttention → NaViT → SigLIP 2. The systems-and-resolution arc.
4. Thinking Machines' on-policy distillation, then Anthropic's global-workspace post. The two post-training theses.
5. Chapter 21's forty questions, out loud, with a timer.

**Provenance reminder.** The bibliography is a curated subset, not an exhaustive survey. Where a paper's numbers are quoted in the text, they are the authors' own reported figures under their own protocols; comparing them across papers without matching patch size, resolution, data mix and training duration is the most common way this field produces false conclusions.

**What would change my mind:** If a significant result in this field turned out to be *unreportable* — that is, if the named papers were not enough to reach the conclusions claimed here, because the crucial detail lives in an unpublished training run or in a private system card — then this chapter's whole approach, and every claim in the book that depends on it, would be incomplete. That is a real risk for the lab-facing chapters (20 especially), which rest on public engineering writing rather than full technical disclosures. The honest position is that the book is as trustworthy as its sources, and the source list is the audit trail: read it, and you can decide for yourself which claims you are carrying into the interview.
