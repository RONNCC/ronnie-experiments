# VLA Staff Engineer — From Pixels to Reliable Robot Action

*Project-based fieldbook · 27 October 2026 · An independent Ronnie's Experiments learning sandbox*

## Contents

**Orientation**
- [0. How to use this fieldbook](#chapter-0)

**Part I — The learning problem and the model**
- [1. Decode the role: five systems, not five buzzwords](#chapter-1)
- [2. From trajectories to behavior cloning](#chapter-2)
- [3. VLA architecture: turn modalities into a policy](#chapter-3)
- [4. Action representations, chunking, diffusion, and flow](#chapter-4)
- [5. Pretraining, fine-tuning, and post-training](#chapter-5)

**Part II — Data, optimization, and training infrastructure**
- [6. Robot data engineering: make time and semantics explicit](#chapter-6)
- [7. Data mixtures, augmentation, and curriculum](#chapter-7)
- [8. Optimization, precision, and training stability](#chapter-8)
- [9. Distributed training: replicate work or shard state](#chapter-9)
- [10. Reproducible experiments and model release](#chapter-10)

**Part III — Evaluation, debugging, and physical systems**
- [11. Evaluation: measure capability, not demo luck](#chapter-11)
- [12. Debug the full stack with trajectories](#chapter-12)
- [13. ROS 2, simulation, and the control boundary](#chapter-13)
- [14. On-robot validation and safety](#chapter-14)
- [15. Data collection and multi-embodiment learning](#chapter-15)

**Part IV — Portfolio, roadmap, and staff practice**
- [16. Seven pet projects that become one coherent portfolio](#chapter-16)
- [17. A 36-week roadmap with exit gates](#chapter-17)
- [18. Staff-level ownership, communication, and interview drills](#chapter-18)
- [19. Requirement-to-evidence readiness matrix](#chapter-19)

**Part V — Primary sources and further study**
- [20. Annotated source library](#chapter-20)

[Open the interactive web reader](index.html) · This single-file edition is generated as `TEXTBOOK.md` from the canonical chapters.

> **Scope.** This fieldbook teaches the technical system around vision-language-action (VLA) models and turns the public [Nidus Staff ML Engineer, VLA Training posting](https://jobs.ashbyhq.com/nidus-technologies/59f34e58-f867-4bdd-953f-31cb2d6dbaf6) into a sequence of portfolio builds. It is not affiliated with Nidus, does not describe its private stack, and cannot promise an interview, a staff title, or five years of professional impact. Role requirements can change; this analysis is a snapshot dated 27 October 2026. Research numbers belong to their original evaluation protocols, not to your future project.

<div id="chapter-0"></div>

## 0. How to use this fieldbook

A VLA policy accepts some combination of images, language, and robot state and produces actions. That one-sentence definition hides the actual job. A deployable learning system also has to align camera frames with motor commands, normalize different robots without erasing useful differences, keep a training job alive across failures, decide whether two checkpoints are meaningfully different, and explain why a robot stopped beside an object instead of grasping it.

The organizing loop is therefore:

`observe → learn → act → measure → diagnose → collect better data → repeat`

A model architecture sits inside that loop; it is not the loop itself. The projects in this book are cumulative because a polished model trained on an opaque data pipeline, evaluated on three lucky rollouts, is weak evidence. A small policy whose data, training, evaluation, failure analysis, and release history you can explain is much stronger.

### The four passes through every chapter

1. **Understand.** Write the relevant quantities and contracts before reaching for a framework. What is an episode? Which timestamp belongs to an action? Is an action absolute or relative? Which distribution does the evaluation sample?
2. **Build.** Implement the smallest version that can fail informatively. Start with one task and a baseline, not a 7B-parameter training run.
3. **Measure.** Predefine a baseline, holdout, rollout budget, and failure taxonomy. Report uncertainty and negative results.
4. **Explain.** Record the decision, alternatives, cost, evidence, and remaining risk in a design note. This is where engineering skill becomes staff-level leverage.

Do not mistake reading for completion. Each chapter ends with a **Prove it** artifact. Chapter 16 turns those artifacts into seven public projects, and Chapter 19 maps them back to every requirement in the posting.

### Choose an honest starting track

The 36-week sequence in Chapter 17 assumes an experienced software or ML engineer who can already use Python, PyTorch, Git, basic linear algebra, probability, and Linux. If those are not yet comfortable, add a prerequisite phase rather than compressing everything into a few weekends.

| Starting evidence | On-ramp | What to do before TinyVLA |
|---|---|---|
| New to ML or deep learning | Add roughly 4–9 months, depending on available time | Implement regression and a small CNN/ViT classifier; derive backpropagation for a small network; learn train/validation/test discipline |
| Comfortable with supervised ML, new to robotics | Use the 36-week plan with the robotics prerequisites | Learn SE(3) transforms, quaternions, joint versus end-effector control, closed-loop evaluation, and ROS 2 basics |
| Strong robotics, new to large-scale training | Keep the robot projects; spend longer in Chapters 6–10 | Reproduce a small training run, then DDP, FSDP, profiling, sharded loading, and resilient checkpointing |
| Strong distributed ML, new to robot learning | Move quickly through scale; do not skip evaluation | Complete behavior cloning, generative action heads, simulation, and physical-robot validation |
| Already trained VLAs | Use the book as an evidence audit | Fill missing multi-node, multi-embodiment, on-robot, and mentorship evidence; contribute upstream |

These are planning ranges, not certifications. Calibrate with artifacts: if you cannot overfit a tiny dataset and then explain every preprocessing operation, the next architecture is not your highest-value task.

### Hardware without fictional experience

Most core ideas can be learned with CPU tests, simulation, and a modest GPU. Some cannot:

- **Multi-GPU and multi-node claims require actual runs.** Two local processes can teach distributed correctness, but they do not demonstrate multi-node networking, straggler diagnosis, or cluster throughput. Label every result with its real topology.
- **Physical-robot claims require a physical robot.** MuJoCo, Isaac Sim, Gazebo, LIBERO, and other simulators are valuable, but “sim-to-real ready” is not a result until you have measured the real system.
- **A small model can teach large-model discipline.** You can test sharding, restart semantics, data lineage, and release gates at small scale. Do not imply that this proves the economics or stability of a frontier-scale run.
- **Do not buy hardware before defining the evidence.** A short, well-instrumented rented cluster run may teach more than an expensive GPU used without a profiler. A shared university or workspace robot may be a better first physical platform than an unsupervised home arm.

For physical work, follow the robot manufacturer's procedures and a qualified supervisor's site-specific risk assessment. The safety discussion in Chapter 14 is educational, not a safety certification or a universal operating procedure.

### Your baseline audit

Before reading further, create a private or public `baseline.md` with links—not adjectives—to your current evidence. Include your strongest training run, data pipeline, evaluation report, distributed experiment, robot deployment, technical design document, and code review or mentoring example. For each, answer:

- What did you personally own?
- What was the baseline and the measured result?
- What failed, and how did you isolate the cause?
- What would another person need to reproduce it?
- Which claim remains untested?

A blank row is useful. It is a project requirement, not a personal deficit. The goal is to finish with a portfolio in which every important adjective has a corresponding repository, plot, trace, video, or decision record.

**Prove it:** Write the one-page baseline audit and choose your starting track. Include three existing artifacts and three explicit gaps. Revisit it after Projects 2, 4, and 7; replace self-ratings such as “advanced PyTorch” with evidence such as “resumed an eight-rank FSDP job without duplicating samples and documented the verification.”

# Part I — The learning problem and the model

<div id="chapter-1"></div>

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

<div id="chapter-2"></div>

## 2. From trajectories to behavior cloning

Robot control is sequential. An action changes the next observation, so a robot dataset is not a bag of independent images and labels. A useful formal starting point is a partially observed Markov decision process (POMDP): the environment has a hidden state, the robot receives an observation, chooses an action, and transitions to a new state. You do not need to solve a POMDP to train behavior cloning, but the formalism prevents a common mistake: treating a history-dependent, closed-loop problem as ordinary i.i.d. classification.

At time `t`, define an observation bundle such as:

`oₜ = {Iₜ¹…Iₜᶜ, qₜ, gₜ, instruction, calibration, embodiment}`

Here `I` represents one or more camera images, `q` proprioceptive state such as joint positions, and `g` optional gripper or other sensor state. The demonstrated action `aₜ` might be a joint target, end-effector delta, velocity, or discrete gripper command. Those are different labels, not interchangeable arrays.

An episode is `τ = (o₀, a₀, o₁, a₁, …, oT)`. A policy estimates `πθ(aₜ | o≤t, instruction)`. Behavior cloning (BC) fits the demonstrations with supervised learning:

`LBC(θ) = E(o,a)~D [ -log πθ(a | o) ]`

For a deterministic regressor trained with mean squared error, this becomes `||fθ(o) - a||²`. For discretized actions, use cross-entropy over bins. For a Gaussian policy, the negative log-likelihood includes both the mean error and variance terms. The objective should match the action representation; “BC” does not imply MSE.

### Start with the label contract

Before model code, write a one-page contract containing:

- **Action semantics:** absolute position, delta position, velocity, or torque; the reference frame; units; control frequency; and whether the command is executed at `t`, during `(t, t+1]`, or at some later timestamp.
- **Dimension meanings:** every joint or end-effector component and every gripper convention. Document whether `1` means open or closed.
- **Observation timing:** camera exposure time, state timestamp, command timestamp, and any known latency. A video frame displayed next to a state row is not proof that they are synchronized.
- **Bounds and normalization:** valid physical limits, clipping behavior, and whether normalization is computed per dataset, task, or embodiment.
- **Episode boundaries:** reset conditions, terminal labels, padding rules, and the rule preventing an action chunk from crossing into another episode.

A surprisingly strong debugging tool is to plot `aₜ`, `qₜ`, `qₜ₊₁`, and timestamps for a handful of demonstrations. If the action is supposed to be a delta, compare it with the realized state difference while allowing for tracking lag. Do not “fix” a mismatch until you understand the controller's semantics.

### Why low validation loss can still produce a bad robot

BC learns states visited by the demonstrator. At deployment, the learned policy visits its own states. A small error can move the robot slightly off the demonstrated path; the next observation is then less familiar, which can produce another error. This distribution shift is often called **covariate shift** or **compounding error**. Longer episodes give errors more opportunities to accumulate.

Three consequences matter more than a slogans:

1. **Held-out action loss is an offline proxy.** It is measured on demonstration states, not on states induced by your policy. Use it for optimization and diagnosis, but do not equate it with task success.
2. **The evaluation must close the loop.** Run the policy in simulation or on a real robot, observe the resulting state, and feed that state back into the policy.
3. **Data coverage should include recovery.** Perfect demonstrations show what to do on the expert's path. They may not show how to return after an overshoot. Intervention data and DAgger-style collection can address this, at the cost of additional labeling and operational complexity.

[DAgger](https://arxiv.org/abs/1011.0686) iteratively rolls out a policy, requests expert labels on visited states, aggregates the data, and retrains. It directly targets the state-distribution mismatch, but it is not magic: the expert must be able to label safely and consistently, and the aggregation can change the data balance.

### History, chunking, and closed-loop control

A single frame may be insufficient: occlusion, motion direction, and contact dynamics often require history. A history policy receives `oₜ₋ₖ₊₁…oₜ`; a memoryless policy receives only `oₜ`. History increases context and compute but can improve observability.

An action-chunking policy predicts `Aₜ = (aₜ, aₜ₊₁, …, aₜ₊H₋₁)`. The controller may execute only the first few actions before requesting a new chunk—receding-horizon control—or blend overlapping predictions. Chunking can make behavior temporally coherent and amortize inference, but a long open-loop chunk can also execute stale intent. Chapter 4 makes that tradeoff concrete.

Do not let the dataloader create a chunk across an episode boundary. If fewer than `H` future actions remain, either mask the invalid tail, use a documented shorter chunk, or skip the start index. Test all three boundary cases explicitly.

### A minimal PyTorch training skeleton

This is intentionally incomplete as a policy, but complete enough to expose the training contracts:

```python
for batch in train_loader:
    images = batch["image"].to(device, non_blocking=True)   # [B, C, H, W]
    state = batch["state"].to(device)                      # [B, state_dim]
    target = batch["action"].to(device)                    # [B, horizon, action_dim]
    mask = batch["action_mask"].to(device)                 # [B, horizon]

    prediction = model(images, state, batch["instruction"])
    per_step = ((prediction - target) ** 2).mean(dim=-1)
    loss = (per_step * mask).sum() / mask.sum().clamp_min(1)

    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optimizer.step()
```

The important details are not the API calls. They are the shape comments, mask-aware reduction, explicit action target, and reproducible optimizer semantics. In distributed training, a global mean requires additional care when masks contain different numbers of valid elements across ranks; averaging already-averaged rank losses can silently weight batches incorrectly.

### The smallest informative experiment sequence

1. **Data inspection:** decode ten random episodes and render images with state and action overlays. Verify units and chunk boundaries.
2. **Single-batch overfit:** the model should nearly memorize a small fixed batch. If it cannot, inspect labels, masks, model capacity, optimization, and gradients before scaling.
3. **Small-episode overfit:** memorize a few complete episodes and replay them in the environment. This tests more of the execution path than a batch loss.
4. **Held-out episodes:** split by whole episode, not random timesteps. Random frame splits leak near-duplicates across train and validation.
5. **Closed-loop baseline:** evaluate a state-only or simple vision policy before adding language, a large backbone, or diffusion.
6. **Ablations:** change one major factor at a time—history length, action horizon, camera, or objective—and keep evaluation conditions fixed.

Preserve a scripted or heuristic baseline if the environment provides one. A learning policy should beat “do nothing,” a random valid action, and a simple replay or proportional controller where applicable. Without a baseline, a success number has little context.

### Generalization is a property of the split

“Generalizes well” is incomplete. Generalization to what? Define separate holdouts for initial positions, object instances, visual backgrounds, lighting, instruction phrasings, tasks, camera viewpoints, and robot embodiments. Holding out random episodes only estimates performance under approximately the same collection distribution.

Keep test episodes and their near-duplicates out of training and model selection. Use validation for choices and test for the final report. If you repeatedly inspect test results and retrain, the test set has become a validation set; create a fresh confirmation set or acknowledge the adaptivity.

**Prove it:** Implement a state-only or single-camera BC baseline on a small public manipulation dataset. Publish the action contract, an episode-level split, single-batch and small-episode overfit tests, masked-chunk unit tests, closed-loop rollouts, and a report that explicitly separates action loss from task success.

<div id="chapter-3"></div>

## 3. VLA architecture: turn modalities into a policy

A vision-language model can describe an image; a vision-language-action model must produce a command with the right dimension, timing, scale, and physical consequence. Adding an action head to a VLM is therefore not just an output-layer change. It creates a contract between semantic representation and control.

A modular VLA can be drawn as:

```text
images → vision encoder → visual tokens ────┐
instruction → tokenizer / text encoder ─────┼→ fusion / temporal backbone → action head → controller
robot state → normalization / projection ───┘
```

This decomposition lets you reason about each interface. It also describes several real families at a useful level of abstraction, without pretending their implementations are identical.

### Vision: spatial evidence under a token budget

A convolutional encoder produces feature maps with built-in locality and hierarchy. A Vision Transformer (ViT) splits an image into patches and processes patch tokens with attention; the original [ViT paper](https://arxiv.org/abs/2010.11929) is a useful baseline. Pretrained visual encoders such as [DINOv2](https://arxiv.org/abs/2304.07193) and [SigLIP](https://arxiv.org/abs/2303.15343) offer different representation objectives and properties. Do not select one by brand: test task performance, spatial precision, fine-tuning stability, resolution behavior, and inference cost.

Ask of any vision front end:

- Does the policy need global semantic identity, fine contact geometry, or both?
- Are camera intrinsics and extrinsics needed, or can the policy learn from pixels and state?
- Does resizing distort aspect ratio or erase small objects?
- How are multiple cameras combined: concatenated tokens, pooled features, camera embeddings, or separate encoders?
- What happens if a camera drops frames or is absent for one embodiment?

High-resolution multi-camera video can dominate the token and decoding budget. A larger language model will not compensate for a visual bottleneck. Profile pixels, tokens, and latency as one system.

### Language: task conditioning, not a guarantee of understanding

Language may identify the task (“pick up the red block”), constrain the object, or provide a high-level plan. Common choices include a pretrained text encoder whose features are fused with visual tokens, or a VLM backbone already trained on paired vision-language data.

[RT-2](https://arxiv.org/abs/2307.15818) is a landmark example of transferring vision-language knowledge into robotic action by representing actions as tokens. [OpenVLA](https://arxiv.org/abs/2406.09246) provides an open 7B implementation built from pretrained vision-language components and robot demonstrations. [Octo](https://arxiv.org/abs/2405.12213) is an open generalist transformer policy supporting language or goal-image conditioning and fine-tuning to new observation and action spaces. [π₀](https://arxiv.org/abs/2410.24164) combines a pretrained VLM with a flow-matching action expert. Read these as different design points, not a linear leaderboard.

Language conditioning tests should include:

- exact training phrasing;
- human-written paraphrases not used for augmentation;
- semantically irrelevant adjective changes;
- swapped object or relation instructions;
- instructions with no demonstrated corresponding behavior;
- empty or corrupted language, to expose hidden task leakage.

If a policy performs identically after the instruction is replaced with nonsense, it may be using background or initial state to infer the task. That can be appropriate in a one-task system, but it is not evidence of language grounding.

### State and embodiment: do not throw away the proprioception

Images alone may not reveal joint configuration, gripper state, or contact-related motion. Project normalized proprioceptive features into the fusion backbone. Include an embodiment identifier only if it carries information not already present; an ID can help distinguish action conventions, but it can also become a shortcut.

Different robots may have different state and action dimensions. Options include per-embodiment projections and heads, padded shared vectors with masks, embodiment-specific normalizers, and learned adapters. Each makes a different bet on what is shared. Never concatenate raw joint angles from two robots and assume a shared semantic meaning.

### Fusion and temporal context

Three common fusion patterns are:

1. **Early concatenation:** project every modality to a shared token dimension and concatenate. This is simple and expressive, but sequence length and attention cost grow quickly.
2. **Cross-attention:** action or state queries attend to visual and language context. This can decouple the action sequence length from the context length and provides a clear conditioning interface.
3. **Late fusion:** pool each modality and combine compact vectors. This is cheap and useful as a baseline, but may lose spatial or token-level interactions.

For history, choose whether the backbone is causal, bidirectional over past observations, or a temporal encoder over precomputed features. A causal mask must prevent access to future frames during training. Position encodings should distinguish camera, modality, history position, and action-chunk position where those distinctions matter.

A shape contract for a small policy might be:

```text
images:       [B, T, C, 3, H, W]     # two cameras, one timestep example
state:        [B, T, state_dim]
instruction:  [B, text_tokens]
visual tokens:[B, T * C * patches, D]
action query: [B, H, D]
output:       [B, H, action_dim]
mask:         [B, H]                  # valid future actions only
```

Write these shapes in tests. Many “architecture failures” are actually broadcasting errors, flattened camera/time dimensions, or a mask that allows future leakage.

### A four-family reading, not a universal winner

| Family | What it contributes | What it does not settle for you |
|---|---|---|
| [RT-1](https://arxiv.org/abs/2212.06817) | Large-scale real-robot transformer policy and action discretization | Your data scale, tokenizer, or manufacturing evaluation |
| [RT-2](https://arxiv.org/abs/2307.15818) | Vision-language pretraining transferred to action-token prediction | Whether web knowledge improves your contact-rich task |
| [Octo](https://arxiv.org/abs/2405.12213) | Open generalist policy, flexible goals, transformer/diffusion design | The best fine-tuning recipe for every embodiment |
| [OpenVLA](https://arxiv.org/abs/2406.09246) | Open VLM-based VLA and practical fine-tuning investigation | That a 7B model is necessary for your task |
| [π₀](https://arxiv.org/abs/2410.24164) | Flow-matching action expert and broad cross-embodiment training | A guaranteed latency or data-efficiency advantage in your setup |

Benchmark results in these papers use different data, tasks, model sizes, and evaluation procedures. Use them to generate hypotheses, then run controlled comparisons in your environment.

### Build a TinyVLA before fine-tuning a giant one

A useful learning model can have frozen pretrained vision and text encoders, a small temporal transformer, and interchangeable action heads. Freeze components initially so you can train on limited compute and attribute failures. Then unfreeze selected layers as a separate experiment.

Keep these baselines:

- state-only MLP;
- vision-only policy;
- vision + state without language;
- vision + state + language;
- the same fusion model with different action heads.

This sequence measures what each modality buys. It also provides a fallback when the most expressive system is worse because of optimization, overfitting, or inference cost.

**Prove it:** Write and test a TinyVLA shape contract, then train vision-only and vision-language variants on the same multi-task episodes. Include an instruction-swap test, a missing-camera test, parameter and token counts, measured inference latency, and a table that keeps architecture constant while changing only one modality.

<div id="chapter-4"></div>

## 4. Action representations, chunking, diffusion, and flow

The action head determines what kinds of behavior the policy can express and how expensive it is to sample. Choose it from data and control requirements, not from architectural fashion.

### First decide what an action means

Common representations include:

- **Joint positions or deltas:** natural for a particular robot, but strongly embodiment-specific.
- **End-effector poses or deltas:** often easier to transfer conceptually across arms, but require explicit reference frames and a controller that tracks them.
- **Velocities:** responsive and smooth when well integrated, but sensitive to timing and drift.
- **Torques:** close to dynamics and contact, but difficult to demonstrate and transfer.
- **Discrete gripper commands:** often treated separately from continuous arm dimensions because their scale and semantics differ.

Represent a rotation deliberately. Euler angles are compact but have singularities and wraparound issues; quaternions require a hemisphere convention to avoid sign discontinuities; rotation matrices and six-dimensional representations consume more dimensions but can simplify learning. Document the convention and test round trips.

Absolute actions and deltas also fail differently. Absolute commands may be easier to bound but depend on a shared frame. Deltas can be local and transferable but accumulate integration error. Normalize using training-set statistics, retain the transform with the checkpoint, and test that inference exactly reverses it.

### Regression, discretization, and multimodality

A deterministic regressor trained with MSE predicts a conditional mean under squared-loss assumptions. If two demonstrations choose valid but different paths around an obstacle, the mean path may go through the obstacle. This is one motivation for generative policies, although real datasets and controllers make the story more nuanced.

Discretization turns each continuous action dimension into bins and trains cross-entropy. It supports multimodal marginal distributions and fits naturally into token-based models, but naive per-dimension binning can lose fine precision and ignore temporal structure. Quantization range, bin count, and dimension independence are experimental choices. [FAST](https://arxiv.org/abs/2501.09747) is one later approach to tokenizing action sequences more efficiently; treat it as a specific research method, not a synonym for all action tokenization.

A categorical gripper plus continuous arm action can use a hybrid loss:

`L = λarm · Lcontinuous + λgripper · Lcross-entropy`

The weights `λ` affect optimization. Report them and inspect per-term losses rather than hiding both behind one scalar.

### Action chunking and receding-horizon execution

Predicting a sequence `Aₜ = aₜ…aₜ₊H₋₁` offers three potential benefits: temporal consistency, an expressive distribution over trajectories rather than independent steps, and fewer model calls. It also introduces a control question: how much of the predicted sequence should be executed before observing the world again?

Let `H` be the predicted horizon and `K ≤ H` the number of actions executed. At control rate `f` Hz, the executed chunk spans roughly `K/f` seconds. If sensing plus inference plus communication takes `L` seconds, compare `L` with that interval. If `L > K/f`, new observations cannot be incorporated before the chunk ends unless execution pauses or pipelines overlap. Longer chunks are not a free latency fix; they increase the time during which the policy may follow stale predictions.

Evaluate at least:

- predicted horizon `H`;
- executed horizon `K`;
- overlapping-chunk blending or temporal ensembling, if used;
- sensor-to-command latency percentiles;
- behavior under injected latency and dropped frames.

[ACT](https://arxiv.org/abs/2304.13705) combines action chunking with a transformer-based conditional variational autoencoder for fine manipulation. [Diffusion Policy](https://arxiv.org/abs/2303.04137) uses receding-horizon action sequences with visual conditioning. Read the execution details, not just the action-head label.

### Diffusion policies: iterative conditional generation

A diffusion model learns to reverse a noising process. In a common discrete-time setup, a clean action chunk `x₀` is corrupted with Gaussian noise:

`xₜ = √ᾱₜ · x₀ + √(1 − ᾱₜ) · ε`, where `ε ~ N(0, I)`

A network conditioned on observations predicts the noise `εθ(xₜ, t, condition)`, or an equivalent target such as clean data or velocity. A simplified training objective is:

`L = E ||ε − εθ(xₜ, t, condition)||²`

At inference, start from noise and iteratively denoise to produce an action chunk. The sampler and number of steps matter: fewer steps can reduce latency but alter quality. Conditioning can use visual features, language, state, and embodiment.

The practical questions are:

- Does the action distribution contain meaningful multimodality that regression averages away?
- Does diffusion improve closed-loop success after equalizing backbone, data, and training budget?
- How many sampling steps are needed on the actual deployment hardware?
- Is the variance useful diversity or unsafe inconsistency for this task?
- Can a smaller deterministic or flow model meet the same requirement?

Do not report training loss as evidence of better action generation. Compare sampled trajectories and closed-loop behavior.

### Flow matching: learn a velocity field

Flow matching learns a vector field that transports a simple base distribution to the data distribution. One convenient interpolation uses noise `x₀` and a real action chunk `x₁`:

`x(t) = (1 − t) · x₀ + t · x₁`, with `0 ≤ t ≤ 1`

For this linear path, a target velocity is `u = x₁ − x₀`. Train `vθ(x(t), t, condition)` to predict `u`, then integrate the learned ordinary differential equation from noise toward data at inference. Notation varies across papers; always check which endpoint is noise and which is data.

[π₀](https://arxiv.org/abs/2410.24164) applies flow matching in a VLA with a dedicated action expert. The key learning exercise is not to reproduce that entire system. Implement a small flow head, verify the interpolation and target with unit tests, and compare sampling steps and closed-loop outcomes against diffusion and regression.

### Where world models fit

An action-conditioned world model predicts future observations or latent states under candidate actions. It can support planning, representation learning, data augmentation, or policy evaluation. It is not automatically a controller: you still need an action-selection mechanism and a way to handle model error. If you explore one as a stretch project, evaluate whether predicted futures improve decisions, not merely whether generated videos look plausible.

### A controlled action-head bake-off

Hold the following constant: dataset manifest, train/validation/test episodes, observation encoder, history, action normalization, predicted horizon, training steps, evaluation initial states, and deployment controller. Compare:

| Head | Primary question | Required measurement |
|---|---|---|
| Deterministic regression | Is the conditional mean adequate? | Per-dimension error, success, path smoothness, latency |
| Discretized autoregressive or parallel tokens | Does categorical modeling help precision or multimodality? | Bin sensitivity, token errors, success, sequence latency |
| Diffusion | Does iterative generation improve behavior enough to pay for sampling? | Step sweep, diversity, success, p95 latency |
| Flow matching | Can a learned vector field offer a useful quality/latency point? | Integration-step sweep, success, stability, p95 latency |

Equalize what you can and disclose what you cannot. Different objectives may need different learning rates; tune each within a fixed, reported budget rather than crippling a baseline.

**Prove it:** Implement at least regression and one generative action head behind the same encoder interface. Publish chunk-boundary tests, an `H`/`K` execution study, a sampler-step versus latency/success plot, paired rollouts, and one failure case where the more expressive head did not help.

<div id="chapter-5"></div>

## 5. Pretraining, fine-tuning, and post-training

“Training a VLA” can refer to several very different operations. Naming the stage prevents impossible comparisons.

| Stage | Data and objective | What it can buy | Main risk |
|---|---|---|---|
| Vision-language pretraining | Large image/text corpora; contrastive, generative, or related objectives | Semantic and visual representations | Assuming semantic knowledge implies control competence |
| Robot-policy pretraining | Heterogeneous demonstrations; imitation or generative action objectives | Cross-task and cross-embodiment action priors | Negative transfer, inconsistent labels, dominant datasets |
| Target-task fine-tuning | In-domain demonstrations, often with a pretrained initialization | Fast adaptation to a task, camera, or robot | Overfitting and forgetting broader abilities |
| Post-training | Curated demonstrations, interventions, preferences, verified feedback, RL, or distillation | Better recovery, reliability, style, latency, or deployment fit | Optimizing a proxy, narrowing behavior, unsafe exploration |

You will probably not pretrain a frontier VLM for these projects. The transferable skill is understanding what an initialization contains, designing the robot-data stage, and measuring what adaptation changes.

### Imitation is the default baseline

Behavior cloning and related imitation objectives are stable, simple to implement, and directly use demonstrations. They should be the baseline against which more elaborate post-training is judged. Offline reinforcement learning can use reward-labeled datasets without online exploration, but requires careful handling of value estimation and out-of-distribution actions. Online RL can optimize closed-loop returns, but real-robot exploration raises cost and safety concerns. Neither should be added merely because the posting lists RL as nice to have.

A sound decision sequence is:

1. Is the demonstrations' main limitation coverage, label quality, multimodality, or long-horizon compounding error?
2. Can the target be improved with better supervised data or an action head?
3. Is there a reliable reward or verifier that correlates with actual task success?
4. Can the system explore or fail within an approved safety and cost budget?
5. Does the new method beat the supervised baseline under matched online evaluation?

If the answer to the first question is “misaligned timestamps,” post-training is not the first fix.

### Full fine-tuning, freezing, and LoRA

Full fine-tuning updates every parameter. It offers maximum flexibility and usually the largest optimizer and checkpoint footprint. Freezing the backbone and training only an adapter or action head reduces trainable state and can regularize a small target dataset, but limits adaptation.

Low-Rank Adaptation ([LoRA](https://arxiv.org/abs/2106.09685)) freezes a pretrained weight `W` and learns a low-rank update:

`W′ = W + (α/r) · BA`, where `B` and `A` have inner dimension `r`

Only the adapter parameters and their optimizer states need training, while the base weights remain fixed. LoRA does **not** eliminate activation memory, and serving can still require the full base model. Rank, target layers, initialization, dropout, and scaling are design choices.

Run a three-way comparison on the same target data:

- head-only or frozen backbone;
- LoRA on declared attention or projection layers;
- full fine-tuning, if memory permits.

Measure target-task success, broad held-out tasks, trainable and total parameters, peak memory, throughput, checkpoint size, and inference latency. A smaller checkpoint is useful; a smaller base model at inference is not implied.

### Distillation transfers behavior, not just weights

Distillation trains a student to match a teacher's outputs, features, or action distribution. For robot policies, consider what the student sees:

- **Off-policy distillation** on teacher or demonstration states is straightforward but retains exposure mismatch.
- **On-policy distillation** labels states visited by the student, which can target the student's actual errors.
- **Generative-policy distillation** may aim to reduce diffusion or flow sampling steps. Evaluate action quality and closed-loop behavior, not only teacher-student distance.

A teacher can be more capable but too slow or large to deploy. The student's benefit is meaningful only if it retains required success, robustness, and safety under the real latency budget. Keep a generalization suite to detect forgetting.

### Post-training with curated and intervention data

High-quality target demonstrations may be more useful than simply adding volume. Curate for consistent action semantics, successful completion, useful recovery, and coverage of identified gaps. Preserve a provenance link to the raw data; do not overwrite failures because they are inconvenient.

Intervention data records when a human takes over, what the policy did before the intervention, and how the operator recovered. Decide whether to train on the policy-caused segment, the recovery segment, or both with different weights. A naive filter that keeps only successful final episodes can remove the very recovery behavior you intended to learn.

Preference learning and RL require comparisons or rewards. In robotics, a reward that is easy to compute—distance to an object, for example—may not capture grasp stability, collisions, or cycle quality. Audit the verifier against human task judgments and adversarial trajectories before optimizing it.

### Prevent and measure forgetting

Fine-tuning on a narrow task can reduce performance elsewhere. Maintain three evaluation groups:

1. **Target:** the new task, robot, or environment.
2. **Retention:** representative pretraining or previously released tasks.
3. **Transfer:** held-out phrasings, objects, scenes, or embodiments not used for selection.

Possible mitigations include mixing replay data, reducing the learning rate, updating fewer layers, using adapters, regularizing toward the base model, or stopping earlier. Each is a hypothesis. Plot target improvement against retention loss rather than reporting only the target winner.

### Turn a recipe into an experiment record

A training recipe is more than a learning rate. Record initialization and license, frozen modules, data mixture, normalization, augmentation, objective, action horizon, global batch, optimizer, schedule, precision, gradient clipping, number of steps, checkpoint-selection rule, and evaluation protocol.

When a run fails, distinguish:

- **optimization failure:** loss or gradients become unstable;
- **generalization failure:** training improves but holdout does not;
- **objective mismatch:** offline metric improves while online behavior does not;
- **systems failure:** throughput, memory, checkpoint, or loader prevents the intended experiment;
- **deployment mismatch:** preprocessing, latency, or control changes at inference.

This taxonomy determines the next experiment. It also prevents the common response of changing five hyperparameters and learning nothing about the cause.

**Prove it:** Fine-tune one pretrained policy with head-only and LoRA adaptation, or implement the same comparison on your TinyVLA. Publish target, retention, and transfer results; trainable versus total memory; a curated-data ablation; and a short decision memo explaining whether full fine-tuning would be justified next.

# Part II — Data, optimization, and training infrastructure

<div id="chapter-6"></div>

## 6. Robot data engineering: make time and semantics explicit

A robot dataset is a time-aligned, versioned interface between physical systems and learning code. Treating it as a directory of videos and arrays is how subtle label errors become expensive training runs.

### The canonical episode schema

Keep raw data immutable and define a normalized logical schema. A practical episode contains:

```text
Episode
├── identity: dataset, episode_id, embodiment, task, operator/source
├── instruction: raw text, normalized text, language/provenance
├── timing: clock domain, episode start/end, control frequency
├── calibration: camera intrinsics/extrinsics, frame conventions, versions
├── steps[]
│   ├── timestamps: camera exposure(s), robot state, command
│   ├── observations: image references, joint/gripper state, other sensors
│   ├── action: command values, type, frame, units, execution timestamp
│   └── metadata: intervention, termination, quality flags
└── provenance: source URI, license, raw hash, converter version
```

Not every dataset has every field. Represent missing information explicitly rather than inventing it. “Unknown clock offset” is different from zero offset.

Formats such as [RLDS](https://arxiv.org/abs/2111.02767) and dataset ecosystems such as [LeRobot](https://github.com/huggingface/lerobot) provide useful conventions and tooling. You can also define a project-specific schema, but preserve a lossless mapping to the source and document every transformation.

### Synchronization is a physical assumption

Three events are different: a camera exposes an image, a controller measures state, and a command begins execution. Logging them under the same loop index does not guarantee simultaneity.

To establish alignment:

1. Identify clock domains and units; convert to a common monotonic timeline where possible.
2. Measure or estimate sensor and actuation latency with a known event, such as a commanded visible motion.
3. Store original timestamps alongside derived alignment fields.
4. Choose an association rule—nearest, previous, or interpolation—per modality.
5. Validate the rule with motion events and edge cases, not only summary statistics.

Do not casually interpolate discrete gripper events or across episode resets. For continuous state, interpolation may be reasonable within bounded gaps; for actions, the correct alignment depends on when the command was issued and executed. Large gaps should become quality flags, not silently fabricated data.

### Frames, units, and normalization

A transform `T_AB` should have a documented meaning, such as “maps coordinates from frame B to frame A.” Use composition tests with known frames and round-trip tests for rotations. Store lengths in one canonical unit, angles in another, and convert at boundaries. Keep quaternion signs continuous within a trajectory if the model uses them.

Action normalization needs the same care as image normalization. Compute means, standard deviations, quantiles, or bin edges from the **training split only**. Save them with the model artifact. For multiple embodiments, decide whether statistics are shared, per embodiment, or hierarchical; shared statistics can erase meaningful scale differences.

Avoid blindly clipping outliers. A large action may be sensor corruption, an emergency stop, or valid recovery. Investigate its provenance and define a quality policy.

### Raw, normalized, and sharded representations

Separate three layers:

- **Raw:** source-owned bytes, immutable, with license and hashes.
- **Normalized:** validated records with explicit semantics and provenance.
- **Training shards:** packed sequences or samples optimized for reading, derived from a specific normalized manifest.

Sharding improves sequential throughput and simplifies distributed assignment, but introduces tradeoffs. Large shards reduce file-open overhead and can make random access harder; small shards improve flexibility but stress metadata and filesystems. Benchmark on your storage rather than adopting a universal shard size.

Video decoding often dominates robot-data loading. Test compressed-video seek behavior, keyframe intervals, decode threads, resolution, and whether sequential episode reads outperform random frame access. Cache only after measuring; a cache can move the bottleneck to memory, disk, or invalidation.

### The loader must preserve distributed correctness

A high-throughput loader has two independent requirements: feed the GPU and give each rank the intended samples.

For shuffled sharded training, define:

- shard shuffle seed = base seed + epoch;
- rank assignment before worker assignment;
- worker-specific deterministic sample order;
- drop/pad behavior at shard and epoch boundaries;
- resume position and RNG state.

If every worker shuffles all samples independently with the same seed, ranks can duplicate data. If they use uncoordinated different seeds, overlap may be probabilistic rather than eliminated. Log a small manifest of `(epoch, rank, worker, shard, sample_index)` and assert disjoint rank assignments in a test.

Performance knobs such as worker count, prefetch factor, pinned memory, persistent workers, and non-blocking transfers are workload-specific. Measure end-to-end samples per second, batch wait time, decode time, host memory, and GPU utilization. More workers can degrade performance through contention.

### Data tests belong next to model tests

At minimum, validate:

- unique episode and step identifiers;
- monotonic timestamps within each clock domain;
- no NaN or infinite values after normalization;
- valid shapes, dtypes, masks, and camera references;
- no chunk crossing an episode boundary;
- action and state ranges, with documented exceptions;
- frozen or duplicated video-frame detection;
- normalization statistics computed only on training data;
- train/validation/test disjointness by episode and source group;
- deterministic round-trip decode of every field.

Render actual training batches after augmentation. A schema test cannot reveal a horizontally flipped image paired with an unmodified action.

Treat downloaded datasets and checkpoints as untrusted input. Prefer safe serialization, avoid arbitrary pickled objects, validate archive paths, and keep credentials out of dataset metadata. Respect licenses and attribution; “publicly downloadable” does not mean unrestricted redistribution.

### Versioning and lineage

A data manifest should include source version, normalized-schema version, converter commit, inclusion/exclusion rules, shard hashes, normalization-statistic reference, and split identifiers. A training run references the manifest, not a mutable folder name such as `data/final_v2`.

When a quality rule changes, produce a new manifest and quantify the difference: episodes removed, tasks affected, and why. This makes a model improvement attributable to data rather than an undocumented side effect.

**Prove it:** Build a converter for two small public trajectory sources into your normalized schema. Publish alignment evidence, frame/unit tests, split-leakage tests, a hashed shard manifest, a rank-disjoint distributed sampler test, and a loader profile showing the bottleneck before and after one optimization.

<div id="chapter-7"></div>

## 7. Data mixtures, augmentation, and curriculum

A heterogeneous training set is not one distribution. It is a collection of tasks, embodiments, operators, cameras, action conventions, episode lengths, and quality levels. The sampler determines which distribution the optimizer actually experiences.

### Count the unit you are sampling

One thousand episodes of a long task can contribute more transitions than ten thousand short episodes. Sampling uniformly by episode, timestep, or trajectory chunk produces different mixtures. Action-chunk training adds another choice: uniformly sampling valid start indices weights long episodes more heavily.

Write the intended unit in the data contract. Then report both:

- **composition:** episodes, hours, and transitions per task/embodiment;
- **optimization exposure:** actual sampled batches per task/embodiment.

A pie chart of raw episodes can conceal the effective training distribution.

### Temperature sampling

For dataset sizes `nᵢ`, temperature sampling defines:

`pᵢ = nᵢ^α / Σⱼ nⱼ^α`

At `α = 1`, sampling is proportional to size. At `α = 0`, each dataset has equal probability. Values between interpolate. The interactive lab shows expected draws, passes over each dataset, and sampling relative to natural frequency.

Temperature is not a quality score. A tiny dataset may contain excellent demonstrations or narrow, repetitive behavior. Equalizing it with a large dataset may improve coverage or cause memorization. Select the mixture using per-task and per-embodiment holdouts, retention tests, and training dynamics.

Other strategies include manually specified weights, quality-weighted sampling, curriculum schedules, and adaptive sampling based on failure rates. Adaptive methods can create a feedback loop: the sampler overweights a hard task whose labels are inconsistent, training becomes unstable, and the task looks even harder. Cap weights and inspect why a slice is difficult.

### Augmentation must preserve the label

Image augmentation can improve robustness, but robotics couples vision and action.

- **Color jitter, blur, exposure, and sensor noise** may be label-preserving within realistic ranges.
- **Cropping and resizing** can remove the target or alter spatial precision. Verify object visibility and camera assumptions.
- **Horizontal flips** generally require corresponding changes to state, action, camera geometry, and instruction (“left” becomes “right”). An image-only flip is often wrong.
- **Temporal jitter and frame dropout** can model sensing variation, but must preserve action alignment and test the intended latency regime.
- **State or action noise** can broaden coverage or imitate sensor error, but physically impossible noise teaches inconsistent dynamics.
- **Language paraphrases** can improve instruction robustness if meaning is preserved. Human review a sample of generated paraphrases and keep negation, object identity, and spatial relations intact.

Build an augmentation viewer that shows the original and transformed observation, instruction, state, and action together. Test the geometric transformation numerically where possible.

Augmentation is not a substitute for missing physical variation. Synthetic brightness changes do not create new contact dynamics or camera viewpoints.

### Curriculum is a schedule, not a guaranteed improvement

A curriculum might begin with state-based policies, then add vision; begin with short horizons, then longer tasks; or begin with one embodiment, then add others. Potential benefits include easier optimization and better use of difficult data. Potential costs include forgetting, biased representations, and extra hyperparameters.

Treat curriculum as a controlled experiment:

1. Define stages and promotion criteria before training.
2. Keep the final evaluation fixed.
3. Compare against a mixed-data run with comparable total samples and compute.
4. Evaluate retention of earlier-stage skills.
5. Ablate the order, not just the presence of more data.

A curriculum that uses more total training than the baseline has not isolated the value of ordering.

### Design a coverage matrix

Create a table whose axes reflect deployment variation:

| Axis | Example levels |
|---|---|
| Task | pick, place, wipe, insert, fold |
| Object | geometry, size, deformability, color, material |
| Scene | background, clutter, lighting, table height |
| Sensor | camera pose, intrinsics, dropped modality, calibration drift |
| Behavior | nominal demonstration, recovery, intervention, failure |
| Embodiment | arm, gripper, action space, control frequency |
| Language | template, natural paraphrase, relation/negation, unseen composition |

Empty cells are hypotheses about missing capability. Do not fill every combination blindly. Prioritize cells connected to observed failures or deployment requirements.

Hold out entire groups for generalization tests. If frames from the same object instance, room, or source video appear in both train and test, the split may overestimate novelty. Use group-aware splits and document near-duplicate handling.

### Close the loop with collection priorities

A useful collection request is specific: “The policy fails when the target is occluded by the gripper from the wrist camera during final approach; collect demonstrations with varied approach angles and recovery from initial grasp miss.” “Collect more picking data” gives operators little guidance and may repeat what the model already knows.

Rank candidate collection by expected decision value, not model uncertainty alone. Consider failure frequency, severity, likelihood that data will address it, collection cost, and safety. After collection, version the mixture and run the same evaluation to determine whether the hypothesis was correct.

**Prove it:** Run three mixture settings—natural, one intermediate temperature, and equal-dataset sampling—under a fixed draw budget. Publish per-slice results and an augmentation correctness test. Then write one failure-linked collection request and predict which metric should improve before collecting anything.

<div id="chapter-8"></div>

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

<div id="chapter-9"></div>

## 9. Distributed training: replicate work or shard state

Distributed training solves two different problems: **throughput** (finish more samples per unit time) and **capacity** (fit a model that one device cannot hold). Data parallelism primarily addresses throughput; parameter, tensor, and pipeline sharding can address capacity. Combining them introduces communication and correctness constraints.

### DDP: synchronized replicas

In DistributedDataParallel (DDP), each rank owns a model replica, processes a different shard of the global batch, and synchronizes gradients so replicas remain equivalent. The conceptual loop is:

`rank-local batch → local forward/backward → gradient all-reduce → identical optimizer update`

DDP does not divide the model's static memory by the number of GPUs. Each rank still needs parameters, gradients, optimizer state, and its own activations. Its main scaling costs are gradient communication, synchronization, and stragglers.

Correctness checks include:

- rank-disjoint samples and a known global batch;
- identical initial model state;
- equivalent loss and gradient reduction semantics;
- controlled RNG per rank without accidental identical augmentation;
- no rank silently omitted from collectives;
- checkpoint and evaluation performed with well-defined rank responsibilities.

A useful starting point is to compare one process with a tiny multi-process run on the same batch and ensure the intended numerical behavior, allowing for documented reduction differences.

### FSDP and ZeRO: shard the static state

Fully Sharded Data Parallel (FSDP) shards parameters, gradients, and optimizer state across data-parallel ranks. Parameters are gathered when needed for computation and can be resharded afterward; communication patterns such as all-gather and reduce-scatter replace the simple mental picture of a gradient all-reduce. The [PyTorch FSDP paper](https://arxiv.org/abs/2304.11277) and [FSDP documentation](https://docs.pytorch.org/docs/stable/fsdp.html) describe actual implementation choices.

[ZeRO](https://arxiv.org/abs/1910.02054) organizes related ideas into stages that shard optimizer state, gradients, and parameters. Framework APIs differ, so reason from what is sharded at each phase rather than treating names as interchangeable.

The lab uses an intentionally simple BF16 AdamW model:

- 2 bytes per parameter for BF16 weights;
- 2 for BF16 gradients;
- 4 for FP32 master weights;
- 8 for two FP32 optimizer moments.

That totals 16 bytes per parameter before activations and runtime buffers. Under ideal FSDP with `N` ranks, the lab divides this static state by `N`. Real memory can be higher because of unsharded modules, temporary all-gather buffers, communication workspaces, fragmentation, and implementation-specific precision. A “fits” calculation is a hypothesis to test with a profiled step.

### Tensor and pipeline parallelism

**Tensor parallelism** splits operations such as matrix multiplications within a layer across devices. It can reduce per-device parameter and activation requirements, but frequently communicates activations and benefits from high-bandwidth, low-latency interconnect. [Megatron-LM](https://arxiv.org/abs/1909.08053) is a foundational reference for transformer tensor parallelism.

**Pipeline parallelism** assigns different layer ranges to different stages and passes activations between them. Microbatch schedules keep stages busy but introduce pipeline bubbles and complicate optimizer semantics. [GPipe](https://arxiv.org/abs/1811.06965) is a useful baseline reference.

Large systems may combine data, tensor, and pipeline parallelism. More dimensions are not inherently better. Use the simplest layout that meets memory and throughput goals, and explain the interconnect assumptions. A policy with a small action head and a large VLM backbone may need different strategies for different modules.

### Multi-node introduces a new failure surface

Within one node, you still face distributed correctness. Across nodes, add rendezvous, network interfaces, routing, storage contention, DNS/firewalls, heterogeneous stragglers, job scheduling, and partial failures. NCCL is a communication library, not a complete cluster-management solution.

A typical `torchrun` launch exposes rank, world size, and rendezvous settings, but production infrastructure determines how those values are managed. Learn to read:

- global rank, local rank, and world size;
- node-local device assignment;
- master/rendezvous configuration without exposing secrets;
- backend and network topology;
- logs that identify the first rank which failed or stopped communicating.

Never present a two-process CPU test as a multi-node result. If cluster access is limited, run a short, preplanned multi-node experiment with explicit questions: scaling efficiency, network sensitivity, checkpoint restart, and failure recovery.

### Sharded loading and deterministic resume

At scale, the sampler is part of the distributed algorithm. Every rank should know which shards and samples it owns. Save enough state to resume without silently repeating or skipping a large interval:

- epoch and global optimizer step;
- shard/sample cursor or a deterministic reconstruction rule;
- model and optimizer shards;
- scheduler and gradient-scaler state;
- Python, framework, CUDA, and sampler RNG states where applicable;
- exact data and configuration manifests.

Write checkpoints to temporary locations and publish atomically so a partially written file is not mistaken for the latest valid checkpoint. Test corrupt and interrupted writes. Keep at least one known-good prior checkpoint until the new one is verified.

A restart test should compare the post-resume sample sequence and relevant state with an uninterrupted control run. “The loss continued decreasing” is not sufficient.

### Measure scaling, not just speed

If one GPU takes `T₁` and `N` GPUs take `Tₙ` for the same global workload, speedup is `T₁/Tₙ` and scaling efficiency is `T₁/(N · Tₙ)`. Changing global batch at the same time changes the optimization problem, so disclose it.

Profile communication and computation separately. A larger per-rank batch may improve compute efficiency but alter convergence; a smaller one may expose communication overhead. Fast storage on one node may become a shared bottleneck on many.

Cost should include GPU time, storage, data processing, failed runs, evaluation, and operator time. The north-star metric is often **cost and time to a checkpoint that passes the same release gate**, not the cheapest step.

### Fault injection is a project, not an afterthought

On a small job, deliberately kill one worker, interrupt a checkpoint write, fill a test filesystem, corrupt a shard, and throttle or stop a data source in a controlled environment. Verify detection, error attribution, cleanup, restart, and data ordering. Do not run disruptive fault tests on shared infrastructure without authorization.

**Prove it:** Produce a scaling report with an actual topology diagram, single- and multi-rank correctness checks, memory profiles, throughput and scaling efficiency, a resume-from-checkpoint comparison, and one controlled fault injection. If you lack multiple nodes, mark multi-node throughput as unmeasured and supply a ready-to-run test plan instead.

<div id="chapter-10"></div>

## 10. Reproducible experiments and model release

Reproducibility means another engineer can identify exactly what was run, reconstruct its inputs, and judge whether a later result is comparable. It is more demanding than saving a checkpoint and a screenshot of a loss curve.

### The run contract

Every meaningful run should reference:

| Layer | Minimum recorded identity |
|---|---|
| Code | Commit, dirty-state diff if any, entry point, resolved command |
| Configuration | Fully resolved config, including defaults and sweep identity |
| Dependencies | Lockfile or environment image/digest, key framework and driver versions |
| Data | Immutable manifest, split IDs, normalization reference, mixture and augmentation version |
| Initialization | Base-model artifact, revision/hash, license, tokenizer and preprocessor versions |
| Hardware | Accelerator, count, node topology, important runtime/backend settings |
| Randomness | Seeds and the limits of actual determinism |
| Output | Model/optimizer/scheduler state, RNG/sampler state, metrics, logs, artifact hashes |

Configuration tools such as [Hydra](https://hydra.cc/) can help compose and resolve settings; experiment systems such as [MLflow](https://mlflow.org/docs/latest/) or [Weights & Biases](https://docs.wandb.ai/) can track runs. The tool is secondary. A hand-written manifest with complete identities is better than a polished dashboard missing the dataset version.

Do not log secrets, private operator data, or unrestricted raw sensor streams by default. Define access controls and retention along with observability.

### Separate selection from confirmation

A typical experiment creates many checkpoints. Use training and validation data to select hyperparameters and checkpoints; keep a test or confirmation suite for the final comparison. If a test result triggers another model change, it has participated in selection.

For expensive robot rollouts, maintain:

- a small frequent **smoke suite** for obvious regressions;
- a broader **validation suite** for model selection;
- a frozen **release suite** for final candidate evaluation;
- a rotating or newly collected **confirmation suite** when repeated adaptive testing threatens validity.

Version the environment and success rubric alongside the model. A changed simulator build, controller gain, camera calibration, or reset distribution can make two numbers incomparable.

### Tests form a pyramid

1. **Unit tests:** shape/dtype contracts, masks, coordinate transforms, normalization round trips, tokenization, sampler disjointness, loss reductions.
2. **Data integration tests:** decode raw-to-normalized episodes, validate manifests, render augmented batches, check split leakage.
3. **Training smoke tests:** one small batch, one tiny epoch, checkpoint save/load, frozen/trainable parameter assertions.
4. **Distributed tests:** rank assignment, gradient/loss semantics, sharded state restore, interrupted checkpoint handling.
5. **Policy regression tests:** fixed simulation scenarios and rollout budgets, latency checks, failure classifications.
6. **On-robot release tests:** approved supervised protocol with explicit stop criteria and rollback.

Fast tests should run on every change; expensive tests can run on a schedule or release candidate. A green unit suite does not imply robot competence, and a successful demo does not imply maintainable code.

### Checkpoints are products with interfaces

A deployable model artifact needs more than weights:

- architecture and compatible code revision;
- modality schema and tensor order;
- preprocessing and action denormalization;
- camera and state expectations;
- action representation, horizon, units, frames, and controller contract;
- tokenizer or text preprocessing;
- training and evaluation manifests;
- known limitations, license, and intended use;
- latency measurements and supported runtime;
- rollback target.

Prefer safe serialization formats where practical and treat downloaded checkpoints as untrusted. Verify artifact hashes and provenance. A checkpoint that silently loads with missing keys is not a valid release.

### The release gate

Define the gate before seeing the candidate's result. An example:

> Candidate must pass all schema and inference-parity tests; meet the fixed simulation success and safety thresholds with reported intervals; show no material regression on retention tasks; remain below the agreed p95 sensor-to-command latency budget on target hardware; complete supervised real-robot smoke tests; and have a reproducible artifact plus rollback.

Thresholds must come from task requirements and baseline risk, not copied from this example. For a candidate with modest sample size, a gate may require more evidence rather than pretending the interval is narrow.

Automate what is deterministic and keep human review for ambiguous failure classification, physical safety, and cross-functional tradeoffs. Record waived exceptions with an owner and rationale; do not silently convert a failed gate into a warning.

### Make experiments reviewable

A useful experiment report fits on one or two pages:

1. Question and hypothesis.
2. Baseline and controlled variables.
3. Data/config/model identities.
4. Results with uncertainty and negative slices.
5. Failure analysis and alternative explanations.
6. Decision: adopt, iterate, roll back, or gather a specific kind of evidence.
7. Reproduction command and artifact links.

This discipline reduces cherry-picking and helps teammates challenge the result. It also creates the design-history evidence expected from a staff-level engineer.

**Prove it:** Choose one prior project and make it reproducible by someone else. Publish the run contract, automated smoke tests, hashed model/data manifests, a model card, and a predeclared release gate. Ask another person—or a clean environment—to follow only the documentation and record every missing assumption.

# Part III — Evaluation, debugging, and physical systems

<div id="chapter-11"></div>

## 11. Evaluation: measure capability, not demo luck

Robot evaluation asks whether a complete policy system achieves a task under a declared distribution of conditions. The complete system includes preprocessing, checkpoint, inference runtime, action postprocessing, controller, robot, and environment. Changing any one can change the result.

### Build a metric hierarchy

Start with the deployment objective, then add diagnostics:

1. **Task success:** a binary or graded outcome defined by observable final-state criteria, not by a person saying the video looked good.
2. **Task quality:** cycle time, placement accuracy, damage, spillage, energy, or other domain-specific measures.
3. **Robustness and generalization:** success by initial state, object, scene, instruction, camera, and embodiment holdout.
4. **Interventions and safety:** human takeovers, boundary violations, collisions, near misses, emergency stops, and invalid commands. Define each event before the study.
5. **Latency and reliability:** sensor-to-command distributions, timeout rate, dropped frames, controller underruns, recovery after infrastructure failure.
6. **Offline diagnostics:** action error, NLL, calibration, feature quality, and per-slice losses.

A policy with slightly lower average success but substantially fewer severe failures may be preferable. A single scalar leaderboard hides that decision.

### Offline metrics are proxies with specific uses

Offline evaluation is cheap and repeatable. Use it to detect preprocessing regressions, compare likelihoods or errors on demonstration states, and inspect per-dimension behavior. But open-loop action error does not measure whether predicted actions lead to successful closed-loop trajectories.

A model can have low average MSE and fail on rare critical transitions, or higher MSE because it chooses a different but valid path. Generative policies add another complication: a sampled action need not match the one demonstrated action to be valid.

Useful offline reports therefore include:

- per-task, per-horizon, and per-action-dimension errors;
- error at important events such as approach, contact, grasp, and release;
- predicted versus demonstrated action distributions, not only pointwise error;
- rollout-relevant slices such as occlusions or unusual initial states;
- correlation analysis between offline metrics and online outcomes across several checkpoints.

If no checkpoint ranking correlation exists, do not use that offline metric as the release gate.

### Pre-register the online protocol

Before running the candidate, freeze:

- model, environment, controller, and preprocessing versions;
- task matrix and success/failure rubric;
- initial-state distribution and randomization;
- number of trials and handling of timeouts or infrastructure aborts;
- intervention definition and whether an intervened trial counts as failure;
- primary metric, important secondary metrics, and regression threshold;
- exclusion rules for invalid trials.

Do not silently delete failures caused by the policy. Distinguish a policy timeout from a simulator crash or a hardware fault, but report all categories. If exclusions change the denominator, show both intention-to-evaluate and valid-trial analyses where appropriate.

Use the same initial conditions for paired checkpoint comparisons when possible. Pairing removes some environmental variance and lets you inspect trials where behavior changed. Keep enough independent seeds or resets to avoid treating one favorable start as a capability estimate.

### Confidence intervals quantify only one kind of uncertainty

For `s` successes in `n` independent Bernoulli trials, the observed rate is `s/n`. The interactive lab uses a 95% Wilson score interval, which generally behaves better than a simple normal interval for small samples and extreme proportions.

The interval addresses sampling variability under its assumptions. It does **not** include calibration drift, a biased reset sampler, ambiguous scoring, changing hardware, correlated trials, or train/test leakage. Fifty rollouts from nearly identical initial states do not provide the same evidence as fifty well-distributed independent trials.

When trials are clustered by object, scene, operator, or seed, consider a hierarchical or cluster-bootstrap analysis. For paired checkpoint comparisons, analyze per-condition differences rather than treating two overlapping marginal intervals as the complete test. A statistician is useful when the decision has significant cost or safety consequences.

Report the numerator and denominator alongside every percentage. “84% (42/50), 95% Wilson interval …” is more informative than “84% SOTA.”

### Slice the result

Aggregate metrics can hide a regression. Report both micro averages over all trials and macro averages over tasks or embodiments, because they answer different questions. Then slice by:

- task and instruction type;
- seen versus unseen object and scene;
- camera viewpoint and occlusion;
- episode length or horizon;
- robot and sensor configuration;
- recovery versus nominal trajectory;
- latency band and infrastructure condition.

A small overall improvement accompanied by a large drop on one robot may be unacceptable for fleet release. Multiple slices increase the chance of a chance finding; treat exploratory slice analysis as hypothesis generation and confirm important discoveries.

### Latency is a distribution and a staleness problem

Measure timestamps at sensing, preprocessing, inference start/end, command publication, controller receipt, and execution where possible. Report p50, p95, and p99, not only mean inference time. A model with fast average inference can still miss control deadlines due to garbage collection, network jitter, or video decode.

Also measure **action staleness**: the age of the observation used to generate the command at the time it executes. A faster model using an old queued frame may not be better than a slower model using fresh data. Define queue policies, dropped-frame behavior, and watchdog responses.

### Regression gates need practical significance

A release gate should specify both statistical evidence and a difference that matters. For example, a 0.2 percentage-point success change may be irrelevant for one task while a single new collision class is decisive. Avoid rigid universal thresholds; derive them from the baseline, task risk, and evaluation budget.

Use non-inferiority thinking for retention: how large a regression on existing tasks can the system tolerate in exchange for target improvement? If the evaluation cannot resolve that margin, collect more evidence or narrow the release claim.

**Prove it:** Build an evaluation report for two checkpoints with a frozen task matrix, paired initial conditions, raw success counts, Wilson intervals, per-slice outcomes, p95 latency and staleness, intervention counts, and an explicit adopt/reject decision. Include one limitation that the interval does not address.

<div id="chapter-12"></div>

## 12. Debug the full stack with trajectories

A robot failure is the end of a causal chain. “The policy failed” is an observation, not a root cause. Useful debugging finds the earliest point where the actual system diverged from its contract and tests that hypothesis with an intervention.

### Preserve the event timeline

For every evaluated episode, retain a synchronized record containing:

- episode, model, data, code, controller, robot, and calibration versions;
- camera frames or references, robot state, instruction, and preprocessing outputs;
- model input timestamps and inference start/end;
- raw model output, denormalized action chunk, selected action, and postprocessing;
- commanded versus executed state, controller status, and dropped commands;
- interventions, limit violations, timeouts, and termination reason;
- environment reset and initial-state identifiers.

Store references to large video artifacts rather than duplicating them in every log record. Define retention and access controls, especially for human operators or sensitive workspaces.

A trajectory viewer should let you scrub video while seeing state and action traces, frame IDs, timestamps, predicted chunks, executed actions, and event markers. Comparing two episodes side by side with the same time and value scales is often more informative than another aggregate chart.

### Debug in an order that creates information

A practical sequence:

1. **Reproduce and classify.** Is the failure deterministic under a recorded reset? Does it belong to perception, instruction following, motion, timing, infrastructure, or hardware?
2. **Inspect the actual model input.** Render the decoded batch after every preprocessing and augmentation step. Check camera order, color channels, resizing, normalization, and instruction tokens.
3. **Check the label and frame contract.** Plot actions against state evolution and timestamps. Test coordinate transforms and action denormalization on known examples.
4. **Check training.** Inspect per-slice losses, gradient paths, masks, sample exposure, and checkpoint selection. Did the intended layers actually train?
5. **Check inference parity.** Compare training-mode and serving preprocessing, tensor layouts, dtypes, action chunk indices, and model revision.
6. **Check the controller and timing.** Compare commanded with executed actions, latency distributions, queue age, and tracking limits.
7. **Change one variable.** Replay a known-good model, restore a prior calibration, remove augmentation, or reduce the action horizon as a discriminating intervention.

Start with the cheapest test that can eliminate a large hypothesis class. Do not begin with a week-long retrain because the training dashboard is familiar.

### Three worked failure investigations

#### Case A: low action error, robot freezes near the object

**Hypotheses:** MSE averages distinct grasp strategies; gripper command threshold is wrong; action chunks are indexed incorrectly; the controller rejects a command; the policy lacks a critical history frame.

**Tests:** inspect the raw output distribution and gripper logits; compare predicted with executed commands; replay a small overfit episode; vary executed horizon; evaluate a deterministic versus generative head. If the commanded action is correct but joint state does not change, investigate the controller before the model.

#### Case B: simulation succeeds, real robot overshoots

**Hypotheses:** action units or frame mismatch; different control frequency; camera calibration and viewpoint gap; real sensing/actuation latency; contact and dynamics mismatch; action denormalization differs at serving.

**Tests:** run low-level controller tests without the learned policy; compare timestamped command/state responses; validate a known visual landmark and frame transform; inject measured latency into simulation; bound and slow the supervised real trial. Do not compensate for an unknown timing error by randomly retraining with noise.

#### Case C: multi-GPU loss differs from single GPU

**Hypotheses:** duplicate or missing samples; incorrect global-mask reduction; rank-dependent augmentations; gradient synchronization semantics; different global batch or schedule; unmatched data manifest.

**Tests:** dump rank/sample manifests for a tiny epoch; compute a hand-checkable masked loss across two ranks; compare initial weights and optimizer steps; disable augmentation and use a fixed batch; reduce to two local processes before involving the network. The fix may be in the sampler rather than the communication library.

### Offline replay has limits

Replaying a logged observation sequence through a new model compares open-loop outputs on the old policy's states. It cannot recreate the new policy's closed-loop trajectory. Use replay for preprocessing parity, output differences, and regression tests; use simulation or supervised real rollouts for behavioral conclusions.

Similarly, replaying old actions on a real robot can be dangerous because the current environment may differ. Physical replay requires the same risk controls as any other commanded motion and should not be treated as a harmless debugging trick.

### Build comparison tools that expose decisions

An experiment-comparison view should show more than a leaderboard:

- resolved configuration diff;
- data and normalization manifest diff;
- training and validation curves on shared axes;
- per-slice online outcomes with counts and intervals;
- paired initial-condition outcomes;
- latency, memory, throughput, and cost;
- representative success and failure trajectories;
- known infrastructure exclusions.

This turns “which checkpoint won?” into “which change caused which behavioral difference, and what remains uncertain?”

### Write the incident record

For a meaningful failure, record impact, detection, timeline, earliest verified contract violation, contributing conditions, corrective action, and prevention. Avoid stopping at a person (“operator error”) or a component (“bad model”). Ask why the system allowed the condition to produce the outcome and which test would catch it earlier.

**Prove it:** Build a trajectory inspector for one project and publish three annotated failure investigations in the style above. Each must include synchronized evidence, at least two competing hypotheses, a discriminating test, the actual cause or remaining ambiguity, and a regression test or data-collection action.

<div id="chapter-13"></div>

## 13. ROS 2, simulation, and the control boundary

A learned policy usually proposes commands; other software owns device communication, state estimation, control loops, and safety constraints. Learn that boundary before connecting a model to hardware.

### ROS 2 as a systems interface

[ROS 2](https://docs.ros.org/) provides conventions and libraries for building robot systems. The core communication patterns are:

- **topics:** asynchronous streams such as camera images or joint states;
- **services:** request/response operations;
- **actions:** longer-running, cancellable goal-oriented operations with feedback;
- **parameters:** node configuration;
- **tf2:** coordinate-frame relationships over time;
- **rosbag:** recording and replay of message streams.

Quality of Service (QoS) settings affect reliability, durability, history, and queue behavior. Sensor streams and rare critical commands may need different policies. A queue that is too deep can accumulate stale observations; a queue that drops messages can lose critical events. Measure rather than assuming “reliable” means low latency.

ROS 2 and its DDS middleware do not automatically make Python inference hard real-time. Keep hard real-time control and safety functions in an appropriate architecture, with explicit deadlines and watchdogs. The learned model should not be the sole enforcement mechanism for physical limits.

### Define the policy/controller contract

Write an interface document with message schemas, frame IDs, timestamp semantics, units, action type, rate, valid ranges, queue policy, timeout behavior, and error reporting. Decide who owns:

- observation synchronization;
- preprocessing and normalization;
- model invocation;
- action selection from a predicted chunk;
- command validation and rate limiting;
- low-level tracking and state estimation;
- watchdog and safe-state transitions;
- logging and experiment identity.

A remote inference server can simplify GPU access but adds network and availability risk. Local inference reduces one network path but may be constrained by onboard compute. Compare measured end-to-end latency and failure behavior, not model runtime alone.

### Choose a simulator from the question

Different environments optimize for different research questions:

- [MuJoCo](https://mujoco.readthedocs.io/) is widely used for physics simulation and robot-learning benchmarks.
- [robosuite](https://robosuite.ai/) and [robomimic](https://robomimic.github.io/) provide manipulation environments and imitation-learning datasets/tools.
- [LIBERO](https://arxiv.org/abs/2306.03310) focuses on lifelong robot learning with language-conditioned manipulation tasks.
- [ManiSkill](https://arxiv.org/abs/2107.14483) provides simulated manipulation tasks and supports large-scale simulation workflows.
- [Isaac Sim](https://docs.isaacsim.omniverse.nvidia.com/) offers a GPU-oriented robotics simulation platform with rendering and synthetic-data capabilities.
- [Gazebo](https://gazebosim.org/docs) provides robotics simulation and integrations with ROS ecosystems.

Ask whether you need contact fidelity, visual realism, many parallel environments, ROS integration, a specific robot model, or an existing demonstration benchmark. Installing the largest simulator is not a research plan.

### Simulation validity is a separate experiment

A policy can exploit differences between simulation and reality: perfect state, simplified contact, exact camera poses, deterministic resets, or unrealistic textures. Identify which gaps matter for your claim.

Major gaps include:

- **visual:** lighting, materials, camera noise, occlusion, motion blur;
- **geometric:** camera pose, robot model, object dimensions, workspace;
- **dynamic:** mass, friction, compliance, backlash, actuator response;
- **control:** command semantics, frequency, tracking delay, safety limits;
- **operational:** network jitter, dropped frames, reset distribution, human interventions.

Domain randomization broadens simulated conditions, but excessive randomization can make learning harder or produce unrealistic data. System identification estimates real dynamics or delays to improve the model. Both should be evaluated against real observations rather than assumed to create transfer.

### Reproducible simulation evaluation

Version simulator, assets, task code, controller, and reset generation. Record random seeds but also save concrete initial states; a seed may not reproduce the same scene across software versions. Separate rendering or physics failures from policy failures in trial counts.

A good suite includes:

- deterministic smoke scenarios for regression;
- randomized nominal scenarios for capability estimation;
- held-out visual and physical parameters for generalization;
- latency, dropped-frame, and sensor-noise injection;
- long-horizon and recovery cases;
- tests that verify the environment's own success detector.

Validate the success detector with hand-labeled videos. An incorrect environment reward can make a policy appear successful or teach it to exploit a proxy.

### A safe progression toward reality

Use staged evidence: unit-tested message adapter → recorded sensor input without actuation → low-level controller validation → simulated policy → bounded supervised physical smoke test. Chapter 14 adds the site-specific safety process required for real motion.

Simulation remains valuable even after hardware is available. It is the cheap regression environment for preprocessing, interfaces, failure injection, and broad scenario coverage. It does not eliminate the need for final real-system validation.

**Prove it:** Implement a ROS 2-style policy adapter or an equivalent simulator interface with explicit frame, timestamp, queue, and watchdog contracts. Publish recorded-input tests, a simulated latency-injection study, a versioned reset suite, and a gap analysis listing exactly which real-world claims remain untested.

<div id="chapter-14"></div>

## 14. On-robot validation and safety

Physical evaluation is not a larger simulation run. Actions can damage equipment, injure people, and alter the environment in ways that cannot be reset by reloading a scene. The experimental design and the safety case must be developed together.

> **Boundary:** This chapter is a learning checklist, not a robot-safety certification. Use qualified supervision, the manufacturer's instructions, and a site-specific risk assessment. Applicable standards and legal requirements depend on the robot, workspace, and jurisdiction. A learned policy, software limit, or emergency-stop button mentioned in a tutorial is not automatically safety-rated.

### Establish the operating envelope

Before any learned command reaches a robot, document:

- approved task, workspace, objects, and environmental conditions;
- robot, end-effector, controller, and software versions;
- physical barriers or exclusion zones where required;
- independent protective and emergency-stop systems appropriate to the installation;
- speed, workspace, force/torque, and other limits supported by the platform and risk assessment;
- roles of operator, spotter/supervisor, and person authorized to start or stop the trial;
- startup, reset, communication-loss, and shutdown procedures;
- explicit abort criteria and the approved response to each.

Do not assume that stopping motion is always the safest response for every configuration; gravity, supported loads, and process state matter. A qualified robotics engineer should define the safe state.

### Stage exposure

A cautious evidence ladder is:

1. **Power-off inspection:** mechanical mounting, cabling, workspace, payload, and protective systems.
2. **Low-level validation without the policy:** joint state, frames, controller tracking, limits, clocks, cameras, and stop mechanisms.
3. **Recorded-input shadow mode:** run preprocessing and inference without sending learned commands; inspect outputs and latency.
4. **Simulation with measured real constraints:** inject latency, camera calibration, command limits, and control semantics measured from the robot.
5. **Minimal supervised motion:** the smallest useful movement under approved low-speed and workspace constraints, with a known non-learning command first.
6. **Bounded learned-policy smoke test:** short horizon, simple initial state, continuous supervision, immediate abort access.
7. **Pre-registered evaluation:** expand only after the smoke evidence supports it.

“Shadow mode” should be technically verified: confirm that the output path is disconnected or inhibited, rather than assuming a boolean named `safe` works.

### The experiment card

Every physical session should have an owner and a written card:

- hypothesis and exact candidate artifact;
- baseline and rollback artifact;
- task/reset matrix and number of planned trials;
- success, intervention, near-miss, and failure definitions;
- latency and logging checks;
- operating envelope and abort criteria;
- maximum trial count or session stop conditions;
- data retention, privacy, and operator consent where relevant.

Changes during the session are new experiment conditions. If a camera is moved, a controller parameter changes, or a checkpoint is swapped, record it and do not pool results blindly.

### Interventions are data and outcomes

Define an intervention before the study. Does touching the emergency stop count? Does verbal guidance count? Does repositioning an object invalidate a trial or count as failure? Ambiguous rules create biased success rates.

Log the intervention timestamp, reason, preceding model state, and recovery trajectory. Recovery data can be valuable for later training, but the trial's outcome must still follow the predeclared rule. Do not turn an intervened failure into a success because the human completed the task.

Near misses deserve review even if no damage occurred. Track boundary approaches, unexpected contact, repeated controller saturation, stale commands, and operator loss of confidence where these are relevant to the risk assessment.

### Measure the deployed system

On-robot latency includes camera exposure and transport, synchronization, preprocessing, inference, network publication, queueing, controller handling, and actuation response. Log percentiles and worst observed cases. Test stale-data rejection and communication-loss behavior under controlled conditions.

Check inference parity between the training workstation and robot runtime. Differences in image codecs, color conversion, resizing, dtype, tokenizer version, and action normalization can create a policy change without changing weights.

Release progressively. A checkpoint that works on one workcell may need calibration and validation on another. Keep robot-specific configuration explicit and tie every rollout log to the exact artifact and calibration.

### Data collection with operators

Operators are experimental partners, not unlimited sensors. Provide clear task instructions, teleoperation calibration, quality feedback, and a way to flag bad episodes. Monitor fatigue and inconsistent demonstrations. Record provenance and consent appropriate to the workplace; avoid capturing unrelated people or sensitive screens.

Review a sample of demonstrations promptly. Discovering a clock or camera problem after thousands of episodes wastes effort and can lead to pressure to keep bad data. Build quality checks into the collection session.

### If you do not have hardware

You can still build most of the release harness in simulation and with recorded real datasets. Publish:

- the interface and safety-boundary design;
- shadow-mode inference on recorded streams;
- measured software latency on the intended compute;
- a hardware experiment card ready for review;
- explicit “not validated on a physical robot” status.

Do not simulate an arm in a video and describe it as physical deployment. If you later gain access to a shared platform, your prepared protocol makes the session safer and more informative.

**Prove it:** Complete a reviewed experiment card and a recorded-input shadow-mode run. If hardware is available, add a supervised low-risk smoke report with actual latency, intervention, and abort evidence. If not, mark the physical gate open and have a knowledgeable roboticist critique the plan rather than claiming completion.

<div id="chapter-15"></div>

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

# Part IV — Portfolio, roadmap, and staff practice

<div id="chapter-16"></div>

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

<div id="chapter-17"></div>

## 17. A 36-week roadmap with exit gates

This sequence is for an experienced software or ML engineer spending roughly 12–15 focused hours per week. It is not a zero-to-staff guarantee. Beginners should add a prerequisite phase; people with full-time study time can compress the calendar but not the need for independent failures, repeated experiments, and physical validation.

### If you need prerequisites

Spend 16–24 additional weeks, or longer as needed, building four foundations:

1. **Python and engineering:** typed functions, tests, Git, debugging, Linux, packaging, profiling, and small CLI tools.
2. **Math:** vectors and matrices, gradients, probability distributions, expectations, confidence intervals, coordinate transforms, and rotations.
3. **Deep learning:** implement and train MLPs, CNNs, and a small transformer in PyTorch; understand optimization, regularization, and split discipline.
4. **Robotics basics:** kinematics, joint versus Cartesian control, frames, sensors, feedback control, and one simulator.

Exit when you can independently train and evaluate a small supervised model and explain every tensor and split. Do not use the calendar to override that gate.

### The experienced-engineer sequence

| Weeks | Study and build | Exit gate |
|---|---|---|
| 1–2 | Chapters 0–2; baseline audit; environment and data setup | One-page thesis, working test setup, decoded demonstration episodes, action contract |
| 3–5 | Project 1; Chapters 8 and 11 as needed | Reproducible BC baseline with closed-loop evaluation and failure analysis |
| 6–9 | Project 2; Chapters 6–7 | Two-source trajectory foundry, quality tests, versioned manifests, measured loader |
| 10–15 | Project 3; Chapters 3–5 | TinyVLA modality and action-head comparisons with repeated online results |
| 16–19 | Project 4; Chapters 8–10 | Distributed correctness, memory/throughput report, resilient checkpoint and release artifact |
| 20–23 | Project 5; Chapters 10–12 | Versioned evaluator, planted-regression catch, trajectory comparison and release decision |
| 24–29 | Project 6; Chapter 15 | Cross-embodiment transfer study with positive and neutral/negative evidence |
| 30–36 | Project 7; Chapters 13–14 first | Shadow-mode and safety-reviewed protocol; physical iteration if access exists |
| Continuing | Chapter 18; upstream reviews, mentoring, deeper gaps | Public design discussion, reviewed contribution, reproducible work by another person |

Project 7 can extend beyond week 36. Hardware scheduling and safety review should set the pace. Do not skip its early gates to fit the calendar.

### A sustainable weekly cadence

For a 12-hour week:

- **2 hours — read and derive:** one chapter or primary paper; write formulas and contracts by hand.
- **6 hours — build:** one narrow milestone with tests and instrumentation.
- **2 hours — measure:** baseline, controlled comparison, failure trajectories, or profiling.
- **1 hour — communicate:** design note, experiment report, code review, or README.
- **1 hour — retrieve:** answer old interview prompts without notes and update the evidence matrix.

Protect time for analysis. If every week adds features, the portfolio becomes a pile of code without conclusions. At the end of each project, take a no-new-features session to remove dead code, rerun tests, and write limitations.

### Plan compute around questions

Before requesting compute, fill out a one-line experiment card:

> I need **[hardware/topology]** for **[duration]** to distinguish **[hypotheses]**, measured by **[metrics]**, with **[maximum cost/time]** and **[stop condition]**.

Use the cheapest environment that can answer the question:

| Question | Appropriate environment |
|---|---|
| Are masks and action labels correct? | CPU unit tests and tiny fixtures |
| Can the policy learn this task? | One modest GPU or existing pretrained baseline |
| Does the loader scale? | Real storage and target worker configuration; potentially multiple nodes only if shared storage matters |
| Does FSDP fit and resume? | Multiple actual GPUs for memory/performance claims; local process tests for some correctness checks |
| Does multi-node networking change throughput? | At least two actual nodes with documented interconnect |
| Does the policy work on hardware? | The physical robot and deployment compute |

Run expensive jobs only after smoke tests pass. Save resolved configs and stop conditions locally so a failed SSH session does not become an uncontrolled training job. Respect shared-cluster quotas and never run fault injection on infrastructure you do not control.

### Review at four portfolio gates

**Gate A — after Project 1:** Can you distinguish offline fit from online behavior? If not, repeat the baseline with better instrumentation.

**Gate B — after Project 3:** Can you attribute a behavioral change to data, modality, architecture, or action head? If every comparison changes several factors, simplify.

**Gate C — after Project 5:** Can another engineer reproduce your training and evaluation and disagree with you using the same artifacts? If not, improve manifests and reports before scaling.

**Gate D — after Project 7:** Which claims are demonstrated in simulation, on multi-node infrastructure, and on physical robots? Rewrite the portfolio with those boundaries explicit.

### Turn evidence into an honest résumé

Use this structure:

> Owned **[specific system/experiment]** across **[actual scale]**, changing **[baseline metric]** to **[candidate metric with evaluation size]**, by **[mechanism]**; added **[reliability/reproducibility artifact]**.

Example structure—not numbers to copy:

> Built a language-conditioned manipulation policy and matched evaluation harness; compared regression and diffusion action heads on paired simulated resets, measured the success/latency tradeoff, and released versioned data/model manifests with trajectory-level failure analysis.

Do not write “improved success by 30%” unless you have the baseline, denominator, conditions, and uncertainty. Distinguish relative from absolute percentage-point changes. Say “two processes on one GPU” or “eight GPUs across two nodes,” not merely “distributed at scale.”

### Interview preparation starts during the build

After each project, answer five questions without looking at the code:

1. What was the bottleneck and what evidence proved it?
2. What alternatives did you reject, and why?
3. What is the weakest part of your evaluation?
4. What would you do with 10× data, 10× compute, or one more robot?
5. What result would make you reverse your decision?

These are more useful than memorizing definitions because the role emphasizes ambiguous ownership and full-stack debugging.

**Prove it:** Put the 36-week table and your four gates into a tracker with actual dates and evidence links. Book compute only against written experiment cards. At each gate, update the plan based on measured gaps and record anything you deliberately chose not to build.

<div id="chapter-18"></div>

## 18. Staff-level ownership, communication, and interview drills

Technical range gets the system working; staff-level judgment makes the right system working for other people. The posting explicitly calls out ambiguous ownership, cross-functional communication, maintainable production systems, and mentorship.

### Frame an ambiguous project

Before proposing an architecture, write a one-page problem frame:

1. **Decision:** who will do what differently after this work?
2. **Current baseline:** what happens now, with which measured failure modes?
3. **Users and operators:** researchers, robotics engineers, data collectors, manufacturing operators, and on-call owners.
4. **Constraints:** latency, safety, hardware, data, compute, timeline, privacy, maintenance.
5. **Unknowns:** which assumptions could invalidate the plan?
6. **Options:** include a simpler non-model or non-scale option.
7. **Milestones and kill criteria:** what evidence triggers continuation, pivot, or stop?

For example, “train a larger VLA” is a solution. “Reduce grasp failures caused by wrist-camera occlusion” is a problem frame that permits camera changes, data collection, model changes, or controller changes.

### Make tradeoffs across four budgets

A model decision spends at least four budgets:

- **Data:** collection cost, quality, licensing, coverage, retention.
- **Compute:** memory, interconnect, throughput, GPU-hours, inference hardware.
- **Evaluation:** rollouts, resets, operator time, statistical resolution, safety exposure.
- **Organization:** code complexity, reviewer expertise, on-call burden, onboarding, vendor dependency.

A technically superior architecture can lose if it consumes evaluation capacity or creates an unmaintainable stack. Record the tradeoff in an Architecture Decision Record (ADR): context, options, decision, consequences, evidence, and reversal condition.

### Lead across disciplinary boundaries

Different teams hold different ground truth:

- **Researchers** can identify modeling hypotheses and relevant literature.
- **Robotics engineers** understand controllers, frames, hardware constraints, and safety.
- **Data teams and operators** see collection artifacts, task ambiguity, and practical coverage.
- **Infrastructure engineers** understand storage, networking, scheduling, and failure modes.
- **Manufacturing stakeholders** define acceptable quality, cycle time, and operational risk.

A good staff engineer translates rather than pulls rank. “Loss went down” becomes “the offline proxy improved, but the paired grasp holdout did not; I should inspect approach trajectories before more training.” “The robot looks weird” becomes “after camera frame 214, commands continue for 180 ms while joint state is constant; I need controller and timing traces.”

### Mentor through artifacts and review

Mentorship is not doing the difficult part silently. Useful mechanisms include:

- design reviews that ask for contracts and falsifying experiments;
- code reviews that teach shape, mask, data-lineage, and failure-handling invariants;
- debugging pair sessions where the less experienced person chooses the next test;
- runbooks and onboarding projects with well-scoped ownership;
- blameless incident reviews focused on system conditions and prevention;
- explicit growth plans tied to evidence and increasing ambiguity.

Measure your leverage by whether others can reproduce, extend, and safely operate the system without you.

### Thirty interview drills with answer sketches

#### Policy and architecture

1. **What is a VLA?** A policy conditioned on vision, language, and often state that outputs executable actions; define the exact observation/action contract before comparing models.
2. **Why behavior cloning first?** It is a direct, stable supervised baseline. It exposes data and closed-loop issues without adding reward or exploration confounds.
3. **Why does BC fail off the demonstration path?** Deployment changes the state distribution; errors compound. Test recovery data, history, intervention labeling, or DAgger-style collection.
4. **Transformer or diffusion policy?** They answer different architectural questions and can be combined. Compare fusion/temporal backbone and action distribution separately.
5. **Why action chunking?** Temporal coherence and amortized inference. Trade off open-loop staleness using predicted horizon, executed horizon, and measured latency.
6. **Regression versus diffusion?** Regression is simple and fast but can average modes; diffusion can model richer action distributions at iterative sampling cost. Evaluate closed loop at matched conditions.
7. **What does a VLM initialization buy?** Potentially visual-language representations and transfer, not guaranteed motor grounding or contact competence. Ablate against a controlled initialization.
8. **How would you build a TinyVLA?** Explicit modality adapters, tested fusion/masks, interchangeable action heads, modality ablations, and a small online evaluation before scale.

#### Data and training

9. **How do you align video and actions?** Identify clock domains and command semantics, estimate latency, store raw timestamps, choose per-modality association, and validate with visible motion events.
10. **How do you split robot data?** By whole episode and relevant source groups; hold out objects/scenes/embodiments according to the generalization claim.
11. **How do you choose a mixture?** Define sampling unit, inspect exposure, use temperature or explicit weights, and select on per-slice holdouts and retention—not aggregate loss.
12. **Which augmentations are dangerous?** Geometric or temporal transforms that change the action or observation relationship without transforming labels and calibration accordingly.
13. **How do you debug NaNs?** Find the first nonfinite tensor, inspect data and masks, precision/range, gradients and learning rate; do not hide the issue with blind clipping.
14. **What does activation checkpointing trade?** Recompute for lower activation memory; measure step time and numerical/RNG behavior. It does not shard optimizer state.
15. **Full fine-tuning or LoRA?** Compare target, retention, memory, throughput, and inference. LoRA reduces trainable state, not the need to serve base weights or activations.
16. **When use RL?** When a reliable reward/verifier and safe, affordable exploration or offline data justify it, after a strong imitation baseline and proxy audit.

#### Distributed systems

17. **DDP versus FSDP?** DDP replicates static state and synchronizes gradients; FSDP shards parameters/gradients/optimizer state with different communication and memory tradeoffs.
18. **Tensor versus pipeline parallelism?** Tensor splits intra-layer computation with frequent communication; pipeline splits layers into stages with bubbles and activation transfer. Choose from model and topology.
19. **How do you calculate global batch?** Usually local batch × world size × accumulation, then verify mask/loss reduction and actual sample counts.
20. **How do you prove resume correctness?** Compare post-resume samples, model/optimizer/scheduler/RNG state and metrics against an uninterrupted control; test interrupted writes.
21. **GPU utilization is low. What next?** Decompose data wait, forward/backward, communication, optimizer, evaluation, and checkpointing. Profile before changing hardware or workers.
22. **What does scaling efficiency hide?** Workload/global-batch changes and convergence. Report topology, throughput, time to the same quality gate, and cost.

#### Evaluation and robot debugging

23. **Why is action MSE insufficient?** It uses demonstration states and averages over behavior; valid alternative actions can differ. Correlate with online success and inspect critical slices.
24. **How many robot rollouts?** Derive from the decision, expected rate, desired precision, trial clustering, cost, and safety. Report counts and intervals; do not chase a universal number.
25. **How do you compare checkpoints?** Frozen protocol, paired initial states where possible, raw counts and uncertainty, slices, latency/safety, and practical significance.
26. **A policy works in sim but not real. Now what?** Verify low-level controller, frames/units, preprocessing, calibration, timing, and real dynamics; inject measured gaps into sim before blind retraining.
27. **How do you debug a frozen robot?** Trace raw output, selected action, command publication, controller receipt and executed state; classify perception, model, interface, controller, and hardware hypotheses.
28. **What belongs in a trajectory viewer?** Synchronized video/state/actions, predicted chunks, raw and denormalized outputs, timestamps/latency, versions, interventions, and side-by-side comparisons.

#### Staff judgment

29. **Tell me about an ambiguous project.** Use problem frame, your ownership, alternatives, cheapest discriminating experiment, cross-functional decision, measured result, and remaining risk—not just the architecture.
30. **How do you mentor and set engineering practice?** Establish test/evaluation/release invariants, review designs and code, pair on debugging, create runbooks, and show that others can operate the system independently.

### Prepare two deep stories and one negative result

For each story, know the exact scale, your individual decisions, baseline, alternatives, quantitative evidence, failures, and follow-up. A negative result is valuable if you can explain the controlled comparison and how it changed the next decision. Do not invent scale or turn a course exercise into production ownership.

**Prove it:** Write one design document and one ADR for your capstone, review someone else's reproduction or design, and record answers to all thirty drills using your own artifacts. Finish a two-minute and a twenty-minute version of your strongest project story, including a negative result and the decision it changed.

<div id="chapter-19"></div>

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

# Part V — Primary sources and further study

<div id="chapter-20"></div>

## 20. Annotated source library

Read for contracts and experimental method, not for a list of names to recite. Papers report results under their own datasets, compute, tasks, and evaluation protocols; numbers across rows are usually not directly comparable. Documentation changes faster than papers, so confirm current APIs before implementing. This library and the role analysis were reviewed on 27 October 2026.

### The role and landmark VLA systems

1. **[Nidus Staff ML Engineer, VLA Training](https://jobs.ashbyhq.com/nidus-technologies/59f34e58-f867-4bdd-953f-31cb2d6dbaf6).** The sole source for the role requirements analyzed here. It does not reveal the company's internal architecture, datasets, or interview process.
2. **[RT-1: Robotics Transformer for Real-World Control at Scale](https://arxiv.org/abs/2212.06817).** Study the end-to-end real-robot learning setup, action representation, and relationship between data scale and policy evaluation.
3. **[RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control](https://arxiv.org/abs/2307.15818).** A key reference for action tokens and transfer from vision-language pretraining. Separate semantic-transfer claims from low-level control requirements.
4. **[Octo: An Open-Source Generalist Robot Policy](https://arxiv.org/abs/2405.12213).** Read the architecture and ablations, flexible task/observation interfaces, and fine-tuning methodology. The [project site](https://octo-models.github.io/) connects paper and released artifacts.
5. **[OpenVLA](https://arxiv.org/abs/2406.09246).** An open 7B VLA built from pretrained vision-language components. Useful for studying open training code, cross-embodiment demonstrations, LoRA adaptation, and deployment tradeoffs. See the [project repository](https://github.com/openvla/openvla).
6. **[π₀: A Vision-Language-Action Flow Model for General Robot Control](https://arxiv.org/abs/2410.24164).** Study the combination of a pretrained VLM and flow-matching action expert, cross-embodiment training, and high-frequency action chunks. Use its task videos and protocol to understand claims, not as your expected baseline.
7. **[PaLM-E: An Embodied Multimodal Language Model](https://arxiv.org/abs/2303.03378).** Useful for embodied multimodal representations and how continuous observations can be introduced into a language model.
8. **[Gato: A Generalist Agent](https://arxiv.org/abs/2205.06175).** A broad multi-domain sequence-modeling reference. Compare the generalist tokenization perspective with the practical action/control contracts required in robotics.

### Imitation, action representations, and generative control

9. **[DAgger: A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning](https://arxiv.org/abs/1011.0686).** The foundational reference for aggregating expert labels on learner-visited states. Focus on the distribution-shift argument and collection assumptions.
10. **[Diffusion Policy: Visuomotor Policy Learning via Action Diffusion](https://arxiv.org/abs/2303.04137).** Read the receding-horizon formulation, visual conditioning, action-sequence generation, and real/sim evaluation. The [project site](https://diffusion-policy.cs.columbia.edu/) provides accompanying material.
11. **[Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware / ACT](https://arxiv.org/abs/2304.13705).** Study action chunking, the conditional generative objective, teleoperation, and compounding-error motivation. The [ALOHA project](https://tonyzhaozh.github.io/aloha/) supplies system context.
12. **[FAST: Efficient Action Tokenization for Vision-Language-Action Models](https://arxiv.org/abs/2501.09747).** A focused reference on sequence-aware action tokenization. Compare reconstruction, token budget, and downstream policy behavior rather than assuming tokenization is lossless.
13. **[Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239).** A clear foundation for noise prediction and iterative generation. Map the image formulation carefully to action chunks and control conditioning.
14. **[Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747).** Learn the vector-field/ODE viewpoint and conditioning paths. Check endpoint and time conventions when comparing implementations.
15. **[Decision Transformer: Reinforcement Learning via Sequence Modeling](https://arxiv.org/abs/2106.01345).** Useful for trajectory sequence modeling and return conditioning; also useful for understanding why that setup differs from ordinary BC and VLAs.
16. **[Learning Latent Plans from Play / related goal-conditioned sequence work](https://arxiv.org/abs/1903.01973).** An optional branch into play data and latent plans. Treat it as further study, not a prerequisite for the seven projects.

### Robot datasets, benchmarks, and tooling

17. **[Open X-Embodiment: Robotic Learning Datasets and RT-X Models](https://arxiv.org/abs/2310.08864).** The central public reference for heterogeneous robot-data aggregation and cross-embodiment evaluation. Inspect individual dataset semantics rather than treating the aggregate as uniform.
18. **[DROID: A Large-Scale In-The-Wild Robot Manipulation Dataset](https://arxiv.org/abs/2403.12945).** Study collection diversity, metadata, real-world variation, and dataset documentation. Useful source for targeted data-engineering exercises.
19. **[BridgeData V2](https://arxiv.org/abs/2308.12952).** A public dataset for studying multi-task manipulation and transfer. Review its collection and action conventions before mixing it with other sources.
20. **[RLDS: An Ecosystem to Generate, Share and Use Datasets in Reinforcement Learning](https://arxiv.org/abs/2111.02767).** Read for standardized episode/step structure and dataset interoperability.
21. **[What Matters in Learning from Offline Human Demonstrations for Robot Manipulation](https://arxiv.org/abs/2108.03298).** The robomimic study is a practical foundation for BC experiments, demonstration datasets, and algorithm comparisons. Use the [documentation](https://robomimic.github.io/) for current formats and APIs.
22. **[LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning](https://arxiv.org/abs/2306.03310).** Useful for language-conditioned multi-task simulation and generalization suites. Keep its evaluation protocol versioned in your own work.
23. **[RLBench: The Robot Learning Benchmark and Learning Environment](https://arxiv.org/abs/1909.12271).** A broad manipulation benchmark useful for task interfaces and demonstrations; be explicit about simulator and task versions.
24. **[ManiSkill](https://arxiv.org/abs/2107.14483).** A manipulation benchmark and simulation framework for studying demonstrations and scalable simulated training/evaluation.
25. **[LeRobot](https://github.com/huggingface/lerobot).** Practical open-source tooling and dataset/policy ecosystems for accessible robot learning. APIs evolve; pin a commit and read licenses for code, models, and datasets separately.
26. **[robosuite](https://robosuite.ai/).** A modular manipulation-simulation framework. Useful for controller and environment experiments built on MuJoCo.

### Vision, language, and multimodal representations

27. **[Attention Is All You Need](https://arxiv.org/abs/1706.03762).** Revisit attention, masks, positional information, and encoder/decoder structure. These are the mechanics behind many policy backbones.
28. **[An Image Is Worth 16×16 Words / ViT](https://arxiv.org/abs/2010.11929).** The foundational patch-token ViT reference. Understand resolution, patch size, token count, and pretrained-versus-scratch behavior.
29. **[Learning Transferable Visual Models from Natural Language Supervision / CLIP](https://arxiv.org/abs/2103.00020).** A reference for contrastive vision-language representations and their strengths and limits.
30. **[Sigmoid Loss for Language Image Pre-Training / SigLIP](https://arxiv.org/abs/2303.15343).** Study the alternative contrastive loss and visual-language representation training; downstream robot performance still requires direct evaluation.
31. **[DINOv2: Learning Robust Visual Features without Supervision](https://arxiv.org/abs/2304.07193).** Useful for self-supervised visual features and evaluating whether frozen spatial representations support manipulation.
32. **[Flamingo: A Visual Language Model for Few-Shot Learning](https://arxiv.org/abs/2204.14198).** A landmark architecture for interleaved visual-language conditioning and cross-attention interfaces.

### Distributed training and numerical systems

33. **[ZeRO: Memory Optimizations toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054).** Learn optimizer, gradient, and parameter state partitioning and their communication implications.
34. **[PyTorch FSDP: Experiences on Scaling Fully Sharded Data Parallel](https://arxiv.org/abs/2304.11277).** Connect the conceptual sharding model to implementation and operational lessons. Pair with [PyTorch FSDP docs](https://docs.pytorch.org/docs/stable/fsdp.html).
35. **[Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism](https://arxiv.org/abs/1909.08053).** A foundation for tensor-parallel transformer computation and interconnect tradeoffs.
36. **[GPipe: Efficient Training of Giant Neural Networks Using Pipeline Parallelism](https://arxiv.org/abs/1811.06965).** Study pipeline stages, microbatches, and bubbles before considering pipeline parallelism.
37. **[Mixed Precision Training](https://arxiv.org/abs/1710.03740).** Understand loss scaling, master weights, accumulation, and numerical stability rather than treating autocast as a free switch.
38. **[Training Deep Nets with Sublinear Memory Cost](https://arxiv.org/abs/1604.06174).** The activation-checkpointing compute/memory tradeoff underlying many large-model recipes.
39. **[PyTorch Distributed Documentation](https://docs.pytorch.org/docs/stable/distributed.html).** Current APIs for process groups, collectives, and distributed launch/debugging. Pair concepts with small correctness tests.
40. **[NCCL User Guide](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/).** Reference for GPU collective communication and topology-sensitive behavior. It does not replace cluster scheduler and networking documentation.

### Adaptation and model efficiency

41. **[LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685).** Derive which parameters and optimizer states are saved, then test what memory remains for activations and base weights.
42. **[Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531).** A foundational distillation reference. For policies, extend the analysis from output matching to states visited and closed-loop outcomes.
43. **[Safetensors](https://huggingface.co/docs/safetensors/index).** Practical documentation for a safe tensor-serialization format. Artifact provenance, hashes, licenses, and preprocessing remain separate requirements.

### Robotics middleware and simulation

44. **[ROS 2 Documentation](https://docs.ros.org/).** Start with topics, services, actions, parameters, QoS, and launch; then learn tf2 and rosbag through the current tutorials. Pin the distribution used in your project.
45. **[MuJoCo Documentation](https://mujoco.readthedocs.io/).** Reference for models, physics, and simulation APIs. Version model assets and simulator behavior with evaluation results.
46. **[Isaac Sim Documentation](https://docs.isaacsim.omniverse.nvidia.com/).** Current platform documentation for rendering, robotics simulation, and synthetic-data workflows. Assess hardware and licensing requirements before choosing it.
47. **[Gazebo Documentation](https://gazebosim.org/docs).** Current simulation and ROS-integration guidance. Select the supported release appropriate to the robot stack.

### Experiment management and evaluation practice

48. **[Hydra](https://hydra.cc/).** Configuration composition and overrides. Always save the resolved configuration; a tool does not guarantee reproducibility by itself.
49. **[MLflow Documentation](https://mlflow.org/docs/latest/)** and **[Weights & Biases Documentation](https://docs.wandb.ai/).** Examples of experiment/artifact tracking systems. Evaluate data governance, versioning, and reproducibility needs rather than collecting dashboards for their own sake.
50. **[DVC Documentation](https://dvc.org/doc).** One approach to data and pipeline versioning. Content hashes, immutable manifests, and external storage discipline are the key ideas.
51. **[Wilson, “Probable Inference, the Law of Succession, and Statistical Inference” (1927)](https://doi.org/10.1080/01621459.1927.10502953).** Historical source for the score interval used in the lab. For clustered or paired robot evaluations, study methods that match the actual sampling design.

### A five-step paper-reading practice

For each primary source, write a one-page source card:

1. What exact problem and system boundary does the paper define?
2. What are the observation, action, data, and training contracts?
3. Which controlled comparisons support each claim, and which claims are interpretation?
4. What details of scale, hardware, evaluation, or data prevent direct comparison with your project?
5. What is the smallest experiment that would test whether the idea transfers to your setting?

Then reproduce a mechanism at small scale: an action tokenizer's reconstruction, a diffusion/flow training step, a sharding/resume property, or an evaluation protocol. Reproducing a paper's headline number is often neither feasible nor the highest-value learning objective.

**Prove it:** Choose six sources—one VLA, one action head, one dataset, one distributed-systems paper, one robotics tool, and one evaluation reference. Publish source cards and a small reproduction or design artifact for each, explicitly separating the authors' evidence from your own result.
