# Tabby-slink offscreen harness

There is no GPU and no browser binary in the agent sandbox, so this harness runs
the experiment's own modules headlessly and answers the questions a screenshot
would normally answer — with numbers, so they can be argued with.

```
node tools/tabby-slink-harness/run.mjs                       # current checkout
node tools/tabby-slink-harness/run.mjs --label before \
     --module-root /path/to/older/experiments/tabby-slink    # a baseline build
```

Exit code is non-zero when any check fails, so it can gate a commit. Flags:
`--seconds`, `--width`, `--height`, `--portrait-width/height`, `--seed`,
`--out`, `--label`, `--no-portrait`, `--quiet`.

Some properties only mean something over a whole lap of the stalk path (which
stretch of the sofa leg is sampled, whether the cat has crossed the room), so a
run shorter than `--seconds 18` reports those as `SKIP` rather than passing or
failing on frames that cannot answer them. `--seed` fixes the run's random
choices (blinks, ear flicks, freeze timing); two reports from one seed differ
only because the builds differ.

## What it does

1. **Runs the real modules.** `room.js`, `cat.js`, `fur.js`, `rig.js` and
   `lighting.js` are imported from the checkout under test (`three` is resolved
   to that checkout's vendored copy). Nothing about the walk, the camera or the
   lights is re-implemented — that is the point: the follow rig and the light
   rig were extracted into their own modules in round 3 partly so they could be
   driven here instead of guessed at.
2. **Renders frames on the CPU.** `renderer.mjs` walks the live scene graph and
   rasterises it: three's own ACES tone curve, `MeshStandard`-style Lambert +
   hemisphere + point lights with three's attenuation, and JS ports of the two
   bespoke shaders (the tabby coat and the eye), reading their constants from
   `FUR_LOOK`/`EYE_LOOK` in `fur.js` so the port cannot silently drift from the
   shader. No shadows, no specular on standard materials: it is an
   approximation, and it is not a pixel-exact stand-in for a browser.
3. **Measures.** Coverage, luminance percentiles, moon-facing angles, the dark
   edge against the background, eye aperture in pixels, shell fringe in pixels,
   stripe-edge width measured on the albedo function itself, and the face-key
   and eye-self-lighting contributions measured differentially (render the same
   frame with the contribution switched off and compare in linear light).
4. **Audits the camera.** Every sampled pose is checked against the round-2
   invariants: inside `room.bounds`, clear of every blocker box, whole
   cat→camera segment in open volume (`collideCameraPose`/`cameraClearance` must
   be a no-op on a rendered pose).
5. **Writes PNGs** (`out/<label>/*.png`) and `out/<label>/metrics.json`.

Baseline runs: point `--module-root` at a checkout from before `rig.js`/
`lighting.js` exist and the harness drives round 2's camera and lights from
`legacy.mjs` (verbatim copies of what `main.js` did at a8305c8), with round 2's
look constants, so "before" is the code that shipped, not a paraphrase of it.

## Round 3 readings

| measurement | round 2 | round 3 |
| --- | --- | --- |
| cat coverage on the sofa leg | 10.7% | 13.4% |
| cat pixels facing the moon (sofa leg) | 0.247 | 0.154 |
| cat luminance vs its background at the outline | 2.73× | 1.35× |
| dark-edge pixels (cat darker than its background) | 8% | 4% |
| eye aperture at close range | 34 × 39 px | 44 × 56 px |
| eye self-lighting (mean luminance it adds) | −0.010 | −0.064 |
| fur shell fringe beyond the solid coat ¹ | 0.0 px | 14.4 px |
| shell share of the coat ¹ | 0% | 16% |
| stripe edge fade | 3.41 mm | 4.90 mm |
| face key's mid-tone R−B contribution | +0.184 | +0.259 |

Baseline numbers depend on the round-2 camera/lights snapshot in `legacy.mjs`;
the eye and pattern numbers are properties of that checkout's own geometry and
shaders.

¹ **The two shell rows are the least trustworthy numbers here, and the round-2
side of them is an artifact, not a finding.** The a8305c8 snapshot predates the
`userData.shellLift` tagging the harness uses to tell a shell from the coat, so
on that checkout the shells are drawn as part of the body. More generally, how
much thin alpha fur survives rasterisation is the part of this pipeline most
sensitive to the rasteriser: a headless path can drop fragments a browser's GPU
path keeps. Round-3 review confirmed the fur is there in real-browser
screenshots on both builds. So these two checks are reported as `INFO` and do
not gate a commit, and no round should be tuned to move them.
