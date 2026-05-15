// Tool inspector — deep-dive on a single tool call: args (JSON), output,
// timing, cost, and a real diff viewer for edit_file calls.

function ToolInspector() {
  return (
    <PiWindow title="pi · inspect · edit_file #14">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* breadcrumb / header */}
        <div style={{
          padding: '12px 24px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: F.mono, fontSize: 12,
        }}>
          <span style={{ color: T.textDim }}>pi ui design system</span>
          <span style={{ color: T.textFaint }}>›</span>
          <span style={{ color: T.textDim }}>turn 5</span>
          <span style={{ color: T.textFaint }}>›</span>
          <span style={{ color: T.tool, fontWeight: 500 }}>edit_file</span>
          <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)">
            <Dot color={T.ok} size={5} /> ok
          </Pill>
          <Pill>320 ms</Pill>
          <Pill>$0.0012</Pill>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="↺">Re-run</Btn>
          <Btn variant="ghost" icon="↶">Revert</Btn>
          <Btn variant="ghost" icon="↗">Open in editor</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* args panel */}
          <div style={{
            width: 340, flexShrink: 0, borderRight: `1px solid ${T.border}`,
            background: T.bgPanel, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '12px 16px 6px', fontFamily: F.mono, fontSize: 10,
              color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              arguments · JSON
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 12px',
              fontFamily: F.mono, fontSize: 11.5, lineHeight: 1.7,
              color: T.text, whiteSpace: 'pre' }}>
              {'{\n  '}
              <span style={{ color: T.info }}>"path"</span>
              {': '}
              <span style={{ color: T.warn }}>"src/session/store.ts"</span>
              {',\n  '}
              <span style={{ color: T.info }}>"old_string"</span>
              {': '}
              <span style={{ color: T.warn }}>"return tree;"</span>
              {',\n  '}
              <span style={{ color: T.info }}>"new_string"</span>
              {':\n    '}
              <span style={{ color: T.warn }}>
                "if (!tree) throw new SessionNotFoundError(id);\n    return this.migrate(tree);"
              </span>
              {',\n  '}
              <span style={{ color: T.info }}>"replace_all"</span>
              {': '}
              <span style={{ color: T.tool }}>false</span>
              {'\n}'}
            </div>

            <div style={{ padding: '12px 16px 6px', fontFamily: F.mono, fontSize: 10,
              color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8,
              borderTop: `1px solid ${T.border}` }}>
              tool · edit_file
            </div>
            <div style={{ padding: '0 16px 14px', fontFamily: F.mono, fontSize: 11,
              color: T.textDim, lineHeight: 1.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>source</span><span style={{ color: T.text }}>builtin</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>permission</span><span style={{ color: T.ok }}>auto-allow ·  *.ts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>cwd guard</span><span style={{ color: T.ok }}>passed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>called at</span><span style={{ color: T.text }}>14:09:41.20</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>returned</span><span style={{ color: T.text }}>+320 ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>tokens</span><span style={{ color: T.text }}>1,124 in · 218 out</span>
              </div>
            </div>
          </div>

          {/* diff panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
            background: T.bg, minWidth: 0 }}>
            <div style={{
              padding: '10px 16px', borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: F.mono, fontSize: 11,
            }}>
              <span style={{ color: T.text }}>src/session/store.ts</span>
              <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)">+12</Pill>
              <Pill color={T.err} bg={T.errBg} border="rgba(226,107,94,0.3)">−1</Pill>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 0,
                borderRadius: 4, overflow: 'hidden',
                border: `1px solid ${T.border}` }}>
                {['unified', 'split', 'inline'].map((v, i) => (
                  <div key={v} style={{
                    padding: '4px 10px', fontFamily: F.mono, fontSize: 10.5,
                    background: i === 0 ? T.bgElev : 'transparent',
                    color: i === 0 ? T.text : T.textMuted,
                    borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
                  }}>{v}</div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', fontFamily: F.mono,
              fontSize: 12, lineHeight: 1.65 }}>
              {[
                [' ', 138, '  /**'],
                [' ', 139, '   * Load a session tree from disk.'],
                [' ', 140, '   *'],
                [' ', 141, '   * @throws SessionNotFoundError if the id has no on-disk record'],
                [' ', 142, '   */'],
                [' ', 143, '  async loadSession(id: string): Promise<SessionTree> {'],
                [' ', 144, '    const tree = await this.fs.readJson<RawTree>(`${id}.json`);'],
                ['-', 145, '    return tree;'],
                ['+', 145, '    if (!tree) {'],
                ['+', 146, '      throw new SessionNotFoundError(id);'],
                ['+', 147, '    }'],
                ['+', 148, '    if (tree.schemaVersion < CURRENT_SCHEMA_VERSION) {'],
                ['+', 149, '      this.log.info({ id, from: tree.schemaVersion },'],
                ['+', 150, '        "migrating session");'],
                ['+', 151, '      const migrated = await migrate(tree);'],
                ['+', 152, '      await this.fs.writeJson(`${id}.json`, migrated);'],
                ['+', 153, '      return migrated;'],
                ['+', 154, '    }'],
                ['+', 155, '    return tree;'],
                [' ', 156, '  }'],
                [' ', 157, ''],
                [' ', 158, '  async saveSession(tree: SessionTree) {'],
              ].map(([t, n, s], i) => {
                const bg = t === '+' ? T.okBg : t === '-' ? T.errBg : 'transparent';
                const fg = t === '+' ? T.ok : t === '-' ? T.err : T.text;
                const gut = t === '+' ? T.ok : t === '-' ? T.err : T.textFaint;
                return (
                  <div key={i} style={{ display: 'flex', background: bg }}>
                    <span style={{ width: 48, padding: '0 8px', textAlign: 'right',
                      color: T.textFaint, fontSize: 10.5, flexShrink: 0,
                      borderRight: `1px solid ${T.borderDim}` }}>{n}</span>
                    <span style={{ width: 16, textAlign: 'center', color: gut, flexShrink: 0 }}>{t === ' ' ? '' : t}</span>
                    <span style={{ color: fg, paddingRight: 12, whiteSpace: 'pre' }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}

// ─── Permission prompt — built by an extension (permission-gate). ──
function PermissionPrompt() {
  return (
    <PiWindow title="pi · permission requested">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        background: T.bg, position: 'relative' }}>
        {/* faded conversation behind */}
        <div style={{ flex: 1, padding: 24, opacity: 0.25, filter: 'blur(0.3px)' }}>
          <MessageUser>
            We need to clean up the gist storage for cancelled exports.
          </MessageUser>
          <MessageAssistant>
            Found 14 orphaned uploads in <code style={{ color: T.pi }}>~/.pi/share/</code>.
            I'll remove them.
          </MessageAssistant>
        </div>

        {/* modal */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            width: 580, borderRadius: 10, overflow: 'hidden',
            background: T.bgPanel,
            border: `1px solid ${T.borderHi}`,
            boxShadow: '0 18px 56px rgba(0,0,0,0.55)',
          }}>
            <div style={{
              padding: '14px 18px', borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
              background: T.warnBg,
            }}>
              <span style={{ color: T.warn, fontSize: 16 }}>⚠</span>
              <span style={{ fontFamily: F.sans, fontSize: 14, color: T.text, fontWeight: 500 }}>
                Tool needs permission
              </span>
              <div style={{ flex: 1 }} />
              <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>
                @earendil/permission-gate · v1.1
              </span>
            </div>

            <div style={{ padding: '18px 18px 14px', fontFamily: F.mono, fontSize: 12.5,
              color: T.text, lineHeight: 1.7 }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: T.tool, fontWeight: 500 }}>bash</span>
                <span style={{ color: T.textDim }}>(</span>
                <span style={{ color: T.warn }}>rm -rf ~/.pi/share/orphan-*</span>
                <span style={{ color: T.textDim }}>)</span>
              </div>

              <div style={{
                padding: '10px 12px', borderRadius: 5,
                background: T.bgInput, border: `1px solid ${T.border}`,
                fontFamily: F.mono, fontSize: 11.5, color: T.textDim,
                lineHeight: 1.7,
              }}>
                Resolved: <span style={{ color: T.text }}>rm -rf /Users/maz/.pi/share/orphan-*</span>
                <br />
                Matches: <span style={{ color: T.text }}>14 files · 6.2 MB</span>
                <br />
                Outside cwd: <span style={{ color: T.ok }}>no</span> · destructive: <span style={{ color: T.err }}>yes</span>
              </div>
            </div>

            <div style={{ padding: '0 18px 14px',
              fontFamily: F.mono, fontSize: 11, color: T.textMuted, lineHeight: 1.7 }}>
              policy: <code style={{ color: T.info }}>~/.pi/permissions.toml</code> · <span style={{ color: T.warn }}>rm -rf</span> is not allow-listed
            </div>

            <div style={{
              padding: '12px 18px', borderTop: `1px solid ${T.border}`,
              background: T.bg,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <input type="checkbox" style={{ accentColor: T.pi }} defaultChecked />
                <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim }}>
                  remember: allow <code style={{ color: T.info }}>rm -rf ~/.pi/share/*</code> for this project
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Btn variant="danger" kbd="Esc">Deny &amp; abort run</Btn>
                <Btn variant="outline">Deny once</Btn>
                <div style={{ flex: 1 }} />
                <Btn variant="secondary">Allow once</Btn>
                <Btn variant="primary" kbd="↵">Allow &amp; remember</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}

window.ToolInspector = ToolInspector;
window.PermissionPrompt = PermissionPrompt;
