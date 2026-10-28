"use strict";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// Chapter navigation remains local to the exhibit.
function selectTab(name) {
  $$(".tab").forEach((button) => {
    const selected = button.dataset.tab === name;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    $(`#panel-${button.dataset.tab}`).hidden = !selected;
  });
}
$$(".tab").forEach((button, index, tabs) => {
  button.addEventListener("click", () => selectTab(button.dataset.tab));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const next =
      tabs[
        (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length
      ];
    selectTab(next.dataset.tab);
    next.focus();
  });
});
selectTab("drug");

// Each clickable SVG factor has a field note and a distinct teaching point.
const factorNotes = {
  tissue: [
    "Tissue factor + VIIa",
    "Tissue factor exposed at an injury binds VIIa and initiates coagulation by activating IX and X.",
    "Warfarin reduces synthesis of functional vitamin K–dependent factor VII.",
  ],
  xii: [
    "Factor XII",
    "Contact activation can initiate the intrinsic laboratory pathway through XIIa.",
    "Severe XII deficiency can prolong the aPTT without the usual bleeding phenotype.",
  ],
  xi: [
    "Factor XI",
    "XIa activates factor IX in the intrinsic pathway; thrombin can also activate XI during amplification.",
    "Factor XI deficiency may cause variable procedure-related bleeding.",
  ],
  ix: [
    "Factor IX",
    "IXa joins its cofactor VIIIa on phospholipid to activate factor X.",
    "IX is vitamin K dependent; its deficiency is hemophilia B.",
  ],
  viii: [
    "Factor VIII",
    "Activated VIII is a cofactor for IXa in the intrinsic tenase complex.",
    "Factor VIII deficiency is hemophilia A; some acquired VIII inhibitors are time dependent.",
  ],
  x: [
    "Factor X",
    "Factor X is activated by both extrinsic and intrinsic tenase complexes to form Xa.",
    "Factor X is vitamin K dependent and sits at the junction of the pathways.",
  ],
  xa: [
    "Factor Xa",
    "Xa is the common-pathway enzyme targeted directly and reversibly by apixaban.",
    "Apixaban inhibits free Xa, clot-bound Xa, and Xa in prothrombinase without antithrombin.",
  ],
  va: [
    "Factor Va",
    "Va is a cofactor that greatly accelerates Xa-mediated conversion of prothrombin to thrombin.",
    "Va is assembled with Xa on a phospholipid surface in the presence of calcium.",
  ],
  complex: [
    "Prothrombinase",
    "Xa and Va assemble with phospholipid and calcium to efficiently convert prothrombin to thrombin.",
    "Apixaban can inhibit Xa within this complex, not just free Xa.",
  ],
  ii: [
    "Prothrombin · factor II",
    "Prothrombin is the vitamin K–dependent precursor of thrombin.",
    "Warfarin lowers production of functional prothrombin; the effect is delayed by factor turnover.",
  ],
  thrombin: [
    "Thrombin · factor IIa",
    "Thrombin drives fibrin formation, activates factor XIII, and amplifies coagulation through feedback.",
    "Dabigatran directly inhibits thrombin; heparin enhances antithrombin-mediated inhibition.",
  ],
  fibrinogen: [
    "Fibrinogen → fibrin",
    "Thrombin cleaves soluble fibrinogen to form fibrin monomers, which polymerize into a soft clot.",
    "A thrombin time probes the conversion of fibrinogen to fibrin, downstream of Xa.",
  ],
  xiii: [
    "Factor XIII",
    "Thrombin activates factor XIII, which covalently crosslinks fibrin strands.",
    "Crosslinking strengthens and stabilizes the fibrin network.",
  ],
  fibrin: [
    "Crosslinked fibrin",
    "Factor XIIIa stabilizes the fibrin mesh by crosslinking adjacent fibrin molecules.",
    "The mature network supports a durable hemostatic plug.",
  ],
};
function showFactor(factor) {
  $$(".factor").forEach((node) =>
    node.classList.toggle("factor-selected", node === factor),
  );
  const [title, description, insight] = factorNotes[factor.dataset.factor];
  $("#node-title").textContent = title;
  $("#node-description").textContent = description;
  $("#node-insight").textContent = insight;
}
$$(".factor").forEach((factor) => {
  factor.addEventListener("click", () => showFactor(factor));
  factor.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showFactor(factor);
    }
  });
});
const drugNotes = {
  none: "No anticoagulant selected. Click any factor in the map to inspect its role.",
  apixaban:
    "Apixaban directly and reversibly inhibits free, clot-bound and prothrombinase-bound Xa. No antithrombin is required.",
  rivaroxaban:
    "Rivaroxaban is another direct Xa inhibitor. It acts at the Xa active site, not directly on thrombin.",
  heparin:
    "Heparin accelerates antithrombin inhibition of Xa and IIa; LMWH acts predominantly on Xa. The targets shown depend on antithrombin.",
  dabigatran:
    "Dabigatran directly inhibits thrombin (IIa), downstream of Xa. It does not require antithrombin.",
  warfarin:
    "Warfarin reduces synthesis of functional vitamin K–dependent II, VII, IX and X, and proteins C and S. It does not directly block these enzymes; its effect develops over time.",
};
function selectDrug(drug) {
  $$(".drug-choice").forEach((button) => {
    const selected = button.dataset.drug === drug;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $$(".factor").forEach((factor) => {
    const targets = (factor.dataset.target || "").split(" ");
    factor.classList.toggle(
      "drug-target",
      drug !== "none" && targets.includes(drug),
    );
  });
  const on = drug === "apixaban";
  $("#drug-toggle").setAttribute("aria-pressed", String(on));
  $("#drug-state").textContent = on ? "ON" : "OFF";
  $(".cascade-card").classList.toggle("drug-on", on);
  $("#cascade-svg").classList.toggle("reduced-burst", drug !== "none");
  $("#cascade-svg").classList.toggle(
    "xa-blocked",
    drug === "apixaban" || drug === "rivaroxaban",
  );
  $("#drug-explanation").textContent = drugNotes[drug];
  $("#cascade-outcome").textContent = on
    ? "Xa is inhibited: less thrombin is generated downstream."
    : drug === "none"
      ? "Select an anticoagulant to explore its targets."
      : "Highlighted factors show the chosen drug's action.";
}
$$(".drug-choice").forEach((button) =>
  button.addEventListener("click", () => selectDrug(button.dataset.drug)),
);
$("#drug-toggle").addEventListener("click", () => {
  selectDrug(
    $("#drug-toggle").getAttribute("aria-pressed") === "true"
      ? "none"
      : "apixaban",
  );
});
selectDrug("none");

// Trace the drawn conceptual curve, keeping the marker on the SVG path.
const curve = $(".curve-wrap svg path[stroke]");
function updateTime() {
  const t = Number($("#time-slider").value),
    x = (t / 24) * 640;
  let low = 0,
    high = curve.getTotalLength();
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    if (curve.getPointAtLength(mid).x < x) low = mid;
    else high = mid;
  }
  const point = curve.getPointAtLength((low + high) / 2);
  $("#curve-line").setAttribute("x1", x);
  $("#curve-line").setAttribute("x2", x);
  $("#curve-dot").setAttribute("cx", point.x);
  $("#curve-dot").setAttribute("cy", point.y);
  const phase =
    (t >= 2.5 && t <= 5) || (t >= 14.5 && t <= 17)
      ? "NEAR PEAK"
      : (t >= 10.5 && t < 12) || t >= 22.5
        ? "NEAR TROUGH"
        : "BETWEEN PEAK & TROUGH";
  $("#time-output").textContent = `${t.toFixed(1)} HOURS · ${phase}`;
}
$("#time-slider").addEventListener("input", updateTime);
updateTime();

function updateLab() {
  const on = $("#lab-toggle").getAttribute("aria-pressed") === "true";
  const n = on ? Number($("#concentration").value) : 0;
  $("#lab-state").textContent = on ? "ON" : "OFF";
  $("#concentration-output").textContent = !on
    ? "Drug off"
    : n < 34
      ? "Low"
      : n < 67
        ? "Moderate"
        : "High";
  $("#concentration").disabled = !on;
  $("#pt-value").textContent = `${(12 + n * 0.015).toFixed(1)} s`;
  $("#aptt-value").textContent = `${(30 + n * 0.04).toFixed(1)} s`;
  $("#tt-value").textContent = "16.0 s";
  $("#anti-value").textContent = n
    ? `${Math.round(n * 2)} ng/mL*`
    : "Not detected*";
  $("#drvvt-value").textContent = `${(1 + n * 0.006).toFixed(2)} ratio*`;
  // Lengths are decorative clocks, not a calibrated assay response curve.
  const widths = {
    "pt-value": 25 + n * 0.14,
    "aptt-value": 36 + n * 0.12,
    "tt-value": 32,
    "anti-value": n,
    "drvvt-value": 30 + n * 0.3,
  };
  Object.entries(widths).forEach(([id, width]) =>
    $(`#${id}`).style.setProperty("--timer-width", `${width}%`),
  );
}
$("#lab-toggle").addEventListener("click", (event) => {
  const b = event.currentTarget;
  b.setAttribute(
    "aria-pressed",
    String(b.getAttribute("aria-pressed") !== "true"),
  );
  updateLab();
});
$("#concentration").addEventListener("input", updateLab);
updateLab();

const mechanisms = {
  tube: [
    "IN VITRO / ASSAY INTERFERENCE",
    "A competition for surface.",
    "Antibodies can bridge β₂-glycoprotein I on phospholipid surfaces, interfering with the phospholipid-dependent assembly of clotting factors and prolonging the test.",
    "PHOSPHOLIPID SURFACE",
  ],
  body: [
    "IN VIVO / PROTHROMBOTIC SIGNALING",
    "A system switched on.",
    "Antiphospholipid antibodies can promote endothelial, platelet and complement activation and disrupt the protective annexin A5 shield, contributing to thrombosis.",
    "ACTIVATED CELL SURFACE",
  ],
};
$$("[data-mechanism]").forEach((button) =>
  button.addEventListener("click", () => {
    $$("[data-mechanism]").forEach((b) =>
      b.classList.toggle("selected", b === button),
    );
    const [kicker, title, text, label] = mechanisms[button.dataset.mechanism];
    $("#mechanism-kicker").textContent = kicker;
    $("#mechanism-title").textContent = title;
    $("#mechanism-text").textContent = text;
    $("#mechanism-label").textContent = label;
    $("#mechanism-art").classList.toggle(
      "body-view",
      button.dataset.mechanism === "body",
    );
  }),
);
const steps = {
  screen: [
    "STEP 01 / SCREEN",
    "Start with two principles.",
    "Use dRVVT and an LA-sensitive aPTT (often silica-based, low phospholipid; PTT-LA). Russell’s viper venom activates factor X directly; a low-phospholipid dRVVT screen is expressed as a ratio to normal plasma.",
    "dRVVT + LA-SENSITIVE aPTT",
  ],
  mix: [
    "STEP 02 / MIX",
    "Is an inhibitor present?",
    "Mix patient plasma 1:1 with normal pooled plasma. Correction suggests factor deficiency; failure to correct supports an inhibitor. Weak LA may be diluted out. Incubation matters for time-dependent inhibitors such as some factor VIII inhibitors.",
    "PLASMA + NORMAL POOLED PLASMA",
  ],
  confirm: [
    "STEP 03 / CONFIRM",
    "Add more phospholipid.",
    "Repeat with high phospholipid. A shortened clotting time relative to the low-phospholipid screen supports phospholipid dependence; laboratories use normalized screen/confirm ratios and validated cutoffs.",
    "LOW PL → HIGH PL",
  ],
  interpret: [
    "STEP 04 / INTERPRET",
    "Read the whole pattern.",
    "A positive result in one or both test systems can support LA when the screen, mixing and confirmation pattern is consistent and interference is excluded. Repeat at least 12 weeks later to establish persistence for APS classification.",
    "INTERPRET IN CONTEXT",
  ],
};
$$("[data-step]").forEach((button) =>
  button.addEventListener("click", () => {
    $$("[data-step]").forEach((b) =>
      b.classList.toggle("selected", b === button),
    );
    const [kicker, title, text, label] = steps[button.dataset.step];
    $("#step-kicker").textContent = kicker;
    $("#step-title").textContent = title;
    $("#step-text").textContent = text;
    $("#step-visual-label").textContent = label;
    $("#step-visual").dataset.current = button.dataset.step;
  }),
);
// The workbench shows a common normalized screen/confirm calculation.
// It deliberately has no diagnostic threshold: cutoffs are reagent and lab specific.
const ratioIds = [
  "screen-patient",
  "screen-normal",
  "confirm-patient",
  "confirm-normal",
];
function updateRatio() {
  const values = Object.fromEntries(
    ratioIds.map((id) => {
      const value = Number($(`#${id}`).value);
      $(`#${id}-out`).textContent = `${value} s`;
      return [id, value];
    }),
  );
  const sp = values["screen-patient"];
  const sn = values["screen-normal"];
  const cp = values["confirm-patient"];
  const cn = values["confirm-normal"];
  const screenRatio = sp / sn;
  const confirmRatio = cp / cn;
  const normalized = screenRatio / confirmRatio;
  $("#ratio-result").textContent = normalized.toFixed(2);
  $("#ratio-equation").textContent =
    `(${sp} / ${sn}) ÷ (${cp} / ${cn}) = ${screenRatio.toFixed(2)} ÷ ${confirmRatio.toFixed(2)}`;
  $("#ratio-explainer").textContent =
    normalized > 1.01
      ? "The screen is longer relative to its normal than the confirm is to its normal."
      : normalized < 0.99
        ? "The confirm is longer relative to its normal than the screen is to its normal."
        : "The screen and confirm are similarly prolonged relative to their respective normals.";
}
ratioIds.forEach((id) => $(`#${id}`).addEventListener("input", updateRatio));
updateRatio();

function updateInterference() {
  const h = Number($("#heparin").value),
    w = Number($("#warfarin").value),
    d = Number($("#doac").value);
  ["heparin", "warfarin", "doac"].forEach(
    (id) => ($(`#${id}-out`).textContent = $(`#${id}`).value),
  );
  const adsorbed = $("#adsorbent").getAttribute("aria-pressed") === "true";
  $("#sample-art").classList.toggle("adsorbed", adsorbed);
  $("#sample-art").classList.toggle("has-doac", d > 0);
  $("#adsorbent").innerHTML = adsorbed
    ? "<span>✓</span> ADSORBENT ADDED <b>↺</b>"
    : "<span>✳</span> ADD CHARCOAL ADSORBENT <b>↗</b>";
  $("#sample-status").textContent = adsorbed
    ? "ADSORBENT APPLIED · RETEST"
    : "NO ADSORBENT ADDED";
  // This is a deliberately fictional visualization, not a pharmacokinetic or clinical model.
  // Other drugs are represented in the warnings, not added to this illustrative number.
  $("#before-ratio").textContent = (1 + d * 0.006).toFixed(2);
  $("#after-ratio").textContent = adsorbed ? (1 + d * 0.0006).toFixed(2) : "—";
  const risks = [];
  if (d > 0 && !adsorbed) risks.push("DOAC");
  if (d > 0 && adsorbed) risks.push("possible residual DOAC");
  if (w > 0) risks.push("warfarin");
  if (h > 50) risks.push("heparin above neutralizer capacity");
  else if (h > 0) risks.push("heparin (reagent dependent)");
  $("#interference-result").textContent = risks.length
    ? `Consider ${risks.join(" + ")} interference`
    : "No drug interference selected";
  $("#interference-explanation").textContent = adsorbed
    ? "Charcoal can reduce DOAC in the sample, not warfarin or heparin. Confirm residual drug and retest."
    : d
      ? "DOAC remains in the sample; the LA result may be unreliable."
      : "This illustration cannot exclude non-drug causes of interference.";
}
$$(".interference-slider").forEach((slider) =>
  slider.addEventListener("input", updateInterference),
);
$("#adsorbent").addEventListener("click", (event) => {
  const b = event.currentTarget;
  b.setAttribute(
    "aria-pressed",
    String(b.getAttribute("aria-pressed") !== "true"),
  );
  updateInterference();
});
updateInterference();
const cases = [
  {
    q: "A prolonged screen corrects in a 1:1 mix. What does that suggest?",
    context:
      "Synthetic example: screen 60 seconds; 1:1 mix 34 seconds. Assume the mix falls within this fictional laboratory’s correction criteria.",
    options: [
      "A factor deficiency is possible",
      "LA is definitely confirmed",
      "The patient has thrombosis",
    ],
    correct: 0,
    explanation:
      "Correction suggests a factor deficiency; it does not establish a diagnosis. Weak inhibitors can be diluted in a mix, so interpret the full workup.",
  },
  {
    q: "A sample is collected while apixaban is present. What is the best interpretation?",
    context:
      "Synthetic example: dRVVT screen ratio 1.6, with a positive screen/confirm pattern. A drug-calibrated anti-Xa assay detects apixaban.",
    options: [
      "Definite persistent LA",
      "Possible drug interference; result is unreliable",
      "Apixaban has no effect on dRVVT",
    ],
    correct: 1,
    explanation:
      "Apixaban can cause false-positive LA patterns. Consider a safe, supervised testing strategy or validated DOAC removal with residual drug assessment.",
  },
  {
    q: "An LA pattern is found on two occasions 14 weeks apart. What does that establish?",
    context:
      "Synthetic example: both samples show a consistent LA pattern without identified drug interference.",
    options: [
      "Persistent laboratory positivity",
      "APS is diagnosed without clinical criteria",
      "The antibody is necessarily caused by lupus",
    ],
    correct: 0,
    explanation:
      "Persistence meets the timing component of the Sydney laboratory criteria. APS classification also requires an appropriate clinical criterion and full assessment.",
  },
  {
    q: "What does a shorter high-phospholipid confirm time suggest?",
    context:
      "Synthetic example: a low-phospholipid screen is 68 s and a high-phospholipid confirm is 39 s; normalized ratios meet this imaginary laboratory's criteria and drug interference has been excluded.",
    options: [
      "Phospholipid dependence is supported",
      "Factor XII deficiency is proven",
      "The result rules out LA",
    ],
    correct: 0,
    explanation:
      "A relatively shorter confirm can support phospholipid dependence. Interpret normalized ratios, the mixing study, other test system and local cutoffs together.",
  },
  {
    q: "A negative mix follows a strongly prolonged screen. Is LA excluded?",
    context:
      "Synthetic example: screen ratio 1.5, but the 1:1 mix corrects according to the fictional lab's cutoff; the confirm is relatively shortened.",
    options: [
      "Yes, a corrected mix always rules LA out",
      "No; mixing may dilute a weak inhibitor",
      "Yes, because the confirm is shortened",
    ],
    correct: 1,
    explanation:
      "Dilution by normal plasma can mask a weak LA. Review the undiluted screen and confirm, and use the laboratory's full interpretive algorithm.",
  },
  {
    q: "Which pre-analytical issue can compromise LA testing?",
    context:
      "Synthetic example: a citrate tube is only half full and residual platelets are present after a single spin.",
    options: [
      "Both the underfilled tube and residual platelets",
      "Neither: sample preparation is irrelevant",
      "Only the time on the clock",
    ],
    correct: 0,
    explanation:
      "Underfilling changes the citrate-to-blood ratio; residual platelets can contribute phospholipid. Follow correct filling and double-spun platelet-poor plasma procedures.",
  },
  {
    q: "A prolonged aPTT becomes more prolonged after incubation of the mix. What deserves consideration?",
    context:
      "Synthetic example: the immediate mix is 35 s and the incubated mix is 65 s; assume no interfering anticoagulant is detected.",
    options: [
      "A time-dependent factor VIII inhibitor",
      "Proof of a DOAC",
      "The pattern establishes persistent APS",
    ],
    correct: 0,
    explanation:
      "Some factor VIII inhibitors are time dependent. An incubated mixing study and specific factor testing can help; the pattern alone is not a diagnosis.",
  },
];
let caseIndex = 0,
  answered = false;
function renderQuiz() {
  const c = cases[caseIndex];
  answered = false;
  $("#quiz-count").textContent =
    `CASE 0${caseIndex + 1} / ${String(cases.length).padStart(2, "0")} · SYNTHETIC`;
  $("#quiz-question").textContent = c.q;
  $("#quiz-context").textContent = c.context;
  $("#quiz-options").replaceChildren(
    ...c.options.map((option, i) => {
      const b = document.createElement("button");
      b.innerHTML = `<span>${String.fromCharCode(65 + i)}</span> ${option}<i>↗</i>`;
      b.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        b.classList.add(i === c.correct ? "correct" : "incorrect");
        $("#quiz-options").children[c.correct].classList.add("correct");
        $("#quiz-feedback").textContent =
          `${i === c.correct ? "Exactly." : "Not quite."} ${c.explanation}`;
        $("#quiz-feedback").classList.add("visible");
      });
      return b;
    }),
  );
  $("#quiz-feedback").textContent = "";
  $("#quiz-feedback").classList.remove("visible");
  $("#quiz-next").innerHTML =
    caseIndex === cases.length - 1
      ? "START AGAIN <span>↺</span>"
      : "NEXT CASE <span>→</span>";
}
$("#quiz-next").addEventListener("click", () => {
  caseIndex = (caseIndex + 1) % cases.length;
  renderQuiz();
});
renderQuiz();
$("#back-top").addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
