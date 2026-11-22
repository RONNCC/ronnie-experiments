export default {
  id: "C",
  title: "Build the income statement",
  topic: "Income & expenses",
  intro:
    "Start with a full building at market rent. Walk down to what is collected, then subtract what it costs to operate. Keep the period consistent.",
  lessons: [
    {
      id: "gpr",
      title: "Start at full rent, not collected cash",
      concept: "Gross potential rent",
      definition:
        "Gross potential rent (GPR) is the rent a fully occupied building would generate at the stated rent basis. In this market-rent convention, loss to lease is the gap between assumed market rent and lower contractual rent on signed leases.",
      why: "A broker can show an attractive market rent while tenants are locked into older leases. A buyer does not collect the higher number simply by buying the property.",
      example:
        "Ten units at $1,000 a month have $120,000 annual market GPR. If eight leases pay $950 and the other two are at market, annual loss to lease is 8 × $50 × 12 = $4,800. Scheduled rent is $115,200 before collection losses.",
      desk: "Tie the rent basis, unit count, rent-roll date and period to the projection. River North’s 180 versus 200 units changes GPR even with identical rents; no project rent is supplied.",
      trap: "Subtracting loss to lease again when the starting figure already uses contract rents. Ask “market or in-place?” before building the bridge.",
      deeper:
        "If a lease is above market, the sign may reverse. Recognizing a positive mark-to-market opportunity requires renewal assumptions, not just a subtraction. Check lease expirations and the cost of turning units.",
      terms: [
        [
          "GPR",
          "Gross potential rent; full-occupancy rent at the specified rent basis.",
        ],
        [
          "Loss to lease",
          "Difference between market potential and lower contractual rents, not vacancy.",
        ],
      ],
      refs: [],
      apply: [
        "A River North model starts with contracted rents. Should it also subtract the entire market-to-contract gap?",
        "No; that would deduct the gap twice.",
        "Yes; loss to lease is always a separate deduction.",
        "Only for occupied apartments above the first floor.",
        "Reconcile the starting convention before applying adjustments.",
      ],
      pitch: [
        "Why distinguish a market projection from a signed lease?",
        "Market rent describes a possible future. I underwrite the path from signed rents to that assumption, including when leases can actually reset.",
      ],
    },
    {
      id: "egi",
      title: "Bridge potential rent to effective income",
      concept: "Effective gross income",
      definition:
        "Effective gross income (EGI) is expected operating revenue after rent losses, plus collectible other income. Vacancy is unoccupied time; concessions are discounts such as a free month. Bad debt is billed rent not collected.",
      why: "A building can be physically occupied and still miss its revenue target. A free month, unpaid rent and an empty unit all reduce cash, for different reasons.",
      example:
        "Start with $120,000 potential rent. Subtract $4,800 loss to lease, $6,000 vacancy and $1,200 concessions. Add $3,000 parking income: EGI = $111,000. This example assumes no other losses.",
      desk: "A model comparison should show which losses and other-income lines are included, not merely compare two totals with different labels or periods.",
      trap: "Treating a security deposit as recurring other income, or deducting free rent both in effective lease rents and again as a concession.",
      deeper:
        "Physical vacancy counts empty homes; economic vacancy measures revenue shortfall under the stated convention. Ask whether a combined loss assumption already includes collection losses and concessions. Parking, laundry and storage need collection evidence too.",
      terms: [
        [
          "EGI",
          "Effective gross income; revenue after rent losses plus collectible other operating income.",
        ],
        [
          "Vacancy",
          "Unoccupied capacity or associated rent loss; distinguish physical and economic measures.",
        ],
        ["Concession", "A rent incentive, such as a free month."],
      ],
      refs: [],
      apply: [
        "The rent assumption is already net of a free month. What do you do with a second concession line?",
        "Reconcile it; do not deduct the same free month twice.",
        "Add the second deduction automatically.",
        "Treat the free month as an operating expense as well.",
        "Make each reduction once, on the same period and rent basis.",
      ],
      pitch: [
        "Why can a full building have disappointing collections?",
        "Occupancy tells me whether homes are leased. I still need the contractual rents, incentives and collections to know how much income those leases deliver.",
      ],
    },
    {
      id: "opex",
      title: "Underwrite the cost of staying open",
      concept: "Operating expenses",
      definition:
        "Operating expenses are recurring costs of running the property, such as property taxes, insurance, repairs, utilities and management fees. An expense ratio here is operating expenses divided by effective gross income.",
      why: "Expenses do not all fall when vacancy rises. Insurance renewals, assessed taxes and payroll can change independently of rent.",
      example:
        "At $111,000 effective gross income and $44,400 operating expense, the expense ratio is 40%. An illustrative management fee of 4% of that income is $4,440. If it is in the $44,400, do not add it again.",
      desk: "Keep assumptions separate from tax bills, insurance quotes and management contracts. County assessed value alone is not the next owner’s property tax expense.",
      trap: "Using an expense ratio from another property as though it were a complete, current operating budget.",
      deeper:
        "Read the fee base in the management agreement: collected revenue and scheduled revenue can differ. For taxes, verify the parcel and bill with the county; for insurance use coverage, deductibles and renewal terms. Separate recurring repairs from large capital replacements.",
      terms: [
        [
          "Operating expense",
          "Recurring cost to operate the asset; not principal repayment or construction cost.",
        ],
        [
          "Expense ratio",
          "Operating expenses divided by the specified revenue measure, here EGI.",
        ],
        [
          "Management fee",
          "Payment for managing operations; confirm the percentage or flat fee and its base.",
        ],
      ],
      refs: ["county"],
      apply: [
        "Can you forecast River North insurance solely from the statewide parcel layer?",
        "No; request a dated quote or policy for the actual scope.",
        "Yes; insurance equals assessed value.",
        "Yes; a zoning class sets the premium.",
        "The correct evidence for a cost is specific to the service and property.",
      ],
      pitch: [
        "Why not use a flat 40% expense ratio on every site?",
        "A ratio is a screening shortcut. Before underwriting I rebuild taxes, insurance, fees and other major costs from evidence for the actual property.",
      ],
    },
    {
      id: "noi",
      title: "Stop before financing",
      concept: "Net operating income",
      definition:
        "Net operating income (NOI) is effective gross income minus property operating expenses for the same period. It measures property operations before debt service, income tax, depreciation and major capital spending.",
      why: "NOI feeds valuation and loan sizing. Two documents can use the same label while one describes today’s operations and the other a future stabilized year.",
      example:
        "$111,000 effective gross income − $44,400 expenses = $66,600 annual NOI. In this before-reserves convention, a $5,000 replacement reserve leaves $61,600 before debt; it does not change the stated $66,600 NOI.",
      desk: "River North’s summary says $2.6 million NOI and the model says $2.5 million. The $100,000 difference is a flag, not evidence either author is wrong. Ask for periods, occupancy and reserve treatment.",
      trap: "Calling NOI “cash to equity.” Loan payments, capital work and reserves can still consume it.",
      deeper:
        "Replacement reserves set money aside for future major work. Lenders may deduct a reserve in their underwritten net cash flow. Reconcile the lender’s definition to the sponsor’s before calculating coverage or applying a cap rate. Stabilized means a specified sustainable operating state, not automatically year one.",
      terms: [
        [
          "NOI",
          "Net operating income; effective gross income less property operating expenses.",
        ],
        [
          "Replacement reserve",
          "Funds set aside for future replacements; state where deducted.",
        ],
        [
          "Stabilized",
          "An assumed sustainable operating level after lease-up or disruption, not necessarily present performance.",
        ],
      ],
      refs: [],
      apply: [
        "Which comparison is valid before picking a River North NOI?",
        "Reconcile period, actual versus projected income, expenses and reserves.",
        "Always use $2.6 million because higher income is safer.",
        "Average the figures and call it an actual.",
        "The difference may be scope or timing, not a math error.",
      ],
      pitch: [
        "Why not call $2.5 million the owner’s take-home cash?",
        "NOI stops at operations. To reach an equity distribution I still need financing, capital spending, reserves and the distribution terms.",
      ],
    },
  ],
};
