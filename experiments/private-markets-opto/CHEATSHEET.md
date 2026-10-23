# Night-Before Cheatsheet — Opto / Ryan VanGorder

Print me. One page in spirit. (23 Oct 2026 · companion to TEXTBOOK.md + website)

## Say first (shape, not script)
"What interests me is that the engineering problem is fundamentally about **operating leverage**:
helping a small organization run more funds and serve more investors without scaling manual work
proportionally. I read the internal fund-administration tooling post and the data-engineering series.
Permissioned workflows + heterogeneous integrations + point-in-time correctness is much closer to my
enterprise systems and AI background than a generic AI product."

## Opto in 20 seconds
- Builds RIAs/family offices/private banks their **own branded private funds**: **Build → Fundraise → Manage**
  (+ Planner, Diligence AI). Not a marketplace. No manager-paid placement (stated); performance-weighted fees.
- 60+ people · $145M Series A Sep 2022 · Mercer Aspen Partners anchor (2024, now inside Aspen Investing).
- Joe Lonsdale (chairman) · **Ryan VanGorder CEO** (Quellos→BlackRock MD→CFO→CEO) · **Matt Reed CTO**.

## Never assert — always ask
50 funds · $1B+ (committed? paid-in? NAV? AUM? as of when?) · top-5 bank (signed? live? revenue?) ·
Head of Eng = top tech job (**ask re: Matt Reed first**) · $475M as current valuation (it's 2022).

## Language that must be automatic
- **Commitment → capital call → paid-in**; exits → **distributions**. Fund = GP runs, LPs fund.
- **DPI + RVPI = TVPI**. DPI = cash truth. Early IRR ≈ J-curve noise. **Vintage** = only fair peer unit.
- **NIGO** = docs Not In Good Order. **KYC** checks. **Single K-1** = Opto selling point.
- **Interval/evergreen** = periodic *capped* liquidity; gates are real. **CV** = GP continuation vehicle (conflict: pricing).

## ★3 engineering reads — quote one mechanism each
1. **Internal tools (Aug 26):** admin-neutral Fund Admin workflow (subs/KYC/NIGO); new admin ~1 day.
2. **Backfilling (July 26):** one Dagster config → incremental/full/single-entity; migration code is production code; MotherDuck MCP.
3. **Two clocks (July 26):** business time vs system time; version, never overwrite.

## News hooks — pick TWO, ask as questions
- AI Fund $40M close (May 26): "Growth engine or platform showcase?"
- DayMark $25M close (June 26): "Service hrs/fund vs earliest funds?"
- CAIS $170M/$2B vs iCapital $7.5B: "Does distribution gravity beat program depth?"
- SEC retailization (Sep 26): "What changes if evergreen/registered is the growth wrapper?"
- PitchBook "ditch the middleman": "Beneficiary or exposed?"

## Questions by person
- **Recruiter:** vs CTO remit? Team size? Comp/onsite? Bank stage? $1B definition?
- **Ryan:** Revenue split? Best leverage metric? Hrs/fund trend? Concentration? 6/12-mo success?
- **Matt:** Where's correctness easy vs vigilance-based? What would I own? MCP governance?
- **Close:** "What must be different in 6–12 months for this hire to be an obvious success?"

## 90 days (if asked)
30 map lifecycle/queues/incidents → 30 agree measures (completion time, exceptions, hrs/fund) →
30 one bounded workflow win + ownership/release clarity. No rewrite. No hiring spree.

## Traps
Don't: sell "AI-native" · cite investor prestige as health · claim fund-accounting or mgmt scope you
don't have · present the architecture reconstruction as fact · dump 10 news items.

## Your line
"I turn complex enterprise workflows into secure, observable systems — and prove where AI improves
throughput without weakening control."
