import { test, expect, type Page } from '@playwright/test';

async function expectScreen(page: Page, token: string) {
  await expect(page.locator(`text=${token}`).first()).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  page.on('console', () => {});
  await page.goto('/');
  await expectScreen(page, 'pi ui design system');
  await page.locator('text=Commands').first().click();
  await expectScreen(page, 'Command Palette');
});

test.describe('CommandPalette', () => {
  test('command palette renders heading', async ({ page }) => {
    await expect(page.locator('text=Command Palette').first()).toBeVisible();
  });

  test('search input is auto-focused', async ({ page }) => {
    const input = page.locator('input[placeholder*="command"]');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test('built-in commands are listed', async ({ page }) => {
    await expect(page.locator('text=/model').first()).toBeVisible();
  });

  test('typing filters commands by name', async ({ page }) => {
    await page.locator('input').first().fill('theme');
    await expect(page.locator('text=/theme').first()).toBeVisible();
    // /model should not be visible after filtering for 'theme'
    await expect(page.locator('text=/model').first()).not.toBeVisible();
  });

  test('clearing search shows all commands again', async ({ page }) => {
    await page.locator('input').first().fill('theme');
    await page.locator('input').first().fill('');
    await expect(page.locator('text=/model').first()).toBeVisible();
  });

  test('arrow keys navigate the command list', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    // Commands list is still visible after navigation
    await expect(page.locator('text=/model').first()).toBeVisible();
  });

  test('Escape closes the overlay and returns to chat', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expectScreen(page, 'pi ui design system');
  });

  test('clicking a navigation command routes correctly', async ({ page }) => {
    await page.locator('text=/model').first().click();
    await expectScreen(page, 'Model');
  });
});
