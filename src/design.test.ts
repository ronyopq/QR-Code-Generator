/**
 * Design-system guards.
 *
 * These are the promises the UI makes about itself, turned into assertions, so
 * a future edit cannot quietly break them:
 *
 *   • every text token clears WCAG AA (4.5:1) on the surfaces it is used on
 *   • the focus ring clears the 3:1 non-text minimum (WCAG 1.4.11)
 *   • small controls keep a 44×44 hit area
 *   • reduced-motion and Windows high-contrast are handled
 *   • the app claims exactly the QR types it ships, and none of them promise a
 *     feature that does not exist
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { QR_TYPES } from './data/qrTypes'
import { FEATURES, SITE, SUMMARY, TYPE_COUNT } from './marketing/content'

const SRC = path.join(process.cwd(), 'src')
const read = (file: string) => readFileSync(path.join(SRC, file), 'utf8')
const css = read('index.css')

type Rgb = [number, number, number]

function tokens(block: string): Map<string, Rgb> {
  const map = new Map<string, Rgb>()
  for (const m of block.matchAll(/--c-([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+);/g)) {
    map.set(m[1], [Number(m[2]), Number(m[3]), Number(m[4])])
  }
  return map
}

const darkStart = css.indexOf('html.dark')
if (darkStart < 0) throw new Error('index.css has no dark palette')
const LIGHT = tokens(css.slice(0, darkStart))
const DARK = tokens(css.slice(darkStart))

const channel = (c: number) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]: Rgb) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Text/background pairs the components actually put on screen. */
const TEXT_PAIRS: [fg: string, bg: string][] = [
  ['fg', 'canvas'],
  ['fg', 'surface'],
  ['muted', 'canvas'],
  ['muted', 'surface'],
  ['muted', 'inset'],
  ['subtle', 'canvas'],
  ['subtle', 'surface'],
  ['subtle', 'inset'],
  ['accent-strong', 'canvas'],
  ['accent-strong', 'surface'],
  ['on-accent', 'accent'],
  ['btn-fg', 'btn-bg'],
  ['danger', 'surface'],
  ['warn', 'surface'],
  ['ok', 'surface'],
  ['ok', 'inset'],
]

describe('colour tokens', () => {
  for (const [theme, palette] of [
    ['light', LIGHT],
    ['dark', DARK],
  ] as const) {
    it(`clears 4.5:1 for every text pair in ${theme}`, () => {
      for (const [fg, bg] of TEXT_PAIRS) {
        const f = palette.get(fg)
        const b = palette.get(bg)
        expect(f, `${theme}: --c-${fg} is missing`).toBeTruthy()
        expect(b, `${theme}: --c-${bg} is missing`).toBeTruthy()
        const ratio = contrast(f!, b!)
        // The message is the failure report: which pair, and by how much.
        expect(ratio, `${theme}: --c-${fg} on --c-${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  it('never hard-codes a colour in a class name', () => {
    const dir = path.join(SRC, 'components')
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
      const src = readFileSync(path.join(dir, file), 'utf8')
      // swatch palettes in data are fine — arbitrary-value colour classes are not
      expect(src, `${file} uses a raw hex in a class name`).not.toMatch(
        /(bg|text|border|ring|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/,
      )
    }
  })
})

describe('interaction affordances', () => {
  it('gives focus a 3:1 indicator, not a translucent one', () => {
    // accent/60 measured 2.71:1 on the light canvas — under WCAG 1.4.11's 3:1.
    expect(css).not.toMatch(/ring-accent\/(\d+)/)
    expect(css).toMatch(/:focus-visible\s*\{[^}]*ring-2 ring-accent[^}]*\}/)
    const ring = contrast(LIGHT.get('accent')!, LIGHT.get('canvas')!)
    expect(ring).toBeGreaterThanOrEqual(3)
    const ringDark = contrast(DARK.get('accent')!, DARK.get('canvas')!)
    expect(ringDark).toBeGreaterThanOrEqual(3)
  })

  it('keeps a 44×44 hit area on small controls without resizing them', () => {
    expect(css).toMatch(/\.tap-44::after,\s*\.icon-btn::after,\s*\.chip::after\s*\{[^}]*2\.75rem/)
    expect(css).toMatch(/width:\s*max\(100%,\s*2\.75rem\)/)
    expect(css).toMatch(/height:\s*max\(100%,\s*2\.75rem\)/)
  })

  it('gives range sliders a 44px hit area but a 4px track', () => {
    const block = /input\[type='range'\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(block).toMatch(/height:\s*2\.75rem/)
    expect(css).toMatch(/::-webkit-slider-runnable-track\s*\{[^}]*height:\s*0\.25rem/)
    expect(css).toMatch(/::-moz-range-track\s*\{[^}]*height:\s*0\.25rem/)
    // the old rule painted the 4px track on the 44px element itself
    expect(block).not.toMatch(/bg-line|h-1\b/)
  })

  it('precaches this build’s assets for the first offline launch', () => {
    const sw = readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf8')
    // the build injects hashed files into this exact placeholder
    expect(sw).toContain('const PRECACHE = [];')
    expect(sw).toContain('[...CORE, ...PRECACHE]')
    expect(sw).toMatch(/CACHE_VERSION = 'qrforge-v\d+'/)
  })

  it('respects reduced motion and Windows high contrast', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/)
    expect(css).toMatch(/@media \(forced-colors: active\)/)
  })

  it('offers a skip link to keyboard users', () => {
    const app = read('App.tsx')
    expect(app).toMatch(/href="#top"[\s\S]{0,1200}Skip to content/)
  })
})

describe('honest product claims', () => {
  it('ships the number of types the copy claims', () => {
    expect(QR_TYPES).toHaveLength(19)
    expect(TYPE_COUNT).toBe(QR_TYPES.length)
    expect(SITE.title).toContain(`${TYPE_COUNT} Types`)
    expect(SITE.description).toContain(`${TYPE_COUNT - 5} more types`)
    expect(SUMMARY).toContain(`${QR_TYPES.length} QR types`)
    expect(FEATURES[0].title).toBe(`${QR_TYPES.length} QR code types`)
  })

  it('never markets a feature the app does not have', () => {
    // "Dynamic QR (Ready)" used to sit here promising a backend that will
    // never be built. Any of these words in a label is that mistake again.
    for (const t of QR_TYPES) {
      expect(`${t.label} ${t.desc}`, t.id).not.toMatch(/\bdynamic\b|\bready\b|\bsoon\b|\bbeta\b|\bcoming\b/i)
    }
  })

  it('gives every type the fields it needs to build a payload', () => {
    expect(new Set(QR_TYPES.map((t) => t.id)).size).toBe(QR_TYPES.length)
    for (const t of QR_TYPES) {
      expect(t.fields.length, t.id).toBeGreaterThan(0)
      expect(Object.keys(t.sample).length, `${t.id} has no sample`).toBeGreaterThan(0)
      expect(t.label.length, t.id).toBeLessThanOrEqual(22)
    }
  })
})
