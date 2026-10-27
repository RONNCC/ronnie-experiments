## 5. Pretraining, fine-tuning, and post-training

“Training a VLA” can refer to several very different operations. Naming the stage prevents impossible comparisons.

| Stage | Data and objective | What it can buy | Main risk |
|---|---|---|---|
| Vision-language pretraining | Large image/text corpora; contrastive, generative, or related objectives | Semantic and visual representations | Assuming semantic knowledge implies control competence |
| Robot-policy pretraining | Heterogeneous demonstrations; imitation or generative action objectives | Cross-task and cross-embodiment action priors | Negative transfer, inconsistent labels, dominant datasets |
| Target-task fine-tuning | In-domain demonstrations, often with a pretrained initialization | Fast adaptation to a task, camera, or robot | Overfitting and forgetting broader abilities |
| Post-training | Curated demonstrations, interventions, preferences, verified feedback, RL, or distillation | Better recovery, reliability, style, latency, or deployment fit | Optimizing a proxy, narrowing behavior, unsafe exploration |

You will probably not pretrain a frontier VLM for these projects. The transferable skill is understanding what an initialization contains, designing the robot-data stage, and measuring what adaptation changes.

### Imitation is the default baseline

Behavior cloning and related imitation objectives are stable, simple to implement, and directly use demonstrations. They should be the baseline against which more elaborate post-training is judged. Offline reinforcement learning can use reward-labeled datasets without online exploration, but requires careful handling of value estimation and out-of-distribution actions. Online RL can optimize closed-loop returns, but real-robot exploration raises cost and safety concerns. Neither should be added merely because the posting lists RL as nice to have.

A sound decision sequence is:

1. Is the demonstrations' main limitation coverage, label quality, multimodality, or long-horizon compounding error?
2. Can the target be improved with better supervised data or an action head?
3. Is there a reliable reward or verifier that correlates with actual task success?
4. Can the system explore or fail within an approved safety and cost budget?
5. Does the new method beat the supervised baseline under matched online evaluation?

If the answer to the first question is “misaligned timestamps,” post-training is not the first fix.

### Full fine-tuning, freezing, and LoRA

Full fine-tuning updates every parameter. It offers maximum flexibility and usually the largest optimizer and checkpoint footprint. Freezing the backbone and training only an adapter or action head reduces trainable state and can regularize a small target dataset, but limits adaptation.

Low-Rank Adaptation ([LoRA](https://arxiv.org/abs/2106.09685)) freezes a pretrained weight `W` and learns a low-rank update:

`W′ = W + (α/r) · BA`, where `B` and `A` have inner dimension `r`

Only the adapter parameters and their optimizer states need training, while the base weights remain fixed. LoRA does **not** eliminate activation memory, and serving can still require the full base model. Rank, target layers, initialization, dropout, and scaling are design choices.

Run a three-way comparison on the same target data:

- head-only or frozen backbone;
- LoRA on declared attention or projection layers;
- full fine-tuning, if memory permits.

Measure target-task success, broad held-out tasks, trainable and total parameters, peak memory, throughput, checkpoint size, and inference latency. A smaller checkpoint is useful; a smaller base model at inference is not implied.

### Distillation transfers behavior, not just weights

Distillation trains a student to match a teacher's outputs, features, or action distribution. For robot policies, consider what the student sees:

- **Off-policy distillation** on teacher or demonstration states is straightforward but retains exposure mismatch.
- **On-policy distillation** labels states visited by the student, which can target the student's actual errors.
- **Generative-policy distillation** may aim to reduce diffusion or flow sampling steps. Evaluate action quality and closed-loop behavior, not only teacher-student distance.

A teacher can be more capable but too slow or large to deploy. The student's benefit is meaningful only if it retains required success, robustness, and safety under the real latency budget. Keep a generalization suite to detect forgetting.

### Post-training with curated and intervention data

High-quality target demonstrations may be more useful than simply adding volume. Curate for consistent action semantics, successful completion, useful recovery, and coverage of identified gaps. Preserve a provenance link to the raw data; do not overwrite failures because they are inconvenient.

Intervention data records when a human takes over, what the policy did before the intervention, and how the operator recovered. Decide whether to train on the policy-caused segment, the recovery segment, or both with different weights. A naive filter that keeps only successful final episodes can remove the very recovery behavior you intended to learn.

Preference learning and RL require comparisons or rewards. In robotics, a reward that is easy to compute—distance to an object, for example—may not capture grasp stability, collisions, or cycle quality. Audit the verifier against human task judgments and adversarial trajectories before optimizing it.

### Prevent and measure forgetting

Fine-tuning on a narrow task can reduce performance elsewhere. Maintain three evaluation groups:

1. **Target:** the new task, robot, or environment.
2. **Retention:** representative pretraining or previously released tasks.
3. **Transfer:** held-out phrasings, objects, scenes, or embodiments not used for selection.

Possible mitigations include mixing replay data, reducing the learning rate, updating fewer layers, using adapters, regularizing toward the base model, or stopping earlier. Each is a hypothesis. Plot target improvement against retention loss rather than reporting only the target winner.

### Turn a recipe into an experiment record

A training recipe is more than a learning rate. Record initialization and license, frozen modules, data mixture, normalization, augmentation, objective, action horizon, global batch, optimizer, schedule, precision, gradient clipping, number of steps, checkpoint-selection rule, and evaluation protocol.

When a run fails, distinguish:

- **optimization failure:** loss or gradients become unstable;
- **generalization failure:** training improves but holdout does not;
- **objective mismatch:** offline metric improves while online behavior does not;
- **systems failure:** throughput, memory, checkpoint, or loader prevents the intended experiment;
- **deployment mismatch:** preprocessing, latency, or control changes at inference.

This taxonomy determines the next experiment. It also prevents the common response of changing five hyperparameters and learning nothing about the cause.

**Prove it:** Fine-tune one pretrained policy with head-only and LoRA adaptation, or implement the same comparison on your TinyVLA. Publish target, retention, and transfer results; trainable versus total memory; a curated-data ablation; and a short decision memo explaining whether full fine-tuning would be justified next.
