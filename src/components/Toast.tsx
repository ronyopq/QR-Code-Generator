import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Bookmark, CheckCircle2, Info, X } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'info' | 'bookmark'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: { label: string; onClick: () => void }
}

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
  duration: number
  action?: ToastOptions['action']
  leaving?: boolean
}

interface ToastApi {
  push: (t: ToastOptions) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const VARIANT: Record<ToastVariant, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: 'text-accent-strong' },
  error: { icon: AlertTriangle, color: 'text-danger' },
  info: { icon: Info, color: 'text-muted' },
  bookmark: { icon: Bookmark, color: 'text-amber-400' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) window.clearTimeout(timer)
    timers.current.delete(id)
    setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 160)
  }, [])

  const push = useCallback(
    (t: ToastOptions) => {
      const id = ++counter.current
      const duration = t.duration ?? (t.action ? 7000 : 4200)
      setItems((list) => [...list.slice(-2), {
        id,
        title: t.title,
        description: t.description,
        variant: t.variant ?? 'info',
        duration,
        action: t.action,
      }])
      if (duration > 0) timers.current.set(id, window.setTimeout(() => dismiss(id), duration))
      return id
    },
    [dismiss],
  )

  const api = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:items-end sm:p-0">
          <div aria-live="polite" className="flex w-full max-w-[22rem] flex-col gap-2">
            {items.map((t) => {
              const v = VARIANT[t.variant]
              const Icon = v.icon
              return (
                <div
                  key={t.id}
                  className={`pointer-events-auto overflow-hidden rounded-xl border border-line bg-surface/95 shadow-pop backdrop-blur-md   ${t.leaving ? 'opacity-0 transition-opacity duration-150' : 'animate-toast-in'}`}
                >
                  <div className="flex items-start gap-2.5 p-3">
                    <Icon size={15} className={`mt-0.5 shrink-0 ${v.color}`} strokeWidth={1.9} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.06em] text-fg">{t.title}</p>
                      {t.description && <p className="mt-1 font-sans text-[11.5px] leading-relaxed text-muted">{t.description}</p>}
                      {t.action && (
                        <button
                          onClick={() => { t.action?.onClick(); dismiss(t.id) }}
                          className="mt-1.5 font-mono text-[10.5px] uppercase tracking-wide text-accent-strong underline-offset-4 hover:underline"
                        >
                          {t.action.label}
                        </button>
                      )}
                    </div>
                    <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="rounded p-0.5 text-subtle transition-colors hover:text-fg">
                      <X size={12} />
                    </button>
                  </div>
                  {t.duration > 0 && (
                    <div className="h-px w-full bg-line">
                      <div className="h-full bg-accent/70" style={{ animation: `toastBar ${t.duration}ms linear forwards` }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
