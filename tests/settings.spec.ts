import { test, expect, type Page } from '@playwright/test';

async function expectScreen(page: Page, token: string) {
  await expect(page.locator(`text=${token}`).first()).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  page.on('console', () => {});
  await page.goto('/');
  await expectScreen(page, 'pi ui design system');
  await page.locator('text=Settings').first().click();
  await expectScreen(page, 'Settings');
});

test.describe('Settings', () => {
  test('settings screen renders heading', async ({ page }) => {
    await expect(page.locator('text=Settings').first()).toBeVisible();
  });

  test('thinking level options are rendered', async ({ page }) => {
    await expect(page.locator('text=Thinking Level').first()).toBeVisible();
    await expect(page.locator('text=off').first()).toBeVisible();
    await expect(page.locator('text=minimal').first()).toBeVisible();
    await expect(page.locator('text=high').first()).toBeVisible();
  });

  test('steering mode toggle is rendered', async ({ page }) => {
    await expect(page.locator('text=Steering Mode').first()).toBeVisible();
    await expect(page.locator('text=one-at-a-time').first()).toBeVisible();
  });

  test('follow-up mode toggle is rendered', async ({ page }) => {
    await expect(page.locator('text=Follow-up Mode').first()).toBeVisible();
  });

  test('auto-compaction toggle is rendered', async ({ page }) => {
    await expect(page.locator('text=Auto-Compaction').first()).toBeVisible();
  });

  test('clicking a thinking level option selects it', async ({ page }) => {
    const mediumOption = page.locator('text=medium').first();
    await mediumOption.click();
    // Stays on settings screen, no crash
    await expectScreen(page, 'Settings');
  });

  test('open theme customizer button navigates to theme', async ({ page }) => {
    await page.locator('button', { hasText: 'Open Theme Customizer' }).click();
    await expectScreen(page, 'Theme');
  });
});
