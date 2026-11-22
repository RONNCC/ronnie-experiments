/**
 * Round-2 snapshots, used only when the harness is pointed at a checkout that
 * predates rig.js / lighting.js (i.e. a baseline run against a8305c8).
 *
 * These are copies of what main.js did at that commit, kept verbatim so a
 * "before" render is driven by the same camera and lights the page ran, not by
 * a guess. Nothing in the shipped experiment imports this file.
 */
import * as THREE from "three";
import { CAMERA_RADIUS, cameraClearance, collideCameraPose } from "./module-exports.mjs";

export function createLegacyFollowRig(room) {
  const bounds = room.bounds;
  const blockers = room.cameraBlockers;
  const desiredCam = new THREE.Vector3();
  const desiredTarget = new THREE.Vector3();
  const candidateCam = new THREE.Vector3();
  const candidateTarget = new THREE.Vector3();
  const camRight = new THREE.Vector3();
  const cameraDir = new THREE.Vector3();
  let followSide = 1;

  const collide = (position) => collideCameraPose(position, bounds, blockers, CAMERA_RADIUS);
  const clearance = (from, direction, maxDist) =>
    cameraClearance(from, direction, maxDist, bounds, blockers, CAMERA_RADIUS);

  function followCandidate(info, sideSign, raised, elapsed, outCam, outTarget) {
    const side = (0.58 + Math.sin(elapsed * 0.17) * 0.04) * sideSign;
    const back = 0.52;
    camRight.set(-info.forward.z, 0, info.forward.x).multiplyScalar(sideSign);
    outTarget.copy(info.focus);
    outTarget.y += 0.035;
    outCam.copy(info.position).addScaledVector(info.forward, -back).addScaledVector(camRight, side);
    outCam.y = raised ? 0.66 : 0.26 + Math.sin(elapsed * 0.6) * 0.004;
    cameraDir.copy(outCam).sub(outTarget);
    const wanted = cameraDir.length();
    if (wanted < 1e-4) return { wanted: 0, clear: 0 };
    cameraDir.divideScalar(wanted);
    const clear = clearance(outTarget, cameraDir, wanted);
    if (clear < wanted) {
      outCam.copy(outTarget).addScaledVector(cameraDir, clear);
      outCam.y = Math.max(outCam.y, 0.16);
    }
    return { wanted, clear };
  }

  function step(dt, info, elapsed, frames, camera, target, follow = true) {
    let chosen = null;
    if (follow && info) {
      let bestScore = -Infinity;
      for (const sideSign of [followSide, -followSide]) {
        for (const raised of [false, true]) {
          const { wanted, clear } = followCandidate(info, sideSign, raised, elapsed, candidateCam, candidateTarget);
          const shortfall = Math.max(0, wanted - clear);
          const score = -shortfall - (raised ? 0.12 : 0) - (sideSign === followSide ? 0 : 0.22);
          if (score > bestScore) {
            bestScore = score;
            followSide = sideSign;
            chosen = { sideSign, raised, wanted, clear, shortfall, score };
            desiredCam.copy(candidateCam);
            desiredTarget.copy(candidateTarget);
          }
        }
      }
      const k = frames < 2 ? 1 : 1 - Math.exp(-dt * 2.4);
      camera.position.lerp(desiredCam, k);
      target.lerp(desiredTarget, k);
    }
    collide(camera.position);
    cameraDir.copy(camera.position).sub(target);
    const distance = cameraDir.length();
    if (distance > 1e-4) {
      cameraDir.divideScalar(distance);
      const clear = clearance(target, cameraDir, distance);
      if (clear < distance) camera.position.copy(target).addScaledVector(cameraDir, clear);
      collide(camera.position);
    }
    return chosen;
  }

  return { collide, clearance, step, get side() { return followSide; } };
}

export function createLegacyLights(scene, room) {
  const hemi = new THREE.HemisphereLight(0x9aafc8, 0x4a3020, 1.05);
  scene.add(hemi);

  const moon = new THREE.DirectionalLight(0xd5e4ff, 5.4);
  moon.position.copy(room.moonDir).multiplyScalar(6);
  scene.add(moon);
  scene.add(moon.target);

  const rim = new THREE.DirectionalLight(0xb7c6e4, 1.7);
  rim.position.set(2.4, 1.6, 2.2);
  scene.add(rim);

  const viewFill = new THREE.DirectionalLight(0xffe0c2, 1.7);
  viewFill.position.set(1, 1.2, 1);
  scene.add(viewFill);
  scene.add(viewFill.target);

  const faceKey = new THREE.PointLight(0xffd8b4, 0.55, 1.7, 2);
  scene.add(faceKey);

  return { hemi, moon, rim, viewFill, faceKey };
}

export function updateLegacyLights(lights, { moonAmount = 1, camera, focus }) {
  lights.moon.intensity = 3.6 + moonAmount * 2.6;
  lights.hemi.intensity = 0.7 + moonAmount * 0.45;
  if (camera) {
    lights.viewFill.position.copy(camera.position);
    lights.viewFill.position.y += 0.35;
    if (focus) {
      lights.viewFill.target.position.copy(focus);
      lights.viewFill.target.updateMatrixWorld();
    }
    lights.faceKey.position.copy(camera.position);
    lights.faceKey.position.y += 0.14;
  }
}

/** Round-2 look constants, for baseline renders. */
export const LEGACY_LOOK = {
  FUR_LOOK: {
    shells: {
      lifts: [0.0016, 0.0034, 0.0054],
      opacities: [0.34, 0.24, 0.14],
      fadeReference: 0.0054,
      strandScale: 380,
      cutoffBase: 0.30,
      cutoffSlope: 62,
      liftJitter: 0.0075,
      alphaNear: 0.62,
      alphaFar: 0.30,
      meltNear: 0.45,
      meltFar: 1.0,
      meltEdgeStart: -0.15,
      meltEdgeEnd: 0.6,
    },
    rim: { color: [0.42, 0.24, 0.10], strength: 0.16, exponent: 2.15 },
    fuzz: { color: [0.30, 0.19, 0.09], strength: 0.10, exponent: 1.6 },
    stripe: { edgeLow: 0.02, edgeHigh: 0.48, grain: 0.0, roughness: 0.1 },
  },
  EYE_LOOK: {
    pupil: 0.28,
    shine: 0.14,
    shineAlert: 0.38,
    irisInner: 0.78,
    irisOuter: 0.56,
    specular: 0.42,
    specularPower: 34,
    broadSheen: 1.0,
    tapetum: 0.45,
    tapetumShine: 0.5,
    wrap: [0.52, 0.62],
    pupilWidth: [0.06, 0.30],
    pupilHeight: [0.34, 0.46],
    irisInnerColor: [0.93, 0.72, 0.22],
    irisOuterColor: [0.42, 0.62, 0.16],
    scleraColor: [0.16, 0.1, 0.07],
    lidColor: [0.45, 0.26, 0.13],
    fibers: 0.2,
    limbus: 1.0,
    limbusTint: [0.25, 0.32, 0.12],
    freckle: 0.28,
    collar: 0.65,
    collarTint: [0.55, 0.4, 0.15],
    lidLineOpen: 0.62,
    lidLineShut: -0.7,
  },
};
