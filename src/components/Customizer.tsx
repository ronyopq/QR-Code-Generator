import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Palette, Ruler, Shapes, Trash2, Wand2 } from 'lucide-react'
import type { QRConfig } from '../types'
import { paletteFromLogo, readableOn } from '../lib/palette'
import { useToast } from './Toast'
import { ChipRow, Field, Panel, Swatch } from './ui'

interface Props {
  config: QRConfig
  onChange: (patch: Partial<QRConfig>) => void
}

const BODY: { value: QRConfig['bodyStyle']; label: string }[] = [
  { value: 'square', label: 'Square' }, { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' }, { value: 'classy', label: 'Classy' },
  { value: 'extra-rounded', label: 'X-Round' }, { value: 'classy-rounded', label: 'Star' },
]
const EYE: { value: QRConfig['eyeStyle']; label: string }[] = [
  { value: 'square', label: 'Square' }, { value: 'dot', label: 'Circle' }, { value: 'extra-rounded', label: 'Leaf' },
]
const COLOR_MODES: { value: QRConfig['colorMode']; label: string }[] = [
  { value: 'single', label: 'Single' }, { value: 'dual', label: 'Dual' }, { value: 'gradient', label: 'Gradient' },
  { value: 'multi', label: 'Multi' }, { value: 'radial', label: 'Radial' },
]
const BG_MODES: { value: QRConfig['bgMode']; label: string }[] = [
  { value: 'transparent', label: 'Clear' }, { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' }, { value: 'pattern', label: 'Pattern' },
]
const PRESETS: [string, string][] = [
  ['#0d1014', '#ffffff'], ['#0f9d63', '#f2fbf6'], ['#1f6feb', '#eef4ff'],
  ['#b45309', '#fffbeb'], ['#be123c', '#fff1f2'], ['#7c3aed', '#f5f3ff'],
  ['#0891b2', '#ecfeff'], ['#111827', '#fde68a'],
]

function Group({ icon: Icon, title, children }: { icon: typeof Shapes; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line px-3.5 py-3 first:border-t-0">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={11} className="text-muted" strokeWidth={1.75} />
        <h3 className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">{title}</h3>
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}

export default function Customizer({ config, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const [matching, setMatching] = useState(false)

  const onLogo = (file: File | undefined) => {
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      toast.push({ variant: 'error', title: 'Logo too large', description: 'Keep it under 4 MB for fast exports.' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ logo: String(reader.result) })
      toast.push({ variant: 'success', title: 'Logo added', description: 'Error correction H is recommended with logos.' })
    }
    reader.readAsDataURL(file)
  }

  const matchLogo = async () => {
    if (!config.logo) {
      toast.push({ variant: 'info', title: 'Upload a logo first', description: 'Then QRForge can pull its colours into the code.' })
      return
    }
    setMatching(true)
    try {
      const palette = await paletteFromLogo(config.logo)
      onChange({
        colorMode: 'gradient',
        gradientFrom: palette.primary,
        gradientTo: palette.secondary,
        fgColor: palette.primary,
        fgColor2: palette.secondary,
      })
      toast.push({
        variant: 'success',
        title: 'Palette matched to your logo',
        description: `${palette.primary.toUpperCase()} → ${palette.secondary.toUpperCase()}`,
        action: { label: 'Use solid background', onClick: () => onChange({ bgMode: 'solid', bgColor: readableOn(palette.primary) }) },
      })
    } catch (e) {
      toast.push({ variant: 'error', title: 'Could not read the logo', description: e instanceof Error ? e.message : 'Try another image.' })
    } finally {
      setMatching(false)
    }
  }

  return (
    <Panel head={{ label: 'Style', icon: Wand2, right: (
      <span className="font-mono text-[9.5px] uppercase tracking-wide text-muted">{config.bodyStyle}</span>
    ) }}>
      <Group icon={Shapes} title="Modules">
        <ChipRow options={BODY} value={config.bodyStyle} onPick={(v) => onChange({ bodyStyle: v })} />
        <ChipRow options={EYE} value={config.eyeStyle} onPick={(v) => onChange({ eyeStyle: v })} />
      </Group>

      <Group icon={Palette} title="Colour">
        <ChipRow options={COLOR_MODES} value={config.colorMode} onPick={(v) => onChange({ colorMode: v })} />
        <div className="grid grid-cols-2 gap-2">
          <Swatch color={config.fgColor} label="Primary" value={config.fgColor} onChange={(v) => onChange({ fgColor: v })} />
          <Swatch color={config.fgColor2} label="Eyes" value={config.fgColor2} onChange={(v) => onChange({ fgColor2: v })} />
          <Swatch color={config.gradientFrom} label="Grad from" value={config.gradientFrom} onChange={(v) => onChange({ gradientFrom: v })} />
          <Swatch color={config.gradientTo} label="Grad to" value={config.gradientTo} onChange={(v) => onChange({ gradientTo: v })} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(([fg, bg]) => (
            <button
              key={fg}
              aria-label={`Apply preset ${fg}`}
              onClick={() => onChange({ fgColor: fg, gradientFrom: fg, bgColor: bg, bgMode: 'solid' })}
              className="h-6 w-6 rounded-md ring-1 ring-inset ring-white/20 transition hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${fg} 50%, ${bg} 50%)` }}
            />
          ))}
        </div>
        <button className="btn-accent w-full !py-2" onClick={matchLogo} disabled={matching}>
          {matching ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
          Match my logo palette
        </button>
      </Group>

      <Group icon={Palette} title="Background">
        <ChipRow options={BG_MODES} value={config.bgMode} onPick={(v) => onChange({ bgMode: v })} />
        <div className="grid grid-cols-3 gap-2">
          <Swatch color={config.bgColor} label="Solid" value={config.bgColor} onChange={(v) => onChange({ bgColor: v })} />
          <Swatch color={config.bgGradientFrom} label="From" value={config.bgGradientFrom} onChange={(v) => onChange({ bgGradientFrom: v })} />
          <Swatch color={config.bgGradientTo} label="To" value={config.bgGradientTo} onChange={(v) => onChange({ bgGradientTo: v })} />
        </div>
      </Group>

      <Group icon={ImagePlus} title="Logo">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
        <div className="flex gap-1.5">
          <button className="btn-secondary flex-1 !py-2" onClick={() => fileRef.current?.click()}><ImagePlus size={12} /> Upload</button>
          {config.logo && (
            <button className="btn-ghost !px-2.5 !py-2 text-danger" onClick={() => onChange({ logo: null })} aria-label="Remove logo">
              <Trash2 size={13} />
            </button>
          )}
        </div>
        {config.logo && (
          <>
            <div className="flex items-center gap-2.5 rounded-lg border border-line bg-elevated p-2">
              <img src={config.logo} alt="Uploaded logo" className="h-9 w-9 rounded-md bg-white object-contain p-0.5" />
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">logo active</p>
                <p className="truncate font-sans text-[11px] text-muted">Centre lockup · quiet zone kept</p>
              </div>
            </div>
            <Field label={`Logo size — ${Math.round(config.logoSize * 100)}%`}>
              <input type="range" min={0.1} max={0.45} step={0.01} value={config.logoSize} onChange={(e) => onChange({ logoSize: +e.target.value })} />
            </Field>
            <Field label={`Padding — ${config.logoMargin}px`}>
              <input type="range" min={0} max={24} step={1} value={config.logoMargin} onChange={(e) => onChange({ logoMargin: +e.target.value })} />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 font-sans text-[11px] text-muted">
              <input type="checkbox" checked={config.logoBorder} onChange={(e) => onChange({ logoBorder: e.target.checked })} className="accent-accent" />
              White plate behind logo
            </label>
          </>
        )}
      </Group>

      <Group icon={Ruler} title="Size &amp; output">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Width px">
            <input type="number" className="input !py-2" min={100} max={5000} value={config.width}
              onChange={(e) => onChange({ width: Math.min(5000, Math.max(100, +e.target.value || 600)) })} />
          </Field>
          <Field label="Height px">
            <input type="number" className="input !py-2" min={100} max={5000} value={config.height}
              onChange={(e) => onChange({ height: Math.min(5000, Math.max(100, +e.target.value || 600)) })} />
          </Field>
        </div>
        <Field label={`Quiet zone — ${config.margin}px`}>
          <input type="range" min={0} max={60} step={1} value={config.margin} onChange={(e) => onChange({ margin: +e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Error correction">
            <select className="input !py-2" value={config.errorCorrection} onChange={(e) => onChange({ errorCorrection: e.target.value as QRConfig['errorCorrection'] })}>
              <option value="L">L — 7%</option>
              <option value="M">M — 15%</option>
              <option value="Q">Q — 25%</option>
              <option value="H">H — 30% (logo)</option>
            </select>
          </Field>
          <Field label="Quality">
            <select className="input !py-2" value={config.quality} onChange={(e) => onChange({ quality: e.target.value as QRConfig['quality'] })}>
              <option value="hd">HD</option><option value="2k">2K</option><option value="4k">4K</option>
              <option value="print">Print</option><option value="social">Social</option>
            </select>
          </Field>
        </div>
      </Group>
    </Panel>
  )
}
