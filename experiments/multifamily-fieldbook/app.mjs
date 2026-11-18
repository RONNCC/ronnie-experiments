import {
  chapters,
  lessons,
  decisions,
  glossary,
  route,
  sources,
  interviewCard,
  projectBoundary,
  casePackages,
} from "./content/book.mjs";
import {
  implied,
  coverage,
  fundingGap,
  emptyStudy,
  readStudy,
  reviewIds,
  glossaryText,
  money,
  pct,
} from "./logic.mjs";
import { icon, plate } from "./art.mjs";

const main = document.querySelector("main");
const KEY = "parcel-press.multifamily.study.v1";
let store;
try {
  store = window.localStorage;
} catch {
  /* Storage is optional. */
}
let study = store ? readStudy(store, KEY) : emptyStudy();
let persists = Boolean(store);
const byId = (items, id) => items.find((x) => x.id === id);
const chapterOf = (id) => chapters.find((c) => byId(c.lessons, id));
const h = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const prose = (s) =>
  h(s).replaceAll("[VERIFY]", '<span class="verify">[VERIFY]</span>');
const pad = (n) => String(n).padStart(2, "0");
const link = (path, text, cls = "") =>
  `<a class="${cls}" href="#${path}">${text}</a>`;
const title = (k, t, d = "") =>
  `<header class="page-head"><p class="kicker">${k}</p><h1>${t}</h1>${d ? `<p class="lead">${d}</p>` : ""}</header>`;
const crumb = (t, path = "home", parent = "Library") =>
  `<div class="crumb">${link(path, parent)}<span>/</span>${h(t)}</div>`;
const sectionHead = (k, t, d = "") =>
  `<div class="section-head"><p class="kicker">${k}</p><h2>${t}</h2>${d ? `<p>${d}</p>` : ""}</div>`;
const lastLesson = () => byId(lessons, study.last) || lessons[0];
const announce = (text) => {
  document.getElementById("notice").textContent = text;
};
function save() {
  try {
    if (store) store.setItem(KEY, JSON.stringify(study));
    else persists = false;
  } catch {
    persists = false;
  }
}
function addOnce(list, id) {
  if (!list.includes(id)) list.push(id);
}
function progress() {
  const count = lessons.filter((l) => study.studied.includes(l.id)).length;
  return `<div class="progress-block"><span>Reading progress <b>${count} / ${lessons.length}</b></span><progress aria-label="Lessons studied" max="${lessons.length}" value="${count}"></progress></div>`;
}
function goLibrary() {
  document.getElementById("library")?.scrollIntoView({ block: "start" });
}
function home() {
  return `<section class="cover"><div class="cover-left"><div class="cover-series"><span class="series-line"></span> FIELD MANUAL <span class="series-dot">/</span> VOL. 01</div><h1>The multifamily <br><span>fieldbook.</span></h1><p>A practical guide to Washington site search, deal math, and the product decisions behind both.</p><div class="cover-actions">${link("review", `${study.studied.length ? "Resume reading" : "Start reading"} ${icon("arrow")}`, "btn lime")}${link("route", `${icon("clock")} 1-hour interview route`, "route-link")}</div></div><figure class="cover-plate"><div class="plate-top"><span>FIG. 01</span> AXONOMETRIC STUDY</div><img src="assets/block-study.svg" alt="Architectural drawing of three apartment wings around a courtyard within a dashed lot boundary. Illustrative, not a River North site plan."><figcaption>${icon("target")} Illustrative block study <span>Not to scale</span></figcaption></figure><div class="cover-foot"><span>${icon("pin")} Washington field series</span><span>06 chapters <b>/</b> ${lessons.length} lessons <b>/</b> 12 decisions</span></div></section>
<section id="library" class="library"><div class="section-row">${sectionHead("CONTENTS &nbsp; / &nbsp; 01–06", "Chapter library", "Read in order, or open the chapter you need for your next conversation.")}${progress()}</div><div class="chapter-grid">${chapters.map((c, i) => `<a class="chapter-card" href="#lesson/${c.lessons[0].id}">${plate(c.id, i)}<div class="chapter-body"><div class="kicker">CHAPTER ${c.id} <span> / </span> ${h(c.topic)}</div><h3>${c.title}</h3><div class="card-bottom"><span>${icon("book")} ${c.lessons.length} lessons</span><span class="card-arrow">${icon("arrow")}</span></div></div></a>`).join("")}</div></section>
<section class="field-banner"><div><p class="kicker">THE INTERVIEW DESK</p><h2>Find the site.<br>Defend the decision.</h2><p>Practice the twelve choices behind coretsu-houses, then test your reasoning against an investor’s toughest follow-up.</p></div>${link("decisions", `Open decision desk ${icon("arrow")}`, "btn dark")}</section><div class="home-notes"><div>${icon("file")}<div><h3>One case, two documents</h3><p>Work through River North without inventing the missing numbers.</p>${link("case", `Open the case lab ${icon("arrow")}`, "text-link")}</div></div><div>${icon("layers")}<div><h3>Evidence boundaries</h3><p>Project facts come from your brief. Other numbers are illustrative. Verify live rules with the named authority.</p>${link("sources", `See source checks ${icon("arrow")}`, "text-link")}</div></div></div>`;
}
function sidebar(current) {
  return `<aside class="reader-side"><details class="toc"><summary>Chapter contents ${icon("book")}</summary><div class="toc-inner"><p class="kicker">FIELD INDEX</p>${chapters.map((c) => `<details ${c === chapterOf(current.id) ? "open" : ""}><summary><span class="badge-letter">${c.id}</span>${c.topic}</summary><div class="toc-links">${c.lessons.map((l, i) => `<a href="#lesson/${l.id}" ${l === current ? 'aria-current="page"' : ""}><span>${study.studied.includes(l.id) ? "✓" : pad(i + 1)}</span>${l.title}</a>`).join("")}</div></details>`).join("")}${progress()}${link("review", "Review three terms →", "text-link")}</div></details></aside>`;
}
function refList(ids) {
  return ids
    .map((id) => {
      const [name, why, url] = sources[id];
      return `<li>${url ? `<a href="${h(url)}" target="_blank" rel="noopener noreferrer">${h(name)} ↗</a>` : `<b>${h(name)}</b>`}<p>${h(why)}</p></li>`;
    })
    .join("");
}
function feedback(l, n) {
  return n === 0
    ? `<b>Correct.</b> ${h(l.apply[4])}`
    : `<b>Not quite. Review queued.</b> ${h(l.apply[4])} Try again before relying on this in a meeting.`;
}
function lesson(id) {
  const l = byId(lessons, id);
  if (!l) return notFound();
  const c = chapterOf(id),
    i = c.lessons.indexOf(l),
    n = lessons.indexOf(l),
    next = lessons[n + 1],
    prev = lessons[n - 1],
    a = study.answers[id];
  study.last = id;
  save();
  const shift = [...id].reduce((v, ch) => v + ch.charCodeAt(0), 0) % 3;
  const related = decisions.filter((d) => d.lesson === id);
  return `${crumb(`Chapter ${c.id} · ${c.topic}`)}<div class="reader-layout">${sidebar(l)}<article class="reading"><p class="kicker">CHAPTER ${c.id} &nbsp; / &nbsp; LESSON ${pad(i + 1)} OF ${pad(c.lessons.length)}</p><h1>${l.title}</h1><p class="definition">${prose(l.definition)}</p><h2>Why it matters</h2><p>${prose(l.why)}</p><div class="worked"><p class="kicker">${icon("layers")} WORKED EXAMPLE · ILLUSTRATIVE</p><p>${prose(l.example)}</p></div><h2>At the product desk</h2><p>${prose(l.desk)}</p><div class="trap"><b>Meeting mistake</b><p>${prose(l.trap)}</p></div><details class="disclosure"><summary>Drill down: what to check ${icon("arrow")}</summary><p>${prose(l.deeper)}</p>${l.refs.length ? `<ul class="sources-list">${refList(l.refs)}</ul>` : ""}</details>
 <section class="quiz"><p class="kicker">REHEARSAL &nbsp; / &nbsp; 3 QUESTIONS</p><h2>Test yourself</h2><details class="disclosure"><summary>1. Recall: explain ${h(l.concept.toLowerCase())}.</summary><p>${prose(l.definition)}</p></details><div class="quiz-question"><h3>2. Apply it to the deal</h3><p>${h(l.apply[0])}</p><div class="choices">${[
   0, 1, 2,
 ]
   .map((_, j) => {
     const v = (shift + j) % 3;
     return `<button class="choice" data-choice="${v}" data-for="${id}" aria-pressed="${a === v}"><span>${"ABC"[j]}</span>${h(l.apply[1 + v])}</button>`;
   })
   .join(
     "",
   )}</div><div class="feedback" role="status" id="quiz-feedback">${[0, 1, 2].includes(a) ? feedback(l, a) : ""}</div></div><details class="disclosure"><summary>3. Investor pitch: ${h(l.pitch[0])}</summary><p>Say it in 30 seconds in your own words. Then compare:</p><blockquote>${h(l.pitch[1])}</blockquote><p><b>Self-check:</b> Did you answer the question, name the evidence and avoid the meeting mistake above?</p></details></section>
 <details class="disclosure"><summary>Lesson glossary · ${l.terms.length} terms</summary><dl class="inline-terms">${l.terms.map(([t, d]) => `<dt>${h(t)}</dt><dd>${h(d)}</dd>`).join("")}</dl>${link("glossary", "Open the copyable glossary →", "text-link")}</details>${related.length ? `<div class="related"><span class="kicker">DECISION PRACTICE</span>${related.map((d) => link("decision/" + d.id, `${d.title} ${icon("diag")}`, "chip")).join("")}</div>` : ""}
 <div class="read-bottom"><button id="mark" data-lesson="${id}" class="btn ${study.studied.includes(id) ? "subtle" : "dark"}" aria-pressed="${study.studied.includes(id)}">${icon("check")} ${study.studied.includes(id) ? "Marked as studied" : "Mark as studied"}</button><span id="saved-message" role="status">${persists ? "Progress stays in this browser." : "Progress is available for this visit only."}</span></div><div class="pager">${prev ? link("lesson/" + prev.id, `${icon("back")} Previous lesson`) : link("home", `${icon("back")} Library`)}${next ? link("lesson/" + next.id, `Next lesson ${icon("arrow")}`) : link("decisions", `Decision desk ${icon("arrow")}`)}</div></article></div>`;
}
function decisionIndex() {
  return `${crumb("Decision desk")}${title("PRACTICE DESK &nbsp; / &nbsp; 12 BRIEFS", "Defend the decision.", "Start with the trade-off, not the feature. Pick a decision, give your answer aloud, then see what a lender would challenge.")}<div class="decision-grid">${decisions.map((d, i) => `<a class="decision-card" href="#decision/${d.id}"><div class="index-row"><span class="index-num">${pad(i + 1)}</span><span class="kicker">${d.group}</span></div><h2>${d.title}</h2><p>${h(d.question)}</p><span class="text-link">Rehearse ${icon("arrow")}</span></a>`).join("")}</div>`;
}
function decision(id) {
  const d = byId(decisions, id);
  if (!d) return notFound();
  const ix = decisions.indexOf(d),
    checks = Array.isArray(study.rubrics[id]) ? study.rubrics[id] : [];
  return `${crumb("Decision " + pad(ix + 1), "decisions", "Decision desk")}<div class="decision-layout"><article class="reading">${title(`DECISION ${pad(ix + 1)} OF 12 &nbsp; / &nbsp; ${h(d.group)}`, d.title, h(d.question))}<h2>The realistic alternatives</h2><ol class="alt-list">${d.options.map(([name, reason], i) => `<li><span class="badge-letter">${"ABC"[i]}</span><div><h3>${h(name)}</h3><p>${h(reason)}</p></div></li>`).join("")}</ol><div class="worked"><p class="kicker">PRODUCT FIT</p><p>${prose(d.fit)}</p></div><section class="practice"><h2>Make the case in 30 seconds</h2><p>In your own words: “I chose X over Y because…” Name the trade-off and the evidence you would verify.</p><label for="draft">Your rehearsal <span>Private to this browser</span></label><textarea id="draft" data-id="${id}" maxlength="2400" rows="4" placeholder="I chose…">${h(typeof study.drafts[id] === "string" ? study.drafts[id] : "")}</textarea><details class="disclosure"><summary>Compare the three-sentence answer</summary><blockquote>${d.say.map(h).join(" ")}</blockquote></details><details class="disclosure"><summary>Tough follow-up: ${h(d.challenge)}</summary><p>${prose(d.answer)}</p></details><h3>Critique your take</h3><p>Tick only points you actually said. This is a self-check, not an automated evaluation of your prose.</p><div class="checklist">${d.checks.map((s, i) => `<label><input type="checkbox" data-rubric="${i}" data-id="${id}" ${checks.includes(i) ? "checked" : ""}>${h(s)}</label>`).join("")}</div><button class="btn dark" data-critique="${id}">Get rehearsal feedback ${icon("arrow")}</button><div class="feedback" id="critique" role="status"></div><p class="small coaching-tip">For a tutor’s critique, paste your decision number and your own pitch into your study chat. Leave confidential documents out.</p></section><div class="trap"><b>Meeting mistake</b><p>${h(d.miss)}</p></div><div class="pager">${link("decisions", `${icon("back")} All decisions`)}${ix < 11 ? link("decision/" + decisions[ix + 1].id, `Next decision ${icon("arrow")}`) : link("review", `Recall warm-up ${icon("arrow")}`)}</div></article><aside class="margin-note"><p class="kicker">FIELD NOTE &nbsp; / &nbsp; ${pad(ix + 1)}</p><h2>Bring evidence.</h2><p>A good answer says when the alternative would be better. A great one says what would change your mind.</p>${link("lesson/" + d.lesson, `Read the related lesson ${icon("arrow")}`, "text-link")}<hr>${link("route", `${icon("clock")} One-hour route`, "text-link")}</aside></div>`;
}
function caseView() {
  const [a, b] = casePackages,
    ia = implied(a),
    ib = implied(b);
  const rows = [
    ["Units", a.units, b.units, "+20"],
    ["Project cost", "$47.3m", "$50m", "+$2.7m"],
    ["Net operating income (NOI)", "$2.6m", "$2.5m", "−$100,000"],
    [
      "Cost per unit",
      money(ia.perUnit),
      money(ib.perUnit),
      money(ib.perUnit - ia.perUnit),
    ],
    [
      "Implied yield on cost¹",
      pct(ia.yieldPct),
      pct(ib.yieldPct),
      "−0.50 points",
    ],
  ];
  return `${crumb("Case lab")}${title("CASE FILE &nbsp; / &nbsp; 01", "River North. Two packages.", "Reproduce each source before reconciling the difference. Neither the summary nor the model is established as the controlling version.")}<section class="case-panel"><p class="kicker">EXHIBIT A &nbsp; / &nbsp; SUPPLIED FIGURES + DERIVED RATIOS</p><div class="table-wrap" role="region" aria-label="Scrollable document comparison" tabindex="0"><table><caption class="sr">River North: model minus document summary</caption><thead><tr><th>Measure</th><th>Document summary</th><th>Financial model</th><th>Model − summary</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v, i) => (i ? `<td>${v}</td>` : `<th scope="row">${v}</th>`)).join("")}</tr>`).join("")}</tbody></table></div><p class="small">¹ Only if each NOI is stabilized annual income and each cost is the matching total development cost. The final two rows are calculations, not quoted returns. Source filenames, versions, dates, periods and approval status were not supplied.</p></section><div class="case-layout"><section class="case-panel"><p class="kicker">EXHIBIT B &nbsp; / &nbsp; ILLUSTRATIVE ONLY</p><h2>Underwriting scratchpad</h2><p>Test an assumption, not a project fact. Choose one complete package. No debt or equity terms are supplied.</p><label for="package">Source package</label><select id="package"><option value="model">Financial model · 200 units</option><option value="summary">Document summary · 180 units</option></select><label for="payment">Assumed annual debt service ($ millions)</label><input type="number" id="payment" min="0" step="any" placeholder="e.g. 2.0"><div class="result"><span>Illustrative debt service coverage ratio</span><strong id="coverage-result" aria-live="polite">Missing input</strong></div><p class="small">Assumes the package’s NOI equals the lender’s eligible annual income. Enter a positive annual payment, not a loan balance.</p><h3>Two-source funding check</h3><div class="input-pair"><label>Assumed debt ($ millions)<input type="number" id="debt" min="0" step="any" placeholder="e.g. 30"></label><label>Assumed equity ($ millions)<input type="number" id="equity" min="0" step="any" placeholder="e.g. 19"></label></div><div class="result"><span>Uses minus debt and equity</span><strong id="gap-result" aria-live="polite">Missing inputs</strong></div><p class="small">Assumes no other sources. Zero must be explicit. Balance is not a funding commitment.</p></section><aside class="margin-note"><p class="kicker">LENDER’S QUESTION</p><h2>Which figure would you rely on?</h2><p>For count: match the unit schedule to the plan and its approval status. For cost: request a budget for that same scope. For income: check period, stabilization, expenses and reserves.</p><p>Until reconciled, show both packages. Do not average them or mix one document’s numerator with the other’s denominator.</p>${link("decision/disagreement", `Rehearse this decision ${icon("arrow")}`, "text-link")}</aside></div>`;
}
function routeView() {
  let sum = 0;
  return `${crumb("Interview route")}${title("GUIDED PATH &nbsp; / &nbsp; 60 MINUTES", "The one-hour interview route.", "Budget your time by the clock. Say each answer aloud before looking at the model. You can return to any chapter afterward.")}<details class="route-card disclosure"><summary>If the interview starts now: open the pocket brief</summary><blockquote>${h(interviewCard.opening)}</blockquote><dl class="inline-terms">${interviewCard.checks.map(([q, a]) => `<dt>${h(q)}</dt><dd>${h(a)}</dd>`).join("")}</dl></details><div class="route-start"><span>${icon("clock")} Start with three terms from your last session, or the baseline if this is your first visit.</span>${link("review", "Open warm-up →", "text-link")}</div><ol class="route-list">${route
    .map((r, i) => {
      const start = sum;
      sum += r.minutes;
      return `<li><div class="route-time"><span class="kicker">MINUTES</span><strong>${pad(start)}–${pad(sum)}</strong></div><div><p class="kicker">STOP ${pad(i + 1)}</p><h2>${r.title}</h2><p>${r.note}</p><div class="chips">${r.links.map(([path, t]) => link(path, `${t} ${icon("diag")}`, "chip")).join("")}</div></div></li>`;
    })
    .join("")}</ol>`;
}
function glossaryView() {
  return `${crumb("Glossary")}${title("REFERENCE &nbsp; / &nbsp; FIELD TERMS", "The glossary.", "Look up a term or take your studied vocabulary into the meeting. Each entry links back to the lesson where it is used.")}<div class="gloss-controls"><label class="search-field">${icon("search")}<input type="search" id="term-search" placeholder="Search terms or definitions" aria-label="Search terms or definitions"></label><select id="term-scope" aria-label="Glossary scope"><option value="all">All terms</option><option value="studied">Studied terms</option></select><button class="btn outline" id="copy-terms">${icon("copy")} Copy list</button></div><p class="small" id="term-count" aria-live="polite"></p><div id="copy-note" role="status"></div><div id="gloss-list" class="gloss-list"></div>`;
}
function filteredTerms() {
  const q = document.querySelector("#term-search").value.trim().toLowerCase(),
    old = document.querySelector("#term-scope").value === "studied";
  return glossary.filter(
    (g) =>
      (!old || study.studied.includes(g.lesson)) &&
      `${g.term} ${g.meaning}`.toLowerCase().includes(q),
  );
}
function updateTerms() {
  const terms = filteredTerms();
  document.querySelector("#term-count").textContent =
    `${terms.length} ${terms.length === 1 ? "entry" : "entries"}`;
  document.querySelector("#gloss-list").innerHTML = terms.length
    ? terms
        .map(
          (g) =>
            `<div><h2>${h(g.term)}</h2><p>${h(g.meaning)}</p>${link("lesson/" + g.lesson, `Lesson ${icon("diag")}`, "text-link")}</div>`,
        )
        .join("")
    : '<p class="empty">No matching terms. Try a different search or choose All terms; studied terms appear after marking lessons.</p>';
  document.querySelector("#copy-terms").disabled = !terms.length;
  document.querySelector("#copy-note").replaceChildren();
}
function reviewView() {
  const ids = reviewIds(
      study,
      lessons.map((l) => l.id),
    ),
    older = study.review.length || study.studied.length;
  return `${crumb("Recall warm-up")}${title("PRACTICE DESK &nbsp; / &nbsp; SESSION OPENER", "Three-term recall.", older ? "Review queued misses first, then previously studied concepts. Say the answer before revealing the key." : "First session: start with these three baseline terms. Later sessions prioritize concepts you missed or studied.")}<div class="review-list">${ids
    .map((id, i) => {
      const l = byId(lessons, id);
      return `<section class="review-card"><span class="index-num">${pad(i + 1)}</span><div><p class="kicker">${study.review.includes(id) ? "QUEUED FOR REVIEW" : study.studied.includes(id) ? "PREVIOUSLY STUDIED" : "BASELINE TERM"}</p><h2>${h(l.concept)}</h2><p>Define it in one sentence. What would it <b>not</b> prove?</p><details class="disclosure"><summary>Reveal answer and check yourself</summary><p>${h(l.definition)}</p><p><b>Do not say:</b> ${h(l.trap)}</p><div class="chips"><button class="btn outline" data-recall="again" data-id="${id}">Review again</button><button class="btn subtle" data-recall="got" data-id="${id}">Got it ${icon("check")}</button>${link("lesson/" + id, "Read lesson ↗", "text-link")}</div><p class="small recall-status" role="status"></p></details></div></section>`;
    })
    .join(
      "",
    )}</div><div class="actions">${link("lesson/" + lastLesson().id, `Continue to ${study.last ? "lesson" : "chapter A"} ${icon("arrow")}`, "btn dark")}${link("route", `Interview route ${icon("arrow")}`, "text-link")}${link("glossary", "Copy your glossary →", "text-link")}</div>`;
}
function sourceView() {
  return `${crumb("Source checks")}${title("REFERENCE &nbsp; / &nbsp; VERIFICATION DESK", "Know what to verify.", "Use the primary agency or operative document for the question in front of you. A listed resource is a verification destination, not a live legal determination.")}<div class="worked"><p class="kicker">EVIDENCE BOUNDARY</p><p>${prose(projectBoundary)}</p></div><ul class="sources-list source-directory">${refList(Object.keys(sources))}</ul><h2>Study privacy</h2><p>Progress, quiz selections and rehearsal drafts are stored only in this browser when storage is available. Do not enter confidential deal documents or personal information. Clearing this experiment’s study data removes its local progress and drafts.</p><details class="disclosure"><summary>Clear local study data</summary><p>This affects only this fieldbook and cannot be undone.</p><button class="btn outline" id="clear-study">Clear this fieldbook’s data</button><p id="clear-status" role="status"></p></details>`;
}
function notFound() {
  return `${title("FIELD INDEX", "Page not found.", "That fieldbook link does not match a lesson or decision.")}${link("home", "Return to the library →", "btn dark")}`;
}
function render(move = false) {
  const [page = "home", id] = location.hash.slice(1).split("/");
  if (page === "main" && main.querySelector("h1")) {
    main.focus();
    return;
  }
  const view = page === "main" ? "home" : page || "home";
  const pages = {
    home,
    library: home,
    lesson: () => lesson(id),
    decisions: decisionIndex,
    decision: () => decision(id),
    case: caseView,
    route: routeView,
    glossary: glossaryView,
    review: reviewView,
    sources: sourceView,
  };
  main.innerHTML = Object.hasOwn(pages, view) ? pages[view]() : notFound();
  document.title = `${main.querySelector("h1")?.textContent || "The multifamily fieldbook"} · Parcel Press`;
  const nav =
    { lesson: "home", decision: "decisions", library: "home" }[view] || view;
  document.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.dataset.nav === nav) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (view === "glossary") updateTerms();
  if (view === "lesson") {
    const toc = main.querySelector(".toc");
    if (toc) toc.open = window.matchMedia("(min-width: 850px)").matches;
  }
  if (move) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
  if (view === "library") goLibrary();
}
function caseCalc() {
  const pkg = byId(casePackages, document.querySelector("#package").value);
  const dollars = (id) => {
    const el = document.getElementById(id);
    return el.value.trim() !== "" &&
      el.validity.valid &&
      Number.isFinite(el.valueAsNumber) &&
      el.valueAsNumber >= 0
      ? el.valueAsNumber * 1e6
      : null;
  };
  const ratio = coverage(pkg.noi, dollars("payment")),
    gap = fundingGap(pkg.cost, [dollars("debt"), dollars("equity")]);
  document.querySelector("#coverage-result").textContent =
    ratio === null ? "Need positive payment" : `${ratio.toFixed(2)}×`;
  document.querySelector("#gap-result").textContent =
    gap === null
      ? "Missing valid inputs"
      : Math.abs(gap) < 0.005
        ? "Balanced"
        : `${money(Math.abs(gap))} ${gap > 0 ? "shortfall" : "surplus"}`;
}
main.addEventListener("input", (e) => {
  const t = e.target;
  if (t.id === "term-search" || t.id === "term-scope") updateTerms();
  else if (["package", "payment", "debt", "equity"].includes(t.id)) caseCalc();
  else if (t.id === "draft") {
    study.drafts[t.dataset.id] = t.value.slice(0, 2400);
    save();
    document.querySelector("#critique").replaceChildren();
  } else if (t.matches("[data-rubric]")) {
    study.rubrics[t.dataset.id] = [
      ...main.querySelectorAll("[data-rubric]:checked"),
    ].map((x) => Number(x.dataset.rubric));
    save();
    document.querySelector("#critique").replaceChildren();
  }
});
main.addEventListener("click", async (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.hasAttribute("data-choice")) {
    const l = byId(lessons, b.dataset.for),
      n = Number(b.dataset.choice);
    study.answers[l.id] = n;
    if (n !== 0) addOnce(study.review, l.id);
    save();
    main
      .querySelectorAll("[data-choice]")
      .forEach((btn) => btn.setAttribute("aria-pressed", String(btn === b)));
    document.querySelector("#quiz-feedback").innerHTML = feedback(l, n);
  } else if (b.id === "mark") {
    const id = b.dataset.lesson,
      marked = study.studied.includes(id);
    if (marked) study.studied = study.studied.filter((x) => x !== id);
    else addOnce(study.studied, id);
    save();
    b.setAttribute("aria-pressed", String(!marked));
    b.className = `btn ${marked ? "dark" : "subtle"}`;
    b.innerHTML = `${icon("check")} ${marked ? "Mark as studied" : "Marked as studied"}`;
    document.querySelector("#saved-message").textContent = persists
      ? "Study progress saved in this browser."
      : "Updated for this visit only.";
    const old = main.querySelector(".progress-block");
    if (old) old.outerHTML = progress();
    const tocL = main.querySelector(".toc-links [aria-current] span");
    if (tocL)
      tocL.textContent = marked
        ? pad(chapterOf(id).lessons.findIndex((x) => x.id === id) + 1)
        : "✓";
  } else if (b.dataset.recall) {
    const id = b.dataset.id;
    if (b.dataset.recall === "again") addOnce(study.review, id);
    else {
      study.review = study.review.filter((x) => x !== id);
      addOnce(study.studied, id);
    }
    save();
    b.closest(".disclosure").querySelector(".recall-status").textContent =
      b.dataset.recall === "again"
        ? "Queued for your next warm-up."
        : "Recalled. Marked as studied.";
  } else if (b.dataset.critique) {
    const d = byId(decisions, b.dataset.critique),
      draft = document.querySelector("#draft"),
      out = document.querySelector("#critique");
    if (!draft.value.trim()) {
      out.textContent =
        "Give your own answer first. Type a short rehearsal, then check it against the three criteria.";
      draft.focus();
      return;
    }
    const missing = d.checks.filter(
      (_, i) => !(study.rubrics[d.id] || []).includes(i),
    );
    out.textContent = missing.length
      ? `Self-check: ${3 - missing.length}/3. Revise your pitch: ${missing.join(" ")} Meeting risk: ${d.miss}`
      : `Self-check: 3/3 points covered. Now answer the tough follow-up without looking. Meeting risk: ${d.miss}`;
  } else if (b.id === "copy-terms") {
    const text = glossaryText(filteredTerms()),
      note = document.querySelector("#copy-note");
    try {
      await navigator.clipboard.writeText(text);
      note.textContent = "Glossary copied.";
    } catch {
      note.innerHTML =
        '<label for="manual-copy">Clipboard unavailable. Copy the selected text:</label><textarea id="manual-copy" rows="5" readonly></textarea>';
      const el = note.querySelector("textarea");
      el.value = text;
      el.focus();
      el.select();
    }
  } else if (b.id === "clear-study") {
    study = emptyStudy();
    try {
      store?.removeItem(KEY);
    } catch {
      persists = false;
    }
    document.querySelector("#clear-status").textContent = persists
      ? "This fieldbook’s local progress and drafts were cleared."
      : "Progress cleared for this visit; browser storage is unavailable.";
    announce("Study data cleared.");
  }
});
window.addEventListener("hashchange", () => render(true));
render();
