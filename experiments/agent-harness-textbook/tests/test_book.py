"""Dependency-light checks for the generated static reader."""
from __future__ import annotations
import re
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import build  # noqa: E402

CHAPTER_COUNT = 13

class CollectHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.hrefs, self.assets = [], [], []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if data.get("id"): self.ids.append(data["id"])
        if tag == "a" and data.get("href"): self.hrefs.append(data["href"])
        if tag in {"link", "script"} and (data.get("href") or data.get("src")):
            self.assets.append(data.get("href") or data.get("src"))

class BookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.site = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.book = (ROOT / "TEXTBOOK.md").read_text(encoding="utf-8")
        cls.parser = CollectHTML(); cls.parser.feed(cls.site)

    def test_generated_files_sync(self):
        for path, text in build.render().items():
            self.assertEqual(path.read_text(encoding="utf-8"), text)

    def test_chapters_and_content(self):
        nums = [int(n) for n in re.findall(r'id="chapter-(\d+)"', self.site)]
        self.assertEqual(nums, list(range(CHAPTER_COUNT)))
        self.assertGreater(len(self.book.split()), 6500)
        for term in ["control allocation", "feedback", "state", "pretraining", "post-training", "RLVR", "OpenHands", "LangGraph", "Thinking Machines", "Anthropic", "what would change my mind"]:
            self.assertIn(term.lower(), self.book.lower())

    def test_each_chapter_has_falsifier(self):
        for path in sorted((ROOT / "chapters").glob("[0-9][0-9]-*.md")):
            text = path.read_text(encoding="utf-8").strip()
            self.assertIn("**What would change my mind:**", text, path.name)
            self.assertTrue(text.split("**What would change my mind:**")[-1].strip(), path.name)
            self.assertNotIn("**", text.split("**What would change my mind:**")[-1], path.name)

    def test_anchors_and_local_files(self):
        ids = set(self.parser.ids)
        self.assertEqual(len(ids), len(self.parser.ids))
        for n in range(CHAPTER_COUNT):
            self.assertIn(f"chapter-{n}", ids)
            self.assertIn(f"#chapter-{n}", self.parser.hrefs)
        for href in self.parser.hrefs:
            if href.startswith("#"):
                self.assertIn(unquote(href[1:]), ids, href)
        boundary = ROOT.parent.parent.resolve()
        for url in self.parser.hrefs + self.parser.assets:
            parsed = urlsplit(url)
            if url.startswith("#") or parsed.scheme or parsed.netloc: continue
            target = (ROOT / unquote(parsed.path)).resolve()
            self.assertTrue(target.is_relative_to(boundary), url)
            self.assertTrue(target.is_file() or (target.is_dir() and (target / "index.html").is_file()), url)

    def test_lab_and_sources_are_wired(self):
        for element_id in ["reliability-controls", "step-success", "steps", "detect-rate", "recover-rate", "task-success", "book-search", "chapter-nav"]:
            self.assertIn(f'id="{element_id}"', self.site)
        self.assertIn("#lab", self.parser.hrefs)
        self.assertGreaterEqual(len(re.findall(r"https://", self.book)), 35)
        self.assertIn("arxiv.org/abs", self.book)
        self.assertIn('src="app.mjs"', self.site)
        self.assertNotIn("localhost", self.site)

if __name__ == "__main__": unittest.main()
