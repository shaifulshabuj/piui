// Context editor — AGENTS.md (hierarchical project instructions) +
// SYSTEM.md (system prompt override). Compaction settings.

function FileChip({ path, scope, bytes, active, exists }) {
  const sc = { user: T.warn, parent: T.info, project: T.ok, missing: T.textFaint }[scope];
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 5,
      background: active ? T.bgElev : 'transparent',
      borderLeft: `2px solid ${active ? T.pi : 'transparent'}`,
      marginLeft: -2, paddingLeft: 10,
      opacity: exists === false ? 0.55 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 2 }}>
        <Pill color={sc} bg={`${sc}15`} border={`${sc}40`}>{scope}</Pill>
        {exists === false && (
          <span style={{ fontFamily: F.mono, fontSize: 9.5, color: T.textFaint }}>
            (not present)
          </span>
        )}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 11.5, color: active ? T.text : T.textDim,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {path}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, marginTop: 2 }}>
        {bytes}
      </div>
    </div>
  );
}

function ContextEditor() {
  return (
    <PiWindow title="pi · context · AGENTS.md / SYSTEM.md">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 24px 12px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: F.sans, fontSize: 17, color: T.text, fontWeight: 500 }}>
            Context
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim }}>
            AGENTS.md is loaded hierarchically · SYSTEM.md replaces or extends the system prompt
          </span>
          <div style={{ flex: 1 }} />
          <Pill color={T.info} bg={T.infoBg} border="rgba(122,166,216,0.25)">
            14.2k / 200k tokens
          </Pill>
          <Btn variant="ghost" icon="🛈">Show effective context</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* file tree */}
          <div style={{
            width: 280, flexShrink: 0, borderRight: `1px solid ${T.border}`,
            background: T.bgPanel, padding: '12px 8px', overflow: 'auto',
          }}>
            <SectionLabel>AGENTS.md hierarchy</SectionLabel>
            <FileChip scope="user" path="~/.pi/agent/AGENTS.md" bytes="412 B · always-on" />
            <FileChip scope="parent" path="~/code/AGENTS.md" bytes="1.1 kB" />
            <FileChip scope="parent" path="~/code/pi-ui/AGENTS.md" bytes="2.4 kB" active />
            <FileChip scope="project" path="~/code/pi-ui/src/AGENTS.md" bytes="—" exists={false} />

            <SectionLabel>SYSTEM.md override</SectionLabel>
            <FileChip scope="user" path="~/.pi/SYSTEM.md" bytes="—" exists={false} />
            <FileChip scope="project" path="~/code/pi-ui/SYSTEM.md" bytes="640 B · append" />

            <SectionLabel>active skills</SectionLabel>
            <div style={{ padding: '0 4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['react-tsx', 'css-grid', 'macos-design'].map((s) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7,
                    padding: '5px 8px', borderRadius: 4, background: T.bgPanel,
                    border: `1px solid ${T.border}`, fontFamily: F.mono, fontSize: 11 }}>
                    <Dot color={T.info} size={5} />
                    <span style={{ color: T.text }}>{s}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ color: T.textFaint, fontSize: 10 }}>on-demand</span>
                  </div>
                ))}
              </div>
            </div>

            <SectionLabel>compaction</SectionLabel>
            <div style={{ padding: '8px 12px', fontFamily: F.mono, fontSize: 11,
              color: T.textDim, lineHeight: 1.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>strategy</span><span style={{ color: T.text }}>topic-based</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>trigger</span><span style={{ color: T.text }}>85% ctx</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>model</span><span style={{ color: T.text }}>haiku-4-5</span>
              </div>
              <div style={{ marginTop: 6, color: T.textMuted, fontSize: 10 }}>
                custom via <code style={{ color: T.tool }}>extensions/compaction.ts</code>
              </div>
            </div>
          </div>

          {/* editor */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
            background: T.bg, minWidth: 0 }}>

            {/* tab bar — file path + scope info */}
            <div style={{
              display: 'flex', alignItems: 'center',
              borderBottom: `1px solid ${T.border}`, background: T.bgPanel,
              fontFamily: F.mono, fontSize: 11, padding: '0 4px',
            }}>
              <div style={{ display: 'flex' }}>
                {[
                  ['AGENTS.md', '~/code/pi-ui/', true],
                  ['SYSTEM.md', '~/code/pi-ui/'],
                  ['AGENTS.md', '~/.pi/agent/'],
                ].map(([f, d, a], i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 14px',
                    background: a ? T.bg : 'transparent',
                    color: a ? T.text : T.textDim,
                    borderBottom: `2px solid ${a ? T.pi : 'transparent'}`,
                    borderRight: `1px solid ${T.borderDim}`,
                  }}>
                    <span style={{ color: T.textMuted, fontSize: 10 }}>{d}</span>
                    <span>{f}</span>
                    <span style={{ color: T.textFaint, marginLeft: 4 }}>×</span>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <span style={{ color: T.textMuted, padding: '0 14px' }}>
                modified · <Kbd>⌘S</Kbd> save
              </span>
            </div>

            {/* editor body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px',
              fontFamily: F.mono, fontSize: 12.5, lineHeight: 1.7, color: T.text }}>
              <div style={{ color: T.textMuted, marginBottom: 14, fontSize: 11 }}>
                <span style={{ color: T.pi }}># </span>
                applies to ~/code/pi-ui · loaded after parent AGENTS.md
              </div>

              <div style={{ color: T.pi, fontSize: 16, fontWeight: 500 }}># Pi UI</div>
              <div style={{ height: 12 }} />
              <div>This is the design-system source for the pi terminal UI.</div>
              <div>Treat React + Tailwind as targets, but emit raw CSS so we ship without a build.</div>

              <div style={{ height: 18 }} />
              <div style={{ color: T.pi, fontWeight: 500 }}>## Conventions</div>
              <div style={{ height: 6 }} />
              <div>- Components live in <code style={{ color: T.tool }}>src/components/</code>, one file per component.</div>
              <div>- Tokens come from <code style={{ color: T.tool }}>tokens.ts</code> — never hard-code colors.</div>
              <div>- Geist Mono is the primary face. Sans for prose, body, and headings &lt;24px.</div>
              <div>- Density: tight. Padding is 4 / 8 / 12 / 16. Avoid odd values.</div>

              <div style={{ height: 18 }} />
              <div style={{ color: T.pi, fontWeight: 500 }}>## Commands</div>
              <div style={{ height: 6 }} />
              <div>- <code style={{ color: T.warn }}>pnpm dev</code> — watch + serve at :5173</div>
              <div>- <code style={{ color: T.warn }}>pnpm test</code> — vitest, watches by default</div>
              <div>- <code style={{ color: T.warn }}>pnpm typecheck</code> — strict tsc, no-emit</div>

              <div style={{ height: 18 }} />
              <div style={{ color: T.pi, fontWeight: 500 }}>## When asked to refactor</div>
              <div style={{ height: 6 }} />
              <div>- Read the call sites first. Don't trust the signature.</div>
              <div>- Land schema migrations behind a feature flag the first PR; remove it the second.</div>
              <div>- Don't rename public exports without grepping consumers.</div>

              <div style={{ height: 18 }} />
              <div style={{ color: T.textMuted, fontSize: 11 }}>
                <span style={{ color: T.pi }}>{'<!--'} </span>
                lines beginning with <code style={{ color: T.warn }}>@</code> are imports
                <span style={{ color: T.pi }}> {'-->'}</span>
              </div>
              <div style={{ color: T.tool }}>@include ./.pi/snippets/error-handling.md</div>
              <div style={{ color: T.tool }}>@include ../design-system/AGENTS.md</div>

              <div style={{ height: 28 }} />
              <div style={{
                padding: '10px 12px', borderRadius: 5,
                background: T.piBg, border: `1px dashed ${T.piBorder}`,
                fontFamily: F.mono, fontSize: 11, color: T.pi,
              }}>
                ⓘ pi reloads AGENTS.md on save. Use{' '}
                <code style={{ background: T.bgElev, padding: '1px 5px', borderRadius: 3 }}>
                  /reload
                </code>{' '}
                to apply changes in an active session.
              </div>
            </div>

            {/* gutter — token preview */}
            <div style={{
              borderTop: `1px solid ${T.border}`, background: T.bgPanel,
              padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 16,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted,
            }}>
              <span>2.4 kB · 84 lines</span>
              <span>·</span>
              <span>~620 tokens</span>
              <span>·</span>
              <span>resolves <code style={{ color: T.info }}>@include</code> ×2 → 1.8 kB extra</span>
              <div style={{ flex: 1 }} />
              <Btn variant="ghost">Preview resolved</Btn>
              <Btn variant="primary">Apply &amp; /reload</Btn>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}

window.ContextEditor = ContextEditor;
