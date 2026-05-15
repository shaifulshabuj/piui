// Type declarations for the window.pi API exposed by electron/preload.ts

interface PiAPI {
  isElectron: boolean
  send: (cmd: object) => Promise<void>
  onEvent: (cb: (event: object) => void) => () => void
  getState: () => Promise<{
    available: boolean
    running: boolean
    binaryPath: string | null
  }>
  fs: {
    readFile: (path: string) => Promise<string>
    writeFile: (path: string, content: string) => Promise<void>
    listDir: (path: string) => Promise<Array<{ name: string; isDir: boolean }>>
    exists: (path: string) => Promise<boolean>
  }
  app: {
    getVersion: () => Promise<string>
    quit: () => Promise<void>
  }
  onNavigate: (cb: (screen: string) => void) => () => void
  onOverlay: (cb: (overlay: string) => void) => () => void
}

declare global {
  interface Window {
    pi?: PiAPI
  }
}

export {}
