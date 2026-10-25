# Part III — Refine the model

## 3. Refine the model

A deployed agent can be modeled as a policy that acts in a partially observed environment. At step *t*, the environment has state *sₜ*; the agent receives an observation *oₜ* and context *cₜ*, samples an action *aₜ* from its policy, and the runtime executes an admissible version of that action. The environment changes and returns a new observation. The harness determines which observations are surfaced, which actions are expressible, which actions are permitted, how state is retained, and when the loop stops.

This lens gives a refined four-part model:

1. **Policy and authority:** who proposes, validates, approves, and executes an action? Name the boundary for each tool, especially irreversible or externally visible writes.
2. **Information and feedback:** what evidence is observable, at what fidelity and latency? Which signals are observations, and which are actual outcome checks?
3. **State and recovery:** which state is authoritative, durable, replayable, summarized, or disposable? What happens after timeout, process death, context exhaustion, or partial success?
4. **Budgets and evidence:** what are the limits on tokens, calls, time, concurrency, and human review, and what experiment demonstrates the system meets its target?

The first three are the candidate perspectives; the fourth is the meta-perspective that lets us test whether the design works at all. Safety and security are not a “fifth component”: they are invariants applied across all four. A permission boundary is authority; audit logs are state and evidence; injection resistance is information integrity; a review threshold is budget and governance.

### A reliability calculation: the compounding trap

If a task needs *n* sequential actions and each action succeeds independently with probability *p*, then an optimistic estimate of all-actions success is *pⁿ*. At *p* = 0.98 across 50 actions, this is about 36.4%; at 0.995 it is about 77.8%. The independence assumption is usually false—errors cluster, actions differ in difficulty, and retries may be dependent—so this is an intuition pump, not a real prediction. But it explains why a strong one-step tool-call benchmark can coexist with disappointing long-horizon completion.

A verifier, retry, or human handoff changes this calculation only if it catches failures early enough and the recovery action is effective. Re-running the same stochastic plan without new information may simply repeat the same failure. The correct metric is not “number of retries”; it is probability of reaching a verified goal under a cost, latency, and risk budget.

### The causal question: model or harness?

Represent performance as *Y = f(M, H, E, T, B)* where *M* is model, *H* harness configuration, *E* environment, *T* task, and *B* budget. A single score cannot identify these factors. For causal attribution, hold as much fixed as possible; factorially vary model and harness; run multiple seeds; report environment and budget; inspect per-task outcomes and traces. If a better harness changes success at fixed model, that is a harness effect under that evaluation. It does not establish that the new harness generalizes, nor that the model is unchanged in behavior across interfaces.

### 10. The mechanism stack from pretraining to deployment

**Pretraining** optimizes next-token prediction over a data distribution. It gives broad language, code, world, and latent procedural patterns; it does not guarantee a model will reliably emit a valid tool call, obey a schema, recover from an API error, or satisfy a business invariant. Tool calls represented as structured tokens or text require a tokenizer/model interface and runtime that agree on serialization.

**Supervised fine-tuning (SFT)** can teach desired forms: choose a tool, emit arguments, incorporate results, and stop. But imitation learns only from the data distribution. If demonstrations omit timeouts, partial failures, malicious tool output, or ambiguity, the policy may not handle them. AgentTuning's hybrid instruction tuning is one published example of combining agent interaction trajectories with general instructions to improve agent capability while preserving broader behavior [[R8](#ref-R8)]. The point is methodological, not that one dataset recipe solves generalization.

**Preference optimization and RL** change behavior against comparisons or rewards. DPO trains from preference pairs without the classic separate reward-model-plus-PPO pipeline [[R6](#ref-R6)]. RLHF includes a learned reward model and policy optimization; RLAIF uses AI-generated critiques or preferences (Anthropic's Constitutional AI is a notable method) [[R5](#ref-R5)]. RL with verifiable rewards (RLVR) can optimize outcomes such as tests or exact answers when the verifier is valid. Tool use makes the action space sequential: rewards can depend on tool choices, environment state, interaction cost, and successful completion, not only final text. A sparse terminal reward can make credit assignment hard; a dense proxy can be gamed.

**Inference-time harnessing** shapes a model's effective policy without changing weights: context, tools, routing, permissions, retries, search breadth, and stopping rules. Harness behavior can mimic a capability increase, but only within a particular affordance and evaluation. If post-training was done with a particular tool schema, swapping to an awkward interface creates distribution shift. Conversely, a runtime can make a capability accessible that the model already had but could not reliably express unaided.

### Three coupled loops

- **Training loop:** collect tasks/trajectories → optimize policy → evaluate holdouts → revise data/reward/model.
- **Agent loop:** construct context → propose action → enforce policy → act → observe → verify/continue.
- **Engineering loop:** run evals → inspect failures → change model, tools, prompts, environment, or evaluator → rerun controlled comparisons.

A mature team keeps their artifacts separate enough to know what changed, but connected enough that failure analysis can improve training, runtime, and task design. A harness is also an experimental apparatus: it shapes what behavior can be expressed and what behavior gets measured.

**What would change my mind:** If model-only changes reliably predicted deployed performance across new tool interfaces, environments, budgets, and repeated runs, with negligible scaffold interaction, the coupled-policy view would be overstated. Current benchmark and system studies caution against that simplification.
