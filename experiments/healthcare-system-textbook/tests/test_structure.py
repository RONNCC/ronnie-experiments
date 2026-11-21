from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")


class Structure(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.chapters = []
        self.current = None
        self.stack = []
        self.svg_depth = 0
        self.svg_titles = 0
        self.svg_descs = 0
        self.captions = 0

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
        self.assertGreaterEqual(self.doc.svg_titles, 12)  # opening map + 11 chapters
        self.assertGreaterEqual(self.doc.svg_descs, 12)

    def test_local_deep_links_resolve_and_ids_are_unique(self):
        self.assertEqual(len(self.doc.ids), len(set(self.doc.ids)))
        missing = sorted(set(self.doc.links) - set(self.doc.ids))
        self.assertEqual(missing, [])
        for target in ["c01-big-picture", "c04-insurance-basics", "c07-billing-and-claims", "c11-broken-arm", "glossary", "sources", "future-topics"]:
            self.assertIn(target, self.doc.ids)

    def test_simulators_and_native_controls_exist(self):
        for control in ["sim-premium", "sim-deductible", "sim-coinsurance", "sim-oopmax", "sim-usage",
                        "annual-premium", "deductible-paid", "coinsurance-paid", "insurer-paid", "total-oop", "total-year",
                        "claim-stage", "stage-note", "claim-stage-label"]:
            self.assertIn(f'id="{control}"', HTML)
        self.assertIn('aria-live="polite"', HTML)
        self.assertIn("<details class=\"question\"", HTML)
        self.assertGreaterEqual(HTML.count('class="eob-toggle"'), 5)
        self.assertGreaterEqual(HTML.count('class="eob-detail"'), 5)

    def test_mobile_diagrams_scroll_inside_containers_and_print_styles_exist(self):
        self.assertIn(".chapter-svg-scroll{max-width:100%;overflow-x:auto", CSS)
        self.assertIn(".svg-scroll{width:100%;overflow-x:auto", CSS)
        self.assertIn("@media(max-width:700px)", CSS)
        self.assertIn("@media(max-width:390px)", CSS)
        self.assertIn("@media print", CSS)
        self.assertNotIn("width:100vw", CSS)

    def test_examples_are_labeled_illustrative(self):
        self.assertIn("illustrative", HTML.lower())
        self.assertIn("illustrative figures", HTML.lower())
        self.assertIn("invented for teaching", HTML.lower())

    def test_opening_map_distinguishes_care_from_money_and_preserves_directional_labels(self):
        self.assertIn("aggregate teaching map that combines roles and simplifies routes", HTML)
        self.assertIn("This is a simplified aggregate teaching map", HTML)
        for label in ["care delivered", "cost sharing", "premiums", "program payments", "reimbursements &amp; fees", "medicines &amp; manufacturer rebates", "rules"]:
            self.assertIn(label, HTML)
        # care flows toward the patient; money flows toward providers and payers
        self.assertIn('d="M400 150 H252"', HTML)  # care delivered, provider to patient
        self.assertIn('d="M252 200 H400"', HTML)  # cost sharing, patient to provider
        self.assertIn('d="M248 348 H400"', HTML)  # employer premiums to insurer
        self.assertIn('d="M446 300 V230"', HTML)  # claim payments to provider
        self.assertIn('d="M1020 492 H1086 V172 H1024"', HTML)  # drug channel, manufacturer margin route

    def test_chapter_11_episode_numbers_are_internally_consistent(self):
        chapter = HTML.split('id="c11-broken-arm"', 1)[1].split('<section class="future"', 1)[0]
        for figure in ["$9,500.00", "$4,970.00", "$4,530.00", "$3,176.00", "$1,794.00",
                       "$1,000.00", "$2,294.00", "$3,706.00", "$144.00", "$140.00",
                       "$900.00", "$480.00", "$130.00", "$176.00", "$1,920.00", "$560.00", "$520.00"]:
            self.assertIn(figure, chapter)
        self.assertIn("S52.501A", HTML)
        self.assertIn("73100", HTML)

    def test_beginner_route_and_glossary_cover_required_terms(self):
        self.assertIn("Start the 20 minute route", HTML)
        for term in ["term-premium", "term-deductible", "term-coinsurance", "term-copay",
                     "term-oop-max", "term-eob", "term-prior-auth", "term-cpt", "term-icd10",
                     "term-pbm", "term-no-surprises-act", "term-chargemaster", "term-allowed-amount",
                     "term-balance-billing", "term-formulary", "term-hmo", "term-ppo", "term-epo"]:
            self.assertIn(f'id="{term}"', HTML)
        self.assertIn("Check your understanding", HTML)

    def test_primary_source_appendix_and_developer_note_exist(self):
        for source in ["source-cms-nhe", "source-healthcaregov-glossary", "source-healthcaregov-choose",
                       "source-medicare", "source-medicaid", "source-cms-nsa", "source-nsa-text",
                       "source-dol-ebsa", "source-cdc-vaccines", "source-va", "source-cdc"]:
            self.assertIn(f'id="{source}"', HTML)
        for verified_url in [
            "https://www.cms.gov/research-statistics-data-and-systems/statistics-trends-and-reports/nationalhealthexpenddata",
            "https://www.healthcare.gov/glossary/",
            "https://www.healthcare.gov/choose-a-plan/",
            "https://www.medicare.gov/basics/get-started-with-medicare",
            "https://www.medicaid.gov/",
            "https://www.cms.gov/medical-bill-rights",
            "https://www.govinfo.gov/content/pkg/PLAW-116publ260/html/PLAW-116publ260.htm",
            "https://www.dol.gov/agencies/ebsa",
            "https://www.cdc.gov/vaccines/index.html",
            "https://www.va.gov/health-care/",
            "https://www.cdc.gov/",
        ]:
            self.assertIn(verified_url, HTML)
        self.assertIn("Verified November 21, 2026", HTML)
        self.assertTrue((ROOT / "README.md").exists())

    def test_developer_instructions_live_in_readme(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        for phrase in ["Add a chapter", "logic.mjs", "tests/logic.test.mjs", "tests/test_structure.py"]:
            self.assertIn(phrase, readme)


if __name__ == "__main__":
    unittest.main()
