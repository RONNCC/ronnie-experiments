import * as THREE from "three";

/**
 * Brown mackerel tabby coat.
 *
 * Stripes are computed from a rest-pose position baked onto each vertex
 * (`catRest`), so the pattern sticks to the fur while the cat creeps, bends,
 * and turns. Part id selects body bars, leg bracelets, tail rings, ears,
 * cream, and the painted markings.
 */

const FUR_FUNCS = /* glsl */ `
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

float fbm(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec3(17.1, 9.2, 4.7);
    a *= 0.5;
  }
  return s;
}

vec3 srgbToLinear(vec3 c) {
  return pow(clamp(c, 0.0, 1.0), vec3(2.2));
}

vec4 tabbyAlbedo(vec3 p, vec3 n, float part, vec2 pat) {
  vec3 groundDeep = srgbToLinear(vec3(0.42, 0.24, 0.12));
  vec3 ground = srgbToLinear(vec3(0.62, 0.38, 0.18));
  vec3 groundLite = srgbToLinear(vec3(0.86, 0.58, 0.30));
  vec3 stripe = srgbToLinear(vec3(0.07, 0.04, 0.025));
  vec3 cream = srgbToLinear(vec3(0.93, 0.84, 0.70));

  float tick = fbm(p * 36.0);
  vec3 base = mix(groundDeep, groundLite, smoothstep(0.25, 0.8, tick));
  base = mix(base, ground, 0.28);

  float along = p.z;
  float side = p.x;
  float up = p.y;
  float warp = fbm(vec3(side * 3.2, up * 2.4, along * 1.3));

  // Broken mackerel bars — many thin verticals across the torso.
  float bars = sin(along * 188.0 + side * 10.0 + warp * 7.0);
  float brk = fbm(p * vec3(9.0, 22.0, 7.0));
  float bar = smoothstep(0.02, 0.48, bars * 0.5 + 0.5 + (brk - 0.5) * 0.65);
  float barFade = smoothstep(0.22, 0.62, fbm(p * vec3(5.0, 16.0, 4.0) + vec3(along * 2.0)));
  bar *= mix(0.25, 1.0, barFade);

  float dorsalZone = smoothstep(-0.05, 0.72, n.y);
  float bellyN = smoothstep(0.2, -0.55, n.y);
  float stripeAmt = bar * mix(0.55, 1.0, dorsalZone) * (1.0 - bellyN * 0.75);

  float wobble = (fbm(p * 8.0) - 0.5) * 0.01;
  float dorsal = smoothstep(0.020, 0.0035, abs(side - wobble));
  dorsal *= smoothstep(0.05, 0.62, n.y);
  stripeAmt = max(stripeAmt, dorsal);

  // Thicker shoulder and hip bars.
  float shoulder = smoothstep(0.05, 0.09, along) * smoothstep(0.15, 0.105, along);
  float hipBar = smoothstep(-0.14, -0.09, along) * smoothstep(-0.04, -0.08, along);
  stripeAmt = max(stripeAmt, (shoulder + hipBar) * 0.72 * dorsalZone);

  // Broken chest necklace.
  float necklace = sin(side * 70.0 + fbm(p * 6.0) * 2.2);
  float neckZone = smoothstep(0.10, 0.145, along) * smoothstep(0.19, 0.15, along);
  neckZone *= smoothstep(0.03, -0.02, up - 0.055);
  stripeAmt = max(stripeAmt, smoothstep(0.15, 0.7, necklace * 0.5 + 0.5) * neckZone);

  if (part > 1.5 && part < 2.5) {
    float bands = sin(pat.x * 24.0 + fbm(p * 10.0) * 1.4);
    float band = smoothstep(0.05, 0.55, bands * 0.5 + 0.5);
    stripeAmt = max(stripeAmt * 0.3, band * 0.9);
    float bracelet = smoothstep(0.78, 0.88, pat.x) * smoothstep(1.02, 0.9, pat.x);
    stripeAmt = max(stripeAmt, bracelet);
  }

  if (part > 2.5 && part < 3.5) {
    float rings = sin(pat.y * 58.0 + fbm(p * 12.0) * 1.3);
    float ring = smoothstep(-0.05, 0.42, rings * 0.5 + 0.5);
    stripeAmt = ring;
    float tip = smoothstep(0.72, 0.96, pat.y);
    stripeAmt = max(stripeAmt, tip);
    base = mix(ground, groundDeep, 0.4);
  }

  if (part > 3.5 && part < 4.5) {
    float tip = smoothstep(0.42, 0.98, pat.x);
    stripeAmt = max(stripeAmt * 0.35, tip * 0.85);
    base = mix(base, groundDeep, 0.3 + tip * 0.35);
  }

  if (part > 4.5 && part < 5.5) {
    stripeAmt *= 0.22;
  }

  if (part > 6.5 && part < 7.5) {
    stripeAmt = 1.0;
    base = mix(stripe, groundDeep, 0.46);
  }

  float creamMask = 0.0;
  if (part < 0.5 || (part > 5.5 && part < 6.5)) {
    creamMask = bellyN * 0.95;
    creamMask = max(creamMask, smoothstep(0.058, 0.040, up) * (1.0 - dorsalZone));
  }
  if (part > 0.5 && part < 1.5) {
    float chin = smoothstep(0.05, -0.35, n.y) * smoothstep(0.0, 0.55, n.z);
    creamMask = max(creamMask, chin * 0.85);
    stripeAmt *= 0.22;
  }
  if (part > 4.5 && part < 5.5) {
    creamMask = max(creamMask, 0.42);
  }
  if (part > 7.5 && part < 8.5) {
    creamMask = 1.0;
    stripeAmt = 0.08;
  }

  vec3 col = mix(base, stripe, clamp(stripeAmt, 0.0, 1.0));
  col = mix(col, cream, clamp(creamMask, 0.0, 1.0));

  float speck = smoothstep(0.74, 0.88, hash13(floor(p * 110.0)));
  col *= 0.86 + 0.22 * fbm(p * 74.0);
  col = mix(col, col * vec3(0.45, 0.36, 0.28), speck * 0.55);

  float ao = mix(0.78, 1.0, smoothstep(-0.55, 0.45, n.y));
  col *= ao;

  if (part < 0.5) {
    float chest = smoothstep(0.08, 0.14, along) * smoothstep(0.2, 0.12, along);
    chest *= smoothstep(0.15, -0.25, n.z);
    col = mix(col, col * vec3(1.12, 1.04, 0.9), chest * 0.55);
  }

  return vec4(col, stripeAmt);
}
`;

function attachFurShader(material, shellLift) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uShellLift = { value: shellLift };
    material.userData.shader = shader;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec3 catRest;
attribute vec3 catRestN;
attribute float partId;
attribute vec2 patCoord;
varying vec3 vCatRest;
varying vec3 vCatRestN;
varying float vPartId;
varying vec2 vPatCoord;
uniform float uShellLift;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vCatRest = catRest;
vCatRestN = catRestN;
vPartId = partId;
vPatCoord = patCoord;
float ridge = smoothstep(0.35, 0.9, catRestN.y);
transformed += normalize(objectNormal) * uShellLift * (1.0 + ridge * 0.65);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vCatRest;
varying vec3 vCatRestN;
varying float vPartId;
varying vec2 vPatCoord;
uniform float uShellLift;
float gStripe;
${FUR_FUNCS}`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
{
  vec3 shellJitter = vec3(0.0);
  if (uShellLift > 0.0001) {
    // Each shell samples the coat at a slightly different place, so the
    // outlines read as loose fur catching light instead of stacked sheets of
    // hard stripes with visible rims.
    float seed = uShellLift * 380.0;
    shellJitter = vec3(
      hash13(floor(vCatRest * 420.0) + vec3(seed)),
      hash13(floor(vCatRest * 420.0) + vec3(seed + 31.7)),
      hash13(floor(vCatRest * 420.0) + vec3(seed + 71.3))
    ) - 0.5;
    shellJitter *= 0.0075 * clamp(uShellLift / 0.0054, 0.0, 1.0);
  }
  vec4 tabby = tabbyAlbedo(vCatRest + shellJitter, normalize(vCatRestN), vPartId, vPatCoord);
  diffuseColor.rgb = tabby.rgb;
  gStripe = tabby.a;
  if (uShellLift > 0.0001) {
    float strand = hash13(floor(vCatRest * 440.0) + vec3(uShellLift * 380.0));
    float cutoff = 0.30 + uShellLift * 62.0;
    if (strand < cutoff) discard;
    float fade = clamp(uShellLift / 0.0054, 0.0, 1.0);
    diffuseColor.a *= mix(0.62, 0.30, fade);
    diffuseColor.rgb *= 1.05;
  }
}`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + gStripe * 0.1 - 0.03, 0.42, 1.0);`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
{
  // NOTE: geometryNormal / geometryViewDir are only declared later, inside
  // <lights_fragment_begin>. At this point in the chunk order the equivalents
  // are normal (from <normal_fragment_begin>) and the vViewPosition varying.
  vec3 furViewDir = normalize(vViewPosition);
  float furNdV = saturate(dot(normal, furViewDir));
  float furRim = pow(1.0 - furNdV, 2.15);
  totalEmissiveRadiance += furRim * vec3(0.42, 0.24, 0.10) * 0.16;
  if (uShellLift > 0.0001) {
    // Melt the shell silhouette: at grazing angles the fur thins out instead
    // of ending on a hard shell rim. This is what makes the coat read soft
    // rather than plastic at close range.
    diffuseColor.a *= mix(0.45, 1.0, smoothstep(-0.15, 0.6, furNdV));
    // Fuzz is backlit by the room: a little warm scatter keeps the outer
    // shells from going flat grey against the dark.
    float fuzz = pow(1.0 - furNdV, 1.6);
    totalEmissiveRadiance += fuzz * vec3(0.30, 0.19, 0.09) * 0.10;
  }
}`
      );
  };
  material.customProgramCacheKey = () => `tabby-fur-v2-${shellLift}`;
  return material;
}

export function createCoatMaterials() {
  const fur = attachFurShader(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.84,
      metalness: 0,
      sheen: 0.78,
      sheenRoughness: 0.88,
      sheenColor: new THREE.Color(0xd8ab7e),
    }),
    0
  );

  // Ears are thin sheets; they need to be lit from the back too.
  const furTwoSided = attachFurShader(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0,
      sheen: 0.62,
      sheenRoughness: 0.72,
      sheenColor: new THREE.Color(0xc49a72),
      side: THREE.DoubleSide,
    }),
    0
  );

  // Three shells with a gentler opacity falloff. The old pair used 0.42/0.28,
  // which at close range read as two hard plates with the stripe pattern
  // stamped on both; spaced-out, thinner shells melt into each other instead.
  const shells = [0.0016, 0.0034, 0.0054].map((lift, i) =>
    attachFurShader(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.94,
        metalness: 0,
        sheen: 0.4,
        sheenRoughness: 0.9,
        sheenColor: new THREE.Color(0xc79a6c),
        transparent: true,
        opacity: [0.34, 0.24, 0.14][i],
        depthWrite: false,
      }),
      lift
    )
  );

  const nose = new THREE.MeshPhysicalMaterial({
    color: 0xc46b62,
    roughness: 0.28,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    sheen: 0.15,
    sheenColor: new THREE.Color(0xe7b0aa),
  });

  const pad = new THREE.MeshPhysicalMaterial({
    color: 0xd48986,
    roughness: 0.48,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.28,
  });

  const earInner = new THREE.MeshStandardMaterial({
    color: 0xe7a097,
    roughness: 0.58,
    metalness: 0,
    emissive: 0x4a1c1c,
    emissiveIntensity: 0.18,
    side: THREE.DoubleSide,
  });

  const whisker = new THREE.MeshStandardMaterial({
    color: 0xe9e2d6, // warm off-white: not a floodlit white spike
    roughness: 0.5,
    metalness: 0,
    emissive: 0x3a3328,
    emissiveIntensity: 0.12,
  });

  const catchlight = new THREE.MeshBasicMaterial({ color: 0xfff3e0, transparent: true, opacity: 0.7 });

  const cornea = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    depthWrite: false,
  });

  return { fur, furTwoSided, shells, nose, pad, earInner, whisker, catchlight, cornea };
}

export function createEyeMaterial() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uPupil: { value: 0.28 },
      uShine: { value: 0.20 },
      uBlink: { value: 0 },
      uLightDir: { value: new THREE.Vector3(0.2, 0.8, 0.4).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vObjN;
      varying vec3 vViewN;
      varying vec3 vWorld;
      varying vec3 vViewPos;
      void main() {
        vObjN = normalize(normal);
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vec4 mv = viewMatrix * world;
        vViewPos = mv.xyz;
        vViewN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uPupil;
      uniform float uShine;
      uniform float uBlink;
      uniform vec3 uLightDir;
      varying vec3 vObjN;
      varying vec3 vViewN;
      varying vec3 vWorld;
      varying vec3 vViewPos;

      float hash13(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.zyx + 31.32);
        return fract((p.x + p.y) * p.z);
      }

      void main() {
        vec3 n = normalize(vObjN);
        float front = smoothstep(0.0, 0.35, n.z);
        vec2 q = n.xy;
        float r = length(q);

        vec3 srgbIrisIn = vec3(0.93, 0.72, 0.22);
        vec3 srgbIrisOut = vec3(0.42, 0.62, 0.16);
        vec3 irisIn = pow(srgbIrisIn, vec3(2.2));
        vec3 irisOut = pow(srgbIrisOut, vec3(2.2));
        float irisMix = smoothstep(0.05, 0.62, r);
        vec3 iris = mix(irisIn, irisOut, irisMix);
        float angle = atan(q.y, q.x);
        // Softer iris fiber contrast: less "glinting glass", more eye.
        float fibers = 0.80 + 0.20 * sin(angle * 26.0 + r * 36.0);
        iris *= fibers;
        float limbus = smoothstep(0.48, 0.62, r) * smoothstep(0.74, 0.6, r);
        iris = mix(iris, iris * vec3(0.25, 0.32, 0.12), limbus);
        float freckle = smoothstep(0.78, 0.9, hash13(vec3(floor(angle * 5.0), floor(r * 28.0), 3.0)));
        iris = mix(iris, iris * 0.5, freckle * 0.28);
        float collar = smoothstep(0.16, 0.05, r);
        iris = mix(iris, iris * vec3(0.55, 0.4, 0.15), collar * 0.65);

        // A bigger iris disk and a rounder pupil read as a cat eye rather
        // than a pinprick glint at close range.
        float irisDisk = smoothstep(0.78, 0.56, r) * front;
        float pupilW = mix(0.05, 0.26, uPupil);
        float pupilH = mix(0.30, 0.40, uPupil);
        float pupil = smoothstep(pupilW, pupilW * 0.45, abs(q.x))
          * smoothstep(pupilH, pupilH * 0.62, abs(q.y));
        pupil *= irisDisk;

        vec3 sclera = pow(vec3(0.16, 0.1, 0.07), vec3(2.2));
        vec3 col = mix(sclera, iris, irisDisk);
        col = mix(col, vec3(0.01, 0.008, 0.006), pupil);

        float lidLine = mix(0.62, -0.7, uBlink);
        // Softer lid edge: the lid shade fades in instead of cutting a line.
        float covered = smoothstep(lidLine, lidLine - 0.09, n.y);
        vec3 lid = pow(vec3(0.45, 0.26, 0.13), vec3(2.2));
        col = mix(col, lid, covered * front);

        vec3 N = normalize(vViewN);
        vec3 L = normalize(uLightDir);
        vec3 V = normalize(-vViewPos);
        float wrap = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
        col *= 0.52 + 0.62 * wrap;
        vec3 H = normalize(L + V);
        // Broad, soft sheen instead of a tiny hard specular spark.
        float spec = pow(clamp(dot(N, H), 0.0, 1.0), 34.0);
        float broad = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.2);
        col += spec * vec3(1.0, 0.96, 0.9) * front * (1.0 - covered) * 0.42;
        col += broad * vec3(0.16, 0.12, 0.09) * front * (1.0 - covered);

        float tapetum = pupil * (1.0 - covered);
        col += tapetum * vec3(0.12, 0.42, 0.16) * 0.45;
        col += tapetum * vec3(0.35, 0.95, 0.4) * uShine * 0.5;

        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  return material;
}

export const SHELL_PARTS = new Set([0, 1, 2, 3, 4]);
