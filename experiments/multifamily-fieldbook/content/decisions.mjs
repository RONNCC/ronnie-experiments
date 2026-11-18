// Recommendations are for the product described in the brief, not claims about its implementation.
export const decisions = [
  {
    id: "provenance",
    group: "Evidence",
    title: "Source every number",
    question:
      "Should the evidence live on the figure or just in the project folder?",
    options: [
      [
        "Headline only",
        "Fastest for a broker triaging sites; removes clutter when the immediate decision is simply whether to look closer.",
      ],
      [
        "One dated deal packet",
        "Easy for an investment committee to circulate and reproduce if every figure really comes from one frozen package.",
      ],
      [
        "Document, version and date per number",
        "A lender can find the exact basis for a cost or unit count even when documents change at different times.",
      ],
    ],
    fit: "Use per-number sourcing. A screen can stay compact, but a tracker must let a second person reproduce a calculation after the package changes.",
    say: [
      "I chose per-number sourcing over one link to the folder because a plan and a budget can change on different days.",
      "At River North, 180 units and 200 units support different projections.",
      "I want the lender to see which count drove the number before relying on it.",
    ],
    challenge: "If it has a source, can I underwrite it?",
    answer:
      "Not from the citation alone. It proves what the document said; check the unit schedule, approval status and cost estimate for the same scope.",
    checks: [
      "Name a realistic simpler alternative.",
      "Explain how a revision changes a deal calculation.",
      "Distinguish traceability from truth.",
    ],
    miss: "Saying “verified” when you mean “documented” overstates the evidence.",
    lesson: "actual",
  },
  {
    id: "disagreement",
    group: "Evidence",
    title: "Flag conflicting documents",
    question: "When two sources disagree, should the product pick a winner?",
    options: [
      [
        "Newest file wins",
        "Useful for a strictly controlled revision series with one author and identical scope.",
      ],
      [
        "A designated source per field",
        "Efficient when the executed contract or approved plan is known to govern that exact question.",
      ],
      [
        "Show both and flag the difference",
        "Preserves actual-versus-forecast or scope differences for the underwriter who has to defend the choice.",
      ],
    ],
    fit: "Flag first. A human can then document which source governs which purpose; a later upload or an average is not a reconciliation.",
    say: [
      "I chose visible disagreement over newest-file-wins because two documents can measure different things.",
      "River North has a $100,000 difference between its two net operating income figures.",
      "I would check period, stabilization and expenses before using either one.",
    ],
    challenge: "Are you pushing all judgment onto the lender?",
    answer:
      "No. Quantify the delta, identify source and period, name what would resolve it and record a working assumption if needed. Escalate the material differences instead of hiding them.",
    checks: [
      "Quantify a supplied difference.",
      "Name a benign reason for disagreement.",
      "Say what evidence would resolve it.",
    ],
    miss: "“The higher number is wrong” is just as unsupported as assuming it is right.",
    lesson: "noi",
  },
  {
    id: "override",
    group: "Evidence",
    title: "Layer overrides over the source",
    question:
      "How should a team proceed when a sourced value is wrong or insufficient?",
    options: [
      [
        "Lock every imported value",
        "Prevents accidental alteration and is appropriate for an archival copy, but stalls scenario work.",
      ],
      [
        "Edit the displayed cell directly",
        "Fast for a private scratch model, but a later reviewer may not know what the file actually said.",
      ],
      [
        "Add an attributed working value",
        "Lets the deal team distinguish a supported correction from a judgment call without destroying the source.",
      ],
    ],
    fit: "Keep the original; show the override as corrected or estimated with who and when. For underwriting, ask for a reason and supporting evidence.",
    say: [
      "I chose a layered override over editing the source because the original is part of our diligence record.",
      "Correcting a misread page is different from estimating next year’s rent.",
      "I want the lender to see both the old evidence and who made the working assumption.",
    ],
    challenge:
      "What stops an optimistic estimate from becoming the new base case?",
    answer:
      "An estimate label and attribution make the judgment visible, not approved. Before investment approval, reconcile material estimates to evidence or disclose them as scenarios.",
    checks: [
      "Preserve the original value.",
      "Separate correction from estimate.",
      "Give the human assertion an owner and time.",
    ],
    miss: "Do not call a Member’s estimate a correction without evidence.",
    lesson: "evidence",
  },
  {
    id: "audit",
    group: "Evidence",
    title: "Append history instead of rewriting it",
    question: "Can someone edit an old audit event to clean up a mistake?",
    options: [
      [
        "Keep the current state only",
        "Cheap and simple for a disposable site shortlist, but cannot reconstruct last week’s financing decision.",
      ],
      [
        "Save periodic snapshots",
        "Helpful for recovering a model version, but actions between snapshots can disappear.",
      ],
      [
        "Append an event for every action",
        "Makes a chronology of who did what, with corrections recorded as later events rather than rewrites.",
      ],
    ],
    fit: "Use append-only history: writers append, not update or delete; authorized reviewers still need to read it. Limit what goes into it. This is not a claim of independent tamper-proof storage.",
    say: [
      "I chose an append-only audit history over editable notes because a lender may need the sequence of a change.",
      "If a user makes a mistake, the correction becomes the next event.",
      "That preserves accountability without pretending the first value was right.",
    ],
    challenge:
      "If it is “write-only,” how can I audit it, and is it tamper-proof?",
    answer:
      "Write-only describes the producer’s allowed operations, not a ban on authorized reading. Append-only behavior alone does not prove physical immutability; access controls, retention and independent integrity checks would need verification.",
    checks: [
      "Say who can append versus read.",
      "Correct by adding a later event.",
      "Do not promise tamper-proof storage.",
    ],
    miss: "“Nobody can ever read or compromise the log” is not what append-only means.",
    lesson: "evidence",
  },
  {
    id: "atlas",
    group: "Site search",
    title: "Use the state zoning snapshot",
    question:
      "Should early screening depend on a statewide atlas or a live integration for every city?",
    options: [
      [
        "Maintain each local map and code",
        "Best proximity to controlling evidence and amendments if integrations and interpretations are kept current.",
      ],
      [
        "Ask planners site by site",
        "Best for consequential diligence and unusual parcels; too slow for comparing a statewide shortlist.",
      ],
      [
        "Use the Washington State Zoning Atlas for screening",
        "Consistent statewide vocabulary and coverage, in exchange for vintage and generalization risk.",
      ],
    ],
    fit: "Use the April 2024–June 2025 snapshot for the search question. A local map alone is not the entire code either. Escalate shortlisted sites to current official maps, use tables and amendments.",
    say: [
      "I chose the state atlas over maintaining every city feed because the first decision is which sites deserve diligence.",
      "Its statewide snapshot makes comparisons possible, not legally conclusive.",
      "I label it “not a legal zoning determination” and take serious candidates back to the controlling code.",
    ],
    challenge: "What if an amendment took effect yesterday?",
    answer:
      "The snapshot may miss it. For a live deal, verify the jurisdiction, official map and code, effective date, overlays and planning record before pricing the site on its capacity.",
    checks: [
      "Name the snapshot and its vintage.",
      "State the screening benefit and staleness cost.",
      "Identify the controlling local verification step.",
    ],
    miss: "“Published by the state, therefore legally controlling” reverses the hierarchy.",
    lesson: "state",
  },
  {
    id: "classes",
    group: "Site search",
    title: "Group zones without losing the code",
    question:
      "How much local zoning detail belongs in the statewide map legend?",
    options: [
      [
        "Color every local code",
        "Preserves local distinctions for experts working in one jurisdiction, but creates an unreadable statewide legend.",
      ],
      [
        "Map only apartment yes/no",
        "Fast for one question, but erases conditional review and creates false certainty when fields are missing.",
      ],
      [
        "Use four broad classes, retain the local fields",
        "Readable comparisons without throwing away the original code, use-specific permissions or unknowns.",
      ],
    ],
    fit: "Use Multifamily, Commercial/mixed-use, Single-family/low-scale and Other/not classified. Let the underlying zone code and use table answer the next question.",
    say: [
      "I chose four broad classes over a color for every local code because an investor needs a legible first pass across markets.",
      "A class is not the answer to whether apartments are permitted.",
      "I keep the native code and permitted, conditional or not-permitted field for that follow-up.",
    ],
    challenge: "Does Other/not classified mean apartments are prohibited?",
    answer:
      "No. It may mean insufficient or unmapped classification. An explicit prohibition for the proposed use and an unknown class must remain distinct.",
    checks: [
      "Explain what the legend simplifies.",
      "Keep code and use permission distinct.",
      "Separate unknown from prohibited.",
    ],
    miss: "“All mixed-use sites allow this project” confuses class with permission.",
    lesson: "permission",
  },
  {
    id: "oz-map",
    group: "Site search",
    title: "Map the designated tract vintage",
    question: "Which geometry should support the Opportunity Zone overlay?",
    options: [
      [
        "Omit the layer",
        "Avoids overinterpreting tax geography, but loses a useful first-pass search criterion.",
      ],
      [
        "Use modern tracts with a documented crosswalk",
        "Useful for comparing newer demographic data; an approximation cannot replace the original designation geometry.",
      ],
      [
        "Pair the 2018 list with 2010 tract shapes",
        "Matches the original designations on their own geography and makes boundary review possible.",
      ],
    ],
    fit: "Show that pairing as a dated overlay. Confirm a specific parcel and the applicable regime before any claim about the transaction.",
    say: [
      "I chose the original tract geography over a convenient newer boundary because the designation was made on the older tract.",
      "The map can identify a candidate for tax diligence.",
      "It cannot establish that an investor, fund or business qualifies.",
    ],
    challenge:
      "Does the overlay establish a benefit under the newer tax regime?",
    answer:
      "No. [VERIFY] Check the applicable Treasury designation list, effective dates in the amended statute, current Internal Revenue Service guidance and the fund’s facts with tax counsel.",
    checks: [
      "State both the designation and geography years.",
      "Explain why a newer shape can be wrong.",
      "Separate geographic overlap from tax qualification.",
    ],
    miss: "Do not sell a ten-year tax outcome based on a colored parcel.",
    lesson: "oz-tax",
  },
  {
    id: "parcels",
    group: "Site search",
    title: "Accept county parcels with conditions",
    question:
      "How should the search use assessor-style records that arrive as-is?",
    options: [
      [
        "License a harmonized parcel product",
        "Can simplify normalization and service levels, but entails cost, coverage limits and another license to inspect.",
      ],
      [
        "Limit search to cleared counties or omit parcels",
        "Reduces rights and quality risk at the cost of statewide parcel-level utility.",
      ],
      [
        "Use permitted county records with explicit caveats",
        "Preserves local identifiers and useful search geometry while keeping provenance, quality limits and terms in view.",
      ],
    ],
    fit: "Use as-is data only within its permitted scope. About 3.2 million statewide parcels in the brief is a scale estimate, not evidence every record can be republished. Withhold a layer or export where rights are unclear.",
    say: [
      "I chose county parcels where permitted over assuming one universal parcel license because terms vary by county.",
      "The polygons help us identify land to investigate, not establish survey boundaries or market value.",
      "If the intended use is not cleared, I would leave those records out of that view.",
    ],
    challenge:
      "Will an “as-is” disclaimer let you export every county’s parcel file?",
    answer:
      "No. A quality disclaimer is not a redistribution license. [VERIFY] Read the specific county’s terms or written permission for the contemplated display and export; use a licensed alternative or omit it.",
    checks: [
      "Distinguish quality from usage rights.",
      "Name an alternative if rights are missing.",
      "Explain why a tax polygon is not a survey.",
    ],
    miss: "Publicly accessible does not mean unrestricted redistribution.",
    lesson: "local",
  },
  {
    id: "filters",
    group: "Site search",
    title: "Filter for minimum viable unit count",
    question:
      "Can a capacity filter be useful without claiming an entitlement?",
    options: [
      [
        "Show every parcel",
        "Maximizes recall when input fields are sparse; burdens the team with unsuitable sites.",
      ],
      [
        "Require an approved plan to enter the search",
        "Strongest evidence of an approved count but excludes early development opportunities.",
      ],
      [
        "Use transparent density and minimum-unit screens",
        "Finds candidates that may meet a target while exposing the ceiling, acreage and unknowns.",
      ],
    ],
    fit: "Use screening capacity, not a promise. Separate documented proposed counts from estimates and make missing density discoverable rather than silently treating it as zero.",
    say: [
      "I chose a minimum-unit screen over requiring approved plans because site search begins before entitlement.",
      "One and a half qualifying acres at forty units per acre gives a sixty-unit density ceiling, not sixty buildable units.",
      "I would still check the envelope, use rules and approval path.",
    ],
    challenge: "How many viable sites might you miss when density is blank?",
    answer:
      "We do not know from the brief. Show which candidates are unknown or excluded for missing inputs, offer review of that group and measure it before claiming coverage.",
    checks: [
      "Explain the filter’s business purpose.",
      "Walk through acreage times density.",
      "Name a binding constraint and handle missing values.",
    ],
    miss: "“Passed Min units” does not mean “approved to build.”",
    lesson: "density",
  },
  {
    id: "metrics",
    group: "Underwriting",
    title: "Choose metrics by the question they answer",
    question:
      "Which outputs should a multifamily development model template show?",
    options: [
      [
        "A small unlevered screen",
        "Cost per unit and operating yield are fast to compare when financing and exit timing are unknown.",
      ],
      [
        "A single investor return headline",
        "Useful for a quick mandate filter, but highly dependent on leverage, exit and dates.",
      ],
      [
        "A staged property, lender and equity set",
        "Shows which perspective drives a decision and leaves unsupported measures missing until inputs exist.",
      ],
    ],
    fit: "Property: net operating income (NOI) tests operations, cap rate relates NOI to value and yield on cost relates stabilized NOI to cost. Lender: debt service coverage ratio (DSCR) tests payments and loan-to-cost (LTC) tests funding share. Equity: internal rate of return (IRR) measures timing and equity multiple measures dollars returned. Show the denominator, period and evidence beside each.",
    say: [
      "I chose a staged set of property, debt and equity measures over a single return headline because each audience asks a different question.",
      "The River North model can imply a five percent yield on cost if its income is stabilized and the cost is all-in.",
      "It cannot give me a debt coverage ratio or an equity return without payments and dated equity cash flows.",
    ],
    challenge: "Why leave blanks in an investor template?",
    answer:
      "A missing denominator is a diligence request. For cap rate request price or value; for coverage request debt service; for LTC request the loan and eligible cost; for equity returns request contributions, distributions and dates.",
    checks: [
      "Separate property, lender and equity views.",
      "Distinguish value from cost and IRR from multiple.",
      "Give a concrete missing input rather than a guessed metric.",
    ],
    miss: "Calling NOI divided by cost a market cap rate is a denominator error.",
    lesson: "yield",
  },
  {
    id: "roles",
    group: "Access & rights",
    title: "Give Members operating latitude",
    question: "Which actions should be reserved to the Admin role?",
    options: [
      [
        "Admin performs all material edits",
        "Central control can suit a small high-risk approval workflow, but leaves the deal team waiting to reconcile files.",
      ],
      [
        "Give everyone configuration and role powers",
        "Low friction in a disposable sandbox, but a deal contributor could also change the rules of access.",
      ],
      [
        "Members work deals; reserve role assignments and configuration",
        "Allows normal project work without delegating control of the permission framework.",
      ],
    ],
    fit: "In your brief a Member can do everything except assign roles and edit configuration. This is broad operating access, not evidence of investment approval authority. Other roles are unspecified.",
    say: [
      "I chose broad Member deal permissions over an Admin bottleneck because analysts need to reconcile changing documents quickly.",
      "Assigning roles and editing configuration stay outside the Member role.",
      "I would distinguish a recorded edit from authority to approve an investment.",
    ],
    challenge: "Can a Member materially change an underwriting assumption?",
    answer:
      "Yes, broad working permissions make that a real risk. Attribution and history aid review but do not prevent a bad estimate; if formal sign-off is required, define and enforce that approval separately.",
    checks: [
      "State exactly the two Member exclusions.",
      "Acknowledge material edit risk.",
      "Do not invent sign-off permissions for unnamed roles.",
    ],
    miss: "An audit trail is not least privilege or a substitute for approval controls.",
    lesson: "evidence",
  },
  {
    id: "licenses",
    group: "Access & rights",
    title: "Keep restricted data out of public outputs",
    question:
      "Should every source travel through the same display and export paths?",
    options: [
      [
        "Use only sources cleared for the intended public use",
        "Simplest public product and lowest leakage risk, but fewer inputs for internal analysis.",
      ],
      [
        "Negotiate broader display and redistribution rights",
        "Could support a richer public product, subject to price, actual contract rights and attribution obligations.",
      ],
      [
        "Separate internal-use-only data from cleared data",
        "Allows authorized internal analysis while controlling public screens, downloads and downstream artifacts.",
      ],
    ],
    fit: "Treat Zillow as internal use only per the brief. Do not infer rights for RentCast because it was considered, or reincorporate the removed Realtor data. Verify each source and use; even open data can require attribution.",
    say: [
      "I chose separate usage paths over treating every feed as open because possession is not permission to publish.",
      "A Zillow figure for internal analysis should not automatically travel into a public export.",
      "I would use cleared inputs for the shared output or obtain the necessary rights.",
    ],
    challenge:
      "If you hide the field on the screen, can the public download still contain it?",
    answer:
      "No. Do not ship restricted values to unauthorized clients in underlying files, exports, caches, logs or derived reports without rights. [VERIFY] Check each provider’s controlling agreement for the audience and intended use.",
    checks: [
      "Name the internal-only source and intended audience.",
      "Cover exports and underlying files, not just the visible map.",
      "Offer exclusion or a proper license, not a workaround.",
    ],
    miss: "“It is online” and “we can republish it” are not equivalent.",
    lesson: "actual",
  },
];
