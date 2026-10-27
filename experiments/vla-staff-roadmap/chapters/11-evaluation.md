# Part III — Evaluation, debugging, and physical systems

## 11. Evaluation: measure capability, not demo luck

Robot evaluation asks whether a complete policy system achieves a task under a declared distribution of conditions. The complete system includes preprocessing, checkpoint, inference runtime, action postprocessing, controller, robot, and environment. Changing any one can change the result.

### Build a metric hierarchy

Start with the deployment objective, then add diagnostics:

1. **Task success:** a binary or graded outcome defined by observable final-state criteria, not by a person saying the video looked good.
2. **Task quality:** cycle time, placement accuracy, damage, spillage, energy, or other domain-specific measures.
3. **Robustness and generalization:** success by initial state, object, scene, instruction, camera, and embodiment holdout.
4. **Interventions and safety:** human takeovers, boundary violations, collisions, near misses, emergency stops, and invalid commands. Define each event before the study.
5. **Latency and reliability:** sensor-to-command distributions, timeout rate, dropped frames, controller underruns, recovery after infrastructure failure.
6. **Offline diagnostics:** action error, NLL, calibration, feature quality, and per-slice losses.

A policy with slightly lower average success but substantially fewer severe failures may be preferable. A single scalar leaderboard hides that decision.

### Offline metrics are proxies with specific uses

Offline evaluation is cheap and repeatable. Use it to detect preprocessing regressions, compare likelihoods or errors on demonstration states, and inspect per-dimension behavior. But open-loop action error does not measure whether predicted actions lead to successful closed-loop trajectories.

A model can have low average MSE and fail on rare critical transitions, or higher MSE because it chooses a different but valid path. Generative policies add another complication: a sampled action need not match the one demonstrated action to be valid.

Useful offline reports therefore include:

- per-task, per-horizon, and per-action-dimension errors;
- error at important events such as approach, contact, grasp, and release;
- predicted versus demonstrated action distributions, not only pointwise error;
- rollout-relevant slices such as occlusions or unusual initial states;
- correlation analysis between offline metrics and online outcomes across several checkpoints.

If no checkpoint ranking correlation exists, do not use that offline metric as the release gate.

### Pre-register the online protocol

Before running the candidate, freeze:

- model, environment, controller, and preprocessing versions;
- task matrix and success/failure rubric;
- initial-state distribution and randomization;
- number of trials and handling of timeouts or infrastructure aborts;
- intervention definition and whether an intervened trial counts as failure;
- primary metric, important secondary metrics, and regression threshold;
- exclusion rules for invalid trials.

Do not silently delete failures caused by the policy. Distinguish a policy timeout from a simulator crash or a hardware fault, but report all categories. If exclusions change the denominator, show both intention-to-evaluate and valid-trial analyses where appropriate.

Use the same initial conditions for paired checkpoint comparisons when possible. Pairing removes some environmental variance and lets you inspect trials where behavior changed. Keep enough independent seeds or resets to avoid treating one favorable start as a capability estimate.

### Confidence intervals quantify only one kind of uncertainty

For `s` successes in `n` independent Bernoulli trials, the observed rate is `s/n`. The interactive lab uses a 95% Wilson score interval, which generally behaves better than a simple normal interval for small samples and extreme proportions.

The interval addresses sampling variability under its assumptions. It does **not** include calibration drift, a biased reset sampler, ambiguous scoring, changing hardware, correlated trials, or train/test leakage. Fifty rollouts from nearly identical initial states do not provide the same evidence as fifty well-distributed independent trials.

When trials are clustered by object, scene, operator, or seed, consider a hierarchical or cluster-bootstrap analysis. For paired checkpoint comparisons, analyze per-condition differences rather than treating two overlapping marginal intervals as the complete test. A statistician is useful when the decision has significant cost or safety consequences.

Report the numerator and denominator alongside every percentage. “84% (42/50), 95% Wilson interval …” is more informative than “84% SOTA.”

### Slice the result

Aggregate metrics can hide a regression. Report both micro averages over all trials and macro averages over tasks or embodiments, because they answer different questions. Then slice by:

- task and instruction type;
- seen versus unseen object and scene;
- camera viewpoint and occlusion;
- episode length or horizon;
- robot and sensor configuration;
- recovery versus nominal trajectory;
- latency band and infrastructure condition.

A small overall improvement accompanied by a large drop on one robot may be unacceptable for fleet release. Multiple slices increase the chance of a chance finding; treat exploratory slice analysis as hypothesis generation and confirm important discoveries.

### Latency is a distribution and a staleness problem

Measure timestamps at sensing, preprocessing, inference start/end, command publication, controller receipt, and execution where possible. Report p50, p95, and p99, not only mean inference time. A model with fast average inference can still miss control deadlines due to garbage collection, network jitter, or video decode.

Also measure **action staleness**: the age of the observation used to generate the command at the time it executes. A faster model using an old queued frame may not be better than a slower model using fresh data. Define queue policies, dropped-frame behavior, and watchdog responses.

### Regression gates need practical significance

A release gate should specify both statistical evidence and a difference that matters. For example, a 0.2 percentage-point success change may be irrelevant for one task while a single new collision class is decisive. Avoid rigid universal thresholds; derive them from the baseline, task risk, and evaluation budget.

Use non-inferiority thinking for retention: how large a regression on existing tasks can the system tolerate in exchange for target improvement? If the evaluation cannot resolve that margin, collect more evidence or narrow the release claim.

**Prove it:** Build an evaluation report for two checkpoints with a frozen task matrix, paired initial conditions, raw success counts, Wilson intervals, per-slice outcomes, p95 latency and staleness, intervention counts, and an explicit adopt/reject decision. Include one limitation that the interval does not address.
