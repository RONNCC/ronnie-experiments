import {
  EXAMPLE,
  MAX_ROUNDS,
  computeScenario,
  decodeState,
  encodeState,
  formatMoney,
  formatPercent,
  formatShares,
  parseAmount,
  payoutCurve,
  yourExitPayout
} from "./logic.mjs";

document.documentElement.classList.remove("no-js");

const STORAGE_KEY = "startup-comp-calculator:v1";
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const form = $("#calcForm");
const roundsEl = $("#rounds");
let state = loadState();
let lastResult = null;
const invalid = new Set();

/* ------------------------------------------------------------------ *
 * State load and save
 * ------------------------------------------------------------------ */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitize(raw) {
  const base = clone(EXAMPLE);
  if (!raw || typeof raw !== "object") return base;
  const out = { ...base };
  for (const key of Object.keys(base)) {
    if (key === "rounds") continue;
    const v = raw[key];
    if (v === undefined) continue;
    if (typeof base[key] === "number" && Number.isFinite(Number(v))) out[key] = Number(v);
    else if (typeof base[key] === "boolean") out[key] = Boolean(v);
    else if (typeof base[key] === "string" && typeof v === "string") out[key] = v;
  }
  if (!["options", "rsu"].includes(out.grantType)) out.grantType = base.grantType;
  if (!["shares", "percent", "value"].includes(out.grantMode)) out.grantMode = base.grantMode;
  if (!["monthly", "quarterly", "annual"].includes(out.frequency)) out.frequency = base.frequency;
  if (Array.isArray(raw.rounds)) {
    out.rounds = raw.rounds.slice(0, MAX_ROUNDS).map((r, i) => ({
      name: typeof r?.name === "string" ? r.name.slice(0, 40) : `Round ${i + 1}`,
      raise: Number(r?.raise) || 0,
      preMoney: Number(r?.preMoney) || 0,
      poolTopUp: Number(r?.poolTopUp) || 0
    }));
  }
  return out;
}

function loadState() {
  const params = new URLSearchParams(location.search);
  const token = params.get("s");
  if (token) {
    const decoded = decodeState(token);
    if (decoded) return sanitize(decoded);
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return sanitize(JSON.parse(saved));
  } catch {
    /* storage can be blocked; fall through to the example */
  }
  return clone(EXAMPLE);
}

let saveTimer = 0;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, 250);
}

/* ------------------------------------------------------------------ *
 * Input formatting
 * ------------------------------------------------------------------ */

function kindOf(input) {
  if (input.name === "grantAmount") {
    return { shares: "shares", percent: "percent", value: "money" }[state.grantMode];
  }
  return input.dataset.kind || "number";
}

function display(kind, value) {
  if (!Number.isFinite(value)) return "";
  switch (kind) {
    case "money":
      return `$${Math.round(value).toLocaleString("en-US")}`;
    case "price":
      return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    case "shares":
      return Math.round(value).toLocaleString("en-US");
    case "percent":
      return `${trimNumber(value)}%`;
    default:
      return trimNumber(value);
  }
}

function vestPct(fraction) {
  return `${trimNumber(Number((fraction * 100).toFixed(1)))}%`;
}

function trimNumber(value) {
  return String(Number(value.toFixed(6)));
}

/* Per-field rules. Each returns an error message or "". */
const RULES = {
  grantAmount: (v) => (v >= 0 ? (state.grantMode === "percent" && v >= 100 ? "Use a percent below 100." : "") : "Enter zero or more."),
  strike: (v) => (v >= 0 ? "" : "Enter zero or more."),
  vestYears: (v) => (v > 0 && v <= 20 ? "" : "Use between 0 and 20 years."),
  cliffMonths: (v) => (v >= 0 && v <= state.vestYears * 12 ? "" : "The cliff cannot be longer than the vesting period."),
  salary: (v) => (v >= 0 ? "" : "Enter zero or more."),
  fdShares: (v) => (v >= 1 ? "" : "Enter the total share count, at least 1."),
  postMoney: (v) => (v > 0 ? "" : "Enter a valuation above zero."),
  fmv: (v) => (v >= 0 ? "" : "Enter zero or more."),
  raisedToDate: (v) => (v >= 0 ? "" : "Enter zero or more."),
  investorPct: (v) => (v >= 0 && v < 100 ? "" : "Use a percent from 0 to just under 100."),
  exitValue: (v) => (v >= 0 ? "" : "Enter zero or more."),
  yearsToExit: (v) => (v >= 0 && v <= 30 ? "" : "Use between 0 and 30 years."),
  yearsStay: (v) => (v > 0 && v <= 30 ? "" : "Use more than 0 and up to 30 years."),
  marketSalary: (v) => (v >= 0 ? "" : "Enter zero or more."),
  raise: (v) => (v > 0 ? "" : "Enter an amount above zero."),
  preMoney: (v) => (v > 0 ? "" : "Enter a valuation above zero."),
  poolTopUp: (v) => (v >= 0 && v < 50 ? "" : "Use 0 to 49 percent.")
};

function setFieldError(input, message) {
  const field = input.closest(".field");
  let err = field ? $(".field-error", field) : null;
  const key = input.dataset.round != null ? `${input.dataset.round}:${input.dataset.key}` : input.name;
  if (message) {
    invalid.add(key);
    input.setAttribute("aria-invalid", "true");
    if (field && !err) {
      err = document.createElement("span");
      err.className = "field-error";
      err.id = `err-${key.replace(/[^a-z0-9]/gi, "-")}`;
      field.appendChild(err);
    }
    if (err) {
      err.textContent = message;
      input.setAttribute("aria-errormessage", err.id);
    }
  } else {
    invalid.delete(key);
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-errormessage");
    if (err) err.remove();
  }
}

/* ------------------------------------------------------------------ *
 * Populate the form from state
 * ------------------------------------------------------------------ */

function populate() {
  for (const input of $$("input[data-kind], input[name='grantAmount']", form)) {
    if (input.dataset.round != null) continue;
    input.value = display(kindOf(input), state[input.name]);
    setFieldError(input, "");
  }
  form.elements.frequency.value = state.frequency;
  form.elements.prefMultiple.value = String(state.prefMultiple);
  form.elements.participating.checked = !!state.participating;
  $$("input[name='grantType']", form).forEach((r) => (r.checked = r.value === state.grantType));
  $$("input[name='grantMode']", form).forEach((r) => (r.checked = r.value === state.grantMode));
  renderRounds();
  syncGrantUi();
  syncSlider();
}

function syncGrantUi() {
  const labels = {
    shares: ["Number of shares", "Accepts shorthand like 48k."],
    percent: ["Percent of fully diluted shares", "For example 0.25 for a quarter of one percent."],
    value: ["Dollar value of the grant", "Converted to shares at the implied preferred price."]
  };
  const [label, help] = labels[state.grantMode];
  $("#grantAmountLabel").textContent = label;
  $("#grantAmountHelp").textContent = help;
  $$("[data-show='options']").forEach((el) => (el.hidden = state.grantType !== "options"));
}

/* ------------------------------------------------------------------ *
 * Rounds editor
 * ------------------------------------------------------------------ */

function renderRounds() {
  roundsEl.innerHTML = "";
  state.rounds.forEach((round, i) => {
    const row = document.createElement("div");
    row.className = "round";
    row.setAttribute("role", "listitem");
    row.innerHTML = `
      <label class="field"><span class="label">Name</span>
        <input class="input" data-round="${i}" data-key="name" maxlength="40"></label>
      <label class="field"><span class="label">Raise</span>
        <input class="input" data-round="${i}" data-key="raise" data-kind="money" inputmode="decimal"></label>
      <label class="field"><span class="label">Pre money</span>
        <input class="input" data-round="${i}" data-key="preMoney" data-kind="money" inputmode="decimal"></label>
      <label class="field"><span class="label">Pool top up</span>
        <input class="input" data-round="${i}" data-key="poolTopUp" data-kind="percent" inputmode="decimal"></label>
      <button class="icon-btn" type="button" data-remove="${i}" aria-label="Remove ${escapeHtml(round.name || `round ${i + 1}`)}">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      <p class="round-meta caption-5" data-round-meta="${i}"></p>`;
    roundsEl.appendChild(row);
    $("[data-key='name']", row).value = round.name;
    for (const key of ["raise", "preMoney", "poolTopUp"]) {
      const input = $(`[data-key='${key}']`, row);
      input.value = display(input.dataset.kind, round[key]);
    }
  });
  $("#roundsEmpty").hidden = state.rounds.length > 0;
  const add = $("#addRound");
  add.disabled = state.rounds.length >= MAX_ROUNDS;
  add.title = add.disabled ? `Up to ${MAX_ROUNDS} future rounds` : "";
  for (const key of [...invalid]) if (key.includes(":")) invalid.delete(key);
  renderExitOptions();
}

function nextRoundName() {
  const used = new Set(state.rounds.map((r) => r.name));
  const last = state.rounds[state.rounds.length - 1];
  const m = last && /^Series ([A-Y])$/i.exec(last.name);
  let code = m ? m[1].toUpperCase().charCodeAt(0) + 1 : "A".charCodeAt(0);
  while (code <= 90) {
    const name = `Series ${String.fromCharCode(code)}`;
    if (!used.has(name)) return name;
    code += 1;
  }
  return `Round ${state.rounds.length + 1}`;
}

function addRound() {
  if (state.rounds.length >= MAX_ROUNDS) return;
  const prev = state.rounds[state.rounds.length - 1];
  const lastPost = prev ? prev.preMoney + prev.raise : state.postMoney;
  const nextName = state.rounds.length ? nextRoundName() : "Series B";
  state.rounds.push({ name: nextName, raise: Math.round(lastPost * 0.25), preMoney: Math.round(lastPost * 2), poolTopUp: 3 });
  if (state.exitStage === state.rounds.length - 1) state.exitStage = state.rounds.length;
  renderRounds();
  update();
  const inputs = $$(`[data-round='${state.rounds.length - 1}']`, roundsEl);
  if (inputs[0]) inputs[0].focus();
}

function removeRound(i) {
  state.rounds.splice(i, 1);
  if (state.exitStage > state.rounds.length) state.exitStage = state.rounds.length;
  else if (state.exitStage > i) state.exitStage -= 1;
  renderRounds();
  update();
  $("#addRound").focus();
}

function renderExitOptions() {
  const select = $("#exitStage");
  const names = ["Today, with no new rounds", ...state.rounds.map((r, i) => r.name || `Round ${i + 1}`)];
  select.innerHTML = names.map((n, i) => `<option value="${i}">${escapeHtml(n)}</option>`).join("");
  state.exitStage = Math.min(Math.max(0, state.exitStage), state.rounds.length);
  select.value = String(state.exitStage);
}

/* ------------------------------------------------------------------ *
 * Exit slider (log scale, $1M to $10B)
 * ------------------------------------------------------------------ */

const SLIDER_MIN = Math.log(1e6);
const SLIDER_MAX = Math.log(1e10);

function syncSlider() {
  const slider = $("#exitSlider");
  const v = Math.min(Math.max(state.exitValue, 1e6), 1e10);
  slider.value = String(Math.round(((Math.log(v) - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 1000));
  slider.setAttribute("aria-valuetext", formatMoney(state.exitValue));
}

function niceRound(value) {
  const mag = 10 ** Math.floor(Math.log10(value));
  const step = mag / 10;
  return Math.round(value / step) * step;
}

/* ------------------------------------------------------------------ *
 * Event wiring
 * ------------------------------------------------------------------ */

form.addEventListener("input", (event) => {
  const t = event.target;
  if (t.id === "exitSlider") {
    const v = Math.exp(SLIDER_MIN + (Number(t.value) / 1000) * (SLIDER_MAX - SLIDER_MIN));
    state.exitValue = niceRound(v);
    form.elements.exitValue.value = display("money", state.exitValue);
    setFieldError(form.elements.exitValue, "");
    t.setAttribute("aria-valuetext", formatMoney(state.exitValue));
    return update();
  }

  if (t.dataset.round != null) {
    const i = Number(t.dataset.round);
    const key = t.dataset.key;
    if (key === "name") {
      state.rounds[i].name = t.value.trim() || `Round ${i + 1}`;
      renderExitOptionsKeepFocus();
      return update();
    }
    const v = parseAmount(t.value);
    const msg = Number.isNaN(v) ? "Enter a number, like 30m." : RULES[key](v);
    setFieldError(t, msg);
    if (!msg) state.rounds[i][key] = v;
    return update();
  }

  if (t.name === "grantType" || t.name === "grantMode") {
    if (t.name === "grantMode") switchGrantMode(t.value);
    else state.grantType = t.value;
    syncGrantUi();
    return update();
  }

  if (t.name === "frequency" || t.name === "prefMultiple" || t.name === "exitStage") {
    state[t.name] = t.name === "frequency" ? t.value : Number(t.value);
    return update();
  }

  if (t.name === "participating") {
    state.participating = t.checked;
    return update();
  }

  if (t.name && t.name in RULES) {
    const v = parseAmount(t.value);
    const msg = Number.isNaN(v) ? "Enter a number. Shorthand like 1.2m works." : RULES[t.name](v);
    setFieldError(t, msg);
    if (!msg) state[t.name] = v;
    if (t.name === "exitValue" && !msg) syncSlider();
    if (t.name === "vestYears" && !msg) revalidate("cliffMonths");
    return update();
  }
});

form.addEventListener(
  "blur",
  (event) => {
    const t = event.target;
    if (!(t instanceof HTMLInputElement) || t.getAttribute("aria-invalid") === "true") return;
    if (t.dataset.round != null && t.dataset.kind) {
      t.value = display(t.dataset.kind, state.rounds[Number(t.dataset.round)][t.dataset.key]);
    } else if (t.name && t.name in RULES && t.type !== "range") {
      t.value = display(kindOf(t), state[t.name]);
    }
  },
  true
);

roundsEl.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-remove]");
  if (btn) removeRound(Number(btn.dataset.remove));
});

$("#addRound").addEventListener("click", addRound);

$("#resetExample").addEventListener("click", () => {
  state = clone(EXAMPLE);
  invalid.clear();
  history.replaceState(null, "", location.pathname + location.hash);
  populate();
  update();
  status("Example restored.");
});

$("#copyLink").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}?s=${encodeState(state)}`;
  history.replaceState(null, "", `${location.pathname}?s=${encodeState(state)}${location.hash}`);
  try {
    await navigator.clipboard.writeText(url);
    status("Link copied. It holds every input, so share it with care.");
  } catch {
    status("Copy was blocked. The link is now in your address bar.");
  }
});

let statusTimer = 0;
function status(message) {
  const el = $("#actionStatus");
  el.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => (el.textContent = ""), 5000);
}

function revalidate(name) {
  const input = form.elements[name];
  const v = parseAmount(input.value);
  const msg = Number.isNaN(v) ? "Enter a number." : RULES[name](v);
  setFieldError(input, msg);
  if (!msg) state[name] = v;
}

function renderExitOptionsKeepFocus() {
  const select = $("#exitStage");
  const current = select.value;
  renderExitOptions();
  select.value = current;
}

function switchGrantMode(mode) {
  // Keep the same grant when switching units.
  const shares = lastResult ? lastResult.shares : null;
  state.grantMode = mode;
  if (shares != null && Number.isFinite(shares)) {
    if (mode === "shares") state.grantAmount = Math.round(shares);
    else if (mode === "percent") state.grantAmount = Number(((shares / state.fdShares) * 100).toFixed(4));
    else state.grantAmount = Math.round(shares * (state.postMoney / state.fdShares));
  }
  const input = form.elements.grantAmount;
  input.value = display(kindOf(input), state.grantAmount);
  setFieldError(input, "");
}

/* ------------------------------------------------------------------ *
 * Render results
 * ------------------------------------------------------------------ */

let frame = 0;
function update() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(render);
  saveState();
}

function out(name, text) {
  $$(`[data-out='${name}']`).forEach((el) => (el.textContent = text));
}

function render() {
  const resultsEl = $(".results");
  const errorBox = $("#errorBox");
  let r;
  try {
    if (invalid.size) throw new Error("Fix the highlighted fields to update the results. The numbers below use your last valid inputs.");
    r = computeScenario(state);
  } catch (err) {
    resultsEl.classList.add("is-error");
    errorBox.hidden = false;
    errorBox.textContent = humanError(err);
    return;
  }
  resultsEl.classList.remove("is-error");
  errorBox.hidden = true;
  lastResult = r;

  $("#priceReadout").textContent = `Implied preferred price: ${formatMoney(r.todayPrice, { compact: false, cents: true })} per share`;

  out("exitValue", formatMoney(state.exitValue));
  out("miniPayout", formatMoney(r.exit.payout));
  out("payout", formatMoney(r.exit.payout));
  const vestedPct = vestPct(r.vestedAtExit);
  out(
    "payoutSub",
    `${formatMoney(r.perYear)} per year you stay · ${vestedPct} of ${formatShares(r.shares)} shares vested · ${formatMoney(r.exit.perCommonShare, { cents: true })} per common share`
  );
  out("ownershipToday", formatPercent(r.ownershipToday));
  out("sharesLine", `${formatShares(r.shares)} of ${formatShares(state.fdShares)} shares`);
  out("ownershipAtExit", formatPercent(r.ownershipAtExit));
  out("keptLine", r.exitIndex === 0 ? "No new rounds before exit" : `You keep ${formatPercent(r.keptFraction, 1)} of today's stake`);
  out("paperValue", formatMoney(r.paperValuePreferred));
  out(
    "paperLine",
    `At the ${formatMoney(r.todayPrice, { cents: true })} preferred price${r.grantType === "options" ? " minus strike" : ""}. At the 409A: ${formatMoney(r.paperValueFmv)}`
  );
  if (r.grantType === "options") {
    out("costLabel", "Cost to exercise all");
    out("exerciseCost", formatMoney(r.exerciseCostTotal));
    out("costLine", `${formatShares(r.shares)} × ${formatMoney(r.strike, { cents: true })} strike`);
  } else {
    out("costLabel", "Value at the 409A");
    out("exerciseCost", formatMoney(r.shares * state.fmv));
    out("costLine", "RSUs have no purchase price");
  }
  if (r.cashForgone <= 0) {
    out("breakEven", "None needed");
    out("breakEvenLine", "Your salary matches or beats the alternative");
  } else if (r.breakEven == null) {
    out("breakEven", "Not reachable");
    out("breakEvenLine", `No exit covers ${formatMoney(r.cashForgone)} of salary you give up`);
  } else {
    out("breakEven", formatMoney(r.breakEven));
    out("breakEvenLine", `Covers ${formatMoney(r.cashForgone)} of salary you give up`);
  }
  out("annualComp", formatMoney(r.totalAnnualComp));
  out("annualLine", `${formatMoney(state.salary)} salary plus ${formatMoney(r.perYear)} equity`);

  renderNotes(r);
  renderStack(r);
  renderRoundTable(r);
  renderScenarioTable(r);
  renderWaterfall(r);
  renderChart(r);
  renderRoundMeta(r);
}

function humanError(err) {
  const msg = String(err && err.message ? err.message : err);
  if (msg.startsWith("Fix the")) return msg;
  if (msg.includes("leaves nothing")) return `${msg.split(":")[0]}: the raise plus pool top up is the whole company. Lower the raise or raise the pre money.`;
  return `The model could not run: ${msg}. Check the inputs above.`;
}

function renderNotes(r) {
  const notes = [];
  const stage = r.exitStage;
  const w = r.waterfallAtExit;
  if (state.exitValue <= 0) {
    notes.push(["warn", "With a zero exit value, common stock receives nothing."]);
  } else if (w.perCommonShare === 0) {
    notes.push(["warn", `This exit does not clear the ${formatMoney(stage.totalPreference)} preference stack, so common receives nothing.`]);
  } else {
    const held = w.series.filter((s) => !s.converted && s.payout > 0);
    if (held.length && !state.participating) {
      notes.push(["warn", `${held.map((s) => s.name).join(", ")} ${held.length > 1 ? "take their preference" : "takes its preference"} instead of converting, which lowers the value of every common share.`]);
    }
  }
  if (r.grantType === "options" && r.exit.perCommonShare > 0 && r.exit.perCommonShare <= r.strike) {
    notes.push(["warn", `Your options are under water at this exit: ${formatMoney(r.exit.perCommonShare, { cents: true })} per share is below the ${formatMoney(r.strike, { cents: true })} strike.`]);
  }
  if (r.vestedAtExit < 1) {
    const leftOn = state.yearsStay < state.yearsToExit;
    notes.push([
      "info",
      leftOn
        ? `You leave after ${trimNumber(state.yearsStay)} years with ${vestPct(r.vestedAtExit)} vested. Unvested shares return to the pool.`
        : `The exit comes before you are fully vested: ${vestPct(r.vestedAtExit)} vested. This model assumes no acceleration.`
    ]);
  }
  if (r.grantType === "options" && state.yearsStay < state.yearsToExit && r.exerciseCostOnLeaving > 0) {
    const spread = r.spreadOnLeavingAtFmv > 0 ? ` At today's 409A the taxable spread would be ${formatMoney(r.spreadOnLeavingAtFmv)}.` : "";
    notes.push([
      "info",
      `You leave before the exit. Keeping your vested options means paying ${formatMoney(r.exerciseCostOnLeaving)} to exercise within the exercise window.${spread}`
    ]);
  }
  if (r.grantType === "options" && state.fmv > 0 && r.strike < state.fmv) {
    notes.push(["warn", "Your strike is below the 409A value. Strikes are normally set at or above it, so confirm both numbers with the company."]);
  }
  if (state.grantMode === "value" && state.fmv > 0) {
    notes.push([
      "info",
      `Converted at the ${formatMoney(r.todayPrice, { cents: true })} preferred price. If the offer used the 409A value instead, the same dollars buy ${formatShares(state.grantAmount / state.fmv)} shares.`
    ]);
  }
  if (state.participating) {
    notes.push(["info", "Participating preferred: investors take their preference and then share the remainder, so common never catches up to a plain pro rata split."]);
  }
  $("#notes").innerHTML = notes.map(([tone, text]) => `<li data-tone="${tone}">${escapeHtml(text)}</li>`).join("");
}

function renderRoundMeta(r) {
  state.rounds.forEach((round, i) => {
    const el = $(`[data-round-meta='${i}']`);
    const stage = r.stages[i + 1];
    if (!el || !stage) return;
    el.innerHTML = `Post money ${escapeHtml(formatMoney(stage.postMoney))} · price ${escapeHtml(formatMoney(stage.pricePerShare, { cents: true }))} per share · dilutes you <strong>${escapeHtml(formatPercent(stage.dilution, 1))}</strong>`;
  });
}

function renderStack(r) {
  let poolSoFar = 0;
  const rows = r.stages.map((s, idx) => {
    poolSoFar += s.poolAdded;
    const fd = s.fdShares;
    const you = s.yourShares / fd;
    const pool = poolSoFar / fd;
    const otherCommon = Math.max(0, (s.commonShares - s.yourShares - poolSoFar) / fd);
    const segs = [
      `<span class="stack-seg you" style="width:${pct(you)}" title="You: ${formatPercent(you)}"></span>`,
      `<span class="stack-seg common" style="width:${pct(otherCommon)}" title="Founders, employees, and pool today: ${formatPercent(otherCommon)}"></span>`
    ];
    if (pool > 0) segs.push(`<span class="stack-seg pool" style="width:${pct(pool)}" title="Pool top ups: ${formatPercent(pool)}"></span>`);
    s.series.forEach((ser, j) => {
      segs.push(`<span class="stack-seg" style="width:${pct(ser.shares / fd)};background:var(--series-${Math.min(j + 1, 7)})" title="${escapeHtml(ser.name)}: ${formatPercent(ser.shares / fd)}"></span>`);
    });
    return `
      <div class="stack-row">
        <div class="stack-label"><strong>${escapeHtml(s.name)}${idx === r.exitIndex ? " · exit" : ""}</strong><span>${escapeHtml(formatMoney(s.postMoney))} post money</span></div>
        <div class="stack-bar" role="img" aria-label="${escapeHtml(`${s.name}: you ${formatPercent(you)}, investors ${formatPercent(s.preferredShares / fd)}`)}">${segs.join("")}</div>
        <div class="stack-you"><strong>You ${escapeHtml(formatPercent(you))}</strong><span>${escapeHtml(formatMoney(s.yourShares * s.pricePerShare))} at round price</span></div>
      </div>`;
  });
  $("#stackChart").innerHTML = rows.join("");

  const last = r.stages[r.stages.length - 1];
  const legend = [
    `<li><span class="swatch swatch-accent"></span>You</li>`,
    `<li><span class="swatch" style="background:var(--common)"></span>Founders, employees, and pool today</li>`
  ];
  if (r.stages.some((s) => s.poolAdded > 0)) legend.push(`<li><span class="swatch" style="background:#d6d2c6"></span>Pool top ups</li>`);
  last.series.forEach((ser, j) => legend.push(`<li><span class="swatch" style="background:var(--series-${Math.min(j + 1, 7)})"></span>${escapeHtml(ser.name)}</li>`));
  $("#stackLegend").innerHTML = legend.join("");
}

function pct(fraction) {
  return `${Math.max(0, fraction * 100).toFixed(4)}%`;
}

function renderRoundTable(r) {
  $("#roundTable tbody").innerHTML = r.stages
    .map(
      (s, idx) => `
      <tr class="${idx === r.exitIndex ? "is-current" : ""}">
        <td>${escapeHtml(s.name)}${idx === r.exitIndex ? '<span class="tag">exit</span>' : ""}</td>
        <td>${s.raise ? formatMoney(s.raise) : "n/a"}</td>
        <td>${formatMoney(s.postMoney)}</td>
        <td>${formatMoney(s.pricePerShare, { cents: true })}</td>
        <td>${idx === 0 ? "n/a" : formatPercent(s.dilution, 1)}</td>
        <td>${formatPercent(s.ownership)}</td>
        <td>${formatMoney(s.yourShares * s.pricePerShare)}</td>
        <td>${formatMoney(s.totalPreference)}</td>
      </tr>`
    )
    .join("");
}

function renderScenarioTable(r) {
  const rows = r.scenarioRows.map((row) => ({ ...row, label: `${row.multiple}x post money` }));
  rows.push({ label: "Your exit value", exitValue: state.exitValue, ...r.exit, current: true });
  rows.sort((a, b) => a.exitValue - b.exitValue || (a.current ? 1 : -1));
  $("#scenarioTable tbody").innerHTML = rows
    .map(
      (row) => `
      <tr class="${row.current ? "is-current" : ""}">
        <td>${escapeHtml(row.label)}</td>
        <td>${formatMoney(row.exitValue)}</td>
        <td>${formatMoney(row.perCommonShare, { cents: true })}</td>
        <td>${formatMoney(row.payout)}</td>
      </tr>`
    )
    .join("");
}

function renderWaterfall(r) {
  const w = r.waterfallAtExit;
  const rows = w.series.map(
    (s) => `<tr><td>${escapeHtml(s.name)}</td><td>${s.converted ? "Converts to common" : state.participating ? "Preference, then shares" : "Its preference"}</td><td>${formatMoney(s.payout)}</td></tr>`
  );
  rows.push(`<tr><td>All common and pool</td><td>${formatMoney(w.perCommonShare, { cents: true })} per share</td><td>${formatMoney(w.toCommon)}</td></tr>`);
  rows.push(
    `<tr class="is-current"><td>You</td><td>${formatShares(r.vestedShares)} vested${r.grantType === "options" ? " less strike" : ""}</td><td>${formatMoney(r.exit.payout)}</td></tr>`
  );
  $("#waterfallTable tbody").innerHTML = rows.join("");
}

/* ------------------------------------------------------------------ *
 * Payout chart (SVG, log x axis)
 * ------------------------------------------------------------------ */

const chartEl = $("#payoutChart");
let chartCtx = null;

function renderChart(r) {
  const width = Math.max(300, Math.round(chartEl.clientWidth || 800));
  const narrow = width < 560;
  const height = narrow ? 260 : 340;
  const m = { l: narrow ? 48 : 64, r: 16, t: 24, b: 36 };
  const iw = width - m.l - m.r;
  const ih = height - m.t - m.b;

  const stage = r.exitStage;
  const anchors = [stage.postMoney, state.exitValue, r.breakEven, stage.totalPreference].filter((v) => v > 0 && Number.isFinite(v));
  const minExit = Math.max(1e5, Math.min(...anchors) / 4);
  const maxExit = Math.max(minExit * 10, Math.max(...anchors) * 4);
  const args = { stage, vestedShares: r.vestedShares, grantType: r.grantType, strike: r.strike, participating: !!state.participating };
  const pts = payoutCurve({ ...args, minExit, maxExit, points: Math.min(240, Math.max(80, Math.round(iw / 3))) });
  const yMaxRaw = Math.max(pts[pts.length - 1].payout, r.cashForgone * 1.2, 1);
  const yTicks = niceTicks(yMaxRaw, 4);
  const yMax = yTicks[yTicks.length - 1];

  const lx0 = Math.log(minExit);
  const lx1 = Math.log(maxExit);
  const x = (E) => m.l + ((Math.log(E) - lx0) / (lx1 - lx0)) * iw;
  const y = (v) => m.t + ih - (v / yMax) * ih;

  const xTicks = [];
  for (let p = Math.floor(Math.log10(minExit)); p <= Math.ceil(Math.log10(maxExit)); p += 1) {
    for (const mult of narrow ? [1] : [1, 3]) {
      const v = mult * 10 ** p;
      if (v >= minExit && v <= maxExit) xTicks.push(v);
    }
  }

  const line = pts.map((p, k) => `${k ? "L" : "M"}${x(p.exitValue).toFixed(1)},${y(p.payout).toFixed(1)}`).join("");
  const area = `${line}L${x(maxExit).toFixed(1)},${y(0)}L${x(minExit).toFixed(1)},${y(0)}Z`;

  const parts = [];
  parts.push(`<g class="grid">${yTicks.map((t) => `<line x1="${m.l}" x2="${m.l + iw}" y1="${y(t)}" y2="${y(t)}"/>`).join("")}</g>`);
  parts.push(
    `<g class="axis">${yTicks.map((t) => `<text x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${formatMoney(t)}</text>`).join("")}${xTicks
      .map((t) => `<text x="${x(t)}" y="${height - 12}" text-anchor="middle">${formatMoney(t)}</text>`)
      .join("")}</g>`
  );
  parts.push(`<path class="area" d="${area}"/>`);

  if (stage.totalPreference > 0 && stage.totalPreference >= minExit && stage.totalPreference <= maxExit) {
    const px = x(stage.totalPreference);
    parts.push(`<line class="pref" x1="${px}" x2="${px}" y1="${m.t}" y2="${m.t + ih}"/>`);
    parts.push(`<text class="note-label" x="${px + 6}" y="${m.t + 12}">Preferences ${formatMoney(stage.totalPreference)}</text>`);
  }
  if (r.cashForgone > 0) {
    const fy = y(r.cashForgone);
    parts.push(`<line class="forgone" x1="${m.l}" x2="${m.l + iw}" y1="${fy}" y2="${fy}"/>`);
    parts.push(`<text class="note-label" x="${m.l + 6}" y="${fy - 6}">Salary given up ${formatMoney(r.cashForgone)}</text>`);
  }
  parts.push(`<path class="curve" d="${line}"/>`);

  if (state.exitValue >= minExit && state.exitValue <= maxExit) {
    const cx = x(state.exitValue);
    const cy = y(r.exit.payout);
    const anchor = cx > m.l + iw * 0.7 ? "end" : "start";
    const dx = anchor === "end" ? -10 : 10;
    parts.push(`<circle class="marker" cx="${cx}" cy="${cy}" r="6"/>`);
    parts.push(`<text class="marker-label" x="${cx + dx}" y="${cy - 10}" text-anchor="${anchor}">${formatMoney(r.exit.payout)} at ${formatMoney(state.exitValue)}</text>`);
  }

  parts.push(`
    <g class="hover" id="chartHover">
      <line class="hover-line" y1="${m.t}" y2="${m.t + ih}"/>
      <circle class="hover-dot" r="4"/>
      <g class="tip"><rect rx="6" height="40" width="150"/><text class="tip-a tip-strong" x="10" y="17"></text><text class="tip-b" x="10" y="32"></text></g>
    </g>
    <rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>`);

  const desc = `Payout curve from ${formatMoney(minExit)} to ${formatMoney(maxExit)} exit values. At your ${formatMoney(state.exitValue)} exit you receive ${formatMoney(r.exit.payout)}.`;
  chartEl.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeHtml(desc)}">${parts.join("")}</svg>`;
  chartCtx = { x, y, m, iw, ih, lx0, lx1, args, width };
}

function niceTicks(max, count) {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const ticks = [];
  for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(v);
  return ticks;
}

function onChartMove(event) {
  if (!chartCtx) return;
  const svg = $("svg", chartEl);
  const hover = $("#chartHover", chartEl);
  if (!svg || !hover) return;
  const rect = svg.getBoundingClientRect();
  const scale = chartCtx.width / rect.width;
  const px = (event.clientX - rect.left) * scale;
  const { m, iw, lx0, lx1, x, y, args } = chartCtx;
  if (px < m.l || px > m.l + iw) return hover.classList.remove("is-on");
  const E = Math.exp(lx0 + ((px - m.l) / iw) * (lx1 - lx0));
  const p = yourExitPayout({ ...args, exitValue: E }).payout;
  const cx = x(E);
  const cy = y(p);
  $(".hover-line", hover).setAttribute("x1", cx);
  $(".hover-line", hover).setAttribute("x2", cx);
  $(".hover-dot", hover).setAttribute("cx", cx);
  $(".hover-dot", hover).setAttribute("cy", cy);
  const tip = $(".tip", hover);
  const tx = cx + 158 > m.l + iw ? cx - 162 : cx + 12;
  const ty = Math.max(m.t, Math.min(cy - 48, m.t + chartCtx.ih - 40));
  tip.setAttribute("transform", `translate(${tx},${ty})`);
  $(".tip-a", tip).textContent = `You get ${formatMoney(p)}`;
  $(".tip-b", tip).textContent = `at a ${formatMoney(E)} exit`;
  hover.classList.add("is-on");
}

chartEl.addEventListener("pointermove", onChartMove);
chartEl.addEventListener("pointerdown", onChartMove);
chartEl.addEventListener("pointerleave", () => $("#chartHover", chartEl)?.classList.remove("is-on"));

if ("ResizeObserver" in window) {
  let lastWidth = 0;
  new ResizeObserver((entries) => {
    const w = Math.round(entries[0].contentRect.width);
    if (w && Math.abs(w - lastWidth) > 4 && lastResult) {
      lastWidth = w;
      renderChart(lastResult);
    }
  }).observe(chartEl);
}

/* ------------------------------------------------------------------ *
 * Navigation, reveals, tagline
 * ------------------------------------------------------------------ */

function initNavigation() {
  const toggle = $("#navToggle");
  const rail = $("#navRail");
  const links = $$("a", rail);

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close section menu" : "Open section menu");
    rail.setAttribute("data-open", String(open));
    links.forEach((link, i) => (link.style.transitionDelay = open ? `${Math.min(i * 60, 400)}ms` : "0ms"));
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  links.forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  if (!("IntersectionObserver" in window)) return;
  const sections = links.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      const entered = entries.filter((e) => e.isIntersecting);
      if (!entered.length) return;
      const id = entered[entered.length - 1].target.id;
      links.forEach((l) => (l.getAttribute("href") === `#${id}` ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current")));
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

function initMobileSummary() {
  const bar = $("#mobileSummary");
  const results = $("#results");
  if (!bar || !results || !("IntersectionObserver" in window)) return;
  // Shown on narrow screens while the form is on screen and the results card is not.
  const calc = $("#calculator");
  let resultsVisible = false;
  let calcVisible = false;
  const sync = () => bar.setAttribute("data-show", String(calcVisible && !resultsVisible));
  new IntersectionObserver((e) => {
    resultsVisible = e[0].isIntersecting;
    sync();
  }).observe(results);
  new IntersectionObserver((e) => {
    calcVisible = e[0].isIntersecting;
    sync();
  }).observe(calc);
}

function initReveals() {
  const items = $$(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  items.forEach((el) => io.observe(el));
}

function initTagline() {
  const el = $("#tagline");
  if (!el) return;
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="word">${escapeHtml(w)}</span>`).join(" ");
  const spans = $$(".word", el);
  if (prefersReduced || !("IntersectionObserver" in window)) {
    spans.forEach((s) => s.classList.add("is-lit"));
    return;
  }
  // Words light as they cross a line 40% up from the bottom of the viewport.
  // Words on the same line cross together, so they are staggered in order.
  const io = new IntersectionObserver(
    (entries) => {
      const crossing = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      crossing
        .sort((a, b) => spans.indexOf(a) - spans.indexOf(b))
        .forEach((span, k) => {
          span.style.transitionDelay = `${k * 60}ms`;
          span.classList.add("is-lit");
          io.unobserve(span);
        });
    },
    { rootMargin: "0px 0px -40% 0px", threshold: 1 }
  );
  spans.forEach((s) => io.observe(s));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

populate();
render();
initNavigation();
initReveals();
initTagline();
initMobileSummary();
