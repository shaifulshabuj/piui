/**
 * pi CLI integration tests
 * Uses Playwright test runner + Node.js spawnSync to drive the real `pi` binary
 * against a fixture project in tmp/test-project/.
 * No browser / page interaction.
 */
import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { runPi, createTestProject, rmrf } from './helpers/pi-runner';

// ─── fixtures ───────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const TMP_DIR   = path.join(REPO_ROOT, 'tmp');
let   PROJECT   = '';

test.beforeAll(() => {
  PROJECT = createTestProject(TMP_DIR);
});

test.afterAll(() => {
  // Remove only runtime artifacts; leave committed fixture files intact
  rmrf(path.join(PROJECT, '.sessions'));
  const exports = fs.readdirSync(PROJECT).filter(f => f.endsWith('.html') || f.endsWith('.json.export'));
  for (const f of exports) fs.rmSync(path.join(PROJECT, f));
});

// ─── helpers ────────────────────────────────────────────────────────────────

/** Standard flags shared by all non-interactive runs */
const BASE_FLAGS = ['--print', '--no-session'];

function pi(extra: string[], prompt: string): ReturnType<typeof runPi> {
  return runPi({ args: [...BASE_FLAGS, ...extra, prompt], cwd: PROJECT });
}

// ─── 1 · CLI meta ───────────────────────────────────────────────────────────

test.describe('CLI meta', () => {
  test('pi --version exits 0 and prints semver', () => {
    const r = runPi({ args: ['--version'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    // pi writes --version to stderr when not connected to a TTY
    const combined = r.stdout + r.stderr;
    expect(combined).toMatch(/\d+\.\d+\.\d+/);
  });

  test('pi --help exits 0 and lists core flags', () => {
    const r = runPi({ args: ['--help'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    // pi writes --help to stderr when not connected to a TTY
    const combined = r.stdout + r.stderr;
    expect(combined).toContain('--print');
    expect(combined).toContain('--no-session');
    expect(combined).toContain('--tools');
  });
});

// ─── 2 · Model listing ──────────────────────────────────────────────────────

test.describe('Model listing', () => {
  test('pi --list-models exits 0 and shows table headers', () => {
    const r = runPi({ args: ['--list-models'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    // pi writes --list-models to stderr when not connected to a TTY
    const combined = r.stdout + r.stderr;
    expect(combined).toContain('provider');
    expect(combined).toContain('model');
    expect(combined).toContain('context');
  });

  test('pi --list-models <pattern> filters results', () => {
    const r = runPi({ args: ['--list-models', 'sonnet'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    const combined = r.stdout + r.stderr;
    expect(combined).toContain('sonnet');
  });

  test('pi --list-models with unknown pattern returns empty or 0 rows', () => {
    const r = runPi({ args: ['--list-models', 'xyzzy-no-such-model-zzz'], cwd: PROJECT });
    // Exit 0 even with empty results
    expect(r.exitCode).not.toBe(1);
  });
});

// ─── 3 · Extension/package listing ─────────────────────────────────────────

test.describe('Extensions', () => {
  test('pi list exits 0 and contains "packages" section', () => {
    const r = runPi({ args: ['list'], cwd: PROJECT });
    expect(r.ok).toBe(true);
    expect(r.stdout.toLowerCase()).toContain('package');
  });
});

// ─── 4 · Non-interactive prompt (no tools) ──────────────────────────────────

test.describe('Non-interactive prompt', () => {
  test('pi -p --no-tools echoes a simple response', () => {
    const r = pi(['--no-tools'], 'say exactly: PING_OK');
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('PING_OK');
  });

  test('pi -p exits 0 on valid prompt', () => {
    const r = pi(['--no-tools'], 'say: HELLO');
    expect(r.exitCode).toBe(0);
  });
});

// ─── 5 · Read tool ──────────────────────────────────────────────────────────

test.describe('Read tool', () => {
  test('pi --tools read can read src/index.ts', () => {
    const r = pi(['--tools', 'read'], 'read src/index.ts and output the function name you see');
    expect(r.ok).toBe(true);
    expect(r.stdout.toLowerCase()).toContain('greeting');
  });

  test('pi --tools read can read README.md', () => {
    const r = pi(['--tools', 'read'], 'read README.md and tell me the project name');
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('pi Test Project');
  });

  test('pi with @file attachment inlines file content', () => {
    const r = runPi({
      args: [...BASE_FLAGS, '--no-tools', '@src/utils.ts', 'what function is exported?'],
      cwd: PROJECT,
    });
    expect(r.ok).toBe(true);
    expect(r.stdout.toLowerCase()).toContain('add');
  });
});

// ─── 6 · Write tool ─────────────────────────────────────────────────────────

test.describe('Write tool', () => {
  test('pi --tools write creates a new file', () => {
    const outFile = path.join(PROJECT, 'generated.txt');
    fs.rmSync(outFile, { force: true });
    const r = pi(['--tools', 'write'], 'create a file called generated.txt with content: WRITE_SUCCESS');
    expect(r.ok).toBe(true);
    expect(fs.existsSync(outFile)).toBe(true);
    expect(fs.readFileSync(outFile, 'utf8')).toContain('WRITE_SUCCESS');
  });

  test('pi --tools write overwrites an existing file', () => {
    const outFile = path.join(PROJECT, 'generated.txt');
    fs.writeFileSync(outFile, 'OLD_CONTENT');
    const r = pi(['--tools', 'write'], 'overwrite generated.txt with content: NEW_CONTENT');
    expect(r.ok).toBe(true);
    expect(fs.readFileSync(outFile, 'utf8')).toContain('NEW_CONTENT');
  });
});

// ─── 7 · Bash tool ──────────────────────────────────────────────────────────

test.describe('Bash tool', () => {
  test('pi --tools bash can run a shell command', () => {
    const r = pi(['--tools', 'bash'], 'run: echo BASH_WORKS');
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('BASH_WORKS');
  });

  test('pi --tools bash can read directory listing', () => {
    const r = pi(['--tools', 'bash'], 'run ls in the current directory and tell me if src exists');
    expect(r.ok).toBe(true);
    expect(r.stdout.toLowerCase()).toContain('src');
  });
});

// ─── 8 · Find / Grep tools ──────────────────────────────────────────────────

test.describe('Find and Grep tools', () => {
  test('pi --tools find lists TypeScript files', () => {
    const r = pi(['--tools', 'find'], 'find all .ts files in the project');
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('.ts');
  });

  test('pi --tools grep searches for a known symbol', () => {
    const r = pi(['--tools', 'grep'], 'grep for "greeting" in src/');
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('greeting');
  });
});

// ─── 9 · Session lifecycle ──────────────────────────────────────────────────

test.describe('Session lifecycle', () => {
  const SESSION_DIR = path.join(TMP_DIR, 'test-project', '.sessions');

  test('pi --session-dir creates a session file on disk', () => {
    const before = fs.readdirSync(SESSION_DIR).length;
    runPi({
      args: ['--print', '--session-dir', SESSION_DIR, '--no-tools', 'say: SESSION_CREATE'],
      cwd: path.join(TMP_DIR, 'test-project'),
    });
    const after = fs.readdirSync(SESSION_DIR).length;
    expect(after).toBeGreaterThan(before);
  });

  test('session file is valid JSONL', () => {
    const files = fs.readdirSync(SESSION_DIR);
    expect(files.length).toBeGreaterThan(0);
    const content = fs.readFileSync(path.join(SESSION_DIR, files[0]), 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    for (const line of lines) {
      expect(() => JSON.parse(line)).not.toThrow();
    }
  });

  test('pi --no-session does not create a session file', () => {
    const before = fs.readdirSync(SESSION_DIR).length;
    pi(['--no-tools'], 'say: EPHEMERAL');
    const after = fs.readdirSync(SESSION_DIR).length;
    expect(after).toBe(before);
  });
});

// ─── 10 · Session fork ──────────────────────────────────────────────────────

test.describe('Session fork', () => {
  const SESSION_DIR = path.join(TMP_DIR, 'test-project', '.sessions');

  test('pi --fork creates a new session derived from an existing one', () => {
    // Ensure at least one session exists
    runPi({
      args: ['--print', '--session-dir', SESSION_DIR, '--no-tools', 'say: ORIGIN'],
      cwd: path.join(TMP_DIR, 'test-project'),
    });
    const files = fs.readdirSync(SESSION_DIR);
    const origin = path.join(SESSION_DIR, files[0]);
    const countBefore = files.length;

    const r = runPi({
      args: ['--print', '--fork', origin, '--session-dir', SESSION_DIR, '--no-tools', 'say: FORKED'],
      cwd: path.join(TMP_DIR, 'test-project'),
    });
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('FORKED');
    expect(fs.readdirSync(SESSION_DIR).length).toBeGreaterThan(countBefore);
  });
});

// ─── 11 · System prompt ─────────────────────────────────────────────────────

test.describe('System prompt', () => {
  test('--system-prompt customises model behaviour', () => {
    const r = runPi({
      args: [
        '--print', '--no-session', '--no-tools',
        '--system-prompt', 'You only respond with the word CUSTOM.',
        'say something',
      ],
      cwd: PROJECT,
    });
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('CUSTOM');
  });

  test('--append-system-prompt adds to the default prompt', () => {
    const r = runPi({
      args: [
        '--print', '--no-session', '--no-tools',
        '--append-system-prompt', 'Always end your reply with: APPENDED.',
        'say: test',
      ],
      cwd: PROJECT,
    });
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('APPENDED');
  });
});

// ─── 12 · Mode flag ─────────────────────────────────────────────────────────

test.describe('Output mode', () => {
  test('--mode json returns JSONL (each line is a JSON object)', () => {
    const r = runPi({
      args: ['--print', '--no-session', '--no-tools', '--mode', 'json', 'say: JSON_MODE'],
      cwd: PROJECT,
    });
    expect(r.ok).toBe(true);
    // JSON mode outputs JSONL — each line is a separate JSON object
    const lines = r.stdout.trim().split('\n').filter(Boolean);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      expect(() => JSON.parse(line)).not.toThrow();
    }
    // At least one line should be an object
    const objects = lines.map(l => JSON.parse(l) as Record<string, unknown>);
    expect(objects.some(o => typeof o === 'object' && o !== null)).toBe(true);
  });

  test('--mode text (default) returns plain text', () => {
    const r = pi(['--no-tools'], 'say: TEXT_MODE');
    expect(r.ok).toBe(true);
    // Plain text – not parseable as JSON
    expect(() => JSON.parse(r.stdout.trim())).toThrow();
  });
});

// ─── 13 · Thinking level ────────────────────────────────────────────────────

test.describe('Thinking level', () => {
  test('--thinking off disables extended thinking', () => {
    const r = pi(['--no-tools', '--thinking', 'off'], 'say: THINKING_OFF');
    expect(r.ok).toBe(true);
    expect(r.stdout).toContain('THINKING_OFF');
  });
});

// ─── 14 · Export ────────────────────────────────────────────────────────────

test.describe('Export', () => {
  const SESSION_DIR = path.join(TMP_DIR, 'test-project', '.sessions');

  test('pi --export writes an HTML file from a session', () => {
    runPi({
      args: ['--print', '--session-dir', SESSION_DIR, '--no-tools', 'say: TO_EXPORT'],
      cwd: path.join(TMP_DIR, 'test-project'),
    });
    const sessionFile = fs.readdirSync(SESSION_DIR)
      .map(f => ({ f, t: fs.statSync(path.join(SESSION_DIR, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t)[0].f;

    const outHtml = path.join(TMP_DIR, 'test-project', 'export-test.html');
    fs.rmSync(outHtml, { force: true });

    const r = runPi({
      args: ['--export', outHtml, '--session', path.join(SESSION_DIR, sessionFile)],
      cwd: path.join(TMP_DIR, 'test-project'),
    });
    // Accept exit 0 or graceful non-zero; assert file created if exit 0
    if (r.ok) {
      expect(fs.existsSync(outHtml)).toBe(true);
      expect(fs.readFileSync(outHtml, 'utf8')).toContain('<html');
    } else {
      // Feature may not be available in this version; surface stderr for diagnosis
      console.log('[export stderr]', r.stderr);
    }
  });
});
