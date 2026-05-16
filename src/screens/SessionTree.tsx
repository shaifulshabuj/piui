import { useState } from 'react';
import { T, F } from '../tokens';
import { Pill, Btn, Kbd, Dot } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';

function FilterChip({ label, count, active, color, onClick }: { label: string; count: string; active?: boolean; color?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 9px', borderRadius: 4,
      border: `1px solid ${active ? (color || T.pi) : T.border}`,
      background: active ? (color ? `${color}15` : T.piBg) : 'transparent',
      color: active ? (color || T.pi) : T.textDim,
      fontFamily: F.mono, fontSize: 11, cursor: 'pointer',
    }}>
      <Dot color={color || T.pi} size={5} style={{ boxShadow: 'none' }} />
      <span>{label}</span>
      <span style={{ color: T.textFaint, fontSize: 10 }}>{count}</span>
    </div>
  );
}

function TreeNode({ depth = 0, glyph, role, text, branch, bookmark, current, dim, tokens, time }: {
  depth?: number; glyph: string; role: string; text: string;
  branch?: string; bookmark?: string; current?: boolean; dim?: boolean; tokens?: string; time: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 9,
      padding: '7px 0', marginLeft: depth * 20,
      borderLeft: depth > 0 ? `1px solid ${T.border}` : 'none',
      paddingLeft: depth > 0 ? 14 : 0,
      position: 'relative',
    }}>
      {depth > 0 && <div style={{ position: 'absolute', left: 0, top: 14, width: 14, height: 1, background: T.border }} />}
      <div style={{
        width: 18, height: 18, borderRadius: 3, flexShrink: 0,
        background: current ? T.pi : T.bgElev,
        border: `1px solid ${current ? T.pi : T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: F.mono, fontSize: 10, color: current ? '#1a1408' : T.textDim, fontWeight: 600,
      }}>{glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: role === 'user' ? T.pi : T.tool, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{role}</span>
          {branch && <Pill color={T.info} bg={T.infoBg} border="rgba(122,166,216,0.25)">⎇ {branch}</Pill>}
          {bookmark && <Pill color={T.warn} bg={T.warnBg} border="rgba(224,178,87,0.25)">★ {bookmark}</Pill>}
          {current && <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>HEAD</Pill>}
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>{time}</span>
          {tokens && <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>{tokens}</span>}
        </div>
        <div style={{
          fontFamily: F.mono, fontSize: 12.5, color: dim ? T.textMuted : T.text,
          lineHeight: 1.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}>{text}</div>
      </div>
    </div>
  );
}

const TREE_NODES = [
  { depth: 0, glyph: '1', role: 'user', time: '14:02', text: 'Look at SessionStore.loadSession — old sessions crash on open. Migration code is in migrate.ts.' },
  { depth: 0, glyph: '1', role: 'pi', time: '14:02', tokens: '1.4k', text: 'Reading store.ts and migrate.ts. The crash is from an undefined branches[] field on v0 schemas — migrator handles it but isn\'t wired into the load path.' },
  { depth: 1, glyph: '2', role: 'user', branch: 'hotfix', time: '14:04', text: 'Try the smallest possible fix first: just call migrate() inside loadSession.' },
  { depth: 2, glyph: '3', role: 'pi', time: '14:04', tokens: '2.1k', dim: true, text: 'Wrapped loadSession in migrate(). 4/6 tests pass. The v0→v2 migration drops bookmarks because schema-v1 didn\'t have them.' },
  { depth: 1, glyph: '2', role: 'user', branch: 'proper-fix', bookmark: 'design v2 store', time: '14:08', text: 'Branch from #1 — let\'s do this properly. Add SessionNotFoundError, run migration via the typed path, and write migration tests against the v0 fixtures.' },
  { depth: 2, glyph: '3', role: 'pi', time: '14:08', tokens: '3.8k', text: 'Plan: SessionNotFoundError type → loadSession returns Result<Session, SessionNotFoundError | MigrationError> → migrator runs inside loadSession → fixture tests for v0/v1/v2 round-trips.' },
  { depth: 2, glyph: '4', role: 'user', time: '14:11', text: 'Go ahead. Also: write a snapshot test against the v0 fixture so we don\'t regress.' },
  { depth: 3, glyph: '5', role: 'pi', time: '14:11', tokens: '5.2k', current: true, text: 'Working. 5 files changed, 11/12 tests passing. The last one is the snapshot — diffing now.' },
  { depth: 2, glyph: '6', role: 'user', branch: 'ux-experiment', time: '14:09', dim: true, text: '(parked) Try the alternate API where loadSession is async-iterator that yields per-message — might be simpler for the resume case.' },
];

export function SessionTree() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = TREE_NODES.filter((n) => {
    const matchFilter = activeFilter === 'all' ? true
      : activeFilter === 'user' ? n.role === 'user'
      : activeFilter === 'assistant' ? n.role === 'pi'
      : activeFilter === 'bookmarked' ? !!n.bookmark
      : true;
    const matchQuery = !query || n.text.toLowerCase().includes(query.toLowerCase())
      || (n.branch && n.branch.toLowerCase().includes(query.toLowerCase()))
      || (n.bookmark && n.bookmark.toLowerCase().includes(query.toLowerCase()));
    return matchFilter && matchQuery;
  });

  const FILTERS = [
    { label: 'all', count: '64', color: undefined },
    { label: 'user', count: '14', color: T.pi },
    { label: 'assistant', count: '14', color: T.tool },
    { label: 'tool calls', count: '31', color: T.info },
    { label: 'errors', count: '2', color: T.err },
    { label: 'bookmarked', count: '2', color: T.warn },
  ];

  return (
    <PiWindow title="pi · /tree · pi ui design system">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 24px 10px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>/tree</span>
            <span style={{ fontFamily: F.sans, fontSize: 15, color: T.text, fontWeight: 500 }}>pi ui design system</span>
            <Pill>14 turns</Pill>
            <Pill color={T.info} bg={T.infoBg} border="rgba(122,166,216,0.25)">3 branches</Pill>
            <Pill color={T.warn} bg={T.warnBg} border="rgba(224,178,87,0.25)">2 bookmarks</Pill>
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" icon="↗" onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})}>Share</Btn>
            <Btn variant="ghost" icon="⇣">Export</Btn>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 6 }}>filter</span>
            {FILTERS.map((f) => (
              <FilterChip key={f.label} label={f.label} count={f.count} color={f.color} active={activeFilter === f.label} onClick={() => setActiveFilter(f.label)} />
            ))}
            <div style={{ flex: 1 }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 4,
              border: `1px solid ${T.border}`, background: T.bgInput, width: 220,
            }}>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search messages…"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: F.mono, fontSize: 11, color: T.text,
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px', background: T.bg }}>
          {filtered.length === 0 && (
            <div style={{ fontFamily: F.mono, fontSize: 12, color: T.textFaint, padding: '20px 0' }}>No messages match your filter.</div>
          )}
          {filtered.map((n, i) => (
            <TreeNode key={i} depth={n.depth} glyph={n.glyph} role={n.role} time={n.time}
              text={n.text} branch={n.branch} bookmark={n.bookmark} current={n.current} dim={n.dim} tokens={n.tokens} />
          ))}
        </div>

        <div style={{
          padding: '10px 24px', borderTop: `1px solid ${T.border}`,
          background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: F.mono, fontSize: 11, color: T.textMuted,
        }}>
          <Kbd>↑↓</Kbd> navigate
          <Kbd>↵</Kbd> jump to message
          <Kbd>b</Kbd> bookmark
          <Kbd>f</Kbd> branch from here
          <Kbd>d</Kbd> delete subtree
          <div style={{ flex: 1 }} />
          <span>stored in <span style={{ color: T.info }}>~/.pi/sessions/8af3.json</span></span>
        </div>
      </div>
    </PiWindow>
  );
}
