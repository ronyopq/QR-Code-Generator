import React from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'

interface State { error: Error | null }

/** Catches render/runtime errors so a failing widget never blanks the page. */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[QRForge] render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-danger">
            <TriangleAlert size={18} />
          </div>
          <h1 className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-fg">Something went wrong</h1>
          <p className="mt-2 break-words font-sans text-[12px] leading-relaxed text-muted">
            {this.state.error.message || 'Unexpected error while rendering the app.'}
          </p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => location.reload()}><RefreshCw size={13} /> Reload</button>
            <button className="btn-ghost" onClick={() => this.setState({ error: null })}>Dismiss</button>
          </div>
        </div>
      </div>
    )
  }
}
