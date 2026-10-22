/* ============================================================
   Stage 2 Centerpiece Interactive Visualization:
   Anatomical Brain & Sealed Skull Cutaway + Monro-Kellie Curve
   ============================================================ */

(function () {
  function initBrainSim() {
    const brainCanvas = document.getElementById("brainCanvas");
    const icpCanvas = document.getElementById("icpCanvas");
    if (!brainCanvas || !icpCanvas) return;

    const bCtx = brainCanvas.getContext("2d");
    const pCtx = icpCanvas.getContext("2d");
    const DATA = window.BRAIN_DOAC_DATA;

    const BW = 740;
    const BH = 470;
    const PW = 430;
    const PH = 205;

    const state = {
      drug: "eliquis",      // none | eliquis | xarelto | pradaxa | warfarin
      drinks: 5,            // 0 .. 8
      trigger: "bump",      // micro | bump | bp | fall
      hour: 10,             // 0 .. 24 hours after event
      playingHours: false,
      activeHotspot: 0,     // index 0..6
      hoveredHotspot: -1,
      pulsePhase: 0
    };

    // Physiological & Intracranial Hematoma Volume Model (educational quantitative model)
    function computeBrainMetrics() {
      const d = state.drinks;
      const drug = state.drug;

      // Anticoagulation intensity (Brake #2 blockade)
      const anticoags = {
        none: 0.0,
        eliquis: 0.72,
        xarelto: 0.78,
        pradaxa: 0.74,
        warfarin: 0.86
      };
      let brake2Block = anticoags[drug] ?? 0.72;
      // Heavy binge modestly boosts warfarin / slows hepatic clearance
      if (d >= 4 && drug !== "none") {
        brake2Block = Math.min(0.97, brake2Block + (drug === "warfarin" ? 0.11 : 0.05));
      }

      // Alcohol platelet impairment (Brake #1 loss)
      const brake1Loss = Math.min(0.90, Math.pow(d / 8, 1.25) * 0.88);

      // Dehydration brain sag / bridging vein stretch (0..1)
      const dehydration = Math.min(1, Math.max(0, (d - 1.1) / 5.5));

      // Systolic blood pressure peak (sympathetic surge + rebound)
      const systolicBp = Math.round(118 + Math.pow(d, 1.32) * 3.1);

      // Cerebellar sway & fall risk multiplier
      const swayRisk = +(1 + Math.pow(d, 1.65) * 0.36).toFixed(1);

      // Symptom masking / hangover camouflage (0..100%)
      const maskingPct = Math.min(96, Math.round(d * 13.5));

      // Trigger initial vascular breach severity
      const triggerBase = {
        micro: 0.14 + (systolicBp > 148 ? 0.16 : 0),
        bump: 0.42 + dehydration * 0.34,
        bp: 0.56 + ((systolicBp - 118) / 60) * 0.44,
        fall: 0.82 + dehydration * 0.25
      }[state.trigger];

      // Combined failure to arrest bleeding
      // Crucial biological insight:
      // - brake2Block alone with healthy platelets seals small low-pressure micro-wear well!
      // - brake1Loss + brake2Block together causes dramatic sustained expansion!
      const combinedClotFailure =
        0.06 +
        brake2Block * 0.30 +
        brake1Loss * 0.24 +
        brake1Loss * brake2Block * 0.88;

      // Time evolution curve across 0..24 hours (fast for deep arterial BP bleed, slower sneaky ooze for venous subdural)
      const isDeepArterial = state.trigger === "bp" || state.trigger === "micro";
      const rateK = isDeepArterial ? 0.26 : 0.125;
      const timeFactor = 1 - Math.exp(-rateK * state.hour);

      let maxBleedMl = 72 * triggerBase * combinedClotFailure;
      // Healthy baseline clamps minor tears rapidly under ~2.5 mL
      if (drug === "none" && d <= 1 && state.trigger !== "fall") {
        maxBleedMl = Math.min(maxBleedMl, 1.8);
      } else if (drug !== "none" && d === 0 && state.trigger === "micro") {
        maxBleedMl = 0.6;
      }

      const bleedMl = Math.min(74, Math.max(0, maxBleedMl * timeFactor));

      // Monro-Kellie Intracranial Pressure curve:
      // Baseline ICP ~ 10 mmHg; flat compensation up to ~24 mL as CSF displaces, then exponential climb!
      const icpMmHg = Math.min(
        68,
        9.5 + 0.19 * bleedMl + 2.35 * Math.exp(Math.max(0, bleedMl - 18) / 15.8) - 2.35 * Math.exp(-18 / 15.8)
      );

      // Remaining CSF spare buffer (%)
      const csfBufferPct = Math.max(0, Math.round(100 - (bleedMl / 28) * 100));

      return {
        brake1Loss,
        brake2Block,
        dehydration,
        systolicBp,
        swayRisk,
        maskingPct,
        isDeepArterial,
        bleedMl,
        tbsp: +(bleedMl / 14.8).toFixed(1),
        icpMmHg: +icpMmHg.toFixed(1),
        csfBufferPct
      };
    }

    function updateInspectorAndReadouts(m) {
      // Live readouts above/beside brain
      const drinksOut = document.getElementById("brainDrinksOut");
      if (drinksOut) {
        const bacEst = (state.drinks * 0.024).toFixed(2);
        drinksOut.textContent =
          state.drinks === 0
            ? "0 drinks (0.00%)"
            : `${state.drinks} drink${state.drinks > 1 ? "s" : ""} (~${bacEst}% peak)`;
      }

      const hourOut = document.getElementById("brainHourOut");
      if (hourOut) {
        let phaseLabel = "Right after event";
        if (state.hour >= 2 && state.hour < 7) phaseLabel = "Asleep ('sleeping it off')";
        else if (state.hour >= 7 && state.hour < 14) phaseLabel = "Next morning ('hangover?')";
        else if (state.hour >= 14) phaseLabel = "Next afternoon";
        hourOut.textContent = `Hour ${state.hour} · ${phaseLabel}`;
      }

      const setTxt = (id, txt, color) => {
        const el = document.getElementById(id);
        if (el) {
          el.textContent = txt;
          if (color) el.style.color = color;
        }
      };

      setTxt(
        "bStatBleed",
        `${m.bleedMl.toFixed(1)} mL (${m.tbsp} tbsp)`,
        m.bleedMl > 28 ? "#ff5c6c" : m.bleedMl > 10 ? "#f7c948" : "#3fb950"
      );
      setTxt(
        "bStatCsf",
        `${m.csfBufferPct}% cushion left`,
        m.csfBufferPct === 0 ? "#ff5c6c" : m.csfBufferPct < 45 ? "#f7c948" : "#58a6ff"
      );
      setTxt(
        "bStatIcp",
        `${m.icpMmHg} mmHg`,
        m.icpMmHg > 25 ? "#ff5c6c" : m.icpMmHg > 16 ? "#f7c948" : "#3fb950"
      );
      setTxt(
        "bStatMask",
        `${m.maskingPct}% masked · ${m.swayRisk}× fall risk`,
        m.maskingPct > 45 ? "#ff8b5a" : "#eef4fb"
      );

      // ICP Status Pill
      const pill = document.getElementById("icpZonePill");
      if (pill) {
        if (m.bleedMl < 20) {
          pill.textContent =
            m.bleedMl < 3
              ? "Safe / Sealed"
              : "Silent Cushion Zone (Feels Normal!)";
          pill.style.background = m.bleedMl < 3 ? "rgba(63,185,80,0.18)" : "rgba(88,166,255,0.18)";
          pill.style.color = m.bleedMl < 3 ? "#7ee787" : "#9fd0ff";
        } else if (m.bleedMl < 42) {
          pill.textContent = "Hangover Disguise Zone!";
          pill.style.background = "rgba(255,139,90,0.22)";
          pill.style.color = "#ffb290";
        } else {
          pill.textContent = "CRITICAL SKULL PRESSURE CLIFF";
          pill.style.background = "rgba(255,92,108,0.25)";
          pill.style.color = "#ff8592";
        }
      }

      // Hotspot detail panel
      const hs = DATA.hotspots[state.activeHotspot];
      if (hs) {
        const titleEl = document.getElementById("hsTitle");
        const plainEl = document.getElementById("hsPlain");
        const mixEl = document.getElementById("hsMix");
        const clinEl = document.getElementById("hsClinical");
        const liveStatusEl = document.getElementById("hsLiveStatus");

        if (titleEl) titleEl.textContent = hs.title;
        if (plainEl) plainEl.textContent = hs.plain;
        if (mixEl) mixEl.textContent = hs.whyBadMix;
        if (clinEl) clinEl.innerHTML = `<span class="clinical-tag">Clinical Physiology</span>${hs.clinical}`;

        if (liveStatusEl) {
          let dynamicLine = "";
          if (hs.id === "bridging") {
            dynamicLine =
              state.drinks === 0
                ? "Right now at 0 drinks: Bridging veins are relaxed and slack in full fluid cushion."
                : `Right now at ${state.drinks} drink(s): Brain dehydration stretch is ${Math.round(
                    m.dehydration * 100
                  )}%, and ${Math.round(m.brake1Loss * 100)}% platelet loss keeps venous tears oozing.`;
          } else if (hs.id === "skull") {
            dynamicLine = `Right now at Hour ${state.hour}: ${m.bleedMl.toFixed(
              1
            )} mL (${m.tbsp} tablespoons) inside the fixed skull → ${m.csfBufferPct}% CSF cushion left → Pressure = ${m.icpMmHg} mmHg (normal is 7–15 mmHg).`;
          } else if (hs.id === "deepArterioles") {
            dynamicLine = `Right now: Peak blood pressure is ~${m.systolicBp} mmHg pounding directly on hair-thin deep vessels while clotting protection is down.`;
          } else if (hs.id === "frontal") {
            dynamicLine = `Right now: Warning-sign masking is ~${m.maskingPct}% — headache, drowsiness, or dizziness look deceptively like alcohol.`;
          } else if (hs.id === "hippocampus") {
            dynamicLine =
              state.drinks >= 4
                ? `Right now at ${state.drinks} drinks: Memory recording is strongly disrupted — minor nighttime bumps are easily forgotten by morning!`
                : "Right now: Memory encoding is intact enough to remember if you bumped your head.";
          } else if (hs.id === "pituitary") {
            dynamicLine =
              state.drinks >= 2
                ? `Right now: ADH water-saving hormone is SWITCHED OFF → kidneys dump water → brain fluid cushion shrinks.`
                : "Right now: ADH water valve is working normally.";
          } else {
            dynamicLine = `Right now: Balance sway risk is ${m.swayRisk}× normal, and brainstem pressure load is ${
              m.icpMmHg > 26 ? "ELEVATED — URGENT" : "within safe range"
            }.`;
          }
          liveStatusEl.textContent = dynamicLine;
        }
      }
    }

    function drawBrainCutaway(m) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (brainCanvas.width !== BW * dpr || brainCanvas.height !== BH * dpr) {
        brainCanvas.width = BW * dpr;
        brainCanvas.height = BH * dpr;
      }
      bCtx.save();
      bCtx.scale(dpr, dpr);

      // Deep dark studio backdrop
      const bg = bCtx.createRadialGradient(BW * 0.5, BH * 0.45, 40, BW * 0.5, BH * 0.5, 440);
      bg.addColorStop(0, "#131d2d");
      bg.addColorStop(1, "#070b11");
      bCtx.fillStyle = bg;
      bCtx.fillRect(0, 0, BW, BH);

      const cx = BW * 0.49;
      const cy = BH * 0.51;

      // 1. OUTER RIGID SKULL VAULT (Bone cross-section)
      bCtx.save();
      bCtx.translate(cx, cy);

      // Outer cranial bone shell
      bCtx.beginPath();
      bCtx.ellipse(0, -14, 272, 206, 0, Math.PI * 0.87, Math.PI * 2.13);
      bCtx.lineWidth = 18;
      bCtx.strokeStyle = "#d9d2c5";
      bCtx.lineCap = "round";
      bCtx.stroke();

      // Inner diploe bone texture line
      bCtx.beginPath();
      bCtx.ellipse(0, -14, 272, 206, 0, Math.PI * 0.87, Math.PI * 2.13);
      bCtx.lineWidth = 8;
      bCtx.setLineDash([4, 6]);
      bCtx.strokeStyle = "#9c9180";
      bCtx.stroke();
      bCtx.setLineDash([]);

      // Dura Mater membrane bolted directly inside skull
      bCtx.beginPath();
      bCtx.ellipse(0, -14, 259, 193, 0, Math.PI * 0.88, Math.PI * 2.12);
      bCtx.lineWidth = 3.5;
      bCtx.strokeStyle = "#6e8bb5";
      bCtx.stroke();

      // Superior Sagittal Sinus channel along top arch
      bCtx.beginPath();
      bCtx.ellipse(0, -14, 254, 188, 0, Math.PI * 1.18, Math.PI * 1.82);
      bCtx.lineWidth = 8;
      bCtx.strokeStyle = "#29558f";
      bCtx.stroke();

      // 2. SUBARACHNOID CSF CUSHION LAYER (visibly squeezes thin as bleed grows!)
      const csfThickness = 4 + (m.csfBufferPct / 100) * 14;
      bCtx.beginPath();
      bCtx.ellipse(0, -10, 244, 178, 0, Math.PI * 0.90, Math.PI * 2.10);
      bCtx.lineWidth = csfThickness;
      bCtx.strokeStyle = `rgba(64, 196, 255, ${0.10 + (m.csfBufferPct / 100) * 0.24})`;
      bCtx.stroke();

      // 3. SUBDURAL CRESCENT HEMATOMA (if non-deep trigger & bleedMl > 0.5)
      const sagOffset =
        m.dehydration * 6.5 + (!m.isDeepArterial ? Math.min(26, m.bleedMl * 0.36) : 0);

      if (!m.isDeepArterial && m.bleedMl > 0.4) {
        const crescentThick = Math.min(34, 4 + m.bleedMl * 0.44);
        const span = 0.14 + Math.min(0.34, m.bleedMl * 0.0052);
        bCtx.beginPath();
        bCtx.ellipse(
          0,
          -12,
          246 - crescentThick * 0.35,
          181 - crescentThick * 0.35,
          0,
          Math.PI * (1.48 - span),
          Math.PI * (1.52 + span)
        );
        bCtx.lineWidth = crescentThick;
        bCtx.lineCap = "round";
        bCtx.strokeStyle =
          m.bleedMl < 3.5 ? "rgba(247, 201, 72, 0.72)" : "rgba(225, 42, 67, 0.86)";
        bCtx.stroke();
      }

      // 4. BRIDGING VEINS STRETCHING ACROSS SUBDURAL GAP!
      const veinAngles = [-0.68, -0.42, -0.16, 0.08, 0.34, 0.58];
      veinAngles.forEach((off, idx) => {
        const ang = -Math.PI / 2 + off;
        const outerX = Math.cos(ang) * 252;
        const outerY = -14 + Math.sin(ang) * 186;
        const innerX = Math.cos(ang) * 228;
        const innerY = -6 + sagOffset + Math.sin(ang) * 162;

        const snapped = !m.isDeepArterial && idx === 3 && state.trigger !== "micro";
        bCtx.lineWidth = Math.max(1.5, 3.4 - m.dehydration * 1.4);
        bCtx.strokeStyle = snapped
          ? "#ff5c6c"
          : m.dehydration > 0.45
          ? "#ff9f5a"
          : "#56a8f5";

        bCtx.beginPath();
        if (snapped && m.bleedMl > 3.2) {
          // Visibly snapped vein oozing into subdural space!
          bCtx.moveTo(outerX, outerY);
          bCtx.lineTo((outerX + innerX) * 0.5 - 4, (outerY + innerY) * 0.5 - 3);
          bCtx.moveTo(innerX, innerY);
          bCtx.lineTo((outerX + innerX) * 0.5 + 5, (outerY + innerY) * 0.5 + 4);
        } else {
          bCtx.moveTo(outerX, outerY);
          bCtx.quadraticCurveTo(
            (outerX + innerX) * 0.5 + (1 - m.dehydration) * 7,
            (outerY + innerY) * 0.5,
            innerX,
            innerY
          );
        }
        bCtx.stroke();
      });

      // 5. CEREBRAL CORTEX BODY (Sagittal view, compressed/shifted by sagOffset)
      bCtx.save();
      bCtx.translate(0, sagOffset * 0.65);

      const cortexGrad = bCtx.createRadialGradient(-20, -35, 25, 0, -10, 235);
      cortexGrad.addColorStop(0, "#d99b9e");
      cortexGrad.addColorStop(0.62, "#b5727c");
      cortexGrad.addColorStop(1, "#824b58");

      bCtx.fillStyle = cortexGrad;
      bCtx.strokeStyle = "#e8b4b8";
      bCtx.lineWidth = 2;

      bCtx.beginPath();
      bCtx.moveTo(-212, 26);
      bCtx.bezierCurveTo(-232, -55, -182, -148, -68, -162);
      bCtx.bezierCurveTo(45, -176, 168, -138, 212, -46);
      bCtx.bezierCurveTo(234, 4, 214, 52, 165, 62);
      bCtx.bezierCurveTo(96, 72, 42, 46, -12, 54);
      bCtx.bezierCurveTo(-68, 66, -112, 84, -158, 68);
      bCtx.bezierCurveTo(-194, 56, -206, 42, -212, 26);
      bCtx.closePath();
      bCtx.fill();
      bCtx.stroke();

      // Cortical Sulci / Gyri folds for crisp anatomical recognition
      bCtx.strokeStyle = "rgba(74, 34, 46, 0.55)";
      bCtx.lineWidth = 2.4;
      const sulci = [
        [[-168, -32], [-126, -48], [-98, -22]],
        [[-145, -92], [-96, -84], [-68, -116]],
        [[-42, -154], [-26, -98], [-8, -62]],
        [[28, -152], [18, -96], [42, -56]],
        [[96, -124], [82, -74], [118, -42]],
        [[148, -78], [134, -32], [176, -12]],
        [[-142, 18], [-88, 6], [-48, 28]]
      ];
      sulci.forEach((pts) => {
        bCtx.beginPath();
        bCtx.moveTo(pts[0][0], pts[0][1]);
        bCtx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
        bCtx.stroke();
      });

      // Corpus Callosum C-arch & Deep Thalamus / Basal Ganglia
      bCtx.fillStyle = "#eed3d0";
      bCtx.beginPath();
      bCtx.ellipse(-8, -26, 92, 34, -0.05, Math.PI * 1.05, Math.PI * 1.96);
      bCtx.lineWidth = 13;
      bCtx.strokeStyle = "#ebd0cd";
      bCtx.stroke();

      // Thalamus / Deep Gray Matter oval
      bCtx.fillStyle = "#9c5c68";
      bCtx.beginPath();
      bCtx.ellipse(0, 6, 46, 26, 0, 0, Math.PI * 2);
      bCtx.fill();

      // Hippocampus curve
      bCtx.strokeStyle = state.drinks >= 4 ? "#ff9f43" : "#d8a7ff";
      bCtx.lineWidth = 6;
      bCtx.beginPath();
      bCtx.ellipse(-20, 38, 34, 12, 0.2, 0.1, Math.PI * 1.15);
      bCtx.stroke();

      // Pituitary Stalk & Gland (ADH switch!)
      bCtx.fillStyle = state.drinks >= 2 ? "#ff8b5a" : "#56d4dd";
      bCtx.beginPath();
      bCtx.moveTo(-64, 48);
      bCtx.lineTo(-76, 78);
      bCtx.strokeStyle = state.drinks >= 2 ? "#ff8b5a" : "#56d4dd";
      bCtx.lineWidth = 3;
      bCtx.stroke();
      bCtx.beginPath();
      bCtx.arc(-78, 84, 8.5, 0, Math.PI * 2);
      bCtx.fill();

      // Alcohol Prefrontal Judgment Haze Overlay (front left of cortex)
      if (state.drinks >= 1) {
        const hazeAlpha = Math.min(0.55, state.drinks * 0.075);
        const pfGrad = bCtx.createRadialGradient(-145, -35, 10, -145, -35, 95);
        pfGrad.addColorStop(0, `rgba(255, 145, 77, ${hazeAlpha})`);
        pfGrad.addColorStop(1, "rgba(255, 145, 77, 0)");
        bCtx.fillStyle = pfGrad;
        bCtx.beginPath();
        bCtx.arc(-145, -35, 95, 0, Math.PI * 2);
        bCtx.fill();
      }

      // Deep Penetrating Lenticulostriate Arterioles (pulsing with BP!)
      const pulse = 0.5 + 0.5 * Math.sin(state.pulsePhase * (2.5 + state.drinks * 0.25));
      bCtx.strokeStyle =
        m.systolicBp > 142
          ? `rgba(255, 82, 102, ${0.65 + pulse * 0.35})`
          : "rgba(235, 75, 95, 0.72)";
      bCtx.lineWidth = m.systolicBp > 142 ? 2.6 + pulse * 1.1 : 2.1;
      for (let b = -2; b <= 2; b++) {
        bCtx.beginPath();
        bCtx.moveTo(-34, 64);
        bCtx.quadraticCurveTo(-24 + b * 11, 30, -8 + b * 14, -4 - Math.abs(b) * 4);
        bCtx.stroke();
      }

      // Deep Intracerebral Hemorrhage Pool (if BP surge / micro-arteriole trigger!)
      if (m.isDeepArterial && m.bleedMl > 0.35) {
        const rDeep = Math.min(54, 5 + Math.sqrt(m.bleedMl) * 6.2);
        const deepGrad = bCtx.createRadialGradient(4, -2, 2, 4, -2, rDeep);
        deepGrad.addColorStop(0, "rgba(255, 38, 68, 0.95)");
        deepGrad.addColorStop(0.7, "rgba(195, 20, 48, 0.78)");
        deepGrad.addColorStop(1, "rgba(195, 20, 48, 0)");
        bCtx.fillStyle = deepGrad;
        bCtx.beginPath();
        bCtx.arc(4, -2, rDeep, 0, Math.PI * 2);
        bCtx.fill();
      }

      bCtx.restore(); // end cortex group

      // 6. CEREBELLUM (Balance Gyroscope — sways visually when drinks > 0!)
      const swayAngle =
        state.drinks > 0 ? Math.sin(state.pulsePhase * 2.1) * (state.drinks * 0.014) : 0;
      bCtx.save();
      bCtx.translate(132, 102);
      bCtx.rotate(swayAngle);
      bCtx.fillStyle = "#a46373";
      bCtx.strokeStyle = state.drinks >= 2 ? "#ff9f5a" : "#dfaab5";
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      bCtx.ellipse(0, 0, 62, 46, -0.15, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.stroke();

      // Arbor vitae branching white-matter tree inside cerebellum
      bCtx.strokeStyle = "#f2d9d5";
      bCtx.lineWidth = 1.6;
      for (let f = -3; f <= 3; f++) {
        bCtx.beginPath();
        bCtx.moveTo(-18, 4);
        bCtx.lineTo(f * 13 + 8, f * 9);
        bCtx.stroke();
      }
      bCtx.restore();

      // 7. BRAINSTEM (Vital Center — shows downward compression warning arrows at high ICP!)
      const stemSqueeze = m.icpMmHg > 26 ? Math.min(5, (m.icpMmHg - 26) * 0.14) : 0;
      bCtx.fillStyle = "#c88d94";
      bCtx.strokeStyle = m.icpMmHg > 26 ? "#ff5c6c" : "#e5b8bd";
      bCtx.lineWidth = m.icpMmHg > 26 ? 2.6 : 1.6;
      bCtx.beginPath();
      bCtx.moveTo(-18, 44);
      bCtx.bezierCurveTo(-28 + stemSqueeze, 95, -8 + stemSqueeze, 145, 8, 198);
      bCtx.lineTo(44, 198);
      bCtx.bezierCurveTo(34 - stemSqueeze, 145, 28 - stemSqueeze, 95, 22, 48);
      bCtx.closePath();
      bCtx.fill();
      bCtx.stroke();

      // High-ICP downward herniation warning arrows
      if (m.icpMmHg > 25) {
        bCtx.fillStyle = "#ff5c6c";
        bCtx.font = "700 11px -apple-system, BlinkMacSystemFont, sans-serif";
        bCtx.fillText("⚠ HIGH SKULL PRESSURE", -62, 214);
      }

      bCtx.restore(); // end skull center transform

      // 8. DRAW 7 INTERACTIVE CLICKABLE HOTSPOT PINS ON CANVAS
      DATA.hotspots.forEach((hs, idx) => {
        const hx = hs.nx * BW;
        const hy = hs.ny * BH;
        const selected = idx === state.activeHotspot;
        const hovered = idx === state.hoveredHotspot;

        if (selected || hovered) {
          bCtx.strokeStyle = "rgba(88, 166, 255, 0.55)";
          bCtx.lineWidth = 3;
          bCtx.beginPath();
          bCtx.arc(hx, hy, 18 + Math.sin(state.pulsePhase * 3) * 2, 0, Math.PI * 2);
          bCtx.stroke();
        }

        bCtx.fillStyle = selected ? "#58a6ff" : "#101926";
        bCtx.strokeStyle = selected ? "#ffffff" : "#79b8ff";
        bCtx.lineWidth = 2;
        bCtx.beginPath();
        bCtx.arc(hx, hy, 12.5, 0, Math.PI * 2);
        bCtx.fill();
        bCtx.stroke();

        bCtx.fillStyle = selected ? "#071019" : "#eef4fb";
        bCtx.font = "800 11.5px -apple-system, BlinkMacSystemFont, sans-serif";
        bCtx.textAlign = "center";
        bCtx.textBaseline = "middle";
        bCtx.fillText(String(hs.num), hx, hy + 0.5);
      });
      bCtx.textAlign = "left";
      bCtx.textBaseline = "alphabetic";

      // Top corner orientation legend on canvas
      bCtx.fillStyle = "rgba(11, 16, 23, 0.84)";
      bCtx.strokeStyle = "rgba(88, 166, 255, 0.28)";
      bCtx.lineWidth = 1;
      bCtx.beginPath();
      bCtx.roundRect(14, 14, 246, 46, 8);
      bCtx.fill();
      bCtx.stroke();
      bCtx.fillStyle = "#eef4fb";
      bCtx.font = "700 11.5px -apple-system, BlinkMacSystemFont, sans-serif";
      bCtx.fillText("Click Any Pin 1–7 Inside the Skull", 24, 32);
      bCtx.fillStyle = "#8496ad";
      bCtx.font = "600 10.5px -apple-system, BlinkMacSystemFont, sans-serif";
      bCtx.fillText("Forehead (Front)  ←     →  Back of Head", 24, 49);

      // Subtle, non-overlapping Plain-English Anatomy Callouts around the skull margin
      const drawCallout = (lx, ly, tx, ty, label, sub, color) => {
        bCtx.strokeStyle = "rgba(148, 169, 196, 0.35)";
        bCtx.lineWidth = 1.1;
        bCtx.beginPath();
        bCtx.moveTo(tx, ty);
        bCtx.lineTo(lx, ly);
        bCtx.stroke();
        bCtx.fillStyle = color || "#dce7f5";
        bCtx.font = "700 10.5px -apple-system, BlinkMacSystemFont, sans-serif";
        bCtx.fillText(label, lx + (lx < cx ? -4 : 4), ly - 2);
        if (sub) {
          bCtx.fillStyle = "#8496ad";
          bCtx.font = "500 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
          bCtx.fillText(sub, lx + (lx < cx ? -4 : 4), ly + 11);
        }
      };

      bCtx.textAlign = "right";
      drawCallout(98, 148, 168, 168, "Frontal Lobe", "Judgment & alarms", "#ffd4b8");
      drawCallout(198, 392, 282, 326, "ADH Water Switch", state.drinks >= 2 ? "OFF -> Dehydrating!" : "Saving water", state.drinks >= 2 ? "#ff9f5a" : "#7ee787");

      bCtx.textAlign = "left";
      drawCallout(584, 58, 530, 84, "Sealed Bone Skull", "0% room to stretch", "#e6dfd3");
      drawCallout(590, 396, 535, 360, "Cerebellum", state.drinks >= 2 ? "Balance swaying!" : "Balance gyro", state.drinks >= 2 ? "#ff9f5a" : "#dce7f5");
      bCtx.fillStyle = "#9fb0c4";
      bCtx.font = "700 10px -apple-system, BlinkMacSystemFont, sans-serif";
      bCtx.fillText("Brainstem (Vital Control)", 416, 452);
      bCtx.textAlign = "left";

      bCtx.restore();
    }

    function drawIcpCurve(m) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (icpCanvas.width !== PW * dpr || icpCanvas.height !== PH * dpr) {
        icpCanvas.width = PW * dpr;
        icpCanvas.height = PH * dpr;
      }
      pCtx.save();
      pCtx.scale(dpr, dpr);

      pCtx.fillStyle = "#080d14";
      pCtx.fillRect(0, 0, PW, PH);

      const pad = { l: 44, r: 16, t: 18, b: 36 };
      const gw = PW - pad.l - pad.r;
      const gh = PH - pad.t - pad.b;

      const xOf = (ml) => pad.l + (ml / 75) * gw;
      const yOf = (icp) => pad.t + gh - ((icp - 5) / 65) * gh;

      // 3 Clinical Zone Shading Bands
      // Zone 1: 0..22 mL (Silent CSF Cushion)
      pCtx.fillStyle = "rgba(63, 185, 80, 0.09)";
      pCtx.fillRect(xOf(0), pad.t, xOf(22) - xOf(0), gh);
      // Zone 2: 22..42 mL (Hangover Disguise)
      pCtx.fillStyle = "rgba(255, 139, 90, 0.10)";
      pCtx.fillRect(xOf(22), pad.t, xOf(42) - xOf(22), gh);
      // Zone 3: 42..75 mL (Exponential Cliff)
      pCtx.fillStyle = "rgba(255, 92, 108, 0.11)";
      pCtx.fillRect(xOf(42), pad.t, xOf(75) - xOf(42), gh);

      // Axes
      pCtx.strokeStyle = "#2b384c";
      pCtx.lineWidth = 1;
      pCtx.beginPath();
      pCtx.moveTo(pad.l, pad.t);
      pCtx.lineTo(pad.l, pad.t + gh);
      pCtx.lineTo(pad.l + gw, pad.t + gh);
      pCtx.stroke();

      // Danger 25 mmHg dashed horizontal threshold
      const yDanger = yOf(25);
      pCtx.setLineDash([4, 4]);
      pCtx.strokeStyle = "rgba(255, 92, 108, 0.55)";
      pCtx.beginPath();
      pCtx.moveTo(pad.l, yDanger);
      pCtx.lineTo(pad.l + gw, yDanger);
      pCtx.stroke();
      pCtx.setLineDash([]);

      pCtx.fillStyle = "#ff8c99";
      pCtx.font = "600 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
      pCtx.fillText("25 mmHg Danger Threshold", pad.l + 6, yDanger - 4);

      // Exponential Monro-Kellie Curve
      pCtx.strokeStyle = "#58a6ff";
      pCtx.lineWidth = 2.6;
      pCtx.beginPath();
      for (let ml = 0; ml <= 75; ml += 1) {
        const icp = Math.min(
          68,
          9.5 +
            0.19 * ml +
            2.35 * Math.exp(Math.max(0, ml - 18) / 15.8) -
            2.35 * Math.exp(-18 / 15.8)
        );
        if (ml === 0) pCtx.moveTo(xOf(ml), yOf(icp));
        else pCtx.lineTo(xOf(ml), yOf(icp));
      }
      pCtx.stroke();

      // Live operating point on the curve!
      const dotX = xOf(m.bleedMl);
      const dotY = yOf(m.icpMmHg);
      pCtx.fillStyle = m.icpMmHg > 25 ? "#ff5c6c" : m.bleedMl > 18 ? "#ff8b5a" : "#3fb950";
      pCtx.strokeStyle = "#ffffff";
      pCtx.lineWidth = 2;
      pCtx.beginPath();
      pCtx.arc(dotX, dotY, 6.5, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.stroke();

      // Labels in everyday tablespoons + mL
      pCtx.fillStyle = "#9fb0c4";
      pCtx.font = "600 9.5px -apple-system, BlinkMacSystemFont, sans-serif";
      pCtx.fillText("0 tbsp", xOf(0), pad.t + gh + 14);
      pCtx.fillText("1.5 tbsp (22mL)", xOf(18), pad.t + gh + 14);
      pCtx.fillText("3 tbsp (45mL)", xOf(40), pad.t + gh + 14);
      pCtx.fillText("5 tbsp", xOf(66), pad.t + gh + 14);
      pCtx.fillStyle = "#6f8299";
      pCtx.fillText("Un-clotted Blood Inside Sealed Skull →", pad.l + 78, pad.t + gh + 29);

      pCtx.save();
      pCtx.translate(13, pad.t + gh - 12);
      pCtx.rotate(-Math.PI / 2);
      pCtx.fillText("Skull Pressure (mmHg)", 0, 0);
      pCtx.restore();

      pCtx.restore();
    }

    // Wire up interactive controls
    function syncAll() {
      const m = computeBrainMetrics();
      updateInspectorAndReadouts(m);
      drawBrainCutaway(m);
      drawIcpCurve(m);
    }

    const drugSelect = document.getElementById("brainDrugSelect");
    const drinkSlider = document.getElementById("brainDrinkSlider");
    const triggerSelect = document.getElementById("brainTriggerSelect");
    const hourSlider = document.getElementById("brainHourSlider");
    const playHoursBtn = document.getElementById("playBrainHoursBtn");

    if (drugSelect) {
      drugSelect.addEventListener("change", () => {
        state.drug = drugSelect.value;
        syncAll();
      });
    }
    if (drinkSlider) {
      drinkSlider.addEventListener("input", () => {
        state.drinks = Number(drinkSlider.value);
        syncAll();
      });
    }
    if (triggerSelect) {
      triggerSelect.addEventListener("change", () => {
        state.trigger = triggerSelect.value;
        syncAll();
      });
    }
    if (hourSlider) {
      hourSlider.addEventListener("input", () => {
        state.hour = Number(hourSlider.value);
        state.playingHours = false;
        if (playHoursBtn) playHoursBtn.textContent = "▶ Play 24h Timeline";
        syncAll();
      });
    }
    if (playHoursBtn) {
      playHoursBtn.addEventListener("click", () => {
        state.playingHours = !state.playingHours;
        if (state.playingHours && state.hour >= 23.5) {
          state.hour = 0;
        }
        playHoursBtn.textContent = state.playingHours ? "⏸ Pause 24h Timeline" : "▶ Play 24h Timeline";
      });
    }

    // Quick Scenario Comparison Buttons above Brain Explorer
    document.querySelectorAll("[data-brain-quick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.brainQuick;
        if (mode === "safeDoac") {
          state.drug = "eliquis";
          state.drinks = 0;
          state.trigger = "bump";
          state.hour = 12;
        } else if (mode === "sneakySubdural") {
          state.drug = "eliquis";
          state.drinks = 5;
          state.trigger = "bump";
          state.hour = 12;
          state.activeHotspot = 0;
        } else if (mode === "bpStroke") {
          state.drug = "eliquis";
          state.drinks = 6;
          state.trigger = "bp";
          state.hour = 6;
          state.activeHotspot = 2;
        } else if (mode === "healthyBump") {
          state.drug = "none";
          state.drinks = 0;
          state.trigger = "bump";
          state.hour = 12;
        }
        if (drugSelect) drugSelect.value = state.drug;
        if (drinkSlider) drinkSlider.value = String(state.drinks);
        if (triggerSelect) triggerSelect.value = state.trigger;
        if (hourSlider) hourSlider.value = String(Math.round(state.hour));
        selectHotspot(state.activeHotspot);
        syncAll();
      });
    });

    function selectHotspot(idx) {
      state.activeHotspot = idx;
      document.querySelectorAll("[data-hotspot-idx]").forEach((chip) => {
        chip.classList.toggle("is-active", Number(chip.dataset.hotspotIdx) === idx);
      });
      syncAll();
    }

    // Build accessible chip buttons for all 7 hotspots
    const strip = document.getElementById("brainHotspotStrip");
    if (strip) {
      strip.innerHTML = DATA.hotspots
        .map(
          (hs, idx) =>
            `<button type="button" class="hotspot-chip ${
              idx === 0 ? "is-active" : ""
            }" data-hotspot-idx="${idx}">#${hs.num} ${hs.short}</button>`
        )
        .join("");
      strip.querySelectorAll("[data-hotspot-idx]").forEach((chip) => {
        chip.addEventListener("click", () => selectHotspot(Number(chip.dataset.hotspotIdx)));
      });
    }

    // Canvas mouse hover & click hit-testing for pins 1..7
    function findPinAt(ev) {
      const rect = brainCanvas.getBoundingClientRect();
      const mx = ((ev.clientX - rect.left) / rect.width) * BW;
      const my = ((ev.clientY - rect.top) / rect.height) * BH;
      for (let i = 0; i < DATA.hotspots.length; i++) {
        const dx = mx - DATA.hotspots[i].nx * BW;
        const dy = my - DATA.hotspots[i].ny * BH;
        if (dx * dx + dy * dy <= 22 * 22) return i;
      }
      return -1;
    }

    brainCanvas.addEventListener("mousemove", (ev) => {
      const idx = findPinAt(ev);
      state.hoveredHotspot = idx;
      brainCanvas.style.cursor = idx >= 0 ? "pointer" : "default";
    });
    brainCanvas.addEventListener("mouseleave", () => {
      state.hoveredHotspot = -1;
    });
    brainCanvas.addEventListener("click", (ev) => {
      const idx = findPinAt(ev);
      if (idx >= 0) selectHotspot(idx);
    });

    let last = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!window.__BRAIN_APP_PAUSED) {
        state.pulsePhase += dt;
        if (state.playingHours) {
          state.hour += dt * 2.8;
          if (state.hour >= 24) {
            state.hour = 24;
            state.playingHours = false;
            if (playHoursBtn) playHoursBtn.textContent = "▶ Play 24h Timeline";
          }
          if (hourSlider) hourSlider.value = String(Math.round(state.hour * 2) / 2);
          updateInspectorAndReadouts(computeBrainMetrics());
        }
      }
      const m = computeBrainMetrics();
      drawBrainCutaway(m);
      drawIcpCurve(m);
      requestAnimationFrame(tick);
    }

    syncAll();
    requestAnimationFrame(tick);
  }

  window.initBrainSim = initBrainSim;
})();
