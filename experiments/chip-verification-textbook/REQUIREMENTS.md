# Full public-requirements coverage

Expanded edition: 2 November 2026. The original 18 chapters are preserved, with additive source pointers, an explicit requirement matrix, and new glossary terms. Chapters 19–22 add the missing deep material. The introductory experiment is unchanged.

| Requirement | Implemented location | Evidence / boundary |
|---|---|---|
| Software/AI audience; 12+ chapters, 10,000+ words | `TEXTBOOK.md`, generated HTML | 22 numbered chapters, over 20,000 whitespace-separated words; Markdown is canonical |
| TOC, glossary, search, three routes, 25 answers | Routes; chapters 17–18; `app.js` | Search/route/answer/anchor browser checks; mobile TOC collapses |
| RTL, clocks, lifecycle, respin risk | Chapters 1, 19.1 | No invented respin dollar estimate |
| Pre/post silicon and platforms with limits | Chapter 2 | Simulation, emulation, FPGA, static, formal, silicon boundaries |
| Spec-to-signoff and FIFO matrix | Chapters 3–5 | F1–F9 requirement/check matrix; full/empty simultaneous rules; reset, wrap, order, stalls |
| Structural versus functional and assertion coverage | Chapters 8–9, 19.6; coverage lab | Statement/branch/toggle/FSM, sampling, cross exclusions, vacuity, missing oracle, explicit mutant |
| Annotated SV, synthesizable versus testbench | Chapter 19.1–19.3 | Occupancy-only RTL, observer interface, class/random constraints; not a complete HDL project |
| UVM responsibilities and mechanics | Chapters 7, 19.3–19.4 | Item/sequence/sequencer/driver/monitor/agent/env/scoreboard, TLM, phases, objections, factory, config_db |
| SVA/formal | Chapters 8, 19.5 | Sampled clock/reset semantics, stall stability, assume/assert/cover, bounded/unbounded/vacuity limits |
| Deep CDC/RDC | Chapter 20 | Analog versus ideal digital; probabilistic MTBF; level/pulse/toggle/handshake; coherency/reconvergence; Gray pointer synchronization and skew; reset release/epochs; complementary static/simulation/formal |
| Regression operations | Chapters 10–11, 21 | Build/run manifests, license-hours, Slurm/LSF as proposed adapters, cancellation, logs/waves, clustering/reduction |
| Proposed agent architecture and safety | Chapters 11–14, 22 | Versioned retrieval, typed tools, checkpoints/budgets, approval, independent oracle, correlated errors and coverage gaming |
| Evaluation | Chapters 13, 22 | Blind seeded bugs, holdout design families, leakage, baselines, ablations, bug yield, false positives, reproducers, review/license/cost/latency metrics |
| Secure full-stack/on-prem/model options | Chapters 14, 16, 22 | IP isolation, approved endpoint boundaries, observability, pilot goals, five CEO discussion questions |
| Public company/job pages | Chapter 16 and source ledger | Directly reviewed in original edition; marketing metrics attributed; role distinguished from pure DV; no invented internals |
| FIFO trace debugger | Lab 01, chapter 4 | Clock stepping, pre/post history, pointers, full replacement, reset, bounds; pure-model and browser tests |
| Code-vs-functional hidden bug | Lab 02, chapter 9; chapter 19.6 | Smoke/order suite, mutant and checker toggles; 100% labeled statements can miss ordering bug. Explicitly JS instrumentation, not HDL coverage |
| CDC pulse-loss lab | Lab 03, chapter 20 | Period/phase/width/spacing/scheme controls; ideal timeline and stage samples; busy versus lost counts; 2,640 deterministic combinations tested |
| Agent budget/eval lab | Lab 04, chapter 22 | Disclosed eight-case recipes, four bugs, round/license/worker limits, evidence ablations, cost/time/reproducer metrics; deterministic tests |
| Extra evidence gate | Chapter 12 | Original exercise retained; abstention on missing/truncated evidence |
| Exact sources and historical/current distinctions | Per-chapter pointers, chapters 19–22, final ledger | Required Accellera URLs and Cummings official/university links; primary vendor formal/CDC context; failed PDF retrieval explicitly disclosed, not represented as full reading |
| Mobile/accessibility/print | `styles.css`, `tests/browser.cjs` | 320/390/1440px BODY overflow checks, 44px controls/checkbox labels, labels, keyboard, local code/table scrolling cues; screenshots inspected; 56-page print smoke test |
| No tracking/forms/private sources | Static assets; browser network log | Zero external requests; no storage/analytics/form submission; no private connectors |
| Catalog and preservation | Root README and `experiments.json` | Only existing entry description/date refreshed; unrelated experiments unchanged |

## Source limitation

Direct extraction of the requested historical UVM/coverage PDFs and university Cummings PDF was unavailable. Their exact verified public URLs remain linked, with source-access disclosures. No login or registration was attempted. This is a source-linked educational synthesis, not a claim of a fresh line-by-line PDF audit, executed HDL package, analog simulator, or commercial benchmark.
