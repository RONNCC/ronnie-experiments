export default {
  id: "D",
  title: "Read the returns and debt",
  topic: "Returns & debt",
  intro:
    "Every ratio answers a particular question. Start with its numerator, name its denominator and say whose risk it measures.",
  lessons: [
    {
      id: "cap",
      title: "Translate income into a price",
      concept: "Capitalization rate",
      definition:
        "A capitalization rate (cap rate) is annual net operating income (NOI) divided by property value or price on a consistent income basis. Reversing the equation gives an indicated value: NOI divided by a market-supported cap rate.",
      why: "A buyer is purchasing an income stream. The cap rate relates that income to a price before financing; it is not a mortgage rate or the investor’s total return.",
      example:
        "$100,000 annual NOI ÷ $2 million price = 5%. At the same income, a 6% market cap indicates about $1.67 million in value. A higher required yield implies a lower price, all else equal.",
      desk: "River North’s $50 million model figure is project cost. No market value or purchase price for the completed property is supplied. Do not call $2.5 million ÷ $50 million a market cap rate.",
      trap: "Picking a cap rate because it makes the deal work. Ask for relevant sales, timing, asset quality and the income convention behind the comparables.",
      deeper:
        "Holding a hypothetical 5% cap rate fixed, a $100,000 change in annual NOI moves indicated value by $2 million. This sensitivity is not an appraisal. A trailing cap rate and a forward cap rate have different numerators; label which you use.",
      terms: [
        [
          "Cap rate",
          "Capitalization rate; annual NOI divided by price or value.",
        ],
        [
          "Indicated value",
          "NOI divided by an assumed market cap rate; an estimate, not a certified appraisal.",
        ],
      ],
      refs: [],
      apply: [
        "Can the River North model’s cost stand in for market value to report a market cap rate?",
        "No; a cost denominator answers a different question.",
        "Yes; cost always equals value at completion.",
        "Yes; the unit count cancels out.",
        "Market value needs independent support; cost measures what you spend.",
      ],
      pitch: [
        "Why leave a cap rate blank even with cost and NOI in the file?",
        "A cap rate needs a price or value on a matching income basis. I can compute a return on cost without pretending I know the property’s market price.",
      ],
    },
    {
      id: "yield",
      title: "Compare the yield you build with the yield you buy",
      concept: "Yield on cost",
      definition:
        "Development yield on cost (YOC) is stabilized annual net operating income divided by total development cost. Development spread is that yield minus a comparable market capitalization rate, using compatible income conventions.",
      why: "A developer takes construction and lease-up risk to create an asset rather than buy one already operating. The spread is a first test of compensation for that risk, not a guaranteed profit margin.",
      example:
        "$600,000 stabilized NOI ÷ $10 million total cost = 6%. Against a hypothetical 5% market cap rate, the spread is 1 percentage point, or 100 basis points. It is not a 1% cash distribution.",
      desk: "If each River North NOI is stabilized annual income and each cost is all-in, the summary implies $2.6m ÷ $47.3m ≈ 5.50%; the model implies $2.5m ÷ $50m = 5.00%. The implied yields differ by about 50 basis points. Market spread is unknown.",
      trap: "Pairing the higher NOI from one document with the lower or newer cost from another without a reconciled scope.",
      deeper:
        "A spread can disappear through a cost overrun, slower lease-up or a higher market exit cap rate. Test each input separately, then together. The implied River North yields compare packages; they do not prove which package is later, approved or financeable.",
      terms: [
        [
          "YOC",
          "Yield on cost; stabilized annual NOI divided by total development cost.",
        ],
        [
          "Development spread",
          "Yield on cost less a supported comparable market cap rate.",
        ],
        [
          "Basis point",
          "One hundredth of a percentage point; 100 basis points = 1 percentage point.",
        ],
      ],
      refs: [],
      apply: [
        "What can you compute from the two supplied River North packages if bases align?",
        "Two document-specific yields on cost, but no market development spread yet.",
        "A verified market cap rate.",
        "The investor’s internal rate of return.",
        "Neither a market cap nor timed equity cash flows are provided.",
      ],
      pitch: [
        "Why compare whole document packages?",
        "Each yield should match income to the cost of producing that income. Mixing assumptions can create a return that neither source actually supports.",
      ],
    },
    {
      id: "coverage",
      title: "Ask whether income covers the payment",
      concept: "Debt service coverage ratio",
      definition:
        "Debt service coverage ratio (DSCR) divides underwritten annual income available for debt service by annual debt service. Debt service is required interest plus scheduled principal. Use the lender’s income definition.",
      why: "A lender wants a cushion against lower rents or higher expenses. If the numerator falls or payments rise, coverage shrinks even when the original loan balance is unchanged.",
      example:
        "$300,000 annual income ÷ $240,000 annual debt service = 1.25×. A 10% income drop gives $270,000 ÷ $240,000 = 1.125×. At 1.0× all of that income is needed for scheduled debt payments.",
      desk: "The River North figures contain no debt service. As a sensitivity only, $2.5m of eligible annual income at an assumed 1.25× target supports up to $2m annual debt service, not $2m of principal.",
      trap: "Testing interest-only coverage for a loan that later amortizes. An interest-only period pays no scheduled principal; an amortizing payment includes principal as well as interest.",
      deeper:
        "For a hypothetical $1 million interest-only balance at 6% for a full year, interest is $60,000. When principal repayment begins, use the actual payment schedule. To convert maximum annual payment into principal, you need rate, amortization and any interest-only period. [VERIFY] Read the actual lender term sheet, not an assumed agency minimum.",
      terms: [
        [
          "DSCR",
          "Debt service coverage ratio; income available for debt divided by required debt service for the same period.",
        ],
        [
          "Interest-only",
          "Scheduled payments cover interest but do not amortize principal during the stated period.",
        ],
        [
          "Amortizing",
          "Payments repay scheduled principal as well as interest.",
        ],
      ],
      refs: ["fannie", "freddie"],
      apply: [
        "The River North model has NOI but no loan schedule. What belongs in the actual DSCR field?",
        "Missing until the underwritten income definition and debt service are known.",
        "1.25× because that is a common teaching example.",
        "NOI divided by total project cost.",
        "A coverage target is not an observed ratio. The denominator is required.",
      ],
      pitch: [
        "Why not size a loan from an attractive NOI alone?",
        "I need to know the payments that income must cover and how the lender adjusts income. An interest-only year can hide a later amortizing shortfall.",
      ],
    },
    {
      id: "leverage",
      title: "Test the loan against three different bases",
      concept: "Collateral, cost and debt yield",
      definition:
        "Loan-to-value (LTV) is loan balance divided by supported property value. Loan-to-cost (LTC) is loan divided by eligible project cost. Debt yield is underwritten annual NOI divided by loan balance; unlike DSCR it has no payment in its denominator.",
      why: "A lender can apply multiple constraints. A strong appraisal does not fix inadequate cash flow, and a large construction budget does not guarantee a large loan.",
      example:
        "A $6m loan on $10m cost and $12m value has 60% LTC and 50% LTV. With $600,000 NOI, debt yield is 10%. An interest-rate change can alter coverage without changing that debt yield.",
      desk: "Show a metric only with its matching inputs. River North has cost but no approved loan amount or appraisal in the brief. Missing LTV, LTC and debt yield should not display as zero.",
      trap: "Treating total budget, lender-eligible cost and appraised value as interchangeable.",
      deeper:
        "For an illustration, a 60% LTC limit on $10m supports $6m; a 50% LTV limit on $11m supports $5.5m. If both apply, the smaller $5.5m ceiling binds before any coverage or debt-yield limit. Match as-is or stabilized value to the term sheet.",
      terms: [
        ["LTV", "Loan-to-value; loan divided by matching property value."],
        ["LTC", "Loan-to-cost; loan divided by lender-eligible project cost."],
        ["Debt yield", "Underwritten annual NOI divided by loan balance."],
      ],
      refs: [],
      apply: [
        "You have only cost and NOI for River North. What additional input is necessary even to estimate LTC?",
        "A proposed loan amount and a definition of eligible cost.",
        "Only a market cap rate.",
        "Only a count of apartments.",
        "LTC measures debt funding relative to cost, not profit or density.",
      ],
      pitch: [
        "Why show LTC and coverage instead of picking one?",
        "LTC measures how much of the cost the lender funds. Coverage asks whether operations can pay the bill; either test can constrain proceeds.",
      ],
    },
    {
      id: "irr",
      title: "Separate how much from how fast",
      concept: "Equity multiple versus internal rate of return",
      definition:
        "Equity multiple is total cash returned to equity, including returned capital, divided by equity contributed. Internal rate of return (IRR) is the discount rate at which dated net cash flows have zero net present value.",
      why: "A multiple ignores time. IRR is sensitive to timing, including early distributions and a projected sale. Levered returns include borrowing, loan payments and repayment in the equity cash flows; unlevered returns measure the asset before financing.",
      example:
        "Invest $100 now and receive $150 once. The multiple is 1.5× whether the exit is in one year or three. Annual IRR is 50% in one year, but about 14.47% over three years since 1.1447³ ≈ 1.5.",
      desk: "A unit count, cost and one NOI cannot determine River North’s IRR. Request dates and amounts of contributions, operating cash flows, sale proceeds, costs and debt repayment.",
      trap: "Calling $150 a $150 profit after investing $100, or labeling a levered equity return as an unlevered building return.",
      deeper:
        "Dates matter for irregularly spaced flows. With repeated changes of sign, an IRR may not be unique or meaningful. Check the actual cash-flow schedule, multiple and downside case rather than ranking every deal on one headline IRR.",
      terms: [
        [
          "IRR",
          "Internal rate of return; discount rate making net present value zero for the cash-flow schedule.",
        ],
        [
          "Equity multiple",
          "Total cash returned divided by total equity contributed, without time weighting.",
        ],
        ["Levered return", "Equity return after financing flows."],
        ["Unlevered return", "Asset return without financing flows."],
      ],
      refs: [],
      apply: [
        "Can 200 units, $50m cost and $2.5m NOI establish an equity IRR?",
        "No; you need dated equity cash flows including exit and debt effects.",
        "Yes; divide NOI by cost.",
        "Yes; divide cost by unit count.",
        "A single annual operating figure does not encode capital timing or the exit.",
      ],
      pitch: [
        "Why show both a multiple and an IRR?",
        "The multiple tells me how many dollars come back per dollar invested. IRR tells me how timing changes the annualized result; neither makes a projected exit certain.",
      ],
    },
    {
      id: "cash",
      title: "Measure the cash distributed this year",
      concept: "Cash-on-cash return",
      definition:
        "Cash-on-cash return compares a defined period’s distributable cash to the cash equity base. For a simple annual operating measure, exclude sale proceeds and state whether the denominator is initial or outstanding cash equity.",
      why: "A project can have a high projected sale return but little income available to distribute while it is being built or leased.",
      example:
        "$80,000 annual cash after debt and reserves ÷ $1m initial cash equity = 8% cash-on-cash under that convention. It says nothing by itself about the eventual sale price.",
      desk: "Ask for debt service, reserves, distribution availability and equity contributions. Do not relabel River North NOI as cash distributed to investors.",
      trap: "Using NOI in the numerator while calling the result an after-debt cash yield.",
      deeper:
        "Clarify whether the sponsor reports cash available or cash actually distributed. During construction the two can differ or both be zero. A refinance distribution is not recurring operating income; report its source separately.",
      terms: [
        [
          "Cash-on-cash",
          "Period cash return divided by the stated cash equity base.",
        ],
        [
          "Distribution",
          "Cash paid to investors; distinguish operating, refinance and sale proceeds.",
        ],
      ],
      refs: [],
      apply: [
        "A model labels annual NOI divided by equity “cash-on-cash.” What do you check first?",
        "Whether the numerator actually accounts for debt service, reserves and other cash uses.",
        "Whether NOI is written in bold.",
        "Whether the property lies in an OZ.",
        "Cash available to equity comes after items that NOI excludes.",
      ],
      pitch: [
        "Why can a profitable building pay no cash this year?",
        "Operating income may go to debt, replacements or required reserves. I trace cash through those obligations before calling it a distribution.",
      ],
    },
    {
      id: "waterfall",
      title: "Read who gets the next dollar",
      concept: "Distribution waterfall",
      definition:
        "A waterfall allocates available distributions in contractual tiers. A preferred return gives a recipient priority on specified terms; a promote gives a sponsor a disproportionate share after negotiated hurdles. Neither is a guaranteed payment.",
      why: "The building can perform exactly as projected while different investors earn different returns. Allocation terms, not just property NOI, determine their results.",
      example:
        "In a simplified annual income split, $100 of equity has an 8% current preference. Of $20 available, $8 goes to the preference. If the remaining $12 splits 75/25 between investor and sponsor, they receive another $9 and $3. Total distributed is still $20.",
      desk: "A property model without partnership terms cannot establish investor-specific returns. Keep an illustrative split separate from documented terms; none are supplied for River North.",
      trap: "“Preferred means guaranteed 8% interest.” A preference on available distributions is not necessarily debt or a guarantee.",
      deeper:
        "The example assumes no arrears, catch-up or capital-return tier. Read the operating agreement for accrual, compounding, return of capital, hurdles, catch-up and residual splits. Test the waterfall with too little cash as well as a windfall.",
      terms: [
        [
          "Preferred return",
          "Contractual priority in distributions under specified terms.",
        ],
        [
          "Waterfall",
          "Ordered rules allocating available cash to investors and sponsor.",
        ],
        [
          "Promote",
          "Sponsor’s disproportionate participation after specified thresholds.",
        ],
      ],
      refs: [],
      apply: [
        "Which document controls whether a River North preference accrues when unpaid?",
        "The executed governing agreement and applicable amendments.",
        "The parcel map.",
        "A generic template with an 8% example.",
        "Economic rights are negotiated; a teaching example cannot fill in missing contract terms.",
      ],
      pitch: [
        "Why separate project returns from investor returns?",
        "The asset generates a pool of cash. Debt and the partnership waterfall determine which investor receives it and when.",
      ],
    },
  ],
};
