import { test, expect, type Page } from '@playwright/test';

async function expectScreen(page: Page, token: string) {
  await expect(page.locator(`text=${token}`).first()).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  page.on('console', () => {});
  await page.goto('/');
  await expectScreen(page, 'pi ui design system');
});

test.describe('FeatureStatus', () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('text=Features').first().click();
    await expectScreen(page, 'Feature Status');
  });

  test('feature status screen renders', async ({ page }) => {
    await expect(page.locator('text=Feature Status').first()).toBeVisible();
  });

  test('summary pills show status counts', async ({ page }) => {
    await expect(page.locator('text=implemented').first()).toBeVisible();
    await expect(page.locator('text=partial').first()).toBeVisible();
  });

  test('categories are rendered as collapsible sections', async ({ page }) => {
    await expect(page.locator('text=Chat').first()).toBeVisible();
    await expect(page.locator('text=Model').first()).toBeVisible();
    await expect(page.locator('text=Session').first()).toBeVisible();
  });

  test('search input filters features', async ({ page }) => {
    await page.locator('input[placeholder*="search"]').fill('compact');
    await expect(page.locator('text=Compaction').first()).toBeVisible();
  });

  test('search with no match shows empty state', async ({ page }) => {
    await page.locator('input[placeholder*="search"]').fill('xyzzy-no-match-abc');
    await expect(page.locator('text=No features match').first()).toBeVisible();
  });

  test('clicking a category toggles it collapsed', async ({ page }) => {
    const chatHeader = page.locator('text=CHAT').first();
    await chatHeader.click();
    // After collapse the send prompt feature should be hidden
    const chatFeature = page.locator('text=Send prompt');
    await expect(chatFeature).not.toBeVisible();
  });

  test('pi.dev/docs link button is visible', async ({ page }) => {
    await expect(page.locator('text=pi.dev/docs').first()).toBeVisible();
  });

  test('total features count is shown', async ({ page }) => {
    await expect(page.locator('text=features tracked').first()).toBeVisible();
  });
});
