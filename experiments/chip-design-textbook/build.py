"""Rebuild static HTML from TEXTBOOK.md. Requires Markdown==3.11.2 (see requirements.txt).
The shipped site is plain static files; this script exists only to regenerate index.html."""
from pathlib import Path
import re
import html
import markdown

ROOT = Path(__file__).resolve().parent
text = (ROOT / 'TEXTBOOK.md').read_text()
labs = (ROOT / 'labs.html').read_text()
FRAG = {
    'B': labs.split('<!-- DEMO-B-END -->')[0],
    'A': labs.split('<!-- DEMO-B-END -->')[1].split('<!-- DEMO-A-END -->')[0],
    'C': labs.split('<!-- DEMO-A-END -->')[1].split('<!-- DEMO-C-END -->')[0],
    'D': labs.split('<!-- DEMO-C-END -->')[1].split('<!-- DEMO-D-END -->')[0],
}
parts = re.split(r'^## ', text, flags=re.M)
sections = []
nav = []
for i, part in enumerate(parts[1:]):
    title = part.splitlines()[0]
    match = re.match(r'(\d+)\.', title)
    slug = f'chapter-{match[1]}' if match else 'start-here' if title.startswith('Start here:') else 'routes' if title == 'Reading routes' else 'glossary' if title.startswith('Glossary') else 'sources'
    nav.append(f'<a href="#{slug}">{html.escape(title)}</a>')
    body = markdown.markdown('## ' + part, extensions=['tables', 'fenced_code'])
    if slug == 'glossary':
        body = re.sub(r'(<p><strong>.*?</p>)', r'<div class="glossary-entry">\1</div>', body, flags=re.S)
        controls = '<div class="glossary-tools"><label for="glossary-search">Find a word or example</label><input id="glossary-search" type="search" placeholder="Try: netlist, yield, HLS" autocomplete="off"><button id="clear-glossary" type="button">Show all terms</button><p id="glossary-status" role="status"></p></div>'
        body = body.replace('</h2>', '</h2>' + controls, 1)
    # Long code/tables scroll in their own labeled regions, never at body level.
    body = re.sub(r'(<pre>.*?</pre>)', r'<div class="code-scroll"><span class="scroll-cue">↔ Code scrolls horizontally · illustrative, not executed in browser</span>\1</div>', body, flags=re.S)
    body = body.replace('<pre>', '<pre tabindex="0" aria-label="Illustrative code; scroll horizontally">')
    body = re.sub(r'(<table>.*?</table>)', r'<div class="table-scroll" tabindex="0" role="region" aria-label="Table; scroll horizontally"><span class="scroll-cue">↔ Table scrolls horizontally</span>\1</div>', body, flags=re.S)
    for key in ('A', 'B', 'C', 'D'):
        body = body.replace(f'<!-- LAB-{key} -->', FRAG[key])
    # Each chapter closes with the boxed "How people do this today" section.
    body = re.sub(r'(<h3>How people do this today</h3>.*)$', r'<div class="today">\1</div>', body, flags=re.S)
    sections.append(f'<section id="{slug}" class="chapter" tabindex="-1" aria-label="{html.escape(title, quote=True)}">{body}</section>')
words = len(re.findall(r"\b[\w’'-]+\b", text))
page = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Volume 2 of the chip series for software and AI engineers: how chips are actually designed — RTL, synthesis, physical design, tapeout, foundries, chiplets, silicon economics, and where AI helps today — with four interactive demos.">
<meta name="color-scheme" content="light"><title>Chip Design, Beyond Verification — From RTL to Tapeout</title>
<link rel="stylesheet" href="styles.css"><script src="model.js" defer></script><script src="app.js" defer></script></head>
<body><a class="skip" href="#start-here">Skip to textbook</a>
<header class="top"><a href="../../">RONNIE'S EXPERIMENTS</a><span>FIELDNOTES / 02 NOV 2026</span><button id="print" type="button">Print book</button></header>
<nav class="reader-bar" aria-label="Reading shortcuts"><a href="#start-here">Start here</a><a href="#glossary">Glossary</a><a href="#contents">Chapters</a></nav>
<div class="layout"><aside><div class="sidebar-title">THE LEARNING ATLAS <span>Volume 2 · 13 chapters + sources</span></div>
<label for="search">Find a concept</label><input id="search" type="search" placeholder="Try: netlist, yield, HLS…" autocomplete="off"><button id="clear-search" type="button">Clear search</button><p id="search-status" role="status">All chapters shown</p>
<details id="contents" open><summary>Table of contents</summary><nav aria-label="Table of contents">NAV</nav></details><a class="download" href="TEXTBOOK.md" download>↓ Download TEXTBOOK.md</a><a class="download" href="../chip-verification-textbook/">↗ Volume 1: Chip Verification</a></aside>
<main id="content"><section class="hero"><p class="eyebrow">HARDWARE × SOFTWARE × DELIVERY</p><h1>From RTL<br>to <em>tapeout.</em></h1><p class="deck">Learn how chips are actually designed — specs, RTL, synthesis, physical design, foundries, packaging, and the money — written for software and AI engineers. Volume 2 of the chip series.</p>
<a class="start-action" href="#start-here">Start here · 20 minutes · the whole pipeline →</a>
<div class="hero-meta"><span>WORDS words</span><span>4 interactive demos</span><span>13 chapters + glossary</span></div>
<div class="circuit" aria-hidden="true"><span>SPEC</span><b>→</b><span>RTL</span><b>→</b><span>NETLIST</span><b>→</b><span>SILICON</span></div>
<p class="boundary">Public-source edition. Independent educational synthesis; not affiliated with any EDA vendor or foundry. Cost figures are labeled public estimates or rules of thumb, never quotes. No tracking, forms, or external assets.</p>
<div class="route-buttons" aria-label="Choose a reading route"><a href="#routes" data-route="software">Software engineer ↗</a><a href="#routes" data-route="newgrad">New grad ↗</a><a href="#routes" data-route="product">Product-minded ↗</a></div><p id="route-status" role="status"></p>
</section><div class="intro">INTRO</div>SECTIONS<p id="empty-search" hidden>No matching chapters. Try another term or clear search.</p>
<footer>Built to make claims inspectable. Read the <a href="#sources">source boundaries</a> before quoting any figure. Volume 2 of the chip series — Volume 1: <a href="../chip-verification-textbook/">Chip Verification — From Software to Silicon</a> · <a href="../../">All experiments</a> · <a href="#content">Back to top ↑</a></footer></main></div></body></html>'''
intro = markdown.markdown(parts[0].split('\n', 1)[1])
page = page.replace('NAV', '\n'.join(nav)).replace('WORDS', f'{words:,}').replace('INTRO', intro).replace('SECTIONS', '\n'.join(sections))
(ROOT / 'index.html').write_text(page)
print(f'Built {len(sections)} sections; {words:,} prose/code tokens by word regex.')
