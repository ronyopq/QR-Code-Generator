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
  /** two colours used by the little preview chip */
  preview: { from: string; to: string; bg: string; shape: 'square' | 'rounded' | 'dot' }
  recommended?: boolean
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
    preview: { from: '#000000', to: '#000000', bg: '#ffffff', shape: 'square' },
    style: classic,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Rounded dots, transparent background',
    preview: { from: '#111418', to: '#111418', bg: '#f3f3ef', shape: 'rounded' },
    style: { ...classic, bodyStyle: 'rounded', eyeStyle: 'extra-rounded', bgMode: 'transparent' },
  },
  {
    id: 'soft',
    name: 'Soft',
    desc: 'Gentle extra-rounded modules',
    preview: { from: '#3f4754', to: '#3f4754', bg: '#f6f6f3', shape: 'dot' },
    style: { ...classic, bodyStyle: 'extra-rounded', eyeStyle: 'dot', fgColor: '#3f4754', bgMode: 'transparent' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    desc: 'Cool blue gradient',
    preview: { from: '#0ea5e9', to: '#2563eb', bg: '#eff6ff', shape: 'rounded' },
    style: {
      ...classic, colorMode: 'gradient', bodyStyle: 'rounded', eyeStyle: 'extra-rounded',
      gradientFrom: '#0ea5e9', gradientTo: '#2563eb', fgColor: '#0ea5e9', fgColor2: '#2563eb', bgMode: 'transparent',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    desc: 'Warm orange to pink',
    preview: { from: '#f97316', to: '#db2777', bg: '#fff7ed', shape: 'dot' },
    style: {
      ...classic, colorMode: 'gradient', bodyStyle: 'dots', eyeStyle: 'dot',
      gradientFrom: '#f97316', gradientTo: '#db2777', fgColor: '#ea580c', fgColor2: '#db2777', bgMode: 'transparent',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    desc: 'Deep green gradient',
    preview: { from: '#059669', to: '#0f766e', bg: '#ecfdf5', shape: 'rounded' },
    style: {
      ...classic, colorMode: 'gradient', bodyStyle: 'rounded', eyeStyle: 'extra-rounded',
      gradientFrom: '#059669', gradientTo: '#0f766e', fgColor: '#059669', fgColor2: '#0f766e', bgMode: 'transparent',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    desc: 'White modules on black',
    preview: { from: '#ffffff', to: '#ffffff', bg: '#0b0d11', shape: 'square' },
    style: { ...classic, fgColor: '#ffffff', bgMode: 'solid', bgColor: '#0b0d11' },
  },
  {
    id: 'gold',
    name: 'Gold',
    desc: 'Luxury amber, cream background',
    preview: { from: '#b45309', to: '#f59e0b', bg: '#fffbeb', shape: 'rounded' },
    style: {
      ...classic, colorMode: 'gradient', bodyStyle: 'classy', eyeStyle: 'extra-rounded',
      gradientFrom: '#b45309', gradientTo: '#f59e0b', fgColor: '#92400e', fgColor2: '#b45309', bgMode: 'solid', bgColor: '#fffbeb',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    desc: 'Cyan on deep navy',
    preview: { from: '#22d3ee', to: '#a3e635', bg: '#08131a', shape: 'dot' },
    style: {
      ...classic, colorMode: 'dual', bodyStyle: 'classy-rounded', eyeStyle: 'dot',
      fgColor: '#22d3ee', fgColor2: '#a3e635', bgMode: 'solid', bgColor: '#08131a',
    },
  },
  {
    id: 'pastel',
    name: 'Pastel',
    desc: 'Two-tone indigo & pink',
    preview: { from: '#6366f1', to: '#ec4899', bg: '#f5f3ff', shape: 'dot' },
    style: {
      ...classic, colorMode: 'dual', bodyStyle: 'dots', eyeStyle: 'dot',
      fgColor: '#6366f1', fgColor2: '#ec4899', bgMode: 'solid', bgColor: '#f5f3ff',
    },
  },
]

export const CLASSIC_PRESET = STYLE_PRESETS[0]

/** Which preset (if any) matches the current config. */
export function activePresetId(config: QRConfig): string | null {
  const match = STYLE_PRESETS.find((p) => {
    const s = p.style
    return (
      s.bodyStyle === config.bodyStyle &&
      s.eyeStyle === config.eyeStyle &&
      s.colorMode === config.colorMode &&
      s.bgMode === config.bgMode &&
      s.bgColor.toLowerCase() === config.bgColor.toLowerCase() &&
      s.fgColor.toLowerCase() === config.fgColor.toLowerCase() &&
      s.gradientFrom.toLowerCase() === config.gradientFrom.toLowerCase() &&
      s.gradientTo.toLowerCase() === config.gradientTo.toLowerCase()
    )
  })
  return match?.id ?? null
}
