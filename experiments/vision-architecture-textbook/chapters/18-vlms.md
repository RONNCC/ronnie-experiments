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
