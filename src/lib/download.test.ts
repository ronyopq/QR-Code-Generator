import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultConfig } from '../types'

const run = vi.fn(async () => {})
vi.mock('./exporter', () => ({ downloadQR: (...args: unknown[]) => run(...(args as [])) }))

const { downloadQR } = await import('./download')

describe('lazy download gateway', () => {
  beforeEach(() => run.mockClear())

  it('forwards the config, payload and format to the export stack', async () => {
    const cfg = defaultConfig()
    await downloadQR(cfg, 'https://example.com', 'png')
    expect(run).toHaveBeenCalledWith(cfg, 'https://example.com', 'png')
  })

  it('still resolves when the exporter finishes asynchronously', async () => {
    run.mockImplementationOnce(async () => { await new Promise((r) => setTimeout(r, 20)) })
    await expect(downloadQR(defaultConfig(), 'x', 'zip')).resolves.toBeUndefined()
  })
})
