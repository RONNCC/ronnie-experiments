"""Rebuild static HTML from TEXTBOOK.md. Requires Markdown==3.11.2 (see requirements.txt)."""
from pathlib import Path
import re
import html
import markdown

ROOT = Path(__file__).resolve().parent
text = (ROOT / 'TEXTBOOK.md').read_text()
parts = re.split(r'^## ', text, flags=re.M)
sections = []
nav = []
for i, part in enumerate(parts[1:]):
    title = part.splitlines()[0]
    match = re.match(r'(\d+)\.', title)
    slug = f'chapter-{match[1]}' if match else 'routes' if title == 'Reading routes' else 'sources'
    nav.append(f'<a href="#{slug}">{html.escape(title)}</a>')
    body = markdown.markdown('## ' + part, extensions=['tables', 'fenced_code'])
    # Long code/tables scroll in their own labeled regions, never at body level.
    body = re.sub(r'(<pre>.*?</pre>)', r'<div class="code-scroll"><span class="scroll-cue">↔ Code scrolls horizontally · illustrative, not executed in browser</span>\1</div>', body, flags=re.S)
    body = body.replace('<pre>', '<pre tabindex="0" aria-label="Illustrative code; scroll horizontally">')
    body = re.sub(r'(<table>.*?</table>)', r'<div class="table-scroll" tabindex="0" role="region" aria-label="Table; scroll horizontally"><span class="scroll-cue">↔ Table scrolls horizontally</span>\1</div>', body, flags=re.S)
    if slug == 'chapter-4':
        body += (ROOT / 'labs.html').read_text().split('<!-- COVERAGE -->')[0]
    if slug == 'chapter-9':
        body += (ROOT / 'labs.html').read_text().split('<!-- COVERAGE -->')[1].split('<!-- EVIDENCE -->')[0]
    if slug == 'chapter-12':
        body += (ROOT / 'labs.html').read_text().split('<!-- EVIDENCE -->')[1]
    if slug == 'chapter-20':
        body += (ROOT / 'cdc-lab.html').read_text()
    if slug == 'chapter-22':
        body += (ROOT / 'budget-lab.html').read_text()
    # Native disclosure controls keep model answers available without JS.
    if slug == 'chapter-17':
        body = re.sub(r'<h3>(Drill.*?)</h3>\s*(<p>.*?</p>)', r'<details class="drill"><summary>\1</summary>\2</details>', body, flags=re.S)
    sections.append(f'<section id="{slug}" class="chapter" aria-label="{html.escape(title, quote=True)}">{body}</section>')
words = len(re.findall(r"\b[\w’'-]+\b", text))
page = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="A deep, public-source chip verification textbook for software and AI engineers: RTL, FIFO contracts, UVM, formal, coverage, debugging, agents, and customer deployments.">
<meta name="color-scheme" content="light"><title>Chip Verification — From Software to Silicon</title>
<link rel="stylesheet" href="styles.css"><script src="model.js" defer></script><script src="app.js" defer></script></head>
<body><a class="skip" href="#content">Skip to textbook</a>
<header class="top"><a href="../../">RONNIE'S EXPERIMENTS</a><span>FIELDNOTES / 02 NOV 2026</span><button id="print" type="button">Print book</button></header>
<div class="layout"><aside><div class="sidebar-title">THE LEARNING ATLAS <span>22 chapters + sources</span></div>
<label for="search">Find a concept</label><input id="search" type="search" placeholder="Try: simultaneous, inference…" autocomplete="off"><p id="search-status" role="status">All chapters shown</p>
<details id="contents" open><summary>Table of contents</summary><nav aria-label="Table of contents">NAV</nav></details><a class="download" href="TEXTBOOK.md" download>↓ Download TEXTBOOK.md</a><a class="download" href="../bronco-chip-verification/">↗ Start with the introductory guide</a></aside>
<main id="content"><section class="hero"><p class="eyebrow">HARDWARE × SOFTWARE × TRUST</p><h1>From software<br>to <em>silicon.</em></h1><p class="deck">Chip verification, understood from the inside out. A systems textbook for engineers building the tools that help engineers build chips.</p>
<div class="hero-meta"><span>WORDS words</span><span>25 worked interview drills</span><span>4 labs + evidence exercise</span></div>
<div class="circuit" aria-hidden="true"><span>SPEC</span><b>→</b><span>STIMULUS</span><b>→</b><span>EVIDENCE</span><b>→</b><span>TRUST</span></div>
<p class="boundary">Public-source edition. Independent educational synthesis; not affiliated with Bronco. Company claims are attributed, not treated as benchmark results. No tracking, forms, or external assets.</p>
<div class="route-buttons" aria-label="Choose a reading route"><a href="#routes" data-route="quick">45-minute orientation ↗</a><a href="#routes" data-route="study">3-hour review ↗</a><a href="#routes" data-route="deep">Deep build route ↗</a></div><p id="route-status" role="status"></p>
</section><div class="intro">INTRO</div>SECTIONS<p id="empty-search" hidden>No matching chapters. Try another term or clear search.</p>
<footer>Built to make claims inspectable. Read the <a href="#sources">source boundaries</a> before interpreting product metrics. <a href="#content">Back to top ↑</a></footer></main></div></body></html>'''
intro = markdown.markdown(parts[0].split('\n', 1)[1])
page = page.replace('NAV', '\n'.join(nav)).replace('WORDS', f'{words:,}').replace('INTRO', intro).replace('SECTIONS', '\n'.join(sections))
(ROOT / 'index.html').write_text(page)
print(f'Built {len(sections)} sections; {words:,} prose/code tokens by word regex.')
