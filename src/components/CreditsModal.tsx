import { BadgeCheck, ExternalLink, Github, Heart, Sparkles } from 'lucide-react'
import Modal from './Modal'
import { DEVELOPER } from '../data/developer'
import { REPO } from '../data/repo'

interface Credit {
  name: string
  role: string
  licence: string
  url: string
}

const GROUPS: { title: string; items: Credit[] }[] = [
  {
    title: 'Rendering & export',
    items: [
      { name: 'qr-code-styling', role: 'Styled QR renderer (dots, eyes, gradients, logo)', licence: 'MIT', url: 'https://github.com/kozakdenys/qr-code-styling' },
      { name: 'jsPDF', role: 'PDF export', licence: 'MIT', url: 'https://github.com/parallax/jsPDF' },
      { name: 'JSZip', role: 'ZIP packaging for bulk + full kits', licence: 'MIT', url: 'https://github.com/Stuk/jszip' },
      { name: 'FileSaver.js', role: 'Cross-browser file downloads', licence: 'MIT', url: 'https://github.com/eligrey/FileSaver.js' },
      { name: 'html2canvas', role: 'Raster fallback capture', licence: 'MIT', url: 'https://github.com/niklasvh/html2canvas' },
    ],
  },
  {
    title: 'Interface',
    items: [
      { name: 'React', role: 'UI runtime', licence: 'MIT', url: 'https://react.dev' },
      { name: 'Vite', role: 'Build tool & dev server', licence: 'MIT', url: 'https://vite.dev' },
      { name: 'TypeScript', role: 'Type safety', licence: 'Apache-2.0', url: 'https://www.typescriptlang.org' },
      { name: 'Tailwind CSS', role: 'Design tokens & utilities', licence: 'MIT', url: 'https://tailwindcss.com' },
      { name: 'Lucide', role: 'Every icon in the UI', licence: 'ISC', url: 'https://lucide.dev' },
      { name: 'Framer Motion', role: 'View & element transitions', licence: 'MIT', url: 'https://motion.dev' },
      { name: 'cmdk', role: '⌘K command palette', licence: 'MIT', url: 'https://cmdk.paco.me' },
    ],
  },
  {
    title: 'Colour & type',
    items: [
      { name: 'colord', role: 'Logo palette extraction & contrast maths', licence: 'MIT', url: 'https://github.com/omgovich/colord' },
      { name: 'Fontsource', role: 'Self-hosted fonts (offline ready)', licence: 'MIT', url: 'https://fontsource.org' },
      { name: 'JetBrains Mono', role: 'Display & numeric type', licence: 'OFL-1.1', url: 'https://www.jetbrains.com/lp/mono' },
      { name: 'IBM Plex Sans', role: 'Body type', licence: 'OFL-1.1', url: 'https://www.ibm.com/plex' },
      { name: 'clsx + tailwind-merge', role: 'Safe class composition', licence: 'MIT', url: 'https://github.com/dcastil/tailwind-merge' },
    ],
  },
  {
    title: 'Design intelligence',
    items: [
      { name: 'UI/UX Pro Max', role: 'Design-system rules, palette and type pairing used for this build', licence: 'MIT', url: 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill' },
      { name: 'Pillow', role: 'Build-time PWA icon generation', licence: 'HPND', url: 'https://python-pillow.org' },
    ],
  },
]

export default function CreditsModal({ open, onClose, onDeveloper }: { open: boolean; onClose: () => void; onDeveloper?: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Credits & open source"
      description="QRForge is built on excellent free software. Each project keeps its own licence; links open the source."
      icon={<Sparkles size={18} />}
      footer={
        <>
          {onDeveloper && (
            <button className="btn-secondary" onClick={onDeveloper}>
              <BadgeCheck size={13} /> Meet the developer
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="mb-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-subtle">{g.title}</p>
            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
              {g.items.map((c) => (
                <a
                  key={c.name}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 px-3 py-2 transition-colors hover:bg-elevated "
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-fg">{c.name}</p>
                    <p className="font-sans text-[11px] leading-relaxed text-muted">{c.role}</p>
                  </div>
                  <span className="shrink-0 rounded bg-inset px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">{c.licence}</span>
                  <ExternalLink size={11} className="mt-1 shrink-0 text-subtle" />
                </a>
              ))}
            </div>
          </div>
        ))}
        <div className="rounded-lg border border-line bg-elevated p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface font-mono text-[11px] font-bold text-accent-strong" aria-hidden="true">
              {DEVELOPER.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[12px] font-semibold text-fg">
                {DEVELOPER.name}
                <BadgeCheck size={12} className="text-accent-strong" aria-hidden="true" />
              </p>
              <p className="text-[10.5px] text-muted">{DEVELOPER.role} · crafted every screen here</p>
            </div>
            {onDeveloper && (
              <button className="btn-secondary !px-2.5 !py-1.5 !text-[11px]" onClick={onDeveloper}>
                Profile
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 font-sans text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            Made with <Heart size={11} className="text-danger" fill="currentColor" aria-hidden="true" /> and no backend.
          </span>
          <span className="h-3 w-px bg-line" aria-hidden="true" />
          <a
            href={REPO.url}
            target="_blank"
            rel="noreferrer"
            title={`Source code — ${REPO.label}`}
            className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted transition-colors hover:text-accent-strong"
          >
            <Github size={11} /> source
          </a>
        </div>
      </div>
    </Modal>
  )
}
