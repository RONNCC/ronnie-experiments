# Build and verification notes

## Scope

New independent experiment at `experiments/chip-verification-textbook/`. The introductory `bronco-chip-verification/` is linked but unchanged. Root catalog and README receive one additive registration each. No runtime dependencies, analytics, external fonts, network calls, forms, cookies, or local storage. Public company/job sources are attributed in the book; all labs are synthetic and local.

`TEXTBOOK.md` is the canonical prose. `index.html` is a checked-in generated static deliverable, so Pages needs no build pipeline. `labs.html` contains the three teaching widgets inserted at chapters 4, 9, and 12. `model.js` is shared between the browser and Node tests. No HDL simulation or commercial product benchmark is implied by these tests.

## Rebuild

From repository root:

```sh
python3 -m venv .venv
.venv/bin/pip install -r experiments/chip-verification-textbook/requirements.txt
.venv/bin/python experiments/chip-verification-textbook/build.py
node --test experiments/chip-verification-textbook/tests/model.test.js
python3 -m http.server 8000 --bind 0.0.0.0
```

Open `/experiments/chip-verification-textbook/`. Editing Markdown requires regenerating HTML. No package install is needed to read or deploy the experiment.

For optional browser tests, install Playwright in a scratch directory (not the experiment), make its modules available through `NODE_PATH`, install a supported Chromium, and run:

```sh
node experiments/chip-verification-textbook/tests/browser.cjs
```

`CHROMIUM_PATH` can override the browser binary. Browser tests assume the static server above is running. The test does not make any external requests. Optional screenshots go to `/tmp`, not Git.

## Verified on 1 November 2026

- Approximately 13,000 words (12,989 by whitespace count at initial build), 18 numbered chapters, 25 native answer disclosures, reading routes, glossary, and source ledger.
- Eight Node test groups pass: no empty bypass; full simultaneous replacement; blocked full push and reset dominance; all pre-occupancy/offer truth-table combinations; 28,000 deterministic stream edges across depths 1–7 checking ordering/count/pointer wrap; atomic invalid-input rejection; raw/reachable coverage denominators; missing/truncated evidence abstention.
- Headless Chromium browser test passes: routes, search, print visibility even during an active search, all 25 answers rendered, full replacement with old head output, invalid data rejection, 75% versus 100% coverage denominator example, evidence gate, disclosure interaction, valid fragment links, and no horizontal document overflow at 1440, 390, or 320 pixels.
- Browser run captured zero JavaScript exceptions and zero external requests. Used Playwright and an npm-distributed Chromium binary with its bundled shared libraries in a scratch environment; none is shipped with the site.
- Source pages were read directly using public web retrieval. No private connectors or personal sources used. Company performance metrics are explicitly labeled as marketing claims without an independently established benchmark.

## Limits

The FIFO lab models a fixed-depth-four, eight-bit, single-clock contract. The pure model supports other positive depths for tests, but does not claim to simulate finite-width pointer RTL, memory-macro collision semantics, analog timing, CDC, or synthesized hardware. The coverage example is a small categorical cross, not a stochastic performance model. The evidence gate is a deterministic decision exercise, not an LLM. Browser checks are smoke tests, not a comprehensive accessibility audit or proof of correctness. Real HDL portfolio work needs pinned simulation/formal tools and independent verification.
