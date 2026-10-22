/* ============================================================
   Main Interactive Application Controller:
   - Depth Mode & Global Pause
   - Clickable Plain-English Glossary Popover
   - Stage 0 Predict-First Prompt
   - Stage 1 Coagulation Cascade & Drug Family Machine
   - Stage 3 Hangover Camouflage Unmasker
   - Stage 4 48-Hour Whole-Body PK, Missed-Dose & NSAID Curve Lab
   - Stage 5 Interactive Myth-Buster Cards
   ============================================================ */

(function () {
  window.__BRAIN_APP_PAUSED = false;

  document.addEventListener("DOMContentLoaded", () => {
    const DATA = window.BRAIN_DOAC_DATA;

    // 1. Respect prefers-reduced-motion initially
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.__BRAIN_APP_PAUSED = true;
    }

    const pauseBtn = document.getElementById("globalPauseBtn");
    function renderPauseBtn() {
      if (!pauseBtn) return;
      pauseBtn.setAttribute("aria-pressed", String(window.__BRAIN_APP_PAUSED));
      pauseBtn.textContent = window.__BRAIN_APP_PAUSED
        ? "▶ Resume Animations"
        : "⏸ Pause Animations";
    }
    if (pauseBtn) {
      renderPauseBtn();
      pauseBtn.addEventListener("click", () => {
        window.__BRAIN_APP_PAUSED = !window.__BRAIN_APP_PAUSED;
        renderPauseBtn();
      });
    }

    // 2. Plain English vs +Clinical Detail toggle
    document.querySelectorAll("[data-depth-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.depthMode;
        document.body.classList.toggle("show-clinical", mode === "clinical");
        document.querySelectorAll("[data-depth-mode]").forEach((b) => {
          b.classList.toggle("is-active", b.dataset.depthMode === mode);
        });
      });
    });

    // 3. Interactive Jargon Glossary Popover
    const pop = document.getElementById("glossaryPopover");
    const popTitle = document.getElementById("glossaryTitle");
    const popPron = document.getElementById("glossaryPronounce");
    const popPlain = document.getElementById("glossaryPlain");
    const popClose = document.getElementById("glossaryClose");

    document.querySelectorAll("[data-jargon]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = el.dataset.jargon;
        const entry = DATA.glossary[key];
        if (!entry || !pop) return;
        popTitle.textContent = entry.title;
        popPron.textContent = entry.pronounce;
        popPlain.textContent = entry.plain;
        pop.hidden = false;
      });
    });

    if (popClose) {
      popClose.addEventListener("click", () => {
        pop.hidden = true;
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && pop && !pop.hidden) pop.hidden = true;
    });
    document.addEventListener("click", (e) => {
      if (pop && !pop.hidden && !pop.contains(e.target)) {
        pop.hidden = true;
      }
    });

    // 4. Stage 0 Predict-First Mini-Check
    document.querySelectorAll("[data-predict-ans]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-predict-ans]").forEach((b) =>
          b.classList.remove("selected")
        );
        btn.classList.add("selected");
        const out = document.getElementById("predictStage0Feedback");
        if (!out) return;
        out.classList.add("visible");
        if (btn.dataset.predictAns === "platelets") {
          out.innerHTML =
            "✅ <strong>Spot on!</strong> Eliquis intentionally dials down Fibrin cables (Brake #2), while leaving your <strong>Platelets (Brake #1)</strong> untouched at 100%! Those healthy platelets plug tiny everyday wear-and-tear leaks all day long — <em>until</em> alcohol stuns your platelets too. Click <strong>Preset 2</strong> then <strong>Preset 4</strong> below to watch that exact moment happen live!";
        } else {
          out.innerHTML =
            "💡 <strong>Great guess — here's the neat biological surprise:</strong> Eliquis doesn't thicken vessel walls or speed up clotting; instead, it safely leaves <strong>Brake #1 (your Platelets!)</strong> at 100% full strength while turning down Brake #2 (Fibrin)! Your platelets plug tiny routine leaks safely all day — which is why adding <strong>alcohol</strong> (which stuns platelets!) suddenly leaves tiny brain vessels with <em>neither</em> brake working. Try clicking <strong>Preset 2</strong> vs <strong>Preset 4</strong> below!";
        }
      });
    });

    // 5. Stage 1 Interactive Drug Family & Coagulation Cascade Machine
    let selectedDrug = "eliquis";
    let alcoholOnCascade = false;

    function renderCascade() {
      const d = DATA.drugs[selectedDrug];
      if (!d) return;

      const effPlatelet = Math.round(
        d.plateletFactor * (alcoholOnCascade ? 0.36 : 1.0) * 100
      );
      const effXa = Math.round(d.xaActivity * 100);
      const effIIa = Math.round(
        Math.min(d.xaActivity, d.iiaActivity) * (d.xaActivity < 1 ? 0.92 : 1) * 100
      );
      const finalPlugIntegrity = Math.min(
        100,
        Math.round(effPlatelet * 0.52 + d.fibrinStrength * 100 * 0.48 * (alcoholOnCascade ? 0.72 : 1))
      );

      // Update SVG node styles & gauges
      const setBar = (id, pct, color) => {
        const el = document.getElementById(id);
        if (el) {
          el.setAttribute("width", String(Math.max(4, Math.round((pct / 100) * 140))));
          el.setAttribute("fill", color);
        }
      };
      const setLabel = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
      };

      setBar("barPlatelet", effPlatelet, effPlatelet > 65 ? "#f7c948" : "#ff8b5a");
      setLabel("txtPlateletPct", effPlatelet + "% stickiness");

      setBar("barXa", effXa, effXa > 65 ? "#39d2c0" : "#79b8ff");
      setLabel("txtXaPct", effXa + "% amplifier flow");

      setBar("barIIa", effIIa, effIIa > 65 ? "#39d2c0" : "#b392f0");
      setLabel("txtIIaPct", effIIa + "% thrombin scissors");

      setBar(
        "barSealTotal",
        finalPlugIntegrity,
        finalPlugIntegrity > 65 ? "#3fb950" : finalPlugIntegrity > 42 ? "#f7c948" : "#ff5c6c"
      );
      setLabel(
        "txtSealTotal",
        finalPlugIntegrity +
          "% emergency leak protection" +
          (finalPlugIntegrity < 45 ? " — DANGER!" : "")
      );

      // Highlight blocked lock tags inside SVG
      const toggleSvgBadge = (id, show) => {
        const g = document.getElementById(id);
        if (g) g.style.opacity = show ? "1" : "0.14";
      };
      toggleSvgBadge(
        "lockVitK",
        selectedDrug === "warfarin"
      );
      toggleSvgBadge(
        "lockXa",
        selectedDrug === "eliquis" || selectedDrug === "xarelto"
      );
      toggleSvgBadge("lockIIa", selectedDrug === "pradaxa");
      toggleSvgBadge("lockPlatelet", selectedDrug === "aspirin" || alcoholOnCascade);

      // Update Right-Side Drug Explanation Card
      setLabel("drugCardName", d.name + (alcoholOnCascade ? " + Heavy Alcohol" : ""));
      setLabel("drugCardGen", d.generation);
      setLabel("drugCardTarget", d.targetBadge);
      setLabel("drugCardOneLine", d.oneLine);
      setLabel("drugCardHalfLife", d.halfLife);
      setLabel("drugCardClearance", d.clearance);
      setLabel("drugCardAlcohol", d.withAlcohol);

      const clinBox = document.getElementById("drugCardClinical");
      if (clinBox) {
        clinBox.innerHTML = `<span class="clinical-tag">Pharmacology</span>${d.clinical}`;
      }
    }

    document.querySelectorAll("[data-drug-pick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedDrug = btn.dataset.drugPick;
        document.querySelectorAll("[data-drug-pick]").forEach((b) =>
          b.classList.toggle("is-active", b.dataset.drugPick === selectedDrug)
        );
        renderCascade();
      });
    });

    const alcCascadeBtn = document.getElementById("cascadeAlcoholToggle");
    if (alcCascadeBtn) {
      alcCascadeBtn.addEventListener("click", () => {
        alcoholOnCascade = !alcoholOnCascade;
        alcCascadeBtn.classList.toggle("is-active", alcoholOnCascade);
        alcCascadeBtn.textContent = alcoholOnCascade
          ? "🍷 Alcohol Active (Click to Remove)"
          : "🍷 + Overlay Alcohol on Diagram";
        renderCascade();
      });
    }
    renderCascade();

    // 6. Stage 3 Hangover vs Brain Bleed Unmasker
    function selectSymptom(idx) {
      const sym = DATA.symptoms[idx];
      if (!sym) return;
      document.querySelectorAll("[data-sym-idx]").forEach((b) =>
        b.classList.toggle("is-active", Number(b.dataset.symIdx) === idx)
      );
      document.getElementById("camoHangoverWhy").textContent = sym.hangoverWhy;
      document.getElementById("camoBleedWhy").textContent = sym.bleedWhy;
      const ul = document.getElementById("camoRedFlags");
      if (ul) {
        ul.innerHTML = sym.redFlags.map((item) => `<li>${item}</li>`).join("");
      }
    }

    const symTabs = document.getElementById("symptomTabs");
    if (symTabs) {
      symTabs.innerHTML = DATA.symptoms
        .map(
          (s, i) =>
            `<button type="button" class="sym-tab ${
              i === 0 ? "is-active" : ""
            }" data-sym-idx="${i}">${s.label}</button>`
        )
        .join("");
      symTabs.querySelectorAll("[data-sym-idx]").forEach((b) =>
        b.addEventListener("click", () => selectSymptom(Number(b.dataset.symIdx)))
      );
      selectSymptom(0);
    }

    // 7. Stage 4 Whole-Body 48-Hour Concentration & Organ Risk Curve Lab
    const pkCanvas = document.getElementById("pkCanvas");
    let pkScenario = "binge";
    let addNsaid = false;
    let inspectHour = 16; // e.g., Friday Midnight / early Saturday

    function evalPkCurves(tHour) {
      const sc = DATA.pkScenarios[pkScenario];
      // Include prior steady-state doses (-36, -24, -12) so Friday 8 AM starts smoothly at real steady-state!
      const priorDoses = [-36, -24, -12];
      const weekendDoses = sc.skipDose ? [0] : [0, 12, 24, 36];
      const doseHours = priorDoses.concat(weekendDoses);
      const halfLife = sc.chronicLiver ? 17.2 : 11.8;
      const kElim = Math.LN2 / halfLife;

      let drugLevel = 0;
      for (const dh of doseHours) {
        if (tHour >= dh) {
          const dt = tHour - dh;
          const absorb = 1 - Math.exp(-1.2 * dt);
          drugLevel += 38 * absorb * Math.exp(-kElim * dt);
        }
      }
      if (sc.chronicLiver) drugLevel *= 1.18;

      // Acute liver competition during evening drinking (hours 12..25)
      if (sc.drinkCount >= 4 && tHour > 12 && tHour < 26) {
        drugLevel *= 1 + 0.14 * Math.sin(((tHour - 12) / 14) * Math.PI);
      }

      // Alcohol systemic platelet/mucosal/BP hazard peaking Friday night (t = 12..24h)
      let alcEffect = 0;
      if (sc.drinkCount > 0 && tHour >= 12) {
        const dtA = tHour - 12;
        alcEffect =
          sc.drinkCount * 12.2 * (1 - Math.exp(-0.85 * dtA)) * Math.exp(-0.19 * dtA);
      }
      if (sc.chronicLiver) alcEffect += 18; // baseline low platelets / coagulopathy

      // Saturday morning Ibuprofen / Aspirin pill at t = 25h (Saturday 9 AM!)
      let nsaidSpike = 0;
      if (addNsaid && tHour >= 25) {
        const dtN = tHour - 25;
        nsaidSpike = 36 * (1 - Math.exp(-1.4 * dtN)) * Math.exp(-0.15 * dtN);
      }

      // Total composite bleed danger vs protective clot floor
      const effectiveBleedLoad = drugLevel + alcEffect + nsaidSpike;
      return { drugLevel, alcEffect, nsaidSpike, effectiveBleedLoad };
    }

    function drawPkChart() {
      if (!pkCanvas) return;
      const ctx = pkCanvas.getContext("2d");
      const W = 760;
      const H = 265;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (pkCanvas.width !== W * dpr || pkCanvas.height !== H * dpr) {
        pkCanvas.width = W * dpr;
        pkCanvas.height = H * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = "#080d14";
      ctx.fillRect(0, 0, W, H);

      const pad = { l: 54, r: 20, t: 22, b: 42 };
      const gw = W - pad.l - pad.r;
      const gh = H - pad.t - pad.b;

      const xOf = (h) => pad.l + (h / 48) * gw;
      const yOf = (val) => pad.t + gh - (Math.min(135, Math.max(0, val)) / 135) * gh;

      // Zone 1 (top red): Excess Bleed Danger (> 78)
      ctx.fillStyle = "rgba(255, 92, 108, 0.13)";
      ctx.fillRect(pad.l, yOf(135), gw, yOf(78) - yOf(135));

      // Zone 2 (middle green): Safe Prescribed Therapeutic Window (24..78)
      ctx.fillStyle = "rgba(63, 185, 80, 0.11)";
      ctx.fillRect(pad.l, yOf(78), gw, yOf(24) - yOf(78));

      // Zone 3 (bottom red/purple): Unprotected Clot / DVT / Stroke Danger (< 24)
      ctx.fillStyle = "rgba(247, 201, 72, 0.11)";
      ctx.fillRect(pad.l, yOf(24), gw, yOf(0) - yOf(24));

      // Zone labels positioned cleanly away from curve trajectories
      ctx.font = "700 10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "#ff8f9b";
      ctx.fillText("▲ HIGH BLEED RISK ZONE (Brain & Stomach)", pad.l + gw - 10, yOf(124));
      ctx.fillStyle = "#7ee787";
      ctx.fillText("✓ SAFE THERAPEUTIC WINDOW (Clots Blocked, Platelets Intact)", pad.l + gw - 10, yOf(70));
      ctx.textAlign = "left";
      ctx.fillStyle = "#f7c948";
      ctx.fillText("▼ UNPROTECTED CLOT REBOUND ZONE (DVT / Lung / Stroke Risk!)", pad.l + 10, yOf(8));

      // Curve 1: Drug Concentration Alone (Dashed Cobalt Blue)
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = "#79b8ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let h = 0; h <= 48; h += 0.5) {
        const v = evalPkCurves(h).drugLevel;
        if (h === 0) ctx.moveTo(xOf(h), yOf(v));
        else ctx.lineTo(xOf(h), yOf(v));
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Curve 2: Total Combined Bleed Stress (Solid Coral/Green dynamic line)
      ctx.lineWidth = 3;
      ctx.strokeStyle =
        pkScenario === "skipTrap"
          ? "#f7c948"
          : pkScenario === "steady"
          ? "#3fb950"
          : "#ff6b6b";
      ctx.beginPath();
      for (let h = 0; h <= 48; h += 0.5) {
        const { drugLevel, effectiveBleedLoad } = evalPkCurves(h);
        const plotVal = pkScenario === "skipTrap" ? drugLevel : effectiveBleedLoad;
        if (h === 0) ctx.moveTo(xOf(h), yOf(plotVal));
        else ctx.lineTo(xOf(h), yOf(plotVal));
      }
      ctx.stroke();

      // Inspect vertical cursor
      const cx = xOf(inspectHour);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, pad.t);
      ctx.lineTo(cx, pad.t + gh);
      ctx.stroke();

      const cur = evalPkCurves(inspectHour);
      const curY = yOf(
        pkScenario === "skipTrap" ? cur.drugLevel : cur.effectiveBleedLoad
      );
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, curY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Time ticks along bottom
      ctx.fillStyle = "#9fb0c4";
      ctx.font = "600 10px -apple-system, BlinkMacSystemFont, sans-serif";
      const ticks = [
        [0, "Fri 8 AM (Dose)"],
        [12, "Fri 8 PM (Drinks?)"],
        [24, "Sat 8 AM (Morning)"],
        [36, "Sat 8 PM"],
        [48, "Sun 8 AM"]
      ];
      ticks.forEach(([th, label]) => {
        ctx.fillText(label, Math.min(W - 92, xOf(th) - 18), pad.t + gh + 18);
      });
      ctx.fillStyle = "#6f8299";
      ctx.fillText("Click or drag across timeline to inspect any hour →", pad.l + 205, pad.t + gh + 35);

      ctx.restore();

      // Update text cards below chart
      const sc = DATA.pkScenarios[pkScenario];
      const setTxt = (id, t) => {
        const el = document.getElementById(id);
        if (el) el.textContent = t;
      };
      setTxt(
        "pkSummaryText",
        sc.summary +
          (addNsaid
            ? " PLUS AT SATURDAY 9 AM: Adding Ibuprofen/Aspirin blocks COX-1 in platelets AND strips stomach mucus right when your stomach and brain are most vulnerable!"
            : "")
      );
      setTxt("organLiverText", sc.liverText);
      setTxt(
        "organStomachText",
        sc.stomachText +
          (addNsaid
            ? " + NSAID shuts off protective stomach prostaglandins (major GI ulcer bleed trigger!)."
            : "")
      );
      setTxt("organBrainText", sc.brainText);

      const dayNames = ["Friday", "Saturday", "Sunday"];
      const dayIdx = Math.floor((inspectHour + 8) / 24);
      const clockH = Math.round(inspectHour + 8) % 24;
      const ampm = clockH >= 12 ? "PM" : "AM";
      const dispH = clockH % 12 === 0 ? 12 : clockH % 12;
      setTxt(
        "pkCursorReadout",
        `Inspecting ${dayNames[Math.min(2, dayIdx)]} ${dispH}:00 ${ampm} — Eliquis Protection: ${Math.round(
          cur.drugLevel
        )} units · Total Bleed Stress: ${Math.round(cur.effectiveBleedLoad)} units${
          cur.drugLevel < 24 ? " ⚠ UNPROTECTED CLOT ZONE!" : ""
        }${cur.effectiveBleedLoad > 78 ? " ⚠ HIGH BLEED DANGER ZONE!" : ""}`
      );
    }

    document.querySelectorAll("[data-pk-scenario]").forEach((btn) => {
      btn.addEventListener("click", () => {
        pkScenario = btn.dataset.pkScenario;
        document.querySelectorAll("[data-pk-scenario]").forEach((b) =>
          b.classList.toggle("is-active", b.dataset.pkScenario === pkScenario)
        );
        drawPkChart();
      });
    });

    const nsaidBtn = document.getElementById("pkNsaidToggle");
    if (nsaidBtn) {
      nsaidBtn.addEventListener("click", () => {
        addNsaid = !addNsaid;
        nsaidBtn.classList.toggle("is-active", addNsaid);
        nsaidBtn.textContent = addNsaid
          ? "💊 Sat 9 AM Ibuprofen/Aspirin ON (Click to Remove)"
          : "💊 + Add Sat 9 AM Ibuprofen / Aspirin Pill";
        if (addNsaid) inspectHour = 27;
        drawPkChart();
      });
    }

    if (pkCanvas) {
      let dragging = false;
      const moveCursor = (ev) => {
        const rect = pkCanvas.getBoundingClientRect();
        const relX = ((ev.clientX - rect.left) / rect.width) * 760;
        inspectHour = Math.max(0, Math.min(48, ((relX - 54) / (760 - 74)) * 48));
        drawPkChart();
      };
      pkCanvas.addEventListener("mousedown", (e) => {
        dragging = true;
        moveCursor(e);
      });
      window.addEventListener("mouseup", () => {
        dragging = false;
      });
      pkCanvas.addEventListener("mousemove", (e) => {
        if (dragging) moveCursor(e);
      });
      pkCanvas.addEventListener("click", moveCursor);
    }
    drawPkChart();

    // 8. Stage 5 Interactive Myth-Buster Cards
    const mythGrid = document.getElementById("mythGrid");
    if (mythGrid) {
      mythGrid.innerHTML = DATA.myths
        .map(
          (m, idx) => `
        <article class="myth-card">
          <div>
            <p class="stage-kicker">SCENARIO CHECK #${idx + 1}</p>
            <p class="myth-statement">${m.q}</p>
          </div>
          <div>
            <div class="myth-actions">
              <button type="button" class="myth-btn" data-myth-idx="${idx}" data-guess="false">Fact / Safe</button>
              <button type="button" class="myth-btn" data-myth-idx="${idx}" data-guess="true">Myth / Risky!</button>
            </div>
            <div class="myth-feedback" id="mythFb-${idx}"></div>
          </div>
        </article>`
        )
        .join("");

      mythGrid.querySelectorAll("[data-myth-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.mythIdx);
          const guessedMyth = btn.dataset.guess === "true";
          const m = DATA.myths[idx];
          const correct = guessedMyth === m.truthIsMyth;
          const fb = document.getElementById(`mythFb-${idx}`);
          if (fb) {
            fb.classList.add("visible");
            fb.style.borderLeftColor = correct ? "#3fb950" : "#ff8b5a";
            fb.innerHTML = `<strong>${correct ? "✅ Nailed it! " : "💡 Surprising twist: "}${
              m.headline
            }</strong><br>${m.detail}`;
          }
        });
      });
    }

    // 9. Sticky section navigation highlight on scroll
    const sections = Array.from(document.querySelectorAll("section.stage"));
    const navPills = Array.from(document.querySelectorAll(".rail-pill"));
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY + 190;
        let currentId = sections[0]?.id;
        for (const s of sections) {
          if (s.offsetTop <= y) currentId = s.id;
        }
        navPills.forEach((p) =>
          p.classList.toggle("is-active", p.getAttribute("href") === "#" + currentId)
        );
      },
      { passive: true }
    );

    // Boot interactive Canvas simulations
    if (typeof window.initVesselSim === "function") window.initVesselSim();
    if (typeof window.initBrainSim === "function") window.initBrainSim();
  });
})();
