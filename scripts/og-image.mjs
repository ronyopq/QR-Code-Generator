#!/usr/bin/env node
/**
 * Builds the social cards: public/og.png (the site) and one
 * public/og/<page>.png per landing page.
 *
 * Why a script instead of hand-made files: the QR on every card is a *real*,
 * scannable code (matrix from `qrcode-generator`, the library behind
 * qr-code-styling) that points at the very page the card belongs to, and the
 * cards are regenerated whenever the canonical URL changes. ImageMagick draws
 * them from an MVG script — no canvas, no headless browser, runs anywhere.
 *
 *   node scripts/og-image.mjs
 *
 * The PNGs are committed, so the deploy never needs ImageMagick.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const qrcode = require('qrcode-generator')

const SITE = 'https://qrforge-bd.vercel.app'
const W = 1200
const H = 630
const INK = '#111418'
const MUTED = '#5b6470'
const BODY = '#3c444d'
const ACCENT = '#4338ca'
const PAPER = '#f7f7f4'

/** One card per page. `size` is the wordmark size — tuned so nothing overflows. */
const CARDS = [
  {
    out: 'public/og.png',
    url: `${SITE}/`,
    title: 'QRForge',
    titleSize: 124,
    subtitle: 'Free QR code generator',
    facts: '20 QR types  ·  8 export formats  ·  logos & presets',
    urlText: 'qrforge-bd.vercel.app',
  },
  {
    out: 'public/og/wifi-qr-code.png',
    url: `${SITE}/wifi-qr-code/`,
    title: 'WiFi QR code',
    subtitle: 'Guests join in one scan',
    facts: 'SSID  ·  password  ·  print size check',
    urlText: 'qrforge-bd.vercel.app/wifi-qr-code',
  },
  {
    out: 'public/og/vcard-qr-code.png',
    url: `${SITE}/vcard-qr-code/`,
    title: 'vCard QR code',
    subtitle: 'The card that saves itself',
    facts: 'name  ·  phone  ·  email  ·  company',
    urlText: 'qrforge-bd.vercel.app/vcard-qr-code',
  },
  {
    out: 'public/og/menu-qr-code.png',
    url: `${SITE}/menu-qr-code/`,
    title: 'Menu QR code',
    subtitle: 'For restaurants and cafés',
    facts: 'no subscription  ·  never expires',
    urlText: 'qrforge-bd.vercel.app/menu-qr-code',
  },
  {
    out: 'public/og/whatsapp-qr-code.png',
    url: `${SITE}/whatsapp-qr-code/`,
    title: 'WhatsApp QR code',
    subtitle: 'Opens a chat instantly',
    facts: 'prefilled message  ·  phone + desktop',
    urlText: 'qrforge-bd.vercel.app/whatsapp-qr-code',
  },
  {
    out: 'public/og/url-qr-code.png',
    url: `${SITE}/url-qr-code/`,
    title: 'URL QR code',
    subtitle: 'Print-ready links',
    facts: 'PNG  ·  SVG  ·  PDF  ·  A4 sheet',
    urlText: 'qrforge-bd.vercel.app/url-qr-code',
  },
]

const dir = mkdtempSync(path.join(tmpdir(), 'qrforge-og-'))

/** Real text width via ImageMagick, so nothing ever runs under the QR card. */
function textWidth(text, pointsize, font = 'DejaVu-Sans-Bold') {
  try {
    return Number(
      execFileSync('convert', ['-font', font, '-pointsize', String(pointsize), `label:${text}`, '-format', '%w', 'info:'], {
        encoding: 'utf8',
      }),
    )
  } catch {
    return text.length * pointsize * 0.6 // conservative fallback
  }
}

/**
 * Auto-fit a title: one line if it can be large, otherwise two balanced lines.
 * Returns the lines plus the pointsize to draw them at.
 */
function fitTitle(text, maxWidth) {
  const words = text.split(' ')
  if (words.length > 1) {
    for (let size = 124; size >= 58; size -= 2) {
      if (textWidth(text, size) <= maxWidth) {
        // A tiny single line looks worse than two big ones — go two-line below 74px.
        if (size >= 74) return { lines: [text], size }
        break
      }
    }
  }
  // two lines: split at the word boundary that balances the widths best
  let best = { lines: [text], size: 58 }
  let bestScore = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ')
    const b = words.slice(i).join(' ')
    for (let size = 96; size >= 48; size -= 2) {
      const w = Math.max(textWidth(a, size), textWidth(b, size))
      if (w <= maxWidth) {
        const score = Math.abs(textWidth(a, size) - textWidth(b, size))
        if (score < bestScore) {
          bestScore = score
          best = { lines: [a, b], size }
        }
        break
      }
    }
  }
  return best
}
mkdirSync('public/og', { recursive: true })

function matrixModules(text, cardX, cardY, card) {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const count = qr.getModuleCount()
  const modulePx = Math.floor((card - 56) / (count + 6))
  const qrPx = modulePx * count
  const qrX = Math.round(cardX + (card - qrPx) / 2)
  const qrY = Math.round(cardY + (card - qrPx) / 2)

  const rects = []
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.isDark(row, col)) continue
      const x = qrX + col * modulePx
      const y = qrY + row * modulePx
      rects.push(`rectangle ${x},${y} ${x + modulePx - 1},${y + modulePx - 1}`)
    }
  }
  return { rects, count, modulePx }
}

for (const card of CARDS) {
  const CARD = 360
  const CARD_X = W - CARD - 80
  const CARD_Y = (H - CARD) / 2
  const { rects, count, modulePx } = matrixModules(card.url, CARD_X, CARD_Y, CARD)

  const mvgPath = path.join(dir, `modules-${path.basename(card.out)}.mvg`)
  writeFileSync(mvgPath, `fill ${INK}\n${rects.join('\n')}\n`)

  const maxTitleWidth = CARD_X - 78 - 24
  const fit = card.titleSize ? { lines: [card.title], size: card.titleSize } : fitTitle(card.title, maxTitleWidth)
  const lineGap = Math.round(fit.size * 0.98)
  const titleY = fit.lines.length > 1 ? 260 : card.size > 100 ? 310 : 292

  const args = [
    '-size', `${W}x${H}`, `xc:${PAPER}`,

    // accent rule above the eyebrow
    '-fill', ACCENT, '-draw', 'rectangle 80,104 208,110',
    '-fill', '#d9d9d2', '-draw', 'rectangle 216,104 420,110',

    '-font', 'DejaVu-Sans-Mono', '-pointsize', '21', '-fill', MUTED,
    '-annotate', '+80+156', 'FREE  ·  NO SIGN-UP  ·  OFFLINE',

    '-font', 'DejaVu-Sans-Bold', '-pointsize', String(fit.size), '-fill', INK,
    ...fit.lines.flatMap((line, i) => ['-annotate', '+78+' + (titleY + i * lineGap), line]),

    '-font', 'DejaVu-Sans', '-pointsize', '38', '-fill', BODY,
    '-annotate', '+82+' + (titleY + (fit.lines.length - 1) * lineGap + 62), card.subtitle,

    '-font', 'DejaVu-Sans', '-pointsize', '25', '-fill', MUTED,
    '-annotate', '+82+' + (titleY + (fit.lines.length - 1) * lineGap + 116), card.facts,

    '-font', 'DejaVu-Sans-Mono', '-pointsize', '23', '-fill', ACCENT,
    '-annotate', '+82+520', card.urlText,

    // card + real QR
    '-fill', '#ffffff', '-draw', `roundrectangle ${CARD_X},${CARD_Y} ${CARD_X + CARD},${CARD_Y + CARD} 22,22`,
    '-stroke', '#e5e5df', '-strokewidth', '2', '-fill', 'none',
    '-draw', `roundrectangle ${CARD_X},${CARD_Y} ${CARD_X + CARD},${CARD_Y + CARD} 22,22`,
    '-stroke', 'none',
    '-draw', `@${mvgPath}`,

    '-font', 'DejaVu-Sans-Mono', '-pointsize', '17', '-fill', MUTED,
    '-gravity', 'North',
    '-annotate', `+${Math.round(W - CARD_X - CARD / 2)}+${CARD_Y + CARD + 20}`, 'scan me — it works',

    card.out,
  ]

  execFileSync('convert', args, { stdio: ['ignore', 'ignore', 'pipe'] })
  console.log(
    `✓ ${card.out}  (${count}×${count} QR at ${modulePx}px/module, title ${fit.size}px${fit.lines.length > 1 ? ', 2 lines' : ''})`,
  )
}
