import { convertUsdKrw, simulatePosition } from "./logic.mjs";

(() => {
  const chapters = [...document.querySelectorAll(".chapter[data-title]")];
  const nav = document.querySelector("#chapter-nav ol");
  const search = document.querySelector("#chapter-search");
  const status = document.createElement("p");
  status.className = "control-note";
  status.setAttribute("aria-live", "polite");
  search?.insertAdjacentElement("afterend", status);

  if (nav && chapters.length) {
    nav.replaceChildren(...chapters.map((chapter, index) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const heading = chapter.querySelector("h2")?.textContent.trim() || chapter.dataset.title;
      link.href = `#${chapter.id}`;
      link.textContent = `${String(index + 1).padStart(2, "0")} · ${heading}`;
      link.dataset.search = `${heading} ${chapter.textContent}`.toLocaleLowerCase();
      item.append(link);
      return item;
    }).concat([nav.querySelector('a[href="#future-topics"]')?.closest("li")].filter(Boolean)));
    const futureLi = nav.querySelector('a[href="#future-topics"]')?.closest("li");
    if (!futureLi) {
      const item = document.createElement("li");
      item.innerHTML = '<a href="#future-topics">Future topics</a>';
      nav.append(item);
    }
    status.textContent = `${chapters.length} chapters · future topics are clearly marked.`;
  }

  search?.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    nav?.querySelectorAll("li").forEach(item => {
      const link = item.querySelector("a");
      const match = !query || (link?.dataset.search || link?.textContent || "").toLocaleLowerCase().includes(query);
      item.hidden = !match;
      if (match) visible++;
    });
    status.textContent = query ? `${visible} matching contents entries.` : `${chapters.length} chapters · future topics are clearly marked.`;
  });

  function setActiveLink() {
    const active = location.hash;
    nav?.querySelectorAll("a").forEach(link => {
      if (link.hash && link.hash === active) link.classList.add("active");
      else link.classList.remove("active");
    });
  }
  window.addEventListener("hashchange", setActiveLink);
  setActiveLink();

  const fxDirection = document.querySelector("#fx-direction");
  const fxUsd = document.querySelector("#fx-usd");
  const fxRate = document.querySelector("#fx-rate");
  const fxResult = document.querySelector("#fx-result");
  const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const fxFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  function updateFx() {
    if (!fxDirection || !fxUsd || !fxRate || !fxResult) return;
    const { usd, rate, krw: won } = convertUsdKrw(fxUsd.value, fxRate.value);
    if (fxDirection.value === "buy-usd") {
      fxResult.textContent = `Buy USD ${fxFormat.format(usd)}; pay KRW ${fxFormat.format(won)}. Quote unit: KRW per USD.`;
    } else {
      fxResult.textContent = `Sell USD ${fxFormat.format(usd)}; receive KRW ${fxFormat.format(won)}. Quote unit: KRW per USD.`;
    }
  }
  [fxDirection, fxUsd, fxRate].forEach(control => control?.addEventListener("input", updateFx));
  [fxDirection, fxUsd, fxRate].forEach(control => control?.addEventListener("change", updateFx));

  const lifecycle = document.querySelector("#lifecycle-step");
  const stageNames = [
    "Credit and authority",
    "Execution",
    "Trade capture",
    "Confirmation and matching",
    "Netting and funding",
    "Value date settlement"
  ];
  const stageNotes = [
    "Limits and authority are checked before agreeing to a new obligation.",
    "The parties agree the instrument, amount, direction, price and value date.",
    "The agreed terms are recorded in each institution's systems.",
    "Both sides compare details and repair any mismatch before payment.",
    "Applicable obligations are netted where permitted and the right currency is funded.",
    "Payment or delivery moves through the agreed account or system and becomes final under its rules."
  ];
  function updateStage() {
    if (!lifecycle) return;
    const index = Number(lifecycle.value) - 1;
    const label = document.querySelector("#lifecycle-label");
    const note = document.querySelector("#stage-note");
    if (label) label.textContent = `${index + 1} · ${stageNames[index]}`;
    if (note) note.textContent = stageNotes[index];
    document.querySelectorAll("#stage-track span").forEach((stage, i) => {
      if (i === index) stage.setAttribute("aria-current", "step");
      else stage.removeAttribute("aria-current");
    });
  }
  lifecycle?.addEventListener("input", updateStage);
  lifecycle?.addEventListener("change", updateStage);

  const notional = document.querySelector("#sim-notional");
  const leverage = document.querySelector("#sim-leverage");
  const gap = document.querySelector("#sim-gap");
  function moneyMillions(value) {
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);
    if (abs === 0) return "$0";
    return `${sign}$${abs.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}m`;
  }
  function updateSimulator() {
    if (!notional || !leverage || !gap) return;
    const result = simulatePosition({
      notionalMillions: notional.value,
      leverage: leverage.value,
      gapPercent: gap.value
    });
    document.querySelector("#notional-out").textContent = moneyMillions(result.notional / 1_000_000);
    document.querySelector("#leverage-out").textContent = `${result.leverage}×`;
    document.querySelector("#gap-out").textContent = `${result.gapPercent}%`;
    document.querySelector("#initial-equity").textContent = moneyMillions(result.initialEquity / 1_000_000);
    document.querySelector("#price-loss").textContent = moneyMillions(result.priceLoss / 1_000_000);
    document.querySelector("#remaining-equity").textContent = moneyMillions(result.equityAfterCosts / 1_000_000);
    document.querySelector("#maintenance-threshold").textContent = moneyMillions(result.maintenance / 1_000_000);
    document.querySelector("#uncovered-loss").textContent = moneyMillions(result.uncoveredDeficit / 1_000_000);
    const state = document.querySelector("#margin-state");
    if (state) {
      state.textContent = result.liquidation
        ? `Maintenance threshold crossed. Modelled margin call before liquidation: ${moneyMillions(result.callToRestoreInitialEquity / 1_000_000)} to restore initial equity. Assumed closeout cost: ${moneyMillions(result.closeoutCost / 1_000_000)}. ${result.uncoveredDeficit > 0 ? `Uncovered deficit after costs: ${moneyMillions(result.uncoveredDeficit / 1_000_000)}.` : "No deficit remains in this simplified arithmetic."}`
        : "Maintenance threshold has not been crossed in this simplified model. No modelled margin call yet.";
    }
  }
  [notional, leverage, gap].forEach(control => control?.addEventListener("input", updateSimulator));
  [notional, leverage, gap].forEach(control => control?.addEventListener("change", updateSimulator));
  updateFx();
  updateStage();
  updateSimulator();
})();

