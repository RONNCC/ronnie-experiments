# Part V — The State of the Art

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
