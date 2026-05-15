// Pi UI — design tokens. Terminal-rooted, dark, warm.

export const T = {
  // surfaces — warm dark grays
  bg:         '#0e0d0b',
  bgPanel:    '#15140f',
  bgElev:     '#1c1b15',
  bgInput:    '#1f1d16',
  bgHover:    '#252319',

  // borders
  border:     '#2a271f',
  borderHi:   '#3a362b',
  borderDim:  '#1f1d17',

  // text
  text:       '#e9e4d4',
  textDim:    '#a39d8a',
  textMuted:  '#6a6557',
  textFaint:  '#46433a',

  // brand — pi amber
  pi:         '#f0a45a',
  piDim:      '#a06f3c',
  piBg:       'rgba(240,164,90,0.10)',
  piBorder:   'rgba(240,164,90,0.35)',

  // semantic
  ok:         '#8fb86a',
  okBg:       'rgba(143,184,106,0.10)',
  warn:       '#e0b257',
  warnBg:     'rgba(224,178,87,0.10)',
  err:        '#e26b5e',
  errBg:      'rgba(226,107,94,0.10)',
  info:       '#7aa6d8',
  infoBg:     'rgba(122,166,216,0.10)',

  // tool calls — soft violet
  tool:       '#c79bd6',
  toolBg:     'rgba(199,155,214,0.08)',
} as const;

export const F = {
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  sans: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif',
} as const;
