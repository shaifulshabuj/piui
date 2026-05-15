import { Menu, app } from 'electron'
import type { BrowserWindow } from 'electron'

export function buildMenu(mainWindow: BrowserWindow) {
  const nav = (screen: string) => mainWindow.webContents.send('app:navigate', screen)
  const overlay = (name: string) => mainWindow.webContents.send('app:overlay', name)

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        { label: 'New Session', accelerator: 'CmdOrCtrl+N', click: () => nav('chat') },
        { label: 'Session Tree', accelerator: 'CmdOrCtrl+T', click: () => nav('tree') },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Model Picker', accelerator: 'Ctrl+L', click: () => nav('model') },
        { label: 'Command Palette', accelerator: 'CmdOrCtrl+K', click: () => overlay('command-palette') },
        { label: 'Settings / Theme', accelerator: 'CmdOrCtrl+,', click: () => nav('theme') },
        { type: 'separator' },
        { label: 'Packages', click: () => nav('packages') },
        { label: 'Prompt Templates', click: () => nav('prompts') },
        { label: 'Context Editor', click: () => nav('context') },
        { label: 'Share & Export', click: () => nav('share') },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'reload' },
        { role: 'togglefullscreen' },
      ],
    },
    { label: 'Window', role: 'windowMenu' },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
