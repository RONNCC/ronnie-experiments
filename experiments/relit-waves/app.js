/* The Relit Wave — app.js */
(function () {
  "use strict";

  const DATA = window.RELIT_WAVE_DATA;
  if (!DATA) return;

  const $ = (id) => document.getElementById(id);

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // State
  let activeLineageIdx = 6; // 1999 Coffee by default
  let activeCategory = "All";
  let activeArchetype = "all";
  let activeDomainId = "coffee";
  let activeSceneId = "cup";
  let physicsMode = "ocean";
  const quizAnswers = {};

  /* ---------------------------------------------------------
   * 1. Genealogy Scrubber
   * --------------------------------------------------------- */
  function renderLineage() {
    const pills = $("lineagePills");
    const detail = $("lineageDetail");
    const items = DATA.timelineMarkers;

    pills.innerHTML = items
      .map(
        (item, idx) =>
          `<button type="button" class="pill-btn" data-lineage="${idx}" aria-pressed="${
            idx === activeLineageIdx
          }">${item.year} · ${escapeHtml(item.domain)}</button>`
      )
      .join("");

    const current = items[activeLineageIdx] || items[0];
    detail.innerHTML = `
      <span class="lineage-year">${current.year}</span>
      <span class="lineage-domain">${escapeHtml(current.domain)}</span>
      <p class="lineage-text">${escapeHtml(current.label)}</p>
    `;

    pills.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeLineageIdx = Number(btn.dataset.lineage);
        renderLineage();
      });
    });
  }

  /* ---------------------------------------------------------
   * 2. Nine-Domain Atlas
   * --------------------------------------------------------- */
  function getFilteredDomains() {
    return DATA.domains.filter((d) => {
      const catOk = activeCategory === "All" || d.category === activeCategory;
      const archOk = activeArchetype === "all" || d.archetype === activeArchetype;
      return catOk && archOk;
    });
  }

  function renderAtlasFilters() {
    const categories = ["All", ...new Set(DATA.domains.map((d) => d.category))];
    $("categoryFilters").innerHTML = categories
      .map(
        (cat) =>
          `<button type="button" class="pill-btn" data-cat="${escapeHtml(cat)}" aria-pressed="${
            cat === activeCategory
          }">${escapeHtml(cat)}</button>`
      )
      .join("");

    $("categoryFilters")
      .querySelectorAll("button")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          activeCategory = btn.dataset.cat;
          ensureValidDomain();
          renderAtlasFilters();
          renderDomainTabs();
          renderDomainStage();
        });
      });

    const archItems = [{ id: "all", short: "All Wave Shapes" }, ...DATA.archetypes];
    $("archetypeFilters").innerHTML = archItems
      .map(
        (a) =>
          `<button type="button" class="pill-btn" data-arch="${escapeHtml(a.id)}" aria-pressed="${
            a.id === activeArchetype
          }">${escapeHtml(a.short)}</button>`
      )
      .join("");

    $("archetypeFilters")
      .querySelectorAll("button")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          activeArchetype = btn.dataset.arch;
          ensureValidDomain();
          renderAtlasFilters();
          renderDomainTabs();
          renderDomainStage();
        });
      });
  }

  function ensureValidDomain() {
    let filtered = getFilteredDomains();
    if (filtered.length === 0) {
      // Reset archetype if combination yields 0 so user is never stuck in an empty box
      activeArchetype = "all";
      filtered = getFilteredDomains();
    }
    if (!filtered.some((d) => d.id === activeDomainId) && filtered.length > 0) {
      activeDomainId = filtered[0].id;
    }
  }

  function renderDomainTabs() {
    const tabsEl = $("domainTabs");
    const filtered = getFilteredDomains();

    tabsEl.innerHTML = filtered
      .map(
        (d) => `
        <button type="button" role="tab" class="domain-tab" id="tab-${escapeHtml(d.id)}" data-domain="${escapeHtml(
          d.id
        )}" aria-selected="${d.id === activeDomainId}">
          <span class="domain-tab-cat">${escapeHtml(d.category)}</span>
          <span class="domain-tab-title">${escapeHtml(d.title)}</span>
        </button>
      `
      )
      .join("");

    tabsEl.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeDomainId = btn.dataset.domain;
        renderDomainTabs();
        renderDomainStage();
      });
    });
  }

  function renderDomainStage() {
    const stage = $("domainStage");
    const domain = DATA.domains.find((d) => d.id === activeDomainId) || DATA.domains[0];
    const arch = DATA.archetypes.find((a) => a.id === domain.archetype);

    stage.setAttribute("aria-labelledby", `tab-${domain.id}`);

    const waveCardsHtml = domain.waves
      .map(
        (w) => `
        <div class="wave-card ${w.contested ? "contested" : ""}">
          <div class="wave-card-head">
            <span class="wave-num">${escapeHtml(w.num)}</span>
            <span class="wave-era">${escapeHtml(w.era)}</span>
          </div>
          <h4>${escapeHtml(w.name)}</h4>
          <p class="wave-field"><b>Spark:</b> ${escapeHtml(w.spark)}</p>
          <p class="wave-field"><b>What shifted:</b> ${escapeHtml(w.shift)}</p>
          <p class="wave-field"><b>Tension / blind spot:</b> ${escapeHtml(w.blindSpot)}</p>
          <div class="exemplar-tags" aria-label="Representative examples">
            ${w.exemplars.map((ex) => `<span class="exemplar-tag">${escapeHtml(ex)}</span>`).join("")}
          </div>
        </div>
      `
      )
      .join("");

    stage.innerHTML = `
      <div class="domain-top">
        <div>
          <div class="domain-badges">
            <span class="badge">${escapeHtml(domain.category)}</span>
            <span class="badge badge-status">${escapeHtml(domain.labelStatus)}</span>
            ${
              arch
                ? `<span class="badge badge-archetype">Archetype: ${escapeHtml(arch.name)}</span>`
                : ""
            }
          </div>
          <h3>${escapeHtml(domain.title)}</h3>
          <p class="domain-subtitle">${escapeHtml(domain.subtitle)}</p>
        </div>
        <div class="coined-meta">
          <strong>Key naming / periodization</strong>
          ${escapeHtml(domain.coinedBy)}
        </div>
      </div>

      <div class="domain-hooks">
        <div class="hook-card">
          <strong>How the wave label caught on</strong>
          ${escapeHtml(domain.originHook)}
        </div>
        <div class="hook-card">
          <strong>What gets "relit" each time</strong>
          ${escapeHtml(domain.relitDynamic)}
        </div>
      </div>

      <div class="waves-track">
        ${waveCardsHtml}
      </div>

      <div class="domain-critique">
        <strong>Where the wave story bends or oversimplifies:</strong> ${escapeHtml(domain.critique)}
      </div>
    `;
  }

  /* ---------------------------------------------------------
   * 3. Everyday Scene Translator
   * --------------------------------------------------------- */
  function renderSceneTranslator() {
    const btnWrap = $("sceneButtons");
    const cardsWrap = $("sceneCards");
    const badge = $("sceneDomainBadge");

    btnWrap.innerHTML = DATA.everydayScenes
      .map(
        (s) =>
          `<button type="button" class="pill-btn" data-scene="${escapeHtml(s.id)}" aria-pressed="${
            s.id === activeSceneId
          }">${escapeHtml(s.title)}</button>`
      )
      .join("");

    btnWrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeSceneId = btn.dataset.scene;
        renderSceneTranslator();
      });
    });

    const scene = DATA.everydayScenes.find((s) => s.id === activeSceneId) || DATA.everydayScenes[0];
    badge.textContent = scene.domain;

    cardsWrap.innerHTML = scene.waves
      .map(
        (w) => `
        <article class="scene-card">
          <span class="scene-wave-tag">${escapeHtml(w.wave)}</span>
          <h3>${escapeHtml(w.headline)}</h3>
          <p>${escapeHtml(w.detail)}</p>
          <div class="mini-meters">
            <div class="meter-row">
              <span>Context / Origin</span>
              <div class="meter-track"><div class="meter-fill" style="width:${w.metrics.provenance}%"></div></div>
              <span>${w.metrics.provenance}%</span>
            </div>
            <div class="meter-row alt">
              <span>Uniformity</span>
              <div class="meter-track"><div class="meter-fill" style="width:${w.metrics.standardization}%"></div></div>
              <span>${w.metrics.standardization}%</span>
            </div>
            <div class="meter-row third">
              <span>Process Clarity</span>
              <div class="meter-track"><div class="meter-fill" style="width:${w.metrics.craftTransparency}%"></div></div>
              <span>${w.metrics.craftTransparency}%</span>
            </div>
          </div>
        </article>
      `
      )
      .join("");
  }

  /* ---------------------------------------------------------
   * 4. Cross-Domain Comparator & Spot-a-Wave Sandbox
   * --------------------------------------------------------- */
  function initComparator() {
    const leftSel = $("compareLeft");
    const rightSel = $("compareRight");

    const optionsHtml = DATA.domains
      .map((d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.title)} (${escapeHtml(d.category)})</option>`)
      .join("");

    leftSel.innerHTML = optionsHtml;
    rightSel.innerHTML = optionsHtml;

    leftSel.value = "coffee";
    rightSel.value = "sociolinguistics";

    leftSel.addEventListener("change", renderComparison);
    rightSel.addEventListener("change", renderComparison);
    renderComparison();
  }

  function renderComparison() {
    const left = DATA.domains.find((d) => d.id === $("compareLeft").value) || DATA.domains[0];
    const right = DATA.domains.find((d) => d.id === $("compareRight").value) || DATA.domains[1];

    $("thLeft").textContent = left.title;
    $("thRight").textContent = right.title;

    const rows = [
      ["Term Status", left.labelStatus, right.labelStatus],
      ["Coined / Codified By", left.coinedBy, right.coinedBy],
      [
        "1st Wave Core",
        `${left.waves[0].name} (${left.waves[0].era}) — ${left.axes.unit[0]}`,
        `${right.waves[0].name} (${right.waves[0].era}) — ${right.axes.unit[0]}`
      ],
      [
        "2nd Wave Core",
        `${left.waves[1].name} (${left.waves[1].era}) — ${left.axes.unit[1]}`,
        `${right.waves[1].name} (${right.waves[1].era}) — ${right.axes.unit[1]}`
      ],
      [
        "3rd Wave Relighting",
        `${left.waves[2].name} (${left.waves[2].era}) — ${left.axes.unit[2]}`,
        `${right.waves[2].name} (${right.waves[2].era}) — ${right.axes.unit[2]}`
      ],
      [
        "4th Wave / Aftermath",
        left.waves[3]
          ? `${left.waves[3].num}: ${left.waves[3].name}`
          : "Ongoing synthesis; earlier waves remain active layers",
        right.waves[3]
          ? `${right.waves[3].num}: ${right.waves[3].name}`
          : "Ongoing synthesis; earlier waves remain active layers"
      ]
    ];

    $("compareBody").innerHTML = rows
      .map(
        ([label, lVal, rVal]) => `
        <tr>
          <td class="compare-row-label">${escapeHtml(label)}</td>
          <td>${escapeHtml(lVal)}</td>
          <td>${escapeHtml(rVal)}</td>
        </tr>
      `
      )
      .join("");

    const leftArch = DATA.archetypes.find((a) => a.id === left.archetype);
    const rightArch = DATA.archetypes.find((a) => a.id === right.archetype);

    let synthesis;
    if (left.id === right.id) {
      synthesis = `Pick two distinct movements above to compare how their wave transitions mirror or diverge from one another.`;
    } else if (left.archetype === right.archetype) {
      synthesis = `Shared structural DNA (${leftArch.name}): Both ${left.title} and ${right.title} follow the same wave engine—${leftArch.summary}`;
    } else {
      synthesis = `Cross-archetype contrast: ${left.title} runs on "${leftArch.short}" (${left.axes.goal[2].toLowerCase()}), whereas ${right.title} runs on "${rightArch.short}" (${right.axes.goal[2].toLowerCase()}). Yet in both, Wave 3 zooms past broad group/brand labels to recover fine-grained provenance or agency.`;
    }

    $("compareInsight").textContent = synthesis;
  }

  function initSandbox() {
    const presetsWrap = $("presetButtons");
    presetsWrap.innerHTML = DATA.customWavePresets
      .map(
        (p, idx) =>
          `<button type="button" class="pill-btn" data-preset="${idx}">${escapeHtml(p.name)}</button>`
      )
      .join("");

    function loadPreset(idx) {
      const p = DATA.customWavePresets[idx];
      if (!p) return;
      $("customName").value = p.name;
      $("customW1").value = p.w1;
      $("customW2").value = p.w2;
      $("customW3").value = p.w3;
      $("customMech").value = p.mechanism;
      presetsWrap.querySelectorAll("button").forEach((b, i) => {
        b.setAttribute("aria-pressed", String(i === idx));
      });
      renderSandboxPreview();
    }

    presetsWrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => loadPreset(Number(btn.dataset.preset)));
    });

    ["customName", "customW1", "customW2", "customW3", "customMech"].forEach((id) => {
      $(id).addEventListener("input", renderSandboxPreview);
      $(id).addEventListener("change", renderSandboxPreview);
    });

    loadPreset(0);
  }

  function renderSandboxPreview() {
    const name = $("customName").value.trim() || "Untitled Movement";
    const w1 = $("customW1").value.trim() || "Baseline mass access or founding underground spark";
    const w2 = $("customW2").value.trim() || "Standardized institution, lifestyle brand, or regional codification";
    const w3 = $("customW3").value.trim() || "Relit provenance, context, or DIY counter-response";
    const mech = $("customMech").value;

    const mechDescriptions = {
      granularity:
        "Terroir / Granularity Engine — Closest siblings: Third-Wave Coffee & Bean-to-Bar Chocolate. Watch for a '4th wave' debate once precision tools or high prices spark pushback.",
      reaction:
        "Anti-Commercial Relighting — Closest siblings: 4th-Wave Emo Revival, 3rd-Wave Ska & Natural Wine. Wave 3/4 defines itself against Wave 2's polish while keeping Wave 1's raw spirit.",
      synthesis:
        "Dialectical Synthesis — Closest siblings: Third-Wave AI, Third-Wave CBT & HCI. Rather than discarding Wave 1 or Wave 2, Wave 3 fuses explicit structure with messy real-world context."
    };

    $("builderPreview").innerHTML = `
      <div>
        <span class="eyebrow">LIVE WAVE CARD</span>
        <h3 style="margin-top:0.2rem">Three Waves of ${escapeHtml(name)}</h3>
      </div>
      <div class="preview-step"><strong>1st Wave (Retroactive root):</strong> ${escapeHtml(w1)}</div>
      <div class="preview-step"><strong>2nd Wave (Codification):</strong> ${escapeHtml(w2)}</div>
      <div class="preview-step"><strong>3rd Wave (The relit turn):</strong> ${escapeHtml(w3)}</div>
      <div class="preview-diagnosis">
        <strong>Pattern match:</strong> ${escapeHtml(mechDescriptions[mech] || mechDescriptions.granularity)}
      </div>
    `;
  }

  /* ---------------------------------------------------------
   * 5. Ocean Swells vs. Radio Frequencies Physics Lab
   * --------------------------------------------------------- */
  function initPhysicsLab() {
    const oceanBtn = $("modeOcean");
    const radioBtn = $("modeRadio");
    const sliders = ["persistSlider", "undertowSlider", "grassrootsSlider"];

    oceanBtn.addEventListener("click", () => {
      physicsMode = "ocean";
      oceanBtn.classList.add("btn-primary");
      oceanBtn.setAttribute("aria-pressed", "true");
      radioBtn.classList.remove("btn-primary");
      radioBtn.setAttribute("aria-pressed", "false");
      renderPhysicsLab();
    });

    radioBtn.addEventListener("click", () => {
      physicsMode = "radio";
      radioBtn.classList.add("btn-primary");
      radioBtn.setAttribute("aria-pressed", "true");
      oceanBtn.classList.remove("btn-primary");
      oceanBtn.setAttribute("aria-pressed", "false");
      renderPhysicsLab();
    });

    sliders.forEach((id) => {
      $(id).addEventListener("input", renderPhysicsLab);
    });

    renderPhysicsLab();
  }

  function buildPath(points) {
    return points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
  }

  function renderPhysicsLab() {
    const persist = Number($("persistSlider").value) / 100;
    const undertow = Number($("undertowSlider").value) / 100;
    const grassroots = Number($("grassrootsSlider").value) / 100;

    $("persistOut").textContent = `${Math.round(persist * 100)}%`;
    $("undertowOut").textContent = `${Math.round(undertow * 100)}%`;
    $("grassrootsOut").textContent = `${Math.round(grassroots * 100)}%`;

    const W = 540;
    const H = 260;
    const baseY = 222;
    const xs = [];
    for (let x = 28; x <= 516; x += 6) xs.push(x);

    const svg = $("physicsSvg");

    if (physicsMode === "ocean") {
      // Gaussian swells + optional persistence tail + undertow dip + grassroots baseline
      const swell = (x, center, width, amp) => {
        const z = (x - center) / width;
        const peak = Math.exp(-z * z) * amp;
        const tail = x > center ? amp * persist * 0.48 * (1 - Math.exp(-(x - center) / 60)) : 0;
        const dip =
          x > center + width * 0.55
            ? Math.exp(-Math.pow((x - (center + width * 1.25)) / (width * 0.65), 2)) * amp * undertow * 0.55
            : 0;
        return Math.max(2, peak + tail - dip);
      };

      const p1 = xs.map((x) => [x, baseY - swell(x, 115, 46, 115)]);
      const p2 = xs.map((x) => [x, baseY - swell(x, 275, 50, 132)]);
      const p3 = xs.map((x) => [x, baseY - swell(x, 435, 48, 148)]);
      const pGrass = xs.map((x, i) => [
        x,
        baseY - (12 + grassroots * 46 + Math.sin(i * 0.45) * (4 + grassroots * 8))
      ]);

      svg.innerHTML = `
        <rect width="${W}" height="${H}" fill="#142024"/>
        <line x1="28" y1="${baseY}" x2="516" y2="${baseY}" stroke="#445c63" stroke-width="1.5"/>
        <text x="115" y="244" text-anchor="middle" fill="#9fb6bd" font-size="11">Era 1</text>
        <text x="195" y="244" text-anchor="middle" fill="#7c969e" font-size="10">"Trough"</text>
        <text x="275" y="244" text-anchor="middle" fill="#9fb6bd" font-size="11">Era 2</text>
        <text x="355" y="244" text-anchor="middle" fill="#7c969e" font-size="10">"Trough"</text>
        <text x="435" y="244" text-anchor="middle" fill="#9fb6bd" font-size="11">Era 3</text>

        <path d="${buildPath(pGrass)}" fill="none" stroke="#7bd389" stroke-width="2" stroke-dasharray="5,4"/>
        <path d="${buildPath(p1)}" fill="none" stroke="#6ba3d6" stroke-width="3"/>
        <path d="${buildPath(p2)}" fill="none" stroke="#e9b44c" stroke-width="3"/>
        <path d="${buildPath(p3)}" fill="none" stroke="#f07148" stroke-width="3.2"/>
      `;

      $("modelExplanation").innerHTML = `
        <strong>Ocean Swell Model (Classic Textbook View)</strong>
        Useful for spotting big public turning points (1920 suffrage, 1970 Earth Day, 2000s pour-over bars). Notice what happens as you raise <em>Persistence</em> and <em>Grassroots signal</em>: the supposedly empty "troughs" between crests fill up with continuing first-wave staples and unheadlined local work.
      `;

      $("physicsReadout").textContent =
        persist < 0.2
          ? "Low persistence (mythic replacement): pretends Folgers, behavior therapy, or symbolic logic vanished the day Wave 2 arrived."
          : undertow > 0.45
          ? "High undertow (Huntington mode): strong surges trigger visible reverse-wave dips after each crest."
          : "Realistic layered swells: earlier waves settle into durable infrastructure (~" +
            Math.round(persist * 100) +
            "% baseline) while grassroots activity bridges every 'trough.'";
    } else {
      // Nancy Hewitt's Radio Frequencies: concurrent horizontal bands modulated over time
      const band = (rowY, freq, phase, envCenter, baseAmp) =>
        xs.map((x, idx) => {
          const z = (x - envCenter) / 130;
          const env = 0.28 + persist * 0.45 + Math.exp(-z * z) * 0.72;
          const jam = undertow * 0.45 * Math.sin(idx * 0.9 + phase);
          const osc = Math.sin(idx * freq + phase) * baseAmp * Math.max(0.15, env - jam);
          return [x, rowY + osc];
        });

      const b1 = band(52, 0.55, 0.2, 125, 18);
      const b2 = band(106, 0.85, 1.3, 275, 18);
      const b3 = band(160, 1.25, 2.4, 420, 18);
      const bGrass = xs.map((x, idx) => [
        x,
        210 + Math.sin(idx * 0.95) * (4 + grassroots * 16) * (1 - undertow * 0.25)
      ]);

      svg.innerHTML = `
        <rect width="${W}" height="${H}" fill="#142024"/>
        <line x1="28" y1="52" x2="516" y2="52" stroke="#283b40" stroke-width="1"/>
        <line x1="28" y1="106" x2="516" y2="106" stroke="#283b40" stroke-width="1"/>
        <line x1="28" y1="160" x2="516" y2="160" stroke="#283b40" stroke-width="1"/>
        <line x1="28" y1="210" x2="516" y2="210" stroke="#283b40" stroke-width="1"/>

        <text x="32" y="34" fill="#6ba3d6" font-size="10" font-family="monospace">CH 1 · Macro / Commodity / Legal</text>
        <text x="32" y="88" fill="#e9b44c" font-size="10" font-family="monospace">CH 2 · Network / Lifestyle / Cognitive</text>
        <text x="32" y="142" fill="#f07148" font-size="10" font-family="monospace">CH 3 · Terroir / Persona / Intersectional</text>
        <text x="32" y="193" fill="#7bd389" font-size="10" font-family="monospace">CH 4 · Community / DIY Low-Power FM</text>

        <path d="${buildPath(b1)}" fill="none" stroke="#6ba3d6" stroke-width="2.3"/>
        <path d="${buildPath(b2)}" fill="none" stroke="#e9b44c" stroke-width="2.3"/>
        <path d="${buildPath(b3)}" fill="none" stroke="#f07148" stroke-width="2.3"/>
        <path d="${buildPath(bGrass)}" fill="none" stroke="#7bd389" stroke-width="2.1"/>
      `;

      $("modelExplanation").innerHTML = `
        <strong>Radio-Frequency Model (Nancy A. Hewitt, 2010)</strong>
        Instead of one ocean wave replacing the last, movements broadcast <em>simultaneously</em> on different frequencies. Some stations command huge megawatt towers in certain decades; others face static or interference (<em>Undertow</em>) while never going off the air.
      `;

      $("physicsReadout").textContent =
        "Concurrent frequencies: right now on a single city block you can buy 1st-wave canned coffee, a 2nd-wave caramel latte, and a 3rd-wave Geisha pour-over—all broadcasting at once.";
    }
  }

  /* ---------------------------------------------------------
   * 6. Scenario Quiz
   * --------------------------------------------------------- */
  function renderQuiz() {
    const list = $("quizList");
    list.innerHTML = DATA.quizScenarios
      .map((q, qIdx) => {
        const picked = quizAnswers[q.id];
        const answered = typeof picked === "number";
        const chosenObj = answered ? q.choices[picked] : null;

        return `
          <article class="quiz-card">
            <p class="quiz-prompt"><strong>Scenario ${qIdx + 1}:</strong> ${escapeHtml(q.prompt)}</p>
            <p class="quiz-question-text">${escapeHtml(q.question)}</p>
            <div class="quiz-options">
              ${q.choices
                .map((c, cIdx) => {
                  let cls = "quiz-opt";
                  if (picked === cIdx) {
                    cls += c.correct ? " selected-right" : " selected-wrong";
                  }
                  return `<button type="button" class="${cls}" data-qid="${escapeHtml(
                    q.id
                  )}" data-cidx="${cIdx}" aria-pressed="${picked === cIdx}">${escapeHtml(c.label)}</button>`;
                })
                .join("")}
            </div>
            ${
              chosenObj
                ? `<p class="quiz-feedback ${chosenObj.correct ? "right" : ""}">${
                    chosenObj.correct ? "✓ " : "↺ "
                  }${escapeHtml(chosenObj.feedback)}</p>`
                : ""
            }
          </article>
        `;
      })
      .join("");

    list.querySelectorAll(".quiz-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        quizAnswers[btn.dataset.qid] = Number(btn.dataset.cidx);
        renderQuiz();
      });
    });

    const total = DATA.quizScenarios.length;
    const answeredCount = Object.keys(quizAnswers).length;
    const rightCount = DATA.quizScenarios.filter(
      (q) => typeof quizAnswers[q.id] === "number" && q.choices[quizAnswers[q.id]].correct
    ).length;

    $("quizScore").textContent = `Answered: ${answeredCount} / ${total} · Correct: ${rightCount} / ${total}`;
  }

  /* ---------------------------------------------------------
   * 7. Glossary & Sources
   * --------------------------------------------------------- */
  function initGlossary() {
    const input = $("glossarySearch");
    const grid = $("glossaryGrid");
    const empty = $("glossaryEmpty");

    function update() {
      const q = input.value.trim().toLowerCase();
      const matches = DATA.glossary.filter(
        (g) => !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q)
      );

      empty.hidden = matches.length > 0;
      grid.innerHTML = matches
        .map(
          (g) => `
          <div class="glossary-item">
            <dt>${escapeHtml(g.term)}</dt>
            <dd>${escapeHtml(g.def)}</dd>
          </div>
        `
        )
        .join("");
    }

    input.addEventListener("input", update);
    update();
  }

  function renderSources() {
    $("sourcesList").innerHTML = DATA.sources
      .map(
        (s) => `
        <li class="source-card">
          <span class="source-domain">${escapeHtml(s.domain)}</span>
          <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.cite)}</a>
          <p class="source-note">${escapeHtml(s.note)}</p>
        </li>
      `
      )
      .join("");
  }

  /* ---------------------------------------------------------
   * Boot
   * --------------------------------------------------------- */
  renderLineage();
  renderAtlasFilters();
  renderDomainTabs();
  renderDomainStage();
  renderSceneTranslator();
  initComparator();
  initSandbox();
  initPhysicsLab();
  renderQuiz();
  initGlossary();
  renderSources();
})();
