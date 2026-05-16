import { useState, useMemo, useEffect, useRef } from 'react';
import { T, F } from '../tokens';
import { Pill, Kbd } from '../components/primitives';
import { useNav } from '../context/NavContext';
import { useCommandsStore } from '../store/commandsStore';
import { rpc } from '../lib/rpcClient';

const BUILTIN_COMMANDS = [
  { cmd: '/commit', desc: 'Generate a conventional commit from staged diff', category: 'git' },
  { cmd: '/pr', desc: 'Write a GitHub pull request description', category: 'git' },
  { cmd: '/plan', desc: 'Create a multi-step execution plan', category: 'planning' },
  { cmd: '/review', desc: 'Code review with actionable suggestions', category: 'review' },
  { cmd: '/test', desc: 'Generate test cases for selected code', category: 'code' },
  { cmd: '/docs', desc: 'Add JSDoc / docstrings to functions', category: 'code' },
  { cmd: '/explain', desc: 'Explain code or error in plain language', category: 'code' },
  { cmd: '/refactor', desc: 'Refactor selected code with reasoning', category: 'code' },
  { cmd: '/share', desc: 'Share session as GitHub Gist', category: 'session' },
  { cmd: '/model', desc: 'Switch AI model', category: 'session' },
  { cmd: '/context', desc: 'Open context file editor', category: 'session' },
  { cmd: '/steer', desc: 'Inject steering message into current run', category: 'session' },
  { cmd: '/abort', desc: 'Abort current run', category: 'session' },
  { cmd: '/new', desc: 'Start new session', category: 'session' },
  { cmd: '/compact', desc: 'Compact session context', category: 'session' },
  { cmd: '/theme', desc: 'Open theme customizer', category: 'settings' },
  { cmd: '/packages', desc: 'Browse and manage packages', category: 'settings' },
  { cmd: '/prompts', desc: 'Manage prompt templates', category: 'settings' },
  { cmd: '/features', desc: 'View feature status dashboard', category: 'settings' },
  { cmd: '/settings', desc: 'Open settings', category: 'settings' },
  { cmd: '/inspect', desc: 'Inspect last tool call', category: 'debug' },
  { cmd: '/tree', desc: 'View session tree navigator', category: 'debug' },
];

const categoryColor: Record<string, string> = {
  git: '#8fb86a', planning: '#f0a45a', review: '#5baaed',
  code: '#c79bd6', session: '#fbbd23', settings: '#f0a45a', debug: '#e05c5c',
  extension: '#5baaed', prompt: '#c79bd6', skill: '#8fb86a',
};

export function CommandPalette() {
  const { closeOverlay, navigate } = useNav();
  const { commands: liveCommands, load } = useCommandsStore();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
    inputRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allCommands = useMemo(() => {
    const live = liveCommands.map((c) => ({
      cmd: `/${c.name}`,
      desc: c.description ?? '',
      category: c.source,
    }));
    return [...BUILTIN_COMMANDS, ...live];
  }, [liveCommands]);

  const filtered = useMemo(() => {
    if (!query) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (c) => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleSelect = (cmd: string) => {
    closeOverlay();
    if (cmd === '/model') navigate('model');
    else if (cmd === '/share') navigate('share');
    else if (cmd === '/context') navigate('context');
    else if (cmd === '/tree') navigate('tree');
    else if (cmd === '/theme') navigate('theme');
    else if (cmd === '/packages') navigate('packages');
    else if (cmd === '/prompts') navigate('prompts');
    else if (cmd === '/inspect') navigate('inspect');
    else if (cmd === '/steer') navigate('steering');
    else if (cmd === '/features') navigate('features');
    else if (cmd === '/settings') navigate('settings');
    else if (cmd === '/abort') { window.pi?.abort(); }
    else if (cmd === '/compact') { rpc.compact(); }
    else if (cmd === '/new') { rpc.newSession(); }
    else {
      // Send as prompt to pi
      rpc.sendPrompt(cmd);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (filtered[selectedIdx]) handleSelect(filtered[selectedIdx].cmd);
    } else if (e.key === 'Escape') {
      closeOverlay();
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 100, paddingTop: 80,
      }}
      onClick={closeOverlay}
    >
      <div
        style={{
          width: 580, background: T.bgPanel, borderRadius: 8, overflow: 'hidden',
          border: `1px solid ${T.borderHi}`, boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${T.piBg}`,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          borderBottom: `1px solid ${T.border}`,
        }}>
          <span style={{ fontFamily: F.mono, fontSize: 16, color: T.pi }}>/</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="type to filter commands…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: F.mono, fontSize: 13, color: T.text,
            }}
            autoFocus
          />
          <Kbd>↑↓</Kbd>
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>navigate</span>
          <Kbd>↵</Kbd>
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>run</span>
          <Kbd>esc</Kbd>
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>close</span>
        </div>

        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '16px', fontFamily: F.mono, fontSize: 12, color: T.textFaint }}>
              No commands match "{query}"
            </div>
          )}
          {filtered.map((item, i) => (
            <div
              key={`${item.cmd}-${i}`}
              onClick={() => handleSelect(item.cmd)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px',
                borderBottom: `1px solid ${T.borderDim}`, cursor: 'pointer',
                background: i === selectedIdx ? T.bgElev : 'transparent',
              }}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.pi, width: 120, flexShrink: 0 }}>{item.cmd}</span>
              <span style={{ fontFamily: F.sans, fontSize: 12.5, color: T.textDim, flex: 1 }}>{item.desc}</span>
              <Pill color={categoryColor[item.category] || T.textFaint} bg="transparent" border={T.border}>
                {item.category}
              </Pill>
            </div>
          ))}
        </div>

        <div style={{
          padding: '8px 16px', borderTop: `1px solid ${T.border}`, background: T.bg,
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: F.mono, fontSize: 10, color: T.textFaint,
        }}>
          <span>{filtered.length} commands</span>
          <div style={{ flex: 1 }} />
          <span>from packages, built-ins, and prompt templates</span>
        </div>
      </div>
    </div>
  );
}
