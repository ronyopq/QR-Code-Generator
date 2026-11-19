import { useRef, useState } from 'react'
import { ArrowRight, Check, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import type { QRConfig } from '../types'
import { buildPayload, parseCSV, qrBlob, slug } from '../lib/qr'
import { useToast } from './Toast'
import { Panel, SectionHead } from './ui'

interface Props { template: QRConfig }

const EXAMPLES: Record<string, string> = {
  vcard: 'name,phone,email,org\nJane Doe,+8801712345678,jane@acme.com,Acme\nRahim Uddin,+8801812345678,rahim@acme.com,Acme',
  wifi: 'ssid,password,encryption\nGuestWiFi,welcome123,WPA\nOfficeWiFi,secret123,WPA',
  url: 'name,url\nWebsite,https://example.com\nDocs,https://example.com/docs',
  text: 'name,text\nNote,Hello from QRForge',
  whatsapp: 'name,phone,message\nSales,+8801712345678,Hi there',
}

export default function BulkGenerator({ template }: Props) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [type, setType] = useState<QRConfig['type']>(template.type)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    const parsed = parseCSV(await file.text())
    setRows(parsed)
    setHeaders(parsed[0] ? Object.keys(parsed[0]) : [])
    toast.push({
      variant: parsed.length ? 'success' : 'error',
      title: parsed.length ? `${parsed.length} rows loaded` : 'No rows found',
      description: parsed.length ? 'Check the preview, then generate.' : 'The CSV needs a header row plus at least one data row.',
    })
  }

  const generate = async () => {
    if (!rows.length) return
    setBusy(true)
    setProgress(0)
    // JSZip + FileSaver are ~100 kB gzip: load them when a batch is actually built,
    // not with the first paint of the app.
    const [{ default: JSZip }, { saveAs }] = await Promise.all([import('jszip'), import('file-saver')])
    const zip = new JSZip()
    const folder = zip.folder('qr-codes')!
    let made = 0
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const cfg: QRConfig = { ...template, type, fields: { ...row }, name: row.name || row.title || `qr-${i + 1}` }
      const payload = buildPayload(cfg)
      if (payload) {
        folder.file(`${slug(cfg.name)}-${i + 1}.png`, await qrBlob(cfg, payload, 'png'))
        made += 1
      }
      setProgress(Math.round(((i + 1) / rows.length) * 100))
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'qrforge-bulk.zip')
    setBusy(false)
    toast.push({ variant: 'success', title: `${made} QR codes exported`, description: 'ZIP downloaded as qrforge-bulk.zip' })
  }

  return (
    <div className="animate-fade-up">
      <SectionHead index="[ B ]" title="Bulk generator" hint="CSV → ZIP" />

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <Panel head={{ label: '1 · Upload CSV', icon: Upload }}>
          <div className="flex flex-col gap-3 p-3.5">
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <button className="btn-secondary w-full !py-2.5" onClick={() => fileRef.current?.click()}>
              <FileSpreadsheet size={13} /> Choose CSV file
            </button>
            <label className="block">
              <span className="label">QR type for this batch</span>
              <select className="input" value={type} onChange={(e) => setType(e.target.value as QRConfig['type'])}>
                {['url', 'text', 'vcard', 'wifi', 'whatsapp', 'email', 'phone', 'location'].map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </label>
            <div className="rounded-lg border border-line bg-elevated p-2.5">
              <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">expected format</p>
              <pre className="overflow-auto font-mono text-[10.5px] leading-relaxed text-muted">{EXAMPLES[type] ?? EXAMPLES.url}</pre>
            </div>
          </div>
        </Panel>

        <Panel head={{ label: '2 · Generate', icon: ArrowRight, right: rows.length ? <span className="badge badge-run">{rows.length} rows</span> : undefined }}>
          <div className="flex flex-col gap-3 p-3.5">
            {rows.length === 0 ? (
              <div className="flex min-h-[132px] flex-col items-center justify-center rounded-lg border border-dashed border-line px-4 text-center">
                <p className="font-mono text-[11px] uppercase tracking-wide text-muted">awaiting CSV</p>
                <p className="mt-1 font-sans text-[11px] text-subtle">Current style, colours and logo are applied to every code.</p>
              </div>
            ) : (
              <div className="max-h-44 overflow-auto rounded-lg border border-line">
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 bg-elevated">
                    <tr>{headers.map((h) => <th key={h} className="px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-wide text-muted">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 40).map((r, i) => (
                      <tr key={i} className="border-t border-line">
                        {headers.map((h) => <td key={h} className="max-w-[140px] truncate px-2.5 py-1.5 font-sans text-[11px] text-muted">{r[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {busy && (
              <div>
                <div className="h-1.5 overflow-hidden rounded-full bg-inset">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                  <Loader2 size={11} className="animate-spin" /> generating {progress}%
                </p>
              </div>
            )}

            <button className="btn-primary w-full !py-2.5" disabled={!rows.length || busy} onClick={generate}>
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Generate {rows.length || 0} codes → ZIP
            </button>
            <p className="font-sans text-[10.5px] leading-relaxed text-subtle">
              PNG exports use your current canvas size and quality. Nothing is uploaded; the archive is built in your browser.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
