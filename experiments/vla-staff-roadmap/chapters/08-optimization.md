## 8. Optimization, precision, and training stability

A training recipe turns a model and dataset into a sequence of numerical updates. Small changes in reduction, masking, precision, or schedule can matter as much as a new block in the architecture.

### Establish the optimization contract

Record these quantities before a run:

- objective and per-modality loss weights;
- local batch size, gradient accumulation, world size, and global batch;
- optimizer, weight decay exclusions, betas, and epsilon;
- learning rate, warmup, decay schedule, and total optimization steps;
- gradient clipping and whether the norm is computed before or after unscaling;
- precision for parameters, master weights, gradients, reductions, and sensitive operations;
- initialization, frozen parameters, activation checkpointing, and EMA if used;
- checkpoint-selection criterion and evaluation frequency.

With per-rank batch `B`, world size `W`, and `A` accumulation steps, the usual global batch is `B · W · A`. This assumes every rank contributes the same number of optimization steps and that variable-length masks are reduced correctly.

Do not scale learning rate blindly with global batch. Linear or square-root scaling rules can be useful starting points in some regimes, but robot datasets, pretrained backbones, and generative heads have their own dynamics. Sweep on a small, representative proxy and validate at the target scale.

### Overfit before you scale

The fastest useful tests are often:

1. **Forward-shape test:** every modality, mask, and output has the expected shape and dtype.
2. **Gradient-path test:** expected trainable parameters receive finite, nonzero gradients; frozen parameters do not update.
3. **Single-batch overfit:** training loss falls dramatically on a fixed small batch.
4. **Tiny-episode overfit:** the policy memorizes a few trajectories and can reproduce them in the environment.
5. **Short baseline:** a full train/validation cycle produces artifacts and closed-loop metrics.

These tests distinguish implementation defects from data-scale or architecture questions. If the model cannot overfit random labels on a tiny input, the problem is not insufficient pretraining.

### Mixed precision is a numerical design

BF16 and FP16 reduce memory traffic and can accelerate tensor operations on supported hardware. BF16 has a wide exponent range but limited mantissa; FP16 has more mantissa but a narrower range and often uses loss scaling. Neither statement means one is universally stable for every operation.

Keep sensitive reductions, normalization, optimizers, or master weights in higher precision where required by the implementation. Test:

- finite losses and gradients before and after enabling autocast;
- agreement of a small fp32 and mixed-precision run within an expected tolerance;
- gradient scale behavior for FP16, including skipped updates or infinite values;
- per-component losses, because one modality can overflow while the total appears normal;
- inference preprocessing parity in the deployed dtype.

A NaN is a symptom, not a diagnosis. Inspect the first nonfinite tensor with anomaly tooling on a small run, then check data, normalization denominators, attention masks, exponentials, learning rate, and loss scaling. Do not merely clamp every nonfinite value and continue.

### Activation memory and checkpointing

Backpropagation normally stores intermediate activations. Activation or gradient checkpointing recomputes selected activations during the backward pass, trading extra compute for lower memory. It does not reduce parameter or optimizer state, and it can interact with dropout and RNG unless implemented carefully.

Checkpoint at meaningful block boundaries, then measure peak allocated and reserved memory, step time, and numerical equivalence. Selective checkpointing may preserve more speed than checkpointing everything. The right choice depends on whether the run is memory-limited, compute-limited, or communication-limited.

Gradient accumulation also reduces the number of parameter replicas needed for a given global batch by splitting work over microsteps, but it does not by itself shrink model parameters or optimizer state. It increases time between updates and may change normalization or schedule semantics.

### Read the training dynamics

A useful dashboard includes more than total loss:

- per-task and per-modality losses;
- gradient norm, update norm, and parameter norm;
- learning rate and gradient scale;
- fraction of finite/skipped updates;
- validation action error and closed-loop success at checkpoints;
- throughput, memory, data wait time, and GPU utilization;
- sample counts per task and embodiment.

High gradient norm may indicate real optimization difficulty or a corrupted batch. Correlate spikes with sample IDs and data slices. A loss plateau can reflect capacity, learning rate, frozen representations, inconsistent labels, or an objective that no longer correlates with the target behavior.

If you use exponential moving average (EMA) of weights, evaluate both raw and EMA checkpoints and save whichever the release protocol selects. EMA is another hyperparameter, not an automatic improvement.

### Seeds and experimental variance

One seed is a debugging configuration, not an estimate of training variability. Once a recipe works, run multiple seeds for important comparisons. Hold evaluation initial states fixed or paired so that training variance is not confused with environment variance.

Bitwise determinism can be difficult across kernels and hardware. Distinguish:

- **exact reproducibility:** same artifacts and metrics bit for bit under declared conditions;
- **statistical reproducibility:** same procedure and compatible metric distributions across seeds;
- **repeatability of the decision:** the experimental conclusion survives reasonable reruns.

Report which one you achieved. Do not claim deterministic training because a seed was set.

### Throughput is part of the recipe

Measure step time decomposition: data wait, forward, backward, optimizer, communication, evaluation, and checkpointing. Samples per second alone can be misleading when sequence lengths or action horizons vary; also track tokens, frames, or transitions as appropriate.

Model FLOP utilization (MFU) compares estimated useful model FLOPs per second with a hardware peak. It requires a defensible FLOP model and a consistent precision peak. It is not the same as GPU utilization, and a high number does not guarantee good sample efficiency or task success. Optimize for time to a validated model and cost per successful improvement, not utilization in isolation.

**Prove it:** Publish a small training-stability study with single-batch overfit evidence, an fp32-versus-mixed-precision comparison, one activation-checkpointing tradeoff, per-task loss and gradient dashboards, and at least two seeds for the final baseline. Include one diagnosed instability rather than only a clean success plot.
