import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('pi', {
  isElectron: true,

  send: (cmd: object) => ipcRenderer.invoke('pi:send', cmd),

  onEvent: (cb: (event: object) => void) => {
    const handler = (_: Electron.IpcRendererEvent, event: object) => cb(event)
    ipcRenderer.on('pi:event', handler)
    return () => ipcRenderer.off('pi:event', handler)
  },

  getState: () => ipcRenderer.invoke('pi:state'),

  fs: {
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', path, content),
    listDir: (path: string) => ipcRenderer.invoke('fs:listDir', path),
    exists: (path: string) => ipcRenderer.invoke('fs:exists', path),
  },

  pkg: {
    install: (pkgId: string) => ipcRenderer.invoke('pi:pkgExec', 'install', pkgId),
    uninstall: (pkgId: string) => ipcRenderer.invoke('pi:pkgExec', 'uninstall', pkgId),
  },

  app: {
    getVersion: () => ipcRenderer.invoke('app:version'),
    getCwd: () => ipcRenderer.invoke('app:cwd'),
    quit: () => ipcRenderer.invoke('app:quit'),
  },

  onNavigate: (cb: (screen: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, screen: string) => cb(screen)
    ipcRenderer.on('app:navigate', handler)
    return () => ipcRenderer.off('app:navigate', handler)
  },

  onOverlay: (cb: (overlay: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, overlay: string) => cb(overlay)
    ipcRenderer.on('app:overlay', handler)
    return () => ipcRenderer.off('app:overlay', handler)
  },
})
