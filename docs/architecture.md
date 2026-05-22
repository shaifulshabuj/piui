# Architecture

## Layer overview

```
  ┌─────────────────────────────────────┐
  │      React UI / Zustand stores      │
  └──────────────────┬──────────────────┘
                     │  contextBridge
  ┌──────────────────▼──────────────────┐
  │   Electron preload (window.pi)      │
  └──────────────────┬──────────────────┘
                     │  ipcMain / ipcRenderer
  ┌──────────────────▼──────────────────┐
  │  Electron main — ipc.ts            │
  └──────────────────┬──────────────────┘
                     │  stdio pipes
  ┌──────────────────▼──────────────────┐
  │  PiProcessManager — piProcess.ts    │
  └──────────────────┬──────────────────┘
                     │  spawn('pi --mode rpc')
  ┌──────────────────▼──────────────────┐
  │      pi binary — external           │
  └─────────────────────────────────────┘
```

---

## Renderer layer

### Zustand stores

| Store | Responsibility |
|-------|---------------|
| `chatStore` | Active messages, streaming state, current session ID |
| `sessionStore` | Session list, active session, sidebar grouping |
| `modelStore` | Available models, current model selection |
| `settingsStore` | Theme, steering mode, auto-compaction, thinking level |
| `commandsStore` | Available slash commands fetched from pi |
| `packageStore` | Installed extension packages |
| `permissionStore` | Queue of `permission_request` events awaiting user approval |

### React screens and routing

The app uses a `NavContext`-based router. The active screen is a discriminated union (`Screen` type) stored in context. Screens are rendered by a `switch` in `App.tsx`.

Available screens: `chat`, `onboarding`, `tree`, `model`, `packages`, `ext-detail`, `prompts`, `context`, `theme`, `share`, `inspect`, `steering`, `features`, `settings`, `help`, `git-status`.

### rpcClient.ts

`src/lib/rpcClient.ts` exposes typed wrappers around `window.pi?.send()`. Every wrapper function accepts strongly-typed arguments that match the `PiCommand` union and returns `Promise<void> | undefined`. The `undefined` return signals that the browser mode is active (no `window.pi`).

---

## Preload bridge

`electron/preload.ts` uses Electron's `contextBridge.exposeInMainWorld('pi', ...)` to expose the `window.pi` API surface to the renderer. This is the only bridge between the untrusted renderer and the privileged main process.

**`PiAPI` interface fields:**

| Field | Type | Description |
|-------|------|-------------|
| `isElectron` | `boolean` | Always `true` in Electron mode |
| `send` | `(cmd: PiCommand) => Promise<void>` | Send RPC command to pi |
| `abort` | `() => Promise<void>` | Abort current run |
| `onEvent` | `(handler) => Unsubscribe` | Subscribe to pi events |
| `getState` | `() => Promise<PiState>` | Get pi process status |
| `fs` | `{ readFile, writeFile, listDir, exists }` | Scoped filesystem access |
| `pkg` | `{ install, uninstall, update }` | Extension package management |
| `session` | `{ list, read, rename, delete }` | Session file management |
| `app` | `{ getVersion, getCwd, quit }` | Electron app control |
| `git` | `{ status, readGitignore, appendGitignore }` | Git integration |
| `onNavigate` | `(handler) => Unsubscribe` | App-menu navigation events |
| `onOverlay` | `(handler) => Unsubscribe` | App-menu overlay events |

All components must guard access with `window.pi?.` — `window.pi` is `undefined` in browser/dev mode.

---

## Main-process IPC layer (ipc.ts)

`electron/ipc.ts` registers all `ipcMain.handle()` listeners via `registerIpcHandlers()`.

**Security:** `isPathAllowed(p)` gates all filesystem IPC to `~/.pi` and `process.cwd()`. Any path outside this scope is rejected with an `Error`.

**`getRepoRoot()`** uses `git rev-parse --show-toplevel` to find the actual repo root, which may diverge from `process.cwd()` in production `.app` bundles where the working directory is inside the app package.

### IPC channel catalogue

| Channel | Direction | Description |
|---------|-----------|-------------|
| `pi:send` | renderer→main | Write JSON command to pi stdin |
| `pi:state` | renderer→main | Return `PiProcessManager.getStatus()` |
| `pi:abort` | renderer→main | Call `piManager.abort()` |
| `pi:event` | main→renderer | Forward JSONL events from pi stdout |
| `pi:navigate` | main→renderer | App-menu navigation commands |
| `pi:overlay` | main→renderer | App-menu overlay commands |
| `fs:readFile` | renderer→main | Read file (path-scoped) |
| `fs:writeFile` | renderer→main | Write file (path-scoped) |
| `fs:listDir` | renderer→main | List directory (path-scoped) |
| `fs:exists` | renderer→main | Check existence (path-scoped) |
| `pi:pkgExec` | renderer→main | install / uninstall / update package |
| `session:list` | renderer→main | Walk `PI_SESSIONS_DIR` |
| `session:read` | renderer→main | Parse JSONL session file |
| `session:rename` | renderer→main | Patch name in first session line |
| `session:delete` | renderer→main | `fs.unlink` session file |
| `git:status` | renderer→main | Run `git status --porcelain`, classify entries |
| `git:readGitignore` | renderer→main | Read repo-root `.gitignore` |
| `git:appendGitignore` | renderer→main | Append patterns to `.gitignore` |
| `app:version` | renderer→main | `app.getVersion()` |
| `app:cwd` | renderer→main | `process.cwd()` |
| `app:quit` | renderer→main | `app.quit()` |

---

## Pi process manager (piProcess.ts)

`electron/piProcess.ts` manages the `pi --mode rpc` child process.

**Lifecycle:**
1. `start()` — discovers the pi binary; sets `available = true`; calls `spawnProcess()`
2. `spawnProcess()` — spawns `pi --mode rpc` with `stdio: pipe`; attaches stdout/stderr listeners; wires the exit handler
3. Exit handler — if the process exits while `available = true`, schedules a restart after a 2-second backoff
4. `stop()` — sets `available = false`; sends `SIGTERM`; no auto-restart

**`JsonlReader`** uses `Buffer.concat` + `Buffer.indexOf(0x0a)` to split stdout into JSONL lines. This avoids Node's `readline` which splits on U+2028/U+2029 (which can appear legitimately in JSON string values).

**State flags:**

| Check | Meaning |
|-------|---------|
| `available` | Binary was found at startup |
| `!!this.proc` | Process is currently spawned |
| `isAvailable()` | `available && !!this.proc` — safe to call `send()` |

**`abort()` vs `stop()`:**

| Method | Signal | Behaviour |
|--------|--------|-----------|
| `abort()` | `SIGINT` | Cancel current task; auto-restart fires if `available` is true |
| `stop()` | `SIGTERM` | Permanent shutdown; no auto-restart |

---

## Binary discovery (findPiBinary)

Four-step ordered strategy for locating the `pi` executable when the app launches from Finder or Spotlight (where `PATH` is stripped to `/usr/bin:/bin:/usr/sbin:/sbin`):

| Step | Method | Why |
|------|--------|-----|
| 1 | Static path candidates (Homebrew, `~/.local/bin`, `~/.cargo/bin`, `~/.volta/bin`, `~/bin`) | Sub-millisecond, no shell spawn |
| 2 | nvm filesystem scan (`~/.nvm/versions/node/*/bin/pi`) | Works without sourcing `nvm.sh`; covers all installed Node versions |
| 3 | Source `nvm.sh` explicitly via `zsh`/`bash` (non-login, non-interactive) | Handles nvm without a TTY or `-i` flag |
| 4 | Login-shell PATH via `zsh -l -c 'command -v pi'` | Last resort for Volta, fnm, mise, asdf |

Step 3 single-quotes the `source` command to prevent word-splitting on paths with spaces. `findViaNvmShell` returns `null` early if the `nvm.sh` path contains a single quote.

---

## Data flow

```
User types → Enter
  → chatStore.addMessage()
  → rpc.sendPrompt(message)
  → window.pi.send({ type: 'prompt', message })
  → ipcRenderer.invoke('pi:send', cmd)
  → ipcMain handler
  → piManager.send(cmd) → stdin write (JSON + '\n')
  → pi binary
  → stdout JSONL line
  → JsonlReader.feed(chunk) → parsed event
  → webContents.send('pi:event', event)
  → window.pi.onEvent callback
  → eventHandler(event)
  → chatStore update
  → React re-render
```
