import type { QRConfig } from '../types'

/** Byte-mode data capacity of a QR version, per error-correction level. */
const BYTES: Record<QRConfig['errorCorrection'], number[]> = {
  L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858,
    929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953],
  M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666,
    711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331],
  Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482,
    509, 565, 611, 661, 715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663],
  H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382,
    403, 439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273],
}

export interface ScanIssue {
  id: 'contrast' | 'quiet' | 'module-size' | 'logo' | 'inverted' | 'density'
  /** disambiguates the two logo checks and the two contrast severities in the dictionary */
  code: string
  level: 'error' | 'warn'
  /** English fallback; the UI renders issue.<code>.title / .detail from the dictionary */
  title: string
  detail: string
  /** values interpolated into the translated strings */
  params: Record<string, string | number>
  /** one-tap repair; a patch is applied to the config, a bare suggestion is handled by the panel */
  fix?: { key: string; label: string; params?: Record<string, string | number>; patch?: Partial<QRConfig>; suggestMm?: number }
}

export interface ScanReport {
  level: 'pass' | 'warn' | 'fail'
  contrast: number
  fg: string
  bg: string
  version: number
  modules: number
  modulePx: number
  moduleMm: number
  quietModules: number
  minSizeMm: number
  inverted: boolean
  issues: ScanIssue[]
}

const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)))

/** #rgb / #rrggbb → [r,g,b]; anything unparseable falls back to black. */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = (hex || '').trim().replace('#', '')
  if (clean.length === 3) {
    const [r, g, b] = clean.split('').map((c) => parseInt(c + c, 16))
    return [clampByte(r), clampByte(g), clampByte(b)]
  }
  if (clean.length >= 6) {
    const n = parseInt(clean.slice(0, 6), 16)
    if (!Number.isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  return [0, 0, 0]
}

export const toHex = (rgb: [number, number, number]) =>
  '#' + rgb.map((c) => clampByte(c).toString(16).padStart(2, '0')).join('')

/** Average of several colours — what a gradient looks like from three metres away. */
export function averageColour(colours: string[]): string {
  const list = colours.filter(Boolean)
  if (!list.length) return '#000000'
  if (list.length === 1) return list[0]
  const sum = list.map(hexToRgb).reduce<[number, number, number]>((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0])
  return toHex([sum[0] / list.length, sum[1] / list.length, sum[2] / list.length])
}

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio, 1…21. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
}

/** The colour the modules are actually painted with. */
export function effectiveForeground(cfg: QRConfig): string {
  switch (cfg.colorMode) {
    case 'gradient':
      return averageColour([cfg.gradientFrom, cfg.gradientTo])
    case 'multi':
      return averageColour([cfg.gradientFrom, cfg.gradientMid, cfg.gradientTo])
    case 'radial':
      return averageColour([cfg.gradientFrom, cfg.gradientTo])
    default:
      return cfg.fgColor
  }
}

/** Transparent backgrounds are scanned against whatever they are printed on — assume white. */
export function effectiveBackground(cfg: QRConfig): string {
  if (cfg.bgMode === 'transparent') return '#ffffff'
  if (cfg.bgMode === 'gradient') return averageColour([cfg.bgGradientFrom, cfg.bgGradientTo])
  return cfg.bgColor
}

export function byteLength(payload: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(payload).length
  return unescape(encodeURIComponent(payload)).length
}

/** Smallest QR version (1–40) that fits the payload at this error-correction level. */
export function versionFor(payload: string, ec: QRConfig['errorCorrection']): number {
  const bytes = byteLength(payload)
  const table = BYTES[ec]
  const idx = table.findIndex((cap) => cap >= bytes)
  return idx === -1 ? 40 : idx + 1
}

export const modulesFor = (version: number) => 17 + version * 4

const MIN_QUIET_MODULES = 2
/** The standard asks for 4 modules; 2 is the hard floor most scanners tolerate. */
const STANDARD_QUIET_MODULES = 4
const MIN_MODULE_MM = 0.4

/**
 * Everything that decides whether a printed QR code will actually scan.
 * Pure function: same config in, same report out — which is what the tests pin.
 */
export function analyseScan(cfg: QRConfig, payload: string, physicalMm = 40): ScanReport {
  const fg = effectiveForeground(cfg)
  const bg = effectiveBackground(cfg)
  const contrast = contrastRatio(fg, bg)
  // light modules on a dark background — the case older scanners struggle with
  const inverted = luminance(fg) > luminance(bg)

  const version = versionFor(payload || 'x', cfg.errorCorrection)
  const modules = modulesFor(version)
  const sizeMm = Math.max(10, Math.min(1000, physicalMm))
  const innerPx = Math.max(1, cfg.width - cfg.margin * 2)
  const modulePx = Math.round((innerPx / modules) * 100) / 100
  const moduleMm = Math.round((sizeMm / modules) * 100) / 100
  // measured against the real module size, i.e. what a scanner sees
  const quietModules = Math.round((cfg.margin / modulePx) * 10) / 10
  const minSizeMm = Math.ceil(modules * MIN_MODULE_MM)

  const issues: ScanIssue[] = []

  if (contrast < 3) {
    issues.push({
      id: 'contrast', code: 'contrast.error', level: 'error',
      title: 'Almost no contrast',
      detail: `Modules and background differ by only ${contrast}:1. Cameras need at least 3:1, ideally 7:1.`,
      params: { ratio: contrast },
      fix: cfg.bgMode === 'transparent'
        ? { key: 'fix.whiteBackground', label: 'Use a white background', patch: { bgMode: 'solid', bgColor: '#ffffff' } }
        : { key: 'fix.resetBlack', label: 'Reset to black on white', patch: { colorMode: 'single', fgColor: '#000000', bgColor: '#ffffff', bgMode: 'solid' } },
    })
  } else if (contrast < 4.5) {
    issues.push({
      id: 'contrast', code: 'contrast.warn', level: 'warn',
      title: 'Low contrast',
      detail: `${contrast}:1 — above the floor but dim. Darker modules or a lighter background scan faster.`,
      params: { ratio: contrast },
      fix: { key: 'fix.darken', label: 'Darken the modules', patch: { colorMode: 'single', fgColor: '#111418' } },
    })
  }

  if (quietModules < MIN_QUIET_MODULES) {
    issues.push({
      id: 'quiet', code: 'quiet', level: 'warn',
      title: 'Quiet zone too small',
      detail: `Margin is ${quietModules} modules. The spec asks for ${STANDARD_QUIET_MODULES} so scanners can find the code; leave white space around it when you print.`,
      params: { modules: quietModules },
      fix: {
        key: 'fix.margin',
        label: `Set margin to ${Math.ceil((STANDARD_QUIET_MODULES * cfg.width) / modules)}px`,
        params: { px: Math.ceil((STANDARD_QUIET_MODULES * cfg.width) / modules) },
        patch: { margin: Math.ceil((STANDARD_QUIET_MODULES * cfg.width) / modules) },
      },
    })
  }

  if (moduleMm < 0.3) {
    issues.push({
      id: 'module-size', code: 'module-size.error', level: 'error',
      title: 'Modules too small to print',
      detail: `At ${sizeMm} mm each module is ${moduleMm} mm. Print at least ${minSizeMm} mm wide, or shorten the content.`,
      params: { mm: sizeMm, moduleMm, min: minSizeMm },
      fix: { key: 'fix.suggestSize', label: `Suggest ${minSizeMm} mm`, params: { mm: minSizeMm }, suggestMm: minSizeMm },
    })
  } else if (moduleMm < MIN_MODULE_MM) {
    issues.push({
      id: 'module-size', code: 'module-size.warn', level: 'warn',
      title: 'Small modules',
      detail: `Each module is ${moduleMm} mm at ${sizeMm} mm. Below ${MIN_MODULE_MM} mm home printers blur the edges.`,
      params: { mm: sizeMm, moduleMm },
    })
  }

  if (cfg.logo && cfg.errorCorrection !== 'H' && cfg.logoSize > 0.2) {
    issues.push({
      id: 'logo', code: 'logo.ec', level: 'warn',
      title: 'Logo vs. error correction',
      detail: `A ${Math.round(cfg.logoSize * 100)}% logo covers part of the code; error correction is ${cfg.errorCorrection}. Use H for 30% recovery.`,
      params: { size: Math.round(cfg.logoSize * 100), ec: cfg.errorCorrection },
      fix: { key: 'fix.useH', label: 'Use error correction H', patch: { errorCorrection: 'H' } },
    })
  }
  if (cfg.logo && cfg.logoSize > 0.35) {
    issues.push({
      id: 'logo', code: 'logo.size', level: 'warn',
      title: 'Logo is very large',
      detail: `A logo covering ${Math.round(cfg.logoSize * 100)}% of the code risks unreadable modules even at H.`,
      params: { size: Math.round(cfg.logoSize * 100) },
      fix: { key: 'fix.shrinkLogo', label: 'Shrink logo to 30%', patch: { logoSize: 0.3 } },
    })
  }

  if (inverted && contrast >= 3) {
    issues.push({
      id: 'inverted', code: 'inverted', level: 'warn',
      title: 'Light modules on a dark background',
      detail: 'Many older scanners only read dark-on-light. Works on modern phones — test before printing.',
      params: {},
      fix: { key: 'fix.invert', label: 'Invert to dark on light', patch: { colorMode: 'single', fgColor: '#111418', bgMode: 'solid', bgColor: '#ffffff' } },
    })
  }

  if (modulePx < 3) {
    issues.push({
      id: 'density', code: 'density', level: 'warn',
      title: 'Rendering is cramped',
      detail: `Only ${modulePx}px per module at ${cfg.width}px. Raise the export size or shorten the content.`,
      params: { px: modulePx, width: cfg.width },
      fix: { key: 'fix.export1024', label: 'Export at 1024px', patch: { width: 1024, height: 1024 } },
    })
  }

  const errors = issues.filter((i) => i.level === 'error').length
  const level: ScanReport['level'] = errors ? 'fail' : issues.length ? 'warn' : 'pass'

  return { level, contrast, fg, bg, version, modules, modulePx, moduleMm, quietModules, minSizeMm, inverted, issues }
}

/** Where the panel header's one-liner comes from. */
export function reportSummaryKey(report: ScanReport): { key: 'scan.ready' | 'scan.fail' | 'scan.warnOne' | 'scan.warnMany'; params?: Record<string, number> } {
  if (report.level === 'pass') return { key: 'scan.ready' }
  if (report.level === 'fail') return { key: 'scan.fail' }
  return report.issues.length === 1 ? { key: 'scan.warnOne' } : { key: 'scan.warnMany', params: { n: report.issues.length } }
}

/** English one-liner (used by tests and any non-React consumer). */
export function reportSummary(report: ScanReport): string {
  if (report.level === 'pass') return 'Ready to print'
  if (report.level === 'fail') return 'Will probably fail to scan'
  return `${report.issues.length} thing${report.issues.length > 1 ? 's' : ''} to check`
}
