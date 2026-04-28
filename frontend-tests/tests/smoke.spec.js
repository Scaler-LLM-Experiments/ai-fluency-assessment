// Smoke tests — verify the live tool loads and renders.
const { test, expect } = require('@playwright/test');

const TOOL_PATH = '/ai-business-fluency-assessment/';

test('tool loads with 200 + key DOM elements', async ({ page }) => {
  const resp = await page.goto(TOOL_PATH);
  expect(resp.status()).toBe(200);
  await expect(page.locator('input#inp-name')).toBeVisible();
  await expect(page.locator('input#inp-email')).toBeVisible();
  await expect(page.locator('input#inp-phone')).toBeVisible();
});

test('static assets load (data.js, logos)', async ({ page, request }) => {
  await page.goto(TOOL_PATH);
  const dataResp = await request.get('/ai-business-fluency-assessment/data.js');
  expect(dataResp.status()).toBe(200);
  const logoResp = await request.get('/ai-business-fluency-assessment/scaler-logo.svg');
  expect(logoResp.status()).toBe(200);
});

test('root path redirects to assessment', async ({ page }) => {
  const resp = await page.goto('/');
  expect(page.url()).toContain('/ai-business-fluency-assessment');
});
