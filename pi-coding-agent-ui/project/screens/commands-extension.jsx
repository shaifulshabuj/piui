// Command palette — / commands, also keyboard shortcut overlay.
// Plus extension/skill detail (TS source + skill manifest).

function CmdRow({ cmd, desc, kbd, hot, kind }) {
  const c = { core: T.pi, prompt: T.info, package: T.tool, skill: T.warn }[kind] || T.pi;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 14px',
      background: hot ? T.piBg : 'transparent',
      borderLeft: `2px solid ${hot ? T.pi : 'transparent'}`,
      fontFamily: F.mono, fontSize: 12,
    }}>
      <code style={{ color: c, fontWeight: 500, minWidth: 160 }}>{cmd}</code>
      <span style={{ flex: 1, color: hot ? T.text : T.textDim }}>{desc}</span>
      {kbd && <Kbd>{kbd}</Kbd>}
    </div>
  );
}

function CommandPalette() {
  return (
    <PiWindow title="pi · command palette">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        background: T.bg, position: 'relative' }}>

        {/* faded chat behind */}
        <div style={{ flex: 1, padding: 24, opacity: 0.18, filter: 'blur(0.5px)' }}>
          <MessageUser>How do I export only the bookmarked turns from this session?</MessageUser>
        </div>

        {/* palette */}
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          width: 660, borderRadius: 10, overflow: 'hidden',
          background: T.bgPanel, border: `1px solid ${T.borderHi}`,
          boxShadow: '0 18px 56px rgba(0,0,0,0.55)',
        }}>
          <div style={{
            padding: '12px 14px', borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: T.pi, fontFamily: F.mono, fontSize: 15 }}>/</span>
            <span style={{ fontFamily: F.mono, fontSize: 14, color: T.text, flex: 1 }}>
              ex
              <span style={{
                display: 'inline-block', width: 7, height: 16, background: T.pi,
                marginLeft: 1, verticalAlign: 'text-bottom',
                animation: 'pi-blink 1s steps(2) infinite',
              }} />
            </span>
            <Kbd>Esc</Kbd>
          </div>

          <div style={{ maxHeight: 460, overflow: 'auto' }}>
            <div style={{ padding: '10px 14px 4px', fontFamily: F.mono, fontSize: 10,
              color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              core
            </div>
            <CmdRow cmd="/export" desc="Save session as HTML to current directory" kind="core" hot />
            <CmdRow cmd="/export --bundle" desc="HTML + diffs + images as zip" kind="core" />

            <div style={{ padding: '10px 14px 4px', fontFamily: F.mono, fontSize: 10,
              color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              also matches
            </div>
            <CmdRow cmd="/extensions" desc="List installed extensions and their commands" kind="core" />
            <CmdRow cmd="/example" desc="Insert a worked example for the current task" kind="prompt" />
            <CmdRow cmd="/explain-diff" desc="Walk through a diff line-by-line" kind="prompt" />

            <div style={{ padding: '10px 14px 4px', fontFamily: F.mono, fontSize: 10,
              color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              every command
            </div>
            <CmdRow cmd="/model" desc="Switch model" kbd="Ctrl+L" kind="core" />
            <CmdRow cmd="/tree" desc="Open session tree navigator" kind="core" />
            <CmdRow cmd="/share" desc="Upload session as GitHub gist" kind="core" />
            <CmdRow cmd="/reload" desc="Re-read AGENTS.md, SYSTEM.md, extensions, themes" kind="core" />
            <CmdRow cmd="/compact" desc="Run compaction now" kind="core" />
            <CmdRow cmd="/install" desc="pi install npm:… or git:…" kind="core" />
            <CmdRow cmd="/clear" desc="Clear conversation, keep settings" kind="core" />
            <CmdRow cmd="/bookmark" desc="Bookmark current turn" kind="core" />
            <CmdRow cmd="/cd ~/code/other" desc="Change project — reloads context" kind="core" />
            <CmdRow cmd="/plan" desc="Plan mode (from @earendil/plan-mode)" kind="package" />
            <CmdRow cmd="/subagent" desc="Spawn child session (@oss/sub-agents)" kind="package" />
            <CmdRow cmd="/permit" desc="Open permission policy editor" kind="package" />
            <CmdRow cmd="/draw" desc="Open termdraw overlay (@termdraw/pi)" kind="package" />
            <CmdRow cmd="/commit" desc="Generate conventional commit" kind="prompt" />
            <CmdRow cmd="/review" desc="Detailed PR review across diff + tests" kind="prompt" />
            <CmdRow cmd="/test-context" desc="Add coverage notes + acceptance" kind="prompt" />

            <div style={{ padding: '10px 14px 4px', fontFamily: F.mono, fontSize: 10,
              color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              type @ to reference a file · ★ commands accept arguments
            </div>
          </div>

          <div style={{
            padding: '8px 14px', borderTop: `1px solid ${T.border}`,
            background: T.bg, fontFamily: F.mono, fontSize: 11, color: T.textMuted,
            display: 'flex', gap: 14,
          }}>
            <span><Kbd>↑↓</Kbd> nav</span>
            <span><Kbd>Tab</Kbd> autocomplete</span>
            <span><Kbd>↵</Kbd> run</span>
            <div style={{ flex: 1 }} />
            <span style={{ color: T.textFaint }}>commands resolved from{' '}
              <span style={{ color: T.info }}>core · prompts · packages · skills</span>
            </span>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}

// ─── Extension detail — TS source + manifest + permissions. ──
function ExtensionDetail() {
  return (
    <PiWindow title="pi · @earendil/plan-mode">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <div style={{ padding: '16px 24px 12px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 6,
            background: T.bgElev, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: F.mono, fontSize: 20, color: T.tool, fontWeight: 600,
          }}>◐</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: F.mono, fontSize: 15, color: T.text, fontWeight: 500 }}>
                @earendil/plan-mode
              </span>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>v2.0.1</span>
              <Pill color={T.tool} bg={T.toolBg} border="rgba(199,155,214,0.25)">extension</Pill>
              <Pill color={T.ok} bg={T.okBg} border="rgba(143,184,106,0.3)">
                <Dot color={T.ok} size={5} /> installed
              </Pill>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted, marginTop: 3 }}>
              by earendil · ⇣ 18.4k · MIT · published 14 days ago
            </div>
          </div>
          <Btn variant="ghost" icon="↺">Update v2.0.2</Btn>
          <Btn variant="ghost" icon="⏸">Disable</Btn>
          <Btn variant="danger">Uninstall</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* manifest sidebar */}
          <div style={{ width: 280, flexShrink: 0, borderRight: `1px solid ${T.border}`,
            background: T.bgPanel, padding: '14px 16px', overflow: 'auto' }}>

            <SectionLabel style={{ padding: '0 0 6px' }}>contributes</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                ['command', '/plan', T.pi],
                ['command', '/plan-show', T.pi],
                ['tool', 'plan_create', T.tool],
                ['tool', 'plan_step', T.tool],
                ['key', 'Ctrl+B', T.info],
                ['overlay', 'plan-status-bar', T.warn],
              ].map(([k, v, c], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 8px', borderRadius: 4, background: T.bgPanel,
                  border: `1px solid ${T.border}`, fontFamily: F.mono, fontSize: 11 }}>
                  <span style={{ color: T.textFaint, width: 56, fontSize: 10 }}>{k}</span>
                  <code style={{ color: c }}>{v}</code>
                </div>
              ))}
            </div>

            <SectionLabel style={{ padding: '14px 0 6px' }}>uses</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4,
              fontFamily: F.mono, fontSize: 11, color: T.textDim }}>
              {['hooks.beforeTurn', 'hooks.afterToolCall', 'tools.register', 'commands.register', 'tui.overlay'].map((x) => (
                <div key={x} style={{ padding: '3px 0' }}>
                  <code style={{ color: T.info }}>{x}</code>
                </div>
              ))}
            </div>

            <SectionLabel style={{ padding: '14px 0 6px' }}>permissions</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
                <Dot color={T.ok} size={5} />
                <span style={{ color: T.text, fontFamily: F.mono }}>read project files</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
                <Dot color={T.ok} size={5} />
                <span style={{ color: T.text, fontFamily: F.mono }}>write to ./.pi/plans/</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
                <Dot color={T.textFaint} size={5} />
                <span style={{ color: T.textMuted, fontFamily: F.mono }}>no network</span>
              </div>
            </div>
          </div>

          {/* source viewer */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
            background: T.bg, minWidth: 0 }}>
            <div style={{
              display: 'flex', borderBottom: `1px solid ${T.border}`,
              background: T.bgPanel, fontFamily: F.mono, fontSize: 11,
            }}>
              {['index.ts', 'plan.ts', 'manifest.json', 'README.md'].map((f, i) => (
                <div key={f} style={{ padding: '8px 14px',
                  background: i === 0 ? T.bg : 'transparent',
                  color: i === 0 ? T.text : T.textDim,
                  borderBottom: `2px solid ${i === 0 ? T.pi : 'transparent'}`,
                  borderRight: `1px solid ${T.borderDim}` }}>{f}</div>
              ))}
              <div style={{ flex: 1 }} />
              <div style={{ padding: '8px 14px', color: T.textMuted }}>read-only · view source</div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px',
              fontFamily: F.mono, fontSize: 12, lineHeight: 1.65,
              color: T.text, whiteSpace: 'pre' }}>
{`import { definePackage } from `}<span style={{ color: T.warn }}>{`'@earendil/pi'`}</span>{`;
import { planStep, planCreate } from `}<span style={{ color: T.warn }}>{`'./plan'`}</span>{`;

`}<span style={{ color: T.textMuted }}>{`// Plan-mode: pi proposes a plan, you approve, it executes step-by-step.
// Pauses after each step for review unless --auto is set.`}</span>{`
export default definePackage({
  `}<span style={{ color: T.info }}>{`name`}</span>{`: `}<span style={{ color: T.warn }}>{`'@earendil/plan-mode'`}</span>{`,

  commands: {
    `}<span style={{ color: T.pi }}>{`'/plan'`}</span>{`: async (ctx, args) => {
      const plan = await planCreate(ctx, args);
      await ctx.print(plan.format());
      ctx.state.set(`}<span style={{ color: T.warn }}>{`'plan'`}</span>{`, plan);
    },
    `}<span style={{ color: T.pi }}>{`'/plan-show'`}</span>{`: async (ctx) => {
      const plan = ctx.state.get(`}<span style={{ color: T.warn }}>{`'plan'`}</span>{`);
      if (!plan) return ctx.error(`}<span style={{ color: T.warn }}>{`'no active plan'`}</span>{`);
      await ctx.print(plan.format());
    },
  },

  hooks: {
    beforeTurn: async (ctx) => {
      const plan = ctx.state.get(`}<span style={{ color: T.warn }}>{`'plan'`}</span>{`);
      if (plan?.active) {
        ctx.system.append(plan.contextBlock());
      }
    },
    afterToolCall: async (ctx, call) => {
      `}<span style={{ color: T.textMuted }}>{`// Mark plan steps complete when the tool that fulfilled them runs.`}</span>{`
      const plan = ctx.state.get(`}<span style={{ color: T.warn }}>{`'plan'`}</span>{`);
      plan?.observe(call);
    },
  },

  tui: {
    overlay: `}<span style={{ color: T.warn }}>{`'plan-status-bar'`}</span>{`,
    keys: { `}<span style={{ color: T.warn }}>{`'Ctrl+B'`}</span>{`: `}<span style={{ color: T.warn }}>{`'/plan-show'`}</span>{` },
  },
});
`}
            </div>

            <div style={{
              padding: '10px 18px', borderTop: `1px solid ${T.border}`,
              background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted,
            }}>
              <span>~/.pi/packages/@earendil/plan-mode/src/index.ts</span>
              <div style={{ flex: 1 }} />
              <Btn variant="ghost" icon="↗">Open in editor</Btn>
              <Btn variant="ghost" icon="↺">Reload</Btn>
              <Btn variant="ghost" icon="⎘">Fork to ~/.pi/extensions/</Btn>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}

window.CommandPalette = CommandPalette;
window.ExtensionDetail = ExtensionDetail;
