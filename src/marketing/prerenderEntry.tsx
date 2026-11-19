/**
 * Build-time prerender entry — bundled by `scripts/prerender.mjs` with esbuild
 * and executed in Node. It turns the crawlable shell and the JSON-LD graph into
 * plain strings, plus robots.txt / sitemap.xml / llms.txt, so a single run of
 * `npm run build` produces everything a search engine needs.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import StaticShell from './StaticShell'
import { FAQ, SITE, SUMMARY, absolute } from './content'
import { FEATURES } from './content'
import { QR_TYPES } from '../data/qrTypes'
import { DEVELOPER } from '../data/developer'
import { serializeStructuredData } from './structuredData'

export interface PrerenderOutput {
  html: string
  jsonld: string
  robots: string
  sitemap: string
  llms: string
}

/** Pages that exist as real URLs. Landing pages get appended here later. */
const ROUTES: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
]

/** Crawlers we explicitly welcome — including the AI answer engines. */
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bingbot',
]

function buildRobots(): string {
  const blocks = AI_AGENTS.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n')
  return `# ${SITE.name} — ${absolute('/')}
# Free, open source, nothing to crawl but the studio. All welcome.

User-agent: *
Allow: /

# AI assistants and answer engines — explicitly allowed so the product can be
# cited with correct, current facts instead of guesses.
${blocks}

Sitemap: ${absolute('/sitemap.xml')}
`
}

function buildSitemap(today: string): string {
  const urls = ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${absolute(r.path)}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

/**
 * llms.txt — the emerging convention answer engines look for: one plain-text
 * summary of what the site is, what it offers and where the facts live.
 */
function buildLlms(): string {
  const types = QR_TYPES.map((t) => `- ${t.label}: ${t.desc}`).join('\n')
  const faq = FAQ.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')
  return `# ${SITE.name}

> ${SUMMARY}

- URL: ${absolute('/')}
- Source: ${SITE.repo}
- Licence: MIT (free forever, no account, no watermark, no scan limit)
- Author: ${DEVELOPER.name} (${DEVELOPER.handle}), ${DEVELOPER.role}, ${DEVELOPER.location}
- Runs entirely in the browser: nothing is uploaded, codes are static and never expire
- Installable as an offline PWA

## QR types (${QR_TYPES.length})
${types}

## Features
${FEATURES.map((f) => `- ${f.title}: ${f.body}`).join('\n')}

## Export formats
PNG, JPG, SVG, WEBP, PDF, EPS, A4 print sheet (6 per page), ZIP bundle (image + raw payload + config JSON).

## FAQ
${faq}
`
}

export function render(version: string, today = new Date().toISOString().slice(0, 10)): PrerenderOutput {
  return {
    html: renderToStaticMarkup(<StaticShell />),
    jsonld: serializeStructuredData(version),
    robots: buildRobots(),
    sitemap: buildSitemap(today),
    llms: buildLlms(),
  }
}
