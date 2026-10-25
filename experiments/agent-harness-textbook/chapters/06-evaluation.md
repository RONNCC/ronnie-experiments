# Part VI — Evaluation: the harness is in the measurement

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
