## 9. Distributed training: replicate work or shard state

Distributed training solves two different problems: **throughput** (finish more samples per unit time) and **capacity** (fit a model that one device cannot hold). Data parallelism primarily addresses throughput; parameter, tensor, and pipeline sharding can address capacity. Combining them introduces communication and correctness constraints.

### DDP: synchronized replicas

In DistributedDataParallel (DDP), each rank owns a model replica, processes a different shard of the global batch, and synchronizes gradients so replicas remain equivalent. The conceptual loop is:

`rank-local batch → local forward/backward → gradient all-reduce → identical optimizer update`

DDP does not divide the model's static memory by the number of GPUs. Each rank still needs parameters, gradients, optimizer state, and its own activations. Its main scaling costs are gradient communication, synchronization, and stragglers.

Correctness checks include:

- rank-disjoint samples and a known global batch;
- identical initial model state;
- equivalent loss and gradient reduction semantics;
- controlled RNG per rank without accidental identical augmentation;
- no rank silently omitted from collectives;
- checkpoint and evaluation performed with well-defined rank responsibilities.

A useful starting point is to compare one process with a tiny multi-process run on the same batch and ensure the intended numerical behavior, allowing for documented reduction differences.

### FSDP and ZeRO: shard the static state

Fully Sharded Data Parallel (FSDP) shards parameters, gradients, and optimizer state across data-parallel ranks. Parameters are gathered when needed for computation and can be resharded afterward; communication patterns such as all-gather and reduce-scatter replace the simple mental picture of a gradient all-reduce. The [PyTorch FSDP paper](https://arxiv.org/abs/2304.11277) and [FSDP documentation](https://docs.pytorch.org/docs/stable/fsdp.html) describe actual implementation choices.

[ZeRO](https://arxiv.org/abs/1910.02054) organizes related ideas into stages that shard optimizer state, gradients, and parameters. Framework APIs differ, so reason from what is sharded at each phase rather than treating names as interchangeable.

The lab uses an intentionally simple BF16 AdamW model:

- 2 bytes per parameter for BF16 weights;
- 2 for BF16 gradients;
- 4 for FP32 master weights;
- 8 for two FP32 optimizer moments.

That totals 16 bytes per parameter before activations and runtime buffers. Under ideal FSDP with `N` ranks, the lab divides this static state by `N`. Real memory can be higher because of unsharded modules, temporary all-gather buffers, communication workspaces, fragmentation, and implementation-specific precision. A “fits” calculation is a hypothesis to test with a profiled step.

### Tensor and pipeline parallelism

**Tensor parallelism** splits operations such as matrix multiplications within a layer across devices. It can reduce per-device parameter and activation requirements, but frequently communicates activations and benefits from high-bandwidth, low-latency interconnect. [Megatron-LM](https://arxiv.org/abs/1909.08053) is a foundational reference for transformer tensor parallelism.

**Pipeline parallelism** assigns different layer ranges to different stages and passes activations between them. Microbatch schedules keep stages busy but introduce pipeline bubbles and complicate optimizer semantics. [GPipe](https://arxiv.org/abs/1811.06965) is a useful baseline reference.

Large systems may combine data, tensor, and pipeline parallelism. More dimensions are not inherently better. Use the simplest layout that meets memory and throughput goals, and explain the interconnect assumptions. A policy with a small action head and a large VLM backbone may need different strategies for different modules.

### Multi-node introduces a new failure surface

Within one node, you still face distributed correctness. Across nodes, add rendezvous, network interfaces, routing, storage contention, DNS/firewalls, heterogeneous stragglers, job scheduling, and partial failures. NCCL is a communication library, not a complete cluster-management solution.

A typical `torchrun` launch exposes rank, world size, and rendezvous settings, but production infrastructure determines how those values are managed. Learn to read:

- global rank, local rank, and world size;
- node-local device assignment;
- master/rendezvous configuration without exposing secrets;
- backend and network topology;
- logs that identify the first rank which failed or stopped communicating.

Never present a two-process CPU test as a multi-node result. If cluster access is limited, run a short, preplanned multi-node experiment with explicit questions: scaling efficiency, network sensitivity, checkpoint restart, and failure recovery.

### Sharded loading and deterministic resume

At scale, the sampler is part of the distributed algorithm. Every rank should know which shards and samples it owns. Save enough state to resume without silently repeating or skipping a large interval:

- epoch and global optimizer step;
- shard/sample cursor or a deterministic reconstruction rule;
- model and optimizer shards;
- scheduler and gradient-scaler state;
- Python, framework, CUDA, and sampler RNG states where applicable;
- exact data and configuration manifests.

Write checkpoints to temporary locations and publish atomically so a partially written file is not mistaken for the latest valid checkpoint. Test corrupt and interrupted writes. Keep at least one known-good prior checkpoint until the new one is verified.

A restart test should compare the post-resume sample sequence and relevant state with an uninterrupted control run. “The loss continued decreasing” is not sufficient.

### Measure scaling, not just speed

If one GPU takes `T₁` and `N` GPUs take `Tₙ` for the same global workload, speedup is `T₁/Tₙ` and scaling efficiency is `T₁/(N · Tₙ)`. Changing global batch at the same time changes the optimization problem, so disclose it.

Profile communication and computation separately. A larger per-rank batch may improve compute efficiency but alter convergence; a smaller one may expose communication overhead. Fast storage on one node may become a shared bottleneck on many.

Cost should include GPU time, storage, data processing, failed runs, evaluation, and operator time. The north-star metric is often **cost and time to a checkpoint that passes the same release gate**, not the cheapest step.

### Fault injection is a project, not an afterthought

On a small job, deliberately kill one worker, interrupt a checkpoint write, fill a test filesystem, corrupt a shard, and throttle or stop a data source in a controlled environment. Verify detection, error attribution, cleanup, restart, and data ordering. Do not run disruptive fault tests on shared infrastructure without authorization.

**Prove it:** Produce a scaling report with an actual topology diagram, single- and multi-rank correctness checks, memory profiles, throughput and scaling efficiency, a resume-from-checkpoint comparison, and one controlled fault injection. If you lack multiple nodes, mark multi-node throughput as unmeasured and supply a ready-to-run test plan instead.
