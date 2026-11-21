# How Financial Markets Work

A standalone, static visual textbook for a public audience. No build step is required to read it. The page works without JavaScript; JavaScript enhances the chapter contents, searchable navigation and calculators.

## Add a chapter

1. Add a semantic `<article class="chapter">` to `index.html` inside `#chapter-list`.
2. Give it a permanent, descriptive ID such as `c12-repo` and a `data-title`. Never recycle or casually rename a chapter ID: contents links and shared deep links depend on it.
3. Include a chapter number, short introduction, at least one original inline SVG in a `<figure>`, and a caption that explains what the figure teaches. Give each SVG a unique `<title>` and `<desc>`, connect them with `aria-labelledby`, and keep labels readable at mobile size. On narrow screens, a figure may scroll within its own container, but the page itself must not overflow horizontally.
4. Explain new terms in plain English at first use and add a glossary entry with a stable `term-*` ID in `#glossary`. Link the first use to that entry. Put answers to comprehension questions in native `<details>` elements; keep the essential explanation visible outside the reveal.
5. Include a concrete worked example with its units and assumptions, a short recap and at least one comprehension question. Identify invented figures as illustrative and do not label them as market data.
6. Add authoritative sources close to the claims they support. Add a numbered source entry in `#sources` with a stable `source-*` ID. Prefer original rules, official system descriptions, central bank publications, CPMI/BIS papers and primary investigations. Record dates for claims that can change.
7. Add any interactive element as a progressive enhancement in `app.js`; the base HTML must remain understandable. Use native controls, explicit labels and units, keyboard visible focus, live result text and a statement of assumptions. Keep calculations in small named functions and test boundary values.
8. Add the chapter to the contents fallback list in `index.html`. The runtime table of contents is generated from `article.chapter[data-title]`, so the fallback is only needed when JavaScript is disabled. Run the checks below.

## Add a figure

Prefer an original inline SVG with a focused learning goal, a `viewBox`, descriptive title and description, explicit marker definitions for arrows, readable labels and a textual caption. Give every SVG ID a figure-specific prefix to prevent collisions on a single page. Use patterns and labels as well as color so meaning does not depend on color alone. Test at a phone width and in print.

## Sources and scope

The sources appendix is maintained in the page so claim links remain close to context. Keep institutional claims narrowly phrased, preserve the publication date, and distinguish the institution's description of its own system from a universal practice. Financial examples are educational and not personalized trading advice.

## Local checks

From the repository root:

```sh
python -m unittest discover -s experiments/financial-markets-textbook/tests -v
node --check experiments/financial-markets-textbook/app.js && node --test experiments/financial-markets-textbook/tests/logic.test.mjs
node scripts/build-pagefind.mjs
```

Serve the repository root over HTTP to test the experiment route. Test a direct chapter hash, search for a chapter, keyboard operation of all controls, narrow viewport behavior and browser print preview. The Pagefind build updates the repository's shared `pagefind/` bundle from `experiments.json`; do not replace or delete unrelated experiments.
