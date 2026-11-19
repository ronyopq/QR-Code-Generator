/**
 * Landing pages link into the studio with `?type=wifi` so the visitor does not
 * have to hunt for the format they just read about. Pure function, safe on the
 * server and easy to test.
 */
import { QR_TYPES } from '../data/qrTypes'
import { defaultConfig, type QRConfig } from '../types'

export function configFromSearch(search: string): QRConfig {
  const base = defaultConfig()
  const id = new URLSearchParams(search).get('type')
  if (!id) return base

  const def = QR_TYPES.find((t) => t.id === id)
  if (!def) return base

  return { ...base, type: def.id, name: def.label, fields: { ...def.sample } }
}

/** Convenience wrapper used by the app on first render. */
export function configFromLocation(): QRConfig {
  if (typeof window === 'undefined') return defaultConfig()
  return configFromSearch(window.location.search)
}
