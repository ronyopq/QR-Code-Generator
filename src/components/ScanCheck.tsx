import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, CircleSlash, Loader2, Ruler, ScanLine, ShieldCheck, Wand2 } from 'lucide-react'
import type { QRConfig } from '../types'
import { analyseScan, reportSummary } from '../lib/scanCheck'
import { qrBlob } from '../lib/qr'
import { Panel } from './ui'

const SIZES = [20, 30, 40, 60, 100]
const MM_KEY = 'qrforge-print-mm'

type DecodeState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'ok' }
  | { kind: 'mismatch'; text: string }
  | { kind: 'nothing' }
  | { kind: 'error' }

/** BarcodeDetector is Chromium/Android only; hide the button where it is missing. */
const canDecode = () =>
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as unknown as { BarcodeDetector?: unknown }).BarcodeDetector === 'function' &&
  typeof createImageBitmap === 'function'

export default function ScanCheck({
  config,
  payload,
  onChange,
}: {
  config: QRConfig
  payload: string
  onChange: (patch: Partial<QRConfig>) => void
}) {
  const [mm, setMm] = useState(() => {
    const saved = Number(localStorage.getItem(MM_KEY))
    return Number.isFinite(saved) && saved >= 10 && saved <= 1000 ? saved : 40
  })
  const [decoding, setDecoding] = useState<DecodeState>({ kind: 'idle' })

  useEffect(() => {
    try { localStorage.setItem(MM_KEY, String(mm)) } catch { /* private mode */ }
  }, [mm])

  const report = useMemo(() => analyseScan(config, payload, mm), [config, payload, mm])
  const ready = payload.trim().length > 0

  // A decode result only describes the style it was run against.
  useEffect(() => { setDecoding({ kind: 'idle' }) }, [config, payload])

  const runDecode = async () => {
    setDecoding({ kind: 'running' })
    try {
      const blob = await qrBlob({ ...config, width: 512, height: 512 }, payload, 'png')
      const bitmap = await createImageBitmap(blob)
      const Detector = (globalThis as unknown as { BarcodeDetector: new (o?: { formats?: string[] }) => { detect: (s: ImageBitmap) => Promise<{ rawValue: string }[]> } }).BarcodeDetector
      const codes = await new Detector({ formats: ['qr_code'] }).detect(bitmap)
      if (!codes.length) setDecoding({ kind: 'nothing' })
      else if (codes[0].rawValue === payload) setDecoding({ kind: 'ok' })
      else setDecoding({ kind: 'mismatch', text: codes[0].rawValue })
    } catch {
      setDecoding({ kind: 'error' })
    }
  }

  const tone =
    report.level === 'pass'
      ? { chip: 'bg-ok/10 text-ok', Icon: ShieldCheck }
      : report.level === 'warn'
        ? { chip: 'bg-warn/10 text-warn', Icon: AlertTriangle }
        : { chip: 'bg-danger/10 text-danger', Icon: CircleSlash }

  const cells = [
    { label: 'contrast', value: `${report.contrast}:1`, hint: report.contrast >= 4.5 ? 'good' : 'low' },
    { label: 'modules', value: `${report.modules}²`, hint: `v${report.version} · ${config.errorCorrection}` },
    { label: 'module size', value: `${report.moduleMm}mm`, hint: report.moduleMm >= 0.4 ? 'printable' : 'small' },
    { label: 'quiet zone', value: `${report.quietModules}mod`, hint: report.quietModules >= 4 ? 'ok' : 'tight' },
  ]

  return (
    <Panel
      head={{
        label: 'Scan check',
        icon: ScanLine,
        right: (
          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${tone.chip}`}>
            <tone.Icon size={10} aria-hidden="true" /> {reportSummary(report)}
          </span>
        ),
      }}
    >
      <div className="p-3">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {cells.map((c) => (
            <div key={c.label} className="rounded-lg border border-line bg-elevated px-2 py-1.5">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-subtle">{c.label}</p>
              <p className="font-mono text-[12.5px] font-semibold tabular-nums text-fg">{c.value}</p>
              <p className="truncate font-sans text-[9px] text-muted">{c.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-subtle">
            <Ruler size={10} aria-hidden="true" /> print width
          </span>
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setMm(s)}
              aria-pressed={mm === s}
              className={`rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] transition-colors ${
                mm === s ? 'border-transparent bg-fg text-canvas' : 'border-line text-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {s}mm
            </button>
          ))}
          <input
            type="number"
            min={10}
            max={1000}
            value={mm}
            onChange={(e) => setMm(Math.max(10, Math.min(1000, Number(e.target.value) || 40)))}
            aria-label="Print width in millimetres"
            className="input !w-16 !px-1.5 !py-0.5 !text-[10px]"
          />
          <span className="ml-auto font-sans text-[9.5px] text-muted">min {report.minSizeMm}mm</span>
        </div>

        {report.issues.length > 0 && (
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {report.issues.map((issue) => (
              <li key={issue.code} className="flex items-start gap-2 rounded-lg border border-line bg-surface px-2 py-1.5">
                <span className={`mt-0.5 shrink-0 ${issue.level === 'error' ? 'text-danger' : 'text-warn'}`}>
                  <AlertTriangle size={12} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-fg">{issue.title}</p>
                  <p className="mt-0.5 font-sans text-[10px] leading-relaxed text-muted">{issue.detail}</p>
                </div>
                {issue.fix && (
                  <button
                    onClick={() => (issue.fix!.patch ? onChange(issue.fix!.patch) : setMm(issue.fix!.suggestMm ?? report.minSizeMm))}
                    className="shrink-0 rounded-md border border-line px-1.5 py-1 font-mono text-[9px] uppercase tracking-wide text-muted transition-colors hover:border-accent/50 hover:text-accent-strong"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Wand2 size={9} aria-hidden="true" /> {issue.fix.label}
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-line pt-2.5">
          {canDecode() ? (
            <button
              onClick={runDecode}
              disabled={!ready || decoding.kind === 'running'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-elevated px-2 py-1.5 font-sans text-[11px] font-medium text-muted transition-colors hover:border-accent/50 hover:text-fg disabled:opacity-40"
            >
              {decoding.kind === 'running' ? <Loader2 size={12} className="animate-spin" /> : <ScanLine size={12} aria-hidden="true" />}
              Test this code
            </button>
          ) : (
            <p className="font-sans text-[10px] leading-relaxed text-subtle">Decode test needs Chrome, Edge or Android (BarcodeDetector). The checks above still apply.</p>
          )}

          {decoding.kind === 'ok' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-ok/10 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wide text-ok">
              <Check size={10} aria-hidden="true" /> decoded — matches your content
            </span>
          )}
          {decoding.kind === 'nothing' && <span className="font-mono text-[9.5px] uppercase tracking-wide text-danger">no code found</span>}
          {decoding.kind === 'mismatch' && (
            <span className="truncate font-mono text-[9.5px] uppercase tracking-wide text-warn" title={decoding.text}>decoded different content</span>
          )}
          {decoding.kind === 'error' && <span className="font-mono text-[9.5px] uppercase tracking-wide text-danger">decode failed</span>}
        </div>
      </div>
    </Panel>
  )
}
