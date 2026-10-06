(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const movements = {
    "heel-raise": {
      index: "01",
      label: "Heel raise",
      muscleCue: "Calf squeeze shown",
      valveCue: "Proximal opens on squeeze · distal on release",
      pumpDuration: 1.25,
      flowDuration: 1.05,
      detail: "The calf contracts in this model. In the body, calf-muscle contraction can compress deep veins; this animation does not measure blood flow.",
      caption: "Heel raise: the modeled squeeze aligns with proximal-gate opening; distal gates close to limit downward reflux.",
      phase: "contract"
    },
    "toe-point": {
      index: "02",
      label: "Toe point",
      muscleCue: "Ankle flexion shown",
      valveCue: "Proximal opens on squeeze · distal on release",
      pumpDuration: 1.6,
      flowDuration: 1.35,
      detail: "The ankle points down with a calf pulse in this illustration. Actual muscle recruitment and venous flow vary with the person and movement.",
      caption: "Toe point: the modeled calf pulse and proximal-gate opening share the same squeeze phase.",
      phase: "contract"
    },
    "ankle-circles": {
      index: "03",
      label: "Ankle circles",
      muscleCue: "Gentle joint motion shown",
      valveCue: "Simplified squeeze / refill",
      pumpDuration: 2.85,
      flowDuration: 1.6,
      detail: "The ankle traces a circle with a mild calf cue. Ankle circles are not assigned a measured venous-flow value here.",
      caption: "Ankle circles: the joint path, calf cue, and schematic valve sequence repeat on one shared loop.",
      phase: "contract"
    },
    walking: {
      index: "04",
      label: "Walking step",
      muscleCue: "Rhythmic calf cue shown",
      valveCue: "Proximal opens on squeeze · distal on release",
      pumpDuration: 0.78,
      flowDuration: 0.62,
      detail: "Walking engages leg muscles and the calf pump. This simplified stride is not a measured gait or a prediction of venous return.",
      caption: "Walking: the calf cue and proximal-gate opening are timed to the same modeled squeeze phase.",
      phase: "contract"
    },
    rest: {
      index: "05",
      label: "Stationary / rest",
      muscleCue: "No active squeeze shown",
      valveCue: "Gates nearly closed",
      pumpDuration: 3.6,
      flowDuration: 3.8,
      detail: "This pose removes the active squeeze cue. Blood continues to circulate at rest; a still animation cannot indicate DVT risk.",
      caption: "Rest: the calf squeeze stops and the gates stay mostly closed; this is a simplified, non-measured view.",
      phase: "relax"
    }
  };

  const movementButtons = [...document.querySelectorAll(".movement-option")];
  const stage = document.getElementById("anatomyStage");
  const motionToggle = document.getElementById("motionToggle");
  const insightToggle = document.getElementById("insightToggle");
  const vesselComparison = document.getElementById("vesselComparison");
  const insightCopy = document.getElementById("insightCopy");
  const mechanismCard = document.getElementById("mechanismCard");
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsPanel = document.getElementById("animationSettings");
  const settingsClose = document.getElementById("settingsClose");
  const speedControl = document.getElementById("speedControl");
  const speedValue = document.getElementById("speedValue");
  const speedReset = document.getElementById("speedReset");
  const DEFAULT_SPEED = 0.85;
  const MIN_SPEED = 0.6;
  const MAX_SPEED = 1.2;
  const SPEED_STORAGE_KEY = "lower-leg-circulation.animation-speed";
  let currentMovement = "heel-raise";
  let motionPaused = false;
  let insightEnabled = true;
  let animationSpeed = DEFAULT_SPEED;

  function svgEl(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  /* Add schematic valve pairs along the vein. Gates nearer the heart (proximal)
     open during the modeled squeeze; lower (distal) gates close, then reopen
     during refill. This simplified sequence is not a patient-specific flow model. */
  function buildVeinValves() {
    const vein = document.getElementById("deepVeinPath");
    const layer = document.getElementById("valveLayer");
    const labelLayer = document.getElementById("valveLabelLayer");
    if (!vein || !layer || typeof vein.getPointAtLength !== "function") return;

    let total;
    try {
      total = vein.getTotalLength();
    } catch (error) {
      return;
    }
    if (!total) return;

    const fracs = [0.14, 0.36, 0.58, 0.8];
    const valves = [];

    fracs.forEach((frac) => {
      const len = total * frac;
      const p = vein.getPointAtLength(len);
      const before = vein.getPointAtLength(Math.max(0, len - 1.5));
      const after = vein.getPointAtLength(Math.min(total, len + 1.5));
      const tx = after.x - before.x;
      const ty = after.y - before.y;
      // Rotate so the valve's local "up" (-y) points along flow, toward the heart.
      const angle = (Math.atan2(tx, -ty) * 180) / Math.PI;
      const valveType = frac >= 0.5 ? "valve-proximal" : "valve-distal";

      const group = svgEl("g", {
        class: `vein-valve ${valveType}`,
        transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})`
      });
      const hingeLeft = svgEl("g", { transform: "translate(-5.8 2.2)" });
      hingeLeft.appendChild(svgEl("path", { class: "valve-leaflet leaflet-left", d: "M0 0C1.6-2.6 3.4-4.6 5.4-5.4" }));
      const hingeRight = svgEl("g", { transform: "translate(5.8 2.2)" });
      hingeRight.appendChild(svgEl("path", { class: "valve-leaflet leaflet-right", d: "M0 0C-1.6-2.6-3.4-4.6-5.4-5.4" }));
      group.append(hingeLeft, hingeRight);
      layer.appendChild(group);
      valves.push({ point: p, group });
    });

    // Highlight a proximal valve so its opening can be compared with the squeeze.
    const focus = valves.find((valve) => valve.group.classList.contains("valve-proximal"));
    if (focus && labelLayer) {
      const { x, y } = focus.point;
      layer.appendChild(svgEl("circle", { class: "valve-focus-ring", cx: x.toFixed(1), cy: y.toFixed(1), r: "13" }));
      const lineY = Math.round(y + 26);
      labelLayer.appendChild(svgEl("path", { class: "label-line", d: `M160 ${lineY}L${(x - 14).toFixed(0)} ${y.toFixed(0)}` }));
      const title = svgEl("text", { x: "40", y: String(lineY - 5) });
      title.textContent = "PROXIMAL VALVE";
      const sub = svgEl("text", { class: "label-small", x: "40", y: String(lineY + 12) });
      sub.textContent = "opens with the calf squeeze";
      labelLayer.append(title, sub);
    }
  }

  /* Blood cells riding the vessels via CSS offset-path, so their speed follows
     --flow-duration for the selected movement (fast when walking, drifting at rest). */
  function buildCorpuscles() {
    const layer = document.getElementById("corpuscleLayer");
    if (!layer || typeof CSS === "undefined" || !CSS.supports) return;
    if (!CSS.supports("offset-path", 'path("M0 0 L10 10")')) return;

    const plans = [
      { id: "deepVeinPath", className: "corpuscle vein-cell", count: 4, radii: [4.2, 3.4, 3.8, 3.1] },
      { id: "arteryPath", className: "corpuscle artery-cell", count: 3, radii: [3.2, 3.8, 2.9] }
    ];

    plans.forEach((plan) => {
      const vessel = document.getElementById(plan.id);
      if (!vessel) return;
      const d = vessel.getAttribute("d");
      if (!d) return;
      for (let i = 0; i < plan.count; i += 1) {
        const cell = svgEl("circle", { class: plan.className, cx: "0", cy: "0", r: String(plan.radii[i % plan.radii.length]) });
        cell.style.offsetPath = `path("${d}")`;
        cell.style.animationDelay = `calc(var(--flow-duration) * ${-(i / plan.count)})`;
        // Static fallback position (e.g. prefers-reduced-motion) spreads cells evenly.
        cell.style.offsetDistance = `${Math.round((i / plan.count) * 100)}%`;
        layer.appendChild(cell);
      }
    });
  }

  function formatSpeed(speed) {
    return `${Number(speed).toFixed(2).replace(/\.?0+$/, "")}×`;
  }

  function readSavedSpeed() {
    try {
      const saved = window.localStorage.getItem(SPEED_STORAGE_KEY);
      const parsed = Number(saved);
      if (saved !== null && Number.isFinite(parsed) && parsed >= MIN_SPEED && parsed <= MAX_SPEED) {
        return parsed;
      }
    } catch (error) {
      // Storage may be unavailable in private browsing; use the default instead.
    }
    return DEFAULT_SPEED;
  }

  function setMovementTiming(movement) {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--pump-duration", `${(movement.pumpDuration / animationSpeed).toFixed(3)}s`);
    rootStyle.setProperty("--flow-duration", `${(movement.flowDuration / animationSpeed).toFixed(3)}s`);
  }

  function updateMovementFeedback(movement) {
    document.getElementById("muscleValue").textContent = movement.muscleCue;
    document.getElementById("flowValue").textContent = movement.valveCue;
    document.getElementById("cycleValue").textContent = `${(movement.pumpDuration / animationSpeed).toFixed(2)} s`;

    const note = document.querySelector("#modelNote p");
    const noteIcon = document.querySelector(".model-note-icon");
    if (movement.phase === "relax") {
      note.textContent = "A still pose cannot tell us a person's DVT risk; real blood continues to circulate at rest.";
      noteIcon.textContent = "i";
    } else {
      note.textContent = "Calf-muscle contraction can assist venous return; this animation does not measure it.";
      noteIcon.textContent = "↗";
    }
  }

  function setAnimationSpeed(value, persist = true) {
    const parsed = Number(value);
    animationSpeed = Number.isFinite(parsed)
      ? Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsed))
      : DEFAULT_SPEED;
    speedControl.value = animationSpeed.toFixed(2);
    speedControl.setAttribute("aria-valuetext", `${formatSpeed(animationSpeed)} of the original animation rate`);
    speedValue.textContent = formatSpeed(animationSpeed);
    document.documentElement.style.setProperty("--animation-duration-scale", String(1 / animationSpeed));

    const movement = movements[currentMovement];
    if (movement) {
      setMovementTiming(movement);
      updateMovementFeedback(movement);
    }

    if (persist) {
      try {
        window.localStorage.setItem(SPEED_STORAGE_KEY, String(animationSpeed));
      } catch (error) {
        // The control still works for this visit if storage is unavailable.
      }
    }
  }

  function setSettingsOpen(open) {
    settingsPanel.hidden = !open;
    settingsToggle.setAttribute("aria-expanded", String(open));
    settingsToggle.setAttribute("aria-label", open ? "Close animation settings" : "Open animation settings");
  }

  function selectMovement(key) {
    const movement = movements[key];
    if (!movement) return;
    currentMovement = key;

    movementButtons.forEach((button) => {
      const isSelected = button.dataset.movement === key;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    // Muscle, vessel, and valve animations share one movement-cycle duration.
    // The speed control scales this cycle without changing the movement's phase.
    setMovementTiming(movement);

    document.getElementById("selectedIndex").textContent = movement.index;
    document.getElementById("selectedIndex").setAttribute("aria-label", `Selected movement ${Number(movement.index)} of 5`);
    document.getElementById("currentMoveLabel").textContent = movement.label;
    document.getElementById("feedbackDetail").textContent = movement.detail;
    document.getElementById("anatomyCaption").textContent = movement.caption;
    stage.dataset.mode = key;
    mechanismCard.dataset.phase = movement.phase;
    document.getElementById("mechanismState").textContent = movement.phase === "relax" ? "PUMP RESTING" : "PUMP ACTIVE";

    updateMovementFeedback(movement);
  }

  function setMotionPaused(paused) {
    motionPaused = paused;
    stage.dataset.paused = String(paused);
    document.body.dataset.motionPaused = String(paused);
    motionToggle.setAttribute("aria-pressed", String(paused));
    motionToggle.setAttribute("aria-label", paused ? "Resume animation" : "Pause animation");
    document.getElementById("motionToggleLabel").textContent = paused ? "Play" : "Pause";
  }

  function setInsightEnabled(enabled) {
    insightEnabled = enabled;
    insightToggle.classList.toggle("is-on", enabled);
    insightToggle.setAttribute("aria-checked", String(enabled));
    insightToggle.setAttribute("aria-label", enabled ? "Hide DVT concept view" : "Show DVT concept view");
    vesselComparison.dataset.enabled = String(enabled);
    vesselComparison.setAttribute("aria-hidden", String(!enabled));
    insightCopy.textContent = enabled
      ? "A DVT is a clot in a deep vein. Reduced movement can be one contributing factor, but many factors affect an individual's risk."
      : "The DVT concept layer is hidden. The movement display remains a simplified teaching model, not a measurement of real blood flow.";
  }

  movementButtons.forEach((button) => {
    button.addEventListener("click", () => selectMovement(button.dataset.movement));
  });

  settingsToggle.addEventListener("click", () => setSettingsOpen(settingsPanel.hidden));
  settingsClose.addEventListener("click", () => {
    setSettingsOpen(false);
    settingsToggle.focus();
  });
  speedControl.addEventListener("input", () => setAnimationSpeed(speedControl.value));
  speedReset.addEventListener("click", () => setAnimationSpeed(DEFAULT_SPEED));
  document.addEventListener("pointerdown", (event) => {
    if (!settingsPanel.hidden && !settingsPanel.contains(event.target) && !settingsToggle.contains(event.target)) {
      setSettingsOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !settingsPanel.hidden) {
      setSettingsOpen(false);
      settingsToggle.focus();
    }
  });

  motionToggle.addEventListener("click", () => setMotionPaused(!motionPaused));
  insightToggle.addEventListener("click", () => setInsightEnabled(!insightEnabled));
  document.getElementById("resetButton").addEventListener("click", () => {
    selectMovement("heel-raise");
    setAnimationSpeed(DEFAULT_SPEED);
    setMotionPaused(false);
    setInsightEnabled(true);
  });

  try {
    buildVeinValves();
    buildCorpuscles();
  } catch (error) {
    /* Decorative enhancement only — the page still works without it. */
  }

  setAnimationSpeed(readSavedSpeed(), false);
  selectMovement(currentMovement);
  setMotionPaused(false);
  setInsightEnabled(true);
})();
