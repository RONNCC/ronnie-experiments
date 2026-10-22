/* ============================================================
   Stage 0 Interactive Simulation:
   Microscopic Cerebral Blood Vessel — "The Two Safety Brakes"
   ============================================================ */

(function () {
  function initVesselSim() {
    const canvas = document.getElementById("vesselCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const state = {
      preset: "normal",
      doacLevel: 0.0,       // 0 = none, 0.78 = therapeutic DOAC
      alcoholLevel: 0.0,    // 0 = sober, 0.85 = binge
      bpMmHg: 120,          // 105 .. 180 systolic
      tearXNorm: 0.52,
      tearWidth: 58,
      elapsed: 0,
      plugProgress: 0,      // 0..1 platelet mound coverage
      fibrinProgress: 0,    // 0..1 fibrin mesh cross-linking
      leakedVolume: 0,      // simulated mL micro-leak index
      sealedAtSec: null,
      rbcs: [],
      platelets: [],
      escapedRbcs: [],
      flares: []
    };

    const W = 760;
    const H = 370;
    const WALL_TOP = 138;
    const WALL_BOT = 292;

    function resetParticles(fullResetLeak) {
      state.elapsed = 0;
      state.plugProgress = 0;
      state.fibrinProgress = 0;
      state.sealedAtSec = null;
      if (fullResetLeak !== false) {
        state.leakedVolume = 0;
        state.escapedRbcs = [];
      }
      state.flares = [];

      if (state.rbcs.length === 0) {
        for (let i = 0; i < 64; i++) {
          state.rbcs.push({
            x: Math.random() * W,
            y: WALL_TOP + 18 + Math.random() * (WALL_BOT - WALL_TOP - 36),
            vx: 1.35 + Math.random() * 0.9,
            rot: Math.random() * Math.PI * 2,
            r: 7.5 + Math.random() * 2.5
          });
        }
        for (let i = 0; i < 28; i++) {
          state.platelets.push({
            x: Math.random() * W,
            y: WALL_TOP + 12 + Math.random() * (WALL_BOT - WALL_TOP - 24),
            vx: 1.5 + Math.random() * 0.8,
            state: "free", // free | stuck | slipping
            tx: 0,
            ty: 0,
            slipTimer: 0
          });
        }
      } else {
        state.platelets.forEach((p) => {
          p.state = "free";
          p.x = Math.random() * W;
          p.y = WALL_TOP + 12 + Math.random() * (WALL_BOT - WALL_TOP - 24);
        });
      }
    }

    const PRESETS = {
      normal: {
        doac: 0.0,
        alc: 0.0,
        bp: 120,
        explain:
          "<strong>1. Healthy Baseline (Both Brakes Working):</strong> Within seconds of a tiny vessel tear, <strong>Platelets (yellow sandbags)</strong> spot exposed wall fibers, fire chemical SOS flares (TXA2), and pile in. Right behind them, <strong>Factor Xa → Thrombin → Fibrin (teal cables)</strong> weaves steel-like mesh over the plug. Leak sealed almost immediately!"
      },
      doacOnly: {
        doac: 0.78,
        alc: 0.0,
        bp: 120,
        explain:
          "<strong>2. Eliquis / DOAC Alone (Taken As Prescribed):</strong> Look closely at why millions of people take Eliquis safely every day! Even though <strong>Brake #2 (teal Fibrin cables)</strong> is intentionally dialed down so dangerous leg/heart clots can't grow, your <strong>Platelets (Brake #1)</strong> are 100% healthy and still rush in to plug everyday microscopic vessel wear!"
      },
      alcoholOnly: {
        doac: 0.0,
        alc: 0.82,
        bp: 148,
        explain:
          "<strong>3. Heavy Alcohol Alone:</strong> Alcohol blocks platelet SOS flares (<strong>TXA2</strong>) so yellow platelets turn slippery and wash past the tear, while rising blood pressure pushes harder on the wall. Natural <strong>Fibrin cables (Brake #2)</strong> eventually try to catch up, creating a slower, messier seal after extra bleeding."
      },
      combo: {
        doac: 0.78,
        alc: 0.85,
        bp: 158,
        explain:
          "<strong>4. DANGER — Eliquis + Heavy Alcohol ('Both Brakes Cut!'):</strong> Watch the gap now: <strong>Alcohol makes platelets slip right off the tear</strong> (Brake #1 stunned) WHILE <strong>Eliquis blocks Factor Xa from weaving Fibrin mesh</strong> (Brake #2 off) — AND alcohol blood-pressure surge forces blood cells straight out into surrounding brain tissue continuously!"
      }
    };

    function applyPreset(name) {
      const p = PRESETS[name] || PRESETS.normal;
      state.preset = name;
      state.doacLevel = p.doac;
      state.alcoholLevel = p.alc;
      state.bpMmHg = p.bp;

      document.querySelectorAll("[data-vessel-preset]").forEach((btn) => {
        const active = btn.dataset.vesselPreset === name;
        btn.classList.toggle("is-active", active);
      });

      const bpSlider = document.getElementById("vesselBpSlider");
      const bpVal = document.getElementById("vesselBpVal");
      if (bpSlider) bpSlider.value = String(p.bp);
      if (bpVal) bpVal.textContent = p.bp + " / " + Math.round(p.bp * 0.64) + " mmHg";

      const explainEl = document.getElementById("vesselLiveExplain");
      if (explainEl) explainEl.innerHTML = p.explain;

      resetParticles(true);
    }

    // Bind preset buttons
    document.querySelectorAll("[data-vessel-preset]").forEach((btn) => {
      btn.addEventListener("click", () => applyPreset(btn.dataset.vesselPreset));
    });

    // Bind BP slider
    const bpSlider = document.getElementById("vesselBpSlider");
    if (bpSlider) {
      bpSlider.addEventListener("input", () => {
        state.bpMmHg = Number(bpSlider.value);
        const bpVal = document.getElementById("vesselBpVal");
        if (bpVal) {
          bpVal.textContent =
            state.bpMmHg + " / " + Math.round(state.bpMmHg * 0.64) + " mmHg";
        }
        // High BP shear can dislodge un-crosslinked weak plugs
        if (state.bpMmHg > 152 && state.fibrinProgress < 0.35) {
          state.plugProgress *= 0.72;
          state.sealedAtSec = null;
        }
      });
    }

    // Bind "Poke New Micro-Tear" button & canvas click
    const pokeBtn = document.getElementById("pokeTearBtn");
    if (pokeBtn) {
      pokeBtn.addEventListener("click", () => {
        state.tearXNorm = 0.35 + Math.random() * 0.34;
        resetParticles(true);
      });
    }

    canvas.addEventListener("click", (ev) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (ev.clientX - rect.left) / rect.width;
      state.tearXNorm = Math.max(0.24, Math.min(0.76, nx));
      resetParticles(true);
    });

    function stepSimulation(dt) {
      state.elapsed += dt;
      const tearX = state.tearXNorm * W;
      const halfGap = state.tearWidth * 0.5;

      const plateletStickiness = Math.max(0.08, 1 - state.alcoholLevel * 0.86);
      const fibrinRate = Math.max(0.04, 1 - state.doacLevel * 0.88);
      const pressureShear = (state.bpMmHg - 100) / 80; // ~0.25 normal, ~0.85 high

      // Effective seal requires either strong platelet + moderate BP OR platelet + fibrin
      const shearWashout =
        pressureShear * (1 - state.fibrinProgress * 0.88) * (0.28 + state.alcoholLevel * 0.65);

      const plugGain = plateletStickiness * 0.42 * dt;
      const plugLoss = shearWashout * 0.27 * dt;
      state.plugProgress = Math.max(0, Math.min(1, state.plugProgress + plugGain - plugLoss));

      // Fibrin grows primarily on activated platelet phospholipid membranes!
      // Biologically: prothrombinase (Factor Xa + Va) assembles on stuck platelet surfaces.
      const surfaceFactor = 0.04 + Math.pow(state.plugProgress, 1.35) * 0.96;
      state.fibrinProgress = Math.max(
        0,
        Math.min(1, state.fibrinProgress + fibrinRate * surfaceFactor * 0.34 * dt)
      );

      const effectiveSeal = Math.min(
        1,
        state.plugProgress * (0.72 + 0.28 * (1 - pressureShear * 0.5)) +
          state.fibrinProgress * 0.48
      );

      const openFraction = Math.max(0, 1 - effectiveSeal);
      if (openFraction <= 0.05 && state.sealedAtSec === null) {
        state.sealedAtSec = state.elapsed;
      }

      // Leak rate proportional to open fraction * arterial pressure
      if (openFraction > 0.04) {
        state.leakedVolume += openFraction * (0.55 + pressureShear * 1.45) * dt * 1.8;
      }

      const speedScale = 0.82 + pressureShear * 0.72;

      // Update RBCs
      for (let i = 0; i < state.rbcs.length; i++) {
        const r = state.rbcs[i];
        r.x += r.vx * speedScale * 60 * dt;
        r.rot += 0.9 * dt;

        // Suction toward unsealed tear near top wall
        const dx = tearX - r.x;
        if (
          openFraction > 0.08 &&
          Math.abs(dx) < halfGap * 1.15 &&
          r.y < WALL_TOP + 54 &&
          Math.random() < openFraction * (0.14 + pressureShear * 0.22)
        ) {
          if (state.escapedRbcs.length < 130) {
            state.escapedRbcs.push({
              x: tearX + (Math.random() - 0.5) * state.tearWidth * 0.65,
              y: WALL_TOP - 4,
              vx: (Math.random() - 0.5) * 42,
              vy: -(26 + pressureShear * 52 + Math.random() * 24),
              r: r.r * 0.92,
              age: 0
            });
          }
          r.x = -12;
          r.y = WALL_TOP + 20 + Math.random() * (WALL_BOT - WALL_TOP - 40);
        }

        if (r.x > W + 16) {
          r.x = -16;
          r.y = WALL_TOP + 18 + Math.random() * (WALL_BOT - WALL_TOP - 36);
        }
      }

      // Update escaped RBCs in perivascular brain tissue
      for (let i = 0; i < state.escapedRbcs.length; i++) {
        const e = state.escapedRbcs[i];
        e.age += dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= 0.95;
        e.vy *= 0.94;
        if (e.y < 24) {
          e.y = 24;
          e.vx += (Math.random() - 0.5) * 18;
        }
      }

      // Update Platelets
      const targetStuckCount = Math.round(state.plugProgress * 18);
      let currentStuck = 0;
      for (const p of state.platelets) {
        if (p.state === "stuck") currentStuck++;
      }

      for (let i = 0; i < state.platelets.length; i++) {
        const p = state.platelets[i];
        if (p.state === "stuck") {
          if (currentStuck > targetStuckCount && Math.random() < 0.15) {
            p.state = "slipping";
            p.slipTimer = 0.6;
            currentStuck--;
          }
          continue;
        }

        p.x += p.vx * speedScale * 60 * dt;
        if (p.state === "slipping") {
          p.y += 18 * dt;
          p.slipTimer -= dt;
          if (p.slipTimer <= 0) p.state = "free";
        } else if (Math.abs(p.x - tearX) < halfGap + 18 && p.y < WALL_TOP + 52) {
          if (currentStuck < targetStuckCount && Math.random() < plateletStickiness * 0.45) {
            p.state = "stuck";
            p.tx = tearX + (Math.random() - 0.5) * state.tearWidth * 0.86;
            p.ty = WALL_TOP + (Math.random() - 0.35) * 16;
            currentStuck++;
            if (state.flares.length < 8) {
              state.flares.push({ x: p.tx, y: p.ty, r: 4, alpha: 0.9 });
            }
          } else if (state.alcoholLevel > 0.4) {
            // Visually bounce off tear!
            p.state = "slipping";
            p.slipTimer = 0.5;
          }
        }

        if (p.x > W + 14) {
          p.x = -14;
          p.y = WALL_TOP + 12 + Math.random() * (WALL_BOT - WALL_TOP - 24);
          p.state = "free";
        }
      }

      for (let i = state.flares.length - 1; i >= 0; i--) {
        state.flares[i].r += 34 * dt;
        state.flares[i].alpha -= 1.25 * dt;
        if (state.flares[i].alpha <= 0) state.flares.splice(i, 1);
      }

      updateReadouts(plateletStickiness, fibrinRate, effectiveSeal);
    }

    function updateReadouts(plateletStickiness, fibrinRate, effectiveSeal) {
      const pEl = document.getElementById("meterPlatelet");
      const fEl = document.getElementById("meterFibrin");
      const sEl = document.getElementById("meterSeal");
      const lEl = document.getElementById("meterLeak");

      if (pEl) {
        const pct = Math.round(plateletStickiness * 100);
        pEl.textContent = pct + "% active";
        pEl.style.color = pct > 70 ? "#f7c948" : "#ff8b5a";
      }
      if (fEl) {
        const pct = Math.round(state.fibrinProgress * 100);
        fEl.textContent = pct + "% woven";
        fEl.style.color = fibrinRate > 0.5 ? "#39d2c0" : "#79b8ff";
      }
      if (sEl) {
        if (state.sealedAtSec !== null) {
          sEl.textContent = "Sealed (" + state.sealedAtSec.toFixed(1) + "s)";
          sEl.style.color = "#3fb950";
        } else if (effectiveSeal > 0.55) {
          sEl.textContent = "Patching (" + Math.round(effectiveSeal * 100) + "%)";
          sEl.style.color = "#f7c948";
        } else {
          sEl.textContent = "LEAKING OPEN";
          sEl.style.color = "#ff5c6c";
        }
      }
      if (lEl) {
        lEl.textContent = state.leakedVolume.toFixed(1) + " units";
        lEl.style.color = state.leakedVolume > 8 ? "#ff5c6c" : "#eef4fb";
      }
    }

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Background: Delicate pink-violet surrounding brain parenchyma
      const brainGrad = ctx.createLinearGradient(0, 0, 0, WALL_TOP);
      brainGrad.addColorStop(0, "#151221");
      brainGrad.addColorStop(1, "#221829");
      ctx.fillStyle = brainGrad;
      ctx.fillRect(0, 0, W, WALL_TOP);

      // Subtle neural network fibers in brain tissue above vessel
      ctx.strokeStyle = "rgba(185, 158, 220, 0.10)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 9; i++) {
        const bx = 45 + i * 86;
        ctx.beginPath();
        ctx.arc(bx, 58 + (i % 2) * 28, 3.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx, 58 + (i % 2) * 28);
        ctx.lineTo(bx + 62, 48 + ((i + 1) % 2) * 34);
        ctx.stroke();
      }

      // Lower tissue below vessel
      ctx.fillStyle = "#141824";
      ctx.fillRect(0, WALL_BOT, W, H - WALL_BOT);

      // 2. Vessel Lumen
      const lumenGrad = ctx.createLinearGradient(0, WALL_TOP, 0, WALL_BOT);
      lumenGrad.addColorStop(0, "#2b0f18");
      lumenGrad.addColorStop(0.5, "#3d1420");
      lumenGrad.addColorStop(1, "#260d15");
      ctx.fillStyle = lumenGrad;
      ctx.fillRect(0, WALL_TOP, W, WALL_BOT - WALL_TOP);

      const tearX = state.tearXNorm * W;
      const leftEdge = tearX - state.tearWidth * 0.5;
      const rightEdge = tearX + state.tearWidth * 0.5;

      // Pooled hemorrhage cloud in brain tissue if leakedVolume > 0
      if (state.leakedVolume > 0.25) {
        const poolR = Math.min(135, 16 + Math.sqrt(state.leakedVolume) * 16);
        const poolGrad = ctx.createRadialGradient(
          tearX,
          WALL_TOP - 14,
          4,
          tearX,
          WALL_TOP - 24,
          poolR
        );
        poolGrad.addColorStop(0, "rgba(225, 38, 62, 0.72)");
        poolGrad.addColorStop(0.55, "rgba(190, 28, 52, 0.35)");
        poolGrad.addColorStop(1, "rgba(160, 20, 42, 0)");
        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.ellipse(tearX, WALL_TOP - 16, poolR * 1.35, poolR * 0.85, 0, Math.PI, Math.PI * 2);
        ctx.fill();
      }

      // Escaped RBCs in brain space
      for (const e of state.escapedRbcs) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.fillStyle = "#e63950";
        ctx.beginPath();
        ctx.ellipse(0, 0, e.r, e.r * 0.65, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Endothelial vessel walls (with gap at tearX!)
      function drawEndothelium(y, hasTear) {
        const cellW = 38;
        for (let x = 0; x < W + cellW; x += cellW) {
          if (hasTear && x + cellW > leftEdge && x < rightEdge) continue;
          ctx.fillStyle = "#4d3347";
          ctx.strokeStyle = "#8a5a7d";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(x + 1, y - 7, cellW - 3, 14, 6);
          ctx.fill();
          ctx.stroke();
        }
      }
      drawEndothelium(WALL_TOP, true);
      drawEndothelium(WALL_BOT, false);

      // Exposed subendothelial collagen fibers waving at the torn edges
      ctx.strokeStyle = "#ff9f43";
      ctx.lineWidth = 2;
      for (let side = -1; side <= 1; side += 2) {
        const baseX = side < 0 ? leftEdge : rightEdge;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(baseX, WALL_TOP + k * 2.5);
          ctx.quadraticCurveTo(
            baseX - side * 8,
            WALL_TOP + k * 4 - 4,
            baseX - side * 14,
            WALL_TOP + k * 3 + 3
          );
          ctx.stroke();
        }
      }

      // 4. Flowing RBCs inside vessel
      for (const r of state.rbcs) {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rot);
        ctx.fillStyle = "#d9384a";
        ctx.beginPath();
        ctx.ellipse(0, 0, r.r, r.r * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#9e1f2e";
        ctx.beginPath();
        ctx.ellipse(0, 0, r.r * 0.45, r.r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. TXA2 SOS chemical flares
      for (const fl of state.flares) {
        ctx.strokeStyle = `rgba(247, 201, 72, ${fl.alpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, fl.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 6. Platelets (Brake #1 — Yellow Sandbags)
      for (const p of state.platelets) {
        const px = p.state === "stuck" ? p.tx : p.x;
        const py = p.state === "stuck" ? p.ty : p.y;
        ctx.save();
        ctx.translate(px, py);

        if (p.state === "stuck") {
          // Activated spiky platelet!
          ctx.fillStyle = "#f7c948";
          ctx.strokeStyle = "#fff3b0";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const ang = (a / 6) * Math.PI * 2;
            const rOuter = 7.5;
            const rInner = 3.6;
            ctx.lineTo(Math.cos(ang) * rOuter, Math.sin(ang) * rOuter);
            ctx.lineTo(
              Math.cos(ang + Math.PI / 6) * rInner,
              Math.sin(ang + Math.PI / 6) * rInner
            );
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Smooth circulating disc (with orange "alcohol stunned" halo if alcohol active)
          if (state.alcoholLevel > 0.35) {
            ctx.strokeStyle = "rgba(255, 139, 90, 0.65)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 6.8, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = state.alcoholLevel > 0.35 ? "#e0a952" : "#f7c948";
          ctx.beginPath();
          ctx.ellipse(0, 0, 5.2, 3.3, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 7. Fibrin Mesh Strands (Brake #2 — Teal Rebar Cables across the tear!)
      if (state.fibrinProgress > 0.05) {
        const strandCount = Math.floor(state.fibrinProgress * 15);
        ctx.strokeStyle = `rgba(57, 210, 192, ${0.42 + state.fibrinProgress * 0.55})`;
        ctx.lineWidth = 2.1;
        for (let s = 0; s < strandCount; s++) {
          const frac = (s + 0.5) / 15;
          const x1 = leftEdge - 10 + frac * 18;
          const x2 = rightEdge + 10 - (1 - frac) * 18;
          const yOff = -7 + (s % 5) * 4.2;
          ctx.beginPath();
          ctx.moveTo(x1, WALL_TOP + yOff);
          ctx.quadraticCurveTo(
            tearX,
            WALL_TOP + (s % 2 === 0 ? -9 : 10),
            x2,
            WALL_TOP - yOff * 0.6
          );
          ctx.stroke();
        }
      }

      // 8. Clear On-Canvas Labels so zero guesswork is needed
      ctx.font = "700 11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "rgba(238, 244, 251, 0.78)";
      ctx.fillText("DELICATE BRAIN TISSUE (Sealed Inside Rigid Skull)", 16, 24);
      ctx.fillStyle = "rgba(238, 244, 251, 0.62)";
      ctx.fillText("TINY BRAIN ARTERIOLE / CAPILLARY BLOODSTREAM →", 16, WALL_BOT - 14);

      // Tear callout tag
      ctx.fillStyle = "rgba(11, 16, 23, 0.85)";
      ctx.strokeStyle = state.sealedAtSec !== null ? "#3fb950" : "#ff5c6c";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(tearX - 66, WALL_BOT + 14, 132, 26, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = state.sealedAtSec !== null ? "#7ee787" : "#ff9aa4";
      ctx.textAlign = "center";
      ctx.fillText(
        state.sealedAtSec !== null ? "✓ Tear Patched" : "▲ Active Vessel Tear",
        tearX,
        WALL_BOT + 31
      );
      ctx.textAlign = "left";

      // Active drug / alcohol HUD badges at bottom left & right (pure ASCII/vector glyphs — zero tofu!)
      if (state.doacLevel > 0.3) {
        ctx.fillStyle = "rgba(121, 184, 255, 0.16)";
        ctx.strokeStyle = "#79b8ff";
        ctx.beginPath();
        ctx.roundRect(14, WALL_BOT + 14, 232, 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#b8daff";
        ctx.fillText("◆ Eliquis: Factor Xa Dialed Down", 24, WALL_BOT + 31);
      }
      if (state.alcoholLevel > 0.3) {
        ctx.fillStyle = "rgba(255, 139, 90, 0.16)";
        ctx.strokeStyle = "#ff8b5a";
        ctx.beginPath();
        ctx.roundRect(W - 246, WALL_BOT + 14, 232, 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffc2a6";
        ctx.fillText("● Alcohol: Platelets Slippery!", W - 236, WALL_BOT + 31);
      }

      ctx.restore();
    }

    let lastTs = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (!window.__BRAIN_APP_PAUSED) {
        stepSimulation(dt);
      }
      draw();
      requestAnimationFrame(loop);
    }

    applyPreset("normal");
    requestAnimationFrame(loop);
  }

  window.initVesselSim = initVesselSim;
})();
