import { colord, type Colord } from 'colord'

export interface LogoPalette {
  primary: string
  secondary: string
  isDark: boolean
}

/**
 * Extracts a two-colour brand palette from an uploaded logo (colord + canvas).
 * Skips transparent, near-white and near-black pixels so grey backgrounds or
 * white knockouts don't dominate the result.
 */
export async function paletteFromLogo(dataUrl: string): Promise<LogoPalette> {
  const img = await loadImage(dataUrl)
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas is not available in this browser.')

  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  const buckets = new Map<string, { count: number; c: Colord }>()
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 190) continue
    const c = colord({ r: data[i], g: data[i + 1], b: data[i + 2] })
    const hsl = c.toHsl()
    if (hsl.l > 0.94 || hsl.l < 0.06) continue // skip white / black knockouts
    if (hsl.s < 0.08) continue // ignore greys
    const key = `${Math.round(data[i] / 24)}-${Math.round(data[i + 1] / 24)}-${Math.round(data[i + 2] / 24)}`
    const entry = buckets.get(key)
    if (entry) entry.count += 1
    else buckets.set(key, { count: 1, c })
  }

  const ranked = [...buckets.values()].sort((a, b) => b.count - a.count)
  const primary = ranked[0]?.c ?? colord('#0d1014')

  // second colour: the most distant of the top candidates, else a tonal partner
  let secondary = primary.darken(0.16)
  let best = 0
  for (const candidate of ranked.slice(1, 12)) {
    const distance = colord(primary).toRgb()
    const other = candidate.c.toRgb()
    const d = Math.abs(distance.r - other.r) + Math.abs(distance.g - other.g) + Math.abs(distance.b - other.b)
    if (d > best) { best = d; secondary = candidate.c }
  }
  if (best < 60) secondary = primary.lighten(0.18)

  return {
    primary: primary.toHex(),
    secondary: secondary.toHex(),
    isDark: primary.isDark(),
  }
}

/** Sensible foreground (code dots) colour for a background. */
export function readableOn(hex: string): string {
  const c = colord(hex)
  return c.isDark() ? '#ffffff' : '#0d1014'
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read that image — try a PNG or SVG.'))
    img.src = src
  })
}
