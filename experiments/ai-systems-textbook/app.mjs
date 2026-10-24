import { PRESETS, calculateCapacity, recommendArchitecture } from "./logic.mjs";

const $ = id => document.getElementById(id);
const design = $("design-controls");
const scenario = $("scenario");
const cost = $("cost-controls");
const costError = $("cost-error");
const costResults = document.querySelector(".cost-results");

function updateDesign() {
  const result = recommendArchitecture({
    scenario: scenario.value,
    effect: $("effect").value,
    risk: $("risk").value,
    path: $("path").value,
    freshness: $("freshness").value,
  });
  $("route-title").textContent = result.title;
  $("route-reason").textContent = result.reason;
  $("route-data").textContent = result.data;
  $("route-gate").textContent = result.gate;
  $("route-test").textContent = result.test;
  $("route-link").href = `#chapter-${result.chapter}`;
}

scenario.addEventListener("change", () => {
  for (const [name, value] of Object.entries(PRESETS[scenario.value])) $(name).value = value;
  updateDesign();
});
design.addEventListener("change", updateDesign);
for (const [name, value] of Object.entries(PRESETS[scenario.value])) $(name).value = value;
updateDesign();

const fieldIds = {
  sessions: "sessions", calls: "calls", peakPercent: "peak", meanSeconds: "seconds",
  inputTokens: "input-tokens", outputTokens: "output-tokens",
  inputPrice: "input-price", outputPrice: "output-price",
  stablePercent: "stable", hitPercent: "hit", cacheFactorPercent: "cache-factor",
};
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
function shortNumber(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return decimal.format(value);
}
function updateCost() {
  const values = Object.fromEntries(Object.entries(fieldIds).map(([name, id]) => [name, Number($(id).value)]));
  // Number("") is zero: a cleared field is invalid, not a zero-cost workload.
  const empty = Object.values(fieldIds).some(id => $(id).value.trim() === "");
  try {
    if (empty || [...cost.querySelectorAll("input")].some(input => !input.checkValidity())) throw new RangeError("Invalid input");
    const result = calculateCapacity(values);
    costError.hidden = true;
    costResults.hidden = false;
    $("day-cost").textContent = currency.format(result.dailyCost);
    $("month-cost").textContent = currency.format(result.monthlyCost);
    $("peak-rps").textContent = result.peakRps.toFixed(2);
    $("concurrency").textContent = result.meanConcurrency.toFixed(1);
    $("input-tpm").textContent = shortNumber(result.inputTPM);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    costError.hidden = false;
    costResults.hidden = true;
  }
}
cost.addEventListener("input", updateCost);
updateCost();

// Search is a progressive enhancement. Without JavaScript the entire book and
// its table of contents remain readable and navigable.
const chapterAnchors = [...document.querySelectorAll('.book-article div[id^="chapter-"]')];
const tocLinks = [...document.querySelectorAll(".toc-link")];
const chapters = chapterAnchors.map((anchor, index) => {
  const title = anchor.nextElementSibling?.textContent?.trim() || `Chapter ${index}`;
  let node = anchor.nextElementSibling;
  const parts = [];
  while (node && node !== chapterAnchors[index + 1]) {
    if (node !== anchor.nextElementSibling && node.tagName === "H1") break;
    parts.push(node.textContent || "");
    node = node.nextElementSibling;
  }
  return { id: anchor.id, title, text: parts.join(" ").replace(/\s+/g, " ").trim() };
});
const search = $("book-search");
const results = $("search-results");
const nav = $("chapter-nav");
search.addEventListener("input", () => {
  const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  results.replaceChildren();
  if (!terms.length) {
    results.hidden = true;
    nav.hidden = false;
    return;
  }
  nav.hidden = true;
  results.hidden = false;
  const hits = chapters
    .map(chapter => ({ ...chapter, lower: chapter.text.toLocaleLowerCase(), titleLower: chapter.title.toLocaleLowerCase() }))
    .filter(chapter => terms.every(term => chapter.lower.includes(term)))
    .sort((a, b) => Number(terms.some(t => b.titleLower.includes(t))) - Number(terms.some(t => a.titleLower.includes(t))))
    .slice(0, 8);
  if (!hits.length) {
    const empty = document.createElement("p");
    empty.textContent = "No matching chapter. Try a broader term.";
    results.append(empty);
  }
  for (const hit of hits) {
    const link = document.createElement("a");
    link.className = "search-hit";
    link.href = `#${hit.id}`;
    const title = document.createElement("strong");
    title.textContent = hit.title;
    const excerpt = document.createElement("span");
    const at = Math.max(0, hit.lower.indexOf(terms[0]) - 55);
    excerpt.textContent = `…${hit.text.slice(at, at + 165)}${at + 165 < hit.text.length ? "…" : ""}`;
    link.append(title, excerpt);
    results.append(link);
  }
});

if ("IntersectionObserver" in window) {
  const byId = new Map(tocLinks.map(link => [link.hash.slice(1), link]));
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        for (const link of tocLinks) link.classList.remove("active");
        byId.get(entry.target.previousElementSibling?.id)?.classList.add("active");
      }
    }
  }, { rootMargin: "-5% 0px -75% 0px" });
  for (const anchor of chapterAnchors) if (anchor.nextElementSibling) observer.observe(anchor.nextElementSibling);
}
const progress = $("read-progress");
function updateProgress() {
  const possible = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${possible > 0 ? Math.min(100, window.scrollY / possible * 100) : 0}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
