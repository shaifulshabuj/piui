// Pi UI — design tokens, shared primitives.
// Terminal-rooted, dark, warm. Geist Mono for code/UI chrome, Geist for prose.

const T = {
  // surfaces — warm dark grays, not pure black
  bg:         '#0e0d0b',  // app bg
  bgPanel:    '#15140f',  // sidebars / panels
  bgElev:     '#1c1b15',  // raised cards, hover states
  bgInput:    '#1f1d16',  // inputs, code blocks
  bgHover:    '#252319',  // hover

  // borders
  border:     '#2a271f',
  borderHi:   '#3a362b',
  borderDim:  '#1f1d17',

  // text
  text:       '#e9e4d4',  // primary
  textDim:    '#a39d8a',  // secondary
  textMuted:  '#6a6557',  // tertiary
  textFaint:  '#46433a',  // disabled / hint

  // brand — pi amber (warm terminal)
  pi:         '#f0a45a',
  piDim:      '#a06f3c',
  piBg:       'rgba(240,164,90,0.10)',
  piBorder:   'rgba(240,164,90,0.35)',

  // semantic
  ok:         '#8fb86a',   // success / approved diff add
  okBg:       'rgba(143,184,106,0.10)',
  warn:       '#e0b257',
  warnBg:     'rgba(224,178,87,0.10)',
  err:        '#e26b5e',
  errBg:      'rgba(226,107,94,0.10)',
  info:       '#7aa6d8',
  infoBg:     'rgba(122,166,216,0.10)',

  // accent variants for tool/skill chips
  tool:       '#c79bd6',   // tool calls — soft violet
  toolBg:     'rgba(199,155,214,0.08)',
};

const F = {
  // Mono = primary type for the terminal-rooted feel.
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  sans: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif',
};

// ─── small primitives ────────────────────────────────────────────
function Pi({ size = 16, color = T.pi, style = {} }) {
  return (
    <span style={{
      fontFamily: F.mono, fontSize: size, color, fontWeight: 600,
      lineHeight: 1, display: 'inline-block', ...style,
    }}>π</span>
  );
}

function Kbd({ children, style = {} }) {
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

function Pill({ children, color = T.textDim, bg = T.bgElev, border = T.border, style = {} }) {
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

function Dot({ color = T.ok, size = 6, style = {} }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'inline-block',
      boxShadow: `0 0 0 2px ${color}22`, ...style,
    }} />
  );
}

// Generic "app window" — macOS-style chrome, but warm-dark and terminal-themed.
// Used per-screen so each artboard is self-contained.
function PiWindow({ width = 1280, height = 800, title, children, statusbar }) {
  return (
    <div style={{
      width, height, background: T.bg,
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: F.sans, color: T.text,
      boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.4)',
    }}>
      <PiTitlebar title={title} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>{children}</div>
      {statusbar !== undefined ? statusbar : <PiStatusbar />}
    </div>
  );
}

function PiTitlebar({ title }) {
  const dot = (bg) => (
    <div style={{ width: 11, height: 11, borderRadius: '50%', background: bg }} />
  );
  return (
    <div style={{
      height: 36, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 12px', gap: 12,
      borderBottom: `1px solid ${T.border}`,
      background: T.bgPanel,
    }}>
      <div style={{ display: 'flex', gap: 7 }}>
        {dot('#ff5f56')}{dot('#ffbd2e')}{dot('#27c93f')}
      </div>
      <div style={{ flex: 1, textAlign: 'center', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Pi size={13} />
        <span style={{ fontFamily: F.mono, fontSize: 12, color: T.textDim,
          letterSpacing: 0.2 }}>{title || 'pi'}</span>
      </div>
      <div style={{ width: 52 }} />
    </div>
  );
}

function PiStatusbar({ left, right }) {
  return (
    <div style={{
      height: 24, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 12px', gap: 14,
      borderTop: `1px solid ${T.border}`, background: T.bgPanel,
      fontFamily: F.mono, fontSize: 10.5, color: T.textMuted,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {left || (<>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Dot color={T.ok} size={5} /> ready
          </span>
          <span>~/code/pi-ui</span>
          <span>main</span>
        </>)}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {right || (<>
          <span>claude-sonnet-4-5</span>
          <span>14.2k / 200k</span>
          <span>$0.084</span>
        </>)}
      </div>
    </div>
  );
}

// Reusable sidebar nav item.
function NavItem({ icon, label, hint, active, dim }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '6px 10px', borderRadius: 5, marginBottom: 1,
      background: active ? T.bgElev : 'transparent',
      color: active ? T.text : (dim ? T.textMuted : T.textDim),
      fontFamily: F.mono, fontSize: 12, fontWeight: active ? 500 : 400,
      borderLeft: `2px solid ${active ? T.pi : 'transparent'}`,
      marginLeft: -2, paddingLeft: 8,
      cursor: 'default',
    }}>
      {icon && <span style={{ width: 12, display: 'inline-flex', justifyContent: 'center',
        color: active ? T.pi : T.textMuted, fontSize: 11 }}>{icon}</span>}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {hint && <span style={{ fontSize: 10, color: T.textFaint }}>{hint}</span>}
    </div>
  );
}

function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      padding: '14px 12px 6px', fontFamily: F.mono,
      fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
      color: T.textFaint, ...style,
    }}>{children}</div>
  );
}

function Btn({ children, variant = 'ghost', icon, kbd, style = {}, full }) {
  const variants = {
    primary: { bg: T.pi, color: '#1a1408', border: T.pi },
    secondary: { bg: T.bgElev, color: T.text, border: T.border },
    ghost: { bg: 'transparent', color: T.textDim, border: 'transparent' },
    outline: { bg: 'transparent', color: T.text, border: T.borderHi },
    danger: { bg: 'transparent', color: T.err, border: T.border },
  };
  const v = variants[variant];
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 11px', borderRadius: 5,
      background: v.bg, color: v.color,
      border: `1px solid ${v.border}`,
      fontFamily: F.mono, fontSize: 11.5, fontWeight: 500,
      cursor: 'pointer', whiteSpace: 'nowrap',
      width: full ? '100%' : 'auto', justifyContent: full ? 'flex-start' : 'center',
      ...style,
    }}>
      {icon && <span style={{ fontSize: 12, opacity: 0.8 }}>{icon}</span>}
      <span>{children}</span>
      {kbd && <span style={{ marginLeft: 'auto', opacity: 0.6 }}><Kbd>{kbd}</Kbd></span>}
    </button>
  );
}

Object.assign(window, {
  T, F, Pi, Kbd, Pill, Dot,
  PiWindow, PiTitlebar, PiStatusbar,
  NavItem, SectionLabel, Btn,
});
