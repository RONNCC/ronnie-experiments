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
