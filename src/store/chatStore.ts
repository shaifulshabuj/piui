import { create } from 'zustand'
import type { Message, ToolCallData } from '../types'

interface UsageStats {
  tokens: number
  cost: number
}

interface ChatState {
  messages: Message[]
  toolCalls: ToolCallData[]
  isStreaming: boolean
  streamingId: string | null
  usage: UsageStats
  sendPrompt: (text: string) => void
  startAssistantMessage: (id: string) => void
  appendDelta: (id: string, text: string) => void
  finalizeMessage: (id: string) => void
  addToolCall: (tc: Omit<ToolCallData, 'expanded'>) => void
  updateToolCall: (id: string, update: Partial<ToolCallData>) => void
  updateUsage: (u: Partial<UsageStats>) => void
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 'u1',
    role: 'user',
    content:
      'Look at SessionStore.loadSession — it occasionally crashes when opening an old session. Find the cause and fix it; the schema migration already exists in migrate.ts.',
  },
  {
    id: 'a1',
    role: 'assistant',
    content:
      "Looking at SessionStore.loadSession — it returns the raw JSON tree without validation, so a missing file silently produces undefined downstream. I'll add a typed error and route old schemas through the migrator we already have.",
  },
]

export const useChatStore = create<ChatState>((set, get) => ({
  messages: MOCK_MESSAGES,
  toolCalls: [],
  isStreaming: false,
  streamingId: null,
  usage: { tokens: 14200, cost: 0.084 },

  sendPrompt: (text: string) => {
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text }
    set((s) => ({ messages: [...s.messages, userMsg] }))

    if (window.pi) {
      window.pi.send({ type: 'prompt', message: text })
    } else {
      // Mock streaming response in browser/dev mode
      const id = `a-${Date.now()}`
      get().startAssistantMessage(id)
      const words =
        'This is a mock pi response. In Electron mode, real responses stream here from pi --mode rpc.'.split(
          ' '
        )
      let i = 0
      const tick = setInterval(() => {
        if (i < words.length) {
          get().appendDelta(id, (i === 0 ? '' : ' ') + words[i++])
        } else {
          clearInterval(tick)
          get().finalizeMessage(id)
        }
      }, 80)
    }
  },

  startAssistantMessage: (id: string) => {
    const msg: Message = { id, role: 'assistant', content: '', streaming: true }
    set((s) => ({
      messages: [...s.messages, msg],
      isStreaming: true,
      streamingId: id,
    }))
  },

  appendDelta: (id: string, text: string) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + text } : m
      ),
    }))
  },

  finalizeMessage: (id: string) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, streaming: false } : m
      ),
      isStreaming: false,
      streamingId: null,
    }))
  },

  addToolCall: (tc) => {
    set((s) => ({ toolCalls: [...s.toolCalls, { ...tc, expanded: false }] }))
  },

  updateToolCall: (id: string, update: Partial<ToolCallData>) => {
    set((s) => ({
      toolCalls: s.toolCalls.map((tc) =>
        tc.id === id ? { ...tc, ...update } : tc
      ),
    }))
  },

  updateUsage: (u: Partial<UsageStats>) => {
    set((s) => ({ usage: { ...s.usage, ...u } }))
  },
}))
