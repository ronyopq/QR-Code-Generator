import { describe, expect, it } from 'vitest'
import { defaultConfig, type QRConfig } from '../types'
import { STYLE_PRESETS, activePresetId, presetMatches } from './stylePresets'

const apply = (id: string, patch: Partial<QRConfig> = {}): QRConfig => {
  const preset = STYLE_PRESETS.find((p) => p.id === id)!
  return { ...defaultConfig(), ...preset.style, ...patch }
}

describe('preset identity', () => {
  it('every preset recognises itself', () => {
    for (const preset of STYLE_PRESETS) {
      expect(activePresetId(apply(preset.id))).toBe(preset.id)
    }
  })

  it('ids are unique and the plain classic look is the reset target', () => {
    expect(new Set(STYLE_PRESETS.map((p) => p.id)).size).toBe(STYLE_PRESETS.length)
    expect(activePresetId(defaultConfig())).toBe('classic')
  })

  it('applying one preset never matches another', () => {
    for (const a of STYLE_PRESETS) {
      const ids = STYLE_PRESETS.filter((b) => presetMatches(b.style, apply(a.id))).map((b) => b.id)
      expect(ids).toEqual([a.id])
    }
  })
})

describe('what counts as a deviation', () => {
  it('a transparent preset ignores the hidden solid background colour', () => {
    expect(activePresetId(apply('ocean', { bgColor: '#ff00ff' }))).toBe('ocean')
    expect(activePresetId(apply('minimal', { bgColor: '#000000' }))).toBe('minimal')
  })

  it('a solid preset cares about its background colour', () => {
    expect(activePresetId(apply('midnight', { bgColor: '#123456' }))).toBeNull()
    expect(activePresetId(apply('gold', { bgColor: '#ffffff' }))).toBeNull()
  })

  it('gradient presets track their stops, not the unused flat colour', () => {
    expect(activePresetId(apply('gold', { fgColor: '#ff0000' }))).toBe('gold')
    expect(activePresetId(apply('gold', { gradientTo: '#000000' }))).toBeNull()
    expect(activePresetId(apply('ocean', { gradientFrom: '#111111' }))).toBeNull()
  })

  it('dual presets need both colours', () => {
    expect(activePresetId(apply('pastel', { fgColor2: '#000000' }))).toBeNull()
    expect(activePresetId(apply('neon', { fgColor: '#ffffff' }))).toBeNull()
  })

  it('shape and background mode changes drop the selection', () => {
    expect(activePresetId(apply('pastel', { bodyStyle: 'square' }))).toBeNull()
    expect(activePresetId(apply('pastel', { eyeStyle: 'square' }))).toBeNull()
    expect(activePresetId(apply('ocean', { bgMode: 'solid', bgColor: '#ffffff' }))).toBeNull()
  })

  it('layout tweaks keep the preset selected', () => {
    for (const patch of [{ margin: 32 }, { width: 1024, height: 1024 }, { logoSize: 0.2 }, { logoMargin: 2 }, { errorCorrection: 'H' as const }, { logo: 'data:image/png;base64,AA' }]) {
      expect(activePresetId(apply('soft', patch))).toBe('soft')
    }
  })

  it('reports "custom" when nothing matches', () => {
    expect(activePresetId(apply('classic', { bodyStyle: 'dots', eyeStyle: 'dot', fgColor: '#ff0000' }))).toBeNull()
  })
})
