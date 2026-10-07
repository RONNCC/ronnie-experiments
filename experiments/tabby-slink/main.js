import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { createRoom } from "./room.js";
import { createTabby } from "./cat.js";

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

  const hemi = new THREE.HemisphereLight(0x9aafc8, 0x4a3020, 1.05);
  scene.add(hemi);

  const moon = new THREE.DirectionalLight(0xd5e4ff, 5.4);
  moon.position.copy(room.moonDir).multiplyScalar(6);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.near = 0.4;
  moon.shadow.camera.far = 14;
  moon.shadow.camera.left = -3.2;
  moon.shadow.camera.right = 3.2;
  moon.shadow.camera.top = 3.2;
  moon.shadow.camera.bottom = -3.2;
  moon.shadow.bias = -0.00035;
  moon.shadow.normalBias = 0.02;
  scene.add(moon);
  scene.add(moon.target);

  const rim = new THREE.DirectionalLight(0xb7c6e4, 1.7);
  rim.position.set(2.4, 1.6, 2.2);
  scene.add(rim);

  const viewFill = new THREE.DirectionalLight(0xffe0c2, 1.55);
  viewFill.position.set(1, 1.2, 1);
  scene.add(viewFill);
  scene.add(viewFill.target);

  const tabby = createTabby();
  scene.add(tabby.object);

  const desiredCam = new THREE.Vector3();
  const desiredTarget = new THREE.Vector3();
  const lightView = new THREE.Vector3();
  const camRight = new THREE.Vector3();

  /*
   * The camera must never end up inside the walls or the furniture: a camera
   * buried in geometry reads as a black screen, exactly like an overlay bug,
   * and the old rig managed it for about a quarter of the stalk (the follow
   * offset used the cat's local +X axis, which points the opposite way, so the
   * camera was pulled toward the back wall). This clamps a position into the
   * room's usable volume and pushes it out of any furniture box it lands in.
   */
  function containCamera(position) {
    const bounds = room.bounds;
    position.x = Math.min(bounds.maxX, Math.max(bounds.minX, position.x));
    position.y = Math.min(bounds.maxY, Math.max(bounds.minY, position.y));
    position.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, position.z));
    for (const box of room.cameraBlockers) {
      const inside =
        position.x > box.minX && position.x < box.maxX &&
        position.y > box.minY && position.y < box.maxY &&
        position.z > box.minZ && position.z < box.maxZ;
      if (!inside) continue;
      const exits = [
        ["x", position.x - box.minX, box.minX],
        ["x", box.maxX - position.x, box.maxX],
        ["y", position.y - box.minY, box.minY],
        ["y", box.maxY - position.y, box.maxY],
        ["z", position.z - box.minZ, box.minZ],
        ["z", box.maxZ - position.z, box.maxZ],
      ].sort((a, b) => a[1] - b[1]);
      // Climbing over a low piece keeps the cat in frame; leaving sideways is
      // the fallback when the piece is too tall to clear cheaply.
      const over = exits.find((exit) => exit[0] === "y" && exit[2] === box.maxY);
      const exit = over && over[1] <= 0.28 ? over : exits[0];
      position[exit[0]] = exit[2];
    }
    return position;
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
  const SELF_CHECK_PROBES = [
    [0.5, 0.5],
    [0.35, 0.5],
    [0.65, 0.5],
    [0.5, 0.35],
    [0.5, 0.65],
  ];
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

  const selfCheck = {
    status: "pending",
    checks: 0,
    strikes: 0,
    lastFrame: null,
    failures: [],
    run() {
      if (window.__SESSION_ERROR_SHOWN) return;
      this.checks += 1;
      this.lastFrame = frames;
      const failures = [];
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;

      // 1. Nothing unexpected may sit on top of the view; the controls are the
      // only thing allowed over the canvas.
      const visibleProbes = [];
      for (const [u, v] of SELF_CHECK_PROBES) {
        const element = document.elementFromPoint(u * width, v * height);
        if (element === canvas) {
          visibleProbes.push([u, v]);
          continue;
        }
        const allowed = element && (panel.contains(element) || element === panelShow || element === veil);
        if (!allowed) {
          const name = element ? `${element.tagName.toLowerCase()}${element.id ? ` #${element.id}` : ""}` : "nothing";
          failures.push(`${name} is on top of the canvas at ${Math.round(u * 100)}%/${Math.round(v * 100)}% of the view`);
        }
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
        // 4. Nothing opaque may stand between the camera and the cat.
        rayDir.copy(lastInfo.focus).sub(camera.position);
        const span = rayDir.length();
        selfRay.set(camera.position, rayDir.normalize());
        selfRay.far = span - 0.03;
        const hit = selfRay
          .intersectObject(room.object, true)
          .find((entry) => entry.object.material && entry.object.material.transparent !== true);
        if (hit) failures.push(`the view of the cat is blocked by room geometry ${hit.distance.toFixed(2)}m from the camera`);
      }

      // 5. Something must have been drawn this frame.
      if (renderer.info.render.calls === 0) failures.push("the renderer issued no draw calls");

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
    moon.intensity = 3.6 + state.moon * 2.6;
    hemi.intensity = 0.7 + state.moon * 0.45;
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

    viewFill.position.copy(camera.position);
      viewFill.position.y += 0.35;
      viewFill.target.position.copy(info.focus);
      viewFill.target.updateMatrixWorld();

    if (state.follow) {
      const side = 0.58 + Math.sin(elapsed * 0.17) * 0.04;
      const back = 0.52;
      // In a Y-up right-handed world the true right of a forward vector is
      // forward × up, i.e. (-forward.z, 0, forward.x). The cat's own `right` is
      // its local +X axis, which points the other way; using it put the camera
      // on the wrong shoulder and, along the back wall, inside the wall.
      camRight.set(-info.forward.z, 0, info.forward.x);
      desiredCam
        .copy(info.position)
        .addScaledVector(info.forward, -back)
        .addScaledVector(camRight, side);
      desiredCam.y = 0.26 + Math.sin(elapsed * 0.6) * 0.004;
      containCamera(desiredCam);
      desiredTarget.copy(info.focus);
      desiredTarget.y += 0.035;
      const k = 1 - Math.exp(-dt * 2.4);
      camera.position.lerp(desiredCam, frames < 2 ? 1 : k);
      controls.target.lerp(desiredTarget, frames < 2 ? 1 : k);
    }
    controls.update();
    // The pose that gets rendered must satisfy the invariant too, whatever the
    // follow rig, the damping or a manual orbit produced.
    containCamera(camera.position);

    statusEl.classList.toggle("is-frozen", info.frozen);
    statusLine.textContent = info.line;
    statusDetail.textContent = info.detail;

    lastInfo = info;
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
  window.__TABBY = { scene, camera, renderer, tabby, room, state, selfCheck };
}

boot().catch(showError);
