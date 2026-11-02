/* Optional browser smoke test: npm install playwright; node tests/browser.cjs.
   Serve repo root on port 8000 first. CHROMIUM_PATH may point to a system binary. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || undefined, args:['--no-sandbox']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[],external=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8000/'))external.push(r.url());});
    await page.goto('http://127.0.0.1:8000/experiments/chip-verification-textbook/');
    assert.equal(await page.locator('.chapter').count(),20);
    assert.equal(await page.locator('.drill').count(),25);
    await page.locator('[data-route="quick"]').click();
    assert.match(await page.locator('#route-status').textContent(),/45 minutes/);
    await page.locator('#search').fill('no_such_concept_zz');
    assert.equal(await page.locator('.chapter:visible').count(),0);
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.chapter:visible').count(),20);
    await page.emulateMedia({media:'screen'});
    await page.locator('#search').fill('simultaneous');
    assert.ok(await page.locator('.chapter:visible').count()>0);
    await page.locator('#search').fill('');
    await page.locator('#fill').click();
    assert.match(await page.locator('#pointers').textContent(),/occupancy 4\/4/);
    await page.locator('#step').click();
    assert.match(await page.locator('#edge-result').textContent(),/Old head 10 consumed/);
    assert.deepEqual(await page.locator('.slot strong').allTextContents(),['20','30','40','50']);
    await page.locator('#data').fill('256');
    await page.locator('#step').click();
    assert.match(await page.locator('#fifo-error').textContent(),/No edge advanced/);
    await page.locator('#planned-coverage').click();
    assert.match(await page.locator('#coverage-result').textContent(),/9\/12 = 75.0%/);
    await page.locator('#review-exclusions').check();
    assert.match(await page.locator('#coverage-result').textContent(),/9\/9 = 100.0%/);
    for(const id of ['wave','source','reproduced'])await page.locator(`#ev-${id}`).check();
    assert.match(await page.locator('#evidence-result').textContent(),/Supported diagnosis/);
    await page.locator('#ev-truncated').check();
    assert.match(await page.locator('#evidence-result').textContent(),/Abstain/);
    await page.locator('.drill summary').first().click();
    assert.equal(await page.locator('.drill').first().getAttribute('open'),'');
    const broken=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(id=>!document.getElementById(id)));
    assert.deepEqual(broken,[]);
    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${width}`);
    }
    await page.goto('http://127.0.0.1:8000/experiments/chip-verification-textbook/');
    await page.screenshot({path:process.env.SCREENSHOT_PATH || '/tmp/chip-textbook-mobile.png',fullPage:false});
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    console.log('PASS: routes, search/print, FIFO, validation, coverage, evidence, drills, anchors, desktop/mobile overflow, no external requests or JS errors.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
