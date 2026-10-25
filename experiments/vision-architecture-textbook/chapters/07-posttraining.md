## 7. Post-training: from SFT to RLVR and on-policy distillation

The most important structural change in frontier AI between 2023 and 2026 is that **the centre of gravity moved from pretraining to post-training**. This is the lens you said you were interviewing for, and it is worth being precise about what actually happened, because the popular story is wrong in an important way.

### The three-stage pipeline, and why it exists

A modern frontier model is trained in roughly four stages:

1. **Pretraining** — next-token (or masked-patch) prediction on a massive corpus. This gives the model knowledge and a general representation. It is the expensive stage.
2. **Supervised fine-tuning (SFT)** — train on high-quality demonstrations of the desired behaviour. This teaches *format* and *instruction following*, and it is short.
3. **Preference optimisation (RLHF / DPO)** — train on pairs of responses where one is preferred. This teaches *alignment* with human or AI judgement, and it uses a reward model.
4. **Reinforcement learning with verifiable rewards (RLVR)** — train against a *programmatically checkable* reward, with no reward model. This is the stage that taught frontier models to *reason*.

The key insight of the last two years is that stage 4 is not a variant of stage 3. RLHF/DPO optimise a *preference*, which is subjective and must be learned from data; RLVR optimises a *verification*, which is objective and can be computed at scale. That difference matters enormously: a verifiable reward can be generated for mathematics, code, and any task with a deterministic checker, and it can be generated *on-policy* — from the model's own rollouts — which means the training distribution matches the inference distribution.

### RLVR and GRPO

RLVR is typically implemented with **GRPO** (Group Relative Policy Optimisation): sample a group of rollouts, compute the advantage *relative to the group*, and apply a policy-gradient update with a KL penalty to the reference model. The reason GRPO won in practice is not that it is theoretically superior to PPO — it is not — but that it removes the value model and the reward model, and therefore removes two of the three things that make RLHF expensive and unstable.

The mechanism matters: RLVR is *selection*, not instruction. It increases the probability of trajectories that reach a verifiable success state. It does not "teach" the model facts. If the base model cannot reach the success state at all, RLVR has nothing to select. That is the correct mental model, and it is the basis for a whole family of follow-up papers (Chapter 7's discussion of process reward models).

### The reward-density argument: Thinking Machines' on-policy distillation

Thinking Machines Lab's **on-policy distillation** (October 2025) is the most interesting post-training result of the period, and it is a direct attack on the sparsity problem. The observation is:

> RL signal per episode is `O(1)` (a single scalar at the end of the rollout). On-policy distillation signal per episode is `O(N)` — every token of the student's rollout is graded against the teacher's distribution.

If the student rollout is 150 tokens long, that is a 150× difference in learning signal per episode. The recipe: sample rollouts from the student, score every token against the teacher's next-token distribution, and optimise a reverse KL. Because you can score partial rollouts, you do not need to wait for a full generation, which cuts latency.

The reported numbers (which are worth knowing cold): starting from the same SFT checkpoint, on-policy distillation reached ~70% on AIME'24 in ~150 steps using ~77k prompts, versus Qwen3's RL reaching 67.6% with 17,920 GPU-hours. Thinking Machines report 9–30× lower compute than the equivalent RL run, and a compute efficiency of 50–100× when accounting for context and batch effects. They also show a striking continual-learning result: after fine-tuning Qwen3-8B on internal documents, instruction-following dropped from 85% to 45%; on-policy distillation from the *pre-adaptation* model as teacher recovered it to 83% while preserving the new knowledge.

The reason this is a *structural* argument rather than an engineering trick: it says that **dense, per-token, on-policy supervision dominates sparse, outcome-level, on-policy reward in this regime.** That is a claim about the information content of the training signal, and it generalises beyond distillation to any setting where you can grade intermediate steps. It is exactly the kind of claim a research interviewer wants you to be able to make and defend.

### Multimodal RLVR: where vision makes it harder

Applying RLVR to vision-language models is harder, and the difficulty is *specifically about vision*. Three problems dominate:

1. **Reward sparsity plus visual grounding.** Most RLVR rewards are answer-matching: `r ∈ {0, 1}` at the end of the chain. If the model fails, you do not know whether it failed at perception or at reasoning. Work on **perception-aware policy optimisation** found that ~67% of multimodal reasoning errors originate in visual perception, not in logic. That is a strong and quotable result, and it implies that the reward structure — not the model — is the bottleneck.
2. **Language shortcuts.** A VLM can answer without looking at the image, using text priors. If your reward only checks the final answer, you will happily reward a model that has learned to ignore the image. **Vision-SR1** addresses this by decomposing reasoning into *visual perception* and *language reasoning*, requiring the model to produce a self-contained visual description that is sufficient to answer the question, and then re-prompting the model on that description alone to verify it. **Perception-R1** introduces a visual perception reward based on spatial outputs (bounding boxes compared to ground truth) and achieves strong results with 1,442 training samples versus Vision-R1's 200k.
3. **Verification heterogeneity.** Different tasks need different verifiers: symbolic checking for math, IoU for localisation, LLM-judge rubrics for open-ended physics reasoning. **V-Triune** proposes a unified methodology with sample-level reward routing, verifier-level outcome verification, and source-level diagnostics, plus **Dynamic IoU** — a staged reward schedule that starts dense and becomes strict, because a fixed IoU threshold is either too loose (reward ambiguity) or too strict (reward sparsity).

The emerging consensus is that **process reward models (PRMs)** — which supervise intermediate steps rather than only the final outcome — are the fix, and the frontier is building perception-centric PRMs that can localise *which* step failed and *where* in the image it went wrong.

### Distillation, and why it keeps coming back

Distillation appears at every stage of the pipeline and for the same reason: a teacher's distribution carries more information than a label. Off-policy distillation (train on teacher-generated sequences) is the standard SFT replacement; on-policy distillation is the RL replacement. The open question — and the one Thinking Machines' work raises — is how much of RL's expensive search is genuinely necessary versus being the prerequisite that makes cheap distillation possible. The evidence so far leans toward "most of it is the prerequisite", which is a strong and controversial claim, and exactly the kind of thing worth arguing about in an interview.

**What would change my mind:** The "dense on-policy supervision dominates sparse reward" claim would be weakened if a pure RLVR run with a sparse verifiable reward, at matched compute, beat on-policy distillation on a task where the teacher has no advantage — i.e., where the teacher is the same size as the student. Thinking Machines' strongest results use a *larger* teacher, so part of the gain could be teacher capability rather than signal density. Their self-distillation experiment (same architecture) is the right control, and it is the one to cite if asked.
