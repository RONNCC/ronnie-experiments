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
