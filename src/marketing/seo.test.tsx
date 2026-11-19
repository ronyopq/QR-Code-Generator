import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import StaticShell from './StaticShell'
import { FAQ, FEATURES, HOW_TO, SITE, SUMMARY, absolute } from './content'
import { buildStructuredData, serializeStructuredData, typesByCategory } from './structuredData'
import { QR_TYPES } from '../data/qrTypes'

describe('SEO copy', () => {
  it('keeps the title and description inside what search engines display', () => {
    expect(SITE.title.length).toBeLessThanOrEqual(60)
    expect(SITE.description.length).toBeGreaterThan(110)
    expect(SITE.description.length).toBeLessThanOrEqual(160)
  })

  it('uses one absolute canonical host everywhere', () => {
    expect(SITE.url.startsWith('https://')).toBe(true)
    expect(SITE.url.endsWith('/')).toBe(false)
    expect(absolute('/')).toBe(`${SITE.url}/`)
    expect(absolute('og.png')).toBe(`${SITE.url}/og.png`)
    expect(SITE.ogImage.startsWith('/')).toBe(true)
  })

  it('claims exactly the number of types the data actually has', () => {
    expect(QR_TYPES).toHaveLength(20)
    expect(SUMMARY).toContain('20 QR types')
    expect(FEATURES[0].title).toBe('20 QR code types')
  })

  it('writes answers worth quoting, not one-liners', () => {
    expect(FAQ.length).toBeGreaterThanOrEqual(6)
    for (const f of FAQ) {
      expect(f.q.trim().endsWith('?')).toBe(true)
      expect(f.a.length).toBeGreaterThan(60)
      expect(f.a).not.toMatch(/\bTBD\b|lorem ipsum/i)
    }
  })

  it('has a four-step how-to with real text', () => {
    expect(HOW_TO.steps).toHaveLength(4)
    for (const s of HOW_TO.steps) expect(s.text.length).toBeGreaterThan(30)
  })
})

describe('structured data', () => {
  const graph = buildStructuredData('1.2.3') as unknown as {
    '@context': string
    '@graph': Record<string, any>[]
  }
  const byType = (t: string) => graph['@graph'].find((n) => n['@type'] === t)!

  it('emits one connected graph instead of loose blocks', () => {
    expect(graph['@context']).toBe('https://schema.org')
    expect(graph['@graph'].map((n) => n['@type'])).toEqual([
      'WebSite',
      'Organization',
      'Person',
      'SoftwareApplication',
      'FAQPage',
      'HowTo',
    ])
  })

  it('never emits a relative URL', () => {
    const urls: string[] = []
    const walk = (node: unknown) => {
      if (typeof node === 'string') {
        if (/^(https?:)?\/\//.test(node) || node.startsWith('/')) urls.push(node)
        return
      }
      if (Array.isArray(node)) return node.forEach(walk)
      if (node && typeof node === 'object') return Object.values(node).forEach(walk)
    }
    walk(graph)
    expect(urls.length).toBeGreaterThan(5)
    for (const u of urls) expect(u.startsWith('https://')).toBe(true)
  })

  it('marks the app free, MIT and versioned from package.json', () => {
    const app = byType('SoftwareApplication')
    expect(app.offers).toMatchObject({ price: '0', priceCurrency: 'USD' })
    expect(app.softwareVersion).toBe('1.2.3')
    expect(app.isAccessibleForFree).toBe(true)
    expect(app.license).toContain('mit')
    expect(app.codeRepository).toContain('github.com')
    expect(app.featureList).toHaveLength(FEATURES.length)
  })

  it('names the creator and links every real profile, skipping the empty WhatsApp placeholder', () => {
    const person = byType('Person')
    expect(person.name).toBe('Rony Siddiqi')
    expect(person.sameAs).toContain('https://facebook.com/RonySiddiqi')
    expect(person.sameAs).toContain('https://x.com/RonySiddiqi')
    expect(person.sameAs.some((u: string) => u === 'https://wa.me/')).toBe(false)
  })

  it('mirrors the FAQ one-for-one', () => {
    expect(byType('FAQPage').mainEntity).toHaveLength(FAQ.length)
    expect(byType('FAQPage').mainEntity[0].acceptedAnswer.text).toBe(FAQ[0].a)
  })

  it('cannot break out of the script tag', () => {
    const json = serializeStructuredData('1.0.0')
    expect(json).not.toContain('</script')
    expect(json).not.toContain('<')
    expect(() => JSON.parse(json.replace(/\\u003c/g, '<'))).not.toThrow()
  })
})

describe('static shell (what crawlers actually read)', () => {
  const html = renderToStaticMarkup(<StaticShell />)

  it('has one h1, the summary and every FAQ question', () => {
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toContain('Free QR code generator')
    for (const f of FAQ) expect(html).toContain(f.q)
  })

  it('lists all 20 types grouped by category, with no empty group', () => {
    const groups = typesByCategory()
    expect(groups.reduce((n, g) => n + g.labels.length, 0)).toBe(QR_TYPES.length)
    for (const g of groups) {
      expect(g.labels.length).toBeGreaterThan(0)
      for (const label of g.labels) expect(html).toContain(label)
    }
  })

  it('carries internal anchors and the real source link', () => {
    for (const anchor of ['#types', '#how-to', '#faq']) expect(html).toContain(`href="${anchor}"`)
    expect(html).toContain(`href="${SITE.repo}"`)
  })

  it('stays JavaScript-free so it can render on a server', () => {
    expect(html).not.toContain('onClick')
    expect(html).not.toContain('undefined')
  })
})
