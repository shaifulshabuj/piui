import { useState, useEffect, useCallback } from 'react';
import { T, F } from '../tokens';
import { Pill, Btn } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { MessageUser, MessageAssistant, ToolCall, SteeringQueue, Composer } from '../components/chat';
import { useNav } from '../context/NavContext';
import { useChatStore } from '../store/chatStore';
import { rpc } from '../lib/rpcClient';

function EmptyState({ onSend }: { onSend: (msg: string) => void }) {
  const suggestions = [
    'Explain this codebase to me',
    'Fix any type errors in src/',
    'Write tests for the session store',
  ];
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      padding: '0 40px',
    }}>
      <span style={{ fontFamily: F.mono, fontSize: 48, color: T.pi, opacity: 0.4 }}>π</span>
      <div style={{ fontFamily: F.sans, fontSize: 15, color: T.textDim }}>Start a session</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 480 }}>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSend(s)}
            style={{
              textAlign: 'left', padding: '10px 16px',
              borderRadius: 6, cursor: 'pointer',
              background: T.bgElev, border: `1px solid ${T.border}`,
              fontFamily: F.sans, fontSize: 13, color: T.textDim,
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function CompactModal({ open, instructions, onInstructionsChange, onConfirm, onCancel }: {
  open: boolean;
  instructions: string;
  onInstructionsChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: T.bgPanel, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: '20px 22px', width: 420,
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>
          Compact session
        </div>
        <div style={{ fontFamily: F.sans, fontSize: 12.5, color: T.textDim }}>
          Summarize older context to free up tokens. Optionally provide focus instructions.
        </div>
        <textarea
          autoFocus
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="Optional focus for compaction…"
          style={{
            background: T.bgInput, border: `1px solid ${T.border}`,
            borderRadius: 5, padding: '8px 10px', outline: 'none',
            fontFamily: F.mono, fontSize: 12, color: T.text,
            resize: 'vertical', minHeight: 80, width: '100%',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="primary" onClick={onConfirm}>Compact</Btn>
        </div>
      </div>
    </div>
  );
}

export function MainChat() {
  const { navigate, openOverlay } = useNav();
  const { messages, toolCalls, isStreaming, isCompacting, isRetrying, retryAttempt, usage, sendPrompt } = useChatStore();
  const [showCompactModal, setShowCompactModal] = useState(false);
  const [compactInstructions, setCompactInstructions] = useState('');

  const handleCompactConfirm = useCallback(() => {
    rpc.compact(compactInstructions.trim() || undefined);
    setShowCompactModal(false);
    setCompactInstructions('');
  }, [compactInstructions]);

  const handleCompactCancel = useCallback(() => {
    setShowCompactModal(false);
    setCompactInstructions('');
  }, []);

  return (
    <PiWindow title="pi · ~/code/pi-ui · main">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* header */}
        <div style={{
          height: 38, flexShrink: 0, display: 'flex', alignItems: 'center',
          gap: 10, padding: '0 24px',
          borderBottom: `1px solid ${T.border}`,
          fontFamily: F.mono, fontSize: 11.5, color: T.textDim,
        }}>
          <span style={{ color: T.text, fontWeight: 500 }}>pi ui design system</span>
          <Pill border={T.piBorder} bg={T.piBg} color={T.pi}>main</Pill>
          <span style={{ color: T.textFaint }}>·</span>
          <span>{messages.length} turns</span>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="+" onClick={() => rpc.newSession()}>New</Btn>
          <Btn variant="ghost" icon="⎇" onClick={() => navigate('tree')}>Tree</Btn>
          <Btn variant="ghost" icon="↗" onClick={() => navigate('share')}>Share</Btn>
          <Btn variant="ghost" icon="⊕" onClick={() => { rpc.clone(); navigate('chat'); }} title="Clone to new session">Clone</Btn>
          <Btn variant="ghost" icon="⊙" onClick={() => setShowCompactModal(true)} title="Compact session">Compact</Btn>
          <Btn variant="ghost" icon="⋯" onClick={() => navigate('inspect')} />
        </div>

        {/* status banners */}
        {isCompacting && (
          <div style={{
            padding: '6px 24px', background: `${T.pi}18`,
            borderBottom: `1px solid ${T.piBorder}`,
            fontFamily: F.mono, fontSize: 11, color: T.pi,
          }}>
            ⊙ Compacting session history…
          </div>
        )}
        {isRetrying && (
          <div style={{
            padding: '6px 24px', background: `${T.warn}15`,
            borderBottom: `1px solid ${T.warn}40`,
            fontFamily: F.mono, fontSize: 11, color: T.warn,
          }}>
            ↻ Auto-retrying (attempt {retryAttempt})…
          </div>
        )}

        {/* conversation */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, background: T.bg, display: 'flex', flexDirection: 'column' }}>
          {messages.length === 0 ? (
            <EmptyState onSend={sendPrompt} />
          ) : (
            <>
              {messages.map((msg) => {
                if (msg.role === 'user') {
                  return <MessageUser key={msg.id}>{msg.content}</MessageUser>;
                }
                return (
                  <MessageAssistant key={msg.id} streaming={msg.streaming}>
                    {msg.content}
                  </MessageAssistant>
                );
              })}

              {toolCalls.map((tc) => (
                <ToolCall key={tc.id} tool={tc.tool} args={tc.args} status={tc.status} output={tc.output} />
              ))}

              <SteeringQueue />
            </>
          )}
          <div style={{ height: 14 }} />
        </div>

        <Composer
          onCommandPalette={() => openOverlay('command-palette')}
          onSubmit={sendPrompt}
          usage={usage}
        />

        <CompactModal
          open={showCompactModal}
          instructions={compactInstructions}
          onInstructionsChange={setCompactInstructions}
          onConfirm={handleCompactConfirm}
          onCancel={handleCompactCancel}
        />
      </div>
    </PiWindow>
  );
}
