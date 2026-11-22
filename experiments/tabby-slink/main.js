import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { createRoom } from "./room.js";
import { createTabby } from "./cat.js";
import { createFollowRig } from "./rig.js";
import { createLights, updateLighting } from "./lighting.js";

const canvas = document.getElementById("view");
const veil = document.getElementById("veil");
const errorEl = document.getElementById("error");
const panel = document.getElementById("panel");
const panelShow = document.getElementById("panelShow");
const statusEl = document.getElementById("status");
const statusLine = document.getElementById("statusLine");
const statusDetail = document.getElementById("statusDetail");
const paceInput = document.getElementById("pace");
const paceValue = document.getElementById("paceValue");
const crouchInput = document.getElementById("crouch");
const crouchValue = document.getElementById("crouchValue");
const moonInput = document.getElementById("moon");
const moonValue = document.getElementById("moonValue");
const followBtn = document.getElementById("followBtn");
const playBtn = document.getElementById("playBtn");
const hideBtn = document.getElementById("hideBtn");

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  pace: 1,
  crouch: 0.7,
  moon: 1,
  follow: true,
  paused: reduced,
};

// First report wins: once something has gone wrong the veil should stay down,
// and a later error must not bury the one that explains what happened.
function showError(err) {
  console.error(err);
  if (window.__SESSION_ERROR_SHOWN) return;
  window.__SESSION_ERROR_SHOWN = true;
  veil.classList.add("hide");
  errorEl.hidden = false;
  errorEl.textContent = err && err.message ? err.message : String(err);
}
// index.html runs a watchdog before this module so that a module that never
// executes (missing vendor file, syntax error, no WebGL) still reports itself.
// Hand that watchdog the real error path now that the app is alive.
window.__TABBY_REPORT_ERROR = showError;

async function boot() {
  if (!canvas) throw new Error("Missing canvas.");
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    showError(new Error("The WebGL context was lost. Reload the page to bring the tabby back."));
  });
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  if (!renderer.getContext()) throw new Error("WebGL is not available in this browser.");
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080c);
  scene.fog = new THREE.FogExp2(0x0b0d12, 0.085);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.18;

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.04, 40);
  camera.position.set(1.1, 0.32, 0.2);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.28;
  controls.maxDistance = 3.5;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.minPolarAngle = 0.22;
  controls.target.set(0, 0.1, -0.8);

  const room = createRoom();
  scene.add(room.object);

  const lights = createLights(scene, room);

  const tabby = createTabby();
  scene.add(tabby.object);

  /*
   * Camera invariants, bound to this room's volume (see room.js for the rules
   * and rig.js for the follow rig that obeys them).
   *
   * The follow rig keeps its whole target->camera segment in the open volume,
   * shortening or side-shifting its offset when the sofa, the lamp or the back
   * wall is in the way, and on the sofa-adjacent leg it drops to the cat's own
   * eye line and keeps to the room side of the furniture (see rig.js). Manual
   * orbit is only constrained positionally, so a parked view slides along a
   * wall or kicks out of the sofa instead of being teleported. Either way a
   * rendered pose is never inside the walls or the furniture - a camera buried
   * in geometry is a black or furniture-filled frame, which looks exactly like
   * a broken page.
   */
  const rig = createFollowRig(room);
  const collideCamera = (position) => rig.collide(position);
  const clearance = (from, direction, maxDist) => rig.clearance(from, direction, maxDist);
  const cameraDir = new THREE.Vector3();
  const lightView = new THREE.Vector3();

  function applyCamera(dt) {
    rig.step(dt, lastInfo, elapsed, frames, camera, controls.target, state.follow);
    controls.update();
    // The rig has already clamped its own pose; the clamp is repeated after the
    // controls' damping so a parked orbit cannot leave the room either.
    collideCamera(camera.position);
    // Spring arm shared by both rigs: if the cat ended up outside the open
    // volume from this pose, slide the camera in along the view axis.
    cameraDir.copy(camera.position).sub(controls.target);
    const distance = cameraDir.length();
    if (distance > 1e-4) {
      cameraDir.divideScalar(distance);
      const clear = clearance(controls.target, cameraDir, distance);
      if (clear < distance) camera.position.copy(controls.target).addScaledVector(cameraDir, clear);
      collideCamera(camera.position);
    }
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 760 ? 1.5 : 1.75));
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", resize);

  function releaseFollow() {
    state.follow = false;
    followBtn.setAttribute("aria-pressed", "false");
  }
  controls.addEventListener("start", releaseFollow);
  canvas.addEventListener("wheel", releaseFollow, { passive: true });

  followBtn.addEventListener("click", () => {
    state.follow = !state.follow;
    followBtn.setAttribute("aria-pressed", state.follow ? "true" : "false");
  });
  playBtn.addEventListener("click", () => {
    state.paused = !state.paused;
    playBtn.setAttribute("aria-pressed", state.paused ? "false" : "true");
    playBtn.textContent = state.paused ? "Play" : "Pause";
  });
  hideBtn.addEventListener("click", () => {
    panel.hidden = true;
    panelShow.hidden = false;
  });
  panelShow.addEventListener("click", () => {
    panel.hidden = false;
    panelShow.hidden = true;
  });

  function bindRange(input, output, format, apply) {
    const sync = () => {
      const value = Number(input.value);
      output.textContent = format(value);
      apply(value);
    };
    input.addEventListener("input", sync);
    sync();
  }
  bindRange(paceInput, paceValue, (v) => `${Number(v).toFixed(2)}×`, (v) => {
    state.pace = v;
  });
  bindRange(crouchInput, crouchValue, (v) => (v < 0.4 ? "High" : v > 0.8 ? "Belly-low" : "Low"), (v) => {
    state.crouch = v;
  });
  bindRange(moonInput, moonValue, (v) => `${Math.round(v * 100)}%`, (v) => {
    state.moon = v;
  });

  if (reduced) {
    playBtn.textContent = "Play";
    playBtn.setAttribute("aria-pressed", "false");
    statusDetail.textContent = "Motion is paused because this device asked for less movement.";
  }

  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.code === "Space") {
      event.preventDefault();
      playBtn.click();
    } else if (event.key === "f" || event.key === "F") {
      followBtn.click();
    } else if (event.key === "h" || event.key === "H") {
      if (panel.hidden) panelShow.click();
      else hideBtn.click();
    }
  });

  const clock = new THREE.Clock();
  let frames = 0;
  let elapsed = 0;
  let lastInfo = null;

  /*
   * Render self-check. This experiment once shipped a black screen that logged
   * nothing: an empty <p id="error" hidden> shared its `display: grid` rule with
   * .veil, so the user-agent [hidden] style lost and an invisible overlay covered
   * the canvas while geometry, shaders and the status text stayed healthy. These
   * checks look at what is actually on screen — from the DOM and from the
   * rendered pixels — and report through #error instead of leaving a black view.
   */
  const SELF_CHECK_FIRST = 90; // ~1.5s in, once the veil has faded
  const SELF_CHECK_RETRY_GAP = 15; // confirmation pass, so one bad frame is not an alarm
  const SELF_CHECK_EVERY = 300; // then about every five seconds
  // A parked orbit can aim the camera anywhere, so the controls panel may
  // legitimately cover a couple of probe points. This check exists to catch a
  // stray overlay covering *most* of the view — the two probes right of the
  // panel make a full-view overlay impossible to miss.
  const SELF_CHECK_PROBES = [
    [0.5, 0.5],
    [0.35, 0.5],
    [0.65, 0.5],
    [0.5, 0.35],
    [0.5, 0.65],
    [0.78, 0.32],
    [0.78, 0.55],
  ];
  const SELF_CHECK_ALLOWED_PROBES = 2; // the panel's footprint at small sizes
  const HINT_SECONDS = 7;
  const probeCanvas = document.createElement("canvas");
  probeCanvas.width = 1;
  probeCanvas.height = 1;
  const probeCtx = probeCanvas.getContext("2d", { willReadFrequently: true });
  const bgRgb = new THREE.Color(0x07080c);
  // Curtains, the shaft and the glass are transparent; only opaque geometry
  // actually hides the cat. Read-back is done in the same frame as the render.
  const isBackground = (px) =>
    Math.abs(px[0] - bgRgb.r * 255) <= 12 &&
    Math.abs(px[1] - bgRgb.g * 255) <= 12 &&
    Math.abs(px[2] - bgRgb.b * 255) <= 12;
  const selfRay = new THREE.Raycaster();
  const rayDir = new THREE.Vector3();
  const headNdc = new THREE.Vector3();

  function samplePixel(u, v) {
    const x = Math.min(canvas.width - 1, Math.max(0, Math.round(u * canvas.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.round(v * canvas.height)));
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.drawImage(canvas, x, y, 1, 1, 0, 0, 1, 1);
    return probeCtx.getImageData(0, 0, 1, 1).data;
  }

  // Non-fatal camera advice. A parked, manually orbited view that loses the cat
  // is a position to nudge, not a broken page: it goes to the small hint bar,
  // never to the full-view error overlay.
  const hintEl = document.getElementById("hint");
  let hintLeft = 0;
  function showHint(text) {
    if (!hintEl) return;
    hintEl.textContent = text;
    hintEl.hidden = false;
    hintLeft = HINT_SECONDS;
  }
  function updateHint(dt) {
    if (!hintEl || hintEl.hidden) return;
    hintLeft -= dt;
    if (hintLeft <= 0) {
      hintEl.hidden = true;
      hintEl.textContent = "";
    }
  }

  const selfCheck = {
    status: "pending",
    checks: 0,
    strikes: 0,
    lastFrame: null,
    failures: [],
    hints: [],
    run() {
      if (window.__SESSION_ERROR_SHOWN) return;
      this.checks += 1;
      this.lastFrame = frames;
      const failures = [];
      const hints = [];
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;

      // 1. A stray layer must not cover most of the view. The control panel
      // (and its buttons) is the one allowed layer, and only over a couple of
      // probes: some window sizes genuinely put it over the probe points.
      const visibleProbes = [];
      let coveredBy = null;
      let coveredCount = 0;
      for (const [u, v] of SELF_CHECK_PROBES) {
        const element = document.elementFromPoint(u * width, v * height);
        if (element === canvas) {
          visibleProbes.push([u, v]);
          continue;
        }
        const allowed = element && (panel.contains(element) || element === panelShow || element === veil);
        if (allowed) continue;
        coveredCount += 1;
        if (!coveredBy) {
          const name = element ? `${element.tagName.toLowerCase()}${element.id ? ` #${element.id}` : ""}` : "nothing";
          coveredBy = `${name} at ${Math.round(u * 100)}%/${Math.round(v * 100)}%`;
        }
      }
      if (coveredCount > SELF_CHECK_ALLOWED_PROBES) {
        failures.push(`${coveredBy} is on top of the canvas (${coveredCount} of ${SELF_CHECK_PROBES.length} probes blocked)`);
      }

      // 2. The canvas must not be background-coloured where it is visible.
      if (visibleProbes.length && visibleProbes.every(([u, v]) => isBackground(samplePixel(u, v)))) {
        failures.push("the canvas is background-coloured at every visible probe");
      }

      if (lastInfo) {
        // 3. The camera watches the cat's head, so that pixel may never be the
        // background colour.
        headNdc.copy(lastInfo.focus).project(camera);
        if (Math.abs(headNdc.x) < 0.9 && Math.abs(headNdc.y) < 0.9) {
          if (isBackground(samplePixel(headNdc.x * 0.5 + 0.5, 0.5 - headNdc.y * 0.5))) {
            failures.push("the cat projects into view but its head pixel is background-coloured");
          }
        }
        // 4. Line of sight. While the rig drives the camera this is an
        // invariant: the follow offset is shortened until the cat-to-camera
        // segment is clear, so being blocked means the invariant broke and it
        // is a real failure. On a parked, manually orbited view the user owns
        // the camera — a wall in the way is a hint, not a broken page.
        rayDir.copy(lastInfo.focus).sub(camera.position);
        const span = rayDir.length();
        selfRay.set(camera.position, rayDir.normalize());
        selfRay.far = Math.max(0, span - 0.03);
        const hit = selfRay
          .intersectObject(room.object, true)
          .find((entry) => entry.object.material && entry.object.material.transparent !== true);
        if (hit && state.follow) {
          failures.push(`the view of the cat is blocked by room geometry ${hit.distance.toFixed(2)}m from the camera`);
        } else if (!state.follow) {
          const b = room.bounds;
          const edge = Math.min(
            camera.position.x - b.minX, b.maxX - camera.position.x,
            camera.position.y - b.minY, b.maxY - camera.position.y,
            camera.position.z - b.minZ, b.maxZ - camera.position.z
          );
          if (hit && hit.distance < 0.25) {
            hints.push("the camera is inside room geometry - press F to follow the cat");
          } else if (edge < 0.04) {
            hints.push("the camera left the room - press F to follow the cat");
          }
        }
      }

      // 5. Something must have been drawn this frame.
      if (renderer.info.render.calls === 0) {
        failures.push("the renderer issued no draw calls");
      }

      this.hints = hints;
      if (hints.length) showHint(hints[0]);

      if (!failures.length) {
        this.strikes = 0;
        this.status = "ok";
        this.failures = [];
        return;
      }
      // Confirm once before shouting: some browsing modes blank canvas
      // read-back, and a single bad frame should not raise an alarm.
      this.strikes += 1;
      this.failures = failures;
      if (this.strikes < 2) {
        this.status = "retrying";
        return;
      }
      this.status = "failed";
      showError(new Error(`Render self-check failed: ${failures.join("; ")}.`));
    },
  };
  window.__TABBY_SELFCHECK = selfCheck;

  function frame() {
    try {
      renderFrame();
    } catch (err) {
      showError(err); // one report beats the same throw every frame
      return;
    }
    requestAnimationFrame(frame);
  }

  function renderFrame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    room.lamp.intensity = 12 + (1 - state.moon) * 10;
    room.update(dt, elapsed, state.moon);

    const info = tabby.update(dt, {
      pace: state.pace,
      crouch: state.crouch,
      paused: state.paused,
      moth: room.moth.position,
      mouse: room.mouse.position,
    });

    lightView.copy(room.moonDir).transformDirection(camera.matrixWorldInverse);
    tabby.eyeMat.uniforms.uLightDir.value.copy(lightView);

    updateLighting(lights, { moonAmount: state.moon, camera, focus: info.focus });

    applyCamera(dt);

    statusEl.classList.toggle("is-frozen", info.frozen);
    statusLine.textContent = info.line;
    statusDetail.textContent = info.detail;

    lastInfo = info;
    updateHint(dt);
    renderer.render(scene, camera);
    frames += 1;
    if (frames === 2) veil.classList.add("hide");
    if (
      frames === SELF_CHECK_FIRST ||
      (selfCheck.status === "retrying" && frames === selfCheck.lastFrame + SELF_CHECK_RETRY_GAP) ||
      frames % SELF_CHECK_EVERY === 0
    ) {
      selfCheck.run();
    }
  }

  resize();
  requestAnimationFrame(frame);
  window.__TABBY = { scene, camera, renderer, tabby, room, lights, rig, state, selfCheck };
}

boot().catch(showError);
