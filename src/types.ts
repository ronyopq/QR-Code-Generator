export type QRTypeId =
  | 'url' | 'text' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'wifi' | 'vcard'
  | 'location' | 'event' | 'social' | 'facebook' | 'instagram' | 'youtube'
  | 'telegram' | 'linkedin' | 'pdf' | 'app' | 'menu' | 'dynamic'

export type BodyStyle = 'square' | 'rounded' | 'dots' | 'classy' | 'extra-rounded' | 'classy-rounded'
export type EyeStyle = 'square' | 'dot' | 'extra-rounded'
export type ColorMode = 'single' | 'dual' | 'gradient' | 'multi' | 'radial'
export type BgMode = 'transparent' | 'solid' | 'gradient' | 'pattern'
export type ErrorLevel = 'L' | 'M' | 'Q' | 'H'
export type ExportFormat = 'png' | 'jpg' | 'svg' | 'webp' | 'pdf' | 'eps' | 'zip'

export interface QRConfig {
  type: QRTypeId
  fields: Record<string, string>
  name: string
  bodyStyle: BodyStyle
  eyeStyle: EyeStyle
  colorMode: ColorMode
  fgColor: string
  fgColor2: string
  gradientFrom: string
  gradientTo: string
  gradientMid: string
  bgMode: BgMode
  bgColor: string
  bgGradientFrom: string
  bgGradientTo: string
  logo: string | null
  logoSize: number // 0..0.5
  logoMargin: number
  logoBorder: boolean
  width: number
  height: number
  margin: number
  errorCorrection: ErrorLevel
  quality: 'hd' | '2k' | '4k' | 'print' | 'social'
}

export interface HistoryItem {
  id: string
  name: string
  config: QRConfig
  payload: string
  createdAt: number
  favorite: boolean
  scans: number
}

export interface FieldDef {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'datetime-local' | 'number'
  options?: string[]
  required?: boolean
  hint?: string
}

export interface QRTypeDef {
  id: QRTypeId
  label: string
  icon: string // lucide icon name key handled in UI
  desc: string
  fields: FieldDef[]
  sample: Record<string, string>
  category: 'General' | 'Contact' | 'Social' | 'Business' | 'Advanced'
}

/**
 * The very first code a visitor sees is deliberately plain: black modules on
 * white, square shape, safe error correction. Styling is opt-in — users start
 * simple, then apply a preset or customise only if they want to.
 */
export const defaultConfig = (): QRConfig => ({
  type: 'url',
  fields: { url: 'https://example.com' },
  name: 'My QR Code',
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
  bgGradientTo: '#eef2ff',
  logo: null,
  logoSize: 0.35,
  logoMargin: 6,
  logoBorder: false,
  width: 600,
  height: 600,
  margin: 96,
  errorCorrection: 'M',
  quality: 'hd',
})
