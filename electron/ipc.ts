import { ipcMain, app } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { spawn } from 'child_process'
import { piManager } from './piProcess'

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
  ipcMain.handle('pi:pkgExec', async (_, subCmd: 'install' | 'uninstall', pkgId: string) => {
    if (!pkgId.match(/^[a-zA-Z0-9@/._:-]{1,200}$/)) throw new Error('Invalid package id')
    return new Promise<string>((resolve, reject) => {
      const proc = spawn(piManager.getBinaryPath() ?? 'pi', [subCmd, pkgId], {
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
    name?: string
    cwd?: string
    model?: string
    createdAt: string
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
          // Read only the first line for metadata
          const handle = await fs.open(full, 'r')
          const buf = Buffer.alloc(4096)
          const { bytesRead } = await handle.read(buf, 0, buf.length, 0)
          await handle.close()
          const firstLine = buf.toString('utf8', 0, bytesRead).split('\n')[0]
          let meta: SessionMeta = {
            id: path.basename(e.name, '.jsonl'),
            filePath: full,
            createdAt: stat.mtime.toISOString(),
          }
          try {
            const parsed = JSON.parse(firstLine)
            if (parsed.type === 'session') {
              meta = {
                id: parsed.id ?? meta.id,
                filePath: full,
                name: parsed.name,
                cwd: parsed.cwd,
                model: parsed.model,
                createdAt: parsed.createdAt ?? meta.createdAt,
              }
            }
          } catch { /* use stat-based fallback */ }
          results.push(meta)
        } catch { /* skip unreadable files */ }
      }
    }
    await walk(PI_SESSIONS_DIR)
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return results
  })

  ipcMain.handle('session:read', async (_, filePath: string): Promise<object[]> => {
    if (!isPathAllowed(filePath)) throw new Error(`Access denied: ${filePath}`)
    try {
      const content = await fs.readFile(filePath, 'utf8')
      return content.split('\n')
        .filter((l) => l.trim())
        .flatMap((l) => { try { return [JSON.parse(l)] } catch { return [] } })
    } catch {
      return []
    }
  })

  ipcMain.handle('session:rename', async (_, filePath: string, name: string): Promise<void> => {
    if (!isPathAllowed(filePath)) throw new Error(`Access denied: ${filePath}`)
    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split('\n')
    const idx = lines.findIndex((l) => { try { return JSON.parse(l).type === 'session' } catch { return false } })
    if (idx >= 0) {
      const entry = JSON.parse(lines[idx])
      entry.name = name
      lines[idx] = JSON.stringify(entry)
      await fs.writeFile(filePath, lines.join('\n'), 'utf8')
    }
  })

  ipcMain.handle('session:delete', async (_, filePath: string): Promise<void> => {
    if (!isPathAllowed(filePath)) throw new Error(`Access denied: ${filePath}`)
    await fs.unlink(filePath)
  })
}
