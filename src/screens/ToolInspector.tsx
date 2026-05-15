import { T, F } from '../tokens';
import { Pill, Btn, Dot } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useNav } from '../context/NavContext';

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
  const { navigate } = useNav();
  return (
    <PiWindow title="pi · tool inspector">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim, cursor: 'pointer' }} onClick={() => navigate('chat')}>chat</span>
          <span style={{ color: T.textFaint }}>›</span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim }}>tool_calls</span>
          <span style={{ color: T.textFaint }}>›</span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.tool }}>str_replace_based_edit_tool</span>
          <div style={{ flex: 1 }} />
          <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)"><Dot color={T.ok} size={5} /> success</Pill>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>234ms</span>
          <Btn variant="ghost" icon="←">back to chat</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto', padding: '14px 12px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>tool input</div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim, marginBottom: 14, lineHeight: 1.7 }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{JSON.stringify({
  command: "str_replace",
  path: "/src/auth/jwt.ts",
  old_str: "const token = generateToken(user.id);",
  new_str: "const token = generateJWT(user.id, { expiresIn: '24h' });",
}, null, 2)}
              </pre>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>tool output</div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: T.ok, marginBottom: 14 }}>
              OK
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>timeline</div>
            {([
              ['tool_call_start', '14:32:11.420'],
              ['file read', '14:32:11.425 (+5ms)'],
              ['str_replace', '14:32:11.540 (+120ms)'],
              ['file write', '14:32:11.641 (+101ms)'],
              ['tool_call_end', '14:32:11.654 (+234ms)'],
            ] as const).map(([e, t]) => (
              <div key={e} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textDim }}>{e}</span>
                <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textFaint }}>{t}</span>
              </div>
            ))}
            <div style={{ height: 12 }} />
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>tool call #</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {[...Array(18)].map((_, i) => (
                <div key={i} style={{
                  width: 26, height: 26, borderRadius: 4, background: i === 11 ? T.tool : T.bgElev,
                  border: `1px solid ${i === 11 ? T.tool : T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: F.mono, fontSize: 10, color: i === 11 ? T.bg : T.textMuted, cursor: 'pointer',
                }}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text }}>src/auth/jwt.ts</span>
              <Pill color={T.tool} bg={`${T.tool}15`} border={`${T.tool}40`}>str_replace</Pill>
              <div style={{ flex: 1 }} />
              <Btn variant="ghost" icon="↗">Open in editor</Btn>
            </div>

            <div style={{ flex: 1, display: 'flex', minHeight: 0, background: T.bg }}>
              <div style={{ width: 38, flexShrink: 0, background: T.bgPanel, borderRight: `1px solid ${T.borderDim}`, overflow: 'hidden', paddingTop: 14 }}>
                {[...Array(20)].map((_, i) => (
                  <LineNo key={i} n={i + 10} highlight={i === 8} />
                ))}
              </div>
              <div style={{ flex: 1, overflow: 'auto', paddingTop: 14 }}>
                <DiffLine kind=" " text="import { sign, verify } from 'jsonwebtoken';" />
                <DiffLine kind=" " text="import { User } from '../types';" />
                <DiffLine kind=" " text="" />
                <DiffLine kind=" " text="const SECRET = process.env.JWT_SECRET!;" />
                <DiffLine kind=" " text="" />
                <DiffLine kind=" " text="export function createSession(user: User) {" />
                <DiffLine kind=" " text="  const sessionId = crypto.randomUUID();" />
                <DiffLine kind=" " text="  const payload = { userId: user.id, sessionId };" />
                <DiffLine kind="-" text="  const token = generateToken(user.id);" />
                <DiffLine kind="+" text="  const token = generateJWT(user.id, { expiresIn: '24h' });" />
                <DiffLine kind=" " text="  return { token, sessionId };" />
                <DiffLine kind=" " text="}" />
                <DiffLine kind=" " text="" />
                <DiffLine kind=" " text="export function verifyToken(token: string) {" />
                <DiffLine kind=" " text="  return verify(token, SECRET);" />
                <DiffLine kind=" " text="}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
