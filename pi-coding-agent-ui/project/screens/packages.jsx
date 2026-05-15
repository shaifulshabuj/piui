// Packages — extensions / skills / prompts / themes bundled and installed
// via npm:/git: prefixes. Browse, search, install, manage.

function PackageCard({ name, author, kind, summary, installed, version, downloads, featured, mark }) {
  const kindColor = {
    extension: T.tool, skill: T.info, prompt: T.warn, theme: T.pi, bundle: T.ok,
  }[kind] || T.textDim;
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 6,
      border: `1px solid ${featured ? T.piBorder : T.border}`,
      background: featured ? T.piBg : T.bgPanel,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 5, flexShrink: 0,
          background: T.bgElev, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: F.mono, fontSize: 16, color: kindColor, fontWeight: 600,
        }}>{mark}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontFamily: F.mono, fontSize: 13, color: T.text, fontWeight: 500 }}>
              {name}
            </span>
            <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>
              v{version}
            </span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, marginTop: 2 }}>
            by {author}
          </div>
        </div>
        <Pill color={kindColor} bg={`${kindColor}15`} border={`${kindColor}40`}>{kind}</Pill>
      </div>
      <div style={{ fontFamily: F.sans, fontSize: 12.5, color: T.textDim, lineHeight: 1.5 }}>
        {summary}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        paddingTop: 4, borderTop: `1px solid ${T.borderDim}` }}>
        <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>
          ⇣ {downloads}
        </span>
        <div style={{ flex: 1 }} />
        {installed ? (
          <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)">
            <Dot color={T.ok} size={5} /> installed
          </Pill>
        ) : (
          <Btn variant="outline">install</Btn>
        )}
      </div>
    </div>
  );
}

function Packages() {
  return (
    <PiWindow title="pi · packages">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* header */}
        <div style={{ padding: '16px 24px 12px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: F.sans, fontSize: 17, color: T.text, fontWeight: 500 }}>
              Packages
            </span>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim }}>
              pi install npm:@author/name · pi install git:github.com/user/repo
            </span>
            <div style={{ flex: 1 }} />
            <Btn variant="outline" icon="↗">Browse pi.dev/packages</Btn>
            <Btn variant="secondary" icon="✎">Publish</Btn>
          </div>
          {/* tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              ['installed', '8', true],
              ['discover', '127'],
              ['extensions', '52'],
              ['skills', '38'],
              ['prompts', '24'],
              ['themes', '13'],
            ].map(([k, c, a]) => (
              <div key={k} style={{
                padding: '6px 12px', borderRadius: 5,
                fontFamily: F.mono, fontSize: 11.5,
                color: a ? T.text : T.textDim,
                background: a ? T.bgElev : 'transparent',
                border: `1px solid ${a ? T.border : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{k}</span>
                <span style={{ color: T.textFaint, fontSize: 10 }}>{c}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px', borderRadius: 5,
              border: `1px solid ${T.border}`, background: T.bgInput,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted,
              width: 220,
            }}>
              <span>⌕</span><span>search packages…</span>
            </div>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px', background: T.bg }}>

          <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            installed · 8
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <PackageCard name="@termdraw/pi" author="benvinegar" kind="extension" mark="✎"
              version="1.4.2" downloads="4.1k" installed
              summary="Draw inside the terminal — sketch flow diagrams, sketches, and ASCII art with mouse + tablet input. Integrates with the TUI overlay layer." />
            <PackageCard name="@earendil/plan-mode" author="earendil" kind="extension" mark="◐"
              version="2.0.1" downloads="18.4k" installed featured
              summary="Adds /plan command — pi writes a plan, you approve, it executes. Pauses between phases for review." />
            <PackageCard name="claude-warm" author="mariozechner" kind="theme" mark="❒"
              version="0.6.0" downloads="2.7k" installed
              summary="Warm amber palette with off-black surfaces. Designed to look good in dim rooms." />
            <PackageCard name="rust-engineer" author="badlogic" kind="skill" mark="◧"
              version="1.0.4" downloads="3.2k" installed
              summary="Rust-specific debugging skill: knows cargo, miri, criterion. Loaded on demand when working in Rust projects." />
          </div>

          <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            featured this week
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <PackageCard name="pi-doom" author="badlogic" kind="bundle" mark="◉"
              version="0.3.1" downloads="11.8k" featured
              summary="DOOM, but pi plays it. Bundle of an extension that pipes frames through the TUI plus a skill that teaches pi WAD strategy." />
            <PackageCard name="@oss/sub-agents" author="oss" kind="extension" mark="◯"
              version="1.2.0" downloads="9.3k"
              summary="Spawn child pi instances from a tool call. Each runs in its own session tree, results stream back to the parent." />
            <PackageCard name="commit-and-push" author="mariozechner" kind="prompt" mark="❖"
              version="0.4.0" downloads="6.1k"
              summary="The /commit prompt — generates conventional commits from your staged diff with optional emoji, scopes, and ticket refs." />
            <PackageCard name="permission-gate" author="earendil" kind="extension" mark="🔒"
              version="1.1.0" downloads="5.7k"
              summary="Confirm-before-execute popup for dangerous tools. Allow-list paths, command prefixes, and tool names." />
          </div>

          <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint,
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            install from anywhere
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['npm', 'pi install npm:@earendil/sub-agents', 'verified, semver, signed'],
              ['git', 'pi install git:github.com/badlogic/pi-doom', 'main branch or @tag'],
              ['local', 'pi install ./my-package', 'symlink for development'],
              ['url', 'pi install https://example.com/pkg.tar.gz', 'tarball with manifest'],
            ].map(([k, c, h]) => (
              <div key={k} style={{ padding: '10px 14px', borderRadius: 5,
                border: `1px solid ${T.border}`, background: T.bgPanel }}>
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

window.Packages = Packages;
