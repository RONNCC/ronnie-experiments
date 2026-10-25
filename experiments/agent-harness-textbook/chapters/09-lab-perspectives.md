# Part IX — A cross-lab reading of public work

## 9. A cross-lab reading of public work

Read Anthropic's public material as a sequence of engineering questions, not a complete blueprint. “Building effective agents” distinguishes fixed workflows from model-directed agents and recommends starting with the simplest sufficient pattern [[R24](#ref-R24)]. “Effective context engineering” asks how to curate system instructions, tools, history, and retrieved information across multiple turns [[R25](#ref-R25)]. “Writing effective tools for agents” frames tool development as prototype → evaluate → improve and emphasizes realistic evaluations of tool use [[R26](#ref-R26)]. “Effective harnesses for long-running agents” tackles cross-window handoff with an initializer and incremental coding sessions [[R27](#ref-R27)]. “Harness design for long-running application development” reports a planner/generator/evaluator approach for application tasks [[R28](#ref-R28)]. “Scaling Managed Agents” separates session, harness, and sandbox [[R29](#ref-R29)].

**Four observations:** (1) capability is expressed through the model-context-tool interaction, not prompt wording alone; (2) context is an actively managed resource; (3) long tasks need explicit progress and completion contracts; (4) runtime control and execution environment should be separable. The update from two-agent to planner/generator/evaluator is evidence that harnesses evolve in response to model limitations and task requirements; it is not a reason to impose three agents everywhere.

**Interview connection:** discuss how an initializer could produce a testable feature contract; how a fresh evaluator prevents the generator from marking itself done; when reusing context is better than resetting; and which limits must remain code-enforced. Ask how better post-training might eliminate some scaffolding—and what policy guarantees still belong in the runtime.

### 20. OpenAI: legible environments, client protocols, and agent-first engineering

OpenAI's 2026 harness-engineering writeup reports building an internal product with agents and describes repository guidance, CI, architecture constraints, direct UI validation, logs, metrics, traces, and agent-readable documentation [[R32](#ref-R32)]. The compelling conceptual claim is that engineering effort shifts toward making requirements and feedback legible to an agent. The quantitative productivity claims are company-reported and not a randomized comparison; treat them as case-study evidence.

The Codex App Server post presents a stable event/protocol layer connecting clients to long-running agent threads [[R33](#ref-R33)]. That approach highlights product-level concerns often absent from the “LLM + while loop” diagram: streaming updates, approval requests, cancellation, thread IDs, multiple clients, and UI consistency. The harness is both the runtime and an API surface for humans and software clients.

**Interview connection:** distinguish code-structure tests from behavior tests; explain why direct UI and telemetry access can turn QA into feedback available to agents; identify the human-review bottleneck; challenge LOC/PR throughput as incomplete value metrics; and propose guardrails against self-review loops converging on shared mistakes.

### 21. Thinking Machines: interaction design and training systems

Thinking Machines' public work is not primarily a published agent-harness framework. Its most useful connection is between training and interaction. Tinker exposes flexible post-training primitives [[R39](#ref-R39)]. On-policy distillation uses student rollouts as the state distribution for teacher supervision [[R40](#ref-R40)]. The interaction-models essay argues for models that can communicate in richer, more continuous ways, reducing dependence on brittle external turn-detection scaffolding in certain voice/multimodal settings [[R43](#ref-R43)]. This is a provocative hypothesis about moving capability from wrapper logic into learned interaction behavior; it is not evidence that all harnesses should disappear.

The important tension: external harnesses provide explicit, inspectable control and safety boundaries; learned interaction models may reduce latency and awkward turn-taking by internalizing capabilities. A system can combine both: model-native turn-taking and multimodal understanding, with external authorization, state, and emergency stop controls. Inference design and post-training data determine which behaviors are intrinsic versus runtime-managed.

**Interview connection:** explain how on-policy data changes the distribution of training states; why teacher targets on student trajectories may improve robustness; how to evaluate full fine-tuning versus LoRA without only checking task reward; and which real-time interaction behaviors should be learned versus enforced by software.

### 22. Synthesis: what the public record supports—and what it does not

Across Anthropic, OpenAI, and Thinking Machines public sources, the recurring agenda is not simply “build more agents.” It is to improve the interface between model and world: context assembly, tool action contracts, persistent state, observability, training data, and richer human interaction. The labs foreground different emphases in public material, but those emphases are not exclusive and do not reveal private implementation details.

The strongest synthesis is **co-design**. The model should be trained to make useful, calibrated decisions in the interface it will encounter; the harness should express capabilities and limits clearly; the environment should return honest observations; independent evaluators should check outcomes; and failure traces should feed a controlled improvement process. More model competence can simplify the harness, but should not silently erase security, transaction, or accountability boundaries.

**What would change my mind:** If public evidence showed that a single lab's documented harness architecture dominated across all modalities, tasks, risk regimes, and training setups, I would present it as the central reference. The public record instead shows several different layers and evolving solutions.
