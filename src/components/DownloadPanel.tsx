import { useState } from 'react'
import { Check, Download, FileArchive, Loader2, Package, Zap } from 'lucide-react'
import type { QRConfig } from '../types'
import { downloadQR } from '../lib/download'
import { useToast } from './Toast'
import { Panel } from './ui'

const FORMATS = [
  { id: 'png', label: 'PNG', note: 'web + print', hot: true },
  { id: 'svg', label: 'SVG', note: 'vector', hot: true },
  { id: 'jpg', label: 'JPG', note: 'compact' },
  { id: 'webp', label: 'WEBP', note: 'modern web' },
  { id: 'pdf', label: 'PDF', note: 'A4 doc' },
  { id: 'eps', label: 'EPS', note: 'press' },
  { id: 'zip', label: 'ZIP', note: 'full kit' },
]

const QUALITIES: { id: QRConfig['quality']; label: string; px: string }[] = [
  { id: 'hd', label: 'HD', px: '1×' },
  { id: '2k', label: '2K', px: '2×' },
  { id: '4k', label: '4K', px: '4×' },
  { id: 'print', label: 'PRINT', px: '3×' },
  { id: 'social', label: 'SOCIAL', px: '1.5×' },
]

export default function DownloadPanel({ config, payload }: { config: QRConfig; payload: string }) {
  const toast = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  const ready = payload.trim().length > 0

  const run = async (fmt: string) => {
    setBusy(fmt)
    try {
      await downloadQR(config, payload, fmt)
      toast.push({
        variant: 'success',
        title: `${fmt.toUpperCase()} exported`,
        description: `${config.width}×${config.height}px · ${config.quality.toUpperCase()} quality`,
      })
    } catch (e) {
      console.error(e)
      toast.push({ variant: 'error', title: 'Export failed', description: 'Try PNG or SVG — the renderer hit an error.' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <Panel head={{ label: 'Export', icon: Download, right: (
      <span className="font-mono text-[9.5px] uppercase tracking-wide text-muted">
        {config.width}×{config.height}px
      </span>
    ) }}>
      <div className="p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => run(f.id)}
              disabled={!!busy || !ready}
              title={ready ? `${f.label} export` : 'Add content first'}
              className={`group relative flex flex-col items-center gap-0.5 rounded-lg border border-line bg-elevated px-1 py-2.5 transition-colors hover:border-accent/50 hover:bg-inset disabled:opacity-40     ${f.id === 'zip' ? 'col-span-2 flex-row justify-center gap-2' : ''}`}
            >
              {busy === f.id ? <Loader2 size={13} className="animate-spin text-accent-strong" /> : f.id === 'zip' ? <Package size={13} className="text-muted" /> : null}
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wide text-fg">{f.label}</span>
              <span className="font-sans text-[9px] text-subtle">{f.note}</span>
            </button>
          ))}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-line bg-elevated/60 px-2 py-1.5">
          <Zap size={11} className="shrink-0 text-accent-strong" />
          <span className="font-mono text-[9.5px] uppercase tracking-wide text-muted">quality</span>
          <div className="ml-auto flex gap-1">
            {QUALITIES.map((q) => (
              <span
                key={q.id}
                className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${
                  config.quality === q.id
                    ? 'bg-accent/15 text-accent-strong  '
                    : 'text-subtle '
                }`}
                title={`${q.px} scale`}
              >
                {q.label}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-muted">
          {ready ? <Check size={10} className="shrink-0 text-accent-strong" /> : <FileArchive size={10} className="shrink-0" />}
          {ready ? 'ZIP bundles PNG, SVG, JPG, payload and config.' : 'Add content above to enable downloads.'}
        </p>
      </div>
    </Panel>
  )
}
