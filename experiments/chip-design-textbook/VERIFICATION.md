# Verification — Chip Design, Beyond Verification (Volume 2)

Verified 2 November 2026 before opening the pull request. All commands run against the
shipped static site (`index.html` + `styles.css` + `app.js` + `model.js`); the site needs
no build step and makes zero external requests.

## Model tests (15 deterministic tests)

`node --test tests/model.test.js` — **15/15 pass**. Covers all four demo models:
RTL playground (reset/enable semantics, four-state X propagation under the missing-reset
bug, width wrap, traffic-FSM sequencing and the stuck-in-green bug, generated Verilog
tracking parameters), pipeline stage ladder (1x/10x/100x ordering), HLS toy schedule
(latency/II/adders per unroll and pipeline setting), and node economics (gross-die closed
form at three checked points, Poisson yield, amortization, validation).

## Content tests (9 checks)

`python3 -m unittest discover -s tests -p content_test.py` — **9/9 pass**:
title + meta description set; Volume 1 relationship links (intro + footer); 17 sections;
15 "How people do this today" boxes each carrying Workflow/Tools/Pain points; the
spec-to-silicon pipeline map and 1x/10x/100x rule of thumb in Start here; all four demo
fragments present in both `labs.html` and `index.html`; required attributed facts (2026
Wilson/Siemens 5% first-silicon figure, 14.4% prior figure, logic/functional errors as
primary respin cause, 72.5% TSMC share, UCIe, HLS-Eval, ForgeHLS 19%→69%, AgentEngineer,
Autopilot, ChipStack, Fuse EDA, MPW, Efabless, GDSII, PDK, reticle, Poisson); 123
glossary entries with the required term set and filter controls; all internal anchors
resolve with unique IDs and no external runtime assets; the sources section carries
[press]/[research]/[primary]/[estimate]/[rule of thumb]/[open]/[standard] labels.

## Browser smoke test (every chapter + every demo)

`CHROMIUM_PATH=… node tests/browser.cjs` against a local `python3 -m http.server 8000`
— **PASS**, exercising in a real Chromium:
- every one of the 17 chapter sections renders with its heading; 15 today boxes; 123 glossary entries;
- **Demo A (RTL playground):** step/run edges, waveform drawn, cycle history, gated-enable
  hold, the "break it" missing-reset bug showing X propagation, the traffic-FSM variant with
  its missing green→yellow transition bug, live Verilog pane tracking parameters, session reset;
- **Demo B (pipeline cost explorer):** all 7 stages, detail panels for spec (1x),
  synthesis (10x), tapeout (100x), keyboard activation;
- **Demo C (HLS side-by-side):** baseline/unroll-8/pipeline variants swap both code panes
  and the metrics (add­ers, initiation interval);
- **Demo D (node economics):** node presets set wafer/defect/NRE defaults (2nm → $30,000),
  die/volume sliders recompute (50 mm² → 1319 gross dies/wafer, matching the unit test),
  metrics grid and disclosed-model notes render;
- reader furniture: search filtering, three reading routes, glossary filter/clear, print
  media shows all chapters despite active filters, footer links to Volume 1 (`../chip-verification-textbook/`)
  and the experiments index (`../../`) present;
- no duplicate IDs; every internal `#anchor` resolves;
- **widths 1440, 375, and 320 px:** no document or body overflow at any width while
  scrolling every lab and the glossary; all controls ≥ 44 px; sticky shortcut bar stays in
  the viewport; screenshots archived (`desktop.png`, `mobile-375.png`, `mobile-320.png`,
  `rtl-lab-375.png`, `node-lab-desktop.png`) and inspected;
- **zero console errors, zero page errors, zero external network requests.**

## Reproducing

1. `python3 -m pip install Markdown==3.11.2` then `python3 build.py` regenerates
   `index.html` deterministically from `TEXTBOOK.md` + `labs.html` (committed output; no
   build step needed to serve or publish the site).
2. `node --test tests/model.test.js`
3. `python3 -m unittest discover -s tests -p content_test.py`
4. Serve the repo root (`python3 -m http.server 8000`), then run `tests/browser.cjs` with
   `playwright-core` available and `CHROMIUM_PATH` pointing at a Chromium binary.
