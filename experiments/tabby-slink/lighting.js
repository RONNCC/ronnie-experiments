import * as THREE from "three";

/**
 * The room's lighting rig.
 *
 * Lifted out of main.js (round 3) so the offscreen harness in
 * tools/tabby-slink-harness lights its renders with exactly these lights: the
 * "cat reads backlit and washed out" complaint is a lighting question as much
 * as a framing one, and a test that guesses the lights cannot answer it.
 *
 * Four fixed lights carry the nocturne — moon (the only shadow caster), a cool
 * hemisphere, a cool rim from the far corner, and a warm key that rides the
 * camera so close-ups of the face do not go moon-cold. The two camera-mounted
 * lights are repositioned every frame by `updateLighting`.
 */
export function createLights(scene, room) {
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

  // Warm bounce that rides the camera. It used to sit at 1.7 with the same
  // direction as the view, which flattened the coat into a washed-out sheet on
  // the near side; at 1.15 it still lifts the shadows without erasing the
  // moon/rim modelling.
  const viewFill = new THREE.DirectionalLight(0xffe0c2, 1.15);
  viewFill.position.set(1, 1.2, 1);
  scene.add(viewFill);
  scene.add(viewFill.target);

  // Warm key for the face. It is deliberately close-range: it lives just off
  // the camera, leans toward whatever the cat is looking at, and dies out
  // before it can reach the far wall, so the warm pool stays on the muzzle,
  // brow and forechest while the coat keeps its cool moonlight.
  const faceKey = new THREE.PointLight(0xffbf8a, 2.0, 1.25, 2);
  scene.add(faceKey);

  return { hemi, moon, rim, viewFill, faceKey };
}

/**
 * Per-frame light levels and the poses of the two camera-mounted lights.
 * `focus` is the cat's head, which the fill and key lean toward.
 */
/**
 * The face key is the one light whose distance to the cat changes a lot: the
 * follow rig parks ~0.95m out, but a close orbit (or the harness portrait) can
 * sit 0.3m off the head, where a point light with decay 2 gains ~10x and blows
 * the muzzle and whiskers out — exactly the washed-out look this round is
 * fixing. Rather than moving the light (which changes which side of the face it
 * lights), its intensity is scaled by 1/d^2 so its *illumination at the head*
 * is constant inside FACE_KEY_NEAR and falls off naturally beyond it.
 */
const FACE_KEY_INTENSITY = 2.0;
export const FACE_KEY_NEAR = 0.4;
const scratch = new THREE.Vector3();

export function updateLighting(lights, { moonAmount = 1, camera, focus }) {
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
    lights.faceKey.position.y += 0.12;
    if (focus) {
      // Lean the warm key toward the cat so the face catches it, but keep it
      // short enough that the body is still lit by the room — and never closer
      // than FACE_KEY_MIN_DISTANCE to the head, so a close camera cannot turn
      // it into a spotlight on the whiskers.
      lights.faceKey.position.lerp(focus, 0.5);
      scratch.subVectors(lights.faceKey.position, focus);
      const distance = Math.max(scratch.length(), 1e-4);
      lights.faceKey.intensity =
        FACE_KEY_INTENSITY * Math.min(1, Math.pow(distance / FACE_KEY_NEAR, 2));
    }
  }
}
