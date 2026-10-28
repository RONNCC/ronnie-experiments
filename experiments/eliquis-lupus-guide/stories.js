"use strict";

// The drawings are teaching cartoons, not measurements or a real patient's data.
const stories = {
  clot: {
    kind: "clot",
    steps: [
      ["A leak appears", "A small cut opens the wall of a blood vessel, a tube that carries blood. Blood starts to escape. The goal is to close the leak, not to block the whole tube."],
      ["Platelets arrive", "Platelets are tiny cell pieces that stick to the damaged spot and to each other. Like a quick patch on a leaking hose, they form an early, fragile plug."],
      ["The relay switches on", "Clotting factors are proteins in the blood. Like runners passing a baton, one activates the next. The relay produces thrombin, a protein that helps make a net."],
      ["Threads make a net", "Thrombin turns a dissolved protein called fibrinogen into fibrin, sticky threads that weave through the platelet plug. The mesh reinforces the patch."],
      ["The patch is secured", "Another factor, XIII, links the fibrin threads together. The stronger clot helps seal the cut while the vessel heals. Too much clotting in the wrong place can block blood flow."],
    ],
  },
  block: {
    kind: "relay",
    steps: [
      ["The baton approaches", "In the clotting relay, several helpers switch on factor X. When X is switched on, its name becomes Xa; the little ‘a’ means activated."],
      ["Xa passes the message", "Factor Xa works with helpers on a fatty surface to make thrombin. Thrombin is the signal that turns fibrinogen into fibrin threads."],
      ["Eliquis blocks Xa", "Eliquis (apixaban) fits into Xa's working site like a removable cap. It can block Xa whether it is free or attached to a clot or its helper team."],
      ["Less net is made", "With less Xa activity, the body makes less thrombin and therefore less fibrin. This slows clot formation; it does not make clotting disappear or dissolve an existing clot."],
    ],
  },
  race: {
    kind: "race",
    steps: [
      ["Two imaginary samples", "A lab puts liquid blood samples into two tubes. This is an invented comparison: one sample has no Eliquis and the other contains Eliquis."],
      ["Start the same test", "The lab adds ingredients that start a clotting test sensitive to factor Xa. Both tubes begin the same recipe; peach dots mark the drug in the second tube."],
      ["One tube sets sooner", "In this cartoon, the sample without the drug forms a fibrin mesh first. In the sample with Eliquis, factor Xa is slowed, so this particular fictional test takes longer."],
      ["Read the right clock", "Different tests react differently. Two general clotting clocks called PT (prothrombin time) and aPTT (activated partial thromboplastin time) may change only slightly or not at all; thrombin time is usually normal. A normal result cannot prove Eliquis is absent."],
    ],
  },
  surface: {
    kind: "surface",
    steps: [
      ["A workbench for clotting", "The lab supplies a small amount of phospholipid, a fatty surface where clotting proteins can meet and work together, like tools on a workbench."],
      ["A protein sits on it", "A blood protein called beta-2 glycoprotein I (β₂GPI) can attach to that surface. It is one of the proteins that these antibodies may recognize."],
      ["Antibodies get in the way", "Lupus anticoagulant antibodies can bind surface-associated proteins and interfere with the workbench. With less usable surface, the test tube can take longer to clot."],
      ["A different story in the body", "In the body these antibodies can activate blood-vessel lining cells, platelets and part of the immune system, and disturb protective surfaces. That can increase clot risk, despite a slow tube test."],
    ],
  },
  tests: {
    kind: "tests",
    steps: [
      ["Screen: the venom shortcut", "The first test, dRVVT, uses a purified ingredient from Russell's viper venom to switch on factor X directly. A small amount of fatty surface makes the test sensitive to interference."],
      ["Screen: another route", "A second test, LA-sensitive aPTT, often called PTT-LA, starts clotting by a different route, commonly using silica and a small amount of fatty surface. Using both gives two independent clues."],
      ["Mix: does normal plasma help?", "The lab mixes equal parts of the sample and normal pooled plasma, the liquid from several healthy donors. If the delay corrects, a missing factor is possible; if it does not, an inhibitor is possible. A weak antibody can be diluted and missed."],
      ["Confirm: add more workbench", "The lab repeats the test with extra phospholipid, the fatty workbench. If the clot time shortens relative to the screen, it supports interference that depends on that surface."],
      ["Remove a drug, if needed", "A blood thinner such as Eliquis can confuse these tests. A validated activated-charcoal adsorbent can act like a filter, capturing some drug from the tube. The lab can then retest and check for remaining drug. It does not remove drug from the body."],
      ["Put the clues together", "A specialist considers both test systems, mixing, confirmation, medicines, and other causes. If appropriate, a repeat at least 12 weeks later helps establish persistence. A lab result alone does not diagnose antiphospholipid syndrome."],
    ],
  },
};

function svgFrame(contents, label) {
  return `<svg viewBox="0 0 520 280" role="img" aria-label="${label}" class="story-svg">
    ${contents}</svg>`;
}
function clotDrawing(step) {
  const platelets = step >= 1 ? `<g class="story-pulse" fill="#e9ba72"><circle cx="225" cy="105" r="9"/><circle cx="245" cy="110" r="10"/><circle cx="265" cy="105" r="9"/><circle cx="235" cy="95" r="8"/><circle cx="255" cy="94" r="8"/></g>` : "";
  const relay = step >= 2 ? `<g class="story-enter"><rect x="75" y="172" width="92" height="35" rx="17" fill="#506958"/><text x="121" y="195">FACTORS</text><path d="M170 190 H215" stroke="#d7e2cb" marker-end="url(#story-arrow)"/><rect x="223" y="172" width="110" height="35" rx="17" fill="#8a5e4b"/><text x="278" y="195">THROMBIN</text></g>` : "";
  const mesh = step >= 3 ? `<g class="story-enter" stroke="#f2d2af" stroke-width="3" fill="none"><path d="M205 93 L225 119 L245 88 L265 119 L285 94 M205 113 L225 88 L245 119 L265 89 L285 113 M205 101 H285 M210 110 H280"/></g>` : "";
  const secured = step >= 4 ? `<text class="story-label" x="355" y="86">XIII LINKS THE NET</text><path d="M377 94 L286 105" stroke="#e2c29f" stroke-width="2"/>` : "";
  return svgFrame(`<defs><marker id="story-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#d7e2cb"/></marker></defs>
    <path d="M30 75 H205 M285 75 H490 M30 145 H490" stroke="#dd9e8a" stroke-width="6" fill="none"/><path d="M30 78 H205 L220 112 H270 L285 78 H490 V142 H30 Z" fill="#9b5c4a" opacity=".6"/>
    <path d="M212 75 L221 95 M278 75 L269 95" stroke="#f2b39a" stroke-width="4"/>
    <text class="story-label" x="85" y="52">BLOOD VESSEL</text><text class="story-label" x="210" y="45">CUT ↓</text>
    ${platelets}${relay}${mesh}${secured}
    <text class="story-label" x="70" y="250">${step === 0 ? "THE LEAK" : step === 1 ? "THE QUICK PATCH" : step === 2 ? "THE RELAY SIGNAL" : step === 3 ? "FIBRIN THREADS" : "THE STABLE CLOT"}</text>`, "A cut in a blood vessel, with the current step shown as a patch, relay signal or mesh.");
}
function relayDrawing(step) {
  const blocked = step >= 2;
  const glow = step === 1 ? 58 : step >= 3 ? 22 : 34;
  return svgFrame(`<defs><marker id="relay-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#a9c3a8"/></marker></defs><path d="M135 138 H151 M240 138 H282 M367 138 H402" stroke="#a9c3a8" stroke-width="3" stroke-dasharray="6 4" marker-end="url(#relay-arrow)"/>
    <circle cx="95" cy="138" r="38" fill="#435c49"/><text x="95" y="143">START</text>
    <circle cx="196" cy="138" r="42" fill="${blocked ? '#606563' : '#b37d62'}" stroke="${blocked ? '#e5c2a9' : '#dfb49b'}" stroke-width="3"/><text x="196" y="143">Xa</text>
    <circle cx="327" cy="138" r="${glow}" fill="#e0a783" opacity=".13"/><circle cx="327" cy="138" r="38" fill="#725343"/><text x="327" y="143">THROMBIN</text>
    <circle cx="444" cy="138" r="36" fill="#455d4b"/><text x="444" y="143">FIBRIN</text>
    ${blocked ? '<g class="story-enter"><rect x="155" y="45" width="83" height="32" rx="16" fill="#edc1a4"/><text x="196" y="66" class="story-badge-label">ELIQUIS</text><path d="M196 78 V94" stroke="#edc1a4" stroke-width="3"/><text x="196" y="120" fill="#f5d0b8">⊘</text></g>' : ''}
    <text class="story-label" x="145" y="230">${step === 0 ? 'THE RELAY STARTS' : step === 1 ? 'Xa HELPS MAKE THROMBIN' : step === 2 ? 'THE MEDICINE BLOCKS Xa' : 'LESS THROMBIN → LESS FIBRIN'}</text>`, "A left-to-right relay from factor Xa to thrombin and fibrin; the medicine blocks Xa.");
}
function tube(x, title, drug, mesh, progress) {
  return `<g transform="translate(${x}, 0)"><text class="story-label" x="0" y="42">${title}</text><path d="M-50 70 V190 Q-50 230 0 230 Q50 230 50 190 V70 Z" fill="#344c3e" stroke="#b5c4ae" stroke-width="3"/><path d="M-46 133 H46 V190 Q46 225 0 225 Q-46 225 -46 190 Z" fill="#af7666" opacity=".55"/>${drug ? '<g fill="#f3c0a1"><circle cx="-25" cy="155" r="5"/><circle cx="10" cy="175" r="5"/><circle cx="27" cy="145" r="5"/></g>' : ''}${mesh ? '<g stroke="#f2d9b9" stroke-width="3"><path d="M-38 166 L35 205 M-38 205 L35 166 M-38 185 H38 M0 155 V215"/></g>' : ''}<rect x="-54" y="246" width="108" height="5" rx="3" fill="#46594b"/><rect x="-54" y="246" width="${progress}" height="5" rx="3" fill="#e2b79a"/></g>`;
}
function raceDrawing(step) {
  return svgFrame(tube(150, "NO MEDICINE", false, step >= 2, [0,25,108,108][step]) + tube(370, "WITH ELIQUIS", true, step >= 3, [0,25,45,108][step]), "Two imaginary test tubes with and without drug; mesh appears at different steps.");
}
function surfaceDrawing(step) {
  return svgFrame(`<path d="M45 210 H475" stroke="#a9c5a4" stroke-width="7" stroke-linecap="round"/><text class="story-label" x="260" y="258">FATTY SURFACE = THE WORKBENCH</text>
    <g fill="#9dbb9a">${[65,100,135,170,205,240,275,310,345,380,415,450].map(x=>`<circle cx="${x}" cy="210" r="6"/>`).join('')}</g>
    ${step >= 1 ? '<g stroke="#dbc18f" stroke-width="7" stroke-linecap="round"><path d="M180 205 Q185 168 211 148 M295 205 Q290 168 265 148"/><circle cx="211" cy="148" r="8" fill="#dbc18f"/><circle cx="265" cy="148" r="8" fill="#dbc18f"/></g><text class="story-label" x="238" y="190">β₂GPI</text>' : ''}
    ${step >= 2 ? '<g class="story-enter" fill="none" stroke="#e9b398" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M238 84 V115 L211 148 M238 115 L265 148"/></g><text class="story-label" x="238" y="60">ANTIBODY</text><path d="M365 100 L402 137 M402 100 L365 137" stroke="#e4ad92" stroke-width="4"/>' : ''}
    <circle class="story-pulse" cx="${step >= 2 ? 375 : 120}" cy="115" r="27" fill="#486b56" stroke="#b5d0ac" stroke-width="2"/><text x="${step >= 2 ? 375 : 120}" y="120">HELPER</text>
    ${step === 3 ? '<text class="story-label" x="365" y="175">IN BODY: CELLS ACTIVATE</text>' : ''}`, "Antibodies attach to proteins on a fatty workbench and can interfere with clotting helpers.");
}
function testsDrawing(step) {
  const labels = ["dRVVT", "PTT-LA", "MIX 1 : 1", "EXTRA SURFACE", "CHARCOAL", "REVIEW CLUES"];
  const sub = ["VENOM → FACTOR X", "ANOTHER START", "ADD NORMAL PLASMA", "MORE FATTY SURFACE", "REMOVE SOME DRUG", "COMPARE THE PATTERN"];
  const left = step === 2 ? "SAMPLE" : step === 3 ? "SCREEN" : step === 4 ? "BEFORE" : "TEST TUBE";
  const right = step === 2 ? "NORMAL PLASMA" : step === 3 ? "CONFIRM" : step === 4 ? "AFTER" : "NEXT CLUE";
  const symbol = step === 2 || step === 3 ? "+" : "→";
  return svgFrame(`<text class="story-label" x="260" y="34">${labels[step]}</text>
    ${tube(155, left, step === 4, false, 0)}
    ${tube(365, right, false, false, 0)}
    <text x="260" y="152" class="story-symbol">${symbol}</text>
    <text class="story-label" x="260" y="275">${sub[step]}</text>
    ${step === 0 || step === 1 ? '<circle cx="155" cy="125" r="18" fill="#d1a289"/><text x="155" y="130">◷</text>' : ''}
    ${step === 3 ? '<circle cx="350" cy="165" r="7" fill="#b4c9aa"/><circle cx="375" cy="185" r="7" fill="#b4c9aa"/>' : ''}
    ${step === 4 ? '<circle cx="260" cy="95" r="22" fill="#303b31" stroke="#b6c0aa"/><text x="260" y="100">●</text>' : ''}`,
    `Simplified laboratory step: ${labels[step]}, ${sub[step]}.`);
}
const drawings = { clot: clotDrawing, relay: relayDrawing, race: raceDrawing, surface: surfaceDrawing, tests: testsDrawing };

function createStory(host) {
  const story = stories[host.dataset.story];
  let index = 0;
  let timer = null;
  host.innerHTML = `
    <div class="story-stage"><div class="story-drawing"></div></div>
    <div class="story-narration">
      <div class="story-counter"></div>
      <div class="story-progress" aria-hidden="true"></div>
      <div class="story-words" aria-live="polite" aria-atomic="true"><h4></h4><p></p></div>
      <div class="story-controls" role="group" aria-label="Story playback controls">
        <button type="button" data-action="back">← Back</button>
        <button type="button" data-action="play">▶ Play</button>
        <button type="button" data-action="pause">Ⅱ Pause</button>
        <button type="button" data-action="next">Next →</button>
      </div>
      <p class="story-help">Play moves to the next step every few seconds. Back and Next let you read at your own pace.</p>
    </div>`;
  const get = (selector) => host.querySelector(selector);
  const buttons = Object.fromEntries([...host.querySelectorAll("[data-action]")].map(button => [button.dataset.action, button]));
  function draw() {
    const [title, narrative] = story.steps[index];
    get(".story-counter").textContent = `STEP ${index + 1} OF ${story.steps.length}`;
    get(".story-progress").innerHTML = story.steps.map((_, i) => `<span class="${i <= index ? "on" : ""}"></span>`).join("");
    get(".story-words h4").textContent = title;
    get(".story-words p").textContent = narrative;
    get(".story-drawing").innerHTML = drawings[story.kind](index);
    buttons.back.disabled = index === 0;
    buttons.next.disabled = index === story.steps.length - 1;
    buttons.pause.disabled = timer === null;
    buttons.play.disabled = timer !== null;
    buttons.play.textContent = index === story.steps.length - 1 ? "↺ Replay" : "▶ Play";
  }
  function pause() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    draw();
  }
  buttons.play.addEventListener("click", () => {
    if (timer !== null) return;
    if (index === story.steps.length - 1) index = 0;
    timer = window.setInterval(() => {
      index += 1;
      if (index >= story.steps.length - 1) {
        index = story.steps.length - 1;
        pause();
      } else draw();
    }, 6000);
    draw();
  });
  buttons.pause.addEventListener("click", pause);
  buttons.back.addEventListener("click", () => { if (index > 0) index--; pause(); });
  buttons.next.addEventListener("click", () => { if (index < story.steps.length - 1) index++; pause(); });
  // Leave the current scene in place when a reader changes chapters.
  host.pauseStory = pause;
  draw();
}
document.querySelectorAll("[data-story]").forEach(createStory);
document.querySelectorAll("[data-tab]").forEach(tab => {
  tab.addEventListener("click", () => document.querySelectorAll("[data-story]").forEach(host => host.pauseStory()));
  tab.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") document.querySelectorAll("[data-story]").forEach(host => host.pauseStory());
  });
});
