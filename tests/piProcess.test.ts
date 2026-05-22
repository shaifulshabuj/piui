import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { isExecutable, discoverNvmBins, findViaNvmShell } from '../electron/piProcess'

// ---------------------------------------------------------------------------
// Temporary directory utilities
// ---------------------------------------------------------------------------

let tmpDir: string

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'piprocess-test-'))
})

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function makeFakeNvmDir(baseDir: string, versions: string[]): string {
  const nvmDir = path.join(baseDir, 'nvm')
  for (const ver of versions) {
    const binDir = path.join(nvmDir, 'versions', 'node', ver, 'bin')
    fs.mkdirSync(binDir, { recursive: true })
  }
  return nvmDir
}

function makeFakeExecutable(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, '#!/bin/sh\necho pi\n')
  fs.chmodSync(filePath, 0o755)
}

// ---------------------------------------------------------------------------
// isExecutable
// ---------------------------------------------------------------------------

describe('isExecutable', () => {
  it('returns true for an existing executable file', () => {
    const p = path.join(tmpDir, 'exec-test', 'mybin')
    makeFakeExecutable(p)
    expect(isExecutable(p)).toBe(true)
  })

  it('returns false for a non-existent path', () => {
    expect(isExecutable(path.join(tmpDir, 'does-not-exist'))).toBe(false)
  })

  it('returns false for a non-executable file', () => {
    const p = path.join(tmpDir, 'non-exec-test', 'plain.txt')
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, 'hello')
    fs.chmodSync(p, 0o644)
    expect(isExecutable(p)).toBe(false)
  })

  it('returns false for a broken symlink', () => {
    const target = path.join(tmpDir, 'broken-link-target')
    const link = path.join(tmpDir, 'broken-link')
    // Create and then remove target so symlink is broken
    fs.writeFileSync(target, '')
    fs.symlinkSync(target, link)
    fs.unlinkSync(target)
    expect(isExecutable(link)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// discoverNvmBins
// ---------------------------------------------------------------------------

describe('discoverNvmBins', () => {
  it('returns candidate paths for all node versions in nvm dir', () => {
    const nvmDir = makeFakeNvmDir(path.join(tmpDir, 'nvm-discover-a'), [
      'v18.20.0',
      'v20.11.0',
    ])
    const results = discoverNvmBins(nvmDir)
    expect(results).toHaveLength(2)
    expect(results.some((p) => p.endsWith('v18.20.0/bin/pi'))).toBe(true)
    expect(results.some((p) => p.endsWith('v20.11.0/bin/pi'))).toBe(true)
  })

  it('returns [] when versions/node directory does not exist', () => {
    const nvmDir = path.join(tmpDir, 'nvm-absent')
    expect(discoverNvmBins(nvmDir)).toEqual([])
  })

  it('does not throw when nvmDir itself does not exist', () => {
    expect(() => discoverNvmBins('/tmp/__nonexistent_nvm_dir__')).not.toThrow()
  })

  it('returns [] (not throws) for completely absent nvm', () => {
    const result = discoverNvmBins(path.join(tmpDir, 'totally-absent'))
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(0)
  })

  it('returns paths including only the pi binary name', () => {
    const nvmDir = makeFakeNvmDir(path.join(tmpDir, 'nvm-discover-b'), ['v20.0.0'])
    const results = discoverNvmBins(nvmDir)
    expect(results[0]).toMatch(/bin\/pi$/)
  })
})

// ---------------------------------------------------------------------------
// discoverNvmBins integration: finds executable pi
// ---------------------------------------------------------------------------

describe('discoverNvmBins + isExecutable integration', () => {
  it('finds executable pi under a single nvm version', () => {
    const nvmDir = makeFakeNvmDir(path.join(tmpDir, 'nvm-exec-single'), ['v20.11.0'])
    const piPath = path.join(nvmDir, 'versions', 'node', 'v20.11.0', 'bin', 'pi')
    makeFakeExecutable(piPath)

    const found = discoverNvmBins(nvmDir).find((p) => isExecutable(p))
    expect(found).toBe(piPath)
  })

  it('finds pi in v20 when only v20 has pi (v18 absent)', () => {
    const nvmDir = makeFakeNvmDir(path.join(tmpDir, 'nvm-exec-multi'), [
      'v18.20.0',
      'v20.11.0',
    ])
    const piPath = path.join(nvmDir, 'versions', 'node', 'v20.11.0', 'bin', 'pi')
    makeFakeExecutable(piPath)

    const found = discoverNvmBins(nvmDir).find((p) => isExecutable(p))
    expect(found).toBe(piPath)
  })

  it('skips broken symlink and finds nothing when only a broken symlink exists', () => {
    const nvmDir = makeFakeNvmDir(path.join(tmpDir, 'nvm-broken-link'), ['v20.0.0'])
    const piPath = path.join(nvmDir, 'versions', 'node', 'v20.0.0', 'bin', 'pi')
    const target = path.join(tmpDir, 'pi-binary-gone')
    fs.writeFileSync(target, '')
    fs.symlinkSync(target, piPath)
    fs.unlinkSync(target)

    const found = discoverNvmBins(nvmDir).find((p) => isExecutable(p))
    expect(found).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// findViaNvmShell
// ---------------------------------------------------------------------------

describe('findViaNvmShell', () => {
  it('returns null when nvm.sh does not exist (no throw)', () => {
    const fakeNvmDir = path.join(tmpDir, 'fake-nvm-no-sh')
    fs.mkdirSync(fakeNvmDir, { recursive: true })
    const result = findViaNvmShell(os.homedir(), fakeNvmDir)
    expect(result).toBeNull()
  })

  it('returns null when nvm dir is completely absent (no throw)', () => {
    const result = findViaNvmShell(os.homedir(), '/tmp/__nonexistent_nvmdir__')
    expect(result).toBeNull()
  })

  it('returns null when nvmDir path contains a single quote (injection guard)', () => {
    const maliciousDir = path.join(tmpDir, "nvm'injected")
    const result = findViaNvmShell(os.homedir(), maliciousDir)
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// findPiBinary integration via module import
// ---------------------------------------------------------------------------

describe('findPiBinary (via PiProcessManager.start)', () => {
  it('returns null without throwing when no pi binary exists anywhere', async () => {
    const { PiProcessManager } = await import('../electron/piProcess')
    const mgr = new PiProcessManager()
    await mgr.start()
    if (!mgr.isAvailable()) {
      expect(mgr.getBinaryPath()).toBeNull()
    }
    expect(typeof mgr.isAvailable()).toBe('boolean')
  })
})
