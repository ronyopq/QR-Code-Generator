#!/usr/bin/env node
/**
 * Builds public/og.png — the 1200×630 social card.
 *
 * Why a script instead of a hand-made file: the QR on the card is a *real*
 * scannable code (matrix from `qrcode-generator`, the same library
 * `qr-code-styling` uses), and the card is regenerated whenever the canonical
 * URL changes. No canvas dependency, no headless browser — ImageMagick draws it
 * from an MVG script, so it also runs in CI.
 *
 *   node scripts/og-image.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const qrcode = require('qrcode-generator')

const URL_TEXT = 'https://qrforge-bd.vercel.app'
const W = 1200
const H = 630
const INK = '#111418'
const MUTED = '#5b6470'
const BODY = '#3c444d'
const ACCENT = '#4338ca'
const PAPER = '#f7f7f4'

// ---- real QR matrix -------------------------------------------------------
const qr = qrcode(0, 'M')
qr.addData(URL_TEXT)
qr.make()
const count = qr.getModuleCount()

const CARD = 360 // white card size
const CARD_X = W - CARD - 80
const CARD_Y = (H - CARD) / 2
const QUIET = 3 // modules of white padding inside the card
const modulePx = Math.floor((CARD - 56) / (count + QUIET * 2))
const qrPx = modulePx * count
const qrX = Math.round(CARD_X + (CARD - qrPx) / 2)
const qrY = Math.round(CARD_Y + (CARD - qrPx) / 2)

const modules = []
for (let row = 0; row < count; row++) {
  for (let col = 0; col < count; col++) {
    if (!qr.isDark(row, col)) continue
    const x = qrX + col * modulePx
    const y = qrY + row * modulePx
    modules.push(`rectangle ${x},${y} ${x + modulePx - 1},${y + modulePx - 1}`)
  }
}

const dir = mkdtempSync(path.join(tmpdir(), 'qrforge-og-'))
const mvgPath = path.join(dir, 'modules.mvg')
writeFileSync(mvgPath, `fill ${INK}\n${modules.join('\n')}\n`)

const args = [
  '-size', `${W}x${H}`,
  `xc:${PAPER}`,

  // accent rule above the eyebrow
  '-fill', ACCENT, '-draw', 'rectangle 80,104 208,110',
  '-fill', '#d9d9d2', '-draw', 'rectangle 216,104 420,110',

  // eyebrow
  '-font', 'DejaVu-Sans-Mono', '-pointsize', '21', '-fill', MUTED,
  '-annotate', '+80+156', 'FREE  ·  NO SIGN-UP  ·  OFFLINE',

  // wordmark
  '-font', 'DejaVu-Sans-Bold', '-pointsize', '124', '-fill', INK,
  '-annotate', '+78+310', 'QRForge',

  // subtitle
  '-font', 'DejaVu-Sans', '-pointsize', '40', '-fill', BODY,
  '-annotate', '+82+378', 'Free QR code generator',

  // facts
  '-font', 'DejaVu-Sans', '-pointsize', '26', '-fill', MUTED,
  '-annotate', '+82+434', '20 QR types  ·  8 export formats  ·  logos & presets',

  // url
  '-font', 'DejaVu-Sans-Mono', '-pointsize', '24', '-fill', ACCENT,
  '-annotate', '+82+520', 'qrforge-bd.vercel.app',

  // card + real QR
  '-fill', '#ffffff', '-draw', `roundrectangle ${CARD_X},${CARD_Y} ${CARD_X + CARD},${CARD_Y + CARD} 22,22`,
  '-stroke', '#e5e5df', '-strokewidth', '2', '-fill', 'none',
  '-draw', `roundrectangle ${CARD_X},${CARD_Y} ${CARD_X + CARD},${CARD_Y + CARD} 22,22`,
  '-stroke', 'none',
  '-draw', `@${mvgPath}`,

  // card caption
  '-font', 'DejaVu-Sans-Mono', '-pointsize', '17', '-fill', MUTED,
  '-gravity', 'North',
  '-annotate', `+${Math.round(W - CARD_X - CARD / 2)}+${CARD_Y + CARD + 20}`, 'scan me — it works',

  path.join(process.cwd(), 'public', 'og.png'),
]

execFileSync('convert', args, { stdio: ['ignore', 'ignore', 'pipe'] })
console.log(`✓ public/og.png — 1200×630, real ${count}×${count} QR at ${modulePx}px/module`)
