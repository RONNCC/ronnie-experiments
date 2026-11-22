# How the US Healthcare System Works

A standalone, static visual textbook for a public audience. No build step is required to read it. The page works without JavaScript; JavaScript enhances the chapter contents, searchable navigation, calculators, claim stepper and EOB decoder.

## Add a chapter

1. Add a semantic `<article class="chapter">` to `index.html` inside `#chapter-list`.
2. Give it a permanent, descriptive ID such as `c12-rural-health` and a `data-title`. Never recycle or casually rename a chapter ID: contents links and shared deep links depend on it.
3. Include a chapter number, short introduction, at least one original inline SVG in a `<figure>`, and a caption that explains what the figure teaches. Give each SVG a unique `<title>` and `<desc>`, connect them with `aria-labelledby`, and keep labels readable at mobile size. On narrow screens, a figure may scroll within its own container, but the page itself must not overflow horizontally.
4. Explain new terms in plain English at first use and add a glossary entry with a stable `term-*` ID in `#glossary`. Link the first use to that entry. Put answers to comprehension questions in native `<details>` elements; keep the essential explanation visible outside the reveal.
5. Include a concrete worked example with its units and assumptions, a short recap and at least one comprehension question. Identify invented figures as illustrative; do not present them as real prices or real patient data.
6. Add authoritative sources close to the claims they support. Add a numbered source entry in `#sources` with a stable `source-*` ID, and re-verify every link in the appendix resolves to the intended source when you edit this book. Record the verification date.
7. Add any interactive element as a progressive enhancement in `app.js`; the base HTML must remain understandable. Use native controls, explicit labels and units, keyboard-visible focus, live result text and a statement of assumptions. Keep calculations in small named functions in `logic.mjs` and test boundary values in `tests/logic.test.mjs`.
8. Money arithmetic must be exact: round to cents inside the logic, and never let a small non-zero amount display as `$0.00` (`formatUsd` renders it as `<$0.01`). Chapter 11's episode totals are wired to `computeBrokenArmEpisode()` — if you change a line item there, change the printed tables too. `tests/logic.test.mjs` fails the build if they drift.
9. Add the chapter to the contents fallback list in `index.html`. The runtime table of contents is generated from `article.chapter[data-title]`, so the fallback is only needed when JavaScript is disabled. Run the checks below.

## Add a figure

Prefer an original inline SVG with a focused learning goal, a `viewBox`, descriptive title and description, explicit marker definitions for arrows, readable labels and a textual caption. Give every SVG ID a figure-specific prefix (`f12a`, …) to prevent collisions on a single page. Use patterns and labels as well as color so meaning does not depend on color alone. Every arrow path needs `fill="none"`; only marker arrowheads use fill. Raster-preview the SVG (e.g. with `sharp`) and check label placement for overlaps before committing. Test at a phone width and in print.

## Sources and scope

The sources appendix is maintained in the page so claim links remain close to context. Keep institutional claims narrowly phrased, preserve the verification date, and distinguish an agency's description of its own program from a universal rule. All patient stories, plans, bills and figures are illustrative and invented for teaching; nothing here is medical, legal, financial or insurance advice, and nothing is personal data.

## Local checks

From the repository root:

```sh
python -m unittest discover -s experiments/healthcare-system-textbook/tests -v   # runs tests/test_structure.py
node --check experiments/healthcare-system-textbook/app.js && node --test experiments/healthcare-system-textbook/tests/logic.test.mjs
node scripts/build-pagefind.mjs
```

Serve the repository root over HTTP to test the experiment route. Test a direct chapter hash, search for a chapter, keyboard operation of all controls, narrow viewport behavior and browser print preview. The Pagefind build updates the repository's shared `pagefind/` bundle from `experiments.json`; do not replace or delete unrelated experiments.
