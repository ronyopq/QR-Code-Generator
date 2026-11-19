import type { HistoryItem } from '../types'

const KEY = 'qrforge-history-v1'
const SCAN_KEY = 'qrforge-scans-v1'

export function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export function saveHistory(items: HistoryItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 100))) } catch { /* quota */ }
}
export function addHistory(item: HistoryItem) {
  const items = [item, ...loadHistory().filter((i) => i.id !== item.id)]
  saveHistory(items)
  return items
}
export function bumpScan(id: string) {
  const items = loadHistory().map((i) => (i.id === id ? { ...i, scans: i.scans + 1 } : i))
  saveHistory(items)
  try {
    const scans = JSON.parse(localStorage.getItem(SCAN_KEY) || '[]')
    scans.push({ id, at: Date.now(), ua: navigator.userAgent })
    localStorage.setItem(SCAN_KEY, JSON.stringify(scans.slice(-500)))
  } catch { /* noop */ }
  return items
}
export function loadScans(): { id: string; at: number; ua: string }[] {
  try { return JSON.parse(localStorage.getItem(SCAN_KEY) || '[]') } catch { return [] }
}
