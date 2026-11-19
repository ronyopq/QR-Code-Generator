import { useCallback, useEffect, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import {
  ArrowUpRight, BadgeCheck, Check, Copy, Cpu,
  Download, ExternalLink, Facebook, Globe, Heart, Linkedin, MapPin,
  MessageCircle, PenLine, Send, ShieldCheck, Twitter,
  type LucideIcon,
} from 'lucide-react'
import Modal from './Modal'
import { useToast } from './Toast'
import {
  DEVELOPER, buildVCard, buildSupportMessage, whatsappSupportUrl, type SocialId,
} from '../data/developer'

const SOCIAL_ICON: Record<SocialId, LucideIcon> = {
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: Send,
  linkedin: Linkedin,
  x: Twitter,
  blogger: PenLine,
  wordpress: Globe,
}

let cachedVCard: string | null = null
const getVCard = () => (cachedVCard ??= buildVCard())

async function copyText(text: string): Promise<boolean> {
  try {
    const clip = typeof window !== 'undefined' ? window.navigator?.clipboard : undefined
    if (clip?.writeText) {
      await clip.writeText(text)
      return true
    }
  } catch { /* fall through to the legacy path */ }
  try {
    if (typeof document.execCommand !== 'function') return false
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.top = '-1000px'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

export default function DeveloperModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const qrMount = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const flash = useCallback((id: string) => {
    setCopied(id)
    window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600)
  }, [])

  const copy = useCallback(async (text: string, id: string, label: string) => {
    const ok = await copyText(text)
    if (ok) {
      flash(id)
      toast.push({ variant: 'success', title: `${label} copied`, description: text.length > 64 ? `${text.slice(0, 60)}…` : text, duration: 2200 })
    } else {
      toast.push({ variant: 'error', title: 'Copy failed', description: 'Your browser blocked clipboard access.', duration: 2600 })
    }
  }, [flash, toast])

  // The vCard QR is plain black on white so any camera can read it.
  useEffect(() => {
    if (!open) return
    const mount = qrMount.current
    if (!mount) return
    try {
      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling({
          width: 132,
          height: 132,
          type: 'canvas',
          data: getVCard(),
          margin: 6,
          qrOptions: { errorCorrectionLevel: 'M' },
          dotsOptions: { color: '#000000', type: 'square' },
          backgroundOptions: { color: '#ffffff' },
          cornersSquareOptions: { color: '#000000', type: 'square' },
          cornersDotOptions: { color: '#000000', type: 'square' },
        })
        qrRef.current.append(mount)
      }
    } catch (e) {
      console.error('[QRForge] vCard QR failed:', e)
    }
  }, [open])

  const saveContact = async () => {
    try {
      await qrRef.current?.download({ name: 'rony-siddiqi-vcard', extension: 'png' })
      toast.push({ variant: 'success', title: 'vCard QR saved', description: 'Print it or share it — scanning adds Rony to contacts.', duration: 3000 })
    } catch {
      toast.push({ variant: 'error', title: 'Download failed', description: 'Try the copy button instead.', duration: 2600 })
    }
  }

  const supportHref = whatsappSupportUrl()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Developer"
      description="The person behind QRForge — say hello, or send a bug report with your device details already attached."
      icon={<Heart size={18} />}
      footer={
        <>
          <button className="btn-secondary" onClick={() => void copy(getVCard(), 'vcard-footer', 'vCard')}>
            {copied === 'vcard-footer' ? <Check size={13} /> : <Copy size={13} />} Copy vCard
          </button>
          <a className="btn-primary" href={supportHref} target="_blank" rel="noreferrer">
            <MessageCircle size={13} /> Say hello
          </a>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* --- profile card ------------------------------------------------- */}
        <section
          className="relative overflow-hidden rounded-xl border border-line bg-elevated p-4"
          style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--c-accent) / .14), transparent 58%)' }}
        >
          <div className="flex flex-wrap items-start gap-3">
            <div className="relative shrink-0">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface font-mono text-[17px] font-bold tracking-tight text-accent-strong shadow-card"
                aria-hidden="true"
              >
                {DEVELOPER.initials}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-accent-strong ring-1 ring-line">
                <BadgeCheck size={13} aria-hidden="true" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="font-sans text-[17px] font-semibold tracking-[-0.02em] text-fg">{DEVELOPER.name}</h3>
                <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.12em] text-accent-strong">
                  verified
                </span>
              </div>
              <p className="mt-0.5 text-[12px] font-medium text-muted">{DEVELOPER.role}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-subtle">
                <span className="inline-flex items-center gap-1"><MapPin size={10} aria-hidden="true" />{DEVELOPER.location}</span>
                <span className="inline-flex items-center gap-1"><span className="live-dot scale-75" aria-hidden="true" />{DEVELOPER.availability}</span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11.5px] leading-relaxed text-muted">{DEVELOPER.bio}</p>

          <div className="mt-3 flex flex-wrap gap-1">
            {DEVELOPER.focus.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-fg">
                <ShieldCheck size={9} className="text-accent-strong" aria-hidden="true" />{f}
              </span>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {DEVELOPER.skills.map((s) => (
              <span key={s} className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* --- social actions ----------------------------------------------- */}
        <section>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-subtle">Find him everywhere</p>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-subtle">{DEVELOPER.handle}</span>
          </div>

          <ul className="grid gap-1.5 sm:grid-cols-2">
            {DEVELOPER.socials.map((s) => {
              const Icon = SOCIAL_ICON[s.id]
              const isCopied = copied === s.id
              return (
                <li
                  key={s.id}
                  className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2 transition-colors hover:border-line-strong hover:bg-elevated"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-black/10"
                    style={{ color: s.color }}
                    aria-hidden="true"
                  >
                    <Icon size={15} />
                  </span>

                  <a
                    href={s.id === 'whatsapp' ? supportHref : s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    title={`${s.hint} — ${s.url}`}
                  >
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-fg">
                      {s.label}
                      <ExternalLink size={9} className="text-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </span>
                    <span className="block truncate text-[10px] text-subtle">{s.handle}</span>
                  </a>

                  <button
                    onClick={() => void copy(s.id === 'whatsapp' ? supportHref : s.url, s.id, `${s.label} link`)}
                    aria-label={`Copy ${s.label} link`}
                    title="Copy link"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line transition-colors ${
                      isCopied ? 'bg-accent/10 text-accent-strong' : 'text-muted hover:bg-inset hover:text-fg'
                    }`}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        {/* --- whatsapp support hand-off ------------------------------------ */}
        <section className="rounded-xl border border-line bg-elevated p-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-black/10" style={{ color: '#25D366' }} aria-hidden="true">
              <MessageCircle size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-fg">WhatsApp support, pre-filled</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                The message already contains your device, browser, screen size and the page you were on — so the fix usually takes one reply.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <a className="btn-primary !px-2.5 !py-1.5 !text-[11px]" href={supportHref} target="_blank" rel="noreferrer">
                  <Send size={12} /> Send on WhatsApp
                </a>
                <button
                  className="btn-secondary !px-2.5 !py-1.5 !text-[11px]"
                  onClick={() => void copy(buildSupportMessage(), 'support', 'Support message')}
                >
                  {copied === 'support' ? <Check size={12} /> : <Copy size={12} />} Copy message
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- vCard QR ----------------------------------------------------- */}
        <section className="rounded-xl border border-line bg-surface p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="mx-auto flex shrink-0 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-black/10 sm:mx-0" ref={qrMount} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-subtle">contact QR</p>
              <p className="mt-1 text-[12px] font-semibold text-fg">Scan to save Rony Siddiqi</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                Point a phone camera at the code — the vCard opens straight into Contacts, name, role and profile links included.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button className="btn-secondary !px-2.5 !py-1.5 !text-[11px]" onClick={() => void saveContact()}>
                  <Download size={12} /> Save PNG
                </button>
                <button className="btn-secondary !px-2.5 !py-1.5 !text-[11px]" onClick={() => void copy(getVCard(), 'vcard', 'vCard')}>
                  {copied === 'vcard' ? <Check size={12} /> : <Copy size={12} />} Copy vCard
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="flex flex-wrap items-center justify-center gap-1.5 text-[10.5px] text-subtle">
          <Cpu size={11} aria-hidden="true" />
          Built solo in Chattogram — React, Vite, TypeScript, Tailwind, Lucide.
          <a className="inline-flex items-center gap-0.5 font-medium text-accent-strong hover:underline" href={DEVELOPER.site} target="_blank" rel="noreferrer">
            live site <ArrowUpRight size={10} aria-hidden="true" />
          </a>
        </p>
      </div>
    </Modal>
  )
}
