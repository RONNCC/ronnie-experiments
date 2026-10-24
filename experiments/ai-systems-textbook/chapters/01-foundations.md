# Part I — Foundations: requirements, models, and mechanism choice

## 1. Problem framing and system invariants

A requirements conversation should establish the *unit of value* before naming components. “Build an agent to answer policy questions” could mean a search assistant for employees, an autonomous policy exception adjudicator, or a high-volume customer support surface. Those have different failure costs. Translate the request into **actors → observations → authorized transitions → evidence of completion**.

### Define success at the task boundary

Write both a product metric and a safety constraint. For an order assistant: “Of eligible authenticated address-change requests, ≥90% reach a confirmed order-service state change or an accurate handoff” is an example *target*, not a measured fact. “Zero writes to a different tenant in pre-production adversarial tests” is a necessary test target but cannot prove zero real-world incidents. Track a separate wrong-action rate in production. Specify denominator, time window, exclusions, and baseline: containment (“no human was contacted”) can improve while actual resolution worsens.

Separate **answer quality** (correct, supported, useful) from **world-state quality** (order row updated, customer notified). In multi-step work, verify *postconditions*, not the model's intention or the presence of a `tool_use` event. A receipt ID, version, and confirmation query are stronger evidence than assistant text. Prefer a measured handoff over a fabricated resolution.

### Requirements as invariants

Safety properties must hold in every execution: `tenant(response) = tenant(authenticated_request)`; `refund.amount <= policy_limit` for the policy in force; `action.approval_id` must reference a valid approval for the *same* immutable action payload. Liveness properties say that valid work eventually finishes or fails visibly: an accepted job reaches `COMPLETED | REJECTED | ESCALATED` within its deadline. An invariant needs an enforcement point (authorization middleware, database row-level isolation, transactional precondition), not merely a natural-language aspiration.

**Time matters.** A policy can change between retrieval and action. Attach `policy_version` and `source_valid_at` to decisions; recheck volatile preconditions immediately before a write. Different products require different consistency levels: a help article may tolerate a minutes-old cache; account balances and shipping cutoffs should consult the authoritative service at action time.

### Budget from the outside in

Partition the end-to-end latency budget. If a text response must show a useful first token within 1.5 s at p95, decide what can run concurrently (authentication and low-cost intent detection?), what must be serialized (permissioned retrieval before final answer), and what is optional (a later deep explanation). Do **not** add p95 stage latencies and call that an end-to-end p95: correlated stages and queuing require tracing complete requests under load.

```text
request → auth → routing → permissioned retrieval → model prefill → first token
                                              ↘ tool calls → validation → committed outcome
```

Load needs units. State the daily sessions, busiest-hour fraction, calls per session, mean service time, peak requests/s, provider token/min caps, and concurrency. Little's law gives a first approximation `average in-flight = arrival rate × mean time in system` under stable conditions. It does not predict tail latency when utilization nears capacity. Include traffic spikes and a shedding policy (e.g., preserve authenticated support actions, degrade optional summaries).

### Data contracts are requirements too

For each input list its owner, sensitivity, freshness, provenance, and deletion obligation. A document corpus may be tenant-scoped, licensed, and versioned. Conversations can include PII; store the minimum required state, encrypt and redact where appropriate, and make retention configurable. Decide whether third-party model processing and logs comply with your data agreement; do not infer that a provider feature automatically satisfies regulatory requirements.

### Five questions to ask before whiteboarding

1. Which user journey is in scope, and what exact external postcondition is “done”?
2. What must the assistant *never* do, even if every model and tool is compromised?
3. Which sources are authoritative, and how old can each be?
4. What is the busiest credible traffic interval and the action/latency/cost budget?
5. Who labels failures and approves a risky or ambiguous case?

If an interviewer or product owner cannot answer, state **explicit assumptions** and design a modular seam to change them. Do not fill gaps with invented company details.

## 2. Model mechanics and the inference budget

A foundation language model represents a conditional distribution over next tokens. For an input/context `x` and output tokens `y1...yn`, generation approximately factorizes as `P(y | x) = Π_i P(yi | x, y<i)`. This is a predictive mechanism, not a database lookup or a calibrated truth meter. Training usually includes large-scale pretraining followed by instruction and preference-oriented post-training; the exact procedure differs by model. At inference time it does not automatically know the state of an order service or whether a tool result is trustworthy.

### Decoding, uncertainty, and verification

Sampling temperature rescales token logits before softmax: `p_i(T) ∝ exp(logit_i / T)` for `T > 0`. Lower temperature can reduce output variation; it cannot make a wrong answer true or guarantee identical outputs across versions and serving configurations. Token probabilities are not automatically calibrated probabilities that an *action* is correct. Use domain-specific uncertainty signals (retrieval coverage, conflicting evidence, missing required fields, validator failures, model disagreement when useful) and calibrate on labeled cases. An abstention policy can trade coverage for lower error among accepted tasks; always measure both.

A model can emit well-formed JSON and still fabricate an order ID. Schema-constrained generation limits *syntax*; application validation must prove semantics, authorization, and current state. Distinguish `parseable`, `valid according to schema`, `authorized`, `successful`, and `reconciled` as five separate states. The [structured-outputs docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) describe schema-constrained API behavior; feature combinations and limits vary by provider and version. In particular, some citation and strict JSON-output modes are incompatible on a given API; design a separate evidence object or consult the current docs rather than assuming both work simultaneously ([citation docs](https://platform.claude.com/docs/en/build-with-claude/citations)).

### Prefill, decode, and memory

Inference has a **prefill** phase (processing input tokens, including retrieved documents and tools) and a **decode** phase (autoregressive output). Dense self-attention naively considers pairs of positions in the context during prefill; optimized kernels and serving implementations affect actual cost. A KV cache stores intermediate key/value tensors so decoding need not recompute all previous tokens, but the cache consumes memory roughly proportional to retained sequence length × layers × KV width × bytes (times two for keys and values; architecture-specific details matter). Consequences:

- A long retrieved document may increase prefill latency and cost without helping accuracy; context capacity is not the same as effective use. The *Lost in the Middle* study demonstrated sensitivity to evidence position on its tasks ([paper](https://arxiv.org/abs/2307.03172)); evaluate on **your** tasks and models.
- Large outputs increase decode time; asking for shorter, structured artifacts may reduce cost more than shaving 100 input tokens.
- Dynamic batching improves throughput but waiting to form a batch can harm interactive p95 latency. A voice turn and an offline report want different queues.
- A cache hit on a stable prompt prefix can reduce repeated prefill work; it does not remove output generation or make stale context safe. Cache identity/tenant/policy boundaries and inspect actual usage counters ([prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)).

**Token budget example (illustrative):** a 16k-token application budget might reserve 2k for stable instructions/tool schemas, 3k for recent conversation, 4k for permissioned evidence, 2k for intermediate tool results, 2k for output, and 3k of headroom. Those allocations must be checked with actual token counts and provider limits; they are not model capabilities. Prioritize authoritative evidence, record what was dropped, and never truncate a policy mid-rule silently. For long sessions, summarize *verified facts and unresolved tasks* into a versioned memory record; keep links to original evidence. A summary is lossy and untrusted if produced from attacker-influenced content.

### What tuning can and cannot replace

| Method | Strong fit | Weak fit / risk |
|---|---|---|
| Prompt + examples | Quick behavior changes, routing, extraction | Fragile if rules conflict; version and eval it. |
| Retrieval / tool read | Current private facts, provenance, policy documents | Bad permissions, stale indexing, and poor recall can defeat it. |
| Supervised fine-tuning (SFT) | Stable format, domain style, repeated behavior with quality labels | Does not update rapidly changing facts; can overfit label noise. |
| Preference optimization (e.g., DPO) | Comparing better/worse outputs with reliable preference data | Optimizes the provided preferences, not an unmeasured safety requirement. |
| Specialized classifier or rules | Narrow, measurable routing or policy gate | Distribution shift and blind spots require monitoring. |
| Larger model / more reasoning | Tasks whose evals show meaningful quality gain | May add cost and latency; still needs authorization and verification. |

An embedding maps text to vectors for candidate retrieval; it is not a guarantee of exact-match recall. A cross-encoder/reranker scores a query and candidate jointly, usually later in a smaller candidate set. Model routing should follow **measured per-task** quality/cost/latency, not “small for easy, big for hard” without labels. Public descriptions of task-specific multi-model agent design provide one example ([Sierra](https://sierra.ai/blog/constellation-of-models)); the blueprints below are independent teaching designs, not claims about that system.

**Model selection protocol.** Build a frozen labeled set across task classes, record success and high-severity failures, compare model/prompt combinations on identical inputs (paired comparison), repeat stochastic runs when variance matters, and compute all-in cost including retries and tools. Keep holdout cases private from prompt iteration. Only route to a cheaper model when the lower-cost path meets per-segment quality and safety constraints; use an escalation path for ambiguous cases.

### Tool calls are continuations, not magic

A typical tool cycle is: application sends messages and scoped tool schemas → model proposes a typed tool call → application validates schema and principal/policy → tool executes → result returned as *untrusted observation* → model or workflow continues. A proposed tool name or argument is no more trusted than any other model output. Parse partial streams carefully: a streamed tool argument is not a valid request until the provider marks it complete and the application validates it. Provider streaming may include event-stream errors after HTTP success ([streaming docs](https://platform.claude.com/docs/en/build-with-claude/streaming)).

## 3. Choose the weakest adequate mechanism

Many designs over-assign agency because “agent” sounds general. Mechanisms form a practical escalation ladder, **not** a universal ranking of intelligence:

| Mechanism | Example | Prefer when | Test first | Main failure |
|---|---|---|---|---|
| Deterministic code / SQL | Verify date is before shipping cutoff | Rule is stable, expressible, auditable | Boundary and property tests | Rule omits a real exception. |
| Conventional ML / optimizer | Predict risk; solve a schedule | Labels/objective exist and consistency matters | Calibration / held-out data / feasibility | Shift, leakage, bad objective. |
| Search + fixed template | Return canonical policy passage | Evidence is sufficient and answer form is constrained | Recall/permissions/staleness | Missing or wrongly ranked evidence. |
| One model call + validation | Summarize ticket into a typed draft | Bounded language judgment needed | Field-level quality + validator | Plausible incorrect fields. |
| Explicit workflow with model steps | Gather facts → draft → verify → approve | Known stages and dependencies | Transition tests | Unhandled state/failure. |
| Bounded tool-using agent | Research unknown repo paths | Path cannot be enumerated cheaply | Trajectory + outcome evals | Loops, exfiltration, side effects. |
| Human decision | Money movement, incident containment | Harm is high or authority unavailable | Reviewer quality/queue health | Fatigue, bottleneck, rubber-stamping. |

**A worked selection.** A port disruption assistant needs to schedule berths. Constraints such as berth size, tide window, and safety rules belong in a solver/validator. A model can parse a messy email into *proposed facts*, ask about missing dimensions, and explain why a feasible schedule changed. It should not replace constraint checking with “reasoning harder.” When operations permit a new schedule, a controller records approvals and dispatches versioned instructions. Ch. 19 develops this.

### A decision-theoretic view

Let `V` be value of a correct autonomous resolution, `H` harm of a wrong action, `C` computation/tool cost, `p` measured probability of correct resolution on the **relevant segment**, and `q` measured chance that a harmful mistake escapes downstream controls. A crude option score is `p·V − q·H − C − review_cost`. The formula forces clarity about stakes; it is not a safe automatic policy because tail harm and uncertain `p,q` may dominate. Use hard constraints for forbidden actions, then optimize within allowed choices. When evidence is missing, asking a question or handing off is an *outcome*, not necessarily a failure.

### Composition costs and agent loops

If a task requires 10 independent steps, each succeeding 98% of the time, naive end-to-end success is `0.98^10 ≈ 81.7%`. Real errors are not independent: shared bad evidence can fail all steps, or a validator can repair some. The example shows why a “98% tool accuracy” claim is not enough. Measure the whole trajectory, especially policy adherence and final external state. An agent's loop needs maximum steps, token/time/tool budgets, a stop condition, and a specific behavior for insufficient progress. Repeated self-critique by the *same* model can recycle an error; use external checks where possible.

**Parallelism only where independent.** You can retrieve three independent sources concurrently. Do not execute “charge card” and “verify account owner” in parallel. Multi-agent fan-out adds coordination tokens, conflicting conclusions, and more attack surface; reserve it for genuinely separable breadth-first work and reconcile results with a typed contract. [Building effective agents](https://www.anthropic.com/research/building-effective-agents) distinguishes prescribed workflows from agents that choose their own steps; use the distinction to justify architecture, not as a product label.

### Counterfactual design review

For every proposed model component ask: *If the model fails silently, what component notices? If it cannot notice, can we remove that failure mode by moving the decision into code or requiring approval?* Conversely, for every brittle rule ask: *What real-world variance will break this?* The goal is neither “LLM everywhere” nor “LLM nowhere”; it is explicit allocation of ambiguity.

## 4. APIs and the software substrate

A model-backed feature is a distributed application. The same obligations apply as in payments or search: identity, schemas, error handling, timeouts, rate limits, idempotency, concurrency control, observability, deployment, and rollback.

### Request path and contracts

At the edge, authenticate a principal and bind tenant, purpose, and request ID. Give the model only the minimum relevant context. Validate *every* output at the application boundary; even when the provider enforces a JSON schema, rerun domain validation (allowed enum under this policy version, numeric ranges, referenced objects, ACL, freshness). Keep prompt version, model version, tool schema version, and source snapshot in traces. The model provider does not own your business policy.

A tool's contract should specify: input schema; preconditions; required scopes; authorization principal; side effects; idempotency behavior; max runtime; possible error codes; and a machine-readable result with authoritative evidence. Example:

```text
change_address(order_id, new_address, expected_order_version, idempotency_key)
requires: auth.tenant owns order; auth.user controls order; cutoff not passed;
          address verified; explicit approval bound to exact payload
returns:  {status: COMMITTED, receipt_id, new_version} OR
          {status: REJECTED | CONFLICT | UNKNOWN, reason, reconciliation_key}
```

“UNKNOWN” is not “FAILED”: the request may have reached the order service while the response was lost. Reconcile by idempotency key or authoritative read before another attempt. If the external API lacks idempotency/reconciliation, do **not** auto-retry a write after uncertainty; escalate to an operator or use a controlled compensation workflow.

### Retries, deadlines, and backpressure

Classify failures: invalid input/403 (no retry), version conflict (refresh state and possibly ask again), rate limit/429 (respect `Retry-After` where supplied), transient server error (bounded retry with jitter), timeout after a write (reconcile first), and model refusal/invalid output (safe fallback, not infinite regeneration). Give each stage a deadline derived from the caller's remaining budget. A circuit breaker and concurrency limiter keep a failing provider from consuming the whole worker pool. Bulkheads can isolate voice traffic from batch reports. For streaming, handle cancellation, disconnection, late errors, and partial output; do not speak a tool-claimed action result before commit.

```text
capacity (calls/min) ≤ min(provider RPM, provider input TPM / mean input tokens,
                         provider output TPM / mean output tokens,
                         60 × local concurrent slots / mean duration in seconds)
```

All terms are in **calls per minute**; compare them with peak arrival calls/min, not peak sessions/day. This is a rough **capacity bound**, not a throughput guarantee; burst limits and correlated tails may be tighter. Queue admitted work with a defined priority and max wait. Overload should return a truthful “try later” or handoff, not silently drop an approved action.

### Authentication versus authorization

Authentication answers *who is this caller?* Authorization answers *may they perform this action on this object now?* The server must fetch authoritative ownership and policy; do not let a model-supplied `tenant_id` or document citation determine access. Scope service credentials by tool and tenant; rotate secrets; never place credentials in prompts, browser JS, or tool responses. Public knowledge and private account data often need separate retrieval indexes or security filters, with defense in depth at fetch time.

### Streaming is an interface, not a correctness guarantee

SSE (server-sent events) suits one-way incremental text, while bidirectional voice usually needs a different transport and turn controller. Show a response only when its provisional status is clear: “checking your account” is honest; “your refund is complete” before a commit is not. Persist a committed action independently from a stream so a browser refresh cannot erase its evidence. A disconnected client does not necessarily cancel a server-side approved write; define the cancellation boundary.

### Git, tests, and deploys are part of the system

The guide's Git/API foundation is easy to underestimate: changes to prompt text, policy tables, retrieval indexes, and tool schemas are **software releases**. Use version control, protected review, a reproducible build, contract/unit tests, eval gates, staged rollout, and rollback. A schema migration across agent state must specify how paused jobs resume. Successful CI only proves the checks that ran; a healthy deployment additionally needs a smoke test of the public URL and a check for newly introduced errors.

> **Exercise 4.** A refund request times out after 8 seconds. The client reconnects with the same message; the model proposes the refund again. Write the idempotency, reconciliation, and user-facing status transitions. Which service is allowed to say the money moved?

---
