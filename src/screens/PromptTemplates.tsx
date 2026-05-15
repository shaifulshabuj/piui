import { T, F } from '../tokens';
import { Pill, Btn, SectionLabel, Kbd } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';

function TemplateRow({ name, description, slash, active }: {
  name: string; description: string; slash: string; active?: boolean;
}) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 5, cursor: 'pointer',
      background: active ? T.bgElev : 'transparent',
      borderLeft: `2px solid ${active ? T.pi : 'transparent'}`,
      marginLeft: -2, paddingLeft: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: F.mono, fontSize: 12.5, color: active ? T.pi : T.text, fontWeight: active ? 600 : 400 }}>{name}</span>
        <span style={{ fontFamily: F.mono, fontSize: 10, color: T.pi }}>{slash}</span>
      </div>
      <div style={{ fontFamily: F.sans, fontSize: 11.5, color: T.textDim, marginTop: 2 }}>{description}</div>
    </div>
  );
}

export function PromptTemplates() {
  return (
    <PiWindow title="pi · /prompts">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>/prompts</span>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Prompt Templates</span>
          <div style={{ flex: 1 }} />
          <Btn variant="secondary" icon="+">New Template</Btn>
          <Btn variant="ghost" icon="↗">Import</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{
            width: 230, flexShrink: 0, padding: '12px 10px',
            borderRight: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 5,
              border: `1px solid ${T.border}`, background: T.bgInput,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted, marginBottom: 10,
            }}>
              <span>⌕</span><span>search templates…</span>
            </div>
            <SectionLabel>built-in</SectionLabel>
            <TemplateRow name="commit" slash="/commit" description="Conventional commit from staged diff" active />
            <TemplateRow name="pr" slash="/pr" description="GitHub pull request description" />
            <TemplateRow name="plan" slash="/plan" description="Multi-step task plan" />
            <TemplateRow name="review" slash="/review" description="Code review with suggestions" />
            <TemplateRow name="test" slash="/test" description="Generate test cases" />
            <TemplateRow name="docs" slash="/docs" description="Generate JSDoc / docstrings" />
            <TemplateRow name="refactor" slash="/refactor" description="Refactor selected code" />
            <TemplateRow name="explain" slash="/explain" description="Explain code or error" />
            <div style={{ height: 8 }} />
            <SectionLabel>custom</SectionLabel>
            <TemplateRow name="deploy-check" slash="/deploy-check" description="Pre-deploy checklist" />
            <TemplateRow name="sprint-summary" slash="/sprint-summary" description="Summarize sprint tickets" />
            <TemplateRow name="arch-review" slash="/arch-review" description="Architecture review questions" />
            <div style={{ marginTop: 10 }}>
              <Btn variant="ghost" icon="+">New Template</Btn>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: T.bg }}>
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>commit</span>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>/commit</span>
              <Pill color={T.textFaint} bg="transparent" border={T.border}>built-in</Pill>
              <div style={{ flex: 1 }} />
              <Kbd>↵</Kbd>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>use</span>
              <Btn variant="ghost" icon="✎">Edit</Btn>
              <Btn variant="ghost" icon="⊕">Duplicate</Btn>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px' }}>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>template</div>
              <div style={{
                background: T.bgPanel, borderRadius: 6, border: `1px solid ${T.border}`,
                padding: '14px 16px', marginBottom: 18,
              }}>
                <pre style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
{`Write a git commit message for the following diff.

Follow Conventional Commits:
  <type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore, perf

{{#if staged_diff}}
Staged diff:
\`\`\`diff
{{staged_diff}}
\`\`\`
{{else}}
No staged changes. List the modified files and summarize
what should be committed.
{{/if}}

Rules:
- Subject line ≤ 72 chars
- Imperative mood ("add", not "added")
- No period at end of subject
- If breaking change, add BREAKING CHANGE: in body
{{#if emoji}}
- Start subject with an emoji matching the type
{{/if}}`}
                </pre>
              </div>

              <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>variables</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                {([
                  ['staged_diff', 'string', 'Output of git diff --staged', true],
                  ['emoji', 'bool', 'Prepend emoji to commit type (default: true)', false],
                  ['scope', 'string', 'Optional scope override', false],
                  ['breaking', 'string', 'Breaking change description', false],
                ] as const).map(([v, t, d, req]) => (
                  <div key={v} style={{ padding: '10px 12px', borderRadius: 5, border: `1px solid ${T.border}`, background: T.bgPanel }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: F.mono, fontSize: 12, color: T.text }}>{'{{' + v + '}}'}</span>
                      <Pill color={T.textFaint} bg="transparent" border={T.border}>{t}</Pill>
                      {req && <Pill color={T.warn} bg="rgba(251,189,35,0.1)" border="rgba(251,189,35,0.3)">required</Pill>}
                    </div>
                    <div style={{ fontFamily: F.sans, fontSize: 11.5, color: T.textMuted, marginTop: 4 }}>{d}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>usage in chat</div>
              <div style={{ background: T.bgPanel, borderRadius: 5, border: `1px solid ${T.border}`, padding: '10px 14px', fontFamily: F.mono, fontSize: 12, color: T.textDim }}>
                <span style={{ color: T.pi }}>/commit</span>
                <span style={{ color: T.textMuted }}> — auto-fills staged_diff from git</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
