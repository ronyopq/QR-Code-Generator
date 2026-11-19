import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Watches for the "stylesheet never applied" failure mode.
 *
 * The design system paints the app through CSS custom properties on `:root`.
 * If the stylesheet request fails (offline, stale cache, blocked asset, a dead
 * dev-server HMR state) the markup still renders, but every colour resolves to
 * nothing and the page looks broken instead of saying why. This probe detects
 * that — an unpainted body — and offers a one-click reload.
 */
export default function StylesGuard() {
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // jsdom / SSR have no layout or stylesheet pipeline; stay quiet there.
    if (typeof window === 'undefined' || /jsdom/i.test(navigator.userAgent)) return

    const check = () => {
      const bg = getComputedStyle(document.body).backgroundColor
      const root = getComputedStyle(document.documentElement)
      const token = root.getPropertyValue('--c-canvas').trim()
      const transparent = !bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)'
      // Both signals must agree before we accuse the browser.
      setFailed(transparent && token === '')
    }

    const raf = window.requestAnimationFrame(() => window.setTimeout(check, 250))
    const onLoad = () => window.setTimeout(check, 150)
    window.addEventListener('load', onLoad)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  if (!failed) return null

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-[200] mx-auto flex max-w-md items-start gap-2.5 rounded-xl border border-line bg-elevated p-3 shadow-lift sm:right-4 sm:left-auto"
    >
      <AlertTriangle size={16} className="mt-px shrink-0 text-warn" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-fg">Styles didn't load</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          The page loaded without its stylesheet — usually a stale cache. Reload to fix it.
        </p>
      </div>
      <button
        onClick={() => {
          setBusy(true)
          window.location.reload()
        }}
        disabled={busy}
        className="btn-primary shrink-0 !px-2.5 !py-1.5 !text-[11px]"
      >
        <RefreshCw size={12} className={busy ? 'animate-spin' : undefined} />
        Reload
      </button>
    </div>
  )
}
