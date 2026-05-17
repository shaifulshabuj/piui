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

function SkillRow({ name, description, location, path: skillPath, active, onClick }: {
  name: string; description: string; location?: string; path?: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 14px', borderRadius: 5, cursor: 'pointer',
        background: active ? T.bgElev : 'transparent',
        borderLeft: `2px solid ${active ? T.info : 'transparent'}`,
        marginLeft: -2, paddingLeft: 12,
      }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: F.mono, fontSize: 12.5, color: active ? T.info : T.text, fontWeight: active ? 600 : 400 }}>{name}</span>
        {location && <Pill color={T.textFaint} bg="transparent" border={T.border}>{location}</Pill>}
      </div>
      <div style={{ fontFamily: F.sans, fontSize: 11.5, color: T.textDim, marginTop: 2 }}>{description}</div>
      {skillPath && (
        <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, marginTop: 3 }}>{skillPath}</div>
      )}
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
  const { commands, isLoaded } = useCommandsStore();
  const [activeTab, setActiveTab] = useState<'prompts' | 'skills'>('prompts');
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    rpc.getCommands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const liveTemplates = useMemo(() =>
    commands
      .filter((c) => c.source === 'prompt')
      .map((c) => ({ name: c.name, slash: `/${c.name}`, description: c.description ?? '', source: 'custom' as const })),
    [commands]
  );

  const skills = useMemo(() =>
    commands.filter((c) => c.source === 'skill'),
    [commands]
  );

  const allTemplates = useMemo(() => {
    const all = [...BUILTIN_TEMPLATES, ...liveTemplates];
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter((t) => t.name.includes(q) || t.description.toLowerCase().includes(q));
  }, [liveTemplates, query]);

  const filteredSkills = useMemo(() => {
    if (!query) return skills;
    const q = query.toLowerCase();
    return skills.filter((s) => s.name.includes(q) || (s.description ?? '').toLowerCase().includes(q));
  }, [skills, query]);

  const current = activeTab === 'prompts' ? allTemplates[selected] : null;

  const useTemplate = () => {
    if (current) rpc.sendPrompt(current.slash);
  };

  const showLoading = window.pi && !isLoaded && commands.length === 0;

  return (
    <PiWindow title="pi · /prompts">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>/prompts</span>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Prompt Templates</span>
          <div style={{ flex: 1 }} />
          {/* Tab switcher */}
          {(['prompts', 'skills'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelected(0); }}
              style={{
                padding: '5px 12px', borderRadius: 5, cursor: 'pointer',
                fontFamily: F.mono, fontSize: 11.5,
                background: activeTab === tab ? T.bgElev : 'transparent',
                border: `1px solid ${activeTab === tab ? T.border : 'transparent'}`,
                color: activeTab === tab ? T.text : T.textDim,
              }}
            >
              {tab}
              {tab === 'skills' && skills.length > 0 && (
                <span style={{ marginLeft: 5, color: T.textFaint, fontSize: 10 }}>{skills.length}</span>
              )}
            </button>
          ))}
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
                placeholder={activeTab === 'prompts' ? 'search templates…' : 'search skills…'}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: F.mono, fontSize: 11, color: T.text, flex: 1 }}
              />
            </div>

            {showLoading && (
              <div style={{ fontFamily: F.mono, fontSize: 11, color: T.textFaint, padding: '8px 10px' }}>Waiting for pi…</div>
            )}

            {activeTab === 'prompts' && (
              <>
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
                        name={t.name} slash={t.slash} description={t.description}
                        active={allTemplates.indexOf(t) === selected}
                        onClick={() => setSelected(allTemplates.indexOf(t))}
                      />
                    ))}
                  </>
                )}
                <div style={{ marginTop: 10 }}>
                  <Btn variant="ghost" icon="+">New Template</Btn>
                </div>
              </>
            )}

            {activeTab === 'skills' && (
              <>
                {filteredSkills.length === 0 && !showLoading && (
                  <div style={{ fontFamily: F.mono, fontSize: 11, color: T.textFaint, padding: '8px 10px' }}>
                    {window.pi ? 'No skills loaded.' : 'Connect pi to see loaded skills.'}
                  </div>
                )}
                {filteredSkills.map((s) => (
                  <SkillRow
                    key={s.name}
                    name={s.name}
                    description={s.description ?? ''}
                    location={s.location}
                    path={s.path}
                  />
                ))}
              </>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: T.bg }}>
            {activeTab === 'prompts' && current ? (
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
            ) : activeTab === 'skills' ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontSize: 13, color: T.textFaint }}>
                {filteredSkills.length === 0 ? 'No skills loaded from pi.' : 'Select a skill to view details.'}
              </div>
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
