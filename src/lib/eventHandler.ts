import { useChatStore } from '../store/chatStore'
import { useModelStore } from '../store/modelStore'

// Subscribes to pi:event IPC events and dispatches to Zustand stores.
// Returns a cleanup function so callers can unsubscribe.
// Safe to call repeatedly — returns undefined if pi is not available.
export function setupEventHandler(): (() => void) | undefined {
  if (!window.pi) return undefined

  const cleanup = window.pi.onEvent((raw: object) => {
    const e = raw as { type: string; [key: string]: unknown }
    const chat = useChatStore.getState()
    const model = useModelStore.getState()

    switch (e.type) {
      case 'message_start':
        chat.startAssistantMessage(e.id as string)
        break
      case 'message_delta':
        chat.appendDelta(e.id as string, e.text as string)
        break
      case 'message_end':
        chat.finalizeMessage(e.id as string)
        break
      case 'tool_call_start':
        chat.addToolCall({
          id: e.id as string,
          tool: e.tool as string,
          args: String(e.args ?? ''),
          status: 'run',
        })
        break
      case 'tool_call_end':
        chat.updateToolCall(e.id as string, {
          status: e.error ? 'err' : 'ok',
          output: e.output as string | undefined,
        })
        break
      case 'usage':
        chat.updateUsage({
          tokens: e.tokens as number,
          cost: e.cost as number,
        })
        break
      case 'model_changed':
        model.setCurrentModel(e.model as string)
        break
      case 'models_list':
        model.setModels(
          e.models as Array<{ id: string; provider: string; name: string }>
        )
        break
    }
  })

  return cleanup
}
