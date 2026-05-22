# Development Guide

## Prerequisites

- **Node.js ≥ 20** — required by Electron and the build toolchain (nvm recommended)
- **pi binary** — optional; the app runs in mock/browser mode without it

Install nvm: https://github.com/nvm-sh/nvm

```bash
nvm install 20
nvm use 20
```

---

## Setup

```bash
git clone https://github.com/shaifulshabuj/piui.git
cd piui
npm install
```

### Start in Electron mode (requires pi binary)

```bash
npm run dev
```

### Start in browser-only mode (no pi binary needed)

```bash
npm run dev:renderer
```

This starts the Vite dev server on `http://localhost:5616`. All `window.pi` calls are no-ops (`undefined`), but all UI screens are fully interactive.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `electron-vite dev` | Full Electron + renderer dev mode |
| `dev:renderer` | `vite --port 5616` | Renderer-only (browser mode) |
| `dev:web` | `vite` | Alternative browser mode (random port) |
| `test` | `playwright test` | All Playwright browser specs |
| `test:unit` | `vitest run tests/*.test.ts` | Unit tests (Vitest) |
| `test:ui` | `playwright test --ui` | Playwright test UI |
| `build` | `electron-vite build` | Production Electron build |
| `build:web` | `tsc -b && vite build` | Production web build |
| `build:app` | `electron-vite build && electron-builder` | macOS `.app` + `.dmg` |
| `lint` | `eslint .` | ESLint |
| `start` | `electron-vite build && electron .` | Build + run Electron |
| `docs:dev` | `vitepress dev docs` | VitePress local preview |
| `docs:build` | `vitepress build docs` | Build docs site |
| `docs:preview` | `vitepress preview docs` | Preview built docs site |

---

## Project structure

```
piui/
├── src/                  # Renderer (React + TypeScript)
│   ├── screens/          # One file per screen (Chat, Settings, etc.)
│   ├── components/       # Reusable UI components
│   ├── store/            # Zustand stores
│   ├── lib/              # rpcClient.ts, eventHandler.ts, gitClassifier.ts
│   ├── context/          # NavContext (app-level routing)
│   ├── data/             # Static data (keybindings.ts, featureStatus.ts)
│   ├── types.ts          # Shared TypeScript types (Screen union, ThinkingLevel, etc.)
│   ├── tokens.ts         # Design tokens
│   └── electron.d.ts     # window.pi type declarations
├── electron/             # Main process + preload
│   ├── main.ts           # BrowserWindow creation, app lifecycle
│   ├── preload.ts        # contextBridge.exposeInMainWorld('pi', ...)
│   ├── ipc.ts            # registerIpcHandlers() — all ipcMain.handle() calls
│   └── piProcess.ts      # PiProcessManager, JsonlReader, findPiBinary()
├── tests/                # Playwright specs + Vitest unit tests
│   ├── helpers/
│   │   └── pi-runner.ts  # runPi(), createTestProject(), rmrf()
│   ├── features.spec.ts  # Main 21-group browser spec suite
│   ├── rpc-commands.spec.ts  # RPC dispatch spy tests
│   ├── pi-cli-flags.spec.ts  # Exhaustive CLI flag tests
│   └── *.spec.ts         # Per-screen browser specs
├── docs/                 # VitePress documentation source
│   ├── .vitepress/
│   │   └── config.ts     # VitePress site configuration
│   └── *.md              # Documentation pages
├── .docuflow/            # DocuFlow wiki and sources
├── .github/workflows/    # CI/CD GitHub Actions
└── package.json
```

---

## Coding conventions

- **TypeScript strict mode** — `strict: true` in all `tsconfig*.json`; never use `any`
- **Explicit error handling** — every `try/catch` must handle or re-throw the caught value
- **SOLID principles** — single-responsibility, no god components
- **Zustand for shared state** — local `useState` is fine for component-local UI state only
- **No auto-commits** — the app never commits git changes automatically; it only reads git state
- **Guard `window.pi`** — always use optional chaining: `window.pi?.send(cmd)`, never assume Electron

---

## Adding a new screen

1. Add the screen key to the `Screen` type union in `src/types.ts`:
   ```typescript
   export type Screen = 'chat' | 'settings' | 'my-screen' | ...
   ```

2. Create `src/screens/MyScreen.tsx`:
   ```tsx
   export function MyScreen() {
     return <div>My Screen</div>;
   }
   ```

3. Add a `case` to the screen router in `App.tsx`:
   ```tsx
   case 'my-screen': return <MyScreen />;
   ```

4. Add a nav entry to `NavContext` (or call `navigate('my-screen')` from your trigger point).

5. Write Playwright tests in `tests/my-screen.spec.ts`.

---

## Adding a new IPC handler

1. **Define the handler** in `electron/ipc.ts`:
   ```typescript
   ipcMain.handle('ns:action', async (_event, arg: string) => {
     // Validate + execute
   });
   ```

2. **Add a path guard** if the handler accesses the filesystem:
   ```typescript
   if (!isPathAllowed(arg)) throw new Error('Path not allowed');
   ```

3. **Expose a wrapper** on `window.pi` in `electron/preload.ts`:
   ```typescript
   ns: {
     action: (arg: string) => ipcRenderer.invoke('ns:action', arg),
   }
   ```

4. **Add type declarations** in `src/electron.d.ts`:
   ```typescript
   ns: {
     action: (arg: string) => Promise<void>;
   }
   ```

5. **Add a typed wrapper** in `src/lib/rpcClient.ts` (or a new `src/lib/nsClient.ts`).

---

## Environment variables

| Variable | Effect |
|----------|--------|
| `CLI_TESTS_ONLY=1` | Skips the browser dev server in Playwright config; allows CLI-only test runs without a running renderer |

> **Note:** The VitePress `base` URL is set to `/piui/` in `docs/.vitepress/config.ts`. If the GitHub repository is renamed or moved to an organisation, update `base` to match the new repository name (e.g., `/my-org/piui/` or `/new-name/`).
