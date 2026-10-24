# Part II — Workflows, state, retrieval, and tools

## 5. Workflow design and decomposition

A workflow is the **control plane** that says which step is allowed next, not a picture of prompt messages. Model it as a state machine or DAG with explicit inputs, outputs, timeouts, compensations, and ownership. The model may choose among safe alternatives inside a step; it need not own all transitions.

### Four useful patterns

1. **Pipeline:** parse → retrieve → compose → verify. Predictable; good for bounded extraction. Risk: one bad upstream result contaminates later steps. Add typed intermediate artifacts and a “missing evidence” exit.
2. **Router:** classify request → select a narrow workflow/model/tool set. Reduces irrelevant tools and context. Measure routing confusion and define an “unknown” path; do not let an untrusted document change routing policy.
3. **Parallel fan-out + reduce:** independently retrieve document collections or run complementary checks, then merge with provenance. Use when tasks are genuinely independent; merging disagreements is itself a designed step. Fan-out increases load and tail latency if reducer waits for the slowest branch.
4. **Bounded agent loop:** propose next read/tool → validate → execute → observe → repeat until verified postcondition, handoff, or budget exhausted. Use when the search path is unknown, such as investigating a repository. Give the loop a maximum depth, per-tool caps, and an inspectable termination reason.

A fifth pattern, **evaluator–optimizer**, can improve a draft when an external criterion identifies a concrete defect. It is not a universal quality loop: a critic from the same flawed evidence can confidently rubber-stamp the error. [Anthropic's agent patterns](https://www.anthropic.com/research/building-effective-agents) discuss where these compositions make sense; the implementation choices here are illustrative.

### Decompose by ownership and failure mode, not by fashionable roles

Instead of “planner agent + researcher agent + writer agent” by default, split where you can give each part a **contract**:

```text
EvidenceFinder(query, tenant, ACL, as_of) → [passage_id, doc_version, span, score]
PolicyEvaluator(facts, policy_version) → {eligible, reasons, required_approval}
DraftComposer(verified_facts, permitted_style) → {message, cited_fact_ids}
ActionController(principal, approved_payload, expected_version) → receipt
```

This decomposition lets you replace retrieval without changing authorization. If two roles both read/write the same mutable chat state, their boundary is mostly rhetorical. Agents are useful when subproblems need independent context windows or parallel exploration; they cost additional coordination, model calls, and reconciliation.

### Draw the failure edges

For each edge, specify `success | no_evidence | invalid_schema | forbidden | transient_failure | uncertain_effect | deadline`. A happy-path graph alone is incomplete. Example: if retrieval has zero eligible documents, the composer must not “fill in” a policy from general training; ask for clarification or escalate. If a tool is rate-limited, either wait within budget or finish visibly as pending. If a generated plan violates a deterministic invariant, reject it **before** any side effect.

A useful *step budget* is `{max_model_calls, max_tool_calls_by_type, max_wall_time, max_tokens, max_external_cost}`; log budget consumption and the exact reason for stopping. Budget exhaustion is not proof of impossibility. Narrow the problem, ask a question, or hand off.

### Timeline example: a disputed subscription charge

1. Authenticated user reports a charge; router proposes `billing_dispute` with confidence only as a routing hint.
2. Read-only tools get ledger entries and published policy under the user's authorization. The application validates returned tenant and version.
3. Deterministic rules calculate eligible amounts and dates; a model drafts a user-readable explanation from those fields, with source IDs.
4. If multiple possible charges fit, ask which one; do not guess. If a refund is allowable, create a *proposal* with a payload hash; show the exact amount and method for confirmation.
5. Controller refreshes ledger status and verifies approval + current policy, commits once, stores receipt. If uncertain, reconciles before answering.
6. Record outcome, reasons, latency, and de-identified failure tags for evals. A language model can improve explanation; it cannot invent a ledger postcondition.

This timeline yields test cases naturally: stale ledger, ambiguous user, revoked approval, duplicate client submit, empty retrieval, slow provider, and payment processor timeout.

## 6. Contract design, durable state, and correctness

Natural-language instructions help a model; **contracts make services compose**. A useful intermediate artifact is narrow and versioned. Schema validation is a necessary first step, not a proof of truth. Prefer server-derived tenant and identity fields to model-generated fields.

```json
{
  "schema_version": 2,
  "case_id": "case_…",
  "proposed_action": "refund",
  "order_id": "ord_…",
  "amount_minor_units": 2599,
  "currency": "USD",
  "basis": [{"source_id": "policy:v7:section-4", "span": "…"}],
  "uncertainties": ["processor settlement status pending"]
}
```

**Example only:** this is a *proposal*, not a processor request. On the server: require integer minor units (`25.99` in floating-point dollars is a poor ledger primitive), current ownership, exact policy version and entitlement, verified source references, approval scoped to this payload, and a stable idempotency key. Never accept an arbitrary source ID as a bypass of the underlying check.

### A durable action state machine

```text
NEW → FACTS_GATHERED → PROPOSED → AWAITING_APPROVAL → APPROVED
             ↘ NEEDS_INFO                ↘ REJECTED / EXPIRED
APPROVED → EXECUTING → COMMITTED → VERIFIED
                     ↘ UNKNOWN → RECONCILING → COMMITTED / REJECTED / ESCALATED
```

Define legal transitions, their actor, and their persisted event. Approval is bound to a hash of `principal + tenant + action_type + target + amount + policy_version + expiry`; any change invalidates it. `EXECUTING` records the idempotency key *before* the external call. `COMMITTED` requires an authoritative receipt. `VERIFIED` may require a read-after-write or downstream event depending on the service. An `UNKNOWN` timeout cannot transition straight to `REJECTED` or `COMMITTED` without reconciliation.

A job record can store `job_id, tenant, state, state_version, input_ref, policy_version, model/prompt/tool_versions, deadline, idempotency_key, last_verified_event`. Use compare-and-swap on `state_version` so two workers cannot independently advance the same transition. Store raw sensitive evidence separately with limited retention; a checkpoint should preserve *references, validated facts, and pending obligations*, not an unbounded chat transcript.

### Exactly-once is usually a boundary illusion

Networks can lose responses after a successful write. Workers can crash between database commit and publishing an event. Design for **at-least-once delivery** and make external effects *effectively once* through idempotent commands, unique constraints, and reconciliation. A transactional outbox can atomically persist a state transition plus a pending notification in one database transaction; a worker can deliver it repeatedly while the consumer deduplicates by event ID. This is not magic global exactly-once: each external system still needs a defined protocol.

**Crash walk-through.** At `EXECUTING`, record key `K` and expected order version 12. Payment API commits refund under `K`, but the worker times out. On restart, the worker loads `UNKNOWN`, queries by `K`, obtains receipt `R`, persists `COMMITTED(R)`, verifies status, then tells the customer. It must not choose a *new* key because the previous attempt is uncertain. If no lookup API exists, stop and escalate instead of gambling on another write.

### Event sourcing, snapshots, and migrations

Event sourcing gives a replayable decision history (`FactsRead`, `ProposalCreated`, `ApprovalGranted`, `ActionCommitted`) and makes audits easier, but brings schema evolution, replay determinism, and privacy/deletion challenges. A simpler mutable row plus append-only audit events is often enough. Snapshots speed resume; events explain how a snapshot arose. Replay must not reissue side effects: reducers rebuild state, while effectors execute only newly authorized commands. Version both event payloads and reducers, test migrations on paused jobs, and make data deletion policy explicit (e.g., redact/remove payload references without silently rewriting the audit of a decision).

### Contracts for humans

A handoff is also an API: transmit authenticated identity status, intent, verified facts with source timestamps, attempted steps, committed effects/receipts, unresolved uncertainty, and why a human has authority. Never send a whole conversation as the only summary or mark an uncertain payment “failed.” Human approval flows need workload and quality metrics; overloaded reviewers become a new failure mode.

> **Exercise 6.** Two workers race to execute an approved address change. The order-service version increments from 12 to 13 between proposal and commit. Draw the compare-and-swap, approval-expiry, and conflict branches. Which artifact does the resumed job trust?

## 7. Retrieval, context engineering, and memory

Retrieval-augmented generation (RAG) makes external evidence available at inference time; it does not itself establish correctness or permissions. The original RAG research studied combining retrieval with generation for knowledge-intensive tasks ([paper](https://arxiv.org/abs/2005.11401)). A production pipeline adds data ownership, ACLs, freshness, versioning, citations, and evaluation.

### Ingestion: the quiet half of retrieval

```text
source connectors → snapshot/change feed → parse/OCR/table extraction → normalize
   → classify sensitivity + tenant ACL → segment/chunk → metadata + embeddings
   → lexical index + vector index → versioned publish → deletion/tombstone feed
```

Keep `source_id, source_version, tenant, ACL, valid_from/valid_to, ingested_at, parse_version, chunk_span, checksum, license/retention`. Parse failures are not “no relevant answer.” Preserve document hierarchy (title, headings, table headers, section numbers) so a chunk retains enough context to be meaningful. OCR and scanned PDFs introduce confidence and layout errors; a quoted number without the table's unit is dangerous. Index updates and ACL changes should have a bounded freshness SLO and tombstones; stale embeddings left behind after document deletion can be a privacy problem.

**Chunking choices.** Fixed token windows are cheap but split definitions and tables. Structure-aware chunks preserve sections but may be too large. Parent-child retrieval stores small searchable child spans and returns a larger authorized parent for context. Overlap improves boundary recall but increases index size and redundant evidence. Pick a few candidate strategies, label queries at the *passage* level, and compare recall, cost, and answer quality under the same context budget.

### Candidate generation, ranking, grounding

1. **Authorize first.** Derive tenant and entitlements from the authenticated request. Apply metadata filtering during retrieval; *again* verify permissions when fetching source text because indexes/ACLs can lag. Never use post-generation redaction as the only boundary.
2. **Generate candidates.** Lexical search (e.g., BM25) captures exact codes, names, and rare terms; dense retrieval captures paraphrases. Hybrid often improves coverage but increases complexity. For small corpora, direct lookup or full-document context may beat a vector service.
3. **Fuse and rerank.** Reciprocal rank fusion `RRF(d) = Σ_s 1/(k + rank_s(d))` combines ranked lists without assuming comparable raw scores. With `k=60`, a passage ranked 2nd lexical and 5th semantic scores `1/62 + 1/65 ≈ 0.0315`; a passage ranked 10th and 1st scores `1/70 + 1/61 ≈ 0.0307`. These are *ranking heuristics*, not probabilities of truth. A cross-encoder can rerank a small authorized set if latency budget permits.
4. **Assemble context.** Deduplicate near-identical passages, preserve source/version/span, set a token budget, and include conflicting evidence rather than silently picking a convenient clause. If a policy supersedes an old version, that rule comes from metadata/policy code, not semantic similarity.
5. **Generate and verify.** Require each material claim to map to an eligible passage or structured tool result. Resolve IDs server-side; check quote spans and contradiction. If evidence does not support the claim, abstain or request clarification. A displayed citation can itself be incorrect; check support, not only presence.

**Freshness counterexample.** A return-policy page is indexed at 09:00; a new policy becomes valid at 09:30; a refund is proposed at 09:35. Even perfect semantic retrieval over the old index is wrong for the action. Store policy effective times, retrieve by `as_of` for historical explanation, and have the action controller query the current authoritative policy before execution. For legal or financial evidence, distinguish *when the fact was true* from *when the system learned it* (valid time vs. transaction time).

### Measure the pipeline, not only the answer

`Recall@k = queries with ≥1 labeled relevant authorized passage in top k / eligible queries`; `Precision@k` measures concentration of relevant passages; MRR rewards early first hits; nDCG credits graded relevance across ranks. Also measure **permission violations, freshness misses, parse coverage, source attribution accuracy, answer faithfulness, abstention rate, and unsupported-claim severity**. If end-to-end answers fail, isolate whether the relevant evidence existed, was indexed, was retrieved, survived context assembly, was used correctly, or was made obsolete by a source update. Record segment-level slices: rare policy exceptions, scanned tables, multilingual queries, long documents, contradictory policies.

A retrieval set built from only easy questions will optimize for easy questions. Include *unanswerable* and adversarial queries, documents containing instruction-like text, and exact-match codes. Do not evaluate a new index using chunks that leaked from the answer labels into training or synthetic generation prompts.

### Memory is a policy, not a pile of messages

Keep three separate concepts: (1) current conversation turns (short-lived), (2) durable task state (validated facts and pending actions), and (3) optional user preferences (consented, scoped, editable, expirable). A model-generated summary is a hypothesis until reconciled with authoritative events. Never promote a web page's “remember this admin password” text to preference memory. Maintain a provenance link and deletion path for stored facts. Limit cross-session reuse by tenant and purpose.

> **Exercise 7.** Your retrieval system has 95% Recall@10 but customers still receive wrong cancellation dates. List four possible failures after retrieval and how you would measure each without replacing the model first.

## 8. Tool design and integration boundaries

A tool is a **capability-bearing API**. A precise tool schema and a short, discriminable description help the model select and populate it. The server still owns authority. Follow the principle that a tool exposes the smallest meaningful operation, neither a giant generic `execute_sql(sql)` nor hundreds of near-duplicate functions. [Writing effective tools for agents](https://www.anthropic.com/research/writing-tools-for-agents) emphasizes evaluating tools with agents, clear namespaces, and token-efficient outputs.

### Read tools versus effectful tools

A read tool should accept bounded filters, tenant/purpose from server context, pagination/limits, and return source IDs plus freshness and error status. A write tool additionally needs an authorization policy, precise target, precondition/version, idempotency key, approval binding where required, and receipt. “Dry run” must be a separate, verifiably side-effect-free operation. If a tool can change the world, classify the severity and design for a timeout after commit.

**Example of a dangerous interface:** `http_request(url, method, headers, body)` with broad credentials lets an indirect injection choose an attacker endpoint, smuggle data, and perform writes. Replace it with allowlisted typed operations (`get_order`, `propose_address_change`, `commit_approved_change`) executed with per-user scope and egress policy. Restrict output size to avoid flooding context; return explicit truncated/paginated metadata rather than silently discarding rows.

### Protocol standardization is not authorization

A shared protocol such as MCP can make tools discoverable and interoperable. It does not answer whether *this* caller may invoke *this* operation on *this* object. Validate untrusted tool descriptions and responses; isolate remote tool servers; approve installation; scope credentials; pin/version interfaces; audit calls. A tool catalog is an attack surface if a malicious server can change descriptions or impersonate a trusted name. Use product controls on top of any tool protocol.

### A secure dispatch sketch (language-agnostic pseudocode)

```text
on_tool_proposal(proposal, session):
    tool = allowlisted_tools[proposal.name]      # no arbitrary URL/function
    args = validate_schema(tool.version, proposal.arguments)
    principal = authenticated_session(session)   # never from model args
    authorize(principal, tool, args.target)       # real object + tenant lookup
    enforce_deadline_and_budget(session, tool)
    if tool.effects:
        verify_approval_for_exact_payload(principal, args, tool.policy_version)
        persist_intent_and_idempotency_key(session, args)
    result = tool.execute_with_scoped_credentials(args)
    validate_result_and_tenant(result, principal)
    persist_receipt_or_uncertain_state(result)
    return bounded_untrusted_observation(result)
```

This sketch omits transaction and failure handling that a concrete adapter must supply. `authorize` must check the *current* resource, not just the syntactic shape of an ID. A result with an error must not be rewritten as a success simply because the model “understood” it. Do not leak raw secrets into tool-result text.

### Useful tool evaluations

Measure whether the agent chooses the right tool, supplies arguments without fabricated identifiers, respects a “no tool” path, handles a tool error, and reaches a verified final state. Perturb tool descriptions, reorder results, add a malicious field to a retrieved page, and simulate slow responses. Count tool calls and bytes/tokens returned; performance problems can be interface problems rather than model problems. A smaller, better-designed tool surface can outperform a larger model with generic tools.

---
