// Typed wrappers around window.pi.send() that match pi's RPC command set

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
}
