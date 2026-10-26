import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { caseRegistry, parseCsv, calculateCase, flattenResult } from '../cases/capstones.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const near = (a,b,tolerance=0.00011) => assert.ok(Math.abs(Number(a)-Number(b))<=tolerance, `${a} differs from ${b} by more than ${tolerance}`);
function inputs(testCase) { return parseCsv(fs.readFileSync(path.join(root,testCase.inputs),'utf8')); }
function expected(testCase) { return Object.fromEntries(parseCsv(fs.readFileSync(path.join(root,testCase.outputs),'utf8')).map(row=>[row.metric,row.value])); }

test('all capstone output CSVs reproduce from their downloadable input CSVs',()=>{
  assert.equal(caseRegistry.length,8);
  for(const testCase of caseRegistry){
    const rows=inputs(testCase); assert.ok(rows.length>0,`${testCase.id} input rows`);
    const actual=flattenResult(calculateCase(testCase,rows)); const wanted=expected(testCase);
    assert.deepEqual(Object.keys(wanted).sort(),Object.keys(actual).sort(),`${testCase.id} metric coverage`);
    for(const [key,value] of Object.entries(actual)){
      if(typeof value==='number') near(value,wanted[key]); else assert.equal(String(value),wanted[key],`${testCase.id}.${key}`);
    }
  }
});

test('DCF rows, terminal reinvestment, discounting and equity bridge tie to source inputs',()=>{
  const c=caseRegistry.find(x=>x.id==='ib-dcf'), rows=inputs(c), result=calculateCase(c,rows), control=rows.find(r=>r.record==='control');
  for(let i=0;i<5;i++){const row=rows.find(r=>r.record==='forecast'&&Number(r.year)===i+1), calc=result.table[i]; near(calc.ebit,Number(row.revenue)*Number(row.ebit_margin)); near(calc.nopat,calc.ebit*(1-Number(row.tax_rate))); near(calc.fcff,calc.nopat+Number(row.da)-Number(row.capex)-Number(row.delta_nwc));}
  near(result.terminalReinvestment,result.terminalNopat*Number(control.terminal_growth)/Number(control.terminal_roic));
  near(result.enterpriseValue,result.pvForecast+result.pvTerminal); near(result.equityValue,result.enterpriseValue-Number(control.debt)-Number(control.preferred)-Number(control.minority)+Number(control.cash));
  near(result.sensitivity.find(s=>s.wacc===Number(control.wacc)*100&&s.terminalGrowth===Number(control.terminal_growth)*100).enterpriseValue,result.enterpriseValue);
  const changed=rows.map(r=>({...r})); changed.find(r=>r.record==='forecast'&&r.year==='1').revenue=String(Number(changed.find(r=>r.record==='forecast'&&r.year==='1').revenue)+10);
  assert.notEqual(calculateCase(c,changed).enterpriseValue,result.enterpriseValue,'changing the fixture input changes the recalculated EV');
});

test('LBO sources and uses balance; annual debt, interest and return schedule recalculate',()=>{
  const c=caseRegistry.find(x=>x.id==='pe-lbo'), rows=inputs(c), control=rows.find(r=>r.record==='control'), result=calculateCase(c,rows);
  near(result.sources,result.uses); near(result.sponsorEquity,result.uses-Number(control.new_debt)-Number(control.management_rollover));
  result.schedule.forEach((year,i)=>{near(year.interest,year.beginningDebt*Number(rows.find(r=>r.record==='year'&&Number(r.year)===i+1).interest_rate)); near(year.endingDebt,year.beginningDebt-year.mandatory-year.sweep); if(i)near(year.beginningDebt,result.schedule[i-1].endingDebt); assert.ok(year.cashBeforeAmort>=year.mandatory,`year ${year.year} cash funds scheduled amortization`);});
  near(result.irr,((result.exitEquityProceeds/result.sponsorEquity)**(1/5)-1)*100,0.001); near(result.totalExitEquityProceeds,result.exitEnterpriseValue-result.exitDebt+result.exitCash-Number(control.exit_fees)); near(result.exitEquityProceeds,result.totalExitEquityProceeds*result.sponsorEquity/(result.sponsorEquity+result.rollover)); near(result.uses,Number(control.purchase_ev)+Number(control.fees)+Number(control.minimum_cash)); result.schedule.forEach((year,i)=>{near(year.endingCash,year.beginningCash+year.cashRetained);if(i)near(year.beginningCash,result.schedule[i-1].endingCash);});
});

test('credit, long/short, market-risk, research and retirement outputs are input-sensitive and bounded',()=>{
  const credit=caseRegistry.find(x=>x.id==='credit-case'),cr=calculateCase(credit,inputs(credit)); near(cr.grossLeverage,140/40); near(cr.runwayMonths,(15+10-5)/4); assert.ok(cr.seniorSecuredRecovery<=100);
  const hf=caseRegistry.find(x=>x.id==='hedge-fund-case'),hr=calculateCase(hf,inputs(hf)); assert.equal(hr.grossLimitPass,true); assert.equal(hr.netLimitPass,true); assert.ok(hr.stressPnl < -hr.stopLossBudget,'joint stress can exceed stop-based risk budget');
  const markets=caseRegistry.find(x=>x.id==='markets-case'),mr=calculateCase(markets,inputs(markets)); assert.ok(mr.bondPrice>0&&mr.modifiedDuration>0&&mr.convexity>0); assert.ok(mr.optionDelta>0&&mr.optionDelta<1); near(mr.deltaHedgeShares,-mr.optionDelta*10*100,0.01);
  const research=caseRegistry.find(x=>x.id==='research-case'), rr=calculateCase(research,inputs(research)); near(rr.epsRevisionPct,-10); near(rr.targetPrice,3.6*18); assert.equal(rr.illustrativeRating,'Neutral');
  const wealth=caseRegistry.find(x=>x.id==='wealth-case'), wr=calculateCase(wealth,inputs(wealth)); assert.ok(wr.projectedNominalAssets>500000); assert.ok(wr.illustrativeAfterTaxAssets<wr.projectedNominalAssets); assert.ok(wr.fundedRatioPct>0);
});

test('growth sensitivity changes terminal NOPAT and interim distributions cannot use single-exit shortcut',()=>{
const d=caseRegistry.find(c=>c.id==='ib-dcf'), rows=inputs(d), result=calculateCase(d,rows);
for(const cell of result.sensitivity){const changed=rows.map(r=>({...r}));const c=changed.find(r=>r.record==='control');c.wacc=String(cell.wacc/100);c.terminal_growth=String(cell.terminalGrowth/100);near(calculateCase(d,changed).enterpriseValue,cell.enterpriseValue);}
const l=caseRegistry.find(c=>c.id==='pe-lbo'), lr=inputs(l);lr.find(r=>r.record==='control').interim_distributions='10';assert.throws(()=>calculateCase(l,lr),/Dated interim/);
});

test('merger financing and EPS bridge recomputes from full consideration',()=>{const c=caseRegistry.find(c=>c.id==='ma-case'), r=calculateCase(c,inputs(c));near(r.targetEquityPrice,600);near(r.newDebt+r.stockConsideration+r.cashUsed,600);near(r.sharesIssued,3.75);near(r.recurringNetIncome,200+35+(20-8-18-4.5)*.75);near(r.firstYearNetIncome,r.recurringNetIncome-30*.75);assert.ok(r.recurringAccretionPct>0);assert.ok(r.firstYearAccretionPct<0);});
