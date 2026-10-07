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

function showError(err) {
  console.error(err);
  veil.classList.add("hide");
  errorEl.hidden = false;
  errorEl.textContent = err && err.message ? err.message : String(err);
}

async function boot() {
  if (!canvas) throw new Error("Missing canvas.");
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

  function frame() {
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
      desiredCam
        .copy(info.position)
        .addScaledVector(info.forward, -back)
        .addScaledVector(info.right, side);
      desiredCam.y = 0.26 + Math.sin(elapsed * 0.6) * 0.004;
      desiredTarget.copy(info.focus);
      desiredTarget.y += 0.035;
      const k = 1 - Math.exp(-dt * 2.4);
      camera.position.lerp(desiredCam, frames < 2 ? 1 : k);
      controls.target.lerp(desiredTarget, frames < 2 ? 1 : k);
    }
    controls.update();

    statusEl.classList.toggle("is-frozen", info.frozen);
    statusLine.textContent = info.line;
    statusDetail.textContent = info.detail;

    renderer.render(scene, camera);
    frames += 1;
    if (frames === 2) veil.classList.add("hide");
    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
  window.__TABBY = { scene, camera, renderer, tabby, room, state };
}

boot().catch(showError);
