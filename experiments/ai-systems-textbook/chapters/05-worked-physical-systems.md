# Part V — Worked designs: prediction, optimization, defense, and voice

## 18. A multi-signal disaster-risk and alerting service

The supplied guide proposes weather, geographic, sensor, and historical inputs feeding prediction, alerts, and human decisions (p. 8). Build the **decision support system**, not a demo that proclaims “AI predicts disasters.” Define the event precisely: e.g., “a flood at or above threshold in spatial cell `c` within the next six hours.” Different hazards, horizons, geographies, and response teams need different labels and costs. The output is an uncertainty-calibrated alert with provenance and lead time, reviewed under an incident protocol—not an automatic public evacuation order.

### Observation and label pipeline

```text
sensors / radar / forecasts / geography → timestamp + unit normalization
   → missingness/quality flags → time-aligned feature store
   → baseline physical/threshold model + candidate statistical model
   → calibrated probability and uncertainty → alert policy + capacity limit
   → human verification / official channel → outcomes + delayed labels
```

Record **event time**, ingest time, revision time, sensor calibration, spatial resolution, forecast issue time, and which data were actually available when a historical prediction would have been made. Weather observations corrected a week later cannot be used in an “as-of” replay for a six-hour-ahead warning. Geospatial aggregation can hide local extremes; missing sensors during storms are *not missing at random*. Use explicit missingness indicators and a fallback to authoritative alerts or uncertainty-based escalation. A global aggregate accuracy metric will hide rare severe events.

### Baselines before deep models

Compare a simple official threshold, a physics-informed forecast, a logistic/gradient-boosted classifier on known features, and only then a more complex spatiotemporal model if held-out results justify it. Use time-based and geographic holdouts (e.g., hold out entire storms/regions), not random rows from the same storm across train/test. Watch for label leakage from post-event reports, imbalanced negatives, station moves, and changing climate/land use. Calibrate predicted probabilities by region/lead time; check reliability diagrams and conditional error for vulnerable populations.

**Base-rate arithmetic (illustrative).** Suppose 10,000 monitored cells/day, 1% event prevalence = 100 actual events. At 90% sensitivity, 90 are found; at 2% false-positive rate over 9,900 non-events, 198 false alerts occur. Positive predictive value is `90 / (90 + 198) = 31.25%` and operators review 288 alerts/day. A “98% specificity” headline sounds excellent but may exceed response capacity. Lowering the threshold increases lead time and recall but also review load. Choose a threshold with stakeholders using miss severity, alert fatigue, geographic equity, capacity, and safety constraints; always show a precision–recall/lead-time curve rather than one score.

### Serving, trust, and evaluation

Keep a deterministic ingestion/quality path separate from model scoring. Dedupe late messages; re-run forecasts on a bounded schedule; version model, features, and threshold; return uncertainty and supporting sensor/forecast snapshots. Signed or authenticated sensor feeds are preferable; attacker-controlled input can trigger alerts or suppress them. Partition alert delivery from prediction, with explicit escalation when the scoring service is down. Measure lead time, sensitivity by severity and region, alert precision, calibration, missed-event severity, stale-feed rate, and operator burden; replay historical as-of snapshots and run tabletop exercises. A public message requires an authorized human/agency and a separate dissemination workflow.

**Failure challenge.** All river sensors go offline during the most severe rain. A system that imputes “normal” values looks confident and quiet precisely when risk is high. Quality flags should force an uncertainty state and fallback to other evidence/official procedures. “The model is usually right” is not a recovery plan.

## 19. A self-correcting port scheduler

The guide's port manager combines vessels, schedules, delays, logistics, disruptions, and inspections (p. 14). Scheduling is principally a **constrained optimization** problem. Models can turn a messy captain's message into a proposed ETA change, summarize alternatives, and explain a replan; a feasibility checker and operations authority decide whether to publish one.

### Formalize a minimal schedule

Let vessel `i` have arrival `a_i`, duration `d_i`, draft/length, cargo priority `w_i`, and time window. Let berth `j` have compatible dimensions, equipment, tide constraints, and inspection restrictions. Decision variables can include binary assignment `x_ij` and service start `s_i`. Require `Σ_j x_ij ≤ 1` (or exactly 1 for all vessels that must be scheduled), `s_i ≥ a_i`, berth/vessel compatibility, and **non-overlap** for any pair assigned to the same berth (with safety buffer). A mixed-integer program can encode these with ordering binaries/big-M carefully; constraint programming can model interval scheduling directly. Minimize weighted delay `Σ_i w_i·max(0, s_i − a_i)` plus penalties for overtime, emissions, and disruption to already communicated plans. These weights are a business policy, not an LLM opinion.

**Hard constraints vs. soft objectives:** safety clearance, berth availability, customs/inspection holds, and hazardous-cargo segregation are hard. Average lateness and fairness are usually soft within an agreed policy. If no feasible schedule exists, return the conflicting constraints and escalate; never let an LLM invent a “reasonable” berth.

### Architecture and correction loop

```text
AIS/ETA feeds + operations updates → normalized event log (source, time, confidence)
       → conflict detection + validated state snapshot → solver (plan v43)
       → independent feasibility checker → impact diff vs published v42
       → dispatcher approval → publication with expected-version check
       → acknowledgments + monitor new delay → bounded re-optimization
```

A new ETA can arrive while the solver runs. Capture `snapshot_version`; publish only if current operational state still matches, otherwise recompute or present a conflict. Freeze imminent commitments to avoid “schedule thrashing” whenever a minute of ETA changes. Mark manual overrides with reason/expiry; the next solve must honor or explicitly surface them. If publication to a tug service succeeds but a berth-board update fails, track the partial effect and reconcile; do not claim the entire plan is live.

### Alternatives and metrics

A greedy earliest-arrival-first baseline is transparent and fast but may starve high-priority cargo or violate downstream constraints. MILP/CP-SAT can improve global objectives and certify feasibility but may need bounded solve time; a heuristic or incumbent feasible plan is a fallback under time pressure. An agent may help parse and explain disruptions, not act as an unconstrained optimizer. Evaluate with replayed historical disruptions: hard-constraint violation count (must be zero in tested plans), weighted delay, plan churn, calculation time, human override rate, and **actual** departure outcomes. Stress with conflicting feeds, missing draft, inspection hold, concurrent edits, and solver timeout.

**Worked event:** vessel A reports a six-hour delay in a free-form email. An extraction model returns `{vessel_id, ETA, source_ref, confidence}`; a validator checks identity/timezone and asks an operator if ambiguous. A new snapshot triggers solve; proposed changes include “B moves to berth 2, C shifts 40 min,” with feasibility proof and disruption cost. Dispatcher approves v43; controller publishes under expected v42; ACKs are tracked. If v42 was replaced during review, approval is stale and cannot authorize v44.

## 20. Security-event triage with approval-gated response

The guide's cyber-defense example (p. 17) asks the right questions: what if the agent is wrong, what can it access, and what needs approval? Design a defender that ingests security events, groups alerts, retrieves context, and **proposes** containment. No high-impact action—host isolation, token revocation, firewall changes—is performed by an unconstrained model.

### Data and trust model

```text
SIEM/EDR events → parse/dedupe → entity graph + timeline
         → deterministic detections / scored anomaly → evidence package
         → analyst-facing summary and proposed action (model may assist)
         → policy + asset ownership + human approval → SOAR action controller
         → confirmation, reconciliation, audit, rollback plan
```

Logs are adversary-influenced. A malware process name or web request body can contain prompt-injection instructions; pass it as untrusted evidence with source/timestamps. Keep investigative read scopes separate from response scopes; a triage worker can query EDR but cannot inherit global administrator credentials. The controller verifies organization, asset, ticket, action class, approval, preconditions, and expiry using authoritative systems. No generic shell on production endpoints. An approval for “isolate host H at 10:05” must not become authority to disable the entire subnet at 10:10.

### Severity, uncertainty, and analyst capacity

Separate threat *severity* from model *confidence*. A low-confidence, high-severity possibility may need immediate human review, not silent dismissal. A high-confidence noisy rule might deserve suppression if its false positives saturate the team. Rank a queue using impact, evidence quality, current asset criticality, and SLA; expose uncertainties and counter-evidence. Investigations can be time-consuming: set a time budget and surface incomplete analysis. A language model's summary is not evidence that an IOC exists; link each indicator to a raw event or verified intel record.

### Response workflow and failure cases

Use `ALERTED → TRIAGED → PROPOSED → APPROVAL_PENDING → APPROVED → ACTION_SENT → CONFIRMED/UNKNOWN → CLOSED`. Before a token revoke, verify the token identity, owner, blast radius, and exact target. Store command ID and idempotency key; if the SOAR response is lost, query the action log instead of revoking additional credentials. Provide a reversible containment plan where possible, a break-glass process for emergencies, and two-person control for high-risk actions according to policy. Recheck that the asset has not changed ownership while approval was pending.

Evaluate both security outcomes and collateral damage: detection/triage recall on known incidents; time to first useful evidence; analyst minutes per alert; false positives by environment; unauthorized-action attempts blocked; confirmed-action correctness; and time to rollback. Red-team with poisoned log fields, swapped asset IDs, legitimate maintenance that looks anomalous, missing endpoint telemetry, an unavailable SIEM, and human reviewer fatigue. An LLM-only “autonomous SOC” demo is not a substitute for these gates.

## 21. A real-time voice assistant with safe handoff

Return to customer support, but make the channel first-class. The requirement is not “speak the text agent's response”; it is to hear an uncertain human utterance, manage overlapping turns, take authorized actions, and hand off without making the customer start over. Assume **illustratively** 3,000 calls in the peak hour and a four-minute mean call: Little's law gives `3,000/3,600 × 240 ≈ 200` concurrent calls on average, before burst and longer-call headroom. This is continuous audio capacity as well as model token capacity.

### Turn controller and two-phase action

```text
phone/WebRTC ingress → VAD/endpointing → ASR partials + final transcript
      → dialogue state {intent, auth, confirmed_entities, pending_action}
      → narrow retrieval/tools + agent decision → response text/audio stream
      ↖ barge-in cancels *speech/generation*, not committed transaction
```

For a refund, partial ASR “twenty-five dollars … no, fifty dollars” must never trigger a write. The assistant collects the final amount, reads it back, obtains an explicit confirmation, then enters the same approval/action controller as Ch. 14. Keep transcript hypotheses distinct from confirmed entities. A phone number is not necessarily authentication. Sensitive payment or identity collection should use an approved secure channel, with explicit recording consent and retention controls. If the call drops after commit but before spoken confirmation, a retry should query the receipt, not reissue the action.

### Latency is a product tradeoff

Track end-of-user-speech → first *relevant* audio, interruption-stop latency, tool-wait silence, full task duration, and handoff wait. Acknowledge a slow lookup honestly (“I'm checking the order now”) while the authorized call runs; do not present a provisional guess as fact. Endpointing too aggressively clips a user's correction; waiting too long feels sluggish. Integrated speech models may reduce handoff costs between ASR and generation but make entity audit and selective tool gating harder; modular ASR/TTS makes failures inspectable but adds pipeline latency. Benchmark both on real channel noise and the actions that result, not on transcription word error alone.

### Handoff as a first-class outcome

Transfer packet: authenticated status and method, customer intent, verified order/amount with confirmation turns, policies consulted (versions), tools called and receipts, *unknown* external effects, sentiment/reason for escalation, and the next recommended safe step. Suppress sensitive raw audio unless necessary and allowed. The human receiver should be able to finish the task without repeating a risky action. Measure “repeated story” rate, transfer completion, verified post-call outcomes, and escalation reasons.

A useful evaluation matrix crosses `{clean/noisy/accented/code-switched audio}` × `{no interruption/correction/barge-in}` × `{read-only/write/handoff}` × `{healthy/slow/failed tools}`. Record word/entity error, confirmation quality, authorization failures, final database state, and customer experience independently. Public enterprise-voice guidance likewise emphasizes hearing, turn-taking, action, guardrails, and handoff as separate tests ([source](https://sierra.ai/blog/what-is-voice-ai)); the design and numbers above are hypothetical.

---
