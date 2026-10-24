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
        self.assertEqual(numbers, list(range(29)))
        self.assertGreaterEqual(len(self.book.split()), 19_000)
        for term in ["idempotency", "calibration", "retrieval", "port scheduler", "voice", "threat modeling"]:
            self.assertIn(term, self.book.lower())

    def test_ids_unique_all_internal_links_resolve(self) -> None:
        ids = self.parser.ids
        self.assertEqual(len(ids), len(set(ids)))
        idset = set(ids)
        for n in range(29):
            self.assertIn(f"chapter-{n}", idset)
            self.assertIn(f"#chapter-{n}", self.parser.hrefs)
        for href in self.parser.hrefs:
            if href.startswith("#"):
                self.assertIn(unquote(href[1:]), idset, f"Broken site anchor {href}")
        self.assertGreaterEqual(self.parser.heading_tags.count("h2"), 29)

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

    def test_source_and_principles_are_visible(self) -> None:
        for phrase in ["Maryam Miradi", "hypothetical", "authoritative", "source", "#chapter-28"]:
            self.assertIn(phrase.lower(), self.site.lower())
        self.assertGreaterEqual(len(re.findall(r"https://", self.book)), 15)


if __name__ == "__main__":
    unittest.main()
