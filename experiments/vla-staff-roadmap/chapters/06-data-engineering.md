# Part II — Data, optimization, and training infrastructure

## 6. Robot data engineering: make time and semantics explicit

A robot dataset is a time-aligned, versioned interface between physical systems and learning code. Treating it as a directory of videos and arrays is how subtle label errors become expensive training runs.

### The canonical episode schema

Keep raw data immutable and define a normalized logical schema. A practical episode contains:

```text
Episode
├── identity: dataset, episode_id, embodiment, task, operator/source
├── instruction: raw text, normalized text, language/provenance
├── timing: clock domain, episode start/end, control frequency
├── calibration: camera intrinsics/extrinsics, frame conventions, versions
├── steps[]
│   ├── timestamps: camera exposure(s), robot state, command
│   ├── observations: image references, joint/gripper state, other sensors
│   ├── action: command values, type, frame, units, execution timestamp
│   └── metadata: intervention, termination, quality flags
└── provenance: source URI, license, raw hash, converter version
```

Not every dataset has every field. Represent missing information explicitly rather than inventing it. “Unknown clock offset” is different from zero offset.

Formats such as [RLDS](https://arxiv.org/abs/2111.02767) and dataset ecosystems such as [LeRobot](https://github.com/huggingface/lerobot) provide useful conventions and tooling. You can also define a project-specific schema, but preserve a lossless mapping to the source and document every transformation.

### Synchronization is a physical assumption

Three events are different: a camera exposes an image, a controller measures state, and a command begins execution. Logging them under the same loop index does not guarantee simultaneity.

To establish alignment:

1. Identify clock domains and units; convert to a common monotonic timeline where possible.
2. Measure or estimate sensor and actuation latency with a known event, such as a commanded visible motion.
3. Store original timestamps alongside derived alignment fields.
4. Choose an association rule—nearest, previous, or interpolation—per modality.
5. Validate the rule with motion events and edge cases, not only summary statistics.

Do not casually interpolate discrete gripper events or across episode resets. For continuous state, interpolation may be reasonable within bounded gaps; for actions, the correct alignment depends on when the command was issued and executed. Large gaps should become quality flags, not silently fabricated data.

### Frames, units, and normalization

A transform `T_AB` should have a documented meaning, such as “maps coordinates from frame B to frame A.” Use composition tests with known frames and round-trip tests for rotations. Store lengths in one canonical unit, angles in another, and convert at boundaries. Keep quaternion signs continuous within a trajectory if the model uses them.

Action normalization needs the same care as image normalization. Compute means, standard deviations, quantiles, or bin edges from the **training split only**. Save them with the model artifact. For multiple embodiments, decide whether statistics are shared, per embodiment, or hierarchical; shared statistics can erase meaningful scale differences.

Avoid blindly clipping outliers. A large action may be sensor corruption, an emergency stop, or valid recovery. Investigate its provenance and define a quality policy.

### Raw, normalized, and sharded representations

Separate three layers:

- **Raw:** source-owned bytes, immutable, with license and hashes.
- **Normalized:** validated records with explicit semantics and provenance.
- **Training shards:** packed sequences or samples optimized for reading, derived from a specific normalized manifest.

Sharding improves sequential throughput and simplifies distributed assignment, but introduces tradeoffs. Large shards reduce file-open overhead and can make random access harder; small shards improve flexibility but stress metadata and filesystems. Benchmark on your storage rather than adopting a universal shard size.

Video decoding often dominates robot-data loading. Test compressed-video seek behavior, keyframe intervals, decode threads, resolution, and whether sequential episode reads outperform random frame access. Cache only after measuring; a cache can move the bottleneck to memory, disk, or invalidation.

### The loader must preserve distributed correctness

A high-throughput loader has two independent requirements: feed the GPU and give each rank the intended samples.

For shuffled sharded training, define:

- shard shuffle seed = base seed + epoch;
- rank assignment before worker assignment;
- worker-specific deterministic sample order;
- drop/pad behavior at shard and epoch boundaries;
- resume position and RNG state.

If every worker shuffles all samples independently with the same seed, ranks can duplicate data. If they use uncoordinated different seeds, overlap may be probabilistic rather than eliminated. Log a small manifest of `(epoch, rank, worker, shard, sample_index)` and assert disjoint rank assignments in a test.

Performance knobs such as worker count, prefetch factor, pinned memory, persistent workers, and non-blocking transfers are workload-specific. Measure end-to-end samples per second, batch wait time, decode time, host memory, and GPU utilization. More workers can degrade performance through contention.

### Data tests belong next to model tests

At minimum, validate:

- unique episode and step identifiers;
- monotonic timestamps within each clock domain;
- no NaN or infinite values after normalization;
- valid shapes, dtypes, masks, and camera references;
- no chunk crossing an episode boundary;
- action and state ranges, with documented exceptions;
- frozen or duplicated video-frame detection;
- normalization statistics computed only on training data;
- train/validation/test disjointness by episode and source group;
- deterministic round-trip decode of every field.

Render actual training batches after augmentation. A schema test cannot reveal a horizontally flipped image paired with an unmodified action.

Treat downloaded datasets and checkpoints as untrusted input. Prefer safe serialization, avoid arbitrary pickled objects, validate archive paths, and keep credentials out of dataset metadata. Respect licenses and attribution; “publicly downloadable” does not mean unrestricted redistribution.

### Versioning and lineage

A data manifest should include source version, normalized-schema version, converter commit, inclusion/exclusion rules, shard hashes, normalization-statistic reference, and split identifiers. A training run references the manifest, not a mutable folder name such as `data/final_v2`.

When a quality rule changes, produce a new manifest and quantify the difference: episodes removed, tasks affected, and why. This makes a model improvement attributable to data rather than an undocumented side effect.

**Prove it:** Build a converter for two small public trajectory sources into your normalized schema. Publish alignment evidence, frame/unit tests, split-leakage tests, a hashed shard manifest, a rank-disjoint distributed sampler test, and a loader profile showing the bottleneck before and after one optimization.
