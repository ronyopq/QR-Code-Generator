import type { QRConfig } from '../types'

export type PresetStyle = Pick<
  QRConfig,
  | 'bodyStyle' | 'eyeStyle' | 'colorMode' | 'fgColor' | 'fgColor2'
  | 'gradientFrom' | 'gradientTo' | 'gradientMid'
  | 'bgMode' | 'bgColor' | 'bgGradientFrom' | 'bgGradientTo'
>

export interface StylePreset {
  id: string
  name: string
  desc: string
  recommended?: boolean
  /** Exactly the fields the preset writes — the chip renders from these, so
   *  what you see on the card is what the QR renderer produces. */
  style: PresetStyle
}

const classic: PresetStyle = {
  bodyStyle: 'square',
  eyeStyle: 'square',
  colorMode: 'single',
  fgColor: '#000000',
  fgColor2: '#000000',
  gradientFrom: '#000000',
  gradientTo: '#111827',
  gradientMid: '#374151',
  bgMode: 'solid',
  bgColor: '#ffffff',
  bgGradientFrom: '#ffffff',
  bgGradientTo: '#f3f4f6',
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Black on white — the most scannable',
    recommended: true,
    style: classic,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Rounded dots, transparent background',
    style: { ...classic, bodyStyle: 'rounded', eyeStyle: 'extra-rounded', bgMode: 'transparent' },
  },
  {
    id: 'soft',
    name: 'Soft',
    desc: 'Gentle extra-rounded modules',
    style: { ...classic, bodyStyle: 'extra-rounded', eyeStyle: 'dot', fgColor: '#3f4754', bgMode: 'transparent' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    desc: 'Cool blue gradient',
    style: {
      ...classic, colorMode: 'gradient', bodyStyle: 'rounded', eyeStyle: 'extra-rounded',
      gradientFrom: '#0ea5e9', gradientTo: '#2563eb', fgColor: '#0ea5e9', fgColor2: '#2563eb', bgMode: 'transparent',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    desc: 'Warm orange to pink',
    style: {
      ...classic, colorMode: 'gradient', bodyStyle: 'dots', eyeStyle: 'dot',
      gradientFrom: '#f97316', gradientTo: '#db2777', fgColor: '#ea580c', fgColor2: '#db2777', bgMode: 'transparent',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    desc: 'Deep green gradient',
    style: {
      ...classic, colorMode: 'gradient', bodyStyle: 'rounded', eyeStyle: 'extra-rounded',
      gradientFrom: '#059669', gradientTo: '#0f766e', fgColor: '#059669', fgColor2: '#0f766e', bgMode: 'transparent',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    desc: 'White modules on black',
    style: { ...classic, fgColor: '#ffffff', bgMode: 'solid', bgColor: '#0b0d11' },
  },
  {
    id: 'gold',
    name: 'Gold',
    desc: 'Luxury amber, cream background',
    style: {
      ...classic, colorMode: 'gradient', bodyStyle: 'classy', eyeStyle: 'extra-rounded',
      gradientFrom: '#b45309', gradientTo: '#f59e0b', fgColor: '#92400e', fgColor2: '#b45309',
      bgMode: 'solid', bgColor: '#fffbeb',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    desc: 'Cyan on deep navy',
    style: {
      ...classic, colorMode: 'dual', bodyStyle: 'classy-rounded', eyeStyle: 'dot',
      fgColor: '#22d3ee', fgColor2: '#a3e635', bgMode: 'solid', bgColor: '#08131a',
    },
  },
  {
    id: 'pastel',
    name: 'Pastel',
    desc: 'Two-tone indigo & pink',
    style: {
      ...classic, colorMode: 'dual', bodyStyle: 'dots', eyeStyle: 'dot',
      fgColor: '#6366f1', fgColor2: '#ec4899', bgMode: 'solid', bgColor: '#f5f3ff',
    },
  },
]

export const CLASSIC_PRESET = STYLE_PRESETS[0]

const same = (a?: string, b?: string) => (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase()

/**
 * True when the config still carries a preset's look.
 *
 * Only the fields the preset actually writes are compared, and the colour fields
 * that matter depend on the preset's own colour mode — a transparent preset must
 * not be rejected because the (hidden) solid background colour drifted, and a
 * dual-colour preset must not match a config whose second colour was changed.
 */
export function presetMatches(style: PresetStyle, config: QRConfig): boolean {
  if (style.bodyStyle !== config.bodyStyle) return false
  if (style.eyeStyle !== config.eyeStyle) return false
  if (style.colorMode !== config.colorMode) return false
  if (style.bgMode !== config.bgMode) return false

  switch (style.colorMode) {
    case 'single':
      if (!same(style.fgColor, config.fgColor)) return false
      break
    case 'dual':
      if (!same(style.fgColor, config.fgColor) || !same(style.fgColor2, config.fgColor2)) return false
      break
    case 'gradient':
      if (!same(style.gradientFrom, config.gradientFrom) || !same(style.gradientTo, config.gradientTo)) return false
      break
    case 'multi':
      if (!same(style.gradientFrom, config.gradientFrom) || !same(style.gradientTo, config.gradientTo)) return false
      if (!same(style.gradientMid, config.gradientMid)) return false
      break
    case 'radial':
      if (!same(style.gradientFrom, config.gradientFrom) || !same(style.gradientTo, config.gradientTo)) return false
      break
  }

  if (style.bgMode === 'solid' && !same(style.bgColor, config.bgColor)) return false
  if (style.bgMode === 'gradient') {
    if (!same(style.bgGradientFrom, config.bgGradientFrom)) return false
    if (!same(style.bgGradientTo, config.bgGradientTo)) return false
  }
  return true
}

/** Which preset (if any) matches the current config. */
export function activePresetId(config: QRConfig): string | null {
  return STYLE_PRESETS.find((p) => presetMatches(p.style, config))?.id ?? null
}
