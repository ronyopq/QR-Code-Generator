/**
 * SEO copy — ONE source of truth.
 *
 * Everything a crawler reads (title, description, FAQ, how-to, feature list)
 * lives here, so the static HTML shell, the JSON-LD graph and the visible page
 * can never disagree with each other. Editing this file changes all three.
 */

export const SITE = {
  /** The canonical host. Every absolute URL on the site derives from this. */
  url: 'https://qrforge-bd.vercel.app',
  name: 'QRForge',
  shortName: 'QRForge',
  /** ≤ 60 characters so Google does not truncate it. */
  title: 'QRForge — Free QR Code Generator with Logo & 20 Types',
  /** ≤ 155 characters for the SERP snippet. */
  description:
    'Free QR code generator for URL, WiFi, vCard, menu, WhatsApp and 16 more types. Add a logo, pick a preset, export PNG, SVG or PDF. No sign-up, no tracking.',
  /** 1200×630 social card. */
  ogImage: '/og.png',
  ogImageAlt: 'QRForge — free QR code generator with 20 types and 8 export formats',
  twitterHandle: '@RonySiddiqi',
  locale: 'en_US',
  themeColor: '#f7f7f4',
  repo: 'https://github.com/ronyopq/QR-Code-Generator',
} as const

/** Absolute URL helper — the site must never emit a relative canonical. */
export function absolute(path = '/'): string {
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`
}

export interface Feature {
  title: string
  body: string
}

export const FEATURES: Feature[] = [
  {
    title: '20 QR code types',
    body: 'URL, plain text, email, phone, SMS, WhatsApp, WiFi, vCard contact, location, event, social hub, Facebook, Instagram, X, LinkedIn, Telegram, YouTube, app store, crypto and payment links.',
  },
  {
    title: 'Logo, presets and gradients',
    body: 'Ten real presets — Classic, Slate, Emerald, Iris, Midnight, Paper, Neon, Terminal, Monochrome and Soft — plus custom dot styles, corner eyes and a centre logo.',
  },
  {
    title: 'Scan check before you print',
    body: 'Every design is audited for contrast ratio, module size in millimetres, quiet zone and logo coverage, so a pretty code still scans. Chrome, Edge and Android can even decode it on the spot.',
  },
  {
    title: '8 export formats',
    body: 'PNG, JPG, SVG, WEBP, PDF, EPS, a six-per-page A4 print sheet and a ZIP package that bundles the image, the raw payload and the config file.',
  },
  {
    title: 'Private by design',
    body: 'Codes are generated in your browser with WebAssembly-free JavaScript. No image, link or personal detail is ever uploaded, and no account is required.',
  },
  {
    title: 'Free and open source',
    body: 'MIT licensed and free forever, with no watermark, no scan limit and no expiry. The full source is on GitHub and the app installs as an offline PWA.',
  },
]

export interface Faq {
  q: string
  a: string
}

export const FAQ: Faq[] = [
  {
    q: 'Is QRForge really free?',
    a: 'Yes. Every type, preset, logo slot and export format is free, with no watermark, no scan limit and no account. The project is MIT licensed and the full source is on GitHub.',
  },
  {
    q: 'Do my QR codes expire?',
    a: 'No. QRForge creates static QR codes, which store the data directly inside the pattern. There is no redirect, no server and no subscription, so a code printed today still works in ten years.',
  },
  {
    q: 'Is my data uploaded anywhere?',
    a: 'No. Generation and export run entirely in your browser. Your WiFi password, phone number or vCard never leaves the device, which is why the app also works offline.',
  },
  {
    q: 'Which QR code types can I create?',
    a: 'Twenty: URL, plain text, email, phone call, SMS, WhatsApp, WiFi, vCard contact, location, event calendar, social hub, Facebook, Instagram, X, LinkedIn, Telegram, YouTube, app store link, crypto address and payment link.',
  },
  {
    q: 'What export formats are available?',
    a: 'PNG, JPG, SVG, WEBP, PDF, EPS, a six-per-page A4 print sheet for stickers, and a ZIP package containing the image, the raw payload and the JSON config.',
  },
  {
    q: 'How big should I print a QR code?',
    a: 'Keep each module at least 0.4 mm wide, which means roughly 2 × 2 cm for a short link and 3–4 cm once you add a logo. QRForge shows the module size in millimetres for your chosen print width and warns you before it gets too small.',
  },
  {
    q: 'Can I put a logo in the middle?',
    a: 'Yes. Keep the logo under 20% of the code area and switch error correction to H, which recovers up to 30% of a damaged pattern. The scan check flags anything riskier and offers a one-tap fix.',
  },
  {
    q: 'Does it work offline?',
    a: 'Yes. QRForge is a Progressive Web App: install it from the browser once and it keeps generating and exporting codes with no connection.',
  },
]

export interface HowToStep {
  name: string
  text: string
}

export const HOW_TO: { name: string; description: string; steps: HowToStep[] } = {
  name: 'How to create a QR code with a logo',
  description:
    'Create a custom QR code for a link, WiFi network, vCard or menu in four steps, then export it as PNG, SVG or a print-ready A4 sheet — free and without an account.',
  steps: [
    {
      name: 'Pick a QR code type',
      text: 'Choose one of 20 types — URL, WiFi, vCard, WhatsApp, menu, event and more — from the format rail.',
    },
    {
      name: 'Enter your content',
      text: 'Fill in the fields for that type. The code is generated live as you type, with nothing sent to a server.',
    },
    {
      name: 'Style it and check that it scans',
      text: 'Apply a preset, change the dots and eyes, add a centre logo, then read the scan check for contrast, module size and quiet zone.',
    },
    {
      name: 'Export or print',
      text: 'Download PNG, JPG, SVG, WEBP, PDF, EPS or a ZIP package, or print a six-per-page A4 sticker sheet at the right physical size.',
    },
  ],
}

/** Short, quotable summary for AI assistants and llms.txt. */
export const SUMMARY =
  'QRForge is a free, open-source, browser-only QR code generator. It supports 20 QR types (URL, text, email, phone, SMS, WhatsApp, WiFi, vCard, location, event, social hub, Facebook, Instagram, X, LinkedIn, Telegram, YouTube, app store, crypto, payment), 10 design presets, centre logos and gradients, a scan-safety audit, and 8 export formats including a print-ready A4 sheet. Nothing is uploaded, no account is needed and codes never expire.'
