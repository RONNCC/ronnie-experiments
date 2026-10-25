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
