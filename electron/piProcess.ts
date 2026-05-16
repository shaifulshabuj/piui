import { spawn } from 'child_process'
import { execSync } from 'child_process'
import type { ChildProcessWithoutNullStreams } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import type { BrowserWindow } from 'electron'

function findPiBinary(): string | null {
  const home = os.homedir()
  const candidates = [
    '/opt/homebrew/bin/pi',        // Apple Silicon Homebrew
    '/usr/local/bin/pi',           // Intel Homebrew / manual install
    path.join(home, '.local/bin/pi'),
    path.join(home, '.cargo/bin/pi'),
    path.join(home, 'bin/pi'),
    '/usr/bin/pi',
  ]

  for (const p of candidates) {
    try {
      fs.accessSync(p, fs.constants.X_OK)
      return p
    } catch {
      // not found at this path, try next
    }
  }

  // Fall back to querying the user's login shell (needed when launched from Finder)
  for (const shell of ['/bin/zsh', '/bin/bash']) {
    try {
      const result = execSync(`${shell} -l -c 'command -v pi'`, {
        timeout: 5000,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      const p = result.trim()
      if (p && p.length > 0) return p
    } catch {
      // shell not available or pi not in PATH for this shell
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
