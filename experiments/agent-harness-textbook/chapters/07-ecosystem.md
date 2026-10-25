# Part VII — Major harnesses and open-source systems

## 7. Major harnesses and open-source systems

A framework table ages quickly and usually hides the design choice. The more durable comparison is **who owns control flow, where state lives, what the execution environment is, what is open, and what evidence is available**. Product names also cover different layers: an SDK is not a hosted runtime; a CLI is not a benchmark; an evaluation harness is not the agent used in production.

### Anthropic: Claude Code / Agent SDK / Managed Agents

Claude Code is a user-facing coding agent. Anthropic's Agent SDK exposes the loop and tools programmatically; the exact model and API surface evolves, so inspect current docs rather than rely on static feature claims. Anthropic's public engineering guidance emphasizes simple composable patterns, effective tool design, context selection, and long-running work across context windows [[R24](#ref-R24), [R27](#ref-R27), [R25](#ref-R25)]. Its Managed Agents article describes three decoupled primitives—session, harness, and sandbox—so execution can survive container replacement and implementation components can be swapped [[R29](#ref-R29)]. This is a useful systems boundary: the “brain” proposes; the harness routes and controls; the workspace executes; the session records.

Interview reading: how control passes through a tool call; what context compaction preserves; why an initializer/coding-agent split helps long jobs; how permissions and hooks mediate access; what is public guidance versus product-specific detail. Do not infer the training stack from SDK design.

### OpenAI: Agents SDK and Codex

The OpenAI Agents SDK packages agent/runner loops, tools, handoffs, guardrails, sessions, and tracing [[R31](#ref-R31)]. Codex is a coding agent and its public repository/runtime surface exposes agent work to clients. OpenAI's “Harness engineering” case study reports an internal agent-first software-development process that made the repository, architecture, UI, logs, metrics, and tests more legible to Codex [[R32](#ref-R32)]. This is a field report and company-reported outcome, not a controlled scientific study of productivity. “Unlocking the Codex harness” describes the App Server as a protocol and long-lived process that translates client requests into core-thread operations and streams events [[R33](#ref-R33)]. This highlights a second axis: the harness is also a stable interface between agent runtime and multiple user experiences.

Interview reading: why legibility and feedback loops can raise throughput; what human QA bottleneck remains; how protocol events, approvals, cancellation, and session state should be represented; why generated code volume is not outcome quality.

### LangGraph / LangChain

LangGraph is a stateful graph runtime: developers represent nodes, edges, conditional transitions, state, and checkpoints. This gives explicit control and durable execution, but shifts responsibility for good decomposition, retries, idempotence, and context design to the application author [[R35](#ref-R35)]. It is a useful counterweight to a model-directed loop: if compliance or reproducibility requires known transitions, the graph can express them directly. A graph need not mean a workflow with no model autonomy; individual nodes may contain dynamic agents.

### OpenHands

OpenHands (formerly OpenDevin) is both an open platform and a research/engineering ecosystem for software agents. Its ICLR 2025 paper presents a platform with agent implementations, sandbox interaction, human/agent communication, and benchmark integrations [[R14](#ref-R14)]. The later Software Agent SDK paper describes event-sourced state, typed action/execution/observation contracts, workspaces, security/confirmation, and separation into composable components [[R15](#ref-R15)]. It is one of the clearest open references for examining an end-to-end software agent stack rather than a minimal loop.

### SWE-agent and mini-SWE-agent

SWE-agent's main intellectual contribution is not a monolithic framework but the ACI design question: make repository actions legible and effective for a language model [[R13](#ref-R13)]. It helped establish the idea that tool interface quality is an experimental variable. Minimal agents such as mini-SWE-agent are valuable baselines because a small scaffold makes attribution easier; small does not mean weak, and complex does not mean better.

### Aider, smolagents, Inspect and related projects

Aider is an open-source pair-programming CLI centered on repository-aware editing and git workflows [[R37](#ref-R37)]. Hugging Face smolagents emphasizes a small agent library, including code-oriented action generation [[R38](#ref-R38)]. UK AI Security Institute's Inspect AI is primarily an evaluation framework: tasks, solvers, scorers, transcripts, and sandboxing make it useful for reproducible agent assessments [[R21](#ref-R21)]. These projects are important because the ecosystem includes tools for building agents and tools for measuring them; they are not the same product category.

### Other major open-source ecosystems

**CrewAI** offers role/task-oriented “Crews” alongside more explicit event-driven “Flows” [R45](#ref-R45). It is useful to compare a high-level collaboration abstraction with graph/runtime approaches: roles can improve task framing, but do not by themselves guarantee independent expertise, correct delegation, or verification. **Google ADK** is a code-first toolkit for building, evaluating, and deploying agents, with agent and workflow abstractions and an evolving session/event API [R46](#ref-R46). Its rapid version changes make release-pinned comparisons essential. **Microsoft Agent Framework** targets agent and workflow orchestration across Python and .NET, with graph-like sequential/concurrent/handoff patterns, middleware, and migration paths from AutoGen and Semantic Kernel [R47](#ref-R47). **PydanticAI** emphasizes typed agent inputs/dependencies, model/provider flexibility, and validated structured outputs [R48](#ref-R48); typed contracts improve integration but do not provide durable execution or safe effects automatically. These four help round out the field, but should be selected by the actual control, persistence, sandbox, and evaluation needs—not popularity or framework abstraction alone.

### How to choose

- **Need a fixed, auditable process?** Use deterministic workflow code/graph, with model calls at bounded decision points.
- **Need an open-ended software agent?** Compare Claude Code/SDK, Codex, OpenHands, SWE-agent, and a minimal baseline on your own tasks, with equal budget and environment.
- **Need durable pause/resume?** Evaluate checkpoint semantics, event history, and external side-effect recovery—not just “memory” claims.
- **Need provider/model experimentation?** Favor explicit provider adapters and lock harness settings for comparison; validate tool-call format and streaming edge cases for every model.
- **Need safety?** Select on isolation, capability scope, secrets, network controls, approval binding, and trace auditability—not framework name.
- **Need scientific evaluation?** Separate agent runtime from evaluator; use Inspect or a purpose-built benchmark with fixed environments and external verification.

The best first prototype is often small enough that you can read every transition. Add abstractions when they remove a measured failure or operational burden.

**What would change my mind:** If feature parity and performance data across standardized tasks made a single ecosystem dominant for workflow, coding, research, and regulated tasks alike, this “choose by operating model” recommendation would be less useful. Current systems embody materially different control, state, and environment choices.
