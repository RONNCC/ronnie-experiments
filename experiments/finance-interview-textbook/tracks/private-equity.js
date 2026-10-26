export default [
  {
    "id": "private-equity-1",
    "title": "LBO Modeling",
    "track": "Private Equity",
    "explanation": "A private-equity LBO model translates an investment thesis into an equity return under a specified financing plan. First calculate transaction uses: equity purchase price or enterprise value, refinancing of existing debt, fees, and any required cash. Then identify debt funding, management rollover, and sponsor equity; sources must equal uses. The operating forecast drives EBITDA, taxes, capital spending, working capital, and cash available for interest and principal repayment. Separate mandatory amortization from discretionary cash sweep, and model each tranche's pricing, maturity, and restrictions. Ending net debt is as important as exit EBITDA because debt repayment increases residual sponsor equity.\n\nAt exit, apply a justified valuation multiple to the exit-year metric, subtract net debt and other claims, then account for any management incentive dilution or interim distributions. MOIC divides total sponsor proceeds by invested equity; IRR solves for the annual discount rate that equates dated outflows and inflows. With a single investment and exit, the formula simplifies to MOIC^(1/holding period)−1. Returns should be disaggregated into operating growth, debt paydown, multiple movement, and distributions. The model is not a promise: downside cases should test lower revenue, margin compression, working-capital consumption, refinancing costs, and a lower exit multiple. Fees, rollover, acquisition financing, tax leakage, and add-on investments vary by deal; state what is included before quoting an IRR.",
    "framework": "Uses = purchase consideration + refinancing + fees + required cash. Sources = debt + rollover + sponsor equity. Exit equity proceeds = exit EV − ending net debt − other claims. MOIC = total proceeds ÷ invested sponsor equity; IRR discounts dated cash flows to zero NPV.",
    "example": {
      "assumptions": "One sponsor outflow and one exit; invest $50m at close, hold five years, exit equity proceeds $125m; exclude interim distributions, fees, and dilution.",
      "steps": [
        "1. Exit enterprise value is $155m and ending net debt is $30m, so exit equity proceeds = $155m − $30m = $125m.",
        "2. MOIC = $125m proceeds ÷ $50m invested = 2.50x.",
        "3. Annual growth factor = 2.50^(1/5) = 1.2011; subtract 1 to obtain annual IRR of 20.1%.",
        "4. If the same proceeds arrived after four years, IRR = 2.50^(1/4) − 1 = 25.7%; holding time changes IRR even when MOIC is unchanged."
      ],
      "checks": [
        {
          "label": "exit equity proceeds",
          "a": 155,
          "op": "-",
          "b": 30,
          "result": 125
        },
        {
          "label": "MOIC",
          "a": 125,
          "op": "/",
          "b": 50,
          "result": 2.5
        },
        {
          "label": "five-year IRR",
          "a": 2.5,
          "op": "powMinusOne",
          "b": 0.2,
          "result": 0.2011244339814313
        },
        {
          "label": "four-year IRR",
          "a": 2.5,
          "op": "powMinusOne",
          "b": 0.25,
          "result": 0.2574334296829355
        }
      ]
    },
    "questions": [
      {
        "q": "Walk me through a buyout model from purchase price to sponsor return.",
        "a": "I calculate uses for purchase consideration, debt refinancing, fees, and cash needs, then fund them with debt, rollover, and sponsor equity. The operating case drives earnings and cash conversion; after taxes, capex, and working capital, cash pays interest and amortizes debt. I forecast exit EBITDA and apply an exit multiple, subtract ending net debt and other claims, and calculate sponsor proceeds after any incentive dilution. I compare proceeds with invested equity for MOIC and solve dated cash flows for IRR. I then isolate growth, deleveraging, multiple change, and distributions as return drivers.",
        "mistake": "Treating enterprise-value growth as sponsor equity proceeds without subtracting ending debt."
      },
      {
        "q": "How can two buyouts with the same MOIC produce different IRRs?",
        "a": "IRR incorporates the timing of cash flows while MOIC aggregates value returned relative to capital invested. A 2.5x return over five years annualizes to about 20.1%, whereas the same multiple over four years annualizes to about 25.7%. Interim distributions or follow-on investments make the comparison more complex because each flow has its own date. I would calculate IRR from dated cash flows and also report MOIC so the committee can see total value creation without allowing early distributions to obscure the amount ultimately returned.",
        "mistake": "Comparing IRRs without checking holding period, interim cash flows, and additional capital calls."
      },
      {
        "q": "Which operating and financing assumptions deserve the most sensitivity in an LBO?",
        "a": "I would sensitize revenue and margin drivers that determine EBITDA, working-capital and capex needs that determine cash available for paydown, and financing costs that affect coverage and liquidity. Entry and exit multiples matter because small changes can shift equity proceeds materially; debt capacity and amortization affect risk and residual claims. I would combine correlated downside variables rather than vary each in isolation only. The output should show when the company breaches liquidity or covenant constraints, not just the resulting IRR at exit. Assumptions should match the company's operational evidence and the debt documents.",
        "mistake": "Showing only a two-way exit-multiple/IRR table while ignoring downside cash needs and debt service."
      }
    ],
    "selfCheck": {
      "question": "A sponsor invests $50m and receives $125m after five years with no interim flows. What are MOIC and IRR?",
      "answer": "MOIC is 2.5x; IRR = 2.5^(1/5) − 1 ≈ 20.1% annually."
    }
  },
  {
    "id": "private-equity-2",
    "title": "Valuation",
    "track": "Private Equity",
    "explanation": "Buyout valuation is a range-building exercise that combines intrinsic cash-flow analysis with observed market pricing. A DCF values forecast free cash flow by discounting it at a rate consistent with the risk and capital structure; terminal value captures cash flows beyond the explicit forecast. Public-company comparables show how investors price listed peers, while precedent transactions show what buyers paid in completed acquisitions. Each method has different assumptions: a DCF is sensitive to forecasts and discount rates, trading multiples reflect market sentiment and minority pricing, and transactions may embed control value or synergies.\n\nStart with the right metric and enterprise-value definition. EBITDA-based multiples pair enterprise value with earnings before financing; P/E pairs equity value with net income. Normalize one-time items, leases, stock compensation, pension obligations, and other adjustments consistently. Apply a selected range to the subject's matching financial period, then bridge EV to equity by subtracting net debt and other claims and adding excess cash or non-operating assets. A sponsor also asks what price supports its required returns under realistic leverage and exit assumptions; that is a buyer-specific maximum bid, not the same as standalone fair value. Avoid false precision: ranges depend on business quality, growth, margins, risk, and market conditions. The selected entry price should be reconciled with diligence and the value-creation plan rather than chosen solely to produce a target IRR.",
    "framework": "Triangulate DCF, trading comparables, and precedents. EV/EBITDA = EV ÷ EBITDA; common equity proceeds require deducting funded and senior claims, then restoring excess cash and excluded assets. Sponsor bid capacity can be solved from exit equity, debt paydown, and required return.",
    "example": {
      "assumptions": "Subject EBITDA $30m; relevant trading range 8x–10x; net debt $60m; no other claims or non-operating assets; same EBITDA definition throughout.",
      "steps": [
        "1. Low enterprise value = 8 × $30m = $240m; high enterprise value = 10 × $30m = $300m.",
        "2. Net debt is $60m, so equity value at the low case = $240m − $60m = $180m.",
        "3. Equity value at the high case = $300m − $60m = $240m.",
        "4. At the 9x midpoint, EV is $270m and equity value is $210m; this value range is not automatically the sponsor's return-supportable bid."
      ],
      "checks": [
        {
          "label": "low EV",
          "a": 8,
          "op": "*",
          "b": 30,
          "result": 240
        },
        {
          "label": "high EV",
          "a": 10,
          "op": "*",
          "b": 30,
          "result": 300
        },
        {
          "label": "low equity value",
          "a": 240,
          "op": "-",
          "b": 60,
          "result": 180
        },
        {
          "label": "midpoint equity value",
          "a": 270,
          "op": "-",
          "b": 60,
          "result": 210
        },
        {
          "label": "midpoint EV",
          "a": 9,
          "op": "*",
          "b": 30,
          "result": 270
        },
        {
          "label": "high-case equity value",
          "a": 300,
          "op": "-",
          "b": 60,
          "result": 240
        }
      ]
    },
    "questions": [
      {
        "q": "How would you triangulate a purchase valuation for a private-equity target?",
        "a": "I would build a DCF from operating cash flows, examine public companies with comparable growth, margins, capital intensity, and risk, and review relevant acquisition precedents. For each method I would align the valuation date, financial metric, accounting adjustments, and enterprise-value bridge. DCF highlights assumptions; trading peers reflect current public pricing; transactions may include control or synergy value. I would reconcile the ranges rather than mechanically average them. Separately, I would solve what entry price supports the sponsor's return under realistic operating, leverage, and exit assumptions, and compare that with the market evidence.",
        "mistake": "Averaging incomparable multiples or confusing the fund's bid ceiling with independent fair value."
      },
      {
        "q": "Why might a sponsor's maximum bid differ from a DCF valuation?",
        "a": "The sponsor's bid ceiling is determined by the equity investment, financing structure, expected operating plan, exit value, fees, and required return. A DCF estimates value from projected cash flows and a discount rate, while a sponsor return model asks what purchase price leaves the target return after leverage and exit assumptions. Different buyers may have distinct synergies, cost structures, or return requirements. I would show the assumptions behind both values and avoid treating a fund-specific return hurdle as a universal valuation convention.",
        "mistake": "Claiming a sponsor-specific target IRR is the company's intrinsic cost of capital or fair value."
      },
      {
        "q": "What does a higher acquisition multiple imply for a buyout?",
        "a": "At the same EBITDA, debt structure, and exit value, a higher entry enterprise value requires more equity or debt funding and generally reduces sponsor returns. It can also raise leverage if financing is fixed, tightening coverage and increasing downside risk. But a high multiple may be justified by stronger growth, resilience, strategic value, or a credible value-creation plan. I would test the entry multiple against peer and transaction evidence, then quantify the return effect rather than label it cheap or expensive in isolation.",
        "mistake": "Discussing the multiple without connecting entry price to equity funding, leverage, and exit economics."
      }
    ],
    "selfCheck": {
      "question": "At 9x EBITDA of $30m and $60m net debt, what are EV and equity value?",
      "answer": "EV is $270m and equity value is $270m − $60m = $210m."
    }
  },
  {
    "id": "private-equity-3",
    "title": "Due Diligence",
    "track": "Private Equity",
    "explanation": "Buy-side diligence tests whether the target can deliver the investment thesis and whether the purchase agreement and operating plan address material risks. Financial diligence examines quality of earnings, revenue recognition, customer cohorts, working capital, debt-like items, and cash conversion. Commercial diligence evaluates market size and growth, customer needs, competitive intensity, pricing, churn, and the durability of margins. Legal, tax, technology, operations, human capital, and environmental reviews may uncover liabilities, required investment, or integration constraints. The work should be organized around questions that could change valuation, financing, or the decision to proceed.\n\nQuality-of-earnings adjustments need evidence: a claimed one-time expense may recur, an acquisition may obscure organic trends, or a revenue cut-off can shift earnings between periods. Translate findings into revised sustainable EBITDA, working capital needs, capex, forecast cash, debt capacity, and exit assumptions. Track each issue, source, owner, quantification, mitigation, and closing condition. Some findings can be priced; others call for an indemnity, escrow, covenant, operational plan, or walk-away. Diligence findings also shape the first 100-day plan and confirm whether the value-creation initiatives are feasible. Third-party reports have defined scope and reliance terms; legal interpretations and jurisdiction-specific matters require appropriate counsel. Diligence narrows uncertainty but cannot remove execution risk, so the investment case must still work under a credible downside scenario.",
    "framework": "Thesis claim → diligence question → primary evidence → quantified financial or operational impact → change to valuation/terms/plan → owner and closing or monitoring action.",
    "example": {
      "assumptions": "Reported EBITDA $12m includes $2m of claimed one-time expenses; diligence supports only $1.5m as nonrecurring; selected valuation multiple 10x; no other adjustments.",
      "steps": [
        "1. Unsupported add-back = claimed $2m − verified $1.5m = $0.5m.",
        "2. Adjusted EBITDA = reported $12m − $0.5m unsupported amount = $11.5m.",
        "3. At 10x, reported EBITDA would imply EV of $120m; diligence-adjusted EBITDA implies $115m.",
        "4. The diligence finding reduces this illustrative EV by $5m and should flow into price, financing, or another negotiated protection."
      ],
      "checks": [
        {
          "label": "unsupported add-back",
          "a": 2,
          "op": "-",
          "b": 1.5,
          "result": 0.5
        },
        {
          "label": "diligence-adjusted EBITDA",
          "a": 12,
          "op": "-",
          "b": 0.5,
          "result": 11.5
        },
        {
          "label": "reported EV",
          "a": 12,
          "op": "*",
          "b": 10,
          "result": 120
        },
        {
          "label": "adjusted EV",
          "a": 11.5,
          "op": "*",
          "b": 10,
          "result": 115
        }
      ]
    },
    "questions": [
      {
        "q": "What is a quality-of-earnings review intended to establish?",
        "a": "It evaluates whether reported earnings represent a sustainable level of operating performance and how those earnings convert into cash. I would examine revenue cut-off, customer concentration, gross-margin trends, recurring and nonrecurring costs, acquisition accounting, working capital, and debt-like items. Claimed adjustments need documentation and an assessment of replacement costs or recurrence. The output should reconcile reported EBITDA to an underwritten figure and explain how any change affects leverage, purchase price, and the operating plan. It is not simply an exercise in increasing the EBITDA number used for valuation.",
        "mistake": "Accepting add-backs at face value or treating EBITDA normalization as a guaranteed cash benefit."
      },
      {
        "q": "How would you handle a diligence finding that reduces normalized EBITDA by $0.5m?",
        "a": "I would trace the issue to source evidence, determine whether it affects future earnings or cash, and update the model and valuation using the revised $0.5m adjustment. At a 10x illustrative multiple, a $0.5m EBITDA reduction changes EV by $5m before debt and other claims. I would consider whether the risk is addressed through purchase price, working-capital terms, an indemnity, escrow, financing, or an operating action. The right response depends on probability, recoverability, and deal documents; not every issue should be treated as a simple multiple adjustment.",
        "mistake": "Reducing the price by an arbitrary amount without connecting it to earnings, cash, or contractual protection."
      },
      {
        "q": "How does diligence feed into a value-creation plan?",
        "a": "Diligence establishes the baseline, validates whether initiatives are achievable, and identifies constraints, costs, and dependencies. If pricing improvements require new systems or could increase churn, those costs and risks belong in the plan. Customer interviews and operational data can reveal whether a sales productivity thesis is supported. I would assign an owner, timeline, investment requirement, leading indicator, and financial outcome to each initiative, then distinguish verified opportunities from hypotheses. The board should be able to see what changes if a key initiative misses its milestone.",
        "mistake": "Counting the same opportunity in both diligence-adjusted EBITDA and the forward value-creation plan."
      }
    ],
    "selfCheck": {
      "question": "What is adjusted EBITDA and implied EV after validating $1.5m of a $2m add-back from $12m reported EBITDA at 10x?",
      "answer": "Unsupported add-back is $0.5m, adjusted EBITDA is $11.5m, and implied EV is $115m."
    }
  },
  {
    "id": "private-equity-4",
    "title": "Investment Memos",
    "track": "Private Equity",
    "explanation": "An investment memo is the durable record of why a fund should commit capital, what must happen for the thesis to work, and how the team will recognize failure. Lead with the recommendation, proposed equity check, transaction structure, and expected returns. Then explain the business, market, competitive position, management, and evidence behind the differentiated thesis. Forecasts should connect operating initiatives to revenue, margins, cash flow, capital expenditure, and leverage. Valuation should show entry assumptions, comparable evidence, downside protection, and exit cases.\n\nThe memo needs a return bridge, not just an IRR headline: show operating growth, debt paydown, exit multiple, distributions, fees, and dilution as applicable. Present base, upside, and downside cases with explicit assumptions and identify which variables drive the conclusion. Risks should be ranked by probability and impact, with mitigants and residual exposure. Include diligence findings, unresolved items, legal and financing conditions, governance rights, and the first-year operating agenda. A persuasive memo includes counterevidence and explains why it does not invalidate the investment—or what would make the team walk away. Facts, management claims, estimates, and sponsor assumptions should be visibly distinguished. The committee should be able to challenge the model and understand who owns each decision. Format and approval thresholds vary by fund; analytical transparency does not.",
    "framework": "Recommendation and check size → thesis and evidence → market/company → entry valuation → operating plan → financing and return bridge → downside, risks, mitigants → diligence/conditions → governance and monitoring.",
    "example": {
      "assumptions": "One sponsor investment of $20m, exit equity proceeds of $40m after four years, no interim distributions, fees, or follow-on capital.",
      "steps": [
        "1. MOIC = $40m exit proceeds ÷ $20m invested = 2.0x.",
        "2. Annual IRR = 2.0^(1/4) − 1 = 18.9% approximately.",
        "3. If a downside exit yields $30m, downside MOIC = $30m ÷ $20m = 1.5x.",
        "4. The memo should connect the $40m base proceeds to exit EV, ending debt, and operating assumptions; the headline multiple alone does not explain value creation."
      ],
      "checks": [
        {
          "label": "base MOIC",
          "a": 40,
          "op": "/",
          "b": 20,
          "result": 2
        },
        {
          "label": "base IRR",
          "a": 2,
          "op": "powMinusOne",
          "b": 0.25,
          "result": 0.18920711500272103
        },
        {
          "label": "downside MOIC",
          "a": 30,
          "op": "/",
          "b": 20,
          "result": 1.5
        },
        {
          "label": "proceeds decline",
          "a": 40,
          "op": "-",
          "b": 30,
          "result": 10
        }
      ]
    },
    "questions": [
      {
        "q": "What belongs in an investment committee memo?",
        "a": "I would put the recommendation and proposed check size first, followed by a thesis supported by evidence rather than slogans. The memo should cover business and market quality, management, entry valuation, operating plan, financing, return drivers, and downside. I would include a transparent bridge from operating assumptions to cash flow, debt paydown, exit equity, MOIC, and IRR. Material risks, diligence gaps, mitigants, legal conditions, governance rights, and monitoring milestones belong in the core narrative. A committee needs enough information to challenge the decision, not merely approve a polished summary.",
        "mistake": "Presenting a return target without exposing entry price, exit assumptions, or downside consequences."
      },
      {
        "q": "How would you present a thesis that depends on one major operating initiative?",
        "a": "I would identify the initiative, the evidence that it is feasible, the owner, required investment, timeline, and the measurable leading indicators. Then I would model the revenue, margin, cash, and valuation effects separately from the base business and show what happens if adoption is slower or costs are higher. The memo should disclose any dependency on customer behavior, management hiring, or systems implementation. If the investment only meets the return case when every initiative succeeds, that concentration should be explicit and may call for a lower entry price or different structure.",
        "mistake": "Embedding the initiative's full EBITDA benefit in the base case without ramp, cost, or execution risk."
      },
      {
        "q": "What makes an investment memo falsifiable?",
        "a": "A falsifiable memo names observable conditions that would disprove the thesis: retention falling below a stated level, a key product launch slipping, gross margin missing a defined range, or debt paydown failing to meet a milestone. It identifies the data source and review cadence, the person responsible, and the action if the threshold is breached. That lets the board distinguish ordinary variance from evidence that the investment logic no longer holds. Thresholds should be grounded in diligence and the model rather than invented to make monitoring appear rigorous.",
        "mistake": "Writing broad risks such as 'execution could be challenging' without measurable warning signs."
      }
    ],
    "selfCheck": {
      "question": "What base-case MOIC and approximate IRR belong in the memo for $20m invested and $40m returned after four years?",
      "answer": "MOIC is 2.0x and annual IRR is 2^(1/4) − 1, approximately 18.9%, before excluded costs and flows."
    }
  },
  {
    "id": "private-equity-5",
    "title": "Deal Sourcing",
    "track": "Private Equity",
    "explanation": "Deal sourcing builds a repeatable pipeline of companies that fit a fund's strategy and where the sponsor can credibly add value. Start with investment criteria: sector, size, geography, control preference, ownership horizon, and operational capabilities. Construct a target universe from public information, intermediaries, executive networks, portfolio relationships, and direct research. Prioritize targets based on strategic fit and likely access rather than maximizing contact volume. Outreach should communicate a relevant reason for discussion without overstating fund expertise, transaction interest, or certainty.\n\nA sourcing system tracks companies and relationships through defined stages: identified, researched, contacted, engaged, qualified, under diligence, and declined or closed. Record source, date, decision-maker, thesis, next action, and conflicts or confidentiality restrictions. Conversion rates only make sense when the cohort, stage definitions, and time window are consistent. A small number of high-quality interactions may be more valuable than many unqualified leads. Sourcing also includes market mapping and monitoring ownership or succession events, but information should be verified before action. Intermediary relationships depend on credibility and timely feedback; founders expect discretion and respect. In an interview, explain how you would target companies, personalize outreach, qualify an opportunity, and preserve data quality. Fund mandates and outreach compliance vary; follow the firm's approved practices and applicable privacy requirements.",
    "framework": "Investment mandate → target universe → thesis-specific prioritization → compliant outreach → qualification → diligence decision → relationship follow-up. Conversion rate = opportunities reaching a defined stage ÷ cohort entering the preceding stage.",
    "example": {
      "assumptions": "Hypothetical sourcing cohort: 40 qualified opportunities; 8 advance to diligence; 2 of those close; same cohort and observation window.",
      "steps": [
        "1. Qualified-to-diligence conversion = 8 ÷ 40 = 20%.",
        "2. Diligence-to-close conversion = 2 ÷ 8 = 25%.",
        "3. Qualified-to-close conversion = 2 ÷ 40 = 5%.",
        "4. These are cohort calculations, not market benchmarks; compare only cohorts with consistent qualification rules and enough time to mature."
      ],
      "checks": [
        {
          "label": "qualified to diligence",
          "a": 8,
          "op": "/",
          "b": 40,
          "result": 0.2
        },
        {
          "label": "diligence to close",
          "a": 2,
          "op": "/",
          "b": 8,
          "result": 0.25
        },
        {
          "label": "qualified to close",
          "a": 2,
          "op": "/",
          "b": 40,
          "result": 0.05
        },
        {
          "label": "opportunities not advanced",
          "a": 40,
          "op": "-",
          "b": 8,
          "result": 32
        }
      ]
    },
    "questions": [
      {
        "q": "How would you build a sourcing strategy for a new sector?",
        "a": "I would translate the fund's mandate and operating capabilities into specific criteria, then map the value chain, business models, ownership patterns, and potential target universe. I would identify where the fund has a differentiated angle and prioritize companies by fit, scale, access, and plausible value creation. Outreach would be tailored to the company's situation and use approved channels. I would track source, contact history, thesis, stage, conflicts, and next steps, then review conversion by cohort. The goal is a qualified, relationship-based pipeline rather than a large count of names.",
        "mistake": "Starting outreach before understanding the fund mandate, company economics, or existing relationships."
      },
      {
        "q": "What does a 20% conversion rate from qualified opportunities to diligence tell you?",
        "a": "It means eight of forty opportunities in the defined cohort advanced to diligence, assuming qualification and stage definitions are consistent. It does not by itself show sourcing quality or predict future returns. I would inspect reasons for rejection, source channels, sector fit, time to advance, and whether the cohort has matured. A high conversion could reflect overly narrow qualification; a low one may reveal weak outreach or changing market conditions. I would use the metric alongside qualitative review and avoid presenting it as an industry benchmark.",
        "mistake": "Interpreting a small or immature cohort's conversion percentage as a stable sourcing performance statistic."
      },
      {
        "q": "How do you maintain a useful sourcing database without damaging relationships?",
        "a": "I would record factual, relevant interaction history with source, date, stage, agreed follow-up, and any confidentiality restrictions, then limit access according to firm policy. Notes should distinguish verified information from personal opinion and be updated when circumstances change. Outreach should respect preferences and avoid repetitive generic messages. If a company shares confidential information, I would follow internal procedures and avoid distributing it beyond authorized recipients. Data quality and discretion protect both the firm's analysis and the long-term trust needed for future conversations.",
        "mistake": "Recording unverified personal claims or circulating sensitive company information without authorization."
      }
    ],
    "selfCheck": {
      "question": "For the hypothetical cohort, what proportion of qualified opportunities closed, and is that a market benchmark?",
      "answer": "Two of forty closed, or 5%. It is only a calculation for that defined cohort, not an industry statistic."
    }
  },
  {
    "id": "private-equity-6",
    "title": "Debt Financing",
    "track": "Private Equity",
    "explanation": "Debt financing determines how much borrowed capital a transaction can support, at what cash cost, and with which restrictions. A sponsor may evaluate term loans, revolving credit, unitranche facilities, second-lien debt, notes, or other structures, depending on the market and borrower. Compare spread and benchmark exposure, rate floors, original issue discount, upfront and unused fees, amortization, maturity, call protection, mandatory prepayments, covenant package, collateral, and execution certainty. Floating-rate debt creates rate sensitivity; hedges can reduce some exposure but bring costs, collateral, and basis risk.\n\nDebt capacity is not just a leverage multiple. It depends on predictable cash flow, interest coverage, capex and working-capital needs, collateral, market appetite, documentation, and downside liquidity. Model each tranche separately, including payment timing and cash sweep; interest expense changes with the balance and rate. A cheaper instrument may have tighter covenants or less certainty, while flexible debt may cost more. Financing terms also affect equity returns and exit optionality. In a buyout, sources must match uses at closing, and debt commitments should align with transaction conditions and funding dates. Market conventions vary by currency, lender type, and documentation. State the borrowing assumptions rather than asserting an instrument is always cheaper or available at a fixed leverage level.",
    "framework": "Compare all-in cash and noncash cost, maturity, amortization, call/prepayment terms, covenants, collateral, and funding certainty. Annual cash interest ≈ outstanding principal × cash rate; model rate, balance, and payment date by tranche.",
    "example": {
      "assumptions": "$80m debt at 8% annual cash interest; $10m principal repaid at year-end; no fees, benchmark changes, PIK, or intra-year amortization.",
      "steps": [
        "1. First-year cash interest = $80m × 8% = $6.4m.",
        "2. Principal repayment at year-end is $10m, leaving $70m outstanding.",
        "3. At the same 8% rate, next-year cash interest on $70m = $5.6m.",
        "4. The $0.8m annual interest reduction equals $10m debt reduction × 8%; actual interest depends on payment date and contract terms."
      ],
      "checks": [
        {
          "label": "first-year interest",
          "a": 80,
          "op": "*",
          "b": 0.08,
          "result": 6.4
        },
        {
          "label": "ending principal",
          "a": 80,
          "op": "-",
          "b": 10,
          "result": 70
        },
        {
          "label": "next-year interest",
          "a": 70,
          "op": "*",
          "b": 0.08,
          "result": 5.6
        },
        {
          "label": "interest saving",
          "a": 6.4,
          "op": "-",
          "b": 5.6,
          "result": 0.8
        }
      ]
    },
    "questions": [
      {
        "q": "How would you compare two debt packages with different pricing and covenant terms?",
        "a": "I would compare all-in expected cost and flexibility rather than headline spread alone. That includes benchmark and floor, OID, fees, unused commitments, amortization, call protection, maturity, collateral, covenant definitions, baskets, and funding certainty. I would model cash interest under changing rates and debt balances, then assess liquidity and downside covenant capacity. A lower-cost package may be less attractive if it creates refinancing risk or constrains the operating plan. I would align the facility to the transaction timetable and confirm that commitments are executable under the required conditions.",
        "mistake": "Ranking offers only by the stated coupon or spread."
      },
      {
        "q": "What is the cash interest effect of repaying $10m on an $80m loan at 8%?",
        "a": "With year-end repayment, first-year interest on $80m is $6.4m under the simple assumptions. The principal balance falls to $70m; at the same rate, next-year interest is $5.6m. That is $0.8m less annual interest, equal to $10m multiplied by 8%. If repayment occurs earlier, interest savings can begin during the year; benchmark changes, floors, fees, and day-count conventions alter actual cash cost. I would follow the agreement's timing and rate mechanics in a transaction model. The distinction also affects the cash sweep and sponsor's projected distributions.",
        "mistake": "Applying the new lower debt balance to the entire year when repayment occurs only at year-end."
      },
      {
        "q": "Why is execution certainty important in acquisition financing?",
        "a": "A financing commitment only helps if it funds when the transaction needs to close and remains available after specified conditions are satisfied. I would review commitment expiry, flex provisions, market disruption terms, documentation, syndication risk if applicable, conditions precedent, and the purchase agreement timetable. A nominally cheap financing package that cannot be delivered may put the acquisition at risk. The sponsor should also maintain a realistic alternative funding plan and model the cost of any backup, subject to negotiated terms and applicable law.",
        "mistake": "Treating a term sheet or indicative lender interest as unconditional committed funding."
      }
    ],
    "selfCheck": {
      "question": "At 8%, how much annual cash interest is saved after the year-end repayment reduces debt from $80m to $70m?",
      "answer": "Interest falls from $6.4m to $5.6m, a $0.8m annual saving at the unchanged rate."
    }
  },
  {
    "id": "private-equity-7",
    "title": "IRR & MOIC",
    "track": "Private Equity",
    "explanation": "MOIC and IRR summarize different aspects of investment performance. MOIC, also called multiple of invested capital, compares total value realized or held with the capital invested; it is easy to interpret but ignores when cash arrives. IRR is the discount rate that sets the present value of dated investments and distributions to zero. A simple one-investment, one-exit case uses the closed-form annualization formula, but multiple capital calls and distributions require solving the full cash-flow series. Interim distributions can raise IRR by returning capital sooner even when total MOIC is unchanged.\n\nNeither measure is sufficient alone. IRR can favor a shorter-duration investment with lower total dollars returned, and it can be affected by subscription facilities, reinvestment assumptions, or timing conventions. MOIC can conceal a long holding period or significant early loss. Report gross versus net returns clearly, specify whether unrealized value is included, and state how fees, carry, follow-on capital, and distributions are handled. Compare investments with similar cash-flow patterns and risk. In an interview, calculate the one-outflow case, then explain why dated flows require an IRR solution rather than a simple power formula. Return measures do not prove that value was created sustainably; operational performance and downside risk remain central.",
    "framework": "MOIC = total distributions and residual value ÷ total invested capital under the stated convention. IRR solves Σ CFₜ/(1+IRR)ᵗ = 0. For one outflow and one later inflow: IRR = MOIC^(1/years) − 1.",
    "example": {
      "assumptions": "Invest $10m at time zero; receive one $20m distribution exactly three years later; ignore fees, carry, and interim flows.",
      "steps": [
        "1. MOIC = $20m total proceeds ÷ $10m invested = 2.0x.",
        "2. Present-value equation: $10m = $20m ÷ (1 + IRR)^3.",
        "3. Rearranging gives 1 + IRR = 2^(1/3) = 1.2599.",
        "4. IRR = 1.2599 − 1 = 26.0% per year approximately; the result depends on the three-year timing assumption."
      ],
      "checks": [
        {
          "label": "MOIC",
          "a": 20,
          "op": "/",
          "b": 10,
          "result": 2
        },
        {
          "label": "annualized growth factor",
          "a": 2,
          "op": "pow",
          "b": 0.3333333333333333,
          "result": 1.2599210498948732
        },
        {
          "label": "annual IRR",
          "a": 2,
          "op": "powMinusOne",
          "b": 0.3333333333333333,
          "result": 0.2599210498948732
        },
        {
          "label": "total gain",
          "a": 20,
          "op": "-",
          "b": 10,
          "result": 10
        }
      ]
    },
    "questions": [
      {
        "q": "Explain the difference between MOIC and IRR to an investment committee.",
        "a": "MOIC measures total proceeds and remaining value relative to invested capital, without accounting for timing. IRR is the discount rate that equates the present value of dated outflows and inflows, so it reflects when money is invested and returned. In a single $10m investment that returns $20m after three years, MOIC is 2.0x and IRR is about 26%. The same 2.0x over a longer period has a lower IRR. I would show both, state gross or net treatment, and include dated cash flows when there are interim distributions or additional investments.",
        "mistake": "Calling MOIC an annual return or using one-horizon IRR math for irregular cash flows."
      },
      {
        "q": "How can an investment's IRR rise while its MOIC stays constant?",
        "a": "If the same total proceeds are returned sooner, the annualized rate rises because capital is tied up for less time. For instance, doubling capital in three years gives about 26% IRR, while doubling in two years gives about 41.4%, although each produces 2.0x MOIC. Interim distributions can also improve IRR without changing aggregate proceeds. I would inspect actual cash-flow dates and any subscription-line usage, and compare the total dollars and risk as well as IRR. Faster returns do not necessarily indicate a larger amount of value creation.",
        "mistake": "Treating a high IRR as proof the investment generated more total value than a higher-MOIC deal."
      },
      {
        "q": "Why can a subscription facility affect reported fund IRR?",
        "a": "A facility can delay the date when investor capital is called while portfolio investments are already made. Because IRR depends on the timing of LP cash flows, later capital calls can raise the reported LP-level IRR relative to an unlevered or no-facility presentation even if the underlying asset proceeds do not change. The facility also adds interest, fees, liquidity and refinancing risk. I would examine gross asset returns, net fund cash flows, facility duration and cost, and any presentation convention. Reporting rules and fund documents govern disclosure; the effect should not be mistaken for operational improvement.",
        "mistake": "Comparing facility-enhanced IRR with a no-facility return as though cash-flow timing were identical."
      }
    ],
    "selfCheck": {
      "question": "An investment returns $20m on $10m after three years with no interim flows. What are MOIC and IRR?",
      "answer": "MOIC is 2.0x; IRR is 2^(1/3) − 1, approximately 26.0% annually."
    }
  },
  {
    "id": "private-equity-8",
    "title": "Value Creation Plans",
    "track": "Private Equity",
    "explanation": "A value-creation plan converts the investment thesis into operating actions with owners, timing, resources, and measurable outcomes. The plan may address pricing, product mix, sales effectiveness, customer retention, procurement, manufacturing yield, working capital, technology, or capital allocation. Start with a verified baseline and a causal hypothesis: what operating behavior changes, what customer or cost outcome follows, and how does that outcome affect cash flow or risk? Identify the required investment, organizational capability, dependencies, and potential harm such as churn, service deterioration, or supplier disruption.\n\nSeparate management's existing initiatives from incremental sponsor-supported work to avoid claiming credit twice. Each initiative should have a leading indicator, financial metric, milestone, accountable owner, and decision gate. Translate sustainable EBITDA improvements into enterprise value only with care: a recurring improvement may support a multiple-based value, but implementation costs, timing, taxes, working capital, and exit conditions matter. Cash improvements such as inventory release may create liquidity without recurring EBITDA growth. A plan should be revisited as evidence arrives and should include contingencies when a target misses. In an interview, connect the operational mechanism to the model instead of declaring a generic target for margin expansion. The fund can support management, but day-to-day execution remains an operating responsibility; board oversight and incentive design vary by portfolio company.",
    "framework": "Baseline → operational intervention → leading indicator → realized revenue/cost/cash effect → implementation cost and timing → risk-adjusted, non-duplicative value. Assign one accountable owner and milestone per initiative.",
    "example": {
      "assumptions": "Pricing action adds $1m annual revenue at 40% contribution margin; implementation cost is $0.1m; assume no volume loss, tax, or working-capital effect; illustrative 8x exit multiple.",
      "steps": [
        "1. Incremental contribution EBITDA = $1m revenue × 40% contribution margin = $0.4m.",
        "2. First-year EBITDA after the $0.1m implementation cost = $0.4m − $0.1m = $0.3m.",
        "3. If the recurring $0.4m contribution is sustained at exit, gross enterprise-value impact at 8x = $0.4m × 8 = $3.2m.",
        "4. The $3.2m is not net proceeds: subtract implementation and other costs, and test whether volume, retention, and margin assumptions hold."
      ],
      "checks": [
        {
          "label": "incremental contribution",
          "a": 1,
          "op": "*",
          "b": 0.4,
          "result": 0.4
        },
        {
          "label": "first-year EBITDA after cost",
          "a": 0.4,
          "op": "-",
          "b": 0.1,
          "result": 0.3
        },
        {
          "label": "gross exit EV effect",
          "a": 0.4,
          "op": "*",
          "b": 8,
          "result": 3.2
        },
        {
          "label": "gross value less first-year cost",
          "a": 3.2,
          "op": "-",
          "b": 0.1,
          "result": 3.1
        }
      ]
    },
    "questions": [
      {
        "q": "How would you develop a value-creation plan after acquiring a company?",
        "a": "I would establish a diligence-supported baseline and identify the few initiatives most connected to the investment thesis. For each, I would define the operational mechanism, owner, required people or capital, milestone, leading indicator, financial outcome, and downside risk. I would distinguish recurring EBITDA gains from one-time cash releases and from management's pre-existing plans. The board should review progress against evidence, not just targets, and adjust resources if a milestone slips. Any valuation benefit should follow from sustainable performance and account for implementation cost, timing, and potential customer or employee impact.",
        "mistake": "Listing generic levers such as pricing or procurement without owner, baseline, cost, and causal link."
      },
      {
        "q": "How do you avoid double-counting a value-creation initiative in a return model?",
        "a": "I identify where each benefit already appears in the base forecast, diligence adjustments, synergy case, or management budget. The model should include the initiative once, with a clear start date, ramp, cost, and dependency. For example, if improved pricing is already embedded in forecast revenue and margin, I should not add the same EBITDA gain again as a separate exit adjustment. I reconcile the initiative register to forecast line items and document whether it is a base-case assumption, upside case, or unmodeled opportunity.",
        "mistake": "Adding a multiple-based value uplift on top of an EBITDA forecast that already includes the initiative."
      },
      {
        "q": "When does an EBITDA improvement create enterprise value, and when might it not?",
        "a": "A durable EBITDA improvement can increase enterprise value if market valuation methods capitalize that earnings stream and the market continues to assign a comparable multiple. But the outcome depends on sustainability, risk, required reinvestment, working capital, customer response, and exit conditions. A temporary cost cut may not deserve a recurring multiple, while a one-time working-capital release creates cash but not necessarily a higher EBITDA base. I would distinguish cash-flow value from multiple-based value, incorporate implementation cost, and stress whether margins or pricing remain defensible after ownership changes.",
        "mistake": "Multiplying every dollar of near-term savings by the exit multiple regardless of durability or reinvestment."
      }
    ],
    "selfCheck": {
      "question": "At 40% contribution margin, what EBITDA contribution follows from $1m incremental revenue, and what gross EV effect at 8x if recurring?",
      "answer": "Contribution is $0.4m; if sustained at exit, the illustrative gross EV effect is $0.4m × 8 = $3.2m before costs and risk."
    }
  },
  {
    "id": "private-equity-9",
    "title": "Portfolio Monitoring",
    "track": "Private Equity",
    "explanation": "Portfolio monitoring compares actual business performance with the investment case and identifies when action is needed. Financial reporting should include revenue, EBITDA, margins, working capital, capex, cash, debt, liquidity, covenant status, and forecast variance. Operating indicators—customer churn, backlog, utilization, pricing, employee turnover, safety, or product quality—often reveal change before financial statements do. The relevant indicators depend on the business model, and definitions must remain consistent with the original underwriting case.\n\nMonitoring is not merely collecting a monthly dashboard. The board and deal team should understand the cause of variances, identify whether they are temporary or structural, assign an owner, and record a corrective action with a deadline. Compare actuals with budget, prior periods, and relevant market evidence while separating acquisition, divestiture, foreign-exchange, or accounting effects. Track covenant headroom and maturity well before a test or refinancing date. A portfolio company may need support, new capital, leadership changes, or a revised plan; escalation should be timely and evidence-based. Sensitive company information must be handled under governance and confidentiality rules. Avoid overreacting to one noisy metric or allowing a polished aggregate score to obscure a deteriorating segment. The monitoring cadence, board rights, and reporting format depend on ownership and legal agreements, but accountability for assumptions and follow-through is universal.",
    "framework": "Plan-versus-actual variance = actual − plan; percentage variance = (actual − plan)/|plan| when plan is nonzero. Pair lagging financials with leading operating indicators, liquidity, covenant headroom, issue owner, action, and due date.",
    "example": {
      "assumptions": "Plan EBITDA $10m; actual EBITDA $9m; net debt $45m; same accounting and debt definitions in both leverage calculations.",
      "steps": [
        "1. EBITDA variance = $9m actual − $10m plan = −$1m.",
        "2. Percentage variance = −$1m ÷ $10m = −10%.",
        "3. Actual leverage = $45m net debt ÷ $9m EBITDA = 5.0x; plan leverage at unchanged debt = $45m ÷ $10m = 4.5x.",
        "4. The EBITDA miss increases leverage by 0.5x, so the board should investigate drivers and update liquidity and covenant forecasts."
      ],
      "checks": [
        {
          "label": "EBITDA variance",
          "a": 9,
          "op": "-",
          "b": 10,
          "result": -1
        },
        {
          "label": "variance percentage",
          "a": -1,
          "op": "/",
          "b": 10,
          "result": -0.1
        },
        {
          "label": "actual leverage",
          "a": 45,
          "op": "/",
          "b": 9,
          "result": 5
        },
        {
          "label": "plan leverage",
          "a": 45,
          "op": "/",
          "b": 10,
          "result": 4.5
        }
      ]
    },
    "questions": [
      {
        "q": "What would you include in a portfolio-company monthly monitoring pack?",
        "a": "I would include actual-versus-plan financials, cash flow, working capital, capex, liquidity, debt, covenant headroom, and an updated forecast. I would add leading indicators tied to the business model, such as churn, backlog, utilization, pricing, or product quality, and reconcile changes in definitions or acquisitions. Each major variance should identify its driver, owner, action, and expected resolution date. The pack should highlight decisions and risks, not bury them in a long dashboard. I would also track maturity and refinancing milestones early enough for the board to act.",
        "mistake": "Reporting lagging EBITDA without cash, operating indicators, or a forward liquidity view."
      },
      {
        "q": "How do you respond to a portfolio company that misses EBITDA plan by 10%?",
        "a": "I would first validate the accounting and forecast basis, then decompose the miss into volume, price, mix, margin, costs, or one-time items. I would test whether the cause is temporary or structural using operational indicators and customer evidence. At unchanged $45m net debt, a decline from $10m to $9m EBITDA moves leverage from 4.5x to 5.0x, so I would update covenant and liquidity forecasts. Management should own a corrective plan with milestones; the board should revisit capital needs and valuation if the trend persists.",
        "mistake": "Treating the variance as a percentage only and ignoring the leverage or cash consequences."
      },
      {
        "q": "Which leading indicators would you monitor for a subscription business?",
        "a": "I would select measures tied to recurring revenue quality: gross and net retention, churn by cohort, new bookings, backlog or contracted recurring revenue, customer acquisition cost, implementation time, and product reliability. Definitions matter: gross retention excludes expansion while net retention may include it, and cohorts need consistent start dates. I would reconcile these indicators to recognized revenue, cash collections, and support costs. The right dashboard depends on the company's product and contract model; I would avoid using a metric because it is fashionable if management cannot explain its causal link to cash flow.",
        "mistake": "Treating bookings, billings, cash collections, and recognized revenue as interchangeable."
      }
    ],
    "selfCheck": {
      "question": "Using $45m net debt, how does leverage change between $10m planned EBITDA and $9m actual EBITDA?",
      "answer": "Plan leverage is 4.5x; actual leverage is 5.0x, a 0.5x increase driven by the EBITDA miss."
    }
  },
  {
    "id": "private-equity-10",
    "title": "Exit Strategies",
    "track": "Private Equity",
    "explanation": "An exit converts ownership into realizable proceeds and should be considered throughout the holding period, not only when a fund is ready to sell. Common routes include a strategic sale, sponsor-to-sponsor transaction, public offering, recapitalization, or partial secondary sale; each offers different valuation, timing, certainty, governance, and preparation requirements. The best route depends on company quality, scale, buyer universe, market conditions, management readiness, shareholder objectives, and legal or regulatory constraints. A public listing does not necessarily mean immediate full liquidity, while a sale may involve contingent consideration or an escrow.\n\nPrepare the company by producing reliable financial reporting, credible forecasts, clean governance, a documented growth narrative, and diligence-ready contracts, customer information, and compliance records. Map potential buyers and their strategic fit, but do not assume any will bid. Estimate net equity proceeds by starting with exit enterprise value, subtracting net debt, transaction costs, and other claims, and accounting for dilution, preferences, and rollover. Compare alternatives by risk-adjusted proceeds and timing, not headline enterprise value alone. Consider tax and jurisdiction-specific issues with specialists. An exit process can fail or be delayed; build contingency plans and preserve operating performance during preparation. Fund documents and investor obligations may govern decision rights and timing, so coordinate the company plan with the fund's liquidity needs without compromising the business.",
    "framework": "Exit route comparison: net proceeds, certainty, time to liquidity, execution burden, governance, and strategic fit. Net equity proceeds ≈ exit EV − net debt − transaction costs − other claims, adjusted for dilution and contingent consideration.",
    "example": {
      "assumptions": "Sale EV $150m; net debt $40m; transaction costs $5m; sponsor equity invested $35m; no other claims, dilution, or rollover.",
      "steps": [
        "1. Equity value before costs = $150m EV − $40m net debt = $110m.",
        "2. Net proceeds after $5m transaction costs = $110m − $5m = $105m.",
        "3. Sponsor proceeds MOIC = $105m ÷ $35m invested = 3.0x.",
        "4. If an alternative route produced $108m but took two extra years and added execution risk, compare dated net cash flows rather than choosing solely on the $3m headline difference."
      ],
      "checks": [
        {
          "label": "equity before costs",
          "a": 150,
          "op": "-",
          "b": 40,
          "result": 110
        },
        {
          "label": "net proceeds",
          "a": 110,
          "op": "-",
          "b": 5,
          "result": 105
        },
        {
          "label": "sponsor MOIC",
          "a": 105,
          "op": "/",
          "b": 35,
          "result": 3
        },
        {
          "label": "alternative proceeds difference",
          "a": 108,
          "op": "-",
          "b": 105,
          "result": 3
        },
        {
          "label": "alternative proceeds increase",
          "a": 108,
          "op": "-",
          "b": 105,
          "result": 3
        }
      ]
    },
    "questions": [
      {
        "q": "How would you compare a strategic sale, sponsor sale, and IPO as exit routes?",
        "a": "I would compare likely net proceeds, buyer or investor depth, certainty, timing, diligence demands, governance, ongoing ownership, and management readiness. A strategic buyer may value synergies but may require integration; a sponsor buyer may focus on standalone cash generation and financing; an IPO can provide access to public capital but may leave shares subject to lockups and market volatility. These are tendencies, not guarantees. I would map realistic counterparties, prepare the company, evaluate transaction costs and conditions, and preserve alternatives until evidence supports a preferred route.",
        "mistake": "Comparing headline enterprise values without timing, costs, contingencies, and liquidity restrictions."
      },
      {
        "q": "What does exit readiness involve before launching a sale process?",
        "a": "I would ensure financial statements and forecasts are reliable, reporting controls are documented, contracts and corporate records are organized, and management can explain operating performance and risks consistently. Diligence should identify unresolved legal, tax, customer, data, and compliance matters, with owners assigned to remediation. The company needs a supportable growth narrative, clear KPI definitions, and a realistic plan to maintain performance through the process. Readiness does not guarantee a sale or valuation; it reduces avoidable friction and helps buyers assess the business more efficiently.",
        "mistake": "Treating a polished presentation as readiness while records, controls, or contracts remain disorganized."
      },
      {
        "q": "How do you calculate the equity proceeds available to the sponsor at exit?",
        "a": "I start with exit enterprise value, derived from a defensible metric and exit valuation assumption, then subtract ending net debt, transaction expenses, and other senior claims. I adjust for management incentives, preferred securities, rollover, escrow, or contingent consideration where relevant. In the example, $150m EV less $40m net debt and $5m costs yields $105m proceeds; against $35m invested, that is 3.0x MOIC before other adjustments. I would reconcile the waterfall to transaction documents and distinguish cash at close from proceeds contingent on future events.",
        "mistake": "Subtracting gross debt without adding available cash, or ignoring incentive dilution and costs."
      }
    ],
    "selfCheck": {
      "question": "At $150m exit EV, $40m net debt, $5m costs, and $35m invested, what are proceeds and MOIC?",
      "answer": "Net equity proceeds are $105m; divided by $35m invested, MOIC is 3.0x."
    }
  }
];
