## 10. Reproducible experiments and model release

Reproducibility means another engineer can identify exactly what was run, reconstruct its inputs, and judge whether a later result is comparable. It is more demanding than saving a checkpoint and a screenshot of a loss curve.

### The run contract

Every meaningful run should reference:

| Layer | Minimum recorded identity |
|---|---|
| Code | Commit, dirty-state diff if any, entry point, resolved command |
| Configuration | Fully resolved config, including defaults and sweep identity |
| Dependencies | Lockfile or environment image/digest, key framework and driver versions |
| Data | Immutable manifest, split IDs, normalization reference, mixture and augmentation version |
| Initialization | Base-model artifact, revision/hash, license, tokenizer and preprocessor versions |
| Hardware | Accelerator, count, node topology, important runtime/backend settings |
| Randomness | Seeds and the limits of actual determinism |
| Output | Model/optimizer/scheduler state, RNG/sampler state, metrics, logs, artifact hashes |

Configuration tools such as [Hydra](https://hydra.cc/) can help compose and resolve settings; experiment systems such as [MLflow](https://mlflow.org/docs/latest/) or [Weights & Biases](https://docs.wandb.ai/) can track runs. The tool is secondary. A hand-written manifest with complete identities is better than a polished dashboard missing the dataset version.

Do not log secrets, private operator data, or unrestricted raw sensor streams by default. Define access controls and retention along with observability.

### Separate selection from confirmation

A typical experiment creates many checkpoints. Use training and validation data to select hyperparameters and checkpoints; keep a test or confirmation suite for the final comparison. If a test result triggers another model change, it has participated in selection.

For expensive robot rollouts, maintain:

- a small frequent **smoke suite** for obvious regressions;
- a broader **validation suite** for model selection;
- a frozen **release suite** for final candidate evaluation;
- a rotating or newly collected **confirmation suite** when repeated adaptive testing threatens validity.

Version the environment and success rubric alongside the model. A changed simulator build, controller gain, camera calibration, or reset distribution can make two numbers incomparable.

### Tests form a pyramid

1. **Unit tests:** shape/dtype contracts, masks, coordinate transforms, normalization round trips, tokenization, sampler disjointness, loss reductions.
2. **Data integration tests:** decode raw-to-normalized episodes, validate manifests, render augmented batches, check split leakage.
3. **Training smoke tests:** one small batch, one tiny epoch, checkpoint save/load, frozen/trainable parameter assertions.
4. **Distributed tests:** rank assignment, gradient/loss semantics, sharded state restore, interrupted checkpoint handling.
5. **Policy regression tests:** fixed simulation scenarios and rollout budgets, latency checks, failure classifications.
6. **On-robot release tests:** approved supervised protocol with explicit stop criteria and rollback.

Fast tests should run on every change; expensive tests can run on a schedule or release candidate. A green unit suite does not imply robot competence, and a successful demo does not imply maintainable code.

### Checkpoints are products with interfaces

A deployable model artifact needs more than weights:

- architecture and compatible code revision;
- modality schema and tensor order;
- preprocessing and action denormalization;
- camera and state expectations;
- action representation, horizon, units, frames, and controller contract;
- tokenizer or text preprocessing;
- training and evaluation manifests;
- known limitations, license, and intended use;
- latency measurements and supported runtime;
- rollback target.

Prefer safe serialization formats where practical and treat downloaded checkpoints as untrusted. Verify artifact hashes and provenance. A checkpoint that silently loads with missing keys is not a valid release.

### The release gate

Define the gate before seeing the candidate's result. An example:

> Candidate must pass all schema and inference-parity tests; meet the fixed simulation success and safety thresholds with reported intervals; show no material regression on retention tasks; remain below the agreed p95 sensor-to-command latency budget on target hardware; complete supervised real-robot smoke tests; and have a reproducible artifact plus rollback.

Thresholds must come from task requirements and baseline risk, not copied from this example. For a candidate with modest sample size, a gate may require more evidence rather than pretending the interval is narrow.

Automate what is deterministic and keep human review for ambiguous failure classification, physical safety, and cross-functional tradeoffs. Record waived exceptions with an owner and rationale; do not silently convert a failed gate into a warning.

### Make experiments reviewable

A useful experiment report fits on one or two pages:

1. Question and hypothesis.
2. Baseline and controlled variables.
3. Data/config/model identities.
4. Results with uncertainty and negative slices.
5. Failure analysis and alternative explanations.
6. Decision: adopt, iterate, roll back, or gather a specific kind of evidence.
7. Reproduction command and artifact links.

This discipline reduces cherry-picking and helps teammates challenge the result. It also creates the design-history evidence expected from a staff-level engineer.

**Prove it:** Choose one prior project and make it reproducible by someone else. Publish the run contract, automated smoke tests, hashed model/data manifests, a model card, and a predeclared release gate. Ask another person—or a clean environment—to follow only the documentation and record every missing assumption.
