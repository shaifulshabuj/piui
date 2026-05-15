import { useEffect } from 'react';
import { T, F } from '../tokens';
import { Pill, Btn, Dot, SectionLabel } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useSettingsStore } from '../store/settingsStore';

interface ThemeEntry {
  name: string; author: string; preview: string[]; installed?: boolean;
}

function Swatch({ color }: { color: string }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: 4,
      background: color, border: '1px solid rgba(255,255,255,0.08)',
    }} />
  );
}

function ThemeCard({ theme, active, onSelect }: { theme: ThemeEntry; active: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{
      borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
      border: `2px solid ${active ? T.pi : T.border}`,
    }}>
      <div style={{
        height: 60, background: theme.preview[0],
        display: 'flex', alignItems: 'flex-end', padding: '0 8px 6px',
        gap: 4,
      }}>
        {theme.preview.map((c, i) => <Swatch key={i} color={c} />)}
      </div>
      <div style={{ padding: '8px 10px', background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11.5, color: T.text }}>{theme.name}</div>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textMuted }}>by {theme.author}</div>
        </div>
        {active && <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>active</Pill>}
        {theme.installed && !active && <Dot color={T.ok} size={5} />}
      </div>
    </div>
  );
}

const THEMES: ThemeEntry[] = [
  { name: 'pi-dark', author: 'earendil', preview: ['#0e0d0b', '#15140f', '#f0a45a', '#2c2a24'], installed: true },
  { name: 'claude-warm', author: 'mariozechner', preview: ['#12110e', '#1a180f', '#e8a84d', '#25231a'], installed: true },
  { name: 'pi-light', author: 'earendil', preview: ['#faf8f2', '#f0ede6', '#d4691c', '#e8e0d0'] },
  { name: 'nord-pi', author: 'community', preview: ['#2e3440', '#3b4252', '#88c0d0', '#4c566a'] },
  { name: 'monokai-pi', author: 'community', preview: ['#272822', '#1e1f1c', '#f92672', '#75715e'] },
  { name: 'github-dark', author: 'community', preview: ['#0d1117', '#161b22', '#58a6ff', '#30363d'] },
  { name: 'solarized-dark', author: 'community', preview: ['#002b36', '#073642', '#2aa198', '#586e75'] },
  { name: 'synthwave-84', author: 'robb0wen', preview: ['#1a0033', '#220042', '#f92aad', '#36f9f6'] },
];

function TokenRow({ name, value, preview }: { name: string; value: string; preview?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: `1px solid ${T.borderDim}` }}>
      {preview && <div style={{ width: 16, height: 16, borderRadius: 3, background: preview, border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />}
      <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi, flex: 1 }}>{name}</span>
      <span style={{ fontFamily: F.mono, fontSize: 11, color: T.text }}>{value}</span>
    </div>
  );
}

export function ThemeCustomizer() {
  const { theme, setTheme } = useSettingsStore();

  // Persist active theme to ~/.pi/themes/current.json
  useEffect(() => {
    if (!window.pi?.fs) return;
    window.pi.fs.writeFile('themes/current.json', JSON.stringify({ theme }))
      .catch(() => { /* best-effort */ });
  }, [theme]);

  const activeTheme = THEMES.find((t) => t.name === theme) ?? THEMES[0];
  return (
    <PiWindow title="pi · theme">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Theme</span>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="↗">Browse pi.dev/themes</Btn>
          <Btn variant="secondary" icon="+">New theme</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px', background: T.bg }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>gallery</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
              {THEMES.map((t) => (
                <ThemeCard key={t.name} theme={t} active={t.name === theme} onSelect={() => setTheme(t.name)} />
              ))}
            </div>

            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>live preview</div>
            <div style={{
              borderRadius: 6, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 22,
            }}>
              <div style={{ background: T.bgPanel, padding: '8px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted, flex: 1, textAlign: 'center' }}>pi — preview</span>
              </div>
              <div style={{ background: T.bg, padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textFaint }}>user</span>
                      <div style={{ background: T.bgElev, borderRadius: 5, padding: '8px 10px', marginTop: 4, fontFamily: F.mono, fontSize: 12, color: T.text }}>
                        refactor the auth module to use JWT
                      </div>
                    </div>
                    <div>
                      <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>π</span>
                      <div style={{ background: T.bgPanel, borderRadius: 5, padding: '8px 10px', marginTop: 4, fontFamily: F.mono, fontSize: 12, color: T.text }}>
                        I'll refactor the auth module…
                        <div style={{ display: 'inline-block', width: 7, height: 13, background: T.pi, marginLeft: 2, verticalAlign: 'text-bottom', animation: 'pi-blink 1s steps(2) infinite' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ width: 120, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {([['ok', T.ok], ['warn', T.warn], ['err', T.err], ['info', T.info], ['tool', T.tool], ['accent', T.pi]] as const).map(([n, c]) => (
                      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                        <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textMuted }}>{n}</span>
                        <span style={{ fontFamily: F.mono, fontSize: 10, color: c }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ width: 240, flexShrink: 0, borderLeft: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto' }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text }}>{activeTheme.name}</span>
              <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>active</Pill>
              <div style={{ flex: 1 }} />
              <Btn variant="ghost" icon="✎">Edit JSON</Btn>
            </div>
            <div style={{ padding: '10px 14px' }}>
              <SectionLabel>surface tokens</SectionLabel>
              <TokenRow name="T.bg" value="#0e0d0b" preview="#0e0d0b" />
              <TokenRow name="T.bgPanel" value="#15140f" preview="#15140f" />
              <TokenRow name="T.bgElev" value="#1c1a13" preview="#1c1a13" />
              <TokenRow name="T.bgInput" value="#1a1812" preview="#1a1812" />
              <div style={{ marginTop: 10 }}>
                <SectionLabel>text tokens</SectionLabel>
              </div>
              <TokenRow name="T.text" value="#e8e0cc" preview="#e8e0cc" />
              <TokenRow name="T.textDim" value="#c4b896" preview="#c4b896" />
              <TokenRow name="T.textMuted" value="#8a7d64" preview="#8a7d64" />
              <TokenRow name="T.textFaint" value="#5a5040" preview="#5a5040" />
              <div style={{ marginTop: 10 }}>
                <SectionLabel>accent tokens</SectionLabel>
              </div>
              <TokenRow name="T.pi" value="#f0a45a" preview="#f0a45a" />
              <TokenRow name="T.ok" value="#8fb86a" preview="#8fb86a" />
              <TokenRow name="T.warn" value="#fbbd23" preview="#fbbd23" />
              <TokenRow name="T.err" value="#e05c5c" preview="#e05c5c" />
              <TokenRow name="T.info" value="#5baaed" preview="#5baaed" />
              <TokenRow name="T.tool" value="#c79bd6" preview="#c79bd6" />
              <div style={{ marginTop: 10 }}>
                <SectionLabel>border tokens</SectionLabel>
              </div>
              <TokenRow name="T.border" value="#2c2820" preview="#2c2820" />
              <TokenRow name="T.borderDim" value="#201e18" preview="#201e18" />
              <TokenRow name="T.borderHi" value="#3d3830" preview="#3d3830" />
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
