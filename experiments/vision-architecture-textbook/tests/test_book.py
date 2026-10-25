"""Dependency-light checks for the generated Pages artifact and its source."""
from __future__ import annotations

import re
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import build  # noqa: E402 — build dependency is pinned in requirements-build.txt

CHAPTER_COUNT = 23


class CollectHTML(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.hrefs: list[str] = []
        self.assets: list[str] = []
        self.heading_tags: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if data.get("id"):
            self.ids.append(data["id"] or "")
        if tag == "a" and data.get("href"):
            self.hrefs.append(data["href"] or "")
        if tag in {"link", "script"}:
            if data.get("href") or data.get("src"):
                self.assets.append(data.get("href") or data.get("src") or "")
        if tag in {"h1", "h2", "h3"}:
            self.heading_tags.append(tag)


class BookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.site = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.book = (ROOT / "TEXTBOOK.md").read_text(encoding="utf-8")
        cls.parser = CollectHTML()
        cls.parser.feed(cls.site)

    def test_generated_files_are_in_sync(self) -> None:
        for path, expected in build.render().items():
            self.assertEqual(path.read_text(encoding="utf-8"), expected, f"Rebuild {path.name}")

    def test_chapter_order_and_real_content(self) -> None:
        numbers = [int(n) for n in re.findall(r"^## (\d+)\. ", self.book, flags=re.MULTILINE)]
        self.assertEqual(numbers, list(range(CHAPTER_COUNT)))
        self.assertGreaterEqual(len(self.book.split()), 25_000)
        # Four lenses must be named, and the CNN vs. ViT question must be answered.
        for term in [
            "inductive bias", "optimization", "expressivity", "systems",
            "rank collapse", "registers", "FlashAttention", "roofline",
            "on-policy distillation", "NaViT", "Mamba", "SAM 3", "DINOv3",
        ]:
            self.assertIn(term.lower(), self.book.lower())

    def test_every_chapter_ends_with_a_falsification_statement(self) -> None:
        for path in sorted((ROOT / "chapters").glob("[0-9][0-9]-*.md")):
            text = path.read_text(encoding="utf-8").strip()
            self.assertIn("**What would change my mind:**", text, f"Missing falsifier in {path.name}")
            tail = text.split("**What would change my mind:**")[-1].strip()
            self.assertTrue(tail, f"Empty falsifier in {path.name}")
            self.assertNotIn("**", tail, f"Content follows the falsifier in {path.name}")

    def test_ids_unique_all_internal_links_resolve(self) -> None:
        ids = self.parser.ids
        self.assertEqual(len(ids), len(set(ids)))
        idset = set(ids)
        for n in range(CHAPTER_COUNT):
            self.assertIn(f"chapter-{n}", idset)
            self.assertIn(f"#chapter-{n}", self.parser.hrefs)
        for href in self.parser.hrefs:
            if href.startswith("#"):
                self.assertIn(unquote(href[1:]), idset, f"Broken site anchor {href}")
        self.assertGreaterEqual(self.parser.heading_tags.count("h2"), CHAPTER_COUNT)

    def test_local_assets_and_links_exist(self) -> None:
        for url in self.parser.hrefs + self.parser.assets:
            parsed = urlsplit(url)
            if url.startswith("#") or parsed.scheme or parsed.netloc:
                continue
            target = (ROOT / unquote(parsed.path)).resolve()
            self.assertTrue(target.is_relative_to(ROOT.parent.parent), f"Unexpected link traversal: {url}")
            self.assertTrue(target.is_file() or (target.is_dir() and (target / "index.html").is_file()), url)
        self.assertNotIn("localhost", self.site)
        self.assertNotIn("{{", self.site)
        self.assertIn('src="app.mjs"', self.site)
        self.assertIn("TEXTBOOK.md", self.site)

    def test_source_links_and_lab_anchors_are_visible(self) -> None:
        self.assertIn("#lab", self.parser.hrefs)
        self.assertIn("#book", self.parser.hrefs)
        # The sources chapter must carry real, well-formed research links.
        self.assertGreaterEqual(len(re.findall(r"https://", self.book)), 25)
        self.assertIn("arxiv.org/abs", self.book)

    def test_interactive_lab_ids_are_wired(self) -> None:
        for element_id in [
            "roofline-hardware", "roofline-intensity", "attention-controls", "att-seq",
            "att-dim", "att-heads", "att-batch", "att-phase", "att-flash", "recommend-controls",
            "rec-data", "rec-latency", "rec-resolution", "rec-hardware", "rec-dense",
        ]:
            self.assertIn(f'id="{element_id}"', self.site)


if __name__ == "__main__":
    unittest.main()
