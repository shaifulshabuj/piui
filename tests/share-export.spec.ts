import { test, expect, type Page } from '@playwright/test';

async function expectScreen(page: Page, token: string) {
  await expect(page.locator(`text=${token}`).first()).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  page.on('console', () => {});
  await page.goto('/');
  await expectScreen(page, 'pi ui design system');
  await page.locator('button', { hasText: 'Share' }).click();
  await expectScreen(page, 'Share & Export');
});

test.describe('ShareExport', () => {
  test('share and export screen renders heading', async ({ page }) => {
    await expect(page.locator('text=Share & Export').first()).toBeVisible();
  });

  test('gist URL is displayed', async ({ page }) => {
    await expect(page.locator('text=gist.github.com').first()).toBeVisible();
  });

  test('export html button is clickable', async ({ page }) => {
    await page.locator('button', { hasText: 'Export .html' }).click();
    await expectScreen(page, 'Share & Export');
  });

  test('export json button is clickable', async ({ page }) => {
    await page.locator('button', { hasText: 'Export .json' }).click();
    await expectScreen(page, 'Share & Export');
  });

  test('html format card is visible', async ({ page }) => {
    await expect(page.locator('text=html').first()).toBeVisible();
  });

  test('json format card is visible', async ({ page }) => {
    await expect(page.locator('text=json').first()).toBeVisible();
  });

  test('copy gist url button does not crash', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    const copyBtn = page.locator('button', { hasText: 'Copy' });
    await copyBtn.click();
    await expectScreen(page, 'Share & Export');
  });

  test('session stats section is visible', async ({ page }) => {
    await expect(page.locator('text=messages').first()).toBeVisible();
  });
});
