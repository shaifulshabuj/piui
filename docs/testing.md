# Testing

## Test categories

| Category | Runner | Files | What it covers |
|---|---|---|---|
| Unit | Vitest | `tests/*.test.ts` | Pure logic: `gitClassifier`, `piProcess` binary discovery, `JsonlReader` |
| Playwright (browser) | Playwright | `tests/*.spec.ts` (excl. `pi-cli-*`) | All React screens in browser mode (`window.pi` mocked or absent) |
| Playwright (CLI) | Playwright | `tests/pi-cli-*.spec.ts` | Real `pi` binary flag behaviour via `spawnSync` |
| RPC dispatch | Playwright | `tests/rpc-commands.spec.ts` | RPC command shapes injected via `addInitScript` spy |

---

## Running all tests

```bash
npm test
```

Requires the Vite dev server (`npm run dev:renderer`) or a running renderer. Playwright will start it automatically via `webServer` in `playwright.config.ts`.

---

## Running CLI-only tests (no browser needed)

```bash
CLI_TESTS_ONLY=1 npx playwright test tests/pi-cli-flags.spec.ts tests/pi-cli-integration.spec.ts
```

`CLI_TESTS_ONLY=1` disables the `webServer` in `playwright.config.ts` so Playwright does not try to start the renderer. Requires the `pi` binary to be installed.

---

## Running unit tests

```bash
npm run test:unit
```

Runs Vitest against `tests/*.test.ts` — no browser, no dev server, no pi binary required.

---

## Test infrastructure

| File | Role |
|------|------|
| `playwright.config.ts` | `fullyParallel: false`, `workers: 1`, `retries: 1`, `webServer` on `http://localhost:5616` |
| `tests/helpers/pi-runner.ts` | `runPi(options)`, `createTestProject(baseDir)`, `rmrf(dir)` helpers |
| `tmp/test-project/` | Fixture tree created fresh by `createTestProject`; session artifacts cleaned by `afterAll` |

---

## Spec files

### Browser specs (require dev server on `:5616`)

| File | Groups | Coverage area |
|------|--------|---------------|
| `features.spec.ts` | 21 | Navigation, MainChat, SessionTree, ModelPicker, Packages, ContextEditor, ThemeCustomizer, ShareExport, PromptTemplates, Steering, CommandPalette, PermissionPrompt, ToolInspector, Onboarding, Statusbar, Keyboard shortcuts, Sidebar sessions, ExtensionDetail, CompactModal, Settings, FeatureStatus |
| `rpc-commands.spec.ts` | 7 | RPC command dispatch shapes via `window.pi` spy |
| `command-palette.spec.ts` | — | CommandPalette overlay interactions |
| `feature-status.spec.ts` | — | FeatureStatus screen |
| `git-status.spec.ts` | — | GitStatus screen |
| `help-screen.spec.ts` | — | Help screen |
| `session-tree.spec.ts` | — | SessionTree screen |
| `settings.spec.ts` | — | Settings screen |
| `share-export.spec.ts` | — | ShareExport screen |

### CLI specs (require `pi` binary, use `CLI_TESTS_ONLY=1`)

| File | Groups | Coverage area |
|------|--------|---------------|
| `pi-cli-integration.spec.ts` | 14 | CLI meta, model listing, extensions, non-interactive prompt, read tool, write tool, bash tool, find/grep tools, session lifecycle, session fork, system prompt, output mode, thinking level, export |
| `pi-cli-flags.spec.ts` | 9 | Meta flags, model flags, tool combinations, output mode, all 6 thinking levels, session lifecycle, system prompt, file attachments, export |

---

## Writing a new Playwright spec

1. Create `tests/my-feature.spec.ts`
2. Use `test.beforeEach` to `page.goto('/')` and assert on an anchor token:
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     await expect(page.locator('text=pi ui design system').first()).toBeVisible({ timeout: 5000 });
   });
   ```
3. Use `page.locator('text=...')` over CSS selectors — the UI uses dynamic style tokens
4. For CLI tests: import `runPi` and `createTestProject` from `./helpers/pi-runner`; never use a `page` object
5. For RPC dispatch tests: call `injectPiSpy(page)` **before** `page.goto('/')` so the spy is available when the app mounts

---

## CI

The GitHub Actions workflow in `.github/workflows/docs.yml` builds the VitePress site and deploys to GitHub Pages. Tests run separately via your existing CI pipeline or locally.

To add a test CI workflow, create `.github/workflows/test.yml` that runs `npm test` after starting the dev server.
