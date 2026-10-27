# Part I — The learning problem and the model

## 1. Decode the role: five systems, not five buzzwords

The posting describes a person who can move between research, data, infrastructure, and robot behavior without losing the causal thread. That is the key to studying it efficiently. Group the responsibilities into five coupled systems.

| System | What the role actually asks | Portfolio evidence |
|---|---|---|
| Policy learning | Imitation learning, behavior cloning, transformer and diffusion policies, multimodal pretraining, post-training | Same-backbone comparison of regression, tokenized, and diffusion action heads; frozen-data ablations; rollout videos |
| Robot data | Synchronized video, language, state, actions, sensors; mixtures, augmentations, curriculum, coverage | Versioned trajectory converter, alignment tests, mixture explorer, data-quality report, trajectory viewer |
| Training systems | Multi-node training, throughput, stability, cost, checkpointing, reproducibility, release | Profiled DDP/FSDP runs, restart tests, resolved configs, dataset/model manifests, release gate |
| Evaluation and robotics | Offline and on-robot metrics, generalization, robustness, latency, safety, failure modes | Pre-registered task matrix, intervals, paired rollouts, failure taxonomy, real-robot report if hardware exists |
| Technical leadership | Ambiguous ownership, cross-functional tradeoffs, maintainable systems, mentorship | Design docs, reviewed pull requests, incident analysis, upstream contribution, onboarding guide |

A candidate who is excellent in one column and silent in the others still has a sharp gap for this particular role. A staff engineer is expected to find the bottleneck even when it is outside their favorite layer.

### What “staff” changes about the work

A senior individual-contributor assignment might be “fine-tune this policy to improve task success.” A staff-level version begins with less structure:

> Manufacturing task success is inconsistent across two workcells. Determine whether the limiting factor is data coverage, model quality, training throughput, deployment latency, or hardware variation; establish a measurement system; choose the highest-leverage intervention; and make the improvement repeatable.

That assignment includes several hidden obligations:

1. **Operationalize the goal.** “Better” could mean higher mean success, fewer catastrophic failures, faster cycle time, less operator intervention, or lower cost per accepted part. These are not interchangeable.
2. **Create a baseline before optimizing.** Preserve a known checkpoint, dataset, robot configuration, and evaluation protocol. Otherwise every change becomes incomparable.
3. **Find the constraint.** More parameters do not fix mislabeled actions. More demonstrations do not fix stale commands. More GPUs do not fix a data loader that cannot feed one GPU.
4. **Make choices reversible where possible.** Version data and models, keep rollback artifacts, stage robot exposure, and design release gates.
5. **Leave the system stronger.** Add the missing test, dashboard, runbook, or reviewer—not only the winning checkpoint.

This is why Chapter 18 treats writing, reviews, and incident analysis as core technical work rather than optional “soft skills.”

### The dependency graph

Study in dependency order, even if you read the architecture papers first for motivation:

`Python + PyTorch + probability → supervised learning → trajectories + control → behavior cloning → multimodal policies → data and distributed scale → online evaluation → physical deployment`

There are feedback edges. Evaluation reveals missing data; data throughput shapes the feasible architecture; deployment latency changes action chunking; robot failures motivate new training objectives. But skipping the forward path tends to produce expensive confusion. For example, tuning FSDP before verifying single-process action indexing optimizes a job that may be learning the wrong target.

The seven projects respect this order:

1. **Glass-Box BC:** one task, one baseline, full visibility.
2. **Trajectory Foundry:** heterogeneous data made inspectable and versioned.
3. **TinyVLA:** language-conditioned, multi-task, generative policy comparison.
4. **Scale & Release Lab:** distributed training and production discipline.
5. **Policy Reliability Lab:** defensible evaluation and diagnosis.
6. **Embodiment Adapter:** transfer across action and sensor configurations.
7. **Real-Robot Release:** supervised physical validation and the collection feedback loop.

Projects 4 and 5 can overlap. Project 6 can be simulation-only. Project 7 has a simulation track, but only the hardware track satisfies the physical-deployment evidence gate.

### A useful evidence scale

Use levels to choose the next task, not to decorate a résumé.

| Level | Demonstrated behavior | Example |
|---|---|---|
| 0 — Recognize | Can define the term | Explains what FSDP stands for |
| 1 — Reproduce | Can follow a guided implementation | Runs an example FSDP job |
| 2 — Own | Can build and debug independently | Adds FSDP to a policy, tests equivalence, diagnoses a restart bug |
| 3 — Operate | Can make tradeoffs under real constraints | Selects sharding from memory/network measurements and meets a cost budget |
| 4 — Lead | Can set direction and raise others' effectiveness | Defines the training platform, review standards, and adoption path across teams |

For core skills, aim for Level 2 or 3. You do not need Level 4 in every niche. You do need examples of Level 4 behavior somewhere: setting an evaluation standard, leading a cross-functional debugging effort, or making an infrastructure choice that other people successfully use.

### Requirements that a tutorial cannot confer

The posting asks for five or more years of relevant professional experience **or equivalent demonstrated impact**. Projects can support the second phrase; they do not automatically satisfy it. Likewise, a degree or equivalent practical experience is a hiring assessment, not something this book can issue.

Publications and meaningful open-source contributions are “nice to have,” but a useful contribution beats a performative paper chase. A reproducible bug fix in a robotics data loader, with a regression test and maintainer discussion, demonstrates several relevant skills at once.

The honest application strategy is therefore:

- show measured project impact without inflating its scale;
- distinguish team results from your own decisions;
- state simulation, single-node, multi-node, and physical-robot conditions precisely;
- identify remaining gaps and the work you are doing to close them;
- let the employer evaluate equivalence rather than declaring yourself equivalent.

### Choose a project thesis, not a model trophy

A weak portfolio thesis is “I trained the largest VLA my GPU could hold.” A strong one is:

> I investigated whether language-conditioned pretraining improves generalization to unseen instruction phrasings under a fixed demonstration budget. I held the robot task split and action head constant, measured online success with paired initial states, and found a benefit for paraphrases but not unseen object geometries. The failure traces motivated a targeted visual-coverage dataset, which I evaluated as a separate experiment.

That thesis can be pursued with a modest model. It includes a hypothesis, controls, evidence, a boundary, and a next decision—the same reasoning loop the role requires at larger scale.

**Prove it:** Copy the five-system table into your baseline audit. Rate each row from 0–4 using linked evidence, then write one project thesis with a falsifiable hypothesis, a fixed baseline, and a result that would make you change direction.
