/** Everything the developer showcase shows. One place to edit. */

export type SocialId = 'facebook' | 'whatsapp' | 'telegram' | 'linkedin' | 'x' | 'blogger' | 'wordpress'

export interface SocialLink {
  id: SocialId
  label: string
  handle: string
  url: string
  hint: string
  /** brand colour, used only for the icon chip and the hover ring */
  color: string
}

export const DEVELOPER = {
  name: 'Rony Siddiqi',
  handle: '@RonySiddiqi',
  initials: 'RS',
  role: 'Full-Stack Web & App Architect',
  bio: 'Designs and ships fast, private, offline-capable products — from the data layer up to the pixel. Every screen in QRForge was built on the same rule: no tracking, no backend, no compromises on how it feels.',
  location: 'Chattogram, Bangladesh',
  availability: 'Open to new projects',
  /** digits only, with country code, no “+”. Empty → WhatsApp opens with the
   *  prefilled support text and lets you pick the chat. */
  whatsappNumber: '',
  focus: ['System architecture', 'Security & performance', 'Offline-first UX'],
  skills: [
    'React', 'TypeScript', 'Next.js', 'Node.js', 'Supabase', 'PostgreSQL',
    'Tailwind CSS', 'Vite', 'PWA', 'Framer Motion', 'REST & RPC APIs', 'Design systems',
  ],
  socials: [
    {
      id: 'facebook', label: 'Facebook', handle: '@RonySiddiqi',
      url: 'https://facebook.com/RonySiddiqi', hint: 'Visit profile', color: '#1877F2',
    },
    {
      id: 'whatsapp', label: 'WhatsApp', handle: '@RonySiddiqi',
      url: 'https://wa.me/', hint: 'Send a message', color: '#25D366',
    },
    {
      id: 'telegram', label: 'Telegram', handle: '@RonySiddiqi',
      url: 'https://t.me/RonySiddiqi', hint: 'Open chat', color: '#229ED9',
    },
    {
      id: 'linkedin', label: 'LinkedIn', handle: '@RonySiddiqi',
      url: 'https://linkedin.com/in/RonySiddiqi', hint: 'Professional profile', color: '#0A66C2',
    },
    {
      id: 'x', label: 'X', handle: '@RonySiddiqi',
      url: 'https://x.com/RonySiddiqi', hint: 'Visit profile', color: '#0F1419',
    },
    {
      id: 'blogger', label: 'Blogger', handle: 'ronysiddiqi.blogspot.com',
      url: 'https://ronysiddiqi.blogspot.com', hint: 'Tech blog & tutorials', color: '#F57C00',
    },
    {
      id: 'wordpress', label: 'WordPress', handle: 'ronysiddiqi.wordpress.com',
      url: 'https://ronysiddiqi.wordpress.com', hint: 'Portfolio & articles', color: '#21759B',
    },
  ] as SocialLink[],
  site: 'https://qrforge-gamma-five.vercel.app',
}

/** vCard 3.0 — scanning this saves the contact straight into the phone. */
export function buildVCard(): string {
  const esc = (v: string) => v.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:Siddiqi;Rony;;;`,
    `FN:${esc(DEVELOPER.name)}`,
    `NICKNAME:${esc(DEVELOPER.handle.replace('@', ''))}`,
    `TITLE:${esc(DEVELOPER.role)}`,
    'ORG:QRForge',
    `URL:${DEVELOPER.site}`,
    `X-SOCIALPROFILE;TYPE=facebook:https://facebook.com/RonySiddiqi`,
    `X-SOCIALPROFILE;TYPE=twitter:https://x.com/RonySiddiqi`,
    `X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/RonySiddiqi`,
    `X-SOCIALPROFILE;TYPE=telegram:https://t.me/RonySiddiqi`,
    `ADR;TYPE=HOME:;;${esc(DEVELOPER.location)};;;;`,
    `NOTE:${esc('Full-stack architect behind QRForge.')}`,
    'END:VCARD',
  ]
  return lines.join('\r\n')
}

/** Browser / device fingerprint used for the WhatsApp support hand-off. */
export function collectDeviceInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const pick = (re: RegExp, fallback: string) => (ua.match(re)?.[1] ?? fallback)
  const browser = /Edg\//.test(ua) ? `Edge ${pick(/Edg\/([\d.]+)/, '')}`
    : /OPR\//.test(ua) ? `Opera ${pick(/OPR\/([\d.]+)/, '')}`
      : /Firefox\//.test(ua) ? `Firefox ${pick(/Firefox\/([\d.]+)/, '')}`
        : /Chrome\//.test(ua) ? `Chrome ${pick(/Chrome\/([\d.]+)/, '')}`
          : /Safari\//.test(ua) ? `Safari ${pick(/Version\/([\d.]+)/, '')}`
            : 'Unknown browser'
  const os = /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
      : /Windows/.test(ua) ? 'Windows'
        : /Mac OS X/.test(ua) ? 'macOS'
          : /Linux/.test(ua) ? 'Linux' : 'Unknown OS'
  const standalone = typeof matchMedia !== 'undefined' && matchMedia('(display-mode: standalone)').matches
  return {
    browser,
    os,
    device: standalone ? 'installed PWA' : /Mobi|Android/i.test(ua) ? 'mobile browser' : 'desktop browser',
    screen: typeof window !== 'undefined' ? `${window.screen.width}×${window.screen.height} @${window.devicePixelRatio || 1}x` : '—',
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : '—',
    language: typeof navigator !== 'undefined' ? navigator.language : '—',
    timezone: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return '—' } })(),
    theme: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    url: typeof location !== 'undefined' ? location.href : '—',
  }
}

export function buildSupportMessage(): string {
  const d = collectDeviceInfo()
  return [
    'Hi Rony! I am using QRForge and need a hand.',
    '',
    `• App: QRForge v${__APP_VERSION__} (${d.theme} theme)`,
    `• Device: ${d.os} · ${d.device}`,
    `• Browser: ${d.browser}`,
    `• Screen: ${d.screen} (viewport ${d.viewport})`,
    `• Language: ${d.language} · ${d.timezone}`,
    `• Page: ${d.url}`,
    '',
    'What I need help with:',
  ].join('\n')
}

export function whatsappSupportUrl(): string {
  const text = encodeURIComponent(buildSupportMessage())
  const n = DEVELOPER.whatsappNumber.replace(/\D/g, '')
  return n ? `https://wa.me/${n}?text=${text}` : `https://wa.me/?text=${text}`
}
