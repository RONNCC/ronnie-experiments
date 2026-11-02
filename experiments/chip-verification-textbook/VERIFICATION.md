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

## Expanded edition QA · 2 November 2026

The baseline counts above describe the original publication. This edition now has **22 numbered chapters and over 20,000 whitespace-separated words**, four required primary labs plus the retained evidence exercise. `REQUIREMENTS.md` maps the full public attachment to chapters, controls, and tests.

Additional generated-HTML inputs: `cdc-lab.html` (chapter 20) and `budget-lab.html` (chapter 22). The builder derives chapter IDs from numbered headings, preserving existing links as the book grows. Code and table overflow is confined to labeled, keyboard-focusable scroll regions; mobile navigation collapses, and controls/checkbox-label targets are at least 44px high.

### Results

- **16 Node test groups pass**, including the original 28,000 FIFO edges, the injected ordering escape, exact coincident CDC clock semantics, pulse/toggle/handshake distinctions, **2,640 CDC parameter combinations**, invalid controls, merged pulses, and agent budget caps/evidence ablations/worker invariance.
- Chromium tests pass every required lab, the retained evidence exercise, keyboard activation, range-keyboard control, search/routes, 25 answers, unique IDs, fragment targets, 44px controls and checkbox labels, and no BODY overflow at **320, 390, and 1440px** while inspecting code and every primary lab.
- Screenshots of CDC, budget, and code at 320/390px and desktop overview were generated to ignored scratch storage and visually inspected. Long code/tables/diagrams scroll only inside their own region with visible cues; no body clipping or horizontal overflow workaround is used.
- Print with an active no-results search still exposes every chapter and answer. A Chromium **56-page A4 PDF** was generated in scratch storage and text extraction confirmed the SVA example, CDC chapter, agent budget chapter, and final drill are present. The PDF is a QA artifact, not a separately maintained deliverable.
- Browser network logging found zero external requests and zero page exceptions. No runtime packages or binary assets were added. Source-fetch limitations are disclosed in the textbook.

### Correctness review boundaries

The CDC model samples the old source level at coincident source/destination edges, propagates through two ideal destination stages, and counts output rising edges (pulse mode) or changes (toggle mode). Acknowledged mode adds a two-stage return path, refuses busy offers, and drains accepted events. It has no producer queue/retries, setup/hold aperture, jitter, analog metastability, or MTBF model. Physical CDC/RDC guidance explicitly separates digital protocol checks from reliability and implementation constraints.

The budget model consumes a fixed author-chosen recipe per case. It does not infer real model accuracy; unsupported outcomes abstain by construction. Concurrency changes only a disclosed ideal list-schedule estimate with adequate tokens assumed. Real false-positive rates and confidence intervals cannot be derived from it.

SV/SVA/UVM snippets are illustrative and annotated, not a shipped executable HDL verification environment. The occupancy controller is explicitly incomplete without storage and pointers. The stability property uses sampled synchronous-reset semantics, distinguished from asynchronous `disable iff`. Two-flop level synchronization is not advertised as safe for arbitrary buses or pulses, and synchronized Gray-pointer samples are not incorrectly constrained to single-bit change after skipped source increments. No chip signoff or commercial performance claim follows from these tests.
