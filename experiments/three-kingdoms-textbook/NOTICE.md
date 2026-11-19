# Three Kingdoms and Warring States — implementation notes

Standalone static experiment, following the repository's `experiments/<id>/index.html` layout. Registered in `experiments.json` and the README table. The homepage is manifest-driven; it does not need a hand-written duplicate card. The committed `pagefind/` bundle is regenerated with the existing `scripts/build-pagefind.mjs`.

## Page

- 23 chapters, 16 individual figure profiles, 25 idiom callouts, historical/literary evidence distinctions, and a source shelf.
- Original inline SVG artwork, a two-band timeline, and two explicitly schematic territory diagrams. These are not historical maps or artifact reproductions.
- System Latin type and a local CJK font subset; no third-party runtime requests, analytics, storage, accounts or forms.
- Sticky desktop contents, mobile disclosure, active-chapter indication, reading progress, keyboard-focusable scrolling tables/timeline, reduced-motion and print styles.
- All reading content, source links and chapter anchors work without JavaScript; the mobile contents remains available in that case.

## Checks

From the repository root:

```sh
python experiments/three-kingdoms-textbook/tests/test_structure.py
node --check experiments/three-kingdoms-textbook/app.js
node scripts/build-pagefind.mjs
```

Optional browser/accessibility regression suite, with dependencies outside the repository:

```sh
npm install --prefix /tmp/three-qa --no-audit --no-fund playwright @axe-core/playwright
/tmp/three-qa/node_modules/.bin/playwright install chromium
# Serve the repository in another terminal:
python -m http.server 8000 --bind 0.0.0.0
# Then:
NODE_PATH=/tmp/three-qa/node_modules node experiments/three-kingdoms-textbook/tests/browser.cjs
```

`BASE_URL` overrides the origin (default `http://127.0.0.1:8000`). `CHROMIUM_PATH` can select an existing compatible Chromium executable. Playwright's normal browser/system dependencies must be available. Browser tests cover desktop/mobile navigation, 23 chapters and 16 profiles, mobile overflow, no-JavaScript contents, homepage registration, real Pagefind search and axe WCAG A/AA checks. Passing automated checks is not a claim of complete accessibility conformance.

## Local font

`assets/field-guide-cjk.woff2` is a 145-character subset of **Noto Serif CJK TC Regular**, © 2017–2024 Adobe, licensed under SIL Open Font License 1.1. The license is included in `assets/OFL.txt`.

Source: `notofonts/noto-cjk`, `Serif/OTF/TraditionalChinese/NotoSerifCJKtc-Regular.otf`, Git blob `a59de8d047a3ed619164a57b231e51856762ef56` (https://github.com/notofonts/noto-cjk/tree/main/Serif). Only the 103 KB subset is committed, not the 24 MB source. It ensures the seal, names and idioms remain legible even on systems without Chinese fonts.

To regenerate after adding Chinese text, obtain that font and use FontTools' subset API with the set of code points in `index.html` between U+3000 and U+9FFF, `flavor='woff2'`, and preserved name/license metadata. Save to the same asset path. Latin and pinyin are intentionally left to the system fonts.

## Editorial boundary

The page distinguishes Chen Shou's base history, material quoted or challenged in Pei Songzhi's commentary, later fiction and modern interpretation. In particular it does not present the novel's Guan Yu-head blame-transfer motive, magical east wind, infant-throwing, Peach Garden oath, Huarong release or iconic Empty Fort scene as securely documented historical events. The Thirty-Six Stratagems is identified as a later compilation, not a contemporaneous handbook.
