import { T, F } from '../tokens';
import { Btn } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useModelStore } from '../store/modelStore';
import { useSettingsStore } from '../store/settingsStore';
import { rpc } from '../lib/rpcClient';
import { useNav } from '../context/NavContext';
import type { ThinkingLevel } from '../types';

const THINKING_LEVELS: ThinkingLevel[] = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh'];

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      fontFamily: F.mono, fontSize: 10, color: T.textFaint,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: 10, marginTop: 20,
    }}>
      {title}
    </div>
  );
}

function ToggleOption({
  label, value, selected, onClick,
}: {
  label: string; value: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 4, cursor: 'pointer',
        background: selected ? T.pi : T.bgElev,
        border: `1px solid ${selected ? T.pi : T.border}`,
        color: selected ? '#1a1408' : T.textDim,
        fontFamily: F.mono, fontSize: 11.5, fontWeight: selected ? 600 : 400,
      }}
      aria-label={label}
      aria-pressed={selected}
    >
      {value}
    </button>
  );
}

export function Settings() {
  const { navigate } = useNav();
  const { thinkingLevel, setThinkingLevel } = useModelStore();
  const { steeringMode, followUpMode, autoCompaction, setSteeringMode, setFollowUpMode, setAutoCompaction } = useSettingsStore();
  const isPiAvailable = !!window.pi;

  const handleThinking = (level: ThinkingLevel) => {
    setThinkingLevel(level);
    rpc.setThinkingLevel(level);
  };

  const handleSteeringMode = (mode: 'all' | 'one-at-a-time') => {
    setSteeringMode(mode);
    rpc.setSteeringMode(mode);
  };

  const handleFollowUpMode = (mode: 'all' | 'one-at-a-time') => {
    setFollowUpMode(mode);
    rpc.setFollowUpMode(mode);
  };

  const handleAutoCompaction = (v: boolean) => {
    setAutoCompaction(v);
    rpc.setAutoCompaction(v);
  };

  return (
    <PiWindow title="pi · settings">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 24px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>⚙</span>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Settings</span>
          {!isPiAvailable && (
            <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>
              (pi not running — controls rendered but inactive)
            </span>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 32px', background: T.bg }}>

          <SectionHeader title="Thinking Level" />
          <p style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, marginBottom: 10 }}>
            Control how much reasoning budget pi uses before responding.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {THINKING_LEVELS.map((level) => (
              <ToggleOption
                key={level}
                label={`Set thinking level to ${level}`}
                value={level}
                selected={thinkingLevel === level}
                onClick={() => handleThinking(level)}
              />
            ))}
          </div>

          <SectionHeader title="Steering Mode" />
          <p style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, marginBottom: 10 }}>
            How steering messages are delivered when pi is running.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <ToggleOption
              label="Deliver all steering messages"
              value="all"
              selected={steeringMode === 'all'}
              onClick={() => handleSteeringMode('all')}
            />
            <ToggleOption
              label="Deliver one steering message at a time"
              value="one-at-a-time"
              selected={steeringMode === 'one-at-a-time'}
              onClick={() => handleSteeringMode('one-at-a-time')}
            />
          </div>

          <SectionHeader title="Follow-up Mode" />
          <p style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, marginBottom: 10 }}>
            How queued follow-up messages are processed after pi finishes.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <ToggleOption
              label="Process all follow-up messages"
              value="all"
              selected={followUpMode === 'all'}
              onClick={() => handleFollowUpMode('all')}
            />
            <ToggleOption
              label="Process one follow-up at a time"
              value="one-at-a-time"
              selected={followUpMode === 'one-at-a-time'}
              onClick={() => handleFollowUpMode('one-at-a-time')}
            />
          </div>

          <SectionHeader title="Auto-Compaction" />
          <p style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, marginBottom: 10 }}>
            Automatically summarize older context when approaching the token limit.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <ToggleOption
              label="Enable auto-compaction"
              value="enabled"
              selected={autoCompaction}
              onClick={() => handleAutoCompaction(true)}
            />
            <ToggleOption
              label="Disable auto-compaction"
              value="disabled"
              selected={!autoCompaction}
              onClick={() => handleAutoCompaction(false)}
            />
          </div>

          <SectionHeader title="Session Directory" />
          <div style={{
            fontFamily: F.mono, fontSize: 11.5, color: T.textDim,
            padding: '8px 12px', borderRadius: 5,
            border: `1px solid ${T.border}`, background: T.bgPanel,
            marginBottom: 8,
          }}>
            ~/.pi/agent/sessions/
          </div>

          <SectionHeader title="Customize" />
          <Btn variant="outline" icon="◉" onClick={() => navigate('theme')}>
            Open Theme Customizer
          </Btn>
        </div>
      </div>
    </PiWindow>
  );
}
