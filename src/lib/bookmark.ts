/**
 * Bookmark / retention helpers.
 * Everything lives in localStorage — no accounts, no server.
 */

const VISITS = 'qrforge-visits-v1'
const STATE = 'qrforge-bookmark-v1'

interface BookmarkState {
  bookmarked: boolean
  dismissedAt: number
  visits: number
  firstVisit: number
  lastVisit: number
}

const EMPTY: BookmarkState = { bookmarked: false, dismissedAt: 0, visits: 0, firstVisit: 0, lastVisit: 0 }

function read(): BookmarkState {
  try {
    return { ...EMPTY, ...(JSON.parse(localStorage.getItem(STATE) || '{}') as Partial<BookmarkState>) }
  } catch {
    return { ...EMPTY }
  }
}

function write(state: Partial<BookmarkState>) {
  try {
    localStorage.setItem(STATE, JSON.stringify({ ...read(), ...state }))
  } catch {
    /* storage blocked / quota */
  }
}

/** Counts one visit per browser session and returns the updated state. */
export function trackVisit(): BookmarkState {
  const state = read()
  let counted = false
  try {
    counted = sessionStorage.getItem(VISITS) === '1'
  } catch {
    counted = false
  }
  if (counted) return state

  const now = Date.now()
  const next: BookmarkState = {
    ...state,
    visits: state.visits + 1,
    firstVisit: state.firstVisit || now,
    lastVisit: now,
  }
  write(next)
  try {
    sessionStorage.setItem(VISITS, '1')
  } catch {
    /* ignore */
  }
  return next
}

/** Show the card on a 2nd+ visit, or after 20s on the first one. */
export function shouldPromptBookmark(): boolean {
  const s = read()
  if (s.bookmarked) return false
  const daysSinceDismiss = (Date.now() - s.dismissedAt) / 86400000
  if (s.dismissedAt && daysSinceDismiss < 4) return false
  return s.visits >= 2
}

export function dismissBookmarkPrompt() {
  write({ dismissedAt: Date.now() })
}

export function markBookmarked() {
  write({ bookmarked: true, dismissedAt: 0 })
}

export function bookmarkState(): BookmarkState {
  return read()
}

/** ⌘D on macOS, Ctrl+D everywhere else. */
export function bookmarkShortcut() {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  return { isMac, keys: isMac ? ['⌘', 'D'] : ['Ctrl', 'D'], label: isMac ? '⌘D' : 'Ctrl+D' }
}

export async function copyPageLink(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href)
    return true
  } catch {
    return false
  }
}
