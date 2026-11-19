import { ArrowUpRight, LayoutTemplate } from 'lucide-react'
import { TEMPLATES } from '../data/templates'
import type { QRConfig } from '../types'
import { SectionHead } from './ui'

export default function TemplateLibrary({ onApply }: { onApply: (cfg: QRConfig) => void }) {
  return (
    <div className="animate-fade-up">
      <SectionHead index="[ T ]" title="Templates" hint="one-click starting points" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onApply(t.apply({} as QRConfig))}
            className="group relative overflow-hidden rounded-2xl border border-line bg-surface text-left transition-colors hover:border-accent/40 :border-accent/40"
          >
            <div className={`relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br ${t.gradient}`}>
              <div className="absolute inset-0 module-grid opacity-40" aria-hidden />
              <span className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">preset {String(i + 1).padStart(2, '0')}</span>
              <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/25 text-white ring-1 ring-inset ring-white/25">
                <LayoutTemplate size={14} />
              </span>
            </div>
            <div className="p-3.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[12px] font-semibold uppercase tracking-wide text-fg">{t.name}</p>
                  <p className="mt-0.5 line-clamp-2 font-sans text-[11.5px] leading-relaxed text-muted">{t.desc}</p>
                </div>
                <ArrowUpRight size={14} className="shrink-0 text-subtle transition-colors group-hover:text-accent-strong" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
