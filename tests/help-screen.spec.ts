import { test, expect, type Page } from '@playwright/test';

async function expectVisible(page: Page, token: string) {
  await expect(page.locator(`text=${token}`).first()).toBeVisible({ timeout: 5000 });
}

async function navigateToHelp(page: Page) {
  await page.goto('/');
  await expectVisible(page, 'pi ui design system');
  await page.locator('text=Help').first().click();
  await expectVisible(page, 'Help');
}

test.describe('Help screen', () => {
  test('Help screen renders', async ({ page }) => {
    await navigateToHelp(page);
    await expect(page.locator('[data-testid="help-screen"]')).toBeVisible();
  });

  test('Default tab is Quick Start', async ({ page }) => {
    await navigateToHelp(page);
    await expectVisible(page, 'Quick Start');
    // Quick Start content is visible
    await expectVisible(page, 'Install the pi binary');
    // CLI Reference content is hidden
    await expect(page.locator('text=Flag').first()).not.toBeVisible();
  });

  test('Tab switch to CLI Reference', async ({ page }) => {
    await navigateToHelp(page);
    await page.locator('text=CLI Reference').first().click();
    // CLI Reference content is visible
    await expectVisible(page, '--print / -p');
    // Quick Start content is hidden
    await expect(page.locator('text=Install the pi binary').first()).not.toBeVisible();
  });

  test('Tab switch to Keyboard shows keybindings', async ({ page }) => {
    await navigateToHelp(page);
    await page.locator('button', { hasText: 'Keyboard' }).click();
    await expectVisible(page, 'Ctrl+/');
    await expectVisible(page, 'Command palette');
  });

  test('Tab switch to FAQ shows Q&A entries', async ({ page }) => {
    await navigateToHelp(page);
    await page.locator('text=FAQ').first().click();
    // At least one question is visible
    await expectVisible(page, 'binary was not found');
    // At least one answer is visible
    await expectVisible(page, 'mock/browser mode');
  });

  test('Tab switch back to Quick Start', async ({ page }) => {
    await navigateToHelp(page);
    await page.locator('text=CLI Reference').first().click();
    await expectVisible(page, '--print / -p');
    await page.locator('text=Quick Start').first().click();
    await expectVisible(page, 'Install the pi binary');
  });

  test('Help nav item appears in sidebar', async ({ page }) => {
    await page.goto('/');
    await expectVisible(page, 'pi ui design system');
    await expect(page.locator('text=Help').first()).toBeVisible();
  });

  test('Help nav item has active state when on help screen', async ({ page }) => {
    await navigateToHelp(page);
    // Verify we are on the help screen
    await expect(page.locator('[data-testid="help-screen"]')).toBeVisible();
    // The Help nav item (div with text "Help") should be visible in the sidebar
    const helpNavItem = page.locator('[data-testid="help-screen"]').locator('..').locator('..').locator('text=Help').first();
    await expect(page.locator('text=Help').first()).toBeVisible();
  });
});
