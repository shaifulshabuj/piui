export type Screen =
  | 'chat'
  | 'onboarding'
  | 'tree'
  | 'model'
  | 'packages'
  | 'ext-detail'
  | 'prompts'
  | 'context'
  | 'theme'
  | 'share'
  | 'inspect'
  | 'steering';

export type Overlay = 'command-palette' | 'permission-prompt' | null;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

export interface ToolCallData {
  id: string;
  tool: string;
  args: string;
  status: 'ok' | 'run' | 'err' | 'pending';
  output?: string;
  expanded?: boolean;
}

export interface Session {
  id: string;
  title: string;
  active?: boolean;
  dim?: boolean;
  group: 'today' | 'yesterday' | 'last-week';
}

export interface Model {
  provider: string;
  name: string;
  ctx: string;
  price: string;
  fav?: boolean;
  current?: boolean;
  status: 'ready' | 'rate' | 'none';
  tags?: string[];
}
