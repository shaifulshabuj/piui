import { useState } from 'react';
import { T, F } from '../tokens';
import { Pill, Btn, Dot } from '../components/primitives';
import { PiWindow } from '../components/shell';
import { useNav } from '../context/NavContext';
import { rpc } from '../lib/rpcClient';

function OnboardingTab({ label, active }: { label: string; active?: boolean }) {
  return (
    <div style={{
      padding: '6px 14px', borderRadius: 5,
      fontFamily: F.mono, fontSize: 11.5,
      color: active ? T.text : T.textMuted,
      background: active ? T.bgElev : 'transparent',
      border: `1px solid ${active ? T.border : 'transparent'}`,
    }}>{label}</div>
  );
}

function InstallBlock({ active, cmd }: { active: string; cmd: string }) {
  return (
    <div style={{
      border: `1px solid ${T.piBorder}`, borderRadius: 6,
      background: T.bgInput, boxShadow: `0 0 0 3px ${T.piBg}`,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.borderDim}` }}>
        {['curl', 'npm', 'pnpm', 'bun'].map((k) => (
          <div key={k} style={{
            padding: '7px 14px', fontFamily: F.mono, fontSize: 11,
            color: k === active ? T.pi : T.textMuted,
            borderBottom: `2px solid ${k === active ? T.pi : 'transparent'}`,
            cursor: 'default',
          }}>{k}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '7px 14px', fontFamily: F.mono, fontSize: 11, color: T.textDim, cursor: 'pointer' }}>copy</div>
      </div>
      <div style={{ padding: '14px 16px', fontFamily: F.mono, fontSize: 13.5, color: T.text, lineHeight: 1.6 }}>
        <span style={{ color: T.textMuted, userSelect: 'none' }}>$ </span>
        {cmd}
      </div>
    </div>
  );
}

function ProviderRow({ name, models, status, hint, authType, onOAuth, onKeySubmit }: {
  name: string; models: string; status: string; hint: string;
  authType: 'oauth' | 'key' | 'auto';
  onOAuth?: () => void;
  onKeySubmit?: (key: string) => void;
}) {
  const [editingKey, setEditingKey] = useState(false);
  const [keyValue, setKeyValue] = useState('');
  const color = status === 'connected' ? T.ok : status === 'oauth' ? T.info : T.textMuted;
  const label = status === 'connected' ? 'connected' : authType === 'oauth' ? 'sign in' : authType === 'key' ? 'add key' : 'auto';

  const handleClick = () => {
    if (status === 'connected' || authType === 'auto') return;
    if (authType === 'oauth') { onOAuth?.(); }
    else { setEditingKey(true); }
  };

  const submitKey = () => {
    if (!keyValue.trim()) return;
    onKeySubmit?.(keyValue.trim());
    setKeyValue('');
    setEditingKey(false);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '11px 14px', borderRadius: 6,
      border: `1px solid ${status === 'connected' ? T.borderHi : T.border}`,
      background: status === 'connected' ? T.bgPanel : 'transparent',
      flexDirection: editingKey ? 'column' : 'row',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 5,
          background: T.bgElev, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: F.mono, fontWeight: 600, color: T.text, fontSize: 13,
        }}>{name[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.mono, fontSize: 13, color: T.text }}>{name}</div>
          <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, marginTop: 2 }}>
            {models} models · {hint}
          </div>
        </div>
        <div onClick={handleClick} style={{ cursor: status === 'connected' || authType === 'auto' ? 'default' : 'pointer' }}>
          <Pill color={color} bg={status === 'connected' ? T.okBg : T.bgElev}
            border={status === 'connected' ? 'rgba(143,184,106,0.3)' : T.border}>
            {status === 'connected' && <Dot color={T.ok} size={5} />}
            {label}
          </Pill>
        </div>
      </div>
      {editingKey && (
        <div style={{ display: 'flex', gap: 8, width: '100%', paddingLeft: 42 }}>
          <input
            autoFocus
            type="password"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitKey(); if (e.key === 'Escape') { setEditingKey(false); setKeyValue(''); } }}
            placeholder={`${name.toLowerCase()} API key…`}
            style={{
              flex: 1, fontFamily: F.mono, fontSize: 11.5,
              background: T.bgInput, border: `1px solid ${T.piBorder}`,
              borderRadius: 4, padding: '5px 10px', color: T.text, outline: 'none',
            }}
          />
          <Btn variant="primary" onClick={submitKey}>Connect</Btn>
          <Btn variant="ghost" onClick={() => { setEditingKey(false); setKeyValue(''); }}>Cancel</Btn>
        </div>
      )}
    </div>
  );
}

export function Onboarding() {
  const { navigate } = useNav();
  return (
    <PiWindow title="pi · first run" statusbar={
      <div style={{
        height: 24, flexShrink: 0, display: 'flex', alignItems: 'center',
        padding: '0 14px', borderTop: `1px solid ${T.border}`, background: T.bgPanel,
        fontFamily: F.mono, fontSize: 10.5, color: T.textMuted, gap: 14,
      }}>
        <span>step 2 of 4</span><span>·</span>
        <span>this only runs the first time</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: T.textFaint }}>v0.18.2</span>
      </div>
    }>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'auto' }}>
        {/* hero */}
        <div style={{ padding: '52px 64px 24px', display: 'flex', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontFamily: F.mono, fontSize: 96, fontWeight: 500, color: T.pi, lineHeight: 1, letterSpacing: -2 }}>π</span>
              <div>
                <div style={{ fontFamily: F.sans, fontSize: 32, fontWeight: 500, color: T.text, letterSpacing: -0.5 }}>
                  There are many agent harnesses.
                </div>
                <div style={{ fontFamily: F.sans, fontSize: 32, fontWeight: 500, color: T.pi, letterSpacing: -0.5 }}>
                  This one is yours.
                </div>
              </div>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 13, color: T.textDim, marginTop: 18, maxWidth: 640, lineHeight: 1.6 }}>
              Pi is a minimal terminal coding harness. Bring your own models,
              tools, and workflows — adapt pi to how you work, not the other way around.
            </div>
          </div>
        </div>

        {/* step tabs */}
        <div style={{ padding: '0 64px', display: 'flex', gap: 4, marginBottom: 18 }}>
          <OnboardingTab label="1 · install" />
          <span style={{ color: T.textFaint, alignSelf: 'center' }}>›</span>
          <OnboardingTab label="2 · connect a model" active />
          <span style={{ color: T.textFaint, alignSelf: 'center' }}>›</span>
          <OnboardingTab label="3 · pick a project" />
          <span style={{ color: T.textFaint, alignSelf: 'center' }}>›</span>
          <OnboardingTab label="4 · first session" />
        </div>

        {/* body — two columns */}
        <div style={{ padding: '0 64px 48px', display: 'flex', gap: 32, flex: 1 }}>
          <div style={{ flex: 1.4 }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: T.textDim, marginBottom: 14 }}>
              <span style={{ color: T.pi }}># </span>connect at least one provider — you can add more anytime
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <ProviderRow name="Anthropic" models="9" hint="OAuth via claude.ai or API key" status="connected" authType="oauth" />
              <ProviderRow name="OpenAI" models="14" hint="API key or OAuth" status="oauth" authType="oauth"
                onOAuth={() => rpc.sendPrompt('/login openai')} />
              <ProviderRow name="Google" models="11" hint="Gemini · Vertex" status="oauth" authType="oauth"
                onOAuth={() => rpc.sendPrompt('/login google')} />
              <ProviderRow name="Groq" models="6" hint="API key · ultra-fast inference" status="key" authType="key"
                onKeySubmit={(k) => rpc.sendPrompt(`/login groq --key ${k}`)} />
              <ProviderRow name="Ollama" models="local" hint="auto-discovered on localhost:11434" status="connected" authType="auto" />
              <ProviderRow name="OpenRouter" models="200+" hint="aggregator · API key" status="key" authType="key"
                onKeySubmit={(k) => rpc.sendPrompt(`/login openrouter --key ${k}`)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px 0', fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>
                <span style={{ color: T.textFaint }}>+ 11 more:</span>
                <span>Azure · Bedrock · Mistral · Cerebras · xAI · Hugging Face · Kimi · MiniMax · …</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 12, color: T.textDim, marginBottom: 8 }}>
                <span style={{ color: T.pi }}># </span>install
              </div>
              <InstallBlock active="curl" cmd="curl -fsSL https://pi.dev/install.sh | sh" />
            </div>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 12, color: T.textDim, marginBottom: 8 }}>
                <span style={{ color: T.pi }}># </span>four ways to run
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: F.mono, fontSize: 12, color: T.textDim }}>
                {([
                  ['interactive', 'pi', 'full TUI experience'],
                  ['print/JSON', 'pi -p "summarize CHANGELOG.md"', 'one-shot for scripts'],
                  ['RPC', 'pi --rpc', 'JSON over stdin/stdout'],
                  ['SDK', "import { Pi } from '@earendil/pi'", 'embed in your app'],
                ] as const).map(([k, c, h]) => (
                  <div key={k} style={{ padding: '8px 10px', borderRadius: 5, border: `1px solid ${T.border}`, background: T.bgPanel }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: T.pi, fontWeight: 500, width: 84 }}>{k}</span>
                      <code style={{ color: T.text }}>{c}</code>
                    </div>
                    <div style={{ color: T.textMuted, fontSize: 10.5, paddingLeft: 92, marginTop: 2 }}>{h}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: '14px 64px 22px', display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${T.border}` }}>
          <Btn variant="ghost" icon="←">Back</Btn>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>
            2 connected · skip and add later anytime
          </span>
          <Btn variant="outline">Skip</Btn>
          <Btn variant="primary" kbd="↵" onClick={() => navigate('chat')}>Continue →</Btn>
        </div>
      </div>
    </PiWindow>
  );
}
