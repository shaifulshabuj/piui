import { useChatStore } from '../store/chatStore'
import { useModelStore } from '../store/modelStore'
import { usePermissionStore } from '../store/permissionStore'
import { useCommandsStore } from '../store/commandsStore'
import type { PermissionRequest } from '../types'

// Subscribes to pi:event IPC events and dispatches to Zustand stores.
// Returns a cleanup function so callers can unsubscribe.
// Safe to call repeatedly — returns undefined if pi is not available.
export function setupEventHandler(): (() => void) | undefined {
  if (!window.pi) return undefined

  const cleanup = window.pi.onEvent((raw: object) => {
    const e = raw as { type: string; [key: string]: unknown }
    const chat = useChatStore.getState()
    const model = useModelStore.getState()
    const commands = useCommandsStore.getState()

    switch (e.type) {
      case 'message_start':
        chat.startAssistantMessage(e.id as string)
        break
      case 'message_update': {
        // Delta is in message.content array; accumulate text_delta items
        const msg = e.message as { id: string; content: Array<{ type: string; text?: string }> } | undefined
        if (msg) {
          const deltaText = (msg.content ?? [])
            .filter((c) => c.type === 'text_delta')
            .map((c) => c.text ?? '')
            .join('')
          if (deltaText) chat.appendDelta(msg.id, deltaText)
        }
        break
      }
      case 'message_end':
        chat.finalizeMessage(e.id as string)
        break
      case 'tool_execution_start':
        chat.addToolCall({
          id: e.toolExecutionId as string,
          tool: e.name as string,
          args: JSON.stringify(e.input ?? {}),
          status: 'run',
        })
        break
      case 'tool_execution_update':
        chat.updateToolCall(e.toolExecutionId as string, {
          output: e.output as string | undefined,
        })
        break
      case 'tool_execution_end':
        chat.updateToolCall(e.toolExecutionId as string, {
          status: e.error ? 'err' : 'ok',
          output: e.output as string | undefined,
        })
        break
      case 'queue_update':
        chat.setQueueCounts(
          e.steeringCount as number ?? 0,
          e.followUpCount as number ?? 0
        )
        break
      case 'compaction_start':
        chat.setCompacting(true)
        break
      case 'compaction_end':
        chat.setCompacting(false)
        break
      case 'auto_retry_start':
        chat.setRetrying(true, e.attempt as number ?? 1)
        break
      case 'auto_retry_end':
        chat.setRetrying(false, 0)
        break
      case 'agent_end':
        chat.setStreaming(false)
        break
      case 'extension_error':
        chat.addError(e.error as string)
        break
      case 'permission_request': {
        const req = e as unknown as PermissionRequest & { type: string }
        usePermissionStore.getState().setRequest({
          id: req.id,
          tool: req.tool,
          description: req.description,
          command: req.command,
          level: req.level,
        })
        window.dispatchEvent(new CustomEvent('pi:permission-request'))
        break
      }
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
      case 'response': {
        // Handle RPC responses dispatched back as events
        const cmd = e.command as string | undefined
        if (cmd === 'get_commands') {
          const data = e.data as { commands?: Array<{name:string;description?:string;source?:string;location?:string;path?:string}> } | undefined
          if (data?.commands) {
            commands.setCommands(
              data.commands.map((c) => ({
                name: c.name,
                description: c.description,
                source: (c.source ?? 'extension') as 'extension' | 'prompt' | 'skill',
                location: c.location as 'user' | 'project' | 'path' | undefined,
                path: c.path,
              }))
            )
          }
        } else if (cmd === 'get_session_stats') {
          const data = e.data as Record<string, unknown> | undefined
          if (data) {
            chat.setSessionStats({
              title: data.title as string | undefined,
              messages: data.messages as number | undefined,
              toolCalls: data.toolCalls as number | undefined,
              tokens: data.tokens as number | undefined,
              cost: data.cost as number | undefined,
              model: data.model as string | undefined,
              duration: data.duration as string | undefined,
              created: data.created as string | undefined,
            })
          }
        } else if (cmd === 'get_state') {
          const data = e.data as { sessionFile?: string } | undefined
          if (data?.sessionFile) {
            chat.setSessionFile(data.sessionFile)
          }
        }
        break
      }
    }
  })

  return cleanup
}
