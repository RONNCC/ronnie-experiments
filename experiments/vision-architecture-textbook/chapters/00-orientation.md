# Vision Models & ML Architecture — A Four-Lens Field Guide

*Research edition · 25 October 2026 · A Ronnie's Experiments learning sandbox*

[Open the interactive web reader](index.html) · This single-file edition is generated as `TEXTBOOK.md` from the canonical chapters.

> **Scope and provenance.** This is an original synthesis of public research, written to prepare for technical interviews at frontier AI labs. It is not a transcript of any company's internal material, it does not describe non-public systems, and it makes no claim about any specific lab's production stack. Where a paper is cited, the link is given in Chapter 22 so you can read the primary source. Benchmark numbers are quoted as reported by their authors, on their own protocols — they are not independently re-run here, and small differences in recipe (patch size, resolution, data mix, epoch count) can move results by more than the differences being discussed.

## 0. How to read this book

The question you were asked is the right one, and it is usually answered badly. *"Why do we use transformers instead of CNNs?"* gets answered with a slogan — "transformers are better" — which is false in half the regimes you will actually be asked about. The honest answer is that **architecture is a set of tradeoffs across four independent dimensions**, and the right choice depends on which dimension is binding in your specific situation.

This book organises everything around the four lenses you supplied:

| Lens | Core question | The one-sentence answer |
|---|---|---|
| **1. Inductive bias** | What priors are baked in? | CNNs bake in locality, translation equivariance and hierarchy; ViTs bake in global mixing and a flat token grid. Strong bias is free regularisation and a small-data advantage; weak bias is a larger ceiling once data is plentiful. |
| **2. Optimization** | How well does it train? | CNNs train with SGD/BN and converge fast from scratch; ViTs need AdamW, long schedules, strong augmentation and warmup. Both are solved problems now — the gap closed by *recipes*, not architecture. |
| **3. Expressivity** | What can it represent? | Attention is a universal, permutation-equivariant sequence mixer, but it collapses rank with depth and pays quadratic cost. CNNs are a constrained but efficient function class. Neither dominates in theory; both are fine in practice at scale. |
| **4. Systems** | How does it map to hardware? | Attention is memory-bound unless you use FlashAttention; convolution is compute-bound and kernel-optimised. ViTs are regular, parallel and tensor-parallel friendly; CNNs win on mobile and at small batch. |

Everything else in this book is the evidence behind those four sentences.

### The framing that makes this useful in an interview

There are two ways to talk about architecture in an interview, and one of them sinks you:

- **The trivia way:** "ViT has self-attention and CNNs have convolutions." This is a description, not an analysis. It tells the interviewer nothing they don't already know and invites the follow-up *"so why did ViT win?"* — which you will then be unable to answer at depth.
- **The tradeoff way:** "The choice between them is a tradeoff between sample efficiency and capacity ceiling, mediated by data scale, and then re-mediated by systems constraints." This is a position. It can be argued with, tested, and — crucially — it is *falsifiable*, which is what interviewers at research labs are actually listening for.

When you are asked a architecture question, do three things in order: **name the tradeoff, name the regime where each side wins, then name the mechanism that explains the crossover.** That sequence is the spine of this book and the spine of Chapter 21's drills.

### Why the four lenses, specifically

These four lenses are not arbitrary. They are the four places where an architecture decision can *fail*:

1. **Inductive bias** is where you fail by being too rigid — a CNN that cannot represent a long-range dependency, or a model whose prior is wrong for the domain (medical imaging, satellite imagery, document understanding).
2. **Optimization** is where you fail by being unable to train what you designed — a beautifully expressive architecture that never converges, or that needs 10× the compute for the same accuracy.
3. **Expressivity** is where you fail by being unable to represent the function — this is the pure theory question, and it is the one interviewers probe with "can a transformer do X?" questions.
4. **Systems** is where you fail in production — a model that is theoretically superior and 3× slower, or that cannot be batched, quantised, or sharded.

A good architecture answer touches all four and identifies which one is binding. A bad answer treats them as one thing.

### How the chapters are built

Each chapter is written to be read in one sitting and to leave you with a claim you can defend. Every chapter ends with a short **"What would change my mind"** note: the experiment or observation that would falsify its central claim. That is deliberate. Research interviews are not memory tests; they are tests of whether you can reason about evidence. Being able to say *"this claim would be wrong if X were true"* is more valuable than being able to recite ten papers.

Chapters 1–4 are Lens 1. Chapters 5–7 are Lens 2. Chapters 8–11 are Lens 3. Chapters 12–15 are Lens 4. Chapters 16–20 map the actual state of the art as of late 2025–2026. Chapter 21 is the interview drill. Chapter 22 is the annotated source list.

The interactive lab on the web reader is not decoration. It implements the two calculations that most often decide these debates in practice: **the roofline/attention-cost calculator** (Lens 4) and **the backbone recommender** (Lens 1 × Lens 4). Changing the assumptions there and watching the recommendation flip is the fastest way to build the intuition that the whole book is arguing for: there is no dominant architecture, only dominant architectures *for a constraint set*.

### A note on the labs you are interviewing with

You mentioned Anthropic and Thinking Machines. Both are worth studying not because they publish their architectures — they do not, in detail — but because their *public research* reveals what they optimise for. Anthropic's interpretability work (Chapter 20) treats the internal geometry of a transformer as the primary object of study, which tells you something about how they think about capability. Thinking Machines' on-policy distillation work (Chapter 7) is a bet that *post-training signal density* matters more than pre-training scale, which is a claim about optimization economics. Neither is a vision-architecture paper. Both are the kind of argument you should be able to make, in any modality, on any architecture.

**What would change my mind:** If a single architecture family dominated across all four lenses simultaneously — small data *and* large data, mobile *and* server, dense prediction *and* generation — then this book's central claim would be wrong and the question "why transformers?" would have a clean answer. That has not happened. The strongest current evidence that it will not is that the frontier keeps re-introducing convolutions (RepViT, MobileNetV4, ConvNeXt) *after* the transformer won the benchmark wars.

