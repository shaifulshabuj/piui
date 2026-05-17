import { ipcMain, app } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { spawn } from 'child_process'
import { piManager } from './piProcess'
import { classifyEntry, parseGitPorcelain } from '../src/lib/gitClassifier'
import type { GitStatusResult } from '../src/types'

const PI_HOME = path.join(os.homedir(), '.pi')

const ALLOWED_ROOTS = [
  PI_HOME,
  path.join(os.homedir(), '.config', 'pi'),
  process.cwd(),
]

function isPathAllowed(filePath: string): boolean {
  const resolved = path.resolve(filePath)
  return ALLOWED_ROOTS.some(
    (root) => resolved === root || resolved.startsWith(root + path.sep)
  )
}

/** Resolve a relative path against ~/.pi */
function resolvePiPath(relOrAbs: string): string {
  if (path.isAbsolute(relOrAbs)) return relOrAbs
  return path.join(PI_HOME, relOrAbs)
}

/** Resolve the git repo root — more reliable than process.cwd() in production .app bundles */
function getRepoRoot(): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('git', ['rev-parse', '--show-toplevel'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let out = ''
    let err = ''
    proc.stdout?.on('data', (d: Buffer) => { out += d.toString() })
    proc.stderr?.on('data', (d: Buffer) => { err += d.toString() })
    proc.on('close', (code) => {
      if (code === 0) resolve(out.trim())
      else reject(new Error(err.trim() || 'Not a git repository'))
    })
    proc.on('error', reject)
  })
}

export function registerIpcHandlers() {
  // pi RPC
  ipcMain.handle('pi:send', async (_, cmd: object) => {
    piManager.send(cmd)
  })

  ipcMain.handle('pi:state', async () => {
    return piManager.getStatus()
  })

  // Filesystem — scoped to ~/.pi and project dir only
  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    const resolved = resolvePiPath(filePath)
    if (!isPathAllowed(resolved)) throw new Error(`Access denied: ${filePath}`)
    return fs.readFile(resolved, 'utf8')
  })

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    const resolved = resolvePiPath(filePath)
    if (!isPathAllowed(resolved)) throw new Error(`Access denied: ${filePath}`)
    await fs.mkdir(path.dirname(resolved), { recursive: true })
    await fs.writeFile(resolved, content, 'utf8')
  })

  ipcMain.handle('fs:listDir', async (_, dirPath: string) => {
    const resolved = resolvePiPath(dirPath)
    if (!isPathAllowed(resolved)) throw new Error(`Access denied: ${dirPath}`)
    try {
      const entries = await fs.readdir(resolved, { withFileTypes: true })
      return entries.map((e) => ({ name: e.name, isDir: e.isDirectory() }))
    } catch {
      return []
    }
  })

  ipcMain.handle('fs:exists', async (_, filePath: string) => {
    const resolved = resolvePiPath(filePath)
    if (!isPathAllowed(resolved)) return false
    try {
      await fs.access(resolved)
      return true
    } catch {
      return false
    }
  })

  // pi package management — spawn `pi install <pkg>` or `pi uninstall <pkg>`
  ipcMain.handle('pi:pkgExec', async (_, subCmd: 'install' | 'uninstall' | 'update', pkgId: string) => {
    if (!pkgId.match(/^[a-zA-Z0-9@/._:-]{1,200}$/)) throw new Error('Invalid package id')
    // 'update' reinstalls via 'pi install' which fetches the latest version
    const piCmd = subCmd === 'update' ? 'install' : subCmd
    return new Promise<string>((resolve, reject) => {
      const proc = spawn(piManager.getBinaryPath() ?? 'pi', [piCmd, pkgId], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      })
      let out = ''
      proc.stdout?.on('data', (d: Buffer) => { out += d.toString() })
      proc.stderr?.on('data', (d: Buffer) => { out += d.toString() })
      proc.on('close', (code) => {
        if (code === 0) resolve(out.trim())
        else reject(new Error(out.trim() || `pi ${subCmd} exited ${code}`))
      })
      proc.on('error', reject)
    })
  })

  // App
  ipcMain.handle('pi:abort', async () => { piManager.abort() })
  ipcMain.handle('app:version', async () => app.getVersion())
  ipcMain.handle('app:cwd', async () => process.cwd())
  ipcMain.handle('app:quit', async () => app.quit())

  const PI_SESSIONS_DIR = path.join(PI_HOME, 'agent', 'sessions')

  interface SessionMeta {
    id: string
    filePath: string
    title: string
    group: 'today' | 'yesterday' | 'last-week'
    timestamp: number
  }

  function getGroup(ts: number): 'today' | 'yesterday' | 'last-week' {
    const diff = Date.now() - ts
    const day = 86_400_000
    if (diff < day) return 'today'
    if (diff < 2 * day) return 'yesterday'
    return 'last-week'
  }

  ipcMain.handle('session:list', async (): Promise<SessionMeta[]> => {
    if (!isPathAllowed(PI_SESSIONS_DIR)) throw new Error('Access denied')
    const results: SessionMeta[] = []
    async function walk(dir: string) {
      let entries: fs.Dirent[]
      try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return }
      for (const e of entries) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) { await walk(full); continue }
        if (!e.name.endsWith('.jsonl')) continue
        if (!isPathAllowed(full)) continue
        try {
          const stat = await fs.stat(full)
          const timestamp = stat.mtime.getTime()
          const rawId = path.basename(e.name, '.jsonl')
          let id = rawId
          let name: string | undefined
          // Read only the first line for metadata
          const handle = await fs.open(full, 'r')
          const buf = Buffer.alloc(4096)
          const { bytesRead } = await handle.read(buf, 0, buf.length, 0)
          await handle.close()
          const firstLine = buf.toString('utf8', 0, bytesRead).split(/\r?\n/)[0]
          try {
            const parsed = JSON.parse(firstLine)
            if (parsed.type === 'session') {
              id = parsed.id ?? id
              name = parsed.name
            }
          } catch { /* use filename-based fallback */ }
          results.push({
            id,
            filePath: full,
            title: name ?? id.replace(/-/g, ' '),
            group: getGroup(timestamp),
            timestamp,
          })
        } catch { /* skip unreadable files */ }
      }
    }
    await walk(PI_SESSIONS_DIR)
    results.sort((a, b) => b.timestamp - a.timestamp)
    return results
  })

  ipcMain.handle('session:read', async (_, filePath: string): Promise<object[]> => {
    if (!isPathAllowed(filePath)) throw new Error(`Access denied: ${filePath}`)
    if (!path.resolve(filePath).startsWith(PI_SESSIONS_DIR + path.sep)) throw new Error(`Access denied: ${filePath}`)
    try {
      const content = await fs.readFile(filePath, 'utf8')
      return content.split(/\r?\n/)
        .filter((l) => l.trim())
        .flatMap((l) => { try { return [JSON.parse(l)] } catch { return [] } })
    } catch {
      return []
    }
  })

  ipcMain.handle('session:rename', async (_, filePath: string, name: string): Promise<void> => {
    if (!isPathAllowed(filePath)) throw new Error(`Access denied: ${filePath}`)
    if (!path.resolve(filePath).startsWith(PI_SESSIONS_DIR + path.sep)) throw new Error(`Access denied: ${filePath}`)
    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split(/\r?\n/)
    const idx = lines.findIndex((l) => { try { return JSON.parse(l).type === 'session' } catch { return false } })
    if (idx >= 0) {
      const entry = JSON.parse(lines[idx])
      entry.name = name
      lines[idx] = JSON.stringify(entry)
    } else {
      lines.unshift(JSON.stringify({ type: 'session', name }))
    }
    await fs.writeFile(filePath, lines.join('\n'), 'utf8')
  })

  ipcMain.handle('session:delete', async (_, filePath: string): Promise<void> => {
    if (!isPathAllowed(filePath)) throw new Error(`Access denied: ${filePath}`)
    if (!path.resolve(filePath).startsWith(PI_SESSIONS_DIR + path.sep)) throw new Error(`Access denied: ${filePath}`)
    await fs.unlink(filePath)
  })

  // ── git:status ──────────────────────────────────────────────────────────────
  ipcMain.handle('git:status', async (): Promise<GitStatusResult> => {
    // Resolve the authoritative repo root — process.cwd() may differ from the
    // git root in production .app bundles, so we ask git directly.
    const repoRoot = await getRepoRoot()

    const gitignorePath = path.join(repoRoot, '.gitignore')

    const output = await new Promise<string>((resolve, reject) => {
      const proc = spawn('git', ['status', '--porcelain'], {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      let out = ''
      proc.stdout?.on('data', (d: Buffer) => { out += d.toString() })
      let err = ''
      proc.stderr?.on('data', (d: Buffer) => { err += d.toString() })
      proc.on('close', (code) => {
        if (code === 0 || code === 1) resolve(out)
        else reject(new Error(`git status exited ${code}: ${err}`))
      })
      proc.on('error', reject)
    })

    const rawEntries = parseGitPorcelain(output)
    const entries = rawEntries.map(classifyEntry)

    return { entries, cwd: repoRoot, gitignorePath }
  })

  // ── git:readGitignore ────────────────────────────────────────────────────────
  ipcMain.handle('git:readGitignore', async (): Promise<string> => {
    const repoRoot = await getRepoRoot()
    const gitignorePath = path.join(repoRoot, '.gitignore')
    try {
      return await fs.readFile(gitignorePath, 'utf8')
    } catch {
      return ''
    }
  })

  // ── git:appendGitignore ──────────────────────────────────────────────────────
  ipcMain.handle('git:appendGitignore', async (_, patterns: string[]): Promise<void> => {
    if (!Array.isArray(patterns) || patterns.length === 0) return
    const safePats = patterns
      .map((p) => String(p).trim())
      .filter((p) => p.length > 0 && !p.includes('\0'))
    if (safePats.length === 0) return

    const repoRoot = await getRepoRoot()
    const gitignorePath = path.join(repoRoot, '.gitignore')
    const existing = await fs.readFile(gitignorePath, 'utf8').catch(() => '')
    const existingLines = new Set(existing.split('\n').map((l) => l.trim()))
    const toAdd = safePats.filter((p) => !existingLines.has(p))
    if (toAdd.length === 0) return

    const append = '\n' + toAdd.join('\n') + '\n'
    await fs.appendFile(gitignorePath, append, 'utf8')
  })
}
