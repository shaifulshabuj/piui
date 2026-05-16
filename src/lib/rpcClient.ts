// Typed wrappers around window.pi.send() that match pi's RPC command set
import type { ThinkingLevel } from '../types'

type PiCommand =
  | { type: 'prompt'; message: string; sessionId?: string }
  | { type: 'steer'; message: string }
  | { type: 'follow_up'; message: string }
  | { type: 'abort' }
  | { type: 'new_session'; model?: string }
  | { type: 'get_state' }
  | { type: 'get_messages'; sessionId?: string }
  | { type: 'set_model'; model: string }
  | { type: 'get_available_models' }
  | { type: 'cycle_model' }
  | { type: 'set_thinking_level'; level: ThinkingLevel }
  | { type: 'cycle_thinking_level' }
  | { type: 'set_steering_mode'; mode: 'all' | 'one-at-a-time' }
  | { type: 'set_follow_up_mode'; mode: 'all' | 'one-at-a-time' }
  | { type: 'compact'; customInstructions?: string }
  | { type: 'export_html'; outputPath?: string }
  | { type: 'switch_session'; sessionPath: string }
  | { type: 'fork'; entryId: string }
  | { type: 'clone' }
  | { type: 'get_fork_messages' }
  | { type: 'set_session_name'; name: string }
  | { type: 'get_commands' }
  | { type: 'get_session_stats' }
  | { type: 'set_auto_compaction'; enabled: boolean }

function send(cmd: PiCommand): Promise<void> | undefined {
  return window.pi?.send(cmd)
}

export const rpc = {
  sendPrompt: (message: string, sessionId?: string) =>
    send({ type: 'prompt', message, sessionId }),
  steer: (message: string) => send({ type: 'steer', message }),
  followUp: (message: string) => send({ type: 'follow_up', message }),
  abort: () => send({ type: 'abort' }),
  newSession: (model?: string) => send({ type: 'new_session', model }),
  getMessages: (sessionId?: string) => send({ type: 'get_messages', sessionId }),
  setModel: (model: string) => send({ type: 'set_model', model }),
  getAvailableModels: () => send({ type: 'get_available_models' }),
  cycleModel: () => send({ type: 'cycle_model' }),
  getState: () => window.pi?.getState(),
  setThinkingLevel: (level: ThinkingLevel) => send({ type: 'set_thinking_level', level }),
  cycleThinkingLevel: () => send({ type: 'cycle_thinking_level' }),
  setSteeringMode: (mode: 'all' | 'one-at-a-time') => send({ type: 'set_steering_mode', mode }),
  setFollowUpMode: (mode: 'all' | 'one-at-a-time') => send({ type: 'set_follow_up_mode', mode }),
  compact: (customInstructions?: string) => send({ type: 'compact', customInstructions }),
  exportHtml: (outputPath?: string) => send({ type: 'export_html', outputPath }),
  switchSession: (sessionPath: string) => send({ type: 'switch_session', sessionPath }),
  fork: (entryId: string) => send({ type: 'fork', entryId }),
  clone: () => send({ type: 'clone' }),
  getForkMessages: () => send({ type: 'get_fork_messages' }),
  setSessionName: (name: string) => send({ type: 'set_session_name', name }),
  getCommands: () => send({ type: 'get_commands' }),
  getSessionStats: () => send({ type: 'get_session_stats' }),
  setAutoCompaction: (enabled: boolean) => send({ type: 'set_auto_compaction', enabled }),
}
