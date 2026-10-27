# VLA Staff Engineer — From Pixels to Reliable Robot Action

*Project-based fieldbook · 27 October 2026 · An independent Ronnie's Experiments learning sandbox*

[Open the interactive web reader](index.html) · This single-file edition is generated as `TEXTBOOK.md` from the canonical chapters.

> **Scope.** This fieldbook teaches the technical system around vision-language-action (VLA) models and turns the public [Nidus Staff ML Engineer, VLA Training posting](https://jobs.ashbyhq.com/nidus-technologies/59f34e58-f867-4bdd-953f-31cb2d6dbaf6) into a sequence of portfolio builds. It is not affiliated with Nidus, does not describe its private stack, and cannot promise an interview, a staff title, or five years of professional impact. Role requirements can change; this analysis is a snapshot dated 27 October 2026. Research numbers belong to their original evaluation protocols, not to your future project.

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
