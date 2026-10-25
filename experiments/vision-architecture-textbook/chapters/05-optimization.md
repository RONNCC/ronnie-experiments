# Part II — Lens 2: Optimization

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
