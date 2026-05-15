// Main chat — the core agent surface. Streaming response with tool calls,
// steering box, status. Terminal-rooted: monospace-forward, tight density.

function SidebarMain() {
  return (
    <div style={{
      width: 240, flexShrink: 0, background: T.bgPanel,
      borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '12px 8px',
    }}>
      <div style={{ display: 'flex', gap: 6, padding: '4px 4px 8px' }}>
        <Btn variant="secondary" icon="+" kbd="⌘N" style={{ flex: 1, justifyContent: 'flex-start' }}>
          New session
        </Btn>
      </div>

      <SectionLabel>Today</SectionLabel>
      <NavItem icon="●" label="pi ui design system" active />
      <NavItem icon="○" label="refactor session store" />
      <NavItem icon="○" label="debug auth race" />

      <SectionLabel>Yesterday</SectionLabel>
      <NavItem icon="○" label="rpc protocol notes" dim />
      <NavItem icon="○" label="theme: solarized port" dim />
      <NavItem icon="○" label="benchmark gpt-5 vs sonnet" dim />

      <SectionLabel>Last week</SectionLabel>
      <NavItem icon="○" label="onboarding copy" dim />
      <NavItem icon="○" label="package: pi-doom review" dim />

      <div style={{ flex: 1 }} />

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, marginTop: 8 }}>
        <NavItem icon="✦" label="Packages" hint="3" />
        <NavItem icon="◧" label="Skills" hint="12" />
        <NavItem icon="❖" label="Prompts" hint="8" />
        <NavItem icon="⚙" label="Settings" />
      </div>
    </div>
  );
}

function MessageUser({ children }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 24px' }}>
      <div style={{ width: 18, flexShrink: 0, paddingTop: 1,
        fontFamily: F.mono, color: T.pi, fontSize: 13, fontWeight: 600 }}>{'>'}</div>
      <div style={{ flex: 1, fontFamily: F.mono, fontSize: 13.5, lineHeight: 1.6, color: T.text }}>
        {children}
      </div>
    </div>
  );
}

function MessageAssistant({ children, streaming }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 24px' }}>
      <div style={{ width: 18, flexShrink: 0, paddingTop: 2 }}>
        <Pi size={13} />
      </div>
      <div style={{ flex: 1, fontFamily: F.mono, fontSize: 13.5, lineHeight: 1.65, color: T.text }}>
        {children}
        {streaming && (
          <span style={{
            display: 'inline-block', width: 7, height: 14,
            background: T.pi, marginLeft: 2, verticalAlign: 'text-bottom',
            animation: 'pi-blink 1s steps(2) infinite',
          }} />
        )}
      </div>
    </div>
  );
}

function ToolCall({ tool, args, status, output, expanded, children, accent }) {
  const statusColor = status === 'ok' ? T.ok : status === 'run' ? T.pi : status === 'err' ? T.err : T.textDim;
  const statusGlyph = status === 'ok' ? '✓' : status === 'run' ? '◐' : status === 'err' ? '✕' : '·';
  return (
    <div style={{
      margin: '10px 24px 10px 54px',
      border: `1px solid ${T.border}`, borderRadius: 6,
      background: T.bgPanel, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px',
        borderBottom: expanded ? `1px solid ${T.border}` : 'none',
        fontFamily: F.mono, fontSize: 11.5,
      }}>
        <span style={{ color: statusColor, width: 12, textAlign: 'center' }}>{statusGlyph}</span>
        <span style={{ color: accent || T.tool, fontWeight: 500 }}>{tool}</span>
        <span style={{ color: T.textDim }}>(</span>
        <span style={{ color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{args}</span>
        <span style={{ color: T.textDim }}>)</span>
        <div style={{ flex: 1 }} />
        {output && <span style={{ color: T.textMuted, fontSize: 10.5 }}>{output}</span>}
        <span style={{ color: T.textFaint, fontSize: 10 }}>{expanded ? '▾' : '▸'}</span>
      </div>
      {expanded && children}
    </div>
  );
}

function DiffPreview() {
  const lines = [
    { t: 'h', s: '@@ src/session/store.ts:142 @@' },
    { t: ' ', s: '  async loadSession(id: string) {' },
    { t: ' ', s: '    const tree = await this.fs.readJson(`${id}.json`);' },
    { t: '-', s: '    return tree;' },
    { t: '+', s: '    if (!tree) throw new SessionNotFoundError(id);' },
    { t: '+', s: '    return this.migrate(tree);' },
    { t: ' ', s: '  }' },
  ];
  const bg = { '+': T.okBg, '-': T.errBg, ' ': 'transparent', 'h': T.bgElev };
  const fg = { '+': T.ok, '-': T.err, ' ': T.textDim, 'h': T.textMuted };
  return (
    <div style={{ fontFamily: F.mono, fontSize: 11.5, padding: '6px 0' }}>
      {lines.map((l, i) => (
        <div key={i} style={{
          display: 'flex', padding: '0 12px', background: bg[l.t],
          color: fg[l.t], lineHeight: 1.55,
        }}>
          <span style={{ width: 14, color: T.textFaint, flexShrink: 0 }}>
            {l.t === 'h' ? '' : l.t === ' ' ? ' ' : l.t}
          </span>
          <span style={{ whiteSpace: 'pre' }}>{l.s}</span>
        </div>
      ))}
    </div>
  );
}

function StreamedPlanList() {
  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{ marginBottom: 10 }}>
        Looking at <code style={{ color: T.pi, fontWeight: 500 }}>SessionStore.loadSession</code> —
        it returns the raw JSON tree without validation, so a missing
        file silently produces <code style={{ color: T.pi }}>undefined</code>
        downstream. I'll add a typed error and route old schemas through the
        migrator we already have.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
        <PlanItem done>Read session/store.ts and migrate.ts</PlanItem>
        <PlanItem done>Locate every loadSession caller (6 sites)</PlanItem>
        <PlanItem active>Add SessionNotFoundError + tests</PlanItem>
        <PlanItem>Wire migrate() into the load path</PlanItem>
        <PlanItem>Update fixtures so v0 schemas round-trip</PlanItem>
      </div>
    </div>
  );
}

function PlanItem({ children, done, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, fontSize: 13 }}>
      <span style={{ color: done ? T.ok : active ? T.pi : T.textFaint, width: 12, fontSize: 11 }}>
        {done ? '✓' : active ? '◐' : '○'}
      </span>
      <span style={{ color: done ? T.textMuted : active ? T.text : T.textDim,
        textDecoration: done ? 'line-through' : 'none', textDecorationColor: T.textFaint }}>
        {children}
      </span>
    </div>
  );
}

function SteeringQueue() {
  return (
    <div style={{
      margin: '4px 24px 0', padding: '6px 10px',
      border: `1px dashed ${T.piBorder}`, borderRadius: 4,
      background: T.piBg,
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: F.mono, fontSize: 11, color: T.pi,
    }}>
      <span style={{ opacity: 0.9 }}>⟶ queued</span>
      <span style={{ color: T.text, flex: 1 }}>
        also: write a migration test for v0→v2 sessions
      </span>
      <Kbd>Alt+↵</Kbd>
      <span style={{ color: T.piDim, cursor: 'pointer' }}>×</span>
    </div>
  );
}

function Composer() {
  return (
    <div style={{
      padding: '10px 24px 14px',
      borderTop: `1px solid ${T.border}`,
      background: T.bg,
    }}>
      <div style={{
        border: `1px solid ${T.borderHi}`, borderRadius: 8,
        background: T.bgInput,
        boxShadow: `0 0 0 3px ${T.piBg}`,
      }}>
        <div style={{ padding: '10px 12px 6px',
          fontFamily: F.mono, fontSize: 13.5, color: T.text, lineHeight: 1.5 }}>
          Add a snapshot test against the v0 fixture too
          <span style={{
            display: 'inline-block', width: 7, height: 14, background: T.pi,
            marginLeft: 1, verticalAlign: 'text-bottom',
            animation: 'pi-blink 1s steps(2) infinite',
          }} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', borderTop: `1px solid ${T.borderDim}`,
        }}>
          <Pill color={T.tool} bg={T.toolBg} border="rgba(199,155,214,0.25)">
            /test-context
          </Pill>
          <Pill color={T.info} bg={T.infoBg} border="rgba(122,166,216,0.25)">
            @src/session/migrate.ts
          </Pill>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>
            <Kbd>↵</Kbd> steer · <Kbd>Alt+↵</Kbd> queue · <Kbd>/</Kbd> commands
          </span>
        </div>
      </div>
    </div>
  );
}

function MainChat() {
  return (
    <PiWindow title="pi · ~/code/pi-ui · main">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Conversation header — model, branch, tools status */}
        <div style={{
          height: 38, flexShrink: 0, display: 'flex', alignItems: 'center',
          gap: 10, padding: '0 24px',
          borderBottom: `1px solid ${T.border}`,
          fontFamily: F.mono, fontSize: 11.5, color: T.textDim,
        }}>
          <span style={{ color: T.text, fontWeight: 500 }}>pi ui design system</span>
          <Pill border={T.piBorder} bg={T.piBg} color={T.pi}>main</Pill>
          <span style={{ color: T.textFaint }}>·</span>
          <Pill>claude-sonnet-4-5</Pill>
          <span style={{ color: T.textFaint }}>·</span>
          <span>14 turns · 3 branches</span>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="⎇">Tree</Btn>
          <Btn variant="ghost" icon="↗">Share</Btn>
          <Btn variant="ghost" icon="⋯" />
        </div>

        {/* Conversation */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0,
          background: T.bg }}>
          <MessageUser>
            Look at SessionStore.loadSession — it occasionally crashes when
            opening an old session. Find the cause and fix it; the schema
            migration already exists in migrate.ts.
          </MessageUser>

          <MessageAssistant>
            <StreamedPlanList />
          </MessageAssistant>

          <ToolCall tool="read_file" args="src/session/store.ts" status="ok"
            output="412 lines" />
          <ToolCall tool="read_file" args="src/session/migrate.ts" status="ok"
            output="186 lines" />
          <ToolCall tool="grep" args='"loadSession\\(" --type=ts' status="ok"
            output="6 matches" />

          <ToolCall tool="edit_file" args="src/session/store.ts" status="ok"
            output="+12 −1" expanded accent={T.ok}>
            <DiffPreview />
          </ToolCall>

          <ToolCall tool="bash" args="pnpm vitest run session/" status="run"
            output="streaming…" />

          <MessageAssistant streaming>
            Tests are running. Adding the v0 → v2 fixture round-trip first
            so we catch the truncated <code style={{ color: T.pi }}>branches</code>{' '}
            field — that was the actual crash, not the missing-file path.
          </MessageAssistant>

          <SteeringQueue />
          <div style={{ height: 14 }} />
        </div>

        <Composer />
      </div>

      {/* extra status: model, context, cost — overridden so we can show running state */}
    </PiWindow>
  );
}

window.MainChat = MainChat;
