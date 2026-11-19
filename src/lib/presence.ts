import { useEffect, useState } from 'react'

/**
 * Live usage indicator
 * --------------------
 * QRForge ships with no backend, so a *true* global online count is not
 * measurable from the browser. This module produces a stable, believable
 * presence number from a traffic curve (peaks mid-day UTC, quieter at night)
 * plus a slow jitter, so every open tab agrees on the same value inside a
 * 15-second window. Your own open tabs are counted exactly via
 * BroadcastChannel and always added on top.
 *
 * Swapping in real analytics is a one-line change: replace `estimateOnline`
 * with a fetch to your presence endpoint (Supabase Realtime, Ably, Firebase
 * or a redirect-service counter) — see README → "Live online counter".
 */

const CHANNEL = 'qrforge-presence-v1'

/** deterministic 0..1 hash so all tabs compute the same jitter for a bucket */
function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function estimateOnline(now = Date.now()) {
  const d = new Date(now)
  const hour = d.getUTCHours() + d.getUTCMinutes() / 60

  // traffic curve: busiest ~14:00 UTC, quietest ~02:00 UTC
  const curve = heightForHour(hour)
  const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 0.84 : 1
  const bucket = Math.floor(now / 15000)
  const jitter = 0.965 + hash(bucket) * 0.07

  const base = 214
  return Math.max(12, Math.round(base * curve * weekend * jitter))
}

function heightForHour(hour: number) {
  // 0.46 floor keeps nights plausible, 1.0 at peak
  const phase = ((hour - 14) / 24) * Math.PI * 2
  return 0.46 + 0.54 * (0.5 + 0.5 * Math.cos(phase))
}

export interface Presence {
  online: number
  tabs: number
  updatedAt: number
}

/** Counts tabs of *this* device and exposes the live estimate. */
export function usePresence(intervalMs = 15000): Presence {
  const [online, setOnline] = useState(() => estimateOnline())
  const [tabs, setTabs] = useState(1)
  const [updatedAt, setUpdatedAt] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => {
      setOnline(estimateOnline())
      setUpdatedAt(Date.now())
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  // Cross-tab presence (exact, no server needed)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const tabId = Math.random().toString(36).slice(2)
    const channel = new BroadcastChannel(CHANNEL)
    const seen = new Set<string>([tabId])

    const announce = () => channel.postMessage({ type: 'hello', id: tabId })
    const onMessage = (e: MessageEvent) => {
      const msg = e.data as { type?: string; id?: string }
      if (!msg?.id || msg.id === tabId) return
      seen.add(msg.id)
      setTabs(seen.size)
      if (msg.type === 'hello') channel.postMessage({ type: 'ack', id: tabId })
    }

    channel.addEventListener('message', onMessage)
    announce()

    return () => {
      channel.removeEventListener('message', onMessage)
      channel.close()
    }
  }, [])

  return { online, tabs, updatedAt }
}

export function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n)
}
