## 9. Rank collapse, signal propagation, and the depth/width trade

This is the chapter that most interviewees have never read, and it is the one that most impresses people who do read it — because it is a *theoretical* result with *practical* consequences, and because it explains behaviours you can observe in any trained model.

### The phenomenon

Train a transformer and look at the pairwise cosine similarity of its token representations. In a healthy model, tokens from different parts of the image should be *different* — a patch of sky and a patch of car should not be similar. In a model suffering from **rank collapse**, the token representations converge to a common point: all tokens become similar, the effective dimensionality of the representation falls, and the model's ability to distinguish tokens degrades.

Two distinct forms exist, and they have different causes:

- **Rank collapse in depth.** As representations propagate through many layers, they converge to a low-dimensional subspace. This is partly a consequence of repeated matrix multiplication (a general property of deep networks, not specific to attention) and partly specific to attention's averaging structure.
- **Rank collapse in width.** A 2024 random-matrix-theory analysis identified a *new* phenomenon: even within a *single* attention layer, the stable rank of the token representations collapses as the context length grows. The cause is a **spectral gap** between the largest and second-largest singular values of the attention matrix — the largest eigenvalue "escapes" the bulk of the spectrum, which makes the attention operator behave like a rank-one projection.

The width-collapse result is important because it explains a practical phenomenon that had no explanation: **longer contexts make attention worse, not just more expensive.** It is not merely that attention costs `O(N²)`; it is that the *quality* of the attention computation degrades as `N` grows. This gives a theoretical justification for the many practical fixes (attention scaling, relative position biases, rotary encodings) that people adopted heuristically.

### The spectral picture, in one paragraph

Model the attention matrix as a random Markov matrix. Its eigenvalues form a bulk plus a single outlier. The outlier is the uniform component — the "average everything" direction — and it has eigenvalue 1, while the bulk shrinks as `O(1/√N)`. The gap between them is what drives collapse. **Removing the outlier** (the paper's proposed fix) restores the bulk and prevents width-collapse. This is a rare case where a purely spectral argument produces a *simple, effective, implementable* fix, and it is the kind of result that rewards understanding the mechanism rather than the recipe.

### What prevents collapse in practice

If pure attention collapses, why do real transformers work? Because real transformers are not pure attention. The mitigating components, in order of importance:

1. **Skip connections.** They preserve the input's rank and let information bypass the collapsing attention. The skip connection is not just an optimisation trick — it is what stops the network from being an ensemble of shallow attention layers.
2. **MLPs.** They provide the non-linear transformation that attention's convex-combination structure cannot. They are essential for universality and they slow collapse.
3. **LayerNorm.** The 2024 analysis showed that LayerNorm allows a rich set of equilibria of any rank — it does *not* prevent collapse in general, but it makes the dynamics far more expressive than the pure-attention analysis suggested, and it refutes the earlier claim that it is irrelevant.
4. **Local / sparse attention patterns.** Collapse is slower for graphs with larger radius (i.e., more sparse, less globally-connected attention). This is a *theoretical* justification for sliding-window and sparse attention — they are not only faster, they are *less collapsing*.
5. **Warmup and initialisation.** Small initial learning rates and careful init keep the early training trajectory in a non-collapsed regime.

### The depth/width trade

Rank collapse gives a concrete meaning to the depth/width tradeoff:

- **Deep and narrow** (many layers, small embedding) → collapse is fast in depth; the model must rely on skip connections and MLPs to preserve information, and its effective capacity is limited.
- **Shallow and wide** (few layers, large embedding) → collapse is slower per layer, but the model has fewer compositional steps, so it cannot build hierarchical features.
- **The practical optimum** is a balance, and it is *task-dependent*: classification wants fewer layers, dense prediction wants more, and the optimum shifts as you scale.

This is a useful interview answer to "why not just make the transformer deeper?" — because depth buys collapse, and collapse costs you the ability to distinguish tokens, which is exactly what dense prediction needs.

### A practical corollary: the register connection

Rank collapse and the register phenomenon (Chapter 3) are related but distinct. Rank collapse is about the *dimensionality* of the token representations across the network. Registers are about the model *repurposing* specific tokens as scratch space for global computation. Both are symptoms of the same underlying fact: **the transformer has no structural place to put "global" information, so it puts it wherever it can — which is wherever the locality constraint is weakest.**

That framing unifies three otherwise-unrelated results:

- **Registers** fix it by adding dedicated scratch tokens.
- **Gram anchoring** (DINOv3) fixes it by regularising the *structure* of patch similarities, which keeps dense features from being absorbed into the global representation.
- **Frequency-aware aggregation** ("more than registers") fixes it by preventing the CLS from aggregating background patches in the first place.

Three different fixes, one mechanism. That is the kind of synthesis an interviewer is looking for.

**What would change my mind:** The claim "attention collapses and the MLP/skip rescue it" would be weakened by a trained transformer in which the attention layers demonstrably preserve full token rank across depth without any skip or MLP — or, conversely, by a proof that collapse is unavoidable in any attention-based architecture of practical depth. The current theory says collapse is inevitable in *pure* attention and avoidable in *complete* transformers, and the experiments support that; the boundary case (attention-only but with normalisation and residual-like structure) is still being explored.
