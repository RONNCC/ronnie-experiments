"""Dependency-free publication checks. Run from any directory with Python 3."""
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import unquote, urlsplit

EXPERIMENT = Path(__file__).resolve().parents[1]
ROOT = EXPERIMENT.parents[1]


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.elements = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class PublicationChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = (EXPERIMENT / "index.html").read_text()
        cls.doc = Document(cls.text)

    def test_manifest_and_readme(self):
        catalog = json.loads((ROOT / "experiments.json").read_text())
        entries = [x for x in catalog if x["id"] == EXPERIMENT.name]
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["path"], "experiments/three-kingdoms-textbook/")
        self.assertIn(entries[0]["path"], (ROOT / "README.md").read_text())

    def test_anchors_are_unique_and_resolve(self):
        ids = [attrs["id"] for _, attrs in self.doc.elements if "id" in attrs]
        self.assertEqual([key for key, n in Counter(ids).items() if n > 1], [])
        for tag, attrs in self.doc.elements:
            href = attrs.get("href", "")
            if tag == "a" and href.startswith("#"):
                self.assertIn(unquote(href[1:]), ids)

    def test_full_chapters_and_profiles(self):
        classes = Counter()
        for _, attrs in self.doc.elements:
            classes.update(attrs.get("class", "").split())
        self.assertEqual(classes["chapter"], 23)
        self.assertEqual(classes["profile"], 16)
        self.assertGreaterEqual(classes["idiom"], 25)
        for name in ["Cao Cao", "Liu Bei", "Sun Quan", "Zhuge Liang", "Guan Yu",
                     "Zhang Fei", "Sima Yi", "Lü Bu", "Zhou Yu", "King Zheng",
                     "Su Qin", "Zhang Yi", "Bai Qi", "Lin Xiangru", "Lian Po", "Jing Ke"]:
            self.assertIn(name, self.text)
        self.assertNotIn("Lorem ipsum", self.text)

    def test_local_assets_and_no_remote_dependencies(self):
        for tag, attrs in self.doc.elements:
            ref = attrs.get("src") or (attrs.get("href") if tag == "link" else None)
            if not ref:
                continue
            self.assertFalse(urlsplit(ref).scheme, ref)
            self.assertTrue((EXPERIMENT / ref).exists(), ref)
        self.assertTrue((EXPERIMENT / "assets/field-guide-cjk.woff2").exists())
        self.assertTrue((EXPERIMENT / "assets/OFL.txt").exists())
        script = (EXPERIMENT / "app.js").read_text()
        for forbidden in ["localStorage", "sessionStorage", "document.cookie", "fetch("]:
            self.assertNotIn(forbidden, script)

    def test_accessible_illustrations_and_tables(self):
        svgs = [a for tag, a in self.doc.elements if tag == "svg"]
        self.assertGreaterEqual(len(svgs), 9)
        for attrs in svgs:
            self.assertEqual(attrs.get("role"), "img")
            self.assertTrue(attrs.get("aria-label") or attrs.get("aria-labelledby"))
        for _, attrs in self.doc.elements:
            if "table-wrap" in attrs.get("class", "").split():
                self.assertEqual(attrs.get("tabindex"), "0")
                self.assertTrue(attrs.get("aria-label"))


if __name__ == "__main__":
    unittest.main()
