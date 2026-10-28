// Optional development check: npm install playwright-core, set CHROMIUM_PATH to a local browser.
const {chromium:pw}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');const assert=require('node:assert/strict');
(async()=>{const browser=await pw.launch({args:['--no-sandbox'],executablePath:process.env.CHROMIUM_PATH,headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:8000/experiments/bronco-chip-verification/');await page.waitForSelector('#glossary-list dt');
assert.equal(await page.locator('#questions details').count(),20);
for(let i=0;i<3;i++){await page.selectOption('#scenario',String(i));await page.locator(`[name=cause][value="${i}"]`).check();await page.click('#reveal');assert.match(await page.locator('#debug-feedback').innerText(),/^Correct/);await page.locator('#time').fill('3');await page.locator('#time').dispatchEvent('input');assert.match(await page.locator('#readout').innerText(),/Edge 3:/);}
await page.locator('[data-signal=out_data]').click();assert.equal(await page.locator('[data-signal=out_data]').getAttribute('aria-pressed'),'false');
await page.locator('#tests').fill('0');await page.locator('#tests').dispatchEvent('input');assert.equal(await page.locator('.bin.hit').count(),0);await page.locator('#tests').fill('300');await page.locator('#tests').dispatchEvent('input');assert.ok(await page.locator('.bin.hit').count()>0);
for(let i=0;i<6;i++){await page.locator(`[data-step="${i}"]`).click();assert.match(await page.locator('#flow-panel').innerText(),new RegExp(`step ${i+1} of 6`,"i"));}
await page.locator('#glossary-search').fill('backpressure');assert.equal(await page.locator('#glossary-list dt').count(),1);
await page.locator('#questions summary').first().click();assert.equal(await page.locator('#questions details').first().getAttribute('open'),'');
await page.locator('#time').focus();await page.keyboard.press('ArrowRight');assert.match(await page.locator('#readout').innerText(),/Edge 4:/);
await page.locator('[data-step="0"]').focus();await page.keyboard.press('Space');assert.match(await page.locator('#flow-panel').innerText(),/Engineer writes/);
const missing=await page.evaluate(()=>Array.from(document.querySelectorAll('a[href^="#"]')).map(a=>a.getAttribute('href').slice(1)).filter(id=>!document.getElementById(id)));assert.deepEqual(missing,[]);
for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);}
await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:8000/experiments/bronco-chip-verification/');await page.setViewportSize({width:390,height:844});
const back=page.locator('.back-link');assert.equal(await back.getAttribute('href'),'../../');await back.click();await page.waitForURL('http://127.0.0.1:8000/');assert.ok(await page.locator('a[href="experiments/bronco-chip-verification/"]').count());assert.deepEqual(errors,[]);console.log('PASS: all cases, sliders, toggles, flow, glossary, Q&A, anchors, hub/back-link, 1440/390/320px; no browser errors');await browser.close();})();
