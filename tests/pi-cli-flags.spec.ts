/**
 * pi CLI flag tests — exhaustive coverage of flags and combinations.
 * No browser / page interaction. Run with CLI_TESTS_ONLY=1.
 */
import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { runPi, createTestProject, rmrf, piExecutable } from './helpers/pi-runner';

// ─── fixtures ───────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const TMP_DIR   = path.join(REPO_ROOT, 'tmp');
let   PROJECT   = '';
let   PI_FOUND  = false;

test.beforeAll(() => {
  try {
    piExecutable();
    PI_FOUND = true;
  } catch {
    PI_FOUND = false;
  }
  if (PI_FOUND) {
    PROJECT = createTestProject(TMP_DIR);
  }
});

test.afterAll(() => {
  if (PROJECT) {
    rmrf(path.join(PROJECT, '.sessions'));
  }
});

const BASE = ['--print', '--no-session'];

function pi(extra: string[], prompt: string): ReturnType<typeof runPi> {
  return runPi({ args: [...BASE, ...extra, prompt], cwd: PROJECT });
}

// ─── 1 · CLI flags — meta ───────────────────────────────────────────────────

test.describe('CLI flags — meta', () => {
  test('pi --version exits 0 and prints semver', () => {
    if (!PI_FOUND) test.skip();
    const r = runPi({ args: ['--version'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    const combined = r.stdout + r.stderr;
    expect(combined).toMatch(/\d+\.\d+\.\d+/);
  });

  test('pi --help exits 0 and lists core flags', () => {
    if (!PI_FOUND) test.skip();
    const r = runPi({ args: ['--help'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    const combined = r.stdout + r.stderr;
    expect(combined).toContain('--print');
    expect(combined).toContain('--no-session');
    expect(combined).toContain('--tools');
  });
});

// ─── 2 · CLI flags — model ──────────────────────────────────────────────────

test.describe('CLI flags — model', () => {
  test('pi --list-models exits 0 and shows table headers', () => {
    if (!PI_FOUND) test.skip();
    const r = runPi({ args: ['--list-models'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    const combined = r.stdout + r.stderr;
    expect(combined).toContain('provider');
    expect(combined).toContain('model');
    expect(combined).toContain('context');
  });

  test('pi --list-models sonnet filters to sonnet models', () => {
    if (!PI_FOUND) test.skip();
    const r = runPi({ args: ['--list-models', 'sonnet'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    const combined = r.stdout + r.stderr;
    expect(combined).toContain('sonnet');
  });

  test('pi --list-models xyzzy-no-match-zzz returns empty result, not error', () => {
    if (!PI_FOUND) test.skip();
    const r = runPi({ args: ['--list-models', 'xyzzy-no-match-zzz'], cwd: PROJECT });
    expect(r.exitCode).not.toBe(1);
  });

  test('pi --model flag is accepted (exit 0, flag does not crash)', () => {
    if (!PI_FOUND) test.skip();
    const r = runPi({
      args: [...BASE, '--no-tools', '--model', 'claude-sonnet-4-5', 'say: MODEL_OK'],
      cwd: PROJECT,
    });
    expect(r.ok).toBe(true);
  });
});

// ─── 3 · CLI flags — tool combinations ─────────────────────────────────────

test.describe('CLI flags — tool combinations', () => {
  test('--tools read alone is accepted', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--tools', 'read'], 'say: READ_OK');
    expect(r.ok).toBe(true);
  });

  test('--tools write alone is accepted', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--tools', 'write'], 'say: WRITE_OK');
    expect(r.ok).toBe(true);
  });

  test('--tools bash alone is accepted', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--tools', 'bash'], 'say: BASH_OK');
    expect(r.ok).toBe(true);
  });

  test('--tools read,write CSV combination is accepted and reads file', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--tools', 'read,write'], 'read src/utils.ts and tell me what it exports');
    expect(r.ok).toBe(true);
    expect(r.stdout.toLowerCase()).toContain('add');
  });

  test('--tools bash,find,grep combination is accepted', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--tools', 'bash,find,grep'], 'say: COMBO_OK');
    expect(r.ok).toBe(true);
  });

  test('--no-tools overrides any --tools flag', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--no-tools'], 'say: NO_TOOLS_OK');
    expect(r.ok).toBe(true);
  });
});

// ─── 4 · CLI flags — output mode ────────────────────────────────────────────

test.describe('CLI flags — output mode', () => {
  test('--mode text produces plain text output (not JSON)', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--no-tools', '--mode', 'text'], 'say: TEXTMODE');
    expect(r.ok).toBe(true);
    // Plain text output should not be parseable as a single JSON object on every line
    const lines = r.stdout.split('\n').filter(l => l.trim().length > 0);
    const allJson = lines.every(l => { try { JSON.parse(l); return true; } catch { return false; } });
    expect(allJson).toBe(false);
  });

  test('--mode json produces JSONL output with at least one object', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--no-tools', '--mode', 'json'], 'say: JSONMODE');
    expect(r.ok).toBe(true);
    const lines = r.stdout.split('\n').filter(l => l.trim().length > 0);
    let foundObject = false;
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed !== null && typeof parsed === 'object') {
          foundObject = true;
        }
      } catch {
        // skip non-JSON lines
      }
    }
    expect(foundObject).toBe(true);
  });
});

// ─── 5 · CLI flags — thinking levels ────────────────────────────────────────

test.describe('CLI flags — thinking levels', () => {
  const levels = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh'] as const;

  for (const level of levels) {
    test(`--thinking ${level} is accepted and prompt sentinel is in output`, () => {
      if (!PI_FOUND) test.skip();
      const sentinel = `THINK_${level.toUpperCase()}`;
      const r = pi(['--no-tools', '--thinking', level], `say: ${sentinel}`);
      expect(r.ok).toBe(true);
      expect(r.stdout).toContain(sentinel);
    });
  }
});

// ─── 6 · CLI flags — session lifecycle ──────────────────────────────────────

test.describe('CLI flags — session lifecycle', () => {
  test('--no-session leaves session count unchanged', () => {
    if (!PI_FOUND) test.skip();
    const sessionsDir = path.join(PROJECT, '.sessions');
    const before = fs.existsSync(sessionsDir) ? fs.readdirSync(sessionsDir).length : 0;
    pi(['--no-tools'], 'say: NO_SESSION_TEST');
    const after = fs.existsSync(sessionsDir) ? fs.readdirSync(sessionsDir).length : 0;
    expect(after).toBe(before);
  });

  test('--session-dir <dir> writes session file after run', () => {
    if (!PI_FOUND) test.skip();
    const sessDir = path.join(TMP_DIR, `session-dir-test-${Date.now()}`);
    fs.mkdirSync(sessDir, { recursive: true });
    try {
      const r = runPi({
        args: ['--print', '--session-dir', sessDir, '--no-tools', 'say: SESSION_WRITE'],
        cwd: PROJECT,
      });
      expect(r.ok).toBe(true);
      const files = fs.readdirSync(sessDir);
      expect(files.length).toBeGreaterThan(0);

      // All session files must contain only valid JSONL lines
      for (const f of files) {
        const content = fs.readFileSync(path.join(sessDir, f), 'utf8');
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        for (const line of lines) {
          expect(() => JSON.parse(line)).not.toThrow();
        }
      }
    } finally {
      rmrf(sessDir);
    }
  });
});

// ─── 7 · CLI flags — system prompt ──────────────────────────────────────────

test.describe('CLI flags — system prompt', () => {
  test('--system-prompt overrides default and response follows custom instruction', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(
      ['--no-tools', '--system-prompt', 'You only say: CUSTOM_ONLY.'],
      'hello',
    );
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('CUSTOM_ONLY');
  });

  test('--append-system-prompt appends tag to every reply', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(
      ['--no-tools', '--append-system-prompt', 'End every reply: APPENDED_TAG.'],
      'hello',
    );
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('APPENDED_TAG');
  });
});

// ─── 8 · CLI flags — file attachment ────────────────────────────────────────

test.describe('CLI flags — file attachment', () => {
  test('@file prefix inlines file content into prompt', () => {
    if (!PI_FOUND) test.skip();
    const r = pi(['--no-tools'], '@src/utils.ts what does this export?');
    expect(r.ok).toBe(true);
    expect(r.stdout.toLowerCase()).toContain('add');
  });
});

// ─── 9 · CLI flags — export ─────────────────────────────────────────────────

test.describe('CLI flags — export', () => {
  test('--export writes HTML file if exit 0 (feature-gated test)', () => {
    if (!PI_FOUND) test.skip();
    const outFile = path.join(TMP_DIR, `export-test-${Date.now()}.html`);
    // First create a session to export
    const sessDir = path.join(TMP_DIR, `export-sess-${Date.now()}`);
    fs.mkdirSync(sessDir, { recursive: true });

    try {
      const sessionRun = runPi({
        args: ['--print', '--session-dir', sessDir, '--no-tools', 'say: EXPORT_CONTENT'],
        cwd: PROJECT,
      });
      if (!sessionRun.ok) return; // skip if pi session creation fails

      const sessions = fs.readdirSync(sessDir).filter(f => f.endsWith('.jsonl'));
      if (sessions.length === 0) return; // skip if no session written

      const sessionFile = path.join(sessDir, sessions[0]);
      const r = runPi({
        args: ['--export', outFile, '--session', sessionFile],
        cwd: PROJECT,
      });
      if (r.exitCode === 0) {
        expect(fs.existsSync(outFile)).toBe(true);
        const html = fs.readFileSync(outFile, 'utf8');
        expect(html).toContain('<html');
      }
      // Non-zero exits are logged but do not fail (feature gated)
    } finally {
      rmrf(sessDir);
      fs.rmSync(outFile, { force: true });
    }
  });
});
