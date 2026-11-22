import { computeAnnualCost, formatUsd } from "./logic.mjs";

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

  // --- Insurance cost simulator (Chapter 4) -------------------------------
  const simIds = ["sim-premium", "sim-deductible", "sim-coinsurance", "sim-oopmax", "sim-usage"];
  const sim = Object.fromEntries(simIds.map(id => [id, document.querySelector(`#${id}`)]));
  const simOutputs = {
    "sim-premium": "premium-out",
    "sim-deductible": "deductible-out",
    "sim-coinsurance": "coinsurance-out",
    "sim-oopmax": "oopmax-out",
    "sim-usage": "usage-out"
  };

  function updateSimulator() {
    if (Object.values(sim).some(control => !control)) return;
    for (const [id, outId] of Object.entries(simOutputs)) {
      const out = document.querySelector(`#${outId}`);
      if (out) {
        out.textContent = id === "sim-coinsurance"
          ? `${Number(sim[id].value) || 0}%`
          : formatUsd(Number(sim[id].value) || 0) + (id === "sim-premium" ? " / mo" : id === "sim-usage" ? " / yr" : "");
      }
    }
    const result = computeAnnualCost({
      monthlyPremium: sim["sim-premium"].value,
      deductible: sim["sim-deductible"].value,
      coinsurancePercent: sim["sim-coinsurance"].value,
      outOfPocketMax: sim["sim-oopmax"].value,
      annualAllowed: sim["sim-usage"].value
    });
    const set = (id, value) => { const el = document.querySelector(`#${id}`); if (el) el.textContent = formatUsd(value); };
    set("annual-premium", result.annualPremium);
    set("deductible-paid", result.deductiblePaid);
    set("coinsurance-paid", result.coinsurancePaid);
    set("insurer-paid", result.insurerPaid);
    set("total-oop", result.outOfPocket);
    set("total-year", result.totalYearlyCost);
    const state = document.querySelector("#sim-state");
    if (state) {
      state.textContent = result.outOfPocketMaxApplied
        ? "Out-of-pocket maximum reached: the plan pays 100% of the remaining in-network allowed charges this year."
        : result.deductibleMet
          ? "Deductible met: the plan is sharing coinsurance on allowed charges above the deductible."
          : "Deductible not met: the patient pays allowed charges until the deductible is satisfied.";
    }
  }
  Object.values(sim).forEach(control => control?.addEventListener("input", updateSimulator));
  Object.values(sim).forEach(control => control?.addEventListener("change", updateSimulator));
  updateSimulator();

  // --- Claim journey stepper (Chapter 7) ----------------------------------
  const claimStage = document.querySelector("#claim-stage");
  const stageNames = [
    "Care delivered and coded",
    "Claim sent to the insurer",
    "Insurer adjudicates the claim",
    "EOB and payment sent",
    "Denied claim appealed",
    "Final patient bill"
  ];
  const stageNotes = [
    "The provider documents the visit, then assigns ICD-10 diagnosis codes and CPT procedure codes.",
    "The provider or its billing service sends the claim to the insurer, usually through a clearinghouse.",
    "The insurer checks codes, coverage, network status and cost sharing, then prices the claim at the negotiated allowed amount.",
    "The insurer sends the provider payment (if any) and both sides an Explanation of Benefits (EOB) describing the split.",
    "If the claim is denied, the provider or patient can appeal: first inside the plan, then to an independent external reviewer.",
    "Only now does the provider send the patient a bill for the patient's exact cost-sharing amount — not the original charge."
  ];
  function updateStage() {
    if (!claimStage) return;
    const index = Number(claimStage.value) - 1;
    const label = document.querySelector("#claim-stage-label");
    const note = document.querySelector("#stage-note");
    if (label) label.textContent = `${index + 1} · ${stageNames[index]}`;
    if (note) note.textContent = stageNotes[index];
    document.querySelectorAll("#stage-track span").forEach((stage, i) => {
      if (i === index) stage.setAttribute("aria-current", "step");
      else stage.removeAttribute("aria-current");
    });
  }
  claimStage?.addEventListener("input", updateStage);
  claimStage?.addEventListener("change", updateStage);
  updateStage();

  // --- EOB line decoder (Chapter 7) ---------------------------------------
  // Rows render expanded in the HTML so the page is complete without script;
  // with JavaScript, collapse them here and wire the Decode toggles.
  document.querySelectorAll(".eob-detail").forEach(row => { row.hidden = true; });
  document.querySelectorAll(".eob-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const row = button.closest("tr")?.nextElementSibling;
      if (!row || !row.classList.contains("eob-detail")) return;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      row.hidden = expanded;
    });
  });
})();
