import { create } from 'zustand'
import type { Session } from '../types'

interface SessionState {
  sessions: Session[]
  currentSessionId: string | null
  loadSessions: () => Promise<void>
  setCurrentSession: (id: string) => void
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

export const useSessionStore = create<SessionState>((set) => ({
  sessions: MOCK_SESSIONS,
  currentSessionId: 's1',

  loadSessions: async () => {
    if (!window.pi?.fs) return
    try {
      // Relative paths resolve to ~/.pi/<path> via IPC resolvePiPath
      const entries = await window.pi.fs.listDir('sessions')
      const sessions: Session[] = entries
        .filter((e) => !e.isDir && e.name.endsWith('.json'))
        .map((e, i) => ({
          id: e.name.replace('.json', ''),
          title: e.name.replace('.json', '').replace(/-/g, ' '),
          group: guessGroup(i),
        }))
      if (sessions.length > 0) set({ sessions })
    } catch {
      // Keep mock sessions on error (pi dir may not exist yet)
    }
  },

  setCurrentSession: (id: string) => {
    set({ currentSessionId: id })
  },
}))
