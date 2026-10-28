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
    "At a cut, tissue factor meets factor VIIa. Together they start the relay by switching on factors IX and X.",
    "Warfarin, another blood thinner, reduces the amount of working factor VII the body makes.",
  ],
  xii: [
    "Factor XII",
    "Factor XII can start one of the clotting routes used in laboratory tests.",
    "Having very little factor XII may slow one lab test without usually causing bleeding.",
  ],
  xi: [
    "Factor XI",
    "Activated XI turns on factor IX. Thrombin can also turn on XI to help amplify the relay.",
    "A shortage of factor XI can sometimes increase bleeding, especially during a procedure.",
  ],
  ix: [
    "Factor IX",
    "IXa teams up with VIIIa on the fatty workbench to switch on factor X.",
    "Factor IX needs vitamin K to be made properly. A deficiency is called hemophilia B.",
  ],
  viii: [
    "Factor VIII",
    "Activated VIII is a helper that lets IXa work faster at switching on X.",
    "A shortage of VIII is called hemophilia A. Some antibodies against VIII take time to show their effect in a lab test.",
  ],
  x: [
    "Factor X",
    "Two different routes in the relay can switch on factor X, turning it into Xa.",
    "X is a meeting point for the routes and needs vitamin K to be made properly.",
  ],
  xa: [
    "Factor Xa",
    "Xa is a working protein at the junction of the relay. Eliquis can attach to and temporarily block it.",
    "Eliquis blocks Xa whether it is free, on a clot, or on its helper team. It does not need antithrombin, the body’s natural clotting brake.",
  ],
  va: [
    "Factor Va",
    "Va is a helper that makes Xa much faster at turning prothrombin into thrombin.",
    "Va and Xa work together on a fatty surface, with calcium helping them assemble.",
  ],
  complex: [
    "Prothrombinase",
    "This team combines Xa, Va, a fatty surface and calcium. It changes prothrombin into thrombin, the signal that starts the fibrin net.",
    "Eliquis can block Xa even when it is part of this team.",
  ],
  ii: [
    "Prothrombin · factor II",
    "Prothrombin, also called factor II, is the starting material that is turned into thrombin.",
    "Warfarin reduces how much working prothrombin the body makes. Its effect takes time.",
  ],
  thrombin: [
    "Thrombin · factor IIa",
    "Thrombin helps make fibrin threads, turns on XIII, and sends signals that strengthen the relay.",
    "Dabigatran directly blocks thrombin. Heparin works by boosting antithrombin, a natural brake on clotting.",
  ],
  fibrinogen: [
    "Fibrinogen → fibrin",
    "Thrombin cuts fibrinogen, a protein dissolved in blood, into fibrin. Fibrin forms threads that join into a soft net.",
    "A lab test called thrombin time checks this final fibrin-making step.",
  ],
  xiii: [
    "Factor XIII",
    "Thrombin switches on factor XIII, which links the fibrin threads together.",
    "The links strengthen the net, much like knots strengthen a mesh.",
  ],
  fibrin: [
    "Crosslinked fibrin",
    "Factor XIIIa ties nearby fibrin threads together, making a stronger net.",
    "The reinforced net helps the plug stay in place while the cut heals.",
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
    "Apixaban (Eliquis) temporarily blocks Xa, including Xa in its helper team or on a clot. It does not need the body’s natural brake, antithrombin.",
  rivaroxaban:
    "Rivaroxaban is another blood thinner that directly blocks the working site on Xa, not thrombin.",
  heparin:
    "Heparin boosts antithrombin, the body’s natural brake, to slow Xa and thrombin (IIa). LMWH is a shorter form of heparin that acts mainly on Xa.",
  dabigatran:
    "Dabigatran directly blocks thrombin (IIa), a later runner in the relay. It does not need antithrombin.",
  warfarin:
    "Warfarin reduces the body’s production of working factors II, VII, IX and X, and proteins C and S, which depend on vitamin K. It does not block them directly; it takes time to work.",
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
    "Antibodies can link proteins called beta-2 glycoprotein I on the fatty workbench, making it harder for clotting helpers to assemble. The tube can take longer to clot.",
    "PHOSPHOLIPID SURFACE",
  ],
  body: [
    "IN VIVO / PROTHROMBOTIC SIGNALING",
    "A system switched on.",
    "In the body, these antibodies can activate vessel-lining cells, platelets and an immune system called complement. They can also disrupt a protective layer called the annexin A5 shield, contributing to unwanted clots.",
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
    "Two tests start the clotting relay in different ways: dRVVT uses a purified venom ingredient to turn on X directly; PTT-LA starts an earlier route. Both use a small amount of fatty surface. The lab compares times with normal plasma.",
    "dRVVT + LA-SENSITIVE aPTT",
  ],
  mix: [
    "STEP 02 / MIX",
    "Is an inhibitor present?",
    "Mix equal parts of the sample and normal plasma. If that fixes the slow result, a missing factor is possible; if not, a blocker called an inhibitor is possible. Weak antibodies can be diluted and missed. Waiting before retesting can reveal some slow-acting factor VIII blockers.",
    "PLASMA + NORMAL POOLED PLASMA",
  ],
  confirm: [
    "STEP 03 / CONFIRM",
    "Add more phospholipid.",
    "Repeat using more of the fatty workbench. A relatively shorter time supports interference related to that surface. The lab compares the two results using its own reference times and cutoffs.",
    "LOW PL → HIGH PL",
  ],
  interpret: [
    "STEP 04 / INTERPRET",
    "Read the whole pattern.",
    "A matching pattern in one or both test systems can support lupus anticoagulant after other causes are considered. A repeat at least 12 weeks later helps establish persistence for classification of antiphospholipid syndrome (APS).",
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
  if (h > 50) risks.push("possible heparin interference (capacity varies by reagent)");
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
    q: "Adding normal plasma makes a slow clotting test faster. What might that mean?",
    context: "Made-up example: the original test takes 60 seconds; the mixed sample takes 34 seconds, which this fictional lab considers corrected.",
    options: ["The sample may lack a clotting factor", "Lupus anticoagulant is definitely confirmed", "The person definitely has a clot"],
    correct: 0,
    explanation: "Correction suggests a missing factor might be involved. It does not prove a diagnosis, and mixing can dilute a weak antibody so that it is missed."
  },
  {
    q: "Eliquis is in the sample when a lupus anticoagulant test looks positive. What now?",
    context: "Made-up example: the dRVVT ratio is 1.6, and a separate drug-specific test detects Eliquis.",
    options: ["The antibody is definitely present", "The medicine may be confusing the result", "Eliquis cannot affect this test"],
    correct: 1,
    explanation: "Eliquis can create a false alarm in dRVVT. A lab may use a validated drug-removal step or arrange a safe testing plan with the treating team; never stop the medicine on your own."
  },
  {
    q: "A similar antibody pattern appears on two tests 14 weeks apart. What does that show?",
    context: "Made-up example: both samples have a matching pattern and no drug interference is found.",
    options: ["The laboratory pattern persisted", "A diagnosis is certain without other information", "The person must have lupus"],
    correct: 0,
    explanation: "Repeated positivity at least 12 weeks apart supports persistence. Classifying antiphospholipid syndrome also requires an appropriate clinical feature; a lab result alone is not a diagnosis."
  },
  {
    q: "A tube clots faster when extra fatty surface is added. What can this suggest?",
    context: "Made-up example: the screen takes 68 seconds, and the extra-surface test takes 39 seconds. The fictional lab’s comparison meets its criteria and drug interference was excluded.",
    options: ["The delay may depend on the fatty surface", "A missing factor is definitely proven", "The antibody is ruled out"],
    correct: 0,
    explanation: "A relatively shorter time can support an effect that depends on the fatty surface. The whole pattern and the lab’s own cutoffs still matter."
  },
  {
    q: "The mixed sample becomes normal. Does that always rule out an antibody?",
    context: "Made-up example: the first test is slow, the mixed sample corrects, and the extra-surface test is relatively quicker.",
    options: ["Yes, always", "No: mixing can dilute a weak antibody", "Yes, if the extra-surface test is quicker"],
    correct: 1,
    explanation: "Normal plasma can dilute a weak antibody so the mixed test misses it. The lab looks at the unmixed tests and all the other clues too."
  },
  {
    q: "Which collection problems can make a test unreliable?",
    context: "Made-up example: a collection tube is only half full, and the sample still contains many platelets after one spin.",
    options: ["Both the underfilled tube and remaining platelets", "Neither matters", "Only the time on the clock"],
    correct: 0,
    explanation: "The tube needs the right amount of blood relative to its preservative. Remaining platelets can add fatty surface; labs use the proper fill and preparation steps."
  },
  {
    q: "A mixed sample gets slower after it sits. What might the lab investigate?",
    context: "Made-up example: the mix takes 35 seconds immediately and 65 seconds after waiting; no blood thinner is detected.",
    options: ["A blocker of factor VIII that takes time to work", "Proof of Eliquis", "A certain diagnosis of antiphospholipid syndrome"],
    correct: 0,
    explanation: "Some antibodies that block factor VIII work slowly. Waiting and running specific factor tests can help investigate; this pattern alone is not a diagnosis."
  }
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
