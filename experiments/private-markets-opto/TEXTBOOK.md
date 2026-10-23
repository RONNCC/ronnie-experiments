# Private Markets, Opto-Ready — The Textbook

**A Head-of-Engineering interview field guide to Opto Investments and private markets**
Ronnie's Experiments · Research edition 23 October 2026 · Educational only · Not affiliated with Opto Investments · Not investment advice

> **Starting point:** the research dump you supplied (Oct 2026), cross-checked against Opto's public
> site (`optoinvest.com`), engineering blog (`thesis.optoinvest.com`), and linked press releases.
> Labels used throughout: **PUBLIC** (linked source) · **DATA DUMP** (your supplied research) ·
> **RECONSTRUCTION** (plausible design, not Opto's actual internals) · **UNVERIFIED** (recruiter claim, no
> public corroboration) · **TEACHING MODEL** (invented numbers).

Companion website (simulators, flashcards, quiz): `index.html` in this folder.
Night-before version: `CHEATSHEET.md`.

---

## How to use this book

| Time | Path |
|---|---|
| 60 seconds | Chapter 1 brief + the three sentences below |
| 30 minutes | Ch. 1–2, Ch. 7 (★3 reads), Ch. 10 (pick 2 news hooks), Ch. 12 (opening + Ryan questions) |
| 2 hours | Everything + website simulators + quiz ≥80% + say every flashcard aloud |

**Three sentences to remember before the call:**

1. Opto sells a *functioning private-markets program*, not software seats — the platform must coordinate
   investment decisions, documents, investor onboarding, fund operations, and reporting.
2. The small-team strategy succeeds only if *service effort per fund falls* — Opto's own engineering
   writing names internal operations as the scaling constraint.
3. Clarify *Head of Engineering vs CTO* immediately — co-founder Matt Reed was appointed CTO in March 2024.
   Don't assume this is the top technical job or a replacement search.

**Your positioning (one line):** "I can help turn complex enterprise workflows into secure, observable
systems — and evaluate where AI actually improves throughput without weakening control."
*Not:* "I can make Opto more AI-native." (DATA DUMP §9)

---

## Chapter 1 — Opto in one picture

Opto Investments helps wealth-management firms create their own investment funds, raise money from
clients, and operate those funds over their lifetimes. Customers: registered investment advisers (RIAs),
family offices, private banks. It is **not simply a marketplace** for buying alternative investments:
Opto combines software with investment, legal, compliance, and operational services. (PUBLIC: optoinvest.com)

### Build → Fundraise → Manage

| Activity | What the customer does | What the software must coordinate |
|---|---|---|
| **Build** | Select strategy, model allocations, evaluate investments, form a fund | Investment data, diligence (incl. Diligence AI), portfolio/pacing models, legal + operational setup, fund-formation document generation |
| **Fundraise** | Explain strategy to clients, collect commitments | Planner proposals (target allocation + pacing per client), branded collateral, subscription documents, KYC, fundraising tracking |
| **Manage** | Operate the fund after launch | Capital calls, distributions, NIGO exception handling, investor portal/reporting, single K-1, custodian/reporting integrations |

Key terms: a **capital call** asks an investor to wire part of a prior **commitment**. **KYC** = identity/
compliance checks. **NIGO** = "Not In Good Order" — submitted documents need correction.

The important distinction: Opto helps an adviser **create a branded fund containing multiple underlying
investments** (custom-fund capabilities introduced 2023), not merely select someone else's fund.
Public launch claims: ~2–3 weeks for a feeder, 6–8 weeks for a diversified proprietary vehicle. (PUBLIC)

**Worked example — Mercer Advisors / Aspen Partners (3 June 2024).** Mercer built Aspen Partners with
Opto as the end-to-end technology and operational platform: qualified clients get portfolios diversified
across managers and vintages (PE, VC, private credit, real estate, infrastructure). In Oct 2026 Mercer
completed rolling out **Aspen Investing**, into which Aspen Partners is embedded across 43k accounts.
Date Aspen Partners correctly: it is a 2024 partnership, even though pages around it show newer dates.

**Buyer vs user (interpretation).** Economic buyer ≈ wealth firm's investment/executive leadership.
Users span CIOs/investment teams, advisers, operations staff, Opto internal IM/legal/finance, and end
investors. Engineering implication: several distinct products hide inside "one platform" — a CIO's
diligence interface, an operations console, and an investor portal have different permissions, error
tolerances, and usability needs, over one shared fund state.

**Business model (stated).** Fees weighted toward investment performance/long term; Opto says it does
not accept compensation from fund managers to list their funds; it invests its own capital in certain
funds. No public price schedule exists — revenue mix/recognition is a diligence question for Ryan.

**Dependencies.** Custodians: BNY Mellon–Pershing, Charles Schwab, Fidelity. Reporting: Addepar, Orion,
Gen II, Envestnet Tamarac, Black Diamond. Plus fund administrators of varying capability. Integration
architecture is therefore a business issue: a missing admin/custodian adapter can block a customer.

---

## Chapter 2 — Verify the pitch before you repeat it

| Recruiter statement | Finding | Say/ask instead |
|---|---|---|
| Co-founded by Joe Lonsdale | **Verified** — co-founder & chairman | Ask how Palantir/Addepar lessons shape Opto's data/workflow choices |
| ~60 people | **Consistent** with official "60+ builders" | "How does that split eng / IM / ops / GTM?" |
| 50 funds | **Not verified** in reviewed sources | "How many live funds, by type?" |
| $1B+ invested assets | **Not verified**; definition + date essential | Decompose (below) |
| Top-five bank signed | **Not corroborated** publicly | "Which ranking/unit? Signed, implemented, or revenue-generating?" |
| Deliberately small | Consistent with automation writing; no formal ceiling found | "Constraint, strategy, or phase?" |
| SF/NYC hybrid | Public eng listing says "primarily onsite" SF/NYC | Confirm *this role's* policy with the recruiter |

**Decompose "$1B+":** committed or funded/paid-in? Current NAV or cumulative invested? AUM, AUA, or
platform-associated assets? Revenue-bearing subset? As of when, vs what prior period?
The senior question is not "can 60 people support $1B?" but **"how do revenue and contribution margin
change as fund count, investor count, and transaction volume grow?"**

**Don't confuse corporate capital with fund capital.** The **$145M Series A (Sep 2022, Tiger Global-led;
8VC, Michael Dell's MSD/DFO, Clocktower, Fin Capital/FinVC, HOF et al.)** financed Opto the company
(reported ~$475M valuation *then* — never quote as current). The **$40M AI Fund (May 2026)** and
**DayMark Fund I $25M (June 2026)** are investment products. GIC holds stakes in both Mercer and Opto
(per Mercer's release) — Mercer is real customer evidence; shared backing may also explain introductions,
so repeatability of the sales motion remains to be diligenced.

---

## Chapter 3 — Private markets map

**Public vs private.** Public assets trade daily on exchanges with transparent prices. Private assets are
negotiated off-exchange, valued quarterly by models/appraisals, locked for years, and restricted to
eligible investors. Companies now wait ~16 years to IPO (a third longer than a decade ago), so more
growth compounds privately — the structural demand story RIAs hear from clients. Managed private assets
roughly tripled from ~$5T (2014) to ~$16T (2024) by common industry counts; definitions vary — cite the
provider, not the number, in conversation.

### Asset classes (one-paragraph fluency each)

- **Buyout (PE):** control purchases of mature firms with leverage; operational improvement + exit in
  4–7 yrs. Flagship institutional asset; enormous manager dispersion.
- **Growth equity:** minority stakes in scaling companies; growth, not leverage, drives returns.
- **Venture capital:** early-stage, power-law outcomes, longest J-curve. Opto's AI Fund lives here.
- **Private credit:** non-bank lending (direct loans, mezzanine, asset-backed). Income + seniority story;
  ~55% of interval-fund assets (SEC). 2020s vintages not yet fully cycle-tested.
- **Real estate / infrastructure:** income-producing real assets; data-center/power demand now ties infra
  to AI. Rate-sensitive; appraisal lag can mask drawdowns.
- **Secondaries:** buying existing LP stakes (LP-led, ~90% of NAV recently) or GP continuation vehicles
  (GP-led). ~$210B volume in 2025; shorter J-curve, instant vintage diversification.
- **Hedge funds (adjacent):** liquid-ish absolute-return strategies sold through the same alts channels.
  Know they exist; don't spend private-markets airtime on them.

### Who may buy (U.S. shorthand)

- **Accredited investor** (~$200k income / $1M net worth excl. home): gate for most Reg D funds.
- **Qualified purchaser** ($5M investments): gate for 3(c)(7) funds — most institutional feeders.
- **Everyone else:** only registered wrappers — interval funds, tender-offer funds, BDCs, non-traded REITs.
  The 2025–26 policy wave (Ch. 10) is about widening this row.

### Vehicles — same assets, different plumbing

| Vehicle | Liquidity | Typical min | Tax form | Note |
|---|---|---|---|---|
| Drawdown LP fund | None, 7–12 yrs | $5M+ direct; ~$100k via custom fund | K-1 | Classic; needs vintage pacing |
| Feeder | Mirrors master | $25k–$250k | K-1 | Aggregates tickets; extra fee layer |
| Fund-of-funds / Opto custom fund | None | ~$100k (press) | Single K-1 | Opto sweet spot |
| Interval fund | Quarterly tender ~5% | $1k–$25k | 1099 | 139 funds / $101B by 2025 (SEC) |
| Tender-offer fund | Periodic, board-set | $10k–$50k | 1099 | Similar economics, flexible repurchase debate |
| Non-traded BDC/REIT | Periodic, capped | ~$2.5k+ | 1099 | Early-2026 redemption caps = live liquidity lesson |
| Evergreen private fund | Monthly/quarterly, capped | Varies | Varies | ~5% of privates (~$700B) today; forecast ~20% in a decade (Hamilton Lane) |

**Trap:** "evergreen = liquid PE." No — periodic, *capped* liquidity against illiquid assets. Gates in
stress must be explained to clients before they need cash.

---

## Chapter 4 — How a private fund actually works

**GP** (general partner) manages and picks deals, charging a management fee (~2%, early on committed
capital) plus **carried interest** (~20% over a **hurdle**/preferred return, often ~8%, via a distribution
**waterfall**). **LPs** (limited partners) supply capital. In Opto's model, an RIA's custom fund is often
a *single LP* into many GP funds, aggregating hundreds of end-clients.

Lifecycle: **commit → capital calls over ~5 yrs (investment period) → value creation → exits distribute
cash → wind-down around yr 10–12.** A fund is typically a **blind pool**: LPs underwrite the GP and
strategy, not known deals.

**Vintage year** = year investing begins; it is the only fair peer-comparison unit. **Pacing** = spreading
commitments across vintages/strategies to reach a target allocation smoothly (Opto's Planner models this,
including over-commitment because calls lag). The **denominator effect** — public selloffs mechanically
inflating private weights — is why static pacing plans break.

**Secondaries mechanics.** LP-led: an LP sells stake + unfunded commitment. GP-led: the GP creates a
**continuation vehicle (CV)** to hold prized asset(s) beyond the old fund's life; existing LPs elect to
cash out or roll. The CV conflict (same GP prices both sides) is managed via fairness opinions, LPAC
review, and a genuine status-quo option — that process *is* the diligence.

*Website §4 simulates this lifecycle year by year.*

---

## Chapter 5 — Metrics lab

| Metric | Definition | What it hides |
|---|---|---|
| **DPI** | Distributions ÷ paid-in | Nothing — it's cash. Late-life DPI <1.0× blocks re-ups |
| **RVPI** | Remaining NAV ÷ paid-in | Pure estimate quality |
| **TVPI** (MOIC) | DPI + RVPI | Only as honest as NAV; compare within vintage/strategy |
| **IRR** | Annualized, timing-sensitive return | Early IRR = J-curve/timing artifact; credit lines flatter it |
| **PME** | Private cash flows benchmarked to a public index | Index choice matters; the honest "was illiquidity paid?" test |

**The J-curve:** early returns dip negative (fees on small called base, immature assets), then bend up
as exits arrive. Indicative buyout DPI guideposts (strategy/market-dependent): yr 5 ~0.3–0.6×, yr 7
~0.5–0.8×, yr 10+ ≥1.0×. A year-4 fund at TVPI 1.6× / DPI 0.1× is *marks, not money*.

**Pacing arithmetic (TEACHING MODEL, website §5):** to hold a 20% private NAV target on a $10M portfolio
($2M), committing roughly 1.4–1.5× the target across a 4-yr ramp (~$700k+/yr) compensates for gradual
calls and recycling distributions. Real models simulate call/distribution curves per strategy — which is
precisely the analytics Opto sells. Always pair a pacing plan with a liquidity budget (12–24 months of
expected calls in liquid assets).

Say it like an insider: *"I'd want DPI by vintage and PME before believing a track record — early IRR mostly
describes the J-curve."*

---

## Chapter 6 — Player atlas

**Allocators (LPs):** pensions, endowments, sovereign funds, insurers — and increasingly HNW families via
RIAs/family offices. Note: family offices remain relationship-driven (Fidelity survey: ~2% cite CAIS, 0%
iCapital as primary source) — context for Ron Diamond's advisory role.

**GPs:** mega-managers (Blackstone, Apollo, KKR, Brookfield, Ares, Blue Owl, Carlyle, EQT, Partners Group,
Hamilton Lane) now chase wealth/401(k) channels with evergreen products; mid-market/emerging specialists are
where return dispersion — and diligence value — lives. Opto claims ~0.2% of screened funds pass its vetting.

**Platforms:** **iCapital** (marketplace/feeder scale; ~$7.5B valuation; ~80% share per Cerulli via press)
and **CAIS** (#2; $170M Vista round at $2B+, 2026; Mercer diligence) optimize *transactions*. **Opto**
optimizes *program lifecycles* — different job, overlapping buyer. Challengers: Moonfare, Allocate, Gridline.

**Infrastructure:** fund administrators (SS&C, State Street, BNY, SEI, Gen II), custodians (Schwab, Fidelity,
Pershing), reporting (Addepar, Orion, Tamarac, Black Diamond), diligence firms (Mercer, Aksia, LCG),
placement agents. For Opto, integration coverage is strategy, not plumbing (Ch. 1).

**Opto customer evidence (PUBLIC):** Mercer Advisors (Aspen Partners, 2024), EP Wealth (2024),
Quotient + TritonPoint (Dec 2025), Fidelis (Jan 2026), Venturi (May 2025), Fi3 (July 2025), DayMark Fund I
close (June 2026), plus Opto's own AI Fund (May 2026). Evidence of activity — not of revenue, retention, or margin.

---

## Chapter 7 — Engineering deep dive ★

The engineering blog (`thesis.optoinvest.com`) is the highest-leverage prep material. Seven readings
(+ the cultural keystone), each as mechanism → tradeoff → question. **★ = read in full.**

1. **★ How AI is reshaping internal tools (4 Aug 2026, Colton Evans).** New small team rebuilding internal
   apps around real workflows + job-specific permissions. The Fund Administration tool tracks sub docs,
   KYC, state progression, and NIGO across administrators; a new administrator can be supported in ~a day.
   *Leverage = separating the common workflow from provider-specific integration; a controlled human bridge
   beats waiting on a bespoke adapter.* **Ask:** "When does the bridge stay human vs justify full automation?"

2. **★ Backfilling: the most underrated feature of a data pipeline (20 July 2026, Lucie Thimus).**
   Extract → raw → transform on Dagster; one config selects incremental / full-refresh / single-entity,
   all sharing transform logic ("migration code is production code"). MotherDuck MCP used to investigate
   a 1.8M-row Form ADV dataset. **Ask:** "How do you guarantee semantic idempotency on replay?"

3. **★ The two clocks your data needs (4 July 2026).** Business time vs system time; per-entity timeline
   rebuild from an append-only log. Supports "best view now" *and* "what we believed then" — at the cost
   of write amplification and concurrency care. **Ask:** "Same-effective-date conflicts? Atomicity boundary?"

4. **Modern Data Stack vs private-markets chaos (17 Nov 2025).** DuckDB/MotherDuck, DuckLake/S3, Dagster;
   schema variation, lineage, non-destructive curation. *Their problem is heterogeneity, not volume.*
   **Ask:** "Where does the lakehouse end and the transactional system of record begin?"

5. **Let everyone safely contribute code (21 Nov 2025).** GitHub App on Lambda verifies an Engineering
   approver on each PR (replacing noisy CODEOWNERS), validates webhooks, updates checks live.
   *Governance risk: "an engineer approved" < "the right owner approved."* **Ask** about escalation for
   auth/financial-calc/migration changes.

6. **Parallel agents in Zed (12 Aug 2026, Noel Amezaga).** Git worktrees + parallel Claude-via-Bedrock
   threads. Individual workflow, not a company standard. Generation speed moves the bottleneck to review
   and integration. **Ask:** "Lead time vs review-queue/defect effects?"

7. **How to actually build AI for finance (25 Aug 2025, Tony Pappas).** Ontology → encoded firm frameworks →
   outcome feedback. A thesis with illustrative scenarios — *not* proof all of it is deployed. **Ask:**
   "What's production today, and how do you eval when outcomes take years?"

8. **The man-machine symbiosis (14 Apr 2025, Rohan Patel).** Palantir/Addepar-rooted philosophy: augment
   advisers/CIOs/ops rather than replace them. Fund-formation doc generator + Diligence AI (data room →
   screening memo in minutes) as exemplars. Solve internally → ship to partners → reclaim time → repeat.

**Documented stack (job listings + posts):** TypeScript/React/Next.js; Python FastAPI (+ Java in older
listings) REST services; AWS Lambda + containers; automated deploys multiple times daily; team-level
service ownership; Dagster, DuckLake, DuckDB/MotherDuck (+ Snowflake in older listings); Claude via Bedrock.
*Security nuance:* "Bedrock keeps data in our AWS environment" (company description) is not a complete
security architecture — ask about endpoints, logging/retention, identity boundaries, vendor terms.

### Five problems you can credibly discuss (frame as org design)

| Problem | Why it matters | Org-design framing |
|---|---|---|
| Authorization across roles/firms | Staff, advisers, investors, AI tools share one fund state | Which invariants get centralized enforcement? |
| Long-running fund workflows | Nothing completes synchronously | What requires human approval? |
| Point-in-time correctness | Corrections must not rewrite decision history | Where does correctness still rely on vigilance? |
| Document→data AI reliability | One bad extraction contaminates diligence | Evals when outcomes take years? |
| Operational observability | 200 OK ≠ subscription completed | Measure business completion, not uptime |

---

## Chapter 8 — Architecture reconstruction (RECONSTRUCTION)

Components are documented; boundaries/topology are not. Present this as a hypothesis and invite correction.

```
Plane A — Transactional / workflow (system of action)
Advisers / CIOs / Ops / Investors
  → Branded web apps + internal tools (role-based; Fund Admin console)
  → APIs · permissions · workflow state (subs, KYC, NIGO, calls, approvals)
  → Fund administrators · custodians · reporting providers

Plane B — Analytical / diligence (system of insight)
Documents / Form ADV filings / external investment data
  → Extract → raw → transform (Dagster config modes)
  → Bitemporal models · lakehouse (business + system time)
  → Diligence AI · benchmarking · Planner / CIO analytics
```

Whiteboard talking points: tenancy model (per-RIA isolation), source-of-truth reconciliation between
Plane A state and administrator records, exactly-once effects for capital-call notices, and where MCP
tool access is authorized/logged. The best question remains Matt's: *"Where does the architecture make
correctness easy, and where does it still depend on operational vigilance?"*

---

## Chapter 9 — Business, moat, risks

**What public evidence establishes vs not:** Mercer/partner announcements establish real deployments;
DayMark/AI-fund closes establish product execution. None establish revenue, growth, retention, gross
margin, or burn — no reliable public disclosure was found. The 2022 "80+ RIA partnerships" figure does
not imply 80 paying, material customers.

**Strongest moat (interpretation):** embedded operational workflows + normalized bitemporal history +
integration coverage + customer-specific programs → switching costs. The eng investments are evidence of
*capabilities that could* support this, not proof it exists at scale. **Best counter:** an incumbent bundles
"good enough" via existing distribution while bespoke support saddles Opto with services economics; large
RIAs may in-source (PitchBook, July 2026: wealth firms "ditch the middleman" — with Opto/Allocate named
as enablers of the build path, which cuts both ways).

**Risks to diligence:** services intensity per fund/investor; performance-fee cash timing vs SaaS smoothness;
enterprise (bank) concentration and roadmap capture; financial-correctness trust risk; AI feature
commoditization; breadth (external platform + internal ops + IM + proprietary funds) on one small eng org.

*Website §9 simulates the operating-leverage arithmetic behind "deliberately small."*

---

## Chapter 10 — Recent news to bring to Ryan (as questions)

1. **Opto AI Fund close, $40M (28 May 2026, PUBLIC).** Fund-of-funds (Fusion IV, Neo 4.0, Zero Prime II)
   + directs (xAI, Epirus, ExoWatt, Higgsfield), RIA-channel only. *Ask:* growth engine or platform showcase?
2. **DayMark Fund I, $25M close (23 June 2026, PUBLIC).** Named/sized custom fund incl. AI-fund exposure.
   *Ask:* service effort per fund vs earliest custom funds?
3. **Quotient/TritonPoint (Dec 2025) + Fidelis (Jan 2026) + Ron Diamond advisory (Mar 2026, PUBLIC).**
   UHNW/family-office momentum. *Ask:* what breaks in the RIA-first workflow upmarket?
4. **Mercer Aspen Investing rollout completed (20 Oct 2026, PUBLIC).** Opto-built Aspen Partners embedded
   firm-wide. *Ask:* what does Mercer-scale embedding demand from eng?
5. **CAIS $170M at $2B+ (2026) vs iCapital ~$7.5B / ~80% share (PUBLIC press).** Marketplace consolidation.
   *Ask:* does distribution gravity beat program-building depth?
6. **PitchBook: big RIAs ditch middlemen (July 2026, PUBLIC).** *Ask:* beneficiary or exposed?
7. **Retailization policy wave (PUBLIC):** Aug 2025 401(k) executive order ($12.5T DC market) → DOL
   safe-harbor proposal (Mar 2026) → SEC "responsible retailization" proposals (30 Sep 2026: performance
   fees + interval-fund modernization); SEC staff dropped the 15%/accredited practice for registered CEFs
   (ADI 2025-16). *Ask:* what changes if registered/evergreen becomes the growth wrapper (NAV cadence,
   redemption queues, disclosures)?
8. **Semiliquid surge + first stress (PUBLIC):** ~$600B semiliquid AUM (Morningstar, +120%/4yrs);
   308 interval/tender funds, $233B (XA, Dec 2025); early-2026 BDC sales slump + redemption caps.
   *Ask:* how do you pre-wire adviser/client expectations on gates?
9. **Secondaries mainstream (PUBLIC):** ~$210B 2025 volume, GP-led ≈ half, LP pricing ~90% of NAV.
   *Ask:* standard J-curve-mitigant sleeve in new programs? CV conflict diligence?
10. **Opto internal-tools post (4 Aug 2026, PUBLIC).** *Ask:* is internal ops now a first-class product
    surface with its own roadmap? (Your single best "I did the reading" citation.)

---

## Chapter 11 — People map

- **Ryan VanGorder, CEO.** Quellos → BlackRock (~15 yrs; MD, APAC finance lead; helped build the alts
  platform; iShares FP&A) → Opto CFO (Apr 2022) → CEO. "Iron Man suit for advisors." Adventure racer.
  *Expects engineering judged on economics and execution.*
- **Joe Lonsdale, co-founder/chairman.** Palantir, Addepar, 8VC. Technology-led identity + networks.
- **Matt Reed, co-founder/CTO** (appointed Mar 2024; ex-Addepar; CFA). *The decision-rights conversation.*
  Absence from a web grid is not evidence of departure — confirm, never speculate.
- **Jacob "Jake" Miller, co-founder/Chief Solutions Officer.** Ex-Bridgewater investor; investment
  frameworks ↔ customer needs ↔ product strategy.
- **Dan Piehler, Head of Product.** Prioritization counterpart across platform / Diligence AI / internal ops.
- **Sean Mulcahy, Head of Investment Operations.** Ground truth on manual queues; source of 90-day wins.
- **Matt Malone, Head of Investment Management.** Diligence/IC credibility; AI Fund voice.
- **Warren Seubel, VP Sales & Revenue (Feb 2026).** Ex-CAIS MD, early Addepar. Diligence AI commercialization.
  *Ask:* which enterprise requirements recur vs trigger custom engineering?
- **Justin Mills, Principal PM (Aug 2026).** Ex-Starbucks Principal PM (public profile). Mandate unconfirmed.
  *Ask:* split across platform / Diligence AI / internal ops?
- **Ron Diamond, Advisory Board Chair (Mar 2026).** Diamond Wealth; 130+ family syndicate. Not an operator.
  *Ask:* what family offices require that changes the product?
- **Historical accuracy:** Opto emerged from stealth in 2022 led by co-founder/CEO **Mark Machin**
  (ex-CPP Investments CEO); he is now on the advisory council. Exact transition date not established.

No cluster of recent senior *engineering* hires was verified — evidence supports specific product/commercial
additions, not an "engineering leadership rebuild" narrative.

---

## Chapter 12 — Role playbook: Head of Engineering

**Establish the job first.** No public JD found (board: Product Engineer; Director of Private Market
Operations). Resolve: reporting line (CEO/CTO?), scope (all eng or a function?), org (HC, managers,
reports), decision rights (architecture, security, hiring, delivery, budget, roadmap), reason for hire,
hands-on expectation, 6/12-month success criteria. Product Engineer listing for calibration only:
$160k–$240k + equity, 5+ yrs, SF/NYC primarily onsite — a different job from Head of Eng.

**Fit honestly.** Strong *domain adjacency*: enterprise AI apps → diligence/document workflows; MCP/tool
authorization → safe data/action access; case management → exception-heavy multi-party ops; distributed
systems/observability → integration + business-process reliability; DocuSign context → enterprise workflow
credibility. *Unproven from supplied background:* people-management scope, hiring ownership, performance
management, executive delivery accountability. Technical sophistication is not a substitute — bring
leadership evidence only where accurate.

**Grounded opening (adapt, don't recite):**

> "What interests me is that the engineering problem is fundamentally about operating leverage: helping a
> small organization run more funds and serve more investors without scaling manual work proportionally.
> I read the internal fund-administration tooling post and the data-engineering series. The combination of
> permissioned workflows, heterogeneous integrations, and point-in-time correctness is much closer to my
> enterprise systems and AI background than a generic AI product."

**Questions — recruiter:** relation to Matt Reed's CTO role; team/manager counts; comp + equity + exact
onsite policy; bank contract stage (signed/implemented/revenue); $1B definition + date; reason for hire.

**Questions — Ryan (CEO):** revenue split (recurring / implementation / performance); best operating-leverage
metric; service-hours-per-fund trend; customer concentration; what makes the bank deployment repeatable;
6/12-month success definition.

**Questions — Matt (CTO):** where correctness is easy vs vigilance-dependent; decisions he'd hand over;
transactional vs analytical plane separation; MCP permissioning/logging; AI-dev-speed effects on review/release.

**Credible 90 days (no rewrite, no spree):** Days 1–30 map lifecycle/org/incidents/manual queues/top
commitments. Days 30–60 agree few shared measures (workflow completion time, exception volume, service
effort, reconciliation quality, delivery reliability). Days 60–90 ship one bounded high-friction workflow
improvement; clarify ownership + release controls.

**Foreground:** a workflow made reliable; an authorization boundary; an AI system evaluated past demo stage;
an integration failure diagnosed + prevented. **Don't over-claim:** agent enthusiasm, investor prestige as
health proof, scale-for-scale's-sake infra, investment expertise, management scope not held.

**Process note (DATA DUMP):** no public Head-of-Eng interview loop verified; the Product Engineer posting
asks applicants not to contact employees to fast-track. Use the recruiter channel for the exec brief + loop.

---

## Chapter 13 — Glossary (rapid decode)

Accredited investor · AUM/AUA · bitemporal data · blind pool · capital call · carry · commitment ·
continuation vehicle · custom fund · denominator effect · Diligence AI · distribution · DPI/RVPI/TVPI ·
dry powder · evergreen · feeder · Form ADV · fund administrator · GP/LP · hurdle · interval fund · IRR ·
J-curve · K-1/1099 · KYC · MCP · NAV · NIGO · pacing · paid-in · PME · qualified purchaser · re-up ·
RIA · secondaries · sub docs · 3(c)(1)/(7) · vintage · waterfall · white-label.
*(Full one-line definitions + "why Ryan cares" for 40+ terms: website §13, searchable.)*

## Chapter 14 — Drill

Flashcards (15) + quiz (12) live on the website (§14). Graduation standard: quiz ≥80% **and** every
flashcard answer spoken aloud in <20 seconds without reading. Then re-read the ★3 engineering posts the
morning of the call and print `CHEATSHEET.md`.

---

## Appendix — Sources

Opto site/capabilities/about; Optonaut blog index + posts (internal tools, backfilling, two clocks,
man-machine symbiosis, AI for finance); Business Wire (AI Fund May 2026; DayMark June 2026; Fidelis Jan
2026; Quotient/TritonPoint Dec 2025); WealthManagement (Mercer Aspen rollout Oct 2026; Ryan VanGorder
profile); Financial Planning (Opto/Mercer/EP Wealth 2024); PitchBook (middleman + CAIS/iCapital, 2026);
SEC retailization release (30 Sep 2026); CRS private-markets overview (June 2026); your provided research
dump (Oct 2026) as the starting synthesis. Full URLs: website Sources appendix.

*Private-markets statistics vary by provider and definition. In conversation, attribute ("Morningstar puts
semiliquid funds near $600B…") rather than asserting. That habit alone reads as insider.*
