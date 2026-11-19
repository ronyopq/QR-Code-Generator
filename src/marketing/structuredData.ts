/**
 * JSON-LD graph — built from `content.ts`, `qrTypes` and `developer.ts` so the
 * structured data can never drift from the visible copy.
 *
 * One @graph instead of six separate <script> blocks: Google, Bing and the
 * answer engines all read a graph more reliably, and cross-references (@id)
 * tie the app, the publisher and the author together as one entity.
 */
import { DEVELOPER } from '../data/developer'
import { REPO } from '../data/repo'
import { QR_TYPES } from '../data/qrTypes'
import { FAQ, FEATURES, HOW_TO, SITE, SUMMARY, absolute } from './content'
import type { LandingRoute } from './routes'

export type JsonLd = Record<string, unknown>

const LOGO = absolute('/icons/icon-512.png')

/** Social profiles that actually exist (the WhatsApp placeholder is skipped). */
function sameAs(): string[] {
  return DEVELOPER.socials
    .map((s) => s.url)
    .filter((u) => u && u !== 'https://wa.me/' && u !== 'https://wa.me')
}

export function buildStructuredData(version: string): JsonLd {
  const orgId = `${SITE.url}/#organization`
  const siteId = `${SITE.url}/#website`
  const personId = `${SITE.url}/#author`
  const appId = `${SITE.url}/#app`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: absolute('/'),
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en',
        publisher: { '@id': orgId },
      },
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE.name,
        url: absolute('/'),
        logo: { '@type': 'ImageObject', url: LOGO, width: 512, height: 512 },
        description: SUMMARY,
        founder: { '@id': personId },
        sameAs: sameAs(),
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: DEVELOPER.name,
        alternateName: DEVELOPER.handle,
        jobTitle: DEVELOPER.role,
        description: DEVELOPER.bio,
        url: 'https://ronysiddiqi.wordpress.com',
        address: { '@type': 'PostalAddress', addressLocality: 'Chattogram', addressCountry: 'BD' },
        knowsAbout: [...DEVELOPER.focus, ...DEVELOPER.skills.slice(0, 6)],
        sameAs: sameAs(),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': appId,
        name: `${SITE.name} — QR Code Generator`,
        alternateName: 'QRForge QR Code Generator',
        url: absolute('/'),
        description: SUMMARY,
        applicationCategory: 'UtilitiesApplication',
        applicationSubCategory: 'QR code generator',
        operatingSystem: 'Any device with a modern web browser',
        browserRequirements: 'Requires JavaScript. Works offline once installed.',
        softwareVersion: version,
        isAccessibleForFree: true,
        license: 'https://opensource.org/license/mit',
        codeRepository: REPO.url,
        image: absolute(SITE.ogImage),
        screenshot: absolute(SITE.ogImage),
        author: { '@id': personId },
        publisher: { '@id': orgId },
        featureList: FEATURES.map((f) => f.title),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        potentialAction: {
          '@type': 'CreateAction',
          name: 'Create a QR code',
          target: absolute('/'),
          result: { '@type': 'CreativeWork', name: 'QR code image' },
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE.url}/#faq`,
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'HowTo',
        '@id': `${SITE.url}/#howto`,
        name: HOW_TO.name,
        description: HOW_TO.description,
        totalTime: 'PT3M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: 0 },
        tool: [{ '@type': 'HowToTool', name: 'A web browser' }],
        step: HOW_TO.steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
          url: `${SITE.url}/#how-to`,
        })),
      },
    ],
  }
}

/** Safe to inline in a <script> tag: no `</script>` or HTML comment can escape. */
export function serializeStructuredData(version: string): string {
  return JSON.stringify(buildStructuredData(version))
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/** Types grouped by category, used by the visible static shell. */
export function typesByCategory(): { category: string; labels: string[] }[] {
  const map = new Map<string, string[]>()
  for (const t of QR_TYPES) {
    const list = map.get(t.category) ?? []
    list.push(t.label)
    map.set(t.category, list)
  }
  return [...map.entries()].map(([category, labels]) => ({ category, labels }))
}

/**
 * Structured data for one landing page: the page itself, how it sits under the
 * site, its breadcrumb, its type-specific how-to and its FAQ. Cross-references
 * use absolute @ids so the graph joins up with the home page's entities.
 */
export function buildLandingStructuredData(route: LandingRoute, version: string): JsonLd {
  const pageUrl = absolute(route.path)
  const graph: JsonLd[] = [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: route.h1,
      headline: route.title,
      description: route.description,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE.url}/#website` },
      about: { '@id': `${SITE.url}/#app` },
      primaryImageOfPage: { '@type': 'ImageObject', url: absolute(`/og${route.path}.png`), width: 1200, height: 630 },
      datePublished: route.updated,
      dateModified: route.updated,
      publisher: { '@id': `${SITE.url}/#organization` },
      author: { '@id': `${SITE.url}/#author` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: absolute('/') },
        { '@type': 'ListItem', position: 2, name: route.navLabel, item: pageUrl },
      ],
    },
    {
      '@type': 'HowTo',
      '@id': `${pageUrl}#howto`,
      name: route.howTo.name,
      description: route.description,
      totalTime: 'PT3M',
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: 0 },
      tool: [{ '@type': 'HowToTool', name: 'A web browser' }],
      step: route.howTo.steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
        url: `${pageUrl}#howto`,
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      isPartOf: { '@id': `${pageUrl}#webpage` },
      mainEntity: route.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]

  return { '@context': 'https://schema.org', '@graph': graph }
}

/** Safe inline JSON for a <script> tag. */
export function serialize(value: JsonLd): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
