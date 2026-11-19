import { describe, expect, it } from 'vitest'
import QRCodeStyling from 'qr-code-styling'
import { defaultConfig, type QRConfig } from '../types'
import { buildPayload, parseCSV, toStylingOptions } from './qr'
import { STYLE_PRESETS } from '../data/stylePresets'

const cfg = (patch: Partial<QRConfig> = {}): QRConfig => ({ ...defaultConfig(), ...patch })
const fields = (f: Record<string, string>, patch: Partial<QRConfig> = {}): QRConfig =>
  cfg({ fields: { ...defaultConfig().fields, ...f }, ...patch })

describe('buildPayload', () => {
  it('URL types keep the raw link', () => {
    for (const type of ['url', 'social', 'facebook', 'youtube', 'linkedin', 'pdf', 'menu'] as const) {
      expect(buildPayload({ ...cfg(), type, fields: { url: ' https://x.test/a ' } })).toBe('https://x.test/a')
    }
  })

  it('text is passed through untouched', () => {
    expect(buildPayload(fields({ text: 'hello world' }, { type: 'text' }))).toBe('hello world')
  })

  it('email builds a mailto with encoded subject and body', () => {
    const out = buildPayload(fields({ email: 'a@b.c', subject: 'Hi there', body: 'Line 1' }, { type: 'email' }))
    expect(out.startsWith('mailto:a@b.c?')).toBe(true)
    expect(out).toContain('subject=Hi+there')
    expect(out).toContain('body=Line+1')
  })

  it('phone strips spaces, sms keeps the message', () => {
    expect(buildPayload(fields({ phone: '+880 1712 345678' }, { type: 'phone' }))).toBe('tel:+8801712345678')
    expect(buildPayload(fields({ phone: '+8801712345678', message: 'Hi' }, { type: 'sms' }))).toBe('SMSTO:+8801712345678:Hi')
  })

  it('whatsapp keeps only digits and encodes the message', () => {
    const out = buildPayload(fields({ phone: '+880 1712-345678', message: 'Hi there' }, { type: 'whatsapp' }))
    expect(out).toBe('https://wa.me/8801712345678?text=Hi%20there')
  })

  it('wifi escapes the reserved characters and marks hidden networks', () => {
    const out = buildPayload(fields({ ssid: 'My;Net', password: 'p:a,ss', encryption: 'WPA', hidden: 'true' }, { type: 'wifi' }))
    expect(out).toBe('WIFI:T:WPA;S:My\\;Net;P:p\\:a\\,ss;H:true;;')
  })

  it('vcard keeps the CRLF-free field order the scanners expect', () => {
    const out = buildPayload(
      fields({ name: 'Rony Siddiqi', org: 'QRForge', title: 'Dev', phone: '+8801', email: 'r@x.test', website: 'https://x.test', address: 'Chattogram' }, { type: 'vcard' }),
    )
    expect(out.split('\n')).toEqual([
      'BEGIN:VCARD', 'VERSION:3.0', 'FN:Rony Siddiqi', 'ORG:QRForge', 'TITLE:Dev',
      'TEL;TYPE=CELL:+8801', 'EMAIL:r@x.test', 'URL:https://x.test', 'ADR:;;Chattogram;;;;;;', 'END:VCARD',
    ])
  })

  it('location prefers coordinates and falls back to a maps search', () => {
    expect(buildPayload(fields({ lat: '22.35', lng: '91.78' }, { type: 'location' }))).toBe('geo:22.35,91.78')
    expect(buildPayload(fields({ query: 'Dhaka' }, { type: 'location' }))).toContain('query=Dhaka')
  })

  it('event emits an ics block with clean timestamps', () => {
    const out = buildPayload(fields({ title: 'Launch', start: '2026-01-02T10:30', end: '2026-01-02T12:00' }, { type: 'event' }))
    expect(out).toContain('DTSTART:20260102T103000')
    expect(out).toContain('DTEND:20260102T120000')
    expect(out.startsWith('BEGIN:VEVENT')).toBe(true)
  })

  it('social handles become profile URLs', () => {
    expect(buildPayload(fields({ username: '@rony' }, { type: 'instagram' }))).toBe('https://instagram.com/rony')
    expect(buildPayload(fields({ username: 'rony' }, { type: 'telegram' }))).toBe('https://t.me/rony')
    expect(buildPayload(fields({ username: 'https://t.me/x' }, { type: 'telegram' }))).toBe('https://t.me/x')
  })

  it('app falls back through the store links', () => {
    expect(buildPayload(fields({ ios: 'https://apps.apple.com/x' }, { type: 'app' }))).toBe('https://apps.apple.com/x')
  })

})

describe('parseCSV', () => {
  it('handles quoted commas, escaped quotes and CRLF', () => {
    const rows = parseCSV('name,note\r\n"Acme, Inc","say ""hi"""\r\nPlain,ok')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ name: 'Acme, Inc', note: 'say "hi"' })
    expect(rows[1]).toEqual({ name: 'Plain', note: 'ok' })
  })

  it('returns nothing for blank input', () => {
    expect(parseCSV('\n\n')).toEqual([])
  })
})

describe('toStylingOptions', () => {
  const dots = (c: QRConfig) => toStylingOptions(c, 'https://x.test').dotsOptions!

  it('single colour paints dots and eyes the same', () => {
    const o = toStylingOptions(cfg({ fgColor: '#123456', bodyStyle: 'dots', eyeStyle: 'square' }), 'x')
    expect(o.dotsOptions).toMatchObject({ color: '#123456', type: 'dots' })
    expect(o.cornersSquareOptions).toMatchObject({ color: '#123456', type: 'square' })
    expect(o.dotsOptions!.gradient).toBeUndefined()
  })

  it('dual colour uses the first colour for dots and the second for eyes', () => {
    const o = toStylingOptions(cfg({ colorMode: 'dual', fgColor: '#111111', fgColor2: '#222222' }), 'x')
    expect(o.dotsOptions!.color).toBe('#111111')
    expect(o.cornersSquareOptions!.color).toBe('#222222')
    expect(o.cornersDotOptions!.color).toBe('#222222')
  })

  it('gradient modes carry stops and no flat colour', () => {
    for (const colorMode of ['gradient', 'multi', 'radial'] as const) {
      const o = toStylingOptions(cfg({ colorMode, gradientFrom: '#0ea5e9', gradientTo: '#2563eb' }), 'x')
      expect(o.dotsOptions!.color).toBeUndefined()
      expect(o.dotsOptions!.gradient).toBeTruthy()
      expect(o.cornersSquareOptions!.gradient).toBeTruthy()
    }
    const multi = toStylingOptions(cfg({ colorMode: 'multi', gradientMid: '#ff0000' }), 'x')
    expect(multi.dotsOptions!.gradient!.colorStops).toHaveLength(3)
  })

  it('extra-rounded eyes become a round corner dot', () => {
    const o = toStylingOptions(cfg({ eyeStyle: 'extra-rounded' }), 'x')
    expect(o.cornersSquareOptions!.type).toBe('extra-rounded')
    expect(o.cornersDotOptions!.type).toBe('dot')
  })

  it('background modes map to transparent, solid and gradient', () => {
    expect(toStylingOptions(cfg({ bgMode: 'transparent' }), 'x').backgroundOptions).toMatchObject({ color: 'rgba(0,0,0,0)' })
    expect(toStylingOptions(cfg({ bgMode: 'solid', bgColor: '#fafafa' }), 'x').backgroundOptions).toMatchObject({ color: '#fafafa' })
    const grad = toStylingOptions(cfg({ bgMode: 'gradient', bgGradientFrom: '#fff', bgGradientTo: '#000' }), 'x').backgroundOptions!
    expect(grad.color).toBeUndefined()
    expect(grad.gradient).toBeTruthy()
  })

  it('imageOptions is always an object and image is always a key', () => {
    const o = toStylingOptions(cfg(), 'x')
    expect(o.imageOptions).toBeTruthy()
    expect('image' in o).toBe(true)
    expect(o.image).toBeUndefined()
    expect(toStylingOptions(cfg({ logo: 'data:image/png;base64,AA' }), 'x').image).toBe('data:image/png;base64,AA')
  })

  it('keeps duplicate dots options free of stale gradients when switching modes', () => {
    const gradient = dots(cfg({ colorMode: 'gradient' }))
    expect(gradient.gradient).toBeTruthy()
    const flat = dots(cfg({ colorMode: 'single', fgColor: '#000000' }))
    expect(flat.gradient).toBeUndefined()
    expect(flat.color).toBe('#000000')
  })
})

describe('preview and export never drift apart', () => {
  // The library's update() deep-merges and skips undefined, so an omitted key
  // keeps its previous value. Every option key that can be conditional is
  // therefore written on every call; this test proves it.
  const options = (c: QRConfig) => toStylingOptions(c, 'https://qrforge.app')
  const norm = (o: unknown) => JSON.stringify(o)
  const fresh = new Map(
    STYLE_PRESETS.map((p) => [p.id, norm((new QRCodeStyling(options({ ...cfg(), ...p.style }) as never) as { _options: unknown })._options)]),
  )

  it('all 100 ordered preset switches resolve to a fresh render', () => {
    let differs = 0
    for (const a of STYLE_PRESETS) {
      const qr = new QRCodeStyling(options({ ...cfg(), ...a.style }) as never) as unknown as { _options: unknown; update: (o: unknown) => void }
      for (const b of STYLE_PRESETS) {
        qr.update(options({ ...cfg(), ...b.style }))
        if (norm(qr._options) !== fresh.get(b.id)) differs += 1
      }
    }
    expect(differs).toBe(0)
  })

  it('removing a logo clears the merged image', () => {
    const withLogo = { ...cfg(), ...STYLE_PRESETS[0].style, logo: 'data:image/png;base64,AA' }
    const qr = new QRCodeStyling(options(withLogo) as never) as unknown as { _options: { image?: string }; update: (o: unknown) => void }
    expect(qr._options.image).toBeTruthy()
    qr.update(options({ ...cfg(), ...STYLE_PRESETS[0].style }))
    expect(qr._options.image).toBeFalsy()
  })
})
