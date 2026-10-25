## 10. Memory, association, and the token budget

There is a family of expressivity limitations that is neither about universal approximation nor about rank collapse, and it is the one that most directly shapes modern architecture decisions: **the cost of remembering and associating information.** This is where the "why not a CNN?" question gets its most interesting answers, because the answer is not about representation at all — it is about the *budget* of tokens and parameters.

### The three budgets

Every sequence model manages three resources, and they are coupled:

1. **Parameter budget.** The number of weights. This is the "knowledge" budget: what the model can store as learned transformations.
2. **Token budget (context length).** How many tokens can be attended to simultaneously. This is the "working memory" budget: what the model can hold *in the input*.
3. **Compute budget.** FLOPs per forward pass. This is the "thinking" budget: how much the model can compute over what it holds.

The central expressivity result of the modern era is that **these are not interchangeable**. A model with a small context can hold less working memory but can still know a lot; a model with a large context can hold more but pays quadratic attention cost; a model with more compute can reason longer over the same context. Frontier models are scaling all three, but the *ratios* matter, and the ratios are what architecture determines.

### Why long context is not free

Attention is `O(N²)` in tokens, which means:

- Doubling the context quadruples the attention FLOPs (and, for the score matrix, the memory).
- The *effective* precision of positional information degrades with `N` (rank collapse in width, Chapter 9).
- The model must learn to *ignore* irrelevant context, and that is a learned skill that requires training data with irrelevant context in it.

This is why "just make the context longer" is not a solution, and why architectures that make long context cheap (SSMs, linear attention, sparse attention, hybrid) are interesting — but also why they trade away something (Chapter 11).

### Associative recall: the canonical test

The standard test for a model's memory machinery is **associative recall**: given a sequence of tokens where `A1 B1 A2 B2 ... AN BN`, and a query `A3`, return `B3`. A transformer can do this with exact attention, because the query `A3` can attend directly to the token `A3` and copy its paired value. An SSM can do it only if the state has not been overwritten by intervening tokens. A CNN cannot do it without depth proportional to `N`.

This is the sharpest illustration of the architecture tradeoff, and it is worth stating as a table:

| Architecture | Associative recall cost | Working memory | Long-range precision |
|---|---|---|---|
| Full attention | `O(N²)`, exact | Full context | Exact (given positional encoding) |
| Sliding window / sparse | `O(N·k)`, k = window | Bounded | Degrades beyond window |
| Linear attention / SSM | `O(N)`, state-limited | Compressed state | Bounded by state size |
| CNN | `O(N·k)`, depth-limited | Receptive field | Degrades beyond field |

The key insight: **there is no free lunch, but the lunches have different shapes.** Attention buys exact long-range recall at quadratic cost. SSMs buy linear cost at the price of a compressed, lossy state. CNNs buy hardware efficiency at the price of depth. The "best" architecture depends on which of these you can afford — which is a systems question, and it loops back to Lens 4.

### The parameter-vs-token trade, and why it matters for vision

There is a specific version of this trade that is very important for vision: **the number of visual tokens grows with resolution, and resolution is how you get detail.** A 4K image at patch 16 gives 16,000+ tokens; a 4K video frame at the same patch gives 16,000 tokens *per frame*. Video is where this bites hardest: a 10-second 24fps video at 720p is roughly 10,000 frames' worth of visual information, and you cannot put that in a context window.

The practical consequences:

- **Video models compress aggressively.** HunyuanVideo 1.5 uses a 3D causal VAE with 16× spatial and 4× temporal compression, so a 720p 121-frame clip becomes a manageable latent sequence, and then uses selective/sliding tile attention to prune redundant KV blocks. That is a *systems* decision driven by an *expressivity* constraint.
- **VLMs use visual token budgets deliberately.** Qwen3-VL and InternVL cap the number of visual tokens and use downsampling or tiling to control the tradeoff between detail and context. The "visual token budget" is a first-class hyperparameter in modern VLM design.
- **High-resolution vision uses hierarchical or tiled processing.** LLaVA-NeXT's AnyRes tiles a high-res image into a base image plus sub-images; NaViT packs variable resolutions. Both are ways of managing the token budget.

This is a genuinely useful interview point, because it is the intersection of expressivity and systems, and because most people think of "context length" as a language-model problem. In vision it is a *resolution* problem, and the two are the same problem.

### In-context learning: memory as computation

The strongest modern expressivity results are about **in-context learning** — the ability to learn from the input without parameter updates. Transformers are universal in-context learners for a broad class of functions, and this is not an accident: the attention mechanism can implement induction heads, regression over the context, and copying, all in a forward pass. The implication is that **"memory" and "computation" are the same thing in a transformer** — attending to the right tokens *is* the computation. That is why a transformer with a long context can do more than a transformer with the same parameters and a short context, and why increasing context length is a form of scaling *capability*, not just capacity.

**What would change my mind:** The claim "attention's exact recall is worth the quadratic cost" would be weakened by a linear-time architecture that matched full attention on associative-recall benchmarks *at the same context length and parameter count* — especially on the *hard* recall tasks where the target is far away and the state must be preserved through distractors. Current SSMs and linear attention do well on short-range and simple tasks and degrade on long-range, many-key recall. A decisive result here would be the most important architecture result in years.
