export default {
  id: "F",
  title: "Test the evidence",
  topic: "Diligence & data trust",
  intro:
    "Read the underlying document as if you were lending against it. Who asserted the number, for which period and subject to what conditions?",
  lessons: [
    {
      id: "actual",
      title: "Put the period before the number",
      concept: "Pro forma versus actuals",
      definition:
        "A pro forma is a projection under assumptions. Actuals record what happened for a specified period. A documented projection is still a projection. Provenance identifies the document, version and date behind a figure.",
      why: "A lender can reproduce a calculation only if it knows which inputs and periods were used. Reproducibility does not by itself prove the inputs are true.",
      example:
        "Suppose trailing twelve-month income is $900,000 and the stabilized next-year forecast is $1m. Both can be accurately transcribed. The $100,000 difference calls for a bridge, not a choice of whichever is larger.",
      desk: "Keep the source date distinct from the period measured and from the edit time. For River North, neither the brief’s $2.6m nor $2.5m NOI is identified as collected income.",
      trap: "“It was in a signed package, so the forecast is an actual.” A signed document can document an estimate.",
      deeper:
        "Ask for a trailing operating statement, a dated rent roll and the model assumptions. Tie reported income to collections and normalize one-off expenses explicitly. A later file may copy older data; version order is not source authority.",
      terms: [
        [
          "Pro forma",
          "Forward-looking financial projection under stated assumptions.",
        ],
        ["Actuals", "Observed results for an identified period."],
        ["Provenance", "Source document, version and date behind a value."],
      ],
      refs: [],
      apply: [
        "The newer document is a projection and the older one reports prior-year actuals. Which is authoritative?",
        "Each for its stated purpose; do not overwrite one with the other.",
        "The newer file for all historical and future values.",
        "The higher income regardless of period.",
        "Authority depends on what question the number answers.",
      ],
      pitch: [
        "Why does a dated source not settle every disagreement?",
        "It establishes what that source said. I still need to compare scope, period and actual versus projected status before relying on it.",
      ],
    },
    {
      id: "agreement",
      title: "Read a purchase agreement for decisions",
      concept: "A purchase and sale agreement",
      definition:
        "A purchase and sale agreement sets the terms of a transaction between buyer and seller. Read the executed agreement together with exhibits, notices and amendments; an unsigned draft is different evidence.",
      why: "Price alone does not tell a developer how much time it has to investigate, when money is at risk or what must happen before closing.",
      example:
        "In a hypothetical contract, a $50,000 deposit is refundable until a specified diligence deadline. An executed amendment extends that deadline by ten days. Track both source clauses; the amendment changes the date, not necessarily the amount or every other condition.",
      desk: "Extract the parties, property description, price, deposit, effective date, diligence/financing conditions, notice requirements, closing mechanics and amendments. Record the clause and version; do not invent missing River North dates.",
      trap: "“We get thirty days from signature” without checking the defined effective date, business-day rules, delivery requirements and amendments.",
      deeper:
        "Read in three passes: first identify what land is being bought; then mark every decision deadline and who must give notice; finally trace deposit release, termination rights, defaults and remedies. [VERIFY] Ask transaction counsel to confirm an operative deadline from the signed instruments. This is a reading method, not a legal interpretation.",
      terms: [
        [
          "Diligence period",
          "Contractual investigation window subject to the actual agreement.",
        ],
        [
          "Earnest money",
          "Deposit governed by the contract’s refund, application and forfeiture provisions.",
        ],
        [
          "Amendment",
          "Document changing specified terms of an earlier agreement.",
        ],
      ],
      refs: ["contract"],
      apply: [
        "A schedule and an executed amendment show different diligence dates. What is your next step?",
        "Flag both, check defined triggers and notice terms, and confirm the operative date with counsel.",
        "Average the dates.",
        "Silently pick whichever file was uploaded last.",
        "An amendment may control a term, but execution, scope and trigger dates matter.",
      ],
      pitch: [
        "Why not just display the deadline from the project schedule?",
        "The schedule helps the team plan; the contract controls contractual rights. I would trace the date to its signed clause and amendments before acting.",
      ],
    },
    {
      id: "roll",
      title: "Read a rent roll one unit at a time",
      concept: "Rent roll",
      definition:
        "A rent roll is a dated unit-level schedule of occupancy and lease terms. Look for unit type, occupied/vacant status, lease start and end, contractual rent, concessions and arrears where supplied. It is not a bank statement.",
      why: "The rent roll tests the model’s unit count, mix and in-place rent. It also shows when leases expire and exposes the difference between scheduled and collected income.",
      example:
        "Nine of ten units are occupied at $1,000 monthly contract rent. Physical occupancy is 90% and scheduled occupied rent is $9,000/month. If $500 goes unpaid, collections are $8,500 before other items; occupancy is still 90%.",
      desk: "Tie rows to the dated unit schedule and totals to the operating statement. For River North, request the roll if the property is operating; a proposed development does not have actual occupied rents just because the model has rent rows.",
      trap: "Annualizing one unusually good month without checking concessions, move-outs or whether the rents were collected.",
      deeper:
        "Count unique units including vacancies; avoid counting a renewal as a second physical unit. Sample leases to test the roll, compare collections to the ledger and look at expirations by month. Use redacted records and limit resident information to the people who need it.",
      terms: [
        [
          "Rent roll",
          "Dated unit-level schedule of occupancy and lease terms.",
        ],
        ["Arrears", "Amounts owed but not yet paid."],
        [
          "Lease-up",
          "Period of moving from initial availability toward stabilized occupancy.",
        ],
      ],
      refs: [],
      apply: [
        "A projected development model has 200 rows of market rents. Is that an actual rent roll?",
        "No; projections are not signed leases and do not prove occupancy.",
        "Yes, if the rows are numbered.",
        "Yes, if the projected rents match a federal benchmark.",
        "The source and status of the lease evidence matter more than its format.",
      ],
      pitch: [
        "What would you ask to see before calling scheduled rent income received?",
        "I would reconcile the dated rent roll to leases, concessions and the collections ledger. An occupied unit can still owe rent.",
      ],
    },
    {
      id: "evidence",
      title: "Resolve a discrepancy without erasing it",
      concept: "Evidence-preserving overrides",
      definition:
        "A documented value reports what a source says. A correction fixes an identifiable error; an estimate is an assumption where evidence is incomplete. An override is a separate human assertion with attribution, not an edit to the original evidence.",
      why: "A lender may need to reconstruct a decision as it was made. If a source, correction and judgment call all look identical, the history cannot be trusted.",
      example:
        "Suppose a signed schedule reads 180 but an extraction shows 108. A reviewer can cite the page and correct the extraction. If a planner instead expects 190 next year, that is an estimate and needs a different label.",
      desk: "Preserve River North’s 180/200, $47.3m/$50m and $2.6m/$2.5m pairs. Identify scope and period; record who overrode what and when. Leave unresolved items unresolved. An append-only event log keeps prior actions.",
      trap: "Confusing permission to change a working number with authority to certify it. A Member’s estimate is not a city approval.",
      deeper:
        "A useful reconciliation memo names each source and definition, quantifies the difference, lists evidence still needed and states a working assumption with owner and date. If a later document resolves it, add a new event. Do not silently erase the old decision or disclose licensed data in a broadly readable log.",
      terms: [
        [
          "Override",
          "Attributed working value layered over a preserved source value.",
        ],
        ["Correction", "A repair supported by identifiable evidence."],
        ["Estimate", "An explicit assumption, not a documented fact."],
        [
          "Append-only log",
          "History in which later events are added rather than editing or deleting previous events.",
        ],
      ],
      refs: [],
      apply: [
        "The model says 200 units and the summary 180. A Member thinks 190 is likely. How label it?",
        "An attributed estimate, with both source values retained.",
        "A correction proving both sources wrong.",
        "The new official zoning capacity.",
        "An opinion does not become a documented correction by being entered into a tracker.",
      ],
      pitch: [
        "How would you let the team move forward with a disputed number?",
        "I would give the working assumption an owner, date and estimate label. The source values stay available so the lender can reproduce the decision or challenge it.",
      ],
    },
  ],
};
