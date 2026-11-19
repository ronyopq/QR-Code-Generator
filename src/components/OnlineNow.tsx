import { useEffect, useRef, useState } from 'react'
import { Activity, Users } from 'lucide-react'
import { formatCount, usePresence } from '../lib/presence'

export default function OnlineNow({ compact = false }: { compact?: boolean }) {
  const { online, tabs, updatedAt } = usePresence()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const seconds = Math.max(0, Math.round((Date.now() - updatedAt) / 1000))

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${online} people online now — view details`}
        className="flex items-center gap-2 rounded-lg border border-line bg-elevated px-2 py-1.5 transition-colors hover:border-line-strong :border-line-strong"
      >
        <span className="live-dot" />
        <span className="font-mono text-[11px] font-semibold tabular-nums text-fg">{formatCount(online)}</span>
        {!compact && <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted sm:inline">online</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 animate-pop overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            <Users size={12} className="text-accent-strong" />
            <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">live usage</p>
          </div>
          <div className="p-3">
            <p className="font-mono text-3xl font-semibold leading-none tracking-tight text-fg">{online}</p>
            <p className="mt-1 font-sans text-[11px] leading-relaxed text-muted">estimated people generating QR codes right now</p>
            <div className="my-2.5 h-px bg-line" />
            <div className="space-y-1 font-mono text-[9.5px] uppercase tracking-wide text-muted">
              <p className="flex justify-between"><span className="inline-flex items-center gap-1"><Activity size={9} /> your tabs</span><span className="text-fg">{tabs}</span></p>
              <p className="flex justify-between"><span>refreshed</span><span className="text-fg">{seconds}s ago</span></p>
            </div>
            <p className="mt-2.5 rounded-md bg-elevated p-2 font-sans text-[10px] leading-relaxed text-subtle">
              No backend, so this is a client-side estimate. Swap in real presence in one line — see the README.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
