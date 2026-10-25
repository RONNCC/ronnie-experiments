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
