import { ipcMain, app } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { piManager } from './piProcess'

const ALLOWED_ROOTS = [
  path.join(os.homedir(), '.pi'),
  path.join(os.homedir(), '.config', 'pi'),
  process.cwd(),
]

function isPathAllowed(filePath: string): boolean {
  const resolved = path.resolve(filePath)
  return ALLOWED_ROOTS.some(
    (root) => resolved === root || resolved.startsWith(root + path.sep)
  )
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
    if (!isPathAllowed(filePath)) throw new Error(`Access denied: ${filePath}`)
    return fs.readFile(path.resolve(filePath), 'utf8')
  })

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    if (!isPathAllowed(filePath)) throw new Error(`Access denied: ${filePath}`)
    await fs.writeFile(path.resolve(filePath), content, 'utf8')
  })

  ipcMain.handle('fs:listDir', async (_, dirPath: string) => {
    if (!isPathAllowed(dirPath)) throw new Error(`Access denied: ${dirPath}`)
    const entries = await fs.readdir(path.resolve(dirPath), { withFileTypes: true })
    return entries.map((e) => ({ name: e.name, isDir: e.isDirectory() }))
  })

  ipcMain.handle('fs:exists', async (_, filePath: string) => {
    if (!isPathAllowed(filePath)) return false
    try {
      await fs.access(path.resolve(filePath))
      return true
    } catch {
      return false
    }
  })

  // App
  ipcMain.handle('app:version', async () => app.getVersion())
  ipcMain.handle('app:quit', async () => app.quit())
}
