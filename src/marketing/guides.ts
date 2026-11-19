/**
 * Link list for the in-app "Guides by type" row.
 *
 * Deliberately just path + label: importing `routes.ts` here would pull every
 * landing page's copy into the app bundle (and grow with every new page). The
 * static shell still renders the full descriptions at build time. A test keeps
 * this list in sync with `LANDING_ROUTES`.
 */
export const GUIDES: { path: string; navLabel: string }[] = [
  { path: '/wifi-qr-code', navLabel: 'WiFi QR code' },
  { path: '/vcard-qr-code', navLabel: 'vCard / contact' },
  { path: '/menu-qr-code', navLabel: 'Restaurant menu' },
  { path: '/whatsapp-qr-code', navLabel: 'WhatsApp chat' },
  { path: '/url-qr-code', navLabel: 'URL / website' },
]
