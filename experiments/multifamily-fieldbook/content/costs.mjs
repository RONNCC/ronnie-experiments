export default {
  id: "E",
  title: "Balance the development budget",
  topic: "Development costs",
  intro:
    "A development budget buys land, time and a building. Test what each line includes, then ask where the money comes from.",
  lessons: [
    {
      id: "cost",
      title: "Build an all-in cost stack",
      concept: "Development cost scope",
      definition:
        "Land cost buys the site. Hard costs pay for physical work such as site preparation, structure and finishes. Soft costs pay for services such as design, permits and legal work. Total development cost also needs applicable contingency, financing, fees and other project uses.",
      why: "Two budgets can differ by millions without a difference in construction pricing. One may omit land, financing or an entire phase.",
      example:
        "A teaching budget has $2m land, $6m hard costs, $1m soft costs and $1m in combined other uses. Total = $10m. Comparing a contractor’s $6m construction estimate to that $10m all-in budget is not comparing like with like.",
      desk: "River North summary: $47.3m ÷ 180 ≈ $262,778 per unit. Model: $50m ÷ 200 = $250,000 per unit. The lower per-unit number does not prove a cheaper design; scope and unit mix are unknown.",
      trap: "Adding a lump-sum contractor estimate on top of its own detailed trades, or treating land already contributed as both free and a cash purchase.",
      deeper:
        "Read each budget’s inclusions, exclusions, pricing date, tax treatment and owner-supplied items. Normalize per unit or per gross square foot only after aligning the plans. A change in denominator can move cost per unit without any savings on a given unit.",
      terms: [
        ["Hard costs", "Physical construction and site work."],
        [
          "Soft costs",
          "Nonconstruction project services such as design, permits and legal work.",
        ],
        [
          "Total development cost",
          "All project uses for a stated scope and period, not just construction.",
        ],
      ],
      refs: [],
      apply: [
        "The River North model shows a lower cost per unit. What is the defensible inference?",
        "The same-document quotient is lower; reconcile scope and unit mix before claiming savings.",
        "Contractors have guaranteed savings.",
        "The larger unit count is approved.",
        "Cost per unit changes when its denominator changes.",
      ],
      pitch: [
        "Why show total cost beside cost per unit?",
        "One tells me the dollars to fund and the other normalizes the scope. I need both, tied to the same plan, before I can explain a change.",
      ],
    },
    {
      id: "contingency",
      title: "Price what is not yet known",
      concept: "Contingency",
      definition:
        "Contingency is a budget allowance for uncertain costs within a defined scope. Its percentage needs a base: 5% of hard costs is not 5% of total development cost.",
      why: "A project that appears fully funded can be fragile if unforeseen work consumes the remaining cushion. Unused contingency is not guaranteed profit.",
      example:
        "A 5% contingency on $6m of hard costs provides $300,000. A $180,000 approved change leaves $120,000 if there are no other draws. Do not count the change order and the original undiminished allowance as two buffers.",
      desk: "Track the estimate version and distinguish original budget, committed changes, cost to complete and remaining contingency. A missing allowance in one document is not a documented zero.",
      trap: "Calling an already identified scope item “contingency” to make a thin base budget look complete.",
      deeper:
        "Ask who controls release of contingency and whether owner and contractor contingencies overlap. Compare the remaining buffer with the uncontracted work, not simply the percentage at acquisition.",
      terms: [
        [
          "Contingency",
          "Budget allowance for uncertain costs on a specified base.",
        ],
        ["Change order", "Documented change to contract scope, price or time."],
      ],
      refs: [],
      apply: [
        "Which is better evidence of the remaining budget cushion?",
        "A reconciled allowance less approved uses, tied to the current scope.",
        "The starting percentage alone.",
        "The most optimistic estimate in the folder.",
        "A remaining cushion must account for commitments and draws.",
      ],
      pitch: [
        "Why not assume the unused contingency comes back to equity?",
        "It protects work that is not fully priced or complete. I would release it only after checking outstanding commitments and lender requirements.",
      ],
    },
    {
      id: "carrying",
      title: "Time has a price before opening",
      concept: "Financing costs and developer fees",
      definition:
        "Financing costs include loan fees and interest during development. A developer fee compensates the developer for work and risk under the deal terms. A fee can be a project use even if payment is deferred.",
      why: "A delayed approval can raise all-in cost even if the construction bid never changes. Who funds a deferred fee affects both the capital stack and the sponsor’s economics.",
      example:
        "At an illustrative 6% simple annual rate, a $5m average drawn balance for six months costs $150,000 in interest. An additional three months at the same balance adds $75,000. This is not interest on the full undrawn facility.",
      desk: "Reconcile schedules with funding draws and the interest budget. Verify a fee’s base, date and payment terms in an agreement rather than inferring them from a label.",
      trap: "Treating an interest reserve as extra income or charging both full commitment interest and drawn-balance interest for the same period.",
      deeper:
        "Construction debt is typically drawn over time. Check any unused line fee, origination fee, maturity and extension terms separately. A deferred developer fee can be shown as a use and a matching funding source only if the obligation and deferral are supported; it does not pay an unrelated cash invoice today.",
      terms: [
        [
          "Interest reserve",
          "Budgeted funding for interest during a specified period.",
        ],
        [
          "Developer fee",
          "Compensation for development services; verify payment and deferral terms.",
        ],
        ["Draw", "An advance against an available loan or funding commitment."],
      ],
      refs: [],
      apply: [
        "A schedule revision adds months but hard costs do not change. What else needs a review?",
        "Interest carry, fees, maturity, reserves and funding timing.",
        "Nothing until the contractor changes the bid.",
        "The tract vintage instead of the budget.",
        "Time affects financing even when physical scope stays constant.",
      ],
      pitch: [
        "How can a schedule disagreement change equity needs?",
        "More months can mean more interest and overhead before rents arrive. I would rerun the draw schedule and show who covers any shortfall.",
      ],
    },
    {
      id: "balance",
      title: "Make sources equal uses",
      concept: "Sources and uses",
      definition:
        "Uses are everything to fund for the stated transaction. Sources describe where that money comes from. If the only sources are debt and equity, debt + equity must equal total project uses in a fully funded budget.",
      why: "An unbalanced spreadsheet is a request for a decision: raise capital, reduce scope, correct a duplicate or document another source. It is not permission to invent equity.",
      example:
        "Uses of $10m minus $6m debt and $3m equity leave a $1m shortfall. If a verified $1m grant is added, the budget balances, but the distinction between committed and merely proposed sources still matters.",
      desk: "Flag any gap and list the sources, versions and dates. River North’s $50m model cost alone does not tell us the debt or equity; report “missing inputs,” not a $50m gap.",
      trap: "Inserting “other equity” equal to the residual and then describing the deal as fully capitalized.",
      deeper:
        "A balanced total is necessary, not sufficient. Sources can arrive too late or be subject to conditions. Build a monthly cash schedule; test whether construction draws, equity contributions and grant reimbursements precede the invoices they pay. A land contribution may balance a noncash land use without creating cash for construction.",
      terms: [
        [
          "Sources and uses",
          "Funding sources reconciled to every project use on the same scope and date.",
        ],
        [
          "Funding gap",
          "Uses in excess of identified sources; distinguish missing data from a measured shortfall.",
        ],
      ],
      refs: [],
      apply: [
        "Debt and equity are both missing from the River North brief. What should the app flag?",
        "Missing funding inputs; a numerical gap is not yet known.",
        "Zero gap because blank plus blank balances.",
        "A committed equity plug equal to total cost.",
        "Unknown amounts cannot be treated as verified zeros.",
      ],
      pitch: [
        "If the budget balances, is the project funded?",
        "Not necessarily. I also check whether each source is committed, drawable on time and sufficient for its eligible costs.",
      ],
    },
  ],
};
