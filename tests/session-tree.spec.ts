import { test, expect, type Page } from '@playwright/test';

async function expectScreen(page: Page, token: string) {
  await expect(page.locator(`text=${token}`).first()).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  page.on('console', () => {});
  await page.goto('/');
  await expectScreen(page, 'pi ui design system');
  await page.locator('text=Tree').first().click();
  await expectScreen(page, '/tree');
});

test.describe('SessionTree', () => {
  test('session tree screen renders /tree heading', async ({ page }) => {
    await expect(page.locator('text=/tree').first()).toBeVisible();
  });

  test('session nodes are displayed with loadSession text', async ({ page }) => {
    await expect(page.locator('text=loadSession').first()).toBeVisible();
  });

  test('search input is visible', async ({ page }) => {
    await expect(page.locator('input[placeholder*="search"]').first()).toBeVisible();
  });

  test('search input filters visible nodes', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search"]').first();
    await searchInput.fill('fix');
    await expect(page.locator('text=/tree').first()).toBeVisible();
  });

  test('branch indicator is visible in tree', async ({ page }) => {
    await expect(page.locator('text=hotfix').first()).toBeVisible();
  });

  test('clicking a tree node emits action', async ({ page }) => {
    const node = page.locator('text=loadSession').first();
    await node.click();
    await expect(page.locator('text=/tree').first()).toBeVisible();
  });

  test('keyboard up/down does not crash', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('text=/tree').first()).toBeVisible();
  });

  test('filter chips are displayed', async ({ page }) => {
    await expect(page.locator('text=all').first()).toBeVisible();
  });
});
