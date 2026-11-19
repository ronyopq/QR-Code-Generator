/**
 * The same FAQ / how-to that search engines and AI assistants read from the
 * prerendered shell — but here inside the studio, after React has taken over.
 *
 * Keeping it in the app matters for two reasons:
 *   1. FAQPage / HowTo structured data must describe content a human can
 *      actually see on the rendered page, not only in the static HTML.
 *   2. It answers the questions this tool really gets asked (size, logo,
 *      expiry) right where the person is working.
 *
 * Copy comes from `src/marketing/content.ts` — one source, no drift.
 */
import { ChevronDown, HelpCircle } from 'lucide-react'
import { FAQ, HOW_TO } from '../marketing/content'

export default function FaqSection() {
  return (
    <section id="faq" className="grid gap-2.5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-xl border border-line bg-surface p-4">
        <h2 className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-subtle">
          <HelpCircle size={11} aria-hidden="true" /> {HOW_TO.name}
        </h2>
        <ol className="mt-3 flex flex-col gap-3">
          {HOW_TO.steps.map((step, i) => (
            <li key={step.name} className="flex gap-2.5">
              <span className="mt-0.5 shrink-0 font-mono text-[10px] text-accent-strong">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block font-sans text-[12px] font-semibold text-fg">{step.name}</span>
                <span className="mt-0.5 block font-sans text-[11.5px] leading-relaxed text-muted">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <h2 className="border-b border-line px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-subtle">
          Frequently asked
        </h2>
        <div className="divide-y divide-line">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-4 py-2.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-sans text-[12px] font-semibold text-fg marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown
                  size={12}
                  aria-hidden="true"
                  className="shrink-0 text-subtle transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="mt-1.5 font-sans text-[11.5px] leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
