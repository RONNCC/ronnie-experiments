# The Relit Wave — Cultural, Culinary & Intellectual Wave Movements

An interactive field guide exploring why so many seemingly unrelated domains—specialty coffee, variationist sociolinguistics, bean-to-bar chocolate, ska, emo, psychotherapy, human–computer interaction, artificial intelligence, environmentalism, democratization, and feminism—organize their histories into "First, Second, and Third Waves."

## What's Inside

1. **Anatomy & Genealogy Scrubber (1968–2017):** How the modern cultural "wave" metaphor jumped from Martha Weinman Lear's 1968 *New York Times* essay on feminism to Alvin Toffler (1980), Samuel Huntington (1991), Trish Rothgeb's third-wave coffee (2002/2003), Steven Hayes's CBT (2004), Susanne Bødker's HCI (2006), Penelope Eckert's sociolinguistics (2012), and DARPA's AI waves (2017).
2. **Eleven-Movement Atlas:** Filterable cards with explicit citation statuses (canonical scholarly framework vs. industry term vs. borrowed craft analogy vs. fan historiography), wave-by-wave sparks, blind spots, and critiques.
3. **Everyday Lens Lab:** Translates a single everyday moment (ordering coffee, pronouncing a sharp `/t/`, stage fright, scoping an interface) across Waves 1, 2, and 3.
4. **Cross-Domain Comparator & Spot-a-Wave Sandbox:** Compare any two domains side-by-side, or map presets like craft beer, natural wine, ramen, and the web.
5. **Ocean Swells vs. Radio Frequencies Lab:** Visualizes historian Nancy A. Hewitt's (*No Permanent Waves*, 2010) critique of empty "troughs" and Samuel Huntington's "reverse waves."
6. **Pattern Check Quiz, Searchable Glossary & Source Ledger.**

## Local Preview & Verification

Serve from the repository root:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000/experiments/relit-waves/
```

Run the Node test suite:

```bash
node --test experiments/relit-waves/tests/relit-waves.test.cjs
```
