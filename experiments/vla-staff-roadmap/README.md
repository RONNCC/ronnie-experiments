# VLA Staff Engineer — From Pixels to Reliable Robot Action

A standalone, ~23,000-word project-based fieldbook built around the public **Nidus Staff ML Engineer, VLA Training** role snapshot dated 27 October 2026. It teaches the complete robot-learning system and turns it into seven cumulative portfolio projects.

The material is independent and is not affiliated with Nidus. It does not claim that a tutorial can confer professional seniority, multi-node experience, physical-robot validation, or safety qualification. Projects make those evidence boundaries explicit.

## What is included

- **21 canonical chapters:** behavior cloning, VLA architectures, action chunking, diffusion and flow policies, pretraining/adaptation, robot data engineering, mixtures and curriculum, optimization, DDP/FSDP and model parallelism, reproducibility/release, evaluation, trajectory debugging, ROS 2 and simulation, physical validation, data collection, multi-embodiment transfer, portfolio projects, a 36-week plan, staff practice, and a complete role-to-evidence matrix.
- **Seven pet projects:** Glass-Box BC, Trajectory Foundry, TinyVLA, Scale & Release Lab, Policy Reliability Lab, Embodiment Adapter, and Real-Robot Release. Each has milestones, ablations, deliverables, a done gate, a stretch goal, and an anti-pattern.
- **Three interactive labs:** an idealized DDP/FSDP AdamW memory planner, temperature-based data-mixture explorer, and Wilson-interval/trial-planning calculator. They are transparent teaching arithmetic, not benchmarks or deployment advice.
- **51 annotated sources:** primary papers, official documentation, and the public job posting.
- **Printable single-file edition:** `TEXTBOOK.md`, generated from `chapters/`.

The reader is plain HTML/CSS/JavaScript with no runtime dependencies or network calls. Chapter search, reading progress, responsive layouts, reduced-motion handling, and print styles work without external assets.

## Regenerate and validate

From the repository root:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r experiments/vla-staff-roadmap/requirements-build.txt
.venv/bin/python experiments/vla-staff-roadmap/build.py
.venv/bin/python experiments/vla-staff-roadmap/build.py --check
node --test experiments/vla-staff-roadmap/tests/*.test.mjs
.venv/bin/python -m unittest discover -s experiments/vla-staff-roadmap/tests -p 'test_*.py'
```

Edit canonical files in `chapters/`, not generated `TEXTBOOK.md` or `index.html`. The build uses pinned Python-Markdown at build time; generated files are committed for the repository's branch-root GitHub Pages deployment. `build.py --check` detects stale generated files.

To preview locally, serve the repository root:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open `/experiments/vla-staff-roadmap/` on the appropriate preview host.

## Modeling caveats

- The memory lab assumes 16 decimal bytes per parameter for BF16 weights/gradients plus FP32 master weights and Adam moments. Ideal FSDP divides that static state across ranks; actual frameworks, temporary buffers, unsharded modules, and fragmentation can require more memory.
- The mixture lab computes `p_i ∝ n_i^alpha`; sampling probabilities do not measure data quality or guarantee better policy performance.
- The Wilson interval describes binomial sampling uncertainty under its assumptions. It does not include correlated trials, changing hardware, biased resets, or other systematic errors. The trial-count planner uses a normal approximation and is only a starting point.
- Physical-robot guidance is educational. Real work requires qualified supervision, manufacturer procedures, and a site-specific risk assessment.
