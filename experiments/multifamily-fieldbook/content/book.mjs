import institutions from "./institutions.mjs";
import zoning from "./zoning.mjs";
import income from "./income.mjs";
import returns from "./returns.mjs";
import costs from "./costs.mjs";
import diligence from "./diligence.mjs";
export { decisions } from "./decisions.mjs";
export const chapters = [
  institutions,
  zoning,
  income,
  returns,
  costs,
  diligence,
];
export const lessons = chapters.flatMap((c) => c.lessons);
export const glossary = lessons
  .flatMap((l) =>
    l.terms.map(([term, meaning]) => ({ term, meaning, lesson: l.id })),
  )
  .sort((a, b) => a.term.localeCompare(b.term, "en"));

// Verification destinations, not assertions that a live policy or a project document was checked.
export const sources = {
  hud: [
    "HUD USER · Fair Market Rents",
    "Select fiscal year, geography, bedroom count and the relevant utility convention.",
    "https://www.huduser.gov/portal/datasets/fmr.html",
  ],
  qct: [
    "HUD USER · Qualified Census Tracts and Difficult Development Areas",
    "Use the official designation lists for the applicable year and program.",
    "https://www.huduser.gov/portal/datasets/qct.html",
  ],
  cdfi: [
    "U.S. Treasury CDFI Fund · Opportunity Zones Resources",
    "Find the certified tract list for the designation round; do not substitute an undated map.",
    "https://www.cdfifund.gov/opportunity-zones",
  ],
  nmtc: [
    "CDFI Fund · New Markets Tax Credit Program",
    "Check eligible entities, allocation awards and current program guidance.",
    "https://www.cdfifund.gov/programs-training/programs/new-markets-tax-credit",
  ],
  irs: [
    "Internal Revenue Service · Opportunity Zones",
    "Check the rules, regulations, elections and current guidance for the investment date and transaction.",
    "https://www.irs.gov/credits-deductions/opportunity-zones-frequently-asked-questions",
  ],
  ozlaw: [
    "GovInfo · Public Law 119-21, section 70421",
    "Read the amendments, effective dates and transition rules alongside Internal Revenue Code sections 1400Z-1 and 1400Z-2.",
    "https://www.govinfo.gov/content/pkg/PLAW-119publ21/pdf/PLAW-119publ21.pdf",
  ],
  fhfa: [
    "Federal Housing Finance Agency",
    "Check current enterprise regulation, status and multifamily policy.",
    "https://www.fhfa.gov/",
  ],
  fannie: [
    "Fannie Mae · Multifamily Selling and Servicing Guide",
    "Read the applicable underwriting guidance and the lender’s actual commitment.",
    "https://mfguide.fanniemae.com/",
  ],
  freddie: [
    "Freddie Mac · Multifamily",
    "Consult the applicable Seller/Servicer Guide and product terms, not a generic leverage target.",
    "https://mf.freddiemac.com/",
  ],
  gma: [
    "Washington State Legislature · chapter 36.70A RCW",
    "Check current growth management and middle housing law, amendments and effective dates.",
    "https://app.leg.wa.gov/RCW/default.aspx?cite=36.70A",
  ],
  commerce: [
    "Washington State Department of Commerce",
    "Look up the Washington State Zoning Atlas methodology and the middle housing implementation guidance.",
    "https://www.commerce.wa.gov/",
  ],
  census: [
    "U.S. Census Bureau · TIGER/Line geographic files",
    "Use the 2010 census tract geography for the legacy designations. Check relationship files for any decade comparison.",
    "https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html",
  ],
  local: [
    "City or county planning and permit authority",
    "Request the adopted zoning map, municipal or county code, amendments, overlays and site-specific approval record. The jurisdiction is not supplied.",
  ],
  county: [
    "County assessor, treasurer and data custodian",
    "Check the parcel identifier, assessment year, tax bill, metadata and license. For legal boundaries request title and survey evidence.",
  ],
  contract: [
    "Executed project documents and provider agreements",
    "Read amendments, terms and effective dates. Confirm legal terms with counsel and financial assumptions with the responsible lender or underwriter.",
  ],
};

export const route = [
  {
    minutes: 8,
    title: "Know which desk to call",
    note: "Distinguish the housing benchmark, Treasury designation and local zoning authority.",
    links: [
      ["lesson/hud", "Rent benchmarks"],
      ["lesson/state", "State vs. local"],
      ["decision/oz-map", "Defend the OZ overlay"],
    ],
  },
  {
    minutes: 9,
    title: "Screen without promising a permit",
    note: "Calculate the density ceiling, then name the constraint it ignores.",
    links: [
      ["lesson/density", "Density ceiling"],
      ["lesson/permission", "Use permission"],
      ["decision/atlas", "Defend the atlas"],
    ],
  },
  {
    minutes: 9,
    title: "Follow one dollar of rent",
    note: "Reconcile the income bridge. Be ready to say where the operating statement stops.",
    links: [
      ["lesson/egi", "Effective income"],
      ["lesson/noi", "Operating income"],
      ["decision/disagreement", "Defend the flag"],
    ],
  },
  {
    minutes: 12,
    title: "Reconcile River North",
    note: "Compare whole source packages. Say which returns you can calculate and which are missing inputs.",
    links: [
      ["case", "Open the case lab"],
      ["lesson/coverage", "Debt coverage"],
      ["decision/metrics", "Defend the metrics"],
    ],
  },
  {
    minutes: 8,
    title: "Find the funding gap",
    note: "Separate missing sources from a measured shortfall. Check commitments as well as totals.",
    links: [
      ["lesson/cost", "All-in cost"],
      ["lesson/balance", "Sources & uses"],
      ["decision/override", "Defend a working estimate"],
    ],
  },
  {
    minutes: 14,
    title: "Practice the hard follow-ups",
    note: "Say your choices aloud before opening the model answers. Spend the last two minutes on the terms you missed.",
    links: [
      ["decisions", "Decision desk"],
      ["decision/licenses", "Challenge: usage rights"],
      ["review", "Three-term recall"],
    ],
  },
];

export const interviewCard = {
  opening:
    "“I built the search around two questions: which Washington sites deserve a closer look, and which numbers can we defend when a lender asks? The map screens candidates; it does not grant permits or tax benefits. In the document tracker I keep the source, the discrepancy and any human estimate visible so someone else can reproduce the decision.”",
  checks: [
    [
      "Who decides?",
      "Ask the assessor about the tax parcel, the local planning authority about permitted use, Treasury about the designated tract and the lender about loan terms.",
    ],
    [
      "Which denominator?",
      "Annual net operating income over value is a cap rate; stabilized annual income over total cost is yield on cost; eligible annual income over annual debt service is coverage.",
    ],
    [
      "What is missing?",
      "River North’s model gives 200 units, $50 million cost and $2.5 million net operating income. That implies 5.00% on cost only on matching stabilized and all-in bases. No loan schedule, signed leases or approved plans were supplied.",
    ],
  ],
};
export const projectBoundary =
  "The project facts and River North figures come only from the supplied coretsu-houses brief. No underlying agreement, rent roll, model, parcel, license or approval was inspected. All other numerical examples are teaching assumptions, not project facts. [VERIFY] marks a question for the named primary authority, not an assurance of current law, credit approval or tax treatment.";
export const casePackages = [
  {
    id: "summary",
    label: "Document summary",
    units: 180,
    cost: 47_300_000,
    noi: 2_600_000,
  },
  {
    id: "model",
    label: "Financial model",
    units: 200,
    cost: 50_000_000,
    noi: 2_500_000,
  },
];
