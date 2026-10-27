## 19. Requirement-to-evidence readiness matrix

Use this as a gap analysis, not a self-awarded score. For each row, link an artifact and apply the 0–4 scale from Chapter 1. “Building” is not “verified.” A project counts only when its tests, evaluation, and write-up are complete enough for someone else to inspect.

### What the posting says you will do

| Responsibility | Chapters | Projects | Evidence to link |
|---|---|---|---|
| Train and improve VLAs for manipulation/embodied tasks | 2–5 | 1, 3, 7 | Trained policies, controlled baseline, online improvement, failure analysis |
| Develop architectures and recipes for IL, BC, transformers, diffusion, multimodal pretraining, post-training | 2–5 | 1, 3, 6 | Same-backbone action-head study, adaptation comparison, recipe ablations |
| Build scalable pretraining, fine-tuning, evaluation, checkpointing, release pipelines | 6, 9–11 | 2, 4, 5 | End-to-end run contract, atomic resume, evaluator, model card, rollback |
| Train across multi-node GPUs; improve utilization, throughput, stability, cost | 8–9 | 4 | Actual multi-node topology/logs, scaling efficiency, profiles, time-to-quality and cost |
| Design mixtures, sampling, augmentation, curriculum | 7 | 2, 3, 6 | Mixture study, label-preserving augmentation tests, curriculum comparison if claimed |
| Build loaders for synchronized video, language, state, actions, other sensors | 6 | 2, 7 | Timestamp evidence, canonical schema, sharded loader, rendered real batches |
| Create reproducible experimentation and automated regression | 8, 10 | 1–7 | Resolved configs, data/model versions, tracking, tests, frozen release suite |
| Define offline/on-robot metrics for success, generalization, robustness, latency, safety, failures | 11, 14 | 5, 7 | Pre-registered metrics, counts/intervals, slices, latency/staleness, intervention and safety events |
| Build trajectory inspection, visualization, comparison, diagnosis tools | 12 | 2, 5, 7 | Synchronized viewer, checkpoint diff, three investigated failures |
| Run structured physical-robot experiments that guide improvements | 14–15 | 7 | Safety-reviewed experiment cards, raw trials, targeted data iteration and decision |
| Partner with collection teams on coverage and demonstration quality | 7, 15 | 2, 7 | Collection request, operator feedback loop, quality dashboard, measured data effect |
| Turn research into maintainable, repeatedly deployable systems | 10, 13–14, 18 | 4–7 | Reviewed design, tests, interface contracts, release runbook, second-workcell or reproduction evidence |
| Make and communicate architecture/data/compute/evaluation tradeoffs | 1, 11, 18 | All | ADRs, experiment reports, cost/quality/latency decisions, mixed-audience presentation |
| Mentor engineers and establish ML engineering practices | 18 | 7 or ongoing | Code/design reviews, onboarding guide, incident review, upstream collaboration, mentee evidence |

### Core qualifications

| Qualification | What credible evidence looks like |
|---|---|
| Five-plus years or equivalent demonstrated impact | A chronological record of owned, consequential systems; projects help but do not automatically establish equivalence |
| Strong modern deep learning in PyTorch, JAX, or comparable | Independent model/data/training implementations, numerical and optimization debugging, not only notebook inference |
| Transformers, multimodal/generative models, learned control | TinyVLA shape and mask mastery, controlled action-head comparison, closed-loop robot evaluation |
| Multi-GPU or multi-node distributed pipelines | Real-topology DDP/FSDP results, correctness/restart tests, measured scaling and bottlenecks |
| Large datasets, high-throughput loading, tracking, reproducibility | Versioned manifests, decode/loader profile, disjoint distributed sampler, reproducible artifacts and dashboards |
| Optimization, architecture, data quality, evaluation, experimental design | Ablations with controls, stability analysis, data-quality interventions, uncertainty, and alternative explanations |
| Full-stack debugging from data to robot behavior | Trajectory-linked incident reports spanning input, training, inference, controller, and hardware where applicable |
| Independent ownership of ambiguous projects | Problem framing, milestones, kill criteria, decision record, delivered system, and explicit remaining risk |
| Clear cross-functional communication | Documents and presentations adapted to ML, robotics, infrastructure, operators, and manufacturing stakeholders |
| Degree or equivalent practical experience | Formal credential or a substantial, inspectable record of technical work; assessed by the employer, not by this book |

### Nice-to-have capabilities

| Area | Minimum useful project evidence |
|---|---|
| VLA, VLM, or robotics foundation models | Fine-tune or analyze an open VLA/VLM with base revision, licenses, target/retention/transfer evaluation |
| IL, RL, BC, diffusion, action tokenization, world models | Strong BC baseline plus a controlled method comparison; optional RL/world-model work only with a clear hypothesis |
| Multiple embodiments, tasks, sensor configurations | Adapter/normalization contracts and a per-embodiment positive/negative transfer matrix |
| Pretraining, post-training, PEFT, distillation, adaptation | LoRA/full/head-only comparison or sampler/student distillation with target, retention, memory, and latency |
| FSDP, tensor/pipeline parallelism, mixed precision, checkpointing, sharded loading | Implement the relevant subset and explain why; do not add parallel dimensions without a measured need |
| ROS/ROS 2, MuJoCo, Isaac Sim, Gazebo | Versioned policy/controller adapter and simulation study; ROS 2 interface evidence if claimed |
| Physical-policy deployment and evaluation | Supervised real-robot experiment cards, logs, trials, interventions, latency, and release/rollback |
| Publications or meaningful open-source contributions | Merged, reviewed contribution with tests and user/maintainer impact; a paper with reproducible artifacts if available |

### The non-negotiable evidence gates

Averages can hide a critical gap. Keep these as separate gates:

1. **Learning gate:** trained and debugged a policy independently; not just loaded a checkpoint.
2. **Data gate:** proved timing, action semantics, split integrity, and distributed sample correctness.
3. **Scale gate:** measured actual distributed hardware and resumed correctly; multi-node left open if untested.
4. **Evaluation gate:** compared closed-loop checkpoints with frozen protocols, counts, uncertainty, and slices.
5. **Physical gate:** completed supervised real-robot validation, or explicitly marked it missing.
6. **Leadership gate:** made a cross-functional technical decision and helped another engineer succeed through review, documentation, or mentorship.

If one gate is open, your next project should usually target it. Adding another architecture comparison will not compensate for no physical evaluation when physical evaluation is the gap.

### Score with links, then choose one next action

For every row, record:

```text
Capability:
Level (0–4):
Artifact and exact personal contribution:
Scale and environment:
Strongest evidence:
Weakest assumption:
Next discriminating experiment:
Reviewed by / date:
```

A level without an artifact is a hypothesis. Ask a knowledgeable reviewer to challenge the rating. External review is especially useful for experimental design, robotics safety, distributed correctness, and staff-level ownership claims.

### Decide whether to apply now or build another artifact

You do not need to satisfy every nice-to-have before applying; the posting itself encourages candidates who are not a perfect fit. Apply when you can present a truthful, relevant record and discuss remaining gaps. Build another artifact first only if it addresses a material core gap or would substantially change the evidence.

A concise application narrative can be:

> My strongest overlap is **[two or three systems]**. In **[project/job]**, I owned **[specific decision]** across **[real scale]**, measured **[baseline and result]**, and shipped **[reusable artifact]**. My current gap is **[specific item]**; I have **[measured adjacent experience or active plan]**, and I am explicit that **[simulation/multi-node/physical boundary]**.

Do not claim that this curriculum “gives all the skills” in an application. Show the work and let its quality speak.

**Prove it:** Complete every matrix row with an artifact link or “open,” then identify the single highest-leverage open gate. Have one reviewer audit your strongest claim and one reviewer audit your weakest. Write the honest application narrative above without unverifiable scale or impact.
