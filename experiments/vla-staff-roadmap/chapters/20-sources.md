# Part V — Primary sources and further study

## 20. Annotated source library

Read for contracts and experimental method, not for a list of names to recite. Papers report results under their own datasets, compute, tasks, and evaluation protocols; numbers across rows are usually not directly comparable. Documentation changes faster than papers, so confirm current APIs before implementing. This library and the role analysis were reviewed on 27 October 2026.

### The role and landmark VLA systems

1. **[Nidus Staff ML Engineer, VLA Training](https://jobs.ashbyhq.com/nidus-technologies/59f34e58-f867-4bdd-953f-31cb2d6dbaf6).** The sole source for the role requirements analyzed here. It does not reveal the company's internal architecture, datasets, or interview process.
2. **[RT-1: Robotics Transformer for Real-World Control at Scale](https://arxiv.org/abs/2212.06817).** Study the end-to-end real-robot learning setup, action representation, and relationship between data scale and policy evaluation.
3. **[RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control](https://arxiv.org/abs/2307.15818).** A key reference for action tokens and transfer from vision-language pretraining. Separate semantic-transfer claims from low-level control requirements.
4. **[Octo: An Open-Source Generalist Robot Policy](https://arxiv.org/abs/2405.12213).** Read the architecture and ablations, flexible task/observation interfaces, and fine-tuning methodology. The [project site](https://octo-models.github.io/) connects paper and released artifacts.
5. **[OpenVLA](https://arxiv.org/abs/2406.09246).** An open 7B VLA built from pretrained vision-language components. Useful for studying open training code, cross-embodiment demonstrations, LoRA adaptation, and deployment tradeoffs. See the [project repository](https://github.com/openvla/openvla).
6. **[π₀: A Vision-Language-Action Flow Model for General Robot Control](https://arxiv.org/abs/2410.24164).** Study the combination of a pretrained VLM and flow-matching action expert, cross-embodiment training, and high-frequency action chunks. Use its task videos and protocol to understand claims, not as your expected baseline.
7. **[PaLM-E: An Embodied Multimodal Language Model](https://arxiv.org/abs/2303.03378).** Useful for embodied multimodal representations and how continuous observations can be introduced into a language model.
8. **[Gato: A Generalist Agent](https://arxiv.org/abs/2205.06175).** A broad multi-domain sequence-modeling reference. Compare the generalist tokenization perspective with the practical action/control contracts required in robotics.

### Imitation, action representations, and generative control

9. **[DAgger: A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning](https://arxiv.org/abs/1011.0686).** The foundational reference for aggregating expert labels on learner-visited states. Focus on the distribution-shift argument and collection assumptions.
10. **[Diffusion Policy: Visuomotor Policy Learning via Action Diffusion](https://arxiv.org/abs/2303.04137).** Read the receding-horizon formulation, visual conditioning, action-sequence generation, and real/sim evaluation. The [project site](https://diffusion-policy.cs.columbia.edu/) provides accompanying material.
11. **[Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware / ACT](https://arxiv.org/abs/2304.13705).** Study action chunking, the conditional generative objective, teleoperation, and compounding-error motivation. The [ALOHA project](https://tonyzhaozh.github.io/aloha/) supplies system context.
12. **[FAST: Efficient Action Tokenization for Vision-Language-Action Models](https://arxiv.org/abs/2501.09747).** A focused reference on sequence-aware action tokenization. Compare reconstruction, token budget, and downstream policy behavior rather than assuming tokenization is lossless.
13. **[Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239).** A clear foundation for noise prediction and iterative generation. Map the image formulation carefully to action chunks and control conditioning.
14. **[Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747).** Learn the vector-field/ODE viewpoint and conditioning paths. Check endpoint and time conventions when comparing implementations.
15. **[Decision Transformer: Reinforcement Learning via Sequence Modeling](https://arxiv.org/abs/2106.01345).** Useful for trajectory sequence modeling and return conditioning; also useful for understanding why that setup differs from ordinary BC and VLAs.
16. **[Learning Latent Plans from Play / related goal-conditioned sequence work](https://arxiv.org/abs/1903.01973).** An optional branch into play data and latent plans. Treat it as further study, not a prerequisite for the seven projects.

### Robot datasets, benchmarks, and tooling

17. **[Open X-Embodiment: Robotic Learning Datasets and RT-X Models](https://arxiv.org/abs/2310.08864).** The central public reference for heterogeneous robot-data aggregation and cross-embodiment evaluation. Inspect individual dataset semantics rather than treating the aggregate as uniform.
18. **[DROID: A Large-Scale In-The-Wild Robot Manipulation Dataset](https://arxiv.org/abs/2403.12945).** Study collection diversity, metadata, real-world variation, and dataset documentation. Useful source for targeted data-engineering exercises.
19. **[BridgeData V2](https://arxiv.org/abs/2308.12952).** A public dataset for studying multi-task manipulation and transfer. Review its collection and action conventions before mixing it with other sources.
20. **[RLDS: An Ecosystem to Generate, Share and Use Datasets in Reinforcement Learning](https://arxiv.org/abs/2111.02767).** Read for standardized episode/step structure and dataset interoperability.
21. **[What Matters in Learning from Offline Human Demonstrations for Robot Manipulation](https://arxiv.org/abs/2108.03298).** The robomimic study is a practical foundation for BC experiments, demonstration datasets, and algorithm comparisons. Use the [documentation](https://robomimic.github.io/) for current formats and APIs.
22. **[LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning](https://arxiv.org/abs/2306.03310).** Useful for language-conditioned multi-task simulation and generalization suites. Keep its evaluation protocol versioned in your own work.
23. **[RLBench: The Robot Learning Benchmark and Learning Environment](https://arxiv.org/abs/1909.12271).** A broad manipulation benchmark useful for task interfaces and demonstrations; be explicit about simulator and task versions.
24. **[ManiSkill](https://arxiv.org/abs/2107.14483).** A manipulation benchmark and simulation framework for studying demonstrations and scalable simulated training/evaluation.
25. **[LeRobot](https://github.com/huggingface/lerobot).** Practical open-source tooling and dataset/policy ecosystems for accessible robot learning. APIs evolve; pin a commit and read licenses for code, models, and datasets separately.
26. **[robosuite](https://robosuite.ai/).** A modular manipulation-simulation framework. Useful for controller and environment experiments built on MuJoCo.

### Vision, language, and multimodal representations

27. **[Attention Is All You Need](https://arxiv.org/abs/1706.03762).** Revisit attention, masks, positional information, and encoder/decoder structure. These are the mechanics behind many policy backbones.
28. **[An Image Is Worth 16×16 Words / ViT](https://arxiv.org/abs/2010.11929).** The foundational patch-token ViT reference. Understand resolution, patch size, token count, and pretrained-versus-scratch behavior.
29. **[Learning Transferable Visual Models from Natural Language Supervision / CLIP](https://arxiv.org/abs/2103.00020).** A reference for contrastive vision-language representations and their strengths and limits.
30. **[Sigmoid Loss for Language Image Pre-Training / SigLIP](https://arxiv.org/abs/2303.15343).** Study the alternative contrastive loss and visual-language representation training; downstream robot performance still requires direct evaluation.
31. **[DINOv2: Learning Robust Visual Features without Supervision](https://arxiv.org/abs/2304.07193).** Useful for self-supervised visual features and evaluating whether frozen spatial representations support manipulation.
32. **[Flamingo: A Visual Language Model for Few-Shot Learning](https://arxiv.org/abs/2204.14198).** A landmark architecture for interleaved visual-language conditioning and cross-attention interfaces.

### Distributed training and numerical systems

33. **[ZeRO: Memory Optimizations toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054).** Learn optimizer, gradient, and parameter state partitioning and their communication implications.
34. **[PyTorch FSDP: Experiences on Scaling Fully Sharded Data Parallel](https://arxiv.org/abs/2304.11277).** Connect the conceptual sharding model to implementation and operational lessons. Pair with [PyTorch FSDP docs](https://docs.pytorch.org/docs/stable/fsdp.html).
35. **[Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism](https://arxiv.org/abs/1909.08053).** A foundation for tensor-parallel transformer computation and interconnect tradeoffs.
36. **[GPipe: Efficient Training of Giant Neural Networks Using Pipeline Parallelism](https://arxiv.org/abs/1811.06965).** Study pipeline stages, microbatches, and bubbles before considering pipeline parallelism.
37. **[Mixed Precision Training](https://arxiv.org/abs/1710.03740).** Understand loss scaling, master weights, accumulation, and numerical stability rather than treating autocast as a free switch.
38. **[Training Deep Nets with Sublinear Memory Cost](https://arxiv.org/abs/1604.06174).** The activation-checkpointing compute/memory tradeoff underlying many large-model recipes.
39. **[PyTorch Distributed Documentation](https://docs.pytorch.org/docs/stable/distributed.html).** Current APIs for process groups, collectives, and distributed launch/debugging. Pair concepts with small correctness tests.
40. **[NCCL User Guide](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/).** Reference for GPU collective communication and topology-sensitive behavior. It does not replace cluster scheduler and networking documentation.

### Adaptation and model efficiency

41. **[LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685).** Derive which parameters and optimizer states are saved, then test what memory remains for activations and base weights.
42. **[Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531).** A foundational distillation reference. For policies, extend the analysis from output matching to states visited and closed-loop outcomes.
43. **[Safetensors](https://huggingface.co/docs/safetensors/index).** Practical documentation for a safe tensor-serialization format. Artifact provenance, hashes, licenses, and preprocessing remain separate requirements.

### Robotics middleware and simulation

44. **[ROS 2 Documentation](https://docs.ros.org/).** Start with topics, services, actions, parameters, QoS, and launch; then learn tf2 and rosbag through the current tutorials. Pin the distribution used in your project.
45. **[MuJoCo Documentation](https://mujoco.readthedocs.io/).** Reference for models, physics, and simulation APIs. Version model assets and simulator behavior with evaluation results.
46. **[Isaac Sim Documentation](https://docs.isaacsim.omniverse.nvidia.com/).** Current platform documentation for rendering, robotics simulation, and synthetic-data workflows. Assess hardware and licensing requirements before choosing it.
47. **[Gazebo Documentation](https://gazebosim.org/docs).** Current simulation and ROS-integration guidance. Select the supported release appropriate to the robot stack.

### Experiment management and evaluation practice

48. **[Hydra](https://hydra.cc/).** Configuration composition and overrides. Always save the resolved configuration; a tool does not guarantee reproducibility by itself.
49. **[MLflow Documentation](https://mlflow.org/docs/latest/)** and **[Weights & Biases Documentation](https://docs.wandb.ai/).** Examples of experiment/artifact tracking systems. Evaluate data governance, versioning, and reproducibility needs rather than collecting dashboards for their own sake.
50. **[DVC Documentation](https://dvc.org/doc).** One approach to data and pipeline versioning. Content hashes, immutable manifests, and external storage discipline are the key ideas.
51. **[Wilson, “Probable Inference, the Law of Succession, and Statistical Inference” (1927)](https://doi.org/10.1080/01621459.1927.10502953).** Historical source for the score interval used in the lab. For clustered or paired robot evaluations, study methods that match the actual sampling design.

### A five-step paper-reading practice

For each primary source, write a one-page source card:

1. What exact problem and system boundary does the paper define?
2. What are the observation, action, data, and training contracts?
3. Which controlled comparisons support each claim, and which claims are interpretation?
4. What details of scale, hardware, evaluation, or data prevent direct comparison with your project?
5. What is the smallest experiment that would test whether the idea transfers to your setting?

Then reproduce a mechanism at small scale: an action tokenizer's reconstruction, a diffusion/flow training step, a sharding/resume property, or an evaluation protocol. Reproducing a paper's headline number is often neither feasible nor the highest-value learning objective.

**Prove it:** Choose six sources—one VLA, one action head, one dataset, one distributed-systems paper, one robotics tool, and one evaluation reference. Publish source cards and a small reproduction or design artifact for each, explicitly separating the authors' evidence from your own result.
