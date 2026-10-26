export default [
  {
    "id": "private-credit-1",
    "title": "Credit Analysis",
    "track": "Private Credit",
    "explanation": "Credit analysis starts with a repayment question: what cash can the borrower generate, when is it due, and what protection exists if the operating case weakens? The lender studies the business model, customer and supplier concentration, competitive position, management, cyclicality, and access to liquidity. Historical statements reveal cash conversion and volatility; forecasts translate commercial assumptions into earnings, working capital, capex, taxes, interest, and debt repayment. EBITDA is a starting point, not cash available for debt service. Add-backs must be supported, recurring investment cannot be ignored, and cash held in restricted subsidiaries may not be available to repay the loan.\n\nA credit view connects repayment capacity to structure. Examine total and senior leverage, interest and fixed-charge coverage, maturity walls, collateral, guarantees, covenant headroom, and intercreditor priority. Stress revenue, margins, collections, rates, and refinancing assumptions together rather than applying an arbitrary haircut. Then ask how much liquidity remains and what the lender recovers if the borrower defaults. Sponsor quality or asset value can help, but neither substitutes for a credible path to repayment. Definitions of adjusted EBITDA, debt, and coverage are often negotiated in loan documents, so a ratio should always carry its definition. The memo should explain the key risk, the evidence supporting the base case, and the point at which the lender would no longer be comfortable.",
    "framework": "Underwriting chain: business durability → earnings quality → cash conversion → debt service and liquidity → structure/documentation → downside recovery. Cash available before financing ≈ EBITDA − cash taxes − capex − increase in operating NWC; lender definitions can differ.",
    "example": {
      "assumptions": "One-year illustration in $ millions; EBITDA $40; maintenance capex $5; cash taxes $4; increase in working capital $3; cash interest $10; no other cash uses.",
      "steps": [
        "1. Start with EBITDA of $40m and subtract $5m maintenance capex, leaving $35m.",
        "2. Subtract $4m cash taxes and $3m working-capital investment: pre-interest cash available is $28m.",
        "3. Subtract $10m cash interest: cash after interest and operating investment is $18m for scheduled principal, optional paydown, or liquidity.",
        "4. If scheduled principal is $6m, residual cash is $12m; this single-year bridge does not establish that refinancing or future repayment is assured."
      ],
      "checks": [
        {
          "label": "after capex",
          "a": 40,
          "op": "-",
          "b": 5,
          "result": 35
        },
        {
          "label": "before interest",
          "a": 35,
          "op": "-",
          "b": 4,
          "result": 31
        },
        {
          "label": "after working-capital use",
          "a": 31,
          "op": "-",
          "b": 3,
          "result": 28
        },
        {
          "label": "after interest and scheduled principal",
          "a": 28,
          "op": "-",
          "b": 10,
          "result": 18
        }
      ]
    },
    "questions": [
      {
        "q": "How do you decide whether a borrower can support a proposed loan?",
        "a": "I start with the source and timing of repayment rather than a headline EBITDA multiple. I examine the durability of revenue, customer concentration, margin variability, management and sponsor support, then reconcile reported earnings to cash after taxes, maintenance capex, and working capital. I assess interest and principal under base and downside cases, maturity and refinancing needs, liquidity, and covenant headroom. Finally, I evaluate collateral, guarantees, documentation, and recovery if cash flow fails. The conclusion should state the assumptions that matter and the evidence that would invalidate the credit thesis.",
        "mistake": "Treating sponsor reputation or adjusted EBITDA as a substitute for sustainable cash repayment."
      },
      {
        "q": "What would you investigate if EBITDA is growing but cash flow is deteriorating?",
        "a": "I would trace the EBITDA-to-cash bridge period by period. Receivables may be growing faster than sales because collections are slowing; inventory may be accumulating; suppliers may be paid earlier; capex, taxes, or cash interest may have risen. I would separate growth investment from maintenance spending and test whether claimed EBITDA adjustments are recurring. I would also inspect billing disputes, customer concentration, and cash restrictions. The key is to identify whether the gap is temporary timing, structurally weaker conversion, or a sign that reported earnings do not represent debt-service capacity.",
        "mistake": "Assuming cash conversion will normalize without testing collections, inventory, or required investment."
      },
      {
        "q": "Which downside case belongs in a credit memo?",
        "a": "I would construct a scenario tied to the borrower's actual risk drivers: for example, lost volume at a major customer, lower pricing, margin compression, delayed collections, and a higher refinancing rate. I would carry those changes through EBITDA, working capital, liquidity, interest coverage, and debt repayment, rather than apply one unsupported percentage to enterprise value. The scenario should show when a covenant or liquidity limit is reached, what mitigants are available, and what collateral could recover. The case is a stress test, not a prediction or guarantee of loss.",
        "mistake": "Stress-testing EBITDA alone while leaving liquidity, interest, and maturity assumptions unchanged."
      }
    ],
    "selfCheck": {
      "question": "Under the stated assumptions, how much cash remains after interest and $6m scheduled principal?",
      "answer": "Pre-interest cash available is $28m; after $10m interest, $18m remains. After $6m principal, $12m is left."
    }
  },
  {
    "id": "private-credit-2",
    "title": "Cash Flow Modeling",
    "track": "Private Credit",
    "explanation": "A credit cash-flow model converts a forecast income statement into cash available for debt service and ending liquidity. Begin with revenue drivers—volume, price, utilization, recurring contracts, or customer cohorts—and derive gross profit and EBITDA. Continue through cash taxes, capital expenditure, and changes in operating working capital. Distinguish maintenance capex required to sustain the business from discretionary growth investment, but do not assume all spending can be stopped without harming future revenue. Working capital is a timing issue: receivables and inventory generally consume cash when they rise, while operating payables generally supply it. Seasonal borrowers need monthly or quarterly schedules because an annual total can conceal a cash trough.\n\nModel the financing waterfall separately: cash interest by debt tranche, scheduled amortization, optional repayments or cash sweep, revolver use, and minimum liquidity. Interest may depend on average balances and floating rates; fees, floors, and hedges can alter cash cost. Build base, downside, and recovery cases with linked assumptions and identify the period when liquidity or covenant headroom becomes constrained. The model should reconcile opening cash to ending cash and distinguish restricted from available cash. Loan-agreement definitions may permit particular add-backs or exclude some uses, but contractual EBITDA is not identical to cash generated. A lender should be able to explain the worst cash period, not only the year-end leverage ratio.",
    "framework": "Operating cash before financing ≈ EBITDA − cash taxes − capex − ΔNWC. Cash after debt service = opening cash + operating cash − cash interest − scheduled principal − other financing uses; ending liquidity must be tested by period.",
    "example": {
      "assumptions": "Quarterly forecast in $ millions; opening cash $12; EBITDA $9; cash taxes $1; capex $2; NWC increase $1.5; cash interest $1.25; scheduled principal $0.75; no other flows.",
      "steps": [
        "1. Cash before financing = EBITDA 9 − taxes 1 − capex 2 − NWC use 1.5 = $4.5m.",
        "2. Cash after interest = $4.5m − $1.25m = $3.25m.",
        "3. Cash after scheduled principal = $3.25m − $0.75m = $2.5m quarterly cash generation.",
        "4. Ending cash = opening $12m + $2.5m = $14.5m; compare that amount with minimum operating liquidity, not merely the year-end forecast."
      ],
      "checks": [
        {
          "label": "cash before financing",
          "a": 9,
          "op": "-",
          "b": 1,
          "result": 8
        },
        {
          "label": "after capex",
          "a": 8,
          "op": "-",
          "b": 2,
          "result": 6
        },
        {
          "label": "after NWC",
          "a": 6,
          "op": "-",
          "b": 1.5,
          "result": 4.5
        },
        {
          "label": "ending cash after all debt service",
          "a": 12,
          "op": "+",
          "b": 2.5,
          "result": 14.5
        },
        {
          "label": "cash after interest",
          "a": 4.5,
          "op": "-",
          "b": 1.25,
          "result": 3.25
        },
        {
          "label": "cash after scheduled principal",
          "a": 3.25,
          "op": "-",
          "b": 0.75,
          "result": 2.5
        }
      ]
    },
    "questions": [
      {
        "q": "How do you build a cash flow model for a leveraged borrower?",
        "a": "I build operating drivers first, forecast revenue and margins, and convert EBITDA to cash by deducting cash taxes, capex, and working-capital investment. I forecast the seasonal profile rather than only annual totals, then layer in cash interest by tranche, mandatory amortization, optional cash sweep, revolver activity, and minimum cash. Each period rolls beginning cash to ending available liquidity. I run base and downside cases that connect operating shocks to covenant capacity and maturity repayment. I also reconcile model definitions to the credit agreement while keeping contractual EBITDA separate from actual cash generation.",
        "mistake": "Using annual EBITDA less interest as a cash-flow forecast and ignoring capex and working capital."
      },
      {
        "q": "Why model a borrower's cash balance monthly or quarterly rather than annually?",
        "a": "An annual forecast can show positive cash generation even if the company faces a severe interim cash trough. Seasonal inventory builds, customer collection patterns, payroll, taxes, and debt payments occur at different times. A period model reveals peak revolver usage, minimum liquidity breaches, and whether a maturity or covenant test falls before receipts arrive. I would match granularity to the business cycle and data quality, then reconcile the period schedule to annual financial statements. More detail is useful only when assumptions are supportable and the cash timing affects the lending decision.",
        "mistake": "Assuming positive year-end cash means the company can meet every payment during the year."
      },
      {
        "q": "How do you treat working capital in a downside case?",
        "a": "I tie receivables, inventory, and payables to operational drivers such as sales, days outstanding, production requirements, and supplier terms. In a downturn, receivables may age, inventory may become obsolete, or suppliers may tighten terms; working capital can consume cash even while revenue falls. I would test both the level and timing of those balances and check whether the borrower can release cash without damaging the business. The cash-flow model should reflect operating behavior, not an arbitrary constant percentage of EBITDA.",
        "mistake": "Assuming working capital releases cash automatically when sales decline."
      }
    ],
    "selfCheck": {
      "question": "What is the quarterly ending cash in the example, and why is the $2.5m cash generation not the ending balance?",
      "answer": "Ending cash is $14.5m: opening cash of $12m plus $2.5m net quarterly cash generation. The $2.5m is the increase, not the total balance."
    }
  },
  {
    "id": "private-credit-3",
    "title": "Leverage & Coverage Ratios",
    "track": "Private Credit",
    "explanation": "Leverage and coverage ratios compress a borrower's debt burden and payment capacity into comparable measures, but a ratio is only meaningful after its numerator, denominator, and period are defined. Gross leverage commonly divides total debt by EBITDA; net leverage subtracts eligible cash before dividing, although loan agreements may restrict how much cash counts. Interest coverage can use EBITDA or EBIT divided by cash interest, while fixed-charge coverage may include scheduled principal, rent, or other obligations. Each measure answers a different question: leverage gauges debt relative to earnings, while coverage tests recurring payment capacity.\n\nCalculate ratios on a consistent basis, reconcile adjusted EBITDA to reported figures, and identify whether debt includes leases, letters of credit, or other debt-like items. Use cash interest rather than accrued interest when testing cash burden, and consider floating-rate exposure. A company with modest leverage can still be vulnerable if it has weak coverage, lumpy maturities, or volatile earnings; high coverage in a peak year may not survive a downturn. Ratios are not universal credit cutoffs. Compare them with business stability, collateral, documentation, and the specific facility. In an interview, state definitions aloud, calculate carefully, and explain the direction of change when EBITDA, cash, debt, or rates move. Covenant definitions can materially differ from accounting ratios, so do not assume a presented leverage figure is the agreement's tested leverage.",
    "framework": "Gross leverage = total debt ÷ EBITDA. Net leverage = (total debt − eligible cash) ÷ EBITDA. EBITDA interest coverage = EBITDA ÷ cash interest. A ratio's definition, testing date, add-backs, and eligible cash are agreement-specific.",
    "example": {
      "assumptions": "Borrower has total debt $120m, unrestricted cash $20m, EBITDA $25m, and annual cash interest $10m; ignore other debt-like claims.",
      "steps": [
        "1. Gross leverage = $120m debt ÷ $25m EBITDA = 4.8x.",
        "2. Net debt = $120m − $20m eligible cash = $100m.",
        "3. Net leverage = $100m ÷ $25m = 4.0x; the cash offset assumes the lender permits all $20m.",
        "4. EBITDA interest coverage = $25m ÷ $10m = 2.5x; a 20% EBITDA decline to $20m would reduce coverage to 2.0x at unchanged interest."
      ],
      "checks": [
        {
          "label": "gross leverage",
          "a": 120,
          "op": "/",
          "b": 25,
          "result": 4.8
        },
        {
          "label": "net debt",
          "a": 120,
          "op": "-",
          "b": 20,
          "result": 100
        },
        {
          "label": "net leverage",
          "a": 100,
          "op": "/",
          "b": 25,
          "result": 4
        },
        {
          "label": "interest coverage",
          "a": 25,
          "op": "/",
          "b": 10,
          "result": 2.5
        },
        {
          "label": "stressed interest coverage",
          "a": 20,
          "op": "/",
          "b": 10,
          "result": 2
        }
      ]
    },
    "questions": [
      {
        "q": "Calculate gross leverage, net leverage, and EBITDA interest coverage for a borrower with $120m debt, $20m cash, $25m EBITDA, and $10m interest.",
        "a": "Gross leverage is $120m divided by $25m, or 4.8x. If all $20m cash qualifies as unrestricted and eligible, net debt is $100m and net leverage is 4.0x. EBITDA divided by $10m cash interest gives 2.5x interest coverage. I would state that these are simple credit ratios, then reconcile debt, permitted cash, EBITDA add-backs, and interest to the specific agreement. A lender may calculate covenant ratios differently, and cash may be trapped or unavailable for repayment. I would show the underlying calculation alongside any agreement-defined result.",
        "mistake": "Subtracting all reported cash from debt without checking whether it is unrestricted or covenant-eligible."
      },
      {
        "q": "Which is more informative: leverage or interest coverage?",
        "a": "Neither dominates because they measure distinct vulnerabilities. Leverage relates debt to an earnings proxy and helps frame deleveraging and recovery risk. Interest coverage indicates the earnings buffer over cash interest, but it omits principal amortization, capex, taxes, and working capital unless the chosen fixed-charge definition includes them. Floating-rate debt can weaken coverage quickly even if leverage is unchanged. I would examine both with liquidity, maturity, and downside cash-flow analysis, using definitions aligned with the lender's documents and the borrower's actual payment profile.",
        "mistake": "Using a strong interest-coverage ratio to dismiss a large maturity or mandatory principal burden."
      },
      {
        "q": "How does a 20% EBITDA decline affect leverage and coverage in the example?",
        "a": "At unchanged debt and cash, EBITDA falls from $25m to $20m. Gross leverage becomes 6.0x because $120m divided by $20m equals 6.0x; net leverage becomes 5.0x on $100m net debt. EBITDA interest coverage falls from 2.5x to 2.0x if cash interest remains $10m. In practice, a downturn can also raise borrowing costs, reduce eligible cash, and consume liquidity, so the combined stress could be worse than these isolated ratio calculations suggest. I would also test the resulting covenant test and minimum cash balance.",
        "mistake": "Changing EBITDA in the denominator but leaving out correlated deterioration in cash, debt, or interest."
      }
    ],
    "selfCheck": {
      "question": "If only $10m of the borrower's $20m cash is covenant-eligible, what is net leverage?",
      "answer": "Eligible net debt is $120m − $10m = $110m; net leverage is $110m/$25m = 4.4x."
    }
  },
  {
    "id": "private-credit-4",
    "title": "Capital Structure",
    "track": "Private Credit",
    "explanation": "Capital structure analysis maps every claim against the borrower and determines which creditor has priority to cash, collateral, and enterprise value. A typical stack may contain revolving credit, first-lien term debt, second-lien debt, unsecured notes, preferred equity, and common equity. Rank cannot be inferred from labels alone: lien scope, guarantees, structural subordination, intercreditor agreements, and jurisdiction affect practical priority. A lender should identify each instrument's principal, interest, maturity, amortization, collateral, guarantors, covenants, and voting rights, then map which entities own assets and owe obligations.\n\nThe stack matters in both ordinary operations and restructuring. Senior debt may have first claim on pledged assets, while structurally subordinated debt sits behind creditors at operating subsidiaries. Enterprise value in a downside case is distributed through contractual priority after costs; junior claims may recover only after senior obligations are satisfied. A layered debt structure can also create maturity or refinancing pressure even when current interest is manageable. Compare total leverage with debt by priority and calculate recovery under multiple enterprise-value cases. Do not infer that collateral value equals recovery: enforcement costs, time, valuation uncertainty, and competing claims reduce proceeds. Capital structures and legal priority vary by documentation and jurisdiction; a simplified waterfall is an analytical tool, not a legal opinion.",
    "framework": "Map borrower entities and collateral first, then rank claims by contractual and structural priority. For a simple waterfall, distribute net realizable value to senior claims first; only residual proceeds reach junior debt and equity.",
    "example": {
      "assumptions": "Illustrative recovery waterfall, no costs or other claims; realizable enterprise value $150m; first-lien debt $100m; second-lien debt $70m.",
      "steps": [
        "1. First-lien claim is $100m, so it receives the first $100m of value.",
        "2. Residual value after first lien = $150m − $100m = $50m.",
        "3. Second lien receives the $50m residual against its $70m claim.",
        "4. Second-lien recovery rate = $50m ÷ $70m = 71.4%; first-lien recovery is 100%, before costs, timing, and legal disputes."
      ],
      "checks": [
        {
          "label": "residual after first lien",
          "a": 150,
          "op": "-",
          "b": 100,
          "result": 50
        },
        {
          "label": "second lien proceeds",
          "a": 150,
          "op": "-",
          "b": 100,
          "result": 50
        },
        {
          "label": "second lien recovery",
          "a": 50,
          "op": "/",
          "b": 70,
          "result": 0.7142857142857143
        },
        {
          "label": "first lien coverage",
          "a": 100,
          "op": "/",
          "b": 100,
          "result": 1
        },
        {
          "label": "senior claim paid in full",
          "a": 100,
          "op": "/",
          "b": 100,
          "result": 1
        }
      ]
    },
    "questions": [
      {
        "q": "How do you analyze where a proposed loan sits in a borrower's capital structure?",
        "a": "I map the legal borrower and guarantor entities, assets, collateral pledges, and all existing and proposed claims. For each instrument I record lien rank, principal, maturity, amortization, interest, guarantees, covenant package, and intercreditor terms. I check whether debt is structurally subordinated because it is owed by a parent without direct claims on operating-company assets. Then I model cash-flow burden and enterprise-value recovery by priority. Counsel should confirm legal enforceability; the credit analysis should not assume that a label such as first lien resolves every priority question.",
        "mistake": "Ranking claims from facility names alone without checking entities, collateral, and intercreditor language."
      },
      {
        "q": "What happens to second-lien recovery if enterprise value falls below the first-lien claim?",
        "a": "In a simplified waterfall, first-lien creditors consume all available value up to their allowed claim. If realizable value is below that claim, no residual reaches second lien, so its recovery can be zero even though it has a contractual lien on collateral. Actual outcomes may depend on collateral allocation, guarantees, costs, and legal proceedings. I would model several enterprise-value cases and account for time and expenses. The presence of a second lien gives priority over more junior claims; it does not ensure meaningful recovery.",
        "mistake": "Assuming a second lien guarantees a fixed recovery simply because it is secured."
      },
      {
        "q": "Why can two borrowers with the same total leverage present different lender risk?",
        "a": "The same debt-to-EBITDA ratio can hide different debt priority, maturity schedules, amortization, collateral, liquidity, and covenant protections. One borrower may have a large first-lien maturity soon; another may have amortizing debt and substantial cash. Structural subordination and asset location can also change recovery. Earnings volatility, cash conversion, and creditor coordination matter alongside the aggregate leverage figure. I would examine the full debt stack and legal entity chart, then test the order and timing of claims under both ongoing operations and distress.",
        "mistake": "Comparing headline leverage while overlooking maturity concentration and priority."
      }
    ],
    "selfCheck": {
      "question": "At $150m realizable value and $100m first-lien debt, how much reaches a $70m second lien before costs?",
      "answer": "The first lien receives $100m, leaving $50m. That yields $50m/$70m = 71.4% recovery for the second lien."
    }
  },
  {
    "id": "private-credit-5",
    "title": "Covenants",
    "track": "Private Credit",
    "explanation": "Covenants define borrower promises and lender protections between reporting dates. Affirmative covenants may require financial reporting, insurance, or compliance with specified obligations. Negative covenants can restrict additional debt, liens, asset sales, dividends, acquisitions, or changes in business. A maintenance covenant tests financial condition at scheduled intervals—often a leverage or coverage ratio—regardless of whether the borrower takes a particular action. An incurrence covenant applies when the borrower seeks to take a defined action, such as incur debt or make a restricted payment, and typically requires a ratio or other condition to be met.\n\nThe exact definitions matter: EBITDA add-backs, permitted debt, eligible cash, cure rights, testing periods, baskets, and exceptions are negotiated. Headroom can be expressed as the distance between actual and maximum permitted ratio, but that ratio cushion is not identical to dollar debt capacity if EBITDA or cash changes. A covenant breach may create a default or require a waiver, subject to cure and grace provisions in the agreement. Lenders monitor compliance certificates, budgets, liquidity, and early-warning indicators rather than waiting for a formal test. Covenants are one part of the risk package; pricing, collateral, maturity, and access to information also matter. Never describe a particular covenant as standard across all loans without checking the executed document.",
    "framework": "Maintenance test: actual defined ratio ≤ maximum permitted ratio on a test date. Ratio headroom = covenant limit − actual ratio. At fixed EBITDA, approximate debt headroom = ratio headroom × EBITDA, subject to the agreement's definitions and other constraints.",
    "example": {
      "assumptions": "Agreement maximum net leverage 5.0x; actual net debt $180m; defined EBITDA $40m; assume debt headroom is tested at constant EBITDA and all cash/debt is eligible.",
      "steps": [
        "1. Actual net leverage = $180m ÷ $40m = 4.5x.",
        "2. Ratio headroom = 5.0x limit − 4.5x actual = 0.5x.",
        "3. At fixed EBITDA, approximate net-debt capacity to the limit = 0.5 × $40m = $20m.",
        "4. If EBITDA falls to $36m while debt stays $180m, leverage becomes 5.0x and headroom is zero; definitions and cure provisions still control."
      ],
      "checks": [
        {
          "label": "actual leverage",
          "a": 180,
          "op": "/",
          "b": 40,
          "result": 4.5
        },
        {
          "label": "ratio headroom",
          "a": 5,
          "op": "-",
          "b": 4.5,
          "result": 0.5
        },
        {
          "label": "approximate debt headroom",
          "a": 0.5,
          "op": "*",
          "b": 40,
          "result": 20
        },
        {
          "label": "stressed leverage",
          "a": 180,
          "op": "/",
          "b": 36,
          "result": 5
        }
      ]
    },
    "questions": [
      {
        "q": "What is the difference between a maintenance covenant and an incurrence covenant?",
        "a": "A maintenance covenant requires the borrower to satisfy a financial test at specified dates, even if it has not taken a new action. An incurrence covenant restricts a particular action—such as borrowing more debt or paying a dividend—unless stated conditions are met at that time. Maintenance tests can provide an earlier warning and possible lender remedies; incurrence tests focus on incremental actions and may allow substantial deterioration until the borrower needs to act. The definitions, baskets, exceptions, and remedies are document-specific, so I would read the executed agreement rather than rely on market shorthand.",
        "mistake": "Assuming every leverage covenant is tested continuously or has the same remedy."
      },
      {
        "q": "How would you calculate and explain covenant headroom?",
        "a": "I first calculate the actual ratio exactly as the agreement defines debt, cash, EBITDA, period, and add-backs. If the maximum leverage is 5.0x and actual is 4.5x, ratio headroom is 0.5x. With $40m fixed EBITDA, that is roughly $20m of net-debt capacity, but only under the simplified assumption that EBITDA and eligible cash remain unchanged and no other covenant restriction binds. I would also stress EBITDA and liquidity, explain cure rights and test dates, and distinguish mathematical headroom from permission to incur debt.",
        "mistake": "Presenting ratio headroom as guaranteed borrowing capacity without checking baskets and other conditions."
      },
      {
        "q": "What should a lender do when a borrower is approaching a covenant limit?",
        "a": "I would verify the calculation and source information, then examine the drivers of deterioration and the next test date. I would update downside forecasts, liquidity, maturity, and collateral analysis; engage the borrower early through permitted channels; and assess options under the agreement, including permitted cures, waivers, amendments, or additional protections. Any negotiation should be based on current facts, documented approvals, and counsel's interpretation. The lender should avoid waiting for a technical breach if early indicators show repayment risk, while respecting contractual rights and confidentiality.",
        "mistake": "Waiting for a formal breach before assessing liquidity or considering a negotiated response."
      }
    ],
    "selfCheck": {
      "question": "At $180m net debt and $36m EBITDA, what is leverage against a 5.0x maximum?",
      "answer": "$180m/$36m = 5.0x, so there is no ratio headroom before considering any contractual cure."
    }
  },
  {
    "id": "private-credit-6",
    "title": "Loan Documentation",
    "track": "Private Credit",
    "explanation": "Loan documentation converts negotiated economics and protections into binding obligations. A term sheet summarizes major points, while definitive credit agreements, notes, guarantees, security documents, and intercreditor arrangements provide detailed mechanics. Review the borrower and guarantor entities, facility commitments, interest rate and benchmark mechanics, floors, fees, maturity, amortization, mandatory prepayments, and voluntary repayment terms. The collateral package and lien priority determine what supports the loan; guarantees determine which entities promise repayment. Representations and warranties describe the borrower's condition at signing and drawdown, while covenants govern ongoing conduct and reporting.\n\nDefault provisions identify events that may permit lenders to accelerate or exercise remedies, often subject to notice, cure, and materiality standards. Voting clauses determine which lenders can amend or waive terms; assignment rules govern transfers. Definitions are central: EBITDA, debt, permitted liens, restricted payments, and change of control can alter practical leverage and flexibility. Read the document as a connected system, comparing commercial intent with legal text and testing important definitions against the model. Counsel interprets enforceability and jurisdiction-specific law; the finance professional identifies economic effects and inconsistent assumptions. A seemingly small provision—such as amortization, a cash sweep, or a restricted-payment basket—can change cash repayment or control materially. Avoid relying on an unsigned term sheet or a market label when explaining lender rights.",
    "framework": "Document review: parties and obligations → facility economics → repayment and prepayment → collateral and priority → representations → affirmative/negative covenants → defaults, cures, voting, transfers, and remedies. Verify model definitions against executed text.",
    "example": {
      "assumptions": "$50m term loan; scheduled amortization equals 2% of original principal annually; three full annual installments paid; no voluntary prepayment or PIK interest.",
      "steps": [
        "1. Original principal is $50m; annual scheduled payment = 2% × $50m = $1m.",
        "2. Three installments total $1m × 3 = $3m.",
        "3. Remaining scheduled principal = $50m − $3m = $47m.",
        "4. If a $5m voluntary prepayment is separately permitted and applied to principal, balance becomes $42m; actual application and future amortization follow the executed agreement."
      ],
      "checks": [
        {
          "label": "annual installment",
          "a": 50,
          "op": "*",
          "b": 0.02,
          "result": 1
        },
        {
          "label": "three payments",
          "a": 1,
          "op": "*",
          "b": 3,
          "result": 3
        },
        {
          "label": "balance after scheduled installments",
          "a": 50,
          "op": "-",
          "b": 3,
          "result": 47
        },
        {
          "label": "balance after optional prepayment",
          "a": 47,
          "op": "-",
          "b": 5,
          "result": 42
        }
      ]
    },
    "questions": [
      {
        "q": "Which provisions would you focus on when reviewing a new term-loan agreement?",
        "a": "I would first verify borrower and guarantor scope, commitments, pricing, benchmark and floor, fees, maturity, amortization, mandatory prepayments, and optional repayment. Then I would map collateral, lien priority, and intercreditor rights. I would review financial definitions and covenants, including debt and EBITDA add-backs, baskets, restricted payments, reporting, events of default, cure periods, voting thresholds, and transfer rules. I would compare the legal text with the model and term sheet, flag economic deviations, and ask counsel to address interpretation and enforceability questions.",
        "mistake": "Reading only pricing and maturity while ignoring definitions that govern actual leverage and lender remedies."
      },
      {
        "q": "How would 2% annual amortization of original principal work on a $50m loan?",
        "a": "If 2% is applied to original principal, the scheduled annual amount is $1m. After three full installments, cumulative scheduled repayment is $3m and principal is $47m, absent other changes. That differs from amortization calculated as a percentage of the declining balance, which would produce smaller later payments. I would confirm the base, frequency, payment dates, day-count, and application of prepayments in the executed document. The model should reproduce the contract rather than assume a generic amortization convention. I would separately model any excess-cash sweep and its prepayment premium.",
        "mistake": "Applying the percentage to outstanding principal when the agreement specifies original principal."
      },
      {
        "q": "Why do covenant definitions and baskets deserve close attention?",
        "a": "Definitions determine what counts in a ratio or restriction, while baskets create permitted capacity for actions such as debt, liens, investments, or restricted payments. A borrower could have one leverage calculation under accounting statements and another under the agreement because of add-backs, netting, or permitted debt. I would identify the wording, quantify practical capacity using realistic assumptions, and track usage over time. The legal meaning is counsel's domain, but the credit analyst needs to understand how the terms affect leverage, liquidity, priority, and lender control.",
        "mistake": "Treating an EBITDA definition or basket as boilerplate without modeling its economic effect."
      }
    ],
    "selfCheck": {
      "question": "With $50m original principal and 2% original-principal amortization, what is the balance after three payments and a permitted $5m prepayment?",
      "answer": "Annual scheduled repayment is $1m; after three payments balance is $47m, and a further $5m principal prepayment leaves $42m."
    }
  },
  {
    "id": "private-credit-7",
    "title": "Direct Lending",
    "track": "Private Credit",
    "explanation": "Direct lending describes privately negotiated loans funded by non-bank lenders, often to middle-market or sponsor-backed companies, although borrower types and structures vary. The lender typically evaluates the opportunity from sourcing through underwriting, documentation, funding, monitoring, and eventual repayment or exit. Underwriting combines business quality, management, sponsor incentives, financial performance, cash conversion, leverage, liquidity, collateral, and downside recovery. Deal structure may include a revolving facility, term loan, delayed-draw tranche, or unitranche; contractual terms set pricing, maturity, amortization, covenants, and lender control.\n\nA quoted spread is not the entire return: benchmark rates, floors, original issue discount, upfront fees, unused fees, PIK interest, prepayment, and realized duration can affect economics. Likewise, a high coupon does not compensate automatically for weak documentation or poor recovery prospects. Portfolio construction matters because loans are illiquid and borrower or industry exposures can cluster. Monitoring includes financial reporting, covenant tests, liquidity, sponsor actions, and early-warning indicators. Direct lenders may negotiate bespoke terms, but bilateral negotiation does not eliminate credit risk, syndication dynamics, or legal complexity. Analyze how much capital the lender will hold, which parties share the facility, and how amendments or workouts are governed. Exact structures, pricing conventions, and documentation differ across markets and agreements; avoid describing one product feature as universal.",
    "framework": "Direct-lending lifecycle: source and screen → diligence and repayment case → structure and price → document and fund → monitor covenants/liquidity → repay, refinance, sell, or restructure. Separate contractual coupon from total realized return.",
    "example": {
      "assumptions": "A $40m loan at 9% simple cash coupon for one full year; par funding and repayment; ignore fees, benchmark changes, amortization, default, and compounding.",
      "steps": [
        "1. Annual cash interest = $40m × 9% = $3.6m.",
        "2. If EBITDA is $20m, interest-to-EBITDA is $3.6m ÷ $20m = 18%; this is not a complete coverage ratio.",
        "3. If the borrower repays $10m principal at year-end, $30m remains outstanding after that payment.",
        "4. At the same 9% rate, next-year interest on $30m would be $2.7m; actual lender IRR also depends on fees, timing, and repayments."
      ],
      "checks": [
        {
          "label": "annual cash interest",
          "a": 40,
          "op": "*",
          "b": 0.09,
          "result": 3.6
        },
        {
          "label": "interest as share of EBITDA",
          "a": 3.6,
          "op": "/",
          "b": 20,
          "result": 0.18
        },
        {
          "label": "principal after repayment",
          "a": 40,
          "op": "-",
          "b": 10,
          "result": 30
        },
        {
          "label": "next-year interest",
          "a": 30,
          "op": "*",
          "b": 0.09,
          "result": 2.7
        }
      ]
    },
    "questions": [
      {
        "q": "How does a direct lender underwrite a sponsor-backed company?",
        "a": "I would assess the company's business model and cash-flow durability, test reported EBITDA and working-capital conversion, and forecast debt service under base and downside conditions. I would review sponsor equity, incentives, and willingness to support the business without treating support as guaranteed. Then I would evaluate leverage, liquidity, collateral, documentation, covenants, pricing, and expected recovery. I would also consider concentration and how the loan fits the portfolio. The underwriting decision should identify repayment sources, key downside triggers, and protections that address the specific risks.",
        "mistake": "Assuming a sponsor will inject capital or refinance the borrower simply because it owns the company."
      },
      {
        "q": "A loan pays a 9% coupon. Is that the lender's expected return?",
        "a": "Not necessarily. The coupon is contractual cash interest under stated rate and balance assumptions. Lender return also reflects the benchmark and any floor, original issue discount, upfront and unused fees, payment-in-kind interest, amortization, voluntary prepayment, default, workout costs, and the timing of cash flows. A loan repaid early may generate a different IRR than one outstanding to maturity even at the same coupon. I would model dated lender cash flows under realistic repayment and credit scenarios rather than equate coupon with realized yield.",
        "mistake": "Calling the coupon yield or IRR without including purchase price, fees, repayments, and timing."
      },
      {
        "q": "What makes private loans difficult to manage after closing?",
        "a": "Private loans are generally less liquid and less continuously priced than exchange-traded securities, while borrower information arrives periodically and may require interpretation. Covenants can be bespoke; early warning depends on reading cash-flow trends, customer or sponsor developments, reporting quality, and covenant headroom. Amendment negotiations and workouts can involve multiple creditor classes and legal entities. A lender needs disciplined monitoring, escalation paths, and portfolio concentration controls. Low mark-to-market volatility should not be confused with low underlying credit risk or easy exit.",
        "mistake": "Assuming an illiquid loan is safe because its reported valuation changes infrequently."
      }
    ],
    "selfCheck": {
      "question": "What is the one-year cash coupon on a $40m par loan at 9%, before fees and other effects?",
      "answer": "$40m × 9% = $3.6m cash interest for one year, assuming the balance and rate stay constant."
    }
  },
  {
    "id": "private-credit-8",
    "title": "Downside & Recovery Analysis",
    "track": "Private Credit",
    "explanation": "Downside analysis tests whether a borrower can survive a plausible operating shock; recovery analysis estimates what creditors might collect if it cannot. A downside case begins with business drivers: lost customers, lower volume, price pressure, margin compression, delayed collections, higher rates, or required capex. Carry these effects through EBITDA, cash flow, liquidity, covenant compliance, and debt balances. Consider how long the company can operate before it needs new capital or misses a payment. A single percentage haircut to EBITDA does not capture the timing of a cash crisis.\n\nRecovery analysis starts with realizable value, not an optimistic enterprise-value headline. Estimate value under distress using an appropriate basis, deduct administrative and sale costs, then distribute remaining proceeds through liens, guarantees, and structural priority. The recovery rate is a scenario ratio, not a promised outcome; timing, disputes, collateral value, and restructuring costs create uncertainty. Model several values and senior-claim amounts, and distinguish collateral-specific recovery from enterprise-wide value. Legal priority depends on the documents and jurisdiction, so a simplified waterfall requires counsel's review. Compare recovery with exposure and expected loss, but do not confuse recovery severity with default probability. The most useful credit conclusion explains both what could trigger default and how much protection remains after the business has deteriorated.",
    "framework": "Downside chain: operating shock → EBITDA and cash-flow effect → liquidity/covenant breach → default timing. Recovery rate = proceeds available to a claim ÷ claim amount after senior claims and costs; distribute value by contractual priority.",
    "example": {
      "assumptions": "Distressed enterprise value $90m; restructuring and sale costs $5m; first-lien claim $70m; second-lien claim $40m; no other claims or timing discount.",
      "steps": [
        "1. Net value available after costs = $90m − $5m = $85m.",
        "2. First lien receives $70m, leaving $85m − $70m = $15m.",
        "3. Second lien receives the $15m residual against its $40m claim.",
        "4. Second-lien recovery = $15m ÷ $40m = 37.5%; delayed proceeds or additional priority claims would reduce present recovery."
      ],
      "checks": [
        {
          "label": "net value after costs",
          "a": 90,
          "op": "-",
          "b": 5,
          "result": 85
        },
        {
          "label": "residual after first lien",
          "a": 85,
          "op": "-",
          "b": 70,
          "result": 15
        },
        {
          "label": "second-lien recovery",
          "a": 15,
          "op": "/",
          "b": 40,
          "result": 0.375
        },
        {
          "label": "first-lien coverage",
          "a": 70,
          "op": "/",
          "b": 70,
          "result": 1
        },
        {
          "label": "first-lien recovery share",
          "a": 70,
          "op": "/",
          "b": 70,
          "result": 1
        }
      ]
    },
    "questions": [
      {
        "q": "How would you construct a downside case for a borrower with customer concentration?",
        "a": "I would identify the concentrated customer's revenue, contract terms, renewal dates, replacement options, and contribution margin. The stress should specify a plausible volume loss or delay, not merely reduce EBITDA by an unexplained percentage. I would forecast replacement sales, working-capital release or build, required capex, liquidity, debt service, and covenant headroom by period. Then I would identify management actions and their timing, and test what happens if they fail. The case should connect the commercial shock to default risk and lender protections without presenting the scenario as a forecast.",
        "mistake": "Applying a customer revenue haircut directly to EBITDA without considering margin, replacement costs, and cash timing."
      },
      {
        "q": "Walk me through a simple recovery waterfall for first- and second-lien creditors.",
        "a": "I estimate realizable enterprise or collateral value under distress, deduct costs and any claims that rank ahead of the facilities, then allocate remaining proceeds according to contractual lien and structural priority. In the example, $90m value less $5m costs leaves $85m; the $70m first lien is paid in full, leaving $15m for a $40m second lien, or 37.5%. I would then stress valuation, enforcement timing, collateral scope, guarantees, and legal expenses. This simplified waterfall is a scenario tool, not a legal conclusion or assured recovery.",
        "mistake": "Dividing gross enterprise value by total debt without accounting for costs and priority."
      },
      {
        "q": "Why should recovery analysis distinguish default probability from loss severity?",
        "a": "Default probability estimates the chance that obligations are not met over a defined horizon; loss severity reflects how much is lost after recoveries if default occurs. A senior secured loan may have lower severity in a particular case but can still default, while a junior claim may have high severity conditional on default. Expected credit loss combines probability and severity with exposure and timing under a defined framework. I would keep these concepts separate, state the horizon and assumptions, and recognize that recovery is uncertain and often correlated with the economic conditions that cause default.",
        "mistake": "Calling a high collateral recovery estimate evidence that default is unlikely."
      }
    ],
    "selfCheck": {
      "question": "After $5m costs and a $70m first-lien claim, how much remains from $90m value for a $40m second lien?",
      "answer": "$90m − $5m − $70m = $15m; $15m/$40m gives 37.5% recovery before timing or other claims."
    }
  },
  {
    "id": "private-credit-9",
    "title": "Due Diligence",
    "track": "Private Credit",
    "explanation": "Credit due diligence verifies whether information supports the repayment thesis and exposes issues that should change structure, price, covenants, or the decision to lend. Financial diligence reconciles reported EBITDA to sustainable earnings, tests revenue recognition and working-capital trends, reviews debt-like items, and examines cash conversion. Commercial work studies customer retention, pricing power, competition, supplier dependence, and market demand. Legal, tax, insurance, operational, technology, and management diligence add evidence about obligations and execution. Workstreams should be tied to specific underwriting questions rather than accumulated as a checklist without conclusions.\n\nA claimed add-back is not automatically valid because management labels it nonrecurring. Ask what caused the cost, whether it repeats, whether removing it requires replacement spending, and whether cash actually left the business. Confirm source data and reconcile inconsistencies among audited statements, management accounts, bank statements, and the model. Record findings with a quantified impact, responsible owner, mitigation, and open item. If a diligence issue changes sustainable EBITDA or cash needs, update leverage, coverage, liquidity, recovery, and covenant analysis. Confidentiality, reliance rights, and professional scope vary by engagement. Lenders should distinguish verified facts from management representations and external estimates, and document where information remains incomplete. Diligence improves underwriting; it cannot eliminate uncertainty or guarantee that future performance matches the base case.",
    "framework": "For each thesis claim: request evidence → reconcile source → quantify earnings/cash impact → update downside and structure → assign a condition, covenant, monitoring item, or walk-away decision. Validate add-backs for recurrence and replacement cost.",
    "example": {
      "assumptions": "Reported EBITDA $25m includes a $3m claimed one-time expense; diligence supports only $1m as genuinely nonrecurring; proposed debt $100m; no other adjustments.",
      "steps": [
        "1. Remove the unsupported $2m portion of the claimed add-back: $3m claimed − $1m supported = $2m.",
        "2. Underwritten EBITDA = $25m reported − $2m unsupported add-back = $23m.",
        "3. Leverage on reported EBITDA = $100m ÷ $25m = 4.0x; leverage on underwritten EBITDA = $100m ÷ $23m = 4.35x.",
        "4. The diligence adjustment raises leverage by approximately 0.35x; if the cost recurs, the lender should not capitalize it away without evidence."
      ],
      "checks": [
        {
          "label": "unsupported add-back",
          "a": 3,
          "op": "-",
          "b": 1,
          "result": 2
        },
        {
          "label": "underwritten EBITDA",
          "a": 25,
          "op": "-",
          "b": 2,
          "result": 23
        },
        {
          "label": "reported leverage",
          "a": 100,
          "op": "/",
          "b": 25,
          "result": 4
        },
        {
          "label": "underwritten leverage",
          "a": 100,
          "op": "/",
          "b": 23,
          "result": 4.3478260869565215
        }
      ]
    },
    "questions": [
      {
        "q": "How do you evaluate whether an EBITDA add-back is legitimate?",
        "a": "I ask what the expense represents, whether it has occurred before, whether it is likely to recur, and what spending is required to achieve the claimed savings. I tie it to invoices, payroll, contracts, or other source evidence, then check whether the adjustment is permitted by the loan definition and whether it is appropriate for underwriting. A cost may be one-time for accounting purposes but still require replacement investment or recur during integration. I would show both reported and adjusted EBITDA, quantify leverage impact, and avoid relying on unsupported synergies as current cash earnings.",
        "mistake": "Accepting management's label of one-time without evidence, recurrence analysis, or replacement-cost assessment."
      },
      {
        "q": "What would you do if audited statements and monthly management accounts disagree?",
        "a": "I would identify the exact accounts, periods, and accounting policies causing the difference, then reconcile revenue, expenses, working capital, and cash to the underlying ledger or supporting records. I would ask whether the variance reflects timing, classification, consolidation, or a control weakness, and assess its impact on EBITDA, liquidity, and covenants. Until resolved, I would use a conservative, clearly documented basis and make the discrepancy a diligence condition or monitoring item if material. I would not choose whichever number makes the credit case look stronger.",
        "mistake": "Using the most favorable source without documenting the reconciliation or uncertainty."
      },
      {
        "q": "How should a diligence finding change the credit decision?",
        "a": "I would translate the finding into repayment consequences: revised sustainable EBITDA, cash needs, leverage, covenant cushion, collateral value, or closing conditions. Then I would decide whether a mitigant—lower leverage, stronger reporting, a reserve, tighter covenant, price change, or specific representation—adequately addresses the risk. If the issue undermines repayment or cannot be verified, the appropriate answer may be to defer or decline. The memo should distinguish confirmed findings from open items and identify who owns each action before funding or during monitoring.",
        "mistake": "Appending diligence findings to a memo without changing assumptions, terms, or approval conditions."
      }
    ],
    "selfCheck": {
      "question": "What EBITDA should underwriting use if only $1m of a $3m claimed add-back is supported?",
      "answer": "Remove the unsupported $2m from reported $25m EBITDA, producing $23m underwritten EBITDA; $100m debt then represents about 4.35x leverage."
    }
  },
  {
    "id": "private-credit-10",
    "title": "Credit Memos",
    "track": "Private Credit",
    "explanation": "A credit memo is a decision document that allows an approval committee to understand the borrower, proposed exposure, repayment path, risks, protections, and unresolved questions. It opens with a clear recommendation and transaction summary: facility size, lender hold, pricing, maturity, use of proceeds, and key conditions. The analysis then presents the business and industry, management and sponsor, historical financials, quality of earnings, forecasts, sources and uses, debt structure, leverage, coverage, and liquidity. The base case must connect assumptions to cash available for debt service; downside cases show covenant pressure, liquidity needs, and recovery.\n\nA useful memo does not hide counterevidence. It names the largest risks, explains mitigants and their limits, and distinguishes contractual protection from an operational assumption. Include collateral and priority, covenant definitions, documentation points, diligence gaps, and monitoring triggers. Quantify the lender's hold and portfolio concentration, and explain returns under plausible prepayment or extension scenarios if required by the mandate. The conclusion should state why risk is acceptable at the proposed terms, what must be true for repayment, and which conditions must be met before funding. Definitions and approval formats vary by institution; memo structure should follow the governing credit policy. Unsupported precision, unexplained EBITDA adjustments, and long risk lists without ranking weaken a decision record. A committee should be able to locate the key calculation and challenge the assumptions without reconstructing the entire analysis from attachments.",
    "framework": "Recommendation → transaction and exposure → borrower/business → historical quality and forecast → capital structure and repayment → downside/recovery → covenants/documentation → diligence conditions → monitoring plan and approval request.",
    "example": {
      "assumptions": "Proposed facility $100m; lender hold $25m; projected year-3 cash generation $6m; contractual year-3 maturity $10m; ignore refinancing and other sources for the gap calculation.",
      "steps": [
        "1. Lender hold as share of facility = $25m ÷ $100m = 25%.",
        "2. Year-3 maturity exceeds projected cash generation by $10m − $6m = $4m.",
        "3. If no refinancing or other cash is available, the modeled repayment shortfall is $4m.",
        "4. The memo must identify a credible takeout, amortization plan, or structural change; merely reporting leverage does not close the maturity gap."
      ],
      "checks": [
        {
          "label": "hold percentage",
          "a": 25,
          "op": "/",
          "b": 100,
          "result": 0.25
        },
        {
          "label": "maturity shortfall",
          "a": 10,
          "op": "-",
          "b": 6,
          "result": 4
        },
        {
          "label": "facility not held",
          "a": 100,
          "op": "-",
          "b": 25,
          "result": 75
        },
        {
          "label": "hold amount plus remainder",
          "a": 25,
          "op": "+",
          "b": 75,
          "result": 100
        }
      ]
    },
    "questions": [
      {
        "q": "What makes a credit memo persuasive to an approval committee?",
        "a": "A persuasive memo is concise about the decision but complete about the evidence. It states the recommendation and exposure first, then links business quality and verified financials to cash repayment, structure, downside, and recovery. Material risks are ranked, with mitigants and remaining gaps stated plainly. I would show how diligence changed EBITDA or terms, identify covenant and documentation protections, and specify conditions before funding and monitoring triggers afterward. The committee should be able to challenge assumptions and reproduce key ratios without relying on unsupported adjectives or undisclosed model tabs.",
        "mistake": "Writing a promotional deal summary that omits counterarguments, downside, or the actual repayment source."
      },
      {
        "q": "How should you present an unresolved diligence item in the memo?",
        "a": "I would describe the issue, evidence available, potential effect on repayment or recovery, and what remains unknown. Then I would specify an owner, deadline, and decision consequence: for example, a condition precedent, pricing or structure change, covenant, reserve, or reason to decline if the item is not resolved. I would not present an open question as a confirmed fact or bury it in an appendix. The approval should make clear whether it is being asked to accept the risk or authorize funding only after verification.",
        "mistake": "Listing an open item without saying who resolves it or whether it blocks funding."
      },
      {
        "q": "A proposed facility matures for $10m in year three, but cash generation is only $6m. What belongs in your recommendation?",
        "a": "The memo should show the $4m gap explicitly and test whether cash generation is recurring, available for principal, and measured after operating needs and other debt service. I would examine refinancing access, scheduled amortization, asset-sale options, sponsor support if committed, and downside liquidity. If repayment relies on refinancing, I would label that as a risk rather than imply operating cash repays the loan. Terms could include amortization, cash sweep, maturity alignment, or a smaller hold, subject to negotiation and policy. The committee needs a credible path to takeout.",
        "mistake": "Calling the maturity covered because EBITDA exceeds the payment without calculating cash available for repayment."
      }
    ],
    "selfCheck": {
      "question": "With $6m projected cash generation and a $10m maturity, what shortfall must the credit memo address?",
      "answer": "The simplified gap is $4m. The memo should identify a credible refinancing, additional cash source, amortization, or revised structure."
    }
  }
];
