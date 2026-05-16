import { create } from 'zustand'

interface SettingsState {
  theme: string
  steeringMode: 'all' | 'one-at-a-time'
  followUpMode: 'all' | 'one-at-a-time'
  autoCompaction: boolean
  setTheme: (theme: string) => void
  setSteeringMode: (mode: 'all' | 'one-at-a-time') => void
  setFollowUpMode: (mode: 'all' | 'one-at-a-time') => void
  setAutoCompaction: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'pi-dark',
  steeringMode: 'all',
  followUpMode: 'all',
  autoCompaction: true,
  setTheme: (theme) => set({ theme }),
  setSteeringMode: (mode) => set({ steeringMode: mode }),
  setFollowUpMode: (mode) => set({ followUpMode: mode }),
  setAutoCompaction: (v) => set({ autoCompaction: v }),
}))
