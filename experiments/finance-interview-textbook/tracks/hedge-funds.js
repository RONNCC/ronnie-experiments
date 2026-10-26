export default [
  {
    "id": "hedge-funds-1",
    "title": "Financial Modeling",
    "track": "Hedge Funds",
    "explanation": "A public-equity model expresses an investment view as a connected set of operating assumptions. Begin with how the company earns revenue: units and price, customers and spend, capacity and utilization, or another driver tied to the business. Forecast segment revenue where economics differ, then estimate gross margin, operating expenses, taxes, interest, and diluted shares to derive earnings. Build working capital, capex, and depreciation schedules to understand cash conversion; net income alone may not capture the company's ability to reinvest or return capital. Reconcile historical results to filings and separate reported figures from adjusted metrics.\n\nThe model should answer what must happen for the thesis to work. Use base, upside, and downside cases with linked assumptions—for example, lower volume may reduce utilization and margins, not simply revenue. Make the forecast period and fiscal-year conventions explicit, and check seasonality, acquisitions, share count, and stock compensation. A valuation tab can translate operating outcomes into DCF or multiples, while sensitivities show the impact of growth, margins, and discount rates. The purpose is not to produce a precise point estimate from uncertain assumptions; it is to reveal sensitivities, expectations, and the conditions under which the market's view may change. A credible model is reproducible, source-linked, and sufficiently simple that an interviewer can trace each major driver.",
    "framework": "Revenue = volume × price, customers × average revenue per customer, or another causal driver. Gross profit = revenue × gross margin. Operating income = gross profit − operating expenses. Bridge earnings to cash with working capital, capex, and noncash charges.",
    "example": {
      "assumptions": "Fictional manufacturer sells 2m units at $50 per unit; gross margin 30%; operating costs $20m; ignore other revenue, interest, and tax for operating-income illustration.",
      "steps": [
        "1. Revenue = 2m units × $50 = $100m.",
        "2. Gross profit = $100m × 30% = $30m.",
        "3. Operating income = $30m gross profit − $20m operating costs = $10m.",
        "4. If volume rises 10% to 2.2m units at unchanged price and margin, revenue is $110m and gross profit is $33m; fixed-cost behavior determines the resulting operating income."
      ],
      "checks": [
        {
          "label": "revenue",
          "a": 2,
          "op": "*",
          "b": 50,
          "result": 100
        },
        {
          "label": "gross profit",
          "a": 100,
          "op": "*",
          "b": 0.3,
          "result": 30
        },
        {
          "label": "operating income",
          "a": 30,
          "op": "-",
          "b": 20,
          "result": 10
        },
        {
          "label": "revenue after volume growth",
          "a": 2.2,
          "op": "*",
          "b": 50,
          "result": 110
        },
        {
          "label": "gross profit after volume growth",
          "a": 110,
          "op": "*",
          "b": 0.3,
          "result": 33
        },
        {
          "label": "operating income after volume growth",
          "a": 33,
          "op": "-",
          "b": 20,
          "result": 13
        }
      ]
    },
    "questions": [
      {
        "q": "Walk me through how you would build a financial model for a public company you cover.",
        "a": "I would reconcile historical results to filings and identify the company's core revenue drivers, such as units and pricing or customers and average spend. I would forecast segments, margins, operating expenses, taxes, and diluted shares, then build working-capital, capex, and depreciation schedules to bridge earnings into cash. Assumptions should reflect seasonality, capacity, customer behavior, and management guidance without blindly extrapolating it. I would connect the forecast to valuation, build coherent upside and downside cases, and make the two or three assumptions that drive the thesis easy to sensitize and defend.",
        "mistake": "Projecting revenue with a single growth rate while ignoring units, price, mix, and capacity."
      },
      {
        "q": "How would a 10% unit increase flow through a model if price and gross margin stay constant?",
        "a": "At a constant $50 price, 2.0m units produce $100m revenue; 2.2m units produce $110m, a $10m increase. At a 30% gross margin, gross profit rises from $30m to $33m, a $3m increase, before operating expenses. If some expenses are fixed, incremental operating income may increase by more than a proportional amount; if costs scale with volume, the effect differs. I would model variable and fixed costs separately and test whether production capacity, inventory, and working capital support the higher unit volume.",
        "mistake": "Applying the 10% revenue growth directly to operating income without cost behavior assumptions."
      },
      {
        "q": "What checks tell you a forecast is economically coherent?",
        "a": "I look for unit and price assumptions that reconcile to revenue, margins that reflect input costs and mix, and working capital that is consistent with sales and collection terms. Capex and depreciation should fit capacity needs; share count, taxes, and debt should roll forward logically. I compare forecast trends with historical ranges and management disclosures, then inspect scenarios for plausible interactions. A model can balance mathematically while being economically implausible, so I would explain the mechanism behind each material change and note which inputs are uncertain.",
        "mistake": "Assuming spreadsheet integrity checks validate the business assumptions themselves."
      }
    ],
    "selfCheck": {
      "question": "At 2.2m units and $50 per unit, with a 30% gross margin, what are revenue and gross profit?",
      "answer": "Revenue is $110m and gross profit is $33m, before operating expenses."
    }
  },
  {
    "id": "hedge-funds-2",
    "title": "Valuation",
    "track": "Hedge Funds",
    "explanation": "Equity valuation estimates what a security may be worth under explicit assumptions; it does not reveal an objectively certain price. A discounted cash flow can value operating assets from unlevered cash flows and WACC or value equity directly from cash flows available to shareholders and a cost of equity. Comparable multiples offer a market-based cross-check, but the peer group and denominator must fit the company's growth, risk, accounting, and capital structure. Price-to-earnings pairs equity price with earnings per share; EV/EBITDA pairs enterprise value with a pre-interest operating measure.\n\nFor enterprise valuation, bridge to common equity by subtracting debt and other senior claims, adding cash and non-operating assets, and dividing by diluted shares. For a per-share DCF, use diluted shares consistent with the valuation date and account for options or convertibles as appropriate. Build scenarios around revenue, margins, reinvestment, discount rates, and terminal assumptions; avoid hiding uncertainty behind a single target. Reverse valuation can be useful: solve for the growth or margin expectations implied by today's price, then compare them with evidence. Market multiples are relative pricing tools, not proof of intrinsic worth, and reported adjusted earnings require scrutiny. In an interview, name the valuation method, assumptions, and bridge, then explain what evidence could make your estimate wrong.",
    "framework": "Equity value = EV − debt − other senior claims + cash + non-operating assets. Per-share value = equity value ÷ diluted shares. P/E = share price ÷ EPS; EV/EBITDA = enterprise value ÷ EBITDA.",
    "example": {
      "assumptions": "Illustrative company EV $500m, debt $80m, cash $20m, 40m diluted shares; ignore other claims, options, and non-operating assets.",
      "steps": [
        "1. Equity value = $500m EV − $80m debt + $20m cash = $440m.",
        "2. Per-share value = $440m ÷ 40m diluted shares = $11.00.",
        "3. If diluted shares increase to 44m, value per share at unchanged equity value is $440m ÷ 44m = $10.00.",
        "4. The $1.00 difference shows why share-count dilution belongs in a per-share conclusion even when enterprise value is unchanged."
      ],
      "checks": [
        {
          "label": "equity value after debt",
          "a": 500,
          "op": "-",
          "b": 80,
          "result": 420
        },
        {
          "label": "equity value after cash",
          "a": 420,
          "op": "+",
          "b": 20,
          "result": 440
        },
        {
          "label": "per-share value",
          "a": 440,
          "op": "/",
          "b": 40,
          "result": 11
        },
        {
          "label": "diluted per-share value",
          "a": 440,
          "op": "/",
          "b": 44,
          "result": 10
        }
      ]
    },
    "questions": [
      {
        "q": "Walk me through the bridge from enterprise value to equity value per share.",
        "a": "I start with enterprise value for operating assets, subtract debt and other senior claims, and add cash and non-operating assets to arrive at common equity value. I then divide by diluted shares, accounting for relevant options, convertibles, or other dilution under an appropriate method. The valuation date and balance-sheet figures should align with the operating value. In the example, $500m EV less $80m debt plus $20m cash equals $440m equity; with 40m diluted shares, that is $11 per share. I would separately test share-count sensitivity and other claims.",
        "mistake": "Dividing enterprise value by shares without removing debt or adding cash."
      },
      {
        "q": "Why might a company trade at a lower P/E than peers?",
        "a": "A lower P/E may reflect lower expected growth, weaker returns on capital, more volatile earnings, leverage, governance concerns, cyclicality, or accounting quality—not just mispricing. I would verify that earnings periods and adjustments match, examine the peer set, and assess whether the market's risk discount is justified. I would also compare cash generation and reinvestment needs rather than focusing on EPS alone. If my thesis is that expectations are too pessimistic, I need evidence that the fundamental driver can improve and a plausible catalyst for investors to recognize it.",
        "mistake": "Calling a low P/E cheap without diagnosing why the market applies a discount."
      },
      {
        "q": "How can you use a stock's current price to test your model?",
        "a": "I can reverse-engineer the growth, margin, or cash-flow assumptions required to justify the current price, then compare those expectations with company capacity, historical performance, customer evidence, and market conditions. This reframes valuation from 'my target versus price' into 'what must be true for price to be fair.' It also highlights where my variant view matters. The reverse calculation depends on the model structure and discount assumptions, so I would show a range and identify which input the market appears to be discounting rather than claim a unique implied forecast.",
        "mistake": "Treating a reverse-DCF output as the market's literal forecast despite uncertain discount rates and terminal assumptions."
      }
    ],
    "selfCheck": {
      "question": "With $440m equity value and 40m diluted shares, what is value per share?",
      "answer": "$440m ÷ 40m = $11.00 per diluted share."
    }
  },
  {
    "id": "hedge-funds-3",
    "title": "Investment Thesis",
    "track": "Hedge Funds",
    "explanation": "An investment thesis explains why a security's price and the analyst's estimate of value differ, what evidence supports that gap, and how the view could be wrong. Start with the market's embedded expectations and identify a variant perception: perhaps consensus underestimates retention, margins, reinvestment needs, regulatory exposure, or cyclicality. Use company filings, industry data, customer evidence, and financial modeling to test the mechanism. A narrative such as 'the company is high quality' is not a thesis until it predicts measurable outcomes that differ from expectations.\n\nTranslate the view into valuation and a time horizon. Identify catalysts—earnings, product launches, contract renewals, policy shifts—or explain why fundamental change may become visible gradually. Estimate upside, downside, distributions, and probability-weighted outcomes, while recognizing that probabilities are uncertain. Define disconfirming evidence in advance, such as churn, pricing, cash conversion, or a delayed milestone. Position size and hedges should reflect liquidity, volatility, portfolio exposure, and loss capacity. A correct long-term view can still lose money if timing, financing, or market expectations move against it. Keep facts, estimates, and judgments distinct, and update the thesis when evidence changes rather than defend an old target. Interviewers want a reasoned, falsifiable claim and a clear risk plan, not certainty or an anecdote.",
    "framework": "Variant perception → evidence and causal mechanism → consensus gap → valuation and time horizon → catalyst or recognition path → upside/downside → disconfirming evidence and position review trigger.",
    "example": {
      "assumptions": "Buy at $40/share; one-year value case $48; expected dividend $1; downside case $32; ignore taxes, costs, and probability weighting.",
      "steps": [
        "1. Price appreciation in the value case = $48 − $40 = $8 per share.",
        "2. Add $1 expected dividend: total expected dollar return is $9/share.",
        "3. Simple holding-period return = $9 ÷ $40 = 22.5% before costs.",
        "4. Downside loss to $32 = $40 − $32 = $8/share, or 20% of entry; the thesis needs evidence for both paths and a stated horizon."
      ],
      "checks": [
        {
          "label": "price upside",
          "a": 48,
          "op": "-",
          "b": 40,
          "result": 8
        },
        {
          "label": "total return dollars",
          "a": 8,
          "op": "+",
          "b": 1,
          "result": 9
        },
        {
          "label": "holding-period return",
          "a": 9,
          "op": "/",
          "b": 40,
          "result": 0.225
        },
        {
          "label": "downside percentage",
          "a": 8,
          "op": "/",
          "b": 40,
          "result": 0.2
        }
      ]
    },
    "questions": [
      {
        "q": "Pitch an investment thesis in a company you follow.",
        "a": "I would state the position, time horizon, and the market expectation I believe is wrong. Then I would explain the business mechanism and evidence supporting my view, quantify the implications in revenue, margins, cash flow, or valuation, and identify what could make the market reassess. I would show base and downside outcomes, including distributions and the risks of timing or liquidity. Finally, I would name specific evidence that would disconfirm the thesis and describe how I would resize or exit. The strongest pitch is differentiated but falsifiable, not a sequence of favorable facts.",
        "mistake": "Delivering a company overview without explaining the variant expectation or what changes price."
      },
      {
        "q": "What evidence would cause you to change your mind about a long position?",
        "a": "I define disconfirming evidence before entering: for example, customer retention falling below the level required by the model, deteriorating unit economics, or a key product failing a measurable adoption milestone. I would distinguish a thesis break from normal volatility or one noisy quarter, then update the forecast and expected payoff when reliable evidence arrives. If the original valuation depended on a growth assumption that no longer holds, position size should change even if the share price has not reached a stop. A documented review trigger prevents confirmation bias from turning conviction into stubbornness.",
        "mistake": "Using only the stock price as a thesis test while ignoring fundamental evidence."
      },
      {
        "q": "How would you estimate expected return when the outcome is uncertain?",
        "a": "I would define a small set of coherent scenarios, estimate their values and timing, include expected dividends or other distributions, and assign probabilities only when I can defend them. For simple one-period outcomes, probability-weighted payoff is the sum of each scenario's probability times its return; costs and financing should be included where material. I would show the range and downside separately because expected value can conceal a severe tail loss. The probabilities are judgments, not facts, and should be revisited as evidence changes. I would avoid false precision in a single expected-return number.",
        "mistake": "Giving precise scenario probabilities without evidence or presenting expected return as a guaranteed outcome."
      }
    ],
    "selfCheck": {
      "question": "At $40 entry, $48 value, and $1 dividend, what simple one-year return is implied before costs?",
      "answer": "($48 − $40 + $1)/$40 = 22.5%."
    }
  },
  {
    "id": "hedge-funds-4",
    "title": "Stock Pitching",
    "track": "Hedge Funds",
    "explanation": "A stock pitch compresses an investment case into a decision-ready argument. Open with long or short, security, horizon, and the main source of expected return. Explain the business only to the extent it supports a differentiated view: what the market expects, what you believe instead, and why the evidence is credible. Move from operating drivers to earnings and valuation, then identify a catalyst or recognition path. A pitch should not be a company biography or a list of ratios; it should explain the causal link between new information and a change in investor expectations.\n\nShow the entry price, target or scenario range, distributions, downside, and expected holding period. Explain how the chosen instrument expresses the view and what liquidity, borrow, volatility, or event risks apply. Use a concise model with assumptions that can be challenged, and acknowledge the weakest part of the case. Close with what would invalidate the thesis and how position size relates to loss capacity. The upside/downside ratio is a simple descriptive measure, not a probability-adjusted expected return. An interviewer may challenge the consensus view, valuation, catalyst, or a short thesis's squeeze risk; respond with evidence and quantify rather than becoming defensive. Firm-specific pitch formats differ, but clarity and transparent uncertainty are widely expected.",
    "framework": "Recommendation → variant view → evidence and operating bridge → valuation/scenarios → catalyst and timing → downside and thesis break → position and risk plan.",
    "example": {
      "assumptions": "Long pitch at $25/share; target $32; downside case $20; no dividend or costs; simple price-only scenarios.",
      "steps": [
        "1. Target upside = $32 − $25 = $7/share.",
        "2. Percentage upside = $7 ÷ $25 = 28%.",
        "3. Downside = $25 − $20 = $5/share, equal to 20% of entry price.",
        "4. Upside-to-downside magnitude ratio = $7 ÷ $5 = 1.4x; this is not expected return without probabilities and timing."
      ],
      "checks": [
        {
          "label": "upside dollars",
          "a": 32,
          "op": "-",
          "b": 25,
          "result": 7
        },
        {
          "label": "upside percent",
          "a": 7,
          "op": "/",
          "b": 25,
          "result": 0.28
        },
        {
          "label": "downside dollars",
          "a": 25,
          "op": "-",
          "b": 20,
          "result": 5
        },
        {
          "label": "upside/downside",
          "a": 7,
          "op": "/",
          "b": 5,
          "result": 1.4
        }
      ]
    },
    "questions": [
      {
        "q": "Give me a concise stock pitch with a clear risk/reward profile.",
        "a": "I would identify the security, direction, horizon, and variant view first, then support it with evidence that changes the forecast or valuation. I would show how the operating thesis reaches a target price, identify a catalyst and timing, and quantify a plausible downside case. At $25 entry, a $32 target offers 28% price upside while $20 downside represents a 20% loss, before dividends and costs. That ratio alone is not a recommendation; I would explain probabilities, liquidity, position size, and the event that would make me exit or revise the view.",
        "mistake": "Quoting a target upside without stating a downside case, horizon, or thesis-invalidating evidence."
      },
      {
        "q": "What is the difference between a catalyst and a reason a stock is mispriced?",
        "a": "Mispricing describes the gap between price and my estimate of value; a catalyst is a potential event or evidence path that could change expectations or perceived risk. A company can be undervalued without an imminent catalyst, which creates timing risk. A scheduled earnings release is not automatically a catalyst if the result is already expected. I would explain what the market currently discounts, what observable outcome could surprise it, when that outcome may occur, and why investors might revise estimates. The catalyst supports recognition; the thesis still needs fundamental value evidence.",
        "mistake": "Listing a calendar event as a catalyst without describing the expectation gap or likely price mechanism."
      },
      {
        "q": "How would you defend your short pitch if the company has strong recent momentum?",
        "a": "I would separate price momentum from the fundamental assumptions embedded in valuation, then show which data support my short thesis and what could keep the rally going. Short risk is asymmetric: price can rise sharply, borrow can become costly or unavailable, and timing can be wrong even if fundamentals weaken. I would quantify downside and squeeze scenarios, monitor borrow and liquidity, and size the position accordingly. If the thesis depends on a near-term catalyst, I would specify what happens if the event is delayed or the result beats expectations instead of treating optimism as irrational by default.",
        "mistake": "Ignoring short squeeze, borrow, recall, and timing risk because valuation appears stretched."
      }
    ],
    "selfCheck": {
      "question": "At $25 entry with $32 target and $20 downside, what are percentage upside and downside?",
      "answer": "Upside is 28%; downside is 20%. The 1.4x magnitude ratio is not a probability-weighted expected return."
    }
  },
  {
    "id": "hedge-funds-5",
    "title": "Catalyst Identification",
    "track": "Hedge Funds",
    "explanation": "A catalyst is a development that may cause investors to revise earnings expectations, discount rates, perceived risk, or the multiple they assign to a security. Catalysts can be discrete—an earnings release, clinical result, court decision, contract renewal, asset sale—or gradual, such as improving retention or industry capacity tightening. The event alone does not create a trade: the analyst must identify what the market expects, what result would differ, and how that surprise changes the valuation. Consensus estimates, options pricing, positioning, and prior disclosures can help frame expectations, but none perfectly reveals market beliefs.\n\nMap the event date or window, observable outcomes, probability range, potential price implications, and what could delay or invalidate the catalyst. Distinguish a catalyst that reveals value from one that merely adds volatility. For example, a multiple expansion case requires investors to reassess growth, quality, or risk; unchanged earnings at a higher multiple is a scenario, not a guaranteed reaction. Position size should account for gap risk and event liquidity because exits may be difficult after a surprise. Several smaller evidence points can matter more than one scheduled announcement. In an interview, connect catalyst, expectation gap, and valuation rather than saying a company has an upcoming earnings report. Catalysts can fail, be anticipated, or move the price in the opposite direction.",
    "framework": "Event or evidence window → market expectation → observable surprise → earnings/risk/multiple transmission → scenario payoff → timing, liquidity, and invalidation condition.",
    "example": {
      "assumptions": "Company EPS is $2.00; illustrative P/E moves from 15x to 17x with EPS unchanged; ignore dividends, costs, and probability of rerating.",
      "steps": [
        "1. At 15x P/E, implied price = $2.00 × 15 = $30.",
        "2. At 17x P/E, implied price = $2.00 × 17 = $34.",
        "3. Price change = $34 − $30 = $4, or $4 ÷ $30 = 13.3%.",
        "4. The rerating requires a reason investors revise expectations or perceived risk; an event without a surprise may produce no such multiple change."
      ],
      "checks": [
        {
          "label": "price at 15x",
          "a": 2,
          "op": "*",
          "b": 15,
          "result": 30
        },
        {
          "label": "price at 17x",
          "a": 2,
          "op": "*",
          "b": 17,
          "result": 34
        },
        {
          "label": "dollar change",
          "a": 34,
          "op": "-",
          "b": 30,
          "result": 4
        },
        {
          "label": "percentage change",
          "a": 4,
          "op": "/",
          "b": 30,
          "result": 0.13333333333333333
        }
      ]
    },
    "questions": [
      {
        "q": "How do you determine whether an upcoming event is a real catalyst for a stock?",
        "a": "I identify what investors expect before the event, then specify a measurable result that differs from that expectation and how it would change earnings, risk, or valuation. I assess whether the information is already disclosed or reflected in estimates, when the market could react, and what would make the event irrelevant or delayed. The event may generate volatility without changing value. I would map both favorable and adverse outcomes, estimate price sensitivity, and size for potential gaps. A scheduled announcement is a catalyst only if its information can alter beliefs.",
        "mistake": "Calling every earnings date or product launch a catalyst without explaining what would surprise the market."
      },
      {
        "q": "Can a catalyst move a stock even when reported earnings do not change?",
        "a": "Yes. Investors may change the multiple or required return if uncertainty falls, governance improves, strategic alternatives emerge, or a business risk is resolved. The reverse also occurs: stable earnings can be valued less if perceived risk rises. I would identify the mechanism and distinguish a genuine reassessment from an unsupported assumption that sentiment will improve. A multiple scenario can quantify the price effect, but it should be grounded in observable evidence and compared with alternative explanations. The catalyst is a path to changed expectations, not a mathematical guarantee of rerating.",
        "mistake": "Forecasting a higher multiple without explaining the evidence or risk change that supports it."
      },
      {
        "q": "How do you manage a position around a binary event?",
        "a": "I would map possible outcomes and price gaps, review liquidity and portfolio concentration, and compare the event's expected payoff with the maximum loss the portfolio can tolerate. Options or reduced exposure may change the payoff profile, but their pricing, volatility, and costs matter. I would define what information is permitted and ensure the trade complies with relevant policies. The position should not rely on a stop order being executable at the quoted price after a gap. I would document the thesis, timing, and action for each scenario before the event arrives.",
        "mistake": "Relying on a stop price to cap loss when an event can gap through the order."
      }
    ],
    "selfCheck": {
      "question": "At $2 EPS, what price shift corresponds to a multiple moving from 15x to 17x, and what must justify it?",
      "answer": "Implied price moves from $30 to $34, up 13.3%. A credible expectation or perceived-risk change must support the rerating."
    }
  },
  {
    "id": "hedge-funds-6",
    "title": "Short Selling",
    "track": "Hedge Funds",
    "explanation": "A short seller borrows a security, sells it, and later buys shares to return to the lender. Gross profit arises if the cover price is below the sale price, but losses increase as the price rises and are theoretically unlimited. The short seller may owe distributions paid during the borrow, pay borrow fees and financing, post margin, and face a recall or buy-in if shares become unavailable. Borrow availability and cost can change quickly, especially in crowded or hard-to-borrow securities.\n\nA short thesis should identify a fundamental overvaluation, deteriorating business driver, accounting concern, catalyst, or other reason expectations may fall. Valuation alone may not create timing; a strong balance sheet or takeover possibility can prolong losses. Size should consider notional exposure, potential squeeze, liquidity, borrow concentration, and portfolio factor risks. Define what would invalidate the thesis and how the position can be covered under stress. A hedge reduces some risks but can introduce basis and correlation mismatch. In an interview, distinguish gross price P&L from net realized result and explain the operational mechanics of borrow and return. Market rules and borrow practices vary by broker and jurisdiction; do not assume a locate guarantees continued availability. Forced buy-ins can disrupt the planned exit.",
    "framework": "Gross short P&L = shares × (sale price − cover price). Net result also reflects borrow fees, distributions owed, financing, margin costs, and transaction costs. A rising share price increases loss; a short has no fixed maximum loss.",
    "example": {
      "assumptions": "Short 100 shares at $50; cover after one year at $40; borrow fee $100; distributions owed $50; ignore other fees, financing, and tax.",
      "steps": [
        "1. Sale proceeds at initiation = 100 shares × $50 = $5,000; this cash is collateral, not profit.",
        "2. Cover cost = 100 × $40 = $4,000, so gross trading profit is $5,000 − $4,000 = $1,000.",
        "3. Subtract $100 borrow fee and $50 distributions owed: net before other costs = $850.",
        "4. If instead the price rises to $70, cover cost is $7,000 and gross trading loss is $5,000 − $7,000 = −$2,000 before borrow and distributions."
      ],
      "checks": [
        {
          "label": "initial sale proceeds",
          "a": 100,
          "op": "*",
          "b": 50,
          "result": 5000
        },
        {
          "label": "cover cost",
          "a": 100,
          "op": "*",
          "b": 40,
          "result": 4000
        },
        {
          "label": "net profit",
          "a": 1000,
          "op": "-",
          "b": 100,
          "result": 900
        },
        {
          "label": "short loss if price rises",
          "a": 5000,
          "op": "-",
          "b": 7000,
          "result": -2000
        }
      ]
    },
    "questions": [
      {
        "q": "Walk me through the economics and risks of shorting 100 shares at $50 and covering at $40.",
        "a": "The initial sale creates $5,000 of proceeds, but those proceeds are associated with borrowed shares and are not free profit. Buying 100 shares at $40 costs $4,000, so gross price profit is $1,000. I then subtract borrow charges, distributions owed while short, financing, and transaction costs. The trade also has recall, margin, liquidity, and squeeze risk; if the price rises to $70, covering costs $7,000 and gross price loss is $2,000. I would explain borrow availability and define the thesis exit before opening the position.",
        "mistake": "Calling the short-sale proceeds profit or ignoring distributions owed to the share lender."
      },
      {
        "q": "Why can a fundamentally correct short still lose money?",
        "a": "The market may take longer than the borrow can be maintained to recognize the thesis, or a high-momentum stock may rise further before fundamentals weaken. The company can raise capital, receive a takeover offer, or report results that extend the valuation. Borrow costs can increase, shares can be recalled, and short squeezes can force covering at unfavorable prices. I would distinguish thesis horizon from financing horizon, size for asymmetric upside risk, monitor borrow and liquidity, and specify the evidence that would show the thesis is wrong rather than rely on eventual convergence.",
        "mistake": "Assuming an overvalued security must fall soon enough for the short to be profitable."
      },
      {
        "q": "What costs belong in a short-sale return calculation?",
        "a": "Beyond the difference between sale and cover prices, I include borrow fees, distributions owed during the short, financing or margin costs, transaction fees, and any costs associated with locating or replacing borrowed shares. I also consider the cash collateral treatment and the opportunity cost of capital under the portfolio's accounting. Costs depend on broker arrangements, security availability, and time outstanding. A simple gross P&L is useful for intuition, but the investment decision should use expected net returns under different cover dates and price paths.",
        "mistake": "Using price change alone as net P&L or assuming borrow cost remains constant."
      }
    ],
    "selfCheck": {
      "question": "Short 100 at $50, cover at $40, and pay $100 borrow plus $50 distributions. What is net profit before other costs?",
      "answer": "Gross price profit is $1,000; subtract $150 combined borrow and distributions for $850 net."
    }
  },
  {
    "id": "hedge-funds-7",
    "title": "Macroeconomics",
    "track": "Hedge Funds",
    "explanation": "Macroeconomic analysis links aggregate activity and policy to company cash flows, discount rates, currencies, and risk appetite. Growth influences demand, hiring, and utilization; inflation affects input costs, wages, pricing, and real returns; monetary policy influences short-term rates and financial conditions. Fiscal policy, exchange rates, credit availability, and commodity prices can transmit through sectors in different ways. An indicator matters relative to expectations and the market's policy reaction function, not merely because its absolute level is high or low.\n\nA macro investment case should identify the regime, the data surprise or policy change, the transmission mechanism, the assets exposed, and what is already priced. Nominal yields can be thought of approximately as real yields plus expected inflation and term or risk components. Rate moves affect bonds through duration and can affect equity valuations through discount rates, financing costs, and demand. A company may benefit from inflation if pricing power exceeds cost pressure, while another suffers margin compression. Correlations can shift across regimes, so historical relationships are not guarantees. Hedge funds often express macro views through rates, currencies, equity sectors, commodities, or options, each with basis, carry, and liquidity risks. In interviews, translate a macro opinion into a specific exposure and scenario rather than predicting an indicator without explaining portfolio relevance.",
    "framework": "Macro chain: growth/inflation/policy surprise → expectations and financial conditions → sector/company cash flows or discount rates → security-level transmission → position and hedge. Approximate nominal yield = real yield + expected inflation + term/risk components.",
    "example": {
      "assumptions": "Illustrative 2-year bond, face value $100, annual coupon 5%, annual compounding; compare price at 5% and 6% yield; no default.",
      "steps": [
        "1. At 5% yield, price = $5/1.05 + $105/1.05² = $100.00 (approximately par).",
        "2. At 6% yield, price = $5/1.06 + $105/1.06² = $98.17 (approximately).",
        "3. Price change = $98.17 − $100.00 = −$1.83, or about −1.83%.",
        "4. Higher market yields reduce the present value of fixed coupons and principal; exact results depend on coupon frequency and compounding convention."
      ],
      "checks": [
        {
          "label": "year-one discounted coupon at 5%",
          "a": 5,
          "op": "/",
          "b": 1.05,
          "result": 4.761904761904762
        },
        {
          "label": "year-two discounted principal and coupon at 5%",
          "a": 105,
          "op": "/",
          "b": 1.1025,
          "result": 95.23809523809524
        },
        {
          "label": "year-one discounted coupon at 6%",
          "a": 5,
          "op": "/",
          "b": 1.06,
          "result": 4.716981132075472
        },
        {
          "label": "year-two discounted principal and coupon at 6%",
          "a": 105,
          "op": "/",
          "b": 1.1236,
          "result": 93.4496262014943
        },
        {
          "label": "bond price at 5% yield",
          "a": 4.761904761904762,
          "op": "+",
          "b": 95.23809523809524,
          "result": 100
        },
        {
          "label": "bond price at 6% yield",
          "a": 4.716981132075471,
          "op": "+",
          "b": 93.4496262014952,
          "result": 98.16660733356977
        },
        {
          "label": "price move from 5% to 6%",
          "a": 98.16660733356977,
          "op": "-",
          "b": 100,
          "result": -1.83339266643023
        }
      ]
    },
    "questions": [
      {
        "q": "How would an unexpected inflation reading affect your analysis of a company?",
        "a": "I would first compare the release with what markets expected and assess the likely policy response. Then I would trace inflation through the company's input costs, wages, pricing power, customer demand, working capital, and financing expense. A company able to reprice quickly may protect margins; one with fixed contracts and rising costs may not. I would update forecasts and discount-rate assumptions separately, since nominal cash flows and rates both move. Finally, I would assess whether the security already reflects the surprise and identify the relevant portfolio exposure rather than make a generic inflation trade.",
        "mistake": "Assuming inflation is uniformly positive or negative across companies and assets."
      },
      {
        "q": "Why does a fixed-coupon bond generally fall in price when yields rise?",
        "a": "The bond's contractual coupon and principal remain fixed, but new securities offer a higher required return. Investors therefore pay less for the old cash flows so their yield is competitive with the market. In the example, a two-year $100 bond with a 5% coupon is worth about $100 at a 5% yield and about $98.17 at a 6% yield using annual compounding. The magnitude depends on duration, coupon, maturity, and convexity; the directional relationship assumes positive fixed cash flows and no embedded-option complication.",
        "mistake": "Saying the coupon rate changes when market yields move."
      },
      {
        "q": "How do you turn a macro view into a hedge-fund position?",
        "a": "I identify the economic variable, the surprise or regime change, and the mechanism affecting the asset. Then I choose an instrument whose payoff has the desired exposure while examining carry, liquidity, basis, convexity, and correlation risk. I define a time horizon, catalyst, downside scenario, and invalidation condition. For example, a rate view could be expressed in a particular maturity or curve segment, but that introduces curve risk beyond a simple parallel move. I would compare the market-implied expectation with my view and size the trade to portfolio risk limits.",
        "mistake": "Expressing a macro opinion without specifying instrument, horizon, carry, and risk factors."
      }
    ],
    "selfCheck": {
      "question": "What is the approximate price of the 2-year $100 bond at a 6% yield under the stated annual-coupon assumptions?",
      "answer": "$5/1.06 + $105/1.06² ≈ $98.17, below par because the coupon is below the new yield."
    }
  },
  {
    "id": "hedge-funds-8",
    "title": "Risk Management",
    "track": "Hedge Funds",
    "explanation": "Risk management asks how positions can lose money, how losses interact across the portfolio, and whether the fund can act before liquidity or financing constraints force a decision. Identify market exposure, leverage, volatility, liquidity, borrow, counterparty, operational, and event risks. A linear position's mark-to-market response can be approximated by notional times price return, but options and other nonlinear instruments require sensitivities such as delta, gamma, vega, and scenario repricing. Portfolio risk depends on covariance and shared economic drivers; apparently different securities may concentrate the same factor or crowded trade.\n\nUse historical and hypothetical stress scenarios, concentration limits, liquidity horizons, and drawdown analysis alongside statistical measures. Value at risk or volatility estimates depend on model assumptions and may miss gaps, regime changes, or illiquid exits. A hedge can reduce one exposure while introducing basis, counterparty, or financing risk. Risk limits should map to accountable actions: reduce, hedge, pause new positions, or escalate. Position sizing must reflect both expected payoff and the loss the portfolio can tolerate under stress, not only conviction. In an interview, quantify the impact of a scenario on NAV, explain correlation and liquidity assumptions, and state how you would respond if observed conditions differ from the model. Risk systems and escalation policies vary among funds; no single metric is sufficient.",
    "framework": "Linear P&L ≈ exposure × return. Portfolio variance = wᵀΣw, where w is the vector of weights and Σ the covariance matrix. Pair factor exposure, scenario loss, liquidity horizon, and leverage constraints; model limitations must be explicit.",
    "example": {
      "assumptions": "Fund NAV $20m; one unlevered $2m position falls 8%; ignore hedges, fees, and other positions.",
      "steps": [
        "1. Position loss = $2m × 8% = $160,000.",
        "2. Loss as a fraction of NAV = $160,000 ÷ $20m = 0.8%.",
        "3. New NAV after this isolated mark = $20m − $0.16m = $19.84m.",
        "4. If a correlated second position also loses $100,000, combined loss is $260,000 or 1.3% of initial NAV; diversification cannot be assumed without testing correlation."
      ],
      "checks": [
        {
          "label": "position loss",
          "a": 2000000,
          "op": "*",
          "b": 0.08,
          "result": 160000
        },
        {
          "label": "loss as NAV fraction",
          "a": 160000,
          "op": "/",
          "b": 20000000,
          "result": 0.008
        },
        {
          "label": "post-loss NAV",
          "a": 20000000,
          "op": "-",
          "b": 160000,
          "result": 19840000
        },
        {
          "label": "combined loss",
          "a": 160000,
          "op": "+",
          "b": 100000,
          "result": 260000
        }
      ]
    },
    "questions": [
      {
        "q": "How do you evaluate the risk of a position beyond its standalone volatility?",
        "a": "I examine fundamental downside, factor exposures, leverage, liquidity, event gaps, borrow or financing, and how the position behaves with existing holdings under stress. I ask whether the hedge remains effective when correlations change and whether the fund can exit within the expected liquidity horizon. A historical volatility number describes a sample, not a maximum loss. I would stress specific shocks, estimate impact on NAV, aggregate correlated exposures, and identify a concrete action if risk exceeds the portfolio's tolerance. Position risk is determined by the portfolio context as well as the security.",
        "mistake": "Treating recent volatility or a single VaR estimate as a complete risk description."
      },
      {
        "q": "A $2m position loses 8% in a $20m fund. What is the NAV impact?",
        "a": "The position loses $160,000 because $2m multiplied by 8% is $160,000. Relative to $20m initial NAV, the loss is 0.8%, leaving $19.84m if all other values and flows are unchanged. I would then check whether this position shares factors with other losses, whether liquidity has changed, and whether the thesis or risk budget requires action. The arithmetic is only the isolated mark; a correlated portfolio shock can make total drawdown larger. I would review the rest of the book before changing limits.",
        "mistake": "Reporting the 8% security loss as an 8% fund loss."
      },
      {
        "q": "What are the limitations of value at risk?",
        "a": "VaR estimates a loss threshold at a stated confidence level and horizon under a particular data set or model. It does not state the size of losses beyond that threshold, and it can understate risk when distributions have fat tails, markets gap, correlations shift, or positions are illiquid. Results also depend on valuation, historical window, and portfolio mapping. I would pair VaR with expected shortfall where appropriate, stress scenarios, concentration and liquidity measures, and judgment about current market structure. Model outputs guide questions; they do not replace escalation or risk ownership.",
        "mistake": "Interpreting a 99% VaR as a worst-case loss or a guarantee that losses will stay below it."
      }
    ],
    "selfCheck": {
      "question": "What fraction of a $20m NAV is a $160,000 mark-to-market loss?",
      "answer": "$160,000 ÷ $20m = 0.8% of NAV."
    }
  },
  {
    "id": "hedge-funds-9",
    "title": "Position Sizing",
    "track": "Hedge Funds",
    "explanation": "Position sizing converts a security view into portfolio exposure while respecting loss capacity, liquidity, concentration, leverage, and the instrument's payoff. A risk-budget approach begins with the maximum dollar loss the portfolio is willing to accept if a specified thesis threshold is reached. For a linear long position, divide that budget by the loss per share between entry and planned exit threshold; then calculate shares and notional. This is a planning estimate, not a guarantee because prices can gap, stops can slip, and liquidity can disappear. For options, short positions, or hedged trades, calculate scenario losses using nonlinear payoff and borrow assumptions rather than a simple stop-distance formula.\n\nThe risk budget should reflect conviction only after considering volatility, catalyst timing, correlation with other holdings, and expected liquidity. A highly volatile stock may warrant a smaller notional even when the thesis is compelling. Position size must also fit portfolio gross and net exposure, sector limits, borrow availability, and mandate constraints. Reassess size when the price, thesis, volatility, or liquidity changes; do not add merely to recover a loss. In interviews, distinguish risk per share from capital invested and state the adverse execution assumption. A position-sizing answer is strongest when the candidate calculates exposure transparently and explains how a gap or correlated drawdown could exceed the planned budget.",
    "framework": "Long risk-budget shares = maximum planned dollar loss ÷ (entry price − planned exit threshold). Notional = shares × entry price. Stops do not guarantee execution at the stated level; adjust for gaps, liquidity, and correlated exposure.",
    "example": {
      "assumptions": "Long stock entry $50; planned review/exit threshold $45; maximum planned loss budget $2,000; assume execution at threshold for the arithmetic illustration.",
      "steps": [
        "1. Planned price risk per share = $50 − $45 = $5.",
        "2. Share count = $2,000 risk budget ÷ $5 per share = 400 shares.",
        "3. Position notional = 400 × $50 entry price = $20,000.",
        "4. If the stock gaps to $42, realized loss is 400 × ($50 − $42) = $3,200, exceeding the planned budget by $1,200."
      ],
      "checks": [
        {
          "label": "risk per share",
          "a": 50,
          "op": "-",
          "b": 45,
          "result": 5
        },
        {
          "label": "shares",
          "a": 2000,
          "op": "/",
          "b": 5,
          "result": 400
        },
        {
          "label": "notional",
          "a": 400,
          "op": "*",
          "b": 50,
          "result": 20000
        },
        {
          "label": "gap loss",
          "a": 400,
          "op": "*",
          "b": 8,
          "result": 3200
        }
      ]
    },
    "questions": [
      {
        "q": "How would you size a long equity position from a fixed risk budget?",
        "a": "I would define the dollar loss budget, entry price, and thesis-based exit threshold, then divide the budget by the planned loss per share. With a $2,000 budget, $50 entry, and $45 threshold, risk is $5 per share, so the illustrative size is 400 shares and $20,000 notional. I would then check liquidity, volatility, event risk, portfolio concentration, and factor overlap. A stop is not a guaranteed price, so I would stress a gap and reduce size if actual loss could exceed the mandate's tolerance.",
        "mistake": "Confusing the dollar risk budget with the amount of capital invested in the position."
      },
      {
        "q": "What happens to a stop-based position if the stock gaps through the stop?",
        "a": "The stop threshold may trigger an order, but the next available execution can be materially worse than the stop price in a fast or illiquid market. In the example, a 400-share long planned at $45 but filled at $42 from a $50 entry loses $3,200 rather than $2,000. I would model gap scenarios, event liquidity, and market impact, then size with a buffer. A stop order is an execution instruction, not insurance against losses beyond its trigger level. Order type and venue rules can further affect fills.",
        "mistake": "Assuming the planned stop price caps maximum loss regardless of market gaps or trading halts."
      },
      {
        "q": "How should correlation affect position size?",
        "a": "If a proposed position shares drivers with existing holdings, its marginal portfolio risk can be larger than its standalone volatility suggests. I would examine factor and scenario exposures, estimate losses when related positions move together, and consider liquidity during the same stress. Diversification by ticker does not guarantee diversification by underlying revenue, rates, commodity, or crowded positioning. A highly correlated idea may need a smaller allocation, a hedge, or a different expression. Correlations are unstable, so I would stress adverse regimes instead of relying exclusively on a historical matrix.",
        "mistake": "Sizing every idea independently and exceeding portfolio risk through overlapping exposures."
      }
    ],
    "selfCheck": {
      "question": "With a $2,000 planned loss budget and $5 risk per share, how many shares fit the simplified sizing rule?",
      "answer": "$2,000/$5 = 400 shares, subject to gap, liquidity, and portfolio-risk adjustments."
    }
  },
  {
    "id": "hedge-funds-10",
    "title": "Portfolio Construction",
    "track": "Hedge Funds",
    "explanation": "Portfolio construction combines individual ideas into a set of exposures that fits the fund's mandate, risk limits, liquidity, and return objective. The portfolio's expected return is approximately the sum of position weights times their expected returns, but risk depends on covariance among positions, not just each security's volatility. Holdings also consume liquidity and risk capacity. Diversification works when exposures respond differently to relevant economic and market shocks; a long list of correlated positions can still be concentrated. Review sector, factor, country, currency, duration, commodity, event, and counterparty exposures as appropriate.\n\nLong/short portfolios also monitor gross exposure—the sum of absolute long and short weights—and net exposure—the signed sum. Gross exposure reflects the scale of positions; net exposure gives a rough directional balance but does not capture beta, optionality, basis, or liquidity. Position-level expected returns should be discounted for risk, financing, borrow, and capacity. Scenario analysis examines how portfolio NAV changes under joint shocks, including changing correlations and crowded exits. Rebalancing should follow a defined thesis and risk process rather than mechanically trade every market move. Construction involves trade-offs among concentration, diversification, liquidity, and opportunity cost; fund guidelines set the binding constraints. In an interview, show portfolio math and name the risks a simple weighted-average return omits.",
    "framework": "Unlevered portfolio return ≈ Σ(wᵢ × rᵢ), with weights summing to 1. Gross exposure = Σ|wᵢ|; net exposure = Σwᵢ for signed positions. Portfolio variance = wᵀΣw; correlation and liquidity can change under stress.",
    "example": {
      "assumptions": "Unlevered portfolio invests 60% long in A and 40% in B; A returns 10%, B returns −5%; ignore fees and flows. Separate long/short exposure illustration uses $120 long and $80 short.",
      "steps": [
        "1. Contribution from A = 60% × 10% = 6.0 percentage points.",
        "2. Contribution from B = 40% × (−5%) = −2.0 percentage points.",
        "3. Portfolio return = 6.0% − 2.0% = 4.0%.",
        "4. In the separate long/short book, gross exposure = $120 + $80 = $200; net exposure = $120 − $80 = $40 long."
      ],
      "checks": [
        {
          "label": "A return contribution",
          "a": 0.6,
          "op": "*",
          "b": 0.1,
          "result": 0.06
        },
        {
          "label": "B return contribution",
          "a": 0.4,
          "op": "*",
          "b": -0.05,
          "result": -0.02
        },
        {
          "label": "portfolio return",
          "a": 0.06,
          "op": "-",
          "b": 0.02,
          "result": 0.04
        },
        {
          "label": "gross exposure",
          "a": 120,
          "op": "+",
          "b": 80,
          "result": 200
        },
        {
          "label": "net long/short exposure",
          "a": 120,
          "op": "-",
          "b": 80,
          "result": 40
        }
      ]
    },
    "questions": [
      {
        "q": "How do you evaluate whether a portfolio is diversified?",
        "a": "I look through security names to underlying economic drivers, factor exposures, sectors, liquidity, events, and financing. I examine how holdings may move together under specific shocks, not only historical correlation during calm markets. A portfolio of many companies can still be concentrated in one consumer, rate, or commodity exposure. I would combine position-level stress tests with portfolio covariance and liquidity analysis, then identify which risks are intentional. Diversification can reduce some idiosyncratic risks but cannot eliminate market loss or assure performance in a regime change.",
        "mistake": "Equating a large number of holdings with genuine diversification."
      },
      {
        "q": "What do gross and net exposure tell you in a long/short portfolio?",
        "a": "Gross exposure sums the absolute sizes of longs and shorts, providing a measure of total position scale and some indication of leverage or activity. Net exposure adds signed positions and gives a rough directional balance. For $120 long and $80 short, gross is $200 and net is $40 long. Neither measure captures beta, factor mismatch, options convexity, liquidity, or the possibility that hedges fail. I would report them with more detailed risk exposures and confirm whether the fund's definitions use market value, delta-adjusted notional, or another convention.",
        "mistake": "Treating low net exposure as proof the portfolio has low risk despite large gross positions."
      },
      {
        "q": "Calculate the return for a 60/40 portfolio when A earns 10% and B loses 5%.",
        "a": "Assuming weights are beginning-period market values and no flows, A contributes 0.60 times 10%, or 6 percentage points. B contributes 0.40 times negative 5%, or negative 2 percentage points. The portfolio return is therefore 4% before fees and taxes. Ending weights will drift because the assets perform differently. The weighted-average calculation says nothing about volatility or correlation; for that I need joint return behavior and a covariance or scenario analysis. Contribution and risk attribution answer different questions. Rebalance only if mandate warrants.",
        "mistake": "Adding asset returns without applying portfolio weights or confusing return contribution with risk contribution."
      }
    ],
    "selfCheck": {
      "question": "In the example, what are the 60/40 portfolio's return and the long/short book's gross exposure?",
      "answer": "The weighted return is 4.0%; gross long/short exposure is $120 + $80 = $200."
    }
  }
];
