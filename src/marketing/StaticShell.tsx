/**
 * The crawlable shell.
 *
 * Rendered to HTML at build time and dropped inside `#root`, so a crawler that
 * never runs JavaScript — Bing's lighter fetcher, GPTBot, ClaudeBot,
 * PerplexityBot, every social scraper — still gets the headline, the type list,
 * the feature set, the how-to and the FAQ. React wipes the shell on boot and
 * paints the real studio on top, so users see the same thing a moment later.
 *
 * Rules for this file:
 *   • no hooks, no browser APIs, no imports from components/ (server-safe only)
 *   • every string comes from `src/marketing/content.ts` or `src/data/*`
 *   • it must stay truthful — this is the content search engines index
 */
import { DEVELOPER } from '../data/developer'
import { REPO } from '../data/repo'
import { QR_TYPES } from '../data/qrTypes'
import { FAQ, FEATURES, HOW_TO, SITE, SUMMARY } from './content'
import { typesByCategory } from './structuredData'
import { LANDING_ROUTES } from './routes'
import { SiteFooter, SiteHeader } from './Chrome'

export default function StaticShell() {
  const groups = typesByCategory()

  return (
    <div className="min-h-screen bg-canvas font-sans text-fg">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <SiteHeader home="./" />

      <main id="content" className="mx-auto max-w-5xl px-4 pb-16">
        <section className="pt-10 sm:pt-14">
          <p className="badge badge-run inline-flex items-center gap-1.5">
            <span className="live-dot scale-75" /> free · no sign-up · offline
          </p>
          <h1 className="mt-4 max-w-[22ch] text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[44px]">
            Free QR code generator with logo, WiFi and vCard support
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-muted">{SUMMARY}</p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            <div><dt className="inline">Types: </dt><dd className="inline text-fg">{QR_TYPES.length}</dd></div>
            <div><dt className="inline">Export formats: </dt><dd className="inline text-fg">8</dd></div>
            <div><dt className="inline">Uploaded bytes: </dt><dd className="inline text-fg">0</dd></div>
            <div><dt className="inline">Price: </dt><dd className="inline text-fg">free, forever</dd></div>
          </dl>
        </section>

        <section id="types" className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
            {QR_TYPES.length} QR code types, one studio
          </h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
            Pick a format, fill in the fields and the code renders live. Every type exports in all eight
            formats and passes through the same scan-safety check.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div key={group.category} className="rounded-xl border border-line bg-surface p-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{group.category}</h3>
                <ul className="mt-2 space-y-1 text-[13px] text-fg">
                  {group.labels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">What you get</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="rounded-xl border border-line bg-surface p-4">
                <h3 className="text-[14px] font-semibold text-fg">{f.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-to" className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">{HOW_TO.name}</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">{HOW_TO.description}</p>
          <ol className="mt-6 space-y-3">
            {HOW_TO.steps.map((step, i) => (
              <li key={step.name} className="flex gap-3 rounded-xl border border-line bg-surface p-4">
                <span className="mt-0.5 font-mono text-[11px] text-accent-strong">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-[13.5px] font-semibold text-fg">{step.name}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="faq" className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-4 py-3">
                <summary className="cursor-pointer list-none text-[13.5px] font-semibold text-fg marker:hidden">
                  {item.q}
                </summary>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="guides" className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">Guides by QR code type</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
            One page per type: what it holds, how big to print it, and where it actually gets used.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {LANDING_ROUTES.map((r) => (
              <li key={r.path}>
                <a
                  href={`./${r.path.replace(/^\//, "")}`}
                  className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
                >
                  <span className="block text-[13.5px] font-semibold text-fg">{r.navLabel}</span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-muted">{r.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section id="about" className="mt-14 rounded-xl border border-line bg-surface p-5">
          <h2 className="text-[16px] font-semibold text-fg">Built by {DEVELOPER.name}</h2>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted">
            {DEVELOPER.role} in {DEVELOPER.location}. {DEVELOPER.bio}
          </p>
          <p className="mt-3 text-[12px] text-muted">
            Source code:{' '}
            <a className="text-accent-strong underline decoration-line-strong underline-offset-2 hover:decoration-current" href={REPO.url} rel="noreferrer">
              {REPO.label}
            </a>{' '}
            · MIT licensed · {SITE.name} keeps no logs and uploads nothing.
          </p>
        </section>
      </main>

      <SiteFooter home="./" />
    </div>
  )
}
