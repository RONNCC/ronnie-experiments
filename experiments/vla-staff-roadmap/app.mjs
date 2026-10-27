// DOM wiring only. All lab arithmetic lives in logic.mjs and is tested in Node.

import { mixtureWeights, planningTrials, trainingMemory, wilsonInterval } from "./logic.mjs";

const $ = (id) => document.getElementById(id);
const value = (id) => Number($(id)?.value);
const inRange = (number, min, max) => Number.isFinite(number) && number >= min && number <= max;
const fmt = (number, digits = 1) => number.toLocaleString("en-US", {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});
const integer = (number) => Math.round(number).toLocaleString("en-US");
const percent = (number, digits = 1) => `${fmt(number * 100, digits)}%`;

// ---- 01 — idealized training memory --------------------------------------

function renderMemory() {
  const parametersBillions = value("mem-params");
  const gpuCount = value("mem-gpus");
  const gpuMemoryGB = value("mem-gpu-memory");
  const activationGB = value("mem-activation");
  const runtimeGB = value("mem-runtime");
  const scheme = $("mem-scheme").value;
  const usable =
    inRange(parametersBillions, 0.01, 1000) && Number.isInteger(gpuCount) && inRange(gpuCount, 1, 1024) &&
    inRange(gpuMemoryGB, 1, 2048) && inRange(activationGB, 0, 2048) && inRange(runtimeGB, 0, 512) &&
    ["ddp", "fsdp"].includes(scheme);
  $("memory-error").hidden = usable;
  if (!usable) return;

  const result = trainingMemory({ parametersBillions, gpuCount, gpuMemoryGB, activationGB, runtimeGB, scheme });
  $("mem-fit").textContent = result.fits ? "FITS*" : "OVER BUDGET";
  $("mem-static").textContent = `${fmt(result.staticPerRankGB)} GB`;
  $("mem-total").textContent = `${fmt(result.totalPerRankGB)} GB`;
  $("mem-headroom").textContent = `${result.headroomGB >= 0 ? "+" : "−"}${fmt(Math.abs(result.headroomGB))} GB`;
  $("mem-breakdown").textContent = `${fmt(result.weightsGB)} + ${fmt(result.gradientsGB)} + ${fmt(result.optimizerGB)} GB`;
}

// ---- 02 — evaluation uncertainty ------------------------------------------

function renderEvaluation() {
  const successes = value("eval-successes");
  const trials = value("eval-trials");
  const expected = value("eval-expected") / 100;
  const margin = value("eval-margin") / 100;
  const usable =
    Number.isInteger(successes) && Number.isInteger(trials) &&
    inRange(successes, 0, 1_000_000) && inRange(trials, 1, 1_000_000) && successes <= trials &&
    inRange(expected, 0.001, 0.999) && inRange(margin, 0.001, 0.499);
  $("evaluation-error").hidden = usable;
  if (!usable) return;

  const result = wilsonInterval(successes, trials);
  const planned = planningTrials(expected, margin);
  $("eval-rate").textContent = percent(result.observed);
  $("eval-ci").textContent = `${percent(result.lower)} – ${percent(result.upper)}`;
  $("eval-width").textContent = `${fmt((result.upper - result.lower) * 100)} pp`;
  $("eval-plan").textContent = `${integer(planned)} rollouts`;
}

// ---- 03 — mixture temperature ---------------------------------------------

function renderMixture() {
  const sizes = [value("mix-pick"), value("mix-wipe"), value("mix-fold")];
  const alpha = value("mix-alpha");
  const draws = value("mix-draws");
  const usable = sizes.every((size) => inRange(size, 1, 1_000_000_000)) &&
    inRange(alpha, 0, 1) && inRange(draws, 1, 1_000_000_000);
  $("mixture-error").hidden = usable;
  $("mix-alpha-value").textContent = Number.isFinite(alpha) ? alpha.toFixed(2) : "—";
  if (!usable) return;

  const rows = mixtureWeights(sizes, alpha, draws);
  rows.forEach((row, index) => {
    $(`mix-${index}-prob`).textContent = percent(row.probability);
    $(`mix-${index}-draws`).textContent = integer(row.expectedDraws);
    $(`mix-${index}-epochs`).textContent = `${fmt(row.epochs, 2)}×`;
    $(`mix-${index}-relative`).textContent = `${fmt(row.relativeToNatural, 2)}×`;
  });
  $("mix-note").textContent = alpha === 1
    ? "Natural sampling gives each dataset the same expected number of passes, but the largest task dominates each batch. Watch minority-task and minority-embodiment success."
    : alpha === 0
      ? "Equal dataset probability can help coverage, but it heavily repeats the smallest dataset. Check memorization, held-out generalization, and whether repeated demonstrations add useful diversity."
      : "This intermediate temperature shifts probability toward smaller datasets without equalizing them completely. Treat α as a hyperparameter: select it with per-task and per-embodiment holdouts, not training loss alone.";
}

// ---- Full-text chapter search, progress, and TOC highlight -----------------

function buildSearchIndex() {
  return Array.from(document.querySelectorAll("#chapter-nav .toc-link")).map((link) => {
    const id = link.getAttribute("href").slice(1);
    const marker = document.getElementById(id);
    const chunks = [];
    let node = marker?.nextElementSibling;
    while (node && !node.matches('div[id^="chapter-"]')) {
      chunks.push(node.textContent || "");
      node = node.nextElementSibling;
    }
    const title = link.querySelector("span:last-child")?.textContent || link.textContent;
    const number = link.querySelector(".toc-num")?.textContent || "";
    const text = `${title} ${chunks.join(" ")}`.replace(/\s+/g, " ").trim();
    return { link, title, number, text, normalized: text.toLowerCase() };
  });
}

function snippetAround(entry, query) {
  const index = entry.normalized.indexOf(query);
  if (index < 0) return entry.text.slice(0, 150);
  const start = Math.max(0, index - 65);
  const end = Math.min(entry.text.length, index + query.length + 100);
  return `${start > 0 ? "…" : ""}${entry.text.slice(start, end).trim()}${end < entry.text.length ? "…" : ""}`;
}

function renderSearch(query, index) {
  const results = $("search-results");
  const trimmed = query.trim().toLowerCase();
  results.replaceChildren();
  if (!trimmed) {
    results.hidden = true;
    $("chapter-nav").hidden = false;
    return;
  }
  const matches = index.filter((entry) => entry.normalized.includes(trimmed)).slice(0, 12);
  if (!matches.length) {
    const message = document.createElement("p");
    message.textContent = "No chapter text matches that term.";
    results.append(message);
  } else {
    for (const entry of matches) {
      const anchor = document.createElement("a");
      anchor.className = "search-hit";
      anchor.href = entry.link.getAttribute("href");
      const title = document.createElement("strong");
      title.textContent = `${entry.number} ${entry.title}`;
      const snippet = document.createElement("span");
      snippet.textContent = snippetAround(entry, trimmed);
      anchor.append(title, snippet);
      results.append(anchor);
    }
  }
  results.hidden = false;
  $("chapter-nav").hidden = true;
}

function initReadingTools() {
  const searchIndex = buildSearchIndex();
  $("book-search").addEventListener("input", (event) => renderSearch(event.target.value, searchIndex));
  $("book-search").addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.target.value = "";
      renderSearch("", searchIndex);
    }
  });
  $("search-results").addEventListener("click", () => {
    $("book-search").value = "";
    renderSearch("", searchIndex);
  });

  const progress = $("read-progress");
  const article = document.querySelector(".prose");
  const onScroll = () => {
    if (!article) return;
    const start = article.offsetTop;
    const total = article.scrollHeight - window.innerHeight;
    const ratio = total <= 0 ? 0 : Math.min(1, Math.max(0, (window.scrollY - start) / total));
    progress.style.width = `${(ratio * 100).toFixed(2)}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = new Map();
  const markers = Array.from(article?.querySelectorAll('div[id^="chapter-"]') || []);
  document.querySelectorAll("#chapter-nav .toc-link").forEach((link) => {
    const marker = document.getElementById(link.getAttribute("href").slice(1));
    if (marker) links.set(marker, link);
  });
  if (markers.length && links.size && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) {
        const link = links.get(visible[0].target);
        document.querySelectorAll("#chapter-nav .toc-link.active").forEach((active) => active.classList.remove("active"));
        link?.classList.add("active");
      }
    }, { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] });
    markers.forEach((marker) => observer.observe(marker));
  }
}

function init() {
  ["mem-params", "mem-gpus", "mem-gpu-memory", "mem-activation", "mem-runtime"]
    .forEach((id) => $(id).addEventListener("input", renderMemory));
  $("mem-scheme").addEventListener("change", renderMemory);

  ["eval-successes", "eval-trials", "eval-expected", "eval-margin"]
    .forEach((id) => $(id).addEventListener("input", renderEvaluation));

  ["mix-pick", "mix-wipe", "mix-fold", "mix-alpha", "mix-draws"]
    .forEach((id) => $(id).addEventListener("input", renderMixture));

  initReadingTools();
  renderMemory();
  renderEvaluation();
  renderMixture();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
