// Run with Playwright installed: node tests/share-link.cjs
// Set LIVE to test the deployed page instead of the adjacent local HTML.
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME || '/usr/bin/google-chrome',
    headless: true, args: ['--no-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.goto(process.env.LIVE || pathToFileURL(path.join(__dirname, '../index.html')).href);
    await page.evaluate(() => { answers = Array(24).fill(3); result(); });
    await page.locator('#share').click();
    const oldLink = await page.locator('#shareLink').inputValue();
    assert.ok(oldLink.includes('#v2='));
    await page.locator('#review').click();
    await page.evaluate(() => { answers = Array(24).fill(5); result(); });
    assert.equal(await page.locator('#shareLink').inputValue(), '');
    assert.equal(await page.locator('#shareLink').isHidden(), true);
    assert.equal(await page.locator('#shareStatus').textContent(), '');
    await page.locator('#share').click();
    const newLink = await page.locator('#shareLink').inputValue();
    assert.notEqual(newLink, oldLink);
    assert.ok(newLink.includes('#v2=20.4,20.4,20.4,20.4,20.4,20.4'));
    assert.equal(await page.locator('#shareLink').isVisible(), true);
    await page.screenshot({path: process.env.SCREENSHOT || '/tmp/share-link-regression.png', fullPage: true});
    console.log('PASS: reviewed results clear stale share link/status and regenerate current scores.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
