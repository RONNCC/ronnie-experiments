const { chromium: pw } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await pw.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await desktop.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const origin = process.env.BASE_URL || "http://127.0.0.1:8000";
  const base = origin + "/experiments/three-kingdoms-textbook/";
  await page.goto(base);
  assert.equal(await page.locator(".chapter").count(), 23);
  assert.equal(await page.locator(".profile").count(), 16);

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  console.log(
    "Desktop accessibility violations:",
    JSON.stringify(
      axe.violations.map((x) => ({
        id: x.id,
        nodes: x.nodes.map((n) => n.target),
      })),
    ),
  );
  assert.equal(axe.violations.length, 0);
  await page.locator('#chapter-nav a[href="#borrowed-knife"]').click();
  await page.waitForTimeout(2500);
  assert.equal(
    await page.locator("#chapter-nav [aria-current]").getAttribute("href"),
    "#borrowed-knife",
  );
  assert.ok((await page.locator("#borrowed-knife").boundingBox()).y >= 0);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  assert.equal(await page.locator("#chapter-nav").isVisible(), false);
  await page.locator("#menu-toggle").click();
  assert.equal(await page.locator("#chapter-nav").isVisible(), true);
  await page.locator('#chapter-nav a[href="#cheat-sheet"]').click();
  await page.waitForTimeout(2500);
  assert.equal(await page.locator("#chapter-nav").isVisible(), false);
  assert.ok((await page.locator("#cheat-sheet").boundingBox()).y >= 50);
  for (const hash of ["#orientation", "#maps", "#glossary", "#reading"]) {
    await page.goto(base + hash);
    await page.waitForTimeout(200);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      hash + " overflows",
    );
  }
  await page.goto(base);
  const axeMobile = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  console.log(
    "Mobile accessibility violations:",
    JSON.stringify(
      axeMobile.violations.map((x) => ({
        id: x.id,
        nodes: x.nodes.map((n) => n.target),
      })),
    ),
  );
  assert.equal(axeMobile.violations.length, 0);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const nojs = await context.newPage();
  await nojs.goto(base);
  assert.equal(await nojs.locator("#chapter-nav").isVisible(), true);
  assert.equal(await nojs.locator(".chapter").count(), 23);
  await page.goto(origin + "/");
  assert.equal(
    await page
      .locator('a[href="experiments/three-kingdoms-textbook/"]')
      .count(),
    1,
  );
  // Exercise the real regenerated Pagefind bundle, including body-only terminology.
  const results = await page.evaluate(async () => {
    const p = await import("/pagefind/pagefind.js");
    await p.init();
    const r = await p.search("Huarong");
    return Promise.all(r.results.map((x) => x.data()));
  });
  assert.ok(results.some((r) => r.url.includes("three-kingdoms-textbook")));
  console.log(
    "PASS: desktop/mobile navigation, 23 chapters, 16 profiles, no overflow, no-JS fallback, homepage listing, full-text search.",
  );
  assert.deepEqual(errors, []);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
