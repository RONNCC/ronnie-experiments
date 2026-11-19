"""Dependency-free publication checks. Run from any directory with Python 3.

Mirrors experiments/three-kingdoms-textbook/tests/test_structure.py.
Passing these checks is not a claim of complete accessibility conformance.
"""
import json
import re
import unittest
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
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

    def handle_startendtag(self, tag, attrs):
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
        self.assertEqual(entries[0]["path"], "experiments/open-vs-closed-mri-textbook/")
        self.assertIn(entries[0]["path"], (ROOT / "README.md").read_text())

    def test_anchors_are_unique_and_resolve(self):
        ids = [attrs["id"] for _, attrs in self.doc.elements if "id" in attrs]
        self.assertEqual([key for key, n in Counter(ids).items() if n > 1], [])
        for tag, attrs in self.doc.elements:
            href = attrs.get("href", "")
            if tag == "a" and href.startswith("#"):
                self.assertIn(unquote(href[1:]), ids)

    def test_chapters_figures_and_glossary(self):
        chapter_ids = [a["id"] for _, a in self.doc.elements if a.get("id", "").startswith("chapter-")]
        self.assertEqual(len(chapter_ids), 8)
        figures = [a for tag, a in self.doc.elements if tag == "figure"]
        captions = [1 for tag, _ in self.doc.elements if tag == "figcaption"]
        self.assertGreaterEqual(len(figures), 9)
        self.assertEqual(len(figures), len(captions))
        self.assertGreaterEqual(len(re.findall(r'<dt id="term-', self.text)), 25)
        self.assertNotIn("Lorem ipsum", self.text)

    def test_local_assets_and_no_remote_dependencies(self):
        for tag, attrs in self.doc.elements:
            ref = attrs.get("src") or (attrs.get("href") if tag == "link" else None)
            if not ref or tag == "a" or attrs.get("rel") == "canonical":
                continue
            self.assertFalse(urlsplit(ref).scheme, ref)
            self.assertTrue((EXPERIMENT / ref).exists(), ref)
        self.assertTrue((EXPERIMENT / "assets/fonts/geist-latin.woff2").exists())
        self.assertTrue((EXPERIMENT / "assets/fonts/geist-latin-ext.woff2").exists())
        self.assertTrue((EXPERIMENT / "assets/fonts/LICENSE-geist.txt").exists())
        self.assertTrue((EXPERIMENT / "assets/favicon.svg").exists())
        script = (EXPERIMENT / "app.js").read_text()
        for forbidden in ["localStorage", "sessionStorage", "document.cookie", "fetch("]:
            self.assertNotIn(forbidden, script)

    def test_accessible_illustrations_and_controls(self):
        svgs = [a for tag, a in self.doc.elements if tag == "svg"]
        self.assertGreaterEqual(len(svgs), 10)
        for attrs in svgs:
            if attrs.get("aria-hidden") == "true":
                continue
            self.assertEqual(attrs.get("role"), "img")
            self.assertTrue(attrs.get("aria-label") or attrs.get("aria-labelledby"))
        # Interactive controls stay hidden until app.js reveals them.
        for tag, attrs in self.doc.elements:
            classes = attrs.get("class", "").split()
            if "lab-controls" in classes or "gloss-tools" in classes:
                self.assertIn("data-controls", attrs)
                self.assertIn("hidden", attrs)
        self.assertGreaterEqual(self.text.count('role="status"'), 4)
        self.assertIn('class="skip-link"', self.text)

    def test_design_system_primitives(self):
        css = (EXPERIMENT / "styles.css").read_text()
        self.assertIn("cubic-bezier(0.22, 1, 0.36, 1)", css)
        self.assertIn("prefers-reduced-motion", css)
        self.assertNotIn("font-style: italic", css)
        self.assertNotIn("<em>", self.text)
        self.assertNotIn("<i>", self.text)


if __name__ == "__main__":
    unittest.main()
