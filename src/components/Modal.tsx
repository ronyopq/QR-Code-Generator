import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

export default function Modal({ open, onClose, title, description, icon, children, footer, size = 'md' }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    lastFocus.current = document.activeElement as HTMLElement
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusables?.[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab' || !focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      lastFocus.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[115] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-canvas/70 backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${SIZES[size]} animate-pop overflow-hidden rounded-2xl border border-line bg-surface shadow-pop  `}
      >
        <div className="flex items-start gap-3 border-b border-line p-4">
          {icon && <div className="mt-0.5 text-accent-strong">{icon}</div>}
          <div className="min-w-0 flex-1">
            <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-fg">{title}</h2>
            {description && <p className="mt-1.5 font-sans text-[12px] leading-relaxed text-muted">{description}</p>}
          </div>
          <button onClick={onClose} className="icon-btn !h-7 !w-7" aria-label="Close dialog"><X size={14} /></button>
        </div>
        {children && <div className="p-4">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-elevated/50 p-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
