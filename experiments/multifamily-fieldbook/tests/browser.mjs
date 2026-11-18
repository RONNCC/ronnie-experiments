// Optional real-browser smoke test. See README for the two environment overrides.
import assert from "node:assert/strict";
import { lessons, decisions } from "../content/book.mjs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const base =
  process.env.FIELD_URL ||
  "http://127.0.0.1:8000/experiments/multifamily-fieldbook/";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_PATH || undefined,
  args: ["--disable-dev-shm-usage", "--disable-gpu"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1360, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().startsWith(base) && r.status() >= 400)
      errors.push(`${r.status()} ${r.url()}`);
  });
  async function view(hash) {
    await page.goto(base + "#" + hash);
    const [section, id] = hash.split("/");
    const heading =
      section === "lesson"
        ? lessons.find((l) => l.id === id)?.title
        : section === "decision"
          ? decisions.find((d) => d.id === id)?.title
          : {
              home: "The multifamily fieldbook.",
              review: "Three-term recall.",
              case: "River North. Two packages.",
              route: "The one-hour interview route.",
              decisions: "Defend the decision.",
              sources: "Know what to verify.",
              glossary: "The glossary.",
            }[section];
    await page
      .getByRole("heading", {
        level: 1,
        name: heading ?? "Page not found.",
        exact: true,
      })
      .waitFor();
  }
  await view("home");
  assert.equal(await page.locator(".chapter-card").count(), 6);
  assert.equal(
    await page
      .locator(".cover-plate img")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    true,
  );
  await page.getByRole("link", { name: "1-hour interview route" }).click();
  await page.locator(".route-list").waitFor();
  assert.equal(await page.locator(".route-list li").count(), 6);
  await page
    .getByText("If the interview starts now:", { exact: false })
    .first()
    .click();
  assert.equal(await page.locator(".route-card[open]").count(), 1);
  await view("review");
  assert.equal(await page.locator(".review-card").count(), 3);
  await page.getByRole("link", { name: "Continue to chapter A" }).click();
  await page.locator('[data-choice="1"]').click();
  assert.match(await page.locator("#quiz-feedback").innerText(), /Not quite/);
  await page.locator('[data-choice="0"]').click();
  assert.match(await page.locator("#quiz-feedback").innerText(), /^Correct/);
  await page.locator("#mark").click();
  await page.reload();
  assert.equal(
    await page.locator("#mark").getAttribute("aria-pressed"),
    "true",
  );
  await view("review");
  assert.match(
    await page.locator(".review-card").first().innerText(),
    /QUEUED FOR REVIEW/,
  );
  await page.locator(".review-card summary").first().click();
  await page.locator('[data-recall="got"]').first().click();
  assert.match(
    await page.locator(".recall-status").first().innerText(),
    /Recalled/,
  );
  await view("decisions");
  assert.equal(await page.locator(".decision-card").count(), 12);
  await page.locator(".decision-card").first().click();
  await page.locator("[data-critique]").click();
  assert.match(
    await page.locator("#critique").innerText(),
    /your own answer first/,
  );
  const own =
    "I chose per-number sources over one folder. A <plan> revision changes the scope.";
  await page.locator("#draft").fill(own);
  await page.locator('[data-rubric="0"]').check();
  await page.locator("[data-critique]").click();
  assert.match(await page.locator("#critique").innerText(), /1\/3/);
  await page.reload();
  assert.equal(await page.locator("#draft").inputValue(), own);
  assert.ok(await page.locator('[data-rubric="0"]').isChecked());
  await view("glossary");
  await page.locator("#term-scope").selectOption("studied");
  assert.equal(await page.locator(".gloss-list>div").count(), 5);
  await page.locator("#term-search").fill("fmr");
  assert.equal(await page.locator(".gloss-list>div").count(), 1);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw Error("unavailable");
        },
      },
    }),
  );
  await page.locator("#copy-terms").click();
  assert.match(await page.locator("#manual-copy").inputValue(), /^FMR —/);
  await page.locator("#term-search").fill("not-a-fieldbook-term");
  assert.ok(await page.locator("#copy-terms").isDisabled());
  await view("case");
  assert.match(await page.locator("tbody").innerText(), /5\.50%/);
  assert.match(await page.locator("#coverage-result").innerText(), /Missing/);
  await page.locator("#payment").fill("2");
  assert.equal(await page.locator("#coverage-result").innerText(), "1.25×");
  await page.locator("#debt").fill("30");
  await page.locator("#equity").fill("19");
  assert.equal(
    await page.locator("#gap-result").innerText(),
    "$1,000,000 shortfall",
  );
  await page.locator("#package").selectOption("summary");
  assert.equal(await page.locator("#coverage-result").innerText(), "1.30×");
  assert.equal(
    await page.locator("#gap-result").innerText(),
    "$1,700,000 surplus",
  );
  await page.locator("#debt").fill("");
  assert.match(await page.locator("#gap-result").innerText(), /Missing/);
  await page.locator("#payment").fill("0");
  assert.match(await page.locator("#coverage-result").innerText(), /positive/);
  const routes = [
    "home",
    "review",
    "case",
    "glossary",
    "route",
    "decisions",
    "sources",
    ...lessons.map((l) => "lesson/" + l.id),
    ...decisions.map((d) => "decision/" + d.id),
  ];
  await page.setViewportSize({ width: 390, height: 844 });
  for (const r of routes) {
    await view(r);
    const name = await page.locator("main h1").innerText();
    assert.doesNotMatch(name, /Page not found/);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${r}: horizontal page overflow`,
    );
    if (r.startsWith("lesson/"))
      assert.equal(await page.locator(".choice").count(), 3);
    if (r.startsWith("decision/"))
      assert.equal(await page.locator(".alt-list li").count(), 3);
  }
  await view("sources");
  await page.getByText("Clear local study data", { exact: true }).click();
  await page.locator("#clear-study").click();
  await view("lesson/hud");
  assert.equal(
    await page.locator("#mark").getAttribute("aria-pressed"),
    "false",
  );
  await view("unmapped");
  assert.match(await page.locator("h1").innerText(), /Page not found/);
  const download = await page.request.get(base + "TEXTBOOK.md");
  assert.equal(download.status(), 200);
  assert.match(await download.text(), /Decision 12\./);
  const indexed = await page.evaluate(async () => {
    const pf = await import("../../pagefind/pagefind.js");
    const { results } = await pf.search("QOZB");
    return Promise.all(results.map(async (r) => (await r.data()).meta.id));
  });
  assert.ok(indexed.includes("multifamily-fieldbook"));
  assert.deepEqual(errors, []);
  console.log(
    `Browser OK: ${routes.length} mobile routes; desktop navigation; grading, review, saved drafts, glossary, case math, reset, download and Pagefind.`,
  );
} finally {
  await browser.close();
}
