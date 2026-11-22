import * as THREE from "three";

/** Closed stalk through the moonbeam, along the sofa, and across the rug. */
export const STALK_PATH = [
  new THREE.Vector3(-1.15, 0, 0.92),
  new THREE.Vector3(-1.42, 0, 0.28),
  new THREE.Vector3(-1.36, 0, -0.42),
  new THREE.Vector3(-0.62, 0, -1.12),
  new THREE.Vector3(0.22, 0, -1.18),
  new THREE.Vector3(0.92, 0, -0.78),
  new THREE.Vector3(1.08, 0, -0.05),
  new THREE.Vector3(0.86, 0, 0.58),
  new THREE.Vector3(0.12, 0, 0.98),
  new THREE.Vector3(-0.62, 0, 1.02),
];

export const INTEREST = {
  moonbeam: new THREE.Vector3(0.12, 0.08, -1.08),
  mouse: new THREE.Vector3(0.22, 0.015, 0.32),
};

/**
 * Camera collision, as pure functions over the room's own volume so that the
 * rules and the geometry cannot drift apart.
 *
 * The camera is a sphere of `radius` that must stay inside `bounds` and clear
 * of every blocker box. Both operations are pure: the follow rig, manual orbit
 * and the render self-check all run against the same definitions.
 */
export const CAMERA_RADIUS = 0.14;

export function clampToCameraBounds(position, bounds) {
  position.x = Math.min(bounds.maxX, Math.max(bounds.minX, position.x));
  position.y = Math.min(bounds.maxY, Math.max(bounds.minY, position.y));
  position.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, position.z));
  return position;
}

/**
 * Push a position out of one blocker box until it has `radius` of air, choosing
 * among exits that actually land inside the room. Picking the nearest face
 * blindly is how the old blanket clamp shoved a camera inside the sofa down
 * through the floor and then re-clamped it straight back into the sofa.
 */
function pushOutOfBlocker(position, box, bounds, radius) {
  const cx = Math.min(Math.max(position.x, box.minX), box.maxX);
  const cy = Math.min(Math.max(position.y, box.minY), box.maxY);
  const cz = Math.min(Math.max(position.z, box.minZ), box.maxZ);
  const dx = position.x - cx;
  const dy = position.y - cy;
  const dz = position.z - cz;
  const dist = Math.hypot(dx, dy, dz);
  if (dist > radius) return false;
  if (dist > 1e-6) {
    const push = (radius - dist) / dist;
    position.x += dx * push;
    position.y += dy * push;
    position.z += dz * push;
    return true;
  }
  // Centre inside the box: rank the faces by how far the camera must travel,
  // keep only exits that end inside the room, and prefer climbing over low
  // furniture when that is nearly as cheap as stepping out the side.
  const inRoom = (p) =>
    p.x >= bounds.minX - 1e-6 && p.x <= bounds.maxX + 1e-6 &&
    p.y >= bounds.minY - 1e-6 && p.y <= bounds.maxY + 1e-6 &&
    p.z >= bounds.minZ - 1e-6 && p.z <= bounds.maxZ + 1e-6;
  const probe = position.clone();
  const candidates = [
    ["x", position.x - box.minX, box.minX - radius],
    ["x", box.maxX - position.x, box.maxX + radius],
    ["y", position.y - box.minY, box.minY - radius],
    ["y", box.maxY - position.y, box.maxY + radius],
    ["z", position.z - box.minZ, box.minZ - radius],
    ["z", box.maxZ - position.z, box.maxZ + radius],
  ]
    .filter(([axis, , value]) => {
      probe.copy(position);
      probe[axis] = value;
      return inRoom(probe);
    })
    .sort((a, b) => a[1] - b[1]);
  if (!candidates.length) return false;
  const climb = candidates.find(([axis, , value]) => axis === "y" && value > box.maxY);
  const best = climb && climb[1] <= candidates[0][1] + 0.12 ? climb : candidates[0];
  position[best[0]] = best[2];
  return true;
}

export function collideCameraPose(position, bounds, blockers, radius = CAMERA_RADIUS) {
  clampToCameraBounds(position, bounds);
  for (let pass = 0; pass < 3; pass++) {
    let moved = false;
    for (const box of blockers) moved = pushOutOfBlocker(position, box, bounds, radius) || moved;
    clampToCameraBounds(position, bounds);
    if (!moved) break;
  }
  // A pose wedged in a gap narrower than the camera — between the sofa and the
  // right wall, or in the plant/lamp-table pocket — can ping-pong between two
  // boxes forever. When that happens, climb: lift until every offending box is
  // underneath. Everything in this room is low enough for that to resolve.
  const clearanceTo = (box) => {
    const dx = Math.max(box.minX - position.x, 0, position.x - box.maxX);
    const dy = Math.max(box.minY - position.y, 0, position.y - box.maxY);
    const dz = Math.max(box.minZ - position.z, 0, position.z - box.maxZ);
    return Math.hypot(dx, dy, dz);
  };
  const offenders = blockers.filter((box) => clearanceTo(box) < radius);
  if (offenders.length) {
    const ceiling = Math.min(bounds.maxY, Math.max(...offenders.map((box) => box.maxY)) + radius);
    position.y = ceiling;
    clampToCameraBounds(position, bounds);
  }
  return position;
}

/**
 * How far a ray may travel from `from` before it leaves the open volume.
 * Called with the cat's head as origin, which sits at floor level, so the floor
 * is deliberately not constrained here: `collideCameraPose` keeps the final
 * pose off it. Walls, ceiling and furniture are enforced with the full radius.
 */
export function cameraClearance(from, direction, maxDist, bounds, blockers, radius = CAMERA_RADIUS) {
  const marginY = 0.02;
  let lo = 0;
  let hi = maxDist;
  // Walls, ceiling and furniture are enforced with the full radius. The floor
  // is deliberately not: `from` is the cat's head, which is at floor level, and
  // collideCameraPose keeps the final pose off the floor positionally.
  const axes = [
    [from.x, direction.x, bounds.minX + radius, bounds.maxX - radius],
    [from.z, direction.z, bounds.minZ + radius, bounds.maxZ - radius],
    [from.y, direction.y, -Infinity, bounds.maxY - marginY],
  ];
  for (const [o, d, min, max] of axes) {
    if (Math.abs(d) < 1e-6) {
      if (o < min || o > max) return 0;
      continue;
    }
    const t1 = (min - o) / d;
    const t2 = (max - o) / d;
    lo = Math.max(lo, Math.min(t1, t2));
    hi = Math.min(hi, Math.max(t1, t2));
    if (lo > hi) return 0;
  }
  let allowed = Math.max(0, hi);
  for (const box of blockers) {
    const entry = rayBoxEntry(from, direction, box, radius);
    if (entry !== null && entry > 0 && entry < allowed) allowed = Math.max(0, entry - 0.02);
  }
  return allowed;
}

function rayBoxEntry(origin, direction, box, pad) {
  let tEnter = 0;
  let tExit = Infinity;
  const axes = [
    [origin.x, direction.x, box.minX - pad, box.maxX + pad],
    [origin.y, direction.y, box.minY - pad, box.maxY + pad],
    [origin.z, direction.z, box.minZ - pad, box.maxZ + pad],
  ];
  for (const [o, d, min, max] of axes) {
    if (Math.abs(d) < 1e-6) {
      if (o < min || o > max) return null;
      continue;
    }
    const t1 = (min - o) / d;
    const t2 = (max - o) / d;
    tEnter = Math.max(tEnter, Math.min(t1, t2));
    tExit = Math.min(tExit, Math.max(t1, t2));
    if (tEnter > tExit) return null;
  }
  if (tExit < 0) return null;
  // An origin already inside the padded box (the cat hugging the sofa) is not
  // an obstruction *between* the two points, so it does not shorten the ray.
  return tEnter > 0 ? tEnter : null;
}

const WOOD_FUNCS = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}
`;

function woodMaterial() {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.02,
  });
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vWorldPosition;`)
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vWorldPosition;
${WOOD_FUNCS}`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
{
  vec3 wp = vWorldPosition;
  float plank = floor(wp.x / 0.14);
  float along = wp.z + hash13(vec3(plank, 2.0, 0.0)) * 3.0;
  float seam = smoothstep(0.012, 0.0, abs(fract(wp.x / 0.14 + 0.5) - 0.5) - 0.47);
  float grain = vnoise(vec3(wp.x * 3.0, along * 28.0, plank));
  float knot = smoothstep(0.18, 0.0, length(fract(vec2(wp.x * 0.37, along * 0.11)) - 0.5) - 0.02);
  vec3 a = pow(vec3(0.45, 0.26, 0.13), vec3(2.2));
  vec3 b = pow(vec3(0.28, 0.15, 0.08), vec3(2.2));
  vec3 c = pow(vec3(0.62, 0.4, 0.22), vec3(2.2));
  float tone = hash13(vec3(plank, 0.0, 1.0));
  vec3 wood = mix(a, b, tone);
  wood = mix(wood, c, grain * 0.35);
  wood *= 0.72 + 0.28 * vnoise(vec3(along * 9.0, plank, 0.0));
  wood = mix(wood, wood * 0.35, seam);
  wood = mix(wood, wood * vec3(0.55, 0.4, 0.28), knot * 0.55);
  diffuseColor.rgb = wood;
}`
      );
  };
  mat.customProgramCacheKey = () => "tabby-wood-v1";
  return mat;
}

function rugMaterial() {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0,
  });
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vWorldPosition;`)
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vWorldPosition;`)
      .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
{
  vec2 uv = vWorldPosition.xz;
  vec2 p = uv / vec2(0.82, 0.52);
  float border = smoothstep(0.92, 0.8, max(abs(p.x), abs(p.y)));
  float inner = smoothstep(0.72, 0.6, max(abs(p.x), abs(p.y)));
  float med = smoothstep(0.22, 0.16, length(p));
  float ring = smoothstep(0.34, 0.3, length(p)) * smoothstep(0.22, 0.26, length(p));
  vec3 field = pow(vec3(0.42, 0.16, 0.18), vec3(2.2));
  vec3 trim = pow(vec3(0.78, 0.66, 0.48), vec3(2.2));
  vec3 ink = pow(vec3(0.16, 0.08, 0.08), vec3(2.2));
  vec3 col = mix(ink, field, border);
  col = mix(col, trim, (1.0 - inner) * border * 0.85);
  col = mix(col, trim, med);
  col = mix(col, ink, ring);
  diffuseColor.rgb = col;
}`
    );
  };
  mat.customProgramCacheKey = () => "tabby-rug-v1";
  return mat;
}

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createWindow(parent) {
  const group = new THREE.Group();
  group.position.set(0.18, 1.18, -1.66);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a241e, roughness: 0.6 });
  const trim = 0.045;
  const W = 1.05;
  const H = 1.28;
  group.add(box(W + trim, trim, 0.04, frameMat, 0, H / 2, 0));
  group.add(box(W + trim, trim, 0.04, frameMat, 0, -H / 2, 0));
  group.add(box(trim, H, 0.04, frameMat, -W / 2, 0, 0));
  group.add(box(trim, H, 0.04, frameMat, W / 2, 0, 0));
  group.add(box(trim * 0.7, H, 0.03, frameMat, 0, 0, 0.01));
  group.add(box(W, trim * 0.7, 0.03, frameMat, 0, 0.05, 0.01));

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.04, H - 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x9bb6e8,
      emissive: 0x6d86b8,
      emissiveIntensity: 0.55,
      roughness: 0.18,
      metalness: 0,
      transparent: true,
      opacity: 0.28,
    })
  );
  glass.position.z = -0.01;
  group.add(glass);

  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 32),
    new THREE.MeshBasicMaterial({ color: 0xf4f7ff })
  );
  moon.position.set(-0.22, 0.28, -0.04);
  group.add(moon);
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.2, 32),
    new THREE.MeshBasicMaterial({
      color: 0xc9d8ff,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    })
  );
  glow.position.copy(moon.position);
  glow.position.z += 0.001;
  group.add(glow);

  parent.add(group);
  return group;
}

function createShaft(parent) {
  const geo = new THREE.CylinderGeometry(0.16, 0.95, 2.55, 18, 1, true);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.09 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float along = vUv.y;
        float fade = smoothstep(0.0, 0.12, along) * smoothstep(1.0, 0.35, along);
        float streak = 0.72 + 0.28 * sin(vUv.x * 22.0 + uTime * 0.35 + along * 6.0);
        vec3 col = vec3(0.72, 0.82, 1.0);
        gl_FragColor = vec4(col, fade * streak * uOpacity);
        #include <colorspace_fragment>
      }
    `,
  });
  const shaft = new THREE.Mesh(geo, mat);
  shaft.position.set(0.05, 0.95, -0.72);
  shaft.rotation.x = 0.72;
  shaft.rotation.z = 0.08;
  shaft.renderOrder = 2;
  parent.add(shaft);
  return shaft;
}

function createDust(parent) {
  const count = 160;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1.3;
    positions[i * 3 + 1] = 0.15 + Math.random() * 1.35;
    positions[i * 3 + 2] = -1.35 + Math.random() * 1.15;
    seeds[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xe7eeff,
      size: 0.012,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  parent.add(points);
  return { points, seeds, base: positions.slice() };
}

function createCurtain(parent) {
  const geo = new THREE.PlaneGeometry(0.55, 1.45, 12, 24);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 14.0) * 0.025 * (0.35 + (y + 0.7) * 0.2));
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: 0xc5d0df,
      roughness: 0.78,
      metalness: 0,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    })
  );
  mesh.position.set(-0.52, 1.15, -1.6);
  parent.add(mesh);
  return mesh;
}

function createSofa(parent) {
  const fabric = new THREE.MeshStandardMaterial({ color: 0x243044, roughness: 0.92 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a4630, roughness: 0.55 });
  const group = new THREE.Group();
  group.position.set(1.62, 0, 0.12);
  const seat = box(0.7, 0.16, 1.42, fabric, 0, 0.32, 0);
  const back = box(0.16, 0.42, 1.42, fabric, 0.27, 0.58, 0);
  const armL = box(0.62, 0.22, 0.12, fabric, 0.02, 0.48, -0.68);
  const armR = box(0.62, 0.22, 0.12, fabric, 0.02, 0.48, 0.68);
  const cushion = box(0.52, 0.08, 0.62, fabric, -0.04, 0.44, -0.28);
  const cushion2 = box(0.52, 0.08, 0.58, fabric, -0.04, 0.44, 0.32);
  group.add(seat, back, armL, armR, cushion, cushion2);
  for (const [x, z] of [[-0.24, -0.58], [0.22, -0.58], [-0.24, 0.58], [0.22, 0.58]]) {
    group.add(box(0.05, 0.24, 0.05, wood, x, 0.12, z));
  }
  parent.add(group);
  return group;
}

function createLamp(parent) {
  const group = new THREE.Group();
  group.position.set(-1.62, 0, -1.28);
  const wood = new THREE.MeshStandardMaterial({ color: 0x5c3d28, roughness: 0.5 });
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xffe1c2,
    emissive: 0xffb27a,
    emissiveIntensity: 2.4,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  group.add(box(0.46, 0.04, 0.36, wood, 0, 0.36, 0));
  group.add(box(0.06, 0.34, 0.06, wood, -0.16, 0.17, -0.12));
  group.add(box(0.06, 0.34, 0.06, wood, 0.16, 0.17, -0.12));
  group.add(box(0.06, 0.34, 0.06, wood, -0.16, 0.17, 0.12));
  group.add(box(0.06, 0.34, 0.06, wood, 0.16, 0.17, 0.12));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.22, 8), wood);
  stem.position.set(0, 0.5, 0);
  stem.castShadow = true;
  group.add(stem);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.12, 16, 1, true), shadeMat);
  shade.position.set(0, 0.64, 0);
  group.add(shade);
  const bulb = new THREE.PointLight(0xffb07a, 18, 5.5, 2);
  bulb.position.set(0, 0.62, 0);
  bulb.castShadow = false;
  group.add(bulb);

  const book = box(0.16, 0.03, 0.22, new THREE.MeshStandardMaterial({ color: 0x6e2a32, roughness: 0.8 }), -0.1, 0.4, 0.04);
  const book2 = box(0.15, 0.025, 0.2, new THREE.MeshStandardMaterial({ color: 0x2c3a4a, roughness: 0.75 }), -0.08, 0.43, 0.05);
  group.add(book, book2);
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.032, 0.07, 12),
    new THREE.MeshStandardMaterial({ color: 0xd8c7b0, roughness: 0.4 })
  );
  mug.position.set(0.12, 0.42, 0.04);
  mug.castShadow = true;
  group.add(mug);
  parent.add(group);
  return { group, bulb };
}

function createPlant(parent) {
  const group = new THREE.Group();
  group.position.set(-1.82, 0, -0.72);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.08, 0.16, 12),
    new THREE.MeshStandardMaterial({ color: 0xa3543c, roughness: 0.7 })
  );
  pot.position.y = 0.08;
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.02, 10),
    new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 1 })
  );
  soil.position.y = 0.16;
  group.add(soil);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1e4a32, roughness: 0.65 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x356b48, roughness: 0.6 });
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), i % 2 ? leafMat2 : leafMat);
    const a = (i / 7) * Math.PI * 2;
    leaf.scale.set(0.55, 1.3, 0.28);
    leaf.position.set(Math.cos(a) * 0.08, 0.34 + (i % 3) * 0.06, Math.sin(a) * 0.08);
    leaf.rotation.z = Math.cos(a) * 0.5;
    leaf.rotation.x = Math.sin(a) * 0.4;
    leaf.castShadow = true;
    group.add(leaf);
  }
  parent.add(group);
  return group;
}

function createMouseToy(parent) {
  const group = new THREE.Group();
  group.position.copy(INTEREST.mouse);
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0x8a8680, roughness: 0.7 })
  );
  body.scale.set(0.7, 0.62, 1.25);
  body.castShadow = true;
  group.add(body);
  const earMat = new THREE.MeshStandardMaterial({ color: 0x6e6a64, roughness: 0.7 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xd9a0a4, roughness: 0.5 });
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), earMat);
    ear.position.set(s * 0.008, 0.01, -0.004);
    group.add(ear);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 5), pink);
    inner.position.set(s * 0.008, 0.01, -0.002);
    group.add(inner);
  }
  const tailPts = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    tailPts.push(new THREE.Vector3(0, 0.002, 0.02 + t * 0.05).add(new THREE.Vector3(Math.sin(t * 3.0) * 0.01, 0, 0)));
  }
  const tail = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPts), 8, 0.0016, 4, false),
    earMat
  );
  group.add(tail);
  parent.add(group);
  return group;
}

function createMoth() {
  const group = new THREE.Group();
  const wingMat = new THREE.MeshBasicMaterial({
    color: 0xd9d3c2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.82,
  });
  const lw = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.012), wingMat);
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.012), wingMat);
  lw.position.x = -0.009;
  rw.position.x = 0.009;
  group.add(lw, rw);
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.0016, 0.006, 2, 4),
    new THREE.MeshBasicMaterial({ color: 0x5c5144 })
  );
  body.rotation.x = Math.PI / 2;
  group.add(body);
  group.position.set(0.15, 0.72, -1.15);
  return { group, lw, rw };
}

export function createRoom() {
  const root = new THREE.Group();
  root.name = "room";

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), woodMaterial());
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  const voidMat = new THREE.MeshStandardMaterial({ color: 0x100e0c, roughness: 1 });
  const skirt = new THREE.Mesh(new THREE.RingGeometry(3.2, 7.5, 48), voidMat);
  skirt.rotation.x = -Math.PI / 2;
  skirt.position.y = -0.002;
  skirt.receiveShadow = true;
  root.add(skirt);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1714, roughness: 0.94 });
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 0.7 });
  const back = box(4.7, 2.25, 0.08, wallMat, 0, 1.125, -1.74);
  const left = box(0.08, 2.25, 3.3, wallMat, -2.22, 1.125, -0.1);
  const right = box(0.08, 2.25, 3.3, wallMat, 2.22, 1.125, -0.1);
  root.add(back, left, right);
  root.add(box(4.55, 0.08, 0.03, baseMat, 0, 0.04, -1.68));
  root.add(box(0.03, 0.08, 3.15, baseMat, -2.16, 0.04, -0.1));
  root.add(box(0.03, 0.08, 3.15, baseMat, 2.16, 0.04, -0.1));

  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.12), rugMaterial());
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.05, 0.006, 0.18);
  rug.receiveShadow = true;
  root.add(rug);

  createWindow(root);
  const shaft = createShaft(root);
  const dust = createDust(root);
  const curtain = createCurtain(root);
  const sofa = createSofa(root);
  const lamp = createLamp(root);
  const plant = createPlant(root);
  const mouse = createMouseToy(root);
  const moth = createMoth();
  root.add(moth.group);

  const moonDir = new THREE.Vector3(-0.35, 2.6, -2.4).normalize();

  /*
   * The follow camera sits about 0.6 m behind and beside the cat. Its desired
   * position can land inside the back wall or inside the sofa, which reads as a
   * black or wall-filled view — the same symptom as a stray overlay, but caused
   * by geometry. `bounds` is the volume the camera is allowed to occupy and
   * `cameraBlockers` are the furniture boxes it must stay out of; main.js holds
   * both as an invariant. Blocker boxes come from the real meshes, so moving a
   * piece of furniture keeps them honest.
   */
  root.updateMatrixWorld(true);
  const bounds = {
    minX: -2.05, // side walls' inner faces sit at ±2.18
    maxX: 2.05,
    // Back wall's inner face is at -1.70. The old -1.52 left only 18cm, which
    // manual orbit could spend in one drag: the camera ended up against the
    // wall with the cat behind it. 40cm keeps a parked orbit inside the room.
    minZ: -1.30,
    maxZ: 2.4,
    minY: 0.14,
    maxY: 2.05,
  };
  const blockerBox = (group) => {
    const box = new THREE.Box3().setFromObject(group).expandByScalar(0.06);
    return { minX: box.min.x, maxX: box.max.x, minY: box.min.y, maxY: box.max.y, minZ: box.min.z, maxZ: box.max.z };
  };
  const sofaBox = blockerBox(sofa);
  const cameraBlockers = [sofaBox, blockerBox(lamp.group), blockerBox(plant)];

  return {
    object: root,
    lamp: lamp.bulb,
    shaft,
    moonDir,
    mouse,
    moth: moth.group,
    bounds,
    cameraBlockers,
    sofaBox,
    update(dt, elapsed, moonAmount) {
      shaft.material.uniforms.uTime.value = elapsed;
      shaft.material.uniforms.uOpacity.value = 0.045 + moonAmount * 0.07;
      const attr = dust.points.geometry.attributes.position;
      for (let i = 0; i < dust.seeds.length; i++) {
        const s = dust.seeds[i];
        attr.setX(i, dust.base[i * 3] + Math.sin(elapsed * 0.25 + s) * 0.04);
        attr.setY(i, dust.base[i * 3 + 1] + ((elapsed * 0.03 + s) % 1.2) - 0.2);
        attr.setZ(i, dust.base[i * 3 + 2] + Math.cos(elapsed * 0.2 + s) * 0.03);
      }
      attr.needsUpdate = true;
      curtain.position.x = -0.52 + Math.sin(elapsed * 0.35) * 0.008;

      const t = elapsed * 0.37;
      moth.group.position.set(
        0.05 + Math.sin(t * 0.7) * 0.38,
        0.55 + Math.sin(t * 1.3) * 0.18 + 0.22,
        -1.22 + Math.cos(t * 0.5) * 0.16
      );
      const flap = Math.sin(elapsed * 28) * 0.7;
      moth.lw.rotation.y = 0.4 + flap;
      moth.rw.rotation.y = -0.4 - flap;
      moth.group.lookAt(moth.group.position.x + 0.1, moth.group.position.y, moth.group.position.z + 0.2);
    },
  };
}
