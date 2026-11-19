import { useState } from 'react'
import { Heart, Pencil, Search, Trash2, History as HistoryIcon } from 'lucide-react'
import type { HistoryItem, QRConfig } from '../types'
import { bumpScan } from '../lib/storage'
import { SectionHead } from './ui'

interface Props {
  items: HistoryItem[]
  onLoad: (cfg: QRConfig) => void
  onDelete: (id: string) => void
  onToggleFav: (id: string) => void
  onRefresh: () => void
}

export default function HistoryPanel({ items, onLoad, onDelete, onToggleFav, onRefresh }: Props) {
  const [q, setQ] = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const filtered = items.filter((i) => (!favOnly || i.favorite) && i.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="animate-fade-up">
      <SectionHead
        index="[ H ]"
        title="History"
        hint={`${items.length} saved on this device`}
        right={
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input !w-36 !py-1.5 !pl-7 !text-[12px] sm:!w-48"
                placeholder="Search…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search saved QR codes"
              />
            </div>
            <button
              onClick={() => setFavOnly(!favOnly)}
              aria-pressed={favOnly}
              className={`chip ${favOnly ? 'chip-active' : 'chip-idle'}`}
            >
              <Heart size={11} /> Favourites
            </button>
          </div>
        }
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <HistoryIcon size={22} className="text-subtle" strokeWidth={1.5} />
          <p className="mt-3 font-mono text-[12px] uppercase tracking-wide text-muted">Nothing saved yet</p>
          <p className="mt-1 max-w-xs font-sans text-xs leading-relaxed text-muted">
            Generate a code and press <span className="kbd">Save</span> — it stays in this browser, ready to re-edit.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-3.5 transition-colors hover:border-line-strong :border-line-strong"
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[12px] font-semibold uppercase tracking-wide text-fg">{item.name}</p>
                  <p className="mt-0.5 truncate font-sans text-[11px] text-muted" title={item.payload}>{item.payload}</p>
                </div>
                <button
                  onClick={() => onToggleFav(item.id)}
                  aria-label={item.favorite ? 'Remove from favourites' : 'Add to favourites'}
                  aria-pressed={item.favorite}
                  className={`shrink-0 rounded-md p-1 transition-colors ${item.favorite ? 'text-danger' : 'text-subtle hover:text-danger '}`}
                >
                  <Heart size={14} fill={item.favorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wide text-subtle">
                <span className="rounded bg-inset px-1.5 py-0.5 text-muted">{item.config.type}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <span className="ml-auto text-accent-strong">{item.scans} scans</span>
              </div>

              <div className="mt-2.5 flex gap-1.5">
                <button
                  className="btn-secondary flex-1 !py-1.5 !text-[11px]"
                  onClick={() => { bumpScan(item.id); onRefresh(); onLoad(item.config) }}
                >
                  <Pencil size={11} /> Re-edit
                </button>
                <button
                  className="btn-ghost !px-2 !py-1.5 text-danger hover:bg-rose-500/10"
                  onClick={() => onDelete(item.id)}
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
