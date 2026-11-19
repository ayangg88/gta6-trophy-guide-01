// Use an installed Playwright package, or point PLAYWRIGHT_MODULE to its location.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
    const page = await context.newPage();
    const errors = [], requests = [];
    const base = 'http://127.0.0.1:8080';
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => requests.push(r.url()));
    for (let s = 1; s <= 4; s++) {
      await page.goto(`${base}/?shot=${s}`, { waitUntil: 'networkidle' });
      assert((await page.locator('main').innerText()).trim(), `shot ${s} blank`);
      assert.equal(await page.locator('#earned-count').innerText(), '13');
      if (s === 4) {
        await page.locator('#drawer-done').click();
        assert.equal(await page.locator('.shot-settings').count(), 0);
      }
    }
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#earned-count').innerText(), '0');
    assert.equal(await page.locator('.trophy-row').count(), 55);
    await page.locator('#search').fill('cash');
    assert(await page.locator('.trophy-row').count() > 0, 'search');
    await page.locator('#search').fill('');
    await page.locator('#grade-filter').selectOption('silver');
    assert(await page.locator('.trophy-row').count() > 0);
    assert.equal(await page.locator('.trophy-row .medal:not(.silver)').count(), 0);
    await page.locator('#kind-filter').selectOption('activities');
    await page.locator('#status-filter').selectOption('open');
    await page.locator('#grade-filter').selectOption('');
    await page.locator('#kind-filter').selectOption('');
    await page.locator('#status-filter').selectOption('');
    const id = 15;
    await page.locator(`input[data-earn-id="${id}"]`).click();
    await page.waitForFunction(() => document.querySelector('#earned-count').textContent === '1');
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.locator(`input[data-earn-id="${id}"]`).isChecked());
    await page.locator(`.row-open[data-trophy="${id}"]`).click();
    await page.locator('#psn-counter').fill('12');
    await page.locator('#psn-counter').press('Tab');
    await page.locator('#trophy-notes').fill('Saved route');
    await page.locator('#trophy-notes').press('Tab');
    await page.getByRole('button', { name: /Settings & save/ }).click();
    await page.locator('#setting-spoiler').check();
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-save').click()]);
    const save = fs.readFileSync(await download.path());
    page.once('dialog', d => d.accept());
    await page.locator('#reset-save').click();
    assert.equal(await page.locator('#earned-count').innerText(), '0');
    await page.locator('#import-save').setInputFiles({ name: 'progress.json', mimeType: 'application/json', buffer: save });
    await page.waitForFunction(() => document.querySelector('#earned-count').textContent === '1');
    const data = JSON.parse(await page.evaluate(() => localStorage.getItem('leonida-platinum-guide-v1')));
    assert.deepEqual(data.earned, [id]);
    assert.equal(data.notes[id], 'Saved route');
    assert.equal(data.counts[id], 12);
    assert.equal(data.spoiler, true);
    for (const name of ['Roadmap', 'Missables', 'Next up']) {
      await page.getByRole('button', { name: new RegExp(name) }).click();
      assert((await page.locator('main').innerText()).trim(), `${name} unavailable`);
      const link = page.locator('main button[data-id], main button[data-trophy]').first();
      const selected = await link.getAttribute('data-id') || await link.getAttribute('data-trophy');
      await link.click();
      assert.equal(await page.locator('.trophy-row.selected .row-open').getAttribute('data-trophy'), selected, `${name} guide link`);
    }
    await page.getByRole('button', { name: /Trophies/ }).click();
    await page.locator('#grade-filter').selectOption('');
    await page.locator('#status-filter').selectOption('open');
    await page.locator('#kind-filter').selectOption('story');
    // Import restored spoiler cover: ensure it is on instead of toggling it off.
    if (!await page.locator('#spoiler-toggle').isChecked()) await page.locator('.switch-label').click();
    for (const search of ['Just Like Paradise', 'Gone Fishing', 'opening manual save']) {
      await page.locator('#search').fill(search);
      assert.equal(await page.locator('.trophy-row').count(), 0, 'spoiler search leak');
    }
    await page.locator('#search').fill('hidden trophy');
    assert(await page.locator('.trophy-row').count() > 0, 'spoiler placeholder search');
    await page.locator('.switch-label').click();
    await page.locator('#search').fill('Gone Fishing');
    assert(await page.locator('.trophy-row').count() > 0, 'revealed search');
    assert.deepEqual(requests.filter(url => !url.startsWith(`${base}/`)), [], 'offsite requests');
    assert.deepEqual(errors, [], 'console errors');
    console.log(JSON.stringify({ browser: 'passed', scenes: 4, pages: 5, persistence: 'passed', notes: 'passed', counter: 'passed', exportImportReset: 'passed', spoilers: 'passed', externalRequests: 0, consoleErrors: 0 }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
