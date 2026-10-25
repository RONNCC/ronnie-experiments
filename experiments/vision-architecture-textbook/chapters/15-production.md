## 15. ViT versus CNN in production: parallelism, quantization, and inference

Lens 4 ends with the question that actually matters in a deployment: given two architectures that are close on accuracy, which one do you ship? The answer is almost never "the one with fewer FLOPs."

### Distributed training: regularity beats efficiency

Training a large model means splitting it across many accelerators. The three standard dimensions are:

- **Data parallelism (DP)** — each GPU holds a copy of the whole model and processes a different shard of the batch. Cheap, but it does not reduce per-GPU memory or enable larger models.
- **Tensor parallelism (TP)** — split individual layers across GPUs (e.g., the attention heads or the FFN columns). Requires all-reduce communication every layer, so it only pays off when the model is large enough that the communication is a small fraction of the work.
- **Pipeline parallelism (PP)** — put different layers on different GPUs. Reduces memory but adds bubbles.

**Transformers are tensor-parallel friendly because they are regular.** Every block has the same shape, so you can split heads or FFN columns evenly and the load balances. **CNNs are not**, because their shapes change from stage to stage (stem, stage 1, stage 2, ... each with different channel counts), which makes even splitting hard and creates load imbalance.

This is a *structural* reason, not a tuning one, and it is why frontier training infrastructure was built around transformers. If you are training a 7B-parameter model across 256 GPUs, the architecture that shards cleanly is the architecture you can train at all.

### MoE: sparse compute, dense memory

Mixture-of-Experts is a different kind of systems trade: keep the parameter count (and therefore the memory) large, but activate only a subset per token. Wan 2.2 uses a 27B-parameter MoE with ~14B active; ERNIE 5.0 uses an ultra-sparse MoE. MoE is a *compute-vs-memory* trade: you buy capability by buying memory bandwidth and paying for it in communication.

The systems cost is **all-to-all communication** — every token must be routed to the right expert, and the experts are distributed across devices. MoE therefore only pays off when the compute saved exceeds the communication added, which depends on the sparsity and the network topology. It is also a *training-and-inference* asymmetry: the paper on ERNIE 5.0 explicitly notes that ultra-sparse MoE "exacerbates the training–inference discrepancy," which is a real engineering problem.

### Quantization: memory-bound problems are quantisation-friendly

Quantisation (FP8, INT8, INT4) reduces both memory footprint and bandwidth, and therefore helps *memory-bound* operations most. Since decode is memory-bound (Chapter 12), quantisation is the single highest-leverage inference optimisation for a large model. Two consequences:

- **Attention and FFN GEMMs benefit directly** from FP8/INT8, because they are compute-bound but the weights still must be loaded.
- **The softmax, LayerNorm and elementwise ops do not benefit much** — they are already memory-bound and their arithmetic is cheap, so reducing their precision saves little.

This is why a quantised model's speedup is not proportional to its size reduction. The practical rule: **quantise the weights and activations of the GEMMs, and keep the normalisations and softmax in higher precision.**

### KV cache, and why decode is different

For autoregressive models, the KV cache grows with the sequence length and the batch size, and it is *the* memory bottleneck at long context. Attention with a cached KV is a matrix-vector product per query, which is memory-bound (AI ≈ batch size). This is why:

- **Batch invariance matters.** Thinking Machines' "Defeating Nondeterminism in LLM Inference" argues that GPU kernels should produce bitwise-identical results regardless of batch size, so that the KV cache can be shared across requests of different sizes. Without batch invariance, you cannot batch a small request with a large one, and you waste compute. This is a *systems* result with a direct product consequence, and it is a good example of research that is not about accuracy at all.
- **Sliding-window and sparse attention help decode** because they bound the KV cache growth.
- **Speculative decoding** trades a small model's cheap guesses for the large model's verification, improving throughput without changing the output distribution.

### Distillation and compression as deployment decisions

The most common production move is not to deploy the model you trained. You deploy a **distilled, quantised, pruned, or sparsified** version, and the choice of architecture for the *small* model is different from the choice for the *teacher*. This is where the CNN/transformer tradeoff reappears in a new form:

- A **7B ViT teacher** can be distilled into a **RepViT mobile student** for edge deployment, because the student only needs to reproduce the teacher's *decisions*, not its representations.
- Thinking Slow, Fast showed that a distilled **Mamba** model can beat its transformer teacher at fixed time budget, because it generates faster and therefore spends more compute per answer.

The general principle: **the architecture of the deployed model is chosen for the deployment constraint, not for the training objective.** This is why a single frontier model spawns a whole family of edge variants, and why architecture selection is a *product* decision as much as a research one.

### The production checklist

When asked "which architecture should I deploy?", run this list:

1. **Latency budget on target hardware** — measure, do not estimate. Mobile NPUs and server GPUs have completely different optimal arithmetic.
2. **Batch size at serving** — small batches favour memory-bound ops (convolution, decode); large batches favour compute-bound ops (attention, FFN).
3. **Memory footprint** — model size, KV cache growth, activation memory.
4. **Sequence/resolution length** — quadratic attention binds at high resolution and long context.
5. **Training infrastructure** — can you shard it across your cluster?
6. **Distillation path** — is there a teacher whose decisions you can transfer to a smaller, cheaper student?

**What would change my mind:** The "regularity makes transformers trainable at scale" claim would be weakened if a CNN family demonstrated clean, communication-efficient tensor parallelism at frontier scale — e.g., a 7B-parameter CNN trained across thousands of GPUs with load balance comparable to a transformer. The current evidence is that CNNs have a harder time (variable shapes per stage), which is why the frontier is transformer-based. A demonstrated counterexample would be a major result.
