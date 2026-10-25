# Part III — Lens 3: Expressivity

## 8. What attention can compute

Expressivity questions in interviews usually take one of two forms: "can a transformer do X?" or "why is a transformer better than a CNN if they're both universal approximators?" Both are best answered by being precise about *what kind* of universality is in play, because the answer differs.

### Three different meanings of "universal"

1. **Universal function approximation on a fixed-size input.** Any continuous function on a compact set can be approximated by a sufficiently wide network — CNNs, ViTs and MLPs all satisfy this. This is the weakest and least useful sense, and it is the one that makes "but they're both universal!" a non-answer.
2. **Universal sequence-to-sequence approximation.** A transformer with a strongly-connected attention graph can approximate any continuous sequence-to-sequence function, with the number of layers scaling with the *diameter* of the graph. This is a genuine result (Yun et al., 2020; and follow-ups showing that even *one* attention layer plus softmax, or two attention layers, suffices for universality). It is stronger than (1) because it is uniform over sequence length and it respects the token structure.
3. **In-context learning / universal in-context learners.** Deep transformers can implement induction and regression heads directly from the context, which is a much stronger claim — it is about *learning without parameter updates*. This is where the modern expressivity results are, and it is the most relevant to how frontier models actually behave.

The key distinction for the CNN/ViT question: **a CNN is universal on the *image* as a whole, but its compositional structure means it cannot easily implement a *content-dependent, long-range* function without depth. A transformer is universal on the *sequence*, which means it can implement a function of the entire input in a bounded number of layers, but it must learn the locality.** Neither is "more universal"; they are universal in different spaces.

### Attention is an average — and that is the whole story

The most important theoretical fact about attention is that it is an *average* of value vectors, weighted by content-dependent scores. `Attention(Q,K,V) = Σ_j softmax(q·k_j) v_j`. Because the weights sum to one, the output is a convex combination of the value vectors. This has three consequences that show up everywhere:

- **Attention cannot create information.** It can only redistribute what is in `V`. If the relevant signal is not in the value vectors, attention cannot recover it — no matter how many layers.
- **Attention can implement "copy this token's value to that position".** By making the softmax sharply peaked, attention becomes an identity/copy operation. This is why transformers are so good at retrieval-like tasks: they can route a value from a distant position to a query position in one layer.
- **Attention cannot implement a *density*-like operation without an MLP.** The MLP is what allows the model to transform the mixed representation non-linearly. This is why the "MLP is the real expressivity" claim has some truth: attention mixes, the MLP computes.

The practical implication for the CNN/ViT debate: **a ViT's advantage is not that it can represent more functions, but that it can route information across arbitrary distances in one layer.** A CNN needs depth proportional to the distance. If your task requires long-range routing — counting, spatial reasoning, referring to an object mentioned anywhere in the context, matching across a large canvas — that routing cost is the real difference, and it is a systems-and-depth cost, not a representational one.

### What attention cannot do cheaply

Three well-known limitations, each with a specific cost:

1. **Associative memory is quadratic.** To recall "the third object" or "the object mentioned two paragraphs ago", attention must compare the query against all keys. This is `O(N²)` in tokens and `O(N²)` in memory for the score matrix. Linear attention and SSMs trade expressivity for linear cost (Chapter 11).
2. **Precision of positional information degrades.** Softmax attention with learned absolute positions has limited precision for *fine* spatial relationships. This is why relative and rotary encodings exist, and why vision models that need precise localisation (detection, segmentation, OCR) use them or add convolutional refinement.
3. **No built-in scale invariance.** A CNN with pooling is approximately scale-covariant. A ViT at a fixed resolution is not: an object that doubles in size occupies four times the tokens. This is why resolution and scale are the dominant practical knobs in vision, and why models like NaViT sample resolutions during training.

### The "attention is not all you need" line of work

There is a productive body of theory that argues attention *alone* is expressively limited, and the result is worth knowing precisely because it is often misquoted:

- **Rank collapse in depth.** Pure attention-only networks lose rank doubly-exponentially with depth: all tokens converge to a common representation. The skip connection and the MLP counteract this. This is a *structural* result, not an implementation detail.
- **The MLP is necessary for universality.** Attention alone (without MLP) cannot achieve full sequence-to-sequence universality; the MLP provides the non-linear transformation that attention's convex-combination structure lacks.
- **LayerNorm changes the picture.** A 2024 analysis showed that with LayerNorm, the attention dynamics can have equilibria of *any rank between one and full*, and that for a generic class of inputs tokens provably do *not* collapse — refuting the earlier hypothesis that LayerNorm plays no role. This is a good example of a theory result that overturned a prior belief, and it is worth citing because it shows the theory is still moving.

The synthesis: **attention is a powerful but structurally constrained mixer. It is universal in the sequence sense, it routes information globally, and it needs the MLP and the residual to avoid collapse. A CNN is a structurally constrained but efficiently-composable mixer that is universal in the image sense but pays in depth for long-range routing.** The right architecture is the one whose constraints align with the task's structure — which is, again, the inductive-bias answer, seen from the expressivity side.

**What would change my mind:** The "attention routes globally in one layer, CNNs need depth" claim would be weakened by a CNN architecture that implements arbitrary content-dependent global routing in `O(1)` depth with `O(1)` additional parameters per routing decision. Large-kernel convolutions and deformable convolutions approximate this but pay in parameters or in the discreteness of the sampling grid. A continuous, content-addressable routing primitive in a convolutional framework would be a genuine architectural novelty.
