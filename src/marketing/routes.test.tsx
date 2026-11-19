import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import LandingPage, { rel, studioHref } from './LandingPage'
import { LANDING_ROUTES, findRoute, sitemapEntries } from './routes'
import { GUIDES } from './guides'
import { buildLandingStructuredData, serialize } from './structuredData'
import { buildSitemap } from './prerenderEntry'
import { renderDocument } from './document'
import { QR_TYPES } from '../data/qrTypes'

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

function bodyWords(r: (typeof LANDING_ROUTES)[number]): number {
  const sections = r.sections.reduce(
    (n, s) => n + s.paragraphs.reduce((m, p) => m + words(p), 0) + (s.bullets ?? []).reduce((m, b) => m + words(b), 0),
    0,
  )
  const steps = r.howTo.steps.reduce((n, s) => n + words(s.text), 0)
  const faq = r.faq.reduce((n, f) => n + words(f.a), 0)
  return words(r.lede) + sections + steps + faq
}

describe('landing route table', () => {
  it('has unique, slash-prefixed paths', () => {
    const paths = LANDING_ROUTES.map((r) => r.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const p of paths) {
      expect(p.startsWith('/')).toBe(true)
      expect(p.endsWith('/')).toBe(false)
      expect(p).toMatch(/^\/[a-z0-9-]+(\/[a-z0-9-]+)?$/)
    }
  })

  it('points every page at a real QR type', () => {
    const ids = new Set<string>(QR_TYPES.map((t) => t.id))
    for (const r of LANDING_ROUTES) {
      if (r.typeId) expect(ids.has(r.typeId), `${r.path} → ${r.typeId}`).toBe(true)
    }
    // payload-type pages must preselect a type; guides need not
    const typed = LANDING_ROUTES.filter((r) => !r.group)
    expect(typed.every((r) => Boolean(r.typeId))).toBe(true)
  })

  it('keeps titles and descriptions inside SERP limits', () => {
    for (const r of LANDING_ROUTES) {
      expect(r.title.length, r.path).toBeLessThanOrEqual(60)
      expect(r.description.length, r.path).toBeLessThanOrEqual(160)
      expect(r.description.length, r.path).toBeGreaterThan(110)
    }
  })

  it('writes a real page, not a stub', () => {
    for (const r of LANDING_ROUTES) {
      expect(r.h1.length, r.path).toBeGreaterThan(20)
      expect(words(r.lede), r.path).toBeGreaterThanOrEqual(20)
      expect(bodyWords(r), r.path).toBeGreaterThanOrEqual(350)
      expect(r.sections.length, r.path).toBeGreaterThanOrEqual(3)
      expect(r.howTo.steps.length, r.path).toBeGreaterThanOrEqual(3)
      expect(r.faq.length, r.path).toBeGreaterThanOrEqual(3)
      for (const f of r.faq) {
        expect(f.q.endsWith('?'), r.path).toBe(true)
        expect(f.a.length, r.path).toBeGreaterThan(60)
      }
    }
  })

  it('never ships two pages with the same title or h1', () => {
    expect(new Set(LANDING_ROUTES.map((r) => r.title)).size).toBe(LANDING_ROUTES.length)
    expect(new Set(LANDING_ROUTES.map((r) => r.h1)).size).toBe(LANDING_ROUTES.length)
  })

  it('links only to pages that exist — and never to itself', () => {
    for (const r of LANDING_ROUTES) {
      expect(r.related.length).toBeGreaterThanOrEqual(2)
      for (const path of r.related) {
        expect(path, r.path).not.toBe(r.path)
        expect(findRoute(path), `${r.path} → ${path}`).toBeTruthy()
      }
    }
  })

  it('keeps the in-app guide links in sync with the routes', () => {
    expect(GUIDES).toEqual(LANDING_ROUTES.map((r) => ({ path: r.path, navLabel: r.navLabel })))
  })

  it('keeps guide pages honest about depth and intent', () => {
    for (const r of LANDING_ROUTES) {
      expect(r.ctaLabel ?? '', r.path).toMatch(/^.{0,40}$/)
      expect(rel(r.path, '/'), r.path).toBe('../'.repeat(r.path.split('/').filter(Boolean).length))
      if (r.group) {
        expect(r.path.startsWith('/how-to/'), r.path).toBe(true)
        expect(r.typeId, `${r.path} must not preselect a payload type`).toBeUndefined()
      }
    }
    const howTo = LANDING_ROUTES.filter((r) => r.group === 'How-to')
    expect(howTo).toHaveLength(4)
  })

  it('feeds the sitemap automatically', () => {
    const xml = buildSitemap('2026-11-19')
    const entries = sitemapEntries()
    expect(entries[0].path).toBe('/')
    for (const r of LANDING_ROUTES) {
      expect(xml).toContain(`https://qrforge-bd.vercel.app${r.path}<`)
      expect(entries.some((e) => e.path === r.path && e.lastmod === r.updated)).toBe(true)
    }
    // no hash URLs, ever
    expect(xml).not.toContain('#')
  })
})

describe('landing page markup', () => {
  it('renders one h1, every FAQ and a breadcrumb', () => {
    for (const route of LANDING_ROUTES) {
      const html = renderToStaticMarkup(<LandingPage route={route} />)
      expect(html.match(/<h1/g), route.path).toHaveLength(1)
      expect(html).toContain(route.h1)
      for (const f of route.faq) expect(html).toContain(f.q)
      expect(html).toContain('Breadcrumb')
      // links into the studio, with the type preselected when the page has one
      expect(html).toContain(studioHref(route.path, route.typeId))
      // and to its siblings, at the right depth
      for (const sibling of route.related) expect(html).toContain(rel(route.path, sibling))
    }
  })
})

describe('landing document', () => {
  const route = LANDING_ROUTES[0]
  const html = renderDocument({
    title: route.title,
    description: route.description,
    path: route.path,
    body: renderToStaticMarkup(<LandingPage route={route} />),
    jsonld: serialize(buildLandingStructuredData(route, '1.5.0')),
    cssHref: './assets/index-abc123.css',
  })

  it('is a complete HTML document with an absolute canonical', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<html lang="en">')
    expect(html).toContain(`<link rel="canonical" href="https://qrforge-bd.vercel.app${route.path}" />`)
    expect(html).toContain(`<meta property="og:url" content="https://qrforge-bd.vercel.app${route.path}" />`)
  })

  it('links assets one level up so it works on a Pages subpath', () => {
    expect(html).toContain('href="../assets/index-abc123.css"')
    expect(html).toContain('href="../favicon.svg"')
  })

  it('ships no JavaScript bundle — only the theme snippet', () => {
    expect(html).not.toContain('type="module"')
    expect(html).not.toContain('modulepreload')
    expect(html.match(/<script/g)).toHaveLength(2) // theme + JSON-LD
  })

  it('walks up two levels for nested guide URLs', () => {
    const nested = renderDocument({
      title: 'How big should a QR code be? A print size table',
      description: 'x'.repeat(120),
      path: '/how-to/size-a-qr-code',
      body: '',
      jsonld: '{}',
      cssHref: './assets/index-abc123.css',
    })
    expect(nested).toContain('href="../../assets/index-abc123.css"')
    expect(nested).toContain('href="../../favicon.svg"')
    expect(nested).toContain('href="../../manifest.webmanifest"')
    expect(nested).toContain('href="https://qrforge-bd.vercel.app/how-to/size-a-qr-code"')
  })

  it('escapes copy correctly', () => {
    const nasty = renderDocument({
      title: 'A & B <script>',
      description: 'quote " test',
      path: '/x',
      body: '',
      jsonld: '{}',
      cssHref: './a.css',
    })
    expect(nasty).toContain('<title>A &amp; B &lt;script&gt;</title>')
    expect(nasty).toContain('content="quote &quot; test"')
  })
})

describe('landing structured data', () => {
  const route = LANDING_ROUTES[1]
  const graph = buildLandingStructuredData(route, '1.5.0') as unknown as {
    '@context': string
    '@graph': Record<string, any>[]
  }

  it('describes the page, its breadcrumb, its how-to and its FAQ', () => {
    expect(graph['@context']).toBe('https://schema.org')
    expect(graph['@graph'].map((n) => n['@type'])).toEqual(['WebPage', 'BreadcrumbList', 'HowTo', 'FAQPage'])
    const page = graph['@graph'][0]
    expect(page.url).toBe(`https://qrforge-bd.vercel.app${route.path}`)
    expect(page.isPartOf['@id']).toBe('https://qrforge-bd.vercel.app/#website')
    expect(graph['@graph'][3].mainEntity).toHaveLength(route.faq.length)
  })

  it('escapes script-breaking characters', () => {
    const json = serialize({ evil: '</script><img src=x>' })
    expect(json).not.toContain('</script')
    expect(json).not.toContain('<')
    expect(JSON.parse(json).evil).toBe('</script><img src=x>')
  })
})
