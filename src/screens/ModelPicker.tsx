import { T, F } from '../tokens';
import { Pill, Btn, Kbd, SectionLabel } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useModelStore } from '../store/modelStore';
import type { Model } from '../types';

function ModelRow({ provider, name, ctx, price, fav, current, status, tags, onClick }: Model & { onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '14px 1fr auto auto auto',
      gap: 14, alignItems: 'center', padding: '9px 14px',
      borderTop: `1px solid ${T.borderDim}`,
      background: current ? T.piBg : 'transparent',
      fontFamily: F.mono, fontSize: 12, cursor: 'pointer',
    }}>
      <span style={{ color: fav ? T.warn : T.textFaint, fontSize: 11 }}>{fav ? '★' : '☆'}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ color: T.textMuted, fontSize: 10.5 }}>{provider}/</span>
          <span style={{ color: current ? T.pi : T.text, fontWeight: current ? 600 : 500 }}>{name}</span>
          {current && <Pill color={T.pi} bg={T.piBg} border={T.piBorder}>active</Pill>}
          {tags?.map((t) => <Pill key={t} color={T.textMuted} bg={T.bgPanel} border={T.border}>{t}</Pill>)}
        </div>
      </div>
      <span style={{ color: T.textDim, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{ctx}</span>
      <span style={{ color: T.textDim, fontSize: 11, fontVariantNumeric: 'tabular-nums', width: 110, textAlign: 'right' }}>{price}</span>
      <span style={{
        color: status === 'ready' ? T.ok : status === 'rate' ? T.warn : T.textFaint,
        fontSize: 10, width: 80, textAlign: 'right',
      }}>
        {status === 'ready' ? '● ready' : status === 'rate' ? '● rate-limited' : '○ no key'}
      </span>
    </div>
  );
}

function ProviderTab({ name, count, active }: { name: string; count?: string; active?: boolean }) {
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 5,
      fontFamily: F.mono, fontSize: 11.5,
      color: active ? T.text : T.textDim,
      background: active ? T.bgElev : 'transparent',
      borderLeft: `2px solid ${active ? T.pi : 'transparent'}`,
      marginLeft: -2, paddingLeft: 10,
      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    }}>
      <span style={{ flex: 1 }}>{name}</span>
      {count && <span style={{ fontSize: 10, color: T.textFaint }}>{count}</span>}
    </div>
  );
}

export function ModelPicker() {
  const { models, setCurrentModel } = useModelStore();

  return (
    <PiWindow title="pi · /model">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 24px 12px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>/model</span>
            <span style={{ fontFamily: F.sans, fontSize: 15, color: T.text, fontWeight: 500 }}>switch model</span>
            <Pill>{models.length} models</Pill>
            <div style={{ flex: 1 }} />
            <Kbd>Ctrl+L</Kbd>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>open</span>
            <Kbd>Ctrl+P</Kbd>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>cycle favorites</span>
          </div>
          <div style={{
            marginTop: 12, display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 6,
            border: `1px solid ${T.borderHi}`, background: T.bgInput,
            boxShadow: `0 0 0 3px ${T.piBg}`,
          }}>
            <span style={{ color: T.pi, fontFamily: F.mono }}>⌕</span>
            <span style={{ fontFamily: F.mono, fontSize: 13, color: T.text, flex: 1 }}>
              opus<span style={{
                display: 'inline-block', width: 7, height: 14, background: T.pi,
                marginLeft: 1, verticalAlign: 'text-bottom',
                animation: 'pi-blink 1s steps(2) infinite',
              }} />
            </span>
            <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textMuted }}>
              3 matches · ↑↓ navigate · ↵ select · esc cancel
            </span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{
            width: 200, flexShrink: 0, padding: '12px 8px',
            borderRight: `1px solid ${T.border}`, background: T.bgPanel, overflow: 'auto',
          }}>
            <SectionLabel>providers</SectionLabel>
            <ProviderTab name="★ favorites" count="6" />
            <ProviderTab name="all" count={String(models.length)} active />
            <div style={{ height: 8 }} />
            <ProviderTab name="Anthropic" count="9" />
            <ProviderTab name="OpenAI" count="14" />
            <ProviderTab name="Google" count="11" />
            <ProviderTab name="Azure" count="14" />
            <ProviderTab name="Bedrock" count="22" />
            <ProviderTab name="Mistral" count="9" />
            <ProviderTab name="Groq" count="6" />
            <ProviderTab name="Cerebras" count="4" />
            <ProviderTab name="xAI" count="3" />
            <ProviderTab name="Hugging Face" count="18" />
            <ProviderTab name="Ollama" count="12" />
            <div style={{ height: 8 }} />
            <SectionLabel>custom</SectionLabel>
            <ProviderTab name="+ add provider" />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: T.bg }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '14px 1fr auto auto auto',
              gap: 14, padding: '8px 14px',
              fontFamily: F.mono, fontSize: 10, color: T.textFaint,
              textTransform: 'uppercase', letterSpacing: 0.8,
              borderBottom: `1px solid ${T.border}`, background: T.bgPanel,
            }}>
              <span></span><span>model</span><span>context</span>
              <span style={{ width: 110, textAlign: 'right' }}>in/out · 1M tok</span>
              <span style={{ width: 80, textAlign: 'right' }}>status</span>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              {models.map((m) => (
                <ModelRow
                  key={`${m.provider}/${m.name}`}
                  {...m}
                  onClick={() => setCurrentModel(m.name)}
                />
              ))}
            </div>

            <div style={{
              padding: '10px 18px', borderTop: `1px solid ${T.border}`,
              background: T.bgPanel, display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: F.mono, fontSize: 11, color: T.textMuted,
            }}>
              <Kbd>f</Kbd> favorite <Kbd>k</Kbd> set key <Kbd>o</Kbd> oauth <Kbd>i</Kbd> info
              <div style={{ flex: 1 }} />
              <span>defined in <span style={{ color: T.info }}>~/.pi/models.json</span></span>
              <Btn variant="ghost" icon="✎">Edit models.json</Btn>
            </div>
          </div>
        </div>
      </div>
    </PiWindow>
  );
}
