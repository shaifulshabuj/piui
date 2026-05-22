import { spawn } from 'child_process'
import { execSync } from 'child_process'
import type { ChildProcessWithoutNullStreams } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import type { BrowserWindow } from 'electron'

export function isExecutable(p: string): boolean {
  try {
    fs.accessSync(p, fs.constants.X_OK)
    return true
  } catch {
    return false
  }
}

export function discoverNvmBins(nvmDir: string): readonly string[] {
  const versionsDir = path.join(nvmDir, 'versions', 'node')
  try {
    return fs.readdirSync(versionsDir).map(
      (v) => path.join(versionsDir, v, 'bin', 'pi')
    )
  } catch {
    return []
  }
}

export function findViaNvmShell(home: string, nvmDir: string): string | null {
  const nvmSh = path.join(nvmDir, 'nvm.sh')
  if (nvmSh.includes("'")) return null
  // Single-quote the source command to prevent word-splitting on paths with spaces.
  const cmd = `. '${nvmSh}' 2>/dev/null && command -v pi`

  for (const shell of ['/bin/zsh', '/bin/bash'] as const) {
    try {
      if (!isExecutable(shell)) continue
      const result = execSync(`${shell} -c '${cmd}'`, {
        timeout: 3000,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, HOME: home, NVM_DIR: nvmDir },
      })
      const p = result.trim()
      if (p && isExecutable(p)) return p
    } catch {
      // shell unavailable or nvm.sh not found — try next
    }
  }
  return null
}

function findPiBinary(): string | null {
  const home = os.homedir()
  const nvmDir = process.env['NVM_DIR'] ?? path.join(home, '.nvm')

  // 1. Static candidates — no shell spawn, sub-millisecond
  const staticCandidates: readonly string[] = [
    '/opt/homebrew/bin/pi',           // Apple Silicon Homebrew
    '/usr/local/bin/pi',              // Intel Homebrew / manual install
    path.join(home, '.local/bin/pi'),
    path.join(home, '.cargo/bin/pi'),
    path.join(home, 'bin/pi'),
    path.join(home, '.volta/bin/pi'), // Volta
    '/usr/bin/pi',
  ]
  for (const p of staticCandidates) {
    if (isExecutable(p)) return p
  }

  // 2. nvm filesystem scan — no shell spawn, scans all installed node versions
  for (const p of discoverNvmBins(nvmDir)) {
    if (isExecutable(p)) return p
  }

  // 3. Source nvm.sh explicitly — handles nvm without -i flag / TTY issues
  const nvmFound = findViaNvmShell(home, nvmDir)
  if (nvmFound) return nvmFound

  // 4. Login-shell PATH — last resort for other shell managers (homebrew shims, etc.)
  for (const shell of ['/bin/zsh', '/bin/bash'] as const) {
    try {
      if (!isExecutable(shell)) continue
      const result = execSync(`${shell} -l -c 'command -v pi'`, {
        timeout: 5000,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      const p = result.trim()
      if (p && isExecutable(p)) return p
    } catch {
      // shell unavailable or pi not on PATH for this shell
    }
  }

  return null
}

// Buffer-based JSONL reader — correct for multibyte UTF-8 chunk boundaries.
// Never use string.split('\n') or readline because they split on U+2028 / U+2029.
class JsonlReader {
  private buf = Buffer.alloc(0)

  feed(chunk: Buffer): object[] {
    this.buf = Buffer.concat([this.buf, chunk])
    const results: object[] = []
    let idx: number
    while ((idx = this.buf.indexOf(0x0a)) !== -1) {
      const line = this.buf.slice(0, idx).toString('utf8')
      this.buf = this.buf.slice(idx + 1)
      if (line.trim()) {
        try {
          results.push(JSON.parse(line))
        } catch {
          // skip malformed JSONL lines
        }
      }
    }
    return results
  }
}

export class PiProcessManager {
  private proc: ChildProcessWithoutNullStreams | null = null
  private reader = new JsonlReader()
  private window: BrowserWindow | null = null
  private binaryPath: string | null = null
  private available = false
  private restarting = false

  setWindow(win: BrowserWindow) {
    this.window = win
  }

  async start(): Promise<void> {
    this.binaryPath = findPiBinary()
    if (!this.binaryPath) {
      console.warn('[pi] binary not found; UI runs in mock/browser mode')
      return
    }
    this.available = true
    this.spawnProcess()
  }

  private spawnProcess() {
    if (!this.binaryPath || this.restarting) return
    console.log('[pi] spawning', this.binaryPath, '--mode rpc')

    this.proc = spawn(this.binaryPath, ['--mode', 'rpc'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    this.proc.stdout.on('data', (chunk: Buffer) => {
      const events = this.reader.feed(chunk)
      for (const event of events) {
        this.window?.webContents.send('pi:event', event)
      }
    })

    this.proc.stderr.on('data', (d: Buffer) => {
      console.error('[pi stderr]', d.toString().trim())
    })

    this.proc.on('exit', (code, signal) => {
      console.log('[pi] exited', { code, signal })
      this.proc = null
      if (this.available) {
        // Auto-restart with backoff
        this.restarting = true
        setTimeout(() => {
          this.restarting = false
          this.spawnProcess()
        }, 2000)
      }
    })
  }

  send(cmd: object): void {
    if (!this.proc?.stdin.writable) {
      console.warn('[pi] process not running; command dropped:', cmd)
      return
    }
    this.proc.stdin.write(JSON.stringify(cmd) + '\n')
  }

  isAvailable(): boolean {
    return this.available && !!this.proc
  }

  getBinaryPath(): string | null {
    return this.binaryPath
  }

  getStatus() {
    return {
      available: this.available,
      running: !!this.proc,
      binaryPath: this.binaryPath,
    }
  }

  abort(): void {
    // Send SIGINT (Ctrl+C) so pi can finish any in-progress file write before exiting
    this.proc?.kill('SIGINT')
  }

  stop() {
    this.available = false
    this.proc?.kill('SIGTERM')
    this.proc = null
  }
}

export const piManager = new PiProcessManager()
