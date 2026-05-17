import { useEffect, useState } from 'react';
import { T, F } from '../../tokens';
import { Pi, Dot, NavItem, SectionLabel, Btn } from '../primitives';
import { useNav } from '../../context/NavContext';
import { useSessionStore } from '../../store/sessionStore';
import { useModelStore } from '../../store/modelStore';
import { useChatStore } from '../../store/chatStore';
import type { Session } from '../../types';

export function PiTitlebar({ title }: { title?: string }) {
  const isElectron = !!window.pi?.isElectron;
  const dot = (bg: string) => (
    <div style={{ width: 11, height: 11, borderRadius: '50%', background: bg }} />
  );
  return (
    <div style={{
      height: 36, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 12px', gap: 12,
      borderBottom: `1px solid ${T.border}`,
      background: T.bgPanel,
      WebkitAppRegion: 'drag',
    } as React.CSSProperties}>
      {isElectron
        // Native traffic lights occupy ~75px on the left; add matching spacer
        ? <div style={{ width: 68 }} />
        : (
          <div style={{ display: 'flex', gap: 7, WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {dot('#ff5f56')}{dot('#ffbd2e')}{dot('#27c93f')}
          </div>
        )
      }
      <div style={{
        flex: 1, textAlign: 'center', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Pi size={13} />
        <span style={{ fontFamily: F.mono, fontSize: 12, color: T.textDim, letterSpacing: 0.2 }}>
          {title || 'pi'}
        </span>
      </div>
      <div style={{ width: 52 }} />
    </div>
  );
}

interface PiStatusbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function PiStatusbar({ left, right }: PiStatusbarProps) {
  const { currentModel } = useModelStore();
  const { usage, isStreaming } = useChatStore();
  const tokStr = usage.tokens > 0 ? `${(usage.tokens / 1000).toFixed(1)}k tok` : '';
  const costStr = usage.cost > 0 ? `$${usage.cost.toFixed(3)}` : '';
  return (
    <div style={{
      height: 24, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 12px', gap: 14,
      borderTop: `1px solid ${T.border}`, background: T.bgPanel,
      fontFamily: F.mono, fontSize: 10.5, color: T.textMuted,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {left ?? (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Dot color={isStreaming ? T.pi : T.ok} size={5} animated={isStreaming} />
              {isStreaming ? 'streaming' : 'ready'}
            </span>
            <span>{typeof process !== 'undefined' ? '~' : '~'}/code/pi-ui</span>
          </>
        )}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {right ?? (
          <>
            <span style={{ color: T.pi }}>{currentModel}</span>
            {tokStr && <span>{tokStr}</span>}
            {costStr && <span>{costStr}</span>}
          </>
        )}
      </div>
    </div>
  );
}

interface PiWindowProps {
  title?: string;
  children: React.ReactNode;
  statusbar?: React.ReactNode;
}

export function PiWindow({ title, children, statusbar }: PiWindowProps) {
  return (
    <div style={{
      width: '100vw', height: '100vh', background: T.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: F.sans, color: T.text, overflow: 'hidden',
    }}>
      <PiTitlebar title={title} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>{children}</div>
      {statusbar !== undefined ? statusbar : <PiStatusbar />}
    </div>
  );
}

export function SidebarMain() {
  const { screen, navigate, openOverlay } = useNav();
  const { sessions, currentSessionId, loadSessions, setCurrentSession, renameSession, deleteSession } = useSessionStore();
  const hasPi = !!window.pi;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => { loadSessions() }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startRename = (s: Session) => {
    setEditingId(s.id);
    setEditValue(s.title);
  };

  const commitRename = async (id: string) => {
    if (editValue.trim()) await renameSession(id, editValue.trim());
    setEditingId(null);
  };

  const cancelRename = () => { setEditingId(null); };

  const handleDelete = async (s: Session) => {
    if (window.confirm(`Delete "${s.title}"?`)) {
      await deleteSession(s.id);
    }
  };

  const groups: { label: string; key: Session['group'] }[] = [
    { label: 'Today', key: 'today' },
    { label: 'Yesterday', key: 'yesterday' },
    { label: 'Last week', key: 'last-week' },
  ];

  return (
    <div style={{
      width: 240, flexShrink: 0, background: T.bgPanel,
      borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '12px 8px',
    }}>
      <div style={{ display: 'flex', gap: 6, padding: '4px 4px 8px' }}>
        <Btn variant="secondary" icon="+" kbd="⌘N" style={{ flex: 1, justifyContent: 'flex-start' }}
          onClick={() => navigate('chat')}>
          New session
        </Btn>
      </div>

      {groups.map(({ label, key }) => {
        const group = sessions.filter((s) => s.group === key);
        if (!group.length) return null;
        return (
          <div key={key}>
            <SectionLabel>{label}</SectionLabel>
            {group.map((s) => (
              <div
                key={s.id}
                style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                title={hasPi ? 'Double-click to rename' : undefined}
              >
                {editingId === s.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => commitRename(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(s.id);
                      else if (e.key === 'Escape') cancelRename();
                    }}
                    style={{
                      flex: 1, background: T.bgInput, border: `1px solid ${T.pi}`,
                      borderRadius: 4, padding: '3px 7px', outline: 'none',
                      fontFamily: F.mono, fontSize: 11.5, color: T.text, width: '100%',
                    }}
                  />
                ) : (
                  <NavItem
                    icon={s.active ? '●' : '○'}
                    label={s.title}
                    active={s.id === currentSessionId && screen === 'chat'}
                    dim={s.dim}
                    onClick={() => {
                      setCurrentSession(s.id, s.filePath);
                      navigate('chat');
                    }}
                    onDoubleClick={hasPi ? () => startRename(s) : undefined}
                  />
                )}
                {hasPi && editingId !== s.id && (
                  <button
                    onClick={() => handleDelete(s)}
                    style={{
                      position: 'absolute', right: 4,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: T.textFaint, fontSize: 13, padding: '0 2px',
                      opacity: 0, transition: 'opacity 0.1s',
                      fontFamily: F.mono,
                    }}
                    className="session-delete-btn"
                    title={`Delete "${s.title}"`}
                    aria-label={`Delete ${s.title}`}
                  >×</button>
                )}
              </div>
            ))}
          </div>
        );
      })}

      <div style={{ flex: 1 }} />

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, marginTop: 8 }}>
        <NavItem icon="✦" label="Packages" hint="3"
          active={screen === 'packages'} onClick={() => navigate('packages')} />
        <NavItem icon="◧" label="Skills" hint="12"
          active={screen === 'prompts'} onClick={() => navigate('prompts')} />
        <NavItem icon="❖" label="Prompts" hint="8"
          active={screen === 'prompts'} onClick={() => navigate('prompts')} />
        <NavItem icon="◎" label="Features"
          active={screen === 'features'} onClick={() => navigate('features')} />
        <NavItem icon="?" label="Help"
          active={screen === 'help'} onClick={() => navigate('help')} />
        <NavItem icon="⚙" label="Settings"
          active={screen === 'settings'} onClick={() => navigate('settings')} />
        <NavItem icon="⎇" label="Git Status"
          active={screen === 'git-status'} onClick={() => navigate('git-status')} />
        <NavItem icon="◐" label="Command Palette"
          onClick={() => openOverlay('command-palette')} />
      </div>
    </div>
  );
}
