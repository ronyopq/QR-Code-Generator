import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'bn'

/**
 * Two-language dictionary. English is the source of truth: every key must exist
 * there, and `t()` falls back to English (and then to the key) when a translation
 * is missing, so a half-finished locale can never blank the interface.
 */
const en = {
  'lang.toggle': 'Switch language',
  'nav.create': 'Create',
  'nav.templates': 'Templates',
  'nav.bulk': 'Bulk',
  'nav.saved': 'Saved',
  'nav.stats': 'Stats',

  'hero.titleA': 'QR codes that',
  'hero.titleB': 'look designed.',
  'hero.sub': 'Start with a clean black-and-white code, then make it yours with presets, logos and gradients — or leave it plain. Everything runs in your browser.',
  'hero.ctaTemplates': 'Start from a template',
  'hero.ctaExperiment': 'Experiment',
  'hero.stat.types': 'types',
  'hero.stat.maxOutput': 'max output',
  'hero.stat.formats': 'export formats',
  'hero.stat.uploads': 'bytes uploaded',

  'section.format': 'Pick a format',
  'section.format.hint': 'what should the code do?',
  'section.content': 'Content',
  'section.preview': 'Preview & export',
  'section.style': 'Style',
  'section.style.hint': 'optional',

  'action.save': 'Save',
  'action.copy': 'Copy',

  'panel.presets': 'Design presets',
  'panel.presets.reset': 'reset',
  'panel.presets.alreadyClassic': 'Already classic',
  'panel.presets.resetTitle': 'Reset to the plain classic look',
  'panel.presets.hint': 'Start with Classic — it scans best. Each swatch is the real render, so what you pick is what you get.',
  'panel.presets.custom': 'custom',
  'panel.presets.best': 'best',

  'preset.classic.name': 'Classic',
  'preset.classic.desc': 'Black on white — the most scannable',
  'preset.minimal.name': 'Minimal',
  'preset.minimal.desc': 'Rounded dots, transparent background',
  'preset.soft.name': 'Soft',
  'preset.soft.desc': 'Gentle extra-rounded modules',
  'preset.ocean.name': 'Ocean',
  'preset.ocean.desc': 'Cool blue gradient',
  'preset.sunset.name': 'Sunset',
  'preset.sunset.desc': 'Warm orange to pink',
  'preset.forest.name': 'Forest',
  'preset.forest.desc': 'Deep green gradient',
  'preset.midnight.name': 'Midnight',
  'preset.midnight.desc': 'White modules on black',
  'preset.gold.name': 'Gold',
  'preset.gold.desc': 'Luxury amber, cream background',
  'preset.neon.name': 'Neon',
  'preset.neon.desc': 'Cyan on deep navy',
  'preset.pastel.name': 'Pastel',
  'preset.pastel.desc': 'Two-tone indigo & pink',

  'preview.title': 'Live preview',
  'preview.live': 'live',
  'preview.emptyTitle': 'Your code will appear here',
  'preview.emptyBody': 'Add a link, WiFi details or text in step 02 — nothing else is required.',
  'preview.placeholder': '— enter content to generate —',
  'preview.unavailable': 'Preview unavailable',
  'preview.zoomIn': 'Zoom in',
  'preview.zoomOut': 'Zoom out',
  'preview.resetZoom': 'Reset zoom',
  'preview.fullscreen': 'Fullscreen preview',

  'panel.export': 'Export',
  'export.zipNote': 'ZIP bundles PNG, SVG, JPG, payload and config.',
  'export.emptyNote': 'Add content above to enable downloads.',
  'export.quality': 'quality',
  'export.done': '{fmt} exported',
  'export.failed': 'Export failed',
  'export.failedBody': 'Try PNG or SVG — the renderer hit an error.',
  'export.disabled': 'Add content first',

  'scan.title': 'Scan check',
  'scan.ready': 'Ready to print',
  'scan.fail': 'Will probably fail to scan',
  'scan.warnOne': '1 thing to check',
  'scan.warnMany': '{n} things to check',
  'scan.contrast': 'contrast',
  'scan.modules': 'modules',
  'scan.moduleSize': 'module size',
  'scan.quiet': 'quiet zone',
  'scan.printWidth': 'print width',
  'scan.min': 'min {mm}mm',
  'scan.good': 'good',
  'scan.low': 'low',
  'scan.printable': 'printable',
  'scan.small': 'small',
  'scan.ok': 'ok',
  'scan.tight': 'tight',
  'scan.test': 'Test this code',
  'scan.testOk': 'decoded — matches your content',
  'scan.noCode': 'no code found',
  'scan.mismatch': 'decoded different content',
  'scan.decodeFailed': 'decode failed',
  'scan.unsupported': 'Decode test needs Chrome, Edge or Android (BarcodeDetector). The checks above still apply.',

  'issue.contrast.error.title': 'Almost no contrast',
  'issue.contrast.error.detail': 'Modules and background differ by only {ratio}:1. Cameras need at least 3:1, ideally 7:1.',
  'issue.contrast.warn.title': 'Low contrast',
  'issue.contrast.warn.detail': '{ratio}:1 — above the floor but dim. Darker modules or a lighter background scan faster.',
  'issue.quiet.title': 'Quiet zone too small',
  'issue.quiet.detail': 'Margin is {modules} modules. The spec asks for 4 so scanners can find the code; leave white space around it when you print.',
  'issue.module-size.error.title': 'Modules too small to print',
  'issue.module-size.error.detail': 'At {mm} mm each module is {moduleMm} mm. Print at least {min} mm wide, or shorten the content.',
  'issue.module-size.warn.title': 'Small modules',
  'issue.module-size.warn.detail': 'Each module is {moduleMm} mm at {mm} mm. Below 0.4 mm home printers blur the edges.',
  'issue.logo.ec.title': 'Logo vs. error correction',
  'issue.logo.ec.detail': 'A {size}% logo covers part of the code; error correction is {ec}. Use H for 30% recovery.',
  'issue.logo.size.title': 'Logo is very large',
  'issue.logo.size.detail': 'A logo covering {size}% of the code risks unreadable modules even at H.',
  'issue.inverted.title': 'Light modules on a dark background',
  'issue.inverted.detail': 'Many older scanners only read dark-on-light. Works on modern phones — test before printing.',
  'issue.density.title': 'Rendering is cramped',
  'issue.density.detail': 'Only {px}px per module at {width}px. Raise the export size or shorten the content.',

  'toast.preset.title': '{name} applied',
  'toast.preset.desc': 'Your content stays the same — only the look changed.',
  'toast.reset.title': 'Back to classic',
  'toast.reset.desc': 'Clean black on white, maximum compatibility.',
  'footer.free': 'Free forever · MIT · no backend',
  'footer.builtWith': 'built with free software',
  'footer.bookmark': 'bookmark',
  'footer.credits': 'credits',
  'footer.source': 'source',
  'footer.stats': '{saved} saved locally · {types} types · {formats} formats · v{version}',

  'fix.whiteBackground': 'Use a white background',
  'fix.resetBlack': 'Reset to black on white',
  'fix.darken': 'Darken the modules',
  'fix.margin': 'Set margin to {px}px',
  'fix.suggestSize': 'Suggest {mm} mm',
  'fix.useH': 'Use error correction H',
  'fix.shrinkLogo': 'Shrink logo to 30%',
  'fix.invert': 'Invert to dark on light',
  'fix.export1024': 'Export at 1024px',
} as const

export type TranslationKey = keyof typeof en

const bn: Record<TranslationKey, string> = {
  'lang.toggle': 'ভাষা বদলান',
  'nav.create': 'তৈরি',
  'nav.templates': 'টেমপ্লেট',
  'nav.bulk': 'বাল্ক',
  'nav.saved': 'সংরক্ষিত',
  'nav.stats': 'পরিসংখ্যান',

  'hero.titleA': 'QR কোড, যেন',
  'hero.titleB': 'ডিজাইন করা।',
  'hero.sub': 'শুরু করুন পরিষ্কার সাদা-কালো কোড দিয়ে, তারপর প্রিসেট, লোগো আর গ্রেডিয়েন্ট দিয়ে নিজের মতো সাজান — না চাইলে সাদাই রাখুন। সবকিছু চলে আপনার ব্রাউজারেই।',
  'hero.ctaTemplates': 'টেমপ্লেট থেকে শুরু',
  'hero.ctaExperiment': 'একটু পরীক্ষা',
  'hero.stat.types': 'ধরন',
  'hero.stat.maxOutput': 'সর্বোচ্চ আউটপুট',
  'hero.stat.formats': 'এক্সপোর্ট ফরম্যাট',
  'hero.stat.uploads': 'আপলোড হওয়া বাইট',

  'section.format': 'একটি ধরন বাছুন',
  'section.format.hint': 'কোডটি কী কাজ করবে?',
  'section.content': 'বিষয়বস্তু',
  'section.preview': 'প্রিভিউ ও এক্সপোর্ট',
  'section.style': 'স্টাইল',
  'section.style.hint': 'ঐচ্ছিক',

  'action.save': 'সংরক্ষণ',
  'action.copy': 'কপি',

  'panel.presets': 'ডিজাইন প্রিসেট',
  'panel.presets.reset': 'রিসেট',
  'panel.presets.alreadyClassic': 'আগেই ক্লাসিক',
  'panel.presets.resetTitle': 'সাদামাটা ক্লাসিক লুকে ফিরে যান',
  'panel.presets.hint': 'Classic দিয়ে শুরু করুন — সবচেয়ে ভালো স্ক্যান হয়। প্রতিটি চিপ আসল রেন্ডার, তাই যা দেখছেন সেটাই পাবেন।',
  'panel.presets.custom': 'কাস্টম',
  'panel.presets.best': 'সেরা',

  'preset.classic.name': 'ক্লাসিক',
  'preset.classic.desc': 'সাদার ওপর কালো — সবচেয়ে সহজে স্ক্যান হয়',
  'preset.minimal.name': 'মিনিমাল',
  'preset.minimal.desc': 'গোলাকার ডট, ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড',
  'preset.soft.name': 'সফট',
  'preset.soft.desc': 'নরম এক্সট্রা-রাউন্ডেড মডিউল',
  'preset.ocean.name': 'ওশান',
  'preset.ocean.desc': 'শীতল নীল গ্রেডিয়েন্ট',
  'preset.sunset.name': 'সানসেট',
  'preset.sunset.desc': 'কমলা থেকে গোলাপি',
  'preset.forest.name': 'ফরেস্ট',
  'preset.forest.desc': 'গাঢ় সবুজ গ্রেডিয়েন্ট',
  'preset.midnight.name': 'মিডনাইট',
  'preset.midnight.desc': 'কালোর ওপর সাদা মডিউল',
  'preset.gold.name': 'গোল্ড',
  'preset.gold.desc': 'অ্যাম্বার, ক্রিম ব্যাকগ্রাউন্ড',
  'preset.neon.name': 'নিয়ন',
  'preset.neon.desc': 'গাঢ় নেভির ওপর সায়ান',
  'preset.pastel.name': 'প্যাস্টেল',
  'preset.pastel.desc': 'ইন্ডিগো ও গোলাপি দুই রঙ',

  'preview.title': 'লাইভ প্রিভিউ',
  'preview.live': 'লাইভ',
  'preview.emptyTitle': 'আপনার কোড এখানে দেখা যাবে',
  'preview.emptyBody': 'ধাপ ০২-এ লিংক, ওয়াইফাই তথ্য বা টেক্সট দিন — আর কিছু লাগবে না।',
  'preview.placeholder': '— তৈরি করতে কনটেন্ট দিন —',
  'preview.unavailable': 'প্রিভিউ পাওয়া যাচ্ছে না',
  'preview.zoomIn': 'জুম ইন',
  'preview.zoomOut': 'জুম আউট',
  'preview.resetZoom': 'জুম রিসেট',
  'preview.fullscreen': 'ফুলস্ক্রিন প্রিভিউ',

  'panel.export': 'এক্সপোর্ট',
  'export.zipNote': 'ZIP-এ থাকবে PNG, SVG, JPG, পেলোড ও কনফিগ।',
  'export.emptyNote': 'ডাউনলোড চালু করতে উপরে বিষয়বস্তু দিন।',
  'export.quality': 'গুণমান',
  'export.done': '{fmt} এক্সপোর্ট হয়েছে',
  'export.failed': 'এক্সপোর্ট ব্যর্থ',
  'export.failedBody': 'PNG বা SVG দিয়ে দেখুন — রেন্ডারারে সমস্যা হয়েছে।',
  'export.disabled': 'আগে বিষয়বস্তু দিন',

  'scan.title': 'স্ক্যান যাচাই',
  'scan.ready': 'ছাপার জন্য প্রস্তুত',
  'scan.fail': 'সম্ভবত স্ক্যান হবে না',
  'scan.warnOne': '১টি বিষয় দেখুন',
  'scan.warnMany': '{n}টি বিষয় দেখুন',
  'scan.contrast': 'কনট্রাস্ট',
  'scan.modules': 'মডিউল',
  'scan.moduleSize': 'মডিউল সাইজ',
  'scan.quiet': 'কোয়ায়েট জোন',
  'scan.printWidth': 'প্রিন্ট প্রস্থ',
  'scan.min': 'সর্বনিম্ন {mm}mm',
  'scan.good': 'ভালো',
  'scan.low': 'কম',
  'scan.printable': 'ছাপার উপযোগী',
  'scan.small': 'ছোট',
  'scan.ok': 'ঠিক',
  'scan.tight': 'টান',
  'scan.test': 'কোডটি পরীক্ষা করুন',
  'scan.testOk': 'ডিকোড হয়েছে — কনটেন্ট মিলেছে',
  'scan.noCode': 'কোনো কোড পাওয়া যায়নি',
  'scan.mismatch': 'ভিন্ন কনটেন্ট ডিকোড হয়েছে',
  'scan.decodeFailed': 'ডিকোড ব্যর্থ',
  'scan.unsupported': 'ডিকোড টেস্টের জন্য Chrome, Edge বা Android দরকার (BarcodeDetector)। উপরের যাচাইগুলো তবুও প্রযোজ্য।',

  'issue.contrast.error.title': 'প্রায় কোনো কনট্রাস্ট নেই',
  'issue.contrast.error.detail': 'মডিউল ও ব্যাকগ্রাউন্ডের পার্থক্য মাত্র {ratio}:1। ক্যামেরার জন্য অন্তত ৩:১, আদর্শ ৭:১ দরকার।',
  'issue.contrast.warn.title': 'কনট্রাস্ট কম',
  'issue.contrast.warn.detail': '{ratio}:1 — সীমার ওপরে, তবে ম্লান। গাঢ় মডিউল বা হালকা ব্যাকগ্রাউন্ড দ্রুত স্ক্যান হয়।',
  'issue.quiet.title': 'কোয়ায়েট জোন ছোট',
  'issue.quiet.detail': 'মার্জিন {modules} মডিউল। স্পেক অনুযায়ী ৪ দরকার; ছাপার সময় চারপাশে সাদা জায়গা রাখুন।',
  'issue.module-size.error.title': 'মডিউল ছাপার জন্য খুব ছোট',
  'issue.module-size.error.detail': '{mm} মিমি-তে প্রতিটি মডিউল {moduleMm} মিমি। অন্তত {min} মিমি চওড়ায় ছাপুন, বা কনটেন্ট ছোট করুন।',
  'issue.module-size.warn.title': 'মডিউল ছোট',
  'issue.module-size.warn.detail': '{mm} মিমি-তে প্রতিটি মডিউল {moduleMm} মিমি। ০.৪ মিমির নিচে হোম প্রিন্টারে কিনারা ঘোলা হয়।',
  'issue.logo.ec.title': 'লোগো ও error correction',
  'issue.logo.ec.detail': '{size}% লোগো কোডের অংশ ঢাকে; error correction {ec}। ৩০% রিকভারির জন্য H ব্যবহার করুন।',
  'issue.logo.size.title': 'লোগো বেশ বড়',
  'issue.logo.size.detail': '{size}% লোগো H-তেও মডিউল পড়া কঠিন করে তুলতে পারে।',
  'issue.inverted.title': 'গাঢ় ব্যাকগ্রাউন্ডে হালকা মডিউল',
  'issue.inverted.detail': 'পুরনো অনেক স্ক্যানার শুধু কালো-সাদা পড়ে। আধুনিক ফোনে কাজ করে — ছাপার আগে পরীক্ষা করুন।',
  'issue.density.title': 'রেন্ডার খুব ঘন',
  'issue.density.detail': '{width}px-এ প্রতি মডিউল মাত্র {px}px। এক্সপোর্ট সাইজ বাড়ান বা কনটেন্ট ছোট করুন।',

  'toast.preset.title': '{name} বসানো হয়েছে',
  'toast.preset.desc': 'কনটেন্ট অপরিবর্তিত — শুধু চেহারা বদলেছে।',
  'toast.reset.title': 'আবার ক্লাসিকে',
  'toast.reset.desc': 'সাদার ওপর কালো, সর্বোচ্চ সামঞ্জস্য।',
  'footer.free': 'সবসময় ফ্রি · MIT · কোনো ব্যাকএন্ড নেই',
  'footer.builtWith': 'ফ্রি সফটওয়্যার দিয়ে তৈরি',
  'footer.bookmark': 'বুকমার্ক',
  'footer.credits': 'ক্রেডিট',
  'footer.source': 'সোর্স',
  'footer.stats': '{saved}টি লোকাল সেভ · {types} ধরন · {formats} ফরম্যাট · v{version}',

  'fix.whiteBackground': 'সাদা ব্যাকগ্রাউন্ড দিন',
  'fix.resetBlack': 'কালো-সাদায় ফিরুন',
  'fix.darken': 'মডিউল গাঢ় করুন',
  'fix.margin': 'মার্জিন {px}px করুন',
  'fix.suggestSize': '{mm} মিমি প্রস্তাব',
  'fix.useH': 'error correction H করুন',
  'fix.shrinkLogo': 'লোগো ৩০%-এ নামান',
  'fix.invert': 'কালো-সাদায় উল্টে দিন',
  'fix.export1024': '১০২৪px-এ এক্সপোর্ট',
}

export const DICTS = { en, bn }

type Vars = Record<string, string | number>

function fill(template: string, vars?: Vars) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

export function translate(lang: Lang, key: TranslationKey, vars?: Vars): string {
  const table = DICTS[lang] as Record<string, string>
  const value = table[key] ?? (en as Record<string, string>)[key] ?? key
  return fill(value, vars)
}

interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  t: (key: TranslationKey, vars?: Vars) => string
}

const I18nContext = createContext<I18nValue | null>(null)
const LANG_KEY = 'qrforge-lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'en' || saved === 'bn') return saved
  } catch { /* private mode */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : ''
  return nav.toLowerCase().startsWith('bn') ? 'bn' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem(LANG_KEY, lang) } catch { /* private mode */ }
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const toggle = useCallback(() => setLangState((l) => (l === 'en' ? 'bn' : 'en')), [])
  const t = useCallback((key: TranslationKey, vars?: Vars) => translate(lang, key, vars), [lang])

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
