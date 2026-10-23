(function(){
"use strict";
const D = window.OPTO_DATA;
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtM = n => n >= 1e9 ? "$"+(n/1e9).toFixed(2)+"B" : "$"+(n/1e6).toFixed(1)+"M";

function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),2200); }
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-copy]"); if(!b) return;
  const text = b.getAttribute("data-copy");
  if(navigator.clipboard) navigator.clipboard.writeText(text).then(()=>toast("Copied — say it like you mean it ✓")).catch(()=>toast("Copy failed — select manually"));
  else toast("Clipboard unavailable in this browser");
});

/* ---------- Progress checklist (localStorage) ---------- */
const LS="opto-ready-v1";
let state = {};
try{ state = JSON.parse(localStorage.getItem(LS)||"{}"); }catch(e){ state={}; }
function save(){ try{ localStorage.setItem(LS, JSON.stringify(state)); }catch(e){} }
const checkWrap = $("#checklist");
checkWrap.innerHTML = D.checklist.map((c,i)=>`<label><input type="checkbox" data-chk="${i}" ${state["chk"+i]?"checked":""}><span>${esc(c)}</span></label>`).join("");
function refreshProgress(){
  const done = D.checklist.filter((_,i)=>state["chk"+i]).length;
  const pct = Math.round(done/D.checklist.length*100);
  $("#progressRange").value = pct; $("#progressPct").textContent = pct+"% · "+done+"/"+D.checklist.length;
}
checkWrap.addEventListener("change", e=>{
  const i=e.target.getAttribute("data-chk"); if(i===null) return;
  state["chk"+i]=e.target.checked; save(); refreshProgress();
  if(D.checklist.every((_,j)=>state["chk"+j])) toast("Textbook complete — now go say it out loud 🎙");
});
$("#progressRange").addEventListener("input", e=>{ $("#progressPct").textContent = e.target.value+"% (dragging — use checkboxes to save)"; });
$("#progressRange").addEventListener("change", refreshProgress);
refreshProgress();

/* ---------- Workflow tabs ---------- */
const wfTabs=$("#workflowTabs"), wfPanel=$("#workflowPanel");
wfTabs.innerHTML = D.workflow.map((w,i)=>`<button class="wf-tab" role="tab" aria-selected="${i===0}" data-wf="${i}"><b>${esc(w.title)}</b><span>${esc(w.sub)}</span></button>`).join("");
function renderWF(i){
  const w=D.workflow[i];
  $$(".wf-tab",wfTabs).forEach((t,j)=>t.setAttribute("aria-selected", String(j===i)));
  wfPanel.innerHTML = `<div><h3>What the customer does</h3><p>${esc(w.customer)}</p><h3 style="margin-top:1rem">Engineering reality</h3><p>${esc(w.eng)}</p></div>
  <div><h3>What the software must coordinate</h3><ul class="bullets">${w.software.map(s=>`<li>${esc(s)}</li>`).join("")}</ul><p class="say-box small"><span class="say-label">ASK</span>${esc(w.ask)}</p></div>`;
}
wfTabs.addEventListener("click", e=>{ const t=e.target.closest("[data-wf]"); if(t) renderWF(+t.getAttribute("data-wf")); });
renderWF(0);

/* ---------- Verify table ---------- */
$("#verifyTable tbody").innerHTML = D.verify.map(v=>`<tr><td><b>${esc(v.claim)}</b></td><td><span class="tag ${esc(v.cls)}">${esc(v.status)}</span></td><td>${esc(v.ask)}</td></tr>`).join("");

/* ---------- Asset tabs ---------- */
const aTabs=$("#assetTabs"), aPanel=$("#assetPanel");
aTabs.innerHTML = D.assets.map((a,i)=>`<button class="pill-btn ${i===0?"active":""}" role="tab" data-asset="${i}">${a.emoji} ${esc(a.name)}</button>`).join("");
function renderAsset(i){
  const a=D.assets[i];
  $$(".pill-btn",aTabs).forEach((t,j)=>t.classList.toggle("active",j===i));
  aPanel.innerHTML = `<h3>${a.emoji} ${esc(a.name)}</h3><div class="asset-meta"><span>⏳ ${esc(a.horizon)}</span><span>⚖️ ${esc(a.risk)}</span><span>🎯 ${esc(a.target)}</span></div>
  <p><b style="color:#e6eeff">What it is:</b> ${esc(a.what)}</p><p><b style="color:#e6eeff">Why own it:</b> ${esc(a.why)}</p>
  <p><b style="color:#e6eeff">Watch out:</b> ${esc(a.watch)}</p><p><b style="color:#e6eeff">Example:</b> ${esc(a.example)}</p>
  <p class="say-box small"><span class="say-label">ASK Ryan</span>${esc(a.ask)}</p>`;
}
aTabs.addEventListener("click", e=>{ const t=e.target.closest("[data-asset]"); if(t) renderAsset(+t.getAttribute("data-asset")); });
renderAsset(0);

/* ---------- Vehicles table ---------- */
$("#vehicleTable").innerHTML = `<div class="table-wrap" style="border:0"><table class="mini-table"><thead><tr><th>Vehicle</th><th>Liquidity</th><th>Min</th><th>Tax</th><th>Note</th></tr></thead><tbody>
${D.vehicles.map(v=>`<tr><td><b style="color:#e6eeff">${esc(v.v)}</b><br><span style="font-size:.7rem">${esc(v.best)}</span></td><td>${esc(v.liq)}</td><td>${esc(v.min)}</td><td>${esc(v.tax)}</td><td>${esc(v.note)}</td></tr>`).join("")}</tbody></table></div>`;

/* ---------- Fund lifecycle / J-curve simulator (teaching model) ---------- */
let simYear = 0;
const callProfile = [0, .18, .20, .20, .16, .12, .07, .04, .03, 0, 0, 0, 0]; // yrs 0..12 share of commitment called
const yearNotes = [
  "Year 0 — Commitment signed. $0 has moved. The work is legal/ops: sub docs, KYC, fund formation. (Opto Build/Fundraise.)",
  "Year 1 — First capital calls fund early deals + management fees on committed capital. Net cash flow goes negative: the J begins.",
  "Year 2 — Calling continues; portfolio is immature, marks ≈ cost minus fees. TVPI < 1.0× is normal, not failure.",
  "Year 3 — Deployment peaks. Diligence question shifts from 'access' to 'is value creation visible in company KPIs, not just marks?'",
  "Year 4 — Calls slow; early refinancings may trickle distributions. GP is likely fundraising the next vintage — DPI scrutiny starts.",
  "Year 5 — Investment period typically ends. Focus: follow-ons, value creation, exit preparation.",
  "Year 6 — Harvest begins in earnest. Distributions should now be a visible share of paid-in for healthy buyout/credit.",
  "Year 7 — Mid-life gate: buyout DPI ~0.5–0.8× is a common sanity band (strategy-dependent). Below it, LPs ask hard questions.",
  "Year 8 — Exits compound; net cash flow curve bends up. Secondaries buyers circle seasoned stakes at ~90% of NAV.",
  "Year 9 — Tail assets remain. Watch for continuation-vehicle proposals on the best remaining company.",
  "Year 10 — DPI ≥ 1.0× (capital returned) is a common mature-fund expectation. Fund extensions get negotiated here.",
  "Year 11 — Wind-down: residual NAV should be small. Remaining value is concentrated — marks matter enormously.",
  "Year 12 — Final distributions + audit. Judge the vintage: TVPI vs peers + PME vs public index. Then the re-up decision repeats."
];
function simFlows(){
  const commit = +$("#commitRange").value * 1e6;
  const mult = +$("#retRange").value;
  const feePct = +$("#feeRange").value / 100;
  const paid=[], dist=[], nav=[], net=[];
  let cumPaid=0, cumDist=0;
  const distProfile=[0,0,0,.02,.05,.09,.14,.17,.17,.14,.11,.07,.04]; // share of total proceeds
  const totalProceeds = commit * 0.97 * mult; // invested base approx after fees drag handled in NAV path
  for(let y=0;y<=12;y++){
    cumPaid += commit * (callProfile[y]||0);
    // fees approximated as extra paid-in drag in years 1-5 already inside calls; NAV path below reflects fee drag
    cumDist += totalProceeds * (distProfile[y]||0);
    const invested = cumPaid * (1 - feePct*1.2); // teaching simplification
    const maturity = Math.min(1, y/9);
    const grossValue = invested * (1 + (mult-1)*Math.pow(maturity,1.4));
    const remaining = Math.max(0, grossValue - cumDist);
    paid.push(cumPaid); dist.push(cumDist); nav.push(y===0?0:remaining); net.push(cumDist + (y===0?0:remaining) - cumPaid);
  }
  return {commit, paid, dist, nav, net};
}
function drawJ(){
  const c=$("#jcurveCanvas"), ctx=c.getContext("2d");
  const W=c.width,H=c.height, pad={l:52,r:14,t:16,b:34};
  const f=simFlows();
  ctx.clearRect(0,0,W,H);
  const all=[...f.net, ...f.paid.map(v=>-v*0), 0];
  const maxV=Math.max(...f.net, f.commit*0.35), minV=Math.min(...f.net, -f.commit*0.15);
  const x=i=>pad.l + (W-pad.l-pad.r)*(i/12), y=v=>pad.t + (H-pad.t-pad.b)*(1-(v-minV)/(maxV-minV));
  ctx.strokeStyle="rgba(170,190,235,.18)"; ctx.fillStyle="#8fa0c4"; ctx.font="11px sans-serif";
  for(let g=0;g<=4;g++){ const v=minV+(maxV-minV)*g/4, yy=y(v); ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(W-pad.r,yy);ctx.stroke(); ctx.fillText(fmtM(v),6,yy+4); }
  ctx.strokeStyle="rgba(253,164,175,.65)"; ctx.setLineDash([5,4]); ctx.beginPath();ctx.moveTo(pad.l,y(0));ctx.lineTo(W-pad.r,y(0));ctx.stroke(); ctx.setLineDash([]);
  // cumulative paid-in (negative area guide)
  ctx.strokeStyle="#93b4ff"; ctx.lineWidth=2; ctx.beginPath();
  f.paid.forEach((v,i)=>{ const yy=y(-v*0.55); i?ctx.lineTo(x(i),yy):ctx.moveTo(x(i),yy); }); ctx.stroke();
  // net value line (dist+NAV-paid)
  ctx.strokeStyle="#f2c66d"; ctx.lineWidth=3; ctx.beginPath();
  f.net.forEach((v,i)=>{ i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)); }); ctx.stroke();
  // current year marker
  ctx.fillStyle="#5eead4"; ctx.beginPath(); ctx.arc(x(simYear), y(f.net[simYear]),6,0,7); ctx.fill();
  ctx.fillStyle="#eef2ff"; for(let i=0;i<=12;i+=2) ctx.fillText("Y"+i, x(i)-8, H-12);
  ctx.fillStyle="#f2c66d"; ctx.fillText("Net value (dist + NAV − paid-in)", pad.l+6, pad.t+12);
  ctx.fillStyle="#93b4ff"; ctx.fillText("Capital deployed (scaled guide)", pad.l+6, pad.t+27);
  // tiles
  const p=f.paid[simYear], d=f.dist[simYear], n=f.nav[simYear];
  const dpi=p?d/p:0, tvpi=p?(d+n)/p:0;
  $("#metricTiles").innerHTML = [
    ["Paid-in", fmtM(p)],["Distributions", fmtM(d)],["NAV left", fmtM(n)],
    ["DPI / TVPI", dpi.toFixed(2)+"× / "+tvpi.toFixed(2)+"×"]
  ].map(t=>`<div class="metric-tile"><span>${t[0]}</span><b>${t[1]}</b></div>`).join("");
  $("#yearLabel").textContent = yearNotes[simYear].split("—")[0].trim();
  $("#yearNarrative").textContent = yearNotes[simYear];
  $("#commitOut").textContent = fmtM(+$("#commitRange").value*1e6);
  $("#retOut").textContent = (+$("#retRange").value).toFixed(2)+"×";
  $("#feeOut").textContent = (+$("#feeRange").value).toFixed(2)===(+$("#feeRange").value).toFixed(1)+"0" ? $("#feeRange").value+"%/yr" : $("#feeRange").value+"%/yr";
}
["commitRange","retRange","feeRange"].forEach(id=>$("#"+id).addEventListener("input", drawJ));
$("#prevYear").addEventListener("click", ()=>{ simYear=Math.max(0,simYear-1); drawJ(); });
$("#nextYear").addEventListener("click", ()=>{ simYear=Math.min(12,simYear+1); drawJ(); });
$("#replayFund").addEventListener("click", ()=>{
  simYear=0; drawJ();
  const iv=setInterval(()=>{ simYear++; drawJ(); if(simYear>=12) clearInterval(iv); }, 650);
});
drawJ();

/* ---------- Metrics calculators ---------- */
function calcMetrics(){
  const p=+$("#calcPaid").value||0, d=+$("#calcDist").value||0, n=+$("#calcNav").value||0;
  if(!p){ $("#calcOut").innerHTML="Enter paid-in > 0."; return; }
  const dpi=d/p, rvpi=n/p, tvpi=dpi+rvpi;
  const verdict = dpi>=1 ? "Capital returned in cash — now judge the tail (RVPI quality)."
    : dpi>=0.5 ? "Meaningful cash back; still mark-dependent. Ask exit visibility on top NAV drivers."
    : "Mostly paper. Interrogate marks: revenue/EBITDA growth + comp multiples, not GP assertion.";
  $("#calcOut").innerHTML = `<b>DPI ${dpi.toFixed(2)}×</b> · <b>RVPI ${rvpi.toFixed(2)}×</b> · <b>TVPI ${tvpi.toFixed(2)}×</b><br><span style="color:var(--muted)">${verdict}</span>`;
}
["calcPaid","calcDist","calcNav"].forEach(id=>$("#"+id).addEventListener("input", calcMetrics)); calcMetrics();

function calcPacing(){
  const port=+$("#pacePort").value||0, tgt=(+$("#paceTarget").value||0)/100, yrs=Math.max(1,+$("#paceYears").value||1);
  const targetNAV = port*tgt;
  const annualCommit = targetNAV*1.45/yrs; // teaching over-commit factor
  $("#paceOut").innerHTML = `Target private NAV ≈ <b>${fmtM(targetNAV)}</b>. Teaching-model commitment pace ≈ <b>${fmtM(annualCommit)}/yr for ${yrs} yrs</b> (over-commit ~1.45× because capital calls lag and distributions recycle).<br><span style="color:var(--muted)">Liquidity check: keep 12–24 months of expected calls in liquid assets; stress for denominator effect if publics fall 25%.</span>`;
}
["pacePort","paceTarget","paceYears"].forEach(id=>$("#"+id).addEventListener("input", calcPacing)); calcPacing();

$("#metricCards").innerHTML = D.metrics.map(m=>`<article class="card"><h3 style="color:var(--gold)">${esc(m.k)}</h3><p><b>${esc(m.full)}</b></p><p>${esc(m.plain)}</p><p style="color:#fecdd3">⚠️ ${esc(m.trap)}</p></article>`).join("");

/* ---------- Players ---------- */
const cats=["All","Platforms","GPs — mega","GPs — specialists","Allocators","Infrastructure"];
let activeCat="All";
$("#playerFilters").innerHTML = cats.map(c=>`<button class="pill-btn ${c==="All"?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
function renderPlayers(){
  const q=($("#playerSearch").value||"").toLowerCase();
  const list=D.players.filter(p=>(activeCat==="All"||p.cat===activeCat) && (p.name+" "+p.role+" "+p.detail).toLowerCase().includes(q));
  $("#playerGrid").innerHTML = list.length ? list.map(p=>`<article class="player-card"><div class="card-top"><h3>${esc(p.name)}</h3><span class="cat-chip">${esc(p.cat)}</span></div><p><b style="color:#e6eeff">${esc(p.role)}</b></p><p>${esc(p.detail)}</p><p class="ask-line">💬 ${esc(p.ask)}</p></article>`).join("")
    : `<p style="color:var(--muted)">No players match — clear search or pick another layer.</p>`;
}
$("#playerFilters").addEventListener("click", e=>{ const b=e.target.closest("[data-cat]"); if(!b)return; activeCat=b.getAttribute("data-cat"); $$("#playerFilters .pill-btn").forEach(x=>x.classList.toggle("active",x===b)); renderPlayers(); });
$("#playerSearch").addEventListener("input", renderPlayers); renderPlayers();

/* ---------- Engineering cards ---------- */
$("#engGrid").innerHTML = D.engPosts.map(p=>`<article class="eng-card ${p.must?"must":""}"><div class="card-top"><h3>${p.must?"★ ":""}${esc(p.title)}</h3></div><p class="eng-meta">${esc(p.date)} · ${esc(p.author)} · <a href="${esc(p.url)}" target="_blank" rel="noopener">Read post ↗</a></p><p><b style="color:#e6eeff">Mechanism:</b> ${esc(p.mech)}</p><p><b style="color:#e6eeff">Tradeoff:</b> ${esc(p.trade)}</p><p class="ask-line">🎙 ${esc(p.q)} <button class="copy-btn" data-copy="${esc(p.q)}">Copy</button></p></article>`).join("");

/* ---------- Operating leverage simulator ---------- */
function drawLeverage(){
  const funds=+$("#fundsRange").value, hrs=+$("#hrsRange").value, auto=+$("#autoRange").value/100;
  $("#fundsOut").textContent=funds; $("#hrsOut").textContent=hrs+"h"; $("#autoOut").textContent=Math.round(auto*100)+"%";
  const c=$("#leverageCanvas"), ctx=c.getContext("2d"), W=c.width,H=c.height,pad={l:56,r:14,t:18,b:32};
  ctx.clearRect(0,0,W,H);
  const years=[0,1,2,3];
  const flat = years.map(y=> funds*Math.pow(1.45,y)*hrs);       // funds grow ~45%/yr, hrs flat
  const bent = years.map(y=> funds*Math.pow(1.45,y)*hrs*Math.pow(1-auto,y));
  const maxV=Math.max(...flat)*1.1;
  const x=i=>pad.l+(W-pad.l-pad.r)*(i/3), y=v=>pad.t+(H-pad.t-pad.b)*(1-v/maxV);
  ctx.font="11px sans-serif"; ctx.strokeStyle="rgba(170,190,235,.18)"; ctx.fillStyle="#8fa0c4";
  for(let g=0;g<=4;g++){ const v=maxV*g/4, yy=y(v); ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(W-pad.r,yy);ctx.stroke(); ctx.fillText(Math.round(v).toLocaleString()+"h",4,yy+4); }
  function line(data,color,label,ly){ ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();data.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.stroke();ctx.fillStyle=color;ctx.fillText(label,pad.l+6,ly); }
  line(flat,"#fda4af","No automation gain — hrs explode",pad.t+12);
  line(bent,"#5eead4","With yearly automation improvement",pad.t+27);
  ctx.fillStyle="#eef2ff"; years.forEach(yr=>ctx.fillText("Year "+yr, x(yr)-18, H-10));
  const fteFlat=flat[3]/140, fteBent=bent[3]/140; // ~140 productive hrs/mo
  $("#leverageOut").innerHTML=`Teaching model (funds +45%/yr): Year-3 load ≈ <b>${Math.round(flat[3]).toLocaleString()} hrs/mo (${fteFlat.toFixed(0)} FTE)</b> flat vs <b>${Math.round(bent[3]).toLocaleString()} hrs/mo (${fteBent.toFixed(0)} FTE)</b> with automation. <span style="color:var(--muted)">Your interview translation: every point of hrs/fund reduction is headcount you don't hire and margin you keep. Ask Ryan for the real trend.</span>`;
}
["fundsRange","hrsRange","autoRange"].forEach(id=>$("#"+id).addEventListener("input", drawLeverage)); drawLeverage();

/* ---------- News ---------- */
const themes=["All","Opto","Competition","Regulation","Market"]; let activeTheme="All";
$("#newsFilters").innerHTML = themes.map(t=>`<button class="pill-btn ${t==="All"?"active":""}" data-theme="${t}">${t}</button>`).join("");
function renderNews(){
  const list=D.news.filter(n=>activeTheme==="All"||n.theme===activeTheme);
  $("#newsGrid").innerHTML=list.map(n=>`<article class="news-card"><div class="card-top"><h3>${esc(n.title)}</h3><span class="cat-chip">${esc(n.theme)}</span></div><p class="eng-meta">${esc(n.date)} · <a href="${esc(n.url)}" target="_blank" rel="noopener">Source ↗</a></p><p><b style="color:#e6eeff">What:</b> ${esc(n.what)}</p><p><b style="color:#e6eeff">Why it matters:</b> ${esc(n.why)}</p><p class="ask-line">🎙 ${esc(n.ask)} <button class="copy-btn" data-copy="${esc(n.ask)}">Copy</button></p></article>`).join("");
}
$("#newsFilters").addEventListener("click", e=>{ const b=e.target.closest("[data-theme]"); if(!b)return; activeTheme=b.getAttribute("data-theme"); $$("#newsFilters .pill-btn").forEach(x=>x.classList.toggle("active",x===b)); renderNews(); });
renderNews();

/* ---------- People ---------- */
$("#peopleGrid").innerHTML = D.people.map(p=>`<article class="person-card"><h3>${esc(p.name)}</h3><p><b style="color:var(--gold)">${esc(p.role)}</b></p><p>${esc(p.bg)}</p><p><b style="color:#e6eeff">Lens:</b> ${esc(p.lens)}</p><p class="ask-line">💬 ${esc(p.ask)}</p></article>`).join("");

/* ---------- Question sets ---------- */
const qTabs=$("#qTabs"), qPanel=$("#qPanel");
qTabs.innerHTML = D.questionSets.map((s,i)=>`<button class="pill-btn ${i===0?"active":""}" data-q="${i}">${esc(s.label)}</button>`).join("");
function renderQ(i){
  const s=D.questionSets[i];
  $$("#qTabs .pill-btn").forEach((t,j)=>t.classList.toggle("active",j===i));
  qPanel.innerHTML = `<h3>${esc(s.label)}</h3>` + s.items.map(it=>`<div class="q-item"><p>“${esc(it.q)}”<small>${esc(it.why)}</small></p><button class="copy-btn" data-copy="${esc(it.q)}">Copy</button></div>`).join("");
}
qTabs.addEventListener("click", e=>{ const b=e.target.closest("[data-q]"); if(b) renderQ(+b.getAttribute("data-q")); });
renderQ(1); // default: Ryan set — most useful first
$$("#qTabs .pill-btn").forEach((t,j)=>t.classList.toggle("active",j===1));

/* ---------- Story bank ---------- */
const storyPrompts=[
  ["Workflow reliability","A complex workflow you made more reliable / less manual. Your decisions, tradeoffs, rollout, measured outcome."],
  ["Authorization boundary","An access/permission design you owned. Threat model, enforcement point, audit story."],
  ["AI beyond the demo","An AI system you evaluated rigorously: eval set, failure modes, human-in-loop, ship/no-ship call."],
  ["Integration failure","A distributed/integration failure you diagnosed and prevented recurring. Detection → fix → guardrail."],
  ["Leadership (only if true)","Priorities set, disagreement resolved, hiring/mentoring, delivery owned. Scope honestly stated."]
];
$("#storyBank").innerHTML = storyPrompts.map((s,i)=>`<div class="story-field"><label for="story${i}">${i+1}. ${esc(s[0])}</label><textarea id="story${i}" placeholder="${esc(s[1])}">${esc(state["story"+i]||"")}</textarea></div>`).join("");
storyPrompts.forEach((_,i)=>{ $("#story"+i).addEventListener("input", e=>{ state["story"+i]=e.target.value; save(); }); });
$("#exportStories").addEventListener("click", ()=>{
  let txt="OPTO INTERVIEW PREP NOTES — exported "+new Date().toLocaleDateString()+"\n\n";
  storyPrompts.forEach((s,i)=>{ txt+=`## ${s[0]}\n${state["story"+i]||"(blank)"}\n\n`; });
  txt+="## Night-before one-pager\n"+D.onePager.map(r=>`- ${r[0]} ${r[1]}`).join("\n")+"\n";
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([txt],{type:"text/plain"})); a.download="opto-prep-notes.txt"; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000); toast("Prep notes exported ✓");
});

/* ---------- Glossary ---------- */
function renderGloss(){
  const q=($("#glossSearch").value||"").toLowerCase();
  const list=D.glossary.filter(g=>(g[0]+" "+g[1]+" "+g[2]).toLowerCase().includes(q));
  $("#glossGrid").innerHTML = list.length ? list.map(g=>`<article class="gloss-card" tabindex="0" role="button" aria-expanded="false" title="Activate to expand"><h3>${esc(g[0])}</h3><p>${esc(g[1])}</p><div class="gloss-detail"><span style="color:var(--gold);font-size:.72rem;font-weight:800;letter-spacing:.08em">WHY IT MATTERS HERE</span><p>${esc(g[2])}</p></div></article>`).join("")
    : `<p style="color:var(--muted)">No term matches. Try DPI, NIGO, vintage, feeder…</p>`;
}
$("#glossSearch").addEventListener("input", renderGloss);
function toggleGloss(c){ c.classList.toggle("open"); c.setAttribute("aria-expanded", String(c.classList.contains("open"))); }
$("#glossGrid").addEventListener("click", e=>{ const c=e.target.closest(".gloss-card"); if(c) toggleGloss(c); });
$("#glossGrid").addEventListener("keydown", e=>{ const c=e.target.closest(".gloss-card"); if(c && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); toggleGloss(c); } });
renderGloss();

/* ---------- Flashcards ---------- */
let flashOrder = D.flashcards.map((_,i)=>i), flashPos=0, flipped=false;
function renderFlash(){
  const card=D.flashcards[flashOrder[flashPos]];
  $("#flashIdx").textContent = (flashPos+1)+" / "+flashOrder.length;
  $("#flashBody").innerHTML = flipped
    ? `<div><p style="color:var(--teal);font-size:.7rem;font-weight:850;letter-spacing:.1em">ANSWER — SAY IT OUT LOUD</p><p style="font-size:1rem;color:#e6eeff">${esc(card[1])}</p><p style="font-size:.75rem">Click to flip back</p></div>`
    : `<div><h3>${esc(card[0])}</h3><p>Click / Flip to reveal</p></div>`;
  $("#flashFlip").textContent = flipped ? "Flip back" : "Flip";
}
$("#flashBody").addEventListener("click", ()=>{ flipped=!flipped; renderFlash(); });
$("#flashBody").addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); flipped=!flipped; renderFlash(); }});
$("#flashFlip").addEventListener("click", ()=>{ flipped=!flipped; renderFlash(); });
$("#flashPrev").addEventListener("click", ()=>{ flashPos=(flashPos-1+flashOrder.length)%flashOrder.length; flipped=false; renderFlash(); });
$("#flashNext").addEventListener("click", ()=>{ flashPos=(flashPos+1)%flashOrder.length; flipped=false; renderFlash(); });
$("#flashShuffle").addEventListener("click", ()=>{ for(let i=flashOrder.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [flashOrder[i],flashOrder[j]]=[flashOrder[j],flashOrder[i]]; } flashPos=0; flipped=false; renderFlash(); toast("Deck shuffled 🔀"); });
renderFlash();

/* ---------- Quiz ---------- */
let quizIdx=0, quizCorrect=0, quizAnswered=false;
function renderQuiz(){
  const body=$("#quizBody");
  $("#quizScore").textContent = quizIdx? `· ${quizCorrect}/${quizIdx} so far` : "";
  if(quizIdx>=D.quiz.length){
    const pct=Math.round(quizCorrect/D.quiz.length*100);
    body.innerHTML=`<h3 style="margin:0 0 .5rem">Score: ${quizCorrect}/${D.quiz.length} (${pct}%)</h3><p style="color:var(--muted)">${pct>=80?"✅ Interview-ready range. Now rehearse flashcards out loud and reread the ★3 eng posts.":pct>=60?"Close — revisit §§4–5 and §2, then retake. Fluency is repetition.":"Loop back through §§1–5 slowly with the simulators. The quiz will feel different in an hour."}</p>`;
    if(pct>=80){ state["chk13"]=true; save(); const c=$('[data-chk="13"]'); if(c) c.checked=true; refreshProgress(); }
    return;
  }
  const q=D.quiz[quizIdx]; quizAnswered=false;
  body.innerHTML=`<p style="color:var(--muted2);font-size:.74rem">Question ${quizIdx+1} of ${D.quiz.length}</p><h3 style="margin:.2rem 0 .7rem;font-size:.98rem">${esc(q.q)}</h3>`+
    q.opts.map((o,i)=>`<button class="quiz-opt" data-opt="${i}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join("")+`<div id="quizWhy"></div>`;
}
$("#quizBody").addEventListener("click", e=>{
  const b=e.target.closest("[data-opt]"); if(!b||quizAnswered) return;
  quizAnswered=true;
  const pick=+b.getAttribute("data-opt"), q=D.quiz[quizIdx];
  $$("#quizBody .quiz-opt").forEach((o,i)=>{ o.classList.toggle("correct", i===q.a); o.classList.toggle("wrong", i===pick && pick!==q.a); o.disabled=true; });
  if(pick===q.a) quizCorrect++;
  $("#quizWhy").innerHTML=`<p class="quiz-why">${pick===q.a?"✅ Correct. ":"❌ Not quite. "}${esc(q.why)}</p><button class="button primary compact" id="quizNext" style="margin-top:.6rem">${quizIdx+1>=D.quiz.length?"See score":"Next question →"}</button>`;
  $("#quizNext").addEventListener("click", ()=>{ quizIdx++; renderQuiz(); });
});
$("#quizRestart").addEventListener("click", ()=>{ quizIdx=0; quizCorrect=0; renderQuiz(); });
renderQuiz();

/* ---------- One-pager + sources ---------- */
$("#onePager").innerHTML = D.onePager.map(r=>`<p style="margin:.25rem 0"><b>${esc(r[0])}</b> ${esc(r[1])}</p>`).join("");
$("#sourceList").innerHTML = D.sources.map(s=>`<div class="source-item"><a href="${esc(s.url)}" ${s.url.startsWith("http")?'target="_blank" rel="noopener"':""}>${esc(s.label)}</a><span>${esc(s.note)}</span></div>`).join("");
})();
