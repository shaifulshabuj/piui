// Session tree — `/tree` navigator. Trees, branches, bookmarks,
// filter by message type. Per pi spec: all branches in one file.

function TreeNode({ depth, glyph, role, text, branch, bookmark, current, dim, tokens, time }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 9,
      padding: '7px 0', marginLeft: depth * 20,
      borderLeft: depth > 0 ? `1px solid ${T.border}` : 'none',
      paddingLeft: depth > 0 ? 14 : 0,
      position: 'relative',
    }}>
      {depth > 0 && <div style={{
        position: 'absolute', left: 0, top: 14, width: 14, height: 1,
        background: T.border,
      }} />}
      <div style={{
        width: 18, height: 18, borderRadius: 3, flexShrink: 0,
        background: current ? T.pi : T.bgElev,
        border: `1px solid ${current ? T.pi : T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: F.mono, fontSize: 10, color: current ? '#1a1408' : T.textDim,
        fontWeight: 600,
      }}>{glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10.5, color: role === 'user' ? T.pi : T.tool,
            fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{role}</span>
          {branch && <Pill color={T.info} bg={T.infoBg} border="rgba(122,166,216,0.25)">⎇ {branch}</Pill>}
          {bookmark && <Pill color={T.warn} bg={T.warnBg} border="rgba(224,178,87,0.25)">★ {bookmark}</Pill>}
          {current && <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>HEAD</Pill>}
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>{time}</span>
          {tokens && <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>{tokens}</span>}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 12.5, color: dim ? T.textMuted : T.text,
          lineHeight: 1.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {text}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, color }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 9px', borderRadius: 4,
      border: `1px solid ${active ? (color || T.pi) : T.border}`,
      background: active ? (color ? `${color}15` : T.piBg) : 'transparent',
      color: active ? (color || T.pi) : T.textDim,
      fontFamily: F.mono, fontSize: 11,
    }}>
      <Dot color={color || T.pi} size={5} style={{ boxShadow: 'none' }} />
      <span>{label}</span>
      <span style={{ color: T.textFaint, fontSize: 10 }}>{count}</span>
    </div>
  );
}

function SessionTree() {
  return (
    <PiWindow title="pi · /tree · pi ui design system">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* header */}
        <div style={{
          padding: '14px 24px 10px',
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>/tree</span>
            <span style={{ fontFamily: F.sans, fontSize: 15, color: T.text, fontWeight: 500 }}>
              pi ui design system
            </span>
            <Pill>14 turns</Pill>
            <Pill color={T.info} bg={T.infoBg} border="rgba(122,166,216,0.25)">3 branches</Pill>
            <Pill color={T.warn} bg={T.warnBg} border="rgba(224,178,87,0.25)">2 bookmarks</Pill>
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" icon="↗">Share</Btn>
            <Btn variant="ghost" icon="⇣">Export</Btn>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint,
              textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 6 }}>filter</span>
            <FilterChip label="all" count="64" active />
            <FilterChip label="user" count="14" color={T.pi} />
            <FilterChip label="assistant" count="14" color={T.tool} />
            <FilterChip label="tool calls" count="31" color={T.info} />
            <FilterChip label="errors" count="2" color={T.err} />
            <FilterChip label="bookmarked" count="2" color={T.warn} />
            <div style={{ flex: 1 }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 10px', borderRadius: 4,
              border: `1px solid ${T.border}`, background: T.bgInput,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted,
              width: 220,
            }}>
              <span>⌕</span><span>search messages…</span>
            </div>
          </div>
        </div>

        {/* tree body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px',
          background: T.bg }}>
          <TreeNode depth={0} glyph="1" role="user" time="14:02"
            text="Look at SessionStore.loadSession — old sessions crash on open. Migration code is in migrate.ts." />
          <TreeNode depth={0} glyph="1" role="pi" time="14:02" tokens="1.4k"
            text="Reading store.ts and migrate.ts. The crash is from an undefined branches[] field on v0 schemas — migrator handles it but isn't wired into the load path." />
          <TreeNode depth={1} glyph="2" role="user" branch="hotfix" time="14:04"
            text="Try the smallest possible fix first: just call migrate() inside loadSession." />
          <TreeNode depth={2} glyph="3" role="pi" time="14:04" tokens="2.1k" dim
            text="Wrapped loadSession in migrate(). 4/6 tests pass. The v0→v2 migration drops bookmarks because schema-v1 didn't have them." />
          <TreeNode depth={1} glyph="2" role="user" branch="proper-fix" bookmark="design v2 store" time="14:08"
            text="Branch from #1 — let's do this properly. Add SessionNotFoundError, run migration via the typed path, and write migration tests against the v0 fixtures." />
          <TreeNode depth={2} glyph="3" role="pi" time="14:08" tokens="3.8k"
            text="Plan: SessionNotFoundError type → loadSession returns Result<Session, SessionNotFoundError | MigrationError> → migrator runs inside loadSession → fixture tests for v0/v1/v2 round-trips." />
          <TreeNode depth={2} glyph="4" role="user" time="14:11"
            text="Go ahead. Also: write a snapshot test against the v0 fixture so we don't regress." />
          <TreeNode depth={3} glyph="5" role="pi" time="14:11" tokens="5.2k" current
            text="Working. 5 files changed, 11/12 tests passing. The last one is the snapshot — diffing now." />
          <TreeNode depth={2} glyph="6" role="user" branch="ux-experiment" time="14:09" dim
            text="(parked) Try the alternate API where loadSession is async-iterator that yields per-message — might be simpler for the resume case." />
        </div>

        {/* footer */}
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

window.SessionTree = SessionTree;
