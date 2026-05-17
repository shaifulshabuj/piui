import { useState, useEffect, useCallback } from 'react';
import { T, F } from '../tokens';
import { Btn } from '../components/primitives';
import { PiWindow, SidebarMain } from '../components/shell';
import { useNav } from '../context/NavContext';
import type { GitStatusEntry, GitClassification, GitStatusResult } from '../types';

const CLASS_LABEL: Record<GitClassification, string> = {
  'build-artifact': 'Build Artifact',
  'test-report':    'Test Report',
  'dependency':     'Dependency',
  'source':         'Source',
  'config':         'Config',
  'log':            'Log File',
  'unknown':        'Unknown',
};

const CLASS_COLOR: Record<GitClassification, string> = {
  'build-artifact': T.textFaint,
  'test-report':    T.textFaint,
  'dependency':     T.textFaint,
  'source':         T.text,
  'config':         T.text,
  'log':            T.textDim,
  'unknown':        T.pi,
};

function useGitStatus() {
  const [result, setResult] = useState<GitStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.pi?.git.status();
      setResult(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { result, error, loading, refresh };
}

function StatusBadge({ status }: { status: GitStatusEntry['status'] }) {
  const colors: Record<GitStatusEntry['status'], string> = {
    modified:  '#d4a017',
    added:     '#3c9e4e',
    deleted:   '#c0392b',
    renamed:   '#8e44ad',
    untracked: '#2980b9',
  };
  return (
    <span style={{
      fontFamily: F.mono, fontSize: 10, padding: '1px 5px',
      borderRadius: 3, background: `${colors[status]}22`,
      color: colors[status], border: `1px solid ${colors[status]}55`,
    }}>
      {status}
    </span>
  );
}

function EntryRow({
  entry, onIgnore, alreadyQueued,
}: {
  entry: GitStatusEntry;
  onIgnore: (pattern: string) => void;
  alreadyQueued: boolean;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '10px 0', borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <StatusBadge status={entry.status} />
        <span style={{
          fontFamily: F.mono, fontSize: 12, color: CLASS_COLOR[entry.classification],
          wordBreak: 'break-all', flex: 1,
        }}>
          {entry.path}
        </span>
        <span style={{
          fontFamily: F.mono, fontSize: 10, color: T.textFaint,
          padding: '1px 5px', border: `1px solid ${T.border}`, borderRadius: 3,
        }}>
          {CLASS_LABEL[entry.classification]}
        </span>
        {entry.suggestIgnore && (
          <Btn
            variant="secondary"
            disabled={alreadyQueued}
            onClick={() => onIgnore(entry.suggestedPattern)}
          >
            {alreadyQueued ? '✓ queued' : '+ .gitignore'}
          </Btn>
        )}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: T.textDim, paddingLeft: 2 }}>
        {entry.reason}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontFamily: F.mono, fontSize: 10, color: T.textFaint,
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function GitStatus() {
  const { navigate } = useNav();
  const { result, error, loading, refresh } = useGitStatus();
  const [queuedPatterns, setQueuedPatterns] = useState<ReadonlySet<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleIgnore = useCallback((pattern: string) => {
    setQueuedPatterns((prev) => new Set([...prev, pattern]));
  }, []);

  const handleIgnoreAll = useCallback(() => {
    if (!result) return;
    const toIgnore = result.entries
      .filter((e) => e.suggestIgnore)
      .map((e) => e.suggestedPattern);
    setQueuedPatterns(new Set(toIgnore));
  }, [result]);

  const handleApply = useCallback(async () => {
    if (queuedPatterns.size === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await window.pi?.git.appendGitignore([...queuedPatterns]);
      setQueuedPatterns(new Set());
      await refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [queuedPatterns, refresh]);

  const suggested = result?.entries.filter((e) => e.suggestIgnore) ?? [];
  const clean = result?.entries.filter((e) => !e.suggestIgnore) ?? [];

  return (
    <PiWindow title="pi · git status">
      <SidebarMain />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          padding: '14px 24px 12px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button
            onClick={() => navigate('settings')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: T.textDim, fontFamily: F.mono, fontSize: 11.5, padding: '2px 6px',
            }}
          >
            ← Settings
          </button>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.pi }}>⎇</span>
          <span style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: T.text }}>
            Git Status
          </span>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 32px', background: T.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Btn variant="secondary" onClick={refresh} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </Btn>
            {suggested.length > 0 && (
              <Btn variant="secondary" onClick={handleIgnoreAll}>
                Queue all {suggested.length} for .gitignore
              </Btn>
            )}
            {queuedPatterns.size > 0 && (
              <Btn variant="primary" onClick={() => { void handleApply(); }} disabled={saving}>
                {saving ? 'Saving…' : `Apply ${queuedPatterns.size} pattern(s) to .gitignore`}
              </Btn>
            )}
          </div>

          {error && (
            <div style={{ color: T.err, fontFamily: F.mono, fontSize: 12, marginBottom: 12 }}>
              {error}
            </div>
          )}
          {saveError && (
            <div style={{ color: T.err, fontFamily: F.mono, fontSize: 12, marginBottom: 12 }}>
              {saveError}
            </div>
          )}

          {result && result.entries.length === 0 && (
            <div style={{ color: T.textDim, fontFamily: F.mono, fontSize: 13 }}>
              ✓ Working tree clean — nothing to commit.
            </div>
          )}

          {suggested.length > 0 && (
            <Section title={`Recommended to gitignore (${suggested.length})`}>
              {suggested.map((e) => (
                <EntryRow
                  key={e.path}
                  entry={e}
                  onIgnore={handleIgnore}
                  alreadyQueued={queuedPatterns.has(e.suggestedPattern)}
                />
              ))}
            </Section>
          )}

          {clean.length > 0 && (
            <Section title={`Review before committing (${clean.length})`}>
              {clean.map((e) => (
                <EntryRow
                  key={e.path}
                  entry={e}
                  onIgnore={handleIgnore}
                  alreadyQueued={queuedPatterns.has(e.suggestedPattern)}
                />
              ))}
            </Section>
          )}
        </div>
      </div>
    </PiWindow>
  );
}
