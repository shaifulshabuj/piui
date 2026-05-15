import React from 'react';
import { T, F } from '../../tokens';
import { Pi, Pill, Kbd } from '../primitives';

export function MessageUser({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 24px' }}>
      <div style={{
        width: 18, flexShrink: 0, paddingTop: 1,
        fontFamily: F.mono, color: T.pi, fontSize: 13, fontWeight: 600,
      }}>{'>'}</div>
      <div style={{ flex: 1, fontFamily: F.mono, fontSize: 13.5, lineHeight: 1.6, color: T.text }}>
        {children}
      </div>
    </div>
  );
}

export function MessageAssistant({ children, streaming }: { children: React.ReactNode; streaming?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 24px' }}>
      <div style={{ width: 18, flexShrink: 0, paddingTop: 2 }}>
        <Pi size={13} />
      </div>
      <div style={{ flex: 1, fontFamily: F.mono, fontSize: 13.5, lineHeight: 1.65, color: T.text }}>
        {children}
        {streaming && (
          <span style={{
            display: 'inline-block', width: 7, height: 14,
            background: T.pi, marginLeft: 2, verticalAlign: 'text-bottom',
            animation: 'pi-blink 1s steps(2) infinite',
          }} />
        )}
      </div>
    </div>
  );
}

interface ToolCallProps {
  tool: string;
  args: string;
  status: 'ok' | 'run' | 'err' | 'pending';
  output?: string;
  expanded?: boolean;
  children?: React.ReactNode;
  accent?: string;
}

export function ToolCall({ tool, args, status, output, expanded, children, accent }: ToolCallProps) {
  const statusColor = status === 'ok' ? T.ok : status === 'run' ? T.pi : status === 'err' ? T.err : T.textDim;
  const statusGlyph = status === 'ok' ? '✓' : status === 'run' ? '◐' : status === 'err' ? '✕' : '·';
  return (
    <div style={{
      margin: '10px 24px 10px 54px',
      border: `1px solid ${T.border}`, borderRadius: 6,
      background: T.bgPanel, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px',
        borderBottom: expanded ? `1px solid ${T.border}` : 'none',
        fontFamily: F.mono, fontSize: 11.5,
      }}>
        <span style={{ color: statusColor, width: 12, textAlign: 'center' }}>{statusGlyph}</span>
        <span style={{ color: accent || T.tool, fontWeight: 500 }}>{tool}</span>
        <span style={{ color: T.textDim }}>(</span>
        <span style={{
          color: T.text, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', maxWidth: 480,
        }}>{args}</span>
        <span style={{ color: T.textDim }}>)</span>
        <div style={{ flex: 1 }} />
        {output && <span style={{ color: T.textMuted, fontSize: 10.5 }}>{output}</span>}
        <span style={{ color: T.textFaint, fontSize: 10 }}>{expanded ? '▾' : '▸'}</span>
      </div>
      {expanded && children}
    </div>
  );
}

export function DiffPreview() {
  const lines = [
    { t: 'h', s: '@@ src/session/store.ts:142 @@' },
    { t: ' ', s: '  async loadSession(id: string) {' },
    { t: ' ', s: '    const tree = await this.fs.readJson(`${id}.json`);' },
    { t: '-', s: '    return tree;' },
    { t: '+', s: '    if (!tree) throw new SessionNotFoundError(id);' },
    { t: '+', s: '    return this.migrate(tree);' },
    { t: ' ', s: '  }' },
  ];
  const bg: Record<string, string> = { '+': T.okBg, '-': T.errBg, ' ': 'transparent', h: T.bgElev };
  const fg: Record<string, string> = { '+': T.ok, '-': T.err, ' ': T.textDim, h: T.textMuted };
  return (
    <div style={{ fontFamily: F.mono, fontSize: 11.5, padding: '6px 0' }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display: 'flex', padding: '0 12px', background: bg[l.t], color: fg[l.t], lineHeight: 1.55 }}>
          <span style={{ width: 14, color: T.textFaint, flexShrink: 0 }}>
            {l.t === 'h' ? '' : l.t === ' ' ? ' ' : l.t}
          </span>
          <span style={{ whiteSpace: 'pre' }}>{l.s}</span>
        </div>
      ))}
    </div>
  );
}

export function PlanItem({ children, done, active }: { children: React.ReactNode; done?: boolean; active?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, fontSize: 13 }}>
      <span style={{ color: done ? T.ok : active ? T.pi : T.textFaint, width: 12, fontSize: 11 }}>
        {done ? '✓' : active ? '◐' : '○'}
      </span>
      <span style={{
        color: done ? T.textMuted : active ? T.text : T.textDim,
        textDecoration: done ? 'line-through' : 'none',
        textDecorationColor: T.textFaint,
      }}>
        {children}
      </span>
    </div>
  );
}

export function SteeringQueue() {
  return (
    <div style={{
      margin: '4px 24px 0', padding: '6px 10px',
      border: `1px dashed ${T.piBorder}`, borderRadius: 4,
      background: T.piBg,
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: F.mono, fontSize: 11, color: T.pi,
    }}>
      <span style={{ opacity: 0.9 }}>⟶ queued</span>
      <span style={{ color: T.text, flex: 1 }}>
        also: write a migration test for v0→v2 sessions
      </span>
      <Kbd>Alt+↵</Kbd>
      <span style={{ color: T.piDim, cursor: 'pointer' }}>×</span>
    </div>
  );
}

export function Composer({
  onCommandPalette,
  onSubmit,
  usage,
}: {
  onCommandPalette?: () => void;
  onSubmit?: (text: string) => void;
  usage?: { tokens: number; cost: number };
}) {
  const [text, setText] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = text.trim();
      if (trimmed && onSubmit) {
        onSubmit(trimmed);
        setText('');
      }
    }
    if (e.key === '/' && text === '' && onCommandPalette) {
      e.preventDefault();
      onCommandPalette();
    }
  };

  return (
    <div style={{ padding: '10px 24px 14px', borderTop: `1px solid ${T.border}`, background: T.bg }}>
      <div style={{
        border: `1px solid ${T.borderHi}`, borderRadius: 8,
        background: T.bgInput, boxShadow: `0 0 0 3px ${T.piBg}`,
      }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask pi something… (↵ send · Shift+↵ newline · / commands)"
          rows={text.split('\n').length || 1}
          style={{
            display: 'block', width: '100%', padding: '10px 12px 6px',
            fontFamily: F.mono, fontSize: 13.5, color: T.text, lineHeight: 1.5,
            background: 'transparent', border: 'none', outline: 'none', resize: 'none',
            boxSizing: 'border-box', minHeight: 38,
          }}
        />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', borderTop: `1px solid ${T.borderDim}`,
        }}>
          <Pill color={T.tool} bg={T.toolBg} border="rgba(199,155,214,0.25)">/test-context</Pill>
          <Pill color={T.info} bg={T.infoBg} border="rgba(122,166,216,0.25)">@src/session/migrate.ts</Pill>
          <div style={{ flex: 1 }} />
          {usage && (
            <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textMuted }}>
              {(usage.tokens / 1000).toFixed(1)}k tok · ${usage.cost.toFixed(3)}
            </span>
          )}
          <span
            style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, cursor: 'pointer' }}
            onClick={onCommandPalette}
          >
            <Kbd>↵</Kbd> send · <Kbd>Alt+↵</Kbd> queue · <Kbd>/</Kbd> commands
          </span>
        </div>
      </div>
    </div>
  );
}
