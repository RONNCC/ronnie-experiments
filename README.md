# Ronnie's Experiments & Visualizations

Interactive prototypes, physics simulations, algorithmic visualizers, and learning sandboxes.

- **Live GitHub Pages:** [https://ronncc.github.io/ronnie-experiments/](https://ronncc.github.io/ronnie-experiments/)
- **Repository:** [https://github.com/RONNCC/ronnie-experiments](https://github.com/RONNCC/ronnie-experiments)
- **Local Path:** `~/src/ronnie/ronnie-experiments` (`~/src/priv/ronnie/ronnie-experiments`)

---

## Starter Experiments

| Experiment | Category | Description | Path |
|---|---|---|---|
| **Particle Vector Field** | Visualizations | Real-time canvas flow field with trigonometric velocity vectors, gravitational cursor attraction, and palette controls. | [`experiments/particle-field/`](experiments/particle-field/) |
| **Sorting Visualizer** | Algorithms | Step-by-step visualizer for Quicksort, Mergesort, Bubble Sort, and Selection Sort with comparison & swap counters. | [`experiments/sorting-visualizer/`](experiments/sorting-visualizer/) |
| **Cellular Automata Lab** | Simulations | Conway's Game of Life with interactive cell drawing and preset oscillators (Gosper Gun, Pulsar, Acorn). | [`experiments/cellular-automata/`](experiments/cellular-automata/) |

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
