import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5616',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/docs-site.spec.ts',
    },
    {
      name: 'docs-site',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://shaifulshabuj.github.io' },
      testMatch: '**/docs-site.spec.ts',
    },
  ],
  webServer: process.env.CLI_TESTS_ONLY === '1' || process.env.DOCS_TESTS_ONLY === '1' ? undefined : {
    command: 'npm run dev:renderer',
    url: 'http://localhost:5616',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
