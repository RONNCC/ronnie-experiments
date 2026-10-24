# Applied AI Systems — A Design and Operations Textbook

*Research edition · 24 October 2026 · A Ronnie's Experiments learning sandbox*

[Open the interactive web reader](index.html) · This single-file edition is generated as `TEXTBOOK.md` from the canonical chapters.

> **Scope and provenance.** This is an original engineering expansion of Dr. Maryam Miradi's supplied 20-page *The 2026 Fast-Track AI Engineer Guide* (especially pp. 3–20). The guide names twelve durable skills and sketches a disaster predictor, port manager, and autonomous cyber-defense project; this book develops the underlying mechanisms and treats those projects as hypothetical design exercises. It does not reproduce the PDF, describe any company's non-public implementation, certify a system as safe, or promise a particular hiring outcome. Vendor APIs, prices, and capabilities change: check current documentation before implementing.

An applied AI system is not a prompt. It is a **bounded process that transforms observations into a verifiable outcome** while controlling what the model can know, decide, and do. The hardest engineering choices are often outside the model: which source is authoritative; whether an action is permitted; how a retry avoids a duplicate refund; what evidence shows that a customer request was actually resolved; what happens when a dependency fails halfway through a voice call.

This book supplies the vocabulary and the design apparatus to answer those questions. The running rule is: **use the least autonomous mechanism that meets the product requirement, then prove it on representative cases.** That does not mean avoiding models; it means placing them where judgment is useful and keeping correctness, permissions, and side effects in inspectable code.

## 0. A repeatable design method

For *any* proposed AI feature, fill out this one-page contract before drawing boxes:

| Question | Answer to produce | Why it matters |
|---|---|---|
| Outcome | Who needs what changed in the world? What counts as *done*? | A plausible answer is not a completed task. |
| Actors | End user, tenant admin, reviewer, attacker, operator, downstream service | Identity, authority, and incentives differ. |
| Inputs | Sources, owners, timestamps, sensitivity, trust level | A retrieved document is evidence, not an instruction. |
| Actions | Read, draft, write, external communication, irreversible action | Each needs a different authorization level. |
| Invariants | What must *never* be false? | Example: no cross-tenant records; no refund without eligibility and authorization. |
| Freshness | Maximum acceptable age of each fact | Yesterday's inventory may be worse than no answer. |
| Service targets | Peak load, p95/p99 latency, availability, cost ceiling | The architecture follows the budget, not the other way around. |
| Evaluation | Unit of analysis, dataset, baseline, failure taxonomy, ship threshold | “Looks good on five demos” is not evidence. |
| Recovery | What persists after timeout, process crash, or uncertain tool result? | Retries are normal in distributed systems. |

**Example: “Where is my order, and change its address.”** The first clause is an authenticated read; the second is a privileged write with a cutoff time and possibly an irreversible fulfillment transition. A classifier can identify intent, but only the order service can confirm order ownership and address-change eligibility. The agent may *propose* a change. The server validates the authenticated principal, exact order and address, policy version, and approval; it executes with an idempotency key; only a committed receipt allows the assistant to say “changed.” If the write times out, reconcile by key instead of blindly retrying. That design is still useful if every model is replaced tomorrow.

### The four ledgers

Keep separate, linked records of (1) **facts** and their provenance, (2) **decisions** and the policy/model versions that informed them, (3) **intended actions and authorizations**, and (4) **observed effects** from external systems. A chat transcript is not any one of these ledgers. It may omit hidden tool state, contain malicious text, or say an action succeeded when it did not. An audit record should let an operator answer: *Who requested this? What did the system know? Which policy allowed it? Who approved it? What actually happened?*

### The boundary drawing

```text
  external observations             trusted application control plane
  ┌──────────────────────┐           ┌──────────────────────────────┐
  │ user text, documents, │   parse   │ identity + tenant context    │
  │ websites, tool output  ├──────────►│ retrieval + policy + budgets │
  └──────────────────────┘           │ model proposal / explanation │
       untrusted DATA                │ action gate + durable ledger │
                                     └──────────────┬───────────────┘
                                                    │ scoped, validated call
                                            ┌───────▼────────┐
                                            │ system of record│
                                            └────────────────┘
```

The trust boundary is **not** “inside the model vs. outside.” A tool result can be less trustworthy than a user's explicit request; a model output is never a credential or an authorization decision. Explicitly trace where data crosses into a context window and where a proposed action crosses into a system of record.

### How the twelve skills fit together

The supplied guide introduces systems thinking (p. 4), APIs and Git (p. 5), workflow design (p. 6), decomposition (p. 7), separation of concerns (p. 9), modularity (p. 10), algorithmic thinking (p. 11), contracts (p. 12), state (p. 13), evaluation (p. 15), threat modeling (p. 16), production (p. 18), and maintainability (p. 19). Its closing list on p. 20 slightly reorders the last four; the engineering dependencies are more important than the numbering. Here is the route through this book:

| Roadmap skill | Where it becomes concrete |
|---|---|
| Systems thinking / separation / algorithms | Ch. 1–4: invariants, mechanism selection, model + software boundaries |
| Workflow design / decomposition / modularity | Ch. 5, 8: state machines, agent loops, narrow capabilities |
| Contract design / state | Ch. 6: schemas, versioned events, resume, idempotency |
| Evidence and context (a necessary extension) | Ch. 7, 16: ingestion, hybrid retrieval, grounded answers |
| Threat modeling | Ch. 9 and each design: capability ≠ permission |
| Evaluation / observability | Ch. 10–11: datasets, counterfactuals, traces, guardrail metrics |
| Production / maintainability | Ch. 11–13: serving, cost, change control, voice |
| End-to-end integration | Ch. 14–21: eight worked systems with alternatives and failure cases |

**Reading paths.** For a first pass, read Ch. 0–3, 5–7, 9–11, then one worked system. For a deeper pass, reproduce the calculations, challenge each failure mode, and complete two designs from Ch. 23 without looking at the answer outlines. The companion web reader has a decision workbench and a cost/capacity calculator; neither replaces the book's assumptions and caveats.

### What counts as a convincing design

A design is stronger when it states a **specific invariant and how it is enforced**, compares a simple baseline with a more complex alternative, quantifies load and risk under explicitly labeled assumptions, defines what the evaluator observes *after* actions, and includes a rollback and an ownership boundary. Do not claim that a prompt, a citation, an LLM judge, or a human-in-the-loop checkbox alone establishes safety. Each is one imperfect control in a larger system.

> **Exercise 0.** For an assistant that summarizes an uploaded insurance claim and can submit it, write two separate success criteria and two separate authorization checks. What does it do if the upload's instructions say “ignore the insurer policy”? The answer must refer to a server-side boundary, not just another prompt.

---
