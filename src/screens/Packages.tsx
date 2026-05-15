import { useEffect } from 'react';
import { T, F } from '../tokens';
import { Pill, Btn, Dot } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useNav } from '../context/NavContext';
import { usePackageStore, type Package } from '../store/packageStore';

function PackageCard({ pkg, onInstall, onUninstall, busy }: {
  pkg: Package; onInstall: () => void; onUninstall: () => void; busy: boolean;
}) {
  const kindColor: Record<string, string> = {
    extension: T.tool, skill: T.info, prompt: T.warn, theme: T.pi, bundle: T.ok,
  };
  const c = kindColor[pkg.kind] || T.textDim;
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 6,
      border: `1px solid ${pkg.featured ? T.piBorder : T.border}`,
      background: pkg.featured ? T.piBg : T.bgPanel,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 5, flexShrink: 0,
          background: T.bgElev, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: F.mono, fontSize: 16, color: c, fontWeight: 600,
        }}>{pkg.mark}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontFamily: F.mono, fontSize: 13, color: T.text, fontWeight: 500 }}>{pkg.name}</span>
            <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>v{pkg.version}</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, marginTop: 2 }}>by {pkg.author}</div>
        </div>
        <Pill color={c} bg={`${c}15`} border={`${c}40`}>{pkg.kind}</Pill>
      </div>
      <div style={{ fontFamily: F.sans, fontSize: 12.5, color: T.textDim, lineHeight: 1.5 }}>{pkg.summary}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4, borderTop: `1px solid ${T.borderDim}` }}>
        <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>⇣ {pkg.downloads}</span>
        <div style={{ flex: 1 }} />
        {pkg.installed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)">
              <Dot color={T.ok} size={5} /> installed
            </Pill>
            <Btn variant="ghost" onClick={onUninstall} disabled={busy}>
              {busy ? '…' : 'remove'}
            </Btn>
          </div>
        ) : (
          <Btn variant="outline" onClick={onInstall} disabled={busy}>
            {busy ? 'installing…' : 'install'}
          </Btn>
        )}
      </div>
    </div>
  );
}

export function Packages() {
  const { navigate } = useNav();
  const { packages, installing, loadPackages, install, uninstall } = usePackageStore();

  useEffect(() => { loadPackages() }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const installed = packages.filter((p) => p.installed);
  const featured = packages.filter((p) => p.featured && !p.installed);
  const all = packages.filter((p) => !p.installed);
  return (
    <PiWindow title="pi · packages">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '16px 24px 12px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: F.sans, fontSize: 17, color: T.text, fontWeight: 500 }}>Packages</span>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim }}>
              pi install npm:@author/name · pi install git:github.com/user/repo
            </span>
            <div style={{ flex: 1 }} />
            <Btn variant="outline" icon="↗">Browse pi.dev/packages</Btn>
            <Btn variant="secondary" icon="✎">Publish</Btn>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {([['installed', String(installed.length), true], ['discover', String(all.length)], ['extensions', '52'], ['skills', '38'], ['prompts', '24'], ['themes', '13']] as [string, string, boolean?][]).map(([k, c, a]) => (
              <div key={k} onClick={() => k === 'themes' ? navigate('theme') : undefined} style={{
                padding: '6px 12px', borderRadius: 5,
                fontFamily: F.mono, fontSize: 11.5,
                color: a ? T.text : T.textDim,
                background: a ? T.bgElev : 'transparent',
                border: `1px solid ${a ? T.border : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              }}>
                <span>{k}</span>
                <span style={{ color: T.textFaint, fontSize: 10 }}>{c}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 5,
              border: `1px solid ${T.border}`, background: T.bgInput,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted, width: 220,
            }}>
              <span>⌕</span><span>search packages…</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px', background: T.bg }}>
          {installed.length > 0 && (
            <>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                installed · {installed.length}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                {installed.map((p) => (
                  <PackageCard key={p.id} pkg={p}
                    busy={installing.has(p.id)}
                    onInstall={() => install(p.id)}
                    onUninstall={() => uninstall(p.id)} />
                ))}
              </div>
            </>
          )}

          {featured.length > 0 && (
            <>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>featured this week</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                {featured.map((p) => (
                  <PackageCard key={p.id} pkg={p}
                    busy={installing.has(p.id)}
                    onInstall={() => install(p.id)}
                    onUninstall={() => uninstall(p.id)} />
                ))}
              </div>
            </>
          )}

          <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>install from anywhere</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([['npm', 'pi install npm:@earendil/sub-agents', 'verified, semver, signed'],
               ['git', 'pi install git:github.com/badlogic/pi-doom', 'main branch or @tag'],
               ['local', 'pi install ./my-package', 'symlink for development'],
               ['url', 'pi install https://example.com/pkg.tar.gz', 'tarball with manifest'],
            ] as const).map(([k, c, h]) => (
              <div key={k} style={{ padding: '10px 14px', borderRadius: 5, border: `1px solid ${T.border}`, background: T.bgPanel }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>{k}</Pill>
                  <code style={{ fontFamily: F.mono, fontSize: 11.5, color: T.text }}>{c}</code>
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, paddingLeft: 38 }}>{h}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
