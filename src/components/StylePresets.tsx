import { useEffect, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Check, Palette, RotateCcw, Sparkles } from 'lucide-react'
import { STYLE_PRESETS, activePresetId, CLASSIC_PRESET, type StylePreset } from '../data/stylePresets'
import { defaultConfig, type QRConfig } from '../types'
import { toStylingOptions } from '../lib/qr'
import { useToast } from './Toast'
import { Panel } from './ui'

/** Build the styling options a preset produces, without touching the user's content. */
function presetOptions(preset: StylePreset, size: number) {
  const cfg = { ...defaultConfig(), ...preset.style } as QRConfig
  return {
    ...toStylingOptions(cfg, 'https://qrforge.app'),
    width: size,
    height: size,
    margin: Math.round(size * 0.06),
  }
}

/**
 * A real, tiny QR rendered by the same engine as the live preview.
 * The chip is therefore pixel-identical to the result — colours, gradients,
 * module shapes, eyes and background transparency all come from the preset.
 */
function PresetChip({ preset, size = 96 }: { preset: StylePreset; size?: number }) {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mount.current
    if (!el) return
    // StrictMode runs effects twice in dev; render the chip only once.
    if (el.dataset.rendered === preset.id) return
    try {
      el.innerHTML = ''
      const qr = new QRCodeStyling(presetOptions(preset, size))
      qr.append(el)
      el.dataset.rendered = preset.id
    } catch (e) {
      console.error('[QRForge] preset chip failed:', e)
    }
  }, [preset, size])

  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md ring-1 ring-black/10 ${
        preset.style.bgMode === 'transparent' ? 'checker' : ''
      }`}
      style={preset.style.bgMode === 'solid' ? { backgroundColor: preset.style.bgColor } : undefined}
      aria-hidden="true"
    >
      <span ref={mount} className="block h-11 w-11 [&>canvas]:h-11 [&>canvas]:w-11" />
    </span>
  )
}

export default function StylePresets({ config, onChange }: { config: QRConfig; onChange: (p: Partial<QRConfig>) => void }) {
  const toast = useToast()
  const active = activePresetId(config)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
          Start with Classic — it scans best. Each swatch is the real render, so what you pick is what you get.
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
                title={`${preset.name} — ${preset.desc}`}
                className={`group relative flex items-center gap-2 rounded-lg border p-1.5 text-left transition-colors ${
                  isActive
                    ? 'border-accent/60 bg-accent/10'
                    : 'border-line bg-surface hover:border-line-strong hover:bg-elevated'
                }`}
              >
                {mounted ? <PresetChip preset={preset} /> : <span className="h-11 w-11 shrink-0 rounded-md bg-inset" aria-hidden="true" />}
                <span className="min-w-0">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-[11.5px] font-semibold text-fg">{preset.name}</span>
                    {preset.recommended && (
                      <span className="rounded bg-accent/10 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-accent-strong">best</span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[9.5px] text-subtle">{preset.desc}</span>
                </span>
                {isActive && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-on-accent">
                    <Check size={10} strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </Panel>
  )
}
