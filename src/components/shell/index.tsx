import { useEffect } from 'react';
import { T, F } from '../../tokens';
import { Pi, Dot, NavItem, SectionLabel, Btn } from '../primitives';
import { useNav } from '../../context/NavContext';
import { useSessionStore } from '../../store/sessionStore';
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
              <Dot color={T.ok} size={5} /> ready
            </span>
            <span>~/code/pi-ui</span>
            <span>main</span>
          </>
        )}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {right ?? (
          <>
            <span>claude-sonnet-4-5</span>
            <span>14.2k / 200k</span>
            <span>$0.084</span>
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
  const { sessions, currentSessionId, loadSessions, setCurrentSession } = useSessionStore();

  useEffect(() => { loadSessions() }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              <NavItem
                key={s.id}
                icon={s.active ? '●' : '○'}
                label={s.title}
                active={s.id === currentSessionId && screen === 'chat'}
                dim={s.dim}
                onClick={() => { setCurrentSession(s.id); navigate('chat'); }}
              />
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
        <NavItem icon="⚙" label="Settings"
          active={screen === 'theme'} onClick={() => navigate('theme')} />
        <NavItem icon="◐" label="Command Palette"
          onClick={() => openOverlay('command-palette')} />
      </div>
    </div>
  );
}
