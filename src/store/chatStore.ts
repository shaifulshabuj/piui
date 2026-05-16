import { create } from 'zustand'
import type { Message, ToolCallData } from '../types'

interface UsageStats {
  tokens: number
  cost: number
}

interface SessionStats {
  title?: string
  messages?: number
  toolCalls?: number
  tokens?: number
  cost?: number
  model?: string
  duration?: string
  created?: string
}

interface ChatState {
  messages: Message[]
  toolCalls: ToolCallData[]
  isStreaming: boolean
  streamingId: string | null
  usage: UsageStats
  steeringQueue: string[]
  followUpQueue: string[]
  isCompacting: boolean
  isRetrying: boolean
  retryAttempt: number
  pendingSteeringCount: number
  pendingFollowUpCount: number
  sessionFile: string
  currentEntryId: string | null
  sessionStats: SessionStats | null
  sendPrompt: (text: string) => void
  startAssistantMessage: (id: string) => void
  appendDelta: (id: string, text: string) => void
  finalizeMessage: (id: string) => void
  addToolCall: (tc: Omit<ToolCallData, 'expanded'>) => void
  updateToolCall: (id: string, update: Partial<ToolCallData>) => void
  updateUsage: (u: Partial<UsageStats>) => void
  setQueueCounts: (steering: number, followUp: number) => void
  setCompacting: (v: boolean) => void
  setRetrying: (v: boolean, attempt: number) => void
  addError: (msg: string) => void
  setStreaming: (v: boolean) => void
  setSessionFile: (filePath: string) => void
  setSessionStats: (stats: SessionStats) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  toolCalls: [],
  isStreaming: false,
  streamingId: null,
  usage: { tokens: 0, cost: 0 },
  steeringQueue: [],
  followUpQueue: [],
  isCompacting: false,
  isRetrying: false,
  retryAttempt: 0,
  pendingSteeringCount: 0,
  pendingFollowUpCount: 0,
  sessionFile: '',
  currentEntryId: null,
  sessionStats: null,

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

  setQueueCounts: (steering: number, followUp: number) => {
    set({ pendingSteeringCount: steering, pendingFollowUpCount: followUp })
  },

  setCompacting: (v: boolean) => {
    set({ isCompacting: v })
  },

  setRetrying: (v: boolean, attempt: number) => {
    set({ isRetrying: v, retryAttempt: attempt })
  },

  addError: (msg: string) => {
    const errMsg: Message = {
      id: `err-${Date.now()}`,
      role: 'assistant',
      content: '⚠ ' + msg,
    }
    set((s) => ({ messages: [...s.messages, errMsg] }))
  },

  setStreaming: (v: boolean) => {
    set((s) => {
      if (!v && s.streamingId) {
        return {
          isStreaming: false,
          streamingId: null,
          messages: s.messages.map((m) =>
            m.id === s.streamingId ? { ...m, streaming: false } : m
          ),
        }
      }
      return { isStreaming: v }
    })
  },

  setSessionFile: (filePath: string) => {
    set({ sessionFile: filePath })
  },

  setSessionStats: (stats) => {
    set({ sessionStats: stats })
  },
}))
