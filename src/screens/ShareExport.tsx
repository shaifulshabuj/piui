import { useEffect, useState } from 'react';
import { T, F } from '../tokens';
import { Btn, Kbd } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useChatStore } from '../store/chatStore';
import { rpc } from '../lib/rpcClient';

export function ShareExport() {
  const { messages, toolCalls, usage, sessionStats, isStreaming } = useChatStore();
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    rpc.getSessionStats();
    const timeout = setTimeout(() => {
      if (!cancelled) setStatsLoading(false);
    }, 5000);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sessionStats !== null) setStatsLoading(false);
  }, [sessionStats]);

  // Extract gist URL from last assistant message
  useEffect(() => {
    if (!isStreaming && isSharing) {
      const lastMsg = [...messages].reverse().find((m) => m.role === 'assistant');
      if (lastMsg?.content.includes('gist.github.com')) {
        const match = lastMsg.content.match(/https:\/\/gist\.github\.com\/[^\s)]+/);
        if (match) {
          setSharedUrl(match[0]);
          setIsSharing(false);
        }
      }
    }
  }, [isStreaming, messages, isSharing]);

  const copyUrl = () => { if (sharedUrl) navigator.clipboard?.writeText(sharedUrl).catch(() => {}); };
  const openUrl = (url: string) => window.open(url, '_blank');

  const exportJson = () => {
    const data = { messages, toolCalls, usage, sessionStats };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pi-session.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportHtml = () => { rpc.exportHtml(); };

  const share = () => {
    setIsSharing(true);
    setSharedUrl(null);
    rpc.sendPrompt('/share');
  };

  const stats = sessionStats ?? {
    messages: messages.length,
    toolCalls: toolCalls.length,
    tokens: usage.tokens,
    cost: usage.cost,
  };

  return (
    <PiWindow title="pi · share">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>/share</span>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Share & Export</span>
          <div style={{ flex: 1 }} />
          <Kbd>Ctrl+S</Kbd>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>save</span>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', background: T.bg }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>shared link</div>
            <div style={{
              borderRadius: 6, border: `1px solid ${sharedUrl ? T.piBorder : T.border}`,
              background: sharedUrl ? T.piBg : T.bgPanel,
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22,
            }}>
              {isSharing ? (
                <div style={{ flex: 1, fontFamily: F.mono, fontSize: 12, color: T.textMuted }}>
                  Sharing… (waiting for pi to respond)
                </div>
              ) : sharedUrl ? (
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F.mono, fontSize: 13, color: T.pi, marginBottom: 4 }}>{sharedUrl}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>Published as GitHub Gist · public</div>
                </div>
              ) : (
                <div style={{ flex: 1, fontFamily: F.mono, fontSize: 12, color: T.textMuted }}>
                  No shared link yet — click Share to publish this session as a GitHub Gist.
                </div>
              )}
              {sharedUrl && (
                <>
                  <Btn variant="outline" icon="⊞" onClick={copyUrl}>Copy</Btn>
                  <Btn variant="ghost" icon="↗" onClick={() => openUrl(sharedUrl)}>Open</Btn>
                </>
              )}
            </div>

            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>export options</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
              <div style={{ padding: '14px 16px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: F.mono, fontSize: 18, color: T.info }}>◉</span>
                  <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text, fontWeight: 500 }}>html</span>
                </div>
                <div style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, flex: 1 }}>Self-contained .html with syntax highlighting</div>
                <Btn variant="outline" onClick={exportHtml}>Export .html</Btn>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.bgPanel, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: F.mono, fontSize: 18, color: T.tool }}>◈</span>
                  <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text, fontWeight: 500 }}>json</span>
                </div>
                <div style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, flex: 1 }}>Raw session JSON — messages, tool calls, usage</div>
                <Btn variant="outline" onClick={exportJson}>Export .json</Btn>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <Btn variant="secondary" icon="☁" onClick={share} disabled={isSharing}>
                {isSharing ? 'Sharing…' : 'Share as GitHub Gist (/share)'}
              </Btn>
            </div>

            {sharedUrl && (
              <>
                <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>html preview</div>
                <div style={{ borderRadius: 6, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                  <div style={{ background: T.bgPanel, padding: '8px 14px', borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>preview · {sharedUrl}</span>
                  </div>
                  <div style={{ background: '#181614', padding: '18px 22px' }}>
                    <div style={{ fontFamily: F.mono, fontSize: 11, color: '#f0a45a', marginBottom: 4 }}>π assistant</div>
                    <div style={{ background: '#15140f', borderRadius: 4, padding: '6px 10px', fontFamily: F.mono, fontSize: 11, color: '#c4b896' }}>
                      Ready to help with your project…
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ width: 220, flexShrink: 0, borderLeft: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto', padding: '16px 14px' }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>session info</div>
            {statsLoading ? (
              <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>Loading…</div>
            ) : (
              ([
                ['messages', String(stats.messages ?? messages.length)],
                ['tool calls', String(stats.toolCalls ?? toolCalls.length)],
                ['tokens used', stats.tokens ? `${(Number(stats.tokens) / 1000).toFixed(1)}k` : '—'],
                ['cost', stats.cost ? `$${Number(stats.cost).toFixed(3)}` : '—'],
              ] as const).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted }}>{k}</span>
                  <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.text }}>{v}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
