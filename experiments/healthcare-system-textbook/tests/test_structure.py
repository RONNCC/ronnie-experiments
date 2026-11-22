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

    def test_updated_research_sources_and_terms_exist(self):
        for term in ["term-site-neutral", "term-telehealth", "term-idr"]:
            self.assertIn(f'id="{term}"', HTML)
        sources_section = HTML.split('id="sources"', 1)[1]
        body_section = HTML.split('id="sources"', 1)[0]
        added_sources = [
            ("source-cms-nhe-facts", "https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/nhe-fact-sheet"),
            ("source-ldi-affordability", "https://ldi.upenn.edu/our-work/research-updates/finding-rare-agreement-on-fixing-the-health-care-affordability-crisis/"),
            ("source-pennmed-telehealth", "https://www.pennmedicine.org/news/study-finds-telemedicine-visits-cost-far-less-than-office-visits"),
            ("source-ldi-nurse-staffing", "https://ldi.upenn.edu/our-work/research-updates/pennsylvania-nurses-are-overloaded-putting-patients-at-risk/"),
            ("source-kff-ehbs-2026", "https://www.kff.org/health-costs/2026-employer-health-benefits-survey/"),
            ("source-ldi-hdhp", "https://ldi.upenn.edu/our-work/research-updates/high-deductible-health-plans-are-not-the-answer/"),
            ("source-census-coverage-2025", "https://www.census.gov/library/publications/2026/demo/p60-291.html"),
            ("source-kff-uninsured", "https://www.kff.org/uninsured/key-facts-about-the-uninsured-population/"),
            ("source-kff-ma-pa", "https://www.kff.org/medicare/medicare-advantage-insurers-made-nearly-53-million-prior-authorization-determinations-in-2024/"),
            ("source-kff-partd", "https://www.kff.org/medicare/a-current-snapshot-of-the-medicare-part-d-prescription-drug-benefit/"),
            ("source-ldi-pa-bottleneck", "https://ldi.upenn.edu/our-work/research-updates/the-billing-bottleneck-how-medicare-advantage-insurers-use-prior-authorization/"),
            ("source-bmj-pa", "https://www.bmj.com/content/384/bmj-2023-077797"),
            ("source-ldi-pa-drugs", "https://ldi.upenn.edu/our-work/research-updates/understanding-cmss-proposed-rule-regarding-prior-authorization-for-drugs/"),
            ("source-ldi-transparency", "https://ldi.upenn.edu/our-work/research-updates/from-secret-health-care-prices-to-too-much-information/"),
            ("source-kff-marketplace-denials", "https://www.kff.org/patient-consumer-protections/claims-denials-and-appeals-in-aca-marketplace-plans-in-2024/"),
            ("source-bmj-nsa", "https://www.bmj.com/content/390/bmj-2025-084803"),
            ("source-ldi-nsa-idr", "https://ldi.upenn.edu/our-work/research-updates/how-the-no-surprises-act-solved-one-problem-and-created-another/"),
            ("source-ha-nsa-rule", "https://www.healthaffairs.org/content/forefront/long-awaited-no-surprises-act-rule-finalized-1786106891322"),
            ("source-wharton-pbm", "https://knowledge.wharton.upenn.edu/article/how-employers-are-reining-in-prescription-drug-costs/"),
            ("source-ldi-pbm-integration", "https://ldi.upenn.edu/our-work/research-updates/when-insurers-acquire-pharmacy-benefit-managers-medicare-members-could-pay-more/"),
            ("source-ldi-measles", "https://ldi.upenn.edu/our-work/research-updates/u-s-loss-of-measles-elimination-status-raises-risk-of-other-diseases/"),
            ("source-ldi-child-mortality", "https://ldi.upenn.edu/our-work/research-updates/45-excess-child-deaths-a-day-in-the-u-s/"),
        ]
        for source_id, url in added_sources:
            with self.subTest(source=source_id):
                self.assertIn(f'id="{source_id}"', sources_section)
                self.assertIn(url, sources_section)
                self.assertIn(f'href="#{source_id}"', body_section)

    def test_developer_instructions_live_in_readme(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        for phrase in ["Add a chapter", "logic.mjs", "tests/logic.test.mjs", "tests/test_structure.py"]:
            self.assertIn(phrase, readme)

    def test_intentionality_review_consistency_pass(self):
        import re

        self.assertEqual(HTML.count("VERSION 4 · INTENTIONALITY REVIEW"), 2)
        self.assertNotIn("VERSION 1", HTML)

        body_before_sources, sources_section = HTML.split('id="sources"', 1)
        defined_sources = set(re.findall(r'id="(source-[^"]+)"', sources_section))
        cited_sources = set(re.findall(r'href="#(source-[^"]+)"', body_before_sources))
        self.assertEqual(sorted(defined_sources - cited_sources), [])
        self.assertEqual(sorted(cited_sources - defined_sources), [])

        body_before_glossary, glossary_rest = HTML.split('id="glossary"', 1)
        glossary_section = glossary_rest.split('id="sources"', 1)[0]
        defined_terms = set(re.findall(r'id="(term-[^"]+)"', glossary_section))
        linked_terms = set(re.findall(r'href="#(term-[^"]+)"', body_before_glossary))
        self.assertEqual(sorted(defined_terms - linked_terms), [])

        self.assertIn("Illustrative EOB — broken-arm episode", HTML)
        self.assertIn("breaks her arm, specifically her wrist", HTML)
        self.assertIn("Maya's broken arm looks like one bill", HTML)
        self.assertNotIn("wrist fracture episode", HTML)
        self.assertNotIn("Maya's wrist fracture", HTML)

    def test_billing_lifecycle_consolidation_npi_debt_and_drug_pricing_expansion(self):
        for term in [
            "term-hopd", "term-facility-fee", "term-vertical-integration", "term-private-equity",
            "term-npi", "term-taxonomy-code", "term-medical-debt",
            "term-charge-capture", "term-cms1500", "term-ub04", "term-drg", "term-era", "term-patient-statement",
            "term-gross-to-net", "term-rebate-wall", "term-ira-negotiation",
        ]:
            self.assertIn(f'id="{term}"', HTML)

        sources_section = HTML.split('id="sources"', 1)[1]
        body_section = HTML.split('id="sources"', 1)[0]
        expanded_sources = [
            ("source-kff-consolidation", "https://www.kff.org/health-costs/one-or-two-health-systems-controlled-the-entire-market-for-inpatient-hospital-care-in-nearly-half-of-metropolitan-areas/"),
            ("source-cms-pos", "https://www.cms.gov/medicare/coding-billing/place-of-service-codes/code-sets"),
            ("source-cms-mpfs", "https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c23.pdf"),
            ("source-medpac-2026", "https://www.medpac.gov/wp-content/uploads/2026/03/Mar26_MedPAC_Report_To_Congress_SEC.pdf"),
            ("source-kff-site-neutral", "https://www.kff.org/quick-insights/the-trump-administration-moves-forward-with-medicare-site-neutral-payment-reform/"),
            ("source-ha-consolidation", "https://www.healthaffairs.org/doi/10.1377/hlthaff.2025.00493"),
            ("source-jhf-pcp-consolidation", "https://jamanetwork.com/journals/jama-health-forum/fullarticle/2829224"),
            ("source-jhf-pe-spending", "https://jamanetwork.com/journals/jama-health-forum/fullarticle/2795946"),
            ("source-cms-npi", "https://www.cms.gov/files/document/icn902603npibookletpdf"),
            ("source-nucc-taxonomy", "https://taxonomy.nucc.org/"),
            ("source-kff-medical-debt", "https://www.kff.org/health-costs/the-burden-of-medical-debt-in-the-united-states/"),
            ("source-kff-charity-care", "https://www.kff.org/health-costs/hospital-charity-care-how-it-works-and-why-it-matters/"),
            ("source-cfpb-medical-debt", "https://www.consumerfinance.gov/archive/newsroom/cfpb-finds-15-million-americans-have-medical-bills-on-their-credit-reports/"),
            ("source-cms-claims-ch1", "https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c01.pdf"),
            ("source-cms-1500", "https://www.cms.gov/Medicare/Billing/ElectronicBillingEDITrans/1500"),
            ("source-cms-1450", "https://www.cms.gov/Medicare/Billing/ElectronicBillingEDITrans/1450"),
            ("source-cms-payment-systems", "https://www.cms.gov/Outreach-and-Education/Medicare-Learning-Network-MLN/MLNProducts/html/medicare-payment-systems.html"),
            ("source-cms-era", "https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c22.pdf"),
            ("source-oig-transparency", "https://oig.hhs.gov/reports/all/2024/not-all-selected-hospitals-complied-with-the-hospital-price-transparency-rule/"),
            ("source-gao-transparency", "https://www.gao.gov/products/gao-25-106995"),
            ("source-cms-transparency-2026", "https://www.cms.gov/files/document/mln7215754-hospital-price-transparency.pdf"),
            ("source-kff-pa-poll", "https://www.kff.org/public-opinion/kff-health-tracking-poll-prior-authorizations-rank-as-publics-biggest-burden-when-getting-health-care/"),
            ("source-kff-pbm", "https://www.kff.org/other-health/what-to-know-about-pharmacy-benefit-managers-pbms-and-federal-efforts-at-regulation/"),
            ("source-ftc-pbm", "https://www.ftc.gov/reports/pharmacy-benefit-managers-report"),
            ("source-jama-insulin-bubble", "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2806020"),
            ("source-jama-oop-list", "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2779442"),
            ("source-ftc-pbm-2025", "https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-releases-second-interim-staff-report-prescription-drug-middlemen"),
            ("source-dol-pbm-rule", "https://beta.dol.gov/research-data/fact-sheets/pharmacy-benefit-manager-fee-disclosure-final-rule"),
            ("source-kff-ira-neg", "https://www.kff.org/medicare/key-facts-about-medicare-drug-price-negotiation/"),
            ("source-cbo-partd-2026", "https://www.cbo.gov/system/files/2026-07/62549-Medicare-Part-D.pdf"),
        ]
        for source_id, url in expanded_sources:
            with self.subTest(source=source_id):
                self.assertIn(f'id="{source_id}"', sources_section)
                self.assertIn(url, sources_section)
                self.assertIn(f'href="#{source_id}"', body_section)

        future_section = HTML.split('id="future-topics"', 1)[1].split('id="glossary"', 1)[0]
        self.assertNotIn("CMS-1450 vs CMS-1500", future_section)
        self.assertNotIn("Hospital pricing transparency", future_section)
        self.assertNotIn("Medicare Advantage prior-auth reform", future_section)


if __name__ == "__main__":
    unittest.main()
