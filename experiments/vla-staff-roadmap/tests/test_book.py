"""Dependency-light checks for the generated Pages artifact and its sources."""
from __future__ import annotations

import json
import re
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = ROOT.parent.parent
sys.path.insert(0, str(ROOT))
import build  # noqa: E402 — pinned build dependency

CHAPTER_COUNT = 21


class CollectHTML(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.hrefs: list[str] = []
        self.assets: list[str] = []
        self.heading_tags: list[str] = []
        self.labels: list[str] = []
        self.controls: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if data.get("id"):
            self.ids.append(data["id"] or "")
        if tag == "a" and data.get("href"):
            self.hrefs.append(data["href"] or "")
        if tag in {"link", "script"} and (data.get("href") or data.get("src")):
            self.assets.append(data.get("href") or data.get("src") or "")
        if tag in {"h1", "h2", "h3"}:
            self.heading_tags.append(tag)
        if tag == "label" and data.get("for"):
            self.labels.append(data["for"] or "")
        if tag in {"input", "select"} and data.get("id"):
            self.controls.append(data["id"] or "")


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

    def test_chapter_order_depth_and_role_coverage(self) -> None:
        numbers = [int(number) for number in re.findall(r"^## (\d+)\. ", self.book, flags=re.MULTILINE)]
        self.assertEqual(numbers, list(range(CHAPTER_COUNT)))
        self.assertGreaterEqual(len(self.book.split()), 22_000)
        for term in [
            "behavior cloning", "vision-language-action", "diffusion", "flow matching",
            "action tokenization", "world model", "curriculum", "FSDP", "tensor parallelism",
            "pipeline parallelism", "multi-node", "mixed precision", "activation checkpointing",
            "LoRA", "distillation", "ROS 2", "MuJoCo", "Isaac Sim", "Gazebo",
            "on-robot", "multi-embodiment", "mentorship", "Wilson", "reproducib",
        ]:
            self.assertIn(term.lower(), self.book.lower(), term)
        self.assertIn("jobs.ashbyhq.com/nidus-technologies", self.book)
        self.assertIn("not affiliated with Nidus", self.book)
        self.assertIn("not a robot-safety certification", self.book)

    def test_every_chapter_ends_with_an_evidence_artifact(self) -> None:
        paths = sorted((ROOT / "chapters").glob("[0-9][0-9]-*.md"))
        self.assertEqual(len(paths), CHAPTER_COUNT)
        for path in paths:
            text = path.read_text(encoding="utf-8").strip()
            self.assertIn("**Prove it:**", text, f"Missing evidence artifact in {path.name}")
            tail = text.split("**Prove it:**")[-1].strip()
            self.assertTrue(tail, f"Empty evidence artifact in {path.name}")
            self.assertNotIn("**", tail, f"Content follows the evidence artifact in {path.name}")

    def test_seven_projects_have_completion_gates(self) -> None:
        projects = (ROOT / "chapters" / "16-projects.md").read_text(encoding="utf-8")
        for number in range(1, 8):
            self.assertRegex(projects, rf"### Project {number} —")
        self.assertEqual(projects.count("**Done gate.**"), 7)
        self.assertEqual(projects.count("**Anti-pattern.**"), 7)
        self.assertEqual(projects.count("**Deliverables.**"), 7)

    def test_ids_unique_and_all_internal_links_resolve(self) -> None:
        ids = self.parser.ids
        self.assertEqual(len(ids), len(set(ids)), "Duplicate HTML IDs")
        idset = set(ids)
        for number in range(CHAPTER_COUNT):
            self.assertIn(f"chapter-{number}", idset)
            self.assertIn(f"#chapter-{number}", self.parser.hrefs)
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
            self.assertTrue(target.is_relative_to(REPOSITORY), f"Unexpected link traversal: {url}")
            self.assertTrue(target.is_file() or (target.is_dir() and (target / "index.html").is_file()), url)
        self.assertNotIn("localhost", self.site)
        self.assertNotIn("{{", self.site)
        self.assertNotIn("TODO", self.site)
        self.assertIn('src="app.mjs"', self.site)
        self.assertIn("TEXTBOOK.md", self.site)

    def test_sources_and_lab_anchors_are_visible(self) -> None:
        self.assertIn("#lab", self.parser.hrefs)
        self.assertIn("#book", self.parser.hrefs)
        self.assertGreaterEqual(len(re.findall(r"https://", self.book)), 50)
        self.assertIn("arxiv.org/abs", self.book)
        self.assertIn("27 October 2026", self.book)

    def test_interactive_controls_are_wired_and_labelled(self) -> None:
        expected = {
            "memory-controls", "mem-params", "mem-scheme", "mem-gpus", "mem-gpu-memory",
            "mem-activation", "mem-runtime", "evaluation-controls", "eval-successes",
            "eval-trials", "eval-expected", "eval-margin", "mixture-controls", "mix-pick",
            "mix-wipe", "mix-fold", "mix-alpha", "mix-draws", "book-search",
        }
        self.assertTrue(expected.issubset(set(self.parser.ids)), expected - set(self.parser.ids))
        for control in self.parser.controls:
            self.assertIn(control, self.parser.labels, f"Missing label for {control}")
        app = (ROOT / "app.mjs").read_text(encoding="utf-8")
        containers = {"book-search", "memory-controls", "evaluation-controls", "mixture-controls"}
        for element_id in expected - containers:
            self.assertIn(element_id, app)

    def test_source_library_is_complete_and_mobile_grid_can_shrink(self) -> None:
        sources = (ROOT / "chapters" / "20-sources.md").read_text(encoding="utf-8")
        numbers = [int(number) for number in re.findall(r"^(\d+)\. \*\*\[", sources, flags=re.MULTILINE)]
        self.assertEqual(numbers, list(range(1, 52)))
        css = (ROOT / "styles.css").read_text(encoding="utf-8")
        self.assertIn("grid-template-columns: repeat(2, minmax(0, 1fr))", css)
        self.assertIn("grid-template-columns: minmax(0, 1fr)", css)
        self.assertIn(".lab-card { min-width: 0;", css)

    def test_repository_registration_and_fallback(self) -> None:
        manifest = json.loads((REPOSITORY / "experiments.json").read_text(encoding="utf-8"))
        entries = [entry for entry in manifest if entry["id"] == "vla-staff-roadmap"]
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["path"], "experiments/vla-staff-roadmap/")
        self.assertEqual(entries[0]["category"], "Education")
        self.assertEqual(entries[0]["date"], "2026-10-27")
        root_index = (REPOSITORY / "index.html").read_text(encoding="utf-8")
        self.assertIn('id: "vla-staff-roadmap"', root_index)
        root_readme = (REPOSITORY / "README.md").read_text(encoding="utf-8")
        self.assertIn("experiments/vla-staff-roadmap/", root_readme)


if __name__ == "__main__":
    unittest.main()
