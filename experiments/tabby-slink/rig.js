import * as THREE from "three";
import { CAMERA_RADIUS, cameraClearance, collideCameraPose } from "./room.js";

/**
 * The follow camera.
 *
 * This used to live inline in main.js. It is a module so the offscreen harness
 * in tools/tabby-slink-harness can drive exactly the code the page runs:
 * framing problems on one stretch of the stalk path are invisible from the
 * others, and a re-implementation inside a test would drift away from the rig
 * it is supposed to be checking.
 *
 * Invariants (unchanged from round 2; main.js now just calls into them):
 *  - Every rendered pose is inside `room.bounds` and clear of every blocker box
 *    by CAMERA_RADIUS (`collide`), so the camera is never inside a wall or the
 *    sofa — the clamp stays on for every pose, including the sofa-leg ones.
 *  - While the rig drives the camera the whole cat->camera segment is kept in
 *    the open volume, so furniture cannot sit between the cat and the lens.
 *  - Manual orbit is only constrained positionally: a parked view slides along
 *    a wall instead of being teleported.
 */

/**
 * Two framing profiles, blended by how close the cat is to the sofa.
 *
 * On the sofa leg the default pose held the lens at 0.26m, half a metre behind
 * the cat's shoulder and only 0.58m off its line: close enough to the sofa that
 * the near frame was furniture, high enough to look *over* the sofa's backrest
 * with the cat's back against it, and far enough back that the animal stayed
 * small and lost its modelling to the camera-mounted fill. That leg now uses
 * its own pose:
 *
 *  - both heights drop (the low pose sits at the cat's own eye line, ~0.19m),
 *    so the lens stops looking down past the sofa and the bright backrest
 *    leaves the frame behind the cat's head;
 *  - `side` pushes further onto the room side of the cat (0.58 -> 0.64), so the
 *    furniture is never between the lens and the animal;
 *  - `back` shortens slightly (0.52 -> 0.44) so the cat fills more of the frame
 *    and its silhouette lands on the dark room rather than on the pale sofa.
 *
 * The lens deliberately stays *behind* the cat here rather than swinging to a
 * front quarter. On this leg the cat is walking away from the window, so the
 * moon rides over its left shoulder and a camera placed ahead of it looks
 * straight into the light: the harness measured that variant at N.moon = -0.14
 * over the cat's pixels (a real silhouette) against +0.12 for the pose below.
 *
 * `raised` still exists as the second-chance pose for the leg; it is simply
 * lower, so even the fallback cannot tower over the furniture.
 */
export const LEG_PROFILES = {
  default: { back: 0.52, side: 0.58, lowHeight: 0.26, raisedHeight: 0.66, sway: 0.04 },
  sofa: { back: 0.44, side: 0.64, lowHeight: 0.19, raisedHeight: 0.42, sway: 0.03 },
};

/** Distance from the sofa's footprint at which the sofa profile is fully on. */
export const SOFA_LEG_MARGIN = 0.62;

/**
 * How much of the sofa-leg treatment applies at this point, 1 at the sofa and
 * 0 once the cat is `SOFA_LEG_MARGIN` away from its footprint. Pure function of
 * the cat's floor position and the sofa's box, so the page and the harness
 * agree on where the leg starts — it is the footprint the cat walks beside, not
 * the furniture's height, that makes this stretch awkward.
 */
export function sofaLegFactor(position, sofaBox, margin = SOFA_LEG_MARGIN) {
  if (!sofaBox) return 0;
  const outsideX =
    position.x < sofaBox.minX
      ? sofaBox.minX - position.x
      : position.x > sofaBox.maxX
        ? position.x - sofaBox.maxX
        : 0;
  const outsideZ =
    position.z < sofaBox.minZ
      ? sofaBox.minZ - position.z
      : position.z > sofaBox.maxZ
        ? position.z - sofaBox.maxZ
        : 0;
  const gap = Math.hypot(outsideX, outsideZ);
  return 1 - THREE.MathUtils.smoothstep(gap, margin * 0.5, margin);
}

/** Blend the two framing profiles. */
export function legProfile(factor, profiles = LEG_PROFILES) {
  const t = THREE.MathUtils.clamp(factor, 0, 1);
  const mix = (a, b) => a + (b - a) * t;
  return {
    t,
    back: mix(profiles.default.back, profiles.sofa.back, t),
    side: mix(profiles.default.side, profiles.sofa.side, t),
    lowHeight: mix(profiles.default.lowHeight, profiles.sofa.lowHeight, t),
    raisedHeight: mix(profiles.default.raisedHeight, profiles.sofa.raisedHeight, t),
    sway: mix(profiles.default.sway, profiles.sofa.sway, t),
  };
}

export function createFollowRig(room, options = {}) {
  const radius = options.radius ?? CAMERA_RADIUS;
  const bounds = room.bounds;
  const blockers = room.cameraBlockers;
  const sofaBox = room.sofaBox || null;
  const profiles = options.profiles || LEG_PROFILES;

  let side = 1; // +1 / -1: which shoulder the rig is on
  let sofaFactor = 0;

  const collide = (position) => collideCameraPose(position, bounds, blockers, radius);
  const clearance = (from, direction, maxDist) =>
    cameraClearance(from, direction, maxDist, bounds, blockers, radius);

  const axis = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const tmpCam = new THREE.Vector3();
  const tmpTarget = new THREE.Vector3();
  const bestCam = new THREE.Vector3();
  const bestTarget = new THREE.Vector3();
  const options4 = [1, -1].flatMap((sideSign) => [
    { sideSign, raised: false },
    { sideSign, raised: true },
  ]);

  /**
   * Candidate pose for one (shoulder, height) option. Returns the requested
   * offset length and how much of it survives contact with the room, in metres.
   */
  function candidate(info, option, elapsed, outCam, outTarget) {
    const leg = legProfile(sofaFactor, profiles);
    // True right of the travel direction: forward x up.
    axis.set(-info.forward.z, 0, info.forward.x).multiplyScalar(option.sideSign);
    offset.copy(axis).multiplyScalar(leg.side + Math.sin(elapsed * 0.17) * leg.sway);
    outTarget.copy(info.focus);
    outTarget.y += 0.035;
    outCam
      .copy(info.position)
      .addScaledVector(info.forward, -leg.back)
      .add(offset);
    outCam.y = option.raised
      ? leg.raisedHeight
      : leg.lowHeight + Math.sin(elapsed * 0.6) * 0.004;
    axis.copy(outCam).sub(outTarget);
    const wanted = axis.length();
    if (wanted < 1e-4) return { wanted: 0, clear: 0 };
    axis.divideScalar(wanted);
    const clear = clearance(outTarget, axis, wanted);
    if (clear < wanted) {
      outCam.copy(outTarget).addScaledVector(axis, clear);
      outCam.y = Math.max(outCam.y, 0.16);
    }
    return { wanted, clear };
  }

  /**
   * Drive the camera for this frame. The rig offers four poses — either
   * shoulder, at cat height or lifted over the furniture — and takes the one
   * that keeps the most room between the cat and the camera, with a small
   * handicap for switching so it does not flip-flop; on the sofa leg the
   * shoulder away from the furniture gets an extra bonus, so the lens prefers
   * the room side but can still take the other one when the sofa blocks it.
   */
  function step(dt, info, elapsed, frames, camera, target, follow = true) {
    let chosen = null;
    if (follow && info) {
      sofaFactor = sofaLegFactor(info.position, sofaBox);
      const sofaOnRight = sofaBox ? info.position.x < sofaBox.minX : true;
      const roomSide = sofaOnRight ? 1 : -1;
      let bestScore = -Infinity;
      for (const option of options4) {
        const { wanted, clear } = candidate(info, option, elapsed, tmpCam, tmpTarget);
        // Score the *shortfall* — how much of the wanted offset the room eats —
        // not the raw clearance, or the candidate with the longest offset would
        // win even when nothing is in the way.
        const shortfall = Math.max(0, wanted - clear);
        const score =
          -shortfall -
          (option.raised ? 0.12 : 0) -
          (option.sideSign === side ? 0 : 0.22) -
          (sofaFactor > 0.05 && option.sideSign !== roomSide ? 0.4 * sofaFactor : 0);
        if (score > bestScore) {
          bestScore = score;
          chosen = { ...option, wanted, clear, shortfall, score };
          bestCam.copy(tmpCam);
          bestTarget.copy(tmpTarget);
        }
      }
      if (chosen) {
        side = chosen.sideSign;
        const k = frames < 2 ? 1 : 1 - Math.exp(-dt * 2.4);
        camera.position.lerp(bestCam, k);
        target.lerp(bestTarget, k);
      }
    }
    collide(camera.position);
    // Spring arm shared by both rigs: if the cat ended up outside the open
    // volume from this pose, slide the camera in along the view axis.
    axis.copy(camera.position).sub(target);
    const distance = axis.length();
    if (distance > 1e-4) {
      axis.divideScalar(distance);
      const clear = clearance(target, axis, distance);
      if (clear < distance) camera.position.copy(target).addScaledVector(axis, clear);
      collide(camera.position);
    }
    return chosen;
  }

  return {
    collide,
    clearance,
    candidate,
    step,
    get side() {
      return side;
    },
    get sofaFactor() {
      return sofaFactor;
    },
  };
}
