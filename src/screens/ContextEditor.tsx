import { useState, useCallback, useEffect, useRef } from 'react';
import { T, F } from '../tokens';
import { Pill, Btn, SectionLabel } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { rpc } from '../lib/rpcClient';

type ContextFile = { path: string; kind: 'agents' | 'system' | 'project'; scope: 'user' | 'project' | 'pkg' };

const CONTEXT_FILES: ContextFile[] = [
  { path: '~/.pi/AGENTS.md', kind: 'agents', scope: 'user' },
  { path: '~/.pi/SYSTEM.md', kind: 'system', scope: 'user' },
  { path: './AGENTS.md', kind: 'agents', scope: 'project' },
  { path: './SYSTEM.md', kind: 'system', scope: 'project' },
  { path: './src/AGENTS.md', kind: 'agents', scope: 'project' },
  { path: './CLAUDE.md', kind: 'project', scope: 'project' },
];

const PLACEHOLDER = `# AGENTS.md — Project context for pi

This is the pi project's coding assistant configuration.
Loaded automatically when pi is invoked from this directory.

## Project

Name: my-project
Stack: TypeScript · React
Purpose: Describe your project here.

## Conventions

- All React components use function syntax
- TypeScript strict mode enabled

## Tool use policy

- Prefer read before write — always check the file first
- Never run \`rm -rf\` without listing contents first
- Shell commands: use \`--no-pager\` with git`;

function FileRow({ file, active, onClick }: { file: ContextFile; active: boolean; onClick: () => void }) {
  const kindColor: Record<string, string> = { agents: T.pi, system: T.tool, project: T.ok };
  const c = kindColor[file.kind] || T.textDim;
  return (
    <div onClick={onClick} style={{
      padding: '7px 12px', borderRadius: 4, cursor: 'pointer',
      background: active ? T.bgElev : 'transparent',
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: F.mono, fontSize: 11.5,
      color: active ? T.text : T.textDim,
      borderLeft: `2px solid ${active ? c : 'transparent'}`,
      marginLeft: -2, paddingLeft: 10,
    }}>
      <span style={{ color: c, fontSize: 10 }}>◈</span>
      <span style={{ flex: 1 }}>{file.path}</span>
      <Pill color={c} bg={`${c}15`} border={`${c}40`}>{file.kind}</Pill>
    </div>
  );
}

export function ContextEditor() {
  const [activeFile, setActiveFile] = useState<ContextFile>(CONTEXT_FILES[2]);
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [projectCwd, setProjectCwd] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.pi?.app) {
      window.pi.app.getCwd().then(setProjectCwd).catch(() => {});
    }
  }, []);

  const loadFile = useCallback(async (file: ContextFile) => {
    setLoading(true);
    if (window.pi?.fs) {
      try {
        const resolved = file.path.startsWith('~/.pi/')
          ? file.path.replace('~/.pi/', '')
          : file.path.startsWith('./') && projectCwd
            ? `${projectCwd}/${file.path.slice(2)}`
            : file.path;
        const text = await window.pi.fs.readFile(resolved);
        setContent(text);
        setSavedContent(text);
        setLoading(false);
        return;
      } catch {
        /* file may not exist — use placeholder */
      }
    }
    setContent(PLACEHOLDER);
    setSavedContent(PLACEHOLDER);
    setLoading(false);
  }, [projectCwd]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadFile(activeFile) }, [activeFile, loadFile]);

  const saveFile = useCallback(async (text: string) => {
    if (!window.pi?.fs) return;
    try {
      const resolved = activeFile.path.startsWith('~/.pi/')
        ? activeFile.path.replace('~/.pi/', '')
        : activeFile.path.startsWith('./') && projectCwd
          ? `${projectCwd}/${activeFile.path.slice(2)}`
          : activeFile.path;
      await window.pi.fs.writeFile(resolved, text);
      setSavedContent(text);
    } catch {
      /* best-effort */
    }
  }, [activeFile, projectCwd]);

  const handleChange = (text: string) => {
    setContent(text);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveFile(text), 1000);
  };

  const lines = content.split('\n').length;
  const saved = content === savedContent;

  return (
    <PiWindow title="pi · context editor">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Context Editor</span>
          <Pill>AGENTS.md · SYSTEM.md</Pill>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>changes auto-reload on /reload or new session</span>
          <Btn variant="ghost" icon="↺" onClick={() => rpc.sendPrompt('/reload')} title="Reload extensions, skills, and context">Reload</Btn>
          <Btn variant="ghost" icon="↗">pi.dev/context</Btn>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{
            width: 220, flexShrink: 0, padding: '14px 10px',
            borderRight: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto',
          }}>
            <SectionLabel>hierarchy · user scope</SectionLabel>
            {CONTEXT_FILES.filter((f) => f.scope === 'user').map((f) => (
              <FileRow key={f.path} file={f} active={f.path === activeFile.path} onClick={() => setActiveFile(f)} />
            ))}
            <div style={{ height: 8 }} />
            <SectionLabel>hierarchy · project scope</SectionLabel>
            {CONTEXT_FILES.filter((f) => f.scope === 'project').map((f) => (
              <FileRow key={f.path} file={f} active={f.path === activeFile.path} onClick={() => setActiveFile(f)} />
            ))}
            <div style={{ height: 10 }} />
            <Btn variant="ghost" icon="+">New context file</Btn>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: 13, color: T.pi }}>{activeFile.path}</span>
              <Pill color={saved ? T.ok : T.warn} bg={saved ? T.okBg : `${T.warn}15`} border={saved ? 'rgba(143,184,106,0.3)' : `${T.warn}40`}>
                {loading ? 'loading…' : saved ? 'saved' : 'unsaved'}
              </Pill>
              <div style={{ flex: 1 }} />
              <Btn variant="ghost" icon="↺" onClick={() => saveFile(content)}>save</Btn>
              <Btn variant="ghost" icon="↗">Open in editor</Btn>
            </div>

            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <div style={{ flex: 1, overflow: 'auto', background: T.bg, position: 'relative' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{
                    width: 38, flexShrink: 0, background: T.bgPanel, borderRight: `1px solid ${T.borderDim}`,
                    padding: '14px 0', overflow: 'hidden',
                    fontFamily: F.mono, fontSize: 11.5, color: T.textFaint, lineHeight: '20px', textAlign: 'right',
                    userSelect: 'none',
                  }}>
                    {Array.from({ length: lines }, (_, i) => (
                      <div key={i} style={{ padding: '0 8px' }}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => handleChange(e.target.value)}
                    spellCheck={false}
                    style={{
                      flex: 1, margin: 0, padding: '14px 18px',
                      fontFamily: F.mono, fontSize: 12.5, color: T.text, lineHeight: '20px',
                      background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                      whiteSpace: 'pre', overflowWrap: 'normal',
                    }}
                  />
                </div>
              </div>

              <div style={{
                width: 220, flexShrink: 0, borderLeft: `1px solid ${T.border}`,
                background: T.bgPanel, padding: '14px 12px', overflow: 'auto',
              }}>
                <SectionLabel>merged context preview</SectionLabel>
                <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, lineHeight: 1.6, marginBottom: 10 }}>
                  Total tokens consumed by context files:
                </div>
                <div style={{ marginBottom: 12 }}>
                  {([
                    ['~/.pi/AGENTS.md', '312 tok', T.pi],
                    ['./AGENTS.md', `${Math.ceil(content.length / 4)} tok`, T.pi],
                    ['./src/AGENTS.md', '201 tok', T.pi],
                    ['@earendil/plan-mode', '145 tok', T.tool],
                    ['rust-engineer', '89 tok', T.tool],
                  ] as const).map(([name, tok, c]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: F.mono, fontSize: 10, color: c, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{name}</span>
                      <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>{tok}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${T.borderDim}`, marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: F.mono, fontSize: 10, color: T.text, fontWeight: 600 }}>total</span>
                    <span style={{ fontFamily: F.mono, fontSize: 10, color: T.text, fontWeight: 600 }}>
                      {(312 + Math.ceil(content.length / 4) + 201 + 145 + 89).toLocaleString()} tok
                    </span>
                  </div>
                </div>
                <SectionLabel>reload trigger</SectionLabel>
                <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, marginBottom: 6 }}>
                  Context is re-injected:
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textDim, lineHeight: 1.8 }}>
                  · on session start<br/>
                  · after /reload command<br/>
                  · after new_session RPC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
