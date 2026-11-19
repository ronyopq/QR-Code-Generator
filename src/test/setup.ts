/* jsdom is missing the browser APIs the QR renderer and the UI rely on.
 * Everything here is a no-op stub: the tests assert app logic, not pixels. */

const ctx = new Proxy(
  {},
  {
    get(_t, prop) {
      if (prop === 'measureText') return () => ({ width: 42 })
      if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) })
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop() {} })
      if (prop === 'canvas') return { width: 0, height: 0 }
      return () => {}
    },
    set() { return true },
  },
)

Object.defineProperty(globalThis.HTMLCanvasElement.prototype, 'getContext', { value: () => ctx, configurable: true })
Object.defineProperty(globalThis.HTMLCanvasElement.prototype, 'toDataURL', { value: () => 'data:image/png;base64,', configurable: true })
Object.defineProperty(globalThis.HTMLCanvasElement.prototype, 'toBlob', {
  value: (cb: (b: Blob | null) => void) => cb(new Blob([], { type: 'image/png' })),
  configurable: true,
})

Object.defineProperty(globalThis.URL, 'createObjectURL', { value: () => 'blob:qrforge', configurable: true })
Object.defineProperty(globalThis.URL, 'revokeObjectURL', { value: () => {}, configurable: true })

globalThis.matchMedia = ((q: string) => ({
  matches: false,
  media: q,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
})) as unknown as typeof globalThis.matchMedia

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = RO as unknown as typeof globalThis.ResizeObserver
globalThis.IntersectionObserver = RO as unknown as typeof globalThis.IntersectionObserver

globalThis.HTMLElement.prototype.scrollIntoView = () => {}
globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0)) as typeof requestAnimationFrame
globalThis.cancelAnimationFrame = ((id: number) => clearTimeout(id)) as typeof cancelAnimationFrame

// React 18 tells you off without this flag when act() is used.
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
