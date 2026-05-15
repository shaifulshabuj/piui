import { T, F } from '../tokens';
import { Pill, Btn } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { MessageUser, MessageAssistant, ToolCall, DiffPreview, PlanItem, SteeringQueue, Composer } from '../components/chat';
import { useNav } from '../context/NavContext';

function StreamedPlanList() {
  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{ marginBottom: 10, fontFamily: F.mono, fontSize: 13.5, lineHeight: 1.65 }}>
        Looking at <code style={{ color: T.pi, fontWeight: 500 }}>SessionStore.loadSession</code> —
        it returns the raw JSON tree without validation, so a missing file silently produces{' '}
        <code style={{ color: T.pi }}>undefined</code> downstream. I'll add a typed error and
        route old schemas through the migrator we already have.
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

export function MainChat() {
  const { navigate, openOverlay } = useNav();
  return (
    <PiWindow title="pi · ~/code/pi-ui · main">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* header */}
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
          <Btn variant="ghost" icon="⎇" onClick={() => navigate('tree')}>Tree</Btn>
          <Btn variant="ghost" icon="↗" onClick={() => navigate('share')}>Share</Btn>
          <Btn variant="ghost" icon="⋯" onClick={() => navigate('inspect')} />
        </div>

        {/* conversation */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, background: T.bg }}>
          <MessageUser>
            Look at SessionStore.loadSession — it occasionally crashes when
            opening an old session. Find the cause and fix it; the schema
            migration already exists in migrate.ts.
          </MessageUser>

          <MessageAssistant>
            <StreamedPlanList />
          </MessageAssistant>

          <ToolCall tool="read_file" args="src/session/store.ts" status="ok" output="412 lines" />
          <ToolCall tool="read_file" args="src/session/migrate.ts" status="ok" output="186 lines" />
          <ToolCall tool="grep" args='"loadSession\\(" --type=ts' status="ok" output="6 matches" />

          <ToolCall tool="edit_file" args="src/session/store.ts" status="ok"
            output="+12 −1" expanded accent={T.ok}>
            <DiffPreview />
          </ToolCall>

          <ToolCall tool="bash" args="pnpm vitest run session/" status="run" output="streaming…" />

          <MessageAssistant streaming>
            Tests are running. Adding the v0 → v2 fixture round-trip first
            so we catch the truncated <code style={{ color: T.pi }}>branches</code>{' '}
            field — that was the actual crash, not the missing-file path.
          </MessageAssistant>

          <SteeringQueue />
          <div style={{ height: 14 }} />
        </div>

        <Composer onCommandPalette={() => openOverlay('command-palette')} />
      </div>
    </PiWindow>
  );
}
