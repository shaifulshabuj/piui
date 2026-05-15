import { T, F } from '../tokens';
import { Pill, Kbd } from '../components/primitives';
import { useNav } from '../context/NavContext';

const COMMANDS = [
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
  { cmd: '/reload', desc: 'Reload AGENTS.md context files', category: 'session' },
  { cmd: '/theme', desc: 'Open theme customizer', category: 'settings' },
  { cmd: '/packages', desc: 'Browse and manage packages', category: 'settings' },
  { cmd: '/prompts', desc: 'Manage prompt templates', category: 'settings' },
  { cmd: '/inspect', desc: 'Inspect last tool call', category: 'debug' },
  { cmd: '/tree', desc: 'View session tree navigator', category: 'debug' },
];

const categoryColor: Record<string, string> = {
  git: '#8fb86a', planning: '#f0a45a', review: '#5baaed',
  code: '#c79bd6', session: '#fbbd23', settings: '#f0a45a', debug: '#e05c5c',
};

export function CommandPalette() {
  const { closeOverlay, navigate } = useNav();

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
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          borderBottom: `1px solid ${T.border}`,
        }}>
          <span style={{ fontFamily: F.mono, fontSize: 16, color: T.pi }}>/</span>
          <span style={{ fontFamily: F.mono, fontSize: 13, color: T.text, flex: 1 }}>
            <span style={{
              display: 'inline-block', width: 7, height: 14, background: T.pi,
              verticalAlign: 'text-bottom', animation: 'pi-blink 1s steps(2) infinite',
            }} />
          </span>
          <Kbd>↑↓</Kbd>
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>navigate</span>
          <Kbd>↵</Kbd>
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>run</span>
          <Kbd>esc</Kbd>
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>close</span>
        </div>

        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {COMMANDS.map((item, i) => (
            <div
              key={item.cmd}
              onClick={() => handleSelect(item.cmd)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px',
                borderBottom: `1px solid ${T.borderDim}`, cursor: 'pointer',
                background: i === 0 ? T.bgElev : 'transparent',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = T.bgElev; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i === 0 ? T.bgElev : 'transparent'; }}
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
          <span>{COMMANDS.length} commands · type to filter</span>
          <div style={{ flex: 1 }} />
          <span>from packages, built-ins, and prompt templates</span>
        </div>
      </div>
    </div>
  );
}
