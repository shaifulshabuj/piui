import { create } from 'zustand'
import type { Model } from '../types'

interface ModelState {
  models: Model[]
  currentModel: string
  isLoading: boolean
  setCurrentModel: (name: string) => void
  setModels: (models: Array<{ id?: string; provider: string; name: string }>) => void
  loadModels: () => void
}

const MOCK_MODELS: Model[] = [
  { provider: 'anthropic', name: 'claude-opus-4-1', ctx: '200k', price: '$15 / $75', fav: true, status: 'ready', tags: ['vision', 'tool'] },
  { provider: 'anthropic', name: 'claude-sonnet-4-5', ctx: '200k', price: '$3 / $15', fav: true, current: true, status: 'ready', tags: ['vision', 'tool'] },
  { provider: 'anthropic', name: 'claude-haiku-4-5', ctx: '200k', price: '$1 / $5', fav: true, status: 'ready', tags: ['vision', 'tool', 'fast'] },
  { provider: 'openai', name: 'gpt-5', ctx: '400k', price: '$5 / $20', fav: true, status: 'ready', tags: ['vision', 'tool'] },
  { provider: 'openai', name: 'gpt-5-mini', ctx: '400k', price: '$0.5 / $2', status: 'ready', tags: ['vision', 'tool'] },
  { provider: 'openai', name: 'o4', ctx: '200k', price: '$15 / $60', fav: true, status: 'ready', tags: ['reasoning'] },
  { provider: 'google', name: 'gemini-2.5-pro', ctx: '2M', price: '$2 / $8', fav: true, status: 'ready', tags: ['vision', 'audio'] },
  { provider: 'google', name: 'gemini-2.5-flash', ctx: '1M', price: '$0.3 / $1', status: 'ready' },
  { provider: 'groq', name: 'llama-4-405b', ctx: '128k', price: '$2 / $4', status: 'rate', tags: ['fast'] },
  { provider: 'cerebras', name: 'qwen-3-coder-480b', ctx: '128k', price: '$1 / $3', status: 'ready', tags: ['fast'] },
  { provider: 'xai', name: 'grok-4', ctx: '256k', price: '$3 / $12', status: 'ready', tags: ['reasoning'] },
  { provider: 'openrouter', name: 'auto', ctx: '—', price: 'passthrough', status: 'ready', tags: ['router'] },
  { provider: 'ollama', name: 'llama-3.3:70b', ctx: '128k', price: 'local · free', status: 'ready', tags: ['local'] },
  { provider: 'ollama', name: 'qwen2.5-coder:32b', ctx: '128k', price: 'local · free', status: 'ready', tags: ['local', 'fast'] },
  { provider: 'huggingface', name: 'kimi-k2', ctx: '200k', price: '$1 / $4', status: 'none' },
]

export const useModelStore = create<ModelState>((set) => ({
  models: MOCK_MODELS,
  currentModel: 'claude-sonnet-4-5',
  isLoading: false,

  setCurrentModel: (name: string) => {
    set((s) => ({
      models: s.models.map((m) => ({ ...m, current: m.name === name })),
      currentModel: name,
    }))
    window.pi?.send({ type: 'set_model', model: name })
  },

  setModels: (incoming) => {
    set((s) => {
      // Merge live model list with existing local metadata (fav, price, ctx)
      const local = new Map(s.models.map((m) => [`${m.provider}/${m.name}`, m]))
      const merged: Model[] = incoming.map((m) => {
        const existing = local.get(`${m.provider}/${m.name}`)
        return {
          provider: m.provider,
          name: m.name,
          ctx: existing?.ctx ?? '?',
          price: existing?.price ?? '?',
          status: existing?.status ?? 'ready',
          fav: existing?.fav,
          current: existing?.current,
          tags: existing?.tags,
        }
      })
      return { models: merged }
    })
  },

  loadModels: () => {
    window.pi?.send({ type: 'get_available_models' })
  },
}))
