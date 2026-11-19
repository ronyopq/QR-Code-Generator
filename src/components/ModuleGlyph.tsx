import { useMemo } from 'react'

/**
 * Decorative "module glyph" — a QR-like 21×21 grid with real finder patterns.
 * Deterministic (no hydration/flash), drawn as SVG so it stays crisp at any size.
 */
export default function ModuleGlyph({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  const n = 21

  const cells = useMemo(() => {
    const inFinder = (x: number, y: number) =>
      (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)

    const out: { x: number; y: number }[] = []
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (inFinder(x, y)) continue
        // deterministic pseudo-random module pattern
        const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
        if (v - Math.floor(v) > 0.52) out.push({ x, y })
      }
    }
    return out
  }, [])

  const finder = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx} y={fy} width={7} height={7} fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="currentColor" />
    </g>
  )

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="h-full w-full text-accent-strong">
        <g fill="currentColor" opacity="0.92">
          {cells.map((c) => (
            <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={0.92} height={0.92} rx={0.18} />
          ))}
        </g>
        {finder(0, 0)}
        {finder(n - 7, 0)}
        {finder(0, n - 7)}
      </svg>
      {animate && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 animate-scan bg-gradient-to-b from-transparent via-accent/25 to-transparent" />
      )}
    </div>
  )
}
