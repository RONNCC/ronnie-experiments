#!/usr/bin/env python3
"""Build the single-file textbook and static reader from the canonical chapters.

Install the pinned build dependency in requirements-build.txt first. Runtime is
plain HTML/CSS/JS; the generated files are committed for GitHub Pages.
"""
from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path

try:
    import markdown
except ImportError as exc:
    raise SystemExit("Install build dependencies: python -m pip install -r requirements-build.txt") from exc

ROOT = Path(__file__).resolve().parent
SOURCES = sorted((ROOT / "chapters").glob("[0-9][0-9]-*.md"))
CHAPTER = re.compile(r"^## (\d+)\. (.+)$", re.MULTILINE)


def chapters_and_contents(source: str) -> tuple[str, list[tuple[str, list[tuple[int, str]]]]]:
    """Return stable HTML anchor IDs and a grouped table of contents."""
    groups: list[tuple[str, list[tuple[int, str]]]] = [("Orientation", [])]
    seen: set[int] = set()
    current = groups[0][1]
    for line in source.splitlines():
        if line.startswith("# "):
            title = line[2:]
            if title.startswith("Vision Models & ML Architecture"):
                continue
            current = []
            groups.append((title, current))
        elif match := re.fullmatch(r"## (\d+)\. (.+)", line):
            number, title = int(match.group(1)), match.group(2)
            if number in seen or current is None:
                raise ValueError(f"Duplicate chapter or missing part: {number}")
            seen.add(number)
            current.append((number, title))
    if seen != set(range(len(seen))) or not groups or not SOURCES:
        raise ValueError("Chapters must be numbered consecutively from zero")
    # Chapter zero is in the opening (book-title) group, before the first Part.
    if not groups[0][1] or groups[0][1][0][0] != 0:
        raise ValueError("Chapter 0 must follow the book title before the first Part")

    anchored = CHAPTER.sub(lambda m: f'<div id="chapter-{m.group(1)}"></div>\n\n## {m.group(1)}. {m.group(2)}', source)
    return anchored, groups


def make_toc(groups: list[tuple[str, list[tuple[int, str]]]]) -> str:
    lines = ["## Contents", ""]
    for group, chapters in groups:
        lines.append(f"**{group}**")
        lines.extend(f"- [{n}. {title}](#chapter-{n})" for n, title in chapters)
        lines.append("")
    return "\n".join(lines)


def make_nav(groups: list[tuple[str, list[tuple[int, str]]]]) -> str:
    entries = []
    for group, chapters in groups:
        links = "\n".join(
            f'<a class="toc-link" href="#chapter-{n}"><span class="toc-num">{n:02d}</span>'
            f"<span>{html.escape(title)}</span></a>"
            for n, title in chapters
        )
        entries.append(f'<div class="toc-group"><p>{html.escape(group)}</p>{links}</div>')
    return "\n".join(entries)


def render() -> dict[Path, str]:
    source = "\n\n".join(p.read_text(encoding="utf-8").rstrip() for p in SOURCES) + "\n"
    anchored, groups = chapters_and_contents(source)
    # GitHub renders explicit anchor IDs, so the Markdown and site share stable links.
    title_line, remainder = anchored.split("\n", 1)
    edition_line, body = remainder.lstrip().split("\n", 1)
    if not edition_line.startswith("*Research edition"):
        raise ValueError("Opening chapter must have a research-edition subtitle")
    textbook = f"{title_line}\n\n{edition_line}\n\n{make_toc(groups)}\n{body.lstrip()}"
    from markdown.extensions.toc import slugify

    converter = markdown.Markdown(
        extensions=["fenced_code", "tables", "toc", "sane_lists"],
        extension_configs={"toc": {"slugify": lambda value, separator: "h-" + slugify(value, separator)}},
        output_format="html5",
    )
    book_html = converter.convert(anchored)
    template = (ROOT / "template.html").read_text(encoding="utf-8")
    page = (
        template.replace("{{BOOK_CONTENT}}", book_html)
        .replace("{{CHAPTER_NAV}}", make_nav(groups))
        .replace("{{CHAPTER_COUNT}}", str(sum(len(chapters) for _, chapters in groups)))
        .replace("{{WORD_COUNT}}", f"{len(source.split()):,}")
    )
    if "{{" in page or "}}" in page:
        raise ValueError("Unresolved template marker")
    return {ROOT / "TEXTBOOK.md": textbook, ROOT / "index.html": page.rstrip() + "\n"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if generated files are out of date")
    args = parser.parse_args()
    expected = render()
    dirty = [path for path, text in expected.items() if not path.exists() or path.read_text(encoding="utf-8") != text]
    if args.check:
        if dirty:
            print("Out of date: " + ", ".join(str(p.relative_to(ROOT)) for p in dirty), file=sys.stderr)
            return 1
        print("Generated textbook and reader are up to date")
    else:
        for path, text in expected.items():
            path.write_text(text, encoding="utf-8")
            print(f"Wrote {path.relative_to(ROOT)} ({len(text):,} characters)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
