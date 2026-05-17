import { describe, it, expect } from 'vitest';
import { classifyEntry, parseGitPorcelain } from '../src/lib/gitClassifier';

describe('classifyEntry', () => {
  it('classifies build-artifact files under out/', () => {
    const result = classifyEntry({ xy: '??', path: 'out/main/index.cjs' });
    expect(result.classification).toBe('build-artifact');
    expect(result.suggestIgnore).toBe(true);
    expect(result.suggestedPattern).toBe('out/');
    expect(result.status).toBe('untracked');
  });

  it('classifies test-report files under playwright-report/', () => {
    const result = classifyEntry({ xy: 'M ', path: 'playwright-report/index.html' });
    expect(result.classification).toBe('test-report');
    expect(result.suggestIgnore).toBe(true);
    expect(result.suggestedPattern).toBe('playwright-report/');
    expect(result.status).toBe('modified');
  });

  it('classifies source files under src/ without suggesting ignore', () => {
    const result = classifyEntry({ xy: 'M ', path: 'src/screens/Settings.tsx' });
    expect(result.classification).toBe('source');
    expect(result.suggestIgnore).toBe(false);
  });

  it('classifies config files without suggesting ignore', () => {
    const result = classifyEntry({ xy: 'M ', path: 'package.json' });
    expect(result.classification).toBe('config');
    expect(result.suggestIgnore).toBe(false);
  });

  it('classifies unknown files without suggesting ignore', () => {
    const result = classifyEntry({ xy: 'M ', path: 'somerandombinary.bin' });
    expect(result.classification).toBe('unknown');
    expect(result.suggestIgnore).toBe(false);
    expect(result.suggestedPattern).toBe('somerandombinary.bin');
  });

  it('classifies dist/ as build-artifact', () => {
    const result = classifyEntry({ xy: '??', path: 'dist/assets/index.js' });
    expect(result.classification).toBe('build-artifact');
    expect(result.suggestIgnore).toBe(true);
    expect(result.suggestedPattern).toBe('dist/');
  });

  it('classifies test-results/ as test-report', () => {
    const result = classifyEntry({ xy: '??', path: 'test-results/trace.zip' });
    expect(result.classification).toBe('test-report');
    expect(result.suggestIgnore).toBe(true);
  });

  it('parses renamed status code correctly', () => {
    const result = classifyEntry({ xy: 'R ', path: 'src/old.ts' });
    expect(result.status).toBe('renamed');
  });

  it('parses added status code correctly', () => {
    const result = classifyEntry({ xy: 'A ', path: 'src/new.ts' });
    expect(result.status).toBe('added');
  });

  it('parses deleted status code correctly', () => {
    const result = classifyEntry({ xy: 'D ', path: 'src/gone.ts' });
    expect(result.status).toBe('deleted');
  });
});

describe('parseGitPorcelain', () => {
  it('returns empty array for empty input', () => {
    const result = parseGitPorcelain('');
    expect(result).toHaveLength(0);
  });

  it('strips surrounding quotes from paths with special characters', () => {
    const result = parseGitPorcelain('?? "out/renderer/my file.js"');
    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe('out/renderer/my file.js');
    expect(result[0]?.xy).toBe('??');
  });

  it('handles rename arrow format and returns the destination path', () => {
    const result = parseGitPorcelain('R  old-path -> new-path');
    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe('new-path');
    expect(result[0]?.xy).toBe('R ');
  });

  it('filters out short lines with fewer than 3 characters', () => {
    const result = parseGitPorcelain('\n\n??\n\nM \n');
    expect(result).toHaveLength(0);
  });

  it('parses multiple lines correctly', () => {
    const output = [
      '?? out/main/index.cjs',
      'M  src/screens/Settings.tsx',
      ' D electron/old.ts',
    ].join('\n');
    const result = parseGitPorcelain(output);
    expect(result).toHaveLength(3);
    expect(result[0]?.path).toBe('out/main/index.cjs');
    expect(result[1]?.path).toBe('src/screens/Settings.tsx');
    expect(result[2]?.path).toBe('electron/old.ts');
  });

  it('handles CRLF line endings', () => {
    const result = parseGitPorcelain('?? out/main/index.cjs\r\nM  src/foo.ts');
    expect(result).toHaveLength(2);
  });
});
