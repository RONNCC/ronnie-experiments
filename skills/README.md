# Design skills

Vendored design rules for anyone (human or agent) building an experiment in this
repo. Read the relevant skill before writing markup, CSS, or copy.

| Skill | Use it when |
|---|---|
| [`landing-page-design/SKILL.md`](landing-page-design/SKILL.md) | Building or restyling any page, section, or component from scratch. Holds the visual system: type, spacing, radius, color, motion. |
| [`redesign-existing-projects/SKILL.md`](redesign-existing-projects/SKILL.md) | Auditing and upgrading a page that already exists, especially when it reads as generic or machine made. |

Both are vendored from [elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills)
(MIT, see [`LICENSE-ai-design-skills`](LICENSE-ai-design-skills)) and
[elayadesign/redesign-skill](https://github.com/elayadesign/redesign-skill) (MIT).

## The short version

Most of the "this looks AI made" problem comes from a handful of reproducible
choices. These are the ones this repo now enforces.

**Type**
- One typeface. Geist, self hosted at `assets/fonts/geist-latin.woff2`. No second
  face, no italics anywhere, weights capped at semibold (600).
- Sizes snap to the Tailwind scale: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72.
  No `1.37rem` values.
- `text-wrap: balance` on headings, `text-wrap: pretty` on body. No orphan words.
- No hyphens inside sentences. Rewrite the phrase, or use a comma or colon.

**Space and shape**
- Spacing only from 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96.
- Radii from the Tailwind scale. Nested shapes use `inner = outer − gap` when the
  gap is under 32px and the result is above 2.
- Borders wrap the whole card, never one side.

**Color**
- Flat surfaces. No background gradients, no ambient glow, no glassy overlays.
- One accent per page. Saturation under 80%.
- Shadows tint toward the background hue, never pure black.

**Motion**
- Base curve `cubic-bezier(0.22, 1, 0.36, 1)`. 500ms for movement, 300ms for
  color, never under 200ms.
- Scroll reveals via `IntersectionObserver`, once, 600 to 800ms. Never an
  unthrottled scroll listener.
- Only `transform` and `opacity`. Respect `prefers-reduced-motion`.

**Copy**
- No filler ("revolutionize", "supercharge", "effortless", "world class").
- Specific over vague. Cut every claim that a source cannot back.
- Sentence case for headings and buttons.
- No invented facts. If a number is not sourced, it does not ship.

## Applied so far

- `experiments/relit-waves/` — rebuilt against these rules: single Geist
  typeface, flat paper surfaces, one brass accent, full-border cards, real
  scroll reveals, and every date claim matched to a source in `data.js`.
