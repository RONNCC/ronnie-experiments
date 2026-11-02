/* Optional browser smoke test: npm install playwright; node tests/browser.cjs.
   Serve repo root on port 8000 first. CHROMIUM_PATH may point to a system binary. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const shots = process.env.SCREENSHOT_DIR || '/tmp/chip-textbook-qa';
fs.mkdirSync(shots,{recursive:true});
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || undefined, args:['--no-sandbox']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[],external=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8000/'))external.push(r.url());});
    await page.goto('http://127.0.0.1:8000/experiments/chip-verification-textbook/');
    assert.equal(await page.locator('.chapter').count(),25);
    await page.locator('.start-action').click();
    assert.ok(page.url().endsWith('#start-here'));
    assert.equal(await page.locator('#start-here ol li').count(),5);
    assert.match(await page.locator('#start-here').textContent(),/20, then 10/);
    assert.equal(await page.locator('.drill').count(),25);
    await page.locator('[data-route="quick"]').click();
    assert.match(await page.locator('#route-status').textContent(),/45 minutes/);
    await page.locator('#search').fill('no_such_concept_zz');
    assert.equal(await page.locator('.chapter:visible').count(),0);
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.chapter:visible').count(),25);
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
    // Required hidden-ordering coverage experiment.
    await page.locator('#hidden-suite').selectOption('ordering');
    assert.match(await page.locator('#hidden-result').textContent(), /100%.*HIT.*FAIL/);
    await page.locator('#hidden-checker').uncheck();
    assert.match(await page.locator('#hidden-result').textContent(), /UNCHECKED/);
    await page.locator('#hidden-mutant').uncheck();
    await page.locator('#hidden-checker').check();
    assert.match(await page.locator('#hidden-result').textContent(), /PASS/);
    // CDC digital pulse loss, toggle recovery, busy offer refusal, invalid controls.
    assert.match(await page.locator('#cdc-result').textContent(), /6 offered; 6 accepted; 0 delivered/);
    await page.getByLabel('Crossing scheme').selectOption('toggle');
    assert.match(await page.locator('#cdc-result').textContent(), /6 delivered/);
    await page.locator('#cdc-fast').click();
    assert.match(await page.locator('#cdc-result').textContent(), /0 delivered/);
    await page.getByLabel('Crossing scheme').selectOption('handshake');
    assert.match(await page.locator('#cdc-result').textContent(), /1 accepted; 1 delivered; 5 refused/);
    await page.locator('#cdc-phase').fill('99');
    assert.match(await page.locator('#cdc-error').textContent(), /Previous results cleared/);
    await page.locator('#cdc-miss').click();
    // Keyboard-triggered example button works, not just pointer clicks.
    await page.locator('#cdc-fast').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#cdc-mode').inputValue(),'toggle');
    await page.locator('#cdc-miss').click();
    async function range(id,value) {
      await page.locator('#'+id).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
    }
    await range('budget-rounds',4); await range('budget-hours',4);
    assert.match(await page.locator('#budget-result').textContent(), /4\/4 validated seeded bugs; 8\/8 supported outcomes/);
    await page.locator('#budget-checker').uncheck();
    assert.match(await page.locator('#budget-result').textContent(), /0\/4 validated seeded bugs/);
    await page.locator('#budget-checker').check();
    await page.locator('#budget-workers').focus();await page.keyboard.press('End');
    assert.equal(await page.locator('#budget-workers').inputValue(),'4');
    assert.match(await page.locator('#budget-result').textContent(), /4\/4 validated seeded bugs/);
    // Search can reveal expansion and TOC can navigate it.
    await page.locator('#search').fill('recovery/removal');
    assert.ok(await page.locator('#chapter-20').isVisible());
    await page.locator('#search').fill('');
    const ids=await page.locator('[id]').evaluateAll(els=>els.map(el=>el.id));
    assert.equal(ids.length,new Set(ids).size,'No duplicate IDs');
    const broken=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(id=>!document.getElementById(id)));
    assert.deepEqual(broken,[]);
    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${width}`);
      // All chapters and expanded lab states remain free of BODY overflow.
      for(const selector of ['#fifo-lab','#coverage-lab','#cdc-lab','#budget-lab','#chapter-19']) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        assert.equal(await page.evaluate(()=>document.body.scrollWidth>innerWidth),false,`${selector} body overflow at ${width}`);
      }
      const tooSmall=await page.locator('button,select,input[type=number],input[type=search],input[type=range]').evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().height>0&&el.getBoundingClientRect().height<44).map(el=>el.id));
      assert.deepEqual(tooSmall,[],`44px controls at ${width}`);
      const checkboxTargets=await page.locator('label:has(input[type=checkbox])').evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().height>0&&el.getBoundingClientRect().height<44).map(el=>el.textContent));
      assert.deepEqual(checkboxTargets,[],`44px checkbox labels at ${width}`);
      if(width<720) {
        await page.locator('#cdc-lab').screenshot({path:path.join(shots,`cdc-${width}.png`)});
        await page.locator('#budget-lab').screenshot({path:path.join(shots,`budget-${width}.png`)});
        await page.locator('#chapter-19 .code-scroll').first().screenshot({path:path.join(shots,`code-${width}.png`)});
        const pre=page.locator('#chapter-19 pre').first();
        assert.ok(await pre.evaluate(el=>el.scrollWidth>el.clientWidth),'Code scrolls within its own region');
        await pre.focus(); await page.keyboard.press('ArrowRight');
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(shots,'desktop.png')});
    const answersOpenBeforePrint=await page.locator('.drill[open]').count();
    await page.locator('#search').fill('no_such_concept_zz');
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.chapter:visible').count(),25);
    assert.equal(await page.locator('.drill[open]').count(),25);
    await page.pdf({path:path.join(shots,'textbook-print.pdf'),format:'A4',margin:{top:'15mm',bottom:'15mm',left:'14mm',right:'14mm'}});
    await page.emulateMedia({media:'screen'});
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    assert.equal(await page.locator('.drill[open]').count(),answersOpenBeforePrint,'Printing restores answer disclosure state');
    await page.locator('#search').fill('');
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    console.log('PASS: all four labs + evidence exercise, routes/search/print PDF, keyboard, 25 answers, anchors/IDs, 44px controls, desktop/390/320px BODY overflow, screenshots, and zero external requests/JS errors.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
