import { RotateCcw, Type as TypeIcon } from 'lucide-react'
import { QR_TYPES } from '../data/qrTypes'
import type { QRConfig } from '../types'
import { Field, Panel } from './ui'

interface Props {
  config: QRConfig
  onChange: (patch: Partial<QRConfig>) => void
}

export default function TypeForm({ config, onChange }: Props) {
  const def = QR_TYPES.find((t) => t.id === config.type) || QR_TYPES[0]
  const setField = (key: string, value: string) => onChange({ fields: { ...config.fields, [key]: value } })
  const missing = def.fields.filter((field) => field.required && !(config.fields[field.key] || '').trim())
  const emptyContent = !def.fields.some((field) => (config.fields[field.key] || '').trim())

  return (
    <Panel
      head={{
        label: 'Content',
        icon: TypeIcon,
        right: (
          <button
            onClick={() => onChange({ fields: { ...def.sample } })}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:bg-inset hover:text-fg "
          >
            <RotateCcw size={11} /> sample
          </button>
        ),
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg">{def.label}</p>
        <span className="badge badge-run">{def.category}</span>
      </div>

      <div className="flex flex-col gap-3.5 p-3.5">
        <Field label="QR name">
          <input
            className="input"
            value={config.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="My QR code"
          />
        </Field>

        {def.fields.map((f) => (
          <Field key={f.key} label={`${f.label}${f.required ? ' *' : ''}`} hint={f.hint}>
            {f.type === 'textarea' ? (
              <textarea
                className="input min-h-[76px] resize-y"
                value={config.fields[f.key] || ''}
                placeholder={f.placeholder}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            ) : f.type === 'select' ? (
              <select className="input" value={config.fields[f.key] || f.options?.[0] || ''} onChange={(e) => setField(f.key, e.target.value)}>
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                className="input"
                type={f.type || 'text'}
                value={config.fields[f.key] || ''}
                placeholder={f.placeholder}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            )}
          </Field>
        ))}

        {missing.length > 0 || emptyContent ? (
          <p className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-2 text-[11px] leading-relaxed text-warn">
            <span className="mt-px shrink-0" aria-hidden="true">•</span>
            {missing.length > 0
              ? <>Fill in <strong className="font-semibold">{missing.map((m) => m.label).join(', ')}</strong> to generate a working code.</>
              : <>Add the content above — the preview unlocks as soon as you type.</>}
          </p>
        ) : (
          <p className="text-[11px] leading-relaxed text-muted">
            Everything is encoded in the image itself — no redirects, no tracking, no expiry.
          </p>
        )}
      </div>
    </Panel>
  )
}
