// Prompt templates — Markdown files in ~/.pi/prompts/, `/name` to expand.
// Browse, edit, drag into composer.

function PromptItem({ name, kind, desc, active }) {
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 5,
      background: active ? T.bgElev : 'transparent',
      borderLeft: `2px solid ${active ? T.pi : 'transparent'}`,
      marginLeft: -2, paddingLeft: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: F.mono, fontSize: 11.5,
          color: active ? T.pi : T.text }}>
          /{name}
        </span>
        <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>{kind}</span>
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted,
        marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' }}>
        {desc}
      </div>
    </div>
  );
}

function PromptTemplates() {
  return (
    <PiWindow title="pi · /prompts · ~/.pi/prompts/">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 24px 12px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: F.sans, fontSize: 17, color: T.text, fontWeight: 500 }}>
            Prompt templates
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim }}>
            Markdown files · type <code style={{ color: T.pi }}>/name</code> in the composer to expand
          </span>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="↗">Import package</Btn>
          <Btn variant="secondary" icon="+">New template</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* list */}
          <div style={{
            width: 260, flexShrink: 0, borderRight: `1px solid ${T.border}`,
            background: T.bgPanel, padding: '12px 8px', overflow: 'auto',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 5,
              border: `1px solid ${T.border}`, background: T.bgInput,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted,
              marginBottom: 8,
            }}>
              <span>⌕</span><span>filter…</span>
            </div>

            <SectionLabel>project · ./.pi/prompts</SectionLabel>
            <PromptItem name="review" kind="md" desc="Detailed PR review across diff + tests" />
            <PromptItem name="test-context" kind="md" active
              desc="Add coverage notes + acceptance criteria" />

            <SectionLabel>user · ~/.pi/prompts</SectionLabel>
            <PromptItem name="commit" kind="md" desc="Conventional commit from staged diff" />
            <PromptItem name="explain-diff" kind="md" desc="Walk me through a diff line-by-line" />
            <PromptItem name="bugreport" kind="md" desc="Repro + minimal example + env" />
            <PromptItem name="readme" kind="md" desc="Generate README from package.json + src" />

            <SectionLabel>from packages</SectionLabel>
            <PromptItem name="commit-emoji" kind="@maz/commit" desc="Conventional commit with gitmoji" />
            <PromptItem name="rust-debug" kind="@bad/rust" desc="Walk me through a Rust crash report" />
          </div>

          {/* editor */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
            background: T.bg, minWidth: 0 }}>
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: F.mono, fontSize: 13, color: T.pi }}>/test-context</span>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>
                ./.pi/prompts/test-context.md · 1.2 kb · saved 4m ago
              </span>
              <div style={{ flex: 1 }} />
              <Pill color={T.info} bg={T.infoBg} border="rgba(122,166,216,0.25)">
                3 variables
              </Pill>
              <Btn variant="ghost">Preview</Btn>
              <Btn variant="ghost" icon="↗">Insert in composer</Btn>
            </div>

            <div style={{ flex: 1, padding: '18px 22px', overflow: 'auto',
              fontFamily: F.mono, fontSize: 12.5, lineHeight: 1.65, color: T.text,
              whiteSpace: 'pre-wrap' }}>
              <div style={{ color: T.textFaint, marginBottom: 12 }}>{`---
description: Add coverage notes + acceptance criteria
arguments:
  - name: target
    required: true
    hint: "file or function under test"
  - name: kind
    default: "unit"
    enum: ["unit", "integration", "e2e"]
---`}</div>
              <div>
                <span style={{ color: T.pi }}># Test context</span>
                {'\n\n'}
                You're adding tests for <span style={{ color: T.info }}>{`{{target}}`}</span>.
                {'\n'}
                Test kind: <span style={{ color: T.info }}>{`{{kind}}`}</span>.
                {'\n\n'}
                <span style={{ color: T.pi }}>## Coverage targets</span>
                {'\n\n'}
                - Happy path (typical inputs)
                {'\n'}
                - Boundary conditions (empty, single, max)
                {'\n'}
                - Error paths (invalid input → typed errors)
                {'\n'}
                - State preservation across calls
                {'\n\n'}
                <span style={{ color: T.pi }}>## Acceptance criteria</span>
                {'\n\n'}
                1. Each test asserts <span style={{ color: T.warn }}>one</span> behavior.
                {'\n'}
                2. Test names read as <span style={{ color: T.warn }}>given–when–then</span>.
                {'\n'}
                3. Fixtures live next to tests, not in <code style={{ color: T.tool }}>__fixtures__/</code>.
                {'\n'}
                4. {`{{#if kind == "e2e"}}`}Use the seeded test database.{`{{/if}}`}
                {'\n\n'}
                <span style={{ color: T.tool }}>{`@include ./conventions.md`}</span>
              </div>
            </div>

            <div style={{ padding: '10px 18px', borderTop: `1px solid ${T.border}`,
              background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>
              <Kbd>⌘S</Kbd> save
              <Kbd>⌘↵</Kbd> insert in composer
              <Kbd>⌘D</Kbd> duplicate
              <div style={{ flex: 1 }} />
              <span>frontmatter: <span style={{ color: T.info }}>YAML</span></span>
              <span>·</span>
              <span>{`vars: {{name}}`}</span>
              <span>·</span>
              <span>includes: <code style={{ color: T.tool }}>@include</code></span>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}

window.PromptTemplates = PromptTemplates;
