import { create } from 'zustand'

export interface Package {
  id: string
  name: string
  author: string
  kind: 'extension' | 'skill' | 'prompt' | 'theme' | 'bundle'
  summary: string
  version: string
  downloads: string
  mark: string
  installed: boolean
  featured?: boolean
}

const MOCK_PACKAGES: Package[] = [
  { id: 'npm:@termdraw/pi', name: '@termdraw/pi', author: 'benvinegar', kind: 'extension', mark: '✎', version: '1.4.2', downloads: '4.1k', installed: true, summary: 'Draw inside the terminal — sketch flow diagrams, sketches, and ASCII art with mouse + tablet input.' },
  { id: 'npm:@earendil/plan-mode', name: '@earendil/plan-mode', author: 'earendil', kind: 'extension', mark: '◐', version: '2.0.1', downloads: '18.4k', installed: true, featured: true, summary: 'Adds /plan command — pi writes a plan, you approve, it executes. Pauses between phases for review.' },
  { id: 'npm:claude-warm', name: 'claude-warm', author: 'mariozechner', kind: 'theme', mark: '❒', version: '0.6.0', downloads: '2.7k', installed: true, summary: 'Warm amber palette with off-black surfaces. Designed to look good in dim rooms.' },
  { id: 'npm:rust-engineer', name: 'rust-engineer', author: 'badlogic', kind: 'skill', mark: '◧', version: '1.0.4', downloads: '3.2k', installed: true, summary: 'Rust-specific debugging skill: knows cargo, miri, criterion. Loaded on demand when working in Rust projects.' },
  { id: 'npm:pi-doom', name: 'pi-doom', author: 'badlogic', kind: 'bundle', mark: '◉', version: '0.3.1', downloads: '11.8k', installed: false, featured: true, summary: 'DOOM, but pi plays it. Bundle of an extension that pipes frames through the TUI plus a skill that teaches pi WAD strategy.' },
  { id: 'npm:@oss/sub-agents', name: '@oss/sub-agents', author: 'oss', kind: 'extension', mark: '◯', version: '1.2.0', downloads: '9.3k', installed: false, summary: 'Spawn child pi instances from a tool call. Each runs in its own session tree, results stream back to the parent.' },
  { id: 'npm:commit-and-push', name: 'commit-and-push', author: 'mariozechner', kind: 'prompt', mark: '❖', version: '0.4.0', downloads: '6.1k', installed: false, summary: 'The /commit prompt — generates conventional commits from your staged diff with optional emoji, scopes, and ticket refs.' },
  { id: 'npm:permission-gate', name: 'permission-gate', author: 'earendil', kind: 'extension', mark: '🔒', version: '1.1.0', downloads: '5.7k', installed: false, summary: 'Confirm-before-execute popup for dangerous tools. Allow-list paths, command prefixes, and tool names.' },
]

interface PackageState {
  packages: Package[]
  installing: Set<string>
  loadPackages: () => Promise<void>
  install: (id: string) => Promise<void>
  uninstall: (id: string) => Promise<void>
  update: (id: string) => Promise<void>
}

export const usePackageStore = create<PackageState>((set) => ({
  packages: MOCK_PACKAGES,
  installing: new Set(),

  async loadPackages() {
    if (!window.pi?.fs) return
    try {
      const entries = await window.pi.fs.listDir('agent/packages')
      const installedNames = new Set(entries.filter((e) => e.isDir).map((e) => e.name))
      set((s) => ({
        packages: s.packages.map((p) => ({
          ...p,
          installed: installedNames.has(p.name),
        })),
      }))
    } catch {
      /* best-effort — fall back to mock data */
    }
  },

  async install(id: string) {
    set((s) => ({ installing: new Set([...s.installing, id]) }))
    try {
      if (window.pi?.pkg) {
        await window.pi.pkg.install(id)
      }
      set((s) => ({
        packages: s.packages.map((p) => p.id === id ? { ...p, installed: true } : p),
      }))
    } finally {
      set((s) => {
        const next = new Set(s.installing)
        next.delete(id)
        return { installing: next }
      })
    }
  },

  async uninstall(id: string) {
    set((s) => ({ installing: new Set([...s.installing, id]) }))
    try {
      if (window.pi?.pkg) {
        await window.pi.pkg.uninstall(id)
      }
      set((s) => ({
        packages: s.packages.map((p) => p.id === id ? { ...p, installed: false } : p),
      }))
    } finally {
      set((s) => {
        const next = new Set(s.installing)
        next.delete(id)
        return { installing: next }
      })
    }
  },

  async update(id: string) {
    set((s) => ({ installing: new Set([...s.installing, id]) }))
    try {
      if (window.pi?.pkg) {
        await window.pi.pkg.update(id)
      }
    } finally {
      set((s) => {
        const next = new Set(s.installing)
        next.delete(id)
        return { installing: next }
      })
    }
  },
}))
