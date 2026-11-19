/**
 * A single landing page, rendered to static HTML at build time and shipped with
 * NO JavaScript bundle — the fastest possible page for both crawlers and people
 * on a slow phone. The only interactive thing it does is link into the studio
 * with the right type preselected (`../?type=wifi`).
 *
 * Server-safe: no hooks, no browser APIs.
 */
import { SiteFooter, SiteHeader, StudioCta } from './Chrome'
import type { LandingRoute } from './routes'
import { findRoute } from './routes'
import { SITE } from './content'

/**
 * Relative prefixes, so the same file works at `qrforge-bd.vercel.app/wifi-qr-code/`
 * and at `ronyopq.github.io/QR-Code-Generator/wifi-qr-code/`.
 *
 * `/wifi-qr-code` lives one directory deep → `../`; `/how-to/print-qr-codes`
 * lives two → `../../`.
 */
export function depth(path: string): number {
  return path.split('/').filter(Boolean).length
}

/** The studio's URL as seen from this page. */
export function studioHref(path: string, typeId?: string): string {
  const up = '../'.repeat(depth(path))
  return typeId ? `${up}?type=${typeId}` : up
}

/** Absolute-in-site path → path relative to the page being rendered. */
export function rel(from: string, to: string): string {
  return '../'.repeat(depth(from)) + to.replace(/^\//, '')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function humanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export default function LandingPage({ route }: { route: LandingRoute }) {
  const related = route.related.map(findRoute).filter((r): r is LandingRoute => Boolean(r))

  return (
    <div className="min-h-screen bg-canvas font-sans text-fg">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="content" className="mx-auto max-w-3xl px-4 pb-16">
        <nav aria-label="Breadcrumb" className="pt-5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-subtle">
          <ol className="flex items-center gap-1.5">
            <li>
              <a className="hover:text-fg" href={'../'.repeat(depth(route.path))}>QRForge</a>
            </li>
            <li aria-hidden="true">/</li>
            {route.group && (
              <>
                <li className="text-muted">{route.group}</li>
                <li aria-hidden="true">/</li>
              </>
            )}
            <li aria-current="page" className="text-muted">{route.navLabel}</li>
          </ol>
        </nav>

        <article className="pt-5">
          <h1 className="max-w-[26ch] text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[38px]">
            {route.h1}
          </h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted sm:text-[15px]">{route.lede}</p>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-subtle">
            <span>free · no sign-up</span>
            <span aria-hidden="true">·</span>
            <span>nothing uploaded</span>
            <span aria-hidden="true">·</span>
            <span>
              updated <time dateTime={route.updated}>{humanDate(route.updated)}</time>
            </span>
          </p>

          {route.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="text-[19px] font-semibold tracking-[-0.02em] sm:text-[22px]">{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="mt-3 text-[14px] leading-[1.75] text-muted">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted marker:text-subtle">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mt-10 rounded-xl border border-line bg-surface p-5">
            <h2 className="text-[17px] font-semibold text-fg">{route.howTo.name}</h2>
            <ol className="mt-3 space-y-2.5">
              {route.howTo.steps.map((step, i) => (
                <li key={step.name} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] text-accent-strong">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-semibold text-fg">{step.name}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section id="faq" className="mt-10">
            <h2 className="text-[19px] font-semibold tracking-[-0.02em] sm:text-[22px]">
              {route.faqHeading ?? `${route.navLabel} questions`}
            </h2>
            <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
              {route.faq.map((item) => (
                <details key={item.q} className="group px-4 py-3">
                  <summary className="cursor-pointer list-none text-[13.5px] font-semibold text-fg marker:hidden [&::-webkit-details-marker]:hidden">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-subtle">{route.relatedHeading ?? 'More QR codes'}</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.path}>
                    <a
                      href={rel(route.path, r.path)}
                      className="block rounded-lg border border-line bg-surface p-3 transition-colors hover:border-line-strong"
                    >
                      <span className="block text-[13px] font-semibold text-fg">{r.navLabel}</span>
                      <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">{r.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <StudioCta
            href={studioHref(route.path, route.typeId)}
            label={route.ctaLabel ?? 'Make a QR code'}
            detail={
              route.typeId
                ? 'The studio opens with this type preselected and the fields ready. Everything renders in your browser — no account, no upload, no watermark.'
                : 'The studio opens with the fields ready. Everything renders in your browser — no account, no upload, no watermark.'
            }
          />

          <p className="mt-8 font-mono text-[9.5px] uppercase tracking-[0.14em] text-subtle">
            {SITE.name} · MIT licensed · {SITE.url.replace('https://', '')}
          </p>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
