// Theme customization — pick palette, type, accent. Preview live.
// Themes are pi packages too — install from npm/git, edit any token.

function Swatch({ name, color, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 8px', borderRadius: 4,
      background: active ? T.bgElev : 'transparent',
      border: `1px solid ${active ? T.borderHi : 'transparent'}`,
    }}>
      <div style={{ width: 18, height: 18, borderRadius: 3, background: color,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }} />
      <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim, flex: 1 }}>{name}</span>
      <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>{color}</span>
    </div>
  );
}

function ThemeCard({ name, author, accent, bg, panel, text, current }) {
  return (
    <div style={{
      borderRadius: 6, overflow: 'hidden',
      border: `1px solid ${current ? T.piBorder : T.border}`,
      background: T.bgPanel,
    }}>
      <div style={{ height: 80, background: bg, position: 'relative',
        borderBottom: `1px solid ${T.borderDim}` }}>
        <div style={{ position: 'absolute', inset: 8, background: panel,
          borderRadius: 3, padding: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
            <div style={{ height: 6, flex: 1, background: text, opacity: 0.4, borderRadius: 1 }} />
          </div>
          <div style={{ height: 4, width: '80%', background: text, opacity: 0.7, borderRadius: 1 }} />
          <div style={{ height: 4, width: '60%', background: text, opacity: 0.4, borderRadius: 1 }} />
          <div style={{ height: 4, width: '40%', background: accent, opacity: 0.9, borderRadius: 1 }} />
        </div>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: F.mono, fontSize: 12, color: T.text, fontWeight: 500 }}>{name}</span>
          {current && <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>active</Pill>}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textMuted, marginTop: 2 }}>
          by {author}
        </div>
      </div>
    </div>
  );
}

function ThemeCustomizer() {
  return (
    <PiWindow title="pi · themes">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 24px 12px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: F.sans, fontSize: 17, color: T.text, fontWeight: 500 }}>
            Theme
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim }}>
            themes are JSON · install from a package or write your own
          </span>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="↗">Browse</Btn>
          <Btn variant="ghost" icon="↑">Import</Btn>
          <Btn variant="secondary" icon="+">New theme</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* gallery */}
          <div style={{
            width: 320, flexShrink: 0, borderRight: `1px solid ${T.border}`,
            background: T.bgPanel, padding: '14px', overflow: 'auto',
          }}>
            <SectionLabel style={{ padding: '0 0 8px' }}>installed · 5</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <ThemeCard name="pi default" author="earendil" current
                bg="#0e0d0b" panel="#15140f" text="#e9e4d4" accent="#f0a45a" />
              <ThemeCard name="claude-warm" author="maz"
                bg="#1a1612" panel="#231d17" text="#f5ead2" accent="#d97757" />
              <ThemeCard name="solar-night" author="badlogic"
                bg="#002b36" panel="#073642" text="#eee8d5" accent="#b58900" />
              <ThemeCard name="paper" author="oss"
                bg="#fbf9f3" panel="#ffffff" text="#2a2620" accent="#c25f3c" />
              <ThemeCard name="phosphor" author="vinegar"
                bg="#0a0f0a" panel="#0e150e" text="#a8f0a8" accent="#52ff52" />
              <ThemeCard name="dracula-pi" author="dracula"
                bg="#282a36" panel="#21222c" text="#f8f8f2" accent="#ff79c6" />
            </div>
          </div>

          {/* token editor + preview */}
          <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>

            {/* token list */}
            <div style={{
              width: 320, flexShrink: 0, padding: '14px 16px', overflow: 'auto',
              borderRight: `1px solid ${T.border}`, background: T.bg,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: F.mono, fontSize: 12, color: T.text, fontWeight: 500 }}>
                  pi default
                </span>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textMuted }}>editing</span>
                <div style={{ flex: 1 }} />
                <Btn variant="ghost">Reset</Btn>
              </div>

              <SectionLabel style={{ padding: '8px 0' }}>surfaces</SectionLabel>
              <Swatch name="bg" color="#0e0d0b" />
              <Swatch name="bg.panel" color="#15140f" />
              <Swatch name="bg.elev" color="#1c1b15" />
              <Swatch name="bg.input" color="#1f1d16" />

              <SectionLabel style={{ padding: '12px 0 8px' }}>text</SectionLabel>
              <Swatch name="text" color="#e9e4d4" />
              <Swatch name="text.dim" color="#a39d8a" />
              <Swatch name="text.muted" color="#6a6557" />

              <SectionLabel style={{ padding: '12px 0 8px' }}>accent</SectionLabel>
              <Swatch name="pi" color="#f0a45a" active />
              <Swatch name="pi.dim" color="#a06f3c" />

              <SectionLabel style={{ padding: '12px 0 8px' }}>semantic</SectionLabel>
              <Swatch name="ok" color="#8fb86a" />
              <Swatch name="warn" color="#e0b257" />
              <Swatch name="err" color="#e26b5e" />
              <Swatch name="info" color="#7aa6d8" />

              <SectionLabel style={{ padding: '12px 0 8px' }}>typography</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6,
                fontFamily: F.mono, fontSize: 11, color: T.textDim }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>mono</span><span style={{ color: T.text }}>Geist Mono</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>sans</span><span style={{ color: T.text }}>Geist</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>scale</span><span style={{ color: T.text }}>13px / 1.5</span>
                </div>
              </div>
            </div>

            {/* live preview */}
            <div style={{ flex: 1, padding: 22, background: T.bg, overflow: 'auto', minWidth: 0 }}>
              <SectionLabel style={{ padding: 0, marginBottom: 10 }}>preview</SectionLabel>

              <div style={{
                border: `1px solid ${T.border}`, borderRadius: 6,
                background: T.bgPanel, padding: 14,
              }}>
                <MessageUser>
                  Refactor SessionStore.loadSession to migrate old schemas.
                </MessageUser>
                <ToolCall tool="edit_file" args="src/session/store.ts" status="ok"
                  output="+12 −1" expanded accent={T.ok}>
                  <DiffPreview />
                </ToolCall>
                <MessageAssistant>
                  All 12 tests pass. Snapshot file regenerated; v0→v2 round-trip
                  preserves <code style={{ color: T.pi }}>branches</code> and{' '}
                  <code style={{ color: T.pi }}>bookmarks</code>.
                </MessageAssistant>
              </div>

              <div style={{ marginTop: 18, display: 'grid',
                gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['ok', T.ok, T.okBg, '✓ tests pass'],
                  ['warn', T.warn, T.warnBg, '⚠ permission requested'],
                  ['err', T.err, T.errBg, '✕ exit 1'],
                  ['info', T.info, T.infoBg, 'ⓘ migrated'],
                ].map(([k, c, b, s]) => (
                  <div key={k} style={{ padding: '10px 12px', borderRadius: 5,
                    background: b, border: `1px solid ${c}40`,
                    fontFamily: F.mono, fontSize: 12, color: c }}>{s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '10px 24px', borderTop: `1px solid ${T.border}`,
          background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: F.mono, fontSize: 11, color: T.textMuted,
        }}>
          <span>theme: <span style={{ color: T.info }}>~/.pi/themes/pi-default.json</span></span>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost">Export as package</Btn>
          <Btn variant="primary">Apply</Btn>
        </div>
      </div>
    </PiWindow>
  );
}

window.ThemeCustomizer = ThemeCustomizer;
