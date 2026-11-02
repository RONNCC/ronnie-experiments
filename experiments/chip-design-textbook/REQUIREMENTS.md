# Requirements coverage — Chip Design, Beyond Verification (Volume 2)

Mapping of the supplied requirements file to the implementation in this folder.

| Requirement | Implemented location | Evidence / boundary |
|---|---|---|
| Deliverable path `experiments/chip-design-textbook/`, self-contained static site, no build step, no external runtime deps | `index.html`, `styles.css`, `app.js`, `model.js` | Committed static files; browser test asserts zero external requests; `build.py` only regenerates `index.html` |
| Title "Chip Design, Beyond Verification - From RTL to Tapeout" | `<title>`, hero, catalog | content test asserts the exact title |
| Reuse Volume 1's visual system so the books feel like a series | `styles.css` (Volume 1 stylesheet + clearly-marked additive demo styles), shared page skeleton (top bar, reader-bar, sidebar, hero, `.lab`, `.metrics`, print rules) | Screenshots `desktop.png`, `mobile-*.png` inspected; same fonts, colors, layout patterns |
| Link prominently to Volume 1 from the intro ("Volume 1 covered checking chips; this volume covers designing them") | Intro paragraph, sidebar "↗ Volume 1", footer | content test asserts phrase + ≥2 links |
| Do not re-teach verification mechanics | Chapter 8 formally defers to Volume 1 for SVA/coverage mechanics; FIFO/ready-valid references point outward | Chapter text |
| 17 listed sections (start-here, routes, ch. 3–15, glossary+checklist, sources) | `TEXTBOOK.md`, generated `index.html` | 17 sections; content + browser tests |
| Each chapter ends with a "How people do this today" box (workflow / tools / pain points) | 15 boxed endings (chapters 1–15), `.today` styles | content test asserts 15 boxes × 3 labeled lines |
| Start here: spec-to-silicon pipeline map with diagram | Ch. 1 static stage diagram + Demo B's interactive diagram | browser test exercises Demo B |
| Reading routes: software engineer / new grad / product-minded | Ch. 2 + hero route buttons (`app.js` route map) | browser test clicks a route |
| Ch. 3 first-pass-silicon figure: small fraction right the first time; failures trace to logic/spec bugs | 2026 Siemens/Wilson study (5% first-silicon, 14.4% in 2024, logic/functional errors primary respin cause), with survey caveats | Sources ledger [press]; content test asserts figures |
| Ch. 7 HLS limits (unreadable/unoptimized output, hand tuning) + LLM-for-HLS public research | HLS-Eval (arXiv:2504.12268), ForgeHLS (arXiv:2507.03255, 19%→69%), C2HLSC/HLSPilot/LHS | content test asserts citations |
| Ch. 12 foundry landscape (TSMC leading-edge position, Samsung, Intel catching up), node-name meaning, PDKs, mask/wafer costs, concentration | Public 2026 reporting (TrendForce shares, wafer price reports), clearly labeled [press]/[estimate] | Demo D; sources ledger |
| Ch. 15 vendor copilots/agentic EDA (public announcements only), startups, LLM RTL/HLS research, demo-vs-deployed honesty | Synopsys AgentEngineer/Autopilot (Sep 2026), Cadence Super Agents, Siemens Fuse; every number attributed to its claimer with availability status | Sources ledger [primary]/[press]; "candid scoreboard" section |
| Everything public, verifiable; rules of thumb attributed | Sources and evidence boundaries section with [press]/[research]/[primary]/[estimate]/[rule of thumb]/[open]/[standard] labels | content test asserts labels |
| Demo A: RTL playground, cycle-by-cycle, waveform, "break it" bug toggle; safe parameterized fallback | `#rtl-lab` (ch. 5): parameterized counter-with-enable and traffic-FSM examples, live Verilog, waveform, history; missing-reset and missing-transition bug injections | model + browser tests |
| Demo B: pipeline cost explorer, stage clicks show bugs caught/tools/cost multiplier (1x/10x/100x as rule of thumb) | `#pipeline-lab` (ch. 1): 7 stages, detail panels, cost chips labeled rule-of-thumb | model + browser tests |
| Demo C: HLS side-by-side, C loop vs generated RTL, unroll/pipeline pragma toggles | `#hls-lab` (ch. 7): precomputed representative RTL variants (sequential/2-way/full/pipelined), metrics table, disclosed toy schedule | model + browser tests |
| Demo D: node economics, sliders for die size/wafer price/volume, gross dies, yield model, cost per good die, NRE amortization, simplified-estimate labels | `#node-lab` (ch. 12): node presets (public price midpoints), Poisson yield, de Vries gross-die approximation, metrics + disclosed-model notes | model + browser tests |
| All demos client-side, no build, work on mobile and desktop | Pure `model.js` + `app.js`; no dependencies | Browser test runs every demo at 1440/375/320 px |
| Quality bar: precise, jargon defined on first use, concrete tiny examples, limits stated | Every chapter: plain-words opener, concrete example, "what to remember", limits paragraphs | Editorial review |
| Responsive at 375px and desktop; test both | `styles.css` media queries (shared with Volume 1) + additive demo styles | Browser overflow + 44px checks at 1440/375/320 |
| Footer link back to experiments index and to Volume 1 | Footer | Browser test asserts both hrefs |
| Verify before PR: every chapter and demo runs without console errors; 375px + desktop; title/meta set; internal links resolve | `tests/browser.cjs`, `tests/content_test.py` | VERIFICATION.md records the full run |

## Git-workflow note

The requirements request a branch named `arena/chip-design-textbook`. This session's work
is pinned to Arena's session branch (`arena/d7fdaa0c-ronnie-experiments`), whose name is
fixed by the platform; the pull request to `main` is opened from that branch and contains
exactly this work. No commits were made to `main`.
