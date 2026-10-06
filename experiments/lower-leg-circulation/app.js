(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const movements = {
    "heel-raise": {
      index: "01",
      label: "Heel raise",
      activity: "High",
      activityLevel: 86,
      flow: "Pump-assisted",
      flowLevel: 86,
      cadence: 48,
      pumpDuration: "1.25s",
      flowDuration: "1.05s",
      detail: "Rising onto the toes squeezes the calf hard — valves above the squeeze flip open and blood is pushed toward the heart.",
      caption: "Heel raise: strong calf squeeze. Valve chevrons open upward, then snap shut so blood can't fall back.",
      phase: "contract"
    },
    "toe-point": {
      index: "02",
      label: "Toe point",
      activity: "Moderate",
      activityLevel: 62,
      flow: "Assisted",
      flowLevel: 69,
      cadence: 38,
      pumpDuration: "1.6s",
      flowDuration: "1.35s",
      detail: "Pointing the toes pulses the calf — each point opens the one-way valves and steps blood a little higher.",
      caption: "Toe point: the ankle rotates down, the calf pulses, and the valves flip open then shut each cycle.",
      phase: "contract"
    },
    "ankle-circles": {
      index: "03",
      label: "Ankle circles",
      activity: "Gentle",
      activityLevel: 54,
      flow: "Moving",
      flowLevel: 64,
      cadence: 32,
      pumpDuration: "1.9s",
      flowDuration: "1.6s",
      detail: "Slow circles keep the valve cycle turning — gentler pumping, but far better than staying still.",
      caption: "Ankle circles: the orbit shows the joint's path while valves keep cycling at an easy rhythm.",
      phase: "contract"
    },
    walking: {
      index: "04",
      label: "Walking step",
      activity: "Rhythmic",
      activityLevel: 96,
      flow: "Rhythmic",
      flowLevel: 96,
      cadence: 77,
      pumpDuration: "0.78s",
      flowDuration: "0.62s",
      detail: "Heel-to-toe stepping alternates squeeze and refill — the quickest valve rhythm and strongest return in this model.",
      caption: "Walking: the leg swings from the hip, the calf pumps every step, and valves ripple open and shut in sequence.",
      phase: "contract"
    },
    rest: {
      index: "05",
      label: "Stationary / rest",
      activity: "Relaxed",
      activityLevel: 18,
      flow: "Reduced pump action",
      flowLevel: 28,
      cadence: 17,
      pumpDuration: "3.6s",
      flowDuration: "3.8s",
      detail: "With the calf still, the valves idle nearly shut and blood only drifts — prolonged stasis is what raises DVT concern.",
      caption: "At rest: no squeeze, valves barely flutter, and flow slows to a drift. Movement restarts the pump.",
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
  let currentMovement = "heel-raise";
  let motionPaused = false;
  let insightEnabled = true;

  function svgEl(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  /* Place one-way valve leaflets along the deep vein. Each valve is a pair of
     cusps hinged at the vessel wall: they swing open while the calf squeezes
     blood toward the heart, then snap shut to block backflow. Valves alternate
     phase (A/B) so the blood is stepped upward segment by segment. */
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

    fracs.forEach((frac, i) => {
      const len = total * frac;
      const p = vein.getPointAtLength(len);
      const before = vein.getPointAtLength(Math.max(0, len - 1.5));
      const after = vein.getPointAtLength(Math.min(total, len + 1.5));
      const tx = after.x - before.x;
      const ty = after.y - before.y;
      // Rotate so the valve's local "up" (-y) points along flow, toward the heart.
      const angle = (Math.atan2(tx, -ty) * 180) / Math.PI;
      const phase = i % 2 === 1 ? "valve-a" : "valve-b";

      const group = svgEl("g", {
        class: `vein-valve ${phase}`,
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

    // Highlight one valve with a pulsing ring and an explanatory callout.
    const focus = valves[1];
    if (focus && labelLayer) {
      const { x, y } = focus.point;
      layer.appendChild(svgEl("circle", { class: "valve-focus-ring", cx: x.toFixed(1), cy: y.toFixed(1), r: "13" }));
      const lineY = Math.round(y + 26);
      labelLayer.appendChild(svgEl("path", { class: "label-line", d: `M160 ${lineY}L${(x - 14).toFixed(0)} ${y.toFixed(0)}` }));
      const title = svgEl("text", { x: "40", y: String(lineY - 5) });
      title.textContent = "ONE-WAY VALVE";
      const sub = svgEl("text", { class: "label-small", x: "40", y: String(lineY + 12) });
      sub.textContent = "opens toward heart · snaps shut";
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

  function setMeter(id, valueId, level, label, description) {
    const bar = document.getElementById(id);
    const value = document.getElementById(valueId);
    if (!bar || !value) return;
    const meter = bar.parentElement;
    bar.style.width = `${level}%`;
    value.textContent = label;
    meter.setAttribute("aria-valuenow", String(level));
    meter.setAttribute("aria-valuetext", description);
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

    // Every animation (muscles, valves, flow, cues) reads these two variables,
    // so the whole scene speeds up or slows down with the chosen movement.
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--pump-duration", movement.pumpDuration);
    rootStyle.setProperty("--flow-duration", movement.flowDuration);

    document.getElementById("selectedIndex").textContent = movement.index;
    document.getElementById("selectedIndex").setAttribute("aria-label", `Selected movement ${Number(movement.index)} of 5`);
    document.getElementById("currentMoveLabel").textContent = movement.label;
    document.getElementById("feedbackDetail").textContent = movement.detail;
    document.getElementById("anatomyCaption").textContent = movement.caption;
    stage.dataset.mode = key;
    mechanismCard.dataset.phase = movement.phase;
    document.getElementById("mechanismState").textContent = movement.phase === "relax" ? "PUMP RESTING" : "PUMP ACTIVE";

    setMeter("muscleBar", "muscleValue", movement.activityLevel, movement.activity, `${movement.activityLevel} percent in this illustrative model`);
    setMeter("flowBar", "flowValue", movement.flowLevel, movement.flow, `${movement.flowLevel} percent in this illustrative model`);
    const cadenceLevel = Math.min(100, Math.round((movement.cadence / 90) * 100));
    const cadenceLabel = key === "rest" ? `≈${movement.cadence} /min · idle` : `≈${movement.cadence} /min`;
    setMeter("cadenceBar", "cadenceValue", cadenceLevel, cadenceLabel, `About ${movement.cadence} illustrated pump cycles per minute`);
    const cadenceMeter = document.getElementById("cadenceBar") && document.getElementById("cadenceBar").parentElement;
    if (cadenceMeter) cadenceMeter.setAttribute("aria-valuenow", String(movement.cadence));

    const note = document.querySelector("#modelNote p");
    const noteIcon = document.querySelector(".model-note-icon");
    if (key === "rest") {
      note.textContent = "Less calf-pump action in this snapshot. DVT risk depends on many factors—not this animation.";
      noteIcon.textContent = "↓";
    } else {
      note.textContent = "Movement can assist venous return; it does not remove every DVT risk.";
      noteIcon.textContent = "↗";
    }
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

  motionToggle.addEventListener("click", () => setMotionPaused(!motionPaused));
  insightToggle.addEventListener("click", () => setInsightEnabled(!insightEnabled));
  document.getElementById("resetButton").addEventListener("click", () => {
    selectMovement("heel-raise");
    setMotionPaused(false);
    setInsightEnabled(true);
  });

  try {
    buildVeinValves();
    buildCorpuscles();
  } catch (error) {
    /* Decorative enhancement only — the page still works without it. */
  }

  selectMovement(currentMovement);
  setMotionPaused(false);
  setInsightEnabled(true);
})();
