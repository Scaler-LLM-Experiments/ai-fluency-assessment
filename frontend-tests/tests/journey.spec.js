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

  // 10 questions
  for (let i = 0; i < 10; i++) {
    await page.waitForSelector('#screen-question.active', { timeout: 10_000 });
    await page.locator('.option-row').first().click();
    await page.waitForTimeout(400);
  }

  // results
  await page.waitForSelector('#screen-results.active', { timeout: 15_000 });

  // event assertions
  const events = tracked.map(t => t.event).filter(Boolean);
  expect(events).toContain('started');
  expect(events).toContain('role_selected');
  const qAnswered = events.filter(e => e === 'question_answered').length;
  expect(qAnswered).toBe(10);
  expect(events).toContain('completed');

  // record where they went (sheet vs dual-write detection)
  const sheetCount   = tracked.filter(t => t.url.includes('script.google.com')).length;
  const backendCount = tracked.filter(t => t.url.includes('/api/track')).length;
  console.log(`tracked: sheet=${sheetCount}  backend=${backendCount}`);
  expect(sheetCount + backendCount).toBeGreaterThanOrEqual(13);
});
