# Part IV — Tools, action interfaces, and context

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
