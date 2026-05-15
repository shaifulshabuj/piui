import { T, F } from '../tokens';
import { Btn, Kbd } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';

export function ShareExport() {
  const gistUrl = 'https://gist.github.com/earendil/a7b3f9e20c1d';
  return (
    <PiWindow title="pi · share">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>/share</span>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Share & Export</span>
          <div style={{ flex: 1 }} />
          <Kbd>Ctrl+S</Kbd>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>save</span>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', background: T.bg }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>shared link</div>
            <div style={{
              borderRadius: 6, border: `1px solid ${T.piBorder}`, background: T.piBg, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: T.pi, marginBottom: 4 }}>{gistUrl}</div>
                <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>Published as GitHub Gist · public · 3 min ago</div>
              </div>
              <Btn variant="outline" icon="⊞">Copy</Btn>
              <Btn variant="ghost" icon="↗">Open</Btn>
            </div>

            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>export options</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
              {([
                ['markdown', '⊞', 'Conversation as .md with code blocks and tool call summaries', T.pi],
                ['html', '◉', 'Self-contained .html with syntax highlighting and the pi theme', T.info],
                ['json', '◈', 'Raw session JSON — all messages, tool calls, usage metadata', T.tool],
                ['pdf', '☐', 'Print-friendly PDF via headless Chrome (if installed)', T.textDim],
              ] as const).map(([name, icon, desc, c]) => (
                <div key={name} style={{ padding: '14px 16px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: F.mono, fontSize: 18, color: c }}>{icon}</span>
                    <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text, fontWeight: 500 }}>{name}</span>
                  </div>
                  <div style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, flex: 1 }}>{desc}</div>
                  <Btn variant="outline">Export .{name === 'html' ? 'html' : name === 'markdown' ? 'md' : name === 'json' ? 'json' : 'pdf'}</Btn>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>html preview</div>
            <div style={{
              borderRadius: 6, border: `1px solid ${T.border}`, overflow: 'hidden',
            }}>
              <div style={{ background: T.bgPanel, padding: '8px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>preview · gist.github.com/earendil/a7b3f9e20c1d</span>
              </div>
              <div style={{ background: '#181614', padding: '18px 22px' }}>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: '#e8e0cc', marginBottom: 6 }}>
                  <span style={{ color: '#8a7d64' }}>session: </span>refactor the auth module to use JWT
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: '#8a7d64', marginBottom: 4 }}>user</div>
                <div style={{ background: '#1c1a13', borderRadius: 4, padding: '6px 10px', marginBottom: 12, fontFamily: F.mono, fontSize: 11, color: '#e8e0cc' }}>
                  refactor the auth module to use JWT
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: '#f0a45a', marginBottom: 4 }}>π assistant</div>
                <div style={{ background: '#15140f', borderRadius: 4, padding: '6px 10px', fontFamily: F.mono, fontSize: 11, color: '#c4b896' }}>
                  I'll refactor the auth module to replace session cookies with JWT…
                </div>
              </div>
            </div>
          </div>

          <div style={{ width: 220, flexShrink: 0, borderLeft: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto', padding: '16px 14px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>session info</div>
            {([
              ['title', 'JWT auth refactor'],
              ['messages', '47'],
              ['tool calls', '18'],
              ['tokens used', '128,420'],
              ['cost', '$0.42'],
              ['model', 'claude-sonnet-4-5'],
              ['duration', '23 min'],
              ['created', '2025-01-18 14:32'],
            ] as const).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>{k}</span>
                <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.text }}>{v}</span>
              </div>
            ))}
            <div style={{ height: 14 }} />
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>gist settings</div>
            {([
              ['visibility', 'public'],
              ['format', 'markdown + html'],
              ['include tools', 'yes'],
              ['include usage', 'yes'],
            ] as const).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>{k}</span>
                <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.text }}>{v}</span>
              </div>
            ))}
            <div style={{ height: 12 }} />
            <Btn variant="primary" icon="☁">Re-publish</Btn>
            <div style={{ marginTop: 6 }}>
              <Btn variant="ghost" icon="✕">Delete gist</Btn>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
