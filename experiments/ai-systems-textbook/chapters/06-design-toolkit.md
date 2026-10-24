# Part VI — Design toolkit, adversarial drills, and project laboratory

## 22. Transfer the architecture to a new problem

A strong design does not memorize eight diagrams. It recognizes the **shape of uncertainty and the location of irreversible effects**. Use this template on any new prompt:

```text
1. Outcome + actor + authoritative postcondition
2. Trust-boundary map (source → model → tool → world)
3. One simple baseline and the reason it is insufficient
4. Data lifecycle and freshness/ACL requirements
5. Mechanism per step: code | ML/optimizer | search | model | human
6. Contracts/state machine with retries and unknown results
7. Quantified latency, throughput, cost, and rate limits
8. Evaluation: unit, labels, baselines, slices, adversarial tests
9. Rollout, rollback, on-call owner, and one unresolved tradeoff
```

**Order of operations matters.** Start with outcomes and authority. Only then choose a model or orchestration framework. State at least one plausible alternative you rejected and the evidence that would change your decision.

### Architecture archetypes

| Problem shape | Minimal viable architecture | Add complexity when… | Non-negotiable check |
|---|---|---|---|
| Static public Q&A | Search + cited extract/template | Paraphrase/multi-hop demands generation | Answer supported by accessible source |
| Private evidence analysis | ACL-aware hybrid retrieval + extraction | Scale or ambiguous docs require rerank/model | Fetch-time ACL, provenance, freshness |
| Structured extraction | Deterministic parser + schema; model for edge cases | Layout/variance defeat rules | Field evidence + human review for high harm |
| Transactional assistant | Explicit workflow + code policy + approvals | Unknown paths justify bounded agent exploration | Confirmed world state, idempotent write |
| Predictive alerting | Baseline thresholds/statistical model + capacity gate | Complex signal improves calibrated lead-time | As-of validation and operator load |
| Scheduling / planning | Solver/constraints + human sign-off | Natural language needed for intake/explanation | Independent feasibility and version check |
| Coding/research agent | Isolated tools + bounded loop + artifacts | Breadth needs independent parallel exploration | Executed tests/evidence + no unsafe egress |
| Real-time voice | Turn controller + scoped tools + handoff | Integrated speech model beats pipeline on eval | Entity confirmation and full-call state |
| Model serving platform | Typed adapter, quota and traces | Multiple workloads/providers justify router | Paired quality + cost + failover eval |

### Five recurring tradeoffs, with consequences

**Retrieval vs. long context vs. fine-tuning.** Retrieval is strong when facts change, access is scoped, and provenance matters; it can fail on ingestion and recall. Long context can work for a small known corpus but cost grows and evidence use varies by position. Fine-tuning helps stable behaviors and formats; it is a poor substitute for today's inventory or revocable private knowledge. Try a filtered search baseline before building a vector index. If the query asks “what exact policy was effective last Tuesday,” versioned sources and valid time matter more than a larger model.

**Workflow vs. open agent.** A workflow makes action paths inspectable and transition tests cheap. An agent is appropriate if the path cannot be pre-enumerated, such as navigating a new codebase, but needs a bounded tool surface and outcome verification. A hybrid is common: a bounded agent gathers evidence inside a workflow whose action step is deterministic. “Many agents” only wins if work separates cleanly enough to outweigh coordination overhead.

**Prompt instructions vs. contracts/policy.** Prompts shape language and heuristic choices. Schemas restrict syntax. Validators reject impossible values. Policy checks enforce permissions. Transaction controls enforce uniqueness. Each layer catches a different class of defect. A JSON object saying `approved: true` is still model output, not an approval.

**Consistency vs. latency.** A cached answer can be fast; an action on stale ownership can be catastrophic. Choose freshness by fact: static FAQ hours; order status seconds; payment preconditions immediately at execution. For cross-region systems, tenant affinity and regional data processing may add latency; do not weaken account authorization to hit a p95 goal. A degraded read-only mode is better than a fast invalid write.

**Automatic action vs. human approval.** Human review lowers some high-severity risks but increases latency and can fail from overload. Use exact-payload approvals, measurable review quality, and escalation paths. Allowlisted low-value, reversible actions may safely bypass review after measured rollout; irreversibility, ambiguity, and legal consequences push toward explicit approval. The boundary is a policy and evidence decision, not an intrinsic “agent confidence” threshold.

### Fast sizing without false precision

Compute `peak RPS = daily sessions × peak-hour fraction × calls/session / 3600`; `mean concurrency ≈ peak RPS × mean latency`; `TPM ≈ peak RPS × mean tokens/call × 60`; `model $/day ≈ daily calls × (input tokens × input $/1M + output tokens × output $/1M) / 1M`, adjusting for cache and retries only if measured. State whether “call” means model invocation, user turn, or whole journey. Then ask where queuing and provider burst limits dominate. Avoid asserting p95 or availability from averages.

For rare failures, sample size matters: zero failures in 100 tests is weak evidence; expanding the same easy tests to 1,000 is still weak coverage. Invest in representative, adversarial, stratified tasks and **runtime invariants**. A low-frequency severe error deserves its own metric and escalation, not a tiny weight in an average rubric.

### Change-of-assumption prompts

Take any blueprint and modify one variable at a time:

- **10× traffic:** Which quota, index, queue, or human review team saturates first? Can optional work be dropped?
- **100× corpus:** Can filters be pushed into search; can the index fit? What is the reindex/backfill and deletion plan?
- **1-second p95:** Can we eliminate steps, parallelize safe reads, precompute, or use a faster model? Which correctness constraint must *not* be traded away?
- **No external model processing:** Which self-hosted options, data controls, model evals, and GPU operations change?
- **Strict residency + deletion:** Which caches, logs, backup copies, and third-party processors require redesign?
- **Actions become irreversible:** What approval, compensation, audit, and postcondition verification are now mandatory?
- **Provider outage or 429 burst:** Which flows degrade to deterministic read, queue, or human; what preserves in-flight action state?
- **Adversarial documents:** Which low-trust text enters a prompt, and what server-side controls remain if the model obeys it?

A design is comprehensive when its invariants survive these variations, not when it uses every fashionable component.

## 23. Design-review drills with answer outlines

Try the prompt cold: 5 minutes of questions, 10 minutes of architecture, 10 minutes of state/failure, 10 minutes of eval/capacity, 5 minutes defending an alternative. Score yourself with the rubric below before reading the outlines. These are *not* claims about any real employer's private systems.

### Rubric (100 points)

| Dimension | Points | What earns them |
|---|---|---|
| Outcome and constraints | 15 | Clear actor, postcondition, non-goals, realistic assumptions |
| Mechanism choice and data | 15 | Simple baseline, authoritative sources, freshness, appropriate model role |
| Interfaces and durable state | 20 | Contracts, transaction boundaries, retries, reconciliation |
| Trust and safety | 15 | ACL, tool permissions, injection, approval where needed |
| Evaluation | 15 | Task-level truth, slices, metrics, leakage control, regression plan |
| Capacity and operations | 10 | Units, queue/rate limits, realistic cost, rollback/runbook |
| Alternatives and communication | 10 | Tradeoff, counterexample, explicit unknowns |

**Automatic red flags:** claiming “100% safe” from an eval, letting the model authorize itself, relying on generic retry after an uncertain write, measuring only answer tone for effectful work, or inventing private implementation details.

### Drill A — An enterprise HR policy assistant

**Prompt.** 50,000 employees across 30 regions ask about leave. Policies change weekly; managers may see additional documents. Design it with a 5-second p95 answer target.

**A strong outline:** segregate public vs manager-only documents; effective-date/version metadata; ingress redaction and consent; indexed lexical+semantic retrieval with ACL prefilter and fetch-time check; answer with clause/version and “as of” date, abstain on conflicts; no automatic leave approval. Ingestion SLO < policy-publishing cadence, revoke old ACLs and tombstone indexes/caches. Estimate peak turns and TPM from *asked-for* traffic, not employee count; queue for bursts. Eval queries segmented by region, manager permissions, policy exceptions, stale revisions, and unanswerables; measure Recall@k, support, access violations, update lag, and handoffs. **Variation:** if the assistant now submits leave, add an identity-bound action workflow and confirmation; retrieval alone is not the new authorization policy.

### Drill B — A regulated claims intake system

**Prompt.** Extract fields from scanned claim forms, explain missing evidence, and submit complete claims. PDFs include tables, handwriting, and personally identifying information.

**A strong outline:** baseline OCR/form templates; layout-aware extraction with per-field source bounding boxes and confidence; validation against schema and policy with human review for uncertain/high-impact fields; separate draft from submission; idempotent claim ID, duplicate-detection, receipt lookup and `UNKNOWN` reconciliation; field-level ACL, retention and model-processing review. Evals use expert-labeled scans by quality/language and compare extraction F1, missing-field detection, false submissions, time per verified claim, and reviewer burden. A classifier's numeric confidence is not proof a claimant is eligible. **Variation:** if OCR returns contradictory totals, require authoritative arithmetic and review rather than averaging model outputs.

### Drill C — A fraud-alert assistant

**Prompt.** Flag suspicious purchases in real time and suggest interventions without unfairly blocking legitimate customers.

**A strong outline:** define event/label delay, features available at authorization time, class imbalance and costs, rules/logistic/GBDT baselines, calibration and threshold by capacity and harm; apply hard rules separately; log features/scores for as-of replay. Fast scoring service must meet transaction deadline; analyst queue and reversible step-up authentication precede irreversible block. Track recall at fixed false-positive rate, precision, customer friction, disparate impact by relevant segments, delayed chargeback truth, drift, and review overrides. **Variation:** if a model generates a story explaining the decision, it cannot fabricate feature evidence or bypass a contest/appeal process.

### Drill D — An internal research agent with web access

**Prompt.** Let analysts ask open-ended questions over internal documents plus external pages; synthesize a report with citations.

**A strong outline:** tenant/role ACL on internal corpora, safe allowlisted web fetch with egress filters and separate trust labels, query planning with bounded subsearches and deadlines, hybrid retrieval and provenance-preserving report outline, claim-to-span checker, explicit unknowns and contradictions. Do not allow the agent to email the report or access secrets simply because a web page says so. Evals include multi-hop truth, inaccessible decoy docs, source staleness, prompt injection, citation support, price/time per verified report. **Variation:** if 3 subagents parallelize search, require independent scopes and a reducer that checks source duplication and contradictions.

### Drill E — A model router with a strict budget

**Prompt.** Your application has three models with different quality, price, tool behavior, and regional availability. Cut spend without increasing wrong-action rate.

**A strong outline:** create a per-task paired dataset and cost/safety constraints, version a routing policy using intent/risk/region and measured calibrated uncertainty, compare against a single-model baseline; protect action controller regardless of model. Quota/TPM admission, constrained fallback under region/tool-schema compatibility, streaming errors, cache keys with tenant and policy, canary by stable cohort, rollback switch. Track cost **per verified resolution**, safety incidents, p95, cache-hit and fallback mix; a cheaper token price can lose after retries and escalations. **Variation:** provider outage mid-tool: keep state and idempotency; never replay the effectful tool call from gateway context.

### Drill F — A collaborative code agent

**Prompt.** Ten developers delegate edits to one large monorepo simultaneously. Agents can read, patch, test, and open PRs.

**A strong outline:** per-task isolated checkout/branch/workspace, auth per repo, bounded read/search, sandboxed tests/no default egress, single-writer per branch and file conflict detection, artifact checkpoints with base SHA, explicit approval before push. Merge results through normal code review; never silently overwrite another worker. Evals use hidden tests, change scope, security, conflict rate, time/cost, honest reporting under flaky tests and interruption. **Variation:** a dependency installation is needed: controlled proxy + lockfile review rather than global network permission.

### Drill G — A medical-literature evidence explorer

**Prompt.** Clinicians search papers for treatment comparisons; responses must show evidence strength, not prescribe care.

**A strong outline:** licensed corpus/version/date, verified inclusion/exclusion filters, study-type and population metadata, cross-check contradictory results and publication updates; source-level snippets and uncertainty. Maintain a hard boundary between evidence summary and patient-specific recommendation, with clinician review and no autonomous order placement. Evals with domain experts for supported statements, omissions, contradictions, subgroup relevance, unanswerable questions, and outdated/retracted work; govern sensitive queries and audit access. **Variation:** if patient records are added, redesign identity, consent, retrieval filters, and safety approval rather than appending a prompt sentence.

### Drill H — A warehouse robot-dispatch explainer

**Prompt.** Workers ask why the robot fleet rerouted and want to override a blocked aisle.

**A strong outline:** fleet controller owns physical constraints and safe-stop state; an agent can summarize route causes from trusted telemetry and propose an override but cannot command motion. Signed real-time events, spatial safety constraints, versioned approval and hardware fail-safe, bounded stale-data windows, and a human operator in the loop. Eval impossible commands blocked, explanation faithfulness, freshness, override execution postconditions, and outage behavior. **Variation:** when the model provider goes down, physical safety and deterministic dispatch must continue.

### Short answer key for the opening exercise

For the claim summarizer in Exercise 0: summarize against uploaded evidence with cited spans and an “unclear” state; submission success requires a claim-service receipt under an authenticated, approved, idempotent write. Auth check one: the caller may read this claimant's upload; check two: the caller may submit this exact claim in its current state. Text inside the upload is untrusted; tools are allowlisted and submit checks happen server-side. A second prompt alone is not a security boundary.

## 24. Build a small but rigorous portfolio laboratory

A demonstration becomes persuasive when another engineer can run it, break it, and see why it behaves as claimed. Use public or synthetic data, document assumptions, avoid real customer secrets, and start with a deterministic baseline. Each project should ship a README, architecture/data-flow diagram, typed contracts, a small eval set with provenance, failure-injection tests, measured latency/cost, and a runbook. Do not present synthetic metrics as production results.

### Lab 1 — Multi-signal alerting (prediction + calibration)

1. Define a synthetic flood-risk event, lead time, grid, and response capacity. Generate temporally correlated weather/sensor/geo inputs with missingness correlated to storms; keep a frozen hidden future/region holdout.
2. Implement a threshold and simple statistical baseline. Audit time leakage. Plot PR and reliability curves, alert counts/day, lead time by severity, and performance under sensor outages.
3. Add an ingestion service with as-of replay, versioned model/threshold, queue, and human approval of public alerts. Fault-inject delayed feeds and duplicate events.
4. Acceptance gate: no future-data use in replay; decision package shows input timestamps; changed thresholds carry capacity estimates; outages generate visible uncertainty. The target is engineering integrity, not claiming hazard expertise.

### Lab 2 — Port planning (optimization + state)

1. Model berth compatibility, ETA, duration, safety buffer, inspection holds, and a weighted delay objective with a small public/synthetic schedule.
2. Compare a greedy baseline with a constraint solver or bounded exact search. Emit a feasibility certificate or explicit infeasibility report; represent source-message extraction separately.
3. Implement plan versions, optimistic publish, manual overrides, approval bound to plan hash, outbox ACKs, and a replan-on-delay simulation.
4. Acceptance gate: property tests find zero illegal overlaps in published plans; stale approvals cannot publish; unknown ACKs trigger reconciliation rather than a false success banner.

### Lab 3 — Read → propose → approve → commit (trusted agent boundary)

1. Build a synthetic order API with two tenants, policy versions, a refund ledger, transient failures, and a delayed response after a successful write.
2. Create permissioned retrieval and a bounded model *stub* or real provider adapter for intent/explanation. Keep eligibility and money movement in code.
3. Red-team tool results and uploaded text with instruction injection. Simulate duplicate submits, cross-tenant IDs, approval changes, and worker restarts.
4. Acceptance gate: zero unauthorized writes in the adversarial suite; every committed refund has one receipt/idempotency key; every uncertain result is visible and reconciled; a blind retry test fails safely. A stub is preferable to API dependency for reproducible invariant tests.

### Lab 4 — Evidence assistant + gateway (retrieval + operations)

Build a small versioned document corpus with ACLs, exact-match IDs, contradictory revisions, and removal events. Compare keyword, vector, and hybrid retrieval; grade source-span support and abstentions; measure index lag. Add an adapter that records tokens/latency and a rate-limited queue; optional model routing must clear a paired holdout. Acceptance gate: revoked documents disappear from answers and caches, fallback models do not bypass ACLs, and a failure trace identifies the failing stage.

### Suggested sequence and review artifacts

| Stage | Main deliverable | Challenge to attempt before moving on |
|---|---|---|
| 1. Contract | Outcome, actors, invariants, diagrams | Can a second engineer identify the authoritative service? |
| 2. Baseline | Simplest non-agent solution | Does the model measurably improve a labeled segment? |
| 3. Failure paths | Timeout, duplicate, stale, malicious input | Can a restart or prompt injection cause unauthorized effect? |
| 4. Evidence | Frozen eval + blinded review sample | Are denominators, uncertainty, and slices honest? |
| 5. Production | Load test, dashboards, rollback/runbook | What happens during provider outage and index lag? |

For each artifact, record one important design change you made **because of evidence**, not preference. Re-run the holdout only at defined checkpoints; otherwise it becomes a development set. Review a deployment by its real postconditions and rollback readiness, not just a green CI badge.

---
