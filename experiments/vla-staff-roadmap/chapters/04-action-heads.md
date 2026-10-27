## 4. Action representations, chunking, diffusion, and flow

The action head determines what kinds of behavior the policy can express and how expensive it is to sample. Choose it from data and control requirements, not from architectural fashion.

### First decide what an action means

Common representations include:

- **Joint positions or deltas:** natural for a particular robot, but strongly embodiment-specific.
- **End-effector poses or deltas:** often easier to transfer conceptually across arms, but require explicit reference frames and a controller that tracks them.
- **Velocities:** responsive and smooth when well integrated, but sensitive to timing and drift.
- **Torques:** close to dynamics and contact, but difficult to demonstrate and transfer.
- **Discrete gripper commands:** often treated separately from continuous arm dimensions because their scale and semantics differ.

Represent a rotation deliberately. Euler angles are compact but have singularities and wraparound issues; quaternions require a hemisphere convention to avoid sign discontinuities; rotation matrices and six-dimensional representations consume more dimensions but can simplify learning. Document the convention and test round trips.

Absolute actions and deltas also fail differently. Absolute commands may be easier to bound but depend on a shared frame. Deltas can be local and transferable but accumulate integration error. Normalize using training-set statistics, retain the transform with the checkpoint, and test that inference exactly reverses it.

### Regression, discretization, and multimodality

A deterministic regressor trained with MSE predicts a conditional mean under squared-loss assumptions. If two demonstrations choose valid but different paths around an obstacle, the mean path may go through the obstacle. This is one motivation for generative policies, although real datasets and controllers make the story more nuanced.

Discretization turns each continuous action dimension into bins and trains cross-entropy. It supports multimodal marginal distributions and fits naturally into token-based models, but naive per-dimension binning can lose fine precision and ignore temporal structure. Quantization range, bin count, and dimension independence are experimental choices. [FAST](https://arxiv.org/abs/2501.09747) is one later approach to tokenizing action sequences more efficiently; treat it as a specific research method, not a synonym for all action tokenization.

A categorical gripper plus continuous arm action can use a hybrid loss:

`L = λarm · Lcontinuous + λgripper · Lcross-entropy`

The weights `λ` affect optimization. Report them and inspect per-term losses rather than hiding both behind one scalar.

### Action chunking and receding-horizon execution

Predicting a sequence `Aₜ = aₜ…aₜ₊H₋₁` offers three potential benefits: temporal consistency, an expressive distribution over trajectories rather than independent steps, and fewer model calls. It also introduces a control question: how much of the predicted sequence should be executed before observing the world again?

Let `H` be the predicted horizon and `K ≤ H` the number of actions executed. At control rate `f` Hz, the executed chunk spans roughly `K/f` seconds. If sensing plus inference plus communication takes `L` seconds, compare `L` with that interval. If `L > K/f`, new observations cannot be incorporated before the chunk ends unless execution pauses or pipelines overlap. Longer chunks are not a free latency fix; they increase the time during which the policy may follow stale predictions.

Evaluate at least:

- predicted horizon `H`;
- executed horizon `K`;
- overlapping-chunk blending or temporal ensembling, if used;
- sensor-to-command latency percentiles;
- behavior under injected latency and dropped frames.

[ACT](https://arxiv.org/abs/2304.13705) combines action chunking with a transformer-based conditional variational autoencoder for fine manipulation. [Diffusion Policy](https://arxiv.org/abs/2303.04137) uses receding-horizon action sequences with visual conditioning. Read the execution details, not just the action-head label.

### Diffusion policies: iterative conditional generation

A diffusion model learns to reverse a noising process. In a common discrete-time setup, a clean action chunk `x₀` is corrupted with Gaussian noise:

`xₜ = √ᾱₜ · x₀ + √(1 − ᾱₜ) · ε`, where `ε ~ N(0, I)`

A network conditioned on observations predicts the noise `εθ(xₜ, t, condition)`, or an equivalent target such as clean data or velocity. A simplified training objective is:

`L = E ||ε − εθ(xₜ, t, condition)||²`

At inference, start from noise and iteratively denoise to produce an action chunk. The sampler and number of steps matter: fewer steps can reduce latency but alter quality. Conditioning can use visual features, language, state, and embodiment.

The practical questions are:

- Does the action distribution contain meaningful multimodality that regression averages away?
- Does diffusion improve closed-loop success after equalizing backbone, data, and training budget?
- How many sampling steps are needed on the actual deployment hardware?
- Is the variance useful diversity or unsafe inconsistency for this task?
- Can a smaller deterministic or flow model meet the same requirement?

Do not report training loss as evidence of better action generation. Compare sampled trajectories and closed-loop behavior.

### Flow matching: learn a velocity field

Flow matching learns a vector field that transports a simple base distribution to the data distribution. One convenient interpolation uses noise `x₀` and a real action chunk `x₁`:

`x(t) = (1 − t) · x₀ + t · x₁`, with `0 ≤ t ≤ 1`

For this linear path, a target velocity is `u = x₁ − x₀`. Train `vθ(x(t), t, condition)` to predict `u`, then integrate the learned ordinary differential equation from noise toward data at inference. Notation varies across papers; always check which endpoint is noise and which is data.

[π₀](https://arxiv.org/abs/2410.24164) applies flow matching in a VLA with a dedicated action expert. The key learning exercise is not to reproduce that entire system. Implement a small flow head, verify the interpolation and target with unit tests, and compare sampling steps and closed-loop outcomes against diffusion and regression.

### Where world models fit

An action-conditioned world model predicts future observations or latent states under candidate actions. It can support planning, representation learning, data augmentation, or policy evaluation. It is not automatically a controller: you still need an action-selection mechanism and a way to handle model error. If you explore one as a stretch project, evaluate whether predicted futures improve decisions, not merely whether generated videos look plausible.

### A controlled action-head bake-off

Hold the following constant: dataset manifest, train/validation/test episodes, observation encoder, history, action normalization, predicted horizon, training steps, evaluation initial states, and deployment controller. Compare:

| Head | Primary question | Required measurement |
|---|---|---|
| Deterministic regression | Is the conditional mean adequate? | Per-dimension error, success, path smoothness, latency |
| Discretized autoregressive or parallel tokens | Does categorical modeling help precision or multimodality? | Bin sensitivity, token errors, success, sequence latency |
| Diffusion | Does iterative generation improve behavior enough to pay for sampling? | Step sweep, diversity, success, p95 latency |
| Flow matching | Can a learned vector field offer a useful quality/latency point? | Integration-step sweep, success, stability, p95 latency |

Equalize what you can and disclose what you cannot. Different objectives may need different learning rates; tune each within a fixed, reported budget rather than crippling a baseline.

**Prove it:** Implement at least regression and one generative action head behind the same encoder interface. Publish chunk-boundary tests, an `H`/`K` execution study, a sampler-step versus latency/success plot, paired rollouts, and one failure case where the more expressive head did not help.
