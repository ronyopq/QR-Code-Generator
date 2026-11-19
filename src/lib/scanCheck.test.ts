import { describe, expect, it } from 'vitest'
import { defaultConfig, type QRConfig } from '../types'
import {
  analyseScan, averageColour, contrastRatio, effectiveBackground, effectiveForeground,
  hexToRgb, modulesFor, reportSummary, versionFor,
} from './scanCheck'
import { sheetLayout } from './exporter'

const cfg = (patch: Partial<QRConfig> = {}): QRConfig => ({ ...defaultConfig(), ...patch })
const payload = 'https://qrforge.app'

describe('colour maths', () => {
  it('parses short and long hex', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255])
    expect(hexToRgb('#0ea5e9')).toEqual([14, 165, 233])
    expect(hexToRgb('nonsense')).toEqual([0, 0, 0])
  })

  it('matches known WCAG contrast values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21)
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1)
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 1)
    // order must not matter
    expect(contrastRatio('#0b0d11', '#ffffff')).toBe(contrastRatio('#ffffff', '#0b0d11'))
  })

  it('averages gradient stops', () => {
    expect(averageColour(['#000000', '#ffffff'])).toBe('#808080')
    expect(averageColour(['#0ea5e9'])).toBe('#0ea5e9')
    expect(averageColour([])).toBe('#000000')
  })

  it('reads the colour the renderer actually paints', () => {
    expect(effectiveForeground(cfg({ colorMode: 'single', fgColor: '#123456' }))).toBe('#123456')
    expect(effectiveForeground(cfg({ colorMode: 'dual', fgColor: '#123456', fgColor2: '#ffffff' }))).toBe('#123456')
    expect(effectiveForeground(cfg({ colorMode: 'gradient', gradientFrom: '#000000', gradientTo: '#ffffff' }))).toBe('#808080')
    expect(effectiveBackground(cfg({ bgMode: 'transparent', bgColor: '#000000' }))).toBe('#ffffff')
    expect(effectiveBackground(cfg({ bgMode: 'solid', bgColor: '#0b0d11' }))).toBe('#0b0d11')
  })
})

describe('symbol size estimation', () => {
  it('grows with payload length', () => {
    expect(versionFor('hi', 'M')).toBe(1)
    expect(versionFor('x'.repeat(100), 'M')).toBeGreaterThan(versionFor('x'.repeat(30), 'M'))
    expect(versionFor('x'.repeat(4000), 'H')).toBe(40)
  })

  it('needs a bigger version for stronger error correction', () => {
    const text = 'x'.repeat(200)
    expect(versionFor(text, 'H')).toBeGreaterThan(versionFor(text, 'L'))
  })

  it('counts modules like the spec', () => {
    expect(modulesFor(1)).toBe(21)
    expect(modulesFor(10)).toBe(57)
    expect(modulesFor(40)).toBe(177)
  })

  it('counts multi-byte characters as bytes, not characters', () => {
    expect(versionFor('বাংলা', 'M')).toBeGreaterThanOrEqual(versionFor('aaaaa', 'M'))
  })
})

describe('analyseScan', () => {
  it('passes a plain black-on-white code at 40mm', () => {
    const r = analyseScan(cfg(), payload, 40)
    expect(r.level).toBe('pass')
    expect(r.issues).toEqual([])
    expect(r.contrast).toBe(21)
    expect(r.quietModules).toBeGreaterThan(2)
    expect(reportSummary(r)).toBe('Ready to print')
  })

  it('flags a transparent design only through its real risk, not noise', () => {
    const r = analyseScan(cfg({ bgMode: 'transparent' }), payload, 40)
    expect(r.bg).toBe('#ffffff')
    expect(r.level).toBe('pass')
  })

  it('fails when the modules nearly match the background', () => {
    const r = analyseScan(cfg({ fgColor: '#e5e7eb', bgColor: '#ffffff' }), payload)
    expect(r.level).toBe('fail')
    expect(r.issues[0].id).toBe('contrast')
    expect(r.issues[0].fix?.patch).toBeTruthy()
  })

  it('warns on low-but-usable contrast', () => {
    const r = analyseScan(cfg({ fgColor: '#8a8a8a', bgColor: '#ffffff' }), payload)
    expect(r.level).toBe('warn')
    expect(r.issues.some((i) => i.id === 'contrast' && i.level === 'warn')).toBe(true)
  })

  it('warns when the quiet zone collapses', () => {
    const r = analyseScan(cfg({ margin: 0 }), payload)
    expect(r.issues.some((i) => i.id === 'quiet')).toBe(true)
  })

  it('fails when the physical size makes modules unprintable', () => {
    const r = analyseScan(cfg({ errorCorrection: 'H' }), 'x'.repeat(600), 20)
    expect(r.level).toBe('fail')
    expect(r.issues.some((i) => i.id === 'module-size' && i.level === 'error')).toBe(true)
    expect(r.minSizeMm).toBeGreaterThan(20)
  })

  it('warns about a logo without strong error correction', () => {
    const r = analyseScan(cfg({ logo: 'data:image/png;base64,AA', logoSize: 0.3, errorCorrection: 'M' }), payload)
    const logo = r.issues.find((i) => i.id === 'logo')
    expect(logo?.level).toBe('warn')
    expect(logo?.fix?.patch).toEqual({ errorCorrection: 'H' })
    // and stops complaining once H is set
    expect(analyseScan(cfg({ logo: 'x', logoSize: 0.3, errorCorrection: 'H' }), payload).issues.some((i) => i.id === 'logo')).toBe(false)
  })

  it('warns about inverted codes but never blocks them', () => {
    const r = analyseScan(cfg({ fgColor: '#ffffff', bgColor: '#0b0d11' }), payload)
    expect(r.inverted).toBe(true)
    expect(r.level).toBe('warn')
    expect(r.issues.some((i) => i.id === 'inverted')).toBe(true)
  })

  it('suggests a bigger render when modules are under 3px', () => {
    const r = analyseScan(cfg({ width: 200, height: 200, margin: 8 }), 'x'.repeat(400))
    expect(r.issues.some((i) => i.id === 'density')).toBe(true)
  })

  it('keeps the print-size advice in millimetres', () => {
    const small = analyseScan(cfg(), payload, 20)
    const big = analyseScan(cfg(), payload, 100)
    expect(small.moduleMm).toBeLessThan(big.moduleMm)
    expect(big.moduleMm).toBeGreaterThan(0.4)
  })
})

describe('A4 print sheet', () => {
  it('lays out six cells that stay inside the page and never overlap', () => {
    const { cells } = sheetLayout(6)
    expect(cells).toHaveLength(6)
    for (const c of cells) {
      expect(c.x).toBeGreaterThanOrEqual(0)
      expect(c.y).toBeGreaterThanOrEqual(0)
      expect(c.x + c.cellW).toBeLessThanOrEqual(210)
      expect(c.y + c.cellH).toBeLessThanOrEqual(297)
      expect(c.qrX).toBeGreaterThanOrEqual(c.x)
      expect(c.qrY).toBeGreaterThanOrEqual(c.y)
      expect(c.qrX + c.size).toBeLessThanOrEqual(c.x + c.cellW)
      expect(c.qrY + c.size).toBeLessThan(c.labelY)
      expect(c.size).toBeGreaterThan(30)
    }
    const boxes = cells.map((c) => `${Math.round(c.x)},${Math.round(c.y)}`)
    expect(new Set(boxes).size).toBe(6)
  })

  it('never exceeds the page capacity', () => {
    expect(sheetLayout(12).cells).toHaveLength(6)
  })
})
