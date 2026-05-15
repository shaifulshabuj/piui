import { T, F } from '../tokens';
import { Pill, Btn, Dot, SectionLabel } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useNav } from '../context/NavContext';

function TabItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <span style={{
      padding: '4px 10px', fontFamily: F.mono, fontSize: 11.5,
      color: active ? T.text : T.textDim, borderBottom: `2px solid ${active ? T.pi : 'transparent'}`,
      cursor: 'pointer',
    }}>{label}</span>
  );
}

export function ExtensionDetail() {
  const { navigate } = useNav();
  return (
    <PiWindow title="pi · packages / @earendil/plan-mode">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11.5, color: T.textDim, cursor: 'pointer' }} onClick={() => navigate('packages')}>packages</span>
          <span style={{ color: T.textFaint, fontSize: 11 }}>›</span>
          <span style={{ fontFamily: F.mono, fontSize: 11.5, color: T.text }}>@earendil/plan-mode</span>
          <div style={{ flex: 1 }} />
          <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)"><Dot color={T.ok} size={5} /> installed</Pill>
          <Btn variant="outline">v2.0.1</Btn>
          <Btn variant="danger">uninstall</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{
            width: 240, flexShrink: 0, padding: '14px 12px',
            borderRight: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto',
          }}>
            <div style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>plan-mode</div>
            <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, marginBottom: 12 }}>by earendil</div>
            <div style={{ fontFamily: F.sans, fontSize: 12.5, color: T.textDim, lineHeight: 1.5, marginBottom: 14 }}>
              Adds /plan command — pi writes a plan, you approve, it executes. Pauses between phases for review.
            </div>
            <SectionLabel>metadata</SectionLabel>
            {([
              ['kind', 'extension'],
              ['version', '2.0.1'],
              ['pi compat', '^1.0.0'],
              ['size', '14 KB'],
              ['license', 'MIT'],
              ['downloads', '18.4k total'],
              ['stars', '★ 312'],
            ] as const).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>{k}</span>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.text }}>{v}</span>
              </div>
            ))}
            <div style={{ height: 12 }} />
            <SectionLabel>exposes tools</SectionLabel>
            {['plan_write', 'plan_execute_step', 'plan_pause', 'plan_read'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Dot color={T.tool} size={6} />
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.tool }}>{t}</span>
              </div>
            ))}
            <div style={{ height: 12 }} />
            <SectionLabel>adds commands</SectionLabel>
            {['/plan', '/plan-status', '/plan-clear'].map((c) => (
              <div key={c} style={{ fontFamily: F.mono, fontSize: 11, color: T.pi, marginBottom: 5 }}>{c}</div>
            ))}
            <div style={{ height: 12 }} />
            <SectionLabel>permissions</SectionLabel>
            {['file:read', 'file:write', 'shell:run'].map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <Pill color={T.warn} bg="rgba(251,189,35,0.1)" border="rgba(251,189,35,0.3)">{p}</Pill>
              </div>
            ))}
            <div style={{ height: 12 }} />
            <Btn variant="ghost" icon="↗">View on pi.dev</Btn>
            <div style={{ marginTop: 4 }}>
              <Btn variant="ghost" icon="↗">Source on GitHub</Btn>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, padding: '0 16px', background: T.bgPanel }}>
              <TabItem label="README" active />
              <TabItem label="index.ts" />
              <TabItem label="plan.ts" />
              <TabItem label="CHANGELOG" />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px', background: T.bg }}>
              <pre style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
{`# @earendil/plan-mode

Adds /plan, /plan-status, and /plan-clear commands to pi.

## Install

  pi install npm:@earendil/plan-mode

## Usage

  /plan <goal>

Pi will:
1. Write a multi-step plan in plan.md (visible in ContextEditor)
2. Ask you to review and approve
3. Execute each phase, pausing for confirmation
4. Mark each step ✓ or ✗ and continue or retry

## Exposed tools

- plan_write       — creates / overwrites plan.md
- plan_execute_step — runs one plan step in a sub-shell
- plan_pause       — waits for human LGTM before continuing
- plan_read        — reads plan.md, returns structured JSON

## Configuration (AGENTS.md)

  [plan-mode]
  auto_approve = false   # set true to skip confirmation prompts
  phases       = 5       # max phases before auto-pause
  pause_on_err = true    # pause after any non-zero exit

## Permissions

- file:read, file:write — to manage plan.md
- shell:run — to execute steps

## Changelog

v2.0.1 — fix: don't overwrite plan.md if already approved  
v2.0.0 — major rewrite: phased execution, pause-on-error  
v1.x.x — /plan as simple single-step wrapper`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
