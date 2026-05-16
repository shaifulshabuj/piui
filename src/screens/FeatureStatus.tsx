import { useState, useMemo } from 'react';
import { T, F } from '../tokens';
import { Btn } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { PI_FEATURES, type PiFeature, type FeatureImpl } from '../data/featureStatus';

const STATUS_COLORS: Record<FeatureImpl, string> = {
  implemented: T.ok,
  partial: T.warn,
  'not-yet': T.pi,
  'not-possible': T.textMuted,
};

const STATUS_LABELS: Record<FeatureImpl, string> = {
  implemented: 'implemented',
  partial: 'partial',
  'not-yet': 'not yet',
  'not-possible': 'not possible',
};

function StatusDot({ status }: { status: FeatureImpl }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8, borderRadius: '50%',
      background: STATUS_COLORS[status],
      marginRight: 8, flexShrink: 0,
    }} />
  );
}

function FeatureRow({ feature }: { feature: PiFeature }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '7px 0', borderBottom: `1px solid ${T.borderDim}`,
    }}>
      <StatusDot status={feature.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: 12.5, color: T.text, fontWeight: 500 }}>
            {feature.name}
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: STATUS_COLORS[feature.status] }}>
            {STATUS_LABELS[feature.status]}
          </span>
        </div>
        <div style={{ fontFamily: F.sans, fontSize: 12, color: T.textDim, marginTop: 2 }}>
          {feature.description}
        </div>
        {feature.notes && (
          <div style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textFaint, marginTop: 3 }}>
            {feature.notes}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryPill({ status, count }: { status: FeatureImpl; count: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 4,
      border: `1px solid ${STATUS_COLORS[status]}40`,
      background: `${STATUS_COLORS[status]}12`,
      fontFamily: F.mono, fontSize: 11,
    }}>
      <span style={{ color: STATUS_COLORS[status], fontWeight: 600 }}>{count}</span>
      <span style={{ color: T.textDim }}>{STATUS_LABELS[status]}</span>
    </div>
  );
}

export function FeatureStatus() {
  const [query, setQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query) return PI_FEATURES;
    const q = query.toLowerCase();
    return PI_FEATURES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [query]);

  const categorized = useMemo(() => {
    const map = new Map<string, PiFeature[]>();
    for (const f of filtered) {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    }
    return map;
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<FeatureImpl, number> = {
      implemented: 0, partial: 0, 'not-yet': 0, 'not-possible': 0,
    };
    for (const f of PI_FEATURES) c[f.status]++;
    return c;
  }, []);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <PiWindow title="pi · feature status">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '14px 24px 12px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>◎</span>
            <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Feature Status</span>
            <span style={{ fontFamily: F.mono, fontSize: 10.5, color: T.textFaint }}>
              {PI_FEATURES.length} features tracked
            </span>
            <div style={{ flex: 1 }} />
            <Btn
              variant="ghost"
              icon="↗"
              onClick={() => window.open('https://pi.dev/docs/latest', '_blank')}
            >
              pi.dev/docs
            </Btn>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <SummaryPill status="implemented" count={counts.implemented} />
            <SummaryPill status="partial" count={counts.partial} />
            <SummaryPill status="not-yet" count={counts['not-yet']} />
            <SummaryPill status="not-possible" count={counts['not-possible']} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 5,
            border: `1px solid ${T.border}`, background: T.bgInput,
          }}>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.textMuted }}>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search features…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: F.mono, fontSize: 12, color: T.text,
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px', background: T.bg }}>
          {categorized.size === 0 && (
            <div style={{ fontFamily: F.mono, fontSize: 12, color: T.textFaint, padding: '20px 0' }}>
              No features match your search.
            </div>
          )}
          {[...categorized.entries()].map(([category, features]) => {
            const isCollapsed = collapsedCategories.has(category);
            return (
              <div key={category} style={{ marginBottom: 20 }}>
                <div
                  onClick={() => toggleCategory(category)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', marginBottom: 4,
                    cursor: 'pointer', userSelect: 'none',
                  }}
                >
                  <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>
                    {isCollapsed ? '▸' : '▾'}
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
                    {category}
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 10, color: T.textFaint }}>
                    {features.length}
                  </span>
                </div>
                {!isCollapsed && features.map((f) => (
                  <FeatureRow key={f.id} feature={f} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </PiWindow>
  );
}
