/** Genuine Chromium -> local HTTP -> protected adapter -> fixture provider.
 * Some failure/race scenarios explicitly substitute HTTP response fixtures.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
const executablePath = process.env.ETTA_CHROME || ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'].find(existsSync);
assert.ok(executablePath, 'Chrome/Chromium required');
const browser = await chromium.launch({ executablePath, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [], results = [];
page.on('pageerror', error => errors.push(error.message));
let posts = 0; page.on('request', req => { if (req.url().endsWith('/api/decision') && req.method() === 'POST') posts++; });
const base = 'http://127.0.0.1:4174/';
const code = 'fixture-access-code-never-a-real-secret';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const status = () => page.locator('#mind-status').innerText();
async function expectStatus(value) { await page.waitForFunction(v => document.querySelector('#mind-status')?.textContent === v, value); }
async function reset() { await page.locator('#reset-button').click(); await pause(300); }
async function ask() { await page.locator('#ask-etta').click(); await expectStatus('TEST_FIXTURE'); }
async function attempt(name, action) {
  try { await action(); results.push({ name, result: 'PASS' }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, result: 'FAIL', reason: error.message }); console.error('FAIL ' + name + ': ' + error.message); }
}
const toggle = { action: { type: 'TOGGLE_LAMP', targetId: 'lamp' }, reason: 'HTTP test fixture' };
const responseFixture = proposal => ({ provenance: 'TEST_FIXTURE', proposal, model: 'fixture-only', elapsedMs: 1 });
try {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#render-status')?.textContent?.includes('BODY ONLINE'));
  await expectStatus('MANUAL');
  await attempt('No provider POST on page load; approval starts disabled', async () => {
    assert.equal(posts, 0); assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
  });
  await attempt('Wrong access code is rejected by the actual protected HTTP endpoint', async () => {
    await page.locator('#mind-access-code').fill('incorrect-access-code-with-enough-characters');
    await page.locator('#ask-etta').click(); await expectStatus('ERROR');
    assert.match(await page.locator('#mind-message').innerText(), /not accepted/);
    assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
  });
  await attempt('Browser reaches protected adapter; fixture proposal waits for approval', async () => {
    await page.locator('#mind-access-code').fill(code); await ask();
    assert.match(await page.locator('#mind-meta').innerText(), /TEST_FIXTURE.*fixture-only/);
    await page.locator('#mind-panel details summary').click();
    assert.match(await page.locator('#mind-observation').innerText(), /Standing lamp/);
    assert.match(await page.locator('#interact-button').innerText(), /Turn light off/);
    assert.equal(await page.locator('#approve-proposal').isEnabled(), true);
    await page.locator('#approve-proposal').click();
    await page.waitForFunction(() => document.querySelector('#interact-button')?.textContent?.includes('Turn light on'));
    assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
  });
  await attempt('Manual movement cancels an approved-ready suggestion', async () => {
    await reset(); await ask(); await page.locator('#scene').focus(); await page.keyboard.down('w');
    try { await expectStatus('MANUAL'); } finally { await page.keyboard.up('w'); }
    assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
    assert.match(await page.locator('#mind-message').innerText(), /movement took over/);
  });
  await attempt('Reset and manual lamp interaction both discard proposals', async () => {
    await reset(); await ask(); await reset(); assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
    await ask(); await page.locator('#interact-button').click(); await expectStatus('MANUAL');
    assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
  });
  await attempt('Stop during a delayed response cannot resurrect a proposal', async () => {
    await reset();
    await page.route('**/api/decision', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      await pause(750);
      await route.fulfill({ json: responseFixture(toggle) }).catch(() => {});
    });
    await page.locator('#ask-etta').click(); await expectStatus('REQUESTING');
    assert.equal(await page.locator('#ask-etta').isDisabled(), true);
    await page.locator('#stop-mind').click(); await pause(1000);
    assert.equal(await status(), 'MANUAL'); assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
    assert.match(await page.locator('#interact-button').innerText(), /Turn light off/);
    await page.unroute('**/api/decision');
  });
  await attempt('Invalid HTTP proposal and quota errors remain visible with no fallback', async () => {
    for (const [body, code] of [[responseFixture({ ...toggle, action: { type: 'TELEPORT' } }), 200],
      [{ provenance: 'ERROR', message: 'Fixture quota exhausted' }, 429]]) {
      await page.route('**/api/decision', route => route.fulfill({ status: code, json: body }));
      await page.locator('#ask-etta').click(); await expectStatus('ERROR');
      assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
      assert.match(await page.locator('#interact-button').innerText(), /Turn light off/);
      await page.unroute('**/api/decision');
    }
  });

  await attempt('Named destination: owner approves, body turns and physically reaches the rug (fixture)', async () => {
    await reset();
    const move={ action: { type: 'MOVE_TO', targetId: 'rug' }, reason: 'A test-only request to walk to the rug.' };
    await page.route('**/api/decision', route => route.request().method() === 'POST' ?
      route.fulfill({ json: responseFixture(move) }) : route.continue());
    await ask();
    assert.match(await page.locator('#mind-proposal').innerText(), /Centre of the woven rug/);
    const before=await page.locator('#telemetry').innerText();
    await pause(200);
    assert.equal((await page.locator('#telemetry').innerText()).split('\n')[0], before.split('\n')[0], 'No movement before approval');
    await page.locator('#approve-proposal').click();
    assert.equal(await page.locator('#ask-etta').isDisabled(),true);
    assert.match(await page.locator('#mind-message').innerText(), /Walking to/);
    await pause(600);
    assert.match(await page.locator('#telemetry').innerText(), /WALK/);
    mkdirSync('test-results', { recursive: true });
    await page.screenshot({path:'test-results/etta-s007-walking-fixture.png'});
    await page.waitForFunction(() => document.querySelector('#mind-message')?.textContent?.startsWith('Arrived at'));
    assert.match(await page.locator('#mind-message').innerText(), /woven rug/);
    const final=await page.locator('#telemetry').innerText();
    const coordinates=final.split('\n')[0].match(/-?\d+\.\d+/g).map(Number);
    assert.ok(Math.hypot(coordinates[0]+0.04,coordinates[1]+0.875)<0.04,'Arrived at actual rug coordinates');
    assert.equal(await page.locator('#ask-etta').isEnabled(),true);
    await page.screenshot({path:'test-results/etta-s007-arrived-fixture.png'});
    await page.unroute('**/api/decision');
  });
  await attempt('Stop and manual steering cancel an approved walk without teleporting (fixture)', async () => {
    await reset();
    const move={ action: { type: 'MOVE_TO', targetId: 'table' }, reason: 'Test-only walk to desk.' };
    await page.route('**/api/decision', route => route.request().method() === 'POST' ?
      route.fulfill({json:responseFixture(move)}) : route.continue());
    await ask(); await page.locator('#approve-proposal').click(); await pause(450);
    await page.locator('#stop-mind').click(); await expectStatus('MANUAL');
    const frozen=await page.locator('#telemetry').innerText();
    await pause(150);
    assert.match(await page.locator('#mind-message').innerText(), /Stopped/);
    assert.equal((await page.locator('#telemetry').innerText()).split('\n')[0],frozen.split('\n')[0]);
    await reset(); await ask(); await page.locator('#approve-proposal').click(); await pause(300);
    await page.locator('#scene').focus(); await page.keyboard.down('a');
    try { await expectStatus('MANUAL'); } finally { await page.keyboard.up('a'); }
    assert.match(await page.locator('#mind-message').innerText(), /Manual movement took over/);
    assert.equal(await page.locator('#ask-etta').isEnabled(),true);
    await page.unroute('**/api/decision');
  });
  await attempt('S008 opt-in: fixture makes three serial choices with observed walk and natural finish', async () => {
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await expectStatus('MANUAL');
    await reset();
    await page.locator('#mind-access-code').fill(code);
    let decisions = 0;
    const move = { action: { type: 'MOVE_TO', targetId: 'rug' }, reason: 'S008 fixture walk.' };
    const waiting = { action: { type: 'WAIT' }, reason: 'S008 fixture wait.' };
    await page.route('**/api/decision', route => {
      if (route.request().method() !== 'POST') return route.continue();
      decisions++;
      return route.fulfill({ json: responseFixture(decisions === 1 ? move : waiting) });
    });
    await page.locator('#start-episode').click();
    await page.waitForFunction(() => document.querySelector('#episode-observation')?.textContent?.includes('Decisions 1/3'));
    assert.equal(await page.locator('#ask-etta').isDisabled(), true);
    assert.equal(await page.locator('#start-episode').isDisabled(), true);
    assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
    assert.match(await page.locator('#mind-status').innerText(), /AUTONOMY ACTIVE/);
    mkdirSync('test-results', {recursive:true});
    await page.screenshot({path:'test-results/etta-s008-active-fixture.png'});
    await page.waitForFunction(() => document.querySelector('#episode-observation')?.textContent?.includes('Decisions 2/3'), {timeout:12000});
    await page.waitForFunction(() => document.querySelector('#episode-observation')?.textContent?.includes('STOPPED'), {timeout:12000});
    assert.equal(decisions, 3);
    assert.match(await page.locator('#episode-observation').innerText(), /TEST_FIXTURE|Three decisions completed/);
    assert.equal(await page.locator('#ask-etta').isEnabled(), true);
    await page.screenshot({path:'test-results/etta-s008-finished-fixture.png'});
    await page.unroute('**/api/decision');
  });
  await attempt('S008 Stop aborts delayed decision; reload never auto-starts', async () => {
    await reset();
    await page.locator('#mind-access-code').fill(code);
    let requests=0;
    await page.route('**/api/decision', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      requests++;
      await pause(800);
      return route.fulfill({json:responseFixture(toggle)}).catch(() => {});
    });
    await page.locator('#start-episode').click();
    await page.waitForFunction(() => document.querySelector('#episode-observation')?.textContent?.includes('ACTIVE'));
    await page.locator('#stop-mind').click();
    await pause(950);
    assert.match(await page.locator('#episode-observation').innerText(), /STOPPED/);
    assert.equal(await page.locator('#approve-proposal').isDisabled(),true);
    const beforeReload = posts;
    await page.reload({waitUntil:'domcontentloaded'});
    await expectStatus('MANUAL');
    await pause(200);
    assert.equal(posts, beforeReload);
    assert.equal(await page.locator('#start-episode').isEnabled(),true);
    assert.match(await page.locator('#episode-observation').innerText(), /^OFF/);
    assert.equal(requests, 1);
    await page.unroute('**/api/decision');
    await page.locator('#mind-access-code').fill(code);
  });
  await attempt('Model text renders as text; access code is not persisted', async () => {
    await page.route('**/api/decision', route => route.fulfill({ json: responseFixture({ ...toggle, reason: '<img src=x onerror=alert(1)>' }) }));
    await ask(); assert.equal(await page.locator('#mind-proposal img').count(), 0);
    assert.match(await page.locator('#mind-proposal').innerText(), /<img/);
    const stores = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
    assert.doesNotMatch(JSON.stringify(stores), new RegExp(code));
    await page.locator('#lock-mind').click(); assert.equal(await page.locator('#mind-access-code').inputValue(), '');
    assert.equal(await page.locator('#approve-proposal').isDisabled(), true);
    await page.unroute('**/api/decision');
  });
  await attempt('Built preview without configuration shows DISABLED and preserves room controls', async () => {
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#render-status')?.textContent?.includes('BODY ONLINE'));
    await expectStatus('DISABLED'); assert.equal(await page.locator('#ask-etta').isDisabled(), true);
    await page.locator('#interact-button').click();
    await page.waitForFunction(() => document.querySelector('#interact-button')?.textContent?.includes('Turn light on'));
  });
  await attempt('Mind panel captures desktop/mobile layouts without runtime errors', async () => {
    await page.goto(base, { waitUntil: 'domcontentloaded' }); await expectStatus('MANUAL');
    await page.locator('#mind-access-code').fill(code); await ask();
    mkdirSync('test-results', { recursive: true });
    await page.screenshot({ path: 'test-results/etta-mind-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#mind-panel').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'test-results/etta-mind-mobile.png' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
  });
} finally {
  mkdirSync('test-results', { recursive: true });
  writeFileSync('test-results/mind-browser-results.json', JSON.stringify({ evidence: 'CHROMIUM_WITH_EXPLICIT_PROVIDER_FIXTURES', results, errors }, null, 2));
  await browser.close();
}
if (results.some(r => r.result === 'FAIL') || errors.length) process.exitCode = 1;
