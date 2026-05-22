# RPC Protocol

## Transport

piui communicates with the `pi` binary using **RPC mode** — a JSONL-over-stdio transport.

| Stream | Direction | Content |
|--------|-----------|---------|
| stdin | piui → pi | One JSON command object per line |
| stdout | pi → piui | One JSON event object per line |
| stderr | pi → piui | Diagnostic text; logged to Electron console |

Spawn command:

```
pi --mode rpc
```

with `stdio: ['pipe', 'pipe', 'pipe']`.

---

## Commands (piui → pi)

Full table derived from the `PiCommand` union in `src/lib/rpcClient.ts`:

| Command type | Required fields | Optional fields | Description |
|---|---|---|---|
| `prompt` | `message: string` | `sessionId?: string` | Send user message |
| `steer` | `message: string` | | Steer mid-run |
| `follow_up` | `message: string` | | Follow-up to last turn |
| `abort` | | | Cancel current run (SIGINT equivalent) |
| `new_session` | | `model?: string` | Start a fresh session |
| `get_state` | | | Request current runtime state |
| `get_messages` | | `sessionId?: string` | Retrieve message history |
| `set_model` | `model: string` | | Switch active model |
| `get_available_models` | | | List available models |
| `cycle_model` | | | Rotate through favourite models |
| `set_thinking_level` | `level: ThinkingLevel` | | Change reasoning budget |
| `cycle_thinking_level` | | | Rotate thinking level |
| `set_steering_mode` | `mode: 'all' \| 'one-at-a-time'` | | Configure steering delivery |
| `set_follow_up_mode` | `mode: 'all' \| 'one-at-a-time'` | | Configure follow-up delivery |
| `compact` | | `customInstructions?: string` | Compact session history |
| `export_html` | | `outputPath?: string` | Export session to HTML |
| `switch_session` | `sessionPath: string` | | Load a different session file |
| `fork` | `entryId: string` | | Fork session at a message node |
| `clone` | | | Clone current session |
| `get_fork_messages` | | | Messages from a forked session |
| `set_session_name` | `name: string` | | Rename current session |
| `get_commands` | | | List available slash commands |
| `get_session_stats` | | | Token/message statistics |
| `set_auto_compaction` | `enabled: boolean` | | Toggle auto-compact |

### ThinkingLevel values

`'off'` | `'minimal'` | `'low'` | `'medium'` | `'high'` | `'xhigh'`

### Example command

```json
{"type":"prompt","message":"refactor src/api.ts to use async/await"}
```

---

## Events (pi → piui)

Events are forwarded from the main process to all renderer windows via `webContents.send('pi:event', event)`. The renderer registers handlers via `window.pi.onEvent(handler)`.

| Event type | Description |
|---|---|
| `text_delta` | Incremental text content from the model |
| `tool_start` | A tool call has been initiated |
| `tool_result` | A tool call completed with its result |
| `error` | An error occurred during processing |
| `session` | Session metadata update (id, name, path) |
| `done` | Current turn is complete |
| `permission_request` | User approval required for a tool action |
| `state` | Pi process state update |
| `models` | Available models list |

### Example event

```json
{"type":"text_delta","content":"Here is the refactored code:"}
```

---

## IPC channels

| Channel | Direction | Handler | Description |
|---|---|---|---|
| `pi:send` | renderer→main | `ipcMain.handle('pi:send')` | Write command to pi stdin |
| `pi:state` | renderer→main | `ipcMain.handle('pi:state')` | Get `PiProcessManager.getStatus()` |
| `pi:event` | main→renderer | `webContents.send` | Forward JSONL events from pi stdout |
| `pi:navigate` | main→renderer | `webContents.send` | App-menu navigation |
| `pi:overlay` | main→renderer | `webContents.send` | App-menu overlay trigger |
| `pi:abort` | renderer→main | `ipcMain.handle('pi:abort')` | Call `piManager.abort()` |
| `fs:readFile` | renderer→main | — | Read file (path-scoped to `~/.pi` + cwd) |
| `fs:writeFile` | renderer→main | — | Write file (path-scoped) |
| `fs:listDir` | renderer→main | — | List directory (path-scoped) |
| `fs:exists` | renderer→main | — | Check file existence (path-scoped) |
| `pi:pkgExec` | renderer→main | — | install / uninstall / update package |
| `session:list` | renderer→main | — | Walk `PI_SESSIONS_DIR` |
| `session:read` | renderer→main | — | Parse JSONL session file |
| `session:rename` | renderer→main | — | Patch name in first session line |
| `session:delete` | renderer→main | — | `fs.unlink` session file |
| `git:status` | renderer→main | — | Run `git status --porcelain`, classify entries |
| `git:readGitignore` | renderer→main | — | Read repo-root `.gitignore` |
| `git:appendGitignore` | renderer→main | — | Append patterns to `.gitignore` |
| `app:version` | renderer→main | — | `app.getVersion()` |
| `app:cwd` | renderer→main | — | `process.cwd()` |
| `app:quit` | renderer→main | — | `app.quit()` |

---

## Path security

All `fs:*` IPC handlers call `isPathAllowed(p)` before performing any filesystem operation. This function restricts access to:

- `~/.pi` — pi's configuration and session directory
- `process.cwd()` — the working directory of the Electron process

Any path outside these roots is rejected with an `Error('Path not allowed')`.
