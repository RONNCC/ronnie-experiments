# Part V — Runtime, safety, and security

## 5. Runtime, safety, and security

If a model can read files, run shell commands, browse websites, send messages, or modify customer data, the harness is an authority boundary. Model intent is not an authorization decision. A safe system assumes the policy may be mistaken, the prompt may be attacked, tool output may be malicious, and a process may fail halfway through an operation.

Use least privilege per task: read-only before write; project-scoped file access; short-lived credentials; allowlisted network egress; no production secrets in untrusted execution; explicit approval for high-impact actions; audit logs that capture actor, proposed action, policy decision, target, result, and correlation ID. A container is one isolation primitive, not a complete security proof. Shared kernels, mounted host files, network access, persistent volumes, and exposed credentials can all defeat the intended boundary.

### Threat model for tool-using models

- **Prompt injection:** untrusted documents, webpages, or tool results contain instructions to override policy or exfiltrate data. Treat them as data, preserve provenance, and authorize at the runtime boundary rather than trusting model interpretation alone.
- **Confused deputy:** the agent has credentials or permissions broader than the user's request. Bind capabilities to user, task, target, and time.
- **Exfiltration:** a model can move sensitive context through a permitted output channel or network-enabled tool. Use data minimization, egress controls, and content-aware review where appropriate.
- **Unsafe action / repetition:** an action is destructive, non-idempotent, or repeated after timeout. Use staged writes, dry-run, idempotency keys, confirmation, and reconciliation.
- **State poisoning:** false or hostile content is persisted into memory, repo guidance, or a future session. Separate trusted policy from agent notes; make writes reviewable and attributable.
- **Resource exhaustion:** tool loops, enormous context, or recursive delegation consume unbounded tokens, compute, or money. Enforce per-run budgets and depth/concurrency limits outside the model.

### Human-in-the-loop is a protocol

An approval prompt is useful only if the person sees a concise description of the action, target, impact, evidence, and a meaningful deny/edit option. Approval must bind to the exact action payload, not a broad task that later mutates. Define expiry, escalation, and behavior on no response. Measure approval latency and override rate; if every request is rubber-stamped, the control may be theater.

Frameworks expose different safety surfaces. OpenAI's Agents SDK includes guardrails, handoffs, and tracing primitives [[R31](#ref-R31)]. The Claude Agent SDK (formerly Claude Code SDK in public materials) exposes a programmable coding-agent loop and permission/hook mechanisms, while Claude Managed Agents describes separation of harness, session, and sandbox [[R30](#ref-R30), [R29](#ref-R29)]. OpenHands emphasizes isolated workspaces and extensible execution [[R14](#ref-R14), [R15](#ref-R15)]. These are capabilities and design affordances, not proof of an application's security posture. Teams still need threat modeling and operational testing.

**What would change my mind:** If tool-use agents could be made robustly safe by model behavior alone, without runtime authority limits, identity binding, or recovery controls, I would demote the harness's security role. Public guidance from labs and standard security engineering suggest layered controls remain necessary.
