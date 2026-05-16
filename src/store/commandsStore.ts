import { create } from 'zustand'

export interface PiCommandItem {
  name: string;
  description?: string;
  source: 'extension' | 'prompt' | 'skill';
  location?: 'user' | 'project' | 'path';
  path?: string;
}

interface CommandsState {
  commands: PiCommandItem[]
  isLoaded: boolean
  load: () => void
  setCommands: (commands: PiCommandItem[]) => void
}

export const useCommandsStore = create<CommandsState>((set) => ({
  commands: [],
  isLoaded: false,
  load: () => {
    window.pi?.send({ type: 'get_commands' })
  },
  setCommands: (commands) => set({ commands, isLoaded: true }),
}))
