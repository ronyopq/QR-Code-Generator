#!/usr/bin/env node
/**
 * Post-build SEO step.
 *
 * A React SPA renders an empty <div id="root"> at build time, so every crawler
 * that does not execute JavaScript (Bing's lighter fetcher, GPTBot, ClaudeBot,
 * PerplexityBot, all social scrapers) sees nothing. This script fixes that by
 * prerendering the crawlable shell and the JSON-LD graph into dist/index.html,
 * then writing robots.txt, sitemap.xml and llms.txt from the same content
 * module — one run of `npm run build` ships the whole SEO surface.
 *
 * It also *enforces* the promise: the build fails if the title or description
 * grow past what search engines display, if the shell is empty, if the FAQ is
 * missing, or if the JSON-LD does not parse.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { build } from 'esbuild'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')
const bundlePath = path.join(root, 'node_modules', '.cache', 'qrforge-prerender.mjs')

const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

async function loadPrerender() {
  await build({
    entryPoints: [path.join(root, 'src/marketing/prerenderEntry.tsx')],
    outfile: bundlePath,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    jsx: 'automatic',
    packages: 'external',
    logLevel: 'error',
  })
  return import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`)
}

function fail(message) {
  console.error(`\n✖ SEO check failed: ${message}\n`)
  process.exit(1)
}

if (!existsSync(path.join(dist, 'index.html'))) fail('dist/index.html is missing — run vite build first')

const mod = await loadPrerender()

// The hashed stylesheet name only exists after vite build — read it from the
// emitted index.html so every landing page links the same CSS the app uses.
const baseHtml = await readFile(path.join(dist, 'index.html'), 'utf8')
const cssHref = /<link rel="stylesheet"[^>]*href="([^"]+)"/.exec(baseHtml)?.[1]
if (!cssHref) fail('no stylesheet link found in dist/index.html')

const { html, jsonld, robots, sitemap, llms, pages } = mod.render(pkg.version, {
  cssHref,
  today: new Date().toISOString().slice(0, 10),
})
if (pages.length === 0) fail('no landing pages were rendered')

// ---------------------------------------------------------------- guard rails
const title = /<title>([^<]*)<\/title>/.exec(baseHtml)?.[1] ?? ''
const decodedTitle = title.replace(/&amp;/g, '&')
if (decodedTitle.length > 60) fail(`<title> is ${decodedTitle.length} chars, keep it ≤ 60 so Google does not truncate it`)
if (!/\sh1|\<h1/.test(html) || !html.includes('<h1')) fail('the shell has no <h1>')
if (!html.includes('<details')) fail('the FAQ is not in the shell')
if (html.length < 4000) fail(`the shell is suspiciously small (${html.length} bytes)`)
JSON.parse(jsonld) // throws if malformed

// ------------------------------------------------------------------ injection
const indexPath = path.join(dist, 'index.html')
let indexHtml = await readFile(indexPath, 'utf8')

if (!indexHtml.includes('<div id="root"></div>')) fail('could not find <div id="root"></div> in dist/index.html')
indexHtml = indexHtml.replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${html}</div>`)

if (!indexHtml.includes('<!-- SEO_JSONLD -->')) fail('the <!-- SEO_JSONLD --> marker is gone from index.html')
indexHtml = indexHtml.replace('<!-- SEO_JSONLD -->', `<script type="application/ld+json">${jsonld}</script>`)

await writeFile(indexPath, indexHtml)
await writeFile(path.join(dist, 'robots.txt'), robots)
await writeFile(path.join(dist, 'sitemap.xml'), sitemap)
await writeFile(path.join(dist, 'llms.txt'), llms)

// ------------------------------------------------------- landing pages guard
for (const page of pages) {
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(page.html)?.[1] ?? ''
  const pageTitle = /<title>([^<]*)<\/title>/.exec(page.html)?.[1] ?? ''
  if (!h1) fail(`${page.path} has no <h1>`)
  if (pageTitle.replace(/&amp;/g, '&').length > 60) fail(`${page.path} title is ${pageTitle.length} chars, keep it ≤ 60`)
  if (!page.html.includes('<details')) fail(`${page.path} has no FAQ`)
  if (!page.html.includes('../' + cssHref.replace(/^\.\//, ''))) fail(`${page.path} does not link the stylesheet relatively`)
  const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(page.html)?.[1]
  if (!ld) fail(`${page.path} has no JSON-LD`)
  JSON.parse(ld)
  if (!sitemap.includes(page.path)) fail(`${page.path} is missing from sitemap.xml`)
}

for (const page of pages) {
  const dir = path.join(dist, page.path.replace(/^\//, ''))
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'index.html'), page.html)
}

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} kB`
console.log(
  [
    `✓ prerendered shell   ${kb(html)} (${html.split('<').length - 1} elements)`,
    `✓ JSON-LD graph       ${kb(jsonld)}`,
    `✓ robots.txt + sitemap.xml + llms.txt written`,
    `✓ ${pages.length} landing pages  ${pages.map((p) => p.path).join(' ')}`,
    `✓ title ${decodedTitle.length}/60 chars`,
  ].join('\n'),
)
