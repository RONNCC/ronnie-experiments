export default [
  {
    "id": "hedge-funds-1",
    "title": "Financial Modeling",
    "track": "Hedge Funds",
    "explanation": "Financial Modeling matters in hedge funds because it turns financial information into a decision another person can inspect. A financial model turns an investment hypothesis into explicit operating, financial, and valuation assumptions that can be challenged. For public equities, the model should link business drivers to revenue, margins, cash flow, balance sheet, and valuation, with scenarios and sensitivity around uncertain inputs. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Revenue=volume×price (or customers×ARPU); operating income=revenue−operating costs; FCF=operating cash flow−capex. Build base, upside, and downside cases with internally consistent drivers. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Revenue=volume×price (or customers×ARPU); operating income=revenue−operating costs; FCF=operating cash flow−capex. Build base, upside, and downside cases with internally consistent drivers.",
    "example": "A firm sells 2m units at $50: revenue=$100m. At 30% gross margin, gross profit=$30m. If operating costs are $20m, operating income=$10m, before interest and tax.",
    "questions": [
      {
        "q": "How would you explain financial modeling to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: A financial model turns an investment hypothesis into explicit operating, financial, and valuation assumptions that can be challenged. For public equities, the model should link business drivers to revenue, margins, cash flow, balance sheet, and valuation, with scenarios and sensitivity around uncertain inputs. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical financial modeling analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Revenue=volume×price (or customers×ARPU); operating income=revenue−operating costs; FCF=operating cash flow−capex. Build base, upside, and downside cases with internally consistent drivers. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying financial modeling, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Revenue=volume×price (or customers×ARPU); operating income=revenue−operating costs; FCF=operating cash flow−capex. Build base, upside, and downside cases with internally consistent drivers.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a financial modeling conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-2",
    "title": "Valuation",
    "track": "Hedge Funds",
    "explanation": "Valuation matters in hedge funds because it turns financial information into a decision another person can inspect. Investors value securities using methods suited to their economics and market context. Equity DCF focuses on cash available to equity; enterprise DCF values operations before financing; multiples provide market comparisons. Scenario analysis makes assumptions and risk visible rather than hiding uncertainty in a point estimate. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Equity value per share=equity value/diluted shares. EV=equity value+debt−cash; EV/EBITDA=EV/EBITDA. For constant growth, value=next-period cash flow/(required return−growth), where return must exceed growth. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Equity value per share=equity value/diluted shares. EV=equity value+debt−cash; EV/EBITDA=EV/EBITDA. For constant growth, value=next-period cash flow/(required return−growth), where return must exceed growth.",
    "example": "Enterprise value=$500m, debt=$80m, cash=$20m gives equity value=$440m. With 40m diluted shares, value=$11/share. This ignores other claims and assumes a consistent share count.",
    "questions": [
      {
        "q": "How would you explain valuation to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: Investors value securities using methods suited to their economics and market context. Equity DCF focuses on cash available to equity; enterprise DCF values operations before financing; multiples provide market comparisons. Scenario analysis makes assumptions and risk visible rather than hiding uncertainty in a point estimate. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical valuation analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Equity value per share=equity value/diluted shares. EV=equity value+debt−cash; EV/EBITDA=EV/EBITDA. For constant growth, value=next-period cash flow/(required return−growth), where return must exceed growth. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying valuation, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Equity value per share=equity value/diluted shares. EV=equity value+debt−cash; EV/EBITDA=EV/EBITDA. For constant growth, value=next-period cash flow/(required return−growth), where return must exceed growth.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a valuation conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-3",
    "title": "Investment Thesis",
    "track": "Hedge Funds",
    "explanation": "Investment Thesis matters in hedge funds because it turns financial information into a decision another person can inspect. An investment thesis states why a security is mispriced, what evidence supports the view, what could change the market's assessment, and what would prove the idea wrong. It connects business fundamentals, valuation, catalysts, time horizon, and risk into a testable position rather than a compelling story. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Thesis framework: variant perception → evidence → valuation gap → catalyst/timing → disconfirming evidence → risk/reward → monitoring triggers. Expected return depends on price change and distributions, not narrative confidence. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Thesis framework: variant perception → evidence → valuation gap → catalyst/timing → disconfirming evidence → risk/reward → monitoring triggers. Expected return depends on price change and distributions, not narrative confidence.",
    "example": "Buy at $40; estimated value in one year=$48; expected dividend=$1. Simple expected holding-period return=(48−40+1)/40=22.5%, before costs and uncertainty. A thesis must also state downside and the evidence that would invalidate $48.",
    "questions": [
      {
        "q": "How would you explain investment thesis to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: An investment thesis states why a security is mispriced, what evidence supports the view, what could change the market's assessment, and what would prove the idea wrong. It connects business fundamentals, valuation, catalysts, time horizon, and risk into a testable position rather than a compelling story. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical investment thesis analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Thesis framework: variant perception → evidence → valuation gap → catalyst/timing → disconfirming evidence → risk/reward → monitoring triggers. Expected return depends on price change and distributions, not narrative confidence. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying investment thesis, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Thesis framework: variant perception → evidence → valuation gap → catalyst/timing → disconfirming evidence → risk/reward → monitoring triggers. Expected return depends on price change and distributions, not narrative confidence.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a investment thesis conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-4",
    "title": "Stock Pitching",
    "track": "Hedge Funds",
    "explanation": "Stock Pitching matters in hedge funds because it turns financial information into a decision another person can inspect. A stock pitch compresses an investment case into a clear recommendation, differentiated insight, valuation, catalyst, and risk controls. A strong pitch shows how the analyst reached the conclusion, uses evidence rather than adjectives, and is honest about uncertainty and the thesis's weakest link. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Pitch arc: recommendation and horizon → variant view → business/earnings evidence → valuation and scenarios → catalyst → risks and disconfirmation → position/risk plan. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Pitch arc: recommendation and horizon → variant view → business/earnings evidence → valuation and scenarios → catalyst → risks and disconfirmation → position/risk plan.",
    "example": "At $25 per share, a $32 target implies $7 upside, or 28% price upside (7/25), before dividends and probability weighting. A downside case of $20 is 20% below entry; simple upside/downside ratio=7/5=1.4x.",
    "questions": [
      {
        "q": "How would you explain stock pitching to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: A stock pitch compresses an investment case into a clear recommendation, differentiated insight, valuation, catalyst, and risk controls. A strong pitch shows how the analyst reached the conclusion, uses evidence rather than adjectives, and is honest about uncertainty and the thesis's weakest link. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical stock pitching analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Pitch arc: recommendation and horizon → variant view → business/earnings evidence → valuation and scenarios → catalyst → risks and disconfirmation → position/risk plan. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying stock pitching, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Pitch arc: recommendation and horizon → variant view → business/earnings evidence → valuation and scenarios → catalyst → risks and disconfirmation → position/risk plan.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a stock pitching conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-5",
    "title": "Catalyst Identification",
    "track": "Hedge Funds",
    "explanation": "Catalyst Identification matters in hedge funds because it turns financial information into a decision another person can inspect. A catalyst is an event or information flow that may cause investors to reassess expectations; it does not guarantee price movement. Analysts distinguish scheduled events from gradual evidence, estimate what is already priced in, and map the thesis to observable outcomes and timing. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Catalyst map: event/date window → expected observable → consensus or market expectation → thesis implication → alternative outcome → position review trigger. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Catalyst map: event/date window → expected observable → consensus or market expectation → thesis implication → alternative outcome → position review trigger.",
    "example": "If a company earns $2.00/share and the market rerates its P/E from 15x to 17x with earnings unchanged, illustrative value changes from $30 to $34 (13.3%). A catalyst only matters if expectations or perceived risk actually change.",
    "questions": [
      {
        "q": "How would you explain catalyst identification to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: A catalyst is an event or information flow that may cause investors to reassess expectations; it does not guarantee price movement. Analysts distinguish scheduled events from gradual evidence, estimate what is already priced in, and map the thesis to observable outcomes and timing. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical catalyst identification analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Catalyst map: event/date window → expected observable → consensus or market expectation → thesis implication → alternative outcome → position review trigger. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying catalyst identification, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Catalyst map: event/date window → expected observable → consensus or market expectation → thesis implication → alternative outcome → position review trigger.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a catalyst identification conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-6",
    "title": "Short Selling",
    "track": "Hedge Funds",
    "explanation": "Short Selling matters in hedge funds because it turns financial information into a decision another person can inspect. Short selling seeks to profit when a borrowed security falls, but losses can be theoretically unlimited as price rises. The investor must account for borrow availability and cost, dividends owed, margin, recall risk, timing, and the possibility that a sound thesis is early or wrong. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Gross short return before costs=(sale price−cover price)/sale price. Net P&L also includes borrow fees, dividends owed, financing, and transaction costs; loss grows as cover price rises. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Gross short return before costs=(sale price−cover price)/sale price. Net P&L also includes borrow fees, dividends owed, financing, and transaction costs; loss grows as cover price rises.",
    "example": "Short 100 shares at $50 and cover at $40: gross profit=100×$10=$1,000. If borrow fees are $100 and dividends owed $50, net before other costs=$850. If price rises to $70, gross loss=$2,000.",
    "questions": [
      {
        "q": "How would you explain short selling to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: Short selling seeks to profit when a borrowed security falls, but losses can be theoretically unlimited as price rises. The investor must account for borrow availability and cost, dividends owed, margin, recall risk, timing, and the possibility that a sound thesis is early or wrong. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical short selling analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Gross short return before costs=(sale price−cover price)/sale price. Net P&L also includes borrow fees, dividends owed, financing, and transaction costs; loss grows as cover price rises. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying short selling, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Gross short return before costs=(sale price−cover price)/sale price. Net P&L also includes borrow fees, dividends owed, financing, and transaction costs; loss grows as cover price rises.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a short selling conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-7",
    "title": "Macroeconomics",
    "track": "Hedge Funds",
    "explanation": "Macroeconomics matters in hedge funds because it turns financial information into a decision another person can inspect. Macroeconomic analysis links growth, inflation, policy, labor, currencies, and financial conditions to company cash flows and discount rates. The useful question is not merely whether an indicator is high or low, but how a surprise changes expectations, exposures, and relative asset pricing. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Framework: growth/inflation regime → central-bank and fiscal response → rates/FX/credit conditions → sector/company transmission → scenario and hedge. Nominal rate≈real rate+expected inflation as an approximation. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Framework: growth/inflation regime → central-bank and fiscal response → rates/FX/credit conditions → sector/company transmission → scenario and hedge. Nominal rate≈real rate+expected inflation as an approximation.",
    "example": "A $100 bond with a 5% annual coupon yields $5 yearly. If market yield rises, its fixed cash flows discount more heavily and its price falls. This directional relationship depends on maturity and cash-flow timing; it is not a numerical forecast.",
    "questions": [
      {
        "q": "How would you explain macroeconomics to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: Macroeconomic analysis links growth, inflation, policy, labor, currencies, and financial conditions to company cash flows and discount rates. The useful question is not merely whether an indicator is high or low, but how a surprise changes expectations, exposures, and relative asset pricing. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical macroeconomics analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Framework: growth/inflation regime → central-bank and fiscal response → rates/FX/credit conditions → sector/company transmission → scenario and hedge. Nominal rate≈real rate+expected inflation as an approximation. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying macroeconomics, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Framework: growth/inflation regime → central-bank and fiscal response → rates/FX/credit conditions → sector/company transmission → scenario and hedge. Nominal rate≈real rate+expected inflation as an approximation.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a macroeconomics conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-8",
    "title": "Risk Management",
    "track": "Hedge Funds",
    "explanation": "Risk Management matters in hedge funds because it turns financial information into a decision another person can inspect. Risk management identifies how a position can lose money, how losses may compound or correlate, and what actions remain possible under stress. It includes market, liquidity, financing, operational, and thesis risks; a stop or limit is a tool, not a substitute for understanding exposure. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Position P&L≈exposure×price return for a linear instrument. Portfolio risk also depends on covariance: Var(portfolio)=wᵀΣw. Stress scenarios complement historical measures. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Position P&L≈exposure×price return for a linear instrument. Portfolio risk also depends on covariance: Var(portfolio)=wᵀΣw. Stress scenarios complement historical measures.",
    "example": "A $2m position falls 8%: loss=$160,000. If portfolio NAV=$20m, this loss is 0.8% of NAV. This simple mark-to-market calculation excludes leverage, hedges, liquidity, and correlated losses.",
    "questions": [
      {
        "q": "How would you explain risk management to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: Risk management identifies how a position can lose money, how losses may compound or correlate, and what actions remain possible under stress. It includes market, liquidity, financing, operational, and thesis risks; a stop or limit is a tool, not a substitute for understanding exposure. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical risk management analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Position P&L≈exposure×price return for a linear instrument. Portfolio risk also depends on covariance: Var(portfolio)=wᵀΣw. Stress scenarios complement historical measures. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying risk management, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Position P&L≈exposure×price return for a linear instrument. Portfolio risk also depends on covariance: Var(portfolio)=wᵀΣw. Stress scenarios complement historical measures.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a risk management conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-9",
    "title": "Position Sizing",
    "track": "Hedge Funds",
    "explanation": "Position Sizing matters in hedge funds because it turns financial information into a decision another person can inspect. Position sizing translates conviction and risk tolerance into exposure while respecting liquidity, concentration, leverage, and portfolio constraints. It should be tied to a defined loss scenario and revised when price, thesis, volatility, or liquidity changes. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Risk-budget sizing: shares=maximum acceptable dollar loss/(entry price−stop price) for a long with a defined stop; dollar exposure=shares×entry price. Stops do not guarantee execution price. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Risk-budget sizing: shares=maximum acceptable dollar loss/(entry price−stop price) for a long with a defined stop; dollar exposure=shares×entry price. Stops do not guarantee execution price.",
    "example": "Risk budget=$2,000; entry=$50; planned exit threshold=$45, so risk/share=$5 and size=400 shares. Notional=$20,000. A gap below $45 can produce a larger realized loss.",
    "questions": [
      {
        "q": "How would you explain position sizing to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: Position sizing translates conviction and risk tolerance into exposure while respecting liquidity, concentration, leverage, and portfolio constraints. It should be tied to a defined loss scenario and revised when price, thesis, volatility, or liquidity changes. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical position sizing analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Risk-budget sizing: shares=maximum acceptable dollar loss/(entry price−stop price) for a long with a defined stop; dollar exposure=shares×entry price. Stops do not guarantee execution price. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying position sizing, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Risk-budget sizing: shares=maximum acceptable dollar loss/(entry price−stop price) for a long with a defined stop; dollar exposure=shares×entry price. Stops do not guarantee execution price.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a position sizing conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  },
  {
    "id": "hedge-funds-10",
    "title": "Portfolio Construction",
    "track": "Hedge Funds",
    "explanation": "Portfolio Construction matters in hedge funds because it turns financial information into a decision another person can inspect. Portfolio construction combines individual opportunities into a set of exposures whose aggregate risk, liquidity, and capital use fit the mandate. Diversification depends on economic drivers and correlations, not simply number of holdings; sizing should account for overlapping factor and event exposures. Begin by defining the question, the relevant entity and period, and the decision-maker's objective. Identify which inputs are reported facts, which are estimates, and which are assumptions; keep units, timing, and accounting definitions consistent. Then build the analysis from the underlying drivers rather than selecting an answer first. The framework for this topic is: Portfolio return≈Σwᵢrᵢ; weights wᵢ sum to 1 for a fully invested unlevered portfolio. Variance=wᵀΣw; gross exposure=Σ|wᵢ|, net exposure=Σwᵢ with signed weights. Next, test the conclusion under a plausible alternative and trace the result back to its sources. Ask what would change the answer, which risks are asymmetric, and whether a contractual, market, or client-specific constraint applies. A calculation still needs context. In an interview, state your method, explain the important judgment, quantify the result, and name a limitation. The worked example below is deliberately illustrative, not a forecast or universal market convention. Definitions may vary, so identify conventions before comparing outputs. This disciplined approach is more useful than memorizing a single multiple, threshold, or product rule.",
    "framework": "Portfolio return≈Σwᵢrᵢ; weights wᵢ sum to 1 for a fully invested unlevered portfolio. Variance=wᵀΣw; gross exposure=Σ|wᵢ|, net exposure=Σwᵢ with signed weights.",
    "example": "A portfolio invests 60% in asset A returning 10% and 40% in B returning −5%: return=.6×10%+.4×(−5%)=4%. A long/short book with $120 long and $80 short has $200 gross and $40 net exposure.",
    "questions": [
      {
        "q": "How would you explain portfolio construction to a colleague outside the specialty?",
        "a": "I would start with the decision it supports, define the key inputs and conventions, then explain the causal link: Portfolio construction combines individual opportunities into a set of exposures whose aggregate risk, liquidity, and capital use fit the mandate. Diversification depends on economic drivers and correlations, not simply number of holdings; sizing should account for overlapping factor and event exposures. I would finish with the implication, a downside or limitation, and the evidence I would verify before acting.",
        "mistake": "Giving a definition without linking it to a decision, evidence, or limitation."
      },
      {
        "q": "Walk me through a practical portfolio construction analysis.",
        "a": "I would state the objective and period, validate the inputs, and apply this framework: Portfolio return≈Σwᵢrᵢ; weights wᵢ sum to 1 for a fully invested unlevered portfolio. Variance=wᵀΣw; gross exposure=Σ|wᵢ|, net exposure=Σwᵢ with signed weights. I would calculate transparently, check units and internal consistency, and show a base case plus a meaningful sensitivity. The example in this section demonstrates the arithmetic; in practice I would reconcile the result to source documents and the governing conventions.",
        "mistake": "Mixing inconsistent periods or definitions, or hiding an assumption in a plug."
      },
      {
        "q": "What can go wrong when applying portfolio construction, and how would you test your conclusion?",
        "a": "The main risk is treating an assumption or incomplete evidence as certain. I would test the drivers that matter most, consider a credible adverse case, and identify what observation would change my view. Specifically, I would check that the conclusion remains coherent with the framework—Portfolio return≈Σwᵢrᵢ; weights wᵢ sum to 1 for a fully invested unlevered portfolio. Variance=wᵀΣw; gross exposure=Σ|wᵢ|, net exposure=Σwᵢ with signed weights.—and document any firm-, agreement-, or jurisdiction-specific definition.",
        "mistake": "Overstating precision, ignoring a downside case, or presenting an illustrative result as a universal rule."
      }
    ],
    "selfCheck": {
      "question": "Name one key input or definition that could change a portfolio construction conclusion, and explain why.",
      "answer": "Start with the assumptions and definitions in the framework above. A strong answer identifies a decision-relevant input, explains the direction of impact, and says how to verify it; there is not always one universal convention."
    }
  }
];
