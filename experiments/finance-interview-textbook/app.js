import investmentBanking from "./tracks/investment-banking.js";
import privateCredit from "./tracks/private-credit.js";
import privateEquity from "./tracks/private-equity.js";
import hedgeFunds from "./tracks/hedge-funds.js";
import salesTrading from "./tracks/sales-trading.js";
import equityResearch from "./tracks/equity-research.js";
import wealthManagement from "./tracks/wealth-management.js";

const tracks = [
  { name: "Investment Banking", topics: investmentBanking },
  { name: "Private Credit", topics: privateCredit },
  { name: "Private Equity", topics: privateEquity },
  { name: "Hedge Funds", topics: hedgeFunds },
  { name: "Sales & Trading", topics: salesTrading },
  { name: "Equity Research", topics: equityResearch },
  { name: "Wealth Management", topics: wealthManagement },
];
const allTopics = tracks.flatMap(track => track.topics);
const storageKey = "finance-interview-textbook-progress-v1";
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
let completed = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(stored)) completed = new Set(stored.filter(id => allTopics.some(topic => topic.id === id)));
} catch { /* Storage may be disabled; the book remains usable. */ }

function updateProgress() {
  const count = completed.size;
  $("#done-count").textContent = count;
  $("#progress-bar").style.width = `${count / allTopics.length * 100}%`;
  $(".progress").setAttribute("aria-valuenow", String(count));
  try { localStorage.setItem(storageKey, JSON.stringify([...completed])); } catch { /* Optional persistence. */ }
}

function renderTrackCards() {
  $("#track-cards").innerHTML = tracks.map((track, i) => `<a class="track-card" href="#track-${i}"><span>TRACK 0${i + 1}</span><strong>${esc(track.name)}</strong><small>10 topics · explore →</small></a>`).join("");
}

function renderToc() {
  $("#chapter-nav").innerHTML = tracks.map((track, i) => `<details class="toc-track" open><summary>${esc(track.name)}</summary><div class="toc-links">${track.topics.map(topic => `<a href="#${esc(topic.id)}">${esc(topic.title)}</a>`).join("")}</div></details>`).join("");
}

function exampleText(topic) {
  if (typeof topic.example === "string") return topic.example;
  return `${topic.example.assumptions} ${topic.example.steps.join(" ")}`;
}
function exampleMarkup(topic) {
  if (typeof topic.example === "string") return `<p>${esc(topic.example)}</p>`;
  return `<p><strong>Assumptions:</strong> ${esc(topic.example.assumptions)}</p><ol>${topic.example.steps.map(step => `<li>${esc(step)}</li>`).join("")}</ol>`;
}
function topicMarkup(topic, index) {
  const questions = topic.questions.map((item, i) => `<details class="question"><summary>Interview question ${i + 1}: ${esc(item.q)}</summary><div class="answer"><p>${esc(item.a)}</p><p class="mistake"><strong>Typical mistake:</strong> ${esc(item.mistake)}</p></div></details>`).join("");
  return `<article class="topic" id="${esc(topic.id)}" data-search="${esc([topic.title, topic.track, topic.explanation, topic.framework, exampleText(topic), ...topic.questions.flatMap(q => [q.q, q.a, q.mistake])].join(" ").toLowerCase())}">
    <div class="topic-top"><div><span class="topic-number">${String(index).padStart(2, "0")} · ${esc(topic.track.toUpperCase())}</span><h3>${esc(topic.title)}</h3></div><label class="done-label"><input type="checkbox" data-done="${esc(topic.id)}" ${completed.has(topic.id) ? "checked" : ""}><span>Mark done</span></label></div>
    <p class="explanation">${esc(topic.explanation)}</p>
    <h4>Key formulas &amp; framework</h4><div class="formula"><p>${esc(topic.framework)}</p></div>
    <h4>Worked example</h4><div class="example">${exampleMarkup(topic)}</div>
    <h4>Interview practice</h4>${questions}
    <details class="self-check"><summary>Quick self-check · click to reveal</summary><p><strong>${esc(topic.selfCheck.question)}</strong></p><p>${esc(topic.selfCheck.answer)}</p></details>
  </article>`;
}

function renderBook(query = "") {
  const normalized = query.trim().toLocaleLowerCase();
  let hitCount = 0;
  const html = tracks.map((track, trackIndex) => {
    const matching = track.topics.filter(topic => !normalized || [topic.title, topic.track, topic.explanation, topic.framework, exampleText(topic), ...topic.questions.flatMap(q => [q.q, q.a, q.mistake])].join(" ").toLocaleLowerCase().includes(normalized));
    if (!matching.length) return "";
    hitCount += matching.length;
    return `<section class="track-section" id="track-${trackIndex}"><header class="track-heading"><p class="section-kicker">CAREER TRACK 0${trackIndex + 1} · ${matching.length} ${normalized ? "MATCHING " : ""}TOPICS</p><h2>${esc(track.name)}</h2></header>${matching.map(topic => topicMarkup(topic, track.topics.indexOf(topic) + 1)).join("")}</section>`;
  }).join("");
  $("#book-content").innerHTML = html || `<p class="empty-state">No topics match “${esc(query)}”. Try another term or clear the search.</p>`;
  $("#search-status").textContent = normalized ? `${hitCount} matching topic${hitCount === 1 ? "" : "s"}` : "";
  $("#chapter-nav").hidden = Boolean(normalized);
  $("#book-content").querySelectorAll("[data-done]").forEach(box => box.addEventListener("change", event => {
    event.target.checked ? completed.add(event.target.dataset.done) : completed.delete(event.target.dataset.done);
    updateProgress();
  }));
}

const glossary = [
  ["Accretion / dilution", "Whether a transaction increases or decreases the acquirer's earnings per share relative to standalone EPS."],
  ["Basis point (bp)", "One hundredth of one percentage point; 100 basis points equal 1 percentage point."],
  ["CAGR", "Compound annual growth rate: the constant annual rate linking beginning and ending values over a stated period."],
  ["Capex", "Capital expenditure: cash invested in long-lived assets; accounting and cash-flow presentation follow applicable standards."],
  ["DCF", "Discounted cash flow: valuation based on the present value of forecast cash flows and continuing value."],
  ["EBITDA", "Earnings before interest, taxes, depreciation, and amortization; definitions and adjustments may vary."],
  ["Enterprise value (EV)", "A measure of operating-business value across capital providers; commonly equity value plus debt less cash, with other claims adjusted."],
  ["Free cash flow", "Cash generated after specified operating and investment needs; the exact definition depends on whether it is unlevered or equity cash flow."],
  ["IRR", "Internal rate of return: the discount rate that sets the net present value of a series of dated cash flows to zero."],
  ["MOIC", "Multiple on invested capital: total value or proceeds divided by invested capital under a stated convention."],
  ["Net working capital (NWC)", "Operating current assets less operating current liabilities, commonly excluding cash and debt; transaction definitions vary."],
  ["WACC", "Weighted average cost of capital: a capital-structure-weighted estimate of required returns on debt and equity, under explicit assumptions."],
  ["Yield to maturity", "The discount rate equating a bond's price with contractual cash flows under specified conventions; realized return may differ."],
];
function renderGlossary() {
  $("#glossary-list").innerHTML = glossary.map(([term, definition]) => `<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join("");
}

renderTrackCards();
renderToc();
renderBook();
renderGlossary();
updateProgress();
$("#book-search").addEventListener("input", event => renderBook(event.target.value));
$("#reset-progress").addEventListener("click", () => {
  if (completed.size && window.confirm("Clear all saved topic progress on this device?")) {
    completed.clear();
    renderBook($("#book-search").value);
    updateProgress();
  }
});

if ("IntersectionObserver" in window) {
  const links = new Map([...document.querySelectorAll(".toc-links a")].map(link => [link.hash.slice(1), link]));
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      document.querySelectorAll(".toc-links a.active").forEach(link => link.classList.remove("active"));
      links.get(entry.target.id)?.classList.add("active");
    }
  }, { rootMargin: "-5% 0px -78% 0px" });
  document.querySelectorAll(".topic").forEach(topic => observer.observe(topic));
}
