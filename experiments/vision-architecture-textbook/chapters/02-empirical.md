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
