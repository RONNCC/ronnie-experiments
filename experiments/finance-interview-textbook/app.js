import investmentBanking from "./tracks/investment-banking.js";
import privateCredit from "./tracks/private-credit.js";
import privateEquity from "./tracks/private-equity.js";
import hedgeFunds from "./tracks/hedge-funds.js";
import salesTrading from "./tracks/sales-trading.js";
import equityResearch from "./tracks/equity-research.js";
import wealthManagement from "./tracks/wealth-management.js";
import ibAdvanced from "./advanced/investment-banking.js";
import creditAdvanced from "./advanced/private-credit.js";
import peAdvanced from "./advanced/private-equity.js";
import hfAdvanced from "./advanced/hedge-funds.js";
import stAdvanced from "./advanced/sales-trading.js";
import erAdvanced from "./advanced/equity-research.js";
import wmAdvanced from "./advanced/wealth-management.js";
import ibJudgment from "./advanced/judgment/investment-banking.js";
import creditJudgment from "./advanced/judgment/private-credit.js";
import peJudgment from "./advanced/judgment/private-equity.js";
import hfJudgment from "./advanced/judgment/hedge-funds.js";
import stJudgment from "./advanced/judgment/sales-trading.js";
import erJudgment from "./advanced/judgment/equity-research.js";
import wmJudgment from "./advanced/judgment/wealth-management.js";
import ibBoundaries from "./advanced/boundaries/investment-banking.js";
import creditBoundaries from "./advanced/boundaries/private-credit.js";
import peBoundaries from "./advanced/boundaries/private-equity.js";
import hfBoundaries from "./advanced/boundaries/hedge-funds.js";
import stBoundaries from "./advanced/boundaries/sales-trading.js";
import erBoundaries from "./advanced/boundaries/equity-research.js";
import wmBoundaries from "./advanced/boundaries/wealth-management.js";
import extraBoundaries from "./advanced/boundaries/extra.js";
import { references, studyPaths, prerequisites, fourWeekPlan, mockInterviews, formulaSheets } from "./references.js";
import { caseRegistry, parseCsv, calculateCase } from "./cases/capstones.js";

const tracks = [
  { name: "Investment Banking", topics: investmentBanking, advanced: ibAdvanced },
  { name: "Private Credit", topics: privateCredit, advanced: creditAdvanced },
  { name: "Private Equity", topics: privateEquity, advanced: peAdvanced },
  { name: "Hedge Funds", topics: hedgeFunds, advanced: hfAdvanced },
  { name: "Sales & Trading", topics: salesTrading, advanced: stAdvanced },
  { name: "Equity Research", topics: equityResearch, advanced: erAdvanced },
  { name: "Wealth Management", topics: wealthManagement, advanced: wmAdvanced },
];
const allTopics = tracks.flatMap(track => track.topics);
const topicById = new Map(allTopics.map(topic => [topic.id, topic]));
const advancedById = new Map(tracks.flatMap(track => track.advanced).map(item => [item.id, item]));
const judgmentById = new Map([ibJudgment,creditJudgment,peJudgment,hfJudgment,stJudgment,erJudgment,wmJudgment].flat().map(item=>[item.id,item.judgmentLab]));
const extraBoundaryById = new Map(extraBoundaries.map(item=>[item.id,item.extra]));
const boundaryById = new Map([ibBoundaries,creditBoundaries,peBoundaries,hfBoundaries,stBoundaries,erBoundaries,wmBoundaries].flat().map(item=>[item.id,[item.boundary,extraBoundaryById.get(item.id)].filter(Boolean).join(" ")]));
const searchTextById = new Map(allTopics.map(topic => {
  const ext = advancedById.get(topic.id);
  return [topic.id, [topic.title, topic.track, topic.explanation, topic.framework, exampleText(topic), ...topic.questions.flatMap(q => [q.q, q.a, q.mistake]), ...(ext?.deepDives || []).flatMap(d => [d.title, d.body]), ...(ext?.followUps || []).flatMap(q => [q.q, q.a]), ext?.diagnostic?.prompt, ext?.diagnostic?.answer, judgmentById.get(topic.id), boundaryById.get(topic.id)].filter(Boolean).join(" ").toLocaleLowerCase()];
}));
const trackIndexById = new Map(tracks.flatMap((track, index) => track.topics.map(topic => [topic.id, index])));
const storageKey = "finance-interview-textbook-progress-v2";
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
let completed = new Set();
let activeTrack = 0;
let searchLimit = 10;
let topicObserver = null;
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem("finance-interview-textbook-progress-v1") || "[]");
  if (Array.isArray(stored)) completed = new Set(stored.filter(id => topicById.has(id)));
} catch { /* Storage may be disabled; the book remains usable. */ }

function updateProgress() {
  const count = completed.size;
  $("#done-count").textContent = count;
  $("#progress-bar").style.width = `${count / allTopics.length * 100}%`;
  $(".progress").setAttribute("aria-valuenow", String(count));
  try { localStorage.setItem(storageKey, JSON.stringify([...completed])); } catch { /* Optional persistence. */ }
}

function renderTrackCards() {
  $("#track-cards").innerHTML = tracks.map((track, i) => `<button class="track-card" type="button" data-track="${i}" aria-pressed="${i === activeTrack}"><span>TRACK 0${i + 1}</span><strong>${esc(track.name)}</strong><small>10 topics · open study track →</small></button>`).join("");
}
function renderToc() {
  $("#chapter-nav").innerHTML = tracks.map((track, i) => `<details class="toc-track" ${i === activeTrack ? "open" : ""}><summary>${esc(track.name)}</summary><div class="toc-links">${track.topics.map(topic => `<a href="#${esc(topic.id)}" data-topic="${esc(topic.id)}">${esc(topic.title)}</a>`).join("")}</div></details>`).join("");
}
function exampleText(topic) {
  if (typeof topic.example === "string") return topic.example;
  return `${topic.example.assumptions} ${topic.example.steps.join(" ")}`;
}
function exampleMarkup(topic) {
  if (typeof topic.example === "string") return `<p>${esc(topic.example)}</p>`;
  return `<p><strong>Assumptions:</strong> ${esc(topic.example.assumptions)}</p><ol>${topic.example.steps.map(step => `<li>${esc(step)}</li>`).join("")}</ol>`;
}
function prerequisiteMarkup(topic) {
  const needs = prerequisites[topic.id] || [];
  if (!needs.length) return "";
  return `<p class="prerequisite"><strong>Suggested prerequisites:</strong> ${needs.map(id => `<a href="#${esc(id)}" data-topic="${esc(id)}">${esc(topicById.get(id)?.title || id)} · ${esc(topicById.get(id)?.track)}</a>`).join(" · ")}</p>`;
}
function advancedMarkup(ext) {
  if (!ext) return "<p class=\"empty-state\">Advanced materials are being prepared for this topic.</p>";
  const dives = ext.deepDives.map((dive, i) => `<details class="deep-dive"><summary><span class="step-index">0${i + 1}</span> ${esc(dive.title)}</summary><div class="reveal-copy"><p>${esc(dive.body)}</p></div></details>`).join("");
  const followups = ext.followUps.map((item, i) => `<details class="question hard-question"><summary>Hard follow-up ${i + 1}: ${esc(item.q)}</summary><div class="answer"><p>${esc(item.a)}</p></div></details>`).join("");
  const drill = `<details class="diagnostic"><summary>Diagnostic drill · reveal model solution and scoring guide</summary><div class="answer"><p><strong>Prompt:</strong> ${esc(ext.diagnostic.prompt)}</p><p><strong>Model answer:</strong> ${esc(ext.diagnostic.answer)}</p><p class="rubric"><strong>Scoring rubric:</strong> ${esc(ext.diagnostic.rubric)}</p></div></details>`;
  const sources = ext.sources.map(source => { const ref = references[source.ref]; return ref ? `<li><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.name)}</a><span class="source-claim">Supports: ${esc(source.claim)}</span></li>` : ""; }).join("");
  const judgment=judgmentById.get(ext.id); const judgmentMarkup=judgment?`<h4>Decision-grade judgment &amp; edge cases</h4><details class="judgment-lab"><summary>Reveal analyst judgment lab</summary><div class="reveal-copy"><p>${esc(judgment)}</p></div></details>`:"";
  const boundary=boundaryById.get(ext.id); const boundaryMarkup=boundary?`<details class="boundary-note"><summary>Technical boundary &amp; exception check</summary><div class="reveal-copy"><p>${esc(boundary)}</p></div></details>`:"";
  return `<h4>Advanced deep dives</h4><div class="deep-dive-list">${dives}</div>${judgmentMarkup}${boundaryMarkup}<h4>Hard follow-ups</h4>${followups}<h4>Diagnostic drill &amp; rubric</h4>${drill}<h4>Sources checked for this topic</h4><ul class="source-list">${sources}</ul>`;
}
function topicMarkup(topic, index) {
  const ext = advancedById.get(topic.id);
  const questions = topic.questions.map((item, i) => `<details class="question"><summary>Interview question ${i + 1}: ${esc(item.q)}</summary><div class="answer"><p>${esc(item.a)}</p><p class="mistake"><strong>Typical mistake:</strong> ${esc(item.mistake)}</p></div></details>`).join("");
  const searchable = [topic.title, topic.track, topic.explanation, topic.framework, exampleText(topic), ...topic.questions.flatMap(q => [q.q, q.a, q.mistake]), ...(ext?.deepDives || []).flatMap(d => [d.title,d.body]), ...(ext?.followUps || []).flatMap(q => [q.q,q.a]), ext?.diagnostic?.prompt,ext?.diagnostic?.answer,judgmentById.get(topic.id),boundaryById.get(topic.id)].filter(Boolean).join(" ").toLocaleLowerCase();
  return `<article class="topic" id="${esc(topic.id)}" data-search="${esc(searchable)}">
    <div class="topic-top"><div><span class="topic-number">${String(index).padStart(2, "0")} · ${esc(topic.track.toUpperCase())}</span><h3>${esc(topic.title)}</h3></div><label class="done-label"><input type="checkbox" data-done="${esc(topic.id)}" ${completed.has(topic.id) ? "checked" : ""}><span>Mark topic done</span></label></div>
    ${prerequisiteMarkup(topic)}<p class="explanation">${esc(topic.explanation)}</p>
    <h4>Key formulas &amp; framework</h4><div class="formula"><p>${esc(topic.framework)}</p></div>
    <h4>Worked example</h4><div class="example">${exampleMarkup(topic)}</div>
    <h4>Interview practice</h4>${questions}
    <details class="self-check"><summary>Quick self-check · reveal answer</summary><div class="answer"><p><strong>${esc(topic.selfCheck.question)}</strong></p><p>${esc(topic.selfCheck.answer)}</p></div></details>
    <section class="advanced-block" aria-label="Advanced study for ${esc(topic.title)}">${advancedMarkup(ext)}</section>
  </article>`;
}
function setActiveTrack(index) {
  activeTrack = index;
  renderTrackCards(); renderToc();
  $("#book-search").value = "";
  searchLimit = 10;
  renderBook();
  $("#textbook").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderBook(query = $("#book-search").value) {
  const normalized = query.trim().toLocaleLowerCase();
  const matches = normalized ? allTopics.filter(topic => searchTextById.get(topic.id).includes(normalized)) : tracks[activeTrack].topics;
  const shown = normalized ? matches.slice(0,searchLimit) : matches;
  const groups = normalized ? [...new Set(shown.map(t=>trackIndexById.get(t.id)))].map(i=>({track:tracks[i],index:i,topics:shown.filter(t=>trackIndexById.get(t.id)===i)})) : [{track:tracks[activeTrack],index:activeTrack,topics:shown}];
  const html = groups.map(group => `<section class="track-section" id="track-${group.index}"><header class="track-heading"><p class="section-kicker">CAREER TRACK 0${group.index+1} · ${group.topics.length}${normalized?` OF ${matches.length} MATCHES`:""} TOPICS</p><h2>${esc(group.track.name)}</h2></header>${group.topics.map(topic=>topicMarkup(topic,group.track.topics.indexOf(topic)+1)).join("")}</section>`).join("");
  const more = normalized && matches.length>shown.length ? `<button id="load-more" class="button load-more" type="button">Load ${Math.min(10,matches.length-shown.length)} more results <span>(${shown.length} of ${matches.length})</span></button>` : "";
  $("#book-content").innerHTML = html ? `${html}${more}` : `<p class="empty-state">No topics match “${esc(query)}”. Try another term or clear the search.</p>`;
  $("#search-status").textContent = normalized ? `Showing ${shown.length} of ${matches.length} matching topics across all 70` : `Showing 10 topics in ${tracks[activeTrack].name}. Choose a career track above or use search to find any of 70 topics.`;
  $("#track-cards").querySelectorAll("[data-track]").forEach(button => button.addEventListener("click",()=>setActiveTrack(Number(button.dataset.track))));
  $("#book-content").querySelectorAll("[data-done]").forEach(box => box.addEventListener("change", event => { event.target.checked ? completed.add(event.target.dataset.done) : completed.delete(event.target.dataset.done); updateProgress(); }));
  $("#load-more")?.addEventListener("click",()=>{searchLimit+=10;renderBook(query);});
  highlightActiveTopic();
  if(topicObserver) $("#book-content").querySelectorAll(".topic").forEach(topic=>topicObserver.observe(topic));
}
function highlightActiveTopic() {
  const links = document.querySelectorAll(".toc-links a"); links.forEach(link=>link.classList.toggle("active",link.hash.slice(1)===location.hash.slice(1)));
}
function navigateTopic(id) {
  const index=trackIndexById.get(id); if(index===undefined)return;
  if(index!==activeTrack || !document.getElementById(id)) { activeTrack=index; renderTrackCards(); renderToc(); $("#book-search").value=""; searchLimit=10; renderBook(""); }
  requestAnimationFrame(()=>{document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});history.replaceState(null,"",`#${id}`);highlightActiveTopic();});
}

const glossary = [
  ["Accretion / dilution", "Whether a transaction increases or decreases an acquirer's earnings per share relative to standalone EPS; it does not establish value creation."],
  ["Basis point (bp)", "One hundredth of one percentage point; 100 basis points equal 1 percentage point."],
  ["CAGR", "Compound annual growth rate: the constant annual rate linking beginning and ending values over a stated period."],
  ["Capex", "Capital expenditure: cash invested in long-lived assets; accounting and cash-flow presentation follow applicable standards."],
  ["DCF", "Discounted cash flow: valuation based on present value of forecast cash flows and continuing value."],
  ["EBITDA", "Earnings before interest, taxes, depreciation and amortization; not cash flow and definitions/adjustments may vary."],
  ["Enterprise value (EV)", "A measure of operating-business value across capital providers; bridge consistently for debt, cash and other claims."],
  ["FCFF / FCFE", "Free cash flow to firm (all capital providers) / free cash flow to equity (common shareholders after financing effects)."],
  ["IRR", "Internal rate of return: the rate that sets the NPV of dated cash flows to zero; can be non-unique in unusual flows."],
  ["MOIC", "Multiple on invested capital: total value or proceeds divided by invested capital under a stated convention; timing ignored."],
  ["Net working capital (NWC)", "Operating current assets less operating current liabilities, commonly excluding cash and debt; definitions vary."],
  ["ROIC", "Return on invested capital; compare operating return with cost of capital, using consistent tax and investment definitions."],
  ["WACC", "Weighted average cost of capital; discount rate for FCFF under matching currency, risk and capital assumptions."],
  ["Yield to maturity", "The discount rate equating bond price with contractual cash flows under stated conventions; realized return may differ."],
];
function renderGlossary() { $("#glossary-list").innerHTML = glossary.map(([term, definition]) => `<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join(""); }
function renderPaths() {
  $("#study-paths-list").innerHTML = studyPaths.map(path=>`<article class="path-card"><p class="section-kicker">ROLE-SPECIFIC PATH</p><h3>${esc(path.name)}</h3><p>Follow prerequisites in order; use the track menu to open each topic. Finish with <a href="#case-${esc(path.capstone)}">the integrated capstone</a>.</p><ol>${path.topics.map(id=>{const topic=topicById.get(id);return `<li><a href="#${esc(id)}" data-topic="${esc(id)}">${esc(topic?.title||id)}</a></li>`}).join("")}</ol></article>`).join("");
}
function renderPlan() { $("#study-plan").innerHTML=fourWeekPlan.map(w=>`<article class="week-card"><p class="section-kicker">WEEK ${w.week} · ${esc(w.target)}</p><h3>${esc(w.title)}</h3><ol>${w.tasks.map(task=>`<li>${esc(task)}</li>`).join("")}</ol></article>`).join(""); }
function renderMocks() {
  $("#mock-rounds").innerHTML=mockInterviews.map((round,index)=>`<article class="mock-card"><div class="mock-top"><div><p class="section-kicker">TIMED MIXED MOCK</p><h3>${esc(round.title)}</h3></div><div class="timer" data-timer-display="${index}" aria-live="polite">${round.minutes}:00</div></div><button class="button timer-button" type="button" data-timer="${index}" data-minutes="${round.minutes}">Start timer</button><p class="muted">Answer each prompt aloud before expanding the model response and scoring rubric.</p>${round.questions.map((q,i)=>`<details class="question"><summary>${i+1}. ${esc(q.prompt)}</summary><div class="answer"><p><strong>Revealed answer:</strong> ${esc(q.answer)}</p><p class="rubric"><strong>Scoring rubric:</strong> ${esc(q.rubric)}</p></div></details>`).join("")}</article>`).join("");
}
function renderFormulas() { $("#formula-sheets").innerHTML=formulaSheets.map(sheet=>`<article class="formula-card"><h3>${esc(sheet.group)}</h3><div class="table-wrap"><table><thead><tr><th scope="col">Measure</th><th scope="col">Formula</th><th scope="col">Definitions / caveat</th></tr></thead><tbody>${sheet.rows.map(row=>`<tr>${row.map((cell,i)=>`<td data-label="${["Measure","Formula","Definitions / caveat"][i]}">${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></article>`).join(""); }

const caseBriefs = {
 "ib-dcf": {task:"Build the five-year operating forecast; calculate FCFF each year; reconcile a steady-state year with a terminal reinvestment rate; discount FCFF at WACC; bridge EV to equity and show the sensitivity matrix.",debrief:"Revenue is forecast by year and EBIT is revenue × margin. FCFF = NOPAT + D&A − capex − increase in NWC. The terminal year grows NOPAT at g and reinvests g/ROIC of NOPAT before the Gordon formula. The bridge subtracts debt, preferred and minority interest and adds stated cash. Units are fictional millions except per-share value."},
 "pe-lbo": {task:"Reconcile uses with new debt, management rollover and sponsor equity. Walk interest, mandatory amortization and discretionary cash sweep annually. Calculate exit equity, MOIC/IRR and downside at a lower exit multiple.",debrief:"Interest is on beginning debt. Only residual positive cash after taxes, capex, NWC, interest and mandatory amortization is eligible for the assumed 75% sweep. Opening minimum cash and retained cash accumulate into exit cash; inadequate cash to fund mandatory amortization stops the simplified model. It excludes revolver draws, PIK, add-ons and intra-year timing; see the assumptions notes before interpreting return."},
 "credit-case": {task:"Calculate covenant net leverage/headroom, liquidity after minimum cash and runway at stated burn. Estimate a simplified secured/unsecured recovery waterfall; distinguish covenant compliance from payment capacity.",debrief:"This is a fictional simplified waterfall. Real recovery depends on executed definitions, entity structure, lien perfection/priority, legal process, costs, cash leakage and jurisdiction. Treat model output as a stress illustration, not a legal recovery forecast."},
 "hedge-fund-case": {task:"State a long and short variant view, catalyst and falsifier. Size equal risk dollars from stop distance, calculate gross/net exposure, then mark both legs at stress prices and decide whether the risk budget survives.",debrief:"The stops are scenario prices, not execution guarantees. Stress loss exceeds the original risk budget; a sound recommendation must reduce size or otherwise explain the risk, and assess borrow, correlation, factor exposure, liquidity and gap moves."},
 "markets-case": {task:"Price the bond and compute annual-compounding Macaulay/modified duration and convexity; estimate the stated yield shock. Calculate the European call's Greeks, delta hedge and local delta-gamma-vega stress.",debrief:"The bond assumes annual coupons, fixed cash flows and parallel yield shock. The option uses Black–Scholes with zero dividend yield and constant volatility. Greeks are local approximations, not full revaluation; spread, curve, liquidity, exercise, basis, transaction costs and hedge slippage are excluded."},
 "research-case": {task:"Explain the EPS revision, apply the fictional target P/E, calculate target price/upside/total return, and write a rating memo with variant view, evidence, catalyst, downside and explicit rating-policy caveat.",debrief:"The Positive/Neutral/Negative thresholds are invented for the case, not universal. A negative earnings revision can coexist with positive target return if price/multiple/dividends imply that outcome. An actual rating requires a complete, sourced forecast, valuation range, risks and applicable firm controls."},
 "wealth-case": {task:"Prioritize retirement and home goals, calculate nominal accumulation and an illustrative after-tax balance, inflate spending/home goals, compare with a heuristic capital target and discuss allocation/liquidity alternatives.",debrief:"This is entirely illustrative, not financial, investment, tax or legal advice. Constant returns, annual deposits, inflation, withdrawal rate and hypothetical tax on the whole balance are not individualized facts or current tax rules. Jurisdiction and account treatment vary; consult qualified professionals."},
};
function outputTable(rows, headers) { return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((value,i)=>`<td data-label="${esc(headers[i])}">${esc(value)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; }
function resultView(testCase,result) {
  if(testCase.id==='ib-dcf') {
    const inputs=caseRegistry.find(c=>c.id===testCase.id);
    const rows=result.table.map(x=>[x.year,x.revenue,x.ebit,x.nopat,x.da,x.capex,x.deltaNwc,x.fcff,x.pvFcff]);
    const sensitivity=result.sensitivity.map(s=>[`${s.wacc}%`,` ${s.terminalGrowth}%`,s.enterpriseValue]);
    return `<h4>Five-year FCFF forecast (fictional millions)</h4>${outputTable(rows,["Year","Revenue","EBIT","NOPAT","D&A","Capex","Δ NWC","FCFF","PV of FCFF"])}<h4>Terminal reinvestment and EV-to-equity bridge</h4>${outputTable([["Terminal NOPAT",result.terminalNopat],["Reinvestment rate (g / ROIC)",`${result.terminalReinvestmentRate}%`],["Terminal reinvestment",result.terminalReinvestment],["Terminal FCFF",result.terminalFcff],["Terminal value",result.terminalValue],["PV of explicit FCFF",result.pvForecast],["PV of terminal value",result.pvTerminal],["Enterprise value",result.enterpriseValue],["Equity value",result.equityValue],["Value per share",result.valuePerShare]],["Output","Value"])}<h4>EV sensitivity · WACC / terminal growth</h4>${outputTable(sensitivity,["WACC","Growth","EV"])}`;
  }
  if(testCase.id==='pe-lbo') return `<h4>Sources &amp; uses and cash sweep schedule (fictional millions)</h4>${outputTable([["Uses",result.uses],["New debt",result.newDebt],["Management rollover",result.rollover],["Sponsor equity",result.sponsorEquity],["Total sources",result.sources],["Sources less uses",result.sources-result.uses]],["Line","Amount"])}${outputTable(result.schedule.map(x=>[x.year,x.ebitda,x.beginningDebt,x.interest,x.cashBeforeAmort,x.mandatory,x.sweep,x.endingDebt,x.beginningCash,x.cashRetained,x.endingCash]),["Year","EBITDA","Opening debt","Interest","Cash before amort.","Mandatory paydown","Sweep","Ending debt","Opening cash","Cash retained","Ending cash"])}${outputTable([["Exit EV",result.exitEnterpriseValue],["Exit debt",result.exitDebt],["Exit cash",result.exitCash],["Sponsor proceeds",result.exitEquityProceeds],["MOIC",`${result.moic}x`],["Annual IRR",`${result.irr}%`],["Downside proceeds",result.downsideEquityProceeds],["Downside MOIC",`${result.downsideMoic}x`]],["Exit metric","Value"])}`;
  const rows=Object.entries(result).map(([key,value])=>[key,typeof value==='boolean'?(value?'Pass':'Fail'):value]);
  return outputTable(rows,["Calculated output","Value"]);
}
async function renderCases() {
  const host=$("#capstones");
  host.innerHTML=caseRegistry.map((c,i)=>{const brief=caseBriefs[c.id];return `<article class="capstone" id="case-${esc(c.id)}"><p class="section-kicker">INTEGRATED CAPSTONE 0${i+1}</p><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><h4>Interview assignment</h4><p>${esc(brief.task)}</p><div class="case-actions"><a class="button" href="${esc(c.inputs)}" download>Download input CSV</a><a class="button" href="${esc(c.outputs)}" download>Download derived output CSV</a></div><div class="case-result" id="result-${esc(c.id)}" aria-live="polite"><p>Calculating from the downloadable input fixture…</p></div><details class="case-debrief"><summary>Reveal integrated debrief and limitations</summary><div class="answer"><p>${esc(brief.debrief)}</p></div></details></article>`;}).join("");
  await Promise.all(caseRegistry.map(async c=>{try{const response=await fetch(c.inputs);if(!response.ok)throw new Error(`Input CSV returned ${response.status}`);const rows=parseCsv(await response.text());const result=calculateCase(c,rows);$("#result-"+CSS.escape(c.id)).innerHTML=resultView(c,result);}catch(error){$("#result-"+CSS.escape(c.id)).innerHTML=`<p class="empty-state">Unable to calculate this case in the preview: ${esc(error.message)}. Input and output CSVs remain available.</p>`;}}));
}

function setupTimers() {
  const timers=new Map();
  document.querySelectorAll("[data-timer]").forEach(button=>button.addEventListener("click",()=>{const id=button.dataset.timer, display=document.querySelector(`[data-timer-display="${id}"]`); if(timers.has(id)){clearInterval(timers.get(id));timers.delete(id);button.textContent="Resume timer";return;} if(!button.dataset.remaining)button.dataset.remaining=String(Number(button.dataset.minutes)*60);button.textContent="Pause timer";const tick=()=>{let left=Number(button.dataset.remaining)-1;button.dataset.remaining=String(Math.max(0,left));display.textContent=`${Math.floor(left/60)}:${String(Math.max(0,left%60)).padStart(2,"0")}`;if(left<=0){clearInterval(timers.get(id));timers.delete(id);button.textContent="Time complete · restart";button.dataset.remaining=String(Number(button.dataset.minutes)*60);display.textContent="0:00";}};timers.set(id,setInterval(tick,1000));}));
}

if("IntersectionObserver" in window) topicObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){history.replaceState(null,"",`#${entry.target.id}`);highlightActiveTopic();}},{rootMargin:"-5% 0px -78% 0px"});
renderTrackCards(); renderToc(); renderBook(""); renderGlossary(); renderPaths(); renderPlan(); renderMocks(); renderFormulas(); updateProgress(); renderCases(); setupTimers();
$("#book-search").addEventListener("input",event=>{searchLimit=10;renderBook(event.target.value);});
$("#reset-progress").addEventListener("click",()=>{if(completed.size&&window.confirm("Clear all saved topic progress on this device?")){completed.clear();renderBook($("#book-search").value);updateProgress();}});
$("#chapter-nav").addEventListener("click",event=>{const link=event.target.closest("a[data-topic]");if(link){event.preventDefault();navigateTopic(link.dataset.topic);}});
document.body.addEventListener("click",event=>{const link=event.target.closest("a[data-topic]");if(link&&link.closest("#chapter-nav"))return;if(link){event.preventDefault();navigateTopic(link.dataset.topic);}});
window.addEventListener("hashchange",()=>{const id=decodeURIComponent(location.hash.slice(1));if(topicById.has(id))navigateTopic(id);});
if(location.hash&&topicById.has(decodeURIComponent(location.hash.slice(1))))navigateTopic(decodeURIComponent(location.hash.slice(1)));
