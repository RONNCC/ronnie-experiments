# The Relit Wave: why movements come in numbered waves

Coffee has a third wave. So do variationist sociolinguistics, bean to bar chocolate, ska, emo,
cognitive behavioral therapy, HCI, AI, democratization, environmentalism, and feminism. This guide
asks why, dates every label, and then hands the last word to the people who think the metaphor is
hiding something.

## What is inside

1. **Origins.** When each wave label first appeared, from Lear's 1968 second feminist wave to
   Launchbury's 2017 waves of AI, with the vocabulary for label status. Every year links to its source.
2. **Atlas.** Eleven movements, 39 waves. Filter by wave shape or field, then read each wave's
   spark, what shifted, and what it missed. Contested waves are flagged, and every movement ends
   with the critique that pushes back on its numbering.
3. **Everyday scenes.** One small act (a diner mug, a released /t/, a talk you are dreading, an
   interface brief) read three ways. Each scene links to its movement in the atlas.
4. **Test the pattern.** Compare any two movements to see whether they share an engine or only a
   word. Then sandbox your own domain: pick a wave shape and draft three stages for craft beer,
   wine, ramen, or whatever you know.
5. **Metaphor lab.** Nancy Hewitt's 2010 critique of ocean waves, made interactive. Pick a movement,
   then raise persistence and the empty troughs fill in, or switch to her radio frequency model
   where several channels broadcast at once.
6. **Check quiz.** Five cases. Each answer links to its movement in the atlas.
7. **Glossary.** Terms used across the page.
8. **Sources.** A 26 entry source ledger.

## Design

Built to the rules in [`skills/`](../../skills/), vendored from
[elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills). One typeface
(Geist, self hosted, no italics), flat paper surfaces, a single terracotta accent, Tailwind spacing
and type steps, full border cards, and motion on one easing curve with `prefers-reduced-motion`
handled. No build step and no dependencies.

## Local preview and verification

Serve from the repository root:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000/experiments/relit-waves/
```

Run the Node test suite:

```bash
node --test experiments/relit-waves/tests/relit-waves.test.cjs
```

The suite checks the manifest entry, the data schema, that every timeline year resolves to a
source, the anchor and asset wiring, the design constraints (one typeface, no italics, gradients
only as clipped text), and an end to end pass over every interactive widget.
