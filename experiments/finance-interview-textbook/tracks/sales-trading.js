export default [
  {
    "id": "sales-trading-1",
    "title": "Market Structure",
    "track": "Sales & Trading",
    "explanation": "Market structure describes where and how buyers and sellers trade, which participants provide liquidity, and what happens between order submission and settlement. Equities may trade across exchanges and other venues; bonds and many derivatives trade through dealer networks or electronic platforms. Participants include customers, brokers, dealers, market makers, exchanges, clearing houses, and custodians. Venue rules, transparency, order types, tick sizes, routing, and clearing arrangements influence execution and market risk. The same security can have different displayed depth across venues, and quotes can change before an order arrives.\n\nThe bid is the highest displayed buying price and the ask the lowest displayed selling price; their difference is the quoted spread. The midpoint is a reference, not necessarily an executable price. Execution quality also reflects market impact, fees, delay, opportunity cost, and fill probability. A market order prioritizes execution but can sweep available liquidity; a limit order controls price but may not fill. Trading mechanics vary by asset class and jurisdiction, including trade reporting and settlement. In an interview, explain the client's objective, order choice, expected costs, and how you would assess the fill against a benchmark. A narrow spread alone does not prove that a large order can execute cheaply, particularly in a fragmented or fast-moving market.",
    "framework": "Midpoint = (bid + ask)/2. Quoted spread = ask − bid; relative spread = spread ÷ midpoint. Total execution cost also includes market impact, fees, delay, and opportunity cost; compare fills with a stated benchmark and order objective.",
    "example": {
      "assumptions": "Displayed bid $99.90, ask $100.10, midpoint reference; buy 1,000 shares at the ask; exclude fees, market impact, and quote movement.",
      "steps": [
        "1. Midpoint = ($99.90 + $100.10) ÷ 2 = $100.00.",
        "2. Quoted spread = $100.10 − $99.90 = $0.20 per share.",
        "3. Relative spread = $0.20 ÷ $100.00 = 0.20%.",
        "4. Buying 1,000 shares at $100.10 costs $100,100 before fees; midpoint shortfall is $100 against the $100,000 midpoint reference."
      ],
      "checks": [
        {
          "label": "midpoint sum",
          "a": 99.9,
          "op": "+",
          "b": 100.1,
          "result": 200
        },
        {
          "label": "midpoint",
          "a": 200,
          "op": "/",
          "b": 2,
          "result": 100
        },
        {
          "label": "spread",
          "a": 100.1,
          "op": "-",
          "b": 99.9,
          "result": 0.2
        },
        {
          "label": "purchase notional",
          "a": 1000,
          "op": "*",
          "b": 100.1,
          "result": 100100
        },
        {
          "label": "purchase shortfall to midpoint",
          "a": 100100,
          "op": "-",
          "b": 100000,
          "result": 100
        }
      ]
    },
    "questions": [
      {
        "q": "Explain the difference between a market order and a limit order to a client.",
        "a": "A market order seeks execution promptly at prices currently available, but the final price is uncertain and a large order may consume several levels of liquidity. A limit order sets a worst acceptable price for a buy or sell, but execution is not guaranteed; the market can move away without a fill. I would ask whether the client prioritizes immediacy, price control, or participation, then consider depth, volatility, order size, and venue. I would communicate the trade-off and monitor the fill rather than imply either order type guarantees a favorable outcome.",
        "mistake": "Describing a limit order as guaranteed execution or a market order as guaranteed at the displayed quote."
      },
      {
        "q": "What does the bid–ask spread tell you, and what does it leave out?",
        "a": "The quoted spread measures the gap between the best displayed bid and ask at a particular time. It gives a rough indication of immediate displayed trading cost for small orders, but it ignores depth beyond the top quote, hidden liquidity, queue position, market impact, fees, and quote movement. For an actual execution review, I would compare fills with a benchmark such as arrival price or volume-weighted average price, chosen to fit the order objective. A tight spread does not guarantee low cost for a large or urgent order.",
        "mistake": "Using the top-of-book spread as the full transaction cost for a large order."
      },
      {
        "q": "How would you assess execution quality for a sizable client order?",
        "a": "I would first record the order's urgency, size, limit, and instructions, then select a benchmark and measure fill price, fees, timing, and market impact. I would compare available depth across permitted venues and consider whether staged execution reduces impact or creates information leakage. The relevant result depends on the client's objective: immediate completion and price improvement can conflict. I would document routing and any partial fills, explain unfilled quantity, and avoid judging performance from a single quote snapshot. Market rules and execution obligations depend on jurisdiction and client capacity.",
        "mistake": "Choosing an execution benchmark after seeing the result or ignoring opportunity cost of an unfilled order."
      }
    ],
    "selfCheck": {
      "question": "With a $99.90 bid and $100.10 ask, what are midpoint and quoted spread?",
      "answer": "Midpoint is $100.00 and quoted spread is $0.20 per share."
    }
  },
  {
    "id": "sales-trading-2",
    "title": "Macroeconomics",
    "track": "Sales & Trading",
    "explanation": "Macro trading connects economic data and policy decisions to the prices and risk of rates, currencies, equities, credit, and commodities. Growth readings influence expected demand and central-bank decisions; inflation data affect real purchasing power, wages, input costs, and expected policy rates. The market response depends on the surprise relative to consensus and the reaction function investors expect. A high inflation print may lift yields if it changes policy expectations, but the move can be muted or reversed if positioning already anticipated it or growth fears dominate.\n\nRates should be analyzed by level, curve shape, and volatility. A nominal yield reflects real-rate expectations, expected inflation, and term or risk premia; these components are not directly observed with certainty. Currency moves depend on relative rates, growth, capital flows, and risk sentiment. Equity sectors respond differently through revenues, margins, financing costs, and discount rates. Before proposing a macro trade, specify the data or regime, transmission mechanism, instrument, horizon, carry, and scenario loss. A curve position is not identical to a parallel-rate view, and hedges introduce basis risk. Economic releases are revised, and policy guidance may change. In an interview, avoid deterministic statements such as 'inflation up means bonds down' without stating expectations, maturity, positioning, and the instrument's exposure.",
    "framework": "Release or policy change versus expectations → rates/FX/financial conditions → sector and instrument transmission → curve, carry, and risk scenario. Approximate nominal yield = real yield + expected inflation + term/risk components.",
    "example": {
      "assumptions": "Two-year bond, $100 face, annual 5% coupon; annual compounding; compare yields 5% and 6%; no default or embedded options.",
      "steps": [
        "1. At a 5% yield, price = $5/1.05 + $105/1.05² = $100.00 approximately.",
        "2. At a 6% yield, price = $5/1.06 + $105/1.06² = $98.17 approximately.",
        "3. Price change is $98.17 − $100.00 = −$1.83, or about −1.83% of par.",
        "4. The example isolates discounting; an actual trade also depends on coupon schedule, curve movement, spread, carry, and market expectations."
      ],
      "checks": [
        {
          "label": "coupon PV at 5%",
          "a": 5,
          "op": "/",
          "b": 1.05,
          "result": 4.761904761904762
        },
        {
          "label": "final payment PV at 5%",
          "a": 105,
          "op": "/",
          "b": 1.1025,
          "result": 95.23809523809524
        },
        {
          "label": "coupon PV at 6%",
          "a": 5,
          "op": "/",
          "b": 1.06,
          "result": 4.716981132075472
        },
        {
          "label": "final payment PV at 6%",
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
        "q": "A CPI release is above consensus. How would you think about the rates-market reaction?",
        "a": "I would first quantify the surprise and check whether the release changes the expected path of policy, not infer direction from the level alone. I would inspect components, revisions, wage or demand context, and market positioning. If investors raise expected policy rates, front-end yields may rise; term premium, growth concerns, or an already crowded position can alter the curve response. I would specify the maturity and instrument, estimate DV01 and carry, and compare the move with what was priced before the release. The direction is conditional, not a rule.",
        "mistake": "Assuming every above-consensus inflation print produces the same parallel yield increase."
      },
      {
        "q": "Why do yields and fixed-coupon bond prices move inversely?",
        "a": "A fixed-coupon bond pays contractual cash flows, and its price is the present value of those payments discounted at the market-required yield. When yield rises, each future payment has a lower present value; when yield falls, the present value rises. For the two-year $100 bond in the example, annual $5 coupons and principal produce a price near par at a 5% yield but about $98.17 at 6%. The sensitivity depends on maturity, coupon, and convexity, so I would quantify the chosen instrument rather than use direction alone.",
        "mistake": "Confusing coupon rate with market yield and implying the contractual coupon changes."
      },
      {
        "q": "How would you express a view that the yield curve will steepen?",
        "a": "I would specify whether I expect a bull or bear steepening and which maturities drive the view, then choose instruments and notionals that isolate the intended slope exposure. I would calculate DV01 by leg, set a hedge ratio, and evaluate carry, roll-down, financing, and curve-basis risk. A parallel shift can still dominate P&L if the legs are not risk-balanced. I would define catalysts and scenarios for both curve legs, including a flattening outcome, and size within limits. A steepening forecast alone is not a complete trade specification.",
        "mistake": "Buying a long bond and selling a short bond in equal notional without checking DV01 or carry."
      }
    ],
    "selfCheck": {
      "question": "What is the approximate price of the example bond at a 6% yield?",
      "answer": "Discounting $5 at year 1 and $105 at year 2 gives approximately $98.17, below par."
    }
  },
  {
    "id": "sales-trading-3",
    "title": "Fixed Income",
    "track": "Sales & Trading",
    "explanation": "Fixed-income analysis values scheduled coupon and principal cash flows while assessing the possibility that the issuer does not pay them. A plain fixed-rate bond's price is the discounted value of contractual payments; yield to maturity is the rate that equates those payments with price under a stated compounding and day-count convention. Yield is not guaranteed realized return if the bond defaults, is sold early, or coupons are reinvested at different rates. Credit spread compensates for credit, liquidity, and other risks relative to a benchmark curve, but the decomposition is not exact.\n\nDuration approximates sensitivity to small yield changes: modified duration times the yield move estimates the percentage price change with a negative sign. Convexity improves the approximation for larger moves. Analyze key-rate exposure when the curve shifts nonparallel, plus spread duration, calls, prepayment, and embedded options where relevant. Cash-flow timing, coupon, maturity, and yield determine sensitivity; a long low-coupon bond typically has greater rate exposure than a short high-coupon bond, all else equal. Also evaluate issuer leverage, covenants, seniority, collateral, and recovery. Bond conventions vary by market and instrument, including frequency, settlement, accrued interest, and day count. In an interview, distinguish price, yield, duration, and credit risk, then show the arithmetic under explicit conventions.",
    "framework": "Annual coupon bond price = Σ couponₜ/(1+y)ᵗ + face/(1+y)ⁿ. Modified-duration approximation: ΔP/P ≈ −Dmod × Δy for small changes. Yield convention, compounding, settlement, accrued interest, and embedded options matter.",
    "example": {
      "assumptions": "Two-year bond, $100 face, annual $5 coupons, 5% annual yield, annual compounding; ignore accrued interest and default.",
      "steps": [
        "1. Year-1 coupon present value = $5 ÷ 1.05 = $4.7619.",
        "2. Year-2 coupon plus principal present value = $105 ÷ 1.05² = $95.2381.",
        "3. Bond price = $4.7619 + $95.2381 = $100.00.",
        "4. If modified duration is approximately 1.86, a +1 percentage-point yield move estimates −1.86% price change, or about −$1.86; this is a local approximation."
      ],
      "checks": [
        {
          "label": "year-one coupon PV",
          "a": 5,
          "op": "/",
          "b": 1.05,
          "result": 4.761904761904762
        },
        {
          "label": "year-two cash-flow PV",
          "a": 105,
          "op": "/",
          "b": 1.1025,
          "result": 95.23809523809524
        },
        {
          "label": "bond price",
          "a": 4.761904761904762,
          "op": "+",
          "b": 95.23809523809524,
          "result": 100
        },
        {
          "label": "duration price move",
          "a": 100,
          "op": "*",
          "b": -0.0186,
          "result": -1.86
        }
      ]
    },
    "questions": [
      {
        "q": "How do you price a plain fixed-rate bond and interpret yield to maturity?",
        "a": "I discount each promised coupon and principal payment at the yield using the bond's compounding convention, then sum the present values. Yield to maturity is the rate that equates that price with contractual cash flows if held to maturity, but it assumes payment and reinvestment conditions that may not occur. I would also account for settlement date, accrued interest, day count, and embedded options as applicable. Credit risk can prevent promised cash flows, and selling before maturity exposes the investor to market price changes. I would distinguish clean price from invoice price where the market convention requires it.",
        "mistake": "Describing yield to maturity as a guaranteed annualized return regardless of default, reinvestment, or sale date."
      },
      {
        "q": "Estimate the price effect of a 100-basis-point rise for a bond with modified duration 1.86.",
        "a": "A 100-basis-point increase is a 1.00 percentage-point yield move, or 0.01 in decimal form. The duration approximation gives percentage price change of approximately negative 1.86 times 0.01, or negative 1.86%. On a $100 price, that is about a $1.86 decline to $98.14. This is a first-order estimate that ignores convexity, spread movement, and nonparallel curve changes. I would use full repricing for a larger shock or a bond with meaningful embedded options. The estimate is a change in value, not a target yield.",
        "mistake": "Multiplying duration by 100 instead of converting basis points to decimal yield change."
      },
      {
        "q": "What is the difference between interest-rate risk and credit-spread risk?",
        "a": "Interest-rate risk arises when the benchmark curve used to discount cash flows changes; spread risk comes from changes in the compensation investors require for issuer credit, liquidity, and related risks. A corporate bond can lose value when Treasury yields rise, when its spread widens, or both. I would separate exposures using key-rate or benchmark duration and spread duration, then stress issuer fundamentals and market liquidity. The exact attribution depends on pricing model and instrument, and callable bonds may respond nonlinearly because cash flows can change with rates.",
        "mistake": "Attributing every corporate bond price move to the risk-free curve while ignoring spread widening."
      }
    ],
    "selfCheck": {
      "question": "At a 5% yield, what is the price of the two-year $100 bond with $5 annual coupons?",
      "answer": "$5/1.05 + $105/1.05² = $100.00 under the stated annual-compounding convention."
    }
  },
  {
    "id": "sales-trading-4",
    "title": "Options & Derivatives",
    "track": "Sales & Trading",
    "explanation": "Derivatives create contractual exposure to an underlying share, index, rate, currency, commodity, or other reference. A call gives its holder the right, but not the obligation, to buy at the strike; a put gives the right to sell. Futures and forwards generally create obligations for both sides, while swaps exchange defined cash flows. The payoff is only one part of value: option premium, implied volatility, time to expiry, rates, dividends, settlement, and exercise style matter. A long option has limited loss equal to premium at expiry but can lose value before expiry through time decay or volatility change.\n\nDelta approximates price sensitivity to the underlying, gamma measures how delta changes, vega measures sensitivity to implied volatility, and theta describes time decay under a model. These are local sensitivities, not guaranteed outcomes, and can change rapidly around events or expiry. Derivatives can embed leverage, collateral calls, counterparty exposure, and nonlinear gap risk. For a short option, potential losses may be large and margin requirements can rise as markets move. Explain payoff at expiry separately from profit after premium, then identify the scenario and risk measure relevant to the position. Contract specifications and regulatory treatment vary by market and jurisdiction; use the actual contract terms rather than assuming a generic settlement convention.",
    "framework": "Long call expiry payoff = max(Sₜ − K, 0); profit = payoff − premium. Long put payoff = max(K − Sₜ, 0). Sₜ is underlying price at expiry; K is strike; premium is upfront option price. Greeks are local sensitivities.",
    "example": {
      "assumptions": "Buy one call covering 100 shares; strike $50/share; premium $4/share; hold to expiry; ignore fees and early exercise.",
      "steps": [
        "1. At expiry S=$60, call payoff per share = max($60 − $50, 0) = $10.",
        "2. Profit per share after $4 premium = $10 − $4 = $6.",
        "3. Contract profit = $6 × 100 shares = $600, before fees.",
        "4. At S=$45, payoff is zero and contract loss is premium $4 × 100 = $400; break-even at expiry is $50 + $4 = $54/share."
      ],
      "checks": [
        {
          "label": "in-the-money payoff per share",
          "a": 60,
          "op": "-",
          "b": 50,
          "result": 10
        },
        {
          "label": "profit per share",
          "a": 10,
          "op": "-",
          "b": 4,
          "result": 6
        },
        {
          "label": "contract profit",
          "a": 6,
          "op": "*",
          "b": 100,
          "result": 600
        },
        {
          "label": "break-even share price",
          "a": 50,
          "op": "+",
          "b": 4,
          "result": 54
        },
        {
          "label": "out-of-money contract loss",
          "a": 4,
          "op": "*",
          "b": 100,
          "result": 400
        },
        {
          "label": "call break-even",
          "a": 50,
          "op": "+",
          "b": 4,
          "result": 54
        }
      ]
    },
    "questions": [
      {
        "q": "What is the payoff and profit on a $50-strike call bought for a $4 premium if the stock expires at $60?",
        "a": "The call's intrinsic payoff is max($60 minus $50, zero), or $10 per share at expiry. Subtract the $4 premium to get $6 profit per share. For a standard 100-share contract, that is $600 before fees. The break-even stock price at expiry is $54. Before expiry, the option can trade above intrinsic value because time and volatility remain; exercise and settlement terms depend on the contract. I would distinguish payoff from profit and state whether the question asks per share or per contract.",
        "mistake": "Calling the $10 intrinsic payoff the profit while ignoring the $4 premium."
      },
      {
        "q": "Explain delta, gamma, vega, and theta without treating them as fixed numbers.",
        "a": "Delta estimates the option-price change for a small underlying-price move; gamma estimates the change in delta; vega estimates sensitivity to implied volatility; theta estimates time decay as expiry approaches, holding other inputs constant. They are local model sensitivities, so they shift as price, volatility, time, and rates change. A large move or event can make a linear delta estimate inaccurate, while gamma becomes important. I would use scenario repricing for nonlinear exposures and explain model assumptions, contract terms, and whether the Greek is quoted per share, contract, or unit volatility.",
        "mistake": "Assuming a Greek remains constant across large price moves or confusing vega units."
      },
      {
        "q": "How does a long call's risk differ from an unhedged short call?",
        "a": "A long call buyer pays premium upfront and, at expiry, can lose no more than that premium if the contract is otherwise standard. A short call receives premium but can face losses as the underlying rises, potentially without a fixed maximum for an uncovered position. Both sides have mark-to-market and liquidity considerations before expiry; margin and exercise mechanics matter. I would show payoff across prices, identify collateral and assignment risk, and distinguish a covered call from an uncovered short call. A defined premium is not the same as a defined risk for the seller.",
        "mistake": "Assuming the option seller's maximum loss is the premium received."
      }
    ],
    "selfCheck": {
      "question": "A $50 call costs $4 and expires with the stock at $60. What is profit per share and per 100-share contract?",
      "answer": "Payoff is $10/share; profit after premium is $6/share, or $600 for 100 shares before fees."
    }
  },
  {
    "id": "sales-trading-5",
    "title": "Market Making",
    "track": "Sales & Trading",
    "explanation": "A market maker provides two-sided prices and seeks to facilitate trading while managing inventory, adverse selection, funding, and operational risk. A bid is the price at which the dealer is willing to buy; an ask is the price at which it is willing to sell. The quoted spread can compensate for transaction costs and risk, but it is not guaranteed profit: one side may fill just before the market moves against the dealer. Inventory changes exposure to underlying prices, rates, volatility, or credit depending on the instrument.\n\nThe dealer manages inventory by adjusting quotes, hedging in related instruments, or changing size; a hedge can reduce directional exposure but leave basis or execution risk. Order flow conveys information: informed trading can create adverse selection, while uninformed two-way flow may allow spread capture. Market depth, volatility, competition, fees, and venue rules affect quote quality. P&L should be decomposed into spread earned, inventory mark-to-market, hedging, fees, funding, and adverse selection. A small spread on high volume can still lose money if inventory moves or hedges cost more than expected. In an interview, distinguish quoted spread from realized spread and explain what happens when only one side fills. Risk controls and obligations vary across products and jurisdictions; a market-maker label does not imply unlimited capacity or a duty to quote every size.",
    "framework": "Quoted spread = ask − bid; midpoint = (ask + bid)/2. P&L decomposition: spread capture + inventory mark + hedge result − fees/funding − adverse selection. Inventory P&L is quantity × price change for a linear exposure.",
    "example": {
      "assumptions": "Dealer buys 100 shares at $99.90 and sells 100 at $100.10; then separately consider an unsold 100-share long marked down $0.30; ignore fees and hedging.",
      "steps": [
        "1. Round-trip buy cost = 100 × $99.90 = $9,990.",
        "2. Sale proceeds = 100 × $100.10 = $10,010.",
        "3. Gross spread capture on matched shares = $10,010 − $9,990 = $20.",
        "4. An unsold 100-share inventory marked down $0.30 loses $30, so that mark exceeds the $20 spread capture by $10 before costs."
      ],
      "checks": [
        {
          "label": "buy cost",
          "a": 100,
          "op": "*",
          "b": 99.9,
          "result": 9990
        },
        {
          "label": "sale proceeds",
          "a": 100,
          "op": "*",
          "b": 100.1,
          "result": 10010
        },
        {
          "label": "spread capture",
          "a": 10010,
          "op": "-",
          "b": 9990,
          "result": 20
        },
        {
          "label": "inventory mark",
          "a": 100,
          "op": "*",
          "b": -0.3,
          "result": -30
        },
        {
          "label": "net spread and inventory mark",
          "a": 20,
          "op": "-",
          "b": 30,
          "result": -10
        }
      ]
    },
    "questions": [
      {
        "q": "How does a market maker earn revenue, and why is spread capture not risk-free?",
        "a": "A dealer may earn the bid–ask spread by buying at the bid and later selling at the ask, but fills are not necessarily matched in time or quantity. The remaining inventory can move against the dealer, informed order flow can signal an adverse price change, and hedging, funding, fees, and market impact reduce gross spread. In the example, matched trades capture $20 while an unsold 100-share position marked down $0.30 loses $30. I would manage quotes and inventory dynamically and assess realized P&L rather than equate quoted spread with profit.",
        "mistake": "Assuming every bid fill can be offset at the ask before the market moves."
      },
      {
        "q": "What do you do when your inventory becomes too long?",
        "a": "I would assess the position's risk by instrument sensitivities, market conditions, liquidity, and limits, then determine whether to hedge, reduce inventory through quotes, or execute an offsetting trade. Widening or adjusting the bid may slow further buying, while a lower offer may attract sellers, but quote changes can affect client flow and must follow venue and firm rules. A hedge reduces some exposure but may leave basis risk. I would communicate material limit pressure promptly and avoid assuming the market will mean-revert before taking action.",
        "mistake": "Hedging only the headline delta while ignoring basis, liquidity, or other risk factors."
      },
      {
        "q": "What is adverse selection in market making?",
        "a": "Adverse selection occurs when a counterparty trades because it has information or a faster view that makes the quoted price stale. The dealer may buy just before a price falls or sell just before it rises, losing more on inventory than the quoted spread earned. I would examine fill patterns, post-trade price movement, volatility, and information conditions, then adjust quote width, size, or risk limits. Not every losing fill is informed trading; analysis should separate market movement, execution quality, and ordinary inventory noise.",
        "mistake": "Treating every post-fill price move as proof the customer was informed or the quote was wrong."
      }
    ],
    "selfCheck": {
      "question": "If matched trades earn $20 but unsold inventory loses $30, what is the net mark before fees?",
      "answer": "$20 spread capture − $30 inventory mark = −$10 before fees and hedging."
    }
  },
  {
    "id": "sales-trading-6",
    "title": "Mental Math",
    "track": "Sales & Trading",
    "explanation": "Mental math helps a trader estimate value, risk, and order size quickly, catch mistakes, and explain a market move in a conversation. The goal is not to replace precise systems or contract calculations; it is to produce a checked approximation with units. Useful techniques include converting basis points to decimals, finding one percent of a base, decomposing multiplication, estimating duration-based bond moves, and checking whether the result is the right order of magnitude. State rounding openly and refine with a calculator when precision affects execution.\n\nPercent change uses the original value as denominator, which differs from a percentage-point change. A 25-basis-point rate move is 0.25%, not 25%; on a $4m notional, a simple annualized sensitivity is $10,000 before day count, compounding, and instrument-specific conventions. For bonds, DV01 estimates value change per basis point; for options, payoff may be nonlinear. Always track currency, shares, notional, rate period, and whether an amount is annualized. Under time pressure, calculate a rough answer, then reverse-check it—for example, a 1% move on $1m is $10,000. In interviews, the interviewer often cares as much about method and error-checking as speed. A confident incorrect answer is worse than stating a rounded estimate and verifying the assumptions. Mental estimates also help flag inconsistent quotes before execution.",
    "framework": "Percent change = (new − old) ÷ old. One basis point = 0.01 percentage point = 0.0001 in decimal rate. Simple amount sensitivity ≈ notional × rate change, with day-count and compounding conventions stated.",
    "example": {
      "assumptions": "Calculate a simple annualized 25 bp rate amount on $4m notional; ignore day count, compounding, and instrument-specific sensitivity.",
      "steps": [
        "1. Convert 25 basis points to 0.25 percentage point = 0.0025 as a decimal.",
        "2. One percent of $4m is $40,000; one quarter of that is $10,000.",
        "3. Direct multiplication confirms $4,000,000 × 0.0025 = $10,000 per year on a simple basis.",
        "4. If the rate changes for only half a year, a simple time-scaled estimate is $10,000 × 0.5 = $5,000, before contract conventions."
      ],
      "checks": [
        {
          "label": "decimal rate",
          "a": 25,
          "op": "/",
          "b": 10000,
          "result": 0.0025
        },
        {
          "label": "annualized amount",
          "a": 4000000,
          "op": "*",
          "b": 0.0025,
          "result": 10000
        },
        {
          "label": "half-year amount",
          "a": 10000,
          "op": "*",
          "b": 0.5,
          "result": 5000
        },
        {
          "label": "one percent amount",
          "a": 4000000,
          "op": "*",
          "b": 0.01,
          "result": 40000
        }
      ]
    },
    "questions": [
      {
        "q": "What is the simple annualized dollar effect of 25 basis points on $4 million?",
        "a": "Twenty-five basis points equals 0.25 percentage point, or 0.0025 in decimal form. Multiplying $4,000,000 by 0.0025 gives $10,000 for a full year on a simple notional basis. I would say this is an approximation, not necessarily the actual P&L of a bond, swap, or loan; day count, compounding, reset timing, and the instrument's sensitivity matter. I would check the units and direction before communicating the number, and use the contract calculation for execution or settlement. A reset date can further divide the exposure.",
        "mistake": "Treating 25 basis points as 0.25 in decimal form and overstating the result by 100 times."
      },
      {
        "q": "How do you estimate a percentage move quickly without a calculator?",
        "a": "I find one percent of the base by dividing by 100, then scale to the requested percentage. For example, one percent of $4m is $40,000, so a quarter of one percent—25 basis points—is $10,000. For less convenient percentages I round the base, decompose the rate, and check the magnitude against a direct calculation. I state the approximation and denominator, especially when comparing percentage change with percentage points. If the number drives risk or a quote, I verify it precisely before acting. I keep a separate line for each currency and maturity.",
        "mistake": "Using the new value rather than the original base when calculating percent change."
      },
      {
        "q": "An asset rises from $80 to $84. What is the percentage gain, and how would you check it?",
        "a": "The dollar increase is $4. Divide by the original $80 price: $4/$80 equals 5%. I can check by calculating 5% of $80, which is $4, confirming the result. The denominator matters: $4/$84 would answer a different question about the gain as a fraction of ending value. I would also state whether the move includes distributions, fees, or currency effects; a simple price return excludes them. I would mention the observed time interval explicitly. This check catches denominator errors quickly in conversation.",
        "mistake": "Dividing the $4 gain by the ending price of $84 rather than the starting price of $80."
      }
    ],
    "selfCheck": {
      "question": "Convert 25 basis points to a decimal and multiply it by $4m.",
      "answer": "25 bp = 0.0025; $4,000,000 × 0.0025 = $10,000 on a simple annualized basis."
    }
  },
  {
    "id": "sales-trading-7",
    "title": "Risk Management",
    "track": "Sales & Trading",
    "explanation": "Trading risk management measures how positions respond to market factors and establishes controls before a loss threatens capital or liquidity. A rates book may track DV01 by maturity bucket, curve risk, spread duration, and convexity; an options book needs delta, gamma, vega, and scenario risk; an equity book may aggregate beta, sector, factor, borrow, and event exposure. P&L limits and stop protocols complement, rather than replace, understanding the position. A hedge can offset one sensitivity while leaving basis, volatility, liquidity, and counterparty risk.\n\nStress scenarios should combine plausible moves across correlated instruments, including gaps, spread widening, funding shocks, and reduced market depth. Limits need escalation paths and owners; after an exception, confirm positions, prices, and exposure before deciding whether to reduce or hedge. DV01 estimates the dollar price impact of a one-basis-point yield change near current conditions; it is not exact for large changes or nonparallel shifts. Historical volatility and VaR can miss structural changes. Traders should reconcile desk risk with independent controls and understand product-specific margin and settlement. In an interview, quantify a scenario, identify its assumptions, and state the action if exposure approaches limits. Risk appetite, limit frameworks, and escalation obligations vary by firm and market. A desk should know its escalation contacts before volatility spikes.",
    "framework": "Linear price risk ≈ sensitivity × factor move. DV01 is approximate dollar price change per 1 bp yield move. Aggregate by key risk factor and test joint scenarios, liquidity, hedges, and limit actions; include convexity for larger rate shocks.",
    "example": {
      "assumptions": "Bond position has DV01 of $4,000 per basis point; assume a parallel +10 bp yield shift and ignore convexity, spread changes, and hedging.",
      "steps": [
        "1. Yield move is +10 basis points.",
        "2. Approximate bond P&L = −$4,000 DV01 × 10 = −$40,000 because yields rose.",
        "3. If trading NAV is $5m, the loss is $40,000 ÷ $5m = 0.8% of NAV.",
        "4. This local estimate should be compared with full repricing and key-rate risk before a larger or nonparallel shock is relied on."
      ],
      "checks": [
        {
          "label": "approximate P&L",
          "a": -4000,
          "op": "*",
          "b": 10,
          "result": -40000
        },
        {
          "label": "loss fraction",
          "a": 40000,
          "op": "/",
          "b": 5000000,
          "result": 0.008
        },
        {
          "label": "post-shock NAV",
          "a": 5000000,
          "op": "-",
          "b": 40000,
          "result": 4960000
        },
        {
          "label": "basis-point shock",
          "a": 7,
          "op": "+",
          "b": 3,
          "result": 10
        }
      ]
    },
    "questions": [
      {
        "q": "A bond position has $4,000 DV01. Estimate the impact of a 10 bp rise in yields.",
        "a": "DV01 is the approximate dollar change for a one-basis-point yield move. For a parallel 10 bp increase, the first-order P&L is about negative $4,000 times 10, or negative $40,000. The sign is negative because a fixed-income price generally falls as yields rise. I would compare this with NAV and risk limits, then use full repricing for convexity, spread changes, key-rate effects, or a large shock. DV01 is local to current holdings and market conditions; it is not a guaranteed loss bound.",
        "mistake": "Forgetting the inverse price-yield direction or using percentage points instead of basis points."
      },
      {
        "q": "What would you do when a desk approaches a risk limit during a fast market?",
        "a": "I would verify positions, prices, and risk calculations first, then communicate the exposure to the responsible risk manager and desk lead under the firm's escalation rules. I would identify which factor or scenario drives the breach and evaluate reducing, hedging, or pausing new risk while accounting for market liquidity and hedge basis. I would not wait for a limit breach to become a realized loss, nor would I force a trade without checking execution consequences. Any exception or temporary action should be recorded and revisited as market conditions evolve.",
        "mistake": "Ignoring the limit because the position is expected to recover or the market is moving quickly."
      },
      {
        "q": "Why can a hedge fail to remove the risk you intended to offset?",
        "a": "The hedge may reference a different instrument, maturity, index, currency, or volatility surface, leaving basis risk. Correlations can change under stress, and the hedge may have different convexity or liquidity. Counterparty, margin, and funding exposure can create losses even if the market sensitivity offsets in a simple model. I would compare factor exposures and scenario payoffs before and after hedging, identify residual risks, and test the hedge in dislocated conditions. A hedge reduces specified risk; it does not make the position risk-free.",
        "mistake": "Assuming equal notional positions fully offset when their sensitivities and basis differ."
      }
    ],
    "selfCheck": {
      "question": "With $4,000 DV01, a +10 bp parallel move, and $5m NAV, estimate P&L and percent NAV loss.",
      "answer": "Approximate P&L is −$40,000; this equals a 0.8% loss of $5m NAV before convexity and other risks."
    }
  },
  {
    "id": "sales-trading-8",
    "title": "Trade Ideas",
    "track": "Sales & Trading",
    "explanation": "A trade idea converts a market view into an instrument, entry, horizon, expected payoff, and risk plan. Start with the view and the evidence that supports it, then choose an expression whose drivers match the thesis. A directional equity position, options structure, bond maturity, curve spread, or currency pair may expose different factors even when each seems to express the same macro opinion. Analyze carry, financing, borrow, volatility, liquidity, and transaction costs. State what the market currently expects and why a catalyst or new information could create a repricing.\n\nA useful trade plan has entry conditions, target or scenario range, loss threshold, time horizon, and an invalidation condition. Probability-weighted expected payoff can summarize scenarios, but only if probabilities and outcomes are defensible; it does not replace tail-risk analysis. Compare upside and downside in dollars and percentages, including gap and liquidity effects. A trade can be directionally correct but lose money due to poor instrument selection or negative carry. Discuss what happens if the catalyst is delayed and whether the thesis has a natural expiration. In client settings, distinguish a market observation from a recommendation and confirm authority, suitability, and order terms. Trade idea quality is judged by clarity, evidence, and risk control—not confidence of delivery.",
    "framework": "View → instrument expression → entry and horizon → carry/cost/liquidity → scenario payoffs → catalyst and invalidation → size and hedge. Expected payoff = Σ(probabilityᵢ × payoffᵢ), conditional on defensible scenarios.",
    "example": {
      "assumptions": "One-unit trade; gain $10 with probability 60%, loss $8 with probability 40%; mutually exclusive outcomes; ignore costs, timing, and tail scenarios.",
      "steps": [
        "1. Expected gain contribution = 0.60 × $10 = $6.00.",
        "2. Expected loss contribution = 0.40 × $8 = $3.20.",
        "3. Expected payoff = $6.00 − $3.20 = $2.80 per unit before costs.",
        "4. If trading costs are $0.50 per unit, net expected payoff becomes $2.30; the calculation is only as reliable as the assigned probabilities and scenario set."
      ],
      "checks": [
        {
          "label": "weighted gain",
          "a": 0.6,
          "op": "*",
          "b": 10,
          "result": 6
        },
        {
          "label": "weighted loss",
          "a": 0.4,
          "op": "*",
          "b": 8,
          "result": 3.2
        },
        {
          "label": "expected payoff",
          "a": 6,
          "op": "-",
          "b": 3.2,
          "result": 2.8
        },
        {
          "label": "net after costs",
          "a": 2.8,
          "op": "-",
          "b": 0.5,
          "result": 2.3
        }
      ]
    },
    "questions": [
      {
        "q": "Present a trade idea with a defined catalyst and risk plan.",
        "a": "I would state the view, instrument, entry condition, horizon, and the expectation gap first. Then I would show the catalyst, scenario payoff, carry and transaction costs, and what evidence would invalidate the trade. I would quantify both upside and downside and identify liquidity or gap risk. If a one-unit trade gains $10 with 60% probability and loses $8 with 40%, gross expected payoff is $2.80 before costs; a $0.50 cost lowers it to $2.30. Those probabilities require evidence and do not capture every tail outcome.",
        "mistake": "Presenting an expected-value calculation without explaining its probabilities or missing scenarios."
      },
      {
        "q": "How do you select the instrument for a market view?",
        "a": "I map the thesis to the relevant risk factor, then compare available instruments by sensitivity, carry, liquidity, financing, basis, convexity, and downside. A bond future, cash bond, option, or curve spread can respond differently to the same rates view. I would calculate the exposure under a range of shocks and choose an expression that isolates the intended driver without creating unacceptable side risks. Contract availability and client or fund constraints matter. The simplest instrument is not always best, but complexity needs a clear payoff benefit.",
        "mistake": "Choosing an instrument by familiarity without examining embedded exposures and costs."
      },
      {
        "q": "What would make you close a trade before reaching its target?",
        "a": "I would close or resize if the thesis is invalidated, the catalyst passes without the expected information, the risk/reward deteriorates, or portfolio constraints change. A price move alone may be a reason to review, but it does not determine whether the underlying view remains valid. I would also account for carry, borrow, liquidity, and new information. The exit rule should be consistent with the original time horizon and evidence, and any deviation should have a documented rationale rather than an effort to avoid admitting a loss.",
        "mistake": "Moving a stop or target repeatedly to preserve the original narrative after evidence changes."
      }
    ],
    "selfCheck": {
      "question": "For the stated outcomes, what is expected payoff before costs and after $0.50 cost?",
      "answer": "Expected gross payoff is $2.80; after $0.50 costs it is $2.30 per unit."
    }
  },
  {
    "id": "sales-trading-9",
    "title": "Client Communication",
    "track": "Sales & Trading",
    "explanation": "Client communication translates market information into a concise explanation that is relevant to the client's objective and accurately qualified. Begin by clarifying the question, position, horizon, risk tolerance, liquidity needs, and whether the client seeks market color, execution support, or a recommendation. Separate verified facts from desk opinion and scenario analysis. Explain what changed, the likely transmission to the instrument, the main risk, and what evidence would change the view. Avoid jargon without definition and never imply a market outcome is certain.\n\nFor an order, confirm security, side, quantity, limit or urgency, time in force, and authority before execution. A percentage trim or hedge requires the correct base position and clear units. Summarize partial fills and outstanding exposure, state the benchmark used for execution discussion, and disclose material uncertainty or conflicts under applicable policies. Client-specific suitability, best-execution obligations, recordkeeping, and communication restrictions depend on role and jurisdiction; comply with firm procedures and do not cross information barriers. Follow-up should record decisions and assigned actions. Good communication is not simply confident speaking: it is accurate, timely, calibrated to the audience, and clear about the distinction between information and a proposal. In an interview, show how you would tailor detail without changing the underlying facts.",
    "framework": "Clarify client objective and authority → state verified market change → explain instrument-specific impact → identify uncertainty and risks → confirm proposed action/order details → document and follow up.",
    "example": {
      "assumptions": "Client currently holds 2,000 shares and is considering a 15% trim; assume the percentage applies to current shares and fractional shares are not permitted.",
      "steps": [
        "1. Proposed sale quantity = 2,000 shares × 15% = 300 shares.",
        "2. Remaining position after the sale = 2,000 − 300 = 1,700 shares.",
        "3. If the client authorizes a $50 limit sale of 300 shares, maximum gross proceeds at that price are $15,000 if fully filled.",
        "4. Confirm whether 15% means current holdings, cost basis, or portfolio exposure before treating the calculation as an order instruction."
      ],
      "checks": [
        {
          "label": "shares to sell",
          "a": 2000,
          "op": "*",
          "b": 0.15,
          "result": 300
        },
        {
          "label": "remaining shares",
          "a": 2000,
          "op": "-",
          "b": 300,
          "result": 1700
        },
        {
          "label": "gross limit proceeds",
          "a": 300,
          "op": "*",
          "b": 50,
          "result": 15000
        },
        {
          "label": "position reconciliation",
          "a": 1700,
          "op": "+",
          "b": 300,
          "result": 2000
        },
        {
          "label": "midpoint execution shortfall",
          "a": 100.1,
          "op": "-",
          "b": 100,
          "result": 0.1
        }
      ]
    },
    "questions": [
      {
        "q": "How would you explain a volatile market move to a client who wants a clear answer?",
        "a": "I would state the verified move and timeframe, then distinguish known drivers from interpretation. I would explain how the change affects the client's actual instrument and position, describe the main downside and uncertainty, and avoid promising a reversal or a target. I would ask whether the client is seeking information or considering an action, then confirm objectives, liquidity, and authority before discussing an order. A concise answer can be candid: what changed, what remains unknown, and what data I am watching. I would document any decision and follow up when new information arrives.",
        "mistake": "Presenting speculation as fact or using certainty to reassure a client during volatility."
      },
      {
        "q": "A client wants to sell 15% of a 2,000-share holding. What do you confirm before execution?",
        "a": "The arithmetic suggests 300 shares, leaving 1,700, but I would confirm the percentage base and that the client has authorized a sale. I would verify the correct security and account, side, order type, limit price or urgency, time in force, and any restrictions. I would communicate that a limit order may not fill and a market order may execute at an uncertain price. After execution I would report fills and remaining quantity. The calculation is not itself an instruction, and firm policy governs order handling and records.",
        "mistake": "Treating a hypothetical trim calculation as authorization to place an order."
      },
      {
        "q": "How do you distinguish market color from a recommendation?",
        "a": "Market color describes observable conditions or a desk view, with its source, time, and uncertainty made clear. A recommendation applies analysis to a client's objectives and constraints and may trigger suitability, disclosure, or advisory obligations depending on role and jurisdiction. I would label opinions as opinions, avoid implying private information is public, and clarify whether a proposed action is an idea or an authorized order. When uncertain about the capacity in which I am communicating, I would follow firm procedures and seek supervisory guidance rather than blur the distinction.",
        "mistake": "Using casual language that sounds like a personalized recommendation without assessing the client's circumstances or authority."
      }
    ],
    "selfCheck": {
      "question": "What is a 15% trim of 2,000 shares, and how many shares remain?",
      "answer": "Sell 300 shares and retain 1,700, assuming the client confirms that percentage base and authorizes the order."
    }
  },
  {
    "id": "sales-trading-10",
    "title": "Decisions Under Pressure",
    "track": "Sales & Trading",
    "explanation": "Trading under pressure requires a fast process that protects against avoidable errors while respecting market and risk constraints. First verify the instrument, position, price, timestamp, and data source; stale or misidentified information can turn a reasonable response into a costly mistake. Define the immediate objective—reduce exposure, hedge a known factor, execute a client order, or wait for confirmation—and identify limits and authority. Estimate the P&L and liquidity consequences of a few plausible scenarios, then choose an action consistent with the mandate.\n\nTime pressure does not justify skipping order checks, escalation, or client confirmation. Use clear communication: state what is known, what remains uncertain, what action is being taken, and what trigger causes reassessment. After execution, check fills and residual exposure, then update risk measures and records. A pause to verify a critical input may be faster than unwinding an erroneous trade. Decision quality is judged by process and outcome, but a favorable result does not excuse a control failure. During a gap or system outage, follow incident and kill-switch procedures rather than improvising outside authority. Risk appetite and escalation chains vary by firm; know them before an event. In an interview, explain the checklist you would run, how you would involve risk or a supervisor, and how you would adapt if information changes before the order completes.",
    "framework": "Observe and verify → define objective and authority → size scenario loss → act within limits → communicate → confirm execution and residual risk → reassess as evidence changes.",
    "example": {
      "assumptions": "A $1m linear position marks down 5%; ignore hedges, fees, liquidity discount, and other portfolio changes; use the calculation to frame a review, not an automatic trade.",
      "steps": [
        "1. Mark-to-market loss = $1m × 5% = $50,000.",
        "2. Loss as a fraction of notional = $50,000 ÷ $1m = 5%.",
        "3. If the permitted remaining risk budget is $30,000, the current mark exceeds it by $20,000.",
        "4. Verify exposure, price, thesis, liquidity, and authority; the arithmetic identifies a review trigger but does not alone determine whether to sell or hedge."
      ],
      "checks": [
        {
          "label": "mark-to-market loss",
          "a": 1000000,
          "op": "*",
          "b": 0.05,
          "result": 50000
        },
        {
          "label": "loss percentage",
          "a": 50000,
          "op": "/",
          "b": 1000000,
          "result": 0.05
        },
        {
          "label": "risk-budget excess",
          "a": 50000,
          "op": "-",
          "b": 30000,
          "result": 20000
        },
        {
          "label": "notional after hypothetical 10% reduction",
          "a": 1000000,
          "op": "*",
          "b": 0.9,
          "result": 900000
        }
      ]
    },
    "questions": [
      {
        "q": "A position is down 5% in a fast market. What do you do first?",
        "a": "I verify that the position, price, timestamp, and market data are correct, then calculate exposure and loss relative to the relevant limit. I check whether the thesis or a factor exposure changed and identify liquidity, gap, and hedge risks. I communicate with the desk lead or risk function under established escalation rules and act only within authority. The arithmetic can trigger review, but it does not by itself dictate a sale. After any trade I confirm fills, residual exposure, and updated risk, then document the rationale and next trigger.",
        "mistake": "Averaging down or liquidating immediately before checking the position, data, and mandate."
      },
      {
        "q": "How would you respond to a suspected erroneous price or order during a volatile session?",
        "a": "I would stop or contain further action if permitted by procedure, verify the instrument, order details, market source, and system status, and notify the responsible supervisor or operations/risk contact. I would preserve timestamps and order records, assess whether a client or counterparty was affected, and follow the firm's error-trade or incident process. I would not conceal the issue or create offsetting trades without authorization. Once facts are established, we can evaluate correction, client communication, and controls to prevent recurrence. Applicable reporting and remedies depend on the market and firm policy.",
        "mistake": "Trying to silently reverse or disguise an error without alerting the required control functions."
      },
      {
        "q": "How do you make a decision when the data are incomplete but the market is moving?",
        "a": "I separate facts I can verify from estimates and identify the minimum information needed to act safely. I define the objective, maximum acceptable exposure, and options such as reducing size, using a limit, waiting for confirmation, or escalating. I compare the cost of delay with the risk of acting on a false assumption and communicate the uncertainty. If I act, I use a size and order type that remain within authority, monitor the result, and reassess when new data arrive. The process should be pre-agreed where possible rather than invented during stress.",
        "mistake": "Treating urgency as evidence that an unverified assumption is correct or that limits no longer apply."
      }
    ],
    "selfCheck": {
      "question": "A $1m position is down 5% against a $30,000 remaining risk budget. By how much does the mark exceed that budget?",
      "answer": "The mark is $50,000; it exceeds the remaining budget by $20,000, prompting verification and escalation under policy."
    }
  }
];
