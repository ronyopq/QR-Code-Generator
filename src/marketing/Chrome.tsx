/**
 * Shared chrome for every prerendered page — the home shell and the per-type
 * landing pages. Server-safe (no hooks, no browser APIs).
 *
 * Links are relative (`../vcard-qr-code`) so the same HTML works on both hosts:
 * https://qrforge-bd.vercel.app/ and https://ronyopq.github.io/QR-Code-Generator/.
 */
import { REPO } from '../data/repo'
import { SITE } from './content'

export function SiteHeader({ home = '../' }: { home?: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <a href={home} className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-semibold tracking-[0.14em] text-fg">QRFORGE</span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-subtle sm:inline">
            free QR code studio
          </span>
        </a>
        <nav aria-label="Primary" className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <a className="hover:text-fg" href={home}>Studio</a>
          <a className="hover:text-fg" href={`${home}#types`}>Types</a>
          <a className="hover:text-fg" href={`${home}#faq`}>FAQ</a>
          <a className="hidden hover:text-fg sm:inline" href={REPO.url} rel="noreferrer">Source</a>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter({ home = '../' }: { home?: string }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        <span>{SITE.name} · free forever · MIT · no backend</span>
        <span className="flex items-center gap-3">
          <a className="hover:text-fg" href={home}>studio</a>
          <a className="hover:text-fg" href={`${home}#faq`}>faq</a>
          <a className="hover:text-fg" href={REPO.url} rel="noreferrer">source</a>
        </span>
      </div>
    </footer>
  )
}

/** Call-to-action band used at the end of every landing page. */
export function StudioCta({ href, label, detail }: { href: string; label: string; detail: string }) {
  return (
    <section className="mt-12 rounded-xl border border-line bg-surface p-5">
      <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-fg">{label}</h2>
      <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">{detail}</p>
      <a href={href} className="btn-primary mt-4">
        Open the studio
        <span aria-hidden="true" className="ml-1.5">→</span>
      </a>
      <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-subtle">
        no sign-up · nothing uploaded · works offline
      </p>
    </section>
  )
}
