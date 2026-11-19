import { useCallback, useEffect, useState } from 'react'
import { Bookmark, Check, Copy, Download, Link2 } from 'lucide-react'
import Modal from './Modal'
import { useToast } from './Toast'
import {
  bookmarkShortcut, copyPageLink, dismissBookmarkPrompt, markBookmarked,
  shouldPromptBookmark, trackVisit,
} from '../lib/bookmark'

interface Props { onInstall?: () => void }

export default function BookmarkPrompt({ onInstall }: Props) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [card, setCard] = useState(false)
  const [copied, setCopied] = useState(false)
  const shortcut = bookmarkShortcut()

  useEffect(() => {
    trackVisit()
    const timer = window.setTimeout(() => setCard(shouldPromptBookmark()), 20000)

    const onKey = (e: KeyboardEvent) => {
      if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd')) return
      e.preventDefault()
      setCard(false)
      setOpen(true)
    }
    const onTrigger = () => { setCard(false); setOpen(true) }

    window.addEventListener('keydown', onKey)
    window.addEventListener('qrforge:bookmark', onTrigger)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('qrforge:bookmark', onTrigger)
    }
  }, [])

  const closeCard = useCallback(() => { setCard(false); dismissBookmarkPrompt() }, [])

  const confirm = useCallback(() => {
    markBookmarked()
    setOpen(false)
    toast.push({
      variant: 'bookmark',
      title: 'Saved to bookmarks',
      description: 'QRForge is one click away — your codes stay on this device.',
      duration: 5000,
    })
  }, [toast])

  const copy = useCallback(async () => {
    const ok = await copyPageLink()
    setCopied(ok)
    toast.push(ok
      ? { variant: 'success', title: 'Link copied', description: 'Paste it into a note, chat or your bookmark bar.' }
      : { variant: 'error', title: 'Copy blocked', description: 'Copy the address from your browser bar instead.' })
    if (ok) window.setTimeout(() => setCopied(false), 2200)
  }, [toast])

  return (
    <>
      {card && !open && (
        <div className="fixed bottom-4 left-4 z-[80] hidden w-[17.5rem] animate-slide-in overflow-hidden rounded-xl border border-line bg-surface shadow-pop md:block">
          <div className="flex items-start gap-2.5 p-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-elevated text-accent-strong">
              <Bookmark size={13} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-fg">Keep this handy</p>
              <p className="mt-1 font-sans text-[11px] leading-relaxed text-muted">
                Bookmark once — your codes, favourites and history are always one click away.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => { setCard(false); setOpen(true) }} className="rounded-md bg-accent px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-on-accent">
                  save
                </button>
                <button onClick={closeCard} className="font-mono text-[10px] uppercase tracking-wide text-subtle hover:text-muted">
                  not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Keep QRForge one click away"
        description="No account, no uploads — a bookmark is all it takes to come back to your codes."
        icon={<Bookmark size={17} />}
        footer={
          <>
            <button className="btn-ghost" onClick={() => { setOpen(false); dismissBookmarkPrompt() }}>Maybe later</button>
            <button className="btn-primary" onClick={confirm}><Check size={13} /> I've saved it</button>
          </>
        }
      >
        <ol className="space-y-2">
          {[
            {
              n: '01',
              title: 'Press your bookmark shortcut',
              body: (
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="kbd">{shortcut.keys[0]}</span><span className="kbd">{shortcut.keys[1]}</span>
                  <span className="font-sans text-[11px] text-subtle">or the ☆ icon in the address bar</span>
                </span>
              ),
            },
            {
              n: '02',
              title: 'Or copy the link',
              body: (
                <button onClick={copy} className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wide text-accent-strong hover:underline">
                  {copied ? <Check size={11} /> : <Copy size={11} />}{copied ? 'copied' : 'copy page link'}
                </button>
              ),
            },
            ...(onInstall ? [{
              n: '03',
              title: 'Or install the app',
              body: (
                <button onClick={() => { setOpen(false); onInstall() }} className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wide text-accent-strong hover:underline">
                  <Download size={11} /> install QRForge
                </button>
              ),
            }] : []),
          ].map((s) => (
            <li key={s.n} className="flex items-start gap-3 rounded-lg border border-line p-2.5">
              <span className="font-mono text-[10px] font-semibold text-accent-strong">{s.n}</span>
              <div className="min-w-0">
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-fg">{s.title}</p>
                {s.body}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-2.5 flex items-center gap-1.5 font-sans text-[10.5px] text-subtle">
          <Link2 size={10} /> Your history never leaves this browser.
        </p>
      </Modal>
    </>
  )
}
