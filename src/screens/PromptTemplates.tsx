import { useState, useEffect, useMemo } from 'react';
import { T, F } from '../tokens';
import { Pill, Btn, SectionLabel, Kbd } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useCommandsStore } from '../store/commandsStore';
import { rpc } from '../lib/rpcClient';

function TemplateRow({ name, description, slash, active, onClick }: {
  name: string; description: string; slash: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
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

const BUILTIN_TEMPLATES = [
  { name: 'commit', slash: '/commit', description: 'Conventional commit from staged diff', source: 'builtin' as const },
  { name: 'pr', slash: '/pr', description: 'GitHub pull request description', source: 'builtin' as const },
  { name: 'plan', slash: '/plan', description: 'Multi-step task plan', source: 'builtin' as const },
  { name: 'review', slash: '/review', description: 'Code review with suggestions', source: 'builtin' as const },
  { name: 'test', slash: '/test', description: 'Generate test cases', source: 'builtin' as const },
  { name: 'docs', slash: '/docs', description: 'Generate JSDoc / docstrings', source: 'builtin' as const },
  { name: 'refactor', slash: '/refactor', description: 'Refactor selected code', source: 'builtin' as const },
  { name: 'explain', slash: '/explain', description: 'Explain code or error', source: 'builtin' as const },
];

export function PromptTemplates() {
  const { commands, load } = useCommandsStore();
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const liveTemplates = useMemo(() =>
    commands
      .filter((c) => c.source === 'prompt')
      .map((c) => ({ name: c.name, slash: `/${c.name}`, description: c.description ?? '', source: 'custom' as const })),
    [commands]
  );

  const allTemplates = useMemo(() => {
    const all = [...BUILTIN_TEMPLATES, ...liveTemplates];
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter((t) => t.name.includes(q) || t.description.toLowerCase().includes(q));
  }, [liveTemplates, query]);

  const current = allTemplates[selected];

  const useTemplate = () => {
    if (current) rpc.sendPrompt(current.slash);
  };

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
              <span>⌕</span>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="search templates…"
                style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: F.mono, fontSize: 11, color: T.text, flex: 1 }}
              />
            </div>
            <SectionLabel>built-in</SectionLabel>
            {allTemplates.filter((t) => t.source === 'builtin').map((t) => (
              <TemplateRow
                key={t.name}
                name={t.name} slash={t.slash} description={t.description}
                active={allTemplates.indexOf(t) === selected}
                onClick={() => setSelected(allTemplates.indexOf(t))}
              />
            ))}
            {liveTemplates.length > 0 && (
              <>
                <div style={{ height: 8 }} />
                <SectionLabel>custom</SectionLabel>
                {allTemplates.filter((t) => t.source === 'custom').map((t) => (
                  <TemplateRow
                    key={t.name}
                    name={t.name} description={t.description}
                    active={allTemplates.indexOf(t) === selected}
                    onClick={() => setSelected(allTemplates.indexOf(t))}
                  />
                ))}
              </>
            )}
            <div style={{ marginTop: 10 }}>
              <Btn variant="ghost" icon="+">New Template</Btn>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: T.bg }}>
            {current ? (
              <>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>{current.name}</span>
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>{current.slash}</span>
                  <Pill color={T.textFaint} bg="transparent" border={T.border}>{current.source}</Pill>
                  <div style={{ flex: 1 }} />
                  <Kbd>↵</Kbd>
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>use</span>
                  <Btn variant="primary" icon="↵" onClick={useTemplate}>Use</Btn>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px' }}>
                  <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>command</div>
                  <div style={{ background: T.bgPanel, borderRadius: 5, border: `1px solid ${T.border}`, padding: '10px 14px', fontFamily: F.mono, fontSize: 12, color: T.textDim }}>
                    <span style={{ color: T.pi }}>{current.slash}</span>
                    <span style={{ color: T.textMuted }}> — {current.description}</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 13, color: T.textFaint }}>
                No templates match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
