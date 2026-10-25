#!/usr/bin/env python3
"""Build the single-file textbook and static reader from canonical chapters."""
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
MAIN_HEADING = re.compile(r"^## (\d+)\. (.+)$")


def chapters_and_contents(parts: list[str]) -> tuple[str, list[tuple[str, list[tuple[int, str]]]]]:
    """Anchor exactly the first numbered chapter heading in each source file."""
    groups: list[tuple[str, list[tuple[int, str]]]] = [("Orientation", [])]
    current = groups[0][1]
    seen: set[int] = set()
    anchored_parts: list[str] = []
    for part in parts:
        lines = part.splitlines()
        chapter_seen = False
        output: list[str] = []
        for line in lines:
            if line.startswith("# Part "):
                current = []
                groups.append((line[2:], current))
            match = MAIN_HEADING.fullmatch(line)
            if match and not chapter_seen:
                number, title = int(match.group(1)), match.group(2)
                if number in seen or number != len(seen):
                    raise ValueError(f"Expected next unique chapter {len(seen)}, found {number}")
                seen.add(number)
                chapter_seen = True
                current.append((number, title))
                output.extend([f'<div id="chapter-{number}"></div>', "", line])
            else:
                output.append(line)
        if not chapter_seen:
            raise ValueError(f"No numbered chapter heading in {SOURCES[len(anchored_parts)].name}")
        anchored_parts.append("\n".join(output))
    if seen != set(range(len(seen))) or not groups:
        raise ValueError("Chapters must be numbered consecutively from zero")
    if not groups[0][1] or groups[0][1][0][0] != 0:
        raise ValueError("Chapter 0 must follow the book title before the first Part")
    return "\n\n".join(anchored_parts) + "\n", groups


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
            f"<span>{html.escape(title)}</span></a>" for n, title in chapters
        )
        entries.append(f'<div class="toc-group"><p>{html.escape(group)}</p>{links}</div>')
    return "\n".join(entries)


def render() -> dict[Path, str]:
    if not SOURCES:
        raise ValueError("No chapter sources found")
    parts = [p.read_text(encoding="utf-8").rstrip() for p in SOURCES]
    source = "\n\n".join(parts) + "\n"
    anchored, groups = chapters_and_contents(parts)
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
    page = (template.replace("{{BOOK_CONTENT}}", book_html)
            .replace("{{CHAPTER_NAV}}", make_nav(groups))
            .replace("{{CHAPTER_COUNT}}", str(sum(len(chapters) for _, chapters in groups)))
            .replace("{{WORD_COUNT}}", f"{len(source.split()):,}"))
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
