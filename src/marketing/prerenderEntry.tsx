/**
 * Build-time prerender entry — bundled by `scripts/prerender.mjs` with esbuild
 * and executed in Node. One run produces:
 *
 *   • the home shell injected into dist/index.html
 *   • a complete, JS-free HTML document for every landing page
 *   • robots.txt, sitemap.xml and llms.txt from the same route table
 *
 * Nothing here may touch the DOM: this code runs on a server.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import StaticShell from './StaticShell'
import LandingPage from './LandingPage'
import { FAQ, SITE, SUMMARY, absolute } from './content'
import { FEATURES } from './content'
import { QR_TYPES } from '../data/qrTypes'
import { DEVELOPER } from '../data/developer'
import { LANDING_ROUTES, sitemapEntries } from './routes'
import { buildLandingStructuredData, buildStructuredData, serialize, serializeStructuredData } from './structuredData'
import { renderDocument } from './document'

export interface PrerenderOutput {
  html: string
  jsonld: string
  robots: string
  sitemap: string
  llms: string
  /** One self-contained document per landing page. */
  pages: { path: string; html: string }[]
}

export interface PrerenderOptions {
  /** Stylesheet href as emitted by Vite (`./assets/index-abc.css`). */
  cssHref?: string
  /** Build date for sitemap lastmod. */
  today?: string
}

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
# Free, open source. Every page is static HTML, so there is nothing to skip.

User-agent: *
Allow: /

# AI assistants and answer engines — explicitly allowed so the product can be
# cited with correct, current facts instead of guesses.
${blocks}

Sitemap: ${absolute('/sitemap.xml')}
`
}

export function buildSitemap(today: string): string {
  const urls = sitemapEntries()
    .map(
      (r) =>
        `  <url>\n    <loc>${absolute(r.path)}</loc>\n` +
        `    <lastmod>${r.lastmod ?? today}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

/**
 * llms.txt — the convention answer engines look for: one plain-text summary of
 * what the site is, what it offers and where the durable facts live.
 */
function buildLlms(): string {
  const types = QR_TYPES.map((t) => `- ${t.label}: ${t.desc}`).join('\n')
  const faq = FAQ.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')
  const pages = LANDING_ROUTES.map(
    (r) => `- [${r.navLabel}](${absolute(r.path)}/): ${r.description}`,
  ).join('\n')
  return `# ${SITE.name}

> ${SUMMARY}

- URL: ${absolute('/')}
- Source: ${SITE.repo}
- Licence: MIT (free forever, no account, no watermark, no scan limit)
- Author: ${DEVELOPER.name} (${DEVELOPER.handle}), ${DEVELOPER.role}, ${DEVELOPER.location}
- Runs entirely in the browser: nothing is uploaded, codes are static and never expire
- Installable as an offline PWA

## Pages
- [QR code generator studio](${absolute('/')}): all ${QR_TYPES.length} types, logos, presets, scan check and 8 export formats
${pages}

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

export function render(version: string, opts: PrerenderOptions = {}): PrerenderOutput {
  const today = opts.today ?? new Date().toISOString().slice(0, 10)

  const pages = opts.cssHref
    ? LANDING_ROUTES.map((route) => ({
        path: route.path,
        html: renderDocument({
          title: route.title,
          description: route.description,
          path: route.path,
          body: renderToStaticMarkup(<LandingPage route={route} />),
          jsonld: serialize(buildLandingStructuredData(route, version)),
          cssHref: opts.cssHref!,
          ogImage: absolute(`/og${route.path}.png`),
        }),
      }))
    : []

  return {
    html: renderToStaticMarkup(<StaticShell />),
    jsonld: serializeStructuredData(version),
    robots: buildRobots(),
    sitemap: buildSitemap(today),
    llms: buildLlms(),
    pages,
  }
}
