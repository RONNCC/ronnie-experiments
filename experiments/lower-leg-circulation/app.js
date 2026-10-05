(() => {
  const movements = {
    "heel-raise": {
      index: "01",
      label: "Heel raise",
      activity: "High",
      activityLevel: 86,
      flow: "Pump-assisted",
      flowLevel: 86,
      detail: "Rising onto the forefoot contracts the calf muscles and can assist venous return.",
      caption: "Calf muscles squeeze deep veins; one-way valves help direct blood upward.",
      phase: "contract"
    },
    "toe-point": {
      index: "02",
      label: "Toe point",
      activity: "Moderate",
      activityLevel: 62,
      flow: "Assisted",
      flowLevel: 69,
      detail: "Ankle flexion engages lower-leg muscles in this simplified pump model.",
      caption: "Ankle movement engages lower-leg muscles; the arrows show venous return toward the heart.",
      phase: "contract"
    },
    "ankle-circles": {
      index: "03",
      label: "Ankle circles",
      activity: "Gentle",
      activityLevel: 54,
      flow: "Moving",
      flowLevel: 64,
      detail: "A gentle ankle movement keeps the lower leg active in the model.",
      caption: "Gentle movement activates the lower leg; the orbit highlights the ankle motion.",
      phase: "contract"
    },
    walking: {
      index: "04",
      label: "Walking step",
      activity: "Rhythmic",
      activityLevel: 96,
      flow: "Rhythmic",
      flowLevel: 96,
      detail: "Alternating calf contractions create a repeating pump action in this illustration.",
      caption: "Alternating muscle contractions are shown as a rhythmic pump action.",
      phase: "contract"
    },
    rest: {
      index: "05",
      label: "Stationary / rest",
      activity: "Relaxed",
      activityLevel: 18,
      flow: "Reduced pump action",
      flowLevel: 28,
      detail: "With the calf relaxed, its pumping contribution is lower in this model.",
      caption: "When the calf is relaxed, the muscle pump contributes less to venous return.",
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

  function setMeter(id, valueId, level, label, description) {
    const bar = document.getElementById(id);
    const value = document.getElementById(valueId);
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

  selectMovement(currentMovement);
  setMotionPaused(false);
  setInsightEnabled(true);
})();
