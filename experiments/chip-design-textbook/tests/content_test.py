"""Standard-library content checks for Volume 2. Run from any directory."""
import re
import unittest
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
BOOK = (ROOT / 'TEXTBOOK.md').read_text()
HTML = (ROOT / 'index.html').read_text()


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids, self.assets, self.titles, self.metas = [], [], [], [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag in ('script', 'img', 'link'):
            self.assets.append(attrs.get('src', attrs.get('href', '')))
        if tag == 'title':
            self.titles.append(True)
        if tag == 'meta' and attrs.get('name') == 'description':
            self.metas.append(attrs.get('content', ''))


class VolumeTwoContent(unittest.TestCase):
    def test_title_and_meta_description_are_set(self):
        self.assertIn('<title>Chip Design, Beyond Verification — From RTL to Tapeout</title>', HTML)
        self.assertIn('name="description"', HTML)
        self.assertIn('Volume 2 of the chip series', HTML)

    def test_volume_one_relationship(self):
        self.assertIn('Volume 1 covered checking chips; this volume covers designing them.', BOOK)
        self.assertIn('../chip-verification-textbook/', HTML)
        self.assertGreaterEqual(HTML.count('../chip-verification-textbook/'), 2, 'intro and footer both link Volume 1')
        self.assertIn('href="../../"', HTML, 'footer/sitemap links the experiments index')

    def test_eda_tools_cross_links(self):
        self.assertGreaterEqual(HTML.count('../eda-tools-explorer/'), 2, 'intro and footer both link eda-tools-explorer')
        self.assertIn('The Chip Design Software Landscape', BOOK)
        self.assertIn('The Chip Design Software Landscape', HTML)

    def test_box_count_claim_matches_reality(self):
        self.assertEqual(HTML.count('class="today"'), 15)
        self.assertIn('fifteen teaching chapters and fifteen boxes', BOOK)
        self.assertNotIn('sixteen', BOOK.lower())
        self.assertEqual(HTML.count('15 teaching sections'), 2, 'hero and sidebar agree')
        self.assertNotIn('13 chapters', HTML)

    def test_eda_tools_page_links_the_live_textbook(self):
        page = (ROOT.parent / 'eda-tools-explorer' / 'index.html').read_text()
        self.assertIn('../chip-design-textbook/', page)
        self.assertNotIn('not yet available', page)
        self.assertNotIn('is not yet in this checkout', page)

    def test_seventeen_sections_and_fifteen_today_boxes(self):
        self.assertEqual(len(re.findall(r'^## ', BOOK, re.M)), 17)
        for number in range(3, 16):
            self.assertIn(f'## {number}.', BOOK)
        self.assertEqual(HTML.count('class="today"'), 15, 'chapters 1-15 each close with a today box')
        for phrase in ('Workflow', 'Tools', 'Pain points'):
            self.assertEqual(HTML.count(f'<strong>{phrase}.</strong>'), 15, phrase)

    def test_start_here_pipeline_map(self):
        start = BOOK.split('## Start here:', 1)[1].split('## Reading routes', 1)[0]
        for stage in ('Architecture', 'RTL', 'Verification', 'Synthesis', 'Physical design', 'Tapeout', 'Bring-up'):
            self.assertIn(stage, start)
        self.assertIn('1x', start); self.assertIn('10x', start); self.assertIn('100x', start)
        self.assertEqual(len(re.findall(r'^\*\*Route \d', BOOK, re.M)), 3)

    def test_four_demo_fragments_present(self):
        for lab in ('pipeline-lab', 'rtl-lab', 'hls-lab', 'node-lab'):
            self.assertIn(f'id="{lab}"', HTML, lab)
            self.assertIn(f'id="{lab}"', (ROOT / 'labs.html').read_text(), lab)

    def test_required_facts_and_attributions(self):
        checks = ['5% of surveyed IC/ASIC projects', '14.4%', 'Wilson Research Group',
                  'logic and functional errors remain the primary cause', '72.5%', 'UCIe',
                  'HLS-Eval', 'ForgeHLS', '459,850', '846 kernels', '19% to 69%', 'AgentEngineer', 'Autopilot',
                  'ChipStack', 'Fuse EDA', 'rule of thumb', 'foundries do not publish prices',
                  'MPW', 'Efabless', 'GDSII', 'PDK', 'reticle limit', 'Poisson',
                  'binary decision diagrams', '1986', 'no state at all']
        for phrase in checks:
            self.assertIn(phrase, BOOK, phrase)

    def test_glossary_is_complete_and_filterable(self):
        self.assertEqual(HTML.count('class="glossary-entry"'), 123)
        self.assertIn('id="glossary-search"', HTML)
        self.assertIn('id="clear-glossary"', HTML)
        glossary = BOOK.split('## Glossary', 1)[1].split('## Sources', 1)[0].lower()
        for term in ('rtl', 'systemverilog', 'netlist', 'synthesis', 'hls', 'pragma', 'ppa', 'slack',
                     'drc', 'lvs', 'gdsii', 'pdk', 'euv', 'finfet', 'gaa', 'chiplet', 'interposer',
                     'hbm', 'ucie', 'nre', 'yield', 'mpw', 'bist', 'scan chain', 'jtag', 'eco',
                     'first-pass silicon success', 'rule of thumb', 'fabless', 'osat', 'hbm'):
            self.assertIn(term, glossary, term)

    def test_anchors_and_local_assets(self):
        links = Links()
        links.feed(HTML)
        self.assertEqual(len(links.ids), len(set(links.ids)), 'no duplicate IDs')
        for href in links.links:
            if href.startswith('#'):
                self.assertIn(href[1:], links.ids, href)
        for asset in links.assets:
            self.assertNotIn('://', asset, 'no external runtime assets')
        self.assertNotIn('<form', HTML)
        self.assertIn('aria-label="Reading shortcuts"', HTML)

    def test_sources_are_labelled(self):
        sources = BOOK.split('## Sources', 1)[1]
        for label in ('[press]', '[research]', '[primary]', '[estimate]', '[rule of thumb]', '[open]', '[standard]'):
            self.assertIn(label, sources, label)
        self.assertIn('https://arxiv.org/abs/2504.12268', sources)
        self.assertIn('https://arxiv.org/html/2507.03255v3', sources)
        self.assertNotIn('arxiv.org/abs/2507.03255)', sources, 'ForgeHLS cited at v3, not the abstract stub')
        self.assertIn('semiengineering.com', sources)


if __name__ == '__main__':
    unittest.main()
