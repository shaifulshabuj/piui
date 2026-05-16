import { useEffect } from 'react';
import { T, F } from '../tokens';
import { Pill, Btn, Kbd } from '../components/primitives';
import { useNav } from '../context/NavContext';
import { usePermissionStore } from '../store/permissionStore';

export function PermissionPrompt() {
  const { closeOverlay } = useNav();
  const { current, clearRequest } = usePermissionStore();
  const errBorder = 'rgba(226,107,94,0.35)';

  const close = () => { clearRequest(); closeOverlay(); };

  const allowOnce = () => {
    window.pi?.send({ type: 'permission_response', id: current?.id, allowed: true, remember: false });
    close();
  };
  const allowAlways = () => {
    window.pi?.send({ type: 'permission_response', id: current?.id, allowed: true, remember: true });
    close();
  };
  const deny = () => {
    window.pi?.send({ type: 'permission_response', id: current?.id, allowed: false });
    close();
  };
  const denyAbort = () => {
    window.pi?.send({ type: 'permission_response', id: current?.id, allowed: false });
    window.pi?.abort();
    close();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'y') allowOnce();
      else if (e.key === 'a') allowAlways();
      else if (e.key === 'n') deny();
      else if (e.key === 'Escape') denyAbort();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  const command = current?.command ?? 'unknown command';
  const description = current?.description ?? 'pi wants to execute a potentially dangerous operation.';
  const level = current?.level ?? 'dangerous';
  const tool = current?.tool ?? 'bash';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100,
      }}
      onClick={close}
    >
      <div
        style={{
          width: 480, background: T.bgPanel, borderRadius: 8, overflow: 'hidden',
          border: `1px solid ${errBorder}`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${T.errBg}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠</span>
          <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: T.err }}>Permission Request</span>
          <div style={{ flex: 1 }} />
          <Pill color={T.err} bg={T.errBg} border={errBorder}>requires approval</Pill>
        </div>

        <div style={{ padding: '18px 18px' }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted, marginBottom: 6 }}>pi wants to execute:</div>
          <div style={{
            background: T.bg, borderRadius: 5, border: `1px solid ${T.borderHi}`,
            padding: '10px 14px', marginBottom: 14,
          }}>
            <span style={{ fontFamily: F.mono, fontSize: 13, color: T.text }}>
              {command}
            </span>
          </div>

          <div style={{ fontFamily: F.sans, fontSize: 12.5, color: T.textDim, lineHeight: 1.6, marginBottom: 16 }}>
            {description}
          </div>

          <div style={{
            background: T.errBg, borderRadius: 5, border: `1px solid ${errBorder}`,
            padding: '10px 14px', marginBottom: 18,
          }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.err, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
              {level} · {tool}
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim }}>
              Approve once, always, or deny this request.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Btn variant="danger" icon="✓" onClick={allowOnce}>Allow once</Btn>
            <Btn variant="outline" icon="∞" onClick={allowAlways}>Allow always</Btn>
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" icon="✕" onClick={deny}>Deny</Btn>
          </div>

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>
            <Kbd>y</Kbd> allow once
            <Kbd>a</Kbd> allow always
            <Kbd>n</Kbd> deny
            <Kbd>esc</Kbd> deny + abort
          </div>
        </div>
      </div>
    </div>
  );
}
