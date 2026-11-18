export default {
  id: "A",
  title: "Who decides what?",
  topic: "Institutions",
  intro:
    "Take the same parcel to a planner, an assessor and a lender. Each can answer a different question. Start by learning which desk to call.",
  lessons: [
    {
      id: "hud",
      title: "A rent benchmark is not a lease",
      concept: "Fair Market Rent",
      definition:
        "The U.S. Department of Housing and Urban Development (HUD) runs federal housing programs. Its Fair Market Rent (FMR) is an area and bedroom specific estimate of gross monthly rent used in rental assistance. Gross here includes eligible tenant-paid utilities.",
      why: "An investor asks what the owner can collect. A public benchmark describes a market for a program; it is not a signed rent, a property appraisal or a guaranteed voucher payment.",
      example:
        "If a two-bedroom FMR is $1,600 and the comparable utility allowance is $100, compare $1,500 to the owner’s contract rent. Do not put $1,600 per unit into the revenue line just because it came from HUD.",
      desk: "For River North, ask what supports the rent assumption and which unit mix it covers. The brief supplies neither leases nor a rent roll. It does not say the app ingests FMRs.",
      trap: "“HUD says these units will rent for $1,600.” A lease, current comparable leases and concessions are the evidence you need.",
      deeper:
        "HUD also designates Qualified Census Tracts (QCTs) and Difficult Development Areas (DDAs) for the Low-Income Housing Tax Credit (LIHTC). A QCT concerns local income or poverty; a DDA concerns high development costs relative to incomes. These can matter to eligible tax credit basis. HUD maps can put federal layers side by side; the Treasury Department, not HUD, certifies Opportunity Zones. [VERIFY] Use HUD’s lists for the relevant year, not a screenshot.",
      terms: [
        [
          "HUD",
          "U.S. Department of Housing and Urban Development; federal housing agency.",
        ],
        [
          "FMR",
          "Fair Market Rent; gross rent benchmark by place and bedroom count.",
        ],
        [
          "LIHTC",
          "Low-Income Housing Tax Credit; a federal affordable rental housing credit generally allocated through state housing agencies.",
        ],
        [
          "QCT",
          "Qualified Census Tract; an income or poverty based LIHTC designation.",
        ],
        [
          "DDA",
          "Difficult Development Area; a cost relative to income LIHTC designation.",
        ],
      ],
      refs: ["hud", "qct"],
      apply: [
        "What would support a proposed rent at River North?",
        "Comparable recent leases for similar units, adjusted for utilities and concessions.",
        "An Opportunity Zone boundary.",
        "The area FMR multiplied by the proposed unit count.",
        "A benchmark starts a conversation; leases with matching unit sizes and terms support the assumption.",
      ],
      pitch: [
        "Why not use one official rent for every unit?",
        "HUD gives us a comparable benchmark, not this building’s leases. I would check bedroom mix, utilities and signed comparables before defending a rent.",
      ],
    },
    {
      id: "cdfi",
      title: "Follow the Treasury data trail",
      concept: "The CDFI Fund",
      definition:
        "The Community Development Financial Institutions (CDFI) Fund is part of the U.S. Treasury. It certifies qualifying mission-driven financial institutions, administers New Markets Tax Credit (NMTC) allocations and published resources for the original Opportunity Zone (OZ) tract designations.",
      why: "A tract list, a lender certification and a tax credit allocation are different outputs. None of them is a commitment to lend on your building.",
      example:
        "Two sites may lie in the same designated tract. A lender willing to finance one has made zero commitments to the other. Name the institution, the program and the written commitment separately.",
      desk: "Use the Treasury tract identifier and designation vintage as the evidence behind the OZ overlay. Do not infer that a CDFI is involved in River North.",
      trap: "“This tract got an NMTC allocation.” The Fund allocates tax credit authority to qualified Community Development Entities, not automatically to every project on a map.",
      deeper:
        "For the original OZ round, state executives nominated eligible tracts and Treasury certified designations. HUD tools can display this geography. Congress sets the statute; Treasury and the Internal Revenue Service (IRS) implement it. This chain is why the map publisher, the certifier and the tax adviser are not interchangeable.",
      terms: [
        [
          "CDFI",
          "Community Development Financial Institution; a certified mission-driven financial institution, distinct from the Treasury fund that certifies it.",
        ],
        [
          "NMTC",
          "New Markets Tax Credit; allocation authority awarded to qualifying Community Development Entities.",
        ],
        [
          "OZ",
          "Opportunity Zone; a Treasury-certified geographic designation used in an investment tax regime.",
        ],
      ],
      refs: ["cdfi", "nmtc"],
      apply: [
        "What can the 2018 tract list establish for your map?",
        "Whether a mapped location overlaps a tract in that designation vintage.",
        "Whether a lender has approved the applicant.",
        "Whether a tax credit has been allocated to River North.",
        "The list is evidence of geography, not financing or a tax opinion.",
      ],
      pitch: [
        "Why keep the publisher next to a federal overlay?",
        "A HUD map can display a Treasury designation. I want the investor to know whose tract list we used and what it does not certify.",
      ],
    },
    {
      id: "oz-tax",
      title: "A tax boundary is only the first test",
      concept: "An Opportunity Zone investment",
      definition:
        "A Qualified Opportunity Fund (QOF) is an investment vehicle that must satisfy statutory asset tests. It may invest through a Qualified Opportunity Zone Business (QOZB), an operating entity subject to separate tests. A pin in an OZ is not either of those entities.",
      why: "An investor’s eligible gain, investment timing, fund structure, property qualification and holding period all matter. Congress wrote Internal Revenue Code sections 1400Z-1 and 1400Z-2; Treasury regulations and IRS guidance explain administration.",
      example:
        "Suppose an investor reinvests $100 of eligible gain in a qualifying fund interest which later sells for $160. Deferring the original $100 and potentially excluding the subsequent $60 appreciation are two different benefits. A basis step-up raises the tax starting value used to measure a gain; it is not a cash payment.",
      desk: "Your 2018 overlay on 2010 tracts is a screening lead. Do not model a tax saving for River North without parcel confirmation, transaction dates and fund counsel’s analysis.",
      trap: "“Hold the building ten years and all tax disappears.” Under the original regime the qualifying holding period concerns the investment in the fund; the original deferred gain has a separate inclusion date.",
      deeper:
        "[VERIFY] For the original regime, compare an earlier inclusion event with December 31, 2026 for recognition of the deferred gain. Earlier five- and seven-year basis increases depended on having enough time before that date. After a qualifying ten-year hold, a fair-market-value basis election on sale of a qualifying fund interest can exclude eligible appreciation, not the original deferred gain. The 2025 changes often called “OZ 2.0” provide for recurring designation rounds. For qualifying investments made after 2026, check the rolling five-year deferral clock (or earlier inclusion), the five-year basis increase and enhanced treatment for qualifying rural funds. An ordinary rural address alone does not meet a fund-level test. Do not roll the legacy map forward or blend the clocks. Check Public Law 119-21 section 70421, the effective dates for the particular investment, current IRS guidance and the applicable Treasury designation list before quoting terms.",
      terms: [
        ["IRS", "Internal Revenue Service; administers federal tax law."],
        [
          "QOF",
          "Qualified Opportunity Fund; investment vehicle subject to qualifying asset rules.",
        ],
        [
          "QOZB",
          "Qualified Opportunity Zone Business; a business subject to separate qualifying requirements.",
        ],
        [
          "Basis",
          "Tax starting value used in calculating gain or loss, subject to adjustments.",
        ],
        [
          "Deferral",
          "Postponing recognition of a gain; not the same as excluding it.",
        ],
      ],
      refs: ["ozlaw", "irs", "cdfi"],
      apply: [
        "A sponsor wants to put ten years of tax savings into the base case solely from a map hit. What do you do?",
        "Separate the geographic hit from the investment tests and request current tax analysis.",
        "Treat the overlay as a federal tax opinion.",
        "Apply the legacy dates to all future investments.",
        "A tract is only one condition. Structure, vintage, holding periods and elections need separate evidence.",
      ],
      pitch: [
        "Why show the zone but not promise a tax result?",
        "The boundary helps us find a question worth asking. I would verify the designation and have counsel test the specific investment before giving a tax benefit any value.",
      ],
    },
    {
      id: "agency",
      title: "Who stands behind agency debt?",
      concept: "Agency multifamily debt",
      definition:
        "The Federal Housing Finance Agency (FHFA) regulates Fannie Mae and Freddie Mac, government-sponsored enterprises. Through lender networks, the enterprises buy or guarantee qualifying mortgages and help fund a secondary mortgage market. FHFA is not your loan officer.",
      why: "A lender expecting to deliver a loan to an enterprise cares about its underwriting and documentation standards. A construction loan and a permanent mortgage on a leased building solve different problems.",
      example:
        "If a building produces $120,000 a year before debt and proposed annual debt payments are $100,000, there is $1.20 of income for each $1.00 owed. That is a coverage calculation, not an agency approval.",
      desk: "Keep the income period and source beside the model output. Ask for the actual lender term sheet; the brief does not establish a River North lender or an agency execution.",
      trap: "“Fannie and Freddie are HUD grants.” This is mortgage finance. Loan size, eligibility and terms still need underwriting.",
      deeper:
        "A broker may quote preliminary proceeds, an underwriter may adjust rents or reserves, and the lender may issue a conditional commitment. Those are three different levels of evidence. [VERIFY] Check the applicable enterprise multifamily guide and lender term sheet for live requirements; there is no universal coverage threshold in this book.",
      terms: [
        [
          "FHFA",
          "Federal Housing Finance Agency; regulator of Fannie Mae and Freddie Mac.",
        ],
        [
          "Agency debt",
          "Common market shorthand here for enterprise multifamily mortgage financing through participating lenders.",
        ],
        [
          "Underwriting",
          "Testing evidence and assumptions to decide risk, terms and size of an investment or loan.",
        ],
      ],
      refs: ["fhfa", "fannie", "freddie"],
      apply: [
        "What would verify proposed debt terms for your project?",
        "A dated lender term sheet, with conditions distinguished from a commitment.",
        "FHFA’s existence as a regulator.",
        "A second model repeating the same interest rate.",
        "The underwriting guide sets a framework; the lender’s document addresses this transaction.",
      ],
      pitch: [
        "Why would a lender care about your data trail?",
        "A lender needs to reproduce the income and expense assumptions before sizing a loan. A traceable projection is useful evidence, not a commitment to fund.",
      ],
    },
    {
      id: "state",
      title: "A state atlas is not the local code",
      concept: "The state and local planning hierarchy",
      definition:
        "Washington’s Growth Management Act (GMA) sets a planning framework. Comprehensive plans describe a jurisdiction’s long-term policy; development regulations implement it. The Washington State Department of Commerce publishes the Washington State Zoning Atlas (WAZA), a generalized research snapshot.",
      why: "State middle housing laws can require local changes that allow more housing forms between detached homes and large apartment buildings. An atlas observation, a future land-use designation and today’s legally effective rules may differ.",
      example:
        "Suppose a plan calls for apartments in a corridor but the operative code still limits the parcel to a different use. Do not price apartment land on the plan alone. Check adopted amendments, effective dates and any directly applicable state rules.",
      desk: "Your snapshot spans April 2024 to June 2025. Label it “not a legal zoning determination.” Keep the native zone code, not just one of the four map classes.",
      trap: "“R-10 always means ten units per acre.” A zone code is a local label. Read the ordinance for that jurisdiction.",
      deeper:
        "[VERIFY] Start with chapter 36.70A of the Revised Code of Washington (RCW), Commerce’s middle housing guidance, the adopted local code and official map. Ask the planner which jurisdiction, effective date, exceptions and review process apply. A city’s implementation schedule is not safe to infer from the date a research layer was downloaded.",
      terms: [
        [
          "GMA",
          "Growth Management Act; Washington’s statutory planning framework.",
        ],
        [
          "WAZA",
          "Washington State Zoning Atlas; generalized research snapshot, not a legal zoning determination.",
        ],
        [
          "Comprehensive plan",
          "Long-range adopted policy, distinct from the development regulations used for a permit.",
        ],
        [
          "Middle housing",
          "Housing forms such as duplexes and small multiplexes, between a detached house and a large apartment building.",
        ],
      ],
      refs: ["gma", "commerce", "local"],
      apply: [
        "The atlas disagrees with a newer adopted city map. Which do you take to diligence?",
        "The current official map, code and effective amendments, confirmed with the jurisdiction.",
        "The atlas because it covers more counties.",
        "The more generous interpretation.",
        "Statewide coverage helps search; it does not outrank controlling law.",
      ],
      pitch: [
        "Why use a research snapshot at all?",
        "It lets us screen many markets on a common footing. Before relying on capacity, we take the site back to the controlling local and state rules.",
      ],
    },
    {
      id: "local",
      title: "Three questions, three local desks",
      concept: "Assessment versus permission",
      definition:
        "An assessor maintains tax parcel records and assessed values for taxation. The planning authority interprets land-use rules and processes entitlements. The permit office reviews a specific proposal for applicable permits. In an incorporated city and unincorporated county, the responsible desks can differ.",
      why: "A tax boundary is not a survey; an assessed value is not a purchase price; a planner’s preliminary conversation is not an issued building permit.",
      example:
        "A hypothetical parcel is assessed at $1 million and is under contract at $1.3 million. Neither number grants permission for even one apartment. For price, read the contract; for permitted development, identify the jurisdiction.",
      desk: "The county assessor-style parcel layer is as-is, about 3.2 million parcels statewide per your brief. Coverage, update dates, geometry quality and use rights can vary by county.",
      trap: "“The assessor approved the project footprint.” Ask for a survey and recorded legal description for boundaries; ask the reviewing authority for approvals.",
      deeper:
        "Work outward from the parcel identifier: confirm the legal description with title or survey evidence, match the parcel to the correct city or county, and then request the zoning and permit record. Keep an “unknown” where the county supplies no value; zero is a factual claim.",
      terms: [
        [
          "Parcel",
          "A unit of land represented in a land or tax record; a map polygon is not a legal survey.",
        ],
        [
          "Assessed value",
          "A value determined for property taxation, not necessarily the deal price or an appraisal for a loan.",
        ],
        [
          "Entitlement",
          "A land-use approval establishing specified development rights, often subject to conditions.",
        ],
      ],
      refs: ["county", "local"],
      apply: [
        "Who do you ask whether a use requires a conditional approval?",
        "The planning department with jurisdiction over that parcel.",
        "The county assessor who published the parcel polygon.",
        "The federal tax agency.",
        "Assessment, land-use approval and tax treatment are separate responsibilities.",
      ],
      pitch: [
        "Why keep county parcel data if it is as-is?",
        "It gives the search a parcel to investigate. I would verify its boundary, authority and use rights before relying on it in a transaction.",
      ],
    },
    {
      id: "tract",
      title: "Keep a tract with its vintage",
      concept: "Census tract vintage",
      definition:
        "A census tract is a statistical area defined for population reporting, not a lot or a zoning district. Tracts can split, merge or change boundaries between censuses. The original 2018 OZ designations reference 2010 census tract geography.",
      why: "A correct designation code joined to the wrong decade’s shape can put a dot on the wrong side of a tax boundary.",
      example:
        "Suppose one 2010 tract becomes two tracts in 2020. Matching the 2018 list to just one new identifier loses part of the old geometry. A crosswalk explains changes; it does not amend the designation.",
      desk: "Pair the Treasury designation list with 2010 shapes and keep both vintages visible. If the parcel straddles a boundary, flag it for review instead of treating its center point as conclusive.",
      trap: "“The newer shape is more current, so it must be more correct.” Correct for which designation?",
      deeper:
        "Geographic identifiers are strings: preserve leading zeros. A point-in-polygon result, a parcel intersection and a legal test for qualifying property answer different questions. [VERIFY] Check the applicable Treasury list, Census Bureau tract files and current guidance for a boundary case.",
      terms: [
        [
          "Census tract",
          "A statistical area; neither a parcel nor a land-use permission.",
        ],
        [
          "Vintage",
          "The reference period of a dataset or boundary definition.",
        ],
        [
          "Crosswalk",
          "A correspondence between different geographic definitions, not a redesignation.",
        ],
      ],
      refs: ["cdfi", "census", "irs"],
      apply: [
        "Which shapes belong with your 2018 designation overlay?",
        "The corresponding 2010 census tracts.",
        "Whatever tract file has the newest timestamp.",
        "County tax parcel polygons substituted for tracts.",
        "Match the geography used to designate the tract, not just the label.",
      ],
      pitch: [
        "Why deliberately use an older tract file?",
        "The designation names a tract as it existed in that geography. Changing the shapes without changing the law would change what our screen appears to say.",
      ],
    },
  ],
};
