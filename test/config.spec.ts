import { describe, expect, it } from 'vitest'
import { Config, resolveConfig } from '../src/config.js'

describe('resolveConfig', () => {
  it('applies defaults for an empty config', () => {
    const resolved = resolveConfig({})
    expect(resolved.server).toMatchObject({
      enabled: true,
      host: '127.0.0.1',
      port: 8899,
      preset: 'standard',
      turnTimeoutMs: 300_000,
      sharedCwd: false,
      agentCard: { name: 'dsh-a2a' },
    })
    expect(resolved.agents).toEqual([])
  })

  it('defaults to per-session dirs and honours sharedCwd', () => {
    expect(resolveConfig({}).server.sharedCwd).toBe(false)
    expect(resolveConfig({ server: { sharedCwd: true } }).server.sharedCwd).toBe(true)
  })

  it('rejects out-of-range ports and non-positive timeouts', () => {
    expect(() => resolveConfig({ server: { port: 0 } })).toThrow(/server.port/)
    expect(() => resolveConfig({ server: { port: 70_000 } })).toThrow(/server.port/)
    expect(() => resolveConfig({ server: { turnTimeoutMs: 0 } })).toThrow(/turnTimeoutMs/)
  })

  it('rejects malformed registry entries', () => {
    expect(() => resolveConfig({ agents: [{ name: '  ', url: 'https://x' }] })).toThrow(/name/)
    expect(() => resolveConfig({ agents: [{ name: 'a', url: 'not-a-url' }] })).toThrow(/url/)
    expect(() => resolveConfig({ agents: [{ name: 'a', url: 'ftp://x' }] })).toThrow(/http/)
  })

  it('normalizes registry entries and keeps headers', () => {
    const resolved = resolveConfig({
      agents: [{ name: ' x ', url: 'https://x.example.com/', headers: { a: 'b' } }],
    })
    expect(resolved.agents).toEqual([
      { name: 'x', url: 'https://x.example.com/', headers: { a: 'b' }, description: '' },
    ])
  })

  it('exposes the cordis schema with defaults', () => {
    expect(Config).toBeDefined()
  })
})
