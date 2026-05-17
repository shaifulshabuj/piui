import { create } from 'zustand'
import type { Session } from '../types'
import { rpc } from '../lib/rpcClient'

interface SessionState {
  sessions: Session[]
  currentSessionId: string | null
  loadSessions: () => Promise<void>
  setCurrentSession: (id: string, filePath?: string) => void
  renameSession: (id: string, name: string) => Promise<void>
  deleteSession: (id: string) => Promise<void>
}

const MOCK_SESSIONS: Session[] = [
  { id: 's1', title: 'pi ui design system', active: true, group: 'today' },
  { id: 's2', title: 'refactor session store', group: 'today' },
  { id: 's3', title: 'debug auth race', group: 'today' },
  { id: 's4', title: 'rpc protocol notes', dim: true, group: 'yesterday' },
  { id: 's5', title: 'theme: solarized port', dim: true, group: 'yesterday' },
  { id: 's6', title: 'benchmark gpt-5 vs sonnet', dim: true, group: 'yesterday' },
  { id: 's7', title: 'onboarding copy', dim: true, group: 'last-week' },
  { id: 's8', title: 'package: pi-doom review', dim: true, group: 'last-week' },
]

function guessGroup(index: number): Session['group'] {
  if (index < 3) return 'today'
  if (index < 6) return 'yesterday'
  return 'last-week'
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: MOCK_SESSIONS,
  currentSessionId: 's1',

  loadSessions: async () => {
    if (!window.pi?.session) return
    try {
      const metas = await window.pi.session.list()
      const sessions: Session[] = metas.map((m) => ({
        id: m.id,
        filePath: m.filePath,
        title: m.title,
        group: m.group,
      }))
      if (sessions.length > 0) set({ sessions })
    } catch {
      // Fall back to listDir approach if session:list is unavailable
      if (!window.pi?.fs) return
      try {
        const entries = await window.pi.fs.listDir('agent/sessions')
        const sessions: Session[] = entries
          .filter((e) => !e.isDir && e.name.endsWith('.jsonl'))
          .map((e, i) => ({
            id: e.name.replace('.jsonl', ''),
            title: e.name.replace('.jsonl', '').replace(/-/g, ' '),
            group: guessGroup(i),
          }))
        if (sessions.length > 0) set({ sessions })
      } catch {
        // Keep mock sessions on error (pi dir may not exist yet)
      }
    }
  },

  setCurrentSession: (id: string, filePath?: string) => {
    set({ currentSessionId: id })
    if (filePath) rpc.switchSession(filePath)
  },

  renameSession: async (id: string, name: string) => {
    if (!name.trim()) return
    const session = get().sessions.find((s) => s.id === id)
    if (!session?.filePath) return
    await window.pi?.session?.rename(session.filePath, name)
    rpc.setSessionName(name)
    set((s) => ({
      sessions: s.sessions.map((s2) => s2.id === id ? { ...s2, title: name } : s2),
    }))
  },

  deleteSession: async (id: string) => {
    const session = get().sessions.find((s) => s.id === id)
    if (!session?.filePath) return
    await window.pi?.session?.delete(session.filePath)
    set((s) => ({
      sessions: s.sessions.filter((s2) => s2.id !== id),
      currentSessionId: s.currentSessionId === id ? null : s.currentSessionId,
    }))
  },
}))
