# Part VIII — Connect harnesses to pretraining and post-training

## 8. Connect harnesses to pretraining and post-training

A pretrained transformer learns statistical structure by predicting tokens. Large-scale exposure to code, APIs, documentation, and interaction traces can produce latent competence: syntactic patterns, common tool conventions, debugging heuristics, and world knowledge. But this objective does not directly require secure authorization, calibrated abstention, valid arguments under a strict schema, or reliable task completion. The model can predict a plausible tool call that is semantically wrong.

The interface matters at the token level. Tool schemas and serialized observations become part of model input; tool-call tokens or JSON structures become part of output. Tokenization, constrained decoding, special tokens, and parser recovery change the effective action policy. At pretraining scale, corpus composition and deduplication influence what patterns are available; at serving time, the harness determines which of those latent patterns can be exercised.

### 17. SFT and preference training: teach the policy, inspect the distribution

SFT on demonstrations can teach the model to choose tools, format arguments, react to observations, and finish. Demonstration quality matters more than raw quantity when trajectories contain wrong calls or reward shortcuts. Include negative and recovery cases: unavailable tool, timeout, invalid state, user clarification, denied action, and “no tool needed.” Preserve diversity so the model does not overfit to one tool order or one stereotyped plan.

Preference data teaches comparative judgments: which response is more helpful, honest, safe, or policy-compliant. DPO gives a direct objective over preferred/rejected pairs [[R6](#ref-R6)]; RLHF optimizes a reward model and policy; RLAIF uses AI feedback and can scale critiques, but inherits judge bias [[R5](#ref-R5)]. For tool agents, preference examples need to capture full trajectories and outcomes, not just polished final messages. A friendly answer after a failed side effect is not a successful trajectory.

A common pitfall is label leakage and outcome ambiguity. If annotators see a pass/fail signal that rewards a superficial test, the trained policy may optimize that proxy. If an evaluation transcript is also used as training data, the benchmark is no longer held out. Maintain data lineage, task-level splits, and contamination checks.

### 18. RL, verifiers, and the environment as training substrate

Reinforcement learning can optimize multi-step actions against environment feedback. RLVR makes this tractable where there is a trustworthy checker: math answers, code tests, structured state transitions, or exact protocol compliance. For real tasks, environment and verifier design become part of the training method. Reward can include completion quality, safety, cost, and user constraints—but every scalarized tradeoff risks hiding a bad outcome behind an aggregate.

Tool learning expands RL's action space and brings delayed consequences. A trajectory includes language tokens, structured calls, tool observations, environment transitions, and perhaps human intervention. The training system must assign credit and mask/score the right token spans. If tool outputs are nondeterministic, the same action can yield different rewards. If the environment is simplified, the learned policy may exploit simulator shortcuts. If retries are free in training but expensive in production, the policy will overuse them.

Trajectory collection also feeds model improvement. Successful and failed traces can inform SFT, preference comparisons, reward models, and tool redesign. But trace mining raises privacy/security concerns, and a model-generated rationale should not be mistaken for a faithful causal explanation. Record observable state transitions, tool inputs/outputs, policy decisions, and external verification separately from generated text.

### Thinking Machines Lab: training infrastructure as research leverage

Thinking Machines' public Tinker announcement describes low-level training primitives such as sampling and forward/backward passes, with a cookbook of post-training methods [[R39](#ref-R39)]. Its on-policy distillation post shows a student generating its own trajectories and learning from a stronger teacher on those student-state trajectories; the article argues this can be more data/compute-efficient than a particular RL setup, under its experiments [[R40](#ref-R40)]. The core idea matters for harness research: the student should be trained on states it actually visits, not only idealized teacher trajectories. Tinker is infrastructure; the distillation result is a method; neither should be conflated with a claim about a deployed agent runtime.

Thinking Machines' LoRA analysis discusses conditions under which low-rank adaptation can perform similarly to full fine-tuning in post-training regimes [[R41](#ref-R41)]. This is relevant to agent harnesses because tool behavior, formatting, or domain specialization may be updated cheaply—but narrow adaptation can also cause forgetting or overfit. Test general capabilities and unseen tools, not only the tuned benchmark.

### Interview-level summary

- **Pretraining** supplies broad priors and language/action patterns.
- **SFT** teaches demonstrated behavior and formats.
- **Preference training** shapes comparative quality and policy.
- **RL/RLVR** optimizes sequential behavior against feedback.
- **Harnessing** makes actions executable and bounded at inference.
- **Evaluation** tests the coupled system and informs all earlier stages.

Ask: What behavior is learned, what is enforced, what is merely prompted, and what is externally verified? That is more revealing than asking whether an agent is “trained” or “untrained.”

**What would change my mind:** If adding realistic trajectory training and environment-grounded reward never improved tool behavior beyond a prompt-only baseline under held-out tasks, the training/harness coupling would be less important. Toolformer, AgentTuning, and later agentic-RL work motivate the question but do not settle every domain.
