import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { piManager } from './piProcess'
import { registerIpcHandlers } from './ipc'
import { buildMenu } from './menu'

app.setName('pi')

let mainWindow: BrowserWindow | null = null

/** electron-vite dev outputs index.js, prod outputs index.cjs — handle both */
function resolvePreload(): string {
  const cjs = join(__dirname, '../preload/index.cjs')
  const js  = join(__dirname, '../preload/index.js')
  if (existsSync(cjs)) return cjs
  if (existsSync(js))  return js
  console.warn('[pi] preload not found at expected paths:', cjs, js)
  return cjs // will fail gracefully with Electron's preload error
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 11 },
    backgroundColor: '#0e0d0b',
    show: false,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error('[pi] renderer failed to load:', code, desc)
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Show window when ready; fallback after 4 s in case ready-to-show is missed
  mainWindow.once('ready-to-show', () => mainWindow!.show())
  setTimeout(() => { if (mainWindow && !mainWindow.isVisible()) mainWindow.show() }, 4000)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  piManager.setWindow(mainWindow)
  buildMenu(mainWindow)

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(async () => {
  registerIpcHandlers()
  await createWindow()
  await piManager.start()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  piManager.stop()
  if (process.platform !== 'darwin') app.quit()
})
