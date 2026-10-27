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
