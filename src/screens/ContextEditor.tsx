import { T, F } from '../tokens';
import { Pill, Btn, SectionLabel } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';

function FileRow({ name, active, kind }: { name: string; active?: boolean; kind?: string }) {
  const kindColor: Record<string, string> = { agents: T.pi, system: T.tool, project: T.ok };
  const c = kind ? (kindColor[kind] || T.textDim) : T.textDim;
  return (
    <div style={{
      padding: '7px 12px', borderRadius: 4, cursor: 'pointer',
      background: active ? T.bgElev : 'transparent',
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: F.mono, fontSize: 11.5,
      color: active ? T.text : T.textDim,
      borderLeft: `2px solid ${active ? c : 'transparent'}`,
      marginLeft: -2, paddingLeft: 10,
    }}>
      <span style={{ color: c, fontSize: 10 }}>◈</span>
      <span style={{ flex: 1 }}>{name}</span>
      {kind && <Pill color={c} bg={`${c}15`} border={`${c}40`}>{kind}</Pill>}
    </div>
  );
}

export function ContextEditor() {
  return (
    <PiWindow title="pi · context editor">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Context Editor</span>
          <Pill>AGENTS.md · SYSTEM.md</Pill>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>changes auto-reload on /reload or new session</span>
          <Btn variant="ghost" icon="↗">pi.dev/context</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{
            width: 220, flexShrink: 0, padding: '14px 10px',
            borderRight: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto',
          }}>
            <SectionLabel>hierarchy · user scope</SectionLabel>
            <FileRow name="~/.pi/AGENTS.md" kind="agents" />
            <FileRow name="~/.pi/SYSTEM.md" kind="system" />
            <div style={{ height: 8 }} />
            <SectionLabel>hierarchy · project scope</SectionLabel>
            <FileRow name="./AGENTS.md" kind="agents" active />
            <FileRow name="./SYSTEM.md" kind="system" />
            <FileRow name="./src/AGENTS.md" kind="agents" />
            <FileRow name="./CLAUDE.md" kind="project" />
            <div style={{ height: 8 }} />
            <SectionLabel>injected · installed pkg</SectionLabel>
            <FileRow name="@earendil/plan-mode" />
            <FileRow name="rust-engineer skill" />
            <div style={{ height: 10 }} />
            <Btn variant="ghost" icon="+">New context file</Btn>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: 13, color: T.pi }}>./AGENTS.md</span>
              <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)">saved</Pill>
              <div style={{ flex: 1 }} />
              <Btn variant="ghost" icon="↺">/reload</Btn>
              <Btn variant="ghost" icon="↗">Open in editor</Btn>
            </div>

            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <div style={{ flex: 1, overflow: 'auto', background: T.bg, position: 'relative' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{
                    width: 38, flexShrink: 0, background: T.bgPanel, borderRight: `1px solid ${T.borderDim}`,
                    padding: '14px 0', overflow: 'hidden',
                    fontFamily: F.mono, fontSize: 11.5, color: T.textFaint, lineHeight: '20px', textAlign: 'right',
                  }}>
                    {Array.from({ length: 40 }, (_, i) => (
                      <div key={i} style={{ padding: '0 8px' }}>{i + 1}</div>
                    ))}
                  </div>
                  <pre style={{
                    flex: 1, margin: 0, padding: '14px 18px', overflow: 'auto',
                    fontFamily: F.mono, fontSize: 12.5, color: T.text, lineHeight: '20px', whiteSpace: 'pre-wrap',
                  }}>
{`# AGENTS.md — Project context for pi

This is the ${String.fromCharCode(112, 105) /* pi */} project's coding assistant configuration.
Loaded automatically when pi is invoked from this directory.

## Project

Name: piui  
Stack: TypeScript · React · Vite · Electron  
Purpose: Desktop UI for the pi coding agent CLI.

## Conventions

- All React components use function syntax (no class components)
- TypeScript strict mode enabled
- Imports: primitives from \`@/components/primitives\`
- All screens live in \`src/screens/\`
- Design tokens imported from \`src/tokens.ts\`

## Tool use policy

- Prefer read before write — always check the file first
- Never run \`rm -rf\` without listing contents first
- Shell commands: use \`--no-pager\` with git

[plan-mode]
auto_approve = false
phases = 5
pause_on_err = true

## Context window

The project uses warm dark theme (T.bg = #0e0d0b).
Accent color is amber (T.pi = #f0a45a).
Font stack: Geist Mono (primary), Geist (prose).`}
                  </pre>
                </div>
              </div>

              <div style={{
                width: 220, flexShrink: 0, borderLeft: `1px solid ${T.border}`,
                background: T.bgPanel, padding: '14px 12px', overflow: 'auto',
              }}>
                <SectionLabel>merged context preview</SectionLabel>
                <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, lineHeight: 1.6, marginBottom: 10 }}>
                  Total tokens consumed by context files:
                </div>
                <div style={{ marginBottom: 12 }}>
                  {([
                    ['~/.pi/AGENTS.md', '312 tok', T.pi],
                    ['./AGENTS.md', '687 tok', T.pi],
                    ['./src/AGENTS.md', '201 tok', T.pi],
                    ['@earendil/plan-mode', '145 tok', T.tool],
                    ['rust-engineer', '89 tok', T.tool],
                  ] as const).map(([name, tok, c]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: F.mono, fontSize: 10, color: c, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{name}</span>
                      <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>{tok}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${T.borderDim}`, marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: F.mono, fontSize: 10, color: T.text, fontWeight: 600 }}>total</span>
                    <span style={{ fontFamily: F.mono, fontSize: 10, color: T.text, fontWeight: 600 }}>1,434 tok</span>
                  </div>
                </div>
                <SectionLabel>reload trigger</SectionLabel>
                <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, marginBottom: 6 }}>
                  Context is re-injected:
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textDim, lineHeight: 1.8 }}>
                  · on session start<br/>
                  · after /reload command<br/>
                  · after new_session RPC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
