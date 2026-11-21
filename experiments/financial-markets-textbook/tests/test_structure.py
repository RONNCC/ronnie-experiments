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
        self.assertIn("invented teaching assumptions", HTML.lower())
        self.assertIn("not a live price", HTML.lower())

    def test_primary_source_appendix_and_developer_note_exist(self):
        self.assertIn("source-archegos", HTML)
        self.assertIn("source-bis-cls", HTML)
        self.assertIn("source-chips", HTML)
        self.assertTrue((ROOT / "README.md").exists())


if __name__ == "__main__":
    unittest.main()
