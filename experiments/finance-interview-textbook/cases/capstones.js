export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/); if (!lines.length) return [];
  const cells = line => { const out=[]; let value='', quoted=false; for(let i=0;i<line.length;i++){const c=line[i]; if(c==='"'&&line[i+1]==='"'&&quoted){value+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){out.push(value);value='';}else value+=c;}out.push(value);return out; };
  const headers=cells(lines[0]); return lines.slice(1).filter(Boolean).map(line=>Object.fromEntries(cells(line).map((v,i)=>[headers[i],v])));
}
const num = (r,k) => { const x=Number(r[k]); if(!Number.isFinite(x)) throw new Error(`Invalid numeric input ${k}: ${r[k]}`); return x; };
const round = x => Math.round((x + Number.EPSILON)*10000)/10000;
const pct = x => round(x*100);
const sum = xs => xs.reduce((a,b)=>a+b,0);
const normalCdf = x => { const a=Math.abs(x), t=1/(1+0.2316419*a), d=0.3989422804014327*Math.exp(-a*a/2), p=1-d*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429)))); return x>=0?p:1-p; };

export function calculateIbdcf(rows) {
  const years=rows.filter(r=>r.record==='forecast').sort((a,b)=>num(a,'year')-num(b,'year'));
  const c=rows.find(r=>r.record==='control'); if(years.length!==5||!c) throw new Error('IB DCF requires five forecast years and one control row');
  const table=years.map(r=>{const revenue=num(r,'revenue'), ebit=revenue*num(r,'ebit_margin'), nopat=ebit*(1-num(r,'tax_rate')), da=num(r,'da'), capex=num(r,'capex'), nwc=num(r,'delta_nwc'), fcff=nopat+da-capex-nwc; return {year:num(r,'year'),revenue,ebit,nopat,da,capex,deltaNwc:nwc,fcff};});
  const wacc=num(c,'wacc'), g=num(c,'terminal_growth'), roic=num(c,'terminal_roic'); if(wacc<=g||g<0||roic<=0) throw new Error('Require WACC > non-negative terminal growth and positive terminal ROIC');
  const terminalNopat=table.at(-1).nopat*(1+g), terminalReinvestment=terminalNopat*g/roic, terminalFcff=terminalNopat-terminalReinvestment, terminalValue=terminalFcff/(wacc-g);
  const pvForecast=sum(table.map(x=>x.fcff/(1+wacc)**x.year)), pvTerminal=terminalValue/(1+wacc)**5, ev=pvForecast+pvTerminal;
  const equity=ev-num(c,'debt')-num(c,'preferred')-num(c,'minority')+num(c,'cash');
  const sensitivity=[]; for(const sw of [wacc-0.01,wacc,wacc+0.01]) for(const sg of [g-0.01,g,g+0.01]) { if(sw<=sg||sg<0)continue; const tv=(terminalNopat*(1-sg/roic))/(sw-sg); const value=sum(table.map(x=>x.fcff/(1+sw)**x.year))+tv/(1+sw)**5; sensitivity.push({wacc:pct(sw),terminalGrowth:pct(sg),enterpriseValue:round(value)}); }
  return {table:table.map(x=>({...x,revenue:round(x.revenue),ebit:round(x.ebit),nopat:round(x.nopat),da:round(x.da),capex:round(x.capex),deltaNwc:round(x.deltaNwc),fcff:round(x.fcff),discountFactor:round(1/(1+wacc)**x.year),pvFcff:round(x.fcff/(1+wacc)**x.year)})),terminalNopat:round(terminalNopat),terminalReinvestment:round(terminalReinvestment),terminalReinvestmentRate:pct(g/roic),terminalFcff:round(terminalFcff),terminalValue:round(terminalValue),pvForecast:round(pvForecast),pvTerminal:round(pvTerminal),enterpriseValue:round(ev),equityValue:round(equity),shares:num(c,'shares'),valuePerShare:round(equity/num(c,'shares')),sensitivity};
}

export function calculateLbo(rows) {
  const c=rows.find(r=>r.record==='control'), years=rows.filter(r=>r.record==='year').sort((a,b)=>num(a,'year')-num(b,'year')); if(!c||years.length!==5) throw new Error('LBO requires control and five operating years');
  const uses=num(c,'purchase_ev')+num(c,'refinanced_debt')+num(c,'fees')+num(c,'minimum_cash'); const debt0=num(c,'new_debt'), rollover=num(c,'management_rollover'), sponsor=uses-debt0-rollover;
  if(sponsor<=0)throw new Error('Sponsor equity must be positive: verify sources and uses');
  let debt=debt0, cash=num(c,'minimum_cash'); const schedule=years.map(r=>{const beginningDebt=debt, beginningCash=cash, interest=beginningDebt*num(r,'interest_rate'), cashBeforeAmort=num(r,'ebitda')-num(r,'cash_taxes')-num(r,'capex')-num(r,'delta_nwc')-interest, mandatory=Math.min(beginningDebt,num(r,'mandatory_amortization')); if(cashBeforeAmort<mandatory)throw new Error(`Year ${r.year} operating cash cannot fund mandatory amortization; add an explicit liquidity/default model`); const residual=cashBeforeAmort-mandatory, sweep=Math.min(beginningDebt-mandatory,residual*num(c,'cash_sweep_pct')); debt=beginningDebt-mandatory-sweep; const retained=Math.max(0,residual-sweep); cash=beginningCash+retained; return {year:num(r,'year'),ebitda:num(r,'ebitda'),beginningDebt:round(beginningDebt),interest:round(interest),cashBeforeAmort:round(cashBeforeAmort),mandatory:round(mandatory),sweep:round(sweep),endingDebt:round(debt),beginningCash:round(beginningCash),cashRetained:round(retained),endingCash:round(cash)};});
  const last=schedule.at(-1), exitEv=last.ebitda*num(c,'exit_multiple'), proceeds=exitEv-last.endingDebt+last.endingCash-num(c,'exit_fees')+num(c,'interim_distributions'), moic=proceeds/sponsor, irr=moic>0?moic**(1/years.length)-1:NaN;
  const downsideEv=last.ebitda*num(c,'downside_exit_multiple'), downsideProceeds=downsideEv-last.endingDebt+last.endingCash-num(c,'exit_fees')+num(c,'interim_distributions');
  return {uses:round(uses),newDebt:round(debt0),rollover:round(rollover),sponsorEquity:round(sponsor),sources:round(debt0+rollover+sponsor),schedule,exitEnterpriseValue:round(exitEv),exitDebt:round(last.endingDebt),exitCash:round(last.endingCash),exitEquityProceeds:round(proceeds),moic:round(moic),irr:pct(irr),downsideEquityProceeds:round(Math.max(0,downsideProceeds)),downsideMoic:round(Math.max(0,downsideProceeds)/sponsor)};
}

export function calculateCredit(r) {
  const leverage=num(r,'total_debt')/num(r,'covenant_ebitda'), headroom=num(r,'max_leverage')-leverage, cash=num(r,'unrestricted_cash')+num(r,'committed_undrawn_revolver')-num(r,'minimum_liquidity');
  const months=cash/num(r,'monthly_cash_burn'), collateralRecovery=Math.max(0,num(r,'gross_collateral_value')*num(r,'collateral_recovery_rate')-num(r,'enforcement_costs')-num(r,'prior_claims'));
  const securedRecovery=Math.min(num(r,'senior_secured_claim'),collateralRecovery), unsecuredPool=Math.max(0,collateralRecovery-securedRecovery), unsecuredRecovery=Math.min(num(r,'other_claims'),unsecuredPool);
  return {netLeverage:round(leverage),leverageHeadroomTurns:round(headroom),debtCapacityAtLimit:round(Math.max(0,num(r,'max_leverage')*num(r,'covenant_ebitda')-num(r,'total_debt'))),liquidityAfterMinimum:round(cash),runwayMonths:round(months),collateralNetOfCosts:round(collateralRecovery),seniorSecuredRecovery:round(securedRecovery),seniorSecuredRecoveryPct:pct(securedRecovery/num(r,'senior_secured_claim')),otherClaimsRecovery:round(unsecuredRecovery),otherClaimsRecoveryPct:pct(unsecuredRecovery/num(r,'other_claims'))};
}

export function calculateHedge(r) {
  const budget=num(r,'equity')*num(r,'risk_budget_pct'), longRisk=num(r,'long_entry')-num(r,'long_stop'), shortRisk=num(r,'short_stop')-num(r,'short_entry'); if(longRisk<=0||shortRisk<=0)throw new Error('Stops must represent positive per-share loss');
  const longShares=budget*0.5/longRisk, shortShares=budget*0.5/shortRisk, longNotional=longShares*num(r,'long_entry'), shortNotional=shortShares*num(r,'short_entry'), gross=longNotional+shortNotional, net=longNotional-shortNotional;
  const stress=sum([longShares*(num(r,'long_stress_price')-num(r,'long_entry')),shortShares*(num(r,'short_entry')-num(r,'short_stress_price'))]);
  return {riskBudget:round(budget),longShares:round(longShares),shortShares:round(shortShares),longNotional:round(longNotional),shortNotional:round(shortNotional),grossExposurePct:pct(gross/num(r,'equity')),netExposurePct:pct(net/num(r,'equity')),grossLimitPct:pct(num(r,'gross_limit_pct')),netLimitPct:pct(num(r,'net_limit_pct')),stressPnl:round(stress),stopLossBudget:round(budget),grossLimitPass:gross<=num(r,'equity')*num(r,'gross_limit_pct'),netLimitPass:Math.abs(net)<=num(r,'equity')*num(r,'net_limit_pct')};
}

export function calculateMarkets(rows) {
  const b=rows.find(r=>r.record==='bond'), o=rows.find(r=>r.record==='option');
  const face=num(b,'face'), coupon=num(b,'coupon_rate'), y=num(b,'yield'), n=num(b,'years'), flows=Array.from({length:n},(_,i)=>i===n-1?face*(1+coupon):face*coupon);
  const pv=flows.map((cf,i)=>cf/(1+y)**(i+1)), price=sum(pv), macaulay=sum(pv.map((x,i)=>x*(i+1)))/price, modified=macaulay/(1+y), convexity=sum(pv.map((x,i)=>x*(i+1)*(i+2)))/(price*(1+y)**2);
  const dy=num(b,'yield_shock'), bondPct=-modified*dy+0.5*convexity*dy*dy;
  const S=num(o,'spot'),K=num(o,'strike'),t=num(o,'time'),rate=num(o,'risk_free_rate'),vol=num(o,'volatility'),d1=(Math.log(S/K)+(rate+vol*vol/2)*t)/(vol*Math.sqrt(t)),d2=d1-vol*Math.sqrt(t),delta=normalCdf(d1),gamma=Math.exp(-d1*d1/2)/Math.sqrt(2*Math.PI)/(S*vol*Math.sqrt(t)),vega=S*Math.exp(-d1*d1/2)/Math.sqrt(2*Math.PI)*Math.sqrt(t),contracts=num(o,'contracts'),mult=num(o,'contract_multiplier'), hedgeShares=-delta*contracts*mult, spotMove=num(o,'spot_shock'), volMove=num(o,'volatility_shock'), optionPnl=contracts*mult*(delta*spotMove+0.5*gamma*spotMove**2+(vega*volMove));
  const deltaHedgePnl=hedgeShares*spotMove, hedgedOptionPnl=optionPnl+deltaHedgePnl, bondDollarPnl=price*bondPct;
  return {bondPrice:round(price),macaulayDuration:round(macaulay),modifiedDuration:round(modified),convexity:round(convexity),bondPriceChangePct:pct(bondPct),bondDollarPnl:round(bondDollarPnl),optionDelta:round(delta),optionGamma:round(gamma),optionVegaPerVolPoint:round(vega*0.01),deltaHedgeShares:round(hedgeShares),optionStressApproxPnl:round(optionPnl),deltaHedgeStressPnl:round(deltaHedgePnl),hedgedOptionStressApproxPnl:round(hedgedOptionPnl),combinedStressPnl:round(hedgedOptionPnl+bondDollarPnl)};
}

export function calculateResearch(r) {
  const revision=num(r,'new_eps')/num(r,'old_eps')-1, target=num(r,'new_eps')*num(r,'target_pe'), priceReturn=target/num(r,'share_price')-1, totalReturn=priceReturn+num(r,'dividend_yield'), rating=totalReturn>=num(r,'positive_threshold')?'Positive':totalReturn<=num(r,'negative_threshold')?'Negative':'Neutral';
  return {oldEps:num(r,'old_eps'),newEps:num(r,'new_eps'),epsRevisionPct:pct(revision),targetPe:num(r,'target_pe'),targetPrice:round(target),sharePrice:num(r,'share_price'),priceUpsidePct:pct(priceReturn),illustrativeTotalReturnPct:pct(totalReturn),illustrativeRating:rating,positiveThresholdPct:pct(num(r,'positive_threshold')),negativeThresholdPct:pct(num(r,'negative_threshold'))};
}

export function calculateWealth(r) {
  const balance=num(r,'current_retirement_assets'), contribution=num(r,'annual_contribution'), years=num(r,'years_to_retirement'), ret=num(r,'nominal_return'), inflation=num(r,'inflation'), fv=balance*(1+ret)**years+contribution*((1+ret)**years-1)/ret, afterTax=fv*(1-num(r,'illustrative_withdrawal_tax_rate')), targetSpend=num(r,'annual_spending_today')*(1+inflation)**years, targetPortfolio=targetSpend/num(r,'illustrative_withdrawal_rate'), realReturn=(1+ret)/(1+inflation)-1, homeGoal=num(r,'home_goal_today')*(1+inflation)**num(r,'home_goal_years');
  return {projectedNominalAssets:round(fv),illustrativeAfterTaxAssets:round(afterTax),futureAnnualSpendingGoal:round(targetSpend),illustrativeCapitalTarget:round(targetPortfolio),fundedRatioPct:pct(afterTax/targetPortfolio),realReturnPct:pct(realReturn),inflatedHomeGoal:round(homeGoal),assumedTaxRatePct:pct(num(r,'illustrative_withdrawal_tax_rate'))};
}

export const caseRegistry = [
 {id:'ib-dcf',title:'Investment Banking · Five-Year DCF',inputs:'cases/inputs/ib-dcf.csv',outputs:'cases/outputs/ib-dcf.csv',shape:'rows',calculate:calculateIbdcf,description:'Forecast operating cash flow, maintain terminal reinvestment discipline, bridge enterprise value to equity, and inspect a WACC/growth sensitivity.'},
 {id:'pe-lbo',title:'Private Equity · LBO Cash Sweep',inputs:'cases/inputs/pe-lbo.csv',outputs:'cases/outputs/pe-lbo.csv',shape:'rows',calculate:calculateLbo,description:'Balance transaction sources and uses, forecast interest and mandatory amortization, sweep excess cash, then compare base and lower-multiple exits.'},
 {id:'credit-case',title:'Private Credit · Covenant, Liquidity & Recovery',inputs:'cases/inputs/credit-case.csv',outputs:'cases/outputs/credit-case.csv',shape:'single',calculate:calculateCredit,description:'Test leverage headroom separately from near-term runway, then estimate a simplified collateral waterfall. Actual loan documents, priority, legal costs and jurisdiction govern.'},
 {id:'hedge-fund-case',title:'Hedge Funds · Long/Short Sizing & Stress',inputs:'cases/inputs/hedge-fund-case.csv',outputs:'cases/outputs/hedge-fund-case.csv',shape:'single',calculate:calculateHedge,description:'Translate a differentiated long and short thesis into stop-based risk sizing, gross/net exposure checks, and a joint stress case. Stops do not guarantee execution.'},
 {id:'markets-case',title:'Sales & Trading · Bond Risk and Option Hedge',inputs:'cases/inputs/markets-case.csv',outputs:'cases/outputs/markets-case.csv',shape:'rows',calculate:calculateMarkets,description:'Price an annual-coupon bond and estimate duration/convexity exposure, then calculate a Black–Scholes call delta/gamma/vega hedge and a local stress approximation.'},
 {id:'research-case',title:'Equity Research · Earnings Revision & Rating Memo',inputs:'cases/inputs/research-case.csv',outputs:'cases/outputs/research-case.csv',shape:'single',calculate:calculateResearch,description:'Convert a forecast EPS revision into a target value and explicit total-return scenario. Rating labels and thresholds are invented for this teaching case, not industry standards.'},
 {id:'wealth-case',title:'Wealth Management · Goals, Allocation & Retirement',inputs:'cases/inputs/wealth-case.csv',outputs:'cases/outputs/wealth-case.csv',shape:'single',calculate:calculateWealth,description:'Compare a goal-based accumulation projection with illustrative spending needs, inflation and tax assumptions. Entirely hypothetical educational material—not financial, tax, or investment advice.'},
];
export function calculateCase(testCase, rows) { return testCase.calculate(testCase.shape === 'single' ? rows[0] : rows); }


export function flattenResult(value, prefix = '', out = {}) {
  for (const [key, item] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === 'object' && !Array.isArray(item)) flattenResult(item, name, out);
    else if (Array.isArray(item)) item.forEach((child, index) => child && typeof child === 'object' ? flattenResult(child, `${name}.${index + 1}`, out) : out[`${name}.${index + 1}`] = child);
    else out[name] = item;
  }
  return out;
}
export function csvForOutput(result) {
  const flat = flattenResult(result);
  return ['metric,value', ...Object.entries(flat).map(([metric, value]) => `${metric},${value}`)].join('\n') + '\n';
}
