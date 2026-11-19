import { describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import QRCodeStyling from 'qr-code-styling'
import App from '../App'

/** Render the real app into JSDOM and interact with it like a visitor. */
async function mount() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  let root: Root
  await act(async () => {
    root = createRoot(host)
    root.render(<App />)
  })
  await act(async () => { await new Promise((r) => setTimeout(r, 120)) })
  return {
    host,
    unmount: async () => { await act(async () => root.unmount()); host.remove() },
    $$: (sel: string) => [...host.querySelectorAll<HTMLElement>(sel)],
    text: () => host.textContent || '',
  }
}

const click = async (el: Element) => {
  await act(async () => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 60))
  })
}

const presetButton = (host: HTMLElement, name: string) =>
  [...host.querySelectorAll<HTMLElement>('button[aria-pressed]')].find((b) => (b.textContent || '').trim().startsWith(name))!

describe('App', () => {
  it('renders the shell, the live preview and ten real preset swatches', async () => {
    const app = await mount()
    expect(app.text()).toContain('Live preview')
    // 10 preset chips + the live preview canvas
    expect(app.$$('canvas').length).toBe(11)
    const presets = app.$$('button[aria-pressed]').filter((b) => /Classic|Minimal|Soft|Ocean|Sunset|Forest|Midnight|Gold|Neon|Pastel/.test(b.textContent || ''))
    expect(presets).toHaveLength(10)
    await app.unmount()
  }, 20000)

  it('keeps exactly one preset selected and repaints the preview on every click', async () => {
    const seen: { dots: string | undefined; gradient?: string }[] = []
    const real = QRCodeStyling.prototype.update
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const spy = vi.spyOn(QRCodeStyling.prototype, 'update').mockImplementation(function (this: any, options?: any) {
      real.call(this, options)
      const inst = this as { _options: { width: number; dotsOptions: { color?: string; gradient?: { colorStops: { color: string }[] } } } }
      if (inst._options.width !== 96) {
        seen.push({
          dots: inst._options.dotsOptions.color,
          gradient: inst._options.dotsOptions.gradient?.colorStops.map((s) => s.color).join('>'),
        })
      }
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const app = await mount()
    const selectedNames = () =>
      app.$$('button[aria-pressed="true"]')
        .filter((b) => /Classic|Minimal|Soft|Ocean|Sunset|Forest|Midnight|Gold|Neon|Pastel/.test(b.textContent || ''))
        .map((b) => (b.textContent || '').match(/^(Classic|Minimal|Soft|Ocean|Sunset|Forest|Midnight|Gold|Neon|Pastel)/)![1])

    expect(selectedNames()).toEqual(['Classic'])

    // gradient first, then a flat preset: the old gradient must not survive
    await click(presetButton(app.host, 'Ocean'))
    await click(presetButton(app.host, 'Classic'))
    const last = seen[seen.length - 1]
    expect(last.dots).toBe('#000000')
    expect(last.gradient).toBeUndefined()
    expect(seen.some((s) => s.gradient === '#0ea5e9>#2563eb')).toBe(true)

    await click(presetButton(app.host, 'Pastel'))
    const pastel = seen[seen.length - 1]
    expect(pastel.dots).toBe('#6366f1')
    expect(pastel.gradient).toBeUndefined()
    expect(selectedNames()).toEqual(['Pastel'])

    spy.mockRestore()
    await app.unmount()
  }, 20000)

  // Exporting is not asserted here on purpose: jsdom has no canvas rasteriser, so
  // qr-code-styling's getRawData() never settles. The lazy gateway is unit-tested in
  // src/lib/download.test.ts and real file bytes are covered by the browser e2e job.
})
