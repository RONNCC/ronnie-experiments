# Ronnie's Experiments & Visualizations

Interactive prototypes, physics simulations, algorithmic visualizers, and learning sandboxes.

- **Live site:** [https://sghose.me/ronnie-experiments/](https://sghose.me/ronnie-experiments/)
- **Repository:** [https://github.com/RONNCC/ronnie-experiments](https://github.com/RONNCC/ronnie-experiments)
- **Local Path:** `~/src/ronnie/ronnie-experiments` (`~/src/priv/ronnie/ronnie-experiments`)

---

## Starter Experiments

| Experiment | Category | Description | Path |
|---|---|---|---|
| **Vision Models & ML Architecture — A Four-Lens Textbook** | Education | Source-linked deep dive on current vision-model architecture, answering "why transformers, and not CNNs?" through four named perspectives: inductive bias, optimization, expressivity and systems. Covers the data-scale crossover, hybrids and reverse migration, rank collapse and registers, self-supervised pre-training, RLVR and on-policy distillation, variable resolution, FlashAttention and the roofline, mobile silicon, dense prediction, VLMs, video DiTs, plus a four-lens reading of public research from Anthropic and Thinking Machines. Forty interview drills and a printable single-file `TEXTBOOK.md`. | [`experiments/vision-architecture-textbook/`](experiments/vision-architecture-textbook/) |
| **Applied AI Systems — A Design and Operations Textbook** | Education | Original, source-linked deep dive expanding a supplied agentic-engineering roadmap into model/inference mechanics, retrieval, typed tools, durable workflows, threat modeling, evaluation, economics, production, and voice. Eight hypothetical worked architectures, design-review drills, a printable single-file `TEXTBOOK.md`, and an interactive tradeoff/capacity lab. | [`experiments/ai-systems-textbook/`](experiments/ai-systems-textbook/) |
| **Private Markets & Opto — An Operator's Field Guide** | Education | How private markets actually run: major players first (pensions, sovereign funds, endowments, insurers, family offices, hedge funds, mega alternative managers, gatekeepers, infrastructure), then asset classes/vehicles, fund mechanics (J-curve simulator), metrics and pacing calculators — plus a full Opto Investments brief: Build/Fundraise/Manage platform, verified-vs-unverified claims, engineering blog (bitemporal data, backfilling, Fund Admin), operating-leverage model, recent developments, people, glossary and self-test. Printable TEXTBOOK.md + one-page brief included. | [`experiments/private-markets-opto/`](experiments/private-markets-opto/) |
| **Inside Legal AI — Systems Design Field Guide** | Education | Interactive, evidence-labeled systems-design deep dives for Docusign IAM, EveOS, Harvey, CoCounsel Legal, and Legora aOS: feature matrix, request traces, rough architecture diagrams, data / inference pipelines, evaluation plans, and interview-ready redesign prompts. | [`experiments/legal-ai-systems/`](experiments/legal-ai-systems/) |
| **Eliquis, Modern Blood Thinners & Alcohol: Inside Your Brain** | Education | Plain-English interactive brain cutaway, microscopic blood-vessel patch simulator, DOAC family tree, hangover-vs-bleed unmasker, and 48-hour body curve lab explaining how modern blood thinners and alcohol interact inside your brain and body. | [`experiments/brain-blood-thinners/`](experiments/brain-blood-thinners/) |
| **Thin Film Lab: ALD vs PVD** | Education | Zero-background on-ramp (why deposit nanometer-thin films at all — chips, lenses, implants, crisp packets) plus interactive labs on Atomic Layer Deposition vs. Physical Vapor Deposition: self-limiting reactions, trench conformality, and real growth curves. | [`experiments/ald-pvd-lab/`](experiments/ald-pvd-lab/) |
| **Tabby Slink** | Visualizations | A detailed 3D brown mackerel tabby on a low nocturnal stalk through a moonlit room. | [`experiments/tabby-slink/`](experiments/tabby-slink/) |
| **Particle Vector Field** | Visualizations | Real-time canvas flow field with trigonometric velocity vectors, gravitational cursor attraction, and palette controls. | [`experiments/particle-field/`](experiments/particle-field/) |
| **Sorting Visualizer** | Algorithms | Step-by-step visualizer for Tim Sort, Quicksort, Mergesort, Heapsort, Shell Sort, Radix Sort, Bubble, and Selection Sort. | [`experiments/sorting-visualizer/`](experiments/sorting-visualizer/) |
| **Cellular Automata Lab** | Simulations | Conway's Game of Life with interactive cell drawing and preset oscillators (Gosper Gun, Pulsar, Acorn). | [`experiments/cellular-automata/`](experiments/cellular-automata/) |
| **Lower Leg Circulation & DVT Visualizer** | Simulations | Interactive educational model of calf-muscle pumping, venous return, healthy vs damaged valves, and the ~3-month clot-healing window. | [`experiments/lower-leg-circulation/`](experiments/lower-leg-circulation/) |

---

## How to Add a New Experiment

Adding a new experiment takes two simple steps:

1. **Create an experiment directory:**
   ```bash
   mkdir -p experiments/my-new-experiment
   # Add your index.html (and any js/css/assets)
   ```

2. **Register it in `experiments.json`:**
   Add a JSON entry to the array:
   ```json
   {
     "id": "my-new-experiment",
     "title": "My New Experiment",
     "description": "Short summary of what this tests or visualizes.",
     "path": "experiments/my-new-experiment/",
     "category": "Visualizations",
     "tags": ["WebGL", "Math", "Interactive"],
     "date": "2026-10-02"
   }
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add my-new-experiment"
   git push origin main
   ```
   GitHub Pages updates automatically upon push.

---

## Local Development

Run any static HTTP server from the repository root:

```bash
# Python
python3 -m http.server 8000

# or Bun / Node
npx serve .
```

Then open `http://localhost:8000`.

---

## GitHub Pages Configuration

- **Source:** Deploy from branch
- **Branch:** `main`
- **Folder:** `/` (root)
- **Bypass Jekyll:** `.nojekyll` enabled in root
