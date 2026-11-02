"""Standard-library checks for the beginner edition. Run from any directory."""
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
        self.links, self.ids, self.assets = [], [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag in ('script', 'img', 'link'):
            self.assets.append(attrs.get('src', attrs.get('href', '')))


class BeginnerContent(unittest.TestCase):
    def test_start_is_standalone_and_bounded(self):
        start = BOOK.split('## Start here:', 1)[1].split('## Reading routes', 1)[0]
        self.assertGreaterEqual(len(start.split()), 1200)
        self.assertLessEqual(len(start.split()), 1800)
        for phrase in ('manufactured electrical circuit', '20, then 10', 'independent checker',
                       'test plan', 'testbench', 'scoreboard', 'not an exact physical model',
                       'one-bit memory', 'metastability', 'conversation', 'immediate answers'):
            # The memory definition is phrased as "remembers one bit" in this route.
            if phrase == 'one-bit memory':
                self.assertIn('remembers one bit', start)
            else:
                self.assertIn(phrase.lower(), start.lower())
        questions = re.findall(r'^\d\. \*\*', start, re.M)
        self.assertEqual(len(questions), 5)
        self.assertLess(HTML.index('class="start-action"'), HTML.index('class="hero-meta"'))

    def test_every_chapter_has_readable_scaffolding_and_depth(self):
        for number in range(1, 23):
            chapter = BOOK.split(f'## {number}.', 1)[1].split('\n## ', 1)[0]
            for phrase in ('**In everyday words.**', '**Concrete example.**', '**What to remember.**', '### Deeper:'):
                self.assertIn(phrase, chapter, f'Chapter {number}: {phrase}')
        self.assertEqual(len(re.findall(r'^## \d+\.', BOOK, re.M)), 22)
        self.assertEqual(len(re.findall(r'^### Drill \d+', BOOK, re.M)), 25)

    def test_required_glossary_terms(self):
        glossary = BOOK.split('## Glossary', 1)[1].split('## Sources', 1)[0].lower()
        terms = ['rtl', 'dv', 'hdl', 'systemverilog', 'uvm', 'sva', 'cdc', 'rdc', 'fifo',
                 'dut', 'soc', 'ip', 'dma', 'axi', 'apb', 'ppa', 'eda', 'asic', 'fpga',
                 'formal', 'assertion', 'property', 'stimulus', 'oracle', 'testbench',
                 'scoreboard', 'monitor', 'driver', 'sequencer', 'sequence', 'agent',
                 'code coverage', 'functional coverage', 'assertion coverage', 'bin',
                 'cross', 'hole', 'waiver', 'regression', 'seed', 'waveform', 'reset',
                 'clock', 'cycle', 'edge', 'latency', 'throughput', 'backpressure',
                 'ready/valid', 'synchronizer', 'metastability', 'setup and hold', 'mtbf',
                 'gray', 'async fifo', 'synthesis', 'elaboration', 'emulation', 'simulation',
                 'pre-silicon', 'post-silicon', 'tapeout', 'respin', 'signoff', 'vacuity',
                 'bounded proof', 'fairness', 'checker', 'triage', 'root cause', 'ablation',
                 'benchmark', 'reproducibility', 'slurm', 'lsf']
        for term in terms:
            self.assertIn(term, glossary)
        self.assertIn('verification agent', glossary)
        self.assertIn('ai agent', glossary)
        self.assertIn('not a 96% probability of correctness', glossary)
        self.assertEqual(HTML.count('class="glossary-entry"'), 172)

    def test_technical_warnings_survive(self):
        for phrase in ('property hold_stalled_word;', 'sampled synchronous-reset semantics',
                       'not a calibrated voltage trajectory', 'physical skew',
                       'mean time between failures', 'not measurements of an actual AI model or company'):
            self.assertTrue(phrase.lower() in BOOK.lower(), phrase)
        self.assertIn('`disable iff (rst)`', BOOK)
        self.assertIn('**does not execute SystemVerilog', BOOK)

    def test_corrected_sources_and_scheduler_claim(self):
        links = Links()
        links.feed(HTML)
        correct = 'http://staff.ustc.edu.cn/~wyu0725/FPGA/snug_collection/1Sunburst%20Design/Clock%20Domain%20Crossing%20%28CDC%29%20Design%20&%20Verification%20Techniques%20Using%20SystemVerilog.pdf'
        self.assertIn(correct, links.links)
        self.assertIn('Constraints-on-Individual-CDC-Paths', HTML)
        self.assertIn('Bronco publicly says its agents run on customer compute through Slurm or LSF.', BOOK)
        self.assertIn('company-described integrations, not independently audited deployments', BOOK)

    def test_anchors_and_local_assets(self):
        links = Links()
        links.feed(HTML)
        self.assertEqual(len(links.ids), len(set(links.ids)))
        for href in links.links:
            if href.startswith('#'):
                self.assertIn(href[1:], links.ids)
        for asset in links.assets:
            self.assertNotIn('://', asset)
        self.assertNotIn('<form', HTML)
        self.assertIn('id="glossary"', HTML)
        self.assertIn('aria-label="Reading shortcuts"', HTML)


if __name__ == '__main__':
    unittest.main()
