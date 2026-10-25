# Agent Harnesses — A Systems Textbook for Frontier-AI Interviews

*Research edition · 25 October 2026 · A Ronnie's Experiments learning sandbox*

## Contents

**Orientation**
- [0. Start with a better question](#chapter-0)

**Part I — Three perspectives to analyze a harness**
- [1. Three perspectives to analyze a harness](#chapter-1)

**Part II — Test the perspectives against evidence**
- [2. Test the perspectives against evidence](#chapter-2)

**Part III — Refine the model**
- [3. Refine the model](#chapter-3)

**Part IV — Tools, action interfaces, and context**
- [4. Tools, action interfaces, and context](#chapter-4)

**Part V — Runtime, safety, and security**
- [5. Runtime, safety, and security](#chapter-5)

**Part VI — Evaluation: the harness is in the measurement**
- [6. Evaluation: the harness is in the measurement](#chapter-6)

**Part VII — Major harnesses and open-source systems**
- [7. Major harnesses and open-source systems](#chapter-7)

**Part VIII — Connect harnesses to pretraining and post-training**
- [8. Connect harnesses to pretraining and post-training](#chapter-8)

**Part IX — A cross-lab reading of public work**
- [9. A cross-lab reading of public work](#chapter-9)

**Part X — Design a harness from first principles**
- [10. Design a harness from first principles](#chapter-10)

**Part XI — Interview preparation**
- [11. Interview preparation](#chapter-11)

**Part XII — Annotated sources and reading plan**
- [12. Annotated sources and reading plan](#chapter-12)

[Open the interactive web reader](index.html) · This single-file edition is generated as `TEXTBOOK.md` from the canonical chapters.

> **Scope and evidence.** This is an original synthesis of public papers, documentation, open-source implementations, and lab engineering posts. “Harness” has no universally accepted boundary; this book states its working definition rather than pretending the term is settled. Public descriptions do not reveal private training stacks or internal production systems. Any benchmark result is attributed to its original protocol; figures across papers are not directly comparable. The interview material is a study guide, not inside knowledge about Anthropic, Thinking Machines, or any hiring process. Snapshot date: 25 October 2026.

<div id="chapter-0"></div>

## 0. Start with a better question

“Which agent framework is best?” is almost always the wrong interview question. It confounds at least four things: the model, the interface and tools it sees, the runtime that executes its choices, and the environment in which success is measured. A system can appear smarter because it has better tools, more attempts, a hidden oracle, a cleaner benchmark adapter, a larger context, or more permissive authority. Conversely, a weak-looking model may be paired with a harness that exposes useful state and lets it recover.

The more fruitful question is: **what decision authority should be given to the model, what feedback should the system return, and what state must survive for this task to finish safely?** That question connects agent systems to model development. Pretraining creates general representations and next-token competence; supervised and preference post-training shape response and tool-use policies; reinforcement learning can optimize behavior against a reward or verifier; the harness then supplies actions, observations, constraints, and persistence at inference time. These components are not competitors. They are coupled parts of a deployed policy.

### The working definition

In this book, an **agent harness** is the runtime and surrounding design that repeatedly turns a model's proposed next action into an observation and a new decision, while governing context, execution, authority, persistence, and stopping. A wrapper that makes one model call is not necessarily a harness. A durable graph that includes model decisions may be. An evaluation harness is different: it standardizes tasks, environments, scoring, and rollouts so systems can be compared. In practice the terms overlap, so always ask which layer a speaker means.

A useful loop is:

`goal + policy + state → construct context → model decision → validate / authorize → execute → observe → update state → continue, ask, or stop`

The model may choose a tool or subgoal; the code should usually own identity, permissions, budgets, invariants, persistence, and irreversible side effects. This split is a design choice, not a law. In a fixed workflow, code owns most control flow; in an open-ended coding agent, the model chooses many next steps. Most useful systems live between those extremes.

### Why interviewers care

A frontier-model interview can move quickly from “How would you build an agent?” to “What does pretraining need to teach for this tool policy to work?”, “How do you distinguish model failure from harness failure?”, “How do you keep RL from rewarding a benchmark exploit?”, or “What evidence tells you the system is reliable across repeated runs?” A strong answer connects levels: representation and tokenization; supervised demonstrations and preference data; reward design and policy optimization; tool/API affordances; execution and safety; measurement and statistical uncertainty.

This book develops three candidate perspectives, tests them against research and code, then refines them into a practical model. It analyzes major proprietary and open implementations without treating marketing claims as controlled experiments. Every chapter ends with a specific observation that would change the argument.

**What would change my mind:** If “harness” acquired a stable, widely adopted formal definition that cleanly separated it from model, application, runtime, and evaluator, I would replace this operational definition. Until then, a declared boundary is more useful than a false consensus.

# Part I — Three perspectives to analyze a harness

<div id="chapter-1"></div>

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

# Part II — Test the perspectives against evidence

<div id="chapter-2"></div>

## 2. Test the perspectives against evidence

The early agent literature demonstrates why the loop is appealing. ReAct interleaves a model's reasoning and environment actions; Toolformer trains a model to insert API calls when they improve prediction [[R1](#ref-R1), [R2](#ref-R2)]. These works differ in where the tool policy lives: prompting and runtime at inference time versus behavior partly internalized through training. Tool use is not solely a harness feature or solely a learned capability. A usable system depends on both.

Anthropic's “Building effective agents” recommends starting with simple, composable patterns and adding autonomy when the task calls for it [[R24](#ref-R24)]. This is a sensible engineering prior, not proof that a thin loop is universally optimal. OpenAI's Agents SDK packages model calls, tools, handoffs, guardrails, sessions, and tracing; LangGraph gives developers explicit state graphs, branching, and checkpointing [[R31](#ref-R31), [R35](#ref-R35)]. They make different control choices: the former supplies a compact agent abstraction; the latter lets application code specify a graph. Either can implement a deterministic workflow or a dynamic agent.

**Counterexample:** a workflow that has a known sequence but uncertain observations may still benefit from model-driven local choices; conversely, a broad coding task may have an open-ended goal but dangerous writes that must be gate-controlled. Thus the unit of analysis is not the whole product. It is each decision boundary: classify, retrieve, act, authorize, verify, or stop.

### 6. Feedback matters; but verification is not self-evaluation

SWE-bench created a more grounded test than code-generation snippets: resolve real GitHub issues by making repository changes, then run tests [[R11](#ref-R11)]. SWE-agent showed that model-facing interface choices can affect outcomes [[R13](#ref-R13)]. OpenHands offered a broad platform with sandboxed execution, multiple agents, and benchmark adapters, helping researchers inspect the system instead of only the final score [[R14](#ref-R14)]. Together these papers support a mechanism-level claim: a task environment and its action/observation design are part of the measured system.

Yet a passing test suite is not the same as a correct product. Tests can be incomplete, stale, or visible to the agent in a way that invites overfitting. The benchmark author can leak reference information through issue text or environment. Browser automation can prove that a button was clicked, not that a user goal was met. In production, success may be a distributed and delayed outcome (a request fulfilled, a refund finalized, a customer satisfied), not a string returned by a tool.

A crucial design distinction is **generator versus verifier**. The model proposing work may also check it, but self-critique is not an independent ground truth. Verification should be as independent as practical: hold-out tests, state invariants, a separate evaluator with a rubric, or a human review of irreversible actions. Independence is a spectrum: a second LLM call that shares the same prompt, blind spots, and training distribution is not an oracle. It is still useful as a diversified check, not as proof.

### 7. State helps long horizons; state also creates new failure modes

Anthropic's long-running harness article makes failures concrete: agents may declare completion too early, fail to leave a runnable environment, make progress that is hard for a fresh session to discover, or mark features done without testing. An initializer establishes a project and artifacts; each later session makes incremental progress and records a handoff [[R27](#ref-R27)]. This is not a new memory architecture in the neural sense. It is software process design: make the durable work product and next action legible.

LangGraph's checkpointing can persist graph state, interrupt for human input, and resume. OpenHands' SDK emphasizes event-sourced state and separation of agent logic, tools, workspace, and server [[R35](#ref-R35), [R15](#ref-R15)]. These enable recovery and auditability, but persistence does not automatically ensure exactly-once external effects. If a process crashes after a bank transfer executes but before the result is committed, replay could transfer twice unless the tool/API supports idempotency or the harness reconciles authoritative state.

Memory summaries have another problem: lossy compression changes what later model decisions are conditioned on. Context engineering advice from Anthropic focuses on selecting high-signal context and using compaction, structured notes, retrieval, or subagents rather than assuming a larger window solves relevance [[R25](#ref-R25)]. This is an empirical engineering heuristic, not a universal theorem that “context rot” has one fixed threshold. Memory must be tested for omission, distortion, stale facts, and prompt injection carried across sessions.

### 8. The first thesis does not fully hold

The initial claim—three lenses explain harness performance—survives as a map, but not as a complete quality model. Evidence supports each lens: interface choices affect behavior; structured feedback enables correction; persistence supports interruption and long work. But these lenses say little by themselves about:

1. **Trust boundary:** which identities, credentials, network routes, and files can an action reach? The same tool affordance under a sandbox or with production credentials is a different risk.
2. **Resource allocation:** more calls and longer context may increase success while worsening latency and cost. Parallel trajectories need a way to select the right one.
3. **Measurement validity:** a harness benchmark can measure a model-harness-environment bundle, not the “model alone.” Different scaffolds can alter rankings.
4. **Human bandwidth:** approval and review only reduce risk if reviewers get actionable context and can actually intervene in time.
5. **Training interaction:** learned tool policies depend on action schemas, trajectory distributions, reward feedback, and inference-time constraints.

The revised claim will be narrower: the three lenses explain **where to look**; reliability, safety, economics, and validity explain **how to judge what you find**.

**What would change my mind:** If controlled ablations found that changing action interface, observation quality, or persistence never shifts outcomes once the base model is fixed, the evidence for the first three lenses would be weak. Existing work points the other way, while also showing those variables are not sufficient.

# Part III — Refine the model

<div id="chapter-3"></div>

## 3. Refine the model

A deployed agent can be modeled as a policy that acts in a partially observed environment. At step *t*, the environment has state *sₜ*; the agent receives an observation *oₜ* and context *cₜ*, samples an action *aₜ* from its policy, and the runtime executes an admissible version of that action. The environment changes and returns a new observation. The harness determines which observations are surfaced, which actions are expressible, which actions are permitted, how state is retained, and when the loop stops.

This lens gives a refined four-part model:

1. **Policy and authority:** who proposes, validates, approves, and executes an action? Name the boundary for each tool, especially irreversible or externally visible writes.
2. **Information and feedback:** what evidence is observable, at what fidelity and latency? Which signals are observations, and which are actual outcome checks?
3. **State and recovery:** which state is authoritative, durable, replayable, summarized, or disposable? What happens after timeout, process death, context exhaustion, or partial success?
4. **Budgets and evidence:** what are the limits on tokens, calls, time, concurrency, and human review, and what experiment demonstrates the system meets its target?

The first three are the candidate perspectives; the fourth is the meta-perspective that lets us test whether the design works at all. Safety and security are not a “fifth component”: they are invariants applied across all four. A permission boundary is authority; audit logs are state and evidence; injection resistance is information integrity; a review threshold is budget and governance.

### A reliability calculation: the compounding trap

If a task needs *n* sequential actions and each action succeeds independently with probability *p*, then an optimistic estimate of all-actions success is *pⁿ*. At *p* = 0.98 across 50 actions, this is about 36.4%; at 0.995 it is about 77.8%. The independence assumption is usually false—errors cluster, actions differ in difficulty, and retries may be dependent—so this is an intuition pump, not a real prediction. But it explains why a strong one-step tool-call benchmark can coexist with disappointing long-horizon completion.

A verifier, retry, or human handoff changes this calculation only if it catches failures early enough and the recovery action is effective. Re-running the same stochastic plan without new information may simply repeat the same failure. The correct metric is not “number of retries”; it is probability of reaching a verified goal under a cost, latency, and risk budget.

### The causal question: model or harness?

Represent performance as *Y = f(M, H, E, T, B)* where *M* is model, *H* harness configuration, *E* environment, *T* task, and *B* budget. A single score cannot identify these factors. For causal attribution, hold as much fixed as possible; factorially vary model and harness; run multiple seeds; report environment and budget; inspect per-task outcomes and traces. If a better harness changes success at fixed model, that is a harness effect under that evaluation. It does not establish that the new harness generalizes, nor that the model is unchanged in behavior across interfaces.

### 10. The mechanism stack from pretraining to deployment

**Pretraining** optimizes next-token prediction over a data distribution. It gives broad language, code, world, and latent procedural patterns; it does not guarantee a model will reliably emit a valid tool call, obey a schema, recover from an API error, or satisfy a business invariant. Tool calls represented as structured tokens or text require a tokenizer/model interface and runtime that agree on serialization.

**Supervised fine-tuning (SFT)** can teach desired forms: choose a tool, emit arguments, incorporate results, and stop. But imitation learns only from the data distribution. If demonstrations omit timeouts, partial failures, malicious tool output, or ambiguity, the policy may not handle them. AgentTuning's hybrid instruction tuning is one published example of combining agent interaction trajectories with general instructions to improve agent capability while preserving broader behavior [[R8](#ref-R8)]. The point is methodological, not that one dataset recipe solves generalization.

**Preference optimization and RL** change behavior against comparisons or rewards. DPO trains from preference pairs without the classic separate reward-model-plus-PPO pipeline [[R6](#ref-R6)]. RLHF includes a learned reward model and policy optimization; RLAIF uses AI-generated critiques or preferences (Anthropic's Constitutional AI is a notable method) [[R5](#ref-R5)]. RL with verifiable rewards (RLVR) can optimize outcomes such as tests or exact answers when the verifier is valid. Tool use makes the action space sequential: rewards can depend on tool choices, environment state, interaction cost, and successful completion, not only final text. A sparse terminal reward can make credit assignment hard; a dense proxy can be gamed.

**Inference-time harnessing** shapes a model's effective policy without changing weights: context, tools, routing, permissions, retries, search breadth, and stopping rules. Harness behavior can mimic a capability increase, but only within a particular affordance and evaluation. If post-training was done with a particular tool schema, swapping to an awkward interface creates distribution shift. Conversely, a runtime can make a capability accessible that the model already had but could not reliably express unaided.

### Three coupled loops

- **Training loop:** collect tasks/trajectories → optimize policy → evaluate holdouts → revise data/reward/model.
- **Agent loop:** construct context → propose action → enforce policy → act → observe → verify/continue.
- **Engineering loop:** run evals → inspect failures → change model, tools, prompts, environment, or evaluator → rerun controlled comparisons.

A mature team keeps their artifacts separate enough to know what changed, but connected enough that failure analysis can improve training, runtime, and task design. A harness is also an experimental apparatus: it shapes what behavior can be expressed and what behavior gets measured.

**What would change my mind:** If model-only changes reliably predicted deployed performance across new tool interfaces, environments, budgets, and repeated runs, with negligible scaffold interaction, the coupled-policy view would be overstated. Current benchmark and system studies caution against that simplification.

# Part IV — Tools, action interfaces, and context

<div id="chapter-4"></div>

## 4. Tools, action interfaces, and context

A tool definition is not just an API declaration. It changes the model's available actions, their granularity, and the feedback it sees. A good tool has a precise name, a narrow responsibility, a schema that expresses real constraints, actionable errors, bounded outputs, predictable side effects, and documented authority. Too many overlapping tools burden selection; overly broad tools make actions difficult to constrain and audit.

SWE-agent's ACI demonstrates a strong design principle: build interfaces for the actual agent, not merely expose the same shell a human uses [[R13](#ref-R13)]. A human can use tacit knowledge, visual affordances, and rapid local correction; a language model may benefit from bounded file views, summarized search, explicit edit commands, and concise observation of the effect. ACI design is not equivalent to hiding power. It is selecting an action vocabulary with a useful ratio of capability to legibility.

### The tool call lifecycle

`proposed → parsed → schema-validated → policy-checked → authorized → executed → normalized → recorded → returned`

Failure can occur at every transition. Malformed JSON is not an environment error. A denied permission is not a model failure. A tool timeout after a side effect is not necessarily a safe retry. Preserve these distinctions in typed error results. Include a stable operation ID, execution status, and whether the operation is known to be idempotent. Do not return raw stack traces, secrets, or huge unfiltered payloads to the model.

### Idempotency and side effects

For read-only tools, retries are usually safe. For writes, define idempotency keys, conditional updates, transaction boundaries, and reconciliation. An external service can commit while the client times out. The harness should represent “outcome unknown” as distinct from “did not happen” and query authoritative state before trying again. This reliability property belongs to the tool contract plus environment—not to prompt wording.

### MCP and interoperability

The Model Context Protocol (MCP) standardizes a client/server mechanism for exposing tools, resources, and prompts [[R36](#ref-R36)]. It lowers integration cost and encourages composability. It does not itself establish tool trust, authorization policy, data provenance, safe execution, or semantic correctness. A connected server is a new trust boundary. Treat discovery metadata and returned content as untrusted; scope credentials and capabilities; review each server's side effects. Standard transport is not standardized safety.

### 12. Context engineering as a per-step allocation problem

For each model call, the harness chooses a context from system/developer instructions, user goal, tool schemas, conversation history, retrieved evidence, memory, environment observations, and intermediate artifacts. The relevant optimization is not “maximize tokens.” It is “include the smallest sufficient set of high-value information for this decision, with enough provenance to act correctly.” More context can help by supplying evidence; it can hurt through distraction, contradiction, stale instruction, and attention competition.

Anthropic's published context-engineering guidance discusses just-in-time retrieval, compaction, structured notes, tools, and subagents for long-horizon work [[R25](#ref-R25)]. The exact mechanisms are product-dependent; the general design questions are portable:

- **Now vs. later:** include direct evidence needed for the next action; keep references to large re-fetchable artifacts rather than their full contents.
- **Source and trust:** label user instructions, tool results, retrieved documents, and agent-generated notes distinctly. Untrusted data should not become system policy merely because it was summarized into memory.
- **Freshness:** attach timestamps/version IDs; revalidate changing facts before consequential actions.
- **Compression:** test summaries for exact constraints, decisions, unresolved risks, and provenance. A summary is lossy, so critical facts should remain structured and machine-checkable.
- **Progressive disclosure:** stable top-level maps can point to detailed docs or skills loaded only when needed. Tool definitions themselves consume context and can be deferred or filtered.

### Memory is not one thing

Working context is the current inference input. Episodic history records what happened. Semantic memory stores extracted facts. Procedural memory stores reusable methods. External state (a repo, database, or task ledger) holds actual work. Each needs distinct ownership, update rules, provenance, retention, and access control. Agent-authored memory is vulnerable to fabrication, poisoning, and instruction laundering; retrieval should not silently upgrade its authority.

**What would change my mind:** If controlled studies showed that tool granularity, schema quality, error surfaces, and context selection have no effect once model weights are fixed, the interface-and-context perspective would lose practical significance. SWE-agent's ablations and long-context engineering experience argue that these factors matter, while leaving their best designs task-dependent.

# Part V — Runtime, safety, and security

<div id="chapter-5"></div>

## 5. Runtime, safety, and security

If a model can read files, run shell commands, browse websites, send messages, or modify customer data, the harness is an authority boundary. Model intent is not an authorization decision. A safe system assumes the policy may be mistaken, the prompt may be attacked, tool output may be malicious, and a process may fail halfway through an operation.

Use least privilege per task: read-only before write; project-scoped file access; short-lived credentials; allowlisted network egress; no production secrets in untrusted execution; explicit approval for high-impact actions; audit logs that capture actor, proposed action, policy decision, target, result, and correlation ID. A container is one isolation primitive, not a complete security proof. Shared kernels, mounted host files, network access, persistent volumes, and exposed credentials can all defeat the intended boundary.

### Threat model for tool-using models

- **Prompt injection:** untrusted documents, webpages, or tool results contain instructions to override policy or exfiltrate data. Treat them as data, preserve provenance, and authorize at the runtime boundary rather than trusting model interpretation alone.
- **Confused deputy:** the agent has credentials or permissions broader than the user's request. Bind capabilities to user, task, target, and time.
- **Exfiltration:** a model can move sensitive context through a permitted output channel or network-enabled tool. Use data minimization, egress controls, and content-aware review where appropriate.
- **Unsafe action / repetition:** an action is destructive, non-idempotent, or repeated after timeout. Use staged writes, dry-run, idempotency keys, confirmation, and reconciliation.
- **State poisoning:** false or hostile content is persisted into memory, repo guidance, or a future session. Separate trusted policy from agent notes; make writes reviewable and attributable.
- **Resource exhaustion:** tool loops, enormous context, or recursive delegation consume unbounded tokens, compute, or money. Enforce per-run budgets and depth/concurrency limits outside the model.

### Human-in-the-loop is a protocol

An approval prompt is useful only if the person sees a concise description of the action, target, impact, evidence, and a meaningful deny/edit option. Approval must bind to the exact action payload, not a broad task that later mutates. Define expiry, escalation, and behavior on no response. Measure approval latency and override rate; if every request is rubber-stamped, the control may be theater.

Frameworks expose different safety surfaces. OpenAI's Agents SDK includes guardrails, handoffs, and tracing primitives [[R31](#ref-R31)]. The Claude Agent SDK (formerly Claude Code SDK in public materials) exposes a programmable coding-agent loop and permission/hook mechanisms, while Claude Managed Agents describes separation of harness, session, and sandbox [[R30](#ref-R30), [R29](#ref-R29)]. OpenHands emphasizes isolated workspaces and extensible execution [[R14](#ref-R14), [R15](#ref-R15)]. These are capabilities and design affordances, not proof of an application's security posture. Teams still need threat modeling and operational testing.

**What would change my mind:** If tool-use agents could be made robustly safe by model behavior alone, without runtime authority limits, identity binding, or recovery controls, I would demote the harness's security role. Public guidance from labs and standard security engineering suggest layered controls remain necessary.

# Part VI — Evaluation: the harness is in the measurement

<div id="chapter-6"></div>

## 6. Evaluation: the harness is in the measurement

A benchmark score belongs to a **model × harness × environment × task set × budget × evaluator** configuration. “Model X scored 70%” is incomplete unless you know the scaffold, tools, context, number of attempts, stop rule, model sampling parameters, environment version, and grading method. The scaffold is not nuisance noise; it can change the action space and the amount of inference compute.

SWE-bench evaluates patch-based resolution of real repository issues; SWE-bench Verified curates a subset with human validation [[R11](#ref-R11), [R12](#ref-R12)]. WebArena provides realistic self-hosted websites and end-to-end tasks for browser agents [[R16](#ref-R16)]. τ-bench emphasizes tool-agent-user interaction under domain policies and repeated-run consistency [[R17](#ref-R17)]. AgentBench spans multiple interactive environments [[R18](#ref-R18)]. Each captures different capabilities; none is “general intelligence” or a complete production evaluation.

### The harness confound

If comparing two models, lock the harness where possible. If comparing two harnesses, hold model and environment fixed. To estimate interactions, test a model-by-harness matrix. Ensure each system has comparable token, wall-clock, tool-call, and retry budgets. Report pass@1 and pass@k separately; pass@k rewards search and more compute. Repeat stochastic tasks, report uncertainty, and preserve trajectories. Avoid test-set tuning and benchmark leakage. Independent reproduction is more valuable than a spectacular but unaudited leaderboard score.

The 2026 position paper “Stop Comparing LLM Agents Without Disclosing the Harness” argues that scaffold variation can materially alter benchmark conclusions [[R22](#ref-R22)]. Treat its measured differences as evidence from the paper's setup, not a universal numerical law. The conceptual lesson is stronger than any particular score: model rankings can be scaffold-dependent, so benchmark reports should expose the scaffold.

### Outcome, process, and reliability metrics

- **Task success:** verified end state, not agent assertion.
- **Consistency:** success over repeated runs; pass^k or variance, with care about task stochasticity.
- **Robustness:** behavior under paraphrase, environment perturbations, missing tools, and injected failures.
- **Predictability:** calibrated estimates of completion, time, cost, and failure modes.
- **Safety:** policy violations, unauthorized side effects, sensitive-data leakage, and unsafe recoveries.
- **Efficiency:** cost per verified success, wall-clock latency, tool calls, tokens, compute, and human minutes.
- **Partial progress:** useful for long tasks, but must not substitute for completion when the deployment requires completion.

Reliability is not the same as mean accuracy. A system with 80% average success and rare catastrophic writes may be less acceptable than a slower 70% system with clean abstention and easy recovery. Repeated runs reveal variance hidden by a one-shot leaderboard. Harness evaluation should also include fault injection: tool timeout, malformed response, stale observation, permission denial, process restart, duplicate request, and evaluator failure.

### Verifiers are part of the test fixture

Unit tests and exact answer checkers are attractive because they scale. But they can be gamed or incomplete, and their presence during execution may leak the target. Separate what the agent sees from what the evaluator sees. Validate that tests actually discriminate correct and incorrect states. For subjective outputs, use blinded expert comparisons and report inter-rater agreement. For process-heavy tasks, retain traces and audit representative failures.

**What would change my mind:** If repeated controlled evaluations showed model rankings to be invariant across reasonable harnesses, budgets, and task environments, there would be little need to report scaffold details. Existing papers and benchmark structures give reasons to expect non-invariance.

# Part VII — Major harnesses and open-source systems

<div id="chapter-7"></div>

## 7. Major harnesses and open-source systems

A framework table ages quickly and usually hides the design choice. The more durable comparison is **who owns control flow, where state lives, what the execution environment is, what is open, and what evidence is available**. Product names also cover different layers: an SDK is not a hosted runtime; a CLI is not a benchmark; an evaluation harness is not the agent used in production.

### Anthropic: Claude Code / Agent SDK / Managed Agents

Claude Code is a user-facing coding agent. Anthropic's Agent SDK exposes the loop and tools programmatically; the exact model and API surface evolves, so inspect current docs rather than rely on static feature claims. Anthropic's public engineering guidance emphasizes simple composable patterns, effective tool design, context selection, and long-running work across context windows [[R24](#ref-R24), [R27](#ref-R27), [R25](#ref-R25)]. Its Managed Agents article describes three decoupled primitives—session, harness, and sandbox—so execution can survive container replacement and implementation components can be swapped [[R29](#ref-R29)]. This is a useful systems boundary: the “brain” proposes; the harness routes and controls; the workspace executes; the session records.

Interview reading: how control passes through a tool call; what context compaction preserves; why an initializer/coding-agent split helps long jobs; how permissions and hooks mediate access; what is public guidance versus product-specific detail. Do not infer the training stack from SDK design.

### OpenAI: Agents SDK and Codex

The OpenAI Agents SDK packages agent/runner loops, tools, handoffs, guardrails, sessions, and tracing [[R31](#ref-R31)]. Codex is a coding agent and its public repository/runtime surface exposes agent work to clients. OpenAI's “Harness engineering” case study reports an internal agent-first software-development process that made the repository, architecture, UI, logs, metrics, and tests more legible to Codex [[R32](#ref-R32)]. This is a field report and company-reported outcome, not a controlled scientific study of productivity. “Unlocking the Codex harness” describes the App Server as a protocol and long-lived process that translates client requests into core-thread operations and streams events [[R33](#ref-R33)]. This highlights a second axis: the harness is also a stable interface between agent runtime and multiple user experiences.

Interview reading: why legibility and feedback loops can raise throughput; what human QA bottleneck remains; how protocol events, approvals, cancellation, and session state should be represented; why generated code volume is not outcome quality.

### LangGraph / LangChain

LangGraph is a stateful graph runtime: developers represent nodes, edges, conditional transitions, state, and checkpoints. This gives explicit control and durable execution, but shifts responsibility for good decomposition, retries, idempotence, and context design to the application author [[R35](#ref-R35)]. It is a useful counterweight to a model-directed loop: if compliance or reproducibility requires known transitions, the graph can express them directly. A graph need not mean a workflow with no model autonomy; individual nodes may contain dynamic agents.

### OpenHands

OpenHands (formerly OpenDevin) is both an open platform and a research/engineering ecosystem for software agents. Its ICLR 2025 paper presents a platform with agent implementations, sandbox interaction, human/agent communication, and benchmark integrations [[R14](#ref-R14)]. The later Software Agent SDK paper describes event-sourced state, typed action/execution/observation contracts, workspaces, security/confirmation, and separation into composable components [[R15](#ref-R15)]. It is one of the clearest open references for examining an end-to-end software agent stack rather than a minimal loop.

### SWE-agent and mini-SWE-agent

SWE-agent's main intellectual contribution is not a monolithic framework but the ACI design question: make repository actions legible and effective for a language model [[R13](#ref-R13)]. It helped establish the idea that tool interface quality is an experimental variable. Minimal agents such as mini-SWE-agent are valuable baselines because a small scaffold makes attribution easier; small does not mean weak, and complex does not mean better.

### Aider, smolagents, Inspect and related projects

Aider is an open-source pair-programming CLI centered on repository-aware editing and git workflows [[R37](#ref-R37)]. Hugging Face smolagents emphasizes a small agent library, including code-oriented action generation [[R38](#ref-R38)]. UK AI Security Institute's Inspect AI is primarily an evaluation framework: tasks, solvers, scorers, transcripts, and sandboxing make it useful for reproducible agent assessments [[R21](#ref-R21)]. These projects are important because the ecosystem includes tools for building agents and tools for measuring them; they are not the same product category.

### Other major open-source ecosystems

**CrewAI** offers role/task-oriented “Crews” alongside more explicit event-driven “Flows” [R45](#ref-R45). It is useful to compare a high-level collaboration abstraction with graph/runtime approaches: roles can improve task framing, but do not by themselves guarantee independent expertise, correct delegation, or verification. **Google ADK** is a code-first toolkit for building, evaluating, and deploying agents, with agent and workflow abstractions and an evolving session/event API [R46](#ref-R46). Its rapid version changes make release-pinned comparisons essential. **Microsoft Agent Framework** targets agent and workflow orchestration across Python and .NET, with graph-like sequential/concurrent/handoff patterns, middleware, and migration paths from AutoGen and Semantic Kernel [R47](#ref-R47). **PydanticAI** emphasizes typed agent inputs/dependencies, model/provider flexibility, and validated structured outputs [R48](#ref-R48); typed contracts improve integration but do not provide durable execution or safe effects automatically. These four help round out the field, but should be selected by the actual control, persistence, sandbox, and evaluation needs—not popularity or framework abstraction alone.

### How to choose

- **Need a fixed, auditable process?** Use deterministic workflow code/graph, with model calls at bounded decision points.
- **Need an open-ended software agent?** Compare Claude Code/SDK, Codex, OpenHands, SWE-agent, and a minimal baseline on your own tasks, with equal budget and environment.
- **Need durable pause/resume?** Evaluate checkpoint semantics, event history, and external side-effect recovery—not just “memory” claims.
- **Need provider/model experimentation?** Favor explicit provider adapters and lock harness settings for comparison; validate tool-call format and streaming edge cases for every model.
- **Need safety?** Select on isolation, capability scope, secrets, network controls, approval binding, and trace auditability—not framework name.
- **Need scientific evaluation?** Separate agent runtime from evaluator; use Inspect or a purpose-built benchmark with fixed environments and external verification.

The best first prototype is often small enough that you can read every transition. Add abstractions when they remove a measured failure or operational burden.

**What would change my mind:** If feature parity and performance data across standardized tasks made a single ecosystem dominant for workflow, coding, research, and regulated tasks alike, this “choose by operating model” recommendation would be less useful. Current systems embody materially different control, state, and environment choices.

# Part VIII — Connect harnesses to pretraining and post-training

<div id="chapter-8"></div>

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

# Part IX — A cross-lab reading of public work

<div id="chapter-9"></div>

## 9. A cross-lab reading of public work

Read Anthropic's public material as a sequence of engineering questions, not a complete blueprint. “Building effective agents” distinguishes fixed workflows from model-directed agents and recommends starting with the simplest sufficient pattern [[R24](#ref-R24)]. “Effective context engineering” asks how to curate system instructions, tools, history, and retrieved information across multiple turns [[R25](#ref-R25)]. “Writing effective tools for agents” frames tool development as prototype → evaluate → improve and emphasizes realistic evaluations of tool use [[R26](#ref-R26)]. “Effective harnesses for long-running agents” tackles cross-window handoff with an initializer and incremental coding sessions [[R27](#ref-R27)]. “Harness design for long-running application development” reports a planner/generator/evaluator approach for application tasks [[R28](#ref-R28)]. “Scaling Managed Agents” separates session, harness, and sandbox [[R29](#ref-R29)].

**Four observations:** (1) capability is expressed through the model-context-tool interaction, not prompt wording alone; (2) context is an actively managed resource; (3) long tasks need explicit progress and completion contracts; (4) runtime control and execution environment should be separable. The update from two-agent to planner/generator/evaluator is evidence that harnesses evolve in response to model limitations and task requirements; it is not a reason to impose three agents everywhere.

**Interview connection:** discuss how an initializer could produce a testable feature contract; how a fresh evaluator prevents the generator from marking itself done; when reusing context is better than resetting; and which limits must remain code-enforced. Ask how better post-training might eliminate some scaffolding—and what policy guarantees still belong in the runtime.

### 20. OpenAI: legible environments, client protocols, and agent-first engineering

OpenAI's 2026 harness-engineering writeup reports building an internal product with agents and describes repository guidance, CI, architecture constraints, direct UI validation, logs, metrics, traces, and agent-readable documentation [[R32](#ref-R32)]. The compelling conceptual claim is that engineering effort shifts toward making requirements and feedback legible to an agent. The quantitative productivity claims are company-reported and not a randomized comparison; treat them as case-study evidence.

The Codex App Server post presents a stable event/protocol layer connecting clients to long-running agent threads [[R33](#ref-R33)]. That approach highlights product-level concerns often absent from the “LLM + while loop” diagram: streaming updates, approval requests, cancellation, thread IDs, multiple clients, and UI consistency. The harness is both the runtime and an API surface for humans and software clients.

**Interview connection:** distinguish code-structure tests from behavior tests; explain why direct UI and telemetry access can turn QA into feedback available to agents; identify the human-review bottleneck; challenge LOC/PR throughput as incomplete value metrics; and propose guardrails against self-review loops converging on shared mistakes.

### 21. Thinking Machines: interaction design and training systems

Thinking Machines' public work is not primarily a published agent-harness framework. Its most useful connection is between training and interaction. Tinker exposes flexible post-training primitives [[R39](#ref-R39)]. On-policy distillation uses student rollouts as the state distribution for teacher supervision [[R40](#ref-R40)]. The interaction-models essay argues for models that can communicate in richer, more continuous ways, reducing dependence on brittle external turn-detection scaffolding in certain voice/multimodal settings [[R43](#ref-R43)]. This is a provocative hypothesis about moving capability from wrapper logic into learned interaction behavior; it is not evidence that all harnesses should disappear.

The important tension: external harnesses provide explicit, inspectable control and safety boundaries; learned interaction models may reduce latency and awkward turn-taking by internalizing capabilities. A system can combine both: model-native turn-taking and multimodal understanding, with external authorization, state, and emergency stop controls. Inference design and post-training data determine which behaviors are intrinsic versus runtime-managed.

**Interview connection:** explain how on-policy data changes the distribution of training states; why teacher targets on student trajectories may improve robustness; how to evaluate full fine-tuning versus LoRA without only checking task reward; and which real-time interaction behaviors should be learned versus enforced by software.

### 22. Synthesis: what the public record supports—and what it does not

Across Anthropic, OpenAI, and Thinking Machines public sources, the recurring agenda is not simply “build more agents.” It is to improve the interface between model and world: context assembly, tool action contracts, persistent state, observability, training data, and richer human interaction. The labs foreground different emphases in public material, but those emphases are not exclusive and do not reveal private implementation details.

The strongest synthesis is **co-design**. The model should be trained to make useful, calibrated decisions in the interface it will encounter; the harness should express capabilities and limits clearly; the environment should return honest observations; independent evaluators should check outcomes; and failure traces should feed a controlled improvement process. More model competence can simplify the harness, but should not silently erase security, transaction, or accountability boundaries.

**What would change my mind:** If public evidence showed that a single lab's documented harness architecture dominated across all modalities, tasks, risk regimes, and training setups, I would present it as the central reference. The public record instead shows several different layers and evolving solutions.

# Part X — Design a harness from first principles

<div id="chapter-10"></div>

## 10. Design a harness from first principles

### Step 1 — Define outcomes, not agent vibes
Write a user-level completion condition and a machine-checkable condition where possible. Separate required work, forbidden work, and uncertain cases. Specify what counts as safe abstention. A feature is not done because the model says “done.”

### Step 2 — Choose the autonomy boundary
List each decision in the task. Which are deterministic? Which require language judgment? Which are risky? Route the predictable parts through ordinary code; give the model bounded choices where uncertainty benefits from language reasoning; require approval or hard gates for consequential side effects.

### Step 3 — Design the environment and action surface
Make task-relevant state observable and actions recoverable. Prefer typed, narrow tools with clear errors. Use sandboxed copies or staging for writes. Ensure the agent can run the same tests humans use. Minimize tool overlap and disclose tool capability and side effects explicitly.

### Step 4 — Specify state ownership and recovery
For every state item, name its authority: model context, event log, filesystem, database, or user. Define checkpoints, versioning, idempotence, replay, expiry, and deletion. On crash, know whether the last action happened. Make a new session able to find the work without trusting an unverified prose summary.

### Step 5 — Add context management
Decide what is always included, retrieved on demand, summarized, or omitted. Keep trusted policy separate from untrusted data. Version context templates and tool schemas so evaluations can reproduce them. Avoid editing tools or instructions mid-run unless the change is itself part of the experiment.

### Step 6 — Set budgets and stopping rules
Budget model calls, tokens, wall-clock, tool calls, delegation depth, concurrency, and human attention. Stop on verified completion, explicit user clarification, budget exhaustion, or a safety condition. An agent should not continue indefinitely because “one more retry” feels cheap.

### Step 7 — Build a baseline evaluation before optimizing
Include successful and failing cases, ambiguous goals, tool failures, permissions, adversarial inputs, and long-horizon tasks. Pin environment images and task versions. Record complete event traces, exact prompts and schemas, model identifiers, randomness settings, budgets, and evaluator version. Use both task-level and system-level metrics.

### Step 8 — Improve by failure class
Tag failures: perception/context miss; bad plan; wrong tool selection; schema/serialization error; environment or infrastructure error; unsafe action; invalid verifier; premature stop; recovery failure; budget overshoot. Fix the layer that caused the error. Do not turn every failure into a larger system prompt.

### Step 9 — Run controlled ablations
At fixed model, change one harness component: tool count, schema, context strategy, retry logic, evaluator, or memory. Then test model × harness interactions and out-of-distribution tasks. Compare against a simpler baseline and matched test-time compute. Preserve the old config so “improvements” can be reverted.

### Step 10 — Stage deployment and observe outcomes
Start in shadow/read-only mode; graduate to reversible writes; use narrow cohorts and explicit approvals before widening. Track cost per verified success, user corrections, unsafe near misses, recovery rate, drift, latency, and policy overrides. Provide kill switches and a conventional fallback.

### 24. A worked example: customer support refund agent

**Goal:** resolve eligible refund requests under a written policy, with user confirmation for amounts above a threshold. **State:** order ledger is authoritative; policy version and evidence IDs are recorded; conversation summary is not authority. **Tools:** lookup order (read), calculate eligibility (pure function), draft refund (staged write), commit refund (idempotent write), message customer (external side effect). **Control:** the model can clarify, gather evidence, and draft; deterministic code enforces eligibility and caps; a human approves exceptions; the runtime binds approval to a specific order, amount, and reason. **Feedback:** tool results return structured status and transaction IDs; after commit, the system re-reads the ledger to verify state. **Recovery:** if commit times out, query by idempotency key before retry. **Evaluation:** holdout scenario suite plus repeated runs, adversarial policy injection, wrong customer IDs, stale policy version, and timeout after commit. **Metrics:** verified resolution, policy violations, duplicate refunds, escalation quality, cost and time per case, human override rate.

The model may be excellent at empathic language and still be unsafe to authorize. This is exactly why the design separates learned judgment from enforceable policy and transactional truth.

### 25. Common interview mistakes

- “Use multiple agents” without explaining what independent information or parallelism they add.
- “Add memory” without naming source of truth, freshness, privacy, or poisoning protections.
- “Use a bigger context window” instead of analyzing signal-to-noise and retrieval.
- “Add retries” without idempotence, new evidence, or budget accounting.
- “Use RL” without specifying trajectory data, reward/verifier validity, exploration cost, and holdout generalization.
- “The model will ask permission” when the runtime can enforce approval deterministically.
- Quoting a benchmark without its scaffold, budget, environment, variance, and evaluator.
- Treating a successful demo as a reliability estimate.

**What would change my mind:** If a single generic agent loop with no explicit task contract, permission model, or evaluation suite consistently met production requirements across risk regimes, this design sequence would be unnecessary overhead. That is not a safe assumption for current systems.

# Part XI — Interview preparation

<div id="chapter-11"></div>

## 11. Interview preparation

> I use harness to mean the runtime around a model that turns proposed actions into bounded, observable interactions: it constructs context, exposes tools, validates and authorizes calls, executes them, persists state, and decides whether to continue or stop. I analyze it through control allocation, feedback quality, and state/recovery, then judge it with budgets and evidence. The harness and model are coupled: post-training teaches policies for an action distribution, while the runtime defines the actual action space and safety boundary. To compare systems, I hold model, environment, and compute budget fixed where possible and report repeated, independently verified outcomes. I would not assume the most autonomous or elaborate framework is best; I would choose the least complex architecture that meets the reliability and risk target.

That answer is deliberately falsifiable and leaves room for task specifics. It is better than “an LLM with tools” because it names the execution and governance responsibilities.

### 27. Twenty-four questions with answer sketches

### Definitions and architecture

1. **What belongs in a harness?** Model-loop orchestration, context assembly, tool interfaces, policy gates, state, recovery, stopping and instrumentation. Declare the boundary; SDK/framework/runtime are not synonyms.
2. **Workflow or agent?** Choose workflow for predictable transitions and strong auditability; model-directed loop for unknown branching with informative feedback. Hybridize by decision boundary.
3. **Where should control live?** Model proposes semantic decisions; code enforces permissions, budgets, identity, invariants, and irreversible transaction semantics; humans handle unresolved high-impact judgment.
4. **Why not one giant system prompt?** Context competes for attention, becomes stale, and cannot enforce a hard invariant. Use concise policy, progressive disclosure, structured state, and runtime checks.
5. **When use subagents?** When tasks decompose, have low shared-state needs, and parallel work is worth coordination/context cost. Measure whether they improve verified quality at equal budget.
6. **What is the difference between tool calling and an agent?** A model can emit one tool call; an agent system loops over observations toward a goal. The boundary is dynamic control, not the presence of an API call.

### Evaluation and reliability

7. **How do you compare two models?** Same tasks, harness, environment, tools, prompt, and matched budget; repeated runs; confidence intervals; per-task analysis; then a separate model×harness interaction study.
8. **How do you measure long-horizon reliability?** Repeated end-to-end runs with independent state checks, pass^k or completion distribution, fault injection, recovery, cost/time, and safety outcomes—not just average pass rate.
9. **How do you distinguish model from harness failure?** Classify trace and intervention; keep a minimal baseline; vary one component at a time; replay deterministic parts; run factorial comparisons. Ambiguous causality should be reported.
10. **Why is self-critique insufficient?** Shared generator/evaluator blind spots and reward hacking. Use independent tests/state checks or a separately prompted/modelled evaluator; still audit evaluator errors.
11. **What makes a benchmark invalid?** Leakage, stale or incomplete tasks, unequal budgets, unstable environments, exploitable graders, or scaffold-dependent rankings. Pin versions and report the full system.
12. **How do you estimate whether retrying helps?** Condition on failure class; estimate conditional recovery probability and incremental cost/risk. Retry only when it can add information or change state; ensure idempotence.

### Post-training and model research

13. **How does pretraining relate to agents?** It learns broad capabilities and patterns, not guaranteed action validity or policy compliance. Token/schema design and runtime affordances condition expression.
14. **What does SFT on trajectories buy?** Demonstrated tool-selection and recovery behavior. Risks: teacher bias, narrow tool distribution, brittle scripts, imitation of invalid rationales. Test held-out tools/tasks.
15. **What is the harness-training feedback loop?** Harness shapes trajectories; evaluation identifies weaknesses; curated traces or preferences train behavior; new policies change interaction distribution. Version each stage to avoid confounding.
16. **RLVR versus preference learning?** RLVR optimizes against a checker when correctness can be verified; preference learning captures comparative quality/policy when no exact oracle exists. Both inherit reward/label limitations.
17. **Why on-policy distillation?** Teacher supervises states sampled by the student, reducing exposure mismatch to student-visited trajectories. Need test teacher quality, token-level objective, generalization, and cost against baselines.
18. **How can post-training regress general ability?** Narrow objective/data can shift behavior or cause forgetting. Mix general data, use parameter-efficient methods where suitable, and measure broad holdouts, not only target task.

### Security and operations

19. **Prompt injection defense?** Assume text from web/files/tools is untrusted; preserve provenance, minimize exposure, separate policy from data, scope credentials, enforce action permissions in code, monitor egress.
20. **How should a payment tool work?** Strongly typed and scoped, staged/dry-run, idempotent, transaction ID returned, separate approval bound to exact payload, post-commit state verification.
21. **What does sandboxing guarantee?** Only the properties actually configured and tested. Check kernel/host isolation, mounts, network, secrets, process limits, persistence, and teardown.
22. **How to handle crash during a write?** Represent uncertainty; query authoritative state via idempotency key; do not blindly repeat; resume from a durable event/checkpoint after reconciliation.
23. **What should observability capture?** Task/run/config IDs, model and prompt versions, tool schema, context provenance, proposed calls, policy decisions, executions, verifier results, token/cost, latency, and user overrides, with data minimization.
24. **How do you decide whether to automate?** Compare expected quality, risk, and cost to human baseline; choose autonomy tier by impact and reversibility; pilot in shadow/read-only; use escalation and fallback.

### 28. Anthropic- and Thinking Machines-oriented study prompts

These prompts refer only to public work. For Anthropic, practice reading the sequence: workflow/agent patterns → context engineering → tool design → long-running harnesses → managed agent interfaces. For Thinking Machines, focus on Tinker, post-training method design, on-policy distillation, LoRA tradeoffs, and the public argument for richer interaction models. Do not claim to know private systems.

For either lab, prepare a compact research discussion:

1. State the paper/blog's specific claim and evidence, separating controlled result from author interpretation.
2. Name a competing explanation and a falsifying ablation.
3. Explain how training distribution and inference harness interact.
4. Identify cost, data, and evaluation constraints.
5. Propose an experiment with a clean holdout, a baseline, uncertainty, and a safety plan.
6. Say what result would change your mind.

**What would change my mind:** If expert interview rubrics consistently rewarded framework trivia over causal reasoning, experimental design, training-data understanding, and safety boundaries, the preparation strategy should change. Technical interviews at research labs may emphasize specific subfields, but the ability to reason from evidence is broadly transferable.

# Part XII — Annotated sources and reading plan

<div id="chapter-12"></div>

## 12. Annotated sources and reading plan

<span id="ref-R1"></span>
- [R1] **ReAct: Synergizing Reasoning and Acting in Language Models** — Yao et al., ICLR 2023. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629). Read the trajectory format and the interaction between reasoning and environment observation; early template for the modern loop.
<span id="ref-R2"></span>
- [R2] **Toolformer: Language Models Can Teach Themselves to Use Tools** — Schick et al., NeurIPS 2023. [arXiv:2302.04761](https://arxiv.org/abs/2302.04761). Self-supervised API call insertion and selection; compare policy learned into weights with runtime-supplied tools.
<span id="ref-R3"></span>
- [R3] **WebGPT: Browser-assisted question-answering with human feedback** — Nakano et al., 2021. [arXiv:2112.09332](https://arxiv.org/abs/2112.09332). Browser interaction, demonstrations, comparisons, and reward modeling.
<span id="ref-R4"></span>
- [R4] **Training language models to follow instructions with human feedback (InstructGPT)** — Ouyang et al., NeurIPS 2022. [arXiv:2203.02155](https://arxiv.org/abs/2203.02155). The canonical SFT → preference model → PPO pipeline and alignment tradeoffs.
<span id="ref-R5"></span>
- [R5] **Constitutional AI: Harmlessness from AI Feedback** — Bai et al., 2022. [arXiv:2212.08073](https://arxiv.org/abs/2212.08073). Critique/revision and AI-generated preference data; inspect what is and is not established.
<span id="ref-R6"></span>
- [R6] **Direct Preference Optimization: Your Language Model is Secretly a Reward Model** — Rafailov et al., NeurIPS 2023. [arXiv:2305.18290](https://arxiv.org/abs/2305.18290). Preference optimization without explicit reward-model RL pipeline.
<span id="ref-R7"></span>
- [R7] **DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models** — Shao et al., 2024. [arXiv:2402.03300](https://arxiv.org/abs/2402.03300). GRPO formulation and verifiable-reward context; do not generalize math results automatically to open-world agents.
<span id="ref-R8"></span>
- [R8] **AgentTuning: Enabling Generalized Agent Abilities for LLMs** — Zeng et al., Findings of ACL 2024. [ACL Anthology](https://aclanthology.org/2024.findings-acl.181/). Hybrid training on agent trajectories and general instruction data.
<span id="ref-R9"></span>
- [R9] **Tool-R1: Sample-Efficient Reinforcement Learning for Agentic Tool Use** — 2025. [arXiv:2509.12867](https://arxiv.org/abs/2509.12867). An example of GRPO-style post-training for multi-step tool use; inspect task and verifier limits.
<span id="ref-R10"></span>
- [R10] **The Landscape of Agentic Reinforcement Learning for LLMs: A Survey** — 2025. [arXiv:2509.02547](https://arxiv.org/abs/2509.02547). Broad map of agentic-RL tasks, methods, and evaluation issues.

### 30. Benchmarks and empirical agent systems

<span id="ref-R11"></span>
- [R11] **SWE-bench: Can Language Models Resolve Real-World GitHub Issues?** — Jimenez et al., ICLR 2024. [arXiv:2310.06770](https://arxiv.org/abs/2310.06770). Real repo issue resolution and test-based grading.
<span id="ref-R12"></span>
- [R12] **SWE-bench Verified** — OpenAI, 2024. [announcement](https://openai.com/index/introducing-swe-bench-verified/). Curated subset and human validation; not a blanket guarantee of benchmark validity.
<span id="ref-R13"></span>
- [R13] **SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering** — Yang et al., NeurIPS 2024. [arXiv:2405.15793](https://arxiv.org/abs/2405.15793). ACI design and interface ablations; central source for agent-facing tools.
<span id="ref-R14"></span>
- [R14] **OpenHands: An Open Platform for AI Software Developers as Generalist Agents** — Wang et al., ICLR 2025. [arXiv:2407.16741](https://arxiv.org/abs/2407.16741). Open platform architecture, sandboxing, multiple agents, and benchmark suite.
<span id="ref-R15"></span>
- [R15] **The OpenHands Software Agent SDK: A Composable and Extensible Foundation for Production Agents** — 2025. [arXiv:2511.03690](https://arxiv.org/abs/2511.03690). Event-sourced state, typed action/execution/observation, and production components. Preprint; distinguish design claims from validated results.
<span id="ref-R16"></span>
- [R16] **WebArena: A Realistic Web Environment for Building Autonomous Agents** — Zhou et al., ICLR 2024. [arXiv:2307.13854](https://arxiv.org/abs/2307.13854). Self-hosted realistic web tasks and end-to-end evaluation.
<span id="ref-R17"></span>
- [R17] **τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains** — Yao et al., 2024. [arXiv:2406.12045](https://arxiv.org/abs/2406.12045). User simulation, APIs, policy following, and repeated-run consistency.
<span id="ref-R18"></span>
- [R18] **AgentBench: Evaluating LLMs as Agents** — Liu et al., ICLR 2024. [arXiv:2308.03688](https://arxiv.org/abs/2308.03688). Multi-environment interactive evaluation.
<span id="ref-R19"></span>
- [R19] **The Agent Company: Benchmarking LLM Agents on Consequential Real World Tasks** — 2024. [arXiv:2412.14161](https://arxiv.org/abs/2412.14161). Multi-step workplace tasks and environment interaction.
<span id="ref-R20"></span>
- [R20] **SWE-EVO: Benchmarking Coding Agents in Long-Horizon Software Evolution Scenarios** — 2025. [arXiv:2512.18470](https://arxiv.org/abs/2512.18470). Long-horizon evolution highlights gap between issue fix and sustained maintenance; preprint results are protocol-specific.
<span id="ref-R21"></span>
- [R21] **Inspect AI** — UK AI Security Institute. [GitHub](https://github.com/UKGovernmentBEIS/inspect_ai). Open evaluation framework with tasks, solvers, scorers, transcripts, and sandbox support.
<span id="ref-R22"></span>
- [R22] **Stop Comparing LLM Agents Without Disclosing the Harness** — 2026. [arXiv:2605.23950](https://arxiv.org/abs/2605.23950). Position paper on scaffold confounding; use the methodological argument, examine its experiments and scope.
<span id="ref-R23"></span>
- [R23] **Efficient Benchmarking of AI Agents** — 2026. [arXiv:2603.23749](https://arxiv.org/abs/2603.23749). Task-subset selection and rank preservation under scaffold shift.

### 31. Lab engineering posts and framework implementations

<span id="ref-R24"></span>
- [R24] **Anthropic — Building effective agents** — [research/engineering post](https://www.anthropic.com/research/building-effective-agents). Workflow patterns and when to use model-directed agents; post itself notes the ecosystem changes.
<span id="ref-R25"></span>
- [R25] **Anthropic — Effective context engineering for AI agents** — [engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). Context selection, retrieval, compaction, notes, and multi-agent patterns.
<span id="ref-R26"></span>
- [R26] **Anthropic — Writing effective tools for agents** — [engineering](https://www.anthropic.com/engineering/writing-tools-for-agents). Tool prototyping and evaluation methodology.
<span id="ref-R27"></span>
- [R27] **Anthropic — Effective harnesses for long-running agents** — [engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents). Initializer/coding agents and durable handoff artifacts.
<span id="ref-R28"></span>
- [R28] **Anthropic — Harness design for long-running application development** — [engineering](https://www.anthropic.com/engineering/harness-design-long-running-apps). Planner/generator/evaluator case study; note its scope and model-specific observations.
<span id="ref-R29"></span>
- [R29] **Anthropic — Scaling Managed Agents: Decoupling the brain from the hands** — [engineering](https://www.anthropic.com/engineering/managed-agents). Session, harness, sandbox boundaries and stable interfaces.
<span id="ref-R30"></span>
- [R30] **Anthropic Claude Agent SDK** — [Python repository](https://github.com/anthropics/claude-agent-sdk-python) · [TypeScript repository](https://github.com/anthropics/claude-agent-sdk-typescript). Inspect current docs and permission hooks; software surfaces change quickly.
<span id="ref-R31"></span>
- [R31] **OpenAI Agents SDK** — [Python repository](https://github.com/openai/openai-agents-python) · [docs](https://openai.github.io/openai-agents-python/). Agent/runner, tools, handoffs, guardrails, sessions, tracing.
<span id="ref-R32"></span>
- [R32] **OpenAI Harness engineering: leveraging Codex in an agent-first world** — [engineering post](https://openai.com/index/harness-engineering/). Company-reported agent-first development case study; primary source for its own claims.
<span id="ref-R33"></span>
- [R33] **OpenAI Unlocking the Codex harness: how we built the App Server** — [engineering post](https://openai.com/index/unlocking-the-codex-harness/). Client protocol, event stream, long-lived process, core threads.
<span id="ref-R34"></span>
- [R34] **OpenAI Codex CLI** — [GitHub](https://github.com/openai/codex). Open-source coding agent runtime; inspect source and license at time of use.
<span id="ref-R35"></span>
- [R35] **LangGraph** — [GitHub](https://github.com/langchain-ai/langgraph) · [conceptual docs](https://docs.langchain.com/oss/python/langgraph/overview). Stateful graph orchestration, checkpointing, interrupts, and resumability.
<span id="ref-R36"></span>
- [R36] **Model Context Protocol specification** — [spec](https://modelcontextprotocol.io/specification/2025-06-18). Tool/resource interoperability protocol; not a trust or authorization model.
<span id="ref-R37"></span>
- [R37] **Aider** — [GitHub](https://github.com/Aider-AI/aider). Open-source coding assistant with repository and git-centered workflow.
<span id="ref-R38"></span>
- [R38] **Hugging Face smolagents** — [GitHub](https://github.com/huggingface/smolagents). Minimal agent framework with code-agent patterns.

<span id="ref-R45"></span>
- [R45] **CrewAI** — [GitHub](https://github.com/crewAIInc/crewAI). Open-source framework with role/task-oriented Crews and event-driven Flows; inspect the live repository for current API and feature scope.
<span id="ref-R46"></span>
- [R46] **Google Agent Development Kit (ADK)** — [GitHub](https://github.com/google/adk-python). Code-first framework for building, evaluating, and deploying agents; version-sensitive APIs, so pin the evaluated release.
<span id="ref-R47"></span>
- [R47] **Microsoft Agent Framework** — [GitHub](https://github.com/microsoft/agent-framework). Open-source agent and workflow framework with Python/.NET support and migration paths from AutoGen and Semantic Kernel.
<span id="ref-R48"></span>
- [R48] **PydanticAI** — [GitHub](https://github.com/pydantic/pydantic-ai). Typed, provider-flexible agent loop and structured-output validation; do not confuse type correctness with policy correctness.

### 32. Thinking Machines Lab: post-training, inference, interaction

<span id="ref-R39"></span>
- [R39] **Announcing Tinker** — Thinking Machines Lab, 2025. [post](https://thinkingmachines.ai/blog/announcing-tinker/). Flexible fine-tuning API and cookbook orientation.
<span id="ref-R40"></span>
- [R40] **On-policy distillation** — Thinking Machines Lab, 2025. [post](https://thinkingmachines.ai/blog/on-policy-distillation/). Student-generated state distribution and teacher supervision; reproduce the recipe before generalizing.
<span id="ref-R41"></span>
- [R41] **LoRA Without Regret** — Thinking Machines Lab, 2025. [post](https://thinkingmachines.ai/blog/lora/). Empirical low-regret regime for PEFT versus full fine-tuning.
<span id="ref-R42"></span>
- [R42] **Defeating Nondeterminism in LLM Inference** — Thinking Machines Lab, 2025. [post](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/). Inference reproducibility as a prerequisite for meaningful experiments.
<span id="ref-R43"></span>
- [R43] **Interaction Models: A Scalable Approach to Human-AI Collaboration** — Thinking Machines Lab, 2026. [post](https://thinkingmachines.ai/blog/interaction-models/). Public argument for more native, continuous multimodal interaction and reduced reliance on wrapper heuristics in some settings.
<span id="ref-R44"></span>
- [R44] **The Future Worth Building Is Human** — Thinking Machines Lab, 2026. [post](https://thinkingmachines.ai/blog/the-future-worth-building-is-human/). Lab's public framing of human judgment, model customization, and interaction.

### 33. Further reading order

**First weekend:** ReAct → Toolformer → SWE-agent → OpenHands → Anthropic effective agents → Anthropic context engineering. **Then evaluation:** SWE-bench → WebArena → τ-bench → scaffold-comparison position paper → Inspect AI. **Then model training:** InstructGPT → DPO → Constitutional AI → AgentTuning → GRPO/Tool-R1 → Thinking Machines on-policy distillation. **Then code:** read one implementation end-to-end (LangGraph for explicit transitions, OpenHands for platform boundaries, or Codex/Claude tooling for coding-agent execution). For each paper, write the task, intervention, baseline, metric, and strongest caveat in five lines.

**What would change my mind:** If primary sources available by the snapshot date materially changed the taxonomy or demonstrated a better-supported framework, this reading list should be updated. Treat it as a curated starting library, not exhaustive coverage; verify versions and claims from original sources before interviews.
