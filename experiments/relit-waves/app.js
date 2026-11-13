/* The Relit Wave — app.js
 * No dependencies. Renders the atlas, comparator, sandbox, metaphor lab, quiz,
 * glossary and source ledger from window.RELIT_WAVE_DATA.
 */
(function () {
  "use strict";

  const DATA = window.RELIT_WAVE_DATA;
  if (!DATA) return;

  const $ = (id) => document.getElementById(id);
  const prefersReduced = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* State */
  let activeMarkerIdx = 5;
  let activeCategory = "All";
  let activeArchetype = "all";
  let activeDomainId = "coffee";
  let activeSceneId = "cup";
  let physicsMode = "ocean";
  const quizAnswers = {};

  /* ---------------------------------------------------------
   * Navigation: mobile panel, current section, active index
   * ------------------------------------------------------- */

  function initNavigation() {
    const toggle = $("navToggle");
    const rail = $("navRail");
    if (!toggle || !rail) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      rail.setAttribute("data-open", String(open));
      toggle.setAttribute("aria-label", open ? "Close section menu" : "Open section menu");
      if (open) {
        rail.querySelectorAll("a").forEach((link, i) => {
          link.style.transitionDelay = `${Math.min(i * 60, 400)}ms`;
        });
      } else {
        rail.querySelectorAll("a").forEach((link) => {
          link.style.transitionDelay = "0ms";
        });
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    rail.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    if (!("IntersectionObserver" in window)) return;

    const links = [...rail.querySelectorAll("a")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    // A narrow band near the top of the viewport decides the current section.
    // Entries that leave the band must not clear the highlight, otherwise a
    // batch update can leave nothing, or two links, marked as current.
    const spy = new IntersectionObserver(
      (entries) => {
        const entered = entries.filter((entry) => entry.isIntersecting);
        if (!entered.length) return;
        const id = entered[entered.length - 1].target.id;
        links.forEach((link) => {
          if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 }
    );

    sections.forEach((section) => spy.observe(section));
  }

  /* ---------------------------------------------------------
   * Scroll reveals
   * ------------------------------------------------------- */

  function initMotion() {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          reveal.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
  }

  /* ---------------------------------------------------------
   * 1. Genealogy rail
   * ------------------------------------------------------- */

  function renderLineage() {
    const track = $("lineageTrack");
    const detail = $("lineageDetail");
    const items = DATA.timelineMarkers;

    track.innerHTML = items
      .map(
        (item, idx) => `
        <button type="button" class="lineage-year" data-marker="${idx}" aria-pressed="${
          idx === activeMarkerIdx
        }">
          <b class="num">${item.year}</b>
          <span>${escapeHtml(item.domain)}</span>
        </button>`
      )
      .join("");

    const current = items[activeMarkerIdx] || items[0];
    const source = DATA.sources.find((s) => s.id === current.sourceId);
    detail.innerHTML = `
      <span class="year num">${current.year}</span>
      <p>
        <strong>${escapeHtml(current.domain)}</strong>
        ${escapeHtml(current.label)}
        ${
          source
            ? `<br><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Source: ${escapeHtml(
                source.cite
              )}</a>`
            : ""
        }
      </p>
    `;

    track.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeMarkerIdx = Number(btn.dataset.marker);
        renderLineage();
      });
    });
  }

  /* ---------------------------------------------------------
   * 2. Atlas
   * ------------------------------------------------------- */

  function filteredDomains() {
    return DATA.domains.filter(
      (d) =>
        (activeCategory === "All" || d.category === activeCategory) &&
        (activeArchetype === "all" || d.archetype === activeArchetype)
    );
  }

  function renderAtlasFilters() {
    const categories = ["All", ...new Set(DATA.domains.map((d) => d.category))];
    $("categoryFilters").innerHTML =
      `<span class="label">Field</span>` +
      categories
        .map(
          (cat) =>
            `<button type="button" class="chip" data-cat="${escapeHtml(cat)}" aria-pressed="${
              cat === activeCategory
            }">${escapeHtml(cat)}</button>`
        )
        .join("");

    const shapes = [
      { id: "all", name: "All shapes", summary: `Show all ${DATA.domains.length} movements, whatever their shape.`, movements: [] },
      ...DATA.archetypes.map((arch) => ({
        id: arch.id,
        name: arch.name,
        summary: arch.summary,
        movements: DATA.domains.filter((d) => d.archetype === arch.id)
      }))
    ];
    $("archetypeFilters").innerHTML =
      `<span class="label">Wave shape</span><div class="shape-cards">` +
      shapes
        .map(
          (shape) => `
          <button type="button" class="shape-card" data-arch="${escapeHtml(shape.id)}" aria-pressed="${
            shape.id === activeArchetype
          }">
            <strong>${escapeHtml(shape.name)}</strong>
            <span>${escapeHtml(shape.summary)}</span>
            ${shape.movements.map((d) => `<span class="shape-movement">${escapeHtml(d.title)}</span>`).join("")}
          </button>`
        )
        .join("") +
      `</div>`;
    $("categoryFilters")
      .querySelectorAll("button")
      .forEach((btn) =>
        btn.addEventListener("click", () => {
          activeCategory = btn.dataset.cat;
          ensureValidDomain();
          renderAtlas();
        })
      );

    $("archetypeFilters")
      .querySelectorAll("button")
      .forEach((btn) =>
        btn.addEventListener("click", () => {
          activeArchetype = btn.dataset.arch;
          ensureValidDomain();
          renderAtlas();
        })
      );
  }



  function openInAtlas(domainId) {
    activeDomainId = domainId;
    activeCategory = "All";
    activeArchetype = "all";
    renderAtlas();
    $("atlas").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function ensureValidDomain() {
    let list = filteredDomains();
    if (!list.length) {
      activeArchetype = "all";
      list = filteredDomains();
    }
    if (list.length && !list.some((d) => d.id === activeDomainId)) {
      activeDomainId = list[0].id;
    }
  }

  function renderAtlas() {
    renderAtlasFilters();

    const list = filteredDomains();
    $("movementList").innerHTML = list
      .map((d, i) => {
        const selected = d.id === activeDomainId;
        return `
        <button type="button" role="tab" class="movement" id="tab-${escapeHtml(d.id)}"
          data-domain="${escapeHtml(d.id)}" aria-selected="${selected}"
          aria-controls="movementDetail" tabindex="${selected ? "0" : "-1"}">
          <span class="idx num">${String(i + 1).padStart(2, "0")}</span>
          <span class="title">${escapeHtml(d.title)}</span>
          <span class="cat">${escapeHtml(d.category)}</span>
        </button>`;
      })
      .join("");

    $("movementList")
      .querySelectorAll("button")
      .forEach((btn) =>
        btn.addEventListener("click", () => {
          activeDomainId = btn.dataset.domain;
          renderAtlas();
        })
      );

    renderMovementDetail();
  }

  function renderMovementDetail() {
    const stage = $("movementDetail");
    const domain =
      DATA.domains.find((d) => d.id === activeDomainId) || filteredDomains()[0] || DATA.domains[0];
    const arch = DATA.archetypes.find((a) => a.id === domain.archetype);

    stage.setAttribute("aria-labelledby", `tab-${domain.id}`);

    const wavesHtml = domain.waves
      .map(
        (w) => `
        <div class="wave-row">
          <div class="wave-key">
            <span class="n">${escapeHtml(w.num)}</span>
            <span class="era num">${escapeHtml(w.era)}</span>
            ${w.contested ? '<span class="tag tag-accent">Still argued over</span>' : ""}
          </div>
          <div class="wave-body">
            <h4>${escapeHtml(w.name)}</h4>
            <dl>
              <div><dt>Spark</dt><dd>${escapeHtml(w.spark)}</dd></div>
              <div><dt>What shifted</dt><dd>${escapeHtml(w.shift)}</dd></div>
              <div><dt>Blind spot</dt><dd class="blind">${escapeHtml(w.blindSpot)}</dd></div>
            </dl>
            <div class="exemplar-row" aria-label="Representative examples">
              ${w.exemplars
                .map((ex) => `<span class="tag">${escapeHtml(ex)}</span>`)
                .join("")}
            </div>
          </div>
        </div>`
      )
      .join("");

    stage.innerHTML = `
      <header class="detail-head">
        <div>
          <div class="exemplar-row">
            <span class="tag">${escapeHtml(domain.category)}</span>
            <span class="tag tag-accent">${escapeHtml(domain.labelStatus)}</span>
          </div>
          <h3>${escapeHtml(domain.title)}</h3>
          <p class="detail-sub">${escapeHtml(domain.subtitle)}</p>
        </div>
        <dl class="detail-meta">
          <div>
            <dt>Named by</dt>
            <dd>${escapeHtml(domain.coinedBy)}</dd>
          </div>
          ${
            arch
              ? `<div>
                   <dt>Wave shape</dt>
                   <dd>${escapeHtml(arch.name)}</dd>
                 </div>`
              : ""
          }
        </dl>
      </header>

      <div class="detail-notes">
        <section>
          <h4>How the label caught on</h4>
          <p>${escapeHtml(domain.originHook)}</p>
        </section>
        <section>
          <h4>What gets relit each time</h4>
          <p>${escapeHtml(domain.relitDynamic)}</p>
        </section>
      </div>

      <div class="wave-stack">${wavesHtml}</div>

      <div class="critique">
        <h4>Where this bends</h4>
        <p>${escapeHtml(domain.critique)}</p>
      </div>
    `;
  }

  /* ---------------------------------------------------------
   * 3. Everyday scenes
   * ------------------------------------------------------- */

  function renderScenes() {
    $("sceneButtons").innerHTML = DATA.everydayScenes
      .map(
        (s) =>
          `<button type="button" class="chip" data-scene="${escapeHtml(s.id)}" aria-pressed="${
            s.id === activeSceneId
          }">${escapeHtml(s.title)}</button>`
      )
      .join("");

    $("sceneButtons")
      .querySelectorAll("button")
      .forEach((btn) =>
        btn.addEventListener("click", () => {
          activeSceneId = btn.dataset.scene;
          renderScenes();
        })
      );

    const scene =
      DATA.everydayScenes.find((s) => s.id === activeSceneId) || DATA.everydayScenes[0];
    $("sceneDomain").textContent = scene.domain;

    $("sceneCards").innerHTML = scene.waves
      .map(
        (w) => `
        <article class="scene-card">
          <span class="scene-wave">${escapeHtml(w.wave)}</span>
          <h3>${escapeHtml(w.headline)}</h3>
          <p>${escapeHtml(w.detail)}</p>
          <div class="meters">
            <p class="meters-note">This guide's reading of each version, not a measurement</p>
            <div class="meter">
              <span>Origin details</span>
              <span class="track"><i style="width:${w.metrics.provenance}%"></i></span>
              <span class="v num">${w.metrics.provenance}</span>
            </div>
            <div class="meter">
              <span>Uniformity</span>
              <span class="track"><i style="width:${w.metrics.standardization}%"></i></span>
              <span class="v num">${w.metrics.standardization}</span>
            </div>
            <div class="meter">
              <span>Craft visible</span>
              <span class="track"><i style="width:${w.metrics.craftTransparency}%"></i></span>
              <span class="v num">${w.metrics.craftTransparency}</span>
            </div>
          </div>
        </article>`
      )
      .join("");

    const linked = DATA.domains.find((d) => d.id === scene.domainId);
    $("sceneAtlasLink").innerHTML = `<button type="button" class="btn btn-ghost atlas-link-btn" data-domain="${escapeHtml(linked.id)}">Open ${escapeHtml(linked.title)} in the atlas</button>`;
    $("sceneAtlasLink")
      .querySelectorAll(".atlas-link-btn")
      .forEach((btn) => btn.addEventListener("click", () => openInAtlas(btn.dataset.domain)));
  }

  /* ---------------------------------------------------------
   * 4. Comparator and sandbox
   * ------------------------------------------------------- */

  function initComparator() {
    const options = DATA.domains
      .map((d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.title)}</option>`)
      .join("");

    $("compareLeft").innerHTML = options;
    $("compareRight").innerHTML = options;
    $("compareLeft").value = "coffee";
    $("compareRight").value = "sociolinguistics";

    $("compareLeft").addEventListener("change", renderComparison);
    $("compareRight").addEventListener("change", renderComparison);
    renderComparison();
  }

  function renderComparison() {
    const left = DATA.domains.find((d) => d.id === $("compareLeft").value) || DATA.domains[0];
    const right = DATA.domains.find((d) => d.id === $("compareRight").value) || DATA.domains[1];

    $("thLeft").textContent = left.title;
    $("thRight").textContent = right.title;

    const waveRow = (n) => [
      `${left.waves[n] ? left.waves[n].num : "Later"}`,
      left.waves[n]
        ? `${left.waves[n].name} (${left.waves[n].era})`
        : "Earlier waves remain active layers",
      right.waves[n]
        ? `${right.waves[n].name} (${right.waves[n].era})`
        : "Earlier waves remain active layers"
    ];

    const rows = [
      ["Label status", left.labelStatus, right.labelStatus],
      ["Named by", left.coinedBy, right.coinedBy],
      waveRow(0),
      waveRow(1),
      waveRow(2),
      waveRow(3)
    ];

    $("compareBody").innerHTML = rows
      .map(
        ([label, a, b]) => `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td>${escapeHtml(a)}</td>
          <td>${escapeHtml(b)}</td>
        </tr>`
      )
      .join("");

    const leftArch = DATA.archetypes.find((a) => a.id === left.archetype);
    const rightArch = DATA.archetypes.find((a) => a.id === right.archetype);

    let insight;
    if (left.id === right.id) {
      insight =
        "Same movement on both sides. Pick a second field to see where the engines diverge.";
    } else if (left.archetype === right.archetype) {
      insight = `Same engine. Both run on ${leftArch.short.toLowerCase()}. ${leftArch.summary}`;
    } else {
      insight = `Different engines. ${left.title} runs on ${leftArch.short.toLowerCase()}, where each wave ${left.axes.goal[2].toLowerCase()}. ${right.title} runs on ${rightArch.short.toLowerCase()}, where each wave ${right.axes.goal[2].toLowerCase()}. The shared habit is the numbering, not the mechanism.`;
    }

    $("compareInsight").innerHTML = `<span class="label">Reading</span><p>${escapeHtml(insight)}</p>`;
  }

  function initSandbox() {
    const presetWrap = $("presetButtons");

    presetWrap.innerHTML = DATA.customWavePresets
      .map(
        (p, idx) =>
          `<button type="button" class="chip" data-preset="${idx}" aria-pressed="false">${escapeHtml(
            p.name
          )}</button>`
      )
      .join("");

    function loadPreset(idx) {
      const preset = DATA.customWavePresets[idx];
      if (!preset) return;
      $("customName").value = preset.name;
      $("customW1").value = preset.w1;
      $("customW2").value = preset.w2;
      $("customW3").value = preset.w3;
      $("customMech").value = preset.mechanism;
      presetWrap.querySelectorAll("button").forEach((btn, i) => {
        btn.setAttribute("aria-pressed", String(i === idx));
      });
      renderSandbox();
    }

    presetWrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => loadPreset(Number(btn.dataset.preset)));
    });

    ["customName", "customW1", "customW2", "customW3", "customMech"].forEach((id) => {
      const el = $(id);
      el.addEventListener("input", () => {
        presetWrap
          .querySelectorAll("button")
          .forEach((btn) => btn.setAttribute("aria-pressed", "false"));
        renderSandbox();
      });
      el.addEventListener("change", renderSandbox);
    });

    $("customMech").innerHTML = DATA.archetypes
      .map((arch) => `<option value="${escapeHtml(arch.id)}">${escapeHtml(arch.short)}</option>`)
      .join("");

    loadPreset(0);
  }

  function renderSandbox() {
    const name = $("customName").value.trim() || "Your domain";
    const w1 = $("customW1").value.trim() || "The version everyone already has";
    const w2 = $("customW2").value.trim() || "The polished, branded, or institutional version";
    const w3 = $("customW3").value.trim() || "The specific or dissenting version";
    const mech = $("customMech").value;

    const arch = DATA.archetypes.find((a) => a.id === mech) || DATA.archetypes[0];
    const titles = new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(
      DATA.domains.filter((d) => d.archetype === arch.id).map((d) => d.title)
    );
    const diagnosis = `${arch.summary} Reads like ${titles}.`;

    $("builderPreview").innerHTML = `
      <header>
        <span class="label">Working draft</span>
        <h3>Three waves of ${escapeHtml(name)}</h3>
      </header>
      <ol>
        <li><span><b>Wave 1.</b> ${escapeHtml(w1)}</span></li>
        <li><span><b>Wave 2.</b> ${escapeHtml(w2)}</span></li>
        <li><span><b>Wave 3.</b> ${escapeHtml(w3)}</span></li>
      </ol>
      <p class="wave-verdict"><b>Diagnosis.</b> ${escapeHtml(diagnosis)}</p>
    `;
  }

  /* ---------------------------------------------------------
   * 5. Metaphor lab
   * ------------------------------------------------------- */

  function buildPath(points) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  }

  function initPhysicsLab() {
    ["modeOcean", "modeRadio"].forEach((id) => {
      $(id).addEventListener("click", () => {
        physicsMode = id === "modeOcean" ? "ocean" : "radio";
        $("modeOcean").setAttribute("aria-pressed", String(physicsMode === "ocean"));
        $("modeRadio").setAttribute("aria-pressed", String(physicsMode === "radio"));
        renderPhysics();
      });
    });

    ["persistSlider", "undertowSlider", "grassrootsSlider"].forEach((id) => {
      $(id).addEventListener("input", renderPhysics);
    });

    $("labMovement").innerHTML = DATA.domains
      .map((d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.title)}</option>`)
      .join("");
    $("labMovement").value = "feminism";
    $("labMovement").addEventListener("change", renderLabMovement);
    renderLabMovement();

    renderPhysics();
  }

  function renderPhysics() {
    const persist = Number($("persistSlider").value) / 100;
    const undertow = Number($("undertowSlider").value) / 100;
    const grassroots = Number($("grassrootsSlider").value) / 100;

    $("persistOut").textContent = `${Math.round(persist * 100)}%`;
    $("undertowOut").textContent = `${Math.round(undertow * 100)}%`;
    $("grassrootsOut").textContent = `${Math.round(grassroots * 100)}%`;

    const W = 560;
    const H = 280;
    const baseY = 238;
    const xs = [];
    for (let x = 24; x <= 536; x += 6) xs.push(x);

    const svg = $("physicsSvg");
    const paper = "#faf9f6";
    const rule = "#e4e0d7";
    const inkFaint = "#97928a";

    if (physicsMode === "ocean") {
      const swell = (x, center, width, amp) => {
        const z = (x - center) / width;
        const peak = Math.exp(-z * z) * amp;
        const tail = x > center ? amp * persist * 0.46 * (1 - Math.exp(-(x - center) / 64)) : 0;
        const dip =
          x > center + width * 0.55
            ? Math.exp(-Math.pow((x - (center + width * 1.3)) / (width * 0.7), 2)) * amp * undertow * 0.6
            : 0;
        return Math.max(2, peak + tail - dip);
      };

      const wave1 = xs.map((x) => [x, baseY - swell(x, 120, 50, 96)]);
      const wave2 = xs.map((x) => [x, baseY - swell(x, 285, 54, 116)]);
      const wave3 = xs.map((x) => [x, baseY - swell(x, 450, 50, 136)]);
      const activity = xs.map((x, i) => [
        x,
        baseY - (10 + grassroots * 52 + Math.sin(i * 0.45) * (3 + grassroots * 9))
      ]);

      svg.innerHTML = `
        <rect width="${W}" height="${H}" fill="${paper}"/>
        ${[60, 110, 160, 210]
          .map((y) => `<line x1="24" y1="${y}" x2="536" y2="${y}" stroke="${rule}" stroke-width="1"/>`)
          .join("")}
        <line x1="24" y1="${baseY}" x2="536" y2="${baseY}" stroke="#cfc9bd" stroke-width="1"/>
        <text x="120" y="${baseY + 20}" text-anchor="middle" font-size="11" fill="${inkFaint}">Era 1</text>
        <text x="202" y="${baseY + 20}" text-anchor="middle" font-size="11" fill="${inkFaint}">trough</text>
        <text x="285" y="${baseY + 20}" text-anchor="middle" font-size="11" fill="${inkFaint}">Era 2</text>
        <text x="367" y="${baseY + 20}" text-anchor="middle" font-size="11" fill="${inkFaint}">trough</text>
        <text x="450" y="${baseY + 20}" text-anchor="middle" font-size="11" fill="${inkFaint}">Era 3</text>
        <path d="${buildPath(activity)}" fill="none" stroke="#2f6663" stroke-width="1.8" stroke-dasharray="5 4"/>
        <path d="${buildPath(wave1)}" fill="none" stroke="#b6afa2" stroke-width="2"/>
        <path d="${buildPath(wave2)}" fill="none" stroke="#8d867a" stroke-width="2"/>
        <path d="${buildPath(wave3)}" fill="none" stroke="#a2603a" stroke-width="2.4"/>
      `;

      $("modelExplanation").innerHTML = `
        <strong>Ocean swell, the textbook reading</strong>
        Good for the big public turning points: 1920 suffrage, Earth Day in 1970, the pour over
        bar. Raise persistence and the empty troughs fill with the coffee, therapy, or organizing
        that never stopped.
      `;

      $("physicsReadout").textContent =
        persist < 0.15
          ? "With persistence near zero this is the mythic version, where everyone supposedly threw out the previous era the day the new one arrived."
          : undertow > 0.45
          ? "Strong undertow. Each crest is followed by a visible dip, which is Huntington's reverse wave rather than a clean replacement."
          : `Each crest keeps about ${Math.round(persist * 100)} percent of its reach afterward, and the dashed line shows activity that never shows up in the archive of famous peaks.`;
    } else {
      const channel = (rowY, freq, phase, center, amp) =>
        xs.map((x, i) => {
          const z = (x - center) / 140;
          const envelope = 0.3 + persist * 0.4 + Math.exp(-z * z) * 0.7;
          const jam = undertow * 0.5 * Math.sin(i * 0.9 + phase);
          return [x, rowY + Math.sin(i * freq + phase) * amp * Math.max(0.12, envelope - jam)];
        });

      const ch1 = channel(62, 0.55, 0.2, 140, 16);
      const ch2 = channel(118, 0.85, 1.3, 280, 16);
      const ch3 = channel(174, 1.2, 2.4, 430, 16);
      const ch4 = channel(226, 0.95, 0.7, 300, 8 + grassroots * 12);

      svg.innerHTML = `
        <rect width="${W}" height="${H}" fill="${paper}"/>
        ${[62, 118, 174, 226]
          .map((y) => `<line x1="24" y1="${y}" x2="536" y2="${y}" stroke="${rule}" stroke-width="1"/>`)
          .join("")}
        <text x="30" y="${62 - 12}" font-size="10" fill="#8d867a">Wave 1 layer</text>
        <text x="30" y="${118 - 12}" font-size="10" fill="#8d867a">Wave 2 layer</text>
        <text x="30" y="${174 - 12}" font-size="10" fill="#a2603a">Wave 3 layer</text>
        <text x="30" y="${226 - 12}" font-size="10" fill="#2f6663">Unarchived local work</text>
        <path d="${buildPath(ch1)}" fill="none" stroke="#b6afa2" stroke-width="2"/>
        <path d="${buildPath(ch2)}" fill="none" stroke="#8d867a" stroke-width="2"/>
        <path d="${buildPath(ch3)}" fill="none" stroke="#a2603a" stroke-width="2.2"/>
        <path d="${buildPath(ch4)}" fill="none" stroke="#2f6663" stroke-width="1.8"/>
      `;

      $("modelExplanation").innerHTML = `
        <strong>Radio frequencies, Hewitt's alternative</strong>
        No single crest replaces another. Signals sit on separate channels, some loud for a decade
        and some permanently faint, and interference is a real condition rather than a gap.
      `;

      $("physicsReadout").textContent =
        "Four frequencies at once. On one block today you can buy a canned first wave coffee, a second wave caramel latte, and a third wave single origin pour over, while the people who never got written down keep broadcasting.";
    }
  }
  function renderLabMovement() {
    const domain = DATA.domains.find((d) => d.id === $("labMovement").value);
    $("labMovementDetail").innerHTML = `
      <p>${escapeHtml(domain.critique)}</p>
      <button type="button" class="btn btn-ghost atlas-link-btn" data-domain="${escapeHtml(domain.id)}">See ${escapeHtml(domain.title)} in the atlas</button>
    `;
    $("labMovementDetail")
      .querySelectorAll(".atlas-link-btn")
      .forEach((btn) => btn.addEventListener("click", () => openInAtlas(btn.dataset.domain)));
  }

  /* ---------------------------------------------------------
   * 6. Quiz
   * ------------------------------------------------------- */

  function renderQuiz() {
    const letters = ["A", "B", "C"];

    $("quizList").innerHTML = DATA.quizScenarios
      .map((q, qIdx) => {
        const picked = quizAnswers[q.id];
        const answered = typeof picked === "number";
        const chosen = answered ? q.choices[picked] : null;
        const domain = DATA.domains.find((d) => d.id === q.domainId);

        return `
        <article class="quiz-item">
          <p class="label">Case ${qIdx + 1}</p>
          <div>
            <p class="quiz-prompt">${escapeHtml(q.prompt)}</p>
            <p class="quiz-question">${escapeHtml(q.question)}</p>
            <div class="quiz-options">
              ${q.choices
                .map((c, cIdx) => {
                  let cls = "quiz-opt";
                  if (picked === cIdx) cls += c.correct ? " selected-right" : " selected-wrong";
                  return `<button type="button" class="${cls}" data-qid="${escapeHtml(
                    q.id
                  )}" data-cidx="${cIdx}" data-letter="${letters[cIdx] || "D"}"
                    aria-pressed="${picked === cIdx}">${escapeHtml(c.label)}</button>`;
                })
                .join("")}
            </div>
            ${
              chosen
                ? `<p class="quiz-feedback ${chosen.correct ? "right" : ""}">${
                    chosen.correct ? "Correct. " : "Not quite. "
                  }${escapeHtml(chosen.feedback)}</p>
            <button type="button" class="btn btn-ghost atlas-link-btn" data-domain="${escapeHtml(
              domain.id
            )}">See ${escapeHtml(domain.title)} in the atlas</button>`
                : ""
            }
          </div>
        </article>`;
      })
      .join("");

    $("quizList")
      .querySelectorAll(".quiz-opt")
      .forEach((btn) =>
        btn.addEventListener("click", () => {
          quizAnswers[btn.dataset.qid] = Number(btn.dataset.cidx);
          renderQuiz();
        })
      );

    $("quizList")
      .querySelectorAll(".atlas-link-btn")
      .forEach((btn) => btn.addEventListener("click", () => openInAtlas(btn.dataset.domain)));

    const total = DATA.quizScenarios.length;
    const answeredCount = Object.keys(quizAnswers).length;
    const correctCount = DATA.quizScenarios.filter(
      (q) => typeof quizAnswers[q.id] === "number" && q.choices[quizAnswers[q.id]].correct
    ).length;

    $("quizScore").innerHTML = `
      <span>Answered <strong class="num">${answeredCount} of ${total}</strong></span>
      <span>Correct <strong class="num">${correctCount} of ${total}</strong></span>
    `;
  }

  /* ---------------------------------------------------------
   * 7. Glossary and sources
   * ------------------------------------------------------- */

  function initGlossary() {
    const input = $("glossarySearch");
    const grid = $("glossaryGrid");
    const empty = $("glossaryEmpty");
    const count = $("glossaryCount");

    function update() {
      const q = input.value.trim().toLowerCase();
      const matches = DATA.glossary.filter(
        (g) => !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q)
      );

      empty.hidden = matches.length > 0;
      count.textContent = q
        ? `${matches.length} of ${DATA.glossary.length} terms`
        : `${DATA.glossary.length} terms`;

      grid.innerHTML = matches
        .map(
          (g) => `
          <div>
            <dt>${escapeHtml(g.term)}</dt>
            <dd>${escapeHtml(g.def)}</dd>
          </div>`
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
        <li class="source">
          <div>
            <span class="domain">${escapeHtml(s.domain)}</span>
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              s.cite
            )}</a>
            <p>${escapeHtml(s.note)}</p>
          </div>
        </li>`
      )
      .join("");
  }

  /* ---------------------------------------------------------
   * Boot
   * ------------------------------------------------------- */

  initNavigation();
  initMotion();
  renderLineage();
  renderAtlas();
  renderScenes();
  initComparator();
  initSandbox();
  initPhysicsLab();
  renderQuiz();
  initGlossary();
  renderSources();
})();
