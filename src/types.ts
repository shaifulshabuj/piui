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
  | 'steering'
  | 'features'
  | 'settings';

export type Overlay = 'command-palette' | 'permission-prompt' | null;

export interface PermissionRequest {
  id: string;
  tool: string;
  description: string;
  command?: string;
  level: 'safe' | 'dangerous' | 'destructive';
}

export interface SessionMeta {
  id: string;
  filePath: string;
  name?: string;
  cwd?: string;
  model?: string;
  createdAt: string;
  messageCount?: number;
}

export interface SessionEntry {
  type: string;
  id?: string;
  parentId?: string;
  role?: 'user' | 'assistant';
  content?: string;
  name?: string;
  label?: string;
  timestamp?: number | string;
  [key: string]: unknown;
}

export type ThinkingLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';

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
  filePath?: string;
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
