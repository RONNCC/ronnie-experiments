# Verification notes

## Run locally

No install or build is needed to use the guide. Serve the repository root:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
node --test experiments/bronco-chip-verification/tests/models.test.cjs
```

Open `/experiments/bronco-chip-verification/`.

Optional developer-only browser checks use Playwright Core and an existing Chromium installation (neither is a runtime/site dependency):

```sh
CHROMIUM_PATH=/path/to/chromium node experiments/bronco-chip-verification/tests/browser.cjs
```

Set `PLAYWRIGHT_MODULE` to an absolute installed Playwright Core module path if it is outside this repository. The browser test expects the root server on port 8000.

## Checks completed, 28 October 2026

- Six Node model tests pass: three RTL mutations, exact failure transitions, producer valid/data stability under backpressure, deterministic/monotone coverage, and difficulty effects.
- RTL was reasoned through using pre-edge right-hand-side evaluation and post-edge nonblocking updates; it was **not compiled in an HDL simulator**. The JavaScript teaching model implements those state transitions. Traces start empty after a preceding drain edge rather than assuming ASIC power-up state. The reset case demonstrates a warm reset while occupied.
- Headless Chromium passed all three correct diagnoses, time scrubbing, signal toggle, test slider (including zero), all six flow steps, glossary filtering, answer reveals, internal anchors, hub registration, and the `../../` back-link.
- Page width checks at 1440, 390 and 320 pixels found no document overflow. Desktop/mobile screenshots were visually inspected outside the repository. Waveform and tables use SVG scaling and bounded local overflow respectively.
- Keyboard checks exercise range ArrowRight, signal button Enter, playbook button Space, and details Enter. Native inputs/buttons/details and visible focus styles are used. This is not a formal assistive-technology audit.
- No page JavaScript or console errors during browser tests. No external JavaScript, fonts, tracking, personal reader data, localStorage or network-backed lab services.
- `node --check` on scripts and `git diff --check` pass.

## Evidence boundaries

Directly read: YC company listing, current Rippling role, SemiWiki CEO interview and newer playbook/demo/DAC reporting, Semiconductor Engineering DAC 2025 reporting. Competitor offerings cross-checked against search-visible primary vendor pages (Synopsys VSO.ai, Cadence Verisium, Siemens Questa One). UVM and ready/valid descriptions are standard concepts, with standards links for further reading.

Verified means a linked source supports the narrow fact, not an audit of every company claim. Deployment, model choice, customer outcomes, biography and performance remain attributed reporting. Homepage retrieval was unreliable. LinkedIn search data was inconsistent/stale. The supplied ~16 people and ~$800K revenue were not corroborated; aggregator estimates differ and are explicitly unverified. No verified current total funding or valuation is asserted. Newer reporting is cited without turning it into an independently reproduced benchmark. No real customer artifacts or Bronco proprietary internals are included.

`TEXTBOOK.md` is a compact one-page handout intended for 9–10pt/narrow-margin printing; Markdown renderer pagination varies. The full textbook is `index.html`.
