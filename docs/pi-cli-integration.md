# pi CLI Integration

## Transport layer

piui connects to the `pi` binary using **RPC mode** — a JSON-over-stdio transport.
The spawn command is:

```
pi --mode rpc
```

with `stdio: ['pipe', 'pipe', 'pipe']` so all three streams are piped.

- **stdin** — piui writes newline-delimited JSON commands to send instructions to pi.
- **stdout** — pi writes newline-delimited JSON events; piui reads and dispatches them.
- **stderr** — pi writes diagnostic/error text; piui logs it to the Electron console.

---

## Process lifecycle

`PiProcessManager` (in `electron/piProcess.ts`) owns the child process:

1. **`start()`** — searches for the pi binary; if found, sets `available = true` and calls `spawnProcess()`.
2. **`spawnProcess()`** — spawns `pi --mode rpc`, attaches stdout/stderr listeners, wires the exit handler.
3. **Exit handler** — if the process exits unexpectedly while `available` is still `true`, piui auto-restarts after a **2-second backoff**.
4. **`stop()`** — sets `available = false` and sends `SIGTERM`; no auto-restart occurs.

---

## JSONL protocol

All messages on both streams are **newline-delimited JSON** (JSONL / JSON Lines).

### Why `Buffer.concat` + `indexOf(0x0a)` instead of `readline`?

Node's `readline` module and `string.split('\n')` both split on the Unicode line
terminators U+2028 (Line Separator) and U+2029 (Paragraph Separator), which can
appear inside JSON string values. Because `pi` may embed these characters in content
fields, piui uses a `Buffer`-level JSONL reader:

```typescript
class JsonlReader {
  private buf = Buffer.alloc(0)

  feed(chunk: Buffer): object[] {
    this.buf = Buffer.concat([this.buf, chunk])
    const results: object[] = []
    let idx: number
    while ((idx = this.buf.indexOf(0x0a)) !== -1) {  // 0x0a = ASCII newline
      const line = this.buf.slice(0, idx).toString('utf8')
      this.buf = this.buf.slice(idx + 1)
      if (line.trim()) {
        try { results.push(JSON.parse(line)) } catch { /* skip malformed */ }
      }
    }
    return results
  }
}
```

`Buffer.indexOf(0x0a)` scans raw bytes — U+2028 (`0xe2 0x80 0xa8`) and U+2029
(`0xe2 0x80 0xa9`) never contain `0x0a`, so they are never treated as line endings.

---

## Sending commands

To send a command from the renderer, call `window.pi.send(cmd)`. The Electron
main process writes `JSON.stringify(cmd) + '\n'` to the child's stdin:

```typescript
send(cmd: object): void {
  if (!this.proc?.stdin.writable) return
  this.proc.stdin.write(JSON.stringify(cmd) + '\n')
}
```

If the process is not running, the command is silently dropped (logged to console).

---

## Auto-restart

When `pi` exits unexpectedly (non-zero exit code or signal) while `available` is
`true`, piui schedules a restart:

```
exit → restarting = true → setTimeout(2000) → restarting = false → spawnProcess()
```

The 2-second backoff prevents a tight restart loop if the binary is crashing on
startup (e.g., missing provider credentials).

---

## IPC channels (Electron)

| Channel | Direction | Description |
|---------|-----------|-------------|
| `pi:event` | main → renderer | JSONL events forwarded from pi stdout |
| `pi:send` | renderer → main | Commands to write to pi stdin |
| `pi:navigate` | main → renderer | App-menu navigation commands |
| `pi:overlay` | main → renderer | App-menu overlay commands |

The renderer registers handlers via `window.pi.onEvent`, `window.pi.onNavigate`,
and `window.pi.onOverlay` (exposed through Electron's `contextBridge`).

---

## `isAvailable()` vs `available` flag vs running proc

| Check | Meaning |
|-------|---------|
| `available` | Binary was found at startup; manager will auto-restart on crash |
| `!!this.proc` | Process is currently spawned (may be starting up) |
| `isAvailable()` | `available && !!this.proc` — safe to call `send()` |
| `getStatus()` | Returns all three values for diagnostics |

---

## `abort()` vs `stop()`

| Method | Signal | Behaviour |
|--------|--------|-----------|
| `abort()` | `SIGINT` | Equivalent to Ctrl+C; pi finishes any in-progress file write before exiting gracefully. Auto-restart fires if `available` is still `true`. |
| `stop()` | `SIGTERM` | Sets `available = false` first, then kills the process. No auto-restart. |

Use `abort()` to cancel a running task; use `stop()` to shut down pi permanently
(e.g., app quit).

---

## Binary discovery

`findPiBinary()` in `electron/piProcess.ts` uses a four-step ordered strategy
to locate the `pi` executable when the app launches from Finder or Spotlight
(where `PATH` may not include nvm-managed binaries):

| Step | Method | Why |
|------|--------|-----|
| 1 | Static candidates (`/opt/homebrew/bin/pi`, `~/.local/bin/pi`, etc.) | Sub-millisecond, no shell spawn |
| 2 | nvm filesystem scan (`~/.nvm/versions/node/*/bin/pi`) | Works without sourcing nvm.sh; covers all installed Node versions |
| 3 | Source `nvm.sh` explicitly via `/bin/zsh` or `/bin/bash` | Handles nvm without a login shell or TTY (`-i` flag) |
| 4 | Login-shell PATH via `zsh -l -c 'command -v pi'` | Last-resort for other version managers (Volta, fnm, etc.) |

Step 3 single-quotes the `source` command to prevent word-splitting on paths with spaces.
`findViaNvmShell` returns `null` early if `nvm.sh` path contains a single quote.
