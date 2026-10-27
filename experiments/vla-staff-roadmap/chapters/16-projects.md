# Part IV — Portfolio, roadmap, and staff practice

## 16. Seven pet projects that become one coherent portfolio

These are deliberately small systems with deep evidence, not seven unrelated demos. Each project reuses the previous one's contracts. By the end, you should have a trajectory toolkit, a trainable policy family, a distributed run system, an evaluation harness, and a supervised physical deployment—or a clearly marked physical-validation gap.

Time ranges assume an experienced software/ML engineer working independently. They are planning estimates, not deadlines. Use public dataset subsets and respect their licenses. Do not download a huge corpus before a small end-to-end slice works.

### The common portfolio contract

Every project repository should contain:

```text
README.md                 # question, result, limitations, reproduction
docs/design.md           # contracts, alternatives, decision
docs/experiment-card.md  # baseline, controls, metrics, trial budget
configs/                  # resolved, versioned experiment settings
src/                      # small, reviewable implementation
tests/                    # unit + integration + regression tests
artifacts/manifest.json  # hashes and identities; large files stored externally
reports/                  # plots, failure analyses, final decision
```

Store large datasets, videos, and checkpoints outside Git using the chosen repository's external-storage conventions. Include small synthetic fixtures and hashes/manifests so tests do not require a large download. Never commit credentials, private operator data, or unlicensed redistributions.

A strong README leads with the actual result and its boundary: “On 50 paired simulated resets, candidate A …; physical-robot performance was not measured.” That is more credible than a generic “state-of-the-art VLA” badge.

---

### Project 1 — Glass-Box BC: one task, no hidden magic

**Time:** 2–3 weeks, roughly 35–60 hours · **Compute:** CPU for tests; one modest GPU helpful for image policies · **Chapters:** 2, 8, 11

**Question.** Can you build a behavior-cloning system whose labels, optimization, and closed-loop evaluation you fully understand?

**Build.** Choose a small manipulation environment with demonstrations, such as a robomimic task. Begin with low-dimensional state, then add one camera as a separate experiment. Implement an MLP and a small temporal or vision baseline. Keep the environment and controller fixed.

**Milestones.**

1. Write the episode and action contracts; visualize ten episodes with state/action plots.
2. Create episode-disjoint splits and a window/chunk dataset that cannot cross episode boundaries.
3. Pass single-batch and tiny-episode overfit tests; then train a held-out baseline.
4. Evaluate closed-loop on predeclared resets with a random or simple heuristic baseline where available.
5. Compare one-step prediction with a short action chunk, or memoryless with short history.

**Required ablation.** Change only one major factor and explain the causal hypothesis. Do not run a broad hyperparameter sweep and call it an ablation.

**Deliverables.** Reproducible config, data/action contract, unit tests, training curves, rollout videos, raw success counts and intervals, latency measurement, and two annotated failures.

**Done gate.** Another person can start from a clean environment, run the small test suite, reproduce the baseline within reported variability, and identify exactly which observations and actions the model uses.

**Stretch.** Add DAgger-style labels in simulation and test whether they improve recovery at matched data and compute budgets.

**Anti-pattern.** Reporting validation MSE as “robot accuracy,” or randomly splitting timesteps so adjacent frames appear in train and test.

---

### Project 2 — Trajectory Foundry: heterogeneous data you can inspect

**Time:** 3–4 weeks, roughly 45–75 hours · **Compute:** CPU plus storage; optional GPU for decode benchmarks · **Chapters:** 6, 7, 12

**Question.** Can you turn two trajectory sources into a versioned, high-throughput training interface without hiding semantic differences?

**Build.** Select two small, licensed public sources with different conventions. Preserve raw inputs and convert them into your normalized episode schema. Add a shard writer, deterministic distributed sampler, and trajectory viewer.

**Milestones.**

1. Write source-to-canonical mappings, including unknown fields and action/frame conventions.
2. Implement timestamp association, unit/frame conversion, quality flags, and train-only normalization statistics.
3. Emit hashed manifests and grouped episode splits; test source and near-duplicate leakage.
4. Add rank/worker-disjoint sharding and deterministic resume tests.
5. Profile end-to-end loading and improve one measured bottleneck.

**Required ablation.** Compare two loader configurations—such as sequential episode reads versus random access—on samples/s, decode time, memory, and GPU input stall where applicable.

**Deliverables.** Data card, schema and lineage documentation, validation report, rendered batches, benchmark traces, known limitations, and a small test fixture with expected outputs.

**Done gate.** The viewer and the model see identical decoded samples; two ranks cannot receive the same intended sample in an epoch; a resumed run's sample order matches the control within your documented boundary behavior.

**Stretch.** Add a third embodiment and show which fields require adapters rather than forcing them into a fake shared schema.

**Anti-pattern.** Treating array shape equality as proof that two robots share action semantics, or computing normalization over all data before splitting.

---

### Project 3 — TinyVLA: language conditioning and generative actions

**Time:** 4–6 weeks, roughly 65–110 hours · **Compute:** one GPU; freeze encoders first · **Chapters:** 3–5, 7, 11

**Question.** Under a fixed demonstration budget, what do language conditioning and a generative action head actually buy?

**Build.** Use a small multi-task language-conditioned simulation suite or a compact subset of a public robot dataset. Combine a pretrained or small vision encoder, text conditioning, proprioception, and a small fusion/temporal backbone. Keep the model small enough for controlled repetitions.

**Milestones.**

1. Train vision+state and vision+state+language variants with identical data and evaluation.
2. Add regression and one of diffusion, flow, or discretized generative actions behind the same head interface.
3. Test predicted horizon `H`, executed horizon `K`, and sampling steps against success and p95 latency.
4. Build language holdouts: paraphrases, swapped objects, irrelevant modifiers, and corrupted instructions.
5. Run at least two training seeds for the central comparison.

**Required ablations.** Remove language while holding everything else fixed; then keep language and change only the action head. Disclose any hyperparameter tuning budget differences.

**Deliverables.** Shape/mask tests, model and token budget, per-task online results, instruction-swap analysis, action-diversity visualizations, sampler-step curves, and failure trajectories.

**Done gate.** You can state where language helps, where it does not, and whether generative modeling justifies its inference cost in your setup. A negative result passes if the controls and evidence are strong.

**Stretch.** Add LoRA to a pretrained VLM/VLA or distill the generative policy into fewer sampling steps; include retention and latency suites.

**Anti-pattern.** Fine-tuning a 7B checkpoint on one task and presenting a single successful video as evidence of generalization.

---

### Project 4 — Scale & Release Lab: distributed training that resumes correctly

**Time:** 3–5 weeks, roughly 45–85 hours plus cluster access · **Compute:** start local; real multi-GPU/multi-node access for corresponding claims · **Chapters:** 8–10

**Question.** Can you increase training capacity or throughput while preserving sample, optimizer, and release semantics?

**Build.** Start with Project 3 or a smaller instrumented model. Add DDP, then FSDP if model/memory characteristics make it meaningful. Use a synthetic large module for sharding tests if necessary, but keep a real policy integration test.

**Milestones.**

1. Establish a one-process numerical and throughput baseline.
2. Verify rank-disjoint data, global batch, masked-loss reduction, and checkpoint identity on multiple ranks.
3. Profile memory and step-time components; test mixed precision and selective activation checkpointing separately.
4. Implement atomic, resumable checkpoints with sampler/RNG state and a known-good fallback.
5. Run controlled worker/checkpoint/data failures and a clean release-candidate evaluation.

**Required measurements.** Actual topology, samples/s, scaling efficiency, peak allocated/reserved memory, communication or data stalls, GPU-hours, and time to a fixed validation target. Do not compare only step time when global batch changes.

**Deliverables.** Scaling report, memory model versus measurement, run manifests, resume equivalence test, fault-injection log, model card, and release/rollback runbook.

**Done gate.** A killed run resumes with the intended sample sequence and optimizer state; another engineer can identify every input from the artifact; multi-node claims, if any, come from actual multi-node logs.

**Stretch.** Execute a short two-node scaling study and compare network/storage conditions. If access is unavailable, publish the exact protocol and leave that gate open.

**Anti-pattern.** Declaring “8× scaling” because eight GPUs each process a local batch while the comparison uses a different workload or omits convergence.

---

### Project 5 — Policy Reliability Lab: the release referee

**Time:** 3–4 weeks, roughly 40–70 hours · **Compute:** simulation plus target inference hardware · **Chapters:** 10–12

**Question.** Can you build an evaluator that catches a convincing but unreliable checkpoint before deployment?

**Build.** Turn the Project 3/4 evaluation scripts into a versioned service or CLI with scenario manifests, trajectory records, success detectors, and comparison reports.

**Milestones.**

1. Pre-register nominal, generalization, robustness, latency, and retention suites.
2. Validate success detectors against hand-labeled trajectories and define infrastructure exclusions.
3. Add paired resets, raw counts, Wilson intervals, per-slice reports, and practical regression thresholds.
4. Record synchronized trajectories and build side-by-side checkpoint comparison.
5. Inject stale frames, latency, dropped cameras, and selected simulator faults.

**Required experiment.** Include a candidate whose aggregate score looks acceptable but whose slice, latency, or failure profile fails the gate. Explain the release decision.

**Deliverables.** Versioned evaluation manifest, hand-label agreement report, automated gate, trajectory viewer, failure taxonomy, and an incident review for one false confidence signal.

**Done gate.** The same command reproduces a report from immutable inputs; the evaluator flags your planted regression; a human can trace every aggregate number back to episodes.

**Stretch.** Add sequential experiment planning or cluster-aware intervals, with statistical review and clear assumptions.

**Anti-pattern.** Running until a checkpoint gets a favorable result, then reporting only that run, or excluding policy timeouts as “infrastructure.”

---

### Project 6 — Embodiment Adapter: learn what transfers

**Time:** 4–6 weeks, roughly 55–100 hours · **Compute:** one or more GPUs depending on model; public subsets are sufficient · **Chapters:** 5–7, 15

**Question.** When does multi-embodiment pretraining help a target robot, and when does it interfere?

**Build.** Use two simulated robots or two licensed public datasets with different action/sensor configurations. Implement per-embodiment normalization and input/output adapters, then optionally an embodiment embedding or shared trunk with specific heads.

**Milestones.**

1. Publish a shared-interface document and the semantics that remain embodiment-specific.
2. Train target-only and mixed-data baselines at matched target-sample and compute budgets.
3. Compare pretrain-then-fine-tune, mixed training, and one adapter variant.
4. Evaluate all sources plus a held-out embodiment, task, or sensor configuration.
5. Analyze sampling exposure, per-embodiment losses, retention, and negative transfer.

**Required ablation.** Remove embodiment-specific normalization or adapters while holding model capacity as constant as practical; interpret capacity differences if you cannot hold them constant.

**Deliverables.** Adapter shape tests, normalization round trips, mixture manifests, per-embodiment results, transfer matrix, and a decision memo on when to use the shared model.

**Done gate.** You can identify one condition of positive transfer and one of negative or neutral transfer, with evidence and a plausible mechanism. “More embodiments always help” is not an acceptable conclusion.

**Stretch.** Fine-tune an open generalist policy such as Octo or OpenVLA on a small target slice, documenting licenses, base revision, adaptation method, and all evaluation limits.

**Anti-pattern.** Padding unrelated action vectors into the same width and calling them aligned without testing the semantics.

---

### Project 7 — Real-Robot Release: close the physical loop

**Time:** 6–10 weeks, roughly 70–140 hours plus hardware and supervision · **Compute:** inference target plus training compute · **Chapters:** 12–15 and all prior projects

**Question.** Can you improve a real task through a measured cycle of deployment, failure analysis, targeted collection, and release?

**Build.** Use an accessible, manufacturer-supported robot through a lab, employer, school, or supervised workspace. Choose a low-risk task with a clear success detector. A small arm and simple object are enough; novelty of hardware is not the goal. Complete the site-specific safety review before motion.

**Milestones.**

1. Validate low-level control, frames, clocks, calibration, logging, and stop/protective systems without the learned policy.
2. Run recorded-input shadow inference and measure deployed preprocessing, latency, and output validity.
3. Establish a non-learning or prior-policy baseline and a bounded supervised smoke test.
4. Execute the pre-registered candidate evaluation and classify failures with operators/robotics engineers.
5. Collect one targeted dataset slice, version it, retrain/adapt, and rerun the same release suite.
6. Release or roll back with a signed-off experiment card and updated runbook.

**Required evidence.** Exact robot and workcell identity (appropriately anonymized), operating envelope, supervisor/review process, raw trial counts, interventions and near misses, p95 latency/staleness, videos, and the effect of the targeted data iteration.

**Deliverables.** Hardware interface, safety-reviewed experiment cards, data manifests, model card, comparison report, rollback artifact, and a short onboarding guide for the next operator.

**Done gate.** A second person can reproduce the approved evaluation using your runbook, and the final decision follows the predeclared gate. The targeted collection hypothesis is accepted or rejected with evidence.

**Simulation-only alternative.** Implement every software and evaluation component, use recorded real streams for shadow mode, and have a roboticist review the physical protocol. Mark “physical robot validation” incomplete. This alternative is valuable but does not satisfy the real-hardware evidence gate.

**Stretch and leadership.** Upstream a useful adapter, bug fix, evaluation scenario, or documentation improvement; review another person's reproduction; present the incident and tradeoffs to a mixed ML/robotics/operator audience.

**Anti-pattern.** Beginning with autonomous full-speed motion, changing checkpoints during a pooled trial, or treating a human-rescued episode as a policy success.

---

### Optional focused pet projects

If a specific gap remains, build a smaller project rather than enlarging all seven:

- **Action tokenizer lab:** compare quantization and sequence tokenization on reconstruction error, downstream success, and inference tokens.
- **World-model probe:** test whether an action-conditioned latent future model improves planning beyond an equivalent policy baseline.
- **Offline-RL comparison:** use a reward-labeled dataset and compare against strong BC under matched online evaluation; audit out-of-distribution actions.
- **Policy distillation:** reduce a generative sampler's steps or student size and measure success, retention, and p95 latency.
- **Upstream reliability contribution:** fix a real synchronization, sharding, or evaluation issue in an open-source robotics repository with regression tests.

### Portfolio presentation

Create one index that links all seven projects and summarizes the question, your ownership, baseline, measured result, scale, and limitation in two sentences each. Include a two-minute architecture walkthrough and a longer technical report. Lead with the most complete evidence, not the most fashionable model.

**Prove it:** Publish the portfolio index with all seven project cards. For each, link the design, reproduction command, tests, results, failures, and explicit hardware boundary. Mark unfinished gates openly, then choose the next project from your weakest linked evidence rather than from model novelty.
