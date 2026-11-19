import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BarChart3, Bookmark, Calendar, Check, Contact, Copy, Download, Facebook,
  FileSpreadsheet, FileText, Github, History, Instagram, LayoutTemplate, Link2, Linkedin,
  Command, Mail, MapPin, Menu, MessageCircle, MessageSquare, Moon, Phone, QrCode, Save, Send,
  Share2, ShieldCheck, Smartphone, Sparkles, Sun, Type, UtensilsCrossed, Wifi, X, Youtube,
  Zap, type LucideIcon,
} from 'lucide-react'
import { QR_TYPES } from './data/qrTypes'
import { buildPayload } from './lib/qr'
import { downloadQR } from './lib/download'
import { addHistory, loadHistory, saveHistory } from './lib/storage'
import { bookmarkState } from './lib/bookmark'
import { defaultConfig, type HistoryItem, type QRConfig, type QRTypeId } from './types'
import { configFromLocation } from './lib/deepLink'
import QRPreview from './components/QRPreview'
import TypeForm from './components/TypeForm'
import Customizer from './components/Customizer'
import StylePresets from './components/StylePresets'
import DownloadPanel from './components/DownloadPanel'
import ScanCheck from './components/ScanCheck'
import FaqSection from './components/FaqSection'
import BulkGenerator from './components/BulkGenerator'
import HistoryPanel from './components/HistoryPanel'
import TemplateLibrary from './components/TemplateLibrary'
import AnalyticsPanel from './components/AnalyticsPanel'
import OnlineNow from './components/OnlineNow'
import BookmarkPrompt from './components/BookmarkPrompt'
import CommandPalette from './components/CommandPalette'
import CreditsModal from './components/CreditsModal'
import DeveloperBadge from './components/DeveloperBadge'
import DeveloperModal from './components/DeveloperModal'
import ModuleGlyph from './components/ModuleGlyph'
import { REPO } from './data/repo'
import { ToastProvider, useToast } from './components/Toast'
import { SectionHead, Stat } from './components/ui'

const ICONS: Record<string, LucideIcon> = {
  Link2, Type, Mail, Phone, MessageSquare, MessageCircle, Wifi, Contact, MapPin, Calendar,
  Share2, Facebook, Instagram, Youtube, Send, Linkedin, FileText, Smartphone, UtensilsCrossed, Zap,
}

type View = 'generator' | 'templates' | 'bulk' | 'history' | 'analytics'

const NAV: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'generator', label: 'Create', icon: QrCode },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'bulk', label: 'Bulk', icon: FileSpreadsheet },
  { id: 'history', label: 'Saved', icon: History },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
]

const TITLE: Record<View, string> = {
  generator: 'create',
  templates: 'templates',
  bulk: 'bulk',
  history: 'saved',
  analytics: 'stats',
}

function Shell() {
  const toast = useToast()
  const reduce = useReducedMotion()
  const [view, setView] = useState<View>('generator')
  // A landing page can hand over the exact type it just explained (`?type=wifi`).
  const [config, setConfig] = useState<QRConfig>(configFromLocation)
  const [dark, setDark] = useState(() => !document.documentElement.classList.contains('light'))
  const [drawer, setDrawer] = useState(false)
  const [palette, setPalette] = useState(false)
  const [credits, setCredits] = useState(false)
  const [developer, setDeveloper] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory())
  const [installEvt, setInstallEvt] = useState<Event | null>(null)
  // Already running as an installed app (home screen / app list)? Then there is
  // nothing to install and the button is noise.
  const [installed, setInstalled] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
    try { localStorage.setItem('qrforge-theme', dark ? 'dark' : 'light') } catch { /* noop */ }
  }, [dark])

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallEvt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const onInstalled = () => {
      setInstalled(true)
      setInstallEvt(null)
      toast.push({
        variant: 'success',
        title: 'QRForge installed',
        description: 'It opens offline from now on — your codes stay on this device.',
        duration: 6000,
      })
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [toast])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (bookmarkState().visits > 1) return
    const t = window.setTimeout(() => {
      toast.push({
        variant: 'info',
        title: 'Welcome to QRForge',
        description: 'Everything runs in your browser. Press ⌘K anytime for the command menu.',
        duration: 9000,
        action: { label: 'Bookmark this app', onClick: () => window.dispatchEvent(new CustomEvent('qrforge:bookmark')) },
      })
    }, 2600)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const payload = useMemo(() => buildPayload(config), [config])
  const patch = (p: Partial<QRConfig>) => setConfig((c) => ({ ...c, ...p }))

  const pickType = useCallback((id: QRTypeId) => {
    const def = QR_TYPES.find((t) => t.id === id)!
    setConfig((c) => ({ ...c, type: id, fields: { ...def.sample } }))
    setView('generator')
  }, [])

  const saveToHistory = () => {
    const item: HistoryItem = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name: config.name || 'Untitled QR',
      config: JSON.parse(JSON.stringify(config)),
      payload,
      createdAt: Date.now(),
      favorite: false,
      scans: 0,
    }
    setHistory(addHistory(item))
    toast.push({
      variant: 'success',
      title: 'Saved',
      description: `${item.name} — reopen it from Saved.`,
      action: { label: 'Open saved', onClick: () => setView('history') },
    })
  }

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payload)
      toast.push({ variant: 'success', title: 'Payload copied', description: 'Paste it into any QR tool or CMS.' })
    } catch {
      toast.push({ variant: 'error', title: 'Clipboard blocked', description: 'Your browser denied clipboard access.' })
    }
  }

  const exportPng = async () => {
    try {
      await downloadQR(config, payload, 'png')
      toast.push({ variant: 'success', title: 'PNG exported', description: `${config.width}×${config.height}px` })
    } catch {
      toast.push({ variant: 'error', title: 'Export failed', description: 'Try the Export panel formats.' })
    }
  }

  const install = async () => {
    if (!installEvt) {
      toast.push({
        variant: 'info',
        title: 'Install from the browser menu',
        description: 'Chrome/Edge: ⋮ → Install app. Safari: Share → Add to Home Screen.',
        duration: 8000,
      })
      return
    }
    ;(installEvt as Event & { prompt: () => Promise<void> }).prompt()
  }

  const fade = reduce ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } }

  const railButton = (n: (typeof NAV)[number]) => (
    <button
      key={n.id}
      onClick={() => setView(n.id)}
      aria-current={view === n.id ? 'page' : undefined}
      aria-label={n.label}
      className={`group relative flex w-full flex-col items-center gap-1 rounded-lg py-2.5 transition-colors ${
        view === n.id
          ? 'bg-inset text-accent-strong  '
          : 'text-muted hover:bg-inset/60 hover:text-fg   '
      }`}
    >
      {view === n.id && <span className="absolute inset-y-2 left-0 w-0.5 rounded-r bg-accent" />}
      <n.icon size={16} strokeWidth={1.75} />
      <span className="font-sans text-[9px] font-medium tracking-[0.01em]">{n.label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-canvas text-fg">
      {/* Keyboard users should be able to jump the 19-type rail and the top bar. */}
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:border focus:border-line focus:bg-surface focus:px-3 focus:py-2 focus:font-sans focus:text-[12.5px] focus:font-semibold focus:text-fg focus:shadow-lift"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* icon rail */}
        <aside className="sticky top-0 hidden h-screen w-[68px] shrink-0 flex-col border-r border-line bg-surface/60 px-2 py-3 backdrop-blur lg:flex">
          <a href="#top" className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-elevated text-accent-strong" aria-label="QRForge home">
            <QrCode size={16} strokeWidth={1.9} />
          </a>
          <nav className="flex flex-col gap-1" aria-label="Sections">
            {NAV.map(railButton)}
          </nav>
          <div className="mt-auto flex flex-col items-center gap-1">
            <div className="mb-1 h-px w-8 bg-line" />
            <DeveloperBadge variant="rail" onClick={() => setDeveloper(true)} />
            <a
              href={REPO.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Source code on GitHub"
              title={`Source code — ${REPO.label}`}
              className="tap-44 flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-inset hover:text-fg"
            >
              <Github size={14} />
            </a>
            <button onClick={() => setCredits(true)} aria-label="Credits and licences" className="tap-44 flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-inset hover:text-fg">
              <Sparkles size={14} />
            </button>
            <button onClick={() => setDark(!dark)} aria-label="Toggle colour scheme" className="tap-44 flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-inset hover:text-fg">
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* top bar */}
          <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-xl">
            <div className="flex h-12 items-center gap-2 px-3 sm:px-5">
              <button className="icon-btn lg:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation"><Menu size={16} /></button>
              <div className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle sm:flex">
                <span className="text-muted">qrforge</span>
                <span className="text-subtle">/</span>
                <span className="text-fg">{TITLE[view]}</span>
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={() => setPalette(true)}
                  className="hidden items-center gap-2 rounded-lg border border-line bg-elevated px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-line-strong hover:text-fg sm:flex "
                >
                  <span>⌘K</span>
                  <span className="text-subtle">commands</span>
                </button>
                <OnlineNow />
                {!installed && (
                  <button onClick={install} className="icon-btn hidden sm:inline-flex" aria-label="Install app" title="Install QRForge — works offline">
                    <Download size={15} />
                  </button>
                )}
                <a
                  href={REPO.url}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn relative after:absolute after:-inset-1 after:content-['']"
                  aria-label="Source code on GitHub"
                  title={`Source code — ${REPO.label}`}
                >
                  <Github size={15} />
                </a>
                <button onClick={() => setDark(!dark)} className="icon-btn lg:hidden" aria-label="Toggle colour scheme">{dark ? <Sun size={15} /> : <Moon size={15} />}</button>
                <button onClick={() => setCredits(true)} className="icon-btn" aria-label="Credits and licences"><Sparkles size={15} /></button>
              </div>
            </div>
          </header>

          {drawer && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 animate-fade-in bg-canvas/70 backdrop-blur-sm" onClick={() => setDrawer(false)} />
              <nav className="absolute left-0 top-0 flex h-full w-64 animate-slide-in flex-col border-r border-line bg-surface p-3">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-on-accent"><QrCode size={14} /></span>
                  <span className="font-sans text-[12px] font-semibold">QRForge</span>
                  <button className="ml-auto icon-btn !h-7 !w-7" onClick={() => setDrawer(false)} aria-label="Close navigation"><X size={14} /></button>
                </div>
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { setView(n.id); setDrawer(false) }}
                    className={`nav-item mb-0.5 ${view === n.id ? 'nav-item-active' : ''}`}
                  >
                    <n.icon size={15} /> {n.label}
                  </button>
                ))}
                <div className="mt-auto border-t border-line pt-3">
                  <DeveloperBadge onClick={() => { setDrawer(false); setDeveloper(true) }} />
                </div>
              </nav>
            </div>
          )}

          <main id="top" tabIndex={-1} className="px-3 pb-10 pt-4 outline-none sm:px-5 sm:pt-5">
            <motion.div key={view} {...fade}>
              {view === 'generator' && (
                <div className="flex flex-col gap-6">
                  {/* HERO */}
                  <section className="relative overflow-hidden rounded-2xl border border-line bg-surface">
                    <div className="pointer-events-none absolute inset-0 module-grid module-grid-fade opacity-70" aria-hidden />
                    <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />
                    <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.9fr] lg:p-9">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge badge-run"><span className="live-dot scale-75" /> live studio</span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                            {QR_TYPES.length} types · 8 formats · 0 servers
                          </span>
                        </div>

                        <h1 className="mt-4 max-w-[21ch] font-sans text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-fg sm:text-[40px]">
                          QR codes that<br />
                          <span className="text-accent-strong">look designed.</span>
                        </h1>

                        <p className="mt-3 max-w-md font-sans text-[12.5px] leading-relaxed text-muted sm:text-[13.5px]">
                          Start with a clean black-and-white code, then make it yours with presets, logos
                          and gradients — or leave it plain. Everything runs in your browser.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <button onClick={() => setView('templates')} className="btn-primary">
                            <LayoutTemplate size={13} /> Start from a template
                          </button>
                          <button onClick={() => setPalette(true)} className="btn-secondary">
                            <Sparkles size={13} /> Experiment
                          </button>
                          <span className="hidden items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle sm:flex">
                            press <span className="kbd">⌘</span><span className="kbd">K</span>
                          </span>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4">
                          <Stat value={String(QR_TYPES.length)} label="types" />
                          <Stat value="5000px" label="max output" />
                          <Stat value="8" label="export formats" />
                          <Stat value="0" label="bytes uploaded" />
                        </div>
                      </div>

                      {/* spec panel */}
                      <div className="relative hidden lg:block">
                        <div className="crosshair relative overflow-hidden rounded-xl border border-line bg-canvas/70 p-4">
                          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-subtle">
                            <span>fig. 01 — module</span>
                            <span className="text-accent-strong">21×21</span>
                          </div>
                          <ModuleGlyph className="mx-auto my-4 h-[132px] w-[132px]" />
                          <div className="grid grid-cols-3 gap-1.5">
                            {[['EC', 'H'], ['DOTS', 'ROUND'], ['EYES', 'LEAF']].map(([k, v]) => (
                              <div key={k} className="rounded-md border border-line bg-surface px-1.5 py-1">
                                <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-subtle">{k}</p>
                                <p className="font-mono text-[10px] text-fg">{v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* TYPE GRID */}
                  <section>
                    <SectionHead index="01" title="Pick a format" hint="what should the code do?" right={<span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle">{QR_TYPES.length} types</span>} />
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {QR_TYPES.map((t) => {
                        const Icon = ICONS[t.icon] || QrCode
                        const active = config.type === t.id
                        return (
                          <button
                            key={t.id}
                            onClick={() => pickType(t.id)}
                            aria-pressed={active}
                            className={`group relative flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                              active
                                ? 'border-accent/50 bg-accent/10'
                                : 'border-line bg-surface hover:border-line-strong hover:bg-elevated   '
                            } `}
                          >
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${active ? 'bg-accent text-on-accent' : 'bg-inset text-muted group-hover:text-fg  '}`}>
                              <Icon size={12} strokeWidth={1.9} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-sans text-[12px] font-semibold tracking-[-0.005em] text-fg">{t.label}</span>
                              <span className="block truncate font-sans text-[10px] text-subtle">{t.desc}</span>
                            </span>
                            {active && <Check size={11} className="absolute right-1.5 top-1.5 text-accent-strong" />}
                          </button>
                        )
                      })}
                    </div>
                  </section>

                  {/* WORKSPACE */}
                  <div className="grid items-start gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <SectionHead index="02" title="Content" done={payload.trim().length > 0} />
                      <TypeForm config={config} onChange={patch} />
                      <div className="mt-2 flex gap-1.5">
                        <button className="btn-primary flex-1" onClick={saveToHistory}><Save size={13} /> Save</button>
                        <button className="btn-secondary flex-1" onClick={copyPayload}><Copy size={13} /> Copy</button>
                      </div>
                    </div>

                    <div>
                      <SectionHead
                        index="03"
                        title="Preview &amp; export"
                        done={payload.trim().length > 0}
                        right={
                          <button
                            onClick={exportPng}
                            disabled={!payload.trim()}
                            className="btn-primary !px-2.5 !py-1.5 !text-[11px]"
                            title={payload.trim() ? 'Download a PNG now' : 'Add content first'}
                          >
                            <Download size={12} /> PNG
                          </button>
                        }
                      />
                      <div className="flex flex-col gap-2">
                        <QRPreview config={config} payload={payload} />
                        <ScanCheck config={config} payload={payload} onChange={patch} />
                        <DownloadPanel config={config} payload={payload} />
                      </div>
                    </div>

                    <div className="lg:col-span-2 xl:col-span-1">
                      <SectionHead index="04" title="Style" hint="optional" />
                      <div className="flex flex-col gap-2">
                        <StylePresets config={config} onChange={patch} />
                        <Customizer config={config} onChange={patch} />
                      </div>
                    </div>
                  </div>

                  {/* BENTO */}
                  <section className="grid gap-2.5 md:grid-cols-3">
                    {[
                      { icon: ShieldCheck, title: 'Private by default', body: 'Codes, logos and history stay in this browser. No accounts, no uploads, no tracking pixels.' },
                      { icon: Zap, title: 'Press-ready output', body: 'PNG up to 5000px, true vector SVG, EPS for print shops and a ZIP with the payload + config.' },
                      { icon: Smartphone, title: 'Installable & offline', body: 'Install as an app, and every screen keeps working without a connection thanks to the service worker.' },
                    ].map((c) => (
                      <article key={c.title} className="group relative overflow-hidden rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong ">
                        <div className="pointer-events-none absolute inset-0 module-grid opacity-[0.35]" aria-hidden />
                        <div className="relative">
                          <c.icon size={15} className="text-accent-strong" strokeWidth={1.75} />
                          <p className="mt-2.5 font-sans text-[12px] font-semibold text-fg">{c.title}</p>
                          <p className="mt-1 font-sans text-[11.5px] leading-relaxed text-muted">{c.body}</p>
                        </div>
                      </article>
                    ))}
                  </section>

                  {/* FAQ + how-to — the same copy the prerendered shell exposes to
                      crawlers, visible here so the FAQPage/HowTo schema describes
                      content a person can actually read (src/marketing/content.ts). */}
                  <FaqSection />
                </div>
              )}

              {view === 'templates' && (
                <TemplateLibrary onApply={(cfg) => {
                  setConfig(cfg)
                  setView('generator')
                  toast.push({ variant: 'success', title: 'Template applied', description: 'Tweak the content, then export.' })
                }} />
              )}

              {view === 'bulk' && <BulkGenerator template={config} />}

              {view === 'history' && (
                <HistoryPanel
                  items={history}
                  onRefresh={() => setHistory(loadHistory())}
                  onLoad={(cfg) => {
                    setConfig(cfg)
                    setView('generator')
                    toast.push({ variant: 'success', title: 'Loaded into the editor', description: 'Adjust anything and export again.' })
                  }}
                  onDelete={(id) => {
                    const next = history.filter((i) => i.id !== id)
                    saveHistory(next)
                    setHistory(next)
                    toast.push({ variant: 'info', title: 'Deleted', description: 'Removed from this device.', duration: 3000 })
                  }}
                  onToggleFav={(id) => {
                    const next = history.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i))
                    saveHistory(next)
                    setHistory(next)
                  }}
                />
              )}

              {view === 'analytics' && <AnalyticsPanel items={history} />}

              {/* footer */}
              <footer className="mt-10 border-t border-line pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-on-accent"><QrCode size={13} /></span>
                    <div>
                      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-fg">QRForge</p>
                      <p className="font-sans text-[10.5px] text-subtle">
                        Free forever · MIT · no backend
                        <span className="ml-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-subtle/80">build {__BUILD_STAMP__}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-subtle">built with free software</p>
                    <div className="flex flex-wrap gap-1 sm:justify-end">
                      {['React', 'Vite', 'TypeScript', 'Tailwind', 'Lucide', 'qr-code-styling', 'Framer Motion', 'cmdk', 'colord', 'jsPDF', 'JSZip'].map((n) => (
                        <button
                          key={n}
                          onClick={() => setCredits(true)}
                          className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted transition-colors hover:border-accent/40 hover:text-accent-strong "
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <DeveloperBadge onClick={() => setDeveloper(true)} className="sm:self-end" />
                    <div className="flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('qrforge:bookmark'))} className="inline-flex items-center gap-1 hover:text-fg ">
                        <Bookmark size={10} /> bookmark
                      </button>
                      <span className="h-2.5 w-px bg-line" />
                      <button onClick={() => setCredits(true)} className="inline-flex items-center gap-1 hover:text-fg ">
                        <Sparkles size={10} /> credits
                      </button>
                      <span className="h-2.5 w-px bg-line" />
                      <DeveloperBadge variant="meta" onClick={() => setDeveloper(true)} />
                      <span className="h-2.5 w-px bg-line" />
                      <a
                        href={REPO.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`Source code — ${REPO.label}`}
                        className="inline-flex items-center gap-1 hover:text-fg"
                      >
                        <Github size={10} /> source
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </motion.div>

            <p className="mt-6 flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-subtle">
              <span className="live-dot scale-[0.6]" /> {history.length} saved locally · {QR_TYPES.length} types · 8 formats · v{__APP_VERSION__}
            </p>
          </main>
        </div>
      </div>

      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        onNavigate={(v) => setView(v)}
        onPickType={pickType}
        onSave={saveToHistory}
        onDownload={exportPng}
        onCopy={copyPayload}
        onToggleTheme={() => setDark((d) => !d)}
        onInstall={install}
        onBookmark={() => window.dispatchEvent(new CustomEvent('qrforge:bookmark'))}
        onCredits={() => setCredits(true)}
        onDeveloper={() => setDeveloper(true)}
        dark={dark}
      />
      <CreditsModal open={credits} onClose={() => setCredits(false)} onDeveloper={() => { setCredits(false); setDeveloper(true) }} />
      <DeveloperModal open={developer} onClose={() => setDeveloper(false)} />
      <BookmarkPrompt onInstall={install} />

      <button
        onClick={() => setPalette(true)}
        className="fixed bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-pop transition-colors hover:border-accent/50 hover:text-accent-strong sm:hidden"
        aria-label="Open command menu"
      >
        <Command size={16} />
      </button>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  )
}
