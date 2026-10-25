# Agent Harnesses — A Systems Textbook

An original, source-linked textbook on AI agent harnesses, intended for advanced technical interview preparation spanning model pre-training, post-training, tool use, systems, safety, and evaluation.

- **Read online:** `index.html` (GitHub Pages path `experiments/agent-harness-textbook/`). Static site; no runtime dependencies or network calls.
- **Printable source:** `TEXTBOOK.md` (generated from canonical chapters).
- **Canonical chapters:** `chapters/00-*.md` through `chapters/12-*.md`.
- **Three tested perspectives:** control allocation; feedback and observability; state and time horizon. The book tests where each lens explains results, identifies shortcomings, and refines the model with budgets/evidence.
- **Interactive lab:** a transparent sequential-reliability calculator; its independence assumptions are explicit and it is not a deployment predictor.
- **Sources:** 48 annotated papers, engineering posts, specifications, and repositories. Company claims and preprint results are labeled as such; source list is snapshot dated 25 October 2026.

## Build and validate

```bash
python3 -m pip install -r experiments/agent-harness-textbook/requirements-build.txt
python3 experiments/agent-harness-textbook/build.py
python3 experiments/agent-harness-textbook/build.py --check
node --test experiments/agent-harness-textbook/tests/*.test.mjs
python3 -m unittest discover -s experiments/agent-harness-textbook/tests -p 'test_*.py'
```

Serve the repository root with `python3 -m http.server 8000 --bind 0.0.0.0` and open `/experiments/agent-harness-textbook/`. The build uses pinned Python-Markdown; committed HTML supports the existing static Pages deployment.

## Caveats

This is a synthesis of public sources, not a report of proprietary lab architectures or internal training processes. “Harness” has no fully standardized boundary, so the book declares a working definition. Benchmark scores depend on model, scaffold, environment, evaluator, and budget. Verify current APIs and release/license status against primary project docs before using them.
