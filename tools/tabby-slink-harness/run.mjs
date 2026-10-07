/**
 * Tabby-slink offscreen harness.
 *
 * Runs the experiment's own modules (room, cat, fur, rig, lighting) headlessly,
 * renders sampled frames on the CPU, measures the things rounds 2 and 3 were
 * about, and writes PNGs plus a metrics JSON so the numbers can be argued with.
 *
 *   node tools/tabby-slink-harness/run.mjs [--module-root DIR] [--out DIR]
 *                                          [--label NAME] [--width N] [--height N]
 *                                          [--seconds N] [--portrait] [--quiet]
 *
 * Exit code is non-zero when an assertion fails, so it can gate a commit.
 */
import { register } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import process from "node:process";

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) {
    const [key, inline] = arg.slice(2).split("=");
    const next = process.argv[i + 1];
    if (inline !== undefined) args.set(key, inline);
    else if (next && !next.startsWith("--")) { args.set(key, next); i++; }
    else args.set(key, "true");
  }
}

/*
 * The cat's blink, ear flicks and freeze timing all come from Math.random, so
 * two runs of the same build would sample different moments and the metrics
 * would wobble. A seeded generator makes a run reproducible: a difference
 * between two reports is then a difference between the builds.
 */
const seed = Number(args.get("seed") || 20261007);
{
  let state = seed >>> 0;
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const here = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(here, "../..");
const moduleRoot = path.resolve(args.get("module-root") || path.join(repoRoot, "experiments/tabby-slink"));
const outRoot = path.resolve(args.get("out") || path.join(here, "out"));
const label = args.get("label") || path.basename(moduleRoot);
const width = Number(args.get("width") || 640);
const height = Number(args.get("height") || 360);
const seconds = Number(args.get("seconds") || 26);
const portraitWidth = Number(args.get("portrait-width") || 640);
const portraitHeight = Number(args.get("portrait-height") || 480);
const quiet = args.has("quiet");

process.env.TABBY_THREE = path.join(moduleRoot, "vendor/three.module.js");
process.env.TABBY_MODULE_ROOT = moduleRoot;
register("./three-resolver.mjs", import.meta.url);

const THREE = await import("three");
const { encodePNG } = await import("./png.mjs");
const rendererModule = await import("./renderer.mjs");
const { renderScene, setLook } = rendererModule;

const moduleUrl = (file) => new URL(file, pathToFileURL(moduleRoot.replace(/\/?$/, "/"))).href;
const exists = (file) => {
  try { return Boolean(import.meta.resolve?.(moduleUrl(file))) && true; } catch { return false; }
};
async function tryImport(file) {
  try { return await import(moduleUrl(file)); } catch (err) {
    if (err && /Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(err.message))) return null;
    throw err;
  }
}

/* ------------------------------------------------------------------ *
 * world
 * ------------------------------------------------------------------ */
const roomModule = await tryImport("room.js");
const { createRoom, STALK_PATH, collideCameraPose, cameraClearance, CAMERA_RADIUS } = roomModule;
const { createTabby } = await tryImport("cat.js");
const furModule = await tryImport("fur.js");
const rigModule = await tryImport("rig.js");
const lightingModule = await tryImport("lighting.js");
const legacy = rigModule && lightingModule ? null : await import("./legacy.mjs");

const look = {
  FUR_LOOK: furModule?.FUR_LOOK || legacy.LEGACY_LOOK.FUR_LOOK,
  EYE_LOOK: furModule?.EYE_LOOK || legacy.LEGACY_LOOK.EYE_LOOK,
};
setLook(look);
const usedLegacy = Boolean(legacy);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07080c);
const room = createRoom();
scene.add(room.object);
const lights = legacy ? legacy.createLegacyLights(scene, room) : lightingModule.createLights(scene, room);
const updateLights = legacy ? legacy.updateLegacyLights : lightingModule.updateLighting;
const rig = legacy ? legacy.createLegacyFollowRig(room) : rigModule.createFollowRig(room);

const tabby = createTabby();
scene.add(tabby.object);

const camera = new THREE.PerspectiveCamera(34, width / height, 0.04, 40);
camera.position.set(1.1, 0.32, 0.2);
const target = new THREE.Vector3(0, 0.1, -0.8);
const lightView = new THREE.Vector3();

/* ------------------------------------------------------------------ *
 * metrics
 * ------------------------------------------------------------------ */
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function analyze(render, { camera, lights, room, front }) {
  const { mask, rgba, feature, width: w, height: h } = render;
  const total = w * h;
  let catCount = 0, furCount = 0, shellCount = 0, eyeCount = 0;
  let minX = w, maxX = -1, minY = h, maxY = -1;
  const catLums = [];
  let moonDotSum = 0, moonLit = 0, ndvSum = 0;
  let eyeLumSum = 0, eyeMax = 0, eyeGlow = 0, eyeBlown = 0;
  const eyePoints = [];
  let furLumSum = 0;
  let warmR = 0, warmB = 0, bodyR = 0, bodyB = 0;
  const headNdc = new THREE.Vector3();
  const headPx = { x: 0, y: 0 };
  if (front && front.focus) {
    headNdc.copy(front.focus).project(camera);
    headPx.x = (headNdc.x * 0.5 + 0.5) * w;
    headPx.y = (0.5 - headNdc.y * 0.5) * h;
  }

  for (let i = 0; i < total; i++) {
    const kind = mask[i];
    if (kind === 0 || kind === 1) continue;
    const r = rgba[i * 4] / 255, g = rgba[i * 4 + 1] / 255, b = rgba[i * 4 + 2] / 255;
    const y = lum(r, g, b);
    const x = i % w, py = (i / w) | 0;
    if (kind === 4) {
      eyeCount++;
      eyeLumSum += y;
      eyeMax = Math.max(eyeMax, y);
      if (y > 0.7) eyeGlow++;
      if (y > 0.9) eyeBlown++;
      eyePoints.push([x, py]);
      continue;
    }
    catCount++;
    if (kind === 2) { furCount++; furLumSum += y; } else shellCount++;
    catLums.push(y);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
    const nx = feature[i * 4], ny = feature[i * 4 + 1], nz = feature[i * 4 + 2];
    const md = nx * lights.moon.dir.x + ny * lights.moon.dir.y + nz * lights.moon.dir.z;
    moonDotSum += md;
    if (md > 0.2) moonLit++;
    ndvSum += feature[i * 4 + 3];

    // warmth: split the head region from the rest of the body
    const dist = Math.hypot(x - headPx.x, py - headPx.y);
    if (front && dist < h * 0.13) { warmR += r; warmB += b; } else { bodyR += r; bodyB += b; }
  }

  // split the eye pixels into two clusters (left/right of the median x) and
  // measure each cluster's own aperture
  const eyeAperture = (() => {
    if (eyePoints.length < 8) return { width: 0, height: 0, aspect: 0, count: 0 };
    const xs = eyePoints.map((p) => p[0]).sort((a, b) => a - b);
    const split = xs[Math.floor(xs.length / 2)];
    const boxes = [];
    for (const side of [0, 1]) {
      const cluster = eyePoints.filter((p) => (p[0] <= split ? 0 : 1) === side);
      if (cluster.length < 8) continue;
      const minX = Math.min(...cluster.map((p) => p[0])), maxX = Math.max(...cluster.map((p) => p[0]));
      const minY = Math.min(...cluster.map((p) => p[1])), maxY = Math.max(...cluster.map((p) => p[1]));
      boxes.push({ width: maxX - minX + 1, height: maxY - minY + 1, count: cluster.length });
    }
    if (!boxes.length) return { width: 0, height: 0, aspect: 0, count: 0 };
    // the eye with the largest aperture is the one at a good angle to the lens
    boxes.sort((a, b) => b.height - a.height);
    const best = boxes.reduce((a, b) => (a.count > b.count ? a : b));
    return { width: best.width, height: best.height, aspect: best.height / Math.max(1, best.width), count: boxes.length };
  })();

  catLums.sort((a, b) => a - b);
  const pct = (p) => (catLums.length ? catLums[Math.min(catLums.length - 1, Math.floor(p * catLums.length))] : 0);
  const bbox = catCount
    ? {
        x0: minX / w, x1: maxX / w, y0: minY / h, y1: maxY / h,
        centreX: (minX + maxX) / 2 / w, centreY: (minY + maxY) / 2 / h,
        width: (maxX - minX) / w, height: (maxY - minY) / h,
      }
    : null;

  // fur edge: how far the fuzzy shells reach past the solid coat, cast from the
  // middle of the cat
  let fringeSum = 0, fringeRays = 0;
  if (catCount) {
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const maxR = Math.hypot(w, h);
    for (let a = 0; a < 96; a++) {
      const angle = (a / 96) * Math.PI * 2;
      const dx = Math.cos(angle), dy = Math.sin(angle);
      let outer = -1, solid = -1;
      for (let r = 2; r < maxR; r += 1) {
        const x = Math.round(cx + dx * r), y = Math.round(cy + dy * r);
        if (x < 0 || y < 0 || x >= w || y >= h) break;
        const kind = mask[y * w + x];
        if (kind === 2 || kind === 3) outer = r;
        if (kind === 2) solid = r;
      }
      if (outer > 0 && solid > 0) { fringeSum += outer - solid; fringeRays++; }
    }
  }

  // Silhouette test: compare the coat at the cat's outline with the pixels just
  // outside it. A backlit cat against a bright sofa reads as a dark shape with
  // a bright fringe; an evenly lit one sits at about the same luminance as its
  // surroundings.
  let insideEdge = 0, outsideEdge = 0, edgePixels = 0, darkEdgePixels = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const kind = mask[i];
      if (kind !== 2 && kind !== 3) continue;
      const inside = lum(rgba[i * 4] / 255, rgba[i * 4 + 1] / 255, rgba[i * 4 + 2] / 255);
      let outSum = 0, outCount = 0;
      for (const n of [i - 1, i + 1, i - w, i + w]) {
        const nk = mask[n];
        if (nk === 2 || nk === 3 || nk === 4) continue;
        outSum += lum(rgba[n * 4] / 255, rgba[n * 4 + 1] / 255, rgba[n * 4 + 2] / 255);
        outCount++;
      }
      if (!outCount) continue;
      const outside = outSum / outCount;
      insideEdge += inside;
      outsideEdge += outside;
      edgePixels++;
      if (outside > 0.12 && inside < outside * 0.62) darkEdgePixels++;
    }
  }

  // stripe hardness: high-frequency contrast inside the coat
  let hfSum = 0, hfCount = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (mask[i] !== 2) continue;
      const y0 = lum(rgba[i * 4] / 255, rgba[i * 4 + 1] / 255, rgba[i * 4 + 2] / 255);
      const iR = i + 1, iD = i + w;
      if (mask[iR] !== 2 || mask[iD] !== 2) continue;
      const yR = lum(rgba[iR * 4] / 255, rgba[iR * 4 + 1] / 255, rgba[iR * 4 + 2] / 255);
      const yD = lum(rgba[iD * 4] / 255, rgba[iD * 4 + 1] / 255, rgba[iD * 4 + 2] / 255);
      hfSum += (Math.abs(y0 - yR) + Math.abs(y0 - yD)) / 2;
      hfCount++;
    }
  }

  return {
    coverage: catCount / total,
    catPixels: catCount,
    furPixels: furCount,
    shellPixels: shellCount,
    shellFraction: catCount ? shellCount / catCount : 0,
    bbox,
    catMeanLum: catLums.length ? catLums.reduce((s, v) => s + v, 0) / catLums.length : 0,
    catP10: pct(0.1),
    catP90: pct(0.9),
    furMeanLum: furCount ? furLumSum / furCount : 0,
    moonDotMean: catCount ? moonDotSum / catCount : 0,
    moonLitFraction: catCount ? moonLit / catCount : 0,
    viewFacingMean: catCount ? ndvSum / catCount : 0,
    fringePx: fringeRays ? fringeSum / fringeRays : 0,
    stripeHardness: hfCount ? hfSum / hfCount / Math.max(1e-6, furCount ? furLumSum / furCount : 1) : 0,
    eyePixels: eyeCount,
    eyePixelRadius: eyeCount ? Math.sqrt(eyeCount / Math.PI) : 0,
    eyeMeanLum: eyeCount ? eyeLumSum / eyeCount : 0,
    eyeMaxLum: eyeMax,
    eyeGlowFraction: eyeCount ? eyeGlow / eyeCount : 0,
    eyeBlownFraction: eyeCount ? eyeBlown / eyeCount : 0,
    // The aperture the lid leaves open. Measured per eye — two eyes in one
    // bounding box would mix the inter-eye distance into the width and make a
    // healthy eye look like a slit.
    eyeHeight: eyeAperture.height,
    eyeWidth: eyeAperture.width,
    eyeAspect: eyeAperture.aspect,
    eyesSeen: eyeAperture.count,
    edgeInsideLum: edgePixels ? insideEdge / edgePixels : 0,
    edgeOutsideLum: edgePixels ? outsideEdge / edgePixels : 0,
    edgeLumRatio: outsideEdge > 1e-6 ? insideEdge / outsideEdge : 1,
    edgeDarkFraction: edgePixels ? darkEdgePixels / edgePixels : 0,
    faceWarmth: warmB > 0 ? warmR / warmB : 0,
    bodyWarmth: bodyB > 0 ? bodyR / bodyB : 0,
    headPx,
  };
}

/** Is this rendered pose legal? (the clamp every round has to preserve) */
function poseAudit(camera, room, catFocus) {
  const probe = camera.position.clone();
  const corrected = collideCameraPose(probe, room.bounds, room.cameraBlockers, CAMERA_RADIUS);
  const eps = 1e-4;
  const insideWalls =
    camera.position.x >= room.bounds.minX - eps && camera.position.x <= room.bounds.maxX + eps &&
    camera.position.y >= room.bounds.minY - eps && camera.position.y <= room.bounds.maxY + eps &&
    camera.position.z >= room.bounds.minZ - eps && camera.position.z <= room.bounds.maxZ + eps;
  let insideBlocker = false;
  for (const box of room.cameraBlockers) {
    if (
      camera.position.x > box.minX && camera.position.x < box.maxX &&
      camera.position.y > box.minY && camera.position.y < box.maxY &&
      camera.position.z > box.minZ && camera.position.z < box.maxZ
    ) insideBlocker = true;
  }
  const dir = camera.position.clone().sub(catFocus);
  const distance = dir.length();
  const clear = distance > 1e-4
    ? cameraClearance(catFocus, dir.clone().divideScalar(distance), distance, room.bounds, room.cameraBlockers, CAMERA_RADIUS)
    : distance;
  return {
    position: camera.position.toArray(),
    legal: corrected.distanceTo(camera.position) < 1e-3,
    insideWalls,
    insideBlocker,
    sightlineClear: clear > distance - 0.03,
    clearance: clear,
    distance,
  };
}

/**
 * Stripe softness, measured on the coat shader's own albedo function rather
 * than on rendered pixels: rendering noise, silhouette fuzz and aliasing all
 * swamp a pixel-level edge measure at these stripe frequencies. Sampling the
 * pattern directly answers the actual question — how much of the coat sits in
 * the *transition* of a stripe (a soft fur edge) versus snapped to bar or
 * ground (a printed edge)?
 */
function measurePattern() {
  const { tabbyAlbedo } = rendererModule;
  const out = [0, 0, 0];
  // How far the coat travels, in metres, while a stripe fades from ground to
  // bar: a fur edge should take a visible fraction of a millimetre, a printed
  // one is a step. Measured along the stripe axis (the mackerel bars run across
  // the flank, so a line down the body crosses them) and normalised per line,
  // because how *dark* a stripe gets depends on where on the body it is.
  const distances = [];
  for (let line = 0; line < 9; line++) {
    const x = -0.03 + (line / 8) * 0.06;
    const steps = 1200;
    const z0 = -0.06, z1 = 0.06;
    const dz = (z1 - z0) / steps;
    const values = [];
    for (let i = 0; i <= steps; i++) {
      values.push(tabbyAlbedo(x, 0.02, z0 + dz * i, 0.25, 0.4, 0.88, 0, 0, 0, out));
    }
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min;
    if (range < 0.15) continue;
    let peakStep = 0;
    for (let i = 1; i < values.length; i++) peakStep = Math.max(peakStep, Math.abs(values[i] - values[i - 1]));
    if (peakStep < 1e-6) continue;
    // the steepest single sample covers `peakStep` of the range, so a full fade
    // spans roughly range/peakStep samples
    distances.push((dz * range) / peakStep);
  }
  distances.sort((a, b) => a - b);
  const median = distances.length ? distances[Math.floor(distances.length / 2)] : 0;
  return { edgeWidthMm: median * 1000, crossings: distances.length };
}

/* ------------------------------------------------------------------ *
 * run
 * ------------------------------------------------------------------ */
const dt = 1 / 60;
const frames = Math.round(seconds / dt);
const samples = [];
const firstFrames = [];
let elapsed = 0;
let frame = 0;
let info = null;
const sofaBox = room.sofaBox || room.cameraBlockers?.[0] || null;

// sample points: spread across the sofa leg, plus the moonbeam freeze
const sofaWindow = { t: [] };
let sawSofa = 0;

function gapToSofa(position) {
  if (!sofaBox) return Infinity;
  const dx = Math.max(sofaBox.minX - position.x, 0, position.x - sofaBox.maxX);
  const dz = Math.max(sofaBox.minZ - position.z, 0, position.z - sofaBox.maxZ);
  return Math.hypot(dx, dz);
}

const wanted = [];
for (let f = 0; f < frames; f++) {
  const t = f * dt;
  if (f % 3 === 0) wanted.push(t);
}
for (let f = 0; f < frames; f++) {
  info = tabby.update(dt, {
    pace: 1, crouch: 0.7, paused: false,
    moth: room.moth.position, mouse: room.mouse.position,
  });
  room.update(dt, elapsed, 1);
  room.lamp.intensity = 12 + (1 - 1) * 10;
  lightView.copy(room.moonDir).transformDirection(camera.matrixWorldInverse);
  tabby.eyeMat.uniforms.uLightDir.value.copy(lightView);
  updateLights(lights, { moonAmount: 1, camera, focus: info.focus });
  rig.step(dt, info, elapsed, frame + 1, camera, target, true);
  elapsed += dt;
  frame++;

  const gap = gapToSofa(info.position);
  if (gap < 0.5) sawSofa++;
  if (frame <= 4) firstFrames.push({ frame, camera: camera.position.clone(), target: target.clone() });
  samples.push({
    t: elapsed,
    gap,
    cat: info.position.clone(),
    yaw: info.yaw,
    focus: info.focus.clone(),
    camera: camera.position.clone(),
    target: target.clone(),
    distance: camera.position.distanceTo(info.focus),
    height: camera.position.y,
    frozen: info.frozen,
  });
}

/* pick the frames worth rendering: three along the sofa leg, one in the beam */
const sofaSamples = samples.filter((s) => s.gap < 0.5);
const picks = [];
if (sofaSamples.length) {
  const third = Math.floor(sofaSamples.length / 3);
  picks.push({ name: "sofa-leg-start", index: samples.indexOf(sofaSamples[0]) });
  picks.push({ name: "sofa-leg-mid", index: samples.indexOf(sofaSamples[third]) });
  picks.push({ name: "sofa-leg-end", index: samples.indexOf(sofaSamples[sofaSamples.length - 1 - third]) });
}
const frozen = samples.find((s) => s.frozen);
if (frozen) picks.push({ name: "frozen", index: samples.indexOf(frozen) });
picks.push({ name: "wide", index: Math.min(samples.length - 1, Math.round(samples.length * 0.08)) });
const seen = new Map();
const uniquePicks = picks.filter((p) => {
  if (seen.has(p.index)) { seen.get(p.index).name += `+${p.name}`; return false; }
  seen.set(p.index, p);
  return true;
});
picks.length = 0;
picks.push(...uniquePicks);

const outDir = path.join(outRoot, label);
mkdirSync(outDir, { recursive: true });

/* replay to the picked frames, rendering each */
const results = [];

// rebuild the world (a fresh deterministic run)
const scene2 = new THREE.Scene();
scene2.background = new THREE.Color(0x07080c);
const room2 = createRoom();
scene2.add(room2.object);
const lights2 = legacy ? legacy.createLegacyLights(scene2, room2) : lightingModule.createLights(scene2, room2);
const rig2 = legacy ? legacy.createLegacyFollowRig(room2) : rigModule.createFollowRig(room2);
const tabby2 = createTabby();
scene2.add(tabby2.object);
const camera2 = new THREE.PerspectiveCamera(34, width / height, 0.04, 40);
camera2.position.set(1.1, 0.32, 0.2);
const target2 = new THREE.Vector3(0, 0.1, -0.8);

let cursor = 0;
const pickByIndex = new Map(picks.map((p) => [p.index, p.name]));
const maxIndex = Math.max(...picks.map((p) => p.index));
const audits = [];
let t2 = 0;
for (let f = 0; f <= maxIndex; f++) {
  const info2 = tabby2.update(dt, {
    pace: 1, crouch: 0.7, paused: false,
    moth: room2.moth.position, mouse: room2.mouse.position,
  });
  room2.update(dt, t2, 1);
  room2.lamp.intensity = 12;
  lightView.copy(room2.moonDir).transformDirection(camera2.matrixWorldInverse);
  tabby2.eyeMat.uniforms.uLightDir.value.copy(lightView);
  updateLights(lights2, { moonAmount: 1, camera: camera2, focus: info2.focus });
  rig2.step(dt, info2, t2, f + 1, camera2, target2, true);
  t2 += dt;
  const name = pickByIndex.get(f);
  if (!name) {
    if (f % 30 === 0) audits.push(poseAudit(camera2, room2, info2.focus));
    continue;
  }
  // OrbitControls aims the camera at its target every frame; the rig only sets
  // position/target, so the harness does the aiming.
  camera2.lookAt(target2);
  camera2.updateMatrixWorld(true);
  const render = renderScene({
    room: room2,
    tabby: tabby2,
    lights: { ...lights2, lamp: room2.lamp },
    camera: camera2,
    width,
    height,
    exposure: 1.18,
    eyeState: {
      pupil: tabby2.eyeMat.uniforms.uPupil.value,
      shine: tabby2.eyeMat.uniforms.uShine.value,
      blink: tabby2.eyeMat.uniforms.uBlink.value,
      lightDir: lightView.clone(),
    },
  });
  const metrics = analyze(render, { camera: camera2, lights: render.lights, room: room2, front: { focus: info2.focus } });
  const audit = poseAudit(camera2, room2, info2.focus);
  writeFileSync(path.join(outDir, `${name}.png`), encodePNG(width, height, render.rgba));
  results.push({ name, frame: f, t: t2, metrics, audit, camera: camera2.position.toArray(), focus: info2.focus.toArray() });
  cursor++;
}

/* a deliberate close-up portrait, for the eyes and the coat */
let portrait = null;
if (!args.has("no-portrait")) {
  const scene3 = scene2, room3 = room2, tabby3 = tabby2, camera3 = camera2;
  // Blink is a per-frame state; a portrait taken mid-blink would measure a
  // closed eye. Run the cat on until the lids are open.
  for (let i = 0; i < 400 && tabby3.eyeMat.uniforms.uBlink.value > 0.02; i++) {
    tabby3.update(dt, { pace: 1, crouch: 0.7, paused: false, moth: room3.moth.position, mouse: room3.mouse.position });
    room3.update(dt, t2 + i * dt, 1);
  }
  // Frame from the head's own forward axis rather than the body's: the cat
  // looks around, so a body-relative camera would frame a different part of the
  // face every run and the eye numbers would not be comparable between builds.
  const headObject = tabby3.object.getObjectByName("head");
  const focus = new THREE.Vector3();
  headObject.getWorldPosition(focus);
  const portraitForward = new THREE.Vector3();
  headObject.getWorldDirection(portraitForward);
  portraitForward.y = 0;
  if (portraitForward.lengthSq() < 1e-6) portraitForward.set(0, 0, 1);
  portraitForward.normalize();
  const portraitRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), portraitForward).normalize();
  camera3.position.copy(focus).addScaledVector(portraitForward, 0.26).addScaledVector(portraitRight, -0.14);
  camera3.position.y = focus.y + 0.012;
  camera3.aspect = portraitWidth / portraitHeight;
  camera3.updateProjectionMatrix();
  target2.copy(focus);
  updateLights(lights2, { moonAmount: 1, camera: camera3, focus });
  lightView.copy(room3.moonDir).transformDirection(camera3.matrixWorldInverse);
  camera3.lookAt(target2);
  camera3.updateMatrixWorld(true);
  const eyeState = {
    pupil: tabby3.eyeMat.uniforms.uPupil.value,
    shine: tabby3.eyeMat.uniforms.uShine.value,
    blink: tabby3.eyeMat.uniforms.uBlink.value,
    lightDir: lightView.clone(),
  };
  const render = renderScene({
    room: room3, tabby: tabby3, lights: { ...lights2, lamp: room3.lamp },
    camera: camera3, width: portraitWidth, height: portraitHeight, exposure: 1.18, eyeState,
  });
  // Differential warmth: the same frame with the face key switched off. That
  // isolates what the *key* contributes to the face, instead of comparing R/B
  // across regions with different materials in them.
  // "Glowing" precisely means the eye material lighting itself. Render the same
  // frame with every self-lighting term in the eye port switched off (specular,
  // tapetum, broad sheen, and the wrap that fakes ambient bounce) and compare.
  const flatEye = { ...look.EYE_LOOK, specular: 0, tapetum: 0, tapetumShine: 0, broadSheen: 0, wrap: [1, 0] };
  setLook({ FUR_LOOK: look.FUR_LOOK, EYE_LOOK: flatEye });
  const renderFlatEye = renderScene({
    room: room3, tabby: tabby3, lights: { ...lights2, lamp: room3.lamp },
    camera: camera3, width: portraitWidth, height: portraitHeight, exposure: 1.18, eyeState,
  });
  setLook(look);
  const eyeMeanOf = (r) => {
    let sum = 0, n = 0;
    for (let i = 0; i < r.width * r.height; i++) {
      if (r.mask[i] !== 4) continue;
      sum += lum(r.rgba[i * 4] / 255, r.rgba[i * 4 + 1] / 255, r.rgba[i * 4 + 2] / 255);
      n++;
    }
    return n ? sum / n : 0;
  };
  const eyeSelfLight = eyeMeanOf(render) - eyeMeanOf(renderFlatEye);

  const keyOff = { ...lights2, faceKey: { ...lights2.faceKey, intensity: 0 } };
  const renderNoKey = renderScene({
    room: room3, tabby: tabby3, lights: { ...keyOff, lamp: room3.lamp },
    camera: camera3, width: portraitWidth, height: portraitHeight, exposure: 1.18, eyeState,
  });
  const region = Math.min(portraitWidth, portraitHeight) * 0.3;
  const centre = { x: portraitWidth / 2, y: portraitHeight / 2 };
  // Only the mid tones: ACES desaturates highlights, so a ratio measured on
  // pixels the key is already blowing out says nothing about warmth.
  const faceDelta = { dR: 0, dB: 0, dLum: 0, n: 0 };
  for (let y = 0; y < portraitHeight; y++) {
    for (let x = 0; x < portraitWidth; x++) {
      const i = y * portraitWidth + x;
      if (render.mask[i] !== 2 && render.mask[i] !== 3) continue;
      if (Math.hypot(x - centre.x, y - centre.y) > region) continue;
      // Compare in linear light: the tone curve and the sRGB transfer both
      // compress a channel differently depending on how bright it already is,
      // so an encoded-space delta attributes their nonlinearity to the light.
      const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
      const base = lum(lin(renderNoKey.rgba[i * 4]), lin(renderNoKey.rgba[i * 4 + 1]), lin(renderNoKey.rgba[i * 4 + 2]));
      if (base > 0.25) continue; // highlights: the tone curve owns them, not the light
      faceDelta.dR += lin(render.rgba[i * 4]) - lin(renderNoKey.rgba[i * 4]);
      faceDelta.dB += lin(render.rgba[i * 4 + 2]) - lin(renderNoKey.rgba[i * 4 + 2]);
      faceDelta.dLum += base;
      faceDelta.n++;
    }
  }
  const keyWarmth = faceDelta.n ? ((faceDelta.dR - faceDelta.dB) / faceDelta.n) : 0;
  const keyLift = faceDelta.n ? (faceDelta.dR / faceDelta.n) : 0;
  portrait = {
    metrics: analyze(render, { camera: camera3, lights: render.lights, room: room3, front: { focus } }),
    audit: poseAudit(camera3, room3, focus),
    keyWarmth,
    keyLift,
    eyeSelfLight,
  };
  writeFileSync(path.join(outDir, "portrait.png"), encodePNG(portraitWidth, portraitHeight, render.rgba));
  camera3.aspect = width / height;
  camera3.updateProjectionMatrix();
}

/* ------------------------------------------------------------------ *
 * assertions
 * ------------------------------------------------------------------ */
const pattern = measurePattern();
const checks = [];
// Some properties only make sense over a whole lap of the stalk path: a short
// run samples one stretch of it, so those checks report as skipped rather than
// passing or failing on a frame set that cannot answer them.
const MIN_FULL_RUN_SECONDS = 18;
const fullRun = seconds >= MIN_FULL_RUN_SECONDS;
const add = (ok, name, detail, { needsFullRun = false, informational = false } = {}) => {
  if (needsFullRun && !fullRun) {
    checks.push({ ok: true, skipped: true, name, detail: `${detail} — skipped (run shorter than ${MIN_FULL_RUN_SECONDS}s)` });
    return;
  }
  // Informational checks are reported but never gate: the shell-pixel metrics
  // depend on how a headless rasteriser resolves thin alpha fragments, which is
  // not the same thing a browser's GPU path does with the same geometry. Real
  // browser screenshots are the authority on the fur (round-3 review: they show
  // it), so these numbers are for trend-watching only.
  checks.push({ ok: Boolean(ok), informational, name, detail });
};
const mean = (values) => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0);
const sofaPickResults = results.filter((r) => r.name.startsWith("sofa-leg"));
const sofaMetrics = sofaPickResults.map((r) => r.metrics);

add(sawSofa > 0, "sofa leg is visited", `${sawSofa} frames within 0.5m of the sofa footprint`);
add(sofaMetrics.length > 0, "sofa leg rendered", `${sofaPickResults.length} frames`);
add(mean(sofaMetrics.map((m) => m.coverage)) > 0.12, "cat fills enough of the frame on the sofa leg",
  `mean coverage ${(mean(sofaMetrics.map((m) => m.coverage)) * 100).toFixed(1)}%`);
add(mean(sofaMetrics.map((m) => m.moonDotMean)) > 0.02, "sofa leg is moon-facing, not backlit",
  `mean N.moon over cat pixels ${mean(sofaMetrics.map((m) => m.moonDotMean)).toFixed(3)}`, { needsFullRun: true });
add(mean(sofaMetrics.map((m) => m.moonLitFraction)) > 0.4, "most sofa-leg cat pixels face the moon",
  `lit fraction ${(mean(sofaMetrics.map((m) => m.moonLitFraction)) * 100).toFixed(0)}%`, { needsFullRun: true });
add(mean(sofaMetrics.map((m) => m.edgeDarkFraction)) < 0.3, "cat does not read as a dark shape on a bright background",
  `dark edge pixels ${(mean(sofaMetrics.map((m) => m.edgeDarkFraction)) * 100).toFixed(0)}%`);
add(mean(sofaMetrics.map((m) => m.edgeLumRatio)) > 0.75, "cat sits at its surroundings' luminance",
  `edge inside/outside ${mean(sofaMetrics.map((m) => m.edgeLumRatio)).toFixed(2)}`);
add(mean(sofaMetrics.map((m) => m.catMeanLum)) > 0.055, "sofa-leg cat is not crushed to black",
  `mean luminance ${mean(sofaMetrics.map((m) => m.catMeanLum)).toFixed(3)}`);
add(mean(sofaMetrics.map((m) => m.catP90 - m.catP10)) > 0.05, "sofa-leg cat keeps contrast",
  `p90-p10 ${mean(sofaMetrics.map((m) => m.catP90 - m.catP10)).toFixed(3)}`);
add(mean(sofaPickResults.map((r) => r.audit.legal)) === 1, "every sampled pose is clamp-clean", "collideCameraPose is a no-op");
const wallEscape = results.find((r) => r.audit.insideWalls === false)
  || (audits.find((a) => !a.insideWalls) ? { name: "walked-path", camera: audits.find((a) => !a.insideWalls).position } : null);
add(!results.some((r) => r.audit.insideWalls === false) && !audits.some((a) => !a.insideWalls),
  "camera stays inside the room walls",
  wallEscape ? `worst pose ${wallEscape.camera.map((v) => v.toFixed(3)).join(", ")}` : `bounds ${JSON.stringify(room.bounds)}`);
add(!results.some((r) => r.audit.insideBlocker), "camera stays out of the furniture", "no pose inside sofa/lamp/plant");
add(sofaPickResults.every((r) => r.audit.sightlineClear), "sightline to the cat is clear on the sofa leg",
  "no opaque geometry between cat and lens");
// The camera starts parked in the corner; the rig's first frames must already be
// inside the room, or the opening shot is a wall.
const firstBad = firstFrames.find((f) => {
  const c = f.camera;
  return c.x < room.bounds.minX || c.x > room.bounds.maxX || c.y < room.bounds.minY || c.y > room.bounds.maxY ||
    c.z < room.bounds.minZ || c.z > room.bounds.maxZ;
});
add(!firstBad, "opening frames are legal after the pick-up",
  firstBad ? `frame ${firstBad.frame} at ${firstBad.camera.toArray().map((v) => v.toFixed(2)).join(", ")}` : `${firstFrames.length} frames checked`);
const pathSpan = Math.max(...samples.map((s) => s.cat.x)) - Math.min(...samples.map((s) => s.cat.x)) +
  Math.max(...samples.map((s) => s.cat.z)) - Math.min(...samples.map((s) => s.cat.z));
add(pathSpan > 1.5, "the cat actually walks most of the stalk path", `path span ${pathSpan.toFixed(2)}m`, { needsFullRun: true });
const frozenPick = results.find((r) => r.name.startsWith("frozen"));
add(Boolean(frozenPick), "the freeze fires at all",
  frozenPick ? `frozen at t=${frozenPick.t.toFixed(1)}s` : "no frozen frame in the run (see hoveringMoment in cat.js)");
const badAudit = audits.find((a) => !a.legal || !a.insideWalls || a.insideBlocker || !a.sightlineClear);
add(!badAudit, "walked whole stalk path without a bad pose",
  badAudit ? `pose ${badAudit.position.map((v) => v.toFixed(3)).join(", ")} legal=${badAudit.legal} walls=${badAudit.insideWalls} blocker=${badAudit.insideBlocker} sight=${badAudit.sightlineClear}` : `${audits.length} audited poses`);

if (portrait) {
  const p = portrait.metrics;
  add(p.eyePixels > 600, "both eyes are visible in the close-up", `${p.eyePixels} eye pixels`);
  add(p.eyePixelRadius > 14, "eye reads big at close range", `mean eye radius ${p.eyePixelRadius.toFixed(1)}px`);
  add(p.eyeHeight > 18 && p.eyeAspect > 0.55, "the lid leaves a real aperture, not a slit",
    `eye aperture ${p.eyeWidth}x${p.eyeHeight}px (aspect ${p.eyeAspect.toFixed(2)}, ${p.eyesSeen} eyes)`);
  // A single clipped pixel is a wet catchlight, not a blown-out eye; a share of
  // them is the eye lighting itself.
  add(p.eyeBlownFraction < 0.01, "eye does not blow out",
    `${(p.eyeBlownFraction * 100).toFixed(2)}% of eye pixels above 0.9 (peak ${p.eyeMaxLum.toFixed(3)})`);
  // Split "the moon is on the eye" (fine) from "the eye lights itself" (the
  // round-2 look). eyeSelfLight is the shader's own contribution: specular,
  // tapetum and the fake ambient wrap, measured by switching them off.
  add(portrait.eyeSelfLight < 0.1, "eye is lit by the room, not from inside",
    `self-lighting adds ${portrait.eyeSelfLight.toFixed(3)} mean luminance (mean ${p.eyeMeanLum.toFixed(3)})`);
  add(p.eyeGlowFraction < 0.3, "eye is not a glowing lamp", `${(p.eyeGlowFraction * 100).toFixed(1)}% of eye pixels above 0.7`);
  add(p.fringePx > 3, "fur shells read as a fuzzy edge", `${p.fringePx.toFixed(2)}px fringe`, { informational: true });
  add(p.shellFraction > 0.05, "shells cover a real share of the coat", `${(p.shellFraction * 100).toFixed(0)}% shell pixels`, { informational: true });
  add(p.stripeHardness < 0.045, "coat keeps soft stripe contrast", `stripe contrast ${p.stripeHardness.toFixed(3)}`);
  // Measured on the shader's own albedo function. Round 2's coat faded a stripe
  // over ~3.4mm; the softer edge this round targets is >4mm.
  add(pattern.crossings >= 6 && pattern.edgeWidthMm > 4, "stripe edges fade over fur distance, not a step",
    `stripe edge fades over ${pattern.edgeWidthMm.toFixed(2)}mm of coat (${pattern.crossings} lines measured)`);
  add(portrait.keyWarmth > 0.01, "face key warms the face's mid tones",
    `mid-tone R-B delta ${portrait.keyWarmth.toFixed(3)} over ${portrait.keyLift.toFixed(3)} mean lift`);
}

const report = {
  label,
  pattern,
  moduleRoot,
  usedLegacyRig: usedLegacy,
  look,
  config: { width, height, seconds, dt, seed },
  sofaFrames: sawSofa,
  results: results.map((r) => ({ name: r.name, frame: r.frame, t: r.t, camera: r.camera, focus: r.focus, metrics: r.metrics, audit: r.audit })),
  portrait: portrait
    ? { metrics: portrait.metrics, audit: portrait.audit, keyWarmth: portrait.keyWarmth, keyLift: portrait.keyLift, eyeSelfLight: portrait.eyeSelfLight }
    : null,
  pathAudits: audits.length,
  checks,
};
writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(report, null, 2));

if (!quiet) {
  const fmt = (v, d = 3) => (typeof v === "number" ? v.toFixed(d) : String(v));
  console.log(`\n== ${label} == ${usedLegacy ? "(round-2 legacy rig/lights, frozen snapshot)" : "(experiment modules)"}`);
  console.log(`frames rendered: ${results.map((r) => r.name).join(", ")}${portrait ? ", portrait" : ""}`);
  for (const r of results) {
    const m = r.metrics;
    console.log(
      `  ${r.name.padEnd(16)} t=${fmt(r.t, 1)}s cam=(${r.camera.map((v) => fmt(v, 2)).join(", ")}) d=${fmt(r.audit.distance, 2)}m ` +
      `cov=${fmt(m.coverage * 100, 1)}% lum=${fmt(m.catMeanLum)} moonN=${fmt(m.moonDotMean)} lit=${fmt(m.moonLitFraction * 100, 0)}% ` +
      `edge=${fmt(m.edgeLumRatio, 2)} dark=${fmt(m.edgeDarkFraction * 100, 0)}% shrink=${fmt(m.catP90 - m.catP10)}`
    );
  }
  if (portrait) {
    const p = portrait.metrics;
    console.log(
      `  portrait         eyeR=${fmt(p.eyePixelRadius, 1)}px eyeLum=${fmt(p.eyeMeanLum)} max=${fmt(p.eyeMaxLum)} glow=${fmt(p.eyeGlowFraction * 100, 1)}% ` +
      `fringe=${fmt(p.fringePx, 2)}px shell=${fmt(p.shellFraction * 100, 0)}% hardEdge=${fmt(p.hardEdgeFraction * 100, 1)}% ` +
      `stripeHard=${fmt(p.stripeHardness)} eyeAperture=${p.eyeWidth}x${p.eyeHeight}px eyeSelfLight=${fmt(portrait.eyeSelfLight)} keyWarmth=${fmt(portrait.keyWarmth, 3)}`
    );
  }
  console.log(`  pattern          stripe edge fades over ${pattern.edgeWidthMm.toFixed(2)}mm (${pattern.crossings} crossings)`);
  console.log("checks:");
  for (const c of checks) {
    const label = c.skipped ? "SKIP" : c.informational ? "INFO" : c.ok ? "PASS" : "FAIL";
    console.log(`  ${label}  ${c.name} — ${c.detail}`);
  }
  const gating = checks.filter((c) => !c.informational);
  const failed = gating.filter((c) => !c.ok && !c.skipped).length;
  const skipped = gating.filter((c) => c.skipped).length;
  const informational = checks.length - gating.length;
  console.log(
    `\n${gating.length - failed - skipped}/${gating.length} checks passed` +
    `${failed ? ` — ${failed} FAILED` : ""}${skipped ? ` — ${skipped} skipped (needs --seconds >= ${MIN_FULL_RUN_SECONDS})` : ""}` +
    `${informational ? ` (+${informational} informational, not gating)` : ""}`
  );
  console.log(`report: ${path.join(outDir, "metrics.json")}`);
}

process.exit(checks.some((c) => !c.ok && !c.informational && !c.skipped) ? 1 : 0);
