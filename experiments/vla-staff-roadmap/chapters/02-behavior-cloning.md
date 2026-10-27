## 2. From trajectories to behavior cloning

Robot control is sequential. An action changes the next observation, so a robot dataset is not a bag of independent images and labels. A useful formal starting point is a partially observed Markov decision process (POMDP): the environment has a hidden state, the robot receives an observation, chooses an action, and transitions to a new state. You do not need to solve a POMDP to train behavior cloning, but the formalism prevents a common mistake: treating a history-dependent, closed-loop problem as ordinary i.i.d. classification.

At time `t`, define an observation bundle such as:

`oₜ = {Iₜ¹…Iₜᶜ, qₜ, gₜ, instruction, calibration, embodiment}`

Here `I` represents one or more camera images, `q` proprioceptive state such as joint positions, and `g` optional gripper or other sensor state. The demonstrated action `aₜ` might be a joint target, end-effector delta, velocity, or discrete gripper command. Those are different labels, not interchangeable arrays.

An episode is `τ = (o₀, a₀, o₁, a₁, …, oT)`. A policy estimates `πθ(aₜ | o≤t, instruction)`. Behavior cloning (BC) fits the demonstrations with supervised learning:

`LBC(θ) = E(o,a)~D [ -log πθ(a | o) ]`

For a deterministic regressor trained with mean squared error, this becomes `||fθ(o) - a||²`. For discretized actions, use cross-entropy over bins. For a Gaussian policy, the negative log-likelihood includes both the mean error and variance terms. The objective should match the action representation; “BC” does not imply MSE.

### Start with the label contract

Before model code, write a one-page contract containing:

- **Action semantics:** absolute position, delta position, velocity, or torque; the reference frame; units; control frequency; and whether the command is executed at `t`, during `(t, t+1]`, or at some later timestamp.
- **Dimension meanings:** every joint or end-effector component and every gripper convention. Document whether `1` means open or closed.
- **Observation timing:** camera exposure time, state timestamp, command timestamp, and any known latency. A video frame displayed next to a state row is not proof that they are synchronized.
- **Bounds and normalization:** valid physical limits, clipping behavior, and whether normalization is computed per dataset, task, or embodiment.
- **Episode boundaries:** reset conditions, terminal labels, padding rules, and the rule preventing an action chunk from crossing into another episode.

A surprisingly strong debugging tool is to plot `aₜ`, `qₜ`, `qₜ₊₁`, and timestamps for a handful of demonstrations. If the action is supposed to be a delta, compare it with the realized state difference while allowing for tracking lag. Do not “fix” a mismatch until you understand the controller's semantics.

### Why low validation loss can still produce a bad robot

BC learns states visited by the demonstrator. At deployment, the learned policy visits its own states. A small error can move the robot slightly off the demonstrated path; the next observation is then less familiar, which can produce another error. This distribution shift is often called **covariate shift** or **compounding error**. Longer episodes give errors more opportunities to accumulate.

Three consequences matter more than a slogans:

1. **Held-out action loss is an offline proxy.** It is measured on demonstration states, not on states induced by your policy. Use it for optimization and diagnosis, but do not equate it with task success.
2. **The evaluation must close the loop.** Run the policy in simulation or on a real robot, observe the resulting state, and feed that state back into the policy.
3. **Data coverage should include recovery.** Perfect demonstrations show what to do on the expert's path. They may not show how to return after an overshoot. Intervention data and DAgger-style collection can address this, at the cost of additional labeling and operational complexity.

[DAgger](https://arxiv.org/abs/1011.0686) iteratively rolls out a policy, requests expert labels on visited states, aggregates the data, and retrains. It directly targets the state-distribution mismatch, but it is not magic: the expert must be able to label safely and consistently, and the aggregation can change the data balance.

### History, chunking, and closed-loop control

A single frame may be insufficient: occlusion, motion direction, and contact dynamics often require history. A history policy receives `oₜ₋ₖ₊₁…oₜ`; a memoryless policy receives only `oₜ`. History increases context and compute but can improve observability.

An action-chunking policy predicts `Aₜ = (aₜ, aₜ₊₁, …, aₜ₊H₋₁)`. The controller may execute only the first few actions before requesting a new chunk—receding-horizon control—or blend overlapping predictions. Chunking can make behavior temporally coherent and amortize inference, but a long open-loop chunk can also execute stale intent. Chapter 4 makes that tradeoff concrete.

Do not let the dataloader create a chunk across an episode boundary. If fewer than `H` future actions remain, either mask the invalid tail, use a documented shorter chunk, or skip the start index. Test all three boundary cases explicitly.

### A minimal PyTorch training skeleton

This is intentionally incomplete as a policy, but complete enough to expose the training contracts:

```python
for batch in train_loader:
    images = batch["image"].to(device, non_blocking=True)   # [B, C, H, W]
    state = batch["state"].to(device)                      # [B, state_dim]
    target = batch["action"].to(device)                    # [B, horizon, action_dim]
    mask = batch["action_mask"].to(device)                 # [B, horizon]

    prediction = model(images, state, batch["instruction"])
    per_step = ((prediction - target) ** 2).mean(dim=-1)
    loss = (per_step * mask).sum() / mask.sum().clamp_min(1)

    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optimizer.step()
```

The important details are not the API calls. They are the shape comments, mask-aware reduction, explicit action target, and reproducible optimizer semantics. In distributed training, a global mean requires additional care when masks contain different numbers of valid elements across ranks; averaging already-averaged rank losses can silently weight batches incorrectly.

### The smallest informative experiment sequence

1. **Data inspection:** decode ten random episodes and render images with state and action overlays. Verify units and chunk boundaries.
2. **Single-batch overfit:** the model should nearly memorize a small fixed batch. If it cannot, inspect labels, masks, model capacity, optimization, and gradients before scaling.
3. **Small-episode overfit:** memorize a few complete episodes and replay them in the environment. This tests more of the execution path than a batch loss.
4. **Held-out episodes:** split by whole episode, not random timesteps. Random frame splits leak near-duplicates across train and validation.
5. **Closed-loop baseline:** evaluate a state-only or simple vision policy before adding language, a large backbone, or diffusion.
6. **Ablations:** change one major factor at a time—history length, action horizon, camera, or objective—and keep evaluation conditions fixed.

Preserve a scripted or heuristic baseline if the environment provides one. A learning policy should beat “do nothing,” a random valid action, and a simple replay or proportional controller where applicable. Without a baseline, a success number has little context.

### Generalization is a property of the split

“Generalizes well” is incomplete. Generalization to what? Define separate holdouts for initial positions, object instances, visual backgrounds, lighting, instruction phrasings, tasks, camera viewpoints, and robot embodiments. Holding out random episodes only estimates performance under approximately the same collection distribution.

Keep test episodes and their near-duplicates out of training and model selection. Use validation for choices and test for the final report. If you repeatedly inspect test results and retrain, the test set has become a validation set; create a fresh confirmation set or acknowledge the adaptivity.

**Prove it:** Implement a state-only or single-camera BC baseline on a small public manipulation dataset. Publish the action contract, an episode-level split, single-batch and small-episode overfit tests, masked-chunk unit tests, closed-loop rollouts, and a report that explicitly separates action loss from task success.
