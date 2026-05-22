import { test, expect, request } from '@playwright/test';

const BASE = 'https://shaifulshabuj.github.io/piui';

const SIDEBAR_PATHS = [
  '/installation',
  '/usage-guide',
  '/configuration',
  '/architecture',
  '/rpc-protocol',
  '/pi-cli-integration',
  '/development',
  '/testing',
];

test('homepage title is "piui"', async ({ page }) => {
  await page.goto(`${BASE}/`);
  await expect(page).toHaveTitle('piui');
});

test('all sidebar links return HTTP 200', async () => {
  const ctx = await request.newContext();
  for (const path of SIDEBAR_PATHS) {
    const res = await ctx.get(`${BASE}${path}`);
    expect(res.status(), `Expected 200 for ${path}`).toBe(200);
  }
  await ctx.dispose();
});

test('GitHub nav link points to the correct repo', async ({ page }) => {
  await page.goto(`${BASE}/`);
  const ghLink = page.locator('a[href="https://github.com/shaifulshabuj/piui"]').first();
  await expect(ghLink).toBeVisible();
  await expect(ghLink).toHaveAttribute('href', 'https://github.com/shaifulshabuj/piui');
});
