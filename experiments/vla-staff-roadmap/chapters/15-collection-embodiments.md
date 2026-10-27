## 15. Data collection and multi-embodiment learning

The strongest data teams do not merely maximize hours. They collect the transitions that resolve a model's current limitations while preserving consistent semantics. The model team owes them precise feedback and tools that make quality visible.

### The failure-to-collection loop

A productive loop is:

`evaluate → classify failures → identify missing coverage → request targeted demonstrations → validate new data → version the mixture → retrain → rerun the frozen evaluation`

Each arrow has an artifact. Evaluation produces counts and trajectories; classification produces a taxonomy; coverage analysis produces empty or weak cells; collection produces a manifest; validation produces a quality report; retraining produces a candidate; the final evaluation tests the original hypothesis.

This avoids two common wastes: collecting more of what is already easy and retraining without a plausible mechanism for improvement.

### Demonstration quality is multidimensional

A successful final state does not guarantee a useful demonstration. Review:

- **completion:** the task is actually finished and the success detector agrees;
- **consistency:** action conventions, control rate, and instruction meaning stay stable;
- **observability:** the target and relevant contact events are visible; state and cameras are synchronized;
- **motion quality:** excessive pauses, oscillation, operator corrections, and controller saturation are flagged;
- **coverage:** demonstrations vary in ways that reflect deployment, not arbitrary noise;
- **recovery:** some examples show how to return from mistakes where safe and appropriate;
- **provenance:** operator, equipment, calibration, license/consent, and processing history are known.

Do not discard every imperfect trajectory. Pauses can be removed or masked only with a documented timing transformation; interventions may be valuable recovery data; failed attempts may be useful for evaluation or methods that use negative outcomes. Preserve the raw record and choose inclusion by objective.

Teleoperation interfaces shape the data. Latency, camera view, control mapping, and operator fatigue can produce systematic pauses or motion artifacts. Measure the interface before blaming the model for learning them.

### Prioritize collection by decision value

For each candidate slice, estimate:

`priority ≈ frequency × severity × probability data helps × expected improvement / collection cost`

This is not a precise law; it is a way to make assumptions discussable. Severity should include safety and operational impact, not only task frequency. “Probability data helps” should drop when evidence points to a timing, controller, or calibration defect.

Use model disagreement or uncertainty cautiously. A model can be confidently wrong, and uncertainty on irrelevant states may not justify collection. Combine quantitative signals with trajectory review and operator knowledge.

After collection, state the expected signature: which failure class should shrink, on which holdout, without regressing which retention suite? That turns data collection into an experiment.

### What changes across embodiments?

Embodiments differ in more than action dimension:

- joint count, kinematics, reach, gripper, and payload;
- end-effector and base frames;
- position, velocity, or torque control interfaces;
- control frequency and latency;
- camera count, placement, and calibration;
- proprioceptive fields and sensor quality;
- demonstration style and task distribution.

A shared model needs a declared shared interface. Common design choices include per-embodiment input/output adapters, embodiment-specific normalization, learned embodiment embeddings, separate action heads with a shared trunk, or padded action spaces with masks. None guarantees transfer.

For example, a shared end-effector delta representation may align two arms conceptually, but different workspaces and controllers still change the reachable distribution. A joint-space representation may transfer poorly across different kinematics even with identical dimension.

### Measure positive and negative transfer

Use at least four training conditions where compute allows:

1. target embodiment only;
2. all embodiments mixed;
3. pretrained on others, then fine-tuned on target;
4. all embodiments with an adapter or embodiment-aware variant.

Evaluate every embodiment and a leave-one-embodiment-out transfer suite where appropriate. Compare at matched target-sample and compute budgets. Multi-embodiment training can improve shared representations while hurting a specific robot through interference or sampling imbalance.

Track per-embodiment loss and gradient behavior, sampling exposure, and retention. An aggregate loss can improve because a large, easy embodiment dominates while the target gets worse.

The [Open X-Embodiment collaboration](https://arxiv.org/abs/2310.08864), [DROID](https://arxiv.org/abs/2403.12945), [Octo](https://arxiv.org/abs/2405.12213), and [π₀](https://arxiv.org/abs/2410.24164) provide public examples and datasets for studying heterogeneous robot learning. Their results do not eliminate the need to test your specific action and sensor contracts.

### Partner with collection teams

Give operators a small dashboard: accepted/rejected episodes and reasons, coverage by task and scene, sync/calibration warnings, and examples of requested behavior. Hold short reviews in which model engineers watch raw demonstrations and operators watch policy failures. Each side sees constraints the other cannot infer from aggregate metrics.

A good collection request names the behavior, variation, target count and rationale, quality criteria, safety constraints, and evaluation hypothesis. A good follow-up reports whether the data helped, so operators learn which details matter.

**Prove it:** Produce one targeted collection iteration and one cross-embodiment comparison. If you cannot collect new physical data, create the new slice in simulation or from licensed public sources and label that limitation. Publish the request, quality report, mixture diff, per-embodiment outcomes, and whether the predicted failure actually improved.
