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
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { build as esbuild } from 'esbuild'

const require = createRequire(import.meta.url)
const qrcode = require('qrcode-generator')

const SITE = 'https://qrforge-bd.vercel.app'
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

/** The route table is the source of truth, so a new page gets a card for free. */
async function loadRoutes() {
  const out = path.join(root, 'node_modules', '.cache', 'qrforge-og-routes.mjs')
  await esbuild({
    entryPoints: [path.join(root, 'src/marketing/routes.ts')],
    outfile: out,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    packages: 'external',
    logLevel: 'error',
  })
  return import(`${pathToFileURL(out).href}?v=${Date.now()}`)
}
const W = 1200
const H = 630
const INK = '#111418'
const MUTED = '#5b6470'
const BODY = '#3c444d'
const ACCENT = '#4338ca'
const PAPER = '#f7f7f4'

const HOME_CARD = {
  out: 'public/og.png',
  url: `${SITE}/`,
  title: 'QRForge',
  titleSize: 124,
  subtitle: 'Free QR code generator',
  facts: '20 QR types  ·  8 export formats  ·  logos & presets',
  urlText: 'qrforge-bd.vercel.app',
}

/** Hand-tuned subtitles for the pages that deserve better than an auto excerpt. */
const OVERRIDES = {
  '/wifi-qr-code': { subtitle: 'Guests join in one scan', facts: 'SSID  ·  password  ·  print size check' },
  '/vcard-qr-code': { title: 'vCard QR code', subtitle: 'The card that saves itself', facts: 'name  ·  phone  ·  email  ·  company' },
  '/menu-qr-code': { subtitle: 'For restaurants and cafés', facts: 'no subscription  ·  never expires' },
  '/whatsapp-qr-code': { subtitle: 'Opens a chat instantly', facts: 'prefilled message  ·  phone + desktop' },
  '/url-qr-code': { subtitle: 'Print-ready links', facts: 'PNG  ·  SVG  ·  PDF  ·  A4 sheet' },
}

/** Short, clean subtitle: first clause of the lede, clipped on a word boundary. */
function firstSentence(text) {
  const m = /^(.+?[.!?])(\s|$)/.exec(text)
  let sentence = (m ? m[1] : text).replace(/\s+/g, ' ').trim()
  if (sentence.length > 52) {
    sentence = sentence.slice(0, 52)
    sentence = sentence.slice(0, sentence.lastIndexOf(' ')).replace(/[\s—–,;:.-]+$/, '')
    return `${sentence}…`
  }
  return sentence.replace(/[.]+$/, '')
}

const module = await loadRoutes()
const ROUTES = module.LANDING_ROUTES

const CARDS = [
  HOME_CARD,
  ...ROUTES.map((r) => {
    const override = OVERRIDES[r.path] ?? {}
    return {
      out: `public/og${r.path}.png`,
      url: `${SITE}${r.path}`,
      title: override.title ?? (r.navLabel.includes('QR') ? r.navLabel : `${r.navLabel} QR code`),
      subtitle: override.subtitle ?? firstSentence(r.lede),
      facts: override.facts ?? 'free  ·  no sign-up  ·  nothing uploaded',
      urlText: `qrforge-bd.vercel.app${r.path}`,
    }
  }),
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

/** Shrink, then truncate, so a subtitle can never slide under the QR card. */
function fitLine(text, maxWidth, startSize, minSize, font = 'DejaVu-Sans') {
  for (let size = startSize; size >= minSize; size -= 2) {
    if (textWidth(text, size, font) <= maxWidth) return { text, size }
  }
  let out = text
  while (out.length > 8 && textWidth(`${out}…`, minSize, font) > maxWidth) out = out.slice(0, -1)
  return { text: `${out.trimEnd()}…`, size: minSize }
}

/**
 * Auto-fit a title: one line if it can be large, otherwise two balanced lines.
 * Returns the lines plus the pointsize to draw them at.
 */
function fitTitle(text, maxWidth) {
  const words = text.split(' ')

  // One word: let it grow as large as it fits.
  if (words.length === 1) {
    for (let size = 124; size >= 48; size -= 2) {
      if (textWidth(text, size) <= maxWidth) return { lines: [text], size }
    }
    return { lines: [text], size: 48 }
  }

  // Several words: a single line down to 74px, then two balanced lines.
  for (let size = 124; size >= 74; size -= 2) {
    if (textWidth(text, size) <= maxWidth) return { lines: [text], size }
  }

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
  const sub = fitLine(card.subtitle, maxTitleWidth, 38, 22)
  const facts = fitLine(card.facts, maxTitleWidth, 25, 18)
  const urlLine = fitLine(card.urlText, maxTitleWidth, 23, 16, 'DejaVu-Sans-Mono')
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

    '-font', 'DejaVu-Sans', '-pointsize', String(sub.size), '-fill', BODY,
    '-annotate', '+82+' + (titleY + (fit.lines.length - 1) * lineGap + 60), sub.text,

    '-font', 'DejaVu-Sans', '-pointsize', String(facts.size), '-fill', MUTED,
    '-annotate', '+82+' + (titleY + (fit.lines.length - 1) * lineGap + 108), facts.text,

    '-font', 'DejaVu-Sans-Mono', '-pointsize', String(urlLine.size), '-fill', ACCENT,
    '-annotate', '+82+520', urlLine.text,

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
