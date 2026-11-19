import { useEffect, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Expand, Hash, Maximize2, QrCode, RotateCcw, ScanLine, ZoomIn, ZoomOut } from 'lucide-react'
import type { QRConfig } from '../types'
import { toStylingOptions } from '../lib/qr'
import { cx } from './ui'
import { useI18n } from '../lib/i18n'

interface Props {
  config: QRConfig
  payload: string
  onReady?: (qr: QRCodeStyling) => void
}

export default function QRPreview({ config, payload, onReady }: Props) {
  const { t } = useI18n()
  const mountRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isFs, setIsFs] = useState(false)
  const [error, setError] = useState('')
  const empty = !payload.trim()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (!payload.trim()) {
      mount.innerHTML = ''
      qrRef.current = null
      setError('')
      return
    }
    try {
      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling(toStylingOptions(config, payload))
        qrRef.current.append(mount)
        onReady?.(qrRef.current)
      } else {
        qrRef.current.update(toStylingOptions(config, payload))
      }
      setError('')
    } catch (e) {
      console.error('[QRForge] QR render failed:', e)
      setError(e instanceof Error ? e.message : 'Could not render this QR code.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, payload])

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFs = async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await wrapRef.current?.requestFullscreen?.()
  }

  const btn = 'flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-inset hover:text-fg  '

  return (
    <section ref={wrapRef} className="overflow-hidden rounded-2xl border border-line bg-surface">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <ScanLine size={13} className="text-accent-strong" strokeWidth={1.75} />
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{t('preview.title')}</h2>
        <span className="ml-1 hidden items-center gap-1 rounded bg-inset px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-muted sm:flex">
          <span className="live-dot scale-75" /> {t('preview.live')}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <button className={btn} onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} aria-label={t('preview.zoomOut')}><ZoomOut size={14} /></button>
          <span className="w-10 text-center font-mono text-[10px] text-muted">{Math.round(zoom * 100)}%</span>
          <button className={btn} onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))} aria-label={t('preview.zoomIn')}><ZoomIn size={14} /></button>
          <button className={btn} onClick={() => setZoom(1)} aria-label={t('preview.resetZoom')}><RotateCcw size={13} /></button>
          <button className={btn} onClick={toggleFs} aria-label={t('preview.fullscreen')}>{isFs ? <Maximize2 size={13} /> : <Expand size={13} />}</button>
        </div>
      </header>

      <div className="checker flex min-h-[300px] items-center justify-center overflow-auto p-6">
        <div
          ref={mountRef}
          className={cx('transition-transform duration-200 [&>canvas]:h-auto [&>canvas]:max-w-full [&>svg]:h-auto [&>svg]:max-w-full')}
          style={{ transform: `scale(${zoom})`, display: error || empty ? 'none' : undefined }}
          aria-label={t('preview.title')}
        />
        {empty && (
          <div className="max-w-[15rem] text-center">
            <QrCode size={26} className="mx-auto text-subtle" strokeWidth={1.5} />
            <p className="mt-2 text-[13px] font-semibold text-fg">{t('preview.emptyTitle')}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
              {t('preview.emptyBody')}
            </p>
          </div>
        )}
        {error && (
          <div className="max-w-xs text-center">
            <p className="font-mono text-[11px] uppercase tracking-wide text-danger">{t('preview.unavailable')}</p>
            <p className="mt-1 font-sans text-xs text-muted">{error}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
        <Hash size={12} className="shrink-0 text-muted" strokeWidth={1.75} />
        <p className="truncate font-mono text-[10.5px] text-muted" title={payload}>{payload || t('preview.placeholder')}</p>
        <span className="ml-auto shrink-0 rounded bg-inset px-1.5 py-0.5 font-mono text-[9.5px] uppercase text-muted">
          EC {config.errorCorrection}
        </span>
      </div>
    </section>
  )
}
