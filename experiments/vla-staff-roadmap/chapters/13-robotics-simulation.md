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
