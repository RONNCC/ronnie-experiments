# Advanced Finance Interview Textbook

Eight integrated cases now include an added M&A financing/EPS bridge alongside the seven role cases.

A dependency-free static ES-module app with the original seven tracks and 70 original topics retained. Each topic is paired by stable ID with an advanced module containing three topic-specific deep dives, two challenging follow-up questions with model answers, a diagnostic drill with a worked answer and scoring rubric, and links that state which claims the source supports. Topic-specific judgment and technical-boundary modules supplement those sections. A structural word-count check finds an average of about 654 substantive advanced words per topic (minimum 600), counting named sections, judgment/boundary analysis and source-claim notes; this is an editorial coverage measure, not a guarantee that every word is instructional prose. The advanced modules are separate from the base track files so the original lessons, examples, formulas, three interview questions and self-checks remain intact.

## Run locally

Serve this directory with any static web server. From the repository root:

```sh
python3 -m http.server 4173 --bind 0.0.0.0 --directory experiments/finance-interview-textbook
```

No build step, third-party runtime library, paid service, account or personal information is required. Progress is stored in local browser storage and is never transmitted. The browser renders one selected track (10 topics) at a time; search results are loaded in batches of 10. Native `<details>` answer reveals and print styles support keyboard, screen-reader and longer-session use.

## Validate and rebuild downloadable case outputs

```sh
node --test experiments/finance-interview-textbook/tests/*.test.mjs
node experiments/finance-interview-textbook/scripts/build-capstone-outputs.mjs
```

The CSV fixtures under `cases/inputs/` are the source of truth. The case engine in `cases/capstones.js` is shared by the browser and Node tests. `cases/outputs/` are committed generated result CSVs; tests recalculate every metric from the input fixtures and compare the results, and include tie-out/sensitivity checks. Case assumptions and modeling boundaries are documented in `cases/README.md` and on-page reveal panels.

## Source integrity

Official and practitioner educational sources are hyperlinked at the topic level with a short description of the supported claim. The cited material is not represented as endorsing the invented case inputs or conclusions. Sources actually checked during this edition included SEC investor/filing guidance; NYU Stern/Damodaran on DCF; CFA Institute readings on free cash flow, multiples, private equity/debt, alternative investment returns, bond convexity and portfolio risk; FINRA Series 7/66, Reg BI, bond duration/due diligence and research-conflict material; NASAA Series 66 guidance; OCC's options disclosure page; and CFP Board's standards. A further reading is linked where useful, but this does not claim every linked page has been audited line-by-line. Recheck live exam, regulatory, tax and legal material before relying on it.

All case facts are invented for learning. The wealth case is explicitly illustrative and is not individualized financial, investment, tax or legal advice. It uses no current tax threshold. Rules, exams, professional duties and tax treatment depend on role, facts, year and jurisdiction.
