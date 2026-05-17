import { spawnSync, SpawnSyncOptions } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface PiRunOptions {
  args: string[];
  cwd: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
}

export interface PiRunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  ok: boolean;
  spawnError?: Error;
}

let _piExecutable: string | undefined;

/** Resolves the absolute path to the `pi` executable (lazy-initialised on first call). */
export function piExecutable(): string {
  if (_piExecutable === undefined) {
    const fromPath = spawnSync('which', ['pi'], { encoding: 'utf8' }).stdout.trim();
    if (!fromPath) throw new Error('pi CLI not found in PATH');
    _piExecutable = fromPath;
  }
  return _piExecutable;
}

/** Runs `pi [args]` synchronously inside `cwd`. */
export function runPi(options: PiRunOptions): PiRunResult {
  const { args, cwd, env, timeoutMs = 60_000 } = options;
  const spawnOptions: SpawnSyncOptions = {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...process.env, ...env },
  };
  const result = spawnSync(piExecutable(), args, spawnOptions);
  return {
    stdout: (result.stdout as string) ?? '',
    stderr: (result.stderr as string) ?? '',
    exitCode: result.status,
    ok: result.status === 0 && !result.error,
    spawnError: result.error,
  };
}

/** Creates the tmp/test-project fixture tree and returns its absolute path. */
export function createTestProject(baseDir: string): string {
  const projectDir = path.join(baseDir, 'test-project');
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
  fs.rmSync(path.join(projectDir, '.sessions'), { recursive: true, force: true });
  fs.mkdirSync(path.join(projectDir, '.sessions'), { recursive: true });

  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify({ name: 'pi-test-project', version: '1.0.0', private: true }, null, 2),
  );

  fs.writeFileSync(
    path.join(projectDir, 'README.md'),
    '# pi Test Project\nA minimal fixture used by piui integration tests.\n',
  );

  fs.writeFileSync(
    path.join(projectDir, 'src', 'index.ts'),
    '// Entry point\nexport const greeting = (name: string): string => `Hello, ${name}!`;\n',
  );

  fs.writeFileSync(
    path.join(projectDir, 'src', 'utils.ts'),
    '// Utility helpers\nexport const add = (a: number, b: number): number => a + b;\n',
  );

  return projectDir;
}

/** Deletes a directory tree (best-effort, ignores errors). */
export function rmrf(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}
