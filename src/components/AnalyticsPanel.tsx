import { useMemo, useState } from 'react'
import { Activity, CalendarRange, Globe2, QrCode, Smartphone } from 'lucide-react'
import type { HistoryItem } from '../types'
import { loadScans } from '../lib/storage'
import { Panel, SectionHead } from './ui'

export default function AnalyticsPanel({ items }: { items: HistoryItem[] }) {
  const [range, setRange] = useState<'7' | '30' | 'all'>('30')
  const scans = useMemo(() => loadScans(), [items])
  const cutoff = range === 'all' ? 0 : Date.now() - +range * 86400000
  const filtered = scans.filter((s) => s.at >= cutoff)
  const totalScans = items.reduce((a, i) => a + i.scans, 0)

  const devices = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((s) => {
      const d = /Mobi|Android|iPhone/i.test(s.ua) ? 'Mobile' : /iPad|Tablet/i.test(s.ua) ? 'Tablet' : 'Desktop'
      map.set(d, (map.get(d) || 0) + 1)
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [filtered])

  const days = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((s) => {
      const k = new Date(s.at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
      map.set(k, (map.get(k) || 0) + 1)
    })
    return [...map.entries()].slice(-16)
  }, [filtered])
  const maxDay = Math.max(1, ...days.map((d) => d[1]))

  const cards = [
    { icon: QrCode, label: 'codes created', value: items.length },
    { icon: Activity, label: 'total scans', value: totalScans },
    { icon: CalendarRange, label: `scans · ${range === 'all' ? 'all' : range + 'd'}`, value: filtered.length },
    { icon: Smartphone, label: 'device types', value: devices.length },
  ]

  return (
    <div className="animate-fade-up">
      <SectionHead
        index="[ A ]"
        title="Analytics"
        hint="local scan ledger · no server"
        right={
          <div className="flex gap-1">
            {(['7', '30', 'all'] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={`chip !px-2 !py-1 ${range === r ? 'chip-active' : 'chip-idle'}`}>
                {r === 'all' ? 'ALL' : `${r}D`}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-line bg-surface p-3.5">
            <c.icon size={14} className="text-accent-strong" strokeWidth={1.75} />
            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-fg">{c.value}</p>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel head={{ label: 'Scans per day', icon: Activity }}>
          <div className="p-4">
            {days.length === 0 ? (
              <p className="py-8 text-center font-sans text-xs text-muted">No scans logged yet. Re-edit a code from History to record one.</p>
            ) : (
              <div className="flex h-32 items-end gap-1">
                {days.map(([d, n]) => (
                  <div key={d} className="group flex flex-1 flex-col items-center gap-1" title={`${d}: ${n} scans`}>
                    <div className="w-full rounded-sm bg-accent/70 transition-colors group-hover:bg-accent" style={{ height: `${Math.max(4, (n / maxDay) * 100)}%` }} />
                    <span className="font-mono text-[8.5px] text-subtle">{d}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel head={{ label: 'Devices', icon: Globe2 }}>
          <div className="p-4">
            {devices.length === 0 ? (
              <p className="py-8 text-center font-sans text-xs text-muted">Device mix appears after the first scans.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {devices.map(([d, n]) => (
                  <div key={d} className="flex items-center gap-3">
                    <span className="w-16 font-mono text-[10px] uppercase tracking-wide text-muted">{d}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(n / Math.max(1, filtered.length)) * 100}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-muted">{n}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 rounded-lg border border-line bg-elevated p-2.5 font-sans text-[10.5px] leading-relaxed text-muted">
              Scans are logged locally (<span className="font-mono">qrforge-scans-v1</span>). Point dynamic codes at a
              redirect service to collect real geography — the schema is already compatible.
            </p>
          </div>
        </Panel>
      </div>

      <div className="mt-3">
        <Panel head={{ label: 'Top codes', icon: QrCode }}>
          <div className="divide-y divide-line">
            {items.length === 0 && <p className="p-4 text-center font-sans text-xs text-muted">Nothing saved yet.</p>}
            {[...items].sort((a, b) => b.scans - a.scans).slice(0, 5).map((i) => (
              <div key={i.id} className="flex items-center gap-3 px-3.5 py-2">
                <span className="min-w-0 flex-1 truncate font-sans text-[12px] text-fg">{i.name}</span>
                <span className="font-mono text-[9.5px] uppercase text-subtle">{i.config.type}</span>
                <span className="font-mono text-[10px] font-semibold text-accent-strong">{i.scans}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
