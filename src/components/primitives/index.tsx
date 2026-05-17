import { T, F } from '../../tokens';

interface PiProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function Pi({ size = 16, color = T.pi, style = {} }: PiProps) {
  return (
    <span style={{
      fontFamily: F.mono, fontSize: size, color, fontWeight: 600,
      lineHeight: 1, display: 'inline-block', ...style,
    }}>π</span>
  );
}

interface KbdProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Kbd({ children, style = {} }: KbdProps) {
  return (
    <kbd style={{
      fontFamily: F.mono, fontSize: 10.5, fontWeight: 500,
      padding: '1.5px 5px', borderRadius: 3,
      background: T.bgElev, color: T.textDim,
      border: `1px solid ${T.border}`,
      boxShadow: `inset 0 -1px 0 ${T.borderDim}`,
      lineHeight: 1.4, ...style,
    }}>{children}</kbd>
  );
}

interface PillProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  border?: string;
  style?: React.CSSProperties;
}

export function Pill({ children, color = T.textDim, bg = T.bgElev, border = T.border, style = {} }: PillProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: F.mono, fontSize: 11, fontWeight: 500,
      padding: '2px 7px', borderRadius: 3,
      background: bg, color, border: `1px solid ${border}`,
      lineHeight: 1.5, whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

interface DotProps {
  color?: string;
  size?: number;
  animated?: boolean;
  style?: React.CSSProperties;
}

export function Dot({ color = T.ok, size = 6, animated = false, style = {} }: DotProps) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'inline-block',
      boxShadow: `0 0 0 2px ${color}22`, flexShrink: 0,
      animation: animated ? 'pi-pulse 1.2s ease-in-out infinite' : undefined,
      ...style,
    }} />
  );
}

interface BtnProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  icon?: string;
  kbd?: string;
  style?: React.CSSProperties;
  full?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function Btn({ children, variant = 'ghost', icon, kbd, style = {}, full, disabled, onClick }: BtnProps) {
  const variants = {
    primary:   { bg: T.pi, color: '#1a1408', border: T.pi },
    secondary: { bg: T.bgElev, color: T.text, border: T.border },
    ghost:     { bg: 'transparent', color: T.textDim, border: 'transparent' },
    outline:   { bg: 'transparent', color: T.text, border: T.borderHi },
    danger:    { bg: 'transparent', color: T.err, border: T.border },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '6px 11px', borderRadius: 5,
        background: v.bg, color: disabled ? T.textFaint : v.color,
        border: `1px solid ${v.border}`,
        fontFamily: F.mono, fontSize: 11.5, fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
        width: full ? '100%' : 'auto',
        justifyContent: full ? 'flex-start' : 'center',
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: 12, opacity: 0.8 }}>{icon}</span>}
      {children && <span>{children}</span>}
      {kbd && <span style={{ marginLeft: 'auto', opacity: 0.6 }}><Kbd>{kbd}</Kbd></span>}
    </button>
  );
}

interface NavItemProps {
  icon?: string;
  label: string;
  hint?: string;
  active?: boolean;
  dim?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export function NavItem({ icon, label, hint, active, dim, onClick, onDoubleClick }: NavItemProps) {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '6px 10px', borderRadius: 5, marginBottom: 1,
        background: active ? T.bgElev : 'transparent',
        color: active ? T.text : (dim ? T.textMuted : T.textDim),
        fontFamily: F.mono, fontSize: 12, fontWeight: active ? 500 : 400,
        borderLeft: `2px solid ${active ? T.pi : 'transparent'}`,
        marginLeft: -2, paddingLeft: 8,
        cursor: 'pointer',
      }}
    >
      {icon && (
        <span style={{
          width: 12, display: 'inline-flex', justifyContent: 'center',
          color: active ? T.pi : T.textMuted, fontSize: 11,
        }}>{icon}</span>
      )}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {hint && <span style={{ fontSize: 10, color: T.textFaint }}>{hint}</span>}
    </div>
  );
}

interface SectionLabelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function SectionLabel({ children, style = {} }: SectionLabelProps) {
  return (
    <div style={{
      padding: '14px 12px 6px', fontFamily: F.mono,
      fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
      color: T.textFaint, ...style,
    }}>{children}</div>
  );
}
