import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Check, type LucideIcon } from 'lucide-react'

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Card with an optional hairline header strip. */
export function Panel({
  children,
  className,
  head,
}: {
  children: React.ReactNode
  className?: string
  head?: { label: string; icon?: LucideIcon; right?: React.ReactNode }
}) {
  return (
    <section className={cx('overflow-hidden rounded-2xl border border-line bg-surface shadow-card', className)}>
      {head && (
        <header className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
          {head.icon && <head.icon size={13} className="text-accent-strong" strokeWidth={1.75} />}
          <h2 className="font-sans text-[11.5px] font-semibold tracking-[-0.005em] text-muted">{head.label}</h2>
          <div className="ml-auto flex items-center gap-1.5">{head.right}</div>
        </header>
      )}
      {children}
    </section>
  )
}

/** Section marker: index + title + rule. */
export function SectionHead({
  index,
  title,
  hint,
  right,
  done,
}: {
  index: string
  title: string
  hint?: string
  right?: React.ReactNode
  done?: boolean
}) {
  return (
    <div className="mb-3 flex items-end gap-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-accent-strong">{index}</span>
        {done && <span className="mb-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-on-accent"><Check size={9} strokeWidth={3} /></span>}
        <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.08em] text-fg">{title}</h2>
        {hint && <span className="hidden font-sans text-[11px] text-muted sm:inline">{hint}</span>}
      </div>
      <div className="mb-1.5 h-px flex-1 bg-line" />
      {right}
    </div>
  )
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cx('block', className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-sans text-[11px] leading-relaxed text-muted">{hint}</span>}
    </label>
  )
}

/** Segmented chip row used across the customizer. */
export function ChipRow<T extends string>({
  options, value, onPick, columns,
}: { options: { value: T; label: string }[]; value: T; onPick: (v: T) => void; columns?: boolean }) {
  return (
    <div className={cx('flex flex-wrap gap-1.5', columns && 'grid grid-cols-3 gap-1.5')}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onPick(o.value)}
          aria-pressed={value === o.value}
          className={cx('chip justify-center', value === o.value ? 'chip-active' : 'chip-idle')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Swatch({ color, label, value, onChange }: { color: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="group cursor-pointer">
      <span className="label">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-line bg-elevated px-2 py-1.5 transition-colors group-hover:border-line-strong">
        <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md ring-1 ring-inset ring-white/15" style={{ background: value }}>
          <input
            type="color"
            aria-label={`${label} colour`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -left-2 -top-2 h-12 w-12 cursor-pointer opacity-0"
          />
        </span>
        <span className="truncate font-mono text-[10.5px] uppercase text-muted">{value}</span>
        <span className="sr-only">{color}</span>
      </span>
    </label>
  )
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-[13px] font-semibold text-fg">{value}</span>
      <span className="font-sans text-[11px] text-muted">{label}</span>
    </div>
  )
}
