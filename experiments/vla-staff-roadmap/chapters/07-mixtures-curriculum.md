## 7. Data mixtures, augmentation, and curriculum

A heterogeneous training set is not one distribution. It is a collection of tasks, embodiments, operators, cameras, action conventions, episode lengths, and quality levels. The sampler determines which distribution the optimizer actually experiences.

### Count the unit you are sampling

One thousand episodes of a long task can contribute more transitions than ten thousand short episodes. Sampling uniformly by episode, timestep, or trajectory chunk produces different mixtures. Action-chunk training adds another choice: uniformly sampling valid start indices weights long episodes more heavily.

Write the intended unit in the data contract. Then report both:

- **composition:** episodes, hours, and transitions per task/embodiment;
- **optimization exposure:** actual sampled batches per task/embodiment.

A pie chart of raw episodes can conceal the effective training distribution.

### Temperature sampling

For dataset sizes `nᵢ`, temperature sampling defines:

`pᵢ = nᵢ^α / Σⱼ nⱼ^α`

At `α = 1`, sampling is proportional to size. At `α = 0`, each dataset has equal probability. Values between interpolate. The interactive lab shows expected draws, passes over each dataset, and sampling relative to natural frequency.

Temperature is not a quality score. A tiny dataset may contain excellent demonstrations or narrow, repetitive behavior. Equalizing it with a large dataset may improve coverage or cause memorization. Select the mixture using per-task and per-embodiment holdouts, retention tests, and training dynamics.

Other strategies include manually specified weights, quality-weighted sampling, curriculum schedules, and adaptive sampling based on failure rates. Adaptive methods can create a feedback loop: the sampler overweights a hard task whose labels are inconsistent, training becomes unstable, and the task looks even harder. Cap weights and inspect why a slice is difficult.

### Augmentation must preserve the label

Image augmentation can improve robustness, but robotics couples vision and action.

- **Color jitter, blur, exposure, and sensor noise** may be label-preserving within realistic ranges.
- **Cropping and resizing** can remove the target or alter spatial precision. Verify object visibility and camera assumptions.
- **Horizontal flips** generally require corresponding changes to state, action, camera geometry, and instruction (“left” becomes “right”). An image-only flip is often wrong.
- **Temporal jitter and frame dropout** can model sensing variation, but must preserve action alignment and test the intended latency regime.
- **State or action noise** can broaden coverage or imitate sensor error, but physically impossible noise teaches inconsistent dynamics.
- **Language paraphrases** can improve instruction robustness if meaning is preserved. Human review a sample of generated paraphrases and keep negation, object identity, and spatial relations intact.

Build an augmentation viewer that shows the original and transformed observation, instruction, state, and action together. Test the geometric transformation numerically where possible.

Augmentation is not a substitute for missing physical variation. Synthetic brightness changes do not create new contact dynamics or camera viewpoints.

### Curriculum is a schedule, not a guaranteed improvement

A curriculum might begin with state-based policies, then add vision; begin with short horizons, then longer tasks; or begin with one embodiment, then add others. Potential benefits include easier optimization and better use of difficult data. Potential costs include forgetting, biased representations, and extra hyperparameters.

Treat curriculum as a controlled experiment:

1. Define stages and promotion criteria before training.
2. Keep the final evaluation fixed.
3. Compare against a mixed-data run with comparable total samples and compute.
4. Evaluate retention of earlier-stage skills.
5. Ablate the order, not just the presence of more data.

A curriculum that uses more total training than the baseline has not isolated the value of ordering.

### Design a coverage matrix

Create a table whose axes reflect deployment variation:

| Axis | Example levels |
|---|---|
| Task | pick, place, wipe, insert, fold |
| Object | geometry, size, deformability, color, material |
| Scene | background, clutter, lighting, table height |
| Sensor | camera pose, intrinsics, dropped modality, calibration drift |
| Behavior | nominal demonstration, recovery, intervention, failure |
| Embodiment | arm, gripper, action space, control frequency |
| Language | template, natural paraphrase, relation/negation, unseen composition |

Empty cells are hypotheses about missing capability. Do not fill every combination blindly. Prioritize cells connected to observed failures or deployment requirements.

Hold out entire groups for generalization tests. If frames from the same object instance, room, or source video appear in both train and test, the split may overestimate novelty. Use group-aware splits and document near-duplicate handling.

### Close the loop with collection priorities

A useful collection request is specific: “The policy fails when the target is occluded by the gripper from the wrist camera during final approach; collect demonstrations with varied approach angles and recovery from initial grasp miss.” “Collect more picking data” gives operators little guidance and may repeat what the model already knows.

Rank candidate collection by expected decision value, not model uncertainty alone. Consider failure frequency, severity, likelihood that data will address it, collection cost, and safety. After collection, version the mixture and run the same evaluation to determine whether the hypothesis was correct.

**Prove it:** Run three mixture settings—natural, one intermediate temperature, and equal-dataset sampling—under a fixed draw budget. Publish per-slice results and an augmentation correctness test. Then write one failure-linked collection request and predict which metric should improve before collecting anything.
