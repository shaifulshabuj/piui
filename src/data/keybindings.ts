export interface Keybinding {
  readonly keys: string;
  readonly action: string;
}

export const KEYBINDINGS: readonly Keybinding[] = [
  { keys: 'Ctrl+/', action: 'Command palette' },
  { keys: 'Ctrl+L', action: 'Switch model' },
  { keys: 'Ctrl+P', action: 'Cycle favorite models' },
  { keys: 'Ctrl+C', action: 'Abort current run' },
  { keys: 'Ctrl+Enter', action: 'Send message' },
  { keys: 'Shift+Enter', action: 'New line in composer' },
  { keys: 'Escape', action: 'Close overlay / cancel' },
  { keys: 'Ctrl+S', action: 'Save context file' },
  { keys: '↑↓', action: 'Navigate session tree' },
];
