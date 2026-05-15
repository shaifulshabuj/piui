import { T, F } from '../tokens';
import { Pill, Btn, Dot, SectionLabel, Kbd } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';

const QUEUE = [
  { id: 'q1', text: 'after the JWT migration, also update the session store to use redis', done: false },
  { id: 'q2', text: 'then add a /me endpoint that returns current user from token', done: false },
  { id: 'q3', text: 'unit tests for the token verification edge cases', done: false },
];

const TRANSCRIPT = [
  { turn: 'user', text: 'refactor the auth module to use JWT' },
  { turn: 'pi', text: 'Starting JWT migration. Reading current auth implementation…', tool: 'read_file', toolStatus: 'done' },
  { turn: 'pi', text: "Found session-based auth in src/auth/. I'll replace the cookie store with a signed JWT approach.", tool: null, toolStatus: null },
  { turn: 'pi', text: 'Writing jwt.ts helper with sign/verify wrappers…', tool: 'str_replace_based_edit_tool', toolStatus: 'done' },
  { turn: 'pi', text: 'Updating authMiddleware to validate Bearer tokens…', tool: 'str_replace_based_edit_tool', toolStatus: 'running' },
];

export function Steering() {
  return (
    <PiWindow title="pi · steering">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Dot color={T.ok} size={8} animated />
          <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 500, color: T.text }}>Running</span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>JWT auth refactor · tool call 14 of ~22</span>
          <div style={{ flex: 1 }} />
          <Kbd>Ctrl+C</Kbd>
          <Btn variant="danger" icon="■">Abort</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: T.bg }}>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.borderDim}`, fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              live transcript
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TRANSCRIPT.map((item, i) => (
                <div key={i}>
                  {item.turn === 'user' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, marginBottom: 3 }}>user</div>
                      <div style={{
                        background: T.bgElev, borderRadius: 5, padding: '8px 12px',
                        fontFamily: F.mono, fontSize: 12.5, color: T.text, maxWidth: 500,
                      }}>
                        {item.text}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontFamily: F.mono, fontSize: 10, color: T.pi, marginBottom: 3 }}>π</div>
                      {item.tool && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                          padding: '6px 10px', borderRadius: 4, background: T.bgPanel,
                          border: `1px solid ${T.border}`,
                        }}>
                          <Dot
                            color={item.toolStatus === 'done' ? T.ok : item.toolStatus === 'running' ? T.pi : T.textFaint}
                            size={6}
                            animated={item.toolStatus === 'running'}
                          />
                          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.tool }}>{item.tool}</span>
                          <Pill
                            color={item.toolStatus === 'done' ? T.ok : T.pi}
                            bg={item.toolStatus === 'done' ? T.okBg : T.piBg}
                            border={item.toolStatus === 'done' ? 'rgba(143,184,106,0.3)' : T.piBorder}
                          >
                            {item.toolStatus}
                          </Pill>
                        </div>
                      )}
                      <div style={{ fontFamily: F.mono, fontSize: 12.5, color: T.textDim, lineHeight: 1.6 }}>
                        {item.text}
                        {i === TRANSCRIPT.length - 1 && (
                          <span style={{
                            display: 'inline-block', width: 7, height: 13, background: T.pi,
                            marginLeft: 2, verticalAlign: 'text-bottom',
                            animation: 'pi-blink 1s steps(2) infinite',
                          }} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                steer pi mid-task
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                borderRadius: 5, border: `1px solid ${T.borderHi}`, background: T.bgInput,
              }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>steer:</span>
                <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.textMuted, flex: 1 }}>also update session store to Redis…</span>
                <Kbd>↵</Kbd>
              </div>
              <div style={{ marginTop: 6, fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>
                Steering messages are injected into the next assistant turn without starting a new session.
              </div>
            </div>
          </div>

          <div style={{ width: 270, flexShrink: 0, borderLeft: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: F.mono, fontSize: 12, color: T.text }}>Queue</span>
              <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>{QUEUE.length}</Pill>
              <div style={{ flex: 1 }} />
              <Btn variant="ghost" icon="+">Add</Btn>
            </div>

            <div style={{ padding: '10px 12px' }}>
              <SectionLabel>pending after current task</SectionLabel>
              {QUEUE.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
                  borderRadius: 4, marginBottom: 4,
                  background: T.bgElev, border: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textFaint, paddingTop: 2 }}>{i + 1}.</span>
                  <span style={{ fontFamily: F.sans, fontSize: 12, color: T.text, flex: 1, lineHeight: 1.5 }}>{item.text}</span>
                  <Btn variant="ghost" icon="✕" />
                </div>
              ))}
              <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 4, border: `1px dashed ${T.border}`, background: 'transparent', cursor: 'pointer' }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textFaint }}>+ add to queue</span>
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderTop: `1px solid ${T.border}` }}>
              <SectionLabel>progress</SectionLabel>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 10 }}>
                {[...Array(22)].map((_, i) => {
                  const done = i < 13;
                  const running = i === 13;
                  return (
                    <div key={i} style={{
                      width: 18, height: 18, borderRadius: 3,
                      background: running ? T.pi : done ? T.ok : T.bgElev,
                      border: `1px solid ${running ? T.pi : done ? T.ok : T.border}`,
                    }} />
                  );
                })}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>
                14 / ~22 tool calls · approx 30% done
              </div>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
