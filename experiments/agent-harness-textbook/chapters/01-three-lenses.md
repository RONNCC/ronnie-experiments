# Part I — Three perspectives to analyze a harness

## 1. Three perspectives to analyze a harness

Ask **who decides what happens next?** The model, deterministic code, a human, an external workflow engine, or an environment policy? “Agentic” is not a binary property: control can be allocated per decision. Code may pick the permitted tool set, the model may select a tool and arguments, code may validate the schema, a human may approve a payment, and a verifier may decide whether the task is complete.

The control axis captures a critical trade-off. Model-directed control handles unknown paths and ambiguous goals; explicit code paths are easier to test, reason about, and constrain. The Anthropic distinction between workflows (predefined paths) and agents (model-directed process) is useful as a pair of endpoints, not a complete taxonomy [[R24](#ref-R24)]. A ReAct trajectory makes the alternation visible: reasoning, action, observation, next reasoning [[R1](#ref-R1)]. But a production loop must add mechanics omitted from the paper abstraction: cancellation, timeouts, retry policy, duplicate actions, permission checks, and durable state.

**Prediction:** if the task path is predictable, explicitly coded transitions will beat a free-form agent on consistency and cost. If meaningful branches cannot be anticipated and observations are informative, model-directed decisions can be more adaptable. **Failure mode:** using “agent” as a synonym for “good,” or putting a model in charge of a choice that is deterministic policy.

### 2. Perspective B: feedback and observability

Ask **what can the model or system observe that lets it notice and correct error?** A tool can return a truthful, scoped observation, or a vague “success.” Tests, browser state, database diffs, typed errors, logs, and user confirmation are different feedback channels. The harness's action-observation interface shapes the policy's reachable behavior, much as a robot's sensors and actuators define its effective environment.

This perspective treats tool design as agent UX. SWE-agent's Agent-Computer Interface (ACI) is a central case: a compact set of repository navigation, file-editing, and execution actions was designed for language-model use, and the paper's ablations reported that interface design materially changed resolution rates versus a shell-only baseline [[R13](#ref-R13)]. OpenHands generalizes the idea into an event/action/observation platform with sandboxed execution and multiple agent implementations [[R14](#ref-R14)]. These are not merely “tools around a model”: they define the granularity of actions, the information available per step, and which errors are legible.

**Prediction:** improving the information quality and recoverability of observations can improve task completion without changing weights. **Failure mode:** confusing trace visibility with correctness. A perfect transcript does not make a bad verifier good; an agent can observe its own mistaken assumption in great detail.

### 3. Perspective C: state and time horizon

Ask **what must remain true or retrievable after one model call, one context window, one process crash, or one human handoff?** There are several different states: the transient prompt; the message/event history; external artifacts such as files and commits; business state in an authoritative database; and learned parameters. “Memory” should not blur these categories. Context can be summarized, but a payment ledger should not be reconstructed from a summary.

Anthropic's long-running-agent guidance uses an initializer and later coding sessions, with durable artifacts such as a progress log, feature list, setup script, and git history bridging context windows [[R27](#ref-R27)]. LangGraph exposes checkpoints and resumable graph state as a runtime primitive [[R35](#ref-R35)]. Event-sourced systems such as the OpenHands SDK distinguish an append-only event history from the current state derived from those events [[R15](#ref-R15)]. All address persistence, but they imply different replay and correction semantics.

**Prediction:** for work that outlives a context window, explicit handoff artifacts and resumable state reduce repeated discovery and premature completion. **Failure mode:** calling every external note “memory,” without an owner, freshness rule, provenance, or deletion policy.

### 4. A first synthesis — and what each perspective leaves out

The three perspectives are deliberately not three competing architectures. They are diagnostic questions. **Control** identifies who is allowed to choose; **feedback** identifies how choices meet reality; **state** identifies what survives. Together they suggest a loop: allocate authority, provide informative observations, retain only the state required for the next decision, then repeat under a stopping rule.

But the first version is incomplete. It does not distinguish capability from reliability, observation from evaluation, or safe execution from mere execution. It ignores resource budgets and the human's capacity to inspect outcomes. Most dangerously, it suggests that “more feedback” is always good. A noisy, manipulable, or delayed reward can teach the wrong behavior; too much low-signal context can hurt. Likewise, durable state can preserve corrupted assumptions as efficiently as correct ones.

So the question for the next chapters is not whether the three perspectives are elegant. It is whether they predict observed system behavior under controlled comparison, and what the counterexamples require us to add.

**What would change my mind:** A robust set of experiments showing that control allocation, feedback quality, and state lifetime do not explain measurable differences in agent success, reliability, cost, or safety across realistic tasks would invalidate this framing.
