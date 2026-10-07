/**
 * Offscreen renderer for the tabby-slink harness.
 *
 * There is no GPU (and no browser binary) in this sandbox, so this walks the
 * real three.js scene the page builds — same room, same cat, same lights, same
 * matrices — and rasterises it on the CPU into a PNG.
 *
 * It is an *approximation* of the GPU shaders, and deliberately so:
 *  - MeshStandard/Physical surfaces are shaded as Lambert + hemisphere + the
 *    point lights, using three's own attenuation and ACES tone curve, with no
 *    shadows and no specular terms.
 *  - The two bespoke shaders (the tabby coat in fur.js and the eye material)
 *    are ported to JS here, reading their constants from FUR_LOOK/EYE_LOOK so
 *    they cannot silently drift from what the page compiles.
 *
 * That is enough for the questions the harness asks — is the cat in frame, is
 * it lit from the camera's side or silhouetted against the room, how big is the
 * eye, how hard are the stripes, how soft is the fur edge — and it is
 * explicitly not a pixel-exact stand-in for what a browser draws.
 */
import * as THREE from "three";

const RECIPROCAL_PI = 0.3183098861837907;

/*
 * The coat/eye constants the ported shaders read. They are injected rather than
 * imported so the harness can render a *baseline* checkout too (round 2 had no
 * FUR_LOOK export), and so a run always reports which numbers it used.
 */
let FUR_LOOK = null;
let EYE_LOOK = null;
export function setLook(look) {
  if (!look || !look.FUR_LOOK || !look.EYE_LOOK) throw new Error("setLook needs { FUR_LOOK, EYE_LOOK }");
  FUR_LOOK = look.FUR_LOOK;
  EYE_LOOK = look.EYE_LOOK;
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const saturate = (v) => clamp(v, 0, 1);
const smoothstep = (e0, e1, x) => {
  const t = saturate((x - e0) / (e1 - e0 || 1e-9));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ *
 * noise (JS port of the hash/fbm the coat shader uses)
 * ------------------------------------------------------------------ */
function hash13(x, y, z) {
  const fx = (((x * 0.1031) % 1) + 1) % 1;
  const fy = (((y * 0.1031) % 1) + 1) % 1;
  const fz = (((z * 0.1031) % 1) + 1) % 1;
  const d = fx * (fz + 31.32) + fy * (fy + 31.32) + fz * (fy + 31.32);
  const px = fx + d, py = fy + d, pz = fz + d;
  return ((((px + py) * pz) % 1) + 1) % 1;
}

function vnoise(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  fz = fz * fz * (3 - 2 * fz);
  const n = (a, b, c) => hash13(ix + a, iy + b, iz + c);
  return mix(
    mix(mix(n(0, 0, 0), n(1, 0, 0), fx), mix(n(0, 1, 0), n(1, 1, 0), fx), fy),
    mix(mix(n(0, 0, 1), n(1, 0, 1), fx), mix(n(0, 1, 1), n(1, 1, 1), fx), fy),
    fz
  );
}

function fbm(x, y, z) {
  let s = 0, a = 0.5;
  for (let i = 0; i < 4; i++) {
    s += a * vnoise(x, y, z);
    x = x * 2.03 + 17.1; y = y * 2.03 + 9.2; z = z * 2.03 + 4.7;
    a *= 0.5;
  }
  return s;
}

const srgbToLinear = (c) => Math.pow(clamp(c, 0, 1), 2.2);
const L = (r, g, b) => [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];

const ALBEDO = {
  groundDeep: L(0.42, 0.24, 0.12),
  ground: L(0.62, 0.38, 0.18),
  groundLite: L(0.86, 0.58, 0.30),
  stripe: L(0.07, 0.04, 0.025),
  cream: L(0.93, 0.84, 0.70),
};

/**
 * JS port of tabbyAlbedo() in fur.js. Writes linear RGB into `out` and returns
 * the stripe amount (the shader's gStripe, used for the roughness shift).
 */
function tabbyAlbedo(px, py, pz, nx, ny, nz, part, patX, patY, out) {
  const gd = ALBEDO.groundDeep, gr = ALBEDO.ground, gl = ALBEDO.groundLite;
  const st = ALBEDO.stripe, cr = ALBEDO.cream;

  const tick = fbm(px * 36, py * 36, pz * 36);
  const base = [0, 0, 0];
  for (let i = 0; i < 3; i++) base[i] = mix(mix(gd[i], gl[i], smoothstep(0.25, 0.8, tick)), gr[i], 0.28);

  const along = pz, side = px, up = py;
  const warp = fbm(side * 3.2, up * 2.4, along * 1.3);
  const bars = Math.sin(along * 188 + side * 10 + warp * 7);
  const brk = fbm(px * 9, py * 22, pz * 7);
  const grain = (fbm(px * 21, py * 64, pz * 17) - 0.5) * FUR_LOOK.stripe.grain;
  let bar = smoothstep(FUR_LOOK.stripe.edgeLow, FUR_LOOK.stripe.edgeHigh,
    bars * 0.5 + 0.5 + (brk - 0.5) * 0.65 + grain * 0.5);
  bar *= mix(0.25, 1, smoothstep(0.22, 0.62, fbm(px * 5, py * 16, pz * 4 + along * 2)));

  const dorsalZone = smoothstep(-0.05, 0.72, ny);
  const bellyN = smoothstep(0.2, -0.55, ny);
  let stripeAmt = bar * mix(0.55, 1, dorsalZone) * (1 - bellyN * 0.75);

  const wobble = (fbm(px * 8, py * 8, pz * 8) - 0.5) * 0.01;
  stripeAmt = Math.max(stripeAmt, smoothstep(0.020, 0.0035, Math.abs(side - wobble)) * smoothstep(0.05, 0.62, ny));

  const shoulder = smoothstep(0.05, 0.09, along) * smoothstep(0.15, 0.105, along);
  const hipBar = smoothstep(-0.14, -0.09, along) * smoothstep(-0.04, -0.08, along);
  stripeAmt = Math.max(stripeAmt, (shoulder + hipBar) * 0.72 * dorsalZone);

  const necklace = Math.sin(side * 70 + fbm(px * 6, py * 6, pz * 6) * 2.2);
  const neckZone = smoothstep(0.10, 0.145, along) * smoothstep(0.19, 0.15, along) *
    smoothstep(0.03, -0.02, up - 0.055);
  stripeAmt = Math.max(stripeAmt, smoothstep(0.15, 0.7, necklace * 0.5 + 0.5) * neckZone);

  if (part > 1.5 && part < 2.5) {
    const band = smoothstep(0.05, 0.55, Math.sin(patX * 24 + fbm(px * 10, py * 10, pz * 10) * 1.4) * 0.5 + 0.5);
    stripeAmt = Math.max(stripeAmt * 0.3, band * 0.9);
    stripeAmt = Math.max(stripeAmt, smoothstep(0.78, 0.88, patX) * smoothstep(1.02, 0.9, patX));
  }
  if (part > 2.5 && part < 3.5) {
    const ring = smoothstep(-0.05, 0.42, Math.sin(patY * 58 + fbm(px * 12, py * 12, pz * 12) * 1.3) * 0.5 + 0.5);
    stripeAmt = Math.max(ring, smoothstep(0.72, 0.96, patY));
    for (let i = 0; i < 3; i++) base[i] = mix(gr[i], gd[i], 0.4);
  }
  if (part > 3.5 && part < 4.5) {
    const tip = smoothstep(0.42, 0.98, patX);
    stripeAmt = Math.max(stripeAmt * 0.35, tip * 0.85);
    for (let i = 0; i < 3; i++) base[i] = mix(base[i], gd[i], 0.3 + tip * 0.35);
  }
  if (part > 4.5 && part < 5.5) stripeAmt *= 0.22;
  if (part > 6.5 && part < 7.5) {
    stripeAmt = 1;
    for (let i = 0; i < 3; i++) base[i] = mix(st[i], gd[i], 0.46);
  }

  let creamMask = 0;
  if (part < 0.5 || (part > 5.5 && part < 6.5)) {
    creamMask = Math.max(bellyN * 0.95, smoothstep(0.058, 0.040, up) * (1 - dorsalZone));
  }
  if (part > 0.5 && part < 1.5) {
    creamMask = Math.max(creamMask, smoothstep(0.05, -0.35, ny) * smoothstep(0, 0.55, nz) * 0.85);
    stripeAmt *= 0.22;
  }
  if (part > 4.5 && part < 5.5) creamMask = Math.max(creamMask, 0.42);
  if (part > 7.5 && part < 8.5) { creamMask = 1; stripeAmt = 0.08; }

  const s = clamp(stripeAmt, 0, 1), c = clamp(creamMask, 0, 1);
  for (let i = 0; i < 3; i++) out[i] = mix(mix(base[i], st[i], s), cr[i], c);

  const speck = smoothstep(0.74, 0.88, hash13(Math.floor(px * 110), Math.floor(py * 110), Math.floor(pz * 110)));
  const speckle = 0.86 + 0.22 * fbm(px * 74, py * 74, pz * 74);
  const tint = [0.45, 0.36, 0.28];
  for (let i = 0; i < 3; i++) out[i] = mix(out[i] * speckle, out[i] * speckle * tint[i], speck * 0.55);

  const ao = mix(0.78, 1.0, smoothstep(-0.55, 0.45, ny));
  for (let i = 0; i < 3; i++) out[i] *= ao;

  if (part < 0.5) {
    const chest = smoothstep(0.08, 0.14, along) * smoothstep(0.2, 0.12, along) * smoothstep(0.15, -0.25, nz);
    const warm = [1.12, 1.04, 0.9];
    for (let i = 0; i < 3; i++) out[i] = mix(out[i], out[i] * warm[i], chest * 0.55);
  }
  return s;
}

/**
 * JS port of the eye shader in fur.js (createEyeMaterial). `view` holds the
 * interpolated view-space normal and position; `state` the uniforms.
 */
function eyeShade(objNx, objNy, objNz, view, state, out) {
  const IRIS_IN = L(...EYE_LOOK.irisInnerColor);
  const IRIS_OUT = L(...EYE_LOOK.irisOuterColor);
  const SCLERA = L(...EYE_LOOK.scleraColor);
  const LID = L(...EYE_LOOK.lidColor);
  const front = smoothstep(0, 0.35, objNz);
  const qx = objNx, qy = objNy;
  const r = Math.hypot(qx, qy);
  const irisMix = smoothstep(0.05, 0.62, r);
  const angle = Math.atan2(qy, qx);
  const fibers = 1 - EYE_LOOK.fibers * 0.5 + EYE_LOOK.fibers * 0.5 * Math.sin(angle * 26 + r * 36);
  const limbus = smoothstep(0.48, 0.62, r) * smoothstep(0.74, 0.6, r) * EYE_LOOK.limbus;
  const freckle = smoothstep(0.78, 0.9, hash13(Math.floor(angle * 5), Math.floor(r * 28), 3));
  const collar = smoothstep(0.16, 0.05, r);
  const iris = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    let c = mix(IRIS_IN[i], IRIS_OUT[i], irisMix) * fibers;
    c = mix(c, c * EYE_LOOK.limbusTint[i], limbus);
    c = mix(c, c * 0.5, freckle * EYE_LOOK.freckle);
    c = mix(c, c * EYE_LOOK.collarTint[i], collar * EYE_LOOK.collar);
    iris[i] = c;
  }

  const irisDisk = smoothstep(EYE_LOOK.irisInner, EYE_LOOK.irisOuter, r) * front;
  const pupilW = mix(EYE_LOOK.pupilWidth[0], EYE_LOOK.pupilWidth[1], state.pupil);
  const pupilH = mix(EYE_LOOK.pupilHeight[0], EYE_LOOK.pupilHeight[1], state.pupil);
  const pupil = smoothstep(pupilW, pupilW * 0.45, Math.abs(qx)) *
    smoothstep(pupilH, pupilH * 0.62, Math.abs(qy)) * irisDisk;

  const lidLine = mix(EYE_LOOK.lidLineOpen, EYE_LOOK.lidLineShut, state.blink);
  const covered = smoothstep(lidLine, lidLine - 0.09, objNy);

  const nl = Math.hypot(view.nx, view.ny, view.nz) || 1;
  const n0 = view.nx / nl, n1 = view.ny / nl, n2 = view.nz / nl;
  const l0 = state.lightDir.x, l1 = state.lightDir.y, l2 = state.lightDir.z;
  const vl = Math.hypot(view.px, view.py, view.pz) || 1;
  const v0 = -view.px / vl, v1 = -view.py / vl, v2 = -view.pz / vl;
  const dotNL = n0 * l0 + n1 * l1 + n2 * l2;
  const wrap = clamp(dotNL * 0.5 + 0.5, 0, 1);
  let h0 = l0 + v0, h1 = l1 + v1, h2 = l2 + v2;
  const hl = Math.hypot(h0, h1, h2) || 1;
  h0 /= hl; h1 /= hl; h2 /= hl;
  const spec = Math.pow(clamp(n0 * h0 + n1 * h1 + n2 * h2, 0, 1), EYE_LOOK.specularPower);
  const broad = Math.pow(1 - clamp(n0 * v0 + n1 * v1 + n2 * v2, 0, 1), 2.2);

  for (let i = 0; i < 3; i++) {
    let col = mix(SCLERA[i], iris[i], irisDisk);
    col = mix(col, 0.0105, pupil);
    col = mix(col, LID[i], covered * front);
    col *= EYE_LOOK.wrap[0] + EYE_LOOK.wrap[1] * wrap;
    col += spec * [1, 0.96, 0.9][i] * front * (1 - covered) * EYE_LOOK.specular;
    col += broad * [0.16, 0.12, 0.09][i] * front * (1 - covered) * EYE_LOOK.broadSheen;
    const tapetum = pupil * (1 - covered);
    col += tapetum * [0.12, 0.42, 0.16][i] * EYE_LOOK.tapetum;
    col += tapetum * [0.35, 0.95, 0.4][i] * state.shine * EYE_LOOK.tapetumShine;
    out[i] = col;
  }
}

/* ------------------------------------------------------------------ *
 * tone mapping (ported from three's tonemapping_pars_fragment)
 * ------------------------------------------------------------------ */
const ACES_IN = [[0.59719, 0.35458, 0.04823], [0.076, 0.90834, 0.01566], [0.0284, 0.13383, 0.83777]];
const ACES_OUT = [[1.60475, -0.53108, -0.07367], [-0.10208, 1.10813, -0.00605], [-0.00327, -0.07276, 1.07602]];
const encodeSrgb = (c) => {
  const x = saturate(c);
  return x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
};
function acesFilmic(r, g, b, exposure, out) {
  const s = exposure / 0.6;
  const v0 = r * s, v1 = g * s, v2 = b * s;
  const i0 = ACES_IN[0][0] * v0 + ACES_IN[0][1] * v1 + ACES_IN[0][2] * v2;
  const i1 = ACES_IN[1][0] * v0 + ACES_IN[1][1] * v1 + ACES_IN[1][2] * v2;
  const i2 = ACES_IN[2][0] * v0 + ACES_IN[2][1] * v1 + ACES_IN[2][2] * v2;
  const fit = (c) => (c * (c + 0.0245786) - 0.000090537) / (c * (0.983729 * c + 0.432951) + 0.238081);
  const f0 = fit(i0), f1 = fit(i1), f2 = fit(i2);
  out[0] = encodeSrgb(ACES_OUT[0][0] * f0 + ACES_OUT[0][1] * f1 + ACES_OUT[0][2] * f2);
  out[1] = encodeSrgb(ACES_OUT[1][0] * f0 + ACES_OUT[1][1] * f1 + ACES_OUT[1][2] * f2);
  out[2] = encodeSrgb(ACES_OUT[2][0] * f0 + ACES_OUT[2][1] * f1 + ACES_OUT[2][2] * f2);
}

/* ------------------------------------------------------------------ *
 * lights
 * ------------------------------------------------------------------ */
function lightState(lights) {
  const direction = (light) => {
    const d = new THREE.Vector3().subVectors(light.position, light.target ? light.target.position : new THREE.Vector3());
    if (d.lengthSq() < 1e-9) d.set(0, 1, 0);
    return d.normalize();
  };
  return {
    moon: { dir: direction(lights.moon), color: lights.moon.color, intensity: lights.moon.intensity },
    rim: { dir: direction(lights.rim), color: lights.rim.color, intensity: lights.rim.intensity },
    viewFill: { dir: direction(lights.viewFill), color: lights.viewFill.color, intensity: lights.viewFill.intensity },
    hemi: { sky: lights.hemi.color, ground: lights.hemi.groundColor, intensity: lights.hemi.intensity },
    points: [lights.lamp, lights.faceKey].map((p) => ({
      pos: p.position, color: p.color, intensity: p.intensity, distance: p.distance, decay: p.decay,
    })),
  };
}

function distanceAttenuation(distance, cutoff, decay) {
  let falloff = 1 / Math.max(Math.pow(distance, decay), 0.01);
  if (cutoff > 0) {
    const t = saturate(1 - Math.pow(distance / cutoff, 4));
    falloff *= t * t;
  }
  return falloff;
}

/* ------------------------------------------------------------------ *
 * geometry gathering
 * ------------------------------------------------------------------ */
function gather(roots, camera, width, height, eyeMaterial, roomMaterial) {
  const viewProjection = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const normalMatrix = new THREE.Matrix3();
  const viewNormalMatrix = new THREE.Matrix3().getNormalMatrix(camera.matrixWorldInverse);
  const world = new THREE.Vector3();
  const clip = new THREE.Vector4();
  const tri = { proj: [], depth: [], world: [], normal: [], objNormal: [], rest: [], restN: [], part: [], pat: [], kind: 0, material: null, alpha: 1, lift: 0, hasFur: false };
  const tris = [];

  const meshes = [];
  for (const root of roots) {
    root.updateMatrixWorld(true);
    root.traverse((object) => {
      if (object.isMesh && object.visible && object.geometry && object.geometry.attributes.position) meshes.push(object);
    });
  }

  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (!material || material.visible === false) continue;
    const position = geometry.attributes.position;
    const normalAttr = geometry.attributes.normal;
    const index = geometry.index;
    const count = index ? index.count : position.count;
    const lift = mesh.userData.shell ? mesh.userData.shellLift || 0 : 0;
    const hasFur = Boolean(geometry.attributes.catRest);
    normalMatrix.getNormalMatrix(mesh.matrixWorld);

    for (let i = 0; i + 2 < count; i += 3) {
      const t = {
        proj: new Float32Array(6), depth: new Float32Array(3),
        world: new Float32Array(9), normal: new Float32Array(9),
        objNormal: new Float32Array(9), rest: new Float32Array(9), restN: new Float32Array(9),
        part: new Float32Array(3), pat: new Float32Array(6),
        kind: 0, material, alpha: material.opacity ?? 1, lift, hasFur,
      };
      let ok = true;
      for (let k = 0; k < 3; k++) {
        const vi = index ? index.getX(i + k) : i + k;
        const ox = position.getX(vi), oy = position.getY(vi), oz = position.getZ(vi);
        const onx = normalAttr ? normalAttr.getX(vi) : 0;
        const ony = normalAttr ? normalAttr.getY(vi) : 1;
        const onz = normalAttr ? normalAttr.getZ(vi) : 0;
        t.objNormal[k * 3] = onx; t.objNormal[k * 3 + 1] = ony; t.objNormal[k * 3 + 2] = onz;

        let lx = ox, ly = oy, lz = oz;
        if (lift > 0) {
          const rny = geometry.attributes.catRestN ? geometry.attributes.catRestN.getY(vi) : 1;
          const amount = lift * (1 + smoothstep(0.35, 0.9, rny) * 0.65);
          lx += onx * amount; ly += ony * amount; lz += onz * amount;
        }
        world.set(lx, ly, lz).applyMatrix4(mesh.matrixWorld);
        t.world[k * 3] = world.x; t.world[k * 3 + 1] = world.y; t.world[k * 3 + 2] = world.z;
        world.set(onx, ony, onz).applyMatrix3(normalMatrix).normalize();
        t.normal[k * 3] = world.x; t.normal[k * 3 + 1] = world.y; t.normal[k * 3 + 2] = world.z;

        if (hasFur) {
          const rest = geometry.attributes.catRest;
          t.rest[k * 3] = rest.getX(vi); t.rest[k * 3 + 1] = rest.getY(vi); t.rest[k * 3 + 2] = rest.getZ(vi);
          if (geometry.attributes.catRestN) {
            t.restN[k * 3] = geometry.attributes.catRestN.getX(vi);
            t.restN[k * 3 + 1] = geometry.attributes.catRestN.getY(vi);
            t.restN[k * 3 + 2] = geometry.attributes.catRestN.getZ(vi);
          }
          t.part[k] = geometry.attributes.partId ? geometry.attributes.partId.getX(vi) : 0;
          t.pat[k * 2] = geometry.attributes.patCoord ? geometry.attributes.patCoord.getX(vi) : 0;
          t.pat[k * 2 + 1] = geometry.attributes.patCoord ? geometry.attributes.patCoord.getY(vi) : 0;
        }

        clip.set(lx, ly, lz, 1).applyMatrix4(mesh.matrixWorld).applyMatrix4(viewProjection);
        if (clip.w <= 1e-4) { ok = false; break; }
        t.proj[k * 2] = ((clip.x / clip.w) * 0.5 + 0.5) * width;
        t.proj[k * 2 + 1] = (0.5 - (clip.y / clip.w) * 0.5) * height;
        t.depth[k] = clip.z / clip.w;
      }
      if (!ok) continue;
      const area = (t.proj[2] - t.proj[0]) * (t.proj[5] - t.proj[1]) - (t.proj[4] - t.proj[0]) * (t.proj[3] - t.proj[1]);
      if (Math.abs(area) < 1e-9) continue;
      t.kind = material === eyeMaterial ? 4 : material === roomMaterial ? 1 : lift > 0 ? 3 : hasFur ? 2 : 1;
      KIND_DEBUG[t.kind] = (KIND_DEBUG[t.kind] || 0) + 1;
      t.transparent = material.transparent === true && lift === 0;
      t.unlit = material.isMeshBasicMaterial === true;
      if (material.isShaderMaterial && material !== eyeMaterial) {
        // The moon shaft: additive, animated in its own shader. Rendered here as
        // a faint additive-ish wash so the mood survives; not measured.
        t.unlit = true;
        t.ghost = true;
        t.alpha = Math.min(1, (material.uniforms?.uOpacity?.value ?? 0.08) * 3);
      }
      tris.push(t);
    }
  }
  return tris;
}

/* ------------------------------------------------------------------ *
 * render
 * ------------------------------------------------------------------ */
const KIND_DEBUG = {};
const scratchAlbedo = [0, 0, 0];
const scratchEye = [0, 0, 0];
const toned = [0, 0, 0];

export function renderScene({
  room,
  tabby,
  lights,
  camera,
  width = 640,
  height = 360,
  exposure = 1.18,
  background = new THREE.Color(0x07080c),
  eyeState,
}) {
  // The WebGLRenderer normally owns these two lines; without them a standalone
  // camera projects through a stale inverse matrix.
  camera.updateMatrixWorld(true);
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  const tris = gather([room.object, tabby.object], camera, width, height, tabby.eyeMat, tabby.roomMaterial || null);
  const state = lightState(lights);

  const color = new Float32Array(width * height * 3);
  const depth = new Float32Array(width * height).fill(Infinity);
  const mask = new Uint8Array(width * height); // 0 background, 1 room, 2 fur, 3 shell, 4 eye
  // Per-pixel surface data the metrics need after the fact: world normal and
  // the cosine of the view angle. Written for whichever surface won the pixel.
  const feature = new Float32Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    color[i * 3] = background.r; color[i * 3 + 1] = background.g; color[i * 3 + 2] = background.b;
  }

  const viewNormalMatrix = new THREE.Matrix3().getNormalMatrix(camera.matrixWorldInverse);
  const toView = camera.matrixWorldInverse;
  const tmpN = new THREE.Vector3();
  const tmpP = new THREE.Vector3();

  const passes = [
    (t) => !t.transparent && t.kind !== 3,
    (t) => t.kind === 3,
    (t) => t.transparent,
  ];

  for (const accept of passes) {
    for (const t of tris) {
      if (!accept(t)) continue;
      const [x0, y0, x1, y1, x2, y2] = t.proj;
      const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
      if (area === 0) continue;
      const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
      const maxX = Math.min(width - 1, Math.ceil(Math.max(x0, x1, x2)));
      const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
      const maxY = Math.min(height - 1, Math.ceil(Math.max(y0, y1, y2)));
      const isShell = t.kind === 3;

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const cx = px + 0.5, cy = py + 0.5;
          const w0 = ((x1 - cx) * (y2 - cy) - (x2 - cx) * (y1 - cy)) / area;
          if (w0 < 0) continue;
          const w1 = ((x2 - cx) * (y0 - cy) - (x0 - cx) * (y2 - cy)) / area;
          if (w1 < 0) continue;
          const w2 = 1 - w0 - w1;
          if (w2 < 0) continue;
          const z = w0 * t.depth[0] + w1 * t.depth[1] + w2 * t.depth[2];
          const idx = py * width + px;
          if (z >= depth[idx]) continue;

          const wx = w0 * t.world[0] + w1 * t.world[3] + w2 * t.world[6];
          const wy = w0 * t.world[1] + w1 * t.world[4] + w2 * t.world[7];
          const wz = w0 * t.world[2] + w1 * t.world[5] + w2 * t.world[8];
          let nx = w0 * t.normal[0] + w1 * t.normal[3] + w2 * t.normal[6];
          let ny = w0 * t.normal[1] + w1 * t.normal[4] + w2 * t.normal[7];
          let nz = w0 * t.normal[2] + w1 * t.normal[5] + w2 * t.normal[8];
          const nl = Math.hypot(nx, ny, nz) || 1;
          nx /= nl; ny /= nl; nz /= nl;

          const albedo = scratchAlbedo;
          let alpha = t.alpha;
          let emR = 0, emG = 0, emB = 0;
          let tag = t.kind;

          if (t.kind === 2 || t.kind === 3) {
            const restX = w0 * t.rest[0] + w1 * t.rest[3] + w2 * t.rest[6];
            const restY = w0 * t.rest[1] + w1 * t.rest[4] + w2 * t.rest[7];
            const restZ = w0 * t.rest[2] + w1 * t.rest[5] + w2 * t.rest[8];
            const rnx = w0 * t.restN[0] + w1 * t.restN[3] + w2 * t.restN[6];
            const rny = w0 * t.restN[1] + w1 * t.restN[4] + w2 * t.restN[7];
            const rnz = w0 * t.restN[2] + w1 * t.restN[5] + w2 * t.restN[8];
            const part = w0 * t.part[0] + w1 * t.part[1] + w2 * t.part[2];
            const patX = w0 * t.pat[0] + w1 * t.pat[2] + w2 * t.pat[4];
            const patY = w0 * t.pat[1] + w1 * t.pat[3] + w2 * t.pat[5];
            const fade = t.lift > 0 ? clamp(t.lift / FUR_LOOK.shells.fadeReference, 0, 1) : 0;
            const jitter = t.lift > 0 ? FUR_LOOK.shells.liftJitter * fade : 0;
            const seed = t.lift * FUR_LOOK.shells.strandScale;
            const jx = jitter * (hash13(Math.floor(restX * 420) + seed, Math.floor(restY * 420), Math.floor(restZ * 420)) - 0.5) * 2;
            const jy = jitter * (hash13(Math.floor(restX * 420), Math.floor(restY * 420) + seed + 31.7, Math.floor(restZ * 420)) - 0.5) * 2;
            const jz = jitter * (hash13(Math.floor(restX * 420), Math.floor(restY * 420), Math.floor(restZ * 420) + seed + 71.3) - 0.5) * 2;
            tabbyAlbedo(restX + jx, restY + jy, restZ + jz, rnx, rny, rnz, part, patX, patY, albedo);

            const ndv = clamp(nx * (camera.position.x - wx) + ny * (camera.position.y - wy) + nz * (camera.position.z - wz), 0, 1) /
              (Math.hypot(camera.position.x - wx, camera.position.y - wy, camera.position.z - wz) || 1);
            if (t.kind === 3) {
              const strand = hash13(Math.floor(restX * 440) + seed, Math.floor(restY * 440), Math.floor(restZ * 440));
              const cutoff = FUR_LOOK.shells.cutoffBase + t.lift * FUR_LOOK.shells.cutoffSlope -
                t.lift * hash13(Math.floor(restX * 260), Math.floor(restY * 260), Math.floor(restZ * 260)) * 10;
              if (strand < cutoff) continue;
              alpha *= mix(FUR_LOOK.shells.alphaNear, FUR_LOOK.shells.alphaFar, fade);
              alpha *= mix(FUR_LOOK.shells.meltNear, 1, smoothstep(FUR_LOOK.shells.meltEdgeStart, FUR_LOOK.shells.meltEdgeEnd, ndv));
              for (let i = 0; i < 3; i++) albedo[i] *= 1.06;
            } else {
              const rim = Math.pow(1 - ndv, FUR_LOOK.rim.exponent) * FUR_LOOK.rim.strength;
              emR = rim * FUR_LOOK.rim.color[0];
              emG = rim * FUR_LOOK.rim.color[1];
              emB = rim * FUR_LOOK.rim.color[2];
            }
          } else if (t.kind === 4 && eyeState) {
            tmpN.set(nx, ny, nz).applyMatrix3(viewNormalMatrix).normalize();
            tmpP.set(wx, wy, wz).applyMatrix4(toView);
            const onx = w0 * t.objNormal[0] + w1 * t.objNormal[3] + w2 * t.objNormal[6];
            const ony = w0 * t.objNormal[1] + w1 * t.objNormal[4] + w2 * t.objNormal[7];
            const onz = w0 * t.objNormal[2] + w1 * t.objNormal[5] + w2 * t.objNormal[8];
            const ol = Math.hypot(onx, ony, onz) || 1;
            eyeShade(onx / ol, ony / ol, onz / ol, { nx: tmpN.x, ny: tmpN.y, nz: tmpN.z, px: tmpP.x, py: tmpP.y, pz: tmpP.z }, eyeState, scratchEye);
            albedo[0] = scratchEye[0]; albedo[1] = scratchEye[1]; albedo[2] = scratchEye[2];
          } else if (t.kind === 1) {
            const c = t.material.color || { r: 1, g: 1, b: 1 };
            albedo[0] = c.r; albedo[1] = c.g; albedo[2] = c.b;
            if (t.ghost) { albedo[0] = 0.72; albedo[1] = 0.82; albedo[2] = 1.0; alpha = t.alpha; }
          }

          // irradiance
          let irrR = 0, irrG = 0, irrB = 0;
          const addDir = (light) => {
            const dot = nx * light.dir.x + ny * light.dir.y + nz * light.dir.z;
            if (dot <= 0) return;
            irrR += light.color.r * light.intensity * dot;
            irrG += light.color.g * light.intensity * dot;
            irrB += light.color.b * light.intensity * dot;
          };
          addDir(state.moon);
          addDir(state.rim);
          addDir(state.viewFill);
          const hemiWeight = 0.5 * ny + 0.5;
          irrR += mix(state.hemi.ground.r, state.hemi.sky.r, hemiWeight) * state.hemi.intensity;
          irrG += mix(state.hemi.ground.g, state.hemi.sky.g, hemiWeight) * state.hemi.intensity;
          irrB += mix(state.hemi.ground.b, state.hemi.sky.b, hemiWeight) * state.hemi.intensity;
          for (const p of state.points) {
            const dx = p.pos.x - wx, dy = p.pos.y - wy, dz = p.pos.z - wz;
            const dist = Math.hypot(dx, dy, dz) || 1e-4;
            const dot = (nx * dx + ny * dy + nz * dz) / dist;
            if (dot <= 0) continue;
            const gain = distanceAttenuation(dist, p.distance, p.decay) * dot;
            irrR += p.color.r * p.intensity * gain;
            irrG += p.color.g * p.intensity * gain;
            irrB += p.color.b * p.intensity * gain;
          }

          if (t.unlit) {
            // MeshBasicMaterial: colour straight through (moon disc, glow, moth)
            const c = t.material.color || { r: albedo[0], g: albedo[1], b: albedo[2] };
            acesFilmic(c.r, c.g, c.b, exposure, toned);
          } else {
            acesFilmic(
              irrR * albedo[0] * RECIPROCAL_PI + emR,
              irrG * albedo[1] * RECIPROCAL_PI + emG,
              irrB * albedo[2] * RECIPROCAL_PI + emB,
              exposure, toned
            );
          }

          const viewLen = Math.hypot(camera.position.x - wx, camera.position.y - wy, camera.position.z - wz) || 1;
          const ndv = clamp(((nx * (camera.position.x - wx)) + (ny * (camera.position.y - wy)) + (nz * (camera.position.z - wz))) / viewLen, 0, 1);
          if (!t.transparent && !isShell) {
            color[idx * 3] = toned[0]; color[idx * 3 + 1] = toned[1]; color[idx * 3 + 2] = toned[2];
            depth[idx] = z;
            mask[idx] = tag;
            feature[idx * 4] = nx; feature[idx * 4 + 1] = ny; feature[idx * 4 + 2] = nz; feature[idx * 4 + 3] = ndv;
          } else {
            const a = clamp(alpha, 0, 1);
            color[idx * 3] = mix(color[idx * 3], toned[0], a);
            color[idx * 3 + 1] = mix(color[idx * 3 + 1], toned[1], a);
            color[idx * 3 + 2] = mix(color[idx * 3 + 2], toned[2], a);
            if (isShell && (mask[idx] === 0 || mask[idx] === 1 || mask[idx] === 3)) {
              mask[idx] = 3;
              feature[idx * 4] = nx; feature[idx * 4 + 1] = ny; feature[idx * 4 + 2] = nz; feature[idx * 4 + 3] = ndv;
            }
          }
        }
      }
    }
  }

  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = color[i * 3] * 255;
    rgba[i * 4 + 1] = color[i * 3 + 1] * 255;
    rgba[i * 4 + 2] = color[i * 3 + 2] * 255;
    rgba[i * 4 + 3] = 255;
  }
  return { rgba, mask, depth, feature, width, height, triangles: tris.length, kinds: { ...KIND_DEBUG }, lights: state };
}

export { tabbyAlbedo, eyeShade, hash13, fbm, acesFilmic };
