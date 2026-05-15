import { create } from 'zustand'

interface SettingsState {
  theme: string
  setTheme: (theme: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'pi-dark',
  setTheme: (theme) => set({ theme }),
}))
