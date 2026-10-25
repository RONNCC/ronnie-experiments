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
