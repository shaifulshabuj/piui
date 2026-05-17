import { T, F } from '../tokens';
import { Pill, Btn, Dot, SectionLabel } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useNav } from '../context/NavContext';
import { useCommandsStore } from '../store/commandsStore';

function TabItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <span style={{
      padding: '4px 10px', fontFamily: F.mono, fontSize: 11.5,
      color: active ? T.text : T.textDim, borderBottom: `2px solid ${active ? T.pi : 'transparent'}`,
      cursor: 'pointer',
    }}>{label}</span>
  );
}

const FALLBACK_EXT = {
  name: '@earendil/plan-mode',
  description: 'Adds /plan command — pi writes a plan, you approve, it executes. Pauses between phases for review.',
  source: 'extension' as const,
  location: 'user' as const,
  path: undefined as string | undefined,
};

export function ExtensionDetail() {
  const { navigate, params } = useNav();
  const { commands } = useCommandsStore();

  const extId = params.extId;
  const ext = (extId ? commands.find((c) => c.name === extId) : undefined) ?? FALLBACK_EXT;

  return (
    <PiWindow title={`pi · packages / ${ext.name}`}>
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11.5, color: T.textDim, cursor: 'pointer' }} onClick={() => navigate('packages')}>packages</span>
          <span style={{ color: T.textFaint, fontSize: 11 }}>›</span>
          <span style={{ fontFamily: F.mono, fontSize: 11.5, color: T.text }}>{ext.name}</span>
          <div style={{ flex: 1 }} />
          <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)"><Dot color={T.ok} size={5} /> installed</Pill>
          <Btn variant="danger">uninstall</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{
            width: 240, flexShrink: 0, padding: '14px 12px',
            borderRight: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto',
          }}>
            <div style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>{ext.name}</div>
            {ext.source && (
              <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, marginBottom: 12 }}>{ext.source}</div>
            )}
            <div style={{ fontFamily: F.sans, fontSize: 12.5, color: T.textDim, lineHeight: 1.5, marginBottom: 14 }}>
              {ext.description ?? 'No description available.'}
            </div>
            <SectionLabel>metadata</SectionLabel>
            {([
              ['source', ext.source ?? '—'],
              ['location', ext.location ?? '—'],
            ] as const).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>{k}</span>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.text }}>{v}</span>
              </div>
            ))}
            {ext.path && (
              <div style={{ marginTop: 6 }}>
                <SectionLabel>path</SectionLabel>
                <div
                  onClick={() => navigate('context')}
                  style={{
                    fontFamily: F.mono, fontSize: 10.5, color: T.info,
                    padding: '4px 8px', borderRadius: 4,
                    border: `1px solid ${T.infoBg}`, background: T.infoBg,
                    cursor: 'pointer', wordBreak: 'break-all',
                  }}
                >
                  {ext.path}
                </div>
              </div>
            )}
            <div style={{ height: 12 }} />
            <Btn variant="ghost" icon="↗">View on pi.dev</Btn>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, padding: '0 16px', background: T.bgPanel }}>
              <TabItem label="README" active />
              <TabItem label="CHANGELOG" />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px', background: T.bg }}>
              <pre style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
{`# ${ext.name}

${ext.description ?? 'No description available.'}

## Install

  pi install npm:${ext.name}

## Usage

  /${ext.name.split('/').pop()?.replace(/[^a-z]/gi, '-') ?? ext.name}

${ext.path ? `## Location\n\n  ${ext.path}` : ''}
`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
