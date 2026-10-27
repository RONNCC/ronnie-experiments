## 3. VLA architecture: turn modalities into a policy

A vision-language model can describe an image; a vision-language-action model must produce a command with the right dimension, timing, scale, and physical consequence. Adding an action head to a VLM is therefore not just an output-layer change. It creates a contract between semantic representation and control.

A modular VLA can be drawn as:

```text
images → vision encoder → visual tokens ────┐
instruction → tokenizer / text encoder ─────┼→ fusion / temporal backbone → action head → controller
robot state → normalization / projection ───┘
```

This decomposition lets you reason about each interface. It also describes several real families at a useful level of abstraction, without pretending their implementations are identical.

### Vision: spatial evidence under a token budget

A convolutional encoder produces feature maps with built-in locality and hierarchy. A Vision Transformer (ViT) splits an image into patches and processes patch tokens with attention; the original [ViT paper](https://arxiv.org/abs/2010.11929) is a useful baseline. Pretrained visual encoders such as [DINOv2](https://arxiv.org/abs/2304.07193) and [SigLIP](https://arxiv.org/abs/2303.15343) offer different representation objectives and properties. Do not select one by brand: test task performance, spatial precision, fine-tuning stability, resolution behavior, and inference cost.

Ask of any vision front end:

- Does the policy need global semantic identity, fine contact geometry, or both?
- Are camera intrinsics and extrinsics needed, or can the policy learn from pixels and state?
- Does resizing distort aspect ratio or erase small objects?
- How are multiple cameras combined: concatenated tokens, pooled features, camera embeddings, or separate encoders?
- What happens if a camera drops frames or is absent for one embodiment?

High-resolution multi-camera video can dominate the token and decoding budget. A larger language model will not compensate for a visual bottleneck. Profile pixels, tokens, and latency as one system.

### Language: task conditioning, not a guarantee of understanding

Language may identify the task (“pick up the red block”), constrain the object, or provide a high-level plan. Common choices include a pretrained text encoder whose features are fused with visual tokens, or a VLM backbone already trained on paired vision-language data.

[RT-2](https://arxiv.org/abs/2307.15818) is a landmark example of transferring vision-language knowledge into robotic action by representing actions as tokens. [OpenVLA](https://arxiv.org/abs/2406.09246) provides an open 7B implementation built from pretrained vision-language components and robot demonstrations. [Octo](https://arxiv.org/abs/2405.12213) is an open generalist transformer policy supporting language or goal-image conditioning and fine-tuning to new observation and action spaces. [π₀](https://arxiv.org/abs/2410.24164) combines a pretrained VLM with a flow-matching action expert. Read these as different design points, not a linear leaderboard.

Language conditioning tests should include:

- exact training phrasing;
- human-written paraphrases not used for augmentation;
- semantically irrelevant adjective changes;
- swapped object or relation instructions;
- instructions with no demonstrated corresponding behavior;
- empty or corrupted language, to expose hidden task leakage.

If a policy performs identically after the instruction is replaced with nonsense, it may be using background or initial state to infer the task. That can be appropriate in a one-task system, but it is not evidence of language grounding.

### State and embodiment: do not throw away the proprioception

Images alone may not reveal joint configuration, gripper state, or contact-related motion. Project normalized proprioceptive features into the fusion backbone. Include an embodiment identifier only if it carries information not already present; an ID can help distinguish action conventions, but it can also become a shortcut.

Different robots may have different state and action dimensions. Options include per-embodiment projections and heads, padded shared vectors with masks, embodiment-specific normalizers, and learned adapters. Each makes a different bet on what is shared. Never concatenate raw joint angles from two robots and assume a shared semantic meaning.

### Fusion and temporal context

Three common fusion patterns are:

1. **Early concatenation:** project every modality to a shared token dimension and concatenate. This is simple and expressive, but sequence length and attention cost grow quickly.
2. **Cross-attention:** action or state queries attend to visual and language context. This can decouple the action sequence length from the context length and provides a clear conditioning interface.
3. **Late fusion:** pool each modality and combine compact vectors. This is cheap and useful as a baseline, but may lose spatial or token-level interactions.

For history, choose whether the backbone is causal, bidirectional over past observations, or a temporal encoder over precomputed features. A causal mask must prevent access to future frames during training. Position encodings should distinguish camera, modality, history position, and action-chunk position where those distinctions matter.

A shape contract for a small policy might be:

```text
images:       [B, T, C, 3, H, W]     # two cameras, one timestep example
state:        [B, T, state_dim]
instruction:  [B, text_tokens]
visual tokens:[B, T * C * patches, D]
action query: [B, H, D]
output:       [B, H, action_dim]
mask:         [B, H]                  # valid future actions only
```

Write these shapes in tests. Many “architecture failures” are actually broadcasting errors, flattened camera/time dimensions, or a mask that allows future leakage.

### A four-family reading, not a universal winner

| Family | What it contributes | What it does not settle for you |
|---|---|---|
| [RT-1](https://arxiv.org/abs/2212.06817) | Large-scale real-robot transformer policy and action discretization | Your data scale, tokenizer, or manufacturing evaluation |
| [RT-2](https://arxiv.org/abs/2307.15818) | Vision-language pretraining transferred to action-token prediction | Whether web knowledge improves your contact-rich task |
| [Octo](https://arxiv.org/abs/2405.12213) | Open generalist policy, flexible goals, transformer/diffusion design | The best fine-tuning recipe for every embodiment |
| [OpenVLA](https://arxiv.org/abs/2406.09246) | Open VLM-based VLA and practical fine-tuning investigation | That a 7B model is necessary for your task |
| [π₀](https://arxiv.org/abs/2410.24164) | Flow-matching action expert and broad cross-embodiment training | A guaranteed latency or data-efficiency advantage in your setup |

Benchmark results in these papers use different data, tasks, model sizes, and evaluation procedures. Use them to generate hypotheses, then run controlled comparisons in your environment.

### Build a TinyVLA before fine-tuning a giant one

A useful learning model can have frozen pretrained vision and text encoders, a small temporal transformer, and interchangeable action heads. Freeze components initially so you can train on limited compute and attribute failures. Then unfreeze selected layers as a separate experiment.

Keep these baselines:

- state-only MLP;
- vision-only policy;
- vision + state without language;
- vision + state + language;
- the same fusion model with different action heads.

This sequence measures what each modality buys. It also provides a fallback when the most expressive system is worse because of optimization, overfitting, or inference cost.

**Prove it:** Write and test a TinyVLA shape contract, then train vision-only and vision-language variants on the same multi-task episodes. Include an instruction-swap test, a missing-camera test, parameter and token counts, measured inference latency, and a table that keeps architecture constant while changing only one modality.
