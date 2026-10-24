# Technical appendices — deeper methods and reference material

## 25. Model adaptation, calibration, and routing in detail

The boundary between “AI engineer” and “ML engineer” is porous: applied systems work often requires deciding whether the bottleneck is data, a model's representation, a prompt, the retrieval layer, or the control plane. Treat the following as a diagnostic ladder, not a mandate to train a model.

### Distinguish four failure mechanisms

1. **Missing fact:** the model could answer if given current, authorized evidence. Fix the source/index/query and cite it. Fine-tuning is unlikely to solve a rapidly changing balance or policy.
2. **Available fact, ignored:** the right passage is in context but the response overlooks it. Investigate context order/length, conflicting text, instruction ambiguity, and model capability. Evaluate retrieved-context utilization with a fixed corpus before changing the index.
3. **Task skill missing:** the model sees the facts but repeatedly fails a stable transformation (e.g., a specialized classification or format). Try examples, a deterministic algorithm, a specialized classifier, or supervised tuning if labels and economics support it.
4. **Tool/control defect:** the answer is correct but the system acts on the wrong tenant, retries a write, or reports uncommitted success. Bigger models and fine-tuning are not the fix; repair authorization, contracts, or state.

### Supervised and preference learning

For labeled input/output pairs `(x,y)`, a supervised fine-tuning objective typically minimizes negative log-likelihood of target tokens, `L_SFT = − Σ_(x,y) Σ_t log Pθ(y_t | x, y_<t)`. This improves imitation of the supplied behavior; it can also imitate labeler mistakes or outdated policy. Hold out sources and temporal cohorts, not just random sentences. Evaluate negative controls and out-of-distribution inputs. Parameter-efficient adapters reduce the number of trainable parameters, not the need for curated data, deployment/versioning, and safety review.

Preference data `(x, y_good, y_bad)` can support a direct preference objective (e.g., DPO) that increases preference for better responses relative to a reference policy. It optimizes *what the preference labels express*. If reviewers consistently prefer confident, polished but unsupported prose, a preference model can learn that error. Preference optimization is not a replacement for verifiable postconditions or security boundaries. For action agents, a good outcome label may require inspecting database state rather than reading the transcript.

### Calibration and abstention

Suppose a classifier outputs predicted probability `p_i` for whether an alert is correct and observed label `y_i ∈ {0,1}`. The **Brier score** is `mean((p_i − y_i)^2)`: it measures both accuracy and probabilistic calibration for binary events, while still requiring representative labels. A reliability diagram bins scores and plots observed event frequency; equal numbers of items per bin avoid empty tails but can blur extreme-risk regions. Expected calibration error (ECE) depends on chosen bins and can conceal subgroup failure. Report calibration by region, time, class, and severity, not only globally.

An action gate might accept a model decision only if `estimated harm < threshold` and all hard policy checks pass. To assess abstention, plot **risk–coverage**: at coverage `c` (fraction handled automatically), what is the wrong-action rate among accepted cases and what is the cost/quality of the deferred cases? Select a threshold on development data, evaluate it once on a frozen holdout, and monitor drift. A classifier's `0.92` may not mean 92% real-world correctness after data shift or when an attacker adapts.

### Routing with asymmetric loss

Let models A and B have per-task expected costs `C_A, C_B`, latencies `L_A, L_B`, and measured severity-weighted error losses `E_A(x), E_B(x)` for task features `x`. A simple objective might choose the least expensive option satisfying `E_m(x) ≤ risk_limit` and `L_m(x) ≤ deadline`; if neither satisfies, escalate. In practice `E_m(x)` is estimated with error and may be high exactly where training data are sparse. Route on stable, auditable features (task category, language, evidence completeness, risk tier), then measure segment-level outcomes. Do not let the same model certify its own high-stakes route from an unvalidated confidence statement. [Sierra's public multi-model discussion](https://sierra.ai/blog/constellation-of-models) provides a product example of selecting models by task; the objective and thresholds here are a general teaching model.

### Distillation and open-weight deployment

Distilling successful traces into a smaller model can reduce unit cost or latency for repeated, bounded tasks; first remove unsafe traces and ensure labels reflect verified outcomes. Self-hosting open-weight models can offer control over placement, privacy, and batching, but introduces GPU scheduling, patching, red-teaming, capacity, and reliability obligations. Compare **total** cost and compliance, not just per-token prices. Quantization reduces memory/bandwidth at potential quality cost; test rare/severe cases and tool-schema adherence, not only aggregate benchmark accuracy. Model change, adapter change, and quantization change are separate releases with distinct eval results.

## 26. Statistical and performance reasoning without overclaiming

### Confidence intervals and clustered tasks

With `x=180` successes among `n=200` independent cases, `p̂=0.9`. A two-sided 95% **Wilson interval** with `z=1.96` has center

```text
(p̂ + z²/(2n)) / (1 + z²/n)
```

and half-width

```text
z·sqrt(p̂(1−p̂)/n + z²/(4n²)) / (1 + z²/n).
```

The result is about **[0.851, 0.934]**, not `90% ± 0.1%`. If 200 cases come from only 10 repeated customer journeys, independence is false; resample by journey or organization, and report the effective coverage. For severe errors with zero observed cases, an upper bound is a reason to gather more evidence and retain runtime safeguards—not a certification that the error is impossible.

**Paired experiment example:** on 200 fixed tasks, A and B both succeed on 130, A-only succeeds on 25, B-only on 15, and both fail on 30. A succeeds 155/200, B 145/200: a 5 percentage point difference, but *discordant pairs* (25 vs 15) determine evidence for a paired advantage. Report a paired interval or appropriate paired test and inspect which segments changed. If B costs half as much and loses 10 low-risk cases but wins 5 severe cases, aggregate success is not the entire decision; severity-weighted errors and human cost matter.

### The denominator trap

Assume 1% harmful-event prevalence, 90% recall, and 2% FPR: the disaster-alert example yields 31.25% precision. The formula is

```text
PPV = (sensitivity × prevalence) /
      (sensitivity × prevalence + FPR × (1 − prevalence)).
```

If prevalence falls to 0.1% with sensitivity/FPR unchanged, precision is `0.0009 / (0.0009 + 0.01998) ≈ 4.31%`. This is why an excellent-seeming ROC curve can overwhelm a security or support queue. Specify prevalence, review capacity, and costs at the *deployment* distribution. Precision can also change when label confirmation is delayed or incomplete.

### Latency, tails, and retries

For stage latencies `T_1…T_n`, total sequential latency is `Σ T_i`, but `p95(Σ T_i)` is generally neither the sum nor the max of the individual p95s. Shared load, network delays, and retries create correlated tails. Trace complete journeys and measure under traffic mix and failure injection. For two independent optional retrieval calls in parallel, completion time is `max(T_a,T_b)`; parallelism reduces *mean* versus serial calls but can worsen load and deadline misses at high utilization. Use a response deadline and return a partial-with-uncertainty answer only if product semantics permit it.

If a call fails transiently with probability `r` and retries are independent, unbounded retries have expected attempts `1/(1−r)`; independence often fails during an outage, so retry storms can amplify overload. A bounded retry with exponential backoff and jitter, `Retry-After`, per-tenant quota, and a circuit breaker is safer. For writes, “retryable transport error” does not imply “safe to repeat effect”; use idempotency and reconciliation. Keep separate budgets for latency-sensitive turns and offline jobs.

### Cost sensitivity analysis

Start with the Ch. 11 teaching example ($738/day in model tokens under its assumptions). If half of calls need a retry, expected daily calls rise to 450k **only if** 50% of calls are retried once and all other factors stay fixed; daily token spend becomes roughly $1,107 before retry-specific prompt/output changes. If a routing improvement halves model *price* but drops verified success from 90% to 70%, model spend per verified outcome may not improve proportionally, and handoff costs may dominate. Vary cache hit, output length, retry rate, and human escalation as independent sensitivities; report a range instead of a single false-precision budget.

## 27. Formalize a workflow just enough to make it testable

A state machine can be defined as `(S, E, δ, s0)` where `S` is persisted states, `E` is validated events, and `δ(state,event)` is a partial transition function. A *partial* function is useful: `APPROVED + payment_receipt` may advance, while `NEW + payment_receipt` is invalid and should alert. Each transition has a precondition, side effect (if any), resulting event, timeout, and owner. Model outputs are **proposed events** until validated.

### Three invariant layers

1. **Syntactic:** schema-valid payload, required fields, bounded length; reject malformed events.
2. **Semantic:** the referenced order exists, requested amount equals approved amount, policy effective date applies, evidence spans resolve.
3. **Authorization + effect:** authenticated principal has rights, approval binds to exact action, external service commits once under key `K`.

These checks should be enforced at distinct services with tests; a type checker cannot establish a claimant owns an order. Maintain a ledger of blocked proposals as well as committed effects so repeated injection attempts are visible without leaking sensitive prompt text.

### Temporal properties

Safety: “no committed refund without approval,” expressible as an invariant over every transition. Liveness: “an approved refund eventually commits, rejects, or escalates before deadline,” dependent on retries, operations capacity, and human queues. If a worker crash leaves `EXECUTING` forever, safety may hold but liveness fails. A watchdog finds aged states and reconciles. Temporal modeling makes “pause and resume without losing reality” operational, as the guide urges on p. 13.

**Fault-injection table for a write:**

| Crash point | Persisted evidence | Recovery action | Forbidden shortcut |
|---|---|---|---|
| Before intent persisted | No execution permitted | Restart proposal/approval flow | Assume it committed |
| After intent, before API call | `K`, approved payload | Call under same `K` within expiry or revalidate | Generate new payload silently |
| After API commit, before reply | `K`, `UNKNOWN` locally | Query status by `K`, persist receipt | Blind new-key retry |
| After receipt, before user message | Receipt and `COMMITTED` | Resume communication, verify if required | Issue refund twice |
| After user message, before telemetry | Receipt remains source of truth | Backfill observability event | Treat missing log as missing refund |

**Verification strategy:** property-based tests can generate many event sequences and assert invariants; a small model checker or exhaustive enumerator can explore bounded state transitions; integration tests simulate every crash point. For an effectful service, the most valuable tests are those that *cannot* be satisfied by a persuasive model response without the correct external postcondition.

## 28. Exercise answer notes and glossary

### Answers to the earlier exercises

- **Exercise 4 (uncertain refund).** Before calling the processor, persist approved exact payload and idempotency key `K`. After timeout, set `UNKNOWN` and tell the client it is pending; on reconnect load the same job and query processor by `K` (or ledger transaction ID). If committed, persist receipt and communicate that status; if definitely rejected, record reason and, if still eligible, require an explicitly allowed retry under the same or documented new key. If the external system offers no safe lookup/dedupe, halt automatic retries and escalate. The processor/ledger is authoritative about moved money, not the assistant.
- **Exercise 6 (two workers and stale order).** Acquire a job-version compare-and-swap/lease so only one worker transitions `APPROVED → EXECUTING`; the order service itself checks expected version 12. If it is 13, it returns conflict, no write; refresh order and policy, invalidate approval if exact payload or eligibility changed, and ask for a new confirmation if needed. A resumed job trusts the persisted approval **plus** a fresh authoritative read—not a stale chat summary.
- **Exercise 7 (good retrieval, wrong dates).** Investigate (1) a superseding policy not captured in metadata, measure valid-time errors; (2) correct passage omitted during context packing, log retained IDs; (3) model misreads “30 calendar days” as “one month,” label claim-to-span/date reasoning; (4) controller uses cached eligibility instead of current source, compare policy version at retrieval vs action; also check OCR table/date parse and citation-support accuracy.
- **Exercise 9 (malicious tool description).** Version and approve tool manifests; allowlist names/operations; authenticate tool server; revalidate authorization, scopes, network egress, and user-facing action approval at each invocation. A changed description cannot expand server-side capability. Log manifest/version change, blocked invocation, principal, tool, target class, and decision reason without secrets.

### Compact glossary

| Term | Operational meaning |
|---|---|
| Agent | A model chooses steps/tools in a bounded loop; not a synonym for every model-backed feature. |
| Workflow | Pre-specified stages/transitions, possibly using models inside steps. |
| RAG | Retrieve external evidence to condition generation; requires authorization and freshness in production. |
| Embedding | Vector representation for similarity search; does not certify exact semantic equivalence. |
| BM25 | Lexical ranking family useful for exact terms/rare identifiers. |
| Reranker | Scores a query against a smaller candidate set after retrieval. |
| Recall@k | Fraction of eligible queries with a relevant passage in top k. |
| nDCG | Ranked retrieval metric that rewards graded relevance near the top. |
| Provenance | Origin, version, and span of a fact or observation. |
| Grounding | Linking a claim to eligible supporting evidence, not merely displaying a citation. |
| Valid time | When a fact/policy was true in the domain. |
| Transaction time | When the system learned/stored a fact. |
| Context window | Maximum input/output context capacity under provider rules; not guaranteed effective recall. |
| Prefill / decode | Input processing / autoregressive output generation phases of inference. |
| KV cache | Cached key/value representations reused during decoding, with memory cost. |
| Prompt caching | Reuse of a stable prefix's processing; distinct from caching a final answer. |
| Structured output | Syntax/schema-shaped model output; still needs semantic and permission checks. |
| Tool call | Model-proposed invocation; execution is controlled by the application. |
| MCP | A tool/context integration protocol, not an authorization policy. |
| Idempotency key | Stable identifier allowing repeated requests to map to one intended effect when supported. |
| Reconciliation | Read authoritative external state to settle an uncertain write. |
| Transactional outbox | Persist state + outgoing event atomically, deliver event with deduplication. |
| Checkpoint | Durable restart artifact with validated state and pending obligations. |
| ACL | Access-control list/policy deciding which principal can see a resource. |
| Prompt injection | Low-trust input attempts to steer model behavior beyond its data role. |
| SSRF | Server-side request forgery via induced outbound requests to unintended destinations. |
| Least privilege | Give components only the data/actions necessary for the current task. |
| Canary | Limited production exposure with predetermined rollback criteria. |
| Shadow mode | Evaluate proposed decisions without applying side effects. |
| LLM judge | Model scoring another output; must be calibrated against trusted labels. |
| Calibration | Agreement between predicted probabilities and observed outcome frequencies. |
| Abstention | Deliberate non-answer/escalation when evidence or authority is insufficient. |
| Risk–coverage | Error on accepted tasks versus fraction handled automatically. |
| SLO / SLI | Target for a measured service indicator / the indicator itself. |
| p95 | 95th-percentile observed latency (or other distribution), not derivable from the mean alone. |
| TPM / RPM | Token/request rate limits per minute, often scoped by provider/account/model. |
| Barge-in | User interrupts generated speech; requires cancellation of audio, not undoing committed actions. |
| As-of replay | Reproduce a decision using only data available at that historical time. |
| Schema migration | Change in durable record/event format with a plan for older paused jobs. |

### Source notes and further reading

The supplied *The 2026 Fast-Track AI Engineer Guide* by Dr. Maryam Miradi is the conceptual starting point: systems/skills on pp. 3–20 and project sketches on pp. 8, 14, and 17. The textbook is a separate original expansion. Numbers, targets, pseudocode, and architectures labeled illustrative or hypothetical are teaching constructs. Company names in source links identify **public reading**, not a claim that the worked architectures match private implementations.

**Patterns, tools, and context.** [Building effective agents](https://www.anthropic.com/research/building-effective-agents) distinguishes workflows from agent loops; [Writing effective tools for agents](https://www.anthropic.com/research/writing-tools-for-agents) discusses tool interfaces and evals; [Effective context engineering](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) discusses context budgets and agentic search; [Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents) gives a public long-running code-agent case. These are design inputs, not universal best practices for every workload.

**Provider interfaces.** Current [structured-output](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [citation](https://platform.claude.com/docs/en/build-with-claude/citations), [streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), and [prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) documentation should be consulted before implementing an API adapter. Features, prices, limits, and compatibility are version-specific; this book deliberately uses no fixed production API model ID or price claim.

**Evaluation and security.** [Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) treats outcome-based agent evaluation; [τ-bench source](https://github.com/sierra-research/tau-bench) provides a public tool-agent-user benchmark; [τ-voice](https://sierra.ai/blog/tau-voice-benchmarking-real-time-voice-agents-on-real-world-tasks) adds an audio view; [OWASP LLM01](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) catalogs prompt-injection risks and mitigations. Public [multi-model agent design](https://sierra.ai/blog/constellation-of-models) and [enterprise voice tests](https://sierra.ai/blog/what-is-voice-ai) are additional product-context readings; no internal architecture is inferred from them here.

**Research foundations.** [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) motivates retrieval with generation; [ReAct](https://arxiv.org/abs/2210.03629) explores alternating reasoning and action; [Lost in the Middle](https://arxiv.org/abs/2307.03172) studies positional effects in long contexts. Research findings are conditional on the study's models/tasks; reproduce relevant tests on the actual system.

**Last principle:** trust the postcondition, not the prose. When you cannot establish the postcondition, say what remains unknown and make it someone’s explicit responsibility to resolve it.
