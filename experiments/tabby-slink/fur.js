import * as THREE from "three";

/**
 * Brown mackerel tabby coat.
 *
 * Stripes are computed from a rest-pose position baked onto each vertex
 * (`catRest`), so the pattern sticks to the fur while the cat creeps, bends,
 * and turns. Part id selects body bars, leg bracelets, tail rings, ears,
 * cream, and the painted markings.
 */


/**
 * Coat, shell and eye look parameters.
 *
 * These numbers are shared: the shaders below read them, and the offscreen
 * harness in tools/tabby-slink-harness reads the same object, so "the shells
 * got longer and the falloff softer" is measured against the values the page
 * actually compiles instead of a copy in the test.
 */
export const FUR_LOOK = {
  shells: {
    // Long shells: the old pair topped out at 5.4mm on a 30cm cat, which read
    // as a hard rind over the belly and flanks. ~30% longer, with the strand
    // cut-off eased so the extra length is fuzz, not plate.
    lifts: [0.0022, 0.0046, 0.0070],
    opacities: [0.30, 0.20, 0.11],
    fadeReference: 0.0070,
    strandScale: 380,
    cutoffBase: 0.26,
    cutoffSlope: 45,
    liftJitter: 0.009,
    alphaNear: 0.7,
    alphaFar: 0.4,
    // Grazing-angle melt: how much of the shell alpha survives as the surface
    // turns away, so the silhouette frays instead of ending on a hard rim.
    meltNear: 0.55,
    meltFar: 1.0,
    meltEdgeStart: -0.3,
    meltEdgeEnd: 0.75,
  },
  rim: { color: [0.46, 0.28, 0.13], strength: 0.19, exponent: 1.9 },
  fuzz: { color: [0.34, 0.22, 0.11], strength: 0.13, exponent: 1.35 },
  stripe: {
    // Softer mackerel edge: the old 0.02..0.48 smoothstep drew bars with a
    // nearly binary edge, which is what made the coat read as printed plastic.
    edgeLow: -0.06,
    edgeHigh: 0.62,
    grain: 0.5,
    roughness: 0.06,
  },
};

export const EYE_LOOK = {
  pupil: 0.3,
  // Resting/alert eye shine. Eyeshine is a glint on a dark pupil, not a lamp:
  // at 0.20/0.38 the tapetum was the brightest thing in every close-up.
  shine: 0.09,
  shineAlert: 0.2,
  // irisDisk edge, as a fraction of the eyeball's silhouette: the disk reaches
  // nearly to the rim, the way a cat's iris does.
  irisInner: 0.86,
  irisOuter: 0.52,
  // Lid line at rest (uBlink = 0), in eyeball-normal y. Round 2 shaded the
  // lower half of the globe as "covered", which — with the lid mesh covering
  // the top half — left only a thin band of visible eye. The lid now starts
  // just above the lower rim.
  lidLineOpen: 0.16,
  lidLineShut: -0.8,
  // Specular on the eye. The exponent is the important number: at the round-2
  // pow(...,34) the highlight covered a 24-degree cap of the eyeball, which on
  // a 12mm globe is a broad white sheen over the whole iris — the "glowing
  // eyes" half of the note. A tighter exponent makes it a compact catchlight,
  // so the gloss reads as a wet eye instead of an internal light.
  // The cornea mesh adds the renderer's own specular reflection on top of this
  // one, so the shader keeps its catchlight small and weak.
  specular: 0.18,
  specularPower: 120,
  broadSheen: 0.1,
  tapetum: 0.14,
  tapetumShine: 0.18,
  // Ambient wrap on the eye: (floor, gain) of the 0.5*N.L+0.5 term.
  wrap: [0.28, 0.4],
  // Pupil slit half-axes: (resting, dilated) for width and height.
  pupilWidth: [0.11, 0.34],
  pupilHeight: [0.44, 0.56],
  // Colours, sRGB. A real tabby iris is a deep amber-green that only reads
  // bright when the light is on it; the old sunburst yellow read as a lamp.
  irisInnerColor: [0.56, 0.39, 0.11],
  irisOuterColor: [0.22, 0.33, 0.1],
  scleraColor: [0.16, 0.1, 0.07],
  lidColor: [0.45, 0.26, 0.13],
  // Depth of each iris detail (0..1).
  fibers: 0.18,
  limbus: 0.9,
  limbusTint: [0.25, 0.32, 0.12],
  freckle: 0.28,
  collar: 0.6,
  collarTint: [0.55, 0.4, 0.15],
};

const f = (n) => Number(n).toFixed(5);
const v3 = (a) => `vec3(${a.map(f).join(", ")})`;

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
  // A second, finer octave: it keeps the mackerel bars from ending in a
  // straight printed edge and breaks the long runs into fur-sized tongues.
  float barGrain = (fbm(p * vec3(21.0, 64.0, 17.0)) - 0.5) * ${f(0.5)};
  float bar = smoothstep(${f(-0.06)}, ${f(0.62)}, bars * 0.5 + 0.5 + (brk - 0.5) * 0.65 + barGrain * 0.5);
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
    // Painted markings (the forehead M, cheek stripes, eye liner, leg
    // bracelets). These are darker *fur*, not ink: at full stripe black they
    // read as a printed graphic stuck on the face, which is half of "hard
    // stripes on plastic". Kept dark but pulled well toward the deep ground
    // brown, and the tubes that carry them are thinner (see cat.js).
    stripeAmt = 0.78;
    base = mix(stripe, groundDeep, 0.62);
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
  // Recorded on the material as well as closed over by the shader, so tooling
  // can tell a base coat from a shell (and which shell) without compiling it.
  material.userData.shellLift = shellLift;
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
    float seed = uShellLift * ${f(FUR_LOOK.shells.strandScale)};
    shellJitter = vec3(
      hash13(floor(vCatRest * 420.0) + vec3(seed)),
      hash13(floor(vCatRest * 420.0) + vec3(seed + 31.7)),
      hash13(floor(vCatRest * 420.0) + vec3(seed + 71.3))
    ) - 0.5;
    shellJitter *= ${f(FUR_LOOK.shells.liftJitter)} * clamp(uShellLift / ${f(FUR_LOOK.shells.fadeReference)}, 0.0, 1.0);
  }
  vec4 tabby = tabbyAlbedo(vCatRest + shellJitter, normalize(vCatRestN), vPartId, vPatCoord);
  diffuseColor.rgb = tabby.rgb;
  gStripe = tabby.a;
  if (uShellLift > 0.0001) {
    float strand = hash13(floor(vCatRest * 440.0) + vec3(uShellLift * ${f(FUR_LOOK.shells.strandScale)}));
    // Longer shells thin out more gradually: the cut-off slope is eased so the
    // outer fuzz keeps more strands than a straight scale-up would.
    float cutoff = ${f(FUR_LOOK.shells.cutoffBase)} + uShellLift * ${f(FUR_LOOK.shells.cutoffSlope)} - uShellLift * hash13(floor(vCatRest * 260.0)) * ${f(10)};
    if (strand < cutoff) discard;
    float fade = clamp(uShellLift / ${f(FUR_LOOK.shells.fadeReference)}, 0.0, 1.0);
    diffuseColor.a *= mix(${f(FUR_LOOK.shells.alphaNear)}, ${f(FUR_LOOK.shells.alphaFar)}, fade);
    diffuseColor.rgb *= 1.06;
  }
}`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + gStripe * ${f(0.06)} - 0.03, 0.46, 1.0);`
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
  // Broader and a touch warmer than round 2: the rim is fur catchlight, so it
  // wants a soft falloff rather than a thin bright edge.
  float furRim = pow(1.0 - furNdV, ${f(FUR_LOOK.rim.exponent)});
  totalEmissiveRadiance += furRim * vec3(${FUR_LOOK.rim.color.map(f).join(", ")}) * ${f(FUR_LOOK.rim.strength)};
  if (uShellLift > 0.0001) {
    // Melt the shell silhouette: at grazing angles the fur thins out instead
    // of ending on a hard shell rim. This is what makes the coat read soft
    // rather than plastic at close range.
    diffuseColor.a *= mix(${f(FUR_LOOK.shells.meltNear)}, 1.0, smoothstep(${f(FUR_LOOK.shells.meltEdgeStart)}, ${f(FUR_LOOK.shells.meltEdgeEnd)}, furNdV));
    // Fuzz is backlit by the room: a little warm scatter keeps the outer
    // shells from going flat grey against the dark.
    float fuzz = pow(1.0 - furNdV, ${f(FUR_LOOK.fuzz.exponent)});
    totalEmissiveRadiance += fuzz * vec3(${FUR_LOOK.fuzz.color.map(f).join(", ")}) * ${f(FUR_LOOK.fuzz.strength)};
  }
}`
      );
  };
  material.customProgramCacheKey = () => `tabby-fur-v3-${shellLift}`;
  return material;
}

export function createCoatMaterials() {
  const fur = attachFurShader(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0,
      sheen: 0.66,
      sheenRoughness: 0.92,
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

  // Three shells, now longer and thinner. A longer lift needs a *lower* alpha
  // per shell: the old 0.34/0.24/0.14 over 5.4mm stacked into a visible rind,
  // so the same coverage is spread over more, fainter shells that melt into one
  // another instead of reading as plates.
  const shells = FUR_LOOK.shells.lifts.map((lift, i) =>
    attachFurShader(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0,
        sheen: 0.34,
        sheenRoughness: 0.94,
        sheenColor: new THREE.Color(0xc79a6c),
        transparent: true,
        opacity: FUR_LOOK.shells.opacities[i],
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

  // Whiskers catch the camera-mounted key and fill, so they are kept a warm
  // bone tone with almost no emissive: at round 2's values they read as white
  // plastic spikes ahead of the muzzle in every close-up.
  const whisker = new THREE.MeshStandardMaterial({
    color: 0xc2b6a1,
    roughness: 0.66,
    metalness: 0,
    emissive: 0x2a2419,
    emissiveIntensity: 0.05,
  });

  // Dimmer than round 2: this highlight sits on top of an eye that is no
  // longer trying to glow, so it reads as a wet reflection, not a lamp.
  const catchlight = new THREE.MeshBasicMaterial({ color: 0xfff0dc, transparent: true, opacity: 0.42 });

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
      uPupil: { value: EYE_LOOK.pupil },
      uShine: { value: EYE_LOOK.shine },
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

        vec3 irisIn = pow(vec3(${EYE_LOOK.irisInnerColor.map(f).join(", ")}), vec3(2.2));
        vec3 irisOut = pow(vec3(${EYE_LOOK.irisOuterColor.map(f).join(", ")}), vec3(2.2));
        float irisMix = smoothstep(0.05, 0.62, r);
        vec3 iris = mix(irisIn, irisOut, irisMix);
        float angle = atan(q.y, q.x);
        // Softer iris fiber contrast: less "glinting glass", more eye.
        float fibers = 1.0 - ${f(EYE_LOOK.fibers)} * 0.5 + ${f(EYE_LOOK.fibers)} * 0.5 * sin(angle * 26.0 + r * 36.0);
        iris *= fibers;
        float limbus = smoothstep(0.48, 0.62, r) * smoothstep(0.74, 0.6, r);
        iris = mix(iris, iris * vec3(${EYE_LOOK.limbusTint.map(f).join(", ")}), limbus * ${f(EYE_LOOK.limbus)});
        float freckle = smoothstep(0.78, 0.9, hash13(vec3(floor(angle * 5.0), floor(r * 28.0), 3.0)));
        iris = mix(iris, iris * 0.5, freckle * ${f(EYE_LOOK.freckle)});
        float collar = smoothstep(0.16, 0.05, r);
        iris = mix(iris, iris * vec3(${EYE_LOOK.collarTint.map(f).join(", ")}), collar * ${f(EYE_LOOK.collar)});

        // A bigger iris disk and a rounder pupil read as a cat eye rather
        // than a pinprick glint at close range. The disk grew again this round:
        // with the eyeball itself larger, a small iris would have looked
        // beady, which is the other half of "eyes still small and glowing".
        float irisDisk = smoothstep(${f(EYE_LOOK.irisInner)}, ${f(EYE_LOOK.irisOuter)}, r) * front;
        float pupilW = mix(${f(EYE_LOOK.pupilWidth[0])}, ${f(EYE_LOOK.pupilWidth[1])}, uPupil);
        float pupilH = mix(${f(EYE_LOOK.pupilHeight[0])}, ${f(EYE_LOOK.pupilHeight[1])}, uPupil);
        float pupil = smoothstep(pupilW, pupilW * 0.45, abs(q.x))
          * smoothstep(pupilH, pupilH * 0.62, abs(q.y));
        pupil *= irisDisk;

        vec3 sclera = pow(vec3(${EYE_LOOK.scleraColor.map(f).join(", ")}), vec3(2.2));
        vec3 col = mix(sclera, iris, irisDisk);
        col = mix(col, vec3(0.01, 0.008, 0.006), pupil);

        float lidLine = mix(${f(EYE_LOOK.lidLineOpen)}, ${f(EYE_LOOK.lidLineShut)}, uBlink);
        // Softer lid edge: the lid shade fades in instead of cutting a line.
        float covered = smoothstep(lidLine, lidLine - 0.09, n.y);
        vec3 lid = pow(vec3(${EYE_LOOK.lidColor.map(f).join(", ")}), vec3(2.2));
        col = mix(col, lid, covered * front);

        vec3 N = normalize(vViewN);
        vec3 L = normalize(uLightDir);
        vec3 V = normalize(-vViewPos);
        float wrap = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
        col *= ${f(EYE_LOOK.wrap[0])} + ${f(EYE_LOOK.wrap[1])} * wrap;
        vec3 H = normalize(L + V);
        // Broad, soft sheen instead of a tiny hard specular spark.
        float spec = pow(clamp(dot(N, H), 0.0, 1.0), ${f(EYE_LOOK.specularPower)});
        float broad = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.2);
        // Less emissive overall. A cat's eye in a dark room is mostly pupil and
        // a small, soft highlight: the old spec/broad/tapetum stack lit the
        // whole eye from inside and made the pupils the brightest pixels on
        // screen.
        col += spec * vec3(1.0, 0.96, 0.9) * front * (1.0 - covered) * ${f(EYE_LOOK.specular)};
        col += broad * vec3(0.16, 0.12, 0.09) * front * (1.0 - covered) * ${f(EYE_LOOK.broadSheen)};

        float tapetum = pupil * (1.0 - covered);
        col += tapetum * vec3(0.12, 0.42, 0.16) * ${f(EYE_LOOK.tapetum)};
        col += tapetum * vec3(0.35, 0.95, 0.4) * uShine * ${f(EYE_LOOK.tapetumShine)};

        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  return material;
}

export const SHELL_PARTS = new Set([0, 1, 2, 3, 4]);
