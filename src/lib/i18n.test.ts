import { describe, expect, it } from 'vitest'
import { DICTS, translate, type TranslationKey } from './i18n'
import { defaultConfig, type QRConfig } from '../types'
import { analyseScan } from './scanCheck'

const enKeys = Object.keys(DICTS.en) as TranslationKey[]
const bnKeys = Object.keys(DICTS.bn)

const cfg = (patch: Partial<QRConfig> = {}): QRConfig => ({ ...defaultConfig(), ...patch })

describe('dictionaries', () => {
  it('Bengali covers every English key, with no empty strings', () => {
    const missing = enKeys.filter((k) => !bnKeys.includes(k))
    expect(missing).toEqual([])
    const empty = enKeys.filter((k) => !String(DICTS.bn[k] ?? '').trim())
    expect(empty).toEqual([])
    expect(bnKeys.length).toBe(enKeys.length)
  })

  it('no Bengali string is a verbatim copy of an English placeholder we forgot', () => {
    // a handful of keys are intentionally identical across locales (numbers, product names)
    const allowed = new Set(['scan.contrast', 'scan.modules'])
    const copied = enKeys.filter((k) => DICTS.bn[k] === DICTS.en[k] && !allowed.has(k))
    expect(copied).toEqual([])
  })

  it('interpolates placeholders', () => {
    expect(translate('en', 'scan.warnMany', { n: 3 })).toBe('3 things to check')
    expect(translate('bn', 'scan.warnMany', { n: 3 })).toBe('৩টি বিষয় দেখুন'.replace('৩', '3'))
    expect(translate('en', 'footer.stats', { saved: 2, types: 20, formats: 8, version: '1.3.0' }))
      .toBe('2 saved locally · 20 types · 8 formats · v1.3.0')
  })

  it('falls back to the key when a translation is missing', () => {
    expect(translate('bn', 'totally.missing' as TranslationKey)).toBe('totally.missing')
  })

  it('every issue code and fix key the report can emit is translated', () => {
    const reports = [
      analyseScan(cfg({ fgColor: '#e5e7eb' }), 'https://x.test'),
      analyseScan(cfg({ fgColor: '#8a8a8a' }), 'https://x.test'),
      analyseScan(cfg({ margin: 0 }), 'https://x.test'),
      analyseScan(cfg({ errorCorrection: 'H' }), 'x'.repeat(600), 20),
      analyseScan(cfg({ errorCorrection: 'H' }), 'x'.repeat(200), 30),
      analyseScan(cfg({ logo: 'data:image/png;base64,AA', logoSize: 0.5, errorCorrection: 'M' }), 'https://x.test'),
      analyseScan(cfg({ fgColor: '#ffffff', bgColor: '#0b0d11' }), 'https://x.test'),
      analyseScan(cfg({ width: 200, height: 200, margin: 8 }), 'x'.repeat(400)),
    ]
    const codes = new Set(reports.flatMap((r) => r.issues.map((i) => i.code)))
    expect(codes.size).toBeGreaterThanOrEqual(6)
    for (const code of codes) {
      for (const part of ['title', 'detail']) {
        const key = `issue.${code}.${part}` as TranslationKey
        expect(DICTS.en[key], `en ${key}`).toBeTruthy()
        expect(DICTS.bn[key], `bn ${key}`).toBeTruthy()
      }
    }
    for (const issue of reports.flatMap((r) => r.issues)) {
      if (!issue.fix) continue
      expect(DICTS.en[issue.fix.key as TranslationKey], `en ${issue.fix.key}`).toBeTruthy()
      expect(DICTS.bn[issue.fix.key as TranslationKey], `bn ${issue.fix.key}`).toBeTruthy()
    }
  })

  it('every preset has a translated name and description', () => {
    for (const id of ['classic', 'minimal', 'soft', 'ocean', 'sunset', 'forest', 'midnight', 'gold', 'neon', 'pastel']) {
      expect(DICTS.bn[`preset.${id}.name` as TranslationKey]).toBeTruthy()
      expect(DICTS.bn[`preset.${id}.desc` as TranslationKey]).toBeTruthy()
    }
  })
})
