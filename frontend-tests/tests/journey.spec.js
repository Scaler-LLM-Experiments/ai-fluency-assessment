// Full lead journey — proves frontend tracking still fires.
// Captures all outbound POSTs to detect dual-write later.
const { test, expect } = require('@playwright/test');

const TOOL_PATH = '/ai-business-fluency-assessment/';

test('full assessment journey fires expected tracking events', async ({ page }) => {
  const tracked = [];
  page.on('request', req => {
    const url = req.url();
    if (url.includes('script.google.com') || url.includes('/api/track')) {
      let body = null;
      try { body = JSON.parse(req.postData() || '{}'); } catch {}
      tracked.push({ url, event: body && body.event, body });
    }
  });

  await page.goto(TOOL_PATH);

  // login
  await page.fill('#inp-name',  'Playwright Test');
  await page.fill('#inp-email', 'pw-test+' + Date.now() + '@example.com');
  await page.fill('#inp-phone', '9999999999');
  await page.locator('form').first().evaluate(f => f.requestSubmit());

  // role screen
  await page.waitForSelector('#screen-role.active', { timeout: 10_000 });
  await page.locator('.role-card').first().click();
  // new UI requires explicit BEGIN ASSESSMENT click after role pick
  const beginBtn = page.getByRole('button', { name: /begin assessment/i });
  if (await beginBtn.count()) await beginBtn.first().click();

  // 10 questions
  await page.waitForSelector('#screen-questions.active', { timeout: 10_000 });
  for (let i = 0; i < 10; i++) {
    await page.locator('.level-card').first().click();
    await page.locator('#btn-next:not([disabled])').click();
    await page.waitForTimeout(400);
  }

  // results
  await page.waitForSelector('#screen-results.active', { timeout: 15_000 });

  // count events per destination — both sides should see every event
  const sheetEvents   = tracked.filter(t => t.url.includes('script.google.com')).map(t => t.event);
  const backendEvents = tracked.filter(t => t.url.includes('/api/track')).map(t => t.event);
  const sheetQ   = sheetEvents.filter(e => e === 'question_answered').length;
  const backendQ = backendEvents.filter(e => e === 'question_answered').length;
  console.log(`SHEET   : started=${sheetEvents.includes('started')} role=${sheetEvents.includes('role_selected')} qAnswered=${sheetQ} completed=${sheetEvents.includes('completed')} total=${sheetEvents.length}`);
  console.log(`BACKEND : started=${backendEvents.includes('started')} role=${backendEvents.includes('role_selected')} qAnswered=${backendQ} completed=${backendEvents.includes('completed')} total=${backendEvents.length}`);

  // sheet must keep working (parity guarantee)
  expect(sheetEvents).toContain('started');
  expect(sheetEvents).toContain('role_selected');
  expect(sheetQ).toBe(10);
  expect(sheetEvents).toContain('completed');
  // backend must mirror it (dual-write guarantee)
  expect(backendEvents).toContain('started');
  expect(backendEvents).toContain('role_selected');
  expect(backendQ).toBe(10);
  expect(backendEvents).toContain('completed');
});
