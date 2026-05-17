import { useState } from 'react';
import { T, F } from '../tokens';
import { Kbd } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { KEYBINDINGS } from '../data/keybindings';

type HelpTab = 'quick-start' | 'cli-reference' | 'keyboard' | 'faq';

interface HelpTabBarProps {
  active: HelpTab;
  onSelect: (t: HelpTab) => void;
}

function HelpTabBar({ active, onSelect }: HelpTabBarProps): React.ReactElement {
  const tabs: { id: HelpTab; label: string }[] = [
    { id: 'quick-start', label: 'Quick Start' },
    { id: 'cli-reference', label: 'CLI Reference' },
    { id: 'keyboard', label: 'Keyboard' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <div style={{
      display: 'flex', gap: 2,
      borderBottom: `1px solid ${T.border}`,
      padding: '0 24px',
      background: T.bgPanel,
    }}>
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          style={{
            padding: '9px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${active === id ? T.pi : 'transparent'}`,
            color: active === id ? T.pi : T.textMuted,
            fontFamily: F.mono,
            fontSize: 11.5,
            cursor: 'pointer',
            marginBottom: -1,
          }}
          aria-selected={active === id}
          role="tab"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function CodeBlock({ children }: { children: string }): React.ReactElement {
  return (
    <pre style={{
      fontFamily: F.mono, fontSize: 12, color: T.text,
      background: T.bgInput, border: `1px solid ${T.border}`,
      borderRadius: 5, padding: '10px 14px', margin: '6px 0 14px',
      overflow: 'auto', lineHeight: 1.6,
    }}>
      {children}
    </pre>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{
          fontFamily: F.mono, fontSize: 11, color: T.pi,
          background: T.piBg, border: `1px solid ${T.piBorder}`,
          borderRadius: 3, padding: '1px 7px', flexShrink: 0,
        }}>
          {n}
        </span>
        <span style={{ fontFamily: F.sans, fontSize: 13.5, fontWeight: 500, color: T.text }}>
          {title}
        </span>
      </div>
      <div style={{ paddingLeft: 32 }}>{children}</div>
    </div>
  );
}

function QuickStart(): React.ReactElement {
  return (
    <div>
      <p style={{ fontFamily: F.sans, fontSize: 13, color: T.textDim, marginBottom: 20, lineHeight: 1.6 }}>
        Get up and running with piui in 5 minutes.
      </p>
      <Step n={1} title="Install the pi binary">
        <CodeBlock>curl -fsSL https://pi.dev/install.sh | sh</CodeBlock>
        <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>
          Also available via npm, pnpm, or bun. See{' '}
          <span style={{ color: T.pi }}>docs/installation.md</span> for all options.
        </span>
      </Step>
      <Step n={2} title="Connect a provider">
        <p style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, marginBottom: 6, lineHeight: 1.6 }}>
          Run the onboarding flow to connect Anthropic, OpenAI, Google, or another provider.
        </p>
        <CodeBlock>pi --version   # verify pi is installed</CodeBlock>
      </Step>
      <Step n={3} title="Open a project">
        <p style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, marginBottom: 6, lineHeight: 1.6 }}>
          Navigate to your project directory in the terminal, then launch piui. It will
          use the current directory as the working directory for new sessions.
        </p>
        <CodeBlock>cd ~/my-project && open -a pi   # macOS</CodeBlock>
      </Step>
      <Step n={4} title="Send your first message">
        <p style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, marginBottom: 6, lineHeight: 1.6 }}>
          Click <strong>New session</strong> in the sidebar, type a message, and press{' '}
          <Kbd>Ctrl+Enter</Kbd> to send.
        </p>
        <CodeBlock>pi -p --no-tools "hello"   # quick CLI test</CodeBlock>
      </Step>
    </div>
  );
}

interface CliRow {
  flag: string;
  default_: string;
  description: string;
}

function CliReference(): React.ReactElement {
  const rows: CliRow[] = [
    { flag: '--print / -p', default_: 'false', description: 'Non-interactive print-and-exit mode' },
    { flag: '--no-session', default_: 'false', description: 'Do not write a session file' },
    { flag: '--no-tools', default_: 'false', description: 'Disable all tools (text-only response)' },
    { flag: '--tools <list>', default_: 'all', description: 'Enable specific tools: read|write|bash|find|grep' },
    { flag: '--session-dir <path>', default_: '~/.pi/agent/sessions', description: 'Custom session file directory' },
    { flag: '--session <file>', default_: '—', description: 'Resume a specific session file' },
    { flag: '--fork <file>', default_: '—', description: 'Start a new session branched from an existing one' },
    { flag: '--system-prompt <text>', default_: '—', description: 'Replace the default system prompt' },
    { flag: '--append-system-prompt <text>', default_: '—', description: 'Append to the default system prompt' },
    { flag: '--mode json|text', default_: 'text', description: 'Output format: plain text or JSONL' },
    { flag: '--thinking <level>', default_: 'medium', description: 'Reasoning budget: off|minimal|low|medium|high|xhigh' },
    { flag: '--export <file>', default_: '—', description: 'Export a session to HTML' },
    { flag: '@<file>', default_: '—', description: 'Attach a file inline into the prompt' },
    { flag: '--mode rpc', default_: '—', description: 'JSON-over-stdio RPC mode (used by piui internally)' },
  ];

  return (
    <div>
      <p style={{ fontFamily: F.sans, fontSize: 13, color: T.textDim, marginBottom: 16, lineHeight: 1.6 }}>
        Complete flag reference for the <code style={{ fontFamily: F.mono, color: T.pi }}>pi</code> CLI.
      </p>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        fontFamily: F.mono, fontSize: 11.5,
      }}>
        <thead>
          <tr>
            {(['Flag', 'Default', 'Description'] as const).map((h) => (
              <th key={h} style={{
                textAlign: 'left', padding: '6px 12px',
                color: T.textFaint, fontWeight: 600,
                borderBottom: `1px solid ${T.border}`,
                fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ flag, default_, description }) => (
            <tr key={flag} style={{ borderBottom: `1px solid ${T.borderDim}` }}>
              <td style={{ padding: '7px 12px', color: T.pi, whiteSpace: 'nowrap' }}>{flag}</td>
              <td style={{ padding: '7px 12px', color: T.textMuted, whiteSpace: 'nowrap' }}>{default_}</td>
              <td style={{ padding: '7px 12px', color: T.textDim }}>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyboardReference(): React.ReactElement {
  return (
    <div>
      <p style={{ fontFamily: F.sans, fontSize: 13, color: T.textDim, marginBottom: 16, lineHeight: 1.6 }}>
        Global keyboard shortcuts available throughout piui.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {KEYBINDINGS.map(({ keys, action }) => (
          <div key={keys} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0' }}>
            <Kbd>{keys}</Kbd>
            <span style={{ fontFamily: F.mono, fontSize: 11.5, color: T.textDim }}>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FaqEntry {
  question: string;
  answer: React.ReactNode;
}

function FaqSection(): React.ReactElement {
  const entries: FaqEntry[] = [
    {
      question: 'The pi binary was not found — what happens?',
      answer: (
        <span>
          piui starts in <strong>mock/browser mode</strong>. The full UI renders
          and you can navigate all screens, but all RPC calls are no-ops — no
          sessions are created and no messages are sent. Install the{' '}
          <code style={{ fontFamily: F.mono, color: T.pi }}>pi</code> binary
          (see <span style={{ color: T.pi }}>docs/installation.md</span>) and
          relaunch piui to connect.
        </span>
      ),
    },
    {
      question: 'How do I switch models?',
      answer: (
        <span>
          Press <Kbd>Ctrl+L</Kbd> to open the model picker, or press{' '}
          <Kbd>Ctrl+P</Kbd> to cycle through your favourite models without leaving
          the chat. You can mark models as favourites in the model picker overlay.
        </span>
      ),
    },
    {
      question: 'Where are sessions stored?',
      answer: (
        <span>
          Sessions are stored as JSONL files in{' '}
          <code style={{ fontFamily: F.mono, color: T.pi }}>~/.pi/agent/sessions/</code>.
          Each session is a separate file. You can override this path with the{' '}
          <code style={{ fontFamily: F.mono, color: T.pi }}>--session-dir</code> CLI
          flag or configure it in Settings.
        </span>
      ),
    },
    {
      question: 'How do I cancel a running task?',
      answer: (
        <span>
          Press <Kbd>Ctrl+C</Kbd> to abort the current run. This sends{' '}
          <code style={{ fontFamily: F.mono, color: T.pi }}>SIGINT</code> to the pi
          process, allowing it to finish any in-progress file write before exiting
          gracefully. The process auto-restarts automatically.
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {entries.map(({ question, answer }) => (
        <div key={question} style={{
          padding: '14px 16px', borderRadius: 6,
          border: `1px solid ${T.border}`, background: T.bgPanel,
        }}>
          <div style={{
            fontFamily: F.sans, fontSize: 13, fontWeight: 500,
            color: T.text, marginBottom: 8,
          }}>
            {question}
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, lineHeight: 1.7 }}>
            {answer}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Help(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<HelpTab>('quick-start');

  const renderContent = (): React.ReactElement | null => {
    switch (activeTab) {
      case 'quick-start':
        return <QuickStart />;
      case 'cli-reference':
        return <CliReference />;
      case 'keyboard':
        return <KeyboardReference />;
      case 'faq':
        return <FaqSection />;
    }
  };

  return (
    <PiWindow title="pi · help">
      <SidebarMain />
      <div
        data-testid="help-screen"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
      >
        <div style={{
          padding: '14px 24px 12px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>?</span>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Help</span>
        </div>

        <HelpTabBar active={activeTab} onSelect={setActiveTab} />

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px', background: T.bg }}>
          {renderContent()}
        </div>
      </div>
    </PiWindow>
  );
}
