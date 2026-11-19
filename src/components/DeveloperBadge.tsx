import { Heart } from 'lucide-react'
import { DEVELOPER } from '../data/developer'

/**
 * “Crafted by Rony Siddiqi” trigger.
 * `inline` sits in the footer, `rail` in the desktop icon rail, `meta` in the
 * small mono link rows. All three open the developer profile sheet.
 */
export default function DeveloperBadge({
  onClick,
  variant = 'inline',
  className = '',
}: {
  onClick: () => void
  variant?: 'inline' | 'rail' | 'meta'
  className?: string
}) {
  if (variant === 'rail') {
    return (
      <button
        onClick={onClick}
        aria-label={`Developer profile — ${DEVELOPER.name}`}
        title={`Crafted by ${DEVELOPER.name}`}
        className="group relative flex h-8 w-8 items-center justify-center rounded-md border border-line bg-elevated font-mono text-[10px] font-bold tracking-tight text-accent-strong transition-colors hover:border-accent/50 hover:bg-inset"
      >
        {DEVELOPER.initials}
        <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-danger/90 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Heart size={7} fill="currentColor" aria-hidden="true" />
        </span>
      </button>
    )
  }

  if (variant === 'meta') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 font-mono uppercase tracking-[0.1em] text-subtle transition-colors hover:text-fg ${className}`}
      >
        <Heart size={9} className="text-danger" fill="currentColor" aria-hidden="true" /> developer
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      title={`Open the profile of ${DEVELOPER.name}`}
      className={`group inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 text-left transition-colors hover:border-accent/50 hover:bg-elevated ${className}`}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-[8.5px] font-bold text-accent-strong ring-1 ring-accent/20 transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
        aria-hidden="true"
      >
        {DEVELOPER.initials}
      </span>
      <span className="truncate text-[10.5px] text-muted">
        Crafted with{' '}
        <Heart
          size={9}
          fill="currentColor"
          className="inline-block -translate-y-px text-danger transition-transform duration-200 group-hover:scale-125"
          aria-hidden="true"
        />{' '}
        by <strong className="font-semibold text-fg group-hover:text-accent-strong">{DEVELOPER.name}</strong>
      </span>
    </button>
  )
}
