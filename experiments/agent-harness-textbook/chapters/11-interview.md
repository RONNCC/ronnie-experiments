# Part XI — Interview preparation

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
