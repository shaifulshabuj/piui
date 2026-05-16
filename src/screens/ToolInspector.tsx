import { T, F } from '../tokens';
import { Pill, Btn, Dot } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useNav } from '../context/NavContext';
import { useChatStore } from '../store/chatStore';

function LineNo({ n, highlight }: { n: number; highlight?: boolean }) {
  return (
    <div style={{
      padding: '0 10px', fontFamily: F.mono, fontSize: 11.5, lineHeight: '20px',
      color: highlight ? T.pi : T.textFaint, fontWeight: highlight ? 600 : 400,
      background: highlight ? `${T.pi}12` : 'transparent',
    }}>{n}</div>
  );
}

function DiffLine({ kind, text }: { kind: '+' | '-' | ' '; text: string }) {
  const colors: Record<'+' | '-' | ' ', [string, string]> = {
    '+': [`${T.ok}18`, T.ok],
    '-': [`${T.err}18`, T.err],
    ' ': ['transparent', T.textDim],
  };
  const [bg, fg] = colors[kind];
  return (
    <div style={{ background: bg, padding: '0 4px', fontFamily: F.mono, fontSize: 11.5, lineHeight: '20px', color: fg, whiteSpace: 'pre' }}>
      <span style={{ color: fg, marginRight: 8, userSelect: 'none' }}>{kind === ' ' ? ' ' : kind}</span>
      {text}
    </div>
  );
}

export function ToolInspector() {
  const { navigate, inspectToolId } = useNav();
  const { toolCalls } = useChatStore();

  const toolCall = inspectToolId ? toolCalls.find((tc) => tc.id === inspectToolId) : toolCalls[toolCalls.length - 1];

  return (
    <PiWindow title="pi · tool inspector">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim, cursor: 'pointer' }} onClick={() => navigate('chat')}>chat</span>
          <span style={{ color: T.textFaint }}>›</span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim }}>tool_calls</span>
          <span style={{ color: T.textFaint }}>›</span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.tool }}>
            {toolCall?.tool ?? 'none selected'}
          </span>
          <div style={{ flex: 1 }} />
          {toolCall && (
            <>
              <Pill
                color={toolCall.status === 'ok' ? T.ok : toolCall.status === 'err' ? T.err : T.warn}
                bg={toolCall.status === 'ok' ? T.okBg : toolCall.status === 'err' ? T.errBg : `${T.warn}15`}
                border={toolCall.status === 'ok' ? 'rgba(143,184,106,0.3)' : toolCall.status === 'err' ? `${T.err}40` : `${T.warn}40`}
              >
                <Dot color={toolCall.status === 'ok' ? T.ok : toolCall.status === 'err' ? T.err : T.warn} size={5} />
                {' '}{toolCall.status === 'run' ? 'running' : toolCall.status}
              </Pill>
            </>
          )}
          <Btn variant="ghost" icon="←" onClick={() => navigate('chat')}>back to chat</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto', padding: '14px 12px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>tool input</div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim, marginBottom: 14, lineHeight: 1.7 }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {toolCall?.args ?? '(no tool selected)'}
              </pre>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>tool output</div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: toolCall?.status === 'err' ? T.err : T.ok, marginBottom: 14 }}>
              {toolCall?.output ?? '(no output yet)'}
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>timeline</div>
            <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textDim, marginBottom: 14, lineHeight: 1.7 }}>
              {toolCall
                ? `tool_execution_start → running → tool_execution_end`
                : '(no timeline available)'}
            </div>
            {toolCalls.length > 0 && (
              <>
                <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>all tool calls</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {toolCalls.map((tc, i) => (
                    <div
                      key={tc.id}
                      title={tc.tool}
                      onClick={() => {/* navigate to inspect with this id */}}
                      style={{
                        width: 26, height: 26, borderRadius: 4,
                        background: tc.id === toolCall?.id ? T.tool : T.bgElev,
                        border: `1px solid ${tc.id === toolCall?.id ? T.tool : T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: F.mono, fontSize: 10,
                        color: tc.id === toolCall?.id ? T.bg : T.textMuted,
                        cursor: 'pointer',
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text }}>
                {toolCall?.tool ?? 'No tool call selected'}
              </span>
              {toolCall && (
                <Pill color={T.tool} bg={`${T.tool}15`} border={`${T.tool}40`}>{toolCall.tool}</Pill>
              )}
              <div style={{ flex: 1 }} />
            </div>

            <div style={{ flex: 1, display: 'flex', minHeight: 0, background: T.bg }}>
              {toolCalls.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <span style={{ fontFamily: F.mono, fontSize: 32, color: T.textFaint, opacity: 0.3 }}>⚒</span>
                  <span style={{ fontFamily: F.sans, fontSize: 13, color: T.textFaint }}>No tool calls in this session yet</span>
                </div>
              ) : (
                <>
                  <div style={{ width: 38, flexShrink: 0, background: T.bgPanel, borderRight: `1px solid ${T.borderDim}`, overflow: 'hidden', paddingTop: 14 }}>
                    {[...Array(20)].map((_, i) => (
                      <LineNo key={i} n={i + 1} highlight={i === 5} />
                    ))}
                  </div>
                  <div style={{ flex: 1, overflow: 'auto', paddingTop: 14 }}>
                    <DiffLine kind=" " text={`tool: ${toolCall?.tool ?? ''}`} />
                    <DiffLine kind=" " text={`args: ${toolCall?.args ?? ''}`} />
                    <DiffLine kind=" " text={`status: ${toolCall?.status ?? ''}`} />
                    <DiffLine kind=" " text={`output: ${toolCall?.output ?? ''}`} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
