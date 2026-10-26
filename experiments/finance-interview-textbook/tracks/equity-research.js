export default [
  {
    "id": "equity-research-1",
    "title": "Industry Analysis",
    "track": "Equity Research",
    "explanation": "Industry analysis explains the forces shaping company revenue, margins, capital requirements, and competitive durability. Define the market carefully: product categories, geography, customer type, channel, and measurement basis can change the answer. Size the addressable market using units and prices or customer counts and spend, and separate a growing market from a company gaining share. Map the value chain to locate profit pools and understand bargaining power among suppliers, buyers, platforms, and distributors. Consider entry barriers, substitutes, capacity, regulation, technology, and cyclicality.\n\nMarket share is meaningful only when numerator and denominator cover the same period, region, and product set. Growth rates should distinguish nominal from real, volume from price, and organic from acquisition-driven expansion. Industry averages can conceal a wide range of outcomes; compare a company's economics with peers and explain differences in utilization, mix, customer retention, pricing, or capital intensity. Look for leading indicators such as orders, inventories, utilization, or customer budgets, but do not assume they translate mechanically into reported revenue. Industry frameworks such as competitive forces are organizing tools, not substitutes for evidence. In an interview, state your market definition, quantify the company's position, and connect industry shifts to a specific financial forecast. Sources may disagree; reconcile methodology and label estimates rather than presenting an uncertain market size as a fact.",
    "framework": "Market share = company sales ÷ defined market sales. CAGR = (ending value ÷ beginning value)^(1/years) − 1. Define units, geography, period, channel, currency, and whether the denominator measures revenue, volume, or customers.",
    "example": {
      "assumptions": "Defined market revenue grows from $8bn to $10bn over two years; a company has $1bn revenue in the ending period; consistent scope and currency.",
      "steps": [
        "1. Market growth factor over two years = $10bn ÷ $8bn = 1.25x.",
        "2. Annualized market CAGR = 1.25^(1/2) − 1 = 11.8% approximately.",
        "3. Ending company market share = $1bn ÷ $10bn = 10%.",
        "4. The 10% share says nothing about share gain without the company's beginning-period sales and the same market definition."
      ],
      "checks": [
        {
          "label": "two-year growth factor",
          "a": 10,
          "op": "/",
          "b": 8,
          "result": 1.25
        },
        {
          "label": "annualized CAGR",
          "a": 1.25,
          "op": "powMinusOne",
          "b": 0.5,
          "result": 0.1180339887498949
        },
        {
          "label": "market share",
          "a": 1,
          "op": "/",
          "b": 10,
          "result": 0.1
        },
        {
          "label": "market revenue increase",
          "a": 10,
          "op": "-",
          "b": 8,
          "result": 2
        }
      ]
    },
    "questions": [
      {
        "q": "How would you analyze the competitive structure of an industry?",
        "a": "I would define the product and geographic market, then map customers, suppliers, distributors, direct competitors, substitutes, and potential entrants. I would examine concentration, switching costs, capacity, pricing behavior, regulation, technology, and where margins accrue across the value chain. Company-level evidence—retention, pricing, win rates, utilization, and customer concentration—helps test whether an industry-level thesis applies to the subject. I would distinguish structural changes from the cycle and quantify how the analysis affects revenue growth, margins, or capital intensity. Frameworks organize inquiry, but primary evidence should support the conclusion.",
        "mistake": "Using a broad industry label without defining the market or explaining who captures economic profit."
      },
      {
        "q": "A market grew from $8bn to $10bn in two years. What is its CAGR and what does that tell you?",
        "a": "The two-year factor is 10 divided by 8, or 1.25. Taking the square root and subtracting one gives about 11.8% annualized growth. That describes the constant rate that links those endpoints; it does not mean the market grew exactly 11.8% in each year. I would investigate volume and price contributions, acquisitions, geography, and methodology, and compare the rate with the company's own sales. A growing market does not ensure that a particular company gains share or earns attractive returns. It is a compact summary, not a causal forecast of future expansion.",
        "mistake": "Calling the CAGR the actual growth in each year or inferring company growth from market growth alone."
      },
      {
        "q": "What evidence would you use to estimate market share?",
        "a": "I would identify consistent company sales and market totals for the same period, product perimeter, geography, channel, and units. Sources could include filings, industry shipment data, customer or distributor disclosures, and carefully qualified third-party estimates. If the company reports only a segment spanning a broader market, I would not divide it by a narrower denominator without adjustment. I would calculate a range when data are incomplete and explain whether share is measured by revenue, units, or customers. A precise percentage based on mismatched definitions is less useful than a transparent estimate.",
        "mistake": "Dividing company revenue by a market figure with a different geography, period, or product scope."
      }
    ],
    "selfCheck": {
      "question": "If the defined market is $10bn and the company sells $1bn in the same scope and period, what is its share?",
      "answer": "$1bn/$10bn = 10%, assuming the company and market figures cover the same perimeter."
    }
  },
  {
    "id": "equity-research-2",
    "title": "Financial Modeling",
    "track": "Equity Research",
    "explanation": "An equity research model transforms a view on customers, products, prices, and costs into forecast financial statements and valuation. Build revenue by segment or operating driver rather than applying one unexplained growth rate to the consolidated total. Model gross margin from mix and unit economics, then operating expenses, taxes, interest, diluted shares, and earnings per share. Link the income statement to working capital, capex, depreciation, and cash flow where those items affect the thesis. Historical periods should tie to filings, with reported and adjusted numbers reconciled.\n\nForecasting requires consistent timing: fiscal-year ends, acquisition contributions, seasonality, stock compensation, buybacks, and share issuance can all change reported EPS. Segment metrics may not reconcile cleanly to GAAP statements; disclose the bridge and use the company's definitions carefully. Build sensitivities around drivers that matter—for a subscription business, customer counts, churn, pricing, and average revenue; for a manufacturer, volume, mix, utilization, and input costs. A model should reveal the difference between earnings growth and cash generation, including reinvestment needs. Check that unit economics aggregate to reported revenue and that margin changes have a causal explanation. In interviews, walk from one operating assumption to EPS or free cash flow and state how you would revise the forecast after new information. Do not imply a forecast is a fact or that one quarter determines the full-year outlook.",
    "framework": "Revenue build = operating metric × price or average revenue; EPS = net income ÷ diluted weighted-average shares. Bridge operating drivers through margins, expenses, taxes, interest, and share count; reconcile adjusted metrics to reported statements.",
    "example": {
      "assumptions": "Subscription business has 2m average paid accounts, $10 monthly revenue per account, and 20% operating margin; ignore churn timing, taxes, interest, and other revenue.",
      "steps": [
        "1. Annual revenue per account = $10 × 12 months = $120.",
        "2. Revenue = 2m accounts × $120 = $240m.",
        "3. Operating income = $240m × 20% = $48m.",
        "4. If accounts increase 5% to 2.1m at unchanged ARPU and margin, revenue becomes $252m and operating income $50.4m before other items."
      ],
      "checks": [
        {
          "label": "annual revenue per account",
          "a": 10,
          "op": "*",
          "b": 12,
          "result": 120
        },
        {
          "label": "annual revenue",
          "a": 2000000,
          "op": "*",
          "b": 120,
          "result": 240000000
        },
        {
          "label": "operating income",
          "a": 240,
          "op": "*",
          "b": 0.2,
          "result": 48
        },
        {
          "label": "revenue after account growth",
          "a": 2100000,
          "op": "*",
          "b": 120,
          "result": 252000000
        },
        {
          "label": "operating income after account growth",
          "a": 252,
          "op": "*",
          "b": 0.2,
          "result": 50.4
        }
      ]
    },
    "questions": [
      {
        "q": "Walk me through a segment-based financial model for an issuer you cover.",
        "a": "I begin with historical segment disclosures and reconcile them to consolidated revenue. For each segment I identify its drivers—units, price, customers, utilization, backlog, or mix—and build the forecast from those assumptions. I model margins and operating expenses in a way that reflects segment economics, then incorporate taxes, interest, diluted shares, working capital, capex, and depreciation. I compare model outputs with filings and guidance, and create scenarios for key uncertainties. The model should make clear how an operating change reaches EPS and cash flow, not just produce a target number.",
        "mistake": "Forecasting consolidated EPS without tracing segment assumptions or reconciling reported versus adjusted figures."
      },
      {
        "q": "How would a 5% increase in average paid accounts affect revenue in the example?",
        "a": "At 2.0m accounts and $10 monthly ARPU, annual revenue is $240m. A 5% increase takes accounts to 2.1m; at unchanged ARPU, revenue becomes 2.1m times $10 times 12, or $252m. That is a $12m increase. If operating margin remains 20%, operating income rises by $2.4m to $50.4m before taxes and other items. I would test whether account growth is net of churn and whether support costs or discounts change with the additional subscribers. I would separately forecast acquisition costs and support capacity.",
        "mistake": "Assuming paid-account growth converts fully to revenue without checking average timing, churn, discounts, or mix."
      },
      {
        "q": "How do you handle a company's adjusted earnings measure in your model?",
        "a": "I start with reported results and reconcile each adjustment to disclosed evidence, asking whether it is genuinely nonrecurring and whether replacement spending or dilution remains. I keep the GAAP or applicable reported forecast visible and label any adjusted measure with its definition. If the company changes its adjustment policy, I recast history where feasible or explain the discontinuity. Valuation multiples must use a metric consistent with peer definitions. An adjustment can help analyze underlying economics, but it should not erase recurring costs merely because management excludes them.",
        "mistake": "Using management-adjusted EPS without reconciling excluded expenses or keeping the reported basis visible."
      }
    ],
    "selfCheck": {
      "question": "At 2.1m accounts, $10 monthly ARPU, and 20% operating margin, what are annual revenue and operating income?",
      "answer": "Revenue is $252m; operating income is $50.4m before taxes, interest, and other omitted items."
    }
  },
  {
    "id": "equity-research-3",
    "title": "Forecasting",
    "track": "Equity Research",
    "explanation": "Forecasting is a reasoned estimate of future operating outcomes, not a mechanical extrapolation of last year's growth. Begin with what drives demand, pricing, capacity, customer behavior, and seasonality. Separate volume and price, new customers and retention, organic growth and acquisitions, or other causes that explain the reported line. Incorporate management guidance as evidence with a track record and range, not as a fact. Check forecasts against historical patterns, external data, industry conditions, and operating constraints.\n\nA model should link assumptions coherently: slower volume may reduce factory utilization, increase unit costs, and affect inventory; customer churn can reduce recurring revenue and raise acquisition spending. Distinguish a one-variable sensitivity from a scenario in which drivers move together. Define the forecast horizon and treatment of fiscal calendars, currency, one-time events, and acquisitions. Compare actual results with prior forecasts to understand bias and update the drivers that changed. Consensus estimates provide context for what the market may expect but are not necessarily correct or fully public in every setting. In interviews, explain the causal evidence behind one key assumption, show how it flows through financials, and give a range of outcomes. Avoid false precision when leading indicators are noisy, and identify what new evidence would trigger a forecast revision.",
    "framework": "Forecast each output from operating drivers; variance = actual − forecast. Scenario analysis changes linked assumptions together; sensitivity changes a selected input while holding other assumptions fixed. Separate volume, price, mix, and acquisition effects where material.",
    "example": {
      "assumptions": "Starting revenue $100m; next-year volume growth 5% and price growth 3%; assume volume and price compound multiplicatively, no mix or acquisition effects.",
      "steps": [
        "1. Volume factor = 1 + 5% = 1.05; price factor = 1 + 3% = 1.03.",
        "2. Forecast revenue = $100m × 1.05 × 1.03 = $108.15m.",
        "3. Combined growth = $108.15m ÷ $100m − 1 = 8.15%, not exactly 8% because effects compound.",
        "4. If actual revenue is $106m, actual-minus-forecast variance is $106m − $108.15m = −$2.15m, requiring driver attribution."
      ],
      "checks": [
        {
          "label": "combined volume-price factor",
          "a": 1.05,
          "op": "*",
          "b": 1.03,
          "result": 1.0815
        },
        {
          "label": "forecast revenue",
          "a": 100,
          "op": "*",
          "b": 1.0815,
          "result": 108.15
        },
        {
          "label": "growth rate",
          "a": 108.15,
          "op": "/",
          "b": 100,
          "result": 1.0815
        },
        {
          "label": "revenue variance",
          "a": 106,
          "op": "-",
          "b": 108.15,
          "result": -2.15
        }
      ]
    },
    "questions": [
      {
        "q": "How do you forecast revenue for a company with both volume and pricing growth?",
        "a": "I would separate the drivers and identify evidence for each: units, customer counts, utilization, price realization, contracts, and mix. Starting at $100m, 5% volume growth and 3% price growth compound to $100m times 1.05 times 1.03, or $108.15m, an 8.15% increase. I would not simply add the rates if the interaction matters. Then I would connect volume and pricing to gross margin, capacity, customer retention, and working capital, and build downside assumptions where price increases affect demand. I would test whether pricing gains hold after customer response.",
        "mistake": "Adding volume and price growth without considering compounding or demand elasticity."
      },
      {
        "q": "What is the difference between a sensitivity and a scenario analysis?",
        "a": "A sensitivity changes one input, or a small defined set, while holding other assumptions constant; it isolates how output responds to that input. A scenario changes related assumptions together to describe a coherent business outcome—for example, lower volume, reduced utilization, weaker margins, and slower collections. Sensitivities help identify model exposure, while scenarios test interactions and plausibility. I would label each clearly and avoid combining independent sensitivities as though they represented a realistic downside without checking how the variables co-move. Their purpose is to separate model sensitivity from a believable business path.",
        "mistake": "Calling a one-variable table a downside scenario when related operating drivers are unchanged."
      },
      {
        "q": "How should a forecast change after the company misses guidance?",
        "a": "I would identify the drivers of the miss, separating timing, execution, market demand, pricing, mix, and one-time items. I would check whether the underlying evidence changes future periods or only shifts revenue between quarters, then revise linked assumptions and compare the new result with prior guidance and consensus. I would examine management's explanation against customer, inventory, and industry data, while acknowledging uncertainty. A forecast should change because the causal outlook changed, not simply to match the reported number. I would document the revision and what future evidence could reverse it.",
        "mistake": "Annualizing one weak quarter without seasonality or investigating whether the shortfall is temporary."
      }
    ],
    "selfCheck": {
      "question": "Starting at $100m, what revenue results from 5% volume and 3% pricing growth when compounded?",
      "answer": "$100m × 1.05 × 1.03 = $108.15m, or 8.15% growth."
    }
  },
  {
    "id": "equity-research-4",
    "title": "Earnings Analysis",
    "track": "Equity Research",
    "explanation": "Earnings analysis evaluates what a company reported relative to expectations and whether the result changes the forward investment case. Compare revenue, segment growth, margins, EPS, cash flow, and guidance with consensus and the company's own prior outlook. A headline beat can arise from lower taxes, share repurchases, timing, or one-time gains rather than improved operations. Conversely, a modest miss may reflect temporary timing while orders and margins remain sound. Reconcile reported GAAP or applicable earnings with adjusted figures and examine the quality of adjustments.\n\nBuild a bridge explaining the EPS surprise: volume, price, mix, expenses, interest, taxes, and diluted shares. Read management commentary alongside tables, balance-sheet movements, and cash conversion. Assess whether the quarter changes the full-year run rate, creates a new trend, or merely shifts recognition between periods. Guidance and outlook may matter more than backward-looking results if they revise future expectations. The stock reaction depends on what was priced in, positioning, and risk—not simply beat or miss. In an interview, quantify the surprise, identify its composition, and state what evidence you would monitor next. Reported results can be revised, and consensus definitions differ among providers; disclose the benchmark and period used rather than presenting an unqualified surprise percentage.",
    "framework": "EPS surprise = reported EPS − consensus EPS; surprise % = difference ÷ |consensus| when meaningful. Bridge EPS through operating drivers, interest, tax, and diluted shares; separate recurring performance from timing and one-off items.",
    "example": {
      "assumptions": "Consensus EPS $1.00; reported EPS $1.08; a $0.06 one-time tax benefit is identified and excluded for an illustrative adjusted comparison; no other differences.",
      "steps": [
        "1. Headline EPS beat = $1.08 − $1.00 = $0.08.",
        "2. Headline surprise percentage = $0.08 ÷ $1.00 = 8%.",
        "3. EPS excluding the stated $0.06 tax benefit = $1.08 − $0.06 = $1.02.",
        "4. Adjusted operating surprise = $1.02 − $1.00 = $0.02, or 2%; the tax adjustment is illustrative and must be supported by the company's disclosure."
      ],
      "checks": [
        {
          "label": "headline EPS beat",
          "a": 1.08,
          "op": "-",
          "b": 1,
          "result": 0.08
        },
        {
          "label": "headline surprise rate",
          "a": 0.08,
          "op": "/",
          "b": 1,
          "result": 0.08
        },
        {
          "label": "EPS excluding tax item",
          "a": 1.08,
          "op": "-",
          "b": 0.06,
          "result": 1.02
        },
        {
          "label": "adjusted surprise",
          "a": 1.02,
          "op": "-",
          "b": 1,
          "result": 0.02
        }
      ]
    },
    "questions": [
      {
        "q": "A company reports EPS of $1.08 versus $1.00 consensus. How do you analyze the result?",
        "a": "The headline beat is $0.08, or 8% of consensus, but I would decompose it before changing my view. I would examine revenue, volume, price, mix, operating margins, expenses, interest, taxes, and diluted shares, then compare guidance with expectations. If $0.06 came from a one-time tax benefit, EPS excluding that item is $1.02, only a 2% illustrative operating beat. I would verify the adjustment in filings, assess cash conversion and segment trends, and decide whether the result changes the forward forecast rather than simply labeling it a beat.",
        "mistake": "Treating the headline EPS beat as evidence of operating outperformance without reviewing taxes or share count."
      },
      {
        "q": "Why might a stock fall after an earnings beat?",
        "a": "The market may have expected an even larger result, or investors may focus on weaker guidance, declining orders, lower-quality earnings, margin pressure, or cash-flow deterioration. Positioning and valuation also shape the reaction: positive news can be priced in, while a small disappointment in forward expectations can matter more. I would compare the release with consensus and prior guidance, read management commentary, and inspect price action relative to relevant peers and factors. The immediate move is evidence about expectations, not proof that the underlying business value has changed by the same amount.",
        "mistake": "Assuming the share-price reaction is irrational solely because reported EPS exceeded consensus."
      },
      {
        "q": "How do you separate a recurring earnings improvement from a one-time item?",
        "a": "I identify the underlying source, whether cash was received or a cost avoided, whether it has appeared in prior periods, and whether similar items are likely to recur. I reconcile the adjustment to reported earnings and test its tax and share-count effects. Then I compare operating indicators and cash flow to see whether the improvement reflects a durable change in demand or margins. A one-time tax benefit may raise EPS without improving core operations. I would label adjusted calculations, show the reported figure, and avoid creating an adjustment unsupported by disclosure or evidence.",
        "mistake": "Removing any unfavorable item as nonrecurring while retaining favorable one-time gains."
      }
    ],
    "selfCheck": {
      "question": "If reported EPS is $1.08, consensus $1.00, and a supported one-time tax benefit is $0.06, what adjusted surprise remains?",
      "answer": "Adjusted EPS is $1.02, leaving a $0.02 or 2% beat against $1.00 consensus."
    }
  },
  {
    "id": "equity-research-5",
    "title": "Valuation Multiples",
    "track": "Equity Research",
    "explanation": "Valuation multiples relate a security's price or enterprise value to an accounting or operating metric. P/E is share price divided by EPS, or equity value divided by net income; EV/EBITDA compares enterprise value with EBITDA before financing. Other measures—price-to-sales, EV/EBIT, price-to-book, or free-cash-flow yield—fit different business economics. The numerator and denominator must represent matching claims and time periods. A forward multiple uses forecast results and depends on estimates; a trailing multiple uses historical reported figures but may be distorted by a cycle or unusual event.\n\nMultiples are shaped by expected growth, risk, profitability, reinvestment, capital structure, and accounting policy. A higher multiple is not automatically expensive if growth and returns justify it; a low multiple may signal structural decline or leverage. Peer comparisons require consistent treatment of leases, stock compensation, minority interests, and fiscal periods. Normalize earnings only with transparent adjustments, and check whether a loss-making company makes P/E meaningless. A PEG ratio compares P/E with an earnings growth measure, but conventions vary and the ratio can be misleading when growth is volatile. In interviews, explain why a particular multiple fits, define the metric and period, and connect changes in the multiple to expectations rather than treat it as a standalone answer. Use DCF and cash-flow analysis to challenge, not merely confirm, a peer-based conclusion.",
    "framework": "P/E = share price ÷ EPS; EV/EBITDA = enterprise value ÷ EBITDA; FCF yield = free cash flow ÷ equity value or EV, with denominator explicitly stated. Use matching forward/trailing periods and consistent accounting definitions.",
    "example": {
      "assumptions": "Share price $30 and forward EPS $2.00; hold price constant for a sensitivity to EPS of $1.50; ignore dividends and other changes.",
      "steps": [
        "1. Forward P/E at $2 EPS = $30 ÷ $2 = 15.0x.",
        "2. If EPS is $1.50 at the same price, P/E = $30 ÷ $1.50 = 20.0x.",
        "3. EPS falls by $0.50 ÷ $2.00 = 25% while the share price is unchanged.",
        "4. The multiple rises because the denominator shrank; the stock did not become more expensive through a price increase in this illustration."
      ],
      "checks": [
        {
          "label": "initial forward P/E",
          "a": 30,
          "op": "/",
          "b": 2,
          "result": 15
        },
        {
          "label": "P/E after EPS decline",
          "a": 30,
          "op": "/",
          "b": 1.5,
          "result": 20
        },
        {
          "label": "EPS decline",
          "a": 2,
          "op": "-",
          "b": 1.5,
          "result": 0.5
        },
        {
          "label": "percentage EPS decline",
          "a": 0.5,
          "op": "/",
          "b": 2,
          "result": 0.25
        },
        {
          "label": "price multiple after EPS decline",
          "a": 30,
          "op": "/",
          "b": 1.5,
          "result": 20
        }
      ]
    },
    "questions": [
      {
        "q": "When would you use P/E rather than EV/EBITDA?",
        "a": "P/E is useful when earnings attributable to common equity are meaningful and capital structures are reasonably comparable or explicitly considered. EV/EBITDA is often useful for comparing operating businesses before financing, because enterprise value includes debt and equity claims while EBITDA is before interest. Neither works universally: P/E can be meaningless with negative or unusual earnings, and EBITDA ignores capital intensity, taxes, and working capital. I would choose the multiple that fits the business and question, use consistent periods and accounting definitions, and cross-check the result with cash flow and risk.",
        "mistake": "Pairing enterprise value with net income or treating EBITDA as cash flow."
      },
      {
        "q": "A stock stays at $30 while EPS falls from $2.00 to $1.50. What happens to forward P/E?",
        "a": "At $2.00 EPS, the forward P/E is 15x. At $1.50 EPS and unchanged share price, the ratio is 20x. The multiple expands because forecast earnings fell, not because investors bid the stock higher. I would determine why EPS declined—temporary timing, lower demand, margin compression, or another cause—and assess whether the estimate is still reliable. A higher P/E after an earnings cut can make the stock look more expensive, but valuation also depends on future recovery, growth, risk, and cash generation.",
        "mistake": "Interpreting a rising P/E as a price rally without checking the denominator."
      },
      {
        "q": "Why can a low-multiple company be a value trap?",
        "a": "A low multiple may reflect shrinking demand, deteriorating competitive advantage, high leverage, cyclically elevated earnings, governance concerns, or large reinvestment needs. If the denominator is near a peak or adjusted too favorably, the apparent discount can disappear when earnings normalize. I would test sustainable cash flow, balance-sheet resilience, industry structure, and the evidence required for a rerating. The question is whether expected risk-adjusted cash flows exceed what the current price implies, not whether a multiple is numerically below peers. A low price multiple can coexist with an elevated normalized valuation.",
        "mistake": "Assuming mean reversion to peer multiples without diagnosing why the discount exists."
      }
    ],
    "selfCheck": {
      "question": "At $30 per share and $1.50 forward EPS, what is forward P/E?",
      "answer": "$30/$1.50 = 20x."
    }
  },
  {
    "id": "equity-research-6",
    "title": "Management Calls",
    "track": "Equity Research",
    "explanation": "Management calls help analysts understand company strategy, operating drivers, capital allocation, and risks, but management statements are not independent verification. Prepare questions that address thesis-critical uncertainties and build on public disclosures. Open-ended prompts such as how pricing differs by customer cohort can reveal mechanisms; requests for confidential customer details or material nonpublic information are inappropriate. Listen for definitions, time periods, and qualifiers, and distinguish direct facts from interpretation. Ask follow-ups when an answer does not reconcile with filings or prior statements.\n\nDocument the date, participants, public information discussed, questions, answers, and any compliance steps required by firm policy. Compare management's language with reported results, customer behavior, industry data, and prior guidance; do not treat confidence or detail as proof. Calls may be group meetings, conferences, or individual discussions, each with different access and disclosure rules. An analyst should not selectively act on material nonpublic information and must follow applicable information barriers and research policies. Use the call to sharpen a forecast or identify what evidence to seek, not to obtain a private guarantee. In interviews, show how a question connects to the model and how the answer would change—or not change—the investment view. Policies, supervision, and legal requirements vary by firm and jurisdiction, so escalate compliance concerns rather than improvising.",
    "framework": "Thesis-critical uncertainty → open, non-leading question → record exact answer and context → compare with filings and independent evidence → update estimate or document no change. Separate disclosed fact, management view, and analyst judgment.",
    "example": {
      "assumptions": "Management guides to 10% revenue growth on a $200m current-year base; guidance period and revenue definition are assumed consistent; no acquisitions or currency change.",
      "steps": [
        "1. Growth rate is 10% = 0.10.",
        "2. Implied next-period revenue = $200m × (1 + 0.10) = $220m.",
        "3. Incremental revenue over the base = $220m − $200m = $20m.",
        "4. The analyst should confirm period, organic scope, currency, and assumptions before entering $220m as a model forecast; guidance is not a guaranteed outcome."
      ],
      "checks": [
        {
          "label": "growth factor",
          "a": 1,
          "op": "+",
          "b": 0.1,
          "result": 1.1
        },
        {
          "label": "implied revenue",
          "a": 200,
          "op": "*",
          "b": 1.1,
          "result": 220
        },
        {
          "label": "incremental revenue",
          "a": 220,
          "op": "-",
          "b": 200,
          "result": 20
        },
        {
          "label": "growth rate check",
          "a": 20,
          "op": "/",
          "b": 200,
          "result": 0.1
        }
      ]
    },
    "questions": [
      {
        "q": "What questions would you ask management to test a thesis about improving pricing?",
        "a": "I would ask how realized price changes vary by product, customer cohort, contract renewal, and geography; whether reported growth reflects price, mix, or volume; and what evidence management uses to assess retention after increases. I would clarify timing, concessions, and input-cost pass-through, then compare the answer with reported revenue, gross margins, customer commentary, and channel evidence. The goal is to understand a causal driver, not solicit a promise. I would document the response and update my estimate only if evidence supports a change.",
        "mistake": "Asking management whether it can raise prices and treating an optimistic answer as proof of pricing power."
      },
      {
        "q": "How do you handle an answer that seems inconsistent with a prior filing?",
        "a": "I would ask a neutral follow-up to clarify the definition, period, or scope, then compare the response with the public filing and other available evidence. I would note the discrepancy without making an unsupported accusation, and assess whether it changes my forecast or confidence in disclosure quality. If the answer could involve material nonpublic information or another compliance issue, I would follow firm procedures and escalate it rather than trade or circulate it. The record should preserve what was said and the context in which it was provided.",
        "mistake": "Silently changing an estimate based on an unclear answer or ignoring a potentially material inconsistency."
      },
      {
        "q": "Why should analysts avoid treating management guidance as a fact?",
        "a": "Guidance is management's current expectation based on assumptions that can change; actual results depend on demand, pricing, execution, currency, and other factors. I would record the metric, period, range, and conditions, compare guidance with historical delivery and external indicators, and decide whether the forecast is credible. It is valuable evidence, but the analyst remains responsible for an independent estimate. If guidance is vague or non-GAAP, I would clarify its definition and reconcile it to reported measures where possible. The model-to-guidance gap should be explained, not concealed.",
        "mistake": "Copying a guidance midpoint into the model without checking period, definition, or independent evidence."
      }
    ],
    "selfCheck": {
      "question": "What revenue does 10% growth imply on a $200m base, and what must be confirmed before forecasting it?",
      "answer": "$220m. Confirm the period, scope, currency, organic versus acquired growth, and definition; guidance remains an estimate."
    }
  },
  {
    "id": "equity-research-7",
    "title": "Channel Checks",
    "track": "Equity Research",
    "explanation": "Channel checks gather observations from customers, suppliers, distributors, competitors, or other market participants to test an investment hypothesis. They can help reveal demand, pricing, inventory, product adoption, or competitive behavior before those signals appear in company results. The method is most useful when the question is narrow and the sample, source, and time period are understood. A distributor's order pattern may differ from end-customer consumption; a supplier may see only part of the market. Record what was directly observed versus inferred and ask about alternative explanations.\n\nChannel checks are rarely random samples, so do not extrapolate a few conversations into a precise market-wide statistic. Note participant selection, geography, role, timing, incentives, and possible bias. Triangulate with filings, shipment data, public commentary, web traffic, and other independent indicators where appropriate. Protect confidentiality and comply with firm policies; never solicit material nonpublic information or share restricted details. Conflicting checks can be informative if they reveal segmentation or a change in inventory. In an interview, explain the hypothesis, the questions, how you would select sources, and how the results would alter estimates. If evidence is weak, say it raises a question rather than proves a conclusion. Third-party data limitations and applicable rules vary, so maintain clear sourcing and avoid presenting unverified anecdotes as established fact.",
    "framework": "Hypothesis → source and sample selection → consistent questions and period → observation versus inference → triangulation → model implication and confidence. Nonrandom checks describe respondents, not automatically the full population.",
    "example": {
      "assumptions": "Five nonrandom retailer conversations; three report slower orders during the same month; treat only as a sample description, not a market estimate.",
      "steps": [
        "1. Respondents reporting slower orders = 3 of 5.",
        "2. Sample proportion = 3 ÷ 5 = 60% of these interviewed retailers.",
        "3. The other 2 of 5, or 40%, did not report slower orders; the sample is mixed.",
        "4. Because selection is nonrandom and small, do not claim that 60% of all retailers experienced a slowdown; compare with independent sales and inventory data."
      ],
      "checks": [
        {
          "label": "reported slower orders share",
          "a": 3,
          "op": "/",
          "b": 5,
          "result": 0.6
        },
        {
          "label": "other respondents share",
          "a": 2,
          "op": "/",
          "b": 5,
          "result": 0.4
        },
        {
          "label": "respondent count",
          "a": 3,
          "op": "+",
          "b": 2,
          "result": 5
        },
        {
          "label": "respondent difference",
          "a": 3,
          "op": "-",
          "b": 2,
          "result": 1
        }
      ]
    },
    "questions": [
      {
        "q": "How would you design channel checks to test whether demand is slowing?",
        "a": "I would define the demand indicator and period first, then select independent participants across relevant customer types, regions, and distribution channels. Questions would distinguish orders, sell-through, inventory, cancellations, pricing, and customer traffic rather than ask whether business is 'good.' I would record selection method, respondent role, dates, and exact observations, then compare them with filings, shipment data, and company disclosures. I would not extrapolate a convenience sample into a population percentage. Conflicting results may indicate different customer segments or channel inventory dynamics that deserve separate forecasts.",
        "mistake": "Asking leading questions or interpreting a handful of anecdotes as representative market statistics."
      },
      {
        "q": "Three of five retailers report slower orders. What can you conclude?",
        "a": "I can say that three of the five interviewed retailers reported slower orders during the specified period, which is 60% of this sample. Because the sample is small and nonrandom, I cannot infer that 60% of all retailers see a slowdown. I would inspect who was interviewed, whether the remaining two saw stable or faster orders, and whether the sample spans customers and regions. I would seek independent sales, inventory, and company data before revising the model. The check raises a question; it does not establish a population statistic.",
        "mistake": "Converting a nonrandom sample proportion into a market-wide estimate or invented industry statistic."
      },
      {
        "q": "How should you handle conflicting feedback from distributors and end customers?",
        "a": "I would determine whether they describe different stages of the channel: distributors may be replenishing inventory while end customers consume existing stock, or orders may be affected by lead times. I would align the reporting periods, geography, product, and definitions, then ask about shipments, sell-through, returns, and inventory days. The disagreement may reveal a timing effect rather than one source being wrong. I would triangulate with company disclosures and independent data and reflect uncertainty in scenarios rather than choose the source that supports my prior view.",
        "mistake": "Treating orders, shipments, sell-through, and end demand as interchangeable measures."
      }
    ],
    "selfCheck": {
      "question": "What does 3 of 5 retailer interviews support you saying—and what does it not establish?",
      "answer": "It supports saying 60% of that interviewed sample reported slower orders; it does not establish the share of all retailers."
    }
  },
  {
    "id": "equity-research-8",
    "title": "Report Writing",
    "track": "Equity Research",
    "explanation": "An equity research report should make the investment conclusion clear while showing the evidence and assumptions behind it. Lead with the rating or view under the firm's framework, target price or valuation range, time horizon, and the principal reason the market may be mispricing the security. Explain the business drivers, forecast revisions, valuation method, catalysts, and material risks in a logical sequence. A reader should be able to trace a conclusion from source evidence through assumptions to earnings and valuation. Distinguish reported data, company guidance, analyst estimates, and third-party information.\n\nCharts need dates, units, definitions, and sources; percentages should use a clear denominator and period. Explain adjusted metrics and reconcile them to reported measures. A target price is an estimate, not a promise; disclose the key assumptions and sensitivity. Include risks that could change the rating, not generic warnings that add no analytical value. Follow research independence, review, disclosure, and conflict procedures established by the firm and applicable regulation. Write for the intended audience: define technical terms without flattening complexity. Before publication, verify figures against the model and source materials, proofread tables, and ensure the written thesis matches the rating and valuation. In an interview, describe how you would communicate one differentiated conclusion and its uncertainty in a concise opening paragraph. Firm formats and required disclosures vary by jurisdiction and employer.",
    "framework": "Conclusion → variant evidence → forecast bridge → valuation and target → catalyst/time horizon → key risks and invalidation → disclosures and sources. Label estimate versus reported fact and make every chart reproducible.",
    "example": {
      "assumptions": "Current share price $20; target price $24; one-year horizon; no expected dividend, taxes, or transaction costs; price upside only.",
      "steps": [
        "1. Target-price difference = $24 − $20 = $4/share.",
        "2. Price upside = $4 ÷ $20 = 20% over the stated horizon.",
        "3. If a $1 dividend is expected, simple total return becomes ($24 − $20 + $1) ÷ $20 = 25% before tax and costs.",
        "4. The report should label whether the 20% figure is price upside or the 25% illustration includes distributions, and identify valuation assumptions."
      ],
      "checks": [
        {
          "label": "price difference",
          "a": 24,
          "op": "-",
          "b": 20,
          "result": 4
        },
        {
          "label": "price upside",
          "a": 4,
          "op": "/",
          "b": 20,
          "result": 0.2
        },
        {
          "label": "return including dividend dollars",
          "a": 4,
          "op": "+",
          "b": 1,
          "result": 5
        },
        {
          "label": "total return",
          "a": 5,
          "op": "/",
          "b": 20,
          "result": 0.25
        }
      ]
    },
    "questions": [
      {
        "q": "What should the opening paragraph of a research report communicate?",
        "a": "It should state the investment view or rating under the applicable framework, the target or valuation range and horizon, and the key differentiated reason for the conclusion. The reader should understand what changed, what evidence supports the forecast, and what risk could invalidate it before reading the detail. I would avoid starting with a long company history. The opening should be consistent with the model, disclosures, and formal rating definitions, and it should distinguish an analyst estimate from a company-reported fact or promised outcome.",
        "mistake": "Writing a broad company overview before stating the investment conclusion and its central evidence."
      },
      {
        "q": "How do you make a target-price calculation transparent to readers?",
        "a": "I identify the valuation method, forecast period, operating metric, selected multiple or discount rate, and bridge from enterprise value to equity value per share. I state current price, target, horizon, and whether the return includes distributions. In the example, a $24 target against $20 is 20% price upside, while adding a $1 dividend gives 25% simple total return. I would disclose sensitivity and risks, source the inputs, and make clear that the target is an estimate subject to uncertainty, not a promised trading level.",
        "mistake": "Reporting an upside percentage without stating the denominator, horizon, dividends, or valuation basis."
      },
      {
        "q": "What checks do you perform before publishing a report?",
        "a": "I tie financial figures to filings and the approved model, check periods, units, signs, and rounding, and verify that text and charts tell the same story. I review source citations, rating definitions, target-price math, sensitivity, disclosures, and potential conflicts under the firm's process. I would confirm that reported facts, third-party data, company statements, and analyst estimates are labeled distinctly. A second reviewer can catch inconsistencies, but the analyst remains responsible for the conclusion and evidence. Publication controls and regulatory disclosures differ across firms and jurisdictions.",
        "mistake": "Proofreading prose while failing to reconcile a chart, target, or rating with the underlying model."
      }
    ],
    "selfCheck": {
      "question": "At $20 current price and $24 target, what is price upside before dividends?",
      "answer": "($24 − $20)/$20 = 20% for the stated target and horizon."
    }
  },
  {
    "id": "equity-research-9",
    "title": "Investment Ratings",
    "track": "Equity Research",
    "explanation": "An investment rating communicates an analyst's relative view on a security under a defined framework. The framework may compare expected total return with a benchmark, peers, or absolute threshold over a stated horizon; rating labels and thresholds differ by firm. To interpret a rating, readers need current price, target, expected distributions, time horizon, risk, and the benchmark or definition. A rating is an opinion based on assumptions, not a guarantee that the stock will reach a target or outperform.\n\nExpected total return can be approximated by target-price change plus expected distributions divided by current price, before costs and taxes. For a risk-aware recommendation, compare expected return with uncertainty, downside, liquidity, and the client's or fund's mandate where relevant. Ratings should be updated when valuation, fundamentals, catalysts, or risks change. A target price may move even if the rating remains unchanged, and vice versa, depending on the framework. Research analysts should follow independence, disclosure, and review rules; specific regulatory definitions and required disclosures vary by jurisdiction. In interviews, state the rating framework rather than assuming universal meaning for Buy, Hold, or Sell. Explain what evidence would change the view and distinguish the rating from a personalized recommendation, especially when discussing brokerage or advisory capacity.",
    "framework": "Simple expected total return = (target price − current price + expected distributions) ÷ current price. Compare with the firm's stated benchmark, threshold, horizon, and risk framework; categories are firm-specific.",
    "example": {
      "assumptions": "Current share price $50, target $55, expected one-year dividend $1; simple price-plus-distribution return before taxes, fees, or probability weighting.",
      "steps": [
        "1. Price appreciation = $55 target − $50 current = $5.",
        "2. Add expected dividend of $1: total expected dollars = $6 per share.",
        "3. Expected simple total return = $6 ÷ $50 = 12% over one year.",
        "4. Whether 12% maps to a rating depends on the firm's benchmark, risk definition, and rating horizon; no universal label follows from this arithmetic."
      ],
      "checks": [
        {
          "label": "price appreciation",
          "a": 55,
          "op": "-",
          "b": 50,
          "result": 5
        },
        {
          "label": "total dollar return",
          "a": 5,
          "op": "+",
          "b": 1,
          "result": 6
        },
        {
          "label": "simple total return",
          "a": 6,
          "op": "/",
          "b": 50,
          "result": 0.12
        },
        {
          "label": "price upside only",
          "a": 5,
          "op": "/",
          "b": 50,
          "result": 0.1
        }
      ]
    },
    "questions": [
      {
        "q": "What information do you need to interpret a Buy rating?",
        "a": "I need the firm's definition of Buy, the relevant benchmark or return threshold, forecast horizon, current price, target or expected return, and material risks. The same label can mean different things across research frameworks, and a rating is not a guarantee. I would read the rationale, valuation assumptions, distributions, catalysts, and downside case, then assess whether new evidence changes the view. Regulatory disclosures and rating histories may also matter, with requirements varying by jurisdiction. I would not translate an analyst rating into a personalized recommendation without considering client circumstances and role.",
        "mistake": "Assuming a rating label has a universal threshold or means the stock will rise immediately."
      },
      {
        "q": "Calculate simple expected total return for a $50 stock with a $55 target and $1 dividend.",
        "a": "Price appreciation is $5 per share. Adding the expected $1 dividend gives $6 total dollars per share, and $6 divided by the $50 current price equals 12% simple one-year total return before costs, taxes, or probability weighting. Price upside alone is 10%. I would state the horizon and dividend assumption, then compare the result with the firm's rating framework and risk assessment. The calculation does not imply that the target or dividend is certain to occur. Scenario probabilities still affect expected value.",
        "mistake": "Calling the 12% a guaranteed return or omitting the dividend and time-horizon assumptions."
      },
      {
        "q": "Can the target price rise while the rating remains unchanged?",
        "a": "Yes. A rating depends on the firm's relative framework, expected return, benchmark, horizon, and risk—not only the absolute target. If the share price rises alongside the target, expected upside may remain similar; if the benchmark or risk assessment changes, the rating may also change. A target can be revised because forecasts or valuation assumptions move without crossing a rating threshold. I would explain both outputs and their definitions rather than infer rating direction from target-price direction alone. A benchmark-relative threshold may stay unchanged.",
        "mistake": "Assuming every target-price increase automatically requires an upgrade."
      }
    ],
    "selfCheck": {
      "question": "With $50 current price, $55 target, and $1 expected distribution, what is simple total return?",
      "answer": "($55 − $50 + $1)/$50 = 12%, before costs, taxes, and uncertainty."
    }
  },
  {
    "id": "equity-research-10",
    "title": "Sector Expertise",
    "track": "Equity Research",
    "explanation": "Sector expertise is the ability to understand how a particular industry's business models convert customer demand and assets into sustainable cash flow. Learn the value chain, key customer groups, supplier constraints, competitors, regulation, technology, and capital cycle. Identify the operating metrics that lead reported results: units shipped, utilization, backlog, churn, pricing, inventory, yields, or reimbursement, depending on the sector. Know how seasonality, commodity exposure, and capacity affect margins. A sector specialist can distinguish structural growth from a temporary rebound and recognize when a familiar company is changing its economics.\n\nExpertise is not a license to rely on intuition; it should improve the questions, model drivers, and interpretation of evidence. Track company-specific positioning and the basis for market-share estimates. Understand accounting measures and non-GAAP conventions used in the industry, while reconciling them to reported results. A useful sector map identifies winners, vulnerable business models, customer bargaining power, and where profits accrue. Maintain a learning agenda because technologies, competitors, and policy can alter the landscape. In interviews, demonstrate depth through a specific operating mechanism and financial consequence, then explain a counterargument. Sector conclusions should remain within public information and compliant research practices; specialist knowledge does not justify unsupported claims or access to confidential data.",
    "framework": "Sector map: value chain → customer and supplier economics → operating indicators → competitive position → cycle/regulatory forces → financial model transmission → disconfirming evidence.",
    "example": {
      "assumptions": "Manufacturer sells 1,000 units at $200; variable cost $140 per unit; fixed costs $30,000; price and unit cost stay constant; ignore taxes and other items.",
      "steps": [
        "1. Contribution per unit = $200 price − $140 variable cost = $60.",
        "2. Total contribution = 1,000 × $60 = $60,000.",
        "3. Operating income after $30,000 fixed costs = $60,000 − $30,000 = $30,000.",
        "4. At 1,100 units, contribution is $66,000 and operating income is $36,000; the $6,000 increase illustrates operating leverage under these assumptions."
      ],
      "checks": [
        {
          "label": "contribution per unit",
          "a": 200,
          "op": "-",
          "b": 140,
          "result": 60
        },
        {
          "label": "total contribution",
          "a": 1000,
          "op": "*",
          "b": 60,
          "result": 60000
        },
        {
          "label": "operating income",
          "a": 60000,
          "op": "-",
          "b": 30000,
          "result": 30000
        },
        {
          "label": "operating income after volume growth",
          "a": 1100,
          "op": "*",
          "b": 60,
          "result": 66000
        },
        {
          "label": "contribution at 1,100 units",
          "a": 1100,
          "op": "*",
          "b": 60,
          "result": 66000
        },
        {
          "label": "operating income at 1,100 units",
          "a": 66000,
          "op": "-",
          "b": 30000,
          "result": 36000
        }
      ]
    },
    "questions": [
      {
        "q": "How would you demonstrate genuine expertise in a sector during an interview?",
        "a": "I would explain the industry's value chain and identify the customer, pricing, capacity, and cost drivers that determine profit. Then I would connect one current operating indicator—such as utilization, backlog, churn, or inventory—to a forecast line and valuation consequence. I would distinguish structural trends from the cycle, cite public evidence, and present a counterargument or disconfirming signal. Sector expertise means knowing which questions matter and how evidence flows into economics, not memorizing company descriptions or claiming unsupported access to industry information.",
        "mistake": "Listing market buzzwords without showing how an operating driver changes cash flow or risk."
      },
      {
        "q": "Why can volume growth create a disproportionate increase in operating income?",
        "a": "When contribution per unit is positive and fixed costs do not rise immediately, incremental volume adds contribution against an established cost base. In the example, each unit contributes $60 after variable cost. At 1,000 units, contribution is $60,000 and operating income after $30,000 fixed cost is $30,000. At 1,100 units, contribution becomes $66,000 and operating income $36,000, a 20% increase on a 10% unit increase. This operating leverage works in reverse when volume falls and depends on capacity, mix, and cost assumptions.",
        "mistake": "Extrapolating the margin benefit without checking fixed-cost step-ups, capacity, or changes in product mix."
      },
      {
        "q": "How do you determine whether an industry trend is structural or cyclical?",
        "a": "I compare the trend with historical cycles and identify the underlying mechanism: technology substitution, demographic change, regulation, capacity investment, inventory swings, or temporary demand. I look for evidence across customers, suppliers, company results, pricing, and utilization, and assess whether the trend persists through different market conditions. I then model structural and cyclical cases separately and state what data would falsify each. A short sample or a single management quote rarely establishes a permanent change, so I avoid projecting a recent acceleration indefinitely.",
        "mistake": "Extrapolating one favorable quarter or industry headline as a permanent growth rate."
      }
    ],
    "selfCheck": {
      "question": "At $60 contribution per unit and $30,000 fixed costs, what operating income results at 1,000 units?",
      "answer": "Contribution is $60,000; after $30,000 fixed costs, operating income is $30,000."
    }
  }
];
