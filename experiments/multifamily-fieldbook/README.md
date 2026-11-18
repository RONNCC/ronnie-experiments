# The multifamily fieldbook · Parcel Press

A static, beginner-first textbook for the product owner of coretsu-houses. The cover illustration is a schematic, not a depiction of River North. The book uses only the supplied project brief for project facts. Hypothetical costs, financing and rents are labeled; changing laws, designations, underwriting requirements and licenses have primary verification destinations.

## Reading paths

- Open `index.html` via a static HTTP server. Start reading through a three-term recall warm-up; study one concept at a time. The library follows institutions → zoning → income → debt and returns → costs → diligence.
- `#route` is the 60-minute interview route, including an immediate pocket brief. `#decisions` contains twelve product trade-offs with alternatives, a three-sentence defense, a hard follow-up and a self-critique.
- `#case` compares the two supplied River North packages. Debt service, debt and equity are explicitly hypothetical scratchpad inputs, never defaults or persisted project facts.
- `#glossary` searches and copies all terms or just terms from studied lessons. `TEXTBOOK.md` is the complete offline text edition with answer keys and verification notes.

No build or external services are required to **serve** the reader. All application assets, including the Geist font and its license, are local. Progress, quiz selections and rehearsal drafts are optional browser storage under one namespaced key. There are no accounts, telemetry or uploads. Objective application questions are graded; spoken and written defenses use an explicitly self-reported rubric, not a pretend AI grader. Clear only this book’s state from **Source checks → Clear local study data**.

## Maintain and validate

From the repository root:

```sh
node experiments/multifamily-fieldbook/build-text.mjs
node --test experiments/multifamily-fieldbook/tests/book.test.mjs
node scripts/build-pagefind.mjs
```

Lessons, decision briefs and verification destinations live in `content/`. Regenerate `TEXTBOOK.md` after a content change; the tests check parity. The repository’s existing GitHub Pages branch build publishes the static files and regenerated search bundle.

Optional browser smoke test: serve the repository root, install Playwright Core separately and point it at a local Chromium installation. There is no browser dependency in the shipped app.

```sh
# With the repository already served at http://127.0.0.1:8000
PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs \
BROWSER_PATH=/absolute/path/to/chromium \
node experiments/multifamily-fieldbook/tests/browser.mjs
```

Set `FIELD_URL` to an alternative experiment URL ending in `/`. The test checks desktop interactions, persistence, input boundaries, the text download, Pagefind and all reader routes at a 390-pixel viewport.
