import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import StylesGuard from './components/StylesGuard'
import '@fontsource-variable/ibm-plex-sans'
import '@fontsource-variable/jetbrains-mono'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <StylesGuard />
    </ErrorBoundary>
  </React.StrictMode>,
)

// ---------------------------------------------------------------------------
// PWA service worker
// Registered in production builds only. In dev the SW would cache the app
// shell and serve a stale index.html pointing at deleted hashed assets, which
// shows as a permanently blank preview — so we also clean up any SW/caches
// left over from previous sessions while developing.
// ---------------------------------------------------------------------------
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => { /* offline unsupported */ })
    })
  } else {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => { /* noop */ })
    if ('caches' in window) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => { /* noop */ })
    }
  }
}
