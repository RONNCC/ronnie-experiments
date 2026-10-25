# Part X — Design a harness from first principles

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
