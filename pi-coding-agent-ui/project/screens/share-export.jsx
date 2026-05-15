// Share & export — /share uploads to GitHub gist and returns a URL,
// /export saves session as HTML. This screen shows the post-share success state.

function ShareExport() {
  return (
    <PiWindow title="pi · /share">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        background: T.bg, overflow: 'auto' }}>
        <div style={{ padding: '40px 80px 24px', maxWidth: 980, margin: '0 auto', width: '100%' }}>

          {/* hero */}
          <div style={{ marginBottom: 28 }}>
            <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)">
              <Dot color={T.ok} size={5} /> session shared
            </Pill>
            <div style={{ fontFamily: F.sans, fontSize: 26, color: T.text,
              fontWeight: 500, marginTop: 12, letterSpacing: -0.4 }}>
              pi ui design system
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: T.textDim, marginTop: 4 }}>
              14 turns · 31 tool calls · 3 branches · 64 messages
            </div>
          </div>

          {/* gist url card */}
          <div style={{
            padding: '18px 20px', borderRadius: 8,
            border: `1px solid ${T.piBorder}`, background: T.piBg,
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 6,
              background: T.bgElev, border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: F.mono, fontSize: 22, color: T.pi, fontWeight: 600,
            }}>↗</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted, marginBottom: 2 }}>
                shareable URL
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 14, color: T.text }}>
                pi.dev/session/<span style={{ color: T.pi }}>#8af3c47b13daf7e1de28ee99950b074</span>
              </div>
            </div>
            <Btn variant="secondary" icon="⎘">Copy</Btn>
            <Btn variant="primary" icon="↗">Open</Btn>
          </div>

          {/* two columns: share via / preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* left: share options */}
            <div>
              <SectionLabel style={{ padding: '0 0 10px' }}>share via</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['/share', T.pi, 'GitHub gist — public, renders at pi.dev/session/', 'used'],
                  ['/share --private', T.warn, 'GitHub gist — secret, link-only access'],
                  ['/export', T.info, 'Standalone HTML — download to current directory'],
                  ['/export --bundle', T.info, 'HTML + attached files (images, diffs) as zip'],
                  ['copy as markdown', T.tool, 'Pipe through `pi -p` and back to clipboard'],
                ].map(([cmd, c, desc, badge]) => (
                  <div key={cmd} style={{
                    padding: '11px 12px', borderRadius: 5,
                    border: `1px solid ${T.border}`, background: T.bgPanel,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <code style={{ fontFamily: F.mono, fontSize: 11.5, color: c, fontWeight: 500 }}>{cmd}</code>
                      {badge && <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)">{badge}</Pill>}
                    </div>
                    <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>{desc}</div>
                  </div>
                ))}
              </div>

              <SectionLabel style={{ padding: '20px 0 10px' }}>include in export</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7,
                fontFamily: F.mono, fontSize: 12, color: T.textDim }}>
                {[
                  ['user messages', true, '14'],
                  ['assistant messages', true, '14'],
                  ['tool calls + outputs', true, '31'],
                  ['file diffs (inline)', true, '6'],
                  ['bookmarked entries only', false, '2'],
                  ['parked branches', false, '1'],
                  ['system prompt', false, ''],
                  ['model + cost metadata', true, ''],
                ].map(([k, on, c]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3,
                      border: `1px solid ${on ? T.pi : T.border}`,
                      background: on ? T.pi : 'transparent',
                      color: '#1a1408', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                      {on ? '✓' : ''}
                    </span>
                    <span style={{ flex: 1, color: on ? T.text : T.textDim }}>{k}</span>
                    {c && <span style={{ color: T.textFaint, fontSize: 10 }}>{c}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* right: html preview */}
            <div>
              <SectionLabel style={{ padding: '0 0 10px' }}>preview · rendered</SectionLabel>
              <div style={{
                borderRadius: 6, overflow: 'hidden',
                border: `1px solid ${T.border}`, background: '#fbf9f3',
                color: '#2a2620', fontFamily: F.sans, fontSize: 12,
                aspectRatio: '4/3.4',
              }}>
                <div style={{ padding: '20px 22px 12px', borderBottom: '1px solid #e5e1d6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: F.mono, fontSize: 20, color: '#c25f3c',
                      fontWeight: 600 }}>π</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>pi ui design system</span>
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: 10, color: '#7a7060', marginTop: 4 }}>
                    Nov 30, 2026 · 14 turns · claude-sonnet-4-5
                  </div>
                </div>
                <div style={{ padding: '14px 22px' }}>
                  <div style={{ fontFamily: F.mono, fontSize: 11, color: '#c25f3c',
                    fontWeight: 500, marginBottom: 4 }}>USER</div>
                  <div style={{ fontFamily: F.mono, fontSize: 11, marginBottom: 12, lineHeight: 1.6 }}>
                    Look at SessionStore.loadSession — old sessions crash on open.
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: 11, color: '#7a4099',
                    fontWeight: 500, marginBottom: 4 }}>π</div>
                  <div style={{ fontFamily: F.mono, fontSize: 11, marginBottom: 10, lineHeight: 1.6 }}>
                    Reading store.ts and migrate.ts. The crash is from an undefined branches[] field on v0…
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4,
                    fontFamily: F.mono, fontSize: 10, color: '#5a6a40' }}>
                    <div>✓ read_file · src/session/store.ts</div>
                    <div>✓ read_file · src/session/migrate.ts</div>
                    <div>✓ edit_file · src/session/store.ts · +12 −1</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 10.5,
                color: T.textMuted, lineHeight: 1.7 }}>
                self-contained · no analytics · no external assets ·
                ~118 kB · readable offline
              </div>
            </div>
          </div>

          <div style={{ marginTop: 30, padding: '14px 18px', borderRadius: 6,
            background: T.bgPanel, border: `1px solid ${T.border}`,
            fontFamily: F.mono, fontSize: 11.5, color: T.textDim, lineHeight: 1.7 }}>
            <span style={{ color: T.pi }}>tip · </span>
            attach a comment to any message in the gist with{' '}
            <code style={{ color: T.warn }}>pi.dev/session/#hash?notes=on</code>.
            Readers can branch from any point and continue the session in their own pi —{' '}
            <code style={{ color: T.warn }}>pi clone &lt;url&gt;</code>.
          </div>
        </div>
      </div>
    </PiWindow>
  );
}

window.ShareExport = ShareExport;
