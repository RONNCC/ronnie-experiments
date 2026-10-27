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
