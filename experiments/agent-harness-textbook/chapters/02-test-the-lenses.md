# Part II — Test the perspectives against evidence

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
