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
  { path: '/email-qr-code', navLabel: 'Email' },
  { path: '/phone-qr-code', navLabel: 'Phone call' },
  { path: '/sms-qr-code', navLabel: 'SMS' },
  { path: '/text-qr-code', navLabel: 'Plain text' },
  { path: '/location-qr-code', navLabel: 'Location' },
  { path: '/event-qr-code', navLabel: 'Event' },
  { path: '/pdf-qr-code', navLabel: 'PDF link' },
  { path: '/app-download-qr-code', navLabel: 'App download' },
  { path: '/instagram-qr-code', navLabel: 'Instagram' },
  { path: '/facebook-qr-code', navLabel: 'Facebook' },
  { path: '/youtube-qr-code', navLabel: 'YouTube' },
  { path: '/telegram-qr-code', navLabel: 'Telegram' },
  { path: '/linkedin-qr-code', navLabel: 'LinkedIn' },
  { path: '/social-qr-code', navLabel: 'Social hub' },
  { path: '/static-vs-dynamic-qr-code', navLabel: 'Static vs dynamic' },
]
