# Agent Harnesses — A Systems Textbook for Frontier-AI Interviews

*Research edition · 25 October 2026 · A Ronnie's Experiments learning sandbox*

[Open the interactive web reader](index.html) · This single-file edition is generated as `TEXTBOOK.md` from the canonical chapters.

> **Scope and evidence.** This is an original synthesis of public papers, documentation, open-source implementations, and lab engineering posts. “Harness” has no universally accepted boundary; this book states its working definition rather than pretending the term is settled. Public descriptions do not reveal private training stacks or internal production systems. Any benchmark result is attributed to its original protocol; figures across papers are not directly comparable. The interview material is a study guide, not inside knowledge about Anthropic, Thinking Machines, or any hiring process. Snapshot date: 25 October 2026.

## 0. Start with a better question

“Which agent framework is best?” is almost always the wrong interview question. It confounds at least four things: the model, the interface and tools it sees, the runtime that executes its choices, and the environment in which success is measured. A system can appear smarter because it has better tools, more attempts, a hidden oracle, a cleaner benchmark adapter, a larger context, or more permissive authority. Conversely, a weak-looking model may be paired with a harness that exposes useful state and lets it recover.

The more fruitful question is: **what decision authority should be given to the model, what feedback should the system return, and what state must survive for this task to finish safely?** That question connects agent systems to model development. Pretraining creates general representations and next-token competence; supervised and preference post-training shape response and tool-use policies; reinforcement learning can optimize behavior against a reward or verifier; the harness then supplies actions, observations, constraints, and persistence at inference time. These components are not competitors. They are coupled parts of a deployed policy.

### The working definition

In this book, an **agent harness** is the runtime and surrounding design that repeatedly turns a model's proposed next action into an observation and a new decision, while governing context, execution, authority, persistence, and stopping. A wrapper that makes one model call is not necessarily a harness. A durable graph that includes model decisions may be. An evaluation harness is different: it standardizes tasks, environments, scoring, and rollouts so systems can be compared. In practice the terms overlap, so always ask which layer a speaker means.

A useful loop is:

`goal + policy + state → construct context → model decision → validate / authorize → execute → observe → update state → continue, ask, or stop`

The model may choose a tool or subgoal; the code should usually own identity, permissions, budgets, invariants, persistence, and irreversible side effects. This split is a design choice, not a law. In a fixed workflow, code owns most control flow; in an open-ended coding agent, the model chooses many next steps. Most useful systems live between those extremes.

### Why interviewers care

A frontier-model interview can move quickly from “How would you build an agent?” to “What does pretraining need to teach for this tool policy to work?”, “How do you distinguish model failure from harness failure?”, “How do you keep RL from rewarding a benchmark exploit?”, or “What evidence tells you the system is reliable across repeated runs?” A strong answer connects levels: representation and tokenization; supervised demonstrations and preference data; reward design and policy optimization; tool/API affordances; execution and safety; measurement and statistical uncertainty.

This book develops three candidate perspectives, tests them against research and code, then refines them into a practical model. It analyzes major proprietary and open implementations without treating marketing claims as controlled experiments. Every chapter ends with a specific observation that would change the argument.

**What would change my mind:** If “harness” acquired a stable, widely adopted formal definition that cleanly separated it from model, application, runtime, and evaluator, I would replace this operational definition. Until then, a declared boundary is more useful than a false consensus.
