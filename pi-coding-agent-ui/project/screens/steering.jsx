// Steering UI — focused view of the running agent with queue manager.
// Enter = steer (interrupts after current tool); Alt+Enter = queue.

function StreamEvent({ icon, color, label, detail, time, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '6px 0', fontFamily: F.mono, fontSize: 11.5 }}>
      <span style={{ width: 14, color, fontSize: 11, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, color: active ? T.text : T.textDim, lineHeight: 1.55 }}>
        <span style={{ color: active ? T.pi : color, fontWeight: 500 }}>{label}</span>
        {detail && <span>  {detail}</span>}
      </span>
      <span style={{ color: T.textFaint, fontSize: 10 }}>{time}</span>
    </div>
  );
}

function QueueItem({ idx, text, kind, when }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 12px', borderRadius: 5,
      background: T.bgPanel, border: `1px solid ${T.border}`,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 3, flexShrink: 0,
        background: kind === 'steer' ? T.piBg : T.infoBg,
        color: kind === 'steer' ? T.pi : T.info,
        border: `1px solid ${kind === 'steer' ? T.piBorder : 'rgba(122,166,216,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: F.mono, fontSize: 10.5, fontWeight: 600,
      }}>{idx}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <Pill color={kind === 'steer' ? T.pi : T.info}
            bg={kind === 'steer' ? T.piBg : T.infoBg}
            border={kind === 'steer' ? T.piBorder : 'rgba(122,166,216,0.3)'}>
            {kind === 'steer' ? '⟶ steer' : '⌖ follow-up'}
          </Pill>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>
            {when}
          </span>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 12, color: T.text, lineHeight: 1.55 }}>
          {text}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ color: T.textFaint, cursor: 'pointer', fontSize: 12 }}>↑</span>
        <span style={{ color: T.textFaint, cursor: 'pointer', fontSize: 12 }}>↓</span>
        <span style={{ color: T.textMuted, cursor: 'pointer', fontSize: 12 }}>×</span>
      </div>
    </div>
  );
}

function Steering() {
  return (
    <PiWindow title="pi · steering · agent running">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
        {/* live transcript */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column',
          background: T.bg, minWidth: 0, borderRight: `1px solid ${T.border}` }}>
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <Dot color={T.pi} size={7} style={{ animation: 'pi-pulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontFamily: F.mono, fontSize: 12, color: T.text, fontWeight: 500 }}>
              running
            </span>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>
              tool 4 / ~8 · turn 5
            </span>
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" icon="⏸">Pause after this tool</Btn>
            <Btn variant="danger" icon="■">Abort</Btn>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px' }}>
            <StreamEvent icon="▸" color={T.tool} label="read_file"
              detail="src/session/store.ts" time="14:09:38" />
            <StreamEvent icon="▸" color={T.tool} label="read_file"
              detail="src/session/migrate.ts" time="14:09:39" />
            <StreamEvent icon="▸" color={T.tool} label="grep"
              detail='"loadSession\\(" — 6 matches' time="14:09:40" />
            <StreamEvent icon="✎" color={T.ok} label="edit_file"
              detail="src/session/store.ts · +12 −1" time="14:09:41" />
            <StreamEvent icon="●" color={T.pi} label="bash"
              detail="pnpm vitest run session/" time="14:09:42" active />

            <div style={{
              marginTop: 10, padding: '10px 12px', borderRadius: 5,
              background: T.bgPanel, border: `1px solid ${T.border}`,
              fontFamily: F.mono, fontSize: 11.5, color: T.textDim, lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}>
              <span style={{ color: T.tool }}>$</span> pnpm vitest run session/<br />
              <span style={{ color: T.text }}> RUN  v1.6.0  /Users/maz/code/pi-ui</span><br />
              <span style={{ color: T.ok }}> ✓ </span>src/session/store.test.ts (4){'\n'}
              <span style={{ color: T.ok }}> ✓ </span>src/session/migrate.test.ts (7){'\n'}
              <span style={{ color: T.pi }}> ◐ </span>src/session/load.test.ts <span style={{
                display: 'inline-block', width: 7, height: 12, background: T.pi,
                marginLeft: 4, verticalAlign: 'text-bottom',
                animation: 'pi-blink 1s steps(2) infinite',
              }} />
            </div>
          </div>

          {/* composer with live steer hint */}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}` }}>
            <div style={{
              border: `1px solid ${T.borderHi}`, borderRadius: 8,
              background: T.bgInput, padding: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>steer ↵</Pill>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>
                  delivered after current tool · interrupts remaining tools
                </span>
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 13.5, color: T.text, lineHeight: 1.5 }}>
                actually — only fix the v0 schema for now, skip v1
                <span style={{
                  display: 'inline-block', width: 7, height: 14, background: T.pi,
                  marginLeft: 1, verticalAlign: 'text-bottom',
                  animation: 'pi-blink 1s steps(2) infinite',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* queue */}
        <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: T.bgPanel }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: F.sans, fontSize: 14, color: T.text, fontWeight: 500 }}>
                Queue
              </span>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>
                3 messages · runs after this turn
              </span>
            </div>
            <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 10.5,
              color: T.textMuted, lineHeight: 1.7 }}>
              <div><Kbd>↵</Kbd>  send <span style={{ color: T.pi }}>steer</span> message — interrupts after current tool</div>
              <div><Kbd>Alt+↵</Kbd>  send <span style={{ color: T.info }}>follow-up</span> — waits for turn to finish</div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '12px 14px', display: 'flex',
            flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            <QueueItem idx="1" kind="steer" when="will deliver after pnpm vitest"
              text="actually — only fix the v0 schema for now, skip v1" />
            <QueueItem idx="2" kind="follow" when="after this turn finishes"
              text="write a CHANGELOG entry for the fix" />
            <QueueItem idx="3" kind="follow" when="after #2"
              text="cherry-pick onto the release-v0.18 branch and open PR" />

            <div style={{ marginTop: 4,
              padding: '14px 12px', borderRadius: 5,
              border: `1px dashed ${T.border}`, background: 'transparent',
              fontFamily: F.mono, fontSize: 11, color: T.textFaint,
              textAlign: 'center', lineHeight: 1.7 }}>
              drop a message here to queue it<br />
              or press Alt+↵ in the composer
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 8 }}>
            <Btn variant="ghost">Clear queue</Btn>
            <div style={{ flex: 1 }} />
            <Btn variant="secondary">Run all now</Btn>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}

window.Steering = Steering;
