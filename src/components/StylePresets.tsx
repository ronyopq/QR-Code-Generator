import { Check, Palette, RotateCcw, Sparkles } from 'lucide-react'
import { STYLE_PRESETS, activePresetId, CLASSIC_PRESET, type StylePreset } from '../data/stylePresets'
import type { QRConfig } from '../types'
import { useToast } from './Toast'
import { Panel } from './ui'

/** A tiny QR-like chip drawn with CSS so presets preview instantly. */
function PreviewChip({ preset }: { preset: StylePreset }) {
  const { from, to, bg, shape } = preset.preview
  const radius = shape === 'dot' ? '9999px' : shape === 'rounded' ? '2px' : '0px'
  const cells = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 0, 1],
  ]
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-content-center gap-[2px] rounded-md p-1 ring-1 ring-black/10"
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      <div className="grid grid-cols-7 gap-[1.5px]">
        {cells.flatMap((row, y) =>
          row.map((on, x) => (
            <span
              key={`${x}-${y}`}
              className="block h-[3.4px] w-[3.4px]"
              style={{
                background: on ? (from === to ? from : `linear-gradient(135deg, ${from}, ${to})`) : 'transparent',
                borderRadius: radius,
              }}
            />
          )),
        )}
      </div>
    </div>
  )
}

export default function StylePresets({ config, onChange }: { config: QRConfig; onChange: (p: Partial<QRConfig>) => void }) {
  const toast = useToast()
  const active = activePresetId(config)

  const apply = (preset: StylePreset) => {
    onChange(preset.style)
    toast.push({
      variant: 'success',
      title: `${preset.name} applied`,
      description: 'Your content stays the same — only the look changed.',
      duration: 2800,
    })
  }

  const reset = () => {
    onChange(CLASSIC_PRESET.style)
    toast.push({ variant: 'info', title: 'Back to classic', description: 'Clean black on white, maximum compatibility.', duration: 2600 })
  }

  return (
    <Panel
      head={{
        label: 'Design presets',
        icon: Palette,
        right: (
          <button
            onClick={reset}
            disabled={active === 'classic'}
            title={active === 'classic' ? 'Already classic' : 'Reset to the plain classic look'}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10.5px] font-medium text-muted transition-colors hover:bg-inset hover:text-fg disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <RotateCcw size={10} /> reset
          </button>
        ),
      }}
    >
      <div className="p-3">
        <p className="mb-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
          <Sparkles size={12} className="mt-0.5 shrink-0 text-accent-strong" />
          Start with Classic — it scans best. Try a preset when you want a brand look, then fine-tune below.
          {active === null && (
            <span className="ml-auto shrink-0 rounded bg-inset px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-muted">custom</span>
          )}
        </p>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {STYLE_PRESETS.map((preset) => {
            const isActive = active === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => apply(preset)}
                aria-pressed={isActive}
                className={`group relative flex items-center gap-2 rounded-lg border p-1.5 text-left transition-colors ${
                  isActive
                    ? 'border-accent/60 bg-accent/10'
                    : 'border-line bg-surface hover:border-line-strong hover:bg-elevated'
                }`}
              >
                <PreviewChip preset={preset} />
                <span className="min-w-0">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-[11.5px] font-semibold text-fg">{preset.name}</span>
                    {preset.recommended && (
                      <span className="rounded bg-accent/10 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-accent-strong">best</span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[9.5px] text-subtle">{preset.desc}</span>
                </span>
                {isActive && <Check size={12} className="absolute right-1.5 top-1.5 text-accent-strong" />}
              </button>
            )
          })}
        </div>
      </div>
    </Panel>
  )
}
