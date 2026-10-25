# Part VI — Interview Preparation

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
