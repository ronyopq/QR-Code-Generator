import QRCodeStyling, { type Options } from 'qr-code-styling'
import type { QRConfig } from '../types'

const enc = (s = '') => encodeURIComponent(s.trim())

export function buildPayload(cfg: QRConfig): string {
  const f = cfg.fields
  switch (cfg.type) {
    case 'url': case 'social': case 'facebook': case 'youtube': case 'linkedin': case 'pdf': case 'menu':
      return (f.url || f.username || '').trim()
    case 'text': return f.text || ''
    case 'email': {
      const q = new URLSearchParams()
      if (f.subject) q.set('subject', f.subject)
      if (f.body) q.set('body', f.body)
      const qs = q.toString()
      return `mailto:${f.email || ''}${qs ? '?' + qs : ''}`
    }
    case 'phone': return `tel:${(f.phone || '').replace(/\s/g, '')}`
    case 'sms': return `SMSTO:${f.phone || ''}:${f.message || ''}`
    case 'whatsapp': return `https://wa.me/${(f.phone || '').replace(/\D/g, '')}${f.message ? '?text=' + enc(f.message) : ''}`
    case 'wifi': {
      const esc = (s = '') => s.replace(/([\\;,:"])/g, '\\$1')
      return `WIFI:T:${f.encryption || 'WPA'};S:${esc(f.ssid)};P:${esc(f.password)};H:${f.hidden || 'false'};;`
    }
    case 'vcard': {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${f.name || ''}`]
      if (f.org) lines.push(`ORG:${f.org}`)
      if (f.title) lines.push(`TITLE:${f.title}`)
      if (f.phone) lines.push(`TEL;TYPE=CELL:${f.phone}`)
      if (f.email) lines.push(`EMAIL:${f.email}`)
      if (f.website) lines.push(`URL:${f.website}`)
      if (f.address) lines.push(`ADR:;;${f.address};;;;;;`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
    case 'location':
      return f.lat && f.lng ? `geo:${f.lat},${f.lng}` : `https://www.google.com/maps/search/?api=1&query=${enc(f.query)}`
    case 'event': {
      const fmt = (d = '') => d.replace(/[-:]/g, '').replace('T', 'T') + '00'
      const lines = ['BEGIN:VEVENT', `SUMMARY:${f.title || 'Event'}`]
      if (f.start) lines.push(`DTSTART:${fmt(f.start)}`)
      if (f.end) lines.push(`DTEND:${fmt(f.end)}`)
      if (f.location) lines.push(`LOCATION:${f.location}`)
      if (f.description) lines.push(`DESCRIPTION:${f.description}`)
      lines.push('END:VEVENT')
      return lines.join('\n')
    }
    case 'instagram': {
      const u = (f.username || '').trim()
      return u.startsWith('http') ? u : `https://instagram.com/${u.replace('@', '')}`
    }
    case 'telegram': {
      const u = (f.username || '').trim()
      return u.startsWith('http') ? u : `https://t.me/${u.replace('@', '')}`
    }
    case 'app': return f.fallback || f.ios || f.android || ''
    case 'dynamic': {
      // Dynamic-ready: encode destination + campaign params. Swap with a redirect
      // service URL later without changing the QR format.
      const u = f.url || ''
      try {
        const url = new URL(u)
        if (f.campaign) url.searchParams.set('utm_campaign', f.campaign)
        url.searchParams.set('utm_source', 'qrforge-dynamic')
        return url.toString()
      } catch { return u }
    }
    default: return ''
  }
}

export function toStylingOptions(cfg: QRConfig, payload: string): Options {
  const grad = (from: string, to: string, mid?: string) => ({
    type: 'linear' as const,
    rotation: 0,
    colorStops: mid
      ? [{ offset: 0, color: from }, { offset: 0.5, color: mid }, { offset: 1, color: to }]
      : [{ offset: 0, color: from }, { offset: 1, color: to }],
  })
  const radial = (from: string, to: string) => ({
    type: 'radial' as const,
    colorStops: [{ offset: 0, color: from }, { offset: 1, color: to }],
  })

  let dotsOptions: Options['dotsOptions']
  let cornersSquareOptions: Options['cornersSquareOptions']
  let cornersDotOptions: Options['cornersDotOptions']

  if (cfg.colorMode === 'single') {
    dotsOptions = { color: cfg.fgColor, type: cfg.bodyStyle }
    cornersSquareOptions = { color: cfg.fgColor, type: cfg.eyeStyle }
    cornersDotOptions = { color: cfg.fgColor, type: cfg.eyeStyle === 'extra-rounded' ? 'dot' : cfg.eyeStyle }
  } else if (cfg.colorMode === 'dual') {
    dotsOptions = { color: cfg.fgColor, type: cfg.bodyStyle }
    cornersSquareOptions = { color: cfg.fgColor2, type: cfg.eyeStyle }
    cornersDotOptions = { color: cfg.fgColor2, type: cfg.eyeStyle === 'extra-rounded' ? 'dot' : cfg.eyeStyle }
  } else if (cfg.colorMode === 'gradient') {
    dotsOptions = { gradient: grad(cfg.gradientFrom, cfg.gradientTo), type: cfg.bodyStyle }
    cornersSquareOptions = { gradient: grad(cfg.gradientFrom, cfg.gradientTo), type: cfg.eyeStyle }
    cornersDotOptions = { gradient: grad(cfg.gradientFrom, cfg.gradientTo), type: cfg.eyeStyle === 'extra-rounded' ? 'dot' : cfg.eyeStyle }
  } else if (cfg.colorMode === 'multi') {
    dotsOptions = { gradient: grad(cfg.gradientFrom, cfg.gradientTo, cfg.gradientMid), type: cfg.bodyStyle }
    cornersSquareOptions = { gradient: grad(cfg.gradientFrom, cfg.gradientTo, cfg.gradientMid), type: cfg.eyeStyle }
    cornersDotOptions = { gradient: grad(cfg.gradientFrom, cfg.gradientTo, cfg.gradientMid), type: cfg.eyeStyle === 'extra-rounded' ? 'dot' : cfg.eyeStyle }
  } else {
    dotsOptions = { gradient: radial(cfg.gradientFrom, cfg.gradientTo), type: cfg.bodyStyle }
    cornersSquareOptions = { gradient: radial(cfg.gradientFrom, cfg.gradientTo), type: cfg.eyeStyle }
    cornersDotOptions = { gradient: radial(cfg.gradientFrom, cfg.gradientTo), type: cfg.eyeStyle === 'extra-rounded' ? 'dot' : cfg.eyeStyle }
  }

  let backgroundOptions: Options['backgroundOptions']
  if (cfg.bgMode === 'transparent') backgroundOptions = { color: 'rgba(0,0,0,0)' }
  else if (cfg.bgMode === 'gradient') backgroundOptions = { gradient: grad(cfg.bgGradientFrom, cfg.bgGradientTo) }
  else backgroundOptions = { color: cfg.bgColor } // solid + pattern fallback

  return {
    width: cfg.width,
    height: cfg.height,
    type: 'canvas',
    data: payload || 'https://example.com',
    margin: cfg.margin,
    qrOptions: { errorCorrectionLevel: cfg.errorCorrection },
    backgroundOptions,
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    // imageOptions must always be an object: the library merges options over its
    // defaults and then reads imageOptions.hideBackgroundDots — passing
    // `undefined` here makes it read a property of undefined and throw.
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: cfg.logoSize,
      margin: cfg.logoMargin,
      crossOrigin: 'anonymous',
    },
    ...(cfg.logo ? { image: cfg.logo } : {}),
  }
}

export function createQR(cfg: QRConfig, payload: string) {
  return new QRCodeStyling(toStylingOptions(cfg, payload))
}

export async function qrBlob(cfg: QRConfig, payload: string, ext: 'png' | 'svg' | 'jpeg' | 'webp'): Promise<Blob> {
  // JPEG has no alpha channel: a transparent background is encoded as black, which
  // made every transparent preset (Minimal, Soft, Ocean, Sunset, Forest) download as
  // a black box in JPG / PDF / EPS / the ZIP bundle. Composite those onto white —
  // PNG, WEBP and SVG keep their real transparency.
  const target = ext === 'jpeg' && cfg.bgMode === 'transparent'
    ? { ...cfg, bgMode: 'solid' as const, bgColor: '#ffffff' }
    : cfg
  const qr = createQR(target, payload)
  const blob = await qr.getRawData(ext as never)
  if (!blob) throw new Error('QR render failed')
  return blob as Blob
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return []
  const split = (line: string) => {
    const out: string[] = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++ } else inQ = !inQ }
      else if (c === ',' && !inQ) { out.push(cur); cur = '' }
      else cur += c
    }
    out.push(cur)
    return out.map((s) => s.trim())
  }
  const headers = split(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const vals = split(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => (row[h] = vals[i] ?? ''))
    return row
  })
}

export const QUALITY_SCALE: Record<string, number> = { hd: 1, '2k': 2, '4k': 4, print: 3, social: 1.5 }

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qr-code'
}
