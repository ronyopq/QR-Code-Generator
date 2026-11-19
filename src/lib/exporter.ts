import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import type { QRConfig } from '../types'
import { qrBlob, slug, QUALITY_SCALE } from './qr'

function scaled(cfg: QRConfig): QRConfig {
  const s = QUALITY_SCALE[cfg.quality] || 1
  if (s === 1) return cfg
  return { ...cfg, width: Math.min(5000, Math.round(cfg.width * s)), height: Math.min(5000, Math.round(cfg.height * s)) }
}

async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(blob) })
}

function makeEPS(jpeg: Blob, w: number, h: number): Blob {
  const header = `%!PS-Adobe-3.0 EPSF-3.0\n%%Creator: QRForge\n%%BoundingBox: 0 0 ${w} ${h}\n%%EndComments\n`
  const body = `gsave\n${w} 0 0 ${h} 0 0 concat\n/Width ${w} def /Height ${h} def /BitsPerComponent 8 def /ColorSpace /DeviceRGB def\n<< /ImageType 1 /Width Width /Height Height /BitsPerComponent BitsPerComponent /ColorSpace ColorSpace /Decode [0 1 0 1 0 1] /Filter /DCTDecode /Length ${jpeg.size} >>\nBI\nID\n`
  const footer = `\nEI\nrestore\n%%EOF\n`
  return new Blob([header, body, jpeg, footer], { type: 'application/postscript' })
}

/** A4 portrait grid: 2 columns × 3 rows of the same code, in millimetres. */
export interface SheetCell {
  x: number; y: number; cellW: number; cellH: number
  qrX: number; qrY: number; size: number; labelX: number; labelY: number
}

export function sheetLayout(copies = 6, pageW = 210, pageH = 297) {
  const cols = 2
  const rows = 3
  const marginX = 12
  const marginY = 20
  const gap = 6
  const cellW = (pageW - marginX * 2) / cols
  const cellH = (pageH - marginY * 2) / rows
  const cells: SheetCell[] = []
  for (let i = 0; i < Math.min(copies, cols * rows); i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = marginX + col * cellW
    const y = marginY + row * cellH
    const size = Math.min(cellW, cellH) - gap * 4
    const qrX = x + (cellW - size) / 2
    const qrY = y + gap
    cells.push({ x, y, cellW, cellH, qrX, qrY, size, labelX: x + cellW / 2, labelY: qrY + size + 6 })
  }
  return { cols, rows, cells }
}

export async function downloadQR(cfg: QRConfig, payload: string, format: string) {
  const name = slug(cfg.name || 'qr-code')
  const c = scaled(cfg)
  if (format === 'png' || format === 'svg') {
    const blob = await qrBlob(c, payload, format)
    saveAs(blob, `${name}.${format}`)
    return
  }
  if (format === 'jpg' || format === 'webp') {
    const blob = await qrBlob(c, payload, 'jpeg')
    // webp: draw via canvas
    if (format === 'webp') {
      const url = URL.createObjectURL(blob)
      const img = new Image()
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url })
      const canvas = document.createElement('canvas')
      canvas.width = c.width; canvas.height = c.height
      const ctx = canvas.getContext('2d')!
      if (c.bgMode !== 'transparent') { ctx.fillStyle = c.bgColor; ctx.fillRect(0, 0, c.width, c.height) }
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const webp = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.95))
      if (webp) saveAs(webp, `${name}.webp`)
      return
    }
    saveAs(blob, `${name}.jpg`)
    return
  }
  if (format === 'pdf') {
    const png = await qrBlob(c, payload, 'png')
    const dataUrl = await blobToDataURL(png)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const size = Math.min(pageW - 20, 120)
    doc.addImage(dataUrl, 'PNG', (pageW - size) / 2, 20, size, size)
    doc.setFontSize(11)
    doc.text(cfg.name || 'QR Code', pageW / 2, 20 + size + 10, { align: 'center' })
    doc.save(`${name}.pdf`)
    return
  }
  if (format === 'eps') {
    const jpeg = await qrBlob(c, payload, 'jpeg')
    saveAs(makeEPS(jpeg, c.width, c.height), `${name}.eps`)
    return
  }
  if (format === 'sheet') {
    // Print sheet: the same code repeated on an A4 page with cut guides and captions.
    // Transparent designs are flattened onto white — printers have no alpha channel.
    const printable: QRConfig = c.bgMode === 'transparent' ? { ...c, bgMode: 'solid', bgColor: '#ffffff' } : c
    const png = await qrBlob(printable, payload, 'png')
    const dataUrl = await blobToDataURL(png)
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const { cells } = sheetLayout(6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(110)
    doc.text(cfg.name || 'QRForge', 12, 12)
    doc.setFontSize(7)
    doc.text('Cut along the dashed guides · 6 codes per page · generated offline by QRForge', 12, 16)

    cells.forEach((cell) => {
      doc.setDrawColor(205)
      doc.setLineDashPattern([1.6, 1.6], 0)
      doc.rect(cell.x, cell.y, cell.cellW, cell.cellH)
      doc.setLineDashPattern([], 0)
      doc.addImage(dataUrl, 'PNG', cell.qrX, cell.qrY, cell.size, cell.size)
      doc.setFontSize(7.5)
      doc.setTextColor(40)
      doc.text(cfg.name || 'Scan me', cell.labelX, cell.labelY, { align: 'center', maxWidth: cell.cellW - 10 })
      doc.setFontSize(6)
      doc.setTextColor(130)
      doc.text('scan me', cell.labelX, cell.labelY + 3.6, { align: 'center' })
    })

    doc.save(`${name}-sheet.pdf`)
    return
  }
  if (format === 'zip') {
    const zip = new JSZip()
    zip.file(`${name}.png`, await qrBlob(c, payload, 'png'))
    zip.file(`${name}.svg`, await qrBlob(c, payload, 'svg'))
    zip.file(`${name}.jpg`, await qrBlob(c, payload, 'jpeg'))
    zip.file('payload.txt', payload)
    zip.file('config.json', JSON.stringify(c, null, 2))
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${name}-package.zip`)
    return
  }
}
