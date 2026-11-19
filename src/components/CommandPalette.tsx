import { Command } from 'cmdk'
import {
  BarChart3, Bookmark, Copy, Download, FileSpreadsheet, History, LayoutTemplate, Moon,
  QrCode, Save, Search, Smartphone, Sun, type LucideIcon,
} from 'lucide-react'
import { QR_TYPES } from '../data/qrTypes'
import type { QRTypeId } from '../types'

export type CmdView = 'generator' | 'templates' | 'bulk' | 'history' | 'analytics'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (v: CmdView) => void
  onPickType: (id: QRTypeId) => void
  onSave: () => void
  onDownload: () => void
  onCopy: () => void
  onToggleTheme: () => void
  onInstall: () => void
  onBookmark: () => void
  onCredits: () => void
  dark: boolean
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  url: QrCode, text: QrCode, wifi: QrCode, vcard: QrCode,
}

export default function CommandPalette({
  open, onOpenChange, onNavigate, onPickType, onSave, onDownload, onCopy, onToggleTheme, onInstall, onBookmark, onCredits, dark,
}: Props) {
  const item = 'flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-sans text-[12.5px] text-muted outline-none '
  const group = 'px-1 pb-1 pt-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-subtle '

  const run = (fn: () => void) => () => { fn(); onOpenChange(false) }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      className="pointer-events-auto w-full max-w-lg animate-pop overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
    >
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-3">
        <Search size={14} className="shrink-0 text-muted" />
        <Command.Input
          autoFocus
          placeholder="Search actions, QR types, pages…"
          className="w-full bg-transparent font-sans text-[13px] text-fg outline-none placeholder:text-subtle :text-subtle"
        />
        <kbd className="kbd">ESC</kbd>
      </div>

      <Command.List className="max-h-[58vh] overflow-y-auto p-1.5">
        <Command.Empty className="px-3 py-8 text-center font-mono text-[11px] uppercase tracking-wide text-muted">
          no results
        </Command.Empty>

        <Command.Group heading="Navigate" >
          <span className={group}>navigate</span>
          {([
            ['generator', 'Generator', QrCode],
            ['templates', 'Templates', LayoutTemplate],
            ['bulk', 'Bulk generator', FileSpreadsheet],
            ['history', 'History', History],
            ['analytics', 'Analytics', BarChart3],
          ] as [CmdView, string, LucideIcon][]).map(([id, label, Icon]) => (
            <Command.Item key={id} value={`go ${label}`} onSelect={run(() => onNavigate(id))} className={item}>
              <Icon size={14} className="text-muted" /> {label}
              <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wide text-subtle">page</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group>
          <span className={group}>create</span>
          {QR_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t.icon] ?? QrCode
            return (
              <Command.Item key={t.id} value={`type ${t.label} ${t.category} ${t.desc}`} onSelect={run(() => onPickType(t.id))} className={item}>
                <Icon size={14} className="text-muted" /> {t.label}
                <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wide text-subtle">{t.category}</span>
              </Command.Item>
            )
          })}
        </Command.Group>

        <Command.Group>
          <span className={group}>actions</span>
          <Command.Item value="save history" onSelect={run(onSave)} className={item}><Save size={14} className="text-muted" /> Save to history</Command.Item>
          <Command.Item value="download png export" onSelect={run(onDownload)} className={item}><Download size={14} className="text-muted" /> Export PNG</Command.Item>
          <Command.Item value="copy payload clipboard" onSelect={run(onCopy)} className={item}><Copy size={14} className="text-muted" /> Copy payload</Command.Item>
          <Command.Item value="theme dark light appearance" onSelect={run(onToggleTheme)} className={item}>
            {dark ? <Sun size={14} className="text-muted" /> : <Moon size={14} className="text-muted" />} Switch to {dark ? 'light' : 'dark'} mode
          </Command.Item>
          <Command.Item value="install app pwa" onSelect={run(onInstall)} className={item}><Smartphone size={14} className="text-muted" /> Install app</Command.Item>
          <Command.Item value="bookmark save site" onSelect={run(onBookmark)} className={item}><Bookmark size={14} className="text-muted" /> Bookmark QRForge</Command.Item>
          <Command.Item value="credits open source libraries" onSelect={run(onCredits)} className={item}><Sparkle /> Credits &amp; licences</Command.Item>
        </Command.Group>
      </Command.List>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2 font-mono text-[9.5px] uppercase tracking-wide text-subtle">
        <span className="flex items-center gap-1"><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
        <span className="flex items-center gap-1"><span className="kbd">↵</span> select</span>
        <span className="ml-auto">QRForge commands</span>
      </div>
    </Command.Dialog>
  )
}

function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted" aria-hidden>
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" strokeLinecap="round" />
    </svg>
  )
}
