from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")


class Structure(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.chapters = []
        self.current = None
        self.stack = []
        self.figures = []
        self.svg_depth = 0
        self.svg_titles = 0
        self.svg_descs = 0
        self.captions = 0
        self.text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("href", "").startswith("#"):
            self.links.append(attrs["href"][1:])
        if tag == "article" and "chapter" in attrs.get("class", "").split():
            self.current = {"id": attrs.get("id"), "figures": 0, "captions": 0, "title": attrs.get("data-title")}
            self.chapters.append(self.current)
        if tag == "svg":
            self.svg_depth += 1
            if self.current is not None:
                self.current["figures"] += 1
                if not attrs.get("aria-labelledby"):
                    self.current["unlabelled"] = self.current.get("unlabelled", 0) + 1
        if self.svg_depth and tag == "title":
            self.svg_titles += 1
        if self.svg_depth and tag == "desc":
            self.svg_descs += 1
        if tag == "figcaption" and self.current is not None:
            self.captions += 1
            self.current["captions"] += 1
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag == "svg":
            self.svg_depth -= 1
        if self.stack:
            self.stack.pop()
        if tag == "article" and self.current is not None:
            self.current = None


class TextbookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = Structure()
        cls.doc.feed(HTML)

    def test_stable_chapters_have_original_svg_figures_and_captions(self):
        self.assertEqual(len(self.doc.chapters), 11)
        self.assertEqual(len({chapter["id"] for chapter in self.doc.chapters}), 11)
        for chapter in self.doc.chapters:
            with self.subTest(chapter=chapter["id"]):
                self.assertTrue(chapter["id"].startswith("c"))
                self.assertTrue(chapter["title"])
                self.assertGreaterEqual(chapter["figures"], 1)
                self.assertGreaterEqual(chapter["captions"], 1)
                self.assertEqual(chapter.get("unlabelled", 0), 0)
        self.assertGreaterEqual(self.doc.svg_titles, 11)
        self.assertGreaterEqual(self.doc.svg_descs, 11)

    def test_local_deep_links_resolve_and_ids_are_unique(self):
        self.assertEqual(len(self.doc.ids), len(set(self.doc.ids)))
        missing = sorted(set(self.doc.links) - set(self.doc.ids))
        self.assertEqual(missing, [])
        for target in ["c01-foundations", "c02-fx", "c11-worked-trade", "glossary", "sources", "future-topics"]:
            self.assertIn(target, self.doc.ids)

    def test_simulators_and_keyboard_friendly_native_controls_exist(self):
        for control in ["fx-direction", "fx-usd", "fx-rate", "lifecycle-step", "sim-notional", "sim-leverage", "sim-gap"]:
            self.assertIn(f'id="{control}"', HTML)
        self.assertIn('aria-live="polite"', HTML)
        self.assertIn("<details class=\"question\"", HTML)
        self.assertIn("@media print", (ROOT / "styles.css").read_text(encoding="utf-8"))

    def test_mobile_diagrams_scroll_inside_containers_and_print_styles_exist(self):
        css = (ROOT / "styles.css").read_text(encoding="utf-8")
        self.assertIn(".chapter-svg-scroll{max-width:100%;overflow-x:auto", css)
        self.assertIn(".svg-scroll{width:100%;overflow-x:auto", css)
        self.assertIn("@media(max-width:700px)", css)
        self.assertIn("@media print", css)
        self.assertNotIn("width:100vw", css)

    def test_nonmarket_examples_are_labeled_illustrative(self):
        self.assertIn("illustrative quote", HTML.lower())
        self.assertIn("examples labeled illustrative use invented assumptions", HTML.lower())
        self.assertIn("not a live price", HTML.lower())

    def test_opening_map_explains_aggregation_and_preserves_directional_labels(self):
        self.assertIn("aggregate teaching map that combines roles and simplifies routes", HTML)
        self.assertIn("This is a simplified aggregate teaching map", HTML)
        for label in ["securities /", "fund shares", "savings /", "purchase money", "issue proceeds /", "funding"]:
            self.assertIn(label, HTML)
        self.assertIn('d="M228 198 H378"', HTML)  # purchase money flows from savers to dealers
        self.assertIn('d="M378 170 H228"', HTML)  # investment claims flow back
        self.assertIn('d="M614 115H290"', HTML)  # dollars flow from dealer to buyer
        self.assertIn('d="M286 177H610"', HTML)  # won flows from buyer to dealer

    def test_archegos_spelling_and_chapter_11_currency_sequence_are_consistent(self):
        self.assertIn("ARCHEGOS</text>", HTML)
        chapter = HTML.split('id="c11-worked-trade"', 1)[1].split('<section class="future"', 1)[0]
        self.assertIn("holds KRW 13.5 billion", chapter)
        self.assertIn("owes a Korean supplier USD 10 million", chapter)
        self.assertIn("buys USD 10 million from its bank for KRW 13.5 billion", chapter)
        self.assertIn("at an illustrative KRW 1,350 per USD", chapter)
        self.assertIn("then instructs its bank to pay the supplier in USD", chapter)
        self.assertIn("KRW 13.5bn → dealer", chapter)
        self.assertIn("USD 10m ← dealer", chapter)
        self.assertIn("through payment systems and a correspondent bank to the supplier", chapter)
        self.assertIn("Illustrative two-stage sequence", chapter)
        self.assertIn("CORRESPONDENT", chapter)

    def test_primary_source_appendix_and_developer_note_exist(self):
        self.assertIn("source-archegos", HTML)
        self.assertIn("source-bis-cls", HTML)
        self.assertIn("source-chips", HTML)
        for verified_url in [
            "https://www.bis.org/publications/qr-202512/global-fx-markets-when-hedging-takes-centre-stage",
            "https://www.theclearinghouse.org/payment-systems/chips",
            "https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-creation-in-the-modern-economy.pdf",
        ]:
            self.assertIn(verified_url, HTML)
        self.assertTrue((ROOT / "README.md").exists())


if __name__ == "__main__":
    unittest.main()
