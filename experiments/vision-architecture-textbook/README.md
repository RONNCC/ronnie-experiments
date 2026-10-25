# Vision Models & ML Architecture — A Four-Lens Textbook

A standalone, ~27,000-word research-edition textbook on the current state of the art in vision models and machine-learning architecture. It answers one question thoroughly: **why do we use transformers (or convolutional networks, or state-space models) — and when is that choice wrong?** The answer is organised around four named perspectives that every claim is argued through:

1. **Inductive bias** — what priors are baked in, and what does each cost?
2. **Optimization** — how well does it train, from scratch and at scale?
3. **Expressivity** — what can it represent, and what are its proven limits?
4. **Systems** — how does it map to real hardware, and where does the roofline bind?

The central thesis is that **architecture is a four-way tradeoff with no universal optimum** — the frontier is a portfolio of specialised backbones, not a single winner. The book states, for each claim, the observation that would falsify it.

- **Read online:** `index.html` (GitHub Pages path `experiments/vision-architecture-textbook/`). No runtime dependencies or network calls.
- **Single printable source:** `TEXTBOOK.md` (generated; use the reader's Print command for PDF).
- **Canonical chapters:** `chapters/00-*.md` through `chapters/22-*.md`. Edit these, not the generated files.
- **Lenses lab:** `app.mjs` and pure `logic.mjs` offer a roofline explorer, a prefill/decode attention-intensity calculator, and a backbone recommender. They are transparent teaching heuristics, not benchmarks or deployment advice.

## What is covered

**Part I — Inductive bias.** CNN priors vs. ViT priors; the data-scale crossover; soft biases and hybrids (ConViT, CoAtNet, MambaVision); reverse migration (ConvNeXt, RepViT, MobileNetV4); geometry, packing and variable resolution (NaViT, FlexiViT, NaFlex).

**Part II — Optimization.** BatchNorm vs. LayerNorm and the modern recipe; scaling laws, data curation and self-supervision (MAE, DINOv3, SigLIP 2); the four-stage pipeline; RLVR, on-policy distillation and multimodal post-training (Thinking Machines, Perception-R1, Vision-SR1).

**Part III — Expressivity.** What attention computes, in three senses; rank collapse in depth and width; memory, associative recall and the token budget; state-space models and linear attention; where hybrids win.

**Part IV — Systems.** The roofline and the memory wall; attention kernels and FlashAttention; convolutional kernels and mobile silicon; production deployment — parallelism, quantisation, KV cache, distillation.

**Part V — The state of the art.** The backbone landscape (DINOv3, SigLIP 2, Perception Encoder, ConvNeXt V2, RepViT, VMamba); dense prediction and segmentation (DETR → SAM 3); vision-language and unified models; generation (DiTs, HunyuanVideo 1.5); and a four-lens reading of public research from Anthropic and Thinking Machines.

**Part VI — Interview preparation.** A one-page mental model and forty questions with answer sketches, arranged by lens, plus a fully annotated source list of 100+ papers and lab posts.

## Regenerate

```bash
python3 -m pip install -r experiments/vision-architecture-textbook/requirements-build.txt
python3 experiments/vision-architecture-textbook/build.py
python3 experiments/vision-architecture-textbook/build.py --check
node --test experiments/vision-architecture-textbook/tests/*.test.mjs
python3 -m unittest discover -s experiments/vision-architecture-textbook/tests -p 'test_*.py'
```

The build uses only pinned Python-Markdown at build time; the generated HTML is committed for the existing branch-root GitHub Pages deployment. To preview locally, serve the repository root with `python3 -m http.server 8000 --bind 0.0.0.0` and open `/experiments/vision-architecture-textbook/`. The source and generated site share stable `#chapter-N` anchors. `build.py --check` detects stale generated files.

## Provenance and caveats

Every research claim in the book carries a source link in Chapter 22, and numbers are reported as the authors published them under their own protocols. Comparing figures across papers without matching patch size, resolution, data mix and training duration is the most common way this field produces false conclusions — the book flags where that caveat applies.

The interpretation of Anthropic's and Thinking Machines' public research in Chapter 20 is a reading of public material, not insider information. The lab's arithmetic models are illustrative teaching tools with explicit simplifications (a fixed 192 KB SRAM tile budget, a single ridge point per accelerator), not performance measurements.
