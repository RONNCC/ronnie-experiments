# Applied AI Systems — Design and Operations Textbook

A standalone, ~20,000-word engineering textbook based on the *themes* of the user-supplied 20-page 2026 roadmap by Dr. Maryam Miradi, expanded into models, inference, agents, workflows, typed tools, state, retrieval, security, evaluation, operations, voice, eight hypothetical system designs, design-review drills, and technical appendices. The PDF is **not** redistributed. All case-study numbers are illustrative; source links appear in Chapter 28.

- **Read online:** `index.html` (GitHub Pages path `experiments/ai-systems-textbook/`). No runtime dependencies or network calls.
- **Single printable source:** `TEXTBOOK.md` (generated; use the reader's Print command for PDF).
- **Canonical chapters:** `chapters/00-*.md` through `chapters/07-*.md`. Edit these, not the generated files.
- **Design lab:** `app.mjs` and pure `logic.mjs` offer a transparent mechanism selector and an assumption-based cost/capacity calculator. They are educational heuristics, not vendor prices or policy decisions.

## Regenerate

```bash
python3 -m pip install -r experiments/ai-systems-textbook/requirements-build.txt
python3 experiments/ai-systems-textbook/build.py
python3 experiments/ai-systems-textbook/build.py --check
node --test experiments/ai-systems-textbook/tests/*.test.mjs
python3 -m unittest discover -s experiments/ai-systems-textbook/tests -p 'test_*.py'
```

The build uses only pinned Python-Markdown at build time; the generated HTML is committed for the existing branch-root GitHub Pages deployment. To preview locally, serve the repository root with `python3 -m http.server 8000 --bind 0.0.0.0` and open `/experiments/ai-systems-textbook/`. The source and generated site use stable `#chapter-N` anchors. `build.py --check` detects stale generated files.

## Scope and caveats

The learning material is original synthesis and hypothetical reference engineering, not insider information, legal/medical/security advice, a safety certification, or a guarantee of any outcome. Dynamic provider features and prices must be rechecked before a real deployment. Data-security and authorization examples describe patterns, not a complete ready-to-run payment or incident-response implementation.
