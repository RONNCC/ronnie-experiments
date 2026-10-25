## 11. Beyond softmax: SSMs, linear attention, and hybrids

Everything above assumed softmax attention. The last three years have produced a serious research programme on *replacing* it, and you need to understand it, because it is the live frontier of architecture research and because it is where the "why transformers?" question is genuinely open.

### The problem with softmax attention

Softmax attention has three costs that are structural, not implementation-related:

1. **Quadratic time and memory** in sequence length. This is the famous one, and it is what makes video, long documents, and high-resolution vision expensive.
2. **Dense, unstructured mixing.** Every token attends to every other token. This is a *waste* when most of the context is irrelevant — and in real data, most of it is.
3. **No compression.** The model must keep the entire history in the input. There is no mechanism for summarising the past.

Linear attention, SSMs and sparse attention each address a different subset of these.

### Linear attention: cheap, but rank-limited

Linear attention replaces the softmax with a kernel function applied to queries and keys, so that the attention matrix is factorised and the computation can be reordered into a linear recurrence:

```
softmax(QKᵀ/√d)V      →      (QKᵀ)V  with Φ(Q), Φ(K)
```

The consequence: **the effective rank of the attention matrix is bounded by the head dimension**, which is typically 64–128. That is a *strong* expressivity constraint — it means linear attention cannot represent an arbitrary dense attention pattern. Empirically, linear attention underperforms softmax attention at matched size, and the reason is now well understood: it is a low-rank approximation of softmax attention, and the rank is the limiting factor.

The practical lesson: **linear attention is not "softmax attention but faster".** It is a *different function class* with a *bounded rank*, and you pay for that bound in capability. The systems win is real, but it is not free.

### SSMs / Mamba: selective, input-dependent recurrence

The **selective state-space model** (S6, Mamba) is the most important alternative. It keeps the linear recurrence but makes the transition parameters *input-dependent* — `Δ`, `B`, `C` are functions of the input. This gives the model the ability to *filter* its memory: it can choose to remember or forget based on content. The result is a model with:

- **Linear time and memory** in sequence length.
- **Content-dependent memory**, which linear attention lacks.
- **No quadratic attention**, and no `O(N²)` memory.

The theoretical framing that makes this intelligible: **Mamba can be viewed as a low-rank approximation of softmax attention with a learned, data-dependent mask.** That places it between linear attention (fixed, rank-limited) and softmax attention (dense, full-rank) — it gets the rank of a low-rank model but the selectivity of a dense one. It is also why the "hidden attention" analysis of Mamba finds that it produces *more* attention matrices than a transformer — it is not that it lacks attention, it is that its attention is *implicit* and *dense in a different basis*.

### The vision versions

Vision adaptations are non-trivial because images are 2D, not 1D, and the scan order matters:

- **Vision Mamba (Vim)** — bidirectional scan with position embeddings; reports 2.8× faster inference and 86.8% memory reduction at 1248² resolution versus DeiT, at comparable accuracy.
- **VMamba** — 2D selective scan (SS2D) that traverses four directions and merges; hierarchical backbone for dense prediction.
- **PlainMamba / spatial Mamba** — continuous 4-directional scanning, better spatial continuity.
- **MambaVision** — the *hybrid*: hierarchical Mamba backbone with self-attention added in the final layers where the token count is small enough for exact attention. Roughly 9:1 Mamba-to-attention, and hybrids beat both pure architectures in several settings.

The consistent finding across all of them: **Mamba-based vision models are competitive with ViTs on classification and dense prediction at matched size, and they are significantly cheaper at high resolution or long sequence.** But they are *not* uniformly better, and they are weaker in settings that need exact, dense, associative recall (Chapter 10).

### The hybrid is the practical answer

The pattern across the whole literature is that **pure alternatives do not win outright; hybrids do.** MambaVision adds attention where it is affordable. Video DiTs use sliding/tile attention rather than full attention. Language models use hybrid Mamba-Transformer stacks for long context. Thinking Slow, Fast showed that distilled Mamba models can beat their transformer teachers *at fixed time budget* because they generate faster, which lets them spend more compute on the same answer.

The reason is structural, and it is the same reason ConViT found in 2021: **attention is the most expressive and most expensive operation, so you use it where you can afford it and substitute a cheaper, structurally-biased operation where you cannot.** The specific split varies — attention in the last layers for MambaVision, attention in the first layers for some hybrids, attention everywhere for short sequences — and the optimal split is a *systems* decision driven by the token budget.

### Where this leaves the "why transformers?" question

This is the honest answer, and it is the one to give in an interview:

> Transformers won because softmax attention is the most general and most expressive mixing operation we have, and because for the sequence lengths and the hardware of the last decade, the quadratic cost was affordable. That affordability is changing. Linear-time models are closing the gap, and hybrids are starting to win in the regimes where the quadratic cost binds — long context, high resolution, video, and edge deployment. The frontier is not "transformers vs. alternatives"; it is "at what density of attention does the expressivity win justify the cost, given the token budget and the hardware?"

That is a defensible, current, and non-obvious position. It also demonstrates that you understand the question is *not* settled — which is exactly what a research interviewer wants to hear.

**What would change my mind:** The "hybrids win" claim would be weakened if a *pure* linear-time architecture matched a full softmax transformer on a task requiring exact, dense, long-range associative recall — with matched parameters, matched token budget, and matched training compute. The evidence so far is that linear-time models are close on classification and dense prediction and clearly worse on hard recall. A decisive win on hard recall would be the single most important architecture result since the transformer.
