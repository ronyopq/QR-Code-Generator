import { describe, expect, it } from 'vitest'
import { configFromSearch } from './deepLink'
import { defaultConfig } from '../types'
import { QR_TYPES } from '../data/qrTypes'

describe('configFromSearch', () => {
  it('preselects the type a landing page handed over', () => {
    const cfg = configFromSearch('?type=wifi')
    expect(cfg.type).toBe('wifi')
    expect(cfg.fields.ssid).toBeTruthy()
    expect(cfg.width).toBe(defaultConfig().width)
  })

  it('falls back to the default config when there is no type', () => {
    expect(configFromSearch('')).toEqual(defaultConfig())
    expect(configFromSearch('?ref=guides')).toEqual(defaultConfig())
  })

  it('ignores unknown types instead of rendering an empty form', () => {
    expect(configFromSearch('?type=not-a-type')).toEqual(defaultConfig())
  })

  it('accepts every type the studio offers', () => {
    for (const t of QR_TYPES) {
      expect(configFromSearch(`?type=${t.id}`).type).toBe(t.id)
    }
  })
})
