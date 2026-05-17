export type FeatureImpl = 'implemented' | 'partial' | 'not-yet' | 'not-possible';

export interface PiFeature {
  id: string;
  category: string;
  name: string;
  description: string;
  status: FeatureImpl;
  notes?: string;
}

export const PI_FEATURES: PiFeature[] = [
  // Chat
  { id: 'chat-prompt', category: 'Chat', name: 'Send prompt', description: 'Send a user message to pi', status: 'implemented' },
  { id: 'chat-stream', category: 'Chat', name: 'Streaming response', description: 'Real-time streaming of assistant text', status: 'implemented' },
  { id: 'chat-tool-calls', category: 'Chat', name: 'Tool call display', description: 'Show read/bash/edit/write/grep/find/ls calls inline', status: 'implemented' },
  { id: 'chat-abort', category: 'Chat', name: 'Abort (Ctrl+C)', description: 'Send SIGINT to stop current operation', status: 'implemented' },
  { id: 'chat-steer', category: 'Chat', name: 'Steer mid-task', description: 'Inject steering message during run', status: 'implemented' },
  { id: 'chat-followup', category: 'Chat', name: 'Follow-up queue', description: 'Queue follow-up message after agent finishes', status: 'implemented' },
  { id: 'chat-multiline', category: 'Chat', name: 'Multi-line input', description: 'Shift+Enter for newlines in composer', status: 'implemented' },
  { id: 'chat-file-ref', category: 'Chat', name: 'File reference (@file)', description: 'Fuzzy-search project files with @ in editor', status: 'not-possible', notes: 'Terminal-specific feature (fuzzy overlay in TUI)' },
  { id: 'chat-path-complete', category: 'Chat', name: 'Tab path completion', description: 'Tab to complete file paths in editor', status: 'not-possible', notes: 'Terminal readline feature' },
  { id: 'chat-image-paste', category: 'Chat', name: 'Image paste', description: 'Paste images via Ctrl+V into context', status: 'not-possible', notes: 'Terminal drag-and-drop; RPC images field available but no file picker in UI' },
  { id: 'chat-shell-bang', category: 'Chat', name: 'Shell command (!cmd)', description: 'Run shell command and send output to model', status: 'not-possible', notes: 'Terminal-specific shorthand; use bash RPC instead' },
  { id: 'chat-ext-editor', category: 'Chat', name: 'External editor (Ctrl+G)', description: 'Open $VISUAL/$EDITOR to compose message', status: 'not-possible', notes: 'Terminal feature; not applicable to GUI textarea' },
  // Model
  { id: 'model-switch', category: 'Model', name: 'Switch model (/model)', description: 'Pick any configured provider/model', status: 'implemented' },
  { id: 'model-cycle', category: 'Model', name: 'Cycle favorites (Ctrl+P)', description: 'Cycle through starred models', status: 'implemented' },
  { id: 'model-thinking', category: 'Model', name: 'Thinking level', description: 'Set off/minimal/low/medium/high/xhigh', status: 'implemented' },
  { id: 'model-scoped', category: 'Model', name: 'Scoped model list', description: 'Enable/disable models for Ctrl+P cycling', status: 'not-yet' },
  // Session
  { id: 'session-new', category: 'Session', name: 'New session (/new)', description: 'Start a fresh conversation', status: 'implemented' },
  { id: 'session-resume', category: 'Session', name: 'Resume session (/resume)', description: 'Pick and continue a past session', status: 'partial', notes: 'Session list loads from FS via session:list IPC; click switches session via RPC' },
  { id: 'session-tree', category: 'Session', name: 'Session tree (/tree)', description: 'Navigate tree of all turns and branches', status: 'partial', notes: 'Screen with real JSONL parsing; mock data fallback when no session loaded' },
  { id: 'session-fork', category: 'Session', name: 'Fork (/fork)', description: 'Create new session from earlier user message', status: 'partial', notes: 'Fork button in session tree; requires selecting a node first' },
  { id: 'session-clone', category: 'Session', name: 'Clone (/clone)', description: 'Duplicate active branch into new session', status: 'implemented' },
  { id: 'session-name', category: 'Session', name: 'Name session (/name)', description: 'Set human-readable display name', status: 'implemented', notes: 'Double-click rename in sidebar calls session:rename IPC + rpc.setSessionName' },
  { id: 'session-compact', category: 'Session', name: 'Compaction (/compact)', description: 'Summarize older context to free tokens', status: 'implemented', notes: 'Compact button opens modal with optional custom instructions' },
  { id: 'session-export', category: 'Session', name: 'Export HTML (/export)', description: 'Export session to self-contained HTML', status: 'partial', notes: 'Export HTML/JSON buttons in Share screen; file save path depends on pi subprocess' },
  { id: 'session-share', category: 'Session', name: 'Share (/share)', description: 'Upload to GitHub Gist with shareable URL', status: 'partial', notes: 'Share button calls /share prompt; URL extracted from assistant response' },
  { id: 'session-info', category: 'Session', name: 'Session info (/session)', description: 'Show file, ID, messages, tokens, cost', status: 'implemented', notes: 'get_session_stats fetched on ShareExport mount; displayed in session info panel' },
  // Context
  { id: 'context-agents-md', category: 'Context', name: 'AGENTS.md editor', description: 'Read/write AGENTS.md context files', status: 'implemented' },
  { id: 'context-system-md', category: 'Context', name: 'SYSTEM.md editor', description: 'Read/write SYSTEM.md prompt override', status: 'implemented' },
  { id: 'context-reload', category: 'Context', name: 'Reload (/reload)', description: 'Reload extensions, skills, and context files', status: 'implemented', notes: 'Reload button in ContextEditor sends /reload prompt command' },
  // Packages
  { id: 'pkg-install', category: 'Packages', name: 'Install package', description: 'pi install npm:/git:/local:/url:', status: 'implemented' },
  { id: 'pkg-uninstall', category: 'Packages', name: 'Remove package', description: 'pi remove <package>', status: 'implemented' },
  { id: 'pkg-list', category: 'Packages', name: 'List packages', description: 'Show installed packages with metadata', status: 'partial', notes: 'Reads from ~/.pi/agent/packages; falls back to mock data' },
  { id: 'pkg-update', category: 'Packages', name: 'Update packages', description: 'pi update [source|self|pi]', status: 'implemented', notes: 'Update button on installed packages; maps to pi install (reinstall)' },
  { id: 'pkg-config', category: 'Packages', name: 'Configure package', description: 'Enable/disable per-package resources', status: 'not-yet' },
  // Customization
  { id: 'custom-themes', category: 'Customization', name: 'Theme gallery', description: 'Browse and apply built-in and installed themes', status: 'partial', notes: 'Gallery shown; load installed themes from FS' },
  { id: 'custom-prompts', category: 'Customization', name: 'Prompt templates', description: 'List, create, and expand /template commands', status: 'implemented', notes: 'Loads live data from get_commands RPC; built-in + custom prompt tabs' },
  { id: 'custom-extensions', category: 'Customization', name: 'Extension detail', description: 'View extension README, tools, commands', status: 'partial', notes: 'Detail screen receives extId param; looks up from commandsStore; falls back to plan-mode hardcoded' },
  { id: 'custom-skills', category: 'Customization', name: 'Skills', description: 'List loaded skills from get_commands (source=skill)', status: 'partial', notes: 'get_commands returns skills, shown in PromptTemplates tab; no dedicated detail view' },
  // Settings
  { id: 'settings-thinking', category: 'Settings', name: 'Thinking level', description: 'off / minimal / low / medium / high / xhigh', status: 'implemented' },
  { id: 'settings-steering-mode', category: 'Settings', name: 'Steering mode', description: 'all / one-at-a-time delivery', status: 'implemented' },
  { id: 'settings-followup-mode', category: 'Settings', name: 'Follow-up mode', description: 'all / one-at-a-time delivery', status: 'implemented' },
  { id: 'settings-auto-compact', category: 'Settings', name: 'Auto-compaction', description: 'Enable/disable automatic context compaction', status: 'implemented' },
  { id: 'settings-keybindings', category: 'Settings', name: 'Keybindings (/hotkeys)', description: 'Show keyboard shortcuts reference', status: 'implemented', notes: 'Static keyboard shortcuts reference section in Settings' },
  // Permission
  { id: 'perm-prompt', category: 'Permissions', name: 'Permission prompt', description: 'Allow/deny dangerous tool executions', status: 'implemented', notes: 'UI and event listener wired in App.tsx; shows overlay on permission_request event' },
  // Provider auth
  { id: 'auth-login', category: 'Auth', name: 'Provider login (/login)', description: 'OAuth or API key authentication', status: 'partial', notes: 'Onboarding sends /login <provider> prompt; OAuth handled in pi subprocess' },
  { id: 'auth-logout', category: 'Auth', name: 'Provider logout (/logout)', description: 'Remove OAuth/key credentials', status: 'not-yet' },
  // Modes
  { id: 'mode-interactive', category: 'Mode', name: 'Interactive (RPC)', description: 'Full chat UI over pi --mode rpc', status: 'implemented' },
  { id: 'mode-print', category: 'Mode', name: 'Print/JSON mode', description: 'pi -p "query" one-shot output', status: 'not-possible', notes: 'piui is an interactive UI; -p mode is terminal/script only' },
  { id: 'mode-sdk', category: 'Mode', name: 'SDK mode', description: 'Embed pi in Node.js apps', status: 'not-possible', notes: 'piui uses subprocess RPC instead of direct SDK' },
];
