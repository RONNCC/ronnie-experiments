/* Browser smoke test for Volume 2. Needs playwright-core and a Chromium binary:
   CHROMIUM_PATH=/path/to/chromium node tests/browser.cjs
   Serve the repo root on port 8000 first. Checks every chapter and all four demos
   at desktop and 375px widths for console errors, overflow, and broken links. */
const {chromium} = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const shots = process.env.SCREENSHOT_DIR || '/tmp/chip-design-textbook-qa';
fs.mkdirSync(shots, {recursive: true});
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    const errors = [], external = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:8000/')) external.push(r.url()); });
    await page.goto('http://127.0.0.1:8000/experiments/chip-design-textbook/');
    // Title, meta, and structure.
    assert.match(await page.title(), /Chip Design, Beyond Verification — From RTL to Tapeout/);
    assert.ok((await page.locator('meta[name="description"]').getAttribute('content')).length > 40);
    assert.equal(await page.locator('.chapter').count(), 17);
    assert.equal(await page.locator('.today').count(), 15);
    assert.equal(await page.locator('.glossary-entry').count(), 123);
    // Every chapter renders with a heading.
    for (const id of ['start-here','routes','chapter-3','chapter-4','chapter-5','chapter-6','chapter-7','chapter-8','chapter-9','chapter-10','chapter-11','chapter-12','chapter-13','chapter-14','chapter-15','glossary','sources']) {
      assert.ok(await page.locator(`#${id} h2`).isVisible(), id);
    }
    // Demo B: pipeline cost explorer, keyboard-reachable.
    assert.equal(await page.locator('#stage-buttons button').count(), 7);
    await page.locator('#stage-buttons button[data-stage="tapeout"]').click();
    assert.match(await page.locator('#stage-detail').textContent(), /100x/);
    await page.locator('#stage-buttons button[data-stage="spec"]').click();
    assert.match(await page.locator('#stage-detail').textContent(), /1x/);
    await page.locator('#stage-buttons button[data-stage="synthesis"]').focus();
    await page.keyboard.press('Enter');
    assert.match(await page.locator('#stage-detail').textContent(), /10x/);
    // Demo A: RTL playground — compact empty state, counter stepping, bug injection, traffic FSM.
    const emptyWave = await page.locator('#wave-svg').boundingBox();
    assert.ok(emptyWave.height < 80, `compact empty waveform (got ${emptyWave.height}px)`);
    assert.match(await page.locator('#wave-svg').textContent(), /No edges yet/);
    await page.locator('#rtl-step').click();
    assert.match(await page.locator('#rtl-result').textContent(), /Edge 1: rst_n=0, en=1, count=0/);
    await page.locator('#rtl-run').click();
    assert.match(await page.locator('#rtl-result').textContent(), /Edge 9/);
    assert.equal(await page.locator('#rtl-history tr').count(), 9);
    assert.equal(await page.locator('#wave-svg text').count() > 10, true, 'waveform drawn');
    await page.locator('#rtl-bug').check();
    await page.locator('#rtl-run').click();
    assert.match(await page.locator('#rtl-result').textContent(), /count=X.*Bug active/);
    assert.match(await page.locator('#rtl-code').textContent(), /BUG: the reset branch is gone/);
    await page.locator('#rtl-bug').uncheck();
    await page.locator('#rtl-enable').selectOption('gated');
    await page.locator('#rtl-run').click();
    assert.match(await page.locator('#rtl-result').textContent(), /count=3/, 'gated enable holds');
    await page.locator('#rtl-example').selectOption('traffic');
    assert.match(await page.locator('#rtl-bug-label').textContent(), /green→yellow/);
    await page.locator('#rtl-run').click();
    assert.match(await page.locator('#rtl-result').textContent(), /state=R|state=G|state=Y/);
    await page.locator('#rtl-bug').check();
    await page.locator('#rtl-run').click();
    assert.match(await page.locator('#rtl-result').textContent(), /stuck in green/);
    assert.match(await page.locator('#rtl-code').textContent(), /BUG: the green-to-yellow arc is missing/);
    await page.locator('#rtl-clear').click();
    assert.match(await page.locator('#rtl-result').textContent(), /No edge yet/);
    // Demo C: HLS side-by-side.
    assert.match(await page.locator('#hls-result').textContent(), /Sequential|one adder/);
    await page.locator('#hls-unroll').selectOption('8');
    assert.match(await page.locator('#hls-rtl-code').textContent(), /adder 8/);
    const metricsText = await page.locator('#hls-metrics').textContent();
    assert.match(metricsText, /Adders8/);
    await page.locator('#hls-pipeline').check();
    assert.match(await page.locator('#hls-metrics').textContent(), /Initiation interval1/);
    // Demo D: node economics.
    await page.locator('#node-preset').selectOption('2nm');
    assert.equal(await page.locator('#node-wafer').inputValue(), '30000');
    await page.locator('#node-die').evaluate((el) => { el.value = '50'; el.dispatchEvent(new Event('input', {bubbles: true})); });
    assert.match(await page.locator('#node-result').textContent(), /1319 gross dies\/wafer/);
    assert.match(await page.locator('#node-metrics').textContent(), /Cost per good die/);
    await page.locator('#node-volume').evaluate((el) => { el.value = '7'; el.dispatchEvent(new Event('input', {bubbles: true})); });
    assert.match(await page.locator('#node-metrics').textContent(), /NRE per chip/);
    // Reader furniture: search, routes, glossary filter, anchors.
    await page.locator('#search').fill('chiplet');
    assert.ok(await page.locator('.chapter:visible').count() > 0);
    await page.locator('#search').fill('no_such_concept_zz');
    assert.equal(await page.locator('.chapter:visible').count(), 0);
    await page.emulateMedia({media: 'print'});
    assert.equal(await page.locator('.chapter:visible').count(), 17, 'print ignores active filter');
    await page.emulateMedia({media: 'screen'});
    await page.locator('#clear-search').click();
    assert.equal(await page.locator('.chapter:visible').count(), 17);
    await page.locator('[data-route="product"]').click();
    assert.match(await page.locator('#route-status').textContent(), /Product-minded route/);
    await page.locator('#glossary-search').fill('yield');
    assert.ok(await page.locator('.glossary-entry:visible').count() > 0);
    await page.locator('#clear-glossary').click();
    assert.equal(await page.locator('.glossary-entry:visible').count(), 123);
    // Internal links resolve; no duplicate IDs; footer links to Volume 1 and the index.
    const ids = await page.locator('[id]').evaluateAll(els => els.map(el => el.id));
    assert.equal(ids.length, new Set(ids).size, 'No duplicate IDs');
    const broken = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(id => !document.getElementById(id)));
    assert.deepEqual(broken, []);
    assert.equal(await page.locator('footer a[href="../chip-verification-textbook/"]').count(), 1);
    assert.equal(await page.locator('footer a[href="../eda-tools-explorer/"]').count(), 1);
    assert.equal(await page.locator('footer a[href="../../"]').count(), 1);
    assert.ok((await page.locator('main').textContent()).includes('The Chip Design Software Landscape'));
    // Widths: desktop + the required 375px, plus 320px margin of safety.
    for (const width of [1440, 375, 320]) {
      await page.setViewportSize({width, height: 900});
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}`);
      for (const selector of ['#pipeline-lab', '#rtl-lab', '#hls-lab', '#node-lab', '#chapter-12', '#glossary']) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        assert.equal(await page.evaluate(() => document.body.scrollWidth > innerWidth), false, `${selector} body overflow at ${width}`);
      }
      // The empty waveform stays a compact one-line strip at every width (review fix).
      const waveBox = await page.locator('#wave-svg').boundingBox();
      assert.ok(waveBox.height < 80, `compact empty waveform at ${width} (got ${waveBox.height}px)`);
      const tooSmall = await page.locator('button,select,input[type=number],input[type=search],input[type=range]').evaluateAll(els => els.filter(el => el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().height < 44).map(el => el.id));
      assert.deepEqual(tooSmall, [], `44px controls at ${width}`);
      await page.locator('.reader-bar a[href="#start-here"]').click();
      await page.waitForTimeout(250);
      const bar = await page.locator('.reader-bar').boundingBox();
      assert.ok(bar.y >= 0 && bar.y + bar.height < 220, `Sticky bar at ${width}`);
      if (width < 720) {
        await page.screenshot({path: path.join(shots, `mobile-${width}.png`)});
        await page.locator('#rtl-lab').screenshot({path: path.join(shots, `rtl-lab-${width}.png`)});
      }
    }
    await page.setViewportSize({width: 1440, height: 1000});
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({path: path.join(shots, 'desktop.png')});
    await page.locator('#node-lab').screenshot({path: path.join(shots, 'node-lab-desktop.png')});
    assert.deepEqual(errors, [], 'no console or page errors');
    assert.deepEqual(external, [], 'no external requests');
    console.log('PASS: 17 chapters + 15 today boxes + 123 glossary entries, demos A-D exercised, search/routes/glossary/print, links/IDs, 1440/375/320px overflow + 44px targets, screenshots, zero console errors, zero external requests.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
