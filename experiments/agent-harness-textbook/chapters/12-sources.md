# Part XII — Annotated sources and reading plan

## 12. Annotated sources and reading plan

<span id="ref-R1"></span>
- [R1] **ReAct: Synergizing Reasoning and Acting in Language Models** — Yao et al., ICLR 2023. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629). Read the trajectory format and the interaction between reasoning and environment observation; early template for the modern loop.
<span id="ref-R2"></span>
- [R2] **Toolformer: Language Models Can Teach Themselves to Use Tools** — Schick et al., NeurIPS 2023. [arXiv:2302.04761](https://arxiv.org/abs/2302.04761). Self-supervised API call insertion and selection; compare policy learned into weights with runtime-supplied tools.
<span id="ref-R3"></span>
- [R3] **WebGPT: Browser-assisted question-answering with human feedback** — Nakano et al., 2021. [arXiv:2112.09332](https://arxiv.org/abs/2112.09332). Browser interaction, demonstrations, comparisons, and reward modeling.
<span id="ref-R4"></span>
- [R4] **Training language models to follow instructions with human feedback (InstructGPT)** — Ouyang et al., NeurIPS 2022. [arXiv:2203.02155](https://arxiv.org/abs/2203.02155). The canonical SFT → preference model → PPO pipeline and alignment tradeoffs.
<span id="ref-R5"></span>
- [R5] **Constitutional AI: Harmlessness from AI Feedback** — Bai et al., 2022. [arXiv:2212.08073](https://arxiv.org/abs/2212.08073). Critique/revision and AI-generated preference data; inspect what is and is not established.
<span id="ref-R6"></span>
- [R6] **Direct Preference Optimization: Your Language Model is Secretly a Reward Model** — Rafailov et al., NeurIPS 2023. [arXiv:2305.18290](https://arxiv.org/abs/2305.18290). Preference optimization without explicit reward-model RL pipeline.
<span id="ref-R7"></span>
- [R7] **DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models** — Shao et al., 2024. [arXiv:2402.03300](https://arxiv.org/abs/2402.03300). GRPO formulation and verifiable-reward context; do not generalize math results automatically to open-world agents.
<span id="ref-R8"></span>
- [R8] **AgentTuning: Enabling Generalized Agent Abilities for LLMs** — Zeng et al., Findings of ACL 2024. [ACL Anthology](https://aclanthology.org/2024.findings-acl.181/). Hybrid training on agent trajectories and general instruction data.
<span id="ref-R9"></span>
- [R9] **Tool-R1: Sample-Efficient Reinforcement Learning for Agentic Tool Use** — 2025. [arXiv:2509.12867](https://arxiv.org/abs/2509.12867). An example of GRPO-style post-training for multi-step tool use; inspect task and verifier limits.
<span id="ref-R10"></span>
- [R10] **The Landscape of Agentic Reinforcement Learning for LLMs: A Survey** — 2025. [arXiv:2509.02547](https://arxiv.org/abs/2509.02547). Broad map of agentic-RL tasks, methods, and evaluation issues.

### 30. Benchmarks and empirical agent systems

<span id="ref-R11"></span>
- [R11] **SWE-bench: Can Language Models Resolve Real-World GitHub Issues?** — Jimenez et al., ICLR 2024. [arXiv:2310.06770](https://arxiv.org/abs/2310.06770). Real repo issue resolution and test-based grading.
<span id="ref-R12"></span>
- [R12] **SWE-bench Verified** — OpenAI, 2024. [announcement](https://openai.com/index/introducing-swe-bench-verified/). Curated subset and human validation; not a blanket guarantee of benchmark validity.
<span id="ref-R13"></span>
- [R13] **SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering** — Yang et al., NeurIPS 2024. [arXiv:2405.15793](https://arxiv.org/abs/2405.15793). ACI design and interface ablations; central source for agent-facing tools.
<span id="ref-R14"></span>
- [R14] **OpenHands: An Open Platform for AI Software Developers as Generalist Agents** — Wang et al., ICLR 2025. [arXiv:2407.16741](https://arxiv.org/abs/2407.16741). Open platform architecture, sandboxing, multiple agents, and benchmark suite.
<span id="ref-R15"></span>
- [R15] **The OpenHands Software Agent SDK: A Composable and Extensible Foundation for Production Agents** — 2025. [arXiv:2511.03690](https://arxiv.org/abs/2511.03690). Event-sourced state, typed action/execution/observation, and production components. Preprint; distinguish design claims from validated results.
<span id="ref-R16"></span>
- [R16] **WebArena: A Realistic Web Environment for Building Autonomous Agents** — Zhou et al., ICLR 2024. [arXiv:2307.13854](https://arxiv.org/abs/2307.13854). Self-hosted realistic web tasks and end-to-end evaluation.
<span id="ref-R17"></span>
- [R17] **τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains** — Yao et al., 2024. [arXiv:2406.12045](https://arxiv.org/abs/2406.12045). User simulation, APIs, policy following, and repeated-run consistency.
<span id="ref-R18"></span>
- [R18] **AgentBench: Evaluating LLMs as Agents** — Liu et al., ICLR 2024. [arXiv:2308.03688](https://arxiv.org/abs/2308.03688). Multi-environment interactive evaluation.
<span id="ref-R19"></span>
- [R19] **The Agent Company: Benchmarking LLM Agents on Consequential Real World Tasks** — 2024. [arXiv:2412.14161](https://arxiv.org/abs/2412.14161). Multi-step workplace tasks and environment interaction.
<span id="ref-R20"></span>
- [R20] **SWE-EVO: Benchmarking Coding Agents in Long-Horizon Software Evolution Scenarios** — 2025. [arXiv:2512.18470](https://arxiv.org/abs/2512.18470). Long-horizon evolution highlights gap between issue fix and sustained maintenance; preprint results are protocol-specific.
<span id="ref-R21"></span>
- [R21] **Inspect AI** — UK AI Security Institute. [GitHub](https://github.com/UKGovernmentBEIS/inspect_ai). Open evaluation framework with tasks, solvers, scorers, transcripts, and sandbox support.
<span id="ref-R22"></span>
- [R22] **Stop Comparing LLM Agents Without Disclosing the Harness** — 2026. [arXiv:2605.23950](https://arxiv.org/abs/2605.23950). Position paper on scaffold confounding; use the methodological argument, examine its experiments and scope.
<span id="ref-R23"></span>
- [R23] **Efficient Benchmarking of AI Agents** — 2026. [arXiv:2603.23749](https://arxiv.org/abs/2603.23749). Task-subset selection and rank preservation under scaffold shift.

### 31. Lab engineering posts and framework implementations

<span id="ref-R24"></span>
- [R24] **Anthropic — Building effective agents** — [research/engineering post](https://www.anthropic.com/research/building-effective-agents). Workflow patterns and when to use model-directed agents; post itself notes the ecosystem changes.
<span id="ref-R25"></span>
- [R25] **Anthropic — Effective context engineering for AI agents** — [engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). Context selection, retrieval, compaction, notes, and multi-agent patterns.
<span id="ref-R26"></span>
- [R26] **Anthropic — Writing effective tools for agents** — [engineering](https://www.anthropic.com/engineering/writing-tools-for-agents). Tool prototyping and evaluation methodology.
<span id="ref-R27"></span>
- [R27] **Anthropic — Effective harnesses for long-running agents** — [engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents). Initializer/coding agents and durable handoff artifacts.
<span id="ref-R28"></span>
- [R28] **Anthropic — Harness design for long-running application development** — [engineering](https://www.anthropic.com/engineering/harness-design-long-running-apps). Planner/generator/evaluator case study; note its scope and model-specific observations.
<span id="ref-R29"></span>
- [R29] **Anthropic — Scaling Managed Agents: Decoupling the brain from the hands** — [engineering](https://www.anthropic.com/engineering/managed-agents). Session, harness, sandbox boundaries and stable interfaces.
<span id="ref-R30"></span>
- [R30] **Anthropic Claude Agent SDK** — [Python repository](https://github.com/anthropics/claude-agent-sdk-python) · [TypeScript repository](https://github.com/anthropics/claude-agent-sdk-typescript). Inspect current docs and permission hooks; software surfaces change quickly.
<span id="ref-R31"></span>
- [R31] **OpenAI Agents SDK** — [Python repository](https://github.com/openai/openai-agents-python) · [docs](https://openai.github.io/openai-agents-python/). Agent/runner, tools, handoffs, guardrails, sessions, tracing.
<span id="ref-R32"></span>
- [R32] **OpenAI Harness engineering: leveraging Codex in an agent-first world** — [engineering post](https://openai.com/index/harness-engineering/). Company-reported agent-first development case study; primary source for its own claims.
<span id="ref-R33"></span>
- [R33] **OpenAI Unlocking the Codex harness: how we built the App Server** — [engineering post](https://openai.com/index/unlocking-the-codex-harness/). Client protocol, event stream, long-lived process, core threads.
<span id="ref-R34"></span>
- [R34] **OpenAI Codex CLI** — [GitHub](https://github.com/openai/codex). Open-source coding agent runtime; inspect source and license at time of use.
<span id="ref-R35"></span>
- [R35] **LangGraph** — [GitHub](https://github.com/langchain-ai/langgraph) · [conceptual docs](https://docs.langchain.com/oss/python/langgraph/overview). Stateful graph orchestration, checkpointing, interrupts, and resumability.
<span id="ref-R36"></span>
- [R36] **Model Context Protocol specification** — [spec](https://modelcontextprotocol.io/specification/2025-06-18). Tool/resource interoperability protocol; not a trust or authorization model.
<span id="ref-R37"></span>
- [R37] **Aider** — [GitHub](https://github.com/Aider-AI/aider). Open-source coding assistant with repository and git-centered workflow.
<span id="ref-R38"></span>
- [R38] **Hugging Face smolagents** — [GitHub](https://github.com/huggingface/smolagents). Minimal agent framework with code-agent patterns.

<span id="ref-R45"></span>
- [R45] **CrewAI** — [GitHub](https://github.com/crewAIInc/crewAI). Open-source framework with role/task-oriented Crews and event-driven Flows; inspect the live repository for current API and feature scope.
<span id="ref-R46"></span>
- [R46] **Google Agent Development Kit (ADK)** — [GitHub](https://github.com/google/adk-python). Code-first framework for building, evaluating, and deploying agents; version-sensitive APIs, so pin the evaluated release.
<span id="ref-R47"></span>
- [R47] **Microsoft Agent Framework** — [GitHub](https://github.com/microsoft/agent-framework). Open-source agent and workflow framework with Python/.NET support and migration paths from AutoGen and Semantic Kernel.
<span id="ref-R48"></span>
- [R48] **PydanticAI** — [GitHub](https://github.com/pydantic/pydantic-ai). Typed, provider-flexible agent loop and structured-output validation; do not confuse type correctness with policy correctness.

### 32. Thinking Machines Lab: post-training, inference, interaction

<span id="ref-R39"></span>
- [R39] **Announcing Tinker** — Thinking Machines Lab, 2025. [post](https://thinkingmachines.ai/blog/announcing-tinker/). Flexible fine-tuning API and cookbook orientation.
<span id="ref-R40"></span>
- [R40] **On-policy distillation** — Thinking Machines Lab, 2025. [post](https://thinkingmachines.ai/blog/on-policy-distillation/). Student-generated state distribution and teacher supervision; reproduce the recipe before generalizing.
<span id="ref-R41"></span>
- [R41] **LoRA Without Regret** — Thinking Machines Lab, 2025. [post](https://thinkingmachines.ai/blog/lora/). Empirical low-regret regime for PEFT versus full fine-tuning.
<span id="ref-R42"></span>
- [R42] **Defeating Nondeterminism in LLM Inference** — Thinking Machines Lab, 2025. [post](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/). Inference reproducibility as a prerequisite for meaningful experiments.
<span id="ref-R43"></span>
- [R43] **Interaction Models: A Scalable Approach to Human-AI Collaboration** — Thinking Machines Lab, 2026. [post](https://thinkingmachines.ai/blog/interaction-models/). Public argument for more native, continuous multimodal interaction and reduced reliance on wrapper heuristics in some settings.
<span id="ref-R44"></span>
- [R44] **The Future Worth Building Is Human** — Thinking Machines Lab, 2026. [post](https://thinkingmachines.ai/blog/the-future-worth-building-is-human/). Lab's public framing of human judgment, model customization, and interaction.

### 33. Further reading order

**First weekend:** ReAct → Toolformer → SWE-agent → OpenHands → Anthropic effective agents → Anthropic context engineering. **Then evaluation:** SWE-bench → WebArena → τ-bench → scaffold-comparison position paper → Inspect AI. **Then model training:** InstructGPT → DPO → Constitutional AI → AgentTuning → GRPO/Tool-R1 → Thinking Machines on-policy distillation. **Then code:** read one implementation end-to-end (LangGraph for explicit transitions, OpenHands for platform boundaries, or Codex/Claude tooling for coding-agent execution). For each paper, write the task, intervention, baseline, metric, and strongest caveat in five lines.

**What would change my mind:** If primary sources available by the snapshot date materially changed the taxonomy or demonstrated a better-supported framework, this reading list should be updated. Treat it as a curated starting library, not exhaustive coverage; verify versions and claims from original sources before interviews.
