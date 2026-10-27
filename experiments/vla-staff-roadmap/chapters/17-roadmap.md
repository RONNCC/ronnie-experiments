## 17. A 36-week roadmap with exit gates

This sequence is for an experienced software or ML engineer spending roughly 12–15 focused hours per week. It is not a zero-to-staff guarantee. Beginners should add a prerequisite phase; people with full-time study time can compress the calendar but not the need for independent failures, repeated experiments, and physical validation.

### If you need prerequisites

Spend 16–24 additional weeks, or longer as needed, building four foundations:

1. **Python and engineering:** typed functions, tests, Git, debugging, Linux, packaging, profiling, and small CLI tools.
2. **Math:** vectors and matrices, gradients, probability distributions, expectations, confidence intervals, coordinate transforms, and rotations.
3. **Deep learning:** implement and train MLPs, CNNs, and a small transformer in PyTorch; understand optimization, regularization, and split discipline.
4. **Robotics basics:** kinematics, joint versus Cartesian control, frames, sensors, feedback control, and one simulator.

Exit when you can independently train and evaluate a small supervised model and explain every tensor and split. Do not use the calendar to override that gate.

### The experienced-engineer sequence

| Weeks | Study and build | Exit gate |
|---|---|---|
| 1–2 | Chapters 0–2; baseline audit; environment and data setup | One-page thesis, working test setup, decoded demonstration episodes, action contract |
| 3–5 | Project 1; Chapters 8 and 11 as needed | Reproducible BC baseline with closed-loop evaluation and failure analysis |
| 6–9 | Project 2; Chapters 6–7 | Two-source trajectory foundry, quality tests, versioned manifests, measured loader |
| 10–15 | Project 3; Chapters 3–5 | TinyVLA modality and action-head comparisons with repeated online results |
| 16–19 | Project 4; Chapters 8–10 | Distributed correctness, memory/throughput report, resilient checkpoint and release artifact |
| 20–23 | Project 5; Chapters 10–12 | Versioned evaluator, planted-regression catch, trajectory comparison and release decision |
| 24–29 | Project 6; Chapter 15 | Cross-embodiment transfer study with positive and neutral/negative evidence |
| 30–36 | Project 7; Chapters 13–14 first | Shadow-mode and safety-reviewed protocol; physical iteration if access exists |
| Continuing | Chapter 18; upstream reviews, mentoring, deeper gaps | Public design discussion, reviewed contribution, reproducible work by another person |

Project 7 can extend beyond week 36. Hardware scheduling and safety review should set the pace. Do not skip its early gates to fit the calendar.

### A sustainable weekly cadence

For a 12-hour week:

- **2 hours — read and derive:** one chapter or primary paper; write formulas and contracts by hand.
- **6 hours — build:** one narrow milestone with tests and instrumentation.
- **2 hours — measure:** baseline, controlled comparison, failure trajectories, or profiling.
- **1 hour — communicate:** design note, experiment report, code review, or README.
- **1 hour — retrieve:** answer old interview prompts without notes and update the evidence matrix.

Protect time for analysis. If every week adds features, the portfolio becomes a pile of code without conclusions. At the end of each project, take a no-new-features session to remove dead code, rerun tests, and write limitations.

### Plan compute around questions

Before requesting compute, fill out a one-line experiment card:

> I need **[hardware/topology]** for **[duration]** to distinguish **[hypotheses]**, measured by **[metrics]**, with **[maximum cost/time]** and **[stop condition]**.

Use the cheapest environment that can answer the question:

| Question | Appropriate environment |
|---|---|
| Are masks and action labels correct? | CPU unit tests and tiny fixtures |
| Can the policy learn this task? | One modest GPU or existing pretrained baseline |
| Does the loader scale? | Real storage and target worker configuration; potentially multiple nodes only if shared storage matters |
| Does FSDP fit and resume? | Multiple actual GPUs for memory/performance claims; local process tests for some correctness checks |
| Does multi-node networking change throughput? | At least two actual nodes with documented interconnect |
| Does the policy work on hardware? | The physical robot and deployment compute |

Run expensive jobs only after smoke tests pass. Save resolved configs and stop conditions locally so a failed SSH session does not become an uncontrolled training job. Respect shared-cluster quotas and never run fault injection on infrastructure you do not control.

### Review at four portfolio gates

**Gate A — after Project 1:** Can you distinguish offline fit from online behavior? If not, repeat the baseline with better instrumentation.

**Gate B — after Project 3:** Can you attribute a behavioral change to data, modality, architecture, or action head? If every comparison changes several factors, simplify.

**Gate C — after Project 5:** Can another engineer reproduce your training and evaluation and disagree with you using the same artifacts? If not, improve manifests and reports before scaling.

**Gate D — after Project 7:** Which claims are demonstrated in simulation, on multi-node infrastructure, and on physical robots? Rewrite the portfolio with those boundaries explicit.

### Turn evidence into an honest résumé

Use this structure:

> Owned **[specific system/experiment]** across **[actual scale]**, changing **[baseline metric]** to **[candidate metric with evaluation size]**, by **[mechanism]**; added **[reliability/reproducibility artifact]**.

Example structure—not numbers to copy:

> Built a language-conditioned manipulation policy and matched evaluation harness; compared regression and diffusion action heads on paired simulated resets, measured the success/latency tradeoff, and released versioned data/model manifests with trajectory-level failure analysis.

Do not write “improved success by 30%” unless you have the baseline, denominator, conditions, and uncertainty. Distinguish relative from absolute percentage-point changes. Say “two processes on one GPU” or “eight GPUs across two nodes,” not merely “distributed at scale.”

### Interview preparation starts during the build

After each project, answer five questions without looking at the code:

1. What was the bottleneck and what evidence proved it?
2. What alternatives did you reject, and why?
3. What is the weakest part of your evaluation?
4. What would you do with 10× data, 10× compute, or one more robot?
5. What result would make you reverse your decision?

These are more useful than memorizing definitions because the role emphasizes ambiguous ownership and full-stack debugging.

**Prove it:** Put the 36-week table and your four gates into a tracker with actual dates and evidence links. Book compute only against written experiment cards. At each gate, update the plan based on measured gaps and record anything you deliberately chose not to build.
