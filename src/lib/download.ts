import type { QRConfig } from '../types'

/**
 * Lazy gateway to the export stack.
 *
 * `exporter.ts` pulls in jsPDF, JSZip, html2canvas and FileSaver — roughly 200 kB
 * gzip. Importing it statically made Vite `modulepreload` that whole chunk on the
 * first paint, for visitors who may never download anything. Going through this
 * proxy means the stack is fetched on the first export and cached afterwards.
 */
export async function downloadQR(cfg: QRConfig, payload: string, format: string): Promise<void> {
  const { downloadQR: run } = await import('./exporter')
  await run(cfg, payload, format)
}
